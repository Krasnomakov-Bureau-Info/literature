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
      title: 'Ballads about Korean BBQ',
      pdf: '',
      annotation: ''
    },
    ru: {
      title: 'Баллады о корейском барбекю',
      pdf: 'Баллады_о_корейском_барбекю.pdf',
      annotation: 'аннотация.md'
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
      <button id=\"en-btn\" ${currentLang === 'en' ? 'disabled' : ''}>English</button>
      <button id=\"ru-btn\" ${currentLang === 'ru' ? 'disabled' : ''}>Русский</button>
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

    bookContent.innerHTML = `
      <h2>Annotation</h2>
      ${annotationControls}
      <h2>Book</h2>
      ${pdfControls}
    `;

    if (currentLang === 'ru') {
      document.getElementById('annotation-btn').onclick = () => loadMarkdownToModal(contentPaths.ru.annotation);
    } else {
      document.getElementById('annotation-btn').onclick = () => loadMarkdownToModal('');
    }
  }

  render();
});
