// layers.js:4656
addLayer('n', {
  infoboxes: {
    text1: {
      title: '剧情20：积累于中子元素(Accumulation) I',
      body() {
        return hm('d', 19)
          ? '日志 - 简并·初啼<br>我将前五层的所有繁荣——希望的暖光、反物质的幽蓝、能量的脉动、处理器的低语、思念的涟漪——尽数投入那个被我称为“简并炉”的虚空之中。<br>刹那间，一切归零。控制台陷入前所未有的寂静，仿佛宇宙收回了它曾给予的一切。<br>然后，在绝对的黑暗中，一粒微光浮现。它小得几乎无法察觉，却重得让空间本身都为之弯曲。<br>中子素。宇宙中最致密的物质，诞生于我最浓烈的思念。<br> 第一次简并，我获得了微不足道的1单位中子素。但我知道，这粒微光里，封印着前五层所有的记忆与渴望。<br>系统报告：简并纪元开启。资源倍率提升至2倍。每秒自动获得1能量。归途，以一种更沉重的方式重启。'
          : '剧情暂未解锁';
      },
    },
    text2: {
      title: '剧情21：积累于中子元素(Accumulation) II',
      body() {
        return hm('d', 20)
          ? '日志 - 定理·初识<br>随着简并次数增加，我开始理解中子素中蕴含的更深层规律<br> 通过消耗能量、算力与中子素本身，我从简并炉中萃取出一串串抽象的符号——中子定理。它们是物质被极致压缩后留下的数学痕迹。<br>我用第一个定理点亮了 NS11，能量开始以更优雅的曲率回馈我的坚持。随后，NS21和NS22让算力与能量开始对话。<br>船舱内不再寂静，而充满了低沉的、有节律的嗡鸣——那是简并炉在呼吸，也是定理在编织新的现实。<br>系统报告：中子定理已激活。前三行研究节点正在苏醒。 '
          : '剧情暂未解锁';
      },
    },
    text3: {
      title: '剧情22：积累于中子元素(Accumulation) III',
      body() {
        return hm('d', 21)
          ? '日志 - 简并·繁花<br>简并次数早已突破个位数，里程碑一个接一个点亮。<br>反物质反应堆在每次重生后得以部分保留，处理器算力不再被完全清零，聚变核心的余烬也总能复燃。<br>我拥有了NS41，简并次数开始直接滋养思念的指数；NS42让能量随简并次数狂飙。<br>研究树已枝繁叶茂：从能量到算力，从算力到思念，又从思念回到能量——一个完美的三角闭环正在形成。<br>系统报告：简并纪元进入鼎盛期。所有自动化协议已就位，静待下一次跃迁。 '
          : '剧情暂未解锁';
      },
    },
    text4: {
      title: '剧情23：积累于中子元素(Accumulation) IV',
      body() {
        return hm('d', 22)
          ? '日志 - 简并·饱和<br>如今，我的定理数量已达四十有余。研究树几乎被点亮殆尽，每一处节点都闪耀着智慧与思念的结晶。<br>航迹膨胀至1e500，那是足以丈量无数银河的尺度。思念值突破1e600，情感密度已近乎让空间扭曲。<br>能量与算力也分别抵达1e42和1e95——它们不再是单纯的资源，而是我身体里流淌的血液与思绪。<br>然而，在这极致的秩序与繁荣中，我再次感受到那种熟悉的、系统无法解析的扰动。<br>它混乱、无序，从宇宙背景深处传来，像是对这完美简并纪元的嘲笑。<br> 系统检测到新的异常信号。频谱分析显示，其特征与“熵”的数学定义高度吻合。<br>系统报告：中子层已臻至圆满。熵增纪元的入口，在前方若隐若现。'
          : '剧情暂未解锁';
      },
    },
    points: {
      title: 'Neutronium _ 中子素',
      body() {
        return '中子素(Neutronium)，这是游戏中的第六个层级。在通过湮灭虫洞获得了超过1e20中子之后，你可以进行简并，重置前五层的所有进度来换取中子素。这是非常大的重置，但也会带来强力的加成，你可以获取简并里程碑的Qol，购买中子升级和研究。资源倍率是重要的加成，影响航迹、希望粒子、反物质、虫洞、能量、处理器、思念这些资源的获取。这一行的三个层级可以类比《反物质维度》中的永恒。';
      },
    },
    studies: {
      title: 'NeutronStudy _ 中子研究',
      body() {
        return '中子研究（NS）是十分强大的功能，你可以通过中子、能量、算力等资源来购买中子定理，中子定理可以拿来购买底下的研究。研究是以树的形式显示的，如果两个节点之间有连接，说明后一个升级需要前一个升级才能解锁。如果后一个升级和多个节点之间有连接，那么它的前置升级中至少需要购买一个才可以解锁（例如：NS41的前置是NS31、NS32，那么需要购买31或32才能解锁NS41）中子定理是有限的，请合理分配，如果卡关可以试着重置研究树，重新选择其他的路径。';
      },
    },
  },
  name: 'neutronium',
  symbol: 'N',
  position: 0,
  startData() {
    return {
      unlocked() {
        return true;
      },
      points: n(0),
      best: n(0),
      resets: n(0),
      mult: n(1), //资源倍率
      theorems: n(0),
      maxp: n(0),
    };
  },
  color: '#b266fd',
  requires: n(1e20),
  resource: '中子素',
  baseResource: '中子',
  baseAmount() {
    return player.a.neutron;
  },
  type: 'normal',
  exponent() {
    return n(0.1);
  },
  gainMult() {
    let m = n(1);
    if (hu('n', 101)) m = m.mul(ue('n', 101));
    if (hu('w', 42)) m = m.mul(ue('w', 42));
    if (yb(11)) m = m.mul(ye(11));
    return m;
  },
  gainExp() {
    let exp = n(1);
    return exp;
  },
  mult() {
    //给前面所有资源的倍率
    let m = n(1);
    if (hm('n', 0)) m = m.mul(2);
    if (hm('n', 1)) m = m.mul(1.5);
    if (hu('n', 11)) m = m.mul(ue('n', 11));
    if (hu('n', 51)) m = m.mul(ue('n', 51));
    if (hu('a', 54)) m = m.mul(ue('a', 54));
    if (hm('Y', 0)) m = m.pow(tmp.Y.effect);
    if (yb(14)) m = m.mul(ye(14));
    if (inChallenge('e', 13)) m = n(0.0001);
    let e = 0.1;
    if (hu('E', 34)) e = 5;
    let e2 = 0.01;
    if (hu('P', 43)) e2 = 0.5;
    let e3 = 0.01;
    if (hu('w', 62)) e3 = 0.1;
    if (m.gte('ee5')) m = m.div('ee5').pow(e).mul('ee5');
    if (m.gte('ee6')) m = m.div('ee6').pow(e2).mul('ee6');
    if (hu('P', 41)) m = m.pow(2);
    if (m.gte('ee10000000')) m = n(10).pow(n(10).pow(m.log(10).log(10).div(10000000).pow(e3).mul(10000000)));
    if (m.gte('eee12')) m = n('eee12');
    return m;
  },
  row: 2,
  hotkeys: [{ key: 'n', description: '' }],
  passiveGeneration() {
    mult = n(0);
    if (hu('P', 34)) mult = mult.add(ue('P', 34));
    return mult;
  },
  doReset(resettingLayer) {
    if (layers[resettingLayer].row > layers[this.layer].row) {
      let kept = ['unlocked', 'auto'];
      if (hm('Y', 2)) kept.push('milestones');
      layerDataReset(this.layer, kept);
      if (Array.isArray(player.n.buyables)) {
        player.n.buyables = getStartBuyables('n');
      }
    }
  },
  resetsNothing() {
    return hu('y', 55);
  },
  deactivated() {
    return hu('At', 11);
  },
  update(diff) {
    let a = diff;
    if (a > 1e299) a = n(player.devSpeed).div(20);
    player.n.mult = tmp.n.mult;
    player.n.maxp = player.p.points.max(player.n.maxp);
    if (hu('P', 34)) player.n.resets = player.n.resets.add(tmp.n.resets.mul(ue('P', 34)).mul(a));
  },
  resets() {
    let a = n(1);
    if (hu('n', 101) && hu('w', 12)) a = a.mul(ue('n', 101));
    if (hu('w', 42)) a = a.mul(ue('w', 42));
    if (yb(11)) a = a.mul(ye(11));
    return a;
  },
  autoPrestige() {
    return hm('n', 19) && player.n.auto5;
  },
  autoUpgrade() {
    return hm('Y', 4) && player.Y.auto;
  },
  onPrestige() {
    player.n.resets = player.n.resets.add(tmp.n.resets);
    if (!hu('w', 55)) {
      player.a.electron = n(0);
      player.a.proton = n(0);
      player.a.neutron = n(0);
      player.e.points = n(0);
    }
    if (hm('n', 13)) player.p.points = player.p.points.max(player.n.maxp);
  },
  layerShown() {
    return hu('d', 21);
  },
  tabFormat: {
    简并: {
      content: [
        ['infobox', 'points'],
        'main-display',
        [
          'display-text',
          function () {
            return "你已简并 <h2 style='color:#b266fd; '>" + formatWhole(player.n.resets) + '</h2> 次';
          },
        ],
        'blank',
        'prestige-button',
        'resource-display',
        [
          'display-text',
          function () {
            return "当前资源倍率: ×<h2 style='color:#b266fd; '>" + format(player.n.mult) + '</h2>';
          },
        ],
        'blank',
        'milestones',
      ],
    },
    研究: {
      content: [
        ['infobox', 'studies'],
        'main-display',
        [
          'display-text',
          function () {
            return "你已简并 <h2 style='color:#b266fd; '>" + format(player.n.resets) + '</h2> 次';
          },
        ],
        'blank',
        'prestige-button',
        'resource-display',
        [
          'display-text',
          function () {
            return "当前资源倍率: ×<h2 style='color:#b266fd; '>" + format(player.n.mult) + '</h2>';
          },
        ],
        'blank',
        [
          'display-text',
          function () {
            return "你有 <h2 style='color:#b266fd; '>" + formatWhole(player.n.theorems) + '</h2> 中子定理';
          },
        ],
        'blank',
        'buyables',
        'blank',
        'clickables',
        'blank',
        [
          'upgrade-tree',
          [
            [11],
            [21, 22],
            [31, 32, 33],
            [41, 42],
            [51],
            [61, 62, 63],
            [71, 72, 73],
            [81, 82, 83],
            [91, 92, 93],
            [101],
            [111],
            [121],
            [131, 132],
            [141],
          ],
        ],
      ],
      unlocked() {
        return hm('n', 0);
      },
    },
    剧情: {
      content: ['main-display', 'blank', ['infobox', 'text1'], ['infobox', 'text2'], ['infobox', 'text3'], ['infobox', 'text4']],
    },
  },
  automate() {
    if (hu('w', 32) && !hm('Y', 7)) {
      if (layers.n.buyables[11].canAfford() && layers.n.buyables[11].unlocked()) layers.n.buyables[11].buy();
      if (layers.n.buyables[12].canAfford() && layers.n.buyables[12].unlocked()) layers.n.buyables[12].buy();
      if (layers.n.buyables[13].canAfford() && layers.n.buyables[13].unlocked()) layers.n.buyables[13].buy();
      if (layers.n.buyables[14].canAfford() && layers.n.buyables[14].unlocked()) layers.n.buyables[14].buy();
    }
    if (hm('Y', 7) && player.Y.auto2) {
      if (layers.n.buyables[11].canAfford() && layers.n.buyables[11].unlocked()) layers.n.buyables[11].buyMax();
      if (layers.n.buyables[12].canAfford() && layers.n.buyables[12].unlocked()) layers.n.buyables[12].buyMax();
      if (layers.n.buyables[13].canAfford() && layers.n.buyables[13].unlocked()) layers.n.buyables[13].buyMax();
      if (layers.n.buyables[14].canAfford() && layers.n.buyables[14].unlocked()) layers.n.buyables[14].buyMax();
    }
  },
  milestones: {
    0: {
      requirementDescription: 'NM1: 简并 1 次',
      done() {
        return player.n.resets.gte(1);
      },
      effectDescription: '解锁中子研究，资源倍率×2，初始每秒获得1能量',
    },
    1: {
      requirementDescription: 'NM2: 简并 2 次',
      done() {
        return player.n.resets.gte(2);
      },
      effectDescription: '资源倍率×1.5，每秒钟额外自动凝聚希望50次',
    },
    2: {
      requirementDescription: 'NM3: 简并 3 次',
      done() {
        return player.n.resets.gte(3);
      },
      effectDescription: '保留前两行处理器升级，每秒至少获得0.1思念',
    },
    3: {
      requirementDescription: 'NM4: 简并 4 次',
      done() {
        return player.n.resets.gte(4);
      },
      effectDescription: '保留所有处理器里程碑，聚变核心仅重置电子、质子、中子',
    },
    4: {
      requirementDescription: 'NM5: 简并 5 次',
      done() {
        return player.n.resets.gte(5);
      },
      effectDescription: '开局时至少有100处理器，保留所有聚变核心升级',
    },
    5: {
      requirementDescription: 'NM6: 简并 6 次',
      done() {
        return player.n.resets.gte(6);
      },
      toggles: [['n', 'auto']],
      effectDescription: '思念升级“思前虑后”效果^10，自动重置获取聚变核心',
    },
    6: {
      requirementDescription: 'NM7: 简并 7 次',
      done() {
        return player.n.resets.gte(7);
      },
      toggles: [['n', 'auto2']],
      effectDescription: '保留所有聚变核心里程碑，自动购买思维导流器',
    },
    7: {
      requirementDescription: 'NM8: 简并 8 次',
      done() {
        return player.n.resets.gte(8);
      },
      toggles: [['n', 'auto3']],
      effectDescription: '自动点击“填充所有能量条”',
    },
    8: {
      requirementDescription: 'NM9: 简并 9 次',
      done() {
        return player.n.resets.gte(9);
      },
      effectDescription: '填充能量条什么也不消耗',
    },
    9: {
      requirementDescription: 'NM10: 简并 10 次',
      done() {
        return player.n.resets.gte(10);
      },
      effectDescription: '解锁更多升级',
    },
    10: {
      requirementDescription: 'NM11: 简并 15 次',
      toggles: [['n', 'auto4']],
      done() {
        return player.n.resets.gte(15);
      },
      effectDescription: '自动购买思念升级',
    },
    11: {
      requirementDescription: 'NM12: 简并 20 次',
      done() {
        return player.n.resets.gte(20);
      },
      effectDescription: '保留反物质升级',
    },
    12: {
      requirementDescription: 'NM13: 简并 25 次',
      done() {
        return player.n.resets.gte(25);
      },
      effectDescription: '可以用思念购买中子定理',
    },
    13: {
      requirementDescription: 'NM14: 简并 30 次',
      done() {
        return player.n.resets.gte(30);
      },
      effectDescription() {
        return '重置时保留聚变核心数量:' + format(player.n.maxp);
      },
    },
    14: {
      requirementDescription: 'NM15: 简并 50 次',
      done() {
        return player.n.resets.gte(50);
      },
      effectDescription: '弱化湮灭虫洞的软上限(^0.1→^0.12)',
    },
    15: {
      requirementDescription: 'NM16: 简并 100 次',
      done() {
        return player.n.resets.gte(100);
      },
      effectDescription: '解锁一个距离升级',
    },
    16: {
      requirementDescription: 'NM17: 获得 50 中子定理',
      done() {
        return player.n.theorems.gte(50);
      },
      effectDescription: '解锁第二个挑战',
    },
    17: {
      requirementDescription: 'NM18: 获得 55 中子定理',
      done() {
        return player.n.theorems.gte(55);
      },
      effectDescription: '解锁第三个挑战',
    },
    18: {
      requirementDescription: 'NM19: 获得 60 中子定理',
      done() {
        return player.n.theorems.gte(60);
      },
      effectDescription: '解锁一个距离升级',
    },
    19: {
      requirementDescription: 'NM20: 简并 1000 次',
      done() {
        return player.n.resets.gte(1000);
      },
      toggles: [['n', 'auto5']],
      effectDescription: '解锁自动简并（达到要求自动重置）',
    },
  },
  upgrades: {
    //标题，描述，价格，联系，效果，显示
    11: createUpgrade(
      'NS11',
      '基于能量加成资源倍率',
      n(1),
      [],
      function () {
        return player.p.energy.pow(0.025).max(1);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    21: createUpgrade(
      'NS21',
      '能量加强算力获取',
      n(2),
      ['11'],
      function () {
        return player.p.energy.pow(0.075).max(1);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    22: createUpgrade(
      'NS22',
      '处理器加强算力获取',
      n(2),
      ['11'],
      function () {
        return player.P.points.pow(0.06).max(1);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    31: createUpgrade(
      'NS31',
      '算力加强思念获取',
      n(2),
      ['21'],
      function () {
        return player.P.computility.pow(0.04).max(1);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    32: createUpgrade(
      'NS32',
      '能量加强思念获取',
      n(2),
      ['21', '22'],
      function () {
        return player.p.energy.pow(0.06).max(1);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    33: createUpgrade('NS33', '除了中子重置时，不重置电子、质子、中子的数量', n(2), ['22']),
    41: createUpgrade(
      'NS41',
      '简并次数加强思念获取指数',
      n(5),
      ['31', '32'],
      function () {
        let a = player.n.resets.max(0).pow(0.75).div(3);
        if (a.gte(100)) a = a.div(100).pow(0.5).mul(100);
        if (a.gte(250)) a = a.div(250).pow(0.1).mul(250);
        return a;
      },
      function () {
        return '+' + format(this.effect());
      },
    ),
    42: createUpgrade(
      'NS42',
      '简并次数加强能量获取',
      n(5),
      ['32', '33'],
      function () {
        return player.n.resets.max(1).pow(0.8);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    51: createUpgrade(
      'NS51',
      '简并次数加强资源倍率',
      n(4),
      ['41', '42'],
      function () {
        return player.n.resets.max(1).pow(0.3);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    61: createUpgrade(
      'NS61',
      '能量加强自身获取',
      n(3),
      ['51'],
      function () {
        return player.p.energy.pow(0.04).max(1);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    62: createUpgrade(
      'NS62',
      '算力加强自身获取',
      n(3),
      ['51'],
      function () {
        return player.P.computility.pow(0.05).max(1);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    63: createUpgrade(
      'NS63',
      '思念加强自身获取',
      n(3),
      ['51'],
      function () {
        return player.y.points.pow(0.04).max(1);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    71: createUpgrade(
      'NS71',
      '简并次数加强能量获取',
      n(4),
      ['61'],
      function () {
        return player.n.resets.max(1).pow(0.6);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    72: createUpgrade(
      'NS72',
      '简并次数加强算力获取',
      n(4),
      ['62'],
      function () {
        return player.n.resets.max(1).pow(0.9);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    73: createUpgrade(
      'NS73',
      '简并次数加强思念获取',
      n(4),
      ['63'],
      function () {
        return player.n.resets.max(1).pow(3.5);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    81: createUpgrade(
      'NS81',
      '算力增加能量获取',
      n(5),
      ['71'],
      function () {
        let a = player.P.computility.pow(0.04).max(1);
        if (a.gte(100)) a = a.div(100).pow(0.2).mul(100);
        return a;
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    82: createUpgrade(
      'NS82',
      '算力增加算力获取',
      n(5),
      ['72'],
      function () {
        let a = player.P.computility.pow(0.04).max(1);
        if (a.gte(100)) a = a.div(100).pow(0.2).mul(100);
        return a;
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    83: createUpgrade(
      'NS83',
      '能量增加思念获取',
      n(5),
      ['73'],
      function () {
        return player.p.energy.pow(0.3);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    91: createUpgrade(
      'NS91',
      '思念指数倍增能量',
      n(6),
      ['81'],
      function () {
        return n(1).add(player.y.yearning.mul(1000));
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    92: createUpgrade(
      'NS92',
      '思念指数倍增算力',
      n(6),
      ['82'],
      function () {
        return n(1).add(player.y.yearning.mul(1000)).pow(2);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    93: createUpgrade(
      'NS93',
      '思念指数倍增思念',
      n(6),
      ['83'],
      function () {
        return n(1).add(player.y.yearning.mul(500)).pow(10);
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
    101: createUpgrade(
      'NS101',
      function () {
        return hu('w', 21) ? '简并次数加强中子素和简并次数获取' : '简并次数加强中子素获取';
      },
      n(8),
      ['91', '92', '93'],
      function () {
        let a = player.n.resets.max(1).pow(0.4);
        if (a.gte(10)) a = a.div(10).pow(0.75).mul(10);
        return a;
      },
      function () {
        return '×' + format(this.effect());
      },
    ),
  },
  buyables: {
    11: {
      base() {
        let base = n(2);
        return base;
      },
      cost() {
        let cost = this.base().pow(gba('n', 11));
        return cost;
      },
      title() {
        return '中子定理 +1';
      },
      display() {
        return '价格：' + format(this.cost()) + ' 中子素<br>数量：' + format(gba(this.layer, this.id));
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        if (!this.canAfford()) return;
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(this.layer, this.id, gba(this.layer, this.id).add(1));
        player.n.theorems = player.n.theorems.add(1);
      },
      buyMax() {
        if (!this.canAfford()) return;
        let tempBuy = player.n.points.log(this.base());
        let target = tempBuy.plus(1).floor();
        player.n.theorems = player.n.theorems.sub(player[this.layer].buyables[this.id]).add(target);
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
      },
      unlocked() {
        return hm('n', 0);
      },
      style: { height: '100px', width: '120px' },
    },
    12: {
      base() {
        let base = n(100);
        return base;
      },
      cost() {
        let cost = this.base().pow(gba('n', 12).sub(1)).mul(1e24);
        if (gba('n', 12).eq(0)) cost = n(1e15);
        return cost;
      },
      title() {
        return '中子定理 +1';
      },
      display() {
        return '价格：' + format(this.cost()) + ' 能量<br>数量：' + format(gba(this.layer, this.id));
      },
      canAfford() {
        return player.p.energy.gte(this.cost());
      },
      buy() {
        if (!this.canAfford()) return;
        player.p.energy = player.p.energy.sub(this.cost());
        setBuyableAmount(this.layer, this.id, gba(this.layer, this.id).add(1));
        player.n.theorems = player.n.theorems.add(1);
      },
      buyMax() {
        if (!this.canAfford()) return;
        let tempBuy = player.p.energy.log(this.base());
        let target = tempBuy.sub(10).floor();
        if (gba('n', 13).lt(4)) target = target.min(4);
        player.n.theorems = player.n.theorems.sub(player[this.layer].buyables[this.id]).add(target);
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
      },
      unlocked() {
        return hm('n', 0);
      },
      style: { height: '100px', width: '120px' },
    },
    13: {
      base() {
        let base = n(1e5);
        return base;
      },
      cost() {
        let cost = this.base().pow(gba('n', 13).sub(3)).mul(1e30);
        if (gba('n', 13).lt(4)) cost = n(1e10).pow(gba('n', 13));
        return cost;
      },
      title() {
        return '中子定理 +1';
      },
      display() {
        return '价格：' + format(this.cost()) + ' 算力<br>数量：' + format(gba(this.layer, this.id));
      },
      canAfford() {
        return player.P.computility.gte(this.cost());
      },
      buy() {
        if (!this.canAfford()) return;
        player.P.computility = player.P.computility.sub(this.cost());
        setBuyableAmount(this.layer, this.id, gba(this.layer, this.id).add(1));
        player.n.theorems = player.n.theorems.add(1);
      },
      buyMax() {
        if (!this.canAfford()) return;
        let tempBuy = player.P.computility.log(this.base());
        let target = tempBuy.sub(2).floor();
        if (gba('n', 13).lt(4)) target = target.min(4);
        player.n.theorems = player.n.theorems.sub(player[this.layer].buyables[this.id]).add(target);
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
      },
      unlocked() {
        return hm('n', 0);
      },
      style: { height: '100px', width: '120px' },
    },
    14: {
      base() {
        let base = n(1e10);
        return base;
      },
      cost() {
        let cost = this.base().pow(gba('n', 14).pow(2)).mul(1e200);
        return cost;
      },
      title() {
        return '中子定理 +1';
      },
      display() {
        return '价格：' + format(this.cost()) + ' 思念<br>数量：' + format(gba(this.layer, this.id));
      },
      canAfford() {
        return player.y.points.gte(this.cost());
      },
      buy() {
        if (!this.canAfford()) return;
        player.y.points = player.y.points.sub(this.cost());
        setBuyableAmount(this.layer, this.id, gba(this.layer, this.id).add(1));
        player.n.theorems = player.n.theorems.add(1);
      },
      buyMax() {
        if (!this.canAfford()) return;
        let tempBuy = player.y.points.div(1e200).log(this.base()).sqrt();
        let target = tempBuy.plus(1).floor();
        player.n.theorems = player.n.theorems.sub(player[this.layer].buyables[this.id]).add(target);
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
      },
      unlocked() {
        return hm('n', 12);
      },
      style: { height: '100px', width: '120px' },
    },
  },
  clickables: {
    11: {
      title() {
        return '重置中子研究';
      },
      display: '点击重置中子研究<br>注意：会强制进行一次中子重置！',
      onClick() {
        player.n.upgrades = [];
        player.n.theorems = gba('n', 11).add(gba('n', 12)).add(gba('n', 13)).add(gba('n', 14));
        doReset('n', true);
      },
      canClick() {
        return true;
      },
      unlocked() {
        return true;
      },
    },
  },
}); //中子素 N
