const userModels = require('../models/users.js')
const lodash = require('lodash');

module.exports.registerUser = function (userTocreate) {
    let hashedPassword = userModels.User.hashPassword(userTocreate.password);
    userTocreate.password = hashedPassword

    return userModels.User.findOne({ userName: userTocreate.userName }).then(user => {
        if (user) {
            return user.userName + ' already exists';
        }

        return userModels.User.findOne({ Email: userTocreate.Email }).then(email => {
            if (email) {
                return email + ' already exists';
            }

            return userModels.User.create({
                userName: userTocreate.userName,
                Email: userTocreate.email,
                Birth: userTocreate.birth,
                Password: userTocreate.password
            }).then(user => {
                return lodash.pick(user, ['userName', 'Email', 'Birth']);
            }).catch(error => {
                return "Error: " + error;
            });
        });
    }).catch(error => {
        console.log('error caught')
        return "error: " + error;
    });
}