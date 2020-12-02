sap.ui.jsfragment("bin.forms.fa.faItems", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = Util.nvl(oController.qryStr, "");
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
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");
        return this.joApp;
    },
    createView: function () {
        var that = this;
        var view = this.view;

        UtilGen.clearPage(this.mainPage);
        this.fa = {};
        var fe = [];
        this.frm = this.createViewHeader();

        this.createFormToolBar();


        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);

        this.mainPage.addContent(sc);

    },

    createViewHeader: function () {
        var that = this;
        var fe = [];
        var sett = sap.ui.getCore().getModel("settings").getData();
        var acsql = "select accno code,name title from acaccount where actype=0 and childcount=0 order by path";
        this.fa.code = UtilGen.addControl(fe, "Code", sap.m.Input, "faCode",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S12"}),
            }, "string", undefined, this.view);
        this.fa.descr = UtilGen.addControl(fe, "@Descr", sap.m.Input, "faDescr",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: "XL3 L4 M4 S12"}),
            }, "string", undefined, this.view);

        this.fa.catno = UtilGen.addControl(fe, "Group", sap.m.SearchField, "faCatno",
            {
                enabled: true,
                search: function (e) {
                    that.doSearch(e, "select catno code,catname title from facat order by code ", that.fa.catno);
                }
            }, "string", undefined, this.view);
        this.fa.accno = UtilGen.addControl(fe, "Cost A/c", sap.m.SearchField, "faAccno",
            {
                enabled: true,
                search: function (e) {
                    that.doSearch(e, acsql, that.fa.accno);
                }

            }, "string", undefined, this.view);
        this.fa.depaccno = UtilGen.addControl(fe, "Dep A/c", sap.m.SearchField, "faDepAccno",
            {
                enabled: true,
                search: function (e) {
                    that.doSearch(e, acsql, that.fa.depaccno);
                }
            }, "string", undefined, this.view);

        this.fa.expaccno = UtilGen.addControl(fe, "Dep Expense A/c", sap.m.SearchField, "faExpAccno",
            {
                enabled: true,
                search: function (e) {
                    that.doSearch(e, acsql, that.fa.expaccno);
                }
            }, "string", undefined, this.view);

        this.fa.costcent = UtilGen.addControl(fe, "Cost Center", sap.m.SearchField, "faCostCent",
            {
                enabled: true,
                search: function (e) {
                    that.doSearch(e, "select code,title from accostcent1 order by code ", that.fa.costcent);
                }

            }, "string", undefined, this.view);
        fe.push("#FA Details");

        var tl = "XL3 L2 M2 S12";
        this.fa.purdate = UtilGen.addControl(fe, "Begin Date", sap.m.DatePicker, "faPurDate",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: tl})
            }, "date", undefined, this.view);


        this.fa.purprice = UtilGen.addControl(fe, "@Pur Price", sap.m.Input, "faPurPrice",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: tl})
            }, "number", sett["FORMAT_MONEY_1"], this.view);


        this.fa.deprate = UtilGen.addControl(fe, "Dep Rate", sap.m.Input, "faDepRate",
            {
                enabled: true,
                value: "5",

                layoutData: new sap.ui.layout.GridData({span: tl})
            }, "number", sett["FORMAT_MONEY_1"], this.view);

        this.fa.priordep = UtilGen.addControl(fe, "@Prior Dep", sap.m.Input, "faPriorDep",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: tl})
            }, "number", sett["FORMAT_MONEY_1"], this.view);
        this.fa.priordepamt = UtilGen.addControl(fe, "Total Expense", sap.m.Input, "faTotExpl",
            {
                editable: true,
                layoutData: new sap.ui.layout.GridData({span: tl})
            }, "number", sett["FORMAT_MONEY_1"], this.view);

        this.fa.currentvalue = UtilGen.addControl(fe, "@Tot Value", sap.m.Input, "faTotVal",
            {
                editable: false,
                value: "0",
                layoutData: new sap.ui.layout.GridData({span: tl})
            }, "number", sett["FORMAT_MONEY_1"], this.view);

        this.fa.lastdepdate = UtilGen.addControl(fe, "Last Dep Date", sap.m.DatePicker, "falastdepdate",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: tl})
            }, "date", undefined, this.view);
        this.fa.netbookvalue = UtilGen.addControl(fe, "@Net Book", sap.m.Input, "fanetbookvalue",
            {
                editable: true,
                value: "1",
                layoutData: new sap.ui.layout.GridData({span: tl})
            }, "number", sett["FORMAT_MONEY_1"], this.view);

        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

        // return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
    },
    loadData: function () {
        var view = this.view;
        var that = this;
        this.fa.code.setEnabled(true);
        if (this.qryStr == "") {
            UtilGen.setControlValue(this.fa.purprice, 0, 0, true);
            UtilGen.setControlValue(this.fa.deprate, 5, 5, true);
            UtilGen.setControlValue(this.fa.priordep, 0, 0, true);
            UtilGen.setControlValue(this.fa.priordepamt, 0, 0, true);
            UtilGen.setControlValue(this.fa.currentvalue, 0, 0, true);
            UtilGen.setControlValue(this.fa.netbookvalue, 1, 1, true);
        }

    }
    ,
    validateSave: function () {
        var objs = [this.fa.code, this.fa.descr, this.fa.purprice, this.fa.deprate,
            this.fa.accno, this.fa.purdate, this.fa.priordep, priordep, this.fa.priordepamt];
        if (UtilGen.showErrorNoVal(objs) > 0)
            return false;

        return true;
    }
    ,
    save_data: function () {
        if (!this.validateSave())
            return;
    },

    createFormToolBar: function () {
        var that = this;
        this.frm.getToolbar().addContent(this.bk);

        Util.destroyID("faCmdSave", this.view);

        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("faCmdSave"), {
            text: "Save",
            icon: "sap-icon://save", press: function () {
                that.save_data();
            }
        }));

        Util.destroyID("faCmdDel", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("faCmdDel"), {
            text: "Delete",
            icon: "sap-icon://delete", press: function () {
                that.delete_data();
            }
        }));
        Util.destroyID("faCmdList", this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("faCmdList"), {
            text: "List",
            icon: "sap-icon://list", press: function () {
                that.show_list();
            }
        }));
    },
    doSearch: function (event, sql, obj) {
        if (event != undefined
            && (event.getParameters().clearButtonPressed
                || event.getParameters().refreshButtonPressed)) {
            UtilGen.setControlValue(obj, "", "", true);
            return;
        }

        Util.showSearchList(sql, "TITLE", "CODE", function (valx, val) {
            UtilGen.setControlValue(obj, val, valx, true);
        });

    }


});



