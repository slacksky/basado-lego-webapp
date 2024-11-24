const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];
const themeLookup = themeData.reduce((lookup, theme) => {
    lookup[theme.id] = theme.name;
    return lookup;
}, {});

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