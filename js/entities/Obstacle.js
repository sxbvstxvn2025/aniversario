/**
 * OBSTÁCULOS Y PLATAFORMAS INTERACTIVAS
 * Incluye zanahorias, flores, arbustos, caracoles dormilones y hongos elásticos
 * que impulsan al conejito al cielo.
 */
class Obstacle {
  constructor(x, groundY, type) {
    this.x = x;
    this.groundY = groundY;
    this.type = type;
    this.t = Math.random() * Math.PI * 2;
    this.sway = Math.random() * Math.PI * 2;

    // Configuración según el tipo
    const specs = {
      carrot:           { w: 26, h: 44, isBounce: false },
      flower:           { w: 32, h: 38, isBounce: false },
      bush:             { w: 42, h: 32, isBounce: false },
      sleeping_snail:   { w: 34, h: 26, isBounce: false },
      bounce_mushroom:  { w: 38, h: 36, isBounce: true },
      rolling_chestnut: { w: 28, h: 28, isBounce: false },
      flying_butterfly: { w: 32, h: 28, isBounce: false }
    };

    const spec = specs[type] || specs.carrot;
    this.w = spec.w;
    this.h = spec.h;
    this.isBounce = spec.isBounce;

    // Para el hongo elástico y rotaciones
    this.squishY = 1;
    this.rot = 0;
    this.floatOffset = 0;
  }

  update(speed) {
    if (this.type === 'rolling_chestnut') {
      this.x -= speed * 1.32; // Rueda hacia la izquierda más rápido
      this.rot -= 0.12;
    } else {
      this.x -= speed;
    }
    this.t += 0.05;

    if (this.type === 'flying_butterfly') {
      this.floatOffset = Math.sin(this.t * 2.8) * 14;
    }

    if (this.isBounce && this.squishY < 1) {
      this.squishY += (1 - this.squishY) * 0.15;
    }
  }

  triggerBounce() {
    this.squishY = 0.45;
  }

  getHitbox() {
    const pad = CONFIG.HITBOX_PAD;
    if (this.type === 'flying_butterfly') {
      const flyY = this.groundY - 55 + this.floatOffset;
      return {
        x: this.x - this.w / 2 + pad,
        y: flyY - this.h / 2 + pad,
        w: this.w - pad * 2,
        h: this.h - pad * 2
      };
    }
    return {
      x: this.x - this.w / 2 + pad,
      y: this.groundY - this.h + pad,
      w: this.w - pad * 2,
      h: this.h - pad * 1.5
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.groundY);

    if (this.type === 'carrot') {
      this._drawCarrot(ctx);
    } else if (this.type === 'flower') {
      this._drawFlower(ctx);
    } else if (this.type === 'bush') {
      this._drawBush(ctx);
    } else if (this.type === 'sleeping_snail') {
      this._drawSnail(ctx);
    } else if (this.type === 'bounce_mushroom') {
      this._drawBounceMushroom(ctx);
    } else if (this.type === 'rolling_chestnut') {
      this._drawRollingChestnut(ctx);
    } else if (this.type === 'flying_butterfly') {
      this._drawFlyingButterfly(ctx);
    }

    ctx.restore();
  }

  _drawCarrot(ctx) {
    // Zanahoria tierna sembrada en la tierra
    ctx.fillStyle = '#e8814d';
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.quadraticCurveTo(0, -this.h - 6, 11, 0);
    ctx.closePath();
    ctx.fill();

    // Líneas decorativas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-3, -10);
    ctx.lineTo(3, -22);
    ctx.stroke();

    // Hojas verdes
    ctx.fillStyle = '#7fae6a';
    for (const a of [-0.45, 0, 0.45]) {
      ctx.save();
      ctx.translate(0, -this.h);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -11, 4, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _drawFlower(ctx) {
    const sway = Math.sin(this.t + this.sway) * 3;
    // Tallo
    ctx.strokeStyle = '#7fae6a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway * 0.5, -this.h / 2, sway, -this.h + 8);
    ctx.stroke();

    // Hoja en el tallo
    ctx.fillStyle = '#7fae6a';
    ctx.beginPath();
    ctx.ellipse(sway * 0.4 + 6, -14, 6, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Pétalos rosados
    ctx.fillStyle = '#f2b8c0';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + this.t * 0.4;
      ctx.beginPath();
      ctx.arc(sway + Math.cos(a) * 9, -this.h + 8 + Math.sin(a) * 9, 6.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centro amarillo de la flor
    ctx.fillStyle = '#f5c86e';
    ctx.beginPath();
    ctx.arc(sway, -this.h + 8, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawBush(ctx) {
    ctx.fillStyle = '#94b37d';
    ctx.beginPath();
    ctx.arc(-12, -12, 13, 0, Math.PI * 2);
    ctx.arc(12, -12, 13, 0, Math.PI * 2);
    ctx.arc(0, -21, 15, 0, Math.PI * 2);
    ctx.fill();

    // Frutitas silvestres
    ctx.fillStyle = '#e86d7e';
    ctx.beginPath();
    ctx.arc(7, -24, 3, 0, Math.PI * 2);
    ctx.arc(-8, -16, 2.8, 0, Math.PI * 2);
    ctx.arc(14, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawSnail(ctx) {
    // Caparazón en espiral
    ctx.fillStyle = '#d99873';
    ctx.beginPath();
    ctx.arc(-4, -14, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#b87955';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-4, -14, 6, 0, Math.PI * 1.5);
    ctx.stroke();

    // Cuerpo del caracolito
    ctx.fillStyle = '#f2dbbe';
    ctx.beginPath();
    ctx.ellipse(3, -4, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabecita y antenitas dormilonas
    ctx.beginPath();
    ctx.arc(12, -9, 5, 0, Math.PI * 2);
    ctx.fill();

    // Ojos dormilones zzz
    ctx.strokeStyle = '#5c4232';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(14, -9, 2, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Antenitas
    ctx.beginPath();
    ctx.moveTo(14, -13);
    ctx.lineTo(16, -18);
    ctx.stroke();
    ctx.fillStyle = '#e89b9b';
    ctx.beginPath();
    ctx.arc(16, -18, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawBounceMushroom(ctx) {
    ctx.save();
    ctx.scale(1, this.squishY);

    // Tallo del hongo
    ctx.fillStyle = '#fff4ea';
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(-5, -20);
    ctx.lineTo(5, -20);
    ctx.lineTo(7, 0);
    ctx.closePath();
    ctx.fill();

    // Sombrero elástico (fucsia/rosa vibrante con lunares blancos)
    ctx.fillStyle = '#e85d75';
    ctx.beginPath();
    ctx.arc(0, -20, 18, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // Borde inferior acolchado
    ctx.fillStyle = '#f79db0';
    ctx.beginPath();
    ctx.ellipse(0, -20, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lunares blancos alegres
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -29, 3.5, 0, Math.PI * 2);
    ctx.arc(-9, -24, 2.8, 0, Math.PI * 2);
    ctx.arc(9, -24, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Destellito brillante en la punta indicando que es un trampolín
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(0, -35, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawRollingChestnut(ctx) {
    ctx.save();
    ctx.translate(0, -14);
    ctx.rotate(this.rot);

    // Bola de castaña marrón con púas
    ctx.fillStyle = '#8b5a2b';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Espinas / púas tiernas alrededor
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.2) * 11, Math.sin(a - 0.2) * 11);
      ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16);
      ctx.lineTo(Math.cos(a + 0.2) * 11, Math.sin(a + 0.2) * 11);
      ctx.closePath();
      ctx.fill();
    }

    // Centro con textura
    ctx.fillStyle = '#b8860b';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawFlyingButterfly(ctx) {
    ctx.save();
    ctx.translate(0, -55 + this.floatOffset);

    const flap = Math.sin(this.t * 12);

    // Alitas rosadas y lavanda que aletean
    ctx.save();
    ctx.scale(flap, 1);

    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(-8, -6, 10, 6, -0.3, 0, Math.PI * 2);
    ctx.ellipse(8, -6, 10, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.ellipse(-6, 3, 7, 5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(6, 3, 7, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Cuerpo
    ctx.fillStyle = '#4a2810';
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antenitas
    ctx.strokeStyle = '#4a2810';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(-3, -13, -5, -14);
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(3, -13, 5, -14);
    ctx.stroke();

    ctx.restore();
  }
}

window.Obstacle = Obstacle;
