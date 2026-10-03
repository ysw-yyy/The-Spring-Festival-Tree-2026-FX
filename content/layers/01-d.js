// layers.js:24
addLayer('d', {
  infoboxes: {
    introBox: {
      title: '距离 _ Distance',
      body() {
        return '承载着家的呼唤…<br>在本层中，你将基于进度解锁新的剧情和层级，并可以查看实时距离（当然，这只是一个数值，暂时没有实际用途）';
      },
    },
  },
  name: 'Distance',
  symbol: 'D',
  position: 0,
  startData() {
    return {
      unlocked: true,
      distance: n(308),
      _migrated24to31: false, // 迁移标志
      distanceLY: n(1),
      distanceAU: n(63240),
      distanceKM: n(9.46e12),
    };
  },
  color: '#f0f8ff',
  type: 'none',
  row: 'side',
  layerShown() {
    return true;
  },
  tooltip: '距离',
  update(diff) {},
  distance() {
    let distance = n(308);
    let start = n(308);
    let end = n(308);
    let progress = n(0);
    let stage = player.d.upgrades.length;
    let unit = '光年';
    if (stage == 0) {
    }
    if (stage == 1) {
      start = n(308);
      end = n(280);
      progress = player.points.add(1).log(2).div(10);
    }
    if (stage == 2) {
      start = n(280);
      end = n(240);
      progress = player.a.points.add(1).log(10).div(15).pow(1.5);
    }
    if (stage == 3) {
      start = n(240);
      end = n(200);
      progress = player.p.energy.add(1).log(10).div(15).pow(0.6).add(player.p.points.mul(0.1).sub(0.1)).max(0);
    }
    if (stage == 4) {
      start = n(200);
      end = n(160);
      progress = player.P.computility.add(1).log(10).div(12).pow(1.2);
    }
    if (stage == 5) {
      start = n(160);
      end = n(120);
      progress = player.y.points.add(1).log(10).div(140).pow(1.2);
    }
    if (stage == 6) {
      start = n(120);
      end = n(80);
      progress = player.n.resets.div(150).pow(0.8);
    }
    if (stage == 7) {
      start = n(80);
      end = n(30);
      progress = gba('n', 11)
        .add(gba('n', 12))
        .add(gba('n', 13).add(gba('n', 14)))
        .sub(45)
        .max(0)
        .div(15)
        .pow(0.8);
    }
    if (stage == 8) {
      start = n(30);
      end = n(10);
      progress = player.w.points.add(1).log(10).div(45).pow(0.8);
    }
    if (stage == 9) {
      start = n(10);
      end = n(1);
      progress = player.Y.points.add(1).log(10).div(37).pow(0.8);
    }
    progress = progress.min(1);
    distance = start.mul(n(1).sub(progress)).add(end.mul(progress));
    if (stage == 10) {
      distance = tmp.E.distance[0];
      unit = tmp.E.unit;
    }
    if (stage == 11) {
      distance = player.At.distance;
      unit = tmp.E.unit;
    }
    //确保距离在对应的阶段处于对应的范围，且随着资源的增长而不断减少
    return [distance, unit, progress]; //progress仅用作测试
  },
  tabFormat: {
    距离: {
      content: [
        ['infobox', 'introBox'],
        [
          'display-text',
          function () {
            let a = player.d.distance;
            if (a.lt(0.01)) {
              a = a.mul(63240);
              if (a.lt(0.06324)) a = a.mul(1.5e8);
            }
            return `归乡的路程，还有 <h2 style='color:#f0f8ff; '>${format(a, 4)} ${player.d.unit}</h2>`;
          },
        ],
        'blank',
        'upgrades',
      ],
    },
    剧情表: {
      content: [['infobox', 'introBox'], 'milestones'],
    },
  },
  update(diff) {
    if (!player.d._migrated24to31) {
      // 检查是否拥有升级24
      if (player.d.upgrades.includes(24)) {
        // 删除24
        player.d.upgrades = player.d.upgrades.filter((id) => id !== 24);
        // 添加31（如果尚未拥有）
        if (!player.d.upgrades.includes(31)) {
          player.d.upgrades.push(31);
        }
      }
      // 标记为已迁移，防止重复执行
      player.d._migrated24to31 = true;
    }
    player.d.distance = player.d.distance.min(tmp.d.distance[0]);
    player.d.unit = tmp.d.distance[1];
  },
  upgrades: {
    11: {
      title: '第一次跳跃',
      description: '解锁“希望 (Hope)”',
      cost: n(0),
      currencyDisplayName: '航迹',
      currencyInternalName: 'points',
    },
    12: {
      title: '第二次跳跃',
      description: '解锁“反物质 (Antimatter)”',
      cost: n(1000),
      unlocked() {
        return hu('d', 11);
      },
      currencyDisplayName: '航迹',
      currencyInternalName: 'points',
    },
    13: {
      title: '第三次跳跃',
      description: '解锁“聚变核心 (Power)”',
      cost: n(1e15),
      unlocked() {
        return hu('d', 12);
      },
      currencyDisplayName: '反物质',
      currencyInternalName: 'points',
      currencyLayer: 'a',
    },
    14: {
      title: '第四次跳跃',
      description: '解锁“处理器 (Processor)”<br>(不消耗聚变核心)',
      cost: n(5),
      onPurchase() {
        player.p.points = n(5);
      },
      unlocked() {
        return hu('d', 13);
      },
      currencyDisplayName: '聚变核心',
      currencyInternalName: 'points',
      currencyLayer: 'p',
    },
    15: {
      title: '第五次跳跃',
      description: '解锁“思念 (Yearning)”<br>(不消耗聚变核心)',
      cost: n(8),
      onPurchase() {
        player.p.points = n(8);
      },
      unlocked() {
        return hu('d', 14);
      },
      currencyDisplayName: '聚变核心',
      currencyInternalName: 'points',
      currencyLayer: 'p',
    },
    21: {
      title: '第六次跳跃',
      description: '解锁“中子素 (Neutronium)”<br>(不消耗聚变核心)',
      cost: n(13),
      onPurchase() {
        player.p.points = n(13);
      },
      unlocked() {
        return hm('p', 11);
      },
      currencyDisplayName: '聚变核心',
      currencyInternalName: 'points',
      currencyLayer: 'p',
    },
    22: {
      title: '第七次跳跃',
      description: '解锁“熵 (Entropy)”<br>(你可以重置中子树恢复中子定理)',
      cost: n(45),
      unlocked() {
        return hm('n', 15);
      },
      currencyDisplayName: '中子定理',
      currencyInternalName: 'theorems',
      currencyLayer: 'n',
    },
    23: {
      title: '第八次跳跃',
      description: '解锁“温暖 (Warmth)”<br>(你可以重置中子树恢复中子定理)<br>',
      cost: n(60),
      unlocked() {
        return hm('n', 18);
      },
      currencyDisplayName: '中子定理',
      currencyInternalName: 'theorems',
      currencyLayer: 'n',
    },
    31: {
      title: '第九次跳跃',
      description: '解锁“产量 (Yield)”<br>(你可以重置中子树恢复中子定理)',
      cost: n(450),
      unlocked() {
        return hu('w', 55);
      },
      currencyDisplayName: '中子定理',
      currencyInternalName: 'theorems',
      currencyLayer: 'n',
    },
    32: {
      title: '第十次跳跃',
      description: '解锁“经验 (Experience)”<br>(你可以重置中子树恢复中子定理)',
      cost: n(52600),
      unlocked() {
        return hu('Y', 25);
      },
      currencyDisplayName: '中子定理',
      currencyInternalName: 'theorems',
      currencyLayer: 'n',
    },
    33: {
      title: '第十一次跳跃',
      description: '解锁”大气 (Atmosphere)”',
      cost: n('ee250'),
      unlocked() {
        return player.E.buyables[11].gte(10);
      },
      currencyDisplayName: '经验',
      currencyInternalName: 'points',
      currencyLayer: 'E',
    },
  },
  milestones: {
    0: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hu('d', 11);
      },
      effectDescription: '要求:进行第一次跳跃<br>解锁“启航于宇宙归途(Embarkation) I”',
    },
    1: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hu('h', 11);
      },
      effectDescription: '要求:获得第1个希望升级“开始航行”<br>解锁“启航于宇宙归途(Embarkation) II”',
    },
    2: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hu('h', 15);
      },
      effectDescription: '要求:获得第5个希望升级“进阶升级”<br>解锁“启航于宇宙归途(Embarkation) III”',
    },
    3: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hu('a', 11);
      },
      unlocked() {
        return hm('d', 0);
      },
      effectDescription: '要求:获得第1个反物质升级“充能模式”<br>解锁“虫洞于时空转移(Transfer) I”',
    },
    4: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hu('a', 15);
      },
      unlocked() {
        return hm('d', 1);
      },
      effectDescription: '要求:获得第5个反物质升级“循环加成”<br>解锁“虫洞于时空转移(Transfer) II”',
    },
    5: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hu('h', 25);
      },
      unlocked() {
        return hm('d', 2);
      },
      effectDescription: '要求:获得第10个希望升级“持续进展”<br>解锁“虫洞于时空转移(Transfer) III”',
    },
    6: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hu('a', 25);
      },
      unlocked() {
        return hm('d', 3);
      },
      effectDescription: '要求:获得第10个反物质升级“再启新篇”<br>解锁“虫洞于时空转移(Transfer) IV”',
    },
    7: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hm('p', 0);
      },
      unlocked() {
        return hm('d', 4);
      },
      effectDescription: '要求:获得第1个聚变核心<br>解锁“能量于稳态调和(Equilibrium) I”',
    },
    8: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hu('p', 13);
      },
      unlocked() {
        return hm('d', 5);
      },
      effectDescription: '要求:获得第3个能量升级“绚丽填充”<br>解锁“能量于稳态调和(Equilibrium) II”',
    },
    9: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hm('p', 3);
      },
      unlocked() {
        return hm('d', 6);
      },
      effectDescription: '要求:获得第4个聚变核心<br>解锁“能量于稳态调和(Equilibrium) III”',
    },
    10: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hm('p', 4);
      },
      unlocked() {
        return hm('d', 7);
      },
      effectDescription: '要求:获得第5个聚变核心<br>解锁“能量于稳态调和(Equilibrium) IV”',
    },
    11: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hm('P', 0);
      },
      unlocked() {
        return hm('d', 8);
      },
      effectDescription: '要求:获得第1个处理器<br>解锁“处理于资源整合(Resources) I”',
    },
    12: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hu('P', 13);
      },
      unlocked() {
        return hm('d', 9);
      },
      effectDescription: '要求:获得第3个处理器升级”进阶自动”<br>解锁“处理于资源整合(Resources) II”',
    },
    13: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hm('P', 3);
      },
      unlocked() {
        return hm('d', 10);
      },
      effectDescription: '要求:获得第1e6个处理器<br>解锁“处理于资源整合(Resources) III”',
    },
    14: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hm('P', 4);
      },
      unlocked() {
        return hm('d', 11);
      },
      effectDescription: '要求:获得第1e8个处理器<br>解锁“处理于资源整合(Resources) IV”',
    },
    15: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.y.points.gte(0.01);
      },
      unlocked() {
        return hm('d', 12);
      },
      effectDescription: '要求:获得0.01思念<br>解锁“思念于归乡心切(Nostalgia) I”',
    },
    16: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.y.points.gte(1e4);
      },
      unlocked() {
        return hm('d', 13);
      },
      effectDescription: '要求:获得10000思念<br>解锁“思念于归乡心切(Nostalgia) II”',
    },
    17: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.y.points.gte(1e15);
      },
      unlocked() {
        return hm('d', 14);
      },
      effectDescription: '要求:获得1e15思念<br>解锁“思念于归乡心切(Nostalgia) III”',
    },
    18: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.y.points.gte(1e100);
      },
      unlocked() {
        return hm('d', 15);
      },
      effectDescription: '要求:获得1e100思念<br>解锁“思念于归乡心切(Nostalgia) IV”',
    },
    19: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.n.resets.gte(1);
      },
      unlocked() {
        return hm('d', 16);
      },
      effectDescription: '要求:简并1次<br>解锁“积累于中子元素(Accumulation) I”',
    },
    20: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.n.resets.gte(10);
      },
      unlocked() {
        return hm('d', 17);
      },
      effectDescription: '要求:简并10次<br>解锁“积累于中子元素(Accumulation) II”',
    },
    21: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.n.resets.gte(50);
      },
      unlocked() {
        return hm('d', 18);
      },
      effectDescription: '要求:简并50次<br>解锁“积累于中子元素(Accumulation) III”',
    },
    22: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.n.theorems.gte(45);
      },
      unlocked() {
        return hm('d', 19);
      },
      effectDescription: '要求:获得45中子定理<br>解锁“积累于中子元素(Accumulation) IV”',
    },
    23: {
      requirementDescription: '解锁新剧情！',
      done() {
        return inChallenge('e', 11);
      },
      unlocked() {
        return hm('d', 20);
      },
      effectDescription: '要求:进入第一个熵挑战<br>解锁“光辉于熵增挑战(Light) I”',
    },
    24: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.e.maxpoints[0].gte(1000);
      },
      unlocked() {
        return hm('d', 21);
      },
      effectDescription: '要求:在挑战1中获得1000熵<br>解锁“光辉于熵增挑战(Light) II”',
    },
    25: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.e.maxpoints[1].gte(1000);
      },
      unlocked() {
        return hm('d', 22);
      },
      effectDescription: '要求:在挑战2中获得1000熵<br>解锁“光辉于熵增挑战(Light) III”',
    },
    26: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.e.maxpoints[2].gte(1000);
      },
      unlocked() {
        return hm('d', 23);
      },
      effectDescription: '要求:在挑战3中获得1000熵<br>解锁“光辉于熵增挑战(Light) IV”',
    },
    27: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.w.points.gte(1);
      },
      unlocked() {
        return hm('d', 24);
      },
      effectDescription: '要求:获得 1 温暖<br>解锁“温暖于破除混乱(Disorder) I”',
    },
    28: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.w.points.gte(1e10);
      },
      unlocked() {
        return hm('d', 25);
      },
      effectDescription: '要求:获得 1e10 温暖<br>解锁“温暖于破除混乱(Disorder) II”',
    },
    29: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.w.points.gte(1e30);
      },
      unlocked() {
        return hm('d', 26);
      },
      effectDescription: '要求:获得 1e30 温暖<br>解锁“温暖于破除混乱(Disorder) III”',
    },
    30: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.w.points.gte(1e45);
      },
      unlocked() {
        return hm('d', 27);
      },
      effectDescription: '要求:获得 1e45 温暖<br>解锁“温暖于破除混乱(Disorder) IV”',
    },
    31: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.Y.points.gte(1);
      },
      unlocked() {
        return hm('d', 28);
      },
      effectDescription: '要求:获得 1 产量结晶<br>解锁“存储于产量收获(Restoration) I”',
    },
    32: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.Y.unlockedBoosts.length >= 10;
      },
      unlocked() {
        return hm('d', 29);
      },
      effectDescription: '要求:解锁 10 产能增益<br>解锁“存储于产量收获(Restoration) II”',
    },
    33: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hm('Y', 7) && hm('Y', 8);
      },
      unlocked() {
        return hm('d', 30);
      },
      effectDescription: '要求:获得 YM8 和 YM9<br>解锁“存储于产量收获(Restoration) III”',
    },
    34: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.Y.permanentBoosts.length >= 1;
      },
      unlocked() {
        return hm('d', 31);
      },
      effectDescription: '要求:永久化 1 个增益<br>解锁“存储于产量收获(Restoration) IV”',
    },
    35: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.Y.permanentBoosts.length >= 15;
      },
      unlocked() {
        return hm('d', 32);
      },
      effectDescription: '要求:永久化 15 个增益<br>解锁“存储于产量收获(Restoration) V”',
    },
    36: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.Y.permanentBoosts.length >= 25;
      },
      unlocked() {
        return hm('d', 33);
      },
      effectDescription: '要求:永久化 25 个增益<br>解锁“存储于产量收获(Restoration) VI”',
    },
    37: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.Y.permanentBoosts.length >= 30;
      },
      unlocked() {
        return hm('d', 34);
      },
      effectDescription: '要求:永久化 30 个增益<br>解锁“存储于产量收获(Restoration) VII”',
    },
    38: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.points.gte('ee6');
      },
      unlocked() {
        return hm('d', 35);
      },
      effectDescription: '要求:航迹突破 1e1000000<br>解锁“存储于产量收获(Restoration) VIII”',
    },
    39: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.E.buyables[11].gte(1);
      },
      unlocked() {
        return hm('d', 36);
      },
      effectDescription: '要求:进入奥尔特云内缘<br>解锁“经验于行星轨道 (Ellipsoid) I”',
    },
    40: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.E.buyables[11].gte(3);
      },
      unlocked() {
        return hm('d', 37);
      },
      effectDescription: '要求:进入冥王星及矮行星区域<br>解锁“经验于行星轨道 (Ellipsoid) II”',
    },
    41: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.E.buyables[11].gte(5);
      },
      unlocked() {
        return hm('d', 38);
      },
      effectDescription: '要求:进入天王星轨道<br>解锁“经验于行星轨道 (Ellipsoid) III”',
    },
    42: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.E.buyables[11].gte(8);
      },
      unlocked() {
        return hm('d', 39);
      },
      effectDescription: '要求:进入小行星带<br>解锁“经验于行星轨道 (Ellipsoid) IV”',
    },
    43: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.E.buyables[11].gte(11);
      },
      unlocked() {
        return hm('d', 40);
      },
      effectDescription: '要求:进入近地轨道<br>解锁“经验于行星轨道 (Ellipsoid) V”',
    },
    44: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.E.buyables[11].gte(12);
      },
      unlocked() {
        return hm('d', 41);
      },
      effectDescription: '要求:进入地球轨道<br>解锁“经验于行星轨道 (Ellipsoid) VI”',
    },
    45: {
      requirementDescription: '解锁新剧情！',
      done() {
        return hu('d', 33);
      },
      unlocked() {
        return hm('d', 42);
      },
      effectDescription: '要求:解锁“大气”层级<br>解锁“返程于大气航行 (Astra) I”',
    },
    46: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.At.upgrades.length == 9;
      },
      unlocked() {
        return hm('d', 43);
      },
      effectDescription: '要求:购买所有大气升级<br>解锁“返程于大气航行 (Astra) II”',
    },
    47: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.d.distance.eq(0);
      },
      unlocked() {
        return hm('d', 44);
      },
      effectDescription: '要求:距离达到0<br>解锁“返程于大气航行 (Astra) III”',
    },
    48: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.d.distance.eq(0);
      },
      unlocked() {
        return hm('d', 45);
      },
      effectDescription: '要求:解锁“团聚”层级<br>解锁“终点于团聚时刻 (Moments)”',
    },
    49: {
      requirementDescription: '解锁新剧情！',
      done() {
        return player.d.milestones.length == 49;
      },
      unlocked() {
        return hm('d', 46);
      },
      effectDescription: '要求:解锁以上所有剧情<br>解锁“梦想于永恒实现 (Eternal Dream)”',
    },
  },
}); //距离 D

