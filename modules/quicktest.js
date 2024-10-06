const legoSets = require("./legoSets"); // Adjust path if needed

// Run initialization to populate sets array
legoSets.initialize();

// Test functions and display results (example)
console.log("All sets:", legoSets.getAllSets());

const setNumToFind = "010423-1"; 
//const setNumToFind = "001-1";

console.log(`Set ${setNumToFind}:`, legoSets.getSetByNum(setNumToFind));

const searchTheme = "Icons";
console.log(`Sets by theme "${searchTheme}":`, legoSets.getSetsByTheme(searchTheme)); 
