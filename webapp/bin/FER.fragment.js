sap.ui.jsfragment("bin.FER", {

    createContent: function (oController) {
        var view = oController.getView();
        this.view = view;
        this.qryStr = Util.nvl(oController.reportCode, "");
        this.oController = oController;
        Util.destroyID("ferApp", view);
        this.hideMasterApp();
        this.app = new sap.m.SplitApp(view.createId("ferApp")).addStyleClass("");

        this.pgInit = new sap.m.Page({
            height: "100%",
            width: "100%",
            showHeader: false,
            showSubHeader: false,
            content: []
        }).addStyleClass("");

        this.pgMaster = new sap.m.Page({
            height: "100%",
            width: "100%",
            showHeader: false,
            showSubHeader: false,
            content: []
        }).addStyleClass("");

        this.app.addDetailPage(this.pgInit);
        this.app.addMasterPage(this.pgMaster);
        this.createView();

        return this.app;
    },

    createView: function () {
        UtilGen.clearPage(this.pgInit);
        this.createToolbar();
        this.pgInit.addContent(this.tb);
        this.qv = new QueryView("tvfer");
        this.qv.switchType("tree", this.pgMaster);


    },
    hideMasterApp: function () {
        var splitApp = sap.ui.getCore().byId("reportApp");
        if (splitApp != undefined) {
            splitApp.hideMaster();
            // if (!sap.ui.Device.system.phone)
            splitApp.setMode(sap.m.SplitAppMode.HideMode);
        }
    },
    createToolbar: function () {
        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                var splitApp = sap.ui.getCore().byId("reportApp");
                if (splitApp != undefined) {
                    splitApp.showMaster();
                    splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
                }
            }
        });

        this.tb = new sap.m.Toolbar({
            content: [
                this.bk
            ]
        });
    }
});



