angular.module('portalJS', ['ui.bootstrap'])
  .directive('ngConfirmClick', ['$uibModal',
    function($uibModal) {

      var ModalInstanceCtrl = function($scope, $uibModalInstance) {
        $scope.ok = function() {
          $uibModalInstance.close();
        };

        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };
      };

      return {
        restrict: 'A',
        scope:{
          ngReallyClick:"&",
          item:"="
        },
        link: function(scope, element, attrs) {
          element.bind('click', function() {
            var message = attrs.ngConfirmClick || "Are you sure ?";

            /*
            //This works
            if (message && confirm(message)) {
              scope.$apply(attrs.ngReallyClick);
            }
            //*/

            //*This doesn't works
            var modalHtml = '<div class="demo-card-square mdl-card mdl-shadow--2dp match_parent" mdl-upgrade><div class="mdl-card__title mdl-card--expand"><h2 class="mdl-card__title-text">Warning</h2></div><div class="mdl-card__supporting-text"><br>' + message + '<br></div>';
            modalHtml += '<div class="mdl-card__actions mdl-card--border"><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" ng-click="ok()">OK</button> <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" ng-click="cancel()">Cancel</button></div></div>';

            var modalInstance = $uibModal.open({
              template: modalHtml,
              controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function() {
              scope.ngReallyClick({item:scope.item}); //raise an error : $digest already in progress
            }, function() {
              //Modal dismissed
            });
            //*/

          });

        }
      }
    }
  ]);
