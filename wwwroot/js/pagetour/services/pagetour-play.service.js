(function () {
    'use strict';

    angular
        .module('pageTour.services')
        .factory('pageTourPlayService', pageTourPlayService);

    function pageTourPlayService() {

        var playTutorial = null;

        playTutorial = function () {
            var PageTour = function (tourSteps) {
                var self = this;
                self.tourSteps = tourSteps.stepsArray;
                self.actualSteps = tourSteps.actualSteps;
                self.delay = 1500; //in ms
                self.currentStep = 0;
                self.currentActualStep = 0;
                self.isActive = false;
                self.tourBox = null;
                self.tetherObject = null;
                self.tourOverlay = null;
                self.maxRetries = 3;
                self.EndTourCallback = null;

                self.beginTour = function () {
                    //Begin Tour Session
                    self.currentStep = 0;
                    self.currentActualStep = 0;
                    self.isActive = true;
                    self.setupTourBox();
                    self.repositionTourBox();
                    self.executeNextStep();
                }

                self.setupTourBox = function () {
                    self.tourOverlay = jQuery("<div class='shepherd-overlay'></div>");
                    self.tourOverlay.appendTo('body');
                    self.tourOverlay.show();
                    self.tourBox = jQuery("<div id='shepherd-tourbox' draggable='true'></div>");
                    self.tourBox.addClass("shepherd-step shepherd-element shepherd-open shepherd-theme-arrows shepherd-has-title");
                    var contentDiv = jQuery("<div class='shepherd-content'></div>");
                    contentDiv.append("<header><h3 class='shepherd-title'>Step Heading</h3></header>");
                    contentDiv.append("<div class='shepherd-text'></div>");
                    contentDiv.append("<footer><ul class='shepherd-buttons'><li><a class='shepherd-button shepherd-button-secondary'>Exit</a></li><li><a class='shepherd-button shepherd-button-primary'>Next</a></li></ul></footer>");
                    self.tourBox.append(contentDiv);
                    self.tourBox.css({
                        zIndex: 20000
                    });
                    self.tourBox.appendTo('body');
                    //self.tourOverlay.append(self.tourBox);
                    self.tourBox.show();
                    self.tourBox.find('.shepherd-button-secondary').click(function () {
                        self.endTour();
                    });
                }

                self.repositionTourBox = function () {
                    if (self.isActive) {
                        if (self.tetherObject && self.tetherObject.position) {
                            self.tetherObject.position();
                        }
                        setTimeout(function () { self.repositionTourBox(); }, 1000);
                    }
                }

                self.executeNextStep = function (retry) {
                    if (retry && retry > self.maxRetries) {
                        self.endTour(true);
                    }
                    else {
                        //Execute Tour steps only if active
                        if (self.isActive) {
                            if (!retry) {
                                retry = 0;
                                self.currentStep++;
                            }
                            //See if we have reached the end of Tour
                            if (self.currentStep <= self.tourSteps.length) {
                                var tourStep = self.tourSteps[self.currentStep - 1];

                                var action = PageTour.actions[tourStep.type];
                                if (!action) {
                                    self.endTour(true);
                                }

                                if (action.validity(tourStep)) {
                                    self.tourBox.find('.shepherd-text').text(tourStep.message);
                                    if (tourStep.silent) {
                                        action.execute(tourStep);
                                        action.cleanup(tourStep);
                                        self.executeNextStep();
                                    }
                                    else {
                                        self.currentActualStep++;
                                        var attachment = "", targetAttachment = "";
                                        if (!tourStep.position) {
                                            attachment = "top left";
                                            targetAttachment = "top right";
                                        }
                                        else {
                                            switch (tourStep.position) {
                                                case "top":
                                                    attachment = "bottom left";
                                                    targetAttachment = "top left";
                                                    break;
                                                case "bottom":
                                                    attachment = "top left";
                                                    targetAttachment = "bottom left";
                                                    break;
                                                case "left":
                                                    attachment = "top right";
                                                    targetAttachment = "top left";
                                                    break;
                                                case "right":
                                                    attachment = "top left";
                                                    targetAttachment = "top right";
                                                    break;
                                            }
                                        }
                                        var target = tourStep.key;
                                        if (!target) {
                                            //target = self.tourOverlay;
                                            target = 'body';
                                            attachment = "middle center";
                                            targetAttachment = "middle center";
                                        }
                                        self.tetherObject = new Tether({
                                            element: self.tourBox,
                                            target: target,
                                            attachment: attachment,
                                            targetAttachment: targetAttachment,
                                            constraints: [{
                                                to: 'window',
                                                attachment: 'together',
                                                pin: true
                                            }]
                                        });
                                        var buttonLabel = "Next";
                                        if (self.currentActualStep == self.actualSteps) {
                                            buttonLabel = "Finish";
                                        }
                                        self.tourBox.find('.shepherd-title').text("Step " + self.currentActualStep + " of " + self.actualSteps);
                                        var primaryButton = self.tourBox.find('.shepherd-button-primary');
                                        primaryButton.off();
                                        primaryButton.text(buttonLabel);
                                        primaryButton.click(function (t) {
                                            return function () {
                                                t.destroy();
                                                action.execute(tourStep);
                                                action.cleanup(tourStep);
                                                self.executeNextStep();
                                            };
                                        }(self.tetherObject));
                                    }
                                }
                                else {
                                    setTimeout(function () { self.executeNextStep(retry + 1); }, self.delay);
                                }
                            }
                            else {
                                self.endTour();
                            }
                        }
                    }
                }

                self.endTour = function (abort) {
                    if (abort) {
                        self.tourBox.find('.shepherd-text').text("Something went wrong with this tutorial. We are sorry!");
                        self.tetherObject = new Tether({
                            element: self.tourBox,
                            target: 'body',
                            attachment: 'top left',
                            targetAttachment: 'top left',
                            constraints: [{
                                to: 'window',
                                attachment: 'together'
                            }]
                        });
                        self.tourBox.find('.shepherd-button-primary').off();
                        self.tourBox.find('.shepherd-button-primary').click(function () {
                            self.endTour();
                        });
                    }
                    else {
                        self.isActive = false;
                        //Cleanup
                        try {
                            var tourStep = self.tourSteps[self.currentStep - 1];
                            var action = PageTour.actions[tourStep.type];
                            action.cleanup(tourStep);
                        }
                        catch (e) { } //Fail Silently
                        if (self.tetherObject) {
                            self.tetherObject.destroy();
                            self.tetherObject = null;
                        }
                        if (self.tourOverlay) {
                            self.tourOverlay.hide();
                            self.tourOverlay.remove();
                        }
                        if (self.tourBox) {
                            self.tourBox.hide();
                            self.tourBox.remove();
                        }
                        if (PageTour.isFunction(self.EndTourCallback)) {
                            self.EndTourCallback();
                        }
                    }
                    //        jQuery('.authoringElement').show();
                }
            }

            PageTour.actions = {};

            PageTour.datastore = {};

            PageTour.registerAction = function (name, options) {
                if (!name) {
                    return null;
                }
                if (!options) {
                    options = {};
                }
                if (!options.execute) {
                    options.execute = function () { };
                }
                if (!options.validity) {
                    options.validity = function () { return true; };
                }
                if (!options.cleanup) {
                    options.cleanup = function () { };
                }

                PageTour.actions[name] = {};
                $.extend(PageTour.actions[name], options);
            }

            PageTour.parseXmlToSteps = function (xmlpath) {
                if (xmlpath.indexOf("<?xml") != -1) {
                    var xmlDoc = null;
                    //xml string is given as input, parse it
                    if (window.DOMParser) {
                        var parser = new DOMParser();
                        xmlDoc = parser.parseFromString(xmlpath, "text/xml");
                    }
                    else // Internet Explorer
                    {
                        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async = false;
                        xmlDoc.loadXML(xmlpath);
                    }
                    if (xmlDoc) {
                        return PageTour.processXmlDOMToSteps(xmlDoc);
                    }
                }
                else {
                    var xmlDom = PageTour.readXMLFile(xmlpath);
                    if (!xmlDom) {
                        var newStep = new Object();
                        newStep.type = "Message";
                        newStep.message = "Error loading XML from the specified URL: " + xmlpath;
                        var TSteps = new Array();
                        TSteps.push(newStep);
                        return { actualSteps: 1, stepsArray: TSteps };
                    }
                    else {
                        return PageTour.processXmlDOMToSteps(xmlDom);
                    }
                }
            }

            PageTour.readXMLFile = function (xmlPathFileName) {
                try {
                    //var objXMLDom = new ActiveXObject("MSXML2.DOMDocument.3.0");
                    var txtFile = new XMLHttpRequest();
                    txtFile.open("GET", xmlPathFileName, false);
                    txtFile.send();
                    if (txtFile.status === 200) {
                        // var allText = txtFile.responseText;
                        //objXMLDom.async = false;
                        //objXMLDom.resolveExternals = false;
                        /*objXMLDom.loadXML(allText);
                         if (objXMLDom.parseError.errorCode != 0) {
                             return false;
                         }
                         return objXMLDom;*/
                        return txtFile.responseXML;
                    }
                    return false;
                } catch (ex) {
                    return false;
                }
            }

            //Read XML DOM and represent step tags in a javascript object format
            PageTour.processXmlDOMToSteps = function (xml) {
                var TSteps = new Array();
                var nonSilentSteps = 0;
                var rootnode = xml.documentElement;
                for (var i = 0; i < rootnode.childNodes.length; i++) {
                    var stepnode = rootnode.childNodes[i];
                    if (stepnode.tagName == "step") {
                        var newStep = new Object();
                        for (var j = 0; j < stepnode.childNodes.length; j++) {
                            var currentnode = stepnode.childNodes[j];
                            if (currentnode.textContent) {
                                newStep[currentnode.nodeName] = currentnode.textContent;
                            }
                            else if (currentnode.text) {
                                newStep[currentnode.nodeName] = currentnode.text;
                            }
                            else {
                                newStep[currentnode.nodeName] = "";
                            }
                        }
                        TSteps.push(newStep);
                        if (!(newStep.silent && newStep.silent == "true")) {
                            nonSilentSteps++;
                        }
                    }
                }

                return { actualSteps: nonSilentSteps, stepsArray: TSteps };
            }

            PageTour.selectByText = function (elementId, txt) {
                var matches = jQuery(elementId + ' option')
                    .filter(function () { return $.trim(jQuery(this).val()) == txt; });
                var match = null;
                if (matches.length) {
                    match = matches[0];
                }
                else {
                    matches = jQuery(elementId + ' option')
                        .filter(function () { return $.trim(jQuery(this).text()) == txt; });
                    if (matches.length) {
                        match = matches[0];
                    }
                }
                if (match) {
                    jQuery(elementId).val(jQuery(match).val());
                    jQuery(elementId).change();
                }
            }

            PageTour.isFunction = function (functionToCheck) {
                var getType = {};
                return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
            }

            PageTour.registerAction("Message");

            PageTour.registerAction("Click", {
                execute: function (step) {
                    var element = jQuery(step.key);
                    element.click();
                },
                validity: function (step) {
                    var element = jQuery(step.key);
                    if (element.length && !element.prop("disabled")) {
                        /*PageTour.datastore["lastBorderColor"] = element.css('border-color');
                        PageTour.datastore["lastBorderWidth"] = element.css('border-width');
                        PageTour.datastore["lastBorderStyle"] = element.css('border-style');
                        element.css('border-color', 'red');
                        element.css('border-width', '1px');
                        element.css('border-style', 'solid');*/
                        PageTour.datastore['lastoutline'] = element.css('outline');
                        element.css('outline', '#f00 solid 1px');
                        return step.key;
                    }
                    return null;
                },
                cleanup: function (step) {
                    var element = jQuery(step.key);
                    /*element.css('border-color', PageTour.datastore["lastBorderColor"]);
                    element.css('border-width', PageTour.datastore["lastBorderWidth"]);
                    element.css('border-style', PageTour.datastore["lastBorderStyle"]);*/
                    element.css('outline', PageTour.datastore['lastoutline']);
                }
            });

            PageTour.registerAction("Highlight", {
                validity: function (step) {
                    var element = jQuery(step.key);
                    if (element.length) {
                        /* PageTour.datastore["lastBorderColor"] = element.css('border-color');
                         PageTour.datastore["lastBorderWidth"] = element.css('border-width');
                         PageTour.datastore["lastBorderStyle"] = element.css('border-style');
                         element.css('border-color', 'red');
                         element.css('border-width', '1px');
                         element.css('border-style', 'solid');*/
                        PageTour.datastore['lastoutline'] = element.css('outline');
                        element.css('outline', '#f00 solid 1px');
                        return step.key;
                    }
                    return null;
                },
                cleanup: function (step) {
                    var element = jQuery(step.key);
                    /*element.css('border-color', PageTour.datastore["lastBorderColor"]);
                    element.css('border-width', PageTour.datastore["lastBorderWidth"]);
                    element.css('border-style', PageTour.datastore["lastBorderStyle"]);*/
                    element.css('outline', PageTour.datastore['lastoutline']);
                }
            });

            PageTour.registerAction("SetValue", {
                execute: function (step) {
                    var element = jQuery(step.key);
                    if (element.is("select")) {
                        PageTour.selectByText(step.key, step.value);
                    }
                    else {
                        element.val(step.value);
                    }
                },
                validity: function (step) {
                    var element = jQuery(step.key);
                    if (element.length) {
                        /*PageTour.datastore["lastBorderColor"] = element.css('border-color');
                        PageTour.datastore["lastBorderWidth"] = element.css('border-width');
                        PageTour.datastore["lastBorderStyle"] = element.css('border-style');
                        element.css('border-color', 'red');
                        element.css('border-width', '1px');
                        element.css('border-style', 'solid');*/
                        PageTour.datastore['lastoutline'] = element.css('outline');
                        element.css('outline', '#f00 solid 1px');
                        return step.key;
                    }
                    return null;
                },
                cleanup: function (step) {
                    var element = jQuery(step.key);
                    /*element.css('border-color', PageTour.datastore["lastBorderColor"]);
                    element.css('border-width', PageTour.datastore["lastBorderWidth"]);
                    element.css('border-style', PageTour.datastore["lastBorderStyle"]);*/
                    element.css('outline', PageTour.datastore['lastoutline']);
                }
            });

            PageTour.start = function (xml, endCallback) {
                var instance = null;
                if (xml) {
                    var tSteps = PageTour.parseXmlToSteps(xml);
                    if (tSteps.actualSteps === 0) {
                        alert("Please record inorder to play");
                        return null;
                    }
                    instance = new PageTour(tSteps);
                    jQuery('.authoringElement').hide();
                    instance.EndTourCallback = endCallback;
                    instance.beginTour();
                }
                return instance;
            }

            PageTour.lazyStart = function (xml) {
                jQuery("body").append("<div id='semicircleTour' style='z-index: 21000; position: absolute; top: 0; left: 0; right: 0; margin: auto; height: 50px; width: 100px; background-color: cornflowerblue; border-radius: 0 0 50px 50px; cursor: pointer;'></div>");
                jQuery("#semicircleTour").append("<div style='margin-top: 10px; text-align: center; font-size: 16px; color: white;'>Page Tour</div>");
                jQuery("#semicircleTour").hover(function () { jQuery(this).css('background-color', 'orange'); }, function () { jQuery(this).css('background-color', 'cornflowerblue'); });
                jQuery('#semicircleTour').click(function () {
                    PageTour.start(xml);
                });
            }

            return PageTour;
        }

        return playTutorial;
    }
})();