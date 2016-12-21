(function() {
    'use strict';

    angular.module('pageTour.controllers', [

    ]);

    angular.module('pageTour.services', [

    ]);

    angular.module('pageTour.directives', [

    ]);

    angular.module('pageTour', [
         // Angular modules
         'ngRoute',
         'ngAnimate',
         // Custom modules
         'pageTour.controllers',
         'pageTour.directives',
         'pageTour.services',
         // 3rd Party Modules
         'ui.bootstrap'
    ]);
})();