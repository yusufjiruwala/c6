sap.ui.jsfragment("bin.forms.lg.Req", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;

        this.view = oController.getView();
        this.qryStr = this.oController.qryStr;
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});


        this.pgPO = new sap.m.Page({showHeader: false});
        this.pgSO = new sap.m.Page({showHeader: false});
        this.pgPI = new sap.m.Page({showHeader: false});

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
        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.mainPage);
        this.joApp.addDetailPage(this.pgPO);
        this.joApp.addDetailPage(this.pgSO);
        this.joApp.addDetailPage(this.pgPI);
        this.joApp.to(this.mainPage, "show");
        return this.joApp;

    },

    createView: function () {
        UtilGen.clearPage(this.mainPage);
        var that = this;
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();

        (this.view.byId("reqCmdPost") != undefined ? this.view.byId("reqCmdPost").destroy() : null);


        this.types = UtilGen.createControl(sap.m.ComboBox, this.view, "req_types", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectionChange: function (event) {
                that.loadData();
            }
        }, "string", undefined, undefined, "@103/Purchases,111/Sales,151/Performa Invoices");
        var tb = new sap.m.Toolbar({
            content: [
                new sap.m.Button({
                    icon: "sap-icon://nav-back", text: "", press: function () {
                        that.joApp.backFunction();
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "PO", press: function () {
                        that.qv.getControl().setSelectedIndex(-1);
                        that.openPO(103);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "SO", press: function () {
                        that.qv.getControl().setSelectedIndex(-1);
                        that.openPO(111);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "Performa", press: function () {
                        that.openPO();
                    }
                })
            ]
        });
        var tb1 = new sap.m.Toolbar({
            content: [
                that.types,
                new sap.m.Button({
                    icon: "sap-icon://open-folder", text: "", press: function () {
                        that.openPO();
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://print", text: "", press: function () {
                        that.openPO();
                    }
                }),
                new sap.m.Title({text: "JO # " + that.qryStr}),
                new sap.m.Button(view.createId("reqCmdPost"), {
                    icon: "sap-icon://accept",
                    text: "Post",
                    press: function () {
                        var ty = UtilGen.getControlValue(that.types);
                        that.post_po();
                    }
                })
            ]
        });

        that.mainPage.addContent(tb);
        that.mainPage.addContent(tb1);
        this.qv = new QueryView();

        // this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Interactive);
        this.qv.getControl().setAlternateRowColors(true);


        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.qv.getControl());

        this.mainPage.addContent(sc);
        UtilGen.setControlValue(this.types, "103", "103", true);

    },
    openPO: function (ocx) {
        // default form
        var frmName = "bin.forms.lg.PO";
        var frm = this.pgPO;
        var oc = ocx;
        var slices = this.qv.getControl().getSelectedIndices();
        if (slices.length > 0)
            oc = this.qv.mLctb.getFieldValue(slices[0], "ORD_CODE"); // ord code to check type

        switch (oc) {
            case 103:
                frm = this.pgPO;
                frmName = "bin.forms.lg.PO";
                break;
            case 111:
                frm = this.pgSO;
                frmName = "bin.forms.lg.SO";
            default:
                break;
        }
        this.openForm(frmName, frm)
    }
    ,
    loadData() {
        var that = this;
        var typ = UtilGen.getControlValue(this.types);
        var sq = "select ord_no,ord_ref,ord_refnm,ord_amt,decode(ord_flag,'2','sap-icon://accept','sap-icon://less') ord_flag ,posted_date," +
            " (select max(invoice_no) from pur1  where keyfld=order1.pur_keyfld) invoice_no ,ord_code,ord_flag flgx " +
            "    from order1 where ord_reference=" + Util.quoted(this.qryStr) + " and ord_code=" + Util.quoted(typ);

        var dt = Util.execSQL(sq);
        if (dt.ret = "SUCCESS") {
            that.qv.setJsonStrMetaData("{" + dt.data + "}");
            UtilGen.applyCols("C6LGREQ.MAIN", that.qv);
            that.qv.mLctb.parse("{" + dt.data + "}", true);
            //that.qv.setJsonStr("{" + dt.data + "}");
            that.qv.loadData();
            if (that.qv.mLctb.rows.length > 0) {
                that.qv.getControl().setSelectedIndex(0);
                that.qv.getControl().setFirstVisibleRow(0);
            }
        }
    }
    ,
    openForm: function (frag, frm) {
        var that = this;
        var indic = that.qv.getControl().getSelectedIndices();
        var arPo = [];
        var first = that.qv.getControl().getFirstVisibleRow();
        for (var i = 0; i < indic.length; i++) {
            arPo.push(Util.nvl(Util.getCellColValue(that.qv.getControl(), indic[i], "ORD_NO"), ""));
        }
        var oC = {
            qryStr: this.qryStr,
            qryStrPO: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO"), ""),
            selectedReq: arPo,
            getView:
                function () {
                    return that.view;
                }
        };
        var sp = sap.ui.jsfragment(frag, oC);
        sp.backFunction = function () {
            that.joApp.to(that.mainPage, "show");
            that.createView();
            that.loadData();
        };
        sp.app = this.joApp;
        UtilGen.clearPage(frm);
        frm.addContent(sp);
        this.joApp.to(frm, "slide");
    },
    post_po: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var slices = this.qv.getControl().getSelectedIndices();
        var ld = that.qv.mLctb;
        var plsql = "";
        for (var i = 0; i < slices.length; i++) {
            var ro = slices[i];
            var flg = ld.getFieldValue(ro, "FLGX"); // to check either posted or not.
            var on = ld.getFieldValue(ro, "ORD_NO"); // order no
            var oc = ld.getFieldValue(ro, "ORD_CODE"); // ord code to check type
            var usr = sett["LOGON_USER"];
            var sql = "";
            if (flg == 1)
                switch (oc) {
                    case 103:
                        sql = "x_pur_and_srv(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=103 and ord_no=" + on + ";";
                        break;
                    case 111:
                        sql = "x_sal_and_iss(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=103 and ord_no=" + on + ";";
                        break;
                    default:
                        break;
                }
            plsql += sql;
        }
        plsql = "begin " + plsql + " end; ";
        var dat = Util.execSQL(plsql);
        if (dat.ret == "SUCCESS") {
            sap.m.MessageToast.show("Posted successfully ");
            that.loadData();
        } else
            sap.m.MessageToast.show(dat.ret);
    }
})
;



