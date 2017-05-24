sap.ui.define(["./DataCell", "./Column", "./Row"],
    function (DataCell, Column, Row) {
        'use strict';
        function LocalTableData() {
            this.SUMMARY_SUM = 0;
            this.SUMMARY_COUNT = 1;
            this.SUMMARY_MAX = 2;
            this.SUMMARY_MIN = 3;
            this.STATUS_NORMAL = "NORMAL";
            this.STATUS_QUERY = "QUERY";
            this.jsonString = "";
            this.cursorNo = 0;
            this.cols = [];
            this.rows = [];
        }

        LocalTableData.prototype.constructor = LocalTableData;

        LocalTableData.prototype.getColPos = function (cn) {
            for (var i = 0; i < this.cols.length; i++)
                if (this.cols[i].mColName.toUpperCase() == cn.toUpperCase())
                    return i;
            return -1;
        };
        LocalTableData.prototype.getColByName = function (cn) {
            for (var i = 0; i < this.cols.length; i++)
                if (this.cols[i].mColName.toUpperCase() == cn.toUpperCase())
                    return this.cols[i];
            return null;
        };
        LocalTableData.prototype.getFieldValue = function (rowno, fieldName) {
            var cp = this.getColPos(fieldName);
            if (cp < 0)
                return null;
            var row = this.rows[rowno];
            return row.cells[cp].getValue();
        };
        LocalTableData.prototype.getFieldDisplay = function (rowno, fieldName) {
            var cp = this.getColPos(fieldName);
            if (cp < 0)
                return null;
            var row = this.rows[rowno];
            return row.cells[cp].getDisplay();
        };
        LocalTableData.prototype.setFieldValue = function (rowno, fieldName, value) {
            var cp = this.getColPos(fieldName);
            if (cp < 0)
                return null;
            var row = this.rows[rowno];
            return row.cells[cp].setValue(value);
        };
        LocalTableData.prototype.setFieldDisplay = function (rowno, fieldName, value) {
            var cp = this.getColPos(fieldName);
            if (cp < 0)
                return null;
            var row = this.rows[rowno];
            return row.cells[cp].setValue(value);
        };
        LocalTableData.prototype.getData = function (reFormat) {
            //var dta = JSON.parse(this.jsonString);
            var frmt = "";
            var dt;
            if (reFormat) {
                frmt = this.format();
                //console.log(frmt);
                dt = JSON.parse(frmt).data;
            } else {
                dt = this.dataJson.data;
            }

            return dt;
        };
        LocalTableData.prototype.parse = function (strData) {
            this.resetData();
            this.dataJson = JSON.parse(strData);
            this.jsonString = strData;
            for (var key in this.dataJson.metadata) {
                var c = new Column();
                c.mColName = this.dataJson.metadata[key].colname;
                c.mColpos = key;
                c.getMUIHelper().data_type = this.dataJson.metadata[key].data_type;
                c.getMUIHelper().display_format = this.dataJson.metadata[key].display_format;
                c.getMUIHelper().display_width = this.dataJson.metadata[key].display_width * 2;
                c.getMUIHelper().display_align = Util.nvl(this.dataJson.metadata[key].display_align, "").replace("ALIGN_", "").toLowerCase();
                c.mTitle = this.dataJson.metadata[key].descr;
                c.mSummary = this.dataJson.metadata[key].summary;

                this.cols.push(c);


            }
            for (var rn in this.dataJson.data) {
                var r = new Row(this.cols.length);
                for (var key in this.dataJson.data[rn]) {
                    var cp = this.getColPos(key);
                    r.cells[cp].setValue(this.dataJson.data[rn][key]);
                }
                this.rows.push(r);
            }
        };
        LocalTableData.prototype.format = function () {
            if (this.cols <= 0)
                return "";
            var datastr = "data :";
            var metastr = "{ \"metadata\":[ ";
            var tmpstr = "";
            for (var c in this.cols) {
                tmpstr += (c == 0 ? "" : ",") +
                    '{"colname":"' + this.cols[c].mColName + '"}';
            }
            metastr += tmpstr + "]";
            if (this.rows.length == 0)
                return metastr;
            datastr = '"data": [';
            tmpstr = "";
            var rstr = "";
            for (var r in this.rows) {
                rstr = "";
                for (var c in this.cols) {
                    rstr += (rstr.length == 0 ? "" : ",") + '"' +
                        this.cols[c].mColName + '":' +
                        (typeof this.rows[r].cells[c].getValue() == "number" ? this.rows[r].cells[c].getValue() :
                        '"' + this.rows[r].cells[c].getValue().replace(/\\/g, "\\\\") + '"');
                }
                rstr += (rstr.length == 0 ? "" : ",") + '"_rowid":"' + r + '"';
                tmpstr += (r == 0 ? "" : ",") + "{" + rstr + "}";
            }

            datastr += tmpstr + "] }";
            //console.log(metastr + "," + datastr);
            return metastr + "," + datastr;
        };
        LocalTableData.prototype.resetData = function () {
            this.cols = [];
            for (var i = 0; i < this.rows.length; i++)
                this.rows[i].cells = [];
            this.rows = [];
        };

        LocalTableData.prototype.find = function (fld, val) {
            //var cp = this.getColPos(fld);
            for (var i = 0; i < this.rows.length; i++)
                if (this.getFieldValue(i, fld) == val)
                    return i;

            return -1;
        };

        LocalTableData.prototype.setColumnMerge = function (iCol1, iCol2) {
            for (var i = 0; i < this.rows.length; i++) {
                var f1 = this.cols[iCol1].mColName;
                var f2 = this.cols[iCol2].mColName;
                var v = Util.nvl(this.getFieldValue(i, f1), "") + " - " + Util.nvl(this.getFieldValue(i, f2), "");
                this.setFieldValue(i, f1, v);
            }
            this.deleteCol(iCol2);
        };

        LocalTableData.prototype.deleteCol = function (col) {
            this.cols.splice(col, 1);
            for (var i = 0; i < this.rows.length; i++)
                this.rows[i].cells.splice(col, 1);
        };

        return LocalTableData;

    });