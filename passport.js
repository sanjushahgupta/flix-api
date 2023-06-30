const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'userName',
            passwordField: 'Password',
        },
        (userName, Password, callback) => {
            Users.findOne({ userName: userName })
                .then((user) => {
                    if (!user) {
                        return callback(null, false, { message: 'Invalid username or password.' });
                    }
                    return callback(null, user);
                })
                .catch((error) => {
                    console.log(error);
                    return callback(error);
                });
        }
    )
);

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'secret-key',
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