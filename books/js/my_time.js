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
      title: 'My Time',
      pdf: '', // Coming soon
      annotation: '' // Coming soon
    },
    ru: {
      title: 'Моё время. Рассуждения о…',
      pdf: 'Моё время.pdf',
      annotation: 'Аннотация к произведению "Мое Время_ Рассуждения о.md',
      readme: 'readme.md'
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
      ? '<button id="annotation-btn">Read Annotation</button>'
      : '<button id="annotation-btn" disabled>Coming soon</button>';
    const pdfControls = book.pdf
      ? `<a href="${book.pdf}" target="_blank"><button>Open PDF</button></a>`
      : '<button disabled>Coming soon</button>';

    let extraRu = '';
    if (currentLang === 'ru' && contentPaths.ru.readme) {
      extraRu = `
        <h3>О книге</h3>
        <button id="about-btn">Показать описание</button>
      `;
    }

    bookContent.innerHTML = `
      <h2>Аннотация</h2>
      ${annotationControls}
      <h2>Книга</h2>
      ${pdfControls}
      ${extraRu}
    `;

    if (currentLang === 'ru') {
      document.getElementById('annotation-btn').onclick = () => loadMarkdownToModal(contentPaths.ru.annotation);
      const aboutBtn = document.getElementById('about-btn');
      if (aboutBtn) aboutBtn.onclick = () => loadMarkdownToModal(contentPaths.ru.readme);
    } else {
      document.getElementById('annotation-btn').onclick = () => loadMarkdownToModal('');
    }
  }

  render();
});
