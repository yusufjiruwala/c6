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
        sap.ui.require(["sap/ui/chainel1/util/generic/DataCell",
                "sap/ui/chainel1/util/generic/Column",
                "sap/ui/chainel1/util/generic/Row",
                "sap/ui/chainel1/util/generic/LocalTableData",
                "sap/ui/chainel1/util/generic/Parameter"],
            function (DataCell, Column, Row, LocalTableData, Parameter) {
                var col = new Column();
                col.mColpos = 1;
                console.log(new DataCell("val", "display"));
                console.log(col);

                var r = new Row(10);
                console.log(r);

                var lctb = new LocalTableData();

                console.log(lctb);
                var p = Parameter.create("size", "100");

                console.log(p);

            });
    }


});
