const router = require('express').Router();
const authContoller = require('../controllers/auth_controller');
const validator = require('../middlewares/validation_middleware');
const authMiddleware = require('../middlewares/auth_middleware');


router.get('/login', authMiddleware.notLoggedIn, authContoller.showLoginForm);
router.post('/login', authMiddleware.notLoggedIn, validator.validateLogin(), authContoller.login);

router.get('/register', authMiddleware.notLoggedIn, authContoller.showRegisterForm);
router.post('/register', authMiddleware.notLoggedIn, validator.validateNewUser(), authContoller.register);

router.get('/forget_password', authMiddleware.notLoggedIn, authContoller.showForgetPasswordForm);
router.post('/forget_password', authMiddleware.notLoggedIn, validator.validateEmail(), authContoller.forgetPassword);

router.get('/verify', authContoller.verifyMail);

router.get('/reset_password/:id/:token', authContoller.showNewPasswordForm);
router.get('/reset_password', authContoller.showNewPasswordForm);
router.post('/reset_password', validator.validateNewPassword() , authContoller.createNewPassword);
router.get('/logout', authMiddleware.loggedIn, authContoller.logout);

module.exports = router;