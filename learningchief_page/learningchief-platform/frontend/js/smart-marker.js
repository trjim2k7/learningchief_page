/**
 * LearningChief - Smart Marker
 * Upload or photograph completed work for AI marking and coaching
 */

const SmartMarker = {
    // State
    stream: null,
    capturedImage: null,
    yearGroup: 4,
    privacyAccepted: false,

    // Max image dimension for upload (prevents PayloadTooLargeError)
    MAX_IMAGE_SIZE: 1920,
    JPEG_QUALITY: 0.8,

    // Initialize
    init() {
        this.checkCameraAvailability();
        this.bindEvents();
        this.loadPrivacyConsent();
    },

    // Check if camera is available
    async checkCameraAvailability() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCamera = devices.some(d => d.kind === 'videoinput');
            if (!hasCamera) {
                document.querySelector('.mark-work-section')?.classList.add('no-camera');
            }
        } catch (e) {
            console.log('Camera check failed:', e);
            document.querySelector('.mark-work-section')?.classList.add('no-camera');
        }
    },

    // Load privacy consent from storage
    loadPrivacyConsent() {
        this.privacyAccepted = localStorage.getItem('smartMarkerPrivacy') === 'true';
    },

    // Bind events
    bindEvents() {
        // Year group buttons
        document.querySelectorAll('.year-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.yearGroup = parseInt(e.target.dataset.year);
            });
        });

        // File input
        const fileInput = document.getElementById('workFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
    },

    // Show privacy modal
    showPrivacyModal(callback) {
        if (this.privacyAccepted) {
            callback();
            return;
        }

        const modal = document.getElementById('privacyModal');
        if (modal) {
            modal.classList.add('active');

            // Accept button
            const acceptBtn = modal.querySelector('.btn-accept');
            const declineBtn = modal.querySelector('.btn-decline');

            const cleanup = () => {
                modal.classList.remove('active');
                acceptBtn.removeEventListener('click', handleAccept);
                declineBtn.removeEventListener('click', handleDecline);
            };

            const handleAccept = () => {
                this.privacyAccepted = true;
                localStorage.setItem('smartMarkerPrivacy', 'true');
                cleanup();
                callback();
            };

            const handleDecline = () => {
                cleanup();
            };

            acceptBtn.addEventListener('click', handleAccept);
            declineBtn.addEventListener('click', handleDecline);
        }
    },

    // Open camera
    openCamera() {
        this.showPrivacyModal(() => this.startCamera());
    },

    // Start camera stream
    async startCamera() {
        try {
            const overlay = document.getElementById('cameraOverlay');
            const video = document.getElementById('cameraVideo');

            // Request camera with rear-facing preference (mobile)
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            video.srcObject = this.stream;
            await video.play();
            overlay.classList.add('active');

        } catch (error) {
            console.error('Camera error:', error);
            alert('Could not access camera. Please try uploading an image instead.');
        }
    },

    // Close camera
    closeCamera() {
        const overlay = document.getElementById('cameraOverlay');
        overlay.classList.remove('active');

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    },

    // Capture photo from camera
    capturePhoto() {
        const video = document.getElementById('cameraVideo');
        const canvas = document.createElement('canvas');

        // Resize if too large
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > this.MAX_IMAGE_SIZE || height > this.MAX_IMAGE_SIZE) {
            const ratio = Math.min(this.MAX_IMAGE_SIZE / width, this.MAX_IMAGE_SIZE / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);

        this.capturedImage = canvas.toDataURL('image/jpeg', this.JPEG_QUALITY);
        this.closeCamera();
        this.showPreview();
    },

    // Trigger file upload
    triggerUpload() {
        this.showPrivacyModal(() => {
            document.getElementById('workFileInput').click();
        });
    },

    // Handle file selection
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            alert('Please select an image or PDF file.');
            return;
        }

        // Handle PDF - for now just use first page
        if (file.type === 'application/pdf') {
            this.handlePDF(file);
            return;
        }

        // Handle image - compress before storing
        this.compressImage(file).then(compressedDataUrl => {
            this.capturedImage = compressedDataUrl;
            this.showPreview();
        }).catch(err => {
            console.error('Image compression failed:', err);
            alert('Failed to process image. Please try a smaller image.');
        });
    },

    // Compress image to reduce upload size
    compressImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if too large
                    if (width > this.MAX_IMAGE_SIZE || height > this.MAX_IMAGE_SIZE) {
                        const ratio = Math.min(this.MAX_IMAGE_SIZE / width, this.MAX_IMAGE_SIZE / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    resolve(canvas.toDataURL('image/jpeg', this.JPEG_QUALITY));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // Handle PDF upload (extract first page as image)
    async handlePDF(file) {
        // For MVP, we'll just show a message. Full PDF support would need pdf.js
        alert('PDF support coming soon! For now, please take a photo or screenshot of your work.');

        // TODO: Implement PDF to image conversion with pdf.js
        // const pdfjsLib = window['pdfjs-dist/build/pdf'];
        // const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        // const page = await pdf.getPage(1);
        // ... render to canvas and get image
    },

    // Show image preview
    showPreview() {
        const previewSection = document.getElementById('imagePreviewSection');
        const previewImg = document.getElementById('previewImage');
        const captureOptions = document.querySelector('.capture-options');

        previewImg.src = this.capturedImage;
        previewSection.classList.add('active');
        captureOptions.style.display = 'none';
    },

    // Remove preview and reset
    removePreview() {
        const previewSection = document.getElementById('imagePreviewSection');
        const captureOptions = document.querySelector('.capture-options');

        this.capturedImage = null;
        previewSection.classList.remove('active');
        captureOptions.style.display = 'flex';

        // Clear file input
        document.getElementById('workFileInput').value = '';
    },

    // Submit for marking
    async submitForMarking() {
        if (!this.capturedImage) return;

        const previewSection = document.getElementById('imagePreviewSection');
        const loader = document.getElementById('markingLoader');
        const results = document.getElementById('markingResults');

        // Show loading
        previewSection.classList.remove('active');
        loader.classList.add('active');
        results.classList.remove('active');

        try {
            const response = await fetch('/api/mark-work', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: this.capturedImage,
                    subject: 'auto', // Let AI detect
                    yearGroup: this.yearGroup
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to mark work');
            }

            if (!data.success && data.error) {
                throw new Error(data.error);
            }

            // Show results
            this.displayResults(data);

            // Save to progress (Phase 2)
            this.saveToProgress(data);

        } catch (error) {
            console.error('Marking error:', error);
            alert(error.message || 'Failed to mark work. Please try again with a clearer image.');
            this.removePreview();
        } finally {
            loader.classList.remove('active');
        }
    },

    // Display marking results
    displayResults(data) {
        const results = document.getElementById('markingResults');
        const captureOptions = document.querySelector('.capture-options');

        // Overall score
        const scoreDisplay = document.getElementById('scoreDisplay');
        const scorePraise = document.getElementById('scorePraise');

        if (data.overall) {
            scoreDisplay.innerHTML = `
                ${data.overall.correctCount}<span class="score-total">/${data.overall.questionsFound}</span>
            `;
            document.getElementById('scorePercentage').textContent = `${data.overall.percentage}%`;
            scorePraise.textContent = data.overall.praise || 'Good effort!';
        }

        // Individual questions
        const questionsContainer = document.getElementById('questionsResults');
        questionsContainer.innerHTML = '';

        if (data.questions) {
            data.questions.forEach(q => {
                const questionHtml = this.createQuestionResult(q);
                questionsContainer.innerHTML += questionHtml;
            });
        }

        // Overall advice
        const adviceEl = document.getElementById('overallAdviceText');
        if (adviceEl && data.overallAdvice) {
            adviceEl.textContent = data.overallAdvice;
        }

        // Suggested topics
        const topicsContainer = document.getElementById('practiceTopics');
        if (topicsContainer && data.suggestedTopics) {
            topicsContainer.innerHTML = data.suggestedTopics
                .map(t => `<span class="practice-topic">${t}</span>`)
                .join('');

            // Store for practice button
            this._suggestedTopics = data.suggestedTopics;
        }

        // Show results
        captureOptions.style.display = 'none';
        results.classList.add('active');
    },

    // Create HTML for individual question result
    createQuestionResult(q) {
        const statusClass = q.isCorrect ? 'correct' : 'incorrect';
        const statusIcon = q.isCorrect ? '✓' : '✗';

        let coachingHtml = '';
        if (q.coaching && !q.isCorrect) {
            coachingHtml = `
                <div class="coaching-card">
                    <div class="coaching-header">
                        <span class="coaching-icon">💡</span>
                        <span>Let's learn together!</span>
                    </div>
                    
                    ${q.coaching.whatWentWrong ? `
                        <div class="coaching-section">
                            <div class="coaching-label">What happened</div>
                            <p>${q.coaching.whatWentWrong}</p>
                        </div>
                    ` : ''}
                    
                    ${q.coaching.explanation ? `
                        <div class="coaching-section">
                            <div class="coaching-label">How to solve it</div>
                            <p>${q.coaching.explanation}</p>
                        </div>
                    ` : ''}
                    
                    ${q.coaching.tip ? `
                        <div class="coaching-tip">
                            <span class="tip-icon">💡</span>
                            <span>${q.coaching.tip}</span>
                        </div>
                    ` : ''}
                    
                    ${q.coaching.practiceQuestion ? `
                        <div class="coaching-section">
                            <div class="coaching-label">Try this</div>
                            <p>${q.coaching.practiceQuestion}</p>
                        </div>
                    ` : ''}
                    
                    <button class="btn-read-aloud" onclick="SmartMarker.readAloud(this)" data-text="${this.escapeHtml(q.coaching.explanation || '')}">
                        🔊 Read Aloud
                    </button>
                </div>
            `;
        }

        return `
            <div class="question-result ${statusClass}">
                <div class="question-header">
                    <span class="question-num">Q${q.number}</span>
                    <span class="question-status-icon ${statusClass}">${statusIcon}</span>
                </div>
                
                ${q.questionText ? `<div class="question-body">${q.questionText}</div>` : ''}
                
                <div class="answer-row">
                    <div class="answer-label">Your answer:</div>
                    <div class="answer-value">${q.studentAnswer || 'Not detected'}</div>
                </div>
                
                ${!q.isCorrect && q.correctAnswer ? `
                    <div class="answer-row correct-answer">
                        <div class="answer-label">Correct:</div>
                        <div class="answer-value">${q.correctAnswer}</div>
                    </div>
                ` : ''}
                
                ${coachingHtml}
            </div>
        `;
    },

    // Escape HTML for data attributes
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/"/g, '&quot;');
    },

    // Read coaching aloud (Web Speech API)
    readAloud(button) {
        const text = button.dataset.text;
        if (!text) return;

        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.1;

            // Try to use a friendly voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.includes('Female') || v.name.includes('Samantha') || v.lang.startsWith('en')
            );
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            // Update button state
            button.innerHTML = '🔊 Reading...';
            utterance.onend = () => {
                button.innerHTML = '🔊 Read Aloud';
            };

            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in your browser.');
        }
    },

    // Start practice with suggested topics
    startPractice() {
        if (this._suggestedTopics && this._suggestedTopics.length > 0) {
            // Navigate to worksheet generation with topic pre-filled
            const topicInput = document.getElementById('topicInput');
            if (topicInput) {
                topicInput.value = this._suggestedTopics.join(', ');
            }

            // Switch to generate tab (if tabs exist)
            const generateTab = document.querySelector('[data-tab="generate"]');
            if (generateTab) {
                generateTab.click();
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    // Reset and mark another
    markAnother() {
        const results = document.getElementById('markingResults');
        const captureOptions = document.querySelector('.capture-options');

        this.capturedImage = null;
        results.classList.remove('active');
        captureOptions.style.display = 'flex';

        // Clear file input
        document.getElementById('workFileInput').value = '';
    },

    // Save results to progress tracking (via ProgressStore)
    saveToProgress(data) {
        if (!data.overall) return;

        try {
            // Use ProgressStore if available
            if (typeof ProgressStore !== 'undefined') {
                // Extract question-level details for pattern analysis
                const questions = (data.questions || []).map(q => ({
                    isCorrect: q.isCorrect,
                    topic: q.topic || this._inferTopic(q),
                    errorType: q.coaching?.errorType || this._inferErrorType(q, data.detectedSubject),
                    questionText: q.questionText || '',
                    studentAnswer: q.studentAnswer || '',
                    correctAnswer: q.correctAnswer || ''
                }));

                ProgressStore.saveSession({
                    type: 'smart-marker',
                    subject: data.detectedSubject || 'math',
                    yearGroup: this.yearGroup,
                    score: data.overall.correctCount,
                    total: data.overall.questionsFound,
                    topics: data.suggestedTopics || [],
                    weakTopics: data.suggestedTopics || [],
                    questions: questions  // Question-level details for pattern analysis
                });

                // Add weak topics to spaced repetition queue
                if (typeof SpacedRepetition !== 'undefined') {
                    questions.filter(q => !q.isCorrect).forEach(q => {
                        SpacedRepetition.addToQueue(
                            q.topic || 'general',
                            q.errorType || 'general',
                            data.detectedSubject || 'math'
                        );
                    });
                }

                // Process gamification rewards
                if (typeof Gamification !== 'undefined') {
                    const rewards = Gamification.processSession(
                        data.overall.correctCount,
                        data.overall.questionsFound
                    );

                    // Celebrate rewards
                    if (typeof GamificationUI !== 'undefined' && rewards) {
                        GamificationUI.celebrateRewards(rewards);

                        // Extra confetti for perfect score
                        if (data.overall.percentage === 100) {
                            setTimeout(() => GamificationUI.celebratePerfectScore(), 500);
                        }
                    }
                }

                // Refresh dashboard if visible
                if (typeof ProgressDashboard !== 'undefined') {
                    ProgressDashboard.refresh();
                }
            } else {
                // Fallback to old localStorage method
                const progress = JSON.parse(localStorage.getItem('learningProgress') || '[]');
                progress.push({
                    date: new Date().toISOString(),
                    subject: data.detectedSubject || 'unknown',
                    yearGroup: this.yearGroup,
                    score: data.overall.correctCount,
                    total: data.overall.questionsFound,
                    percentage: data.overall.percentage,
                    weakTopics: data.suggestedTopics || []
                });
                if (progress.length > 100) progress.shift();
                localStorage.setItem('learningProgress', JSON.stringify(progress));
            }
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    },

    // Infer topic from question text
    _inferTopic(question) {
        const text = (question.questionText || '').toLowerCase();

        // Math topics
        if (/fraction|numerator|denominator/i.test(text)) return 'fractions';
        if (/decimal|point/i.test(text)) return 'decimals';
        if (/percent|%/i.test(text)) return 'percentages';
        if (/angle|triangle|square|rectangle|circle|shape/i.test(text)) return 'geometry';
        if (/clock|time|hour|minute/i.test(text)) return 'time';
        if (/measure|length|weight|cm|kg|litre/i.test(text)) return 'measurement';
        if (/\+|add|plus|sum/i.test(text)) return 'addition';
        if (/-|subtract|minus|difference/i.test(text)) return 'subtraction';
        if (/×|\*|multiply|times|product/i.test(text)) return 'multiplication';
        if (/÷|\/|divide|quotient/i.test(text)) return 'division';

        // English topics
        if (/spell|spelling/i.test(text)) return 'spelling';
        if (/verb|tense|past|present/i.test(text)) return 'verb-tense';
        if (/punctuation|comma|apostrophe|full stop/i.test(text)) return 'punctuation';
        if (/grammar|sentence/i.test(text)) return 'grammar';

        return 'general';
    },

    // Infer error type from question and subject
    _inferErrorType(question, subject) {
        if (question.coaching?.errorType) return question.coaching.errorType;

        const whatWentWrong = (question.coaching?.whatWentWrong || '').toLowerCase();
        const text = (question.questionText || '').toLowerCase();

        if (subject === 'math' || subject === 'maths') {
            if (/place value|column|digit/i.test(whatWentWrong)) return 'place-value';
            if (/calculation|arithmetic|compute/i.test(whatWentWrong)) return 'calculation';
            if (/fraction/i.test(whatWentWrong)) return 'fractions';
            if (/unit|convert/i.test(whatWentWrong)) return 'measurement';
            if (/word problem|understand|interpret/i.test(whatWentWrong)) return 'word-problems';
        } else {
            if (/spell/i.test(whatWentWrong)) return 'spelling';
            if (/grammar|structure/i.test(whatWentWrong)) return 'grammar';
            if (/punctuation/i.test(whatWentWrong)) return 'punctuation';
            if (/tense|verb/i.test(whatWentWrong)) return 'verb-tense';
        }

        return 'general';
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    SmartMarker.init();
});

// Make available globally
window.SmartMarker = SmartMarker;
