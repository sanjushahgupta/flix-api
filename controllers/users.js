const express = require("express"),
    userModels = require("../models/users.js"),
    bodyParser = require("body-parser"),
    cors = require('cors'),
    lodAsh = require('lodash'),
    { check, validationResult } = require('express-validator'),
    Users = userModels.User,
    app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('../config/passport.js');


module.exports.registerUser = function (req, res) {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ userName: req.body.userName })
        .then(user => {
            if (user) {
                return res.status(400).send(req.body.userName + ' already exists');
            }

            Users.findOne({ Email: req.body.Email })
                .then(email => {
                    if (email) {
                        return res.status(400).send(req.body.Email + ' already exists');
                    }

                    Users.create({
                        userName: req.body.userName,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birth: req.body.Birth
                    })
                        .then(user => {
                            res.status(201).json(lodAsh.pick(user, ['userName', 'Email', 'Birth']));
                        })
                        .catch(error => {
                            return res.status(500).send("Error: " + error);
                        });
                });
        })
        .catch(error => {
            return res.status(400).send("error: " + error);
        });
};


module.exports.updateUser = function (req, res) {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }
    Users.findOne({ userName: req.body.userName })
        .then(user => {
            if (user && user.userName !== req.params.userName) {
                return res.status(400).send(req.body.userName + ' already exists');
            }

            Users.findOne({ Email: req.body.Email })
                .then(email => {
                    if (email && email.Email !== req.body.Email) {
                        return res.status(400).send(req.body.Email + ' already exists');
                    }

                    Users.findOneAndUpdate(
                        { userName: req.params.userName },
                        {
                            $set: {
                                userName: req.body.userName,
                                Password: req.body.Password,
                                Email: req.body.Email,
                                Birth: req.body.Birth
                            }
                        },
                        { new: true }
                    ).then(updatedUser => {
                        if (updatedUser) {
                            return res.status(200).json(lodAsh.pick(updatedUser, ['userName', 'Email', 'Birth', 'favoriteMovies']));
                        } else {
                            return res.status(400).send("Error:Sorry, unable to update. Please check your credentials.");
                        }
                    }).catch(err => {
                        return res.status(400).send("Error: " + err);
                    });
                });
        })
        .catch(err => {
            return res.status(400).send("Error: " + err);
        });
};


module.exports.deleteUser = function (req, res) {
    Users.findOneAndRemove({ userName: req.params.userName })
        .then((user) => {
            if (!user) {
                res.status(400).send("Account was not found");
            } else {
                res.status(200).send("Requested account deleted.");
            }
        })
        .catch((err) => {
            res.status(500).send("Error: " + err);
        });
};