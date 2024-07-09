const { validationResult } = require('express-validator');
const User = require('../model/user_model');
const passport = require('passport');
require('../config/passport_local')(passport);
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');

const showLoginForm = (req, res, next) => {
    res.render('login', { layout: './layout/auth_layout.ejs', title:'Login' });
};

const login = (req, res, next) => {
    const errors = validationResult(req);
    req.flash('email', req.body.email);
    req.flash('password', req.body.password);
    if (!errors.isEmpty()) {
        req.flash('validation_error', errors.array());
        res.redirect('/login');
    } else {
        passport.authenticate('local', {
            successRedirect: '/management',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    }
};

const showRegisterForm = (req, res, next) => {
    res.render('register', { layout: './layout/auth_layout.ejs', title: 'Register' });
};

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('validation_error', errors.array());
        req.flash('email', req.body.email);
        req.flash('firstName', req.body.firstName);
        req.flash('lastName', req.body.lastName);
        req.flash('password', req.body.password);
        req.flash('rePassword', req.body.rePassword);
        res.redirect('/register');
    } else {
        try {
            const _user = await User.findOne({ email: req.body.email });

            if (_user && _user.isEmailActive == true) {
                req.flash('validation_error', [{ msg: "This email already in use..!" }])
                req.flash('email', req.body.email);
                req.flash('firstName', req.body.firstName);
                req.flash('lastName', req.body.lastName);
                req.flash('password', req.body.password);
                req.flash('rePassword', req.body.rePassword);
                res.redirect('/register');
            } else if ((_user && _user.isEmailActive == false) || _user == null) {
                if (_user) {
                    await User.findByIdAndDelete({ _id: _user._id });
                }
                const newUser = new User({
                    email: req.body.email,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    password: await bcrypt.hash(req.body.password, 8),
                });
                await newUser.save();
                console.log('user saved');


                //JWT OPERATİONS
                const jwtBilgileri = {
                    id: newUser.id,
                    mail: newUser.email
                };

                const jwtToken = jwt.sign(jwtBilgileri, process.env.CONFIRM_MAIL_JWT_SECRET, { expiresIn: '1d' });
                console.log(jwtToken);


                //MAIL OPERATIONS
                const url = process.env.WEB_SITE_URL + 'verify?id=' + jwtToken;
                console.log(`URL: ${url}`);

                let transporter = nodemailer.createTransport({
                    service: 'outlook',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASSWORD
                    }
                });

                await transporter.sendMail({
                    from: 'Nodejs APP <info@nodejs.com',
                    to: newUser.email,
                    subject: "Please activate your account",
                    text: "Please clich this link for activate your account:" + url
                }, (error, info) => {
                    if (error) {
                        console.log("Error occurred: " + error);
                    } else {
                        console.log('mail sended succesfully: ');
                        console.log(info);
                        transporter.close();
                    }
                });

                req.flash('success_message', [{ msg: "Please check your email..!" }]);
                res.redirect('/login');
            }
        } catch (err) {
            console.log(err)
        }
    }
};

const showForgetPasswordForm = (req, res, next) => {
    res.render('forget_password', { layout: './layout/auth_layout.ejs', title:'Forget Password' });
}
const forgetPassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('validation_error', errors.array());
        req.flash('email', req.body.email);
        res.redirect('/forget_password');
    } else {
        try {
            const _user = await User.findOne({ email: req.body.email, isEmailActive: true });
            if (_user) {
                const jwtInfo = {
                    id: _user.id,
                    mail: _user.mail
                }
                const secret = process.env.RESET_PASSWORD_SECRET + "-" + _user.password;
                const jwtToken = jwt.sign(jwtInfo, secret, { expiresIn: '1d' });
                console.log(jwtInfo);
                //MAIL OPERATIONS
                const url = process.env.WEB_SITE_URL + 'reset_password/' + _user.id + "/" + jwtToken;
                console.log(`URL: ${url}`);

                let transporter = nodemailer.createTransport({
                    service: 'outlook',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASSWORD
                    }
                });

                await transporter.sendMail({
                    from: 'Nodejs APP <info@nodejs.com',
                    to: _user.email,
                    subject: "PAssword reset",
                    text: "Please clich this link for reset your password:" + url
                }, (error, info) => {
                    if (error) {
                        console.log("Error occurred: " + error);
                    } else {
                        console.log('mail sended succesfully: ');
                        console.log(info);
                        transporter.close();
                    }
                });

                req.flash('success_message', [{ msg: "Please check your email..!" }]);
                res.redirect('/login');

            } else {
                req.flash('validation_error', [{ msg: 'User account not found...!' }]);
                req.flash('email', req.body.email);
                res.redirect('/forget_password');
            }

        } catch (error) {
            console.log('error occured: ' + error);
        }
    }
    //res.render('forget_password', {layout: './layout/auth_layout.ejs'});
}

const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((error) => {
            res.clearCookie('connect.sid');
            res.render('login', { layout: './layout/auth_layout.ejs', success_message: [{ msg: 'Logout complated successfully' }], title: 'Logout' });
        });
    });
}

const verifyMail = (req, res, next) => {
    const token = req.query.id;
    if (token) {
        try {
            jwt.verify(token, process.env.CONFIRM_MAIL_JWT_SECRET, async (e, decoded) => {
                if (e) {
                    req.flash('error', 'Token is outdated or failure');
                    res.redirect("/login");
                } else {
                    const tokenID = decoded.id;
                    const result = await User.findByIdAndUpdate(tokenID,
                        { isEmailActive: true });

                    if (result) {
                        req.flash("success_message", [{ msg: 'Email activated successfully' }]);
                        res.redirect('/login');
                    } else {
                        req.flash("error", "Please Re-Create User Again..!");
                        res.redirect('/login');
                    }
                }
            });
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log('Token is outdated or failure');
        res.redirect('/login');
    }
}

const showNewPasswordForm = async (req, res, next) => {
    const linkID = req.params.id;
    const linkToken = req.params.token;
    
    if (linkID && linkToken) {

        const _user = await User.findOne({ _id: linkID });

        const secret = process.env.RESET_PASSWORD_SECRET + "-" + _user.password;

        try {
            jwt.verify(linkToken, secret, async (e, decoded) => {
            
                if (e) {
                    req.flash('error', 'Token is outdated or failure..!');
                    res.redirect('/forget_password');
                } else {
                    

                    res.render('new_password', {id:linkID, token:linkToken, layout: './layout/auth_layout.ejs', title:'Update Password' });

                }
            });
        } catch (err) {
            
      }
      
      
    } else {
        req.flash('validation_error', [{msg : "Token not found..!, Please enter link on email"}]);
                res.redirect('/forget_password');
    }
}

const createNewPassword = async (req, res, next) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('validation_error', errors.array());
        req.flash('password', req.body.password);
        req.flash('rePassword', req.body.rePassword);

        console.log('form values:');
        console.log(req.body);

        res.redirect('/reset_password/' + req.body.id+ "/" + req.body.token);
    }else{

        const _user = await User.findOne({ _id: req.body.id, isEmailActive: true });

        const secret = process.env.RESET_PASSWORD_SECRET + "-" + _user.password;

        try {
            jwt.verify(req.body.token, secret, async (e, decoded) => {
            
                if (e) {
                    req.flash('error', 'Token is outdated or failure..!');
                    res.redirect('/forget_password');
                } else {
                    const hashedPassword = await bcrypt.hash(req.body.password, 8);
                    const result = await User.findByIdAndUpdate(req.body.id, {password: hashedPassword});
            
                    if(result){
                        req.flash("success_message", [ {msg: 'Password re-created successfully..!'}]);
                        res.redirect('/login');
                    } else{
                        req.flash("error", 'Failed..!, Try again later..!');
                        res.redirect('/login');
                    }
                }
            });
        } catch (err) {
            
      }

    }
}


module.exports = {
    showLoginForm,
    showRegisterForm,
    showForgetPasswordForm,
    register,
    login,
    forgetPassword,
    logout,
    verifyMail,
    showNewPasswordForm,
    createNewPassword
}
