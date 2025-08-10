document.addEventListener('DOMContentLoaded', () => {
  const mainTitle = document.getElementById('main-title');
  const langSwitcher = document.getElementById('language-switcher');
  const bookContent = document.getElementById('book-content');
  const modal = document.getElementById('modal');
  const modalText = document.getElementById('modal-text');
  const closeButton = document.querySelector('.close-button');

  let currentLang = 'ru';

  const contentPaths = {
    en: {
      title: 'Now He Is With Me — Pavel Ivanovich',
      pdf: '', // Coming soon
      annotation: '' // Coming soon
    },
    ru: {
      title: 'Теперь он у меня — Павел Иванович',
      pdf: 'Теперь он у меня – Павел Иванович.pdf',
      annotation: 'Аннотация.md',
      disclaimer: '../now_he_is_with_me/README.md'
    }
  };

  function loadMarkdownToModal(file) {
    if (!file) {
      modalText.innerHTML = '<p>Coming soon.</p>';
      modal.style.display = 'block';
      return;
    }
    fetch(file)
      .then(res => res.text())
      .then(text => {
        modalText.innerHTML = marked.parse(text);
        modal.style.display = 'block';
      })
      .catch(() => {
        modalText.innerHTML = '<p>Content not available.</p>';
        modal.style.display = 'block';
      });
  }

  if (closeButton) closeButton.onclick = () => (modal.style.display = 'none');
  window.onclick = e => {
    if (e.target === modal) modal.style.display = 'none';
  };

  function renderLangSwitcher() {
    langSwitcher.innerHTML = `
      <button id="en-btn" ${currentLang === 'en' ? 'disabled' : ''}>English</button>
      <button id="ru-btn" ${currentLang === 'ru' ? 'disabled' : ''}>Русский</button>
    `;
    document.getElementById('en-btn').onclick = () => {
      currentLang = 'en';
      render();
    };
    document.getElementById('ru-btn').onclick = () => {
      currentLang = 'ru';
      render();
    };
  }

  function render() {
    const book = contentPaths[currentLang];
    mainTitle.textContent = book.title;
    renderLangSwitcher();

    const annotationControls = book.annotation
      ? '<button id="annotation-btn">Читать аннотацию</button>'
      : '<button id="annotation-btn" disabled>Coming soon</button>';
    const pdfControls = book.pdf
      ? `<a href="${book.pdf}" target="_blank"><button>Открыть PDF</button></a>`
      : '<button disabled>Coming soon</button>';

    let disclaimerBtn = '';
    if (currentLang === 'ru') {
      disclaimerBtn = `<button id="disclaimer-btn">Полный дисклеймер</button>`;
    }

    bookContent.innerHTML = `
      <h2>Аннотация</h2>
      ${annotationControls}
      <h2>Книга</h2>
      ${pdfControls}
      ${disclaimerBtn}
    `;

    if (currentLang === 'ru') {
      document.getElementById('annotation-btn').onclick = () => loadMarkdownToModal(contentPaths.ru.annotation);
      const dBtn = document.getElementById('disclaimer-btn');
      if (dBtn) dBtn.onclick = () => loadMarkdownToModal(contentPaths.ru.disclaimer);
    } else {
      document.getElementById('annotation-btn').onclick = () => loadMarkdownToModal('');
    }
  }

  render();
});
