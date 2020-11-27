sap.ui.jsfragment("bin.forms.fa.faCategory", {

    createContent: function (oController) {
        var that = this;
        jQuery.sap.require("sap.m.MessageBox");
        this.oController = oController;
        this.view = oController.getView();
        this.ctg_in_item = "";
        this.qryStr = Util.nvl(this.oController.qryStr, "");
        this.joApp = new sap.m.SplitApp({
            mode: sap.m.SplitAppMode.HideMode
        });
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 106,
            onm: ""
        };
        // this.pgDetail = new sap.m.Page({showHeader: false});

        this.bk = new sap.m.Button({
            text: "Cancel",
            icon: "sap-icon://cancel",
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

        this.createFormToolBar();
        // that.createScrollCmds(this.frm.getToolbar());

        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);


        this.mainPage.addContent(sc);

    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        this.ctg = {};
        this.ctg.catno = UtilGen.addControl(fe, "Code", sap.m.Input, "faCtgCode",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: "XL6 L6 M6 S6"}),
            }, "string", undefined, this.view);
        this.ctg.catname = UtilGen.addControl(fe, "Name", sap.m.Input, "faCtgName",
            {enabled: true}, "string", undefined, this.view);

        return UtilGen.formCreate("", true, fe);

        // return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var view = this.view;
        var that = this;
        this.ctg.catno.setEnabled(true);
        if (this.qryStr == "") {
            UtilGen.setControlValue(this.ctg.catno, "");
            UtilGen.setControlValue(this.ctg.catname, "");
            setTimeout(function () {
                that.ctg.catno.focus();
            }, 500);

        } else {
            this.ctg.catno.setEnabled(false);
            var dt = Util.execSQL("select *from facat where catno=" + this.qryStr);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.loadDataFromJson(this.ctg, dtx[0], true);
                this.ctg.catno.setEnabled(false);
                setTimeout(function () {
                    that.ctg.catname.focus();
                }, 100);
            }
        }
    }
    ,
    validateSave: function () {
        if (UtilGen.getControlValue(this.ctg.catno) == "" ||
            UtilGen.getControlValue(this.ctg.catname) == "") {
            sap.m.MessageToast.show("Code / Name must have a value !");
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
        var k = ""; //  sql for order1 table.
        // inserting or updating order1 and order1 and order2  tables.
        // var defaultValues = {};
        if (this.qryStr == "") {
            k = UtilGen.getSQLInsertString(this.ctg, {});
            k = "insert into facat " + k + ";";
        } else
            k = UtilGen.getSQLUpdateString(this.ctg, "facat", {},
                "catno=" + Util.quoted(this.qryStr)) + " ;";
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

            sap.m.MessageToast.show("Saved Successfully !,  Enter New category..!");
            that.qryStr = "";
            that.loadData();
        });


    },
    delete_data: function () {
        var that = this;
        if (that.qryStr == "") {
            this.loadData();
            return;
        }
        if (this.getNoOfItems(this.qryStr) > 0) {
            sap.m.MessageToast.show("This Category in Items  " + this.ctg_in_item);
            return;
        }
        sap.m.MessageBox.confirm("Are you sure to DELETE this Category : ?  " +
            UtilGen.getControlValue(that.ctg.catname) + " - " +
            UtilGen.getControlValue(that.ctg.catno), {
            title: "Confirm",                                    // default
            onClose: function (oAction) {
                if (oAction == sap.m.MessageBox.Action.OK) {
                    var dt = Util.execSQL("delete from facat where catno=" + Util.quoted(that.qryStr));
                    if (dt.ret = "SUCCESS") {
                        sap.m.MessageToast.show("Deleted successfully !.. Enter new category...!");
                        that.qryStr = "";
                        that.loadData();
                    }
                }
            },                                       // default
            styleClass: "",                                      // default
            initialFocus: null,                                  // default
            textDirection: sap.ui.core.TextDirection.Inherit     // default
        });
    }
    ,
    show_list: function () {
        var that = this;
        var sq = "select CATNO,CATNAME  from facat  ORDER BY CATNO";
        Util.showSearchList(sq, "CATNAME", "CATNO", function (valx, val) {
            that.qryStr = valx;
            that.loadData();
        });

    },
    getNoOfItems: function (cn) {
        var dt = Util.execSQL("select max(code) itm,nvl(count(*),0) CNT from faitems where catno=" + Util.quoted(cn));
        if (dt.ret = "SUCCESS" && dt.data.length > 0) {
            var dtx = JSON.parse("{" + dt.data + "}").data;
            if (dtx[0].CNT > 0)
                this.ctg_in_item = dtx[0].ITM;
            return dtx[0].CNT;
        }
        return -1;
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
    }
});



