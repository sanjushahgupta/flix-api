const express = require('express'),
    app = express(),
    bodyparser = require('body-parser'),
    uuid = require('uuid'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    accessLogStream = fs.createWriteStream(path.join('log.txt'), { flags: 'a' });

app.use(bodyparser.json());

let users = [{ id: 1, name: "Sanju", favoritesMovies: [] }, { id: 2, name: "Sanjufsd", favoritesMovies: [] }];
let moviesInfo = [
    { Id: "1", Title: "Titanic", Genre: { Name: "Comedy", description: "  entertaining, exciting" }, Director: { Name: "James Cameron", Birth: "1990" }, imageurl: "#" },
    { Id: "2", Title: "Friends", Genre: { Name: "Drama", description: "  entertaining, exciting" }, Director: { Name: "Jafar Panahi", Birth: "1970" }, imageurl: "#" },
    { Id: "3", Title: "Green Book", Genre: { Name: "Fantasy", description: " entertaining, exciting" }, Director: { Name: "Norman Panama", Birth: "1985" }, imageurl: "#" },
    { Id: "4", Title: "Bojo Horseman", Genre: { Name: "Action", description: " entertaining, exciting" }, Director: { Name: "Alan J. Pakula", Birth: "1995" }, imageurl: "#" },
    { Id: "5", Title: "BlackSea", Genre: { Name: "Horror", description: "entertaining, exciting" }, Director: { Name: "P.Padmarajan", Birth: "1955" }, imageurl: "#" }]



app.get('/movies', (req, res) => {
    res.json(moviesInfo);
})

app.get('/movies/:title', (req, res) => {

    const movie = moviesInfo.find(movie =>
        movie.Title === req.params.title
    );
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('Sorry, we cannot find such movie.');
    }
})

app.get('/movie/genre/:name', (req, res) => {
    const movieGenre = moviesInfo.find(movie =>
        movie.Genre.Name === req.params.name
    ).Genre;
    if (movieGenre) {
        res.status(200).json(movieGenre);
    } else {
        res.status(400).send('Sorry, we cannot find such movie.');
    }
})

app.get('/movies/directors/:name', (req, res) => {
    const directorDetails = moviesInfo.find(movie =>
        movie.Director.Name === req.params.name
    ).Director
    if (directorDetails) {
        return res.status(200).json(directorDetails);
    }
    return res.status(400).send('Sorry, we cannot find such movie.');
})

app.post('/register', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        return res.status(200).json(newUser)
    }
    return res.status(400).send("Check your credentials")
})


app.put('/user/:id', (req, res) => {
    const updateUser = req.body;
    const user = users.find(user => user.id == req.params.id);
    if (user) {
        user.name = updateUser.name;
        return res.status(200).send("Username has been updated.");
    }
    return res.status(400).send("Sorry, username can be updated. Try again")
})

app.post('/addfab/:userId/:movieTitle', (req, res) => {
    const userId = req.params.userId;
    const movieTitle = req.params.movieTitle;
    const user = users.find(user => user.id == userId);
    if (user) {
        user.favoritesMovies.push(movieTitle)
        return res.status(200).send("Movie is added to favourite list.")
    }
    return res.status(400).send("Sorry! Movie is not added to favourite list.")
})

app.delete('/deletefab/:userId/:movieTitle', (req, res) => {
    const userId = req.params.userId;
    const user = users.find(user => user.id == userId);
    if (user) {
        user.favoritesMovies = user.favoritesMovies.filter(movie => movie.Title !== req.params.movieTitle)
        return res.status(200).send("Movie is delete from favourite list.")
    }
    return res.status(400).send("Sorry! try again")
})

app.delete('/deleteUser/:id', (req, res) => {
    const userId = req.params.id;
    users = users.filter(user => user.id != userId);
    return res.status(200).send("Account deleted");
})

app.use(express.static('public'));
app.use(morgan('combined', { stream: accessLogStream }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong");
})

app.listen(8080, () => {
    console.log('App is listening on port 8080.');
})






