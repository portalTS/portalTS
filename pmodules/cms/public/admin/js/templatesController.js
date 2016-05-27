cmsApp.controller('templatesController', function($scope, $filter, $timeout, $location, $uibModal, $http, Persistence) {
    $scope.loading = false;

    $scope.templates = [
        {
            name: "Header",
            value: 'header'
        },
        {
            name: "Menu",
            value: 'menu'
        },
        {
            name: "Footer",
            value: 'footer'
        },
        {
            name: 'Login',
            value: 'cms_login'
        },
        {
            name: 'Signup',
            value: 'cms_signup'
        },
        {
            name: 'Forgot Password',
            value: 'cms_forgotPassword'
        },
        {
            name: 'Change Password',
            value: 'cms_changePassword'
        }
    ];


    $scope.editTemplate = function(t) {
        $location.path('/editTemplate/'+t.name+'/'+t.value);
    }
});
