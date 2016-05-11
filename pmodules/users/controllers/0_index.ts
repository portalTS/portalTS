import passport = require('passport');
import expressSession = require('express-session');
var RedisStore = require('connect-redis')(expressSession);
import LocalStrategy = require('passport-local');
import flash = require('connect-flash');

import express = require('express');
var router = express.Router();

import user = require('../models/user');
import userLib = require('../libs/users');
import group = require('../models/group');

var jsonfile = require('jsonfile');
import util = require('util');

import ppackage = require('../../../core/ppackage');

import usersAPI = require('../usersAPI');


var app:express.Express;

var jwt = require('jsonwebtoken');

passport.serializeUser((user:user.User, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    user.repository.findById(id, (err, _user:user.User) => {
        done(err, _user);
    });
});



var loginStrategy = new LocalStrategy.Strategy({
    passReqToCallback : true
}, (req, username, password, done) => {
    userLib.login(username, password, (err, _user) => {
        if (err) {
            if (err=='token') {
                return done(null, false, req.flash('message', 'Please check your emails to complete the registration.'));
            }
            return done(err);
        }
        if (!_user) return done(null, false, req.flash('message', 'Wrong username or password.'));
        return done(null, _user);
    });
});
passport.use('login', loginStrategy);

var sigupStrategy = new LocalStrategy.Strategy({
    passReqToCallback : true
}, (req, username, password, done) => {

    if (req.user) {
        return done('error');
    }

    if (!username || !password) {
        return done(null, false, req.flash('message', 'Please enter username and password'));
    }

    usersAPI.getUserLevelStandard((err, stdLevel) => {
        var u = {
            username: username,
            password: password,
            role: stdLevel.val
        };
        userLib.registration(u, (err, user) => {
            if (err) {
                if (err=='mail') {
                    return done(null, false, req.flash('message','Username must be a valid email address'));
                }
                if (err=='token') {
                    return done(null, false, req.flash('message', 'Please check your emails to complete the registration.'));
                }
                return done(err);
            }
            if (!user) return done(null, false, req.flash('message','User already exists.'));
            return done(null, user);
        });
    });

});
passport.use('signup', sigupStrategy);



function jwtAuthenticated(req, res, next) {
    var token = req.get('oauth');
    if (!token) return next();
    jwt.verify(token, usersAPI.getJWTSecret(), function(err, decoded) {
        if (err || !decoded || !decoded._id) return next();
        user.repository.findById(decoded._id, (err, u) => {
            if (err || !u) return next();
            req.user = u;
            next();
        });
    });
}


router.post('/login', passport.authenticate('login', {
    successRedirect: '/users/successLogin',
    failureRedirect: '/users/failureLogin',
    failureFlash : true
}));


router.post('/ws/login', usersAPI.mustNotLogged, (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    if (!username && !password) {
        return res.send('error');
    }
    userLib.login(username, password, (err, u)=> {
        if (err || !u) {
            return res.send('failed');
        }
        var token = jwt.sign({ _id: u._id }, usersAPI.getJWTSecret());
        res.send({token:token});
    });
});


router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/users/successSignup',
    failureRedirect: '/users/failureSignup',
    failureFlash : true
}));

router.get('/successLogin', (req:express.Request, res:express.Response) => {
    res.redirect(usersAPI.getLoginSuccessRedirect());
});

router.get('/failureLogin', (req:express.Request, res:express.Response) => {
    var string = encodeURIComponent(req.flash('message'));
    res.redirect(usersAPI.getLoginFailureRedirect()+'?message='+string);
});

router.get('/successSignup', (req:express.Request, res:express.Response) => {
    res.redirect(usersAPI.getSignupSuccessRedirect());
});

router.get('/failureSignup', (req:express.Request, res:express.Response) => {
    var string = encodeURIComponent(req.flash('message'));
    res.redirect(usersAPI.getSignupFailureRedirect()+'?message='+string);
});

router.get('/login', (req, res) => {
   res.render('login', {title: 'Login', message: req.flash('message')});
});

router.get('/signup', (req, res) => {
    res.render('signup', {title: 'Sigup', message: req.flash('message') });
});

router.get('/signout', (req, res) => {
  req.logout();
  res.redirect('/');
});


router.post('/forgotPassword', usersAPI.mustNotLogged, (req, res) => {
    var msg = '';
    if (!req.body.username) {
        msg = 'Please enter the username';
        return res.redirect(usersAPI.getForgotPasswordRedirect()+'?message='+msg);
    }
    userLib.generateNewPassword(req.body.username, (msg) => {
        return res.redirect(usersAPI.getForgotPasswordRedirect()+'?message='+msg);
    });
});


router.post('/changePassword', usersAPI.isAuth, (req, res) => {
    var msg;
    if (!req.body.password || !req.body.newPassword) {
        msg = 'Please enter the current password and a new one.';
        return res.redirect(usersAPI.getChangePasswordRedirect()+'?message='+msg);
    }
    var user = req.user;
    if (!userLib.isValidPassword(user, req.body.password)) {
        msg = 'The password is not correct.';
        return res.redirect(usersAPI.getChangePasswordRedirect()+'?message='+msg);
    }
    user.password = userLib.createHash(req.body.newPassword);
    user.save();
    msg = 'The password has been updated.';
    return res.redirect(usersAPI.getChangePasswordRedirect()+'?message='+msg);
})


router.get('/me', usersAPI.isAuth, (req, res) => {
    userLib.getGroups(req.user, (err, myGroups:group.Group[]) => {
        var toSend = {
            _id: req.user._id,
            username: req.user.username,
            groups: []
        };
        for (var i = 0; i<myGroups.length; i++) {
            toSend.groups.push({
                _id: myGroups[i]._id,
                name: myGroups[i].name
            });
        }
        res.send(toSend);
    });
});


router.get('/activation/:token', usersAPI.mustNotLogged, (req, res) => {
    user.repository.findOne({registrationToken:req.params.token}, (err:any, u:user.User) => {
        if (err || !u) {
            var string = encodeURIComponent('The url is not valid or expiried');
            return res.redirect(usersAPI.getLoginFailureRedirect()+'?message='+string);
        }
        u.registrationToken = '';
        u.save();
        var string = encodeURIComponent('Email activated. Please login');
        res.redirect(usersAPI.getLoginFailureRedirect()+'?message='+string);
        usersAPI.getConfig((err, config) => {
            if (config.sendConfirmationMail)
                userLib.sendConfirmationMail(u, (err)=>{});
        });
    })
});

export class UsersModule implements ppackage.Package {
    isRoot(): boolean {
        return false;
    }

    init(_app:express.Express):void {
        app = _app;
        var options = {};
        app.use(expressSession({
            secret: 'P0rTalTSisAgreatToolForFastDev12309asdjcsdioASSHOLE',
            resave: true,
            saveUninitialized: true,
            store: new RedisStore(options),
        }));
        app.use(flash());
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(jwtAuthenticated);

    }

    hasRouter(): boolean {
        return true;
    }

    getRouter(): express.Router {
        return router;
    }
}
