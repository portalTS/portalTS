import express = require('express');
import ppackage = require('../../../core/ppackage');

import document = require('../../api/models/document');
import persistenceAPI = require('../../api/persistenceAPI');


var router = express.Router();
var app;

router.get('/', (req:express.Request, res:express.Response, next:Function) => {
    persistenceAPI.searchDocuments('root_config', null, '', null, req.user, (err:any, docs?:document.Document[]):void => {
        if (err || !docs || docs.length==0) return next();

        var p = docs[0]._payload;
        var url = null;
        if (p.redirect_type==1) {
            url = '/cms/'+p.redirect_page;
        }
        else url = p.url;
        res.redirect(url);
    });
});

export class RootModule implements ppackage.Package {

    public init(_app:express.Express):void {
        app = _app;
    }

    public isRoot(): boolean {
        return true;
    }

    public hasRouter(): boolean {
        return true;
    }

    public getRouter(): express.Router {
        return router;
    }

}
