describe('Fatura - consulta', () => {
  it('deve exibir a fatura', async () => {
    await browser.url('/login.html');
    await $('#cpf').setValue('123.456.789-09');
    await $('#senha').setValue('demo123');
    await $('/html/body/main/div/form/div/button').click();
    await browser.pause(3000);
    await browser.url('/fatura.html');
    await browser.pause(2000);
    expect(await $('/html/body/main/div/div[1]/p[2]/strong').getText()).toContain('2.480,35');
  });

  it('deve exibir as parcelas com opcao de antecipar', async () => {
    expect(await $('/html/body/main/div/div[1]/table/tbody/tr[1]/td[4]/button').isDisplayed()).toBe(true);
    expect(await $('/html/body/main/div/div[1]/table/tbody/tr[2]/td[4]/button').isDisplayed()).toBe(true);
  });
});
