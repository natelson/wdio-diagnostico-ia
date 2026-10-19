import LoginPage from '../pageobjects/login.page.js';
import FaturaPage from '../pageobjects/fatura.page.js';

describe('Fatura - antecipacao de parcelas', () => {
  before(async () => {
    await LoginPage.entrarCom('123.456.789-09', 'demo123');
    await expect(browser).toHaveUrl(expect.stringContaining('inicio'));
  });

  it('deve antecipar a parcela do notebook', async () => {
    await FaturaPage.abrir();
    await FaturaPage.botaoAntecipar('P1').click();
    await expect(FaturaPage.resultadoAntecipacao).toHaveText(expect.stringContaining('Parcela antecipada'));
    await expect(FaturaPage.parcela('P1')).toHaveText(expect.stringContaining('Antecipada'));
  });
});
