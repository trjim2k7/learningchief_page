/**
 * LearningChief - Math Question Generators
 * Organized by year group and difficulty
 */

const MathGenerator = {
    // Year-specific topic generators - expanded based on UK National Curriculum
    topics: {
        1: {
            normal: ['counting', 'additionSimple', 'subtractionSimple', 'shapes2D', 'comparingNumbers', 'oneMoreLess', 'doubling', 'ordering', 'measureLength', 'countBackward', 'oneMoreOneLess', 'halving', 'wordProblemAddition'],
            advanced: ['numberBonds', 'countingPatterns', 'positionDirection', 'weightCompare', 'wordProblemSubtraction']
        },
        2: {
            normal: ['addition100', 'subtraction100', 'multiplication2510', 'fractions12', 'tellingTime', 'money', 'oddEven', 'sequences', 'measureCm', 'wordProblemAddition', 'wordProblemSubtraction'],
            advanced: ['mentalAddition', 'times3', 'quarterTime', 'makeChange', 'partitioning', 'shapes3D', 'wordProblemMultiplication']
        },
        3: {
            normal: ['multiplicationFacts', 'divisionFacts', 'columnAddition', 'columnSubtraction', 'unitFractions', 'time5min', 'perimeter', 'tenthsOf', 'scaledBarCharts', 'romanNumerals', 'rightAngles', 'wordProblemMultiplication', 'wordProblemDivision'],
            advanced: ['times348', 'equivalentFractions', 'barCharts', 'measuringMass']
        },
        4: {
            normal: ['multiDigitMultiplication', 'shortDivision', 'decimalTenths', 'areaRectangles', 'symmetry', 'timeProblems', 'negativeTemperature', 'roundingNearest10', 'coordinates', 'anglesTypes', 'wordProblemDivision'],
            advanced: ['factorPairs', 'hundredths', 'convertUnits', 'translation', 'perimeterRectilinear']
        },
        5: {
            normal: ['longMultiplication', 'mult3x2', 'longDivision', 'fractionOperations', 'percentageBasics', 'volume', 'multiplyBy10', 'shapes3D', 'compareFractions', 'areaRectangles', 'perimeter', 'decimalTenths', 'squareCubeNumbers', 'angles'],
            advanced: ['mult3x3', 'primeNumbers', 'negativeNumbers', 'fractionDecimal', 'imperialUnits', 'cuboidVolume', 'equivalentFractions']
        },
        6: {
            normal: ['orderOperations', 'ratio', 'simpleAlgebra', 'meanMedianMode', 'pieCharts', 'fractionDecimalPercent', 'simplifyFractions', 'missingAngles', 'algebraUnknowns', 'percentageChanges', 'areaTriangles', 'scaleFactors'],
            advanced: ['circleRadius', 'netsCubes', 'wordProblemAddition', 'wordProblemSubtraction', 'wordProblemMultiplication', 'wordProblemDivision']
        }
    },

    // Generate questions for a year/difficulty
    generate(year, difficulty, count, topic = null) {
        const questions = [];

        // For advanced: include BOTH normal AND advanced topics for more variety and challenge
        // For normal: only normal topics
        let availableTopics;
        if (topic) {
            // Map user-friendly topic text to internal generator keys
            const mappedTopics = this.mapTopicToGenerators(topic, year);
            if (mappedTopics.length > 0) {
                availableTopics = mappedTopics;
            } else {
                // Fallback: if no mapping found, use year-appropriate topics
                console.warn(`No matching generators for topic "${topic}", using default topics`);
                availableTopics = difficulty === 'advanced'
                    ? [...this.topics[year].normal, ...this.topics[year].advanced]
                    : this.topics[year].normal;
            }
        } else if (difficulty === 'advanced') {
            // Advanced mode gets ALL topics (normal + advanced) for variety
            availableTopics = [...this.topics[year].normal, ...this.topics[year].advanced];
        } else {
            availableTopics = this.topics[year].normal;
        }

        // Shuffle topics to prevent predictable patterns
        availableTopics = this.shuffleArray([...availableTopics]);

        const usedQuestions = new Set(); // Track full question text
        const usedShapes = new Set(); // Track shapes to prevent duplicates
        let attempts = 0;
        const maxAttempts = count * 10; // More attempts for better uniqueness
        let topicCounter = 0;

        while (questions.length < count && attempts < maxAttempts) {
            attempts++;

            // Cycle through shuffled topics
            const selectedTopic = availableTopics[topicCounter % availableTopics.length];
            topicCounter++;

            const generator = this.generators[selectedTopic];

            if (generator) {
                const question = {
                    ...generator(year, difficulty),
                    topic: selectedTopic,
                    isRevision: false
                };

                // Shuffle choices if present (so answer isn't always first)
                if (question.choices && Array.isArray(question.choices)) {
                    question.choices = this.shuffleArray(question.choices);
                }

                // Create signature including shape data for better duplicate detection
                let signature = question.question.trim();

                // If the question has visual shape data, include it in the signature
                if (question.visualData && question.visualData.shape) {
                    const shapeName = question.visualData.shape;

                    // Skip if this shape has already been used
                    if (usedShapes.has(shapeName)) {
                        continue;
                    }

                    // Add shape to signature and track it
                    signature += `|shape:${shapeName}`;
                    usedShapes.add(shapeName);
                }

                if (!usedQuestions.has(signature)) {
                    usedQuestions.add(signature);
                    questions.push(question);
                }
            }
        }

        // Final shuffle to randomize order
        return this.shuffleArray(questions);
    },

    // Fisher-Yates shuffle
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // =====================================================
    // ROBUST TOPIC MAPPER
    // Handles: typos, format variations, plurals, abbreviations
    // =====================================================

    // Normalize text: handle unicode, remove noise, standardize formats
    normalizeTopicText(text) {
        let normalized = text
            .toLowerCase()
            .replace(/×/g, 'x')           // Unicode multiplication → x
            .replace(/÷/g, '/')           // Unicode division → /
            .replace(/\s*x\s*/g, 'x')     // "3 x 2" → "3x2"  
            .replace(/\s*by\s*/g, 'x')    // "3 by 2" → "3x2"
            .replace(/\s*digit\s*/g, '')  // "3 digit" → "3"
            .replace(/['']/g, "'")        // Smart quotes → regular
            .replace(/[""]/g, '"')
            .replace(/\s+/g, ' ')         // Multiple spaces → single
            .trim();

        // Convert word numbers to digits
        const wordToNumber = {
            'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
            'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
            'eleven': '11', 'twelve': '12', 'first': '1', 'second': '2',
            'third': '3', 'fourth': '4', 'fifth': '5', 'sixth': '6'
        };

        for (const [word, digit] of Object.entries(wordToNumber)) {
            normalized = normalized.replace(new RegExp(`\\b${word}\\b`, 'gi'), digit);
        }

        return normalized;
    },

    // Fix common typos
    fixTypos(text) {
        const typoMap = {
            // Multiplication typos
            'multiplacation': 'multiplication',
            'multiplcation': 'multiplication',
            'mutliplication': 'multiplication',
            'mulitplication': 'multiplication',
            'multiplicaton': 'multiplication',
            'multipication': 'multiplication',
            'multplication': 'multiplication',
            'multipliaction': 'multiplication',
            'mulitply': 'multiply',
            'multilpy': 'multiply',
            'mutliply': 'multiply',

            // Division typos
            'divison': 'division',
            'divsion': 'division',
            'devision': 'division',
            'divition': 'division',
            'dividing': 'division',

            // Fraction typos
            'fractoin': 'fraction',
            'fracton': 'fraction',
            'fration': 'fraction',
            'fracion': 'fraction',
            'fractions': 'fraction',
            'frac': 'fraction',

            // Addition typos
            'additon': 'addition',
            'addtion': 'addition',
            'adition': 'addition',
            'adding': 'addition',

            // Subtraction typos
            'subtration': 'subtraction',
            'subraction': 'subtraction',
            'subtracton': 'subtraction',
            'subtracting': 'subtraction',

            // Decimal typos
            'decimle': 'decimal',
            'decimals': 'decimal',
            'decmial': 'decimal',
            'decimel': 'decimal',

            // Percentage typos
            'percantage': 'percentage',
            'precentage': 'percentage',
            'percentige': 'percentage',
            'persantage': 'percentage',
            'percent': 'percentage',
            'percents': 'percentage',

            // Algebra typos
            'algabra': 'algebra',
            'alegbra': 'algebra',
            'algerbra': 'algebra',

            // Geometry typos
            'geomtry': 'geometry',
            'geometery': 'geometry',
            'geomerty': 'geometry',

            // Perimeter typos
            'perimiter': 'perimeter',
            'peremeter': 'perimeter',
            'perimetre': 'perimeter',

            // Symmetry typos
            'symetry': 'symmetry',
            'simmetry': 'symmetry',
            'symmerty': 'symmetry',

            // Other common typos
            'measurment': 'measurement',
            'measurments': 'measurement',
            'cordinate': 'coordinate',
            'cordinates': 'coordinates',
            'equivelent': 'equivalent',
            'equivilent': 'equivalent',
            'aera': 'area',
            'volum': 'volume',
            'volumne': 'volume',
            'negitive': 'negative',
            'negetive': 'negative',
            'statisitics': 'statistics',
            'timestable': 'times table',
            'timestables': 'times table',
            'devide': 'divide',
            'timetables': 'times table',
            'timetable': 'times table',
        };

        let fixed = text;
        for (const [typo, correct] of Object.entries(typoMap)) {
            fixed = fixed.replace(new RegExp(typo, 'gi'), correct);
        }
        return fixed;
    },

    // Stem words: remove common suffixes to match base forms
    stemWord(word) {
        return word
            .replace(/s$/, '')            // plurals: fractions → fraction
            .replace(/ing$/, '')          // adding → add
            .replace(/tion$/, '')         // multiplication → multiplica (partial)
            .replace(/sion$/, '');        // division → divi (partial)
    },

    // Extract NxN patterns from text (handles: 3x2, 3 x 2, 3×2, 3 by 2, 3digit x 2digit)
    extractDigitPatterns(text) {
        const patterns = [];

        // Match patterns like: 3x2, 3x3, 2x1, etc.
        const matches = text.match(/(\d)\s*(?:x|×|by)\s*(\d)/gi);
        if (matches) {
            for (const match of matches) {
                const nums = match.match(/\d/g);
                if (nums && nums.length === 2) {
                    patterns.push({ a: parseInt(nums[0]), b: parseInt(nums[1]) });
                }
            }
        }

        return patterns;
    },

    // Get generators for NxN multiplication patterns
    getMultiplicationGeneratorsForPattern(a, b) {
        // Sort so we handle both "3x2" and "2x3" the same way
        const [smaller, larger] = [Math.min(a, b), Math.max(a, b)];

        if (larger === 3 && smaller === 3) {
            return ['mult3x3', 'longMultiplication'];
        } else if (larger === 3 && smaller === 2) {
            return ['mult3x2', 'longMultiplication', 'multiDigitMultiplication'];
        } else if (larger === 2 && smaller === 2) {
            return ['longMultiplication', 'multiDigitMultiplication'];
        } else if (larger === 2 && smaller === 1) {
            return ['multiDigitMultiplication', 'multiplicationFacts'];
        } else if (larger === 1 && smaller === 1) {
            return ['multiplicationFacts', 'multiplication2510'];
        }

        // Default for any multiplication pattern
        return ['longMultiplication', 'mult3x2', 'mult3x3', 'multiDigitMultiplication'];
    },

    // Simple Levenshtein distance for fuzzy matching
    levenshteinDistance(a, b) {
        const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

        for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + cost
                );
            }
        }

        return matrix[b.length][a.length];
    },

    // Map user-friendly topic text to internal generator keys
    // This is the key function that translates user input to actual generators
    mapTopicToGenerators(topicText, year) {
        const allYearTopics = [...this.topics[year].normal, ...this.topics[year].advanced];
        const matches = new Set();

        // STEP 1: Normalize and fix typos
        let normalizedText = this.normalizeTopicText(topicText);
        normalizedText = this.fixTypos(normalizedText);

        console.log(`[Topic Mapper] Original: "${topicText}"`);
        console.log(`[Topic Mapper] Normalized: "${normalizedText}"`);
        console.log(`[Topic Mapper] Available for Year ${year}:`, allYearTopics);

        // STEP 2: Extract NxN patterns (e.g., "3x3", "2 by 1")
        const digitPatterns = this.extractDigitPatterns(normalizedText);
        for (const pattern of digitPatterns) {
            const patternGenerators = this.getMultiplicationGeneratorsForPattern(pattern.a, pattern.b);
            patternGenerators.forEach(g => matches.add(g));
            console.log(`[Topic Mapper] Pattern ${pattern.a}x${pattern.b} → [${patternGenerators.join(', ')}]`);
        }

        // STEP 3: Split by comma/semicolon for multiple topics
        const topicParts = normalizedText.split(/[,;]+/).map(t => t.trim()).filter(t => t);

        // Comprehensive keyword to generator mappings
        const keywordMappings = {
            // === MULTIPLICATION ===
            'multiply': ['longMultiplication', 'multiDigitMultiplication', 'multiplicationFacts', 'multiplication2510', 'times348', 'times3', 'multiplyBy10', 'mult3x2', 'mult3x3'],
            'multiplication': ['longMultiplication', 'multiDigitMultiplication', 'multiplicationFacts', 'multiplication2510', 'times348', 'times3', 'multiplyBy10', 'mult3x2', 'mult3x3'],
            'times': ['longMultiplication', 'multiDigitMultiplication', 'multiplicationFacts', 'multiplication2510', 'times348', 'times3', 'multiplyBy10'],
            'times table': ['multiplicationFacts', 'multiplication2510', 'times348', 'times3'],
            'long multiplication': ['longMultiplication', 'mult3x2', 'mult3x3'],

            // === DIVISION ===
            'divide': ['longDivision', 'shortDivision', 'divisionFacts'],
            'division': ['longDivision', 'shortDivision', 'divisionFacts'],
            'long division': ['longDivision'],
            'short division': ['shortDivision'],

            // === FRACTIONS ===
            'fraction': ['fractionOperations', 'unitFractions', 'equivalentFractions', 'fractions12', 'compareFractions', 'simplifyFractions', 'fractionDecimal', 'fractionDecimalPercent'],
            'equivalent': ['equivalentFractions'],
            'compare': ['compareFractions'],
            'simplify': ['simplifyFractions'],

            // === DECIMALS ===
            'decimal': ['decimalTenths', 'hundredths', 'fractionDecimal', 'fractionDecimalPercent'],
            'tenth': ['decimalTenths', 'tenthsOf'],
            'hundredth': ['hundredths'],

            // === PERCENTAGES ===
            'percent': ['percentageBasics', 'percentageChanges', 'fractionDecimalPercent'],
            'percentage': ['percentageBasics', 'percentageChanges', 'fractionDecimalPercent'],

            // === ADDITION & SUBTRACTION ===
            'addition': ['columnAddition', 'addition100', 'additionSimple', 'mentalAddition'],
            'add': ['columnAddition', 'addition100', 'additionSimple', 'mentalAddition'],
            'subtraction': ['columnSubtraction', 'subtraction100', 'subtractionSimple'],
            'subtract': ['columnSubtraction', 'subtraction100', 'subtractionSimple'],
            'plus': ['columnAddition', 'addition100', 'additionSimple'],
            'minus': ['columnSubtraction', 'subtraction100', 'subtractionSimple'],

            // === TIME ===
            'time': ['tellingTime', 'time5min', 'timeProblems', 'quarterTime'],
            'clock': ['tellingTime', 'time5min', 'quarterTime'],

            // === MONEY ===
            'money': ['money', 'makeChange'],
            'change': ['makeChange'],
            'coin': ['money', 'makeChange'],
            'pound': ['money', 'makeChange'],
            'pence': ['money', 'makeChange'],

            // === SHAPES & GEOMETRY ===
            'shape': ['shapes2D', 'shapes3D'],
            '2d': ['shapes2D'],
            '3d': ['shapes3D'],
            'symmetry': ['symmetry'],
            'angle': ['angles', 'anglesTypes', 'rightAngles', 'missingAngles'],
            'coordinate': ['coordinates'],
            'translation': ['translation'],
            'geometry': ['shapes2D', 'shapes3D', 'angles', 'symmetry', 'perimeter', 'areaRectangles'],

            // === MEASUREMENT ===
            'perimeter': ['perimeter', 'perimeterRectilinear'],
            'area': ['areaRectangles', 'areaTriangles'],
            'volume': ['volume', 'cuboidVolume'],
            'measure': ['measureLength', 'measureCm', 'measuringMass', 'convertUnits'],
            'length': ['measureLength', 'measureCm'],
            'mass': ['measuringMass', 'weightCompare'],
            'weight': ['measuringMass', 'weightCompare'],
            'convert': ['convertUnits', 'imperialUnits'],
            'unit': ['convertUnits', 'imperialUnits'],

            // === NUMBER CONCEPTS ===
            'negative': ['negativeNumbers', 'negativeTemperature'],
            'prime': ['primeNumbers'],
            'factor': ['factorPairs'],
            'square': ['squareCubeNumbers'],
            'cube': ['squareCubeNumbers', 'cuboidVolume'],
            'ratio': ['ratio'],
            'algebra': ['simpleAlgebra', 'algebraUnknowns'],
            'order of operations': ['orderOperations'],
            'bodmas': ['orderOperations'],
            'bidmas': ['orderOperations'],
            'pemdas': ['orderOperations'],
            'mean': ['meanMedianMode'],
            'median': ['meanMedianMode'],
            'mode': ['meanMedianMode'],
            'average': ['meanMedianMode'],

            // === PLACE VALUE & NUMBER ===
            'counting': ['counting', 'countingPatterns'],
            'number bond': ['numberBonds'],
            'double': ['doubling'],
            'halving': ['halving'],
            'half': ['halving', 'fractions12'],
            'odd': ['oddEven'],
            'even': ['oddEven'],
            'sequence': ['sequences', 'countingPatterns'],
            'pattern': ['sequences', 'countingPatterns'],
            'rounding': ['roundingNearest10'],
            'round': ['roundingNearest10'],
            'roman': ['romanNumerals'],
            'place value': ['counting', 'ordering', 'comparingNumbers'],

            // === DATA ===
            'chart': ['barCharts', 'scaledBarCharts', 'pieCharts'],
            'bar chart': ['barCharts', 'scaledBarCharts'],
            'pie chart': ['pieCharts'],
            'graph': ['barCharts', 'scaledBarCharts', 'pieCharts'],
            'data': ['barCharts', 'scaledBarCharts', 'pieCharts', 'meanMedianMode'],
            'statistic': ['meanMedianMode'],
        };

        // STEP 4: Match keywords (including stemmed versions)
        for (const part of topicParts) {
            const words = part.split(/\s+/);
            const stemmedPart = words.map(w => this.stemWord(w)).join(' ');

            for (const [keyword, generators] of Object.entries(keywordMappings)) {
                // Check: part contains keyword, keyword contains part, or stemmed versions match
                if (part.includes(keyword) ||
                    keyword.includes(part) ||
                    stemmedPart.includes(keyword) ||
                    keyword.includes(stemmedPart)) {
                    generators.forEach(g => matches.add(g));
                }

                // Also check individual words
                for (const word of words) {
                    if (word.length >= 3 && (keyword.includes(word) || word.includes(keyword))) {
                        generators.forEach(g => matches.add(g));
                    }
                }
            }
        }

        // STEP 5: Filter to only include generators that exist for this year
        let validMatches = [...matches].filter(g => allYearTopics.includes(g) && this.generators[g]);

        console.log(`[Topic Mapper] Matches before filtering: [${[...matches].join(', ')}]`);
        console.log(`[Topic Mapper] Valid for Year ${year}: [${validMatches.join(', ')}]`);

        // STEP 6: Fuzzy matching fallback (Levenshtein distance)
        if (validMatches.length === 0) {
            console.log(`[Topic Mapper] No matches found, trying fuzzy matching...`);

            for (const part of topicParts) {
                const words = part.split(/\s+/).filter(w => w.length >= 4);

                for (const word of words) {
                    for (const topic of allYearTopics) {
                        const topicLower = topic.toLowerCase();
                        const distance = this.levenshteinDistance(word, topicLower);

                        // Match if edit distance is <= 2 for words of similar length
                        if (distance <= 2 && Math.abs(word.length - topicLower.length) <= 3) {
                            validMatches.push(topic);
                            console.log(`[Topic Mapper] Fuzzy matched "${word}" to "${topic}" (distance: ${distance})`);
                        }
                    }
                }
            }
        }

        const finalResult = [...new Set(validMatches)];
        console.log(`[Topic Mapper] Final result: [${finalResult.join(', ')}]`);

        return finalResult;
    },

    // Generate revision questions from prior year
    generateRevision(year, difficulty, count) {
        if (year <= 1) return [];

        const priorYear = year - 1;
        const priorTopics = this.topics[priorYear].normal;
        const questions = [];

        for (let i = 0; i < count; i++) {
            const selectedTopic = priorTopics[Math.floor(Math.random() * priorTopics.length)];
            const generator = this.generators[selectedTopic];

            if (generator) {
                questions.push({
                    ...generator(priorYear, 'normal'),
                    topic: selectedTopic,
                    isRevision: true,
                    revisionYear: priorYear
                });
            }
        }

        return questions;
    },

    // Question generators by topic
    generators: {
        // Year 1 Topics
        counting: () => {
            const start = Math.floor(Math.random() * 10) + 1;
            const direction = Math.random() > 0.5 ? 'forward' : 'backward';
            const count = 5;

            if (direction === 'forward') {
                return {
                    question: `Count forward from ${start}. Write the next ${count} numbers.`,
                    visual: 'number-boxes',
                    visualData: { count, start, direction },
                    answer: Array.from({ length: count }, (_, i) => start + i + 1).join(', '),
                    explanation: `Start at ${start} and add 1 each time: ${Array.from({ length: count }, (_, i) => start + i + 1).join(', ')}`,
                    type: 'counting',
                    inputType: 'sequence'
                };
            } else {
                const highStart = start + 10;
                return {
                    question: `Count backward from ${highStart}. Write the next ${count} numbers.`,
                    visual: 'number-boxes',
                    visualData: { count, start: highStart, direction },
                    answer: Array.from({ length: count }, (_, i) => highStart - i - 1).join(', '),
                    explanation: `Start at ${highStart} and subtract 1 each time: ${Array.from({ length: count }, (_, i) => highStart - i - 1).join(', ')}`,
                    type: 'counting',
                    inputType: 'sequence'
                };
            }
        },

        additionSimple: () => {
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * (10 - a)) + 1;
            const sum = a + b;

            // Word problem contexts
            const items = ['apples', 'oranges', 'sweets', 'stickers', 'pencils', 'books', 'toys', 'flowers', 'cookies', 'marbles', 'buttons', 'shells', 'stars', 'balloons', 'crayons'];
            const names = ['Sam', 'Alex', 'Kim', 'Pat', 'Jo', 'Max', 'Ben', 'Lily', 'Emma', 'Tom', 'Mia', 'Jake', 'Zoe', 'Leo', 'Ivy'];
            const verbs = ['picks', 'finds', 'gets', 'buys', 'collects', 'receives', 'wins'];

            const item = items[Math.floor(Math.random() * items.length)];
            const name = names[Math.floor(Math.random() * names.length)];
            const verb = verbs[Math.floor(Math.random() * verbs.length)];

            // 8 different question formats
            const formats = [
                // Format 1: Direct equation
                {
                    question: `${a} + ${b} = ?`,
                    answer: String(sum),
                    explanation: `${a} + ${b} = ${sum}`
                },
                // Format 2: Horizontal with "What is"
                {
                    question: `What is ${a} + ${b}?`,
                    answer: String(sum),
                    explanation: `${a} plus ${b} equals ${sum}`
                },
                // Format 3: Missing addend (first position)
                {
                    question: `___ + ${b} = ${sum}. What is the missing number?`,
                    answer: String(a),
                    explanation: `${a} + ${b} = ${sum}, so the missing number is ${a}`
                },
                // Format 4: Missing addend (second position)
                {
                    question: `${a} + ___ = ${sum}. What is the missing number?`,
                    answer: String(b),
                    explanation: `${a} + ${b} = ${sum}, so the missing number is ${b}`
                },
                // Format 5: Word problem - basic
                {
                    question: `${name} has ${a} ${item}. Then ${name} ${verb} ${b} more. How many ${item} does ${name} have now?`,
                    answer: String(sum),
                    explanation: `${a} + ${b} = ${sum} ${item}`
                },
                // Format 6: Word problem - combining groups
                {
                    question: `There are ${a} red ${item} and ${b} blue ${item}. How many ${item} are there altogether?`,
                    answer: String(sum),
                    explanation: `${a} + ${b} = ${sum} ${item} in total`
                },
                // Format 7: Comparison
                {
                    question: `Which is more: ${a} + ${b} or ${sum - 1}?`,
                    answer: `${a} + ${b}`,
                    explanation: `${a} + ${b} = ${sum}, which is more than ${sum - 1}`
                },
                // Format 8: True/False
                {
                    question: `True or False: ${a} + ${b} = ${sum}?`,
                    answer: 'True',
                    explanation: `Yes, ${a} + ${b} = ${sum}`
                }
            ];

            const chosen = formats[Math.floor(Math.random() * formats.length)];
            return {
                question: chosen.question,
                visual: null,
                answer: chosen.answer,
                explanation: chosen.explanation,
                type: 'arithmetic',
                inputType: 'text'
            };
        },


        subtractionSimple: () => {
            const b = Math.floor(Math.random() * 10) + 1;
            const a = b + Math.floor(Math.random() * 10) + 1;
            const diff = a - b;

            // Word problem contexts
            const items = ['apples', 'oranges', 'sweets', 'stickers', 'pencils', 'books', 'toys', 'flowers', 'cookies', 'marbles', 'buttons', 'shells', 'stars', 'balloons', 'crayons'];
            const names = ['Sam', 'Alex', 'Kim', 'Pat', 'Jo', 'Max', 'Ben', 'Lily', 'Emma', 'Tom', 'Mia', 'Jake', 'Zoe', 'Leo', 'Ivy'];
            const lostVerbs = ['gives away', 'loses', 'eats', 'gives to a friend', 'uses', 'drops', 'shares'];

            const item = items[Math.floor(Math.random() * items.length)];
            const name = names[Math.floor(Math.random() * names.length)];
            const verb = lostVerbs[Math.floor(Math.random() * lostVerbs.length)];

            const formats = [
                // Format 1: Direct equation
                { question: `${a} - ${b} = ?`, answer: String(diff), explanation: `${a} - ${b} = ${diff}` },
                // Format 2: What is
                { question: `What is ${a} - ${b}?`, answer: String(diff), explanation: `${a} minus ${b} equals ${diff}` },
                // Format 3: Missing minuend
                { question: `___ - ${b} = ${diff}. What is the missing number?`, answer: String(a), explanation: `${a} - ${b} = ${diff}` },
                // Format 4: Missing subtrahend
                { question: `${a} - ___ = ${diff}. What is the missing number?`, answer: String(b), explanation: `${a} - ${b} = ${diff}` },
                // Format 5: Word problem - taking away
                { question: `${name} has ${a} ${item}. ${name} ${verb} ${b}. How many ${item} does ${name} have left?`, answer: String(diff), explanation: `${a} - ${b} = ${diff} ${item}` },
                // Format 6: Word problem - difference
                { question: `There are ${a} birds on a tree. ${b} fly away. How many birds are left?`, answer: String(diff), explanation: `${a} - ${b} = ${diff} birds` },
                // Format 7: Word problem - comparison
                { question: `${name} has ${a} ${item}. Jo has ${b} ${item}. How many more does ${name} have?`, answer: String(diff), explanation: `${a} - ${b} = ${diff} more` },
                // Format 8: True/False with wrong answer
                { question: `True or False: ${a} - ${b} = ${diff + 1}?`, answer: 'False', explanation: `${a} - ${b} = ${diff}, not ${diff + 1}` }
            ];

            const chosen = formats[Math.floor(Math.random() * formats.length)];
            return { question: chosen.question, visual: null, answer: chosen.answer, explanation: chosen.explanation, type: 'arithmetic', inputType: 'text' };
        },


        shapes2D: () => {
            const shapes = [
                { name: 'circle', sides: 0, description: 'round with no corners' },
                { name: 'triangle', sides: 3, description: '3 sides and 3 corners' },
                { name: 'square', sides: 4, description: '4 equal sides and 4 corners' },
                { name: 'rectangle', sides: 4, description: '4 sides with opposite sides equal' },
                { name: 'pentagon', sides: 5, description: '5 sides and 5 corners' },
                { name: 'hexagon', sides: 6, description: '6 sides and 6 corners' },
                { name: 'rhombus', sides: 4, description: '4 equal sides like a tilted square' },
                { name: 'parallelogram', sides: 4, description: '4 sides with opposite sides parallel' },
                { name: 'trapezoid', sides: 4, description: '4 sides with one pair of parallel sides' },
                { name: 'oval', sides: 0, description: 'elongated circle shape' },
                { name: 'octagon', sides: 8, description: '8 sides and 8 corners' },
                { name: 'semicircle', sides: 1, description: 'half of a circle' },
                { name: 'star', sides: 10, description: 'pointed shape with 5 points' }
            ];

            const questionTypes = ['identify', 'sides', 'corners'];
            const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];

            if (qType === 'identify') {
                return {
                    question: `What shape is this?`,
                    visual: 'shape',
                    visualData: { shape: shape.name },
                    answer: shape.name.charAt(0).toUpperCase() + shape.name.slice(1),
                    explanation: `This is a ${shape.name}. It is ${shape.description}.`,
                    type: 'geometry',
                    inputType: 'text'
                };
            } else if (qType === 'sides') {
                return {
                    question: `How many sides does a ${shape.name} have?`,
                    visual: 'shape',
                    visualData: { shape: shape.name },
                    answer: String(shape.sides),
                    explanation: `A ${shape.name} has ${shape.sides} sides.`,
                    type: 'geometry',
                    inputType: 'number'
                };
            } else {
                const corners = shape.sides;
                return {
                    question: `How many corners does a ${shape.name} have?`,
                    visual: 'shape',
                    visualData: { shape: shape.name },
                    answer: String(corners),
                    explanation: `A ${shape.name} has ${corners} corners (also called vertices).`,
                    type: 'geometry',
                    inputType: 'number'
                };
            }
        },


        comparingNumbers: () => {
            const a = Math.floor(Math.random() * 20) + 1;
            let b = Math.floor(Math.random() * 20) + 1;
            while (b === a) b = Math.floor(Math.random() * 20) + 1;

            const comparison = a > b ? '>' : '<';
            const word = a > b ? 'greater than' : 'less than';

            return {
                question: `Which symbol goes in the box?  ${a} ☐ ${b}\n\nChoose: < (less than) or > (greater than)`,
                visual: null,
                answer: comparison,
                explanation: `${a} is ${word} ${b}, so we write ${a} ${comparison} ${b}`,
                type: 'comparison',
                inputType: 'symbol',
                choices: ['<', '>']
            };
        },

        numberBonds: () => {
            const total = 10;
            const a = Math.floor(Math.random() * 9) + 1;
            const b = total - a;
            const hide = Math.random() > 0.5 ? 'first' : 'second';

            if (hide === 'first') {
                return {
                    question: `Number bond to ${total}:\n☐ + ${b} = ${total}`,
                    visual: 'number-bond',
                    visualData: { total, known: b, position: 'second' },
                    answer: String(a),
                    explanation: `${total} - ${b} = ${a}, so ${a} + ${b} = ${total}`,
                    type: 'number-bonds',
                    inputType: 'number'
                };
            } else {
                return {
                    question: `Number bond to ${total}:\n${a} + ☐ = ${total}`,
                    visual: 'number-bond',
                    visualData: { total, known: a, position: 'first' },
                    answer: String(b),
                    explanation: `${total} - ${a} = ${b}, so ${a} + ${b} = ${total}`,
                    type: 'number-bonds',
                    inputType: 'number'
                };
            }
        },

        countingPatterns: () => {
            const patterns = [2, 5, 10];
            const step = patterns[Math.floor(Math.random() * patterns.length)];
            const start = step;
            const sequence = Array.from({ length: 5 }, (_, i) => start + step * i);
            const hideIndex = Math.floor(Math.random() * 3) + 2;

            const displaySequence = sequence.map((n, i) => i === hideIndex ? '☐' : n).join(', ');

            return {
                question: `Complete the pattern (counting in ${step}s):\n${displaySequence}`,
                visual: null,
                answer: String(sequence[hideIndex]),
                explanation: `The pattern goes up in ${step}s. The missing number is ${sequence[hideIndex]}.`,
                type: 'patterns',
                inputType: 'number'
            };
        },

        positionDirection: () => {
            const positions = [
                { word: 'left', opposite: 'right' },
                { word: 'right', opposite: 'left' },
                { word: 'above', opposite: 'below' },
                { word: 'below', opposite: 'above' },
                { word: 'in front of', opposite: 'behind' },
                { word: 'behind', opposite: 'in front of' }
            ];

            const pos = positions[Math.floor(Math.random() * positions.length)];
            const objects = ['🐱 cat', '🐕 dog', '🏠 house', '🌳 tree', '⚽ ball'];
            const obj1 = objects[Math.floor(Math.random() * objects.length)];
            let obj2 = objects[Math.floor(Math.random() * objects.length)];
            while (obj2 === obj1) obj2 = objects[Math.floor(Math.random() * objects.length)];

            return {
                question: `The ${obj1} is to the ${pos.word} of the ${obj2}.\nWhere is the ${obj2} compared to the ${obj1}?`,
                visual: null,
                answer: pos.opposite,
                explanation: `If A is ${pos.word} B, then B is ${pos.opposite} A.`,
                type: 'position',
                inputType: 'text'
            };
        },

        // Year 2 Topics
        addition100: () => {
            const a = Math.floor(Math.random() * 50) + 10;
            const b = Math.floor(Math.random() * 40) + 10;
            return {
                question: `${a} + ${b} = ?`,
                visual: null,
                answer: String(a + b),
                explanation: `Add the ones first: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}\nThen add the tens: ${Math.floor(a / 10)}0 + ${Math.floor(b / 10)}0 = ${(Math.floor(a / 10) + Math.floor(b / 10)) * 10}\nTotal: ${a + b}`,
                type: 'arithmetic',
                inputType: 'number'
            };
        },

        subtraction100: () => {
            const a = Math.floor(Math.random() * 50) + 50;
            const b = Math.floor(Math.random() * 40) + 10;
            return {
                question: `${a} - ${b} = ?`,
                visual: null,
                answer: String(a - b),
                explanation: `Subtract: ${a} - ${b} = ${a - b}`,
                type: 'arithmetic',
                inputType: 'number'
            };
        },

        multiplication2510: () => {
            const tables = [2, 5, 10];
            const table = tables[Math.floor(Math.random() * tables.length)];
            const multiplier = Math.floor(Math.random() * 10) + 1;

            return {
                question: `${table} × ${multiplier} = ?`,
                visual: null,
                answer: String(table * multiplier),
                explanation: `${table} × ${multiplier} = ${table * multiplier} (${table} groups of ${multiplier})`,
                type: 'multiplication',
                inputType: 'number'
            };
        },

        fractions12: () => {
            const total = [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)];
            const half = total / 2;
            const quarter = total / 4;
            const useHalf = Math.random() > 0.5 || total % 4 !== 0;

            if (useHalf) {
                return {
                    question: `What is half of ${total}?`,
                    visual: 'fraction-bar',
                    visualData: { total, shaded: half },
                    answer: String(half),
                    explanation: `Half means dividing into 2 equal parts. ${total} ÷ 2 = ${half}`,
                    type: 'fractions',
                    inputType: 'number'
                };
            } else {
                return {
                    question: `What is one quarter (¼) of ${total}?`,
                    visual: 'fraction-bar',
                    visualData: { total, shaded: quarter },
                    answer: String(quarter),
                    explanation: `One quarter means dividing into 4 equal parts. ${total} ÷ 4 = ${quarter}`,
                    type: 'fractions',
                    inputType: 'number'
                };
            }
        },

        tellingTime: () => {
            const hour = Math.floor(Math.random() * 12) + 1;
            const minuteOptions = [0, 30];
            const minutes = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];

            const timeString = minutes === 0 ? `${hour} o'clock` : `half past ${hour}`;

            return {
                question: `What time does the clock show?`,
                visual: 'clock',
                visualData: { hour, minutes },
                answer: timeString,
                explanation: `The short hand points to ${hour} and the long hand points to ${minutes === 0 ? '12' : '6'}, so it's ${timeString}.`,
                type: 'time',
                inputType: 'text'
            };
        },

        money: () => {
            const coins = [1, 2, 5, 10, 20, 50, 100];
            const numCoins = Math.floor(Math.random() * 3) + 2;
            const selectedCoins = [];
            let total = 0;

            for (let i = 0; i < numCoins; i++) {
                const coin = coins[Math.floor(Math.random() * 6)];
                selectedCoins.push(coin);
                total += coin;
            }

            const coinStr = selectedCoins.map(c => c >= 100 ? `£${c / 100}` : `${c}p`).join(' + ');
            const totalStr = total >= 100 ? `£${(total / 100).toFixed(2)}` : `${total}p`;

            // Context banks
            const items = ['sweet', 'apple', 'pencil', 'rubber', 'ruler', 'sticker', 'lolly', 'drink', 'comic', 'badge'];
            const names = ['Sam', 'Alex', 'Kim', 'Jo', 'Max', 'Ben', 'Lily', 'Emma', 'Tom', 'Mia'];
            const item = items[Math.floor(Math.random() * items.length)];
            const name = names[Math.floor(Math.random() * names.length)];

            // Generate a price and paid amount for change problems
            const itemPrice = [5, 10, 15, 20, 25, 30, 35, 40, 45][Math.floor(Math.random() * 9)];
            const paidAmounts = [50, 100, 200];
            const paid = paidAmounts.find(p => p > itemPrice) || 100;
            const change = paid - itemPrice;
            const paidStr = paid >= 100 ? `£${paid / 100}` : `${paid}p`;
            const changeStr = change >= 100 ? `£${(change / 100).toFixed(2)}` : `${change}p`;
            const priceStr = itemPrice >= 100 ? `£${(itemPrice / 100).toFixed(2)}` : `${itemPrice}p`;

            const formats = [
                // Adding coins
                { question: `How much money is this altogether?\n${coinStr}`, visual: 'coins', visualData: { coins: selectedCoins }, answer: totalStr, explanation: `${coinStr} = ${totalStr}` },
                // Make change
                { question: `${name} buys a ${item} for ${priceStr}. ${name} pays with ${paidStr}. How much change?`, answer: changeStr, explanation: `${paidStr} - ${priceStr} = ${changeStr}` },
                // Enough money?
                { question: `${name} has ${totalStr}. A ${item} costs ${priceStr}. Does ${name} have enough money?`, answer: total >= itemPrice ? 'Yes' : 'No', explanation: `${totalStr} is ${total >= itemPrice ? 'enough' : 'not enough'} for ${priceStr}` },
                // How much left
                { question: `${name} has ${totalStr} and spends ${priceStr}. How much is left?`, answer: total >= itemPrice ? `${total - itemPrice}p` : 'Not enough', explanation: `${totalStr} - ${priceStr} = ${total >= itemPrice ? (total - itemPrice) + 'p' : 'not enough'}` },
                // Total cost
                { question: `A ${item} costs ${priceStr}. How much for 2?`, answer: `${itemPrice * 2}p`, explanation: `${priceStr} × 2 = ${itemPrice * 2}p` },
                // Coin recognition
                { question: `Which coins could make ${priceStr}? Write one way.`, answer: `Various (e.g., ${priceStr})`, explanation: `There are multiple ways to make ${priceStr}` },
                // More or less
                { question: `Which is more: ${totalStr} or ${priceStr}?`, answer: total > itemPrice ? totalStr : priceStr, explanation: `${total > itemPrice ? totalStr + ' is more' : priceStr + ' is more'}` },
                // Word problem
                { question: `${name} has 3 coins worth ${totalStr} altogether. What could the coins be?`, answer: `Various`, explanation: `Different combinations of coins can make ${totalStr}` }
            ];

            const chosen = formats[Math.floor(Math.random() * formats.length)];
            return { question: chosen.question, visual: chosen.visual || null, visualData: chosen.visualData || null, answer: chosen.answer, explanation: chosen.explanation, type: 'money', inputType: 'text' };
        },


        // Year 3+ Topics
        multiplicationFacts: () => {
            const table = Math.floor(Math.random() * 10) + 2;
            const multiplier = Math.floor(Math.random() * 12) + 1;
            const product = table * multiplier;

            // Context banks
            const items = ['boxes', 'bags', 'packs', 'trays', 'rows', 'groups', 'sets', 'bunches', 'cartons', 'baskets'];
            const contents = ['apples', 'eggs', 'sweets', 'pencils', 'books', 'stickers', 'crayons', 'cookies', 'oranges', 'cupcakes', 'muffins', 'stamps'];
            const names = ['Sam', 'Alex', 'Kim', 'Jo', 'Max', 'Ben', 'Lily', 'Emma', 'Tom', 'Mia', 'Jake', 'Zoe'];

            const item = items[Math.floor(Math.random() * items.length)];
            const content = contents[Math.floor(Math.random() * contents.length)];
            const name = names[Math.floor(Math.random() * names.length)];

            const formats = [
                // Direct equations
                { question: `${table} × ${multiplier} = ?`, answer: String(product), explanation: `${table} × ${multiplier} = ${product}` },
                { question: `What is ${multiplier} times ${table}?`, answer: String(product), explanation: `${multiplier} × ${table} = ${product}` },
                { question: `Calculate: ${table} × ${multiplier}`, answer: String(product), explanation: `${table} times ${multiplier} equals ${product}` },
                // Missing factor (first)
                { question: `___ × ${multiplier} = ${product}. Find the missing number.`, answer: String(table), explanation: `${table} × ${multiplier} = ${product}` },
                // Missing factor (second)
                { question: `${table} × ___ = ${product}. Find the missing number.`, answer: String(multiplier), explanation: `${table} × ${multiplier} = ${product}` },
                // Word problem - equal groups
                { question: `There are ${multiplier} ${item} with ${table} ${content} in each. How many ${content} altogether?`, answer: String(product), explanation: `${multiplier} × ${table} = ${product} ${content}` },
                // Word problem - rows
                { question: `${name} arranges ${product} ${content} in ${multiplier} equal rows. How many in each row?`, answer: String(table), explanation: `${product} ÷ ${multiplier} = ${table} in each row` },
                // Word problem - repeated addition link
                { question: `What is ${table} + ${table} + ${table}... (${multiplier} times)?`, answer: String(product), explanation: `${table} added ${multiplier} times = ${table} × ${multiplier} = ${product}` },
                // Array problem
                { question: `A grid has ${table} rows and ${multiplier} columns. How many squares?`, answer: String(product), explanation: `${table} rows × ${multiplier} columns = ${product} squares` },
                // Scaling
                { question: `${name} has ${table} ${content}. ${name}'s friend has ${multiplier} times as many. How many does the friend have?`, answer: String(product), explanation: `${table} × ${multiplier} = ${product} ${content}` }
            ];

            const chosen = formats[Math.floor(Math.random() * formats.length)];
            return { question: chosen.question, visual: null, answer: chosen.answer, explanation: chosen.explanation, type: 'multiplication', inputType: 'text' };
        },


        divisionFacts: () => {
            const divisor = Math.floor(Math.random() * 10) + 2;
            const quotient = Math.floor(Math.random() * 10) + 1;
            const dividend = divisor * quotient;

            // Context banks
            const items = ['sweets', 'stickers', 'cookies', 'pencils', 'apples', 'marbles', 'cards', 'flowers', 'cupcakes', 'oranges', 'crayons', 'stamps'];
            const containers = ['bags', 'boxes', 'plates', 'groups', 'baskets', 'piles', 'sets', 'bunches'];
            const names = ['Sam', 'Alex', 'Kim', 'Jo', 'Max', 'Ben', 'Lily', 'Emma', 'Tom', 'Mia', 'Jake', 'Zoe'];

            const item = items[Math.floor(Math.random() * items.length)];
            const container = containers[Math.floor(Math.random() * containers.length)];
            const name = names[Math.floor(Math.random() * names.length)];

            const formats = [
                // Direct equations
                { question: `${dividend} ÷ ${divisor} = ?`, answer: String(quotient), explanation: `${dividend} ÷ ${divisor} = ${quotient}` },
                { question: `What is ${dividend} divided by ${divisor}?`, answer: String(quotient), explanation: `${dividend} ÷ ${divisor} = ${quotient}` },
                { question: `Calculate: ${dividend} ÷ ${divisor}`, answer: String(quotient), explanation: `${dividend} divided by ${divisor} equals ${quotient}` },
                // Missing dividend
                { question: `___ ÷ ${divisor} = ${quotient}. Find the missing number.`, answer: String(dividend), explanation: `${dividend} ÷ ${divisor} = ${quotient}` },
                // Missing divisor
                { question: `${dividend} ÷ ___ = ${quotient}. Find the missing number.`, answer: String(divisor), explanation: `${dividend} ÷ ${divisor} = ${quotient}` },
                // Sharing word problem
                { question: `${name} shares ${dividend} ${item} equally among ${divisor} friends. How many does each friend get?`, answer: String(quotient), explanation: `${dividend} ÷ ${divisor} = ${quotient} ${item} each` },
                // Grouping word problem
                { question: `There are ${dividend} ${item}. ${name} puts them in ${container} of ${divisor}. How many ${container}?`, answer: String(quotient), explanation: `${dividend} ÷ ${divisor} = ${quotient} ${container}` },
                // How many groups
                { question: `${dividend} children need to be split into teams of ${divisor}. How many teams?`, answer: String(quotient), explanation: `${dividend} ÷ ${divisor} = ${quotient} teams` },
                // Inverse multiplication
                { question: `What number multiplied by ${divisor} gives ${dividend}?`, answer: String(quotient), explanation: `${quotient} × ${divisor} = ${dividend}` },
                // Word problem - distribution
                { question: `A baker has ${dividend} ${item} and puts ${divisor} in each box. How many boxes?`, answer: String(quotient), explanation: `${dividend} ÷ ${divisor} = ${quotient} boxes` }
            ];

            const chosen = formats[Math.floor(Math.random() * formats.length)];
            return { question: chosen.question, visual: null, answer: chosen.answer, explanation: chosen.explanation, type: 'division', inputType: 'text' };
        },


        columnAddition: () => {
            const a = Math.floor(Math.random() * 400) + 100;
            const b = Math.floor(Math.random() * 400) + 100;

            return {
                question: `Use column addition to solve:\n\n  ${a}\n+ ${b}\n────`,
                visual: null,
                answer: String(a + b),
                explanation: `Add the ones: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}\nAdd the tens: ${Math.floor((a % 100) / 10)} + ${Math.floor((b % 100) / 10)} = ${Math.floor((a % 100) / 10) + Math.floor((b % 100) / 10)}\nAdd the hundreds: ${Math.floor(a / 100)} + ${Math.floor(b / 100)} = ${Math.floor(a / 100) + Math.floor(b / 100)}\nTotal: ${a + b}`,
                type: 'arithmetic',
                inputType: 'number'
            };
        },

        columnSubtraction: () => {
            const a = Math.floor(Math.random() * 400) + 500;
            const b = Math.floor(Math.random() * 300) + 100;

            return {
                question: `Use column subtraction to solve:\n\n  ${a}\n- ${b}\n────`,
                visual: null,
                answer: String(a - b),
                explanation: `Subtract column by column from right to left.\n${a} - ${b} = ${a - b}`,
                type: 'arithmetic',
                inputType: 'number'
            };
        },

        unitFractions: () => {
            const denominators = [2, 3, 4, 5, 6, 8, 10];
            const denominator = denominators[Math.floor(Math.random() * denominators.length)];
            const total = denominator * (Math.floor(Math.random() * 4) + 2);
            const answer = total / denominator;

            return {
                question: `What is 1/${denominator} of ${total}?`,
                visual: 'fraction-bar',
                visualData: { total, parts: denominator },
                answer: String(answer),
                explanation: `1/${denominator} of ${total} = ${total} ÷ ${denominator} = ${answer}`,
                type: 'fractions',
                inputType: 'number'
            };
        },

        time5min: () => {
            const hour = Math.floor(Math.random() * 12) + 1;
            const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
            const minutes = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];

            const timeString = `${hour}:${minutes.toString().padStart(2, '0')}`;

            return {
                question: `What time does the clock show? Write in digital format (e.g., 3:25)`,
                visual: 'clock',
                visualData: { hour, minutes },
                answer: timeString,
                explanation: `The hour hand is near ${hour} and the minute hand points to ${minutes / 5 * 1}, which is ${minutes} minutes. Time: ${timeString}`,
                type: 'time',
                inputType: 'text'
            };
        },

        perimeter: () => {
            const shapes = ['rectangle', 'square'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];

            if (shape === 'square') {
                const side = Math.floor(Math.random() * 8) + 3;
                return {
                    question: `Find the perimeter of a square with sides of ${side}cm.`,
                    visual: 'shape-measurements',
                    visualData: { shape: 'square', side },
                    answer: `${side * 4}cm`,
                    explanation: `Perimeter of a square = 4 × side = 4 × ${side} = ${side * 4}cm`,
                    type: 'perimeter',
                    inputType: 'text'
                };
            } else {
                const length = Math.floor(Math.random() * 8) + 5;
                const width = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `Find the perimeter of a rectangle with length ${length}cm and width ${width}cm.`,
                    visual: 'shape-measurements',
                    visualData: { shape: 'rectangle', length, width },
                    answer: `${2 * (length + width)}cm`,
                    explanation: `Perimeter of a rectangle = 2 × (length + width) = 2 × (${length} + ${width}) = 2 × ${length + width} = ${2 * (length + width)}cm`,
                    type: 'perimeter',
                    inputType: 'text'
                };
            }
        },

        // Year 4+ Topics
        multiDigitMultiplication: () => {
            const a = Math.floor(Math.random() * 90) + 10;
            const b = Math.floor(Math.random() * 9) + 2;

            return {
                question: `${a} × ${b} = ?`,
                visual: null,
                answer: String(a * b),
                explanation: `${a} × ${b}: First ${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}, then ${a % 10} × ${b} = ${(a % 10) * b}. Total: ${a * b}`,
                type: 'multiplication',
                inputType: 'number'
            };
        },

        shortDivision: () => {
            const divisor = Math.floor(Math.random() * 8) + 2;
            const quotient = Math.floor(Math.random() * 30) + 10;
            const dividend = divisor * quotient;

            return {
                question: `${dividend} ÷ ${divisor} = ?`,
                visual: null,
                answer: String(quotient),
                explanation: `${dividend} ÷ ${divisor} = ${quotient}`,
                type: 'division',
                inputType: 'number'
            };
        },

        decimalTenths: () => {
            const whole = Math.floor(Math.random() * 9) + 1;
            const tenths = Math.floor(Math.random() * 9) + 1;
            const decimal = whole + tenths / 10;

            const questionTypes = ['write', 'add'];
            const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

            if (qType === 'write') {
                return {
                    question: `Write this as a decimal: ${whole} and ${tenths} tenths`,
                    visual: null,
                    answer: decimal.toFixed(1),
                    explanation: `${whole} and ${tenths} tenths = ${decimal.toFixed(1)}`,
                    type: 'decimals',
                    inputType: 'text'
                };
            } else {
                const other = (Math.floor(Math.random() * 9) + 1) / 10;
                const sum = decimal + other;
                return {
                    question: `${decimal.toFixed(1)} + ${other.toFixed(1)} = ?`,
                    visual: null,
                    answer: sum.toFixed(1),
                    explanation: `Add the tenths: ${tenths / 10} + ${other} = ${tenths / 10 + other}. Add the whole: ${whole}. Total: ${sum.toFixed(1)}`,
                    type: 'decimals',
                    inputType: 'text'
                };
            }
        },

        areaRectangles: () => {
            const length = Math.floor(Math.random() * 8) + 3;
            const width = Math.floor(Math.random() * 6) + 2;

            return {
                question: `Find the area of a rectangle with length ${length}cm and width ${width}cm.`,
                visual: 'shape-measurements',
                visualData: { shape: 'rectangle', length, width, showGrid: true },
                answer: `${length * width}cm²`,
                explanation: `Area of a rectangle = length × width = ${length} × ${width} = ${length * width}cm²`,
                type: 'area',
                inputType: 'text'
            };
        },

        symmetry: () => {
            const shapes = [
                { name: 'square', lines: 4 },
                { name: 'rectangle', lines: 2 },
                { name: 'equilateral triangle', lines: 3 },
                { name: 'circle', lines: 'infinite' },
                { name: 'regular hexagon', lines: 6 }
            ];

            const shape = shapes[Math.floor(Math.random() * shapes.length)];

            return {
                question: `How many lines of symmetry does a ${shape.name} have?`,
                visual: 'shape',
                visualData: { shape: shape.name.split(' ').pop() },
                answer: String(shape.lines),
                explanation: `A ${shape.name} has ${shape.lines} lines of symmetry.`,
                type: 'symmetry',
                inputType: 'text'
            };
        },

        // Year 5+ Topics - Multiplication by digit count
        // 2-digit × 2-digit (e.g., 34 × 56)
        longMultiplication: () => {
            const a = Math.floor(Math.random() * 90) + 10; // 10-99
            const b = Math.floor(Math.random() * 90) + 10; // 10-99

            return {
                question: `Calculate: ${a} × ${b} = ?`,
                visual: null,
                answer: String(a * b),
                explanation: `${a} × ${b} = ${a * b}`,
                type: 'multiplication',
                inputType: 'number'
            };
        },

        // 3-digit × 2-digit (e.g., 345 × 67)
        mult3x2: () => {
            const a = Math.floor(Math.random() * 900) + 100; // 100-999 (3 digits)
            const b = Math.floor(Math.random() * 90) + 10;   // 10-99 (2 digits)

            return {
                question: `Calculate: ${a} × ${b} = ?`,
                visual: null,
                answer: String(a * b),
                explanation: `${a} × ${b} = ${a * b}`,
                type: 'multiplication',
                inputType: 'number'
            };
        },

        // 3-digit × 3-digit (e.g., 345 × 678)
        mult3x3: () => {
            const a = Math.floor(Math.random() * 900) + 100; // 100-999 (3 digits)
            const b = Math.floor(Math.random() * 900) + 100; // 100-999 (3 digits)

            return {
                question: `Calculate: ${a} × ${b} = ?`,
                visual: null,
                answer: String(a * b),
                explanation: `${a} × ${b} = ${a * b}`,
                type: 'multiplication',
                inputType: 'number'
            };
        },

        longDivision: () => {
            const divisor = Math.floor(Math.random() * 9) + 2;
            const quotient = Math.floor(Math.random() * 50) + 20;
            const dividend = divisor * quotient;

            return {
                question: `${dividend} ÷ ${divisor} = ?`,
                visual: null,
                answer: String(quotient),
                explanation: `${dividend} ÷ ${divisor} = ${quotient}`,
                type: 'division',
                inputType: 'number'
            };
        },

        fractionOperations: () => {
            const operations = ['add', 'subtract'];
            const operation = operations[Math.floor(Math.random() * operations.length)];
            const denominator = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
            let num1 = Math.floor(Math.random() * (denominator - 1)) + 1;
            let num2 = Math.floor(Math.random() * (denominator - 1)) + 1;

            if (operation === 'subtract' && num2 > num1) {
                const temp = num1;
                num1 = num2;
                num2 = temp;
            }

            const symbol = operation === 'add' ? '+' : '-';
            const result = operation === 'add' ? num1 + num2 : num1 - num2;

            return {
                question: `${num1}/${denominator} ${symbol} ${num2}/${denominator} = ?`,
                visual: null,
                answer: result >= denominator ? `${Math.floor(result / denominator)} ${result % denominator}/${denominator}` : `${result}/${denominator}`,
                explanation: `When denominators are the same, ${operation} the numerators: ${num1} ${symbol} ${num2} = ${result}. Answer: ${result}/${denominator}`,
                type: 'fractions',
                inputType: 'text'
            };
        },

        percentageBasics: () => {
            const percentages = [10, 20, 25, 50, 75, 100, 5, 15, 30];
            const percent = percentages[Math.floor(Math.random() * percentages.length)];
            const totals = [20, 40, 50, 60, 80, 100, 120, 200, 150, 250];
            const total = totals[Math.floor(Math.random() * totals.length)];
            const answer = (percent / 100) * total;

            // Context banks
            const shopItems = ['shirt', 'book', 'game', 'toy', 'bag', 'shoes', 'jacket', 'watch', 'headphones', 'tablet'];
            const names = ['Sam', 'Alex', 'Kim', 'Jo', 'Max', 'Ben', 'Lily', 'Emma', 'Tom', 'Mia'];

            const shopItem = shopItems[Math.floor(Math.random() * shopItems.length)];
            const name = names[Math.floor(Math.random() * names.length)];

            const formats = [
                // Direct calculation
                { question: `What is ${percent}% of ${total}?`, answer: String(answer), explanation: `${percent}% of ${total} = ${answer}` },
                { question: `Calculate ${percent}% of ${total}.`, answer: String(answer), explanation: `${percent}% of ${total} = ${answer}` },
                { question: `Find ${percent}% of ${total}.`, answer: String(answer), explanation: `${percent}/100 × ${total} = ${answer}` },
                // Shopping discount
                { question: `A ${shopItem} costs £${total}. There is a ${percent}% discount. How much is the discount?`, answer: `£${answer}`, explanation: `${percent}% of £${total} = £${answer}` },
                // Sale price
                { question: `A ${shopItem} is £${total}. In a sale, ${percent}% is taken off. What is the sale price?`, answer: `£${total - answer}`, explanation: `Sale price = £${total} - £${answer} = £${total - answer}` },
                // Test scores
                { question: `${name} scored ${percent}% in a test with ${total} marks. How many marks did ${name} get?`, answer: String(answer), explanation: `${percent}% of ${total} = ${answer} marks` },
                // Money saved
                { question: `${name} saves ${percent}% of £${total}. How much does ${name} save?`, answer: `£${answer}`, explanation: `${percent}% of £${total} = £${answer}` },
                // Word problem
                { question: `There are ${total} children. ${percent}% are girls. How many girls are there?`, answer: String(answer), explanation: `${percent}% of ${total} = ${answer} girls` },
                // Reverse - find percentage (when possible)
                { question: `${answer} is what percentage of ${total}?`, answer: `${percent}%`, explanation: `${answer}/${total} × 100 = ${percent}%` },
                // Tip calculation
                { question: `At a restaurant, the bill is £${total}. ${name} wants to leave a ${percent}% tip. How much is the tip?`, answer: `£${answer}`, explanation: `${percent}% of £${total} = £${answer}` }
            ];

            const chosen = formats[Math.floor(Math.random() * formats.length)];
            return { question: chosen.question, visual: null, answer: chosen.answer, explanation: chosen.explanation, type: 'percentages', inputType: 'text' };
        },


        volume: () => {
            // Multiple shape types for variety
            const shapeType = Math.floor(Math.random() * 4);
            const names = ['Sam', 'Alex', 'Kim', 'Jo', 'Max', 'Ben', 'Lily', 'Emma', 'Tom', 'Mia'];
            const name = names[Math.floor(Math.random() * names.length)];
            const containers = ['box', 'tank', 'container', 'crate', 'storage unit', 'shipping container'];
            const container = containers[Math.floor(Math.random() * containers.length)];

            if (shapeType === 0) {
                // Cuboid questions
                const l = Math.floor(Math.random() * 5) + 2;
                const w = Math.floor(Math.random() * 4) + 2;
                const h = Math.floor(Math.random() * 4) + 2;
                const vol = l * w * h;

                const formats = [
                    { question: `Find the volume of a cuboid: length ${l}cm, width ${w}cm, height ${h}cm.`, answer: `${vol}cm³`, explanation: `${l} × ${w} × ${h} = ${vol}cm³` },
                    { question: `A ${container} is ${l}cm × ${w}cm × ${h}cm. What is its volume?`, answer: `${vol}cm³`, explanation: `${l} × ${w} × ${h} = ${vol}cm³` },
                    { question: `${name} has a ${container} that is ${l}cm long, ${w}cm wide, and ${h}cm tall. Find the volume.`, answer: `${vol}cm³`, explanation: `${l} × ${w} × ${h} = ${vol}cm³` },
                    { question: `What is the volume? Length=${l}cm, Width=${w}cm, Height=${h}cm`, answer: `${vol}cm³`, explanation: `Volume = l × w × h = ${vol}cm³` }
                ];
                const chosen = formats[Math.floor(Math.random() * formats.length)];
                return { question: chosen.question, visual: 'shape-3d-measurements', visualData: { shape: 'cuboid', length: l, width: w, height: h }, answer: chosen.answer, explanation: chosen.explanation, type: 'volume', inputType: 'text' };
            } else if (shapeType === 1) {
                // Cube questions
                const side = Math.floor(Math.random() * 5) + 2;
                const vol = side * side * side;

                const formats = [
                    { question: `A cube has sides of ${side}cm. What is its volume?`, answer: `${vol}cm³`, explanation: `${side} × ${side} × ${side} = ${vol}cm³` },
                    { question: `Find the volume of a cube with side length ${side}cm.`, answer: `${vol}cm³`, explanation: `${side}³ = ${vol}cm³` },
                    { question: `${name} has a cubic ${container} with edges of ${side}cm. What is the volume?`, answer: `${vol}cm³`, explanation: `${side} × ${side} × ${side} = ${vol}cm³` },
                    { question: `A dice-shaped ${container} has sides of ${side}cm. Calculate its volume.`, answer: `${vol}cm³`, explanation: `${side}³ = ${vol}cm³` }
                ];
                const chosen = formats[Math.floor(Math.random() * formats.length)];
                return { question: chosen.question, visual: 'shape-3d-measurements', visualData: { shape: 'cube', side }, answer: chosen.answer, explanation: chosen.explanation, type: 'volume', inputType: 'text' };
            } else if (shapeType === 2) {
                // Cylinder questions (using π ≈ 3)
                const r = Math.floor(Math.random() * 4) + 2;
                const h = Math.floor(Math.random() * 5) + 3;
                const vol = Math.round(3.14 * r * r * h);

                const formats = [
                    { question: `A cylinder has radius ${r}cm and height ${h}cm. Find its volume. (Use π ≈ 3.14)`, answer: `${vol}cm³`, explanation: `π × r² × h = 3.14 × ${r}² × ${h} ≈ ${vol}cm³` },
                    { question: `${name} has a cylindrical tin with radius ${r}cm and height ${h}cm. What is the volume? (π ≈ 3.14)`, answer: `${vol}cm³`, explanation: `3.14 × ${r} × ${r} × ${h} ≈ ${vol}cm³` },
                    { question: `A water tank is a cylinder: radius ${r}cm, height ${h}cm. Calculate volume. (π ≈ 3.14)`, answer: `${vol}cm³`, explanation: `π × ${r}² × ${h} ≈ ${vol}cm³` },
                    { question: `Find the volume of a cylinder with r=${r}cm and h=${h}cm. (Use π=3.14)`, answer: `${vol}cm³`, explanation: `3.14 × ${r * r} × ${h} ≈ ${vol}cm³` }
                ];
                const chosen = formats[Math.floor(Math.random() * formats.length)];
                return { question: chosen.question, visual: 'shape-3d-measurements', visualData: { shape: 'cylinder', radius: r, height: h }, answer: chosen.answer, explanation: chosen.explanation, type: 'volume', inputType: 'text' };
            } else {
                // Triangular prism questions
                const base = Math.floor(Math.random() * 4) + 3;
                const height = Math.floor(Math.random() * 4) + 2;
                const length = Math.floor(Math.random() * 5) + 3;
                const vol = Math.round(0.5 * base * height * length);

                const formats = [
                    { question: `A triangular prism has base ${base}cm, height ${height}cm, and length ${length}cm. Find its volume.`, answer: `${vol}cm³`, explanation: `½ × ${base} × ${height} × ${length} = ${vol}cm³` },
                    { question: `Find the volume: triangular prism with base=${base}cm, height=${height}cm, length=${length}cm.`, answer: `${vol}cm³`, explanation: `(½ × base × height) × length = ${vol}cm³` },
                    { question: `A tent-shaped ${container} has triangular ends (base ${base}cm, height ${height}cm) and is ${length}cm long. Volume?`, answer: `${vol}cm³`, explanation: `½ × ${base} × ${height} × ${length} = ${vol}cm³` }
                ];
                const chosen = formats[Math.floor(Math.random() * formats.length)];
                return { question: chosen.question, visual: 'shape', visualData: { shape: 'triangularPrism' }, answer: chosen.answer, explanation: chosen.explanation, type: 'volume', inputType: 'text' };
            }
        },


        // Year 6 Topics
        orderOperations: () => {
            const templates = [
                () => {
                    const a = Math.floor(Math.random() * 5) + 2;
                    const b = Math.floor(Math.random() * 5) + 2;
                    const c = Math.floor(Math.random() * 5) + 2;
                    return { expr: `${a} + ${b} × ${c}`, answer: a + b * c, explain: `First multiply: ${b} × ${c} = ${b * c}, then add: ${a} + ${b * c} = ${a + b * c}` };
                },
                () => {
                    const a = Math.floor(Math.random() * 5) + 2;
                    const b = Math.floor(Math.random() * 5) + 2;
                    const c = Math.floor(Math.random() * 5) + 2;
                    return { expr: `(${a} + ${b}) × ${c}`, answer: (a + b) * c, explain: `First brackets: ${a} + ${b} = ${a + b}, then multiply: ${a + b} × ${c} = ${(a + b) * c}` };
                }
            ];

            const template = templates[Math.floor(Math.random() * templates.length)]();

            return {
                question: `Calculate: ${template.expr}`,
                visual: null,
                answer: String(template.answer),
                explanation: template.explain,
                type: 'order-operations',
                inputType: 'number'
            };
        },

        ratio: () => {
            const a = Math.floor(Math.random() * 4) + 1;
            const b = Math.floor(Math.random() * 4) + 1;
            const multiplier = Math.floor(Math.random() * 5) + 2;
            const totalParts = a + b;
            const totalItems = totalParts * multiplier;

            // Context banks
            const pairs = [
                { item1: 'red beads', item2: 'blue beads' },
                { item1: 'boys', item2: 'girls' },
                { item1: 'apples', item2: 'oranges' },
                { item1: 'cats', item2: 'dogs' },
                { item1: 'blue counters', item2: 'red counters' },
                { item1: 'square tiles', item2: 'round tiles' },
                { item1: 'chocolate cookies', item2: 'plain cookies' }
            ];
            const recipeItems = [
                { item1: 'flour', unit1: 'cups', item2: 'sugar', unit2: 'cups' },
                { item1: 'water', unit1: 'ml', item2: 'juice', unit2: 'ml' },
                { item1: 'eggs', unit1: '', item2: 'cups of milk', unit2: '' }
            ];
            const names = ['Sam', 'Alex', 'Kim', 'Jo', 'Max', 'Ben', 'Lily', 'Emma'];

            const pair = pairs[Math.floor(Math.random() * pairs.length)];
            const recipe = recipeItems[Math.floor(Math.random() * recipeItems.length)];
            const name = names[Math.floor(Math.random() * names.length)];

            const formats = [
                // Given first part, find second
                { question: `The ratio of ${pair.item1} to ${pair.item2} is ${a}:${b}. If there are ${a * multiplier} ${pair.item1}, how many ${pair.item2}?`, answer: String(b * multiplier), explanation: `${a}:${b} ratio, ${a * multiplier}/${a} = ${multiplier}, so ${b * multiplier} ${pair.item2}` },
                // Given second part, find first
                { question: `The ratio of ${pair.item1} to ${pair.item2} is ${a}:${b}. If there are ${b * multiplier} ${pair.item2}, how many ${pair.item1}?`, answer: String(a * multiplier), explanation: `${a}:${b} ratio, ${b * multiplier}/${b} = ${multiplier}, so ${a * multiplier} ${pair.item1}` },
                // Find total
                { question: `${pair.item1} and ${pair.item2} are in ratio ${a}:${b}. There are ${a * multiplier} ${pair.item1}. How many items altogether?`, answer: String(totalItems), explanation: `${a * multiplier} + ${b * multiplier} = ${totalItems}` },
                // Sharing
                { question: `${name} shares £${totalItems} between two friends in ratio ${a}:${b}. How much does the first friend get?`, answer: `£${a * multiplier}`, explanation: `${totalItems} ÷ ${totalParts} = ${multiplier}, first friend: ${a} × ${multiplier} = £${a * multiplier}` },
                // Recipe scaling
                { question: `A recipe uses ${a} ${recipe.unit1} ${recipe.item1} to ${b} ${recipe.unit2} ${recipe.item2}. If you use ${a * multiplier} ${recipe.unit1} ${recipe.item1}, how much ${recipe.item2}?`, answer: `${b * multiplier}`, explanation: `Scale factor = ${multiplier}, so ${b * multiplier} ${recipe.item2}` },
                // Simplify ratio
                { question: `Write ${a * multiplier}:${b * multiplier} in its simplest form.`, answer: `${a}:${b}`, explanation: `Divide both by ${multiplier}: ${a}:${b}` },
                // What fraction
                { question: `In a class, ${pair.item1} to ${pair.item2} is ${a}:${b}. What fraction are ${pair.item1}?`, answer: `${a}/${totalParts}`, explanation: `${pair.item1} are ${a} out of ${totalParts} parts = ${a}/${totalParts}` },
                // Word problem
                { question: `Paint is mixed in ratio ${a}:${b} (blue:yellow). ${name} uses ${a * multiplier} litres of blue. How many litres of yellow?`, answer: `${b * multiplier} litres`, explanation: `${a * multiplier}/${a} = ${multiplier}, so ${b * multiplier} litres yellow` },
                // Compare
                { question: `There are ${a * multiplier} ${pair.item1} and ${b * multiplier} ${pair.item2}. Write this as a ratio.`, answer: `${a * multiplier}:${b * multiplier} or ${a}:${b}`, explanation: `${a * multiplier}:${b * multiplier} simplifies to ${a}:${b}` }
            ];

            const chosen = formats[Math.floor(Math.random() * formats.length)];
            return { question: chosen.question, visual: null, answer: chosen.answer, explanation: chosen.explanation, type: 'ratio', inputType: 'text' };
        },


        simpleAlgebra: () => {
            const x = Math.floor(Math.random() * 10) + 1;
            const a = Math.floor(Math.random() * 5) + 2;
            const b = Math.floor(Math.random() * 10) + 1;
            const result = a * x + b;

            // For subtraction form
            const c = Math.floor(Math.random() * 8) + 2;
            const resultSub = a * x - c;

            // For 2-step
            const d = Math.floor(Math.random() * 3) + 2;

            const names = ['Sam', 'Alex', 'Kim', 'Jo', 'Max', 'Ben', 'Lily', 'Emma'];
            const name = names[Math.floor(Math.random() * names.length)];

            const formats = [
                // Standard ax + b = c
                { question: `If ${a}x + ${b} = ${result}, what is x?`, answer: String(x), explanation: `${a}x = ${result} - ${b} = ${result - b}, x = ${x}` },
                // Different variable letters
                { question: `Solve: ${a}n + ${b} = ${result}`, answer: String(x), explanation: `${a}n = ${result - b}, n = ${x}` },
                { question: `Find y: ${a}y + ${b} = ${result}`, answer: String(x), explanation: `${a}y = ${result - b}, y = ${x}` },
                // Subtraction form
                { question: `If ${a}x - ${c} = ${a * x - c}, what is x?`, answer: String(x), explanation: `${a}x = ${a * x - c} + ${c} = ${a * x}, x = ${x}` },
                // Missing number
                { question: `What number goes in the box? ${a} × □ + ${b} = ${result}`, answer: String(x), explanation: `□ = (${result} - ${b}) ÷ ${a} = ${x}` },
                // Function machine
                { question: `A function machine does: ×${a} then +${b}. Input is ${x}. What's the output?`, answer: String(result), explanation: `${x} × ${a} = ${a * x}, then + ${b} = ${result}` },
                // Reverse function machine
                { question: `A function machine does: ×${a} then +${b}. Output is ${result}. What was the input?`, answer: String(x), explanation: `(${result} - ${b}) ÷ ${a} = ${x}` },
                // Word problem
                { question: `${name} thinks of a number, multiplies by ${a}, then adds ${b}. The answer is ${result}. What was the number?`, answer: String(x), explanation: `(${result} - ${b}) ÷ ${a} = ${x}` },
                // Pattern rule
                { question: `The pattern rule is: term = ${a}n + ${b}. What is the ${x}th term?`, answer: String(result), explanation: `${a} × ${x} + ${b} = ${result}` },
                // Find the rule
                { question: `When n=1, answer=${a + b}. When n=2, answer=${2 * a + b}. What is the rule?`, answer: `${a}n + ${b}`, explanation: `The pattern increases by ${a} each time with a constant of ${b}` }
            ];

            const chosen = formats[Math.floor(Math.random() * formats.length)];
            return { question: chosen.question, visual: null, answer: chosen.answer, explanation: chosen.explanation, type: 'algebra', inputType: 'text' };
        },


        meanMedianMode: () => {
            const count = 5;
            const numbers = Array.from({ length: count }, () => Math.floor(Math.random() * 10) + 1);
            const mean = numbers.reduce((a, b) => a + b, 0) / count;
            const sorted = [...numbers].sort((a, b) => a - b);
            const median = sorted[Math.floor(count / 2)];

            const questionTypes = ['mean', 'median'];
            const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

            if (qType === 'mean') {
                return {
                    question: `Find the mean of these numbers:\n${numbers.join(', ')}`,
                    visual: null,
                    answer: mean % 1 === 0 ? String(mean) : mean.toFixed(1),
                    explanation: `Mean = sum ÷ count = (${numbers.join(' + ')}) ÷ ${count} = ${numbers.reduce((a, b) => a + b, 0)} ÷ ${count} = ${mean}`,
                    type: 'statistics',
                    inputType: 'text'
                };
            } else {
                return {
                    question: `Find the median of these numbers:\n${numbers.join(', ')}`,
                    visual: null,
                    answer: String(median),
                    explanation: `First, order the numbers: ${sorted.join(', ')}. The median (middle value) is ${median}.`,
                    type: 'statistics',
                    inputType: 'number'
                };
            }
        },

        pieCharts: () => {
            const categories = ['Red', 'Blue', 'Green', 'Yellow'];
            const total = 20;
            const values = [5, 7, 4, 4];
            const askIndex = Math.floor(Math.random() * 4);

            return {
                question: `In a survey of ${total} people's favourite colours:\n${categories.map((c, i) => `${c}: ${values[i]}`).join(', ')}\n\nWhat fraction chose ${categories[askIndex]}?`,
                visual: 'pie-chart',
                visualData: { categories, values, total },
                answer: `${values[askIndex]}/${total}`,
                explanation: `${values[askIndex]} out of ${total} chose ${categories[askIndex]}, so the fraction is ${values[askIndex]}/${total}`,
                type: 'statistics',
                inputType: 'text'
            };
        },

        // NEW GENERATORS - Year 1
        oneMoreLess: () => {
            const num = Math.floor(Math.random() * 19) + 1;
            const more = Math.random() > 0.5;
            return {
                question: `What is one ${more ? 'more' : 'less'} than ${num}?`,
                answer: String(more ? num + 1 : num - 1),
                explanation: `One ${more ? 'more' : 'less'} than ${num} is ${more ? num + 1 : num - 1}`,
                type: 'arithmetic', inputType: 'number'
            };
        },

        doubling: () => {
            const num = Math.floor(Math.random() * 10) + 1;
            return {
                question: `Double ${num}. What do you get?`,
                answer: String(num * 2),
                explanation: `Double ${num} = ${num} + ${num} = ${num * 2}`,
                type: 'arithmetic', inputType: 'number'
            };
        },

        halving: () => {
            const num = [4, 6, 8, 10, 12, 14, 16, 18, 20][Math.floor(Math.random() * 9)];
            return {
                question: `What is half of ${num}?`,
                answer: String(num / 2),
                explanation: `Half of ${num} = ${num} ÷ 2 = ${num / 2}`,
                type: 'fractions', inputType: 'number'
            };
        },

        ordering: () => {
            const nums = Array.from({ length: 5 }, () => Math.floor(Math.random() * 20) + 1);
            const sorted = [...nums].sort((a, b) => a - b);
            return {
                question: `Put these numbers in order from smallest to largest:\n${nums.join(', ')}`,
                answer: sorted.join(', '),
                explanation: `In order: ${sorted.join(' < ')}`,
                type: 'ordering', inputType: 'text'
            };
        },

        measureLength: () => {
            const object = ['pencil', 'book', 'hand span', 'rubber'][Math.floor(Math.random() * 4)];
            const length = Math.floor(Math.random() * 15) + 5;
            return {
                question: `A ${object} is about ${length} centimetres long. Is this longer or shorter than 10cm?`,
                answer: length > 10 ? 'longer' : 'shorter',
                explanation: `${length}cm is ${length > 10 ? 'more' : 'less'} than 10cm, so it's ${length > 10 ? 'longer' : 'shorter'}`,
                type: 'measurement', inputType: 'text', choices: ['longer', 'shorter']
            };
        },

        weightCompare: () => {
            const items = [['apple', 'car'], ['feather', 'brick'], ['elephant', 'mouse'], ['book', 'pencil']];
            const pair = items[Math.floor(Math.random() * items.length)];
            return {
                question: `Which is heavier: a ${pair[0]} or a ${pair[1]}?`,
                answer: pair[1] === 'car' || pair[1] === 'brick' || pair[0] === 'elephant' ? pair[0] === 'elephant' ? pair[0] : pair[1] : pair[0],
                explanation: `Common sense tells us which object weighs more.`,
                type: 'measurement', inputType: 'text'
            };
        },

        // NEW GENERATORS - Year 2
        oddEven: () => {
            const num = Math.floor(Math.random() * 50) + 1;
            return {
                question: `Is ${num} odd or even?`,
                answer: num % 2 === 0 ? 'even' : 'odd',
                explanation: `${num} ${num % 2 === 0 ? 'can be divided by 2 evenly, so it\'s even' : 'cannot be divided by 2 evenly, so it\'s odd'}`,
                type: 'number-properties', inputType: 'text', choices: ['odd', 'even']
            };
        },

        sequences: () => {
            const step = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
            const start = step;
            const seq = Array.from({ length: 5 }, (_, i) => start + step * i);
            const hideIdx = 3;
            return {
                question: `What comes next in this pattern?\n${seq.slice(0, 4).join(', ')}, ___`,
                answer: String(seq[4]),
                explanation: `The pattern goes up in ${step}s. Next: ${seq[4]}`,
                type: 'patterns', inputType: 'number'
            };
        },

        measureCm: () => {
            const length = Math.floor(Math.random() * 10) + 5;
            return {
                question: `A crayon is ${length} centimetres long. Write this in cm.`,
                answer: `${length}cm`,
                explanation: `${length} centimetres = ${length}cm`,
                type: 'measurement', inputType: 'text'
            };
        },

        partitioning: () => {
            const tens = Math.floor(Math.random() * 9) + 1;
            const ones = Math.floor(Math.random() * 9) + 1;
            const num = tens * 10 + ones;
            return {
                question: `Partition ${num} into tens and ones.\n${num} = ___ + ___`,
                answer: `${tens * 10} + ${ones}`,
                explanation: `${num} = ${tens} tens and ${ones} ones = ${tens * 10} + ${ones}`,
                type: 'place-value', inputType: 'text'
            };
        },

        shapes3D: () => {
            const shapes = [
                { name: 'cube', faces: 6, edges: 12, vertices: 8 },
                { name: 'cuboid', faces: 6, edges: 12, vertices: 8 },
                { name: 'sphere', faces: 1, edges: 0, vertices: 0 },
                { name: 'cylinder', faces: 3, edges: 2, vertices: 0 },
                { name: 'cone', faces: 2, edges: 1, vertices: 1 },
                { name: 'pyramid', faces: 5, edges: 8, vertices: 5 },
                { name: 'triangularPrism', faces: 5, edges: 9, vertices: 6, displayName: 'triangular prism' }
            ];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const displayName = shape.displayName || shape.name;
            const questionTypes = ['faces', 'edges', 'vertices', 'identify'];
            const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

            if (qType === 'identify') {
                return {
                    question: `What 3D shape is this?`,
                    visual: 'shape',
                    visualData: { shape: shape.name },
                    answer: displayName.charAt(0).toUpperCase() + displayName.slice(1),
                    explanation: `This is a ${displayName}. It has ${shape.faces} face(s), ${shape.edges} edge(s), and ${shape.vertices} vertices.`,
                    type: 'geometry', inputType: 'text'
                };
            } else if (qType === 'vertices') {
                return {
                    question: `How many vertices does a ${displayName} have?`,
                    visual: 'shape',
                    visualData: { shape: shape.name },
                    answer: String(shape.vertices),
                    explanation: `A ${displayName} has ${shape.vertices} vertices (corners where edges meet).`,
                    type: 'geometry', inputType: 'number'
                };
            } else {
                return {
                    question: `How many ${qType} does a ${displayName} have?`,
                    visual: 'shape',
                    visualData: { shape: shape.name },
                    answer: String(qType === 'faces' ? shape.faces : shape.edges),
                    explanation: `A ${displayName} has ${shape.faces} face(s) and ${shape.edges} edge(s).`,
                    type: 'geometry', inputType: 'number'
                };
            }
        },


        // NEW GENERATORS - Year 3
        tenthsOf: () => {
            const total = [10, 20, 30, 40, 50][Math.floor(Math.random() * 5)];
            return {
                question: `What is 1/10 of ${total}?`,
                visual: 'fraction-bar',
                visualData: { parts: 10, shaded: 1 },
                answer: String(total / 10),
                explanation: `1/10 of ${total} = ${total} ÷ 10 = ${total / 10}`,
                type: 'fractions', inputType: 'number'
            };
        },

        scaledBarCharts: () => {
            // Generate random data for variety
            const scale = [2, 5, 10][Math.floor(Math.random() * 3)]; // Each square = 2, 5, or 10
            const items = ['Apples', 'Oranges', 'Bananas', 'Grapes'];
            const squares = items.map(() => Math.floor(Math.random() * 5) + 1); // 1-5 squares each
            const values = squares.map(s => s * scale);
            const askIndex = Math.floor(Math.random() * items.length);

            // Create SVG bar chart
            const chartWidth = 280;
            const chartHeight = 160;
            const barWidth = 45;
            const maxSquares = Math.max(...squares);
            const barScale = 100 / maxSquares; // Scale bars to fit

            const bars = items.map((item, i) => {
                const barHeight = squares[i] * barScale;
                const x = 40 + i * (barWidth + 15);
                const y = chartHeight - 30 - barHeight;
                const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#9b59b6'];
                return `
                    <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${colors[i]}" rx="3"/>
                    <text x="${x + barWidth / 2}" y="${chartHeight - 12}" text-anchor="middle" font-size="10" fill="#333">${item}</text>
                    <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="9" fill="#666">${squares[i]}</text>
                `;
            }).join('');

            const svg = `
                <svg viewBox="0 0 ${chartWidth} ${chartHeight}" style="max-width: 100%; height: auto; background: #fafafa; border: 1px solid #ddd; border-radius: 8px;">
                    <!-- Title -->
                    <text x="${chartWidth / 2}" y="15" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">Fruit Sold (1 square = ${scale})</text>
                    
                    <!-- Y Axis -->
                    <line x1="35" y1="25" x2="35" y2="${chartHeight - 25}" stroke="#999" stroke-width="1"/>
                    <text x="12" y="${chartHeight / 2}" text-anchor="middle" font-size="9" fill="#666" transform="rotate(-90, 12, ${chartHeight / 2})">Squares</text>
                    
                    <!-- X Axis -->
                    <line x1="35" y1="${chartHeight - 25}" x2="${chartWidth - 10}" y2="${chartHeight - 25}" stroke="#999" stroke-width="1"/>
                    
                    <!-- Bars -->
                    ${bars}
                </svg>
            `;

            return {
                question: `Look at the bar chart. Each square represents ${scale} fruits.\nHow many ${items[askIndex].toLowerCase()} were sold?`,
                visual: svg,
                answer: String(values[askIndex]),
                explanation: `${items[askIndex]} has ${squares[askIndex]} square${squares[askIndex] > 1 ? 's' : ''}. ${squares[askIndex]} × ${scale} = ${values[askIndex]}`,
                type: 'statistics',
                inputType: 'number'
            };
        },

        measuringMass: () => {
            const grams = [100, 250, 500, 750, 1000][Math.floor(Math.random() * 5)];
            return {
                question: `Convert ${grams}g to kg.`,
                answer: grams >= 1000 ? `${grams / 1000}kg` : `0.${grams / 100}kg`,
                explanation: `${grams}g = ${grams / 1000}kg (1000g = 1kg)`,
                type: 'measurement', inputType: 'text'
            };
        },

        rightAngles: () => {
            const angles = [45, 90, 120, 180, 270][Math.floor(Math.random() * 5)];
            const angleRad = (angles * Math.PI) / 180;
            const lineLength = 50;

            // Calculate end point for angle line
            const endX = 40 + lineLength * Math.cos(angleRad);
            const endY = 60 - lineLength * Math.sin(angleRad);

            // Create SVG showing the angle
            const svg = `
                <svg viewBox="0 0 120 100" style="max-width: 120px; height: auto;">
                    <!-- Base line (horizontal) -->
                    <line x1="40" y1="60" x2="100" y2="60" stroke="#333" stroke-width="2"/>
                    
                    <!-- Angle line -->
                    <line x1="40" y1="60" x2="${endX}" y2="${endY}" stroke="#333" stroke-width="2"/>
                    
                    <!-- Angle arc -->
                    ${angles <= 180 ? `<path d="M 60 60 A 20 20 0 0 1 ${40 + 20 * Math.cos(angleRad)} ${60 - 20 * Math.sin(angleRad)}" fill="none" stroke="#e74c3c" stroke-width="2"/>` : ''}
                    
                    <!-- Right angle square (if 90°) -->
                    ${angles === 90 ? '<rect x="40" y="45" width="15" height="15" fill="none" stroke="#2ecc71" stroke-width="2"/>' : ''}
                    
                    <!-- Angle label -->
                    <text x="70" y="40" font-size="12" fill="#333" font-weight="bold">${angles}°</text>
                </svg>
            `;

            return {
                question: `Is this a right angle?`,
                visual: svg,
                answer: angles === 90 ? 'yes' : 'no',
                explanation: `A right angle is exactly 90°. ${angles}° is ${angles === 90 ? '' : 'not '}a right angle.`,
                type: 'geometry', inputType: 'text', choices: ['yes', 'no']
            };
        },

        // NEW GENERATORS - Year 4
        timeProblems: () => {
            const startHr = Math.floor(Math.random() * 10) + 8;
            const duration = [30, 45, 60, 90][Math.floor(Math.random() * 4)];
            const endMins = duration % 60;
            const endHr = startHr + Math.floor(duration / 60) + (endMins > 0 ? 0 : 0);
            return {
                question: `School starts at ${startHr}:00. Lunch is ${duration} minutes later. What time is lunch?`,
                answer: `${startHr + Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
                explanation: `${startHr}:00 + ${duration} minutes = ${startHr + Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
                type: 'time', inputType: 'text'
            };
        },

        negativeTemperature: () => {
            const temp = Math.floor(Math.random() * 10) - 5;
            const change = Math.floor(Math.random() * 8) + 2;
            return {
                question: `The temperature is ${temp}°C. It drops by ${change}°C. What is the new temperature?`,
                answer: `${temp - change}°C`,
                explanation: `${temp}°C - ${change}°C = ${temp - change}°C`,
                type: 'negative-numbers', inputType: 'text'
            };
        },

        roundingNearest10: () => {
            const num = Math.floor(Math.random() * 100) + 1;
            const rounded = Math.round(num / 10) * 10;
            return {
                question: `Round ${num} to the nearest 10.`,
                answer: String(rounded),
                explanation: `${num} rounds to ${rounded} (look at the ones digit)`,
                type: 'rounding', inputType: 'number'
            };
        },

        anglesTypes: () => {
            const types = [
                { name: 'acute', example: Math.floor(Math.random() * 60) + 20 },      // 20-80
                { name: 'right', example: 90 },
                { name: 'obtuse', example: Math.floor(Math.random() * 60) + 100 }     // 100-160
            ];
            const type = types[Math.floor(Math.random() * types.length)];
            const angle = type.example;

            // Calculate angle line endpoint
            const lineLength = 60;
            const angleRad = (angle * Math.PI) / 180;
            const endX = 30 + lineLength * Math.cos(angleRad);
            const endY = 70 - lineLength * Math.sin(angleRad);

            // Create SVG showing the angle
            const svg = `
                <svg viewBox="0 0 150 100" style="max-width: 150px; height: auto;">
                    <!-- Base line (horizontal) -->
                    <line x1="30" y1="70" x2="120" y2="70" stroke="#333" stroke-width="2"/>
                    
                    <!-- Angle line -->
                    <line x1="30" y1="70" x2="${endX}" y2="${endY}" stroke="#333" stroke-width="2"/>
                    
                    <!-- Angle arc -->
                    <path d="M 55 70 A 25 25 0 0 1 ${30 + 25 * Math.cos(angleRad)} ${70 - 25 * Math.sin(angleRad)}" fill="none" stroke="#e74c3c" stroke-width="2"/>
                    
                    <!-- Right angle square (if right angle) -->
                    ${angle === 90 ? '<rect x="30" y="55" width="15" height="15" fill="none" stroke="#e74c3c" stroke-width="2"/>' : ''}
                    
                    <!-- Angle label -->
                    <text x="65" y="50" font-size="14" fill="#e74c3c" font-weight="bold">${angle}°</text>
                </svg>
            `;

            return {
                question: `What type of angle is shown?`,
                visual: svg,
                answer: type.name,
                explanation: `${angle}° is ${type.name}. Acute < 90°, Right = 90°, Obtuse > 90°`,
                type: 'geometry', inputType: 'text', choices: ['acute', 'right', 'obtuse']
            };
        },

        // NEW GENERATORS - Year 5
        multiplyBy10: () => {
            const num = (Math.floor(Math.random() * 99) + 1) / 10;
            const mult = [10, 100][Math.floor(Math.random() * 2)];
            return {
                question: `${num} × ${mult} = ?`,
                answer: String(num * mult),
                explanation: `Multiply by ${mult}: move decimal ${mult === 10 ? '1' : '2'} place(s) right. ${num} × ${mult} = ${num * mult}`,
                type: 'decimals', inputType: 'number'
            };
        },

        cuboidVolume: () => {
            const l = Math.floor(Math.random() * 5) + 2;
            const w = Math.floor(Math.random() * 4) + 2;
            const h = Math.floor(Math.random() * 3) + 2;
            return {
                question: `A box is ${l}cm long, ${w}cm wide and ${h}cm tall. What is its volume?`,
                visual: 'cuboid',
                visualData: { length: l, width: w, height: h },
                answer: `${l * w * h}cm³`,
                explanation: `Volume = l × w × h = ${l} × ${w} × ${h} = ${l * w * h}cm³`,
                type: 'volume', inputType: 'text'
            };
        },

        compareFractions: () => {
            const fracs = [{ n: 1, d: 2 }, { n: 1, d: 4 }, { n: 3, d: 4 }, { n: 2, d: 5 }];
            const f1 = fracs[Math.floor(Math.random() * fracs.length)];
            let f2 = fracs[Math.floor(Math.random() * fracs.length)];
            while (f1 === f2) f2 = fracs[Math.floor(Math.random() * fracs.length)];
            const v1 = f1.n / f1.d, v2 = f2.n / f2.d;
            return {
                question: `Which is larger: ${f1.n}/${f1.d} or ${f2.n}/${f2.d}?`,
                answer: v1 > v2 ? `${f1.n}/${f1.d}` : `${f2.n}/${f2.d}`,
                explanation: `${f1.n}/${f1.d} = ${v1.toFixed(2)}, ${f2.n}/${f2.d} = ${v2.toFixed(2)}`,
                type: 'fractions', inputType: 'text'
            };
        },

        imperialUnits: () => {
            const conversions = [{ from: 'inches', to: 'cm', factor: 2.5, val: 4 }, { from: 'miles', to: 'km', factor: 1.6, val: 5 }];
            const c = conversions[Math.floor(Math.random() * conversions.length)];
            return {
                question: `Approximately, ${c.val} ${c.from} = ___ ${c.to}\n(Use: 1 inch ≈ 2.5cm, 1 mile ≈ 1.6km)`,
                answer: String(c.val * c.factor),
                explanation: `${c.val} × ${c.factor} = ${c.val * c.factor} ${c.to}`,
                type: 'measurement', inputType: 'number'
            };
        },

        squareCubeNumbers: () => {
            const nums = [2, 3, 4, 5];
            const n = nums[Math.floor(Math.random() * nums.length)];
            const isSquare = Math.random() > 0.5;
            return {
                question: `What is ${n}${isSquare ? '²' : '³'}?`,
                answer: String(isSquare ? n * n : n * n * n),
                explanation: `${n}${isSquare ? '²' : '³'} = ${n} × ${n}${isSquare ? '' : ` × ${n}`} = ${isSquare ? n * n : n * n * n}`,
                type: 'arithmetic', inputType: 'number'
            };
        },

        // NEW GENERATORS - Year 6
        fractionDecimalPercent: () => {
            const convs = [{ f: '1/2', d: '0.5', p: '50%' }, { f: '1/4', d: '0.25', p: '25%' }, { f: '3/4', d: '0.75', p: '75%' }, { f: '1/5', d: '0.2', p: '20%' }];
            const c = convs[Math.floor(Math.random() * convs.length)];
            return {
                question: `Convert ${c.f} to a percentage.`,
                answer: c.p,
                explanation: `${c.f} = ${c.d} = ${c.p}`,
                type: 'percentages', inputType: 'text'
            };
        },

        simplifyFractions: () => {
            const pairs = [[{ n: 4, d: 8 }, { n: 1, d: 2 }], [{ n: 6, d: 9 }, { n: 2, d: 3 }], [{ n: 10, d: 15 }, { n: 2, d: 3 }]];
            const p = pairs[Math.floor(Math.random() * pairs.length)];
            return {
                question: `Simplify ${p[0].n}/${p[0].d} to its simplest form.`,
                answer: `${p[1].n}/${p[1].d}`,
                explanation: `Divide both by their HCF: ${p[0].n}/${p[0].d} = ${p[1].n}/${p[1].d}`,
                type: 'fractions', inputType: 'text'
            };
        },

        missingAngles: () => {
            const known = Math.floor(Math.random() * 80) + 40;
            const unknown = 180 - known;

            // Create SVG showing two angles on a straight line
            const svg = `
                <svg viewBox="0 0 200 100" style="max-width: 200px; height: auto;">
                    <!-- Straight line -->
                    <line x1="10" y1="70" x2="190" y2="70" stroke="#333" stroke-width="2"/>
                    
                    <!-- Angle line from center -->
                    <line x1="100" y1="70" x2="${100 + 70 * Math.cos(Math.PI * (180 - known) / 180)}" y2="${70 - 70 * Math.sin(Math.PI * (180 - known) / 180)}" stroke="#333" stroke-width="2"/>
                    
                    <!-- Known angle arc (left) -->
                    <path d="M 70 70 A 30 30 0 0 1 ${100 + 30 * Math.cos(Math.PI * (180 - known) / 180)} ${70 - 30 * Math.sin(Math.PI * (180 - known) / 180)}" fill="none" stroke="#e74c3c" stroke-width="2"/>
                    <text x="55" y="55" font-size="14" fill="#e74c3c" font-weight="bold">${known}°</text>
                    
                    <!-- Unknown angle arc (right) -->
                    <path d="M ${100 + 30 * Math.cos(Math.PI * (180 - known) / 180)} ${70 - 30 * Math.sin(Math.PI * (180 - known) / 180)} A 30 30 0 0 1 130 70" fill="none" stroke="#3498db" stroke-width="2"/>
                    <text x="135" y="55" font-size="14" fill="#3498db" font-weight="bold">?</text>
                </svg>
            `;

            return {
                question: `Angles on a straight line add up to 180°.\nFind the missing angle.`,
                visual: svg,
                answer: `${unknown}°`,
                explanation: `180° - ${known}° = ${unknown}°`,
                type: 'geometry', inputType: 'text'
            };
        },

        circleRadius: () => {
            const diameter = [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)];

            // Create SVG showing a circle with diameter
            const svg = `
                <svg viewBox="0 0 120 120" style="max-width: 120px; height: auto;">
                    <!-- Circle -->
                    <circle cx="60" cy="60" r="45" fill="#E3F2FD" stroke="#1976D2" stroke-width="2"/>
                    
                    <!-- Diameter line -->
                    <line x1="15" y1="60" x2="105" y2="60" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>
                    
                    <!-- Center dot -->
                    <circle cx="60" cy="60" r="3" fill="#333"/>
                    
                    <!-- Diameter label -->
                    <text x="60" y="50" text-anchor="middle" font-size="12" fill="#e74c3c" font-weight="bold">${diameter}cm</text>
                    <text x="60" y="85" text-anchor="middle" font-size="9" fill="#666">diameter</text>
                </svg>
            `;

            return {
                question: `What is the radius of this circle?`,
                visual: svg,
                answer: `${diameter / 2}cm`,
                explanation: `Radius = diameter ÷ 2 = ${diameter} ÷ 2 = ${diameter / 2}cm`,
                type: 'geometry', inputType: 'text'
            };
        },

        netsCubes: () => {
            return {
                question: `How many squares are needed to make the net of a cube?`,
                answer: '6',
                explanation: `A cube has 6 faces, so its net needs 6 squares.`,
                type: 'geometry', inputType: 'number'
            };
        },

        // ========== NEW QUESTION TYPES ==========

        // Year 1: Count backwards
        countBackward: () => {
            const start = Math.floor(Math.random() * 10) + 10;
            const count = Math.floor(Math.random() * 3) + 3;
            const answer = start - count;
            return {
                question: `Count backwards ${count} from ${start}. What number do you get?`,
                answer: String(answer),
                explanation: `Starting at ${start} and counting back ${count}: ${Array.from({ length: count + 1 }, (_, i) => start - i).join(', ')}`,
                type: 'counting', inputType: 'number'
            };
        },

        // Year 1: One more one less
        oneMoreOneLess: () => {
            const num = Math.floor(Math.random() * 18) + 2;
            const isMore = Math.random() > 0.5;
            const name = typeof DataNames !== 'undefined' ? DataNames.random() : 'Sam';
            return {
                question: isMore
                    ? `${name} has ${num} stickers. If they get one more, how many will they have?`
                    : `${name} has ${num} stickers. If they give one away, how many will they have?`,
                answer: String(isMore ? num + 1 : num - 1),
                explanation: isMore
                    ? `${num} + 1 = ${num + 1}`
                    : `${num} - 1 = ${num - 1}`,
                type: 'counting', inputType: 'number'
            };
        },

        // Year 1: Halving
        halving: () => {
            const numbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
            const num = numbers[Math.floor(Math.random() * numbers.length)];
            const objects = ['apples', 'sweets', 'stickers', 'marbles', 'coins'];
            const obj = objects[Math.floor(Math.random() * objects.length)];
            return {
                question: `What is half of ${num} ${obj}?`,
                answer: String(num / 2),
                explanation: `Half of ${num} = ${num} ÷ 2 = ${num / 2}`,
                type: 'division', inputType: 'number'
            };
        },

        // Year 1: Weight compare
        weightCompare: () => {
            const items = [
                { name: 'an elephant', weight: 'heaviest' },
                { name: 'a mouse', weight: 'lightest' },
                { name: 'a cat', weight: 'medium' },
                { name: 'a dog', weight: 'medium' },
                { name: 'a feather', weight: 'lightest' },
                { name: 'a car', weight: 'heaviest' }
            ];
            const chosen = [items[0], items[1], items[Math.floor(Math.random() * 2) + 2]];
            const shuffled = chosen.sort(() => Math.random() - 0.5);
            const heaviest = shuffled.find(i => i.weight === 'heaviest' ||
                (shuffled.every(j => j.weight !== 'heaviest') && i.weight === 'medium'));
            return {
                question: `Which is heavier: ${shuffled[0].name} or ${shuffled[1].name}?`,
                answer: shuffled[0].weight === 'heaviest' || (shuffled[0].weight === 'medium' && shuffled[1].weight === 'lightest')
                    ? shuffled[0].name : shuffled[1].name,
                explanation: `${heaviest.name.charAt(0).toUpperCase() + heaviest.name.slice(1)} is heavier.`,
                type: 'measurement', inputType: 'text'
            };
        },

        // Year 2: Odd or Even
        oddEven: () => {
            const num = Math.floor(Math.random() * 50) + 1;
            const isOdd = num % 2 !== 0;
            return {
                question: `Is ${num} odd or even?`,
                options: ['Odd', 'Even'],
                answer: isOdd ? 'Odd' : 'Even',
                explanation: isOdd
                    ? `${num} is odd because it cannot be divided exactly by 2.`
                    : `${num} is even because ${num} ÷ 2 = ${num / 2} exactly.`,
                type: 'number', inputType: 'multiple-choice'
            };
        },

        // Year 2: Sequences
        sequences: () => {
            const step = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
            const start = Math.floor(Math.random() * 5) * step;
            const seq = Array.from({ length: 4 }, (_, i) => start + i * step);
            return {
                question: `What comes next? ${seq.join(', ')}, __`,
                answer: String(start + 4 * step),
                explanation: `The pattern is counting in ${step}s. Next is ${seq[3]} + ${step} = ${start + 4 * step}`,
                type: 'patterns', inputType: 'number'
            };
        },

        // Year 2: Measure in cm
        measureCm: () => {
            const length = Math.floor(Math.random() * 15) + 5;
            const objects = ['pencil', 'ribbon', 'stick', 'string', 'ruler'];
            const obj = objects[Math.floor(Math.random() * objects.length)];
            return {
                question: `A ${obj} is ${length} cm long. How many centimetres is that?`,
                answer: String(length),
                explanation: `The ${obj} measures ${length} centimetres.`,
                type: 'measurement', inputType: 'number'
            };
        },

        // Year 3: Roman numerals
        romanNumerals: () => {
            const romans = [
                { num: 1, rom: 'I' }, { num: 2, rom: 'II' }, { num: 3, rom: 'III' },
                { num: 4, rom: 'IV' }, { num: 5, rom: 'V' }, { num: 6, rom: 'VI' },
                { num: 7, rom: 'VII' }, { num: 8, rom: 'VIII' }, { num: 9, rom: 'IX' },
                { num: 10, rom: 'X' }, { num: 11, rom: 'XI' }, { num: 12, rom: 'XII' }
            ];
            const chosen = romans[Math.floor(Math.random() * romans.length)];
            const toRoman = Math.random() > 0.5;
            return {
                question: toRoman
                    ? `Write ${chosen.num} as a Roman numeral.`
                    : `What number does ${chosen.rom} represent?`,
                answer: toRoman ? chosen.rom : String(chosen.num),
                explanation: `${chosen.num} = ${chosen.rom}`,
                type: 'number', inputType: 'text'
            };
        },

        // Year 3: Right angles
        rightAngles: () => {
            const shapes = [
                { name: 'square', rightAngles: 4 },
                { name: 'rectangle', rightAngles: 4 },
                { name: 'right-angled triangle', rightAngles: 1 },
                { name: 'L-shape', rightAngles: 2 }
            ];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            return {
                question: `How many right angles does a ${shape.name} have?`,
                answer: String(shape.rightAngles),
                explanation: `A ${shape.name} has ${shape.rightAngles} right angle${shape.rightAngles !== 1 ? 's' : ''}.`,
                type: 'geometry', inputType: 'number'
            };
        },

        // Year 3: Times 3, 4, 8
        times348: () => {
            const table = [3, 4, 8][Math.floor(Math.random() * 3)];
            const mult = Math.floor(Math.random() * 12) + 1;
            const name = typeof DataNames !== 'undefined' ? DataNames.random() : 'Tom';
            return {
                question: `${name} buys ${mult} packs of stickers. Each pack has ${table} stickers. How many stickers altogether?`,
                answer: String(table * mult),
                explanation: `${mult} × ${table} = ${table * mult}`,
                type: 'multiplication', inputType: 'number'
            };
        },

        // Year 4: Negative temperature
        negativeTemperature: () => {
            const temp = Math.floor(Math.random() * 10) - 5;
            const change = Math.floor(Math.random() * 8) + 2;
            const rises = Math.random() > 0.5;
            const newTemp = rises ? temp + change : temp - change;
            return {
                question: rises
                    ? `The temperature is ${temp}°C. It rises by ${change}°C. What is the new temperature?`
                    : `The temperature is ${temp}°C. It falls by ${change}°C. What is the new temperature?`,
                answer: `${newTemp}°C`,
                explanation: rises
                    ? `${temp} + ${change} = ${newTemp}°C`
                    : `${temp} - ${change} = ${newTemp}°C`,
                type: 'number', inputType: 'text'
            };
        },

        // Year 4: Rounding to nearest 10
        roundingNearest10: () => {
            const num = Math.floor(Math.random() * 90) + 10;
            const rounded = Math.round(num / 10) * 10;
            return {
                question: `Round ${num} to the nearest 10.`,
                answer: String(rounded),
                explanation: `${num} rounded to the nearest 10 is ${rounded}.`,
                type: 'number', inputType: 'number'
            };
        },

        // Year 4: Coordinates
        coordinates: () => {
            const x = Math.floor(Math.random() * 8) + 1;
            const y = Math.floor(Math.random() * 8) + 1;
            const findWhat = Math.random() > 0.5 ? 'x' : 'y';
            return {
                question: `A point is at (${x}, ${y}). What is the ${findWhat}-coordinate?`,
                answer: String(findWhat === 'x' ? x : y),
                explanation: `The point (${x}, ${y}) has x-coordinate ${x} and y-coordinate ${y}.`,
                type: 'geometry', inputType: 'number'
            };
        },

        // Year 4: Translation
        translation: () => {
            const x = Math.floor(Math.random() * 5) + 1;
            const y = Math.floor(Math.random() * 5) + 1;
            const moveX = Math.floor(Math.random() * 4) + 1;
            const moveY = Math.floor(Math.random() * 4) + 1;
            const dir = ['right', 'up'][Math.floor(Math.random() * 2)];
            return {
                question: `A shape is at (${x}, ${y}). It moves ${dir === 'right' ? moveX : moveY} squares ${dir}. What are its new coordinates?`,
                answer: dir === 'right' ? `(${x + moveX}, ${y})` : `(${x}, ${y + moveY})`,
                explanation: dir === 'right'
                    ? `Moving ${moveX} right: (${x}, ${y}) → (${x + moveX}, ${y})`
                    : `Moving ${moveY} up: (${x}, ${y}) → (${x}, ${y + moveY})`,
                type: 'geometry', inputType: 'text'
            };
        },

        // Year 4: Angle types
        anglesTypes: () => {
            const angles = [
                { degrees: Math.floor(Math.random() * 80) + 10, type: 'acute' },
                { degrees: 90, type: 'right' },
                { degrees: Math.floor(Math.random() * 80) + 100, type: 'obtuse' },
                { degrees: Math.floor(Math.random() * 170) + 190, type: 'reflex' }
            ];
            const angle = angles[Math.floor(Math.random() * angles.length)];
            return {
                question: `An angle measures ${angle.degrees}°. What type of angle is this?`,
                options: ['Acute', 'Right', 'Obtuse', 'Reflex'],
                answer: angle.type.charAt(0).toUpperCase() + angle.type.slice(1),
                explanation: `${angle.degrees}° is ${angle.type === 'acute' ? 'less than 90°' :
                    angle.type === 'right' ? 'exactly 90°' :
                        angle.type === 'obtuse' ? 'between 90° and 180°' : 'greater than 180°'}, so it's ${angle.type}.`,
                type: 'geometry', inputType: 'multiple-choice'
            };
        },

        // Year 5: Prime numbers
        primeNumbers: () => {
            const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
            const nonPrimes = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25];
            const isPrime = Math.random() > 0.5;
            const num = isPrime
                ? primes[Math.floor(Math.random() * primes.length)]
                : nonPrimes[Math.floor(Math.random() * nonPrimes.length)];
            return {
                question: `Is ${num} a prime number?`,
                options: ['Yes', 'No'],
                answer: isPrime ? 'Yes' : 'No',
                explanation: isPrime
                    ? `${num} is prime because it only has factors 1 and ${num}.`
                    : `${num} is not prime because it has other factors besides 1 and itself.`,
                type: 'number', inputType: 'multiple-choice'
            };
        },

        // Year 5: Square and cube numbers
        squareCubeNumbers: () => {
            const isSquare = Math.random() > 0.5;
            const n = Math.floor(Math.random() * 8) + 2;
            const result = isSquare ? n * n : n * n * n;
            return {
                question: isSquare
                    ? `What is ${n} squared (${n}²)?`
                    : `What is ${n} cubed (${n}³)?`,
                answer: String(result),
                explanation: isSquare
                    ? `${n}² = ${n} × ${n} = ${result}`
                    : `${n}³ = ${n} × ${n} × ${n} = ${result}`,
                type: 'number', inputType: 'number'
            };
        },

        // Year 5: Multiply/divide by 10, 100, 1000
        multiplyBy10: () => {
            const multipliers = [10, 100, 1000];
            const mult = multipliers[Math.floor(Math.random() * multipliers.length)];
            const num = Math.floor(Math.random() * 50) + 1;
            const isMultiply = Math.random() > 0.5;
            return {
                question: isMultiply
                    ? `${num} × ${mult} = ?`
                    : `${num * mult} ÷ ${mult} = ?`,
                answer: String(isMultiply ? num * mult : num),
                explanation: isMultiply
                    ? `${num} × ${mult} = ${num * mult}`
                    : `${num * mult} ÷ ${mult} = ${num}`,
                type: 'number', inputType: 'number'
            };
        },

        // Year 5: Angles on a straight line
        angles: () => {
            const knownAngle = Math.floor(Math.random() * 140) + 20;
            const unknownAngle = 180 - knownAngle;
            return {
                question: `Two angles on a straight line measure ${knownAngle}° and x°. What is x?`,
                answer: `${unknownAngle}°`,
                explanation: `Angles on a straight line add up to 180°. So x = 180 - ${knownAngle} = ${unknownAngle}°`,
                type: 'geometry', inputType: 'text'
            };
        },

        // Year 5: Compare fractions
        compareFractions: () => {
            const fractions = [
                { num: 1, den: 2, decimal: 0.5 },
                { num: 1, den: 4, decimal: 0.25 },
                { num: 3, den: 4, decimal: 0.75 },
                { num: 2, den: 5, decimal: 0.4 },
                { num: 3, den: 5, decimal: 0.6 },
                { num: 1, den: 3, decimal: 0.333 },
                { num: 2, den: 3, decimal: 0.667 }
            ];
            const [f1, f2] = fractions.sort(() => Math.random() - 0.5).slice(0, 2);
            const larger = f1.decimal > f2.decimal ? f1 : f2;
            return {
                question: `Which is larger: ${f1.num}/${f1.den} or ${f2.num}/${f2.den}?`,
                answer: `${larger.num}/${larger.den}`,
                explanation: `${larger.num}/${larger.den} = ${larger.decimal.toFixed(2)} which is larger.`,
                type: 'fractions', inputType: 'text'
            };
        },

        // Year 6: Order of operations (BIDMAS)
        orderOperations: () => {
            const a = Math.floor(Math.random() * 5) + 2;
            const b = Math.floor(Math.random() * 5) + 2;
            const c = Math.floor(Math.random() * 5) + 2;
            const patterns = [
                { q: `${a} + ${b} × ${c}`, ans: a + b * c, exp: `Do multiplication first: ${b} × ${c} = ${b * c}, then add ${a}: ${a + b * c}` },
                { q: `(${a} + ${b}) × ${c}`, ans: (a + b) * c, exp: `Do brackets first: ${a} + ${b} = ${a + b}, then multiply: ${(a + b) * c}` },
                { q: `${a * c} ÷ ${c} + ${b}`, ans: a + b, exp: `Do division first: ${a * c} ÷ ${c} = ${a}, then add ${b}: ${a + b}` }
            ];
            const chosen = patterns[Math.floor(Math.random() * patterns.length)];
            return {
                question: `Calculate: ${chosen.q}`,
                answer: String(chosen.ans),
                explanation: chosen.exp,
                type: 'number', inputType: 'number'
            };
        },

        // Year 6: Ratio
        ratio: () => {
            const total = [12, 15, 18, 20, 24, 30][Math.floor(Math.random() * 6)];
            const ratio1 = Math.floor(Math.random() * 3) + 1;
            const ratio2 = Math.floor(Math.random() * 3) + 1;
            const parts = ratio1 + ratio2;
            const share1 = (total / parts) * ratio1;
            const name1 = typeof DataNames !== 'undefined' ? DataNames.random() : 'Tom';
            const name2 = typeof DataNames !== 'undefined' ? DataNames.randomDifferent(name1) : 'Sam';
            if (total % parts !== 0) {
                return { // Fallback for non-divisible
                    question: `Share 20 sweets in the ratio 1:3`,
                    answer: '5 and 15',
                    explanation: `1:3 means 4 parts. 20 ÷ 4 = 5. So 1×5=5 and 3×5=15.`,
                    type: 'ratio', inputType: 'text'
                };
            }
            return {
                question: `${name1} and ${name2} share ${total} sweets in the ratio ${ratio1}:${ratio2}. How many does ${name1} get?`,
                answer: String(share1),
                explanation: `Ratio ${ratio1}:${ratio2} means ${parts} parts. ${total} ÷ ${parts} = ${total / parts}. ${name1} gets ${ratio1} × ${total / parts} = ${share1}.`,
                type: 'ratio', inputType: 'number'
            };
        },

        // Year 6: Simple algebra
        simpleAlgebra: () => {
            const x = Math.floor(Math.random() * 8) + 2;
            const mult = Math.floor(Math.random() * 4) + 2;
            const add = Math.floor(Math.random() * 10) + 1;
            const result = mult * x + add;
            return {
                question: `If x = ${x}, what is ${mult}x + ${add}?`,
                answer: String(result),
                explanation: `${mult}x + ${add} = ${mult} × ${x} + ${add} = ${mult * x} + ${add} = ${result}`,
                type: 'algebra', inputType: 'number'
            };
        },

        // Year 6: Mean average
        meanMedianMode: () => {
            const count = Math.floor(Math.random() * 2) + 4; // 4 or 5 numbers
            const numbers = Array.from({ length: count }, () => Math.floor(Math.random() * 10) + 1);
            const sum = numbers.reduce((a, b) => a + b, 0);
            const mean = sum / count;
            return {
                question: `Find the mean of: ${numbers.join(', ')}`,
                answer: Number.isInteger(mean) ? String(mean) : mean.toFixed(1),
                explanation: `Mean = (${numbers.join(' + ')}) ÷ ${count} = ${sum} ÷ ${count} = ${Number.isInteger(mean) ? mean : mean.toFixed(1)}`,
                type: 'statistics', inputType: 'text'
            };
        },

        // Year 6: Pie charts
        pieCharts: () => {
            const total = [20, 40, 50, 100][Math.floor(Math.random() * 4)];
            const fraction = [4, 5, 10][Math.floor(Math.random() * 3)];
            const value = total / fraction;
            return {
                question: `In a pie chart, 1/${fraction} of the chart shows "Football". If ${total} people were surveyed, how many chose Football?`,
                answer: String(value),
                explanation: `1/${fraction} of ${total} = ${total} ÷ ${fraction} = ${value}`,
                type: 'statistics', inputType: 'number'
            };
        },

        // Year 6: Simplify fractions
        simplifyFractions: () => {
            const gcds = [
                { num: 2, den: 4, simple: '1/2' },
                { num: 3, den: 6, simple: '1/2' },
                { num: 4, den: 8, simple: '1/2' },
                { num: 2, den: 6, simple: '1/3' },
                { num: 4, den: 12, simple: '1/3' },
                { num: 3, den: 9, simple: '1/3' },
                { num: 6, den: 8, simple: '3/4' },
                { num: 9, den: 12, simple: '3/4' },
                { num: 4, den: 10, simple: '2/5' },
                { num: 6, den: 10, simple: '3/5' }
            ];
            const chosen = gcds[Math.floor(Math.random() * gcds.length)];
            return {
                question: `Simplify ${chosen.num}/${chosen.den}`,
                answer: chosen.simple,
                explanation: `${chosen.num}/${chosen.den} simplified is ${chosen.simple}`,
                type: 'fractions', inputType: 'text'
            };
        },

        // Year 6: Missing angles
        missingAngles: () => {
            const angle1 = Math.floor(Math.random() * 50) + 30;
            const angle2 = Math.floor(Math.random() * 50) + 30;
            const angle3 = 180 - angle1 - angle2;
            return {
                question: `A triangle has angles of ${angle1}° and ${angle2}°. What is the third angle?`,
                answer: `${angle3}°`,
                explanation: `Angles in a triangle add up to 180°. Third angle = 180 - ${angle1} - ${angle2} = ${angle3}°`,
                type: 'geometry', inputType: 'text'
            };
        },

        // Year 6: Algebra with unknowns
        algebraUnknowns: () => {
            const answer = Math.floor(Math.random() * 10) + 2;
            const mult = Math.floor(Math.random() * 4) + 2;
            const result = mult * answer;
            return {
                question: `Solve: ${mult}x = ${result}`,
                answer: String(answer),
                explanation: `${mult}x = ${result}, so x = ${result} ÷ ${mult} = ${answer}`,
                type: 'algebra', inputType: 'number'
            };
        },

        // Year 6: Percentage changes
        percentageChanges: () => {
            const original = [50, 80, 100, 200][Math.floor(Math.random() * 4)];
            const percent = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
            const increase = Math.random() > 0.5;
            const change = (original * percent) / 100;
            const result = increase ? original + change : original - change;
            return {
                question: increase
                    ? `Increase ${original} by ${percent}%`
                    : `Decrease ${original} by ${percent}%`,
                answer: String(result),
                explanation: `${percent}% of ${original} = ${change}. ${original} ${increase ? '+' : '-'} ${change} = ${result}`,
                type: 'percentage', inputType: 'number'
            };
        },

        // Year 6: Area of triangles
        areaTriangles: () => {
            const base = Math.floor(Math.random() * 8) + 4;
            const height = Math.floor(Math.random() * 6) + 3;
            const area = (base * height) / 2;
            return {
                question: `Find the area of a triangle with base ${base}cm and height ${height}cm.`,
                answer: `${area}cm²`,
                explanation: `Area = ½ × base × height = ½ × ${base} × ${height} = ${area}cm²`,
                type: 'geometry', inputType: 'text'
            };
        },

        // Year 6: Scale factors
        scaleFactors: () => {
            const original = Math.floor(Math.random() * 5) + 3;
            const scale = Math.floor(Math.random() * 3) + 2;
            const enlarged = original * scale;
            return {
                question: `A shape has a side of ${original}cm. If it is enlarged by scale factor ${scale}, what is the new length?`,
                answer: `${enlarged}cm`,
                explanation: `${original} × ${scale} = ${enlarged}cm`,
                type: 'geometry', inputType: 'text'
            };
        },

        // Word problems using data pools
        wordProblemAddition: () => {
            const name1 = typeof DataNames !== 'undefined' ? DataNames.random() : 'Tom';
            const name2 = typeof DataNames !== 'undefined' ? DataNames.randomDifferent(name1) : 'Sam';
            const obj = typeof DataContexts !== 'undefined' ? DataContexts.random('objects') : 'marbles';
            const n1 = Math.floor(Math.random() * 20) + 5;
            const n2 = Math.floor(Math.random() * 20) + 5;
            return {
                question: `${name1} has ${n1} ${obj} and ${name2} has ${n2} ${obj}. How many do they have altogether?`,
                answer: String(n1 + n2),
                explanation: `${n1} + ${n2} = ${n1 + n2}`,
                type: 'word-problem', inputType: 'number'
            };
        },

        wordProblemSubtraction: () => {
            const name = typeof DataNames !== 'undefined' ? DataNames.random() : 'Emma';
            const obj = typeof DataContexts !== 'undefined' ? DataContexts.random('objects') : 'stickers';
            const total = Math.floor(Math.random() * 30) + 15;
            const gave = Math.floor(Math.random() * (total - 5)) + 3;
            return {
                question: `${name} had ${total} ${obj}. They gave away ${gave}. How many do they have left?`,
                answer: String(total - gave),
                explanation: `${total} - ${gave} = ${total - gave}`,
                type: 'word-problem', inputType: 'number'
            };
        },

        wordProblemMultiplication: () => {
            const name = typeof DataNames !== 'undefined' ? DataNames.random() : 'Jack';
            const obj = typeof DataContexts !== 'undefined' ? DataContexts.random('objects') : 'pencils';
            const groups = Math.floor(Math.random() * 8) + 3;
            const perGroup = Math.floor(Math.random() * 10) + 2;
            return {
                question: `${name} has ${groups} boxes of ${obj}. Each box contains ${perGroup}. How many ${obj} altogether?`,
                answer: String(groups * perGroup),
                explanation: `${groups} × ${perGroup} = ${groups * perGroup}`,
                type: 'word-problem', inputType: 'number'
            };
        },

        wordProblemDivision: () => {
            const name = typeof DataNames !== 'undefined' ? DataNames.random() : 'Lily';
            const obj = typeof DataContexts !== 'undefined' ? DataContexts.random('objects') : 'sweets';
            const people = Math.floor(Math.random() * 6) + 2;
            const each = Math.floor(Math.random() * 8) + 2;
            const total = people * each;
            return {
                question: `${name} shares ${total} ${obj} equally among ${people} friends. How many does each friend get?`,
                answer: String(each),
                explanation: `${total} ÷ ${people} = ${each}`,
                type: 'word-problem', inputType: 'number'
            };
        }
    }
};

// Make available globally
window.MathGenerator = MathGenerator;
