sap.ui.jsfragment("bin.forms.lg.MG", {

    createContent: function (oController) {
        var that = this;
        jQuery.sap.require("sap.ui.commons.library");
        var that = this;
        var view = oController.getView();
        this.oController = oController;
        (view.byId("filterBox") != undefined ? view.byId("filterBox").destroy() : "");
        (view.byId("profile") != undefined ? view.byId("profile").destroy() : "");
        // view.cb = new sap.m.ComboBox(
        //     {
        //         items: {
        //             path: "/",
        //             template: new sap.ui.core.ListItem({text: "{name}", key: "{code}"}),
        //             templateShareable: true
        //         },
        //         selectionChange: function (event) {
        //             that.onChangeProfile(event);
        //         }
        //     });
        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                var splitApp = sap.ui.getCore().byId("reportApp");
                splitApp.backFunction();
            }
        });
        this.qd = new sap.m.Button({
            icon: "sap-icon://create",
            press: function () {
                that.openQuery();
            }
        });

        this.filterBox = new sap.m.FlexBox(view.createId("filterBox"),
            {
                width: "100%",
                items: [this.bk,this.qd],
                direction: sap.m.FlexDirection.Row,
                alignItems: sap.m.FlexAlignItems.Start
            }
        ).addStyleClass("paddingLeftRightTop sapContrast");
        this.menuscroll = new sap.m.ScrollContainer({
            height: "85%",
            vertical: true
        });
        this.pgMenus = new sap.m.Page({
            height: "100%",
            width: "100%",
            showHeader: false,
            showSubHeader: false,
            content: [that.filterBox, that.menuscroll
            ]
        }).addStyleClass("sapContrast");
        this.pgQuery = new sap.m.Page({
            showHeader: false,
            showSubHeader: false,
            content: new sap.m.Text({})
        });

        this.pgResult = new sap.m.Page({
            showHeader: false,
            showSubHeader: false,
            content: []
        });

        this.pgGraph = new sap.m.Page({
            showHeader: false,
            showSubHeader: false,
            content: []
        });

        this.createResultPage();

        (sap.ui.getCore().byId("reportApp") != undefined ? sap.ui.getCore().byId("reportApp").destroy() : "");

//            this.setCurrentProfile();
        var splitApp = new sap.m.SplitApp("reportApp").addStyleClass("");
        splitApp.addMasterPage(this.pgMenus);
        splitApp.addDetailPage(this.pgQuery);
        splitApp.addDetailPage(this.pgResult);
        splitApp.addDetailPage(this.pgGraph);
        splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
        splitApp.showMaster();
        this.generate_list(view);

        // if URI parameter passed then show that query parameter window..
        //this.runParas();
        return splitApp;

    },
    generate_list: function (view) {
        var that = this;
//        if (this.qv == undefined) {
        this.qv = new QueryView("menus");
        this.qv.switchType("list");
        this.qv.getControl().addStyleClass("sapContrast");
        this.qv.setCallBackListSelect(function (str2) {
            var splitApp = sap.ui.getCore().byId("reportApp");
            splitApp.toDetail(view.pgQuery);
            //var str2 = JSON.parse("{" + event.getSource().getCustomData()[1].getKey() + "}");
            that.show_report(str2);
        });
        //UtilGen.clearPage(that.pgMenus);
        that.menuscroll.addContent(that.qv.getControl());
        //      }
        var cod = "8800";//this.view.cb.getSelectedItem().getKey();
        var artit = (view.sLangu == "AR" ? "NVL(M1.MENU_TITLEA,M1.MENU_TITLE) TITLE ," : "M1.MENU_TITLE TITLE,");
        var artit2 = (view.sLangu == "AR" ? "NVL(M2.MENU_TITLEA,M1.MENU_TITLE) LIST_GROUP_NAME ," : "M2.MENU_TITLE LIST_GROUP_NAME,");
        Util.doAjaxJson("sqlmetadata?", {
            sql: "SELECT M1.MENU_CODE CODE," + artit +
            "M1.PARENT_MENUCODE LIST_GROUP_CODE," +
            artit2 +
            " M1.TYPE_OF_EXEC,M1.EXEC_LINE FROM C6_MAIN_MENUS M1,C6_MAIN_MENUS M2 " +
            "WHERE M2.MENU_CODE=M1.PARENT_MENUCODE AND " +
            " M1.GROUP_CODE='" + cod + "' AND " +
            "M1.PARENT_MENUCODE IS NOT NULL " +
            "ORDER BY M1.MENU_PATH"
        }, false).done(function (data) {
            //var no = JSON.parse("{" + data.data + "}")
            //sap.m.MessageToast.show(no);
            that.qv.setJsonStr("{" + data.data + "}");
            that.qv.switchType("list");
            that.qv.loadData();

            (view.byId("searchField") != undefined ? view.byId("searchField").destroy() : "");
            that.filterBox.addItem(new sap.m.SearchField(view.createId("searchField"), {
                    placeholder: "Search..",
                    width: "100%",
                    liveChange: function (event) {
                        var fld = (view.sLangu == "AR" ? "TITLEA" : "TITLE");
                        var lst = that.qv.mList;
                        var val = event.getParameter("newValue");
                        var filter = new sap.ui.model.Filter(fld, sap.ui.model.FilterOperator.Contains, val);
                        var binding = lst.getBinding("items");
                        binding.filter(filter);
                    }
                }
            ));
        });
    },
    openQuery: function () {
        var that = this;
        var view = this.view;
        var repCode = selRec.CODE;
        UtilGen.clearPage(this.pgQuery);
        var fr = sap.ui.jsfragment("bin.Qd", this.oController);
        this.pgQuery.addContent(fr);

    },
    createResultPage: function () {
        var splitApp = sap.ui.getCore().byId("reportApp");
        UtilGen.clearPage(this.pgResult);
        var that = this;
        var view = this.oController.getView();
        view.qv = new QueryView("tbl");
        var repTitle = (that.selRec == undefined ? "" : that.selRec.TITLE);
        (view.byId("resultTitle") != undefined ? view.byId("resultTitle").destroy() : null);
        var tol = new sap.m.Toolbar({
            content: [
                (!sap.ui.Device.system.phone ? null :
                    new sap.m.Button({
                        icon: "sap-icon://menu2",
                        press: function () {
                            var splitApp = sap.ui.getCore().byId("reportApp");
                            splitApp.toMaster(splitApp.getMasterPages()[0]);
                            splitApp.showMaster();
                        }
                    })),
                new sap.m.Title(view.createId("resultTitle"), {text: repTitle}).addStyleClass("titleFont"),
                new sap.m.ToolbarSpacer(),
                new sap.m.Button({
                    icon: "sap-icon://nav-back",
                    press: function () {
                        var splitApp = sap.ui.getCore().byId("reportApp");
                        splitApp.toDetail(that.pgQuery, "flip");
                        if (!sap.ui.Device.system.phone)
                            splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://print",
                    press: function () {
                        that.view.qv.printHtml(that.view, "para");
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://filter",
                    press: function () {
                        that.showFilterWindow();
                    }
                })

            ]
        });
        var clk = function () {
            var oMenu = new sap.m.Menu({
                title: "random",
                itemSelected: function (oEvent) {
                    var oItem = oEvent.getParameter("item");
                    if (oItem.getCustomData()[0].getKey() == "advance_para")
                        that.show_advance_para();
                    if (oItem.getCustomData()[0].getKey() == "graph_new") {
                        that.show_add_new_graph();
                    }
                    if (oItem.getCustomData()[0].getKey() == "graph") {
                        var rep = oItem.getCustomData()[1].getValue();
                        var dx = rep;
                        if (dx.REP_TYPE == "SQL" || dx.REP_TYPE == "DATASET" || dx.REP_TYPE == "TABLE") {
                            splitApp.toDetail(that.pgGraph, "slide");
                            that.show_graph_sql(dx);
                        }

                        if (dx.REP_TYPE == "OPTIONS") {
                            splitApp.toDetail(that.pgGraph, "slide");
                            that.show_graph_option(dx);

                        }
                        if (dx.REP_TYPE == "PDF") {
                            that.show_pre_pdf(dx);
                        }

                    }
                }
            });
            Util.addMenuSubReps(view, oMenu, false);
            oMenu.openBy(view.byId("menu"));
        };
        view.subrep = undefined;
        if (view.byId("txtSubGroup") != undefined) {
            var rid = view.byId("txtSubGroup").getSelectedItem().getKey();


            Util.doAjaxGet("exe?command=get-subrep&report-id=" + rid, "", false).done(function (data) {
                var dtx = JSON.parse("{" + data + "}").subrep;

                view.subrep = dtx;
                (view.byId("menu") != undefined ? view.byId("menu").destroy() : null);
                var menu = new sap.m.Button(view.createId("menu"), {
                    text: '\u2807 {i18n>action}',
                    press: clk
                }).addStyleClass("menuicon");
                tol.addContent(menu);
            });
        }

        this.pgResult.addContent(tol);
        (view.byId("resultScroll") != undefined ? view.byId("resultScroll").destroy() : null);
        var scroll = new sap.m.ScrollContainer(view.createId("resultScroll"),
            {
                height: "1px",
                vertical: true,
                content: []
            }
        );
        this.pgResult.addContent(scroll);
        scroll.addContent(view.qv.getControl());

    },
    show_report: function (selRec) {
        var that = this;
        var view = this.view;
        var repCode = selRec.CODE;

        this.toe = selRec.TYPE_OF_EXEC;

        UtilGen.clearPage(this.pgQuery);


        if (this.toe == "QUERY" || this.toe == "SUBREP" || this.toe == "QTREE")
            this.createViewQuery(selRec);
        if (this.toe == "FORM") {
            var fr = sap.ui.jsfragment(selRec.EXEC_LINE, this.oController);
            this.pgQuery.addContent(fr);
        }


    },
    createViewQuery: function (selRec) {
        var that = this;
        var view = this.view;
        var repTitle = selRec.TITLE;
        that.selRec = selRec;


        var qmdl = sap.ui.getCore().getModel("query_para");
        this.query_para = {};
        if (qmdl != undefined)
            view.query_para = qmdl.getData();

        this.qv = new QueryView("qryDetails");
        var titleBox = new sap.m.FlexBox({
            width: "100%",
            height: "20px",
            justifyContent: sap.m.FlexJustifyContent.Center,
            items: [new sap.m.Text({text: repTitle}).addStyleClass("titleFont blackText")]
        });

        (view.byId("txtSubGroup") != undefined ? view.byId("txtSubGroup").destroy() : null);
        var txtSubGroup = new sap.m.ComboBox(view.createId("txtSubGroup"),
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({
                        text: "{rep_name} - {rep_code}",
                        key: "{rep_code}"
                    }),
                    templateShareable: true,

                },
                width: "80%",
                selectionChange: function (event) {
                    that.onChangeReport();
                }

            });
        var titleBox = new sap.m.FlexBox({
            width: "100%",
            justifyContent: sap.m.FlexJustifyContent.Center,
            items: [new sap.m.Text({text: repTitle}).addStyleClass("blackText titleFont ")]
        });

        that.pgQuery.addContent(titleBox);
        Util.doAjaxGet("exe?command=get-quickrep-metadata&report-id=" + selRec.EXEC_LINE, "", false).done(function (data) {
            var dtx = JSON.parse(data);
            var txtSubGroup = view.byId("txtSubGroup");
            txtSubGroup.setModel(new sap.ui.model.json.JSONModel(dtx.subreport));
            that.view.reportsData = dtx;
            console.log(dtx);
            if (view.byId("txtSubGroup").getItems().length > 0) {
                view.byId("txtSubGroup").setSelectedItem(view.byId("txtSubGroup").getItems()[0]);
                that.onChangeReport();
            }

        });
    },
    onChangeReport: function () {
        var that = this;
        var view = this.view;
        var splitApp = sap.ui.getCore().byId("reportApp");
        var rp = view.byId("txtSubGroup").getSelectedItem().getKey();
        this.qv.reset();
        this.executed = false;
        Util.doAjaxGet("exe?command=get-quickrep-cols&report-id=" + rp, "", false).done(function (data) {
            var dtx = JSON.parse(data);
            view.colData = dtx;   // report  columns and information.
        });
        if (that.sf != undefined) {


            var vl = UtilGen.getControlValue(view.byId("txtSubGroup"));
            var mdl = view.byId("txtSubGroup").getModel().getData();

            that.sf.removeAllContent();
            that.sf.destroyContent();
            this.pgQuery.removeContent(that.sf);

            (view.byId("txtSubGroup") != undefined ? view.byId("txtSubGroup").destroy() : null);
            var txtSubGroup = new sap.m.ComboBox(view.createId("txtSubGroup"),
                {
                    items: {
                        path: "/",
                        template: new sap.ui.core.ListItem({
                            text: "{rep_name} - {rep_code}",
                            key: "{rep_code}"
                        }),
                        templateShareable: true,

                    },
                    width: "80%",
                    selectionChange: function (event) {
                        that.onChangeReport();
                    }

                });
            txtSubGroup.setModel(new sap.ui.model.json.JSONModel(mdl));
            UtilGen.setControlValue(txtSubGroup, vl);
            //UtilGen.clearPage(that.pgQuery);
        } // end if that.sf != undefined

        (view.byId("pgParaBar") != undefined ? view.byId("pgParaBar").destroy() : null);
        that.sf = new sap.ui.layout.form.SimpleForm(view.createId("pgParaBar"), {
            editable: true,
            layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,

            labelSpanXL: 2,
            labelSpanL: 3,
            labelSpanM: 3,
            labelSpanS: 12,
            adjustLabelSpan: false,
            emptySpanXL: 2,
            emptySpanL: 2,
            emptySpanM: 2,
            emptySpanS: 0,
            columnsXL: 2,
            columnsL: 2,
            columnsM: 1,
            singleContainerFullSize: false,
            content: [],
            toolbar: new sap.m.Toolbar({
                content: [
                    new sap.m.Title({text: "Report type", level: "H4", titleStyle: "H4"}),
                    view.byId("txtSubGroup"),
                    new sap.m.ToolbarSeparator({width: "100%"}),
                ]
            })
        }).addStyleClass("paraForm");

        this.pgQuery.addContent(that.sf);

        splitApp.toDetail(that.pgQuery, "flip");
        splitApp.hideMaster();

        Util.createParas(view, that.sf, "result", "para", true, "", false);

        (view.byId("chkBackGroundPara") != undefined ? view.byId("chkBackGroundPara").destroy() : null);
        var chk = new sap.m.CheckBox(view.createId("chkBackGroundPara"), {
            selected: false
        });
        that.sf.addContent(new sap.ui.commons.Label({text: "Run Background on server"}));
        that.sf.addContent(chk);
        that.sf.addContent(new sap.m.Label());
        that.sf.getToolbar().addContent(new sap.m.ToolbarSpacer());
        (that.view.byId("refreshResultPara") != undefined ? that.view.byId("refreshResultPara").destroy() : null);
        that.sf.getToolbar().addContent(new sap.m.Button(view.createId("refreshResultPara"), {
                text: "{i18n>execute_query}",
                icon: "sap-icon://physical-activity",
                press: function (event) {
                    that.refresh("para");
                    var chkBkgr = view.byId("chkBackGroundPara");
                    if (!chkBkgr.getSelected()) {
                        var splitApp = sap.ui.getCore().byId("reportApp");
                        splitApp.toDetail(that.pgResult, "flip");
                        that.createResultPage();
                        splitApp.hideMaster();
                        if (!sap.ui.Device.system.phone)
                            splitApp.setMode(sap.m.SplitAppMode.HideMode);

                        (that.view.byId("showResultPg") != undefined ? that.view.byId("showResultPg").destroy() : null);
                        that.sf.getToolbar().addContent(new sap.m.Button(that.view.createId("showResultPg"), {
                                text: "",
                                icon: "sap-icon://undo",
                                press: function (event) {
                                    var splitApp = sap.ui.getCore().byId("reportApp");
                                    splitApp.toDetail(that.pgResult, "flip");
                                    splitApp.hideMaster();
                                    if (!sap.ui.Device.system.phone)
                                        splitApp.setMode(sap.m.SplitAppMode.HideMode);
                                }
                            }).addStyleClass("")
                        );
                    }
                }
            }).addStyleClass("")
        );
        that.sf.addContent(new sap.m.Label()).addStyleClass("sapUiLargeMarginBottom");
        that.sf.getToolbar().addContent(new sap.m.Button({
                text: "Preference",
                icon: "sap-icon://action-settings",
                press: function (event) {

                }
            }).addStyleClass("")
        );
        that.fetch_data = false;
        var ps = "&report-id=" + view.byId("txtSubGroup").getSelectedItem().getKey();
        Util.doAjaxGetSpin("exe?command=get-batch-status" + ps, "", false, function (data) {
            var dt = JSON.parse(data);
            if (dt.status == "END") {
                var pgbar = view.byId("pgParaBar" +
                    "" +
                    "");
                var chkBkgr = view.byId("chkBackGroundPara");
                chkBkgr.setSelected(true);
                for (var v in pgbar.getContent())
                    try {
                        pgbar.getContent()[v].setEnabled(false);
                    } catch (er) {
                    }
                clearInterval(that.rcv_data_timer);
                var bt = view.byId("refreshResultPara");
                bt.setText("Fetch data..");
                bt.setEnabled(true);
                that.fetch_data = true;

            }
        }, undefined, false);
    },
    createResultPage: function () {
        var splitApp = sap.ui.getCore().byId("reportApp");
        UtilGen.clearPage(this.pgResult);
        var that = this;
        var view = this.view;
        view.qv = new QueryView("tbl");
//        that.graphToolBar = new sap.m.Toolbar();
        var repTitle = (that.selRec == undefined ? "" : that.selRec.TITLE);
        (view.byId("resultTitle") != undefined ? view.byId("resultTitle").destroy() : null);
        var tol = new sap.m.Toolbar({
            content: [
                (!sap.ui.Device.system.phone ? null :
                    new sap.m.Button({
                        icon: "sap-icon://menu2",
                        press: function () {
                            var splitApp = sap.ui.getCore().byId("reportApp");
                            splitApp.toMaster(splitApp.getMasterPages()[0]);
                            splitApp.showMaster();
                        }
                    })),
                new sap.m.Title(view.createId("resultTitle"), {text: repTitle}).addStyleClass("titleFont"),
                new sap.m.ToolbarSpacer(),
                new sap.m.Button({
                    icon: "sap-icon://nav-back",
                    press: function () {
                        var splitApp = sap.ui.getCore().byId("reportApp");
                        splitApp.toDetail(that.pgQuery, "flip");
                        if (!sap.ui.Device.system.phone)
                            splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://print",
                    press: function () {
                        that.view.qv.printHtml(that.view, "para");
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://filter",
                    press: function () {
                        that.showFilterWindow();
                    }
                })

            ]
        });
        var clk = function () {
            var oMenu = new sap.m.Menu({
                title: "random",
                itemSelected: function (oEvent) {
                    var oItem = oEvent.getParameter("item");
                    if (oItem.getCustomData()[0].getKey() == "advance_para")
                        that.show_advance_para();
                    if (oItem.getCustomData()[0].getKey() == "graph_new") {
                        that.show_add_new_graph();
                    }
                    if (oItem.getCustomData()[0].getKey() == "graph") {
                        var rep = oItem.getCustomData()[1].getValue();
                        var dx = rep;
                        if (dx.REP_TYPE == "SQL" || dx.REP_TYPE == "DATASET" || dx.REP_TYPE == "TABLE") {
                            splitApp.toDetail(that.pgGraph, "slide");
                            that.show_graph_sql(dx);
                        }

                        if (dx.REP_TYPE == "OPTIONS") {
                            splitApp.toDetail(that.pgGraph, "slide");
                            that.show_graph_option(dx);

                        }
                        if (dx.REP_TYPE == "PDF") {
                            that.show_pre_pdf(dx);
                        }

                    }
                }
            });
            Util.addMenuSubReps(view, oMenu, false);
            oMenu.openBy(view.byId("menu"));
        };
        view.subrep = undefined;
        if (view.byId("txtSubGroup") != undefined) {
            var rid = view.byId("txtSubGroup").getSelectedItem().getKey();


            Util.doAjaxGet("exe?command=get-subrep&report-id=" + rid, "", false).done(function (data) {
                var dtx = JSON.parse("{" + data + "}").subrep;

                view.subrep = dtx;
                (view.byId("menu") != undefined ? view.byId("menu").destroy() : null);
                var menu = new sap.m.Button(view.createId("menu"), {
                    text: '\u2807 {i18n>action}',
                    press: clk
                }).addStyleClass("menuicon");
                tol.addContent(menu);

                // for (var i in dtx) {
                //     (view.byId("subrep_" + dtx[i].KEYFLD) != undefined ? view.byId().destroy("subrep_" + dtx[i].KEYFLD) : null);
                //     var bt = new sap.m.Button(view.createId("subrep_" + dtx[i].KEYFLD), {
                //         customData: [{key: i}],
                //         press: function (event) {
                //             var d = event.getSource().getCustomData()[0].getKey();
                //             var dx = view.subrep[d];
                //             var splitApp = sap.ui.getCore().byId("reportApp");
                //
                //             if (dx.REP_TYPE == "SQL" || dx.REP_TYPE == "DATASET" || dx.REP_TYPE == "TABLE") {
                //                 splitApp.toDetail(that.pgGraph, "slide");
                //                 that.show_graph_sql(dx);
                //             }
                //
                //             if (dx.REP_TYPE == "OPTIONS") {
                //                 splitApp.toDetail(that.pgGraph, "slide");
                //                 that.show_graph_option(dx);
                //
                //             }
                //             if (dx.REP_TYPE == "PDF") {
                //                 that.show_pre_pdf(dx);
                //             }
                //
                //         }
                //     });
                //     if (dtx[i].ICON_NAME == "NONE") {
                //         bt.setText("..");
                //     } else {
                //         bt.setIcon("sap-icon://" + dtx[i].ICON_NAME);
                //     }
                //
                //     bt.setTooltip(dtx[i].REP_TITLE);

                //    tol.addContent(bt);
                //}


            });
        }

        this.pgResult.addContent(tol);
        (view.byId("resultScroll") != undefined ? view.byId("resultScroll").destroy() : null);
        var scroll = new sap.m.ScrollContainer(view.createId("resultScroll"),
            {
                height: "1px",
                vertical: true,
                content: []
            }
        );
        this.pgResult.addContent(scroll);
        scroll.addContent(view.qv.getControl());
    },
    show_report: function (selRec) {

        var that = this;
        var view = this.view;
        var repCode = selRec.CODE;

        this.toe = selRec.TYPE_OF_EXEC;

        UtilGen.clearPage(this.pgQuery);


        if (this.toe == "QUERY" || this.toe == "SUBREP" || this.toe == "QTREE")
            this.createViewQuery(selRec);
        if (this.toe == "FORM") {
            var fr = sap.ui.jsfragment(selRec.EXEC_LINE, this.oController);
            this.pgQuery.addContent(fr);
        }


    },


});



