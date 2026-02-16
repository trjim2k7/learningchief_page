/**
 * LearningChief - Interactive Mode
 * On-device worksheet completion with real-time feedback
 */

const InteractiveMode = {
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    isActive: false,

    start(worksheets) {
        this.questions = worksheets.flatMap(w => w.questions.map(q => ({
            ...q,
            subject: w.subject,
            year: w.year
        })));
        this.currentIndex = 0;
        this.score = 0;
        this.answers = new Array(this.questions.length).fill(null);
        this.isActive = true;

        document.getElementById('worksheetSection').style.display = 'none';
        document.getElementById('interactivePanel').style.display = 'block';
        document.getElementById('completionScreen').style.display = 'none';

        this.updateProgress();
        this.renderQuestions();

        // Reset scratchpad for new worksheet
        if (typeof Scratchpad !== 'undefined') {
            Scratchpad.reset();
        }

        // Start timer with recommended duration
        if (typeof WorksheetTimer !== 'undefined' && this.questions.length > 0) {
            const q = this.questions[0];
            WorksheetTimer.start(q.subject || 'math', q.year || 3, this.questions.length);
        }
    },

    exit() {
        this.isActive = false;
        document.getElementById('interactivePanel').style.display = 'none';
        document.getElementById('worksheetSection').style.display = 'block';

        // Stop timer
        if (typeof WorksheetTimer !== 'undefined') {
            WorksheetTimer.stop();
        }
    },

    renderQuestions() {
        const container = document.getElementById('interactiveContent');
        container.innerHTML = this.questions.map((q, i) => this.createInteractiveQuestion(q, i)).join('');
        this.scrollToQuestion(0);
    },

    createInteractiveQuestion(question, index) {
        const statusClass = this.answers[index] !== null
            ? (this.answers[index].correct ? 'correct' : 'incorrect')
            : (index === this.currentIndex ? 'current' : '');

        return `
            <div class="interactive-question ${statusClass}" id="question-${index}">
                <div class="question-number">${index + 1}</div>
                <div class="question-content">
                    <div class="question-text">${question.question.replace(/\n/g, '<br>')}</div>
                    ${this.createInteractiveInput(question, index)}
                    ${this.answers[index] !== null ? this.createFeedback(question, index) : ''}
                </div>
            </div>
        `;
    },

    createInteractiveInput(question, index) {
        if (this.answers[index] !== null) {
            return `<div class="user-answer">Your answer: <strong>${this.answers[index].userAnswer}</strong></div>`;
        }

        if (question.choices) {
            return `
                <div class="multiple-choice interactive">
                    ${question.choices.map((choice, i) => `
                        <div class="choice-option" onclick="InteractiveMode.submitChoice(${index}, '${choice.replace(/'/g, "\\'")}')">
                            <span class="choice-letter">${String.fromCharCode(65 + i)}</span>
                            <span class="choice-text">${choice}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `
            <input type="text" class="interactive-input" id="input-${index}" 
                placeholder="Type your answer here..." 
                onkeypress="if(event.key==='Enter')InteractiveMode.submitAnswer(${index})">
            <div class="interactive-input-actions">
                <button class="submit-answer-btn" onclick="InteractiveMode.submitAnswer(${index})">
                    Submit Answer ✓
                </button>
                <button class="scratchpad-btn" data-question-index="${index}" data-question-text="${this.escapeAttr(question.question)}" onclick="Scratchpad.open(parseInt(this.dataset.questionIndex), this.dataset.questionText)">
                    <span class="sp-btn-icon">📝</span> Scratchpad
                </button>
            </div>
        `;
    },

    escapeAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, ' ');
    },

    createFeedback(question, index) {
        const answer = this.answers[index];
        if (answer.correct) {
            return `
                <div class="feedback-message correct">
                    <span class="feedback-icon">✓</span>
                    <span>Correct! Well done! 🌟</span>
                </div>
            `;
        } else {
            return `
                <div class="feedback-message incorrect">
                    <span class="feedback-icon">✗</span>
                    <span>Not quite. The answer is: <strong>${question.answer}</strong></span>
                </div>
            `;
        }
    },

    submitAnswer(index) {
        const input = document.getElementById(`input-${index}`);
        if (!input) return;

        const userAnswer = input.value.trim();
        if (!userAnswer) return;

        this.checkAnswer(index, userAnswer);
    },

    submitChoice(index, choice) {
        this.checkAnswer(index, choice);
    },

    checkAnswer(index, userAnswer) {
        const question = this.questions[index];
        const correctAnswer = String(question.answer).toLowerCase().trim();
        const userAnswerLower = String(userAnswer).toLowerCase().trim();

        // Flexible matching
        const isCorrect = correctAnswer === userAnswerLower ||
            correctAnswer.replace(/[^a-z0-9]/g, '') === userAnswerLower.replace(/[^a-z0-9]/g, '') ||
            (question.inputType === 'number' && parseFloat(correctAnswer) === parseFloat(userAnswerLower));

        this.answers[index] = { userAnswer, correct: isCorrect };

        if (isCorrect) {
            this.score++;
            this.celebrateCorrect();
        }

        this.updateProgress();

        // Update only the current question (not all questions) to prevent scroll jump
        const questionEl = document.getElementById(`question-${index}`);
        if (questionEl) {
            questionEl.outerHTML = this.createInteractiveQuestion(question, index);
        }

        // Move to next unanswered question
        const nextUnanswered = this.answers.findIndex((a, i) => a === null && i > index);
        if (nextUnanswered !== -1) {
            this.currentIndex = nextUnanswered;

            // Mark the next question as current
            const nextEl = document.getElementById(`question-${nextUnanswered}`);
            if (nextEl) {
                nextEl.classList.add('current');
            }

            // Smooth scroll to next question after a brief delay for the update to render
            setTimeout(() => {
                this.scrollToQuestion(nextUnanswered);
                // Focus the input if it exists
                const nextInput = document.getElementById(`input-${nextUnanswered}`);
                if (nextInput) {
                    nextInput.focus();
                }
            }, 150);
        } else if (this.answers.every(a => a !== null)) {
            this.showCompletion();
        }
    },

    celebrateCorrect() {
        const scoreEl = document.getElementById('scoreValue');
        scoreEl.style.transform = 'scale(1.3)';
        setTimeout(() => scoreEl.style.transform = 'scale(1)', 200);
    },

    updateProgress() {
        const answered = this.answers.filter(a => a !== null).length;
        const total = this.questions.length;
        const percent = (answered / total) * 100;

        document.getElementById('progressFill').style.width = `${percent}%`;
        document.getElementById('progressText').textContent = `${answered} / ${total}`;
        document.getElementById('scoreValue').textContent = this.score;
    },

    scrollToQuestion(index) {
        const el = document.getElementById(`question-${index}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    showCompletion() {
        const total = this.questions.length;
        const percent = Math.round((this.score / total) * 100);

        let message, stars;
        if (percent >= 90) {
            message = "Outstanding! You're a superstar! 🌟";
            stars = '⭐⭐⭐';
        } else if (percent >= 70) {
            message = "Great job! Keep up the good work!";
            stars = '⭐⭐';
        } else if (percent >= 50) {
            message = "Good effort! Practice makes perfect!";
            stars = '⭐';
        } else {
            message = "Keep trying! You'll get better!";
            stars = '💪';
        }

        document.getElementById('completionMessage').textContent = message;
        document.getElementById('completionScore').innerHTML = `${this.score}/${total} ${stars}`;
        document.getElementById('completionScreen').style.display = 'flex';

        // Save to ProgressStore
        this.saveToProgress();

        // Stop timer
        if (typeof WorksheetTimer !== 'undefined') {
            WorksheetTimer.stop();
        }
    },

    saveToProgress() {
        if (typeof ProgressStore === 'undefined') return;

        try {
            // Use the subject from App config (what user selected)
            // This is reliable because it's set when generating the worksheet
            const subject = (typeof App !== 'undefined' && App.config?.subject) || 'math';

            // Collect weak topics from incorrect answers
            const weakTopics = this.questions
                .filter((q, i) => !this.answers[i]?.correct)
                .map(q => q.type || 'general')
                .filter((v, i, a) => a.indexOf(v) === i); // unique

            ProgressStore.saveSession({
                type: 'interactive',
                subject: subject,
                yearGroup: typeof App !== 'undefined' ? App.config.year : 3,
                score: this.score,
                total: this.questions.length,
                topics: [...new Set(this.questions.map(q => q.type || 'general'))],
                weakTopics: weakTopics
            });

            // Process gamification rewards
            if (typeof Gamification !== 'undefined') {
                const rewards = Gamification.processSession(this.score, this.questions.length);

                // Celebrate rewards (XP animation, level-up, achievements)
                if (typeof GamificationUI !== 'undefined' && rewards) {
                    GamificationUI.celebrateRewards(rewards);

                    // Extra confetti for perfect score
                    if (this.score === this.questions.length) {
                        setTimeout(() => GamificationUI.celebratePerfectScore(), 500);
                    }
                }
            }

            // Refresh dashboard if visible
            if (typeof ProgressDashboard !== 'undefined') {
                ProgressDashboard.refresh();
            }
        } catch (e) {
            console.error('Failed to save interactive progress:', e);
        }
    },

    retry() {
        this.currentIndex = 0;
        this.score = 0;
        this.answers = new Array(this.questions.length).fill(null);
        document.getElementById('completionScreen').style.display = 'none';
        this.updateProgress();
        this.renderQuestions();

        // Reset scratchpad
        if (typeof Scratchpad !== 'undefined') {
            Scratchpad.reset();
        }

        // Restart timer
        if (typeof WorksheetTimer !== 'undefined' && this.questions.length > 0) {
            const q = this.questions[0];
            WorksheetTimer.start(q.subject || 'math', q.year || 3, this.questions.length);
        }
    }
};

window.InteractiveMode = InteractiveMode;
