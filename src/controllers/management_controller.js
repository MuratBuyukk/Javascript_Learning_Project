
const User = require('../model/user_model');

const showMainPage =  (req, res, next) =>{
    res.render('index', {layout: './layout/management_layout.ejs', title:'Main Page'});
};

const showProfilePage = (req, res, next) => {
    res.render('profile', {user: req.user ,layout: './layout/management_layout.ejs', title:'Profile'});
}

const profileUpdate = async (req, res, next) => {
    const updatableFields = {
        firstName: req.body.firstName,
        lastName: req.body.lastName
    }
    try{
        if(req.file){
            updatableFields.profilePicture = req.file.filename;
        }

        const result = await User.findByIdAndUpdate(req.user.id, updatableFields);
        if(result){
            console.log('update complated..');
            res.redirect('/management/profile');
        }
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    showMainPage,
    showProfilePage,
    profileUpdate
}