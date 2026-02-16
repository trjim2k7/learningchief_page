/**
 * LearningChief - Contexts Data Pool
 * Places, objects, activities, and scenarios for word problems
 */

const DataContexts = {
    // Containers for volume/capacity problems
    containers: [
        'box', 'tank', 'jar', 'basket', 'crate', 'barrel', 'bucket', 'bottle', 'can', 'tin',
        'carton', 'packet', 'bag', 'sack', 'tub', 'pot', 'jug', 'flask', 'container', 'bin',
        'chest', 'trunk', 'case', 'drawer', 'cupboard', 'shelf', 'tray', 'bowl', 'dish', 'cup',
        'mug', 'glass', 'pitcher', 'vase', 'tank', 'pool', 'pond', 'aquarium', 'bath', 'sink',
        'beaker', 'cylinder', 'cube', 'prism', 'package', 'parcel', 'envelope', 'folder', 'binder', 'wallet'
    ],

    // Places for context
    places: [
        'school', 'park', 'shop', 'supermarket', 'library', 'museum', 'zoo', 'farm', 'garden', 'playground',
        'beach', 'swimming pool', 'sports centre', 'cinema', 'theatre', 'restaurant', 'cafe', 'bakery', 'market', 'fair',
        'forest', 'woods', 'field', 'meadow', 'hill', 'mountain', 'river', 'lake', 'seaside', 'countryside',
        'village', 'town', 'city', 'street', 'road', 'path', 'bridge', 'tunnel', 'station', 'airport',
        'hospital', 'office', 'factory', 'warehouse', 'kitchen', 'bedroom', 'living room', 'garage', 'shed', 'attic',
        'classroom', 'hall', 'gym', 'canteen', 'staffroom', 'playground', 'car park', 'reception', 'corridor', 'staircase',
        'pet shop', 'toy shop', 'book shop', 'clothes shop', 'shoe shop', 'sports shop', 'hardware store', 'newsagent', 'post office', 'bank'
    ],

    // Objects for counting/measuring problems
    objects: [
        // Food
        'apples', 'oranges', 'bananas', 'grapes', 'strawberries', 'pears', 'lemons', 'mangoes', 'peaches', 'cherries',
        'carrots', 'potatoes', 'tomatoes', 'onions', 'peppers', 'cucumbers', 'cabbages', 'lettuces', 'beans', 'peas',
        'cakes', 'biscuits', 'cookies', 'muffins', 'cupcakes', 'doughnuts', 'pastries', 'pies', 'tarts', 'brownies',
        'sandwiches', 'pizzas', 'burgers', 'hot dogs', 'sausages', 'chips', 'crisps', 'sweets', 'chocolates', 'lollipops',
        // Stationery
        'pencils', 'pens', 'crayons', 'markers', 'rulers', 'rubbers', 'sharpeners', 'notebooks', 'folders', 'scissors',
        'paper clips', 'drawing pins', 'sticky notes', 'envelopes', 'stamps', 'stickers', 'books', 'magazines', 'newspapers', 'comics',
        // Toys
        'marbles', 'balls', 'dolls', 'cars', 'trains', 'blocks', 'puzzles', 'games', 'cards', 'dice',
        'balloons', 'kites', 'yo-yos', 'frisbees', 'skipping ropes', 'hula hoops', 'teddy bears', 'action figures', 'robots', 'drums',
        // Nature
        'flowers', 'leaves', 'seeds', 'stones', 'shells', 'feathers', 'twigs', 'pine cones', 'acorns', 'conkers',
        'butterflies', 'ladybirds', 'bees', 'ants', 'snails', 'worms', 'birds', 'rabbits', 'squirrels', 'ducks',
        // Clothing
        'socks', 'shoes', 'hats', 'gloves', 'scarves', 'buttons', 'beads', 'ribbons', 'badges', 'coins'
    ],

    // Activities for word problems
    activities: [
        'reading', 'writing', 'drawing', 'painting', 'colouring', 'cutting', 'sticking', 'building', 'making', 'creating',
        'running', 'walking', 'jumping', 'hopping', 'skipping', 'climbing', 'swimming', 'cycling', 'skating', 'skiing',
        'playing', 'singing', 'dancing', 'acting', 'practising', 'learning', 'studying', 'revising', 'testing', 'checking',
        'cooking', 'baking', 'eating', 'drinking', 'shopping', 'buying', 'selling', 'counting', 'measuring', 'weighing',
        'planting', 'growing', 'watering', 'picking', 'collecting', 'sorting', 'arranging', 'organising', 'tidying', 'cleaning',
        'travelling', 'driving', 'flying', 'sailing', 'hiking', 'camping', 'exploring', 'discovering', 'visiting', 'touring'
    ],

    // Jobs/roles for context
    jobs: [
        'teacher', 'doctor', 'nurse', 'firefighter', 'police officer', 'chef', 'baker', 'farmer', 'gardener', 'builder',
        'plumber', 'electrician', 'mechanic', 'driver', 'pilot', 'captain', 'scientist', 'engineer', 'artist', 'musician',
        'writer', 'librarian', 'shopkeeper', 'waiter', 'receptionist', 'manager', 'director', 'coach', 'referee', 'athlete',
        'vet', 'dentist', 'optician', 'pharmacist', 'paramedic', 'lifeguard', 'zookeeper', 'park ranger', 'tour guide', 'photographer'
    ],

    // Sports
    sports: [
        'football', 'rugby', 'cricket', 'tennis', 'basketball', 'netball', 'hockey', 'athletics', 'swimming', 'cycling',
        'gymnastics', 'martial arts', 'boxing', 'wrestling', 'golf', 'badminton', 'table tennis', 'volleyball', 'handball', 'skiing'
    ],

    // Vehicles
    vehicles: [
        'car', 'bus', 'lorry', 'van', 'truck', 'taxi', 'ambulance', 'fire engine', 'police car', 'motorbike',
        'bicycle', 'scooter', 'train', 'tram', 'underground', 'plane', 'helicopter', 'boat', 'ship', 'ferry'
    ],

    // Animals
    animals: [
        'dog', 'cat', 'rabbit', 'hamster', 'guinea pig', 'goldfish', 'parrot', 'budgie', 'tortoise', 'snake',
        'horse', 'pony', 'donkey', 'cow', 'sheep', 'pig', 'goat', 'chicken', 'duck', 'goose',
        'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'kangaroo', 'penguin', 'polar bear', 'whale'
    ],

    // Colours
    colours: [
        'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white',
        'grey', 'gold', 'silver', 'turquoise', 'maroon', 'navy', 'cream', 'beige', 'lime', 'teal'
    ],

    // Helper methods
    random(category) {
        const items = this[category];
        if (!items) return '';
        return items[Math.floor(Math.random() * items.length)];
    },

    randomMultiple(category, count) {
        const items = this[category];
        if (!items) return [];
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
};

// Export for use in generators
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataContexts;
}
