import express = require('express');
import ppackage = require('../../../core/ppackage');
import configurationsAPI = require('../../configurations/configurationsAPI');
var inquirer = require('inquirer');
var colors = require('colors/safe');
var Table = require('cli-table2');
var async = require('async');
import usersAPI = require('../../users/usersAPI');
import persistenceAPI = require('../../api/persistenceAPI');
import parameters = require('../../../core/parameters');

var tableBorders = {
  'top': '═'
  , 'top-mid': '╤'
  , 'top-left': '╔'
  , 'top-right': '╗'
  , 'bottom': '═'
  , 'bottom-mid': '╧'
  , 'bottom-left': '╚'
  , 'bottom-right': '╝'
  , 'left': '║'
  , 'left-mid': '╟'
  , 'right': '║'
  , 'right-mid': '╢'
};

function askUserInfo(cb) {
    var prompt = inquirer.createPromptModule();
    prompt([
        {
            type: 'input',
            name: 'username',
            message: 'What\'s your username?',
            validate: (value):any => {
                if (value.length>3) return true;
                return "The username is too short!";
            }
        },
        {
            type: 'password',
            name: 'password',
            message: 'What\'s your password?',
            validate: (value):any => {
                if (value.length>3) return true;
                return "The password is too short!";
            }
        },
        {
            type: 'password',
            name: 'repassword',
            message: 'Your password again (super-safe!)',
            validate: (value):any => {
                if (value.length>3) return true;
                return "The password is too short!";
            }
        },
    ]).then(function (answers) {
        if (answers.password!=answers.repassword) {
            console.error(colors.red("\nThe two passwords don't match!\n"));
            askUserInfo(cb);
            return;
        }
        cb(answers);
    });
}


function performInstall(answers) {
    //I need to execute different operations to create a brand-new environment
    // for the portal.
    //0) create a new user, with the chosen username/password
    //1) create a registered users group
    //2) create an admin users group
    //3) add the created user to the admin group
    //4) create a new homepage, available to everyone, with some text
    //5) create Home menu (available to everyone)
    //6) create Administration menu (available only for admin group)
    //7) create Login menu (available to non-registered users)
    //8) create Signup menu (available to non-registered users)
    //9) create Logout menu (available to registered-only users)
    //10) create the root module configuration, to mount the cms module as root
    //11) create a new collection for the cms templates

    var context = {
        user: null,
        registeredGroup: null,
        administrationGroup: null,
        homePage: null
    };
    async.series([
        //creating a new user
        (callback) => {
            usersAPI.getUserLevelAdmin((err, ul) => {
                if (err || !ul) return callback({err:err});
                var userToRegister = {
                    username:answers.username,
                    password:answers.password,
                    role: ul.val
                };
                usersAPI.getUserLib().registration(userToRegister, (err, u) => {
                    if (err || !u) return callback({err:err});
                    context.user = u;
                    callback(null);
                });
            });
        },
        //creating the registered group
        (callback) => {
            usersAPI.getGroupLib().create('Registered', 'Standard registered group', context.user._id, (err, group) => {
                if (err || !group) return callback({err:err});
                context.registeredGroup = group;
                group.users.push({
                    _id: context.user._id,
                    added_at: new Date(),
                    until: null
                });
                group.save();
                callback(null);
            });
        },
        //creating the admin group and add the user to the group
        (callback) => {
            usersAPI.getGroupLib().create('Admin', 'Standard administration group', context.user._id, (err, group) => {
                if (err || !group) return callback({err:err});
                context.administrationGroup = group;
                group.users.push({
                    _id: context.user._id,
                    added_at: new Date(),
                    until: null
                });
                group.save();
                callback(null);
            });
        },
        //create the home page (and the necessary collections!)
        (callback) => {
            persistenceAPI.createCollection('cms_pages', context.user, (err, c) => {
                if (err || !c) return callback({err:err});
                var doc = {
                    url: 'home',
                    title: 'Home Page',
                    body: '<h1>Welcome to <b>PortalTS!</b></h1>'
                };
                persistenceAPI.createDocument('cms_pages', doc, context.user, (err, d) => {
                    if (err || !d) return callback({err:err});
                    persistenceAPI.setDocumentPermission('cms_pages', d._id, d._readable, true, d._writable, d._public_writable, context.user, (err, d) => {
                        if (err || !d) return callback({err:err});
                        context.homePage = d;
                        callback(null);
                    });
                });
            });
        },
        //create the home page menu
        (callback) => {
            persistenceAPI.createCollection('cms_menu_items', context.user, (err, c) => {
                if (err || !c) return callback({err:err});
                var item = {
                    title: 'Home',
                    order: 1,
                    page_id: context.homePage._id,
                    excluded_to: []
                };
                persistenceAPI.createDocument('cms_menu_items', item, context.user, (err, m) => {
                    if (err || !m) return callback({err:err});
                    persistenceAPI.setDocumentPermission('cms_menu_items', m._id, m._readable, true, m._writable, m._public_writable, context.user, (err, m) => {
                        if (err || !m) return callback({err:err});
                        callback(null);
                    });
                });
            });
        },
        //create the administration menu
        (callback) => {
            var item = {
                title: 'Administration',
                order: 2,
                external_url: '/admin',
                excluded_to: []
            };
            persistenceAPI.createDocument('cms_menu_items', item, context.user, (err, m) => {
                if (err || !m) return callback({err:err});
                persistenceAPI.setDocumentPermission('cms_menu_items', m._id, [context.administrationGroup._id], false, m._writable, m._public_writable, context.user, (err, m) => {
                    if (err || !m) return callback({err:err});
                    callback(null);
                });
            });
        },
        //create the login menu
        (callback) => {
            var item = {
                title: 'Login',
                order: 3,
                external_url: '/cms/login',
                excluded_to: [context.registeredGroup._id.toString(), context.administrationGroup._id.toString()]
            };
            persistenceAPI.createDocument('cms_menu_items', item, context.user, (err, m) => {
                if (err || !m) return callback({err:err});
                persistenceAPI.setDocumentPermission('cms_menu_items', m._id, m._readable, true, m._writable, m._public_writable, context.user, (err, m) => {
                    if (err || !m) return callback({err:err});
                    callback(null);
                });
            });
        },
        //create the signup menu
        (callback) => {
            var item = {
                title: 'Signup',
                order: 4,
                external_url: '/cms/signup',
                excluded_to: [context.registeredGroup._id.toString(), context.administrationGroup._id.toString()]
            };
            persistenceAPI.createDocument('cms_menu_items', item, context.user, (err, m) => {
                if (err || !m) return callback({err:err});
                persistenceAPI.setDocumentPermission('cms_menu_items', m._id, m._readable, true, m._writable, m._public_writable, context.user, (err, m) => {
                    if (err || !m) return callback({err:err});
                    callback(null);
                });
            });

        },
        //create the logout menu
        (callback) => {
            var item = {
                title: 'Logout',
                order: 5,
                external_url: '/users/signout',
                excluded_to: []
            };
            persistenceAPI.createDocument('cms_menu_items', item, context.user, (err, m) => {
                if (err || !m) return callback({err:err});
                persistenceAPI.setDocumentPermission('cms_menu_items', m._id, [context.registeredGroup._id], false, m._writable, m._public_writable, context.user, (err, m) => {
                    if (err || !m) return callback({err:err});
                    callback(null);
                });
            });
        },
        //create the configuration for the root module
        (callback) => {
            persistenceAPI.createCollection('root_config', context.user, (err, c) => {
                if (err || !c) return callback({err:err});
                var item = {
                    redirect_type: "1",
                    redirect_page: "home"
                };
                persistenceAPI.createDocument('root_config', item, context.user, (err, m) => {
                    if (err || !m) return callback({err:err});
                    persistenceAPI.setDocumentPermission('root_config', m._id, m._readable, true, m._writable, m._public_writable, context.user, (err, m) => {
                        if (err || !m) return callback({err:err});
                        callback(null);
                    });
                });
            });
        },
        (callback) => {
            persistenceAPI.createCollection('cms_templates', context.user, (err, c) => {
                if (err || !c) return callback({err:err});
                callback(null);
            });
        }
    ], function(err, results){
        if (err) {
            console.error(colors.red("Ops! Something goes wrong! Please, try again!"));
            console.dir(err);
            return;
        }
        configurationsAPI.saveConfigruation('installed', {installation_time: new Date()}, (err) => {
            if (err) {
                console.error(colors.red("Ops! Something goes wrong! Please, try again!"));
                console.dir(err);
                return;
            }
            var table = new Table({
                head: [colors.green('\n  Installation completed!  \n')],
                chars: tableBorders
            });
            console.log(table.toString());
        });
    });
}

function performConfiguration() {

    var u = parameters.getParameter('install-user',null);
    var p = parameters.getParameter('install-password',null);
    if (u && p && u !== true && p !== true) {
        return performInstall({
            username: u,
            password: p
        });
    }

    var table = new Table({
        head: [colors.green('\n  Welcome to PortalTS! Please, create a new admin user  \n')],
        chars: tableBorders
    });
    console.log(table.toString());

    askUserInfo((answers) => {
        performInstall(answers);
    });



}


export class InstallerModule implements ppackage.Package {

    public init(app:express.Express):void {
        configurationsAPI.getConfiguration('installed', (err, config) => {
            if (config) return;
            performConfiguration();
        });
    }

    public isRoot(): boolean {
        return false;
    }

    public hasRouter(): boolean {
        return false;
    }

    public getRouter(): express.Router {
        return null;
    }

}
