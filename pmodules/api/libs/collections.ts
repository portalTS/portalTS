import collection = require('../models/collection');
import document = require('../models/document');
import user = require('../../users/models/user');
import mongoose = require('mongoose');
import logger = require('../../logger/loggerAPI');

export class Collections {

    private static prefix = "pmodules__persistence__";

    private static instance:Collections;
    public static get():Collections {
        if (Collections.instance==null) {
            Collections.instance = new Collections();
        }
        return Collections.instance;
    }


    public exists(name:string, callback:(exist:boolean,collection?:collection.Collection)=>void):void {
        collection.repository.findOne({name:Collections.prefix+name}, (err,_collection:collection.Collection) => {
            if (err) {
                logger.error("Error retrieving the collection "+name, err);
                return callback(false);
            }
            if (_collection) {
                return callback(true, _collection);
            }
            return callback(false);
        });
    }

    public create(name:string, user:user.User, callback:Function):void {
        collection.repository.findOne({name:Collections.prefix+name}, (err,_collection:collection.Collection) => {
            if (err) {
                logger.error("Error retrieving the collection "+name, err);
                return callback(err);
            }
            if (_collection) {
                return callback("Collection with name "+name+" already exsists");
            }

            //Moreover, I need to check if a real! collection with that name exists!
            //if (mongoose.connection.collection(Collections.prefix+name)) {
            //    return callback("A collection with name "+name+" already exists (not created by this module!)");
            //}

            var c = {
                name: Collections.prefix+name,
                created_by: user.id,
                created_at: new Date()
            };
            collection.repository.create(c, (err, newCollection:collection.Collection) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, newCollection);
            });


        });

    }

    public delete(name:string, callback:Function):void {
        collection.repository.findOne({name:Collections.prefix+name}, (err, _collection:collection.Collection) => {
            if (err) {
                logger.error("Error retrieving the collection "+name, err);
                return callback(err);
            }
            if (!_collection) {
                return callback("Collection with name "+name+" dosn't exist");
            }

            mongoose.connection.db.dropCollection(Collections.prefix+name, (err, result) => {
                /**
                Mongo returns the following error:
                "error": {
                    "name": "MongoError",
                    "message": "ns not found",
                    "ok": 0,
                    "errmsg": "ns not found"
                }
                that it is not an error, and it should be ignored!
                https://github.com/ReactiveMongo/ReactiveMongo/issues/205
                */
                collection.repository.remove({_id:_collection._id}, (err) => {
                    if (err) {
                        logger.error("Error removing a collection ", err);
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });

    }


    public getAll(callback:Function):void {
        collection.repository.find({}, (err,all:collection.Collection[]) => {
            if (err) {
                logger.error("Error retrieving all collections ", err);
                return callback(err);
            }
            callback(null, all);
        });
    }

    public getCollectionRepository(_collection:collection.Collection):mongoose.Model<document.Document> {
        return mongoose.model<document.Document>(_collection.name, document.documentSchema);
    }


}
