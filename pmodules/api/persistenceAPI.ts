import collection = require('./models/collection');
import __collections = require('./libs/collections');
var collections = __collections.Collections.get();
import document = require('./models/document');
import __documents = require('./libs/documents');
var documents = __documents.Documents.get();
import user = require('./../users/models/user');


/**
 * getCollections - returns the list of available collections.
 *
 * @param  {type} callback:     standard callback function, with parameters err (if any) and the array of available collections
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
 * createCollection - create a new collection with the specified name. It is necessary to specify the user that perform the action.
 *
 * @param  {type} name:string                        the name of the new collection
 * @param  {type} _user:user.User                    the user that creates the collection
 * @param  {type} callback:                          standard callback function, with the parameters err (if any) and the new collection.
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
 * deleteCollection - delete the collection with the specified name
 *
 * @param  {type} name:string       the name of the collection to delete
 * @param  {type} callback:         standard callback function, with the parameters err (if any)
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
 * searchDocument - Retrieve documents of the specified collection
 *
 * @param  {type} collectionName:string           the collection name
 * @param  {type} where:any                       the where clause to select documents, following mongodb conventions
 * @param  {type} fields:string                   A list of fields to return, separated by comma (null or empty means get everything)
 * @param  {type} pagination:any                  An object containing two property: limit, indicating the maximum number of elements to return and offset, indicating the number of elements to skip starting from the first. If null, all documents will be returned
 * @param  {type} _user:user.User                 the user that perform the operation
 * @param  {type} callback:(err:any               standard callback function, with the err argument (if any) and retrieving the array of Document
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
 * getDocument - Retrieve the selected document of the selected collection
 *
 * @param  {type} collectionName:string        the name of the collection
 * @param  {type} document_id:string           the id of the document to retrieve
 * @param  {type} _user:user.User              the user performing the operation
 * @param  {type} callback:(err:any            standard callback function, with err argument (if any) and the retrieved document.
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
 * @param  {type} collectionName:string        the name of the collection
 * @param  {type} doc:any                      the object to persist
 * @param  {type} _user:user.User              the user that performs the operation
 * @param  {type} callback:(err:any            standard callback, with err (if any) argument and the new document
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
 * @param  {type} collectionName:string        the name of the collection
 * @param  {type} document_id:string           the id of the document
 * @param  {type} doc:any                      the updated version of the document (only the _payload!)
 * @param  {type} _user:user.User              the user performing the action
 * @param  {type} callback:                    stndard callback, with err (if any) argument, and the updated version of the document.
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
 * @param  {type} collectionName:string the name of the collection
 * @param  {type} document_id:string    the id of the document to remove
 * @param  {type} _user:user.User       the user that performs the action
 * @param  {type} callback:             standard callback function, with the err (if any) argumet.
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
 * @param  {type} collectionName: string the name of the collection
 * @param  {type} document_id:string     the id of the document to edit
 * @param  {type} readable               an array of groups id that can read the document
 * @param  {type} publicReadable:boolean if true, the document is public readable
 * @param  {type} writable               an array of groups id that can write the document
 * @param  {type} publicWritable:boolean if true, the document is public writable
 * @param  {type} _user: user.User       the user performing the operation
 * @param  {type} callback:              standard callback, with err argument (if any) and the modified document

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
