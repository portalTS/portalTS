import express = require('express');
var router = express.Router();
import fs = require('fs');
import user = require('../models/user');
import userLib = require('../libs/users');
import group = require('../models/group');
import groupLib = require('../libs/groups');
import mongoose = require('mongoose');
import usersAPI = require('../usersAPI');
import ppackage = require('../../../core/ppackage');
import logger = require('../../logger/loggerAPI');

var app:express.Express;
var router = express.Router();

export class AdminPackage implements ppackage.Package {
    isRoot(): boolean {
        return false;
    }
    init(_app:express.Express):void {
        app = _app;
        performInit();
    }

    hasRouter(): boolean {
        return true;
    }

    getRouter(): express.Router {
        return router;
    }
}


function performInit():void {

    router.get('/admin/api/users', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        user.repository.find({}, '_id username role groups', (err, users:user.User[]) => {
            res.send(users);
        });
    });

    router.get('/admin/api/levels', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        usersAPI.getUserLevels((err, levels) => {
            var l:any = {};
            for (var i = 0; i<levels.length; i++) {
                l[levels[i].name] = levels[i].val;
            };
            res.send(l);
        });
    });


    router.get('/admin/api/user/:id', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        user.repository.findById(req.params.id, (err, _user:user.User) => {

            if (err || !_user) {
                if (err) logger.error('Error retriving a user', err);
                res.send({success:false});
                return;
            }

            userLib.getGroups(_user, (err, groups) => {
                var ret:any = {};
                ret._id = _user._id;
                ret.username = _user.username;
                ret.role = _user.role;
                ret.last_login = _user.last_login;
                ret.create_at = _user.create_at;
                ret.groups = [];
                for (var i = 0; i<groups.length; i++) {
                    ret.groups.push({_id:groups[i]._id, name:groups[i].name});
                };
                res.send({success:true, user:ret});
            });

        });
    });



    router.post('/admin/api/user', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {

        var toRegister:userLib.userToRegister = {
            username: req.body.user.username,
            password: req.body.user.password,
            role: req.body.user.role
        };

        if (!toRegister.username || !toRegister.password || !toRegister.role) {
            res.send({success:false});
            return;
        }

        userLib.registration(toRegister, (err, u) => {
            if (err || !u) {
                res.send({success:false});
                return;
            }
            res.send({success:true});
        });

    });

    router.put('/admin/api/user/:id', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        var update = req.body.user;

        user.repository.findById(req.params.id, (err, _user:user.User) => {
            if (err || !_user) {
                if (err) logger.error('Error retrieving the user', err);
                res.send({success:false});
                return;
            }

            _user.username = update.username;
            _user.role = update.role;
            if (update.password) {
                _user.password = userLib.createHash(update.password);
            }
            _user.save();

            res.send({success:true});
        });
    });

    router.delete('/admin/api/user/:id', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        userLib.deleteUser(req.params.id, (err) => {
            if (err) {
                return res.send({success:false});
            }
            return res.send({success:true});
        });
    });




    router.get('/admin/api/groups/', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        group.repository.find({}, (err, groups:group.Group[]) => {
            res.send(groups);
        });
    });


    router.post('/admin/api/group', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        var group = req.body.group;
        try {
            groupLib.create(group.name, group.description, req.user._id, (err) => {
                if (err) {
                    res.send({success:false});
                    return;
                }
                res.send({success:true});
            });
        }
        catch (e) {
            logger.error("Error creating a group", e);
        }
    });

    router.put('/admin/api/group/:id', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        var update = req.body.group;
        group.repository.findById(req.params.id, (err, _group:group.Group) => {
            if (err || !_group) {
                if (err) logger.error("Error retrieving the group", err);
                res.send({success:false});
                return;
            }

            _group.name = update.name;
            _group.description = update.description;
            _group.modified_at = new Date();
            _group.modified_by = req.user._id;

            _group.save();

            res.send({success:true});
        });
    });

    router.get('/admin/api/group/:id', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        group.repository.findById(req.params.id, (err, _group:group.Group) => {

            if (err || !_group) {
                if (err) logger.error("Error retrieving a group", err);
                res.send({success:false});
                return;
            }

            var ors = [];
            _group.users.forEach((member:group.GroupMember) => {
                ors.push({_id:member._id});
            });
            if (ors.length==0) {
                var g:any = {};
                g._id = _group._id;
                g.name = _group.name;
                g.description = _group.description;
                g.created_at = _group.created_at;
                g.created_by = _group.created_by;
                g.modified_at = _group.modified_at;
                g.modified_by = _group.modified_by;
                g.users = [];
                res.send({success:true, group:g});
                return;
            }

            var us = [];
            user.repository.find().or(ors).exec((err, users:user.User[]) => {

                if (err) {
                    logger.error("Error retrieving the users from a group", err);
                    res.send({success:false});
                    return;
                }
                for (var i = 0; i<users.length; i++) {
                    us.push({_id:users[i]._id, username:users[i].username, added_at:_group.users[i].added_at});
                }

                var g:any = {};
                g._id = _group._id;
                g.name = _group.name;
                g.description = _group.description;
                g.created_at = _group.created_at;
                g.created_by = _group.created_by;
                g.modified_at = _group.modified_at;
                g.modified_by = _group.modified_by;
                g.users = us;
                res.send({success:true, group:g});


            });

        });
    });

    router.delete('/admin/api/group/:id', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        usersAPI.getConfig((err, config) => {
            var index = -1;
            for (var i = 0; i<config.default_groups.length; i++) {
                if (config.default_groups[i]==req.params.id) {
                    index = i;
                    break;
                }
            }
            if (index!=-1) {
                config.default_groups.splice(index,1);
                usersAPI.saveConfig(config, (err) => {});
            }
            group.repository.remove({_id:req.params.id}, (err) => {
                if (err) {
                    logger.error("Error removing a group", err);
                    res.send({success:false});
                    return;
                }
                res.send({success:true});
            });
        });

    });


    router.get('/admin/api/group_user/:group/:username', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {

        user.repository.find({username: new RegExp('.*'+req.params.username+'.*', 'i')}, '_id username', (err, users) => {
            if (err) {
                logger.error("Error retrieving a user from a username", err);
                res.send({success:false});
                return;
            }
            res.send(users);
        });

    });


    router.post('/admin/api/group_user/:group', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        var users:group.GroupMember[] = <group.GroupMember[]>req.body.users;
        users.forEach((u:group.GroupMember) => {
            if (!u.added_at) u.added_at = new Date();
        });
        group.repository.findById(req.params.group, (err, _group:group.Group) => {
            if (err) logger.error("Error retrieving a group from the id", err);
            _group.users = new Array<group.GroupMember>();
            users.forEach((u:group.GroupMember) => {
                _group.users.push(u);
            });
            _group.save();
        });
        res.send({success:true});
    });


    router.get('/admin/api/group/search/:name', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {

        group.repository.find({name: new RegExp('.*'+req.params.name+'.*', 'i')}, '_id name', (err, groups:group.Group[]) => {
            if (err) {
                logger.error("Error retrieving a group from a name", err);
                res.send({success:false});
                return;
            }
            res.send(groups);
        });
    });

    router.get('/admin/api/settings', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        usersAPI.getConfig((err, config) => {
            res.send(config);
        });
    });

    router.post('/admin/api/settings', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
        var config = req.body.settings;
        usersAPI.saveConfig(config, (err) => {
            if (err) res.send({success:false});
            else res.send({success:true});
        });
    });

};
