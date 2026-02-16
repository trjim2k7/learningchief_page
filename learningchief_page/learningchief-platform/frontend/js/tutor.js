/**
 * LearningChief - Tutor Mode
 * Step-by-step explanations for questions
 */

const TutorMode = {
    isOpen: false,
    currentQuestion: null,
    useAI: false,

    open() {
        this.isOpen = true;
        document.getElementById('tutorPanel').classList.add('open');
        this.showWelcome();
    },

    close() {
        this.isOpen = false;
        document.getElementById('tutorPanel').classList.remove('open');
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    showWelcome() {
        document.getElementById('tutorContent').innerHTML = `
            <div class="tutor-welcome">
                <p>Click on any question to get help understanding it!</p>
                <div class="tutor-mascot">🌟</div>
                <p style="font-size: 0.9em; margin-top: 20px;">
                    I'll explain step by step how to solve each problem.
                </p>
            </div>
        `;
    },

    explainQuestion(question, index) {
        if (!this.isOpen) this.open();

        this.currentQuestion = { question, index };

        const content = document.getElementById('tutorContent');
        content.innerHTML = `
            <div class="tutor-loading">
                <div class="loading-spinner"></div>
                <p>Preparing explanation...</p>
            </div>
        `;

        // Use local explanation or AI
        if (this.useAI) {
            this.getAIExplanation(question);
        } else {
            setTimeout(() => this.showLocalExplanation(question), 500);
        }
    },

    showLocalExplanation(question) {
        const steps = this.generateSteps(question);
        const tip = this.generateTip(question);
        const visual = this.generateVisualDiagram(question);
        const interactiveSection = this.generateInteractiveSection(question);

        document.getElementById('tutorContent').innerHTML = `
            <div class="tutor-explanation">
                <div class="tutor-question">
                    <strong>Question:</strong> ${question.question.replace(/\n/g, ' ')}
                </div>
                
                <div class="tutor-greeting">
                    Let me help you understand this! 😊
                </div>
                
                ${visual ? `
                    <div class="tutor-visual">
                        <h4>🎨 Visual Help:</h4>
                        <div class="visual-diagram">${visual}</div>
                    </div>
                ` : ''}
                
                <div class="tutor-steps">
                    <h4>📝 Step by Step:</h4>
                    ${steps.map((step, i) => `
                        <div class="tutor-step" data-step="${i}">
                            <span class="step-number">${i + 1}</span>
                            <span class="step-text">${step}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${interactiveSection ? `
                    <div class="tutor-interactive">
                        <h4>🎯 Try It Yourself:</h4>
                        ${interactiveSection}
                    </div>
                ` : ''}
                
                <div class="tutor-tip">
                    <h4>💡 Helpful Tip:</h4>
                    <p>${tip}</p>
                </div>
                
                <div class="tutor-encouragement">
                    You can do this! Take your time and try your best! 🌟
                </div>
                
                <div class="tutor-practice">
                    <h4>📚 Practice Idea:</h4>
                    <p>${this.generatePractice(question)}</p>
                </div>
            </div>
        `;

        // Add interactive event listeners
        this.attachInteractiveEvents(question);
    },

    generateVisualDiagram(question) {
        const type = question.type || 'general';
        const questionText = question.question || '';
        const numbers = questionText.match(/\d+/g)?.map(Number) || [];

        if (type === 'multiplication' && numbers.length >= 2) {
            const [a, b] = numbers;
            // For smaller numbers, show array/grid visual
            if (a <= 10 && b <= 10) {
                const rows = Math.min(a, 6);
                const cols = Math.min(b, 8);
                let dots = '';
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        dots += `<circle cx="${20 + c * 25}" cy="${20 + r * 25}" r="8" fill="#4CAF50"/>`;
                    }
                }
                return `
                    <svg viewBox="0 0 ${Math.max(220, cols * 25 + 20)} ${rows * 25 + 30}" class="tutor-svg">
                        ${dots}
                        <text x="${(cols * 25) / 2 + 10}" y="${rows * 25 + 25}" text-anchor="middle" font-size="14" fill="#333">
                            ${rows} rows × ${cols} columns = ${rows * cols}
                        </text>
                    </svg>
                    <p class="visual-caption">${a} × ${b} shown as ${a} groups of ${b}</p>
                `;
            }
        }

        if (type === 'division' && numbers.length >= 2) {
            const [dividend, divisor] = numbers;
            const quotient = Math.floor(dividend / divisor);
            if (dividend <= 30 && divisor <= 6) {
                let groups = '';
                for (let g = 0; g < Math.min(quotient, 5); g++) {
                    let circles = '';
                    for (let i = 0; i < divisor; i++) {
                        circles += `<circle cx="${15 + i * 20}" cy="20" r="7" fill="#2196F3"/>`;
                    }
                    groups += `
                        <g transform="translate(${g * (divisor * 20 + 30)}, 0)">
                            <rect x="0" y="0" width="${divisor * 20 + 10}" height="40" rx="5" fill="#E3F2FD" stroke="#1976D2"/>
                            ${circles}
                        </g>
                    `;
                }
                return `
                    <svg viewBox="0 0 ${Math.min(quotient, 5) * (divisor * 20 + 30)} 60" class="tutor-svg">
                        ${groups}
                    </svg>
                    <p class="visual-caption">${dividend} shared into groups of ${divisor} = ${quotient} groups</p>
                `;
            }
        }

        if (type === 'fractions') {
            const fractionMatch = questionText.match(/(\d+)\/(\d+)/);
            if (fractionMatch) {
                const [_, num, denom] = fractionMatch.map(Number);
                const slices = parseInt(denom) || 4;
                const filled = parseInt(num) || 1;
                let pie = '';
                for (let i = 0; i < slices; i++) {
                    const angle1 = (i * 360 / slices - 90) * Math.PI / 180;
                    const angle2 = ((i + 1) * 360 / slices - 90) * Math.PI / 180;
                    const x1 = 60 + 45 * Math.cos(angle1);
                    const y1 = 60 + 45 * Math.sin(angle1);
                    const x2 = 60 + 45 * Math.cos(angle2);
                    const y2 = 60 + 45 * Math.sin(angle2);
                    const largeArc = 360 / slices > 180 ? 1 : 0;
                    const fill = i < filled ? '#4CAF50' : '#E8F5E9';
                    pie += `<path d="M60,60 L${x1},${y1} A45,45 0 ${largeArc},1 ${x2},${y2} Z" fill="${fill}" stroke="#388E3C" stroke-width="2"/>`;
                }
                return `
                    <svg viewBox="0 0 120 120" class="tutor-svg tutor-svg-small">
                        ${pie}
                    </svg>
                    <p class="visual-caption">${num}/${denom} means ${num} out of ${denom} equal parts</p>
                `;
            }
        }

        if (type === 'geometry' || type === 'perimeter' || type === 'area') {
            if (questionText.toLowerCase().includes('rectangle') && numbers.length >= 2) {
                const [l, w] = numbers;
                const scale = Math.min(150 / l, 80 / w, 20);
                return `
                    <svg viewBox="0 0 200 120" class="tutor-svg">
                        <rect x="25" y="20" width="${l * scale}" height="${w * scale}" fill="#E3F2FD" stroke="#1976D2" stroke-width="2"/>
                        <text x="${25 + l * scale / 2}" y="15" text-anchor="middle" font-size="12">${l}cm</text>
                        <text x="${30 + l * scale}" y="${20 + w * scale / 2}" text-anchor="start" font-size="12">${w}cm</text>
                    </svg>
                    <p class="visual-caption">Rectangle: ${l}cm × ${w}cm</p>
                `;
            }
            if (questionText.toLowerCase().includes('square') && numbers.length >= 1) {
                const side = numbers[0];
                const scale = Math.min(100 / side, 15);
                return `
                    <svg viewBox="0 0 150 130" class="tutor-svg">
                        <rect x="25" y="20" width="${side * scale}" height="${side * scale}" fill="#FFF3E0" stroke="#E65100" stroke-width="2"/>
                        <text x="${25 + side * scale / 2}" y="15" text-anchor="middle" font-size="12">${side}cm</text>
                        <text x="${30 + side * scale}" y="${20 + side * scale / 2}" text-anchor="start" font-size="12">${side}cm</text>
                    </svg>
                    <p class="visual-caption">Square: all sides are ${side}cm</p>
                `;
            }
        }

        if (type === 'volume' && numbers.length >= 3) {
            const [l, w, h] = numbers;
            return `
                <svg viewBox="0 0 180 140" class="tutor-svg">
                    <!-- 3D cuboid -->
                    <polygon points="20,100 80,100 80,40 20,40" fill="#E3F2FD" stroke="#1976D2" stroke-width="2"/>
                    <polygon points="80,100 130,80 130,20 80,40" fill="#BBDEFB" stroke="#1976D2" stroke-width="2"/>
                    <polygon points="20,40 70,20 130,20 80,40" fill="#90CAF9" stroke="#1976D2" stroke-width="2"/>
                    <!-- Labels -->
                    <text x="50" y="115" text-anchor="middle" font-size="11">${l}cm</text>
                    <text x="140" y="55" text-anchor="start" font-size="11">${h}cm</text>
                    <text x="100" y="15" text-anchor="middle" font-size="11">${w}cm</text>
                </svg>
                <p class="visual-caption">Volume = ${l} × ${w} × ${h} = ${l * w * h}cm³</p>
            `;
        }

        if (type === 'arithmetic') {
            // Number line for addition/subtraction
            if (questionText.includes('+') && numbers.length >= 2) {
                const [a, b] = numbers;
                const sum = a + b;
                const max = sum + 2;
                const scale = 200 / max;
                return `
                    <svg viewBox="0 0 260 70" class="tutor-svg">
                        <line x1="20" y1="40" x2="240" y2="40" stroke="#333" stroke-width="2"/>
                        <!-- Start point -->
                        <circle cx="${20 + a * scale}" cy="40" r="6" fill="#4CAF50"/>
                        <text x="${20 + a * scale}" y="60" text-anchor="middle" font-size="11">${a}</text>
                        <!-- Jump arrow -->
                        <path d="M${20 + a * scale},35 Q${20 + (a + b / 2) * scale},10 ${20 + sum * scale},35" fill="none" stroke="#FF9800" stroke-width="2" marker-end="url(#arrowhead)"/>
                        <text x="${20 + (a + b / 2) * scale}" y="15" text-anchor="middle" font-size="11" fill="#FF9800">+${b}</text>
                        <!-- End point -->
                        <circle cx="${20 + sum * scale}" cy="40" r="6" fill="#2196F3"/>
                        <text x="${20 + sum * scale}" y="60" text-anchor="middle" font-size="11">${sum}</text>
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#FF9800"/>
                            </marker>
                        </defs>
                    </svg>
                    <p class="visual-caption">Number line: ${a} + ${b} = ${sum}</p>
                `;
            }
        }

        return null;
    },

    generateInteractiveSection(question) {
        const type = question.type || 'general';
        const questionText = question.question || '';
        const answer = question.answer || '';
        const numbers = questionText.match(/\d+/g)?.map(Number) || [];

        if (type === 'multiplication' && numbers.length >= 2) {
            const [a, b] = numbers;
            return `
                <div class="interactive-practice">
                    <p>Can you work out a similar problem?</p>
                    <div class="practice-question">${a + 1} × ${b} = ?</div>
                    <div class="practice-input-group">
                        <input type="number" class="practice-input" id="practiceAnswer" placeholder="Your answer">
                        <button class="practice-check-btn" onclick="TutorMode.checkPractice(${(a + 1) * b})">Check</button>
                    </div>
                    <div class="practice-feedback" id="practiceFeedback"></div>
                </div>
            `;
        }

        if (type === 'division' && numbers.length >= 2) {
            const [dividend, divisor] = numbers;
            const newDividend = divisor * (Math.floor(dividend / divisor) + 1);
            return `
                <div class="interactive-practice">
                    <p>Try this similar problem:</p>
                    <div class="practice-question">${newDividend} ÷ ${divisor} = ?</div>
                    <div class="practice-input-group">
                        <input type="number" class="practice-input" id="practiceAnswer" placeholder="Your answer">
                        <button class="practice-check-btn" onclick="TutorMode.checkPractice(${newDividend / divisor})">Check</button>
                    </div>
                    <div class="practice-feedback" id="practiceFeedback"></div>
                </div>
            `;
        }

        if (type === 'arithmetic' && numbers.length >= 2) {
            const [a, b] = numbers;
            const newA = a + Math.floor(Math.random() * 5) + 1;
            const newB = b + Math.floor(Math.random() * 3);
            const isAdd = questionText.includes('+');
            const newAnswer = isAdd ? newA + newB : newA - newB;
            return `
                <div class="interactive-practice">
                    <p>Now try this one:</p>
                    <div class="practice-question">${newA} ${isAdd ? '+' : '-'} ${newB} = ?</div>
                    <div class="practice-input-group">
                        <input type="number" class="practice-input" id="practiceAnswer" placeholder="Your answer">
                        <button class="practice-check-btn" onclick="TutorMode.checkPractice(${newAnswer})">Check</button>
                    </div>
                    <div class="practice-feedback" id="practiceFeedback"></div>
                </div>
            `;
        }

        return null;
    },

    checkPractice(correctAnswer) {
        const input = document.getElementById('practiceAnswer');
        const feedback = document.getElementById('practiceFeedback');
        const userAnswer = parseInt(input.value);

        if (isNaN(userAnswer)) {
            feedback.innerHTML = '<span class="feedback-hint">Enter a number and try again! 🤔</span>';
            return;
        }

        if (userAnswer === correctAnswer) {
            feedback.innerHTML = '<span class="feedback-correct">🎉 Excellent! That\'s correct! You\'ve got it!</span>';
            input.style.borderColor = '#4CAF50';
        } else {
            const diff = Math.abs(userAnswer - correctAnswer);
            let hint = '';
            if (diff <= 2) {
                hint = "Very close! Try again - you're almost there!";
            } else if (userAnswer < correctAnswer) {
                hint = "Your answer is a bit too small. Try a bigger number!";
            } else {
                hint = "Your answer is a bit too big. Try a smaller number!";
            }
            feedback.innerHTML = `<span class="feedback-incorrect">Not quite! ${hint} 💪</span>`;
            input.style.borderColor = '#FF9800';
        }
    },

    attachInteractiveEvents(question) {
        // Add step animation on click
        document.querySelectorAll('.tutor-step').forEach((step, index) => {
            step.addEventListener('click', () => {
                step.classList.toggle('step-highlighted');
            });
        });
    },

    generateSteps(question) {
        // Use the question's actual data to create a real walkthrough
        const questionText = question.question || '';
        const answer = question.answer || '';
        const explanation = question.explanation || '';
        const type = question.type || 'general';

        // Try to extract numbers from arithmetic questions
        const numbers = questionText.match(/\d+/g);

        // Generate specific steps based on question type and content
        if (type === 'arithmetic' || type === 'multiplication' || type === 'division') {
            return this.generateArithmeticSteps(questionText, answer, explanation, type);
        } else if (type === 'fractions') {
            return this.generateFractionSteps(questionText, answer, explanation);
        } else if (type === 'geometry' || type === 'perimeter' || type === 'area' || type === 'volume') {
            return this.generateGeometrySteps(questionText, answer, explanation, type);
        } else if (type === 'grammar' || type === 'punctuation' || type === 'spelling') {
            return this.generateEnglishSteps(questionText, answer, explanation, type);
        } else {
            return this.generateGenericSteps(questionText, answer, explanation);
        }
    },

    generateArithmeticSteps(questionText, answer, explanation, type) {
        const numbers = questionText.match(/\d+/g)?.map(Number) || [];
        const steps = [];

        steps.push(`<strong>Read the question:</strong> "${questionText.replace(/\n/g, ' ')}"`);

        if (type === 'multiplication' && numbers.length >= 2) {
            const [a, b] = numbers;
            steps.push(`<strong>We need to find:</strong> ${a} × ${b}`);
            steps.push(`<strong>Think of it as:</strong> ${a} groups of ${b}, or ${b} added ${a} times`);
            if (a <= 12 && b <= 12) {
                steps.push(`<strong>Use times tables:</strong> ${a} × ${b} = ${a * b}`);
            } else {
                steps.push(`<strong>Break it down:</strong> ${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}, then ${a % 10} × ${b} = ${(a % 10) * b}`);
                steps.push(`<strong>Add together:</strong> ${Math.floor(a / 10) * 10 * b} + ${(a % 10) * b} = ${a * b}`);
            }
        } else if (type === 'division' && numbers.length >= 2) {
            const [dividend, divisor] = numbers;
            steps.push(`<strong>We need to find:</strong> ${dividend} ÷ ${divisor}`);
            steps.push(`<strong>Ask yourself:</strong> How many groups of ${divisor} fit into ${dividend}?`);
            steps.push(`<strong>Use times tables backwards:</strong> What × ${divisor} = ${dividend}?`);
            steps.push(`<strong>Answer:</strong> ${Math.floor(dividend / divisor)} × ${divisor} = ${Math.floor(dividend / divisor) * divisor}`);
        } else if (numbers.length >= 2) {
            const [a, b] = numbers;
            if (questionText.includes('+')) {
                steps.push(`<strong>We need to add:</strong> ${a} + ${b}`);
                if (a >= 10 || b >= 10) {
                    steps.push(`<strong>Add the ones:</strong> ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}`);
                    steps.push(`<strong>Add the tens:</strong> ${Math.floor(a / 10) * 10} + ${Math.floor(b / 10) * 10} = ${(Math.floor(a / 10) + Math.floor(b / 10)) * 10}`);
                }
                steps.push(`<strong>Total:</strong> ${a} + ${b} = ${a + b}`);
            } else if (questionText.includes('-')) {
                steps.push(`<strong>We need to subtract:</strong> ${a} - ${b}`);
                steps.push(`<strong>Count back ${b} from ${a}:</strong> ${a} - ${b} = ${a - b}`);
            }
        }

        steps.push(`<strong>✓ The answer is: ${answer}</strong>`);
        return steps;
    },

    generateFractionSteps(questionText, answer, explanation) {
        const steps = [];
        const numbers = questionText.match(/\d+/g)?.map(Number) || [];

        steps.push(`<strong>Read the question:</strong> "${questionText.replace(/\n/g, ' ')}"`);

        if (questionText.toLowerCase().includes('half')) {
            const total = numbers[0];
            steps.push(`<strong>Finding half means:</strong> dividing by 2`);
            steps.push(`<strong>Calculate:</strong> ${total} ÷ 2 = ${total / 2}`);
        } else if (questionText.includes('/')) {
            const fractionMatch = questionText.match(/1\/(\d+)/);
            if (fractionMatch && numbers.length > 0) {
                const denominator = parseInt(fractionMatch[1]);
                const total = numbers.find(n => n !== denominator);
                steps.push(`<strong>Finding 1/${denominator} means:</strong> dividing into ${denominator} equal parts`);
                steps.push(`<strong>Calculate:</strong> ${total} ÷ ${denominator} = ${total / denominator}`);
            }
        }

        steps.push(`<strong>✓ The answer is: ${answer}</strong>`);
        return steps;
    },

    generateGeometrySteps(questionText, answer, explanation, type) {
        const steps = [];
        const numbers = questionText.match(/\d+/g)?.map(Number) || [];

        steps.push(`<strong>Read the question:</strong> "${questionText.replace(/\n/g, ' ')}"`);

        if (type === 'perimeter') {
            if (questionText.toLowerCase().includes('square')) {
                const side = numbers[0];
                steps.push(`<strong>For a square:</strong> all 4 sides are equal (${side}cm each)`);
                steps.push(`<strong>Perimeter formula:</strong> 4 × side`);
                steps.push(`<strong>Calculate:</strong> 4 × ${side} = ${4 * side}cm`);
            } else if (questionText.toLowerCase().includes('rectangle')) {
                const [length, width] = numbers;
                steps.push(`<strong>For a rectangle:</strong> opposite sides are equal`);
                steps.push(`<strong>Perimeter formula:</strong> 2 × (length + width)`);
                steps.push(`<strong>Calculate:</strong> 2 × (${length} + ${width}) = 2 × ${length + width} = ${2 * (length + width)}cm`);
            }
        } else if (type === 'area') {
            const [length, width] = numbers;
            steps.push(`<strong>Area formula for rectangle:</strong> length × width`);
            steps.push(`<strong>Calculate:</strong> ${length} × ${width} = ${length * width}cm²`);
        } else if (type === 'volume') {
            const [length, width, height] = numbers;
            steps.push(`<strong>Volume formula for cuboid:</strong> length × width × height`);
            steps.push(`<strong>Calculate:</strong> ${length} × ${width} × ${height}`);
            steps.push(`<strong>Step by step:</strong> ${length} × ${width} = ${length * width}, then ${length * width} × ${height} = ${length * width * height}cm³`);
        } else if (type === 'geometry') {
            steps.push(`<strong>Look at the shape carefully</strong>`);
            steps.push(`<strong>Count the sides and corners if asked</strong>`);
        }

        steps.push(`<strong>✓ The answer is: ${answer}</strong>`);
        return steps;
    },

    generateEnglishSteps(questionText, answer, explanation, type) {
        const steps = [];

        steps.push(`<strong>Read the question:</strong> "${questionText.replace(/\n/g, ' ')}"`);

        if (type === 'grammar') {
            steps.push(`<strong>Identify what's being asked:</strong> What type of word or grammar rule is this about?`);
            steps.push(`<strong>Apply the rule:</strong> ${explanation || 'Think about what you\'ve learned'}`);
        } else if (type === 'punctuation') {
            steps.push(`<strong>Read the sentence out loud:</strong> Where do you naturally pause?`);
            steps.push(`<strong>Remember the rules:</strong> ${explanation || 'Capital letters start sentences, full stops end them'}`);
        } else if (type === 'spelling') {
            steps.push(`<strong>Sound out the word:</strong> Break it into smaller parts`);
            steps.push(`<strong>Think about patterns:</strong> Have you seen similar words before?`);
        }

        steps.push(`<strong>✓ The answer is: ${answer}</strong>`);
        return steps;
    },

    generateGenericSteps(questionText, answer, explanation) {
        const steps = [];

        steps.push(`<strong>Read the question carefully:</strong> "${questionText.replace(/\n/g, ' ')}"`);
        steps.push(`<strong>Identify what's being asked:</strong> What information do you need to find?`);

        if (explanation) {
            steps.push(`<strong>Here's how to solve it:</strong> ${explanation}`);
        }

        steps.push(`<strong>✓ The answer is: ${answer}</strong>`);
        return steps;
    },

    generateTip(question) {
        const type = question.type || 'general';

        const tips = {
            arithmetic: "When adding or subtracting larger numbers, stack them in columns and work from right to left!",
            multiplication: "Remember: 5× is half of 10×, and 9× is 10× minus the number. These tricks make times tables easier!",
            division: "Division is the opposite of multiplication. If you know 3 × 4 = 12, then 12 ÷ 3 = 4!",
            fractions: "Finding 1/4 is like halving twice. So 1/4 of 20: half of 20 is 10, half of 10 is 5!",
            geometry: "A square is a special rectangle with all sides equal. Rectangles have opposite sides equal!",
            perimeter: "Perimeter is the distance around the outside - imagine walking around the edge!",
            area: "Area is the space inside - imagine covering it with 1cm × 1cm squares!",
            volume: "Volume is the space inside a 3D shape - imagine filling it with 1cm cubes!",
            spelling: "Break tricky words into smaller parts. For example: un-for-get-table = unforgettable!",
            grammar: "Nouns name things, verbs are doing words, adjectives describe nouns, adverbs describe verbs.",
            punctuation: "Read your sentence out loud. Pauses often show where punctuation should go!",
            general: "Don't rush! Read questions twice to make sure you understand what's being asked."
        };

        return tips[type] || tips.general;
    },

    generatePractice(question) {
        const type = question.type || 'general';

        const practices = {
            arithmetic: "Try making up similar questions with different numbers and solving them.",
            multiplication: "Practice your times tables for 5 minutes each day - use songs or games!",
            division: "Share objects equally between toys or family members to understand division better.",
            fractions: "Fold paper into equal parts to see fractions in real life - halves, quarters, eighths!",
            geometry: "Look for shapes around your home - windows, doors, clocks. What shapes do you see?",
            perimeter: "Measure the perimeter of objects at home - books, tables, picture frames!",
            area: "Draw rectangles on squared paper and count the squares to check your area calculations!",
            volume: "Build cuboids with blocks and count how many you used!",
            spelling: "Write tricky words in rainbow colours, or spell them with letter magnets.",
            grammar: "Read your favourite book and spot examples of the grammar rule you're learning.",
            punctuation: "When reading, notice where the punctuation marks are and what they do.",
            general: "Practice a little bit every day - it's better than lots all at once!"
        };

        return practices[type] || practices.general;
    },

    async getAIExplanation(question) {
        try {
            const response = await fetch('/api/generate-tutor-explanation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.question,
                    subject: question.subject || 'math',
                    year: question.year || 3
                })
            });

            const data = await response.json();

            if (data.success && data.explanation) {
                this.showAIExplanation(question, data.explanation);
            } else {
                this.showLocalExplanation(question);
            }
        } catch (error) {
            console.error('AI explanation error:', error);
            this.showLocalExplanation(question);
        }
    },

    showAIExplanation(question, explanation) {
        document.getElementById('tutorContent').innerHTML = `
            <div class="tutor-explanation">
                <div class="tutor-question">
                    <strong>Question:</strong> ${question.question.replace(/\n/g, ' ')}
                </div>
                
                <div class="tutor-greeting">
                    ${explanation.greeting || "Let me help you with this! 😊"}
                </div>
                
                <div class="tutor-steps">
                    <h4>📝 Step by Step:</h4>
                    ${(explanation.steps || []).map((step, i) => `
                        <div class="tutor-step">
                            <span class="step-number">${i + 1}</span>
                            <span class="step-text">${step}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${explanation.tip ? `
                    <div class="tutor-tip">
                        <h4>💡 Helpful Tip:</h4>
                        <p>${explanation.tip}</p>
                    </div>
                ` : ''}
                
                <div class="tutor-encouragement">
                    ${explanation.encouragement || "You can do this! 🌟"}
                </div>
                
                ${explanation.practice ? `
                    <div class="tutor-practice">
                        <h4>📚 Practice Idea:</h4>
                        <p>${explanation.practice}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
};

window.TutorMode = TutorMode;
