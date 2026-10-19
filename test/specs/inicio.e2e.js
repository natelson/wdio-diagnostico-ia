describe('Tela inicial', () => {
  it('deve logar', async () => {
    await browser.url('/login.html');
    await $('#cpf').setValue('123.456.789-09');
    await $('#senha').setValue('demo123');
    await $('/html/body/main/div/form/div/button').click();
    await browser.pause(3000);
    expect(await browser.getUrl()).toContain('inicio');
  });

  it('deve exibir o resumo', async () => {
    await browser.pause(1500);
    expect(await $('body').isDisplayed()).toBe(true);
  });

  it('deve exibir o total da fatura no resumo', async () => {
    await browser.url('/inicio.html');
    await browser.pause(1500);
    const total = await $('/html/body/main/div/p[2]/strong').getText();
    expect(total).toContain('2.480,35');
  });
});
