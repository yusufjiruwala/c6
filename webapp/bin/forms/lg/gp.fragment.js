sap.ui.jsfragment("bin.forms.lg.gp", {

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
        var tit = new sap.m.Text({ text: "Gross Profit" }).addStyleClass("titleFont");
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
        this.o1.type = UtilGen.addControl(fe, "Report Type", sap.m.ComboBox, "repType",
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({
                        text: "{NAME}",
                        key: "{CODE}"
                    }),
                    templateShareable: true,

                },
                enabled: true,
                layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" })
            }, "string", undefined, this.view, undefined, "@1/Total GP,2/DE-FR wise");
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
        this.o1.incUnPost = UtilGen.addControl(fe, "Include Unposted ", sap.m.CheckBox, "chkUnpost",
            {
                selected: true,
                enabled: true,
                layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" }),
            }, "string", undefined, this.view);

        var dt = new Date();
        var fr = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        var to = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

        UtilGen.setControlValue(this.o1.fromdate, fr);
        UtilGen.setControlValue(this.o1.todate, to);
        Util.setComboValue(this.o1.type, "1");

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
        var up = this.o1.incUnPost.getSelected();
        var flgstr = " and ord_flag=2 ";
        if (up)
            flgstr = "";
        var nos = "";
        var sdt = Util.execSQL("select distinct ord_reference from order1 where ord_code=111 " + flgstr + " AND ord_date>=" + Util.toOraDateString(fr) + " and ord_date<=" + Util.toOraDateString(to));
        if (sdt.ret == "SUCCESS") {
            var sdx = JSON.parse("{" + sdt.data + "}").data;
            for (var si in sdx)
                nos += (nos.length > 0 ? "," : "") + Util.quoted(sdx[si].ORD_REFERENCE);
        }
        if (nos.length == 0)
            nos = "''";
        var sq = "SELECT FULL_ORD_NO,ORD_NO,ORD_REF, ORD_REFNM, JO_TYPE,TRANS_TYPE,COST_CENTER, ORD_DATE, NO_OF_SO,NO_OF_TRUCKS, " +
            " DECODE(ORD_FLAG,1,'Closed',2,'Opened') STATUS, " +
            " TOTAL_SALES, TOTAL_PURCHASE,TOTAL_PRETURN, TOTAL_CN, ((TOTAL_SALES + TOTAL_PRETURN) -(TOTAL_PURCHASE+TOTAL_CN ) ) GROSS_PROFIT FROM V_LG_JO vj " +
            " where vj.ord_no in (" + nos + ") order by ord_no desc ";
        if (UtilGen.getControlValue(this.o1.type) == "2")
            sq = "select FULL_ORD_NAME, ORD_NO, ORD_DATE, ORD_REF, ORD_REFNM, DECODE(ORD_FLAG,1,'Closed',2,'Opened') STATUS,FR_SALES, DE_SALES, FR_COST, DE_COST,fr_sales-fr_cost gp_fr,de_sales-de_cost gp_de from V_LG_JO_DE_FR  " +
                " where ord_no in (" + nos + ") order by ord_no desc ";

        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", { sql: sq }, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                var ld = that.qv.mLctb;

                var ld = that.qv.mLctb;

                var c = ld.getColPos("ORD_DATE");
                ld.cols[c].getMUIHelper().display_format = "SHORT_DATE_FORMAT";
                ld.cols[c].getMUIHelper().data_type = "DATE";

                if (UtilGen.getControlValue(that.o1.type) == "1") {
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

                    c = ld.getColPos("GROSS_PROFIT");
                    ld.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                    ld.cols[c].mSummary = "SUM";
                } else {

                    ld.cols[ld.getColPos("FR_SALES")].getMUIHelper().display_format = "MONEY_FORMAT";
                    ld.cols[ld.getColPos("FR_SALES")].mSummary = "SUM";

                    ld.cols[ld.getColPos("FR_COST")].getMUIHelper().display_format = "MONEY_FORMAT";
                    ld.cols[ld.getColPos("FR_COST")].mSummary = "SUM";

                    ld.cols[ld.getColPos("DE_SALES")].getMUIHelper().display_format = "MONEY_FORMAT";
                    ld.cols[ld.getColPos("DE_SALES")].mSummary = "SUM";

                    ld.cols[ld.getColPos("DE_COST")].getMUIHelper().display_format = "MONEY_FORMAT";
                    ld.cols[ld.getColPos("DE_COST")].mSummary = "SUM";

                    ld.cols[ld.getColPos("GP_FR")].getMUIHelper().display_format = "MONEY_FORMAT";
                    ld.cols[ld.getColPos("GP_FR")].mSummary = "SUM";

                    ld.cols[ld.getColPos("GP_DE")].getMUIHelper().display_format = "MONEY_FORMAT";
                    ld.cols[ld.getColPos("GP_DE")].mSummary = "SUM";


                }

                ld.parse("{" + data.data + "}", true);

                that.qv.loadData();

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



