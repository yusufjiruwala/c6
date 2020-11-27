sap.ui.jsfragment("bin.forms.clinic.appointment", {

    createContent: function (oController) {
        jQuery.sap.require("sap.m.MessageBox");
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = oController.qryStr;
        this.oA = oController.oA;
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode}).addStyleClass("sapUiSizeCondensed");
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
        }).addStyleClass("sapUiSizeCondensed");
        ;
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

        Util.destroyID("poCmdSave", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave"), {
            icon: "sap-icon://save", press: function () {
                that.save_data();
            }
        }));

        Util.destroyID("poCmdDel", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdDel"), {
            icon: "sap-icon://delete", press: function () {
                that.delete_data();
            }
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

        this.fa.keyfld = UtilGen.addControl(fe, "Key ID", sap.m.Input, "apKeyfld",
            {
                editable: false,
            }, "string", undefined, this.view);
        this.fa.empno = UtilGen.addControl(fe, "Doctor", sap.m.ComboBox, "apEmpno",
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{NAME}", key: "{NO}"}),
                    templateShareable: true
                }
            }, "string", undefined, this.view, undefined, "select no,name from salesp where type='D'  order by 1");

        this.fa.start_time = UtilGen.addControl(fe, "Start Time", sap.m.DateTimePicker, "apStart",
            {
                editable: true,
            }, "date", undefined, this.view);
        this.fa.end_time = UtilGen.addControl(fe, "End Time", sap.m.DateTimePicker, "apEnd",
            {
                editable: true,
            }, "date", undefined, this.view);

        this.fa.end_time.setValueFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        this.fa.end_time.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");

        this.fa.start_time.setValueFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        this.fa.start_time.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        this.fa.tel = UtilGen.addControl(fe, "Tel", sap.m.Input, "apTel",
            {
                editable: true,
            }, "string", undefined, this.view);

        this.fa.cust_name = UtilGen.addControl(fe, "Cust Name", sap.m.SearchField, "apCustName",
            {
                editable: true,
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.fa.cust_name, "", "", true);
                        UtilGen.setControlValue(that.fa.tel, "", "", true);
                        return;
                    }

                    var sql = "select code,name title,tel,reference civil_id from c_ycust where iscust='Y' and childcount=0  and code like '1%' order by code";

                    var fnOnSelect = function (data) {
                        if (data != undefined && data.length <= 0)
                            return;
                        UtilGen.setControlValue(that.fa.cust_name, data.TITLE, data.TITLE, true);
                        UtilGen.setControlValue(that.fa.tel, data.TEL, data.TEL, true);
                        return true;
                    };
                    Util.show_list(sql, ["TITLE", "CODE", "TEL", "REFERENCE"],
                        undefined, fnOnSelect, "100%", "100%", 10, false, undefined);
                    // Util.showSearchList(sq, "TITLE", "TITLE", function (valx, val) {
                    //     UtilGen.setControlValue(that.fa.cust_name, val, val, true);
                    // })
                }
            }
            , "string", undefined, this.view);
        this.fa.remarks = UtilGen.addControl(fe, "Remarks", sap.m.Input, "apRemarks",
            {
                editable: true,
            }, "string", undefined, this.view);

        this.frm = UtilGen.formCreate("", true, fe);
        return this.frm;
        // return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {

        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        UtilGen.setControlValue(this.fa.keyfld, this.qryStr);

        if (this.qryStr != "") {
            var dt = Util.execSQL("select *from cl6_appoint where keyfld=" + this.qryStr);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.setControlValue(this.fa.start_time, dtx[0].START_TIME);
                UtilGen.setControlValue(this.fa.empno, parseInt(dtx[0].EMPNO));
                UtilGen.setControlValue(this.fa.end_time, dtx[0].END_TIME);
                UtilGen.setControlValue(this.fa.tel, dtx[0].TEL);
                UtilGen.setControlValue(this.fa.cust_name, dtx[0].CUST_NAME);
                UtilGen.setControlValue(this.fa.remarks, dtx[0].REMARKS);

                if (dtx[0].FLAG != 1) {
                    UtilGen.editableContent(that.frm, false);
                    that.view.byId("poCmdSave").setEnabled(false);
                    that.view.byId("poCmdDel").setEnabled(false);
                }

            }


        } else {
            UtilGen.setControlValue(this.fa.start_time, this.oA.start_time);
            UtilGen.setControlValue(this.fa.end_time, this.oA.end_time);
            UtilGen.setControlValue(this.fa.empno, this.oA.empno + "");
        }
    }
    ,
    validateSave: function () {
        var st = UtilGen.getControlValue(this.fa.start_time);
        var en = UtilGen.getControlValue(this.fa.end_time);

        if (st.getTime() > en.getTime()) {
            sap.m.MessageToast.show("Err !,  Start time more than end time !");
            return false;
        }
        var flg = parseInt(Util.getSQLValue("select nvl(max(flag),1) from cl6_appoint where keyfld=" + Util.quoted(this.qryStr)));
        if (flg != 1) {
            sap.m.MessageToast.show("Err !,  Invoice is POSTED  / CANCELLED!");
            return false;
        }

        return true;
    }
    ,
    save_data: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var usr = sett["LOGON_USER"];
        if (!this.validateSave())
            return;
        var k = ""
        if (this.qryStr != "") {
            k = UtilGen.getSQLUpdateString(this.fa, "cl6_appoint", {CUST_NAME: Util.quoted(this.fa.cust_name.getValue())}, " keyfld = " + Util.quoted(this.qryStr), ["keyfld", "cust_name"], true);
        } else {
            k = UtilGen.getSQLInsertString(this.fa, {
                "CUST_NAME": Util.quoted(this.fa.cust_name.getValue()),
                "KEYFLD": Util.getSQLValue("select nvl(max(keyfld),0)+1 from cl6_appoint"),
                "BOOKED_BY": Util.quoted(usr),
                "BOOKED_ON": "SYSDATE"
            }, ["cust_name", "keyfld"], true);
            k = "begin insert into cl6_appoint " + k + "; end;";
        }
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
            that.oController.backFunction(UtilGen.getControlValue(that.fa.start_time));

        });

    },
    delete_data: function () {
        var that = this;
        sap.m.MessageBox.confirm("Are you sure to DELETE this appointment : ?  ", {
            title: "Confirm",                                    // default
            onClose: function (oAction) {
                if (oAction == sap.m.MessageBox.Action.OK) {
                    var dt = Util.execSQL("delete from cl6_appoint where keyfld=" + Util.quoted(that.qryStr));
                    if (dt.ret = "SUCCESS") {
                        sap.m.MessageToast.show("Deleted successfully !.. Enter new category...!");
                        that.qryStr = "";
                        that.oController.backFunction(UtilGen.getControlValue(that.fa.start_time));
                    }
                }
            },                                       // default
            styleClass: "",                                      // default
            initialFocus: null,                                  // default
            textDirection: sap.ui.core.TextDirection.Inherit     // default
        });
    }
});



