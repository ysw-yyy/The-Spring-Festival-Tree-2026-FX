// layers.js:789
addLayer('h', {
  infoboxes: {
    introduction0: {
      title: '游戏全局介绍',
      body() {
        return '欢迎大家游玩《2026春节树》！这里是作者QqQe308，这是一款以“春节归家”为情感内核的增量游戏。在游戏中，玩家将扮演一名远在星海之外的宇航员，通过独特的“航迹”积累与“距离”缩减双重进度系统，在纯文字与数值构成的宇宙中，踏上跨越光年的返乡旅途。游戏将情感叙事深度融入每一次资源解锁与升级之中，并用两个隐藏的字母密码串联起全部十二章旅程，旨在为玩家提供一段温暖且充满探索感的代码宇宙漫游。<br>游戏类型是“树类增量游戏”，如果你需要对树类游戏的介绍，请查看下方“树类游戏介绍”；本游戏有成就和“距离”系统，请查看右上角的黄色层级查看所有成就和“距离”；本游戏有剧情，分布在各个层级中，你可以先查看“剧情”标签页中的“剧情1”和“剧情2”；对于本层级的内容，请查看“Hope _ 希望”<br>本游戏作者：QqQe308；剧情创作：Deepseek；感谢游玩';
      },
    },
    introduction1: {
      title: '树类游戏介绍',
      body() {
        return '树类游戏是增量游戏的一种，在游戏中，各个“层级”是主要游玩内容，而高数量级的资源也是一大特点层级中的资源可以购买升级、完成挑战、提升可购买、达成里程碑等，游戏的画面和美工可能不够精美，但我会努力倾尽心力让内容精彩！';
      },
    },
    text1: {
      title: '剧情1: 启航于宇宙归途(Embarkation) I',
      body() {
        return hm('d', 0)
          ? '欢迎，宇航员。<br>你漂泊于无垠深空，但一个目标清晰如灯塔：在春节前，努力回家。<br>前方是漫长的星际旅程，而你的航迹，始于当下。请尝试点击下方最显眼的按钮「凝聚希望」，并观察上方「航迹」数值的变化。这串数字是你所有努力的总和，是丈量你归途的根本尺度。<br>“每一点能量，都在将你推离漂泊，拉近家园。”<br>在右上角的子层级中，有一个至关重要的指标：「距离」，它代表你与家之间剩下的光年数，你的一切操作，最终都是为了看着它逐步缩减，直至归零。<br>“宇宙自有其节奏。当你准备好时，前路自会显现。”'
          : '剧情暂未解锁';
      },
    },
    text2: {
      title: '剧情2: 启航于宇宙归途(Embarkation) II',
      body() {
        return hm('d', 1)
          ? '当希望粒子的微光在指尖汇聚，它们开始低语。<br>起初是杂乱的频率，如同星尘的噪音。<br>但随着数量增长，杂音逐渐沉淀，形成一段模糊的旋律。<br>我忽然想起，那是许多年前，某个团圆夜里，背景播放的熟悉曲调。<br>它并非来自飞船的数据库，而是从我记忆深处被唤醒。<br>此刻，控制台自动标注出一个新的读数。<br>它显示，这些粒子间的共鸣，正与某个遥远源头传来的、极其微弱的节律同步。<br>那源头的方向，与家园的坐标悄然重合。<br>宇宙的寂静并非虚无，它充满回响。<br>我收集的每一粒光，似乎都在加深我与那条归途之间的纽带。<br>继续下去。'
          : '剧情暂未解锁';
      },
    },
    text3: {
      title: '剧情3: 启航于宇宙归途(Embarkation) III',
      body() {
        return hm('d', 2)
          ? '当航迹突破一千的刻度，仪表盘的嗡鸣声悄然改变了频率。<br>那种持续了许久的、稳定的积累感，在这一刻达到了临界。<br>我感到船舱内的光线被拉长，又压缩，一种并非由引擎产生的推力将我轻柔地按在座椅上。<br><br>窗外的星辰不再是静止的钻石，它们化作了流溢的光丝，向后飞逝。<br>飞船并未剧烈移动，而是它包裹的空间本身，在朝着家园的方向被轻轻“折叠”。<br>一次短促的时空跳跃。<br><br>跳跃结束的震颤平复后，首先映入眼帘的是导航屏上跳跃式缩减的距离读数。<br>一段切实的路程被跨越了。<br>然而，主能源舱的警报随之亮起——常规聚变引擎因这次维度变动而过载，输出功率正在衰减。<br><br>就在这动力青黄不接的寂静时刻，一道从未有过的读数闯入了监测范围。<br>在飞船前方，那个因跳跃而尚未完全平复的空间褶皱中，检测到了极端高能的粒子湮灭闪光。<br>那不是燃烧，是纯粹的“抹除”，并释放出星辰内核般的力量。<br>数据库将其标记为：反物质。<br><br>它就在那里，在空间的伤口中闪烁，是危机，也是唯一的出路。<br>常规的容器无法容纳它，我需要全新的协议来捕捉和利用这份宇宙中最危险也最强大的馈赠。<br><br>'
          : '剧情暂未解锁';
      },
    },
    hope: {
      title: 'Hope _ 希望',
      body() {
        return '希望(Hope)，这是旅途的起点，也是航迹的最初开端。你将在此收集资源，准备好进行下一次跳跃';
      },
    },
  },
  name: 'hope',
  symbol: 'H',
  position: 0,
  startData() {
    return {
      unlocked() {
        return true;
      },
      points: n(0),
      wait: n(0),
      duration: n(0),
      duration2: n(0),
      duringDrain: n(0),
      duringDrain2: n(0),
      duringDrain3: n(0),
      //分别是希望共振、希望共鸣、希望永续，Player里面的是剩余时间，Tmp里面累计时间，Drain是点击时投入的资源数量
    };
  },
  color: '#feffbb',
  requires: n(10),
  resource: '希望粒子',
  baseResource: '航迹',
  baseAmount() {
    return player.points;
  },
  type: 'normal',
  exponent() {
    return inChallenge('e', 22) ? n(0) : n(0.5);
  },
  gainMult() {
    let mult = n(1);
    if (hu('h', 14)) mult = mult.mul(ue('h', 14));
    if (hu('a', 13)) mult = mult.mul(be('a', 12));
    if (hu('a', 14)) mult = mult.mul(ue('a', 14));
    if (hu('a', 22)) mult = mult.mul(ue('a', 22));
    if (hu('a', 61)) mult = mult.mul(ue('a', 61));
    if (hu('a', 25)) mult = mult.mul(10);
    if (hu('p', 12)) mult = mult.mul(tmp.p.energyEffect[1]);
    if (ce('e', 32).gte(1)) mult = mult.mul(ce('e', 32));
    if (yb(2)) mult = mult.mul(ye(2));
    return mult;
  },
  gainExp() {
    let e = n(1);
    if (hu('y', 14)) e = e.add(be('y', 12));
    if (hu('E', 15)) e = e.div(2);
    return e;
  },
  directMult() {
    let m = n(1);
    if (player.n.mult.gte(0)) m = m.mul(player.n.mult);
    return m;
  },
  row: 0,
  softcap() {
    let a = n('1e50000');
    if (yb(25)) a = a.mul(ye(25));
    return a;
  },
  softcapPower: n(0.1),
  hotkeys: [
    {
      key: 'h',
      description: '对于每个层级，对应的重置快捷键是层级节点上显示的字母',
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  passiveGeneration() {
    mult = n(0);
    if (hu('P', 11)) mult = mult.add(ue('P', 11));
    return mult;
  },
  deactivated() {
    return hu('At', 11);
  },
  update(diff) {
    let a = diff;
    if (a > 1e299) a = n(player.devSpeed).div(20);
    player.h.wait = player.h.wait.sub(a).max(0);
    if (!hu('P', 14)) player.h.duration = player.h.duration.sub(a).max(0);
    if (!hu('w', 35)) player.h.duration2 = player.h.duration2.sub(a).max(0);
    if (hu('P', 14)) player.h.duration = tmp.h.duration;
    if (hu('P', 14)) player.h.duringDrain = player.h.points;
    if (hu('w', 35)) player.h.duration2 = tmp.h.duration2;
    if (hu('w', 35)) player.h.duringDrain2 = player.w.points;
    if (hu('y', 53)) player.h.duringDrain3 = player.E.points;
  },
  autoUpgrade() {
    return hm('P', 2) && player.P.auto2 && (!player.e.inChal || hu('w', 33));
  },
  layerShown() {
    return hu('d', 11);
  },
  resetsNothing() {
    return hu('y', 55);
  },
  tabFormat: {
    希望: {
      content: [['infobox', 'hope'], 'main-display', 'blank', 'prestige-button', 'resource-display', 'clickables', 'blank', 'upgrades'],
    },
    剧情: {
      content: [
        'main-display',
        'blank',
        ['infobox', 'introduction0'],
        ['infobox', 'introduction1'],
        ['infobox', 'text1'],
        ['infobox', 'text2'],
        ['infobox', 'text3'],
      ],
    },
  },
  wait() {
    let t = n(1);
    if (hu('h', 13)) t = n(0.5);
    if (hu('a', 12)) t = n(0.25);
    if (hu('h', 22)) t = n(0.125);
    if (hu('h', 23)) t = n(0.0625);
    if (hu('h', 24)) t = n(0);
    return t;
  },
  duration() {
    let a = player.h.points.max(10).log(10);
    return a;
  },
  during() {
    let a = player.h.duringDrain.max(10).log(10);
    if (hu('P', 14)) a = a.mul(n(1).add(ue('P', 14)));
    if (player.h.duration2.gt(0)) a = a.pow(tmp.h.during2);
    if (player.h.duration.lte(0)) a = n(1);
    return a;
  }, //当前效果
  duringPoints() {
    let a = player.h.points.max(10).log(10);
    if (hu('P', 14)) a = a.mul(n(1).add(ue('P', 14)));
    if (player.h.duration2.gt(0)) a = a.pow(tmp.h.during2);
    return a;
  }, //如果现在点击，效果的更新
  duration2() {
    let a = player.w.points.add(1).mul(10).log(10).pow(0.8).mul(10);
    return a;
  },
  during2() {
    let a = player.h.duringDrain2.add(1).mul(10).log(10).pow(0.45);
    let t = n(10);
    let t2 = n(5);
    if (hu('w', 43)) t = n(2.5);
    if (yb(12)) t = ye(12);
    if (yb(12)) t2 = ye(12);
    if (a.gte(3)) a = a.sub(3).div(t).add(3);
    if (a.gte(4)) a = a.sub(4).div(t2).add(4);
    if (hu('E', 15)) a = a.pow(2);
    if (player.E.buyables[11].gte(1)) a = a.mul(tmp.h.during3);
    if (player.h.duration2.lte(0)) a = n(1);
    if (player.e.inChal) a = n(1);
    return a;
  }, //当前效果
  duringPoints2() {
    let a = player.w.points.add(1).mul(10).log(10).pow(0.45);
    let t = n(10);
    let t2 = n(5);
    if (hu('w', 43)) t = n(2.5);
    if (yb(12)) t = ye(12);
    if (yb(12)) t2 = ye(12);
    if (a.gte(3)) a = a.sub(3).div(t).add(3);
    if (a.gte(4)) a = a.sub(4).div(t2).add(4);
    if (hu('E', 15)) a = a.pow(2);
    if (player.E.buyables[11].gte(1)) a = a.mul(tmp.h.during3);
    return a;
  }, //如果现在点击，效果的更新
  during3() {
    let a = player.h.duringDrain3.add(1).mul(10).log(10).pow(0.2);
    if (hu('y', 53)) a = a.pow(2);
    if (player.e.inChal) a = n(1);
    return a;
  }, //当前效果
  duringPoints3() {
    let a = player.E.points.add(1).mul(10).log(10).pow(0.2);
    if (hu('y', 53)) a = a.pow(2);
    return a;
  }, //如果现在点击，效果的更新
  doReset(resettingLayer) {
    if (layers[resettingLayer].row > layers[this.layer].row) {
      let kept = ['unlocked', 'auto'];
      if (hu('w', 21)) kept.push('duration2', 'duringDrain2');
      if (hm('Y', 0)) kept.push('upgrades');
      layerDataReset(this.layer, kept);
    }
  },
  clickables: {
    11: {
      title() {
        return '凝聚希望';
      },
      display: function () {
        return '点击获得' + format(getPointClick()) + '航迹<br>冷却时间: ' + formatTime(player.h.wait);
      },
      onClick() {
        player.points = player.points.add(getPointClick());
        player.h.wait = tmp.h.wait;
      },
      canClick() {
        return player.h.wait.lte(0) && !hu('h', 25) && !inChallenge('e', 13);
      },
      unlocked() {
        return true;
      },
      style: { width: '200px' },
    },
    12: {
      title() {
        return '希望共振';
      },
      display: function () {
        return (
          '消耗所有的希望，但接下来的' +
          format(tmp.h.duration) +
          '秒内，航迹获取量翻' +
          format(tmp.h.duringPoints) +
          '倍<br>剩余持续时间: ' +
          formatTime(player.h.duration) +
          '<br>当前效果: ×' +
          format(tmp.h.during)
        );
      },
      onClick() {
        player.h.duration = tmp.h.duration;
        player.h.duringDrain = player.h.points;
        player.h.points = n(0);
      },
      canClick() {
        return player.h.points.gte(10) && !hu('P', 14);
      },
      unlocked() {
        return hm('p', 2);
      },
      style: { width: '200px' },
    },
    13: {
      title() {
        return '希望共鸣';
      },
      display: function () {
        return (
          '消耗所有的温暖，但接下来的' +
          format(tmp.h.duration2) +
          '秒内，“希望共振”效果^' +
          format(tmp.h.duringPoints2, 4) +
          '<br>剩余持续时间: ' +
          formatTime(player.h.duration2) +
          '<br>当前效果: ^' +
          format(tmp.h.during2, 4)
        );
      },
      onClick() {
        player.h.duration2 = tmp.h.duration2;
        player.h.duringDrain2 = player.w.points;
        player.w.points = n(0);
      },
      canClick() {
        return player.w.points.gte(1) && !player.e.inChal && !hu('w', 35);
      },
      unlocked() {
        return hu('w', 21);
      },
      style: { width: '200px' },
    },
    14: {
      title() {
        return '希望永续';
      },
      display: function () {
        return '消耗所有的经验，但“希望共鸣”效果×' + format(tmp.h.duringPoints3, 4) + '<br>当前效果: ×' + format(tmp.h.during3, 4);
      },
      onClick() {
        player.h.duration3 = tmp.h.duration3;
        player.h.duringDrain3 = player.E.points;
        player.E.points = n(0);
      },
      canClick() {
        return player.E.points.gte(1) && !player.e.inChal && player.E.buyables[11].gte(1) && tmp.h.duringPoints3.gte(tmp.h.during3) && !hu('y', 53);
      },
      unlocked() {
        return player.E.buyables[11].gte(1);
      },
      style: { width: '200px' },
    },
  },
  upgrades: {
    11: {
      title: '开始航行',
      description: '每次凝聚希望获得 2 航迹',
      unlocked() {
        return !inChallenge('e', 12);
      },
      cost: n(1),
    },
    12: {
      title: '经典升级',
      description: '希望粒子增加航迹获取量',
      cost: n(1),
      unlocked() {
        return (hu('h', 11) || hu('a', 52)) && !inChallenge('e', 12);
      },
      effect() {
        let a = player.h.points.pow(0.4).max(1);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id));
      },
    },
    13: {
      title: '略微进展',
      description: '凝聚希望冷却时间减半',
      cost: n(5),
      unlocked() {
        return (hu('h', 12) || hu('a', 52)) && !inChallenge('e', 12);
      },
    },
    14: {
      title: '走向前方',
      description: '航迹增加希望粒子获取量',
      cost: n(15),
      unlocked() {
        return (hu('h', 13) || hu('a', 52)) && !inChallenge('e', 12);
      },
      effect() {
        let a = player.points.pow(0.12).max(1);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id));
      },
    },
    15: {
      title: '进阶升级',
      description: '希望粒子再次增加航迹获取量',
      cost: n(30),
      unlocked() {
        return (hu('h', 14) || hu('a', 52)) && !inChallenge('e', 12);
      },
      effect() {
        let a = player.h.points.pow(0.3).max(1);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id));
      },
    },
    21: {
      title: '第二阶段',
      description: '反物质获取量翻倍',
      cost: n(1000),
      unlocked() {
        return (hu('a', 13) || hu('a', 52)) && !inChallenge('e', 12);
      },
    },
    22: {
      title: '三次进展',
      description() {
        return inChallenge('e', 13) ? '凝聚希望冷却时间再次减半<br>在这个挑战中，购买完这一行升级有特殊效果' : '凝聚希望冷却时间再次减半';
      },
      cost: n(1e7),
      unlocked() {
        return (hu('a', 15) || hu('a', 52)) && !inChallenge('e', 12);
      },
    },
    23: {
      title: '四次进展',
      description: '凝聚希望冷却时间再次减半',
      cost: n(1e8),
      unlocked() {
        return (hu('h', 22) || hu('a', 52)) && !inChallenge('e', 12);
      },
    },
    24: {
      title: '五次进展',
      description: '凝聚希望不再有冷却时间',
      cost: n(1e9),
      unlocked() {
        return (hu('h', 23) || hu('a', 52)) && !inChallenge('e', 12);
      },
    },
    25: {
      title: '持续进展',
      description() {
        return inChallenge('e', 13)
          ? '自动凝聚希望，速度为每秒20次，但禁用手动凝聚希望<br>另外，解锁第四个反应堆'
          : '自动凝聚希望，速度为每秒20次，但禁用手动凝聚希望';
      },
      cost: n(1e10),
      unlocked() {
        return (hu('h', 24) || hu('a', 52)) && !inChallenge('e', 12);
      },
    },
  },
}); //希望 H
