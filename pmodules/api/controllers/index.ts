import ppackage = require('../../../core/ppackage');
import express = require('express');
var router = express.Router();

import url = require("url");
var swagger = require("swagger-express");
import usersAPI = require('../../users/usersAPI');
import apis = require('../apis/api');


export class APIModule implements ppackage.Package {
    public isRoot(): boolean {
        return false;
    }
    public init(app: express.Express) {
        var r = new apis.APIImplementation(app);
        router.post('/collections', usersAPI.isAuth, usersAPI.isAdmin, r.createCollection);
        router.delete('/collections/:collection', usersAPI.isAuth, usersAPI.isAdmin, r.deleteCollection);
        router.get('/collections', usersAPI.isAuth, r.getCollections);
        router.get('/collections/:collection/info', usersAPI.isAuth, usersAPI.isAdmin, r.infoCollection);

        router.post('/documents/:collection', usersAPI.isAuth, r.createDocument);
        router.get('/documents/:collection', usersAPI.isAuth, r.searchDocuments);
        router.get('/documents/:collection/:document_id', usersAPI.isAuth, r.getDocument);
        router.put('/documents/:collection/:document_id', usersAPI.isAuth, r.updateDocument);
        router.delete('/documents/:collection/:document_id', usersAPI.isAuth, r.deleteDocument);
        router.put('/documents/:collection/:document_id/permissions', usersAPI.isAuth, r.setPermission);


        app.use(swagger.init(app, {
            apiVersion: '1.0',
            swaggerVersion: '1.0',
            basePath: '/api',
            swaggerJSON: '/api-docs.json',
            swaggerUI: '/api/dist/',
            apis: [__dirname + '/../apis/api.js']
        }));

    }
    public hasRouter(): boolean {
        return true;
    }

    getRouter(): express.Router {
        return router;
    }
}
