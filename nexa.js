// ── Carrossel ──
function initCarousel(selector) {
  const carousel = document.querySelector(selector);
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = track.querySelectorAll('img');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const dots = carousel.querySelectorAll('.carousel-dots span');

  let index = 0;
  const total = slides.length;

  function goTo(i) {
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('active', j === index));
  }

  let autoplay = setInterval(() => goTo(index + 1), 4000);

  function restartAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(() => goTo(index + 1), 4000);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(index + 1); restartAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(index - 1); restartAutoplay(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); restartAutoplay(); }));

  carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
  carousel.addEventListener('mouseleave', () => restartAutoplay());
}

initCarousel('.hero-carousel');
initCarousel('.machines-carousel');








function initCarousel(selector) {
  const carousel = document.querySelector(selector);
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('img');
  const prevBtn = carousel.querySelector('.prev');
  const nextBtn = carousel.querySelector('.next');

  let index = 0;
  const total = slides.length;

  function updateCarousel() {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function nextSlide() {
    index = (index + 1) % total;
    updateCarousel();
  }

  function prevSlide() {
    index = (index - 1 + total) % total;
    updateCarousel();
  }

  // Navegação manual
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Troca automática a cada 5 segundos
  let autoplay = setInterval(nextSlide, 5000);

  // Reinicia o tempo quando o usuário clicar nos botões
  function restartAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(nextSlide, 5000);
  }

  if (nextBtn) nextBtn.addEventListener('click', restartAutoplay);
  if (prevBtn) prevBtn.addEventListener('click', restartAutoplay);

  // Pausa quando o mouse estiver sobre o carrossel
  carousel.addEventListener('mouseenter', () => clearInterval(autoplay));

  // Retoma quando o mouse sair
  carousel.addEventListener('mouseleave', () => {
    autoplay = setInterval(nextSlide, 5000);
  });
}

// Inicializa os carrosséis
initCarousel('.hero-carousel');
initCarousel('.machines-carousel');

document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    const isOpen = item.classList.contains('open');

    // Fecha todos
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    // Abre o clicado (se não estava aberto)
    if (!isOpen) item.classList.add('open');
  });
});