sap.ui.jsview("chainel1.QuickReport", {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf chainel1.QuickReport **/
    getControllerName: function () {
        return "chainel1.QuickReport";
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf chainel1.QuickReport **/
    createContent: function (oController) {
        this.app = sap.ui.getCore().byId("oSplitApp");
        this.oController = oController;
        this.report_id = "";
        this.createViewMain();
        this.createViewResult();
        return this.mainPage;
    },
    createViewMain: function () {
        var that = this;
        if (this.oBar == undefined) {
            this.oBar = Util.createBar("{detailP>/pageTitle}");
            this.mainPage = new sap.m.Page(this.createId("pgQuickRepMain"), {
                customHeader: this.oBar,
                footer: new sap.m.Toolbar({
                    content: [
                        new sap.m.ToolbarSpacer(),
                        new sap.m.Button({
                            text: "Preview", press: function () {
                                that.oController.preview();
                            }
                        })
                    ]
                }),
                content: []
            });
        }
    },
    createViewResult: function () {
        if (this.QueryPage != undefined) return;
        var that = this;
        this.oBar2 = Util.createBar("{detailP>/pageTitle}");
        this.oBar3 = Util.createBar("{detailP>/pageTitle}");

        var QueryView = sap.ui.require("sap/ui/chainel1/util/generic/QueryView");
        this.qv = new QueryView(this.createId("tbl"));
        this.qv.attachOnAfterLoad(function (qv) {
            if (qv.mLctb.rows.length == qv.mLctb.masterRows.length)
                qv.mTable.setFooter(qv.mLctb.rows.length + " recs displayed.");
            else
                qv.mTable.setFooter(qv.mLctb.rows.length + " of " + qv.mLctb.masterRows.length + " recs displayed.");
        });
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
        this.mainPage.destroyContent();
        this.mainPage.removeAllContent();

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
                    sap.ui.getCore().byId("pgQuickRep").onChangeReport();
                }
            }).addStyleClass("simpleInput");


        (this.byId("txtGroupHeader") != undefined ? this.byId("txtGroupHeader").destroy() : null);
        var txtGroupHeader = new sap.m.ComboBox(this.createId("txtGroupHeader"),
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({
                        text: "{group_name}",
                        key: "{group_name}"
                    }),
                    templateShareable: true
                }
            }).addStyleClass("simpleInput");

        (this.byId("lblgroupheader") != undefined ? this.byId("lblgroupheader").destroy() : null);
        var lblG = new sap.m.Label(this.createId("lblgroupheader"), {
            text: "Group Header",
            labelFor: txtGroupHeader
        }).addStyleClass("simpleInput");


        (this.byId("txtGroupDetail") != undefined ? this.byId("txtGroupDetail").destroy() : null);
        var txtGroupDetail = new sap.m.ComboBox(this.createId("txtGroupDetail"),
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({
                        text: "{group_name}",
                        key: "{group_name}"
                    }),
                    templateShareable: true
                }
            }).addStyleClass("simpleInput");

        (this.byId("lblgroupdetail") != undefined ? this.byId("lblgroupdetail").destroy() : null);
        var lblD = new sap.m.Label(this.createId("lblgroupdetail"), {
            text: "Group Details",
            labelFor: txtGroupDetail
        }).addStyleClass("simpleInput");

        this.mainPage.addContent(txtSubGroup);
        this.mainPage.addContent(lblG);
        this.mainPage.addContent(txtGroupHeader);
        this.mainPage.addContent(lblD);
        this.mainPage.addContent(txtGroupDetail);

        Util.doAjaxGet("exe?command=get-quickrep-metadata&report-id=" + this.report_id, "", false).done(function (data) {
            //console.log(data);
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
            var txtGroupDetail = that.byId("txtGroupDetail");
            var txtGroupHeader = that.byId("txtGroupHeader");

            txtGroupDetail.setModel(new sap.ui.model.json.JSONModel(dtx.groups));
            txtGroupHeader.setModel(new sap.ui.model.json.JSONModel(dtx.groups));

            that.colData = dtx;
            Util.createParas(that, that.mainPage, "simpleInput");
        });

    },

    createQRToolbar: function () {
        var c = [];
        var that = this;
        c.push(new sap.m.ToolbarSpacer());
        c.push(new sap.m.Button({
            text: "Filter",
            press: function () {
                that.oController.showFilterWindow();
            }
        }));
        c.push(new sap.m.Button({
                text: "Print",
                press: function (e) {
                    that.qv.printHtml();
                }
            })
        )
        ;


        return new sap.m.Toolbar({content: c});
    }

})
;
