const ADMIN_KEY = 'zlr-1234';
// POZNÁMKA: Toto overenie je len dočasné a NIE je bezpečné.
// V budúcnosti ho nahraďte reálnou autentifikáciou na serveri.

const LOCAL_STORAGE_KEY = 'zlr_content_override';

const elements = {
  gate: document.getElementById('accessGate'),
  gateInput: document.getElementById('adminKeyInput'),
  gateSubmit: document.getElementById('adminKeySubmit'),
  gateMessage: document.getElementById('adminGateMessage'),
  adminShell: document.getElementById('adminShell'),
  editor: document.getElementById('editor'),
  navButtons: document.querySelectorAll('.admin-nav button'),
  saveBtn: document.getElementById('saveBtn'),
  resetBtn: document.getElementById('resetBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput')
};

const state = {
  content: null,
  activeSection: 'hero'
};

const getStoredContent = () => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Invalid stored content', error);
    return null;
  }
};

const loadContent = async () => {
  const stored = getStoredContent();
  if (stored) return stored;
  const response = await fetch('content.json');
  if (!response.ok) {
    throw new Error('Nepodarilo sa načítať content.json');
  }
  return response.json();
};

const renderInput = (labelText, value, onChange, isTextarea = false) => {
  const wrapper = document.createElement('label');
  wrapper.textContent = labelText;
  const input = document.createElement(isTextarea ? 'textarea' : 'input');
  input.value = value;
  if (isTextarea) input.rows = 3;
  input.addEventListener('input', (event) => onChange(event.target.value));
  wrapper.appendChild(input);
  return wrapper;
};

const renderList = ({ items, onUpdate, buildItem, addLabel, defaultItem }) => {
  const container = document.createElement('div');
  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.appendChild(buildItem(item, index));

    const actions = document.createElement('div');
    actions.className = 'list-actions';

    const upButton = document.createElement('button');
    upButton.textContent = '↑';
    upButton.disabled = index === 0;
    upButton.addEventListener('click', () => {
      const updated = [...items];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      onUpdate(updated);
    });

    const downButton = document.createElement('button');
    downButton.textContent = '↓';
    downButton.disabled = index === items.length - 1;
    downButton.addEventListener('click', () => {
      const updated = [...items];
      [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
      onUpdate(updated);
    });

    const removeButton = document.createElement('button');
    removeButton.textContent = '✕';
    removeButton.addEventListener('click', () => {
      const updated = items.filter((_, i) => i !== index);
      onUpdate(updated);
    });

    actions.append(upButton, downButton, removeButton);
    row.appendChild(actions);
    container.appendChild(row);
  });

  const addButton = document.createElement('button');
  addButton.className = 'btn btn-ghost';
  addButton.type = 'button';
  addButton.textContent = addLabel;
  addButton.addEventListener('click', () => onUpdate([...items, defaultItem]));
  container.appendChild(addButton);
  return container;
};

const renderSection = () => {
  elements.editor.innerHTML = '';
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = elements.navButtons
    ? document.querySelector(`.admin-nav button[data-section="${state.activeSection}"]`).textContent
    : 'Editor';
  elements.editor.appendChild(sectionTitle);

  if (state.activeSection === 'hero') {
    const hero = state.content.hero;
    elements.editor.append(
      renderInput('Tagline', hero.tagline, (val) => (hero.tagline = val)),
      renderInput('Headline', hero.headline, (val) => (hero.headline = val)),
      renderInput('Podtext', hero.subtext, (val) => (hero.subtext = val), true),
      renderInput('CTA 1', hero.cta1, (val) => (hero.cta1 = val)),
      renderInput('CTA 2', hero.cta2, (val) => (hero.cta2 = val))
    );
  }

  if (state.activeSection === 'about') {
    const about = state.content.about;
    elements.editor.append(
      renderInput('Nadpis', about.title, (val) => (about.title = val)),
      renderInput('Text', about.body, (val) => (about.body = val), true)
    );

    const list = renderList({
      items: about.values,
      onUpdate: (updated) => {
        about.values = updated;
        renderSection();
      },
      addLabel: 'Pridať hodnotu',
      defaultItem: 'Nová hodnota',
      buildItem: (item, index) => {
        const input = document.createElement('input');
        input.value = item;
        input.addEventListener('input', (event) => {
          about.values[index] = event.target.value;
        });
        return input;
      }
    });
    elements.editor.appendChild(list);
  }

  if (state.activeSection === 'help') {
    const cards = state.content.helpCards;
    const section = state.content.sections.help;
    elements.editor.append(
      renderInput('Nadpis sekcie', section.title, (val) => (section.title = val)),
      renderInput('Text sekcie', section.text, (val) => (section.text = val), true)
    );
    const list = renderList({
      items: cards,
      onUpdate: (updated) => {
        state.content.helpCards = updated;
        renderSection();
      },
      addLabel: 'Pridať kartu',
      defaultItem: { icon: '🌿', title: 'Nová karta', text: 'Text karty' },
      buildItem: (item, index) => {
        const wrap = document.createElement('div');
        wrap.style.display = 'grid';
        wrap.style.gap = '0.4rem';

        const icon = document.createElement('input');
        icon.value = item.icon;
        icon.placeholder = 'Ikona (emoji)';
        icon.addEventListener('input', (event) => (cards[index].icon = event.target.value));

        const title = document.createElement('input');
        title.value = item.title;
        title.placeholder = 'Nadpis';
        title.addEventListener('input', (event) => (cards[index].title = event.target.value));

        const text = document.createElement('textarea');
        text.rows = 2;
        text.value = item.text;
        text.placeholder = 'Text';
        text.addEventListener('input', (event) => (cards[index].text = event.target.value));

        wrap.append(icon, title, text);
        return wrap;
      }
    });
    elements.editor.appendChild(list);
  }

  if (state.activeSection === 'stories') {
    const stories = state.content.stories;
    const section = state.content.sections.stories;
    elements.editor.append(
      renderInput('Nadpis sekcie', section.title, (val) => (section.title = val)),
      renderInput('Text sekcie', section.text, (val) => (section.text = val), true)
    );
    const list = renderList({
      items: stories,
      onUpdate: (updated) => {
        state.content.stories = updated;
        renderSection();
      },
      addLabel: 'Pridať príbeh',
      defaultItem: { quote: 'Nový príbeh', name: 'Anonymne' },
      buildItem: (item, index) => {
        const wrap = document.createElement('div');
        wrap.style.display = 'grid';
        wrap.style.gap = '0.4rem';

        const quote = document.createElement('textarea');
        quote.rows = 2;
        quote.value = item.quote;
        quote.placeholder = 'Citácia';
        quote.addEventListener('input', (event) => (stories[index].quote = event.target.value));

        const name = document.createElement('input');
        name.value = item.name;
        name.placeholder = 'Menovka';
        name.addEventListener('input', (event) => (stories[index].name = event.target.value));

        wrap.append(quote, name);
        return wrap;
      }
    });
    elements.editor.appendChild(list);
  }

  if (state.activeSection === 'gallery') {
    const images = state.content.galleryImages;
    const section = state.content.sections.gallery;
    elements.editor.append(
      renderInput('Nadpis sekcie', section.title, (val) => (section.title = val)),
      renderInput('Text sekcie', section.text, (val) => (section.text = val), true)
    );
    const list = renderList({
      items: images,
      onUpdate: (updated) => {
        state.content.galleryImages = updated;
        renderSection();
      },
      addLabel: 'Pridať URL obrázka',
      defaultItem: 'https://images.unsplash.com/',
      buildItem: (item, index) => {
        const input = document.createElement('input');
        input.value = item;
        input.placeholder = 'URL obrázka';
        input.addEventListener('input', (event) => (images[index] = event.target.value));
        return input;
      }
    });
    elements.editor.appendChild(list);
  }

  if (state.activeSection === 'support') {
    const cards = state.content.supportCards;
    const section = state.content.sections.support;
    elements.editor.append(
      renderInput('Nadpis sekcie', section.title, (val) => (section.title = val)),
      renderInput('Text sekcie', section.text, (val) => (section.text = val), true)
    );
    const list = renderList({
      items: cards,
      onUpdate: (updated) => {
        state.content.supportCards = updated;
        renderSection();
      },
      addLabel: 'Pridať kartu podpory',
      defaultItem: { title: 'Nová podpora', text: 'Popis', button: 'Tlačidlo' },
      buildItem: (item, index) => {
        const wrap = document.createElement('div');
        wrap.style.display = 'grid';
        wrap.style.gap = '0.4rem';

        const title = document.createElement('input');
        title.value = item.title;
        title.placeholder = 'Nadpis';
        title.addEventListener('input', (event) => (cards[index].title = event.target.value));

        const text = document.createElement('textarea');
        text.rows = 2;
        text.value = item.text;
        text.placeholder = 'Text';
        text.addEventListener('input', (event) => (cards[index].text = event.target.value));

        const button = document.createElement('input');
        button.value = item.button;
        button.placeholder = 'Text tlačidla';
        button.addEventListener('input', (event) => (cards[index].button = event.target.value));

        wrap.append(title, text, button);
        return wrap;
      }
    });
    elements.editor.appendChild(list);
  }

  if (state.activeSection === 'contact') {
    const contact = state.content.contact;
    elements.editor.append(
      renderInput('Nadpis', contact.title, (val) => (contact.title = val)),
      renderInput('Úvodný text', contact.intro, (val) => (contact.intro = val), true),
      renderInput('Nadpis kontaktov', contact.contactsTitle, (val) => (contact.contactsTitle = val)),
      renderInput('Meno (label)', contact.form.nameLabel, (val) => (contact.form.nameLabel = val)),
      renderInput('Email (label)', contact.form.emailLabel, (val) => (contact.form.emailLabel = val)),
      renderInput('Správa (label)', contact.form.messageLabel, (val) => (contact.form.messageLabel = val)),
      renderInput('Text tlačidla', contact.form.submitLabel, (val) => (contact.form.submitLabel = val)),
      renderInput('Správa po odoslaní', contact.form.successMessage, (val) => (contact.form.successMessage = val), true),
      renderInput('Chybová správa', contact.form.errorMessage, (val) => (contact.form.errorMessage = val), true),
      renderInput('Email', contact.info.email, (val) => (contact.info.email = val)),
      renderInput('Instagram', contact.info.instagram, (val) => (contact.info.instagram = val)),
      renderInput('Facebook', contact.info.facebook, (val) => (contact.info.facebook = val))
    );
  }
};

const saveChanges = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.content));
  alert('Zmeny uložené do LocalStorage.');
};

const resetChanges = async () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  state.content = await loadContent();
  renderSection();
};

const exportJson = () => {
  const data = JSON.stringify(state.content, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'content.json';
  link.click();
  URL.revokeObjectURL(url);
};

const importJson = (file) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      state.content = parsed;
      renderSection();
    } catch (error) {
      alert('Neplatný JSON súbor.');
    }
  };
  reader.readAsText(file);
};

const setupNav = () => {
  elements.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      elements.navButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      state.activeSection = button.dataset.section;
      renderSection();
    });
  });
};

const setupAdmin = async () => {
  state.content = await loadContent();
  setupNav();
  renderSection();

  elements.saveBtn.addEventListener('click', saveChanges);
  elements.resetBtn.addEventListener('click', resetChanges);
  elements.exportBtn.addEventListener('click', exportJson);
  elements.importInput.addEventListener('change', (event) => importJson(event.target.files[0]));
};

const unlockGate = async () => {
  if (elements.gateInput.value.trim() !== ADMIN_KEY) {
    elements.gateMessage.textContent = 'Nesprávny kľúč. Skúste znova.';
    return;
  }
  elements.gate.hidden = true;
  elements.adminShell.hidden = false;
  await setupAdmin();
};

elements.gateSubmit.addEventListener('click', unlockGate);
elements.gateInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    unlockGate();
  }
});
