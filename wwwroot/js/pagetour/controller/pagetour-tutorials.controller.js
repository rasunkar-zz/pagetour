(function() {
    'use strict';

    angular
        .module('pageTour.controllers')
        .controller('PageTourTutorialsController', PageTourTutorialsController);

    PageTourTutorialsController.$inject = ['pageTourTutorialService'];

    function PageTourTutorialsController(pageTourTutorialService) {
        var pttCtrl = this;

        pttCtrl.list = [];

        fetchTutorials();

        function fetchTutorials() {
            pageTourTutorialService.getAllTutorials()
                .then(
                    function (response) {
                        vmpttCtrl.list = response.data.tutorials;
                    },
                    function (errorResponse) {
                        console.log('Error while fetching tutorials' + errorResponse);
                        pttCtrl.list = [];
                    }
                );
        }
    }

})();