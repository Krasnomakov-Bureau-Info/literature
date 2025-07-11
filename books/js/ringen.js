document.addEventListener('DOMContentLoaded', () => {
    const mainTitle = document.getElementById('main-title');
    const langSwitcher = document.getElementById('language-switcher');
    const bookContent = document.getElementById('book-content');
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modal-text');
    const closeButton = document.querySelector('.close-button');

    let currentLang = 'ru'; // Default 

    const contentPaths = {
        en: {
            title: "Ringen Van Patronage",
            pdf: '' // empty for now
        },
        ru: {
            title: "Ринген ван Патронаж",
            pdf: 'ru/Ringen Van Patronage.pdf',
            annotation: 'ru/annotation_ringen.md'
        }
    };

    function loadContent(file) {
        if (!file) {
            alert('Content not available in this language.');
            return;
        }
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                modalText.innerHTML = marked.parse(data);
                modal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error loading content:', error);
                alert('Error loading content.');
            });
    }

    if(closeButton) {
        closeButton.onclick = function() {
            modal.style.display = "none";
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function showWarning() {
        const warningText = `ОСТОРОЖНО! НЕНОРМАТИВНАЯ ЛЕКСИКА! Некоторые главы содержат неприемлемые выражения, оскорбления и яды. Если вы склонны злиться после прочитанного, то не читайте это - вы вероятнее всего взбеситесь. Все совпадения с реальными именами людей или организаций есть предмет случая и не могут быть восприняты иначе.`;
        modalText.innerHTML = `<div style='color: red; font-weight: bold; font-size: 1.2em; margin-bottom: 1em;'>${warningText}</div>`;
        modal.style.display = 'block';
    }

    function isFromMainPage() {
        try {
            const ref = document.referrer;
            if (!ref) return false;
            const a = document.createElement('a');
            a.href = ref;
            // Accept both root and /index.html as main page
            return (
                a.pathname === '/' ||
                a.pathname === '/index.html'
            );
        } catch (e) {
            return false;
        }
    }

    // Show warning only if navigated from main page
    if (isFromMainPage()) {
        showWarning();
    }

    // Remove any duplicate warning banner injection. Only inject once into #banner-slot.
    const bannerSlot = document.getElementById('banner-slot');
    if (bannerSlot && !document.getElementById('warning-banner')) {
        bannerSlot.innerHTML = `
            <div id="warning-banner">
                <button onclick="document.getElementById('warning-banner').style.display='none'" class="warning-close">&times;</button>
                <span>ОСТОРОЖНО! НЕНОРМАТИВНАЯ ЛЕКСИКА! Некоторые главы содержат неприемлемые выражения, оскорбления и яды. Если вы склонны злиться после прочитанного, то не читайте это - вы вероятнее всего взбеситесь. Все совпадения с реальными именами людей или организаций есть предмет случая и не могут быть восприняты иначе.</span>
            </div>
        `;
    }

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
        
        let annotationHTML = '';
        if (book.annotation) {
            annotationHTML = `
                <h2>Annotation</h2>
                <button id="read-annotation-btn">Read Annotation</button>
            `;
        }

        let bookHTML = '';
        if (book.pdf) {
            bookHTML = `
                <h2>Book</h2>
                <a href="${book.pdf}" target="_blank"><button>Open PDF</button></a>
            `;
        } else {
            bookHTML = `
                <h2>Book</h2>
                <p>Coming soon.</p>
            `;
        }
        
        bookContent.innerHTML = annotationHTML + bookHTML;

        if (book.annotation) {
            document.getElementById('read-annotation-btn').addEventListener('click', () => {
                loadContent(book.annotation);
            });
        }
    }

    render();
}); 