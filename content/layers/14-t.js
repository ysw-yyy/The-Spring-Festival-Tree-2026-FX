// layers.js:8261
addLayer('t', {
  infoboxes: {
    introBox: {
      title: 'Test',
      body() {
        return '经典测试层级，QqQe308树的标配<br>如遇问题或需要进行调试，可以查看下方按钮';
      },
    },
  },
  name: 'test',
  symbol: 'T',
  position: 0,
  startData() {
    return {
      unlocked() {
        return true;
      },
      clickables: { [11]: 0 },
    };
  },
  color: '#ffffff',
  type: 'none',
  exponent: 1,
  row: 'side',
  layerShown() {
    return true;
  },
  tooltip: '测试',
  devSpeedCal() {
    let dev = n(1);
    dev = dev.mul(tmp.Y.wormholeEffect);
    if (yb(26)) dev = dev.mul(ye(26));
    if (yb(29)) dev = dev.pow(ye(29));
    if (hu('E', 14)) dev = dev.div(1e5);
    if (player.E.buyables[11].gte(2)) dev = dev.mul(tmp.a.whitehole);
    if (hu('P', 44)) dev = dev.pow(2);
    if (hu('At', 11)) dev = n(1);
    if (gcs('t', 11)) dev = n(0);
    // if(isEndgame()) dev=n(0)
    return dev;
  },
  update(diff) {
    player.devSpeed = tmp.t.devSpeedCal;
  },
  clickables: {
    11: {
      title() {
        return '暂停';
      },
      display: '点击以暂停游戏，再次点击恢复。',
      onClick() {
        if (gcs('t', 11) == 1) setClickableState('t', 11, 0);
        else setClickableState('t', 11, 1);
      },
      canClick() {
        return true;
      },
      unlocked() {
        return true;
      },
    },
    12: {
      title() {
        return '软重置';
      },
      display: '如遇bug或炸档，请暂停游戏，并点击以重置部分层级资源。',
      onClick() {
        player.points = n(0);
        player.h.points = n(0);
        player.a.points = n(0);
        if (hu('d', 21)) {
          player.p.points = n(0);
          player.P.points = n(0);
          player.y.points = n(0);
          player.y.yearning = n(0);
          player.P.computility = n(0);
          player.p.energy = n(0);
          player.a.wormhole = n(0);
          player.a.electron = n(0);
          player.a.proton = n(0);
          player.a.neutron = n(0);
        }
        if (hu('d', 31)) {
          player.n.points = n(0);
          player.n.resets = n(0);
          player.e.points = n(0);
          player.w.points = n(0);
        }
      },
      canClick() {
        return true;
      },
      unlocked() {
        return true;
      },
    },
    13: {
      title() {
        return '距离重置';
      },
      display: '如果距离出现错乱或是进度过快，请点此重置距离，它不会重置任何其他东西',
      onClick() {
       player.d.distance=n(308)
      },
      canClick() {
        return true;
      },
      unlocked() {
        return true;
      },
    },
    14: {
      title() {
        return '回到主界面';
      },
      display: '如果无法正常回到主界面，请点击这里',
      onClick() {
       player.navTab="tree-tab"
      },
      canClick() {
        return true;
      },
      unlocked() {
        return true;
      },
    },
  },
}); //测试
