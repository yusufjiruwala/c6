sap.ui.define("sap/ui/chainel1/util/generic/Util", ["./QueryView", "./DataTree"],
    function (QueryView, DataTree) {
        "use strict";
        var Util = {
            objToStr: function (obj) {
                var str = '';
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        str += p + '::' + obj[p] + '\n';
                    }
                }
                return str;
            },
            splitString: function (string, splitters) {
                var list = [string];
                for (var i = 0, len = splitters.length; i < len; i++) {
                    Utils.traverseList(list, splitters[i], 0);
                }
                return Utils.flatten(list);
            },
            traverseList: function (list, splitter, index) {
                //console.log("list="+list[index]);
                if (list[index]) {
                    if ((list.constructor !== String) && (list[index].constructor === String))
                        (list[index] != list[index].split(splitter)) ? list[index] = list[index].split(splitter) : null;
                    (list[index].constructor === Array) ? Utils.traverseList(list[index], splitter, 0) : null;
                    (list.constructor === Array) ? Utils.traverseList(list, splitter, index + 1) : null;
                }
            },
            doAjaxGet: function (path,
                                 content,
                                 async) {
                var params = {
                    url: "/" + path,
                    context: this,
                    cache: false
                };
                params["type"] = "GET";
                if (async === false) {
                    params["async"] = async;
                }
                if (content) {
                    params["data"] = content;
                }
                return jQuery.ajax(params);
            },
            nvl:function(val1,val2) {
                return ((val1!=null || val1!=undefined)?val1:val2);
            }

        };


        return Util;
    });


