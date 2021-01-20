sap.ui.jsfragment("bin.forms.fitness.payments", {

    createContent: function (oController) {
        jQuery.sap.require("sap.ui.commons.library");
        this.view = oController.getView();
        var that = this;
        this.vars = {
            hydro_refer: "",
            pt_refer: "",
            rehab_refer: "",
            fitness_refer: "",
            quality_refer: "",
            file_refer: "",
            hydro_descr: "",
            pt_descr: "",
            rehab_descr: "",
            fitness_descr: "",
            quality_descr: "",
            file_descr: "",
            hydro_price: 0,
            pt_price: 0,
            rehab_price: 0,
            fitness_price: 0,
            quality_price: 0,
            file_price: 0,
            athlet_code: "",
            athlet_name: ""

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


        this.subs.location_code = UtilGen.createControl(sap.m.ComboBox, this.view, "inv_loc_code",
            {
                customData: [{key: ""}],
                editable: false,
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{CODE}-{NAME}", key: "{CODE}"}),
                    templateShareable: true
                },
            }, "string", undefined, undefined, "select code,name from locations order by 1");

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
                        UtilGen.setControlValue(that.subs.cash_code, val + ' -' + valx.getKey(), valx.getKey(), true);
                    });
                }

            }, "string");
        var fn = function (o) {
            that.doCalc();
        };

        // title on head.


        // var ql = new sap.ui.layout.GridData({span: "XL4 L6 M6 S6"});

        this.subs.cash_type = UtilGen.createControl(sap.m.CheckBox, this.view, "cash_type", {
            selected: false,
            select: function (e) {

                if (that.subs.cash_type.getSelected()) {
                    UtilGen.setControlValue(that.subs.cash_code, that.vars.athlet_code + " - " + that.vars.athlet_name, that.vars.athlet_code);
                    that.subs.cash_code.setEnabled(false);
                } else {
                    UtilGen.setControlValue(that.subs.cash_code, "");
                    that.subs.cash_code.setEnabled(true);
                }
            }
        }, "boolean");
        this.subs.cash_type.trueValues = [2, 1]; // true value , false value

        //  all qty column fields
        this.subs.hydro = UtilGen.createControl(sap.m.Input, this.view, "inv_hydro",
            {editable: false, layoutData: ql}, "number");
        this.subs.pt = UtilGen.createControl(sap.m.Input, this.view, "inv_pt",
            {editable: false, layoutData: ql}, "number");
        this.subs.fitness = UtilGen.createControl(sap.m.Input, this.view, "inv_fitness",
            {editable: false, layoutData: ql}, "number");
        this.subs.quality = UtilGen.createControl(sap.m.Input, this.view, "inv_quality",
            {editable: false, layoutData: ql}, "number");
        this.subs.rehab = UtilGen.createControl(sap.m.Input, this.view, "inv_rehab",
            {editable: false, layoutData: ql}, "number");
        this.subs._file = UtilGen.createControl(sap.m.Input, this.view, "inv_file",
            {editable: false, layoutData: ql}, "number");

        // all price column fields
        // ql = new sap.ui.layout.GridData({span: "XL4 L2 M2 S2"});
        this.subs.price_hydro = UtilGen.createControl(sap.m.Input, this.view, "inv_ph",
            {layoutData: ql}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs.price_pt = UtilGen.createControl(sap.m.Input, this.view, "inv_ppt",
            {layoutData: ql}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs.price_rehab = UtilGen.createControl(sap.m.Input, this.view, "inv_pr",
            {layoutData: ql}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs.price_fitness = UtilGen.createControl(sap.m.Input, this.view, "inv_fi",
            {layoutData: ql}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs.price_quality = UtilGen.createControl(sap.m.Input, this.view, "inv_qu",
            {layoutData: ql}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs.price_file = UtilGen.createControl(sap.m.Input, this.view, "inv_fl",
            {layoutData: ql}, "number", sett["FORMAT_MONEY_1"], fn);

        // amount fields.
        // ql = new sap.ui.layout.GridData({span: "XL4 L2 M2 S2"});
        this.subs._amt_hydro = UtilGen.createControl(sap.m.Input, this.view, "inv_amt_h",
            {editable: false, layoutData: ql}, "number", sett["FORMAT_MONEY_1"], function () {
                //that.doCalcAmt(that.subs.price_hydro, that.subs._amt_hydro, UtilGen.getControlValue(that.subs.hydro));
            });
        this.subs._amt_pt = UtilGen.createControl(sap.m.Input, this.view, "inv_amt_pt",
            {editable: false, layoutData: ql}, "number", sett["FORMAT_MONEY_1"], function () {
                // that.doCalcAmt(that.subs.price_pt, that.subs._amt_pt, UtilGen.getControlValue(that.subs.pt));
            });
        this.subs._amt_rehab = UtilGen.createControl(sap.m.Input, this.view, "inv_amt_rehab",
            {editable: false, layoutData: ql}, "number", sett["FORMAT_MONEY_1"], function () {
                //that.doCalcAmt(that.subs.price_rehab, that.subs._amt_rehab, UtilGen.getControlValue(that.subs.rehab));
            });
        this.subs._amt_quality = UtilGen.createControl(sap.m.Input, this.view, "inv_amt_quality",
            {editable: false, layoutData: ql}, "number", sett["FORMAT_MONEY_1"], function () {
                //that.doCalcAmt(that.subs.price_quality, that.subs._amt_quality, UtilGen.getControlValue(that.subs.quality));
            });
        this.subs._amt_fitness = UtilGen.createControl(sap.m.Input, this.view, "inv_amt_fitness",
            {editable: false, layoutData: ql}, "number", sett["FORMAT_MONEY_1"], function () {
                // that.doCalcAmt(that.subs.price_fitness, that.subs._amt_fitness, UtilGen.getControlValue(that.subs.fitness));
            });
        this.subs._amt_file = UtilGen.createControl(sap.m.Input, this.view, "inv_amt_file",
            {editable: false, layoutData: ql}, "number", sett["FORMAT_MONEY_1"], function () {
                // that.doCalcAmt(that.subs.price_fitness, that.subs._amt_fitness, UtilGen.getControlValue(that.subs.fitness));
            });
        //summary fields

        this.subs._gross_amt = UtilGen.createControl(sap.m.Input, this.view, "inv_gamt",
            {editable: false}, "number", sett["FORMAT_MONEY_1"]);
        this.subs.disc_amt = UtilGen.createControl(sap.m.Input, this.view, "inv_damt",
            {}, "number", sett["FORMAT_MONEY_1"], fn);
        this.subs._net_amt = UtilGen.createControl(sap.m.Input, this.view, "inv_namt",
            {editable: false}, "number", sett["FORMAT_MONEY_1"]);

        this.subs._invoiced = UtilGen.createControl(sap.m.Text, this.view, "", {}, "string");
        this.subs._invoiced.addStyleClass("redText blinking");


        // item selection for sub and revenue.
        var ql;//new sap.ui.layout.GridData({span: "XL6 L4 M4 S4"});
        this.subs.hydro_refer = that.createRefer("inv_hydro_refer", ql);
        this.subs.pt_refer = that.createRefer("inv_pt_refer", ql);
        this.subs.rehab_refer = that.createRefer("inv_rehab_refer", ql);
        this.subs.fitness_refer = that.createRefer("inv_fitness_refer", ql);
        this.subs.quality_refer = that.createRefer("inv_quality_refer", ql);
        this.subs.file_refer = that.createRefer("inv_file_refer", ql);


        var frm1 = UtilGen.formCreate("{i18n>athlet_info}", true,
            [
                "Location", this.subs.location_code,
                "{i18n>sub_name}", this.subs._athlet_code,
                "Is Credit", this.subs.cash_type,
                "{i18n>pay_reference}", this.subs.cash_code, this.subs.invoice_date,
                "{i18n>pay_descr}", this.subs.invoice_descr,
                "#Details",
                "", "@Reference", "@{i18n>pay_qty}", "@{i18n>pay_price}", "@{i18n>pay_amount}",
                "{i18n>pay_open_file}", this.subs.file_refer, this.subs._file, this.subs.price_file, this.subs._amt_file,
                "NUTRITION", this.subs.hydro_refer, this.subs.hydro, this.subs.price_hydro, this.subs._amt_hydro,
                "YOGA", this.subs.pt_refer, this.subs.pt, this.subs.price_pt, this.subs._amt_pt,
                "Fitness", this.subs.fitness_refer, this.subs.fitness, this.subs.price_fitness, this.subs._amt_fitness,
                "{i18n>quality}", this.subs.quality_refer, this.subs.quality, this.subs.price_quality, this.subs._amt_quality,
                "Rehab", this.subs.rehab_refer, this.subs.rehab, this.subs.price_rehab, this.subs._amt_rehab,
                // "{i18n>pay_sub}", this.subs._subs, this.subs.price_sub, this.subs._amt_sub,
                // "{i18n>pay_rvn}", this.subs._other_rvn, this.subs.price_rvn, this.subs._amt_rvn,
                // "#Summary",
                "", "@{i18n>pay_ga}", "@{i18n>pay_da}", "@{i18n>pay_na}",
                "", this.subs._gross_amt, this.subs.disc_amt, this.subs._net_amt
                // "#Items",
                // "{i18n>pay_si}", this.subs.sub_refer,
                // "{i18n>pay_rvn}", this.subs.rvn_refer,

            ], undefined, undefined, [1, 1, 1]
        );
        frm1.addStyleClass("sapUiLargeMarginBottom");

        // frm.getToolbar().addContent(new sap.m.ToolbarSpacer());
        frm1.getToolbar().addContent(new sap.m.Button({
            text: "{i18n>pay_post}", press: function () {
                that.save_data();
            }
        }));
        frm1.getToolbar().addContent(new sap.m.Button({
            text: "{i18n>delete}", press: function () {

                sap.m.MessageBox.confirm("Are you sure to DELETE this Invoice : ?  " + that.vars.athlet_name, {
                    title: "Confirm",                                    // default
                    onClose: function (oAction) {
                        if (oAction == sap.m.MessageBox.Action.OK) {
                            that.delete_data();
                        }
                    },                                       // default
                    styleClass: "",                                      // default
                    initialFocus: null,                                  // default
                    textDirection: sap.ui.core.TextDirection.Inherit     // default
                });

            }
        }));
        frm1.getToolbar().addContent(new sap.m.ToolbarSpacer());
        frm1.getToolbar().addContent(new sap.m.Button({
            text: "Print", press: function () {
                that.save_data(false);
                Util.doXhr("report?reportfile=rptsale_alzamel&_para_keyfld=" + that.qryStrKF, true, function (e) {
                    if (this.status == 200) {
                        var blob = new Blob([this.response], {type: "application/pdf"});
                        var link = document.createElement('a');
                        link.target = "_blank";
                        link.href = window.URL.createObjectURL(blob);
                        link.download = "rptsale_alzamel" + new Date() + ".pdf";
                        //window.open(link.href, "_blank");
                        link.click();
                        setTimeout(function () {
                            // For Firefox it is necessary to delay revoking the ObjectURL
                            window.URL.revokeObjectURL(blob);
                        }, 100);

                    }
                });
            }
        }));

        var hb = new sap.m.HBox({
            items: [this.subs._invoiced],
            width: "100%"
        });

        var vb = new sap.m.VBox({
            items: [hb, frm1]
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
        for (var key in this.vars)
            if (typeof this.vars[key] == "string")
                this.vars[key] = "";
            else
                this.vars[key] = 0;

        var sett = sap.ui.getCore().getModel("settings").getData();
        this.vars.hydro_refer = sett["FT_HYDRO_ITEM"];
        this.vars.pt_refer = sett["FT_PT_ITEM"];
        this.vars.rehab_refer = sett["FT_REHAB_ITEM"];
        this.vars.fitness_refer = sett["FT_FITNESS_ITEM"];
        this.vars.quality_refer = sett["FT_QUALITY_ITEM"];
        this.vars.file_refer = sett["FT_FILE_ITEM"];

        var tmp = "('" +
            this.vars.rehab_refer + "','" +
            this.vars.pt_refer + "','" +
            this.vars.hydro_refer + "','" +
            this.vars.fitness_refer + "','" +
            this.vars.quality_refer + "','" +
            this.vars.file_refer + "')";

        var dat = Util.execSQL("select reference,price1,descr from items where reference in " + tmp);

        if (dat.ret == "SUCCESS" && dat.data.length > 0) {
            var dtx = JSON.parse("{" + dat.data + "}").data;
            for (var i in dtx) {
                if (dtx[i].REFERENCE == this.vars.hydro_refer) {
                    this.vars.hydro_price = dtx[i].PRICE1;
                    this.vars.hydro_descr = dtx[i].DESCR;
                    UtilGen.setControlValue(this.subs.hydro_refer, dtx[i].DESCR, dtx[i].REFERENCE, true);

                }
                if (dtx[i].REFERENCE == this.vars.pt_refer) {
                    this.vars.pt_price = dtx[i].PRICE1;
                    this.vars.pt_descr = dtx[i].DESCR;
                    UtilGen.setControlValue(this.subs.pt_refer, dtx[i].DESCR, dtx[i].REFERENCE, true);
                }
                if (dtx[i].REFERENCE == this.vars.rehab_refer) {
                    this.vars.rehab_price = dtx[i].PRICE1;
                    this.vars.rehab_descr = dtx[i].DESCR;
                    UtilGen.setControlValue(this.subs.rehab_refer, dtx[i].DESCR, dtx[i].REFERENCE, true);
                }
                if (dtx[i].REFERENCE == this.vars.quality_refer) {
                    this.vars.quality_price = dtx[i].PRICE1;
                    this.vars.quality_descr = dtx[i].DESCR;
                    UtilGen.setControlValue(this.subs.quality_refer, dtx[i].DESCR, dtx[i].REFERENCE, true);
                }
                if (dtx[i].REFERENCE == this.vars.fitness_refer) {
                    this.vars.fitness_price = dtx[i].PRICE1;
                    this.vars.fitness_descr = dtx[i].DESCR;
                    UtilGen.setControlValue(this.subs.fitness_refer, dtx[i].DESCR, dtx[i].REFERENCE, true);
                }
                if (dtx[i].REFERENCE == this.vars.file_refer) {
                    this.vars.file_price = dtx[i].PRICE1;
                    this.vars.file_descr = dtx[i].DESCR;
                    UtilGen.setControlValue(this.subs.file_refer, dtx[i].DESCR, dtx[i].REFERENCE, true);
                }

            }
        }
        this.doCalc();

    }
    ,
    resetVars: function () {
    }
    ,

    load_data: function () {
        this.qryStrKF = this.oController.qryStrKF;
        var that = this;
        that.vars.athlet_code = "";
        that.vars.athlet_name = "";

        if (this.qryStrKF == "")
            return;
        UtilGen.setControlValue(this.subs._invoiced, "");
        var dat = Util.execSQL("select f.*, " +
            " c.name cust_name from ft_contract f,c_ycust c where c.code(+)=f.CASH_CODE and f.keyfld=" + this.qryStrKF);
        if (dat.ret == "SUCCESS" && dat.data.length > 0) {
            var dtx = JSON.parse("{" + dat.data + "}").data;
            var s = dtx[0].ATHLET_CODE + " - " + dtx[0].ATHLET_NAME;
            var qh = dtx[0].HYDRO, qp = dtx[0].PT, qr = dtx[0].REHAB, qf = dtx[0].FITNESS, qq = dtx[0].QUALITY;
            that.vars.athlet_code = dtx[0].ATHLET_CODE;
            that.vars.athlet_name = dtx[0].ATHLET_NAME;

            UtilGen.setControlValue(this.subs._athlet_code, s);
            UtilGen.setControlValue(this.subs.location_code, dtx[0].LOCATION_CODE, dtx[0].LOCATION_CODE, true);
            UtilGen.setControlValue(this.subs._file, 1, 1, false);
            var invd = this.view.getModel("i18n").getResourceBundle().getText("pay_invoiced");
            var inv_new = this.view.getModel("i18n").getResourceBundle().getText("pay_new_invoice");
            if (dtx[0].SALEINV != 0) {
                UtilGen.loadDataFromJson(this.subs, dtx[0], true);
                UtilGen.setControlValue(this.subs._file, 1, 1, false);
                var inv = Util.getSQLValue("select max(invoice_no) from pur1 where keyfld=" + dtx[0].SALEINV);
                UtilGen.setControlValue(this.subs._invoiced, invd + " : No #  " + inv);
            } else {
                var inv = Util.getSQLValue("select nvl(max(invoice_no),0)+1 from pur1 where location_code='" + dtx[0].LOCATION_CODE + "'");
                UtilGen.setControlValue(this.subs._invoiced, inv_new + "  : No # " + inv);

                UtilGen.setControlValue(this.subs._file, 1);
                UtilGen.setControlValue(this.subs.hydro, dtx[0].HYDRO);
                UtilGen.setControlValue(this.subs.pt, dtx[0].PT);
                UtilGen.setControlValue(this.subs.fitness, dtx[0].FITNESS);
                UtilGen.setControlValue(this.subs.rehab, dtx[0].REHAB);
                UtilGen.setControlValue(this.subs.quality, dtx[0].QUALITY);


                UtilGen.setControlValue(this.subs.price_hydro, this.vars.hydro_price);
                UtilGen.setControlValue(this.subs.price_pt, this.vars.pt_price);
                UtilGen.setControlValue(this.subs.price_rehab, this.vars.rehab_price);
                UtilGen.setControlValue(this.subs.price_fitness, this.vars.fitness_price);
                UtilGen.setControlValue(this.subs.price_quality, this.vars.quality_price);
                UtilGen.setControlValue(this.subs.price_file, this.vars.file_price);

                UtilGen.setControlValue(this.subs.hydro_refer, this.vars.hydro_descr, this.vars.hydro_refer, true);
                UtilGen.setControlValue(this.subs.pt_refer, this.vars.pt_descr, this.vars.pt_refer, true);
                UtilGen.setControlValue(this.subs.rehab_refer, this.vars.rehab_descr, this.vars.rehab_refer, true);
                UtilGen.setControlValue(this.subs.fitness_refer, this.vars.fitness_descr, this.vars.fitness_refer, true);
                UtilGen.setControlValue(this.subs.quality_refer, this.vars.quality_descr, this.vars.quality_refer, true);
                UtilGen.setControlValue(this.subs.file_refer, this.vars.file_descr, this.vars.file_refer, true);

                UtilGen.setControlValue(this.subs.disc_amt, 0, 0, true);

            }
            // post query...
            this.subs.price_hydro.setEditable(false);
            this.subs.price_pt.setEditable(false);
            this.subs.price_rehab.setEditable(false);

            UtilGen.setControlValue(this.subs.cash_code, dtx[0].CUST_NAME, dtx[0].CASH_CODE, true);

            (qh > 0 ? this.subs.price_hydro.setEditable(true) : null);
            (qp > 0 ? this.subs.price_pt.setEditable(true) : null);
            (qr > 0 ? this.subs.price_rehab.setEditable(true) : null);
            (qf > 0 ? this.subs.price_fitness.setEditable(true) : null);
            (qq > 0 ? this.subs.price_quality.setEditable(true) : null);

            // (qh > 0 ? this.subs._amt_hydro.setEditable(true) : null);
            // (qp > 0 ? this.subs._amt_pt.setEditable(true) : null);
            // (qr > 0 ? this.subs._amt_rehab.setEditable(true) : null);
            // (qf > 0 ? this.subs._amt_fitness.setEditable(true) : null);
            // (qq > 0 ? this.subs._amt_quality.setEditable(true) : null);

            if (this.subs.invoice_date.getDateValue() == undefined && dtx[0].INVOICE_DATE == null)
                UtilGen.setControlValue(this.subs.invoice_date, new Date(), undefined, true);
            // var rh = Util.getSQLValue("select descr from items where reference='" + this.subs.sub_refer.getValue() + "' order by reference");
            // var rp = Util.getSQLValue("select descr from items where reference='" + this.subs.rvn_refer.getValue() + "' order by reference");
            // var r = Util.getSQLValue("select descr from items where reference='" + this.subs.sub_refer.getValue() + "' order by reference");
            // var rn = Util.getSQLValue("select descr from items where reference='" + this.subs.rvn_refer.getValue() + "' order by reference");
            // var rn = Util.getSQLValue("select descr from items where reference='" + this.subs.rvn_refer.getValue() + "' order by reference");
            //
            // UtilGen.setControlValue(this.subs.sub_refer, sn, dtx[0].SUB_REFER, true);
            // UtilGen.setControlValue(this.subs.rvn_refer, rn, dtx[0].RVN_REFER, true);

            this.doCalc();
        }
    }
    ,
    save_data: function () {
        if (this.qryStrKF == "")
            return;
        var that = this;
        try {
            this.validateSave();
            var k = UtilGen.getSQLUpdateString(this.subs, "FT_CONTRACT", {
                // hydro_refer: "'" + that.vars.hydro_refer + "'",
                // pt_refer: "'" + that.vars.pt_refer + "'",
                // rehab_refer: "'" + that.vars.rehab_refer + "'"
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
            qs = UtilGen.getControlValue(this.subs.quality),
            qo = UtilGen.getControlValue(this.subs.fitness),
            qf = UtilGen.getControlValue(this.subs._file);

        var ph = UtilGen.getControlValue(this.subs.price_hydro),
            pp = UtilGen.getControlValue(this.subs.price_pt),
            pr = UtilGen.getControlValue(this.subs.price_rehab),
            ps = UtilGen.getControlValue(this.subs.price_quality),
            po = UtilGen.getControlValue(this.subs.price_fitness),
            pf = UtilGen.getControlValue(this.subs.price_file);

        var ah = qh * ph,
            ap = qp * pp,
            ar = qr * pr,
            as = qs * ps,
            ao = qo * po,
            af = qf * pf;

        var ga = ah + ap + ar + as + ao + af;
        var da = UtilGen.getControlValue(this.subs.disc_amt);
        var na = ga - da;


        UtilGen.setControlValue(this.subs._amt_hydro, ah, ah, true);
        UtilGen.setControlValue(this.subs._amt_pt, ap, ap, true);
        UtilGen.setControlValue(this.subs._amt_rehab, ar, ar, true);
        UtilGen.setControlValue(this.subs._amt_quality, as, as, true);
        UtilGen.setControlValue(this.subs._amt_fitness, ao, ao, true);
        UtilGen.setControlValue(this.subs._amt_file, af, af, true);

        UtilGen.setControlValue(this.subs._net_amt, na, na, true);
        UtilGen.setControlValue(this.subs._gross_amt, ga, ga, true);


    }
    ,
    createRefer: function (id, ql) {
        var srch = UtilGen.createControl(sap.m.SearchField, this.view, id,
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.subs.sub_refer, "", "", true);
                        return;
                    }

                    var sq = "select reference,descr from items where childcounts=0";
                    Util.show_list(sq, ["DESCR", "REFERENCE"], function (data) {
                        UtilGen.setControlValue(srch, data.DESCR, data.REFERENCE, true);
                        return true;
                    });
                },
                layoutData: ql
            }, "string");
        return srch;
    },
    doCalcAmt: function (inPrice, inAmt, qt) {
        if (qt == 0)
            return;
        var amt = UtilGen.getControlValue(inAmt);
        var pri = (UtilGen.getControlValue(inPrice) / qt);

        UtilGen.setControlValue(inPrice, pri, pri, true);
        this.doCalc();
    },
    delete_data: function () {
        var that = this;
        var k = UtilGen.getSQLUpdateString(this.subs, "FT_CONTRACT", {
            // hydro_refer: "'" + that.vars.hydro_refer + "'",
            // pt_refer: "'" + that.vars.pt_refer + "'",
            // rehab_refer: "'" + that.vars.rehab_refer + "'"
        }, " KEYFLD=" + this.qryStrKF);
        var pp = "begin " + k + ";x_post_ft(" + this.qryStrKF + ",true); end;"
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

            sap.m.MessageToast.show("Invoice Deleted ....");
            that.mainPage.backFunction();
        });
    }
});



