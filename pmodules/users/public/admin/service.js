app.factory('Api', function($http) {


    var getUsers = function(callback) {
        $http.get('/users/admin/api/users')
        .success(function(data, status, headers, config) {
            callback(data);
        });
    };

    var getUserLevels = function(callback) {
        $http.get('/users/admin/api/levels')
        .success(function(data, status, headers, config) {
            callback(data);
        });
    };

    var getUser = function(id, callback) {
        $http.get('/users/admin/api/user/'+id)
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };

    var createUser = function(user, callback) {
        $http.post('/users/admin/api/user', {user: user})
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };

    var updateUser = function(user, callback) {
        $http.put('/users/admin/api/user/'+user._id, {user: user})
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };

    var deleteUser = function(id, callback) {
        $http.delete('/users/admin/api/user/'+id)
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };





    var getGroups = function(callback) {
        $http.get('/users/admin/api/groups')
        .success(function(data, status, headers, config) {
            callback(data);
        });
    };

    var createGroup = function(group, callback) {
        $http.post('/users/admin/api/group', {group: group})
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };

    var updateGroup = function(group, callback) {
        $http.put('/users/admin/api/group/'+group._id, {group: group})
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };

    var deleteGroup = function(group_id, callback) {
        $http.delete('/users/admin/api/group/'+group_id)
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };

    var getGroup = function(id, callback) {
        $http.get('/users/admin/api/group/'+id)
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };

    var searchUsersNotInGroup = function(groupId, username, callback) {
        $http.get('/users/admin/api/group_user/'+groupId+"/"+username)
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };


    var updateGroupUsers = function(groupId, users, callback) {
        $http.post('/users/admin/api/group_user/'+groupId, {users:users})
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };


    var getSettings = function(callback) {
        $http.get('/users/admin/api/settings/')
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    };

    var saveSettings = function(settings, callback) {
        $http.post('/users/admin/api/settings/', {settings:settings})
        .success(function(data, status, heades, config) {
            callback(data);
        })
        .error(function() {
            callback({success:false});
        });
    }

    return {
        getUsers: getUsers,
        getUser: getUser,
        getUserLevels: getUserLevels,
        createUser: createUser,
        updateUser: updateUser,
        deleteUser: deleteUser,



        getGroups: getGroups,
        createGroup: createGroup,
        updateGroup: updateGroup,
        deleteGroup: deleteGroup,
        getGroup: getGroup,
        searchUsersNotInGroup: searchUsersNotInGroup,
        updateGroupUsers: updateGroupUsers,

        getSettings: getSettings,
        saveSettings: saveSettings
    };

});
