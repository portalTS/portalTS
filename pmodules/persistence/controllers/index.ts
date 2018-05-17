import ppackage = require('../../../core/ppackage');
import express = require('express');
var router = express.Router();

import dbConfig = require('../../../config/persistence/config');
import mongoose = require('mongoose');

import logger = require('../../logger/loggerAPI');


import parameters = require('../../../core/parameters');
dbConfig.config.url = parameters.getDBParameter('db', dbConfig.config.url);



export class PersistenceModule implements ppackage.Package {

    isRoot(): boolean {
        return false;
    }

    init(app:express.Express):void {
        mongoose.connect(dbConfig.config.url, {}, (err) => {
            if (err) {
                logger.error("Error connecting to MongoDB", err);
            }
            else {
                logger.info("Connected to MongoDB! We are ready!! :)");
            }
        });
        app.set('pmodules.mongoose',mongoose);
    }

    hasRouter(): boolean {
        return false;
    }

    getRouter(): express.Router {
        return null;
    }



}
