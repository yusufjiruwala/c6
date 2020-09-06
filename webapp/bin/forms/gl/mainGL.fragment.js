sap.ui.jsfragment("bin.forms.gl.mainGL", {

    createContent: function (oController) {
        this.view = oController.getView();
        this.oController = oController;
        this.lastIndexSelected = 0;
        this.lastFirstRow = 0;
        this.mastFrag;
        var that = this;
        this.app1 = new sap.m.App({height: "100%"});
        this.app = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        Util.destroyID("pgFaMain");
        this.mainPage = new sap.m.Page("pgFaMain", {
            showHeader: false,
            enableScrolling: false,
            height: "100%",
            content: []
        });
        Util.destroyID(["pgMaster", "pgTrans", "pgAcBr"], this.view);
        this.pgMaster = new sap.m.Page(this.view.createId("pgMaster"), {
            showHeader: false,
            content: [new sap.m.Button(that.view.createId("masterButt"), {text: "Master"})]
        });
        this.pgTrans = new sap.m.Page(this.view.createId("pgTrans"), {
            showHeader: false,
            content: [new sap.m.Button(that.view.createId("transButt"), {text: "Trans"})]
        });
        this.pgAcBr = new sap.m.Page(this.view.createId("pgAcBr"), {
            showHeader: false,
            content: []
        });

        this.createView();
        this.app1.addPage(this.mainPage);
        this.mainPage.addContent(this.app);
        this.app.addDetailPage(this.pgMaster);
        this.app.addDetailPage(this.pgTrans);
        this.app.addDetailPage(this.pgAcBr);
        this.app.toDetail(this.pgMaster);
        this.load_data();
        return this.app1;
    },

    createView: function () {

        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        UtilGen.clearPage(this.mainPage);
        // var vbox = new sap.m.VBox({height: "100%"});
        // var spn = "XL2 L2 M2 S6";

        Util.destroyID(["cmdMaster", "cmdTrans", "lblMsg"], this.view);

        var cmdNew = new sap.m.SegmentedButton({
            items: [
                new sap.m.SegmentedButtonItem(that.view.createId("cmdMaster"), {
                    icon: "sap-icon://credit-card",
                    text: "Master",
                    press: function () {
                        that.show_master();

                    }
                }),
                new sap.m.SegmentedButtonItem(that.view.createId("cmdTrans"), {
                    icon: "sap-icon://customer-order-entry",
                    text: "Transaction",
                    press: function () {

                        that.app.toDetail(that.pgTrans, "slide");
                    }
                })
            ]

        }).addStyleClass("");

        Util.destroyID("lblMsg", this.view);

        var tb = new sap.m.Toolbar({
            content: [
                cmdNew,
                new sap.m.ToolbarSpacer(),
                new sap.m.Title(that.view.createId("lblMsg"),
                    {text: ""}).addStyleClass("blinking")]
        }).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginEnd");

        // vbox.addItem((tb));
        // vbox.setHeight("100%");
        // this.load_data();
        this.mainPage.addContent(tb);

    },

    load_data: function (period) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.show_master();
    },

    openForm: function (frag, frm, ocAdd) {
        var that = this;
        // var indicOF = that.qv.getControl().getBinding("rows").aIndices;
        // // var indic = that.qv.getControl().getSelectedIndices();
        // var arPo = [];
        //
        // for (var i = 0; i < indic.length; i++)
        //     arPo.push(Util.nvl(Util.getCellColValue(that.qv.getControl(), indicOF[indic[i]], "CODE"), ""));
        var oC = {
            getView:
                function () {
                    return that.view;
                }
        };
        if (ocAdd != undefined)
            for (var xx in ocAdd)
                oC[xx] = ocAdd[xx];

        var sp = sap.ui.jsfragment(frag, oC);
        sp.app = this.app;


        return sp;
    },
    show_master: function () {
        var that = this;
        //that.app.toDetail(that.pgMaster, "slide");
        if (this.mastFrag == undefined) {
            that.mastFrag = that.openForm("bin.forms.gl.masterGL", that.pgMaster);
            UtilGen.clearPage(that.pgMaster);
            that.pgMaster.addContent(that.mastFrag);
        }
        this.app.to(this.pgMaster, "slide");
    }
})
;



