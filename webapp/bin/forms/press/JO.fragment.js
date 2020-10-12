sap.ui.jsfragment("bin.forms.press.JO", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.qv1 = undefined;
        this.qv2 = undefined;
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 601,
            onm: "",
            matexp: 0,
            otherexp: 0
        };
        this.pgDetail = new sap.m.Page({showHeader: false});

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
        this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");
        return this.joApp;
    },

    createView: function () {
        var that = this;
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.jo = {};
        this.frmJO;
        this.qv = new QueryView("tblPODetails");

        that.qv.getControl().view = this;
        this.qv.getControl().addStyleClass("sapUiSizeCondensed");
        this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setFixedBottomRowCount(0);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
        this.qv.getControl().setVisibleRowCount(7);

        this.qv.onAddRow = function (idx, ld) {
            ld.setFieldValue(idx, "ORD_POS", idx + 1);
            ld.setFieldValue(idx, "ORD_PKQTY", 1);
            ld.setFieldValue(idx, "ORD_ALLQTY", 1);
            ld.setFieldValue(idx, "ORD_PRICE", 0);
        };

        this.qryStr = "";
        if (this.oController.qryStr != undefined)
            this.qryStr = this.oController.qryStr;

        UtilGen.clearPage(this.mainPage);
        var sf = this.createViewJOControls(true, this.mainPage);

        sf.getToolbar().addContent(this.bk);

        (this.view.byId("poCmdSave") != undefined ? this.view.byId("poCmdSave").destroy() : null);
        sf.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave"), {
            icon: "sap-icon://save", press: function () {
                that.save_data();
            }
        }));

        sf.getToolbar().addContent(new sap.m.ToolbarSpacer());
        (this.view.byId("poMsgInv") != undefined ? this.view.byId("poMsgInv").destroy() : null);
        sf.getToolbar().addContent(new sap.m.Text(view.createId("poMsgInv"), {text: ""}).addStyleClass("redText blinking"));
        sf.getToolbar().addContent(new sap.m.Title({text: "Job Order"}));

        (this.view.byId("poCmdExpense") != undefined ? this.view.byId("poCmdExpense").destroy() : null);
        sf.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdExpense"), {
            text: "Expenses", press: function () {
                that.showExpenses(true);
            }
        }));

        var sc = new sap.m.ScrollContainer();

        sc.addContent(sf);

        sc.addContent(UtilGen.rowGridButtons(this.qv));
        sc.addContent(this.qv.getControl());

        this.mainPage.addContent(sc);
        this.createViewFooter(sc);
        // this.createViewFooter(sc);

    },
    createViewFooter: function (sc) {
        var that = this;
        var view = this.view;
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
        this.o2.ord_amt = UtilGen.addControl(fe, "Total Sales", sap.m.Input, "joSaleAmt",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L3 M3 S12"})
            }, "number", sett["FORMAT_MONEY_1"], view);
        this.o2.ord_exp_amt = UtilGen.addControl(fe, "Total Expense", sap.m.Input, "joTotExpAMt",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L3 M3 S12"})
            }, "number", sett["FORMAT_MONEY_1"], view);

        this.o2.net_profit = UtilGen.addControl(fe, "Net Profit", sap.m.Input, "joNetProfit",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L3 M3 S12"})
            }, "number", sett["FORMAT_MONEY_1"], view);

        this.o2._tmp1 = UtilGen.addControl(fe, " ", sap.m.Text, "joDot1",
            {
                height: "50px",
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L3 M3 S12"})
            }, "string", undefined, view);


        var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
        frm.setToolbar(undefined);
        frm.destroyToolbar();
        sc.addContent(frm);
    },
    createViewJOControls: function (addForm, pg) {
        var that = this;
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();
        if (this.frmJO != undefined) {
            this.frmJO.removeAllContent();
            this.frmJO.destroyContent();
        }
        this.jo = {};
        var fe = [];
        // location code
        this.jo.location_code =
            UtilGen.addControl(fe, "Location", sap.m.ComboBox, "joLocation",
                {
                    editable: true,
                    items: {
                        path: "/",
                        template: new sap.ui.core.ListItem({text: "{NAME} - {CODE}", key: "{CODE}"}),
                        templateShareable: true
                    },
                    selectionChange: function (event) {

                    }
                    // layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
                }, "string", undefined, view, undefined, "select code,name from locations order by 1");
        //JO No, ORD_NO
        this.jo.ord_no = UtilGen.addControl(fe, "@Ord No", sap.m.Input, "joOrdNo",
            {enabled: false}, "number", undefined, view);
        this.jo.payterm = UtilGen.addControl(fe, "Section", sap.m.ComboBox, "joSection",
            {
                editable: true,
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                    templateShareable: true
                },
                selectionChange: function (event) {

                }
                // layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "string", undefined, view, undefined, "@Digital/digital,Offset/offset,Outside Job/Outside Job");

        this.jo.ord_date = UtilGen.addControl(fe, "@Date", sap.m.DatePicker, "joord_date",
            {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"]
            },
            "date", undefined, view);
        // JOB NATURE
        this.jo.ord_ship = UtilGen.addControl(fe, "Job Nature", sap.m.SearchField, "joOrdShip",
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.jo.ord_ref, "", "", true);
                        return;
                    }

                    var sq = "select descr,reference from items where reference like '" + Util.nvl(sett["PRINT_ITEMS_JO"], "") + "%' order by descr";
                    Util.showSearchList(sq, "DESCR", "REFERENCE", function (valx, val) {
                        UtilGen.setControlValue(that.jo.ord_ship, val, valx, true);
                    });
                }
            },
            "string",
            undefined, view, undefined, undefined);

        //Ord_REF , Customer Code,
        this.jo.ord_ref = UtilGen.addControl(fe, "Customer", sap.m.SearchField, "joOrdRef",
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.jo.ord_ref, "", "", true);
                        return;
                    }

                    var sq = "select code,name title from c_ycust where iscust='Y' and childcount=0 order by code";
                    Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                        UtilGen.setControlValue(that.jo.ord_ref, val, valx, true);
                    });
                }
            },
            "string",
            undefined, view, undefined, undefined);
        this.jo.ord_empno = UtilGen.addControl(fe, "Sales Person", sap.m.SearchField, "joOrdEmp",
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.jo.ord_ref, "", "", true);
                        return;
                    }

                    var sq = "select no,name from salesp where type='S' order by no";
                    Util.showSearchList(sq, "NAME", "NO", function (valx, val) {
                        UtilGen.setControlValue(that.jo.ord_empno, val, valx, true);
                    });
                }
            },
            "string",
            undefined, view, undefined, undefined);
        this.jo.ord_shpdt = UtilGen.addControl(fe, "@Delivery Date", sap.m.DatePicker, "jodlv_date",
            {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"]
            },
            "date", undefined, view);
        this.jo.costcent =
            UtilGen.addControl(fe, "Cost Cent", sap.m.ComboBox, "joCostCent",
                {
                    editable: true,
                    items: {
                        path: "/",
                        template: new sap.ui.core.ListItem({text: "{TITLE} - {CODE}", key: "{CODE}"}),
                        templateShareable: true
                    },
                    selectionChange: function (event) {

                    }
                    // layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
                }, "string", undefined, view, undefined, "select code,title from accostcent1 order by 1");

        fe.push("#Status");

        // material steps.
        this.jo.mat_flag = UtilGen.addControl(fe, "Materials", sap.m.CheckBox, "jomat_flag",
            {
                enabled: false,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L1 M1 S1"})
            }, "string", undefined, view);
        this.jo.mat_open_date = UtilGen.addControl(fe, "@Open", sap.m.DatePicker, "jomat_opn",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);
        this.jo.mat_close_date = UtilGen.addControl(fe, "@Close", sap.m.DatePicker, "jomat_clos",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);

        //Design flag.
        this.jo.des_flag = UtilGen.addControl(fe, "Design", sap.m.CheckBox, "jodes_flag",
            {
                enabled: false,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L1 M1 S1"})
            }, "string", undefined, view);
        this.jo.des_open_date = UtilGen.addControl(fe, "@Open", sap.m.DatePicker, "jodes_opn",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);
        this.jo.des_close_date = UtilGen.addControl(fe, "@Close", sap.m.DatePicker, "jodes_clos",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);
        //Plate
        this.jo.plate_flag = UtilGen.addControl(fe, "Plate", sap.m.CheckBox, "joplate_flag",
            {
                enabled: false,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L1 M1 S1"})
            }, "string", undefined, view);
        this.jo.plate_open_date = UtilGen.addControl(fe, "@Open", sap.m.DatePicker, "joplate_opn",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);
        this.jo.plate_close_date = UtilGen.addControl(fe, "@Close", sap.m.DatePicker, "joplate_clos",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);


        //this.jo.mat_flag.trueValues = [2, 1];
        return UtilGen.formCreate("", true, fe);
    },
    loadData: function () {
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();
        UtilGen.setControlValue(this.jo.payterm, "Offset", "Offset", false);
        UtilGen.setControlValue(this.jo.location_code, sett["DEFAULT_LOCATION"]);
        view.byId("poMsgInv").setText("");
        if (this.qryStr == "") {
            var on = Util.getSQLValue("select nvl(max(ord_no),0)+1 from order1 where ord_code=" + this.vars.ord_code);
            UtilGen.setControlValue(this.jo.ord_no, on);
            UtilGen.setControlValue(this.jo.ord_date, new Date());
            this.jo.ord_no.setEnabled(true);
        } else {
            var dt = Util.execSQL("select *from order1 where ord_code=" + this.vars.ord_code + " and ord_no=" + Util.quoted(this.qryStr));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.loadDataFromJson(this.jo, dtx[0], true);
                this.jo.ord_no.setEnabled(false);
                UtilGen.setControlValue(this.jo.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                if (dtx[0].IS_ACTIVE == "Y") {
                    view.byId("poMsgInv").setText("Status is Active !");
                }
            }
        }
        this.loadData_details();
    },
    loadData_details: function () {
        var that = this;
        var sq = "select order2.*, ord_price*ord_allqty amount " +
            " from order2 where ord_no="
            + Util.quoted(this.qryStr)
            + " and ord_code="
            + this.vars.ord_code
            + " order by ord_pos";
        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                UtilGen.applyCols("C6P.JO1", that.qv, that);
                var c = that.qv.mLctb.getColPos("DESCR");
                that.qv.mLctb.cols[c].beforeSearchEvent = function (sq, ctx, model) {
                    var rfr = UtilGen.getControlValue(that.jo.ord_ship);
                    var rfr2 = Util.nvl(model.getProperty(ctx.sPath + "/DESCR"), "").trim().toUpperCase();
                    var rfrx = (rfr2.length > 0 ? " and upper(descr) like '%" + rfr2 + "%'" : "");
                    var s = sq.replace("positems", " positems where refer= " + Util.quoted(rfr) + rfrx);
                    return s;
                };

                that.qv.mLctb.parse("{" + data.data + "}", true);
                if (that.qv.mLctb.rows.length == 0)
                    that.qv.addRow();
                that.qv.loadData();
                that.do_summary(true);
                that.setItemSql();
            }
        });
        this.showExpenses(false);
    },
    do_summary: function (reAmt) {
        var that = this;
        reamt = Util.nvl(reAmt, false); // re calculate amount if require.
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var tbl = that.qv.getControl();

        var totamt = 0;
        for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
            var pr = parseFloat((Util.getCellColValue(tbl, i, 'ORD_PRICE')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
            var qt = parseFloat((Util.getCellColValue(tbl, i, 'ORD_PKQTY')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
            var amt = pr * qt;
            Util.setCellColValue(tbl, i, "AMOUNT", df.format(amt));
            totamt += amt;
        }
        UtilGen.setControlValue(this.o2.ord_amt, df.format(totamt));
        this.qv.updateDataToTable();
    },
    do_summary1: function (reAmt) {
        if (this.qv1 == undefined) return;
        var that = this;
        reamt = Util.nvl(reAmt, false); // re calculate amount if require.
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var tbl = that.qv1.getControl();
        var tbl2 = that.qv2.getControl();
        var totamt = 0;
        for (var i = 0; i < that.qv1.mLctb.rows.length; i++) {
            var pr = parseFloat((Util.getCellColValue(tbl, i, 'ORD_PRICE')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
            var qt = parseFloat((Util.getCellColValue(tbl, i, 'ORD_PKQTY')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
            var amt = pr * qt;
            Util.setCellColValue(tbl, i, "AMOUNT", df.format(amt));
            totamt += amt;
        }

        var totexp = that.view.byId("joMatExp");
        totexp.setText(df.format(totamt));
        this.vars.matexp = totamt;

        totamt = 0;

        for (var i = 0; i < that.qv2.mLctb.rows.length; i++) {
            var amt = parseFloat((Util.getCellColValue(tbl2, i, 'AMOUNT')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
            totamt += amt;
        }
        this.vars.otherexp = totamt;
        var txttotexp = that.view.byId("joOtherExp");
        txttotexp.setText(df.format(totamt));

        var totsal = UtilGen.getControlValue(this.o2.ord_amt);
        totexp = this.vars.matexp + this.vars.otherexp;
        var netpr = totsal - totexp;

        UtilGen.setControlValue(this.o2.ord_exp_amt, df.format(totexp));
        UtilGen.setControlValue(this.o2.net_profit, df.format(netpr));

        // UtilGen.setControlValue();
        this.qv1.updateDataToTable();
        this.qv2.updateDataToTable();
    },
    setItemSql: function () {
        var that = this;
        var sql = "select *from positems " +
            "order by descr";
        that.qv.mLctb.getColByName("DESCR").mSearchSQL = sql;

    },
    validateSave: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var cnts = {};

        for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
            var rn = Util.nvl(that.qv.mLctb.getFieldValue(i, "DESCR"), "");
            var rn1 = Util.nvl(that.qv.mLctb.getFieldValue(i, "ORD_REFER"), "");
            if (rn == "") {
                sap.m.MessageToast.show("Must  DESCR/ITEM  have value .. !");
                return false;
            }
            cnts[rn] = Util.nvl(cnts[rn], 0) + 1;
            if (cnts[rn] > 1) {
                sap.m.MessageToast.show("Must have Unique value for Item # " + rn);
                return false;
            }


        }

        if (this.qryStr != "") {
            var dt = Util.execSQL("select *from order1 where ord_code=601 and ord_no=" + this.qryStr);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.setControlValue(that.jo.mat_flag, dtx[0].MAT_FLAG);
                UtilGen.setControlValue(that.jo.mat_flag, dtx[0].DES_FLAG);
                UtilGen.setControlValue(that.jo.mat_flag, dtx[0].PLATE_FLAG);
            }
            var mat_flag = (UtilGen.getControlValue(that.jo.des_flag) == "N" ? 1 : 2);
            var des_flag = (UtilGen.getControlValue(that.jo.des_flag) == "N" ? 1 : 2);
            var plate_flag = (UtilGen.getControlValue(that.jo.plate_flag) == "N" ? 1 : 2);
            var stat = Util.getSQLValue("select is_active from order1 where ord_code=601 and ord_no=" + this.qryStr);

            if (mat_flag == 2 || des_flag == 2 || plate_flag == 2) {
                sap.m.MessageToast.show("One of (Steps) have been finished on this JO ! ");
                return false;
            }


            if (stat == "Y") {
                sap.m.MessageToast.show("Status is Active ! ");
                return false;
            }

            var stat = Util.getSQLValue("select nvl(max(ord_code),-1) from joined_order where ord_code!=601 and ord_reference=" + this.qryStr);
            var st = "";
            if (stat != -1) {
                st = (stat == 111 ? "Sales " : "Delivery");
                sap.m.MessageToast.show("Transaction is existed in " + st + " !");
                return false;
            }

        }


        this.do_summary(true);
        this.do_summary1(true);
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
            "ORD_CODE": this.vars.ord_code,
            "ORD_NO": UtilGen.getControlValue(that.jo.ord_no),
            "ORD_DATE": UtilGen.getControlValue(that.jo.ord_date),
            "ORD_REFER": UtilGen.getControlValue(that.jo.ord_ship),
            "ORD_FLAG": 2,
            "ORD_ITMAVER": 0,
            "YEAR": "2000",
            "DELIVEREDQTY": 0,
            "ORDEREDQTY": 0,
        };

        var defaultValues2 = {
            "PERIODCODE": sett["CURRENT_PERIOD"],
            "ORD_CODE": this.vars.ord_code + 1,
            "ORD_NO": UtilGen.getControlValue(that.jo.ord_no),
            "ORD_DATE": UtilGen.getControlValue(that.jo.ord_date),
            "ORD_FLAG": 2,
            "ORD_ITMAVER": 0,
            "YEAR": "2000",
            "DELIVEREDQTY": 0,
            "ORDEREDQTY": 0,
        };


        var custName = Util.getSQLValue("select name from c_ycust where code=" + Util.quoted(UtilGen.getControlValue(that.jo.ord_ref)));
        for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
            var vl = that.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
            that.qv.mLctb.setFieldValue(i, "ORD_ALLQTY", vl);
        }


        var mat_flag = (UtilGen.getControlValue(that.jo.mat_flag) == "N" ? 1 : 2);
        var des_flag = (UtilGen.getControlValue(that.jo.des_flag) == "N" ? 1 : 2);
        var plate_flag = (UtilGen.getControlValue(that.jo.plate_flag) == "N" ? 1 : 2);

        if (this.qryStr == "") {
            var cc = Util.quoted(Util.nvl(UtilGen.getControlValue(this.jo.costcent), UtilGen.getControlValue(this.jo.ord_no)));
            k = UtilGen.getSQLInsertString(this.jo, {
                "ord_code": this.vars.ord_code,
                "ord_flag": 2,
                "periodcode": Util.quoted(sett["CURRENT_PERIOD"]),
                "ORD_REFNM": Util.quoted(custName),
                "CREATED_BY": Util.quoted(sett["LOGON_USER"]),
                "CREATED_DATE": "sysdate",
                "MAT_FLAG": mat_flag,
                "DES_FLAG": des_flag,
                "PLATE_FLAG": plate_flag,
                "DELIVEREDQTY": 0,
                "ORDERDQTY": that.qv.mLctb.getSummaryOf("ORD_PKQTY"),
                "COSTCENT": cc
            }, ["mat_flag", "des_flag", "plate_flag", "costcent"]);

            k = "insert into order1 " + k + ";";
            if (Util.nvl(UtilGen.getControlValue(this.jo.costcent), "") == '') {
                var ccc = cc.replace(/'/g, '');
                k = k + " insert into accostcent1(code,title,type,CLOSECTG,path) values (" + cc + ",'JO # " + ccc + "',1,'a','XXX\\" + ccc + "' );";
            }

            var s1 = "";
            // sqls for insert string in order2 table.


            //qv for main sales quoted.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
                defaultValues["ORDEREDQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
                s1 += UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT"], defaultValues, true) + ";"
                s1 += that.updatePosItems(i);
            }


            // qv1 table for material expenses...
            if (this.qv1 != undefined) {

                for (var i = 0; i < this.qv1.mLctb.rows.length; i++) {
                    defaultValues2["ORD_ALLQTY"] = this.qv1.mLctb.getFieldValue(i, "ORD_PKQTY");
                    s1 += UtilGen.getInsertRowString(this.qv1.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT"], defaultValues2, true) + ";"
                }
            }

            // qv2 : table for labor expenses.
            if (this.qv2 != undefined) {
                for (var i = 0; i < this.qv2.mLctb.rows.length; i++) {
                    s1 += UtilGen.getInsertRowString(this.qv2.mLctb, "ORD_JO_EXP", i, ["DESCR"], {
                        "ORD_CODE": this.vars.ord_code,
                        "ORD_NO": UtilGen.getControlValue(that.jo.ord_no),
                    }, true) + ";"
                }
            }

            k = "begin " + k + s1 + " end; ";
        } else {
            k = UtilGen.getSQLUpdateString(this.jo, "order1",
                {
                    "ORD_REFNM": Util.quoted(custName),
                    "MODIFIED_BY": Util.quoted(sett["LOGON_USER"]),
                    "MODIFIED_DATE": "sysdate",
                    "MAT_FLAG": mat_flag,
                    "DES_FLAG": des_flag,
                    "PLATE_FLAG": plate_flag,
                    // "LAST_STATUS_DATE": Util.toOraDateString(UtilGen.getControlValue(this.jo.ord_date)),
                    "DELIVEREDQTY": 0,
                    "ORDERDQTY": that.qv.mLctb.getSummaryOf("ORD_PKQTY"),
                },
                "ord_code=" + Util.quoted(this.vars.ord_code) + " and  ord_no=" + Util.quoted(this.qryStr), ["mat_flag", "des_flag", "plate_flag"]) + ";";

            var s1 = "delete from order2 where ord_code in ("
                + this.vars.ord_code + "," + (this.vars.ord_code + 1) + ") and ord_no=" +
                this.qryStr + ";" +
                " delete from ORD_JO_EXP where ord_code=" + this.vars.ord_code + " and " +
                " ord_no = " + Util.quoted(this.qryStr) + ";";  // sqls for insert string in order2 table.

            //ON UPDATE : qv  sales table
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
                defaultValues["ORDEREDQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
                s1 += UtilGen.getInsertRowString(
                    this.qv.mLctb,
                    "order2",
                    i,
                    ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT"],
                    defaultValues
                    , true) + ";";
                s1 += that.updatePosItems(i);
            }


            // ON UPDATE:  QV1 table ( expenses )

            if (this.qv1 != undefined)
                for (var i = 0; i < this.qv1.mLctb.rows.length; i++) {
                    defaultValues2["ORD_ALLQTY"] = this.qv1.mLctb.getFieldValue(i, "ORD_PKQTY");
                    s1 += UtilGen.getInsertRowString(this.qv1.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT"], defaultValues2, true) + ";"
                }

            // ON UPDATE:  QV2 table ( LABOR expenses )
            if (this.qv2 != undefined) {
                for (var i = 0; i < this.qv2.mLctb.rows.length; i++) {
                    s1 += UtilGen.getInsertRowString(this.qv2.mLctb, "ORD_JO_EXP", i, ["DESCR"], {
                        "ORD_CODE": this.vars.ord_code,
                        "ORD_NO": UtilGen.getControlValue(that.jo.ord_no),
                    }, true) + ";"
                }
            }


            k = "begin " + k + s1 + " end;";
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
            that.joApp.backFunction();
        });
    }
    ,
    updatePosItems: function (r) {
        var that = this;
        var ld = this.qv.mLctb;
        var sq = "delete from positems where refer=:REFER and descr=:DESCR; ";
        var insq = sq + "insert into  positems ( KEYFLD, REFER, DESCR, DESCR2, ITEM_COLOR, " +
            "ITEM_SIZE, ADD_WORK, RECTO_VERSO, " +
            "SRNO, PAGES, SECTION, MACHINE, MATERIAL, PRICE)  values " +
            "( :KEYFLD, :REFER, :DESCR, '' , :ITEM_COLOR," +
            " :ITEM_SIZE, :ADD_WORK, :RECTO_VERSO, " +
            " :SRNO, :PAGES, :SECTION, :MACHINE, :MATERIAL, :PRICE); ";

        var sq1 = insq.replace(/:REFER/g, Util.quoted(UtilGen.getControlValue(this.jo.ord_ship)));
        sq1 = sq1.replace(/:KEYFLD/g, " (SELECT NVL(MAX(KEYFLD),0)+1 FROM POSITEMS) ");
        sq1 = sq1.replace(/:DESCR/g, Util.quoted(ld.getFieldValue(r, "DESCR")));
        sq1 = sq1.replace(/:ITEM_COLOR/g, Util.quoted(ld.getFieldValue(r, "ITEM_COLOR")));
        sq1 = sq1.replace(/:ITEM_SIZE/g, Util.quoted(ld.getFieldValue(r, "ITEM_SIZE")));
        sq1 = sq1.replace(/:ADD_WORK/g, Util.quoted(ld.getFieldValue(r, "ADD_WORK")));
        sq1 = sq1.replace(/:RECTO_VERSO/g, Util.quoted(ld.getFieldValue(r, "RECTO_VESO")));
        sq1 = sq1.replace(/:SRNO/g, Util.quoted(ld.getFieldValue(r, "SRNO")));
        sq1 = sq1.replace(/:PAGES/g, Util.quoted(ld.getFieldValue(r, "PAGES")));
        sq1 = sq1.replace(/:SECTION/g, Util.quoted(ld.getFieldValue(r, "SECTION")));
        sq1 = sq1.replace(/:MACHINE/g, Util.quoted(ld.getFieldValue(r, "MACHINE")));
        sq1 = sq1.replace(/:MATERIAL/g, Util.quoted(ld.getFieldValue(r, "MATERIAL")));
        sq1 = sq1.replace(/:PRICE/g, Util.quoted(Util.getNumber(ld.getFieldValue(r, "ORD_PRICE"))));
        return sq1;
        // var pls = "begin " + sq1 + " end;";
        // Util.doAjaxJson("sqlexe", pls, false).done(function (data) {
        //     console.log(data);
        //     if (data == undefined) {
        //         sap.m.MessageToast.show("Error: unexpected, check server admin");
        //         return;
        //     }
        //     if (data.ret != "SUCCESS") {
        //         sap.m.MessageToast.show("Error :" + data.ret);
        //         return;
        //     }
        // });

    },
    showExpenses: function (showScreen) {
        var that = this;
        var view = this.view;
        if (this.qv1 == undefined) {
            this.qv1 = new QueryView("tblExp1");
            this.qv2 = new QueryView("tblExp2");
            that.qv1.getControl().view = this.view;
            that.qv2.getControl().view = this.view;
            var sq = "select order2.*, ord_price*ord_allqty amount " +
                " from order2 where ord_no="
                + Util.quoted(this.qryStr)
                + " and ord_code="
                + (this.vars.ord_code + 1)
                + " order by ord_pos";

            var sq2 = "select O.*,C.NAME DESCR from ord_jo_exp O, c_ycust C  where c.code=o.refer " +
                " and o.ord_code=" + that.vars.ord_code + " and o.ord_no=" + Util.quoted(this.qryStr);

            this.qv1.getControl().view = this;
            this.qv2.getControl().view = this;
            this.qv1.getControl().addStyleClass("sapUiSizeCondensed");
            this.qv1.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
            this.qv1.getControl().setFixedBottomRowCount(0);
            this.qv1.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
            this.qv1.getControl().setVisibleRowCount(7);

            this.qv2.getControl().addStyleClass("sapUiSizeCondensed");
            this.qv2.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
            this.qv2.getControl().setFixedBottomRowCount(0);
            this.qv2.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
            this.qv2.getControl().setVisibleRowCount(7);


            this.qv2.onAddRow = function (idx, ld) {
                ld.setFieldValue(idx, "ORD_POS", idx + 1);
                ld.setFieldValue(idx, "AMOUNT", 0);
            };

            this.qv1.onAddRow = function (idx, ld) {
                ld.setFieldValue(idx, "ORD_POS", idx + 1);
                ld.setFieldValue(idx, "ORD_PKQTY", 1);
                ld.setFieldValue(idx, "ORD_ALLQTY", 1);
                ld.setFieldValue(idx, "ORD_PRICE", 0);
            };


            this.qv1.getControl().setEditable(true);

            Util.doAjaxJson("sqlmetadata", {sql: sq2}, false).done(function (data) {
                if (data.ret == "SUCCESS") {
                    that.qv2.setJsonStrMetaData("{" + data.data + "}");
                    UtilGen.applyCols("C6P.JO3", that.qv2, that);
                    // var c = that.qv2.mLctb.getColPos("DESCR");
                    that.qv2.mLctb.parse("{" + data.data + "}", true);
                    that.qv2.loadData();


                }
            });

            Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
                if (data.ret == "SUCCESS") {
                    that.qv1.setJsonStrMetaData("{" + data.data + "}");
                    UtilGen.applyCols("C6P.JO2", that.qv1, that);
                    that.qv1.mLctb.parse("{" + data.data + "}", true);
                    that.qv1.loadData();
                }
            });
            var tb = new sap.m.Toolbar();
            tb.addContent(new sap.m.Button({
                icon: "sap-icon://nav-back",
                press: function () {
                    that.joApp.toDetail(that.mainPage, "slide");
                }
            }));
            tb.addContent(new sap.m.ToolbarSpacer());
            tb.addContent(new sap.m.Text({text: "Expenses for Job Ord # " + that.qryStr}).addStyleClass("redText"));

            //----------------------------------------------------Adding material table.........

            var tb2 = new sap.m.Toolbar().addStyleClass("sapUiMediumMarginTop");
            tb2.addContent(UtilGen.rowButtonAdd(that.qv1));
            tb2.addContent(UtilGen.rowButtonDel(that.qv1));

            tb2.addContent(new sap.m.ToolbarSpacer());
            (this.view.byId("joMatExp") != undefined ? this.view.byId("joMatExp").destroy() : null);
            tb2.addContent(new sap.m.Title({text: "Material Expenses :"}));
            tb2.addContent(new sap.m.Text(view.createId("joMatExp"), {}));


            //----------------------------------------------------Adding expenses table.........

            var tbb2 = new sap.m.Toolbar().addStyleClass("sapUiMediumMarginTop");

            tbb2.addContent(UtilGen.rowButtonAdd(that.qv2));
            tbb2.addContent(UtilGen.rowButtonDel(that.qv2));
            tbb2.addContent(new sap.m.ToolbarSpacer());
            (this.view.byId("joOtherExp") != undefined ? this.view.byId("joOtherExp").destroy() : null);
            tbb2.addContent(new sap.m.Title({text: "Other Expenses :"}));
            tbb2.addContent(new sap.m.Text(view.createId("joOtherExp"), {}));

            this.pgDetail.addContent(tb);
            this.pgDetail.addContent(tb2);
            this.pgDetail.addContent(this.qv1.getControl());

            this.pgDetail.addContent(tbb2);
            this.pgDetail.addContent(this.qv2.getControl());
            this.do_summary1(true);
        }
        if (showScreen) {
            this.joApp.toDetail(this.pgDetail, "slide");
            // that.qv1.loadData();
        }
    }
});