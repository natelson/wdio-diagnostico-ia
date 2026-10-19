// Funções compartilhadas pelas páginas do Banco Demo.
async function apiServidor(caminho, corpo) {
  const opcoes = corpo
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) }
    : {};
  const r = await fetch('/api/' + caminho, opcoes);
  return { status: r.status, dados: await r.json() };
}

function exigirLogin() {
  const nome = localStorage.getItem('usuario');
  if (!nome) location.href = 'login.html';
  const saudacao = document.querySelector('#saudacao');
  if (saudacao) saudacao.textContent = 'Olá, ' + nome;
}

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
