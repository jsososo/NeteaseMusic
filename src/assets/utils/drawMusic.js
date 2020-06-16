import Storage from "./Storage";

export default class DrawMusic {
  constructor() {
    const canvas = document.getElementById('music-data-canvas');
    this.ctx = canvas.getContext('2d');

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = this.fftSize;
    // 通过<audio>节点创建音频源
    const source = ctx.createMediaElementSource(window.pDom);
    // 将音频源关联到分析器
    source.connect(analyser);
    // 将分析器关联到输出设备（耳机、扬声器）
    analyser.connect(ctx.destination);
    this.playerAnalyser = analyser;
    window.playerAnalyser = analyser;
    const bufferLength = analyser.frequencyBinCount;
    this.musicDataArray = new Uint8Array(bufferLength);
    this.drawType = Storage.get('drawMusicStyle');
    this.quadraticCurve = this.quadraticCurve.bind(this);
  }

  fftSize = 256

  musicDataArray = new Uint8Array(0)

  otherData = {}

  drawMusicStyle = 'rect'

  drawMusicType = 1

  // 贝塞尔曲线
  quadraticCurve({ x = [], y = [], strokeStyle, lineWidth }) {
    const { ctx } = this;
    let px = 0, py = 0, phx, phy, hx, hy;
    const hxArr = [];
    const hyArr = [];
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    x.forEach((v, i) => {
      hx = (px + v) / 2;
      hy = (py + y[i]) / 2;
      switch (i) {
        case 0:
          break;
        case 1:
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          break;
        default:
          ctx.quadraticCurveTo(px, py, hx, hy);
          break;
      }
      px = v;
      py = y[i];
      phx = hx;
      phy = hy;
      if (hx === hx) {
        hxArr.push(hx);
        hyArr.push(hy);
      }
    });
    ctx.stroke();
    return {
      x: hxArr,
      y: hyArr,
    }
  };

  // 画各种直线
  drawLines(lines, { strokeStyle: commonStrokeStyle, lineWidth: commonLineWidth } = {}) {
    const { ctx } = this;
    lines.forEach(({x, y, x1, y1, strokeStyle, lineWidth}) => {
      ctx.strokeStyle = strokeStyle || commonStrokeStyle;
      ctx.lineWidth = lineWidth || commonLineWidth;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    });
  };

  // 柱状音频图
  drawMusicRect() {
    const { ctx, pageHeight } = this;
    let linearGradient;
    this.nowData.forEach((v, i) => {
      const { x, y, w, h } = this.getDrawData(i, ['x', 'y', 'w', 'h'])
      if (i === 0) {
        linearGradient = ctx.createLinearGradient(
          x,
          pageHeight,
          x,
          pageHeight / 2,
        )
        linearGradient.addColorStop(0,"#409EFF33");
        linearGradient.addColorStop(1,"#5cB87a33");
        ctx.fillStyle = linearGradient;
      }
      ctx.fillRect(x, y, w, h);
    })
  }

  // 粒子音频图
  drawMusicParticle() {
    const { otherData, nowData, pageWidth, pageHeight, fftSize, ctx } = this;
    otherData.musicParticleList = otherData.musicParticleList || [];
    let { musicParticleList } = otherData;

    musicParticleList.forEach((particle) => particle.move());
    nowData.map((v, i) => {
      // 取 2% 的幸运儿
      if (v > 0 && Math.random() < 0.02) {
        musicParticleList.push(new Particle({ pageWidth, pageHeight, fftSize, value: v, i, ctx }));
      }
    });
    otherData.musicParticleList = musicParticleList.filter((p) => !p.disappear);
  }

  // 曲线图音频图
  drawMusicLine() {
    const { quadraticCurve } = this;
    const [arr0, arr1, arr2, xArr] = [[], [], [], []];
    this.nowData.forEach((v, i) => {
      const { x, y, y1, y2 } = this.getDrawData(i, ['x', 'y1', 'y2']);
      arr0.push(y);
      arr1.push(y1);
      arr2.push(y2);
      xArr.push(x);
    })

    quadraticCurve({ x: xArr, y: arr0, lineWidth: 8, strokeStyle: '#409EFF33'  });
    quadraticCurve({ x: xArr, y: arr1, lineWidth: 3, strokeStyle: '#5cB87a33' });
    quadraticCurve({ x: xArr, y: arr2, lineWidth: 5, strokeStyle: '#E6A23C33' });
  }

  // 圆圈音频图
  drawMusicCircle() {
    const { nowData, pageWidth, pageHeight, ctx, fftSize } = this;
    const arr = [];
    let gradient;
    nowData.forEach((v, i) => {
      let { a: angle, r, h } = this.getDrawData(i, ['a', 'r', 'h']);
      if (i === 0) {
        gradient = ctx.createRadialGradient(pageWidth / 2,pageHeight / 2, 0,pageWidth / 2,pageHeight / 2, r * 1.2);
        gradient.addColorStop(0, '#409EFF00');
        gradient.addColorStop(0.5,'#409EFF66');
        gradient.addColorStop(1,'#5cB87a66');
      }
      r *= 0.8;

      if (angle > Math.PI || angle < 0)
        return;
      arr.push({
        x: pageWidth / 2 + Math.sin(angle) * (r - 10 - h / 20),
        y: pageHeight / 2 - Math.cos(angle) * (r - 10 - h / 20),
        x1: pageWidth / 2 + Math.sin(angle) * (r + h / 6),
        y1: pageHeight / 2 - Math.cos(angle) * (r + h / 6),
      });
      if (angle > 0 && angle < Math.PI) {
        arr.push({
          x: pageWidth / 2 - Math.sin(angle) * (r - 10 - h / 20),
          y: pageHeight / 2 - Math.cos(angle) * (r - 10 - h / 20),
          x1: pageWidth / 2 - Math.sin(angle) * (r + h / 6),
          y1: pageHeight / 2 - Math.cos(angle) * (r + h / 6),
        });
      }
      if (angle === Math.PI) {
        this.drawLines(arr, { lineWidth: 3 * 128 / (fftSize / 2), strokeStyle: gradient });
      }
    })
  }

  // 螺旋音频图
  drawMusicCircle2() {
    const { nowData, fftSize, pageWidth, pageHeight, ctx } = this;
    let arr = [], gradient;
    nowData.forEach((v, i) => {
      let { r, a: angle, h } = this.getDrawData(i, ['r', 'a', 'h'])
      r *= 0.8 * (1 - i / (fftSize / 2)) * (1 - i / ((fftSize / 2)));
      angle *= 4;
      if (angle > 4 * Math.PI || angle < 0)
        return;

      if (angle > 0 && angle < Math.PI * 4) {
        const l = {
          x: pageWidth / 2 + Math.sin(angle) * (r + 2 + v / 256 * r),
          y: pageHeight / 2 - Math.cos(angle) * (r + 2 + v / 256 * r),
          x1: pageWidth / 2 + Math.sin(angle) * r,
          y1: pageHeight / 2 - Math.cos(angle) * r,
          lineWidth: Math.max(Math.PI * 4 * r / (fftSize / 2), 1),
        };
        gradient = ctx.createLinearGradient(l.x, l.y, l.x1, l.y1);
        gradient.addColorStop(1,'#409EFF66');
        gradient.addColorStop(0,'#5cB87a66');
        l.strokeStyle = gradient;
        arr.push(l);
      }
      if (angle === 4 * Math.PI) {
        gradient = ctx.createRadialGradient(pageWidth / 2,pageHeight / 2, 0,pageWidth / 2,pageHeight / 2, r * 1.5);
        gradient.addColorStop(0, '#409EFF00');
        gradient.addColorStop(0.5,'#409EFF66');
        gradient.addColorStop(1,'#5cB87a66');
        this.drawLines(arr, { strokeStyle: gradient });
      }
    })
  }

  getDrawData(i, arr) {
    const num = this.fftSize / 2;
    const v = this.nowData[i];
    const { pageWidth, pageHeight, drawMusicType } = this;
    const result = {};

    const getNum = (v, val) => {
      if (v === 0)
        return 0;
      let n = v + Math.random() * 30 - val;
      if (n < 0)
        return 0;
      if (n > 255)
        return 255;
      return n;
    };

    arr.forEach((k) => {
      switch (k) {
        case 'x':
          result[k] = pageWidth * i / num;
          break;
        case 'y':
          result[k] = pageHeight - 80 - v / 256 * pageHeight / 2;
          break;
        case 'y1':
          result[k] = pageHeight - 80 - getNum(v, 12) / 256 * pageHeight / 2;
          break;
        case 'y2':
          result[k] = pageHeight - 80 - getNum(v, 18) / 256 * pageHeight / 2;
          break;
        case 'w':
          result[k] = pageWidth * 0.9 / num;
          break;
        case 'h':
          result[k] = v / 256 * pageHeight / 2;
          break;
        case 'a':
          let a = Math.PI / (num / 4 * 3);
          result[k] = {
            1: a * i,
            2: a * (i - num / 8),
          }[drawMusicType];
          break;
        case 'r':
          result[k] = pageHeight / 4;
          break;
      }
    })
    return result;
  }

  draw() {
    this.pageWidth = window.innerWidth;
    this.pageHeight = window.innerHeight;
    const { ctx, pageWidth, pageHeight } = this;
    if (Storage.get('showDrawMusic') === '0') {
      ctx.clearRect(0, 0, pageWidth, pageHeight);
      return;
    }
    const { musicDataArray, playerAnalyser } = this;
    playerAnalyser.getByteFrequencyData(musicDataArray);

    const drawMusicType = Storage.get('drawMusicType');
    const drawMusicStyle = Storage.get('drawMusicStyle');
    this.drawMusicType = drawMusicType;

    if (this.drawMusicStyle !== drawMusicStyle) {
      this.drawMusicStyle = drawMusicStyle;
      this.otherData = {};
    }
    this.nowData = [ ...musicDataArray ];
    const { nowData } = this;
    if (Number(drawMusicType) === 2) {
      this.nowData = [...nowData.reverse(), ...nowData.reverse()].filter((v, i) => i % 2);

    }

    ctx.clearRect(0, 0, pageWidth, pageHeight);

    const functionKey = {
      rect: 'drawMusicRect',
      line: 'drawMusicLine',
      circle: 'drawMusicCircle',
      circle2: 'drawMusicCircle2',
      particle: 'drawMusicParticle',
      line2: 'drawMusicLine2',
    }[this.drawMusicStyle] || 'drawMusicRect';

    this[functionKey]();
  }
}

// 粒子
class Particle {
  constructor({ pageWidth, pageHeight, fftSize, value, ctx, i }) {
    this.data = {
      x: pageWidth * i / (fftSize / 2),
      y: pageHeight,
      r: Math.random() * 5 + (value / 256 * 7),
      t: value / 256 * 100, // 透明度
      vx: Math.random() * 5 - 3, // 横向速度
      tx: Math.random() > 0.5, // 向左还是向右
      vy: Math.random() * 2 + 2, // 垂直速度
      type: 'particle',
    };
    this.ctx = ctx;
    this.draw();
  }

  disappear = false

  move() {
    const o = this.data;
    if (o.t < 1 || o.r < 2) {
      this.disappear = true;
      return;
    }
    o.x += o.vx;
    o.y -= o.vy;
    o.t = Math.min(o.t - 0.4, o.t * 0.99);
    o.r *= 0.99;
    if (Math.abs(o.vx) > 3) {
      o.tx = !o.tx;
    }
    o.vx += ( Number(o.tx) * 2 - 1) * 0.1;
    this.draw();
  }

  draw() {
    const { ctx, data: v } = this;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    // 泡泡特效
    ctx.arc(v.x, v.y, v.r, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255,255,255,${v.t / 100})`;
    ctx.fill();
  }
}
