
Components.utils.import("resource:///modules/CustomizableUI.jsm");
let {Services} = Components.utils.import("resource://gre/modules/Services.jsm", {});
let sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);

// let {XPCOMUtils} = ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");

async function waitSelector(parent, query, exists) {
    exists = exists !== undefined ? !!exists : true;
    return new Promise((resolve) => {
        let observer = new MutationObserver(function(mutationsList, observer) {
            let elem = parent.querySelector(query);
            if(exists == (elem !== null)) {
                observer.disconnect();
                resolve(elem);
            }
        });
        observer.observe(parent, { attributes: true, childList: true, subtree: true });
    });
}

(function(){
    let widgetId = "movable-PanelUI-button";
    
    let listener = {
        onWidgetCreated: function(aWidgetId, aArea) {
            if (aWidgetId != widgetId)
                return;
            
            if(listener.css !== undefined)
                sss.unregisterSheet(listener.css, sss.AGENT_SHEET);
            
            listener.css = Services.io.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
#' + aWidgetId + '{\
    list-style-image: url("chrome://browser/skin/menu.svg");\
}\
#PanelUI-button {\
    display: none !important;\
}\
'), null, null);
            
            sss.loadAndRegisterSheet(listener.css, sss.AGENT_SHEET);
        }
    }
    
    CustomizableUI.addListener(listener);
    CustomizableUI.createWidget({
        id: widgetId,
        type: "button",
        defaultArea: CustomizableUI.AREA_NAVBAR,
        label: "Panel UI menu button",
        tooltiptext: "Open menu",
        onCreated: function(node) {
            let originalMenu = node.ownerDocument.defaultView.PanelUI;
            node.addEventListener("mousedown", function(e){
                originalMenu.menuButton = node;
            }, {"capture": true});
            node.addEventListener("mousedown", originalMenu);
            node.addEventListener("keypress", function(e){
                originalMenu.menuButton = node;
            }, {"capture": true});
            node.addEventListener("keypress", originalMenu);
        }
    });
})();
