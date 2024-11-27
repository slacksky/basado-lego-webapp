require('dotenv').config();

const Sequelize = require('sequelize');

//set up sequelize to point to our postgres database
let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  }
});


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



  
const getSetByNum = (setNum) => {
    return Set.findOne({ 
        where: { set_num: setNum },
        include: [Theme], // Include the associated Theme model
    })
    .then((set) => {
        if (set) {
            return set;
        } else {
            throw new Error(`Set with number ${setNum} not found.`);
        }
    })
    .catch((err) => {
        throw new Error(err.message);
    });
};


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


function editSet(set_num, setData) {
    return Set.update(setData, {
        where: { set_num: set_num },
    })
        .then((updatedRows) => {
            if (updatedRows[0] === 0) {
                throw new Error(`Set with set_num ${set_num} not found.`);
            }
            return;
        })
        .catch((err) => {
            throw new Error(err.errors ? err.errors[0].message : err.message);
        });
}

function deleteSet(set_num) {
    return Set.destroy({
        where: { set_num: set_num },
    })
    .then((deletedRows) => {
        if (deletedRows === 0) {
            throw new Error(`Set with set_num ${set_num} not found.`);
        }
        return; // Successfully deleted
    })
    .catch((err) => {
        throw new Error(err.errors ? err.errors[0].message : err.message);
    });
}

module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    getAllThemes,
    createSet,
    editSet,
    deleteSet     
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