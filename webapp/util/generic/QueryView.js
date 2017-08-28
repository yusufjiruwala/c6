sap.ui.define("sap/ui/chainel1/util/generic/QueryView", ["./LocalTableData", "./DataFilter"],
    function (LocalTableData, DataFilter) {
        'use strict'
        function QueryView(tableId) {
            var that = this;
            this.mJsonString = "";
            this.tableId = tableId;
            this.mViewSettings = {}
            this.colMerged = false;
            this.mOnAfterLoad = null;
            this.lastSelIndex = -1;
            this.lastSelectedCode = "";
            this.onselect = undefined;

            this.mTable = new sap.ui.table.Table(tableId, {
                visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                firstVisibleRow: 3,
                selectionMode: sap.ui.table.SelectionMode.MultiToggle,
                // selectionBehavior: sap.ui.table.SelectionBehavior.Row,
                //enableGrouping: true,
                fixedBottomRowCount: 1,
                rowSelectionChange: function (ev) {
                    if (that.mLctb.cols.length < 0) return;
                    if (!ev.getParameters().userInteraction)
                        return;
                    var oData = that.mTable.getContextByIndex(ev.getParameters().rowIndex);
                    var data = oData.getProperty(oData.getPath());
                    if (that.mLctb.cols[0].mGrouped &&
                        data[that.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4094))) {
                        that.selectGroup(data[that.mLctb.cols[1].mColName], ev.getParameters().rowIndex);
                    }
                }
            });

            var that = this;

            // $("#" + this.mTable.getId() + "-vsb").on( 'scroll', function(){
            //     console.log('Event Fired');
            //     that.colorRows();
            // });

            $("#" + this.mTable.getId() + "-vsb").scroll(function () {
                console.log("scrolling");
                that.colorRows();
            });

            // this.mTable = new sap.m.Table(tableId, {});

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
        };
        QueryView.prototype.constructor = QueryView;


        QueryView.prototype.setJsonStr = function (strJson) {
            this.colMerged = false;
            this.mJsonString = strJson;
            this.mViewSettings = {};
            this.mLctb.parse(strJson);
            this.mJosnObject = this.mLctb.getData();

        };
        QueryView.prototype.attachOnAfterLoad = function (fn) {
            this.mOnAfterLoad = fn;
        }

        QueryView.prototype.loadData = function () {
            //resetingg,
            var col = [];
            var cells = [];
            this.b4_cf_val1 = [];
            this.b4_cf_val = [];
            this.mTable.setEnableGrouping(false);
            for (var i = 0; i < this.mTable.getColumns().length; i++) {
                this.mTable.getColumns()[i].setGrouped(false);
                this.mTable.getColumns()[i].setSorted(false);
                this.mTable.getColumns()[i].setFiltered(false);
            }
            this.mTable.setEnableGrouping(false);


            this.mTable.destroyColumns();
            var dt = this.buildJsonData();
            var cc = null;
            for (var i = 0; i < this.mLctb.cols.length; i++) {
                cc = this.mLctb.cols[i];
                var a = cc.getMUIHelper().display_align;
                if (cc.getMUIHelper().display_format == "MONEY_FORMAT")
                    a = "end";
                if (cc.getMUIHelper().display_format == "QTY_FORMAT")
                    a = "center";

                var c = new sap.ui.table.Column(/*this.mLctb.cols[i].mColName.replace(" ", ""),*/ {
                    label: new sap.ui.commons.TextView({text: cc.mTitle,wrapping:true}),
                    template: new sap.ui.commons.Label({
                        "text": "{" + this.mLctb.cols[i].mColName + "}",
                        textAlign: Util.getAlignTable(a)
                    }),
                    width: (cc.getMUIHelper().display_width) + "px"
                });

                col.push(c);
                c.setMenu(null);
                this.mTable.addColumn(c);
                if (cc.mHideCol)
                    c.setVisible(false);
            }
            this.col = col;
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(dt);
            this.mTable.setModel(oModel);
            this.mTable.bindRows("/");
            var that = this;

            if (this.mLctb.cols.length <= 0) return;

            if (this.mLctb.cols.length > 0 && this.mLctb.cols[0].mGrouped)
                this.mTable.getColumns()[0].setVisible(false);
            if (this.mOnAfterLoad != undefined)
                this.mOnAfterLoad(this);

            this.scroll = setInterval(function () {
                that.colorRows();
                $("#" + that.mTable.getId() + "-vsb").off("scroll");
                $("#" + that.mTable.getId() + "-vsb").scroll(function () {
                    that.colorRows();
                });
            }, 1000);

        };

        QueryView.prototype._sort = function (pCol, updateMR) {
            this.mLctb.rows.sort(function (a, b) {
                var vl1 = a.cells[pCol].getValue();
                var vl2 = b.cells[pCol].getValue();
                if (vl1 < vl2)
                    return -1;
                if (vl1 > vl2)
                    return 1;
                return 0;
            });
            if (updateMR) {
                this.mLctb.masterRows = [];
                this.mLctb.masterRows = this.mLctb.rows.slice(0);
            }
        };

        QueryView.prototype._getDistinctGroup = function (pCol, o) {
            var grp = "";
            var h = [];
            for (var i = 0; i < o.length; i++)
                if (i == 0 || grp != o[i][pCol]) {
                    h.push(o[i][pCol]);
                    grp = o[i][pCol];
                }
            return h;
        };

        QueryView.prototype.buildJsonData = function () {
            // this.mLctb.cols[0].mGrouped = true;
            // this.mLctb.cols[1].mGrouped = true;
            if (this.mLctb.cols.length == 0)
                return null;

            var headerg = {};
            var grpCol = "";
            var grouped = false;
            // merging first and second column

            if (this.colMerged == false &&
                this.mLctb.cols[0].mGrouped &&
                this.mLctb.cols.length > 1 &&
                this.mLctb.cols[1].mGrouped) {
                this.mLctb.setColumnMerge(0, 1, true);
                this.colMerged = true;
                this._sort(0, true);

                if (this.mLctb.cols.length > 1)
                    grpCol = this.mLctb.cols[1].mColName;
                //grouped = true;
            }

            if (this.colMerged) {
                grouped = this.colMerged;
                grpCol = this.mLctb.cols[1].mColName;
            }

            this.applySettings();
            var o = this.mLctb.getData(true);

            var footer = {};
            var footerg = {};

            var cnt = 0;
            var grp = "";
            var t;
            var sett = sap.ui.getCore().getModel("settings").getData();
            var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
            var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

            for (var i = 0; i < o.length; i++) {
                cnt = 0;
                for (var v in o[i]) {
                    if (grouped && cnt === 0) {
                        footer[v] = String.fromCharCode(4095) + "";
                        footerg[v] = String.fromCharCode(4095);
                        cnt++;
                        t = v;
                        if (i == 0) {
                            grp = o[i][v];
                            headerg = {};
                            headerg[t] = String.fromCharCode(4094);
                            headerg[grpCol] = grp;
                            o.splice(i, 0, headerg);
                            ++i;
                        }
                        continue;
                    }
                    if (typeof (o[i][v]) == "number") {
                        if (this.mLctb.getColByName(v).mSummary == "SUM") {
                            footerg[v] = (footerg[v] == undefined ? 0 : footerg[v]) + o[i][v];
                            footer[v] = (footer[v] == undefined ? 0 : footer[v]) + o[i][v];
                        } else if (this.mLctb.getColByName(v).mSummary == "LAST") {
                            footerg[v] = o[i][v];
                            footer[v] = o[i][v];
                        }
                        else {
                            footerg[v] = "";
                            footer[v] = "";
                        }
                        if (this.mLctb.getColByName(v).getMUIHelper().display_format === "MONEY_FORMAT")
                            o[i][v] = df.format(o[i][v]);
                    }
                    else {
                        footer[v] = "";
                        footerg[v] = "";
                        if (v != "_rowid" && this.mLctb.getColByName(v).getMUIHelper().display_format === "SHORT_DATE_FORMAT") {
                            var dt = new Date(o[i][v]);
                            o[i][v] = sf.format(dt);
                        }


                    }
                    cnt++;
                }

                if (grouped && i > o.length - 2) {
                    for (var fv in footerg)  // formating...
                        if (fv != "_rowid" && this.mLctb.getColByName(fv).getMUIHelper().display_format === "MONEY_FORMAT")
                            footerg[fv] = df.format(footerg[fv]);
                    o.splice(i + 1, 0, footerg);
                    grp = o[i][t];
                    t = null;
                    ++i;
                    footerg = {};
                    break;
                }

                if (grouped && t != undefined && i + 1 < o.length && grp != o[i + 1][t]) {
                    var nxt = o[i + 1][t];
                    for (var fv in footerg)  // formating...
                        if (fv != "_rowid" && this.mLctb.getColByName(fv).getMUIHelper().display_format === "MONEY_FORMAT")
                            footerg[fv] = df.format(footerg[fv]);
                    o.splice(i + 1, 0, footerg);
                    grp = nxt;
                    //t = null;
                    ++i;
                    footerg = {};
                    headerg = {};
                    headerg[t] = String.fromCharCode(4094);
                    headerg[grpCol] = nxt;
                    o.splice(i + 1, 0, headerg);
                    ++i;
                }


            }
            for (var fv in footer)  // formating...
                if (fv != "_rowid" && this.mLctb.getColByName(fv).getMUIHelper().display_format === "MONEY_FORMAT")
                    footer[fv] = df.format(footer[fv]);

            o.push(footer);
            return o;

        };

        QueryView.prototype.colorRows = function () {
            if (this.mLctb.cols.length <= 0)                return;
            var oModel = this.mTable.getModel();
            var rowCount = this.mTable.getVisibleRowCount(); //number of visible rows
            var rowStart = this.mTable.getFirstVisibleRow(); //starting Row index
            var cellAdd = 0;
            if (this.mLctb.cols[0].mGrouped) cellAdd = 1;
            var cellsCount = this.mLctb.cols.length;

            if (document.getElementById(this.mTable.getId()).offsetParent == null || rowCount == 0) {
                if (this.scroll != undefined) clearInterval(this.scroll);
                console.log('stopped interval scroll..');
                return;
            }
            for (var i = 0; i < this.mLctb.cols.length; i++)
                if (this.mLctb.cols[i].mHideCol)
                    ++cellAdd;
            var currentRowContext;
            for (var i = 0; i < rowCount - 1; i++) {
                currentRowContext = this.mTable.getContextByIndex(rowStart + i);
                (this.mTable.getRows()[i]).$().removeClass("yellow");
                (this.mTable.getRows()[i]).$().removeClass("qrGroup");
                this.mTable.getRows()[i].getCells()[0].$().parent().parent().removeAttr("colspan");
                var cf = "";
                // ----conditional formatting
                for (var j = 0 + cellAdd; j < cellsCount; j++) {
                    if (this.b4_cf_val1[j - cellAdd] == undefined)
                        this.b4_cf_val1[j - cellAdd] = this.mTable.getRows()[i].getCells()[j - cellAdd].$().parent().parent().attr("style");
                    if (this.b4_cf_val[j - cellAdd] == undefined)
                        this.b4_cf_val[j - cellAdd] = this.mTable.getRows()[i].getCells()[j - cellAdd].$().attr("style");

                    if (i <= this.mLctb.rows.length && this.mLctb.cols[j].mCfOperator != undefined)
                        if (oModel.getData()[rowStart + i]._rowid != undefined && oModel.getData()[rowStart + i]._rowid.length > 0
                            && this.mLctb.evaluteCfValue(this.mLctb.cols[j], Number(oModel.getData()[rowStart + i]._rowid)))
                            cf = cf + this.mLctb.cols[j].mCfTrue;
                        else
                            cf = cf + this.mLctb.cols[j].mCfFalse;
                }


                for (var j = 0 + cellAdd; j < cellsCount; j++)
                    if (this.mTable.getRows()[i].getCells()[j - cellAdd] != undefined) {
                        // removing any class...
                        this.mTable.getRows()[i].getCells()[j - cellAdd].$().parent().parent().removeClass("yellow");
                        this.mTable.getRows()[i].getCells()[j - cellAdd].$().parent().parent().removeClass("qrGroup");
                        this.mTable.getRows()[i].getCells()[j - cellAdd].$().attr("style", this.b4_cf_val);
                        this.mTable.getRows()[i].getCells()[j - cellAdd].$().parent().parent().attr("style", Util.nvl(this.b4_cf_val1[j - cellAdd], ""));
                        // column formatting...
                        var col_fmt1 = "";// will hold column format
                        if (i <= this.mLctb.rows.length &&
                            this.mLctb.cols[j - cellAdd].getMUIHelper().display_style != undefined &&
                            this.mLctb.cols[j - cellAdd].getMUIHelper().display_style.length > 0) {
                            var s = this.mLctb.cols[j - cellAdd].getMUIHelper().display_style;
                            col_fmt1 = s;
                            this.mTable.getRows()[i].getCells()[j - cellAdd].$().parent().parent().attr("style", this.b4_cf_val1[j - cellAdd] + ";" + s);
                            this.mTable.getRows()[i].getCells()[j - cellAdd].$().parent().parent().attr("style", this.b4_cf_val[j - cellAdd] + ";" + s);
                        }
                        //applying conditional formatting....
                        if (cf != undefined && cf.length > 0) {
                            this.mTable.getRows()[i].getCells()[j - cellAdd].$().parent().parent().attr("style", this.b4_cf_val1[j - cellAdd] + ";" + col_fmt1 + cf);
                            this.mTable.getRows()[i].getCells()[j - cellAdd].$().attr("style", this.b4_cf_val[j - cellAdd] + ";" + col_fmt1 + cf);
                        }
                        else if (this.mLctb.cols[j - cellAdd].getMUIHelper().display_style == undefined ||
                            this.mLctb.cols[j - cellAdd].getMUIHelper().display_style.length == 0) {
                            this.mTable.getRows()[i].getCells()[j - cellAdd].$().parent().parent().attr("style", this.b4_cf_val1[j - cellAdd]);
                            this.mTable.getRows()[i].getCells()[j - cellAdd].$().attr("style", this.b4_cf_val[j - cellAdd]);
                        }


                    }

                var cellValue = oModel.getProperty(this.mLctb.cols[0].mColName, currentRowContext);

                if (cellValue != undefined && (cellValue + "").startsWith(String.fromCharCode(4095))) {
                    for (var k = 0 + cellAdd; k < cellsCount; k++) {
                        var cv = oModel.getProperty(this.mLctb.cols[k].mColName, currentRowContext);
                        if (cv != undefined && (cv + "").trim().length > 0 &&
                            this.mTable.getRows()[i].getCells()[k - cellAdd] != undefined)
                            this.mTable.getRows()[i].getCells()[k - cellAdd].$().parent().parent().addClass("yellow");
                    }
                }

                if (cellValue != undefined && (cellValue + "").startsWith(String.fromCharCode(4094))) {
                    this.mTable.getRows()[i].getCells()[0].$().addClass("qrGroup");
                    this.mTable.getRows()[i].getCells()[0].$().parent().parent().attr("colspan", (cellAdd + 1) + "");
                }

            }

        }
        ;

        QueryView.prototype.printHtml = function (view, iadd) {
            var that = this;
            if (this.mLctb.cols.length <= 0) return;
            var h = "", dt = "", rs = "";           // table header data
            var sett = sap.ui.getCore().getModel("settings").getData();
            var oData = this.mTable.getModel().getData();
            var tmpv1 = "", tmpv2 = "", tmpv3 = "", classadd = "", styleadd = "";
            var colData = view.colData;
            var cellValue = "";
            var rowid = -1;
            var cf = "";
            var grouped = this.mLctb.cols[0].mGrouped;
            var cnt = 0;

            h = ""
            cnt == 0;
            var rep=view.byId("txtSubGroup").getValue();
            var company = "<div class='company'>" + sett["COMPANY_NAME"] + "</div> " +
                "<div class='reportTitle'>" + view.reportsData.report_info.report_name +
                " - " + rep.substr(0,rep.indexOf(" - ")) + "</div>";
            var dtitle = "";
            var tmp = "";
            var cnt=0;
            // adding parameters on top of the page

            var vl = "";
            var ia = Util.nvl(iadd, "para");
            for (var i = 0; i < colData.parameters.length; i++) {
                if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                    vl = (view.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
                else
                    vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");

                tmp += "<td class='paraLabel'>" + colData.parameters[i].PARA_DESCRARB + ":</td>" +
                    "<td class='paraText'>" + Util.nvl(Util.htmlEntities(vl), "-") + "</td>";
                if (i > 0 && i % 3 == 0) {
                    dtitle += "<tr>" + tmp + "</tr>";
                    tmp = "";
                }

            }
            // table header...
            for (var c in this.col) {
                cnt++;
                if (cnt - 1 == 0 && grouped) continue;
                if (cnt - 1 === this.col.length) continue;
                tmpv1 = this.col[c].getLabel().getText();
                tmpv2 = "\"text-align:" + this.col[c].getHAlign().toLowerCase() + "\"";
                h += "<th " + tmpv2 + ">" + Util.htmlEntities(tmpv1) + "</th>";
            }

            h = "<thead>" +
                "<tr>" + h + "</tr></thead>";

            // getting data in table..
            var t;
            for (var i = 0; i < oData.length; i++) {
                rs = "";
                cnt = 0;
                tmpv2 = "", tmpv3 = "", classadd = "", styleadd = "";
                //getting style for row...
                cf = "";
                rowid = Number(Util.nvl(oData[i]["_rowid"], -1));

                for (var v in oData[i]) {
                    var cn = that.mLctb.getColPos(v);
                    if (cn > -1 && rowid > -1 && Util.nvl(that.mLctb.cols[cn].mCfOperator, "").length > 0) {
                        if (this.mLctb.evaluteCfValue(this.mLctb.cols[cn], rowid))
                            cf += this.mLctb.cols[cn].mCfTrue;
                        else
                            cf += this.mLctb.cols[cn].mCfFalse;
                    }
                }
                // looping to write html <tr>

                for (var v in oData[i]) {
                    cnt++;
                    tmpv2 = "", tmpv3 = "", classadd = "", styleadd = "";
                    var cn = that.mLctb.getColPos(v);
                    var cc = that.mLctb.cols[cn];
                    if (cnt - 1 == 0) {
                        t = v;
                    }   // get 1st array key.. to find this row is summary/group
                    if (cnt - 1 === 0 && grouped) {
                        continue;
                    }
                    if (cnt - 1 === this.mLctb.cols.length) break;
                    cellValue = oData[i][v];


                    if (cellValue != undefined && (cellValue + "").trim().length > 0 && oData[i][t].startsWith(String.fromCharCode(4095))) {
                        classadd += "yellow "
                    }
                    if (grouped && cellValue != undefined && oData[i][t].startsWith(String.fromCharCode(4094))) {
                        classadd += "qrGroup ";
                    }

                    if (rowid > -1 && cf.length > 0)
                        styleadd += cf;
                    if (Util.nvl(cc.getMUIHelper().display_style, "").length > 0) {
                        styleadd += cc.getMUIHelper().display_style;
                    }

                    var a = "text-align:" + cc.getMUIHelper().display_align + " ";
                    if (cc.getMUIHelper().display_format == "MONEY_FORMAT")
                        a = "text-align:end ";
                    if (cc.getMUIHelper().display_format == "QTY_FORMAT")
                        a = "text-align:center ";
                    styleadd += a;

                    styleadd = (styleadd.length > 0 ? ' style="' : "") + styleadd + (styleadd.length > 0 ? '"' : "");
                    classadd = (classadd.length > 0 ? ' class="' : "") + classadd + (classadd.length > 0 ? '"' : "");
                    tmpv2 = (tmpv2.length > 0 ? ' colspan="' : "") + tmpv2 + (tmpv2.length > 0 ? '"' : "");
                    rs += "<td" + tmpv2 + classadd + styleadd + " > " + Util.nvl(Util.htmlEntities(cellValue), "") + "</td>";
                }
                dt += "<tr>" + rs + "</tr>";
            }
            dt = "<tbody>" + dt + "</tbody>";
            h = company + "<table class='paras paras'>" + dtitle + "</table>" +
                "<table>" + h + dt + "</table>"
            var newWin = window.open("");
            newWin.document.write(h);
            $("<link>", {rel: "stylesheet", href: "css/print.css"}).appendTo(newWin.document.head);
            setTimeout(function () {
                newWin.print();
            }, 1000);
        };

        QueryView.prototype.selectGroup = function (grp, startRow) {
            if (this.mLctb.cols.length < 0) return;
            if (!this.mLctb.cols[0].mGrouped) return;

            var that = this;
            var end = startRow;
            var fc = that.mLctb.cols[0].mColName;
            var dt = this.mTable.getModel().getData();

            for (var i = startRow + 1; i < dt.length; i++) {
                if (dt[i][fc] != grp)
                    break;
                end++;
            }

            var slices = that.mTable.getSelectedIndices();
            var sel = (slices.indexOf(startRow) <= -1 ? false : true);

            if (sel)
                that.mTable.addSelectionInterval(startRow, end);
            else
                that.mTable.removeSelectionInterval(startRow, end);


        };

        QueryView.prototype.setViewSettings = function (vs, refresh) {
            this.mViewSettings = vs;
            if (refresh)
                this.loadData();

        }

        QueryView.prototype.applySettings = function () {
            if (this.mViewSettings == undefined)
                return;
            var fls = "";
            if (this.mViewSettings.filterStr != undefined) {
                var df = new DataFilter();
                df.filterString = this.mViewSettings.filterStr;
                df.doFilter(this.mLctb);
            } else {
                this.mLctb.rows = [];
                this.mLctb.rows = this.mLctb.masterRows.slice(0);
            }


        };
        return QueryView;
    }
);



