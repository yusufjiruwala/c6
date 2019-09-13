sap.ui.define("sap/ui/ce/generic/SelectTextRenderer", ["sap/m/Input", "sap/m/InputRenderer", 'sap/ui/Device'],
    function (Input, InputRenderer, Device) {

        var SelectTextRenderer = InputRenderer.extend('SelectTextRenderer', {
                writeInnerContent: function (oRm, oControl) {
                    oRm.write("aaa");
                }
            });
        return SelectTextRenderer;
    }
);