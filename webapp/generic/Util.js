sap.ui.define("sap/ui/ce/generic/Util", [],
    function () {
        "use strict";
        var Util = {
            ajaxPre: "",
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

            doAjaxGetSpin: function (path,
                                     content,
                                     async, fnDone, fnFail, chk) {
                if (chk == undefined || chk)
                    this.doSpin("Executing Query...");
                var that = this;
                setTimeout(function () {
                    that.doAjaxGet(path, content, async).done(fnDone);
                }, 100);
            },
            doAjaxGet: function (path,
                                 content,
                                 async) {
                var params = {
                    url: this.ajaxPre + path,
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
            doXhr: function (path,
                             async, onld) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', path, async);
                xhr.responseType = 'arraybuffer';
                xhr.onload = onld;
                xhr.send();
                return xhr;
            },
            doAjaxPost: function (path,
                                  content,
                                  async) {
                var params = {
                    url: this.ajaxPre + path,
                    context: this,
                    cache: false
                };
                params["type"] = "POST";
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
                    url: this.ajaxPre + path,
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
            getServerValue: function (str) {
                var ret;
                this.doAjaxGet(str, null, false).done(function (data) {
                    ret = JSON.parse(data).return;
                });
                return ret;
            },
            nvl: function (val1, val2) {
                return ((val1 == null || val1 == undefined || val1.length == 0) ? val2 : val1);
            },
            nvlObjToStr: function (val1, val2) {
                return ((val1 == null || val1 == undefined || val1.length == 0) ? val2 + "" : val1 + "");
            },
            createBar: function (lblId, pBackMaster) {
                var backMaster = this.nvl(pBackMaster, true);
                var b = new sap.m.Button({
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
                });
                var flRight = new sap.m.FlexBox({direction: sap.m.FlexDirection.Row, items: [b]});
                var flLeft = new sap.m.FlexBox({
                    direction: sap.m.FlexDirection.Row, items: [new sap.m.Button({
                        icon: "sap-icon://arrow-left",
                        press: function () {
                            var app = sap.ui.getCore().byId("oSplitApp");
                            if (!sap.ui.Device.system.phone) {
                                //app.toDetail(app.getDetailPages()[0]);
                                app.backDetail();
                                if (backMaster)
                                    app.toMaster(app.getMasterPages()[0]);
                            } else {
                                app.backMaster();
                                // if (backMaster)
                                //     app.showMaster();
                            }
                        }
                    })]
                });
                var flMiddle = new sap.m.FlexBox({
                    direction: sap.m.FlexDirection.Row, items: [new sap.m.Label({
                        text: lblId,
                        textAlign: "Center",
                        design: "Bold"
                    })]
                });

                var oBar = new sap.m.Bar({
                    contentLeft: [flLeft],
                    contentMiddle: [flMiddle],

                    contentRight: [flRight]

                }).addStyleClass("sapContrast sapMIBar");
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
                if (cc == "left" || cc == "ALIGN_LEFT")
                    al = sap.ui.core.TextAlign.Left;
                if (cc == "right" || cc == "ALIGN_RIGHT")
                    al = sap.ui.core.TextAlign.Right;
                if (cc == "center" || cc == "ALIGN_CENTER")
                    al = sap.ui.core.TextAlign.Center;
                if (cc == "end" || cc == "ALIGN_END")
                    al = sap.ui.core.TextAlign.End;
                return al;
            },
            createParas: function (view, pg, st, idAdd, pShowAll, pWidth, forceshowGroups) {
                //declaring variables will be used in function
                var ia = Util.nvl(idAdd, "");
                var showAll = (pShowAll == undefined ? false : pShowAll);
                var query_para = {};
                if (sap.ui.getCore().getModel("query_para") != undefined)
                    query_para = sap.ui.getCore().getModel("query_para").getData();
                var thatView = view;
                var dtx = thatView.colData;
                var sett = sap.ui.getCore().getModel("settings").getData();
                var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
                var combobox = sap.m.ComboBox;
                var searchfield = sap.m.SearchField;
                var input = sap.m.Input;
                var datepicker = sap.m.DatePicker;
                var label = sap.ui.commons.Label;
                var checkbox = sap.m.CheckBox;
                var that = this;
                // adding groups header and detail,if groups found more than 2 otherwise forceshowGroups ==true
                if (forceshowGroups || dtx.groups.length > 2) {
                    (thatView.byId("txtGroupHeader") != undefined ? thatView.byId("txtGroupHeader").destroy() : null);
                    var txtGroupHeader = new sap.m.ComboBox(thatView.createId("txtGroupHeader"),
                        {
                            items: {
                                path: "/",
                                template: new sap.ui.core.ListItem({
                                    text: "{group_name}",
                                    key: "{group_name}"
                                }),
                                templateShareable: true
                            },
                            value: dtx.group1.default

                        }).addStyleClass(st);
                    (thatView.byId("lblgroupheader") != undefined ? thatView.byId("lblgroupheader").destroy() : null);
                    var lblG = new sap.m.Label(thatView.createId("lblgroupheader"), {
                        text: "Group Header",
                        labelFor: txtGroupHeader
                    }).addStyleClass(st);

                    (thatView.byId("txtGroupDetail") != undefined ? thatView.byId("txtGroupDetail").destroy() : null);
                    var txtGroupDetail = new sap.m.ComboBox(thatView.createId("txtGroupDetail"),
                        {
                            items: {
                                path: "/",
                                template: new sap.ui.core.ListItem({
                                    text: "{group_name}",
                                    key: "{group_name}"
                                }),
                                templateShareable: true
                            },
                            value: dtx.group2.default
                        }).addStyleClass(st);

                    (thatView.byId("lblgroupdetail") != undefined ? thatView.byId("lblgroupdetail").destroy() : null);
                    var lblD = new sap.m.Label(thatView.createId("lblgroupdetail"), {
                        text: "Group Details",
                        labelFor: txtGroupDetail
                    }).addStyleClass(st);

                    txtGroupDetail.setModel(new sap.ui.model.json.JSONModel(dtx.groups));
                    txtGroupHeader.setModel(new sap.ui.model.json.JSONModel(dtx.groups));

                    var e1 = Util.nvl(dtx.group1.exclude, "").split(",");
                    for (var e in e1)
                        txtGroupHeader.removeItem(this.findComboItem(txtGroupHeader, e1[e]));
                    var e2 = Util.nvl(dtx.group2.exclude, "").split(",");
                    for (var e in e2)
                        txtGroupDetail.removeItem(this.findComboItem(txtGroupDetail, e2[e]));

                    if (pg instanceof sap.m.FlexBox) {
                        if (dtx.group1.visible == 'TRUE') {
                            pg.addItem(lblG);
                            pg.addItem(txtGroupHeader);
                        }
                        if (dtx.group2.visible == 'TRUE') {
                            pg.addItem(lblD);
                            pg.addItem(txtGroupDetail);
                        }

                    } else {
                        if (dtx.group1.visible == 'TRUE') {
                            pg.addContent(lblG);
                            pg.addContent(txtGroupHeader);
                        }
                        if (dtx.group2.visible == 'TRUE') {
                            pg.addContent(lblD);
                            pg.addContent(txtGroupDetail);
                        }
                    }

                }
                // adding parameters ...
                var lval = ""
                    , cval = "", tit = "";
                for (var i = 0; i < Util.nvl(dtx.parameters, []).length; i++) {
                    var p, pl = undefined, vls;
                    cval = that.getLangDescrAR(dtx.parameters[i].PARA_DESCRARB, dtx.parameters[i].PARA_DESCRENG);
                    tit = that.getLangDescrAR(dtx.parameters[i].TITLE_GROUP, dtx.parameters[i].TITLE_GROUP_AR);
                    vls = "";
                    if (dtx.parameters[i].PARA_DEFAULT != undefined)
                        vls = dtx.parameters[i].PARA_DEFAULT;
                    if (query_para[dtx.parameters[i].PARAM_NAME] != undefined && query_para[dtx.parameters[i].PARAM_NAME] + "".length != 0)
                        vls = query_para[dtx.parameters[i].PARAM_NAME];
                    (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                    (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);
                    if (dtx.parameters[i].LISTNAME != undefined && dtx.parameters[i].LISTNAME.toString().trim().length > 0) {
                        var dtlist = dtx.parameters[i].LISTNAME;

                        p = new searchfield(thatView.createId("para_" + ia + i),
                            {
                                value: vls,
                                width: this.nvl(pWidth, dtx.parameters[i].WIDTH),
                                customData: [{key: dtlist}],
                                search: function (e) {
                                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed)
                                        return;
                                    var src = e.getSource();
                                    var dtlist2 = src.getCustomData()[0].getKey();
                                    var q = e.getParameters("query").query;
                                    if ((q == undefined || q.trim() == "") && (thatView.searchNullFirstTime == undefined || thatView.searchNullFirstTime == false)) {
                                        thatView.searchNullFirstTime = true;
                                        return;
                                    }

                                    thatView.searchNullFirstTime = false;

                                    var v = dtlist2.replace(/&SEARCHTITLE/g, q).replace(/&SEARCHCODE/g, "%");
                                    if (q != undefined && q.endsWith("%")) {
                                        v = dtlist2.replace(/&SEARCHCODE/g, q);
                                        v = v.replace(/&SEARCHTITLE/g, '');
                                    }

                                    Util.doAjaxJson("sqlmetadata", {
                                        sql: v,
                                        ret: "NONE",
                                        data: null
                                    }, false).done(function (data) {
                                        console.log(data);
                                        var dt = JSON.parse("{" + data.data + "}").data;
                                        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(dt), "searchList");
                                        var t = {
                                            frag_liveChange: function (event) {
                                                var val = event.getParameter("value");
                                                var filter = new sap.ui.model.Filter("TITLE", sap.ui.model.FilterOperator.Contains, val);
                                                var binding = event.getSource().getBinding("items");
                                                binding.filter(filter);
                                            },
                                            frag_confirm: function (event) {
                                                var val = event.getParameters().selectedItem.getTitle();
                                                var valx = event.getParameters().selectedItem.getCustomData()[0];
                                                //console.log(valx+"- "+val);
                                                sap.m.MessageToast.show(valx.getKey());
                                                src.setValue(valx.getKey());

                                            }
                                        };
                                        var oFragment = sap.ui.jsfragment("bin.searchList", t);
                                        oFragment.open();
                                    });
                                }
                            }).addStyleClass(st);
                        if (lval != cval)
                            pl = new label(thatView.createId("lblpara_" + ia + i), {
                                text: cval,
                                // labelFor: p
                            }).addStyleClass(st);


                    } else {
                        if (dtx.parameters[i].PARA_DATATYPE !== "DATE" || dtx.parameters[i].PARA_DATATYPE !== "BOOLEAN") {
                            (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                            (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);
                            p = new input(thatView.createId("para_" + ia + i), {
                                placeholder: dtx.parameters[i].PARA_DESCRARB,
                                value: vls,
                                width: this.nvl(pWidth, dtx.parameters[i].WIDTH),
                            }).addStyleClass(st);
                            if (lval != cval)
                                pl = new label(thatView.createId("lblpara_" + ia + i), {
                                    text: cval,
                                    // labelFor: p
                                }).addStyleClass(st);
                        } // end if for PARA_DATATYPE !== "DATE" || PARA_DATATYPE !== "BOOLEAN"
                    }
                    if (dtx.parameters[i].PARA_DATATYPE === "DATE") {
                        var vl = null;
                        if (dtx.parameters[i].PARA_DEFAULT != undefined)
                            vl = dtx.parameters[i].PARA_DEFAULT;
                        if (vls != undefined)
                            vl = vls;
                        (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                        (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);
                        p = new datepicker(thatView.createId("para_" + ia + i), {
                            value: (vl != undefined ? vl : ""),
                            valueFormat: sett["ENGLISH_DATE_FORMAT"],
                            displayFormat: sett["ENGLISH_DATE_FORMAT"],
                            placeholder: cval,
                            width: this.nvl(pWidth, dtx.parameters[i].WIDTH),
                        }).addStyleClass(st);
                        if (lval != cval)
                            pl = new label(thatView.createId("lblpara_" + ia + i), {
                                text: cval,
                                // labelFor: p
                            }).addStyleClass(st);
                    }
                    if (dtx.parameters[i].PARA_DATATYPE === "BOOLEAN") {
                        (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                        (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);
                        p = new checkbox(thatView.createId("para_" + ia + i), {
                            selected: (vls == "TRUE" ? true : false),
                            //text: dtx.parameters[i].PARA_DESCRARB,
                            width: this.nvl(pWidth, dtx.parameters[i].WIDTH),
                        });
                        if (lval != cval)
                            pl = new label(thatView.createId("lblpara_" + ia + i), {
                                text: cval,
//                                labelFor: p
                            }).addStyleClass(st);

                    }
                    if (dtx.parameters[i].PARA_DATATYPE === "GROUP") {
                        var ls1 = dtx.parameters[i].LISTNAME.split(",");
                        var si = 0; // selected index...
                        var bts = [];
                        for (var l in ls1) {
                            var l2 = ls1[l].split("=");
                            var bt = new sap.m.RadioButton(
                                {
                                    text: l2[0], customData: [{key: l2[1]}]
                                }
                            );
                            if (l2[1] == dtx.parameters[i].PARA_DEFAULT)
                                si = l;
                            bts.push(bt);
                        }

                        (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                        (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);

                        p = new sap.m.RadioButtonGroup(thatView.createId("para_" + ia + i), {
                            selectedIndex: (si != 0 ? Number(si) : si),
                            buttons: bts
                        });
                        if (lval != cval)
                            pl = new label(thatView.createId("lblpara_" + ia + i), {
                                text: cval,
                                // labelFor: p
                            }).addStyleClass(st);
                    }

                    if (showAll || dtx.parameters[i].PROMPT_TYPE != "A") {
                        if (pg instanceof sap.m.FlexBox) {
                            if (pl != undefined) pg.addItem(pl);
                            pg.addItem(p);
                        } else {
                            if (Util.nvl(tit, "").length > 0)
                                pg.addContent(new sap.ui.commons.Title({text: tit}));
                            if (pl != undefined) pg.addContent(pl);
                            if (p != undefined) {
                                var lc = pg.getContent()[pg.getContent().length - 1];
                                pg.addContent(p);
                                if (pl == undefined) {
                                    p.setLayoutData(new sap.ui.layout.GridData({span: "XL1 L2 M3 S4"}));
                                    lc.setLayoutData(new sap.ui.layout.GridData({span: "XL1 L2 M3 S4"}));
                                }
                            }
                            //pg.addContent(pl);
                        }
                    }
                    lval = cval;
                    //else   // else dtx.parameter.prompt_type==="A"
                    //  view.advance_para.push({"label": pl, "input": p});

                }

            },  //ending here createParas function
            addMenuSubReps: function (view, oMenu, includeGraphOperation) {
                var menu11 = oMenu;
                if (includeGraphOperation) {
                    menu11 = new sap.m.MenuItem({
                        text: "Sub Reports",
                        icon: "sap-icon://column-chart-dual-axis",
                    });

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
                        } else if (view.colData.subreps[i].REP_TYPE == "SQL" || view.colData.subreps[i].REP_TYPE == "PDF") {
                            fnd = true;
                        } else if (view.colData.subreps[i].REP_TYPE.startsWith("FIX_")) {
                            fnd = false;
                            //break;
                        }
                        if (fnd)
                            menu11.addItem(new sap.m.MenuItem({
                                text: this.getLangDescrAR(view.colData.subreps[i].REP_TITLE, view.colData.subreps[i].REP_TITLE_ARB),
                                customData: [{key: "graph"}, {value: view.colData.subreps[i]}]
                            }));

                    }
                }
                if (oMenu != menu11)
                    oMenu.addItem(menu11);
            },
            charCount: function (ch, cnt) {
                var s = "";
                for (var i = 0; i < cnt; i++)
                    s += ch;

                return s;
            },
            toOraDateString: function (dt) {
                var sett = sap.ui.getCore().getModel("settings").getData();

                if (typeof dt == "string") {
                    return "to_date('" + dt + "','" + sett["ENGLISH_DATE_FORMAT_ORA"] + "')";
                } else if (dt instanceof Date) {
                    var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
                    return "to_date('" + sf.format(dt) + "','" + sett["ENGLISH_DATE_FORMAT_ORA"] + "')";
                }
            },
            quoted: function (qt) {
                return "'" + this.nvl(qt, "") + "'";
            },
            getSettings: function (qt) {
                var sett = sap.ui.getCore().getModel("settings").getData();
                return sett[qt];
            },
            toOraDateTimeString: function (dt) {
                var sett = sap.ui.getCore().getModel("settings").getData();

                if (typeof dt == "string") {
                    return "to_date('" + dt + "','" + Util.nvl(sett["ENGLISH_DATE_FORMAT_ORA"], "DD/MM/RRRR HH24.MI") + "')";
                } else if (dt instanceof Date) {
                    var sf = new simpleDateFormat(Util.nvl(sett["ENGLISH_DATE_FORMAT_LONG"], 'dd/MM/yyyy k.m'));
                    return "to_date('" + sf.format(dt) + "','" + Util.nvl(sett["ENGLISH_DATE_FORMAT_ORA_LONG"], "DD/MM/RRRR HH24.MI") + "')";
                }
            },
            createGrid2Obj: function (grid, layoutData1, layoutData2, lblStr, inputObjClass) {
                var ld1 = layoutData1, ld2 = layoutData2;
                if (typeof ld1 == "string")
                    ld1 = {span: ld1};
                if (typeof ld2 == "string")
                    ld2 = {span: ld2};

                var o = new inputObjClass({width: "100%"});
                o.setLayoutData(new sap.ui.layout.GridData(ld2));
                var l = new sap.m.Label({text: lblStr, layoutData: ld1});
                grid.addContent(l);
                grid.addContent(o);
                return {label: l, obj: o};
            },
            findComboItem: function (combo, value) {
                for (var i = 0; i < combo.getItems().length; i++) {
                    if (combo.getItems()[i] != undefined && combo.getItems()[i].getKey() == value)
                        return combo.getItems()[i];
                }
            },
            fillCombo: function (combo, sq, async) {
                var sq2 = {
                    sql: sq,
                    ret: "NONE",
                    data: null
                };
                if (typeof sq == "string")
                    this.doAjaxJson("sqldata", sq2, (async == undefined ? false : async)).done(function (data) {
                        if (data.ret != "SUCCESS") {
                            sap.m.MessageToast.show(data.ret);
                            return;
                        }
                        for (var i = combo.getItems().length; i > -1; i--)
                            if (combo.getItems()[i] != undefined) combo.getItems()[i].destroy();
                        combo.removeAllItems();
                        combo.destroyItems();
                        combo.destroyAggregation("items");
                        var dtx = JSON.parse("{" + data.data + "}").data;
                        combo.setModel(null);
                        combo.setModel(new sap.ui.model.json.JSONModel(dtx));
                        var f1 = "", f2 = "", cnt = -1;
                        if (dtx != null && dtx.length > 0)
                            for (var k in dtx[0]) {
                                cnt++;
                                if (cnt == 0)
                                    f1 = k;
                                if (cnt == 1)
                                    f2 = k;
                            }
                        f2 = Util.nvl(f2, f1);
                        var k = new sap.ui.core.ListItem({text: "{" + f2 + "}", key: "{" + f1 + "}"});
                        combo.bindAggregation("items", "/", k);
                        if (combo.getItems().length > 0)
                            combo.setSelectedItem(combo.getItems()[0]);
                    });
                if (typeof sq == "object") {
                    var dtx = sq;
                    var f1 = "", f2 = "", cnt = -1;
                    if (dtx.length > 0)
                        for (var k in dtx[0]) {
                            cnt++;
                            if (cnt == 0)
                                f1 = k;
                            if (cnt == 1)
                                f2 = k;
                        }
                    f2 = Util.nvl(f2, f1);
                    combo.setModel(new sap.ui.model.json.JSONModel(dtx));
                    var k = new sap.ui.core.ListItem({text: "{" + f2 + "}", key: "{" + f1 + "}"});
                    combo.bindAggregation("items", "/", k);
                }
                if (combo.getItems().length > 0)
                    combo.setSelectedItem(combo.getItems()[0]);

            },
            setComboValue: function (combo, value) {
                for (var i = 0; i < combo.getItems().length; i++) {
                    if (combo.getItems()[i].getKey() == value) {
                        combo.setSelectedItem(combo.getItems()[i]);
                        combo.fireSelectionChange();
                        break;
                    }

                }
            },
            htmlEntities: function (str) {
                return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            },
            doSpin: function (str) {
                this.busyDialog = new sap.m.BusyDialog({
                    text: str,
                });
                this.busyDialog.open();

            },
            stopSpin: function () {
                if (this.busyDialog != undefined) {
                    this.busyDialog.close();
                    this.busyDialog.destroy();
                    this.busyDialog = undefined;
                }
            },
            getParsedJsonValue: function (vl, rawValue) {
                var rv = this.nvl(rawValue, false);

                if (!rv)
                    return (typeof vl == "number" ? vl :
                        '"' + Util.nvl(vl, "").replace(/\"/g, "'").replace(/\n/, "\\r").replace(/\r/, "\\r").replace(/\\/g, "\\\\").trim() + '"');

                return (typeof vl == "number" ? vl :
                    '' + Util.nvl(vl, "").replace(/\"/g, "'").replace(/\n/, "\\r").replace(/\r/, "\\r").replace(/\\/g, "\\\\").trim() + '');

            },
            setLanguageModel: function (view) {
                var ResourceModel = sap.ui.model.resource.ResourceModel;
                var sLangu =
                    sap.ui.getCore().getConfiguration().getLanguage();
                var oLangu = new ResourceModel(
                    {
                        bundleUrl: (sLangu == "AR" ? "i18n/i18n_ar.properties" : "i18n/i18n.properties"),

                        "bundleLocale": sLangu
                    });

                view.setModel(oLangu, "i18n");
                view.sLangu = sLangu;

            },
            cookieGet: function (cname) {
                var name = cname + "=";
                var decodedCookie = decodeURIComponent(document.cookie);
                var ca = decodedCookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            },
            cookieSet: function setCookie(cname, cvalue, exdays) {
                var d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
            },
            cookieDelete: function (cname) {
                document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            },
            cookiesClear: function () {
                var cookies = document.cookie.split(";");

                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i];
                    var eqPos = cookie.indexOf("=");
                    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }
            },
            getLangDescrAR: function (enStr, otStr, sLang) {
                var s = Util.nvl(sLang, sap.ui.getCore().getConfiguration().getLanguage());
                return (s == "AR" ? this.nvl(otStr, enStr) : enStr);

            },
            showSearchTable: function (sql, container, flcol, fnOnselect, multiSelect) {

                container.removeAllItems();
                var qv = new QueryView("searchTbl");
                qv.getControl().setFixedBottomRowCount(0);
                qv.getControl().addStyleClass("sapUiSizeCondensed");

                var searchField = new sap.m.SearchField({
                    liveChange: function (event) {
                        var flts = [];
                        var val = event.getParameter("newValue");
                        for (var i in qv.mLctb.cols) {
                            if (flcol != undefined && flcol.indexOf(qv.mLctb.cols[i].mColName) > -1)
                                flts.push(new sap.ui.model.Filter({
                                    path: qv.mLctb.cols[i].mColName,
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: val
                                }));
                        }
                        var f = new sap.ui.model.Filter({
                            filters: flts,
                            and: false
                        });
                        var lst = qv.getControl();

                        var filter = new sap.ui.model.Filter(f, false);
                        var binding = lst.getBinding("rows");
                        binding.filter(filter);
                    }
                });
                container.addItem(searchField);

                var dat = this.execSQL(sql);
                if (dat.ret == "SUCCESS" && dat.data.length > 0) {
                    qv.setJsonStr("{" + dat.data + "}");
                    qv.loadData();
                    container.addItem(qv.getControl());
                    if (!Util.nvl(multiSelect, false))
                        qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
                    qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
                    return qv;
                }
                return null;
            },
            showSearchList: function (sql, colDes, colVal, fnConfirm) {
                // if (e.getParameters().refreshButtonPressed)
                //     return;
                //
                // if (e.getParameters().clearButtonPressed) {
                //     that.subs.athlet_code.setValue("");
                //     return
                // }

                var v = sql;
                Util.doAjaxJson("sqlmetadata", {
                    sql: v,
                    ret: "NONE",
                    data: null
                }, false).done(function (data) {
                    console.log(data);
                    var dt = JSON.parse("{" + data.data + "}").data;
                    sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(dt), "searchList");
                    var t = {
                        colDes: colDes,
                        colVal: colVal,
                        frag_liveChange: function (event) {
                            var val = event.getParameter("value");
                            var filter = new sap.ui.model.Filter(colDes, sap.ui.model.FilterOperator.Contains, val);
                            var binding = event.getSource().getBinding("items");
                            binding.filter(filter);
                        },
                        frag_confirm: function (event) {
                            var val = event.getParameters().selectedItem.getTitle();
                            var valx = event.getParameters().selectedItem.getCustomData()[0];
                            fnConfirm(valx.getKey(), val);
                            // that.subs.athlet_code.setValue(valx.getKey());
                            // that.subs.athlet_name.setValue(val);
                        }
                    };
                    var oFragment = sap.ui.jsfragment("bin.searchList", t);
                    oFragment.open();
                });
            },
            execSQL: function (sql) {
                var dtx = undefined;
                if (sql.toLowerCase().startsWith("select")) {
                    this.doAjaxJson("sqlmetadata", {
                            sql: sql,
                            ret: "NONE",
                            data: null
                        }
                        ,
                        false
                    ).done(function (data) {
                        dtx = data;
                    });
                }
                else {
                    var oSql = {
                        "sql": sql,
                        "ret": "NONE",
                        "data": null
                    };

                    this.doAjaxJson("sqlexe", oSql, false).done(function (data) {
                        dtx = data;
                    });
                }
                if (dtx == undefined || dtx.ret != "SUCCESS") {
                    console.log(sql);
                    if (dtx != undefined)
                        throw dtx.ret;
                    else
                        throw "Unexpected error in executing sql";
                }
                return dtx;
            },
            execSQLWithData: function (sql, errMsg) {
                var dt = this.execSQL(sql);
                var dtx = undefined;
                if (dt.ret == "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                } else {
                    sap.m.MessageToast.show(errMsg);
                }
                return dtx;
            }
            ,
            getSQLValue: function (sql) {
                var dat = this.execSQL(sql);
                if (dat.ret == "SUCCESS" && dat.data.length > 0) {
                    var dtx = JSON.parse("{" + dat.data + "}").data;
                    if (dtx.length == 0) return "";
                    return dtx[0][Object.keys(dtx[0])[0]];
                    //return dtx[0].VALUE;
                }
                return "";
            },
            show_list: function (sql, cols, retCols, fnSel, width, height, visibleRowCount, multiSelect, fnShowSel) {
                var vbox = new sap.m.VBox({width: "100%"});
                var dlg = new sap.m.Dialog({
                    content: [vbox],
                    contentHeight: this.nvl(height, "500px"),
                    contentWidth: this.nvl(width, "400px")
                });

                var qv = this.showSearchTable(sql, vbox, cols, undefined, Util.nvl(multiSelect, false));
                qv.getControl().addStyleClass("noColumnBorder");
                if (visibleRowCount != undefined) {
                    qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
                    qv.getControl().setVisibleRowCount(this.nvl(visibleRowCount, 6));
                }

                if (qv == null) return

                if (fnShowSel != undefined)
                    fnShowSel(qv);

                dlg.addButton(new sap.m.Button({
                    text: "Select", press: function () {
                        var sl = qv.getControl().getSelectedIndices();
                        if (sl.length <= 0 && !Util.nvl(multiSelect, false)) {
                            sap.m.MessageToast.show("Must select !");
                            return;
                        }
                        var data = [];
                        if (Util.nvl(multiSelect, false))
                            for (var i = 0; i < sl.length; i++) {
                                var odata = qv.getControl().getContextByIndex(sl[i]);
                                data.push(odata.getProperty(odata.getPath()))
                            }
                        else {
                            var odata = qv.getControl().getContextByIndex(sl[0]);
                            data = (odata.getProperty(odata.getPath()))
                        }

                        if (fnSel(data))
                            dlg.close();
                    }
                }));
                dlg.open();
            },

            getCellColValue: function (tbl, rowno, colname) {
                var oModel = tbl.getModel();
                var cv = oModel.getProperty("/" + rowno + "/" + colname);
                return cv;
            },
            setCellColValue: function (tbl, rowno, colname, value) {
                var oModel = tbl.getModel();
                oModel.setProperty("/" + rowno + "/" + colname, value);
            },
            getCurrentCellColValue: function (tbl, colname) {
                if (tbl.getSelectedIndices().length == 0)
                    return undefined;
                var oModel = tbl.getModel();
//                var rowVis = tbl.getFirstVisibleRow();
                var i = tbl.getSelectedIndices()[0];
                var cc = tbl.getContextByIndex(i);
                var cv = oModel.getProperty(cc.sPath + "/" + colname);
                return cv;
            }
        };
        return Util;
    });




