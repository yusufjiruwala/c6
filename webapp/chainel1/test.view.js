sap.ui.jsview('chainel1.test', {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf chainel1.test **/
    getControllerName: function () {
        return 'chainel1.test';
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf chainel1.test **/
    createContent: function (oController) {
//        var AppTestData = sap.ui.require("sap/ui/chainel1/util/generic/AppTestData");

        //      var dta = AppTestData.getDummyItemsData();

        console.log("onView");

        this.app = new sap.m.App("mainApp", {initialPage: "loginPg"});

        var oModel=new sap.ui.model.json.JSONModel();

        var data={
            "name":"yusuf"
        };
        oModel.setData(data);
        sap.ui.getCore().setModel(oModel,"global");
        this.setModel(oModel,"global");

        oController.dt = this.dt;

        //var SmartTable= sap.ui.require("sap.ui.comp.smarttable.SmartTable");

    //     var oTable = new sap.ui.comp.smarttable.SmartTable("SmartTable", {
    //         tableType : 'AnalyticalTable',
    //         entitySet : 'SmartTableSet',
    //         useVariantManagement : false,
    //
    //         beforeRebindTable: [function(oEvent)
    //
    //         {oController.onBeforeRebindTable(oEvent);
    //
    //         }, oController], //Created "onBeforeRebindTable" Method in Controller File
    //
    //
    //
    //         initialise: [function(oEvent) {oController.initialise(oEvent); }, oController],
    //
    //         dataReceived: [function(oEvent) {oController.onDataReceived(oEvent); }, oController],
    //
    //         initiallyVisibleFields : 'Field1,Field2,Field3,Field4',   //Which Fields need to appear in output Initially
    //         header : 'Your Output Heading:',
    //         persistencyKey : 'ST',
    //         enableAutoBinding : true,
    //         showRowCount : false,
    //         enableCustomFilter : true,
    //
    //         useExportToExcel : true,
    //
    //         customToolbar : new sap.m.Toolbar("button",
    //
    //             { enabled : true, content : new sap.ui.commons.Button({
    //
    //                     text : "Email",
    //
    //                     icon: "sap-icon://email",
    //
    //                     style: sap.ui.commons.ButtonStyle.Emph,
    //
    //                     tooltip : "Send Email",
    //
    //                     height: "40px",
    //
    //                     press :
    //
    //                         [function(oEvent) { sap.ui.getCore().byId("Dialog1").open(); }]
    //
    //             })
    //
    //     })
    //
    //
    //
    // });

        var oData={
            data:[
                {
                    name:"yusuf",
                    code:"0010",
                    amt:100

                },
                {
                    name:"yusuf",
                    code:"0010",
                    amt:200
                },
                {
                    name:"yusuf1",
                    code:"003",
                    amt:10000
                },
                {
                    name:"yusuf1",
                    code:"003",
                    amt:10000
                },
                {
                    name:"yusuf1",
                    code:"003",
                    amt:10000
                },
                {
                    name:"yusuf1",
                    code:"003",
                    amt:10000
                },
                {
                    name:"yusuf1",
                    code:"003",
                    amt:10000
                },
                {
                    name:"yusuf1",
                    code:"003",
                    amt:10000
                }

            ]
        };

        var oModel=new sap.ui.model.json.JSONModel(oData);
        this.setModel(oModel,"test");

        // oTable.setModel(oController.getModel());
        jQuery.sap.require  ("sapui6.ui.table.Table-dbg");
        var oColumn1 = new sapui6.ui.table.Column({
            title:"Title1",
            path:"test>name",
            width:"80px",
            align:"center",
            showSortMenuEntry:true,
            showGroupMenuEntry:true

        });
        var oColumn2 = new sapui6.ui.table.Column({
            title:"Title2",
            path:"test>code",
            width:"80px",
            align:"center"
        });

        var oColumn3 = new sapui6.ui.table.Column({
            title:"Title2",
            path:"test>amt",
            width:"80px",
            align:"right",
            format:"##,###.###",
            groupSummary:"sum"
        });

        this.table = new sapui6.ui.table.Table({
            columns:[oColumn1,oColumn2,oColumn3],
            mergeColumnIndex:1,
            rowBorderStyle:"outset",
            showGroupSummary:true,
            rowHeight:"20px",
        });
        this.table.bindRows("test>/data");





        var oPage = new sap.m.Page("loginPg", {
            title: "{global>/name}",
            content: [
                this.table
            ]

        });



        this.app.addPage(oPage);

        return this.app;

    }

});
