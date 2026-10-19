---
description: Gera um teste E2E a partir de um caso manual, no padrão do repositório
argument-hint: <caminho do caso manual>
---

Gere um teste E2E automatizado para o caso manual em `$ARGUMENTS`.

## Passos
1. Leia o caso manual e liste, em uma frase cada, o que o teste precisa **provar** (resultado de negócio, não cliques).
2. Leia `test/pageobjects/` e `test/specs/fatura-antecipacao.e2e.js`: esse é o padrão a seguir.
3. Se faltar algum elemento no page object, adicione-o ao page object existente (seletor `data-testid`); se for uma tela nova, crie um page object novo.
4. Crie o spec em `test/specs/`, com o ID do caso no nome do `describe`.
5. Rode **só** o spec novo 3 vezes, com o app no ar, num único comando: `for i in 1 2 3; do RETRIES=0 JUNIT_DIR=/tmp/ct-junit npx wdio run ./wdio.conf.js --spec <arquivo> || break; done`. Corrija até passar nas 3.
6. Mostre um resumo: o que o teste prova, arquivos criados ou alterados e o resultado das 3 execuções.

## Regras do padrão
- Nada de `browser.pause`, XPath absoluto ou seletor por posição.
- Estado isolado: chame `POST /api/reset` no `before` (use `fetch` com `browser.options.baseUrl`).
- Asserções assíncronas do `expect-webdriverio` (`toHaveText`, `toBeDisplayed`), que já esperam o elemento.
- Valide valores de negócio do caso (valores, protocolo, situação), não só a presença de elementos.
- Cada `it` passa sozinho: não dependa de uma ação feita em outro `it`.
