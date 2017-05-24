sap.ui.define("sap/ui/chainel1/util/generic/QueryView6", ["./LocalTableData",],
    function (LocalTableData) {
        'use strict'
        function QueryView6(tableId) {

            this.mJsonString = "";
            this.tableId = tableId;
            jQuery.sap.require("sapui6.ui.table.Table-dbg");
            this.mTable = new sapui6.ui.table.Table(tableId, {
                mergeColumnIndex: 1,
                rowBorderStyle: "outset",
                resize: true
            });

            this.mJsonString = "";
            this.mLctb = new LocalTableData();

        }

        this._sizedOnce = false;
        QueryView6.prototype.stat = 0;
        QueryView6.create = function (tableId, jsonStr) {
            var q = new QueryView6(tableId);
            q.tableId = tableId;
            q.mJsonString = jsonStr;
            q.mLctb.parse(jsonStr);
            q.mJsonObject = q.mLctb.getData();
            return q;
        }
        QueryView6.prototype.constructor = QueryView6;


        QueryView6.prototype.setJsonStr = function (strJson) {
            this.mJsonString = strJson;
            this.mLctb.parse(strJson);
            this.mJosnObject = this.mLctb.getData();

        };


        QueryView6.prototype.loadData = function () {
            //resetingg,
            jQuery.sap.require("sapui6.ui.table.Table-dbg");
            var col = [];

            // if (this._sizedOnce==true){
            //     $(document.getElementById(this.mTable.getId()).parentElement).css("height","100%");
            //     $(document.getElementById(this.mTable.getId()).parentElement).css("width","100%");
            //     console.log('sized 2');
            //     console.log($(document.getElementById(this.mTable.getId())));
            // }
            // this._sizedOnce=true;
            // console.log('once sized');
            // if (this.stat > 0) {

            //
            if (this._sizedOnce == true) {
                this.mTable.deleteColumns(0);

                for (var i = this.mTable.getRowCount(); i > -1; i--)
                    this.mTable.deleteRow(i - 1);

                this.mTable.removeAllAggregation("rows");
                this.mTable.removeAllAggregation("columns");

            }
            this._sizedOnce = true;
            // }

            // if (this.stat > 0) {
            //     this.mTable.getModel().setData(null);
            //     this.mTable.getModel().updateBindings(true);
            // }

            for (var i = 0; i < this.mLctb.cols.length; i++) {
                //var tmp = new sap.ui.commons.Link({text: "{" + this.mLctb.cols[i].mColName + "}"});
                var c = new sapui6.ui.table.Column({
                    title: this.mLctb.cols[i].mColName,
                    //  template: tmp,
                    path: this.mLctb.cols[i].mColName,
                    width: "200px",
                    align: "right",
                    showGroupMenuEntry: true,
                    showFilterMenuEntry: true,
                    showSortMenuEntry: true

                });

                this.mTable.addColumn(c);
                col.push(c);
                // cells.push(
                //     new sap.m.Text({
                //         text: "{" + this.mLctb.cols[i].mColName + "}"
                //     }));
            }
            //this.mTable.bindAggregation("columns",c);
            var oModel;
            if (this.stat > 0) {
                oModel = this.mTable.getModel();
                oModel.setData(this.mLctb.getData());
                // oModel.updateBindings(true);
                //oModel.refresh(true);
            } else {

                oModel = new sap.ui.model.json.JSONModel(this.mLctb.getData());
                this.mTable.setModel(oModel);
                this.mTable.bindRows("/");
                this.stat++;
            }


        };
        QueryView6.prototype.printHtml = function () {
            var e = document.getElementById(this.mTable.getId() + "_ht"); // header table
            var te = document.getElementById(this.mTable.getId() + "_dt"); // table data..

            // table header
            var cg = e.getElementsByTagName("colgroup");
            var th = e.getElementsByTagName("thead")[0];
            var thr = e.getElementsByTagName("tr");

            // table data..
            var tth = te.getElementsByTagName("tbody")[0];
            var tthr = te.getElementsByTagName("tr");

            var tb = document.createElement("table");

            tb.setAttribute("id", "t1");
            //colgroups...
            for (var i = 0; i < cg.length; i++) {
                tb.appendChild($(cg[i]).clone().get(0));
            }
            //th...
            var mp = {};
            for (i = 0; i < thr.length; i++) {
                var tmp2 = thr[i].cloneNode(true);
                this.cleanElement(tmp2, thr[i], mp);
                this.clearAttrOnEvents(tmp2);
                tb.appendChild(tmp2);
            }

            var keepStyles = {
                "textAlign": "",
                "borderRightStyle": "solid",
                "borderLeftStyle": "solid",
                "borderRightColor": "rgb(128,128,128) !important",
                "borderLeftColor": "rgb(128,128,128)  !important",
                "borderTopStyle": "solid",
                "borderBottomStyle": "solid",
                "borderTopColor": "rgb(128,128,128) !important",
                "borderBottomColor": "rgb(128,128,128) !important"
            };

            mp = {}
            for (i = 0; i < tthr.length; i++) {
                var tmp2 = tthr[i].cloneNode(true);
                this.cleanElement(tmp2, tthr[i], mp);
                this.clearAttrOnEvents(tmp2);
                tb.appendChild(tmp2);
            }

            console.log(tb);

            var newWin = window.open("");
            newWin.document.write(tb.outerHTML);
            newWin.print();
            //newWin.close();
            //bd.appendChild(tb);


        };

        QueryView6.prototype.cleanElement = function (el, src, mp) {
            if (el === undefined) return;
            if (el.attributes === undefined) return;
            var ret = null;
            // for (var i = 0; i < el.childNodes.length; i++)
            //     while (el.childNodes[i].length > 0) {
            //         ret = this.cleanElement(el.childNodes[i].childNodes[0], src.childNodes[i].childNodes[0]);
            //         break;
            //     }

            for (var i = 0; i < el.childNodes.length; i++)
                if (el.childNodes[i].childNodes.length > 0)
                    ret = this.cleanElement(el.childNodes[i].childNodes[0], src.childNodes[i].childNodes[0]);
                else
                    this.cleanElement(el.childNodes[0], src.childNodes[0]);
            //
            //     }
            // }
            //mp[el]= src;
            this.clearAttrOnEvents(el);
            // if (ks) {
            // var st = $(src).getStyleObject();//Util.css($(el));//Util.cloneObj(el.style);                    // keeping default styles in ks and latter applying it back after clean
            // console.log(st);

            $(el).removeAttr("class");
            $(el).removeAttr("style");

            Util.copyComputedStyle(src, el);
            // for (var s in st)
            //     el.style[s] = st[s];
            return el;


        };

        QueryView6.prototype.clearAttrOnEvents = function (el) {
            for (var i = 0; i < el.attributes.length; i++) {
                if (el.attributes[i].name.startsWith('on')) {
                    $(el).removeAttr(el.attributes[i].name);
                }
            }
        };

        return QueryView6;
    }
);



