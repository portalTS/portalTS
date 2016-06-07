import mongoose = require('mongoose');

var connection:mongoose.Connection = null;
import parameters = require('../../../core/parameters');
var disabled = parameters.getParameter('logger-db-disable', false);
if (!disabled) {
    var conf =  parameters.getDBParameter('logger-db', 'mongodb://localhost/portallogs');
    connection = mongoose.createConnection(conf);
}

export var logSchema = new mongoose.Schema({
     message: String,
     timestamp: Date,
     level: String,
     meta: {}
}, {
    collection: 'log'
});

export interface Log extends mongoose.Document {
    message: string,
    timestamp: Date,
    level: string,
    meta: any
}

export var repository = null;
if (connection) {
    repository = connection.model<Log>("log", logSchema, "log");
}
