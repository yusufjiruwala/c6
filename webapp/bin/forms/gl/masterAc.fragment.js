sap.ui.jsfragment("bin.forms.gl.masterAc", {

    createContent: function (oController) {
        var that = this;
        this.errStr = "";
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = Util.nvl(oController.qryStr, "");
        this.ac = {};
        this.joApp = new sap.m.App({});
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
                that.joApp.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        this.createView();
        this.loadData();
        this.joApp.addPage(this.mainPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage);
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

        this.mainPage.attachBrowserEvent("keydown", function (oEvent) {
            if (oEvent.key == 'F4') {
                that.get_new_ac();
            }
        });

        this.mainPage.addContent(sc);

    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        var titSpan = "XL2 L4 M4 S12";
        var codSpan = "XL3 L2 M2 S12";
        //button for create a/c
        fe.push(new sap.m.Button({
            text: "Pick AC [F4]",
            press: function () {
                that.get_new_ac();
            },
            layoutData: new sap.ui.layout.GridData({span: codSpan}),
        }));

        //accno
        this.ac.accno = UtilGen.addControl(fe, "A/C No", sap.m.Input, "Acc_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: codSpan}),
            }, "string", undefined, this.view);

        //name : descr

        this.ac.name = UtilGen.addControl(fe, "@Title", sap.m.Input, "Acc_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: titSpan}),
            }, "string", undefined, this.view);


        //actype : type normal/ close/ link
        this.ac.actype = UtilGen.addControl(fe, "Type", sap.m.ComboBox, "Acc_",
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{CODE} - {NAME}", key: "{CODE}"}),
                    templateShareable: true
                },
                selectedKey: "01",
                layoutData: new sap.ui.layout.GridData({span: codSpan}),
            }, "string", undefined, this.view, undefined, "@0/Normal,1/Close,2/Link");


        //namea : Eng name
        this.ac.namea = UtilGen.addControl(fe, "@Title Eng", sap.m.Input, "Acc_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: titSpan}),
            }, "string", undefined, this.view);

        //parentacc : parent a/c
        this.ac.parentacc = UtilGen.addControl(fe, "Parent A/c", sap.m.SearchField, "Acc_",
            {
                search: function (e) {
                    UtilGen.doSearch(e, "select Accno code,Name title from acaccount where childcount>0 order by path ", that.ac.parentacc);
                }

            }, "string", undefined, this.view);

        //closeacc  : closing a/c
        this.ac.closeacc = UtilGen.addControl(fe, "Close A/c", sap.m.SearchField, "Acc_",
            {
                search: function (e) {
                    UtilGen.doSearch(e, "select Accno code,Name title from acaccount where actype=1 order by path ", that.ac.closeacc);
                }

            }, "string", undefined, this.view);

        //start_date:
        this.ac.start_date = UtilGen.addControl(fe, "Start Date", sap.m.DatePicker, "Acc_",
            {}, "date", undefined, this.view);

        // AC_NATURE : nature of a/c
        this.ac.ac_nature = UtilGen.addControl(fe, "@A/c Nature", sap.m.ComboBox, "Acc_",
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{CODE} - {NAME}", key: "{CODE}"}),
                    templateShareable: true
                },
                layoutData: new sap.ui.layout.GridData({span: codSpan}),
            }, "number", undefined, this.view, undefined, "@1/Debit,-1/Credit");

        // isbankcash
        this.ac.isbankcash = UtilGen.addControl(fe, "Bank/Cash", sap.m.CheckBox, "Acc_",
            {selected: false}, "boolean", undefined, this.view);
        this.ac.isbankcash.trueValues = ["Y", "N"]; // true value , false value;

        // currency_code
        this.ac.currency_code = UtilGen.addControl(fe, "@Base Currency", sap.m.SearchField, "Acc_",
            {
                search: function (e) {
                    UtilGen.doSearch(e, "select code,name title from currency_master order by code ", that.ac.currency_code);
                }

            }, "string", undefined, this.view);


        // costcent
        this.ac.costcent = UtilGen.addControl(fe, "Default CostCent", sap.m.SearchField, "Acc_",
            {
                search: function (e) {
                    UtilGen.doSearch(e, "select code,title from accostcent1 order by code ", that.ac.costcent);
                }

            }, "string", undefined, this.view);
        //remarks
        this.ac.remarks = UtilGen.addControl(fe, "Remarks", sap.m.Input, "Acc_",
            {
                enabled: true
            }, "string", undefined, this.view);

        // return UtilGen.formCreate("", true, fe);
        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var view = this.view;
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        this.ac.accno.setEnabled(true);

        if (this.qryStr == "") {
            UtilGen.setControlValue(this.ac.actype, "0");
            UtilGen.setControlValue(this.ac.start_date, new Date());
            UtilGen.setControlValue(this.ac.ac_nature, "1");
            UtilGen.setControlValue(this.ac.currency_code, sett["DEFAULT_CURRENCY"]);
        } else {
            var dt = Util.execSQL("select *from acaccount where accno=" + Util.quoted(this.qryStr));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    UtilGen.loadDataFromJson(this.ac, dtx[0], true);
                    this.ac.accno.setEnabled(false);

                    if (Util.nvl(dtx[0].PARENTACC, "") != "") {
                        var s = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(dtx[0].PARENTACC));
                        UtilGen.setControlValue(this.ac.parentacc, s + "-" + dtx[0].PARENTACC, dtx[0].PARENTACC, true);
                    }
                    var s = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(dtx[0].CLOSEACC));
                    UtilGen.setControlValue(this.ac.closeacc, s + "-" + dtx[0].CLOSEACC, dtx[0].CLOSEACC, true);
                }
            }


        }
    }
    ,
    validateSave: function () {
        var objs = [this.ac.accno,
            this.ac.closeacc, this.ac.name,
            this.ac.actype, this.ac.start_date,
            this.ac.ac_nature, this.ac.currency_code];

        if (UtilGen.showErrorNoVal(objs) > 0)
            return false;

        var pa = UtilGen.getControlValue(this.ac.parentacc);
        if (!this.canAcParent(pa)) {
            sap.m.MessageToast.show(this.errStr);
            return false;
        }

        return true;
    }
    ,
    save_data: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        if (!this.validateSave())
            return;
        this.joApp.backFunction();
    }
    ,
    get_new_ac: function () {
        var that = this;
        if (this.qryStr != "") {
            sap.m.MessageToast.show("You are  Editing A/c # " + this.qryStr);
            return;
        }

        if (Util.nvl(UtilGen.getControlValue(this.ac.parentacc), "") == "") {
            sap.m.MessageToast.show("Select Parent A/c !");
            UtilGen.doSearch(
                undefined, "select Accno code,Name title from acaccount where childcount>0 order by path ", that.ac.parentacc, function () {
                    if (Util.nvl(UtilGen.getControlValue(that.ac.parentacc), "") == "")
                        return;
                    var pac = Util.nvl(UtilGen.getControlValue(that.ac.parentacc), "");
                    var nn = Util.getSQLValue("select to_number(nvl(max(accno),0))+1 from acaccount where parentacc=" + Util.quoted(pac));
                    UtilGen.setControlValue(that.ac.accno, nn, nn, true);
                });

        } else {
            var pac = Util.nvl(UtilGen.getControlValue(that.ac.parentacc), "");
            var nn = Util.getSQLValue("select to_number(nvl(max(accno),0))+1 from acaccount where parentacc=" + Util.quoted(pac));
            UtilGen.setControlValue(that.ac.accno, nn, nn, true);
        }

    },
    canAcParent: function (pa) {
        this.errStr = "";

        if (!Util.isNull(pa)) {
            var n = Util.getSQLValue("select nvl(count(*),0) from acaccount where accno=" + Util.quoted(pa));
            if (n > 0) {
                this.errStr = "Err ! , Parent A/c is in transaction !";
                return false;
            }
            n = Util.getSQLValue("select nvl(count(*),0) from c_ycust where ac_no=" + Util.quoted(pa));
            if (n > 0) {
                this.errStr = "Err ! , Parent A/c is in  Receivables/Payables !";
                return false;
            }
            n = Util.getSQLValue("select nvl(count(*),0) from cbranch where accno=" + Util.quoted(pa));
            if (n > 0) {
                this.errStr = "Err ! , Parent A/c is in branches !";
                return false;
            }
        }
        return true;
    }
});



