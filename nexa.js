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
