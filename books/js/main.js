document.addEventListener('DOMContentLoaded', () => {
    const mainTitle = document.getElementById('main-title');
    const langSwitcher = document.getElementById('language-switcher');
    const bookContent = document.getElementById('book-content');
    const readerView = document.getElementById('reader-view');
    const chapterTitle = document.getElementById('chapter-title');
    const chapterText = document.getElementById('chapter-text');
    const tocList = document.getElementById('toc-list');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    const converter = new showdown.Converter();
    let currentLang = 'en';
    let chapters = [];
    let currentChapterIndex = 0;

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

    function parseChapters(markdownText) {
        const lines = markdownText.split('\n');
        const parsedChapters = [];
        let contentBuffer = [];
        let currentTitle = "Introduction";

        // Find the index of the first title to capture the introduction
        let firstTitleIndex = lines.findIndex(line => 
            line.match(/^\s*\*{3}(.+?)\*{3}\s*$/) ||
            line.match(/^(PART\s\d+\s-\s.*|Foreword|Prologue|From the author)$/)
        );

        if (firstTitleIndex === -1) { // No chapters found
            if (markdownText.trim()) {
                parsedChapters.push({ title: 'Book', content: markdownText});
            }
            return parsedChapters;
        }

        const introContent = lines.slice(0, firstTitleIndex).join('\n').trim();
        if (introContent) {
             parsedChapters.push({ title: "Introduction", content: introContent });
        }


        for (let i = firstTitleIndex; i < lines.length; i++) {
            const line = lines[i];
            const chapterMatch = line.match(/^\s*\*{3}(.+?)\*{3}\s*$/);
            const partMatch = line.match(/^(PART\s\d+\s-\s.*|Foreword|Prologue|From the author)$/);

            if (chapterMatch || partMatch) {
                if (contentBuffer.length > 0) {
                    parsedChapters.push({ title: currentTitle, content: contentBuffer.join('\n'), type: 'chapter' });
                }
                currentTitle = chapterMatch ? chapterMatch[1].trim() : line.trim();
                contentBuffer = [];
                if (partMatch) {
                    parsedChapters.push({ title: currentTitle, type: 'part' });
                    currentTitle = ''; // Reset title after a part heading
                }
            } else {
                contentBuffer.push(line);
            }
        }
        if (contentBuffer.length > 0 && currentTitle) {
            parsedChapters.push({ title: currentTitle, content: contentBuffer.join('\n'), type: 'chapter' });
        }

        return parsedChapters.filter(c => c.title && (c.type === 'part' || (c.content && c.content.trim() !== '')) && !c.title.toLowerCase().includes('contents') );
    }

    function renderChapter(index) {
        if (index < 0 || index >= chapters.length) {
            return;
        }
        currentChapterIndex = index;
        const chapter = chapters[index];
        chapterTitle.textContent = chapter.title;
        chapterText.innerHTML = converter.makeHtml(chapter.content);

        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === chapters.length - 1;

        const tocItems = tocList.getElementsByTagName('li');
        for (let i = 0; i < tocItems.length; i++) {
            const chapterIndex = parseInt(tocItems[i].dataset.index, 10);
            if (!isNaN(chapterIndex)) {
                tocItems[i].style.fontWeight = chapterIndex === index ? 'bold' : 'normal';
                tocItems[i].style.color = chapterIndex === index ? '#000000' : '#000000';
            }
        }
         chapterText.scrollTop = 0;
    }

    function renderTOC() {
        tocList.innerHTML = '';
        chapters.forEach((chapter, index) => {
            const li = document.createElement('li');
            if (chapter.type === 'part') {
                li.innerHTML = `<strong>${chapter.title}</strong>`;
                li.style.marginTop = '10px';
            } else {
                li.textContent = chapter.title;
                li.dataset.index = index;
                li.addEventListener('click', () => {
                    renderChapter(index);
                });
            }
            tocList.appendChild(li);
        });
    }

    function loadBookIntoReader(path) {
        fetch(path)
            .then(response => response.text())
            .then(text => {
                chapters = parseChapters(text);
                if (chapters.length > 0) {
                    bookContent.style.display = 'none';
                    readerView.style.display = 'flex';
                    renderTOC();
                    renderChapter(0);
                }
            });
    }

    prevBtn.addEventListener('click', () => {
        if (currentChapterIndex > 0) {
            renderChapter(currentChapterIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentChapterIndex < chapters.length - 1) {
            renderChapter(currentChapterIndex + 1);
        }
    });

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
            readerView.style.display = 'none';
            bookContent.style.display = 'block';
        });
        document.getElementById('ru-btn').addEventListener('click', () => {
            currentLang = 'ru';
            render();
            readerView.style.display = 'none';
            bookContent.style.display = 'block';
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

        document.getElementById('book1-text-btn').addEventListener('click', () => {
             if (currentLang === 'en') {
                loadBookIntoReader(contentPaths[currentLang].book1);
            } else {
                const contentEl = document.getElementById('book1-text-content');
                if (contentEl.style.display === 'none') {
                    fetchAndDisplay(contentPaths[currentLang].book1, contentEl);
                    contentEl.style.display = 'block';
                } else {
                    contentEl.style.display = 'none';
                }
            }
        });

        if (currentLang === 'ru') {
            const book1TextContainer = document.createElement('div');
            book1TextContainer.id = 'book1-text-content';
            book1TextContainer.style.display = 'none';
            document.getElementById('book1-text-btn').after(book1TextContainer);

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