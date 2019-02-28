sap.ui.controller('bin.Dashboard', {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf bin.Dashboard **/
    onInit: function () {

    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf bin.Dashboard
     **/
    onBeforeRendering: function () {

    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf bin.Dashboard **/
    onAfterRendering: function () {

    },

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf bin.Dashboard
     **/
    onExit: function () {

    },
    frag_liveChange: function (event) {
        // console.log(event);
        var val = event.getParameter("value");
        var filter = new sap.ui.model.Filter("DESCR", sap.ui.model.FilterOperator.Contains, val);
        var binding = event.getSource().getBinding("items");
        binding.filter(filter);
    },
    frag_confirm: function (event) {
        var view = this.getView();
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);

        var val = event.getParameters().selectedItem.getTitle();
        var valx = event.getParameters().selectedItem.getCustomData()[0].getKey();
        var valg = event.getParameters().selectedItem.getCustomData()[1].getKey();
        var js = event.getParameters().selectedItem.getCustomData()[2].getKey();

        view.screen = valx;
        view.screen_name = val;

        if (valg == "Dashboard")
            view.buildDashboardModel();
        else {
            var fr = sap.ui.jsfragment("bin." + valg, this);
            UtilGen.clearPage(view.pg);
            view.pg.addContent(fr);
            view.lblTitle.setText(val);
        }
        eval(js);
        //console.log(valx);
        //sap.m.MessageToast.show(valx.getKey());
        //this.getView().setProfile({"CODE": valx.getKey(), "name": val});
        //sap.ui.getCore().byId("pgDashboardView").refreshData(true);

    }
});
