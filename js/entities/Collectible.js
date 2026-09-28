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
    } else if (type === 'strawberry') {
      this.points = CONFIG.STRAWBERRY_PTS;
      this.radius = 15;
    } else if (type === 'golden_carrot') {
      this.points = 150;
      this.radius = 18;
    } else if (type === 'bubble_shield') {
      this.points = 40;
      this.radius = 17;
    } else if (type === 'rainbow_star') {
      this.points = 100;
      this.radius = 18;
    } else {
      this.points = CONFIG.HEART_PTS;
      this.radius = 14;
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
    } else if (this.type === 'strawberry') {
      this._drawStrawberry(ctx);
    } else if (this.type === 'golden_carrot') {
      this._drawGoldenCarrot(ctx);
    } else if (this.type === 'bubble_shield') {
      this._drawBubbleShield(ctx);
    } else if (this.type === 'rainbow_star') {
      this._drawRainbowStar(ctx);
    } else {
      this._drawHeart(ctx);
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

  _drawGoldenCarrot(ctx) {
    const scale = 1 + Math.sin(this.t * 2) * 0.1;
    ctx.scale(scale, scale);

    // Cuerpo dorado reluciente
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.quadraticCurveTo(0, 14, 10, -10);
    ctx.closePath();
    ctx.fill();

    // Franjas de brillo blanco
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(2, 2);
    ctx.stroke();

    // Hojas doradas / esmeralda
    ctx.fillStyle = '#10b981';
    for (const a of [-0.4, 0, 0.4]) {
      ctx.save();
      ctx.translate(0, -10);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -7, 3, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _drawBubbleShield(ctx) {
    const scale = 1 + Math.sin(this.t * 1.8) * 0.06;
    ctx.scale(scale, scale);

    // Esfera iridiscente translúcida
    const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.4)');
    grad.addColorStop(0.8, 'rgba(236, 72, 153, 0.35)');
    grad.addColorStop(1, 'rgba(59, 130, 246, 0.6)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Borde brillante
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Corazoncito tierno en el centro
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.bezierCurveTo(-4, -5, -8, 0, 0, 8);
    ctx.bezierCurveTo(8, 0, 4, -5, 0, 1);
    ctx.fill();
  }

  _drawRainbowStar(ctx) {
    const rot = this.t * 0.8;
    ctx.rotate(rot);

    // Color que rota con el tiempo
    const hue = (this.t * 60) % 360;
    ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
    ctx.shadowColor = `hsl(${hue}, 90%, 70%)`;
    ctx.shadowBlur = 16;

    const points = 5;
    const outerR = 14;
    const innerR = 6.5;
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

    // Núcleo blanco
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

window.Collectible = Collectible;
