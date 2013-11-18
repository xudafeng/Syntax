;(function (global) {
    var doc = document;
    var uri = global.location.href;
    var settings;
    var code, settings;
    var Syntax = {
        loaded: false,
        init: function () {
            if (!settings || !this.detect()) {
                return;
            }
            if (this.loaded) {
                this.show();
                return;
            }
            this.hideOriginCode();
            this.createHighLightBlock();
            this.bindEvent();
        },
        detect:function(){
            if(/github|gitlab/.test(uri)){
                if(/raw/.test(uri)){
                    return true;
                }else {
                    return false;
                }
            }else {
                return true;
            }
        },
        changeBackground:function(){
            doc.getElementsByTagName('body')[0].style.backgroundColor = '#2f3129';
        },
        hideBackground:function(){
            doc.getElementsByTagName('body')[0].style.backgroundColor = '#fff';
        },
        hideOriginCode: function () {
            var style;
            if (doc.body.firstChild && doc.getElementsByTagName('pre')[0] === doc.body.firstChild) {
                doc.body.firstChild.style.display = 'none';
                code = doc.body.firstChild.innerText;
            }
            style = doc.createElement("link");
            style.href = chrome.extension.getURL("styles/syntax.css");
            style.type = "text/css";
            style.rel = "stylesheet";
            doc.head.appendChild(style);
        },
        createHighLightBlock: function () {
            this.changeBackground();
            var reserve = 'abstract|boolean|byte|char|class|const|debugger|double|enum|export|extends|fimal|float|goto|implements|import|int|interface|long|mative|package|private|protected|public|short|static|super|synchronized|throws|transient|volatile|window|undefined'.split('|');

            function escapeHtml(s) {
                return s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
            }
            var line = document.createElement("div");
            line.id = "line";
            document.body.appendChild(line);
            var highlight = document.createElement("pre");
            highlight.id = "highlight";
            document.body.appendChild(highlight);
            var tokens = passme.tokenize(code, {
                ecmascript: 5,
                whiteSpace: true,
                ranges: true,
                locations: true
            });
            function renderLine(n) {
                var r = '';
                for (var i = 0; i < n - 1; i++) {
                    r += '<div data-pos="pos_'+ (parseInt(i) + 1) +'">' + (parseInt(i) + 1) + '</div>';
                }
                doc.getElementById('line').innerHTML = r;
            }
            var h = '';
            passme._.each(tokens, function (i, key) {
                if (tokens.length - 1 == key) {
                    renderLine(i.locations.end.line);
                }
                if (i.type == 'Identifier') {
                    if (passme._.isIn(i.value, reserve)) {
                        h += '<span class="reserve">' + i.value + '</span>';
                    } else {
                        h += '<span class="' + i.type + '">' + i.value + '</span>';
                    }
                } else if (i.type == 'StringLiteral' || i.type == 'Comment') {
                    h += '<span class="' + i.type + '">' + escapeHtml(i.value) + '</span>';
                } else {
                    h += '<span class="' + i.type + '">' + i.value + '</span>';
                }
            });
            highlight.innerHTML = h;
            highlight.contentEditable = 'true';
            highlight.designMode = 'on';
            this.loaded = true;
        },
        hide: function () {
            if (doc.body.firstChild && doc.getElementsByTagName('pre')[0] === doc.body.firstChild) {
                doc.body.firstChild.style.display = 'block';
                doc.getElementById('highlight').style.display = 'none';
                doc.getElementById('line').style.display = 'none';
            }
            this.hideBackground();
        },
        show: function () {
            if (doc.body.firstChild && doc.getElementsByTagName('pre')[0] === doc.body.firstChild) {
                doc.body.firstChild.style.display = 'none';
                doc.getElementById('highlight').style.display = 'inline-block';
                doc.getElementById('line').style.display = 'block';
            }
            this.changeBackground();
        },
        bindEvent:function(){
            if(location.hash != ''){
                setTimeout(function(){
                    var _pos = location.hash.split('#')[1];
                    for(var i = 0; i < doc.getElementById('line').children.length;i++){
                        var target = doc.getElementById('line').children[i];
                        if(target.getAttribute('data-pos') == _pos){
                            scroll2Pos(target.offsetTop);
                            hoverChange(target);
                            return;
                        }
                    }
                },16);
            }
            function scroll2Pos(pos){
                doc.body.scrollTop = pos - 20 > 0  ? pos - 20 : 0;
            }
            function hoverChange(elm){
                for(var i = 0; i < doc.getElementById('line').children.length;i++){
                    var target = doc.getElementById('line').children[i];
                    target.className = '';
                }
                elm.className += 'color_hover';
            }
            doc.getElementById('line').addEventListener('click',function(e){
                var target = e.target;
                location.hash = target.getAttribute('data-pos');
                hoverChange(target);
                scroll2Pos(target.offsetTop);
            });
        }
    };
    chrome.extension.sendRequest({
        method: "getSettings"
    }, function (response) {
        settings = response.settings;
        if (settings.open !== '1') {
            return;
        }
        Syntax.init();
    });

    chrome.extension.onRequest.addListener(

    function (request, sender, sendResponse) {
        if (request.type == "toggle") {
            if (request.data == '1') {
                Syntax.init();
            } else {
                Syntax.hide();
            }
        }
    });

})(this)
