(function() {
    'use strict';

    angular
        .module('pageTour.controllers')
        .controller('PageTourPlayTutorialController', PageTourPlayTutorialController);

    PageTourPlayTutorialController.$inject = ['$scope', 'pageTourPlayService', 'pageTourAppContextService'];

    function PageTourPlayTutorialController($scope, pageTourPlayService, pageTourAppContextService) {
        var ptPlayTutCtrl = this;

        ptPlayTutCtrl.playPageTour = function (resourceId) {
            $('.pageTourContextMenuContent').hide();
            console.log('current context in play:' + pageTourAppContextService.getCurrentPageName());
            // TODO this needs to be changed
            var url = grmWebUrl + '/resource/' + resourceId + ".xml";
            pageTourPlayService().start(url, function () {
                console.log('Finished playing the tutorial');
            });
        }
    }


})();