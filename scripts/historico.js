// Executa a suíte N vezes, sempre SEM retries, para medir a estabilidade real.
// Cada execução sobe o app do zero e grava o JUnit em historico/run-NN.
// Uso: npm run historico -- 6
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const vezes = Number(process.argv[2] || 6);
const execucoes = [];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

for (let i = 1; i <= vezes; i++) {
  const dir = `historico/run-${String(i).padStart(2, '0')}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const app = spawn('node', ['app/server.cjs'], { stdio: 'ignore' });
  await esperar(500);

  const inicio = Date.now();
  const r = spawnSync('npx', ['wdio', 'run', './wdio.conf.js'], {
    env: { ...process.env, RETRIES: '0', JUNIT_DIR: dir },
    stdio: 'inherit',
  });
  const duracao = (Date.now() - inicio) / 1000;
  app.kill();

  // Tira o caminho absoluto da máquina das stack traces, para o histórico poder ser versionado.
  for (const arq of readdirSync(dir).filter((f) => f.endsWith('.xml'))) {
    const xml = readFileSync(join(dir, arq), 'utf8');
    writeFileSync(join(dir, arq), xml.replaceAll(`file://${process.cwd()}/`, '').replaceAll(`${process.cwd()}/`, ''));
  }

  execucoes.push({ execucao: i, inicio: new Date(inicio).toISOString(), duracaoSegundos: duracao, sucesso: r.status === 0 });
  console.log(`\nExecução ${i}/${vezes}: ${r.status === 0 ? 'verde' : 'vermelha'} em ${duracao.toFixed(1)} s\n`);
  await esperar(300);
}

writeFileSync('historico/execucoes.json', JSON.stringify(execucoes, null, 2));
console.log('Histórico gravado em historico/. Rode "npm run metricas" para consolidar.');
