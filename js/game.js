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

    // Estado del Jefe Final (Ardilla Malévola) y continuación tras la carta
    this.boss = null;
    this.bossActive = false;
    this.bossDefeated = false;
    this.hasUnlockedLetter = false;
    this.continuingAfterLetter = false;
    this.screenShake = 0;

    // Callbacks de UI para continuar tras la carta y reiniciar tras victoria
    this.ui.onContinueGameCallback = () => this.continueAfterLetter();
    this.ui.onVictoryRestartCallback = () => this.start();

    // Control de bucle (Fixed Timestep)
    this.rafId = null;
    this.acc = 0;
    this.lastTime = 0;

    this.setupResponsiveCanvas();
  }

  setupResponsiveCanvas() {
    const updateSize = () => {
      // Pantalla móvil vertical o pantallas angostas: zoom cercano para personajes adorables y grandes
      const isMobile = window.innerWidth <= 640 || (window.innerWidth <= 900 && window.innerHeight > window.innerWidth);
      const targetW = isMobile ? 480 : 960;
      const targetH = 300;

      if (this.cv.width !== targetW || this.cv.height !== targetH) {
        this.cv.width = targetW;
        this.cv.height = targetH;
        this.W = targetW;
        this.H = targetH;
        this.groundY = this.H - 52;

        if (this.bg) {
          this.bg.resize(this.W, this.H, this.groundY);
        }
        if (this.bunny) {
          this.bunny.groundY = this.groundY;
          this.bunny.x = isMobile ? 70 : 90;
          if (this.bunny.onGround) this.bunny.y = this.groundY;
        }
        if (this.kitty) {
          this.kitty.groundY = this.groundY;
          this.kitty.x = isMobile ? 28 : 38;
          if (this.kitty.onGround) this.kitty.y = this.groundY;
        }
        if (this.boss) {
          this.boss.resize(this.W, this.groundY);
        }
      }
    };

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    updateSize();
  }

  start() {
    this.running = true;
    this.frozen = false;
    this.won = false;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.speed = CONFIG.SPEED_START;
    this.nextSpawn = this.W < 700 ? 280 : 400;

    this.boss = null;
    this.bossActive = false;
    this.bossDefeated = false;
    this.hasUnlockedLetter = false;
    this.continuingAfterLetter = false;
    this.screenShake = 0;
    this.graceFrames = 0;
    this.bunnyLives = 3;
    this.kittySupportTimer = 0;

    this.obstacles = [];
    this.collectibles = [];
    this.particles.reset();
    this.bunny.reset();
    this.kitty.reset();

    this.ui.updateScore(0);
    this.ui.hideStartScreen();
    this.ui.hideBossHud();
    this.ui.hideVictoryModal();
    this.ui.hideGraceBanner();
    this.ui.unfreezeWrap();

    if (this.sound) this.sound.init();
  }

  continueAfterLetter() {
    this.continuingAfterLetter = true;
    this.hasUnlockedLetter = true;
    this.won = false;
    this.frozen = false;
    this.running = true;

    // Despejar cualquier obstáculo para dar exactamente 3 segundos limpios
    this.obstacles = [];
    this.graceFrames = 180; // 3 segundos exactos a 60 FPS
    this.nextSpawn = 240;   // Retrasar el primer obstáculo después de los 3 segundos

    this.ui.unfreezeWrap();
    this.ui.showGameHud();
    this.ui.showGraceBanner('¡AGARRA LA ONDA! 3s sin obstáculos 💨');

    if (this.sound) this.sound.bounce();
    this.particles.confettiBurst(this.bunny.x, this.bunny.y - 20, 25);
    this.particles.addFloatingText('¡A CORRER! 🐾✨', this.bunny.x, this.bunny.y - 45, '#fcd34d', 28);
  }

  triggerBossFight() {
    this.bossActive = true;
    this.obstacles = []; // Despejar obstáculos normales para enfocar la batalla
    this.boss = new window.SquirrelBoss(this.W, this.groundY);
    this.screenShake = 16;
    this.bunnyLives = 3;
    this.kittySupportTimer = 0;
    this.bunny.invulnTimer = 0;

    this.ui.showBossWarning();
    this.ui.showBossHud(this.boss.hp, this.boss.maxHp, this.bunnyLives);
    if (this.sound) this.sound.bossAlert();
    this.particles.sparkle(this.W - 100, this.groundY - 140, 20, '#ff4757');
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

    // 4. ¿Meta de la carta alcanzada? (Desbloquear carta romántica a 1914 pts)
    if (this.score >= CONFIG.TARGET_SCORE && !this.won && !this.hasUnlockedLetter) {
      this.triggerEasterEgg();
      return;
    }

    // 4.5 ¿Meta de la batalla final alcanzada? (Ardilla Malévola a 2809 pts)
    if (this.score >= (CONFIG.BOSS_SCORE || 2809) && !this.bossActive && !this.bossDefeated) {
      this.triggerBossFight();
    }

    // 5. Actualizar fondo continuo y suave
    this.bg.update(this.speed);

    // 6. Actualizar jugador (conejito) y compañero (gatito)
    this.bunny.update(this.speed, this.particles, this.sound);
    this.kitty.update(this.bunny, this.speed, this.particles, this.sound);

    // 6.5 Manejo del período de gracia (5 segundos sin obstáculos para que el jugador agarre la onda)
    if (this.graceFrames > 0) {
      this.graceFrames--;
      const secsLeft = Math.ceil(this.graceFrames / 60);

      // Actualizar texto cada segundo (5, 4, 3, 2, 1)
      if (this.graceFrames % 60 === 0 && secsLeft > 0) {
        this.ui.updateGraceBanner(`¡AGARRA LA ONDA! ${secsLeft}s sin obstáculos 💨`);
      }

      // Spawning de coleccionables amigables para practicar saltos (a los 2s y 1s)
      if (this.graceFrames === 120 || this.graceFrames === 60) {
        this.collectibles.push(new window.Collectible(this.W + 20, this.groundY - 105, 'star'));
      }

      if (this.graceFrames === 0) {
        this.ui.updateGraceBanner('¡A DARLE CON TODO! 🚀🔥');
        setTimeout(() => this.ui.hideGraceBanner(), 1200);
      }
    }

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

    // 8.5 Actualizar Jefe Final (Ardilla Malévola)
    if (this.bossActive && this.boss) {
      this.boss.update(this.bunny, this.kitty, this.particles, this.sound, this.collectibles);

      // Disparo de apoyo de Kitty si pasan ~4 segundos sin disparar por coleccionables
      if (!this.boss.isDefeated) {
        this.kittySupportTimer = (this.kittySupportTimer || 0) + 1;
        if (this.kittySupportTimer >= 220) {
          this.kittySupportTimer = 0;
          this.kitty.fireHeartBeam(this.boss, this.sound, this.particles, (hitBoss) => {
            if (hitBoss) {
              this.ui.updateBossHp(hitBoss.hp, hitBoss.maxHp);
              this.screenShake = 10;
            }
          });
          this.particles.addFloatingText('¡APOYO GATUNO! 🐾💖', this.kitty.x, this.kitty.y - 30, '#ff4757', 24);
        }
      }

      // Revisar si el jefe terminó su animación de derrota
      if (this.boss.isDefeated && !this.bossDefeated) {
        if (this.boss.defeatTimer <= 30) {
          this.bossDefeated = true;
          this.bossActive = false;
          this.frozen = true;
          this.ui.showVictoryModal(Math.floor(this.score));
        }
      }
    }

    if (this.screenShake > 0) this.screenShake--;

    // 9. Spawn dinámico de patrones divertidos (pausado durante la batalla de jefe y período de gracia)
    if (!this.bossActive && this.graceFrames <= 0) {
      this.nextSpawn -= this.speed;
      if (this.nextSpawn <= 0) {
        this.spawnPattern();
        const speedRatio = this.speed / CONFIG.SPEED_START;
        const minGap = this.W < 700 ? 300 : CONFIG.SPAWN_GAP_MIN;
        const varGap = this.W < 700 ? 320 : CONFIG.SPAWN_GAP_VAR;
        this.nextSpawn = (minGap + Math.random() * varGap) * speedRatio;
      }
    }

    // 10. Partículas
    this.particles.update(this.speed);

    // 11. Colisiones y recolección
    this.checkCollisions();
  }

  spawnPattern() {
    if (this.bossActive || this.graceFrames > 0) return;

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

        // Si la batalla de jefe está activa, el gatito dispara su Rayo Gatuno
        if (this.bossActive && this.boss && !this.boss.isDefeated) {
          this.kittySupportTimer = 0;
          this.kitty.fireHeartBeam(this.boss, this.sound, this.particles, (hitBoss) => {
            if (hitBoss) {
              this.ui.updateBossHp(hitBoss.hp, hitBoss.maxHp);
              this.screenShake = 12;
            }
          });
          this.particles.addFloatingText('¡RAYO GATUNO! 🐾💖', col.x, col.y - 48, '#ff4757', 26);
        }

        // Texto flotante
        this.particles.addFloatingText(`+${earned}`, col.x, col.y - 12);
        if (this.combo > 1) {
          const praises = ['♥ x' + this.combo, 'Esooo! ♥', 'Te amo! ✨', 'Puntazos! 💕', 'Qué pro! :V', 'Chulada! 🌸'];
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
      if (this.graceFrames > 0) continue; // Inmune a obstáculos durante el período de gracia
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

    // 3. Revisar colisiones en la batalla contra la Ardilla Malévola
    if (this.bossActive && this.boss && !this.boss.isDefeated) {
      const bossHit = this.boss.getHitbox();

      // Colisión con bellotas arrojadas por la ardilla
      for (let i = this.boss.acorns.length - 1; i >= 0; i--) {
        const a = this.boss.acorns[i];
        const dx = (bHit.x + bHit.w / 2) - a.x;
        const dy = (bHit.y + bHit.h / 2) - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist < a.r + 14) {
          if (this.bunny.invulnTimer <= 0) {
            this.boss.acorns.splice(i, 1);
            this.takePlayerDamage('¡GOLPE DE BELLOTA! 🌰💥');
            break;
          }
        }
      }

      // Colisión con el cuerpo de la ardilla durante su picada rasante
      if (
        bHit.x < bossHit.x + bossHit.w &&
        bHit.x + bHit.w > bossHit.x &&
        bHit.y < bossHit.y + bossHit.h &&
        bHit.y + bHit.h > bossHit.y
      ) {
        // Si el conejito viene cayendo sobre la ardilla desde arriba: ¡BONK!
        const footY = this.bunny.y;
        const bossTop = this.boss.y - 10;

        if (this.bunny.vy >= 0 && footY <= bossTop + 28) {
          this.boss.takeDamage(1, this.particles, this.sound);
          this.ui.updateBossHp(this.boss.hp, this.boss.maxHp);
          this.bunny.bounce(CONFIG.BOUNCE_PAD_FORCE * 1.25, this.particles, this.sound);
          this.screenShake = 16;
          this.combo++;
          this.kitty.onBunnyJump();
          this.particles.confettiBurst(this.bunny.x, this.bunny.y, 25);
          this.particles.addFloatingText('¡PISOTÓN BONK! 💥', this.bunny.x, this.bunny.y - 35, '#fcd34d', 30);
        } else if (this.boss.invulnTimer <= 0 && this.bunny.invulnTimer <= 0) {
          // Daño a las vidas de los Babys (NO instakill)
          this.takePlayerDamage('¡CUIDADO CON LA ARDILLA! 🐿️💥');
        }
      }
    }
  }

  takePlayerDamage(reasonText) {
    this.bunnyLives--;
    this.bunny.invulnTimer = 85; // 1.4 segundos de parpadeo seguro
    this.screenShake = 14;
    this.combo = 0;
    this.ui.updatePlayerHp(this.bunnyLives);

    if (this.sound) this.sound.hit();
    this.particles.puff(this.bunny.x, this.bunny.y, 8, '#ff4757');
    this.particles.addFloatingText(reasonText, this.bunny.x, this.bunny.y - 30, '#ff4757', 26);

    if (this.bunnyLives <= 0) {
      this.gameOver();
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
    this.ctx.save();

    // Temblor de pantalla (Screen Shake en momentos de acción)
    if (this.screenShake > 0) {
      const s = this.screenShake * 0.45;
      this.ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }

    // Fondo Parallax suave y continuo
    const maxProgScore = this.bossActive ? (CONFIG.BOSS_SCORE || 2809) : CONFIG.TARGET_SCORE;
    const progress = Math.min(1, this.score / maxProgScore);
    this.bg.draw(this.ctx, progress);

    // Obstáculos
    for (const ob of this.obstacles) {
      ob.draw(this.ctx);
    }

    // Coleccionables
    for (const col of this.collectibles) {
      col.draw(this.ctx);
    }

    // Jefe Final (Ardilla Malévola)
    if (this.bossActive && this.boss) {
      this.boss.draw(this.ctx);
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
