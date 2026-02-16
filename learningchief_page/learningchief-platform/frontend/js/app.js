/**
 * LearningChief - Main Application
 * Coordinates all worksheet generation and UI interactions
 */

// Global tab switching function
function switchMainTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.main-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Initialize dashboard when progress tab is selected
    if (tabName === 'progress' && typeof ProgressDashboard !== 'undefined') {
        ProgressDashboard.checkForProfile();
    }
}

const App = {
    config: {
        subject: 'math',
        year: 3,
        difficulty: 'normal',
        worksheetCount: 1,
        questionCount: 10,
        topic: '',
        revision: false
    },
    currentWorksheets: [],
    aiAvailable: false,

    init() {
        this.bindEvents();
        this.checkAIAvailability();

        // Initialize gamification XP bar
        if (typeof GamificationUI !== 'undefined') {
            GamificationUI.renderXPBar('xpBarContainer');
        }

        // Initialize settings (binds events + syncs saved year group)
        if (typeof Settings !== 'undefined') {
            Settings.init();
        }

        // Initialize profile indicator
        if (typeof ProgressDashboard !== 'undefined') {
            // This ensures profile is loaded and indicator updated on page load
            if (ProgressStore.currentProfileId) {
                ProgressDashboard.updateProfileIndicator();
            } else {
                ProgressDashboard.checkForProfile();
            }
        }

        console.log('🌟 LearningChief initialized');
    },

    bindEvents() {
        // Subject buttons
        document.querySelectorAll('.subject-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setSubject(btn.dataset.subject));
        });

        // Config inputs
        document.getElementById('yearSelect').addEventListener('change', (e) => {
            this.config.year = parseInt(e.target.value);
            this.checkTopicAvailability(); // Re-check when year changes
        });

        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.config.difficulty = e.target.value;
        });

        document.getElementById('questionCount').addEventListener('change', (e) => {
            this.config.questionCount = parseInt(e.target.value);
        });

        // Topic input with debounced availability check
        document.getElementById('topicInput').addEventListener('input', (e) => {
            this.config.topic = e.target.value.trim();
            this.debouncedCheckTopic();
        });

        document.getElementById('revisionToggle').addEventListener('change', (e) => {
            this.config.revision = e.target.checked;
        });

        // Worksheet count controls
        document.getElementById('worksheetCount').addEventListener('change', (e) => {
            this.config.worksheetCount = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
            e.target.value = this.config.worksheetCount;
        });

        document.getElementById('countMinus').addEventListener('click', () => {
            const input = document.getElementById('worksheetCount');
            const val = Math.max(1, parseInt(input.value) - 1);
            input.value = val;
            this.config.worksheetCount = val;
        });

        document.getElementById('countPlus').addEventListener('click', () => {
            const input = document.getElementById('worksheetCount');
            const val = Math.min(10, parseInt(input.value) + 1);
            input.value = val;
            this.config.worksheetCount = val;
        });

        // Generation buttons
        document.getElementById('generateStandard').addEventListener('click', () => this.generateStandard());
        document.getElementById('generateAI').addEventListener('click', () => this.generateAI());

        // Toolbar controls
        document.getElementById('showSolutions').addEventListener('change', (e) => {
            WorksheetRenderer.toggleSolutions(e.target.checked);
        });

        document.getElementById('interactiveBtn').addEventListener('click', () => {
            if (this.currentWorksheets.length > 0) {
                InteractiveMode.start(this.currentWorksheets);
            }
        });

        document.getElementById('tutorBtn').addEventListener('click', () => {
            TutorMode.toggle();
        });

        document.getElementById('printBtn').addEventListener('click', () => window.print());

        document.getElementById('startOverBtn').addEventListener('click', () => {
            document.getElementById('worksheetSection').style.display = 'none';
            document.getElementById('worksheetsContainer').innerHTML = '';
            this.currentWorksheets = [];
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Interactive mode controls
        document.getElementById('exitInteractive').addEventListener('click', () => InteractiveMode.exit());
        document.getElementById('retryBtn').addEventListener('click', () => InteractiveMode.retry());
        document.getElementById('newWorksheetBtn').addEventListener('click', () => {
            InteractiveMode.exit();
            document.getElementById('worksheetSection').style.display = 'none';
        });

        // Tutor panel
        document.getElementById('closeTutor').addEventListener('click', () => TutorMode.close());

        // Help modal
        document.getElementById('helpBtn').addEventListener('click', () => {
            document.getElementById('helpModal').style.display = 'flex';
        });

        document.getElementById('closeHelp').addEventListener('click', () => {
            document.getElementById('helpModal').style.display = 'none';
        });

        document.getElementById('helpModal').addEventListener('click', (e) => {
            if (e.target.id === 'helpModal') {
                document.getElementById('helpModal').style.display = 'none';
            }
        });

        // Question click for tutor mode
        document.getElementById('worksheetsContainer').addEventListener('click', (e) => {
            const questionItem = e.target.closest('.question-item');
            if (questionItem && TutorMode.isOpen) {
                const index = parseInt(questionItem.dataset.questionIndex);
                const worksheet = this.currentWorksheets[0]; // Simplified for first worksheet
                if (worksheet && worksheet.questions[index]) {
                    TutorMode.explainQuestion(worksheet.questions[index], index);
                }
            }
        });
    },

    setSubject(subject) {
        this.config.subject = subject;
        document.querySelectorAll('.subject-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.subject === subject);
        });
        this.checkTopicAvailability(); // Re-check when subject changes
    },

    // Debounce helper for topic checking
    topicCheckTimeout: null,
    debouncedCheckTopic() {
        clearTimeout(this.topicCheckTimeout);
        this.topicCheckTimeout = setTimeout(() => this.checkTopicAvailability(), 400);
    },

    // Check if a topic is available in standard generation or AI-only
    checkTopicAvailability() {
        const feedback = document.getElementById('topicFeedback');
        const topic = this.config.topic;

        // Clear feedback if no topic
        if (!topic) {
            feedback.className = 'topic-feedback';
            feedback.innerHTML = '';
            return;
        }

        // Get the right generator based on subject
        const generator = this.config.subject === 'math' ? MathGenerator : EnglishGenerator;
        const year = this.config.year;

        // Check if topic matches any standard generators
        const matchedGenerators = generator.mapTopicToGenerators(topic, year);
        const hasStandardMatch = matchedGenerators.length > 0;

        // Format the matched generator names for display
        const formatGeneratorName = (name) => {
            return name
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
        };

        if (hasStandardMatch) {
            // Topic available in standard generation
            const topicTags = matchedGenerators.slice(0, 5).map(g =>
                `<span class="topic-tag">${formatGeneratorName(g)}</span>`
            ).join('');
            const moreCount = matchedGenerators.length > 5 ? ` +${matchedGenerators.length - 5} more` : '';

            feedback.className = 'topic-feedback available visible';
            feedback.innerHTML = `
                <span class="topic-feedback-icon">✅</span>
                <strong>${matchedGenerators.length} matching question type${matchedGenerators.length > 1 ? 's' : ''}</strong> found for Year ${year}
                <div class="matched-topics">${topicTags}${moreCount}</div>
            `;
        } else {
            // Not available in standard - suggest AI
            feedback.className = 'topic-feedback ai-only visible';
            feedback.innerHTML = `
                <span class="topic-feedback-icon">💡</span>
                <strong>"${topic}"</strong> isn't in the Year ${year} standard question bank.
                <br>Use <a onclick="App.generateAI(); return false;">✨ AI Generation</a> to create custom questions for this topic!
            `;
        }
    },

    async checkAIAvailability() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            this.aiAvailable = data.aiConfigured;

            if (!this.aiAvailable) {
                const aiBtn = document.getElementById('generateAI');
                aiBtn.title = 'AI not configured. Add GEMINI_API_KEY to .env file.';
            }
        } catch (error) {
            console.log('AI service not available');
            this.aiAvailable = false;
        }
    },

    showLoading(message = 'Generating your worksheets...') {
        document.getElementById('loadingText').textContent = message;
        document.getElementById('loadingOverlay').style.display = 'flex';
    },

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    },

    generateStandard() {
        this.showLoading('Creating your worksheets...');

        setTimeout(() => {
            try {
                const worksheets = [];
                const generator = this.config.subject === 'math' ? MathGenerator : EnglishGenerator;

                for (let i = 0; i < this.config.worksheetCount; i++) {
                    let questions = generator.generate(
                        this.config.year,
                        this.config.difficulty,
                        this.config.questionCount,
                        this.config.topic || null
                    );

                    // Add revision questions if enabled
                    if (this.config.revision && this.config.year > 1) {
                        const revisionCount = Math.ceil(this.config.questionCount * 0.25);
                        const revisionQuestions = generator.generateRevision(
                            this.config.year,
                            this.config.difficulty,
                            revisionCount
                        );

                        // Mix revision questions throughout
                        revisionQuestions.forEach((rq, idx) => {
                            const insertPos = Math.min(questions.length, (idx + 1) * 3);
                            questions.splice(insertPos, 0, rq);
                        });

                        // Trim to original count
                        questions = questions.slice(0, this.config.questionCount);
                    }

                    worksheets.push({
                        subject: this.config.subject,
                        year: this.config.year,
                        difficulty: this.config.difficulty,
                        topic: this.config.topic || 'Mixed Topics',
                        questions
                    });
                }

                this.displayWorksheets(worksheets);
            } catch (error) {
                console.error('Generation error:', error);
                alert('Error generating worksheets. Please try again.');
            }

            this.hideLoading();
        }, 800);
    },

    async generateAI() {
        if (!this.aiAvailable) {
            alert('AI generation is not configured. Please add your GEMINI_API_KEY to the .env file and restart the server.');
            return;
        }

        this.showLoading('AI is creating unique questions for you...');

        try {
            const worksheets = [];

            for (let i = 0; i < this.config.worksheetCount; i++) {
                const response = await fetch('/api/generate-ai-worksheet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: this.config.subject,
                        year: this.config.year,
                        difficulty: this.config.difficulty,
                        topic: this.config.topic,
                        questionCount: this.config.questionCount,
                        includeRevision: this.config.revision
                    })
                });

                const data = await response.json();

                if (data.success) {
                    worksheets.push({
                        subject: this.config.subject,
                        year: this.config.year,
                        difficulty: this.config.difficulty,
                        topic: this.config.topic || 'AI Generated',
                        questions: data.questions.map(q => ({
                            ...q,
                            inputType: 'text'
                        }))
                    });
                } else {
                    throw new Error(data.error || 'Failed to generate');
                }
            }

            this.displayWorksheets(worksheets);
        } catch (error) {
            console.error('AI generation error:', error);
            alert('AI generation failed. Falling back to standard generation.');
            this.generateStandard();
        }

        this.hideLoading();
    },

    displayWorksheets(worksheets) {
        this.currentWorksheets = worksheets;

        const container = document.getElementById('worksheetsContainer');
        WorksheetRenderer.render(worksheets, container);

        const totalQuestions = worksheets.reduce((sum, w) => sum + w.questions.length, 0);
        document.getElementById('worksheetCountLabel').textContent =
            `${worksheets.length} worksheet${worksheets.length > 1 ? 's' : ''} • ${totalQuestions} questions`;

        document.getElementById('worksheetSection').style.display = 'block';
        document.getElementById('worksheetSection').scrollIntoView({ behavior: 'smooth' });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
