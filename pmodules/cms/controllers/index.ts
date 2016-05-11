import ppackage = require('../../../core/ppackage');
import express = require('express');
import persistenceAPI = require('../../api/persistenceAPI');
import document = require('../../api/models/document');
import users = require('../../users/libs/users');
import group = require('../../users/models/group');
import user = require('../../users/models/user');

var router = express.Router();
var app;

import usersAPI = require('../../users/usersAPI');
import cmsAPI = require('../cmsAPI');



router.get('/preview/header', (req:express.Request, res:express.Response) => {
    res.render('header', {title: 'Demo'});
});


export class CMSModule implements ppackage.Package {
    isRoot(): boolean {
        return false;
    }
    init(_app:express.Express):void {
        app = _app;

        app.use((req:express.Request, res:express.Response, next:Function) => {
            cmsAPI.generateMenu(req, (menus) => {
                (<any>req).menus = menus;
                next();
            });
        });


        usersAPI.setSignupFailureRedirect('/cms/signup');
        usersAPI.setSignupSuccessRedirect('/');
        usersAPI.setLoginFailureRedirect('/cms/login');
        usersAPI.setLoginSuccessRedirect('/');
        usersAPI.setForgotPasswordRedirect('/cms/forgotPassword');
        usersAPI.setChangePasswordRedirect('/cms/changePassword');

        router.get('/login', usersAPI.mustNotLogged, (req:express.Request, res:express.Response, next:Function) => {
            var message = req.query.message;
            cmsAPI.render(req, res, {title: 'Login', path:'cms_login', obj: {message: message}});
        });

        router.get('/signup', usersAPI.mustNotLogged, (req:express.Request, res:express.Response, next:Function) => {
            var message = req.query.message;
            cmsAPI.render(req, res, {title: 'Signup', path:'cms_signup', obj: {message: message}});
        });

        router.get('/forgotPassword', usersAPI.mustNotLogged, (req:express.Request, res:express.Response, next:Function) => {
            var message = req.query.message;
            cmsAPI.render(req, res, {title: 'Forgot Password', path:'cms_forgotPassword', obj: {message: message}});
        });

        router.get('/changePassword', usersAPI.isAuth, (req:express.Request, res:express.Response, next:Function) => {
            var message = req.query.message;
            cmsAPI.render(req, res, {title: 'Change Password', path:'cms_changePassword', obj: {message: message}});
        });

        router.get('/:val', (req:express.Request, res:express.Response, next:Function) => {
            persistenceAPI.searchDocuments('cms_pages', {url:req.params.val}, '', null, req.user, (err:any, docs?:document.Document[]):void => {
                if (err || !docs || docs.length==0) {
                    persistenceAPI.getDocument('cms_pages', req.params.val, req.user, (err:any, doc?:document.Document):void => {
                        if (err || !doc) {
                            next();
                            return;
                        }
                        cmsAPI.render(req, res, {html:doc._payload.body, title:doc._payload.title});
                    });
                    return;
                }
                cmsAPI.render(req, res, {html:docs[0]._payload.body, title:docs[0]._payload.title});
            });
        });
    }

    hasRouter(): boolean {
        return true;
    }

    getRouter(): express.Router {
        return router;
    }
}
