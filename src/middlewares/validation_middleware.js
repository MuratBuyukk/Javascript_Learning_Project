const {body} = require('express-validator');

const validateNewUser = () =>{
    return [
        body('email').trim()
            .isEmail().withMessage('Please enter valid email.'),

        body('password').trim()
            .isLength({min:6}).withMessage('Password must be more or equal than 6 characters') 
            .isLength({max:20}).withMessage('Password must be less or equal than 20 characters'),

        body('firstName').trim()  
            .isLength({min:3}).withMessage('First name must be more or equal than 3 characters'),
            
        body('lastName').trim()  
            .isLength({min:2}).withMessage('Last name must be more or equal than 2 characters'),

        body('rePassword').trim()
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Password and Repassword is not same...');
            }
            return true;
        }) 
    ];
}

const validateNewPassword = () =>{
    return [
        body('password').trim()
            .isLength({min:6}).withMessage('Password must be more or equal than 6 characters') 
            .isLength({max:20}).withMessage('Password must be less or equal than 20 characters'),

        body('rePassword').trim()
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Password and Repassword is not same...');
            }
            return true;
        }) 
    ];
}

const validateLogin = () =>{
    return [
        body('email').trim()
            .isEmail().withMessage('Please enter valid email.'),

        body('password').trim()
            .isLength({min:6}).withMessage('Password must be more or equal than 6 characters') 
            .isLength({max:20}).withMessage('Password must be less or equal than 20 characters'),
    ];
}

const validateEmail = () => {
    return [
        body('email').trim()
            .isEmail().withMessage('Please enter valid email.')
    ];
}

module.exports = {
    validateNewUser,
    validateLogin,
    validateEmail,
    validateNewPassword
};