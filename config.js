// Configuração do estudo PHOTO SAFE
window.STUDY_CONFIG = {
  // 1) Cola aqui o URL da Web App do Google Apps Script (termina em /exec)
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyjJTFX2sKMIT-sLoh9UjLonPN1aFqP4xdxoaKfz9KRbA_U6O_jSISgClLPReob4YvEYw/exec",

  // Muda isto se alterares o estudo depois de começar a recolher dados
  STUDY_VERSION: "v1",

  // Desenho experimental
  FEEDS: [20, 50, 80],          // % de imagens geradas por IA em cada feed
  STAMP_ARMS: ["A", "B"],       // A = sem selos, B = selos PHOTO SAFE
  POSTS_PER_FEED: 10,
  CATEGORIES: ["animais", "comida", "natureza", "pessoas", "cidade"],
  PER_CATEGORY: 2,              // publicações por categoria em cada feed (5 x 2 = 10)
  STAMP_SHARE: 0.75,            // no grupo B, proporção de fotos reais com selo (as restantes ficam sem selo)

  // Texto do selo (o questionário usa o mesmo texto)
  STAMP_BRAND: "PHOTO SAFE",
  STAMP_LABEL: "Feita por humano",

  // Medição
  VISIBLE_THRESHOLD: 0.6,       // fração da publicação no ecrã para contar tempo
  DWELL_CAP_MS: 60000           // tempo máximo contado por publicação (dwell_ms); o bruto fica em dwell_raw_ms
};
