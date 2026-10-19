class FaturaPage {
  get total() { return $('[data-testid=fatura-total]'); }
  get resultadoAntecipacao() { return $('[data-testid=antecipacao-resultado]'); }

  parcela(id) { return $(`[data-testid=parcela-${id}]`); }
  botaoAntecipar(id) { return $(`[data-testid=antecipar-${id}]`); }

  async abrir() {
    await browser.url('/fatura.html');
    await this.total.waitForDisplayed();
  }
}

export default new FaturaPage();
