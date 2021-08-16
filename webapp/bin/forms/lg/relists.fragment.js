sap.ui.jsfragment("bin.forms.lg.relists", {

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

        // that.createScrollCmds(this.frm.getToolbar());

        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);
        this.lsts = UtilGen.createControl(sap.m.ComboBox, this.view, "lstsComb", {
                customData: [{key: ""}],
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                    templateShareable: true
                },
                selectionChange: function (event) {
                    that.loadSelection();
                }
            }, "string", undefined, undefined,
            "@lg_cargo_type_1/Cargo Type 1,lg_cargo_type_2/Cargo Type 2," +
            "lg_container_type_1/Container Type 1," +
            "lg_container_type_2/Container Type 2," +
            "lg_container_type_3/Container Type 3," +
            "lg_truck_type_1/Truck Type 1," +
            "lg_truck_type_2/Truck Type 2," +
            "lg_truck_type_3/Truck Type 3," +
            "lg_eqp_type_1/Equip Type 1," +
            "lg_eqp_type_2/Equip Type 2," +
            "lg_end_user_type/End User Type," +
            "lg_eqp_cap_1/Equip Cap 1," +
            "lg_eqp_cap_2/Equip Cap 2," +
            "lg_eqp_cap_3/Equip Cap 3"
        );

        this.lsts.setSelectedItem(this.lsts.getItems()[0]);
        sc.addContent(this.lsts);

        this.qv = new QueryView("tbl");
        that.qv.getControl().view = this;
        this.qv.getControl().addStyleClass("sapUiSizeCondensed");
        this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setFixedBottomRowCount(0);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
        this.qv.getControl().setVisibleRowCount(7);

        sc.addContent(new sap.m.Button({
            icon: "sap-icon://add", press: function () {
                that.qv.addRow();
            }
        }));
        sc.addContent(new sap.m.Button({
            icon: "sap-icon://sys-minus", press: function () {
                if (that.qv.getControl().getSelectedIndices().length == 0) {
                    sap.m.MessageToast.show("Select a row to delete. !");
                    return;
                }

                var r = that.qv.getControl().getSelectedIndices()[0] + that.qv.getControl().getFirstVisibleRow();
                that.qv.deleteRow(r);

            }
        }));

        this.qv.onAddRow = function (idx, ld) {
            ld.setFieldValue(idx, "POS", idx + 1);
        };

        sc.addContent(this.qv.getControl());

        this.mainPage.addContent(sc);

    },
    createViewHeader: function () {
        var that = this;
        var fe = [];

        return UtilGen.formCreate("", true, fe);
        // return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        this.loadSelection();
    }
    ,
    loadSelection: function () {
        var that = this;
        var cd = UtilGen.getControlValue(this.lsts);
        var sq = "SELECT NAME,POS FROM RELISTS WHERE idlist=" + Util.quoted(cd) + " order by pos,name";

        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                // UtilGen.applyCols("C6LGREQ.SO1", that.qv, that);
                var c = that.qv.mLctb.cols[that.qv.mLctb.getColPos("NAME")];
                c.mColClass = "sap.m.Input";

                c = that.qv.mLctb.cols[that.qv.mLctb.getColPos("POS")];
                c.mColClass = "sap.m.Input";

                that.qv.mLctb.parse("{" + data.data + "}", true);

                // if (that.qv.mLctb.rows.length == 0)
                //     that.qv.addRow();
                that.qv.loadData();


            }
        });

    }
    ,
    validateSave: function () {
        var that = this;
        that.qv.updateDataToTable();
        var ld = that.qv.mLctb;
        for (var i = 0; i < ld.rows.length; i++) {
            var fld = Util.nvl(ld.getFieldValue(i, "NAME"), "");
            if (fld == "") {
                sap.m.MessageToast.show("Name field must have value on row #" + i + " !");
                throw "Name field must have value on row #" + i + " !";
                return false;
            }

        }
        return true;

    }
    ,
    save_data: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        if (!this.validateSave())
            return;
        var cd = UtilGen.getControlValue(this.lsts);

        var defaultValues = {
            "IDLIST": Util.quoted(cd)
        }

        var ld = that.qv.mLctb;
        var k = "", s1 = "begin delete from relists where idlist=" + Util.quoted(cd) + ";";
        for (var i = 0; i < ld.rows.length; i++) {
            defaultValues["DESCR"] = Util.quoted(ld.getFieldValue(i, "NAME"));
            s1 += (UtilGen.getInsertRowString(ld, "RELISTS", i, [], defaultValues, true) + ";");
        }
        k = k + s1 + " end;";

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
            that.loadData();
            sap.m.MessageToast.show("Saved Successfully !");

        });

    },
    get_emails_sel: function () {

    }

});



