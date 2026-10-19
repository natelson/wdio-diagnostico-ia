// Configuração da suíte E2E do Banco Demo.
// ATENÇÃO (demo): esta suíte foi escrita propositalmente com problemas comuns
// em suítes E2E legadas, para servir de alvo do diagnóstico assistido por IA.
export const config = {
  runner: 'local',
  specs: ['./test/specs/**/*.e2e.js'],
  maxInstances: 1,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: process.env.HEADED ? ['--window-size=1280,900'] : ['--headless=new', '--window-size=1280,900'],
      },
    },
  ],
  logLevel: 'error',
  baseUrl: process.env.BASE_URL || 'http://localhost:4300',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: [
    'spec',
    ['junit', { outputDir: process.env.JUNIT_DIR || './resultados', outputFileFormat: (o) => `resultado-${o.cid}.xml` }],
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
    // estava falhando muito no pipeline, colocamos retry
    retries: Number(process.env.RETRIES ?? 2),
  },
};
