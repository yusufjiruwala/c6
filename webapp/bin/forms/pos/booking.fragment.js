sap.ui.jsfragment("bin.forms.pos.booking", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 106,
            onm: ""
        };
        this.existed = false;
        var url = new URL(window.location.href);
        var callId = url.searchParams.get("caller");
        if (callId != undefined)
            that.qryStr = callId;
        // this.pgDetail = new sap.m.Page({showHeader: false});
        //
        // this.bk = new sap.m.Button({
        //     icon: "sap-icon://nav-back",
        //     press: function () {
        //         that.joApp.backFunction();
        //     }
        // });

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
        // this.frm.getToolbar().addContent(this.bk);

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
        var fe = [];
        this.fa = {};
        var t1 = "XL3 L1 M1 S12";
        var t2 = "XL3 L2 M2 S12";
        this.fa.code = UtilGen.addControl(fe, "Tel", sap.m.Input, "custTel",
            {
                enabled: true,
                // layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);
        this.fa.name = UtilGen.addControl(fe, "Name", sap.m.Input, "custName",
            {
                enabled: true,
                // layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);
        this.fa.area = UtilGen.addControl(fe, "Area", sap.m.Input, "custArea",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);
        this.fa.addr_block = UtilGen.addControl(fe, "@Block", sap.m.Input, "custBlock",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);
        this.fa.tel = UtilGen.addControl(fe, "@Other Tel", sap.m.Input, "custotherTel",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);
        this.fa.addr_street = UtilGen.addControl(fe, "Street", sap.m.Input, "custStreet",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);

        //addr_jedda
        this.fa.addr_street = UtilGen.addControl(fe, "@Jedda", sap.m.Input, "custJedda",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);

        //addr_bldg
        this.fa.addr_bldg = UtilGen.addControl(fe, "@Building", sap.m.Input, "custBuilding",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);


        //addr_floor
        this.fa.addr_floor = UtilGen.addControl(fe, "Floor", sap.m.Input, "custFloor",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);

        //addr_flat
        this.fa.addr_flat = UtilGen.addControl(fe, "@Flat", sap.m.Input, "custFlat",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);

        this.fa.addr_flat = UtilGen.addControl(fe, "@.", sap.m.Text, "custFlat2",
            {
                layoutData: new sap.ui.layout.GridData({span: t1}),
            }, "string", undefined, this.view);
        //SPEC_COMMENTS
        //complains
        //email


        // return UtilGen.formCreate("", true, fe);
        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var view = this.view;
        var that = this;
        this.fa.code.setEnabled(true);
        this.existed = false;
        if (this.qryStr == "") {
            UtilGen.resetDataJson(this.fa);
            setTimeout(function () {
                that.fa.code.focus();
            }, 500);

        } else {
            this.fa.code.setEnabled(false);
            var dt = Util.execSQL("select *from poscustomer where code=" + this.qryStr);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                if (dtx.length > 0) {
                    UtilGen.loadDataFromJson(this.fa, dtx[0], true);
                    this.fa.code.setEnabled(false);
                    this.existed = true;
                }
                else {
                    UtilGen.resetDataJson(this.fa);
                    UtilGen.setControlValue(this.fa.code, this.qryStr, this.qryStr, true);
                    this.existed = false;
                }
                setTimeout(function () {
                    that.fa.name.focus();
                }, 100);

            }
        }
    }
    ,
    validateSave: function () {

        return true;
    }
    ,
    save_data: function () {
    }
    ,
    get_emails_sel: function () {

    }

});



