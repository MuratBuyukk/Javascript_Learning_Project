const multer = require('multer');
const path = require('path');

const myStorage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, path.join(__dirname,"../uploads/profile_pictures"));
    },
    filename: (req, file, cb) =>{
        cb(null, req.user.email + path.extname(file.originalname));
    }
});

const myFileFilter = (req, file, cb) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
        cb(null, true);
    }else{
        cb(null, false);
    }
} 

const uploadPicture = multer({storage : myStorage, fileFilter: myFileFilter});

module.exports = uploadPicture;