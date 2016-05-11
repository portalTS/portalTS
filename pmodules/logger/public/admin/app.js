var app = angular.module('loggerAdmin',['ui.bootstrap', 'angular-loading-bar']);

app.directive('mdlUpgrade', function($timeout){

    return {
      restrict: 'A',
      compile: function(){
        return {
          post: function postLink(scope, element){
            $timeout(function(){
              componentHandler.upgradeElements(element[0]);
            }, 0);
          }
        };
      },
    };

  });

app.controller('mainController', function($scope, $filter, $timeout, $http) {

    $scope.config = {
        itemsPerPage: 50,
        fillLastPage: false
    };

    $scope.logs = []

    $scope.count = 0;
    $scope.limit = 100;
    $scope.skip = 0;
    $scope.page = 0;
    $scope.pages = [];
    $scope.filter = {};
    $scope.filter.level = {};
    $scope.filter.level.debug = false;
    $scope.filter.level.info = true;
    $scope.filter.level.warn = true;
    $scope.filter.level.error = true;
    $scope.filter.timeinterval = "";
    $scope.filter.message = "";

    $scope.load = function() {
        $scope.skip = $scope.page * $scope.limit;
        $http.get('/logger/admin/logs?limit='+$scope.limit+'&skip='+$scope.skip+'&filter='+JSON.stringify($scope.filter)).then(function(response) {
            $scope.logs = response.data;
            var totalPages = $scope.count/$scope.limit;
            totalPages++;
            $scope.pages = [];
            for (var i = 0; i<totalPages; i++) $scope.pages.push({
                index: i+1
            });
        }, function(errorResponse) {
            console.log(errorResponse);
        });
    };

    $scope.getCount = function(callback) {
        $http.get('/logger/admin/logs?count=true&filter='+JSON.stringify($scope.filter)).then(function(response) {
            callback(response.data.count);
        }, function(errorResponse) {
            console.log(errorResponse);
        });
    };

    $scope.getCount(function(c) {
        $scope.count = c;
        console.log($scope.count);
        $scope.load();
    });


    $scope.goTo = function(index) {
        $scope.page = index;
        $scope.load();
    }

    $scope.openInfo = function(log) {
        $scope.modalText = log.message;
        $scope.modalMeta = log.meta;
        $scope.modalLevel = log.level;
        $scope.modalTime = log.timestamp;
        $timeout(function() {
            $('#myModal').appendTo("body").modal({});
        }, 0);
    }

    $scope.showSearch = false;
    $scope.toggleSearch = function() {
        $scope.showSearch = !$scope.showSearch;
    }



    $scope.performFiltering = function() {
        $scope.getCount(function(c) {
            $scope.count = c;
            console.log($scope.count);
            $scope.load();
        });
    }


});
