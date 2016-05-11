app.controller('groupController', ['$scope', 'Api', '$uibModal', '$filter', '$timeout', function($scope, Api, $uibModal, $filter, $timeout) {

    $scope.loading = true;
    $scope.list = [];
    $scope.filteredList = [];

    $scope.msg = null;


    $scope.updateFilteredList = function() {
        $scope.filteredList = $filter("filter")($scope.list, $scope.query);
    };

    $scope.load = function() {
        Api.getGroups(function(groups) {
            $scope.list = groups;
            $scope.filteredList = $scope.list;
            $scope.loading = false;
        });


    };



    $scope.config = {
        itemsPerPage: 5,
        fillLastPage: false
    };


    $scope.addGroup = function() {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/users/admin/templates/addGroup.html',
            controller: 'addGroupController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                group: false
            }
        });

        modalInstance.result.then(function (reload) {
            console.log("closed");
            if (reload) $scope.load();
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });

    };


    $scope.edit = function(group) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/users/admin/templates/addGroup.html',
            controller: 'addGroupController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                group: function() {
                    return group;
                }
            }
        });

        modalInstance.result.then(function (reload) {
            console.log("closed");
            if (reload) $scope.load();
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };


    $scope.delete = function(group) {
        $scope.msg = "Deleting...";
        Api.deleteGroup(group._id, function(ris) {
            if (ris.success) {
                $scope.msg = "Group Deleted.";
                $timeout(function() {
                    $scope.msg = null;
                }, 2000);
                $scope.load();
            }
            else {
                $scope.msg = "Error deleting group!!! :(";
                $timeout(function() {
                    $scope.msg = null;
                }, 4000);
            }

        });
    };

    $scope.moreInfo = function(group) {

        Api.getGroup(group._id, function(data) {
            $uibModal.open({
            animation: false,
            templateUrl: '/users/admin/templates/showGroup.html',
            controller: 'groupInfoController',
            resolve: {
                group: function () {
                    return data.group;
                }
            }
        });


        });

    };


    $scope.load();


}]);



app.controller('addGroupController', ['$scope', 'Api', '$uibModalInstance', 'group', function($scope, Api, $uibModalInstance, group) {

    $scope.group = group;
    console.log(group);



    $scope.title = "Add Group";
    $scope.okButton = "Create Group";
    if ($scope.group) {
        $scope.title = "Edit "+$scope.group.name;
        $scope.okButton = "Edit Group";
        $scope.name = $scope.group.name;
        $scope.description = $scope.group.description;
    }

    $scope.enabled = true;
    $scope.ok = function () {
        console.log($scope.name);
        console.log($scope.description);
        if (!$scope.name) return;
        if (!$scope.description) return;
        $scope.enabled = false;
        if ($scope.group) $scope.msg = "Updating group information...";
        else $scope.msg = "Adding group...";
        if ($scope.group) $scope.update();
        else $scope.add();
    };

    $scope.add = function() {
        var group = {
            name: $scope.name,
            description: $scope.description,
        };
        Api.createGroup(group, function(ris) {
            if (ris.success) {
                $uibModalInstance.close(true);
                return;
            }
            $scope.enabled = true;
            $scope.msg = "Error adding the new group :(";
        });
    };

    $scope.update = function() {
        var group = {
            _id: $scope.group._id,
            name: $scope.name,
            description: $scope.description
        };

        Api.updateGroup(group, function(ris) {
            if (ris.success) {
                $uibModalInstance.close(true);
                return;
            }
            $scope.enabled = true;
            $scope.msg = "Error updating the group :(";
        });
    };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };


}]);



app.controller('groupInfoController', ['$scope', 'group', '$uibModalInstance', '$http', 'Api', function($scope, group, $uibModalInstance, $http, Api) {
    $scope.group = group;

    $scope.msg = null;

    $scope.formatDate = function(date) {
        if (date==null) return "--";
        return moment(date).format("MM/DD/YYYY - HH:mm:ss");
    };


    $scope.users = $scope.group.users;
    $scope.users_backup = [];
    for (var i = 0; i<$scope.users.length; i++) {
        $scope.users_backup.push($scope.users._id);
    }

    $scope.config = {
        itemsPerPage: 5,
        fillLastPage: false
    };

    $scope.users_change = false;

    $scope.searchUser = function(query) {
        return $http.get('/users/admin/api/group_user/'+$scope.group._id+"/"+query).then(function(response) {
            var toRet = [];
            for (var i = 0; i<response.data.length; i++) {
                var found = false;
                for (var k = 0; k<$scope.users.length; k++) {
                    if ($scope.users[k]._id==response.data[i]._id) found = true;
                }
                if (!found) toRet.push(response.data[i]);
                //if ($scope.users.indexOf(response.data[i])==-1) toRet.push(response.data[i]);
            }
            return toRet;
        });
    };

    $scope.removeItem = function(u) {
        for (var k = 0; k<$scope.users.length; k++) {
            if ($scope.users[k]._id==u._id) {
                $scope.users.splice(k,1);
                return;
            }
        }
    }

    $scope.$watchCollection('users', function() {
        if ($scope.users_change) return;
        if ($scope.users_backup.length != $scope.users.length) {
            $scope.users_change = true;
            return;
        }
    });

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
        $scope.msg = "Saving group users...";
        Api.updateGroupUsers($scope.group._id, $scope.users, function(data) {
            if (data.success) $uibModalInstance.close(false);
        });

    };

}]);
