var repoApp = angular.module('repoApp', ['ngResource','angularFileUpload', 'angular-table', 'ngclipboard', 'ui.bootstrap']);

repoApp.directive('mdlUpgrade', function($timeout) {

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


repoApp.directive('ngConfirmClick', ['$uibModal',
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


repoApp.factory("RElement", function($resource) {
    return $resource("/repository/admin/relements/:id", {
        id: '@_id'
    }, {
        'query': {
            method: 'GET',
            isArray: false
        },
        'update': {
            method: "PUT"
        }
    });
});


repoApp.controller('mainController', function($scope, $timeout, FileUploader, RElement) {

    $scope.uploader = new FileUploader({
        url: '/repository/admin/upload',
        autoUpload: true,
        removeAfterUpload: true,
    });
    $scope.uploader.filters.push({
        'name': 'enforceMaxFileSize',
        'fn': function (item) {
            if (item.size <= 1048576*5) return true; // 1024 * 1024 | Math.pow(2,20); | 0x100000
            $scope.showMsg("The file is too big! (>5MB)");
            return false;
        }
    });
    $scope.uploader.onSuccessItem = function(item, response) {
        console.log("success");
        console.log(item);
        console.log(response);
        if (response.data) {
            $scope.elements.push(response.data);
            $scope.showMsg(item.file.name+" uploaded!");
            return;
        }
        $scope.showMsg("Error uploading "+item.file.name);
    }
    $scope.uploader.onErrorItem = function(item, response) {
        console.log("error");
        console.log(item);
        console.log(response);
        $scope.showMsg("Error uploading "+item.file.name);
    }
    $scope.uploader.onBeforeUploadItem = function(item) {
        var name = item.file.name;
        if ($scope.checkNameExists(name)) {
            var i = name.lastIndexOf('.tar.gz');
            if (i==-1) i = name.lastIndexOf('.');
            var n;
            if (i==-1) n = name+" (1)";
            else n = name.substring(0, i)+" (1)"+name.substring(i, name.length);
            item.file.name = n;
        }
    }


    $scope.config = {
        //itemsPerPage: 20,
        //fillLastPage: false
    };

    $scope.editing = -1;
    $scope.editingData = {};
    $scope.elements = [];
    $scope.fathers = [];
    $scope.fathers.push({
        name: '',
        _id: null,
        isDirectory: true
    });

    $scope.getCurrentFatherId = function() {
        return $scope.fathers[$scope.fathers.length - 1]._id;
    }


    $scope.printPath = function(f) {
        if (!f.name) return "Repository";
        return f.name;
    }



    $scope.load = function() {
        $scope.uploader.formData = [{father:$scope.getCurrentFatherId()}];
        RElement.query({father:$scope.getCurrentFatherId()}, function(d) {
            if (!d.data) {
                return $scope.showMsg("Error loading data");
            }
            $scope.elements = d.data;
        });
    }
    $scope.load();



    $scope.showMsg = function(msg) {
        var notification = document.querySelector('#snackbar');
        var data = {
            message: msg,
            timeout: 2000
        };
        notification.MaterialSnackbar.showSnackbar(data);
    }



    $scope.findIcon = function(element) {
        if (element.isDirectory) return "folder";
        if (element.contentType && element.contentType.indexOf("image")!=-1) return "image";
        return "insert_drive_file";
    }

    $scope.printSize = function(bytes) {
        if (!bytes) return '';
        var thresh = 1024;
        if(Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while(Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1)+' '+units[u];
    };

    ////////////////////////////////////////////////////////////////////////////
    // Folder creation and element name editing                               //
    ////////////////////////////////////////////////////////////////////////////
    $scope.startNameEditing = function(element, $event) {
        if ($scope.editing==element) return;
        $event.stopPropagation();
        if ($scope.editing!=-1) return $scope.abortNameEditing();
        $scope.editing = element;
        $scope.editingData.text = element.name;
    }

    $scope.endNameEditing = function(event) {
        if (!$scope.editingData.text) {
            return $scope.showMsg("The name is empty!");
        }
        if ($scope.checkNameExists($scope.editingData.text, $scope.editing)) {
            return $scope.showMsg("This name is already in use!");
        }
        $scope.editing.name = $scope.editingData.text;
        RElement.update($scope.editing, function(d) {
            console.log(d);
            $scope.editingData.text = "";
            var t;
            if ($scope.editing.isFolder) t = "Folder ";
            else t = "File ";
            $scope.editing = -1;
            $scope.showMsg(t+"renamed");
        })
    }

    $scope.abortNameEditing = function() {
        console.log("aborted");
        $scope.editingData.text = "";
        $scope.editing = -1;
    }

    $scope.checkNameExists = function(name, obj) {
        for (var i = 0; i < $scope.elements.length; i++) {
            if ($scope.elements[i].name == name) {
                if (!obj) return true;
                if ($scope.elements[i] != obj) return true;
            }
        }
        return false;
    }

    $scope.createFolder = function() {
        var name = "New Folder";
        while (true) {
            if ($scope.checkNameExists(name)) {
                name = name + ' (1)';
            } else break;
        }
        var data = {
            name: name,
            father: $scope.getCurrentFatherId()
        }
        RElement.save(data, function(d) {
            if (!d.data) return $scope.showMsg("Error creating the folder");
            $scope.elements.push(d.data);
            $scope.showMsg("Folder created!");
        });
    }


    $scope.uploadFile = function() {
        $("#input-new-file").click();
    }


    ////////////////////////////////////////////////////////////////////////////
    // Right buttons actions                                                  //
    ////////////////////////////////////////////////////////////////////////////
    $scope.generateLink = function(element) {
        var path = "/repository/files/";
        for (var i = 1; i<$scope.fathers.length; i++) {
            path += $scope.fathers[i].name+'/';
        }
        path += element.name;
        return path;
    }
    $scope.onCopied = function(e) {
        $scope.showMsg(e.text+" copied to the clipboard!");
    }

    $scope.delete = function(item) {
        console.log(item);
        RElement.delete({id:item._id}, function(d) {
            if (d.data) {
                var index = -1;
                for (var i = 0; i<$scope.elements.length; i++) {
                    if ($scope.elements[i]._id==item._id) {
                        index = i;
                        break;
                    }
                }
                if (index==-1) return;
                $scope.elements.splice(index, 1);
                $scope.showMsg(item.name+" has been removed.");
                return;
            }
            $scope.showMsg("Error removing "+item.name);
        });
    }


    ////////////////////////////////////////////////////////////////////////////
    // Performing drill-down and opening                                      //
    ////////////////////////////////////////////////////////////////////////////
    $scope.open = function(element) {
        if ($scope.editing!=-1) {
            if ($scope.editing==element) return;
            return $scope.abortNameEditing();
        }
        if (element.isDirectory) {
            var index = -1;
            for (var i = 0; i<$scope.fathers.length; i++) {
                if ($scope.fathers[i]._id == element._id) {
                    index = i;
                    break;
                }
            }
            if (index==-1) $scope.fathers.push(element);
            else {
                $scope.fathers.length = index+1;
            }
            $scope.load();
            return;
        }
    }
});
