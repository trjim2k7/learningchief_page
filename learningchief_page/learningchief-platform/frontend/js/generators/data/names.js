/**
 * LearningChief - Names Data Pool
 * 300+ diverse UK-appropriate names for word problems
 */

const DataNames = {
    // Common first names - mixed gender
    firstNames: [
        // A
        'Aaliyah', 'Aaron', 'Abigail', 'Adam', 'Aisha', 'Alex', 'Alexander', 'Alice', 'Amelia', 'Amy',
        'Andrew', 'Anna', 'Archie', 'Aria', 'Arthur', 'Ava', 'Ayesha',
        // B
        'Ben', 'Benjamin', 'Bella', 'Bethany', 'Billy', 'Bobby', 'Bradley', 'Brandon', 'Brooke',
        // C
        'Callum', 'Cameron', 'Chloe', 'Charlotte', 'Charlie', 'Chelsea', 'Connor', 'Courtney',
        // D
        'Daisy', 'Daniel', 'David', 'Dylan', 'Demi', 'Diana', 'Drew',
        // E
        'Edward', 'Ella', 'Ellie', 'Emily', 'Emma', 'Ethan', 'Eva', 'Evie', 'Erin',
        // F
        'Fatima', 'Finn', 'Fiona', 'Florence', 'Francesca', 'Frank', 'Freya',
        // G
        'Gabriel', 'Gemma', 'George', 'Georgia', 'Grace', 'Gracie',
        // H
        'Hannah', 'Harrison', 'Harry', 'Harvey', 'Hayley', 'Henry', 'Holly', 'Hugo',
        // I
        'Ibrahim', 'Imogen', 'Isaac', 'Isabella', 'Isla', 'Ivy',
        // J
        'Jack', 'Jacob', 'Jake', 'James', 'Jamie', 'Jasmine', 'Jason', 'Jennifer', 'Jessica', 'Joe', 'John', 'Joseph', 'Josh', 'Joshua', 'Julia',
        // K
        'Kai', 'Kate', 'Katie', 'Keira', 'Kevin', 'Kieran', 'Kyle',
        // L
        'Lauren', 'Leo', 'Leon', 'Lewis', 'Liam', 'Lily', 'Logan', 'Lola', 'Louis', 'Luca', 'Lucas', 'Lucy', 'Luke',
        // M
        'Maisie', 'Marcus', 'Maria', 'Mark', 'Mason', 'Matthew', 'Max', 'Maya', 'Megan', 'Mia', 'Michael', 'Millie', 'Mohammed', 'Molly',
        // N
        'Naomi', 'Nathan', 'Natasha', 'Niamh', 'Nicholas', 'Nicole', 'Noah', 'Noor',
        // O
        'Oliver', 'Olivia', 'Omar', 'Oscar', 'Owen',
        // P
        'Paige', 'Patrick', 'Paul', 'Phoebe', 'Poppy', 'Priya',
        // Q-R
        'Quinn', 'Rachel', 'Rebecca', 'Reece', 'Rhys', 'Riley', 'Robert', 'Rosie', 'Ruby', 'Ryan',
        // S
        'Sadie', 'Sam', 'Samantha', 'Samuel', 'Sara', 'Sarah', 'Scarlett', 'Sean', 'Sebastian', 'Sienna', 'Sofia', 'Sophie', 'Stanley', 'Summer',
        // T
        'Taylor', 'Thomas', 'Tia', 'Tilly', 'Tom', 'Tyler',
        // U-V
        'Uma', 'Victoria', 'Violet',
        // W
        'William', 'Willow',
        // X-Y-Z
        'Xavier', 'Yasmin', 'Zac', 'Zachary', 'Zara', 'Zoe',
        // Additional diverse names
        'Amir', 'Ananya', 'Chen', 'Chioma', 'Darius', 'Elena', 'Emeka', 'Fatou', 'Giovanni', 'Hiroshi',
        'Ines', 'Jada', 'Jamal', 'Kenji', 'Kwame', 'Layla', 'Leila', 'Malik', 'Mei', 'Miguel',
        'Nadia', 'Nia', 'Olumide', 'Pavel', 'Priya', 'Rahul', 'Rashid', 'Rosa', 'Sanjay', 'Sasha',
        'Tariq', 'Tomas', 'Yuki', 'Zainab', 'Zoya',
        // More common UK names
        'Alfie', 'Amelie', 'Blake', 'Brodie', 'Cara', 'Clara', 'Darcy', 'Darcey', 'Eddie', 'Elsie',
        'Felix', 'Flora', 'Fraser', 'Freddie', 'Harriet', 'Heidi', 'Hunter', 'Iris', 'Ivy', 'Jenson',
        'Jesse', 'Jude', 'Kit', 'Kitty', 'Lacey', 'Lexi', 'Mabel', 'Martha', 'Matilda', 'Nancy',
        'Ned', 'Nellie', 'Nico', 'Nina', 'Nora', 'Otto', 'Pearl', 'Penelope', 'Rafferty', 'Ralph',
        'Reuben', 'Rex', 'Roman', 'Rory', 'Rupert', 'Seth', 'Sonny', 'Spencer', 'Teddy', 'Thea',
        'Theodore', 'Tobias', 'Toby', 'Vincent', 'Walter', 'Wesley', 'Winston', 'Woody', 'Xander', 'Zak'
    ],

    // Get a random name
    random() {
        return this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    },

    // Get multiple unique random names
    randomMultiple(count) {
        const shuffled = [...this.firstNames].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    },

    // Get a name different from the given name
    randomDifferent(excludeName) {
        let name;
        do {
            name = this.random();
        } while (name === excludeName);
        return name;
    }
};

// Export for use in generators
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataNames;
}
