jQuery.sap.declare("sap.ui.ce.Component");
sap.ui.core.UIComponent.extend('sap.ui.ce.Component', {
    createContent: function () {
        // create root view

        // sap.ui.getCore().loadLibrary("openui5.simplecharts", "./bower_components/openui5.simplecharts/resources/openui5/simplecharts");
        // jQuery.sap.registerModulePath('bower_component', './bower_components');
        //
        // var app = sap.m.App("app", {
        //     type: "JS",
        // });
        // app.addPage(sap.ui.jsview("logonPage", "bin.Logon"));
        var oView = sap.ui.view({
            id: "app",
            //viewName : "chainel1.Login",
            viewName: "bin.Logon",
            type: "JS",
        });
        return oView;
        // return sap.ui.jsview("logonPage", "bin.Logon");
    }
});