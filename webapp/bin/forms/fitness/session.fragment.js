sap.ui.jsfragment("bin.forms.fitness.session", {

    createContent: function (oController) {
        jQuery.sap.require("sap.ui.commons.library");
        this.view = oController.getView();
        this.qryStrKF = "";
        this.qryStr = "";

        var that = this;
        this.oController = oController;
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


        this.mainPage.load_data = that.load_data;
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
        this.subs._athlet_code = UtilGen.createControl(sap.m.Text, this.view, "ses_athlet_code",
            {}, "string");
        this.subs.pos = UtilGen.createControl(sap.m.Text, this.view, "pos", {}, "string");


        this.subs.right_thigh = UtilGen.createControl(sap.m.Input, this.view, "ses_right_thigh", {}, "string");

        this.subs.left_thigh = UtilGen.createControl(sap.m.Input, this.view, "ses_left_thigh", {}, "string");
        this.subs.muscle_right = UtilGen.createControl(sap.m.Input, this.view, "ses_muscle_right", {}, "string");
        this.subs.muscle_left = UtilGen.createControl(sap.m.Input, this.view, "ses_muscle_left", {}, "string");
        this.subs.rom = UtilGen.createControl(sap.m.Input, this.view, "ses_rom", {}, "string");
        this.subs.asses_pain = UtilGen.createControl(sap.m.Input, this.view, "ses_asses_pain", {}, "string");
        this.subs.height = UtilGen.createControl(sap.m.Input, this.view, "ses_height", {}, "string");
        this.subs.weight = UtilGen.createControl(sap.m.Input, this.view, "ses_weight", {}, "string");
        this.subs.fat_ratio = UtilGen.createControl(sap.m.Input, this.view, "ses_fat_ratio", {}, "string");
        this.subs.pressure_gauge = UtilGen.createControl(sap.m.Input, this.view, "ses_pressure_gauge", {}, "string");
        this.subs.ses_date = UtilGen.createControl(sap.m.DatePicker, this.view, "ses_ses_date", {}, "date");

        var frm = UtilGen.formCreate("{i18n>ses_info}", true,
            ["{i18n>ses_name}", this.subs._athlet_code,
                "{i18n>ses_pos}", this.subs.pos,
                "{i18n>ses_date}", this.subs.ses_date,
                "{i18n>ses_rt}", this.subs.right_thigh,
                "{i18n>ses_lt}", this.subs.left_thigh,
                "{i18n>ses_mr}", this.subs.muscle_right,
                "{i18n>ses_ml}", this.subs.muscle_left,
                "{i18n>ses_rom}", this.subs.rom,
                "{i18n>ses_ap}", this.subs.asses_pain,
                "{i18n>ses_hw}", this.subs.height, this.subs.weight,
                "{i18n>ses_fr}", this.subs.fat_ratio,
                "{i18n>ses_pg}", this.subs.pressure_gauge]);
        frm.addStyleClass("sapUiLargeMarginBottom");
        frm.getToolbar().addContent(new sap.m.ToolbarSpacer());
        frm.getToolbar().addContent(new sap.m.Button({
            text: "Save", press: function () {
                that.save_data();
            }
        }));
        frm.getToolbar().addContent(new sap.m.Button({
            text: "List", press: function () {
                that.show_list();
            }
        }));
        frm.getToolbar().addContent(new sap.m.Button({
            text: "Clear", press: function () {
                that.qryStrKF = ""
                l
                that.load_data();
            }
        }));

        var vb = new sap.m.VBox({
            items: [frm]
        }).addStyleClass("sapUiSmallMargin");

        this.mainPage.addContent(tb);
        this.mainPage.addContent(vb);
        this.load_data();

    },
    resetVars: function () {
    },
    load_data: function () {
        var that = this;
        this.qryStrKF = this.oController.qryStrKF;
        if (this.qryStr == "") {
            this.subs._athlet_code.setText(this.oController.qryStrAthletCode + " - " + this.oController.qryStrAthletCodeName);
            UtilGen.setControlValue(this.subs.pos, Util.getSQLValue("select nvl(max(pos),0)+1 from ft_sessions where keyfld=" + that.qryStrKF, false));
            UtilGen.setControlValue(this.subs.ses_date, new Date(), "", false);
            UtilGen.setControlValue(this.subs.right_thigh, "", false);
            UtilGen.setControlValue(this.subs.left_thigh, "", false);
            UtilGen.setControlValue(this.subs.muscle_left, "", false);
            UtilGen.setControlValue(this.subs.muscle_right, "", false);
            UtilGen.setControlValue(this.subs.rom, "", false);
            UtilGen.setControlValue(this.subs.asses_pain, "", false);
            UtilGen.setControlValue(this.subs.height, "", false);
            UtilGen.setControlValue(this.subs.weight, "", false);
            UtilGen.setControlValue(this.subs.fat_ratio, "", false);
            UtilGen.setControlValue(this.subs.pressure_gauge, "", false);
        }
        else {
            var dat = Util.execSQL("select *from FT_INFO where keyfld=" + this.qryStrKF + " and pos=" + this.qryStr);
            if (dat.ret == "SUCCESS" && dat.data.length > 0) {
                var dtx = JSON.parse("{" + dat.data + "}").data;
                if (dtx[0].SES_DATE != null)
                    UtilGen.setControlValue(this.subs.ses_date, new Date(dtx[0].SES_DATE), "", false);

                UtilGen.setControlValue(this.subs.pos, dtx[0].POS, "", false);
                UtilGen.setControlValue(this.subs.right_thigh, dtx[0].RIGHT_THIGH, false);
                UtilGen.setControlValue(this.subs.left_thigh, dtx[0].LEFT_THIGH, "", false);
                UtilGen.setControlValue(this.subs.muscle_left, dtx[0].MUSCLE_LEFT, "", false);
                UtilGen.setControlValue(this.subs.muscle_right, dtx[0].MUSCLE_RIGHT, "", false);
                UtilGen.setControlValue(this.subs.rom, dtx[0].ROM, "", false);
                UtilGen.setControlValue(this.subs.asses_pain, dtx[0].ASSES_PAIN, "", false);
                UtilGen.setControlValue(this.subs.height, dtx[0].HEIGHT, "", false);
                UtilGen.setControlValue(this.subs.weight, dtx[0].WEIGHT, "", false);
                UtilGen.setControlValue(this.subs.fat_ratio, dtx[0].FAT_RATIO, "", false);
                UtilGen.setControlValue(this.subs.pressure_gauge, dtx[0].PRESSURE_GAUGE, "", false);
            }
        }
    }
    ,
    save_data: function (clearScr) {
        var clearScreen = Util.nvl(clearScr, true);
        var that = this;
        try {
            this.validateSave();
            if (this.qryStr.length == 0) {
                var p = Util.getSQLValue("select nvl(max(pos),0)+1 from FT_INFO where keyfld=" + that.qryStrKF);
                this.subs.pos.setText(p);
                var k = UtilGen.getSQLInsertString(this.subs, {"keyfld": that.qryStrKF});
                k = "insert into FT_INFO " + k;
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
                    if (clearScreen == false) {
                        var px = Util.getSQLValue("select nvl(max(pos),0) from FT_INFO where keyfld=" + that.qryStrKF);
                        if (px == p) {
                            that.qryStr = p;
                            that.load_data();
                        }
                    } else
                        that.load_data();
                });
            } else {
                var k = UtilGen.getSQLUpdateString(this.subs, "FT_INFO", {}, " POS=" + this.qryStr + " and KEYFLD=" + this.qryStrKF);
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
                    if (clearScreen == false)
                        that.load_data();
                    else {
                        that.qryStr = "";
                        that.load_data();
                    }
                });
            }
        }
        finally {
            
        }
    }
    ,
    show_list: function () {
        var that = this;
        var sql = "select POS,SES_DATE from FT_INFO where keyfld=" + this.qryStrKF + " order by POS desc";
        var cols = ["POS", "SES_DATE"];

        Util.show_list(sql, cols, function (data) {
            that.qryStr = data.POS;
            that.load_data();
            return true;
        }, "500px", "90%", 10);
    }
    ,
    validateSave: function () {

        var that = this;
        if (Util.nvl(that.subs.ses_date.getValue(), "").length == 0) {
            sap.m.MessageToast.show("Must select session code !");
            that.subs.ses_date.requestFocus();
            throw " session Date is empty";
        }

    }
});



