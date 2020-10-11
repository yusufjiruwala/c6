sap.ui.jsfragment("bin.forms.press.Status", {

    createContent: function (oController) {
        var that = this;
        jQuery.sap.require("sap.m.MessageBox");

        this.view = oController.getView();
        this.qryStr = oController.qryStr;

        this.pgPO = new sap.m.Page({
            showHeader: false
        });
        this.vars = {
            tot_dlv: 0,
            tot_ord: 0
        }
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

        this.jo._total_del_p = UtilGen.addControl(fe, "@Total Delivery", sap.m.Input, "joptot_dlv",
            {
                editable: false,
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"}),
            }, "string", undefined, view);
        this.jo._total_del_p.addStyleClass("redText");
        fe.push("#Status");

        // material steps.
        this.jo.mat_flag = UtilGen.addControl(fe, "Materials", sap.m.CheckBox, "jomat_flag",
            {
                enabled: false,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L1 M1 S1"})
            }, "string", undefined, view);

        this.jo.mat_open_date = UtilGen.addControl(fe, "@Open", sap.m.DatePicker, "jomat_opn",
            {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"}),
                change: function () {
                    that.show_status();
                }

            }, "date", undefined, view);
        this.jo.mat_close_date = UtilGen.addControl(fe, "@Close", sap.m.DatePicker, "jomat_clos",
            {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"}),
                change: function () {
                    that.show_status();
                }

            }, "date", undefined, view);

        //Design flag.
        this.jo.des_flag = UtilGen.addControl(fe, "Design", sap.m.CheckBox, "jodes_flag",
            {
                enabled: false,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L1 M1 S1"})
            }, "string", undefined, view);
        this.jo.des_open_date = UtilGen.addControl(fe, "@Open", sap.m.DatePicker, "jodes_opn",
            {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"}),
                change: function () {
                    that.show_status();
                }
            }, "date", undefined, view);
        this.jo.des_close_date = UtilGen.addControl(fe, "@Close", sap.m.DatePicker, "jodes_clos",
            {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"}),
                change: function () {
                    that.show_status();
                }
            }, "date", undefined, view);
        //Plate
        this.jo.plate_flag = UtilGen.addControl(fe, "Plate", sap.m.CheckBox, "joplate_flag",
            {
                enabled: false,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L1 M1 S1"})
            }, "string", undefined, view);
        this.jo.plate_open_date = UtilGen.addControl(fe, "@Open", sap.m.DatePicker, "joplate_opn",
            {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"}),
                change: function () {
                    that.show_status();
                }
            }, "date", undefined, view);
        this.jo.plate_close_date = UtilGen.addControl(fe, "@Close", sap.m.DatePicker, "joplate_clos",
            {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"}),
                change: function () {
                    that.show_status();
                }
            }, "date", undefined, view);

        this.jo._cmdStatus = UtilGen.addControl(fe, "", sap.m.Button, "",
            {
                text: "Update Status",
                press: function () {
                    that.show_status();
                    var df = that.jo.des_flag.getSelected() ? 2 : 1;
                    var mf = that.jo.mat_flag.getSelected() ? 2 : 1;
                    var pf = that.jo.plate_flag.getSelected() ? 2 : 1;
                    if (df == 2 && mf == 2 && pf == 2) {
                        sap.m.MessageBox.confirm("Are you sure Activate this JO  ?  ", {
                            title: "Confirm",                                    // default
                            onClose: function (oAction) {
                                if (oAction == sap.m.MessageBox.Action.OK) {
                                    that.update_status();
                                }
                            },
                            styleClass: "",                                      // default
                            initialFocus: null,                                  // default
                            textDirection: sap.ui.core.TextDirection.Inherit     // default
                        });

                    } else
                        that.update_status();
                },
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"})
            }, "string", undefined, view);
        fe.push("#");
        this.jo.active_date = UtilGen.addControl(fe, "Job Active Date ", sap.m.DatePicker, "joplate_actv",
            {
                editable: false,
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"}),
            }, "date", undefined, view);

        this.jo.last_status_text = UtilGen.addControl(fe, "@Last Status Closed", sap.m.Input, "joplate_stat_text",
            {
                editable: false,
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S2"}),
            }, "string", undefined, view);


        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
    },
    loadData: function () {
        var view = this.view;
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.vars.tot_dlv = 0;
        this.vars.tot_ord = 0;
        view.byId("poMsgInv").setText("");
        if (this.qryStr != "") {
            var dt = Util.execSQL("select *from order1 where ord_code=601 and ord_no=" + Util.quoted(this.qryStr));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.loadDataFromJson(this.jo, dtx[0], true);
                this.jo.ord_no.setEnabled(false);
                UtilGen.setControlValue(this.jo.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                view.byId("poMsgInv").setText("JO # " + this.qryStr);
                that.vars.tot_ord = dtx[0].ORDERDQTY;
                that.vars.tot_dlv = dtx[0].DELIVEREDQTY;
                var dlvp = (that.vars.tot_dlv > 0 ? ((that.vars.tot_dlv / that.vars.tot_ord) * 100) : 0);
                UtilGen.setControlValue(that.jo._total_del_p, df.format(dlvp) + " %");
                if (that.vars.tot_dlv > 0)
                    that.jo._cmdStatus.setEnabled(false);
            }
        }
    },
    update_status_remove_this_func: function () {
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

    },
    show_status: function () {

        this.jo.des_flag.setSelected(true);
        this.jo.mat_flag.setSelected(true);
        this.jo.plate_flag.setSelected(true);

        var cd = UtilGen.getControlValue(this.jo.mat_close_date);
        var od = UtilGen.getControlValue(this.jo.mat_open_date);
        if (cd == null || cd == undefined ||
            od == null || od == undefined)
            this.jo.mat_flag.setSelected(false);

        var dcd = UtilGen.getControlValue(this.jo.des_close_date);
        var dod = UtilGen.getControlValue(this.jo.des_open_date);
        if (dcd == null || dcd == undefined ||
            dod == null || dod == undefined)
            this.jo.des_flag.setSelected(false);

        var pcd = UtilGen.getControlValue(this.jo.plate_close_date);
        var pod = UtilGen.getControlValue(this.jo.plate_open_date);
        if (pcd == null || pcd == undefined ||
            pod == null || pod == undefined)
            this.jo.plate_flag.setSelected(false);
    },
    update_status: function () {
        var that = this;
        var view = this.view;

        var cd = UtilGen.getControlValue(this.jo.mat_close_date);
        var od = UtilGen.getControlValue(this.jo.mat_open_date);
        var dcd = UtilGen.getControlValue(this.jo.des_close_date);
        var dod = UtilGen.getControlValue(this.jo.des_open_date);
        var pcd = UtilGen.getControlValue(this.jo.plate_close_date);
        var pod = UtilGen.getControlValue(this.jo.plate_open_date);
        var df = this.jo.des_flag.getSelected() ? 2 : 1;
        var mf = this.jo.mat_flag.getSelected() ? 2 : 1;
        var pf = this.jo.plate_flag.getSelected() ? 2 : 1;


        var sq = " Update order1 set " +
            " MAT_FLAG=:MAT_FLG, MAT_OPEN_DATE=:MAT_OPN , MAT_CLOSE_DATE=:MAT_CLS , " +
            " DES_FLAG=:DES_FLG, DES_OPEN_DATE=:DES_OPN , DES_CLOSE_DATE=:DES_CLS ," +
            " PLATE_FLAG=:PLATE_FLG, PLATE_OPEN_DATE=:PLATE_OPN , PLATE_CLOSE_DATE=:PLATE_CLS ," +
            " is_active=:ACTIVE , ACTIVE_DATE = :ACT_DATE , LAST_STATUS_DATE = :LAST_STATUS_DATE, LAST_STATUS_TEXT = :LAST_STATUS_TEXT " +
            " WHERE ord_no=:ON and ord_code=601";
        sq = sq.replace(/:ON/g, that.qryStr);

        sq = sq.replace(/:MAT_FLG/g, mf);
        sq = sq.replace(/:MAT_OPN/g, Util.toOraDateString(od));
        sq = sq.replace(/:MAT_CLS/g, Util.toOraDateString(cd));

        sq = sq.replace(/:DES_FLG/g, df);
        sq = sq.replace(/:DES_OPN/g, (dod == undefined || dod == null) ? "null" : Util.toOraDateString(dod));
        sq = sq.replace(/:DES_CLS/g, (dcd == undefined || dcd == null) ? "null" : Util.toOraDateString(dcd));

        sq = sq.replace(/:PLATE_FLG/g, pf);
        sq = sq.replace(/:PLATE_OPN/g, (pod == undefined || pod == null) ? "null" : Util.toOraDateString(pod));
        sq = sq.replace(/:PLATE_CLS/g, (pcd == undefined || pcd == null) ? "null" : Util.toOraDateString(pcd));


        if (df == 2 && pf == 2 && mf == 2) {
            sq = sq.replace(/:ACTIVE/g, Util.quoted("Y"));

        }
        else
            sq = sq.replace(/:ACTIVE/g, Util.quoted("N"));
        sq = that.setLastStatus(sq);

        var dt = Util.execSQL(sq);

        if (dt.ret != "SUCCESS") {
            sap.m.MessageToast.show("Not saved .." + dt.ret);
            return;
        }

        sap.m.MessageToast.show("Updated Succesfully !");
        that.loadData();

    },
    setLastStatus: function (sq) {
        var dts = [];
        var dcd = UtilGen.getControlValue(this.jo.des_close_date);
        var mcd = UtilGen.getControlValue(this.jo.mat_close_date);
        var pcd = UtilGen.getControlValue(this.jo.plate_close_date);

        dts.push({title: "DESIGN", close: dcd});
        dts.push({title: "MATERIAL", close: mcd});
        dts.push({title: "PLATE", close: pcd});

        var dts2 = dts.sort(function (a, b) {
            var dateA = new Date(a.close), dateB = new Date(b.close);
            return dateA - dateB;
        });
        var lc = dts2[2].close;
        var sql = sq.replace(/:LAST_STATUS_DATE/g, (lc == undefined || lc == null) ? "null" : Util.toOraDateString(lc));
        sql = sql.replace(/:LAST_STATUS_TEXT/g, (lc == undefined || lc == null) ? "null" : Util.quoted(dts2[2].title));
        if ((dcd != undefined || dcd != null) &&
            (mcd != undefined || mcd != null) &&
            (pcd != undefined || pcd != null))
            sql = sql.replace(/:ACT_DATE/g, Util.toOraDateString(lc));
        else
            sql = sql.replace(/:ACT_DATE/g, "null");

        return sql;

    }
});



