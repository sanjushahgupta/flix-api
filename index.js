const express = require("express"),
    mongoose = require("mongoose"),
    Models = require("./models.js"),
    bodyParser = require("body-parser"),
    uuid = require("uuid"),
    morgan = require("morgan"),
    cors = require('cors'),
    fs = require("fs"),
    path = require("path"),
    lodAsh = require('lodash'),
    accessLogStream = fs.createWriteStream(path.join("log.txt"), { flags: "a" }),
    { check, validationResult } = require('express-validator'),
    Movies = Models.Movie,
    Users = Models.User,
    app = express(),
    auth = require('./auth')(app),
    passport = require('passport');


app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./passport');

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('Welcome to movie app!');
});
app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then(movies => {
            return res.status(201).json(movies);
        })
        .catch(err => {
            return res.status(500).send("Error: " + err);
        });
});


app.get("/movies/:title", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({ "Title": req.params.title })
        .then(movie => {
            return res.status(201).json(movie);
        }).catch(err => {
            return res.status(500).send("Error: Sorry, the requested movie was not found.");
        })
});


app.get("/movies/genre/:name", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.name })
        .then(movie => {
            var genreDescription = movie.Genre.Description;
            return res.status(201).json(genreDescription);
        }).catch(err => {
            return res.status(500).send("Error: Sorry, the genre of requested movie was not found.");
        })
})


app.get("/movies/directors/:name", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.name }).
        then(movie => {
            var directorDetails = movie.Director
            return res.status(200).json(directorDetails);
        }).catch(err => {
            return res.status(500).send("Error: Sorry, the director's details of requested movie were not found.");
        })
})


app.post("/register", [
    check('userName', 'Username length should be more than 4,').isLength({ min: 5 }),
    check('userName', 'Non-alphanumeric characters is not allowed in username.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
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
});


app.put("/user/:userName", passport.authenticate('jwt', { session: false }),
    [check('userName', 'Username length should be more than 4').isLength({ min: 5 }),
    check('userName', 'Non-alphanumeric characters is not allowed in username.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()], (req, res) => {
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
    });


app.post("/addfab/:userName/:movieTitle", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.movieTitle })
        .then(movie => {
            if (movie) {
                const movieId = movie._id;
                Users.findOneAndUpdate(
                    { userName: req.params.userName },
                    { $addToSet: { favoriteMovies: movieId } },
                    { new: true }
                )
                    .then(user => {
                        res.status(201).json(lodAsh.pick(user, ['userName', 'favoriteMovies']))
                    })
                    .catch(err => {
                        res.status(400).send("Error:" + err);
                    });
            } else {
                res.status(400).send("Error: Requested movie was not found.");
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
});


app.delete("/deletefab/:userName/:movieTitle", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.movieTitle }).
        then(movie => {
            if (movie) {
                const movieId = movie._id
                Users.findOneAndUpdate({ userName: req.params.userName },
                    { $pull: { favoriteMovies: movieId } },
                    { new: true }).then(user => {
                        return res.status(200).json(lodAsh.pick(user, ['userName', 'favoriteMovies']))
                    }).catch(err => {
                        return res.status(500).send(err);
                    })
            } else {
                return res.status(500).send("Error: Requested movie was not found.")
            }
        }).catch(err => {
            return res.status(500).send("Error:" + err);
        })
})


app.delete("/deleteUser/:userName", passport.authenticate('jwt', { session: false }), (req, res) => {
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
});

app.use(express.static("public"));
app.use(morgan("combined", { stream: accessLogStream }));
app.use((err, req, res, next) => {
    res.status(500).send("error" + err);
})

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('App is listening in ' + port);
});