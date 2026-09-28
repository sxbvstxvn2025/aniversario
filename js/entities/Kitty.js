/**
 * COMPAÑERO: GATITO (MIGHI / KITTY) 🐱
 * Sigue los movimientos del conejito de forma orgánica, salta tras él,
 * ondea su colita, reacciona a los corazones y expresa ternura en cada frame.
 */
class Kitty {
  constructor(groundY) {
    this.groundY = groundY;
    this.x = 70;
    this.y = groundY;
    this.vy = 0;
    this.onGround = true;
    this.legT = 0;
    this.t = 0;

    // Distancia deseada detrás del conejito
    this.followDist = 65;

    // Animación de cola y orejitas
    this.tailAngle = 0;
    this.scaleX = 1;
    this.scaleY = 1;

    // Reacciones y emociones
    this.heartReaction = 0; // tiempo de corazoncito flotando sobre la cabeza
    this.jumpDelayTimer = 0; // ligero retardo para un salto natural y juguetón
    this.pendingJump = false;

    // Rayos de corazón para la batalla contra la ardilla
    this.heartBeams = [];
  }

  reset() {
    this.x = 70;
    this.y = this.groundY;
    this.vy = 0;
    this.onGround = true;
    this.legT = 0;
    this.t = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.heartReaction = 0;
    this.jumpDelayTimer = 0;
    this.pendingJump = false;
    this.heartBeams = [];
  }

  fireHeartBeam(targetBoss, sound, particles) {
    if (!targetBoss) return;
    this.heartReaction = 50;
    this.scaleY = 1.35;
    this.scaleX = 0.8;
    if (sound) sound.heartBeam();
    this.heartBeams.push({
      x: this.x + 20,
      y: this.y - 18,
      target: targetBoss,
      speed: 12,
      life: 60
    });
    if (particles) {
      particles.sparkle(this.x + 20, this.y - 18, 6, '#ff4757');
    }
  }

  onBunnyCollect() {
    // Exclamación de felicidad cuando el conejito atrapa un coleccionable
    this.heartReaction = 35;
  }

  onBunnyJump() {
    // El gatito reacciona al salto del conejito con un ligero retraso de reflejo
    this.pendingJump = true;
    this.jumpDelayTimer = 4; // 4 frames de anticipación juguetona
  }

  update(bunny, speed, particles) {
    this.t++;
    this.legT += speed * 0.38;

    // Regresar escala normal suavemente
    this.scaleX += (1 - this.scaleX) * 0.15;
    this.scaleY += (1 - this.scaleY) * 0.15;

    // Seguimiento elástico en X (mantiene la distancia tiernamente)
    const targetX = bunny.x - this.followDist;
    const dx = targetX - this.x;
    this.x += dx * 0.12;

    // Reacción al salto programado
    if (this.pendingJump && this.onGround) {
      if (this.jumpDelayTimer > 0) {
        this.jumpDelayTimer--;
        // Se agacha un instante antes de lanzarse
        this.scaleY = 0.85;
        this.scaleX = 1.15;
      } else {
        // ¡Salto del gatito!
        this.vy = CONFIG.JUMP_FORCE * 0.94;
        this.onGround = false;
        this.pendingJump = false;
        this.scaleX = 0.85;
        this.scaleY = 1.25;
        if (particles) particles.puff(this.x, this.groundY, 4, '#f8e8df');
      }
    }

    // Si el conejito está muy alto y el gatito aún no saltó, salta de inmediato
    if (!bunny.onGround && this.onGround && bunny.y < this.groundY - 40 && !this.pendingJump) {
      this.pendingJump = true;
      this.jumpDelayTimer = 2;
    }

    // Física vertical
    if (!this.onGround) {
      this.vy += CONFIG.GRAVITY;
      this.y += this.vy;

      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.vy = 0;
        this.onGround = true;
        this.scaleX = 1.2;
        this.scaleY = 0.8;
        if (particles) particles.puff(this.x, this.groundY, 4, '#f8e8df');
      }
    }

    // Animación de cola
    this.tailAngle = Math.sin(this.t * 0.12) * 0.35 + (this.onGround ? 0 : 0.4);

    // Temporizador de reacción de corazón
    if (this.heartReaction > 0) {
      this.heartReaction--;
    }

    // Actualizar rayos de corazón hacia el jefe
    for (let i = this.heartBeams.length - 1; i >= 0; i--) {
      const b = this.heartBeams[i];
      b.life--;
      const targetX = b.target.x;
      const targetY = b.target.y;
      const dx = targetX - b.x;
      const dy = targetY - b.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 34 || b.life <= 0) {
        if (dist < 42 && b.target && b.target.takeDamage) {
          b.target.takeDamage(1, particles, sound);
        }
        this.heartBeams.splice(i, 1);
        continue;
      }

      b.x += (dx / dist) * b.speed;
      b.y += (dy / dist) * b.speed;
      if (particles && Math.random() > 0.35) {
        particles.sparkle(b.x, b.y, 2, '#ff6b81');
      }
    }
  }

  draw(ctx) {
    // Dibujar proyectiles de rayo de corazón del gatito
    for (const b of this.heartBeams) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = '#ff4757';
      ctx.shadowColor = '#ff6b81';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(-6, -6, -13, 1, 0, 12);
      ctx.bezierCurveTo(13, 1, 6, -6, 0, 3);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scaleX, this.scaleY);

    const bodyY = -24;

    // Sombra en el suelo
    if (!this.onGround) {
      const heightAbove = this.groundY - this.y;
      const shadowScale = Math.max(0.3, 1 - heightAbove / 160);
      const shadowAlpha = Math.max(0.08, 0.25 - heightAbove / 350);
      ctx.save();
      ctx.translate(0, -this.y + this.groundY);
      ctx.fillStyle = `rgba(92, 66, 50, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(0, -1, 18 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.translate(0, bodyY);

    // 1. COLITA SUAVE DEL GATITO (curva bézier fluida)
    ctx.save();
    ctx.translate(-22, 2);
    ctx.rotate(this.tailAngle);
    ctx.strokeStyle = '#fff0e4';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-15, -12, -18, -26);
    ctx.stroke();

    // Punta de la colita canela
    ctx.strokeStyle = '#e2aa85';
    ctx.beginPath();
    ctx.moveTo(-13, -18);
    ctx.quadraticCurveTo(-15, -22, -18, -26);
    ctx.stroke();
    ctx.restore();

    // 2. CUERPO ESPONJOSO (gatito blanco cálido con manchita suave)
    ctx.fillStyle = '#fff4ea';
    ctx.beginPath();
    ctx.ellipse(-4, 2, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Manchita canela en la espalda
    ctx.fillStyle = '#e8b896';
    ctx.beginPath();
    ctx.ellipse(-10, -5, 11, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Pechito blanco puro
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(6, 4, 11, 13, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 3. CABECITA REDONDA
    ctx.fillStyle = '#fff4ea';
    ctx.beginPath();
    ctx.arc(14, -8, 15, 0, Math.PI * 2);
    ctx.fill();

    // Mancha en una orejita
    ctx.fillStyle = '#e8b896';
    ctx.beginPath();
    ctx.arc(17, -14, 8, 0, Math.PI * 2);
    ctx.fill();

    // 4. OREJITAS PUNTIAGUDAS DE GATO
    // Oreja izquierda
    this._drawCatEar(ctx, 4, -18, -0.25, '#fff4ea', '#f8bac5');
    // Oreja derecha (con tono cálido)
    this._drawCatEar(ctx, 18, -20, 0.22, '#e8b896', '#f8bac5');

    // 5. PATITAS EN MOVIMIENTO
    ctx.fillStyle = '#ffffff';
    const legPh = this.onGround ? Math.sin(this.legT * 0.5 + 0.6) * 7 : -2;
    ctx.beginPath();
    ctx.ellipse(-12 + legPh, 18, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3 - legPh, 19, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. CARITA TIERNA
    // Ojos adorables de gatito
    ctx.fillStyle = '#553928';
    if (!this.onGround) {
      // Ojos contentos y cerraditos saltando: ^ ^
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#553928';
      ctx.beginPath();
      ctx.arc(18, -10, 3, Math.PI + 0.2, -0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(25, -9, 3, Math.PI + 0.2, -0.2);
      ctx.stroke();
    } else {
      // Ojos despiertos y tiernos
      ctx.beginPath();
      ctx.arc(19, -10, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(26, -9, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Brillos en los ojos
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(20, -11, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(27, -10, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nariz pequeña rosita
    ctx.fillStyle = '#e88998';
    ctx.beginPath();
    ctx.arc(23, -6, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Bigotitos finos
    ctx.strokeStyle = 'rgba(92, 66, 50, 0.45)';
    ctx.lineWidth = 1;
    // Lado derecho
    ctx.beginPath();
    ctx.moveTo(27, -6);
    ctx.lineTo(34, -8);
    ctx.moveTo(27, -4);
    ctx.lineTo(33, -3);
    ctx.stroke();

    // Mejillas sonrojadas
    ctx.fillStyle = 'rgba(240, 160, 160, 0.75)';
    ctx.beginPath();
    ctx.arc(15, -4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(27, -3, 3, 0, Math.PI * 2);
    ctx.fill();

    // 7. EMOTE DE CORAZÓN FLOTANTE (al coleccionar corazones con el conejito)
    if (this.heartReaction > 0) {
      const alpha = Math.min(1, this.heartReaction / 10);
      const floatY = -34 - (35 - this.heartReaction) * 0.6;
      ctx.save();
      ctx.translate(14, floatY);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#e86d7e';
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.bezierCurveTo(-4, -5, -8, 1, 0, 8);
      ctx.bezierCurveTo(8, 1, 4, -5, 0, 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  _drawCatEar(ctx, x, y, rot, outerColor, innerColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Oreja exterior
    ctx.fillStyle = outerColor;
    ctx.beginPath();
    ctx.moveTo(-5, 4);
    ctx.lineTo(0, -12);
    ctx.lineTo(6, 3);
    ctx.closePath();
    ctx.fill();

    // Interior rosadito
    ctx.fillStyle = innerColor;
    ctx.beginPath();
    ctx.moveTo(-2.5, 2);
    ctx.lineTo(0, -9);
    ctx.lineTo(3.5, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

window.Kitty = Kitty;
