sap.ui.define("sap/ui/chainel1/util/generic/QueryView",["./LocalTableData",],
    function (LocalTableData) {
        'use strict'
        function QueryView(tableId) {
            this.mJsonString = "";
            this.tableId = tableId;
            this.mTable = new sap.ui.table.Table(tableId,{
                visibleRowCountMode:sap.ui.table.VisibleRowCountMode.Auto,
                firstVisibleRow: 3,
                selectionMode: sap.ui.table.SelectionMode.Single,
                selectionBehavior: sap.ui.table.SelectionBehavior.Row,

            });

            this.mJsonString = "";
            this.mLctb = new LocalTableData();
//            this.mLctb.parse();
//            this.mJsonObject = JSON.parse(jsonStr);
        }

        QueryView.create = function (tableId, jsonStr) {
            var q = new QueryView(tableId);
            q.tableId = tableId;
            q.mJsonString = jsonStr;
            q.mLctb.parse(jsonStr);
            q.mJsonObject = q.mLctb.getData();
            return q;
        }
        QueryView.prototype.constructor = QueryView;

        QueryView.prototype.createView = function () {
        };
        QueryView.prototype.loadData = function () {
            var col = [];
            this.mTable.destroyColumns();
            for (var i = 0; i < this.mLctb.cols.length; i++) {
                var c = new sap.ui.table.Column({
                    label: new sap.ui.commons.Label({text: this.mLctb.cols[i].mColName}),
                    template: new sap.ui.commons.Label().bindProperty("text", this.mLctb.cols[i].mColName),
                    width: "200px"
                });
                col.push(c);
                this.mTable.addColumn(c);
            }
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({modelData: this.mLctb.getData()});
            this.mTable.setModel(oModel).bindRows("/modelData");
        };
        return QueryView;
    }
);



