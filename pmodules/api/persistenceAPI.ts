/**
 * API for the persistence layer module. This API is intended to be used internally by other server-side modules.
 *
 * @module persistenceAPI
 * @inner
 */

import collection = require('./models/collection');
import __collections = require('./libs/collections');
var collections = __collections.Collections.get();
import document = require('./models/document');
import __documents = require('./libs/documents');
var documents = __documents.Documents.get();
import user = require('./../users/models/user');



/**
 * Callback returning an error and an array of available collections
 * @callback collectionsCallback
 * @param {any} err                                 the error, if any
 * @param {collection.Collection[]} _collections    the array of available collections
 */

/**
 * getCollections - returns the list of available collections.
 *
 * @param  {collectionsCallback} callback     standard callback function, with parameters err (if any) and the array of available collections
 */
export function getCollections(callback: (err: any, _collections?: collection.Collection[]) => void): void {
    collections.getAll((err, _collections) => {
        if (err) {
            return callback(err);
        }
        return callback(null, _collections);
    });
}


/**
 * Callback returning an error and a collection
 * @callback collectionCallback
 * @param {any} err                                 the error, if any
 * @param {collection.Collection} _collection       the collection
 */

/**
 * createCollection - create a new collection with the specified name. It is necessary to specify the user that perform the action.
 *
 * @param {string} name                       the name of the new collection
 * @param {user.User} _user                   the user that creates the collection
 * @param {collectionCallback} callback       standard callback function, with the parameters err (if any) and the new collection.
 */
export function createCollection(name: string, _user: user.User, callback: (err: any, _collection?: collection.Collection) => void): void {
    if (!name) {
        return callback("parameter name not found");
    }
    collections.create(name, _user, (err, collection) => {
        if (err) {
            return callback(err);
        }
        return callback(null, collection);
    });
}


/**
 * Callback returning an error if any
 * @callback errorCallback
 * @param {any} err                                 the error, if any
 */

/**
 * deleteCollection - delete the collection with the specified name
 *
 * @param  {string} name                the name of the collection to delete
 * @param  {errorCallback} callback     standard callback function, with the parameters err (if any)
 */
export function deleteCollection(name: string, callback: (err: any) => void): void {
    if (!name) {
        return callback("parameter name not found");
    }
    collections.delete(name, (err, collection) => {
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
}



/**
 * Callback returning an error and an array of documents
 * @callback documentsCallback
 * @param {any} err                                 the error, if any
 * @param {document.Document[]} _documents          the array of documents
 */

/**
 * searchDocuments - Retrieve documents of the specified collection
 *
 * It is possible to specify:
 *
 * 1. a where clause, in order to filter the results and to return only the needed documents;
 * 2. the fields to retrieve, performing a projection;
 * 3. a pagination creteria, in order to retrieve only a part of the results.
 *
 *
 * Example of a pagination object:
 *
 * ```javascript
 * {
 *     limit: 20,
 *     offset: 0
 * }
 * ```
 * @param  {string} collectionName           the collection name
 * @param  {any} where                       the where clause to select documents, following mongodb conventions
 * @param  {string} fields                   A list of fields to return, separated by comma (null or empty means get everything)
 * @param  {any} pagination                  An object containing two property: limit, indicating the maximum number of elements to return and offset, indicating the number of elements to skip starting from the first. If null, all documents will be returned
 * @param  {Number} pagination.limit         maximum number of elements to return
 * @param  {Number} pagination.offser        number of elements to skip starting from the first
 * @param  {user.User} _user                 the user that perform the operation
 * @param  {documentsCallback} callback      standard callback function, with the err argument (if any) and retrieving the array of Document
 */
export function searchDocuments(collectionName: string, where: any, fields: string, pagination: any, _user: user.User, callback: (err: any, _documents?: document.Document[]) => void): void {
    if (!collectionName) {
        return callback("parameter collection not found");
    }
    documents.search(collectionName, _user, where, fields, pagination, (err, docs) => {
        if (err) {
            return callback(err);
        }
        return callback(null, docs);
    });
};



/**
 * Callback returning an error and a document
 * @callback documentCallback
 * @param {any} err                              the error, if any
 * @param {document.Document} _document          the document
 */

/**
 * getDocument - Retrieve the selected document of the selected collection
 *
 * @param  {string} collectionName              the name of the collection
 * @param  {string} document_id                 the id of the document to retrieve
 * @param  {user.User} _user                    the user performing the operation
 * @param  {documentCallback} callback          standard callback function, with err argument (if any) and the retrieved document.
 */
export function getDocument(collectionName: string, document_id: string, _user: user.User, callback: (err: any, _document?: document.Document) => void): void {
    if (!collectionName) {
        return callback("parameter collection not found");
    }
    if (!document_id) {
        return callback("parameter document_id not found");
    }
    documents.getDocument(collectionName, _user, document_id, (err, document) => {
        if (err) {
            return callback(err);
        }
        return callback(null, document);
    });
}


/**
 * createDocument - create a new document, saving the selected object
 *
 * @param  {string} collectionName          the name of the collection
 * @param  {any} doc                        the object to persist
 * @param  {user.User} _user                the user that performs the operation
 * @param  {documentCallback} callback      standard callback, with err (if any) argument and the new document
 */
export function createDocument(collectionName: string, doc: any, _user: user.User, callback: (err: any, _document?: document.Document) => void) {
    if (!collectionName) {
        return callback("parameter collection not found");
    }

    documents.create(collectionName, _user, doc, (err, document) => {
        if (err) {
            return callback(err);
        }
        return callback(null, document);
    });
}


/**
 * updateDocument - save the modification on an existing document
 *
 * @param  {string} collectionName           the name of the collection
 * @param  {string} document_id              the id of the document
 * @param  {any} doc:any                     the updated version of the document (only the _payload!)
 * @param  {user.User} _user                 the user performing the action
 * @param  {documentCallback} callback       stndard callback, with err (if any) argument, and the updated version of the document.
 */
export function updateDocument(collectionName: string, document_id: string, doc: any, _user: user.User, callback: (err: any, _document?: document.Document) => void) {
    if (!collectionName) {
        return callback("parameter collection not found");
    }
    if (!document_id) {
        return callback("parameter document_id not found");
    }
    documents.update(collectionName, _user, document_id, doc, (err, document) => {
        if (err) {
            return callback(err);
        }
        return callback(null, document);
    });
}

/**
 * deleteDocument - delete the specified document inside the specified collection
 *
 * @param  {string} collectionName              the name of the collection
 * @param  {string} document_id                 the id of the document to remove
 * @param  {user.User} _user                    the user that performs the action
 * @param  {errorCallback} callback             standard callback function, with the err (if any) argumet.
 */
export function deleteDocument(collectionName: string, document_id: string, _user: user.User, callback: (err: any) => void): void {
    if (!collectionName) {
        return callback("parameter collection not found");
    }
    if (!document_id) {
        return callback("parameter document_id not found");
    }
    documents.delete(collectionName, _user, document_id, (err) => {
        if (err) return callback(err);
        return callback(null);
    });
};


/**
 * setDocumentPermission - set the permission of the selected document
 *
 * @param  {string} collectionName              the name of the collection
 * @param  {string} document_id                 the id of the document to edit
 * @param  {Array} readable                     an array of groups id that can read the document
 * @param  {boolean} publicReadable             if true, the document is public readable
 * @param  {Array} writable                     an array of groups id that can write the document
 * @param  {boolean} publicWritable             if true, the document is public writable
 * @param  {user.User} _user                    the user performing the operation
 * @param  {documentCallback} callback          standard callback, with err argument (if any) and the modified document
 * 
 */
export function setDocumentPermission(collectionName: string, document_id, readable, publicReadable:boolean, writable, publicWritable:boolean, _user: user.User, callback: (err:any, doc?)=>void):void {
    if (!collectionName) {
        return callback("parameter collection not found");
    }
    if (!document_id) {
        return callback("parameter document_id not found");
    }

    if (typeof writable === 'undefined') {
        return callback("the permission parameter must contains the writable attribute");
    }
    if (typeof readable === 'undefined') {
        return callback("the permission parameter must contains the readable attribute");
    }
    if (typeof publicWritable === 'undefined') {
        return callback("the permission parameter must contains the public_writable attribute");
    }
    if (typeof publicReadable === 'undefined') {
        return callback("the permission parameter must contains the public_readable attribute");
    }

    documents.setPermission(collectionName, _user, document_id, readable, publicReadable, writable, publicWritable, (err, document) => {
        if (err) {
            return callback(err);
        }
        return callback(null, document);
    });
}
