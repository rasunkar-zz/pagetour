(function () {
    'use strict';

    angular
        .module('pageTour.services')
        .factory('pageTourTemplateService', pageTourTemplateService);

    pageTourTemplateService.$inject = ['$http', '$q'];
    
    function pageTourTemplateService($http, $q) {

        return {
            getPageTourTemplate: getPageTourTemplate
        };
        
        function getPageTourTemplate(templateName) {
            // TODO change this read from a config file
            var templateUrl = grmWebUrl + '/js/app/';
            templateUrl += 'pagetour/templates/pagetour-';
            templateUrl += templateName + '.html';

            return $http.get(templateUrl);
        }
    }
})();