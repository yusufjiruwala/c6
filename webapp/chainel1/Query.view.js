sap.ui.jsview("chainel1.Query", {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf chainel1.Query **/
    getControllerName: function () {
        return "chainel1.Query";
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf chainel1.Query **/
    createContent: function (oController) {
        this.app = sap.ui.getCore().byId("oSplitApp");
        this.oController = oController;
        this.report_id = "";
        this.createViewResult();
        return this.QueryPage;

    },
    createViewResult: function () {
        var that = this;
        if (this.QueryPage != undefined) return;
        this.oBar2 = Util.createBar("{detailP>/pageTitle}");
        this.oBar3 = Util.createBar("{detailP>/pageTitle}");

        var QueryView = sap.ui.require("sap/ui/chainel1/util/generic/QueryView");
        this.qv = new QueryView(this.createId("tbl"));
        this.qryToolBar = new sap.m.Toolbar({content: []});

        this.QueryPage = new sap.m.Page(this.createId("pgResult"), {
            customHeader: this.oBar2,
            content: [
                this.qryToolBar,
                this.qv.mTable
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

        this.qryToolBar.destroyContent();
        this.qryToolBar.removeAllContent();
        this.qv.mTable.removeAllRows();
        this.qv.mTable.removeAllColumns();
        this.qv.mTable.destroyRows();
        this.qv.mTable.destroyColumns();

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

        this.qryToolBar.addContent(txtSubGroup);

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
            Util.createParas(that, that.qryToolBar, "result");
            (that.byId("refreshResult") != undefined ? that.byId("refreshResult").destroy() : null);
            that.qryToolBar.addContent(new sap.m.Button(that.createId("refreshResult"), {
                text: "Refresh",
                press: function () {
                    that.oController.refresh();
                }
            }));
        });
    },
    createQRToolbar: function () {
        var c = [];
        var that = this;
        c.push(new sap.m.ToolbarSpacer());
        c.push(new sap.m.Button({
                text: "Print",
                press: function (e) {
                    that.qv.printHtml();
                }
            })
        );

        return new sap.m.Toolbar({content: c});
    }

})
;
