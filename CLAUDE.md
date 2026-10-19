# Demo: diagnóstico de suíte WebdriverIO assistido por IA

Repositório de demonstração: diagnóstico de uma suíte E2E WebdriverIO assistido por IA.
O app (`app/`) é o **Banco Demo**, um banco fictício. Não há código nem dados reais de nenhuma empresa aqui.

## Estrutura
- `app/server.cjs`: servidor do Banco Demo (porta 4300). As rotas `/api` têm latência variável de propósito, e `POST /api/reset` restaura o estado.
- `test/specs/*.e2e.js`: suíte E2E "legada", escrita **de propósito** com problemas comuns (pausas fixas, XPath absoluto, login duplicado, dependência de ordem, retries escondendo instabilidade).
- `test/pageobjects/`: o padrão desejado (seletores `data-testid`, esperas explícitas). Só `fatura-antecipacao.e2e.js` usa esse padrão hoje.
- `historico/`: JUnit de várias execuções **sem retry** (`npm run historico`) e as métricas consolidadas (`npm run metricas`).
- `casos-manuais/`: casos de teste manuais, no formato de documentação de QA.
- `relatorio/`: saída do diagnóstico (`diagnostico.json`, escrito pela IA, e `diagnostico.html`, o infográfico).
- `scripts/relatorio.js` + `scripts/relatorio.template.html`: montam o infográfico. Os números medidos (baseline, execuções, pausas) vêm do histórico e do código, não do JSON.

## Comandos
- `npm run app`: sobe o Banco Demo.
- `npm test`: roda a suíte (com o app no ar). `HEADED=1` abre o navegador e `RETRIES=0` desliga os retries.
- `npm run historico -- 8`: 8 execuções sem retry, cada uma com o app do zero.
- `npm run metricas`: consolida `historico/metricas.{json,md}`.
- `npm run relatorio [-- <json> [html]]`: gera o infográfico (padrão: `relatorio/diagnostico.json` → `relatorio/diagnostico.html`).

## Regras para a IA neste repositório
- Toda conclusão cita evidência: arquivo e linha, ou o número de `historico/metricas.json`. Separe **fato** de **inferência**.
- Testes novos seguem o padrão de `test/pageobjects/`: seletores `data-testid`, `waitFor*`/`expect` assíncrono, **nunca** `browser.pause`, estado isolado (`POST /api/reset` no `before`) e asserções sobre o resultado de negócio.
- Não altere a suíte legada durante a demo, exceto quando pedido.
