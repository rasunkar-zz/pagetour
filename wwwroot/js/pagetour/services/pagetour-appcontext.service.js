(function() {
    'use strict';

    angular
        .module('pageTour.services')
        .factory('pageTourAppContextService', pageTourAppContextService);

    pageTourAppContextService.$inject = ['$rootScope']

    function pageTourAppContextService($rootScope) {
        var appContext = {};

        return {
            getAppContext: getAppContext,
            setAppContextValues: setAppContextValues,
            setCurrentPageName: setCurrentPageName,
            getCurrentPageName: getCurrentPageName,
            setCurrentPageRouteInfo: setCurrentPageRouteInfo,
            getCurrentPageRouteInfo: setCurrentPageRouteInfo
        };

        function getAppContext() {
            return appContext;
        }

        function setAppContextValues(key, value) {
            appContext[key] = value;
        }

        function setCurrentPageName(value) {
            appContext['currentPageName'] = value
            $rootScope.$broadcast('pageTour-pageContextChanged')
        }

        function getCurrentPageName() {
            return appContext['currentPageName']
        }

        function setCurrentPageRouteInfo(value) {
            appContext['currentPageRoute'] = value
        }

        function getCurrentPageRouteInfo() {
            return appContext['currentPageRoute']
        }
    }
})();