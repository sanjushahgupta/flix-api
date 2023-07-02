const userModels = require('../models/users.js')
const lodash = require('lodash');

module.exports.registerUser = async (userTocreate) => {
    let hashedPassword = userModels.User.hashPassword(userTocreate.password);
    const userWithMatchingUserName = await userModels.User.findOne({ userName: userTocreate.userName });
    if (userWithMatchingUserName) {
        return 'userName already exists';
    }

    const userWithMatchingEmail = await userModels.User.findOne({ Email: userTocreate.email })
    if (userWithMatchingEmail) {
        return 'email  already exists';
    }

    const newlyCreatedDBUser = await userModels.User.create({
        userName: userTocreate.userName,
        Email: userTocreate.email,
        Birth: userTocreate.birth,
        Password: hashedPassword
    });

    if (newlyCreatedDBUser) {
        //to make lowercase eg:email in all application-> in db  :EMail
        return {
            userName: newlyCreatedDBUser.userName,
            email: newlyCreatedDBUser.Email,
            birth: newlyCreatedDBUser.Birth,
        }
    }
    return new Error('Unable to create account.')
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

    const updatedDBUser = await userModels.User.findOneAndUpdate(
        { userName: oldUserName },
        {
            $set: {
                userName: newData.userName,
                Password: newData.password,
                Email: newData.email,
                Birth: newData.birth
            }
        },
        { new: true },
    );
    if (updatedDBUser) {
        return {
            userName: updatedDBUser.userName,
            email: updatedDBUser.Email,
            birth: updatedDBUser.Birth
        }
    }

    return new Error('Unable to update user.');
}


module.exports.deleteUser = async (userName) => {
    const matchedUser = await userModels.User.findOneAndRemove({ userName: userName });
    if (matchedUser) {
        return "Account deleted"
    }
    return new Error("User account not found.");
}


