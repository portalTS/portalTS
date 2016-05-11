cmsApp.controller('pagesController', function($scope, $filter, $timeout, $location, $uibModal, $http, Persistence) {
    $scope.showMenu.show = true;
    $scope.loading = true;
    $scope.list = [];
    $scope.filteredList = [];
    $scope.msg = null;

    $scope.updateFilteredList = function() {
        $scope.filteredList = $filter("filter")($scope.list, $scope.query);
    };

    $scope.load = function() {
        Persistence.getDocuments('cms_pages', null, function(err, results) {
            if (err) {
                Persistence.createCollection('cms_pages', function(err, results) {
                    if (err) {
                        $scope.msg = "Error loading pages!";
                        return;
                    }
                    $scope.load();
                });
            }
            $scope.filteredList = $scope.list = results;
            console.log(results);
            $scope.loading = false;
        });
    };

    $scope.config = {
        itemsPerPage: 5,
        fillLastPage: false
    };

    $scope.load();


    $scope.groups = [];

    $http.get('/users/admin/api/groups')
    .then(function(response) {
        if (!response && !response.data) return;
        if (response.data) {
            $scope.groups = response.data;
        }
    }, function(response) {
        console.log(response);
    });


    $scope.addPage = function() {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'addPage.html',
            controller: 'addPageController',
            backdrop: 'static',
            keyboard: false
        });

        modalInstance.result.then(function(reload) {
            if (reload) $scope.load();
        }, function() {});

    };

    $scope.editCode = function(page) {
        $location.path('/editPage/'+page._id);
    }


    $scope.editPage = function(page) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'editPage.html',
            controller: 'editPageInfoController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                page: function() {
                    return page;
                }
            }
        });

        modalInstance.result.then(function(reload) {
            if (reload) $scope.load();
        }, function() {});

    };

    $scope.permissions = function(page) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'permissionPage.html',
            controller: 'permissionPageController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                page: function() {
                    return page;
                },
                groups: function() {
                    return $scope.groups;
                }
            }
        });

        modalInstance.result.then(function(reload) {
            if (reload) $scope.load();
        }, function() {});
    }

    $scope.delete = function(page) {
        $scope.msg = "Deleting...";
        Persistence.deleteDocument('cms_pages', page._id, function(err) {
            if (err) {
                $scope.msg = "Error deleting page!!! :(";
                $timeout(function() {
                    $scope.msg = null;
                }, 4000);
            }
            else {
                $scope.msg = "Page deleted.";
                $timeout(function() {
                    $scope.msg = null;
                }, 2000);
                $scope.load();
            }
        });
    }


});

cmsApp.controller('addPageController', function($scope, $filter, $timeout, $location, $uibModal, $uibModalInstance, Persistence) {

    $scope.ok = function() {
        if (!$scope.title || !$scope.url) return;
        $scope.msg = "Creating the new page...";
        $scope.add();
    };

    $scope.add = function() {

        var doc = {
            url: $scope.url,
            title: $scope.title,
            body: ''
        };

        Persistence.createDocument('cms_pages', doc, function(err, result) {
            if (err) {
                console.log(err);
                $scope.msg = "Error creating the new page :(";
                return;
            }
            $uibModalInstance.close(true);
            return;
        });

    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };


});

cmsApp.controller('editPageInfoController', function($scope, $filter, $timeout, $location, $uibModal, $uibModalInstance, Persistence, page) {

    $scope.doc = page;
    $scope.title = $scope.doc._payload.title;
    $scope.url = $scope.doc._payload.url;

    $scope.ok = function() {
        if (!$scope.title || !$scope.url) return;
        $scope.msg = "Creating the new page...";
        $scope.add();
    };

    $scope.add = function() {

        var doc = {
            url: $scope.url,
            title: $scope.title,
            body: ''
        };

        $scope.doc._payload.title = $scope.title;
        $scope.doc._payload.url = $scope.url;

        Persistence.saveDocument('cms_pages', $scope.doc, function(err, ris) {
            if (err) {
                console.log(err);
                $scope.msg = "Error creating the new page :(";
                return;
            }
            $uibModalInstance.close(true);
            return;
        });

    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };



});



cmsApp.controller('permissionPageController', function($scope, $filter, $timeout, $location, $uibModal, $uibModalInstance, Persistence, page, groups) {

    $scope.doc = page;
    $scope.groups = groups;
    $scope.selectedGroups = [];
    for (var i = 0; i<$scope.groups.length; i++) {
        var index = -1;
        for (var k = 0; k<$scope.doc._readable.length; k++) {
            if ($scope.doc._readable[k]==$scope.groups[i]._id) {
                index = k;
                break;
            }
        }
        if (index==-1) $scope.selectedGroups.push(false);
        else $scope.selectedGroups.push(true);
    }

    if ($scope.doc._public_readable) {
        $scope.access_type = 1;
    } else {
        $scope.access_type = 2;
    }


    $scope.ok = function() {
        $scope.msg = "Saving page permissions...";
        $scope.add();
    };

    $scope.add = function() {

        var writable = $scope.doc.writable;
        if (!writable) writable = [];
        var readable = [];
        console.log($scope.selectedGroups);
        for (var i=0; i<$scope.selectedGroups.length; i++) {
            if ($scope.selectedGroups[i]) {
                readable.push($scope.groups[i]._id);
            }
        }
        var public_writable = false;
        if ($scope.doc.public_writable) {
            public_writable = $scope.doc.public_writable;
        }
        var public_readable = false;
        if ($scope.access_type==1) public_readable = true;

        Persistence.setPermisison('cms_pages', $scope.doc._id, readable, public_readable, writable, public_writable, function(err, ris) {
            if (err) {
                console.log(err);
                $scope.msg = "Error updating page permissions :(";
                return;
            }
            $uibModalInstance.close(true);
            return;
        });

    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };



});
