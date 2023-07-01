require('../passport.js');

const express = require("express");
const userModels = require("../models/users.js");
const bodyParser = require("body-parser");
const cors = require('cors');
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
        userName: req.body.userName,
        email: req.body.email,
        birth: req.body.birth,
        password: req.body.password
    }

    usersService.registerUser(userTocreate).then(result => {
        if (typeof result === Object && result.userName !== '') {
            return res.status(201).json(result);
        }
        return res.status(400).send(result);
    })
};


module.exports.updateUser = function (req, res) {
    const userToUpdate = {
        userName: req.body.userName,
        password: req.body.password,
        email: req.body.email,
        birth: req.body.birth,
    }

    const oldUserName = req.params.userName
    let errors = validationResult(userToUpdate);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }
    usersService.updateUser(userToUpdate, oldUserName).then(result => {
        if (typeof result === Object && result.userName !== '') {
            return res.status(200).json(result);
        }
        return res.status(400).send(result);
    })
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





