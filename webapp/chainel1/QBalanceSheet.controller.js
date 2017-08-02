sap.ui.controller('chainel1.QBalanceSheet', {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf chainel1.QBalanceSheet **/
    onInit: function () {

    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf chainel1.QBalanceSheet
     **/
    onBeforeRendering: function () {

    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf chainel1.QBalanceSheet **/
    onAfterRendering: function () {

    },

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf chainel1.QBalanceSheet
     **/
    onExit: function () {
    },

    refresh: function () {
        var view = this.getView();
        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        if (view.colData == undefined)
            return;
        var ps = "";
        var ia = ""
        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + df.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getSelectedItem().getKey();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }


        ps += "&report-id=" + view.byId("txtSubGroup").getSelectedItem().getKey();
        var ca = "";
        for (var i = 0; i < view.colData.cols.length; i++)
            ca += (ca.length > 0 ? "&" : "") + "col_" + i + "=" + view.colData.cols[i].field_name;

        ps += (ca.length > 0 ? "&" : "") + ca;

        console.log(ps);

        // var pg=new sap.m.Page({
        //     customHeader:view.oBar2
        //
        // });
        var that = this;
        this.dataBuilt = null;
        this.Util.doAjaxGet
        ("exe?command=get-quickrep-data&" + (ps), "", false).done(function (data) {

            view.qv.mLctb.parse(data);

            that.setTreeColsType(data);
            that.dataResult = view.qv.buildJsonData();
            that.buildData();
        });

    },
    setTreeColsType: function () {
        this.mColParent = "";
        this.mColTitle = "";
        this.mColCode = "";
        this.mColChild = "";
        this.mColPath = "";
        this.mColBalance = "";

        for (var i = 0; i < this.mLctb.cols.length; i++) {
            if (this.mLctb.cols[i].mQtreeType == "CODE")
                this.mColCode = this.mLctb.cols[i].mColName;
            if (this.mLctb.cols[i].mQtreeType == "TITLE")
                this.mColTitle = this.mLctb.cols[i].mColName;
            if (this.mLctb.cols[i].mQtreeType == "LEVEL")
                this.mColLevel = this.mLctb.cols[i].mColName;
            if (this.mLctb.cols[i].mQtreeType == "PATH")
                this.mColpath = this.mLctb.cols[i].mColName;
            if (this.mLctb.cols[i].mQtreeType == "PARENT")
                this.mColParent = this.mLctb.cols[i].mColName;
            if (this.mLctb.cols[i].mQtreeType == "CHILDCOUNT")
                this.mColChild = this.mLctb.cols[i].mColName;
            if (this.mLctb.cols[i].mQtreeType == "CHILDCOUNT")
                this.mColChild = this.mLctb.cols[i].mColName;
            if (this.mLctb.cols[i].mQtreeType == "BALANCE")
                this.mColBalance = this.mLctb.cols[i].mColName;
        }

    },
    buildData: function () {
        if (this.dataResult == undefined) return;
        var view = this.getView();
        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        this.dataBuilt = this.buildTotals(this.dataResult.data);

    },
    buildTotals: function (data) {
        var dta = [];
        for (var i = 0; i < data.length; i++) {
            for (var v in data[i]) {
                if (!v.startsWith("childeren_")) {

                }

            }
        }
    }


})
;
