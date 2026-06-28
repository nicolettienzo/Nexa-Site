// ── Loading ──
  window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loadingScreen').classList.add('hide'), 600);
  });

  // ── Particles ──
  (function() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 1.5 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.7 ? '#ff6a00' : '#ffffff';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
      }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    function loop() {
      ctx.clearRect(0, 0, W, H);
      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(255,106,0,' + (0.07 * (1 - dist/100)) + ')';
            ctx.globalAlpha = 1;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        particles[i].update();
        particles[i].draw();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    }
    loop();
  })();

  // ── Header scroll ──
  window.addEventListener('scroll', () => {
    document.getElementById('mainHeader').classList.toggle('scrolled', window.scrollY > 60);
  });

  // ── Reveal on scroll ──
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ── Hamburger ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // ── Nav CTA ──
  function updateNavCTA() {
    const cta = document.getElementById('nav-cta');
    if (window.innerWidth > 960) {
      cta.style.display = 'inline-flex';
      hamburger.style.display = 'none';
    } else {
      cta.style.display = 'none';
      hamburger.style.display = 'flex';
    }
  }
  updateNavCTA();
  window.addEventListener('resize', updateNavCTA);

  // ── Contador animado ──
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    if (!target) return;
    const duration = 1800, interval = 16;
    const steps = Math.ceil(duration / interval);
    let current = 0;
    el.textContent = prefix + '0' + suffix;
    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = prefix + Math.round(current) + suffix;
    }, interval);
  }
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('strong[data-target]').forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  const statsSection = document.querySelector('.stats');
  if (statsSection) statsObserver.observe(statsSection);

  // ── Carrossel ──
  (function() {
    const track = document.querySelector('.carousel-track');
    const dots = document.querySelectorAll('.carousel-dots span');
    if (!track) return;
    let current = 0, total = track.children.length, timer;
    function go(n) {
      current = (n + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }
    document.querySelector('.carousel-btn.prev').addEventListener('click', () => { go(current - 1); restart(); });
    document.querySelector('.carousel-btn.next').addEventListener('click', () => { go(current + 1); restart(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); restart(); }));
    function restart() { clearInterval(timer); timer = setInterval(() => go(current + 1), 4500); }
    restart();
  })();

  // ── FAQ ──
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── Input focus glow ──
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('focus', () => { el.style.borderColor = 'rgba(255,106,0,0.4)'; el.style.boxShadow = '0 0 0 3px rgba(255,106,0,0.08)'; });
    el.addEventListener('blur', () => { el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.boxShadow = 'none'; });
  });

  // ── Download form ──
  const downloadForm = document.getElementById('downloadForm');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadFeedback = document.getElementById('downloadFeedback');
  if (downloadForm) {
    downloadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const nome = document.getElementById('nomeDownload').value.trim();
      const email = document.getElementById('emailDownload2').value.trim();
      const telefone = document.getElementById('telefoneDownload').value.trim();
      downloadBtn.textContent = 'Enviando...';
      downloadBtn.disabled = true;
      fetch('https://formspree.io/f/xpqeqary', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, _subject: 'Download de Catálogo' })
      }).catch(() => {});
      const link = document.createElement('a');
      link.href = 'catalogo-nexa.pdf';
      link.download = 'catalogo-nexa.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      downloadForm.reset();
      downloadBtn.textContent = 'Baixar Catálogo PDF';
      downloadBtn.disabled = false;
      downloadFeedback.style.display = 'block';
      downloadFeedback.style.background = 'rgba(0,200,100,0.1)';
      downloadFeedback.style.border = '1px solid rgba(0,200,100,0.3)';
      downloadFeedback.style.color = '#4cffaa';
      downloadFeedback.textContent = '✅ Download iniciado! Obrigado pelo interesse.';
      setTimeout(() => { downloadFeedback.style.display = 'none'; }, 5000);
    });
  }

  // ── Contato form ──
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const submitBtn = document.getElementById('submitBtn');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          contactForm.reset();
          formFeedback.style.display = 'block';
          formFeedback.style.background = 'rgba(0,200,100,0.1)';
          formFeedback.style.border = '1px solid rgba(0,200,100,0.3)';
          formFeedback.style.color = '#4cffaa';
          formFeedback.textContent = '✅ Mensagem enviada! Nossa equipe entrará em contato em breve.';
        } else { throw new Error(); }
      } catch {
        formFeedback.style.display = 'block';
        formFeedback.style.background = 'rgba(255,80,80,0.1)';
        formFeedback.style.border = '1px solid rgba(255,80,80,0.3)';
        formFeedback.style.color = '#ff8080';
        formFeedback.textContent = '❌ Erro ao enviar. Tente pelo WhatsApp.';
      }
      submitBtn.textContent = 'Enviar Solicitação';
      submitBtn.disabled = false;
      setTimeout(() => { formFeedback.style.display = 'none'; }, 6000);
    });
  }

  // ── Cookies ──
  function aceitarCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieBanner').style.display = 'none';
  }
  function recusarCookies() {
    localStorage.setItem('cookieConsent', 'essential');
    document.getElementById('cookieBanner').style.display = 'none';
  }
  if (!localStorage.getItem('cookieConsent')) {
    setTimeout(() => { document.getElementById('cookieBanner').style.display = 'flex'; }, 1500);
  }

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
