/**
 * JUGADOR: CONEJITO 🐰
 * Con soporte para doble salto, squash & stretch elástico, buffer de salto y animaciones tiernas.
 */
class Bunny {
  constructor(groundY) {
    this.groundY = groundY;
    this.x = 135;
    this.y = groundY;
    this.vy = 0;
    this.onGround = true;
    this.canDoubleJump = false;
    this.legT = 0;
    this.t = 0;

    // Efectos de squash & stretch
    this.scaleX = 1;
    this.scaleY = 1;

    // Tolerancia de control (Coyote time & Jump buffer)
    this.coyoteTimer = 0;
    this.jumpBuffer = 0;

    // Estado especial de doble salto (voltereta o aleteo de orejas)
    this.doubleJumpEffect = 0;
  }

  reset() {
    this.y = this.groundY;
    this.vy = 0;
    this.onGround = true;
    this.canDoubleJump = false;
    this.legT = 0;
    this.t = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.coyoteTimer = 0;
    this.jumpBuffer = 0;
    this.doubleJumpEffect = 0;
  }

  queueJump() {
    this.jumpBuffer = CONFIG.JUMP_BUFFER;
  }

  jump(particles, sound) {
    // 1. Salto desde el suelo (o durante coyote time)
    if (this.onGround || this.coyoteTimer > 0) {
      this.vy = CONFIG.JUMP_FORCE;
      this.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBuffer = 0;
      this.canDoubleJump = true;
      this.scaleX = 0.85;
      this.scaleY = 1.25;

      if (particles) particles.puff(this.x, this.groundY, 6);
      if (sound) sound.jump();
      return true;
    }

    // 2. Doble salto en el aire
    if (this.canDoubleJump) {
      this.vy = CONFIG.DOUBLE_JUMP_FORCE;
      this.canDoubleJump = false;
      this.jumpBuffer = 0;
      this.doubleJumpEffect = 1;
      this.scaleX = 1.2;
      this.scaleY = 0.85;

      if (particles) {
        particles.sparkle(this.x, this.y - 10, 8, '#f7d070');
        particles.heartBurst(this.x, this.y - 12, 3);
      }
      if (sound) sound.doubleJump();
      return true;
    }

    return false;
  }

  bounce(force, particles, sound) {
    this.vy = force;
    this.onGround = false;
    this.canDoubleJump = true;
    this.scaleX = 0.75;
    this.scaleY = 1.35;
    if (particles) {
      particles.sparkle(this.x, this.y, 10, '#f28b82');
      particles.puff(this.x, this.y, 8, '#fce8e6');
    }
    if (sound) sound.bounce();
  }

  update(speed, particles, sound) {
    this.t++;
    this.legT += speed * 0.38;

    // Amortiguar squash & stretch de vuelta a la normalidad
    this.scaleX += (1 - this.scaleX) * 0.15;
    this.scaleY += (1 - this.scaleY) * 0.15;

    if (this.doubleJumpEffect > 0) {
      this.doubleJumpEffect = Math.max(0, this.doubleJumpEffect - 0.05);
    }

    // Manejo de coyote time
    if (this.onGround) {
      this.coyoteTimer = CONFIG.COYOTE_TIME;
    } else {
      if (this.coyoteTimer > 0) this.coyoteTimer--;
    }

    // Procesar buffer de salto
    if (this.jumpBuffer > 0) {
      this.jumpBuffer--;
      if (this.onGround) {
        this.jump(particles, sound);
      }
    }

    // Física gravitacional
    if (!this.onGround) {
      this.vy += CONFIG.GRAVITY;
      this.y += this.vy;

      // Aterrizaje
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.vy = 0;
        this.onGround = true;
        this.canDoubleJump = false;
        // Efecto squash de aterrizaje
        this.scaleX = 1.22;
        this.scaleY = 0.78;
        if (particles) particles.puff(this.x, this.groundY, 5);
      }
    }
  }

  getHitbox() {
    const pad = CONFIG.HITBOX_PAD;
    return {
      x: this.x - 22 + pad,
      y: this.y - 48 + pad * 1.5,
      w: 44 - pad * 2,
      h: 48 - pad * 2
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scaleX, this.scaleY);

    const bodyY = -28;

    // Sombra suave en el suelo cuando está en el aire
    if (!this.onGround) {
      const heightAbove = this.groundY - this.y;
      const shadowScale = Math.max(0.3, 1 - heightAbove / 180);
      const shadowAlpha = Math.max(0.08, 0.28 - heightAbove / 400);
      ctx.save();
      // Dibujar la sombra en la posición del suelo
      ctx.translate(0, -this.y + this.groundY);
      ctx.fillStyle = `rgba(92, 66, 50, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(0, -1, 22 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.translate(0, bodyY);

    // Dinámica y balanceo orgánico de las orejas (al trotar y con el viento)
    const runSway = Math.sin(this.legT * 0.45) * 0.07;
    const airDrag = !this.onGround 
      ? Math.max(-0.45, Math.min(0.45, -this.vy * 0.04)) 
      : 0;
    const earSw = runSway + airDrag;

    // 1. OREJA TRASERA (en el fondo, anclada a la coronilla de la cabeza)
    this._drawBunnyEar(ctx, 10, -25, -0.38 + earSw * 0.85, 35, 12, '#edd3c1', '#e5a5b0');

    // 2. COLITA DE POMPÓN BLANCO
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-28, 2, 10, 0, Math.PI * 2);
    ctx.fill();

    // 3. CUERPO ESPONJOSO
    ctx.fillStyle = '#f5e4d7';
    ctx.beginPath();
    ctx.ellipse(-6, 0, 30, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. PECHO ESCLARECIDO
    ctx.fillStyle = '#fffbfa';
    ctx.beginPath();
    ctx.ellipse(8, 2, 14, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. CABECITA REDONDA
    ctx.fillStyle = '#f5e4d7';
    ctx.beginPath();
    ctx.arc(16, -12, 18, 0, Math.PI * 2);
    ctx.fill();

    // 6. OREJA DELANTERA (en primer plano, anclada firmemente a la coronilla)
    this._drawBunnyEar(ctx, 16, -26, -0.20 + earSw * 1.15, 38, 13.5, '#f5e4d7', '#f2b8c0');

    // 7. PATITAS ANIMADAS AL CORRER
    ctx.fillStyle = '#ffffff';
    const legPh = this.onGround ? Math.sin(this.legT * 0.5) * 8 : -3;
    ctx.beginPath();
    ctx.ellipse(-14 + legPh, 22, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4 - legPh, 23, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 8. OJO TIERNO (parpadea ocasionalmente)
    const isBlinking = (this.t % 160 > 154);
    ctx.fillStyle = '#5c4232';
    if (isBlinking) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#5c4232';
      ctx.beginPath();
      ctx.arc(22, -14, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(22, -15, 3, 0, Math.PI * 2);
      ctx.fill();
      // Brillo en el ojo
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(23, -16, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. MEJILLA SONROJADA Y NARICITA
    ctx.fillStyle = 'rgba(232, 169, 160, 0.85)';
    ctx.beginPath();
    ctx.arc(15, -8, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d97f7f';
    ctx.beginPath();
    ctx.arc(29, -11, 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawBunnyEar(ctx, x, y, rot, length, width, outerColor, innerColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Silueta orgánica suave de la oreja del conejito
    ctx.fillStyle = outerColor;
    ctx.beginPath();
    ctx.moveTo(-width * 0.4, 0);
    ctx.quadraticCurveTo(-width * 0.58, -length * 0.55, -width * 0.2, -length);
    ctx.quadraticCurveTo(0, -length - width * 0.32, width * 0.2, -length);
    ctx.quadraticCurveTo(width * 0.58, -length * 0.55, width * 0.4, 0);
    ctx.closePath();
    ctx.fill();

    // Interior rosado pastel de la oreja
    ctx.fillStyle = innerColor;
    ctx.beginPath();
    const inW = width * 0.52;
    const inL = length * 0.72;
    ctx.moveTo(-inW * 0.35, -length * 0.12);
    ctx.quadraticCurveTo(-inW * 0.5, -length * 0.52, -inW * 0.15, -inL);
    ctx.quadraticCurveTo(0, -inL - inW * 0.25, inW * 0.15, -inL);
    ctx.quadraticCurveTo(inW * 0.5, -length * 0.52, inW * 0.35, -length * 0.12);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

window.Bunny = Bunny;
