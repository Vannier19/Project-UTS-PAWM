const ModulMateri = {
    selectElement: null,
    contentDisplay: null,
    topics: [],
    
    init() {
        this.selectElement = document.getElementById('materi-select');
        this.contentDisplay = document.getElementById('materi-content-display');
        
        if (!this.selectElement || !this.contentDisplay) return;
        
        this.topics = Object.keys(quizData);
        this.populateSelect();
        
        this.selectElement.addEventListener('change', () => {
            this.render(this.selectElement.value);
        });
    },
    
    populateSelect() {
        const optionsHTML = this.topics.map(topic => 
            `<option value="${topic}">${topic.toUpperCase()}</option>`
        ).join('');
        this.selectElement.innerHTML = optionsHTML;
    },
    
    render(topic) {
        const content = document.getElementById(`${topic}-content`);
        if (content) {
            this.contentDisplay.innerHTML = content.innerHTML;
        }
    }
};
