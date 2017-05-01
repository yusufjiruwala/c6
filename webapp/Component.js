jQuery.sap.declare("sap.ui.chainel1.Component");
sap.ui.core.UIComponent.extend("sap.ui.chainel1.Component", {
    createContent : function () {
        // create root view
        var oView = sap.ui.view({
            id : "app",
            //viewName : "chainel1.Login",
            viewName : "chainel1.Login",
            type : "JS",
        });

        var myData= [{id:"1",name:"Attachment"},
            {id:"2",name:"Notes"},
            {id:"3",name:"People"}];

        var model = new sap.ui.model.json.JSONModel();
        model.setData({
            modelData: {
                userData : []

            }
        });
        oView.setModel(model);
        oView.getModel().setProperty("/modelData/Data", myData);

        return oView;
    }
});