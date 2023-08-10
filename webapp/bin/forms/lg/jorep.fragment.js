sap.ui.jsfragment("bin.forms.lg.jorep", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.SplitApp({ mode: sap.m.SplitAppMode.HideMode });
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
        var tit = new sap.m.Text({ text: "JO Report" }).addStyleClass("titleFont");
        this.frm.getToolbar().addContent(tit);


        // that.createScrollCmds(this.frm.getToolbar());
        this.qv = new QueryView("qryDaily");
        this.qv.getControl().addStyleClass("sapUiSizeCondensed");
        this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.qv.getControl().setAlternateRowColors(false);
        this.qv.getControl().setFixedBottomRowCount(1);

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
                layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" })
            }, "date", undefined, this.view);
        this.o1.todate = UtilGen.addControl(fe, "End Date", sap.m.DatePicker, "dayToDate",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" }),
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
            layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" })
        });
        this.o1._cmdPrint = new sap.m.Button({
            text: "Print", press: function () {
                that.printData();
            },
            layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" })
        });
        this.o1._cmdCols = new sap.m.Button({
            text: "Cols/Filter", press: function () {
                that.show_cols();
            },
            layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" })
        });

        fe.push(this.o1._cmdExe);
        fe.push(this.o1._cmdPrint);
        fe.push(this.o1._cmdCols);

        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var fr = UtilGen.getControlValue(this.o1.fromdate);
        var to = UtilGen.getControlValue(this.o1.todate);

        var sq = "select vj.*," +
            " LG_KIND, LG_PERMANENT_EXEMPTION, LG_TEMPORARY_IMPORT, LG_DUTY_PAID, LG_L_RE_EXPORT, LG_L_LOCAL, LG_L_ORIGIN_TRUCK, LG_DRIVER_NO, LG_TRUCK_IQ, LG_TRUCK_TYPE, LG_LOADING_DATE, LG_L_CLEARANCE_DATE, LG_L_DELIVERY_DATE, LG_L_OFFLOAD_DATE, LG_SHIPPER, LG_CONSIGNEE, LG_S_VESSEL_NAME, LG_S_CONTAINER_NO, LG_S_MBL, LG_S_HBL, LG_S_FCL_LCL_BB, LG_A_AIRLINE, LG_A_FLT_NO, LG_A_MAWB, LG_A_HAWB, LG_OFFLOADING_DATE, LG_ACTIVITY, LG_ORIGIN, LG_DESTINATION, LG_NO_OF_PCS, LG_WEIGHT, LG_MEASUREMENT, LG_DESCRIPTION, LG_NOTES, LG_L_ARRIVAL_DATE, LG_END_USER_TYPE, LG_VENDOR_NAME, LG_VENDOR_CONTACT, LG_CROSS_LOAD, LG_RELEASE, LG_START_CUST_CLEARANCE, LG_COMPLETE_CUSTOM, LG_RELEASE_FROM_BORDER, LG_CARGO_TYPE, LG_CBMS, LG_CARGO_IN, LG_CARGO_OUT, LG_CLOSING, LG_DEPARTURE, LG_ETD, LG_ETA " +
            " from V_LG_JO vj,lg_info li where vj.ord_no=LI.ORD_NO(+) " +
            " and vj.ord_date>=" + Util.toOraDateString(fr) +
            " and vj.ord_date<=" + Util.toOraDateString(to);

        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", { sql: sq }, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                
                var ld = that.qv.mLctb;

                var c = ld.getColPos("ORD_DATE");
                ld.cols[c].getMUIHelper().display_format = "SHORT_DATE_FORMAT";
                ld.cols[c].getMUIHelper().data_type = "DATE";

                var c = ld.getColPos("ORD_NO");
                ld.cols[c].getMUIHelper().data_type = "NUMBER";

                c = ld.getColPos("TOTAL_PURCHASE");
                ld.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                ld.cols[c].mSummary = "SUM";

                c = ld.getColPos("TOTAL_PRETURN");
                ld.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                ld.cols[c].mSummary = "SUM";

                c = ld.getColPos("TOTAL_CN");
                ld.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                ld.cols[c].mSummary = "SUM";

                c = ld.getColPos("TOTAL_SALES");                
                ld.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                ld.cols[c].mSummary = "SUM";
                               
                
                for (var ci = 0; ci < ld.cols.length; ci++)
                    ld.cols[ci].mTitle = ld.cols[ci].mTitle.replace("LG_", "");
                ld.parse("{" + data.data + "}", true);

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
    show_cols: function () {
        this.qv.showFilterWindow(this.view);
    }
});



