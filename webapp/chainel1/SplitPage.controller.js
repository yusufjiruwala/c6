sap.ui.controller("chainel1.SplitPage", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf table_v01.Main
     */

    onInit: function () {
    },

    select_profile: function (e) {
        if (this.oFragment === undefined)
            this.oFragment = sap.ui.jsfragment("chainel1.selectProfile", this);
        this.oFragment.open();
    },

    frag_liveChange: function (event) {
        // console.log(event);
        var val = event.getParameter("value");
        var filter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, val);
        var binding = event.getSource().getBinding("items");
        binding.filter(filter);
    },
    frag_confirm: function (event) {
        var val = event.getParameters().selectedItem.getTitle();
        var valx = event.getParameters().selectedItem.getCustomData()[0];
        //console.log(valx);
        //sap.m.MessageToast.show(valx.getKey());
        sap.ui.getCore().byId("SplitPage").setProfile({"code": valx.getKey(), "name": val});

    }

});