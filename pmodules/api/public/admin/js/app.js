var app = angular.module('app', ['ngRoute', 'ngMaterial', 'jsonFormatter', 'Persistence']);

app.config(function($mdThemingProvider, $routeProvider, $locationProvider) {

    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('red');

    $routeProvider
        .when('/', {
            templateUrl: '/api/admin/js/templates/home.html',
            controller: 'homeController'
        })
        .when('/swagger', {
            templateUrl: '/api/admin/js/templates/swagger.html',
            controller: 'swaggerController'
        })
        .when('/explorer', {
            templateUrl: '/api/admin/js/templates/explorer.html',
            controller: 'explorerController'
        })
        .otherwise('/');

});


app.controller('homeController', function($scope, $location) {
    $scope.openExplorer = function() {
        $location.path('/explorer');
    };
    $scope.openSwagger = function() {
        $location.path('/swagger');
    };
});

app.controller('swaggerController', function($scope, $location) {});
app.controller('explorerController', function($scope, $location, $http, $filter, $mdDialog, $mdMedia, $timeout, Persistence) {

    $scope.items = [];
    $scope.displayedItems = [];
    $scope.loading = false;

    $scope.loadCollections = function() {
        $scope.navBarTitle = "Collections";
        $scope.loading = true;
        $scope.collectionName = null;
        Persistence.getCollections(function(err, colls) {
            $scope.items = colls;
            $scope.displayedItems = [];
            for (var i = 0; i < $scope.items.length; i++) {
                var title = $scope.items[i].name;
                if (title.indexOf("pmodules__persistence__") == 0) title = title.substring("pmodules__persistence__".length);
                $scope.displayedItems.push({
                    _id: $scope.items[i]._id,
                    title: title,
                    text: 'Created at ' + $filter('date')($scope.items[i].created_at, 'medium'),
                    info: true
                });
            }
            $scope.loading = false;
            //$('#explorer').scrollTop(0);
            $scope.scrollTop();
        });
    }


    $scope.info = function(item, ev, index) {
        var element = null;
        for (var i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i]._id == item._id) {
                element = $scope.items[i];
                break;
            }
        }
        var collectionName = $scope.collectionName;

        function DialogController($scope, $mdDialog, $http) {
            $scope.item = item;
            $scope.index = index;
            $scope.all = element;
            $scope.original = element;
            $scope.permissionModfied = false;
            $scope.editMode = false;
            $scope.msg = null;
            $scope.hide = function() {
                $mdDialog.hide({
                    item: $scope.item,
                    all: $scope.all
                });
            };
            $scope.getUserInfo = function(userId, callback) {
                $http.get('/users/admin/api/user/' + userId).
                then(function(response) {
                    if (!response && !response.data) return callback(response);
                    if (response.data.success == true) return callback(null, response.data.user);
                    callback(response.data.error);
                }, function(response) {
                    callback(response);
                });
            }
            $scope.printGroups = function() {
                if (!$scope.u) return "";
                var s = "";
                for (var i = 0; i < $scope.u.groups.length; i++) {
                    s += $scope.u.groups[i].name + " ";
                }
                s = s.trim();
                return s;
            }
            if (!item.info) {
                $scope.loading = true;
                $scope.original = $scope.original._payload;
                $scope.modifiedPayload = {};
                $scope.modifiedPayload.txt = JSON.stringify($scope.original, null, 4);
            } else {
                Persistence.getCollectionInfo($scope.item.title, function(err, res) {
                    $scope.stats = res;
                });
            }
            var u = element._author;
            if (!u) u = element.created_by;
            $scope.getUserInfo(u, function(err, u) {
                if (err) $scope.u = "Error :(";
                else if (!u) $scope.u = "Unavailable";
                else $scope.u = u;
                $scope.loading = false;
            });
            $http.get('/users/admin/api/groups/').
            then(function(response) {
                if (!response && !response.data) return;
                $scope.groups = response.data;
            }, function(response) {
                callback(response);
            });
            $scope.querySearch = function(query) {
                var results = [];
                var lowercaseQuery = query.toLowerCase();
                for (var i = 0; i < $scope.groups.length; i++) {
                    if ($scope.groups[i].name.toLowerCase().indexOf(lowercaseQuery) != -1) results.push($scope.groups[i]._id);
                }
                return results;
            }
            $scope.getGroupName = function(id) {
                if (!$scope.groups) return "Loading...";
                for (var i = 0; i < $scope.groups.length; i++) {
                    if ($scope.groups[i]._id == id) return $scope.groups[i].name;
                }
                return "";
            }
            $scope.save = function() {
                if ($scope.permissionModfied) {
                    $scope.msg = "Saving...";
                    Persistence.setPermission(collectionName, $scope.all._id, $scope.all._readable, $scope.all._public_readable, $scope.all._writable, $scope.all._public_writable, function(err, res) {
                        if (err) {
                            $scope.msg = "Error saving permission :(";
                            console.log(err);
                            return;
                        }
                        $scope.msg = null;
                        $scope.regenerateElement(res);
                    });
                }
            }
            $scope.saveJson = function() {
                $scope.msg = "Saving...";
                try {
                    $scope.all._payload = JSON.parse($scope.modifiedPayload.txt);
                } catch (e) {
                    $scope.msg = "Invalid JSON!";
                    return;
                }
                Persistence.saveDocument(collectionName, $scope.all, function(err, res) {
                    if (err) {
                        $scope.msg = "Error saving :(";
                        return;
                    }
                    $scope.msg = null;
                    $scope.editMode = false;
                    $scope.regenerateElement(res);
                });
            }
            $scope.regenerateElement = function(res) {
                $scope.all = res;
                $scope.original = $scope.all._payload;
            }
            $scope.performDelete = function() {
                $scope.msg = "Removing...";
                if (!collectionName) {
                    Persistence.deleteCollection($scope.item.title, function(err, res) {
                        if (err) {
                            $scope.msg = "Error removing :(";
                            return;
                        }
                        $mdDialog.hide("remove");
                    });
                }
                Persistence.deleteDocument(collectionName, $scope.all._id, function(err, res) {
                    if (err) {
                        $scope.msg = "Error removing :(";
                        return;
                    }
                    $mdDialog.hide("remove");
                });
            }
        }


        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
        $mdDialog.show({
            controller: DialogController,
            templateUrl: '/api/admin/js/templates/info-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            escapeToClose: false,
            focusOnOpen: false,
            fullscreen: useFullScreen
        }).then(function(o) {
            if (o === "remove") {
                $scope.items.splice(item.index, 1);
                $scope.displayedItems.splice(index, 1);
                return;
            }
            var _item = o.item;
            var all = o.all;
            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i]._id == all._id) {
                    $scope.items[i] = all;
                    break;
                }
            }
            $scope.displayedItems[index] = _item;
        }, function() {})
    }


    $scope.details = function(item, ev, index) {
        item.new = false;
        if (!item.info) return $scope.info(item, ev, index);
        $scope.loading = true;
        var original = $scope.items[item.index];
        Persistence.getDocuments(item.title, {}, function(err, docs) {
            if (err) console.log(err);
            $scope.items = docs;
            $scope.displayedItems = [];
            for (var i = 0; i < $scope.items.length; i++) {
                var title = $scope.items[i]._id;
                //if (title.indexOf("pmodules__persistence__")==0) title = title.substring("pmodules__persistence__".length);
                $scope.displayedItems.push({
                    _id: $scope.items[i]._id,
                    title: title,
                    text: 'Created at ' + $filter('date')($scope.items[i]._created_at, 'medium'),
                    info: false
                });
            }
            $scope.loading = false;
            $scope.navBarTitle = "Collection " + item.title;
            $scope.collectionName = item.title;
            $scope.scrollTop();
        });
    }

    $scope.createNew = function(ev) {
        if (!$scope.collectionName) return $scope.createCollection(ev);
        var obj = {};
        Persistence.createDocument($scope.collectionName, obj, function(err, res) {
            if (err) {
                console.log(err);
                return;
            }
            $scope.items.push(res);
            $scope.displayedItems.push({
                _id: res._id,
                title: res._id,
                text: 'Created at ' + $filter('date')(res._created_at, 'medium'),
                info: false,
                new: true
            });
            $timeout(function() {
                document.getElementById("item-" + res._id).scrollIntoView();
            }, 500);

        });
    }

    $scope.createCollection = function(ev) {
        var confirm = $mdDialog.prompt()
            .title('New Collection')
            .textContent('Insert the collection name')
            .placeholder('New collection')
            .ariaLabel('New collection name')
            .parent(angular.element(document.body))
            .targetEvent(ev)
            .ok('Create')
            .cancel('Cancel');
        $mdDialog.show(confirm).then(function(result) {
            Persistence.createCollection(result, function(err, collection) {
                if (err) console.log(err);
                $scope.items.push(collection);
                var title = collection.name;
                if (title.indexOf("pmodules__persistence__") == 0) title = title.substring("pmodules__persistence__".length);
                $scope.displayedItems.push({
                    _id: collection._id,
                    title: title,
                    text: 'Created at ' + $filter('date')(collection.created_at, 'medium'),
                    info: true,
                    new: true
                });
                $timeout(function() {
                    document.getElementById("item-" + collection._id).scrollIntoView();
                }, 500);
            });
        }, function() {

        });
    }


    $scope.back = function() {
        if ($scope.collectionName) {
            $scope.loadCollections();
            return;
        }
        $location.path('/');
    }

    $scope.loadCollections();


    $scope.scrollTop = function() {
        document.getElementById("explorer").scrollIntoView();
    }


});
