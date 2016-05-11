var moduleName = "moduleTemplate";

var app = angular.module('moduleAdmin', ['ui.bootstrap', 'Persistence']);

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


app.controller('mainController', function($scope, $timeout, $http, Persistence) {

    $scope.moduleName = moduleName;

    $scope.pages = [];
    $scope.config = null;

    $scope.loading = true;

    $scope.groups = [];
    $http.get('/users/admin/api/groups')
    .then(function(response) {
        if (!response && !response.data) return;
        if (response.data) {
            $scope.groups = response.data;
            $http.get('/'+moduleName+'/api/save')
            .then(function(response) {
                if (!response && !response.data) return;
                if (response.data) {
                    $scope.data = response.data;
                    console.log($scope.data);
                    $scope.init();
                    $scope.loading = false;
                }
            }, function(response) {
                console.log(response);
            });
        }
    }, function(response) {
        console.log(response);
    });


    $scope.init = function() {
        $scope.selectedGroups = [];
        $scope.selectedInvisibleGroups = [];
        for (var i = 0; i<$scope.groups.length; i++) {
            var index = -1;
            for (var k = 0; k<$scope.data.groups.length; k++) {
                if ($scope.data.groups[k]==$scope.groups[i]._id) {
                    index = k;
                    break;
                }
            }
            if (index==-1) $scope.selectedGroups.push(false);
            else $scope.selectedGroups.push(true);
            index = -1;

        }

        if ($scope.data.isPublic) {
            $scope.access_type = 1;
        } else {
            $scope.access_type = 2;
        }
    }


    $scope.ok = function() {
        $scope.msg = "Saving permissions...";
        $scope.add();
    };

    $scope.add = function() {

        var readable = [];
        for (var i=0; i<$scope.selectedGroups.length; i++) {
            if ($scope.selectedGroups[i]) {
                readable.push($scope.groups[i]._id);
            }
        }
        var public_readable = false;
        if ($scope.access_type==1) public_readable = true;

        $scope.data.isPublic = public_readable;
        $scope.data.groups = readable;

        console.log($scope.data);
        if (!$scope.data.isPublic && $scope.data.groups.length==0) {
            $scope.msg = "You must select at least one group.";
            return;

        }

        $http.post('/'+moduleName+'/api/save', $scope.data).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.msg = null;
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.msg = "Error saving permissions";
        });




    };




});
