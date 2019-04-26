sap.ui.jsfragment("bin.forms.fitness.session", {

    createContent: function (oController) {
        jQuery.sap.require("sap.ui.commons.library");
        this.view = oController.getView();
        var that = this;

        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.mainPage.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        this.mode = "system";
        this.createView();

        this.qryStr = "";
        return this.mainPage;
    },
    createView: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        this.subs = {};
        this.qryStr = "";

        UtilGen.clearPage(this.mainPage);
        this.qryStr = "";
        var tb = new sap.m.Toolbar({content: [that.bk]});

        this.subs.field = UtilGen.createControl(sap.m.Text, this.view, "field",
            {}, "string");


        this.mainPage.addContent(tb);
        this.mainPage.addContent(vb);
        this.load_data();


    },
    resetVars: function () {
    },
    load_data: function () {


    },
    save_data: function () {

    },
    show_list: function () {


    },
    validateSave: function () {
    }
});



