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

        this.filterBox = new sap.m.FlexBox(view.createId("filterBox"),
            {
                width: "100%",
                items: [this.bk],
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
});



