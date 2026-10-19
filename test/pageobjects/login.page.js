class LoginPage {
  get cpf() { return $('[data-testid=login-cpf]'); }
  get senha() { return $('[data-testid=login-senha]'); }
  get entrar() { return $('[data-testid=login-entrar]'); }
  get erro() { return $('[data-testid=login-erro]'); }

  async abrir() {
    await browser.url('/login.html');
  }

  async entrarCom(cpf, senha) {
    await this.abrir();
    await this.cpf.setValue(cpf);
    await this.senha.setValue(senha);
    await this.entrar.click();
  }
}

export default new LoginPage();
