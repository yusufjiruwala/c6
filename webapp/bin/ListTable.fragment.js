sap.ui.jsfragment("bin.ListTable", {

    createContent: function (oController) {
        this.oController = oController;
        this.view = oController.getView();
    },
    createView: function () {
        this.vbox.removeAllItems();
        this.searchField = new sap.m.SearchField();
        this.qv = new QueryView();
        this.qv.setCallBackListSelect(function (str2) {
        });
    }
});