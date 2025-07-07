document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const mainTitle = document.getElementById('main-title');
    const langSwitcher = document.getElementById('language-switcher');
    const bookContent = document.getElementById('book-content');

    const converter = new showdown.Converter();
    let currentLang = 'en';

    const contentPaths = {
        en: {
            title: "The Devilism Essence or Materials of the Case of Mister N.",
            generalSynopsis: 'the_devilism_essence/eng/synopsis_devilism_essence_eng.md',
            book1: 'the_devilism_essence/eng/about_the_spider_and_the_time.md',
            book1_pdf: 'the_devilism_essence/eng/AboutTheSpiderAndTheTime.pdf'
        },
        ru: {
            title: "Суть дьяволизма или материалы дела Господина Н",
            generalSynopsis: 'the_devilism_essence/ru/synopsis_ru.txt',
            book1: 'the_devilism_essence/ru/о_пауке_и_о_времени.md',
            book1_synopsis: 'the_devilism_essence/ru/synopsis_asat_ru.txt'
        }
    };

    function fetchAndDisplay(path, element) {
        fetch(path)
            .then(response => response.text())
            .then(text => {
                element.innerHTML = converter.makeHtml(text);
            });
    }

    function render() {
        mainTitle.textContent = contentPaths[currentLang].title;
        renderLangSwitcher();
        renderSections();
        document.getElementById('copyright-year').textContent = new Date().getFullYear();
    }

    function renderLangSwitcher() {
        langSwitcher.innerHTML = `
            <button id="en-btn" ${currentLang === 'en' ? 'disabled' : ''}>English</button>
            <button id="ru-btn" ${currentLang === 'ru' ? 'disabled' : ''}>Русский</button>
        `;
        document.getElementById('en-btn').addEventListener('click', () => {
            currentLang = 'en';
            render();
        });
        document.getElementById('ru-btn').addEventListener('click', () => {
            currentLang = 'ru';
            render();
        });
    }

    function renderSections() {
        bookContent.innerHTML = `
            <h2>General Synopsis</h2>
            <button id="gen-synopsis-btn">Show Synopsis</button>
            <div id="gen-synopsis-content" style="display: none;"></div>

            <h2>Book 1: About the Spider and the Time</h2>
            <button id="book1-text-btn">Show Text</button>
            ${currentLang === 'ru' ? '<button id="book1-synopsis-btn">Show Synopsis</button>' : ''}
            ${currentLang === 'en' ? '<a href="' + contentPaths.en.book1_pdf + '" target="_blank"><button>Open PDF</button></a>' : ''}
            <div id="book1-text-content" style="display: none;"></div>
            <div id="book1-synopsis-content" style="display: none;"></div>
        `;

        document.getElementById('gen-synopsis-btn').addEventListener('click', (e) => {
            const contentEl = document.getElementById('gen-synopsis-content');
            if (contentEl.style.display === 'none') {
                fetchAndDisplay(contentPaths[currentLang].generalSynopsis, contentEl);
                contentEl.style.display = 'block';
                e.target.textContent = 'Hide Synopsis';
            } else {
                contentEl.style.display = 'none';
                e.target.textContent = 'Show Synopsis';
            }
        });

        document.getElementById('book1-text-btn').addEventListener('click', (e) => {
            const contentEl = document.getElementById('book1-text-content');
            if (contentEl.style.display === 'none') {
                fetchAndDisplay(contentPaths[currentLang].book1, contentEl);
                contentEl.style.display = 'block';
                e.target.textContent = 'Hide Text';
            } else {
                contentEl.style.display = 'none';
                e.target.textContent = 'Show Text';
            }
        });

        if (currentLang === 'ru') {
            document.getElementById('book1-synopsis-btn').addEventListener('click', (e) => {
                const contentEl = document.getElementById('book1-synopsis-content');
                 if (contentEl.style.display === 'none') {
                    fetchAndDisplay(contentPaths.ru.book1_synopsis, contentEl);
                    contentEl.style.display = 'block';
                    e.target.textContent = 'Hide Synopsis';
                } else {
                    contentEl.style.display = 'none';
                    e.target.textContent = 'Show Synopsis';
                }
            });
        }
    }

    render();
}); 