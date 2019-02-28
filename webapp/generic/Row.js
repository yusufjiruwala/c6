sap.ui.define(["./DataCell"], function (DataCell) {
    'use strict';
    function Row(cc) {
        this.rowStatus = "INSERTED"; //--->>> INSERTED,QUERY,DELETED,UPDATED
        this.cells = [];
        for (var i = 0; i < cc; i++)
            this.cells.push(new DataCell());
    }
    Row.prototype={
        constructor:Row
    }
    return Row;
});