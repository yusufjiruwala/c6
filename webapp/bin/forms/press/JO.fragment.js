sap.ui.jsfragment("bin.forms.press.JO", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 601,
            onm: ""
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

        var sc = new sap.m.ScrollContainer();

        sc.addContent(sf);

        sc.addContent(this.qv.getControl());
        this.mainPage.addContent(sc);
        // this.createViewFooter(sc);

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
    },
    do_summary: function (reAmt) {
        var that = this;
        reamt = Util.nvl(reAmt, false); // re calculate amount if require.
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var tbl = that.qv.getControl();

        for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
            var pr = parseFloat((Util.getCellColValue(tbl, i, 'ORD_PRICE')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
            var qt = parseFloat((Util.getCellColValue(tbl, i, 'ORD_PKQTY')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
            var amt = pr * qt;
            Util.setCellColValue(tbl, i, "AMOUNT", df.format(amt));
        }
        this.qv.updateDataToTable();
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
        }


        this.do_summary(true);
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
            "ORDEREDQTY": 0
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
            k = UtilGen.getSQLInsertString(this.jo, {
                "ord_code": this.vars.ord_code,
                "ord_flag": 2,
                "periodcode": Util.quoted(sett["CURRENT_PERIOD"]),
                "ORD_REFNM": Util.quoted(custName),
                "CREATED_BY": Util.quoted(sett["LOGON_USER"]),
                "CREATED_DATE": "sysdate",
                "MAT_FLAG": mat_flag,
                "DES_FLAG": des_flag,
                "PLATE_FLAG": plate_flag
                "LAST_READY_DATE": Utul.toOraDateString(this.jo.ord_date)
            }, ["mat_flag", "des_flag", "plate_flag"]);
            k = "insert into order1 " + k + ";";
            var s1 = "";
            // sqls for insert string in order2 table.

            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");

                s1 += UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT"], defaultValues, true) + ";"
                s1 += that.updatePosItems(i);
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
                    "LAST_READY_DATE": Util.toOraDateString(this.jo.ord_date)

                },
                "ord_code=" + Util.quoted(this.vars.ord_code) + " and  ord_no=" + Util.quoted(this.qryStr), ["mat_flag", "des_flag", "plate_flag"]) + ";";

            var s1 = "delete from order2 where ord_code=" + this.vars.ord_code + " and ord_no=" + this.qryStr + ";";  // sqls for insert string in order2 table.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                defaultValues["ORD_ALLQTY"] = this.qv.mLctb.getFieldValue(i, "ORD_PKQTY");
                s1 += UtilGen.getInsertRowString(this.qv.mLctb, "order2", i, ["AMOUNT", "DESCR2", "DISCP", "LC_AMOUNT"], defaultValues, true) + ";"
                s1 += that.updatePosItems(i);
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

    }
})
;



