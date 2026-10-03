// layers.js:6044
addLayer('w', {
  infoboxes: {
    text1: {
      title: '剧情28：温暖于破除混乱(Disorder) I',
      body() {
        return hm('d', 27)
          ? '日志 - 余温新生<br>离开熵的领域后，那些在挑战外缓慢积累的熵并未消散，它们在系统底层沉淀成另一种能量——温暖。<br>不同于熵的混乱，温暖柔和而持续，像星火余温。<br>系统提示：消耗 1e16 熵，可获得 1 温暖。<br>温暖无法直接加速航迹或反物质，但它能激活每一个潜藏却未达峰值的协议。<br>每一行升级都部署了新的形态——不是按行，而是按列<br>第一个缺口来自游戏机制——那个最基础却从未真正满负荷运转的功能。<br>我试着感应升级。屏幕微微一亮，一行字浮现：“第一处混乱已破除——现在，你可以在挑战外获取熵了。”<br>原来，归途的下一段，不是开辟新战场，而是让老伙计们，焕发第二春。'
          : '剧情暂未解锁';
      },
    },
    text2: {
      title: '剧情29：温暖于破除混乱(Disorder) II',
      body() {
        return hm('d', 28)
          ? '日志 - 余温蔓延<br>挑战四与五的大门缓缓开启。<br>在“聚变休眠”中，能量条被冻结成冰，聚变核心无法点燃；在“希望沉寂”里，希望粒子归于寂静，思念却翻倍生长，像黑暗中骤然亮起的星火。<br>我一次次踏入，又一次次退出，带回的不仅是更高的熵值，还有两道被激活的协议。<br>希望层传来回响：“希望共鸣”已上线。它不再是简单的共振，而是能自主增强“希望共振”的强度，让每一次共鸣都掀起更大的波澜。<br>处理器层也亮起绿灯：进阶自动化协议就绪。那些曾经需要我亲手点击的重置，再次交由系统打理，我终于可以抬起头，望向更深的星海。<br>屏幕上的日志自动滚动，像一首无人演奏的乐章。<br>我忽然明白——温暖不是燃料，它是催化剂，让旧有的系统自己长出新芽。'
          : '剧情暂未解锁';
      },
    },
    text3: {
      title: '剧情30：温暖于破除混乱(Disorder) III',
      body() {
        return hm('d', 29)
          ? '日志 - 余温燎原<br>挑战六、七紧随其后。<br>“对数深渊”中，所有数值被压缩成尘埃，又在尘埃里重新凝聚；“三重枷锁”下，EC1、2、3的困境同时降临，我却发现自己已能从容漫步——那些曾令我窒息的限制，如今成了丈量成长的刻度。<br>退出时，系统用数字迎接我：航迹突破1e10000，希望粒子、反物质、思念……每一列数字都像银河般绵长。<br>希望共鸣的效应已强得惊人，每一次共振都让整个层级微微颤抖。<br>而反物质层，那个尘封的第四反应堆终于点亮——它不再单独加成，而是将所有反应堆的效果拧成一股绳，形成完美的增幅闭环。<br>我将温暖注入其中，金色的数据流瞬间淹没屏幕。<br>原来，当温暖足够多时，它可以点燃整艘星舰的潜能。<br>窗外的星光依旧遥远，但我能感觉到，归途正在一寸一寸缩短。'
          : '剧情暂未解锁';
      },
    },
    text4: {
      title: '剧情31：温暖于破除混乱(Disorder) IV',
      body() {
        return hm('d', 30)
          ? '日志 - 余温成焰<br>第八个挑战“永恒轮回”在眼前闭合。<br>那是EC4、5、6的叠加，是沉寂、压缩与归零的极致。我以为自己会被困其中，但挑战精华的出现改变了一切——<br>在挑战内积累的熵，达到阈值后竟能凝结成金色的印记，直接提升能量条的等级。<br>当我走出挑战时，八个能量条都已攀上前所未有的高度，航迹定格在1e13000。<br>450个中子定理在屏幕右上角闪烁，像这一路走来的勋章。<br>系统提示：所有挑战已征服，温暖层圆满。下一层“Yield”的入口，在导航图上浮现。<br>那是收获的时刻——在抵达太阳系之前，最后一次储备。<br>我回头看向温暖层的界面，那些曾经灰暗的升级按钮如今全部点亮，像一簇簇不灭的火焰。<br>原来，从熵的混乱中提炼出的温暖，最终燃成了照亮归途的光。<br>我深吸一口气，点击进入下一层。<br>家的方向，越来越近。'
          : '剧情暂未解锁';
      },
    },
    warmth: {
      title: 'Warmth _ 温暖',
      body() {
        return '温暖(Warmth)，这是游戏中的第八个层级。在挑战外达到1e16熵即可获得温暖，温暖可以被用来购买五行升级，但与其他升级不同的是，这里的升级在大部分情况下是按列顺序购买的，并且每一行升级有固定的主题。另外，在这里会解锁更多熵挑战，并会为前面的层级提供一系列的改动。在这一层级，大部分资源的数量级会急剧增长，准备好了吗？让我们用最热烈的暖意迎接新一层！';
      },
    },
    essence: {
      title: 'Essence _ 挑战精华',
      body() {
        const displayToId = {
          1: 11,
          2: 12,
          3: 13,
          4: 21,
          5: 22,
          6: 23,
          7: 31,
          8: 32,
          9: 33,
        };
        const fullOrder = [4, 2, 5, 3, 1, 6, 7, 8, 9];

        const unlocked = fullOrder.filter((num) => tmp.e?.challenges?.[displayToId[num]]?.unlocked ?? false);

        return `在熵挑战中，如果达到了1e16熵，可以获取对应的挑战精华，加成对应的能量条的等级。一般来说，获取挑战精华的顺序是${unlocked.join('→')}。`;
      },
    },
  },
  name: 'Warmth',
  symbol: 'W',
  position: 2,
  startData() {
    return {
      points: n(0),
      essence: [n(0), n(0), n(0), n(0), n(0), n(0), n(0), n(0), n(0)], //挑战精华
      unlocked() {
        return true;
      },
    };
  },
  color: '#ff5617',
  type: 'normal',
  row: 2,
  requires: n(1e16),
  resource: '温暖',
  baseResource: '熵',
  baseAmount() {
    return player.e.points;
  },
  type: 'normal',
  exponent() {
    return n(0.8);
  },
  gainMult() {
    let mult = n(1);
    if (ce('e', 22).gte(1)) mult = mult.mul(ce('e', 22));
    if (yb(4)) mult = mult.mul(ye(4));
    if (player.e.inChal) mult = n(1);
    return mult;
  },
  gainExp() {
    let exp = n(1);
    if (hu('E', 22)) exp = n(0.1);
    return exp;
  },
  hotkeys: [{ key: 'w', description: '' }],
  layerShown() {
    return hu('d', 23);
  },
  passiveGeneration() {
    mult = n(0);
    if (hu('P', 33)) mult = mult.add(ue('P', 33));
    return mult;
  },
  essence() {
    let a = getResetGain('w');
    if (hm('Y', 6)) a = a.mul(ue('P', 33).max(1));
    if (yb(10)) a = a.mul(ye(10));
    return a;
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
    let challengeIds = [11, 12, 13, 21, 22, 23, 31, 32, 33];
    if (player.e.inChal && hu('w', 23)) {
      for (let i = 0; i < 9; i++) {
        if (inChallenge('e', challengeIds[i])) {
          player.w.essence[i] = player.w.essence[i].add(tmp.w.essence.mul(a));
        }
      }
    }
    if (hu('E', 22)) {
      for (let i = 0; i < 9; i++) {
        player.w.essence[i] = player.w.essence[i].add(tmp.w.essence.mul(a));
      }
    }
  },
  onPrestige() {
    player.e.points = n(0);
  },
  essenceEffect() {
    let a = [n(0), n(0), n(0), n(0), n(0), n(0), n(0), n(0), n(0)];
    for (let i = 0; i < 9; i++) {
      a[i] = player.w.essence[i].max(1).log(2);
    }
    return a;
  },
  doReset(resettingLayer) {
    if (layers[resettingLayer].row > layers[this.layer].row) {
      let kept = ['unlocked', 'auto'];
      let savedEssence = null;
      if (hm('Y', 3)) {
        savedEssence = player.w.essence.map((d) => new Decimal(d));
      }
      if (hm('Y', 0)) kept.push('upgrades');
      layerDataReset(this.layer, kept);
      if (savedEssence) {
        player.w.essence = savedEssence;
      }
    }
  },
  tabFormat: {
    升级: {
      content: [['infobox', 'warmth'], 'main-display', 'prestige-button', 'resource-display', 'blank', 'upgrades'],
    },
    挑战精华: {
      content: [
        ['infobox', 'essence'],
        'main-display',
        'prestige-button',
        'resource-display',
        'blank',
        [
          'display-text',
          function () {
            let a = '';
            let colors = ['#d18282', '#e9ce97', '#f2ec95', '#ade788', '#80e9cd', '#6cadea', '#d17aec', '#a7a7a7', '#ffffff'];
            let imax = 3;
            for (let id = 51; id <= 55; id++) {
              if (hu('w', id)) imax++;
            }
            if (hm('Y', 8)) imax++;
            let t = Math.floor(player.e.activeChallenge / 10 - 1) * 3 + (player.e.activeChallenge % 10) - 1;
            if (player.e.inChal) {
              a = a + "你正在每秒获得 <h2 style='color:" + colors[t] + "; '>" + format(tmp.w.essence) + '</h2> EC' + (t + 1) + '精华<br>';
            }
            for (let i = 0; i < imax; i++) {
              a =
                a +
                "你有 <h2 style='color:" +
                colors[i] +
                "; '>" +
                format(player.w.essence[i]) +
                '</h2> EC' +
                (i + 1) +
                '精华，' +
                (i + 1 > 8 ? '所有' : '') +
                '能量条' +
                (i + 1 > 8 ? '' : i + 1) +
                "的等级 +<h2 style='color:" +
                colors[i] +
                "; '>" +
                format(tmp.w.essenceEffect[i]) +
                '</h2><br>';
            }
            return a;
          },
        ],
      ],
      unlocked() {
        return hu('w', 23);
      },
    },
    剧情: {
      content: ['main-display', 'blank', ['infobox', 'text1'], ['infobox', 'text2'], ['infobox', 'text3'], ['infobox', 'text4']],
    },
  },
  upgrades: {
    11: {
      title: '机制更新 I',
      description: '在挑战外也可以获得熵',
      cost: n(0),
    },
    12: {
      title: '机制更新 II',
      description: 'NS101对简并次数也生效',
      cost: n(10),
      unlocked() {
        return hu('w', 11);
      },
    },
    13: {
      title: '机制更新 III',
      description: '“奇异反应堆”在挑战外也可以购买',
      cost: n(1e15),
      unlocked() {
        return hu('w', 12);
      },
    },
    14: {
      title: '机制更新 IV',
      description: '第五个能量条对“奇异反应堆”也生效，但效果/10',
      cost: n(1e23),
      unlocked() {
        return hu('w', 13);
      },
    },
    15: {
      title: '机制更新 V',
      description: '重置时保留所有处理器升级',
      cost: n(1e33),
      unlocked() {
        return hu('w', 14);
      },
    },
    21: {
      title: '功能扩展 I',
      description: '在希望层级解锁“希望共鸣”<br>(在挑战中无效)',
      tooltip: '其实这一行升级类型和上一行没有什么区别',
      cost: n(15),
      unlocked() {
        return hu('w', 11);
      },
    },
    22: {
      title: '功能扩展 II',
      description: '“物质协议”升级在挑战外也可以购买',
      cost: n(100),
      unlocked() {
        return hu('w', 12) || hu('w', 21);
      },
    },
    23: {
      title: '功能扩展 III',
      description: '解锁新的标签页，如果你在挑战中达到了1e16熵，可以获取挑战精华',
      cost: n(1e18),
      unlocked() {
        return hu('w', 13) || hu('w', 22);
      },
    },
    24: {
      title: '功能扩展 IV',
      description: '在熵挑战中，如果某一项资源对熵的加成小于1，则不受熵指数影响',
      cost: n(1e25),
      unlocked() {
        return hu('w', 14) || hu('w', 23);
      },
    },
    25: {
      title: '功能扩展 V',
      description: '熵的指数加0.5',
      cost: n(1e35),
      unlocked() {
        return hu('w', 15) || hu('w', 24);
      },
    },
    31: {
      title: '游戏体验 I',
      description: '自动购买处理器升级',
      cost: n(50),
      unlocked() {
        return hu('w', 21);
      },
    },
    32: {
      title: '游戏体验 II',
      description: '自动购买中子定理',
      cost: n(1e6),
      unlocked() {
        return hu('w', 22) || hu('w', 31);
      },
    },
    33: {
      title: '游戏体验 III',
      description: '在挑战中，仍然保留自动购买升级',
      cost: n(1e19),
      unlocked() {
        return hu('w', 23) || hu('w', 32);
      },
    },
    34: {
      title: '游戏体验 IV',
      description: '自动购买“奇异反应堆”',
      cost: n(1e27),
      unlocked() {
        return hu('w', 24) || hu('w', 33);
      },
    },
    35: {
      title: '游戏体验 V',
      description: '“希望共鸣”的效果始终处于最大值',
      cost: n(1e40),
      unlocked() {
        return hu('w', 25) || hu('w', 34);
      },
    },
    41: {
      title: '资源加成 I',
      description: '每个温暖升级使熵的指数加0.1',
      effect() {
        let a = n(0.1).mul(player.w.upgrades.length);
        return a;
      },
      effectDisplay() {
        return '+' + format(ue(this.layer, this.id));
      },
      cost: n(150),
      unlocked() {
        return hu('w', 31);
      },
    },
    42: {
      title: '资源加成 II',
      description: '如果所有中子研究都已被购买，则剩余的中子定理倍增中子素和简并次数获取',
      effect() {
        let a = n(1);
        if (player.n.theorems.add(87).lte(gba('n', 11).add(gba('n', 12)).add(gba('n', 13)).add(gba('n', 14)))) a = n(1.2).pow(player.n.theorems);
        //用lte为了避免后续两个数值都很大，超出浮点数
        if (a.gte(10)) a = a.div(10).pow(0.1).mul(10);
        if (a.gte(1e4)) a = a.div(1e4).pow(0.1).mul(1e4);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id));
      },
      cost: n(1e7),
      unlocked() {
        return hu('w', 32) || hu('w', 41);
      },
    },
    43: {
      title: '资源加成 III',
      description: '弱化“希望共鸣”效果超过3时的软上限',
      cost: n(1e20),
      unlocked() {
        return hu('w', 33) || hu('w', 42);
      },
    },
    44: {
      title: '资源加成 IV',
      description: '弱化1e40能量的软上限(^0.1→^0.12)',
      cost: n(1e29),
      unlocked() {
        return hu('w', 34) || hu('w', 43);
      },
    },
    45: {
      title: '资源加成 V',
      description: '弱化1e1000思念的软上限',
      cost: n(1e41),
      unlocked() {
        return hu('w', 35) || hu('w', 44);
      },
    },
    51: {
      title: '解锁挑战 I',
      description: '解锁第四个熵挑战',
      cost: n(1e8),
      unlocked() {
        return hu('w', 41);
      },
    },
    52: {
      title: '解锁挑战 II',
      description: '解锁第五个熵挑战',
      cost: n(1e10),
      unlocked() {
        return hu('w', 42) || hu('w', 51);
      },
    },
    53: {
      title: '解锁挑战 III',
      description: '解锁第六个熵挑战',
      cost: n(1e21),
      unlocked() {
        return hu('w', 43) || hu('w', 52);
      },
    },
    54: {
      title: '解锁挑战 IV',
      description: '解锁第七个熵挑战',
      cost: n(1e30),
      unlocked() {
        return hu('w', 44) || hu('w', 53);
      },
    },
    55: {
      title: '解锁挑战 V',
      description: '解锁第八个熵挑战<br>解锁一个距离升级',
      cost: n(1e44),
      unlocked() {
        return hu('w', 45) || hu('w', 54);
      },
    },
    61: {
      title: '走进小行星带',
      description: '经验乘数增加量乘以产量结晶数量',
      cost: n('1e100000'),
      unlocked() {
        return player.E.buyables[11].gte(8);
      },
    },
    62: {
      title: '健神星',
      description: '削弱资源倍率ee10000000的软上限',
      cost: n('ee19'),
      unlocked() {
        return hu('w', 61);
      },
    },
    63: {
      title: '灶神星',
      description: '熵指数变成原来的10倍',
      cost: n('ee27'),
      unlocked() {
        return hu('w', 62);
      },
    },
    64: {
      title: '智神星',
      description: '经验乘数增加量变成原来的10次方',
      cost: n('ee36'),
      unlocked() {
        return hu('w', 63);
      },
    },
    65: {
      title: '谷神星',
      description: '经验乘数增加量变成原来的20次方',
      cost: n('ee40'),
      unlocked() {
        return hu('w', 64);
      },
    },
  },
}); //温暖 W

