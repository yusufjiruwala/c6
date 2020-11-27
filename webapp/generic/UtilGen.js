sap.ui.define("sap/ui/ce/generic/UtilGen", [],
    function () {
        "use strict";
        var UtilGen = {
            chartHtmlText: '  <style type="text/css"> ' +
            '#chart-container { ' +
            'position: absolute; ' +
            'top: 10%; ' +
            'padding-left: 20vw;!important;' +
//            'left:20%; ' +
            'height: auto; ' +
            'transform: translate(-50%, -50%)' +
//        'width: calc(100% - 80px); ' +
            'z-index: 1; ' +
            'border-color: rgba(217, 83, 79, 0.9); ' +
            '}' +
            '.orgchart {' +
            'background: rgba(255,255,255,0.75);' +
            '}' +
            '@media screen and (max-width: 400px) { ' +
            ' #chart-container {' +
            'padding-left: 20px;' +
            '}' +
            '</style>' +
            ' <div id="chart-container"></div>'
            ,
            ajaxPre: "",
            createToolbar: function () {
                var that = this;
                var menuBar = new sap.m.Bar({
                    contentLeft: [new sap.m.Button({
                        icon: "sap-icon://home",
                        text: "",
                        press: function () {
                            document.location.href = "/?clearCookies=true";
                        }
                    }),
                        new sap.m.Button({
                            icon: "sap-icon://product",
                            text: "",
                            press: function () {
                                that.showApps();
                            }

                        }),
                    ],
                    contentMiddle: [new sap.m.Label({
                        text: "{selectedP>/name}",
                        textAlign: "Center",
                        design: "Bold"
                    })],

                    contentRight: [new sap.m.Button({
                        icon: "sap-icon://drop-down-list",
                        tooltip: "Select another role !",
                        press: function (e) {
                            oController.select_profile(e);
                        }
                    })
                    ]

                });
                menuBar.addStyleClass("sapContrast sapMIBar");
                return menuBar;
            },
            nvl: function (val1, val2) {
                return ((val1 == null || val1 == undefined || val1.length == 0) ? val2 : val1);
            },
            nvlObjToStr: function (val1, val2) {
                return ((val1 == null || val1 == undefined || val1.length == 0) ? val2 + "" : val1 + "");
            },
            clearPage: function (pg) {
                var xx = [];
                for (var i in pg.getContent())
                    xx.push(pg.getContent()[i]);
                for (var i in xx) {
                    pg.removeContent(xx[i]);
                    xx[i].destroy();
                }

                pg.removeAllContent();
            },
            showApps: function () {
                var dlg = new sap.m.Dialog({
                    title: "Select the App",
                    contentWidth: "100%",
                    contentHeight: "60%"
                });
                var flx = new sap.m.FlexBox();
                dlg.addContent()
                dlg.open();
            },
            initProdListModel: function (view) {
                var ResourceModel = sap.ui.model.resource.ResourceModel;
                var sLangu =
                    sap.ui.getCore().getConfiguration().getLanguage();
                var oLangu = new ResourceModel(
                    {
                        bundleUrl: "../i18n/i18n.properties",

                        "bundleLocale": sLangu
                    });
                view.setModel(oLangu, "i18n");
            },
            getProdList2Data: function (i18nMdl) {
                var data = {
                    "prods": [
                        {
                            "code": "01",
                            "name": i18nMdl.getProperty("fin_1")
                        },
                        {
                            "code": "02",
                            "name": i18nMdl.getProperty("fin_2")
                        },
                        {
                            "code": "03",
                            "name": i18nMdl.getProperty("fin_3")
                        },
                        {
                            "code": "04",
                            "name": i18nMdl.getProperty("fin_4")
                        },
                        {
                            "code": "04",
                            "name": i18nMdl.getProperty("fin_6")
                        },
                        {
                            "code": "05",
                            "name": i18nMdl.getProperty("fin_7")
                        },
                        {
                            "code": "06",
                            "name": i18nMdl.getProperty("fin_8")
                        },
                        {
                            "code": "07",
                            "name": i18nMdl.getProperty("fin_9")
                        },
                        {
                            "code": "08",
                            "name": i18nMdl.getProperty("fin_10")
                        }
                    ]
                };
                return data;
            },
            createProdListPage: function (view) {
                var data = this.getProdList2Data(view.getModel('i18n'));
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(data);
                view.setModel(oModel);
                view.txt = new sap.m.Label({text: ""});

                var oList = new sap.m.List({
                    headerText: "Product Lists",
                    id: "mainList", // sap.ui.core.ID
                    inset: false, // boolean
                    visible: true, // boolean
                    mode: sap.m.ListMode.None, // sap.m.ListMode
                    width: '100%', // sap.ui.core.CSSSize
                    showSeparators: sap.m.ListSeparators.All, // sap.m.ListSeparators
                }).addStyleClass("sapContrast");

                var actionListItem = new sap.m.ActionListItem("action",
                    {
                        text: "{name}",
                        customData: [{key: "{code}"}],
                        press: function (oControlEvent) {
                            view.splitApp.to("detailPage", "slide");
                            var oPressedItem = view.getModel().getProperty(this.getBindingContext().getPath());
                            var cod = oControlEvent.getSource().getCustomData()[0].getKey();
                            var prod = "products/";
                            if (typeof callFromProd2 == 'undefined')
                                prod = "";
                            if (cod == "01")
                                document.location.href = prod + "gl.html";
                            if (cod == "02")
                                document.location.href = prod + "construction.html";
                            if (cod == "03")
                                document.location.href = prod + "pursale.html";
                            if (cod == "04")
                                document.location.href = prod + "inventory.html";
                            if (cod == "05")
                                document.location.href = prod + "fa.html";
                            if (cod == "06")
                                document.location.href = prod + "pmr.html";
                            if (cod == "07")
                                document.location.href = prod + "pos.html";
                            if (cod == "08")
                                document.location.href = prod + "ia.html";
                            if (cod == "09")
                                document.location.href = prod + "lg.html";


                            // that.splitApp.to("detailPage", "slide");
                            // var oPressedItem = that.getModel().getProperty(view.getBindingContext().getPath());
                            // var cod = oControlEvent.getSource().getCustomData()[0].getKey();
                            //
                            // if (cod == "01")
                            //     that.showGraphGL();
                            // if (cod == "02")
                            //     that.showGraphRM();
                            // if (cod == "03")
                            //     that.showGraphPurSale();
                            //

                        }
                    });

                oList.bindItems("/prods", actionListItem);
                view.splitApp = new sap.m.SplitApp("prod2App", {});
                view.pg = new sap.m.Page({
                    showHeader: false,
                    content: [oList]
                });
                var bar1 = this.createBar(this.nvl(view.pageTitle, "-"), true);
                view.pg2 = new sap.m.Page("detailPage", {
                    customHeader: bar1,
                    showHeader: true,
                    content: []
                });

                view.splitApp.addMasterPage(view.pg);
                view.splitApp.addDetailPage(view.pg2);

                view.mainPage = new sap.m.Page({
                    showHeader: true,
                    customHeader: view.custBar,
                    content: [view.splitApp]
                }).addStyleClass("sapContrast");

            },
            createBar: function (lblId, pBackMaster) {
                var backMaster = this.nvl(pBackMaster, true);
                var b = new sap.m.Button({
                    icon: "sap-icon://full-screen",
                    press: function () {
                        var app = sap.ui.getCore().byId("prod2App");
                        if (app.getMode() == sap.m.SplitAppMode.HideMode)
                            app.setMode(sap.m.SplitAppMode.ShowHideMode);
                        else
                            app.setMode(sap.m.SplitAppMode.HideMode);

                    }
                });
                var flRight = new sap.m.FlexBox({direction: sap.m.FlexDirection.Row, items: [b]});
                var flLeft = new sap.m.FlexBox({
                    direction: sap.m.FlexDirection.Row, items: [new sap.m.Button({
                        icon: "sap-icon://arrow-left",
                        press: function () {
                            var app = sap.ui.getCore().byId("prod2App");
                            if (!sap.ui.Device.system.phone) {
                                //app.toDetail(app.getDetailPages()[0]);
                                app.backDetail();
                                if (pBackMaster)
                                    app.toMaster(app.getMasterPages()[0]);
                            } else {
                                app.backMaster();
                                app.toMaster(app.getMasterPages()[0]);
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
            select_screen: function (oController) {
                if (oController.oFragment === undefined)
                    oController.oFragment = sap.ui.jsfragment("bin.Screens", oController);
                oController.oFragment.open();

            },
            // get index no by key value in combbox
            getIndexByKey: function (cb, kyval) {
                for (var i = 0; i < cb.getItems().length; i++) {
                    if (cb.getItems()[i].getKey() == kyval)
                        return cb.getItems()[i];
                }
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
            createControl: function (component, view, id, setting, fldtype, fldFormat, fnChange, sqlStr) {

                var s = this.nvl(setting, {});
                if (Util.nvl(id, "") != "")
                    (view.byId(id) != undefined ? view.byId(id).destroy() : null);
                var c;
                if (Util.nvl(id, "") != "")
                    c = new component(view.createId(id), s).addStyleClass("sapUiSizeCondensed");
                else
                    c = new component(s).addStyleClass("sapUiSizeCondensed");
                if (fldtype != undefined)
                    c.field_type = fldtype;
                if (fnChange != undefined)
                    c.fnChange = fnChange;
                if (c instanceof sap.m.InputBase)
                    c.attachChange(function (oEvent) {
                        var _oInput = oEvent.getSource();
                        var val = _oInput.getValue();
                        if (_oInput.getCustomData().length == 0)
                            _oInput.addCustomData(new sap.ui.core.CustomData({key: val}))
                        else
                            _oInput.getCustomData()[0].setKey(val);

                    });
                if (fldtype == "number" && (c instanceof sap.m.Input)) {
                    c.setTextAlign(sap.ui.core.TextAlign.End);
                    c.attachLiveChange(function (oEvent) {
                        var _oInput = oEvent.getSource();
                        var val = _oInput.getValue();
                        val = val.replace(/[^\d\.-]/g, '');
                        //_oInput.setValue(val);
                        if (_oInput.getCustomData().length == 0)
                            _oInput.addCustomData(new sap.ui.core.CustomData({key: val}))
                        else
                            _oInput.getCustomData()[0].setKey(parseFloat(val));
                    });
                    if (fldFormat != undefined) {
                        c.field_format = fldFormat;
                        c.attachChange(function (oEvent) {
                            var df = new DecimalFormat(fldFormat);
                            var _oInput = oEvent.getSource();
                            var val = _oInput.getCustomData()[0].getKey();
                            _oInput.setValue(df.format(parseFloat(val)));
                            if (_oInput.fnChange != undefined) {
                                fnChange(oEvent);
                            }
                        });
                    }
                }

                if (c instanceof sap.m.ComboBox && sqlStr != undefined) {
                    if (sqlStr.startsWith("@")) {
                        var dtxx = [];
                        var spt = sqlStr.substring(1).split(",");
                        for (var i1 in spt) {
                            var dttt = {CODE: "", NAME: ""};
                            var sx = spt[i1].split("/");
                            dttt.CODE = "" + sx[0];
                            dttt.NAME = "" + sx[1];
                            dtxx.push(dttt);
                        }
                        c.setModel(new sap.ui.model.json.JSONModel(dtxx));
                    } else {
                        var dat = Util.execSQL(sqlStr);
                        if (dat.ret == "SUCCESS" && dat.data.length > 0) {
                            var dtx = JSON.parse("{" + dat.data + "}").data;
                            c.setModel(new sap.ui.model.json.JSONModel(dtx));
                        }
                    }
                }

                if (c.getCustomData().length == 0
                )
                    c.addCustomData(new sap.ui.core.CustomData({key: ""}));

                if (c instanceof sap.m.DatePicker) {
                    var sett = sap.ui.getCore().getModel("settings").getData();
                    c.setValueFormat(sett["ENGLISH_DATE_FORMAT"]);
                    c.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"]);
                    if (fldFormat != undefined) {
                        c.setValueFormat(fldFormat);
                        c.setDisplayFormat(fldFormat);
                    }

                }
                return c;

            },
            getControlValue(comp) {
                var customVal = "";
                if (comp.getCustomData().length > 0)
                    customVal = comp.getCustomData()[0].getKey();
                if (customVal == "NaN")
                    customVal = "";
                if (customVal == "false" && !(comp instanceof sap.m.CheckBox))
                    customVal = "";
                if (comp instanceof sap.m.Text)
                    return this.nvl(customVal, comp.getText());
                if (comp instanceof sap.m.SearchField)
                    return this.nvl(customVal, comp.getValue());
                if (comp instanceof sap.m.DatePicker)
                    return comp.getDateValue();
                if (comp instanceof sap.m.DateTimePicker)
                    return comp.getDateValue();
                if (comp instanceof sap.m.ComboBoxBase)
                    return this.nvl(comp.getSelectedKey(), comp.getValue());
                if (comp instanceof sap.m.CheckBox)
                    if (comp.trueValues != undefined)
                        return (comp.getSelected() ? comp.trueValues[0] : comp.trueValues[1]);
                    else
                        return (comp.getSelected() ? "Y" : "N");
                if (comp instanceof sap.m.InputBase)
                    return this.nvl(customVal, comp.getValue());

            }
            ,
            setControlValue: function (comp, pVal, pCustomVal, executeChange) {
                var val = this.nvl(pVal, "") + "";
                var customVal = Util.nvl(pCustomVal, Util.nvl(pVal, ""));
                if (comp.field_type != undefined && comp.field_type == "number") {
                    val = val.replace(/[^\d\.-]/g, '');
                    if (comp.getCustomData().length == 0)
                        comp.addCustomData(new sap.ui.core.CustomData({key: val}))
                    else
                        comp.getCustomData()[0].setKey(parseFloat(val));
                    comp.setValue(val);
                    if (executeChange)
                        comp.fireChange();
                    return;
                }
                if (comp instanceof sap.m.InputBase || comp instanceof sap.m.SearchField) {
                    comp.setValue(val);
                    // if (customVal.length > 0)
                    if (comp.getCustomData().length == 0)
                        comp.addCustomData(new sap.ui.core.CustomData({key: customVal}))
                    else
                        comp.getCustomData()[0].setKey(customVal);
                    if (comp instanceof sap.m.InputBase && executeChange)
                        comp.fireChange();
                }

                if (comp instanceof sap.m.ComboBoxBase) {
                    comp.setSelectedItem(this.getIndexByKey(comp, val));
                    if (comp.getCustomData().length == 0)
                        comp.addCustomData(new sap.ui.core.CustomData({key: customVal}))
                    else
                        comp.getCustomData()[0].setKey(customVal);

                    if (executeChange)
                        comp.fireChange();

                }
                if (comp instanceof sap.m.Text) {
                    comp.setText(val);
                    // if (customVal.length > 0)
                    if (comp.getCustomData().length == 0)
                        comp.addCustomData(new sap.ui.core.CustomData({key: customVal}))
                    else
                        comp.getCustomData()[0].setKey(customVal);


                }
                if (comp instanceof sap.m.DatePicker) {

                    if (this.nvl(pVal, "").length == 0)
                        comp.setDateValue(null);
                    else
                        comp.setDateValue(new Date(pVal));

                    if (executeChange)
                        comp.fireChange();

                }
                if (comp instanceof sap.m.CheckBox) {
                    if (comp.trueValues != undefined)
                        (val == comp.trueValues[0] ? comp.setSelected(true) : comp.setSelected(false));
                    if (executeChange)
                        comp.fireSelect();

                }


            }
            ,
            //---------------------------------------------------------------------------------------------------------
            // all value labelspan , emptyspan == small, medium , large, xlarge-----------------
            //---------------------------------------------------------------------------------------------------------
            formCreate: function (title, editable, content, labelSpan, emptySpan, columns, spanForLabel) {
                var ls = labelSpan;
                var es = emptySpan;
                var cs = columns;
                var ed = false;
                var cnt = [];
                var prev_span = Util.nvl(spanForLabel, "");
                if (editable)
                    ed = true;
                if (labelSpan == undefined || labelSpan.length == 0)
                    ls = [12, 3, 3, 2];
                if (emptySpan == undefined || emptySpan.length == 0)
                    es = [0, 2, 2, 2];
                if (columns == undefined || columns.length == 0)
                    cs = [1, 2, 2];
                for (var i in content) {
                    if (content[i] == undefined) {
                        console.log("form element " + i + " is undefined !");
                        continue;
                    }
                    if (typeof content[i] === "string" && !content[i].startsWith("@") &&
                        !content[i].startsWith("#")) {
                        var setx = {text: content[i]};
                        if (prev_span != "")
                            setx["layoutData"] = new sap.ui.layout.GridData({span: prev_span});

                        cnt.push(new sap.m.Label(setx));
                    }
                    else if (typeof content[i] === "string" && content[i].startsWith("@")) {
                        var setx = {text: content[i].substr(1), textAlign: sap.ui.core.TextAlign.Right};
                        if (prev_span != "")
                            setx["layoutData"] = new sap.ui.layout.GridData({span: prev_span});
                        cnt.push(new sap.m.Text(setx));
                    }
                    else if (typeof content[i] === "string" && content[i].startsWith("#"))
                        cnt.push(new sap.ui.core.Title({text: content[i].substr(1)}));
                    else
                        cnt.push(content[i]);
                    // if (cnt[cnt.length - 1].getLayoutData() != undefined)
                    //     prev_span = cnt[cnt.length - 1].getLayoutData().getSpan();
                    // else prev_span = "";
                }
                return new sap.ui.layout.form.SimpleForm({

                    editable: ed,
                    layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
                    labelSpanXL: ls[3],
                    labelSpanL: ls[2],
                    labelSpanM: ls[1],
                    labelSpanS: ls[0],
                    adjustLabelSpan: false,
                    emptySpanXL: es[3],
                    emptySpanL: es[2],
                    emptySpanM: es[1],
                    emptySpanS: es[0],
                    columnsXL: cs[2],
                    columnsL: cs[1],
                    columnsM: cs[0],
                    singleContainerFullSize: false,
                    content: cnt,
                    toolbar: new sap.m.Toolbar({
                        content: [
                            new sap.m.Title({text: title, level: "H4", titleStyle: "H4"}),
                        ]
                    })
                });
            },
            addControl(ar, lbl, cntClass, id, sett, dataType, fldFormat, view, fnchange, sqlStr) {
                var setx = sett;
                var idx = id;
                if (Util.nvl(id, "") == "")
                    idx = lbl.replace(/[ ||,||.||\/||@||#]/g, "");
                if (Util.nvl(id, "").endsWith("_")) {
                    idx = id + lbl.replace(/[ ||,||.||\/||@||#]/g, "");
                    if (lbl.startsWith("@") || lbl.startsWith("#"))
                        idx = lbl.substr(1, 1) + idx;
                }
                var cnt = this.createControl(cntClass, view, idx, setx, dataType, fldFormat, fnchange, sqlStr);
                if (lbl.length != 0)
                    ar.push(lbl);
                ar.push(cnt);
                return cnt;
            }
            ,
            formAddItem(frm, label, controls) {
                frm.addContent(new sap.m.Label({text: label}));
                if (controls instanceof Array)
                    for (var i in controls)
                        frm.addContent(controls[i]);
                else
                    frm.addContent(controls);
            }
            ,
            getSQLInsertString: function (tbl, flds, excFlds, datesWithTime) {

                var hma = "";
                var ohma = "";
                if (datesWithTime) {
                    hma = " h mm a";
                    ohma = " HH MI AM"
                }
                var sett = sap.ui.getCore().getModel("settings").getData();
                var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + hma);
                var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);


                var kys = [];
                var str = "";
                var vl = "";

                // add additional fields and values to vls.
                if (flds != undefined)
                    for (var key in flds) {
                        str += (str.length == 0 ? "" : ",") + key;
                        vl += (vl.length == 0 ? "" : ",") + flds[key];
                    }

                for (var key in tbl) {
                    if (!key.startsWith("_") && (excFlds == undefined || excFlds.indexOf(key) < 0)) {
                        str += (str.length == 0 ? "" : ",") + key;
                        var val = this.getControlValue(tbl[key]);

                        // if (tbl[key].getCustomData().length > 0 &&
                        //     tbl[key].getCustomData()[0].getKey().trim().length > 0
                        // )
                        //     val = this.nvl(tbl[key].getCustomData()[0].getKey().trim(), tbl[key].getValue());


                        // if (tbl[key] instanceof sap.m.SearchField &&
                        //     tbl[key].getCustomData().length > 0)
                        //     val = this.nvl(tbl[key].getCustomData()[0].getKey(), tbl[key].getValue());
                        //
                        val = "'" + (val + "").replace("'", "''") + "'";

                        if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() != undefined)
                            val = "to_date('" + sdf.format(tbl[key].getDateValue()) + "','" + sett["ENGLISH_DATE_FORMAT"] + ohma + "')";
                        if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() == undefined)
                            val = "null";
                        if (tbl[key].field_type != undefined && tbl[key].field_type == "number")
                            val = tbl[key].getValue();
                        if (tbl[key].field_type != undefined && tbl[key].field_type == "money")
                            val = df.parse(tbl[key].getValue());

                        vl += (vl.length == 0 ? "" : ",") + val;
                    }
                }

                return "(" + str + ') values (' + vl + ")";

            }
            ,
            getSQLUpdateString: function (tbl, tbl_name, flds, where, excFlds, datesWithTime) {

                var hma = "";
                var ohma = "";
                if (datesWithTime) {
                    hma = " h mm a";
                    ohma = " HH MI AM"
                }

                var sett = sap.ui.getCore().getModel("settings").getData();
                var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + hma);
                var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);

                var kys = [];
                var str = "";
                var vl = "";

                // add additional fields and values to vls.
                if (flds != undefined)
                    for (var key in flds)
                        str += (str.length == 0 ? "" : ",") + key + "=" + flds[key];

                // put field=value in string
                for (var key in tbl) {
                    if (!key.startsWith("_") && (excFlds == undefined || excFlds.indexOf(key) < 0)) {
                        var val = this.getControlValue(tbl[key]);

                        val = "'" + (val + "").replace("'", "''") + "'";

                        if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() != undefined)
                            val = "to_date('" + sdf.format(tbl[key].getDateValue()) + "','" + sett["ENGLISH_DATE_FORMAT"] + ohma + "')";
                        if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() == undefined)
                            val = "null";
                        if (tbl[key].field_type != undefined && tbl[key].field_type == "number")
                            val = tbl[key].getValue();
                        if (tbl[key].field_type != undefined && tbl[key].field_type == "money")
                            val = df.parse(tbl[key].getValue());

                        str += (str.length == 0 ? "" : ",") + key + "=" + val;

                    }
                }

                return "update " + tbl_name + " set " + str + (this.nvl(where, "").length == 0 ? "" : " where ") + this.nvl(where, "");

            }
            ,
            loadDataFromJson(subs, dtx, executeChange) {
                for (var key in subs) {
                    var vl = dtx[key.toUpperCase()];
                    if (subs[key] != undefined && vl != undefined)
                        this.setControlValue(subs[key], vl, vl, this.nvl(executeChange, false));

                }
            }
            ,
            resetDataJson(subs) {
                for (var key in subs)
                    this.setControlValue(subs[key], "", false);

            }
            ,
            doFilterLiveTable(event, qv, flcol) {
                var flts = [];
                var val = event.getParameter("newValue");

                for (var i in qv.mLctb.cols) {
                    var f = sap.ui.model.FilterOperator.Contains;
                    if (qv.mLctb.cols[i].getMUIHelper().data_type == "NUMBER")
                        f = sap.ui.model.FilterOperator.EQ;
                    if (flcol.indexOf(qv.mLctb.cols[i].mColName) > -1)
                        flts.push(new sap.ui.model.Filter({
                            path: qv.mLctb.cols[i].mColName,
                            operator: f,
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
            ,
            parseDefaultValue: function (vl) {
                var retVal = Util.nvl(vl, "");
                if (retVal.startsWith("#DATE_"))
                    retVal = new Date(vl.replace("#DATE_", ""));
                if (retVal.startsWith("#NUMBER_"))
                    retVal = parseFloat(vl.replace("#NUMBER_", ""));
                return retVal;
            }
            ,
            // this function should be executed before load data in localtabledata model.
            applyCols: function (grp, qv, frag) {
                var cls = {
                    "TEXTFIELD": "sap.m.Input",
                    "DATEFIELD": "sap.m.DatePicker",
                    "DATETIMEFIELD": "sap.m.DateTimePicker",
                    "TIMEFIELD": "sap.m.TimePicker",
                    "COMBOBOX": "SelectText",
                    "CHECKBOX": "sap.m.CheckBox",
                    "SEARCHFIELD": "SearchText",
                    "LABLE": "sap.m.Label",
                    "ICON": "sap.ui.core.Icon"
                };
                var aligns = {
                    "ALIGN_LEFT": "left",
                    "ALIGN_RIGHT": "right",
                    "ALIGN_CENTER": "center"
                };

                var visibleCol = [], invisibleCol = []; // visible and invisible column to arrange first visible and then invisible in localtabledata
                var sqlStr = "select *from cp_setcols where profile=0 and setgrpcode='" + grp + "'  order by POSITION"
                var dat = Util.execSQL(sqlStr);
                if (dat.ret == "SUCCESS") {
                    var dtx = JSON.parse("{" + dat.data + "}").data;
                    //invisible all columns first and then only visible which is available.
                    for (var col in qv.mLctb.cols)
                        qv.mLctb.cols[col].mHideCol = true;
                    for (var col in dtx) {
                        var cx = qv.mLctb.getColByName(dtx[col].ITEM_NAME);
                        if (dtx[col].DISPLAY_TYPE != "INVISIBLE") {
                            cx.mHideCol = false;
                            visibleCol.push(cx);
                        }
                        cx.mEnabled = dtx[col].DISPLAY_TYPE == "DISABLED" ? false : true;
                        cx.mColClass = Util.nvl(cls[dtx[col].EDITOR_CLASS], "sap.m.Text");
                        cx.mUIHelper.display_align = Util.nvl(aligns[dtx[col].ALIGN], "center");
                        cx.mUIHelper.display_format = Util.nvl(dtx[col].USE_FORMAT, "");
                        cx.mUIHelper.display_width = Util.nvl(dtx[col].DISPLAY_WIDTH, "30");
                        cx.mTitle = Util.nvl(dtx[col].DESCR, dtx[col].ITEM_NAME);
                        cx.mSearchSQL = Util.nvl(dtx[col].LOV_SQL, "");
                        cx.mLookUpCols = Util.nvl(dtx[col].LOOKUP_COLUMN, "");
                        cx.mRetValues = Util.nvl(dtx[col].RETURN_VALUES, "");
                        cx.eOther = Util.nvl(dtx[col].VALIDATE_EVENT, "");
                        cx.mDefaultValue = Util.nvl(UtilGen.parseDefaultValue(dtx[col].DEFAULT_VALUE), '');


                        if (cx.eValidateColumn != undefined) {

                        }

                        if (cx.eOther != undefined && cx.eOther.length > 0) {
                            cx.eValidateColumn = function (evtx) {
                                var sett = sap.ui.getCore().getModel("settings").getData();
                                var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
                                var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
                                var qf = new DecimalFormat(sett["FORMAT_QTY_1"]);
                                var row = evtx.getSource().getParent();
                                var column_no = evtx.getSource().getParent().indexOfCell(evtx.getSource());
                                var columns = evtx.getSource().getParent().getParent().getColumns();
                                var table = evtx.getSource().getParent().getParent(); // get table control.
                                var oModel = table.getModel();
                                var rowStart = table.getFirstVisibleRow(); //starting Row index
                                var currentRowoIndexContext = table.getContextByIndex(rowStart + table.indexOfRow(row));
                                var newValue = evtx.getParameter("value");

                                var tm = -1;
                                var clx = -1;
                                for (clx in columns) {
                                    if (columns[clx].getVisible()) tm++;
                                    if (tm == column_no) {
                                        break;
                                    }
                                }
                                if (clx < 0) return;
                                var cx = columns[clx].tableCol;
                                var evl = cx.eOther.replace(/:newValue/g, "\"'" + newValue + "'\"");
                                evl = evl.replace(/:nwValue/g, "\"" + newValue + "\"");
                                if (!eval(evl))
                                    this.requestFocus();


                            }
                        }
                        if (cx.mSearchSQL.length > 0) {
                            cx.eOnSearch = function (evtx) {

                                var tbl = evtx.getSource().getParent().getParent(); // get table control.
                                var input = evtx.getSource();
                                if (evtx.getParameters().clearButtonPressed || evtx.getParameters().refreshButtonPressed) {
                                    return;
                                }

                                //// get visible column no
                                var clno = evtx.getSource().getParent().indexOfCell(evtx.getSource());
                                var cls = evtx.getSource().getParent().getParent().getColumns();


                                var tm = -1;
                                var clx = -1;
                                for (clx in cls) {
                                    if (cls[clx].getVisible()) tm++;
                                    if (tm == clno) {
                                        break;
                                    }
                                }
                                if (clx < 0) return;
                                var cx = cls[clx].tableCol;
                                //// end getting visible column no

                                var row = evtx.getSource().getParent();
                                var sq = cx.mSearchSQL;
                                var lk = Util.nvl(cx.mLookUpCols, "").split(",");
                                var rt = Util.nvl(cx.mRetValues, "").split(",");

                                if (cx.beforeSearchEvent != undefined) {
                                    var oModel = tbl.getModel();
                                    var rowStart = tbl.getFirstVisibleRow();
                                    var currentRowoIndexContext = tbl.getContextByIndex(rowStart + tbl.indexOfRow(row));
                                    oModel.setProperty(currentRowoIndexContext.sPath + "/" + cx.mColName, evtx.getSource().getValue(), undefined, true);
                                    sq = cx.beforeSearchEvent(sq, currentRowoIndexContext, oModel);
                                }
                                Util.show_list(sq, lk, rt, function (data) {
                                    // console.log(data);
                                    if (rt.length == 0)
                                        return;
                                    var oModel = tbl.getModel();
                                    var rowStart = tbl.getFirstVisibleRow(); //starting Row index
                                    var currentRowoIndexContext = tbl.getContextByIndex(rowStart + tbl.indexOfRow(row));
                                    for (var i in rt) {
                                        var rts = rt[i].split("=");
                                        oModel.setProperty(currentRowoIndexContext.sPath + "/" + rts[0], data[rts[1]], undefined, true);
                                        if (cx.mColName == rts[0])
                                            input.fireChange({value: data[rts[1]]});
                                    }
                                    return true;
                                }, "100%", "100%", 10, false);
                            };
                        }
                    } //for (var col in dtx)
                    // moving all visible column in starting of mLcTb
                    for (var col in qv.mLctb.cols)
                        if (qv.mLctb.cols[col].mHideCol)
                            invisibleCol.push(qv.mLctb.cols[col]);
                    qv.mLctb.cols = [];
                    for (var i in visibleCol) {
                        visibleCol[i].mColpos = parseInt(i) + 1;
                        qv.mLctb.cols.push(visibleCol[i]);
                    }
                    var tr = qv.mLctb.cols.length - 1;
                    for (var i in invisibleCol) {
                        invisibleCol[i].mColpos = tr + parseInt(i) + 1;
                        qv.mLctb.cols.push(invisibleCol[i]);
                    }
                }

            }
            ,
            getInsertRowString: function (mLctb, tblName, rowno, excludeCols, colValues, onlyVisibleCol) {
                var ov = Util.nvl(onlyVisibleCol, false);
                var sett = sap.ui.getCore().getModel("settings").getData();
                var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

                var sq1 = "insert into " + tblName;
                var sq2 = "";
                var sq3 = "";
                for (var c in mLctb.cols) {
                    // only add to insert which is visible but even if hidden but added in colValues then add it.
                    if (ov && mLctb.cols[c].mHideCol && !Util.nvl(colValues, []).hasOwnProperty(mLctb.cols[c].mColName))
                        continue;
                    var val = Util.nvl(mLctb.getFieldValue(rowno, mLctb.cols[c].mColName), "");
                    // if any value to be override by colValues object
                    if (colValues != undefined && colValues.hasOwnProperty(mLctb.cols[c].mColName))
                        val = colValues[mLctb.cols[c].mColName];

                    if (excludeCols != undefined && excludeCols.indexOf(mLctb.cols[c].mColName) <= -1)
                        sq2 += (sq2.length > 0 ? "," : "") + mLctb.cols[c].mColName;
                    if (mLctb.cols[c].getMUIHelper().display_format == "SHORT_DATE_FORMAT") // if date then to_date() in sql
                        val = Util.toOraDateString(val);
                    else if (mLctb.cols[c].getMUIHelper().data_type == "DATE" && mLctb.cols[c].getMUIHelper().display_format != "SHORT_DATE_FORMAT")
                        val = (val != "" ? Util.toOraDateTimeString(new Date(val)) : "");
                    else {
                        val = "'" + val + "'";
                    }
                    // if number then val variable should have number value to store in database.
                    if (excludeCols != undefined && excludeCols.indexOf(mLctb.cols[c].mColName) <= -1
                        && mLctb.cols[c].getMUIHelper().data_type == "NUMBER") {
                        if (colValues != undefined && colValues.hasOwnProperty(mLctb.cols[c].mColName))
                            val = (Util.nvl(Util.nvl(colValues[mLctb.cols[c].mColName], val), "") + "").replace(/[^\d\.],/g, '').replace(/,/g, '');
                        else
                            val = (Util.nvl(Util.nvl(mLctb.getFieldValue(rowno, mLctb.cols[c].mColName), val), "") + "").replace(/[^\d\.],/g, '').replace(/,/g, '');
                        var dfs = Util.nvl(mLctb.cols[c].getMUIHelper().display_format, "NONE");
                        var df;
                        if (Util.nvl(mLctb.cols[c].getMUIHelper().display_format, "NONE") == "QTY_FORMAT")
                            dfs = sett["FORMAT_QTY_1"];
                        if (Util.nvl(mLctb.cols[c].getMUIHelper().display_format, "NONE") == "MONEY_FORMAT")
                            dfs = sett["FORMAT_MONEY_1"];
                        if (dfs != "NONE") {
                            df = new DecimalFormat(dfs);
                            val = parseFloat(df.formatBack(val.replace(/'/g, '')))
                        }
                    }
                    // exclude col
                    if (excludeCols != undefined && excludeCols.indexOf(mLctb.cols[c].mColName) <= -1)
                        sq3 += (sq3.length > 0 ? "," : "") + Util.nvl(val, 'null');
                }
                for (var key in colValues)
                    if (mLctb.getColPos(key) < 0) {
                        sq2 += (sq2.length > 0 ? "," : "") + key;
                        sq3 += (sq3.length > 0 ? "," : "") + Util.nvl(colValues[key], 'null');
                    }


                return sq1 + "(" + sq2 + ") values (" + sq3 + ")";

            }
            ,
            showErrorNoVal: function (obj, msg) {
                var ob = [];
                var fnd = 0;
                var errobjs = [];
                if (!Array.isArray(obj))
                    ob = [obj];
                else ob = obj;
                for (var i in ob) {
                    var objj = ob[i];
                    if ((this.nvl(this.getControlValue(objj), "") + "").length == 0) {
                        fnd++;
                        errobjs.push(objj);
                    }
                }
                if (fnd > 0) {
                    sap.m.MessageToast.show(fnd + " Field(s)  must have value !");
                    setTimeout(function () {
                        for (var i in errobjs) {
                            errobjs[i].addStyleClass("errBack");
                        }
                        setTimeout(function () {
                            for (var i in errobjs)
                                errobjs[i].removeStyleClass("errBack");

                        }, 10000);
                    }, 100);
                }
                return fnd;
            },
            openForm: function (frag, frm, ocAdd, view, app) {
                var oC = {};
                if (view != undefined)
                    oC = {
                        getView:
                            function () {
                                return view;
                            }
                    };
                if (ocAdd != undefined)
                    for (var xx in ocAdd)
                        oC[xx] = ocAdd[xx];

                var sp = sap.ui.jsfragment(frag, oC);
                if (app != undefined)
                    sp.app = app;

                return sp;
            },

            doSearch: function (event, sql, obj, fnAfter) {
                if (event != undefined
                    && (event.getParameters().clearButtonPressed
                        || event.getParameters().refreshButtonPressed)) {
                    UtilGen.setControlValue(obj, "", "", true);
                    return;
                }

                Util.showSearchList(sql, "TITLE", "CODE", function (valx, val) {
                    UtilGen.setControlValue(obj, val, valx, true);
                    if (fnAfter != undefined)
                        fnAfter();
                });

            },
            editableContent: function (frm, b) {
                for (var i = 0; i < frm.getContent().length; i++) {
                    if (frm.getContent()[i] instanceof sap.m.InputBase)
                        frm.getContent()[i].setEditable(b);
                    if (frm.getContent()[i] instanceof sap.m.SearchField)
                        frm.getContent()[i].setEnabled(b);

                }
            }
        };


        return UtilGen;
    })
;


