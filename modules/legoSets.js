require('dotenv').config();
// const setData = require("../data/setData");
// const themeData = require("../data/themeData");
const Sequelize = require('sequelize');

//tentative removal 
 let sets = [];
// const themeLookup = themeData.reduce((lookup, theme) => {
//     lookup[theme.id] = theme.name;
//     return lookup;
// }, {});

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
        sequelize
            .sync()
            .then(() => resolve())
            .catch((err) => reject(`Unable to sync database: ${err.message}`));
    });
}

// function getAllSets() {
//     return new Promise((resolve, reject) => {
//         Set.findAll({ include: [Theme] }) // Fetch all sets with theme data
//         .then((sets) => resolve(sets))
//         .catch((err) => reject(`Unable to find requested sets Error fetching: ${err.message}`));
//     });
// }
// function getAllSets() {
//     return new Promise((resolve, reject) => {
//         Set.findAll({ include: [Theme] }) // Fetch all sets with theme data
//         .then((sets) => {
//             console.log(JSON.stringify(sets, null, 2)); // Log the fetched sets
//             resolve(sets);
//         })
//         .catch((err) => reject(`Unable to find requested sets. Error fetching: ${err.message}`));
//     });
// }

function getAllSets() {
    return Set.findAll({ include: [Theme] })
        .then((sets) => {
            if (sets.length === 0) throw new Error("No sets found.");
            return sets;
        })
        .catch((err) => {
            throw new Error(`Error: ${err.message}`);
        });
}




function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        Set.findOne({ 
            where: { set_num: setNum }, // Filter by set_num
            include: [Theme] // Include theme data
        })
        .then((set) => {
            if (set) resolve(set);
            else reject(`Set ${setNum} not found.`);
        })
        .catch((err) => reject(`Unable to find requested set Error fetching: ${err.message}`));
    });
}

function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
        Set.findAll({
            include: [Theme], // Include theme data
            where: {
                '$Theme.name$': { // Access the Theme name
                    [Sequelize.Op.iLike]: `%${theme}%` // Case-insensitive match
                }
            }
        })
        .then((sets) => {
            if (sets.length > 0) resolve(sets);
            else reject(`No sets found for theme: ${theme}`);
        })
        .catch((err) => reject(`Unable to find requested sets Error fetching by theme: ${err.message}`));
    });
}
function createSet(setData) {
    return Set.create(setData)
        .then(createdSet => {
            console.log('New set created:', createdSet.toJSON());
            return createdSet;
        })
        .catch(err => {
            throw new Error(`Error creating set: ${err.message}`);
        });
}

function getAllThemes() {
    return Theme.findAll()
        .then(themes => {
            if (themes.length === 0) throw new Error('No themes found.');
            return themes;
        })
        .catch(err => {
            throw new Error(`Unable to fetch themes: ${err.message}`);
        });
}



module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    getAllThemes,
    createSet     
};



//removal of the bulk insert

// sequelize
//     .sync()
//     .then(async () => {
//         try {
//             await Theme.bulkCreate(themeData); // Insert themes
//             await Set.bulkCreate(setData); // Insert sets
//             console.log("-----");
//             console.log("data inserted successfully");
//         } catch (err) {
//             console.log("-----");
//             console.log(err.message);
//         }
//         process.exit();
//     })
//     .catch((err) => {
//         console.log('Unable to connect to the database:', err);
//     });


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