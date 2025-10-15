document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token || !username) {
        window.location.href = 'login.html';
        return;
    }
    
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const confirmLogout = document.getElementById('confirm-logout');
    const cancelLogout = document.getElementById('cancel-logout');
    
    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', () => {
            logoutModal.style.display = 'flex';
        });
        
        if (confirmLogout) {
            confirmLogout.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = 'login.html';
            });
        }
        
        if (cancelLogout) {
            cancelLogout.addEventListener('click', () => {
                logoutModal.style.display = 'none';
            });
        }
        
        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) {
                logoutModal.style.display = 'none';
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && logoutModal.style.display === 'flex') {
                logoutModal.style.display = 'none';
            }
        });
    }
    
    let currentView = 'welcome';
    const views = document.querySelectorAll('.view');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const quizCardContainer = document.getElementById('quiz-card-container');
    const quizMenu = document.getElementById('quiz-menu');
    const quizInterface = document.getElementById('quiz-interface');

    function init() {
        ModulTheme.init();
        ModulMateri.init();
        ModulLab.init();
        ModulKuis.mulai();
        
        navLinks.forEach(link => link.addEventListener('click', handleNavClick));
        quizCardContainer.addEventListener('click', handleQuizCardClick);
        quizInterface.addEventListener('click', handleQuizInterfaceClick);

        navigateTo('welcome');
    }

    function navigateTo(viewId) {
        currentView = viewId;
        views.forEach(view => view.hidden = (view.id !== `${viewId}-view`));
        navLinks.forEach(link => link.classList.toggle('active', link.dataset.view === viewId));
        
        if (viewId === 'materi') ModulMateri.render(ModulMateri.selectElement.value);
        if (viewId === 'lab') ModulLab.setup(ModulLab.selectElement.value);
        if (viewId === 'kuis') {
            quizMenu.hidden = false;
            quizInterface.hidden = true;
        }
    }

    function handleNavClick(e) {
        e.preventDefault();
        navigateTo(this.dataset.view);
    }
    
    function handleQuizCardClick(e) {
        if (e.target.classList.contains('start-quiz-btn')) {
            ModulKuis.mulaiKuis(e.target.dataset.topic);
        }
    }

    function handleQuizInterfaceClick(e) {
        if (e.target.matches('.nav-box')) {
            ModulKuis.pindahSoal(parseInt(e.target.dataset.index));
        }
        if (e.target.matches('input[name="option"]')) {
            ModulKuis.simpanJawaban(e.target.value);
        }
        if (e.target.matches('#quiz-submit-btn')) {
            ModulKuis.cekJawaban();
        }
    }

    init();
});