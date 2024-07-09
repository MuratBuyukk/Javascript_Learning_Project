const router = require('express').Router();
const managementContoller = require('../controllers/management_controller');
const authMiddleware = require('../middlewares/auth_middleware');
const multerConfig = require('../config/multer_config');

router.get('/', authMiddleware.loggedIn, managementContoller.showMainPage);

router.get('/profile', authMiddleware.loggedIn, managementContoller.showProfilePage);

router.post('/profile_update', authMiddleware.loggedIn, multerConfig.single('profilePicture'), managementContoller.profileUpdate);

module.exports = router;