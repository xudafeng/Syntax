;(function (global) {
    function Settings() {
        if (localStorage["Syntax.settings.open"] == null) {
            localStorage["Syntax.settings.open"] = '1';
        }
        return {
            open: localStorage["Syntax.settings.open"]
        };
    };
    chrome.extension.getBackgroundPage().Syntax = {
        settings: new Settings()
    };
    chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
        if (request.method === "getSettings") {
            chrome.pageAction.show(sender.tab.id);
            return sendResponse({
                settings: Syntax.settings
            });
        } else if (request.method === "changeSettings") {
            localStorage["Syntax.settings.open"] = request.data;
            chrome.extension.getBackgroundPage().Syntax.settings = new Settings();
            chrome.tabs.getSelected(null, function (tab) {
                chrome.tabs.sendRequest(tab.id, {
                    type: "toggle",
                    data: request.data
                }, function (response) {});
            });
        }
    });
})()
