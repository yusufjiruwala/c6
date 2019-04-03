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
            cookieDelete:function (cname) {
                document.cookie = cname+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }

        };


        return UtilGen;
    });


