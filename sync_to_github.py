#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把本地目录发布到 GitHub（不需要安装 git）。

做法：用 GitHub REST API 的 Contents 接口建仓库 + 逐个上传文件。
首次推送完成后，你随时可以 `git clone` 下来，那就是一个标准 git 仓库。

用法：
    set GITHUB_TOKEN=ghp_xxxxxxxx
    python push_to_github.py --repo 我的仓库名 [--owner 用户名] [--private] [--dry-run]

首次提交会复用本目录已有的 commit message；如需自定义见 --message。
"""
import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.github.com"
UA = "publish-script/1.0"

# 不纳入版本控制的路径（相对仓库根，用 / 分隔）
EXCLUDE_DIRS = {".git"}
EXCLUDE_FILES = {".DS_Store", "Thumbs.db", "desktop.ini", "MinGit.zip"}
EXCLUDE_EXT = {".log", ".tmp", ".bak", ".orig", ".swp", ".pyc"}


def api(method, path, token, body=None, timeout=60):
    """调用 GitHub API，返回 (status, json)。"""
    url = path if path.startswith("http") else API + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "Bearer " + token)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", UA)
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            payload = json.loads(raw)
        except Exception:
            payload = {"raw": raw.decode("utf-8", "replace")[:400]}
        return e.code, payload
    except Exception as e:
        return 0, {"error": f"{type(e).__name__}: {e}"}


def collect_files(root):
    """收集要上传的文件，返回 [(相对路径, 绝对路径, 大小)]。"""
    out = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fn in filenames:
            if fn in EXCLUDE_FILES:
                continue
            if os.path.splitext(fn)[1].lower() in EXCLUDE_EXT:
                continue
            abs_p = os.path.join(dirpath, fn)
            rel = os.path.relpath(abs_p, root).replace("\\", "/")
            # 跳过脚本自身所在的 work 目录之类（本脚本按设计在仓库之外）
            out.append((rel, abs_p, os.path.getsize(abs_p)))
    out.sort(key=lambda t: t[0])
    return out


def put_file(owner, repo, rel, content_b64, token, message, branch, tries=5):
    """上传或覆盖一个文件（带冲突与网络重试）。

    需要重试的两种情况：
      1) Contents API 在「文件已存在」时会拒绝不带 sha 的写入
         （HTTP 422 "sha wasn't supplied"）；带上 sha 后若文件又被改过，
         会返回 409 Conflict（sha 过期）。所以每轮都重新取最新 sha。
      2) 这台机器到 GitHub 的连接会随机超时（实测约每 30 个文件丢 1 个），
         所以网络异常也必须重试。
    """
    path = "/repos/{}/{}/contents/{}".format(owner, repo, urllib.parse.quote(rel))
    st, res = 0, {}
    for attempt in range(tries):
        body = {"message": message, "content": content_b64, "branch": branch}
        st_cur, cur = api("GET", path, token)
        if st_cur == 200 and isinstance(cur, dict) and "sha" in cur:
            body["sha"] = cur["sha"]
        st, res = api("PUT", path, token, body)
        if st in (200, 201):
            return True, st, res
        # 冲突（sha 过期）与网络异常都退避重试；其它错误直接返回
        if st in (409, 422) or st == 0:
            time.sleep(0.4 * (attempt + 1))
            continue
        return False, st, res
    return False, st, res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=os.path.dirname(os.path.abspath(__file__)))
    ap.add_argument("--repo", required=True, help="仓库名，例如 spring-festival-tree-fx")
    ap.add_argument("--owner", default=None, help="仓库归属用户/组织，默认取 token 对应账号")
    ap.add_argument("--private", action="store_true", help="创建为私有仓库")
    ap.add_argument("--description", default="2026 春节树 · 加了深空特效层与性能优化")
    ap.add_argument("--branch", default="main")
    ap.add_argument("--message", default="Add deep-space effects layer and performance optimizations")
    ap.add_argument("--dry-run", action="store_true", help="只列出将要上传的文件，不实际调用 API")
    args = ap.parse_args()

    root = os.path.abspath(args.dir)
    if not os.path.isdir(root):
        sys.exit(f"目录不存在: {root}")

    files = collect_files(root)
    total = sum(f[2] for f in files)
    print(f"待上传: {len(files)} 个文件，合计 {total/1048576:.2f} MB")
    for rel, _, sz in files[:5]:
        print(f"  {sz/1024:8.1f} KB  {rel}")
    if len(files) > 5:
        print(f"  … 其余 {len(files)-5} 个")

    if args.dry_run:
        print("\n[dry-run] 未调用任何 API。")
        return

    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        sys.exit("\n缺少凭据：请先设置环境变量 GITHUB_TOKEN（需要 repo 权限）")

    # 1) 确认身份 + 确定 owner
    st, me = api("GET", "/user", token)
    if st != 200:
        sys.exit(f"凭据无效或网络异常（HTTP {st}）：{me}")
    owner = args.owner or me["login"]
    print(f"\n账号: {me['login']}  →  目标仓库: {owner}/{args.repo}")

    # 2) 建仓库（已存在则沿用）
    st, res = api("POST", "/user/repos", token, {
        "name": args.repo,
        "description": args.description,
        "private": bool(args.private),
        "auto_init": False,
    })
    if st == 201:
        print("已创建仓库")
    elif st == 422:
        print("仓库已存在，继续向其中提交")
    else:
        sys.exit(f"创建仓库失败（HTTP {st}）：{res}")

    # 3) 逐个上传文件（Contents API 会自动创建首个 commit）
    ok = 0
    fail = []
    for i, (rel, abs_p, sz) in enumerate(files, 1):
        with open(abs_p, "rb") as fh:
            content = base64.b64encode(fh.read()).decode("ascii")
        good, st, res = put_file(owner, args.repo, rel, content, token,
                                 args.message, args.branch)
        if good:
            ok += 1
            if i % 10 == 0 or i == len(files):
                print(f"  已上传 {i}/{len(files)}")
        else:
            fail.append((rel, st, str(res)[:160]))
        time.sleep(0.05)  # 轻微限速，避免触发滥用检测

    print(f"\n完成: 成功 {ok}/{len(files)}")
    if fail:
        print("失败清单:")
        for rel, st, msg in fail:
            print(f"  [{st}] {rel}  {msg}")

    vis = "私有" if args.private else "公开"
    print(f"\n仓库地址: https://github.com/{owner}/{args.repo}  （{vis}）")
    print("之后可以正常 clone：")
    print(f"  git clone https://github.com/{owner}/{args.repo}.git")


if __name__ == "__main__":
    main()
