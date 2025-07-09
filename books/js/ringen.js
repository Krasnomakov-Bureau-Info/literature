document.addEventListener('DOMContentLoaded', () => {
    const mainTitle = document.getElementById('main-title');
    const langSwitcher = document.getElementById('language-switcher');
    const bookContent = document.getElementById('book-content');
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modal-text');
    const closeButton = document.querySelector('.close-button');

    let currentLang = 'ru'; // Default to Russian as it's the only one available

    const contentPaths = {
        en: {
            title: "Rings of Patronage",
            pdf: '' // No English PDF yet
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