cmsApp.controller('menuController', function($scope, $filter, $timeout, $location, $uibModal, $http, Persistence) {
    $scope.showMenu.show = true;
    $scope.loading = true;
    $scope.list = [];
    $scope.filteredList = [];
    $scope.msg = null;

    $scope.updateFilteredList = function() {
        $scope.filteredList = $filter("filter")($scope.list, $scope.query);
    };

    $scope.load = function() {
        $scope.pages = [];
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
            $scope.pages = results;
            Persistence.getDocuments('cms_menu_items', null, function(err, results) {
                if (err) {
                    Persistence.createCollection('cms_menu_items', function(err, results) {
                        if (err) {
                            $scope.msg = "Error loading menu items!";
                            return;
                        }
                        $scope.load();
                    });
                }
                for (var i = 0; i<results.length; i++) {
                    var ext = results[i]._payload.external_url;
                    if (ext) {
                        results[i].url = ext;
                    } else {
                        for (var k = 0; k<$scope.pages.length; k++) {
                            if ($scope.pages[k]._payload.url==results[i]._payload.page_id) {
                                results[i].url = $scope.pages[k]._payload.title + " ("+$scope.pages[k]._payload.url+")";
                                break;
                            }
                        }
                    }
                    results[i].father = "";
                    if (results[i]._payload.father_id) {
                        for (var k = 0; k<results.length; k++) {
                            if (results[k]._id==results[i]._payload.father_id) {
                                results[i].father = results[k]._payload.title;
                                break;
                            }
                        }
                    }
                }
                $scope.filteredList = $scope.list = results;
                $scope.loading = false;
            });
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


    $scope.addMenu = function() {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'addMenu.html',
            controller: 'addMenuController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                pages: function() {
                    return $scope.pages;
                },
                editing: function() {
                    return false;
                },
                menu: function() {
                    return null;
                },
                menus: function() {
                    return $scope.list;
                },
            }
        });

        modalInstance.result.then(function(reload) {
            if (reload) $scope.load();
        }, function() {});

    };



    $scope.editMenu = function(menu) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'addMenu.html',
            controller: 'addMenuController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                pages: function() {
                    return $scope.pages;
                },
                editing: function() {
                    return true;
                },
                menu: function() {
                    return menu;
                },
                menus: function() {
                    return $scope.list;
                },
            }
        });

        modalInstance.result.then(function(reload) {
            if (reload) $scope.load();
        }, function() {});

    };

    $scope.delete = function(menu) {
        $scope.msg = "Deleting...";
        Persistence.deleteDocument('cms_menu_items', menu._id, function(err) {
            if (err) {
                $scope.msg = "Error deleting menu!!! :(";
                $timeout(function() {
                    $scope.msg = null;
                }, 4000);
            }
            else {
                $scope.msg = "Menu deleted.";
                $timeout(function() {
                    $scope.msg = null;
                }, 2000);
                $scope.load();
            }
        });
    }

    $scope.permissions = function(menu) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'permissionMenu.html',
            controller: 'permissionMenuController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                menu: function() {
                    return menu;
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

});


cmsApp.controller('addMenuController', function($scope, $filter, $timeout, $location, $uibModal, $uibModalInstance, Persistence, menu, pages, menus, editing) {

    $scope.pages = pages;
    $scope.editing = editing;
    $scope.menu = menu;
    $scope.menus = menus;

    if ($scope.editing) {
        $scope.popup_title = "Editing "+$scope.menu._payload.title;
        $scope.title = menu._payload.title;
        if (menu._payload.page_id) {
            $scope.url_type = 1;
            $scope.selectedPage = {
                val: menu._payload.page_id
            };
        } else {
            $scope.url_type = 2;
            $scope.selectedPage = {val:null};
            $scope.url = menu._payload.external_url;
        }
        if (menu._payload.father_id) {
            $scope.isSubmenu = true;
            $scope.fatherMenu = {
                val: menu._payload.father_id
            };
        } else {
            $scope.isSubmenu = false;
            $scope.fatherMenu = {val: null};
        }
        $scope.order = menu._payload.order;
    }
    else {
        $scope.popup_title = "New menu element";
        $scope.url_type = 1;
        $scope.selectedPage = {val:null};
        $scope.fatherMenu = {val:null};
        if (menus!=null && menus.length>0) $scope.order = menus.length+1;
        else $scope.order = 1;

    }


    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };


    $scope.ok = function() {
        if (!$scope.title) return;
        if (!$scope.order) return;
        if ($scope.url_type==2 && !$scope.url) return;
        if ($scope.url_type==1 && !$scope.selectedPage.val) return;

        if ($scope.editing) {
            $scope.msg = "Updating menu item...";
            $scope.performEditing();
        } else {
            $scope.msg = "Creating menu item...";
            $scope.performCreation();
        }
    }


    $scope.generateDocFromScope = function() {
        var doc = {
            title: $scope.title,
            order: $scope.order,
            page_id: $scope.selectedPage.val,
            external_url: $scope.url,
            father_id: $scope.fatherMenu.val,
            excluded_to: []
        };
        if ($scope.url_type==2) doc.page_id = null;
        if (!$scope.isSubmenu) doc.father_id = null;
        return doc;
    }

    $scope.performCreation = function() {
        var doc = $scope.generateDocFromScope();
        Persistence.createDocument('cms_menu_items', doc, function(err, res) {
            if (err) {
                console.log(err);
                $scope.msg = "Error creating menu item :(";
                return;
            }
            $uibModalInstance.close(true);
        });
    }

    $scope.performEditing = function() {
        var doc = $scope.generateDocFromScope();
        $scope.menu._payload = doc;
        Persistence.saveDocument('cms_menu_items', $scope.menu, function(err, res) {
            if (err) {
                console.log(err);
                $scope.msg = "Error updating menu item :(";
                return;
            }
            $uibModalInstance.close(true);
        });
    }

});



cmsApp.controller('permissionMenuController', function($scope, $filter, $timeout, $location, $uibModal, $uibModalInstance, Persistence, menu, groups) {

    $scope.doc = menu;
    $scope.groups = groups;
    $scope.selectedGroups = [];
    $scope.selectedInvisibleGroups = [];
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
        index = -1;
        for (var k = 0; k<$scope.doc._payload.excluded_to.length; k++) {
            if ($scope.doc._payload.excluded_to[k]==$scope.groups[i]._id) {
                index = k;
                break;
            }
        }
        if (index==-1) $scope.selectedInvisibleGroups.push(false);
        else $scope.selectedInvisibleGroups.push(true);

    }

    if ($scope.doc._public_readable) {
        $scope.access_type = 1;
    } else {
        $scope.access_type = 2;
    }


    $scope.ok = function() {
        $scope.msg = "Saving menu permissions...";
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

        $scope.doc._payload.excluded_to = [];
        for (var i=0; i<$scope.selectedGroups.length; i++) {
            if ($scope.selectedInvisibleGroups[i]) {
                $scope.doc._payload.excluded_to.push($scope.groups[i]._id);
            }
        }


        Persistence.setPermisison('cms_menu_items', $scope.doc._id, readable, public_readable, writable, public_writable, function(err, ris) {
            if (err) {
                console.log(err);
                $scope.msg = "Error updating menu permissions :(";
                return;
            }


            Persistence.saveDocument('cms_menu_items', $scope.doc, function(err, ris) {
                if (err) {
                    console.log(err);
                    $scope.msg = "Error updating menu permissions :(";
                    return;
                }

                $uibModalInstance.close(true);
                return;
            });
        });

    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };



});
