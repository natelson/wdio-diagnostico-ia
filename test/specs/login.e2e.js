describe('Login', () => {
  it('deve fazer login com sucesso', async () => {
    await browser.url('/login.html');
    await $('#cpf').setValue('123.456.789-09');
    await $('#senha').setValue('demo123');
    await $('/html/body/main/div/form/div/button').click();
    await browser.pause(3000);
    expect(await browser.getUrl()).toContain('inicio');
  });

  it('deve exibir erro com senha invalida', async () => {
    await browser.url('/login.html');
    await $('#cpf').setValue('123.456.789-09');
    await $('#senha').setValue('errada');
    await $('/html/body/main/div/form/div/button').click();
    await browser.pause(1200);
    const msg = await $('#mensagem').getText();
    expect(msg).toBe('CPF ou senha inválidos');
  });

  it('deve exibir erro com cpf vazio', async () => {
    await browser.url('/login.html');
    await $('#senha').setValue('demo123');
    await $('/html/body/main/div/form/div/button').click();
    await browser.pause(1200);
    const msg = await $('#mensagem').getText();
    expect(msg).toBe('CPF ou senha inválidos');
  });
});
