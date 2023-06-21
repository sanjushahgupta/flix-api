const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    accessLogStream = fs.createWriteStream(path.join('log.txt'), { flags: 'a' });

let moviesInfo = [
    { title: 'M3GAN', Cast: 'Violet McGraw' }, { title: 'House Party', Cast: 'HarrisonGilbertson' },
    { title: 'Acidman', Cast: 'Alex Lehmann' }, { title: 'Consecration', Cast: 'D.C. Young Fly' },
    { title: 'Your Place or Mine', Cast: 'Anthony DiBlasi' }, { title: 'Life Upside Down', Cast: 'Radha Mitchell' },
    { title: 'Baby Ruby', Cast: 'Noémie Merlant' }, { title: 'Somebody I Used to Know', Cast: 'Amy Sedaris' },
    { title: 'Champions', Cast: 'Woody Harrelson' }, { title: 'Fear', Cast: 'Ruby Modine' }
]

//return movieInfo as json object, method:Get, endpoint:'/movies' 
app.get('/movies', (req, res) => {
    res.json(moviesInfo);
})

//return text, method:Get, endpoint:'/' 
app.get('/', (req, res) => {
    res.send('Subscribe to this application to get new updates.');
})

//routes all requests for static files to their corresponding files.
app.use(express.static('public'));

//log all request using morgan
app.use(morgan('combined', { stream: accessLogStream }));

//error handle-middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong");
})

app.listen(8080, () => {
    console.log('App is listening on port 8080.');
})






