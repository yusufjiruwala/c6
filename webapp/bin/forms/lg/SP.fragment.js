sap.ui.jsfragment("bin.forms.lg.SP", {

    createContent: function (oController) {
        var that = this;
        jQuery.sap.require("sap.m.MessageBox");

        this.view = oController.getView();
        this.qryStr = oController.qryStr;
        this.qryStrPO = oController.qryStrPO;
        this.qryStrSO = oController.qryStrSO;
        this.pgDN = new sap.m.Page({
            showHeader: false
        });
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 141,
            saleinv: -1,
            pur_and_srv: 'N',
            pur_inv_no: -1
        };
        this.o1 = {};
        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.pgDN.backFunction();
            }
        });
        this.createView();
        this.loadData();
        return this.pgDN;
    },

    createView: function () {
        var that = this;
        var view = this.view;
        UtilGen.clearPage(this.pgDN);
        this.o1 = {};
        var fe = [];
        this.frm = this.createViewHeader();
        this.qv = new QueryView("tblPODetails");
        that.qv.getControl().view = this;
        this.qv.getControl().addStyleClass("sapUiSizeCondensed");
        this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setFixedBottomRowCount(0);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
        this.qv.getControl().setVisibleRowCount(7);


        this.frm.getToolbar().addContent(this.bk);
        (this.view.byId("poCmdSave") != undefined ? this.view.byId("poCmdSave").destroy() : null);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave"), {
            icon: "sap-icon://save", press: function () {
                that.save_data();
            }
        }));

        (this.view.byId("poCmdDel") != undefined ? this.view.byId("poCmdDel").destroy() : null);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdDel"), {
            icon: "sap-icon://delete", press: function () {
                that.delete_data();
            }
        }));

        that.createScrollCmds(this.frm.getToolbar());

        this.frm.getToolbar().addContent(new sap.m.ToolbarSpacer());
        (this.view.byId("poMsgInv") != undefined ? this.view.byId("poMsgInv").destroy() : null);
        this.frm.getToolbar().addContent(new sap.m.Text(view.createId("poMsgInv"), {text: ""}).addStyleClass("redText blinking"));
        this.frm.getToolbar().addContent(new sap.m.Title({text: "Sales Proforma Request"}));

        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);
        1

        sc.addContent(new sap.m.Button({
            icon: "sap-icon://add-activity", press: function () {
                that.add_items();
            }
        }));
        sc.addContent(this.qv.getControl());
        this.pgDN.addContent(sc);
        this.createViewFooter(sc);

        setTimeout(function () {
            $($(".sapUiFormResGrid , .sapUiFormToolbar")[0]).addClass("oliveTB");
            $(".sapUiFormResGrid , .sapUiFormToolbar").addClass("oliveTB")
        }, 500);
    },
    createViewFooter: function (sc) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.o2 = [];
        var fe = [];
        // this.o2.ord_discamt = UtilGen.createControl(sap.m.Input, this.view, "poOrdDisc", {enabled: false}, "number");
        // this.o2.ord_amt = UtilGen.createControl(sap.m.Input, this.view, "poOrdamt", {enabled: false}, "number");
        // var hb1 = new sap.m.HBox({items: [new sap.m.Text({text: "Discount"}), this.o2.ord_discamt]});
        // var hb2 = new sap.m.HBox({items: [new sap.m.Text({text: "Amount"}), this.o2.ord_amt]});
        // this.o2.ord_discamt = this.addControl(fe, "Discount", sap.m.Input, "poOrdDisc",
        //     {
        //         editable: false,
        //         layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
        //     }, "number", sett["FORMAT_MONEY_1"])
        this.o2.ord_amt = this.addControl(fe, "LC Amount", sap.m.Input, "poOrdAmt",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"])
        this.o2.ord_amt_lc = this.addControl(fe, "Amount", sap.m.Input, "poOrdAmtLc",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"])

        var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
        frm.setToolbar(undefined);
        frm.destroyToolbar();
        sc.addContent(frm);
    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        this.o1.oname = this.addControl(fe, "Type", sap.m.Input, "dnfrde",
            {enabled: false}, "string");
        this.o1.ord_no = this.addControl(fe, "Order No", sap.m.Input, "dnOrdNo",
            {layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})}, "number")
        this.o1.ord_date = this.addControl(fe, "@Date", sap.m.DatePicker, "dnOrdDate",
            {layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})}, "date");
        this.o1.ord_reference = this.addControl(fe, "@JO No", sap.m.Input, "dnJOOrdNo",
            {layoutData: new sap.ui.layout.GridData({span: "XL1 L1 M1 S12"}), enabled: false}, "number");
        this.o1.ord_ref = this.addControl(fe, "Supplier", sap.m.SearchField, "dnSupplier",
            {
                enabled: true, search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.jo.ord_ref, "", "", true);
                        return;
                    }

                    var sq = "select code,name title from c_ycust where (isbankcash='Y' or issupp='Y') and childcount=0 order by code";
                    Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                        UtilGen.setControlValue(that.o1.ord_ref, val, valx, true);
                    });

                }
            }, "string");
        this.o1.ord_prof_ac = this.addControl(fe, "Proforma A/c", sap.m.SearchField, "dnprofAc",
            {enabled: false}
            , "string");
        this.o1.payterm = this.addControl(fe, "Remarks", sap.m.Input, "dnRemarks",
            {enabled: true}, "string");
        this.o1.so_reference = this.addControl(fe, "@Inv Ref #", sap.m.Input, "dnSoRefer",
            {enabled: true}, "string");

        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);


    },
    loadData: function () {
        var that = this;
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.vars.pur_and_srv = 'N';
        this.vars.saleinv = -1;
        this.vars.pur_inv_no = -1;

        UtilGen.setControlValue(this.o1.oname, "FR", "FR", true);
        this.view.byId("poMsgInv").setText("");
        this.view.byId("poCmdSave").setEnabled(true);
        this.view.byId("poCmdDel").setEnabled(true);
        this.o1.ord_ref.setEnabled(false);

        if (this.qryStrPO == "" && this.qryStrSO == "") {
            sap.m.MessageToast.show("Must select SO while creating Debit Note !");
            that.pgDN.backFunction();

        }

        if (this.qryStrPO == "") {
            this.showFRDE();
            var on = Util.getSQLValue("select nvl(max(ord_no),0)+1 from order1 where ord_code=" + this.vars.ord_code);
            UtilGen.setControlValue(this.o1.ord_no, on);
            UtilGen.setControlValue(this.o1.ord_date, new Date());
            UtilGen.setControlValue(this.o1.ord_reference, this.qryStr, false);
            UtilGen.setControlValue(this.o1.so_reference, this.qryStrSO, false);

            this.o1.ord_no.setEnabled(true);
            var dt = Util.execSQL("select ord_ref,ord_refnm from order1 where ord_code=106 and ord_no=" + Util.quoted(this.qryStr));
            if (dt.ret == "SUCCESS") {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.setControlValue(this.o1.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
            }

            var pr = Util.nvl(Util.getSQLValue("select repair.get_prof_ac(" + Util.quoted(dtx[0].ORD_REF) + ") from dual")
                , sett["PROFORMA_AC"]);
            var prAc = Util.getSQLValue("select name from acaccount where childcount=0 and accno=" + Util.quoted(pr));
            if (Util.nvl(prAc, "") == "") {
                sap.m.MessageToast.show(pr + " is not valid for proforma a/c !");
                that.pgDN.backFunction();
                return;
            }
            UtilGen.setControlValue(that.o1.ord_prof_ac, pr + "-" + prAc, pr, true);

        } else {
            var dt = Util.execSQL("select *from order1 where ord_code=" + this.vars.ord_code + " and ord_no=" + Util.quoted(this.qryStrPO));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.loadDataFromJson(this.o1, dtx[0], true);
                this.o1.ord_no.setEnabled(false);
                UtilGen.setControlValue(this.o1.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                this.qryStrSO = dtx[0].SO_REFERENCE;
                this.vars.pur_and_srv = dtx[0].PUR_AND_SRV;
                this.vars.saleinv = dtx[0].SALEINV;

                var prAc = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(dtx[0].ORD_PROF_AC));
                UtilGen.setControlValue(that.o1.ord_prof_ac, dtx[0].ORD_PROF_AC + "-" + prAc, dtx[0].ORD_PROF_AC, true);
            }
        }
        this.loadData_details();

        if (Util.nvl(this.vars.saleinv, -1) != -1 && this.vars.saleinv != 0) {
            this.vars.pur_inv_no = Util.getSQLValue("select no from acvoucher1 where keyfld=" + this.vars.saleinv);
            this.view.byId("poMsgInv").setText("JV # " + this.vars.pur_inv_no);
            this.qv.getControl().setEditable(false);
            this.frm.setEditable(false);
            this.view.byId("poCmdSave").setEnabled(false);
            this.view.byId("poCmdDel").setEnabled(false);

        }

    }
    ,
    loadData_details: function () {
        var that = this;
        var sq = "select order2.*,'' descr2, 0 discp,((ORD_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY amount," +
            "(((ORD_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY)*ord_fc_rate lc_amount" +
            " from order2 where ord_no="
            + Util.quoted(this.qryStrPO)
            + " and ord_code="
            + this.vars.ord_code
            + " order by ord_pos";
        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                UtilGen.applyCols("C6LGREQ.SP1", that.qv);
                that.qv.mLctb.parse("{" + data.data + "}", true);
                if (that.qv.mLctb.rows.length == 0)
                    that.qv.addRow();
                that.qv.loadData();
                that.do_summary(true);
                that.setItemSql();

            }
        });
    },
    addControl(ar, lbl, cntClass, id, sett, dataType, fldFormat) {
        var setx = sett;
        var idx = id;
        if (Util.nvl(id, "") == "")
            idx = lbl.replace(/ ||,||./g, "");
//        setx["layoutData"] = new sap.ui.layout.GridData({span: "XL4 L4 M4 S12"});
        var cnt = UtilGen.createControl(cntClass, this.view, idx, setx, dataType, fldFormat);
        if (lbl.length != 0)
            ar.push(lbl);
        ar.push(cnt);
        return cnt;
    },
    validateSave: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"])
        this.qv.updateDataToTable();
        var cnts = {};
        var dt = Util.getSQLValue("select to_char(ord_date,'rrrr-mm-dd') from order1 where ord_code=106 and ord_no=" + this.qryStr);
        if (dt == undefined) {
            sap.m.MessageToast.show(dt.ret);
            return;
        }
        var orddt = new Date(dt + " 0:0:0");
        var podate = UtilGen.getControlValue(this.o1.ord_date);
        if (podate.getTime() < orddt.getTime()) {
            sap.m.MessageToast.show("Date must be above " + df.format(orddt));
            return;
        }
        for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
            var rn = Util.nvl(that.qv.mLctb.getFieldValue(i, "ORD_RCPTNO"), "");

            if (rn == "") {
                sap.m.MessageToast.show("Must  Receipt No have value .. !");
                return false;
            }
            cnts[rn] = Util.nvl(cnts[rn], 0) + 1;
            if (cnts[rn] > 1) {
                sap.m.MessageToast.show("Must have Unique value for Receipt # " + rn);
                return false;
            }

        }
        return true;
    },
    save_data: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        if (!this.validateSave())
            return;
        var k = ""; //  sql for order1 table.
        // inserting or updating order1 and order1 and order2  tables.
        var defaultValues = {
            "PERIODCODE": sett["CURRENT_PERIOD"],
            "ORD_NO": UtilGen.getControlValue(this.o1.ord_no),
            "ORD_CODE": this.vars.ord_code,
            "ORD_FLAG": 1,
            "ORD_DATE": UtilGen.getControlValue(this.o1.ord_date),
            "ORD_ITMAVER": 0,
            "ORD_QTY": 0,
            "YEAR": "2000",
            "DELIVEREDQTY": 0,
            "ORDERDQTY": 0,
            "LOCATION_CODE": sett["DEFAULT_LOCATION"],
            "ORD_COST_PRICE": "cst",
            "STRA": sett["DEFAULT_STORE"]

        };

        // update control data to the model local data and then updates all reqquired values.
        var custName = Util.getSQLValue("select name from c_ycust where code=" + Util.quoted(UtilGen.getControlValue(that.o1.ord_ref)));
        for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
            var vl = that.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
            that.qv.mLctb.setFieldValue(i, "ORD_ALLQTY", vl);
        }

        if (this.qryStrPO == "") {
            k = UtilGen.getSQLInsertString(this.o1, {
                "ord_code": this.vars.ord_code,
                "ord_flag": 1,
                "periodcode": Util.quoted(sett["CURRENT_PERIOD"]),
                "LOCATION_CODE": Util.quoted(sett["DEFAULT_LOCATION"]),
                "ORD_AMT": UtilGen.getControlValue(this.o2.ord_amt),
                "ORD_REFNM": Util.quoted(custName),
                "CREATED_BY": Util.quoted(sett["LOGON_USER"]),
                "CREATED_DATE": "sysdate",
                "STRA": sett["DEFAULT_STORE"]
            });
            k = "insert into order1 " + k + ";";
            var s1 = "";
            // sqls for insert string in order2 table.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                var sqt = "select nvl(max(ord_price*ORD_FC_rate),0) into cst "
                    + " from joined_order where ord_refer= :RFR and ord_rcptno= :RNO and ord_reference= :ON and ord_code=103;";
                //          " select nvl(sum(ord_allqty),0) into qnt from joined_order where ord_code=:COD "
                // " and ord_reference=:ON " +
                // " and ord_rcptno=:RNO;" +
                // "if qnt>0 then raise no_data_found; end if; ";

                sqt = sqt.replace(/:RFR/g, Util.quoted(that.qv.mLctb.getFieldValue(i, "ORD_REFER")));
                sqt = sqt.replace(/:RNO/g, Util.quoted(that.qv.mLctb.getFieldValue(i, "ORD_RCPTNO")));
                sqt = sqt.replace(/:COD/g, Util.quoted(that.vars.ord_code));
                sqt = sqt.replace(/:ON/g, that.qryStr);

                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
                defaultValues["PO_SR_NO"] = this.qv.mLctb.getFieldValue(i, "PO_SR_NO");

                s1 += (sqt + UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT"], defaultValues, true) + ";").replace(/'cst'/g, 'cst');
            }
            k = "declare cst number:=0; qnt number:=0; begin " + k + s1 + " end; ";
        } else {

            k = UtilGen.getSQLUpdateString(this.o1, "order1",
                {
                    "ORD_AMT": UtilGen.getControlValue(this.o2.ord_amt),
                    "ORD_REFNM": Util.quoted(custName),
                    "MODIFIED_BY": Util.quoted(sett["LOGON_USER"]),
                    "MODIFIED_DATE": "sysdate",
                    "STRA": sett["DEFAULT_STORE"]

                },
                "ord_code=" + Util.quoted(this.vars.ord_code) + " and  ord_no=" + Util.quoted(this.qryStrPO)) + ";";

            var s1 = "delete from order2 where ord_code=" + this.vars.ord_code + " and ord_no=" + this.qryStrPO + ";";  // sqls for insert string in order2 table.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                var sqt = "select nvl(max(ord_price*ORD_FC_rate),0) into cst "
                    + " from joined_order where ord_refer= :RFR and ord_rcptno= :RNO and ord_reference= :ON and ord_code=103;";

                sqt = sqt.replace(/:RFR/g, Util.quoted(that.qv.mLctb.getFieldValue(i, "ORD_REFER")));
                sqt = sqt.replace(/:RNO/g, Util.quoted(that.qv.mLctb.getFieldValue(i, "ORD_RCPTNO")));
                sqt = sqt.replace(/:COD/g, Util.quoted(that.vars.ord_code));
                sqt = sqt.replace(/:ON/g, that.qryStr);

                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
                defaultValues["PO_SR_NO"] = this.qv.mLctb.getFieldValue(i, "PO_SR_NO");

                s1 += (sqt + UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT"], defaultValues, true) + ";").replace(/'cst'/g, 'cst');
            }
            k = "declare cst number:=0; qnt number:=0; begin " + k + s1 + " end; ";
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
            that.pgDN.backFunction();
        });

    },
    // summary of the table, generally called from database VALIDATE_EVENT triggers on table.
    do_summary: function (reAmt) {
        var that = this;
        reamt = Util.nvl(reAmt, false); // re calculate amount if require.
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var tbl = that.qv.getControl();
        if (reamt)
            for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
                var pr = parseFloat(Util.getCellColValue(tbl, i, 'ORD_PRICE').replace(/[^\d\.]/g, ''));
                var qt = parseFloat(Util.getCellColValue(tbl, i, 'ORD_PKQTY').replace(/[^\d\.]/g, ''));
                var pk = parseFloat(Util.getCellColValue(tbl, i, 'ORD_PACK'));
                var rate = parseFloat(Util.getCellColValue(tbl, i, 'ORD_FC_RATE'));
                var amt = pr * qt;
                Util.setCellColValue(tbl, i, "AMOUNT", df.format(amt));
                Util.setCellColValue(tbl, i, "LC_AMOUNT", df.format(amt * rate));
            }
        this.qv.updateDataToTable();
        var cl = that.qv.mLctb.getColByName("AMOUNT");
        var sum = 0, sumc = 0;
        for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
            var val = that.qv.mLctb.getFieldValue(i, "AMOUNT");
            var valc = that.qv.mLctb.getFieldValue(i, "LC_AMOUNT");
            df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
            val = parseFloat(df.formatBack(val));
            sum += val;
            valc = parseFloat(df.formatBack(valc));
            sumc += valc;

        }
        UtilGen.setControlValue(that.o2.ord_amt_lc, sum, sum, true);
        UtilGen.setControlValue(that.o2.ord_amt, sumc, sumc, true);
    }
    ,
    delete_data: function () {
        var that = this;
        if (that.qryStrPO == "")
            return;

        sap.m.MessageBox.confirm("Are you sure to DELETE this PO : ?  " + UtilGen.getControlValue(that.o1.ord_no), {
            title: "Confirm",                                    // default
            onClose: function (oAction) {
                if (oAction == sap.m.MessageBox.Action.OK) {
                    var flg = Util.getSQLValue("select ord_flag from  order1 where ord_code=" +
                        that.vars.ord_code + " and ord_no=" + UtilGen.getControlValue(that.o1.ord_no));
                    if (flg == 2) {
                        sap.m.MessageToast.show("POSTED already !");
                        return;
                    }
                    var sq = "begin " +
                        "delete from order1 where ord_code=:ord_code and ord_no=:ord_no; " +
                        "delete from order2 where ord_code=:ord_code and ord_no=:ord_no; " +
                        "end;";

                    sq = sq.replace(/:ord_code/g, that.vars.ord_code);
                    sq = sq.replace(/:ord_no/g, UtilGen.getControlValue(that.o1.ord_no));
                    var dat = Util.execSQL(sq);
                    if (dat.ret == "SUCCESS") {
                        sap.m.MessageToast.show("Deleted....!");
                        that.pgDN.backFunction();
                    }
                }
            },                                       // default
            styleClass: "",                                      // default
            initialFocus: null,                                  // default
            textDirection: sap.ui.core.TextDirection.Inherit     // default
        });
    },
    createScrollCmds: function (tb) {
        var that = this;
        var view = this.view;
        var sl = this.oController.selectedReq; // no of row selected
        var current = sl.indexOf(this.qryStrPO);
        (this.view.byId("poCmdNext") != undefined ? this.view.byId("poCmdNext").destroy() : null);
        (this.view.byId("poCmdPrior") != undefined ? this.view.byId("poCmdPrior").destroy() : null);
        if (sl.length > 1) {
            tb.addContent(
                new sap.m.Button(view.createId("poCmdPrior"), {
                    icon: "sap-icon://arrow-left",
                    press: function () {
                        if (current <= 0) {
                            this.setEnabled(false);
                            return;
                        }
                        that.qryStrPO = sl[--current];
                        that.loadData();
                        view.byId("poCmdNext").setEnabled(true);
                    }
                }));
            tb.addContent(
                new sap.m.Button(view.createId("poCmdNext"), {
                    icon: "sap-icon://arrow-right",
                    press: function () {
                        if (current >= sl.length - 1) {
                            this.setEnabled(false);
                            return;
                        }
                        that.qryStrPO = sl[++current];
                        that.loadData();
                        view.byId("poCmdPrior").setEnabled(true);
                    }
                }));
        }
    },
    showFRDE: function () {
        var that = this;
        var view = this.view;
        var flx = new sap.m.VBox({alignItems: sap.m.FlexAlignItems.Center, height: "100%"});
        flx.addItem(new sap.m.Title({text: "Kind of Invoice FR De "}).addStyleClass("sapUiMediumMargin"));
        flx.addItem(new sap.m.HBox({
            items:
                [
                    new sap.m.Button({
                        text: "FR", press: function () {
                            UtilGen.setControlValue(that.o1.oname, "FR", "FR", true);
                            that.setItemSql();
                            view.byId("poDlgFrDe").close();

                        }
                    }).addStyleClass("sapUiMediumMarginBegin sapUiMediumMarginEnd"),
                    new sap.m.Button({
                        text: "DE", press: function () {
                            UtilGen.setControlValue(that.o1.oname, "DE", "DE", true);
                            that.setItemSql();
                            view.byId("poDlgFrDe").close();
                        }
                    }).addStyleClass("sapUiMediumMarginBegin sapUiMediumMarginEnd")
                ]
        }));

        (this.view.byId("poDlgFrDe") != undefined ? this.view.byId("poDlgFrDe").destroy() : null);
        var dlg = new sap.m.Dialog(view.createId("poDlgFrDe"), {
            title: "Select the kind of PO",
            contentWidth: "300px",
            contentHeight: "150px",
            content: [flx]
        });
        dlg.open();
    },
    setItemSql: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var cod = (UtilGen.getControlValue(this.o1.oname) == "DE" ? "0101" : "0102");

        var sql = "select cost_item,replace(selling_descr,chr(9),'') descr,items.descr cost_item_descr,"
            + " fc_price,fc_rate,fc_descr,lg_custitems.keyfld from "
            + "lg_custitems,items where items.reference=cost_item and"
            + " code='" + UtilGen.getControlValue(this.o1.ord_ref)
            + "' and descr2 like (select descr2||'%' from items where reference=" + Util.quoted(cod)
            + ") order by cost_item,type_of_frieght";

        that.qv.mLctb.getColByName("ORD_REFER").mSearchSQL = sql;
    },
    add_items: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var cod = (UtilGen.getControlValue(this.o1.oname) == "DE" ? "0102" : "0101");

        var sql = "select cost_item,items.descr cost_item_descr,"
            + " selling_descr,fc_price,fc_rate,fc_descr,lg_custitems.keyfld from "
            + "lg_custitems,items where items.reference=cost_item and "
            + " code="
            + Util.quoted(UtilGen.getControlValue(that.o1.ord_ref))
            + " and descr2 like (select descr2||'%' from items where reference='"
            + cod + "') order by cost_item";

        // on selection of record function to pass show_list
        var fnOnSelect = function (data) {
            console.log(data);
            that.qv.updateDataToTable();
            var ld = that.qv.mLctb;

            var itms = []; // selected items in list and remove if not avaialble.
            // put all item and rcpt in one array
            for (var i in data) {
                itms.push(data[i].COST_ITEM + "-" + data[i].SELLING_DESCR);
                var fnd_r = ld.findInJoin(["ORD_REFER", "DESCR"], data[i].COST_ITEM + data[i].SELLING_DESCR);
                if (fnd_r > -1)
                    continue;
                var idx = ld.rows.length - 1;
                if (Util.nvl(ld.getFieldValue(idx, "ORD_REFER"), "") != "")
                    idx = ld.addRow();

                ld.setFieldValue(idx, "ORD_REFER", data[i].COST_ITEM);
                ld.setFieldValue(idx, "DESCR", data[i].SELLING_DESCR);
                ld.setFieldValue(idx, "ORD_RCPTNO", data[i].RCPT_NO);
                ld.setFieldValue(idx, "ORD_PRICE", data[i].FC_PRICE);
                ld.setFieldValue(idx, "ORD_FC_RATE", data[i].FC_RATE);
                ld.setFieldValue(idx, "ORD_FC_DESCR", data[i].FC_DESCR);
            }
            var ritms = []; // removable rows
            for (var i = ld.rows.length - 1; i > -1; i--) {
                var tmp = ld.getFieldValue(i, "ORD_REFER") + "-" + ld.getFieldValue(i, "DESCR");
                if (itms.indexOf(tmp) == -1)
                    ritms.push(i);
            }
            for (var i = 0; i < ritms.length; i++)
                ld.deleteRow(ritms[i]);
            for (var i = ld.rows.length - 1; i > -1; i--)
                ld.setFieldValue(i, "ORD_POS", i + 1);

            that.qv.updateDataToControl();
            that.do_summary(true);
            return true;
        };

        // after display show selected record.
        var fnOnDisplay = function (qv) {
            that.qv.updateDataToTable();
            var ld1 = that.qv.mLctb;
            var rfrs = [];
            for (var j = 0; j < ld1.rows.length; j++)
                rfrs.push(ld1.getFieldValue(j, "ORD_REFER") + "-" + ld1.getFieldValue(j, "DESCR"));

            var ld = qv.mLctb;
            qv.getControl().clearSelection();
            for (var i = 0; i < ld.rows.length; i++)
                if (rfrs.indexOf(ld.getFieldValue(i, "COST_ITEM") + "-" + ld.getFieldValue(i, "SELLING_DESCR")) > -1)
                    qv.getControl().addSelectionInterval(i, i);
        };

        Util.show_list(sql, undefined, undefined, fnOnSelect, "100%", "100%", 10, true, fnOnDisplay);
    }
})
;



