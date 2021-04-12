sap.ui.jsfragment("bin.forms.clinic.pat", {

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
                that.oController.backFunction();
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

        Util.destroyID("poCmdSave", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave"), {
            icon: "sap-icon://save", press: function () {
                that.save_data();
            }
        }));

        Util.destroyID("poCmdDel", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdDel"), {
            icon: "sap-icon://delete", press: function () {
                that.delete_data();
            }
        }));
        Util.destroyID("poCmdList", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdList"), {
            icon: "sap-icon://list", press: function () {
                that.show_list();
            }
        }));

        // that.createScrollCmds(this.frm.getToolbar());

        var sc = new sap.m.ScrollContainer();
        var tb = new sap.m.Toolbar();
        tb.addContent(new sap.m.Button({
            text: "Get History Invoices",
            press: function () {
                that.show_hist();
            }
        }));

        Util.destroyID("poOpenInv", this.view);
        tb.addContent(new sap.m.Button(view.createId("poOpenInv"), {
            text: "Open Inv",
            enabled: false
        }));
        this.qv = new QueryView("tblHist");
        sc.addContent(this.frm);
        sc.addContent(tb);
        sc.addContent(this.qv.getControl());

        this.qv.getControl().attachRowSelectionChange(null, function (evt) {
            var idx = that.qv.getControl().getSelectedIndex()
            if (idx <= -1)
                view.byId("poOpenInv").setEnabled(false);
            else
                view.byId("poOpenInv").setEnabled(true);
        });
        this.mainPage.addContent(sc);
    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        this.pa = {};
        var sp_1 = "XL6 L2 M2 S2";
        var sp_2 = "XL6 L4 M4 S4";
        this.pa.code = UtilGen.addControl(fe, "Code", sap.m.Input, "faCtgCode",
            {
                layoutData: new sap.ui.layout.GridData({span: sp_1})
            }, "string", undefined, this.view);
        this.pa.name = UtilGen.addControl(fe, "@Name", sap.m.Input, "paName",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: sp_2})
            }, "string", undefined, this.view);
        this.pa.tel = UtilGen.addControl(fe, "Tel", sap.m.Input, "paTel",
            {
                liveChange: function (oEvent) {
                    var _oInput = oEvent.getSource();
                    var val = _oInput.getValue();
                    val = val.replace(/[^\d]/g, '');
                    UtilGen.setControlValue(_oInput,val,val,true);

                },
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: sp_1})
            }, "string", undefined, this.view);
        this.pa.addr = UtilGen.addControl(fe, "@Address", sap.m.Input, "paAddr",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: sp_2})
            }, "string", undefined, this.view);

        this.pa.pager = UtilGen.addControl(fe, "Nationality", sap.m.ComboBox, "paNat",
            {
                customData: [{key: ""}],
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{PAGER}", key: "{PAGER}"}),
                    templateShareable: true
                },
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: sp_1})
            }, "string", undefined, this.view, undefined, "select distinct pager from c_ycust");
        this.pa.reference = UtilGen.addControl(fe, "@Civil ID", sap.m.Input, "paCivil",
            {

                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: sp_2})
            }, "string", undefined, this.view);
        // return UtilGen.formCreate("", true, fe);
        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var view = this.view;
        var that = this;
        this.pa.code.setEnabled(true);
        this.pa.tel.setEnabled(true);
        if (this.qryStr == "") {
            // var n = parseInt(Util.getSQLValue("select nvl(max(no),0)+1 from salesp"));

            UtilGen.resetDataJson(this.pa);
            var n = Util.getSQLValue("select nvl(max(to_number(code)),1000)+1 from c_ycust where parentcustomer='1' ");
            UtilGen.setControlValue(this.pa.code, n);

        } else {
            this.pa.code.setEnabled(false);
            var dt = Util.execSQL("select *from c_ycust where code=" + Util.quoted(this.qryStr));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {

                var dtx = JSON.parse("{" + dt.data + "}").data;

                var cnt = Util.getSQLValue("select nvl(count(*),0) from cl6_appoint where tel=" + Util.quoted(dtx[0].TEL));
                if (cnt > 0)
                    this.pa.tel.setEnabled(false);

                UtilGen.loadDataFromJson(this.pa, dtx[0], true);
                this.pa.code.setEnabled(false);
            }
        }
    }
    ,
    validateSave: function () {
        var that = this;
        var tel = UtilGen.getControlValue(this.pa.tel);
        var code = UtilGen.getControlValue(this.pa.code);
        if (Util.nvl(tel, "").length == 0) {
            sap.m.MessageToast.show("Must enter Tel !");
            return false;
        }

        // var telExist = Util.getSQLValue("select name||'-'||code from c_ycust where code!=" + Util.quoted(code) + " and tel=" + Util.quoted(tel));
        // if (Util.nvl(telExist, "").length > 0) {
        //     sap.m.MessageToast.show(telExist + " is TEL NO similar !");
        //     return false;
        // }
        return true;
    }
    ,
    save_data: function () {
        var that = this;
        var ld = this.qv.mLctb;
        var sett = sap.ui.getCore().getModel("settings").getData();
        if (!this.validateSave())
            return;
        var k = ""; //  sql for order1 table.
        // inserting or updating order1 and order1 and order2  tables.
        // var defaultValues = {};
        var cod = UtilGen.getControlValue(this.pa.code);
        var nm = UtilGen.getControlValue(this.pa.name);
        var tel = UtilGen.getControlValue(this.pa.tel);
        if (this.qryStr == "") {

            k = UtilGen.getSQLInsertString(this.pa, {
                PARENTCUSTOMER: Util.quoted("1"),
                PATH: Util.quoted("XXX\\1\\" + cod),
                ISCUST: "'Y'",
                AC_NO: "(select MAX(ac_no) from c_ycust where code='1')"
            })
            ;
            k = "insert into c_ycust " + k + ";";
            k += " Update cl6_appoint set cust_code=" + Util.quoted(cod) + ",cust_name=" + Util.quoted(nm) + " where cust_code is null and flag=1 and tel=" + Util.quoted(tel) + ";";
        }
        else {
            k = UtilGen.getSQLUpdateString(this.pa, "C_YCUST", {},
                "CODE=" + Util.quoted(this.qryStr)) + " ;";
            k += " Update cl6_appoint set cust_code=" + Util.quoted(cod) + ",cust_name=" + Util.quoted(nm) + " where cust_code is null and flag=1 and tel=" + Util.quoted(tel) + ";";
        }
        k = "begin " + k + " end;";

        var oSql = {
            "sql": k,
            "ret": "NONE",
            "data": null
        };
        Util.doAjaxJson("sqlexe", oSql, false).done(function (data) {
            console.log(data);
            if (data == undefined) {
                sap.m.MessageToast.show("Error: unexpected, check server admin");
                return;
            }
            if (data.ret != "SUCCESS") {
                sap.m.MessageToast.show("Error :" + data.ret);
                return;
            }

            sap.m.MessageToast.show("Saved Successfully ..!");
            that.oController.backFunction();
        });
    },
    show_list: function () {
        var that = this;
        var sql = "select code,name title,tel,reference civil_id from c_ycust where iscust='Y' and childcount=0  and code like '1%' order by code";

        var fnOnSelect = function (data) {
            if (data != undefined && data.length <= 0)
                return;
            that.qryStr = data.CODE;
            that.loadData();
            return true;
        };

        Util.show_list(sql, ["TITLE", "CODE", "TEL", "REFERENCE"],
            undefined, fnOnSelect, "100%", "100%", 10, false, undefined);
        // Util.showSearchList(sq, "NAME", "CODE", function (valx, val) {
        //     that.qryStr = valx;
        //     that.loadData();
        //
        //
        // });

    },
    show_hist: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sq = "select day_appoint,status,  REMARKS,AMOUNT from v_cl6_appoint where cust_code=" + Util.quoted(UtilGen.getControlValue(this.pa.code));
        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");

                var c = that.qv.mLctb.getColPos("AMOUNT");
                that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                that.qv.mLctb.getColByName("AMOUNT").mSummary = "SUM";
                that.qv.mLctb.parse("{" + data.data + "}", true);
                that.qv.loadData();
                // view.byId("poOpenInv").setEnabled(true);


            }
        });
    },
    openInvoice: function (kf, oA) {
        var that = this;
        var sp = UtilGen.openForm("bin.forms.clinic.SO", undefined, {
            backFunction: function (st) {
                that.joApp.to(that.mainPage, "baseSlide");
                if (st != undefined) {
                    that.start_date = st;
                    st.setHours(st.getHours() - 6);
                    that.loadData();
                }
            },
            qryStr: "",
            oA: oA,
            apKeyfld: kf,
            getView:
                function () {
                    return that.view;
                }
        });
        sp.app = this.joApp;
        UtilGen.clearPage(this.pgDetail);
        this.pgDetail.addContent(sp);
        this.joApp.to(this.pgDetail, "slide");
    }
});



