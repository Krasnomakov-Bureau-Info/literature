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
        const parsedItems = [];
        let contentBuffer = [];
        let currentTitle = "Introduction";
        let isContentStarted = false;

        // Skip the table of contents at the beginning of the file
        let tocEndIndex = 0;
        for(let i = 0; i < lines.length; i++){
            if (lines[i].trim().toLowerCase() === 'contents') {
                tocEndIndex = i;
            } else if (lines[i].match(/^\s*(\*{2,3})/)) {
                break; // Stop if we hit a chapter/part marker
            }
        }
        
        const contentLines = lines.slice(tocEndIndex + 1);
        let introContent = [];

        // Find where the real content starts
        let firstHeaderIndex = contentLines.findIndex(line => line.match(/^\s*(\*{2,3})/) || line.match(/^(PART\s\d+\s-\s.*|Foreword|Prologue|From the author)$/));
        
        if (firstHeaderIndex > 0) {
            introContent = contentLines.slice(0, firstHeaderIndex);
            parsedItems.push({ title: "Introduction", content: introContent.join('\n').trim() });
        } else {
            firstHeaderIndex = 0; // No intro, start from the beginning
        }


        for (let i = firstHeaderIndex; i < contentLines.length; i++) {
            const line = contentLines[i];
            const partMatch = line.match(/^\s*\*{2}(.+?)\*{2}\s*$/);
            const chapterMatch = line.match(/^\s*\*{3}(.+?)\*{3}\s*$/);
            const legacyPartMatch = line.match(/^(PART\s\d+\s-\s.*|Foreword|Prologue|From the author)$/);

            if (partMatch || chapterMatch || legacyPartMatch) {
                if (contentBuffer.length > 0 && currentTitle) {
                     parsedItems.push({ title: currentTitle, content: contentBuffer.join('\n').trim() });
                }
                contentBuffer = [];

                if (partMatch || legacyPartMatch) {
                    const title = partMatch ? partMatch[1].trim() : legacyPartMatch[1].trim();
                    parsedItems.push({ title: title, isPart: true });
                    currentTitle = null; 
                } else if (chapterMatch) {
                    currentTitle = chapterMatch[1].trim();
                }
            } else {
                if(currentTitle) contentBuffer.push(line);
            }
        }

        if (contentBuffer.length > 0 && currentTitle) {
            parsedItems.push({ title: currentTitle, content: contentBuffer.join('\n').trim() });
        }

        return parsedItems.filter(item => item.title);
    }

    function renderChapter(index) {
        if (index < 0 || index >= chapters.length) {
            return;
        }
        
        const chapter = chapters[index];
        if (!chapter.content) return; // Do not render if it's a part header

        currentChapterIndex = index;
        chapterTitle.textContent = chapter.title;
        chapterText.innerHTML = converter.makeHtml(chapter.content);

        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === chapters.length - 1;

        // Update TOC highlighting
        const tocItems = tocList.getElementsByTagName('li');
        for (let i = 0; i < tocItems.length; i++) {
             const itemIndex = tocItems[i].dataset.index;
             if (itemIndex) {
                tocItems[i].style.fontWeight = parseInt(itemIndex, 10) === index ? 'bold' : 'normal';
             }
        }
         chapterText.scrollTop = 0;
    }

    function renderTOC() {
        tocList.innerHTML = '';
        const clickableChapters = chapters.map((item, index) => ({...item, originalIndex: index}))
                                        .filter(item => item.content);
        let partContainer = {};
        
        chapters.forEach((item, index) => {
            if(item.isPart){
                if(partContainer[item.title]){
                    // part already exists
                } else {
                    partContainer[item.title] = [];
                }
            } else {
                const lastPart = Object.keys(partContainer).pop() || "Introduction";
                if(!partContainer[lastPart]) partContainer[lastPart] = [];
                 partContainer[lastPart].push({ ...item, originalIndex: index });
            }
        });

        for (const partTitle in partContainer) {
            const partLi = document.createElement('li');
            partLi.innerHTML = `<strong>${partTitle}</strong>`;
            partLi.style.marginTop = '15px';
            partLi.style.marginBottom = '5px';
            partLi.style.fontWeight = 'bold';
            tocList.appendChild(partLi);

            partContainer[partTitle].forEach(chapter => {
                const li = document.createElement('li');
                li.textContent = chapter.title;
                li.dataset.index = chapter.originalIndex;
                li.style.marginLeft = '10px';
                li.addEventListener('click', () => {
                    renderChapter(chapter.originalIndex);
                });
                tocList.appendChild(li);
            });
        }
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
                    const firstChapterIndex = chapters.findIndex(c => c.content);
                    renderChapter(firstChapterIndex !== -1 ? firstChapterIndex : 0);
                }
            });
    }

    prevBtn.addEventListener('click', () => {
        let prevIndex = -1;
        for(let i = currentChapterIndex - 1; i >= 0; i--){
            if(chapters[i].content){
                prevIndex = i;
                break;
            }
        }
        if (prevIndex !== -1) {
            renderChapter(prevIndex);
        }
    });

    nextBtn.addEventListener('click', () => {
        let nextIndex = -1;
        for(let i = currentChapterIndex + 1; i < chapters.length; i++){
            if(chapters[i].content){
                nextIndex = i;
                break;
            }
        }
        if (nextIndex !== -1) {
            renderChapter(nextIndex);
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
             ${currentLang === 'ru' ? '<div id="book1-text-content" style="display: none;"></div>' : ''}
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
                 if (contentEl && contentEl.style.display === 'none') {
                    fetchAndDisplay(contentPaths[currentLang].book1, contentEl);
                    contentEl.style.display = 'block';
                } else if (contentEl) {
                    contentEl.style.display = 'none';
                }
            }
        });

        const book1SynopsisBtn = document.getElementById('book1-synopsis-btn');
        if (book1SynopsisBtn) {
            book1SynopsisBtn.addEventListener('click', (e) => {
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