// Monta o site estático em docs/ (GitHub Pages): landing, Banco Demo, infográfico e vídeo.
// O Banco Demo publicado não tem servidor: a API é simulada no navegador, com as mesmas
// regras e a mesma latência variável de app/server.cjs, e o estado fica no localStorage.
// Uso: npm run publicar   (o vídeo é opcional: coloque-o em docs/video/demo.mp4)
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const DOCS = 'docs';
const REPO = 'https://github.com/natelson/wdio-diagnostico-ia';

// ---------------------------------------------------------------- Banco Demo estático
rmSync(join(DOCS, 'app'), { recursive: true, force: true });
mkdirSync(join(DOCS, 'app'), { recursive: true });
const relativo = (s) => s.replace(/(["'])\/(?!api\/)([a-z][\w.-]*\.(html|js|css))/g, '$1$2');
const aviso = `<div id="aviso-estatico" style="position:fixed;left:12px;bottom:12px;z-index:9;font:13px system-ui,sans-serif;background:#1d233c;color:#fff;padding:8px 12px;border-radius:8px;opacity:.92">
  Versão publicada: a API roda simulada no navegador. Login: 123.456.789-09 / demo123 ·
  <a href="#" style="color:#9fd" onclick="localStorage.removeItem('bancoDemo:estado');location.reload();return false">reiniciar dados</a></div>`;
for (const arq of readdirSync('app/public')) {
  let txt = readFileSync(join('app/public', arq), 'utf8');
  if (arq === 'app.js') {
    txt = relativo(txt).replace('async function api(', 'async function apiServidor(') + `
// ---- API simulada (versão publicada, sem servidor): mesmas regras de app/server.cjs
const FATURA = { competencia: '10/2026', vencimento: '2026-11-10', total: 2480.35, parcelas: [
  { id: 'P1', descricao: 'Notebook 10x', parcela: '3/10', valor: 420.0 },
  { id: 'P2', descricao: 'Geladeira 12x', parcela: '5/12', valor: 310.9 },
  { id: 'P3', descricao: 'Celular 6x', parcela: '2/6', valor: 215.5 }] };
const lerEstado = () => JSON.parse(localStorage.getItem('bancoDemo:estado') || '{"bloqueado":false,"antecipadas":[]}');
const gravarEstado = (e) => localStorage.setItem('bancoDemo:estado', JSON.stringify(e));
async function api(caminho, corpo) {
  await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random() * 1400)));
  const e = lerEstado();
  const r = (status, dados) => ({ status, dados });
  switch (caminho) {
    case 'reset': gravarEstado({ bloqueado: false, antecipadas: [] }); return r(200, { ok: true });
    case 'login': return corpo.cpf === '123.456.789-09' && corpo.senha === 'demo123' ? r(200, { nome: 'Maria Silva' }) : r(401, { erro: 'CPF ou senha inválidos' });
    case 'cartao': return r(200, { final: '4321', bandeira: 'Mastercard', bloqueado: e.bloqueado, limite: 8000 });
    case 'cartao/bloqueio': e.bloqueado = true; gravarEstado(e); return r(200, { protocolo: 'BLQ-' + Date.now().toString().slice(-6) });
    case 'fatura': return r(200, { ...FATURA, parcelas: FATURA.parcelas.map((p) => ({ ...p, antecipada: e.antecipadas.includes(p.id) })) });
    case 'fatura/antecipar': {
      const p = FATURA.parcelas.find((x) => x.id === corpo.id);
      if (!p) return r(404, { erro: 'Parcela não encontrada' });
      e.antecipadas.push(p.id); gravarEstado(e);
      return r(200, { desconto: +(p.valor * 0.04).toFixed(2), protocolo: 'ANT-' + p.id });
    }
    default: return r(404, { erro: 'não encontrado' });
  }
}
`;
  } else if (arq.endsWith('.html')) {
    txt = relativo(txt).replace('</body>', `${aviso}\n</body>`);
  }
  writeFileSync(join(DOCS, 'app', arq), txt);
}
writeFileSync(join(DOCS, 'app', 'index.html'), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=login.html"><title>Banco Demo</title><a href="login.html">Banco Demo</a>');

// ---------------------------------------------------------------- infográfico
mkdirSync(join(DOCS, 'relatorio'), { recursive: true });
execFileSync('node', ['scripts/relatorio.js', 'gabarito/diagnostico.json', join(DOCS, 'relatorio', 'index.html')], { stdio: 'inherit' });

// ---------------------------------------------------------------- vídeo
const temVideo = existsSync(join(DOCS, 'video', 'demo.mp4'));
if (temVideo) {
  writeFileSync(join(DOCS, 'video', 'index.html'), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vídeo da demo</title><style>body{margin:0;background:#0b0e1a;color:#f4f5f9;font:16px system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}
main{width:min(1280px,100% - 32px)}video{width:100%;border-radius:12px;box-shadow:0 20px 60px #0008}a{color:#1cd8b4}p{color:#9aa0b8}</style></head>
<body><main><h1>Diagnóstico de suíte WebdriverIO assistido por IA</h1><video src="demo.mp4" controls playsinline preload="metadata"></video>
<p>~100 s · execuções, logs e telas reais · <a href="../">voltar à demo</a> · <a href="demo.mp4" download>baixar o MP4</a></p></main></body></html>`);
}

// ---------------------------------------------------------------- landing
const card = (href, titulo, texto, rotulo) => `<a class="card" href="${href}"><span class="rot">${rotulo}</span><h2>${titulo}</h2><p>${texto}</p><span class="ir">abrir →</span></a>`;
writeFileSync(join(DOCS, 'index.html'), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Diagnóstico de suíte E2E com IA</title><style>
:root{color-scheme:dark}body{margin:0;min-height:100vh;background:radial-gradient(1200px 700px at 50% 0%,#232b52,#0f1325 60%,#090b16);color:#f4f5f9;font:17px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1100px;margin:0 auto;padding:64px 20px}.eyebrow{color:#ff5851;font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:13px}
h1{font-size:clamp(32px,5vw,52px);line-height:1.1;margin:10px 0 14px}.sub{color:#aab0c8;max-width:760px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:40px}
.card{display:flex;flex-direction:column;gap:6px;text-decoration:none;color:inherit;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:22px;transition:transform .15s,border-color .15s}
.card:hover{transform:translateY(-3px);border-color:#1cd8b4}.card h2{margin:0;font-size:21px}.card p{margin:0;color:#aab0c8;font-size:15px;flex:1}
.rot{font-size:12px;font-weight:700;color:#1cd8b4;letter-spacing:.08em;text-transform:uppercase}.ir{color:#1cd8b4;font-weight:600;font-size:14px}
footer{margin-top:48px;color:#7d84a3;font-size:14px}</style></head><body><main>
<div class="eyebrow">Demo · Engenharia de Qualidade Assistida por IA</div>
<h1>Diagnóstico de uma suíte WebdriverIO com IA</h1>
<p class="sub">Uma suíte E2E com problemas comuns (pausas fixas, XPath, dependência de ordem, retries escondendo instabilidade), medida em 8 execuções reais sem retry, diagnosticada por IA em 8 dimensões, e um teste novo gerado a partir de um caso manual. App fictício, sem dados reais.</p>
<div class="grid">
${temVideo ? card('video/', 'Vídeo da demo', 'Os ~100 s da demo: a suíte falhando sem retry, o diagnóstico, o infográfico e o teste gerado rodando no Chrome.', '1 · assista') : ''}
${card('relatorio/', 'Relatório de diagnóstico', 'Infográfico interativo: baseline, mapa testes × execuções, semáforo das 8 dimensões, top 5 oportunidades e POC.', '2 · explore')}
${card('app/', 'Banco Demo', 'O app testado, publicado com a API simulada no navegador. Login 123.456.789-09 / demo123.', '3 · experimente')}
${card(REPO, 'Código-fonte', 'Suíte, histórico, comandos do Claude Code (/diagnostico e /gerar-teste) e o gerador do infográfico.', '4 · rode você mesmo')}
</div><footer>Banco Demo é fictício. Nada aqui usa código ou dados de clientes.</footer></main></body></html>`);
console.log(`Site montado em ${DOCS}/ (app, relatorio${temVideo ? ', video' : ''} e landing).`);
