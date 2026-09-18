const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];
const backTopButton = document.querySelector('.back-top');

const closeMenu = () => {
  navMenu.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
};

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

backTopButton.addEventListener('click', (event) => {
  event.preventDefault();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 18);

  const current = sections.findLast((section) => window.scrollY >= section.offsetTop - 160);
  navLinks.forEach((link) => {
    link.classList.toggle('active', current && link.getAttribute('href') === `#${current.id}`);
  });
}, { passive: true });

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const slides = [...carousel.querySelectorAll('[data-slide]')];
  const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
  const currentLabel = carousel.querySelector('[data-carousel-current]');
  let currentIndex = 0;
  let touchStartX = 0;

  const showSlide = (nextIndex) => {
    currentIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('active', isActive);
      isActive ? dot.setAttribute('aria-current', 'true') : dot.removeAttribute('aria-current');
    });
    currentLabel.textContent = String(currentIndex + 1).padStart(2, '0');
  };

  carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => showSlide(currentIndex - 1));
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => showSlide(currentIndex + 1));
  dots.forEach((dot) => dot.addEventListener('click', () => showSlide(Number(dot.dataset.carouselDot))));

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showSlide(currentIndex - 1);
    if (event.key === 'ArrowRight') showSlide(currentIndex + 1);
  });
  carousel.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) showSlide(currentIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  carousel.querySelectorAll('img').forEach((image) => {
    const slide = image.closest('[data-slide]');
    const source = image.getAttribute('src');
    slide.style.setProperty('--slide-image', `url("${source}")`);
    const markMissing = () => image.classList.add('image-missing');
    image.addEventListener('error', markMissing);
    if (image.complete && image.naturalWidth === 0) markMissing();
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
