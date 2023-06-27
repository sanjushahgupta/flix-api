const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: String,
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        Birth: Date,
    },
    Actor: String,
    Image: String,
    Featured: Boolean

});


let userSchema = mongoose.Schema({
    userName: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String },
    Birth: String,
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);
module.exports.Movie = Movie;
module.exports.User = User;