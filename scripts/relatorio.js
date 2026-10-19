// Monta o infográfico do diagnóstico (relatorio/diagnostico.html, autocontido e offline).
// Entrada: o JSON escrito pela IA (achados, semáforo, oportunidades, POC).
// O que é medido (baseline, execuções, mapa de testes, pausas no código) é calculado
// aqui, direto de historico/ e test/specs/, e não depende do texto da IA.
// Uso: npm run relatorio [-- <entrada.json> [saida.html]]
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const ENTRADA = process.argv[2] || 'relatorio/diagnostico.json';
const SAIDA = process.argv[3] || 'relatorio/diagnostico.html';

const falhar = (msg) => {
  console.error(`relatorio: ${msg}`);
  process.exit(1);
};

// ---------------------------------------------------------------- diagnóstico da IA
if (!existsSync(ENTRADA)) falhar(`${ENTRADA} não existe. Rode /diagnostico antes.`);
let diag;
try {
  diag = JSON.parse(readFileSync(ENTRADA, 'utf8'));
} catch (e) {
  falhar(`${ENTRADA} não é um JSON válido: ${e.message}`);
}

const erros = [];
const exigir = (cond, msg) => cond || erros.push(msg);
const NIVEIS = ['baixo', 'medio', 'alto'];
exigir(typeof diag.resumoExecutivo === 'string' && diag.resumoExecutivo, 'resumoExecutivo: texto obrigatório');
exigir(Array.isArray(diag.destaques), 'destaques: lista obrigatória (pode ser vazia)');
exigir(Array.isArray(diag.dimensoes) && diag.dimensoes.length === 8, 'dimensoes: exatamente 8 itens');
(diag.dimensoes || []).forEach((d, i) => {
  exigir(['verde', 'amarelo', 'vermelho'].includes(d.status), `dimensoes[${i}].status: verde | amarelo | vermelho`);
  exigir(d.nome && d.justificativa, `dimensoes[${i}]: nome e justificativa obrigatórios`);
  exigir(Array.isArray(d.achados) && d.achados.length, `dimensoes[${i}].achados: ao menos 1`);
  (d.achados || []).forEach((a, j) => {
    exigir(['fato', 'inferencia'].includes(a.tipo), `dimensoes[${i}].achados[${j}].tipo: fato | inferencia`);
    exigir(a.texto && a.evidencia, `dimensoes[${i}].achados[${j}]: texto e evidencia obrigatórios`);
  });
});
exigir(Array.isArray(diag.oportunidades) && diag.oportunidades.length === 5, 'oportunidades: exatamente 5 itens');
(diag.oportunidades || []).forEach((o, i) => {
  exigir(NIVEIS.includes(o.impacto) && NIVEIS.includes(o.esforco), `oportunidades[${i}]: impacto e esforco em baixo | medio | alto`);
  exigir(o.titulo && o.metrica && o.ganho && o.conta, `oportunidades[${i}]: titulo, metrica, ganho e conta obrigatórios`);
});
const poc = diag.poc || {};
exigir(poc.escopo && Array.isArray(poc.dias) && poc.dias.length === 4, 'poc: escopo e 4 dias obrigatórios');
exigir(Array.isArray(poc.criterios) && poc.criterios.length, 'poc.criterios: ao menos 1 (metrica, atual, meta)');
exigir(Array.isArray(poc.riscos), 'poc.riscos: lista obrigatória');
if (erros.length) falhar(`${ENTRADA} fora do formato:\n  - ${erros.join('\n  - ')}`);

// ---------------------------------------------------------------- histórico (fatos medidos)
const metricas = JSON.parse(readFileSync('historico/metricas.json', 'utf8'));
const execucoes = JSON.parse(readFileSync('historico/execucoes.json', 'utf8'));

const attr = (tag, nome) => (tag.match(new RegExp(`\\s${nome}="([^"]*)"`)) || [])[1];
const entidades = (s = '') =>
  s.replace(/&#xA;/g, '\n').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

const runs = readdirSync('historico').filter((d) => d.startsWith('run-')).sort();
const mapa = new Map(); // teste -> [{run, ok, tempo, msg}]
runs.forEach((run, r) => {
  for (const arq of readdirSync(join('historico', run)).filter((f) => f.endsWith('.xml'))) {
    const xml = readFileSync(join('historico', run, arq), 'utf8');
    for (const caso of xml.match(/<testcase[\s\S]*?(<\/testcase>|\/>)/g) || []) {
      const abertura = caso.match(/<testcase[^>]*>/)[0];
      const chave = `${attr(abertura, 'classname').split('.').pop().replace(/_/g, ' ')} › ${attr(abertura, 'name')}`;
      const falha = caso.match(/<(failure|error)[^>]*message="([^"]*)"/);
      const linha = mapa.get(chave) || [];
      linha[r] = {
        ok: !falha && !/<skipped/.test(caso),
        tempo: Number(attr(abertura, 'time') || 0),
        msg: falha ? entidades(falha[2]).split('\n').filter(Boolean).slice(0, 3).join(' · ') : '',
      };
      mapa.set(chave, linha);
    }
  }
});
const testes = metricas.testes.map((t) => ({ ...t, runs: mapa.get(t.teste) || [] }));

// ---------------------------------------------------------------- sinais no código (fatos medidos)
const specs = readdirSync('test/specs').filter((f) => f.endsWith('.e2e.js')).sort().map((arq) => {
  const fonte = readFileSync(join('test/specs', arq), 'utf8');
  const pausas = [...fonte.matchAll(/browser\.pause\((\d+)\)/g)].map((m) => Number(m[1]));
  return {
    arquivo: arq,
    pausasMs: pausas.reduce((a, b) => a + b, 0),
    qtdPausas: pausas.length,
    xpath: (fonte.match(/\$\(\s*['"`]\/\//g) || []).length + (fonte.match(/\$\(\s*['"`]\/html/g) || []).length,
    nthChild: (fonte.match(/nth-child/g) || []).length,
    pageObject: /pageobjects\//.test(fonte),
    reset: /\/api\/reset/.test(fonte),
  };
});

const dados = {
  geradoEm: new Date().toISOString(),
  fonte: basename(ENTRADA),
  diag,
  resumo: metricas.resumo,
  execucoes,
  runs: runs.length,
  testes,
  specs,
};

const json = JSON.stringify(dados).replace(/</g, '\\u003c');
const html = readFileSync(new URL('./relatorio.template.html', import.meta.url), 'utf8').replace('/*__DADOS__*/null', json);
writeFileSync(SAIDA, html);
console.log(`Infográfico gerado em ${SAIDA} (${Math.round(html.length / 1024)} KB). Abra no navegador.`);
