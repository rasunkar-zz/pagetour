(function() {
    'use strict';

    angular
        .module('pageTour.directives')
        .directive('pageTourAuthorDock', pageTourAuthorDock);

    const emptyTutSaveAlertTemplate = `
         <div uib-alert ng-class ="'alert-danger'" close="authCtrl.closeEmptyTutSaveAlert() " 
        dismiss-on-timeout="2000">Please record inorder to save the tutorial.</div>
     `;

    const emptyTutStepsAlertTemplate = `
        <div uib-alert ng-class ="'alert-danger'" close="authCtrl.closeEmptyTutStepsAlert()" ng-if="authCtrl.showEmptyTutStepsAlert"
        dismiss-on-timeout="2000">Please record inorder to see the steps in the tutorial</div>
     `;

    const emptyTutSaveAlert = `
        <div ng-controller="AuthController as authCtrl">
            <div uib-alert ng-class ="'alert-warning'" close="authCtrl.closeEmptyTutSaveAlert() ">Please record inorder to save the tutorial</div>
        </div>
    `;

   
    function pageTourAuthorDock() {

        var directive = {
            controller: AuthorController,
            controllerAs: 'authCtrl',
            restrict: 'AE',
            link: link
        };

        return directive;

        function link(scope, element, attrs, authCtrl) {
            //$(emptyTutSaveAlert).appendTo(element);
            //$(emptyTutStepsAlertTemplate).appendTo(element);
            authCtrl.createPageTourAuthorDock();
        }

        AuthorController.$inject = ['$scope', 'pageTourAuthorService', 'pageTourAppContextService'];

        function AuthorController($scope, pageTourAuthorService, pageTourAppContextService) {
            var authCtrl = this;

            authCtrl.alerts = [];
            authCtrl.showEmptyTutStepsAlert = false;
            authCtrl.showEmptyTutSaveAlert = false;

            authCtrl.createPageTourAuthorDock = createPageTourAuthorDock;
            authCtrl.closeEmptyTutSaveAlert = closeEmptyTutSaveAlert;

            function closeEmptyTutSaveAlert() {
                authCtrl.showEmptyTutSaveAlert = false;
            }

            function closeEmptyTutStepsAlert() {
                authCtrl.showEmptyTutStepsAlert = false;
            }

            function createPageTourAuthorDock() {
                
                var dockEventHandlers = {
                    saveClicked: saveButtonClicked
                };

                var pageTourAuthorInstance = pageTourAuthorService().initializeDock('Author', dockEventHandlers);
                $('.authoringElement').hide();

                function saveButtonClicked() {
                    console.log('current context in author:' + pageTourAppContextService.getCurrentPageName());
                    console.log("steps" + pageTourAuthorInstance.stepList);
                    authCtrl.showEmptyTutSaveAlert = pageTourAuthorInstance.stepList.length === 0;
                    if (!authCtrl.showEmptyTutSaveAlert) {
                        pageTourAuthorService().saveClickEventHandler(pageTourAuthorInstance.createXmlString());
                    }
                }
            }
        }
    };
})();