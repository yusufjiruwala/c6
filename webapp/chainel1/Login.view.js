sap.ui.jsview('chainel1.Login', {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf chainel1.Login **/
    getControllerName: function () {
        return 'chainel1.Login';
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf chainel1.Login **/
    createContent: function (oController) {

        //console.log("createContent");

         var cb = new sap.m.ComboBox(this.createId("txtFile"),{
            items: {
                path:"/",
                template: new sap.ui.core.ListItem({text:"{file}",key:"{file}"}),
                templateShareable:true
            }
        }).addStyleClass("simpleInput sapUiSmallMarginDown");
        Util.doAjaxGet("exe?command=get-init-files", "", false).done(function (data) {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(JSON.parse(data));
            cb.setModel(oModel);

        });

        if (cb.getItems().length>0)
            cb.setSelectedItem(cb.getItems()[0]);

        this.app = new sap.m.App("mainApp", {});
        this.setDisplayBlock(true);

        var txtUser = new sap.m.Input(this.createId("txtUser"), {
            value: "{login_info>/login_user}",
            placeholder: "Enter user name"
        }).addStyleClass("simpleInput sapUiSmallMarginTop");

        var txtPassword = new sap.m.Input(this.createId("txtPassword"), {
            value: "{login_info>/login_password}",
            placeholder: "Enter password here..",
            type: sap.m.InputType.Password
        }).addStyleClass("simpleInput");

        var cmdLogin = new sap.m.Button(this.createId("cmdLogin"), {
            text: "Login", press: function () {
                oController.loginPress();
            }
        }).addStyleClass("simpleBtn sapUiSmallMarginTop");

        var oPage = new sap.m.Page(this.createId("loginPg"), {
            title: "Login",
            content: [txtUser, txtPassword, cb, cmdLogin]
        }).addStyleClass("");

        this.app.addPage(oPage);
        return this.app;
    }

});
