/**
 * SISTEMA DE FONDO PARALLAX NOCTURNO: FUSIÓN CHINA & LONDRES
 * Integra referencias icónicas de Londres (Big Ben, London Eye, farolas victorianas, cabina roja)
 * y de China (Pagodas de aleros curvados, farolillos rojos brillantes, ramas de cerezo, luna serena).
 * Completamente continuo, fluido y a 60 FPS sin saltos.
 */
class ParallaxBackground {
  constructor(canvasWidth, canvasHeight, groundY) {
    this.W = canvasWidth;
    this.H = canvasHeight;
    this.groundY = groundY;

    this.dist = 0;
    this.time = 0;

    // Estrellas titilantes en el cielo nocturno
    this.stars = Array.from({ length: 42 }, () => ({
      x: Math.random() * this.W,
      y: Math.random() * (this.groundY * 0.65),
      r: 0.7 + Math.random() * 1.5,
      blinkSpeed: 0.03 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.3 ? '#ffffff' : '#ffe8a3'
    }));

    // Nubes nocturnas traslúcidas estilo oriental / neblina londinense
    this.clouds = [
      { x: 80,  y: 36, scale: 1.15, speed: 0.16, alpha: 0.22 },
      { x: 340, y: 55, scale: 0.85, speed: 0.12, alpha: 0.18 },
      { x: 620, y: 30, scale: 1.3,  speed: 0.20, alpha: 0.25 },
      { x: 880, y: 58, scale: 0.9,  speed: 0.14, alpha: 0.20 }
    ];

    // Pétalos de flor de cerezo y chispas de farolillos flotando en la brisa
    this.petals = Array.from({ length: 12 }, () => ({
      x: Math.random() * this.W,
      y: Math.random() * (this.groundY - 20),
      vx: 0.8 + Math.random() * 0.7,
      vy: 0.25 + Math.random() * 0.45,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.05,
      size: 3.5 + Math.random() * 2.8,
      swayOffset: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? '#f7a8b8' : '#fbcfe8'
    }));

    // Luciérnagas / destellos cálidos de farolillos
    this.fireflies = Array.from({ length: 8 }, () => ({
      x: Math.random() * this.W,
      y: 40 + Math.random() * (this.groundY - 60),
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.3
    }));
  }

  update(speed) {
    this.dist += speed;
    this.time += 0.02;

    // Actualizar nubes con velocidad propia + parallax sutil
    for (const c of this.clouds) {
      c.x -= (speed * 0.05 + c.speed);
      if (c.x < -160) {
        c.x = this.W + 40 + Math.random() * 80;
        c.y = 25 + Math.random() * 45;
      }
    }

    // Actualizar pétalos
    for (const p of this.petals) {
      p.x -= (speed * 0.35 + p.vx);
      p.y += p.vy + Math.sin(this.time * 2 + p.swayOffset) * 0.35;
      p.rot += p.vRot;

      if (p.x < -20 || p.y > this.groundY - 4) {
        p.x = this.W + 20 + Math.random() * 50;
        p.y = 10 + Math.random() * (this.groundY * 0.6);
      }
    }

    // Actualizar luciérnagas
    for (const ff of this.fireflies) {
      ff.x -= (speed * 0.2 + ff.speed);
      if (ff.x < -20) {
        ff.x = this.W + 20 + Math.random() * 40;
        ff.y = 40 + Math.random() * (this.groundY - 70);
      }
    }
  }

  draw(ctx, progressRatio = 0) {
    // 1. CIELO NOCTURNO PROFUNDO (Azul medianoche a índigo y violeta crepúsculo)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, '#0a1024');    // Medianoche profundo
    skyGrad.addColorStop(0.55, '#161c38'); // Índigo romántico
    skyGrad.addColorStop(1, '#252646');    // Resplandor crepuscular cálido
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.W, this.groundY);

    // 2. ESTRELLAS TITILANTES
    this._drawStars(ctx);

    // 3. LUNA LLENA / CRECIENTE CON HALO CÁLIDO
    this._drawMoon(ctx);

    // 4. NUBES NOCTURNAS SUAVES
    this._drawClouds(ctx);

    // 5. CAPA LEJANA (Big Ben, London Eye, Pagoda y montañas en la niebla) (Parallax: 0.05)
    this._drawDistantLandmarks(ctx);

    // 6. CAPA MEDIA (Casas victorianas, tejados chinos con aleros curvados y farolillos rojos) (Parallax: 0.18)
    this._drawMidgroundTown(ctx);

    // 7. PÉTALOS DE CEREZO Y LUCIÉRNAGAS
    this._drawPetalsAndFireflies(ctx);

    // 8. SUELO NOCTURNO Y FAROLAS VICTORIANAS CON FAROLILLOS CHINOS
    this._drawGround(ctx);
  }

  _drawStars(ctx) {
    ctx.save();
    for (const s of this.stars) {
      const alpha = 0.35 + Math.sin(this.time * 2 + s.phase) * 0.35;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawMoon(ctx) {
    ctx.save();
    const moonX = this.W - 140;
    const moonY = 65;

    // Gran halo suave alrededor de la luna
    const halo = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 75);
    halo.addColorStop(0, 'rgba(255, 243, 204, 0.45)');
    halo.addColorStop(0.5, 'rgba(255, 230, 180, 0.15)');
    halo.addColorStop(1, 'rgba(255, 230, 180, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 75, 0, Math.PI * 2);
    ctx.fill();

    // Luna creciente dorada suave
    ctx.fillStyle = '#fff9e6';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Sombra para dar efecto de luna mágica
    ctx.fillStyle = '#11172f';
    ctx.beginPath();
    ctx.arc(moonX - 7, moonY - 4, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawClouds(ctx) {
    ctx.save();
    for (const c of this.clouds) {
      ctx.fillStyle = `rgba(180, 195, 230, ${c.alpha})`;
      const s = c.scale;
      const x = c.x;
      const y = c.y;

      ctx.beginPath();
      ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
      ctx.arc(x + 24 * s, y - 6 * s, 15 * s, 0, Math.PI * 2);
      ctx.arc(x + 46 * s, y, 17 * s, 0, Math.PI * 2);
      ctx.arc(x + 22 * s, y + 4 * s, 14 * s, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  _drawDistantLandmarks(ctx) {
    ctx.save();
    const offset = (this.dist * 0.05);
    ctx.fillStyle = 'rgba(38, 45, 78, 0.55)';

    // Silueta de base de colinas / neblina lejana
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    for (let x = 0; x <= this.W + 20; x += 20) {
      const worldX = x + offset;
      const y = this.groundY - 55 - Math.sin(worldX * 0.004) * 22 - Math.cos(worldX * 0.008) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.W, this.groundY);
    ctx.closePath();
    ctx.fill();

    // Cada ciclo de 900px renderizamos Big Ben + London Eye + Pagoda china
    const cycle = 900;
    const startCycle = Math.floor(offset / cycle) * cycle;

    for (let cX = startCycle - cycle; cX <= offset + this.W + cycle; cX += cycle) {
      // 1. BIG BEN (Londres)
      const bigBenX = cX - offset + 120;
      if (bigBenX >= -80 && bigBenX <= this.W + 80) {
        this._drawDistantBigBen(ctx, bigBenX, this.groundY);
      }

      // 2. THE LONDON EYE (Rueda de la fortuna iluminada)
      const eyeX = cX - offset + 290;
      if (eyeX >= -80 && eyeX <= this.W + 80) {
        this._drawDistantLondonEye(ctx, eyeX, this.groundY - 35);
      }

      // 3. PAGODA CHINA (Al alimón con aleros de estilo tradicional)
      const pagodaX = cX - offset + 550;
      if (pagodaX >= -80 && pagodaX <= this.W + 80) {
        this._drawDistantPagoda(ctx, pagodaX, this.groundY);
      }
    }

    ctx.restore();
  }

  _drawDistantBigBen(ctx, x, groundY) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.fillStyle = '#1e2444';

    // Torre principal
    ctx.fillRect(-12, -125, 24, 125);
    // Moldura bajo el reloj
    ctx.fillRect(-14, -135, 28, 10);
    // Sección del reloj
    ctx.fillRect(-13, -155, 26, 20);

    // Reloj iluminado en oro cálido (marca distintiva del Big Ben)
    ctx.fillStyle = '#fff1b0';
    ctx.beginPath();
    ctx.arc(0, -145, 6, 0, Math.PI * 2);
    ctx.fill();
    // Manecillas diminutas
    ctx.strokeStyle = '#1e2444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -145);
    ctx.lineTo(0, -149);
    ctx.moveTo(0, -145);
    ctx.lineTo(3, -145);
    ctx.stroke();

    // Campana y pináculos góticos
    ctx.fillStyle = '#1e2444';
    ctx.fillRect(-11, -168, 22, 13);
    // Pináculos en las esquinas
    ctx.fillRect(-13, -172, 3, 8);
    ctx.fillRect(10, -172, 3, 8);
    // Aguja gótica superior
    ctx.beginPath();
    ctx.moveTo(-9, -168);
    ctx.lineTo(0, -195);
    ctx.lineTo(9, -168);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  _drawDistantLondonEye(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(255, 235, 180, 0.35)';
    ctx.lineWidth = 1.5;

    // Rueda exterior
    const R = 32;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.stroke();

    // Rayos / radios
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
      ctx.stroke();
    }

    // Patas de soporte
    ctx.strokeStyle = 'rgba(38, 45, 78, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-14, 40);
    ctx.moveTo(0, 0);
    ctx.lineTo(14, 40);
    ctx.stroke();

    ctx.restore();
  }

  _drawDistantPagoda(ctx, x, groundY) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.fillStyle = '#1c2242';

    // 4 niveles de pagoda con aleros curvados hacia arriba (飞檐)
    const levels = [
      { y: 0,   w: 38, h: 22, eaveW: 52 },
      { y: -22, w: 30, h: 20, eaveW: 42 },
      { y: -42, w: 24, h: 18, eaveW: 34 },
      { y: -60, w: 18, h: 16, eaveW: 26 }
    ];

    for (const lvl of levels) {
      // Cuerpo del piso
      ctx.fillRect(-lvl.w / 2, lvl.y - lvl.h, lvl.w, lvl.h);

      // Ventanita tenue oriental
      ctx.fillStyle = '#fce29d';
      ctx.fillRect(-2, lvl.y - lvl.h + 5, 4, 6);

      // Alero curvo chino tradicional
      ctx.fillStyle = '#1c2242';
      ctx.beginPath();
      ctx.moveTo(-lvl.eaveW / 2, lvl.y - lvl.h);
      ctx.quadraticCurveTo(0, lvl.y - lvl.h - 5, lvl.eaveW / 2, lvl.y - lvl.h);
      ctx.lineTo(lvl.eaveW / 2 - 3, lvl.y - lvl.h + 3);
      ctx.lineTo(-lvl.eaveW / 2 + 3, lvl.y - lvl.h + 3);
      ctx.closePath();
      ctx.fill();
    }

    // Aguja / remate tradicional en la punta de la pagoda
    ctx.fillRect(-1.5, -88, 3, 14);
    ctx.beginPath();
    ctx.arc(0, -89, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawMidgroundTown(ctx) {
    ctx.save();
    const offset = (this.dist * 0.18);
    ctx.fillStyle = '#222744';

    // Terreno y colina media
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    for (let x = 0; x <= this.W + 15; x += 15) {
      const worldX = x + offset;
      const y = this.groundY - 32 - Math.sin(worldX * 0.007) * 14 - Math.cos(worldX * 0.014) * 6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.W, this.groundY);
    ctx.closePath();
    ctx.fill();

    // Edificios combinados: Townhouses victorianas con chimeneas + Pabellones con farolillos rojos
    const cycle = 720;
    const startCycle = Math.floor(offset / cycle) * cycle;

    for (let cX = startCycle - cycle; cX <= offset + this.W + cycle; cX += cycle) {
      // 1. Casa victoriana con chimenea y ventanas encendidas
      const houseX = cX - offset + 80;
      if (houseX >= -80 && houseX <= this.W + 80) {
        this._drawVictorianHouse(ctx, houseX, this.groundY - 30);
      }

      // 2. Pabellón con alero tradicional y farolillos chinos rojos encendidos
      const pavilionX = cX - offset + 360;
      if (pavilionX >= -80 && pavilionX <= this.W + 80) {
        this._drawChinesePavilion(ctx, pavilionX, this.groundY - 28);
      }

      // 3. Clásica cabina telefónica roja londinense en silueta
      const boothX = cX - offset + 220;
      if (boothX >= -40 && boothX <= this.W + 40) {
        this._drawTelephoneBooth(ctx, boothX, this.groundY - 26);
      }
    }

    ctx.restore();
  }

  _drawVictorianHouse(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // Fachada victoriana
    ctx.fillStyle = '#2b3052';
    ctx.fillRect(0, -32, 38, 32);

    // Techo a dos aguas con chimenea londinense
    ctx.fillStyle = '#1c203b';
    ctx.beginPath();
    ctx.moveTo(-4, -32);
    ctx.lineTo(19, -48);
    ctx.lineTo(42, -32);
    ctx.closePath();
    ctx.fill();

    // Chimenea con remate
    ctx.fillRect(26, -55, 6, 16);
    ctx.fillRect(24, -57, 10, 3);

    // Ventanas victorianas con luz cálida
    ctx.fillStyle = '#fde28e';
    ctx.fillRect(6, -26, 8, 10);
    ctx.fillRect(24, -26, 8, 10);

    // Marcos de ventana
    ctx.strokeStyle = '#2b3052';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, -26, 8, 10);
    ctx.strokeRect(24, -26, 8, 10);
    ctx.restore();
  }

  _drawChinesePavilion(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Pilares de madera oscura
    ctx.fillStyle = '#3a2026';
    ctx.fillRect(4, -26, 4, 26);
    ctx.fillRect(36, -26, 4, 26);

    // Interior iluminado
    ctx.fillStyle = 'rgba(255, 180, 90, 0.25)';
    ctx.fillRect(8, -24, 28, 24);

    // Techo con curvatura china acentuada
    ctx.fillStyle = '#1f2440';
    ctx.beginPath();
    ctx.moveTo(-6, -26);
    ctx.quadraticCurveTo(22, -38, 50, -26);
    ctx.quadraticCurveTo(22, -30, -6, -26);
    ctx.fill();

    // Farolillos rojos colgando de las esquinas del alero
    this._drawHangingLantern(ctx, -2, -22);
    this._drawHangingLantern(ctx, 46, -22);

    ctx.restore();
  }

  _drawTelephoneBooth(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // Cabina roja clásica (K6 Telephone Box)
    ctx.fillStyle = '#c73e3a';
    ctx.fillRect(0, -28, 13, 28);
    // Cúpula superior
    ctx.beginPath();
    ctx.arc(6.5, -28, 6.5, Math.PI, 0);
    ctx.fill();
    // Ventanita con luz tenue
    ctx.fillStyle = '#fff4ce';
    ctx.fillRect(2.5, -22, 8, 16);
    ctx.restore();
  }

  _drawHangingLantern(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Cuerda
    ctx.strokeStyle = 'rgba(255, 220, 180, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 4);
    ctx.stroke();

    // Resplandor cálido del farolillo
    const glow = ctx.createRadialGradient(0, 10, 2, 0, 10, 16);
    glow.addColorStop(0, 'rgba(255, 60, 90, 0.6)');
    glow.addColorStop(0.6, 'rgba(255, 120, 50, 0.25)');
    glow.addColorStop(1, 'rgba(255, 60, 90, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 10, 16, 0, Math.PI * 2);
    ctx.fill();

    // Farolillo ovalado rojo
    ctx.fillStyle = '#e8334a';
    ctx.beginPath();
    ctx.ellipse(0, 10, 5.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ribete dorado y borla inferior
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(-3, 3, 6, 1.5);
    ctx.fillRect(-3, 17, 6, 1.5);

    ctx.strokeStyle = '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(0, 23);
    ctx.stroke();

    ctx.restore();
  }

  _drawPetalsAndFireflies(ctx) {
    ctx.save();

    // 1. Luciérnagas parpadeantes
    for (const ff of this.fireflies) {
      const alpha = 0.4 + Math.sin(this.time * 3 + ff.phase) * 0.4;
      const glow = ctx.createRadialGradient(ff.x, ff.y, 1, ff.x, ff.y, 8);
      glow.addColorStop(0, 'rgba(255, 230, 100, 0.9)');
      glow.addColorStop(1, 'rgba(255, 180, 50, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Pétalos de cerezo flotantes
    for (const p of this.petals) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  _drawGround(ctx) {
    const H = this.H;
    const W = this.W;
    const gY = this.groundY;

    // Suelo nocturno: adoquines londinenses y césped bajo la luz de la luna
    const groundGrad = ctx.createLinearGradient(0, gY, 0, H);
    groundGrad.addColorStop(0, '#242337');
    groundGrad.addColorStop(0.3, '#1c1b2c');
    groundGrad.addColorStop(1, '#131220');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, gY, W, H - gY);

    // Borde de césped nocturno con toque azulado
    ctx.fillStyle = '#39464e';
    ctx.fillRect(0, gY - 2, W, 4);

    // Textura continua y adoquines matemáticamente perfectos sin saltos
    const TILE_W = 48;
    const startX = -(this.dist % TILE_W);

    for (let x = startX; x < W + TILE_W; x += TILE_W) {
      // Hierba nocturna estilizada
      ctx.fillStyle = '#4f6068';
      ctx.beginPath();
      ctx.moveTo(x + 4, gY - 2);
      ctx.lineTo(x + 7, gY - 7);
      ctx.lineTo(x + 9, gY - 2);
      ctx.fill();

      // Adoquines con relieve suave
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(x + 12, gY + 10, 22, 6);
      ctx.fillRect(x + 28, gY + 24, 18, 5);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x + 12, gY + 16, 22, 1.5);
      ctx.fillRect(x + 28, gY + 29, 18, 1.5);
    }

    // Farolas victorianas de gas ornamentadas con farolillos chinos colgantes
    const lampCycle = 380;
    const startLamp = Math.floor(this.dist / lampCycle) * lampCycle;

    for (let lX = startLamp - lampCycle; lX <= this.dist + W + lampCycle; lX += lampCycle) {
      const screenX = lX - this.dist + 160;
      if (screenX >= -40 && screenX <= W + 40) {
        this._drawVictorianGasLamp(ctx, screenX, gY);
      }
    }

    // Línea de contorno nocturna
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, gY - 2);
    ctx.lineTo(W, gY - 2);
    ctx.stroke();
  }

  _drawVictorianGasLamp(ctx, x, groundY) {
    ctx.save();
    ctx.translate(x, groundY);

    // Cono de luz cálida proyectado en el suelo
    const lightCone = ctx.createRadialGradient(0, -68, 6, 0, 0, 80);
    lightCone.addColorStop(0, 'rgba(255, 235, 160, 0.35)');
    lightCone.addColorStop(0.5, 'rgba(255, 210, 130, 0.12)');
    lightCone.addColorStop(1, 'rgba(255, 210, 130, 0)');
    ctx.fillStyle = lightCone;
    ctx.beginPath();
    ctx.moveTo(0, -68);
    ctx.lineTo(-45, 0);
    ctx.lineTo(45, 0);
    ctx.closePath();
    ctx.fill();

    // Poste de hierro negro victoriano
    ctx.fillStyle = '#151624';
    // Base ornamental
    ctx.fillRect(-5, -6, 10, 6);
    ctx.fillRect(-3, -65, 6, 59);

    // Soporte curvo victoriano
    ctx.strokeStyle = '#151624';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(8, -62, 7, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // Cabeza de la farola de gas (hexagonal clásica)
    ctx.fillStyle = '#151624';
    ctx.fillRect(-7, -84, 14, 3); // Tapa
    ctx.beginPath();
    ctx.moveTo(-7, -84);
    ctx.lineTo(0, -92);
    ctx.lineTo(7, -84);
    ctx.fill();

    // Cristal encendido con llama de gas cálida
    ctx.fillStyle = '#ffefa8';
    ctx.fillRect(-5, -81, 10, 12);
    ctx.fillStyle = '#ff9f43';
    ctx.beginPath();
    ctx.arc(0, -75, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pequeño farolillo chino rojo colgando del soporte lateral de la farola
    this._drawHangingLantern(ctx, 15, -60);

    ctx.restore();
  }
}

window.ParallaxBackground = ParallaxBackground;
