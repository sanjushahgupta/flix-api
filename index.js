const express = require('express'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    bodyparser = require('body-parser'),
    uuid = require('uuid'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    accessLogStream = fs.createWriteStream(path.join('log.txt'), { flags: 'a' });

const app = express(),
    Movies = Models.Movie,
    Users = Models.User;
mongoose.connect('mongodb://localhost:27017/db', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyparser.json());


app.get('/movies', (req, res) => {
    Movies.find()
        .then(movies => {
            res.status(201).json(movies);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/movies/:title', (req, res) => {
    Movies.find({ "Title": req.params.title }).
        then(movie => {
            res.status(201).json(movie);
        }).catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + 'Sorry, we cannot find such movie.');
        })
});


app.get('/movies/genre/:name', (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.name }).
        then(movie => {
            var genreDescription = movie.Genre.Description;
            res.status(201).json(genreDescription)
        }).catch(err => {
            res.status(500).send('Sorry, we cannot find such genre.');
        })
})


app.get('/movies/directors/:name', (req, res) => {
    Movies.findOne({ "Director.Name": req.params.name }).
        then(movie => {
            var directorDetails = movie.Director
            return res.status(200).json(directorDetails);
        }).catch(err => {
            return res.status(500).send('Sorry, we cannot find director details.');
        })
})


app.post('/register', (req, res) => {
    Users.findOne({ "userName": req.body.userName })
        .then(user => {
            if (user) {
                return res.status(400).send(req.body.userName + 'Username already exists. Username should be unique.');
            } else {
                Users.create({
                    userName: req.body.userName,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birth: req.body.Birth
                }).then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        }).catch(er => {
            return res.status(400).send("Sorry,Unable to register. Please check your credentials.")
        })
})

app.put('/user/:userName', (req, res) => {
    Users.findOneAndUpdate({ userName: req.params.userName },
        {
            $set: {
                userName: req.body.userName,
                Password: req.body.Password,
                Email: req.body.Email,
                Birth: req.body.Birth
            }
        }, { new: true }
    ).then(updatedUser => {
        if (updatedUser) {
            return res.status(200).json(updatedUser);
        } else {
            return res.status(400).send("Error: Username doesnot exists.");
        }

    }).catch(err => {
        return res.status(400).send("Error:" + err)
    })
})
app.post('/addfab/:userName/:movieTitle', (req, res) => {
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
                        res.status(200).json(user);
                    })
                    .catch(err => {
                        res.status(400).send(err);
                    });
            } else {
                res.status(400).send("Movie not found.");
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
});
app.delete('/deletefab/:userName/:movieTitle', (req, res) => {
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
                return res.status(500).send("Movie not found.")
            }
        }).catch(err => {
            return res.status(500).send(err);
        })
})

app.delete('/deleteUser/:userName', (req, res) => {
    Users.findOneAndRemove({ userName: req.params.userName })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.userName + ' was not found');
            } else {
                res.status(200).send(req.params.userName + ' :Account deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.use(express.static('public'));
app.use(morgan('combined', { stream: accessLogStream }));

app.use((err, req, res, next) => {
    res.status(500).send("error" + err);
})

app.listen(8080, () => {
    console.log('App is listening on port 8080.');
})






