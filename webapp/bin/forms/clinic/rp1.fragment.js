sap.ui.jsfragment("bin.forms.clinic.rp1", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 106,
            onm: ""
        };
        // this.pgDetail = new sap.m.Page({showHeader: false});

        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.joApp.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.mainPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");
        return this.joApp;
    },
    createView: function () {
        var that = this;
        var view = this.view;

        UtilGen.clearPage(this.mainPage);
        this.o1 = {};
        var fe = [];
        this.frm = this.createViewHeader();
        this.frm.getToolbar().addContent(this.bk);


        // that.createScrollCmds(this.frm.getToolbar());
        this.qv = new QueryView("qryDaily");
        this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.qv.getControl().setAlternateRowColors(false);


        // var sc = new sap.m.ScrollContainer();

        // sc.addContent(this.frm);
        // sc.addContent(this.qv.getControl());
        this.mainPage.addContent(this.frm);
        this.mainPage.addContent(this.qv.getControl());

    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        this.o1 = {};
        var tl = "XL3 L2 M2 S12";
        this.o1.fromdate = UtilGen.addControl(fe, "Begin Date", sap.m.DatePicker, "dayFromDate",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "date", undefined, this.view);
        this.o1.todate = UtilGen.addControl(fe, "@End Date", sap.m.DatePicker, "dayToDate",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"}),
            }, "date", undefined, this.view);

        var dt = new Date();
        var fr = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        var to = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

        UtilGen.setControlValue(this.o1.fromdate, fr);
        UtilGen.setControlValue(this.o1.todate, to);

        this.o1._cmdExe = new sap.m.Button({
            text: "Exe Query", press: function () {
                that.loadData();
            },
            layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
        });
        this.o1._cmdPrint = new sap.m.Button({
            text: "Print", press: function () {
                that.printData();
            },
            layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
        });

        fe.push(this.o1._cmdExe);
        fe.push(this.o1._cmdPrint);

        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var fr = UtilGen.getControlValue(this.o1.fromdate);
        var to = UtilGen.getControlValue(this.o1.todate);

        var sq = "select keyfld,NVL(TO_CHAR(ORD_NO),'NOT_INVOICED') REFERENCE,day_appoint,status, REMARKS," +
            " amount," +
            " decode(paid_1_type,1,paid_amt_1,0) + decode(paid_2_type,1,paid_amt_2,0) total_cash," +
            " decode(paid_1_type,2,paid_amt_1,0) + decode(paid_2_type,2,paid_amt_2,0) total_knet" +
            " from v_cl6_appoint" +
            " where trunc(start_time)>=" + Util.toOraDateString(fr) +
            " and trunc(start_time)<=" + Util.toOraDateString(to) +
            " order by keyfld ";
        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");

                var c = that.qv.mLctb.getColPos("AMOUNT");
                that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                that.qv.mLctb.getColByName("AMOUNT").mSummary = "SUM";

                c = that.qv.mLctb.getColPos("TOTAL_CASH");
                that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                that.qv.mLctb.getColByName("TOTAL_CASH").mSummary = "SUM";

                var c = that.qv.mLctb.getColPos("TOTAL_KNET");
                that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                that.qv.mLctb.getColByName("TOTAL_KNET").mSummary = "SUM";

                that.qv.mLctb.parse("{" + data.data + "}", true);
                that.qv.loadData();
                // view.byId("poOpenInv").setEnabled(true);


            }
        });
    }
    ,
    validateSave: function () {

        return true;
    }
    ,
    save_data: function () {
    },
    get_emails_sel: function () {

    },
    printData: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var fr = sdf.format(UtilGen.getControlValue(this.o1.fromdate));
        var to = sdf.format(UtilGen.getControlValue(this.o1.todate));

        that.view.colData = {};
        that.view.reportsData = {
            report_info: {
                report_name: "Period Sales and Payment",
                report_other: "From Date : " + fr + "  To Date :" + to
            },

        };
        this.qv.printHtml(this.view, "");
    },

});



