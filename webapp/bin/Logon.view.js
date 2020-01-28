sap.ui.jsview('bin.Logon', {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf bin.Logon **/
    getControllerName: function () {
        return 'bin.Logon';
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf bin.Logon **/
    createContent: function (oController) {
        setTimeout(function () {
            //alert('a');
            // // jQuery.sap.require("sap.viz.library");
            // // jQuery.sap.require("sap.ui.layout.library");
            // // jQuery.sap.require("sap.ui.table.library");
            // // jQuery.sap.require("sap.ui.commons.library");
            jQuery.sap.require("sap.m.library");
            // console.log('modules loaded.');

        }, 100);

        Util.ajaxPre = "";

        var cb = new sap.m.ComboBox(this.createId("txtFile"), {
            items: {
                width: "9em",
                path: "/",
                template: new sap.ui.core.ListItem({text: "{file}", key: "{file}"}),
                templateShareable: true
            }
        }).addStyleClass("sapUiTinyMargin blackwhiteText");

        Util.doAjaxGet("exe?command=get-init-files", "", false).done(function (data) {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(JSON.parse(data));
            cb.setModel(oModel);
            if (cb.getItems().length > 0)
                cb.setSelectedItem(cb.getItems()[0]);
        });


        var pg = new sap.m.Page(this.createId("logonPage"),
            {
                showHeader: false,
                content: new sap.m.FlexBox({
                    direction: sap.m.FlexDirection.Column,
                    items: [
                        new sap.m.FlexBox(
                            {
                                direction: sap.m.FlexDirection.Row,
                                items: [
                                    new sap.m.Text({
                                            width: "7em",
                                            text: "{i18n>login_name}"
                                        }
                                    ).addStyleClass("blackwhiteText sapUiSmallMargin"),
                                    new sap.m.Input(this.createId("txtUser"), {
                                            width: "9em",
                                            text: ""
                                        }
                                    ).addStyleClass("sapUiTinyMargin blackwhiteText")

                                ]
                            }),
                        new sap.m.FlexBox(
                            {
                                direction: sap.m.FlexDirection.Row,
                                items: [
                                    new sap.m.Text({
                                        width: "7em",
                                        text: "{i18n>login_pwd} :"

                                    }).addStyleClass("blackwhiteText sapUiSmallMargin"),
                                    new sap.m.Input(this.createId("txtPassword"), {
                                        width: "9em",
                                        text: "",
                                        type: sap.m.InputType.Password
                                    }).addStyleClass("sapUiTinyMargin blackwhiteText")

                                ]
                            }),
                        new sap.m.FlexBox(
                            {
                                direction: sap.m.FlexDirection.Row,
                                items: [
                                    new sap.m.Text({
                                        width: "7em",
                                        text: "{i18n>login_database}"
                                    }).addStyleClass("blackwhiteText sapUiSmallMargin"),
                                    cb

                                ]
                            }),
                        new sap.m.FlexBox(
                            {
                                direction: sap.m.FlexDirection.Row,
                                items: [
                                    new sap.m.Text({
                                        width: "7em",
                                        text: "{i18n>login_auto}"
                                    }).addStyleClass("blackwhiteText sapUiSmallMargin"),
                                    new sap.m.CheckBox(this.createId("chkAuto"), {
                                        width: "7em",
                                        selected: false
                                    }).addStyleClass("blackwhiteText sapUiSmallMargin")

                                ]
                            }),
                        new sap.m.FlexBox({
                            height: "80px",
                            justifyContent: sap.m.FlexJustifyContent.End,
                            alignItems: sap.m.FlexAlignItems.End,
                            items: [
                                new sap.m.Button({
                                    text: "Logon",
                                    press: function () {
                                        oController.loginPress();
                                    }
                                })
                            ]
                        })


                    ]
                }).addStyleClass("alignMiddle25Top logonPanel  ")
            }).addStyleClass("highContrastPage");
        var that = this;
        setTimeout(function () {
            var idUser = that.byId("txtUser").getId() + "-inner";
            var idPassword = that.byId("txtPassword").getId() + "-inner";
            var idList = that.byId("txtFile").getId() + "-inner";
            $("#" + idUser).addClass("blackwhiteText");
            $("#" + idPassword).addClass("blackwhiteText");
            $("#" + idList).addClass("blackwhiteText");


            var url = new URL(window.location.href);
            var user = url.searchParams.get("user");
            var pwd = url.searchParams.get("password");
            var lst = url.searchParams.get("file");
            var cok = url.searchParams.get("clearCookies");

            if (cok != undefined)
                Util.cookiesClear();
            if (user != undefined)
                that.byId("txtUser").setValue(user);
            if (pwd != undefined)
                that.byId("txtPassword").setValue(pwd);
            if (lst != undefined) {
                var cb = that.byId("txtFile");
                for (var i in  cb.getItems()) {
                    if (cb.getItems()[i].getText() == lst)
                        cb.setSelectedIndex(i);
                }
            }
            if (user != undefined && pwd != undefined)
                oController.loginPress();
            else {
                var ckA = Util.cookieGet("autoLogon");
                if (ckA != undefined || ckA.trim() != "") {
                    var user = Util.nvl(Util.cookieGet("user"));
                    var pwd = Util.nvl(Util.cookieGet("password"))
                    var lst = Util.nvl(Util.cookieGet("file"));

                    that.byId('chkAuto').setSelected(true);
                    that.byId("txtUser").setValue(user);
                    that.byId("txtPassword").setValue(pwd);

                    if (lst != undefined) {
                        var cb = that.byId("txtFile");
                        for (var i in  cb.getItems()) {
                            if (cb.getItems()[i].getText() == lst)
                                cb.setSelectedIndex(i);
                        }
                    }
                    if (user != undefined && pwd != undefined)
                        oController.loginPress();
                }
            }
        }, 100);

        var app = new sap.m.App({pages: [pg]});
        return app;
    }

});
