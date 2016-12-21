(function () {
    'use strict';

    angular
        .module('pageTour.controllers')
        .controller('PageTourContextMenuController', PageTourContextMenuController);

    PageTourContextMenuController.$inject = ['$scope','$location', 'pageTourTutorialService'];

    function PageTourContextMenuController($scope, $location, pageTourTutorialService) {
        var ptCmCtrl = this;

        ptCmCtrl.showAuthorDock = showAuthorDock;
        /*ptCmCtrl.renderPageTourOnClick = renderPageTourOnClick;
        ptCmCtrl.showAllTutorials = showAllTutorials;*/
        ptCmCtrl.fetchTutorials = fetchTutorials;
        ptCmCtrl.renderPageTourContextOnClick = renderPageTourContextOnClick;

        $scope.$on('pageTour-pageContextChanged', ptCmCtrl.fetchTutorials);
        // TODO this should come from a service
        ptCmCtrl.tutorialsList = [];
        
        //fetchTutorials();

        function fetchTutorials() {
            //var currentPageName = pageTourAppContextService.getCurrentPageName();
            pageTourTutorialService.getTutorialByPageContext()
                .then(
                    function (response) {
                        ptCmCtrl.tutorialsList = response.data.tutorials;
                    },
                    function (errorResponse) {
                        console.log('Error while fetching tutorials' + errorResponse);
                        ptCmCtrl.tutorialsList = [];
                    }
                );
        }
        
        function renderPageTourOnClick() {
            var pagetourdropdown = $('.pageTourContextMenuContent');
            if (pagetourdropdown.is(':visible')) {
                pagetourdropdown.hide();
            } else {
                pagetourdropdown.show();
            }

            $('.authoringElement').hide();           
        }

        function showAuthorDock() {
            $('.pageTourContextMenuContent').hide();
            $('.authoringElement').show();
        }

        function renderPageTourContextOnClick($event) {
            $('.authoringElement').hide();
            $(".pageTourContextMenu ul.dropdown-menu").animate({ scrollTop: 0 }, "fast");
            var target = $($event.target);
            if (target.parent().hasClass("open")) {
                target.parent().removeClass("open");
                target.attr("aria-expanded", "false");
            }
            else {
                target.parent().addClass("open");
                target.attr("aria-expanded", "true");
            }
            if ($event.screenX != 0 && $event.screenY != 0)
                target.addClass("focus-removed");
        };
    }
})();