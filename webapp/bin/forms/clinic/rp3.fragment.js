sap.ui.jsfragment("bin.forms.clinic.rp3", {

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
        var tit = new sap.m.Text({text: "Patients List"}).addStyleClass("titleFont");
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

        this.o1.patname = UtilGen.addControl(fe, "Patient Name", sap.m.Input, "patname",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"}),
                value: "%"
            }, "string", undefined, this.view);

        // UtilGen.setControlValue(this.o1.pathname, "%", "%", true);

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

        var empnm = this.o1.patname.getValue();
        if (Util.nvl(empnm, "") == "")
            empnm = "%";

        var sq = "select code,name title,tel,reference civil_id,pager nationality, addr address " +
            " from c_ycust " +
            " where iscust='Y' and childcount=0  and code like '1%' " +
            " and name like " + Util.quoted(empnm) +
            " order by code";
        // var sq = "select * from (SELECT TO_CHAR(ORD_DATE,'DD/MM/RRRR') ORD_DATE, ORD_NO INVOICE_NO, ord_ref File_no, ORD_REFNM CUST_NAME, " +
        //     "DESCR,   ORD_ALLQTY/ORD_PACK QTY,    ORD_PRICE, " +
        //     "(ORD_ALLQTY/ORD_PACK)*ORD_PRICE AMOUNT, " +
        //     "(SELECT MAX(NAME) FROM SALESP WHERE NO=nvl(LCNO,(select max(empno) from cl6_appoint where cl6_appoint.keyfld=ord_reference))) DONE_BY " +
        //     "FROM JOINED_ORDER " +
        //     " where trunc(ord_date)>=" + Util.toOraDateString(fr) +
        //     " and trunc(ord_date)<=" + Util.toOraDateString(to)
        //     + " and ord_code=111 "
        //     + " order by ord_no,ord_pos) cx where " + Util.quoted(db) + "='ALL' or cx.done_by=" + Util.quoted(db);

        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");

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
        // var fr = sdf.format(UtilGen.getControlValue(this.o1.fromdate));
        // var to = sdf.format(UtilGen.getControlValue(this.o1.todate));

        that.view.colData = {};
        that.view.reportsData = {
            report_info: {
                report_name: "Patients List",
                report_other: ""
            },

        };
        this.qv.printHtml(this.view, "");
    },

});



