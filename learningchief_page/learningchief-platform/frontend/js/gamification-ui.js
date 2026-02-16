/**
 * LearningChief - Gamification UI
 * XP bar, achievement popups, confetti celebrations
 */

const GamificationUI = {
    // Confetti configuration
    confettiColors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'],
    confettiActive: false,

    // ========================================
    // XP Bar Component
    // ========================================

    /**
     * Render XP bar in a container
     */
    renderXPBar(containerId = 'xpBarContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = Gamification.getGamificationData();

        container.innerHTML = `
            <div class="xp-bar-wrapper">
                <div class="xp-level-badge">
                    <span class="level-number">${data.level}</span>
                </div>
                <div class="xp-bar-track">
                    <div class="xp-bar-fill" style="width: ${data.progress.percentage}%"></div>
                    <span class="xp-bar-text">${data.progress.current} / ${data.progress.required} XP</span>
                </div>
            </div>
        `;
    },

    /**
     * Animate XP gain
     */
    animateXPGain(xpResult) {
        if (!xpResult) return;

        // Show floating XP text
        this.showFloatingXP(xpResult.xpEarned);

        // Animate the bar fill
        const fill = document.querySelector('.xp-bar-fill');
        if (fill) {
            fill.style.transition = 'width 0.8s ease-out';
            fill.style.width = `${xpResult.progress.percentage}%`;
        }

        // Update text
        const text = document.querySelector('.xp-bar-text');
        if (text) {
            text.textContent = `${xpResult.progress.current} / ${xpResult.progress.required} XP`;
        }

        // Update level badge
        const badge = document.querySelector('.xp-level-badge .level-number');
        if (badge && xpResult.leveledUp) {
            badge.textContent = xpResult.level;
            badge.classList.add('level-up-pulse');
            setTimeout(() => badge.classList.remove('level-up-pulse'), 1000);
        }
    },

    /**
     * Show floating +XP indicator
     */
    showFloatingXP(xp) {
        const floater = document.createElement('div');
        floater.className = 'xp-floater';
        floater.textContent = `+${xp} XP`;

        // Position near XP bar
        const bar = document.querySelector('.xp-bar-wrapper');
        if (bar) {
            const rect = bar.getBoundingClientRect();
            floater.style.left = `${rect.left + rect.width / 2}px`;
            floater.style.top = `${rect.top}px`;
        } else {
            floater.style.left = '50%';
            floater.style.top = '100px';
        }

        document.body.appendChild(floater);

        // Animate and remove
        setTimeout(() => floater.classList.add('float-up'), 10);
        setTimeout(() => floater.remove(), 1500);
    },

    // ========================================
    // Achievement Popup
    // ========================================

    /**
     * Show achievement unlock popup
     */
    showAchievementPopup(achievement) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'achievement-overlay';
        overlay.innerHTML = `
            <div class="achievement-popup">
                <div class="achievement-glow"></div>
                <div class="achievement-badge">${achievement.emoji}</div>
                <h3>Achievement Unlocked!</h3>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <button class="achievement-dismiss">Awesome!</button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Trigger animation
        setTimeout(() => overlay.classList.add('active'), 10);

        // Dismiss handler
        overlay.querySelector('.achievement-dismiss').addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        });

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            }
        }, 5000);
    },

    /**
     * Show multiple achievements (queued)
     */
    showAchievements(achievements) {
        if (!achievements || achievements.length === 0) return;

        let delay = 0;
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.showAchievementPopup(achievement);
            }, delay);
            delay += 2000; // Space out popups
        });
    },

    // ========================================
    // Level Up Celebration
    // ========================================

    /**
     * Show level up celebration with confetti
     */
    showLevelUpCelebration(newLevel) {
        // Trigger confetti
        this.triggerConfetti();

        // Show level up banner
        const banner = document.createElement('div');
        banner.className = 'level-up-banner';
        banner.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-stars">⭐ ⭐ ⭐</div>
                <h2>LEVEL UP!</h2>
                <div class="new-level">Level ${newLevel}</div>
            </div>
        `;

        document.body.appendChild(banner);

        // Animate in
        setTimeout(() => banner.classList.add('active'), 10);

        // Remove after animation
        setTimeout(() => {
            banner.classList.remove('active');
            setTimeout(() => banner.remove(), 500);
        }, 3000);
    },

    // ========================================
    // Confetti Animation
    // ========================================

    /**
     * Trigger confetti celebration
     */
    triggerConfetti() {
        if (this.confettiActive) return;
        this.confettiActive = true;

        const canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
        `;
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 150;

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 10 + 5,
                color: this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 4 - 2,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let activeParticles = 0;
            particles.forEach(p => {
                if (p.y < canvas.height + 50) {
                    activeParticles++;
                    p.y += p.speedY;
                    p.x += p.speedX;
                    p.rotation += p.rotationSpeed;

                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation * Math.PI / 180);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
                    ctx.restore();
                }
            });

            if (activeParticles > 0) {
                requestAnimationFrame(animate);
            } else {
                canvas.remove();
                this.confettiActive = false;
            }
        };

        animate();
    },

    // ========================================
    // Badge Showcase (for Dashboard)
    // ========================================

    /**
     * Render achievements grid
     */
    renderBadgeShowcase(containerId = 'badgeShowcase') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const allAchievements = Gamification.getAllAchievements();
        const data = Gamification.getGamificationData();

        container.innerHTML = `
            <div class="badge-showcase">
                <div class="badge-header">
                    <h3>🏅 Achievements</h3>
                    <span class="badge-count">${data.earnedCount} / ${data.totalCount}</span>
                </div>
                <div class="badge-grid">
                    ${allAchievements.map(a => `
                        <div class="badge-item ${a.earned ? 'earned' : 'locked'}" title="${a.description}">
                            <span class="badge-emoji">${a.earned ? a.emoji : '🔒'}</span>
                            <span class="badge-name">${a.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // ========================================
    // Main Integration
    // ========================================

    /**
     * Process and display rewards from a session
     */
    celebrateRewards(rewards) {
        if (!rewards) return;

        // Animate XP gain
        if (rewards.xp) {
            this.animateXPGain(rewards.xp);

            // Level up celebration
            if (rewards.xp.leveledUp) {
                setTimeout(() => {
                    this.showLevelUpCelebration(rewards.xp.level);
                }, 500);
            }
        }

        // Show achievements
        if (rewards.newAchievements && rewards.newAchievements.length > 0) {
            setTimeout(() => {
                this.showAchievements(rewards.newAchievements);
            }, rewards.xp?.leveledUp ? 3500 : 500);
        }
    },

    /**
     * Quick celebration for 100% score
     */
    celebratePerfectScore() {
        this.triggerConfetti();
    }
};

// Make available globally
window.GamificationUI = GamificationUI;
