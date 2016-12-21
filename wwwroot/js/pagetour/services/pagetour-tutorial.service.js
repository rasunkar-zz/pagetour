(function () {
    'use strict';

    angular
        .module('pageTour.services')
        .factory('pageTourTutorialService', pageTourTutorialService);

    pageTourTutorialService.$inject = ['$http', '$q', 'pageTourAppContextService'];
    
    function pageTourTutorialService($http, $q, pageTourAppContextService) {

        return {
            getAllTutorials: getAllTutorials,
            getTutorialByPageContext: getTutorialByPageContext
        };
        
        function getAllTutorials() {
            // TODO change this read from a config file
            var listUrl = grmWebUrl + '/resource/getTutorialNames.json';

            return $http.get(listUrl);
        }

        function getTutorialByPageContext() {
            var tutorialListUrl = grmWebUrl + '/resource/' + pageTourAppContextService.getCurrentPageName() + '.json';
            return $http.get(tutorialListUrl);
        }
    }
})();