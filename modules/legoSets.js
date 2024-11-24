require('dotenv').config();
const setData = require("../data/setData");
const themeData = require("../data/themeData");
const Sequelize = require('sequelize');

let sets = [];
const themeLookup = themeData.reduce((lookup, theme) => {
    lookup[theme.id] = theme.name;
    return lookup;
}, {});

/* start of sequelize config section*/

// Create Sequelize connection
let sequelize = new Sequelize(
    process.env.DB_DATABASE, // Database name
    process.env.DB_USER,     // Username
    process.env.DB_PASSWORD, // Password
    {
        host: process.env.DB_HOST, // Hostname
        dialect: 'postgres',       // Database dialect
        dialectOptions: {
            ssl: {
                require: true,      // Enforce SSL connection
                rejectUnauthorized: false // Accept self-signed certificates
            }
        },
        logging: false // Optional: Disable logging for cleaner output
    }
);

// Define the Theme model
const Theme = sequelize.define('Theme', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    }
}, {
    timestamps: false
});

// Define the Set model
const Set = sequelize.define('Set', {
    set_num: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    year: {
        type: Sequelize.INTEGER
    },
    num_parts: {
        type: Sequelize.INTEGER
    },
    theme_id: {
        type: Sequelize.INTEGER
    },
    img_url: {
        type: Sequelize.STRING
    }
}, {
    timestamps: false
});

// Define the association
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

/* end of the section*/

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            sets = [];
            setData.forEach(set => {
                sets.push({ ...set, theme: themeLookup[set.theme_id] || "Unknown" });
            });
            resolve();
        } catch (error) {
            reject(`Error initializing data: ${error.message}`);
        }
    });
}

function getAllSets() {
    return new Promise((resolve, reject) => {
        sets.length > 0 ? resolve(sets) : reject("No sets available.");
    });
}

function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        const foundSet = sets.find(set => set.set_num === setNum);
        foundSet ? resolve(foundSet) : reject(`Set ${setNum} not found.`);
    });
}

function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
        const regex = new RegExp(theme, 'i');
        const filteredSets = sets.filter(set => regex.test(set.theme));
        filteredSets.length > 0 ? resolve(filteredSets) : reject(`No sets found for theme: ${theme}`);
    });
}

module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme
};


sequelize
    .sync()
    .then(async () => {
        try {
            await Theme.bulkCreate(themeData); // Insert themes
            await Set.bulkCreate(setData); // Insert sets
            console.log("-----");
            console.log("data inserted successfully");
        } catch (err) {
            console.log("-----");
            console.log(err.message);
        }
        process.exit();
    })
    .catch((err) => {
        console.log('Unable to connect to the database:', err);
    });


// Test block for the functions
// initialize()
//     .then(() => {
//         return getAllSets();
//     })
//     .then((allSets) => {
//         console.log("All sets:", allSets);
//         return getSetByNum("001-1");
//     })
//     .then((set) => {
//         console.log("Set found by number:", set);
//         return getSetsByTheme("Technic");
//     })
//     .then((setsByTheme) => {
//         console.log("Sets found by theme 'Technic':", setsByTheme);
//     })
//     .catch((err) => {
//         console.error(err);
//     });