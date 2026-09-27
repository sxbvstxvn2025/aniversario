/**
 * COLECCIONABLES: CORAZONES, ESTRELLAS Y FRESITAS
 * Aportan dinamismo, recompensa y alegría al gameplay.
 * Flotan con balanceo orgánico y desprenden destellos.
 */
class Collectible {
  constructor(x, y, type = 'heart') {
    this.x = x;
    this.baseY = y;
    this.y = y;
    this.type = type;
    this.t = Math.random() * Math.PI * 2;
    this.collected = false;

    if (type === 'heart') {
      this.points = CONFIG.HEART_PTS;
      this.radius = 14;
    } else if (type === 'star') {
      this.points = CONFIG.STAR_PTS;
      this.radius = 16;
    } else { // strawberry
      this.points = CONFIG.STRAWBERRY_PTS;
      this.radius = 15;
    }
  }

  update(speed) {
    this.x -= speed;
    this.t += 0.06;
    // Flotación suave ondulante
    this.y = this.baseY + Math.sin(this.t) * 6;
  }

  getHitbox() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      w: this.radius * 2,
      h: this.radius * 2
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Resplandor cálido
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius * 1.5);
    if (this.type === 'heart') {
      glow.addColorStop(0, 'rgba(232, 109, 126, 0.45)');
      glow.addColorStop(1, 'rgba(232, 109, 126, 0)');
    } else if (this.type === 'star') {
      glow.addColorStop(0, 'rgba(247, 208, 112, 0.55)');
      glow.addColorStop(1, 'rgba(247, 208, 112, 0)');
    } else {
      glow.addColorStop(0, 'rgba(224, 86, 96, 0.45)');
      glow.addColorStop(1, 'rgba(224, 86, 96, 0)');
    }
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    if (this.type === 'heart') {
      this._drawHeart(ctx);
    } else if (this.type === 'star') {
      this._drawStar(ctx);
    } else {
      this._drawStrawberry(ctx);
    }

    ctx.restore();
  }

  _drawHeart(ctx) {
    const scale = 1 + Math.sin(this.t * 1.5) * 0.08;
    ctx.scale(scale, scale);
    ctx.fillStyle = '#e85c72';

    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-6, -7, -13, 1, 0, 12);
    ctx.bezierCurveTo(13, 1, 6, -7, 0, 3);
    ctx.fill();

    // Brillo sutil
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(-4, -1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawStar(ctx) {
    const rot = this.t * 0.4;
    ctx.rotate(rot);
    ctx.fillStyle = '#f7c844';

    // Estrella de 5 puntas
    const points = 5;
    const outerR = 12;
    const innerR = 5.5;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerR : innerR;
      const angle = (i * Math.PI) / points;
      const x = Math.sin(angle) * r;
      const y = -Math.cos(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Centro brillante
    ctx.fillStyle = '#fffdf0';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawStrawberry(ctx) {
    ctx.fillStyle = '#e34d5d';
    ctx.beginPath();
    ctx.moveTo(0, 11);
    ctx.bezierCurveTo(-9, 8, -9, -7, 0, -8);
    ctx.bezierCurveTo(9, -7, 9, 8, 0, 11);
    ctx.fill();

    // Semillitas
    ctx.fillStyle = '#fce49d';
    for (const [sx, sy] of [[-3, -2], [3, -2], [0, 2], [-2, 6], [2, 6]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Coronita de hojitas verdes
    ctx.fillStyle = '#6bb056';
    for (const a of [-0.5, 0, 0.5]) {
      ctx.save();
      ctx.translate(0, -8);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -3, 2.5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

window.Collectible = Collectible;
