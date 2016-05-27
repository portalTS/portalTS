import express = require('express');
var router = express.Router();

import ppackage = require('../../../core/ppackage');
import usersAPI = require('../../users/usersAPI');
import relements = require('../libs/relements');

var multer = require('multer');
var upload = multer({ dest: 'pmodules/repository/tmp/' });
import fs = require('fs');

function generateOK(obj):any {
    return {
        result: 'OK',
        data: obj
    };
}

function generateSuccess(success):any {
    return {
            result: 'OK',
            data: success
    };
}

function generateFail(error):any {
    return {
        result: 'Error',
        error: error
    };
}

router.use('/admin/', usersAPI.isAuth, usersAPI.isAdmin);

router.get('/admin/relements', (req, res) => {
    relements.getElements(req.query.father, (err, elements) => {
        if (err) return res.send(generateFail(err));
        res.send(generateOK(elements));
    });
});

router.post('/admin/relements', (req, res) => {
    if (!req.body || !req.body.name) return res.send(generateFail('no data'));
    relements.createNewFolder(req.body.father, req.body.name, (err, element) => {
        if (err) return res.send(generateFail(err));
        res.send(generateOK(element));
    });
});

router.put('/admin/relements/:id', (req, res) => {
    if (!req.params.id) return res.send(generateFail('no data'));
    relements.renameElement(req.body, (err, element) => {
        if (err) return res.send(generateFail(err));
        res.send(generateOK(element));
    });
});

router.delete('/admin/relements/:id', (req, res) => {
    if (!req.params.id) return res.send(generateFail('no data'));
    relements.deleteFile(req.params.id, (err) => {
        if (err) return res.send(generateFail(err));
        res.send(generateSuccess('OK'));
    });
});

router.post('/admin/upload', upload.single('file'), (req, res) => {
    var f = (<any>req).file;
    if (!f) return res.send(generateFail('file not uploaded'));
    console.log(f);
    var originalName = f.originalname;
    var path = f.path;
    fs.readFile(path, (err, data) => {
        if (err) return res.send(generateFail(err));
        var d = {
            name: originalName,
            contentType: f.mimetype,
            size: f.size,
            father: req.body.father,
            data: data,
            isDirectory: false
        };
        relements.createFile(d, (err, element) => {
            fs.unlink(path, (err) => {});
            if (err) return res.send(generateFail(err));
            res.send(generateOK(element));
        });
    });
});


router.get('/file/*', (req, res, next) => {
    var index = req.originalUrl.indexOf("/files/");
    var param = req.originalUrl.substring(index+6);
    console.log(param);
    relements.getFileFromPath(param, (err, element) => {
        if (err) return next(err);
        if (!element) return next();
        res.contentType(element.contentType);
        res.send(element.data);
    });
});


export class IndexModule implements ppackage.Package {
    isRoot(): boolean {
        return false;
    }

    init(_app:express.Express):void {

    }

    hasRouter(): boolean {
        return true;
    }

    getRouter(): express.Router {
        return router;
    }
}
