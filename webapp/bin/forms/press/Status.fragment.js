sap.ui.jsfragment("bin.forms.press.Status", {

    createContent: function (oController) {
        var that = this;
        jQuery.sap.require("sap.m.MessageBox");

        this.view = oController.getView();
        this.qryStr = oController.qryStr;

        this.pgPO = new sap.m.Page({
            showHeader: false
        });

        this.o1 = {};
        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.pgPO.backFunction();
            }
        });

        this.createView();
        this.loadData();
        return this.pgPO;
    },

    createView: function () {
        var that = this;
        var view = this.view;
        UtilGen.clearPage(this.pgPO);
        this.o1 = {};


        this.qryStr = "";
        if (this.oController.qryStr != undefined)
            this.qryStr = this.oController.qryStr;

        UtilGen.clearPage(this.pgPO);
        var sf = this.createViewHeader();

        sf.getToolbar().addContent(this.bk);

        (this.view.byId("poCmdSave") != undefined ? this.view.byId("poCmdSave").destroy() : null);
        sf.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave"), {
            icon: "sap-icon://save", text: "Update Status", press: function () {
                that.update_status();
            }
        }));


        sf.getToolbar().addContent(new sap.m.ToolbarSpacer());
        (this.view.byId("poMsgInv") != undefined ? this.view.byId("poMsgInv").destroy() : null);
        sf.getToolbar().addContent(new sap.m.Text(view.createId("poMsgInv"), {text: ""}).addStyleClass("redText blinking"));
        sf.getToolbar().addContent(new sap.m.Title({text: "Status"}));

        var sc = new sap.m.ScrollContainer();

        sc.addContent(sf);

        this.pgPO.addContent(sc);
    },
    createViewHeader: function () {
        var that = this;
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.jo = {};
        var fe = [];
        //JO No, ORD_NO
        this.jo.ord_no = UtilGen.addControl(fe, "@Ord No", sap.m.Input, "joOrdNo",
            {editable: false}, "number", undefined, view);
        this.jo.ord_date = UtilGen.addControl(fe, "@Date ", sap.m.DatePicker, "joord_date",
            {
                editable: false,
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"]
            },
            "date", undefined, view);
        this.jo.ord_ref = UtilGen.addControl(fe, "Customer", sap.m.SearchField, "joOrdRef",
            {
                enabled: false,
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(that.jo.ord_ref, "", "", true);
                        return;
                    }

                    var sq = "select code,name title from c_ycust where iscust='Y' and childcount=0 order by code";
                    Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                        UtilGen.setControlValue(that.jo.ord_ref, val, valx, true);
                    });
                }
            },
            "string",
            undefined, view, undefined, undefined);
        this.jo.last_status_date = UtilGen.addControl(fe, "Last Status Date ", sap.m.DatePicker, "jlast_status_date",
            {
                editable: false,
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"]
            },
            "date", undefined, view);

        fe.push("#Status");

        // material steps.
        this.jo.mat_flag = UtilGen.addControl(fe, "Materials", sap.m.CheckBox, "jomat_flag",
            {
                enabled: false,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L1 M1 S1"})
            }, "string", undefined, view);
        this.jo.mat_open_date = UtilGen.addControl(fe, "@Open", sap.m.DatePicker, "jomat_opn",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);
        this.jo.mat_close_date = UtilGen.addControl(fe, "@Close", sap.m.DatePicker, "jomat_clos",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);

        //Design flag.
        this.jo.des_flag = UtilGen.addControl(fe, "Design", sap.m.CheckBox, "jodes_flag",
            {
                enabled: false,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L1 M1 S1"})
            }, "string", undefined, view);
        this.jo.des_open_date = UtilGen.addControl(fe, "@Open", sap.m.DatePicker, "jodes_opn",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);
        this.jo.des_close_date = UtilGen.addControl(fe, "@Close", sap.m.DatePicker, "jodes_clos",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);
        //Plate
        this.jo.plate_flag = UtilGen.addControl(fe, "Plate", sap.m.CheckBox, "joplate_flag",
            {
                enabled: false,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L1 M1 S1"})
            }, "string", undefined, view);
        this.jo.plate_open_date = UtilGen.addControl(fe, "@Open", sap.m.DatePicker, "joplate_opn",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);
        this.jo.plate_close_date = UtilGen.addControl(fe, "@Close", sap.m.DatePicker, "joplate_clos",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);

        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
    },
    loadData: function () {
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();
        view.byId("poMsgInv").setText("");
        if (this.qryStr != "") {
            var dt = Util.execSQL("select *from order1 where ord_code=601 and ord_no=" + Util.quoted(this.qryStr));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.loadDataFromJson(this.jo, dtx[0], true);
                this.jo.ord_no.setEnabled(false);
                UtilGen.setControlValue(this.jo.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                view.byId("poMsgInv").setText("JO # " + this.qryStr);

            }
        }
    },
    update_status: function () {
        var that = this;
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var fe = [];
        var stat =
            UtilGen.addControl(fe, "Status", sap.m.ComboBox, "stStatus",
                {
                    editable: true,
                    items: {
                        path: "/",
                        template: new sap.ui.core.ListItem({text: "{CODE}", key: "{NAME}"}),
                        templateShareable: true
                    },
                    selectionChange: function (event) {

                    }
                    // layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
                }, "string", undefined, view, undefined, "@Materials/MAT,Design/DES,Plate/PLATE");

        var open_date = UtilGen.addControl(fe, "Open", sap.m.DatePicker, "st_opn",
            {
                enabled: false, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                // layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);
        var close_date = UtilGen.addControl(fe, "Close", sap.m.DatePicker, "st_clos",
            {
                enabled: true, valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                // layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "date", undefined, view);

        var sf = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
        sf.setToolbar(undefined);
        var vb = new sap.m.VBox({items: [sf]}).addStyleClass("sapUiMediumMargin");
        var dlg = new sap.m.Dialog({
            contentWidth: "400px",
            content: [sf],
            buttons: [new sap.m.Button({
                text: "Update",
                press: function () {
                    var opn = new Date(Util.getSQLValue("select last_status_date from order1 where ord_code=601 and ord_no=" + that.qryStr));
                    UtilGen.setControlValue(open_date, opn);
                    var cls = UtilGen.getControlValue(close_date);
                    if (cls == undefined || cls == null) {
                        sap.m.MessageToast.show("Close date is not entered !");
                        return;
                    }
                    if (Util.getDaysBetween(cls, opn) < 0) {
                        sap.m.MessageToast.show("Close date must be greater than opening  !");
                        return;
                    }
                    var st = UtilGen.getControlValue(stat);
                    if (st == undefined || st == null) {
                        sap.m.MessageToast.show("Status is not selected !");
                        return;
                    }
                    var sq = "Update order1 set :STAT_FLAG=2, :STAT_OPEN_DATE=:OPN , :STAT_CLOSE_DATE=:CLS " +
                        " WHERE ord_no=:ON and ord_code=601";
                    sq = sq.replace(/:STAT/g, st);
                    sq = sq.replace(/:ON/g, that.qryStr);
                    sq = sq.replace(/:OPN/g, Util.toOraDateString(opn));
                    sq = sq.replace(/:CLS/g, Util.toOraDateString(cls));
                    var dt = Util.execSQL(sq);
                    if (dt.ret != "SUCCESS") {
                        sap.m.MessageToast.show("Not saved .." + dt.ret);
                        return;
                    }
                    sap.m.MessageToast.show("Saved Succesfully !");
                    dlg.close();
                    that.loadData();

                }
            })]
        });
        var lst = new Date(Util.getSQLValue("select last_status_date from order1 where ord_code=601 and ord_no=" + this.qryStr));
        UtilGen.setControlValue(open_date, lst);
        dlg.open();

    }
});



