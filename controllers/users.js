require('../passport.js');


const express = require("express");
const userModels = require("../models/users.js");
const bodyParser = require("body-parser");
const cors = require('cors');
const lodAsh = require('lodash');
const { check, validationResult } = require('express-validator');
const Users = userModels.User;
const app = express();
const usersService = require('../services/users.js')

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

module.exports.registerUser = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }

    const userTocreate = {
        userName: req.body.UserName,
        email: req.body.Email,
        birth: req.body.Birth,
        password: req.body.Password
    }

    usersService.registerUser(userTocreate).then(result => {
        if (typeof result === Object && result.userName !== '') {
            return res.status(201).json(result);
        }

        return res.status(400).send(result);
    })
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


//


