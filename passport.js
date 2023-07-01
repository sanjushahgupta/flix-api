const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userModel = require('./models/users.js');
const passportJWT = require('passport-jwt');

let Users = userModel.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'userName',
            passwordField: 'password',
        },
        (userName, password, callback) => {
            console.log('going to find users')
            Users.findOne({ userName: userName })
                .then((user) => {
                    if (!user) {
                        console.log('user not found');
                        return callback(null, false, { message: 'Incorrect username.' });
                    }

                    if (!user.validatePassword(password)) {
                        console.log('incorrect password');
                        return callback(null, false, { message: 'Incorrect password.' });
                    }
                    return callback(null, user);
                }).catch(error => {
                    return callback(error);
                });
        }
    )
);

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.MOVIE_JWT_SECRET,
        },
        (jwtPayload, callback) => {
            Users.findById(jwtPayload._id)
                .then((user) => {
                    return callback(null, user);
                })
                .catch((error) => {
                    return callback(error);
                });
        }
    )
);