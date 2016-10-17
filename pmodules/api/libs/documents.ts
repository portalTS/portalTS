import __collections = require('./collections');
var collections = __collections.Collections.get();
import collection = require('../models/collection');
import document = require('../models/document');
import user = require('../../users/models/user');
import group = require('../../users/models/group');
import usersAPI = require('../../users/usersAPI');
import logger = require('../../logger/loggerAPI');
import express = require('express');

export class Documents {

    private static instance:Documents;
    private static allowed_fields:string[] = ['_author', '_created_at', '_updated_at', '_id'];
    public static get():Documents {
        if (Documents.instance==null) {
            Documents.instance = new Documents();
        }
        return Documents.instance;
    }

    public create(collectionName:string, _user:user.User, doc:any, callback:Function):void {
        collections.exists(collectionName, (exists, _collection:collection.Collection) => {
            if (!exists) return callback("Collection "+collectionName+" doesn't exist");

            var document = {
                _collection: _collection._id,
                _author: _user.id,
                _public_readable: false,
                _public_writable: false,
                _readable: [],
                _writable: [],
                _payload: doc
            };
            //document.markModified('_payload');
            collections.getCollectionRepository(_collection).create(document, (err, doc) => {
                if (err) {
                    logger.error("Error retrieving the collection", err);
                    return callback(err);
                }
                return callback(null, doc);
            });
        });
    }

    private generateWhereBaseClause(_user:user.User, onlyWrite:boolean, callback:Function):void {
        usersAPI.getUserLib().getGroups(_user, (err, groups:group.Group[]) => {
            //3 possibilità:
            //1) sono l'autore
            //2) faccio parte di un gruppo che ha i permessi di lettura
            //3) faccio parte di un gruppo che ha i permessi di scrittura
            var ors = [];

            //attenzione: se l'utente è un amministratore, allora può leggere e scrivere tutto.
            //in tal caso, eseguo la ricerca con una proprità fake, che ritorni sempre true la query.
            if (_user && usersAPI.isAdminSync(_user.role)) {
                ors.push({_author:{$exists: true}});
                return callback(ors);
            }
            if (_user) ors.push({_author:_user._id});
            for (var i = 0; i<groups.length; i++) {
                if (!onlyWrite) ors.push({_readable: groups[i]._id});
                ors.push({_writable: groups[i]._id});
            }
            if (!onlyWrite) ors.push({_public_readable: true});
            ors.push({_public_writable: true});
            return callback(ors);
        });
    }


    private sanitizeObject(_where:any):any {
        var where:any = {};
        for (var key in _where) {

            //first, I need to correctly generate the correct value
            var v = _where[key];
            if (v instanceof Array) {
                v = this.sanitizeArray(v);
            } else {
                if (v instanceof Object) {
                    v = this.sanitizeObject(v);
                }
            }
            if (key.indexOf("$")==0) {
                where[key] = v;
                continue;
            }
            var found = false;
            for (var i = 0; i<Documents.allowed_fields.length; i++) {
                if (Documents.allowed_fields[i]==key) {
                    found = true;
                    break;
                }
            }
            if (found) where[key] = v;
            else where["_payload."+key] = v;
        }
        return where;
    }

    private sanitizeArray(arr:any[]) {
        var newArr = [];
        for (var i = 0; i<arr.length; i++) {
            var v = arr[i];
            if (v instanceof Array) {
                v = this.sanitizeArray(v);
            } else if (v instanceof Object) {
                v = this.sanitizeObject(v);
            }
            newArr[i] = v;
        }
        return newArr;
    }

    public search(collectionName:string, _user:user.User, _where:any, fields:string, pagination:{limit:number,offset:number}, callback:(err:any,_docs?:document.Document[])=>void):void {
        collections.exists(collectionName, (exists:boolean, c?:collection.Collection) => {
            if (!exists) {
                return callback("Collection "+collectionName+" does not exist");
            }


            //generate a SAFE where parameter starting from the original where,
            // specified by the user.
            // All the parameters speficied must be prefixed with the '_payload'.
            // We have also some exception. For example, the user wants to filter
            // by the author or by the creation/update date.
            if (!_where) _where = {};
            var where = this.sanitizeObject(_where);
            /*var where = {};
            if (!_where) _where = {};
            var allowed_fields = ['_author', '_created_at', '_updated_at'];
            for (var key in _where) {
                if (key.indexOf("$")==0) {
                    where[key] = _where[key];
                    continue;
                }
                var found = false;
                for (var i = 0; i<allowed_fields.length; i++) {
                    if (allowed_fields[i]==key) {
                        found = true;
                        break;
                    }
                }
                if (found) where[key] = _where[key];
                else where["_payload."+key] = _where[key];
            }*/

            if (fields!=null && fields!='') {
                var _fields = fields.split(',');
                fields = '';
                for (var i = 0; i<_fields.length; i++) {
                    var found = false;
                    for (var k = 0; k<Documents.allowed_fields.length; k++) {
                        if (Documents.allowed_fields[k]==_fields[i]) {
                            found = true;
                            break;
                        }
                    }
                    if (found) fields += _fields[i]+' ';
                    else fields += '_payload.'+_fields[i]+' ';
                }
            }

            var paging:any = {};
            if (pagination) {
                if (pagination.limit!=-1) paging.limit = pagination.limit;
                if (pagination.offset!=-1) paging.skip = pagination.offset;
            }

            //3 possibilità:
            //1) sono l'autore
            //2) faccio parte di un gruppo che ha i permessi di lettura
            //3) faccio parte di un gruppo che ha i permessi di scrittura
            //me lo faccio generare da questa funzione

            this.generateWhereBaseClause(_user, false, (ors) => {
                var query = collections.getCollectionRepository(c).find().where({_collection:c._id}).or(ors).where(where).select(fields);
                if (paging.limit) query = query.limit(paging.limit);
                if (paging.skip) query = query.skip(paging.skip);
                query.exec((err, docs) => {
                    if (err) {
                        logger.error("Error retrieving a collection", err);
                        return callback(err);
                    }
                    return callback(null, docs);
                });

            });

        });
    }

    public getDocument(collectionName:string, _user:user.User, id, callback:(err:any, doc?:document.Document) => void) {
        collections.exists(collectionName, (exists:boolean, c:collection.Collection) => {
            if (!exists) {
                return callback("Collection "+collectionName+" doesn't exist");
            }


            //3 possibilità:
            //1) sono l'autore
            //2) faccio parte di un gruppo che ha i permessi di scrittura
            //3) faccio parte di un gruppo che ha i permessi di lettura
            //me lo faccio generare da questa funzione
            this.generateWhereBaseClause(_user, false, (ors) => {
                collections.getCollectionRepository(c).findOne().where({_collection:c._id, _id:id}).or(ors).exec((err, doc) => {
                    if (err) {
                        logger.error("Error retrieving a collection", err);
                        return callback(err);
                    }
                    if (!doc) {
                        return callback("document not found");
                    }
                    return callback(null, doc);
                });
            });
        });
    }


    public update(collectionName:string, _user:user.User, id, _doc:document.Document, callback) {
        collections.exists(collectionName, (exists:boolean, c:collection.Collection) => {
            if (!exists) {
                return callback("Collection "+collectionName+" doesn't exist");
            }


            //3 possibilità:
            //1) sono l'autore
            //2) faccio parte di un gruppo che ha i permessi di scrittura
            //me lo faccio generare da questa funzione
            this.generateWhereBaseClause(_user, true, (ors) => {
                collections.getCollectionRepository(c).findOne().where({_collection:c._id, _id:id}).or(ors).exec((err, doc:document.Document) => {
                    if (err) {
                        logger.error("Error retrieving a collection", err);
                        return callback(err);
                    }

                    if (!doc) {
                        return callback("document not found");
                    }

                    doc._payload = _doc;
                    doc.markModified('_payload');
                    doc._updates.push({by:_user._id, at: new Date()});
                    doc.save((err) => {
                        if (err) {
                            logger.error("Error updating a document", err);
                            return callback(err);
                        }
                        return callback(null, doc);
                    });
                });

            });

        });
    }

    public delete(collectionName:string, _user:user.User, id, callback:(err:any)=>void) {
        collections.exists(collectionName, (exists, c) => {
            if (!exists) {
                return callback("Collection "+collectionName+" doesn't exist");
            }


            //3 possibilità:
            //1) sono l'autore
            //2) faccio parte di un gruppo che ha i permessi di scrittura
            //me lo faccio generare da questa funzione
            this.generateWhereBaseClause(_user, true, (ors) => {
                collections.getCollectionRepository(c).findOne().where({_collection:c._id, _id:id}).or(ors).exec((err, doc) => {
                    if (err) {
                        logger.error("Error retrieving a collection", err);
                        return callback(err);
                    }

                    if (!doc) {
                        return callback("document not found");
                    }
                    collections.getCollectionRepository(c).remove({_id:id}, (err) => {
                        if (err) {
                            logger.error("Error removing a collection", err);
                            return callback(err);
                        }
                        return callback(null);
                    });
                });

            });

        });

    }

    public setPermission(collectionName:string, _user:user.User, id, readable, public_readable:boolean, writable, public_writable, callback:(err:any, doc?:document.Document)=>void):void {
        collections.exists(collectionName, (exists:boolean, c:collection.Collection) => {
            if (!exists) {
                return callback("Collection "+collectionName+" doesn't exist");
            }


            //3 possibilità:
            //1) sono l'autore
            //2) faccio parte di un gruppo che ha i permessi di scrittura
            //me lo faccio generare da questa funzione
            this.generateWhereBaseClause(_user, true, (ors) => {
                collections.getCollectionRepository(c).findOne().where({_collection:c._id, _id:id}).or(ors).exec((err, doc:document.Document) => {
                    if (err) {
                        logger.error("Error retrieving a collection", err);
                        return callback(err);
                    }

                    if (!doc) {
                        return callback("document not found");
                    }

                    doc._public_readable = public_readable;
                    doc._public_writable = public_writable;
                    if (readable.constructor === Array) {
                        doc._readable = readable;
                    }
                    if (writable.constructor === Array) {
                        doc._writable = writable;
                    }
                    doc._updates.push({by:_user._id, at: new Date()});


                    doc.save((err) => {
                        if (err) {
                            logger.error("Error saving a document", err);
                            return callback(err);
                        }
                        return callback(null, doc);
                    });
                });

            });

        });
    }

}
