/**
 * LearningChief - Settings Module
 * User profile settings, data management, and account controls
 */

const Settings = {
    avatars: ['🌟', '🦄', '🚀', '🎨', '⚽', '🎮', '📚', '🌈', '🐱', '🐶', '🦋', '🌸'],

    // ========================================
    // Open / Close
    // ========================================

    open() {
        const profile = ProgressStore.getCurrentProfile();
        if (!profile) {
            alert('Please create a profile first from the My Progress tab.');
            return;
        }

        this.renderSettings(profile);
        document.getElementById('settingsModal').classList.add('open');
    },

    close() {
        document.getElementById('settingsModal').classList.remove('open');
        this.closeDataViewer();
    },

    // ========================================
    // Render Settings Content
    // ========================================

    renderSettings(profile) {
        const body = document.getElementById('settingsBody');
        if (!body) return;

        const currentAvatar = profile.avatar || '🌟';
        const currentYear = profile.yearGroup || 3;

        body.innerHTML = `
            <!-- Profile Section -->
            <div class="settings-section">
                <div class="settings-section-title">Profile</div>

                <!-- Name -->
                <div class="settings-card">
                    <div class="settings-card-row">
                        <div class="settings-card-label">
                            <span class="icon">✏️</span> Name
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="text" class="settings-name-input" id="settingsNameInput"
                                   value="${this.escapeHtml(profile.name)}" maxlength="20">
                            <span class="settings-saved" id="nameSaved">✓ Saved</span>
                        </div>
                    </div>
                </div>

                <!-- Avatar -->
                <div class="settings-card">
                    <div class="settings-card-label" style="margin-bottom: 8px;">
                        <span class="icon">😊</span> Avatar
                    </div>
                    <div class="settings-avatar-picker">
                        ${this.avatars.map(a => `
                            <button class="settings-avatar-option ${a === currentAvatar ? 'selected' : ''}"
                                    data-avatar="${a}"
                                    onclick="Settings.selectAvatar('${a}')">
                                ${a}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Year Group Section -->
            <div class="settings-section">
                <div class="settings-section-title">Year Group</div>
                <div class="settings-card">
                    <div class="settings-card-row">
                        <div class="settings-card-label">
                            <span class="icon">🎓</span> Current Year
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <select class="settings-year-select" id="settingsYearSelect"
                                    onchange="Settings.saveYearGroup()">
                                <option value="1" ${currentYear == 1 ? 'selected' : ''}>Year 1 (Ages 5-6)</option>
                                <option value="2" ${currentYear == 2 ? 'selected' : ''}>Year 2 (Ages 6-7)</option>
                                <option value="3" ${currentYear == 3 ? 'selected' : ''}>Year 3 (Ages 7-8)</option>
                                <option value="4" ${currentYear == 4 ? 'selected' : ''}>Year 4 (Ages 8-9)</option>
                                <option value="5" ${currentYear == 5 ? 'selected' : ''}>Year 5 (Ages 9-10)</option>
                                <option value="6" ${currentYear == 6 ? 'selected' : ''}>Year 6 (Ages 10-11)</option>
                            </select>
                            <span class="settings-saved" id="yearSaved">✓ Saved</span>
                        </div>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--gray); margin-top: 8px;">
                        This auto-populates the year in Create Worksheets and Mark My Work
                    </p>
                </div>
            </div>

            <!-- My Data Section -->
            <div class="settings-section">
                <div class="settings-section-title">My Data</div>

                <button class="settings-action-btn" onclick="Settings.toggleDataViewer()">
                    <span class="btn-icon">📊</span>
                    <span class="btn-label">
                        View My Stored Data
                        <small>See all data stored for your profile</small>
                    </span>
                </button>
                <div class="settings-data-viewer" id="settingsDataViewer"></div>

                <button class="settings-action-btn" onclick="Settings.exportData()">
                    <span class="btn-icon">💾</span>
                    <span class="btn-label">
                        Export My Data
                        <small>Download a backup of your progress as JSON</small>
                    </span>
                </button>
            </div>

            <!-- Danger Zone -->
            <div class="settings-section settings-danger-zone">
                <div class="settings-section-title">⚠️ Danger Zone</div>

                <button class="settings-action-btn danger" onclick="Settings.confirmClearData()">
                    <span class="btn-icon">🗑️</span>
                    <span class="btn-label">
                        Delete All My Data
                        <small>Removes all sessions, scores, and achievements but keeps your profile</small>
                    </span>
                </button>

                <button class="settings-action-btn danger" onclick="Settings.confirmDeleteAccount()">
                    <span class="btn-icon">❌</span>
                    <span class="btn-label">
                        Delete My Account
                        <small>Permanently removes your entire profile and all data</small>
                    </span>
                </button>
            </div>
        `;

        // Bind name input save on blur and enter
        const nameInput = document.getElementById('settingsNameInput');
        nameInput.addEventListener('blur', () => this.saveName());
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveName();
                nameInput.blur();
            }
        });
    },

    // ========================================
    // Save Actions
    // ========================================

    saveName() {
        const input = document.getElementById('settingsNameInput');
        if (!input) return;

        const name = input.value.trim();
        if (!name) return;

        ProgressStore.updateProfile(ProgressStore.currentProfileId, { name });
        this.showSaved('nameSaved');
        this.refreshUI();
    },

    selectAvatar(avatar) {
        document.querySelectorAll('.settings-avatar-option').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.avatar === avatar);
        });
        ProgressStore.updateProfile(ProgressStore.currentProfileId, { avatar });
        this.refreshUI();
    },

    saveYearGroup() {
        const select = document.getElementById('settingsYearSelect');
        if (!select) return;

        const year = parseInt(select.value);
        ProgressStore.updateProfile(ProgressStore.currentProfileId, { yearGroup: year });
        this.syncYearToUI(year);
        this.showSaved('yearSaved');
    },

    // ========================================
    // Sync Year to UI
    // ========================================

    syncYearToUI(year) {
        if (!year) {
            const profile = ProgressStore.getCurrentProfile();
            year = profile?.yearGroup || 3;
        }

        // Update App config
        if (typeof App !== 'undefined') {
            App.config.year = year;
        }

        // Update Generate tab year select
        const yearSelect = document.getElementById('yearSelect');
        if (yearSelect) {
            yearSelect.value = year;
        }

        // Update Mark tab year buttons
        const yearButtons = document.querySelectorAll('.year-selector .year-btn');
        yearButtons.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.year) === year);
        });

        // Update topic availability check if topic is filled
        if (typeof App !== 'undefined' && App.config.topic) {
            App.checkTopicAvailability();
        }
    },

    // ========================================
    // Data Viewer
    // ========================================

    toggleDataViewer() {
        const viewer = document.getElementById('settingsDataViewer');
        if (!viewer) return;

        if (viewer.classList.contains('open')) {
            this.closeDataViewer();
            return;
        }

        const profile = ProgressStore.getCurrentProfile();
        if (!profile) return;

        const sessions = profile.sessions || [];
        const stats = ProgressStore.getStats();
        const reviewQueue = profile.reviewQueue || [];

        // Calculate storage size
        const dataStr = JSON.stringify(profile);
        const sizeKB = (new Blob([dataStr]).size / 1024).toFixed(1);

        viewer.innerHTML = `
            <div class="data-summary">
                <div class="data-summary-item">
                    <div class="data-summary-value">${sessions.length}</div>
                    <div class="data-summary-label">Sessions</div>
                </div>
                <div class="data-summary-item">
                    <div class="data-summary-value">${stats.averageScore || 0}%</div>
                    <div class="data-summary-label">Avg Score</div>
                </div>
                <div class="data-summary-item">
                    <div class="data-summary-value">${reviewQueue.length}</div>
                    <div class="data-summary-label">Review Items</div>
                </div>
                <div class="data-summary-item">
                    <div class="data-summary-value">${sizeKB} KB</div>
                    <div class="data-summary-label">Storage Used</div>
                </div>
            </div>
            <div class="data-viewer-content">${this.escapeHtml(JSON.stringify(profile, null, 2))}</div>
            <div class="data-viewer-toolbar">
                <button class="data-viewer-btn" onclick="Settings.copyData()">📋 Copy</button>
            </div>
        `;

        viewer.classList.add('open');
    },

    closeDataViewer() {
        const viewer = document.getElementById('settingsDataViewer');
        if (viewer) {
            viewer.classList.remove('open');
            viewer.innerHTML = '';
        }
    },

    copyData() {
        const profile = ProgressStore.getCurrentProfile();
        if (!profile) return;

        navigator.clipboard.writeText(JSON.stringify(profile, null, 2))
            .then(() => this.showSuccessMessage('📋 Data copied to clipboard!'))
            .catch(() => this.showSuccessMessage('⚠️ Failed to copy. Please try the export option instead.'));
    },

    // ========================================
    // Export Data
    // ========================================

    exportData() {
        const profile = ProgressStore.getCurrentProfile();
        if (!profile) return;

        const data = {
            exportDate: new Date().toISOString(),
            profileId: ProgressStore.currentProfileId,
            profile: profile
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `learningchief_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // ========================================
    // Delete Actions with Confirmation
    // ========================================

    confirmClearData() {
        this.showConfirmDialog(
            '🗑️',
            'Delete All Data?',
            'This will permanently remove all your sessions, scores, achievements, and progress. Your profile name and avatar will be kept. This cannot be undone.',
            'Delete All Data',
            () => {
                ProgressStore.clearProfileData();
                this.close();
                // Refresh the XP bar
                if (typeof GamificationUI !== 'undefined') {
                    GamificationUI.renderXPBar('xpBarContainer');
                }
                // Refresh dashboard if visible
                if (typeof ProgressDashboard !== 'undefined') {
                    ProgressDashboard.refresh();
                }
                this.showSuccessMessage('✅ All your data has been cleared. Your profile has been kept.');
            }
        );
    },

    confirmDeleteAccount() {
        const profile = ProgressStore.getCurrentProfile();
        const name = profile?.name || 'this profile';

        this.showConfirmDialog(
            '❌',
            'Delete Your Account?',
            `This will permanently delete "${this.escapeHtml(name)}" and all associated data including sessions, scores, achievements, and progress. This cannot be undone.`,
            'Delete Account',
            () => {
                ProgressStore.deleteProfile(ProgressStore.currentProfileId);
                this.close();
                this.showSuccessMessage('✅ Your account has been deleted.');

                // Reload after a short delay so user sees the message
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        );
    },

    showConfirmDialog(icon, title, message, confirmText, onConfirm) {
        const overlay = document.getElementById('settingsConfirmOverlay');
        if (!overlay) return;

        document.getElementById('confirmIcon').textContent = icon;
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmActionBtn').textContent = confirmText;

        // Remove old listener and add new one
        const actionBtn = document.getElementById('confirmActionBtn');
        const newBtn = actionBtn.cloneNode(true);
        actionBtn.parentNode.replaceChild(newBtn, actionBtn);
        newBtn.addEventListener('click', () => {
            this.closeConfirmDialog();
            onConfirm();
        });

        overlay.classList.add('open');
    },

    closeConfirmDialog() {
        document.getElementById('settingsConfirmOverlay')?.classList.remove('open');
    },

    // ========================================
    // Helpers
    // ========================================

    showSaved(elementId) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.classList.add('visible');
        setTimeout(() => el.classList.remove('visible'), 1500);
    },

    showSuccessMessage(message) {
        // Remove any existing toast
        document.querySelector('.settings-toast')?.remove();

        const toast = document.createElement('div');
        toast.className = 'settings-toast';
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => toast.classList.add('visible'));

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('visible');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    },

    refreshUI() {
        // Refresh XP bar (shows profile name/avatar)
        if (typeof GamificationUI !== 'undefined') {
            GamificationUI.renderXPBar('xpBarContainer');
        }
        // Refresh header profile indicator
        if (typeof ProgressDashboard !== 'undefined') {
            ProgressDashboard.updateProfileIndicator();
            ProgressDashboard.refresh();
        }
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ========================================
    // Initialization (bind events)
    // ========================================

    init() {
        // Settings button
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.open());

        // Close button
        document.getElementById('closeSettings')?.addEventListener('click', () => this.close());

        // Click outside to close
        document.getElementById('settingsModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') this.close();
        });

        // Confirm dialog cancel
        document.getElementById('confirmCancelBtn')?.addEventListener('click', () => this.closeConfirmDialog());

        // Click outside confirm dialog to close
        document.getElementById('settingsConfirmOverlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'settingsConfirmOverlay') this.closeConfirmDialog();
        });

        // Sync year on load
        if (ProgressStore.currentProfileId) {
            this.syncYearToUI();
        }
    }
};

// Make available globally
window.Settings = Settings;
