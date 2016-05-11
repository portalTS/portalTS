import mongoose = require('mongoose');

var connection = mongoose.createConnection('mongodb://localhost/portallogs');

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

export var repository = connection.model<Log>("log", logSchema, "log");
