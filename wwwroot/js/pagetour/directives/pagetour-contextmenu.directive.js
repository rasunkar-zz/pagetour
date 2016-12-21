(function () {
    'use strict';

    angular
        .module('pageTour.directives')
        .directive('pageTourContextMenu', pageTourContextMenu);

    const contextMenuTemplate = `            
            <div ng-controller="PageTourContextMenuController as ptCmCtrl">
                <page-tour-author-dock></page-tour-author-dock>
                
                <div class ="btn-group pull-left pageTourContextMenu" uib-dropdown>

				    <button id="pageTourMenuOpen" type="button" class ="icon-container withBorder" uib-dropdown-toggle title="PageTour Context Menu" ng-click="ptCmCtrl.renderPageTourContextOnClick($event)">
					    <i class ="icon pageTourIcon"></i>
				    </button>

                    <ul uib-dropdown-menu aria-labelledby="pageTourMenuOpen" ng-controller="PageTourPlayTutorialController as ptPlayTutCtrl">
						    <li>
                                <a href="" ng-click="ptAllTutCtrl.showAllTutorials();">View All</a>
                            </li>
                            <li>
                                <a href="" ng-click="ptCmCtrl.showAuthorDock();">New Tutorial</a>
                            </li>
                            <li ng-repeat="tutorial in ptCmCtrl.tutorialsList track by $index">
                                <a href="" ng-click="ptPlayTutCtrl.playPageTour(tutorial)">{{tutorial}}</a>
                            </li>
                    </ul>
                </div>

                <page-tour-all-tutorials></page-tour-all-tutorials>
            </div>
    `;

    //pageTourContextMenu.$inject = ['$compile', 'pageTourTemplateService'];

    function pageTourContextMenu() {

        var directive = {
            template: contextMenuTemplate,
            restrict: 'E',
            transclude: false,
            link: link
        };

        return directive;

        function link(scope, element, attrs) {

            /*pageTourTemplateService.getPageTourTemplate('contextmenu')
                .then(
                    function (response) {
                        element.html(response.data);
                        $compile(element.contents())(scope);
                    },
                    function (errResponse) {
                        console.log(errResponse);
                    }
                );*/
        }
    }
})();