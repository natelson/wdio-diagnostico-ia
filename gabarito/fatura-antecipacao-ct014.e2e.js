// Gabarito (plano B da demo): teste gerado a partir de casos-manuais/CT-014-antecipar-parcela.md.
// Para usar, copie para test/specs/: os imports são relativos a essa pasta.
import LoginPage from '../pageobjects/login.page.js';
import FaturaPage from '../pageobjects/fatura.page.js';

describe('CT-014 · Antecipar parcela de compra parcelada na fatura', () => {
  before(async () => {
    await fetch(new URL('/api/reset', browser.options.baseUrl), { method: 'POST' });
    await LoginPage.entrarCom('123.456.789-09', 'demo123');
    await expect(browser).toHaveUrl(expect.stringContaining('inicio'));
    await FaturaPage.abrir();
  });

  it('antecipa a parcela da Geladeira com 4% de desconto e protocolo ANT-P2', async () => {
    await expect(FaturaPage.parcela('P2')).toHaveText(expect.stringContaining('Geladeira 12x'));
    await expect(FaturaPage.parcela('P2')).toHaveText(expect.stringContaining('R$ 310,90'));

    await FaturaPage.botaoAntecipar('P2').click();

    await expect(FaturaPage.resultadoAntecipacao).toHaveText(
      'Parcela antecipada com desconto de R$ 12,44. Protocolo ANT-P2'
    );
    await expect(FaturaPage.parcela('P2')).toHaveText(expect.stringContaining('Antecipada'));
    await expect(FaturaPage.botaoAntecipar('P2')).not.toBeExisting();
  });

  it('mantém as demais parcelas disponíveis para antecipação', async () => {
    await expect(FaturaPage.botaoAntecipar('P1')).toBeDisplayed();
    await expect(FaturaPage.botaoAntecipar('P3')).toBeDisplayed();
  });
});
