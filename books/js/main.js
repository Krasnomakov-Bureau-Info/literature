document.addEventListener('DOMContentLoaded', function () {
    const contentDiv = document.getElementById('content');
    const markdownUrl = 'the_devilism_essence/eng/about_the_spider_and_the_time.md';
    
    fetch(markdownUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(markdown => {
            const converter = new showdown.Converter();
            const html = converter.makeHtml(markdown);
            contentDiv.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching the markdown file:', error);
            contentDiv.innerHTML = `<p>Error loading content. Please check the console for details.</p>`;
        });
}); 