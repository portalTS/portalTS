/**
 * API for the users module.
 * @module usersAPI
 * @inner
 */

import express = require('express');
import user = require('./models/user');
import userLib = require('./libs/users');
import groupLib = require('./libs/groups');

import configurationsAPI = require('../configurations/configurationsAPI');

import loader = require('../../core/loader');

//name definition of the configuration object
const _USERS_CONFIG_ = "UsersModule";


/**
 * Helper object containing information about an user level.
 * @typedef {Object} userLevel
 * @property {string} name              the name of the level
 * @property {number} val               the value of the level
 */
 function hackForTheDocumentation() {}
 /**
  *
  */
export interface userLevel {
    name:string,
    val:number
}

var __config;
var loginFailureRedirect = '/users/login';
var loginSuccessRedirect;
var signupFailureRedirect = '/users/signup';
var signupSuccessRedirect;
var forgotPasswordRedirect;
var changePasswordRedirect;
var jwtSecret = 'luca_gabriele_88_jelly_dottie';


function initConfig(callback:(err, config)=>void) {
    var conf = {
        "usersLevels": [],
        "general": {
            "default_role": 0,
            "default_groups": [],
            "onlyMail": false,
            "activationTemplate": {
                "text": "Hello {{username}}!\n\nPlease complete the registration:\nhttp://localhost:8080{{uri}}",
                "html": "Hello {{username}}!<br>\n<br>\nPlease complete the registration:\n<a href=\"http://localhost:8080{{uri}}\">http://localhost:8080{{uri}}</a>",
                "sender": "PortalTS <noreply@portalts.it>",
                "subject": "PortalTS Registration"
            },
            "forgotTemplate": {
                "text": "Hello {{username}},\n\nthe new password is:\n{{password}}",
                "html": "Hello {{username}},\n\nthe new password is:\n{{password}}",
                "sender": "PortalTS <noreply@portalts.it>",
                "subject": "New password request"
            },
            "sendConfirmationMail": false,
            "confirmationTemplate": {
                "text": "Welcome!",
                "html": "Welcome!",
                "sender": "PortalTS <noreply@portalts.it>",
                "subject": "Welcome to PortalTS, {{username}}!"
            },
            "sendActivationMail": false
        }
    };
    conf.usersLevels.push({
        name: 'standard',
        val: 0
    });
    conf.usersLevels.push({
        name: 'admin',
        val: 1000
    });
    __config = conf;
    configurationsAPI.saveConfigruation(_USERS_CONFIG_, conf, (err) => {
        if (callback) callback(err, conf);
    });
}

function _getConfig(callback:(err, config)=>void) {
    configurationsAPI.getConfiguration(_USERS_CONFIG_, (err, config) => {
        if (err) return callback(err, null);
        if (!config) return initConfig(callback);
        __config = config;
        callback(err, config);
    });
}

setTimeout(()=>{
    _getConfig((err)=>{});
}, 1000);


/**
 * isAuth - middleware function that can be used on Express route. It verifies that the request
 * comes from a registered user.
 *
 * @param  {express.Request} req            standard express request
 * @param  {express.Response} res           standard express response
 * @param  {function} next                  standard next function
 * @return {void}
 */
export function isAuth(req: express.Request, res: express.Response, next) {
    if (req.isAuthenticated()) return next();
    if (req.user) return next();
    return res.redirect('/');
}


/**
 * isAdminSync - function to check if the role value is an admin or not.
 *
 * @param  {number} role    the role level
 * @return {boolean}        true if the user is an admin, false otherwise
 */
export function isAdminSync(role):boolean {
    if (!__config) return false;
    var levels:userLevel[] =  <userLevel[]> __config.usersLevels;
    var found = 0;
    for (var i = 1; i<levels.length; i++) {
        if (levels[i].val>levels[found].val) found = i;
    }
    if (role==levels[found].val) return true;
    return false;
}

/**
 * mustNotLogged - middleware function that can be used on Express route. It verify that the request
 * comes from a unregistered user.
 *
 * @param  {express.Request} req            standard express request
 * @param  {express.Response} res           standard express response
 * @param  {function} next                  standard next function
 * @return {void}
 */
export function mustNotLogged(req: express.Request, res: express.Response, next) {
    if (!req.isAuthenticated()) return next();
    if (!req.user) return next();
    res.redirect('/');
}

/**
 * isAdmin - middleware function that can be used on Express route. It verify that the request
 * comes from a registered user that is also an Administrator.
 *
 * @param  {express.Request} req            standard express request
 * @param  {express.Response} res           standard express response
 * @param  {function} next                  standard next function
 * @return {void}
 */
export function isAdmin(req: express.Request, res: express.Response, next) {
    getUserLevelAdmin((err, ul) => {
        if (err || !ul) return res.redirect('/');
        if (!req.user) return res.redirect('/');
        if (req.user.role == ul.val) return next();
        res.redirect('/');
    })
}



/**
 * @callback userLevelsCallback
 * @param {any} err
 * @param {userLevel[]} levels
 */

/**
 * getUserLevels - this method returns the user levels available
 *
 * @param  {levelsCallback} callback          standard callback function, returns error (if any) and an array of userLevel
 */
export function getUserLevels(callback:(err:any, levels:userLevel[])=>void) {
    _getConfig((err, config) => {
        if (err) return callback(err, null);
        return callback(null, config.usersLevels);
    });
}


/**
 * @callback userLevelCallback
 * @param {any} err
 * @param {userLevel} levels
 */

/**
 * getUserLevelStandard - obtain the standard user level
 *
 * @param  {userLevelCallback} callback         standard callback function, returns error (if any) and the standard userLevel
 */
export function getUserLevelStandard(callback:(err:any, ul:userLevel)=>void) {
    getUserLevels((err, levels:userLevel[]) => {
        if (err) return callback(err, null);
        if (!levels) return callback(null, null);
        var found = 0;
        for (var i = 1; i<levels.length; i++) {
            if (levels[i].val<levels[found].val) {
                found = i;
            }
        }
        return callback(null, levels[found]);
    });
}

/**
 * getUserLevelAdmin - obtain the administration user level
 *
 * @param  {userLevelCallback} callback         standard callback function, returns error (if any) and the standard userLevel
 */
export function getUserLevelAdmin(callback:(err:any, ul:userLevel)=>void) {
    getUserLevels((err, levels:userLevel[]) => {
        if (err) return callback(err, null);
        if (!levels) return callback(null, null);
        var found = 0;
        for (var i = 1; i<levels.length; i++) {
            if (levels[i].val>levels[found].val) {
                found = i;
            }
        }
        return callback(null, levels[found]);
    });
}


export function getConfig(callback:(err, config)=>void): void {
    _getConfig((err, c) => {
        if (err) return callback(err, null);
        callback(null, c.general);
    });
}

export function saveConfig(config, callback:(err)=>void): void {
    _getConfig((err, c) => {
        if (err) return callback(err);
        c.general = config;
        configurationsAPI.saveConfigruation(_USERS_CONFIG_, c, callback);
    });
}


/**
 * getLoginFailureRedirect - get the login failure redirect path
 *
 * @return {string}  the path
 */
export function getLoginFailureRedirect(): string {
    return loginFailureRedirect;
}

/**
 * setLoginFailureRedirect - set the login failure redirect path
 *
 * @param  {string} path      the new path
 * @return {void}
 */
export function setLoginFailureRedirect(path: string): void {
    loginFailureRedirect = path;
}


/**
 * getLoginSuccessRedirect - get the login success redirect path
 *
 * @return {string}  the path
 */
export function getLoginSuccessRedirect(): string {
    return loginSuccessRedirect;
}

/**
 * setLoginSuccessRedirect - set the login suceess redirect path
 *
 * @param  {string} path    the new path
 * @return {void}
 */
export function setLoginSuccessRedirect(path: string): void {
    loginSuccessRedirect = path;
}

/**
 * getSignupFailureRedirect - get the signup failure redirect path
 *
 * @return {string}  the path
 */
export function getSignupFailureRedirect(): string {
    return signupFailureRedirect;
}


/**
 * setSignupFailureRedirect - set the signup failure redirect path
 *
 * @param  {string} path    the new path
 * @return {void}
 */
export function setSignupFailureRedirect(path: string): void {
    signupFailureRedirect = path;
}

/**
 * getSignupSucessRedirect - get the signup success redirect path
 *
 * @return {string}  the path
 */
export function getSignupSuccessRedirect(): string {
    return signupSuccessRedirect;
}

/**
 * setSignupSuccessRedirect - set the signup success redirect path
 *
 * @param  {string} path    the new path
 * @return {void}
 */
export function setSignupSuccessRedirect(path: string): void {
    signupSuccessRedirect = path;
}

/**
 * getForgotPasswordRedirect - get the forgot password redirect path
 *
 * @return {string}  the path
 */
export function getForgotPasswordRedirect(): string {
    return forgotPasswordRedirect;
}

/**
 * setForgotPasswordRedirect - set the forgot password redirect path
 *
 * @param  {string} path    the new path
 * @return {void}
 */
export function setForgotPasswordRedirect(path: string): void {
    forgotPasswordRedirect = path;
}


/**
 * getChangePasswordRedirect - get the change password redirect path
 *
 * @return {string}  the path
 */
export function getChangePasswordRedirect(): string {
    return changePasswordRedirect;
}

/**
 * setChangePasswordRedirect - set the change password redirect path
 *
 * @param  {string} path    the new path
 * @return {void}
 */
export function setChangePasswordRedirect(path: string): void {
    changePasswordRedirect = path;
}


/**
 * getJWTSecret - get the JWT (JSON Web Token) secret
 *
 * @return {string}  the JWT secret
 */
export function getJWTSecret(): string {
    return jwtSecret;
}


/**
 * setJWTSecret - Set a new value for the JWT secret token
 *
 * @param  {string} secret      the JWT secret
 * @return {void}
 */
export function setJWTSecret(secret: string): void {
    jwtSecret = secret;
}



/**
 * getUserModel - returns the user model
 *
 * @return the user model interface
 */
export function getUserModel() {
    return user;
}



/**
 * getUserLib - returns the user library
 *
 * @return  the user library
 */
export function getUserLib() {
    return userLib;
}


/**
 * getGroupLib - returns the group library
 *
 * @return the group library
 */
export function getGroupLib() {
    return groupLib;
}
