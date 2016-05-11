import express = require('express');
import ppackage = require('../../../core/ppackage');
import connectLogger = require('../libs/connect-logger');
import usersAPI = require('../../users/usersAPI');
import log = require('../models/log');
var router = express.Router();

router.get('/admin/logs', usersAPI.isAuth, usersAPI.isAdmin, (req, res) => {

    var filter = JSON.parse(req.query.filter);
    var levels = [];
    if (filter.level.debug) levels.push({level:'debug'});
    if (filter.level.info) levels.push({level:'info'});
    if (filter.level.warn) levels.push({level:'warn'});
    if (filter.level.error) levels.push({level:'error'});
    var ands = [];
    ands.push({'$or':levels});
    if (filter.message) {
        ands.push({'message':new RegExp(filter.message, 'i')});
    }
    if (filter.timeinterval) {
        var half = filter.timeinterval.indexOf(" - ");
        var from = new Date(filter.timeinterval.substring(0, half));
        var to = new Date(filter.timeinterval.substring(half+3));
        console.log(from);
        console.log(to);
        ands.push({'timestamp':{'$gte':from}});
        ands.push({'timestamp':{'$lte':to}});
    }

    var where = {'$and':ands};
    console.log(JSON.stringify(where));

    if (req.query.count) {
        log.repository.count(where, (err, ris) => {
            res.send({count:ris});
        });
        return;
    }

    var skip = 0;
    var limit = 200;
    if (req.query.skip) skip = req.query.skip;
    if (req.query.limit) limit = req.query.limit;
    log.repository.find(where).sort('-timestamp').skip(skip).limit(limit).exec((err, ris) => {
        res.send(ris);
    });
});


export class LoggerModule implements ppackage.Package {

    public init(app:express.Express):void {
        app.use(connectLogger.getLogger({ level: 'info' }));
    }

    public isRoot(): boolean {
        return false;
    }

    public hasRouter(): boolean {
        return true;
    }

    public getRouter(): express.Router {
        return router;
    }

}
