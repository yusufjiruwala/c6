sap.ui.define([], function () {
    'use strict';
    function DataCell() {
        if (!(this instanceof DataCell)) {
            throw new TypeError("DataCell constructor cannot be called as a function.");
        }
        this.mValue = null;
        this.mLabel = "";

    };
    DataCell.create=function (mValue,mLabel) {
        var d=new DataCell(null,"");
        d.setValue(mValue);
        d.setDisplay(mLabel);
        return d;
    }

    DataCell.prototype = {
        constructor: DataCell,
        getValue: function () {
            return this.mValue;
        },
        getDisplay: function () {
            return this.mLabel;
        },
        setValue: function (vl) {
            this.mValue = vl;
            if (this.mLabel == null)
                this.mLabel = vl.toString();
        },
        setDisplay: function (lbl) {
            this.mLabel = lbl;
        }
    }
    // return new DataCell(null,"");
    // var DataCell={
    //     d:""
    // }
    return DataCell;
});