/**
 * LearningChief - Reports Generator
 * Generates printable PDF reports using browser print functionality
 * Cloud-compatible: All data through ProgressStore abstraction
 */

const Reports = {
    /**
     * Generate and display a weekly progress report
     * @param {string} profileId - Profile to generate report for
     */
    generateWeeklyReport(profileId = null) {
        if (typeof ProgressStore === 'undefined') {
            alert('Progress data not available');
            return;
        }

        const profile = ProgressStore.getCurrentProfile();
        if (!profile) {
            alert('Please create a profile first to generate reports');
            return;
        }

        // Get date range (last 7 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // Gather data
        const sessions = ProgressStore.getSessionsByDateRange(startDate, endDate, profileId);
        const stats = ProgressStore.getStats(profileId);
        const weakTopics = ProgressStore.getWeakTopics(profileId, 5);

        let mistakePatterns = [];
        let recommendations = [];

        if (typeof MistakeAnalyzer !== 'undefined') {
            mistakePatterns = MistakeAnalyzer.getTopPatterns(profileId, 5);
            recommendations = MistakeAnalyzer.getSuggestedFocus(profileId);
        }

        let reviewSummary = { dueCount: 0, totalInQueue: 0 };
        if (typeof SpacedRepetition !== 'undefined') {
            reviewSummary = SpacedRepetition.getSummary(profileId);
        }

        // Generate report HTML
        const reportHTML = this.createReportHTML({
            profile: profile,
            startDate: startDate,
            endDate: endDate,
            sessions: sessions,
            stats: stats,
            weakTopics: weakTopics,
            mistakePatterns: mistakePatterns,
            recommendations: recommendations,
            reviewSummary: reviewSummary
        });

        // Open print window
        this.openPrintWindow(reportHTML);
    },

    /**
     * Create the report HTML
     */
    createReportHTML(data) {
        const { profile, startDate, endDate, sessions, stats, weakTopics, mistakePatterns, recommendations, reviewSummary } = data;

        const formatDate = (date) => date.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        // Calculate session stats
        const mathSessions = sessions.filter(s => s.subject === 'math');
        const englishSessions = sessions.filter(s => s.subject === 'english');
        const totalQuestions = sessions.reduce((sum, s) => sum + s.total, 0);
        const totalCorrect = sessions.reduce((sum, s) => sum + s.score, 0);
        const weeklyAverage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>LearningChief Progress Report - ${profile.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: #fff;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #6366f1;
        }
        
        .header-left h1 {
            font-size: 28px;
            color: #1e293b;
            margin-bottom: 5px;
        }
        
        .header-left .subtitle {
            color: #64748b;
            font-size: 14px;
        }
        
        .header-right {
            text-align: right;
        }
        
        .avatar {
            font-size: 48px;
            margin-bottom: 5px;
        }
        
        .student-name {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        
        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #6366f1;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .subject-breakdown {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }
        
        .subject-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid;
        }
        
        .subject-card.math { border-color: #3b82f6; }
        .subject-card.english { border-color: #10b981; }
        
        .subject-card h3 {
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .subject-stat {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin: 5px 0;
        }
        
        .topic-list {
            list-style: none;
        }
        
        .topic-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 8px;
        }
        
        .topic-name {
            font-weight: 500;
        }
        
        .topic-count {
            background: #fee2e2;
            color: #dc2626;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .recommendations {
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #86efac;
        }
        
        .recommendation-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
        }
        
        .recommendation-item:last-child {
            margin-bottom: 0;
        }
        
        .recommendation-icon {
            font-size: 20px;
            margin-right: 12px;
        }
        
        .recommendation-text {
            flex: 1;
        }
        
        .recommendation-area {
            font-weight: 600;
            color: #166534;
        }
        
        .recommendation-action {
            color: #15803d;
            font-size: 14px;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        
        .progress-bar-container {
            background: #e2e8f0;
            border-radius: 10px;
            height: 12px;
            margin-top: 10px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            border-radius: 10px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
        }
        
        @media print {
            body { padding: 20px; }
            .stat-card, .subject-card, .recommendations { 
                break-inside: avoid; 
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <h1>📊 Weekly Progress Report</h1>
            <div class="subtitle">${formatDate(startDate)} — ${formatDate(endDate)}</div>
        </div>
        <div class="header-right">
            <div class="avatar">${profile.avatar || '🌟'}</div>
            <div class="student-name">${profile.name}</div>
        </div>
    </div>
    
    <div class="section">
        <h2 class="section-title">📈 Week at a Glance</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${sessions.length}</div>
                <div class="stat-label">Sessions</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalQuestions}</div>
                <div class="stat-label">Questions</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${weeklyAverage}%</div>
                <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.currentStreak || 0}🔥</div>
                <div class="stat-label">Day Streak</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2 class="section-title">📚 Subject Breakdown</h2>
        <div class="subject-breakdown">
            <div class="subject-card math">
                <h3>🔢 Maths</h3>
                <div class="subject-stat">
                    <span>Sessions:</span>
                    <span>${mathSessions.length}</span>
                </div>
                <div class="subject-stat">
                    <span>Average:</span>
                    <span>${stats.mathAverage || 0}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${stats.mathAverage || 0}%"></div>
                </div>
            </div>
            <div class="subject-card english">
                <h3>📖 English</h3>
                <div class="subject-stat">
                    <span>Sessions:</span>
                    <span>${englishSessions.length}</span>
                </div>
                <div class="subject-stat">
                    <span>Average:</span>
                    <span>${stats.englishAverage || 0}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${stats.englishAverage || 0}%"></div>
                </div>
            </div>
        </div>
    </div>
    
    ${mistakePatterns.length > 0 ? `
    <div class="section">
        <h2 class="section-title">⚠️ Areas Needing Attention</h2>
        <ul class="topic-list">
            ${mistakePatterns.map(p => `
                <li class="topic-item">
                    <span class="topic-name">${p.displayName}</span>
                    <span class="topic-count">${p.count} mistakes</span>
                </li>
            `).join('')}
        </ul>
    </div>
    ` : ''}
    
    ${recommendations.length > 0 ? `
    <div class="section">
        <h2 class="section-title">💡 Recommended Practice</h2>
        <div class="recommendations">
            ${recommendations.map(r => `
                <div class="recommendation-item">
                    <span class="recommendation-icon">✨</span>
                    <div class="recommendation-text">
                        <div class="recommendation-area">${r.area}</div>
                        <div class="recommendation-action">${r.recommendation}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}
    
    ${reviewSummary.dueCount > 0 ? `
    <div class="section">
        <h2 class="section-title">📅 Review Schedule</h2>
        <div class="stat-card" style="text-align: left; padding: 20px;">
            <p><strong>${reviewSummary.dueCount}</strong> topics are due for review</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 5px;">
                Regular review helps move knowledge into long-term memory.
            </p>
        </div>
    </div>
    ` : ''}
    
    <div class="footer">
        <p>Generated by LearningChief on ${formatDate(new Date())}</p>
        <p>Keep up the great work! 🌟</p>
    </div>
</body>
</html>`;
    },

    /**
     * Open a new window and trigger print
     */
    openPrintWindow(html) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to generate the report');
            return;
        }

        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };
    },

    /**
     * Generate monthly report (extended version)
     */
    generateMonthlyReport(profileId = null) {
        // Similar to weekly but with 30-day range
        // TODO: Implement with more detailed trends
        alert('Monthly reports coming soon!');
    }
};

// Make available globally
window.Reports = Reports;
