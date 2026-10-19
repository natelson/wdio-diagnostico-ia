// Servidor do "Banco Demo": app fictício usado só para a demonstração.
// Sem dependências. As rotas /api respondem com latência variável de propósito,
// para reproduzir o comportamento de ambientes de homologação reais.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 4300);
const PUBLIC = path.join(__dirname, 'public');
const MIN_DELAY = Number(process.env.MIN_DELAY || 200);
const MAX_DELAY = Number(process.env.MAX_DELAY || 1600);

const estado = { bloqueado: false, antecipadas: [] };

const fatura = {
  competencia: '10/2026',
  vencimento: '2026-11-10',
  total: 2480.35,
  parcelas: [
    { id: 'P1', descricao: 'Notebook 10x', parcela: '3/10', valor: 420.0 },
    { id: 'P2', descricao: 'Geladeira 12x', parcela: '5/12', valor: 310.9 },
    { id: 'P3', descricao: 'Celular 6x', parcela: '2/6', valor: 215.5 },
  ],
};

const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
const atraso = () => MIN_DELAY + Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY));

function json(res, status, body) {
  setTimeout(() => {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  }, atraso());
}

function lerCorpo(req) {
  return new Promise((resolve) => {
    let dados = '';
    req.on('data', (c) => (dados += c));
    req.on('end', () => resolve(dados ? JSON.parse(dados) : {}));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/reset' && req.method === 'POST') {
    estado.bloqueado = false;
    estado.antecipadas = [];
    return json(res, 200, { ok: true });
  }
  if (url.pathname === '/api/login' && req.method === 'POST') {
    const { cpf, senha } = await lerCorpo(req);
    if (cpf === '123.456.789-09' && senha === 'demo123') return json(res, 200, { nome: 'Maria Silva' });
    return json(res, 401, { erro: 'CPF ou senha inválidos' });
  }
  if (url.pathname === '/api/cartao') {
    return json(res, 200, { final: '4321', bandeira: 'Mastercard', bloqueado: estado.bloqueado, limite: 8000 });
  }
  if (url.pathname === '/api/cartao/bloqueio' && req.method === 'POST') {
    estado.bloqueado = true;
    return json(res, 200, { protocolo: 'BLQ-' + Date.now().toString().slice(-6) });
  }
  if (url.pathname === '/api/fatura') {
    const parcelas = fatura.parcelas.map((p) => ({ ...p, antecipada: estado.antecipadas.includes(p.id) }));
    return json(res, 200, { ...fatura, parcelas });
  }
  if (url.pathname === '/api/fatura/antecipar' && req.method === 'POST') {
    const { id } = await lerCorpo(req);
    const p = fatura.parcelas.find((x) => x.id === id);
    if (!p) return json(res, 404, { erro: 'Parcela não encontrada' });
    estado.antecipadas.push(id);
    return json(res, 200, { desconto: +(p.valor * 0.04).toFixed(2), protocolo: 'ANT-' + id });
  }

  const arquivo = path.join(PUBLIC, url.pathname === '/' ? 'login.html' : url.pathname);
  if (!arquivo.startsWith(PUBLIC) || !fs.existsSync(arquivo)) {
    res.writeHead(404);
    return res.end('não encontrado');
  }
  res.writeHead(200, { 'content-type': tipos[path.extname(arquivo)] || 'text/plain' });
  fs.createReadStream(arquivo).pipe(res);
});

server.listen(PORT, () => console.log(`Banco Demo em http://localhost:${PORT}`));
