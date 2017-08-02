sap.ui.jsview("chainel1.GLStatment", {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf chainel1.GLStatment **/
    getControllerName: function () {
        return "chainel1.GLStatment";
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf chainel1.GLStatment **/
    createContent: function (oController) {
        this.oController = oController;
        this.createView();
    },
    createView: function () {
        var that = this;
        if (this.oBar == undefined) {
            this.oBar = Util.createBar("{detailP>/pageTitle}");
            this.mainPage = new sap.m.Page(this.createId("pgSOA"), {
                customHeader: this.oBar,
                footer: new sap.m.Toolbar({
                    content: [
                        new sap.m.ToolbarSpacer(),
                        new sap.m.Button({
                            text: "Preview", press: function () {
                                that.oController.preview();
                            }
                        })
                    ]
                }),
                content: []
            });
        }
    }

});
