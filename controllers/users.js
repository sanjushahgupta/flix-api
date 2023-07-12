require('../passport.js');

const express = require("express");
const userModels = require("../models/users.js");
const bodyParser = require("body-parser");
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const app = express();
const usersService = require('../services/users.js')

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

module.exports.listOfUsers = function (req, res) {
    usersService.listOfAllUsers().then(result => {
        if (Array.isArray(result) && result.length > 0) {
            return res.status(201).json(result);
        }
        return res.status(400).send('Unable to fetch users.');
    }).catch(error => {
        return "Error:", error
    })
}
module.exports.registerUser = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }
    const userTocreate = {
        userName: req.body.userName,
        email: req.body.email,
        birth: req.body.birth,
        password: req.body.password
    }

    usersService.registerUser(userTocreate)
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(error => {
            return res.status(400).send(error.message);
        });
};


module.exports.updateUser = function (req, res) {
    const userToUpdate = {
        userName: req.body.userName,

        email: req.body.email,
        birth: req.body.birth,
    }

    const oldUserName = req.user.userName
    let errors = validationResult(userToUpdate);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }

    usersService.updateUser(userToUpdate, oldUserName).then(result => {
        if (result instanceof Error) {
            return res.status(400).send(result.message);
        }
        return res.status(200).json(result);
    }).catch(error => {
        return "Error:", error;
    })
};


module.exports.deleteUser = function (req, res) {
    let userName = req.user.userName
    usersService.deleteUser(userName).then(result => {
        if (result instanceof Error) {
            return res.status(400).send(result.message);
        }
        return res.status(200).send('Account deleted');
    }).catch(error => {
        return "Error:", error;
    })
}






