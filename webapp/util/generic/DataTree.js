sap.ui.define("sap/ui/chainel1/util/generic/DataTree", ["./LocalTableData"],
    function (LocalTableData) {
        'use strict';

        function DataTree() {
            this.mLcTb = null;
            this.mColParent = "";
            this.mColTitle = "";
            this.mColCode = "";
            this.mapNodes = {};
            this.mTreeId = "";
            this.mTree = null;

        };

        // DataTree.create = function (lctb) {
        //     var d = new DataTree();
        //     d.mLcTb = lctb;
        //     return d;
        // };
        DataTree.create = function (treeId, lctb, colCode, colTitle, colParent) {
            var d = new DataTree();
            d.mLcTb = lctb;
            d.mColCode = colCode;
            d.mColParent = colParent;
            d.mColTitle = colTitle;
            d.mTreeId = treeId;
            return d;
        }
        DataTree.prototype.constructor = DataTree;

        DataTree.prototype.loadData = function () {


            var items = this.mLcTb.getData(true);
            if (items == null)
                return;
            var itemsByID = [];
            var columns = [];
            var lastParent = "";
            var lastParentNode = null;
            var rootNode = null;

            for (var i = 0; i < this.mLcTb.rows.length; i++) {
                var current_parent = "";
                var current_code = this.mLcTb.getFieldValue(i, this.mColCode) + "";
                var current_title = this.mLcTb.getFieldValue(i, this.mColTitle) + "";
                current_parent = this.mLcTb.getFieldValue(i, this.mColParent) + "";
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
                for (var k = 0; k < this.mLcTb.cols.length; k++) {
                    v += (v.length == 0 ? "" : ",") + '"' +
                        this.mLcTb.cols[k].mColName + '":"' +
                        this.mLcTb.getFieldValue(i, this.mLcTb.cols[k].mColName) + '"';
                }
                v=v.replace(/\\/g,"\\\\");
                oNode1 = JSON.parse("{" + v + "}");
                if (rootNode == null || rootNode == undefined) {
                    itemsByID.push(oNode1);
                }
                else {
                    rootNode["childeren_" + i] = oNode1;
                }
                this.mapNodes[current_code] = oNode1;
            }
            columns = [];
            for (var k = 0; k < this.mLcTb.cols.length; k++) {
                var w="200px";
                columns.push(new sap.ui.table.Column({
                    label: this.mLcTb.cols[k].mColName,
                    template: this.mLcTb.cols[k].mColName,
                    width:w
                }));
            }
            if (!this.mTree) {
                this.mTree = new sap.ui.table.TreeTable(this.mTreeId, {
                    columns: columns,
                    selectionMode: sap.ui.table.SelectionMode.Single,
                    enableColumnReordering: true,
                    expandFirstLevel: true,
                    visibleRowCountMode:sap.ui.table.VisibleRowCountMode.Auto
                });

            } else {
                this.mTree.setModel(null);
            }

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(itemsByID);
            this.mTree.setModel(oModel);
            this.mTree.bindRows("/");
        };


        DataTree.prototype.loadData_1 = function () {
            var items = this.mLcTb.getData(true);
            if (items == null)
                return;
            var itemsByID = [];
            items.forEach(function (item) {
                var p = this.getParentRowId()

                itemsByID[item._rowid] = {
                    data: {title: item.title},
                    children: [],
                    parentID: item.parentcode
                };
            });
            console.log(itemsByID);
            itemsByID.forEach(function (item) {
                if (item.parentID !== null) {
                    itemsByID[item.parentID].children.push(item);
                }
            });

            var roots = itemsByID.filter(function (item) {
                return (item.parentID === null || item.parentID == 'undefined');
            });
            itemsByID.forEach(function (item) {
                delete item.parentID;
            });

            console.log(roots);
        };


        DataTree.prototype.loadData_deprecated = function () {
            if (!this.mTree)
                this.mTree = new sap.ui.commons.Tree();
            this.mTree.destroyNodes();
            var lastParent = "";
            var lastParentNode = null;
            var rootNode = null;
            for (var i = 0; i < this.mLcTb.rows.length; i++) {
                var current_parent = "";
                var current_code = this.mLcTb.getFieldValue(i, this.mColCode) + "";
                var current_title = this.mLcTb.getFieldValue(i, this.mColTitle) + "";
                current_parent = this.mLcTb.getFieldValue(i, this.mColParent) + "";
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
                if (rootNode == null) {
                    oNode1 = new sap.ui.commons.TreeNode("node" + i, {text: this.mLcTb.getFieldValue(i, this.mColTitle)});
                    this.mTree.addNode(oNode1);
                }
                else {
                    oNode1 = new sap.ui.commons.TreeNode("node" + i, {text: this.mLcTb.getFieldValue(i, this.mColTitle)});
                    rootNode.addNode(oNode1);
                }
                this.mapNodes[current_code] = oNode1;
                //this.mTree.addNode(oNode1);
            }
        };

        DataTree.prototype.findNodebyVal = function (id) {
            //
            //var nodes=this.mTree.getNodes();
            //for(var i=0;i<nodes.length;i++) {
            //    console.log(nodes[i]);
            //}
            //return null;
            return this.mapNodes[id];
        };

        return DataTree;
    });