/**
 * LearningChief - English Question Generators
 * Organized by year group and difficulty
 */

const EnglishGenerator = {
    // Helper to shuffle array (Fisher-Yates)
    shuffle(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Year-specific topic generators - expanded based on UK National Curriculum SPaG
    topics: {
        1: {
            normal: ['cvcWords', 'capitalFullStop', 'commonWords', 'simpleSentences', 'letterSounds', 'wordEndings', 'rhyming', 'rhymingWords', 'alphabetOrder', 'vowelSpot'],
            advanced: ['questionMarks', 'pluralsSimple', 'joiningAnd', 'exclamations', 'daysWeek']
        },
        2: {
            normal: ['sentenceTypes', 'nounsVerbs', 'pastPresent', 'commasLists', 'suffixesErEst', 'compoundWords', 'collectiveNouns', 'oppositeMeaning', 'addEdIng'],
            advanced: ['adjectives', 'adverbs', 'apostrophesContractions', 'compoundSentences', 'suffixesLyNess', 'questionWords']
        },
        3: {
            normal: ['paragraphs', 'invertedCommas', 'wordFamilies', 'prefixes', 'conjunctions', 'articleAThe', 'timeConnectives', 'speechPunctuation'],
            advanced: ['prepositions', 'presentPerfect', 'headingsSubheadings', 'consonantDoubling', 'wordClasses']
        },
        4: {
            normal: ['frontedAdverbials', 'possessiveApostrophes', 'nounPhrases', 'standardEnglish', 'determiners', 'pluralRules', 'frontedAdverbialsAdvanced', 'paragraphOrder'],
            advanced: ['pronounsCohesion', 'directSpeech', 'homophones', 'paragraphLinks', 'prefixesMisDisUn']
        },
        5: {
            normal: ['relativeClauses', 'modalVerbs', 'parenthesis', 'cohesiveDevices', 'convertNouns', 'ambiguity', 'relativePronouns', 'adverbsPossibility', 'figurativeSimile', 'figurativeMetaphor'],
            advanced: ['passiveVoice', 'formalInformal', 'subjunctive', 'degreesPossibility', 'wordOrigins', 'nounPhrasesAdvanced']
        },
        6: {
            normal: ['passiveVoice', 'subjunctive', 'semicolonsColons', 'synonymsAntonyms', 'bulletPoints', 'subjectVerb', 'activeVoice', 'semicolonsClause', 'colonsIntro', 'etymology', 'persuasiveDevices', 'synonymContext'],
            advanced: ['hyphens', 'ellipsis', 'formalWriting', 'rhetoricalDevices', 'conditionals', 'reportedSpeech', 'spellingSilent', 'prefixAdvanced', 'suffixAdvanced']
        }
    },

    generate(year, difficulty, count, topic = null) {
        const questions = [];

        // For advanced: include BOTH normal AND advanced topics for more variety
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
            availableTopics = [...this.topics[year].normal, ...this.topics[year].advanced];
        } else {
            availableTopics = this.topics[year].normal;
        }

        // Shuffle topics
        availableTopics = this.shuffleArray([...availableTopics]);

        const usedQuestions = new Set();
        let attempts = 0;
        const maxAttempts = count * 10;
        let topicCounter = 0;

        while (questions.length < count && attempts < maxAttempts) {
            attempts++;

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
                    question.choices = this.shuffle(question.choices);
                }

                // Use full question text for duplicate detection
                const signature = question.question.trim();

                if (!usedQuestions.has(signature)) {
                    usedQuestions.add(signature);
                    questions.push(question);
                }
            }
        }

        return this.shuffleArray(questions);
    },

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Normalize text: clean up and standardize input
    normalizeTopicText(text) {
        return text
            .toLowerCase()
            .replace(/['']/g, "'")        // Smart quotes → regular
            .replace(/[""]/g, '"')
            .replace(/\s+/g, ' ')         // Multiple spaces → single
            .trim();
    },

    // Fix common typos for English topics
    fixTypos(text) {
        const typoMap = {
            // Grammar typos
            'grammer': 'grammar',
            'gramer': 'grammar',
            'grammor': 'grammar',

            // Punctuation typos
            'puntuation': 'punctuation',
            'puncuation': 'punctuation',
            'puntuaction': 'punctuation',
            'punctation': 'punctuation',

            // Vocabulary typos
            'vocabulery': 'vocabulary',
            'vocablary': 'vocabulary',
            'volcabulary': 'vocabulary',

            // Spelling typos  
            'speling': 'spelling',
            'speeling': 'spelling',
            'spellings': 'spelling',

            // Sentence typos
            'sentance': 'sentence',
            'sentense': 'sentence',
            'sentances': 'sentences',

            // Paragraph typos
            'paragraf': 'paragraph',
            'paragragh': 'paragraph',
            'paragraphs': 'paragraph',

            // Noun/verb typos
            'nouns': 'noun',
            'verbs': 'verb',
            'adjetive': 'adjective',
            'adjetives': 'adjective',
            'adjectives': 'adjective',
            'adverbs': 'adverb',
            'prepostion': 'preposition',
            'prepostions': 'preposition',
            'conjuction': 'conjunction',
            'conjuctions': 'conjunction',
            'conjunctions': 'conjunction',

            // Prefix/suffix typos
            'prefixs': 'prefix',
            'prefixe': 'prefix',
            'suffixs': 'suffix',
            'suffixe': 'suffix',

            // Apostrophe typos
            'apostrophy': 'apostrophe',
            'apostrophie': 'apostrophe',
            'apostroph': 'apostrophe',

            // Speech typos
            'speach': 'speech',
            'speeh': 'speech',

            // Synonym typos
            'synonim': 'synonym',
            'synomym': 'synonym',
            'antomym': 'antonym',
            'antonim': 'antonym',

            // Homophone typos  
            'homofone': 'homophone',
            'homophones': 'homophone',

            // Clause typos
            'claus': 'clause',
            'clauses': 'clause',
            'relitive clause': 'relative clause',
            'releative clause': 'relative clause',

            // Other common typos
            'pural': 'plural',
            'plurals': 'plural',
            'tence': 'tense',
            'tenses': 'tense',
            'phonicks': 'phonics',
            'phoniks': 'phonics',
            'ryhme': 'rhyme',
            'ryhming': 'rhyming',
            'rhymes': 'rhyming',
        };

        let fixed = text;
        for (const [typo, correct] of Object.entries(typoMap)) {
            fixed = fixed.replace(new RegExp(typo, 'gi'), correct);
        }
        return fixed;
    },

    // Map user-friendly topic text to internal generator keys
    // This is the key function that translates user input to actual generators
    mapTopicToGenerators(topicText, year) {
        const allYearTopics = [...this.topics[year].normal, ...this.topics[year].advanced];
        const matches = new Set();

        // Normalize and fix typos first
        let normalizedText = this.normalizeTopicText(topicText);
        normalizedText = this.fixTypos(normalizedText);

        // Split by comma to handle multiple topics like "nouns, verbs"
        const topicParts = normalizedText.split(/[,;]+/).map(t => t.trim()).filter(t => t);

        console.log(`[English Topic Mapper] Input: "${topicText}" → Normalized: "${normalizedText}"`);
        console.log(`[English Topic Mapper] Available topics:`, allYearTopics);

        // Comprehensive keyword to generator mappings
        const keywordMappings = {
            // === SPELLING & PHONICS ===
            'spelling': ['commonWords', 'cvcWords', 'pluralsSimple', 'suffixesErEst', 'suffixesLyNess', 'homophones', 'pluralRules', 'consonantDoubling'],
            'phonics': ['cvcWords', 'letterSounds', 'wordEndings', 'rhyming'],
            'cvc': ['cvcWords'],
            'rhyme': ['rhyming'],
            'rhyming': ['rhyming'],
            'homophone': ['homophones'],

            // === GRAMMAR - WORD CLASSES ===
            'grammar': ['nounsVerbs', 'adjectives', 'adverbs', 'conjunctions', 'prepositions', 'sentenceTypes', 'wordClasses', 'determiners'],
            'noun': ['nounsVerbs', 'nounPhrases', 'collectiveNouns', 'convertNouns'],
            'verb': ['nounsVerbs', 'pastPresent', 'modalVerbs', 'presentPerfect', 'subjectVerb'],
            'adjective': ['adjectives', 'nounPhrases'],
            'adverb': ['adverbs', 'frontedAdverbials'],
            'conjunction': ['conjunctions', 'joiningAnd'],
            'preposition': ['prepositions'],
            'determiner': ['determiners'],
            'pronoun': ['pronounsCohesion'],

            // === GRAMMAR - TENSE ===
            'tense': ['pastPresent', 'presentPerfect'],
            'past tense': ['pastPresent'],
            'present tense': ['pastPresent', 'presentPerfect'],
            'perfect': ['presentPerfect'],

            // === PUNCTUATION ===
            'punctuation': ['capitalFullStop', 'commasLists', 'apostrophesContractions', 'possessiveApostrophes', 'invertedCommas', 'directSpeech', 'semicolonsColons', 'questionMarks', 'exclamations', 'hyphens', 'ellipsis', 'parenthesis'],
            'apostrophe': ['apostrophesContractions', 'possessiveApostrophes'],
            'contraction': ['apostrophesContractions'],
            'possessive': ['possessiveApostrophes'],
            'speech mark': ['invertedCommas', 'directSpeech'],
            'inverted comma': ['invertedCommas', 'directSpeech'],
            'speech': ['invertedCommas', 'directSpeech', 'reportedSpeech'],
            'comma': ['commasLists', 'frontedAdverbials'],
            'capital': ['capitalFullStop', 'daysWeek'],
            'full stop': ['capitalFullStop'],
            'question mark': ['questionMarks'],
            'exclamation': ['exclamations'],
            'semicolon': ['semicolonsColons'],
            'colon': ['semicolonsColons'],
            'hyphen': ['hyphens'],
            'bracket': ['parenthesis'],
            'dash': ['parenthesis'],

            // === SENTENCE STRUCTURE ===
            'sentence': ['simpleSentences', 'sentenceTypes', 'compoundSentences', 'relativeClauses', 'standardEnglish'],
            'clause': ['relativeClauses', 'compoundSentences'],
            'relative clause': ['relativeClauses'],
            'compound': ['compoundSentences', 'compoundWords'],
            'paragraph': ['paragraphs', 'paragraphLinks', 'cohesiveDevices'],
            'connective': ['conjunctions', 'cohesiveDevices', 'timeConnectives'],

            // === VOCABULARY ===
            'vocabulary': ['prefixes', 'wordFamilies', 'synonymsAntonyms', 'compoundWords', 'wordOrigins'],
            'prefix': ['prefixes', 'prefixesMisDisUn'],
            'suffix': ['suffixesErEst', 'suffixesLyNess'],
            'synonym': ['synonymsAntonyms'],
            'antonym': ['synonymsAntonyms'],
            'word family': ['wordFamilies'],
            'compound word': ['compoundWords'],

            // === WRITING STYLE ===
            'formal': ['formalInformal', 'formalWriting'],
            'informal': ['formalInformal'],
            'passive': ['passiveVoice'],
            'active': ['passiveVoice'],
            'subjunctive': ['subjunctive'],
            'conditional': ['conditionals'],
            'rhetorical': ['rhetoricalDevices'],

            // === SPECIFIC CONCEPTS ===
            'plural': ['pluralsSimple', 'pluralRules'],
            'singular': ['pluralsSimple', 'pluralRules'],
            'modal': ['modalVerbs'],
            'fronted adverbial': ['frontedAdverbials'],
            'cohesion': ['cohesiveDevices', 'pronounsCohesion'],
            'ambiguity': ['ambiguity'],
            'bullet point': ['bulletPoints'],
            'heading': ['headingsSubheadings'],
            'subheading': ['headingsSubheadings'],
        };

        // Process each topic part
        for (const part of topicParts) {
            // Try exact and partial matches
            for (const [keyword, generators] of Object.entries(keywordMappings)) {
                if (part.includes(keyword) || keyword.includes(part)) {
                    generators.forEach(g => matches.add(g));
                }
            }
        }

        // Filter to only include generators that exist for this year
        let validMatches = [...matches].filter(g => allYearTopics.includes(g) && this.generators[g]);

        console.log(`[English Topic Mapper] Matched before filtering: [${[...matches].join(', ')}]`);
        console.log(`[English Topic Mapper] Valid for Year ${year}: [${validMatches.join(', ')}]`);

        // Fuzzy search fallback if no matches
        if (validMatches.length === 0) {
            console.log(`[English Topic Mapper] No matches, trying fuzzy search...`);

            for (const part of topicParts) {
                const words = part.split(/\s+/);
                for (const word of words) {
                    if (word.length >= 3) {
                        for (const topic of allYearTopics) {
                            if (topic.toLowerCase().includes(word) || word.includes(topic.toLowerCase().slice(0, 4))) {
                                validMatches.push(topic);
                                console.log(`[English Topic Mapper] Fuzzy matched "${word}" to "${topic}"`);
                            }
                        }
                    }
                }
            }
        }

        const finalResult = [...new Set(validMatches)];
        console.log(`[English Topic Mapper] Final result: [${finalResult.join(', ')}]`);

        return finalResult;
    },

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

    generators: {
        cvcWords: () => {
            // Use words that are unambiguous OR provide a picture/meaning hint
            const words = [
                { word: 'cat', missing: 'c_t', sound: 'a', hint: '🐱 (animal that meows)' },
                { word: 'dog', missing: 'd_g', sound: 'o', hint: '🐕 (animal that barks)' },
                { word: 'pen', missing: 'p_n', sound: 'e', hint: '🖊️ (for writing)' },
                { word: 'pan', missing: 'p_n', sound: 'a', hint: '🍳 (for cooking)' },
                { word: 'sun', missing: 's_n', sound: 'u', hint: '☀️ (in the sky)' },
                { word: 'son', missing: 's_n', sound: 'o', hint: '👦 (a boy child)' },
                { word: 'big', missing: 'b_g', sound: 'i', hint: '(opposite of small)' },
                { word: 'bag', missing: 'b_g', sound: 'a', hint: '🎒 (to carry things)' },
                { word: 'bug', missing: 'b_g', sound: 'u', hint: '🐛 (a small insect)' },
                { word: 'hat', missing: 'h_t', sound: 'a', hint: '🎩 (worn on head)' },
                { word: 'hot', missing: 'h_t', sound: 'o', hint: '🔥 (very warm)' },
                { word: 'hit', missing: 'h_t', sound: 'i', hint: '👊 (to strike)' },
                { word: 'cup', missing: 'c_p', sound: 'u', hint: '☕ (for drinking)' },
                { word: 'cap', missing: 'c_p', sound: 'a', hint: '🧢 (worn on head)' },
                { word: 'net', missing: 'n_t', sound: 'e', hint: '🥅 (catches fish or balls)' },
                { word: 'nut', missing: 'n_t', sound: 'u', hint: '🥜 (food with a shell)' }
            ];
            const item = words[Math.floor(Math.random() * words.length)];
            return {
                question: `Fill in the missing letter:\n${item.missing}\nHint: ${item.hint}`,
                answer: item.sound,
                explanation: `The word is "${item.word}". The missing letter is "${item.sound}".`,
                type: 'phonics',
                inputType: 'text'
            };
        },

        capitalFullStop: () => {
            const sentences = [
                { wrong: 'the cat sat on the mat', correct: 'The cat sat on the mat.' },
                { wrong: 'i like to play', correct: 'I like to play.' },
                { wrong: 'my name is sam', correct: 'My name is Sam.' }
            ];
            const item = sentences[Math.floor(Math.random() * sentences.length)];
            return {
                question: `Rewrite this sentence with a capital letter and full stop:\n"${item.wrong}"`,
                answer: item.correct,
                explanation: `Sentences start with a capital letter and end with a full stop: "${item.correct}"`,
                type: 'punctuation',
                inputType: 'text'
            };
        },

        commonWords: () => {
            const words = ['the', 'and', 'said', 'have', 'like', 'come', 'some', 'were', 'there', 'what'];
            const word = words[Math.floor(Math.random() * words.length)];
            const jumbled = word.split('').sort(() => Math.random() - 0.5).join('');
            return {
                question: `Unscramble this common word: ${jumbled}`,
                answer: word,
                explanation: `The word is "${word}".`,
                type: 'spelling',
                inputType: 'text'
            };
        },

        simpleSentences: () => {
            // Provide word bank so children know what to choose from
            const sentences = [
                {
                    sentence: 'The dog _______ in the garden.',
                    words: ['runs', 'big', 'happy'],
                    answer: 'runs',
                    hint: 'action word'
                },
                {
                    sentence: 'A cat _______ on the sofa.',
                    words: ['sleeps', 'soft', 'brown'],
                    answer: 'sleeps',
                    hint: 'action word'
                },
                {
                    sentence: 'The bird _______ in the sky.',
                    words: ['flies', 'blue', 'small'],
                    answer: 'flies',
                    hint: 'action word'
                },
                {
                    sentence: 'My friend _______ to school.',
                    words: ['walks', 'nice', 'tall'],
                    answer: 'walks',
                    hint: 'action word'
                },
                {
                    sentence: 'The fish _______ in the tank.',
                    words: ['swims', 'wet', 'tiny'],
                    answer: 'swims',
                    hint: 'action word'
                }
            ];
            const item = sentences[Math.floor(Math.random() * sentences.length)];
            return {
                question: `Choose the ${item.hint} (verb) to complete the sentence:\n${item.sentence}\nWord bank: ${item.words.join(', ')}`,
                answer: item.answer,
                explanation: `"${item.answer}" is an action word (verb) that tells us what is happening.`,
                type: 'sentences',
                inputType: 'text',
                choices: item.words
            };
        },

        nounsVerbs: () => {
            const items = [
                { word: 'run', type: 'verb' },
                { word: 'table', type: 'noun' },
                { word: 'jump', type: 'verb' },
                { word: 'book', type: 'noun' },
                { word: 'sing', type: 'verb' },
                { word: 'chair', type: 'noun' }
            ];
            const item = items[Math.floor(Math.random() * items.length)];
            return {
                question: `Is "${item.word}" a noun or a verb?`,
                answer: item.type,
                explanation: `"${item.word}" is a ${item.type}. ${item.type === 'noun' ? 'Nouns are naming words for things.' : 'Verbs are action or doing words.'}`,
                type: 'grammar',
                inputType: 'text',
                choices: ['noun', 'verb']
            };
        },

        pastPresent: () => {
            const verbs = [
                { present: 'walk', past: 'walked' },
                { present: 'play', past: 'played' },
                { present: 'jump', past: 'jumped' },
                { present: 'go', past: 'went' },
                { present: 'run', past: 'ran' }
            ];
            const verb = verbs[Math.floor(Math.random() * verbs.length)];
            const askPast = Math.random() > 0.5;

            if (askPast) {
                return {
                    question: `What is the past tense of "${verb.present}"?`,
                    answer: verb.past,
                    explanation: `The past tense of "${verb.present}" is "${verb.past}".`,
                    type: 'grammar',
                    inputType: 'text'
                };
            } else {
                return {
                    question: `What is the present tense of "${verb.past}"?`,
                    answer: verb.present,
                    explanation: `The present tense of "${verb.past}" is "${verb.present}".`,
                    type: 'grammar',
                    inputType: 'text'
                };
            }
        },

        adjectives: () => {
            const sentences = [
                { sentence: 'The ___ dog ran quickly.', options: ['big', 'run', 'quickly'], answer: 'big' },
                { sentence: 'She wore a ___ dress.', options: ['beautiful', 'walking', 'slowly'], answer: 'beautiful' },
                { sentence: 'The ___ boy smiled.', options: ['happy', 'jump', 'loudly'], answer: 'happy' }
            ];
            const item = sentences[Math.floor(Math.random() * sentences.length)];
            return {
                question: `Choose the adjective to complete the sentence:\n${item.sentence}\nOptions: ${item.options.join(', ')}`,
                answer: item.answer,
                explanation: `"${item.answer}" is an adjective - it describes a noun.`,
                type: 'grammar',
                inputType: 'text',
                choices: item.options
            };
        },

        prefixes: () => {
            const prefixes = [
                { prefix: 'un', word: 'happy', result: 'unhappy', meaning: 'not happy' },
                { prefix: 'dis', word: 'like', result: 'dislike', meaning: 'not like' },
                { prefix: 're', word: 'write', result: 'rewrite', meaning: 'write again' },
                { prefix: 'mis', word: 'spell', result: 'misspell', meaning: 'spell wrongly' }
            ];
            const item = prefixes[Math.floor(Math.random() * prefixes.length)];
            return {
                question: `Add the prefix "${item.prefix}-" to "${item.word}". What new word do you make?`,
                answer: item.result,
                explanation: `${item.prefix} + ${item.word} = ${item.result}, which means "${item.meaning}".`,
                type: 'vocabulary',
                inputType: 'text'
            };
        },

        conjunctions: () => {
            const sentences = [
                { parts: ['I wanted to play outside', 'it was raining'], conjunction: 'but', type: 'contrast' },
                { parts: ['She studied hard', 'she passed the test'], conjunction: 'so', type: 'result' },
                { parts: ['I like apples', 'I like oranges'], conjunction: 'and', type: 'addition' }
            ];
            const item = sentences[Math.floor(Math.random() * sentences.length)];
            return {
                question: `Choose the best conjunction to join these sentences:\n"${item.parts[0]}" _____ "${item.parts[1]}"\nOptions: and, but, so, because`,
                answer: item.conjunction,
                explanation: `"${item.conjunction}" is used for ${item.type}. Full sentence: "${item.parts[0]} ${item.conjunction} ${item.parts[1]}."`,
                type: 'grammar',
                inputType: 'text',
                choices: ['and', 'but', 'so', 'because']
            };
        },

        homophones: () => {
            const pairs = [
                { word1: 'there', word2: 'their', sentence: '___ going to the park.', answer: "They're", explanation: "They're = They are" },
                { word1: 'to', word2: 'too', sentence: 'I want to come ___!', answer: 'too', explanation: '"too" means "also"' },
                { word1: 'your', word2: "you're", sentence: "___ very kind.", answer: "You're", explanation: "You're = You are" }
            ];
            const item = pairs[Math.floor(Math.random() * pairs.length)];
            return {
                question: `Choose the correct word:\n${item.sentence}`,
                answer: item.answer,
                explanation: item.explanation,
                type: 'spelling',
                inputType: 'text'
            };
        },

        modalVerbs: () => {
            const modals = ['can', 'could', 'should', 'would', 'might', 'must'];
            const contexts = [
                { sentence: 'You ___ finish your homework before watching TV.', best: 'should', meaning: 'advice' },
                { sentence: 'It ___ rain later, so take an umbrella.', best: 'might', meaning: 'possibility' },
                { sentence: 'You ___ wear a seatbelt in the car.', best: 'must', meaning: 'necessity' }
            ];
            const item = contexts[Math.floor(Math.random() * contexts.length)];
            return {
                question: `Choose the best modal verb:\n${item.sentence}\nOptions: ${modals.join(', ')}`,
                answer: item.best,
                explanation: `"${item.best}" shows ${item.meaning}.`,
                type: 'grammar',
                inputType: 'text',
                choices: modals
            };
        },

        passiveVoice: () => {
            const sentences = [
                { active: 'The cat chased the mouse.', passive: 'The mouse was chased by the cat.' },
                { active: 'The chef cooked the meal.', passive: 'The meal was cooked by the chef.' },
                { active: 'The boy kicked the ball.', passive: 'The ball was kicked by the boy.' }
            ];
            const item = sentences[Math.floor(Math.random() * sentences.length)];
            return {
                question: `Rewrite this sentence in the passive voice:\n"${item.active}"`,
                answer: item.passive,
                explanation: `In passive voice, the object becomes the subject. "${item.passive}"`,
                type: 'grammar',
                inputType: 'text'
            };
        },

        synonymsAntonyms: () => {
            const pairs = [
                { word: 'happy', synonym: 'joyful', antonym: 'sad' },
                { word: 'big', synonym: 'large', antonym: 'small' },
                { word: 'fast', synonym: 'quick', antonym: 'slow' },
                { word: 'hot', synonym: 'warm', antonym: 'cold' }
            ];
            const item = pairs[Math.floor(Math.random() * pairs.length)];
            const askSynonym = Math.random() > 0.5;

            if (askSynonym) {
                return {
                    question: `What is a synonym (word with similar meaning) for "${item.word}"?`,
                    answer: item.synonym,
                    explanation: `"${item.synonym}" means the same as "${item.word}".`,
                    type: 'vocabulary',
                    inputType: 'text'
                };
            } else {
                return {
                    question: `What is an antonym (opposite) of "${item.word}"?`,
                    answer: item.antonym,
                    explanation: `"${item.antonym}" is the opposite of "${item.word}".`,
                    type: 'vocabulary',
                    inputType: 'text'
                };
            }
        },

        // Additional generators for other topics...
        questionMarks: () => ({
            question: 'Add the correct punctuation: "Where are you going"',
            answer: 'Where are you going?',
            explanation: 'Questions end with a question mark (?)',
            type: 'punctuation',
            inputType: 'text'
        }),

        pluralsSimple: () => {
            const words = [{ singular: 'cat', plural: 'cats' }, { singular: 'dog', plural: 'dogs' }, { singular: 'box', plural: 'boxes' }];
            const item = words[Math.floor(Math.random() * words.length)];
            return { question: `What is the plural of "${item.singular}"?`, answer: item.plural, explanation: `Add -s or -es: ${item.plural}`, type: 'spelling', inputType: 'text' };
        },

        joiningAnd: () => ({
            question: 'Join these sentences with "and":\n"I like apples." "I like bananas."',
            answer: 'I like apples and bananas.',
            explanation: 'Use "and" to join similar ideas.',
            type: 'sentences',
            inputType: 'text'
        }),

        sentenceTypes: () => ({
            question: 'What type of sentence is this: "Close the door!"\nOptions: statement, question, command, exclamation',
            answer: 'command',
            explanation: 'Commands tell someone to do something and often end with ! or .',
            type: 'grammar', inputType: 'text', choices: ['statement', 'question', 'command', 'exclamation']
        }),

        commasLists: () => ({
            question: 'Add commas to this list:\n"I bought apples oranges bananas and grapes."',
            answer: 'I bought apples, oranges, bananas and grapes.',
            explanation: 'Use commas to separate items in a list.',
            type: 'punctuation', inputType: 'text'
        }),

        suffixesErEst: () => {
            const words = [{ base: 'tall', er: 'taller', est: 'tallest' }, { base: 'small', er: 'smaller', est: 'smallest' }];
            const item = words[Math.floor(Math.random() * words.length)];
            return { question: `Add -er to "${item.base}"`, answer: item.er, explanation: `${item.base} + er = ${item.er}`, type: 'spelling', inputType: 'text' };
        },

        adverbs: () => ({
            question: 'Choose the adverb: "She ran quickly to school."\nOptions: She, ran, quickly, school',
            answer: 'quickly',
            explanation: 'Adverbs describe how something is done. "Quickly" describes how she ran.',
            type: 'grammar', inputType: 'text', choices: ['She', 'ran', 'quickly', 'school']
        }),

        apostrophesContractions: () => ({
            question: 'Write the contraction for "do not"',
            answer: "don't",
            explanation: 'do + not = don\'t (apostrophe replaces the "o")',
            type: 'punctuation', inputType: 'text'
        }),

        compoundSentences: () => ({
            question: 'Is this a simple or compound sentence?\n"I like pizza but my brother prefers pasta."',
            answer: 'compound',
            explanation: 'Compound sentences have two main clauses joined by a conjunction.',
            type: 'sentences', inputType: 'text', choices: ['simple', 'compound']
        }),

        paragraphs: () => ({
            question: 'Why do we start a new paragraph? Choose the best answer:\nA) To make writing look nice\nB) When changing topic or time\nC) After every sentence',
            answer: 'B',
            explanation: 'New paragraphs signal a change in topic, time, place, or speaker.',
            type: 'writing', inputType: 'text', choices: ['A', 'B', 'C']
        }),

        invertedCommas: () => ({
            question: 'Add speech marks:\nMum said Hello dear how was school',
            answer: 'Mum said, "Hello dear, how was school?"',
            explanation: 'Speech marks go around the exact words spoken.',
            type: 'punctuation', inputType: 'text'
        }),

        wordFamilies: () => ({
            question: 'Which word belongs to the same family as "play"?\nOptions: happy, playground, running, eating',
            answer: 'playground',
            explanation: 'Words in the same family share a root word: play → playground.',
            type: 'vocabulary', inputType: 'text', choices: ['happy', 'playground', 'running', 'eating']
        }),

        prepositions: () => ({
            question: 'Choose the preposition: "The cat sat ___ the mat."\nOptions: on, running, happy, cat',
            answer: 'on',
            explanation: 'Prepositions show position or relationship. "On" shows where the cat sat.',
            type: 'grammar', inputType: 'text', choices: ['on', 'running', 'happy', 'cat']
        }),

        presentPerfect: () => ({
            question: 'Complete with present perfect: "She ___ (finish) her homework."',
            answer: 'has finished',
            explanation: 'Present perfect = have/has + past participle.',
            type: 'grammar', inputType: 'text'
        }),

        headingsSubheadings: () => ({
            question: 'What is the purpose of a subheading?\nA) To end a paragraph\nB) To organize sections within a text\nC) To replace full stops',
            answer: 'B',
            explanation: 'Subheadings organize content and help readers find information.',
            type: 'writing', inputType: 'text', choices: ['A', 'B', 'C']
        }),

        frontedAdverbials: () => ({
            question: 'Identify the fronted adverbial: "Early in the morning, the birds began to sing."',
            answer: 'Early in the morning',
            explanation: 'A fronted adverbial comes at the start and tells when, where, or how.',
            type: 'grammar', inputType: 'text'
        }),

        possessiveApostrophes: () => ({
            question: 'Add the possessive apostrophe: "The dogs bone was buried."',
            answer: "The dog's bone was buried.",
            explanation: "Use 's to show the bone belongs to the dog.",
            type: 'punctuation', inputType: 'text'
        }),

        nounPhrases: () => {
            const phrases = [
                { basic: 'the house', expanded: 'the old, creaky house', wrong1: 'the house old', wrong2: 'house the old' },
                { basic: 'a dog', expanded: 'a big, fluffy dog', wrong1: 'a dog big', wrong2: 'dog fluffy big' },
                { basic: 'the car', expanded: 'the shiny, red car', wrong1: 'the car shiny', wrong2: 'red the car' },
                { basic: 'a cake', expanded: 'a delicious, chocolate cake', wrong1: 'a cake chocolate', wrong2: 'delicious a cake' }
            ];
            const item = phrases[Math.floor(Math.random() * phrases.length)];
            const choices = [item.expanded, item.wrong1, item.wrong2].sort(() => Math.random() - 0.5);
            return {
                question: `Which is the correct expanded noun phrase for "${item.basic}"?\nOptions:\nA) ${choices[0]}\nB) ${choices[1]}\nC) ${choices[2]}`,
                answer: item.expanded,
                explanation: `Expanded noun phrases add adjectives BEFORE the noun: "${item.expanded}"`,
                type: 'grammar',
                inputType: 'text',
                choices: choices
            };
        },

        standardEnglish: () => ({
            question: 'Correct to Standard English: "We was going to the shops."',
            answer: 'We were going to the shops.',
            explanation: '"We" takes "were" in Standard English.',
            type: 'grammar', inputType: 'text'
        }),

        pronounsCohesion: () => ({
            question: 'Replace the repeated noun with a pronoun:\n"The dog ran fast. The dog was very tired."',
            answer: 'The dog ran fast. It was very tired.',
            explanation: 'Using "it" avoids repetition and improves cohesion.',
            type: 'grammar', inputType: 'text'
        }),

        directSpeech: () => ({
            question: 'Punctuate this direct speech:\nHelp shouted the boy I am stuck',
            answer: '"Help!" shouted the boy. "I am stuck!"',
            explanation: 'Speech marks around words spoken, punctuation inside.',
            type: 'punctuation', inputType: 'text'
        }),

        relativeClauses: () => {
            const sentences = [
                {
                    sentence: 'The teacher, who was very kind, gave us homework.',
                    clause: 'who was very kind',
                    type: 'who'
                },
                {
                    sentence: 'The book, which I borrowed yesterday, was interesting.',
                    clause: 'which I borrowed yesterday',
                    type: 'which'
                },
                {
                    sentence: 'The dog that barked loudly woke everyone up.',
                    clause: 'that barked loudly',
                    type: 'that'
                },
                {
                    sentence: 'My friend, whose dad is a chef, made us lunch.',
                    clause: 'whose dad is a chef',
                    type: 'whose'
                }
            ];
            const item = sentences[Math.floor(Math.random() * sentences.length)];
            return {
                question: `Identify the relative clause in this sentence:\n"${item.sentence}"`,
                answer: item.clause,
                explanation: `The relative clause "${item.clause}" adds extra information using "${item.type}".`,
                type: 'grammar',
                inputType: 'text'
            };
        },

        parenthesis: () => {
            const examples = [
                {
                    sentence: 'My brother (a talented artist) painted this.',
                    withBrackets: 'My brother (a talented artist) painted this.',
                    withDashes: 'My brother - a talented artist - painted this.',
                    withCommas: 'My brother, a talented artist, painted this.'
                },
                {
                    sentence: 'The capital of France (Paris) is beautiful.',
                    withBrackets: 'The capital of France (Paris) is beautiful.',
                    withDashes: 'The capital of France - Paris - is beautiful.',
                    withCommas: 'The capital of France, Paris, is beautiful.'
                }
            ];
            const item = examples[Math.floor(Math.random() * examples.length)];
            const methods = ['brackets ()', 'dashes -', 'commas ,'];
            return {
                question: `Which punctuation is used for parenthesis in this sentence?\n"${item.withBrackets}"\nOptions: ${methods.join(', ')}`,
                answer: 'brackets ()',
                explanation: 'Parenthesis can use brackets (), dashes -, or commas , to add extra information.',
                type: 'punctuation',
                inputType: 'text',
                choices: methods
            };
        },

        cohesiveDevices: () => ({
            question: 'Choose the best connecting word:\n"I studied hard. _____, I passed the exam."\nOptions: However, Therefore, Although, But',
            answer: 'Therefore',
            explanation: '"Therefore" shows result/consequence.',
            type: 'grammar', inputType: 'text', choices: ['However', 'Therefore', 'Although', 'But']
        }),

        formalInformal: () => ({
            question: 'Is this formal or informal?\n"Dear Sir, I am writing to enquire about..."',
            answer: 'formal',
            explanation: '"Dear Sir" and "enquire" are formal language features.',
            type: 'writing', inputType: 'text', choices: ['formal', 'informal']
        }),

        subjunctive: () => ({
            question: 'Complete using the subjunctive:\n"If I ___ you, I would apologize."',
            answer: 'were',
            explanation: 'The subjunctive uses "were" for hypothetical situations.',
            type: 'grammar', inputType: 'text'
        }),

        semicolonsColons: () => ({
            question: 'Add a semicolon or colon:\n"I have three pets a cat, a dog and a fish."',
            answer: 'I have three pets: a cat, a dog and a fish.',
            explanation: 'A colon introduces a list.',
            type: 'punctuation', inputType: 'text'
        }),

        hyphens: () => ({
            question: 'Which needs a hyphen?\nA) well known author\nB) the author is well known',
            answer: 'A',
            explanation: 'Use hyphens in compound adjectives before nouns: well-known author.',
            type: 'punctuation', inputType: 'text', choices: ['A', 'B']
        }),

        ellipsis: () => ({
            question: 'What does the ellipsis show in: "She opened the door and then..."',
            answer: 'Something is left unsaid or continues',
            explanation: 'Ellipsis (...) shows something is incomplete, continuing, or omitted.',
            type: 'punctuation', inputType: 'text'
        }),

        formalWriting: () => ({
            question: 'Rewrite informally to formally:\n"I wanna know about the job."',
            answer: 'I would like to enquire about the position.',
            explanation: 'Formal writing uses proper words and avoids contractions.',
            type: 'writing', inputType: 'text'
        }),

        rhetoricalDevices: () => ({
            question: 'What rhetorical device is used?\n"She was as brave as a lion."',
            answer: 'simile',
            explanation: 'A simile compares using "as" or "like".',
            type: 'writing', inputType: 'text'
        }),

        // NEW GENERATORS - Year 1
        letterSounds: () => {
            const sounds = [{ letter: 'sh', word: 'ship' }, { letter: 'ch', word: 'chip' }, { letter: 'th', word: 'think' }, { letter: 'ng', word: 'sing' }];
            const s = sounds[Math.floor(Math.random() * sounds.length)];
            return { question: `What sound do you hear at the start of "${s.word}"?`, answer: s.letter, explanation: `"${s.word}" starts with the "${s.letter}" sound.`, type: 'phonics', inputType: 'text' };
        },

        wordEndings: () => {
            const words = [{ word: 'jumping', ending: 'ing' }, { word: 'jumped', ending: 'ed' }, { word: 'cats', ending: 's' }];
            const w = words[Math.floor(Math.random() * words.length)];
            return { question: `What is the ending of "${w.word}"?`, answer: w.ending, explanation: `"${w.word}" ends with "-${w.ending}".`, type: 'phonics', inputType: 'text' };
        },

        rhyming: () => {
            const pairs = [
                ['cat', 'hat', ['tree', 'book']],
                ['cat', 'mat', ['dog', 'cup']],
                ['dog', 'log', ['pen', 'sun']],
                ['dog', 'fog', ['hat', 'red']],
                ['sun', 'fun', ['cat', 'bed']],
                ['sun', 'run', ['log', 'tree']],
                ['red', 'bed', ['fun', 'hat']],
                ['red', 'said', ['dog', 'cat']],
                ['bat', 'rat', ['sun', 'cup']],
                ['hop', 'top', ['bed', 'hat']],
                ['cake', 'lake', ['tree', 'dog']],
                ['ball', 'tall', ['pen', 'sun']]
            ];
            const p = pairs[Math.floor(Math.random() * pairs.length)];
            const options = [p[1], ...p[2]].sort(() => Math.random() - 0.5);
            return {
                question: `Which word rhymes with "${p[0]}"?\nOptions: ${options.join(', ')}`,
                answer: p[1],
                explanation: `"${p[0]}" and "${p[1]}" rhyme because they end with the same sound.`,
                type: 'phonics',
                inputType: 'text',
                choices: options
            };
        },

        exclamations: () => ({
            question: 'Which punctuation mark shows excitement or surprise?\nOptions: . ? !',
            answer: '!',
            explanation: 'An exclamation mark (!) shows strong feelings.',
            type: 'punctuation', inputType: 'text', choices: ['.', '?', '!']
        }),

        daysWeek: () => {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const d = days[Math.floor(Math.random() * days.length)];
            return { question: `Does "${d}" need a capital letter at the start?`, answer: 'yes', explanation: `Days of the week always start with a capital letter.`, type: 'punctuation', inputType: 'text', choices: ['yes', 'no'] };
        },

        // NEW GENERATORS - Year 2
        compoundWords: () => {
            const words = [{ parts: ['rain', 'bow'], whole: 'rainbow' }, { parts: ['sun', 'shine'], whole: 'sunshine' }, { parts: ['foot', 'ball'], whole: 'football' }];
            const w = words[Math.floor(Math.random() * words.length)];
            return { question: `Join these words together: "${w.parts[0]}" + "${w.parts[1]}" = ?`, answer: w.whole, explanation: `${w.parts[0]} + ${w.parts[1]} = ${w.whole}. This is a compound word.`, type: 'vocabulary', inputType: 'text' };
        },

        collectiveNouns: () => {
            const nouns = [{ group: 'flock', animals: 'birds' }, { group: 'pack', animals: 'wolves' }, { group: 'school', animals: 'fish' }];
            const n = nouns[Math.floor(Math.random() * nouns.length)];
            return { question: `A "${n.group}" is the collective noun for a group of what?`, answer: n.animals, explanation: `A ${n.group} of ${n.animals} is the collective noun.`, type: 'vocabulary', inputType: 'text' };
        },

        suffixesLyNess: () => {
            const words = [{ base: 'happy', suffix: 'ness', result: 'happiness' }, { base: 'quick', suffix: 'ly', result: 'quickly' }];
            const w = words[Math.floor(Math.random() * words.length)];
            return { question: `Add "-${w.suffix}" to "${w.base}":`, answer: w.result, explanation: `${w.base} + ${w.suffix} = ${w.result}`, type: 'spelling', inputType: 'text' };
        },

        questionWords: () => {
            const words = ['Who', 'What', 'Where', 'When', 'Why', 'How'];
            const w = words[Math.floor(Math.random() * words.length)];
            return { question: `Complete: "___ is your name?"`, answer: 'What', explanation: 'Question words: Who, What, Where, When, Why, How.', type: 'grammar', inputType: 'text' };
        },

        // NEW GENERATORS - Year 3
        articleAThe: () => ({
            question: 'Choose "a" or "an":\n"___ elephant" and "___ dog"',
            answer: 'an, a',
            explanation: 'Use "an" before vowel sounds (elephant), "a" before consonants (dog).',
            type: 'grammar', inputType: 'text'
        }),

        timeConnectives: () => {
            const connectives = ['First', 'Then', 'Next', 'After that', 'Finally'];
            return { question: `Put these time connectives in order:\nFinally, First, Then\n(Write them separated by commas)`, answer: 'First, Then, Finally', explanation: 'Time connectives show the order events happen.', type: 'grammar', inputType: 'text' };
        },

        consonantDoubling: () => {
            const words = [{ base: 'hop', suffix: 'ing', result: 'hopping' }, { base: 'run', suffix: 'ing', result: 'running' }];
            const w = words[Math.floor(Math.random() * words.length)];
            return { question: `Add "-${w.suffix}" to "${w.base}":`, answer: w.result, explanation: `Double the consonant before adding -ing: ${w.result}`, type: 'spelling', inputType: 'text' };
        },

        wordClasses: () => {
            const words = [{ word: 'beautiful', class: 'adjective' }, { word: 'quickly', class: 'adverb' }, { word: 'happiness', class: 'noun' }];
            const w = words[Math.floor(Math.random() * words.length)];
            return { question: `What word class is "${w.word}"?\nOptions: noun, verb, adjective, adverb`, answer: w.class, explanation: `"${w.word}" is a ${w.class}.`, type: 'grammar', inputType: 'text', choices: ['noun', 'verb', 'adjective', 'adverb'] };
        },

        // NEW GENERATORS - Year 4
        determiners: () => ({
            question: 'Choose the determiner:\n"___ cat sat on the mat."\nOptions: The, Running, Sat',
            answer: 'The',
            explanation: 'Determiners (the, a, an, some, many) come before nouns.',
            type: 'grammar', inputType: 'text', choices: ['The', 'Running', 'Sat']
        }),

        pluralRules: () => {
            const words = [{ singular: 'child', plural: 'children' }, { singular: 'tooth', plural: 'teeth' }, { singular: 'mouse', plural: 'mice' }];
            const w = words[Math.floor(Math.random() * words.length)];
            return { question: `What is the plural of "${w.singular}"?`, answer: w.plural, explanation: `${w.singular} → ${w.plural} (irregular plural)`, type: 'spelling', inputType: 'text' };
        },

        paragraphLinks: () => ({
            question: 'Which word best links two paragraphs about a change?\nOptions: However, And, The',
            answer: 'However',
            explanation: '"However" shows contrast and links paragraphs well.',
            type: 'grammar', inputType: 'text', choices: ['However', 'And', 'The']
        }),

        prefixesMisDisUn: () => {
            const words = [{ prefix: 'mis', word: 'understand', result: 'misunderstand' }, { prefix: 'dis', word: 'agree', result: 'disagree' }];
            const w = words[Math.floor(Math.random() * words.length)];
            return { question: `Add the prefix "${w.prefix}-" to "${w.word}":`, answer: w.result, explanation: `${w.prefix} + ${w.word} = ${w.result}`, type: 'spelling', inputType: 'text' };
        },

        // NEW GENERATORS - Year 5
        convertNouns: () => ({
            question: 'Turn this verb into a noun using a suffix:\n"create" → ?',
            answer: 'creation',
            explanation: 'create + -ion = creation',
            type: 'vocabulary', inputType: 'text'
        }),

        ambiguity: () => ({
            question: 'This sentence is ambiguous: "The duck is ready to eat."\nWhat are the two meanings?',
            answer: 'The duck is prepared as food / The duck is hungry',
            explanation: 'Ambiguous sentences have more than one meaning.',
            type: 'grammar', inputType: 'text'
        }),

        degreesPossibility: () => ({
            question: 'Order these from least to most likely:\nmight, will, could',
            answer: 'could, might, will',
            explanation: 'Modal verbs show different degrees of possibility.',
            type: 'grammar', inputType: 'text'
        }),

        wordOrigins: () => ({
            question: 'The word "telephone" comes from Greek words meaning:\nA) far + sound  B) near + light  C) fast + slow',
            answer: 'A',
            explanation: 'tele (far) + phone (sound) = telephone',
            type: 'vocabulary', inputType: 'text', choices: ['A', 'B', 'C']
        }),

        // NEW GENERATORS - Year 6
        bulletPoints: () => ({
            question: 'When should you use bullet points?',
            answer: 'To list items clearly',
            explanation: 'Bullet points organize lists and make them easy to read.',
            type: 'writing', inputType: 'text'
        }),

        subjectVerb: () => ({
            question: 'Choose the correct verb: "The children ___ playing."\nOptions: is, are, am',
            answer: 'are',
            explanation: 'Plural subjects need plural verbs: children are.',
            type: 'grammar', inputType: 'text', choices: ['is', 'are', 'am']
        }),

        conditionals: () => ({
            question: 'Complete the conditional: "If I had studied, I ___ passed."',
            answer: 'would have',
            explanation: 'Third conditional: If + past perfect, would have + past participle.',
            type: 'grammar', inputType: 'text'
        }),

        reportedSpeech: () => ({
            question: 'Change to reported speech:\nShe said, "I am happy."',
            answer: 'She said that she was happy.',
            explanation: 'Direct to reported: change pronouns and tense.',
            type: 'grammar', inputType: 'text'
        }),

        // ========== NEW QUESTION TYPES ==========

        // Year 1: Letter sounds
        letterSounds: () => {
            const sounds = [
                { letter: 'a', word: 'apple', sound: 'a as in apple' },
                { letter: 'b', word: 'ball', sound: 'b as in ball' },
                { letter: 'c', word: 'cat', sound: 'c as in cat' },
                { letter: 'd', word: 'dog', sound: 'd as in dog' },
                { letter: 's', word: 'sun', sound: 's as in sun' },
                { letter: 'm', word: 'moon', sound: 'm as in moon' },
                { letter: 't', word: 'top', sound: 't as in top' },
                { letter: 'p', word: 'pen', sound: 'p as in pen' }
            ];
            const chosen = sounds[Math.floor(Math.random() * sounds.length)];
            return {
                question: `What sound does the letter "${chosen.letter}" make? Give a word that starts with this sound.`,
                answer: chosen.word,
                explanation: `The letter "${chosen.letter}" makes the sound ${chosen.sound}.`,
                type: 'phonics', inputType: 'text'
            };
        },

        // Year 1: Rhyming words
        rhymingWords: () => {
            const sets = typeof DataWordsEnglish !== 'undefined' ? DataWordsEnglish.rhymingSets : [
                ['cat', 'hat', 'bat', 'mat', 'rat', 'sat'],
                ['dog', 'log', 'fog', 'jog', 'frog']
            ];
            const set = sets[Math.floor(Math.random() * sets.length)];
            const word = set[0];
            const rhyme = set[Math.floor(Math.random() * (set.length - 1)) + 1];
            return {
                question: `Which word rhymes with "${word}"?`,
                options: [rhyme, 'house', 'tree', 'blue'].sort(() => Math.random() - 0.5),
                answer: rhyme,
                explanation: `"${word}" and "${rhyme}" rhyme because they end with the same sound.`,
                type: 'phonics', inputType: 'multiple-choice'
            };
        },

        // Year 1: Alphabet order
        alphabetOrder: () => {
            const pairs = [
                ['apple', 'banana'], ['cat', 'dog'], ['egg', 'fish'],
                ['hat', 'ice'], ['jump', 'kick'], ['lamp', 'moon']
            ];
            const pair = pairs[Math.floor(Math.random() * pairs.length)];
            const shuffled = [...pair].sort(() => Math.random() - 0.5);
            return {
                question: `Put these words in alphabetical order: ${shuffled.join(', ')}`,
                answer: pair.join(', '),
                explanation: `"${pair[0]}" comes before "${pair[1]}" in the alphabet.`,
                type: 'vocabulary', inputType: 'text'
            };
        },

        // Year 1: Vowels
        vowelSpot: () => {
            const vowels = ['a', 'e', 'i', 'o', 'u'];
            const words = ['cat', 'bed', 'pig', 'dog', 'cup', 'hat', 'pen', 'sit'];
            const word = words[Math.floor(Math.random() * words.length)];
            const vowel = word.split('').find(l => vowels.includes(l));
            return {
                question: `What is the vowel in the word "${word}"?`,
                options: ['a', 'e', 'i', 'o', 'u'],
                answer: vowel,
                explanation: `The vowel in "${word}" is "${vowel}". Vowels are a, e, i, o, u.`,
                type: 'phonics', inputType: 'multiple-choice'
            };
        },

        // Year 2: Compound words
        compoundWords: () => {
            const compounds = typeof DataWordsEnglish !== 'undefined' ? DataWordsEnglish.compoundWords : [
                { parts: ['sun', 'flower'], word: 'sunflower' },
                { parts: ['rain', 'bow'], word: 'rainbow' },
                { parts: ['foot', 'ball'], word: 'football' }
            ];
            const chosen = compounds[Math.floor(Math.random() * compounds.length)];
            return {
                question: `Join these words to make a compound word: ${chosen.parts[0]} + ${chosen.parts[1]}`,
                answer: chosen.word,
                explanation: `${chosen.parts[0]} + ${chosen.parts[1]} = ${chosen.word}`,
                type: 'vocabulary', inputType: 'text'
            };
        },

        // Year 2: Opposite meaning
        oppositeMeaning: () => {
            const antonyms = typeof DataWordsEnglish !== 'undefined' ? DataWordsEnglish.antonyms : [
                { word: 'hot', opposite: 'cold' },
                { word: 'big', opposite: 'small' },
                { word: 'happy', opposite: 'sad' }
            ];
            const chosen = antonyms[Math.floor(Math.random() * antonyms.length)];
            return {
                question: `What is the opposite of "${chosen.word}"?`,
                answer: chosen.opposite,
                explanation: `The opposite of "${chosen.word}" is "${chosen.opposite}".`,
                type: 'vocabulary', inputType: 'text'
            };
        },

        // Year 2: Adding ed and ing
        addEdIng: () => {
            const verbs = [
                { base: 'play', ed: 'played', ing: 'playing' },
                { base: 'jump', ed: 'jumped', ing: 'jumping' },
                { base: 'walk', ed: 'walked', ing: 'walking' },
                { base: 'cook', ed: 'cooked', ing: 'cooking' },
                { base: 'help', ed: 'helped', ing: 'helping' }
            ];
            const verb = verbs[Math.floor(Math.random() * verbs.length)];
            const isEd = Math.random() > 0.5;
            return {
                question: `Add "${isEd ? '-ed' : '-ing'}" to the word "${verb.base}".`,
                answer: isEd ? verb.ed : verb.ing,
                explanation: `${verb.base} + ${isEd ? '-ed' : '-ing'} = ${isEd ? verb.ed : verb.ing}`,
                type: 'spelling', inputType: 'text'
            };
        },

        // Year 3: Time connectives
        timeConnectives: () => {
            const connectives = ['First', 'Then', 'Next', 'After that', 'Finally', 'Later', 'Meanwhile'];
            const conn = connectives[Math.floor(Math.random() * connectives.length)];
            return {
                question: `Complete the sentence with a time connective:\n"___, we went to the park."`,
                options: connectives.slice(0, 4),
                answer: conn,
                explanation: `Time connectives like "${conn}" help order events in writing.`,
                type: 'writing', inputType: 'text'
            };
        },

        // Year 3: Word families
        wordFamilies: () => {
            const families = [
                { root: 'act', words: ['action', 'active', 'actor', 'activity'] },
                { root: 'help', words: ['helpful', 'helpless', 'helper', 'unhelpful'] },
                { root: 'kind', words: ['kindness', 'unkind', 'kindly', 'kinder'] },
                { root: 'play', words: ['player', 'playful', 'replay', 'playing'] }
            ];
            const family = families[Math.floor(Math.random() * families.length)];
            const word = family.words[Math.floor(Math.random() * family.words.length)];
            return {
                question: `What is the root word in "${word}"?`,
                answer: family.root,
                explanation: `The root word in "${word}" is "${family.root}".`,
                type: 'vocabulary', inputType: 'text'
            };
        },

        // Year 3: Speech punctuation  
        speechPunctuation: () => {
            const speeches = typeof DataSentences !== 'undefined' ? DataSentences.directSpeech : [
                { speaker: 'Mum', speech: 'Time for dinner', verb: 'called' }
            ];
            const chosen = speeches[Math.floor(Math.random() * speeches.length)];
            return {
                question: `Add speech marks to this sentence:\n${chosen.speech} ${chosen.verb} ${chosen.speaker}.`,
                answer: `"${chosen.speech}," ${chosen.verb} ${chosen.speaker}.`,
                explanation: `Speech marks go around the spoken words: "${chosen.speech},"`,
                type: 'punctuation', inputType: 'text'
            };
        },

        // Year 4: Fronted adverbials practice
        frontedAdverbialsAdvanced: () => {
            const adverbials = typeof DataSentences !== 'undefined' ? DataSentences.frontedAdverbials : [
                { adverbial: 'Early in the morning', sentence: 'the birds began to sing' }
            ];
            const chosen = adverbials[Math.floor(Math.random() * adverbials.length)];
            return {
                question: `What punctuation goes after a fronted adverbial?\n"${chosen.adverbial} ${chosen.sentence}."`,
                options: ['comma', 'full stop', 'exclamation mark', 'question mark'],
                answer: 'comma',
                explanation: `A comma follows a fronted adverbial: "${chosen.adverbial}, ${chosen.sentence}."`,
                type: 'punctuation', inputType: 'multiple-choice'
            };
        },

        // Year 4: Determiners
        determiners: () => {
            const examples = [
                { sentence: '___ apple is red.', answer: 'The', options: ['The', 'A', 'An'] },
                { sentence: 'I saw ___ elephant.', answer: 'an', options: ['a', 'an', 'the'] },
                { sentence: '___ cats are sleeping.', answer: 'The', options: ['The', 'A', 'Some'] },
                { sentence: 'Can I have ___ biscuit?', answer: 'a', options: ['a', 'an', 'the'] }
            ];
            const chosen = examples[Math.floor(Math.random() * examples.length)];
            return {
                question: `Choose the correct determiner:\n"${chosen.sentence}"`,
                options: chosen.options,
                answer: chosen.answer,
                explanation: `The correct determiner is "${chosen.answer}".`,
                type: 'grammar', inputType: 'multiple-choice'
            };
        },

        // Year 4: Paragraph order
        paragraphOrder: () => {
            return {
                question: 'What should come FIRST in a story?\nA) The problem is solved\nB) Characters are introduced\nC) The exciting climax\nD) The ending',
                options: ['A', 'B', 'C', 'D'],
                answer: 'B',
                explanation: 'Stories start by introducing characters and setting.',
                type: 'writing', inputType: 'multiple-choice'
            };
        },

        // Year 5: Relative pronouns
        relativePronouns: () => {
            const pronouns = [
                { sentence: 'The boy ___ won the race is happy.', answer: 'who', for: 'people' },
                { sentence: 'The book ___ I read was great.', answer: 'which', for: 'things' },
                { sentence: 'The place ___ we stayed was lovely.', answer: 'where', for: 'places' },
                { sentence: 'The day ___ we met was sunny.', answer: 'when', for: 'time' }
            ];
            const chosen = pronouns[Math.floor(Math.random() * pronouns.length)];
            return {
                question: `Complete with a relative pronoun:\n"${chosen.sentence}"`,
                options: ['who', 'which', 'where', 'when'],
                answer: chosen.answer,
                explanation: `Use "${chosen.answer}" for ${chosen.for}.`,
                type: 'grammar', inputType: 'multiple-choice'
            };
        },

        // Year 5: Adverbs of possibility
        adverbsPossibility: () => {
            const adverbs = [
                { adverb: 'certainly', level: 'definite' },
                { adverb: 'probably', level: 'likely' },
                { adverb: 'possibly', level: 'maybe' },
                { adverb: 'perhaps', level: 'maybe' },
                { adverb: 'definitely', level: 'definite' }
            ];
            const chosen = adverbs[Math.floor(Math.random() * adverbs.length)];
            return {
                question: `Which adverb shows possibility?\n"It will ___ rain tomorrow."`,
                options: ['quickly', 'probably', 'loudly', 'happily'],
                answer: 'probably',
                explanation: `"Probably" is an adverb that shows possibility or likelihood.`,
                type: 'grammar', inputType: 'multiple-choice'
            };
        },

        // Year 5: Figurative language - similes
        figurativeSimile: () => {
            const similes = [
                { simile: 'as brave as a lion', meaning: 'very brave' },
                { simile: 'as quiet as a mouse', meaning: 'very quiet' },
                { simile: 'as fast as lightning', meaning: 'extremely fast' },
                { simile: 'as cold as ice', meaning: 'very cold' },
                { simile: 'as light as a feather', meaning: 'very light' }
            ];
            const chosen = similes[Math.floor(Math.random() * similes.length)];
            return {
                question: `What does this simile mean?\n"${chosen.simile}"`,
                answer: chosen.meaning,
                explanation: `The simile "${chosen.simile}" means ${chosen.meaning}.`,
                type: 'figurative', inputType: 'text'
            };
        },

        // Year 5: Figurative language - metaphors
        figurativeMetaphor: () => {
            const metaphors = [
                { metaphor: 'He is a rock.', meaning: 'He is strong and reliable.' },
                { metaphor: 'She has a heart of gold.', meaning: 'She is very kind.' },
                { metaphor: 'Life is a journey.', meaning: 'Life has many stages and experiences.' },
                { metaphor: 'Time is money.', meaning: 'Time is valuable.' }
            ];
            const chosen = metaphors[Math.floor(Math.random() * metaphors.length)];
            return {
                question: `What does this metaphor mean?\n"${chosen.metaphor}"`,
                answer: chosen.meaning,
                explanation: `Metaphors compare things directly. "${chosen.metaphor}" means ${chosen.meaning}`,
                type: 'figurative', inputType: 'text'
            };
        },

        // Year 6: Active vs passive
        activeVoice: () => {
            const examples = typeof DataSentences !== 'undefined' ? DataSentences.activePassive : [
                { active: 'The dog chased the cat', passive: 'The cat was chased by the dog' }
            ];
            const chosen = examples[Math.floor(Math.random() * examples.length)];
            const showActive = Math.random() > 0.5;
            return {
                question: showActive
                    ? `Change to passive voice:\n"${chosen.active}."`
                    : `Change to active voice:\n"${chosen.passive}."`,
                answer: showActive ? chosen.passive + '.' : chosen.active + '.',
                explanation: showActive
                    ? `Passive: The subject receives the action.`
                    : `Active: The subject does the action.`,
                type: 'grammar', inputType: 'text'
            };
        },

        // Year 6: Semicolons
        semicolonsClause: () => {
            return {
                question: 'Which punctuation mark could replace "and" to join these clauses?\n"I love reading and my brother loves sports."',
                options: ['semicolon (;)', 'comma (,)', 'colon (:)', 'dash (-)'],
                answer: 'semicolon (;)',
                explanation: 'Semicolons join two related independent clauses without a conjunction.',
                type: 'punctuation', inputType: 'multiple-choice'
            };
        },

        // Year 6: Colons
        colonsIntro: () => {
            return {
                question: 'Complete with correct punctuation:\n"I need three things_ milk, bread, and eggs."',
                options: ['colon (:)', 'semicolon (;)', 'comma (,)', 'dash (-)'],
                answer: 'colon (:)',
                explanation: 'A colon introduces a list that follows.',
                type: 'punctuation', inputType: 'multiple-choice'
            };
        },

        // Year 6: Etymology
        etymology: () => {
            const words = [
                { word: 'telephone', origin: 'Greek', parts: 'tele (far) + phone (sound)' },
                { word: 'submarine', origin: 'Latin', parts: 'sub (under) + marine (sea)' },
                { word: 'autobiography', origin: 'Greek', parts: 'auto (self) + bio (life) + graphy (writing)' },
                { word: 'bicycle', origin: 'Latin/Greek', parts: 'bi (two) + cycle (wheel)' },
                { word: 'microscope', origin: 'Greek', parts: 'micro (small) + scope (look at)' }
            ];
            const chosen = words[Math.floor(Math.random() * words.length)];
            return {
                question: `What does the word "${chosen.word}" mean based on its parts?\n(${chosen.origin}: ${chosen.parts})`,
                answer: chosen.parts,
                explanation: `"${chosen.word}" comes from ${chosen.parts}.`,
                type: 'vocabulary', inputType: 'text'
            };
        },

        // Year 6: Persuasive devices
        persuasiveDevices: () => {
            const devices = [
                { device: 'rhetorical question', example: "Don't you want a cleaner planet?", purpose: 'to make readers think' },
                { device: 'rule of three', example: 'Faster, stronger, better.', purpose: 'to emphasise points' },
                { device: 'emotive language', example: 'innocent victims', purpose: 'to create feelings' },
                { device: 'direct address', example: 'You can make a difference.', purpose: 'to involve the reader' }
            ];
            const chosen = devices[Math.floor(Math.random() * devices.length)];
            return {
                question: `What persuasive device is this?\n"${chosen.example}"`,
                options: devices.map(d => d.device),
                answer: chosen.device,
                explanation: `"${chosen.example}" is a ${chosen.device} used ${chosen.purpose}.`,
                type: 'writing', inputType: 'multiple-choice'
            };
        },

        // Year 6: Synonyms in context
        synonymContext: () => {
            const examples = typeof DataWordsEnglish !== 'undefined' ? DataWordsEnglish.synonyms : [
                { word: 'said', similar: ['shouted', 'whispered', 'replied', 'answered'] }
            ];
            const chosen = examples[Math.floor(Math.random() * examples.length)];
            const synonym = chosen.similar[Math.floor(Math.random() * chosen.similar.length)];
            return {
                question: `Give a synonym (word with similar meaning) for "${chosen.word}".`,
                answer: synonym,
                explanation: `Synonyms for "${chosen.word}" include: ${chosen.similar.join(', ')}.`,
                type: 'vocabulary', inputType: 'text'
            };
        },

        // Expanded noun phrases practice
        nounPhrasesAdvanced: () => {
            const phrases = typeof DataSentences !== 'undefined' ? DataSentences.nounPhrases : [
                { simple: 'the dog', expanded: 'the fluffy, brown dog with a wagging tail' }
            ];
            const chosen = phrases[Math.floor(Math.random() * phrases.length)];
            return {
                question: `Expand this noun phrase with adjectives and extra details:\n"${chosen.simple}"`,
                answer: chosen.expanded,
                explanation: `An expanded noun phrase adds detail: "${chosen.expanded}"`,
                type: 'writing', inputType: 'text'
            };
        },

        // Spelling silent letters
        spellingSilent: () => {
            const words = [
                { word: 'knight', silent: 'k' },
                { word: 'write', silent: 'w' },
                { word: 'comb', silent: 'b' },
                { word: 'island', silent: 's' },
                { word: 'listen', silent: 't' },
                { word: 'knife', silent: 'k' },
                { word: 'gnome', silent: 'g' },
                { word: 'wrap', silent: 'w' }
            ];
            const chosen = words[Math.floor(Math.random() * words.length)];
            return {
                question: `Which letter is silent in the word "${chosen.word}"?`,
                options: ['k', 'w', 'b', 's', 't', 'g'].slice(0, 4),
                answer: chosen.silent,
                explanation: `The silent letter in "${chosen.word}" is "${chosen.silent}".`,
                type: 'spelling', inputType: 'text'
            };
        },

        // Prefixes advanced
        prefixAdvanced: () => {
            const prefixes = typeof DataWordsEnglish !== 'undefined' ? DataWordsEnglish.prefixes : {
                un: ['happy', 'kind'], re: ['do', 'write'], dis: ['agree', 'appear']
            };
            const prefixList = Object.keys(prefixes);
            const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
            const words = prefixes[prefix];
            const word = words[Math.floor(Math.random() * words.length)];
            return {
                question: `Add the prefix "${prefix}-" to "${word}". What does the new word mean?`,
                answer: prefix + word,
                explanation: `${prefix} + ${word} = ${prefix}${word}`,
                type: 'vocabulary', inputType: 'text'
            };
        },

        // Suffixes advanced  
        suffixAdvanced: () => {
            const suffixes = typeof DataWordsEnglish !== 'undefined' ? DataWordsEnglish.suffixes : {
                ly: ['quick', 'slow'], ful: ['hope', 'care'], less: ['hope', 'care']
            };
            const suffixList = Object.keys(suffixes);
            const suffix = suffixList[Math.floor(Math.random() * suffixList.length)];
            const words = suffixes[suffix];
            const word = words[Math.floor(Math.random() * words.length)];
            return {
                question: `Add the suffix "-${suffix}" to "${word}".`,
                answer: word + suffix,
                explanation: `${word} + -${suffix} = ${word}${suffix}`,
                type: 'vocabulary', inputType: 'text'
            };
        }
    }
};

window.EnglishGenerator = EnglishGenerator;
