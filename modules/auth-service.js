//draft review before using 
const mongoose = require('mongoose');
require('dotenv').config();

const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
    userName: { type: String, unique: true }, // Usernames must be unique
    password: String, // Hashed password will be stored here
    email: String,
    loginHistory: [
        {
            dateTime: Date,
            userAgent: String,
        },
    ],
});

let User; // To be initialized during database connection

// Initialize the database connection
const initialize = () => {
    return new Promise((resolve, reject) => {
        const db = mongoose.createConnection(process.env.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        db.on('error', (err) => {
            reject(err);
        });

        db.once('open', () => {
            User = db.model('users', userSchema); // Bind schema to collection
            resolve();
        });
    });
};

// Register a new user
const registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        // Check if passwords match
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
            return;
        }

        let newUser = new User({
            userName: userData.userName,
            password: userData.password, // To be hashed in a future step
            email: userData.email,
            loginHistory: [],
        });

        newUser.save()
            .then(() => resolve())
            .catch((err) => {
                if (err.code === 11000) {
                    reject("User Name already taken");
                } else {
                    reject(`There was an error creating the user: ${err}`);
                }
            });
    });
};

// Authenticate a user
const checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })//check if it works or if find is needed
            .then((user) => {
                if (!user) {
                    reject(`Unable to find user: ${userData.userName}`);
                    return;
                }

                // Password validation (to be updated for hashing)
                if (user.password !== userData.password) {
                    reject(`Incorrect Password for user: ${userData.userName}`);
                    return;
                }

                // Update login history
                if (user.loginHistory.length === 8) {
                    user.loginHistory.pop(); // Remove the oldest entry
                }

                user.loginHistory.unshift({
                    dateTime: new Date().toString(),
                    userAgent: userData.userAgent,
                });

                User.updateOne(
                    { userName: user.userName },
                    { $set: { loginHistory: user.loginHistory } }
                )
                    .then(() => resolve(user))
                    .catch((err) => reject(`There was an error verifying the user: ${err}`));
            })
            .catch(() => {
                reject(`Unable to find user: ${userData.userName}`);
            });
    });
};

module.exports = { initialize, registerUser, checkUser };