sap.ui.controller('chainel1.Login', {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf chainel1.Login **/
    onInit: function () {
        var d = {
            "login_user": "A",
            "login_password": "A",
            "login_file": "LG3ISH.ini"
        };
        var mdl = new sap.ui.model.json.JSONModel(d);
        this.getView().setModel(mdl, "login_info");
        sap.ui.getCore().setModel(mdl, "login_info");
    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf chainel1.Login
     **/
    onBeforeRendering: function () {

    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf chainel1.Login **/
    onAfterRendering: function () {

    },

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf chainel1.Login
     **/
    onExit: function () {

    },
    loginPress: function () {
//        this.setDisplayBlock(true);

        var u = this.getView().byId("txtUser");
        var p = this.getView().byId("txtPassword");
        var f = this.getView().byId("txtFile");

        var pth = "login?user=" + u.getValue() + "&password=" + p.getValue() + "&file=" + f.getSelectedKey();

        var dt = null;
        Util.doAjaxGet(pth, "", false).done(function (data) {
            dt = JSON.parse(data);
            var oModel = new sap.ui.model.json.JSONModel(dt);
            sap.ui.getCore().setModel(oModel, "settings");

        });
        if (dt.errorMsg != null && dt.errorMsg.length > 0) {
            sap.m.MessageToast.show(dt.errorMsg);
            return;
        }
        pth = "exe?command=get-profile-list"
        Util.doAjaxGet(pth, "", false).done(function (data) {
            if (data != undefined) {
                var dt = JSON.parse(data);
                var oModel = new sap.ui.model.json.JSONModel(dt);
                sap.ui.getCore().setModel(oModel, "profiles");
            }

        });
        this.app = sap.ui.getCore().byId("mainApp");
        var page = sap.ui.jsview("SplitPage", "chainel1.SplitPage");
        this.app.addPage(page);
        this.app.to(page);
    }


});