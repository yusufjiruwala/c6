sap.ui.jsfragment("bin.forms.pos.rp2", {

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
        var tit = new sap.m.Text({text: "Customer Report"}).addStyleClass("titleFont");
        this.frm.getToolbar().addContent(tit);


        // that.createScrollCmds(this.frm.getToolbar());
        this.qv = new QueryView("qryDaily");
        this.qv.getControl().addStyleClass("sapUiSizeCondensed");
        this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.qv.getControl().setAlternateRowColors(false);
        this.qv.getControl().setFixedBottomRowCount(1);
        // this.qv.getControl().setEnableCellFilter(true);


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

        this.o1.empno = UtilGen.addControl(fe, "Location By", sap.m.ComboBox, "apEmpno",
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                    templateShareable: true

                },
                value: -1
            }, "string", undefined, this.view, undefined, "select '-1' code,'ALL' NAME from dual union all select code,name from locations order by 1");

        UtilGen.setControlValue(this.o1.empno, -1, -1, true);
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
        var db = UtilGen.getControlValue(this.o1.empno);

        // var sq = "select * from (SELECT TO_CHAR(ORD_DATE,'DD/MM/RRRR') ORD_DATE, ORD_NO INVOICE_NO, ord_ref File_no, ORD_REFNM CUST_NAME, " +
        //     "DESCR,   ORD_ALLQTY/ORD_PACK QTY,    ORD_PRICE, " +
        //     "(ORD_ALLQTY/ORD_PACK)*ORD_PRICE AMOUNT, " +
        //     "(SELECT MAX(NAME) FROM SALESP WHERE NO=nvl(LCNO,(select max(empno) from cl6_appoint where cl6_appoint.keyfld=ord_reference))) DONE_BY " +
        //     "FROM JOINED_ORDER " +
        //     " where trunc(ord_date)>=" + Util.toOraDateString(fr) +
        //     " and trunc(ord_date)<=" + Util.toOraDateString(to)
        //     + " and ord_code=111 "
        //     + " order by ord_no,ord_pos) cx where " + Util.quoted(db) + "='ALL' or cx.done_by=" + Util.quoted(db);

        var sq = "select l.name location_name , p.b_no," +
            " p.cust_reference tel,p.cust_name,p.b_date," +
            " p.keyfld ,inv_amt amount from pos_onpur1 p,locations l" +
            " where trunc(b_date)>=" + Util.toOraDateString(fr) +
            " and trunc(b_date)<=" + Util.toOraDateString(to) +
            " and (p.location_code=" + Util.quoted(db) + " or " + Util.quoted(db) + "='-1') " +
            " and l.code=p.location_code order by b_date desc,keyfld desc";

        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");

                var c = that.qv.mLctb.getColPos("AMOUNT");
                that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                that.qv.mLctb.getColByName("AMOUNT").mSummary = "SUM";

                that.qv.mLctb.parse("{" + data.data + "}", true);
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

});



