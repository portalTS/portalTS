repoApp.controller('imagePreviewController', function($scope, $timeout, $uibModalInstance, url) {
    $scope.url = url;

    $scope.close = function() {
        $uibModalInstance.close();
    }
});
