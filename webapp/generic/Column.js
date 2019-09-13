sap.ui.define(["./DataCell"], function (DataCell) {
    'use strict';

    function Column() {
        this.parentmLcTb;
        this.mUIHelper = {
            canEdit: false,
            data_type: "string",
            default_value: null,
            display_format: "",
            styleName: "",
            display_width: "300px",
            isVisible: true,
            display_align: "begin",
            display_style: ""
        };
        this.mColpos = 0;
        this.mColName = "";
        this.mList = "";
        this.mColClass = "";
        this.mTitle = "";
        this.mTitleAr = "";
        this.mGrouped = false;
        this.mSummary = "";
        this.mQtreeType = "";
        this.mHideCol = false;
        this.mCfOperator = "";
        this.mCfValue = "";
        this.mCfTrue = "";
        this.mCfFalse = "";
        this.mTitleParent = "";
        this.mTitleParentSpan = 1;
        this.eValidateColumn;
        this.eOther;
        this.eOnSearch;
        this.mSearchSQL;
        this.mLookUpCols;
        this.mRetValues;
        this.mDefaultValue;
    }

    Column.prototype = {
        constructor: Column,
        getMUIHelper: function () {
            return this.mUIHelper
        },
        getParent: function () {
            return this.parentmLcTb;
        }

    }
    return Column;
});
