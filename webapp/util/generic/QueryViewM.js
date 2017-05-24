sap.ui.define("sap/ui/chainel1/util/generic/QueryViewM", ["./LocalTableData",],
    function (LocalTableData) {
        'use strict'
        function QueryViewM(tableId) {
            this.mJsonString = "";
            this.tableId = tableId;

            this.mTable = new sap.m.Table(tableId, {});

            this.mJsonString = "";
            this.mLctb = new LocalTableData();
//            this.mLctb.parse();
//            this.mJsonObject = JSON.parse(jsonStr);
        }

        QueryViewM.create = function (tableId, jsonStr) {
            var q = new QueryViewM(tableId);
            q.tableId = tableId;
            q.mJsonString = jsonStr;
            q.mLctb.parse(jsonStr);
            q.mJsonObject = q.mLctb.getData();
            return q;
        }
        QueryViewM.prototype.constructor = QueryViewM;


        QueryViewM.prototype.setJsonStr = function (strJson) {
            this.mJsonString = strJson;
            this.mLctb.parse(strJson);
            this.mJosnObject = this.mLctb.getData();

        };


        QueryViewM.prototype.loadData = function () {
            var col = [];
            var cells = [];
            this.mTable.removeAllColumns();
            for (var i = 0; i < this.mLctb.cols.length; i++) {
                // var c = new sap.ui.table.Column({
                //     label: new sap.ui.commons.Label({text: this.mLctb.cols[i].mColName}),
                //     template: new sap.ui.commons.Label().bindProperty("text", this.mLctb.cols[i].mColName),
                //     width: "200px",
                //     filterProperty:this.mLctb.cols[i].mColName,
                //     sortProperty:this.mLctb.cols[i].mColName
                //
                // });

                var c = new sap.m.Column({
                    label: new sap.m.Label({text: this.mLctb.cols[i].mColName}),
                    width:"200px"
                });
                col.push(c);
                this.mTable.addColumn(c);
                cells.push(
                    new sap.m.Text({
                        text: "{" + this.mLctb.cols[i].mColName + "}",
                    }));
            }

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(this.mLctb.getData());
            this.mTable.setModel(oModel);
            this.mTable.bindItems({
                    path: "/",
                    template: new sap.m.ColumnListItem({cells: cells})
                }
            );
            //this.mTable.bindRows("/");
            //this.mTable.bindAggregation("items", "/", new sap.m.ColumnListItem({cells: cells}));

        };
        return QueryViewM;
    }
);