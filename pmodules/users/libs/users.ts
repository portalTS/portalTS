import bCrypt = require('bcrypt');
import user = require('../models/user');
import group = require('../models/group');
import express = require('express');
import usersAPI = require('../usersAPI');
import mailerAPI = require('../../mailer/mailerAPI');
import logger = require('../../logger/loggerAPI');
var randomstring = require("randomstring");


/**
 * isValidPassword - verify that the password correspond to the encrypted password
 *
 * @param  {type} user: user.User the user data, containing also the encrypted password
 * @param  {type} password        the plaintext password to check
 * @return {type}                 true if match, false Otherwise
 */
export function isValidPassword(user: user.User, password): boolean {
    return bCrypt.compareSync(password, user.password);
};


/**
 * createHash - Generates hash using bCrypt
 *
 * @param  {type} password: string the textplain password
 * @return {type}                  the encrypted password generated with salt
 */

export function createHash(password: string): string {
    var salt = bCrypt.genSaltSync(10);
    return bCrypt.hashSync(password, salt);
};


/**
 * Simple interface utility for user registration
 */
export interface userToRegister {
    username: string,
    password: string,
    role: number
};



/**
 * validateEmail - test if the mail is a real email using regex
 *
 * @param  {type} email the email to check
 * @return {type}       true if it is an email address, false otherwise
 */
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


/**
 * replaceAll - utility function that replace all the occorrenct of a string
 *
 * @param  {type} target      the complete string
 * @param  {type} search      the string to search
 * @param  {type} replacement the replacement string
 * @return {type}             the new string
 */
function replaceAll(target, search, replacement) {
    if (!target || !search || !replacement) return target;
    return target.replace(new RegExp(search, 'g'), replacement);
}


/**
 * sendConfirmationMail - sends email confirmation to notify the user of a correct registration
 *
 * @param  {type} utente: user.User    the user that must receive the email
 * @param  {type} callback:            standard callback that returns error (if any)
 */
export function sendConfirmationMail(utente: user.User, callback: (err: any) => void) {
    //I need to compile the template!
    usersAPI.getConfig((err, config) => {

        if (err) return callback(err);

        var subject = replaceAll(config.confirmationTemplate.subject, '{{username}}', utente.username);
        var text = replaceAll(config.confirmationTemplate.text, '{{username}}', utente.username);
        var html = replaceAll(config.confirmationTemplate.html, '{{username}}', utente.username);

        var options: mailerAPI.mailOptions = {
            from: config.confirmationTemplate.sender, // sender address
            to: utente.username, // list of receivers
            subject: subject, // Subject line
            text: text, // plaintext body
            html: html // html body
        };

        mailerAPI.sendMail(options, (err, info) => {
            if (err) {
                logger.error("Error sending the confirmation email", err);
                callback(err);
                return;
            }
            callback(false);
        });
    });
}


/**
 * sendActivationMail - sends email confirmation to verify that the email is a
 * real used email
 *
 * @param  {type} utente: user.User    the user that must confirm the email
 * @param  {type} callback:            standard callback that returns error (if any)
 */
function sendActivationMail(utente: user.User, callback: (err: any) => void) {

    var uri = '/users/activation/' + utente.registrationToken;

    usersAPI.getConfig((err, config) => {

        //I need to compile the template!
        var subject = replaceAll(config.activationTemplate.subject, '{{username}}', utente.username);
        var text = replaceAll(config.activationTemplate.text, '{{username}}', utente.username);
        var html = replaceAll(config.activationTemplate.html, '{{username}}', utente.username);
        subject = replaceAll(subject, '{{uri}}', uri);
        text = replaceAll(text, '{{uri}}', uri);
        html = replaceAll(html, '{{uri}}', uri);

        var options: mailerAPI.mailOptions = {
            from: config.activationTemplate.sender, // sender address
            to: utente.username, // list of receivers
            subject: subject, // Subject line
            text: text, // plaintext body
            html: html // html body
        };


        mailerAPI.sendMail(options, (err, info) => {
            if (err) {
                logger.error("Error sending activation email", err);
                callback(err);
                return;
            }
            callback(false);
        });
    });
}


/**
 * registration - registration method utility
 *
 * @param  {type} userToRegister: userToRegister the user to register
 * @param  {type} callback: Function             description
 */
export function registration(userToRegister: userToRegister, callback: (err, u?)=>void) {
    usersAPI.getConfig((err, config) => {
        if (err) return callback(err);

        if (config.onlyMail) {
            if (!validateEmail(userToRegister.username)) {
                return callback('mail', false);
            }
        }

        user.repository.findOne({ 'username': userToRegister.username }, (err, myUser) => {
            // In case of any error return
            if (err) {
                logger.error('Error on user registration', err);
                return callback(err);
            }
            // already exists
            if (myUser) {
                logger.error('User already exists');
                return callback(null, false);
            } else {
                // if there is no user with that email
                // create the user
                var _newUser = {
                    // set the user's local credentials
                    username: userToRegister.username,
                    password: createHash(userToRegister.password),
                    role: config.default_role,
                    create_at: new Date()
                };
                if (userToRegister.role) _newUser.role = userToRegister.role;

                // save the user
                user.repository.create(_newUser, (err, newUser: user.User) => {
                    if (err) {
                        logger.error('Error in Saving user', err);
                        throw err;
                    }

                    config.default_groups.forEach((gid) => {
                        group.repository.findById(gid, (err, myGroup: group.Group) => {
                            if (err) {
                                logger.error("Error finding a group", err);
                            } else {
                                var groupMember = {
                                    _id: newUser._id,
                                    added_at: new Date(),
                                    until: null
                                };
                                myGroup.users.push(groupMember);
                                myGroup.save();
                            }
                        });
                    });

                    //If the activation email is disables, everythink is ok!
                    if (!config.sendActivationMail) {
                        if (config.sendConfirmationMail) {
                            sendConfirmationMail(newUser, (err) => { });
                        }
                        return callback(null, newUser);
                    }
                    //Otherwise, I need to generate a token, save it, send the activation
                    //email and return a 'failer' state, to ensure user to confirm using the email
                    var token = randomstring.generate(25);
                    newUser.registrationToken = token;
                    newUser.save();
                    var mailCallback = (err) => {
                        if (err) {
                            logger.error('Error sending registration mail', err);
                        }
                        callback('token', false);
                    };
                    sendActivationMail(newUser, mailCallback);

                });
            }
        });
    });
};


/**
 * login - helper function to perfrom a login
 *
 * @param  {type} username:string username
 * @param  {type} password:string password in plaintext
 * @param  {type} callback:       standard callback function, it returns error (if any) and the user
 */
export function login(username:string, password:string, callback:(err, u?)=>void) {

    user.repository.findOne({ 'username': username }, (err, myUser: user.User) => {
        // In case of any error, return using the done method
        if (err)
            return callback(err);
        // Username does not exist, log error & redirect back
        if (!myUser) {
            return callback(null, false);
        }
        // User exists but wrong password, log the error
        if (!isValidPassword(myUser, password)) {
            return callback(null, false);
        }

        if (myUser.registrationToken) {
            return callback('token', false);
        }

        myUser.last_login = new Date();
        myUser.save();

        // User and password both match, return user from
        // done method which will be treated like success
        return callback(null, myUser);
    });
};


/**
 * getGroups - returns the list of groups of a user
 *
 * @param  {type} _user: user.User      the user
 * @param  {type} callback:             standard callback function that returns error (if any) and an array of Group

 */
export function getGroups(_user: user.User, callback: (err: any, groups: group.Group[]) => void) {
    if (!_user) {
        callback('user is null', []);
        return;
    }
    group.repository.find().elemMatch("users", { "_id": _user._id }).exec((err, groups: group.Group[]) => {
        if (err) {
            logger.error("Error finding groups for a user", err);
            return callback(err, null);
        }
        return callback(null, groups);
    });
};


/**
 * deleteUser - helper function to delete a user from its id
 *
 * @param  {type} userId              the userId of the user to delete
 * @param  {type} callback:           standard callback function, it returns error (if any)
 */
export function deleteUser(userId, callback: (err: any) => void) {
    user.repository.findById(userId, (err, _user: user.User) => {
        getGroups(_user, (err, groups) => {
            groups.forEach((_group: group.Group) => {
                var index = -1;
                for (var i = 0; i < _group.users.length; i++) {
                    if (_group.users[i]._id == userId) {
                        index = i;
                    }
                }
                if (index != -1) {
                    _group.users.splice(index, 1);
                    _group.save();
                }
            });

            user.repository.remove({ _id: userId }, (err) => {
                if (err) {
                    logger.error("Error removing a user", err);
                    callback(err);
                    return;
                }
                callback(false);
            });
        });
    });
}


/**
 * generateNewPassword - utility function to generate a new password for the selected user,
 * and send to the user mail address an email with the generated password.
 *
 * @param  {type} username               the username
 * @param  {type} callback:              the callback function, it returns a string containing a message to show to the user
 */
export function generateNewPassword(username, callback: (msg: string) => void) {
    usersAPI.getConfig((err, config) => {
        if (err) {
            logger.error("Error loading users configuration", err);
            return callback("Internal error");
        }
        user.repository.findOne({ username: username }, (err, u) => {

            if (err || !u) {
                return callback('Username not found');
            }

            var newPass = randomstring.generate(8);
            u.password = createHash(newPass);
            u.save();
            var subject = replaceAll(config.forgotTemplate.subject, '{{username}}', u.username);
            var text = replaceAll(config.forgotTemplate.text, '{{username}}', u.username);
            var html = replaceAll(config.forgotTemplate.html, '{{username}}', u.username);
            subject = replaceAll(subject, '{{password}}', newPass);
            text = replaceAll(text, '{{password}}', newPass);
            html = replaceAll(html, '{{password}}', newPass);

            mailerAPI.sendMail({
                from: config.forgotTemplate.sender, // sender address
                to: u.username, // list of receivers
                subject: subject, // Subject line
                text: text, // plaintext body
                html: html // html body
            }, (err, info) => {
                    if (err) {
                        logger.error("Error sending new password email", err);
                    }
                    callback('Email sent!');
                });


        });


    });


}
