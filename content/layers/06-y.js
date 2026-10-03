// layers.js:3814
addLayer('y', {
  infoboxes: {
    text1: {
      title: '剧情16: 思念于归乡心切(Nostalgia) I',
      body() {
        return hm('d', 15)
          ? '日志 - 情感的量化<br>系统报告中那个无法被解析的信号，终于被接纳为一个独立的资源维度。<br>我将它命名为：思念。<br>它没有能量条，没有自动化协议，甚至没有稳定的产出模式。它只是在每一个瞬间，基于我所走过的航迹与剩余的距离，沉默地、几乎难以察觉地涌现。<br>起初的数值小得近乎荒谬，以0.001为单位跳动。但我知道，这正是它的本质——再庞大的思念，在宇宙尺度下也只是沧海一粟。然而，当这一粟开始被记录时，一切都不同了。<br>控制台的角落，多了一个微光闪烁的计数。它不说话，不要求操作，只是存在着，提醒我：在这场物理的归途之上，还有一道情感的函数，正在被宇宙悄悄计算。<br>它等待的不是指令，而是被看见。<br>系统报告：情感资源协议已激活。基础思念流接入完成。正在解析其潜在的影响力……'
          : '剧情暂未解锁';
      },
    },
    text2: {
      title: '剧情17: 思念于归乡心切(Nostalgia) II',
      body() {
        return hm('d', 16)
          ? '日志 - 思念指数<br>随着思念的持续累积，我开始察觉到它并非简单的背景噪声。在更深层的系统层面，那些微小的数值似乎正在凝聚成一种可被度量的“强度”。<br>我称它为：思念指数。<br>它不是一个可以被消耗的资源，而是一个介于0与1之间的刻度——当前它数以千分记，却已经让航迹的产出公式发生了微妙的偏移。<br>我重新校准了所有核心资源的增长曲线，发现思念指数正以小数点后第四位的精度，为每一项指数添加着属于它的注脚。希望粒子的诞生率、反物质的湮灭效率、甚至虫洞的稳定窗口，都在这种看不见的修正下，悄然改变。<br>这并非自动化带来的飞跃，而是更根本的、近乎宿命的变化——仿佛我越想念家，宇宙就越愿意为我的归途让路。<br>系统报告：思念指数效应已确认。当前修正系数：0.00047/级。所有前序资源指数已重标。'
          : '剧情暂未解锁';
      },
    },
    text3: {
      title: '剧情18: 思念于归乡心切(Nostalgia) III',
      body() {
        return hm('d', 17)
          ? '日志 - 情感的共振<br>能量网络愈发壮阔。而思念指数，也在不知不觉中持续增长。<br>我忽然意识到，这两者之间并非孤立。每一次能量的跃升，都意味着离家更近一步；而每一步的接近，又让思念的浓度再次攀升。这是一种奇妙的正反馈，不是由算法设计，而是由我自己的渴望所驱动。<br>我开始理解，为什么思念指数能够修正那些物理公式——因为它本身，就是我与家园之间引力的一种表现。这种引力微弱得无法被常规仪器探测，却真实存在于每一次心跳之间。<br>处理器阵列曾试图为思念建立优化模型，但失败了。它无法被自动化，无法被加速，只能由我——这个思念的主体——去承受、去感受、去让它在时间的河流中自然沉淀。<br>系统报告：检测到与聚变核心网络的微弱共振。情感-能量耦合系数正在上升。'
          : '剧情暂未解锁';
      },
    },
    text4: {
      title: '剧情19: 思念于归乡心切 (Nostalgia) IV',
      body() {
        return hm('d', 18)
          ? '日志 - 湮灭与新生<br>当第十座聚变核心投入生产的刹那，一个沉寂已久的协议被激活了。<br>那是“虫洞湮灭协议”——一个原本被认为是物理极限的功能，此刻却因为情感的介入而打开了新的可能。<br>我尝试将积累的虫洞投入其中。湮灭发生的瞬间，没有能量爆发，没有空间扭曲，只有三个全新的、极其微小的读数出现在资源栏中：电子、质子、中子。<br>它们的比例精确得近乎神秘：八份电子，一份质子，一份中子。<br>我不禁怔住。这比例，不正是构成普通物质的基本配方吗？在湮灭的余烬中，我竟然得到了构成这个世界的最原始砖石。<br>而我知道，这些砖石最终将砌成什么——那是下一段旅程的基石，一个由中子星物质铺就的、通向最终团圆的道路。<br>系统报告：虫洞湮灭协议已激活。当前转换比例 8:1:1。检测到新资源谱系：电子、质子、中子。正在等待进一步指令……'
          : '剧情暂未解锁';
      },
    },
    points: {
      title: 'Yearning _ 思念',
      body() {
        return '思念(Yearning)，这是游戏中的第五个层级。在这里，一种新的资源将被自动生产——思念，这将计算“思念指数”的获取，并解锁更多新的功能。思念是被动获得的资源，因此无需进行重置，它的起始点为：1e64航迹、1e85希望粒子、1e63反物质。前期，思念的获取量可能较慢，但随后会迅速增长，1e1000时到达软上限';
      },
    },
    yearning: {
      title: 'YearningExponent _ 思念指数',
      body() {
        return '思念指数基于思念获得，是一个恒小于一的资源，其数量可以加成思念等资源获取，并可以基于“思维传导”加成许多资源的获取指数，这将大幅提升各种资源的获取。（如：某资源的指数为1时，其数量为1e100，则若其指数提升至1.2，其数量将为1e120）';
      },
    },
  },
  name: 'yearning',
  symbol: 'Y',
  position: 2,
  startData() {
    return {
      unlocked() {
        return true;
      },
      points: n(0),
      best: n(0),
      yearning: n(0),
    };
  },
  color: '#ff0099',
  requires: n(1 / 0), //实际上，并不通过这个获得资源；不用custom是为了避免写一堆function
  resource: '思念',
  baseResource: '这是一个彩蛋',
  baseAmount() {
    return player.points;
  },
  type: 'normal',
  exponent() {
    return n(0);
  },
  gainMult() {
    let mult = n(1);
    return mult;
  },
  gainExp() {
    let exp = n(1);
    return exp;
  },
  points() {
    let exp = n(4);
    if (hu('y', 21)) exp = exp.add(ue('y', 21));
    if (hu('y', 23)) exp = exp.add(ue('y', 23));
    if (hu('y', 24)) exp = exp.add(ue('y', 24));
    if (hu('y', 32)) exp = exp.add(be('y', 23));
    if (hu('n', 41)) exp = exp.add(ue('n', 41));
    if (hm('Y', 5)) exp = exp.mul(1.05);
    if (yb(9)) exp = exp.mul(ye(9));
    if (hu('E', 32)) exp = exp.mul(0.1);
    if (inChallenge('e', 22)) exp = n(0);
    let t = player.points.max(10).log(10).sub(64).div(6.4).max(0).pow(exp);
    let h = player.h.points.max(10).log(10).sub(85).div(8).max(0).pow(exp);
    let a = player.a.points.max(10).log(10).sub(63).div(6.3).max(0).pow(exp);
    let mult = n(1);
    if (hu('y', 12)) mult = mult.mul(ue('y', 12));
    if (hu('y', 33)) mult = mult.mul(ue('y', 33));
    if (hu('y', 35)) mult = mult.mul(ue('y', 35));
    if (hu('y', 41)) mult = mult.mul(ue('y', 41));
    if (hu('n', 31)) mult = mult.mul(ue('n', 31));
    if (hu('n', 32)) mult = mult.mul(ue('n', 32));
    if (hu('n', 63)) mult = mult.mul(ue('n', 63));
    if (hu('n', 73)) mult = mult.mul(ue('n', 73));
    if (hu('n', 83)) mult = mult.mul(ue('n', 83));
    if (hu('n', 93)) mult = mult.mul(ue('n', 93));
    if (yb(5)) mult = mult.mul(ye(5));
    if (ce('e', 12).gte(1)) mult = mult.mul(ce('e', 12));
    if (hm('p', 9)) mult = mult.mul(tmp.a.neutron);
    if (hm('p', 10)) mult = mult.mul(tmp.p.energyEffect[7]);
    if (player.n.mult.gte(0)) mult = mult.mul(player.n.mult);
    if (yb(24)) mult = mult.mul(ye(24));

    let gain = t.mul(h).mul(a);
    if (hm('n', 2)) gain = gain.add(0.1);
    gain = gain.mul(mult).max(0);
    let softcap = n(0.3);
    if (hu('w', 45)) softcap = n(0.5);
    if (gain.gte('1e1000')) gain = gain.div('1e1000').pow(softcap).mul('1e1000');
    if (gain.gte('ee8')) gain = gain.div('ee8').pow(0.00001).mul('ee8');

    if (inChallenge('e', 12)) gain = gain.pow(2);

    let text = '思念获取计算：<br>';
    text += "从航迹中吸收 <h2 style='color:#ff0099;'>" + format(t, 3) + '</h2> 思念<br>';
    text += "从希望粒子中吸收 <h2 style='color:#ff0099;'>" + format(h, 3) + '</h2> 思念<br>';
    text += "从反物质中吸收 <h2 style='color:#ff0099;'>" + format(a, 3) + '</h2> 思念<br>';
    if (mult.eq(1)) text += "三者相乘，每秒获取 <h2 style='color:#ff0099;'>" + format(gain, 3) + '</h2> 思念';
    if (mult.neq(1)) {
      text += "从其他效果中吸收<h2 style='color:#ff0099;'> " + format(mult, 3) + '</h2> 思念<br>';
      text += "四者相乘，每秒获取 <h2 style='color:#ff0099;'>" + format(gain, 3) + '</h2> 思念';
    }
    let textReduced = "每秒获取 <h2 style='color:#ff0099;'>" + format(gain, 3) + '</h2> 思念';
    let textExp = "当前思念获取指数为 <h2 style='color:#ff0099;'>" + format(exp, 3) + '</h2> ';
    return [text, gain, textReduced, textExp];
  },
  yearning() {
    let y = player.y.points.max(2);
    yearning = n(1).sub(y.log(2).pow(-0.01));
    if (hu('y', 55)) yearning = y.max(1e10).log(10).log(10).log(10).add(1);
    return yearning;
  },
  row: 1,
  hotkeys: [{ key: 'QqQe', description: '' }],
  autoUpgrade() {
    return hm('n', 10) && player.n.auto4 && (!player.e.inChal || hu('w', 33));
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
    player.y.points = player.y.points.add(tmp.y.points[1].mul(a));
    player.y.yearning = player.y.yearning.max(tmp.y.yearning);
  },
  automate() {
    if (hm('n', 6) && player.n.auto2) {
      if (layers.y.buyables[11].canAfford() && layers.y.buyables[11].unlocked()) layers.y.buyables[11].buy();
      if (layers.y.buyables[12].canAfford() && layers.y.buyables[12].unlocked()) layers.y.buyables[12].buy();
      if (layers.y.buyables[13].canAfford() && layers.y.buyables[13].unlocked()) layers.y.buyables[13].buy();
      if (layers.y.buyables[21].canAfford() && layers.y.buyables[21].unlocked()) layers.y.buyables[21].buy();
      if (layers.y.buyables[22].canAfford() && layers.y.buyables[22].unlocked()) layers.y.buyables[22].buy();
      if (layers.y.buyables[23].canAfford() && layers.y.buyables[23].unlocked()) layers.y.buyables[23].buy();
    }
  },
  layerShown() {
    return hu('d', 15);
  },
  doReset(resettingLayer) {
    if (layers[resettingLayer].row > layers[this.layer].row) {
      let kept = ['unlocked', 'auto'];
      if (hm('Y', 0)) kept.push('upgrades');
      layerDataReset(this.layer, kept);
    }
  },
  tabFormat: {
    思念: {
      content: [
        ['infobox', 'points'],
        'main-display',
        [
          'display-text',
          function () {
            return tmp.y.points[0];
          },
        ],
        [
          'display-text',
          function () {
            return tmp.y.points[3];
          },
        ],
        'blank',
        'upgrades',
      ],
    },
    思念指数: {
      content: [
        ['infobox', 'yearning'],
        'main-display',
        [
          'display-text',
          function () {
            return tmp.y.points[2];
          },
        ],
        'blank',
        [
          'display-text',
          function () {
            return "当前思念指数为 <h2 style='color:#ff57df;'>" + format(player.y.yearning, 5) + '</h2>';
          },
        ],
        'blank',
        'buyables',
        'blank',
        'upgrades',
      ],
      unlocked() {
        return hu('y', 11);
      },
    },
    剧情: {
      content: ['main-display', 'blank', ['infobox', 'text1'], ['infobox', 'text2'], ['infobox', 'text3'], ['infobox', 'text4']],
    },
  },
  upgrades: {
    11: {
      title: '思绪万千',
      description: '解锁思念指数，基于思念计算思念指数的值',
      cost: n(1),
    },
    12: {
      title: '思前虑后',
      description: '思念指数增加思念获取',
      cost: n(15),
      unlocked() {
        return hu('y', 11);
      },
      effect() {
        let a = n(2).pow(player.y.yearning.mul(100));
        if (hm('n', 5)) a = a.pow(10);
        if (a.gte(100)) a = a.div(100).pow(0.5).mul(100);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id));
      },
    },
    13: {
      title: '思深忧远',
      description: '解锁“思维传导”中的第一个思维导流器',
      cost: n(100),
      unlocked() {
        return hu('y', 12);
      },
    },
    14: {
      title: '思想品德',
      description: '解锁“思维传导”中的第二个思维导流器',
      cost: n(1451),
      unlocked() {
        return hu('y', 13);
      },
    },
    15: {
      title: '思贤如渴',
      description: '解锁“思维传导”中的第三个思维导流器',
      cost: n(30825),
      unlocked() {
        return hu('y', 14);
      },
    },
    21: {
      title: '冥思苦想',
      description: '思念指数增加思念获取指数',
      cost: n(66686),
      unlocked() {
        return hu('y', 15);
      },
      effect() {
        let a = player.y.yearning.mul(10).pow(0.3);
        return a;
      },
      effectDisplay() {
        return '+' + format(ue(this.layer, this.id), 3);
      },
    },
    22: {
      title: '三思而行',
      description: '聚变核心的价格÷100',
      cost: n(9995308),
      unlocked() {
        return hu('y', 21);
      },
    },
    23: {
      title: '文思泉涌',
      description: '能量增加思念获取指数',
      cost: n(3.0e8),
      unlocked() {
        return hu('y', 22);
      },
      effect() {
        let a = player.p.energy.max(10).log(10).pow(1.8).div(100);
        return a;
      },
      effectDisplay() {
        return '+' + format(ue(this.layer, this.id), 3);
      },
    },
    24: {
      title: '集思广益',
      description: '思念增加思念计算中的获取指数',
      cost: n(1e10),
      unlocked() {
        return hu('y', 23);
      },
      effect() {
        let a = player.y.points.max(10).log(10).pow(2).div(150);
        if (a.gte(5)) a = a.sub(5).div(100).add(5);
        if (a.gte(500)) a = a.div(500).pow(0.1).mul(500);
        return a;
      },
      effectDisplay() {
        return '+' + format(ue(this.layer, this.id), 3);
      },
    },
    25: {
      title: '深思熟虑',
      description: '解锁“思维传导”中的第四个思维导流器',
      cost: n(5e12),
      unlocked() {
        return hu('y', 24);
      },
    },
    31: {
      title: '忆苦思甜',
      description: '解锁“思维传导”中的第五个思维导流器',
      cost: n(4e13),
      unlocked() {
        return hu('y', 25);
      },
    },
    32: {
      title: '睹物思人',
      description: '解锁“思维传导”中的最后一个思维导流器',
      cost: n(3e14),
      unlocked() {
        return hu('y', 31);
      },
    },
    33: {
      title: '饮水思源',
      description: '能量(超过1e15时)倍增思念获取',
      cost: n(1e16),
      unlocked() {
        return hu('y', 32);
      },
      effect() {
        let a = player.p.energy.div(1e15).max(1).pow(5);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id), 3);
      },
    },
    34: {
      title: '顾名思义',
      description: '思念(超过1e20时)降低思维导流器价格',
      cost: n(1e20),
      unlocked() {
        return hu('y', 33);
      },
      effect() {
        let a = player.y.points.div(1e20).max(1).pow(1.5);
        if (a.gte(1e80)) a = a.div(1e80).pow(0.3).mul(1e80);
        if (a.gte(1e100)) a = a.div(1e100).pow(0.1).mul(1e100);
        return a;
      },
      effectDisplay() {
        return '÷' + format(ue(this.layer, this.id), 3);
      },
    },
    35: {
      title: '见贤思齐',
      description: '每个升级让思念获取翻倍',
      cost: n(1e30),
      unlocked() {
        return hu('y', 34);
      },
      effect() {
        let a = n(2).pow(player.y.upgrades.length);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id), 3);
      },
    },
    41: {
      title: '匪夷所思',
      description: '思念加成思念获取',
      cost: n(1e200),
      unlocked() {
        return hm('n', 9) || hu(this.layer, this.id);
      },
      effect() {
        let a = player.y.points.pow(0.01).max(1);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id), 3);
      },
    },
    42: {
      title: '挖空心思',
      description: '中子素加成能量获取',
      cost: n(1e250),
      unlocked() {
        return hu('y', 41);
      },
      effect() {
        let a = player.n.points.pow(0.7).max(1);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id), 3);
      },
    },
    43: {
      title: '若有所思',
      description: '中子素加成处理器和算力获取',
      cost: n(1e308),
      unlocked() {
        return hu('y', 42);
      },
      effect() {
        let a = player.n.points.pow(0.4).max(1);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id), 3);
      },
    },
    44: {
      title: '莼鲈之思',
      description: '降低中子效果的软上限(^0.2→^0.25)',
      cost: n('1e450'),
      unlocked() {
        return hu('y', 43);
      },
    },
    45: {
      title: '行成于思',
      description: '降低电子和质子效果的软上限(^0.5→^0.6)(^0.3→^0.36)',
      cost: n('1e540'),
      unlocked() {
        return hu('y', 44);
      },
    },
    51: {
      title: '思维涌流 I',
      description: '自动获取白洞，并且受全局速率加成',
      cost: n('e2e8'),
      unlocked() {
        return player.E.buyables[11].gte(6);
      },
    },
    52: {
      title: '思维涌流 II',
      description: '经验乘数增加量受全局速率的0.1次方影响',
      cost: n('ee16'),
      unlocked() {
        return hu('y', 51);
      },
    },
    53: {
      title: '思维涌流 III',
      description: '自动获得希望永续，并且其效果变成原来的平方',
      cost: n('ee50'),
      unlocked() {
        return hu('y', 52);
      },
    },
    54: {
      title: '思维涌流 IV',
      description: '自动进行虫洞扭曲，并且其效果变成原来的平方',
      cost: n('ee308'),
      unlocked() {
        return hu('y', 53);
      },
    },
    55: {
      title: '思维涌流 V',
      description: '思念指数可以突破1，大部分重置真的什么也不重置',
      cost: n('ee20000000'),
      unlocked() {
        return hu('y', 54);
      },
    },
  },
  buyables: {
    11: {
      base() {
        let base = n(2);
        return base;
      },
      cost() {
        let cost = this.base().pow(gba('y', 11).pow(2));
        if (hu('y', 34)) cost = cost.div(ue('y', 34));
        return cost;
      },
      title() {
        return '思维导流器 YC1';
      }, //Yearning Conductor
      display() {
        return (
          '航迹获取指数+' +
          format(this.effect()) +
          '<br>价格：' +
          format(this.cost()) +
          ' 思念<br>数量：' +
          format(gba(this.layer, this.id)) +
          '/' +
          formatWhole(this.purchaseLimit())
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      effect() {
        let eff = n(0.1).mul(gba(this.layer, this.id)).mul(player.y.yearning);
        if (eff.gte(0.5)) eff = eff.sub(0.5).div(10).add(0.5);
        if (inChallenge('e', 13)) eff = n(0);
        return eff;
      },
      buy() {
        if (gba(this.layer, this.id).lt(this.purchaseLimit()) && this.canAfford()) {
          player[this.layer].points = player[this.layer].points.sub(this.cost());
          setBuyableAmount(this.layer, this.id, gba(this.layer, this.id).add(1));
        }
      },
      buyMax() {
        if (!this.canAfford()) return;
        let tempBuy = player.a.points.log(this.base());
        let target = tempBuy.plus(1).floor();
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
      },
      unlocked() {
        return hu('y', 13);
      },
      purchaseLimit() {
        let a = n(50);
        if (hu('E', 32)) a = n(100);
        return a;
      },
      style: { height: '150px' },
    },
    12: {
      base() {
        let base = n(4);
        return base;
      },
      cost() {
        let cost = this.base().pow(gba('y', 12).pow(2));
        if (hu('y', 34)) cost = cost.div(ue('y', 34));
        return cost;
      },
      title() {
        return '思维导流器 YC2';
      }, //Yearning Conductor
      display() {
        return (
          '希望获取指数+' +
          format(this.effect()) +
          '<br>价格：' +
          format(this.cost()) +
          ' 思念<br>数量：' +
          format(gba(this.layer, this.id)) +
          '/' +
          formatWhole(this.purchaseLimit())
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      effect() {
        let eff = n(0.08).mul(gba(this.layer, this.id)).mul(player.y.yearning);
        if (eff.gte(0.5)) eff = eff.sub(0.5).div(10).add(0.5);
        if (inChallenge('e', 13)) eff = n(0);
        return eff;
      },
      buy() {
        if (gba(this.layer, this.id).lt(this.purchaseLimit()) && this.canAfford()) {
          player[this.layer].points = player[this.layer].points.sub(this.cost());
          setBuyableAmount(this.layer, this.id, gba(this.layer, this.id).add(1));
        }
      },
      buyMax() {
        if (!this.canAfford()) return;
        let tempBuy = player.a.points.log(this.base());
        let target = tempBuy.plus(1).floor();
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
      },
      unlocked() {
        return hu('y', 14);
      },
      purchaseLimit() {
        let a = n(50);
        if (hu('E', 32)) a = n(100);
        return a;
      },
      style: { height: '150px' },
    },
    13: {
      base() {
        let base = n(5);
        return base;
      },
      cost() {
        let cost = this.base().pow(gba('y', 13).pow(2));
        if (hu('y', 34)) cost = cost.div(ue('y', 34));
        return cost;
      },
      title() {
        return '思维导流器 YC3';
      }, //Yearning Conductor
      display() {
        return (
          '反物质获取指数+' +
          format(this.effect()) +
          '<br>价格：' +
          format(this.cost()) +
          ' 思念<br>数量：' +
          format(gba(this.layer, this.id)) +
          '/' +
          formatWhole(this.purchaseLimit())
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      effect() {
        let eff = n(0.06).mul(gba(this.layer, this.id)).mul(player.y.yearning);
        if (eff.gte(0.5)) eff = eff.sub(0.5).div(10).add(0.5);
        if (inChallenge('e', 13)) eff = n(0);
        return eff;
      },
      buy() {
        if (gba(this.layer, this.id).lt(this.purchaseLimit()) && this.canAfford()) {
          player[this.layer].points = player[this.layer].points.sub(this.cost());
          setBuyableAmount(this.layer, this.id, gba(this.layer, this.id).add(1));
        }
      },
      buyMax() {
        if (!this.canAfford()) return;
        let tempBuy = player.a.points.log(this.base());
        let target = tempBuy.plus(1).floor();
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
      },
      unlocked() {
        return hu('y', 15);
      },
      purchaseLimit() {
        let a = n(50);
        if (hu('E', 32)) a = n(100);
        return a;
      },
      style: { height: '150px' },
    },
    21: {
      base() {
        let base = n(6);
        return base;
      },
      cost() {
        let cost = this.base().pow(gba('y', 21).pow(2));
        if (hu('y', 34)) cost = cost.div(ue('y', 34));
        return cost;
      },
      title() {
        return '思维导流器 YC4';
      }, //Yearning Conductor
      display() {
        return (
          '虫洞获取指数+' +
          format(this.effect()) +
          '<br>价格：' +
          format(this.cost()) +
          ' 思念<br>数量：' +
          format(gba(this.layer, this.id)) +
          '/' +
          formatWhole(this.purchaseLimit())
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      effect() {
        let eff = n(0.2).mul(gba(this.layer, this.id)).mul(player.y.yearning);
        if (eff.gte(0.5)) eff = eff.sub(0.5).div(10).add(0.5);
        if (inChallenge('e', 13)) eff = n(0);
        return eff;
      },
      buy() {
        if (gba(this.layer, this.id).lt(this.purchaseLimit()) && this.canAfford()) {
          player[this.layer].points = player[this.layer].points.sub(this.cost());
          setBuyableAmount(this.layer, this.id, gba(this.layer, this.id).add(1));
        }
      },
      buyMax() {
        if (!this.canAfford()) return;
        let tempBuy = player.a.points.log(this.base());
        let target = tempBuy.plus(1).floor();
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
      },
      unlocked() {
        return hu('y', 25);
      },
      purchaseLimit() {
        let a = n(50);
        if (hu('E', 32)) a = n(100);
        return a;
      },
      style: { height: '150px' },
    },
    22: {
      base() {
        let base = n(7);
        return base;
      },
      cost() {
        let cost = this.base().pow(gba('y', 22).pow(2));
        if (hu('y', 34)) cost = cost.div(ue('y', 34));
        return cost;
      },
      title() {
        return '思维导流器 YC5';
      }, //Yearning Conductor
      display() {
        return (
          '能量获取指数+' +
          format(this.effect()) +
          '<br>价格：' +
          format(this.cost()) +
          ' 思念<br>数量：' +
          format(gba(this.layer, this.id)) +
          '/' +
          formatWhole(this.purchaseLimit())
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      effect() {
        let eff = n(0.15).mul(gba(this.layer, this.id)).mul(player.y.yearning);
        if (eff.gte(0.5)) eff = eff.sub(0.5).div(10).add(0.5);
        if (inChallenge('e', 13)) eff = n(0);
        return eff;
      },
      buy() {
        if (gba(this.layer, this.id).lt(this.purchaseLimit()) && this.canAfford()) {
          player[this.layer].points = player[this.layer].points.sub(this.cost());
          setBuyableAmount(this.layer, this.id, gba(this.layer, this.id).add(1));
        }
      },
      buyMax() {
        if (!this.canAfford()) return;
        let tempBuy = player.a.points.log(this.base());
        let target = tempBuy.plus(1).floor();
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
      },
      unlocked() {
        return hu('y', 31);
      },
      purchaseLimit() {
        let a = n(50);
        if (hu('E', 32)) a = n(100);
        return a;
      },
      style: { height: '150px' },
    },
    23: {
      base() {
        let base = n(3);
        return base;
      },
      cost() {
        let cost = this.base().pow(gba('y', 23).pow(2));
        if (hu('y', 34)) cost = cost.div(ue('y', 34));
        return cost;
      },
      title() {
        return '思维导流器 YC6';
      }, //Yearning Conductor
      display() {
        return (
          '思念获取指数+' +
          format(this.effect()) +
          '<br>价格：' +
          format(this.cost()) +
          ' 思念<br>数量：' +
          format(gba(this.layer, this.id)) +
          '/' +
          formatWhole(this.purchaseLimit())
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      effect() {
        let eff = n(2.5).mul(gba(this.layer, this.id)).mul(player.y.yearning);
        if (inChallenge('e', 13)) eff = n(0);
        return eff;
      },
      buy() {
        if (gba(this.layer, this.id).lt(this.purchaseLimit()) && this.canAfford()) {
          player[this.layer].points = player[this.layer].points.sub(this.cost());
          setBuyableAmount(this.layer, this.id, gba(this.layer, this.id).add(1));
        }
      },
      buyMax() {
        if (!this.canAfford()) return;
        let tempBuy = player.a.points.log(this.base());
        let target = tempBuy.plus(1).floor();
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
      },
      unlocked() {
        return hu('y', 32);
      },
      purchaseLimit() {
        let a = n(50);
        if (hu('E', 32)) a = n(100);
        return a;
      },
      style: { height: '150px' },
    },
  },
}); //思念 Y

