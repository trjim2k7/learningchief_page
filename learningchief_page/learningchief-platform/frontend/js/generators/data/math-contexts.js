/**
 * LearningChief - Math Contexts Data Pool
 * 300+ word problem scenarios and contexts
 */

const DataMathContexts = {
    // Shopping scenarios
    shopping: [
        { item: 'apples', unit: 'each', priceRange: [20, 50] },
        { item: 'oranges', unit: 'each', priceRange: [25, 60] },
        { item: 'bananas', unit: 'each', priceRange: [15, 35] },
        { item: 'pencils', unit: 'each', priceRange: [20, 50] },
        { item: 'notebooks', unit: 'each', priceRange: [100, 250] },
        { item: 'stickers', unit: 'pack', priceRange: [50, 150] },
        { item: 'chocolate bars', unit: 'each', priceRange: [60, 120] },
        { item: 'fizzy drinks', unit: 'each', priceRange: [80, 150] },
        { item: 'comics', unit: 'each', priceRange: [200, 400] },
        { item: 'toy cars', unit: 'each', priceRange: [150, 500] },
        { item: 'books', unit: 'each', priceRange: [500, 1200] },
        { item: 'games', unit: 'each', priceRange: [1000, 3000] }
    ],

    // Sharing/grouping scenarios
    sharing: [
        { context: 'sweets in a bag', action: 'shared equally among friends' },
        { context: 'stickers', action: 'divided between children' },
        { context: 'grapes on a plate', action: 'shared among family members' },
        { context: 'pencils in a box', action: 'given to each table' },
        { context: 'books on a shelf', action: 'sorted into piles' },
        { context: 'marbles in a jar', action: 'shared between players' },
        { context: 'crayons in a pack', action: 'divided among groups' },
        { context: 'cards in a deck', action: 'dealt to players' },
        { context: 'cupcakes on a tray', action: 'given out at the party' },
        { context: 'coins in a piggy bank', action: 'shared between siblings' }
    ],

    // Distance/travel scenarios
    travel: [
        { from: 'home', to: 'school', typical: [500, 2000], unit: 'm' },
        { from: 'the house', to: 'the park', typical: [200, 1000], unit: 'm' },
        { from: 'London', to: 'Manchester', typical: [250, 350], unit: 'km' },
        { from: 'the train station', to: 'the beach', typical: [5, 50], unit: 'km' },
        { from: 'the school', to: 'the swimming pool', typical: [1, 5], unit: 'km' },
        { from: 'the car park', to: 'the shop entrance', typical: [50, 200], unit: 'm' },
        { from: 'one end of the field', to: 'the other', typical: [80, 150], unit: 'm' },
        { from: 'the bus stop', to: 'the library', typical: [100, 800], unit: 'm' }
    ],

    // Time scenarios
    timing: [
        { activity: 'a football match', typicalMinutes: [90, 90] },
        { activity: 'a film', typicalMinutes: [90, 150] },
        { activity: 'a TV show', typicalMinutes: [30, 60] },
        { activity: 'a school lesson', typicalMinutes: [45, 60] },
        { activity: 'a swimming session', typicalMinutes: [30, 60] },
        { activity: 'a train journey', typicalMinutes: [30, 180] },
        { activity: 'cooking dinner', typicalMinutes: [30, 60] },
        { activity: 'homework', typicalMinutes: [20, 45] },
        { activity: 'a walk in the park', typicalMinutes: [20, 60] },
        { activity: 'reading time', typicalMinutes: [15, 30] }
    ],

    // Measurement scenarios
    measurements: {
        length: [
            { object: 'a pencil', typical: [15, 20], unit: 'cm' },
            { object: 'a book', typical: [20, 30], unit: 'cm' },
            { object: 'a table', typical: [100, 180], unit: 'cm' },
            { object: 'a classroom', typical: [8, 12], unit: 'm' },
            { object: 'a football pitch', typical: [90, 120], unit: 'm' },
            { object: 'a swimming pool', typical: [25, 50], unit: 'm' },
            { object: 'a ribbon', typical: [50, 200], unit: 'cm' },
            { object: 'a piece of string', typical: [30, 100], unit: 'cm' }
        ],
        weight: [
            { object: 'an apple', typical: [100, 200], unit: 'g' },
            { object: 'a bag of flour', typical: [1, 2], unit: 'kg' },
            { object: 'a cat', typical: [3, 6], unit: 'kg' },
            { object: 'a suitcase', typical: [15, 25], unit: 'kg' },
            { object: 'a book', typical: [200, 500], unit: 'g' },
            { object: 'a baby', typical: [3, 5], unit: 'kg' },
            { object: 'a bag of sugar', typical: [1, 1], unit: 'kg' },
            { object: 'a watermelon', typical: [3, 8], unit: 'kg' }
        ],
        capacity: [
            { object: 'a glass of water', typical: [200, 300], unit: 'ml' },
            { object: 'a bottle of juice', typical: [500, 1000], unit: 'ml' },
            { object: 'a bucket', typical: [5, 10], unit: 'litres' },
            { object: 'a bath', typical: [80, 150], unit: 'litres' },
            { object: 'a mug of tea', typical: [250, 350], unit: 'ml' },
            { object: 'a carton of milk', typical: [1, 2], unit: 'litres' },
            { object: 'a fish tank', typical: [20, 100], unit: 'litres' },
            { object: 'a paddling pool', typical: [50, 200], unit: 'litres' }
        ]
    },

    // Collecting/saving scenarios
    collecting: [
        { item: 'stickers', context: 'for an album' },
        { item: 'coins', context: 'in a jar' },
        { item: 'stamps', context: 'for a collection' },
        { item: 'books', context: 'to read' },
        { item: 'shells', context: 'at the beach' },
        { item: 'football cards', context: 'to trade' },
        { item: 'badges', context: 'from scouts' },
        { item: 'marbles', context: 'to play with' }
    ],

    // Baking/cooking scenarios
    cooking: [
        { item: 'biscuits', batchSize: [12, 24] },
        { item: 'cupcakes', batchSize: [12, 24] },
        { item: 'muffins', batchSize: [6, 12] },
        { item: 'cookies', batchSize: [20, 40] },
        { item: 'pancakes', batchSize: [8, 16] },
        { item: 'sandwiches', batchSize: [6, 12] },
        { item: 'pizzas', batchSize: [2, 4] },
        { item: 'tarts', batchSize: [6, 12] }
    ],

    // Sports/games scenarios
    sports: [
        { sport: 'football', scoreType: 'goals', typicalScore: [0, 5] },
        { sport: 'basketball', scoreType: 'points', typicalScore: [50, 100] },
        { sport: 'tennis', scoreType: 'games', typicalScore: [0, 7] },
        { sport: 'cricket', scoreType: 'runs', typicalScore: [100, 300] },
        { sport: 'swimming', scoreType: 'laps', typicalScore: [10, 50] },
        { sport: 'running', scoreType: 'metres', typicalScore: [100, 1500] }
    ],

    // Temperature scenarios
    temperature: [
        { context: 'a hot summer day', typical: [25, 35] },
        { context: 'a cold winter morning', typical: [-5, 5] },
        { context: 'a comfortable room', typical: [18, 22] },
        { context: 'the freezer', typical: [-20, -15] },
        { context: 'a warm bath', typical: [37, 40] },
        { context: 'boiling water', typical: [100, 100] },
        { context: 'a fridge', typical: [3, 5] },
        { context: 'body temperature', typical: [36, 38] }
    ],

    // Ratio scenarios
    ratios: [
        { context: 'mixing paint', items: ['red', 'blue'] },
        { context: 'making squash', items: ['cordial', 'water'] },
        { context: 'baking', items: ['flour', 'sugar'] },
        { context: 'sharing sweets', items: ['boys', 'girls'] },
        { context: 'dividing money', items: ['siblings'] },
        { context: 'mixing concrete', items: ['cement', 'sand'] },
        { context: 'making fruit salad', items: ['apples', 'oranges'] },
        { context: 'planting flowers', items: ['red', 'yellow'] }
    ],

    // Speed scenarios
    speed: [
        { vehicle: 'a car', typical: [30, 70], unit: 'mph' },
        { vehicle: 'a bicycle', typical: [10, 20], unit: 'mph' },
        { vehicle: 'a train', typical: [60, 125], unit: 'mph' },
        { vehicle: 'walking', typical: [3, 5], unit: 'km/h' },
        { vehicle: 'running', typical: [8, 15], unit: 'km/h' },
        { vehicle: 'a plane', typical: [500, 600], unit: 'mph' }
    ],

    // Shape contexts
    shapes: [
        { shape: 'a garden', type: 'rectangle' },
        { shape: 'a swimming pool', type: 'rectangle' },
        { shape: 'a room', type: 'rectangle' },
        { shape: 'a piece of paper', type: 'rectangle' },
        { shape: 'a photo frame', type: 'rectangle' },
        { shape: 'a patio', type: 'rectangle' },
        { shape: 'a playing field', type: 'rectangle' },
        { shape: 'a rug', type: 'rectangle' },
        { shape: 'a clock face', type: 'circle' },
        { shape: 'a pizza', type: 'circle' },
        { shape: 'a wheel', type: 'circle' },
        { shape: 'a coin', type: 'circle' }
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

    randomFromSub(category, subcategory) {
        const items = this[category]?.[subcategory];
        if (!items || !Array.isArray(items)) return null;
        return items[Math.floor(Math.random() * items.length)];
    }
};

// Export for use in generators
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataMathContexts;
}
