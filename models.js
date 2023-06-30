const mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

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
    Email: { type: String, required: true },
    Birth: String,
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.Password);
};

//create models
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);


//export models to use by different files
module.exports.Movie = Movie;
module.exports.User = User;