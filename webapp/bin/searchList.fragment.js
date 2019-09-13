sap.ui.jsfragment("bin.searchList", {

    createContent: function (oController) {
        oModel = sap.ui.getCore().getModel("searchList");
        var that = this;
        this.setModel(oModel, "data");
        var oTempl = new sap.m.StandardListItem({
            title: "{" + oController.colDes + "}-{" + oController.colVal + "}",
            active: true,
            customData: {key: "{" + oController.colVal + "}"}
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



