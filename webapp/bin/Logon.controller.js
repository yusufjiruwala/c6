sap.ui.controller('bin.Logon', {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf bin.Logon **/
    onInit: function () {
        Util.setLanguageModel(this.getView());
    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf bin.Logon
     **/
    onBeforeRendering: function () {

    },
    loginPress: function () {
//        this.setDisplayBlock(true);

        var u = this.getView().byId("txtUser");
        var p = this.getView().byId("txtPassword");
        var f = this.getView().byId("txtFile");
        var a = this.getView().byId("chkAuto");
        var l = this.getView().sLangu;

        var pth = "login?user=" + u.getValue() + "&password=" + p.getValue() + "&file=" + f.getSelectedKey()+"&language="+l;

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
        pth = "exe?command=get-profile-list";
        Util.doAjaxGet(pth, "", false).done(function (data) {
            if (data != undefined) {
                var dt = JSON.parse(data);
                var oModel = new sap.ui.model.json.JSONModel(dt);
                sap.ui.getCore().setModel(oModel, "profiles");
            }
        });

        //jQuery.sap.require("sap.viz.library");

        // this.app = sap.ui.getCore().byId("mainApp");
        // var page = sap.ui.jsview("SplitPage", "chainel1.SplitPage");
        // this.app.addPage(page);
        // this.app.to(page);while

        var s1 = window.location.search.substring(1).split("&");
        var s = "";
        for (var i in s1) {
            var ss = s1[i].split("=");
            if (ss[0] != "file" && ss[0] != "user" && ss[0] != "password" && ss[0] != "clearCookies" )
                s = s + (s.length > 0 ? "&" : "") + (s1[i]);
        }
        if (a.getSelected()) {
            Util.cookieSet("user",u.getValue(),7);
            Util.cookieSet("password",p.getValue(),7);
            Util.cookieSet("file",f.getSelectedKey(),7);
            Util.cookieSet("autoLogon",a.getSelected(),7);
        } else
            Util.cookiesClear();


        document.location.href = "/bi.html" + (s.length > 0 ? "?" : "") + s;

    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf bin.Logon **/
    onAfterRendering: function () {

    },

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf bin.Logon
     **/
    onExit: function () {

    }

});
