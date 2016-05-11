import ppackage = require('../../../core/ppackage');
import express = require('express');
import loader = require('../../../core/loader');
import module = require('../../../core/module');
var router = express.Router();
var Loader = loader.Loader;

import usersAPI = require('../../users/usersAPI');

var hasInit = false;
function init() {
    if (hasInit) return;
    var modules : module.Module[] = Loader.getModules();
    for (var i = 0; i<modules.length; i++) {
        var config = modules[i].getConfigFile();
        if (config) {
            adminModules.push(config);
        }
    }
    hasInit = true;
}



var adminModules = [];



export class AdministrationModule implements ppackage.Package {
    isRoot(): boolean {
        return false;
    }

    init(app:express.Express):void {

        router.get('/:index(\\d+)?', usersAPI.isAuth, usersAPI.isAdmin, (req:express.Request, res:express.Response, next) => {
            init();
            var index = req.params.index;
            if (!index || index<0 || index>adminModules.length) index = adminModules.length;
            res.render('home',{modules:adminModules, index:index});
        });
    }

    hasRouter(): boolean {
        return true;
    }

    getRouter(): express.Router {
        return router;
    }
}
