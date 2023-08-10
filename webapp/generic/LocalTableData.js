sap.ui.define("sap/ui/ce/generic/LocalTableData", ["./DataCell", "./Column", "./Row"],
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
            this.masterRows = [];
            this.cndFilter = "";
            this.parsedLstCols = {
                rowCol: [],
                valCols: [],
                totCols: [],
                valHeadObj: {},
                valHeadCols: []
            };



        }

        LocalTableData.RowStatus = {
            INSERTED: "INSERTED",
            UPDATED: "UPDATED",
            DELETED: "DELETED",
            QUERY: "QUERY",
        };

        LocalTableData.prototype.showDataByCondition = function (pCnd, setCndFilter) {
            var cnd = Util.nvl(pCnd, "");

            //clearing rows variable
            // // for (var i = 0; i < this.rows.length; i++)
            // //     this.rows[i].cells = [];
            // this.rows = [];
            if (this.masterRows.length == 0) return;

            // this.rows = this.masterRows.slice(0);
            if (cnd == "") {
                this.rows = this.masterRows.slice(0);
                return;
            }

            this.rows = [...this.masterRows];
            var rws = [];
            for (var i = 0; i < this.rows.length; i++) {
                var cmpval = this.parseValues(cnd, i);
                var evald = false;
                try {
                    evald = eval(cmpval);
                }
                catch (err) {
                }
                if (evald) {
                    rws.push(this.rows[i]);
                }

            }
            this.rows = rws.slice(0);
            if (Util.nvl(setCndFilter, false))
                this.cndFilter = pCnd;

        };

        LocalTableData.prototype.constructor = LocalTableData;


        LocalTableData.prototype.updateRecStatus = function (status, recno) {
            if (LocalTableData.RowStatus[status] == undefined)
                return;
            if (Util.nvl(recno, -1) == -1)
                for (var i = 0; i < this.rows.length; i++)
                    this.rows[i].rowStatus = status;
            else
                this.rows[recno].rowStatus = status;

        };
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
                if (Util.nvl(this.cndFilter, "") != "")
                    this.showDataByCondition(this.cndFilter);

                frmt = this.format();
                dt = JSON.parse(frmt).data;
            } else {
                dt = this.dataJson.data;
            }
            return dt;
        };
        LocalTableData.prototype.formatMetadata = function () {
            var mtCols = [];
            for (var key in this.cols) {

                var o = {};
                var c = this.cols[key];
                if (c.mColName == "_rowid")
                    continue;
                o.colname = c.mColName;
                o.data_type = c.getMUIHelper().data_type;
                o.display_format = c.getMUIHelper().display_format;
                o.display_width = Util.nvl(c.getMUIHelper().display_width, 75) * 2;
                o.display_align = "ALIGN_" + c.getMUIHelper().display_align.toUpperCase();
                o.display_style = c.getMUIHelper().display_style;
                o.descr = Util.nvl(c.mTitle, c.mColName);
                o.summary = c.mSummary;
                o.grouped = c.mGrouped;
                o.qtree_type = c.mQtreeType;
                o.hide_col = c.mHideCol;
                o.cf_operator = c.mCfOperator;
                o.cf_value = c.mCfValue;
                o.cf_true = c.mCfTrue;
                o.cf_false = c.mCfFalse;
                o.parent_title_1 = c.mTitleParent;
                o.parent_title_span = c.mTitleParentSpan;
                mtCols.push(o);
            }
            return "\"metadata\":" + JSON.stringify(mtCols);
        };
        LocalTableData.prototype.parseCol = function (strData) {
            this.resetData();
            this.dataJson = JSON.parse(strData);
            this.jsonString = strData;
            this.parsedLstCols.rowCol = [];
            this.parsedLstCols.totCols = [];
            for (var key in this.dataJson.metadata) {
                var c = new Column();
                c.mColName = this.dataJson.metadata[key].colname;
                c.mColpos = key;
                c.parentmLcTb = this;
                c.getMUIHelper().data_type = this.dataJson.metadata[key].data_type;
                c.getMUIHelper().display_format = this.dataJson.metadata[key].display_format;
                c.getMUIHelper().display_width = Util.nvl(this.dataJson.metadata[key].display_width, 75) * 2;
                c.getMUIHelper().display_align = Util.nvl(this.dataJson.metadata[key].display_align, "").replace("ALIGN_", "").toLowerCase();
                c.getMUIHelper().display_style = Util.nvl(this.dataJson.metadata[key].display_style, "");
                c.mTitle = Util.nvl(this.dataJson.metadata[key].descr, c.mColName);
                c.mTitleAr = Util.nvl(this.dataJson.metadata[key].descrar, c.mColName);
                c.mSummary = this.dataJson.metadata[key].summary;
                c.mGrouped = (this.dataJson.metadata[key].grouped == "true" ? true : false);
                c.mQtreeType = Util.nvl(this.dataJson.metadata[key].qtree_type, "");
                c.mHideCol = Util.nvl(this.dataJson.metadata[key].hide_col, "false") == "true" ? true : false;
                c.mCfOperator = Util.nvl(this.dataJson.metadata[key].cf_operator, "");
                c.mCfValue = Util.nvl(this.dataJson.metadata[key].cf_value, "");
                c.mCfTrue = Util.nvl(this.dataJson.metadata[key].cf_true, "");
                c.mCfFalse = Util.nvl(this.dataJson.metadata[key].cf_false, "");
                c.mTitleParent = Util.nvl(this.dataJson.metadata[key].parent_title_1, "");
                c.mTitleParentSpan = Util.nvl(this.dataJson.metadata[key].parent_title_span, 1);
                this.cols.push(c);
            }

        };
        LocalTableData.prototype.parse = function (strData, onlyDetails) {
            if (!Util.nvl(onlyDetails, false))
                this.parseCol(strData);
            else {
                this.dataJson = JSON.parse(strData);
                this.jsonString = strData;
                for (var i = 0; i < this.rows.length; i++)
                    this.rows[i].cells = [];
                this.rows = [];
            }
            this.parsedLstCols.rowCol = [];
            this.parsedLstCols.totCols = [];
            this.parsedLstCols.valCols = [];
            this.parsedLstCols.valHeadObj = {};
            this.parsedLstCols.valHeadCols = []; // must be same column index of valCols

            for (var rn in this.dataJson.data) {
                var r = new Row(this.cols.length);
                for (var key in this.dataJson.data[rn]) {
                    if (key == "_rowid") continue;
                    var cp = this.getColPos(key);
                    // if (this.cols[cp].mUIHelper.data_type == "DATE") {
                    //     var sdf = new simpleDateFormat(this.cols[cp].mUIHelper.display_format);
                    //     (this.dataJson.data[rn][key] != null ? r.cells[cp].setValue(sdf.format(this.dataJson.data[rn][key])) : r.cells[cp].setValue(null));
                    // }
                    // else
                    r.cells[cp].setValue(this.dataJson.data[rn][key]);

                    if (Util.nvl(this.cols[cp].ct_col, "N") == "Y" && this.parsedLstCols.valCols.indexOf(this.dataJson.data[rn][key]) < 0) {
                        this.parsedLstCols.valCols.push(this.dataJson.data[rn][key]);
                        this.parsedLstCols.valHeadObj[this.dataJson.data[rn][key]] = key;
                        if (this.parsedLstCols.valHeadCols.indexOf(key) < 0) {
                            this.parsedLstCols.valHeadCols.push(key);
                        }
                    }
                    if (Util.nvl(this.cols[cp].ct_row, "N") == "Y" && this.parsedLstCols.rowCol.indexOf(key) < 0)
                        this.parsedLstCols.rowCol.push(key);
                    if (Util.nvl(this.cols[cp].ct_val, "N") == "Y" && this.parsedLstCols.totCols.indexOf("tot__" + key) < 0)
                        this.parsedLstCols.totCols.push("tot__" + key);
                }

                this.rows.push(r);
            }
            this.masterRows = [];
            this.masterRows = this.rows.slice(0);
            if (this.isCrossTb)
                this.do_cross_tab();

        };
        LocalTableData.prototype.do_cross_tab = function () {
            var nData = new LocalTableData();
            var lstCols = []; // array for all columns

            // all cols will be added 


            // LOOP :  get all row cols into lstCols array
            var tmcl = [...this.parsedLstCols.rowCol];
            for (var ci = 0; ci < tmcl.length; ci++) {
                var col = { ...this.cols[this.getColPos(tmcl[ci])] };
                col.getMUIHelper = this.cols[this.getColPos(tmcl[ci])].getMUIHelper;
                lstCols.push(col);
            }
            // LOOP :  get all "valCols" and copy properties fromk "valHeadCols" ,
            //          also split title for displaying multi label header.
            var tmcl = [...this.parsedLstCols.valCols];
            for (var ci = 0; ci < tmcl.length; ci++) {
                var col = { ...this.cols[this.getColPos(tmcl[ci].split("__")[1])] };
                col.getMUIHelper = this.cols[this.getColPos(tmcl[ci].split("__")[1])].getMUIHelper;
                col.mColName = this.parsedLstCols.valCols[ci];
                if (col.mColName.includes("__") && this.parsedLstCols.totCols.length > 1) {
                    col.mTitleParent = this.parsedLstCols.valCols[ci].split("__")[0];
                    col.mTitle = this.parsedLstCols.valCols[ci].split("__")[1];
                    col.mTitleParentSpan = this.parsedLstCols.totCols.length;
                } else {
                    col.mTitleParent = this.parsedLstCols.valCols[ci].split("__")[1].toUpperCase();
                    col.mTitle = this.parsedLstCols.valCols[ci].split("__")[0];
                    col.mTitleParentSpan = this.parsedLstCols.valCols.length;
                }
                lstCols.push(col);
            }
            var tmcl = [...this.parsedLstCols.totCols];
            for (var ci = 0; ci < tmcl.length; ci++) {
                var col = { ...this.cols[this.getColPos(tmcl[ci].replaceAll("tot__", ""))] };
                col.mColName = tmcl[ci];
                col.getMUIHelper = this.cols[this.getColPos(tmcl[ci].replaceAll("tot__", ""))].getMUIHelper;
                //                col.mColName = this.parsedLstCols.valCols[ci];
                if (col.mColName.includes("__")) {
                    col.mTitleParent = "Total";//this.parsedLstCols.valCols[ci].split("--")[0];
                    col.mTitle = this.parsedLstCols.valCols[ci].split("__")[1];
                    col.mTitleParentSpan = this.parsedLstCols.valCols.length;
                }
                lstCols.push(col);
            }
            // LOOP:  add all new cross tab cols to new data table.
            for (var i in lstCols) {
                lstCols[i].mColpos = i;
                nData.cols.push(lstCols[i]);
            }

            // LOOP: copying data to nData from parsed data
            var mapRows = {};
            var mapRowsCol = {};
            var totals = {};

            for (var i = 0; i < this.rows.length; i++) {
                var mp = {};
                var rstr = "";
                for (var ri = 0; ri < this.parsedLstCols.rowCol.length; ri++) {
                    rstr += this.getFieldValue(i, this.parsedLstCols.rowCol[ri]);
                    mp[this.parsedLstCols.rowCol[ri]] = this.getFieldValue(i, this.parsedLstCols.rowCol[ri]);
                }

                if (mapRows[rstr] == undefined)
                    mapRows[rstr] = mp;
                for (var ci in lstCols) {
                    var mp = mapRows[rstr];
                    totals = {};
                    if (this.parsedLstCols.valCols.indexOf(lstCols[ci].mColName) >= 0) {
                        var cnm = lstCols[ci].mColName.split("__")[1];
                        var cval = this.getFieldValue(i, cnm);
                        var cHeadVal = this.getFieldValue(i, this.parsedLstCols.valHeadObj[lstCols[ci].mColName])
                        if (cHeadVal == lstCols[ci].mColName)
                            mp[lstCols[ci].mColName] = Util.nvl(mp[lstCols[ci].mColName], 0) + Util.nvl(cval, 0);
                    }
                }

            }

            for (var i in mapRows) {
                var nr = nData.addRow();
                for (var ci in lstCols)
                    nData.setFieldValue(nr, lstCols[ci].mColName, Util.nvl(mapRows[i][lstCols[ci].mColName], 0));
            }


            // for (var i = 0; i < this.rows.length; i++) {
            //     var nr = nData.addRow();
            //     for (var ci in lstCols) {
            //         if (this.parsedLstCols.valCols.indexOf(lstCols[ci].mColName) >= 0) {
            //             var cnm = lstCols[ci].mColName.split("__")[1];
            //             nData.setFieldValue(nr, lstCols[ci].mColName, this.getFieldValue(i, cnm));
            //         } else if (this.parsedLstCols.rowCol.indexOf(lstCols[ci].mColName) >= 0) {
            //             nData.setFieldValue(nr, lstCols[ci].mColName, this.getFieldValue(i, lstCols[ci].mColName));
            //         }
            //     }
            // }
            this.resetData();
            this.cols = nData.cols.slice(0);
            this.rows = nData.rows.slice(0);
            this.masterRows = this.rows.slice(0);
        };

        LocalTableData.prototype.addRow = function () {

            var r = new Row(this.cols.length);
            this.rows.push(r);
            var rn = this.rows.length - 1;
            for (var k in this.cols) {
                if (this.cols[k].mDefaultValue != undefined)
                    this.setFieldValue(rn, this.cols[k].mColName, this.cols[k].mDefaultValue);
                if (this.cols[k].mDefaultValue == "#AUTONUMBER_")
                    this.setFieldValue(rn, this.cols[k].mColName, rn + 1);
            }
            this.masterRows = this.rows.slice(0);
            return rn;
        },
            LocalTableData.prototype.insertRow = function (idx) {
                var r = new Row(this.cols.length);
                // this.rows.push(r);
                this.rows.splice(idx, 0, r);
                var rn = this.rows.indexOf(r);
                for (var k in this.cols) {
                    if (this.cols[k].mDefaultValue != undefined)
                        this.setFieldValue(rn, this.cols[k].mColName, this.cols[k].mDefaultValue);
                    if (this.cols[k].mDefaultValue == "#AUTONUMBER_")
                        this.setFieldValue(rn, this.cols[k].mColName, rn + 1);
                }
                this.masterRows = this.rows.slice(0);
                return rn;
            },
            LocalTableData.prototype.format = function () {
                if (this.cols <= 0)
                    return "";
                var datastr = "data :";
                var metastr = "{ \"metadata\":[ ";
                var tmpstr = "";
                for (var c in this.cols) {
                    tmpstr += (c == 0 ? "" : ",") +
                        '{"colname":"' + this.cols[c].mColName.replace(/\//g, "___") + '"}';
                }
                metastr += tmpstr + "]";
                if (this.rows.length == 0)
                    return metastr + "}";
                datastr = '"data": [';
                tmpstr = "";
                var rstr = "";
                for (var r in this.rows) {
                    rstr = "";
                    for (var c in this.cols) {
                        rstr += (rstr.length == 0 ? "" : ",") + '"' +
                            this.cols[c].mColName.replace(/\//g, "___") + '":' + ((Util.getParsedJsonValue(this.rows[r].cells[c].getValue()) + "")/*.replace(/\\/g, "\\\\")*/);
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
            this.masterRows = [];
        };

        LocalTableData.prototype.removeAllRows = function () {
            for (var i = 0; i < this.rows.length; i++)
                this.rows[i].cells = [];
            this.rows = [];
            this.masterRows = [];

        };

        LocalTableData.prototype.find = function (fld, val) {
            //var cp = this.getColPos(fld);
            for (var i = 0; i < this.rows.length; i++)
                if (this.getFieldValue(i, fld) == val)
                    return i;

            return -1;
        };

        LocalTableData.prototype.findInJoin = function (flds, val) {
            for (var i = 0; i < this.rows.length; i++) {
                var vl = "";
                for (var j = 0; j < flds.length; j++)
                    vl += this.getFieldValue(i, flds[j]);
                if (vl == val)
                    return i;
            }
            return -1;
        };

        LocalTableData.prototype.setColumnMerge = function (iCol1, iCol2, updateMR) {
            for (var i = 0; i < this.rows.length; i++) {
                var f1 = this.cols[iCol1].mColName;
                var f2 = this.cols[iCol2].mColName;
                var v = Util.nvl(this.getFieldValue(i, f1), "") + " - " + Util.nvl(this.getFieldValue(i, f2), "");
                this.setFieldValue(i, f1, v);
            }
            this.deleteCol(iCol2);
            if (updateMR) {
                this.masterRows = [];
                this.masterRows = this.rows.slice(0);
            }

        };

        LocalTableData.prototype.deleteCol = function (col) {
            this.cols.splice(col, 1);
            for (var i = 0; i < this.rows.length; i++)
                this.rows[i].cells.splice(col, 1);
        };
        LocalTableData.prototype.deleteRow = function (row) {
            this.rows.splice(row, 1);
            this.masterRows = this.rows.slice(0);
        };
        LocalTableData.prototype.sortCol = function (pColNo, updateMR) {
            this.rows.sort(function (a, b) {
                var vl1 = a.cells[pColNo].getValue();
                var vl2 = b.cells[pColNo].getValue();
                if (vl1 < vl2)
                    return -1;
                if (vl1 > vl2)
                    return 1;
                return 0;
            });
            if (updateMR) {
                this.masterRows = [];
                this.masterRows = this.rows.slice(0);
            }
        };
        LocalTableData.prototype.evaluteCfValue = function (col, rowno) {
            if (rowno > this.rows.length - 1)
                return false;
            var op = col.mCfOperator;
            var cmpval = this.parseValues(col.mCfOperator, rowno);
            try {
                return eval(cmpval);
            }
            catch (err) {
                console.log(err);
                return;
            }
            //var rowval = this.getFieldValue(rowno, col.mColName);


            // var ret = false;

            // if (col.getMUIHelper().data_type == "number") {
            //     cmpval = Number(cmpval);
            //     rowval = Number(rowval);
            // }

            // if (op == "=" && rowval == cmpval)
            //     return true;
            // if (op == ">" && rowval > cmpval)
            //     return true;
            // if (op == "<" && rowval < cmpval)
            //     return true;
            // if (op == ">=" && rowval >= cmpval)
            //     return true;
            // if (op == "<" && rowval < cmpval)
            //     return true;
            // if (op == "%" && rowval + "".indexOf(cmpval) > -1)
            //     return true;

            //return ret;
        };

        LocalTableData.prototype.parseValues = function (str, rowno) {
            if (this.cols <= 0)
                return "";
            var st = str;
            for (var i = 0; i < this.cols.length; i++) {
                var searchMask = ":" + this.cols[i].mColName;
                var regEx = new RegExp(searchMask, "ig");
                var replaceMask = this.getFieldValue(rowno, this.cols[i].mColName);
                if (this.cols[i].getMUIHelper().data_type.toUpperCase() != "NUMBER") {
                    replaceMask = "'" + replaceMask + "'";
                }
                if (replaceMask == undefined || replaceMask == "") replaceMask = "''";
                st = st.replace(regEx, replaceMask);
            }
            return st;
        }

        LocalTableData.prototype.getJSONRec = function (recno) {
            var rstr = "";
            var tmpstr = "";
            var r = recno;
            rstr = "";
            for (var c in this.cols) {
                rstr += (rstr.length == 0 ? "" : ",") + '"' +
                    this.cols[c].mColName.replace(/\//g, "___") + '":' + Util.getParsedJsonValue(this.rows[r].cells[c].getValue());
            }
            rstr += (rstr.length == 0 ? "" : ",") + '"_rowid":"' + r + '"';
            tmpstr += "{" + rstr + "}";

            return JSON.parse(tmpstr);
        };
        LocalTableData.prototype.getSummaryOf = function (colName, sumType) {
            var cp = this.getColPos(fieldName);
        };

        LocalTableData.prototype.parseColValues = function (sq3, rowno, sett) {

            var mLctb = this;
            var sq = sq3;
            for (var c in mLctb.cols) {
                if (sq.indexOf(":" + mLctb.cols[c].mColName) >= 0) {
                    var vl3 = mLctb.getFieldValue(rowno, mLctb.cols[c].mColName);
                    if (mLctb.cols[c].getMUIHelper().display_format == "SHORT_DATE_FORMAT")
                        vl3 = Util.toOraDateString(vl3);
                    else if (mLctb.cols[c].getMUIHelper().data_type == "DATE" && mLctb.cols[c].getMUIHelper().display_format != "SHORT_DATE_FORMAT")
                        vl3 = (vl3 != "" ? Util.toOraDateTimeString(new Date(vl3)) : "");
                    else if (mLctb.cols[c].getMUIHelper().data_type == "NUMBER") {
                        var dfs = Util.nvl(mLctb.cols[c].getMUIHelper().display_format, "NONE");
                        var df;
                        if (Util.nvl(mLctb.cols[c].getMUIHelper().display_format, "NONE") == "QTY_FORMAT")
                            dfs = sett["FORMAT_QTY_1"];
                        if (Util.nvl(mLctb.cols[c].getMUIHelper().display_format, "NONE") == "MONEY_FORMAT")
                            dfs = sett["FORMAT_MONEY_1"];
                        if (dfs != "NONE") {
                            df = new DecimalFormat(dfs);
                            vl3 = parseFloat(df.formatBack(vl3.replace(/'/g, '')));
                        }
                    } else
                        vl3 = "" + vl3 + "";

                    var re = new RegExp(":" + mLctb.cols[c].mColName, 'g');
                    sq = sq.replace(re, vl3);
                }

            }
            return sq;

        };

        return LocalTableData;

    })
    ;