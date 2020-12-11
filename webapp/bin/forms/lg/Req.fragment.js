sap.ui.jsfragment("bin.forms.lg.Req", {

    createContent: function (oController) {
        jQuery.sap.require("sap.m.MessageBox");
        var that = this;
        this.oController = oController;
        this.lastSel = undefined;
        this.view = oController.getView();
        this.qryStr = this.oController.qryStr;
        this.ordRef = this.oController.ordRef;
        this.ordRefNm = this.oController.ordRefNm;
        this.ordType = this.oController.ordType;
        this.ordNo = this.oController.ordNo;

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
        this.showOnstartup();
        return this.joApp;

    },

    createView: function () {
        UtilGen.clearPage(this.mainPage);
        var that = this;
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();

        this.cmdPrDr = new sap.m.Button({
            icon: "sap-icon://print", text: "DR Note", press: function () {
                that.printDRNote();
            }
        });
        this.cmdPrTx = new sap.m.Button({
            icon: "sap-icon://print", text: "Tx Inv", press: function () {
                that.printTaxInv();
            }
        });

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
        }, "string", undefined, undefined, "@103/Purchases - 103,131/P.Return,111/Sales - 111,151/Debit Notes - 151,152/Credit Notes - 152,141/Sales Proforma - 141");
        (this.view.byId("tbCreate") != undefined ? this.view.byId("tbCreate").destroy() : null);
        (this.view.byId("cmdReqBack") != undefined ? this.view.byId("cmdReqBack").destroy() : null);
        var tb = new sap.m.Toolbar(view.createId("tbCreate"), {
            content: [
                new sap.m.Button(view.createId("cmdReqBack"), {
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
                        //that.qv.getControl().setSelectedIndex(-1);
                        that.lastSel = "111";
                        that.openDN(151);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "Cr.Note", press: function () {
                        //that.qv.getControl().setSelectedIndex(-1);
                        that.lastSel = "111";
                        that.openDN(152);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "P. Return", press: function () {
                        //that.qv.getControl().setSelectedIndex(-1);
                        that.lastSel = "131";
                        that.openPR(131);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "Proforma", press: function () {
                        that.qv.getControl().setSelectedIndex(-1);
                        that.lastSel = "141";
                        that.openPO(141);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "Update Info", press: function () {
                        that.lastSel = "103";
                        that.updateInfo();
                    }
                }),
            ]
        });
        (this.view.byId("tbCreate2") != undefined ? this.view.byId("tbCreate2").destroy() : null);
        var tb1 = new sap.m.Toolbar(view.createId("tbCreate2"), {
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
                        that.printSel();
                    }
                }),
                new sap.m.Title({text: "JO # " + that.qryStr}),
                // Post as selected.
                new sap.m.Button(view.createId("reqCmdPost"), {
                    icon: "sap-icon://accept",
                    text: "Post",
                    press: function () {
                        sap.m.MessageBox.confirm("Are you sure, to POST on today date ?  ", {
                            title: "Confirm",                                    // default
                            onClose: function (oAction) {
                                if (oAction == sap.m.MessageBox.Action.OK) {
                                    that.post_po();
                                }
                            },                                       // default
                            styleClass: "",                                      // default
                            initialFocus: null,                                  // default
                            textDirection: sap.ui.core.TextDirection.Inherit     // default
                        });
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
    openPR: function (dn) {
        var that = this;
        var frm = that.pgDN;
        var frmName = "bin.forms.lg.PR";
        var ocAdd = {};
        if (!that.validatePRSelection(ocAdd))
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
            case 131:
                frm = this.pgSO;
                frmName = "bin.forms.lg.PR";
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
        var sq = "select ord_no,ord_ref,ord_refnm," +
            " (select sum(ord_price*ord_allqty) from order2 where ord_code=" + Util.quoted(typ) + " and order2.ord_no=order1.ord_no ) ord_amt," +
            "decode(ord_flag,'2','sap-icon://accept','sap-icon://less') ord_flag ,posted_date," +
            " (select max(invoice_no) from pur1  where keyfld=order1.pur_keyfld) invoice_no ,ord_code,ord_flag flgx," +
            "(select max(no) from acvoucher1 where keyfld=order1.saleinv) PROFORMA , " +
            " ORD_DATE,APPROVED_BY " +
            "    from order1 where ord_reference=" + Util.quoted(this.qryStr) + " and ord_code=" + Util.quoted(typ);

        var dt = Util.execSQL(sq);
        if (dt.ret = "SUCCESS") {
            that.qv.setJsonStrMetaData("{" + dt.data + "}");
            UtilGen.applyCols("C6LGREQ.MAIN", that.qv);
            if (typ != 141)
                that.qv.mLctb.getColByName("PROFORMA").mHideCol = true;
            that.qv.mLctb.parse("{" + dt.data + "}", true);
            //that.qv.setJsonStr("{" + dt.data + "}");
            that.qv.mLctb.getColByName("ORD_AMT").mSummary = "SUM";
            that.qv.loadData();
            if (that.qv.mLctb.rows.length > 0) {
                //that.qv.getControl().setSelectedIndex(0);
                that.qv.getControl().setFirstVisibleRow(0);
            }
        }
        this.enableDisableCmds();
    },
    enableDisableCmds: function () {
        var sett = sap.ui.getCore().getModel("settings").getData();
        var typ = UtilGen.getControlValue(this.types);
        var view = this.view;
        var flg = Util.getSQLValue("select ord_flag from order1 where ord_code=106 and ord_no=" + this.qryStr);
        var tb = view.byId("tbCreate");
        var tb2 = view.byId("tbCreate2");
        if (flg == 1 || flg == "1")
            for (var i in tb.getContent()) {
                tb.getContent()[i].setEnabled(false);
            }
        view.byId("cmdReqBack").setEnabled(true);

        view.byId("reqCmdPost").setEnabled(true);

        if (sett["LG_POST_" + typ] == "DISABLED" || Util.nvl(sett["LG_POST_ALL"], "DISABLED") == "DISABLED")
            view.byId("reqCmdPost").setEnabled(false);

        if (typ == 111) {
            tb2.addContent(this.cmdPrDr);
            tb2.addContent(this.cmdPrTx);
        }
        else {
            tb2.removeContent(this.cmdPrDr);
            tb2.removeContent(this.cmdPrTx);
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
                    case 131:
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=131 and ord_no=" + on + ";" +
                            " x_pr_and_iss(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=131 and ord_no=" + on + ";";
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
    },
    validatePRSelection: function (ocAdd) {
        var that = this;
        var oC = {};
        var slices = this.qv.getControl().getSelectedIndices();
        if (slices.length <= 0) {
            sap.m.MessageToast.show("Must select POSTED PURCHASE  create new...");
            return false;
        }
        var oc = this.qv.mLctb.getFieldValue(slices[0], "ORD_CODE"); // ord code to check type
        if (oc != 103) {
            sap.m.MessageToast.show("Must select POSTED PURCHASE to create new...");
            return false;
        }
        if (oc == 103 && slices.length > 1) {
            sap.m.MessageToast.show("Must select only SINGLE POSTED PROFORMA to create new...");
            return false;
        }

        var flg = this.qv.mLctb.getFieldValue(slices[0], "FLGX"); // ord code to check type

        if (oc == 103 && flg != 2) {
            sap.m.MessageToast.show("Must be POSTED !");
            return false;
        }
        oC = {
            qryStr: this.qryStr,
            qryStrSO: (Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO")),
            qryStrPO: "",
            ordRef: that.ordRef,
            ordRefNm: that.ordRefNm,
            selectedReq: [],
            getView:
                function () {
                    return that.view;
                }
        };

        for (var i in oC)
            ocAdd[i] = oC[i];
        return true;

    },
    printSel: function (preFileName) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var slices = this.qv.getControl().getSelectedIndices();
        if (slices.length <= 0) {
            sap.m.MessageToast.show("Must select to PRINT..");
            return false;
        }
        var plsql = "";

        var oc = this.qv.mLctb.getFieldValue(slices[0], "ORD_CODE");
        var fn = Util.nvl(preFileName, "");
        for (var i in slices) {
            var on = this.qv.mLctb.getFieldValue(slices[i], "ORD_NO");
            var sq = "insert into temporary(usernm,idno ,field1) values (:usernm,:idno,:field1);";
            sq = sq.replace(":usernm", Util.quoted(sett["SESSION_ID"]));
            sq = sq.replace(":idno", oc);
            sq = sq.replace(":field1", on);
            plsql += sq;
        }
        plsql = " begin delete from temporary where idno=" + oc + " and usernm=" + Util.quoted(sett["SESSION_ID"]) + ";" + plsql + " end;";
        var dt = Util.execSQL(plsql);
        if (dt.ret = "SUCCESS")
            Util.doXhr("report?reportfile=rptVou" + fn + oc, true, function (e) {
                if (this.status == 200) {
                    var blob = new Blob([this.response], {type: "application/pdf"});
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.target = "_blank";
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.download = "rptVou" + new Date() + ".pdf";
                    link.click();
                    document.body.removeChild(link);
                }
            })
    },
    printDRNote: function () {
        this.printSel("DR")
    },
    printTaxInv: function () {
        this.printSel("T");
    },
    showOnstartup: function () {
        var that = this;
        if (this.ordType == undefined)
            return;
        var frm = this.pgPO;
        var frmName = "";
        switch (this.ordType) {
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
            case 131:
                frm = this.pgSO;
                frmName = "bin.forms.lg.PR";
                break;
            default:
                break;
        }
        var oC;
        var ocAdd;
        if (ocAdd == undefined)
            oC = {
                qryStr: this.qryStr,
                qryStrPO: this.ordNo,
                selectedReq: [this.ordNo],
                ordRef: that.ordRef,
                ordRefNm: that.ordRefNm,
                getView:
                    function () {
                        return that.view;
                    }
            };
        else
            oC = ocAdd;

        var sp = sap.ui.jsfragment(frmName, oC);
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
    updateInfo: function () {
        var that = this;

        var indic = that.qv.getControl().getSelectedIndices();
        if (indic.length <= 0) {
            sap.m.MessageToast.show("No any invoice selected !");
            return;
        }
        var arPo = [];
        for (var i = 0; i < indic.length; i++)
            (Util.nvl(Util.getCellColValue(that.qv.getControl(), indic[i], "ORD_NO"), "") != "" ?
                arPo.push(Util.nvl(Util.getCellColValue(that.qv.getControl(), indic[i], "ORD_NO"), "")) : "");


        var qvDt = new QueryView("infoTbl");
        qvDt.getControl().setFixedBottomRowCount(0);
        qvDt.getControl().addStyleClass("sapUiSizeCompact");
        var oc = this.qv.mLctb.getFieldValue(indic[0], "ORD_CODE"); // ord code to check type;

        var sq = "select ord_no,ord_date,ORD_AMT," +
            "ord_txt_wo WO," +
            "ord_txt_wodate WOdate," +
            "ord_txt_woval WOVAL," +
            "ord_txt_iid IID, " +
            "ord_txt_iiddate iiddate ," +
            "ord_txt_iidval iidval ," +
            "ord_txt_iidinvno iidinvno ," +
            "ord_txt_iidinvdate iidinvdate ," +
            "ord_txt_iidinvval iidinvval ,  " +
            "ord_txt_paid_amt paid_amt , " +
            "ord_txt_paid_date paid_date , " +
            "ord_txt_paid_ref paid_ref   " +
            " from order1 where ord_code=" + oc + " and " +
            " ord_no in (" + arPo.join() + ")";

        var dt = Util.execSQL(sq);

        if (dt.ret = "SUCCESS") {
            qvDt.setJsonStrMetaData("{" + dt.data + "}");

            UtilGen.applyCols("C6LGREQ.UI1", qvDt);
            // if (typ != 141)
            //     that.qv.mLctb.getColByName("PROFORMA").mHideCol = true;
            // qvDt.mLctb.getColByName("WO").mColClass = "sap.m.Input";
            // qvDt.mLctb.getColByName("WODATE").mColClass = "sap.m.Input";
            // qvDt.mLctb.getColByName("WOVAL").mColClass = "sap.m.DatePicker";
            // qvDt.mLctb.getColByName("IID").mColClass = "sap.m.Input";
            // qvDt.mLctb.getColByName("IIDDATE").mColClass = "sap.m.Input";
            // qvDt.mLctb.getColByName("IIDVAL").mColClass = "sap.m.Input";
            // qvDt.mLctb.getColByName("IIDINVNO").mColClass = "sap.m.Input";
            // qvDt.mLctb.getColByName("IIDINVDATE").mColClass = "sap.m.DatePicker";
            // qvDt.mLctb.getColByName("IIDINVVAL").mColClass = "sap.m.Input";

            qvDt.mLctb.parse("{" + dt.data + "}", true);
            qvDt.loadData();
            // qvDt.setJsonStr("{" + dt.data + "}");

            if (qvDt.mLctb.rows.length > 0)
                qvDt.getControl().setFirstVisibleRow(0);


        }
        var vb = new sap.m.VBox(
            {
                items: [qvDt.getControl()]
            }
        );
        var dlg = new sap.m.Dialog({
                content: [vb],
                title: "Update info",
                buttons: [
                    new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            dlg.close();

                        }
                    }),
                    new sap.m.Button({
                        text: "Pay All",
                        press: function () {
                            for (var i = 0; i < qvDt.mLctb.rows.length; i++) {
                                var oa = qvDt.mLctb.getFieldValue(i, "ORD_AMT");
                                Util.setCellColValue(qvDt.getControl(), i, "PAID_AMT", oa);
                            }
                        }
                    }),
                    new sap.m.Button({
                        text: "Update",
                        press: function () {
                            var sq = "update order1 " +
                                "set ord_txt_wo=:wo , " +
                                "ord_txt_wodate=:wodate , " +
                                "ord_txt_woval=:woval , " +
                                "ord_txt_iiddate=:iiddate ," +
                                "ord_txt_iidval=:iidval ," +
                                "ord_txt_iidinvno=:iidinvno ," +
                                "ord_txt_iidinvdate=:iidinvdate ," +
                                "ord_txt_iidinvval=:iidinvval ,  " +
                                "ord_txt_iid=:iid ," +
                                "ord_txt_paid_amt=:paid_amt ," +
                                "ord_txt_paid_date=:paid_date ," +
                                "ord_txt_PAID_REF=:paid_ref  " +
                                "where ord_no=:on and ord_code=" + oc + ";";
                            var sqs = "";
                            for (var i = 0; i < qvDt.mLctb.rows.length; i++) {
                                var wo = Util.getCellColValue(qvDt.getControl(), i, "WO");
                                var wodate = Util.getCellColValue(qvDt.getControl(), i, "WODATE");
                                var woval = Util.getCellColValue(qvDt.getControl(), i, "WOVAL");
                                var iid = Util.getCellColValue(qvDt.getControl(), i, "IID");
                                var iiddate = Util.getCellColValue(qvDt.getControl(), i, "IIDDATE");
                                var iidval = Util.getCellColValue(qvDt.getControl(), i, "IIDVAL");
                                var iidinvno = Util.getCellColValue(qvDt.getControl(), i, "IIDINVNO");
                                var iidinvdate = Util.getCellColValue(qvDt.getControl(), i, "IIDINVDATE");
                                var iidinvval = Util.getCellColValue(qvDt.getControl(), i, "IIDINVVAL");
                                var paid_amt = Util.getCellColValue(qvDt.getControl(), i, "PAID_AMT");
                                var paid_date = Util.getCellColValue(qvDt.getControl(), i, "PAID_DATE");
                                var paid_ref = Util.getCellColValue(qvDt.getControl(), i, "PAID_REF");


                                var on = Util.getCellColValue(qvDt.getControl(), i, "ORD_NO");
                                var s = sq.replace(/:wodate/g, Util.toOraDateString(wodate));
                                s = s.replace(/:woval/g, Util.quoted(woval));
                                s = s.replace(/:wo/g, Util.quoted(wo));

                                s = s.replace(/:iiddate/g, Util.toOraDateString(iiddate));
                                s = s.replace(/:iidval/g, Util.quoted(iidval));
                                s = s.replace(/:iidinvno/g, Util.quoted(iidinvno));
                                s = s.replace(/:iidinvdate/g, Util.toOraDateString(iidinvdate));
                                s = s.replace(/:iidinvval/g, Util.quoted(iidinvval));
                                s = s.replace(/:paid_amt/g, Util.quoted(paid_amt));
                                s = s.replace(/:paid_ref/g, Util.quoted(paid_ref));
                                s = s.replace(/:paid_date/g, Util.toOraDateString(paid_date));

                                s = s.replace(/:iid/g, Util.quoted(iid));

                                s = s.replace(/:on/g, Util.quoted(on));

                                sqs += s;
                            }
                            if (sqs.length > 0) {
                                sqs = "begin " + sqs + " end;";
                                var oSql = {
                                    "sql": sqs,
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

                                    sap.m.MessageToast.show("Updated Successfully !");

                                });

                            }
                            dlg.close();
                        }
                    })
                ]
            })
        ;
        dlg.open();
    }
});



