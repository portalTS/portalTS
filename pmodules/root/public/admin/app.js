var app = angular.module('rootAdmin', ['ui.bootstrap', 'Persistence']);

app.directive('mdlUpgrade', function($timeout) {

    return {
        restrict: 'A',
        compile: function() {
            return {
                post: function postLink(scope, element) {
                    $timeout(function() {
                        componentHandler.upgradeElements(element[0]);
                    }, 0);
                }
            };
        },
    };

});


app.controller('mainController', function($scope, $timeout, Persistence) {

    $scope.pages = [];
    $scope.config = null;

    $scope.loading = true;



    Persistence.getDocuments('root_config', {}, function(err, configs) {

        if (configs && configs[0]) {
            $scope.config = configs[0];
            $scope.redirect_type = $scope.config._payload.redirect_type;
            $scope.redirect_page = {
                val: $scope.config._payload.redirect_page
            };
            $scope.url = $scope.config._payload.url;
        } else {
            $scope.redirect_page = {
                val: null
            };
        }

        Persistence.getDocuments('cms_pages', {}, function(err, pages) {
            $scope.pages = pages;
            $scope.loading = false;
        });
    });


    $scope.generateDoc = function() {
        var doc = {
            redirect_type: $scope.redirect_type,
            redirect_page: $scope.redirect_page.val,
            url: $scope.url
        };
        return doc;
    }


    $scope.ok = function() {
        if (!$scope.redirect_type) return;
        if ($scope.redirect_type == 1 && !$scope.redirect_page.val) return;
        if ($scope.redirect_type == 2 && !$scope.url) return;

        if ($scope.config) {
            $scope.config._payload = $scope.generateDoc();
            Persistence.saveDocument('root_config', $scope.config, function(err, d) {
                if (err) {
                    console.log(err);
                    $scope.msg = "Error saving configuration";
                    return;
                }
                $scope.msg = "Configuration saved!";
                console.log(d);
                $scope.config = d;
            });
        } else {
            var doc = $scope.generateDoc();
            Persistence.createCollection('root_config', function(err, d) {
                Persistence.createDocument('root_config', doc, function(err, config) {
                    if (err) {
                        $scope.msg = "Error saving configuration";
                    }
                    console.log(config);
                    $scope.config = config;
                    Persistence.setPermission('root_config', $scope.config._id, config._readable, true, config._writable, false, function(err, ris) {
                        if (err) {
                            console.log(err);
                            $scope.msg = "Error saving configuration";
                            return;
                        }
                        $scope.msg = "Configuration saved!";
                        console.log(ris);
                    });
                });
            });
    }
}


});
