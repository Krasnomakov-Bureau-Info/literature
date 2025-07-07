document.addEventListener('DOMContentLoaded', () => {
    const mainTitle = document.getElementById('main-title');
    const langSwitcher = document.getElementById('language-switcher');
    const bookContent = document.getElementById('book-content');

    let currentLang = 'ru'; // Default to Russian as it's the only one available

    const contentPaths = {
        en: {
            title: "Rings of Patronage",
            pdf: '' // No English PDF yet
        },
        ru: {
            title: "Ринген ван Патронаж",
            pdf: 'ru/Ringen Van Patronage.pdf'
        }
    };

    function render() {
        mainTitle.textContent = contentPaths[currentLang].title;
        renderLangSwitcher();
        renderSections();
        // Assuming a copyright year element exists in the layout
        const copyrightYear = document.getElementById('copyright-year');
        if(copyrightYear) {
            copyrightYear.textContent = new Date().getFullYear();
        }
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
        const book = contentPaths[currentLang];
        if (book.pdf) {
            bookContent.innerHTML = `
                <h2>Book</h2>
                <a href="${book.pdf}" target="_blank"><button>Open PDF</button></a>
            `;
        } else {
            bookContent.innerHTML = `
                <h2>Book</h2>
                <p>Coming soon.</p>
            `;
        }
    }

    render();
}); 