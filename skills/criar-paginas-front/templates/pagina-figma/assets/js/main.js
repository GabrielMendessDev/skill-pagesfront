// Depoimentos — Swiper (CDN carregado no index.html antes deste arquivo)
const testimonials = document.querySelector('.testimonials .swiper');

if (testimonials) {
  new Swiper(testimonials, {
    slidesPerView: 1.1,
    spaceBetween: 16,
    loop: true,
    pagination: {
      el: '.testimonials .swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      900: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },
  });
}

// FAQ — accordion: alterna .active no .item
document.querySelectorAll('.faq .item .header').forEach((header) => {
  header.addEventListener('click', () => {
    header.parentElement.classList.toggle('active');
  });
});
