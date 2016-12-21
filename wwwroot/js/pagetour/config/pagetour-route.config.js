(function() {
    'use strict';

    angular
        .module('pageTour')
        .config(pageTourRouteConfig)
        .run(pageTourRouteChange);

    const allTutorialsTemplate = `
        <div>
            <ul class ="">
                <li ng-repeat="tutorial in pttCtrl.list">
                    {{tutorial}}
                </li>
            </ul>

        </div>
        `;

    function pageTourRouteConfig($routeProvider) {

        $routeProvider
            .when("/viewAllTutorials", {
                //templateUrl: grmWebUrl + '/js/app/pagetour/templates/pagetour-alltutorials.html',
                template: allTutorialsTemplate,
                controller: 'PageTourTutorialsController',
                controllerAs: 'pttCtrl'/*,
                resolve: {
                    listOfTutorialsService: listOfTutorialsService
                }*/
            });

        function listOfTutorialsService(pageTourTutorialService) {
            return pageTourTutorialService.getAllTutorials();
        }
    }

    pageTourRouteChange.$inject = ['$rootScope', 'pageTourAppContextService'];

    function pageTourRouteChange($rootScope, pageTourAppContextService) {
        $rootScope.$on("$stateChangeSuccess", function (event, next, current) {
            pageTourAppContextService.setCurrentPageName(next.name)
            pageTourAppContextService.setCurrentPageRouteInfo(next)
        });
    }
})();