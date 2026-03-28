<template>
  <footer class="footer">

    <div class="footer-container">

      <!-- Marca -->
      <div>
        <h3 class="footer-title">
          Psiconaut4 Sistemas
        </h3>

        <p class="footer-description">
          Desenvolvemos sistemas de gestão modernos, focados em performance,
          controle operacional e crescimento do seu negócio.
        </p>
      </div>

      <!-- Soluções -->
      <div>
        <h4 class="footer-heading">
          Soluções
        </h4>

        <ul class="footer-list">
          <li>
            <a href="https://psiconaut4.com.br/solucoes/barbearias" target="_blank" class="footer-link">Gestão de Barbearias</a>
          </li>
          <li>
            <a href="https://psiconaut4.com.br/solucoes/assistencia-tecnica" target="_blank" class="footer-link">Assistência Técnica</a>
          </li>
          <li>
            <a href="https://psiconaut4.com.br/solucoes/personalizados" target="_blank" class="footer-link">Plataformas Personalizadas</a>
          </li>
        </ul>
      </div>

      <!-- Empresa -->
      <div>
        <h4 class="footer-heading">
          Empresa
        </h4>

        <ul class="footer-list">
          <li>
            <a href="https://psiconaut4.com.br" target="_blank" class="footer-link">
              Sobre
            </a>
          </li>
          <li>
            <a href="https://psiconaut4.com.br/contato/" target="_blank" class="footer-link">
              Contato
            </a>
          </li>
        </ul>
      </div>

      <!-- Contato -->
      <div>
        <h4 class="footer-heading">
          Contato
        </h4>

        <div>
          <p><a href="mailto:contato@psiconaut4.com.br" target="_blank" class="footer-link">contato@psiconaut4.com.br</a></p>
          <p>(47) 99630-9438</p>
        </div>
      </div>

    </div>

    <!-- Linha inferior -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <span>
          © {{ new Date().getFullYear() }} Psiconaut4 Sistemas. Todos os direitos reservados.
        </span>

        <div class="footer-bottom-links">
          <a href="#" class="footer-link">Política de Privacidade</a>
          <a href="#" class="footer-link">Termos de Uso</a>
        </div>
      </div>
    </div>

  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  margin-top: 8rem;
  background: #0d1117;
  border-top: 1px solid #1f2937;
  color: #9ca3af;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}

@media (min-width: 768px) {
  .footer-container {
    grid-template-columns: repeat(4, 1fr);
  }

  .footer-bottom-content {
    flex-direction: row;
    justify-content: space-between;
  }
}

.footer-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
}

.footer-description {
  margin-top: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

.footer-heading {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.footer-link {
  color: #9ca3af;
  text-decoration: none;
  transition: 0.3s;
}

.footer-link:hover {
  color: #4ade80;
}

.footer-contact {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.footer-icons {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
}

.footer-bottom {
  border-top: 1px solid #1f2937;
}

.footer-bottom-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-bottom-links {
  display: flex;
  gap: 1.5rem;
}
</style>