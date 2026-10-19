# CT-014 · Antecipar parcela de compra parcelada na fatura

| Campo | Valor |
|---|---|
| Sistema | Banco Demo · Fatura (web) |
| Criticidade | Alta |
| Execução hoje | Manual |
| Frequência | A cada release (quinzenal) |

## Pré-condições
- Cliente com cartão ativo e fatura aberta com compras parceladas.
- Massa: CPF `123.456.789-09`, senha `demo123`.
- Nenhuma parcela antecipada na fatura atual.

## Passos
1. Acessar o Banco Demo e fazer login com a massa acima.
2. Abrir o menu **Fatura**.
3. Localizar a compra **Geladeira 12x** (parcela 5/12, R$ 310,90).
4. Clicar em **Antecipar** na linha da compra.

## Resultado esperado
- Mensagem de sucesso: "Parcela antecipada com desconto de R$ 12,44" (4% do valor da parcela).
- Protocolo no formato `ANT-P2`.
- A linha da Geladeira passa a exibir **Antecipada** e o botão desaparece.
- As demais parcelas continuam disponíveis para antecipação.
