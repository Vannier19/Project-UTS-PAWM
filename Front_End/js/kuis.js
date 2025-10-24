const API_URL = 'https://project-uts-pawm-production.up.railway.app';

const ModulKuis = {
    topikSekarang: 'glb',
    indexSoal: 0,
    jawabanUser: [],
    progress: {},
    
    mulai() {
        this.muatProgress();
    },

    async muatProgress() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_URL}/progress-kuis`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.progress = data.progressKuis || {};
                this.perbaruiTampilanMenu();
            }
        } catch (error) {
            console.error('Gagal memuat progress:', error);
        }
    },

    async simpanProgress(topik, skor, jawaban, selesai) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await fetch(`${API_URL}/progress-kuis`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topik: topik,
                    skor: skor,
                    jawaban: jawaban,
                    selesai: selesai
                })
            });

            await this.muatProgress();
        } catch (error) {
            console.error('Gagal menyimpan progress:', error);
        }
    },

    perbaruiTampilanMenu() {
        const container = document.getElementById('quiz-card-container');
        if (!container) return;

        const topikList = Object.keys(quizData);
        let html = '';

        topikList.forEach(topik => {
            const prog = this.progress[topik];
            const sudahSelesai = prog?.selesai || false;
            const skor = prog?.skor || 0;
            const total = quizData[topik].length;
            const warna = Math.floor(Math.random()*16777215).toString(16);

            html += `
                <div class="quiz-card ${sudahSelesai ? 'sudah-selesai' : ''}" style="border-left-color: #${warna}">
                    <div class="quiz-card-header">
                        <h4>Quiz: ${topik.toUpperCase()}</h4>
                        ${sudahSelesai ? '<span class="badge-selesai">✓ Completed</span>' : ''}
                    </div>
                    <p>Test your understanding of ${topik} material.</p>
                    ${sudahSelesai ? `
                        <div class="info-skor">
                            <strong>Score:</strong> ${skor}/${total} (${Math.round(skor/total*100)}%)
                        </div>
                    ` : ''}
                    <button class="start-quiz-btn" data-topic="${topik}">
                        ${sudahSelesai ? 'Retake Quiz' : 'Start Quiz'}
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    mulaiKuis(topik) {
        this.topikSekarang = topik;
        this.indexSoal = 0;
        this.jawabanUser = new Array(quizData[topik].length).fill(null);
        
        document.getElementById('quiz-menu').hidden = true;
        document.getElementById('quiz-interface').hidden = false;
        document.getElementById('quiz-title').textContent = `Quiz: ${topik.toUpperCase()}`;
        
        this.tampilkanSoal();
    },

    tampilkanSoal() {
        const soalList = quizData[this.topikSekarang];
        const soal = soalList[this.indexSoal];
        
        let opsiHTML = '';
        soal.options.forEach((opsi, i) => {
            const checked = this.jawabanUser[this.indexSoal] === opsi ? 'checked' : '';
            opsiHTML += `
                <div>
                    <input type="radio" name="option" id="opt${i}" value="${opsi}" ${checked}>
                    <label for="opt${i}">${opsi}</label>
                </div>
            `;
        });

        document.getElementById('question-display').innerHTML = `
            <div class="question-block">
                <h4>QUESTION NO ${this.indexSoal + 1}</h4>
                <p>${soal.question}</p>
                <div class="options-list">
                    ${opsiHTML}
                </div>
            </div>
        `;

        let navHTML = '';
        soalList.forEach((_, i) => {
            const statusClass = i === this.indexSoal ? 'aktif' : '';
            const terjawab = this.jawabanUser[i] ? 'terjawab' : '';
            navHTML += `<div class="nav-box ${statusClass} ${terjawab}" data-index="${i}">${i + 1}</div>`;
        });

        document.getElementById('nav-grid').innerHTML = navHTML;
        document.getElementById('quiz-results').innerHTML = '';
    },

    pindahSoal(index) {
        this.indexSoal = index;
        this.tampilkanSoal();
    },

    simpanJawaban(jawaban) {
        this.jawabanUser[this.indexSoal] = jawaban;
        const navBox = document.querySelector(`[data-index="${this.indexSoal}"]`);
        if (navBox) navBox.classList.add('terjawab');
    },

    async cekJawaban() {
        let benar = 0;
        const soalList = quizData[this.topikSekarang];
        
        this.jawabanUser.forEach((jawaban, i) => {
            if (jawaban === soalList[i].answer) benar++;
        });
        
        const total = soalList.length;
        const persen = Math.round((benar / total) * 100);
        
        const hasil = persen >= 70 ? 
            '<p class="pesan-hasil bagus">Great! You passed!</p>' : 
            '<p class="pesan-hasil kurang">Keep learning! You can try again.</p>';

        document.getElementById('quiz-results').innerHTML = `
            <div class="kotak-hasil">
                <h3>Quiz Completed!</h3>
                <p>Your Score: <strong>${benar}/${total}</strong> (${persen}%)</p>
                ${hasil}
            </div>
        `;

        await this.simpanProgress(this.topikSekarang, benar, this.jawabanUser, true);
    }
};
