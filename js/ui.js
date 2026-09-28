/**
 * GESTOR DE INTERFAZ DE USUARIO (UI)
 * Maneja pantallas de inicio, Game Over, HUD, Modal de Clave Secreta y Carta de Amor.
 */
class UIManager {
  constructor() {
    this.hudScore = document.getElementById('score');
    this.hudWrap = document.getElementById('hud');
    this.muteBtn = document.getElementById('mute-btn');
    this.wrap = document.getElementById('game-wrap');
    this.startScr = document.getElementById('start-screen');
    this.overlay = document.getElementById('overlay');
    this.modal = document.getElementById('key-modal');
    this.keyInput = document.getElementById('key-input');
    this.keyBtn = document.getElementById('key-submit');
    this.keyError = document.getElementById('key-error');
    this.letterSc = document.getElementById('letter-screen');
    this.continueBtn = document.getElementById('continue-game-btn');
    this.bossWarning = document.getElementById('boss-warning');
    this.bossHud = document.getElementById('boss-hud');
    this.bossHpBar = document.getElementById('boss-hp-bar');
    this.victoryModal = document.getElementById('victory-modal');
    this.victoryRestartBtn = document.getElementById('victory-restart-btn');

    this.onKeySuccessCallback = null;
    this.onContinueGameCallback = null;
    this.onVictoryRestartCallback = null;
    this._bindEvents();
    this.updateMuteIcon();
    this.loadLoveLetterFromTxt();
  }

  async loadLoveLetterFromTxt() {
    try {
      const response = await fetch(`LoveLetter.txt?_t=${Date.now()}`);
      if (!response.ok) return;
      const text = await response.text();
      if (text && text.trim().length > 0) {
        this.parseAndRenderLetter(text);
      }
    } catch (err) {
      // In local file:// environments where fetch might be restricted, fallback HTML already in index.html is used.
      console.warn('LoveLetter.txt fetch notice (using pre-filled letter fallback):', err);
    }
  }

  parseAndRenderLetter(rawText) {
    if (!rawText || !rawText.trim()) return;

    const greetingEl = document.getElementById('letter-greeting');
    const bodyEl = document.getElementById('letter-body');
    const signatureEl = document.getElementById('letter-signature');

    const rawLines = rawText.split(/\r?\n/).map(l => l.trim());
    const nonEmptyLines = rawLines.filter(l => l.length > 0);

    if (nonEmptyLines.length === 0) return;

    let greeting = '';
    let signature = '';

    // Check if first non-empty line looks like a greeting (< 60 chars)
    if (nonEmptyLines.length >= 2 && nonEmptyLines[0].length < 60) {
      greeting = nonEmptyLines[0];
    }

    // Check if last non-empty line looks like a signature
    if (nonEmptyLines.length >= 1) {
      const last = nonEmptyLines[nonEmptyLines.length - 1];
      if (/^[-—~]|\b(atte|con amor|love|suyo|tu|tuyo|siempre|besos)\b/i.test(last) || (last.length < 50 && nonEmptyLines.length >= 2)) {
        signature = last;
      }
    }

    let startIdx = 0;
    if (greeting) {
      startIdx = rawLines.findIndex(l => l === greeting) + 1;
    }
    let endIdx = rawLines.length;
    if (signature) {
      for (let i = rawLines.length - 1; i >= 0; i--) {
        if (rawLines[i] === signature) {
          endIdx = i;
          break;
        }
      }
    }

    const middleRaw = rawLines.slice(startIdx, endIdx);
    while (middleRaw.length && middleRaw[0] === '') middleRaw.shift();
    while (middleRaw.length && middleRaw[middleRaw.length - 1] === '') middleRaw.pop();
    const bodyText = middleRaw.length ? middleRaw.join('\n') : rawText.trim();

    if (greetingEl && greeting) {
      greetingEl.textContent = greeting;
    }
    if (bodyEl && bodyText) {
      bodyEl.textContent = bodyText;
    }
    if (signatureEl && signature) {
      signatureEl.textContent = signature;
    }
  }

  _bindEvents() {
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.sound.toggleMute();
        this.updateMuteIcon();
      });
    }

    if (this.keyBtn) {
      this.keyBtn.addEventListener('click', () => this.submitKey());
    }

    if (this.keyInput) {
      this.keyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.submitKey();
      });
    }

    if (this.continueBtn) {
      this.continueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideLetterScreen();
        if (this.onContinueGameCallback) {
          this.onContinueGameCallback();
        }
      });
    }

    if (this.victoryRestartBtn) {
      this.victoryRestartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideVictoryModal();
        if (this.onVictoryRestartCallback) {
          this.onVictoryRestartCallback();
        }
      });
    }
  }

  updateMuteIcon() {
    if (!this.muteBtn) return;
    const isMuted = window.sound.isMuted();
    this.muteBtn.innerHTML = isMuted ? '🔇' : '🔊';
    this.muteBtn.setAttribute('title', isMuted ? 'Activar sonido' : 'Silenciar sonido');
  }

  updateScore(score) {
    if (this.hudScore) {
      this.hudScore.textContent = score;
    }
  }

  hideStartScreen() {
    this.startScr.classList.add('hide');
  }

  showGameOver(score) {
    const h1 = this.startScr.querySelector('h1');
    const p = this.startScr.querySelector('p');
    const hint = this.startScr.querySelector('.hint');

    if (h1) h1.textContent = 'Casi!!! 🐰🐾';
    if (p) p.textContent = `Obtuviste ${score} puntotes. Yuyi y bebi creen en ti…`;
    if (hint) hint.textContent = 'Presiona en la pantalla o en la tecla de espacio para jugar de nuevo!!';

    this.startScr.classList.remove('hide');
  }

  freezeWrap() {
    this.wrap.classList.add('frozen');
  }

  unfreezeWrap() {
    this.wrap.classList.remove('frozen');
    this.wrap.style.opacity = '1';
  }

  showGameHud() {
    if (this.hudWrap) {
      this.hudWrap.style.opacity = '1';
    }
  }

  hideLetterScreen() {
    if (this.letterSc) {
      this.letterSc.classList.remove('show');
    }
  }

  showBossWarning() {
    if (!this.bossWarning) return;
    this.bossWarning.classList.add('show');
    setTimeout(() => {
      this.bossWarning.classList.remove('show');
    }, 2800);
  }

  showBossHud(hp, maxHp) {
    if (!this.bossHud) return;
    this.bossHud.classList.add('show');
    this.updateBossHp(hp, maxHp);
  }

  updateBossHp(hp, maxHp) {
    if (!this.bossHpBar) return;
    this.bossHpBar.innerHTML = '';
    for (let i = 0; i < maxHp; i++) {
      const dot = document.createElement('span');
      dot.className = 'boss-hp-dot ' + (i < hp ? 'active' : 'lost');
      dot.textContent = i < hp ? '🌰' : '💨';
      this.bossHpBar.appendChild(dot);
    }
  }

  hideBossHud() {
    if (this.bossHud) {
      this.bossHud.classList.remove('show');
    }
  }

  showVictoryModal(finalScore) {
    this.hideBossHud();
    if (this.victoryModal) {
      this.victoryModal.classList.add('show');
    }
  }

  hideVictoryModal() {
    if (this.victoryModal) {
      this.victoryModal.classList.remove('show');
    }
  }

  showKeyModal() {
    this.overlay.classList.add('show');
    if (this.keyInput) {
      this.keyInput.value = '';
      this.keyInput.focus({ preventScroll: true });
    }
  }

  async submitKey() {
    const val = this.keyInput.value.trim().toUpperCase().replace(/[\s\.\·\-\/]/g, '');
    const expected = (CONFIG.SECRET_KEY || 'GATONUBE').trim().toUpperCase().replace(/[\s\.\·\-\/]/g, '');

    if (val === expected) {
      // Re-fetch LoveLetter.txt in case the user edited it while playing
      await this.loadLoveLetterFromTxt();

      // Clave correcta: abrir carta
      this.overlay.classList.remove('show');
      this.wrap.style.opacity = '0';
      if (this.hudWrap) this.hudWrap.style.opacity = '0';

      setTimeout(() => {
        this.letterSc.classList.add('show');
      }, 500);

      if (this.onKeySuccessCallback) {
        this.onKeySuccessCallback();
      }
    } else {
      // Clave incorrecta: sacudir modal
      this.modal.classList.remove('shake');
      void this.modal.offsetWidth; // Forzar reflujo para reiniciar animación
      this.modal.classList.add('shake');
      this.keyError.classList.add('show');
      setTimeout(() => this.keyError.classList.remove('show'), 2400);
      this.keyInput.select();
    }
  }
}

window.UIManager = UIManager;
