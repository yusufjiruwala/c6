sap.ui.jsfragment("bin.forms.lg.Req", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.lastSel = undefined;
        this.view = oController.getView();
        this.qryStr = this.oController.qryStr;
        this.ordRef = this.oController.ordRef;
        this.ordRefNm = this.oController.ordRefNm;

        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});


        this.pgPO = new sap.m.Page({showHeader: false});
        this.pgSO = new sap.m.Page({showHeader: false});
        this.pgDN = new sap.m.Page({showHeader: false});
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
        this.joApp.addDetailPage(this.pgDN);
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
                that.lastSel = UtilGen.getControlValue(that.types);
            }
        }, "string", undefined, undefined, "@103/Purchases,111/Sales,151/Debit Notes,152/Credit Notes,141/Sales Proforma");

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
                        that.lastSel = "103";
                        that.openPO(103);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "SO", press: function () {
                        var slices = that.qv.getControl().getSelectedIndices();
                        var sel = UtilGen.getControlValue(that.types)
                        if (slices.length > 0 && sel == 141) {
                            that.openSOSP();
                            return;
                        }

                        that.qv.getControl().setSelectedIndex(-1);
                        that.lastSel = "111";
                        that.openPO(111);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "Dr.Note", press: function () {
                        that.lastSel = "111";
                        that.openDN(151);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "Cr.Note", press: function () {
                        that.lastSel = "111";
                        that.openDN(152);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "Proforma", press: function () {
                        that.lastSel = "141";
                        that.openPO(141);
                    }
                })
            ]
        });
        var tb1 = new sap.m.Toolbar({
            content: [
                that.types,
                // next type by pressing quick button.
                new sap.m.Button({
                    icon: "sap-icon://media-play",
                    text: "",
                    press: function () {
                        var idx = that.types.getItems().indexOf(that.types.getSelectedItem());
                        that.types.setSelectedItem(that.types.getItems()[(idx + 1) > that.types.getItems().length - 1 ? 0 : ++idx]);
                        that.loadData();
                        that.lastSel = UtilGen.getControlValue(that.types);

                    }
                }),
                // open form according to what selected...
                new sap.m.Button({
                    icon: "sap-icon://open-folder", text: "", press: function () {
                        var slices = that.qv.getControl().getSelectedIndices();
                        if (slices.length <= 0) {
                            sap.m.MessageToast.show("Must select the record !");
                            return;
                        }
                        var sel = UtilGen.getControlValue(that.types)
                        if (sel == 151 || sel == 152)
                            that.openDN(sel);
                        else
                            that.openPO();
                    }
                }),
                //Print//
                new sap.m.Button({
                    icon: "sap-icon://print", text: "", press: function () {
                        that.openPO();
                    }
                }),
                new sap.m.Title({text: "JO # " + that.qryStr}),
                // Post as selected.
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
        //this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Interactive);
        this.qv.getControl().setAlternateRowColors(false);


//        var sc = new sap.m.ScrollContainer({height: "100%"});

        //      sc.addContent(this.qv.getControl());

        this.mainPage.addContent(that.qv.getControl());
        if (that.lastSel != undefined)
            UtilGen.setControlValue(this.types, that.lastSel, that.lastSel, true);
        else
            UtilGen.setControlValue(this.types, "103", "103", true);

    },

    openDN: function (dn) {
        var that = this;
        var frm = that.pgDN;
        var frmName = (dn == 151 ? "bin.forms.lg.DN" : "bin.forms.lg.CN");
        var ocAdd = {};
        if (!that.validateDNSelection(ocAdd))
            return;
        that.openForm(frmName, frm, ocAdd)

    },
    openSOSP: function () {
        var that = this;
        var frm = that.pgSO;
        var frmName = "bin.forms.lg.SO";
        var ocAdd = {};
        if (!that.validateSOSPSelection(ocAdd)) {
            that.openPO(111);
            return;
        }

        that.openForm(frmName, frm, ocAdd)

    },
    openPO: function (ocx) {
        // default form
        var frmName = "bin.forms.lg.PO";
        var frm = this.pgPO;
        var oc = ocx;
        var ocAdd = undefined;
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
                break;
            case 141:
                frm = this.pgSO;
                frmName = "bin.forms.lg.SP";
                break;
            default:
                break;
        }
        this.openForm(frmName, frm, ocAdd)
    }
    ,
    loadData() {
        var that = this;
        var typ = UtilGen.getControlValue(this.types);
        var sq = "select ord_no,ord_ref,ord_refnm,ord_amt," +
            "decode(ord_flag,'2','sap-icon://accept','sap-icon://less') ord_flag ,posted_date," +
            " (select max(invoice_no) from pur1  where keyfld=order1.pur_keyfld) invoice_no ,ord_code,ord_flag flgx," +
            "(select max(no) from acvoucher1 where keyfld=order1.saleinv) PROFORMA " +
            "    from order1 where ord_reference=" + Util.quoted(this.qryStr) + " and ord_code=" + Util.quoted(typ);

        var dt = Util.execSQL(sq);
        if (dt.ret = "SUCCESS") {
            that.qv.setJsonStrMetaData("{" + dt.data + "}");
            UtilGen.applyCols("C6LGREQ.MAIN", that.qv);
            if (typ != 141)
                that.qv.mLctb.getColByName("PROFORMA").mHideCol = true;
            that.qv.mLctb.parse("{" + dt.data + "}", true);
            //that.qv.setJsonStr("{" + dt.data + "}");
            that.qv.loadData();
            if (that.qv.mLctb.rows.length > 0) {
                //that.qv.getControl().setSelectedIndex(0);
                that.qv.getControl().setFirstVisibleRow(0);
            }
        }
    }
    ,
    openForm: function (frag, frm, ocAdd) {
        var that = this;
        var indic = that.qv.getControl().getSelectedIndices();
        var arPo = [];
        for (var i = 0; i < indic.length; i++)
            arPo.push(Util.nvl(Util.getCellColValue(that.qv.getControl(), indic[i], "ORD_NO"), ""));

        var oC;
        if (ocAdd == undefined)
            oC = {
                qryStr: this.qryStr,
                qryStrPO: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO"), ""),
                selectedReq: arPo,
                ordRef: that.ordRef,
                ordRefNm: that.ordRefNm,
                getView:
                    function () {
                        return that.view;
                    }
            };
        else
            oC = ocAdd;

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
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=103 and ord_no=" + on + ";" +
                            " x_pur_and_srv(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=103 and ord_no=" + on + ";";
                        break;
                    case 111:
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=111 and ord_no=" + on + ";" +
                            "x_sal_and_iss(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=111 and ord_no=" + on + ";";
                        break;
                    case 151:
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=151 and ord_no=" + on + ";" +
                            "x_dn_and_iss(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=151 and ord_no=" + on + ";";
                        break;
                    case 152:
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=152 and ord_no=" + on + ";" +
                            "x_cn_and_srv(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=152 and ord_no=" + on + ";";
                        break;
                    case 141:
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=141 and ord_no=" + on + ";" +
                            "x_lg_sp(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=141 and ord_no=" + on + ";";
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
    },
    validateDNSelection: function (ocAdd) {
        var that = this;
        var oC = {};
        var slices = this.qv.getControl().getSelectedIndices();
        if (slices.length <= 0) {
            sap.m.MessageToast.show("Must select POSTED SALES to create new...");
            return false;
        }

        var oc = this.qv.mLctb.getFieldValue(slices[0], "ORD_CODE"); // ord code to check type
        if (oc != 111 && oc != 151 && oc != 152) {
            sap.m.MessageToast.show("Must select POSTED SALES to create new...");
            return false;
        }


        if (oc == 111 && slices.length > 1) {
            sap.m.MessageToast.show("Must select only SINGLE POSTED SALES to create new...");
            return false;
        }

        var flg = this.qv.mLctb.getFieldValue(slices[0], "FLGX"); // ord code to check type
        if (oc == 111 && flg != 2) {
            sap.m.MessageToast.show("Must be POSTED !");
            return false;
        }

        if (oc == 151 || oc == 152) {
            var arPo = [];
            for (var i = 0; i < slices.length; i++)
                arPo.push(Util.nvl(Util.getCellColValue(that.qv.getControl(), slices[i], "ORD_NO"), ""));
            oC = {
                qryStr: this.qryStr,
                qryStrPO: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO"), ""),
                ordRef: that.ordRef,
                ordRefNm: that.ordRefNm,
                qryStrSO: "",
                selectedReq: arPo,
                getView:
                    function () {
                        return that.view;
                    }
            };
        } else {
            oC = {
                qryStr: this.qryStr,
                qryStrPO: "",
                ordRef: that.ordRef,
                ordRefNm: that.ordRefNm,
                qryStrSO: (Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO")),
                selectedReq: [],
                getView:
                    function () {
                        return that.view;
                    }
            };
        }
        for (var i in oC)
            ocAdd[i] = oC[i];
        return true;
    },
    // validate to open proforma generate invoice
    validateSOSPSelection: function (ocAdd) {
        var that = this;
        var oC = {};
        var slices = this.qv.getControl().getSelectedIndices();
        if (slices.length <= 0) {
            sap.m.MessageToast.show("Must select POSTED PROFORMA to create new...");
            return false;
        }

        var oc = this.qv.mLctb.getFieldValue(slices[0], "ORD_CODE"); // ord code to check type
        if (oc != 141) {
            sap.m.MessageToast.show("Must select POSTED PROFORMA to create new...");
            return false;
        }


        if (oc == 141 && slices.length > 1) {
            sap.m.MessageToast.show("Must select only SINGLE POSTED PROFORMA to create new...");
            return false;
        }

        var flg = this.qv.mLctb.getFieldValue(slices[0], "FLGX"); // ord code to check type

        if (oc == 141 && flg != 2) {
            sap.m.MessageToast.show("Must be POSTED !");
            return false;
        }
        oC = {
            qryStr: this.qryStr,
            qryStrPO: "",
            qryStrSP: (Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO")),
            ordRef: that.ordRef,
            ordRefNm: that.ordRefNm,
            qryStrSO: "",
            selectedReq: [],
            getView:
                function () {
                    return that.view;
                }
        };

        for (var i in oC)
            ocAdd[i] = oC[i];
        return true;
    }
})
;



