sap.ui.jsview("chainel1.SplitPage", {
  /** Specifies the Controller belonging to this View. 
  * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller. 
  * @memberOf routingdemo.App 
  */  
  getControllerName : function() {  
  return "chainel1.SplitPage";
  },  
  /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
  * Since the Controller is given to this method, its event handlers can be attached right away. 
  * @memberOf routingdemo.App 
  */  
  createContent : function(oController) {  
  var controller = this.oController;
	
	//Define some sample data 
var oData = {
		root:{
			name: "root",
			description: "root description",
			checked: true,
			0: {
				name: "item 1",
    			description: "item1 description",
    			checked: true,
				1: {
					name: "subitem1-1",
        			description: "subitem1-1 description",
        			checked: true,
					0: {
						name: "subsubitem1-1-1",
		        			description: "subsubitem1-1-1 description",
		        			checked: true
					},
					1: {
						name: "subsubitem1-1-2",
		        			description: "subsubitem1-1-2 description",
		        			checked: true
					}
				},
				1: {
					name: "subitem1-2",
        			description: "subitem1-2 description",
		        		checked: true,
					0: {
						name: "subsubitem1-2-1",
		        			description: "subsubitem1-2-1 description",
		        			checked: true
					}
				}
				
			},
			1:{
				name: "item2",
    			description: "item2 description",
    			checked: true,
				0: {
					name: "subitem2-1",
        			description: "subitem2-1 description",
        			checked: true
				}
			},
			2:{
				name: "item3",
    			description: "item3 description",
    			checked: true
			}
			
		}
};

for (var i = 0; i < 20; i++) {
	oData["root"][2][i] = {
		name: "subitem3-" + i,
			description: "subitem3-" + i + " description",
			checked: false
	};
}

//Create an instance of the table control
var oTable = new sap.ui.table.TreeTable({
	columns: [
		new sap.ui.table.Column({label: "Name", template: "name"})
	],
	selectionMode: sap.ui.table.SelectionMode.Single,
	enableColumnReordering: true,
	expandFirstLevel: true,
	toggleOpenState: function(oEvent) {
		var iRowIndex = oEvent.getParameter("rowIndex");
		var oRowContext = oEvent.getParameter("rowContext");
		var bExpanded = oEvent.getParameter("expanded");
		alert("rowIndex: " + iRowIndex + 
				" - rowContext: " + oRowContext.getPath() + 
				" - expanded? " + bExpanded);
	}
});

//Create a model and bind the table rows to this model
var oModel = new sap.ui.model.json.JSONModel();
oModel.setData(oData);
oTable.setModel(oModel);
oTable.bindRows("/root");

	var oSplitApp = new sap.m.SplitApp("oSplitApp");
	
	var oPage1 = new sap.m.Page({title:"Master Details", content:[oTable]});
	
	var oPage2 = new sap.m.Page({title:"Item Details"});

	
	oSplitApp.addMasterPage(oPage1);
	oSplitApp.addDetailPage(oPage2);
	
	return oSplitApp;
  }  
});