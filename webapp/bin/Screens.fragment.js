sap.ui.jsfragment("bin.Screens", {

    createContent: function (oController) {
        var oModel = sap.ui.getCore().getModel("screens");
        this.setModel(oModel, "data");
        var view=oController.getView();
        var tit="{DESCR} - {GROUPNAME} -{CODE}";

        if (view.sLangu=="AR")
            tit="{DESCR_A} - {CODE}";

        var oTempl = new sap.m.StandardListItem({
            title: tit,
            active: true,
            customData: [{key: "{CODE}"}, {key: "{GROUPNAME}"} ,{key: "{ON_DISPLAY}"}]
        });

        var oDlg = new sap.m.SelectDialog({
            title: "",
            type: "Active",
            liveChange: [oController.frag_liveChange, oController],
            confirm: [oController.frag_confirm, oController]

        }).addStyleClass("sapContrast");

        oDlg.bindAggregation("items", "/", oTempl);
//        oDlg.getBinding("items").sort(sorter);
        oDlg.setModel(oModel);

        return oDlg;
    }
});



