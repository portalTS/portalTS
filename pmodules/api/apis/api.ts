import collection = require('../models/collection');
import __collections = require('../libs/collections');
var collections = __collections.Collections.get();
import document = require('../models/document');
import __documents = require('../libs/documents');
var documents = __documents.Documents.get();

import express = require('express');

var app;

export class APIImplementation {


    private app: express.Express;

    public constructor(_app: express.Express) {
        this.app = _app;
        app = _app;
    }

    private static generateOK(obj):any {
        return {
            result: 'OK',
            data: obj
        };
    }

    private static generateSuccess(success):any {
        return {
                result: 'OK',
                data: success
        };
    }

    private static generateFail(error):any {
        return {
            result: 'Error',
            error: error
        };
    }


    /**
     * @swagger
     * resourcePath: /api
     * description: All about API
     */


    /**
     * @swagger
     * path: /collections
     * operations:
     *   -  httpMethod: GET
     *      summary: Get a list of the available collections
     *      notes: Returns a list of available collections
     *      nickname: getCollections
     *      consumes:
     *        - application/json
     */
    public getCollections(req: express.Request, res: express.Response) {
        collections.getAll((err, collections) => {
            if (err) {
                return res.json(APIImplementation.generateFail(err));
            }
            return res.json(APIImplementation.generateOK(collections));
        });
    }


    /**
     * @swagger
     * path: /collections
     * operations:
     *   -  httpMethod: POST
     *      summary: Create a new collection with the specified name
     *      notes: Returns the created collection or an error
     *      responseClass: Collection
     *      nickname: createCollection
     *      consumes:
     *        - application/json
     *      parameters:
     *        - name: name
     *          description: The collection name
     *          paramType: body
     *          required: true
     *          dataType: json
     */
    public createCollection(req: express.Request, res: express.Response) {
        if (!req.body.name) {
            return res.json(APIImplementation.generateFail("parameter name not found"));
        }
        collections.create(req.body.name, req.user, (err, collection) => {
            if (err) {
                return res.json(APIImplementation.generateFail(err));
            }
            return res.json(APIImplementation.generateOK(collection));
        });
    }

    /**
     * @swagger
     * path: /collections/{collection}
     * operations:
     *   -  httpMethod: DELETE
     *      summary: Delete the collection with the specified name
     *      notes: Returns success or an error
     *      nickname: deleteCollection
     *      consumes:
     *        - application/json
     *      parameters:
     *        - name: collection
     *          description: The collection name
     *          paramType: path
     *          required: true
     *          dataType: string
     */
    public deleteCollection(req: express.Request, res: express.Response) {
        if (!req.params.collection) {
            return res.json(APIImplementation.generateFail("parameter name not found"));
        }
        collections.delete(req.params.collection, (err, collection) => {
            if (err) {
                return res.json(APIImplementation.generateFail(err));
            }
            return res.json(APIImplementation.generateSuccess(true));
        });
    }

    /**
     * @swagger
     * path: /documents/{collection}
     * operations:
     *   -  httpMethod: GET
     *      summary: Retrieve documents of the specified collection
     *      notes: Returns documents or an error
     *      nickname: searchDocument
     *      consumes:
     *        - application/json
     *      parameters:
     *        - name: collection
     *          description: The collection name
     *          paramType: path
     *          required: true
     *          dataType: string
     *        - name: where
     *          description: The where clause to select documents
     *          paramType: query
     *          required: false
     *          dataType: string
     *        - name: fields
     *          description: A list of fields to return, separated by comma
     *          paramType: query
     *          required: false
     *          dataType: string
     *        - name: limit
     *          description: The maximum number of elements to return.
     *          paramType: query
     *          required: false
     *          dataType: integer
     *        - name: offset
     *          description: The number of elements to skip starting from the first.
     *          paramType: query
     *          required: false
     *          dataType: integer
     */
    public searchDocuments(req: express.Request, res: express.Response) {
        if (!req.params.collection) {
            return res.json(APIImplementation.generateFail("parameter collection not found"));
        }
        var _where = req.query.where;
        var where = null;
        if (_where) {
            where = JSON.parse(_where);
        }
        var fields:string = null;
        if (req.query.fields) fields = req.query.fields;
        var pagination = {
            limit: -1,
            offset: -1
        };
        if (req.query.limit) pagination.limit = req.query.limit;
        if (req.query.offset) pagination.offset = req.query.offset;

        documents.search(req.params.collection, req.user, where, fields, pagination, (err, docs) => {
            if (err) {
                return res.json(APIImplementation.generateFail(err));
            }
            return res.json(APIImplementation.generateOK(docs));
        });
    };


    /**
     * @swagger
     * path: /documents/{collection}/{document_id}
     * operations:
     *   -  httpMethod: GET
     *      summary: Retrieve the selected document of the selected collection
     *      notes: Returns the document or an error
     *      nickname: getDocument
     *      consumes:
     *        - application/json
     *      parameters:
     *        - name: collection
     *          description: The collection name
     *          paramType: path
     *          required: true
     *          dataType: string
     *        - name: document_id
     *          description: The document id
     *          paramType: path
     *          required: true
     *          dataType: string
     */
    public getDocument(req: express.Request, res: express.Response) {
        if (!req.params.collection) {
            return res.json(APIImplementation.generateFail("parameter collection not found"));
        }
        if (!req.params.document_id) {
            return res.json(APIImplementation.generateFail("parameter document_id not found"));
        }
        documents.getDocument(req.params.collection, req.user, req.params.document_id, (err, document) => {
            if (err) {
                return res.json(APIImplementation.generateFail(err));
            }
            return res.json(APIImplementation.generateOK(document));
        });
    }

    /**
     * @swagger
     * path: /documents/{collection}
     * operations:
     *   -  httpMethod: POST
     *      summary: Create a new document to the specified collection
     *      notes: Returns the document or an error
     *      nickname: addDocument
     *      consumes:
     *        - application/json
     *      parameters:
     *        - name: collection
     *          description: The collection name
     *          paramType: path
     *          required: true
     *          dataType: string
     *        - name: document
     *          description: The json document to save
     *          paramType: body
     *          required: true
     *          dataType: json
     */
    public createDocument(req: express.Request, res: express.Response) {
        if (!req.params.collection) {
            return res.json(APIImplementation.generateFail("parameter collection not found"));
        }
        var doc = req.body;
        documents.create(req.params.collection, req.user, doc, (err, document) => {
            if (err) {
                return res.json(APIImplementation.generateFail(err));
            }
            return res.json(APIImplementation.generateOK(document));
        });
    };


    /**
     * @swagger
     * path: /documents/{collection}/{document_id}
     * operations:
     *   -  httpMethod: PUT
     *      summary: Update the selected document of the selected collection
     *      notes: Returns the document or an error
     *      nickname: updateDocument
     *      consumes:
     *        - application/json
     *      parameters:
     *        - name: collection
     *          description: The collection name
     *          paramType: path
     *          required: true
     *          dataType: string
     *        - name: document_id
     *          description: The document id
     *          paramType: path
     *          required: true
     *          dataType: string
     *        - name: document
     *          description: The updated document
     *          paramType: body
     *          required: true
     *          dataType: json
     */
    public updateDocument(req: express.Request, res: express.Response) {
        if (!req.params.collection) {
            return res.json(APIImplementation.generateFail("parameter collection not found"));
        }
        if (!req.params.document_id) {
            return res.json(APIImplementation.generateFail("parameter document_id not found"));
        }
        var doc = req.body;
        documents.update(req.params.collection, req.user, req.params.document_id, doc, (err, document) => {
            if (err) {
                return res.json(APIImplementation.generateFail(err));
            }
            return res.json(APIImplementation.generateOK(document));
        });
    };

    /**
     * @swagger
     * path: /documents/{collection}/{document_id}
     * operations:
     *   -  httpMethod: DELETE
     *      summary: Delete the selected document of the selected collection
     *      notes: Returns success or an error
     *      nickname: deleteDocument
     *      consumes:
     *        - application/json
     *      parameters:
     *        - name: collection
     *          description: The collection name
     *          paramType: path
     *          required: true
     *          dataType: string
     *        - name: document_id
     *          description: The document id
     *          paramType: path
     *          required: true
     *          dataType: string
     */
    public deleteDocument(req: express.Request, res: express.Response) {
        if (!req.params.collection) {
            return res.json(APIImplementation.generateFail("parameter collection not found"));
        }
        if (!req.params.document_id) {
            return res.json(APIImplementation.generateFail("parameter document_id not found"));
        }
        documents.delete(req.params.collection, req.user, req.params.document_id, (err) => {
            if (err) return res.json(APIImplementation.generateFail(err));
            return res.json(APIImplementation.generateSuccess(true));
        });
    };


    /**
     * @swagger
     * path: /documents/{collection}/{document_id}/permissions
     * operations:
     *   -  httpMethod: PUT
     *      summary: Update the permissions of the selected document of the selected collection
     *      notes: Returns the document or an error
     *      nickname: setPermission
     *      consumes:
     *        - application/json
     *      parameters:
     *        - name: collection
     *          description: The collection name
     *          paramType: path
     *          required: true
     *          dataType: string
     *        - name: document_id
     *          description: The document id
     *          paramType: path
     *          required: true
     *          dataType: string
     *        - name: document
     *          description: The permissions object
     *          paramType: body
     *          required: true
     *          dataType: json
     */
    public setPermission(req: express.Request, res: express.Response) {
        if (!req.params.collection) {
            return res.json(APIImplementation.generateFail("parameter collection not found"));
        }
        if (!req.params.document_id) {
            return res.json(APIImplementation.generateFail("parameter document_id not found"));
        }
        var permission = req.body;
        if (!permission) {
            return res.json(APIImplementation.generateFail("parameter permission not found"));
        }
        if (typeof permission.writable === 'undefined') {
            return res.json(APIImplementation.generateFail("the permission parameter must contains the writable attribute"));
        }
        if (typeof permission.readable === 'undefined') {
            return res.json(APIImplementation.generateFail("the permission parameter must contains the readable attribute"));
        }
        if (typeof permission.public_writable === 'undefined') {
            return res.json(APIImplementation.generateFail("the permission parameter must contains the public_writable attribute"));
        }
        if (typeof permission.public_readable === 'undefined') {
            return res.json(APIImplementation.generateFail("the permission parameter must contains the public_readable attribute"));
        }

        documents.setPermission(req.params.collection, req.user, req.params.document_id, permission.readable,
            permission.public_readable, permission.writable, permission.public_writable, (err, document) => {
            if (err) {
                return res.json(APIImplementation.generateFail(err));
            }
            return res.json(APIImplementation.generateOK(document));
        });
    };



}
