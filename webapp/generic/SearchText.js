sap.ui.define("sap/ui/ce/generic/SearchText", ["sap/m/Input"],
    function (Input) {
        return Input.extend('SearchTextField', {
            init: function () {
                this.setShowValueHelp(true);
            },

            renderer: {},

            onAfterRendering: function () {
                if (sap.m.Input.prototype.onAfterRendering) {
                    sap.m.Input.prototype.onAfterRendering.apply(this, arguments);
                }

                var icon = this._getValueHelpIcon();
                icon.setSrc("sap-icon://search");
                icon.setSize('1.25rem');
            }
        });

    }
);