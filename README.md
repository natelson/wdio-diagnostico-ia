# Diagnóstico de suíte WebdriverIO assistido por IA

Demonstração de como uma IA (Claude Code) pode diagnosticar uma suíte E2E em WebdriverIO v9 e gerar testes novos a partir de casos manuais, sempre com evidência.

Tudo roda localmente, sem rede e sem dados reais. O app testado é o **Banco Demo**, um banco fictício com latência variável de propósito.

## O que tem aqui
- **Suíte "legada" com problemas plantados** (`test/specs/`): pausas fixas, XPath absoluto, login copiado, dependência de ordem, testes encadeados, asserção vazia, diálogo dispensado pelo BiDi do v9 e `retries: 2` escondendo a instabilidade.
- **O padrão desejado** (`test/pageobjects/` e `fatura-antecipacao.e2e.js`): `data-testid`, esperas explícitas e estado isolado.
- **Histórico real** (`historico/`): 8 execuções completas **sem retry**, em JUnit, e as métricas consolidadas.
- **Comandos do Claude Code** (`.claude/commands/`):
  - `/diagnostico`: avalia a suíte em 8 dimensões e gera um **infográfico HTML** (`relatorio/diagnostico.html`).
  - `/gerar-teste <caso>`: gera um teste a partir de um caso manual (`casos-manuais/`) e só entrega se ele passar 3 vezes sem retry.
- **Gabarito** (`gabarito/`): um diagnóstico e um teste gerados previamente.

## Como rodar
Requer Node 22 e Chrome.

```bash
npm install
npm run app          # Banco Demo em http://localhost:4300
npm test             # a suíte legada (RETRIES=0 desliga os retries, HEADED=1 abre o navegador)
```

Com o Claude Code aberto na pasta:

```text
/diagnostico
/gerar-teste casos-manuais/CT-014-antecipar-parcela.md
```

Para ver o infográfico sem rodar a IA, use o gabarito:

```bash
npm run relatorio -- gabarito/diagnostico.json
```

e abra `relatorio/diagnostico.html` no navegador.

## Como o infográfico é montado
- A IA escreve **só a análise** em `relatorio/diagnostico.json`: resumo, semáforo das 8 dimensões, achados (Fato ou Inferência, sempre com evidência), top 5 oportunidades e POC.
- `npm run relatorio` valida o formato e junta a análise com o que é **medido**: KPIs de `historico/metricas.json`, o mapa testes × execuções lido dos JUnit, a duração de cada execução e as pausas e seletores frágeis contados em `test/specs/`.
- A saída é um único HTML autocontido, sem dependências externas, com tema claro e escuro.

## Regerar o histórico
```bash
npm run historico -- 8   # ~6 min: 8 execuções sem retry, cada uma com o app do zero
npm run metricas         # consolida historico/metricas.{json,md}
```

## Problemas plantados (cola)
- `browser.pause` fixo em quase todos os testes (lentidão e flakiness).
- XPath absoluto e `nth-child` (quebram com qualquer ajuste de layout).
- Login copiado em 4 arquivos; só 1 spec usa page objects.
- `fatura-consulta` depende de nenhuma parcela ter sido antecipada, mas roda depois de `fatura-antecipacao` (dependência de ordem).
- `cartao-bloqueio`: testes encadeados, e o `confirm()` é dispensado automaticamente pelo WebDriver BiDi no v9 (sem `browser.on('dialog')`).
- `inicio › deve exibir o resumo` só verifica se o `body` existe (asserção fraca), e `inicio › deve logar` duplica o teste de login.
- `retries: 2` no `wdio.conf.js` esconde a instabilidade; `maxInstances: 1` serializa tudo.
