sap.ui.jsfragment("bin.forms.press.Invoice", {

    createContent: function (oController) {
        var that = this;
        jQuery.sap.require("sap.m.MessageBox");

        this.view = oController.getView();
        this.qryStr = oController.qryStr;
        this.qryStrON = oController.qryStrON;
        this.pgPO = new sap.m.Page({
            showHeader: false
        });
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 111,
            pur_keyfld: -1,
            pur_and_srv: 'N',
            pur_inv_no: -1
        };
        this.o1 = {};
        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.pgPO.backFunction();
            }
        });
        this.createView();
        this.loadData();
        return this.pgPO;
    },

    createView: function () {
        var that = this;
        var view = this.view;
        UtilGen.clearPage(this.pgPO);
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


        this.qv.onAddRow = function (idx, ld) {
            // var fc_main_rate = UtilGen.getControlValue(that.o1.ord_fc_main_rate);
            // var fc_main_descr = UtilGen.getControlValue(that.o1.ord_fc_main_descr);
            // ld.setFieldValue(idx, "FC_MAIN_DESCR", fc_main_descr);
            // ld.setFieldValue(idx, "FC_MAIN_RATE", fc_main_rate);
        };

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
        this.frm.getToolbar().addContent(new sap.m.Title({text: "Sales Order Request"}));


        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);

        sc.addContent(new sap.m.Button({
            icon: "sap-icon://add-activity", press: function () {
                that.add_items();
            }
        }));
        sc.addContent(this.qv.getControl());
        this.pgPO.addContent(sc);
        this.createViewFooter(sc);

        setTimeout(function () {
            $($(".sapUiFormResGrid , .sapUiFormToolbar")[0]).addClass("greyTB");
            $(".sapUiFormResGrid , .sapUiFormToolbar").addClass("greyTB")
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
            }, "number", sett["FORMAT_MONEY_1"]);

        var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
        frm.setToolbar(undefined);
        frm.destroyToolbar();
        sc.addContent(frm);
    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        // showing proforma invoice if selected ....

        this.o1.ord_no = this.addControl(fe, "Order No", sap.m.Input, "poOrdNo",
            {layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})}, "number")
        this.o1.ord_date = this.addControl(fe, "@Date", sap.m.DatePicker, "poOrdDate",
            {
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"}),
            }, "date");
        // this.o1.ord_reference = this.addControl(fe, "@JO No", sap.m.Input, "poJOOrdNo",
        //     {layoutData: new sap.ui.layout.GridData({span: "XL1 L1 M1 S12"}), enabled: false}, "number");

        this.o1.ord_reference = this.addControl(fe, "@JO # ", sap.m.Input, "poOrdReference",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL1 L1 M1 S12"}),
            }, "number");

        this.o1.ord_ref = this.addControl(fe, "Supplier", sap.m.SearchField, "poSupplier",
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
        this.o1.payterm = this.addControl(fe, "Remarks", sap.m.Input, "poRemarks",
            {enabled: true}, "string");
        this.o1.attn = this.addControl(fe, "@Inv Ref #", sap.m.Input, "poinvref",
            {enabled: true}, "string");
        // this.o1.ord_fc_main_descr = this.addControl(fe, "Main Currency", sap.m.Input, "socurrency",
        //     {editable: false}, "string");
        // this.o1.ord_fc_main_rate = this.addControl(fe, "@Rate", sap.m.Input, "socurrRate",
        //     {editable: false}, "number");

        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);


    },
    loadData: function () {
        var view = this.view;
        var that = this;
        this.vars.pur_and_srv = 'N';
        this.vars.pur_keyfld = -1;
        this.vars.pur_inv_no = -1;

        this.view.byId("poMsgInv").setText("");
        this.view.byId("poCmdSave").setEnabled(true);
        this.view.byId("poCmdDel").setEnabled(true);
        this.o1.ord_ref.setEnabled(false);

        if (this.qryStrON == "") {
            var on = Util.getSQLValue("select nvl(max(ord_no),0)+1 from order1 where ord_code=" + this.vars.ord_code);
            UtilGen.setControlValue(this.o1.ord_no, on);
            UtilGen.setControlValue(this.o1.ord_date, new Date());
            UtilGen.setControlValue(this.o1.ord_reference, this.qryStr, false);
            this.o1.ord_no.setEnabled(true);
            var dt = Util.execSQL("select ord_ref,ord_refnm from order1 where ord_code=601 and ord_no=" + Util.quoted(this.qryStr));
            if (dt.ret == "SUCCESS") {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.setControlValue(this.o1.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
            }

        }
        else {
            var dt = Util.execSQL("select *from order1 where ord_code=" + this.vars.ord_code + " and ord_no=" + Util.quoted(this.qryStrON));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.loadDataFromJson(this.o1, dtx[0], true);
                this.o1.ord_no.setEnabled(false);
                UtilGen.setControlValue(this.o1.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                if (dtx[0].ORD_FLAG == 2) {
                    this.view.byId("poMsgInv").setText("INVOICE IS POSTED !");
                    this.view.byId("poCmdSave").setEnabled(false);
                    this.view.byId("poCmdDel").setEnabled(false);
                }
            }
        }

        this.loadData_details();
    }


    ,
    loadData_details: function () {
        var that = this;
        var sq = "select order2.*, ((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY amount," +
            "(((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY)*ord_fc_rate lc_amount " +
            " from order2 where ord_no="
            + Util.quoted(this.qryStrON)
            + " and ord_code="
            + this.vars.ord_code
            + " order by ord_pos";
        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                UtilGen.applyCols("C6P.SO1", that.qv, that);
                that.qv.mLctb.parse("{" + data.data + "}", true);
                if (that.qv.mLctb.rows.length == 0)
                    that.qv.addRow();
                that.qv.loadData();
                that.do_summary(true);
                // that.setItemSql();
            }
        });
    }
    ,
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
    }
    ,
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
            var rn = Util.nvl(that.qv.mLctb.getFieldValue(i, "DESCR"), "");
            var rn1 = Util.nvl(that.qv.mLctb.getFieldValue(i, "ORD_REFER"), "");
            var qtySold = Util.nvl(that.qv.mLctb.getFieldValue(i, "ORD_PKQTY"), "");

            if (rn == "") {
                sap.m.MessageToast.show("Must  DESCR/ITEM  have value .. !");
                return false;
            }
            cnts[rn] = Util.nvl(cnts[rn], 0) + 1;
            if (cnts[rn] > 1) {
                sap.m.MessageToast.show("Must have Unique value for Item # " + rn);
                return false;
            }
            var rcp = Util.getSQLValue("select sum(ORDEREDQTY-ISSUED_QTY) from joined_order where ord_code=601 " +
                " and ord_no=" + that.qryStr +
                " and DESCR=" + Util.quoted(rn));
            if (rcp - qtySold < 0) {
                sap.m.MessageToast.show("ITEM # " + rn + " , Already SOLD..");
                return false;
            }
            var rcp = Util.getSQLValue("select (ord_allqty) from joined_order where ord_code in(" + that.vars.ord_code + ") " +
                " and ord_reference=" + that.qryStr + " and ord_no!=" + Util.quoted(Util.nvl(that.qryStrON, "-.1")) +
                " and ord_flag=1 and DESCR=" + Util.quoted(rn));
            if (rcp > 0) {
                sap.m.MessageToast.show("Receipt # " + rn + " , Already SOLD in UN-POSTED....");
                return false;
            }
        }
        return true;
    }
    ,
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
            // "ORD_QTY": 0,
            "YEAR": "2000",
            "DELIVEREDQTY": 0,
            "ORDEREDQTY": 0,
            "LOCATION_CODE": sett["DEFAULT_LOCATION"],
            "ORD_COST_PRICE": 0,
        };

        // update control data to the model local data and then updates all reqquired values.
        var custName = Util.getSQLValue("select name from c_ycust where code=" + Util.quoted(UtilGen.getControlValue(that.o1.ord_ref)));
        for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
            var vl = that.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
            that.qv.mLctb.setFieldValue(i, "ORD_ALLQTY", vl);
        }

        if (this.qryStrON == "") {
            k = UtilGen.getSQLInsertString(this.o1, {
                "ord_code": this.vars.ord_code,
                "ord_flag": 1,
                "periodcode": Util.quoted(sett["CURRENT_PERIOD"]),
                "LOCATION_CODE": Util.quoted(sett["DEFAULT_LOCATION"]),
                "ORD_AMT": 0,
                "ORD_REFNM": Util.quoted(custName),
                "CREATED_BY": Util.quoted(sett["LOGON_USER"]),
                "CREATED_DATE": "sysdate",
                "STRA": sett["DEFAULT_STORE"]
            }, []);
            k = "insert into order1 " + k + ";";
            var s1 = "";
            // sqls for insert string in order2 table.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                defaultValues["ORD_PRICE"] = this.qv.mLctb.getFieldValue(i, "FC_PRICE");
                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");

                s1 += (UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT"], defaultValues, true) + ";");
            }
            k = "begin " + k + s1 + " end; ";
        } else {
            k = UtilGen.getSQLUpdateString(this.o1, "order1",
                {
                    "ORD_AMT": 0,
                    "ORD_REFNM": Util.quoted(custName),
                    "MODIFIED_BY": Util.quoted(sett["LOGON_USER"]),
                    "MODIFIED_DATE": "sysdate",
                    "STRA": sett["DEFAULT_STORE"],
                    "ORD_REFERENCE": Util.quoted(this.qryStr)

                },
                "ord_code=" + Util.quoted(this.vars.ord_code) + " and  ord_no=" + Util.quoted(this.qryStrON)) + ";";

            var s1 = "delete from order2 where ord_code=" + this.vars.ord_code + " and ord_no=" + this.qryStrON + ";";  // sqls for insert string in order2 table.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                defaultValues["ORD_PRICE"] = this.qv.mLctb.getFieldValue(i, "FC_PRICE");
                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");

                s1 += (UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT"], defaultValues, true) + ";");
            }
            k = "begin " + k + s1 + " end; ";
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
            that.pgPO.backFunction();
        });

    }
    ,
// summary of the table, generally called from database VALIDATE_EVENT triggers on table.
    do_summary: function (reAmt) {
        var that = this;
        reamt = Util.nvl(reAmt, false); // re calculate amount if require.
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var tbl = that.qv.getControl();
        if (reamt)
            for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
                var pr = parseFloat((Util.getCellColValue(tbl, i, 'FC_PRICE')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
                var qt = parseFloat((Util.getCellColValue(tbl, i, 'ORD_PKQTY')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
                var pk = parseFloat(Util.nvl(Util.getCellColValue(tbl, i, 'ORD_PACK'), 1));
                var rate = parseFloat(Util.nvl(Util.getCellColValue(tbl, i, 'ORD_FC_RATE'), 1));
                var amt = pr * (qt / pk);
                Util.setCellColValue(tbl, i, "AMOUNT", df.format(amt));
                Util.setCellColValue(tbl, i, "LC_AMOUNT", df.format(amt * rate));
            }
        this.qv.updateDataToTable();
        var sum = 0, sumc = 0;
        var ld = that.qv.mLctb;
        for (var i = 0; i < ld.rows.length; i++) {
            ld.setFieldValue(i, "ORD_FC_RATE", 1);
            var val = that.qv.mLctb.getFieldValue(i, "AMOUNT");
            var valc = that.qv.mLctb.getFieldValue(i, "LC_AMOUNT");
            df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
            val = parseFloat(df.formatBack(val));
            sum += val;
            valc = parseFloat(df.formatBack(valc));
            sumc += valc;
            var pr = ld.getFieldValue(i, "FC_PRICE");
            var rate = ld.getFieldValue(i, "ORD_FC_RATE");
            var vp = pr * rate;

            that.qv.mLctb.setFieldValue(i, "ORD_PRICE", vp);
        }
        // UtilGen.setControlValue(that.o2.ord_amt_lc, sum, sum, true);
        UtilGen.setControlValue(that.o2.ord_amt, sumc, sumc, true);
    }
    ,
    delete_data: function () {
        var that = this;
        if (that.qryStrON == "")
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
                        that.pgPO.backFunction();
                    }
                }
            },                                       // default
            styleClass: "",                                      // default
            initialFocus: null,                                  // default
            textDirection: sap.ui.core.TextDirection.Inherit     // default
        });
    }
    ,
    createScrollCmds: function (tb) {
        var that = this;
        var view = this.view;
        var sl = this.oController.selectedReq; // no of row selected
        var current = sl.indexOf(this.qryStrON);
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
                        that.qryStrON = sl[--current];
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
                        that.qryStrON = sl[++current];
                        that.loadData();
                        view.byId("poCmdPrior").setEnabled(true);
                    }
                }));
        }
    }
    ,
    add_items: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sql = "SELECT ORD_REFER,DESCR,ORD_PACKD,ORDEREDQTY/ORD_PACK ORD_QTY," +
            " ISSUED_QTY/ORD_PACK SOLD_QTY, (ORDEREDQTY-issued_qty)/ORD_PACK DUE_QTY ,ORD_PRICE " +
            " FROM ORDER2 WHERE ORDEREDQTY-ISSUED_QTY>0  AND " +
            " ORD_CODE=601 AND ORD_NO=" + Util.quoted(that.qryStr);
        var itms = []; // selected items in list and remove if not avaialble.
        // put all item and DESCR in one array
        var fnOnSelect = function (data) {
            console.log(data);
            that.qv.updateDataToTable();
            var ld = that.qv.mLctb;

            for (var i in data) {
                itms.push(data[i].DESCR);
                var fnd_r = ld.findInJoin(["DESCR"], data[i].DESCR);
                if (fnd_r > -1)
                    continue;
                var idx = ld.rows.length - 1;
                if (Util.nvl(ld.getFieldValue(idx, "ORD_REFER"), "") != "")
                    idx = ld.addRow();

                ld.setFieldValue(idx, "ORD_REFER", data[i].ORD_REFER);
                ld.setFieldValue(idx, "DESCR", data[i].DESCR);
                ld.setFieldValue(idx, "ORD_PACKD", data[i].ORD_PACKD);
                ld.setFieldValue(idx, "ORD_PKQTY", data[i].DUE_QTY);
                ld.setFieldValue(idx, "FC_PRICE", data[i].ORD_PRICE);

            }

            var ritms = []; // removable rows
            for (var i = ld.rows.length - 1; i > -1; i--) {
                var tmp = ld.getFieldValue(i, "DESCR");
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
                rfrs.push(ld1.getFieldValue(j, "DESCR"));

            var ld = qv.mLctb;
            qv.getControl().clearSelection();
            var sl = qv.getControl().getSelectedIndices();
            for (var i = 0; i < ld.rows.length; i++)
                if (rfrs.indexOf(ld.getFieldValue(i, "DESCR")) > -1)
                    qv.getControl().addSelectionInterval(i, i);
        };

        Util.show_list(sql, undefined, undefined, fnOnSelect, "100%", "100%", 10, true, fnOnDisplay);

    }
})
;



