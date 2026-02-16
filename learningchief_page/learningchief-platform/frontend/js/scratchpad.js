/**
 * LearningChief - Scratchpad Module
 * Full-screen drawing canvas with notepad styling for working out calculations
 */

const Scratchpad = {
    canvas: null,
    ctx: null,
    isOpen: false,
    isDrawing: false,
    currentQuestionIndex: -1,
    currentQuestionText: '',

    // Drawing state
    tool: 'pen',       // 'pen' | 'eraser'
    penColor: '#1a1a2e',
    penSize: 3,
    eraserSize: 30,

    // Stroke data
    currentStroke: [],
    strokes: [],       // All strokes for current pad
    undoneStrokes: [],  // Redo stack

    // Per-question canvas state (ImageData snapshots)
    savedStates: {},

    // Pointer tracking
    lastPoint: null,

    // ===========================================
    // Initialization
    // ===========================================

    init() {
        this.canvas = document.getElementById('scratchpadCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.generateSpiralRings();
        this.bindEvents();
    },

    generateSpiralRings() {
        const container = document.getElementById('spiralRings');
        if (!container) return;
        container.innerHTML = '';

        // Generate rings evenly spaced
        const ringCount = 20;
        for (let i = 0; i < ringCount; i++) {
            const ring = document.createElement('div');
            ring.className = 'sp-spiral-ring';
            ring.style.top = `${40 + i * 50}px`;
            container.appendChild(ring);
        }
    },

    bindEvents() {
        const overlay = document.getElementById('scratchpadOverlay');
        if (!overlay) return;

        // Close button
        document.getElementById('scratchpadClose')?.addEventListener('click', () => this.close());

        // Tool buttons
        document.getElementById('scratchpadPen')?.addEventListener('click', () => this.setTool('pen'));
        document.getElementById('scratchpadEraser')?.addEventListener('click', () => this.setTool('eraser'));
        document.getElementById('scratchpadUndo')?.addEventListener('click', () => this.undo());
        document.getElementById('scratchpadRedo')?.addEventListener('click', () => this.redo());
        document.getElementById('scratchpadClear')?.addEventListener('click', () => this.clearAll());

        // Color buttons
        document.querySelectorAll('.sp-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.penColor = btn.dataset.color;
                this.setTool('pen');
                document.querySelectorAll('.sp-color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Size slider
        document.getElementById('scratchpadSize')?.addEventListener('input', (e) => {
            this.penSize = parseInt(e.target.value);
        });

        // Canvas pointer events (works for both touch and mouse)
        this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
        this.canvas.addEventListener('pointerup', (e) => this.onPointerUp(e));
        this.canvas.addEventListener('pointerleave', (e) => this.onPointerUp(e));
        this.canvas.addEventListener('pointercancel', (e) => this.onPointerUp(e));

        // Prevent scrolling while drawing on touch devices
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            if (e.key === 'Escape') this.close();
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); this.undo(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); this.redo(); }
        });
    },

    // ===========================================
    // Open / Close
    // ===========================================

    open(questionIndex, questionText) {
        this.currentQuestionIndex = questionIndex;
        this.currentQuestionText = questionText;
        this.isOpen = true;

        // Set question text in banner
        const banner = document.getElementById('scratchpadQuestion');
        if (banner) {
            banner.innerHTML = `<span class="sp-q-number">Q${questionIndex + 1}</span> ${questionText.replace(/\n/g, ' ')}`;
        }

        // Show overlay
        const overlay = document.getElementById('scratchpadOverlay');
        overlay.classList.add('open');

        // Resize canvas to fit
        this.resizeCanvas();

        // Restore saved state if exists
        if (this.savedStates[questionIndex]) {
            this.restoreState(questionIndex);
        } else {
            this.drawNotepadBackground();
        }

        // Reset tool UI
        this.setTool('pen');

        // Pause timer if active
        if (typeof WorksheetTimer !== 'undefined') {
            WorksheetTimer.pause();
        }
    },

    close() {
        if (!this.isOpen) return;

        // Save current canvas state
        this.saveState(this.currentQuestionIndex);

        this.isOpen = false;
        document.getElementById('scratchpadOverlay')?.classList.remove('open');

        // Resume timer
        if (typeof WorksheetTimer !== 'undefined') {
            WorksheetTimer.resume();
        }
    },

    // ===========================================
    // Canvas Setup
    // ===========================================

    resizeCanvas() {
        const container = document.getElementById('scratchpadCanvasWrap');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        this.ctx.scale(dpr, dpr);
        this.drawNotepadBackground();
    },

    drawNotepadBackground() {
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);

        // Paper background
        this.ctx.fillStyle = '#fdf6e3';
        this.ctx.fillRect(0, 0, w, h);

        // Ruled lines
        this.ctx.strokeStyle = '#c8dbbe';
        this.ctx.lineWidth = 0.5;
        const lineSpacing = 32;
        const startY = 20;

        for (let y = startY; y < h; y += lineSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(w, y);
            this.ctx.stroke();
        }

        // Left margin line (red)
        this.ctx.strokeStyle = '#e8a0a0';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(60, 0);
        this.ctx.lineTo(60, h);
        this.ctx.stroke();

        // Binder holes
        const holePositions = [80, h / 2 - 40, h / 2 + 40, h - 80];
        this.ctx.fillStyle = '#d4c5a9';
        holePositions.forEach(y => {
            this.ctx.beginPath();
            this.ctx.arc(18, y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            // Hole shadow
            this.ctx.strokeStyle = '#c0b18f';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    },

    // ===========================================
    // Drawing
    // ===========================================

    getCanvasPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            pressure: e.pressure || 0.5
        };
    },

    onPointerDown(e) {
        e.preventDefault();
        this.isDrawing = true;
        this.canvas.setPointerCapture(e.pointerId);

        const point = this.getCanvasPoint(e);
        this.lastPoint = point;
        this.currentStroke = [point];

        // Configure drawing context
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        if (this.tool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineWidth = this.eraserSize;
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.penColor;
            this.ctx.lineWidth = this.penSize * (0.5 + point.pressure);
        }

        // Draw a dot at the starting point (for single clicks)
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, (this.tool === 'eraser' ? this.eraserSize : this.ctx.lineWidth) / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.tool === 'eraser' ? '#000' : this.penColor;
        this.ctx.fill();

        // Begin the continuous stroke path
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
    },

    onPointerMove(e) {
        if (!this.isDrawing) return;
        e.preventDefault();

        const point = this.getCanvasPoint(e);
        this.currentStroke.push(point);

        if (this.lastPoint) {
            // Calculate midpoint for smooth Bézier drawing
            const midX = (this.lastPoint.x + point.x) / 2;
            const midY = (this.lastPoint.y + point.y) / 2;

            // Draw continuous line segment using quadraticCurveTo
            this.ctx.quadraticCurveTo(this.lastPoint.x, this.lastPoint.y, midX, midY);
            this.ctx.stroke();

            // Continue the path from where we left off (keeps it continuous)
            this.ctx.beginPath();
            this.ctx.moveTo(midX, midY);
        }

        this.lastPoint = point;
    },

    onPointerUp(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        // Draw final segment to the last point
        if (this.lastPoint && this.currentStroke.length > 1) {
            this.ctx.lineTo(this.lastPoint.x, this.lastPoint.y);
            this.ctx.stroke();
        }

        this.lastPoint = null;

        // Save stroke for undo
        if (this.currentStroke.length > 0) {
            this.strokes.push({
                tool: this.tool,
                color: this.penColor,
                size: this.tool === 'eraser' ? this.eraserSize : this.penSize,
                points: [...this.currentStroke]
            });
            this.undoneStrokes = []; // Clear redo stack on new stroke
            this.currentStroke = [];
        }

        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
    },

    // ===========================================
    // Tools
    // ===========================================

    setTool(tool) {
        this.tool = tool;

        // Update UI
        document.getElementById('scratchpadPen')?.classList.toggle('active', tool === 'pen');
        document.getElementById('scratchpadEraser')?.classList.toggle('active', tool === 'eraser');

        // Change cursor
        if (this.canvas) {
            this.canvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
        }
    },

    undo() {
        if (this.strokes.length === 0) return;

        const undone = this.strokes.pop();
        this.undoneStrokes.push(undone);
        this.redrawAll();
    },

    redo() {
        if (this.undoneStrokes.length === 0) return;

        const stroke = this.undoneStrokes.pop();
        this.strokes.push(stroke);
        this.redrawAll();
    },

    clearAll() {
        // Save current strokes for undo
        if (this.strokes.length > 0) {
            this.undoneStrokes.push(...this.strokes);
            this.strokes = [];
        }
        this.drawNotepadBackground();
    },

    redrawAll() {
        this.drawNotepadBackground();

        this.strokes.forEach(stroke => {
            if (stroke.points.length === 0) return;

            this.ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
            this.ctx.strokeStyle = stroke.color;
            this.ctx.lineWidth = stroke.size;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            const first = stroke.points[0];

            // Draw starting dot
            this.ctx.beginPath();
            this.ctx.arc(first.x, first.y, stroke.size / 2, 0, Math.PI * 2);
            this.ctx.fillStyle = stroke.tool === 'eraser' ? '#000' : stroke.color;
            this.ctx.fill();

            if (stroke.points.length < 2) return;

            // Draw continuous path through all points
            this.ctx.beginPath();
            this.ctx.moveTo(first.x, first.y);

            for (let i = 1; i < stroke.points.length; i++) {
                const prev = stroke.points[i - 1];
                const curr = stroke.points[i];
                const midX = (prev.x + curr.x) / 2;
                const midY = (prev.y + curr.y) / 2;

                this.ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
            }

            // Final segment to the last point
            const last = stroke.points[stroke.points.length - 1];
            this.ctx.lineTo(last.x, last.y);
            this.ctx.stroke();
        });

        this.ctx.globalCompositeOperation = 'source-over';
    },

    // ===========================================
    // State Management
    // ===========================================

    saveState(questionIndex) {
        if (questionIndex < 0) return;
        this.savedStates[questionIndex] = {
            imageData: this.canvas.toDataURL(),
            strokes: JSON.parse(JSON.stringify(this.strokes))
        };
    },

    restoreState(questionIndex) {
        const state = this.savedStates[questionIndex];
        if (!state) return;

        this.strokes = JSON.parse(JSON.stringify(state.strokes));

        const img = new Image();
        img.onload = () => {
            const dpr = window.devicePixelRatio || 1;
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.scale(dpr, dpr);
        };
        img.src = state.imageData;
    },

    // Reset all states (when starting new worksheet)
    reset() {
        this.savedStates = {};
        this.strokes = [];
        this.undoneStrokes = [];
        this.currentStroke = [];
        this.currentQuestionIndex = -1;
    }
};

// Init when DOM is ready
document.addEventListener('DOMContentLoaded', () => Scratchpad.init());

window.Scratchpad = Scratchpad;
