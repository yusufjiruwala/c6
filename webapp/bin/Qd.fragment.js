sap.ui.jsfragment("bin.Qd", {

    createContent: function (oController) {
        var that = this;
        var view = oController.getView();
        this.view = view;
        this.qryStr = Util.nvl(oController.reportCode, "");
        this.oController = oController;
        Util.destroyID("queryDesignApp", view);
        var app = new sap.m.App(view.createId("queryDesignApp")).addStyleClass("");

        this.pgInit = new sap.m.Page({
            height: "100%",
            width: "100%",
            showHeader: false,
            showSubHeader: false,
            content: []
        }).addStyleClass("");

        this.pgBasicInfo = new sap.m.Page({
            height: "100%",
            width: "100%",
            showHeader: false,
            showSubHeader: false,
            content: []
        }).addStyleClass("");
        app.addPage(this.pgInit);
        this.createView();
        return app;
    },

    createView: function () {
        var that = this;
        var view = this.view;
        UtilGen.clearPage(this.pgInit);
        this.radSel = new sap.m.RadioButtonGroup(
            {
                select: function () {
                    that.showReport();
                },
                buttons:
                    [
                        new sap.m.RadioButton({
                            text: "New Query",
                        }),
                        new sap.m.RadioButton({
                            text: "Edit Existed..",
                        }),
                    ]
            }
        );
        var vb1 = new sap.m.VBox({
            height: "100px",
            items: [
                this.radSel
            ]
        }).addStyleClass("sapUiMediumMargin");

        this.paraRepGroup = new sap.m.SearchField({
            text: "Select Report",
            search: function (e) {
                if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                    UtilGen.setControlValue(that.paraRepGroup, "", "", true);
                    return;
                }

                var sq = "select code,titlearb title from c6_qry1 where code in (select distinct PARENTREP from c6_qry1) order by code ";
                Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                    UtilGen.setControlValue(that.paraRepGroup, val, valx, true);

                });
            },
        });
        this.paraRepCode = new sap.m.ComboBox({
            text: "Select Report",
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{TITLE}-{CODE}", key: "{CODE}"}),
                templateShareable: true
            },
        });


        this.reportPnl = new sap.m.VBox({
            width: "300px",
            height: "300px",
            items: []
        }).addStyleClass("sapUiMediumMargin simpleForm");

        this.showReport();

        this.createCmdLine();

        var vb = new sap.m.VBox({
            height: "500px",
            items: [vb1, this.reportPnl, this.cmdLine]
        }).addStyleClass("sapUiMediumMargin");
        this.pgInit.addContent(vb);

        view.byId("cmdBack").setEnabled(false);
        view.byId("cmdFinish").setEnabled(false);

    },
    showReport: function () {
        var that = this;
        this.reportPnl.removeAllItems();
        if (this.radSel.getSelectedIndex() == 0) {
            this.reportPnl.addItem(new sap.m.Text({text: "Select Group"}));
            this.reportPnl.addItem(this.paraRepGroup);
        }
        if (this.radSel.getSelectedIndex() == 1) {
            this.reportPnl.addItem(new sap.m.Text({text: "Select Group"}));
            this.reportPnl.addItem(this.paraRepGroup);
            this.reportPnl.addItem(new sap.m.Text({text: "Select Report"}));
            this.reportPnl.addItem(this.paraRepCode);
        }
    },
    createCmdLine: function () {
        Util.destroyID("cmdBack", this.view);
        Util.destroyID("cmdNext", this.view);
        Util.destroyID("cmdFinish", this.view);
        this.cmdLine = new sap.m.Toolbar({
            content: [
                new sap.m.ToolbarSpacer(),
                new sap.m.Button(this.view.createId("cmdBack"), {text: "Back"}),
                new sap.m.Button(this.view.createId("cmdNext"), {text: "Next"}),
                new sap.m.Button(this.view.createId("cmdFinish"), {text: "Finish"}),
            ]
        });
    }

});



