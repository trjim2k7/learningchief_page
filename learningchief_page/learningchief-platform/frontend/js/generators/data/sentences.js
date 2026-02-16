/**
 * LearningChief - Sentence Templates Data Pool
 * 400+ sentence templates for English grammar questions
 */

const DataSentences = {
    // Simple sentences for punctuation practice
    simpleStatements: [
        'The cat sat on the mat',
        'I went to the park',
        'She likes to read books',
        'The dog ran in the garden',
        'We played football today',
        'He ate his lunch quickly',
        'The bird flew over the tree',
        'My friend lives near school',
        'They walked to the shops',
        'The sun is very bright',
        'I can see the moon',
        'She has a red bike',
        'The flowers smell nice',
        'We saw a rainbow',
        'He drew a picture',
        'The baby is sleeping',
        'My teacher is kind',
        'The car drove away',
        'I love my family',
        'The cake tastes delicious'
    ],

    // Questions for punctuation practice
    questions: [
        'What is your name',
        'Where do you live',
        'How old are you',
        'When is your birthday',
        'Why are you late',
        'Who is your best friend',
        'What time is it',
        'Where are my shoes',
        'How do you spell that',
        'Can I have some water',
        'Do you like pizza',
        'Are you coming to the party',
        'Have you finished your homework',
        'Will it rain tomorrow',
        'Did you see the film',
        'Would you like a biscuit',
        'Is this your pencil',
        'May I go outside',
        'Shall we play together',
        'Could you help me please'
    ],

    // Exclamations
    exclamations: [
        'What a beautiful day',
        'How amazing that was',
        'What a lovely surprise',
        'How exciting this is',
        'What a wonderful gift',
        'How lucky you are',
        'What a brilliant idea',
        'How fantastic that sounds',
        'What a gorgeous sunset',
        'How terrible that was'
    ],

    // Commands
    commands: [
        'Close the door',
        'Sit down please',
        'Listen carefully',
        'Write your name',
        'Open your books',
        'Stop running',
        'Be quiet',
        'Look at the board',
        'Come here quickly',
        'Put away your things'
    ],

    // Sentences needing capital letters (names/places)
    capitalsNeeded: [
        'my friend emma lives in london',
        'we visited paris in france',
        'on monday i went swimming',
        'mrs smith teaches english',
        'the river thames is very long',
        'my birthday is in january',
        'mr jones works at the hospital',
        'we celebrate christmas in december',
        'queen elizabeth lived in a palace',
        'the atlantic ocean is huge'
    ],

    // Sentences for comma practice (lists)
    listSentences: [
        'I need apples oranges bananas and grapes',
        'The colours are red blue green and yellow',
        'She plays piano guitar drums and violin',
        'We visited France Spain Italy and Greece',
        'The animals were lions tigers bears and wolves',
        'He bought a hat coat scarf and gloves',
        'The seasons are spring summer autumn and winter',
        'I can speak English French German and Spanish',
        'The cake needs flour sugar butter and eggs',
        'We saw dolphins whales sharks and seals'
    ],

    // Sentences for speech marks
    directSpeech: [
        { speaker: 'Mum', speech: 'Time for dinner', verb: 'called' },
        { speaker: 'Dad', speech: 'Well done', verb: 'said' },
        { speaker: 'Tom', speech: 'Can I play outside', verb: 'asked' },
        { speaker: 'Miss Jones', speech: 'Open your books', verb: 'instructed' },
        { speaker: 'The doctor', speech: 'Take this medicine', verb: 'advised' },
        { speaker: 'Gran', speech: 'What a lovely surprise', verb: 'exclaimed' },
        { speaker: 'The teacher', speech: 'Listen carefully', verb: 'reminded' },
        { speaker: 'My brother', speech: 'That is not fair', verb: 'complained' },
        { speaker: 'The policeman', speech: 'Stop right there', verb: 'shouted' },
        { speaker: 'Lily', speech: 'I love this song', verb: 'whispered' }
    ],

    // Sentences for active/passive voice
    activePassive: [
        { active: 'The dog chased the cat', passive: 'The cat was chased by the dog' },
        { active: 'Sam ate the apple', passive: 'The apple was eaten by Sam' },
        { active: 'The teacher marked the homework', passive: 'The homework was marked by the teacher' },
        { active: 'Mum baked a cake', passive: 'A cake was baked by Mum' },
        { active: 'The wind blew the leaves', passive: 'The leaves were blown by the wind' },
        { active: 'The artist painted the picture', passive: 'The picture was painted by the artist' },
        { active: 'The children built a sandcastle', passive: 'A sandcastle was built by the children' },
        { active: 'The cat caught the mouse', passive: 'The mouse was caught by the cat' },
        { active: 'Lightning struck the tree', passive: 'The tree was struck by lightning' },
        { active: 'The gardener planted flowers', passive: 'Flowers were planted by the gardener' }
    ],

    // Sentences for relative clauses
    relativeClause: [
        { main: 'The book is exciting', relative: 'which I am reading', combined: 'The book, which I am reading, is exciting' },
        { main: 'The girl won a prize', relative: 'who lives next door', combined: 'The girl, who lives next door, won a prize' },
        { main: 'The restaurant serves pizza', relative: 'where we went for dinner', combined: 'The restaurant, where we went for dinner, serves pizza' },
        { main: 'The day was sunny', relative: 'when we visited the zoo', combined: 'The day when we visited the zoo was sunny' },
        { main: 'The car is very fast', relative: 'which my uncle bought', combined: 'The car, which my uncle bought, is very fast' }
    ],

    // Sentences for fronted adverbials
    frontedAdverbials: [
        { adverbial: 'Early in the morning', sentence: 'the birds began to sing' },
        { adverbial: 'With great care', sentence: 'she placed the vase on the shelf' },
        { adverbial: 'After the storm', sentence: 'the sun came out' },
        { adverbial: 'In the dark forest', sentence: 'a wolf was howling' },
        { adverbial: 'Without making a sound', sentence: 'the cat crept towards the mouse' },
        { adverbial: 'Before breakfast', sentence: 'I like to go for a run' },
        { adverbial: 'During the match', sentence: 'the crowd cheered loudly' },
        { adverbial: 'Behind the old house', sentence: 'there was a secret garden' },
        { adverbial: 'As quick as a flash', sentence: 'the rabbit disappeared' },
        { adverbial: 'With trembling hands', sentence: 'he opened the mysterious letter' }
    ],

    // Sentences for parenthesis practice
    parenthesis: [
        { sentence: 'The dog _ a golden retriever _ loves to swim', insert: 'a golden retriever' },
        { sentence: 'My sister _ who is 10 _ goes to the same school', insert: 'who is 10' },
        { sentence: 'London _ the capital of England _ is very busy', insert: 'the capital of England' },
        { sentence: 'The cake _ which was chocolate _ tasted amazing', insert: 'which was chocolate' },
        { sentence: 'Mr Brown _ our headteacher _ gave a speech', insert: 'our headteacher' }
    ],

    // Sentences for modal verbs
    modalSentences: [
        { base: 'I go to the park', modal: 'can', result: 'I can go to the park' },
        { base: 'You finish your homework', modal: 'should', result: 'You should finish your homework' },
        { base: 'It rain tomorrow', modal: 'might', result: 'It might rain tomorrow' },
        { base: 'We wear school uniform', modal: 'must', result: 'We must wear school uniform' },
        { base: 'She help you with that', modal: 'could', result: 'She could help you with that' }
    ],

    // Expanded noun phrases
    nounPhrases: [
        { simple: 'the dog', expanded: 'the fluffy, brown dog with a wagging tail' },
        { simple: 'a castle', expanded: 'an ancient, crumbling castle on top of the misty hill' },
        { simple: 'the forest', expanded: 'the dark, mysterious forest filled with strange sounds' },
        { simple: 'a flower', expanded: 'a delicate, beautiful flower with bright red petals' },
        { simple: 'the boy', expanded: 'the tall, athletic boy wearing a blue jacket' },
        { simple: 'a cake', expanded: 'a delicious, three-layered chocolate cake covered in sprinkles' },
        { simple: 'the house', expanded: 'the old, abandoned house at the end of the street' },
        { simple: 'a bird', expanded: 'a tiny, colourful bird with a melodious song' },
        { simple: 'the storm', expanded: 'the fierce, raging storm with deafening thunder' },
        { simple: 'a dragon', expanded: 'a fearsome, fire-breathing dragon with glittering scales' }
    ],

    // Helper methods
    random(category) {
        const items = this[category];
        if (!items) return null;
        if (Array.isArray(items)) {
            return items[Math.floor(Math.random() * items.length)];
        }
        return null;
    },

    randomMultiple(category, count) {
        const items = this[category];
        if (!items || !Array.isArray(items)) return [];
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
};

// Export for use in generators
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataSentences;
}
