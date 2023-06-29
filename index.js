const express = require("express"),
    mongoose = require("mongoose"),
    Models = require("./models.js"),
    bodyParser = require("body-parser"),
    uuid = require("uuid"),
    morgan = require("morgan"),
    fs = require("fs"),
    path = require("path"),
    accessLogStream = fs.createWriteStream(path.join("log.txt"), { flags: "a" }),
    app = express(),
    Movies = Models.Movie,
    Users = Models.User;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

mongoose.connect("mongodb://localhost:27017/db", { useNewUrlParser: true, useUnifiedTopology: true });

app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then(movies => {
            return res.status(201).json(movies);
        })
        .catch(err => {
            console.error(err);
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


app.post("/register", (req, res) => {
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
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birth: req.body.Birth
                    })
                        .then(user => {
                            res.status(201).json(_.pick(user, ['userName', 'Email', 'Birth']));
                        })
                        .catch(error => {
                            return res.status(500).send("Error: " + error);
                        });
                });
        })
        .catch(error => {
            return res.status(400).send("Sorry, unable to register. Please check your credentials.");
        });
});


app.put("/user/:userName", passport.authenticate('jwt', { session: false }), (req, res) => {
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
                            return res.status(200).json(_.pick(updatedUser, ['userName', 'Email', 'Birth']));
                        } else {
                            return res.status(400).send("Error: userName does not exist.");
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
                        res.status(201).json(_.pick(user, ['userName', 'Email', 'Birth']))
                    })
                    .catch(err => {
                        res.status(400).send("Error:" + err);
                    });
            } else {
                res.status(400).send("Error: Request movie was not found.");
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
                        return res.status(200).json(user)
                    }).catch(err => {
                        return res.status(500).send(err);
                    })
            } else {
                return res.status(500).send("Error: Request movie was not found.")
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
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.use(express.static("public"));
app.use(morgan("combined", { stream: accessLogStream }));
app.use((err, req, res, next) => {
    res.status(500).send("error" + err);
})

app.listen(8080, () => {
    console.log("App is listening on port 8080.");
}) 