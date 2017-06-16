sap.ui.jsview("chainel1.QuickTreeRep", {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf chainel1.QuickTreeRep **/
    getControllerName: function () {
        return "chainel1.QuickTreeRep";
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf chainel1.QuickTreeRep **/
    createContent: function (oController) {
        this.app = sap.ui.getCore().byId("oSplitApp");
        this.oController = oController;
        this.report_id = "";
        this.parentcol = "";
        this.childcol = "";
        this.codecol = "";
        this.titlecol = "";
        this.pathcol = "";
        this.levelcol = "";
        this.advance_para = [];
        this.createViewResult();
        return this.QueryPage;

    },
    createViewResult: function () {
        var that = this;
        if (this.QueryPage != undefined) return;
        this.oBar2 = Util.createBar("{detailP>/pageTitle}");
        this.oBar3 = Util.createBar("{detailP>/pageTitle}");

        var DataTree = sap.ui.require("sap/ui/chainel1/util/generic/DataTree");
        this.qv = new DataTree(this.createId("tree"), "MultiToggle");
        this.qryToolBar = new sap.m.FlexBox({
            content: [],
            direction: sap.m.FlexDirection.Row,
            alignItems: sap.m.FlexAlignItems.Center
        });

        this.QueryPage = new sap.m.Page(this.createId("pgResult"), {
            customHeader: this.oBar2,
            content: [
                this.qryToolBar,
                this.qv.mTree
            ],
            footer: this.createQRToolbar()
        });

        this.GraphPage = new sap.m.Page(this.createId("pgGraph"), {
            customHeader: this.oBar3,
            content: []
        });


        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        oSplitApp.addDetailPage(this.QueryPage);
        oSplitApp.addDetailPage(this.GraphPage);
    },
    showReportPara: function (idno) {

        this.report_id = idno;
        var that = this;
        this.qryToolBar.destroyItems();
        this.qryToolBar.removeAllItems();
        this.qv.mTree.removeAllRows();
        this.qv.mTree.removeAllColumns();
        this.qv.mTree.destroyRows();
        this.qv.mTree.destroyColumns();

        (this.byId("txtSubGroup") != undefined ? this.byId("txtSubGroup").destroy() : null);
        var txtSubGroup = new sap.m.ComboBox(this.createId("txtSubGroup"),
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({
                        text: "{rep_name} - {rep_code}",
                        key: "{rep_code}"
                    }),
                    templateShareable: true
                },
                selectionChange: function (event) {
                    that.onChangeReport();
                }
            });

        this.qryToolBar.addItem(txtSubGroup);

        Util.doAjaxGet("exe?command=get-quickrep-metadata&report-id=" + this.report_id, "", false).done(function (data) {
            var dtx = JSON.parse(data);
            var txtSubGroup = that.byId("txtSubGroup");
            txtSubGroup.setModel(new sap.ui.model.json.JSONModel(dtx.subreport));
            that.reportsData = dtx;
        });

        if (that.byId("txtSubGroup").getItems().length > 0) {
            that.byId("txtSubGroup").setSelectedItem(that.byId("txtSubGroup").getItems()[0]);
            that.onChangeReport();
        }
    },
    onChangeReport: function () {
        var that = this;
        var rp = that.byId("txtSubGroup").getSelectedItem().getKey();
        Util.doAjaxGet("exe?command=get-quickrep-cols&report-id=" + rp, "", false).done(function (data) {
            var dtx = JSON.parse(data);
            that.colData = dtx;
            Util.createParas(that, that.qryToolBar, "");
            (that.byId("refreshResult") != undefined ? that.byId("refreshResult").destroy() : null);
            that.qryToolBar.addItem(new sap.m.Button(that.createId("refreshResult"), {
                text: "Refresh",
                press: function () {
                    that.oController.refresh();
                }
            }));
            that.addMenu();

        });
    },
    createQRToolbar: function () {
        var c = [];
        var that = this;
        c.push(new sap.m.ToolbarSpacer());
        c.push(new sap.m.Button({
            icon: "images/expand.png",
            press: function (e) {
                for (var i = 0; i < that.qv.mTree.getRows().length; i++)
                    that.qv.mTree.expand(i);
            }
        }));
        c.push(new sap.m.Button({
            icon: "images/collapse.png",
            press: function (e) {
                that.qv.mTree.collapseAll();
            }
        }));
        c.push(new sap.m.Button({
                icon: "images/print.png",
                press: function (e) {
                    that.qv.printHtml();
                }
            })
        );

        return new sap.m.Toolbar({content: c});
    },
    addMenu: function () {
        var that = this;
        var menu = new sap.ui.core.HTML();
        menu.setContent("<div class='menuicon'></div>");

        this.qryToolBar.addItem(menu);

        setTimeout(function () {
            // $("#"+menu.getId()).click(function () {
            //     alert("clicked");
            // });
            menu.$().click(function () {

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
                            var oSplitApp = sap.ui.getCore().byId("oSplitApp");
                            if (!oSplitApp.getDetailPages().indexOf(that.GraphPage) > -1) {
                                oSplitApp.addDetailPage(that.GraphPage);
                            }

                            oSplitApp.toDetail(that.GraphPage);
                            that.oController.show_graph(oItem.getCustomData()[1].getValue());
                        }
                    }
                });
                var advanceMenu = new sap.m.MenuItem({
                    text: "Advance Parameters..",
                    customData: [{key: "advance_para"}]
                });
                oMenu.addItem(advanceMenu);


                Util.addMenuSubReps(that, oMenu, false);
                oMenu.openBy(menu);
            })
        }, 1000);

    },
    show_advance_para: function () {
        var itms = [];
        var ia = "advance";
        var that = this;

        var flexMain = new sap.m.FlexBox({
            width: "100%",
            height: "100%",
            direction: sap.m.FlexDirection.Column,
            justifyContent: sap.m.FlexJustifyContent.Start,
            alignItems: sap.m.FlexAlignItems.Start,
            items: []
        });
        Util.createParas(this, flexMain, "", ia, true);
        // coping value from para
        for (var i = 0; i < that.colData.parameters.length; i++) {
            var src = that.byId("para_" + ia + i);
            var vl = Util.nvl(that.byId("para_" + i).getValue(), "");
            src.setValue(vl);
            if (that.colData.parameters[i].PARA_DATATYPE === "DATE") {
                src.setDateValue(that.byId("para_" + i).getDateValue());
            }
            if (that.colData.parameters[i].LISTNAME != undefined && that.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                src.setSelectedKey(that.byId("para_" + i).getSelectedItem().getKey());
        }


        var dlg = new sap.m.Dialog({
            title: "Enter Parameters..",
            content: [flexMain],
            buttons: [new sap.m.Button({
                text: "Execute",

                press: function () {
                    for (var i = 0; i < that.colData.parameters.length; i++) {
                        var src = that.byId("para_" + i);
                        var vl = Util.nvl(that.byId("para_" + ia + i).getValue(), "");
                        src.setValue(vl);
                        if (that.colData.parameters[i].PARA_DATATYPE === "DATE") {
                            src.setDateValue(that.byId("para_" + ia + i).getDateValue());
                        }
                        if (that.colData.parameters[i].LISTNAME != undefined && that.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                            src.setSelectedKey(that.byId("para_" + ia + i).getSelectedItem().getKey());
                    }
                    that.oController.refresh();
                    dlg.close();

                }
            })]
        });
        dlg.open();
    },


});
