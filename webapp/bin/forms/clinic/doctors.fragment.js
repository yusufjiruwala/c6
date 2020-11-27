sap.ui.jsfragment("bin.forms.clinic.doctors", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
        Util.destroyID("poCmdList", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdList"), {
            icon: "sap-icon://list", press: function () {
                that.show_list();
            }
        }));

        // that.createScrollCmds(this.frm.getToolbar());
        this.qv = new QueryView("tblDoc");
        this.qv.getControl().addStyleClass("sapUiSizeCondensed");
        this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setFixedBottomRowCount(0);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
        this.qv.getControl().setVisibleRowCount(7);
        var sc = new sap.m.ScrollContainer();
        sc.addContent(this.frm);
        sc.addContent(this.qv.getControl());


        this.mainPage.addContent(sc);

    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        this.em = {};
        this.em.no = UtilGen.addControl(fe, "No", sap.m.Input, "faCtgCode",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: "XL6 L6 M6 S6"}),
            }, "string", undefined, this.view);
        this.em.name = UtilGen.addControl(fe, "Name", sap.m.Input, "faCtgName",
            {enabled: true}, "string", undefined, this.view);
        return UtilGen.formCreate("", true, fe);
        // return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var view = this.view;
        var that = this;
        this.em.no.setEnabled(true);
        if (this.qryStr == "") {
            var n = parseInt(Util.getSQLValue("select nvl(max(no),0)+1 from salesp"));
            UtilGen.setControlValue(this.em.no, n, n, true);
            UtilGen.setControlValue(this.em.name, "", "");

        } else {
            this.em.no.setEnabled(false);
            var dt = Util.execSQL("select *from salesp where no=" + this.qryStr);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.loadDataFromJson(this.em, dtx[0], true);
                this.em.no.setEnabled(false);
            }
        }
        this.loadData_details();
    }
    ,
    loadData_details: function () {
        var that = this;
        var sq = "select s.* , '' day_name FROM CL6_SHIFTS s" +
            " WHERE s.EMPNO="
            + Util.quoted(this.qryStr) + " order by dayx";
        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                UtilGen.applyCols("C6L.SHIFTS", that.qv, that);
                that.qv.mLctb.parse("{" + data.data + "}", true);
                that.qv.loadData();
                var ld = that.qv.mLctb;

                if (ld.rows.length == 0) {
                    that.createDays();
                    that.qv.loadData();
                }
                else {
                    for (var i = 0; i < 7; i++)
                        ld.setFieldValue(i, "DAY_NAME", that.days[i]);
                    that.qv.loadData();
                }

            }
        });
    },
    validateSave: function () {
        this.qv.updateDataToTable();
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        var ld = this.qv.mLctb;
        for (var i = 0; i < ld.rows.length; i++) {
            var v1 = "", v2 = "";
            if (ld.getFieldValue(i, "IN1") != null && (ld.getFieldValue(i, "IN1").startsWith("1970") ||
                ld.getFieldValue(i, "IN1").startsWith("1969")
            )) {
                v1 = ld.getFieldValue(i, "IN1");
                v1 = new Date("01/01/2000 " + this.formatAMPM(new Date(v1)));
            } else
                v1 = new Date("01/01/2000 " + Util.nvl(ld.getFieldValue(i, "IN1"), "12:00 AM"));

            if (ld.getFieldValue(i, "OUT1") != null && (ld.getFieldValue(i, "OUT1").startsWith("1970") ||
                ld.getFieldValue(i, "OUT1").startsWith("1969")
            )) {
                v2 = ld.getFieldValue(i, "OUT1");
                v2 = new Date("01/01/2000 " + this.formatAMPM(new Date(v2)));
            } else
                v2 = new Date("01/01/2000 " + Util.nvl(ld.getFieldValue(i, "OUT1"), "12:00 AM"));

            // if (v1.getHours() > 0 && v2.getHours() == 0) {
            //     sap.m.MessageToast.show(ld.getFieldValue(i, "DAY_NAME") + " You must enter OUT time ! ");
            //     return false;
            // }

            if (v1.getTime() > v2.getTime()) {
                sap.m.MessageToast.show(ld.getFieldValue(i, "DAY_NAME") + " , Enter OUT time greater than IN!");
                return false;
            }

            ld.setFieldValue(i, "IN1", sdf.format(v1));
            ld.setFieldValue(i, "OUT1", sdf.format(v2));

        }
        return true;
    },
    formatAMPM: function (date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    ,
    save_data: function () {

        var that = this;

        var sett = sap.ui.getCore().getModel("settings").getData();
        if (!this.validateSave())
            return;
        var k = ""; //  sql for order1 table.
        // inserting or updating order1 and order1 and order2  tables.
        // var defaultValues = {};
        var ld = this.qv.mLctb;
        if (this.qryStr == "") {
            k = UtilGen.getSQLInsertString(this.em, {TYPE: "'D'"});
            k = "insert into salesp " + k + ";";
            var s = "";
            for (var i = 0; i < ld.rows.length; i++)
                s += UtilGen.getInsertRowString(ld, "CL6_SHIFTS", i, ["DAY_NAME"], {
                    EMPNO: UtilGen.getControlValue(this.em.no),
                    ISDAYOFF: 'N'
                }, false) + ";"

            k = k + s;
        }
        else {
            k = UtilGen.getSQLUpdateString(this.em, "salesp", {},
                "no=" + Util.quoted(this.qryStr)) + " ;";
            var s = "delete from cl6_shifts where empno=" + this.qryStr + ";";
            for (var i = 0; i < ld.rows.length; i++)
                s += UtilGen.getInsertRowString(ld, "CL6_SHIFTS", i, ["DAY_NAME"], {
                    EMPNO: UtilGen.getControlValue(this.em.no),
                    ISDAYOFF: 'N'
                }, false) + ";"
            k = k + s;

        }
        k = "begin " + k + " end;";


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

            sap.m.MessageToast.show("Saved Successfully !,  Enter New Doctor..!");
            that.oController.backFunction();
        });


    }
    ,
    createDays: function () {
        var that = this;
        var ld = this.qv.mLctb;
        ld.rows = [];
        ld.masterRows = [];
        for (var i = 0; i < 7; i++) {
            var x = ld.addRow();
            ld.setFieldValue(x, "DAY_NAME", that.days[i]);
            ld.setFieldValue(x, "DAYX", i);
            ld.setFieldValue(x, "IN1", (new Date("01/01/2000").toString()));
            ld.setFieldValue(x, "OUT1", (new Date("01/01/2000").toString()));
            if (i == 5)
                ld.setFieldValue(x, "ISDAYOFF", "Y");
        }

    }
    ,
    show_list: function () {
        var that = this;
        var sq = "select no,name from salesp where type='D' order by 1";
        Util.showSearchList(sq, "NAME", "NO", function (valx, val) {
            that.qryStr = valx;
            that.loadData();
        });

    }

})
;



