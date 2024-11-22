const { Set, Theme } = require("../models"); // Import your models
const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];
const themeLookup = themeData.reduce((lookup, theme) => {
    lookup[theme.id] = theme.name;
    return lookup;
}, {});

function initialize() {
    return new Promise((resolve, reject) => {
        sequelize
            .sync()  // Synchronizes models with the database (creates tables if not exist)
            .then(async () => {
                try {
                    // Insert themes first
                    await Theme.bulkCreate(themeData);
                    console.log("Themes data inserted successfully");

                    // Insert sets, making sure to associate each set with a theme_id
                    await Set.bulkCreate(setData);
                    console.log("Sets data inserted successfully");

                    resolve();  // Resolve when the data has been inserted
                } catch (error) {
                    reject(`Error initializing data: ${error.message}`);
                }
            })
            .catch((err) => {
                reject(`Error connecting to the database: ${err.message}`);
            });
    });
}

// Function to get all sets from the database
function getAllSets() {
    return Set.findAll({ include: Theme })  // Includes the associated Theme in the result
        .then(sets => sets)
        .catch(err => { throw new Error("No sets available.", err); });
}

// Function to get a set by its set_num
function getSetByNum(setNum) {
    return Set.findOne({ where: { set_num: setNum }, include: Theme })  // Get set by set_num, with associated Theme
        .then(set => set ? set : null)
        .catch(err => { throw new Error(`Set ${setNum} not found.`); });
}

// Function to get sets by theme
function getSetsByTheme(theme) {
    return Set.findAll({
        include: {
            model: Theme,
            where: { name: { [Sequelize.Op.iLike]: theme } }  // Match the theme name using a case-insensitive regex
        }
    })
        .then(sets => sets)
        .catch(err => { throw new Error(`No sets found for theme: ${theme}`); });
}

module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme
};
