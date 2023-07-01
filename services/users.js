const userModels = require('../models/users.js')
const lodash = require('lodash');

module.exports.registerUser = async (userTocreate) => {
    let hashedPassword = userModels.User.hashPassword(userTocreate.password);
    userTocreate.password = hashedPassword

    const userWithMatchingUserName = await userModels.User.findOne({ userName: userTocreate.userName });
    if (userWithMatchingUserName) {
        return 'userName already exists';
    }

    const userWithMatchingEmail = await userModels.User.findOne({ Email: userTocreate.email })
    if (userWithMatchingEmail) {
        return 'email  already exists';
    }

    const newlyCreatedUser = await userModels.User.create({
        userName: userTocreate.userName,
        Email: userTocreate.email,
        Birth: userTocreate.birth,
        Password: userTocreate.password
    });
    if (newlyCreatedUser) {
        return lodash.pick(newlyCreatedUser, ['userName', 'Email', 'Birth', '_id']);
    }

    return error
}

module.exports.updateUser = async (newData, oldUserName) => {
    const userWithMatchingUserName = await userModels.User.findOne({ userName: newData.userName });
    if (userWithMatchingUserName) {
        return userWithMatchingUserName.userName + ' already exists';
    }

    const oldUser = await userModels.User.findOne({ userName: oldUserName });
    if (!oldUser) {
        return oldUserName + ' does not exist';
    }

    const userWithMatchingEmail = await userModels.User.findOne({ Email: newData.email });
    if (userWithMatchingEmail) {
        return userWithMatchingEmail.Email + ' already exist';
    }

    const updatedUser = await userModels.User.findOneAndUpdate(
        { userName: oldUserName },
        {
            $set: {
                userName: newData.userName,
                Password: newData.password,
                Email: newData.email,
                Birth: newData.birth
            }
        },
        { new: true }
    );
    if (updatedUser) {
        return lodash.pick(updatedUser, ['userName', 'Email', 'Birth', '_id', 'favoriteMovies']);
    }

    return "Error" + error
}




