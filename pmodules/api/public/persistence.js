angular.module('Persistence', []).factory('Persistence', ['$http', function($http) {

    var baseUrl = '/api/';

    var get = function(url, callback) {
        $http.get(url).
        then(function(response) {
            if (!response && !response.data) return callback(response);
            if (response.data.result=='OK') return callback(null,response.data.data);
            callback(response.data.error);
        }, function(response) {
            callback(response);
        });
    }

    var post = function(url, body, callback) {
        $http.post(url,body).
        then(function(response) {
            if (!response && !response.data) return callback(response);
            if (response.data.result=='OK') return callback(null,response.data.data);
            callback(response.data.error);
        }, function(response) {
            callback(response);
        });
    }

    var put = function(url, body, callback) {
        $http.put(url,body).
        then(function(response) {
            if (!response && !response.data) return callback(response);
            if (response.data.result=='OK') return callback(null,response.data.data);
            callback(response.data.error);
        }, function(response) {
            callback(response);
        });
    }

    var _delete = function(url, callback) {
        $http.delete(url).
        then(function(response) {
            if (!response && !response.data) return callback(response);
            if (response.data.result=='OK') return callback(null,response.data.data);
            callback(response.data.error);
        }, function(response) {
            callback(response);
        });
    }


    var createCollection = function(collection, callback) {
        post(baseUrl+'collections', {name:collection} , callback)
    }

    var deleteCollection = function(collection, callback) {
        _delete(baseUrl+'collections/'+collection, callback);
    }

    var getCollections = function(callback) {
        get(baseUrl+'collections', callback);
    }

    var getDocuments = function(collection, where, callback) {
        if (where && typeof where === 'object' && (where.where || where.fields || where.limit || where.offset)) {
            return getDocumentsWithArguments(collection, where, callback);
        }
        var url = baseUrl+'documents/'+collection;
        if (where) {
            url += '?where=' + encodeURIComponent(JSON.stringify(where));
        }
        get(url, callback);
    }

    var getDocumentsWithArguments = function(collection, options, callback) {
        var url = baseUrl+'documents/'+collection+'?';
        if (options.where) {
            url += 'where=' + encodeURIComponent(JSON.stringify(options.where))+'&';
        }
        if (options.fields) {
            url += 'fields=' + options.fields+'&';
        }
        if (options.limit) {
            url += 'limit=' + options.limit+'&';
        }
        if (options.offset) {
            url += 'offset=' + options.offset+'&';
        }
        get(url, callback);
    }


    var createDocument = function(collection, doc, callback) {
        var url = baseUrl+'documents/'+collection;
        post(url, doc, callback);
    }

    var getDocumentByID = function(collection, id, callback) {
        var url = baseUrl+'documents/'+collection+'/'+id;
        get(url, callback);
    }

    var saveDocument = function(collection, document, callback) {
        var url = baseUrl+'documents/'+collection+'/'+document._id;
        put(url, document._payload, callback);
    }

    var deleteDocument = function(collection, id, callback) {
        var url = baseUrl+'documents/'+collection+'/'+id;
        _delete(url, callback);
    }

    var setPermisison = function(collection, id, readable, public_readable, writable, public_writable, callback) {
        var url = baseUrl+'documents/'+collection+'/'+id+'/permissions';
        var body = {
            public_writable: public_writable,
            public_readable: public_readable,
            writable: writable,
            readable: readable
        };
        put(url, body, callback);

    }


    return {
        createCollection: createCollection,
        deleteCollection: deleteCollection,
        getCollections: getCollections,
        getDocuments: getDocuments,
        createDocument: createDocument,
        getDocumentByID: getDocumentByID,
        saveDocument: saveDocument,
        deleteDocument: deleteDocument,
        setPermisison: setPermisison,
    }


}]);
