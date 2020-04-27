sap.ui.jsfragment("bin.forms.lg.contracts", {

    createContent: function (oController) {
        var that = this;
        this.QRYSTR = Util.nvl(oController.ordRef, "");
        this.QRYSTR_ITEM = "";
        var view = oController.getView();
        this.txt = new sap.m.Text({text: ""}).addStyleClass("blinking redText");
        (view.byId("addItem") != undefined ? view.byId("addItem").destroy() : null);
        var tb = new sap.m.Toolbar({
            content: [
                new sap.m.Button({
                    icon: "sap-icon://nav-back",
                    press: function () {
                        that.mainPage.backFunction();
                    }
                }),
                new sap.m.Button({
                    text: "Customer List",
                    press: function () {
                        var sq = "Select code,name from c_ycust where iscust='Y' order by code";
                        Util.show_list(sq, ["CODE", "NAME"], ["CODE"], function (data) {
                            console.log(data);
                            that.QRYSTR = data.CODE;
                            that.QRYSTR_ITEM = "";
                            that.loadData();
                            view.byId("addItem").setEnabled(true);
                            return true;
                        }, "100%", "100%", 20);
                    }

                }),
                new sap.m.Button(view.createId("addItem"), {
                    text: "Add Item",
                    enabled: false,
                    press: function () {
                        that.show_item_add();

                    }
                }),
                new sap.m.ToolbarSpacer(),
                new sap.m.SearchField({
                    liveChange: function (event) {
                        UtilGen.doFilterLiveTable(event, that.qv, ["COST_ITEM", "COST_ITEM_DESCR"]);
                    }
                }),
                this.txt
            ]
        });
        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: [tb
            ]
        });
        this.createView();
        this.loadData();
        return this.mainPage;
    },
    createView: function () {
        var that = this;
        var hb = new sap.m.VBox({height: "90%"});
        this.qv = new QueryView("test");// cost items
        this.qv2 = new QueryView("test2");//saleing items

        that.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        that.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        that.qv.getControl().setFixedBottomRowCount(0);

        that.qv2.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        that.qv2.getControl().setFixedBottomRowCount(0);
        that.qv2.getControl().addStyleClass("sapUiSizeCondensed");

        hb.addItem(this.qv.getControl());
        var hb1 = new sap.m.HBox({
            items: [new sap.m.Text({text: "Selling description :   (Press F5 to insert record)"}).addStyleClass("sapUiSmallMargin"),
                new sap.m.Button({
                    icon: "sap-icon://save",
                    press: function () {
                        that.save_data();
                    }
                })

            ]
        });
        hb.addItem(hb1);
        hb.addItem(this.qv2.getControl());
        this.mainPage.addContent(hb);

        this.qv.getControl().attachRowSelectionChange(null, function (evt) {
            that.QRYSTR_ITEM = "";
            if (that.qv.getControl().getSelectedIndices().length > 0) {
                var cnt = evt.getParameters().rowContext;
                that.QRYSTR_ITEM = that.qv.getControl().getModel().getProperty(cnt.sPath + "/COST_ITEM");
            }
            that.loadDataSelling();
        });

    }
    ,
    loadData: function () {
        var that = this;
        var view = this.oController.getView();
        view.byId("addItem").setEnabled(false);
        this.txt.setText("");
        var sq = "select distinct cost_item,descr cost_item_descr from items,lg_custitems " +
            "where cost_item=reference and code=" + Util.quoted(this.QRYSTR) + " order by cost_item";
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStr("{" + data.data + "}");
                that.qv.loadData();
                that.loadDataSelling();

                if (that.qryStr != "") {
                    that.txt.setText(that.QRYSTR + "-" + Util.getSQLValue("select name from c_ycust where code=" + Util.quoted(that.QRYSTR)));
                    view.byId("addItem").setEnabled(true);
                }
            }
        });
    }
    ,
    loadDataSelling: function () {
        var that = this;
        var sq = "select *from  lg_custitems where code=" + Util.quoted(this.QRYSTR) + " " +
            "and cost_item=" + Util.quoted(this.QRYSTR_ITEM) + " order by keyfld";
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv2.setJsonStrMetaData("{" + data.data + "}");
                UtilGen.applyCols("C6LGCONT.SELLING", that.qv2);
                that.qv2.mLctb.parse("{" + data.data + "}", true);
                var i = that.qv.getControl().getSelectedIndices().length;
                if (that.qv2.mLctb.rows.length == 0 && i > 0)
                    that.qv2.addRow();
                that.qv2.loadData();

            }

        });

    },
    show_item_add: function () {
        var ia = "";
        var that = this;
        for (var i = 0; i < that.qv.mLctb.rows.length; i++)
            ia += (ia.length == 0 ? "" : ",") + Util.quoted(that.qv.mLctb.getFieldValue(i, "COST_ITEM"));

        var sq = "select reference,descr from items where childcounts=0 and " +
            " flag=1 and reference not in (" + (ia.trim().length == 0 ? "'x'" : ia)
            + ") order by descr2";
        Util.showSearchList(sq, "DESCR", "REFERENCE", function (rfr, descr) {
            var r = that.qv.addRow(true);
            that.qv.mLctb.setFieldValue(r, "COST_ITEM", rfr);
            that.qv.mLctb.setFieldValue(r, "COST_ITEM_DESCR", descr);
            that.qv.loadData();
            // var insSql = "insert into lg_custitems (code,COST_ITEM,KEYFLD, SELLING_DESCR,FREIGHT_DESCR ) ";
            // insSql += " values () ";

            return true;
        }, "100%", "100%", 20);
    },
    save_data: function () {
        var that = this;
        var insSql = "insert into lg_custitems " +
            "( KEYFLD, CODE, COST_ITEM, SELLING_DESCR, TYPE_OF_FRIEGHT, FRIEGHT_DESCR, FC_DESCR, FC_RATE, FC_PRICE ) " +
            " VALUES " +
            "( :KEYFLD, :CODE, :COST_ITEM, :SELLING_DESCR, :TYPE_OF_FRIEGHT, :FRIEGHT_DESCR, :FC_DESCR, :FC_RATE, :FC_PRICE )";
        var ci = Util.getCurrentCellColValue(this.qv.getControl(), "COST_ITEM");
        var delSql = "delete from lg_custitems where cost_item='" + ci + "' and code='" + this.QRYSTR + "'";
        that.qv2.updateDataToTable();
        var plsql = "";
        var lctb = that.qv2.mLctb;
        for (var i = 0; i < lctb.rows.length; i++) {
            var sq = insSql;
            sq = sq.replace(":KEYFLD", "(select nvl(max(keyfld),0)+1 from lg_custitems)");
            sq = sq.replace(":CODE", Util.quoted(this.QRYSTR));
            sq = sq.replace(":COST_ITEM", Util.quoted(ci));
            sq = sq.replace(":SELLING_DESCR", Util.quoted(lctb.getFieldValue(i, "SELLING_DESCR")));
            sq = sq.replace(":TYPE_OF_FRIEGHT", lctb.getFieldValue(i, "TYPE_OF_FRIEGHT"));
            sq = sq.replace(":FRIEGHT_DESCR", Util.quoted(lctb.getFieldValue(i, "FRIEGHT_DESCR")));
            sq = sq.replace(":FC_DESCR", Util.quoted(lctb.getFieldValue(i, "FC_DESCR")));
            sq = sq.replace(":FC_RATE", lctb.getFieldValue(i, "FC_RATE"));
            sq = sq.replace(":FC_PRICE", lctb.getFieldValue(i, "FC_PRICE"));
            plsql += (plsql.length > 0 ? ";" : "") + sq;
        }
        try {
            Util.execSQL("begin " + delSql + ";" + plsql + "; end; ");
            sap.m.MessageToast.show(i + " Records Saved Successfully ");
        }
        catch (ex) {
            sap.m.MessageToast.show(ex);
        }
    }
})
;



