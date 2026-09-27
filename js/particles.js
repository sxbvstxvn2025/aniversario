/**
 * SISTEMA DE PARTÍCULAS Y TEXTOS FLOTANTES
 * Proporciona feedback visual jugoso y adorable: destellos, corazones, polvo y puntuaciones.
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
  }

  reset() {
    this.particles = [];
    this.floatingTexts = [];
  }

  // Polvo al saltar y aterrizar
  puff(x, y, n = 6, color = '#e8c9a8') {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        type: 'dust',
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 3.5,
        vy: -Math.random() * 2.5 - 0.4,
        life: 1,
        maxLife: 1,
        decay: 0.035 + Math.random() * 0.02,
        r: 2.5 + Math.random() * 2.5,
        color: color
      });
    }
  }

  // Destellos estelares (al recoger estrellas o saltos dobles)
  sparkle(x, y, n = 8, color = '#f7d070') {
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 2.8;
      this.particles.push({
        type: 'sparkle',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
        life: 1,
        decay: 0.03 + Math.random() * 0.02,
        r: 3 + Math.random() * 2.5,
        color: color
      });
    }
  }

  // Corazoncitos flotantes
  heartBurst(x, y, n = 5) {
    const colors = ['#e8a9a0', '#d97f7f', '#f48fb1', '#ffb2b2'];
    for (let i = 0; i < n; i++) {
      this.particles.push({
        type: 'heart',
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -Math.random() * 2.6 - 1.2,
        scale: 0.6 + Math.random() * 0.5,
        life: 1,
        decay: 0.025,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  // Texto flotante de puntos o combo ("+25", "♥ x3!", etc.)
  addFloatingText(text, x, y, color = '#b85c48', size = 26) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -1.6,
      life: 1,
      decay: 0.022,
      color,
      size
    });
  }

  update(gameSpeed = 6) {
    // Actualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx - gameSpeed * 0.35;
      p.y += p.vy;
      if (p.type === 'dust') {
        p.vy += 0.08;
      } else if (p.type === 'heart') {
        p.vy += 0.02;
        p.vx += Math.sin(p.life * 10) * 0.15;
      }
      if (p.rot !== undefined) p.rot += p.vRot;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Actualizar textos flotantes
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.x -= gameSpeed * 0.25;
      ft.life -= ft.decay;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();

    // Dibujar partículas
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);

      if (p.type === 'dust') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        // Estrella de 4 puntas
        const s = p.r * p.life;
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.6);
        ctx.quadraticCurveTo(0, 0, s * 1.6, 0);
        ctx.quadraticCurveTo(0, 0, 0, s * 1.6);
        ctx.quadraticCurveTo(0, 0, -s * 1.6, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s * 1.6);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'heart') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.scale * p.life, p.scale * p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.bezierCurveTo(-5, -6, -11, 2, 0, 11);
        ctx.bezierCurveTo(11, 2, 5, -6, 0, 3);
        ctx.fill();
        ctx.restore();
      }
    }

    // Dibujar textos flotantes
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.font = `bold ${ft.size}px 'HandwritingUI', 'Caveat', cursive, sans-serif`;
      ctx.textAlign = 'center';

      // Sombra sutil para legibilidad
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }
}

window.ParticleSystem = ParticleSystem;
