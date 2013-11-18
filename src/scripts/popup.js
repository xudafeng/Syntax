;(function (global) {
    var doc = document;
    var settings = chrome.extension.getBackgroundPage().Syntax.settings;
    var init = function () {
            chrome.tabs.getSelected(null, function (tab) {
                var toggle = doc.getElementById('J_toggle');
                if (settings.open == '1') {
                    toggle.checked = true;
                }
                toggle.addEventListener('change', function () {
                    chrome.extension.sendRequest({
                        method: "changeSettings",
                        data: toggle.checked ? '1' : '0'
                    }, function (response) {

                    });
                })
            });
        }
    init();
})(this)
