/**
 * LearningChief - Progress Store
 * Abstracted storage layer - works with LocalStorage now, cloud later
 */

const ProgressStore = {
    // Storage configuration
    STORAGE_KEY: 'learningchief_progress',
    cloudEnabled: false,
    currentProfileId: null,

    // ========================================
    // Initialization
    // ========================================

    init() {
        // Load last active profile
        const lastProfile = localStorage.getItem('learningchief_active_profile');
        if (lastProfile && this.getProfile(lastProfile)) {
            this.currentProfileId = lastProfile;
        }
        return this;
    },

    // ========================================
    // Profile Management
    // ========================================

    getAllProfiles() {
        const data = this._loadData();
        return Object.entries(data.profiles || {}).map(([id, profile]) => ({
            id,
            name: profile.name,
            avatar: profile.avatar,
            lastActive: profile.stats?.lastActive || profile.created
        }));
    },

    getProfile(profileId) {
        const data = this._loadData();
        return data.profiles?.[profileId] || null;
    },

    getCurrentProfile() {
        if (!this.currentProfileId) return null;
        return this.getProfile(this.currentProfileId);
    },

    createProfile(name, avatar = '🌟') {
        const data = this._loadData();
        const id = 'profile_' + Date.now().toString(36);

        data.profiles = data.profiles || {};
        data.profiles[id] = {
            name,
            avatar,
            yearGroup: 3,
            created: new Date().toISOString(),
            sessions: [],
            reviewQueue: [],  // Spaced repetition items
            stats: {
                totalSessions: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastActive: null
            }
        };

        this._saveData(data);
        this.switchProfile(id);
        return id;
    },

    updateProfile(profileId, updates) {
        const data = this._loadData();
        if (data.profiles?.[profileId]) {
            Object.assign(data.profiles[profileId], updates);
            this._saveData(data);
        }
    },

    deleteProfile(profileId) {
        const data = this._loadData();
        if (data.profiles?.[profileId]) {
            delete data.profiles[profileId];
            this._saveData(data);

            if (this.currentProfileId === profileId) {
                const remaining = Object.keys(data.profiles);
                this.currentProfileId = remaining.length > 0 ? remaining[0] : null;
                localStorage.setItem('learningchief_active_profile', this.currentProfileId || '');
            }
        }
    },

    clearProfileData(profileId) {
        const id = profileId || this.currentProfileId;
        const data = this._loadData();
        const profile = data.profiles?.[id];
        if (!profile) return false;

        // Reset all data but keep identity
        profile.sessions = [];
        profile.reviewQueue = [];
        profile.stats = {
            totalSessions: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActive: null
        };
        // Reset gamification XP
        profile.xp = 0;
        profile.achievements = [];

        this._saveData(data);
        return true;
    },

    switchProfile(profileId) {
        if (this.getProfile(profileId)) {
            this.currentProfileId = profileId;
            localStorage.setItem('learningchief_active_profile', profileId);
            return true;
        }
        return false;
    },

    // ========================================
    // Session Management
    // ========================================

    saveSession(sessionData) {
        if (!this.currentProfileId) {
            console.warn('No profile selected, creating default profile');
            this.createProfile('Learner');
        }

        const data = this._loadData();
        const profile = data.profiles[this.currentProfileId];

        if (!profile) return false;

        const session = {
            id: 'sess_' + Date.now().toString(36),
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: sessionData.type || 'worksheet',
            subject: sessionData.subject || 'math',
            yearGroup: sessionData.yearGroup || 3,
            score: sessionData.score || 0,
            total: sessionData.total || 0,
            percentage: sessionData.total > 0 ? Math.round((sessionData.score / sessionData.total) * 100) : 0,
            timeSpent: sessionData.timeSpent || 0,
            topics: sessionData.topics || [],
            weakTopics: sessionData.weakTopics || [],
            questions: sessionData.questions || []  // Question-level details for pattern analysis
        };

        profile.sessions.push(session);

        // Update stats
        this._updateStats(profile);

        this._saveData(data);
        return session.id;
    },

    getSessions(profileId = null, limit = null) {
        const id = profileId || this.currentProfileId;
        const profile = this.getProfile(id);
        if (!profile) return [];

        let sessions = [...profile.sessions].reverse(); // Most recent first
        if (limit) {
            sessions = sessions.slice(0, limit);
        }
        return sessions;
    },

    getSessionsByDateRange(startDate, endDate, profileId = null) {
        const sessions = this.getSessions(profileId);
        return sessions.filter(s => {
            const date = new Date(s.date);
            return date >= startDate && date <= endDate;
        });
    },

    // ========================================
    // Statistics & Analytics
    // ========================================

    getStats(profileId = null) {
        const id = profileId || this.currentProfileId;
        const profile = this.getProfile(id);
        if (!profile) {
            return {
                totalSessions: 0,
                currentStreak: 0,
                longestStreak: 0,
                averageScore: 0,
                mathAverage: 0,
                englishAverage: 0,
                lastActive: null
            };
        }

        const sessions = profile.sessions;
        const stats = { ...profile.stats };

        // Calculate averages
        if (sessions.length > 0) {
            const totalPercentage = sessions.reduce((sum, s) => sum + s.percentage, 0);
            stats.averageScore = Math.round(totalPercentage / sessions.length);

            const mathSessions = sessions.filter(s => s.subject === 'math');
            const englishSessions = sessions.filter(s => s.subject === 'english');

            stats.mathAverage = mathSessions.length > 0
                ? Math.round(mathSessions.reduce((sum, s) => sum + s.percentage, 0) / mathSessions.length)
                : 0;

            stats.englishAverage = englishSessions.length > 0
                ? Math.round(englishSessions.reduce((sum, s) => sum + s.percentage, 0) / englishSessions.length)
                : 0;
        } else {
            stats.averageScore = 0;
            stats.mathAverage = 0;
            stats.englishAverage = 0;
        }

        return stats;
    },

    getWeakTopics(profileId = null, limit = 5) {
        const sessions = this.getSessions(profileId);
        const topicScores = {};

        // Collect all weak topics from recent sessions (last 20)
        const recentSessions = sessions.slice(0, 20);
        recentSessions.forEach(session => {
            (session.weakTopics || []).forEach(topic => {
                topicScores[topic] = (topicScores[topic] || 0) + 1;
            });
        });

        // Sort by frequency
        const sorted = Object.entries(topicScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([topic, count]) => ({ topic, count }));

        return sorted;
    },

    getScoreTrend(days = 30, profileId = null) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const sessions = this.getSessionsByDateRange(startDate, endDate, profileId);

        // Group by date
        const byDate = {};
        sessions.forEach(session => {
            const dateKey = session.date.split('T')[0];
            if (!byDate[dateKey]) {
                byDate[dateKey] = { math: [], english: [] };
            }
            if (session.subject === 'math') {
                byDate[dateKey].math.push(session.percentage);
            } else {
                byDate[dateKey].english.push(session.percentage);
            }
        });

        // Create data points for chart
        const labels = [];
        const mathData = [];
        const englishData = [];

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            labels.push(dateKey);

            if (byDate[dateKey]) {
                const mathScores = byDate[dateKey].math;
                const englishScores = byDate[dateKey].english;

                mathData.push(mathScores.length > 0
                    ? Math.round(mathScores.reduce((a, b) => a + b, 0) / mathScores.length)
                    : null);
                englishData.push(englishScores.length > 0
                    ? Math.round(englishScores.reduce((a, b) => a + b, 0) / englishScores.length)
                    : null);
            } else {
                mathData.push(null);
                englishData.push(null);
            }
        }

        return { labels, mathData, englishData };
    },

    // ========================================
    // Review Queue (Spaced Repetition)
    // ========================================

    /**
     * Get all items in the review queue
     */
    getReviewQueue(profileId = null) {
        const id = profileId || this.currentProfileId;
        const profile = this.getProfile(id);
        if (!profile) return [];
        return profile.reviewQueue || [];
    },

    /**
     * Get items due for review (nextReview <= now)
     */
    getDueReviews(profileId = null) {
        const queue = this.getReviewQueue(profileId);
        const now = new Date().toISOString();
        return queue.filter(item => item.nextReview <= now)
            .sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));
    },

    /**
     * Add or update an item in the review queue
     */
    addToReviewQueue(item, profileId = null) {
        const id = profileId || this.currentProfileId;
        const data = this._loadData();
        const profile = data.profiles[id];
        if (!profile) return false;

        // Initialize queue if missing
        if (!profile.reviewQueue) {
            profile.reviewQueue = [];
        }

        // Check if item already exists
        const existing = profile.reviewQueue.findIndex(q =>
            q.topic === item.topic && q.errorType === item.errorType
        );

        const now = new Date().toISOString();
        const reviewItem = {
            id: item.id || ('review_' + Date.now().toString(36)),
            topic: item.topic,
            errorType: item.errorType || 'general',
            subject: item.subject || 'math',
            easeFactor: item.easeFactor || 2.5,
            interval: item.interval || 1,
            repetitions: item.repetitions || 0,
            nextReview: item.nextReview || now,
            createdAt: item.createdAt || now,
            updatedAt: now
        };

        if (existing >= 0) {
            // Update existing item
            profile.reviewQueue[existing] = {
                ...profile.reviewQueue[existing],
                ...reviewItem,
                createdAt: profile.reviewQueue[existing].createdAt
            };
        } else {
            // Add new item
            profile.reviewQueue.push(reviewItem);
        }

        this._saveData(data);
        return reviewItem.id;
    },

    /**
     * Update review item after a review session (SM-2 algorithm data)
     */
    updateReviewItem(itemId, updates, profileId = null) {
        const id = profileId || this.currentProfileId;
        const data = this._loadData();
        const profile = data.profiles[id];
        if (!profile || !profile.reviewQueue) return false;

        const index = profile.reviewQueue.findIndex(q => q.id === itemId);
        if (index >= 0) {
            profile.reviewQueue[index] = {
                ...profile.reviewQueue[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this._saveData(data);
            return true;
        }
        return false;
    },

    /**
     * Remove item from review queue (mastered)
     */
    removeFromReviewQueue(itemId, profileId = null) {
        const id = profileId || this.currentProfileId;
        const data = this._loadData();
        const profile = data.profiles[id];
        if (!profile || !profile.reviewQueue) return false;

        profile.reviewQueue = profile.reviewQueue.filter(q => q.id !== itemId);
        this._saveData(data);
        return true;
    },


    // ========================================
    // Private Helpers
    // ========================================

    _loadData() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : { profiles: {} };
        } catch (e) {
            console.error('Failed to load progress data:', e);
            return { profiles: {} };
        }
    },

    _saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save progress data:', e);
        }
    },

    _updateStats(profile) {
        const sessions = profile.sessions;
        profile.stats.totalSessions = sessions.length;
        profile.stats.lastActive = new Date().toISOString().split('T')[0];

        // Calculate streak
        const today = new Date().toISOString().split('T')[0];
        const uniqueDates = [...new Set(sessions.map(s => s.date.split('T')[0]))].sort().reverse();

        let streak = 0;
        let checkDate = new Date();

        for (const dateStr of uniqueDates) {
            const checkDateStr = checkDate.toISOString().split('T')[0];
            if (dateStr === checkDateStr) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (dateStr < checkDateStr) {
                // Allow one day gap (yesterday counts)
                checkDate.setDate(checkDate.getDate() - 1);
                if (dateStr === checkDate.toISOString().split('T')[0]) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        profile.stats.currentStreak = streak;
        if (streak > (profile.stats.longestStreak || 0)) {
            profile.stats.longestStreak = streak;
        }
    },

    // ========================================
    // Future: Cloud Sync
    // ========================================

    async syncToCloud() {
        if (!this.cloudEnabled) {
            console.log('Cloud sync not enabled');
            return false;
        }
        // TODO: Implement when user accounts are added
        // 1. Get current LocalStorage data
        // 2. POST to /api/sync-progress
        // 3. Merge with cloud data
        return true;
    },

    async loadFromCloud() {
        if (!this.cloudEnabled) return false;
        // TODO: Implement when user accounts are added
        return true;
    },

    // Export data for backup/migration
    exportData() {
        return JSON.stringify(this._loadData(), null, 2);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.profiles) {
                this._saveData(data);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    }
};

// Initialize on load
ProgressStore.init();

// Make available globally
window.ProgressStore = ProgressStore;
