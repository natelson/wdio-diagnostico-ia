---
description: Diagnóstico da suíte E2E WebdriverIO (8 dimensões, semáforo e evidências) em infográfico HTML
---

Faça o diagnóstico da suíte E2E deste repositório. Grave o resultado em `relatorio/diagnostico.json` e gere o infográfico com `npm run relatorio`.

## Fontes (leia todas antes de concluir)
1. `wdio.conf.js` e `package.json`
2. Todos os arquivos de `test/specs/` e `test/pageobjects/`
3. `historico/metricas.json` e `historico/execucoes.json` (execuções reais, sem retry)
4. `casos-manuais/` (o que o negócio espera validar)
5. As mensagens de falha do JUnit em `historico/run-*/` (use `grep` nas tags `<failure`; não abra cada XML)

Não use `gabarito/` nem relatórios anteriores como fonte.

## Avalie estas 8 dimensões
1. Arquitetura da suíte (padrões, page objects, organização)
2. Estabilidade (flakiness, retries, falsos negativos)
3. Velocidade (tempo de execução, esperas, paralelismo)
4. Dados e ambientes (massas, isolamento, dependência de ordem)
5. Cobertura de valor (fluxos críticos cobertos, testes redundantes ou fracos)
6. Manutenibilidade (duplicação, seletores frágeis, acoplamento à UI)
7. Diagnóstico de falhas (evidências, relatórios, mensagens)
8. Uso de IA (o que já existe e o que falta: guardrails, instruções versionadas)

## Formato: `relatorio/diagnostico.json`
O infográfico já calcula sozinho, do histórico e do código, a baseline (KPIs), o mapa testes × execuções, a duração por execução e as pausas por arquivo. **Não repita esses números como achados soltos**: use-os como evidência. O JSON traz a análise:

```json
{
  "resumoExecutivo": "3 a 5 frases para um gestor",
  "destaques": [{ "rotulo": "", "valor": "", "detalhe": "", "tipo": "fato|inferencia", "evidencia": "" }],
  "dimensoes": [{ "nome": "", "status": "verde|amarelo|vermelho", "justificativa": "uma linha",
                  "achados": [{ "tipo": "fato|inferencia", "texto": "", "evidencia": "arquivo:linha ou métrica" }] }],
  "oportunidades": [{ "titulo": "", "impacto": "baixo|medio|alto", "esforco": "baixo|medio|alto",
                      "metrica": "o que deve mudar", "ganho": "estimativa curta", "conta": "como chegou nela" }],
  "poc": { "escopo": "", "dias": [{ "foco": "" }],
           "criterios": [{ "metrica": "", "atual": "", "meta": "" }], "riscos": [""] }
}
```
- `dimensoes`: as 8, na ordem acima. `oportunidades`: exatamente 5, da maior para a menor prioridade. `poc.dias`: exatamente 4.
- `destaques`: 2 a 3 números que **não** estão no histórico (ex.: segundos de pausa, seletores frágeis), cada um com a conta na evidência.
- Depois de gravar, rode `npm run relatorio`. Se ele apontar erro de formato, corrija o JSON e rode de novo. Termine com 3 linhas: o semáforo resumido, a oportunidade nº 1 e o caminho `relatorio/diagnostico.html`.

## Regras
- Não invente números. Se uma métrica não existe, diga que não existe e como medi-la.
- Contagens (pausas, XPath, logins copiados) saem de `grep`, não de estimativa. Todo percentual diz o denominador.
- Seja enxuto: até 3 achados por dimensão, cada um com uma ou duas frases.
- Seja específico: aponte linhas, nomes de testes e valores.
- Português do Brasil, direto, sem jargão desnecessário.
