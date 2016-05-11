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

app.controller('mainController', ['$scope', 'Api', '$uibModal', '$filter', '$timeout', function($scope, Api, $uibModal, $filter, $timeout) {

    $scope.loading = true;
    $scope.list = [];
    $scope.filteredList = [];
    $scope.userLevels = [];

    $scope.msg = null;


    $scope.updateFilteredList = function() {
        $scope.filteredList = $filter("filter")($scope.list, $scope.query);
    };

    $scope.load = function() {
        Api.getUserLevels(function(levels) {
            $scope.userLevels = [];
            for (var l in levels) {
                $scope.userLevels.push({id:levels[l],name:l});
            }
            Api.getUsers(function(users) {
                $scope.list = users;
                $scope.loading = false;
                for (var i=0; i<$scope.list.length; i++) {
                    var user = $scope.list[i];
                    user.role_readable = $scope.printRole(user.role);
                }
                $scope.filteredList = $scope.list;
            });
        });
    };


    $scope.printRole = function(role) {
        for (var i = 0; i<$scope.userLevels.length; i++) {
            var _role = $scope.userLevels[i];
            if (role == _role.id) {
                return _role.name;
            }
        }
        return "Unknown";
    };




    $scope.config = {
        itemsPerPage: 5,
        fillLastPage: false
    };



    $scope.addUser = function() {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'addUser.html',
            controller: 'addUserController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                userLevels: function () {
                    return $scope.userLevels;
                },
                user: false
            }
        });

        modalInstance.result.then(function (reload) {
            if (reload) $scope.load();
        }, function () {
        });

    };


    $scope.edit = function(user) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'addUser.html',
            controller: 'addUserController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                userLevels: function () {
                    return $scope.userLevels;
                },
                user: function() {
                    return user;
                }
            }
        });

        modalInstance.result.then(function (reload) {
            if (reload) $scope.load();
        }, function () {
        });
    };


    $scope.delete = function(user) {
        $scope.msg = "Deleting...";
        Api.deleteUser(user._id, function(ris) {
            if (ris.success) {
                $scope.msg = "User deleted.";
                $timeout(function() {
                    $scope.msg = null;
                }, 2000);
                $scope.load();
            }
            else {
                $scope.msg = "Error deleting user!!! :(";
                $timeout(function() {
                    $scope.msg = null;
                }, 4000);
            }

        });
    };

    $scope.moreInfo = function(user) {

        Api.getUser(user._id, function(data) {
            $uibModal.open({
            animation: true,
            templateUrl: 'userInfo.html',
            controller: 'userInfoController',
            resolve: {
                user: function () {
                    return data.user;
                },
                userLevels: function() {
                    return $scope.userLevels;
                }
            }
        });


        });

    };


    $scope.load();


}]);


app.controller('addUserController', ['$scope', 'Api', '$uibModalInstance', 'userLevels', 'user', function($scope, Api, $uibModalInstance, userLevels, user) {

    $scope.user = user;



    $scope.title = "Add User";
    $scope.okButton = "Create User";
    if ($scope.user) {
        $scope.title = "Edit "+$scope.user.username;
        $scope.okButton = "Edit User";
        $scope.username = $scope.user.username;
        $scope.role = {
            id: $scope.user.role
        };
    }
    else {
        $scope.username = '';
        $scope.password = '';
        $scope.role = {
            id:-1
        };
    }

    $scope.userLevels = userLevels;
    $scope.enabled = true;
    $scope.ok = function () {
        if (!$scope.username) return;
        if (!$scope.user && !$scope.password) return;
        if (!$scope.role || !$scope.role.id) return;
        $scope.enabled = false;
        if ($scope.user) $scope.msg = "Updating user information...";
        else $scope.msg = "Adding user...";
        if ($scope.user) $scope.update();
        else $scope.add();
    };

    $scope.add = function() {
        var user = {
            username: $scope.username,
            password: $scope.password,
            role: $scope.role.id
        };
        Api.createUser(user, function(ris) {
            if (ris.success) {
                $uibModalInstance.close(true);
                return;
            }
            $scope.enabled = true;
            $scope.msg = "Error adding the new user :(";
        });
    };

    $scope.update = function() {
        var user = {
            _id: $scope.user._id,
            username: $scope.username,
            role: $scope.role.id
        };
        if ($scope.password) {
            user.password = $scope.password;
        }

        Api.updateUser(user, function(ris) {
            if (ris.success) {
                $uibModalInstance.close(true);
                return;
            }
            $scope.enabled = true;
            $scope.msg = "Error updating the user :(";
        });
    };

    $scope.printRole = function(role_id) {
        for (var i = 0; i<$scope.userLevels.length; i++) {
            if (role_id == $scope.userLevels[i].id) return $scope.userLevels[i].name;
        }
        return '';
    }

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };





}]);



app.controller('userInfoController', ['$scope', 'user', 'userLevels', '$uibModalInstance', '$timeout', '$http', function($scope, user, userLevels, $uibModalInstance, $timeout, $http) {
    $scope.user = user;
    $scope.userLevels = userLevels;

    $scope.formatDate = function(date) {
        if (date==null) return "--";
        return moment(date).format("MM/DD/YYYY - HH:mm:ss");
    };


    $scope.printRole = function(role) {
        for (var i = 0; i<$scope.userLevels.length; i++) {
            var _role = $scope.userLevels[i];
            if (role == _role.id) {
                return _role.name;
            }
        }
        return "Unknown";
    };

    $scope.searchGroup = function(query) {
        return $http.get('/users/admin/api/group/search/'+query);
    };

    $scope.merged = function(arr) {
      var str = "";
      for (var i = 0; i<arr.length; i++) {
          str = str + arr[i].name + ", ";
      }
      $timeout(function() {
          $(".tagsinput").tagsinput();
      },0);
      return str;
    }

    $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

}]);



app.controller('registrationOptionsController', ['$scope', 'Api', '$timeout', '$uibModal', function($scope, Api, $timeout, $uibModal) {
    $scope.msg = null;
    $scope.loading = true;
    $scope.userLevels = [];
    $scope.groups = [];
    $scope.selectedGroups = {};
    $scope.settings = {};

    Api.getUserLevels(function(levels) {
        $scope.userLevels = [];
        for (var l in levels) {
            $scope.userLevels.push({id:levels[l],name:l});
        }

        Api.getGroups(function(groups) {
            $scope.groups = groups;
            $scope.groups.forEach(function(g) {
                $scope.selectedGroups[g._id] = false;
            });

            Api.getSettings(function(settings) {
                $scope.settings = settings;
                $scope.settings.default_groups.forEach(function(g) {
                    $scope.selectedGroups[g] = true;
                });

                $scope.loading = false;
            });


        });

    });


    $scope.save = function() {
        $scope.settings.default_groups = [];
        for (var group in $scope.selectedGroups) {
            if ($scope.selectedGroups[group]) $scope.settings.default_groups.push(group);
        }

        $scope.msg = "Saving...";

        Api.saveSettings($scope.settings, function(back) {
            if (back) {
                $scope.msg = "Saved!";
                $timeout(function() {
                    $scope.msg = null;
                }, 3000);
            } else {
                $scope.msg = "Error!!! :(";
                $timeout(function() {
                    $scope.msg = null;
                }, 6000);
            }
        });

    }


    $scope.editActivationEmail = function() {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/users/admin/templates/editEmailTemplate.html',
            controller: 'editEmailTemplateController',
            resolve: {
                title: function() {return 'Activation Email template'; },
                placeholders: function() {
                    return [
                        {name: "{{username}}", desc: "The username"},
                        {name: "{{uri}}", desc: "The uri for the registration. For example, \"/users/confirm/98asdui8\". Thus, you must enter the Web Site url before the uri."}
                    ];
                },
                data: function() {
                    if (!$scope.settings.activationTemplate) $scope.settings.activationTemplate = {};
                    return $scope.settings.activationTemplate;
                }
            }
        });

        modalInstance.result.then(function (template) {
            $scope.settings.activationTemplate = template;
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    $scope.editConfirmationEmail = function() {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/users/admin/templates/editEmailTemplate.html',
            controller: 'editEmailTemplateController',
            resolve: {
                title: function() {return 'Confirmation Email template'; },
                placeholders: function() {
                    return [
                        {name: "{{username}}", desc: "The username"},
                        {name: "{{uri}}", desc: "The uri for the registration. For example, \"/users/confirm/98asdui8\". Thus, you must enter the Web Site url before the uri."}
                    ];
                },
                data: function() {
                    if (!$scope.settings.confirmationTemplate) $scope.settings.confirmationTemplate = {};
                    return $scope.settings.confirmationTemplate;
                }
            }
        });

        modalInstance.result.then(function (template) {
            $scope.settings.confirmationTemplate = template;
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }

    $scope.editForgotEmail = function() {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/users/admin/templates/editEmailTemplate.html',
            controller: 'editEmailTemplateController',
            resolve: {
                title: function() {return 'Forgot password Email template'; },
                placeholders: function() {
                    return [
                        {name: "{{username}}", desc: "The username"},
                        {name: "{{password}}", desc: "The new generated password"}
                    ];
                },
                data: function() {
                    if (!$scope.settings.forgotTemplate) $scope.settings.forgotTemplate = {};
                    return $scope.settings.forgotTemplate;
                }
            }
        });

        modalInstance.result.then(function (template) {
            $scope.settings.forgotTemplate = template;
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }


}]);
