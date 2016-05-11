cmsApp.factory('Persistence', ['$http', '$rootScope', function($http, $rootScope) {

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


    var getCollections = function(callback) {
        get(baseUrl+'collections', callback);
    }

    var getDocuments = function(collection, where, callback) {
        var url = baseUrl+'documents/'+collection;
        if (where) {
            url += '?where=' + encodeURIComponent(JSON.stringify(where));
        }
        get(url, callback);
    }


    var createDocument = function(collection, doc, callback) {
        var url = baseUrl+'document/'+collection;
        post(url, doc, callback);
    }

    var getDocumentByID = function(collection, id, callback) {
        var url = baseUrl+'document/'+collection+'/'+id;
        get(url, callback);
    }

    var saveDocument = function(collection, document, callback) {
        var url = baseUrl+'document/'+collection+'/'+document._id;
        put(url, document._payload, callback);
    }

    var deleteDocument = function(collection, id, callback) {
        var url = baseUrl+'document/'+collection+'/'+id;
        _delete(url, callback);
    }

    var setPermisison = function(collection, id, readable, public_readable, writable, public_writable, callback) {
        var url = baseUrl+'document/permissions/'+collection+'/'+id;
        var body = {
            public_writable: public_writable,
            public_readable: public_readable,
            writable: writable,
            readable: readable
        };
        put(url, body, callback);

    }


    return {
        getCollections: getCollections,
        getDocuments: getDocuments,
        createDocument: createDocument,
        getDocumentByID: getDocumentByID,
        saveDocument: saveDocument,
        deleteDocument: deleteDocument,
        setPermisison: setPermisison,
    }


}]);
