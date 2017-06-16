sap.ui.define("sap/ui/chainel1/util/generic/Util", ["./QueryView", "./DataTree", "./Gauge"],
    function (QueryView, DataTree, Gauge) {
        "use strict";
        var Util = {
            matchArray: function (str, array) {
                for (var a in array) {
                    var v = str.match(array[a]);
                    if (v != undefined && v.length > 0)
                        return v;
                }
                return null;
            },
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
                    this.traverseList(list, splitters[i], 0);
                }
                return this.flatten(list);
            },
            traverseList: function (list, splitter, index) {
                //console.log("list="+list[index]);
                if (list[index]) {
                    if ((list.constructor !== String) && (list[index].constructor === String))
                        (list[index] != list[index].split(splitter)) ? list[index] = list[index].split(splitter) : null;
                    (list[index].constructor === Array) ? this.traverseList(list[index], splitter, 0) : null;
                    (list.constructor === Array) ? this.traverseList(list, splitter, index + 1) : null;
                }
            },
            flatten: function (arr) {
                var that = this;
                return arr.reduce(function (acc, val) {
                    //console.log("acc="+acc+" val="+val," val Array ? = "+(val.constructor === Array) );
                    return acc.concat(val.constructor === Array ? that.flatten(val) : val);
                }, []);
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
                // console.log(content);
                return jQuery.ajax(params);
            },
            nvl: function (val1, val2) {
                return ((val1 == null || val1 == undefined || val1.length == 0) ? val2 : val1);
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
            copyComputedStyle2: function (src, dest, ps) {
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
            getAlignTable: function (cc) {
                var al = sap.ui.core.TextAlign.Begin;
                if (cc == "left")
                    al = sap.ui.core.TextAlign.Left;
                if (cc == "right")
                    al = sap.ui.core.TextAlign.Right;
                if (cc == "center")
                    al = sap.ui.core.TextAlign.Center;
                if (cc == "end")
                    al = sap.ui.core.TextAlign.End;
                return al;
            },
            createParas: function (view, pg, st, idAdd, pShowAll) {
                var ia = Util.nvl(idAdd, "");
                var showAll = (pShowAll == undefined ? false : pShowAll);
                var thatView = view;
                var dtx = thatView.colData;
                var sett = sap.ui.getCore().getModel("settings").getData();
                var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
                var combobox = sap.m.ComboBox;
                var input = sap.m.Input;
                var datepicker = sap.m.DatePicker;
                var label = sap.m.Label;
                //if (view.advance_para==und)

                for (var i = 0; i < dtx.parameters.length; i++) {

                    var p, pl, vls;
                    vls = "";
                    if (dtx.parameters[i].PARA_DEFAULT != undefined)
                        vls = dtx.parameters[i].PARA_DEFAULT;

                    (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                    (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);
                    if (dtx.parameters[i].LISTNAME != undefined && dtx.parameters[i].LISTNAME.toString().trim().length > 0) {
                        var dtlist = dtx.parameters[i].LISTNAME;
                        p = new combobox(thatView.createId("para_" + ia + i),
                            {
                                items: {
                                    path: "/",
                                    template: new sap.ui.core.ListItem({
                                        text: "{TITLE} - {CODE}",
                                        key: "{CODE}"
                                    }),
                                    templateShareable: true
                                },
                                selectedKey: vls
                            }).addStyleClass(st);
                        p.setModel(new sap.ui.model.json.JSONModel(dtlist));

                    } else {
                        p = new input(thatView.createId("para_" + ia + i), {
                            placeholder: dtx.parameters[i].PARA_DESCRARB,
                            value: vls
                        }).addStyleClass(st);
                    }
                    pl = new label(thatView.createId("lblpara_" + ia + i), {
                        text: dtx.parameters[i].PARA_DESCRARB,
                        labelFor: p
                    }).addStyleClass(st);

                    if (dtx.parameters[i].PARA_DATATYPE === "DATE") {
                        var vl = null;
                        if (dtx.parameters[i].PARA_DEFAULT != undefined)
                            vl = dtx.parameters[i].PARA_DEFAULT;
                        (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                        (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);
                        p = new datepicker(thatView.createId("para_" + ia + i), {
                            value: (vl != undefined ? vl : ""),
                            valueFormat: sett["ENGLISH_DATE_FORMAT"],
                            displayFormat: sett["ENGLISH_DATE_FORMAT"],
                            placeholder: dtx.parameters[i].PARA_DESCRARB
                        }).addStyleClass(st);
                        pl = new label(thatView.createId("lblpara_" + ia + i), {
                            text: dtx.parameters[i].PARA_DESCRARB,
                            labelFor: p
                        }).addStyleClass(st);
                    }


                    if (showAll || dtx.parameters[i].PROMPT_TYPE != "A")
                        if (pg instanceof sap.m.FlexBox) {
                            pg.addItem(pl);
                            pg.addItem(p);
                        } else {
                            pg.addContent(pl);
                            pg.addContent(p);
                        }
                    else   // else dtx.parameter.prompt_type==="A"
                        view.advance_para.push({"label": pl, "input": p});

                }

            },
            addMenuSubReps: function (view, oMenu, includeGraphOperation) {

                var menu11 = new sap.m.MenuItem({
                    text: "Sub Reports",
                    icon: "sap-icon://column-chart-dual-axis",
                });

                if (includeGraphOperation) {
                    var menu111 = new sap.m.MenuItem({
                        text: "Create new..",
                        icon: "images/add.png",
                        customData: [{key: "graph_new"}]
                    });
                    menu11.addItem(menu111);
                }

                if (view.colData.subreps != undefined) {
                    var cols = [];
                    if (view.qv.mLctb != undefined)
                        for (var c in view.qv.mLctb.cols)
                            if (!view.qv.mLctb.cols[c].mGrouped)
                                cols.push(view.qv.mLctb.cols[c].mColName);
                    for (var i = 0; i < view.colData.subreps.length; i++) {
                        var dms = view.colData.subreps[i].DIMENSIONS.split(",");
                        var fnd = true;
                        if (view.colData.subreps[i].REP_TYPE == "DATASET") {
                            for (var d in dms)
                                if (cols.indexOf(dms[d]) <= -1) {
                                    fnd = false;
                                    break;
                                }
                            if (cols.indexOf(view.colData.subreps[i].MEASURES) <= -1)
                                fnd = false;
                        } else if (view.colData.subreps[i].REP_TYPE == "SQL") {
                            fnd = true;
                            // var rf=Util.nvl(view.colData.subreps[i].RCV_FLDS,"").split(",");
                        }
                        if (fnd)
                            menu11.addItem(new sap.m.MenuItem({
                                text: view.colData.subreps[i].REP_TITLE,
                                customData: [{key: "graph"}, {value: view.colData.subreps[i]}]
                            }));

                    }
                }
                oMenu.addItem(menu11);
            },
            charCount: function (ch, cnt) {
                var s = "";
                for (var i = 0; i < cnt; i++)
                    s += ch;

                return s;
            }
        };


        return Util;
    });


