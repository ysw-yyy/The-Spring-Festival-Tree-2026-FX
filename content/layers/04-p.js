// layers.js:2259
addLayer('p', {
  infoboxes: {
    text1: {
      title: '剧情8: 能量于稳态调和(Equilibrium) I',
      body() {
        return hm('d', 7)
          ? '日志 - 协议转换<br>反物质流在约束场中达到临界密度。<br>执行最终指令：将所有储备注入“聚变点火协议”。<br>确认。<br>刹那间，前两层系统——希望的暖光与反物质的幽蓝——如潮水般褪去、归零。控制台陷入短暂的黑寂，仿佛宇宙深吸了一口气。<br>然后，它诞生了。<br>一点纯白、稳定、令人心安的辉光，在核心舱中央亮起。第一座聚变核心。它不像反物质那样危险嘶鸣，只是持续地、温和地辐射出磅礴而驯服的能量。<br>我感受到了前所未有的“力量”。这是一种扎实、可依赖的根基之力。<br>然而，飞船的原始系统传来反馈：这股能量过于平稳、过于庞大，现有的单一通道无法充分发挥其全部潜能。它需要一个更精密的导流网络，将其分配到不同的子系统，才能将这份“稳定”转化为“超越”的动力。<br>能量，已然就位。<br>下一阶段的蓝图，随之展开：我需要在这份稳定的丰饶中，构建一个最优的分配矩阵。<br>系统提示：“能量导流网络” 已上线。等待架构配置。'
          : '剧情暂未解锁';
      },
    },
    text2: {
      title: '剧情9: 能量于稳态调和(Equilibrium) II',
      body() {
        return hm('d', 8)
          ? '日志 - 初始导流<br>三条能量通道已激活。<br>第一束能量注入导航核心。航迹的计量标尺被重新校准，每一段记录都承载了更深的时空重量。<br>第二束能量汇入生态循环。希望粒子的生灭节律变得稳定而迅捷，如同被赋予了更坚定的意志。<br>第三束能量反馈给星际燃料。那团纯白辉光的脉动，传来了更深沉有力的搏动。<br>一个最简的三角回路开始运转。飞船系统的“生命体征”正变得强健而沉稳。<br>能量，成了调节律动的血液。<br>系统提示：初级稳态达成。网络待命，等待更复杂的协同。'
          : '剧情暂未解锁';
      },
    },
    text3: {
      title: '剧情10: 能量于稳态调和(Equilibrium) III',
      body() {
        return hm('d', 9)
          ? '日志 - 网络扩张<br>第四个聚变核心上线，能量流迎来了阶跃。<br>“希望共振”协议被激活——不再是零星的火花，而是持续的光谱。希望粒子的产生，变成了呼吸般自然的背景节律。<br>曾经稀缺如珍宝的虫洞坐标，如今在充裕能量的扫描下，显露出庞大的集群。它们不再是需要精打细算的冒险，而是可以规划开采的丰饶矿脉。<br>反应堆的上限闸门被一道道冲开。约束场的轰鸣声已连成一片低沉而持续的和弦，湮灭的幽蓝光芒稳定得如同另一种形态的日光。<br>能量网络自我增衍，寻找着新的平衡态。丰饶，带来了新的问题：如何分配，如何优化，如何将几何级数增长的能量，转化为指向家园的、绝对精准的矢量。<br>系统提示：稳态，从来不是静止。它是一种动态的、不断扩张的秩序。'
          : '剧情暂未解锁';
      },
    },
    text4: {
      title: '剧情11: 能量于稳态调和(Equilibrium) IV',
      body() {
        return hm('d', 10)
          ? '日志 - 盈余质变<br>能量网络的产出已稳定超过所有已知消耗。那些无法被及时导流的能量，在储备回路中积聚、盈余，发出近乎白噪的微弱嗡鸣。<br>我意识到，纯粹的“分配”已触及瓶颈。当资源本身成为需要被管理的负担时，我需要的不再是更粗的管道，而是一个能理解所有管道、并自行决定阀门开合的智能。<br>我将盈余的能量，导向一个全新的区域。它们不再注入任何增长性的模块，而是开始构筑一种静默的、结晶般的逻辑单元阵列。每一个单元，都是一个问题求解器。<br>它们开始运作了。一种被命名为“处理通量”的抽象资源，如同思维的节拍，在阵列中诞生并流转。我看不见它，但能通过结果感知：希望粒子的收集开始在没有我干预的间隙中持续发生；基础升级的采购序列被自动排列与执行。<br>我从驾驶员，开始向监理者过渡。处理器阵列接管了“繁荣”本身的管理学。而我的任务，变成了为这个正在学会思考的系统，设定更高阶的目标——例如，家的方向。<br>系统提示：能量网络负载已达新阈值，‘处理器核心’初始化协议已在队列中就绪'
          : '剧情暂未解锁';
      },
    },
    power: {
      title: 'Power _ 聚变核心',
      body() {
        return '聚变核心(Power)，这是游戏中的第三个层级。虽然它会重置前两个层级的所有内容，但里程碑的效果会让这些操作更简单。另外，聚变核心还会生产能量，详见另一个标签页。';
      },
    },
    energy: {
      title: 'Energy _ 能量',
      body() {
        return '能量(Energy)，这是聚变核心的主产物，随时间增长的同时，也可以被一些升级效果增加获取。能量可以被用来购买升级和填充能量条，能量条会促进前面的各种资源的获取。注：能量获取量超过1e10每秒和1e40每秒的时候，增长会大大降低';
      },
    },
    energyDetailed: {
      title: 'Energy _ 能量',
      body() {
        return '在填充能量时，对应能量条填入的能量数量会增加，并自动计算为等级，如果这一个条填满了，填入的能量数量不会减少，但下一个等级的要求增大。在后续解锁小数等级时，注意等级的计算是通过对数计算的，而能量条的计算是线性的，也就是说等级是0.5时，能量条的进度不是50%，但等级是1的时候，能量条的进度一定是100%。具体的计算规则比较复杂，而且经过了修改，但是对于游戏体验应该不会有什么影响，如有问题，欢迎指出';
      },
    },
  },
  name: 'power',
  symbol: 'P',
  position: 0,
  startData() {
    return {
      unlocked() {
        return true;
      },
      points: n(0),
      energy: n(0),
      energyDrain: [n(0), n(0), n(0), n(0), n(0), n(0), n(0), n(0)], //对应的能量条投入的能量
      energyLevel: [n(0), n(0), n(0), n(0), n(0), n(0), n(0), n(0)],
      //在新版本的更新中，energyDrain改为累计投入的能量，并且带实数的等级，从原来的线性运算改为了对数运算，可能对游戏有细微的影响
    };
  },
  color: '#fddd08',
  requires: function () {
    let req = n(1e15);
    if (hu('a', 53)) req = req.div(ue('a', 53));
    return req;
  },
  resource: '聚变核心',
  baseResource: '反物质',
  baseAmount() {
    return player.a.points;
  },
  type: 'static',
  exponent() {
    return n(2);
  },
  base: n(10),
  gainMult() {
    let a = n(1);
    if (hu('p', 24) && !hu('a', 53)) a = a.div(tmp.p.energyEffect[6]);
    if (hu('y', 22)) a = a.div(100);
    if (inChallenge('e', 21)) a = n(1 / 0);
    return a;
  },
  gainExp() {
    let exp = n(1);
    return exp;
  },
  directMult() {
    let mult = n(1);
    return mult;
  },
  row: 1,
  hotkeys: [
    {
      key: 'p',
      description: '注意：部分层级没有重置功能，那么对应的快捷键无效',
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  resetsNothing() {
    return hm('n', 3);
  },
  energy() {
    let t = n(2);
    if (hm('p', 3)) t = t.add(player.p.points.mul(0.1));
    if (hu('P', 22)) t = t.add(ue('P', 22));

    let a = n(t).pow(player.p.points).sub(1);

    if (hm('n', 0)) a = a.add(1);

    // 普通乘法升级列表（效果直接用 ue 获取）
    const ordinaryMultipliers = [
      ['a', 31],
      ['a', 43],
      ['p', 35],
      ['y', 42],
      ['n', 42],
      ['n', 61],
      ['n', 71],
      ['n', 81],
      ['n', 91],
    ];

    for (let [layer, id] of ordinaryMultipliers) {
      if (hu(layer, id)) {
        a = a.mul(ue(layer, id));
      }
    }

    if (hu('p', 14)) a = a.mul(tmp.p.energyEffect[3]);
    if (hm('p', 9)) a = a.mul(tmp.a.proton);
    if (ce('e', 21).gte(1)) a = a.mul(ce('e', 21));
    if (yb(6)) a = a.mul(ye(6));

    if (player.n.mult.gte(0)) a = a.mul(player.n.mult);

    if (hu('y', 31)) a = a.pow(n(1).add(be('y', 22)));
    if (yb(28)) a = a.pow(ye(28));

    // 软上限
    let e = n(0.3);
    let e2 = n(0.1);
    if (hm('p', 8)) e = n(0.5);
    if (hu('w', 44)) e2 = n(0.12);
    if (a.gte(1e10)) a = a.div(1e10).pow(e).mul(1e10);
    if (a.gte(1e40)) a = a.div(1e40).pow(e2).mul(1e40);
    if (a.gte(1e150)) a = a.div(1e150).pow(0.4).mul(1e150);

    return a;
  },
  energyLevelBase() {
    let level = [n(2), n(3), n(5), n(6), n(4), n(7), n(8), n(10)];
    return level;
  },
  energyLevelNext() {
    const next = [];
    for (let i = 0; i < 8; i++) {
      let targetLevel = player.p.energyLevel[i].floor();
      if (targetLevel.gte(0)) targetLevel = targetLevel.plus(1);
      if (inChallenge('e', 21)) targetLevel = targetLevel.add(40);
      targetLevel = targetLevel.sub(tmp.w.essenceEffect[i]);
      targetLevel = targetLevel.sub(tmp.w.essenceEffect[8]);
      const totalForTarget = getTotalEnergyFromLevel(i, targetLevel);
      next.push(totalForTarget.max(0));
    }
    return next;
  },
  energyEffect() {
    const effect = [];
    for (let i = 0; i < 8; i++) {
      // 确定基础指数（等级）
      let exp = player.p.energyLevel[i].floor(); // 整数等级

      // p31 增强：每整个等级效果增加20%（即整数指数乘以1.2）
      if (hu('p', 31)) {
        exp = exp.mul(1.2);
      }

      if (hm('p', 5) && i !== 4 && i !== 6) exp = exp.add(player.p.energyLevel[i].sub(player.p.energyLevel[i].floor()));

      // 计算效果值
      if (i === 4) {
        // 能量条5特殊：效果 = 等级本身
        let val = exp;
        if (!hu('p', 34)) val = val.floor();
        else val = val.ceil();
        effect[i] = val;
      } else {
        // 其他条用底数的指数幂
        const baseMap = [1.5, 1.35, 1.25, 1.6, 0, 1.8, 1.4, 1.2];
        effect[i] = n(baseMap[i]).pow(exp);
      }
    }

    // 后续特殊处理
    if (hu('P', 23)) effect[7] = effect[7].pow(1.5);
    if (hm('P', 4)) effect[7] = effect[7].pow(1.2);
    if (inChallenge('e', 12)) {
      for (let i = 0; i < 8; i++) {
        effect[i] = i === 4 ? n(0) : n(1);
      }
    }
    return effect;
  },
  deactivated() {
    return hu('At', 11);
  },
  update(diff) {
    let a = diff;
    if (a > 1e299) a = n(player.devSpeed).div(20);
    if (!inChallenge('e', 21)) player.p.energy = player.p.energy.add(tmp.p.energy.mul(a));
    if (inChallenge('e', 21) && player.p.energy.lt(1e15)) player.p.energy = player.p.energy.add(tmp.p.energy.mul(a)).min(1e15);
    if (hm('p', 2) && player.a.upgrades.indexOf(32) == -1) player.a.upgrades.push(32);
    for (let i = 0; i < 8; i++) {
      player.p.energyLevel[i] = tmp.p.energyLevelCalculate[i];
    }
  },
  energyLevelCalculate() {
    let a = [n(0), n(0), n(0), n(0), n(0), n(0), n(0), n(0)];
    for (let i = 0; i < 8; i++) {
      a[i] = getLevelFromTotalEnergy(i, player.p.energyDrain[i]).max(0);
      if (inChallenge('e', 21)) a[i] = a[i].sub(40).min(-15);
      a[i] = a[i].add(tmp.w.essenceEffect[i]);
      a[i] = a[i].add(tmp.w.essenceEffect[8]);
    }
    return a;
  },
  autoPrestige() {
    return hm('n', 5) && player.n.auto;
  },
  canBuyMax() {
    return hm('Y', 12);
  },
  automate() {
    if (hm('n', 7) && player.n.auto3 && player.devSpeed.gt(0)) layers.p.clickables[31].onClick();
  },
  onPrestige() {
    if (!hu('n', 33) || !hu('y', 55)) {
      player.a.electron = n(0);
      player.a.proton = n(0);
      player.a.neutron = n(0);
    }
  },
  doReset(resettingLayer) {
    if (layers[resettingLayer].row > layers[this.layer].row) {
      let kept = ['unlocked', 'auto'];
      if (hm('n', 4) || hm('Y', 0)) kept.push('upgrades');
      if (hm('n', 6) || hm('Y', 2)) kept.push('milestones');
      if (hm('n', 13) && !player.e.inChal) kept.push('points');
      layerDataReset(this.layer, kept);
    }
  },
  layerShown() {
    return hu('d', 13);
  },
  tabFormat: {
    聚变核心: {
      content: [
        ['infobox', 'power'],
        'main-display',
        [
          'display-text',
          function () {
            return (
              "你有 <h2 style='color:#e6d10a; '>" +
              format(player.p.energy) +
              "</h2> 能量，每秒增加 <h2 style='color:#e6d10a; '>" +
              format(tmp.p.energy)
            );
          },
        ],
        'blank',
        'prestige-button',
        'resource-display',
        'milestones',
        'blank',
      ],
    },
    能量: {
      content: [
        ['infobox', 'energy'],
        'main-display',
        [
          'display-text',
          function () {
            return (
              "你有 <h2 style='color:#e6d10a; '>" +
              format(player.p.energy) +
              "</h2> 能量，每秒增加 <h2 style='color:#e6d10a; '>" +
              format(tmp.p.energy)
            );
          },
        ],
        'blank',
        'prestige-button',
        'resource-display',
        ['bar', 'energy1'],
        ['bar', 'energy2'],
        ['bar', 'energy3'],
        ['bar', 'energy4'],
        ['bar', 'energy5'],
        ['bar', 'energy6'],
        ['bar', 'energy7'],
        ['bar', 'energy8'],
        'blank',
        'clickables',
        'upgrades',
      ],
    },
    剧情: {
      content: ['main-display', 'blank', ['infobox', 'text1'], ['infobox', 'text2'], ['infobox', 'text3'], ['infobox', 'text4']],
    },
  },
  milestones: {
    0: {
      requirementDescription: 'PM1: 获得 1 聚变核心',
      done() {
        return player.p.points.gte(1);
      },
      effectDescription: '解锁“能量”，聚变核心会自动生产能量',
    },
    1: {
      requirementDescription: 'PM2: 获得 2 聚变核心',
      done() {
        return player.p.points.gte(2);
      },
      effectDescription: '每秒钟额外自动凝聚希望30次，解锁新的反物质升级',
    },
    2: {
      requirementDescription: 'PM3: 获得 3 聚变核心',
      done() {
        return player.p.points.gte(3);
      },
      effectDescription: '解锁“希望共振”，反物质升级“虫洞过载”始终生效',
    },
    3: {
      requirementDescription: 'PM4: 获得 4 聚变核心',
      done() {
        return player.p.points.gte(4);
      },
      effectDescription: '增强聚变核心对能量的生产公式<br>(2^聚变核心-1)→(2+0.1×聚变核心)^(聚变核心)-1',
    },
    4: {
      requirementDescription: 'PM5: 获得 5 聚变核心',
      done() {
        return player.p.points.gte(5);
      },
      effectDescription: '解锁更多反物质升级',
    },
    5: {
      requirementDescription: 'PM6: 获得 6 聚变核心',
      done() {
        return player.p.points.gte(6);
      },
      effectDescription: '解锁下一个算力升级，能量条可以拥有“小数”等级（但能量条5和7按照向下取整计算）',
    },
    6: {
      requirementDescription: 'PM7: 获得 7 聚变核心',
      done() {
        return player.p.points.gte(7);
      },
      effectDescription: '算力获取乘以聚变核心数量',
    },
    7: {
      requirementDescription: 'PM8: 获得 8 聚变核心',
      done() {
        return player.p.points.gte(8);
      },
      effectDescription: '解锁下一个算力升级',
    },
    8: {
      requirementDescription: 'PM9: 获得 9 聚变核心',
      done() {
        return player.p.points.gte(9);
      },
      effectDescription: '弱化1e10能量的软上限（^0.3→^0.5），并且解锁新的能量升级',
    },
    9: {
      requirementDescription: 'PM10: 获得 10 聚变核心',
      done() {
        return player.p.points.gte(10);
      },
      effectDescription: '在反物质界面解锁“湮灭虫洞”',
    },
    10: {
      requirementDescription: 'PM11: 获得 11 聚变核心',
      done() {
        return player.p.points.gte(11);
      },
      effectDescription: '第八个能量条对思念也生效',
    },
    11: {
      requirementDescription: 'PM12: 获得 12 聚变核心',
      done() {
        return player.p.points.gte(12);
      },
      effectDescription: '解锁一个距离升级',
    },
    12: {
      requirementDescription: 'PM13: 获得 13 聚变核心',
      done() {
        return player.p.points.gte(13);
      },
      effectDescription: '无奖励',
    },
  },
  bars: {
    energy1: {
      direction: RIGHT,
      width: 600,
      height: 36,
      fillStyle: { 'background-color': '#632525' },
      display() {
        let a = player.p.energyLevel[0].floor();
        if (hm('p', 5)) a = player.p.energyLevel[0];
        return (
          '[能量条1] 等级:' +
          format(a) +
          ' 能量:' +
          format(player.p.energyDrain[0]) +
          '/' +
          format(tmp.p.energyLevelNext[0]) +
          ' 效果: 航迹×' +
          format(tmp.p.energyEffect[0])
        );
      },
      progress() {
        let a = player.p.energyDrain[0].div(tmp.p.energyLevelNext[0]);
        if (a.gt(1)) a = n(1);
        return a;
      },
      unlocked() {
        return hu('p', 11);
      },
    },
    energy2: {
      direction: RIGHT,
      width: 600,
      height: 36,
      fillStyle: { 'background-color': '#745619' },
      display() {
        let a = player.p.energyLevel[1].floor();
        if (hm('p', 5)) a = player.p.energyLevel[1];
        return (
          '[能量条2] 等级:' +
          format(a) +
          ' 能量:' +
          format(player.p.energyDrain[1]) +
          '/' +
          format(tmp.p.energyLevelNext[1]) +
          ' 效果: 希望粒子×' +
          format(tmp.p.energyEffect[1])
        );
      },
      progress() {
        let a = player.p.energyDrain[1].div(tmp.p.energyLevelNext[1]);
        if (a.gt(1)) a = n(1);
        return a;
      },
      unlocked() {
        return hu('p', 12);
      },
    },
    energy3: {
      direction: RIGHT,
      width: 600,
      height: 36,
      fillStyle: { 'background-color': '#9b9313' },
      display() {
        let a = player.p.energyLevel[2].floor();
        if (hm('p', 5)) a = player.p.energyLevel[2];
        return (
          '[能量条3] 等级:' +
          format(a) +
          ' 能量:' +
          format(player.p.energyDrain[2]) +
          '/' +
          format(tmp.p.energyLevelNext[2]) +
          ' 效果: 反物质×' +
          format(tmp.p.energyEffect[2])
        );
      },
      progress() {
        let a = player.p.energyDrain[2].div(tmp.p.energyLevelNext[2]);
        if (a.gt(1)) a = n(1);
        return a;
      },
      unlocked() {
        return hu('p', 13);
      },
    },
    energy4: {
      direction: RIGHT,
      width: 600,
      height: 36,
      fillStyle: { 'background-color': '#529d22' },
      display() {
        let a = player.p.energyLevel[3].floor();
        if (hm('p', 5)) a = player.p.energyLevel[3];
        return (
          '[能量条4] 等级:' +
          format(a) +
          ' 能量:' +
          format(player.p.energyDrain[3]) +
          '/' +
          format(tmp.p.energyLevelNext[3]) +
          ' 效果: 能量×' +
          format(tmp.p.energyEffect[3])
        );
      },
      progress() {
        let a = player.p.energyDrain[3].div(tmp.p.energyLevelNext[3]);
        if (a.gt(1)) a = n(1);
        return a;
      },
      unlocked() {
        return hu('p', 14);
      },
    },
    energy5: {
      direction: RIGHT,
      width: 600,
      height: 36,
      fillStyle: { 'background-color': '#117258' },
      display() {
        let a = player.p.energyLevel[4].floor();
        if (hm('p', 5)) a = player.p.energyLevel[4];
        return (
          '[能量条5] 等级:' +
          format(a) +
          ' 能量:' +
          format(player.p.energyDrain[4]) +
          '/' +
          format(tmp.p.energyLevelNext[4]) +
          ' 效果: 反应堆上限+' +
          format(tmp.p.energyEffect[4])
        );
      },
      progress() {
        let a = player.p.energyDrain[4].div(tmp.p.energyLevelNext[4]);
        if (a.gt(1)) a = n(1);
        return a;
      },
      unlocked() {
        return hu('p', 15);
      },
    },
    energy6: {
      direction: RIGHT,
      width: 600,
      height: 36,
      fillStyle: { 'background-color': '#114372' },
      display() {
        let a = player.p.energyLevel[5].floor();
        if (hm('p', 5)) a = player.p.energyLevel[5];
        return (
          '[能量条6] 等级:' +
          format(a) +
          ' 能量:' +
          format(player.p.energyDrain[5]) +
          '/' +
          format(tmp.p.energyLevelNext[5]) +
          ' 效果: 虫洞获取量×' +
          format(tmp.p.energyEffect[5])
        );
      },
      progress() {
        let a = player.p.energyDrain[5].div(tmp.p.energyLevelNext[5]);
        if (a.gt(1)) a = n(1);
        return a;
      },
      unlocked() {
        return hu('p', 21);
      },
    },
    energy7: {
      direction: RIGHT,
      width: 600,
      height: 36,
      fillStyle: { 'background-color': '#5b1172' },
      display() {
        let a = player.p.energyLevel[6].floor();
        if (hm('p', 5)) a = player.p.energyLevel[6];
        return (
          '[能量条7] 等级:' +
          format(a) +
          ' 能量:' +
          format(player.p.energyDrain[6]) +
          '/' +
          format(tmp.p.energyLevelNext[6]) +
          ' 效果: 能量条价格÷' +
          format(tmp.p.energyEffect[6])
        );
      },
      progress() {
        let a = player.p.energyDrain[6].div(tmp.p.energyLevelNext[6]);
        if (a.gt(1)) a = n(1);
        return a;
      },
      unlocked() {
        return hu('p', 22);
      },
    },
    energy8: {
      direction: RIGHT,
      width: 600,
      height: 36,
      fillStyle: { 'background-color': '#2f2f2f' },
      display() {
        let a = player.p.energyLevel[7].floor();
        if (hm('p', 5)) a = player.p.energyLevel[7];
        return (
          '[能量条8] 等级:' +
          format(a) +
          ' 能量:' +
          format(player.p.energyDrain[7]) +
          '/' +
          format(tmp.p.energyLevelNext[7]) +
          ' 效果: 算力×' +
          format(tmp.p.energyEffect[7])
        );
      },
      progress() {
        let a = player.p.energyDrain[7].div(tmp.p.energyLevelNext[7]);
        if (a.gt(1)) a = n(1);
        return a;
      },
      unlocked() {
        return hu('p', 23);
      },
    },
  },
  upgrades: {
    11: {
      title: '多彩填充',
      description: '解锁第一个能量条',
      cost: n(1),
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    12: {
      title: '缤纷填充',
      description: '解锁第二个能量条',
      cost: n(10),
      unlocked() {
        return hu('p', 11);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    13: {
      title: '绚丽填充',
      description: '解锁第三个能量条',
      cost: n(100),
      unlocked() {
        return hu('p', 12);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    14: {
      title: '灿烂填充',
      description: '解锁第四个能量条',
      cost: n(1000),
      unlocked() {
        return hu('p', 13);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    15: {
      title: '华美填充',
      description: '解锁第五个能量条',
      cost: n(10000),
      unlocked() {
        return hu('p', 14);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    21: {
      title: '璀璨填充',
      description: '解锁第六个能量条',
      cost: n(100000),
      unlocked() {
        return hu('p', 15);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    22: {
      title: '灵动填充',
      description: '解锁第七个能量条',
      cost: n(1000000),
      unlocked() {
        return hu('p', 21);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    23: {
      title: '终极填充',
      description: '解锁最后一个能量条',
      cost: n(10000000),
      unlocked() {
        return hu('p', 22);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    24: {
      title: '极限填充',
      description: '第七个能量条对聚变核心价格也生效',
      cost: n(1e8),
      unlocked() {
        return hu('p', 23);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    25: {
      title: '疯狂填充',
      description: '第八个能量条对处理器获取也生效',
      cost: n(1e9),
      unlocked() {
        return hu('p', 24);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    31: {
      title: '离谱填充',
      description: '每一整个能量等级效果增强20%',
      tooltip: '即等级从0.99到1时，相当于从0.69到0.9',
      cost: n(1e10),
      unlocked() {
        return hu('p', 25);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    32: {
      title: '速度填充',
      description: '你可以同时填充8个能量条',
      cost: n(1e11),
      unlocked() {
        return hu('p', 31);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    33: {
      title: '神秘填充',
      description: '同时填充八个能量条的速度加快，并且减少同时填充时消耗的能量数量',
      cost: n(1e12),
      unlocked() {
        return hu('p', 32);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    34: {
      title: '改良填充',
      description: '第五个能量条的效果从向下取整改为向上取整',
      cost: n(1e13),
      unlocked() {
        return hm('p', 8) || hu(this.layer, this.id);
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
    35: {
      title: '精密填充',
      description: '每个能量升级让能量获取×1.25',
      cost: n(1e14),
      unlocked() {
        return hu('p', 34);
      },
      effect() {
        let a = n(1.25).pow(player.p.upgrades.length);
        return a;
      },
      effectDisplay() {
        return '×' + format(ue(this.layer, this.id));
      },
      currencyDisplayName: '能量',
      currencyInternalName: 'energy',
      currencyLayer: 'p',
    },
  },
  clickables: {
    11: {
      title() {
        return '填充能量条1';
      },
      display() {
        return '点击或按住以填充' + format(player.p.energy.div(10)) + '能量';
      },
      onHold() {
        player.p.energyDrain[0] = player.p.energyDrain[0].add(player.p.energy.mul(0.1));
        if (!hm('n', 8)) player.p.energy = player.p.energy.mul(0.9);
      },
      onClick() {
        this.onHold();
      },
      canClick() {
        return true;
      },
      unlocked() {
        return hu('p', 11);
      },
    },
    12: {
      title() {
        return '填充能量条2';
      },
      display() {
        return '点击或按住以填充' + format(player.p.energy.div(10)) + '能量';
      },
      onHold() {
        player.p.energyDrain[1] = player.p.energyDrain[1].add(player.p.energy.mul(0.1));
        if (!hm('n', 8)) player.p.energy = player.p.energy.mul(0.9);
      },
      onClick() {
        this.onHold();
      },
      canClick() {
        return true;
      },
      unlocked() {
        return hu('p', 12);
      },
    },
    13: {
      title() {
        return '填充能量条3';
      },
      display() {
        return '点击或按住以填充' + format(player.p.energy.div(10)) + '能量';
      },
      onHold() {
        player.p.energyDrain[2] = player.p.energyDrain[2].add(player.p.energy.mul(0.1));
        if (!hm('n', 8)) player.p.energy = player.p.energy.mul(0.9);
      },
      onClick() {
        this.onHold();
      },
      canClick() {
        return true;
      },
      unlocked() {
        return hu('p', 13);
      },
    },
    14: {
      title() {
        return '填充能量条4';
      },
      display() {
        return '点击或按住以填充' + format(player.p.energy.div(10)) + '能量';
      },
      onHold() {
        player.p.energyDrain[3] = player.p.energyDrain[3].add(player.p.energy.mul(0.1));
        if (!hm('n', 8)) player.p.energy = player.p.energy.mul(0.9);
      },
      onClick() {
        this.onHold();
      },
      canClick() {
        return true;
      },
      unlocked() {
        return hu('p', 14);
      },
    },
    21: {
      title() {
        return '填充能量条5';
      },
      display() {
        return '点击或按住以填充' + format(player.p.energy.div(10)) + '能量';
      },
      onHold() {
        player.p.energyDrain[4] = player.p.energyDrain[4].add(player.p.energy.mul(0.1));
        if (!hm('n', 8)) player.p.energy = player.p.energy.mul(0.9);
      },
      onClick() {
        this.onHold();
      },
      canClick() {
        return true;
      },
      unlocked() {
        return hu('p', 15);
      },
    },
    22: {
      title() {
        return '填充能量条6';
      },
      display() {
        return '点击或按住以填充' + format(player.p.energy.div(10)) + '能量';
      },
      onHold() {
        player.p.energyDrain[5] = player.p.energyDrain[5].add(player.p.energy.mul(0.1));
        if (!hm('n', 8)) player.p.energy = player.p.energy.mul(0.9);
      },
      onClick() {
        this.onHold();
      },
      canClick() {
        return true;
      },
      unlocked() {
        return hu('p', 21);
      },
    },
    23: {
      title() {
        return '填充能量条7';
      },
      display() {
        return '点击或按住以填充' + format(player.p.energy.div(10)) + '能量';
      },
      onHold() {
        player.p.energyDrain[6] = player.p.energyDrain[6].add(player.p.energy.mul(0.1));
        if (!hm('n', 8)) player.p.energy = player.p.energy.mul(0.9);
      },
      onClick() {
        this.onHold();
      },
      canClick() {
        return true;
      },
      unlocked() {
        return hu('p', 22);
      },
    },
    24: {
      title() {
        return '填充能量条8';
      },
      display() {
        return '点击或按住以填充' + format(player.p.energy.div(10)) + '能量';
      },
      onHold() {
        player.p.energyDrain[7] = player.p.energyDrain[7].add(player.p.energy.mul(0.1));
        if (!hm('n', 8)) player.p.energy = player.p.energy.mul(0.9);
      },
      onClick() {
        this.onHold();
      },
      canClick() {
        return true;
      },
      unlocked() {
        return hu('p', 23);
      },
    },
    31: {
      title() {
        return '填充所有能量条';
      },
      display() {
        let a = n(100);
        if (hu('p', 33)) a = n(4);
        return '点击或按住以填充' + format(player.p.energy.div(a)) + '能量';
      },
      onHold() {
        if (player.devSpeed.gt(0)) {
          if (!hu('p', 33)) {
            for (let i = 0; i <= 7; i++) {
              player.p.energyDrain[i] = player.p.energyDrain[i].add(player.p.energy.mul(0.01));
            }
            if (!hm('n', 8)) player.p.energy = player.p.energy.mul(0.92);
          }
          if (hu('p', 33)) {
            for (let i = 0; i <= 7; i++) {
              player.p.energyDrain[i] = player.p.energyDrain[i].add(player.p.energy.mul(0.25));
            }
            if (!hm('n', 8)) player.p.energy = player.p.energy.mul(0.9);
          }
        }
      },
      onClick() {
        this.onHold();
      },
      canClick() {
        return true;
      },
      unlocked() {
        return hu('p', 32);
      },
    },
  },
}); //聚变核心 P
