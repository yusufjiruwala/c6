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


            this.subs.fitness = UtilGen.createControl(sap.m.Input, this.view, "fitness", {
                change: function () {
                    that.show_boxes();
                }

            }, "number");
            this.subs.quality = UtilGen.createControl(sap.m.Input, this.view, "quality", {
                change: function () {
                    that.show_boxes();
                }

            }, "number");


            this.subs.rehab = UtilGen.createControl(sap.m.Input, this.view, "rehab", {}, "number");

            this.subs.period_rehab = UtilGen.createControl(sap.m.ComboBox, this.view, "period", {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{descr}", key: "{period}"}),
                    templateShareable: true
                }
            }, "number");
            var mdl = [
                {
                    "descr": "7 Days",
                    "period": 7
                },
                {
                    "descr": "14 Days",
                    "period": 14
                },
                {
                    "descr": "30 Days",
                    "period": 30
                },
                {
                    "descr": "90 Days",
                    "period": 90
                },
                {
                    "descr": "365 Days",
                    "period": 365
                },
                {
                    "descr": "180 Days",
                    "period": 180
                }


            ];
            this.subs.period_rehab.setModel(new sap.ui.model.json.JSONModel(mdl));
            UtilGen.setControlValue(this.subs.period_rehab, 7);

            this.subs.start_date = UtilGen.createControl(sap.m.DatePicker, this.view, "start_date", {
                editable: true,
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                change: function (e) {
                    that.calcDate();
                }

            }, "date");

            this.subs.end_date = UtilGen.createControl(sap.m.DatePicker, this.view, "end_date",
                {
                    valueFormat: sett["ENGLISH_DATE_FORMAT"],
                    displayFormat: sett["ENGLISH_DATE_FORMAT"]
                }, "date");

            // this.subs.first_week = UtilGen.createControl(sap.m.Input, this.view, "first_week",
            //     {}, "string");
            // this.subs.second_week = UtilGen.createControl(sap.m.Input, this.view, "second_week",
            //     {}, "string");
            var frm = UtilGen.formCreate("{i18n>ses_info}", true,
                ["{i18n>ses_name}", this.subs._athlet_code,
                    "YOGA", this.subs.pt,
                    "NUTRITION", this.subs.hydro,
                    "Fitness", this.subs.fitness,
                    "{i18n>quality}", this.subs.quality,
                    "#{i18n>subscription}",
                    "{i18n>period}", this.subs.period_rehab,
                    "Period", this.subs.rehab,
                    "{i18n>sub_subscription}", this.subs.start_date, this.subs.end_date
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
            var chPeriod = function (e) {
                that.calcDate();

            };
            this.subs.hydro.attachChange(ch);
            this.subs.pt.attachChange(ch);
            this.subs.fitness.attachChange(ch);
            this.subs.quality.attachChange(ch);
            this.subs.rehab.attachChange(chPeriod);
            this.subs.period_rehab.attachChange(chPeriod);


            this.hydroInput = [];
            this.ptInput = [];
            this.fitnessInput = [];
            this.qualityInput = [];

            this.vbHydro = new sap.m.VBox({alignItems: sap.m.FlexAlignItems.Center});
            this.vbPt = new sap.m.VBox({alignItems: sap.m.FlexAlignItems.Center});
            this.vbFitness = new sap.m.VBox({alignItems: sap.m.FlexAlignItems.Center});
            this.vbQuality = new sap.m.VBox({alignItems: sap.m.FlexAlignItems.Center});

            var hz = new sap.m.HBox({
                items: [this.vbPt, this.vbHydro, this.vbFitness, this.vbQuality]
            });

            var vb = new sap.m.VBox({
                items: [frm, hz]
            }).addStyleClass("sapUiSmallMargin");

            this.mainPage.addContent(tb);
            this.mainPage.addContent(vb);
            this.qryStrKF = this.oController.qryStrKF;
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
                UtilGen.setControlValue(this.subs.pt, dtx[0].PT, undefined, false);
                UtilGen.setControlValue(this.subs.hydro, dtx[0].HYDRO, undefined, false);
                UtilGen.setControlValue(this.subs.rehab, dtx[0].REHAB, undefined, false);
                UtilGen.setControlValue(this.subs.quality, dtx[0].QUALITY, undefined, false);
                UtilGen.setControlValue(this.subs.fitness, dtx[0].FITNESS, undefined, false);
                UtilGen.setControlValue(this.subs.period_rehab, dtx[0].PERIOD_REHAB, undefined, false);
                UtilGen.setControlValue(this.subs.start_date, dtx[0].START_DATE, undefined, false);
                UtilGen.setControlValue(this.subs.end_date, dtx[0].END_DATE, undefined, false);
                that.show_boxes(true);

            }
        },
        calcDate: function () {
            var oneDay = 24 * 60 * 60 * 1000;
            var p = UtilGen.getControlValue(this.subs.period_rehab);
            var s = UtilGen.getControlValue(this.subs.start_date);
            var e = new Date();
            var r = UtilGen.getControlValue(this.subs.rehab);

            UtilGen.setControlValue(this.subs.end_date, null, null, true);

            if (r > 0) {
                e.setTime((p * (oneDay * r)) + s.getTime());
                UtilGen.setControlValue(this.subs.end_date, e, e, true);
            }
        }
        ,
        save_data: function (clearScr) {
            var that = this;
            this.validateSave();
            if (this.qryStrKF.length == 0)
                return;

            var p = UtilGen.getSQLUpdateString(this.subs, "FT_CONTRACT", {}, " KEYFLD=" + this.qryStrKF);
            var pp = ("begin " + this.get_boxes_sqls() + ";" + p + ";end;").replace(";;", ";");
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
                that.oController.qryStrAthletCode = data.ATHLET_CODE;
                that.oController.qryStrAthletCodeName = data.ATHLET_NAME;
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
            this.fitnessInput = [];
            this.qualityInput = [];

            this.vbHydro.removeAllItems();
            this.vbPt.removeAllItems();
            this.vbFitness.removeAllItems();
            this.vbQuality.removeAllItems();
            var h = UtilGen.getControlValue(this.subs.hydro);
            var p = UtilGen.getControlValue(this.subs.pt);
            var r = UtilGen.getControlValue(this.subs.fitness);
            var q = UtilGen.getControlValue(this.subs.quality);

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
                (i == 0 ? this.vbFitness.addItem(new sap.m.Label({text: "Fitness", alignText: "CENTER"})) : null);
                this.fitnessInput.push(new sap.m.Input({}));
                this.vbFitness.addItem(this.fitnessInput[i]);
            }
            for (var i = 0; i < q; i++) {
                (i == 0 ? this.vbFitness.addItem(new sap.m.Label({text: "Quality", alignText: "CENTER"})) : null);
                this.qualityInput.push(new sap.m.Input({}));
                this.vbQuality.addItem(this.fitnessInput[i]);
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

            var data = Util.execSQL("select pos,descr from ft_ses where keyfld=" + this.qryStrKF + " and code='FITNESS' order by pos");
            if (data.ret == "SUCCESS" && data.data.length > 0) {
                var dtx = JSON.parse("{" + data.data + "}").data;
                for (var x in dtx) {
                    try {
                        this.fitnessInput[dtx[x].POS].setValue(dtx[x].DESCR);
                    } finally {
                    }
                }

            }
            var data = Util.execSQL("select pos,descr from ft_ses where keyfld=" + this.qryStrKF + " and code='QUALITY' order by pos");
            if (data.ret == "SUCCESS" && data.data.length > 0) {
                var dtx = JSON.parse("{" + data.data + "}").data;
                for (var x in dtx) {
                    try {
                        this.qualityInput[dtx[x].POS].setValue(dtx[x].DESCR);
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
            for (var i in this.fitnessInput) {
                var v = this.fitnessInput[i].getValue();
                var s = "insert into ft_ses(keyfld,pos,code,descr) " +
                    "values (:KEYFLD,:POS,:CODE,:DESCR)";
                s = s.replace(':KEYFLD', this.qryStrKF);
                s = s.replace(':POS', i);
                s = s.replace(':CODE', "'FITNESS'");
                s = s.replace(':DESCR', "'" + v + "'");
                sqs.push(s);
            }
            for (var i in this.qualityInput) {
                var v = this.qualityInput[i].getValue();
                var s = "insert into ft_ses(keyfld,pos,code,descr) " +
                    "values (:KEYFLD,:POS,:CODE,:DESCR)";
                s = s.replace(':KEYFLD', this.qryStrKF);
                s = s.replace(':POS', i);
                s = s.replace(':CODE', "'QUALITY'");
                s = s.replace(':DESCR', "'" + v + "'");
                sqs.push(s);
            }
            var sqls = "";
            for (var i in sqs)
                sqls += (sqls.trim().length > 0 ? ";" : "") + sqs[i].trim();

            return (sqDel + ";" + sqls);

        }
    }
)
;



