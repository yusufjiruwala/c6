sap.ui.jsfragment("bin.forms.lg.CloseJO", {

    createContent: function (oController) {
        var that = this;
        jQuery.sap.require("sap.m.MessageBox");
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
        // this.o1.totdeb = this.addControl(fe, "Total DR", sap.m.Input, "clsdbr", {
        //     editable: false
        // }, "number", sett["FORMAT_MONEY_1"]);
        // this.o1.totcrd = this.addControl(fe, "@Total CR", sap.m.Input, "clscrd", {
        //     editable: false,
        // }, "number", sett["FORMAT_MONEY_1"]);
        //
        // this.o1.post_dr_ac = this.addControl(fe, "DR A/c", sap.m.SearchField, "clsPostDrAc",
        //     {
        //         enabled: true,
        //         search: function (e) {
        //             if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
        //                 UtilGen.setControlValue(that.jo.post_dr_ac, "", "", true);
        //                 return;
        //             }
        //
        //             var sq = "select accno code,name title from acaccount where  childcount=0 order by path";
        //             Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
        //                 UtilGen.setControlValue(that.o1.post_dr_ac, val, valx, true);
        //             });
        //
        //         }
        //     }, "string");
        this.o1.close_date = this.addControl(fe, "Close Date", sap.m.DatePicker, "clsCloseDate",
            {valueDate: new Date()}, "date");

        // this.o1._space = this.addControl(fe, "@  ", sap.m.Text, "clslbl1", {
        //     readOnly: true,
        // }, "number", sett["FORMAT_MONEY_1"]);

        // this.o1.post_cr_ac = this.addControl(fe, "CR A/c ", sap.m.SearchField, "clsPostCrAc",
        //     {
        //         enabled: true,
        //         search: function (e) {
        //             if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
        //                 UtilGen.setControlValue(that.jo.post_cr_ac, "", "", true);
        //                 return;
        //             }
        //
        //             var sq = "select accno code,name title from acaccount where  childcount=0 order by path";
        //             Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
        //                 UtilGen.setControlValue(that.o1.post_cr_ac, val, valx, true);
        //             });
        //
        //         }
        //     }, "string");


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
                    sap.m.MessageBox.confirm("Are you sure, to CLOSE  ?  ", {
                        title: "Confirm",                                    // default
                        onClose: function (oAction) {
                            if (oAction == sap.m.MessageBox.Action.OK) {
                                that.post_close();
                            }
                        },                                       // default
                        styleClass: "",                                      // default
                        initialFocus: null,                                  // default
                        textDirection: sap.ui.core.TextDirection.Inherit     // default
                    });


                }
            }));
        frm.getToolbar().addContent(
            new sap.m.Button({
                text: "Repair JO",
                press: function () {
                    that.repair_jos();
                }
            }));
        frm.getToolbar().addContent(new sap.m.ToolbarSpacer());
        frm.getToolbar().addContent(
            new sap.m.Button({
                text: "Show Details",
                press: function () {
                    that.show_details();
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

            if (UtilGen.getControlValue(this.o1.close_date) == undefined)
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
        // var sql = "select decode(ord_code,103,'Purchase',111,'Sales',141,'Proforma',151,'DR Notes',152,'CR Note') transaction , " +
        //     " ord_no, SUM(DECODE(ORD_CODE,103,(ORD_PRICE*ORD_FC_RATE)*ORD_ALLQTY,0,151,(ORD_cost_PRICE*ORD_ALLQTY),0)) DEBIT," +
        //     " SUM(DECODE(ORD_CODE,111,(ORD_COST_PRICE*ORD_ALLQTY),152,(ORD_cost_PRICE*ORD_ALLQTY),0)) CREDIT ," +
        //     " ord_code,SUM((ORD_PRICE*ORD_FC_RATE)*ORD_ALLQTY) ord_amt " +
        //     " FROM JOINED_ORDER WHERE ORD_CODE IN (111,103,151,152) AND ORD_REFERENCE IN (:ORD_NOS ) " +
        //     " GROUP BY " +
        //     " decode(ord_code,103,'Purchase',111,'Sales',151,'DR Notes',152,'CR Note'),ord_no ,ORD_CODE " +
        //     " ORDER BY 1,2";
        // sql = sql.replace(":ORD_NOS", this.ordNos.join())
        // var data = Util.execSQL(sql);
        // if (data.ret == "SUCCESS") {
        //     that.qv.setJsonStrMetaData("{" + data.data + "}");
        //     that.qv.mLctb.getColByName("TRANSACTION").mGrouped = true;
        //     that.qv.mLctb.getColByName("DEBIT").getMUIHelper().display_format = "MONEY_FORMAT";
        //     that.qv.mLctb.getColByName("CREDIT").getMUIHelper().display_format = "MONEY_FORMAT";
        //     that.qv.mLctb.getColByName("CREDIT").mSummary = "SUM";
        //     that.qv.mLctb.getColByName("DEBIT").mSummary = "SUM";
        //     that.qv.mLctb.getColByName("ORD_CODE").mHideCol = true;
        //     that.qv.mLctb.getColByName("ORD_AMT").mHideCol = true;
        //     that.qv.mLctb.parse("{" + data.data + "}", true);
        //     that.qv.loadData();
        // }
        var sql = "select distinct items.reference cost_item,items.descr cost_item_descr,"
            + "  o2.ORD_RCPTNO RCPTNO,"
            + " SUM ((O2.ord_price)* ((ord_allqty + saleret_qty) - (issued_qty + purret_qty))) total_cost , "
            + " SUM((ord_allqty+saleret_qty)-(issued_qty+purret_qty)) Qty_in_Hand ," +
            "  MAX((SELECT REPAIR.getgoodsaccNO(O2.ORD_REFER,1,'EXPACC') FROM DUAL )) DR_ACC,  " +
            "  max((SELECT REPAIR.getgoodsaccNO(O2.ORD_REFER,1,'STOREACC') FROM DUAL )) CR_ACC , "
            + "  sum(ord_allqty+saleret_qty) In_Qty,"
            + "    sum(issued_qty+purret_qty) Out_qty "
            + " FROM items ,order2 o2,order1 o1  "
            + " where "
            + " o1.ord_flag=2 and o2.ord_rcptno is not null  "
            // + " and o2.ord_refer=items.reference and (ord_allqty+saleret_qty)-(issued_qty+purret_qty) !=0 "
            + " and o2.ord_code=103 and o1.ord_code=103 and o1.ord_no=o2.ord_no "
            + " and items.reference=o2.ord_refer "
            // + " and lg.code =" + Util.quoted(UtilGen.getControlValue(this.o1.ord_ref))
            // + "   and lg.cost_item=items.reference "
            + " and o1.ord_reference in ("
            + this.ordNos.join() + ")"
            + " group by items.reference,items.descr,ord_rcptno " +
            // " having SUM ((O2.ord_price * o2.ord_fc_rate)* (ord_allqty + saleret_qty) - (issued_qty + purret_qty))>=0" +
            " order by cost_item";
        var data = Util.execSQL(sql);
        if (data.ret == "SUCCESS") {
            var ld = that.qv.mLctb;
            that.qv.setJsonStrMetaData("{" + data.data + "}");
            ld.getColByName("TOTAL_COST").getMUIHelper().display_format = "MONEY_FORMAT";
            ld.getColByName("TOTAL_COST").mSummary = "SUM";
            ld.parse("{" + data.data + "}", true);

            that.qv.loadData();
        }


        that.do_summary();
    },
    do_summary: function () {
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var ld = this.qv.mLctb;
        var db = 0, cr = 0;
        for (var i = 0; i < ld.rows.length; i++)
            db += ld.getFieldValue(i, "TOTAL_COST");

        UtilGen.setControlValue(this.o1.totvar, df.format(db));
    },
    post_close: function () {
        var that = this;
        var sqlIns = "", s1 = "";
        var kf = Util.getSQLValue("select nvl(max(keyfld),0)+1 from lg_close_o1");

        that.loadData();

        if (UtilGen.getControlValue(this.o1.totvar) == "" || UtilGen.getControlValue(this.o1.totvar) == "" ||
            UtilGen.getControlValue(this.o1.totvar) < 0) {
            sap.m.MessageToast.show("Variance must not negative  !");
            return;
        }

        var k = "";
        var s2 = "";
        var s3 = "";
        // CHECKING IF ANY ORDER IS NOT POSTED !

        for (var i in this.ordNos) {
            var flg = Util.getSQLValue("select nvl(max(ord_no),-1) " +
                " from order1 where ord_code in (111,103,141,151,152) and ord_flag!=2 and ord_reference=" + this.ordNos[i])
            if (flg != -1) {
                sap.m.MessageToast.show("Order is not posted # " + flg);
                return;
            }
            var sq = "insert into lg_close_o3(keyfld,jo_no) values (:keyfld , :jo_no );";
            sq = sq.replace(/:keyfld/g, kf);
            sq = sq.replace(/:jo_no/g, this.ordNos[i]);
            s3 += sq;

        }

        if (this.qryStr == "") {
            that.fetchData();
            k = UtilGen.getSQLInsertString(this.o1, {KEYFLD: kf});
            k = "insert into lg_close_o1 " + k + ";";
            var defaultValues = {KEYFLD: kf};
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                if (this.qv.mLctb.getFieldValue(i, "TOTAL_COST") < 0) {
                    sap.m.MessageToast.show('Negative cost cant be closed ! ' + this.qv.mLctb.getFieldValue(i, "COST_ITEM"));
                    return;
                }
                defaultValues["POS"] = i;
                s1 += (UtilGen.getInsertRowString(this.qv.mLctb, "LG_CLOSE_O2", i,
                    ["COST_ITEM_DESCR", "IN_QTY", "OUT_QTY"], defaultValues, true) + ";");
            }

            k = "declare cst number:=0; qnt number:=0; begin " + k + s1 + s2 + s3 + " x_lg_close_jo(" + kf + "); end; ";
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
    },
    show_details: function () {
        var that = this;
        var qv = new QueryView("tbldet1");
        var vb = new sap.m.VBox({items: [qv.getControl()]});

        var itms = "";
        var indicOF = that.qv.getControl().getBinding("rows").aIndices;
        var indic = that.qv.getControl().getSelectedIndices();
        for (var i in indic)
            itms += (itms.length > 0 ? "," : "") +
                Util.quoted(that.qv.mLctb.getFieldValue(indicOF[indic[i]], "COST_ITEM") +
                    "-" + that.qv.mLctb.getFieldValue(indicOF[indic[i]], "RCPTNO"));
        var sq = "select ord_refer||'-'||ORD_RCPTNO REFERENCE,ord_date,ord_no,decode(ord_code,103,'Purchase',111,'Sales',141,'Proforma',151,'DR Notes',152,'CR Note',131,'P.RETURN') type,ord_allqty from " +
            " joined_order where " +
            "ord_refer||'-'||ord_rcptno in (" + itms + ") and ord_reference in (" + that.ordNos.join() + ") order by ord_date,ord_refer,ord_code,ord_no";
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                qv.setJsonStrMetaData("{" + data.data + "}");
                qv.mLctb.parse("{" + data.data + "}", true);
                //UtilGen.applyCols("C6LGREQ.DN1", that.qv);
                qv.mLctb.cols[0].mGrouped = true;
                qv.loadData();
            }
        });
        var dlg = new sap.m.Dialog(
            {
                width: "100%",
                height: "600px",
                content: vb,
                buttons: [new sap.m.Button({
                    text: "Close", press: function () {
                        dlg.close();
                    }
                })]
            }
        );

        dlg.open();
    },
    repair_jos: function () {
        var that = this;
        var qv = new QueryView("tbldet1");
        var vb = new sap.m.VBox({items: [qv.getControl()]});
        var sq = "";
        for (var i in that.ordNos)
            sq += "X_LG_UPDATE_ISSUES(" + that.ordNos[i] + ");";
        sq = "begin " + sq + " end;";
        var dat = Util.execSQL(sq);
        if (dat.ret == "SUCCESS") {
            sap.m.MessageToast.show("( " + that.ordNos[i] + " ) JO REPAIRED successfully ");
            that.loadData();
        } else
            sap.m.MessageToast.show(dat.ret);


    }
});



