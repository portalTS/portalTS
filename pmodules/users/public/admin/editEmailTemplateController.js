app.controller('editEmailTemplateController', ['$uibModalInstance', '$scope', 'Api', '$timeout', 'title', 'placeholders', 'data', function($uibModalInstance, $scope, Api, $timeout, title, placeholders, data) {

    $scope.title = title;

    $scope.placeholders = placeholders

    $scope.text = data.text;
    $scope.html = data.html;
    $scope.sender = data.sender;
    $scope.subject = data.subject;

    $scope.ok = function() {
        $uibModalInstance.close({
            text: $scope.text,
            html: $scope.html,
            sender: $scope.sender,
            subject: $scope.subject
        });
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }

}]);
