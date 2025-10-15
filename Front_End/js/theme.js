const ModulTheme = {
    checkbox: null,
    
    init() {
        this.checkbox = document.getElementById('theme-checkbox');
        if (!this.checkbox) return;
        
        this.checkbox.addEventListener('change', () => this.toggle());
        
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            this.checkbox.checked = true;
        }
    },
    
    toggle() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
};
