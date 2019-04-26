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
                createControl: function (component, view, id, setting, fldtype, fldFormat, fnChange) {

                    var s = this.nvl(setting, {});

                    (view.byId(id) != undefined ? view.byId(id).destroy() : null);
                    var c = new component(view.createId(id), s)
                    if (fldtype != undefined)
                        c.field_type = fldtype;
                    if (fnChange != undefined)
                        c.fnChange = fnChange;


                    if (fldtype == "number" && c instanceof sap.m.Input) {
                        c.setTextAlign(sap.ui.core.TextAlign.End);
                        c.attachLiveChange(function (oEvent) {
                            var _oInput = oEvent.getSource();
                            var val = _oInput.getValue();
                            val = val.replace(/[^\d\.]/g, '');
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

                    if (c.getCustomData().length == 0)
                        c.addCustomData(new sap.ui.core.CustomData({key: ""}));

                    if (c instanceof sap.m.DatePicker) {
                        var sett = sap.ui.getCore().getModel("settings").getData();
                        c.setValueFormat(sett["ENGLISH_DATE_FORMAT"]);
                        c.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"]);
                    }
                    return c;

                },
                getControlValue(comp) {
                    var customVal = "";
                    if (comp.getCustomData().length > 0)
                        customVal = comp.getCustomData()[0].getKey();
                    if (comp instanceof sap.m.Text)
                        return this.nvl(customVal, comp.getText());
                    if (comp instanceof sap.m.InputBase)
                        return this.nvl(customVal, comp.getValue());
                    if (comp instanceof sap.m.SearchField)
                        return this.nvl(customVal, comp.getValue());
                    if (comp instanceof sap.m.DatePicker)
                        return comp.getDateValue();
                    if (comp instanceof sap.m.ComboBoxBase)
                        return comp.getSelectedKey();
                },
                setControlValue: function (comp, pVal, pCustomVal, executeChange) {
                    var val = this.nvl(pVal, "") + "";
                    var customVal = Util.nvl(pCustomVal, "");
                    if (comp.field_type != undefined && comp.field_type == "number") {
                        val = val.replace(/[^\d\.]/g, '');
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
                        if (customVal.length > 0)
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
                        if (customVal.length > 0)
                            if (comp.getCustomData().length == 0)
                                comp.addCustomData(new sap.ui.core.CustomData({key: customVal}))
                            else
                                comp.getCustomData()[0].setKey(customVal);


                    }
                    if (comp instanceof sap.m.DatePicker) {
                        comp.setDateValue(pVal)
                        if (executeChange)
                            comp.fireChange();

                    }


                },
                //---------------------------------------------------------------------------------------------------------
                // all value labelspan , emptyspan == small, medium , large, xlarge-----------------
                //---------------------------------------------------------------------------------------------------------
                formCreate: function (title, editable, content, labelSpan, emptySpan, columns) {
                    var ls = labelSpan;
                    var es = emptySpan;
                    var cs = columns;
                    var ed = false;
                    var cnt = [];

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
                        if (typeof content[i] === "string" && !content[i].startsWith("@") && !content[i].startsWith("#"))
                            cnt.push(new sap.m.Label({text: content[i]}));
                        else if (typeof content[i] === "string" && content[i].startsWith("@"))
                            cnt.push(new sap.m.Text({
                                    text: content[i].substr(1),
                                    textAlign: sap.ui.core.TextAlign.Center
                                }
                            ));
                        else if (typeof content[i] === "string" && content[i].startsWith("#"))
                            cnt.push(new sap.ui.core.Title({text: content[i].substr(1)}));
                        else
                            cnt.push(content[i]);
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
                getSQLInsertString: function (tbl, flds, excFlds) {
                    var sett = sap.ui.getCore().getModel("settings").getData();
                    var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
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
                        if (!key.startsWith("_") || (excFlds != undefined && excFlds.indexOf(key) < 0)) {
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
                            val = "'" + val.replace("'", "''") + "'";

                            if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() != undefined)
                                val = "to_date('" + sdf.format(tbl[key].getDateValue()) + "','" + sett["ENGLISH_DATE_FORMAT"] + "')";
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
                getSQLUpdateString: function (tbl, tbl_name, flds, where, excFlds) {
                    var sett = sap.ui.getCore().getModel("settings").getData();
                    var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
                    var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);


                    var kys = [];
                    var str = "";
                    var vl = "";

                    // add additional fields and values to vls.
                    if (flds != undefined)
                        for (var key in flds)
                            str += (str.length == 0 ? "" : ",") + key + "=" + flds[key];

                    for (var key in tbl) {
                        if (!key.startsWith("_") || (excFlds != undefined && excFlds.indexOf(key) < 0)) {
                            var val = this.getControlValue(tbl[key]);
                            //
                            // if (tbl[key] instanceof Text)
                            //     val = tbl[key].getText();
                            //
                            // if (tbl[key] instanceof sap.m.SearchField &&
                            //     tbl[key].getCustomData().length > 0)
                            //     val = this.nvl(tbl[key].getCustomData()[0].getKey(), tbl[key].getValue());
                            //
                            // if (tbl[key].getCustomData().length > 0 &&
                            //     tbl[key].getCustomData()[0].getKey().trim().length > 0
                            // )
                            //     val = this.nvl(tbl[key].getCustomData()[0].getKey().trim(), tbl[key].getValue());

                            val = "'" + val.replace("'", "''") + "'";

                            if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() != undefined)
                                val = "to_date('" + sdf.format(tbl[key].getDateValue()) + "','" + sett["ENGLISH_DATE_FORMAT"] + "')";
                            if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() == undefined)
                                val = "null";
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
                        if (!isNaN(dtx[key.toUpperCase()])) {
                            var vl = dtx[key.toUpperCase()];
                            this.setControlValue(subs[key], vl, vl, this.nvl(executeChange, false));
                        }
                    }
                }
            }
        ;

        return UtilGen;
    })
;


