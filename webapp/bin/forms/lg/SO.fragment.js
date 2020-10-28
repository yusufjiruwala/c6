sap.ui.jsfragment("bin.forms.lg.SO", {

    createContent: function (oController) {
        var that = this;
        jQuery.sap.require("sap.m.MessageBox");

        this.view = oController.getView();
        this.qryStr = oController.qryStr;
        this.qryStrPO = oController.qryStrPO;
        this.qryStrSP = Util.nvl(oController.qryStrSP, "");
        this.pgPO = new sap.m.Page({
            showHeader: false
        });
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 111,
            pur_keyfld: -1,
            pur_and_srv: 'N',
            pur_inv_no: -1,
            vat_p: 5
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
            var fc_main_rate = UtilGen.getControlValue(that.o1.ord_fc_main_rate);
            var fc_main_descr = UtilGen.getControlValue(that.o1.ord_fc_main_descr);
            ld.setFieldValue(idx, "FC_MAIN_DESCR", fc_main_descr);
            ld.setFieldValue(idx, "FC_MAIN_RATE", fc_main_rate);
            ld.setFieldValue(idx, "VAT_P", 0);
            ld.setFieldValue(idx, "VAT_ADD", 0);
            ld.setFieldValue(idx, "NET_LC", 0);
            ld.setFieldValue(idx, "NET_FC", 0);
        };
        this.qv.afterDelRow = function (idx, ld) {
            that.do_summary(false);
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

        sc.addContent(new sap.m.Button({
            icon: "sap-icon://add", press: function () {
                that.qv.addRow();
            }
        }));
        sc.addContent(new sap.m.Button({
            icon: "sap-icon://sys-minus", press: function () {
                if (that.qv.getControl().getSelectedIndices().length == 0) {
                    sap.m.MessageToast.show("Select a row to delete. !");
                    return;
                }

                var r = that.qv.getControl().getSelectedIndices()[0] + that.qv.getControl().getFirstVisibleRow();
                that.qv.deleteRow(r);
                that.do_summary(false);

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
        this.o2.ord_amt_lc = this.addControl(fe, "@Amount", sap.m.Input, "poOrdAmtLc",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"]);

        this.o2.tot_vat_p = this.addControl(fe, "VAT %", sap.m.Input, "poOrdTotVatP",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"]);

        this.o2.tot_vat_amt = this.addControl(fe, "@VAT Amount", sap.m.Input, "poOrdTotVatAmt",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"]);
        this.o2.netlcamt = this.addControl(fe, "Net Amt LC", sap.m.Input, "poOrdnetAmtLc",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"]);
        this.o2.netfcamt = this.addControl(fe, "@Net Amt FC", sap.m.Input, "poOrdnetAmtFc",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"]);


        this.o2._label = this.addControl(fe, " ", sap.m.Text, "poLbl1",
            {
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "string");

        this.o2.netfcamt.addStyleClass("yellow");
        this.o2.netlcamt.addStyleClass("yellow");
        var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
        frm.setToolbar(undefined);
        frm.destroyToolbar();
        sc.addContent(frm);
    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        this.o1.oname = this.addControl(fe, "Type", sap.m.Input, "pofrde",
            {enabled: false}, "string");
        // showing proforma invoice if selected ....
        if (Util.nvl(this.qryStrSP, "") != "") {
            this.o1.prof_ord_no = this.addControl(fe, "@Proforma # ", sap.m.Input, "poproforma",
                {editable: false}, "string");
            setTimeout(function () {
                that.o1.prof_ord_no.$("inner").addClass("redText");
            }, 1000);
        }

        this.o1.ord_no = this.addControl(fe, "Order No", sap.m.Input, "poOrdNo",
            {layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})}, "number")
        this.o1.ord_date = this.addControl(fe, "@Date", sap.m.DatePicker, "poOrdDate",
            {
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"}),
                change: function () {
                    that.changeCurrency();
                }
            }, "date");
        // this.o1.ord_reference = this.addControl(fe, "@JO No", sap.m.Input, "poJOOrdNo",
        //     {layoutData: new sap.ui.layout.GridData({span: "XL1 L1 M1 S12"}), enabled: false}, "number");

        this.o1._jo_complete = this.addControl(fe, "@JO No", sap.m.Input, "dnOrdComNo",
            {
                layoutData: new sap.ui.layout.GridData({span: "XL1 L1 M1 S12"}),
                enabled: false,
            }, "string");

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
                        var r = Util.getSQLValue("select MAIN_CURRENCY from c_ycust where code=" + Util.quoted(valx));
                        UtilGen.setControlValue(that.o1.ord_fc_main_descr, r);
                        that.changeCurrency();
                    });

                }
            }, "string");
        this.o1.payterm = this.addControl(fe, "Remarks", sap.m.Input, "poRemarks",
            {enabled: true}, "string");
        this.o1.attn = this.addControl(fe, "@Inv Ref #", sap.m.Input, "poinvref",
            {enabled: true}, "string");
        this.o1.ord_fc_main_descr = this.addControl(fe, "Main Currency", sap.m.Input, "socurrency",
            {editable: false}, "string");
        this.o1.ord_fc_main_rate = this.addControl(fe, "@Rate", sap.m.Input, "socurrRate",
            {editable: false}, "number");

        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);


    },
    loadData: function () {
        var view = this.view;
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.vars.pur_and_srv = 'N';
        this.vars.pur_keyfld = -1;
        this.vars.pur_inv_no = -1;

        UtilGen.setControlValue(this.o1.oname, "FR", "FR", true);
        this.view.byId("poMsgInv").setText("");
        this.view.byId("poCmdSave").setEnabled(true);
        this.view.byId("poCmdDel").setEnabled(true);
        this.o1.ord_ref.setEnabled(false);

        if (Util.nvl(this.qryStrSP, "") != "") {
            this.loadDataSP();
            return;

        }
        if (this.qryStrPO == "") {
            this.vars.vat_p = parseFloat(Util.nvl(sett["LG_VAT_P"], "0"));
            this.showFRDE();
            var on = Util.getSQLValue("select nvl(max(ord_no),0)+1 from order1 where ord_code=" + this.vars.ord_code);
            UtilGen.setControlValue(this.o1.ord_no, on);
            UtilGen.setControlValue(this.o1.ord_date, new Date());
            // UtilGen.setControlValue(this.o1.ord_reference, this.qryStr, false);
            UtilGen.setControlValue(this.o1._jo_complete, Util.getSQLValue("select oname from order1 where ord_no=" + this.qryStr + " and ord_code=106"));
            this.o1.ord_no.setEnabled(true);
            var dt = Util.execSQL("select ord_ref,ord_refnm from order1 where ord_code=106 and ord_no=" + Util.quoted(this.qryStr));
            if (dt.ret == "SUCCESS") {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.setControlValue(this.o1.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                var r = Util.getSQLValue("select MAIN_CURRENCY from c_ycust where code=" + Util.quoted(UtilGen.getControlValue(that.o1.ord_ref)));
                UtilGen.setControlValue(that.o1.ord_fc_main_descr, r);
                that.changeCurrency();

            }

        }
        else {
            var dt = Util.execSQL("select *from order1 where ord_code=" + this.vars.ord_code + " and ord_no=" + Util.quoted(this.qryStrPO));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                this.vars.vat_p = parseFloat(Util.nvl(sett["LG_VAT_P"], "0"));
                this.qryStrSP = "";
                if (dtx[0].PROF_ORD_NO != 0 || dtx[0].PROF_ORD_NO != "") {
                    this.qryStrSP = dtx[0].PROF_ORD_NO;
                    that.loadDataSP();
                } else {
                    UtilGen.loadDataFromJson(this.o1, dtx[0], true);
                    this.o1.ord_no.setEnabled(false);
                    UtilGen.setControlValue(this.o1.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                    this.vars.pur_and_srv = dtx[0].PUR_AND_SRV;
                    this.vars.pur_keyfld = dtx[0].PUR_KEYFLD;
                    UtilGen.setControlValue(this.o1._jo_complete, Util.getSQLValue("select oname from order1 where ord_no=" + this.qryStr + " and ord_code=106"));
                }

            }
        }
        this.view.byId("poMsgInv").setText(" JO # " + UtilGen.getControlValue(this.o1._jo_complete));

        if (Util.nvl(this.qryStrSP, "") == "") {
            this.loadData_details();

            if (Util.nvl(this.vars.pur_keyfld, -1) != -1 && this.vars.pur_keyfld != 0) {
                this.vars.pur_inv_no = Util.getSQLValue("select invoice_no from pur1 where keyfld=" + this.vars.pur_keyfld);
                this.view.byId("poMsgInv").setText("Invoiced # " + this.vars.pur_inv_no + " JO # " + UtilGen.getControlValue(this.o1._jo_complete));
                this.qv.getControl().setEditable(false);
                this.frm.setEditable(false);
                this.view.byId("poCmdSave").setEnabled(false);
                this.view.byId("poCmdDel").setEnabled(false);


            }
        }

    }
    ,
    loadData_details: function () {
        var that = this;
        var sq = "select order2.*,'' descr2, 0 discp,((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY amount," +
            "(((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY)*ord_fc_rate lc_amount , " +
            " (((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY) +vat_add NET_FC,   " +
            " ((((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY)*ord_fc_rate) + (vat_add*ord_fc_rate) NET_LC   " +
            " from order2 where ord_no="
            + Util.quoted(this.qryStrPO)
            + " and ord_code="
            + this.vars.ord_code
            + " order by ord_pos";
        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                UtilGen.applyCols("C6LGREQ.SO1", that.qv, that);
                that.qv.mLctb.parse("{" + data.data + "}", true);
                if (that.qv.mLctb.rows.length == 0)
                    that.qv.addRow();
                var c = that.qv.mLctb.getColPos("ORD_REFER");
                that.qv.mLctb.cols[c].beforeSearchEvent = function (sq, ctx, model) {
                    var rfr = model.getProperty(ctx.sPath + "/ORD_REFER");

                    var s = sq.replace("where", " where cost_item= " + Util.quoted(rfr) + " and ");
                    return s;
                };
                that.qv.loadData();
                that.do_summary(true);
                that.setItemSql();

            }
        });
    },
    loadDataSP: function () {
        var that = this;

        if (Util.nvl(this.qryStrSP, "") == "")
            return;
        var sq = "";
        if (that.qryStrPO == "") {
            UtilGen.setControlValue(this.o1.prof_ord_no, this.qryStrSP);
            UtilGen.setControlValue(this.o1.ord_no, this.qryStrSP);
            var on = Util.getSQLValue("select nvl(max(ord_no),0)+1 from order1 where ord_code=" + this.vars.ord_code);
            UtilGen.setControlValue(this.o1.ord_no, on);
            UtilGen.setControlValue(this.o1.ord_date, new Date());
            UtilGen.setControlValue(this.o1.ord_reference, this.qryStr, false);
            this.o1.ord_no.setEnabled(true);
            var dt = Util.execSQL("select ord_ref,ord_refnm from order1 where ord_code=106 and ord_no=" + Util.quoted(this.qryStr));
            if (dt.ret == "SUCCESS") {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.setControlValue(this.o1.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                var r = Util.getSQLValue("select MAIN_CURRENCY from c_ycust where code=" + Util.quoted(UtilGen.getControlValue(that.o1.ord_ref)));
                UtilGen.setControlValue(that.o1.ord_fc_main_descr, r);
                that.changeCurrency();

            }

            var ty = Util.getSQLValue("select oname from order1 where ord_code=141 and ord_no=" + this.qryStrSP);
            UtilGen.setControlValue(this.o1.oname, ty, ty, true);

            sq = "select order2.*,'' descr2, 0 discp,((ORD_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY amount," +
                "(((ORD_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY)*ord_fc_rate lc_amount" +
                " from order2 where ord_no="
                + Util.quoted(this.qryStrSP)
                + " and ord_code="
                + 141
                + " order by ord_pos";

        } else {

            // var dt = Util.execSQL("select *from order1 where ord_code=" + this.vars.ord_code + " and ord_no=" + Util.quoted(this.qryStrPO));
            // if (dt.ret = "SUCCESS" && dt.data.length > 0) {
            //     var dtx = JSON.parse("{" + dt.data + "}").data;
            //     this.qryStrSP = "";
            //     if (dtx[0].PROF_ORD_NO != 0 || dtx[0].PROF_ORD_NO != "") {
            //         this.qryStrSP = dtx[0].PROF_ORD_NO;
            //         that.loadDataSP();
            //     }
            //     UtilGen.loadDataFromJson(this.o1, dtx[0], true);
            //     this.o1.ord_no.setEnabled(false);
            //     UtilGen.setControlValue(this.o1.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
            //     this.vars.pur_and_srv = dtx[0].PUR_AND_SRV;
            //     this.vars.pur_keyfld = dtx[0].PUR_KEYFLD;
            //

            var dt = Util.execSQL("select *from order1 where ord_code=" + this.vars.ord_code + " and ord_no=" + Util.quoted(this.qryStrPO));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.loadDataFromJson(this.o1, dtx[0], false);
                this.o1.ord_no.setEnabled(false);
                UtilGen.setControlValue(this.o1.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                this.vars.pur_and_srv = dtx[0].PUR_AND_SRV;
                this.vars.pur_keyfld = dtx[0].PUR_KEYFLD;
                this.view.byId("poMsgInv").setText("Proforma # " + this.qryStrSP);

                sq = "select order2.*,'' descr2, 0 discp,((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY amount," +
                    "(((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY)*ord_fc_rate lc_amount" +
                    " from order2 where ord_no="
                    + Util.quoted(this.qryStrPO)
                    + " and ord_code="
                    + this.vars.ord_code
                    + " order by ord_pos";

            }
        }

        var data = Util.execSQL(sq);
        if (data.ret == "SUCCESS") {
            that.qv.setJsonStrMetaData("{" + data.data + "}");
            UtilGen.applyCols("C6LGREQ.SO2", that.qv);
            that.qv.mLctb.parse("{" + data.data + "}", true);
            that.qv.loadData();
            that.do_summary(true);
            that.updatePoSrNo();
        }
        if (Util.nvl(this.vars.pur_keyfld, -1) != -1 && this.vars.pur_keyfld != 0) {
            this.vars.pur_inv_no = Util.getSQLValue("select invoice_no from pur1 where keyfld=" + this.vars.pur_keyfld);
            var txt = this.view.byId("poMsgInv").getText() + ",";
            this.view.byId("poMsgInv").setText(txt + " Invoiced # " + this.vars.pur_inv_no);
            this.qv.getControl().setEditable(false);
            this.frm.setEditable(false);
            this.view.byId("poCmdSave").setEnabled(false);
            this.view.byId("poCmdDel").setEnabled(false);

        }

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
            var rn = Util.nvl(that.qv.mLctb.getFieldValue(i, "ORD_RCPTNO"), "");
            var rfr = Util.nvl(that.qv.mLctb.getFieldValue(i, "ORD_REFER"), "");

            if (rn == "") {
                sap.m.MessageToast.show("Must  Receipt No have value .. !");
                return false;
            }
            cnts[rn + "-" + rfr] = Util.nvl(cnts[rn + "-" + rfr], 0) + 1;
            if (cnts[rn + "-" + rfr] > 1) {
                sap.m.MessageToast.show("Must have Unique value for Receipt # " + rn + " , item # " + rfr);
                return false;
            }
            // check if recipt already sold and have not in qty in hand..
            var rcp = Util.getSQLValue("select (ord_allqty+saleret_qty)-(issued_qty+purret_qty) from joined_order where ord_code=103 " +
                " and ord_reference=" + that.qryStr +
                " and ord_rcptno=" + Util.quoted(rn) + " and ord_refer=" + Util.quoted(rfr));
            if (rcp <= 0) {
                sap.m.MessageToast.show("Receipt # " + rn + " ,Either not purchased or sold already !!!");
                return false;
            }
            // check if any unposted RCPT NO sold in this JO

            var rcp = Util.getSQLValue("select (ord_allqty) from joined_order where ord_code=" + that.vars.ord_code +
                " and ord_reference=" + that.qryStr + " and ord_no!=" + Util.quoted(Util.nvl(that.qryStrPO, "-.1")) +
                " and ord_flag=1 and ord_rcptno=" + Util.quoted(rn) + " and ord_refer=" + Util.quoted(rfr));
            if (rcp > 0) {
                sap.m.MessageToast.show("Receipt # " + rn + " , Already sold in UN-POSTED....!");
                return false;
            }


        }
        return that.updatePoSrNo();
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
            "YEAR": "2000",
            "DELIVEREDQTY": 0,
            "ORDEREDQTY": 0,
            "LOCATION_CODE": sett["DEFAULT_LOCATION"],
            "ORD_COST_PRICE": "cst"

        };

        // update control data to the model local data and then updates all reqquired values.
        var custName = Util.getSQLValue("select name from c_ycust where code=" + Util.quoted(UtilGen.getControlValue(that.o1.ord_ref)));
        for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
            var vl = that.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
            that.qv.mLctb.setFieldValue(i, "ORD_ALLQTY", vl);
        }
        var pa = Util.getSQLValue("select ord_prof_ac from order1 where ord_no=" + Util.quoted(Util.nvl(this.qryStrSP), "-1") + " and ord_code=141");
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
                "STRA": sett["DEFAULT_STORE"],
                "ORD_PROF_AC": Util.quoted(pa),
                "ORD_REFERENCE": Util.quoted(this.qryStr)
            });
            k = "insert into order1 " + k + ";";
            var s1 = "";
            // sqls for insert string in order2 table.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                var sqt = "select nvl(max(ord_price),0) into cst "
                    + " from joined_order where ord_refer= :RFR and ord_rcptno= :RNO and ord_reference= :ON and ord_code=103;";
                //          " select nvl(sum(ord_allqty),0) into qnt from joined_order where ord_code=:COD "
                // " and ord_reference=:ON " +
                // " and ord_rcptno=:RNO;" +
                // "if qnt>0 then raise no_data_found; end if; ";

                sqt = sqt.replace(/:RFR/g, Util.quoted(that.qv.mLctb.getFieldValue(i, "ORD_REFER")));
                sqt = sqt.replace(/:RNO/g, Util.quoted(that.qv.mLctb.getFieldValue(i, "ORD_RCPTNO")));
                sqt = sqt.replace(/:COD/g, Util.quoted(that.vars.ord_code));
                sqt = sqt.replace(/:ON/g, that.qryStr);

                var pr = (this.qv.mLctb.getFieldValue(i, "FC_PRICE")).replace(/[^\d\.-]/g, '').replace(/,/g, '');
                var rate = this.qv.mLctb.getFieldValue(i, "ORD_FC_RATE");
                var vp = pr * rate;
                defaultValues["ORD_PRICE"] = vp;

                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
                defaultValues["PO_SR_NO"] = this.qv.mLctb.getFieldValue(i, "PO_SR_NO");

                s1 += (sqt + UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT", "NET_FC", "NET_LC"], defaultValues, true) + ";").replace(/'cst'/g, 'cst');
            }
            k = "declare cst number:=0; qnt number:=0; begin " + k + s1 + " end; ";
        } else {

            k = UtilGen.getSQLUpdateString(this.o1, "order1",
                {
                    "ORD_AMT": UtilGen.getControlValue(this.o2.ord_amt),
                    "ORD_REFNM": Util.quoted(custName),
                    "MODIFIED_BY": Util.quoted(sett["LOGON_USER"]),
                    "MODIFIED_DATE": "sysdate",
                    "STRA": sett["DEFAULT_STORE"],
                    "ORD_REFERENCE": Util.quoted(this.qryStr)

                },
                "ord_code=" + Util.quoted(this.vars.ord_code) + " and  ord_no=" + Util.quoted(this.qryStrPO)) + ";";

            var s1 = "delete from order2 where ord_code=" + this.vars.ord_code + " and ord_no=" + this.qryStrPO + ";";  // sqls for insert string in order2 table.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                var sqt = "select nvl(max(ord_price),0) into cst "
                    + " from joined_order where ord_refer= :RFR and ord_rcptno= :RNO and ord_reference= :ON and ord_code=103;";

                sqt = sqt.replace(/:RFR/g, Util.quoted(that.qv.mLctb.getFieldValue(i, "ORD_REFER")));
                sqt = sqt.replace(/:RNO/g, Util.quoted(that.qv.mLctb.getFieldValue(i, "ORD_RCPTNO")));
                sqt = sqt.replace(/:COD/g, Util.quoted(that.vars.ord_code));
                sqt = sqt.replace(/:ON/g, that.qryStr);

                var pr = (this.qv.mLctb.getFieldValue(i, "FC_PRICE")).replace(/[^\d\.-]/g, '').replace(/,/g, '');
                var rate = this.qv.mLctb.getFieldValue(i, "ORD_FC_RATE");
                var vp = pr * rate;
                defaultValues["ORD_PRICE"] = vp;

                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
                defaultValues["PO_SR_NO"] = this.qv.mLctb.getFieldValue(i, "PO_SR_NO");

                s1 += (sqt + UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT", "NET_FC", "NET_LC"], defaultValues, true) + ";").replace(/'cst'/g, 'cst');
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
        var fc_main_rate = UtilGen.getControlValue(that.o1.ord_fc_main_rate);
        var fc_main_descr = UtilGen.getControlValue(that.o1.ord_fc_main_descr);

        if (reamt)
            for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
                var pr = parseFloat((Util.getCellColValue(tbl, i, 'FC_PRICE')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
                var qt = parseFloat((Util.getCellColValue(tbl, i, 'ORD_PKQTY')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
                var pk = parseFloat(Util.getCellColValue(tbl, i, 'ORD_PACK'));
                var rate = parseFloat(Util.getCellColValue(tbl, i, 'ORD_FC_RATE'));
                var vp = parseFloat(Util.getCellColValue(tbl, i, 'VAT_P'));
                // var vp = pr * rate;
                var amt = pr * qt;
                var vamt = 0;
                if (vp > 0 && amt > 0)
                    vamt = ((vp * amt) / 100);
                var netfc = amt + vamt;
                var netlc = (amt * rate) + (vamt * rate);
                Util.setCellColValue(tbl, i, "VAT_ADD", df.format(vamt));
                Util.setCellColValue(tbl, i, "AMOUNT", df.format(amt));
                Util.setCellColValue(tbl, i, "LC_AMOUNT", df.format(amt * rate));
                Util.setCellColValue(tbl, i, "NET_FC", df.format(netfc));
                Util.setCellColValue(tbl, i, "NET_LC", df.format(netlc));
                //     that.qv.mLctb.setFieldValue(i, "FC_MAIN_DESCR", fc_main_descr);
                //     that.qv.mLctb.setFieldValue(i, "FC_MAIN_RATE", fc_main_rate);
                //     that.qv.mLctb.setFieldValue(i, "ORD_PRICE", vp);
                //
            }
        this.qv.updateDataToTable();
        var cl = that.qv.mLctb.getColByName("AMOUNT");
        var sum = 0, sumc = 0,
            vatsum = 0, vatpsum = 0, netfc = 0, netlc = 0;
        var ld = that.qv.mLctb;
        for (var i = 0; i < ld.rows.length; i++) {
            var val = that.qv.mLctb.getFieldValue(i, "AMOUNT").toString().replace(/[^\d\.]/g, '').replace(/,/g, '');
            var valc = that.qv.mLctb.getFieldValue(i, "LC_AMOUNT").toString().replace(/[^\d\.]/g, '').replace(/,/g, '');
            var vatadd = parseFloat(that.qv.mLctb.getFieldValue(i, "VAT_ADD").toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
            var nf = parseFloat(that.qv.mLctb.getFieldValue(i, "NET_FC").toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
            var nl = parseFloat(that.qv.mLctb.getFieldValue(i, "NET_LC").toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
            df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
            val = parseFloat(df.formatBack(val));
            sum += val;
            valc = parseFloat(df.formatBack(valc));
            sumc += valc;
            vatsum += vatadd;
            var pr = ld.getFieldValue(i, "FC_PRICE");
            var rate = ld.getFieldValue(i, "ORD_FC_RATE");
            var vp = pr * rate;
            netfc += nf;
            netlc += nl;
            that.qv.mLctb.setFieldValue(i, "FC_MAIN_DESCR", fc_main_descr);
            that.qv.mLctb.setFieldValue(i, "FC_MAIN_RATE", fc_main_rate);
            that.qv.mLctb.setFieldValue(i, "ORD_PRICE", vp);
        }
        vatpsum = 0;
        if (vatsum > 0 && sum > 0)
            vatpsum = (vatsum / sum) * 100;

        UtilGen.setControlValue(that.o2.ord_amt_lc, sum, sum, true);
        UtilGen.setControlValue(that.o2.ord_amt, sumc, sumc, true);
        UtilGen.setControlValue(that.o2.tot_vat_amt, vatsum, vatsum, true);
        UtilGen.setControlValue(that.o2.tot_vat_p, vatpsum, vatpsum, true);
        UtilGen.setControlValue(that.o2.netfcamt, netfc, netfc, true);
        UtilGen.setControlValue(that.o2.netlcamt, netlc, netlc, true);

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
    }
    ,
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
    }
    ,
    setItemSql: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var cod = (UtilGen.getControlValue(this.o1.oname) == "DE" ? "0102" : "0101");

        var sql = "select cost_item,replace(selling_descr,chr(9),'') descr,items.descr cost_item_descr,"
            + " fc_price,fc_rate,fc_descr,lg_custitems.keyfld from "
            + "lg_custitems,items where items.reference=cost_item and"
            + " code='" + UtilGen.getControlValue(this.o1.ord_ref)
            + "' and descr2 like (select descr2||'%' from items where reference=" + Util.quoted(cod)
            + ") order by cost_item,type_of_frieght";

        that.qv.mLctb.getColByName("ORD_REFER").mSearchSQL = sql;
        var sq = that.qv.mLctb.getColByName("ORD_FC_DESCR").mSearchSQL;
        this.originFCDescrSql = Util.nvl(this.originFCDescrSql, sq);
        that.qv.mLctb.getColByName("ORD_FC_DESCR").mSearchSQL = sq.replace(/:ord_date/g, Util.toOraDateString(UtilGen.getControlValue(that.o1.ord_date)));

    }
    ,
    add_items: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var cod = (UtilGen.getControlValue(this.o1.oname) == "DE" ? "0102" : "0101");

        var sql = "select distinct items.reference cost_item,items.descr cost_item_descr,"
            + " items.descr selling_descr,o2.ORD_RCPTNO RCPT_NO,"
            + " (o2.ord_price*o2.ord_fc_rate) cost, o1.ord_ref,o1.ord_refnm,o1.ord_no,o1.ord_reference,"
            + "o2.fc_price,1 fc_rate,'"
            + sett["DEFAULT_CURRENCY"]
            + "' fc_descr,o2.payment_reference," +
            " O2.ORD_FC_DESCR, O2.ORD_FC_RATE, "
            + " (ord_allqty+saleret_qty)-(issued_qty+purret_qty) Qty_in_Hand  from "
            + " items ,order2 o2,order1 o1  "
            + " where "
            + " o2.ord_flag=2 and o2.ord_rcptno is not null  "
            + " and o2.ord_refer=items.reference and (ord_allqty+saleret_qty)-(issued_qty+purret_qty) >0 "
            + " and o2.ord_code=103 and o1.ord_code=103 and o1.ord_no=o2.ord_no "
            // + " and lg.code =" + Util.quoted(UtilGen.getControlValue(this.o1.ord_ref))
            // + "   and lg.cost_item=items.reference "
            + " and o1.ord_reference="
            + Util.quoted(this.qryStr)
            + " and descr2 like (select descr2||'%' from items where reference="
            + Util.quoted(cod) + ") " + " order by o1.ord_no,cost_item"

        // on selection of record function to pass show_list
        var fnOnSelect = function (data) {
            console.log(data);
            if (Util.nvl(that.qryStrSP, "") != "") {
                sap.m.MessageToast.show("Proforma invoice can not change details !");
                return;
            }
            that.qv.updateDataToTable();
            var ld = that.qv.mLctb;

            var itms = []; // selected items in list and remove if not avaialble.
            // put all item and rcpt in one array
            for (var i in data) {
                itms.push(data[i].COST_ITEM + "-" + data[i].RCPT_NO + "-" + data[i].SELLING_DESCR);
                var fnd_r = ld.findInJoin(["ORD_REFER", "ORD_RCPTNO", "DESCR"], data[i].COST_ITEM + "" + data[i].RCPT_NO + "" + data[i].SELLING_DESCR);
                if (fnd_r > -1)
                    continue;
                var idx = ld.rows.length - 1;
                if (Util.nvl(ld.getFieldValue(idx, "ORD_REFER"), "") != "")
                    idx = ld.addRow();

                ld.setFieldValue(idx, "ORD_REFER", data[i].COST_ITEM);
                ld.setFieldValue(idx, "DESCR", data[i].SELLING_DESCR);
                ld.setFieldValue(idx, "ORD_PKQTY", data[i].QTY_IN_HAND);
                ld.setFieldValue(idx, "ORD_RCPTNO", data[i].RCPT_NO);
                ld.setFieldValue(idx, "PO_SR_NO", data[i].ORD_NO);
                ld.setFieldValue(idx, "FC_PRICE", data[i].FC_PRICE);
                ld.setFieldValue(idx, "ORD_FC_DESCR", data[i].ORD_FC_DESCR);
                ld.setFieldValue(idx, "ORD_FC_RATE", data[i].ORD_FC_RATE);
                ld.setFieldValue(idx, "VAT_P", that.vars.vat_p);

            }
            var ritms = []; // removable rows
            for (var i = ld.rows.length - 1; i > -1; i--) {
                var tmp = ld.getFieldValue(i, "ORD_REFER") + "-" + ld.getFieldValue(i, "ORD_RCPTNO") + "-" + ld.getFieldValue(i, "DESCR");
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
                rfrs.push(ld1.getFieldValue(j, "ORD_REFER") + "-" + ld1.getFieldValue(j, "ORD_RCPTNO") + "-" + ld1.getFieldValue(j, "SELLING_DESCR"));

            var ld = qv.mLctb;
            qv.getControl().clearSelection();
            var sl = qv.getControl().getSelectedIndices();
            for (var i = 0; i < ld.rows.length; i++)
                if (rfrs.indexOf(ld.getFieldValue(i, "COST_ITEM") + "-" + ld.getFieldValue(i, "RCPT_NO") + "-" + ld1.getFieldValue(j, "SELLING_DESCR")) > -1)
                    qv.getControl().addSelectionInterval(i, i);


        };

        Util.show_list(sql, undefined, undefined, fnOnSelect, "100%", "100%", 10, true, fnOnDisplay);

    },
    updatePoSrNo: function () {
        var that = this;
        var ld = that.qv.mLctb;
        var on;
        for (var i = 0; i < ld.rows.length; i++) {
            var rfr = ld.getFieldValue(i, "ORD_REFER");
            var rc = ld.getFieldValue(i, "ORD_RCPTNO");

            on = Util.getSQLValue("select ord_no from order2 " +
                "where ord_code=103 and " +
                " ord_refer=" + Util.quoted(rfr) + " and " +
                " ord_rcptno=" + Util.quoted(rc));
            if (Util.nvl(on, "") == "") {
                sap.m.MessageToast.show("No purchase found for Item # " + rfr + " , Recipt # " + rc);
                return false;
            }

            ld.setFieldValue(i, "PO_SR_NO", on);
        }
        return true;
    },
    changeCurrency: function () {
        var that = this;
        this.qv.updateDataToTable();
        var ld = that.qv.mLctb;
        var sq = "select GET_CURRENT_RATE(:RFR , :DT ) FROM DUAL";

        //UtilGen.setControlValue(that.o1.ord_fc_main_descr, Util.getSettings("DEFAULT_CURRENCY"));
        if (UtilGen.getControlValue(that.o1.ord_date) != null) {
            var sql = sq.replace(/:RFR/g, Util.quoted(UtilGen.getControlValue(that.o1.ord_fc_main_descr)));
            sql = sql.replace(/:DT/g, Util.toOraDateString(UtilGen.getControlValue(that.o1.ord_date)));
            var vl = Util.getSQLValue(sql);
            UtilGen.setControlValue(that.o1.ord_fc_main_rate, vl);
        }
        var fc_main_rate = UtilGen.getControlValue(that.o1.ord_fc_main_rate);
        var fc_main_descr = UtilGen.getControlValue(that.o1.ord_fc_main_descr);

        for (var i = 0; i < ld.rows.length; i++) {
            ld.setFieldValue(i, "FC_MAIN_DESCR", fc_main_descr);
            ld.setFieldValue(i, "FC_MAIN_RATE", fc_main_rate);
            if (ld.getFieldValue(i, "ORD_REFER") == "") continue;
            var sql = sq.replace(/:RFR/g, Util.quoted(ld.getFieldValue(i, "ORD_FC_DESCR")));
            if (UtilGen.getControlValue(that.o1.ord_date) != undefined) {
                sql = sql.replace(/:DT/g, Util.toOraDateString(UtilGen.getControlValue(that.o1.ord_date)));
                var vl = Util.getSQLValue(sql);
                ld.setFieldValue(i, "ORD_FC_RATE", vl);
            }
        }
        this.qv.updateDataToControl();
        that.do_summary(true);
        if (that.qv.mLctb.cols.length > 0)
            that.qv.mLctb.getColByName("ORD_FC_DESCR").mSearchSQL = this.originFCDescrSql.replace(/:ord_date/g,
                Util.toOraDateString(UtilGen.getControlValue(that.o1.ord_date)));
    }
})
;



