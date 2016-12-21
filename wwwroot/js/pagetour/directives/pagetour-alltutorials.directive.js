(function() {
    'use strict';

    angular
        .module('pageTour.directives')
        .directive('pageTourAllTutorials', pageTourAllTutorials);

    const allTutorialsModalTemplate = `
        <div class ="pageTourAllTutorials">
            <div class ="modal-header">
                 <h3 class ="modal-title" id="modal-title">Tutorials List</h3>
            </div>
            <div class ="modal-body" id="modal-body">
                <ul>
                    <li ng-repeat="tutorial in listTutModalCtrl.list track by $index">
                        <a href="#" ng-click="$event.preventDefault();">{{tutorial}}</a>
                    </li>
                </ul>
            </div>
            <div class ="modal-footer">
                <button class ="btn btn-warning" type="button" ng-click="listTutModalCtrl.cancelModal()">Cancel</button>
            </div>
        </div>
    `;

    function pageTourAllTutorials() {

        var directive = {
            link: link,
            controller: pageTourAllTutorialsController,
            controllerAs: 'ptAllTutCtrl',
            //template: allTutorialsModalTemplate,
            restrict: 'EA'
        };

        return directive;

        function link(scope, element, attrs) {
            /*$(allTutorialsTemplate).appendTo('body');
            $('.pageTourAllTutorials').hide();*/
        }

        pageTourAllTutorialsController.$inject = ['$uibModal', 'pageTourTutorialService'];

        function pageTourAllTutorialsController($uibModal, pageTourTutorialService) {
            var ptAllTutCtrl = this;

            ptAllTutCtrl.showAllTutorials = showAllTutorials;
            /*ptAllTutCtrl.list = [];

            function fetchTutorials() {
                pageTourTutorialService.getAllTutorials()
                    .then(
                        function (response) {
                            ptAllTutCtrl.list = response.data.tutorials;
                        },
                        function (errorResponse) {
                            console.log('Error while fetching tutorials' + errorResponse);
                            ptAllTutCtrl.list = [];
                        }
                );
            }*/

            function showAllTutorials() {
                $('.pageTourContextMenuContent').hide();

                var listAllTutModalConfig = {
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    template: allTutorialsModalTemplate,
                    controller: ListAllTutModalInstanceController,
                    controllerAs: 'listTutModalCtrl',
                    size: 'lg',
                    appendTo: 'body'/*,
                    resolve: {
                        list: fetchTutorials()
                    }*/
                }

                var listAllTutModalInstance = $uibModal.open(listAllTutModalConfig);

                listAllTutModalInstance.result.then(modalOkClick, modalCancelClick);
                var modalOkClick = modalOkClick;
                var modalCancelClick = modalCancelClick;

                function modalOkClick() {
                    console.log('closed the modal box');
                }

                function modalCancelClick() {
                    console.log('closed the modal box');
                }
            }

            ListAllTutModalInstanceController.$inject = ['$uibModalInstance', 'pageTourTutorialService'];

            function ListAllTutModalInstanceController($uibModalInstance, pageTourTutorialService) {
                var listTutModalCtrl = this;

                listTutModalCtrl.list = [];
                listTutModalCtrl.cancelModal = cancelModal;

                fetchTutorials();

                function fetchTutorials() {
                    pageTourTutorialService.getAllTutorials()
                        .then(
                            function (response) {
                                listTutModalCtrl.list = response.data.tutorials;
                            },
                            function (errorResponse) {
                                console.log('Error while fetching tutorials' + errorResponse);
                                ptAllTutCtrl.list = [];
                            }
                    );
                }

                function cancelModal () {
                    $uibModalInstance.dismiss('cancel');
                }
            }
        }
    }
})();