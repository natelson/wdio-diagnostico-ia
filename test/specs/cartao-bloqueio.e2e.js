describe('Bloqueio de cartao', () => {
  it('deve exibir o cartao ativo', async () => {
    await browser.url('/login.html');
    await $('#cpf').setValue('123.456.789-09');
    await $('#senha').setValue('demo123');
    await $('/html/body/main/div/form/div/button').click();
    await browser.pause(3000);
    await browser.url('/cartao.html');
    await browser.pause(2000);
    expect(await $('#dados-cartao p:nth-child(2) strong').getText()).toBe('Ativo');
  });

  it('deve bloquear o cartao', async () => {
    await $('button.perigo').click();
    await browser.pause(500);
    await browser.acceptAlert();
    await browser.pause(4000);
    expect(await $('#mensagem').getText()).toContain('Cartão bloqueado');
  });

  it('deve exibir o cartao bloqueado', async () => {
    expect(await $('#dados-cartao p:nth-child(2) strong').getText()).toBe('Bloqueado');
  });
});
