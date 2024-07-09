const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

// tempalte engine settings
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
app.use(expressLayouts);
app.use(express.static('public'));
app.use("/uploads",express.static(path.join(__dirname,'/src/uploads')));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './src/views'));


//db connection
require('./src/config/database');
const MongoDBStore = require('connect-mongodb-session')(session);

const sessionStore = new MongoDBStore({
  uri: process.env.MONGODB_CONNECTION_STRING,
  collection: 'mySessions'
});


//routers
const authRouter = require('./src/routers/auth_router');
const managementRouter = require('./src/routers/management_router');

//session and flash-messages
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    },
    store: sessionStore
}));

app.use(flash());


app.use((req,res,next) => {
    res.locals.validation_error = req.flash('validation_error');
    res.locals.email = req.flash('email');
    res.locals.firstName = req.flash('firstName');
    res.locals.lastName = req.flash('lastName');
    res.locals.password = req.flash('password');
    res.locals.rePassword = req.flash('rePassword');
    res.locals.success_message = req.flash('success_message');

    res.locals.login_error = req.flash('error');
    next();
})

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended:true}));



app.get('/', (req, res) => {
    if(req.session.counter){
        req.session.counter++;
    }else{
        req.session.counter = 1;
    }
    res.json({
        message: 'Welcome ', counter: req.session.counter, kullanici: req.user
    })
});

app.use('/', authRouter);
app.use('/management', managementRouter);

app.listen(process.env.PORT, () => {
    console.log(`server worked on ${process.env.PORT}`);
});