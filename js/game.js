/**
 * MOTOR PRINCIPAL DEL JUEGO
 * Coordina física, bucle fijo, colisiones, generación dinámica de obstáculos y coleccionables,
 * combos, y transiciones de victoria.
 */
class Game {
  constructor(canvas, ui) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;

    this.W = canvas.width;
    this.H = canvas.height;
    this.groundY = this.H - 52;

    // Componentes del juego
    this.sound = window.sound;
    this.particles = new window.ParticleSystem();
    this.bg = new window.ParallaxBackground(this.W, this.H, this.groundY);
    this.bunny = new window.Bunny(this.groundY);
    this.kitty = new window.Kitty(this.groundY);

    this.obstacles = [];
    this.collectibles = [];

    // Estado del juego
    this.running = false;
    this.frozen = false;
    this.won = false;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.speed = CONFIG.SPEED_START;
    this.nextSpawn = 450;

    // Control de bucle (Fixed Timestep)
    this.rafId = null;
    this.acc = 0;
    this.lastTime = 0;
  }

  start() {
    this.running = true;
    this.frozen = false;
    this.won = false;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.speed = CONFIG.SPEED_START;
    this.nextSpawn = 400;

    this.obstacles = [];
    this.collectibles = [];
    this.particles.reset();
    this.bunny.reset();
    this.kitty.reset();

    this.ui.updateScore(0);
    this.ui.hideStartScreen();
    this.ui.unfreezeWrap();

    if (this.sound) this.sound.init();
  }

  jump() {
    if (!this.running || this.frozen) return;
    const didJump = this.bunny.jump(this.particles, this.sound);
    if (didJump) {
      this.kitty.onBunnyJump();
    }
  }

  update() {
    // 1. Progresión suave de velocidad
    const progress = Math.min(1, this.score / CONFIG.TARGET_SCORE);
    this.speed = Math.min(
      CONFIG.SPEED_MAX,
      CONFIG.SPEED_START + progress * (CONFIG.SPEED_MAX - CONFIG.SPEED_START)
    );

    // 2. Acumulación de puntuación continua por distancia recorrida
    this.score += CONFIG.PTS_PER_SEC / 60;
    this.ui.updateScore(Math.floor(this.score));

    // 3. Temporizador de combo
    if (this.combo > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    // 4. ¿Meta alcanzada? (Desbloquear carta romántica)
    if (this.score >= CONFIG.TARGET_SCORE && !this.won) {
      this.triggerEasterEgg();
      return;
    }

    // 5. Actualizar fondo continuo y suave
    this.bg.update(this.speed);

    // 6. Actualizar jugador (conejito) y compañero (gatito)
    this.bunny.update(this.speed, this.particles, this.sound);
    this.kitty.update(this.bunny, this.speed, this.particles);

    // 7. Actualizar obstáculos
    for (const ob of this.obstacles) {
      ob.update(this.speed);
    }
    this.obstacles = this.obstacles.filter(ob => ob.x > -80);

    // 8. Actualizar coleccionables
    for (const col of this.collectibles) {
      col.update(this.speed);
    }
    this.collectibles = this.collectibles.filter(col => col.x > -50 && !col.collected);

    // 9. Spawn dinámico de patrones divertidos
    this.nextSpawn -= this.speed;
    if (this.nextSpawn <= 0) {
      this.spawnPattern();
      const speedRatio = this.speed / CONFIG.SPEED_START;
      this.nextSpawn = (CONFIG.SPAWN_GAP_MIN + Math.random() * CONFIG.SPAWN_GAP_VAR) * speedRatio;
    }

    // 10. Partículas
    this.particles.update(this.speed);

    // 11. Colisiones y recolección
    this.checkCollisions();
  }

  spawnPattern() {
    // Tipos de patrones aleatorios para gameplay entretenido
    const patternType = Math.floor(Math.random() * 5);
    const spawnX = this.W + 40;

    const OB_TYPES = ['carrot', 'flower', 'bush', 'sleeping_snail', 'bounce_mushroom'];
    const chosenType = OB_TYPES[Math.floor(Math.random() * OB_TYPES.length)];

    const obstacle = new window.Obstacle(spawnX, this.groundY, chosenType);
    this.obstacles.push(obstacle);

    // Crear coleccionables según el contexto
    if (chosenType === 'bounce_mushroom') {
      // Si hay un hongo elástico, ponemos una constelación de estrellas altas en el cielo
      this.collectibles.push(new window.Collectible(spawnX + 40, this.groundY - 145, 'star'));
      this.collectibles.push(new window.Collectible(spawnX + 85, this.groundY - 170, 'star'));
      this.collectibles.push(new window.Collectible(spawnX + 130, this.groundY - 145, 'star'));
    } else if (patternType === 1) {
      // Arco de 3 corazones sobre el obstáculo
      this.collectibles.push(new window.Collectible(spawnX - 35, this.groundY - 60, 'heart'));
      this.collectibles.push(new window.Collectible(spawnX, this.groundY - 95, 'heart'));
      this.collectibles.push(new window.Collectible(spawnX + 35, this.groundY - 60, 'heart'));
    } else if (patternType === 2) {
      // Una fresita dulce flotante que requiere salto
      this.collectibles.push(new window.Collectible(spawnX + 120, this.groundY - 80, 'strawberry'));
    } else {
      // Corazoncito tentador
      if (Math.random() > 0.35) {
        this.collectibles.push(new window.Collectible(spawnX + 60, this.groundY - 55, 'heart'));
      }
    }
  }

  checkCollisions() {
    const bHit = this.bunny.getHitbox();

    // 1. Revisar coleccionables
    for (const col of this.collectibles) {
      if (col.collected) continue;
      const cHit = col.getHitbox();

      if (
        bHit.x < cHit.x + cHit.w &&
        bHit.x + bHit.w > cHit.x &&
        bHit.y < cHit.y + cHit.h &&
        bHit.y + bHit.h > cHit.y
      ) {
        col.collected = true;
        this.combo++;
        this.comboTimer = 180; // 3 segundos para mantener combo

        const comboMultiplier = 1 + Math.min(this.combo - 1, 5) * 0.25;
        const earned = Math.round(col.points * comboMultiplier);
        this.score += earned;

        // Feedback sonoro y visual
        if (col.type === 'star') {
          if (this.sound) this.sound.collectStar();
          this.particles.sparkle(col.x, col.y, 10, '#fbe39d');
        } else {
          if (this.sound) this.sound.collect(this.combo);
          this.particles.heartBurst(col.x, col.y, 6);
        }

        // Avisar al gatito para que purree con corazoncitos
        this.kitty.onBunnyCollect();

        // Texto flotante
        this.particles.addFloatingText(`+${earned}`, col.x, col.y - 12);
        if (this.combo > 1) {
          const praises = ['♥ x' + this.combo, 'Cute! ♥', 'I love you! ✨', 'Amazing! 💕', 'So sweet! 🌸'];
          const text = praises[Math.min(this.combo - 2, praises.length - 1)];
          this.particles.addFloatingText(text, col.x, col.y - 32, '#d97f7f', 28);
        }
      }
    }

    // 2. Revisar obstáculos
    for (const ob of this.obstacles) {
      const oHit = ob.getHitbox();

      // Detección de hongo elástico cuando se cae sobre él
      if (ob.isBounce) {
        const footY = this.bunny.y;
        const mushroomTop = this.groundY - ob.h;

        // Si el conejito aterriza desde arriba en el hongo
        if (
          this.bunny.vy >= 0 &&
          footY >= mushroomTop - 6 &&
          footY <= mushroomTop + 24 &&
          this.bunny.x >= ob.x - ob.w &&
          this.bunny.x <= ob.x + ob.w
        ) {
          ob.triggerBounce();
          this.bunny.bounce(CONFIG.BOUNCE_PAD_FORCE, this.particles, this.sound);
          this.combo++;
          this.kitty.onBunnyJump();
          this.particles.addFloatingText('BOING! ✨', ob.x, mushroomTop - 25, '#e85d75', 28);
          continue;
        }
      }

      // Colisión normal (tropiezo)
      if (
        bHit.x < oHit.x + oHit.w &&
        bHit.x + bHit.w > oHit.x &&
        bHit.y < oHit.y + oHit.h &&
        bHit.y + bHit.h > oHit.y
      ) {
        this.gameOver();
        return;
      }
    }
  }

  gameOver() {
    this.running = false;
    if (this.sound) this.sound.hit();
    this.particles.puff(this.bunny.x, this.bunny.y, 10, '#f28b82');
    this.ui.showGameOver(Math.floor(this.score));
  }

  triggerEasterEgg() {
    this.won = true;
    this.frozen = true;
    if (this.sound) this.sound.victory();

    this.particles.heartBurst(this.bunny.x, this.bunny.y - 30, 16);
    this.particles.sparkle(this.kitty.x, this.kitty.y - 20, 14, '#f7d070');

    this.ui.freezeWrap();
    setTimeout(() => {
      this.ui.showKeyModal();
    }, 550);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.W, this.H);

    // Fondo Parallax suave y continuo
    const progress = Math.min(1, this.score / CONFIG.TARGET_SCORE);
    this.bg.draw(this.ctx, progress);

    // Obstáculos
    for (const ob of this.obstacles) {
      ob.draw(this.ctx);
    }

    // Coleccionables
    for (const col of this.collectibles) {
      col.draw(this.ctx);
    }

    // Gatito compañero (sigue de cerca)
    this.kitty.draw(this.ctx);

    // Conejito principal
    this.bunny.draw(this.ctx);

    // Partículas y textos flotantes
    this.particles.draw(this.ctx);

    // Marcador interno de respaldo por si el HUD externo está oculto
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(92, 66, 50, 0.65)';
    this.ctx.font = '600 34px "HandwritingUI", "Cormorant Garamond", cursive, serif';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('♥ ' + Math.floor(this.score), this.W - 20, 40);
    this.ctx.restore();
  }

  loop(ts) {
    this.rafId = requestAnimationFrame(t => this.loop(t));
    if (!this.lastTime) this.lastTime = ts;
    const dt = Math.min(ts - this.lastTime, 100);
    this.lastTime = ts;

    if (this.running && !this.frozen) {
      this.acc += dt;
      while (this.acc >= 1000 / 60) {
        this.update();
        this.acc -= 1000 / 60;
        if (this.frozen) break;
      }
    }

    this.draw();
  }
}

window.Game = Game;
