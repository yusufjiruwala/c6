sap.ui.define(["./DataCell"], function (DataCell) {
    'use strict';
    function Column() {
        this.mUIHelper = {
            canEdit: false,
            data_type: "string",
            default_value: null,
            display_format: "",
            styleName: "",
            display_width: "300px",
            isVisible: true,
            display_align:"begin"
        };
        this.mColpos = 0;
        this.mColName = "";
        this.mList = "";
        this.mColClass = "";
        this.mTitle = "";
        this.mGrouped=false;
        this.mSummary="";

    }

    Column.prototype = {
        constructor: Column,
        getMUIHelper: function () {
            return this.mUIHelper
        }
    }
    return Column;
});
