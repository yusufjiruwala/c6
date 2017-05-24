sap.ui.define("sap/ui/chainel1/util/generic/QueryView", ["./LocalTableData",],
    function (LocalTableData) {
        'use strict'
        function QueryView(tableId) {
            this.mJsonString = "";
            this.tableId = tableId;
            this.mTable = new sap.ui.table.Table(tableId, {
                visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                firstVisibleRow: 3,
                selectionMode: sap.ui.table.SelectionMode.Single,
                selectionBehavior: sap.ui.table.SelectionBehavior.Row,
                enableGrouping: true,
                footer: new sap.ui.commons.Label({text: "100.000"})

            });
            var that = this;
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
        }
        QueryView.prototype.constructor = QueryView;


        QueryView.prototype.setJsonStr = function (strJson) {
            this.mJsonString = strJson;
            this.mLctb.parse(strJson);
            this.mJosnObject = this.mLctb.getData();

        };


        QueryView.prototype.loadData = function () {
            //resetingg,
            var col = [];
            var cells = [];
            this.mTable.setEnableGrouping(false);
            for (var i = 0; i < this.mTable.getColumns().length; i++) {
                this.mTable.getColumns()[i].setGrouped(false);
                this.mTable.getColumns()[i].setSorted(false);
                this.mTable.getColumns()[i].setFiltered(false);
            }
            this.mTable.setEnableGrouping(false);


            this.mTable.destroyColumns();
            var dt = this.buildJsonData();
            for (var i = 0; i < this.mLctb.cols.length; i++) {

                var c = new sap.ui.table.Column(/*this.mLctb.cols[i].mColName.replace(" ", ""),*/ {
                    label: new sap.ui.commons.Label({text: this.mLctb.cols[i].mColName}),
                    template: new sap.ui.commons.Label().bindProperty("text", this.mLctb.cols[i].mColName),
                    width: "200px",
                });

                col.push(c);
                c.setMenu(null);
                this.mTable.addColumn(c);

            }
            this.col = col;
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(dt);
            this.mTable.setModel(oModel);
            this.mTable.bindRows("/");
            var that = this;

            if (this.mLctb.cols[0].mGrouped)
                this.mTable.getColumns()[0].setVisible(false);


            this.scroll = setInterval(function () {
                // that.mTable._oVSb.attachScroll(function () {
                //
                //     that.colorRows()
                // });
                //console.log('interval resume..');
                that.colorRows();
                $("#" + that.mTable.getId() + "-vsb").off("scroll");
                $("#" + that.mTable.getId() + "-vsb").scroll(function () {
                    // console.log('scrolling..');
                    that.colorRows();
                });
                // $("#" + that.mTable.getId() + "-vsb").scroll(function () {
                //     console.log('scrolling..');
                //     that.colorRows();
                // });
            }, 1000);


        };

        QueryView.prototype._sort = function (pCol) {
            this.mLctb.rows.sort(function (a, b) {
                var vl1 = a.cells[pCol].getValue();
                var vl2 = b.cells[pCol].getValue();
                if (vl1 < vl2)
                    return -1;
                if (vl1 > vl2)
                    return 1;
                return 0;
            })
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
            this.mLctb.cols[0].mGrouped = true;
            this.mLctb.cols[1].mGrouped = true;

            var headerg = {};
            var grpCol = "";

            if (this.mLctb.cols[0].mGrouped &&
                this.mLctb.cols.length > 1 &&
                this.mLctb.cols[1].mGrouped) {
                this.mLctb.setColumnMerge(0, 1);
                this._sort(0);
                var v = this.mLctb.cols[0].mColName;
                if (this.mLctb.cols.length > 1)
                    grpCol = this.mLctb.cols[1].mColName;

            }
            var o = this.mLctb.getData(true);

            var footer = {};
            var footerg = {};

            var cnt = 0;
            var grp = "";
            var t;

            for (var i = 0; i < o.length; i++) {
                cnt = 0;
                for (var v in o[i]) {
                    if (cnt === 0) {
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
                        footerg[v] = (footerg[v] == undefined ? 0 : footerg[v]) + o[i][v];
                        footer[v] = (footer[v] == undefined ? 0 : footer[v]) + o[i][v];
                    }
                    else {
                        footer[v] = "";
                        footerg[v] = "";
                    }
                    cnt++;
                }

                if (i > o.length - 2) {
                    o.splice(i + 1, 0, footerg);
                    grp = o[i][t];
                    t = null;
                    ++i;
                    footerg = {};
                    break;
                }

                if (t != undefined && i + 1 < o.length && grp != o[i + 1][t]) {
                    var nxt = o[i + 1][t];
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
            o.push(footer);
            return o;

        };

        QueryView.prototype.colorRows = function () {
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

            var currentRowContext;
            for (var i = 0; i < rowCount; i++) {

                currentRowContext = this.mTable.getContextByIndex(rowStart + i);
                (this.mTable.getRows()[i]).$().removeClass("yellow");
                (this.mTable.getRows()[i]).$().removeClass("qrGroup");
                this.mTable.getRows()[i].getCells()[0].$().parent().parent().removeAttr("colspan");

                for (var j = 0 + cellAdd; j < cellsCount; j++) {
                    this.mTable.getRows()[i].getCells()[j - cellAdd].$().parent().parent().removeClass("yellow");
                    this.mTable.getRows()[i].getCells()[j - cellAdd].$().parent().parent().removeClass("qrGroup");
                }
                var cellValue = oModel.getProperty(this.mLctb.cols[0].mColName, currentRowContext);

                if (cellValue != undefined && cellValue.startsWith(String.fromCharCode(4095))) {
                    for (var k = 0 + cellAdd; k < cellsCount; k++) {
                        var cv = oModel.getProperty(this.mLctb.cols[k].mColName, currentRowContext);
                        if (cv != undefined && typeof cv == "number")
                            this.mTable.getRows()[i].getCells()[k - cellAdd].$().parent().parent().addClass("yellow");

                    }
                }
                if (cellValue != undefined && cellValue.startsWith(String.fromCharCode(4094))) {
                    this.mTable.getRows()[i].getCells()[0].$().addClass("qrGroup");
                    this.mTable.getRows()[i].getCells()[0].$().parent().parent().attr("colspan", (cellAdd+1) + "");
                }

            }

        };
        QueryView.prototype.printHtml = function () {
            var h = "", dt = "", rs = "";           // table header data
            var oData = this.mTable.getModel().getData();
            var tmpv1 = "", tmpv2 = "", tmpv3 = "";
            var cellValue = "";
            var grouped = this.mLctb.cols[0].mGrouped;
            var cnt = 0;

            h = ""
            cnt == 0;
            for (var c in this.col) {
                cnt++;
                if (cnt - 1 == 0 && grouped) continue;
                if (cnt - 1 === this.col.length) continue;
                tmpv1 = this.col[c].getLabel().getText();
                tmpv2 = "\"text-align:" + this.col[c].getHAlign().toLowerCase() + "\"";
                h += "<th " + tmpv2 + ">" + tmpv1 + "</th>";
            }

            h = "<thead><tr>" + h + "</tr></thead>";

            var t;
            for (var i = 0; i < oData.length; i++) {
                rs = "";
                cnt = 0;
                tmpv2 = "", tmpv3 = "";
                for (var v in oData[i]) {
                    cnt++;
                    if (cnt - 1 == 0) t = v;   // get 1st array key.. to find this row is summary/group
                    if (cnt - 1 === 0 && grouped) continue;
                    if (cnt - 1 === this.mLctb.cols.length) break;
                    cellValue = oData[i][v];
                    if (cellValue != undefined && cellValue + "".trim().length > 0 && oData[i][t].startsWith(String.fromCharCode(4095))) {
                        tmpv2 = " class=\"yellow\" "
                    }
                    if (cellValue != undefined && oData[i][t].startsWith(String.fromCharCode(4094))) {
                        tmpv2 = " class=\"qrGroup\" colspan=\""+(this.mLctb.cols.length-1)+"\""
                    }

                    // tmpv2 = (cell.$().css("align") === undefined ? "" : "\"text-align:" + cell.$().css("align") + "\"");
                    // tmpv3 = "class=" + (cell.$().parent().parent().hasClass("qrGroup") ? "qrGroup" : "") +
                    //     (cell.$().parent().parent().hasClass("yellow") ? "yellow" : "");
                    // tmpv3 = (tmpv3 === "class=" ? "" : tmpv3);


                    rs += "<td" + tmpv2 + tmpv3 + " > " + Util.nvl(cellValue, "") + "</td>";
                }
                dt += "<tr>" + rs + "</tr>";
            }
            dt = "<tbody>" + dt + "</tbody>";
            h = "<table>" + h + dt + "</table>"
            var newWin = window.open("");
            newWin.document.write(h);
            $("<link>", {rel: "stylesheet", href: "css/print.css"}).appendTo(newWin.document.head);
            setTimeout(function () {
                newWin.print();
            }, 1000);
        };


        return QueryView;
    }
)
;



