/**
 * LearningChief - Worksheet Timer
 * Countdown timer with recommended durations per year/subject
 */

const WorksheetTimer = {
    // State
    totalSeconds: 0,
    remainingSeconds: 0,
    intervalId: null,
    isRunning: false,
    isPaused: false,
    isTimeUp: false,

    // Duration lookup: seconds per question
    // Format: { year: { subject: secondsPerQuestion } }
    durations: {
        1: { math: 90, english: 75 },
        2: { math: 90, english: 75 },
        3: { math: 75, english: 60 },
        4: { math: 75, english: 60 },
        5: { math: 60, english: 45 },
        6: { math: 60, english: 45 }
    },

    // ===========================================
    // Lifecycle
    // ===========================================

    start(subject, year, questionCount) {
        this.stop(); // Clear any existing timer

        // Calculate recommended duration
        const yearDurations = this.durations[year] || this.durations[3];
        const perQuestion = yearDurations[subject] || 75;
        this.totalSeconds = perQuestion * questionCount;
        this.remainingSeconds = this.totalSeconds;
        this.isTimeUp = false;
        this.isPaused = false;
        this.isRunning = true;

        // Show timer UI
        this.showTimer();
        this.updateDisplay();
        this.updateRecommendedLabel(perQuestion, questionCount);

        // Start countdown
        this.intervalId = setInterval(() => this.tick(), 1000);
    },

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.hideTimer();
    },

    pause() {
        if (!this.isRunning || this.isPaused) return;
        this.isPaused = true;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.updatePauseButton();
    },

    resume() {
        if (!this.isRunning || !this.isPaused) return;
        this.isPaused = false;
        this.intervalId = setInterval(() => this.tick(), 1000);
        this.updatePauseButton();
    },

    reset() {
        this.remainingSeconds = this.totalSeconds;
        this.isTimeUp = false;
        this.updateDisplay();

        // Remove time-up state
        document.getElementById('timerDisplay')?.classList.remove('time-up');

        // Restart if was running
        if (this.isRunning && !this.isPaused) {
            clearInterval(this.intervalId);
            this.intervalId = setInterval(() => this.tick(), 1000);
        }
    },

    // ===========================================
    // Timer Logic
    // ===========================================

    tick() {
        if (this.remainingSeconds <= 0) {
            this.onTimeUp();
            return;
        }

        this.remainingSeconds--;
        this.updateDisplay();
    },

    onTimeUp() {
        this.isTimeUp = true;
        clearInterval(this.intervalId);
        this.intervalId = null;

        // Visual notification
        const display = document.getElementById('timerDisplay');
        if (display) {
            display.classList.add('time-up');
        }

        // Show gentle notification banner
        this.showTimeUpBanner();
    },

    // ===========================================
    // UI
    // ===========================================

    showTimer() {
        const container = document.getElementById('timerContainer');
        if (container) container.style.display = 'flex';
    },

    hideTimer() {
        const container = document.getElementById('timerContainer');
        if (container) container.style.display = 'none';
    },

    updateDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const display = document.getElementById('timerTime');
        if (display) display.textContent = timeStr;

        // Update urgency state
        const container = document.getElementById('timerDisplay');
        if (container) {
            const percentRemaining = (this.remainingSeconds / this.totalSeconds) * 100;

            container.classList.remove('timer-green', 'timer-amber', 'timer-red');

            if (percentRemaining > 50) {
                container.classList.add('timer-green');
            } else if (percentRemaining > 20) {
                container.classList.add('timer-amber');
            } else {
                container.classList.add('timer-red');
            }
        }

        // Update progress ring
        this.updateProgressRing();
    },

    updateProgressRing() {
        const ring = document.getElementById('timerRing');
        if (!ring) return;

        const circumference = 2 * Math.PI * 18; // radius = 18
        const progress = this.remainingSeconds / this.totalSeconds;
        const offset = circumference * (1 - progress);
        ring.style.strokeDashoffset = offset;
    },

    updatePauseButton() {
        const btn = document.getElementById('timerPauseBtn');
        if (btn) {
            btn.textContent = this.isPaused ? '▶️' : '⏸️';
            btn.title = this.isPaused ? 'Resume' : 'Pause';
        }
    },

    updateRecommendedLabel(perQuestion, count) {
        const label = document.getElementById('timerRecommended');
        if (label) {
            const totalMin = Math.ceil((perQuestion * count) / 60);
            label.textContent = `Recommended: ${totalMin} min`;
        }
    },

    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    },

    showTimeUpBanner() {
        const existing = document.querySelector('.timer-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.className = 'timer-banner';
        banner.innerHTML = `
            <span class="timer-banner-icon">⏰</span>
            <span class="timer-banner-text">Time's up! Take your time to finish — no rush.</span>
            <button class="timer-banner-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Insert at top of interactive content
        const interactiveHeader = document.querySelector('.interactive-header');
        if (interactiveHeader) {
            interactiveHeader.after(banner);
        }

        // Auto dismiss after 8 seconds
        setTimeout(() => {
            if (banner.parentNode) {
                banner.classList.add('fade-out');
                setTimeout(() => banner.remove(), 300);
            }
        }, 8000);
    }
};

window.WorksheetTimer = WorksheetTimer;
