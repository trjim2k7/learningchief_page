/**
 * LearningChief - Worksheet Renderer
 * Renders professional-looking worksheet pages
 */

const WorksheetRenderer = {
    currentWorksheets: [],
    showingSolutions: false,

    render(worksheets, container) {
        this.currentWorksheets = worksheets;
        container.innerHTML = '';

        worksheets.forEach((worksheet, pageIndex) => {
            const page = this.createPage(worksheet, pageIndex + 1, worksheets.length);
            container.appendChild(page);
        });
    },

    createPage(worksheet, pageNum, totalPages) {
        const page = document.createElement('div');
        page.className = 'worksheet-page';
        page.innerHTML = `
            ${this.createHeader(worksheet)}
            ${this.createStudentInfo()}
            <div class="questions-container">
                ${worksheet.questions.map((q, i) => this.createQuestion(q, i + 1)).join('')}
            </div>
            ${this.createFooter(pageNum, totalPages)}
        `;
        return page;
    },

    createHeader(worksheet) {
        const subjectName = worksheet.subject === 'math' ? 'Mathematics' : 'English';
        const titles = {
            math: ['Practice Problems', 'Speed Math', 'Math Challenge', 'Number Skills', 'Math Workout'],
            english: ['Language Skills', 'Reading & Writing', 'English Practice', 'Word Work', 'Grammar Challenge']
        };
        const titleList = titles[worksheet.subject] || titles.math;
        const worksheetTitle = worksheet.topic || titleList[Math.floor(Math.random() * titleList.length)];
        const subtitle = `${subjectName} • Year ${worksheet.year} • ${worksheet.difficulty.charAt(0).toUpperCase() + worksheet.difficulty.slice(1)}`;

        return `
            <div class="worksheet-header">
                <div class="worksheet-branding">
                    <span class="worksheet-brand-text">LearningChief</span>
                </div>
            </div>
            <div class="worksheet-title-section">
                <h2 class="worksheet-title">${worksheetTitle}</h2>
                <p class="worksheet-subtitle">${subtitle}</p>
            </div>
        `;
    },


    createStudentInfo() {
        return `
            <div class="student-info">
                <div class="student-field">
                    <label>Name:</label>
                    <div class="line"></div>
                </div>
                <div class="student-field">
                    <label>Date:</label>
                    <div class="line date-line"></div>
                </div>
                <div class="student-field">
                    <label>Score:</label>
                    <div class="line date-line"></div>
                </div>
            </div>
        `;
    },

    createQuestion(question, number) {
        const revisionClass = question.isRevision ? 'revision' : '';
        return `
            <div class="question-item ${revisionClass}" data-question-index="${number - 1}">
                <div class="question-number">${number}</div>
                <div class="question-content">
                    <div class="question-text">${this.formatQuestionText(question.question)}</div>
                    ${question.visual ? this.createVisual(question) : ''}
                    ${this.createAnswerArea(question)}
                    ${this.createSolution(question)}
                </div>
            </div>
        `;
    },

    formatQuestionText(text) {
        return text.replace(/\n/g, '<br>').replace(/☐/g, '<span class="box">☐</span>');
    },

    createVisual(question) {
        const { visual, visualData } = question;

        // If visual is a raw SVG string (starts with '<'), render it directly
        if (typeof visual === 'string' && visual.trim().startsWith('<')) {
            return `<div class="question-visual">${visual}</div>`;
        }

        switch (visual) {
            case 'shape':
                return `<div class="question-visual">${this.getShapeSVG(visualData.shape)}</div>`;
            case 'clock':
                return `<div class="question-visual">${this.getClockSVG(visualData.hour, visualData.minutes)}</div>`;
            case 'number-line':
                return `<div class="question-visual">${this.getNumberLine(visualData)}</div>`;
            case 'cuboid':
                return `<div class="question-visual">${this.getCuboidSVG(visualData)}</div>`;
            case 'shape-measurements':
                return `<div class="question-visual">${this.getShapeWithMeasurements(visualData)}</div>`;
            case 'fraction-bar':
                return `<div class="question-visual">${this.getFractionBar(visualData)}</div>`;
            case 'number-bond':
                return `<div class="question-visual">${this.getNumberBond(visualData)}</div>`;
            case 'number-boxes':
                return `<div class="question-visual">${this.getNumberBoxes(visualData)}</div>`;
            case 'coins':
                return `<div class="question-visual">${this.getCoinsVisual(visualData)}</div>`;
            case 'pie-chart':
                return `<div class="question-visual">${this.getPieChart(visualData)}</div>`;
            case 'shape-3d-measurements':
                return `<div class="question-visual">${this.get3DShapeWithMeasurements(visualData)}</div>`;
            default:
                return '';
        }
    },

    getShapeSVG(shapeName) {
        const shapes = {
            // 2D Shapes
            circle: '<svg class="shape-svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#E3F2FD" stroke="#1976D2" stroke-width="3"/></svg>',
            triangle: '<svg class="shape-svg" viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="#FFF3E0" stroke="#E65100" stroke-width="3"/></svg>',
            square: '<svg class="shape-svg" viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" fill="#E8F5E9" stroke="#388E3C" stroke-width="3"/></svg>',
            rectangle: '<svg class="shape-svg" viewBox="0 0 100 100"><rect x="10" y="25" width="80" height="50" fill="#FCE4EC" stroke="#C2185B" stroke-width="3"/></svg>',
            pentagon: '<svg class="shape-svg" viewBox="0 0 100 100"><polygon points="50,10 95,40 80,90 20,90 5,40" fill="#F3E5F5" stroke="#7B1FA2" stroke-width="3"/></svg>',
            hexagon: '<svg class="shape-svg" viewBox="0 0 100 100"><polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#FFFDE7" stroke="#FBC02D" stroke-width="3"/></svg>',
            rhombus: '<svg class="shape-svg" viewBox="0 0 100 100"><polygon points="50,10 90,50 50,90 10,50" fill="#E0F7FA" stroke="#00ACC1" stroke-width="3"/></svg>',
            parallelogram: '<svg class="shape-svg" viewBox="0 0 100 100"><polygon points="25,20 95,20 75,80 5,80" fill="#FBE9E7" stroke="#E64A19" stroke-width="3"/></svg>',
            trapezoid: '<svg class="shape-svg" viewBox="0 0 100 100"><polygon points="30,20 70,20 90,80 10,80" fill="#F1F8E9" stroke="#7CB342" stroke-width="3"/></svg>',
            oval: '<svg class="shape-svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="42" ry="28" fill="#E8EAF6" stroke="#3F51B5" stroke-width="3"/></svg>',
            octagon: '<svg class="shape-svg" viewBox="0 0 100 100"><polygon points="30,10 70,10 95,30 95,70 70,90 30,90 5,70 5,30" fill="#FFEBEE" stroke="#E53935" stroke-width="3"/></svg>',
            star: '<svg class="shape-svg" viewBox="0 0 100 100"><polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35" fill="#FFF8E1" stroke="#FFB300" stroke-width="3"/></svg>',
            semicircle: '<svg class="shape-svg" viewBox="0 0 100 100"><path d="M 10 60 A 40 40 0 0 1 90 60 L 10 60" fill="#E0F2F1" stroke="#00897B" stroke-width="3"/></svg>',

            // 3D Shapes
            cube: `<svg class="shape-svg" viewBox="0 0 100 100">
                <polygon points="20,30 50,15 80,30 80,70 50,85 20,70" fill="#90CAF9" stroke="#1565C0" stroke-width="2"/>
                <polygon points="20,30 50,45 50,85 20,70" fill="#64B5F6" stroke="#1565C0" stroke-width="2"/>
                <polygon points="50,45 80,30 80,70 50,85" fill="#42A5F5" stroke="#1565C0" stroke-width="2"/>
                <polygon points="20,30 50,15 80,30 50,45" fill="#BBDEFB" stroke="#1565C0" stroke-width="2"/>
            </svg>`,
            cuboid: `<svg class="shape-svg" viewBox="0 0 120 100">
                <polygon points="10,35 40,20 110,20 80,35 80,80 10,80" fill="#90CAF9" stroke="#1565C0" stroke-width="2"/>
                <rect x="10" y="35" width="70" height="45" fill="#64B5F6" stroke="#1565C0" stroke-width="2"/>
                <polygon points="10,35 40,20 110,20 80,35" fill="#BBDEFB" stroke="#1565C0" stroke-width="2"/>
                <polygon points="80,35 110,20 110,65 80,80" fill="#42A5F5" stroke="#1565C0" stroke-width="2"/>
            </svg>`,
            cylinder: `<svg class="shape-svg" viewBox="0 0 100 100">
                <ellipse cx="50" cy="75" rx="35" ry="12" fill="#A5D6A7" stroke="#388E3C" stroke-width="2"/>
                <rect x="15" y="25" width="70" height="50" fill="#C8E6C9" stroke="none"/>
                <line x1="15" y1="25" x2="15" y2="75" stroke="#388E3C" stroke-width="2"/>
                <line x1="85" y1="25" x2="85" y2="75" stroke="#388E3C" stroke-width="2"/>
                <ellipse cx="50" cy="25" rx="35" ry="12" fill="#E8F5E9" stroke="#388E3C" stroke-width="2"/>
            </svg>`,
            cone: `<svg class="shape-svg" viewBox="0 0 100 100">
                <ellipse cx="50" cy="80" rx="35" ry="10" fill="#FFCC80" stroke="#E65100" stroke-width="2"/>
                <polygon points="50,15 15,80 85,80" fill="#FFE0B2" stroke="#E65100" stroke-width="2"/>
            </svg>`,
            sphere: `<svg class="shape-svg" viewBox="0 0 100 100">
                <defs>
                    <radialGradient id="sphereGrad" cx="35%" cy="35%">
                        <stop offset="0%" style="stop-color:#E1BEE7;stop-opacity:1"/>
                        <stop offset="100%" style="stop-color:#9C27B0;stop-opacity:1"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="40" fill="url(#sphereGrad)" stroke="#7B1FA2" stroke-width="2"/>
                <ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="#7B1FA2" stroke-width="1" stroke-dasharray="4,3"/>
            </svg>`,
            pyramid: `<svg class="shape-svg" viewBox="0 0 100 100">
                <polygon points="50,10 15,85 50,70 85,85" fill="#FFECB3" stroke="#FF8F00" stroke-width="2"/>
                <polygon points="15,85 50,70 85,85" fill="#FFE082" stroke="#FF8F00" stroke-width="2"/>
                <polygon points="50,10 50,70 85,85" fill="#FFCA28" stroke="#FF8F00" stroke-width="2"/>
            </svg>`,
            triangularPrism: `<svg class="shape-svg" viewBox="0 0 120 100">
                <polygon points="20,80 50,25 80,80" fill="#80DEEA" stroke="#00838F" stroke-width="2"/>
                <polygon points="80,80 110,65 110,25 50,25" fill="#4DD0E1" stroke="#00838F" stroke-width="2"/>
                <polygon points="50,25 110,25 80,80" fill="#B2EBF2" stroke="#00838F" stroke-width="2"/>
                <line x1="80" y1="80" x2="110" y2="65" stroke="#00838F" stroke-width="2"/>
            </svg>`
        };
        return shapes[shapeName] || shapes.circle;
    },

    getCuboidSVG(data) {
        const { length, width, height } = data || { length: 5, width: 3, height: 4 };
        // Simple clean 3D box with clear labels
        return `
            <svg viewBox="0 0 200 160" style="width:180px;height:145px;display:block;margin:10px auto;">
                <!-- Front face -->
                <rect x="20" y="50" width="100" height="80" fill="#90CAF9" stroke="#1565C0" stroke-width="2"/>
                <!-- Top face -->
                <polygon points="20,50 50,25 150,25 120,50" fill="#BBDEFB" stroke="#1565C0" stroke-width="2"/>
                <!-- Side face -->
                <polygon points="120,50 150,25 150,105 120,130" fill="#64B5F6" stroke="#1565C0" stroke-width="2"/>
                
                <!-- Labels with backgrounds for clarity -->
                <rect x="55" y="138" width="35" height="16" fill="white" rx="2"/>
                <text x="72" y="150" font-size="11" text-anchor="middle" font-weight="bold" fill="#1565C0">${length}cm</text>
                
                <rect x="155" y="60" width="35" height="16" fill="white" rx="2"/>
                <text x="172" y="72" font-size="11" text-anchor="middle" font-weight="bold" fill="#1565C0">${height}cm</text>
                
                <rect x="130" y="8" width="35" height="16" fill="white" rx="2"/>
                <text x="147" y="20" font-size="11" text-anchor="middle" font-weight="bold" fill="#1565C0">${width}cm</text>
            </svg>
        `;
    },

    getShapeWithMeasurements(data) {
        const { shape, length, width, side } = data || {};
        if (shape === 'square') {
            return `
                <svg viewBox="0 0 150 150" style="width:150px;height:150px">
                    <rect x="25" y="25" width="100" height="100" fill="#E8F5E9" stroke="#388E3C" stroke-width="3"/>
                    <text x="75" y="145" font-size="12" text-anchor="middle" fill="#333">${side}cm</text>
                    <line x1="25" y1="135" x2="125" y2="135" stroke="#666" stroke-width="1"/>
                    <line x1="25" y1="130" x2="25" y2="140" stroke="#666" stroke-width="1"/>
                    <line x1="125" y1="130" x2="125" y2="140" stroke="#666" stroke-width="1"/>
                </svg>
            `;
        } else {
            return `
                <svg viewBox="0 0 210 130" style="width:210px;height:130px">
                    <rect x="20" y="20" width="140" height="70" fill="#FCE4EC" stroke="#C2185B" stroke-width="3"/>
                    <text x="90" y="115" font-size="12" text-anchor="middle" fill="#333">${length}cm</text>
                    <line x1="20" y1="100" x2="160" y2="100" stroke="#666" stroke-width="1"/>
                    <line x1="20" y1="95" x2="20" y2="105" stroke="#666" stroke-width="1"/>
                    <line x1="160" y1="95" x2="160" y2="105" stroke="#666" stroke-width="1"/>
                    
                    <text x="185" y="60" font-size="12" text-anchor="middle" fill="#333">${width}cm</text>
                    <line x1="170" y1="20" x2="170" y2="90" stroke="#666" stroke-width="1"/>
                    <line x1="165" y1="20" x2="175" y2="20" stroke="#666" stroke-width="1"/>
                    <line x1="165" y1="90" x2="175" y2="90" stroke="#666" stroke-width="1"/>
                </svg>
            `;
        }
    },

    // 3D shapes with dimension labels for volume questions
    get3DShapeWithMeasurements(data) {
        const { shape, side, length, width, height, radius } = data || {};

        if (shape === 'cube') {
            return `
                <svg viewBox="0 0 200 180" style="width:200px;height:180px">
                    <!-- Cube faces -->
                    <polygon points="50,55 100,30 150,55 150,115 100,140 50,115" fill="#90CAF9" stroke="#1565C0" stroke-width="2"/>
                    <polygon points="50,55 100,80 100,140 50,115" fill="#64B5F6" stroke="#1565C0" stroke-width="2"/>
                    <polygon points="100,80 150,55 150,115 100,140" fill="#42A5F5" stroke="#1565C0" stroke-width="2"/>
                    <polygon points="50,55 100,30 150,55 100,80" fill="#BBDEFB" stroke="#1565C0" stroke-width="2"/>
                    
                    <!-- Bottom dimension with arrows -->
                    <line x1="50" y1="155" x2="150" y2="155" stroke="#333" stroke-width="1"/>
                    <line x1="50" y1="150" x2="50" y2="160" stroke="#333" stroke-width="1"/>
                    <line x1="150" y1="150" x2="150" y2="160" stroke="#333" stroke-width="1"/>
                    <polygon points="50,155 58,152 58,158" fill="#333"/>
                    <polygon points="150,155 142,152 142,158" fill="#333"/>
                    <text x="100" y="173" font-size="13" font-weight="500" text-anchor="middle" fill="#333">${side}cm</text>
                    
                    <!-- Right height dimension with arrows -->
                    <line x1="165" y1="55" x2="165" y2="115" stroke="#333" stroke-width="1"/>
                    <line x1="160" y1="55" x2="170" y2="55" stroke="#333" stroke-width="1"/>
                    <line x1="160" y1="115" x2="170" y2="115" stroke="#333" stroke-width="1"/>
                    <polygon points="165,55 162,63 168,63" fill="#333"/>
                    <polygon points="165,115 162,107 168,107" fill="#333"/>
                    <text x="183" y="90" font-size="13" font-weight="500" fill="#333">${side}cm</text>
                </svg>
            `;
        } else if (shape === 'cuboid') {
            return `
                <svg viewBox="0 0 240 190" style="width:240px;height:190px">
                    <!-- Cuboid faces -->
                    <polygon points="30,70 70,45 190,45 150,70 150,140 30,140" fill="#90CAF9" stroke="#1565C0" stroke-width="2"/>
                    <rect x="30" y="70" width="120" height="70" fill="#64B5F6" stroke="#1565C0" stroke-width="2"/>
                    <polygon points="30,70 70,45 190,45 150,70" fill="#BBDEFB" stroke="#1565C0" stroke-width="2"/>
                    <polygon points="150,70 190,45 190,115 150,140" fill="#42A5F5" stroke="#1565C0" stroke-width="2"/>
                    
                    <!-- Length label (bottom) with arrows -->
                    <line x1="30" y1="155" x2="150" y2="155" stroke="#333" stroke-width="1"/>
                    <line x1="30" y1="150" x2="30" y2="160" stroke="#333" stroke-width="1"/>
                    <line x1="150" y1="150" x2="150" y2="160" stroke="#333" stroke-width="1"/>
                    <polygon points="30,155 38,152 38,158" fill="#333"/>
                    <polygon points="150,155 142,152 142,158" fill="#333"/>
                    <text x="90" y="175" font-size="13" font-weight="500" text-anchor="middle" fill="#333">${length}cm</text>
                    
                    <!-- Height label (right side) with arrows -->
                    <line x1="200" y1="70" x2="200" y2="140" stroke="#333" stroke-width="1"/>
                    <line x1="195" y1="70" x2="205" y2="70" stroke="#333" stroke-width="1"/>
                    <line x1="195" y1="140" x2="205" y2="140" stroke="#333" stroke-width="1"/>
                    <polygon points="200,70 197,78 203,78" fill="#333"/>
                    <polygon points="200,140 197,132 203,132" fill="#333"/>
                    <text x="218" y="110" font-size="13" font-weight="500" fill="#333">${height}cm</text>
                    
                    <!-- Width label (top edge) with arrows -->
                    <line x1="155" y1="35" x2="195" y2="35" stroke="#333" stroke-width="1"/>
                    <line x1="155" y1="30" x2="155" y2="40" stroke="#333" stroke-width="1"/>
                    <line x1="195" y1="30" x2="195" y2="40" stroke="#333" stroke-width="1"/>
                    <polygon points="155,35 163,32 163,38" fill="#333"/>
                    <polygon points="195,35 187,32 187,38" fill="#333"/>
                    <text x="175" y="22" font-size="13" font-weight="500" text-anchor="middle" fill="#333">${width}cm</text>
                </svg>
            `;
        } else if (shape === 'cylinder') {
            return `
                <svg viewBox="0 0 180 180" style="width:180px;height:180px">
                    <!-- Cylinder body -->
                    <ellipse cx="90" cy="130" rx="50" ry="15" fill="#A5D6A7" stroke="#388E3C" stroke-width="2"/>
                    <rect x="40" y="50" width="100" height="80" fill="#C8E6C9" stroke="none"/>
                    <line x1="40" y1="50" x2="40" y2="130" stroke="#388E3C" stroke-width="2"/>
                    <line x1="140" y1="50" x2="140" y2="130" stroke="#388E3C" stroke-width="2"/>
                    <ellipse cx="90" cy="50" rx="50" ry="15" fill="#E8F5E9" stroke="#388E3C" stroke-width="2"/>
                    
                    <!-- Radius label -->
                    <text x="115" y="45" font-size="11" fill="#333">r=${radius}cm</text>
                    <line x1="90" y1="50" x2="140" y2="50" stroke="#666" stroke-width="1" stroke-dasharray="3,2"/>
                    
                    <!-- Height label -->
                    <text x="165" y="95" font-size="11" fill="#333">${height}cm</text>
                    <line x1="155" y1="50" x2="155" y2="130" stroke="#666" stroke-width="1"/>
                    <line x1="150" y1="50" x2="160" y2="50" stroke="#666" stroke-width="1"/>
                    <line x1="150" y1="130" x2="160" y2="130" stroke="#666" stroke-width="1"/>
                </svg>
            `;
        }
        // Fallback
        return '';
    },

    getFractionBar(data) {
        const { total, parts, shaded } = data || { total: 8, parts: 4, shaded: 2 };
        const partWidth = 200 / parts;
        return `
            <svg viewBox="0 0 220 50" style="width:220px;height:50px">
                ${Array.from({ length: parts }, (_, i) => `
                    <rect x="${10 + i * partWidth}" y="10" width="${partWidth}" height="30" 
                        fill="${i < shaded ? '#FFD93D' : '#f5f5f5'}" stroke="#333" stroke-width="2"/>
                `).join('')}
            </svg>
        `;
    },

    getNumberBond(data) {
        const { total, known, position } = data || { total: 10, known: 4, position: 'first' };
        const unknown = total - known;
        return `
            <svg viewBox="0 0 150 100" style="width:150px;height:100px">
                <circle cx="75" cy="20" r="18" fill="#FFD93D" stroke="#333" stroke-width="2"/>
                <text x="75" y="25" font-size="14" text-anchor="middle" fill="#333">${total}</text>
                <line x1="60" y1="35" x2="40" y2="60" stroke="#333" stroke-width="2"/>
                <line x1="90" y1="35" x2="110" y2="60" stroke="#333" stroke-width="2"/>
                <circle cx="40" cy="75" r="18" fill="${position === 'first' ? '#f5f5f5' : '#90CAF9'}" stroke="#333" stroke-width="2"/>
                <text x="40" y="80" font-size="14" text-anchor="middle" fill="#333">${position === 'first' ? '?' : known}</text>
                <circle cx="110" cy="75" r="18" fill="${position === 'second' ? '#f5f5f5' : '#90CAF9'}" stroke="#333" stroke-width="2"/>
                <text x="110" y="80" font-size="14" text-anchor="middle" fill="#333">${position === 'second' ? '?' : known}</text>
            </svg>
        `;
    },

    getNumberBoxes(data) {
        const { count } = data || { count: 5 };
        return `
            <div style="display:flex;gap:8px;justify-content:center;margin:10px 0;">
                ${Array.from({ length: count }, () => `
                    <div style="width:40px;height:40px;border:2px solid #333;border-radius:4px;"></div>
                `).join('')}
            </div>
        `;
    },

    getCoinsVisual(data) {
        const { coins } = data || { coins: [10, 5, 2] };
        const coinColors = { 1: '#CD7F32', 2: '#CD7F32', 5: '#C0C0C0', 10: '#C0C0C0', 20: '#C0C0C0', 50: '#C0C0C0', 100: '#FFD700', 200: '#FFD700' };
        return `
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0;">
                ${coins.map(c => `
                    <div style="width:${c >= 50 ? 45 : 35}px;height:${c >= 50 ? 45 : 35}px;border-radius:50%;background:${coinColors[c] || '#C0C0C0'};border:2px solid #666;display:flex;align-items:center;justify-content:center;font-size:${c >= 100 ? 10 : 12}px;font-weight:bold;color:#333;">
                        ${c >= 100 ? '£' + (c / 100) : c + 'p'}
                    </div>
                `).join('')}
            </div>
        `;
    },

    getPieChart(data) {
        const { categories, values, total } = data || { categories: ['A', 'B'], values: [5, 5], total: 10 };
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        let currentAngle = 0;

        return `
            <svg viewBox="0 0 150 150" style="width:150px;height:150px">
                ${values.map((v, i) => {
            const angle = (v / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            const largeArc = angle > 180 ? 1 : 0;
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (currentAngle - 90) * Math.PI / 180;
            const x1 = 75 + 50 * Math.cos(startRad);
            const y1 = 75 + 50 * Math.sin(startRad);
            const x2 = 75 + 50 * Math.cos(endRad);
            const y2 = 75 + 50 * Math.sin(endRad);
            return `<path d="M75,75 L${x1},${y1} A50,50 0 ${largeArc},1 ${x2},${y2} Z" fill="${colors[i % colors.length]}" stroke="#fff" stroke-width="2"/>`;
        }).join('')}
                <circle cx="75" cy="75" r="50" fill="none" stroke="#333" stroke-width="2"/>
            </svg>
        `;
    },

    getClockSVG(hour, minutes) {
        const hourAngle = (hour % 12 + minutes / 60) * 30 - 90;
        const minuteAngle = minutes * 6 - 90;
        const hourX = 50 + 25 * Math.cos(hourAngle * Math.PI / 180);
        const hourY = 50 + 25 * Math.sin(hourAngle * Math.PI / 180);
        const minX = 50 + 35 * Math.cos(minuteAngle * Math.PI / 180);
        const minY = 50 + 35 * Math.sin(minuteAngle * Math.PI / 180);

        return `
            <svg class="shape-svg" viewBox="0 0 100 100" style="width:120px;height:120px">
                <circle cx="50" cy="50" r="45" fill="white" stroke="#333" stroke-width="3"/>
                ${[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 35 * Math.sin(angle);
            return `<text x="${x}" y="${y}" font-size="10" text-anchor="middle" dominant-baseline="middle">${n === 12 ? 12 : n}</text>`;
        }).join('')}
                <line x1="50" y1="50" x2="${hourX}" y2="${hourY}" stroke="#333" stroke-width="4" stroke-linecap="round"/>
                <line x1="50" y1="50" x2="${minX}" y2="${minY}" stroke="#333" stroke-width="2" stroke-linecap="round"/>
                <circle cx="50" cy="50" r="3" fill="#333"/>
            </svg>
        `;
    },

    getNumberLine(data) {
        return `<div class="number-line">${Array.from({ length: 11 }, (_, i) =>
            `<div class="number-line-mark"><span class="number-line-value">${i}</span></div>`
        ).join('')}</div>`;
    },

    createAnswerArea(question) {
        if (question.choices) {
            return `
                <div class="multiple-choice">
                    ${question.choices.map((choice, i) => `
                        <div class="choice-option">
                            <span class="choice-letter">${String.fromCharCode(65 + i)}</span>
                            <span class="choice-text">${choice}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (question.inputType === 'text' || question.inputType === 'sequence') {
            return `
                <div class="answer-box">
                    <span class="answer-label">Answer:</span>
                    <div class="answer-line extra-wide">&nbsp;</div>
                </div>
            `;
        }

        return `
            <div class="answer-box">
                <span class="answer-label">Answer:</span>
                <div class="answer-line">&nbsp;</div>
            </div>
        `;
    },

    createSolution(question) {
        return `
            <div class="solution-container">
                <div class="solution-label">✓ Solution</div>
                <div class="solution-text">${question.answer}</div>
                ${question.explanation ? `<div class="solution-explanation">${question.explanation}</div>` : ''}
            </div>
        `;
    },

    createFooter(pageNum, totalPages) {
        const year = new Date().getFullYear();
        return `
            <div class="worksheet-footer">
                <span class="footer-copyright">© ${year} LearningChief | learningchief.com | Page ${pageNum} of ${totalPages}</span>
            </div>
        `;
    },



    toggleSolutions(show) {
        this.showingSolutions = show;
        const container = document.getElementById('worksheetsContainer');
        if (show) {
            container.classList.add('show-solutions');
        } else {
            container.classList.remove('show-solutions');
        }
    }
};

window.WorksheetRenderer = WorksheetRenderer;
