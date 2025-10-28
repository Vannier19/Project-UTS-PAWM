const ModulProfile = {
    init() {
        this.loadProfileData();
        this.setupEventListeners();
        this.setupHistoryTabs();
    },

    setupEventListeners() {
        const togglePasswordBtn = document.getElementById('toggle-password');
        const profilePasswordInput = document.getElementById('profile-password');
        const updateProfileBtn = document.getElementById('update-profile-btn');
        const profileBtn = document.getElementById('profile-btn');

        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', () => {
                const icon = togglePasswordBtn.querySelector('i');
                if (profilePasswordInput.type === 'password') {
                    profilePasswordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    profilePasswordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }

        if (updateProfileBtn) {
            updateProfileBtn.addEventListener('click', () => this.updateProfile());
        }

        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadProfileData();
                const profileLink = document.querySelector('[data-view="profile"]');
                if (profileLink) {
                    profileLink.click();
                }
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
        
        document.getElementById('new-nickname').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';

        try {
            const response = await fetch('https://project-uts-pawm-production.up.railway.app/get-user-data', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.password) {
                    document.getElementById('profile-password').value = '••••••••';
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            document.getElementById('profile-password').value = '••••••••';
        }

        await this.loadQuizHistory();
        await this.loadLabHistory();
    },

    async loadQuizHistory() {
        const token = localStorage.getItem('token');
        const historyList = document.getElementById('quiz-history-list');

        try {
            const response = await fetch('https://project-uts-pawm-production.up.railway.app/progress-kuis', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const progressKuis = data.progressKuis || {};
                
                const topicNames = {
                    glb: 'Uniform Linear Motion (GLB)',
                    glbb: 'Uniformly Accelerated Motion (GLBB)',
                    vertikal: 'Vertical Motion',
                    parabola: 'Projectile Motion'
                };

                const completedQuizzes = Object.entries(progressKuis)
                    .filter(([_, prog]) => prog.selesai)
                    .sort((a, b) => {
                        const dateA = a[1].terakhirDikerjakan ? new Date(a[1].terakhirDikerjakan) : new Date(0);
                        const dateB = b[1].terakhirDikerjakan ? new Date(b[1].terakhirDikerjakan) : new Date(0);
                        return dateB - dateA;
                    });

                if (completedQuizzes.length === 0) {
                    historyList.innerHTML = `
                        <div class="no-history">
                            <i class="fas fa-inbox"></i>
                            <p>No quiz completed yet</p>
                        </div>
                    `;
                } else {
                    historyList.innerHTML = completedQuizzes.map(([topic, prog]) => `
                        <div class="history-item">
                            <div class="history-item-info">
                                <div class="history-item-title">${topicNames[topic] || topic}</div>
                                <div class="history-item-date">
                                    ${prog.terakhirDikerjakan ? new Date(prog.terakhirDikerjakan).toLocaleString() : 'Unknown date'}
                                </div>
                            </div>
                            <div class="history-item-badge badge-score">
                                Score: ${prog.skor}/10
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading quiz history:', error);
        }
    },

    async loadLabHistory() {
        const token = localStorage.getItem('token');
        const historyList = document.getElementById('lab-history-list');

        try {
            const response = await fetch('https://project-uts-pawm-production.up.railway.app/progress-lab', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const progressLab = data.progressLab || {};
                
                const topicNames = {
                    glb: 'GLB Simulation',
                    glbb: 'GLBB Simulation',
                    vertikal: 'Vertical Motion Simulation',
                    parabola: 'Projectile Motion Simulation'
                };

                const labActivities = Object.entries(progressLab)
                    .sort((a, b) => {
                        const dateA = a[1].terakhirDiakses ? new Date(a[1].terakhirDiakses) : new Date(0);
                        const dateB = b[1].terakhirDiakses ? new Date(b[1].terakhirDiakses) : new Date(0);
                        return dateB - dateA;
                    });

                if (labActivities.length === 0) {
                    historyList.innerHTML = `
                        <div class="no-history">
                            <i class="fas fa-inbox"></i>
                            <p>No lab simulation done yet</p>
                        </div>
                    `;
                } else {
                    historyList.innerHTML = labActivities.map(([topic, prog]) => `
                        <div class="history-item">
                            <div class="history-item-info">
                                <div class="history-item-title">${topicNames[topic] || topic}</div>
                                <div class="history-item-date">
                                    ${prog.terakhirDiakses ? new Date(prog.terakhirDiakses).toLocaleString() : 'Unknown date'}
                                </div>
                            </div>
                            <div class="history-item-badge badge-completed">
                                <i class="fas fa-check"></i> Completed
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading lab history:', error);
        }
    },

    showMessage(message, type) {
        const messageEl = document.getElementById('profile-message');
        messageEl.textContent = message;
        messageEl.className = `profile-message ${type}`;
        messageEl.style.display = 'block';

        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    },

    async updateProfile() {
        const newNickname = document.getElementById('new-nickname').value.trim();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const token = localStorage.getItem('token');

        if (!newNickname && !newPassword) {
            this.showMessage('Please enter new nickname or new password', 'error');
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
            const response = await fetch('https://project-uts-pawm-production.up.railway.app/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                if (newNickname) {
                    userData.username = newNickname;
                    localStorage.setItem('username', newNickname);
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
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
