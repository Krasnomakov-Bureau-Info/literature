document.addEventListener('DOMContentLoaded', () => {
    const mainTitle = document.getElementById('main-title');
    const langSwitcher = document.getElementById('language-switcher');
    const bookContent = document.getElementById('book-content');
    const readerView = document.getElementById('reader-view');
    const chapterTitle = document.getElementById('chapter-title');
    const chapterText = document.getElementById('chapter-text');
    const tocList = document.getElementById('toc-list');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const nextBtns = document.querySelectorAll('.next-btn');

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
        let currentTitle = null;

        // Find the index of the first real heading
        let firstHeadingIndex = lines.findIndex(line =>
            line.match(/^\s*(\*{2,3})(.+?)\1\s*$/)
        );

        if (firstHeadingIndex === -1) { // No chapters found
            if (markdownText.trim()) {
                parsedChapters.push({ title: 'Book', content: markdownText, type: 'chapter' });
            }
            return parsedChapters;
        }

        const relevantLines = lines.slice(firstHeadingIndex);

        for (const line of relevantLines) {
            const partMatch = line.match(/^\s*\*{2}(.+?)\*{2}\s*$/);
            const chapterMatch = line.match(/^\s*\*{3}(.+?)\*{3}\s*$/);

            if (partMatch) {
                if (currentTitle && contentBuffer.length > 0) {
                    parsedChapters.push({ title: currentTitle, content: contentBuffer.join('\n'), type: 'chapter' });
                }
                contentBuffer = [];
                currentTitle = null;
                parsedChapters.push({ title: partMatch[1].trim(), type: 'part' });
            } else if (chapterMatch) {
                if (currentTitle && contentBuffer.length > 0) {
                    parsedChapters.push({ title: currentTitle, content: contentBuffer.join('\n'), type: 'chapter' });
                }
                contentBuffer = [];
                currentTitle = chapterMatch[1].trim();
            } else {
                if (currentTitle) {
                    contentBuffer.push(line);
                }
            }
        }

        if (currentTitle && contentBuffer.length > 0) {
            parsedChapters.push({ title: currentTitle, content: contentBuffer.join('\n'), type: 'chapter' });
        }

        return parsedChapters;
    }

    function renderChapter(index) {
        if (index < 0 || index >= chapters.length) {
            return;
        }
        const chapter = chapters[index];
        if (chapter.type !== 'chapter') {
            // This case should ideally not be hit with correct navigation logic
            return; 
        }

        currentChapterIndex = index;
        chapterTitle.textContent = chapter.title;
        chapterText.innerHTML = converter.makeHtml(chapter.content);

        const prevChapter = chapters.slice(0, index).reverse().find(c => c.type === 'chapter');
        const nextChapter = chapters.slice(index + 1).find(c => c.type === 'chapter');

        prevBtns.forEach(btn => btn.disabled = !prevChapter);
        nextBtns.forEach(btn => btn.disabled = !nextChapter);

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
                    const firstChapterIndex = chapters.findIndex(c => c.type === 'chapter');
                    if (firstChapterIndex !== -1) {
                        renderChapter(firstChapterIndex);
                    }
                }
            });
    }

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const prevChapterIndex = chapters.slice(0, currentChapterIndex).findLastIndex(c => c.type === 'chapter');
            if (prevChapterIndex !== -1) {
                renderChapter(prevChapterIndex);
            }
        });
    });

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextChapterIndex = chapters.slice(currentChapterIndex + 1).findIndex(c => c.type === 'chapter');
            if (nextChapterIndex !== -1) {
                renderChapter(currentChapterIndex + 1 + nextChapterIndex);
            }
        });
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