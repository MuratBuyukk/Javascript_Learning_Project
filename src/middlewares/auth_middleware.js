const loggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('error', ['Please login first']);
        res.redirect('/login');
    }
}

const notLoggedIn = function(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/management');
    }
}

module.exports = {
    loggedIn,
    notLoggedIn
}