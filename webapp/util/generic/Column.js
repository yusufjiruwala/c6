sap.ui.define(["./DataCell"], function (DataCell) {
    'use strict';
    function Column() {
        this.mUIHelper = {
            canEdit: false,
            dataType: "string",
            defaultValue: null,
            formatStr: "",
            styleName: "",
            displaySize: "300px",
            isVisible: true

        };
        this.mColpos = 0;
        this.mColName = "";
        this.mList = "";
        this.mColClass = "";
        this.mTitle = "";
        this.mGrouped=false;
    }

    Column.prototype = {
        constructor: Column,
        getMUIHelper: function () {
            return this.mUIHelper
        }
    }
    return Column;
});
