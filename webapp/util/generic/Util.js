sap.ui.define("sap/ui/chainel1/util/generic/Util", ["./QueryView", "./DataTree", "./QueryView6"],
    function (QueryView, DataTree, QueryView6) {
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
                doAjaxJson: function (path,
                                      content,
                                      async) {
                    var params = {
                        url: "/" + path,
                        context: this,
                        cache: false,
                        dataType: 'json',
                        contentType: 'application/json',
                        mimeType: 'application/json'
                    };
                    params["type"] = "POST";
                    if (async === false) {
                        params["async"] = async;
                    }
                    if (content) {
                        params["data"] = JSON.stringify(content);
                    }
                    console.log(content);
                    return jQuery.ajax(params);
                },
                nvl: function (val1, val2) {
                    return ((val1 != null || val1 != undefined) ? val1 : val2);
                },
                createBar: function (lblId) {
                    var oBar = new sap.m.Bar({
                        contentLeft: [new sap.m.Button({
                            icon: "sap-icon://arrow-left",
                            press: function () {
                                var app = sap.ui.getCore().byId("oSplitApp");
                                app.backDetail();
                            }
                        })],
                        contentMiddle: [new sap.m.Label({
                            text: lblId,
                            textAlign: "Center",
                            design: "Bold"
                        })],

                        contentRight: [new sap.m.Button({
                            icon: "sap-icon://full-screen",
                            press: function () {
                                var app = sap.ui.getCore().byId("oSplitApp");
                                if (app.getMode() == sap.m.SplitAppMode.HideMode)
                                    app.setMode(sap.m.SplitAppMode.ShowHideMode);
                                else
                                    app.setMode(sap.m.SplitAppMode.HideMode);

                                if (window.$.browser.msie) {

                                    setTimeout(that.afterUpdate, 0);

                                } else {

                                    setTimeout(function () {

                                        // resize must be registered on the element
                                        window.dispatchEvent(new Event('resize'));

                                    });

                                }
                            }
                        })]

                    });
                    return oBar;
                },
                cssText: function (a) {

                },
                css: function (a) {
                    var sheets = document.styleSheets, o = {};
                    for (var i in sheets) {
                        var rules = sheets[i].rules || sheets[i].cssRules;
                        for (var r in rules) {
                            if (a.is(rules[r].selectorText)) {
                                o = $.extend(o, this.css2json(rules[r].style), this.css2json(a.attr('style')));
                            }
                        }
                    }
                    return o;
                },
                css2json: function (css) {
                    var s = {};
                    if (!css) return s;
                    if (css instanceof CSSStyleDeclaration) {
                        for (var i in css) {
                            if ((css[i]).toLowerCase) {
                                s[(css[i]).toLowerCase()] = (css[css[i]]);
                            }
                        }
                    } else if (typeof css == "string") {
                        css = css.split("; ");
                        for (var i in css) {
                            var l = css[i].split(": ");
                            s[l[0].toLowerCase()] = (l[1]);
                        }
                    }
                    return s;
                },

                cloneObj: function (obj) {
                    if (null == obj || "object" != typeof obj) return obj;

                    var copy = null;
                    if (obj.prototype.constructor)
                        copy = obj.constructor();
                    for (var attr in obj) {
                        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
                    }
                    return copy;
                },

                realStyle: function (_elem, _style) {
                    var computedStyle;
                    if (typeof _elem.currentStyle != 'undefined') {
                        computedStyle = _elem.currentStyle;
                    } else {
                        computedStyle = document.defaultView.getComputedStyle(_elem, null);
                    }

                    return _style ? computedStyle[_style] : computedStyle;
                },
                copyComputedStyle: function (src, dest) {
                    var s = this.realStyle(src);
                    for (var i in s) {
                        // Do not use `hasOwnProperty`, nothing will get copied
                        if (typeof i == "string" && i != "cssText" && !/\d/.test(i)) {
                            // The try is for setter only properties
                            try {
                                dest.style[i] = s[i];
                                // `fontSize` comes before `font` If `font` is empty, `fontSize` gets
                                // overwritten.  So make sure to reset this property. (hackyhackhack)
                                // Other properties may need similar treatment
                                if (i == "font") {
                                    dest.style.fontSize = s.fontSize;
                                }
                            } catch (e) {
                            }
                        }
                    }
                },
                realStyle2: function (_elem, _style) {
                    var computedStyle;
                    if (typeof _elem.currentStyle != 'undefined') {
                        computedStyle = _elem.currentStyle;
                    } else {
                        computedStyle = document.defaultView.getComputedStyle(_elem, null);
                    }

                    return _style ? computedStyle[_style] : computedStyle;
                },
                copyComputedStyle2: function (src, dest,ps) {
                    var s = this.realStyle2(src);
                    for (var i in s) {
                        // Do not use `hasOwnProperty`, nothing will get copied
                        if (typeof i == "string" && i != "cssText" && !/\d/.test(i)) {
                            // The try is for setter only properties
                            try {
                                dest.style[i] = s[i];
                                // `fontSize` comes before `font` If `font` is empty, `fontSize` gets
                                // overwritten.  So make sure to reset this property. (hackyhackhack)
                                // Other properties may need similar treatment
                                if (i == "font") {
                                    dest.style.fontSize = s.fontSize;
                                }
                            } catch (e) {
                            }
                        }
                    }
                },
            getAlignTable:function (cc) {
                var al=sap.ui.core.TextAlign.Begin;
                if (cc=="left")
                    al=sap.ui.core.TextAlign.Left;
                if (cc=="right")
                    al=sap.ui.core.TextAlign.Right;
                if (cc=="center")
                    al=sap.ui.core.TextAlign.Center;
                if (cc=="end")
                    al=sap.ui.core.TextAlign.End;
                return al;
            }

            }
            ;


        return Util;
    });


