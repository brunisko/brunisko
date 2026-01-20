const LOCAL_STORAGE_KEY = 'zlr_content_override';

const fallbackContent = {
  navigation: ['O nás', 'Ako pomáhame', 'Príbehy', 'Galéria', 'Podporiť', 'Kontakt'],
  hero: {
    tagline: 'Občianske združenie',
    headline: 'Aby v tom ženy neboli samé.',
    subtext: 'Sprevádzame ženy, ktoré prechádzajú náročným obdobím. Pomáhame nájsť oporu, informácie a komunitu.',
    cta1: 'Chcem pomoc',
    cta2: 'Chcem podporiť'
  },
  about: {
    title: 'O nás',
    body: 'Sme občianske združenie Žijeme len raz. Vytvárame bezpečný priestor, kde ženy nájdu empatiu, porozumenie a zmysluplné prepojenia.',
    values: ['Ľudskosť v každom rozhovore', 'Rešpekt k príbehu a tempo každého človeka', 'Komunita, ktorá drží spolu']
  },
  sections: {
    help: { title: 'Ako pomáhame', text: 'Malé kroky, veľká úľava. Pracujeme citlivo, s rešpektom a bez tlaku.' },
    stories: { title: 'Príbehy', text: 'Slová žien, ktoré našli oporu v komunite.' },
    gallery: { title: 'Galéria', text: 'Momentky bezpečia, blízkosti a podpory.' },
    support: { title: 'Podporiť', text: 'Pomôžte nám tvoriť priestor, kde sa ženy cítia vypočuté.' }
  },
  helpCards: [],
  stories: [],
  galleryImages: [],
  supportCards: [],
  contact: {
    title: 'Kontakt',
    intro: 'Napíšte nám. Ozveme sa s citlivosťou a rešpektom.',
    contactsTitle: 'Kontakty',
    form: {
      nameLabel: 'Meno',
      emailLabel: 'Email',
      messageLabel: 'Správa',
      submitLabel: 'Odoslať',
      successMessage: 'Ďakujeme za správu. Ozveme sa čo najskôr.',
      errorMessage: 'Prosím, vyplňte všetky polia.'
    },
    info: {
      email: 'kontakt@zijemelenraz.sk',
      instagram: '@zijemelenraz',
      facebook: 'facebook.com/zijemelenraz'
    }
  },
  footer: {
    title: 'Žijeme len raz',
    description: 'Empatická podpora žien na Slovensku.',
    copyright: '© 2024 Žijeme len raz. Všetky práva vyhradené.',
    adminLink: 'Admin'
  }
};

const state = {
  content: null,
  galleryIndex: 0
};

const elements = {
  navToggle: document.querySelector('.nav-toggle'),
  navLinks: document.querySelector('.nav-links'),
  galleryGrid: document.querySelector('[data-list="galleryImages"]'),
  lightbox: document.querySelector('.lightbox'),
  lightboxImage: document.querySelector('.lightbox img'),
  lightboxClose: document.querySelector('.lightbox-close'),
  lightboxPrev: document.querySelector('.lightbox-nav.prev'),
  lightboxNext: document.querySelector('.lightbox-nav.next'),
  form: document.querySelector('.contact-form'),
  formMessage: document.querySelector('.form-message')
};

const getStoredContent = () => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Invalid local override', error);
    return null;
  }
};

const fetchContent = async () => {
  const stored = getStoredContent();
  if (stored) return stored;

  try {
    const response = await fetch('content.json');
    if (!response.ok) throw new Error('Failed to load content.json');
    return await response.json();
  } catch (error) {
    console.warn('Using fallback content. Run a local server for full data.', error);
    return fallbackContent;
  }
};

const renderSimpleContent = (content) => {
  document.querySelectorAll('[data-content]').forEach((el) => {
    const path = el.dataset.content.split('.');
    let value = content;
    path.forEach((key) => {
      if (value && key in value) {
        value = value[key];
      }
    });
    if (typeof value === 'string') {
      el.textContent = value;
    }
  });

  document.querySelectorAll('[data-cta]').forEach((el) => {
    const path = el.dataset.cta.split('.');
    let value = content;
    path.forEach((key) => {
      if (value && key in value) {
        value = value[key];
      }
    });
    if (typeof value === 'string') {
      el.textContent = value;
    }
  });
};

const renderNav = (items = []) => {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const index = Number(link.dataset.nav);
    if (items[index]) {
      link.textContent = items[index];
    }
  });
};

const renderValues = (values) => {
  const container = document.querySelector('[data-list="about.values"]');
  if (!container) return;
  container.innerHTML = '';
  values.forEach((value) => {
    const card = document.createElement('div');
    card.className = 'value-card';
    card.textContent = value;
    container.appendChild(card);
  });
};

const renderHelpCards = (cards) => {
  const container = document.querySelector('[data-list="helpCards"]');
  if (!container) return;
  container.innerHTML = '';
  cards.forEach((card) => {
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <div class="card-icon">${card.icon}</div>
      <h3>${card.title}</h3>
      <p>${card.text}</p>
    `;
    container.appendChild(article);
  });
};

const renderStories = (stories) => {
  const container = document.querySelector('[data-list="stories"]');
  if (!container) return;
  container.innerHTML = '';
  stories.forEach((story) => {
    const article = document.createElement('article');
    article.className = 'quote-card';
    article.innerHTML = `
      <blockquote>“${story.quote}”</blockquote>
      <strong>${story.name}</strong>
    `;
    container.appendChild(article);
  });
};

const renderGallery = (images) => {
  if (!elements.galleryGrid) return;
  elements.galleryGrid.innerHTML = '';
  images.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Momentka z komunity';
    img.loading = 'lazy';
    img.addEventListener('click', () => openLightbox(index));
    elements.galleryGrid.appendChild(img);
  });
};

const renderSupportCards = (cards) => {
  const container = document.querySelector('[data-list="supportCards"]');
  if (!container) return;
  container.innerHTML = '';
  cards.forEach((card) => {
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <h3>${card.title}</h3>
      <p>${card.text}</p>
      <button class="btn btn-primary" type="button">${card.button}</button>
    `;
    container.appendChild(article);
  });
};

const openLightbox = (index) => {
  const images = state.content.galleryImages || [];
  if (!images.length) return;
  state.galleryIndex = index;
  elements.lightboxImage.src = images[state.galleryIndex];
  elements.lightbox.classList.add('active');
  elements.lightbox.setAttribute('aria-hidden', 'false');
};

const closeLightbox = () => {
  elements.lightbox.classList.remove('active');
  elements.lightbox.setAttribute('aria-hidden', 'true');
};

const navigateLightbox = (direction) => {
  const images = state.content.galleryImages || [];
  if (!images.length) return;
  state.galleryIndex = (state.galleryIndex + direction + images.length) % images.length;
  elements.lightboxImage.src = images[state.galleryIndex];
};

const setupLightbox = () => {
  elements.lightboxClose.addEventListener('click', closeLightbox);
  elements.lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  elements.lightboxNext.addEventListener('click', () => navigateLightbox(1));
  elements.lightbox.addEventListener('click', (event) => {
    if (event.target === elements.lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (!elements.lightbox.classList.contains('active')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') navigateLightbox(1);
    if (event.key === 'ArrowLeft') navigateLightbox(-1);
  });
};

const setupNav = () => {
  elements.navToggle.addEventListener('click', () => {
    const isOpen = elements.navLinks.classList.toggle('active');
    elements.navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      elements.navLinks.classList.remove('active');
      elements.navToggle.setAttribute('aria-expanded', 'false');
    });
  });
};

const setupReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));
};

const setupForm = () => {
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(elements.form);
    const name = data.get('name').trim();
    const email = data.get('email').trim();
    const message = data.get('message').trim();

    if (!name || !email || !message) {
      elements.formMessage.textContent = state.content.contact.form.errorMessage;
      return;
    }

    elements.formMessage.textContent = state.content.contact.form.successMessage;
    elements.form.reset();
  });
};

const init = async () => {
  state.content = await fetchContent();
  renderSimpleContent(state.content);
  renderNav(state.content.navigation || []);
  renderValues(state.content.about?.values || []);
  renderHelpCards(state.content.helpCards || []);
  renderStories(state.content.stories || []);
  renderGallery(state.content.galleryImages || []);
  renderSupportCards(state.content.supportCards || []);

  setupNav();
  setupReveal();
  setupLightbox();
  setupForm();
};

init();
