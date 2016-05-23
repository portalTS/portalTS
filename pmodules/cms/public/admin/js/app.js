cmsApp.directive('mdlUpgrade', function($timeout) {

    return {
        restrict: 'A',
        compile: function() {
            console.log("called");
            return {
                post: function postLink(scope, element) {
                    $timeout(function() {
                        componentHandler.upgradeElements(element[0]);
                    }, 0);
                }
            };
        },
    };

});

cmsApp.directive('ngConfirmClick', ['$uibModal',
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

cmsApp.filter('trust', [
    '$sce',
    function($sce) {
      return function(value, type) {
        // Defaults to treating trusted text as `html`
        return $sce.trustAs(type || 'html', value);
      }
    }
  ])


cmsApp.config(function($stateProvider) {
    $stateProvider
        .state('index', {
            url: "",
            views: {
                "pages-view": {
                    templateUrl: "/cms/admin/templates/pages_home.html",
                    controller: "pagesController"
                },
                "menu-view": {
                    templateUrl: "/cms/admin/templates/menu_home.html",
                    controller: "menuController"
                }
            }
        })
        .state('editPage', {
            url: "/editPage/:id",
            views: {
                "pages-view": {
                    templateUrl: "/cms/admin/templates/page_edit.html",
                    controller: "editPageController"
                },
            }
        });
});




cmsApp.controller('fatherController', function($scope) {
    $scope.showMenu = {
        show: true
    };
});

cmsApp.controller('mainController', function($scope, Persistence) {
});
