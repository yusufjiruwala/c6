sap.ui.define(["./LocalTableData", "./Parameter"],
    function (LocalTableData, Parameter) {
        'use strict'
        function DataFilter() {
            this.fields = [];
            this.params = [];
            this._filterString = "";
            this.data = null;
            this.dlmFieldName = /[A-Za-z ]+/;
            this.dlmOp = ["&&", "||"];
            this.dlmConditionalOp = ["!=", "<>", ">=", "<=", "%%", "@@", ">", "<", "="];
            this.dlmConitionalOpR = ["!=", ">=", "<=", "%%", "@@", ">", "<", "="];

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
                this.buildDataStructure();
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

                var s = Util.getParsedJsonValue(r.cells[cp].getValue(),true);
                if (typeof s == "number" && typeof fv1 == "string")
                    fv1 = parseFloat(fv1);
                if (pm.operator == "=")
                    if (fv1 == s)
                        fnd++;
                if (pm.operator == "%%" || pm.operator == "%")
                    if ((s + "").toLowerCase().indexOf((fv1 + "").toLowerCase()) >= 0)
                        fnd++;
                if (pm.operator == ">")
                    fnd += (s > fv1 ? 1 : 0);
                if (pm.operator == "<")
                    fnd += (s < fv1 ? 1 : 0);
                if (pm.operator == ">=")
                    fnd += (s >= fv1 ? 1 : 0);
                if (pm.operator == "<=")
                    fnd += (s <= fv1 ? 1 : 0);
                if (pm.operator == "!=")
                    fnd += (s != fv1 ? 1 : 0);
                if (pm.operator == "<>")
                    fnd += (s != fv1 ? 1 : 0);

            }
            if (fnd == no_of_find)
                result = true;
            else
                result = false;
            return result;
        };
        DataFilter.prototype.doFilter = function (pLctb) {
            if (this._filterString == "") {
                pLctb.rows = [];
                pLctb.rows = pLctb.masterRows.slice(0);
                return;
            }
            pLctb.rows = [];
            var no_of_fnd = 0;
            for (var i = 0; i < this.params.length; i++) {
                if (this.params[i].value.toString().length > 0) {
                    no_of_fnd++;
                }
            }
            if (no_of_fnd == 0) {
                pLctb.rows = [];
                pLctb.rows = pLctb.masterRows.slice(0);
                return;
            }
            var fnd = 0;
            var r;
            var s = "";
            var fv1 = "", fv2 = "";
            for (var i = 0; i < pLctb.masterRows.length; i++) {
                fnd = 0;
                r = pLctb.masterRows[i];
                for (var j = 0; j < this.params.length; j++) {
                    if (this.canFilterRow(r, pLctb))
                        pLctb.rows.push(r);
                }
            }
        };
        DataFilter.prototype.buildDataStructure = function () {
            this.init();
            if (this._filterString.length <= 0)
                return;
            var ss = Util.splitString(this._filterString, this.dlmOp);
            for (var i = 0; i < ss.length; i++) {
                var s = ss[i];
                var mv = Util.matchArray(s, this.dlmConitionalOpR);
                var vl = Util.splitString(ss[i], this.dlmConditionalOp);

                if (vl.length == 0 || vl[0] == ss[i] || vl.length > 2) {
                    console.error("cant parse -->" + ss[i]);
                    return;
                }
                var pm = new Parameter(vl[0].trim());
                pm.name = vl[0].trim();

                pm.value = "";
                if (vl.length == 2)
                    pm.value = vl[1].trim();
                pm.operator = mv[0];
                this.params.push(pm);
            }
        };
        return DataFilter;
    });



