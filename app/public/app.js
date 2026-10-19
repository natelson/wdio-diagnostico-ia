// Funções compartilhadas pelas páginas do Banco Demo.
async function api(caminho, corpo) {
  const opcoes = corpo
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) }
    : {};
  const r = await fetch('/api/' + caminho, opcoes);
  return { status: r.status, dados: await r.json() };
}

function exigirLogin() {
  const nome = localStorage.getItem('usuario');
  if (!nome) location.href = '/login.html';
  const saudacao = document.querySelector('#saudacao');
  if (saudacao) saudacao.textContent = 'Olá, ' + nome;
}

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
