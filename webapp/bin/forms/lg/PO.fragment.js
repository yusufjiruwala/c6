sap.ui.jsfragment("bin.forms.lg.PO", {

    createContent: function (oController) {
        var that = this;
        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: [
                new sap.m.Button({
                    icon: "sap-icon://add",
                    press: function () {
                        that.qv.addRow();
                        // var v = that.qv.getControl().getModel().getData();
                        // var m = that.qv.mLctb.formatMetadata();
                        // var mc = new LocalTableData(that.qv.mLctb.cols.length);
                        // mc.parse("{" + m + ",\"data\":" + JSON.stringify(v) + "}");
                        // console.log(mc.format());
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://save",
                    press: function () {
                        for (var r in that.qv.mLctb.rows) {
                            console.log(UtilGen.getInsertRowString(that.qv.mLctb, "order2", parseInt(r), ["ORD_BALANCE_AVAIL", "ORD_COST_PRICE", "ORD_COST_AMT", "LSPRICE", "LSAMT","AMOUNT","DISCP","DESCR2"]));
                        }
                    }
                })
            ]
        });
        this.createView();
        return this.mainPage;
    },

    createView: function () {
        var that = this;
        this.qv = new QueryView("test");
        //var sq = "select reference,'' cmdSearch ,descr from items  where reference like '%' order by descr2";
        var sq = "select order2.*, items.descr descr2, 0 discp,((ORD_PRICE-ORD_DISCAMT)/ORD_PACK)*ORD_ALLQTY amount,"
            + "0 ord_balance_avail,0 ord_cost_price,0 ord_cost_amt"
            + ",0 lsprice,0 lsamt from order2,items where ord_no='"
            + 7814
            + "' and ord_code="
            + 103 + " and ord_refer=reference " +
            " order by ord_pos";
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {

            // that.qv.mLctb.cols[0].mColClass = "sap.m.SearchField";
            // that.qv.mLctb.cols[0].eValidateColumn = function (evtx) {
            //
            //     if (evtx.getParameters().clearButtonPressed || evtx.getParameters().refreshButtonPressed) {
            //         return;
            //     }
            //     var row = evtx.getSource().getParent();
            //     var sq = "select reference,descr from items where childcounts=0";
            //     Util.show_list(sq, ["DESCR", "REFERENCE"], function (data) {
            //         //UtilGen.setControlValue(srch, data.DESCR, data.REFERENCE, true);
            //         console.log(evtx);
            //         var oModel = that.qv.getControl().getModel();
            //         var rowStart = that.qv.getControl().getFirstVisibleRow(); //starting Row index
            //         var currentRowoIndexContext = that.qv.getControl().getContextByIndex(rowStart + that.qv.getControl().indexOfRow(row));
            //         oModel.setProperty(currentRowoIndexContext.sPath + "/DESCR", data.DESCR);
            //         sap.m.MessageToast.show("heelo ");
            //         return true;
            //     }, "100%", "100%", 10);
            // };
            that.qv.getControl().addStyleClass("sapUiSizeCondensed");
            that.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
            that.qv.getControl().setFixedBottomRowCount(0);

            that.qv.setJsonStrMetaData("{" + data.data + "}");
            //that.qv.setJsonStr("{" + data.data + "}");
            UtilGen.applyCols("C6LGREQ.ORDER2", that.qv);
            that.qv.mLctb.parse("{" + data.data + "}", true);
            that.qv.loadData();
        });
        this.mainPage.addContent(this.qv.getControl());
    }

});



