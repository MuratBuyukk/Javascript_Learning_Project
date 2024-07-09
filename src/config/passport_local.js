const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/user_model');
const bcrypt = require('bcrypt');

module.exports = function (passport) {
    const options = {
        usernameField: 'email',
        passwordField: 'password'
    }
    passport.use(new LocalStrategy(options, async (email, password, done) => {
        try {
            const _user = await User.findOne({ email })
            if (!_user) {
                return done(null, false, { message: 'User not found..!' });
            }

            const passwordControll = await bcrypt.compare(password, _user.password);
            if(!passwordControll){
                return done(null, false, { message: 'Invalid email or password' });
            }else{
                if (_user && _user.isEmailActive == false) {
                    return done(null, false, { message: 'Please activate your account..!' });
                }
                else return done(null, _user);
            }

            
           

        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id)
            .then(user => {
                if (!user) {
                    return done(null, false);
                }
                const newUser = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePicture: user.profilePicture
                };
                done(null, newUser);
            })
            .catch(err => {
                done(err, null);
            });
    });
}