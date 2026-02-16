/**
 * LearningChief - Spaced Repetition System
 * Implements SM-2 algorithm for optimal review scheduling
 * Cloud-compatible: All data through ProgressStore abstraction
 */

const SpacedRepetition = {
    // SM-2 Algorithm parameters
    DEFAULT_EASE: 2.5,
    MIN_EASE: 1.3,
    MAX_INTERVAL: 365, // Max days between reviews

    /**
     * Add a topic to the review queue
     * @param {string} topic - Topic identifier
     * @param {string} errorType - Type of error made
     * @param {string} subject - 'math' or 'english'
     */
    addToQueue(topic, errorType = 'general', subject = 'math') {
        if (typeof ProgressStore === 'undefined') {
            console.warn('ProgressStore not available');
            return;
        }

        ProgressStore.addToReviewQueue({
            topic: topic,
            errorType: errorType,
            subject: subject,
            easeFactor: this.DEFAULT_EASE,
            interval: 1,
            repetitions: 0,
            nextReview: new Date().toISOString() // Due immediately
        });
    },

    /**
     * Get all items due for review
     * @param {string} profileId - Optional profile ID
     * @returns {Array} Items due for review, sorted by urgency
     */
    getDueItems(profileId = null) {
        if (typeof ProgressStore === 'undefined') return [];
        return ProgressStore.getDueReviews(profileId);
    },

    /**
     * Get count of items due for review
     */
    getDueCount(profileId = null) {
        return this.getDueItems(profileId).length;
    },

    /**
     * Record a review and calculate next review date using SM-2 algorithm
     * @param {string} itemId - Review item ID
     * @param {number} quality - Quality of response (0-5)
     *   0: Complete blackout
     *   1: Incorrect; remembered on seeing correct answer
     *   2: Incorrect; correct answer seemed easy to recall
     *   3: Correct; serious difficulty
     *   4: Correct; some hesitation
     *   5: Perfect response
     */
    recordReview(itemId, quality) {
        if (typeof ProgressStore === 'undefined') return;

        const queue = ProgressStore.getReviewQueue();
        const item = queue.find(q => q.id === itemId);
        if (!item) return;

        // Apply SM-2 algorithm
        const result = this.calculateNextReview(item, quality);

        // Update the item
        ProgressStore.updateReviewItem(itemId, {
            easeFactor: result.easeFactor,
            interval: result.interval,
            repetitions: result.repetitions,
            nextReview: result.nextReview,
            lastReview: new Date().toISOString(),
            lastQuality: quality
        });

        // If interval exceeds max, consider it "mastered" and remove
        if (result.interval >= this.MAX_INTERVAL) {
            ProgressStore.removeFromReviewQueue(itemId);
        }
    },

    /**
     * SM-2 Algorithm: Calculate next review time
     * @param {Object} item - Current item state
     * @param {number} quality - Quality of response (0-5)
     * @returns {Object} Updated item state
     */
    calculateNextReview(item, quality) {
        let { easeFactor, interval, repetitions } = item;
        easeFactor = easeFactor || this.DEFAULT_EASE;
        interval = interval || 1;
        repetitions = repetitions || 0;

        // Quality must be at least 3 for a "correct" response
        if (quality < 3) {
            // Failed: Reset to beginning
            repetitions = 0;
            interval = 1;
        } else {
            // Successful recall
            if (repetitions === 0) {
                interval = 1; // First successful: 1 day
            } else if (repetitions === 1) {
                interval = 6; // Second successful: 6 days
            } else {
                // Subsequent: multiply by ease factor
                interval = Math.round(interval * easeFactor);
            }
            repetitions++;
        }

        // Adjust ease factor based on quality
        // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

        // Ensure ease factor doesn't go below minimum
        if (easeFactor < this.MIN_EASE) {
            easeFactor = this.MIN_EASE;
        }

        // Cap interval at maximum
        if (interval > this.MAX_INTERVAL) {
            interval = this.MAX_INTERVAL;
        }

        // Calculate next review date
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + interval);

        return {
            easeFactor: Math.round(easeFactor * 100) / 100,
            interval: interval,
            repetitions: repetitions,
            nextReview: nextDate.toISOString()
        };
    },

    /**
     * Get formatted display text for next review
     * @param {string} nextReview - ISO date string
     * @returns {string} Human-readable time until review
     */
    formatNextReview(nextReview) {
        const now = new Date();
        const next = new Date(nextReview);
        const diffMs = next - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 'Due now';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `In ${diffDays} days`;
        if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
        return `In ${Math.ceil(diffDays / 30)} months`;
    },

    /**
     * Get review summary for dashboard
     * @param {string} profileId 
     * @returns {Object} Summary stats
     */
    getSummary(profileId = null) {
        if (typeof ProgressStore === 'undefined') {
            return { dueCount: 0, totalInQueue: 0, masteredCount: 0 };
        }

        const queue = ProgressStore.getReviewQueue(profileId);
        const dueItems = this.getDueItems(profileId);

        // Count items by status
        const summary = {
            dueCount: dueItems.length,
            totalInQueue: queue.length,
            masteredCount: 0, // Items removed from queue are "mastered"
            bySubject: { math: 0, english: 0 },
            byTopic: {}
        };

        queue.forEach(item => {
            if (summary.bySubject[item.subject] !== undefined) {
                summary.bySubject[item.subject]++;
            }
            if (!summary.byTopic[item.topic]) {
                summary.byTopic[item.topic] = 0;
            }
            summary.byTopic[item.topic]++;
        });

        return summary;
    },

    /**
     * Get practice recommendations based on due reviews
     * @param {string} profileId 
     * @param {number} limit 
     * @returns {Array} Recommended topics to practice
     */
    getRecommendations(profileId = null, limit = 3) {
        const dueItems = this.getDueItems(profileId);

        // Group by topic and count
        const topicCounts = {};
        dueItems.forEach(item => {
            const key = `${item.subject}:${item.topic}`;
            if (!topicCounts[key]) {
                topicCounts[key] = {
                    topic: item.topic,
                    subject: item.subject,
                    count: 0,
                    urgency: 0
                };
            }
            topicCounts[key].count++;
            // Items overdue longer are more urgent
            const overdueDays = Math.max(0,
                (new Date() - new Date(item.nextReview)) / (1000 * 60 * 60 * 24)
            );
            topicCounts[key].urgency += overdueDays;
        });

        // Sort by urgency then count
        return Object.values(topicCounts)
            .sort((a, b) => b.urgency - a.urgency || b.count - a.count)
            .slice(0, limit);
    }
};

// Make available globally
window.SpacedRepetition = SpacedRepetition;
