const ModulLab = {
    canvas: null,
    ctx: null,
    selectElement: null,
    titleElement: null,
    startBtn: null,
    pauseBtn: null,
    resetBtn: null,
    analysisPanel: null,
    verticalInfo: null,
    
    state: {
        running: false,
        paused: false,
        dragging: false,
        initialDistance: 0
    },
    
    sim: {
        time: 0,
        posX: 20,
        posY: 0,
        velX: 0,
        velY: 0,
        accel: 0,
        gravity: 9.8,
        trajectory: [],
        objectWidth: 30,
        objectHeight: 30,
        dragOffset: null
    },
    
    images: {
        car: new Image(),
        rock: new Image(),
        parabola: new Image()
    },
    
    animationId: null,
    lastMousePos: { x: 0, y: 0 },
    topics: [],
    
    init() {
        this.canvas = document.getElementById('physics-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.selectElement = document.getElementById('lab-select');
        this.titleElement = document.getElementById('lab-title');
        this.startBtn = document.getElementById('lab-start');
        this.pauseBtn = document.getElementById('lab-pause');
        this.resetBtn = document.getElementById('lab-reset');
        this.analysisPanel = document.getElementById('analysis-panel');
        this.verticalInfo = document.getElementById('vertical-info');
        
        this.canvas.width = 600;
        this.canvas.height = 300;
        
        this.images.car.src = 'assets/car.png';
        this.images.rock.src = 'assets/rock.png';
        this.images.parabola.src = 'assets/parabola.png';
        
        this.processedImages = {};
        Object.keys(this.images).forEach(key => {
            this.images[key].onload = () => {
                this.processedImages[key] = this.removeWhiteBackground(this.images[key]);
            };
        });
        
        this.topics = Object.keys(quizData);
        this.populateSelect();
        this.attachEvents();
    },
    
    removeWhiteBackground(img) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        
        tempCtx.drawImage(img, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0;
            }
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        return tempCanvas;
    },
    
    populateSelect() {
        if (!this.selectElement) return;
        const optionsHTML = this.topics.map(topic => 
            `<option value="${topic}">${topic.toUpperCase()}</option>`
        ).join('');
        this.selectElement.innerHTML = optionsHTML;
    },
    
    attachEvents() {
        if (this.selectElement) {
            this.selectElement.addEventListener('change', () => this.setup(this.selectElement.value));
        }
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.start());
        if (this.pauseBtn) this.pauseBtn.addEventListener('click', () => this.pause());
        if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.setup(this.selectElement.value));
        
        const controls = document.querySelector('.controls');
        if (controls) {
            controls.addEventListener('input', (e) => {
                if (e.target.type === 'range') this.updateValues();
            });
        }
        
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
            this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
            this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
            this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        }
    },
    
    setup(topic) {
        if (!topic) return;
        
        if (this.titleElement) {
            this.titleElement.textContent = `Simulasi: ${topic.toUpperCase()}`;
        }
        cancelAnimationFrame(this.animationId);
        
        this.state.running = false;
        this.state.paused = false;
        this.updateButtons();
        
        document.querySelectorAll('.control-group').forEach(c => c.style.display = 'none');
        if (this.analysisPanel) this.analysisPanel.style.display = 'block';
        if (this.verticalInfo) {
            this.verticalInfo.style.display = topic === 'vertikal' ? 'block' : 'none';
        }
        
        switch (topic) {
            case 'glb':
                document.querySelector('[data-control="velocity"]').style.display = 'flex';
                break;
            case 'glbb':
                document.querySelector('[data-control="velocity"]').style.display = 'flex';
                document.querySelector('[data-control="acceleration"]').style.display = 'flex';
                break;
            case 'vertikal':
                document.querySelector('[data-control="velocity"]').style.display = 'flex';
                break;
            case 'parabola':
                document.querySelector('[data-control="velocity"]').style.display = 'flex';
                document.querySelector('[data-control="angle"]').style.display = 'flex';
                break;
        }
        
        this.updateValues();
        this.resetState();
        this.draw();
        this.updateAnalysis();
    },
    
    updateValues() {
        const vel = document.getElementById('velocity');
        const acc = document.getElementById('acceleration');
        const ang = document.getElementById('angle');
        
        if (vel) {
            const span = document.getElementById('velocity-value') || vel.nextElementSibling;
            if (span) span.textContent = vel.value + ' m/s';
        }
        
        if (acc) {
            const span = document.getElementById('acceleration-value') || acc.nextElementSibling;
            if (span) span.textContent = acc.value + ' m/s²';
        }
        
        if (ang) {
            const span = document.getElementById('angle-value') || ang.nextElementSibling;
            if (span) span.textContent = ang.value + '°';
        }
        
        this.resetState();
    },
    
    resetState() {
        cancelAnimationFrame(this.animationId);
        this.sim.time = 0;
        this.sim.trajectory = [];
        this.state.running = false;
        this.state.paused = false;
        this.updateButtons();
        
        let v0 = parseFloat(document.getElementById('velocity').value);
        let angleRad = parseFloat(document.getElementById('angle').value) * Math.PI / 180;
        this.sim.accel = parseFloat(document.getElementById('acceleration').value);
        
        const topic = this.selectElement ? this.selectElement.value : 'glb';
        
        switch (topic) {
            case 'glb':
            case 'glbb':
                this.sim.objectWidth = 60;
                this.sim.objectHeight = 30;
                this.sim.posX = 30;
                this.sim.posY = this.canvas.height - 25;
                this.sim.velX = v0;
                this.sim.velY = 0;
                break;
            case 'vertikal':
                this.sim.objectWidth = 30;
                this.sim.objectHeight = 30;
                this.sim.posX = this.canvas.width / 2;
                this.sim.posY = 50;
                this.sim.velX = 0;
                this.sim.velY = -v0;
                this.state.initialDistance = 0;
                break;
            case 'parabola':
                this.sim.objectWidth = 30;
                this.sim.objectHeight = 30;
                this.sim.posX = 30;
                this.sim.posY = this.canvas.height - 25;
                this.sim.velX = v0 * Math.cos(angleRad);
                this.sim.velY = -v0 * Math.sin(angleRad);
                break;
        }
        
        this.draw();
        this.updateAnalysis();
    },
    
    start() {
        const topic = this.selectElement ? this.selectElement.value : 'glb';
        
        if (this.state.paused) {
            this.state.paused = false;
            this.state.running = true;
        } else {
            if (topic !== 'vertikal') {
                this.resetState();
            } else {
                this.sim.time = 0;
                this.sim.trajectory = [];
                this.sim.velY = -parseFloat(document.getElementById('velocity').value);
                this.state.initialDistance = Math.sqrt(
                    Math.pow(this.sim.posX - this.canvas.width/2, 2) + 
                    Math.pow(this.sim.posY - 50, 2)
                );
            }
            
            this.state.running = true;
            this.state.paused = false;
        }
        
        this.updateButtons();
        cancelAnimationFrame(this.animationId);
        this.animate();
    },
    
    pause() {
        this.state.paused = true;
        this.state.running = false;
        this.updateButtons();
        cancelAnimationFrame(this.animationId);
        this.updateAnalysis();
    },
    
    updateButtons() {
        if (!this.startBtn || !this.pauseBtn) return;
        
        if (this.state.running && !this.state.paused) {
            this.startBtn.style.display = 'none';
            this.pauseBtn.style.display = 'flex';
        } else if (this.state.paused) {
            this.startBtn.style.display = 'flex';
            this.startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            this.pauseBtn.style.display = 'none';
        } else {
            this.startBtn.style.display = 'flex';
            this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            this.pauseBtn.style.display = 'none';
        }
    },
    
    update() {
        if (this.state.paused) return;
        
        const dt = 0.1;
        this.sim.time += dt;
        const topic = this.selectElement ? this.selectElement.value : 'glb';
        
        switch (topic) {
            case 'glb':
                this.sim.posX += this.sim.velX * dt;
                break;
            case 'glbb':
                this.sim.velX += this.sim.accel * dt;
                this.sim.posX += this.sim.velX * dt;
                break;
            case 'vertikal':
                this.sim.velY += this.sim.gravity * dt;
                this.sim.posY += this.sim.velY * dt;
                break;
            case 'parabola':
                this.sim.velY += this.sim.gravity * dt;
                this.sim.posX += this.sim.velX * dt;
                this.sim.posY += this.sim.velY * dt;
                this.sim.trajectory.push({ x: this.sim.posX, y: this.sim.posY });
                break;
        }
        
        this.updateAnalysis();
        
        if (this.sim.posY > this.canvas.height - 25 || 
            this.sim.posX > this.canvas.width + 20 || 
            this.sim.posX < -20) {
            this.state.running = false;
            this.state.paused = false;
            this.updateButtons();
            cancelAnimationFrame(this.animationId);
        }
    },
    
    animate() {
        if (!this.state.paused) {
            this.update();
            this.draw();
        }
        
        if (this.state.running && !this.state.paused) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    },
    
    updateAnalysis() {
        const pixelToMeter = 1/20;
        const posXMeter = (this.sim.posX - 30) * pixelToMeter;
        const posYMeter = (this.canvas.height - 25 - this.sim.posY) * pixelToMeter;
        const velTotal = Math.sqrt(this.sim.velX * this.sim.velX + this.sim.velY * this.sim.velY);
        
        let distance = 0;
        const topic = this.selectElement ? this.selectElement.value : 'glb';
        if (topic === 'vertikal') {
            distance = this.state.initialDistance * pixelToMeter;
        } else {
            distance = Math.sqrt(posXMeter * posXMeter + posYMeter * posYMeter);
        }
        
        const height = Math.max(0, posYMeter);
        
        const timeDisplay = document.getElementById('time-display');
        const posXDisplay = document.getElementById('posX-display');
        const posYDisplay = document.getElementById('posY-display');
        const velXDisplay = document.getElementById('velX-display');
        const velYDisplay = document.getElementById('velY-display');
        const velTotalDisplay = document.getElementById('velTotal-display');
        const distanceDisplay = document.getElementById('distance-display');
        const heightDisplay = document.getElementById('height-display');
        
        if (timeDisplay) timeDisplay.textContent = this.sim.time.toFixed(2) + ' s';
        if (posXDisplay) posXDisplay.textContent = posXMeter.toFixed(2) + ' m';
        if (posYDisplay) posYDisplay.textContent = posYMeter.toFixed(2) + ' m';
        if (velXDisplay) velXDisplay.textContent = this.sim.velX.toFixed(2) + ' m/s';
        if (velYDisplay) velYDisplay.textContent = this.sim.velY.toFixed(2) + ' m/s';
        if (velTotalDisplay) velTotalDisplay.textContent = velTotal.toFixed(2) + ' m/s';
        if (distanceDisplay) distanceDisplay.textContent = distance.toFixed(2) + ' m';
        if (heightDisplay) heightDisplay.textContent = height.toFixed(2) + ' m';
    },
    
    draw() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height - 10);
        
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.canvas.height - 10, this.canvas.width, 10);
        
        const topic = this.selectElement ? this.selectElement.value : 'glb';
        
        if (topic === 'vertikal' && !this.state.running) {
            this.ctx.strokeStyle = '#ddd';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2, 0);
            this.ctx.lineTo(this.canvas.width / 2, this.canvas.height - 10);
            this.ctx.stroke();
            
            for (let y = 50; y < this.canvas.height - 10; y += 50) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
            this.ctx.setLineDash([]);
        }
        
        if (topic === 'parabola' && this.sim.trajectory.length > 1) {
            this.ctx.strokeStyle = '#FF6B6B';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.sim.trajectory[0].x, this.sim.trajectory[0].y);
            for (let i = 1; i < this.sim.trajectory.length; i++) {
                this.ctx.lineTo(this.sim.trajectory[i].x, this.sim.trajectory[i].y);
            }
            this.ctx.stroke();
        }
        
        let img;
        switch (topic) {
            case 'glb':
            case 'glbb':
                img = this.images.car;
                break;
            case 'vertikal':
                img = this.images.rock;
                break;
            case 'parabola':
                img = this.images.parabola;
                break;
        }
        
        if (this.state.dragging && topic === 'vertikal') {
            this.ctx.strokeStyle = '#FF6B6B';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(
                this.sim.posX - this.sim.objectWidth / 2 - 2,
                this.sim.posY - this.sim.objectHeight - 2,
                this.sim.objectWidth + 4,
                this.sim.objectHeight + 4
            );
        }
        
        let imageToUse = img;
        const topicKey = topic === 'glb' || topic === 'glbb' ? 'car' : 
                        topic === 'vertikal' ? 'rock' : 'parabola';
        
        if (this.processedImages[topicKey]) {
            imageToUse = this.processedImages[topicKey];
        }
        
        if (imageToUse && (imageToUse.complete || imageToUse instanceof HTMLCanvasElement)) {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.imageSmoothingEnabled = true;
            
            this.ctx.drawImage(
                imageToUse,
                this.sim.posX - this.sim.objectWidth / 2,
                this.sim.posY - this.sim.objectHeight,
                this.sim.objectWidth,
                this.sim.objectHeight
            );
        } else {
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillRect(
                this.sim.posX - this.sim.objectWidth / 2,
                this.sim.posY - this.sim.objectHeight,
                this.sim.objectWidth,
                this.sim.objectHeight
            );
        }
        
        if (topic === 'vertikal' && !this.state.running) {
            this.canvas.style.cursor = this.isMouseOnObject(this.lastMousePos) ? 'grab' : 'default';
        } else {
            this.canvas.style.cursor = 'default';
        }
    },
    
    getMousePos(evt) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    },
    
    isMouseOnObject(pos) {
        return pos.x > this.sim.posX - this.sim.objectWidth / 2 &&
               pos.x < this.sim.posX + this.sim.objectWidth / 2 &&
               pos.y > this.sim.posY - this.sim.objectHeight &&
               pos.y < this.sim.posY;
    },
    
    onMouseDown(e) {
        const topic = this.selectElement ? this.selectElement.value : 'glb';
        if (topic !== 'vertikal' || this.state.running) return;
        
        const mousePos = this.getMousePos(e);
        this.lastMousePos = mousePos;
        
        if (this.isMouseOnObject(mousePos)) {
            this.state.dragging = true;
            this.canvas.style.cursor = 'grabbing';
            cancelAnimationFrame(this.animationId);
            
            this.sim.dragOffset = {
                x: mousePos.x - this.sim.posX,
                y: mousePos.y - this.sim.posY
            };
        }
    },
    
    onMouseMove(e) {
        const mousePos = this.getMousePos(e);
        this.lastMousePos = mousePos;
        
        const topic = this.selectElement ? this.selectElement.value : 'glb';
        if (topic === 'vertikal' && !this.state.running) {
            this.draw();
        }
        
        if (!this.state.dragging) return;
        
        const newX = mousePos.x - (this.sim.dragOffset ? this.sim.dragOffset.x : 0);
        const newY = mousePos.y - (this.sim.dragOffset ? this.sim.dragOffset.y : 0);
        
        this.sim.posX = Math.max(this.sim.objectWidth / 2,
                        Math.min(this.canvas.width - this.sim.objectWidth / 2, newX));
        this.sim.posY = Math.max(this.sim.objectHeight,
                        Math.min(this.canvas.height - 10, newY));
        
        this.draw();
        this.updateAnalysis();
    },
    
    onMouseUp(e) {
        if (this.state.dragging) {
            this.state.dragging = false;
            this.canvas.style.cursor = 'default';
            this.sim.dragOffset = null;
            
            const topic = this.selectElement ? this.selectElement.value : 'glb';
            if (topic === 'vertikal') {
                this.state.initialDistance = Math.sqrt(
                    Math.pow(this.sim.posX - this.canvas.width/2, 2) +
                    Math.pow(this.sim.posY - 50, 2)
                );
                this.updateAnalysis();
            }
        }
    }
};
