sap.ui.jsfragment("bin.forms.press.Sales", {

    createContent: function (oController) {
        var that = this;
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

        this.pgSO = new sap.m.Page({showHeader: false});
        this.pgDN = new sap.m.Page({showHeader: false});

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
        this.joApp.addDetailPage(this.pgSO);
        this.joApp.addDetailPage(this.pgDN);
        this.joApp.to(this.mainPage, "show");
        // this.showOnstartup();
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
        }, "string", undefined, undefined, "@111/Sales - 111,151/Delivery - 151");

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
                    icon: "sap-icon://add", text: "Delivery", press: function () {
                        that.qv.getControl().setSelectedIndex(-1);
                        that.lastSel = "151";
                        that.openPO(151);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://add", text: "Sales", press: function () {
                        that.qv.getControl().setSelectedIndex(-1);
                        that.lastSel = "111";
                        that.openPO(111);
                    }
                })
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
                        // if (sel == 151)
                        that.openPO();
                    }
                }),
                //Print//
                new sap.m.Button({
                    icon: "sap-icon://print", text: "", press: function () {

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

        this.mainPage.addContent(that.qv.getControl());
        if (that.lastSel != undefined)
            UtilGen.setControlValue(this.types, that.lastSel, that.lastSel, true);
        else
            UtilGen.setControlValue(this.types, "111", "111", true);


    },
    loadData: function () {
        
        var that = this;
        var typ = UtilGen.getControlValue(this.types);
        var sq = "select ord_no,ord_ref,ord_refnm,ord_amt," +
            "decode(ord_flag,'2','sap-icon://accept','sap-icon://less') ord_flag ,posted_date," +
            " (select max(invoice_no) from pur1  where keyfld=order1.pur_keyfld) invoice_no ,ord_code,ord_flag flgx," +
            "(select max(no) from acvoucher1 where keyfld=order1.saleinv) PROFORMA , " +
            " ORD_DATE,APPROVED_BY " +
            "    from order1 where ord_reference=" + Util.quoted(this.qryStr) + " and ord_code=" + Util.quoted(typ);

        var dt = Util.execSQL(sq);
        if (dt.ret = "SUCCESS") {
            that.qv.setJsonStrMetaData("{" + dt.data + "}");
            UtilGen.applyCols("C6LGREQ.MAIN", that.qv);
            that.qv.mLctb.parse("{" + dt.data + "}", true);
            //that.qv.setJsonStr("{" + dt.data + "}");
            that.qv.mLctb.getColByName("ORD_AMT").mSummary = "SUM";
            that.qv.loadData();
            if (that.qv.mLctb.rows.length > 0) {
                that.qv.getControl().setFirstVisibleRow(0);
            }
        }
        // this.enableDisableCmds();
    },
    openPO: function (ocx) {
        // default form
        var frmName = "bin.forms.lg.PO";
        var that = this;
        var frm = this.pgPO;
        var oc = ocx;
        var arPo = [];
        var ocAdd = undefined;
        var indic = this.qv.getControl().getSelectedIndices();
        if (indic.length > 0)
            oc = this.qv.mLctb.getFieldValue(indic[0], "ORD_CODE"); // ord code to check type

        for (var i = 0; i < indic.length; i++)
            arPo.push(Util.nvl(Util.getCellColValue(that.qv.getControl(), indic[i], "ORD_NO"), ""));
        ocAdd = {
            qryStr: this.qryStr,
            qryStrON: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO"), ""),
            selectedReq: arPo,
            ordRef: that.ordRef,
            ordRefNm: that.ordRefNm,
            getView:
                function () {
                    return that.view;
                }
        };

        switch (oc) {

            case 111:
                frm = this.pgSO;
                frmName = "bin.forms.press.Invoice";
                break;
            case 151:
                frm = this.pgSO;
                frmName = "bin.forms.press.DN";
                break;
            default:
                break;
        }

        var sp = UtilGen.openForm(this.view, frmName, frm, ocAdd);
        sp.backFunction = function () {
            that.joApp.to(that.mainPage, "show");
            that.createView();
            that.loadData();
        };

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
});



