//draft review before using 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

        // Hash the password with bcrypt
        bcrypt.hash(userData.password, 10)
            .then((hashedPassword) => {
                // Replace the user entered password with the hashed password
                let newUser = new User({
                    userName: userData.userName,
                    password: hashedPassword, // Store the hashed password
                    email: userData.email,
                    loginHistory: [],
                });

                // Save the new user to the database
                newUser.save()
                    .then(() => resolve())
                    .catch((err) => {
                        if (err.code === 11000) {
                            reject("User Name already taken");
                        } else {
                            reject(`There was an error creating the user: ${err}`);
                        }
                    });
            })
            .catch((err) => {
                console.log(err); // Log the error for debugging purposes
                reject("There was an error encrypting the password");
            });
    });
};

// Authenticate a user
const checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .then((user) => {
                if (!user) {
                    reject(`Unable to find user: ${userData.userName}`);
                    return;
                }

                // Compare the provided password with the hashed password stored in the database
                bcrypt.compare(userData.password, user.password)
                    .then((result) => {
                        if (result === false) {
                            reject(`Incorrect Password for user: ${userData.userName}`);
                            return;
                        }

                        // If passwords match, proceed to update login history
                        if (user.loginHistory.length === 8) {
                            user.loginHistory.pop(); // Remove the oldest entry to maintain 8 records
                        }

                        user.loginHistory.unshift({
                            dateTime: new Date().toString(),
                            userAgent: userData.userAgent,
                        });

                        // Update the user's login history in the database
                        User.updateOne(
                            { userName: user.userName },
                            { $set: { loginHistory: user.loginHistory } }
                        )
                            .then(() => resolve(user))
                            .catch((err) => reject(`There was an error updating the login history: ${err}`));
                    })
                    .catch((err) => {
                        console.log(err); // Log any errors for debugging
                        reject(`Error comparing passwords for user: ${userData.userName}`);
                    });
            })
            .catch(() => {
                reject(`Unable to find user: ${userData.userName}`);
            });
    });
};



module.exports = { initialize, registerUser, checkUser };