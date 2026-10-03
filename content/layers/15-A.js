// layers.js:8389
addLayer('A', {
  infoboxes: {
    introBox: {
      title: '成就',
      body() {
        return '显示游戏中的所有成就，他们没有什么奖励，大部分也不需要刻意去做才能完成。<br>每行成就代表了一个层级，并且字数依次递增哦！<br>部分成就名来源于音游曲名与解谜题目';
      },
    },
  },
  startData() {
    return {
      unlocked: true,
    };
  },
  color: 'yellow',
  row: 'side',
  tooltip() {
    return 'Achievements';
  },
  achievementPopups: true,
  tooltip: '成就',
  achievements: {
    //每层一行成就，第n行的成就有n字
    //注释为成就名来源
    11: {
      name: '始',
      done() {
        return hu('d', 11);
      },
      tooltip: '进行第一次跳跃',
    },
    12: {
      name: '启',
      done() {
        return hu('h', 11);
      },
      tooltip: '购买第一个希望升级“开始航行”',
    },
    13: {
      name: '彩', //音游
      done() {
        return player.points.gte(100);
      },
      tooltip: '获得 100 航迹',
    },
    14: {
      name: '光', //音游
      done() {
        return player.h.points.gte(50);
      },
      tooltip: '获得 50 希望粒子',
    },
    15: {
      name: '续',
      done() {
        return hu('d', 12);
      },
      tooltip: '进行第二次跳跃',
    },
    21: {
      name: '诞生', //US-TC
      done() {
        return player.a.points.gte(1);
      },
      tooltip: '获得第一个反物质',
    },
    22: {
      name: '加速',
      done() {
        return hu('a', 15);
      },
      tooltip: '解锁第三个反应堆',
    },
    23: {
      name: '自动',
      done() {
        return hu('h', 25);
      },
      tooltip: '自动凝聚希望',
    },
    24: {
      name: '暗格', //SECO2
      done() {
        return player.points.gte(1e12);
      },
      tooltip: '航迹超过1e12',
    },
    25: {
      name: '延续',
      done() {
        return hu('a', 25);
      },
      tooltip: '获得第10个反物质升级“再启新篇”',
    },
    31: {
      name: '生成树', //US-TC
      done() {
        return hm('p', 0);
      },
      tooltip: '获得第1个聚变核心',
    },
    32: {
      name: '开心病', //音游
      done() {
        return hu('p', 13);
      },
      tooltip: '解锁第三个能量条',
    },
    33: {
      name: '联络处', //SECO2
      done() {
        return hm('p', 2);
      },
      tooltip: '解锁“希望共振”',
    },
    34: {
      name: '四方谜', //CCBC16
      done() {
        return hm('p', 3);
      },
      tooltip: '获得第4个聚变核心',
    },
    35: {
      name: '三字谜', //CCBC16
      done() {
        return hm('p', 4);
      },
      tooltip: '获得第5个聚变核心',
    },
    41: {
      name: '中心思想', //CCBC16
      done() {
        return hm('P', 0);
      },
      tooltip: '获得第1个处理器',
    },
    42: {
      name: '子虚乌有', //CCBC16
      done() {
        return hm('P', 1);
      },
      tooltip: '获得第100个处理器',
    },
    43: {
      name: '黄金比例', //CCBC16
      done() {
        return player.P.points.gte(161803.39);
      },
      tooltip: '获得161803.39个处理器',
    },
    44: {
      name: '自树一帜', //CCBC16
      done() {
        return player.points.gte(1e50);
      },
      tooltip: '获得1e50个航迹',
    },
    45: {
      name: '终极引用',
      done() {
        return hu('P', 24);
      },
      tooltip: '获得被动获取处理器',
    },
    51: {
      name: '红豆生南国',
      done() {
        return hu('y', 11);
      },
      tooltip: '获得第一个思念升级',
    },
    52: {
      name: '科学记数法', //CCBC16
      done() {
        return player.y.points.gte(1e5);
      },
      tooltip: '获得1e5思念',
    },
    53: {
      name: '数字狂想曲', //SECO2
      done() {
        return player.y.points.gte(18446744073709551615);
      },
      tooltip: '获得18446744073709551615思念',
    },
    54: {
      name: '心跳谜学部', //US-TC
      done() {
        return player.y.points.gte(1e50);
      },
      tooltip: '获得1e50思念',
    },
    55: {
      name: '思念无上限',
      done() {
        return player.y.points.gte(1e100);
      },
      tooltip: '获得1e100思念',
    },
    61: {
      name: '要按下按钮吗', //US-TC
      done() {
        return hm('n', 0);
      },
      tooltip: '第一次简并',
    },
    62: {
      name: '概率与波之形', //US-TC
      done() {
        return hm('n', 9);
      },
      tooltip: '简并 10 次',
    },
    63: {
      name: '量子力学传导',
      done() {
        return hm('n', 12);
      },
      tooltip: '简并 25 次',
    },
    64: {
      name: '微观基态验证',
      done() {
        return hm('n', 14);
      },
      tooltip: '简并 50 次',
    },
    65: {
      name: '彩虹上的彩虹', //US-TC
      done() {
        return player.n.theorems.gte(45);
      },
      tooltip: '获得 45 个中子定理',
    },
    71: {
      name: '道是无情却有晴', //SECO2
      done() {
        return player.e.points.gte(1);
      },
      tooltip: '获得 1 熵',
    },
    72: {
      name: '满园春色关不住', //US-TC
      done() {
        return player.e.maxpoints[0].gte(1000);
      },
      tooltip: '在挑战1中，获得 1000 熵',
    },
    73: {
      name: '我来秋浦正逢秋', //SECO2
      done() {
        return player.e.maxpoints[1].gte(1000);
      },
      tooltip: '在挑战2中，获得 1000 熵',
    },
    74: {
      name: '挑战初心从未改',
      done() {
        return player.e.maxpoints[2].gte(1000);
      },
      tooltip: '在挑战3中，获得 1000 熵',
    },
    75: {
      name: '新春征程永不息',
      done() {
        return player.n.theorems.gte(60);
      },
      tooltip: '获得 60 个中子定理',
    },
    81: {
      name: '能量沉默 复苏微笑',
      done() {
        return player.e.maxpoints[3].gte(1e10);
      },
      tooltip: '在挑战4中，获得 1e10 熵',
    },
    82: {
      name: '思念沉寂 破障重生',
      done() {
        return player.e.maxpoints[4].gte(1e10);
      },
      tooltip: '在挑战5中，获得 1e10 熵',
    },
    83: {
      name: '数值塌缩 再启征程',
      done() {
        return player.e.maxpoints[5].gte(1e10);
      },
      tooltip: '在挑战6中，获得 1e10 熵',
    },
    84: {
      name: '三重连环 破局反制',
      done() {
        return player.e.maxpoints[6].gte(1e10);
      },
      tooltip: '在挑战7中，获得 1e10 熵',
    },
    85: {
      name: '绝境反击 新层渐现',
      done() {
        return player.e.maxpoints[7].gte(1e10);
      },
      tooltip: '在挑战8中，获得 1e10 熵',
    },
    91: {
      name: '再次重置 新层的召唤',
      done() {
        return player.Y.points.gte(1);
      },
      tooltip: '获得 1 产量结晶',
    },
    92: {
      name: '无限返程 让增益持续',
      done() {
        return player.Y.points.gte(100);
      },
      tooltip: '获得 100 产量结晶',
    },
    93: {
      name: '时间加速 限制的破除',
      done() {
        return hm('Y', 9);
      },
      tooltip: '解锁“时空裂隙”',
    },
    94: {
      name: '再续新篇 永恒的收获',
      done() {
        return hm('Y', 14);
      },
      tooltip: '永久化 15 个增益',
    },
    95: {
      name: '终极突破 航迹的巅峰',
      done() {
        return player.points.gte('ee6');
      },
      tooltip: '获得 1e1000000 航迹',
    },
    101: {
      name: '六兆年又零一夜的故事',
      done() {
        return player.devSpeed.gte(1.89216e20);
      },
      tooltip: '全局速率超过(六兆年+一天)/秒（1.89216e20）',
    },
    102: {
      name: '侧悬的轨道与不变的心',
      done() {
        return player.E.buyables[11].gte(5);
      },
      tooltip: '进入天王星轨道',
    },
    103: {
      name: '大红斑深处隐藏的秘密',
      done() {
        return player.E.buyables[11].gte(7);
      },
      tooltip: '进入木星轨道',
    },
    104: {
      name: '归乡的讯号再一次传来',
      done() {
        return player.E.buyables[11].gte(12);
      },
      tooltip: '进入地球轨道',
    },
    105: {
      name: '这里真没有更多成就了',
      done() {
        return player.d.distance.eq(0);
      },
      tooltip: '通关游戏',
    },
  },
}); //成就

//春节快乐！
