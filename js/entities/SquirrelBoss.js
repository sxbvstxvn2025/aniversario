/**
 * JEFE FINAL: LA ARDILLA MALÉVOLA (LORD BELLOTA) 🐿️😈
 * Aparece a los 2809 puntos intentando robarse el amor y las bellotas de Los Babys.
 * Cuenta con ataques telegrafiados, lanzamiento de bellotas rebotinas,
 * picadas rasantes donde puede ser pisoteada (¡BONK!), y vulnerabilidad
 * al Rayo Gatuno disparado por el gatito.
 */
class SquirrelBoss {
  constructor(canvasWidth, groundY) {
    this.W = canvasWidth;
    this.groundY = groundY;

    this.maxHp = (typeof CONFIG !== 'undefined' && CONFIG.BOSS_MAX_HP) ? CONFIG.BOSS_MAX_HP : 6;
    this.hp = this.maxHp;

    // Posición inicial fuera de pantalla a la derecha
    this.x = canvasWidth + 80;
    this.hoverX = canvasWidth - 110;
    this.baseY = groundY - 145;
    this.y = this.baseY;
    this.vx = 0;
    this.vy = 0;

    this.w = 56;
    this.h = 56;

    // Estados: 'INTRO', 'HOVER', 'ATTACK_THROW', 'ATTACK_SWOOP', 'HURT', 'DEFEATED'
    this.state = 'INTRO';
    this.stateTimer = 0;
    this.t = 0;

    // Temporizadores de ataque y vulnerabilidad
    this.attackCooldown = 130;
    this.invulnTimer = 0;
    this.swoopProgress = 0;

    // Proyectiles: bellotas lanzadas por la ardilla
    this.acorns = [];

    // Flag de derrota
    this.isDefeated = false;
    this.defeatTimer = 0;
    this.defeatScale = 1;
    this.defeatRot = 0;
  }

  resize(canvasWidth, groundY) {
    this.W = canvasWidth;
    this.groundY = groundY;
    this.hoverX = canvasWidth - (canvasWidth < 600 ? 95 : 120);
    this.baseY = groundY - 145;
    if (this.state === 'HOVER') {
      this.x = this.hoverX;
    }
  }

  takeDamage(amount = 1, particles = null, sound = null) {
    if (this.invulnTimer > 0 || this.isDefeated) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.invulnTimer = 35; // Frames de invulnerabilidad tras ser golpeada

    if (sound) sound.bossHit();
    if (particles) {
      particles.sparkle(this.x, this.y, 14, '#ffdd55');
      particles.heartBurst(this.x, this.y, 8);
      const hurtPhrases = ['¡OUCH! 🐿️💦', '¡MIS BELLOTAS! 🌰', '¡AYYY! 💥', '¡QUÉ GOLPE! 💢'];
      const txt = hurtPhrases[Math.floor(Math.random() * hurtPhrases.length)];
      particles.addFloatingText(txt, this.x - 20, this.y - 30, '#ff4757', 28);
    }

    if (this.hp <= 0) {
      this.isDefeated = true;
      this.state = 'DEFEATED';
      this.defeatTimer = 180;
      if (sound) sound.bossDefeatFanfare();
      if (particles) {
        particles.confettiBurst(this.x, this.y, 60);
        particles.addFloatingText('¡DERROTADA! 🏆✨', this.x, this.y - 45, '#fcd34d', 34);
      }
    } else {
      // Retroceso cómico al recibir golpe y cancelar picada
      this.state = 'HOVER';
      this.attackCooldown = Math.max(this.attackCooldown, 90);
      this.x = Math.min(this.W - 60, this.x + 35);
      this.y = this.baseY - 15;
    }

    return true;
  }

  throwAcorn(sound, particles) {
    if (sound) sound.bossThrow();
    this.acorns.push({
      x: this.x - 18,
      y: this.y + 10,
      vx: -4.8 - Math.random() * 1.8,
      vy: -3.8,
      r: 13,
      rot: 0,
      vRot: -0.15,
      bounces: 0
    });
    if (particles) {
      particles.sparkle(this.x - 18, this.y + 10, 6, '#e67e22');
    }
  }

  update(bunny, kitty, particles, sound, gameCollectibles) {
    this.t++;
    if (this.invulnTimer > 0) this.invulnTimer--;

    // 1. Actualizar bellotas arrojadas
    for (let i = this.acorns.length - 1; i >= 0; i--) {
      const a = this.acorns[i];
      a.x += a.vx;
      a.y += a.vy;
      a.vy += 0.32; // Gravedad
      a.rot += a.vRot;

      // Rebote en el suelo
      if (a.y >= this.groundY - a.r) {
        a.y = this.groundY - a.r;
        a.vy = -Math.abs(a.vy) * 0.72;
        a.bounces++;
        if (particles && Math.random() > 0.4) {
          particles.puff(a.x, this.groundY, 3, '#c97f4c');
        }
      }

      // Eliminar bellotas que salieron de pantalla
      if (a.x < -40) {
        this.acorns.splice(i, 1);
      }
    }

    // 2. Máquina de estados del Jefe
    switch (this.state) {
      case 'INTRO': {
        this.x += (this.hoverX - this.x) * 0.05;
        this.y = this.baseY + Math.sin(this.t * 0.08) * 14;
        if (Math.abs(this.x - this.hoverX) < 8) {
          this.x = this.hoverX;
          this.state = 'HOVER';
          this.attackCooldown = 300; // 5 segundos sin ataques para que el jugador agarre la onda
          if (particles) {
            particles.addFloatingText('¡JAJAJA! 🐿️😈', this.x, this.y - 35, '#e74c3c', 30);
          }
        }
        break;
      }

      case 'HOVER': {
        // Flotar juguetonamente arriba y abajo
        this.y = this.baseY + Math.sin(this.t * 0.07) * 22;
        this.x += (this.hoverX - this.x) * 0.08;

        this.attackCooldown--;
        if (this.attackCooldown <= 0) {
          // Alternar entre arrojar bellota y picada rasante
          if (Math.random() > 0.45) {
            this.state = 'ATTACK_THROW';
            this.stateTimer = 40;
          } else {
            this.state = 'ATTACK_SWOOP';
            this.swoopProgress = 0;
            if (particles) {
              particles.addFloatingText('¡CUIDAAADO! 💨', this.x - 20, this.y - 30, '#f39c12', 26);
            }
          }
        }

        // Generar una estrella o corazón de forma medida (cada ~4.3s) para premiar saltos diestros
        if (this.t % 260 === 0 && gameCollectibles) {
          const cType = Math.random() > 0.5 ? 'star' : 'heart';
          const cY = this.groundY - (80 + Math.random() * 35);
          gameCollectibles.push(new window.Collectible(this.W + 20, cY, cType));
          if (particles) {
            particles.sparkle(this.W, cY, 6, '#f1c40f');
          }
        }
        break;
      }

      case 'ATTACK_THROW': {
        this.stateTimer--;
        this.y = this.baseY + Math.sin(this.t * 0.1) * 8;
        if (this.stateTimer === 20) {
          this.throwAcorn(sound, particles);
        }
        if (this.stateTimer <= 0) {
          this.state = 'HOVER';
          this.attackCooldown = 110 + Math.floor(Math.random() * 60);
        }
        break;
      }

      case 'ATTACK_SWOOP': {
        // Picada rasante en arco barriendo toda la pantalla y volviendo por la derecha
        this.swoopProgress += 0.016;
        const p = this.swoopProgress;

        if (p < 0.6) {
          // Bajar en picada rasante cruzando la pantalla de derecha a izquierda
          const sub = p / 0.6;
          this.x = this.hoverX - sub * (this.hoverX - (-60));
          // Arco que desciende cerca del suelo para poder ser pisoteada (¡BONK!)
          this.y = this.baseY + Math.sin(sub * Math.PI) * (this.groundY - this.baseY - 32);
        } else if (p < 1.0) {
          // Reingreso volando suavemente desde la derecha
          const sub = (p - 0.6) / 0.4;
          this.x = (this.W + 80) - sub * (this.W + 80 - this.hoverX);
          this.y = this.baseY;
        } else {
          this.state = 'HOVER';
          this.attackCooldown = 130 + Math.floor(Math.random() * 50);
        }

        if (particles && Math.random() > 0.35) {
          particles.sparkle(this.x, this.y, 2, '#e67e22');
        }
        break;
      }

      case 'DEFEATED': {
        this.defeatTimer--;
        this.defeatRot += 0.22;
        this.x += 2.2;
        this.y -= 3.5; // Sale disparada hacia el cielo como el Equipo Rocket
        this.defeatScale = Math.max(0.2, this.defeatScale - 0.007);

        if (this.defeatTimer % 10 === 0 && particles) {
          particles.sparkle(this.x, this.y, 8, '#f1c40f');
          particles.heartBurst(this.x, this.y, 4);
        }
        break;
      }
    }
  }

  getHitbox() {
    return {
      x: this.x - 22,
      y: this.y - 24,
      w: 44,
      h: 48
    };
  }

  draw(ctx) {
    // Dibujar bellotas en vuelo / rebotando
    for (const a of this.acorns) {
      this._drawAcorn(ctx, a.x, a.y, a.r, a.rot);
    }

    if (this.isDefeated && this.defeatScale <= 0.25) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isDefeated) {
      ctx.rotate(this.defeatRot);
      ctx.scale(this.defeatScale, this.defeatScale);
    }

    // Efecto de parpadeo al ser golpeada
    if (this.invulnTimer > 0 && Math.floor(this.invulnTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    const t = this.t;

    // 1. Capita de villana roja ondeando
    ctx.save();
    const capeWave = Math.sin(t * 0.18) * 12;
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.quadraticCurveTo(24 + capeWave, -2, 28 + capeWave, 26);
    ctx.lineTo(12, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Cola gigante y esponjosa de ardilla
    ctx.save();
    const tailWiggle = Math.sin(t * 0.12) * 0.25;
    ctx.rotate(tailWiggle);
    ctx.fillStyle = '#8a3717';
    ctx.beginPath();
    ctx.moveTo(12, 10);
    ctx.bezierCurveTo(34, 18, 48, -12, 38, -36);
    ctx.bezierCurveTo(28, -52, 10, -44, 14, -30);
    ctx.bezierCurveTo(18, -18, 4, -4, 6, 8);
    ctx.closePath();
    ctx.fill();

    // Detalle claro del pelaje de la cola
    ctx.fillStyle = '#c85a2b';
    ctx.beginPath();
    ctx.moveTo(16, 6);
    ctx.bezierCurveTo(30, 12, 40, -10, 32, -30);
    ctx.bezierCurveTo(25, -42, 14, -36, 17, -26);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. Patitas traseras
    ctx.fillStyle = '#6e2b10';
    ctx.beginPath();
    ctx.ellipse(-10, 20, 9, 6, -0.2, 0, Math.PI * 2);
    ctx.ellipse(8, 20, 9, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. Cuerpo regordete de ardilla
    ctx.fillStyle = '#a64b2a';
    ctx.beginPath();
    ctx.ellipse(0, 4, 20, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pancita crema
    ctx.fillStyle = '#fbe3cc';
    ctx.beginPath();
    ctx.ellipse(-4, 7, 12, 15, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // 5. Cabeza de la ardilla
    ctx.fillStyle = '#a64b2a';
    ctx.beginPath();
    ctx.ellipse(-4, -16, 17, 15, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Cachetitos
    ctx.fillStyle = '#fbe3cc';
    ctx.beginPath();
    ctx.ellipse(-10, -12, 9, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Orejitas puntiagudas con mechoncitos
    ctx.fillStyle = '#8a3717';
    ctx.beginPath();
    ctx.moveTo(-14, -28);
    ctx.lineTo(-9, -38);
    ctx.lineTo(-4, -27);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -27);
    ctx.lineTo(6, -37);
    ctx.lineTo(9, -26);
    ctx.closePath();
    ctx.fill();

    // Interior de las orejas
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.moveTo(-11, -28);
    ctx.lineTo(-9, -34);
    ctx.lineTo(-6, -28);
    ctx.fill();

    // 6. Antifaz de bandida / cejas malévolas adorables
    ctx.fillStyle = '#1e1b18';
    // Cejas inclinadas de villana
    ctx.beginPath();
    ctx.moveTo(-16, -22);
    ctx.lineTo(-8, -19);
    ctx.lineTo(-8, -17);
    ctx.lineTo(-16, -20);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(3, -22);
    ctx.lineTo(-5, -19);
    ctx.lineTo(-5, -17);
    ctx.lineTo(3, -20);
    ctx.fill();

    // Ojitos pícaros y brillantes
    ctx.fillStyle = '#1e1b18';
    ctx.beginPath();
    ctx.ellipse(-10, -16, 3.5, 4.5, -0.1, 0, Math.PI * 2);
    ctx.ellipse(-1, -16, 3.5, 4.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Brillos en los ojos
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-11, -18, 1.4, 0, Math.PI * 2);
    ctx.arc(-2, -18, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Naricita negra
    ctx.fillStyle = '#2d1810';
    ctx.beginPath();
    ctx.ellipse(-6, -11, 2.2, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dientes de ardilla (dos dientitos frontales tiernos)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7, -9, 2.2, 3.5);
    ctx.fillRect(-4.5, -9, 2.2, 3.5);

    // 7. Brazos sosteniendo bellota (o bandera si derrotada)
    if (this.isDefeated) {
      // Bandera blanca de rendición
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-12, -4);
      ctx.lineTo(-12, -32);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-12, -32);
      ctx.lineTo(-26, -26);
      ctx.lineTo(-12, -20);
      ctx.closePath();
      ctx.fill();
    } else {
      // Sosteniendo bellota en las patitas delanteras
      ctx.fillStyle = '#8a3717';
      ctx.beginPath();
      ctx.ellipse(-14, 2, 5, 4, 0.4, 0, Math.PI * 2);
      ctx.ellipse(-6, 4, 5, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Mini bellota brillante sostenida
      this._drawAcorn(ctx, -10, 4, 8, 0.2);
    }

    ctx.restore();
  }

  _drawAcorn(ctx, x, y, r, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Cuerpo de la bellota (avellana dorada)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.35, r, r * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brillo sutil
    ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, r * 0.2, r * 0.3, r * 0.6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Sombrerito / cúpula de la bellota
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 1.1, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // Tallito de la bellota
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = Math.max(2, r * 0.25);
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.1);
    ctx.quadraticCurveTo(r * 0.4, -r * 1.5, r * 0.2, -r * 1.8);
    ctx.stroke();

    ctx.restore();
  }
}

window.SquirrelBoss = SquirrelBoss;
