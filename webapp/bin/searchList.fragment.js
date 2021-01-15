sap.ui.jsfragment("bin.searchList", {

    createContent: function (oController) {
        oModel = sap.ui.getCore().getModel("searchList");
        var that = this;
        var txtTitle = "{" + oController.colDes + "}-{" + oController.colVal + "}";
        if (oController.showOnlyTitle || (oController.colDes == oController.colVal))
            txtTitle = "{" + Util.nvl(oController.colDes, "TITLE") + "}";
        this.setModel(oModel, "data");
        var oTempl = new sap.m.StandardListItem({
            title: txtTitle,
            active: true,
            customData: {key: "{" + Util.nvl(oController.colVal, "CODE") + "}"}
        });

        var oDlg = new sap.m.SelectDialog({
            title: "",
            type: "Active",
            liveChange: [oController.frag_liveChange, oController],
            confirm: [oController.frag_confirm, oController]
        });

        oDlg.bindAggregation("items", "/", oTempl);
        oDlg.setModel(oModel);
        return oDlg;
    }
});



