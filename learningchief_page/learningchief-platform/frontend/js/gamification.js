/**
 * LearningChief - Gamification System
 * XP, Levels, Achievements, and Rewards
 */

const Gamification = {
    // XP Configuration
    XP_PER_LEVEL: 100,
    BASE_XP: 5,           // XP for completing any worksheet
    BONUS_XP_MULTIPLIER: 10, // Max bonus XP for 100% score

    // Achievement Definitions
    achievements: {
        firstSteps: {
            id: 'firstSteps',
            name: 'First Steps',
            emoji: '🌟',
            description: 'Complete your first worksheet',
            check: (stats) => stats.totalSessions >= 1
        },
        onFire: {
            id: 'onFire',
            name: 'On Fire',
            emoji: '🔥',
            description: '3-day practice streak',
            check: (stats) => stats.currentStreak >= 3
        },
        lightning: {
            id: 'lightning',
            name: 'Lightning',
            emoji: '⚡',
            description: '7-day practice streak',
            check: (stats) => stats.currentStreak >= 7
        },
        unstoppable: {
            id: 'unstoppable',
            name: 'Unstoppable',
            emoji: '💪',
            description: '10-day practice streak',
            check: (stats) => stats.currentStreak >= 10
        },
        champion: {
            id: 'champion',
            name: 'Champion',
            emoji: '🏆',
            description: '30-day practice streak',
            check: (stats) => stats.currentStreak >= 30
        },
        perfectScore: {
            id: 'perfectScore',
            name: 'Perfect Score',
            emoji: '💯',
            description: 'Get 100% on any worksheet',
            check: (stats, sessions) => sessions.some(s => s.percentage === 100)
        },
        sharpshooter: {
            id: 'sharpshooter',
            name: 'Sharpshooter',
            emoji: '🎯',
            description: 'Get 100% five times',
            check: (stats, sessions) => sessions.filter(s => s.percentage === 100).length >= 5
        },
        bookworm: {
            id: 'bookworm',
            name: 'Bookworm',
            emoji: '📚',
            description: 'Complete 10 worksheets',
            check: (stats) => stats.totalSessions >= 10
        },
        mastermind: {
            id: 'mastermind',
            name: 'Mastermind',
            emoji: '🧠',
            description: 'Complete 50 worksheets',
            check: (stats) => stats.totalSessions >= 50
        },
        superstar: {
            id: 'superstar',
            name: 'Superstar',
            emoji: '🦸',
            description: 'Reach Level 10',
            check: (stats, sessions, gamification) => gamification.level >= 10
        },
        mathWhiz: {
            id: 'mathWhiz',
            name: 'Math Whiz',
            emoji: '🔢',
            description: 'Complete 25 math worksheets',
            check: (stats, sessions) => sessions.filter(s => s.subject === 'math').length >= 25
        },
        wordWizard: {
            id: 'wordWizard',
            name: 'Word Wizard',
            emoji: '📝',
            description: 'Complete 25 English worksheets',
            check: (stats, sessions) => sessions.filter(s => s.subject === 'english').length >= 25
        }
    },

    // ========================================
    // XP & Level Functions
    // ========================================

    /**
     * Calculate XP earned from a session
     */
    calculateXP(score, total) {
        if (total === 0) return this.BASE_XP;
        const percentage = score / total;
        return Math.round(this.BASE_XP + (percentage * this.BONUS_XP_MULTIPLIER));
    },

    /**
     * Calculate level from total XP
     */
    calculateLevel(totalXP) {
        return Math.floor(totalXP / this.XP_PER_LEVEL) + 1;
    },

    /**
     * Get XP progress within current level
     */
    getLevelProgress(totalXP) {
        const xpInLevel = totalXP % this.XP_PER_LEVEL;
        return {
            current: xpInLevel,
            required: this.XP_PER_LEVEL,
            percentage: Math.round((xpInLevel / this.XP_PER_LEVEL) * 100)
        };
    },

    /**
     * Award XP to current profile and check for level-up
     * Returns object with xpEarned, newLevel, leveledUp
     */
    awardXP(score, total) {
        const profile = ProgressStore.getCurrentProfile();
        if (!profile) return null;

        // Initialize gamification data if needed
        if (!profile.gamification) {
            profile.gamification = {
                xp: 0,
                level: 1,
                achievements: []
            };
        }

        const xpEarned = this.calculateXP(score, total);
        const oldLevel = profile.gamification.level;

        profile.gamification.xp += xpEarned;
        profile.gamification.level = this.calculateLevel(profile.gamification.xp);

        const leveledUp = profile.gamification.level > oldLevel;

        // Save to storage
        ProgressStore.updateProfile(ProgressStore.currentProfileId, {
            gamification: profile.gamification
        });

        return {
            xpEarned,
            totalXP: profile.gamification.xp,
            level: profile.gamification.level,
            leveledUp,
            oldLevel,
            progress: this.getLevelProgress(profile.gamification.xp)
        };
    },

    // ========================================
    // Achievement Functions
    // ========================================

    /**
     * Check all achievements and return newly unlocked ones
     */
    checkAchievements() {
        const profile = ProgressStore.getCurrentProfile();
        if (!profile) return [];

        // Initialize if needed
        if (!profile.gamification) {
            profile.gamification = {
                xp: 0,
                level: 1,
                achievements: []
            };
        }

        const stats = ProgressStore.getStats();
        const sessions = ProgressStore.getSessions();
        const earned = profile.gamification.achievements || [];
        const newlyUnlocked = [];

        // Check each achievement
        for (const [id, achievement] of Object.entries(this.achievements)) {
            if (!earned.includes(id)) {
                try {
                    if (achievement.check(stats, sessions, profile.gamification)) {
                        earned.push(id);
                        newlyUnlocked.push(achievement);
                    }
                } catch (e) {
                    console.error(`Error checking achievement ${id}:`, e);
                }
            }
        }

        // Save if new achievements
        if (newlyUnlocked.length > 0) {
            profile.gamification.achievements = earned;
            ProgressStore.updateProfile(ProgressStore.currentProfileId, {
                gamification: profile.gamification
            });
        }

        return newlyUnlocked;
    },

    /**
     * Get all earned achievements for current profile
     */
    getEarnedAchievements() {
        const profile = ProgressStore.getCurrentProfile();
        if (!profile || !profile.gamification) return [];

        return (profile.gamification.achievements || [])
            .map(id => this.achievements[id])
            .filter(a => a);
    },

    /**
     * Get all achievements with earned status
     */
    getAllAchievements() {
        const profile = ProgressStore.getCurrentProfile();
        const earned = profile?.gamification?.achievements || [];

        return Object.values(this.achievements).map(a => ({
            ...a,
            earned: earned.includes(a.id)
        }));
    },

    /**
     * Get gamification data for current profile
     */
    getGamificationData() {
        const profile = ProgressStore.getCurrentProfile();

        if (!profile || !profile.gamification) {
            return {
                xp: 0,
                level: 1,
                progress: { current: 0, required: this.XP_PER_LEVEL, percentage: 0 },
                achievements: [],
                earnedCount: 0,
                totalCount: Object.keys(this.achievements).length
            };
        }

        const gam = profile.gamification;
        return {
            xp: gam.xp,
            level: gam.level,
            progress: this.getLevelProgress(gam.xp),
            achievements: this.getEarnedAchievements(),
            earnedCount: (gam.achievements || []).length,
            totalCount: Object.keys(this.achievements).length
        };
    },

    // ========================================
    // Process Session (Main Integration Point)
    // ========================================

    /**
     * Process a completed session - award XP and check achievements
     * Call this after saving a session to ProgressStore
     */
    processSession(score, total) {
        // Award XP
        const xpResult = this.awardXP(score, total);

        // Check achievements
        const newAchievements = this.checkAchievements();

        // Return all rewards info for UI
        return {
            xp: xpResult,
            newAchievements,
            hasRewards: xpResult?.leveledUp || newAchievements.length > 0
        };
    }
};

// Make available globally
window.Gamification = Gamification;
