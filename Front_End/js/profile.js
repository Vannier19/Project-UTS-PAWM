const ModulProfile = {
    init() {
        this.loadProfileData();
        this.setupEventListeners();
        this.setupHistoryTabs();
    },

    setupEventListeners() {
        const toggleBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('profile-password');
        const updateBtn = document.getElementById('update-profile-btn');
        const profileBtn = document.getElementById('profile-btn');

        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const icon = toggleBtn.querySelector('i');
                const isHidden = passwordInput.type === 'password';
                
                passwordInput.type = isHidden ? 'text' : 'password';
                icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
            });
        }

        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.updateProfile());
        }

        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadProfileData();
                document.querySelector('[data-view="profile"]')?.click();
            });
        }
    },

    setupHistoryTabs() {
        const tabs = document.querySelectorAll('.history-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabName = tab.dataset.tab;
                document.querySelectorAll('.history-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-history`).classList.add('active');
            });
        });
    },

    async loadProfileData() {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        
        if (!username) {
            console.error('Username not found in localStorage');
            return;
        }

        document.getElementById('profile-username-display').textContent = username;
        document.getElementById('profile-username').value = username;
        
        // clear form fields
        document.getElementById('new-nickname').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';

        try {
            const response = await fetch(`${API_URL}/get-user-data`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                const data = await response.json();
                if (data.expired || data.invalid) {
                    alert('Session expired. Please login again.');
                    localStorage.clear();
                    window.location.href = 'login.html';
                    return;
                }
            }

            if (response.ok) {
                document.getElementById('profile-password').value = '••••••••';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('profile-password').value = '••••••••';
        }

        this.loadQuizHistory();
        this.loadLabHistory();
    },

    async loadQuizHistory() {
        const token = localStorage.getItem('token');
        const historyList = document.getElementById('quiz-history-list');

        try {
            const response = await fetch(`${API_URL}/progress-kuis`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                const data = await response.json();
                if (data.expired || data.invalid) {
                    localStorage.clear();
                    window.location.href = 'login.html';
                    return;
                }
            }

            if (response.ok) {
                const { progressKuis = {} } = await response.json();
                
                const topics = {
                    glb: 'Uniform Linear Motion (GLB)',
                    glbb: 'Uniformly Accelerated Motion (GLBB)',
                    vertikal: 'Vertical Motion',
                    parabola: 'Projectile Motion'
                };

                const completed = Object.entries(progressKuis)
                    .filter(([_, p]) => p.selesai)
                    .sort((a, b) => new Date(b[1].terakhirDikerjakan || 0) - new Date(a[1].terakhirDikerjakan || 0));

                historyList.innerHTML = completed.length === 0 
                    ? '<div class="no-history"><i class="fas fa-inbox"></i><p>No quiz completed yet</p></div>'
                    : completed.map(([topic, prog]) => `
                        <div class="history-item">
                            <div class="history-item-info">
                                <div class="history-item-title">${topics[topic] || topic}</div>
                                <div class="history-item-date">${new Date(prog.terakhirDikerjakan).toLocaleString()}</div>
                            </div>
                            <div class="history-item-badge badge-score">Score: ${prog.skor}/10</div>
                        </div>
                    `).join('');
            }
        } catch (error) {
            console.error('Error loading quiz history:', error);
        }
    },

    async loadLabHistory() {
        const token = localStorage.getItem('token');
        const historyList = document.getElementById('lab-history-list');

        try {
            const response = await fetch(`${API_URL}/progress-lab`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                const data = await response.json();
                if (data.expired || data.invalid) {
                    localStorage.clear();
                    window.location.href = 'login.html';
                    return;
                }
            }

            if (response.ok) {
                const { progressLab = {} } = await response.json();
                
                const topics = {
                    glb: 'GLB Simulation',
                    glbb: 'GLBB Simulation',
                    vertikal: 'Vertical Motion Simulation',
                    parabola: 'Projectile Motion Simulation'
                };

                const activities = Object.entries(progressLab)
                    .sort((a, b) => new Date(b[1].terakhirDiakses || 0) - new Date(a[1].terakhirDiakses || 0));

                historyList.innerHTML = activities.length === 0
                    ? '<div class="no-history"><i class="fas fa-inbox"></i><p>No lab simulation done yet</p></div>'
                    : activities.map(([topic, prog]) => `
                        <div class="history-item">
                            <div class="history-item-info">
                                <div class="history-item-title">${topics[topic] || topic}</div>
                                <div class="history-item-date">${new Date(prog.terakhirDiakses).toLocaleString()}</div>
                            </div>
                            <div class="history-item-badge badge-completed">
                                <i class="fas fa-check"></i> Completed
                            </div>
                        </div>
                    `).join('');
            }
        } catch (error) {
            console.error('Error loading lab history:', error);
        }
    },

    showMessage(msg, type) {
        const msgEl = document.getElementById('profile-message');
        msgEl.textContent = msg;
        msgEl.className = `profile-message ${type}`;
        msgEl.style.display = 'block';
        setTimeout(() => msgEl.style.display = 'none', 5000);
    },

    async updateProfile() {
        const newNickname = document.getElementById('new-nickname').value.trim();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const token = localStorage.getItem('token');

        if (!newNickname && !newPassword) {
            this.showMessage('Please enter new nickname or password', 'error');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (newPassword && newPassword.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        const updateData = {};
        if (newNickname) updateData.newUsername = newNickname;
        if (newPassword) updateData.newPassword = newPassword;

        try {
            const response = await fetch(`${API_URL}/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                if (newNickname) {
                    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                    userData.username = newNickname;
                    localStorage.setItem('username', newNickname);
                    localStorage.setItem('userData', JSON.stringify(userData));
                    
                    if (data.token) localStorage.setItem('token', data.token);
                }
                if (newPassword) userData.password = newPassword;
                localStorage.setItem('userData', JSON.stringify(userData));

                if (newNickname) {
                    document.getElementById('username-display').textContent = newNickname;
                }

                this.showMessage('Profile updated successfully!', 'success');
                this.loadProfileData();
            } else {
                this.showMessage(data.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showMessage('Cannot connect to server', 'error');
        }
    }
};
