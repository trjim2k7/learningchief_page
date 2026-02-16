/**
 * LearningChief - Mistake Analyzer
 * Analyzes question-level data to identify recurring error patterns
 * Cloud-compatible: All data through ProgressStore abstraction
 */

const MistakeAnalyzer = {
    // Error type categories for pattern grouping
    ERROR_CATEGORIES: {
        math: {
            'place-value': ['place value', 'decimal place', 'ones', 'tens', 'hundreds'],
            'calculation': ['addition', 'subtraction', 'multiplication', 'division', 'arithmetic'],
            'fractions': ['fraction', 'numerator', 'denominator', 'equivalent'],
            'measurement': ['units', 'conversion', 'length', 'weight', 'capacity'],
            'time': ['clock', 'hours', 'minutes', 'elapsed time'],
            'geometry': ['shape', 'angle', 'perimeter', 'area', 'symmetry'],
            'word-problems': ['word problem', 'problem solving', 'interpretation']
        },
        english: {
            'spelling': ['spelling', 'spell', 'misspelt'],
            'grammar': ['grammar', 'sentence structure', 'subject-verb'],
            'punctuation': ['punctuation', 'comma', 'apostrophe', 'capital'],
            'vocabulary': ['vocabulary', 'word meaning', 'definition'],
            'verb-tense': ['tense', 'past tense', 'present tense', 'verb form'],
            'comprehension': ['comprehension', 'understanding', 'inference']
        }
    },

    /**
     * Generate UUID v4 for cloud-compatible IDs
     */
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Analyze all sessions to find mistake patterns
     * @param {string} profileId - Profile to analyze (optional, uses current)
     * @param {number} sessionLimit - Number of recent sessions to analyze
     * @returns {Object} Pattern analysis results
     */
    analyzePatterns(profileId = null, sessionLimit = 30) {
        if (typeof ProgressStore === 'undefined') {
            console.warn('ProgressStore not available');
            return this._emptyResult();
        }

        const sessions = ProgressStore.getSessions(profileId, sessionLimit);
        const patterns = {
            byErrorType: {},
            byTopic: {},
            bySubject: { math: [], english: [] },
            recentTrend: [],
            totalMistakes: 0,
            analyzedSessions: 0
        };

        sessions.forEach(session => {
            if (!session.questions || !Array.isArray(session.questions)) return;
            patterns.analyzedSessions++;

            session.questions.forEach(q => {
                if (q.isCorrect) return;
                patterns.totalMistakes++;

                // Track by error type
                const errorType = q.errorType || this._categorizeError(q, session.subject);
                if (errorType) {
                    if (!patterns.byErrorType[errorType]) {
                        patterns.byErrorType[errorType] = {
                            count: 0,
                            examples: [],
                            subject: session.subject
                        };
                    }
                    patterns.byErrorType[errorType].count++;
                    if (patterns.byErrorType[errorType].examples.length < 3) {
                        patterns.byErrorType[errorType].examples.push(q.questionText);
                    }
                }

                // Track by topic
                const topic = q.topic || 'general';
                if (!patterns.byTopic[topic]) {
                    patterns.byTopic[topic] = { count: 0, lastSeen: session.date };
                }
                patterns.byTopic[topic].count++;
                patterns.byTopic[topic].lastSeen = session.date;

                // Track by subject
                if (session.subject && patterns.bySubject[session.subject]) {
                    patterns.bySubject[session.subject].push({
                        errorType,
                        topic,
                        date: session.date
                    });
                }
            });
        });

        return patterns;
    },

    /**
     * Get top mistake patterns sorted by frequency
     * @param {string} profileId 
     * @param {number} limit 
     * @returns {Array} Top patterns with metadata
     */
    getTopPatterns(profileId = null, limit = 5) {
        const patterns = this.analyzePatterns(profileId);
        
        return Object.entries(patterns.byErrorType)
            .map(([type, data]) => ({
                errorType: type,
                count: data.count,
                subject: data.subject,
                examples: data.examples,
                displayName: this._formatErrorType(type)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    /**
     * Get suggested focus areas based on patterns
     * @param {string} profileId 
     * @returns {Array} Top 3 areas needing practice
     */
    getSuggestedFocus(profileId = null) {
        const topPatterns = this.getTopPatterns(profileId, 3);
        
        return topPatterns.map(p => ({
            area: p.displayName,
            subject: p.subject,
            frequency: p.count,
            recommendation: this._getRecommendation(p.errorType, p.subject)
        }));
    },

    /**
     * Check if a specific error type is improving over time
     * @param {string} errorType 
     * @param {number} days - Days to analyze
     * @param {string} profileId 
     * @returns {Object} Trend data
     */
    getMistakeTrend(errorType, days = 14, profileId = null) {
        if (typeof ProgressStore === 'undefined') return { trend: 'unknown' };

        const sessions = ProgressStore.getSessions(profileId, 50);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const recentErrors = [];
        const olderErrors = [];

        sessions.forEach(session => {
            if (!session.questions) return;
            const sessionDate = new Date(session.date);
            
            session.questions.forEach(q => {
                if (q.isCorrect) return;
                const type = q.errorType || this._categorizeError(q, session.subject);
                if (type === errorType) {
                    if (sessionDate >= cutoff) {
                        recentErrors.push(session.date);
                    } else {
                        olderErrors.push(session.date);
                    }
                }
            });
        });

        // Calculate trend
        const recentRate = recentErrors.length;
        const olderRate = olderErrors.length;
        
        let trend = 'stable';
        if (olderRate > 0 && recentRate < olderRate * 0.5) {
            trend = 'improving';
        } else if (olderRate > 0 && recentRate > olderRate * 1.5) {
            trend = 'declining';
        }

        return {
            trend,
            recentCount: recentRate,
            previousCount: olderRate,
            errorType
        };
    },

    /**
     * Categorize an error based on question/coaching text
     * @private
     */
    _categorizeError(question, subject) {
        const text = ((question.questionText || '') + ' ' + (question.coaching?.whatWentWrong || '')).toLowerCase();
        const categories = this.ERROR_CATEGORIES[subject] || this.ERROR_CATEGORIES.math;

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(kw => text.includes(kw))) {
                return category;
            }
        }
        return 'general';
    },

    /**
     * Format error type for display
     * @private
     */
    _formatErrorType(type) {
        const formats = {
            'place-value': 'Place Value',
            'calculation': 'Calculations',
            'fractions': 'Fractions',
            'measurement': 'Measurement',
            'time': 'Telling Time',
            'geometry': 'Shapes & Geometry',
            'word-problems': 'Word Problems',
            'spelling': 'Spelling',
            'grammar': 'Grammar',
            'punctuation': 'Punctuation',
            'vocabulary': 'Vocabulary',
            'verb-tense': 'Verb Tenses',
            'comprehension': 'Reading Comprehension',
            'general': 'General Practice'
        };
        return formats[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
    },

    /**
     * Get practice recommendation for an error type
     * @private
     */
    _getRecommendation(errorType, subject) {
        const recommendations = {
            'place-value': 'Practice number grids and place value charts',
            'calculation': 'Try timed mental math drills',
            'fractions': 'Use visual fraction models and pizza diagrams',
            'measurement': 'Practice converting between units',
            'time': 'Work with analog clock exercises',
            'geometry': 'Draw and identify shapes daily',
            'word-problems': 'Break problems into steps',
            'spelling': 'Use look-cover-write-check method',
            'grammar': 'Read sentences aloud to hear errors',
            'punctuation': 'Practice with dictation exercises',
            'vocabulary': 'Learn 3 new words per day',
            'verb-tense': 'Write sentences in different tenses',
            'comprehension': 'Ask questions while reading'
        };
        return recommendations[errorType] || `Focus on ${this._formatErrorType(errorType)} exercises`;
    },

    /**
     * Empty result for when no data is available
     * @private
     */
    _emptyResult() {
        return {
            byErrorType: {},
            byTopic: {},
            bySubject: { math: [], english: [] },
            recentTrend: [],
            totalMistakes: 0,
            analyzedSessions: 0
        };
    }
};

// Make available globally
window.MistakeAnalyzer = MistakeAnalyzer;
