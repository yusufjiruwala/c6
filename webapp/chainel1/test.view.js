sap.ui.jsview('chainel1.test', {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf chainel1.test **/
    getControllerName: function () {
        return 'chainel1.test';
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf chainel1.test **/
    createContent: function (oController) {
//        var AppTestData = sap.ui.require("sap/ui/chainel1/util/generic/AppTestData");

        //      var dta = AppTestData.getDummyItemsData();

        console.log("onView");

        this.app = new sap.m.App("mainApp", {initialPage: "loginPg"});


        this.oGCell1 = new sap.m.FlexBox({
            id : 'Plant1AvailabilityGaugeContainer',
            hAlign:"Center"

        });


        var oPage = new sap.m.Page("loginPg", {
            title: "testing",
            content: [
                this.oGCell1
            ]

        });

        this.app.addPage(oPage);

        return this.app;

    }

});
