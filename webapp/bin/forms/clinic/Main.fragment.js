sap.ui.jsfragment("bin.forms.clinic.Main", {

    createContent: function (oController) {
        jQuery.sap.require("sap.m.MessageBox");
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 106,
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
        this.apPage = new sap.m.Page({
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

        UtilGen.clearPage(this.mainPage);
        this.o1 = {};
        var fe = [];
        this.frm = this.createViewHeader();
        // this.frm.getToolbar().addContent(this.bk);

        Util.destroyID("poCmdSave", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("mainDoc"), {
            icon: "sap-icon://doctor",
            text: "Doctors",
            press: function () {
                that.openDrs();
            }
        }));
        Util.destroyID("mainPat", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("mainPat"), {
            icon: "sap-icon://wounds-doc",
            text: "Patients",
            press: function () {
                that.openPat();
            }
        }));
        Util.destroyID("mainMan", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("mainMan"), {
            icon: "sap-icon://action-settings",
            text: "Management",
            press: function () {
                that.openMg();
            }
        }));

        Util.destroyID("rPlanCalendar", this.view);
        this.cl = new sap.m.PlanningCalendar(this.view.createId("rPlanCalendar"), {
            startDate: "{/startDate}",
            appointmentsReducedHeight: false,
            showIntervalHeaders: false,
            minDate: new Date("2000", "0", "01", "0", "0"),
            maxDate: new Date("2050", "0", "01", "0", "0"),
            viewKey: "Hour",
            appointmentsVisualization: "Filled",
            appointmentSelect: function (e) {
                var oAppointment = e.getParameter("appointment");
                that._handleEditAppointment(oAppointment);
                // console.log(oAppointment);
            },
            intervalSelect: function (e) {


                var row = e.getParameter("row");
                var oA = {
                    start_time: e.getParameter("startDate"),
                    end_time: e.getParameter("endDate"),
                    empno: row.getCustomData()[0].getKey()
                };
                that.openAppointment("", oA)
            },
            rows: {
                path: '/doctors',
                template:
                    new sap.m.PlanningCalendarRow({
                        title: "{drname}", //nonWorkingDays: [5],
                        icon: "sap-icon://doctor",
                        customData: {
                            key: "{drno}"
                        },
                        appointments: {
                            path: 'appointments',
                            template: new sap.ui.unified.CalendarAppointment({
                                startDate: "{start}",
                                endDate: "{end}",
                                title: "{title}",
                                text: "{text}",
                                type: "{type}",
                                customData: {
                                    key: "{keyfld}"
                                }


                            }),
                            templateShareable: true

                        }
                    }),
                templateShareable:
                    true

            }
        });
        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);
        sc.addContent(this.cl);


        this.mainPage.addContent(sc);

    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        this.o1 = {};
        var tl = "XL3 L2 M2 S12";
        this.o1.fromdate = UtilGen.addControl(fe, "Begin Date", sap.m.DatePicker, "faFromDate",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "date", undefined, this.view);
        this.o1.todate = UtilGen.addControl(fe, "@End Date", sap.m.DatePicker, "faToDate",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"}),
            }, "date", undefined, this.view);
        var dt = new Date();
        var fr = new Date(dt.getFullYear(), dt.getMonth(), 1);
        var to = new Date(dt.getFullYear(), 11, 31);

        UtilGen.setControlValue(this.o1.fromdate, fr);
        UtilGen.setControlValue(this.o1.todate, to);

        this.o1._cmdExe = new sap.m.Button({
            text: "Exe Query", press: function () {
                that.loadData();
            },
            layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
        });
        fe.push(this.o1._cmdExe);
        // return UtilGen.formCreate("", true, fe);
        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    }
    ,
    loadData: function () {
        var sql1 = "select no,name from salesp  where type='D' and flag=1 order by no";
        var fr = UtilGen.getControlValue(this.o1.fromdate);
        var to = UtilGen.getControlValue(this.o1.todate);
        var sql = "select a.keyfld,a.empno,a.cust_code,a.start_time, a.end_time,a.remarks,s.name emp_name, a.cust_name , " +
            " decode(a.flag,1,'Type01',2,'Type20') flag " +
            " from cl6_appoint a,salesp s,c_ycust y " +
            " where y.code(+)=a.cust_code and s.no=a.empno " +
            " and trunc(a.start_time)>=" + Util.toOraDateString(fr) +
            " and trunc(a.start_time)<=" + Util.toOraDateString(to) +
            " and a.empno=:DRNO order by a.empno,a.start_time";
        var sqlDt = "select trunc(nvl(max(a.start_time),SYSDATE)) from cl6_appoint a where " +
            "  trunc(a.start_time)>=" + Util.toOraDateString(fr) +
            " and trunc(a.start_time)<=" + Util.toOraDateString(to);

        this.mdlData = {};

        var dt = Util.execSQL(sql1);
        if (dt.ret = "SUCCESS" && dt.data.length > 0) {
            var dtx = JSON.parse("{" + dt.data + "}").data;
            var docs = [];
            for (var i = 0; i < dtx.length; i++) {
                var doc = {};
                doc.drname = dtx[i].NAME;
                doc.drno = dtx[i].NO;
                doc.appointments = [];
                var sqd = sql.replace(/:DRNO/g, doc.drno);
                var dtd = Util.execSQL(sqd);
                if (dtd.ret = "SUCCESS" && dtd.data.length > 0) {
                    var dtxd = JSON.parse("{" + dtd.data + "}").data;
                    for (var j = 0; j < dtxd.length; j++) {
                        doc.appointments[j] = {};
                        doc.appointments[j].start = new Date(dtxd[j].START_TIME);
                        doc.appointments[j].end = new Date(dtxd[j].END_TIME);
                        doc.appointments[j].title = dtxd[j].CUST_NAME;
                        doc.appointments[j].text = dtxd[j].REMARKS;
                        doc.appointments[j].type = dtxd[j].FLAG;
                        doc.appointments[j].keyfld = dtxd[j].KEYFLD;
                        doc.appointments[j].tel = dtxd[j].TEL;
                    }
                }

                docs.push(doc);
            }
            var st = new Date(Util.getSQLValue(sqlDt));
            st.setHours(9);
            this.mdlData.startDate = Util.nvl(this.start_date, st);
            this.mdlData.doctors = docs;

        }
        this.cl.setModel(new sap.ui.model.json.JSONModel({}));
        this.cl.setModel(new sap.ui.model.json.JSONModel(this.mdlData));

    }
    ,
    validateSave: function () {

        return true;
    }
    ,
    save_data: function () {

    }
    ,
    get_emails_sel: function () {

    }
    ,
    _handleEditAppointment: function (oAppointment) {
        var kf = oAppointment.getCustomData()[0].getKey();
        var fe = [];
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        var that = this;

        UtilGen.addControl(fe, "Cust Name", sap.m.Text, "frmCusName",
            {
                text: oAppointment.getProperty("title"),
            }, "string", undefined, this.view);
        UtilGen.addControl(fe, "Remarks", sap.m.Text, "frmRemarks",
            {
                text: oAppointment.getProperty("text"),
            }, "string", undefined, this.view);
        var st = UtilGen.addControl(fe, "Start Time", sap.m.Text, "frmStartDt",
            {
                enabled: false,
            }, "string", sett["ENGLISH_DATE_FORMAT"] + " h:mm a", this.view);
        var en = UtilGen.addControl(fe, "End Time", sap.m.Text, "frmEndDate",
            {
                enabled: false,
            }, "string", sett["ENGLISH_DATE_FORMAT"] + " h:m", this.view);
        var am = UtilGen.addControl(fe, "Amount", sap.m.Text, "frmAmt",
            {
                enabled: false,
            }, "number", sett["FORMAT_MONEY_1"], this.view);

        st.setText(sf.format(oAppointment.getProperty("startDate")));
        en.setText(sf.format(oAppointment.getProperty("endDate")));

        var oamt = Util.getSQLValue("select nvl(max(ord_amt),0) from order1 where ord_code=111 and ord_reference=" + Util.quoted(kf));
        am.setText(df.format(oamt));
        var type = oAppointment.getProperty("type");
        var frm = UtilGen.formCreate("", true, fe);
        frm.setSingleContainerFullSize(true);
        frm.setToolbar(undefined);
        frm.setLayout(sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout);
        var that = this;
        var hb = new sap.m.HBox({
            items: [new sap.m.Button({
                text: "Edit",
                press: function () {
                    that.openAppointment(kf, oAppointment);
                }
            }), new sap.m.Button({
                text: "Invoice",
                press: function () {
                    that.openInvoice(kf, oAppointment);
                }
            }), new sap.m.Button({
                text: "Payment",
                press: function () {
                    that.openPayment(kf, oAppointment);
                }
            }),
                new sap.m.Button({
                    text: "Post",
                    enabled: (type != "Type01" ? false : true),
                    press: function () {
                        that.postData(kf, oAppointment);
                    }
                })

            ]
        });
        var oPopover = new sap.m.Popover({
            title: "Edit Appointment",
            content: [frm],
            footer: [hb],
            placement: sap.m.PlacementType.Auto
        });
        var o = oAppointment;
        // if (oAppointment.$().position().left > $(window).width() - 600)
        //     o = this.o1.fromdate;
        oPopover.openBy(o);
    }
    ,
    openAppointment: function (kf, oA) {
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        var that = this;
        var vbox = new sap.m.VBox();
        var dlg = new sap.m.Dialog({
            contentWidth: "400px",
            content: [vbox],
            title: (Util.nvl(kf, "") != "" ? "Edit Appointment" : "Create New Appointment")
        });
        if (!this.validateAppoint(kf, oA))
            return;

        vbox.addItem(UtilGen.openForm("bin.forms.clinic.appointment", vbox, {
            backFunction: function (st) {
                dlg.close();
                if (st != undefined) {
                    that.start_date = st;
                    st.setHours(9);
                    that.loadData();
                }
            },
            qryStr: kf,
            oA: oA
        }, this.view, undefined));
        dlg.addStyleClass("sapUiSizeCondensed");
        dlg.open();
    },
    validateAppoint: function (kf, oA) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat("MM/dd/yyyy");

        if (kf != "")
            return true;
        var sql = "select to_char(in1,'HH-MI AM') IN_TIME, to_char(OUT1,'HH-MI AM') OUT_TIME " +
            "  FROM CL6_SHIFTS WHERE EMPNO=" + oA.empno + " and dayx=" + oA.start_time.getDay();
        var dt = Util.execSQL(sql);
        if (dt.ret = "SUCCESS" && dt.data.length > 0) {
            var dtx = JSON.parse("{" + dt.data + "}").data;
            var itm = new Date(df.format(oA.start_time) + " " + dtx[0].IN_TIME.replace(/-/g, ':'));
            var otm = new Date(df.format(oA.start_time) + " " + dtx[0].OUT_TIME.replace(/-/g, ':'));

            if ((itm.getHours() != 0 && otm.getHours() != 0) &&
                (!(oA.start_time.getTime() >= itm.getTime() &&
                    oA.start_time.getTime() <= otm.getTime()))) {
                sap.m.MessageToast.show("Err !. Available time between  , " + dtx[0].IN_TIME + " - " + dtx[0].OUT_TIME);
                return false;
            }
        }
        return true;

    }
    ,
    openInvoice: function (kf, oA) {
        var that = this;
        var sp = UtilGen.openForm("bin.forms.clinic.SO", undefined, {
            backFunction: function (st) {
                that.joApp.to(that.mainPage, "baseSlide");
                if (st != undefined) {
                    that.start_date = st;
                    st.setHours(9);
                    that.loadData();
                }
            },
            qryStr: "",
            oA: oA,
            apKeyfld: kf,
            getView:
                function () {
                    return that.view;
                }
        });
        sp.app = this.joApp;
        UtilGen.clearPage(this.pgDetail);
        this.pgDetail.addContent(sp);
        this.joApp.to(this.pgDetail, "slide");
    }
    ,
    openPayment: function (kf, oA) {
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        var that = this;
        var vbox = new sap.m.VBox();
        var dlg = new sap.m.Dialog({
            contentWidth: "400px",
            content: [vbox],
            title: "Payment #" + kf
        });
        vbox.addItem(UtilGen.openForm("bin.forms.clinic.payment", vbox, {
            backFunction: function (st) {
                dlg.close();
                if (st != undefined) {
                    that.start_date = st;
                    st.setHours(9);
                    that.loadData();
                }
            },
            qryStr: kf,
            oA: oA
        }, this.view, undefined));
        dlg.addStyleClass("sapUiSizeCondensed");
        dlg.open();
    }
    ,
    postData: function (kf, oA) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var on = Util.getSQLValue("select ord_no from order1 where ord_code=111 and ord_reference=" + kf);
        if (Util.nvl(on, "") == "") {
            sap.m.MessageToast.show("Not found Sales Order Req. ! ");
            return;
        }
        var flg = parseFloat(Util.getSQLValue("select flag from cl6_appoint where keyfld=" + kf));
        if (flg == 2) {
            sap.m.MessageToast.show("Already posted !");
            return;
        }

        var usr = sett["LOGON_USER"];
        sap.m.MessageBox.confirm("Are you sure to POST this appointment : ?  ", {
            title: "Confirm",                                    // default
            onClose: function (oAction) {
                if (oAction == sap.m.MessageBox.Action.OK) {
                    // do validate second time after confirm dialog !!!
                    var on = Util.getSQLValue("select ord_no from order1 where ord_code=111 and ord_reference=" + kf);
                    if (Util.nvl(on, "") == "") {
                        sap.m.MessageToast.show("Not found Sales Order Req. ! ");
                        return;
                    }
                    var flg = parseFloat(Util.getSQLValue("select flag from cl6_appoint where keyfld=" + kf));
                    if (flg == 2) {
                        sap.m.MessageToast.show("Already posted !");
                        return;
                    }

                    var sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                        " where ord_code=111 and ord_no=" + on + ";" +
                        "X_POST_APPOINT(" + kf + "); update order1 set approved_by='" + usr + "' where ord_code=111 and ord_no=" + on + ";";

                    var dt = Util.execSQL("begin " + sql + " end;");
                    if (dt.ret = "SUCCESS") {
                        sap.m.MessageToast.show("POSTED successfully !.. !");
                        that.oController.backFunction(UtilGen.getControlValue(oA.getProperty("startDate")));
                    }
                }
            },                                       // default
            styleClass: "",                                      // default
            initialFocus: null,                                  // default
            textDirection: sap.ui.core.TextDirection.Inherit     // default
        });
    }
    ,
    openDrs: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        var that = this;
        var sp = UtilGen.openForm("bin.forms.clinic.doctors", undefined, {
            backFunction: function () {
                that.joApp.to(that.mainPage, "baseSlide");
            },
            qryStr: "",
            getView:
                function () {
                    return that.view;
                }
        });
        sp.app = this.joApp;
        UtilGen.clearPage(this.pgDetail);
        this.pgDetail.addContent(sp);
        this.joApp.to(this.pgDetail, "slide");
    }
    ,
    openPat: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        var that = this;
        var sp = UtilGen.openForm("bin.forms.clinic.pat", undefined, {
            backFunction: function () {
                that.joApp.to(that.mainPage, "baseSlide");
            },
            qryStr: "",
            getView:
                function () {
                    return that.view;
                }
        });
        sp.app = this.joApp;
        UtilGen.clearPage(this.pgDetail);
        this.pgDetail.addContent(sp);
        this.joApp.to(this.pgDetail, "slide");
    },
    openMg: function () {
        var that = this;
        var bk = function () {
            that.joApp.to(that.mainPage, "baseSlide");
        };

        var sp = UtilGen.openForm("bin.Queries", undefined, {
            backFunction: bk,
            setProfile: "8800",
            getView:
                function () {
                    return that.view;
                }
        });
        sp.app = this.joApp;
        sp.backFunction = bk;

        UtilGen.clearPage(this.pgDetail);
        this.pgDetail.addContent(sp);
        this.joApp.to(this.pgDetail, "slide");

    }

})
;



