sap.ui.jsfragment("bin.forms.pos.booking", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        that.qryStrB = "";
        this.qryStrBNo = "";
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 106,
            onm: ""
        };
        this.existed = false;
        var url = new URL(window.location.href);
        var callId = url.searchParams.get("caller");
        if (callId != undefined)
            that.qryStr = callId;
        // this.pgDetail = new sap.m.Page({showHeader: false});
        //
        // this.bk = new sap.m.Button({
        //     icon: "sap-icon://nav-back",
        //     press: function () {
        //         that.joApp.backFunction();
        //     }
        // });

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

        // this.frm.getToolbar().addContent(this.bk);

        Util.destroyID("poCmdSave", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave"), {
            text: "{i18n>save}", icon: "sap-icon://save", press: function () {
                that.save_data();
            }
        }));

        Util.destroyID("poCmdDel", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdDel"), {
            text: "{i18n>delete}", icon: "sap-icon://delete", press: function () {
                that.delete_data();
            }
        }));
        Util.destroyID("poCmdList", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdList"), {
            text: "{i18n>list}",
            icon: "sap-icon://list",
            press: function () {
                that.show_list();
            }
        }));

        Util.destroyID("poCmdNew", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdNew"), {
            text: "{i18n>new_ord}",
            icon: "sap-icon://add-document",
            press: function () {
                that.qryStr = "";
                that.qryStrB = "";
                that.loadData();
            }
        }));

        // that.createScrollCmds(this.frm.getToolbar());

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


        this.mainPage.addContent(sc);

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

        this.o2.ord_amt =
            UtilGen.addControl(fe, "Amount", sap.m.Input, "sumAMt",
                {
                    editable: false,
                    layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
                }, "number", sett["FORMAT_MONEY_1"], this.view);

        var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
        frm.setToolbar(undefined);
        frm.destroyToolbar();

        sc.addContent(frm);
        sc.addContent(new sap.m.VBox({height: "200px"}));

    },

    createViewHeader: function () {
        var that = this;
        var fe = [];
        this.fa = {};
        var t1 = "XL3 L1 M1 S12";
        var t2 = "XL3 L3 M3 S12";
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.fa.code = UtilGen.addControl(fe, "{i18n>tel}", sap.m.Input, "custTel",
            {
                enabled: true,
                // layoutData: new sap.ui.layout.GridData({span: t1}),

            }, "string", undefined, this.view);
        this.fa.code.addEventDelegate({
            onfocusout: function (e) {
                if (that.qryStrB == "" && that.fa.code.getEditable()) {
                    // that.qryStr = UtilGen.getControlValue(that.fa.code);
                    var cod = that.fa.code.getValue();
                    var dt = Util.execSQL("select *from poscustomer where code=" + Util.quoted(cod));
                    if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                        var dtx = JSON.parse("{" + dt.data + "}").data;
                        if (dtx.length > 0)
                            UtilGen.loadDataFromJson(that.fa, dtx[0], true);
                        else {
                            UtilGen.resetDataJson(that.fa);
                            UtilGen.setControlValue(that.fa.code, cod, cod, true);
                        }

                    }
                }
            }
        });

        this.fa.name = UtilGen.addControl(fe, "{i18n>custName}", sap.m.Input, "custName",
            {
                enabled: true,
                // layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);
        this.fa.area = UtilGen.addControl(fe, "{i18n>area}", sap.m.Input, "custArea",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);
        this.fa.addr_block = UtilGen.addControl(fe, "@{i18n>block}", sap.m.Input, "custBlock",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);
        this.fa.tel = UtilGen.addControl(fe, "@{i18n>othertel}", sap.m.Input, "custotherTel",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);
        this.fa.addr_street = UtilGen.addControl(fe, "{i18n>street}", sap.m.Input, "custStreet",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);

        //ADDR_JEDDA
        this.fa.addr_jedda = UtilGen.addControl(fe, "@{i18n>jedda}", sap.m.Input, "custJedda",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);

        //addr_bldg
        this.fa.addr_bldg = UtilGen.addControl(fe, "@{i18n>building}", sap.m.Input, "custBuilding",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);


        //addr_floor
        this.fa.addr_floor = UtilGen.addControl(fe, "{i18n>floor}", sap.m.Input, "custFloor",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);

        //addr_flat
        this.fa.addr_flat = UtilGen.addControl(fe, "@{i18n>flat}", sap.m.Input, "custFlat",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);

        // this.fa.addr_flat = UtilGen.addControl(fe, "@{flat>}", sap.m.Input, "custFlat2",
        //     {
        //         layoutData: new sap.ui.layout.GridData({span: t1}),
        //     }, "string", undefined, this.view);
        //SPEC_COMMENTS
        this.fa.remark = UtilGen.addControl(fe, "{i18n>remarks}", sap.m.Input, "custComments",
            {
                // layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);

        //complains
        //email

        fe.push("#{i18n>booking_date}");
        this.fa._location_code = UtilGen.addControl(fe, "{i18n>location}", sap.m.ComboBox, "location_code", {
            customData: [{key: ""}],
            layoutData: new sap.ui.layout.GridData({span: t2}),
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectionChange: function (event) {

            }
        }, "string", undefined, this.view, undefined, "select code,name from locations order by 1");

        this.fa._slsmn = UtilGen.addControl(fe, "@{i18n>slsname}", sap.m.ComboBox, "slsmn", {
            customData: [{key: ""}],
            layoutData: new sap.ui.layout.GridData({span: t2}),
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectionChange: function (event) {

            }
        }, "string", undefined, this.view, undefined, "select NO code,name from SALESP WHERE TYPE='S'  order by 1");
        this.fa._slsmn.setSelectedItem(this.fa._slsmn.getItems()[0]);

        this.fa._inv_date = UtilGen.addControl(fe, "{i18n>booking_date}", sap.m.DatePicker, "ord_date", {
            valueFormat: sett["ENGLISH_DATE_FORMAT"],
            displayFormat: sett["ENGLISH_DATE_FORMAT"],
            layoutData: new sap.ui.layout.GridData({span: t2}),
        }, "date", undefined, this.view);

        this.fa._dlv_time = UtilGen.addControl(fe, "@{i18n>delivery_time}", sap.m.DateTimePicker, "dlvTime",
            {
                editable: true,
                layoutData: new sap.ui.layout.GridData({span: t2}),
            }, "date", undefined, this.view);

        this.fa._dlv_time.setValueFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        this.fa._dlv_time.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");


        // UtilGen.setControlValue(this.fa._dlv_time, new Date(), new Date(), true);
        // return UtilGen.formCreate("", true, fe);
        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var view = this.view;
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.fa.code.setEnabled(true);
        this.existed = false;
        this.qryStrBNo = "";
        if (this.qryStrB == "") {
            if (this.qryStr == "") {
                UtilGen.resetDataJson(this.fa);
                setTimeout(function () {
                    that.fa.code.focus();
                }, 500);

            } else {
                this.fa.code.setEnabled(false);
                var dt = Util.execSQL("select *from poscustomer where code=" + Util.quoted(this.qryStr));
                if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    if (dtx.length > 0) {
                        UtilGen.loadDataFromJson(this.fa, dtx[0], true);
                        this.fa.code.setEnabled(false);
                        this.existed = true;
                    }
                    else {
                        UtilGen.resetDataJson(this.fa);
                        UtilGen.setControlValue(this.fa.code, this.qryStr, this.qryStr, true);
                        this.existed = false;
                    }
                }
            }
            UtilGen.setControlValue(this.fa._location_code, sett["DEFAULT_LOCATION"], sett["DEFAULT_LOCATION"], true);
            UtilGen.setControlValue(this.fa._inv_date, new Date(), new Date(), true);

        } else {
            var dt = Util.execSQL("select *from POS_ONPUR1 where keyfld=" + this.qryStrB);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                if (dtx.length > 0) {
                    UtilGen.setControlValue(this.fa._location_code, dtx[0].LOCATION_CODE, dtx[0].LOCATION_CODE, true);
                    UtilGen.setControlValue(this.fa._slsmn, dtx[0].SLSMN, dtx[0].SLSMN, true);
                    UtilGen.setControlValue(this.fa._inv_date, dtx[0].B_DATE, dtx[0].B_DATE, true);
                    UtilGen.setControlValue(this.fa._dlv_time, dtx[0].DELIVERY_DATETIME, dtx[0].DELIVERY_DATETIME, true);
                    this.qryStr = dtx[0].CUST_REFERENCE;
                    this.qryStrBNo = dtx[0].B_NO;
                    var dtt = Util.execSQL("select *from poscustomer where code=" + Util.quoted(this.qryStr));
                    if (dtt.ret = "SUCCESS" && dtt.data.length > 0) {
                        var dttx = JSON.parse("{" + dtt.data + "}").data;
                        if (dttx.length > 0) {
                            UtilGen.loadDataFromJson(this.fa, dttx[0], true);
                            this.fa.code.setEnabled(false);
                            this.existed = true;
                        }
                    }
                }
            }
        }

        this.loadData_details();

        setTimeout(function () {
            that.fa.name.focus();
        }, 200);

    }
    ,
    loadData_details: function () {
        var that = this;
        var sq = "select p.*,i.descr,p.price*(p.allqty/p.pack) amount from pos_onpur2 p,items i " +
            "where p.keyfld=" +
            Util.quoted(this.qryStrB) +
            " and p.refer=i.reference "
            + " order by itempos";
        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                UtilGen.applyCols("C6L.POS1", that.qv, that);
                that.qv.mLctb.parse("{" + data.data + "}", true);
                if (that.qv.mLctb.rows.length == 0)
                    that.qv.addRow();
                var c = that.qv.mLctb.getColPos("REFER");
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
    validateSave: function () {
        var objs = [this.fa.code, this.fa.name, this.fa._location_code, this.fa._inv_date, this.fa._dlv_time, this.fa._slsmn];
        if (UtilGen.showErrorNoVal(objs) > 0)
            return false;

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
        // var defaultValues = {};
        var kfld = Util.nvl(this.qryStrB, "(select nvl(max(keyfld),0)+1 from pos_onpur1)");
        var b_no = Util.nvl(this.qryStrBNo, "(select nvl(max(b_no),0)+1 from pos_onpur1)");


        // if (this.qryStr == "") {
        var kdel = "delete from poscustomer where code=" + Util.quoted(UtilGen.getControlValue(this.fa.code)) + ";";
        k = UtilGen.getSQLInsertString(this.fa, {});
        k = kdel + " insert into poscustomer " + k + ";";
        // } else
        //     k = UtilGen.getSQLUpdateString(this.fa, "poscustomer", {},
        //         "code=" + Util.quoted(this.qryStr)) + " ;"

        // deleting and re-inserting order...

        var kk = " delete from pos_onpur1 where keyfld=:KEYFLD ;" +
            " delete from pos_onpur2 where keyfld=:KEYFLD ;  " +
            "insert into pos_onpur1(KEYFLD, LOCATION_CODE, B_KIND, B_NO, B_DATE, B_DATETIME,"
            + " DELIVERY_DATETIME, CUST_REFERENCE, TABLE_CODE,"
            + " FLAG, CLOSING_TIME, INV_AMT, DISC_AMT, SLSMN, CUST_COUNTS,"
            + " AREA, TEL, HOME_ADDRESS, WORK_ADDRESS, EMAIL, BDETAIL, "
            + " BCUST, TERMOFPAY, REMARK, REFERENCE, SPEC_COMMENTS, COMPLAINS, "
            + " LAST_DRIVER, ADDR_AREA, ADDR_BLOCK, ADDR_JEDDA, ADDR_STREET, ADDR_BLDG, ADDR_TEL , ADDR_FLOOR ,"
            + " ADDR_R_AREA, ADDR_R_BLOCK, ADDR_R_JEDDA, ADDR_R_STREET, ADDR_R_BLDG, ADDR_R_TEL , "
            + " ADDR_R_FLOOR, CUST_NAME, PICK_UP,RECIPIENT_ADDRESS "
            + ") VALUES "
            + "(:KEYFLD, :LOCATION_CODE, :B_KIND, :B_NO, :B_DATE, :B_DATETIME,"
            + ":DELIVERY_DATETIME, :CUST_REFERENCE, :TABLE_CODE,"
            + " :FLAG, :CLOSING_TIME, (SELECT NVL(SUM((PRICE/PACK)*ALLQTY),0) FROM POS_ONPUR2 WHERE KEYFLD= :KEYFLD ) , "
            + " :DISC_AMT, :SLSMN, :CUST_COUNTS,"
            + " :AREA, :TEL, :HOME_ADDRESS, :WORK_ADDRESS, :EMAIL, :BDETAIL,"
            + " :BCUST, :TERMOFPAY, :REMARK, :REFERENCE, :SPEC_COMMENTS, :COMPLAINS,"
            + " :LAST_DRIVER, :ADDR_AREA, :ADDR_BLOCK, :ADDR_JEDDA, :ADDR_STREET, :ADDR_BLDG, :ADDR_TEL, :ADDR_FLOOR,"
            + " :ADDR_R_AREA, :ADDR_R_BLOCK, :ADDR_R_JEDDA, :ADDR_R_STREET, :ADDR_R_BLDG, :ADDR_R_TEL, :ADDR_R_FLOOR , :CUST_NAME, :PICK_UP ,:RECIPIENT_ADDRESS "
            + "); ";

        kk = kk.replace(/:KEYFLD/g, kfld);
        kk = kk.replace(/:B_NO/g, b_no);
        kk = kk.replace(/:LOCATION_CODE/g, Util.quoted(UtilGen.getControlValue(this.fa._location_code)));
        kk = kk.replace(/:B_KIND/g, Util.quoted("DELIVERY"));
        kk = kk.replace(/:B_DATETIME/g, Util.toOraDateString(UtilGen.getControlValue(this.fa._inv_date)));
        kk = kk.replace(/:B_DATE/g, Util.toOraDateString(UtilGen.getControlValue(this.fa._inv_date)));
        kk = kk.replace(/:DELIVERY_DATETIME/g, Util.toOraDateTimeString(UtilGen.getControlValue(this.fa._dlv_time)));
        kk = kk.replace(/:CUST_REFERENCE/g, Util.quoted(UtilGen.getControlValue(this.fa.code)));
        kk = kk.replace(/:TABLE_CODE/g, Util.quoted(""));
        kk = kk.replace(/:FLAG/g, 1);
        kk = kk.replace(/:CLOSING_TIME/g, 'null');
        kk = kk.replace(/:DISC_AMT/g, 0);
        kk = kk.replace(/:SLSMN/g, 1);
        kk = kk.replace(/:CUST_COUNTS/g, 1);
        kk = kk.replace(/:AREA/g, Util.quoted(UtilGen.getControlValue(this.fa.area)));
        kk = kk.replace(/:TEL/g, Util.quoted(UtilGen.getControlValue(this.fa.code)));
        kk = kk.replace(/:HOME_ADDRESS/g, Util.quoted(""));
        kk = kk.replace(/:WORK_ADDRESS/g, Util.quoted(""));
        kk = kk.replace(/:EMAIL/g, Util.quoted(""));
        kk = kk.replace(/:BDETAIL/g, Util.quoted(""));
        kk = kk.replace(/:BCUST/g, Util.quoted(""));
        kk = kk.replace(/:TERMOFPAY/g, Util.quoted(""));
        kk = kk.replace(/:REMARK/g, Util.quoted(UtilGen.getControlValue(this.fa.remark)));
        kk = kk.replace(/:REFERENCE/g, Util.quoted(""));
        kk = kk.replace(/:SPEC_COMMENTS/g, Util.quoted(UtilGen.getControlValue(this.fa.remark)));
        kk = kk.replace(/:COMPLAINS/g, Util.quoted(""));
        kk = kk.replace(/:LAST_DRIVER/g, Util.quoted(""));
        kk = kk.replace(/:ADDR_AREA/g, Util.quoted(UtilGen.getControlValue(this.fa.area)));
        kk = kk.replace(/:ADDR_BLOCK/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_block)));
        kk = kk.replace(/:ADDR_JEDDA/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_jedda)));
        kk = kk.replace(/:ADDR_STREET/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_street)));
        kk = kk.replace(/:ADDR_BLDG/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_bldg)));
        kk = kk.replace(/:ADDR_TEL/g, Util.quoted(UtilGen.getControlValue(this.fa.code)));
        kk = kk.replace(/:ADDR_FLOOR/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_floor)));
        kk = kk.replace(/:ADDR_R_AREA/g, Util.quoted(""));
        kk = kk.replace(/:ADDR_R_BLOCK/g, Util.quoted(""));
        kk = kk.replace(/:ADDR_R_JEDDA/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_jedda)));
        kk = kk.replace(/:ADDR_R_STREET/g, Util.quoted(""));
        kk = kk.replace(/:ADDR_R_BLDG/g, Util.quoted(""));
        kk = kk.replace(/:ADDR_R_TEL/g, Util.quoted(""));
        kk = kk.replace(/:ADDR_R_FLOOR/g, Util.quoted(""));
        kk = kk.replace(/:CUST_NAME/g, Util.quoted(UtilGen.getControlValue(this.fa.name)));
        kk = kk.replace(/:PICK_UP/g, Util.quoted("N"));
        kk = kk.replace(/:RECIPIENT_ADDRESS/g, Util.quoted("N"));


        // saving pos_onpur2
        var kkfld = (this.qryStrB == "" ? Util.getSQLValue("select nvl(max(keyfld),0)+1 from pos_onpur1") : kfld);
        var bb_no = (this.qryStrB == "" ? Util.getSQLValue("select nvl(max(b_no),0)+1 from pos_onpur1") : b_no);
        var defaultValues = {
            "KEYFLD": kkfld,
            "B_NO": bb_no,
            "B_KIND": 'DELIVERY',
            "FLAG": 1,
            "B_DATE": UtilGen.getControlValue(this.fa._inv_date),
            "QTY": 0,
            "LOCATION_CODE": UtilGen.getControlValue(this.fa._location_code)

        };
        var c = that.qv.mLctb.getColPos("PRD_DATE");
        this.qv.mLctb.cols[c].getMUIHelper().data_type = "VARCHAR2"
        var c = that.qv.mLctb.getColPos("EXP_DATE");
        this.qv.mLctb.cols[c].getMUIHelper().data_type = "VARCHAR2"
        var s1 = "";
        // sqls for insert string in order2 table.
        for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
            var rfr = this.qv.mLctb.getFieldValue(i, "REFER");
            var p1 = "(select prd_dt from items where reference=" + Util.quoted(rfr) + ")";
            var p2 = "(select exp_dt from items where reference=" + Util.quoted(rfr) + ")";
            defaultValues["ALLQTY"] = this.qv.mLctb.getFieldValue(i, "PKQTY");
            defaultValues["UNITD"] = 'PCS';
            defaultValues["PRD_DATE"] = p1;
            defaultValues["EXP_DATE"] = p2;

            s1 += (UtilGen.getInsertRowString(this.qv.mLctb, "pos_onpur2", i, ["AMOUNT", "DESCR"], defaultValues, true) + ";");
            s1 = s1.replace(Util.quoted(p1), p1);
            s1 = s1.replace(Util.quoted(p2), p2);
        }

        // kk = kk.replace(/:/g,);
        k = "begin " + k + kk + s1 + " end;";

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

            sap.m.MessageToast.show("Saved Successfully !,  Enter New category..!");
            that.qryStr = "";
            that.qryStrB = "";
            that.loadData();
        });
    }
    ,
    show_list: function () {
        var that = this;
        var sq = "select l.name location_name , p.b_no," +
            "p.cust_reference tel,p.cust_name,p.b_date," +
            "p.keyfld from pos_onpur1 p,locations l  where p.saleinv is null and l.code=p.location_code order by b_date desc ";
        var fnOnSelect = function (data) {
            if (data != undefined && data.length <= 0)
                return;
            that.qryStr = data.TEL;
            that.qryStrB = data.KEYFLD;
            that.loadData();
            return true;
        };

        Util.show_list(sq, ["CUST_NAME", "TEL"],
            undefined, fnOnSelect, "100%", "100%", 10, false, undefined);
    },

    do_summary: function (reAmt) {
        var that = this;
        reamt = Util.nvl(reAmt, false); // re calculate amount if require.
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var tbl = that.qv.getControl();
        if (reamt)
            for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
                var pr = parseFloat((Util.getCellColValue(tbl, i, 'PRICE')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
                var qt = parseFloat((Util.getCellColValue(tbl, i, 'PKQTY')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
                var pk = parseFloat(Util.getCellColValue(tbl, i, 'PACK'));
                var amt = pr * (qt);
                var vamt = 0;
                Util.setCellColValue(tbl, i, "AMOUNT", df.format(amt));
            }
        this.qv.updateDataToTable();
        var sum = 0;
        var ld = that.qv.mLctb;
        df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        for (var i = 0; i < ld.rows.length; i++) {
            var val = (that.qv.mLctb.getFieldValue(i, "AMOUNT") + "").toString().replace(/[^\d\.]/g, '').replace(/,/g, '');
            val = parseFloat(df.formatBack(val));
            sum += val;
        }
        UtilGen.setControlValue(that.o2.ord_amt, sum, sum, true);
    }

});



