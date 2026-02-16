/**
 * LearningChief - English Words Data Pool
 * 1000+ categorized vocabulary words for English questions
 */

const DataWordsEnglish = {
    // CVC words (consonant-vowel-consonant)
    cvcWords: [
        'cat', 'dog', 'hat', 'mat', 'bat', 'rat', 'sat', 'pat', 'fat', 'van',
        'can', 'man', 'pan', 'tan', 'ran', 'fan', 'ban', 'dan', 'jam', 'ham',
        'bed', 'red', 'led', 'fed', 'wed', 'ten', 'pen', 'hen', 'men', 'den',
        'pet', 'net', 'wet', 'set', 'get', 'let', 'met', 'bet', 'jet', 'yet',
        'pig', 'big', 'dig', 'wig', 'fig', 'jig', 'rig', 'bin', 'pin', 'tin',
        'win', 'fin', 'din', 'sin', 'bit', 'hit', 'sit', 'fit', 'kit', 'pit',
        'pot', 'hot', 'not', 'got', 'lot', 'dot', 'rot', 'cot', 'top', 'hop',
        'mop', 'pop', 'cop', 'job', 'rob', 'sob', 'mob', 'bob', 'nod', 'rod',
        'bug', 'mug', 'jug', 'hug', 'rug', 'tug', 'dug', 'pug', 'run', 'sun',
        'fun', 'bun', 'gun', 'nun', 'cut', 'but', 'hut', 'nut', 'put', 'rut'
    ],

    // Digraph words
    digraphWords: {
        sh: ['ship', 'shop', 'shed', 'shell', 'sheep', 'shut', 'shin', 'shock', 'shade', 'share'],
        ch: ['chip', 'chop', 'chin', 'chat', 'chest', 'check', 'chick', 'chain', 'chair', 'chase'],
        th: ['this', 'that', 'them', 'then', 'thin', 'thick', 'think', 'three', 'throw', 'thank'],
        wh: ['what', 'when', 'where', 'which', 'white', 'while', 'wheel', 'wheat', 'whistle', 'whale'],
        ng: ['ring', 'sing', 'king', 'wing', 'thing', 'bring', 'spring', 'string', 'swing', 'young'],
        ck: ['back', 'pack', 'black', 'clock', 'duck', 'luck', 'pick', 'sick', 'rock', 'sock']
    },

    // Compound words
    compoundWords: [
        { parts: ['sun', 'flower'], word: 'sunflower' },
        { parts: ['rain', 'bow'], word: 'rainbow' },
        { parts: ['foot', 'ball'], word: 'football' },
        { parts: ['bed', 'room'], word: 'bedroom' },
        { parts: ['cup', 'board'], word: 'cupboard' },
        { parts: ['tooth', 'brush'], word: 'toothbrush' },
        { parts: ['butter', 'fly'], word: 'butterfly' },
        { parts: ['class', 'room'], word: 'classroom' },
        { parts: ['play', 'ground'], word: 'playground' },
        { parts: ['birth', 'day'], word: 'birthday' },
        { parts: ['snow', 'man'], word: 'snowman' },
        { parts: ['water', 'fall'], word: 'waterfall' },
        { parts: ['book', 'shop'], word: 'bookshop' },
        { parts: ['air', 'port'], word: 'airport' },
        { parts: ['sea', 'side'], word: 'seaside' },
        { parts: ['grand', 'mother'], word: 'grandmother' },
        { parts: ['news', 'paper'], word: 'newspaper' },
        { parts: ['some', 'thing'], word: 'something' },
        { parts: ['every', 'one'], word: 'everyone' },
        { parts: ['after', 'noon'], word: 'afternoon' }
    ],

    // Rhyming word sets
    rhymingSets: [
        ['cat', 'hat', 'bat', 'mat', 'rat', 'sat', 'flat', 'chat'],
        ['dog', 'log', 'fog', 'jog', 'frog', 'clog', 'blog'],
        ['cake', 'make', 'take', 'bake', 'lake', 'wake', 'shake', 'snake'],
        ['light', 'night', 'right', 'fight', 'tight', 'bright', 'flight', 'sight'],
        ['rain', 'train', 'brain', 'chain', 'drain', 'grain', 'main', 'pain'],
        ['book', 'look', 'cook', 'hook', 'took', 'shook', 'brook'],
        ['day', 'way', 'say', 'play', 'stay', 'may', 'pay', 'today'],
        ['tree', 'free', 'see', 'bee', 'three', 'key', 'me', 'we'],
        ['king', 'ring', 'sing', 'thing', 'bring', 'spring', 'swing', 'wing'],
        ['moon', 'soon', 'spoon', 'balloon', 'cartoon', 'afternoon', 'tune']
    ],

    // Homophones
    homophones: [
        { pair: ['their', 'there'], sentences: ['___ dog is cute.', 'Put it over ___.'] },
        { pair: ['to', 'too', 'two'], sentences: ['I went ___ school.', 'Me ___!', 'I have ___ cats.'] },
        { pair: ['here', 'hear'], sentences: ['Come over ___.', 'I can ___ music.'] },
        { pair: ['where', 'wear'], sentences: ['___ are you going?', 'I ___ a hat.'] },
        { pair: ['no', 'know'], sentences: ['I have ___ money.', 'I ___ the answer.'] },
        { pair: ['write', 'right'], sentences: ['I can ___ my name.', 'Turn ___ at the corner.'] },
        { pair: ['see', 'sea'], sentences: ['I can ___ you.', 'Fish live in the ___.'] },
        { pair: ['be', 'bee'], sentences: ['I want to ___ a doctor.', 'A ___ makes honey.'] },
        { pair: ['by', 'buy', 'bye'], sentences: ['Stand ___ the door.', 'I will ___ milk.', 'Wave ___!'] },
        { pair: ['for', 'four'], sentences: ['This gift is ___ you.', 'I am ___ years old.'] },
        { pair: ['won', 'one'], sentences: ['We ___ the game.', 'I have ___ apple.'] },
        { pair: ['sun', 'son'], sentences: ['The ___ is bright.', 'He is her ___.'] },
        { pair: ['would', 'wood'], sentences: ['___ you like some?', 'The table is made of ___.'] },
        { pair: ['ate', 'eight'], sentences: ['I ___ breakfast.', 'There are ___ legs on a spider.'] },
        { pair: ['break', 'brake'], sentences: ["Don't ___ the glass.", 'Press the ___ to stop.'] }
    ],

    // Antonyms (opposites)
    antonyms: [
        { word: 'hot', opposite: 'cold' }, { word: 'big', opposite: 'small' },
        { word: 'fast', opposite: 'slow' }, { word: 'happy', opposite: 'sad' },
        { word: 'light', opposite: 'dark' }, { word: 'up', opposite: 'down' },
        { word: 'in', opposite: 'out' }, { word: 'on', opposite: 'off' },
        { word: 'open', opposite: 'closed' }, { word: 'old', opposite: 'new' },
        { word: 'young', opposite: 'old' }, { word: 'tall', opposite: 'short' },
        { word: 'long', opposite: 'short' }, { word: 'hard', opposite: 'soft' },
        { word: 'loud', opposite: 'quiet' }, { word: 'full', opposite: 'empty' },
        { word: 'rich', opposite: 'poor' }, { word: 'strong', opposite: 'weak' },
        { word: 'clean', opposite: 'dirty' }, { word: 'wet', opposite: 'dry' },
        { word: 'near', opposite: 'far' }, { word: 'easy', opposite: 'hard' },
        { word: 'right', opposite: 'wrong' }, { word: 'true', opposite: 'false' },
        { word: 'early', opposite: 'late' }, { word: 'begin', opposite: 'end' },
        { word: 'push', opposite: 'pull' }, { word: 'give', opposite: 'take' },
        { word: 'buy', opposite: 'sell' }, { word: 'win', opposite: 'lose' }
    ],

    // Synonyms
    synonyms: [
        { word: 'big', similar: ['large', 'huge', 'enormous', 'giant'] },
        { word: 'small', similar: ['little', 'tiny', 'minute', 'miniature'] },
        { word: 'happy', similar: ['glad', 'joyful', 'pleased', 'delighted'] },
        { word: 'sad', similar: ['unhappy', 'upset', 'miserable', 'gloomy'] },
        { word: 'nice', similar: ['kind', 'pleasant', 'lovely', 'wonderful'] },
        { word: 'bad', similar: ['awful', 'terrible', 'dreadful', 'horrible'] },
        { word: 'good', similar: ['great', 'excellent', 'fantastic', 'brilliant'] },
        { word: 'said', similar: ['shouted', 'whispered', 'replied', 'answered'] },
        { word: 'look', similar: ['glance', 'stare', 'gaze', 'peer'] },
        { word: 'walk', similar: ['stroll', 'march', 'stride', 'wander'] },
        { word: 'run', similar: ['sprint', 'dash', 'race', 'jog'] },
        { word: 'eat', similar: ['munch', 'gobble', 'nibble', 'devour'] }
    ],

    // Prefixes
    prefixes: {
        un: ['happy', 'kind', 'fair', 'lucky', 'well', 'able', 'do', 'tie', 'pack', 'wrap'],
        re: ['do', 'write', 'read', 'build', 'paint', 'play', 'fill', 'start', 'open', 'use'],
        dis: ['agree', 'appear', 'like', 'obey', 'honest', 'connect', 'trust', 'respect', 'order', 'arm'],
        mis: ['spell', 'understand', 'behave', 'lead', 'place', 'count', 'judge', 'treat', 'hear', 'match'],
        pre: ['view', 'heat', 'pay', 'test', 'order', 'school', 'historic', 'caution', 'cook', 'game'],
        sub: ['marine', 'way', 'zero', 'heading', 'title', 'conscious', 'standard', 'tropical', 'merge', 'mit'],
        super: ['market', 'man', 'star', 'natural', 'human', 'sonic', 'size', 'hero', 'power', 'charge'],
        anti: ['social', 'clockwise', 'freeze', 'bacterial', 'body', 'virus', 'war', 'dote', 'biotic', 'septic']
    },

    // Suffixes
    suffixes: {
        ly: ['quick', 'slow', 'happy', 'sad', 'quiet', 'loud', 'careful', 'beautiful', 'kind', 'gentle'],
        ful: ['hope', 'care', 'help', 'wonder', 'power', 'thank', 'peace', 'joy', 'pain', 'grace'],
        less: ['hope', 'care', 'help', 'home', 'fear', 'end', 'harm', 'pain', 'use', 'worth'],
        ness: ['kind', 'sad', 'happy', 'dark', 'weak', 'ill', 'good', 'mad', 'soft', 'bold'],
        ment: ['enjoy', 'agree', 'move', 'amaze', 'excite', 'develop', 'improve', 'employ', 'achieve', 'treat'],
        er: ['teach', 'work', 'play', 'farm', 'sing', 'read', 'write', 'build', 'paint', 'dance'],
        est: ['fast', 'slow', 'tall', 'short', 'long', 'young', 'old', 'strong', 'weak', 'kind']
    },

    // Connectives/conjunctions
    connectives: {
        coordinating: ['and', 'but', 'or', 'so', 'yet', 'for', 'nor'],
        subordinating: ['because', 'although', 'when', 'while', 'if', 'unless', 'until', 'after', 'before', 'since', 'as', 'whenever', 'wherever'],
        time: ['first', 'then', 'next', 'after', 'finally', 'meanwhile', 'later', 'soon', 'before', 'during', 'suddenly', 'eventually'],
        cause: ['because', 'so', 'therefore', 'consequently', 'as a result', 'due to', 'since', 'thus'],
        contrast: ['however', 'although', 'but', 'yet', 'on the other hand', 'nevertheless', 'despite', 'whereas', 'while'],
        addition: ['also', 'furthermore', 'moreover', 'in addition', 'besides', 'as well as', 'too', 'additionally']
    },

    // Modal verbs
    modalVerbs: ['can', 'could', 'may', 'might', 'will', 'would', 'shall', 'should', 'must', 'ought to'],

    // Adverbs by type
    adverbs: {
        manner: ['quickly', 'slowly', 'carefully', 'happily', 'sadly', 'quietly', 'loudly', 'gently', 'roughly', 'beautifully'],
        time: ['now', 'then', 'today', 'yesterday', 'tomorrow', 'soon', 'later', 'always', 'never', 'sometimes'],
        place: ['here', 'there', 'everywhere', 'nowhere', 'inside', 'outside', 'above', 'below', 'nearby', 'away'],
        frequency: ['always', 'usually', 'often', 'sometimes', 'rarely', 'never', 'occasionally', 'frequently', 'seldom', 'regularly'],
        degree: ['very', 'really', 'quite', 'almost', 'hardly', 'nearly', 'completely', 'totally', 'extremely', 'slightly']
    },

    // Adjectives by category
    adjectives: {
        size: ['big', 'small', 'tiny', 'huge', 'enormous', 'massive', 'little', 'large', 'giant', 'miniature'],
        colour: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white'],
        feeling: ['happy', 'sad', 'angry', 'scared', 'excited', 'worried', 'confused', 'surprised', 'tired', 'bored'],
        taste: ['sweet', 'sour', 'bitter', 'salty', 'spicy', 'bland', 'delicious', 'tasty', 'yummy', 'disgusting'],
        touch: ['soft', 'hard', 'smooth', 'rough', 'cold', 'warm', 'wet', 'dry', 'sticky', 'fluffy'],
        appearance: ['beautiful', 'ugly', 'pretty', 'handsome', 'gorgeous', 'plain', 'fancy', 'shabby', 'neat', 'messy']
    },

    // Tricky/sight words by year
    trickyWords: {
        year1: ['the', 'a', 'do', 'to', 'today', 'of', 'said', 'says', 'are', 'were', 'was', 'is', 'his', 'has', 'I', 'you', 'your', 'they', 'be', 'he', 'me', 'she', 'we', 'no', 'go', 'so', 'by', 'my', 'here', 'there', 'where', 'love', 'come', 'some', 'one', 'once', 'ask', 'friend', 'school', 'put', 'push', 'pull', 'full', 'house', 'our'],
        year2: ['door', 'floor', 'poor', 'because', 'find', 'kind', 'mind', 'behind', 'child', 'children', 'wild', 'climb', 'most', 'only', 'both', 'old', 'cold', 'gold', 'hold', 'told', 'every', 'everybody', 'even', 'great', 'break', 'steak', 'pretty', 'beautiful', 'after', 'fast', 'last', 'past', 'father', 'class', 'grass', 'pass', 'plant', 'path', 'bath', 'hour', 'move', 'prove', 'improve', 'sure', 'sugar', 'eye', 'could', 'should', 'would', 'who', 'whole', 'any', 'many', 'clothes', 'busy', 'people', 'water', 'again', 'half', 'money', 'Mr', 'Mrs', 'parents', 'Christmas']
    },

    // Helper methods
    random(category, subcategory = null) {
        const data = subcategory ? this[category]?.[subcategory] : this[category];
        if (!data) return '';
        if (Array.isArray(data)) {
            return data[Math.floor(Math.random() * data.length)];
        }
        return '';
    },

    randomMultiple(category, count, subcategory = null) {
        const data = subcategory ? this[category]?.[subcategory] : this[category];
        if (!data || !Array.isArray(data)) return [];
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
};

// Export for use in generators
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataWordsEnglish;
}
