sap.ui.jsfragment("bin.forms.clinic.SO", {

    createContent: function (oController) {
        var that = this;
        jQuery.sap.require("sap.m.MessageBox");

        this.view = oController.getView();
        this.qryStr = oController.qryStr;
        this.oA = oController.oA;
        this.apKeyfld = oController.apKeyfld;
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
                that.oController.backFunction();
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

        (this.view.byId("poCmdPrint") != undefined ? this.view.byId("poCmdPrint").destroy() : null);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdPrint"), {
            icon: "sap-icon://print", press: function () {
                var flg = parseFloat(Util.getSQLValue("select flag from cl6_appoint where keyfld=" + that.apKeyfld));
                if (flg != 1)
                    that.printSale("CL");
                else
                    that.save_data(true);
            }
        }));


        // that.createScrollCmds(this.frm.getToolbar());

        this.frm.getToolbar().addContent(new sap.m.ToolbarSpacer());
        (this.view.byId("poMsgInv") != undefined ? this.view.byId("poMsgInv").destroy() : null);
        this.frm.getToolbar().addContent(new sap.m.Text(view.createId("poMsgInv"), {text: ""}).addStyleClass("redText blinking"));
        this.frm.getToolbar().addContent(new sap.m.Title({text: "Sales Order Request"}));


        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);

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

        this.o2.ord_amt.addStyleClass("yellow");
        var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
        frm.setToolbar(undefined);
        frm.destroyToolbar();
        sc.addContent(frm);
    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.o1.ord_no = this.addControl(fe, "Order No", sap.m.Input, "poOrdNo",
            {layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})}, "number")
        this.o1.ord_date = this.addControl(fe, "@Date", sap.m.DatePicker, "poOrdDate",
            {
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"}),
                change: function () {
                }
            }, "date");
        this.o1.ord_ref = this.addControl(fe, "Customer", sap.m.Input, "poCustomer",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S2"}),
            }, "string");

        this.o1.ord_refnm = this.addControl(fe, undefined, sap.m.SearchField, "poCustName",
            {
                enabled: true,
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.o1.ord_ref, "", "", true);
                        return;
                    }
                    var sq = "select code,name title from " +
                        " c_ycust where " +
                        " (isbankcash='Y' or issupp='Y') and childcount=0 order by code";
                    Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                        UtilGen.setControlValue(that.o1.ord_ref, val, val, true);
                        UtilGen.setControlValue(that.o1.ord_refnm, valx, valx, true);

                    });

                },
                layoutData: new sap.ui.layout.GridData({span: "XL2 L5 M5 S5"}),
            }, "string");

        this.o1.payterm = this.addControl(fe, "Remarks", sap.m.Input, "poRemarks",
            {enabled: true}, "string");
        this.o1.lcno = this.addControl(fe, "@Tel #", sap.m.Input, "poinvref",
            {enabled: true}, "string");

        this.o1._start_time = this.addControl(fe, "Start time", sap.m.DateTimePicker, "poStartTime",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "date");
        this.o1._end_time = this.addControl(fe, "@End time", sap.m.DateTimePicker, "poEndTime",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "date");

        this.o1._end_time.setValueFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        this.o1._end_time.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        this.o1._start_time.setValueFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        this.o1._start_time.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");


        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);


    },
    loadData: function () {
        var view = this.view;
        var that = this;
        var apPosted = "";
        var sett = sap.ui.getCore().getModel("settings").getData();

        // UtilGen.setControlValue(this.o1.oname, "FR", "FR", true);
        this.view.byId("poMsgInv").setText("");
        this.view.byId("poCmdSave").setEnabled(true);
        this.view.byId("poCmdDel").setEnabled(true);

        if (this.oA == undefined)
            this.oController.backFunction();
        //check if this appointment have invoice or new...
        var inv = Util.getSQLValue("select ord_no from order1 where ord_code=" + this.vars.ord_code + " and ord_reference=" + this.apKeyfld);
        this.qryStr = Util.nvl(inv, "");

        if (this.qryStr == "") {
            var on = Util.getSQLValue("select nvl(max(ord_no),0)+1 from order1 where ord_code=" + this.vars.ord_code);
            UtilGen.setControlValue(this.o1.ord_date, new Date());
            UtilGen.setControlValue(this.o1.ord_no, on);
            this.o1.ord_no.setEnabled(true);
            that.loadAppointData();
            that.fetchCustomer(false);
        }
        else {
            var dt = Util.execSQL("select *from order1 where ord_code=" + this.vars.ord_code + " and ord_no=" + Util.quoted(this.qryStr));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.loadDataFromJson(this.o1, dtx[0], true);
                this.o1.ord_no.setEnabled(false);
                // UtilGen.setControlValue(this.o1.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                var flg = parseFloat(Util.getSQLValue("select flag from cl6_appoint where keyfld=" + that.apKeyfld));
                apPosted = "  Edit ";
                if (flg != 1) {
                    this.view.byId("poMsgInv").setText("POSTED  #" + this.apKeyfld);
                    this.view.byId("poCmdSave").setEnabled(false);
                    this.view.byId("poCmdDel").setEnabled(false);
                    apPosted = "  Posted "
                }

            }

        }

        this.view.byId("poMsgInv").setText(apPosted + " Appointment # " + this.apKeyfld);
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
    ,
    loadAppointData: function () {
        var dt = Util.execSQL("select *from cl6_appoint where keyfld=" + this.apKeyfld);
        if (dt.ret = "SUCCESS" && dt.data.length > 0) {
            var dtx = JSON.parse("{" + dt.data + "}").data;
            UtilGen.setControlValue(this.o1._start_time, dtx[0].START_TIME);
            UtilGen.setControlValue(this.o1._end_time, dtx[0].END_TIME);
            UtilGen.setControlValue(this.o1.lcno, dtx[0].TEL);
            UtilGen.setControlValue(this.o1.payterm, dtx[0].REMARKS);
        }
    },
    loadData_details: function () {
        var that = this;
        var sq = "select order2.*,'' descr2, 0 discp,((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY amount," +
            "(((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY)*ord_fc_rate lc_amount , " +
            " (((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY) +vat_add NET_FC,   " +
            " ((((FC_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY)*ord_fc_rate) + (vat_add*ord_fc_rate) NET_LC  ," +
            " (SELECT MAX(NAME) FROM SALESP WHERE NO=ORDER2.LCNO) DNAME   " +
            " from order2 where ord_no="
            + Util.quoted(this.qryStr)
            + " and ord_code="
            + this.vars.ord_code
            + " order by ord_pos";
        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                UtilGen.applyCols("C6L.SO1", that.qv, that);
                that.qv.mLctb.parse("{" + data.data + "}", true);
                if (that.qv.mLctb.rows.length == 0)
                    that.qv.addRow();
                var c = that.qv.mLctb.getColPos("ORD_REFER");
                that.qv.mLctb.cols[c].beforeSearchEvent = function (sq, ctx, model) {
                    // var rfr = model.getProperty(ctx.sPath + "/ORD_REFER");
                    // var s = sq.replace("where", " where cost_item= " + Util.quoted(rfr) + " and ");
                    return sq;
                };
                that.qv.loadData();
                that.do_summary(true);
                // that.setItemSql();

            }
        });
    },
    fetchCustomer: function (getNewCust) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var dt = Util.execSQL("select *from cl6_appoint where keyfld=" + Util.quoted(this.apKeyfld));

        if (dt.ret = "SUCCESS" && dt.data.length > 0) {
            var dtx = JSON.parse("{" + dt.data + "}").data;
            UtilGen.setControlValue(this.o1.ord_refnm, dtx[0].CUST_NAME, dtx[0].CUST_NAME, false);
            var cd = Util.getSQLValue("select code from c_ycust where tel=" + Util.quoted(dtx[0].TEL));
            var cu = UtilGen.getControlValue(that.o1.ord_ref);


            if (cd != "" && cu != "" && cu != cd) {
                sap.m.MessageToast.show("This customer with TEL : " + dtx[0].TEL + " already have CODE " + cd);
                return false;
            }


            if (Util.nvl(cd, "") != "")
                UtilGen.setControlValue(this.o1.ord_ref, cd, cd, false);

            var cu = UtilGen.getControlValue(this.o1.ord_ref);
            if (cu == "" && getNewCust) {
                cu = Util.getSQLValue("select to_number(nvl(max(code),'10000'))+1 from c_ycust where parentcustomer=" + sett["MAIN_CUST_PARENT"]);
                UtilGen.setControlValue(this.o1.ord_ref, cu, cu, false);
            }

            // if (insertNewCust == true && Util.nvl(cd, "") == "" && Util.nvl(cu, "") != "") {
            //     var sq = "insert into c_ycust (code,name,tel,path,is_cust,Ac_no)  values  " +
            //         "( :code , :name , :tel , :path , :is_cust , :ac_no ) ";
            //     sq = sq.replace(/:code/g, Util.quoted(cu));
            //     sq = sq.replace(/:name/g, Util.quoted(UtilGen.getControlValue(that.o1.ord_refnm)));
            //     sq = sq.replace(/:tel/g, Util.quoted(UtilGen.getControlValue(that.o1.addr_tel)));
            //     sq = sq.replace(/:path/g, Util.quoted("XXX\\" + sett["MAIN_CUST_PARENT"] || "\\" + cu));
            //     sq = sq.replace(/:ac_no/g, "(select ac_no from c_ycust where accno=" + Util.quoted(sett["MAIN_CUST_PARENT"]) + ")" + "\\");
            //     return sq;
            // }


        }
        return true;
    }
    ,
    addControl(ar, lbl, cntClass, id, sett, dataType, fldFormat) {
        var setx = sett;
        var idx = id;
        if (Util.nvl(id, "") == "")
            idx = lbl.replace(/ ||,||./g, "");
//        setx["layoutData"] = new sap.ui.layout.GridData({span: "XL4 L4 M4 S12"});
        var cnt = UtilGen.createControl(cntClass, this.view, idx, setx, dataType, fldFormat);
        if (lbl != undefined && lbl.length != 0)
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


        return true;
    }
    ,
    save_data: function (printSale) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        if (!this.validateSave())
            return;
        if (this.fetchCustomer(true) == false)
            return false;
        var sqCustInsert = "";
        var custExist = Util.getSQLValue("select code from c_ycust where code=" + Util.quoted(UtilGen.getControlValue(this.o1.ord_ref)));
        if (Util.nvl(custExist, "") == "") {
            var sqCustInsert = "insert into c_ycust (code,name,tel,path,iscust,Ac_no, parentcustomer)  values  " +
                "( :code , :name , :tel , :path , 'Y' , :ac_no , :pc ) ; ";
            sqCustInsert = sqCustInsert.replace(/:code/g, Util.quoted(UtilGen.getControlValue(that.o1.ord_ref)));
            sqCustInsert = sqCustInsert.replace(/:name/g, Util.quoted(UtilGen.getControlValue(that.o1.ord_refnm)));
            sqCustInsert = sqCustInsert.replace(/:tel/g, Util.quoted(UtilGen.getControlValue(that.o1.lcno)));
            sqCustInsert = sqCustInsert.replace(/:pc/g, Util.quoted(sett["MAIN_CUST_PARENT"]));
            sqCustInsert = sqCustInsert.replace(/:path/g, Util.quoted("XXX\\" + sett["MAIN_CUST_PARENT"] + "\\" + UtilGen.getControlValue(that.o1.ord_ref) + "\\"));
            sqCustInsert = sqCustInsert.replace(/:ac_no/g, "(select ac_no from c_ycust where code=" + Util.quoted(sett["MAIN_CUST_PARENT"]) + ")");
        }

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
        // var custName = Util.getSQLValue("select name from c_ycust where code=" + Util.quoted(UtilGen.getControlValue(that.o1.ord_ref)));

        for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
            var vl = that.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
            that.qv.mLctb.setFieldValue(i, "ORD_ALLQTY", vl);
        }

        if (this.qryStr == "") {
            k = UtilGen.getSQLInsertString(this.o1, {
                "ord_code": this.vars.ord_code,
                "ord_flag": 1,
                "periodcode": Util.quoted(sett["CURRENT_PERIOD"]),
                "LOCATION_CODE": Util.quoted(sett["DEFAULT_LOCATION"]),
                "ORD_AMT": UtilGen.getControlValue(this.o2.ord_amt),
                // "ORD_REFNM": Util.quoted(custName),
                "CREATED_BY": Util.quoted(sett["LOGON_USER"]),
                "CREATED_DATE": "sysdate",
                "STRA": sett["DEFAULT_STORE"],
                "ORD_REFERENCE": this.apKeyfld
            }, []);
            k = "insert into order1 " + k + ";";
            var s1 = "";
            // sqls for insert string in order2 table.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                defaultValues["ORD_PRICE"] = this.qv.mLctb.getFieldValue(i, "FC_PRICE");
                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");

                s1 += (UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT","DNAME"], defaultValues, true) + ";");
            }
            k = "begin " + sqCustInsert + " " + k + s1 + " end; ";
        } else {
            k = UtilGen.getSQLUpdateString(this.o1, "order1",
                {
                    "ORD_AMT": UtilGen.getControlValue(this.o2.ord_amt),
                    // "ORD_REFNM": Util.quoted(custName),
                    "MODIFIED_BY": Util.quoted(sett["LOGON_USER"]),
                    "MODIFIED_DATE": "sysdate",
                    "STRA": sett["DEFAULT_STORE"],
                    "ORD_REFERENCE": Util.quoted(this.apKeyfld)

                },
                "ord_code=" + Util.quoted(this.vars.ord_code) + " and  ord_no=" + Util.quoted(this.qryStr)) + ";";

            var s1 = "delete from order2 where ord_code=" + this.vars.ord_code + " and ord_no=" + this.qryStr + ";";  // sqls for insert string in order2 table.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                defaultValues["ORD_PRICE"] = this.qv.mLctb.getFieldValue(i, "FC_PRICE");
                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");

                s1 += (UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT","DNAME"], defaultValues, true) + ";");
            }
            k = "begin " + sqCustInsert + " " + k + s1 + " end; ";
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
            if (printSale)
                that.printSale("CL");
            else
                that.oController.backFunction();
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
                var pr = parseFloat((Util.getCellColValue(tbl, i, 'FC_PRICE')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
                var qt = parseFloat((Util.getCellColValue(tbl, i, 'ORD_PKQTY')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
                var pk = parseFloat(Util.getCellColValue(tbl, i, 'ORD_PACK'));
                var amt = pr * qt;
                var vamt = 0;
                Util.setCellColValue(tbl, i, "AMOUNT", df.format(amt));
                //     that.qv.mLctb.setFieldValue(i, "FC_MAIN_DESCR", fc_main_descr);
                //     that.qv.mLctb.setFieldValue(i, "FC_MAIN_RATE", fc_main_rate);
                //     that.qv.mLctb.setFieldValue(i, "ORD_PRICE", vp);
                //
            }
        this.qv.updateDataToTable();
        var sum = 0;
        var ld = that.qv.mLctb;
        df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        for (var i = 0; i < ld.rows.length; i++) {
            var val = that.qv.mLctb.getFieldValue(i, "AMOUNT").toString().replace(/[^\d\.]/g, '').replace(/,/g, '');
            val = parseFloat(df.formatBack(val));
            sum += val;
            var pr = ld.getFieldValue(i, "FC_PRICE");
            that.qv.mLctb.setFieldValue(i, "ORD_PRICE", pr);
        }
        UtilGen.setControlValue(that.o2.ord_amt, sum, sum, true);
    }
    ,
    delete_data: function () {
        var that = this;
        if (that.qryStr == "")
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
                        that.oController.backFunction();
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
        var current = sl.indexOf(this.qryStr);

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
                        that.qryStr
                            = sl[--current];
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
                        that.qryStr
                            = sl[++current];
                        that.loadData();
                        view.byId("poCmdPrior").setEnabled(true);
                    }
                }));
        }
    },
    printSale: function (preFileName) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var plsql = "";

        var oc = this.vars.ord_code;
        var on = UtilGen.getControlValue(this.o1.ord_no);
        var fn = Util.nvl(preFileName, "");
        var sq = "insert into temporary(usernm,idno ,field1) values (:usernm,:idno,:field1);";
        sq = sq.replace(":usernm", Util.quoted(sett["SESSION_ID"]));
        sq = sq.replace(":idno", oc);
        sq = sq.replace(":field1", on);
        plsql += sq;

        plsql = " begin delete from temporary where idno=" + oc + " and usernm=" + Util.quoted(sett["SESSION_ID"]) + ";" + plsql + " end;";
        var dt = Util.execSQL(plsql);
        if (dt.ret = "SUCCESS")
            Util.doXhr("report?reportfile=rptVou" + fn + oc, true, function (e) {
                if (this.status == 200) {
                    var blob = new Blob([this.response], {type: "application/pdf"});
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.target = "_blank";
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.download = "rptVou" + new Date() + ".pdf";
                    link.click();
                    document.body.removeChild(link);
                }
            })
    },

})
;



