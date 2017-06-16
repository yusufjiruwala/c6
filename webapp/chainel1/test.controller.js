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
        this.gauges = [];
        this.createGauge("Plant1Availability", "Plant1 - Availability");
    }
    ,

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf chainel1.test
     **/
    onExit: function () {

    },
    createGauge: function (name, label, min, max) {

        var config =
            {
                size: 125,
                label: label,
                min: undefined != min ? min : 0,
                max: undefined != max ? max : 100,
                value:50,
                minorTicks: 5
            }

        var range = config.max - config.min;
        config.greenZones = [{from: config.min, to: config.min + range * 0.75}];
        config.yellowZones = [{from: config.min + range * 0.75, to: config.min + range * 0.9}];
        config.redZones = [{from: config.min + range * 0.9, to: config.max}];

        var Gauge = sap.ui.require("sap/ui/chainel1/util/generic/Gauge");
        this.gauges[name] = new Gauge(name + "GaugeContainer", config);
        this.gauges[name].render();
        this.gauges[name].redraw(90);
    }


});
