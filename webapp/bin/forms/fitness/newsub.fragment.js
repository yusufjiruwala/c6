sap.ui.jsfragment("bin.forms.fitness.newsub", {

    createContent: function (oController) {
        jQuery.sap.require("sap.ui.commons.library");
        jQuery.sap.require("sap.m.MessageBox");
        this.view = oController.getView();
        var that = this;
        that.vars = {
            price: 0,
            surgery_date: null,
            fromdate: null,
            todate: null,
            session_code: "",
            session_name: "",
            isClosed: false
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


        return this.mainPage;
    },
    createView: function () {

        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        this.subs = {};
        this.qryStr = "";
        if (this.oController.qryStr != undefined)
            this.qryStr = this.oController.qryStr;


        UtilGen.clearPage(this.mainPage);

        var tb = new sap.m.Toolbar({content: [that.bk]});

        this.subs.athlet_code = UtilGen.createControl(sap.m.MaskInput, this.view, "code",
            {
                layoutData: new sap.ui.layout.GridData({span: "XL1 L2 M2 S4"}),
                placeholderSymbol: "_",
                mask: "9999",
                value: '0001'
            }, "string");

        this.subs.athlet_name = UtilGen.createControl(sap.m.SearchField, this.view, "name", {
            customData: [{key: ""}],
            liveChange: function (e) {
                var vl = e.getParameters().newValue;
                if (that.mode == "user" && Util.nvl(vl.length > 0)) {
                    that.subs.athlet_name.getCustomData()[0].setKey(vl);
                }
            },
            search: function (e) {

                if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                    that.subs.athlet_code.setValue(Util.getSQLValue("select trim(TO_CHAR(NVL(max(to_number(CODE)),0)+1,'0000')) from C_YCUST " +
                        " WHERE PARENTCUSTOMER=nvl(repair.getsetupvalue_2('FT_CUSTOMER'),'1')"));
                    that.subs.athlet_name.setValue("");
                    that.subs.athlet_name.getCustomData()[0].setKey("");
                    return;
                }

                var sq = "SELECT CODE,NAME TITLE FROM C_YCUST WHERE PARENTCUSTOMER=nvl(repair.getsetupvalue_2('FT_CUSTOMER'),'1')  ORDER BY NAME";
                Util.showSearchList(e, sq, function (valx, val) {
                    that.subs.athlet_code.setValue(valx.getKey());
                    that.subs.athlet_name.setValue(val);
                    that.subs.athlet_name.getCustomData()[0].setKey(val);

                });
            }

        }, "string");

        this.subs.age = UtilGen.createControl(sap.m.MaskInput, this.view, "age", {
            mask: "99",
            value: "00",
            placeholderSymbol: "_"
        }, "number");

        this.subs.tel = UtilGen.createControl(sap.m.Input, this.view, "tel", {
            placeholder: "Telephone..",
            bShowLabelAsPlaceholder: true,
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
        }, "string");


        this.subs.training_target = UtilGen.createControl(sap.m.Input, this.view, "training_target", {}, "string");


        this.subs.training_stage = UtilGen.createControl(sap.m.Input, this.view, "training_stage", {}, "string");


        this.subs.start_date = UtilGen.createControl(sap.m.DatePicker, this.view, "start_date", {
            valueFormat: sett["ENGLISH_DATE_FORMAT"],
            displayFormat: sett["ENGLISH_DATE_FORMAT"],

        }, "date");

        this.subs.end_date = UtilGen.createControl(sap.m.DatePicker, this.view, "end_date",
            {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"]
            }, "date");


        var titOther = new sap.ui.core.Title({text: "Other Info"});
        this.subs.sport_type = UtilGen.createControl(sap.m.Input, this.view, "sport_type", {}, "string");
        this.subs.injury_type = UtilGen.createControl(sap.m.Input, this.view, "injury_type", {}, "string");
        this.subs.injury_place = UtilGen.createControl(sap.m.Input, this.view, "injury_place", {}, "string");
        this.subs.surgery_date = UtilGen.createControl(sap.m.DatePicker, this.view, "surgery_date",
            {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"]
            }, "date");

        var frm = UtilGen.formCreate("{i18n>athlet_info}", true,
            ["{i18n>sub_name}", this.subs.athlet_code, this.subs.athlet_name,
                "{i18n>sub_age_tel}", this.subs.age, this.subs.tel,
                "{i18n>sub_train_target}", this.subs.training_target,
                "{i18n>sub_train_stage}", this.subs.training_stage,
                "{i18n>sub_subscription}", this.subs.start_date, this.subs.end_date,
                titOther,
                "{i18n>sub_sport_type}", this.subs.sport_type,
                "{i18n>sub_injury_place}", this.subs.injury_place,
                "{i18n>sub_injury_type}", this.subs.injury_type,
                "{i18n>sub_surgery_date}", this.subs.surgery_date
            ]);
        frm.addStyleClass("sapUiLargeMarginBottom");
        frm.getToolbar().addContent(new sap.m.Button({
            text: "{i18n>save_ses}", press: function () {
                that.save_data(false);
                if (that.qryStr == "")
                    return;

                var oC = {
                    qryStrKF: that.qryStr,
                    qryStrAthletCode: that.subs.athlet_code.getValue(),
                    qryStrAthletCodeName: that.subs.athlet_name.getValue(),
                    getView: function () {
                        return that.view;
                    }

                };
                var sp = sap.ui.jsfragment("bin.forms.fitness.session", oC);
                sp.backFunction = function () {
                    that.mainPage.app.to("pgSub", "slide");
                    //that.mainPage.app.addPage(that.mainPage);
                };
                sp.app = that.app;
                that.mainPage.app.to("pgSes", "slide");
            }
        }));

        (that.view.byId("cmdSubClose") != undefined ? that.view.byId("cmdSubClose").destroy() : null);
        frm.getToolbar().addContent(new sap.m.Button(that.view.createId("cmdSubClose"), {
            text: "{i18n>sub_end}", press: function () {
                that.closeSub();
            }
        }));

        (that.view.byId("txtSubClose") != undefined ? that.view.byId("txtSubClose").destroy() : null);
        frm.getToolbar().addContent(new sap.m.Button(that.view.createId("txtSubClose"), {
            text: ""
        }));
        frm.getToolbar().addContent(new sap.m.ToolbarSpacer());

        (that.view.byId("cmdSubSave") != undefined ? that.view.byId("cmdSubSave").destroy() : null);
        frm.getToolbar().addContent(new sap.m.Button(that.view.createId("cmdSubSave"), {
            text: "{i18n>save}", press: function () {
                that.save_data();
            }
        }));

        frm.getToolbar().addContent(new sap.m.Button({
            text: "{i18n>list}", press: function () {
                that.show_list();
            }
        }));
        if (this.oController.qryStr == undefined)
            frm.getToolbar().addContent(new sap.m.Button({
                text: "{i18n>clear}", press: function () {
                    that.qryStr = "";
                    that.load_data();
                }
            }));
        (that.view.byId("cmdSubDel") != undefined ? that.view.byId("cmdSubDel").destroy() : null);
        frm.getToolbar().addContent(new sap.m.Button(that.view.createId("cmdSubDel"), {
            text: "{i18n>delete}", press: function () {
                that.delete_data();
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
        this.vars.surgery_date = null;
        this.vars.fromdate = null;
        this.vars.todate = null;
        this.vars.price = 0;
        this.vars.isClosed = false;
    },
    load_data: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        this.mode = "system";
        that.resetVars();
        that.view.byId("cmdSubClose").setEnabled(true);
        that.view.byId("cmdSubSave").setEnabled(true);
        that.view.byId("cmdSubDel").setEnabled(true);


        try {
            if (this.qryStr.length == 0) {
                var dt = Util.getSQLValue("select trim(TO_CHAR(NVL(max(to_number(CODE)),0)+1,'0000')) from C_YCUST " +
                    "  WHERE PARENTCUSTOMER=nvl(repair.getsetupvalue_2('FT_CUSTOMER'),'1')");
                this.subs.athlet_code.setValue(dt);
                this.subs.athlet_name.setValue("");
                this.subs.age.setValue("00");
                this.subs.tel.setValue("");
                this.subs.training_stage.setValue("");
                this.subs.training_target.setValue("");
                this.subs.start_date.setDateValue(null);
                this.subs.end_date.setValue(null);
                this.subs.sport_type.setValue("");
                this.subs.injury_place.setValue("");
                this.subs.surgery_date.setDateValue(null);
            } else {
                var dat = Util.execSQL("select *from ft_contract where keyfld=" + this.qryStr);
                if (dat.ret == "SUCCESS" && dat.data.length > 0) {
                    var dtx = JSON.parse("{" + dat.data + "}").data;

                    if (dtx[0].SURGERY_DATE != null)
                        that.vars.surgery_date = new Date(dtx[0].SURGERY_DATE);
                    if (dtx[0].START_DATE != null)
                        that.vars.fromdate = new Date(dtx[0].START_DATE);
                    if (dtx[0].END_DATE != null)
                        this.vars.todate = new Date(dtx[0].END_DATE);

                    that.vars.price = dtx[0].AMOUNT;

                    this.subs.athlet_code.setValue(dtx[0].ATHLET_CODE);
                    this.subs.athlet_name.setValue(dtx[0].ATHLET_NAME);
                    this.subs.athlet_name.getCustomData()[0].getKey(dtx[0].ATHLET_NAME);
                    this.subs.age.setValue(dtx[0].AGE);
                    this.subs.tel.setValue(dtx[0].TEL);
                    this.subs.training_stage.setValue(dtx[0].TRAINING_STAGE);
                    this.subs.training_target.setValue(dtx[0].TRAINING_TARGET);
                    this.subs.sport_type.setValue(dtx[0].SPORT_TYPE);
                    this.subs.injury_place.setValue(dtx[0].INJURY_PLACE);
                    this.subs.start_date.setDateValue(this.vars.fromdate);
                    this.subs.end_date.setDateValue(this.vars.todate);
                    this.subs.surgery_date.setDateValue(that.vars.surgery_date);
                    this.vars.isClosed = (dtx[0].FLAG != 1);
                    if (dtx[0].FLAG != 1) {
                        that.view.byId("cmdSubClose").setEnabled(false);
                        that.view.byId("cmdSubSave").setEnabled(false);
                        that.view.byId("cmdSubDel").setEnabled(false);
                    }
                }


            }
        }
        finally {
            this.mode = "user";
        }

    },
    save_data: function (clearScr) {
        var clearScreen = Util.nvl(clearScr, true);
        var that = this;
        this.validateSave();

        if (this.qryStr.length == 0) {
            var kf = Util.getSQLValue("select nvl(max(keyfld),0)+1 from ft_contract");
            var k = UtilGen.getSQLInsertString(this.subs, {"keyfld": "(select nvl(max(keyfld),0)+1 from ft_contract)"});
            k = "insert into FT_CONTRACT " + k;
            var pk = "" +
                "declare " +
                "kf number;" +
                "begin" +
                "  select nvl(max(keyfld),0)+1 into kf from ft_contract;" +
                "  ft_create_customer('" + that.subs.athlet_code.getValue() + "','" + that.subs.athlet_name.getValue() + "');" + k + "; " +
                "end;";
            var oSql = {
                "sql": pk,
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
                    var kfx = Util.getSQLValue("select nvl(max(keyfld),0) from ft_contract");
                    if (kfx == kf) {
                        that.qryStr = kf;
                        that.load_data();
                    }
                } else
                    that.load_data();
            });
        } else {
            var k = UtilGen.getSQLUpdateString(this.subs, "FT_CONTRACT", {}, " KEYFLD=" + this.qryStr);
            var pk = "begin " +
                "  ft_create_customer('" + that.subs.athlet_code.getValue() + "','" + that.subs.athlet_name.getValue() + "');" + k + "; " +
                "end;";

            var oSql = {
                "sql": pk,
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
                sap.m.MessageToast.show("Saved... !");
                if (that.oController.qryStr != undefined) {
                    that.mainPage.backFunction();
                    return;
                }

                if (clearScreen == false)
                    that.load_data();
                else {
                    that.qryStr = "";
                    that.load_data();
                }
            });
        }
    },
    closeSub: function () {
        var that = this;
        if (that.qryStr == "")
            return;

        sap.m.MessageBox.confirm("Are you sure to CLOSE this Subscriber : ?  " + that.subs.athlet_name.getValue(), {
            title: "Confirm",                                    // default
            onClose: function (oAction) {
                if (oAction == sap.m.MessageBox.Action.OK) {
                    var dat = Util.execSQL("update ft_contract set flag=2 where keyfld=" + that.qryStr);
                    if (dat.ret == "SUCCESS") {
                        sap.m.MessageToast.show("Closed....! ");
                        that.qryStr = "";
                        that.load_data();
                    }

                }
            },                                       // default
            styleClass: "",                                      // default
            initialFocus: null,                                  // default
            textDirection: sap.ui.core.TextDirection.Inherit     // default
        });
    },
    delete_data: function () {
        var that = this;
        if (that.qryStr == "")
            return;

        sap.m.MessageBox.confirm("Are you sure to DELETE this Subscriber : ?  " + that.subs.athlet_name.getValue(), {
            title: "Confirm",                                    // default
            onClose: function (oAction) {
                if (oAction == sap.m.MessageBox.Action.OK) {
                    var dat = Util.execSQL("begin " +
                        "delete from ft_contract where keyfld=" + that.qryStr + ";" +
                        "delete from ft_sessions where keyfld=" + that.qryStr + ";" +
                        "end;");
                    if (dat.ret == "SUCCESS") {
                        sap.m.MessageToast.show("Deleted....!");
                        that.qryStr = "";
                        that.load_data();
                    }

                }
            },                                       // default
            styleClass: "",                                      // default
            initialFocus: null,                                  // default
            textDirection: sap.ui.core.TextDirection.Inherit     // default
        });
    },
    show_list: function () {
        var that = this;
        var sql = "select athlet_name,athlet_code,start_date,keyfld from ft_contract order by keyfld desc";
        var cols = ["ATHLET_NAME", "ATHLET_CODE"];

        Util.show_list(sql, cols, function (data) {
            that.qryStr = data.KEYFLD;
            that.load_data();
            return true;
        }, "500px", "90%", 10);
    },
    validateSave: function () {
        var that = this;
        if (this.vars.isClosed) {
            sap.m.MessageToast.show("This subscriber is closed... !");
            throw "This subscriber is closed..!";
        }
    }

});



