(function () {
    'use strict';

    angular
        .module('pageTour.services')
        .factory('pageTourAuthorService', pageTourAuthorService);

    pageTourAuthorService.$inject = ['pageTourPlayService'];

    function pageTourAuthorService(pageTourPlayService) {

        var author = null;

        author = function () {

            // PageTour Author - js library for authoring xml's required for walkthroughs using pagetour
            // Version - 1.0
            // Prerequisites - jQuery, jQuery UI, blob.js, filesaver.js
            // Author - Ankur Jain(ajain@microsoft.com)
            // Icons - http://www.iconarchive.com/show/dark-blog-icons-by-brainleaf.html

            //Updates - 
            //Authoring dock on right hand side
            //Use css selectors when recording instead of id for identifying elements

            var PageTourAuthor = function (initialMode, dockEventHandlers, parentElemId) {
                var self = this;
                // declare the embers
                self.initalMode = initialMode;
                self.parentElemId = parentElemId;
                self.dockEventHandlers = dockEventHandlers;
                self.lastSelectedElement = null;
                self.lastSelectedElementDataStore = {};
                self.stepList = [];
                self.stepListContainer = null;
                self.dockBackgroundColor = 'rgba(100,100,100,0.5)';
                self.dock = null;
                self.domLookupBox = null;
                self.xmlBlob = null;

                self.IconCollection = {};

                self.registerDefaultImages = function () {
                    // TODO change the location of the images
                    self.IconCollection['Record'] = 'images/pagetour/record-32.png';
                    self.IconCollection['Steps'] = 'images/pagetour/list-32.png';
                    self.IconCollection['Save'] = 'images/pagetour/save-32.png';
                    self.IconCollection['Play'] = 'images/pagetour/play-32.png';
                    self.IconCollection['Message'] = 'images/pagetour/info-32.png';
                    self.IconCollection['Done'] = 'images/pagetour/ok-32.png';
                    self.IconCollection['Confirm'] = 'images/pagetour/ok-32.png';
                    self.IconCollection['Cancel'] = 'images/pagetour/cancel-32.png';
                    self.IconCollection['Remove'] = 'images/pagetour/cancel-32.png';
                }

                self.registerDefaultImages();

                self.getTypeNames = function () {
                    var types = [];
                    if (pageTourPlayService()) {
                        types = $.map(pageTourPlayService().actions, function (key, value) {
                            if (value !== 'Message') {
                                return value;
                            }
                        });
                    }
                    return types;
                }

                self.getImageForButton = function (buttonName) {
                    if (self.IconCollection[buttonName]) {
                        return self.IconCollection[buttonName];
                    }
                    return null;
                }

                self.initAuthoringDock = function () {
                    self.dock = jQuery('<div class=\'authoringElement authoringDock\' />');
                    self.dock.css({
                        display: 'none',
                        position: 'absolute',
                        zIndex: 20000,
                        background: self.dockBackgroundColor,
                        color: 'black',
                        top: '50px',
                        right: '20px',
                        'font-size': '14px'
                    });

                    self.setupDock(self.initalMode, self.dockEventHandlers);
                    // add a parent div elemId is specified
                    if (self.parentElemId) {
                        self.dock.appendTo(jQuery('#' + self.parentElemId));
                    } else {
                        self.dock.appendTo('body');
                    }
                    self.dock.show();
                }

                self.setupDock = function (mode) {
                    self.dock.empty();
                    switch (mode) {
                        case 'Author':
                            if (self.domLookupBox) {
                                self.domLookupBox = null;
                            }

                            if (self.dockEventHandlers) {
                                if (self.dockEventHandlers.startClicked) {
                                    self.startClickEventHandler = self.dockEventHandlers.startClicked;
                                }

                                if (self.dockEventHandlers.toggleStepList) {
                                    self.toggleStepListEventHandler = self.dockEventHandlers.toggleStepList;
                                }

                                if (self.dockEventHandlers.saveClicked) {
                                    self.saveClickEventHandler = self.dockEventHandlers.saveClicked;
                                }

                                if (self.dockEventHandlers.playClicked) {
                                    self.playClickEventHandler = self.dockEventHandlers.playClicked;
                                }
                            }

                            self.dock.append(self.createDockButton('Record', self.startClickEventHandler));
                            self.dock.append(self.createDockButton('Steps', self.toggleStepListEventHandler));
                            self.dock.append(self.createDockButton('Save', self.saveClickEventHandler));
                            self.dock.append(self.createDockButton('Play', self.playClickEventHandler));
                            break;
                        case 'On':
                            if (self.stepListContainer) {
                                self.stepListContainer.remove();
                                self.stepListContainer = null;
                            }
                            self.dock.append(self.createDockButton('Message', self.messageClickEventHandler));
                            self.domLookupBox = self.createDomLookupBox();
                            self.dock.append(self.domLookupBox);
                            self.dock.append(self.createDockButton('Done', self.doneClickEventHandler));
                            break;
                        case 'Record':
                            self.dock.append(self.createRecordBox(parentElemId));
                            self.dock.find('textarea[name=\'messageText\']').focus();
                            break;
                        case 'Play':
                            if (self.dockEventHandlers && self.dockEventHandlers.playClicked) {
                                self.playClickEventHandler = self.dockEventHandlers.playClicked;
                            }
                            self.dock.append(self.createDockButton('Play', self.playClickEventHandler));
                            break;
                    }
                }

                //imageSize is in pixels
                self.createDockButton = function (name, eventHandler, imageSize) {
                    var imageUrl = self.getImageForButton(name);
                    if (!imageSize) {
                        imageSize = 20;
                    }
                    var imageSizeText = imageSize.toString() + 'px';
                    var imageShrunkSize = Math.floor((imageSize * 3) / 4);
                    var imageShrunkSizeText = imageShrunkSize.toString() + 'px';

                    if (!eventHandler || !name) {
                        return null;
                    }
                    var dockButton = jQuery('<div class=\'authoringElement\'></div>');
                    dockButton.css({
                        'float': 'left',
                        margin: '2px',
                        color: '#ddd',
                        'font-size': '14px',
                        cursor: 'pointer',
                        background: '#222'
                    });
                    if (imageUrl) {
                        dockButton.css({
                            background: 'none',
                            height: imageSizeText,
                            width: imageSizeText
                        });
                        var imgTag = jQuery('<img class=\'authoringElement\' src=\'' + imageUrl + '\' width=' + imageSize + 'px height=' + imageSizeText + 'px alt=\'' + name + '\' />');
                        dockButton.append(imgTag);
                        dockButton.attr('title', name);
                    } else {
                        dockButton.css({
                            'margin-top': '4px',
                            padding: '4px'
                        });
                        var spanTag = jQuery('<span class=\'authoringElement\'></span>');
                        spanTag.text(name);
                        dockButton.append(spanTag);
                    }
                    dockButton.mousedown(function () {
                        jQuery(this).find('img').animate({
                            width: imageShrunkSizeText,
                            height: imageShrunkSizeText
                        }, 100);
                        jQuery(this).find('span').animate({
                            'font-size': '12px'
                        }, 100);
                    });
                    dockButton.click(function (e) {
                        jQuery(this).find('img').animate({
                            width: imageSizeText,
                            height: imageSizeText
                        }, 100, function () {
                            eventHandler(e);
                        });
                        jQuery(this).find('span').animate({
                            'font-size': '14px'
                        }, 100, function () {
                            eventHandler(e);
                        });
                    });
                    dockButton.mouseout(function () {
                        jQuery(this).find('img').animate({
                            width: imageSizeText,
                            height: imageSizeText
                        }, 100);
                        jQuery(this).find('span').animate({
                            'font-size': '14px'
                        }, 100);
                    });

                    return dockButton;
                }

                self.createRecordBox = function () {
                    var recordBox = jQuery('<div class=\'authoringElement\'></div>');

                    var leftCol = jQuery('<div class=\'authoringElement\'></div>');
                    leftCol.css('float', 'left');
                    var leftColTable = jQuery('<table class=\'authoringElement\' style=\'padding: 0; margin: 0;\'></table>');
                    var typeList = self.getTypeNames();
                    var typeSelect = jQuery('<select name=\'typeSelect\' class=\'authoringElement\' style=\'font-size:14px; margin: 0; border: 0;\'></select>');
                    var optionsAsString = '';
                    for (var i = 0; i < typeList.length; i++) {
                        optionsAsString += '<option value=\'' + typeList[i] + '\'';
                        // select the Highlight option by default. 
                        if (typeList[i] === 'Highlight') {
                            optionsAsString += 'selected=\'selectd\'';
                        }
                        optionsAsString += '>' + typeList[i] + '</option>';
                    }
                    typeSelect.append(optionsAsString);
                    var positionList = ['top', 'bottom', 'left', 'right'];
                    var positionSelect = jQuery('<select name=\'positionSelect\' class=\'authoringElement\' style=\'font-size:14px; margin: 0; border: 0;\'></select>');
                    optionsAsString = '<option value=""></option>';
                    for (var i = 0; i < positionList.length; i++) {
                        optionsAsString += '<option value=\'' + positionList[i] + '\'>' + positionList[i] + '</option>';
                    }
                    positionSelect.append(optionsAsString);
                    var typeLabel = jQuery('<label for=\'typeSelect\' class=\'authoringElement\'>Type</label>');
                    var positionLabel = jQuery('<label for=\'positionSelect\' class=\'authoringElement\'>Position</label>');
                    var silentLabel = jQuery('<label for=\'silentCheckbox\' class=\'authoringElement\'>Silent</label>');
                    var silentCheck = jQuery('<input name=\'silentCheckbox\' type=\'checkbox\' class=\'authoringElement\' style=\'margin: 0; border: 0;\' />');
                    var row1 = jQuery('<tr></tr>');
                    var col1 = jQuery('<td style=\'padding: 2px 2px 0px 4px;\'></td>');
                    var col2 = jQuery('<td style=\'padding: 2px 0px 0px 2px;\'></td>');
                    col1.append(typeLabel);
                    col2.append(typeSelect);
                    row1.append(col1).append(col2);
                    var row2 = jQuery('<tr></tr>');
                    var col1 = jQuery('<td style=\'padding: 0px 2px 0px 4px;\'></td>');
                    var col2 = jQuery('<td style=\'padding: 0px 0px 0px 2px;\'></td>');
                    col1.append(silentLabel);
                    col2.append(silentCheck);
                    row2.append(col1).append(col2);
                    var row3 = jQuery('<tr></tr>');
                    var col1 = jQuery('<td style=\'padding: 0px 2px 0px 4px;\'></td>');
                    var col2 = jQuery('<td style=\'padding: 0px 0px 0px 2px;\'></td>');
                    col1.append(positionLabel);
                    col2.append(positionSelect);
                    row3.append(col1).append(col2);
                    leftColTable.append(row1).append(row2).append(row3);
                    leftCol.append(leftColTable);

                    var middleCol = jQuery('<div class=\'authoringElement\' style=\'float: left;\'></div>');
                    middleCol.append('<textarea autofocus style=\'margin: 8px 4px; font-size: 14px; border: 0;\' rows=3 cols=50 name=\'messageText\'></textarea>');

                    var rightCol = jQuery('<div class=\'authoringElement\' style=\'float: left;\'></div>');
                    var rightColTable = jQuery('<table class=\'authoringElement\' style=\'padding: 0; margin: 0;\'></table>');
                    var valueLabel = jQuery('<label for=\'valueInput\' class=\'authoringElement\'>Value</label>');
                    var valueInput = jQuery('<input type=\'input\' class=\'authoringElement\' name=\'valueInput\' style=\'font-size:14px; margin: 0; border: 0; margin-top: 6px;\' />');
                    var additionalInput = jQuery('<input type=\'input\' class=\'authoringElement\' name=\'additionalInput\' placeholder=\'Optional. Format: key1:value1;key2:value2\' style=\'height: 28px; font-size:14px; margin: 0; border: 0; width: 100%; padding: 2px;\' />');
                    var row1 = jQuery('<tr></tr>');
                    var col1 = jQuery('<td style=\'padding: 3px 2px 0px 4px;\'></td>');
                    var col2 = jQuery('<td style=\'padding: 2px 0px 0px 2px;\'></td>');
                    col1.append(valueLabel);
                    col2.append(valueInput);
                    row1.append(col1).append(col2);
                    var row2 = jQuery('<tr></tr>');
                    var col1 = jQuery('<td style=\'padding: 0px 2px 0px 4px;\' colspan=2></td>');
                    col1.append(additionalInput);
                    row2.append(col1);
                    rightColTable.append(row1).append(row2);
                    rightCol.append(rightColTable);

                    var buttonCol = jQuery('<div class=\'authoringElement\' style=\'float: left; margin-left: 4px;\'></div>');
                    buttonCol.append(self.createDockButton('Confirm', self.confirmClicked));
                    buttonCol.append(self.createDockButton('Cancel', self.startClickEventHandler).css('clear', 'both'));

                    recordBox.append(leftCol);
                    recordBox.append(middleCol);
                    recordBox.append(rightCol);
                    recordBox.append(buttonCol);
                    return recordBox;
                }

                self.startClickEventHandler = function () {
                    //In case we are coming back from Confirm/Cancel button on record stage
                    self.disablePageInspector(true);
                    if (self.lastSelectedElement) {
                        self.lastSelectedElement[0].style['outline'] = self.lastSelectedElementDataStore['outline'];
                    }
                    self.setupDock('On');
                    self.enablePageInspector();
                };

                self.toggleStepListEventHandler = function () {
                    if (self.stepListContainer && self.stepListContainer.is(':visible')) {
                        self.stepListContainer.hide();
                        return null;
                    }

                    if (self.stepListContainer) {
                        self.stepListContainer.empty();
                    } else {
                        self.stepListContainer = jQuery('<div class=\'authoringElement stepListAuthoring\'></div>');
                        self.stepListContainer.css({
                            display: "none",
                            position: "absolute",
                            zIndex: 20000,
                            color: 'white',
                            top: '90px',
                            right: '20px',
                            'font-size': '12px',
                            'line-height': '16px'
                        });
                    }

                    var emptyList = self.stepList.length === 0;

                    if (emptyList) {
                        alert('Please record in order to see the steps');
                        return null;
                    }

                    for (var i = 0; i < self.stepList.length; i++) {
                        var stepBox = jQuery('<div class=\'authoringElement\' style=\'margin-top: 4px; float: left; clear: both;\'></div>');
                        stepBox.css('background', self.dockBackgroundColor);
                        var stepDetailBox = jQuery('<div class=\'authoringElement\'></div>');
                        stepDetailBox.css({
                            'float': 'left',
                            width: '200px',
                            background: '#222',
                            padding: '2px 4px'
                        });
                        stepDetailBox.append('<span style=\'float: left;\'>' + self.stepList[i].type + '</span>');
                        if (self.stepList[i].key) {
                            stepDetailBox.append('<span style=\'float: left;\'>&nbsp;&nbsp;-&nbsp;&nbsp;' + self.stepList[i].key + '</span>');
                        }
                        if (self.stepList[i].type !== 'Message' && self.stepList[i].silent) {
                            stepDetailBox.append('<span style=\'clear: both; overflow: hidden; width: 195px; text-overflow: ellipsis; float: left; color: #ccc\'>Silent step</span>');
                        } else {
                            stepDetailBox.append('<span style=\'clear: both; overflow: hidden; width: 195px; text-overflow: ellipsis; float: left; color: #ccc\'>' + self.stepList[i].message + '</span>');
                        }

                        stepBox.append(stepDetailBox);
                        stepBox.append(self.createDockButton('Remove', self.deleteStepClicked, 16).attr('data-stepindex', i));
                        self.stepListContainer.append(stepBox);
                    }

                    // TODO enhance this close button
                    /*var closeButton = jQuery('<div class=\'authoringElement\' style=\'clear: both; overflow: hidden; width: 195px; text-overflow: ellipsis; float: left;\'><span id=\'close\' style=\'outline: red solid 2px\'>X<\span></div>');
                    closeButton.click(function () {
                        jQuery('.stepListAuthoring').remove();
                    });
                    stepListContainer.prepend(closeButton);*/
                    if (self.parentElemId) {
                        self.stepListContainer.appendTo(jQuery('#' + self.parentElemId));
                    } else {
                        self.stepListContainer.appendTo('body');
                    }
                    self.stepListContainer.show();
                };

                self.saveClickEventHandler = function () {
                    PageTourAuthor.saveClickEventHandler(self.createXmlString());
                };

                self.playClickEventHandler = function () {
                    pageTourPlayService().start(self.createXmlString());
                };
                self.messageClickEventHandler = function () {
                    self.disablePageInspector(true);
                    self.setupDock('Record');
                    self.dock.find('select[name=\'typeSelect\']').parent().parent().parent().hide();
                    self.dock.find('input[name=\'valueInput\']').parent().parent().parent().hide();
                };

                self.doneClickEventHandler = function () {
                    self.disablePageInspector(true);
                    self.setupDock('Author');
                };

                self.deleteStepClicked = function (e) {
                    self.stepList.splice(parseInt(jQuery(e.currentTarget).attr('data-stepindex')), 1);
                    jQuery(e.currentTarget).parent().fadeOut('slow', function () {
                        /*toggleStepList(parentElemId);
                        toggleStepList(parentElemId);*/
                        self.toggleStepListEventHandler();
                        self.toggleStepListEventHandler();
                    });
                }

                self.confirmClicked = function () {
                    if (self.validateForm()) {
                        var typeElement = self.dock.find('select[name=\'typeSelect\']');
                        var type = 'Message';
                        if (typeElement.is(':visible')) {
                            type = typeElement.val();
                        }
                        var message = self.dock.find('textarea[name=\'messageText\']').val();
                        var newStep = {};
                        newStep.type = type;
                        newStep.message = message;

                        if (type !== 'Message') {
                            var isSilent = self.dock.find('input[name=\'silentCheckbox\']').is(':checked');
                            var value = self.dock.find('input[name=\'valueInput\']').val();
                            var additional = self.dock.find('input[name=\'additionalInput\']').val();
                            var valArr = additional.split(';');
                            var positionVal = self.dock.find('select[name=\'positionSelect\']').val();

                            //newStep.key = lastSelectedElement.attr('id');
                            newStep.key = self.getDomFullPath(self.lastSelectedElement[0]);
                            if (type !== 'Highlight' && type !== 'Click') {
                                newStep.value = value;
                            }
                            for (var i = 0; i < valArr.length; i++) {
                                var keyvalue = valArr[i].split(':');
                                if (keyvalue.length == 2) {
                                    newStep[keyvalue[0]] = keyvalue[1];
                                }
                            }
                            if (isSilent) {
                                newStep.silent = 'true';
                            }
                            if (positionVal) {
                                newStep.position = positionVal;
                            }
                        }

                        self.checkAndPushStep(newStep);
                        if (self.lastSelectedElement) {
                            self.lastSelectedElement[0].style['outline'] = self.lastSelectedElementDataStore['outline'];
                        }
                        self.startClickEventHandler();
                    }
                }

                self.checkAndPushStep = function (newStep) {
                    self.stepList.forEach(function (step) {
                        if (newStep.key === step.key && newStep.type === step.type) {
                            self.stepList.splice(self.stepList.indexOf(step), 1);
                        }
                    });

                    self.stepList.push(newStep);
                }

                self.validateForm = function () {
                    var typeElement = self.dock.find('select[name=\'typeSelect\']');
                    var messageElement = self.dock.find('textarea[name=\'messageText\']');
                    var valueElement = self.dock.find('input[name=\'valueInput\']');
                    var isSilent = self.dock.find('input[name=\'silentCheckbox\']').is(':checked');
                    var type = 'Message';
                    if (typeElement.is(':visible')) {
                        type = typeElement.val();
                    }
                    var message = messageElement.val();
                    var value = valueElement.val();

                    if (type === 'Message') {
                        if (!message || message.trim().length === 0) {
                            messageElement.css('outline', '#f00 solid 1px');
                            setTimeout(function () { messageElement.css({ 'borderWidth': '0px' }); }, 3000);
                            return false;
                        }
                    } else {
                        var validated = true;
                        if (!isSilent) {
                            if (!message || !message.trim().length) {
                                messageElement.css('outline', '#f00 solid 1px');
                                setTimeout(function () { messageElement.css({ 'borderWidth': '0px' }); }, 3000);
                                validated = false;
                            }
                        }
                        if (type === 'SetValue') {
                            if (!value || !value.length) {
                                valueElement.css('outline', '#f00 solid 1px');
                                setTimeout(function () { valueElement.css({ 'borderWidth': '0px' }); }, 3000);
                                validated = false;
                            }
                        }
                        return validated;
                    }
                    return true;
                }

                self.createXmlString = function () {
                    var str = '<?xml version=\'1.0\' encoding=\'utf-8\'?>';
                    str += '\n<tutorial>';
                    if (self.stepList.length === 0) {
                        alert('Please record inorder to save the tutorial');
                        return null;
                    }
                    for (var i = 0; i < self.stepList.length; i++) {
                        var currentStep = self.stepList[i];
                        str += '\n<step>';
                        for (var prop in currentStep) {
                            if (currentStep.hasOwnProperty(prop)) {
                                str += '\n<' + prop + '>';
                                str += currentStep[prop];
                                str += '</' + prop + '>';
                            }
                        }
                        str += '\n</step>';
                    }
                    str += '\n</tutorial>';

                    return str;
                }

                self.enablePageInspector = function () {
                    var box = jQuery('<div class=\'inspectorOutline\' />').css({
                        display: 'none',
                        position: 'absolute',
                        zIndex: 19000,
                        background: 'rgba(255, 0, 0, .3)',
                        border: '1px solid red'
                    }).appendTo('body');

                    box.click(function () {
                        if (self.lastSelectedElement.length) {
                            //if(lastSelectedElement.attr('id')){
                            self.disablePageInspector(true);
                            self.lastSelectedElementDataStore['outline'] = self.lastSelectedElement[0].style['outline'];
                            self.lastSelectedElement[0].style['outline'] = '#f00 solid 1px';
                            self.setupDock('Record');
                            //}
                        }
                    });

                    var last = +new Date;

                    jQuery('body').mousemove(function (e) {
                        var el = e.target;
                        var now = +new Date;
                        if (now - last < 25)
                            return;
                        last = now;
                        if (el === document.body) {
                            box.hide();
                            return;
                        } else if (el.className === 'inspectorOutline') {
                            box.hide();
                            el = document.elementFromPoint(e.clientX, e.clientY);
                            if (el.className === 'authoringElement') {
                                return;
                            }
                        } else if (el.className === 'authoringElement') {
                            return;
                        }
                        el = jQuery(el);
                        var offset = el.offset();
                        self.showDomData(el);
                        box.css({
                            width: el.outerWidth() - 1,
                            height: el.outerHeight() - 1,
                            left: offset.left,
                            top: offset.top
                        });
                        box.show();
                    });
                }

                self.disablePageInspector = function (abort) {
                    if (jQuery('.inspectorOutline').length) {
                        jQuery('.inspectorOutline').off('click');
                        if (abort) {
                            jQuery('.inspectorOutline').remove();
                        }
                    }
                    jQuery('body').off('mousemove');
                }

                self.getDomFullPath = function (el) {
                    var names = [];
                    while (el.parentNode) {
                        if (el.id) {
                            names.unshift('#' + el.id);
                            break;
                        } else {
                            if (el === el.ownerDocument.documentElement) names.unshift(el.tagName);
                            else {
                                for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
                                names.unshift(el.tagName + ':nth-child(' + c + ')');
                            }
                            el = el.parentNode;
                        }
                    }
                    return names.join(' > ');
                }

                self.createDomLookupBox = function () {
                    var box = jQuery('<textarea class=\'authoringElement\' readonly=\'readonly\'></textarea>');
                    box.css({
                        'width': '250px',
                        'height': '30px',
                        'border': '0',
                        'color': '#222',
                        'float': 'left',
                        'font-size': '10px',
                        'margin': '4px',
                        'padding-left': '4px',
                        'line-height': '10px'
                    });
                    return box;
                }

                self.showDomData = function (element) {
                    self.lastSelectedElement = element;
                    if (element && self.domLookupBox) {
                        //if(element.attr('id')){
                        //	domLookupBox.val('#' + element.attr('id'));
                        //}
                        //else{
                        //	domLookupBox.val("Id not present for the selection");
                        //}

                        self.domLookupBox.val(self.getDomFullPath(element[0]));
                    }
                }
            }

            PageTourAuthor.initializeDock = function (initialMode, dockEventHandlers, parentElemId) {
                var instance = new PageTourAuthor(initialMode, dockEventHandlers, parentElemId);
                instance.initAuthoringDock();
                return instance;
            }

            PageTourAuthor.saveClickEventHandler = function (xmlStr) {
                if (xmlStr) {
                    var xmlDiv = jQuery('<div class=\'tourXmlDiv\' style=\'z-index:2000;overflow:auto;position:relative;height:400px;top:20px;left:20px;width:400px;background:white;border:2px solid black;\'></div>');
                    xmlDiv.text(xmlStr);
                    var closeButton = jQuery('<button>X</button>');
                    closeButton.click(function () {
                        jQuery('.tourXmlDiv').remove();
                    });
                    xmlDiv.prepend(closeButton);
                    if (self.parentElemId) {
                        jQuery('#' + self.parentElemId).append(xmlDiv);
                    } else {
                        jQuery('body').append(xmlDiv);
                    }

                    // TODO change this logic to store the xml at a location.
                    var fileName = '';
                    var fileNameToSaveAs = 'E:\\GRM\\Codebase\\PS-CM-Grm-ResourceManagement\\Grm\\Microsoft.IT.GRM\\Microsoft.IT.GRM.Web\\wwwroot\\resource\\Tutorial.xml';
                    saveAs(
                        new Blob(
                            [xmlStr], { type: 'text/xml;charset=' + document.characterSet }
                        ), fileNameToSaveAs
                    );
                }                
            };

            return PageTourAuthor;
        };
        return author;
    }

})();