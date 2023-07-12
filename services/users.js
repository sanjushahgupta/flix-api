const userModels = require('../models/users.js')
const lodash = require('lodash');

module.exports.listOfAllUsers = async () => {
    const listOfUsers = await userModels.User.find();
    if (listOfUsers) {
        return listOfUsers;
    }
    return new Error("Error: Sorry, users not found.");
}

module.exports.registerUser = async (userTocreate) => {
    try {
        let hashedPassword = userModels.User.hashPassword(userTocreate.password);
        const userWithMatchingUserName = await userModels.User.findOne({ userName: userTocreate.userName });
        if (userWithMatchingUserName) {
            throw new Error('Username already exists');
        }

        const userWithMatchingEmail = await userModels.User.findOne({ Email: userTocreate.email })
        if (userWithMatchingEmail) {
            throw new Error('Email already exists');
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
        } else {
            throw new Error('Unable to create account.')
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports.updateUser = async (newData, oldUserName, oldEmail) => {
    try {
        const userWithMatchingUserName = await userModels.User.findOne({ userName: newData.userName });
        if (userWithMatchingUserName) {
            if (userWithMatchingUserName.userName !== oldUserName) {
                throw new Error("Username must be unique.");
            }
            const userWithMatchingEmail = await userModels.User.findOne({ Email: newData.email });
            if (userWithMatchingEmail !== null)
                if (userWithMatchingEmail.Email !== oldEmail) {
                    throw new Error("Email must be unique.");
                }
        }
        const oldUser = await userModels.User.findOne({ userName: oldUserName });
        if (!oldUser) {
            throw new Error(oldUserName + ' does not exist');
        }


        const updatedDBUser = await userModels.User.findOneAndUpdate(
            { userName: oldUserName },
            {
                $set: {
                    userName: newData.userName,
                    Password: userModels.User.hashPassword(newData.password),
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
        } else {
            return new Error('Unable to update user.');
        }
    }
    catch (error) {
        throw new Error(error.message);
    }
}


module.exports.deleteUser = async (userName) => {
    const matchedUser = await userModels.User.findOneAndRemove({ userName: userName });
    if (matchedUser) {
        return "Account deleted"
    }
    return new Error("User account not found.");
}


