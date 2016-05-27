cmsApp.controller('editPageController', function($scope, $filter, $timeout, $location, $uibModal, $stateParams, $http, Persistence) {

    $scope.showMenu.show = false;


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

    $scope.loading = true;
    $scope.doc = {};

    Persistence.getDocumentByID('cms_pages',$stateParams.id, function(err, doc) {
        $scope.doc = doc;
        $scope.loading = false;
    });



    $scope.headerCode = "";
    $http.get('/cms/preview/header')
    .then(function(response) {
        if (!response && !response.data) return;
        $scope.headerCode = response.data;
    }, function(response) {
        console.log(response);
    });


    $scope.getPreview = function() {
        var tmp = $scope.headerCode + ' ';
        if ($scope.doc._payload && $scope.doc._payload.body) {
            tmp += $scope.doc._payload.body;
        }
        return tmp;
    }




    $scope.cleaningMsg = function(msg) {
        $scope.msg = msg;
        $timeout(function() {
            $scope.msg = null;
        },1500);
    }

    $scope.ok = function() {
        if (!$scope.doc._payload.title) {
            $scope.msg = "You must enter the title";
            return;
        }
        if (!$scope.doc._payload.url) {
            $scope.msg = "You must enter the url";
            return;
        }
        $scope.msg = "Saving...";
        Persistence.saveDocument('cms_pages', $scope.doc, function(err, ris) {
            if (err) {
                $scope.msg = err;
                return;
            }
            $scope.doc = ris;
            console.log(ris);
            $scope.cleaningMsg("Page saved!");
        });
    }


});
