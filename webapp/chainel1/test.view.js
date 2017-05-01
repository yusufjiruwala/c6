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

        var LocalTableData = sap.ui.require("sap/ui/chainel1/util/generic/LocalTableData");
        var lctb = new LocalTableData();


        //Util.doAjaxGet("sqltojson?tablename=items&ordby=descr2", "", false).done(function (data) {
        Util.doAjaxGet(`sqltojson?tablename=items&ordby1-descr2=descr2&col-1=reference&col-2=descr
            &col-3=parentitem&col-4=descr2&and-equal-childcounts=0`, "", false).done(function (data) {
            console.log("data initialize");
            //console.log(data);
            var oModel=new sap.ui.model.json.JSONModel();
            oModel.setData(data);
            sap.ui.getCore().setModel(oModel,"items_data");
            //console.log(data);
            lctb.parse(data);
        });



        console.log("onView");

        this.app = new sap.m.App("mainApp", {initialPage: "loginPg"});

        var DataTree = sap.ui.require("sap/ui/chainel1/util/generic/DataTree");

        this.dt = DataTree.create(this.createId("tree"), lctb, "REFERENCE", "DESCR", "PARENTITEM");
        //this.dt = DataTree.create(this.createId("tree"), lctb, "CODE", "TITLE", "PARENTCODE");

        this.dt.loadData();

        oController.dt = this.dt;
        this.setDisplayBlock(true);
        var oPage = new sap.m.Page("loginPg", {
            title: "Login",
            content: [new sap.m.Button({
                text: "Hit me.!",
                press: function () {
                    oController.hitme();
                }
            }),
                this.dt.mTree]
        });
        this.app.addPage(oPage);
        //this.app.setHeight("100%");


        return this.app;

    }

});
