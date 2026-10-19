// Consolida os JUnit de historico/run-*/ em métricas por teste e por execução.
// Gera historico/metricas.json (para a IA) e historico/metricas.md (para pessoas).
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'historico';
const runs = readdirSync(BASE).filter((d) => d.startsWith('run-')).sort();
if (!runs.length) {
  console.error('Nenhuma execução em historico/. Rode "npm run historico" antes.');
  process.exit(1);
}

const attr = (tag, nome) => (tag.match(new RegExp(`\\s${nome}="([^"]*)"`)) || [])[1];
const testes = new Map();

for (const run of runs) {
  for (const arq of readdirSync(join(BASE, run)).filter((f) => f.endsWith('.xml'))) {
    const xml = readFileSync(join(BASE, run, arq), 'utf8');
    const casos = xml.match(/<testcase[\s\S]*?(<\/testcase>|\/>)/g) || [];
    for (const caso of casos) {
      const abertura = caso.match(/<testcase[^>]*>/)[0];
      const suite = attr(abertura, 'classname').split('.').pop().replace(/_/g, ' ');
      const nome = attr(abertura, 'name');
      const chave = `${suite} › ${nome}`;
      const falhou = /<failure|<error/.test(caso);
      const pulado = /<skipped/.test(caso);
      const t = testes.get(chave) || { teste: chave, arquivo: arq, execucoes: 0, falhas: 0, tempos: [] };
      if (!pulado) {
        t.execucoes++;
        if (falhou) t.falhas++;
        t.tempos.push(Number(attr(abertura, 'time') || 0));
      }
      testes.set(chave, t);
    }
  }
}

const lista = [...testes.values()].map((t) => {
  const media = t.tempos.reduce((a, b) => a + b, 0) / (t.tempos.length || 1);
  const situacao = t.falhas === 0 ? 'estável' : t.falhas === t.execucoes ? 'quebrado' : 'instável';
  return { teste: t.teste, execucoes: t.execucoes, falhas: t.falhas, taxaSucesso: +(1 - t.falhas / t.execucoes).toFixed(2), tempoMedioSegundos: +media.toFixed(1), situacao };
}).sort((a, b) => a.taxaSucesso - b.taxaSucesso || b.tempoMedioSegundos - a.tempoMedioSegundos);

const execucoes = existsSync(join(BASE, 'execucoes.json')) ? JSON.parse(readFileSync(join(BASE, 'execucoes.json'), 'utf8')) : [];
const verdes = execucoes.filter((e) => e.sucesso).length;
const duracaoMedia = execucoes.reduce((a, e) => a + e.duracaoSegundos, 0) / (execucoes.length || 1);
const resumo = {
  execucoes: execucoes.length,
  execucoesVerdes: verdes,
  taxaExecucoesVerdes: execucoes.length ? +(verdes / execucoes.length).toFixed(2) : null,
  duracaoMediaSegundos: +duracaoMedia.toFixed(1),
  testes: lista.length,
  estaveis: lista.filter((t) => t.situacao === 'estável').length,
  instaveis: lista.filter((t) => t.situacao === 'instável').length,
  quebrados: lista.filter((t) => t.situacao === 'quebrado').length,
};

writeFileSync(join(BASE, 'metricas.json'), JSON.stringify({ resumo, testes: lista }, null, 2));

const md = [
  '# Métricas da suíte (execuções sem retry)',
  '',
  `- Execuções: **${resumo.execucoes}** · verdes: **${resumo.execucoesVerdes}** (${Math.round((resumo.taxaExecucoesVerdes || 0) * 100)}%)`,
  `- Duração média da suíte: **${resumo.duracaoMediaSegundos} s**`,
  `- Testes: ${resumo.testes} · estáveis: ${resumo.estaveis} · instáveis: **${resumo.instaveis}** · quebrados: **${resumo.quebrados}**`,
  '',
  '| Teste | Execuções | Falhas | Sucesso | Tempo médio (s) | Situação |',
  '|---|---|---|---|---|---|',
  ...lista.map((t) => `| ${t.teste} | ${t.execucoes} | ${t.falhas} | ${Math.round(t.taxaSucesso * 100)}% | ${t.tempoMedioSegundos} | ${t.situacao} |`),
  '',
].join('\n');
writeFileSync(join(BASE, 'metricas.md'), md);
console.log(md);
