sap.ui.jsfragment("bin.Queries", {

    createContent: function (oController) {
        jQuery.sap.require("sap.ui.commons.library");
        var oModel = sap.ui.getCore().getModel("screens");
        var that = this;
        var view = oController.getView();
        this.oController = oController;
        var url = new URL(window.location.href);
        var code = url.searchParams.get("rep_id");
        if (code != undefined)
            that.query_code = code;

        code = url.searchParams.get("rep_type");
        if (code != undefined)
            that.query_code2 = code;

        code = url.searchParams.get("menu_group");
        if (code != undefined)
            that.menu_group = code;
        code = url.searchParams.get("hide_menu");
        if (code != undefined)
            that.hide_menu = code;


        this.oController = oController;
        this.view = view;
        this.setModel(oModel, "data");

        this.bk = undefined;
        if (oController.backFunction != undefined) {
            this.bk = new sap.m.Button({
                icon: "sap-icon://nav-back",
                press: function () {
                    var splitApp = sap.ui.getCore().byId("reportApp");
                    splitApp.backFunction();
                }
            });
        }
        this.qd = new sap.m.Button({
            icon: "sap-icon://create",
            press: function () {
                that.openQuery();
            }
        });

        (view.byId("filterBox") != undefined ? view.byId("filterBox").destroy() : "");
        (view.byId("profile") != undefined ? view.byId("profile").destroy() : "");
        view.cb = new sap.m.ComboBox(
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{name}", key: "{code}"}),
                    templateShareable: true
                },
                selectionChange: function (event) {
                    that.onChangeProfile(event);
                }
            });
        this.menuscroll = new sap.m.ScrollContainer({
            height: "85%",
            vertical: true
        });

        this.getProfileList();
        var fp = (this.bk != undefined ? [this.bk] : []);
        fp.push(this.qd);
        fp.push(view.cb);

        this.filterBox = new sap.m.FlexBox(view.createId("filterBox"),
            {
                width: "100%",
                items: fp,
                direction: sap.m.FlexDirection.Row,
                alignItems: sap.m.FlexAlignItems.Start
            }
        ).addStyleClass("paddingLeftRightTop sapContrast");

        this.pgMenus = new sap.m.Page({
            height: "100%",
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

        this.setCurrentProfile();
        var splitApp = new sap.m.SplitApp("reportApp").addStyleClass("");
        splitApp.addMasterPage(this.pgMenus);
        splitApp.addDetailPage(this.pgQuery);
        splitApp.addDetailPage(this.pgResult);
        splitApp.addDetailPage(this.pgGraph);
        if (Util.nvl(that.hide_menu, "") == "TRUE") {
            splitApp.setMode(sap.m.SplitAppMode.HideMode);
            sap.ui.getCore().byId("cmdMainScreenChange").setEnabled(false);
        }
        else
            splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
        splitApp.showMaster();
        this.generate_list(view);

        // if URI parameter passed then show that query parameter window..
        this.runParas();
        setTimeout(function () {
            view.byId("todate").$().hide();
        }, 100);
        return splitApp;
    },
    onChangeProfile: function (event) {
        this.generate_list(this.view);
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
        var cod = this.view.cb.getSelectedItem().getKey();
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
    getProfileList: function () {
        var that = this;
        var view = this.view;
        var pth = "exe?command=get-profile-list";
        Util.doAjaxGet(pth, "", false).done(function (data) {
            if (data != undefined) {
                var dt = JSON.parse(data).list;
                var oModel = new sap.ui.model.json.JSONModel(dt);
                view.cb.setModel(oModel);
            }

        });

    },
    setCurrentProfile: function () {
        var that = this;
        if (this.oController.setProfile != undefined) {
            that.view.cb.setSelectedItem(UtilGen.getIndexByKey(that.view.cb, this.oController.setProfile));
            return;
        }
        Util.doAjaxGet("exe?command=get-current-profile", "", false).done(function (data) {
            var dt = JSON.parse(data);
            that.view.cb.setSelectedItem(UtilGen.getIndexByKey(that.view.cb, dt.code));

        });
    },
    openQuery: function () {

        var that = this;
        var view = this.view;
//        var repCode = selRec.CODE;
        UtilGen.clearPage(this.pgQuery);
        var fr = sap.ui.jsfragment("bin.Qd", this.oController);
        this.pgQuery.addContent(fr);

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
            var splitApp = sap.ui.getCore().byId("reportApp");
            var fr = sap.ui.jsfragment(selRec.EXEC_LINE, this.oController);
            splitApp.toDetail(that.pgQuery, "flip");
            this.pgQuery.addContent(fr);
        }


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
                            if (Util.nvl(that.hide_menu, "") == "TRUE") {
                                splitApp.setMode(sap.m.SplitAppMode.HideMode);
                                sap.ui.getCore().byId("cmdMainScreenChange").setEnabled(false);
                            }
                            else
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
    }
    ,
    createViewQuery:
        function (selRec) {
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
        }

    ,
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
    }
    ,

    refresh: function (iadd) {
        //variables
        var view = this.view;
        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        //this.fetch_data = false;
        var that = this;
        if (this.toe == "QTREE")
            view.qv.switchType("tree", this.pgResult);


        if (this.fetch_data) {
            var ps = "&report-id=" + view.byId("txtSubGroup").getSelectedItem().getKey();
            Util.doAjaxGet("exe?command=get-batch-data" + ps, "", false).done(function (data) {
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
                }).addStyleClass(""));
                that._rcvData(view, data, false);
            });
            this.fetch_data = false;
            this.do_report_status();
            return;
        }


        if (view.colData == undefined)
            return;
        var ps = "";
        var ia = Util.nvl(iadd, "");
        // iterating parameters and passing on ajax call..
        for (var i = 0; i < Util.nvl(view.colData.parameters, []).length; i++) {
            var vl = "";
            if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (view.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else if (view.colData.parameters[i].PARA_DATATYPE === "GROUP")
                vl = Util.nvl(view.byId("para_" + ia + i).getSelectedButton().getCustomData()[0].getKey());
            else
                vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");

            if (view.query_para == undefined)
                view.query_para = {};

            view.query_para[view.colData.parameters[i].PARAM_NAME] = vl;

            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + df.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0
                && view.colData.parameters[i].LISTNAME.toUpperCase().startsWith("SELECT"))
                vl = view.byId("para_" + ia + i).getValue();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }

        var grp1 = (view.byId("txtGroupHeader") != undefined ? Util.nvl(view.byId("txtGroupHeader").getValue(), "") : "");
        var grp2 = (view.byId("txtGroupDetail") != undefined ? Util.nvl(view.byId("txtGroupDetail").getValue(), "") : "");
        var chkBkgr = view.byId("chkBackGroundPara");
        var pgbar = view.byId("pgParaBar");

        if (chkBkgr.getSelected()) {
            ps += "&runbackground=true";
            for (var v in pgbar.getContent())
                if (!(pgbar.getContent()[v] instanceof sap.m.Label))
                    try {
                        pgbar.getContent()[v].setEnabled(false);
                    } catch (er) {
                    }

        }


        ps += "&report-id=" + view.byId("txtSubGroup").getSelectedItem().getKey() +
            "&group1=" + grp1 + "&group2=" + grp2;


        var ca = "";
        for (var i = 0; i < view.colData.cols.length; i++)
            ca += (ca.length > 0 ? "&" : "") + "col_" + i + "=" + view.colData.cols[i].field_name;

        ps += (ca.length > 0 ? "&" : "") + ca;

        console.log(ps);

        // var pg=new sap.m.Page({
        //     customHeader:view.oBar2
        //
        // });
        var that = this;
        Util.doAjaxGetSpin("exe?command=get-quickrep-data&" + (ps), "", (!chkBkgr.getSelected()), function (data) {
                if (!chkBkgr.getSelected())
                    that._rcvData(view, data, chkBkgr.getSelected());
                else {
                    that.rcv_data_timer = setInterval(function () {
                        that._rcvData(view, data, chkBkgr.getSelected());
                    }, 1000);
                }

            }, undefined,
            (!chkBkgr.getSelected())
        );

        if (view.colData.sql_title.title_eng.length > 0) {
            Util.doAjaxJson("sqlmetadata?" + ps, {sql: view.colData.sql_title.title_eng}, false).done(function (data) {
                var no = JSON.parse("{" + data.data + "}").data[0]['NAME'];
                //sap.m.MessageToast.show(no);
                var tit = view.byId("resultTitle").setText(tit + " - " + no);
//                view.oBar2.getContentMiddle()[0].getItems()[0].setText(tit + " - " + no);
            });
        }
    }
    ,
    _rcvData: function (view, data, chkBkgr) {
        var that = this;
        if (!chkBkgr) {
            Util.stopSpin();
            clearInterval(this.rcv_data_timer);
            view.qv.setParent(this.pgResult);
            view.qv.setJsonStr(data);
            view.qv.loadData();
            that.fetchFixReports();
            var v = parseInt(view.colData.other_prop.fixedcolcount);
            if (!sap.ui.Device.system.phone)
                view.qv.getControl().setFixedColumnCount(v);
            view.executed = true;
            if (view.qv.mLctb.rows.length == 0)
                sap.m.MessageToast.show("No records found !");
            else
                sap.m.MessageToast.show("Found # " + view.qv.mLctb.rows.length + " Records !");

            if (sap.ui.getCore().getModel("query_para") != undefined)
                sap.ui.getCore().getModel("query_para").setData(view.query_para);
            else
                sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(view.query_para), "query_para");

            if (view.qv.queryType == "table" && Util.nvl(view.qv.buildQuickFilter(), false) == true) {
                var sp = sap.ui.getCore().byId("SplitPage");
                sp.show_quickFilter_panel(view.qv.filterBox, "Filter list");
            }
        } else {
            var ps = "&report-id=" + view.byId("txtSubGroup").getSelectedItem().getKey();
            clearInterval(that.rcv_data_timer);
            Util.doAjaxGetSpin("exe?command=get-batch-status" + ps, "", false, function (data) {
                var dt = JSON.parse(data);
                if (dt.status == "END") {
                    clearInterval(that.rcv_data_timer);
                    var bt = view.byId("refreshResultPara");
                    bt.setText("Fetch data..");
                    bt.setEnabled(true);
                    that.fetch_data = true;

                }
            }, undefined, false);
        }

    }
    ,
    do_report_status: function (iadd) {
        var view = this.view;
        var that = this;
        var ia = Util.nvl(iadd, "");
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var ps = "&report-id=" + view.byId("txtSubGroup").getSelectedItem().getKey();
        Util.doAjaxGetSpin("exe?command=get-batch-status" + ps, "", false, function (data) {
            var dt = JSON.parse(data);
            if (dt.status == "START") {
                that.fetch_data = false;
                var bt = view.byId("refreshResultPara");
                bt.setEnabled(false);
                var pgbar = view.byId("pgParaBar");
                for (var v in pgbar.getContent())
                    if (!(pgbar.getContent()[v] instanceof sap.m.Label))
                        try {
                            pgbar.getContent()[v].setEnabled(false);
                        } catch (er) {
                        }
            } else if (dt.status == "END") {
                var bt = view.byId("refreshResultPara");
                clearInterval(that.rcv_data_timer);
                var bt = view.byId("refreshResultPara");
                bt.setText("Fetch data..");
                that.fetch_data = true;
                var pgbar = view.byId("pgParaBar");
                for (var v in pgbar.getContent())
                    if (!(pgbar.getContent()[v] instanceof sap.m.Label))
                        try {
                            pgbar.getContent()[v].setEnabled(false);
                        } catch (er) {
                        }
                bt.setEnabled(true);
                Util.doAjaxGetSpin("exe?command=get-batch-params" + ps, "", false, function (data) {
                    console.log(data);
                    var dt = JSON.parse(data);
                    if (dt.errorMsg != undefined) {
                        sap.m.MessageToast.show(dt.errorMsg);
                        return;
                    }
                    for (var i = 0; i < Util.nvl(view.colData.parameters, []).length; i++) {
                        var vl = "";
                        var varia = "_para_" + view.colData.parameters[i].PARAM_NAME;
                        var paVal = dt.parameters[varia];

                        if (paVal != undefined && view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                            view.byId("para_para" + ia + i).setSelected((paVal == "TRUE"));
                        else
                            view.byId("para_para" + ia + i).setValue(paVal.substr(1));

                        if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                            view.byId("para_para" + ia + i).setValue(paVal.substr(1));
                    }


                    // for (var vv in Util.nvl(dt.parameters, []))
                    //     for (var v in dt.parameters[vv]) {
                    //         if (v.startsWith("_para_")) {
                    //             var ob = view.byId(v.substr(2));
                    //             if (ob != undefined)
                    //                 if (dt.parameters[vv][v] != undefined && dt.parameters[vv][v].startsWith("@"))
                    //                     ob.setValue(dt.parameters[vv][v]);
                    //         }
                    //     }
                }, undefined, false);

            } else if (dt.status == "NONE") {
                clearInterval(that.rcv_data_timer);
                var bt = view.byId("refreshResultPara");
                bt.setText(view.getModel("i18n").getResourceBundle().getText("execute_query"));
                bt.setEnabled(true);
                that.fetch_data = false;
                var pgbar = view.byId("pgParaBar");
                for (var v in pgbar.getContent())
                    if (!(pgbar.getContent()[v] instanceof sap.m.Label))
                        try {
                            pgbar.getContent()[v].setEnabled(true);
                        } catch (er) {
                        }
            }

        }, undefined, false);
    }
    ,
    show_graph_option: function (rep) {
        var that = this;
        var view = this.view;

        (view.byId("graphPgToolBar") != undefined ? view.byId("graphPgToolBar").destroy() : null);
        var pgToolBar = new sap.m.Toolbar(view.createId("graphPgToolBar"));
        (view.byId("graphOption") != undefined ? view.byId("graphOption").destroy() : null);
        var cb = new sap.m.ComboBox(view.createId("graphOption"), {});

        (view.byId("graphOptionBack") != undefined ? view.byId("graphOptionBack").destroy() : null);
        var bk = new sap.m.Button(view.createId("graphOptionBack"), {
            icon: "sap-icon://nav-back",
            press: function () {
                var splitApp = sap.ui.getCore().byId("reportApp");
                splitApp.toDetail(that.pgResult, "slide");
            }
        });

        (view.byId("graphOptionPrint") != undefined ? view.byId("graphOptionPrint").destroy() : null);
        var pn = new sap.m.Button(view.createId("graphOptionPrint"), {
            icon: "sap-icon://print",
            press: function () {
                that.printGraph();
            }
        });

        Util.doAjaxGet("exe?command=get-option-subreps&report-id=" + rep.KEYFLD, false).done(function (data) {
            var dt = JSON.parse(data);
            view.optionReps = [];
            for (var v in dt)
                for (var d in dt[v]) {
                    cb.addItem(new sap.ui.core.ListItem({
                        text: v + "-" + dt[v][d].REP_TITLE,
                        key: v + "-" + dt[v][d].REP_TITLE
                    }));
                    view.optionReps[v + "-" + dt[v][d].REP_TITLE] = dt[v][d];
                }
            UtilGen.clearPage(that.pgGraph);
//            that.pgGraph.addContent(that.graphToolBar);
            that.pgGraph.addContent(pgToolBar);

            pgToolBar.addContent(bk);
            pgToolBar.addContent(cb);
            pgToolBar.addContent(pn);


            cb.attachSelectionChange(function (ev) {
                var rep = view.optionReps[cb.getSelectedItem().getKey()];
                that.show_graph(rep);
            });
            if (cb.getItems().length > 0) {
                cb.setSelectedItem(cb.getItems()[0]);
                var rep = view.optionReps[cb.getSelectedItem().getKey()];
                that.show_graph(rep);
            }


        });

    }
    ,
    show_graph: function (rep) {
        if (rep.REP_TYPE == "SQL") {
            this.show_graph_sql(rep);
            return;
        }

        // if (rep.REP_TYPE == "DATASET") {
        //     this.show_graph(rep);
        //     return;
        // }
        if (rep.REP_TYPE == "TABLE") {
            this.show_query(rep);
            return;
        }

        if (rep.REP_TYPE == "PDF") {
            this.show_pre_pdf(rep);
            return;
        }

        var view = this.view;
        var that = this;
        var mTable = view.qv.getControl();
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);


        var selectedIndices = mTable.getSelectedIndices();
        var selectedEntries = [];
        var tableData = mTable.getModel().getData();
        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTable.getContextByIndex(selectedIndices[i]);
            var data = oData.getProperty(oData.getPath());
            var fnd = true;
            // do not add selectedEntries if subgroup or summary line..
            if (view.qv.mLctb.cols[0].mGrouped && (
                data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4095)) ||
                data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4094))
            ))
                fnd = false;
            if (fnd)
                selectedEntries.push(data);
        }


        var dt = {};
        var gData = [];
        var dms = rep.DIMENSIONS.split(",");
        var ms = rep.MEASURES;


        for (var i = 0; i < selectedEntries.length; i++) {
            dt = {};
            for (var d in dms)
                dt[dms[d]] = selectedEntries[i][dms[d]];
            dt[ms] = parseFloat(df.formatBack(selectedEntries[i][ms]));
            gData.push(dt);
        }
        this.executeGraph(rep, selectedEntries, gData);

    }
    ,

    show_graph_sql: function (rep) {
        if (rep.REP_TYPE == "DATASET") {
            this.show_graph(rep);
            return;
        }
        if (rep.REP_TYPE == "TABLE") {
            this.show_query(rep);
            return;
        }

        if (rep.REP_TYPE == "PDF") {
            this.show_pdf(rep);
            return;
        }

        var view = this.view;
        var that = this;
        var mTable = view.qv.getControl();
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);


        //get data according to dimensions and measures.
        var selectedIndices = mTable.getSelectedIndices();
        var selectedEntries = [];
        var tableData = mTable.getModel().getData();
        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTable.getContextByIndex(selectedIndices[i]);
            var data = oData.getProperty(oData.getPath());
            var fnd = true;
            // do not add selectedEntries if subgroup or summary line..
            if (view.qv.mLctb.cols[0].mGrouped && (
                data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4095)) ||
                data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4094))
            ))
                fnd = false;
            if (fnd)
                selectedEntries.push(data);
        }
        var dt = {};
        var gData = [];
        var ps = "";
        if (selectedEntries.length <= 0) {
            sap.m.MessageToast.show("No any record selected !");
            return;
        }
        var ia = Util.nvl(view.iadd, "");

        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = "";
            if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (view.byId("para_para" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else if (view.colData.parameters[i].PARA_DATATYPE === "GROUP")
                vl = Util.nvl(view.byId("para_para" + ia + i).getSelectedButton().getCustomData()[0].getKey());
            else
                vl = Util.nvl(view.byId("para_para" + ia + i).getValue(), "");

            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_para" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_para" + ia + i).getValue();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }


        var rcv_flds = Util.nvl(rep.RCV_FLDS, "").split(",");  // finding out to recieve how many fields in array ...

        for (var i = 0; i < selectedEntries.length; i++)
            for (var k in selectedEntries[i]) {
                if (k == "_rowid") continue;
                if (rcv_flds.indexOf(k) < 0) continue;

                var s = "_flds_" + i + "_" + k + "=" + selectedEntries[i][k];
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "date")
                    s = "_flds_" + i + "_" + k + "=@" + sdf.format(selectedEntries[0][k]);
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "number")
                    s = "_flds_" + i + "_" + k + "=" + df.formatBack(selectedEntries[0][k]);

                ps += (ps.length > 0 ? "&" : "") + s;
            }
        ps += (ps.length > 0 ? "&" : "") + "_total_no=" + selectedEntries.length;

        ps += (ps.length > 0 ? "&" : "") + "_keyfld=" + rep.KEYFLD;
        Util.doAjaxGet("exe?command=get-graph-query&" + (ps), "", false).done(function (data) {
            gData = JSON.parse(data).data;
            if (rep.DIMENSIONS != undefined && rep.DIMENSIONS.split(",")[0] == "DAT") {
                for (var g in gData)
                    gData[g]["DAT"] = new Date(gData[g]["DAT"]);
            }
            // var bal_fld = "", firstDimField = "";
            // if (rep.GRAPH_TYPE == "line" && Util.nvl(rep.SORT_FIELD, rep.DIMENSIONS) != undefined) {
            //     var tmpData = JSON.parse(data);
            //     for (var m in tmpData.metadata) {
            //         if (tmpData.metadata[m]["colname"].endsWith("_bal"))
            //             bal_fld = tmpData.metadata[m]["colname"];
            //     }
            //     firstDimField = Util.nvl(rep.SORT_FIELD, rep.DIMENSIONS).split(",")[0];
            //     var LocalTableData = sap.ui.require("sap/ui/chainel1/util/generic/LocalTableData");
            //     var lt = new LocalTableData();
            //     lt.parse(data);
            //     lt.sortCol(lt.getColByName(firstDimField).mColpos, true);
            //     gData = lt.getData(true);
            // } else
            //     gData = JSON.parse(data).data;

        });


        this._addHeaderGraphToolbar(rep);

        this.executeGraph(rep, selectedEntries, gData);
    }
    ,

    executeGraph: function (rep, selectedEntries, gData) {
        var view = this.view;
        var that = this;
        var mTable = view.qv.getControl();


        var oModel = new sap.ui.model.json.JSONModel();
        var dms = rep.DIMENSIONS.split(",");
        var ms = rep.MEASURES.split(",");
        var grpStr = rep.GRAPH_TITLE;
        var ia = Util.nvl(view.iadd, "");

        //UtilGen.clearPage(this.pgGraph);
        //that.pgGraph.addContent(that.graphToolBar);
        (view.byId("gp") != undefined ? view.byId("gp").destroy() : null);


        var ui = {}
        if (rep.FIORI == "TRUE")
            ui = {
                'uiConfig': {
                    'applicationSet': 'fiori',
                    'showErrorMessage': true
                }
            };
        var oVizFrame = new sap.viz.ui5.controls.VizFrame(view.createId("gp"), {ui});

        oModel.setData(gData);
        oVizFrame.setVizType(rep.GRAPH_TYPE);
        oVizFrame.setModel(oModel);
        oVizFrame.setWidth("100%");
        oVizFrame.setHeight("100%");
        var dimensions = [];
        for (var d = dms.length - 1; d > -1; d--) {
            if (dms[d] == "DAT")
                dimensions.push({
                    name: dms[d],
                    value: {
                        parts: [dms[d]],
                        formatter: function (oCreatestamp) {
                            if (oCreatestamp === null) {
                                return oCreatestamp;
                            }
                            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd.MM.yyyy"});
                            return oDateFormat.format(oCreatestamp);
                        }
                    }
                });
            else
                dimensions.push({
                    name: dms[d],
                    value: "{" + dms[d] + "}"
                });
        }
        var measures = [];
        for (var m in ms)
            measures.push({name: ms[m], value: "{" + ms[m] + "}"});


        oVizFrame.setDataset(new sap.viz.ui5.data.FlattenedDataset({
                dimensions: dimensions,
                measures: measures,
                data: {
                    path: "/"
                }
            })
        )
        ;

        if (grpStr != undefined && selectedEntries.length > 0) {
            // from field value ...
            for (var i = 0; i < view.qv.mLctb.cols.length; i++) {
                var st = selectedEntries[0][view.qv.mLctb.cols[i].mColName] + "";
                if ((st.startsWith(String.fromCharCode(4094)) ||
                    st.startsWith(String.fromCharCode(4095))) &&
                    selectedEntries.length > 1)
                    st = selectedEntries[1][view.qv.mLctb.cols[i].mColName] + "";

                grpStr = grpStr.replace(":" + view.qv.mLctb.cols[i].mColName, st);
            }

            // from parameter value ....
            for (var i = 0; i < view.colData.parameters.length; i++) {
                var st = "";
                if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                    st = (view.byId("para_para" + ia + i).getSelected() ? "TRUE" : "FALSE");
                else if (view.colData.parameters[i].PARA_DATATYPE === "GROUP")
                    st = Util.nvl(view.byId("para_para" + ia + i).getSelectedButton().getCustomData()[0].getKey());
                else
                    st = Util.nvl(view.byId("para_para" + ia + i).getValue(), "");


                grpStr = grpStr.replace(":#" + view.colData.parameters[i].PARAM_NAME, st);
            }
            var st = (view.byId("txtSubGroup").getValue() + "");
            grpStr = grpStr.replace(":#SUBREP", st);
            st = (view.byId("txtGroupHeader") != undefined ? view.byId("txtGroupHeader").getValue() : "");
            grpStr = grpStr.replace(":#GROUP1", st);
            st = (view.byId("txtGroupDetail") != undefined ? view.byId("txtGroupDetail").getValue() : "");
            grpStr = grpStr.replace(":#GROUP2", st);

        }

        oVizFrame.setVizProperties({
            plotArea: {
                colorPalette: d3.scale.category20().range(),
                dataPoint: {invalidity: 'ignore'},
                lineType: "dot",
                dataLabel: {
                    visible: (rep.GRAPH_TYPE == 'pie' ? true : false),
                    type: "percentage",
                    hideWhenOverlap: false
                }
            },

            title: {text: grpStr},
            general: {
                groupData: true
            },
            timeAxis: {
                visible: true,
                title: {
                    visible: true,
                    text: "Time"
                },
                interval: {
                    unit: ''
                }
            }

        });
        var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': (rep.GRAPH_TYPE != "pie" ? "valueAxis" : "size"),
            'type': "Measure",
            'values': ms
        });

        for (var d = dms.length - 1; d > -1; d--) {//for (var d in dms) {
            var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': (rep.GRAPH_TYPE != "pie" ? (d == 0 ? "categoryAxis" : "color") : "color"),
                'type': "Dimension",
                'values': [dms[d]]
            });
            oVizFrame.addFeed(feedCategoryAxis);
        }
        oVizFrame.addFeed(feedValueAxis);


        that.pgGraph.addContent(oVizFrame);
        oVizFrame.setHeight("80%");
        this.add_selected_table(rep, selectedEntries);

    }
    ,
    add_selected_table: function (rep, selectedEntries) {
        var view = this.view;
        var that = this;
        var mLctb = view.qv.mLctb;
        var h = "", dt = "", rs = "", t = "";
        var rowid;
        var tmpv1 = "", tmpv2 = "", tmpv3 = "", classadd = "", styleadd = "", cellValue = "";
        var cf = "";
        var grouped = mLctb.cols[0].mGrouped;
        var cnt = 0;
        for (var c in view.qv.col) {
            cnt++;
            if (cnt - 1 == 0 && grouped) continue;
            if (cnt - 1 === view.qv.col.length) continue;
            tmpv1 = (view.qv.col[c].getMultiLabels()[0] == null ? "" : view.qv.col[c].getMultiLabels()[0].getText());
            tmpv2 = "\"text-align:" + view.qv.col[c].getHAlign().toLowerCase() + "\"";
            h += "<th " + tmpv2 + ">" + Util.htmlEntities(tmpv1) + "</th>";
        }
        h = "<thead>" +
            "<tr>" + h + "</tr></thead>";

        for (var i = 0; i < selectedEntries.length; i++) {
            rs = "";
            cnt = 0;
            tmpv2 = "", tmpv3 = "", classadd = "", styleadd = "";
            rowid = Number(Util.nvl(selectedEntries[i]["_rowid"], -1));
            cf = "";
            // finding conditional format..
            for (var v in selectedEntries[i]) {
                var cn = mLctb.getColPos(v);
                if (cn > -1 && rowid > -1 && Util.nvl(mLctb.cols[cn].mCfOperator, "").length > 0) {
                    if (mLctb.evaluteCfValue(mLctb.cols[cn], rowid))
                        cf += mLctb.cols[cn].mCfTrue;
                    else
                        cf += mLctb.cols[cn].mCfFalse;
                }
            }
            // for adding numbers
            for (var v in selectedEntries[i]) {
                cnt++;
                tmpv2 = "", tmpv3 = "", classadd = "", styleadd = "";
                var cn = mLctb.getColPos(v);
                var cc = mLctb.cols[cn];
                if (cnt - 1 == 0) {
                    t = v;
                }   // get 1st array key.. to find this row is summary/group
                if (cnt - 1 === 0 && grouped) {
                    continue;
                }
                if (cnt - 1 === mLctb.cols.length) break;
                cellValue = selectedEntries[i][v];


                if (cellValue != undefined && (cellValue + "").trim().length > 0 && Util.nvl(selectedEntries[i][t], "").startsWith(String.fromCharCode(4095))) {
                    classadd += "yellow "
                }
                if (grouped && cellValue != undefined && selectedEntries[i][t].startsWith(String.fromCharCode(4094))) {
                    classadd += "qrGroup ";
                }

                if (rowid > -1 && cf.length > 0)
                    styleadd += cf;
                if (Util.nvl(cc.getMUIHelper().display_style, "").length > 0) {
                    styleadd += cc.getMUIHelper().display_style;
                }

                var a = "text-align:" + cc.getMUIHelper().display_align + " ";
                if (cc.getMUIHelper().display_format == "MONEY_FORMAT")
                    a = "text-align:end ";
                if (cc.getMUIHelper().display_format == "QTY_FORMAT")
                    a = "text-align:center ";
                styleadd += a;

                styleadd = (styleadd.length > 0 ? ' style="' : "") + styleadd + (styleadd.length > 0 ? '"' : "");
                classadd = (classadd.length > 0 ? ' class="' : "") + classadd + (classadd.length > 0 ? '"' : "");
                tmpv2 = (tmpv2.length > 0 ? ' colspan="' : "") + tmpv2 + (tmpv2.length > 0 ? '"' : "");
                rs += "<td" + tmpv2 + classadd + styleadd + " > " + Util.nvl(Util.htmlEntities(cellValue), "") + "</td>";
            }
            dt += "<tr>" + rs + "</tr>";

        }
        h = "<table class='graphTable'>" + h + dt + "</table>";
        (view.byId("htmlGraphTable") != undefined ? view.byId("htmlGraphTable").destroy() : null);
        var oo = new sap.ui.core.HTML(view.createId("htmlGraphTable"), {
            content: h
        }).addStyleClass("sapUiSmallMarginTop");
        that.pgGraph.addContent(oo);
    }
    ,
    show_query: function (rep) {
        var view = this.view;
        var that = this;
        var mTable = view.qv.getControl();

        UtilGen.clearPage(that.pgGraph);
        this._addHeaderGraphToolbar(rep);
        this._addHeaderGraphToolbar(rep);

        // that.pgGraph.addContent(that.graphToolBar);
        (view.byId("gp") != undefined ? view.byId("gp").destroy() : null);
        this.subqry = new QueryView(view.createId("subqry"));

        that.pgGraph.addContent(this.subqry.mTable);

        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

        //get data according to dimensions and measures.
        var selectedIndices = mTable.getSelectedIndices();
        var selectedEntries = [];
        var tableData = mTable.getModel().getData();
        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTable.getContextByIndex(selectedIndices[i]);
            var data = oData.getProperty(oData.getPath());
            var fnd = true;
            // do not add selectedEntries if subgroup or summary line..
            if (view.qv.mLctb.cols[0].mGrouped && (
                data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4095)) ||
                data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4094))
            ))
                fnd = false;
            if (fnd)
                selectedEntries.push(data);
        }
        var dt = {};
        var gData = [];
        var ps = "";
        if (selectedEntries.length <= 0) {
            sap.m.MessageToast.show("No any record selected !");
            return;
        }
        var ia = Util.nvl(view.iadd, "");

        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = "";
            if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (view.byId("para_para" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else if (view.colData.parameters[i].PARA_DATATYPE === "GROUP")
                vl = Util.nvl(view.byId("para_para" + ia + i).getSelectedButton().getCustomData()[0].getKey());
            else
                vl = Util.nvl(view.byId("para_para" + ia + i).getValue(), "");

            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_para" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_para" + ia + i).getValue();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }


        var rcv_flds = Util.nvl(rep.RCV_FLDS, "").split(",");  // finding out to recieve how many fields in array ...

        for (var i = 0; i < selectedEntries.length; i++)
            for (var k in selectedEntries[i]) {
                if (k == "_rowid") continue;
                if (rcv_flds.indexOf(k) < 0) continue;

                var s = "_flds_" + i + "_" + k + "=" + selectedEntries[i][k];
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "date")
                    s = "_flds_" + i + "_" + k + "=@" + sdf.format(selectedEntries[0][k]);
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "number")
                    s = "_flds_" + i + "_" + k + "=" + df.formatBack(selectedEntries[0][k]);

                ps += (ps.length > 0 ? "&" : "") + s;
            }
        ps += (ps.length > 0 ? "&" : "") + "_total_no=" + selectedEntries.length;

        ps += (ps.length > 0 ? "&" : "") + "_keyfld=" + rep.KEYFLD;
        Util.doAjaxGetSpin("exe?command=get-graph-query&" + (ps), "", false, function (data) {
            that.subqry.setJsonStr(data);
            that.subqry.loadData();
            Util.stopSpin();
        }, undefined, true);
    }
    ,
    show_pre_pdf: function (rep) {
        var view = this.view;
        var that = this;
        // view.fetchFixReports(true, function () {
        //     that.show_pdf(rep);
        // })

        if (rep.FETCH_FIX_REP_PIC == undefined && !Util.nvl(rep.FETCH_FIX_REP_PIC, "").toUpperCase().startsWith("T")) {
            that.show_pdf(rep);
            return;
        }

        var tabs = new sap.m.FlexBox({
            direction: sap.m.FlexDirection.Column,
        });
        var sel = sap.ui.getCore().byId((view.tabs.getSelectedItem()));
        var cnt = 0;
        var repprint = [];
        for (var v = 0; v < view.tabs.getItems().length; v++) {
            // only upload pic of MEASURES field contains and multiple sub reports delimeted with single quot.
            if (Util.nvl(rep.MEASURES, '') !== '' &&
                ((rep.MEASURES.toUpperCase().indexOf("'" + view.tabs.getItems()[v].getName().toUpperCase() + "'") !== -1) ||
                    rep.MEASURES.toUpperCase() == view.tabs.getItems()[v].getName().toUpperCase())) {
                view.tabs.setSelectedItem(view.tabs.getItems()[v]);
                var o = view.tabs.getItems()[v].getContent()[0].$().outerHTML();
                var oo = new sap.ui.core.HTML({
                    content: o
                });
                var flx = new sap.m.FlexBox({
                    items: [oo]
                });
                flx.$().css("overflow", "visible");
                tabs.addItem(flx);
                repprint.push(view.itmsrep[v]);
                cnt++;
            }
        }
        view.tabs.setSelectedItem(sel);
        if (cnt == 0) {
            that.show_pdf(rep);
            return;
        }
        var dlg = new sap.m.Dialog({
            title: "Will Upload following images for PDF reports..",
            content: [tabs],
            buttons: [new sap.m.Button({
                text: "Download PDF",
                press: function (e) {
                    for (var v = 0; v < tabs.getItems().length; v++) {
                        view.uploading = true;
                        view.upload_pic(repprint[v], tabs.getItems()[v]);
                    }
                    var bt = this;
                    bt.setEnabled(false);
                    setTimeout(function () {

                        while (view.uploading) {
                        }

                        dlg.close();
                        that.show_pdf(rep);
                    }, 1000);
                }
            })]
        })
        dlg.open();

    }
    ,
    show_pdf: function (rep) {

        var view = this.view;
        var that = this;
        var mTable = view.qv.getControl();
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var ps = "";
        var ia = Util.nvl(view.iadd, "");
        // for (var v in view.itms) {
        //     view.tabs.setSelectedItem(view.tbs[v]);
        //     view.uploading = false;
        //     view.bts[v].firePress();
        //     while (view.uploading) {
        //     }
        // }

        var selectedIndices = mTable.getSelectedIndices();
        var selectedEntries = [];

        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTable.getContextByIndex(selectedIndices[i]);
            var data = oData.getProperty(oData.getPath());
            var fnd = true;
            // do not add selectedEntries if subgroup or summary line..
            if (view.qv.mLctb.cols[0].mGrouped && (
                data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4095)) ||
                data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4094))
            ))
                fnd = false;
            if (fnd)
                selectedEntries.push(data);
        }

        // if (selectedEntries.length <= 0) {
        //     sap.m.MessageToast.show("No any record selected !");
        //     return;
        // }

        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = "";
            if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (view.byId("para_para" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else if (view.colData.parameters[i].PARA_DATATYPE === "GROUP")
                vl = Util.nvl(view.byId("para_para" + ia + i).getSelectedButton().getCustomData()[0].getKey());
            else
                vl = Util.nvl(view.byId("para_para" + ia + i).getValue(), "");


            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_para" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_para" + ia + i).getValue();
            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }

        var rcv_flds = Util.nvl(rep.RCV_FLDS, "").split(",");  // finding out to recieve how many fields in array ...
        var ps2 = "";
        for (var i = 0; i < selectedEntries.length; i++) {
            ps2 = "";
            for (var k in selectedEntries[i]) {
                if (k == "_rowid") continue;
                if (rcv_flds.indexOf(k) < 0) continue;

                var s = k + "=" + selectedEntries[i][k];
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "date")
                    s = k + "=@" + sdf.format(selectedEntries[0][k]);
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "number")
                    s = k + "=" + df.formatBack(selectedEntries[0][k]);

                ps2 += (ps2.length > 0 ? "&" : "") + s;
            }

            if (rep.BEFORE_SQL_EXE_ONCE != undefined && rep.BEFORE_SQL_EXE_ONCE.length > 0 && i == 0) {
                Util.doAjaxJson("sqlmetadata?" + ps2 + "&" + ps, {
                    sql: rep.BEFORE_SQL_EXE_ONCE,
                    ret: "NONE",
                    data: null
                }, false).done(function (data) {
                });
            }
            if (rep.BEFORE_SQL_EXE != undefined && rep.BEFORE_SQL_EXE.length > 0) {
                Util.doAjaxJson("sqlmetadata?" + ps2 + "&" + ps, {
                    sql: rep.BEFORE_SQL_EXE,
                    ret: "NONE",
                    data: null
                }, false).done(function (data) {
                });
            }
        }

        Util.doXhr("report?reportfile=" + rep.DIMENSIONS + "&" + ps, true, function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], {type: "application/pdf"});
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.target = "_blank";
                link.style.display = "none";
                document.body.appendChild(link);
                link.download = rep.DIMENSIONS + new Date() + ".pdf";
                link.click();
                document.body.removeChild(link);

            }
        });
    }
    ,

    showFilterWindow: function () {
        var view = this.view;
        var that = this;
        var txts = [];
        if (view.filterData == undefined)
            view.filterData = [];

        for (var i = 0; i < view.qv.mLctb.cols.length; i++) {

            (view.byId("txtflt" + i) != undefined ? view.byId("txtflt" + i).destroy() : null);
            var t = new sap.m.Input(view.createId("txtflt" + i), {
                width: "100%",
                placeholder: "Filter for field # " + Util.getLangDescrAR(view.qv.mLctb.cols[i].mTitle, view.qv.mLctb.cols[i].mTitleAr),
                value: Util.nvl(view.filterData[view.qv.mLctb.cols[i].mColName], "")
            });
            txts.push(t);
        }


        var flexOther = new sap.m.FlexBox(view.createId("flxOtherFilter"), {
            width: "100%",
            height: "100%",
            direction: sap.m.FlexDirection.Row,
            justifyContent: sap.m.FlexJustifyContent.Center,
            items: []
        });

        var flexMain = new sap.m.FlexBox({
            width: "100%",
            height: "100%",
            direction: sap.m.FlexDirection.Column,
            justifyContent: sap.m.FlexJustifyContent.Start,
            alignItems: sap.m.FlexAlignItems.Start,
            items: txts
        });

        var dlg = new sap.m.Dialog({
            title: "Filtering data..",
            content: [flexMain],
            buttons: [new sap.m.Button({
                text: "Filter",
                press: function () {
                    var str = "";
                    for (var i = 0; i < view.qv.mLctb.cols.length; i++) {
                        var s = view.byId("txtflt" + i).getValue();
                        var op = "%%";
                        op = (s.startsWith("=") ? "=" :
                            s.startsWith("!=") ? "!=" :
                                s.startsWith("<>") ? "<>" :
                                    s.startsWith(">=") ? ">=" :
                                        s.startsWith("<=") ? "<=" :
                                            s.startsWith(">") ? ">" :
                                                s.startsWith("<") ? "<" : "%%");
                        if (s.startsWith(op)) {
                            s = s.substring(op.length);
                        }
                        view.filterData[view.qv.mLctb.cols[i].mColName] = null;
                        if (s != undefined && s.length > 0) {
                            if (s.indexOf("&&")) {
                                var ss = Util.splitString(s, ["&&"]);
                                for (var x in ss) {
                                    if (x == 0) {
                                        str += (str.length > 0 ? " && " : "") + view.qv.mLctb.cols[i].mColName + op + ss[0];
                                        view.filterData[view.qv.mLctb.cols[i].mColName] = (op == "%%" ? "" : op) + s;
                                    } else
                                        str += (str.length > 0 ? " && " : "") + view.qv.mLctb.cols[i].mColName + ss[x];
                                }
                            }
                            else {
                                str += (str.length > 0 ? " && " : "") + view.qv.mLctb.cols[i].mColName + op + s;
                                view.filterData[view.qv.mLctb.cols[i].mColName] = (op == "%%" ? "" : op) + s;
                            }
                        }
                    }
                    view.qv.mViewSettings["filterStr"] = str;
                    view.qv.loadData();
                    dlg.close();
                }
            }),
                new sap.m.Button({
                    text: "Clear filter",
                    press: function () {
                        view.filterData = [];
                        view.qv.mViewSettings["filterStr"] = null;
                        view.qv.loadData();
                        dlg.close();
                    }

                })
            ]
        });
        dlg.open();

        dlg.attachAfterClose(function () {
            (view.byId("flxOtherFilter") != undefined ? view.byId("flxOtherFilter").destroy() : null);
            for (var i = 0; i < view.qv.mLctb.cols.length; i++) {
                (view.byId("txtflt" + i) != undefined ? view.byId("txtflt" + i).destroy() : null);
            }
        })
    }
    ,
    printGraph: function (rep) {
        var view = this.view;
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var oVizFrame = view.byId("gp");
        if (oVizFrame == undefined) return;
        var tblHtml = (view.byId("htmlGraphTable") != undefined ? view.byId("htmlGraphTable").$().outerHTML() : "");
        var o = oVizFrame.$().outerHTML() + tblHtml;
        var h = "<div class='company'>" + sett["COMPANY_NAME"] + "</div> " +
            (rep == undefined ? "" :
                "<div class='reportTitle'>" + view.reportsData.report_info.report_name +
                " - " + rep.substr(0, rep.indexOf(" - ")) + "</div>");

        var newWin = window.open("");


        newWin.document.write(h + o);

        $("<link>", {rel: "stylesheet", href: "css/print.css"}).appendTo(newWin.document.head);


        setTimeout(function () {
            newWin.print();
        }, 1000);

    }
    ,
    fetchFixReports: function (showOnDialog, callBack) {
        return;
        var that = this;
        var i = 0;
        var tabs = that.tabs;
        if (showOnDialog)
            tabs = new sap.m.FlexBox({
                direction: sap.m.FlexDirection.Column
            });

        tabs.removeAllItems();
        tabs.destroyItems();
        this.itmsrep = [];
        var fxcount = 0;
        //var flx = new sap.m.VBox({});
        if (this.colData.subreps != undefined)
            for (i = 0; i < this.colData.subreps.length; i++) {
                if (this.colData.subreps[i].REP_TYPE.startsWith("FIX_")) {
                    var flx = (showOnDialog ? new sap.m.FlexBox() : new sap.m.TabContainerItem({
                        name: this.colData.subreps[i].REP_TITLE,
                        key: "R" + this.colData.subreps[i].REP_POS,
                    }));
                    if (this.colData.subreps[i].REP_TYPE == "FIX_SQL") {
                        that.show_fix_graph(this.colData.subreps[i], flx);
                    }
                    if (this.colData.subreps[i].REP_TYPE == "FIX_FORM") {
                        that.show_fix_form(this.colData.subreps[i], flx);
                    }
                    tabs.addItem(flx);
                    this.itmsrep.push(this.colData.subreps[i]);
                    fxcount++;
                }
            }
        if (!showOnDialog) {
            tabs.attachItemClose(function () {
                if (tabs.getItems().length == 1)
                    tabs.getLayoutData().setSize("0px");
            });
            tabs.getLayoutData().setSize("0px");
            if (fxcount > 0)
                tabs.getLayoutData().setSize("40%");
        } else {
            var dlg = new sap.m.Dialog({
                content: tabs,
                buttons: [new sap.m.Button({
                    text: "Close",
                    press: function () {
                        dlg.close();
                        callBack();
                    }
                })]
            });
            dlg.open();

        }
    }
    ,
    runParas: function () {
        var that = this;
        var view = this.view;
        if (this.menu_group != undefined) {
            this.view.cb.setSelectedItem(UtilGen.getIndexByKey(this.view.cb, this.menu_group));
            this.onChangeProfile()
        }

        var menucode = "";
        if (this.query_code != undefined) {
            var cod = this.view.cb.getSelectedItem().getKey();
            Util.doAjaxJson("sqlmetadata?", {
                sql: "select menu_code from c6_main_menus where type_of_exec='QUERY' and " +
                " group_code='" + cod + "' and " +
                " exec_line='" + this.query_code + "'"
            }, false).done(function (data) {
                try {

                    if (data.ret == "SUCCESS" && data.data.length > 0) {
                        var dtx = JSON.parse("{" + data.data + "}").data;
                        menucode = dtx[0].MENU_CODE;
                    }
                }
                finally {
                }
            });
            if (menucode != undefined && menucode.length > 0)
                for (var i = 0; i < this.qv.getControl().getItems().length; i++) {
                    var ky = "";
                    var cntrl = this.qv.getControl().getItems()[i];
                    if (cntrl.getCustomData().length > 0) {
                        ky = cntrl.getCustomData()[0].getKey().trim();
                    }
                    if (cntrl.getCustomData().length > 1 && ky == menucode) {
                        var ky2 = JSON.parse("{" + cntrl.getCustomData()[1].getKey().trim() + "}");
                        this.show_report(ky2);
                        if (this.query_code2 != undefined) {
                            view.byId("txtSubGroup").setSelectedItem(UtilGen.getIndexByKey(view.byId("txtSubGroup"), this.query_code2));
                            this.onChangeReport();
                        }

                        break;
                    }
                }
        }
    }
    ,
    _addHeaderGraphToolbar: function (rep) {
        var view = this.view;
        var that = this;
        (view.byId("graphPgToolBar") != undefined ? view.byId("graphPgToolBar").destroy() : null);
        var pgToolBar = new sap.m.Toolbar(view.createId("graphPgToolBar"));

        (view.byId("graphOptionBack") != undefined ? view.byId("graphOptionBack").destroy() : null);
        var bk = new sap.m.Button(view.createId("graphOptionBack"), {
            icon: "sap-icon://nav-back",
            press: function () {
                var splitApp = sap.ui.getCore().byId("reportApp");
                splitApp.toDetail(that.pgResult, "slide");
            }
        });
        var fl = undefined;
        if (rep.REP_TYPE == "TABLE") {
            (view.byId("graphOptionFilter") != undefined ? view.byId("graphOptionFilter").destroy() : null);
            fl = new sap.m.Button(view.createId("graphOptionFilter"), {
                icon: "sap-icon://filter",
                press: function () {
                    that.subqry.showFilterWindow(view);
                }
            });
        }


        (view.byId("graphOptionPrint") != undefined ? view.byId("graphOptionPrint").destroy() : null);
        var pn = new sap.m.Button(view.createId("graphOptionPrint"), {
            icon: "sap-icon://print",
            press: function () {
                if (rep.REP_TYPE == "TABLE") {
                    that.subqry.printHtml(view, "para");
                }
                that.printGraph();
            }
        });

        UtilGen.clearPage(that.pgGraph);
        that.pgGraph.addContent(pgToolBar);
        pgToolBar.addContent(bk);
        (fl != undefined ? pgToolBar.addContent(fl) : undefined);
        pgToolBar.addContent(pn);
    }
});




