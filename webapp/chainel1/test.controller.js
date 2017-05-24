sap.ui.controller('chainel1.test', {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf chainel1.test **/
    onInit: function () {
    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf chainel1.test
     **/
    onBeforeRendering: function () {

    }
    ,

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf chainel1.test **/
    onAfterRendering: function () {
        this.getView().setHeight("100%");
        var he="600px";
        // if (this.getView().$().height()!="0" && this.getView().$().height()!=undefined)
        //     he=this.getView().$().height()+"px";

            this.getView().table.setHeight(he);

    }
    ,

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf chainel1.test
     **/
    onExit: function () {

    }
    ,
    hitme: function () {
        Util.doAjaxJson("test", {sql: "select reference,descr2 from items", ret: "none"}, false).done(function (data) {
            console.log(data.ret);
            var dt=JSON.parse("{"+data.ret+"}");
            console.log(dt);
        }).fail(function (data) {
            alert('failed');
            console.log(data);

        });
    },

    getModel: function(){

        var oDataUrl = "/sap/opu/odata/SAP/Your oData Service/";

        var oModel = new sap.ui.model.odata.v2.ODataModel(oDataUrl, true);

        oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.Request);

        var oView = this.getView();

        oView.setModel(oModel);

    },


});
