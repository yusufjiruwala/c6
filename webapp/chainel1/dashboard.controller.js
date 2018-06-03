sap.ui.controller("chainel1.dashboard", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf chainel1.dashboard **/
    onInit: function () {
        var view = this.getView();
        view.addEventDelegate({
            onAfterShow: jQuery.proxy(function (evt) {
                view.refreshData(false);
            }, this)
        });
    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf chainel1.dashboard
     **/
    onBeforeRendering: function () {

    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf chainel1.dashboard **/
    onAfterRendering: function () {

    },

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf chainel1.dashboard
     **/
    onExit: function () {

    },
    showGraphDetail: function (viz, title) {
        var ht = new sap.ui.core.HTML({content: viz.$().outerHTML()});
        var dlg = new sap.m.Dialog({
            title: title,
            contentHeight: "300px",
            contentWidth: "500px",
            content: ht,
            buttons: [new sap.m.Button({
                text: "Close", press: function () {
                    dlg.close();
                }
            })]
        });
        dlg.open();
    },
    showGaugeDetail: function (viz, gg) {
        var view = this.getView();
        var txts = [];
        var ht = new sap.ui.core.HTML({content: viz.$().outerHTML()});
        txts.push(ht);
        var lbl = new sap.m.Label({
            text: "Target value:"
        });

        txts.push(lbl);
        var t = new sap.m.Input({
            width: "100%",
            placeholder: " Max Target..",
            value: gg.MAX_VAL
        });
        txts.push(t);

        var flexMain = new sap.m.FlexBox({
            width: "100%",
            height: "100%",
            direction: sap.m.FlexDirection.Column,
            justifyContent: sap.m.FlexJustifyContent.Start,
            alignItems: sap.m.FlexAlignItems.Start,
            items: txts
        });

        var dlg = new sap.m.Dialog({
            title: gg.TITLE1,
            contentHeight: "300px",
            contentWidth: "300px",
            //content: flexMain,
            buttons: [new sap.m.Button({
                text: "Save",
                icon: "sap-icon://accept",
                press: function () {
                    var sqx = {
                        sql: "begin update c6_db_gauges set max_val=" + t.getValue() + " where keyfld=" + gg.KEYFLD + "; end;",
                        status: "NONE",
                        data: null
                    };
                    Util.doAjaxJson("sqlexe", sqx, false).done(function (data) {
                        if (data.ret != "SUCCESS") {
                            sap.m.MessageToast.show(data.ret);
                            return;
                        }
                        sap.m.MessageToast.show("Saved !");
                        view.refreshData(true);
                        dlg.close();
                    });

                }
            }),
                new sap.m.Button({
                    text: "Cancel",
                    icon: "sap-icon://decline",
                    press: function () {
                        dlg.close();
                    }
                })
            ]
        });
        dlg.open();
        setTimeout(function () {
            dlg.addContent(flexMain);
        });
    }

});
