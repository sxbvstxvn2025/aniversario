/**
 * PUNTO DE ENTRADA (BOOTSTRAP)
 * Conecta los módulos, gestiona entradas táctiles y de teclado multiplataforma.
 */
document.addEventListener('DOMContentLoaded', () => {
  const cv = document.getElementById('game');
  const ui = new window.UIManager();
  const game = new window.Game(cv, ui);

  // Iniciar audio en la primera interacción del usuario
  const startAudioOnGesture = () => {
    if (window.sound) window.sound.init();
    window.removeEventListener('pointerdown', startAudioOnGesture);
    window.removeEventListener('keydown', startAudioOnGesture);
  };
  window.addEventListener('pointerdown', startAudioOnGesture, { once: true });
  window.addEventListener('keydown', startAudioOnGesture, { once: true });

  // Manejo de teclado
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      const isModalOpen = ui.overlay.classList.contains('show') || ui.letterSc.classList.contains('show');
      if (isModalOpen) return;

      if (!game.running) {
        game.start();
      } else {
        game.jump();
      }
    }

    if (e.code === 'Enter' && ui.overlay.classList.contains('show')) {
      ui.submitKey();
    }
  });

  // Manejo táctil y de ratón unificado
  document.addEventListener('pointerdown', (e) => {
    // Si el clic fue en un botón, modal o la carta, no interferir con el salto
    if (
      e.target.closest('#key-modal') ||
      e.target.closest('#letter-screen') ||
      e.target.closest('#mute-btn')
    ) {
      return;
    }

    e.preventDefault();
    const isModalOpen = ui.overlay.classList.contains('show') || ui.letterSc.classList.contains('show');
    if (isModalOpen) return;

    if (!game.running) {
      game.start();
    } else {
      game.jump();
    }
  }, { passive: false });

  // Prevenir zoom accidental en iOS al tocar rápido para saltar
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    if (e.target.closest('#key-modal') || e.target.closest('#letter-screen')) return;
    const now = Date.now();
    if (now - lastTouch < 320) {
      e.preventDefault();
    }
    lastTouch = now;
  }, { passive: false });

  // Iniciar renderizado
  game.draw();
  requestAnimationFrame(ts => game.loop(ts));
});
