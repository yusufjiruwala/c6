sap.ui.define(["./LocalTableData",],
    function (LocalTableData) {
        'use strict'
        function DataFilter() {
            this.fields = [];
            this.params = [];
            this._filterString = "";
            this.data = null;
            this.dlmFieldName = /[A-Za-z ]+/;
            this.dlmOp = ["&&", "||"];
            this.dlmConditionalOp = [">=", ">=", "<=", ">", "<", "=", "%%", "@@"];
            this.dlmConitionalOpR = /[>=,>=,<=,>,<,=,%%,@@]/;
            this.dlmFieldRangeOp = [".."];
            this.data = new LocalTableData();
            this.init();
        }

        DataFilter.create = function (data) {
            var d = new DataFilter();
            d.data = data;
            return d;
        }

        DataFilter.prototype.constructor = DataFilter;

        Object.defineProperty(DataFilter.prototype, "filterString", {
            get: function () {
                return this._filterString;
            },
            set: function (value) {
                this._filterString = value;
            },
            enumerable: true,
            configurable: true
        });
        DataFilter.prototype.init = function () {
            this.fields = [];
            this.params = [];
        };
        DataFilter.prototype.canFilterRow = function (r, datax) {
            var result = false;
            if (this._filterString.length == 0)
                return false;
            var no_of_find = 0;
            for (var i = 0; i < this.params.length; i++) {
                if (this.params[i].value != null && this.params[i].value.toString().length > 0) {
                    no_of_find++;
                }
            }
            var s = "", fv1 = "", fv2 = "";
            var fnd = 0;
            if (no_of_find == 0)
                return false;
            for (var i = 0; i < this.params.length; i++) {
                if (r == null) {
                    break;
                }
                var pm = this.params[i];
                fv1 = pm.value.toString();
                fv2 = pm.default_value.toString();
                var cp = datax.getColPos(pm.name);
                var s = r.cells[cp].getValue();
                if (pm.operator == "=")
                    if (fv1 == s)
                        fnd++;
            }
            if (fnd == no_of_find)
                result = true;
            else
                result = false;
            return result;
        };
        DataFilter.prototype.doFilter = function (datax) {
            if (this._filterString == "") {
                datax.rows = [];
                datax.rows = datax.masterRows.slice(0);
                return;
            }
            datax.rows = [];
            var no_of_fnd = 0;
            for (var i = 0; i < this.params.length; i++) {
                if (this.params[i].value.toString().length > 0) {
                    no_of_fnd++;
                }
            }
            if (no_of_fnd == 0) {
                datax.rows = [];
                datax.rows = datax.masterRows.slice(0);
                return;
            }
            var fnd = 0;
            var r;
            var s = "";
            var fv1 = "", fv2 = "";
            for (var i = 0; i < datax.masterRows.length; i++) {
                fnd = 0;
                r = datax.masterRows[i];
                for (var j = 0; j < this.params.length; j++) {
                    if (this.canFilterRow(r, datax))
                        datax.rows.push(r);
                }
            }
        };
        DataFilter.prototype.buildDataStructure = function () {
            this.init();
            if (this._filterString.length <= 0)
                return;
            var ss = Utils_1.Utils.splitString(this._filterString, this.dlmOp);
            for (var i = 0; i < ss.length; i++) {
                var s = ss[i];
                var mv = s.match(this.dlmConitionalOpR);
                var vl = Utils_1.Utils.splitString(ss[i], this.dlmConditionalOp);
                if (vl.length == 0 || vl[0] == ss[i] || vl.length > 2) {
                    console.error("cant parse -->" + ss[i]);
                    return;
                }
                var pm = new Parameter_1.Parameter(vl[0].trim());
                console.log("pm 1" + pm.name);
                pm.value = "";
                if (vl.length == 2)
                    pm.value = vl[1].trim();
                // if (mv[0]=="=" && vl.length>1 && vl[1].contains("..") ) {
                //     var vl2=Utils.splitString(vl[1],this.dlmFieldRangeOp);
                //     pm.value=vl2[0].trim();
                //     if (vl2.length>1)
                //         pm.default_value=vl2[1].trim();
                // }
                pm.operator = mv[0];
                this.params.push(pm);
                console.log(this.params);
            }
        };
        return DataFilter;
    });



