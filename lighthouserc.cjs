module.exports = {
  ci: {
    collect: {
      startServerCommand: "npx next start --hostname 127.0.0.1 --port 4173",
      startServerReadyPattern: "Ready",
      url: [
        "http://127.0.0.1:4173/",
        "http://127.0.0.1:4173/oferta",
        "http://127.0.0.1:4173/zapytaj-o-termin",
        "http://127.0.0.1:4173/kontakt",
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--headless --no-sandbox",
        ...(process.env.CHROME_PATH ? { chromePath: process.env.CHROME_PATH } : {}),
      },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:performance": ["warn", { minScore: 0.6 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
