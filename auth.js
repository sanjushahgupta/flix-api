const jwtSecret = 'secret-key',
    jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport');


let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.userName,
        expiresIn: '6d',
        algorithm: 'HS256'
    });
}

/* POST login. */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                console.log(error);
                return res.status(400).json({
                    message: 'Something is not right',
                    error: error
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
}