sap.ui.jsfragment("bin.forms.fitness.drana", {

        createContent: function (oController) {
            jQuery.sap.require("sap.ui.commons.library");
            this.view = oController.getView();
            var that = this;

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

            this.subs._athlet_code = UtilGen.createControl(sap.m.Text, this.view, "ana_athlet",
                {}, "string");
            this.subs.pt = UtilGen.createControl(sap.m.Input, this.view, "pt", {
                change: function () {
                    that.show_boxes();
                }
            }, "number");

            this.subs.hydro = UtilGen.createControl(sap.m.Input, this.view, "hydro", {
                change: function () {
                    that.show_boxes();
                }

            }, "number");

            this.subs.rehab = UtilGen.createControl(sap.m.Input, this.view, "rehab", {}, "number");
            this.subs.first_week = UtilGen.createControl(sap.m.Input, this.view, "first_week",
                {}, "string");
            this.subs.second_week = UtilGen.createControl(sap.m.Input, this.view, "second_week",
                {}, "string");
            var frm = UtilGen.formCreate("{i18n>ses_info}", true,
                ["{i18n>ses_name}", this.subs._athlet_code,
                    "PT", this.subs.pt,
                    "HYDRO", this.subs.hydro,
                    "REHAB", this.subs.rehab,
                    "#Other Info",
                    "First week", this.subs.first_week,
                    "Second week", this.subs.second_week,

                ]);
            frm.addStyleClass("sapUiLargeMarginBottom");
            frm.getToolbar().addContent(new sap.m.ToolbarSpacer());
            frm.getToolbar().addContent(new sap.m.Button({
                text: "Save", press: function () {
                    that.save_data();
                    that.mainPage.backFunction();
                }
            }));

            frm.getToolbar().addContent(new sap.m.Button({
                text: "Clear", press: function () {
                    that.qryStrKF = "";
                    that.load_data();
                }
            }));
            frm.getToolbar().addContent(new sap.m.Button({
                text: "{i18n>list}", press: function () {
                    that.show_list();
                }
            }));

            var ch = function (e) {
                that.show_boxes();

            };
            this.subs.hydro.attachChange(ch);
            this.subs.pt.attachChange(ch);
            this.subs.rehab.attachChange(ch);

            this.hydroInput = [];
            this.ptInput = [];
            this.rehabInput = [];

            this.vbHydro = new sap.m.VBox({alignItems: sap.m.FlexAlignItems.Center});
            this.vbPt = new sap.m.VBox({alignItems: sap.m.FlexAlignItems.Center});
            this.vbRehab = new sap.m.VBox({alignItems: sap.m.FlexAlignItems.Center});

            var hz = new sap.m.HBox({
                items: [this.vbPt, this.vbHydro, this.vbRehab]
            });

            var vb = new sap.m.VBox({
                items: [frm, hz]
            }).addStyleClass("sapUiSmallMargin");

            this.mainPage.addContent(tb);
            this.mainPage.addContent(vb);
            this.qryStrKF = this.oController.qryStrKF
            this.load_data();
        },
        resetVars: function () {

        },
        load_data: function () {

            var that = this;
            this.subs._athlet_code.setText(this.oController.qryStrAthletCode + " - " + this.oController.qryStrAthletCodeName);
            var dat = Util.execSQL("select *from FT_CONTRACT where keyfld=" + this.qryStrKF);
            if (dat.ret == "SUCCESS" && dat.data.length > 0) {
                var dtx = JSON.parse("{" + dat.data + "}").data;
                UtilGen.setControlValue(this.subs.pt, dtx[0].PT, false);
                UtilGen.setControlValue(this.subs.hydro, dtx[0].HYDRO, false);
                UtilGen.setControlValue(this.subs.rehab, dtx[0].REHAB, false);
                that.show_boxes(true);
            }
        }
        ,
        save_data: function (clearScr) {
            var that = this;
            this.validateSave();
            if (this.qryStrKF.length == 0)
                return;

            var p = UtilGen.getSQLUpdateString(this.subs, "FT_CONTRACT", {}, " KEYFLD=" + this.qryStrKF);
            var pp = "begin " + this.get_boxes_sqls() + ";" + p + ";end;";
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
                that.load_data();
            });
        }
        ,
        show_list: function () {
            var that = this;
            var sql = "select athlet_name,athlet_code,start_date,keyfld from ft_contract order by keyfld desc";
            var cols = ["ATHLET_NAME", "ATHLET_CODE"];

            Util.show_list(sql, cols, function (data) {
                that.qryStrKF = data.KEYFLD;
                that.oController.qryStrAthletCode=data.ATHLET_CODE;
                that.oController.qryStrAthletCodeName=data.ATHLET_NAME;
                that.load_data();
                return true;
            }, "600px", "90%", 10);
        }
        ,
        validateSave: function () {
        }
        ,
        show_boxes: function (fetchData) {
            this.hydroInput = [];
            this.ptInput = [];
            this.rehabInput = [];

            this.vbHydro.removeAllItems();
            this.vbPt.removeAllItems();
            this.vbRehab.removeAllItems();
            var h = UtilGen.getControlValue(this.subs.hydro);
            var p = UtilGen.getControlValue(this.subs.pt);
            var r = UtilGen.getControlValue(this.subs.rehab);

            for (var i = 0; i < h; i++) {
                (i == 0 ? this.vbHydro.addItem(new sap.m.Label({text: "Hydro"})) : null);
                this.hydroInput.push(new sap.m.Input({}));
                this.vbHydro.addItem(this.hydroInput[i]);
            }

            for (var i = 0; i < p; i++) {
                (i == 0 ? this.vbPt.addItem(new sap.m.Label({text: "PT"})) : null);
                this.ptInput.push(new sap.m.Input({}));
                this.vbPt.addItem(this.ptInput[i]);
            }

            for (var i = 0; i < r; i++) {
                (i == 0 ? this.vbRehab.addItem(new sap.m.Label({text: "Rehab", alignText: "CENTER"})) : null);
                this.rehabInput.push(new sap.m.Input({}));
                this.vbRehab.addItem(this.rehabInput[i]);
            }
            if (fetchData) this.fetch_boxes();
        }
        ,
        fetch_boxes: function () {
            var data = Util.execSQL("select pos,descr from ft_ses where keyfld=" + this.qryStrKF + " and code='HYDRO' order by pos");
            if (data.ret == "SUCCESS" && data.data.length > 0) {
                var dtx = JSON.parse("{" + data.data + "}").data;
                for (var x in dtx) {
                    try {
                        this.hydroInput[dtx[x].POS].setValue(dtx[x].DESCR);
                    } finally {
                    }
                }
            }
            var data = Util.execSQL("select pos,descr from ft_ses where keyfld=" + this.qryStrKF + " and code='PT' order by pos");
            if (data.ret == "SUCCESS" && data.data.length > 0) {
                var dtx = JSON.parse("{" + data.data + "}").data;
                for (var x in dtx) {
                    try {
                        this.ptInput[dtx[x].POS].setValue(dtx[x].DESCR);
                    } finally {
                    }
                }
            }

            var data = Util.execSQL("select pos,descr from ft_ses where keyfld=" + this.qryStrKF + " and code='REHAB' order by pos");
            if (data.ret == "SUCCESS" && data.data.length > 0) {
                var dtx = JSON.parse("{" + data.data + "}").data;
                for (var x in dtx) {
                    try {
                        this.rehabInput[dtx[x].POS].setValue(dtx[x].DESCR);
                    } finally {
                    }
                }

            }
        },
        get_boxes_sqls: function () {
            var that = this;
            var sqDel = "delete from ft_ses where keyfld=" + this.qryStrKF;
            var sqs = [];
            for (var i in this.hydroInput) {
                var v = this.hydroInput[i].getValue();
                var s = "insert into ft_ses(keyfld,pos,code,descr) " +
                    "values (:KEYFLD,:POS,:CODE,:DESCR)";
                s = s.replace(':KEYFLD', this.qryStrKF);
                s = s.replace(':POS', i);
                s = s.replace(':CODE', "'HYDRO'");
                s = s.replace(':DESCR', "'" + v + "'");
                sqs.push(s);
            }
            for (var i in this.ptInput) {
                var v = this.ptInput[i].getValue();
                var s = "insert into ft_ses(keyfld,pos,code,descr) " +
                    "values (:KEYFLD,:POS,:CODE,:DESCR)";
                s = s.replace(':KEYFLD', this.qryStrKF);
                s = s.replace(':POS', i);
                s = s.replace(':CODE', "'PT'");
                s = s.replace(':DESCR', "'" + v + "'");
                sqs.push(s);
            }
            for (var i in this.rehabInput) {
                var v = this.rehabInput[i].getValue();
                var s = "insert into ft_ses(keyfld,pos,code,descr) " +
                    "values (:KEYFLD,:POS,:CODE,:DESCR)";
                s = s.replace(':KEYFLD', this.qryStrKF);
                s = s.replace(':POS', i);
                s = s.replace(':CODE', "'REHAB'");
                s = s.replace(':DESCR', "'" + v + "'");
                sqs.push(s);
            }
            var sqls = "";
            for (var i in sqs)
                sqls += (sqls.length > 0 ? ";" : "") + sqs[i];

            return sqDel + ";" + sqls;
        }
    }
)
;



