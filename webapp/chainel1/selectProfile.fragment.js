sap.ui.jsfragment("chainel1.selectProfile", {

    createContent: function (oController) {
        oModel = sap.ui.getCore().getModel("profiles");
        this.setModel(oModel,"profiles");
        var oTempl = new sap.m.StandardListItem({
            title: "{profiles>name}",
            active: true,
            customData:{key:"{profiles>code}"}
        });

        var oDlg = new sap.m.SelectDialog({
            title: "",
            type: "Active",
            liveChange:[oController.frag_liveChange,oController],
            confirm:[oController.frag_confirm,oController],
        });

        oDlg.bindAggregation("items", "profiles>/list", oTempl);
        oDlg.setModel(oModel);
        return oDlg;
    }
});



