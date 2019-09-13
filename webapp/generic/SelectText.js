sap.ui.define("sap/ui/ce/generic/SelectText", ["sap/m/Input", "./SelectTextRenderer"],
    function (Input, SelectTextRenderer) {

        var SelectText = Input.extend('SelectText', {
            metadata: {
                properties: {
                    lookupModel: {
                        type: "sap.ui.model.json.JSONModel",
                        defaultValue: new sap.ui.model.json.JSONModel()
                    },
                    codeValue: {type: "string"},
                    currentSel: {type: "float", defaultValue: -1}
                }
            },
            init: function () {
                this.setShowValueHelp(true);
            },

            renderer: function (oRm, oControl) {
                SelectTextRenderer.render(oRm, oControl);

            },
            onAfterRendering: function () {
                if (sap.m.Input.prototype.onAfterRendering) {
                    sap.m.Input.prototype.onAfterRendering.apply(this, arguments);
                }
                var icon = this._getValueHelpIcon();
                icon.setSrc("sap-icon://slim-arrow-down");
                icon.setSize('1.25rem');
            },

            fireValueHelpRequest: function (evt) {
                var that = this;
                var data = this.getProperty("lookupModel").getData();
                if (data == undefined) return;
                var t = {
                    frag_liveChange: function (event) {
                        var val = event.getParameter("value");
                        var filter = new sap.ui.model.Filter("TITLE", sap.ui.model.FilterOperator.Contains, val);
                        var binding = event.getSource().getBinding("items");
                        binding.filter(filter);
                    },
                    frag_confirm: function (event) {
                        var val = event.getParameters().selectedItem.getTitle();
                        var valx = event.getParameters().selectedItem.getCustomData()[0];
                        that.setValue(valx.getKey());
                        //this.fnConfirm(valx, val);
                        // that.subs.athlet_code.setValue(valx.getKey());
                        // that.subs.athlet_name.setValue(val);
                    }
                };
                
                var oTempl = new sap.m.StandardListItem({
                    title: "{TITLE}-{CODE}",
                    active: true,
                    customData: {key: "{CODE}"}
                });

                var oDlg = new sap.m.SelectDialog({
                    title: "",
                    type: "Active",
                    liveChange: [t.frag_liveChange, t],
                    confirm: [t.frag_confirm, t]
                });

                oDlg.bindAggregation("items", "/", oTempl);
                oDlg.setModel(this.getProperty("lookupModel"));
                oDlg.open("");

            },

            fireChange: function (evt) {

            },
            setCodeValue: function (vl) {
                var ind = this._findIndexByCode(vl);
                if (ind <= -1)
                    ind = this._findIndexByCode(vl);
                this.setProperty("value", this._getTitleByIndex(ind), true);
                this.setProperty("currentSel", ind);
            },
            setValue: function (vl) {
                var ind = this._findIndexByBoth(vl);
                if (ind <= -1)
                    ind = this._findIndexByCode(vl);
                this.setProperty("value", this._getTitleByIndex(ind) + "-" + this._getCodeByIndex(ind), true);
                this.setProperty("codeValue", this._getCodeByIndex(ind), true);
                this.setProperty("currentSel", ind);
                // this._bCheckDomValue = true;
            },
            getValue: function () {
                var cs = this.getProperty("currentSel");
                if (cs <= -1)
                    return this.getProperty("value");
                return this._getTitleByIndex(cs) + "-" + this._getCodeByIndex(cs);
            },
            getRealValue: function () {
                var cs = this.getProperty("currentSel");
                if (cs <= -1)
                    return this.getProperty("value");
                var v = this._getCodeByIndex(cs);
                if (v == "") return this.getProperty("value");
                return v;
            },
            setCurrentSel: function (i) {
                this.setProperty("currentSel", i);

            },

            _findIndexByCode: function (vl) {
                var data = this.getProperty("lookupModel").getData();
                if (data == undefined) return -1;
                for (var i in data)
                    if (data[i].CODE == vl)
                        return parseFloat(i);
                return -1;

            },
            _findIndexByTitle: function (vl) {
                var data = this.getProperty("lookupModel").getData();
                if (data == undefined) return -1;
                for (var i in data)
                    if (data[i].TITLE == vl)
                        return parseFloat(i);
                return -1;

            },
            _findIndexByBoth: function (vl) {
                var data = this.getProperty("lookupModel").getData();
                if (data == undefined) return -1;
                for (var i in data)
                    if (data[i].TITLE + "-" + data[i].CODE == vl)
                        return parseFloat(i);
                return -1;

            },
            _getCodeByIndex: function (i) {
                var data = this.getProperty("lookupModel").getData();
                if (data == undefined) return "";
                if (i >= data.length || i < 0)
                    return "";
                return data[i].CODE;
            },
            _getTitleByIndex: function (i) {
                var data = this.getProperty("lookupModel").getData();
                if (data == undefined) return "";
                if (i >= data.length || i < 0)
                    return "";
                return data[i].TITLE;
            }
        });


        return SelectText;

    }
)
;