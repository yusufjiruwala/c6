sap.ui.jsfragment("bin.forms.fitness.payments", {

    createContent: function (oController) {
        jQuery.sap.require("sap.ui.commons.library");
        this.view = oController.getView();
        var that = this;
        this.vars = {
            hydro_refer: "",
            pt_refer: "",
            rehab_refer: "",
            hydro_price: 0,
            pt_price: 0,
            rehab_price: 0
        };
        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.mainPage.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        this.mode = "system";
        this.createView();

        this.qryStr = "";
        return this.mainPage;
    },
    createView: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

        this.subs = {};
        this.qryStr = "";

        UtilGen.clearPage(this.mainPage);
        this.qryStr = "";
        var tb = new sap.m.Toolbar({content: [that.bk]});


        this.subs._athlet_code = UtilGen.createControl(sap.m.Text, this.view, "inv_athlet_code",
            {}, "string");
        this.subs.invoice_date = UtilGen.createControl(sap.m.DatePicker, this.view, "inv_date",
            {}, "date");
        this.subs.invoice_descr = UtilGen.createControl(sap.m.Input, this.view, "inv_inv_descr",
            {}, "string");
        this.subs.cash_code = UtilGen.createControl(sap.m.SearchField, this.view, "inv_cashcode",
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.subs.cash_code, "", "", true);
                        return;
                    }

                    var sq = "select code,name title from c_ycust where isbankcash='Y' and childcount=0 order by code";
                    Util.showSearchList(e, sq, function (valx, val) {
                        UtilGen.setControlValue(that.subs.cash_code, val, valx, true);
                    });
                }

            }, "string");
        var fn = function (o) {
            that.doCalc();
        };
        // title on head.

        //  all qty column fields
        this.subs.hydro = UtilGen.createControl(sap.m.Input, this.view, "inv_hydro",
            {editable: false}, "number");
        this.subs.pt = UtilGen.createControl(sap.m.Input, this.view, "inv_pt",
            {editable: false}, "number");
        this.subs.rehab = UtilGen.createControl(sap.m.Input, this.view, "inv_rehab",
            {editable: false}, "number");
        this.subs._subs = UtilGen.createControl(sap.m.Input, this.view, "inv_subs",
            {editable: false}, "number");
        this.subs._other_rvn = UtilGen.createControl(sap.m.Input, this.view, "inv_or",
            {editable: false}, "number");

        // all price column fields
        this.subs.price_hydro = UtilGen.createControl(sap.m.Input, this.view, "inv_ph",
            {}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs.price_pt = UtilGen.createControl(sap.m.Input, this.view, "inv_ppt",
            {}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs.price_rehab = UtilGen.createControl(sap.m.Input, this.view, "inv_pr",
            {}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs.price_sub = UtilGen.createControl(sap.m.Input, this.view, "inv_psub",
            {}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs.price_rvn = UtilGen.createControl(sap.m.Input, this.view, "inv_prvn",
            {}, "number", sett["FORMAT_MONEY_1"], fn);

        // amount fields.
        this.subs._amt_hydro = UtilGen.createControl(sap.m.Input, this.view, "inv_amt_h",
            {editable: false}, "number", sett["FORMAT_MONEY_1"]);
        this.subs._amt_pt = UtilGen.createControl(sap.m.Input, this.view, "inv_amt_pt",
            {editable: false}, "number", sett["FORMAT_MONEY_1"]);
        this.subs._amt_rehab = UtilGen.createControl(sap.m.Input, this.view, "inv_amt_rehab",
            {editable: false}, "number", sett["FORMAT_MONEY_1"]);
        this.subs._amt_sub = UtilGen.createControl(sap.m.Input, this.view, "inv_asub",
            {editable: false}, "number", sett["FORMAT_MONEY_1"]);
        this.subs._amt_rvn = UtilGen.createControl(sap.m.Input, this.view, "inv_amtrvn",
            {editable: false}, "number", sett["FORMAT_MONEY_1"]);

        //summary fields
        this.subs._gross_amt = UtilGen.createControl(sap.m.Input, this.view, "inv_gamt",
            {editable: false}, "number", sett["FORMAT_MONEY_1"]);
        this.subs.disc_amt = UtilGen.createControl(sap.m.Input, this.view, "inv_damt",
            {}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs._net_amt = UtilGen.createControl(sap.m.Input, this.view, "inv_namt",
            {editable: false}, "number", sett["FORMAT_MONEY_1"]);


        // item selection for sub and revenue.
        this.subs.sub_refer = UtilGen.createControl(sap.m.SearchField, this.view, "inv_subrefer",
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(this.subs.sub_refer, "", "", true);
                        return;
                    }

                    var sq = "select reference,descr from items where childocunt=0";
                    Util.show_list(sq, ["DESCR", "REFERENCE"], function (data) {
                        UtilGen.setControlValue(this.subs.sub_refer, data.DESCR, data.REFERENCE, true);
                    });
                }

            }, "string");
        this.subs.sub_refer = UtilGen.createControl(sap.m.SearchField, this.view, "inv_subrefer",
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.subs.sub_refer, "", "", true);
                        return;
                    }

                    var sq = "select reference,descr from items where childcounts=0";
                    Util.show_list(sq, ["DESCR", "REFERENCE"], function (data) {
                        UtilGen.setControlValue(that.subs.sub_refer, data.DESCR, data.REFERENCE, true);
                        return true;
                    });
                }

            }, "string");
        this.subs.rvn_refer = UtilGen.createControl(sap.m.SearchField, this.view, "inv_rvn_refer",
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.subs.rvn_refer, "", "", true);
                        return;
                    }

                    var sq = "select reference,descr from items where childcounts=0";
                    Util.show_list(sq, ["DESCR", "REFERENCE"], function (data) {
                        UtilGen.setControlValue(that.subs.rvn_refer, data.DESCR, data.REFERENCE, true);
                        return true;
                    });
                }

            }, "string");

        var frm1 = UtilGen.formCreate("{i18n>athlet_info}", true,
            ["{i18n>sub_name}", this.subs._athlet_code,
                "{i18n>pay_reference}", this.subs.cash_code, this.subs.invoice_date,
                "{i18n>pay_descr}", this.subs.invoice_descr,
                // "#Details",
                "", "@{i18n>pay_qty}", "@{i18n>pay_price}", "@{i18n>pay_amount}",
                "Hydro", this.subs.hydro, this.subs.price_hydro, this.subs._amt_hydro,
                "PT", this.subs.pt, this.subs.price_pt, this.subs._amt_pt,
                "Rehab", this.subs.rehab, this.subs.price_rehab, this.subs._amt_rehab,
                "{i18n>pay_sub}", this.subs._subs, this.subs.price_sub, this.subs._amt_sub,
                "{i18n>pay_rvn}", this.subs._other_rvn, this.subs.price_rvn, this.subs._amt_rvn,
                // "#Summary",
                "", "@{i18n>pay_ga}", "@{i18n>pay_da}", "@{i18n>pay_na}",
                "", this.subs._gross_amt, this.subs.disc_amt, this.subs._net_amt,
                "#Items",
                "{i18n>pay_si}", this.subs.sub_refer,
                "{i18n>pay_rvn}", this.subs.rvn_refer,

            ], undefined, undefined, undefined
        );
        frm1.addStyleClass("sapUiLargeMarginBottom");

        // frm.getToolbar().addContent(new sap.m.ToolbarSpacer());
        frm1.getToolbar().addContent(new sap.m.Button({
            text: "{i18n>pay_post}", press: function () {
                that.save_data();
            }
        }));
        frm1.getToolbar().addContent(new sap.m.ToolbarSpacer());
        frm1.getToolbar().addContent(new sap.m.Button({
            text: "Print", press: function () {
                that.save_data();
            }
        }));
        var vb = new sap.m.VBox({
            items: [frm1]
        }).addStyleClass("sapUiSmallMargin");

        this.mainPage.addContent(tb);
        this.mainPage.addContent(vb);
        this.setupItems();
        this.load_data();

    },
    setupItems: function () {
        this.qryStrKF = this.oController.qryStrKF;
        if (this.qryStrKF == "")
            return;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.vars.hydro_refer = sett["FT_HYDRO_ITEM"];
        this.vars.pt_refer = sett["FT_PT_ITEM"];
        this.vars.rehab_refer = sett["FT_REHAB_ITEM"];
        this.vars.sub_refer = sett["FT_SUB_ITEM"];
        this.vars.rvn_refer = sett["FT_RVN_ITEM"];

        var tmp = "('" +
            this.vars.rehab_refer + "','" +
            this.vars.pt_refer + "','" +
            this.vars.hydro_refer +
            this.vars.sub_refer +
            this.vars.rvn_refer +
            "')";

        var dat = Util.execSQL("select reference,price1 from items where reference in " + tmp);

        if (dat.ret == "SUCCESS" && dat.data.length > 0) {
            var dtx = JSON.parse("{" + dat.data + "}").data;
            for (var i in dtx) {
                if (dtx[0].REFERENCE == this.vars.hydro_refer)
                    this.vars.hydro_price = dtx[i].PRICE1;
                if (dtx[0].REFERENCE == this.vars.pt_refer)
                    this.vars.pt_price = dtx[i].PRICE1;
                if (dtx[0].REFERENCE == this.vars.rehab_refer)
                    this.vars.rehab_price = dtx[i].PRICE1;
                if (dtx[0].REFERENCE == this.vars.sub_refer)
                    this.vars.sub_price = dtx[i].PRICE1;
                if (dtx[0].REFERENCE == this.vars.rvn_refer)
                    this.vars.rvn_price = dtx[i].PRICE1;

            }
        }

    },
    resetVars: function () {
    },

    load_data: function () {
        this.qryStrKF = this.oController.qryStrKF;
        if (this.qryStrKF == "")
            return;
        var dat = Util.execSQL("select f.*, " +
            " c.name cust_name from ft_contract f,c_ycust c where c.code(+)=f.CASH_CODE and f.keyfld=" + this.qryStrKF);
        if (dat.ret == "SUCCESS" && dat.data.length > 0) {
            var dtx = JSON.parse("{" + dat.data + "}").data;
            var s = dtx[0].ATHLET_CODE + " - " + dtx[0].ATHLET_NAME;
            UtilGen.setControlValue(this.subs._athlet_code, s, false);
            UtilGen.loadDataFromJson(this.subs, dtx[0], true);
            var qh = dtx[0].HYDRO, qp = dtx[0].PT, qr = dtx[0].REHAB;

            if (qh > 0 && this.subs.price_hydro == 0)
                UtilGen.setControlValue(this.subs.price_hydro, hydro_pricetrue);
            if (qp > 0 && this.subs.price_pt == 0)
                UtilGen.setControlValue(this.subs.price_pt, this.vars.pt_price, true);
            if (qr > 0 && this.subs.price_rehab == 0)
                UtilGen.setControlValue(this.subs.price_rehab, this.vars.rehab_price, true);

            this.subs.price_hydro.setEditable(false);
            this.subs.price_pt.setEditable(false);
            this.subs.price_rehab.setEditable(false);
            UtilGen.setControlValue(this.subs._subs, 1, 1, true);
            UtilGen.setControlValue(this.subs._other_rvn, 1, 1, true);

            UtilGen.setControlValue(this.subs.cash_code, dtx[0].CUST_NAME, dtx[0].CASH_CODE, true);

            (qh > 0 ? this.subs.price_hydro.setEditable(true) : null);
            (qp > 0 ? this.subs.price_pt.setEditable(true) : null);
            (qr > 0 ? this.subs.price_rehab.setEditable(true) : null);
            if (this.subs.invoice_date.getDateValue() == undefined)
                UtilGen.setControlValue(this.subs.invoice_date, new Date(), undefined, true);
            var sn = Util.getSQLValue("select descr from items where reference='" + this.subs.sub_refer.getValue() + "' order by reference");
            var rn = Util.getSQLValue("select descr from items where reference='" + this.subs.rvn_refer.getValue() + "' order by reference");

            UtilGen.setControlValue(this.subs.sub_refer, sn, dtx[0].SUB_REFER, true);
            UtilGen.setControlValue(this.subs.rvn_refer, rn, dtx[0].RVN_REFER, true);

            this.doCalc();
        }
    },
    save_data: function () {
        if (this.qryStrKF == "")
            return;
        var that = this;
        try {
            this.validateSave();
            var k = UtilGen.getSQLUpdateString(this.subs, "FT_CONTRACT", {
                hydro_refer: "'" + that.vars.hydro_refer + "'",
                pt_refer: "'" + that.vars.pt_refer + "'",
                rehab_refer: "'" + that.vars.rehab_refer + "'"
            }, " KEYFLD=" + this.qryStrKF);
            var pp = "begin " + k + ";x_post_ft(" + this.qryStrKF + "); end;"
            var oSql = {
                "sql": pp,
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
        finally {

        }
    }
    ,
    show_list: function () {


    }
    ,
    validateSave: function () {
    }
    ,
    doCalc: function () {
        var qh = UtilGen.getControlValue(this.subs.hydro),
            qp = UtilGen.getControlValue(this.subs.pt),
            qr = UtilGen.getControlValue(this.subs.rehab),
            qs = UtilGen.getControlValue(this.subs._subs),
            qo = UtilGen.getControlValue(this.subs._other_rvn);

        var ph = UtilGen.getControlValue(this.subs.price_hydro),
            pp = UtilGen.getControlValue(this.subs.price_pt),
            pr = UtilGen.getControlValue(this.subs.price_rehab),
            ps = UtilGen.getControlValue(this.subs.price_sub),
            po = UtilGen.getControlValue(this.subs.price_rvn);

        var ah = qh * ph,
            ap = qp * pp,
            ar = qr * pr,
            as = qs * ps,
            ao = qo * po;

        var ga = ah + ap + ar + as + ao;
        var da = UtilGen.getControlValue(this.subs.disc_amt);
        var na = ga - da;


        UtilGen.setControlValue(this.subs._amt_hydro, ah, ah, true);
        UtilGen.setControlValue(this.subs._amt_pt, ap, ap, true);
        UtilGen.setControlValue(this.subs._amt_rehab, ar, ar, true);
        UtilGen.setControlValue(this.subs._amt_sub, as, as, true);
        UtilGen.setControlValue(this.subs._amt_rvn, ao, ao, true);
        UtilGen.setControlValue(this.subs._net_amt, na, na, true);
        UtilGen.setControlValue(this.subs._gross_amt, ga, ga, true);

    }
})
;



