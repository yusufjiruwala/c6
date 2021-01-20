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
            isClosed: false,
            rehab: 0
        }
        ;
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

        this.subs.location_code = UtilGen.createControl(sap.m.ComboBox, this.view, "location", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectionChange: function (event) {
                that.setNewFileNo();
            }
        }, "string", undefined, undefined, "select code,name from locations order by 1");

        this.subs.fileno = UtilGen.createControl(sap.m.MaskInput, this.view, "fileno",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL1 L2 M2 S4"}),
                mask: "9999",
                value: '0001'
            }, "number").addStyleClass("redText");

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
                    UtilGen.setControlValue(that.subs._info_subs_no, "");
                    that.subs.athlet_name.getCustomData()[0].setKey("");
                    return;
                }

                var sq = "SELECT CODE,NAME TITLE FROM C_YCUST WHERE PARENTCUSTOMER=nvl(repair.getsetupvalue_2('FT_CUSTOMER'),'1')  ORDER BY NAME";
                Util.showSearchList(e, sq, function (valx, val) {
                    that.subs.athlet_code.setValue(valx.getKey());
                    that.subs.athlet_name.setValue(val);
                    that.subs.athlet_name.getCustomData()[0].setKey(val);
                    UtilGen.setControlValue(that.subs._info_subs_no, "");
                    var n = Util.getSQLValue("select nvl(count(*),0) from  ft_contract where athlet_code='" +
                        UtilGen.getControlValue(that.subs.athlet_code) + "'");
                    if (n > 0)
                        UtilGen.setControlValue(that.subs._info_subs_no, "No Of Subscription : " + n);
                    if (that.qryStr == "") {
                        var kf = Util.getSQLValue("select MAX(keyfld) from ft_contract where athlet_code='" + valx.getKey() + "'");
                        var dat = Util.execSQL("select age,tel,NATIONALITY, CIVILID,TRAINING_TARGET, TRAINING_STAGE," +
                            " SESSION_CODE, SPORT_TYPE, INJURY_TYPE, INJURY_PLACE, SURGERY_DATE from ft_contract where keyfld=" + kf);
                        if (dat.ret == "SUCCESS" && dat.data.length > 0) {
                            var dtx = JSON.parse("{" + dat.data + "}").data;
                            //UtilGen.setControlValue(that.subs.age, dtx[0].AGE);
                            UtilGen.loadDataFromJson(that.subs, dtx[0], true);
                        }
                    }
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

        this.subs.salesp = UtilGen.createControl(sap.m.ComboBox, this.view, "LeadBy", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{NO}"}),
                templateShareable: true
            },
            selectionChange: function (event) {

            }
        }, "string", undefined, undefined, "select NAME,NO from salesp where type='S' order by 1");

        this.subs.nationality = UtilGen.createControl(sap.m.ComboBox, this.view, "nationality", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectionChange: function (event) {

            }
        }, "string", undefined, undefined, "select NAME,DESCR from RELIISTS where idlist='NATIONALITY' order by 1");

        this.subs.civilid = UtilGen.createControl(sap.m.MaskInput, this.view, "civilid", {
            mask: "999999999999",
            value: "",
            placeholderSymbol: "_"
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

        this.subs._info_subs_no = UtilGen.createControl(sap.m.Text, this.view, "no_of_subs", {}, "string");
        this.subs._info_expiry_message = UtilGen.createControl(sap.m.Text, this.view, "expiry_message", {}, "string");
        this.subs._info_expiry_message.addStyleClass("redText blinking");
        this.subs._info_subs_no.addStyleClass("redText");

        var frm = UtilGen.formCreate("{i18n>athlet_info}", true,
            ["Location / File", this.subs.location_code,
                "{i18n>sub_name}", this.subs.athlet_code, this.subs.athlet_name,
                "{i18n>sub_age_tel}", this.subs.age, this.subs.tel,
                "{i18n>nationality}", this.subs.nationality,
                "Lead By", this.subs.salesp,
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
        frm.getToolbar().addContent(new sap.m.Text(that.view.createId("txtSubClose"), {
            text: ""
        }));

        (that.view.byId("cmdSubSession") != undefined ? that.view.byId("cmdSubSession").destroy() : null);
        frm.getToolbar().addContent(new sap.m.Button(that.view.createId("cmdSubSession"), {
            text: "{i18n>subscription}",
            press: function () {
                that.save_data(false);
                that.openSession();
            }
        }));

        (that.view.byId("cmdSubPay") != undefined ? that.view.byId("cmdSubPay").destroy() : null);
        frm.getToolbar().addContent(new sap.m.Button(that.view.createId("cmdSubPay"), {
            text: "{i18n>payments}",
            press: function () {
                that.save_data(false);
                that.openPayment();
            }
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

        var hb = new sap.m.HBox({
            items: [this.subs._info_subs_no, new sap.m.Text({
                text: "",
                width: "100px"
            }), this.subs._info_expiry_message],
            width: "100%"
        });

        var vb = new sap.m.VBox({
            items: [hb, frm]
        }).addStyleClass("sapUiSmallMargin");

        this.mainPage.addContent(tb);
        this.mainPage.addContent(vb);
        this.load_data();
    },
    openSession: function () {
        var that = this;
        if (that.qryStr == "")
            return;
        var oC = {
            qryStrKF: that.qryStr,
            qryStrAthletCode: that.subs.athlet_code.getValue(),
            qryStrAthletCodeName: that.subs.athlet_name.getValue(),
            getView: function () {
                return that.view;
            }
        }
        var sp = sap.ui.jsfragment("bin.forms.fitness.drana", oC);
        sp.backFunction = function () {
            var pgSub = that.view.byId("pgSub");
            that.mainPage.app.to(pgSub, "slide");
        };
        var pgAna = this.view.byId("pgAna");
        sp.app = that.app;
        UtilGen.clearPage(pgAna);
        pgAna.addContent(sp);
        that.mainPage.app.to(pgAna, "slide");

    }
    ,
    openPayment: function () {
        var that = this;
        if (that.qryStr == "")
            return;
        var oC = {
            qryStrKF: that.qryStr,
            qryStrAthletCode: that.subs.athlet_code.getValue(),
            qryStrAthletCodeName: that.subs.athlet_name.getValue(),
            getView: function () {
                return that.view;
            }
        }
        var sp = sap.ui.jsfragment("bin.forms.fitness.payments", oC);
        sp.backFunction = function () {
            var pgSub = that.view.byId("pgSub");
            that.mainPage.app.to(pgSub, "slide");
        };
        var pgPay = this.view.byId("pgPay");
        sp.app = that.app;
        UtilGen.clearPage(pgPay);
        pgPay.addContent(sp);
        that.mainPage.app.to(pgPay, "slide");

    }
    ,
    resetVars: function () {
        this.vars.surgery_date = null;
        this.vars.fromdate = null;
        this.vars.todate = null;
        this.vars.price = 0;
        this.vars.isClosed = false;
        this.vars.rehab = 0;
    }
    ,
    setNewFileNo: function () {
        var dt2 = Util.getSQLValue("select to_char(NVL(max(fileno),0)+1,'0000') from ft_contract " +
            "  WHERE location_code='" + UtilGen.getControlValue(this.subs.location_code) + "'");
        UtilGen.setControlValue(this.subs.fileno, dt2, false);

    }
    ,
    load_data: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        this.mode = "system";
        that.resetVars();
        this.subs.end_date.setEnabled(false);

        that.view.byId("cmdSubClose").setEnabled(true);
        that.view.byId("cmdSubSave").setEnabled(true);
        that.view.byId("cmdSubDel").setEnabled(true);

        that.subs.start_date.setEnabled(true);
        that.subs.athlet_code.setEnabled(true);
        that.subs.athlet_name.setEnabled(true);
        UtilGen.setControlValue(this.subs._info_subs_no, "");
        UtilGen.setControlValue(this.subs._info_expiry_message, "");

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
                this.subs.civilid.setValue("");
                UtilGen.setControlValue(this.subs.civilid, "");
                UtilGen.setControlValue(this.subs.nationality, "");
                UtilGen.setControlValue(this.subs.salesp, "");

                this.subs.start_date.setDateValue(null);
                this.subs.end_date.setValue(null);
                this.subs.sport_type.setValue("");
                this.subs.injury_place.setValue("");
                this.subs.surgery_date.setDateValue(null);
                UtilGen.setControlValue(this.subs.location_code, sett["USER_LOCATION"]);
                that.setNewFileNo();
            } else {
                this.subs.location_code.setEditable(false);
                var dat = Util.execSQL("select *from ft_contract where keyfld=" + this.qryStr);
                if (dat.ret == "SUCCESS" && dat.data.length > 0) {
                    var dtx = JSON.parse("{" + dat.data + "}").data;
                    var sd = Util.getSQLValue("select max(name) from salesp where no=" + dtx[0].SALESP);
                    if (dtx[0].SURGERY_DATE != null)
                        that.vars.surgery_date = new Date(dtx[0].SURGERY_DATE);
                    if (dtx[0].START_DATE != null)
                        that.vars.fromdate = new Date(dtx[0].START_DATE);
                    if (dtx[0].END_DATE != null)
                        this.vars.todate = new Date(dtx[0].END_DATE);
                    (that.vars.rehab == 0 ? that.subs.start_date.setEnabled(false) : null);
                    that.vars.price = dtx[0].AMOUNT;
                    that.vars.rehab = dtx[0].REHAB;
                    UtilGen.setControlValue(this.subs.location_code, dtx[0].LOCATION_CODE, dtx[0].LOCATION_CODE, true);
                    UtilGen.setControlValue(this.subs.fileno, dtx[0].FILENO, dtx[0].FILENO, true);
                    this.subs.athlet_code.setValue(dtx[0].ATHLET_CODE);
                    this.subs.athlet_name.setValue(dtx[0].ATHLET_NAME);
                    this.subs.athlet_name.getCustomData()[0].getKey(dtx[0].ATHLET_NAME);
                    this.subs.age.setValue(dtx[0].AGE);
                    this.subs.tel.setValue(dtx[0].TEL);
                    this.subs.training_stage.setValue(dtx[0].TRAINING_STAGE);
                    this.subs.training_target.setValue(dtx[0].TRAINING_TARGET);
                    UtilGen.setControlValue(this.subs.civilid, dtx[0].CIVILID);
                    UtilGen.setControlValue(this.subs.nationality, dtx[0].NATIONALITY);
                    UtilGen.setControlValue(this.subs.salesp, dtx[0].SALESP, sd, true);
                    this.subs.sport_type.setValue(dtx[0].SPORT_TYPE);
                    this.subs.injury_place.setValue(dtx[0].INJURY_PLACE);
                    this.subs.start_date.setDateValue(this.vars.fromdate);
                    this.subs.end_date.setDateValue(this.vars.todate);
                    this.subs.surgery_date.setDateValue(that.vars.surgery_date);
                    this.vars.isClosed = (dtx[0].FLAG != 1);

                    if (dtx[0].SALEINV != null && dtx[0].SALEINV != 0) {
                        that.subs.athlet_code.setEnabled(false);
                        that.subs.athlet_name.setEnabled(false);
                    }
                    if (dtx[0].FLAG != 1) {
                        that.view.byId("cmdSubClose").setEnabled(false);
                        that.view.byId("cmdSubSave").setEnabled(false);
                        that.view.byId("cmdSubDel").setEnabled(false);
                    }

                    var dt1 = UtilGen.getControlValue(this.subs.end_date);
                    if (dt1 != undefined && dt1 != "") {
                        var dt2 = new Date();
                        var nod = parseInt(Util.nvl(sett["FT_NO_OF_DAYS_ALERT"], "10"));
                        var df = Util.getDaysBetween(dt1, dt2);
                        if (df < nod)
                            UtilGen.setControlValue(this.subs._info_expiry_message, "Expiry before " + df + " Days");
                    }
                    var n = Util.getSQLValue("select nvl(count(*),0) from  ft_contract where athlet_code='" +
                        UtilGen.getControlValue(this.subs.athlet_code) + "'");
                    if (n > 1)
                        UtilGen.setControlValue(this.subs._info_subs_no, "No Of Subscription : " + n);


                }


            }
        }
        finally {
            this.mode = "user";
        }

    }
    ,
    save_data: function (clearScr) {
        var clearScreen = Util.nvl(clearScr, true);
        var that = this;
        this.validateSave();
        if (!that.checkPriorSub())
            return;

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

                if (clearScreen == false) {
                    var kk = Util.getSQLValue("select nvl(max(keyfld),0)+1 from ft_contract");
                    if (kk == kf) {
                        that.qryStr = kk + "";
                        that.load_data();
                    }
                }
                else {
                    that.qryStr = "";
                    that.load_data();
                }
            });
        }
    }
    ,
    checkPriorSub: function () {
        var that = this;
        var ac = UtilGen.getControlValue(this.subs.athlet_code);

        /*
         var kf = Util.getSQLValue("select max(keyfld) from ft_contract where athlet_code='"
             + ac + "'" + (this.qryStr != "" ? " and keyfld!=" + this.qryStr : ""));
         var flg = Util.getSQLValue("select flag from ft_contract where keyfld='" + kf + "'");
         if (flg == 1) {
             sap.m.MessageToast.show("Please CLOSE previous Subscription !");
             return false;
         }
         */
        return true;
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
    }
    ,
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
    }
    ,
    show_list: function () {
        var that = this;
        var sql = "select athlet_name,athlet_code,start_date,keyfld from ft_contract order by keyfld desc";
        var cols = ["ATHLET_NAME", "ATHLET_CODE"];

        Util.show_list(sql, cols, function (data) {
            that.qryStr = data.KEYFLD;
            that.load_data();
            return true;
        }, "500px", "90%", 10);
    }
    ,
    validateSave: function () {
        var that = this;
        if (this.vars.isClosed) {
            sap.m.MessageToast.show("This subscriber is closed... !");
            throw "This subscriber is closed..!";
        }
    }

})
;



