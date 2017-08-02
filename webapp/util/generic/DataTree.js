sap.ui.define("sap/ui/chainel1/util/generic/DataTree", ["./LocalTableData"],
    function (LocalTableData) {
        'use strict';

        function DataTree(id, pmode) {

            this.mLctb = null;
            this.mColParent = "";
            this.mColTitle = "";
            this.mColCode = "";
            this.mColChild = "";
            this.mColPath = "";
            this.mapNodes = {};
            this.mTreeId = id;
            this.mColLevel = 0;
            this.mode = sap.ui.table.SelectionMode.Single;

            if (pmode == "MultiToggle")
                this.mode = sap.ui.table.SelectionMode.MultiToggle;

            this.mTree = new sap.ui.table.TreeTable(this.mTreeId, {
                selectionMode: this.mode,
                enableColumnReordering: true,
                expandFirstLevel: true,
                visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                mode: sap.m.ListMode.SingleSelectMaster
            });

        };
        DataTree.create = function (treeId, lctb, colCode, colTitle, colParent) {
            var d = new DataTree(treeId);
            d.mLctb = lctb;
            d.mColCode = colCode;
            d.mColParent = colParent;
            d.mColTitle = colTitle;
            d.mTreeId = treeId;
            return d;
        }

        DataTree.prototype.setJsonStr = function (jsonStr) {
            if (this.mLctb == undefined)
                this.mLctb = new LocalTableData();
            this.mLctb.parse(jsonStr);
            this.setTreeColsType();

        }

        DataTree.prototype.constructor = DataTree;

        DataTree.prototype.loadData = function () {


            this.columns = [];
            this.mTree.removeAllColumns();
            this.mTree.removeAllRows();
            this.mTree.destroyColumns();
            this.mTree.destroyRows();
            var dt = this.buildJsonData();

            for (var k = 0; k < this.mLctb.cols.length; k++) {
                var cc = this.mLctb.cols[k];
                var a = cc.getMUIHelper().display_align;
                if (cc.getMUIHelper().display_format == "MONEY_FORMAT")
                    a = "end";
                if (cc.getMUIHelper().display_format == "QTY_FORMAT")
                    a = "center";

                var w = (isNaN(this.mLctb.cols[k].getMUIHelper().display_width) ? "auto" : this.mLctb.cols[k].getMUIHelper().display_width + "px");
                var c = new sap.ui.table.Column({

                        label: new sap.m.Label({text: cc.mTitle}),
                        template: new sap.ui.commons.TextView({
                            "text": "{" + this.mLctb.cols[k].mColName + "}",
                            textAlign: Util.getAlignTable(a)
                        }),
                        //     label: this.mLctb.cols[k].mColName,
                        // template: this.mLctb.cols[k].mColName,
                        width: w,
                        filterProperty: this.mLctb.cols[k].mColName,
                        sortProperty: this.mLctb.cols[k].mColName,
                        customData: {
                            key: this.mColCode
                        }
                        ,
                    })
                    ;
                this.columns.push(c);
                this.mTree.addColumn(c);
                if (this.mLctb.cols[k].mHideCol)
                    c.setVisible(false);
            }

            this.mTree.setModel(null);


            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(dt);
            this.mTree.setModel(oModel);
            this.mTree.bindRows("/");
            oModel.updateBindings(true);

            var that = this;
            this.scroll = setInterval(function () {

                that.colorRows();
                $("#" + that.mTree.getId() + "-vsb").off("scroll");
                $("#" + that.mTree.getId() + "-vsb").scroll(function () {
                    that.colorRows();
                });

            }, 500);


        };


        DataTree.prototype.findNodebyVal = function (id) {

            return this.mapNodes[id];
        };

        DataTree.prototype.buildJsonData = function () {

            if (this.mLctb.cols.length == 0)
                return null;

            var items = this.mLctb.getData();
            if (items == null)
                return;
            this.mapNodes = [];
            var itemsByID = [];
            var columns = [];
            var lastParent = "";
            var lastParentNode = null;
            var rootNode = null;
            var footer = {};

            var sett = sap.ui.getCore().getModel("settings").getData();
            var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
            var dfq = new DecimalFormat(sett["FORMAT_QTY_1"]);
            var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
            this.minLevel = (this.mColLevel.length > 0 && this.mLctb.rows.length) > 1 ? parseInt(this.mLctb.getFieldValue(0, this.mColLevel)) : 0;

            for (var i = 0; i < this.mLctb.rows.length; i++) {

                var current_parent = "";
                var current_code = this.mLctb.getFieldValue(i, this.mColCode) + "";
                var current_title = this.mLctb.getFieldValue(i, this.mColTitle) + "";
                current_parent = this.mLctb.getFieldValue(i, this.mColParent) + "";
                if (current_parent.length > 0) {
                    if (lastParent == current_parent)
                        rootNode = lastParentNode;
                    else {
                        rootNode = this.findNodebyVal(current_parent);
                        lastParent = current_parent;
                        lastParentNode = rootNode;
                    }
                }
                else
                    rootNode = null;
                var oNode1 = null;
                var v = "";
                for (var k = 0; k < this.mLctb.cols.length; k++) {
                    var vl = this.mLctb.getFieldValue(i, this.mLctb.cols[k].mColName);
                    var lvl = -1;
                    if (this.mColLevel.length > 0)
                        lvl = this.mLctb.getFieldValue(i, this.mColLevel);

                    vl = (Util.nvl(vl, "") + "").replace(/\"/g, "'").replace(/\n/, "\\r").replace(/\r/, "\\r").replace(/\\/g, "\\\\").trim();

                    if (this.mLctb.cols[k].mSummary == "SUM" && lvl == this.minLevel) {
                        var cn = this.mLctb.cols[k].mColName;
                        footer[cn] = (footer[cn] == undefined ? 0 : footer[cn]) + parseFloat(vl);
                    }

                    if (this.mLctb.cols[k].getMUIHelper().data_type == "NUMBER" &&
                        this.mLctb.cols[k].getMUIHelper().display_format == "MONEY_FORMAT") {
                        vl = df.format(parseFloat(vl));
                    }
                    if (this.mLctb.cols[k].getMUIHelper().data_type == "NUMBER" &&
                        this.mLctb.cols[k].getMUIHelper().display_format == "QTY_FORMAT") {
                        s
                        vl = df.format(parseFloat(vl));
                    }
                    if (this.mLctb.cols[k].getMUIHelper().data_type == "DATE" &&
                        this.mLctb.cols[k].getMUIHelper().display_format == "SHORT_DATE_FORMAT") {
                        var dt = new Date(vl);
                        vl = sf.format(dt);
                    }


                    v += (v.length == 0 ? "" : ",") + '"' +
                        this.mLctb.cols[k].mColName + '":"' +
                        vl + '"';


                }
                //v = v.replace(/\\/g, "\\\\");
                oNode1 = JSON.parse("{" + Util.nvl(v, "") + "}");
                if (rootNode == null || rootNode == undefined) {
                    itemsByID.push(oNode1);
                }
                else {
                    rootNode["childeren_" + i] = oNode1;
                }
                this.mapNodes[current_code] = oNode1;
            }
            //this.mTree.setFixedBottomRowCount(-1);
            if (footer != {}) {
                for (var f in footer) {
                    if (this.mLctb.getColByName(f).getMUIHelper().display_format == "MONEY_FORMAT")
                        footer[f] = df.format(footer[f]);
                    if (this.mLctb.getColByName(f).getMUIHelper().display_format == "QTY_FORMAT")
                        footer[f] = df.format(footer[f]);
                }

                itemsByID.push(footer);
                this.mTree.setFixedBottomRowCount(1);
            }
            return itemsByID;

        };

        DataTree.prototype.colorRows = function () {
            if (this.mLctb.cols.length <= 0)                return;
            var oModel = this.mTree.getModel();
            var rowCount = this.mTree.getVisibleRowCount(); //number of visible rows
            var rowStart = this.mTree.getFirstVisibleRow(); //starting Row index
            var cellsCount = this.mLctb.cols.length;

            if (document.getElementById(this.mTree.getId()).offsetParent == null || rowCount == 0) {
                if (this.scroll != undefined) clearInterval(this.scroll);
                console.log('stopped interval scroll..');
                return;
            }
            var currentRowContext;
            for (var i = 0; i < rowCount; i++) {

                currentRowContext = this.mTree.getContextByIndex(rowStart + i);
                (this.mTree.getRows()[i]).$().removeClass("qtFirstLevel");
                (this.mTree.getRows()[i]).$().removeClass("qtSecondLevel");
                var cellValue = oModel.getProperty(this.mColLevel, currentRowContext);
                if (cellValue == this.minLevel)
                    (this.mTree.getRows()[i]).$().addClass("qtFirstLevel");
                if (cellValue == this.minLevel + 1)
                    (this.mTree.getRows()[i]).$().addClass("qtSecondLevel");

            }


        };

        DataTree.prototype.setTreeColsType = function () {

            for (var i = 0; i < this.mLctb.cols.length; i++) {
                if (this.mLctb.cols[i].mQtreeType == "CODE")
                    this.mColCode = this.mLctb.cols[i].mColName;
                if (this.mLctb.cols[i].mQtreeType == "TITLE")
                    this.mColTitle = this.mLctb.cols[i].mColName;
                if (this.mLctb.cols[i].mQtreeType == "LEVEL")
                    this.mColLevel = this.mLctb.cols[i].mColName;
                if (this.mLctb.cols[i].mQtreeType == "PATH")
                    this.mColpath = this.mLctb.cols[i].mColName;
                if (this.mLctb.cols[i].mQtreeType == "PARENT")
                    this.mColParent = this.mLctb.cols[i].mColName;
                if (this.mLctb.cols[i].mQtreeType == "CHILDCOUNT")
                    this.mColChild = this.mLctb.cols[i].mColName;
            }
        };
        DataTree.prototype.printHtml = function () {
            if (this.mLctb.cols.length <= 0) return;
            var h = "", dt = "", rs = "";
            var oData = this.mTree.getModel().getData();
            var tmpv1 = "", tmpv2 = "", tmpv3 = "";
            var cellValue = "";

            h = ""
            for (var c in this.columns) {
                if (!this.columns[c].getVisible()) continue;
                tmpv1 = this.columns[c].getLabel().getText();
                tmpv2 = "\"text-align:" + this.columns[c].getHAlign().toLowerCase() + "\"";
                h += "<th " + tmpv2 + ">" + tmpv1 + "</th>";
            }

            h = "<thead><tr>" + h + "</tr></thead>";
            this.childCount = 0;
            dt = this.getTbHtml(oData, 0);
            dt = "<tbody>" + dt + "</tbody>";
            h = "<table>" + h + dt + "</table>"
            var newWin = window.open("");
            newWin.document.write(h);
            $("<link>", {rel: "stylesheet", href: "css/print.css"}).appendTo(newWin.document.head);
            setTimeout(function () {
                newWin.print();
            }, 1000);
        };

        DataTree.prototype.getTbHtml = function (oData, startRow) {
            var tmpv1 = "", tmpv2 = "", tmpv3 = "";
            var cellValue = "", rs = "", dt = "", rw = "";
            var cnt = 0;
            for (var i = 0; i < oData.length; i++) {
                //for (var i = 0; i < this.mLctb.rows.length; i++) {
                cnt = 0;
                rs = tmpv2 = tmpv3 = rw = "";
                for (var v in oData[i]) {
                    if (!v.startsWith("childeren_") && this.mLctb.getColByName(v).mHideCol) continue;
                    if (v.startsWith("childeren_")) {
                        rw += (this.mTree.isExpanded(i) ? this.getTbHtml([oData[i][v]], i) : "");
                    }
                    else {
                        var l = (oData[i][this.mColLevel] - (this.minLevel - 1)) * 1;   // get count of spaces b4 first column
                        cellValue = (cnt++ == 0 ? Util.charCount(String.fromCharCode(4095), l) + (l > 1 ? "\u25BA" : "\u25BC") : "" ) + oData[i][v];
                        tmpv2 = (oData[i][this.mColLevel] == this.minLevel ? " class=\"qtFirstLevel\""
                            : (oData[i][this.mColLevel] == this.minLevel + 1 ? " class=\"qtSecondLevel\"" : ""));
                        rs += "<td" + tmpv2 + tmpv3 + " > " + Util.nvl(cellValue, "") + "</td>";
                    }
                }
                if (rw.length <= 0) {
                    dt += "<tr>" + rs + "</tr>";
                    this.childCount++;
                } else {
                    dt += "<tr>" + rs + "</tr>" + rw;
                    this.childCount++;
                }


            }
            return dt;
        }

        return DataTree;
    });


// DataTree.prototype.loadData_1 = function () {
//     var items = this.mLctb.getData(true);
//     if (items == null)
//         return;
//     var itemsByID = [];
//     items.forEach(function (item) {
//         var p = this.getParentRowId()
//
//         itemsByID[item._rowid] = {
//             data: {title: item.title},
//             children: [],
//             parentID: item.parentcode
//         };
//     });
//     console.log(itemsByID);
//     itemsByID.forEach(function (item) {
//         if (item.parentID !== null) {
//             itemsByID[item.parentID].children.push(item);
//         }
//     });
//
//     var roots = itemsByID.filter(function (item) {
//         return (item.parentID === null || item.parentID == 'undefined');
//     });
//     itemsByID.forEach(function (item) {
//         delete item.parentID;
//     });
//
//     console.log(roots);
// };


// DataTree.prototype.loadData_deprecated = function () {
//     if (!this.mTree)
//         this.mTree = new sap.ui.commons.Tree();
//     this.mTree.destroyNodes();
//     var lastParent = "";
//     var lastParentNode = null;
//     var rootNode = null;
//     for (var i = 0; i < this.mLctb.rows.length; i++) {
//         var current_parent = "";
//         var current_code = this.mLctb.getFieldValue(i, this.mColCode) + "";
//         var current_title = this.mLctb.getFieldValue(i, this.mColTitle) + "";
//         current_parent = this.mLctb.getFieldValue(i, this.mColParent) + "";
//         if (current_parent.length > 0) {
//             if (lastParent == current_parent)
//                 rootNode = lastParentNode;
//             else {
//                 rootNode = this.findNodebyVal(current_parent);
//                 lastParent = current_parent;
//                 lastParentNode = rootNode;
//             }
//         }
//         else
//             rootNode = null;
//         var oNode1 = null;
//         if (rootNode == null) {
//             oNode1 = new sap.ui.commons.TreeNode("node" + i, {text: this.mLctb.getFieldValue(i, this.mColTitle)});
//             this.mTree.addNode(oNode1);
//         }
//         else {
//             oNode1 = new sap.ui.commons.TreeNode("node" + i, {text: this.mLctb.getFieldValue(i, this.mColTitle)});
//             rootNode.addNode(oNode1);
//         }
//         this.mapNodes[current_code] = oNode1;
//         //this.mTree.addNode(oNode1);
//     }
// };