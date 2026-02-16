/**
 * LearningChief - Progress Dashboard
 * Visual progress tracking with charts and analytics
 */

const ProgressDashboard = {
    chart: null,

    // ========================================
    // Initialization
    // ========================================

    init() {
        this.bindEvents();
        this.checkForProfile();
    },

    bindEvents() {
        // Profile selector buttons will be bound dynamically
    },

    checkForProfile() {
        const profiles = ProgressStore.getAllProfiles();

        if (profiles.length === 0) {
            this.showProfileCreationModal();
        } else if (!ProgressStore.currentProfileId) {
            this.showProfileSelectorModal();
        } else {
            this.updateProfileIndicator();
            this.loadDashboard();
        }
    },

    // ========================================
    // Profile UI
    // ========================================

    showProfileSelector() {
        // Legacy — redirect to modal
        this.showProfileSelectorModal();
    },

    showProfileSelectorModal() {
        const profiles = ProgressStore.getAllProfiles();
        const modal = document.getElementById('profileModal');
        const body = document.getElementById('profileModalBody');
        const title = document.getElementById('profileModalTitle');
        if (!modal || !body) return;

        title.textContent = "\uD83D\uDC4B Who's practicing today?";

        body.innerHTML = `
            <div class="profile-grid">
                ${profiles.map(p => `
                    <button class="profile-card ${p.id === ProgressStore.currentProfileId ? 'active' : ''}" 
                            onclick="ProgressDashboard.selectProfile('${p.id}')">
                        <span class="profile-avatar">${p.avatar}</span>
                        <span class="profile-name">${p.name}</span>
                    </button>
                `).join('')}
                <button class="profile-card add-profile" onclick="ProgressDashboard.showProfileCreationModal()">
                    <span class="profile-avatar">➕</span>
                    <span class="profile-name">Add Profile</span>
                </button>
            </div>
        `;

        modal.classList.add('open');
    },

    showProfileCreation() {
        // Legacy — redirect to modal
        this.showProfileCreationModal();
    },

    showProfileCreationModal() {
        const modal = document.getElementById('profileModal');
        const body = document.getElementById('profileModalBody');
        const title = document.getElementById('profileModalTitle');
        if (!modal || !body) return;

        title.textContent = '✨ Create Your Profile';
        const avatars = ['🌟', '🦄', '🚀', '🎨', '⚽', '🎮', '📚', '🌈', '🐱', '🐶', '🦋', '🌸'];

        body.innerHTML = `
            <div class="profile-form">
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" id="newProfileName" placeholder="Enter your name" maxlength="20">
                </div>
                <div class="form-group">
                    <label>Choose an Avatar</label>
                    <div class="avatar-picker">
                        ${avatars.map((a, i) => `
                            <button class="avatar-option ${i === 0 ? 'selected' : ''}" 
                                    data-avatar="${a}" 
                                    onclick="ProgressDashboard.selectAvatar(this)">
                                ${a}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="form-actions">
                    ${ProgressStore.getAllProfiles().length > 0 ? `
                        <button class="btn-secondary" onclick="ProgressDashboard.showProfileSelectorModal()">
                            Cancel
                        </button>
                    ` : ''}
                    <button class="btn-primary" onclick="ProgressDashboard.createProfile()">
                        Create Profile
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('open');

        // Focus name input
        setTimeout(() => {
            document.getElementById('newProfileName')?.focus();
        }, 100);
    },

    closeProfileModal() {
        document.getElementById('profileModal')?.classList.remove('open');
    },

    selectAvatar(button) {
        document.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
        button.classList.add('selected');
    },

    createProfile() {
        const nameInput = document.getElementById('newProfileName');
        const selectedAvatar = document.querySelector('.avatar-option.selected');

        const name = nameInput?.value.trim();
        const avatar = selectedAvatar?.dataset.avatar || '🌟';

        if (!name) {
            nameInput?.focus();
            return;
        }

        ProgressStore.createProfile(name, avatar);
        this.closeProfileModal();
        this.updateProfileIndicator();
        this.loadDashboard();

        // Sync year to UI for the new profile
        if (typeof Settings !== 'undefined') {
            Settings.syncYearToUI();
        }
    },

    selectProfile(profileId) {
        ProgressStore.switchProfile(profileId);
        this.closeProfileModal();
        this.updateProfileIndicator();
        this.loadDashboard();

        // Sync year to UI for the switched profile
        if (typeof Settings !== 'undefined') {
            Settings.syncYearToUI();
        }

        // Refresh XP bar
        if (typeof GamificationUI !== 'undefined') {
            GamificationUI.renderXPBar('xpBarContainer');
        }
    },

    updateProfileIndicator() {
        const profile = ProgressStore.getCurrentProfile();
        const avatarEl = document.getElementById('profileIndicatorAvatar');
        const nameEl = document.getElementById('profileIndicatorName');

        if (profile) {
            if (avatarEl) avatarEl.textContent = profile.avatar || '🌟';
            if (nameEl) nameEl.textContent = profile.name || 'Learner';
        } else {
            if (avatarEl) avatarEl.textContent = '🌟';
            if (nameEl) nameEl.textContent = 'Select Profile';
        }
    },

    // ========================================
    // Dashboard Rendering
    // ========================================

    loadDashboard() {
        const container = document.getElementById('progressDashboard');
        if (!container) return;

        const profile = ProgressStore.getCurrentProfile();
        const stats = ProgressStore.getStats();
        const recentSessions = ProgressStore.getSessions(null, 10);
        const weakTopics = ProgressStore.getWeakTopics();

        // Get gamification data
        const gamData = typeof Gamification !== 'undefined'
            ? Gamification.getGamificationData()
            : { level: 1, xp: 0, progress: { current: 0, required: 100, percentage: 0 }, achievements: [], earnedCount: 0, totalCount: 12 };
        const allAchievements = typeof Gamification !== 'undefined'
            ? Gamification.getAllAchievements()
            : [];

        container.innerHTML = `
            <!-- Dashboard Header -->
            <div class="dashboard-header">
                <div class="dashboard-greeting">
                    <span class="profile-avatar">${profile?.avatar || '🌟'}</span>
                    <span class="greeting-text">${profile?.name || 'Learner'}'s Progress</span>
                </div>
                <div class="level-display">
                    <div class="level-badge">Lvl ${gamData.level}</div>
                    <div class="xp-mini-bar">
                        <div class="xp-mini-fill" style="width: ${gamData.progress.percentage}%"></div>
                    </div>
                    <span class="xp-text">${gamData.progress.current}/${gamData.progress.required} XP</span>
                </div>
            </div>
            
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card total">
                    <div class="stat-icon">📝</div>
                    <div class="stat-value">${stats.totalSessions}</div>
                    <div class="stat-label">Sessions</div>
                </div>
                <div class="stat-card average">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">${stats.averageScore}%</div>
                    <div class="stat-label">Average</div>
                </div>
                <div class="stat-card streak">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-value">${stats.currentStreak}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
                <div class="stat-card best">
                    <div class="stat-icon">${stats.mathAverage >= stats.englishAverage ? '🔢' : '📖'}</div>
                    <div class="stat-value">${stats.mathAverage >= stats.englishAverage ? 'Math' : 'English'}</div>
                    <div class="stat-label">Best Subject</div>
                </div>
            </div>
            
            <!-- Achievements Showcase -->
            <div class="achievements-section">
                <div class="section-header">
                    <h3>🏅 Achievements</h3>
                    <span class="badge-count">${gamData.earnedCount} / ${gamData.totalCount}</span>
                </div>
                <div class="achievements-grid">
                    ${allAchievements.map(a => `
                        <div class="achievement-item ${a.earned ? 'earned' : 'locked'}" data-tooltip="${a.description}">
                            <span class="achievement-emoji">${a.earned ? a.emoji : '🔒'}</span>
                            <span class="achievement-name">${a.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Subject Comparison -->
            <div class="subject-comparison">
                <div class="subject-bar math">
                    <span class="subject-label">🔢 Math</span>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${stats.mathAverage}%"></div>
                    </div>
                    <span class="subject-score">${stats.mathAverage}%</span>
                </div>
                <div class="subject-bar english">
                    <span class="subject-label">📖 English</span>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${stats.englishAverage}%"></div>
                    </div>
                    <span class="subject-score">${stats.englishAverage}%</span>
                </div>
            </div>
            
            <!-- Progress Chart -->
            <div class="chart-section">
                <h3>📈 Progress Over Time</h3>
                <div class="chart-container">
                    <canvas id="progressChart"></canvas>
                </div>
                ${stats.totalSessions === 0 ? `
                    <div class="chart-empty">
                        <p>Complete some worksheets to see your progress!</p>
                    </div>
                ` : ''}
            </div>
            
            <!-- Weak Topics -->
            ${weakTopics.length > 0 ? `
                <div class="weak-topics-section">
                    <h3>💪 Topics to Practice</h3>
                    <div class="weak-topics-list">
                        ${weakTopics.map(t => `
                            <div class="weak-topic-item">
                                <span class="topic-name">${t.topic}</span>
                                <button class="practice-btn" onclick="ProgressDashboard.practiceTopic('${t.topic}')">
                                    Practice
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Recent Activity -->
            <div class="recent-activity-section">
                <h3>🕐 Recent Activity</h3>
                ${recentSessions.length > 0 ? `
                    <div class="activity-list">
                        ${recentSessions.map(s => `
                            <div class="activity-item ${s.percentage >= 80 ? 'great' : s.percentage >= 60 ? 'good' : 'needs-work'}">
                                <div class="activity-date">${this.formatDate(s.date)}</div>
                                <div class="activity-subject">${s.subject === 'math' ? '🔢' : '📖'} ${s.subject}</div>
                                <div class="activity-score">${s.score}/${s.total}</div>
                                <div class="activity-percentage">${s.percentage}%</div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-activity">
                        <p>No activity yet. Start practicing!</p>
                        <button class="btn-primary" onclick="switchMainTab('generate')">
                            Create a Worksheet
                        </button>
                    </div>
                `}
            </div>
            
            ${this.renderMistakePatternsSection()}
            ${this.renderDueReviewsSection()}
            ${this.renderReportSection()}
        `;

        // Render chart if we have data
        if (stats.totalSessions > 0) {
            this.renderChart();
        }
    },

    // ========================================
    // Chart Rendering
    // ========================================

    renderChart() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) return;

        const trendData = ProgressStore.getScoreTrend(14); // Last 2 weeks

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded, showing fallback');
            return;
        }

        const ctx = canvas.getContext('2d');

        // Filter to only show dates with data
        const filteredLabels = [];
        const filteredMath = [];
        const filteredEnglish = [];

        trendData.labels.forEach((label, i) => {
            if (trendData.mathData[i] !== null || trendData.englishData[i] !== null) {
                filteredLabels.push(this.formatDateShort(label));
                filteredMath.push(trendData.mathData[i]);
                filteredEnglish.push(trendData.englishData[i]);
            }
        });

        if (filteredLabels.length === 0) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: filteredLabels,
                datasets: [
                    {
                        label: 'Math',
                        data: filteredMath,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.3,
                        fill: true,
                        spanGaps: true
                    },
                    {
                        label: 'English',
                        data: filteredEnglish,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.3,
                        fill: true,
                        spanGaps: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        });
    },

    // ========================================
    // Actions
    // ========================================

    practiceTopic(topic) {
        // Switch to generate tab with topic pre-filled
        const topicInput = document.getElementById('topicInput');
        if (topicInput) {
            topicInput.value = topic;
            // Trigger input event so App.config updates
            topicInput.dispatchEvent(new Event('input'));
        }

        switchMainTab('generate');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // ========================================
    // Helpers
    // ========================================

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short'
            });
        }
    },

    formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short'
        });
    },

    // Refresh dashboard (called when new session is saved)
    refresh() {
        this.updateProfileIndicator();
        if (document.getElementById('progressTab')?.classList.contains('active')) {
            this.loadDashboard();
        }
    },

    // ========================================
    // Analytics Sections
    // ========================================

    renderMistakePatternsSection() {
        if (typeof MistakeAnalyzer === 'undefined') return '';

        const patterns = MistakeAnalyzer.getTopPatterns(null, 5);
        if (patterns.length === 0) return '';

        return `
            <div class="mistake-patterns-section">
                <h3>⚠️ Common Mistakes</h3>
                <div class="patterns-list">
                    ${patterns.map(p => `
                        <div class="pattern-item">
                            <div class="pattern-info">
                                <span class="pattern-subject">${p.subject === 'math' ? '🔢' : '📖'}</span>
                                <span class="pattern-name">${p.displayName}</span>
                            </div>
                            <div class="pattern-count">${p.count} times</div>
                            <button class="practice-btn-sm" onclick="ProgressDashboard.practiceTopic('${p.errorType}')">
                                Practice
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderDueReviewsSection() {
        if (typeof SpacedRepetition === 'undefined') return '';

        const dueItems = SpacedRepetition.getDueItems(null);
        const summary = SpacedRepetition.getSummary(null);

        if (summary.totalInQueue === 0) return '';

        return `
            <div class="due-reviews-section">
                <h3>📅 Due for Review</h3>
                <div class="review-summary">
                    <span class="due-count ${dueItems.length > 0 ? 'has-due' : ''}">${dueItems.length}</span>
                    <span class="review-label">topics due now</span>
                    <span class="queue-total">(${summary.totalInQueue} in queue)</span>
                </div>
                ${dueItems.length > 0 ? `
                    <div class="due-list">
                        ${dueItems.slice(0, 3).map(item => `
                            <div class="due-item">
                                <span class="due-subject">${item.subject === 'math' ? '🔢' : '📖'}</span>
                                <span class="due-topic">${item.topic}</span>
                                <button class="practice-btn-sm" onclick="ProgressDashboard.practiceTopic('${item.topic}')">
                                    Review
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    ${dueItems.length > 3 ? `<p class="more-due">+ ${dueItems.length - 3} more</p>` : ''}
                ` : `
                    <p class="all-reviewed">✅ You're all caught up!</p>
                `}
            </div>
        `;
    },

    renderReportSection() {
        if (typeof Reports === 'undefined') return '';

        return `
            <div class="report-section">
                <h3>📄 Progress Report</h3>
                <p class="report-desc">Generate a printable report for parents or teachers</p>
                <button class="btn-report" onclick="Reports.generateWeeklyReport()">
                    📊 Generate Weekly Report
                </button>
            </div>
        `;
    }
};

// Make available globally
window.ProgressDashboard = ProgressDashboard;
