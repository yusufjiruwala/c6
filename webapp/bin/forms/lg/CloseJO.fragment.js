sap.ui.jsfragment("bin.forms.lg.CloseJO", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.lastSel = undefined;
        this.view = oController.getView();
        this.qryStr = "";
        this.cOrdNos = this.oController.ordNos;
        this.ordNos = [];
        this.o1 = {};
        this.mainPage = new sap.m.Page({
            showHeader: false

        });
        this.createView();
        this.loadData();
        return this.mainPage;
    },

    createView: function () {
        var that = this;
        var fe = [];
        this.o1 = {};
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.qv = new QueryView("tblcloseJo");
        UtilGen.clearPage(this.mainPage);
        var tb = new sap.m.Toolbar({
            content: [new sap.m.Button({
                icon: "sap-icon://nav-back",
                press: function () {
                    that.mainPage.backFunction();
                }
            })]
        });

        this.mainPage.addContent(tb);

        tb.addContent(new sap.m.ToolbarSpacer());
        this.msg = new sap.m.Title({text: this.ordNos.length + " Opened Orders selected !"}).addStyleClass("blinking redText");
        tb.addContent(this.msg);
        this.o1.txt = this.addControl(fe, "Ord # ", sap.m.TextArea, "clsOrds", {
            editable: false
        }, "string");
        this.o1.totdeb = this.addControl(fe, "Total DR", sap.m.Input, "clsdbr", {
            editable: false
        }, "number", sett["FORMAT_MONEY_1"]);
        this.o1.totcrd = this.addControl(fe, "@Total CR", sap.m.Input, "clscrd", {
            editable: false,
        }, "number", sett["FORMAT_MONEY_1"]);

        this.o1.post_dr_ac = this.addControl(fe, "DR A/c", sap.m.SearchField, "clsPostDrAc",
            {
                enabled: true,
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.jo.post_dr_ac, "", "", true);
                        return;
                    }

                    var sq = "select accno code,name title from acaccount where  childcount=0 order by path";
                    Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                        UtilGen.setControlValue(that.o1.post_dr_ac, val, valx, true);
                    });

                }
            }, "string");
        this.o1.close_date = this.addControl(fe, "@Close Date", sap.m.DatePicker, "clsCloseDate",
            {valueDate: new Date()}, "date");

        // this.o1._space = this.addControl(fe, "@  ", sap.m.Text, "clslbl1", {
        //     readOnly: true,
        // }, "number", sett["FORMAT_MONEY_1"]);

        this.o1.post_cr_ac = this.addControl(fe, "CR A/c ", sap.m.SearchField, "clsPostCrAc",
            {
                enabled: true,
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.jo.post_cr_ac, "", "", true);
                        return;
                    }

                    var sq = "select accno code,name title from acaccount where  childcount=0 order by path";
                    Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                        UtilGen.setControlValue(that.o1.post_cr_ac, val, valx, true);
                    });

                }
            }, "string");


        this.o1.totvar = this.addControl(fe, "@Variance", sap.m.Input, "clsvar", {
            editable: false
        }, "number", sett["FORMAT_MONEY_1"]);

        setTimeout(function () {
            that.o1.totvar.$("inner").addClass("yellow");
        }, 800);

        var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
        frm.getToolbar().addContent(
            new sap.m.Button({
                icon: "sap-icon://accept",
                text: "Close JO",
                press: function () {
                    that.post_close();
                }
            }));
        this.mainPage.addContent(frm);
        this.mainPage.addContent(this.qv.getControl());

    },
    loadData: function () {
        var sett = sap.ui.getCore().getModel("settings").getData();
        var that = this;
        if (this.qryStr == "") {
            if (this.cOrdNos.length < 0) {
                sap.m.MessageToast.show("No JO is selected !");
                this.mainPage.backFunction();
            }
            UtilGen.setControlValue(this.o1.close_date, new Date());
            this.ordNos = [];
            for (var i in this.cOrdNos) {
                var flg = Util.getSQLValue("select ord_flag from order1 where ord_code=106 and ord_no=" + Util.quoted(this.cOrdNos[i]));
                if (flg == 2)
                    this.ordNos.push(this.cOrdNos[i]);
            }
            this.msg.setText(this.ordNos.length + " Opened Orders selected !");
            UtilGen.setControlValue(this.o1.txt, this.ordNos.join());
            that.fetchData();

            var dtx = Util.execSQLWithData("select a.accno,a.name from acaccount a,store s where s.storeacc=a.accno and s.no=" + sett["DEFAULT_STORE"], "Unexpected err to fetch store a/c");
            if (dtx) {
                UtilGen.setControlValue(this.o1.post_cr_ac, dtx[0].ACCNO + "-" + dtx[0].NAME, dtx[0].ACCNO, false);
            }

        }
    }
    ,
    addControl(ar, lbl, cntClass, id, sett, dataType, fldFormat) {
        var setx = sett;
        var idx = id;
        if (Util.nvl(id, "") == "")
            idx = lbl.replace(/ ||,||./g, "");
        var cnt = UtilGen.createControl(cntClass, this.view, idx, setx, dataType, fldFormat);
        if (lbl.length != 0)
            ar.push(lbl);
        ar.push(cnt);
        return cnt;
    },
    fetchData: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sql = "select decode(ord_code,103,'Purchase',111,'Sales',141,'Proforma',151,'DR Notes',152,'CR Note') transaction , " +
            " ord_no, SUM(DECODE(ORD_CODE,103,(ORD_PRICE*ORD_FC_RATE)*ORD_ALLQTY,0,151,(ORD_cost_PRICE*ORD_ALLQTY),0)) DEBIT," +
            " SUM(DECODE(ORD_CODE,111,(ORD_COST_PRICE*ORD_ALLQTY),152,(ORD_cost_PRICE*ORD_ALLQTY),0)) CREDIT ," +
            " ord_code,SUM((ORD_PRICE*ORD_FC_RATE)*ORD_ALLQTY) ord_amt " +
            " FROM JOINED_ORDER WHERE ORD_CODE IN (111,103,151,152) AND ORD_REFERENCE IN (:ORD_NOS ) " +
            " GROUP BY " +
            " decode(ord_code,103,'Purchase',111,'Sales',151,'DR Notes',152,'CR Note'),ord_no ,ORD_CODE " +
            " ORDER BY 1,2";
        sql = sql.replace(":ORD_NOS", this.ordNos.join())
        var data = Util.execSQL(sql);
        if (data.ret == "SUCCESS") {
            that.qv.setJsonStrMetaData("{" + data.data + "}");
            that.qv.mLctb.getColByName("TRANSACTION").mGrouped = true;
            that.qv.mLctb.getColByName("DEBIT").getMUIHelper().display_format = "MONEY_FORMAT";
            that.qv.mLctb.getColByName("CREDIT").getMUIHelper().display_format = "MONEY_FORMAT";
            that.qv.mLctb.getColByName("CREDIT").mSummary = "SUM";
            that.qv.mLctb.getColByName("DEBIT").mSummary = "SUM";
            that.qv.mLctb.getColByName("ORD_CODE").mHideCol = true;
            that.qv.mLctb.getColByName("ORD_AMT").mHideCol = true;
            that.qv.mLctb.parse("{" + data.data + "}", true);
            that.qv.loadData();
        }
        that.do_summary();
    },
    do_summary: function () {
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var ld = this.qv.mLctb;
        var db = 0, cr = 0;
        for (var i = 0; i < ld.rows.length; i++) {
            db += ld.getFieldValue(i, "DEBIT");
            cr += ld.getFieldValue(i, "CREDIT");
        }
        UtilGen.setControlValue(this.o1.totdeb, df.format(db));
        UtilGen.setControlValue(this.o1.totcrd, df.format(cr));
        UtilGen.setControlValue(this.o1.totvar, df.format(db - cr));
    },
    post_close: function () {
        var that = this;
        var sqlIns = "", s1 = "";
        var kf = Util.getSQLValue("select nvl(max(keyfld),0)+1 from lg_close_o1");

        if (UtilGen.getControlValue(this.o1.totvar) == "" || UtilGen.getControlValue(this.o1.totvar) == "" ||
            UtilGen.getControlValue(this.o1.totvar) <= 0) {
            sap.m.MessageToast.show("Variance must not negative or zero  !");
            return;
        }

        var k = "";
        var s2 = "";
        // adding it to lg_close_o2 and do verification for each one is posted or not.
        for (var i in this.ordNos) {
            var ss = "insert into lg_close_o2 (KEYFLD, ORD_CODE, ORD_NO, ORD_AMT) values " +
                "(:KEYFLD, :ORD_CODE, :ORD_NO, :ORD_AMT );"
            var flg = Util.getSQLValue("select nvl(max(ord_no),-1) from order1 where ord_code in (111,103,141,151,152) and ord_flag!=2 and ord_reference=" + this.ordNos[i])
            if (flg != -1) {
                sap.m.MessageToast.show("Order is not posted # " + flg);
                return;
            }
            ss = ss.replace(/:KEYFLD/g, kf);
            ss = ss.replace(/:ORD_CODE/g, 106);
            ss = ss.replace(/:ORD_NO/g, this.ordNos[i]);
            ss = ss.replace(/:ORD_AMT/g, 0);
            s2 += ss;
        }

        if (this.qryStr == "") {
            that.fetchData();
            k = UtilGen.getSQLInsertString(this.o1, {KEYFLD: kf});
            k = "insert into lg_close_o1 " + k + ";";
            var defaultValues = {KEYFLD: kf};
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                defaultValues["ORD_CODE"] = this.qv.mLctb.getFieldValue(i, "ORD_CODE");
                defaultValues["ORD_AMT"] = this.qv.mLctb.getFieldValue(i, "ORD_AMT");
                s1 += (UtilGen.getInsertRowString(this.qv.mLctb, "LG_CLOSE_O2", i,
                    ["TRANSACTION", "DEBIT", "CREDIT"], defaultValues, true) + ";");
            }


            k = "declare cst number:=0; qnt number:=0; begin " + k + s1 + s2 + " x_lg_close_jo(" + kf + "); end; ";
        }
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
            sap.m.MessageToast.show("Saved Successfully !");
            that.mainPage.backFunction();
        });
    }
});



