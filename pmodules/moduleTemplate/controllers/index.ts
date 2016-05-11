
var moduleName = "moduleTemplate";
var viewName = "moduleTemplateMainPage";

import ppackage = require('../../../core/ppackage');
import express = require('express');
import logger = require('../../logger/loggerAPI');
import document = require('../../api/models/document');
import users = require('../../users/libs/users');
import group = require('../../users/models/group');
import user = require('../../users/models/user');
import usersAPI = require('../../users/usersAPI');
import configurationsAPI = require('../../configurations/configurationsAPI');
import cmsAPI = require('../../cms/cmsAPI');

var router = express.Router();
var app;


var accessPath = 'pmodules/'+moduleName+"/access.json";

export class AngularModule implements ppackage.Package {
    isRoot(): boolean {
        return false;
    }
    init(_app:express.Express):void {
        app = _app;


        app.all('/'+moduleName+'/*', (req:express.Request, res:express.Response, next:Function) => {
            var obj = {
                isPublic: false,
                groups: []
            };
            configurationsAPI.getConfiguration(moduleName+"Config", (err, config) => {
                if (!err && config) obj = config;
                if (obj.isPublic) return next();
                var u = (<any>req).user;
                if (!u && !obj.isPublic) return res.redirect('/');
                var userLib = usersAPI.getUserLib();
                if (usersAPI.isAdminSync(u.role)) {
                    return next();
                }
                userLib.getGroups(u,(err:any, groups:group.Group[]) => {
                    if (err) {
                        logger.error("Error retrieving groups", err);
                        return res.redirect('/');
                    }
                    for (var i = 0; i<obj.groups.length; i++) {
                        for (var k = 0; k<groups.length; k++) {
                            if (groups[k]._id==obj.groups[i]) {
                                return next();
                            }
                        }
                    }
                    res.redirect('/');
                });
            });


        });

        router.get('/', (req:express.Request, res:express.Response) => {
            cmsAPI.render(req, res, {title:'Index', path:'../../moduleTemplate/views/'+viewName, obj: {}});
        });

        router.post('/api/save', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
            configurationsAPI.saveConfigruation(moduleName+"Config", req.body, (err) => {
                if (err) {
                    logger.error("Error saving the configuration file", err);
                }
            });
            res.send({status:"ok"});
        });

        router.get('/api/save', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response) => {
            var obj = {
                isPublic: false,
                groups: []
            };
            configurationsAPI.getConfiguration(moduleName+"Config", (err, config) => {
                if (err) {
                    logger.error("Error retrieving the configuration file", err);
                }
                if (!err && config) obj = config;
                res.send(obj);
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
