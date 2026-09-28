/**
 * CONFIGURACIÓN GLOBAL DEL JUEGO
 * Puedes personalizar la clave secreta, la meta de puntos, la física y los textos desde aquí.
 */
const CONFIG = {
  // Puntuación objetivo para desbloquear la carta
  TARGET_SCORE: 1914,

  // Puntuación para la épica batalla contra la Ardilla Malévola
  BOSS_SCORE: 2809,
  BOSS_MAX_HP: 6,

  // Clave secreta para desbloquear la carta
  SECRET_KEY: "GATONUBE",

  // Ajustes de física
  GRAVITY: 0.64,
  JUMP_FORCE: -13.8,
  DOUBLE_JUMP_FORCE: -11.5,
  BOUNCE_PAD_FORCE: -18.2, // Impulso al pisar hongos elásticos

  // Velocidad y progresión
  SPEED_START: 5.6,
  SPEED_MAX: 10.2,
  PTS_PER_SEC: 35,

  // Puntos por coleccionables
  HEART_PTS: 25,
  STAR_PTS: 50,
  STRAWBERRY_PTS: 75,

  // Espaciado entre obstáculos y coleccionables
  SPAWN_GAP_MIN: 440,
  SPAWN_GAP_VAR: 480,
  HITBOX_PAD: 7,

  // Tolerancia de control para una jugabilidad fluida
  COYOTE_TIME: 7,    // frames de tolerancia tras caer de una superficie
  JUMP_BUFFER: 7,    // frames para registrar pulsación previa al aterrizaje

  // Paleta de colores cozy / pastel
  COLORS: {
    bg: '#f6e8d8',
    bgDeep: '#eed9c3',
    paper: '#fffaf2',
    ink: '#5c4232',
    terracota: '#c96f4a',
    rose: '#e8a9a0',
    roseDeep: '#d97f7f',
    accent: '#b85c48',
    gold: '#f4b251',
    leafGreen: '#7fae6a'
  }
};
