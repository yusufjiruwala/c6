sap.ui.jsfragment("bin.forms.clinic.payment", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = oController.qryStr;
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

        Util.destroyID("payCmdSave", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("payCmdSave"), {
            icon: "sap-icon://save", press: function () {
                that.save_data();
            }
        }));
        Util.destroyID("poCmdPrint", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdPrint"), {
            icon: "sap-icon://print", press: function () {
                if (view.byId("payCmdSave").getEnabled())
                    that.save_data(true);
                else that.printInv();
            }
        }));
        Util.destroyID("payCmdInv", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("payCmdInv"), {
            icon: "sap-icon://open-folder", text: "Invoice", press: function () {
                that.openInv();
            }
        }));

        this.frm.getToolbar().addContent(new sap.m.ToolbarSpacer());
        Util.destroyID("chkPost", this.view);
        this.frm.getToolbar().addContent(new sap.m.CheckBox(this.view.createId("chkPost"), {
            text: "Post ?",
            selected: true
        }));
        // that.createScrollCmds(this.frm.getToolbar());

        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);

        this.mainPage.addContent(sc);
    },
    createViewHeader: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var fe = [];
        this.fa = {};
        this.fa.ord_amt = UtilGen.addControl(fe, "Total Amount", sap.m.Input, "poOrdAmt",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"], this.view);

        this.fa.paid_1_type = UtilGen.addControl(fe, "Paid Type 1", sap.m.ComboBox, "pyT1",
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{NAME}", key: "{NO}"}),
                    templateShareable: true
                }
            }, "string", undefined, this.view, undefined, "select no,descr NAME from INVOICETYPE " +
            " where location_code=" + Util.quoted(sett['DEFAULT_LOCATION']) + " ORDER BY NO");

        this.fa.paid_amt_1 = UtilGen.addControl(fe, "Payment Type 1", sap.m.Input, "pyA1",
            {
                editable: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"}),
                change: function (e) {
                    // var sett = sap.ui.getCore().getModel("settings").getData();
                    // var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);

                    var a = UtilGen.getControlValue(that.fa.paid_amt_1);
                    var o = UtilGen.getControlValue(that.fa.ord_amt);
                    if (o - a > 0)
                        UtilGen.setControlValue(that.fa.paid_amt_2, (o - a), (o - a), true);
                }
            }, "number", sett["FORMAT_MONEY_1"], this.view);

        this.fa.paid_2_type = UtilGen.addControl(fe, "Paid Type 2", sap.m.ComboBox, "pyT2",
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{NAME}", key: "{NO}"}),
                    templateShareable: true
                }
            }, "string", undefined, this.view, undefined, "select no,DESCR name from INVOICETYPE where location_code=" + Util.quoted(sett['DEFAULT_LOCATION']) + " ORDER BY NO");

        this.fa.paid_amt_2 = UtilGen.addControl(fe, "Paid Amt 2", sap.m.Input, "pyAmt2",
            {
                editable: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"], this.view);

        return UtilGen.formCreate("", true, fe);
        // return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        // UtilGen.setControlValue(this.fa.keyfld, this.qryStr);

        if (this.qryStr != "") {
            var dt = Util.execSQL("select sum(ord_price*ord_allqty) amount, " +
                " c.paid_amt_1,c.paid_amt_2 , c.paid_1_type, c.paid_2_type,c.flag from " +
                " order1 o1,order2 o2 , cl6_appoint c " +
                "  where c.keyfld=o1.ord_reference and " +
                " o1.ord_no=o2.ord_no and " +
                "  o1.ord_code=o2.ord_code and " +
                "  o1.ord_code=111 and o1.ord_reference=" + this.qryStr + " " +
                " group by c.flag ,c.paid_amt_1,c.paid_amt_2 , c.paid_1_type, c.paid_2_type");
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;

                if (dtx[0].FLAG == 1 && that.fa.paid_1_type.getItems().length > 0)
                    that.fa.paid_1_type.setSelectedItem(that.fa.paid_1_type.getItems()[0]);

                var pa1 = parseFloat(Util.nvl(dtx[0].PAID_AMT_1, "0"));
                var pa2 = parseFloat(Util.nvl(dtx[0].PAID_AMT_2, "0"));
                var amt = parseFloat(Util.nvl(dtx[0].AMOUNT, "0"));

                UtilGen.setControlValue(this.fa.ord_amt, amt, amt, true);
                UtilGen.setControlValue(this.fa.paid_amt_1, amt, amt, true);
                UtilGen.setControlValue(this.fa.paid_amt_2, 0, 0, true);


                if (Util.nvl(dtx[0].PAID_1_TYPE, "") != "") {
                    UtilGen.setControlValue(that.fa.paid_1_type, dtx[0].PAID_1_TYPE, dtx[0].PAID_1_TYPE, true);
                    UtilGen.setControlValue(that.fa.paid_amt_1, pa1, pa1, true);
                }
                if (Util.nvl(dtx[0].PAID_2_TYPE, "") != "") {
                    UtilGen.setControlValue(that.fa.paid_2_type, dtx[0].PAID_2_TYPE, dtx[0].PAID_2_TYPE, true);
                    UtilGen.setControlValue(that.fa.paid_amt_2, pa2, pa2, true);
                }

                if (dtx[0].FLAG != 1) {
                    that.view.byId("payCmdSave").setEnabled(false);
                    that.fa.paid_2_type.setEditable(false);
                    that.fa.paid_1_type.setEditable(false);
                    that.fa.paid_amt_1.setEditable(false);
                    that.fa.paid_amt_2.setEditable(false);

                }

            }
        }
        else
            that.oController.backFunction();

    }
    ,
    validateSave: function () {
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var that = this;
        var a = parseFloat(UtilGen.getControlValue(that.fa.paid_amt_1));
        var o = parseFloat(UtilGen.getControlValue(that.fa.ord_amt));
        var t1 = Util.nvl(UtilGen.getControlValue(that.fa.paid_1_type), "");
        var t2 = Util.nvl(UtilGen.getControlValue(that.fa.paid_2_type), "");


        var a2 = parseFloat(Util.nvl(UtilGen.getControlValue(that.fa.paid_amt_2), 0));
        if (a + a2 != o) {
            sap.m.MessageToast.show("Err ! payment not matched with Amount # " + df.format(o));
            return false;
        }
        if (a2 > 0 && t2 == "") {
            sap.m.MessageToast.show("Err ! Type 2 must assign ! ");
            return false;
        }


        return true;
    }
    ,
    save_data: function (pritn) {

        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var usr = sett["LOGON_USER"];
        if (!this.validateSave())
            return;
        var k = "";
        var cod1 = Util.getSQLValue("SELECT ACCNO FROM INVOICETYPE" +
            "    WHERE NO=" + UtilGen.getControlValue(this.fa.paid_1_type) + " and " +
            "   LOCATION_CODE=" + Util.quoted(sett["DEFAULT_LOCATION"]));
        var cod2 = "";
        if (UtilGen.getControlValue(this.fa.paid_2_type) != "")
            cod2 = Util.getSQLValue("SELECT ACCNO FROM INVOICETYPE" +
                "    WHERE NO=" + UtilGen.getControlValue(this.fa.paid_2_type) + " and " +
                "   LOCATION_CODE=" + Util.quoted(sett["DEFAULT_LOCATION"]));
        k = UtilGen.getSQLUpdateString(this.fa, "cl6_appoint",
            {
                "PAY_1_CODE": Util.quoted(cod1),
                "PAY_2_CODE": Util.quoted(cod2)
            },
            " keyfld = " + Util.quoted(this.qryStr), ["keyfld"], true);
        var postSql = "";
        if (that.view.byId("chkPost").getSelected()) {
            var on = Util.getSQLValue("select ord_no from order1 where ord_code=111 and ord_reference=" + this.qryStr);
            postSql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                " where ord_code=111 and ord_no=" + on + ";" +
                "X_POST_APPOINT(" + this.qryStr + ");" +
                " update order1 set approved_by='" + usr + "' where ord_code=111 and ord_no=" + on + ";";

        }
        k = "begin " + k + ";" + postSql + " end;"
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
            if (pritn)
                that.printInv();
            that.oController.backFunction(that.oController.oA.getProperty("startDate"));
        });
    },
    printInv: function () {
        var that = this;
        if (Util.nvl(this.qryStr, "") == "")
            return;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var plsql = "";

        var oc = 111;
        var preFileName = "CL";
        var on = Util.getSQLValue("select ord_no from order1 where ord_code=111 and ord_reference=" + this.qryStr);
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
    openInv: function () {
        var that = this;
        if (Util.nvl(this.qryStr, "") == "")
            return;

        var on = Util.getSQLValue("select nvl(max(ord_no),'') from order1 where ord_code=111 and ord_reference=" + this.qryStr);
        if (on == "") {
            sap.m.MessageToast.show("No Invoice Found !");
            return;
        }
        that.oController.openInv();
    }
})
;



