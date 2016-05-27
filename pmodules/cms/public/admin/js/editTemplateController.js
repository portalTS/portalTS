cmsApp.controller('editTemplateController', function($scope, $filter, $timeout, $location, $stateParams, $uibModal, $http, Persistence) {

    $scope.aceConfig = {
        mode:'html',
        require: ['ace/ext/language_tools'],
        onLoad: function (_editor) { _editor.$blockScrolling = Infinity; },
        advanced: {
            enableSnippets: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        }
    };

    $scope.showMenu.show = false;

    $scope.loading = true;
    $scope.doc = {
        _payload: {
            body: "",
            name: $stateParams.id,
            value: $stateParams.value
        }
    };


    $scope.load = function() {
        Persistence.getDocuments('cms_templates',{value:$stateParams.value}, function(err, docs) {
            if (err) {
                Persistence.createCollection('cms_templates', function(err, results) {
                    $scope.load();
                });
                return;
            }
            if (docs && docs.length>0) {
                $scope.doc = docs[0];
                $scope.loading = false;
            }
            else {
                $http.get('/cms/template/'+$stateParams.value).then(function(d) {
                    $scope.doc._payload.body = d.data;
                    $scope.loading = false;
                }, function() {
                    $scope.loading = false;
                });
            }
        });
    }
    $scope.load();

    $scope.cleaningMsg = function(msg) {
        $scope.msg = msg;
        $timeout(function() {
            $scope.msg = null;
        },1500);
    }

    $scope.ok = function() {
        $scope.msg = "Saving...";
        var cb = function(err, ris) {
            if (err) {
                $scope.msg = err;
                return;
            }
            $scope.doc = ris;
            console.log(ris);
            $scope.cleaningMsg("Page saved!");
        }
        if ($scope.doc._id) {
            Persistence.saveDocument('cms_templates', $scope.doc, cb);
        } else {
            Persistence.createDocument('cms_templates', $scope.doc._payload, function(err, doc) {
                if (err || !doc) return cb(err, doc);
                Persistence.setPermission('cms_templates', doc._id, doc._readable, true, doc._writable, doc._public_writable, cb);
            });
        }
    }

    document.getElementById("templates-panel").click();

});
