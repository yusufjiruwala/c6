sap.ui.define("sap/ui/chainel1/util/generic/AppTestData", [], function () {
    'use strict'
    var AppTestData = {};

    AppTestData.getDummyTableData = function () {
        return "\n        { \"metadata\":\n          [\n           {\"colname\":\"code\",\"width\":\"20\"},\n           {\"colname\":\"title\",\"width\":\"20\"},\n           {\"colname\":\"parentcode\",\"width\":\"20\"}\n          ],\n      \"data\":\n          [\n            {\"code\":\"01\",\"title\":\"Master\\\\\\\\ \",\"parentcode\":\"\"},\n            {\"code\":\"0101\",\"title\":\"slave 1 \",\"parentcode\":\"01\"}\n          ]\n     }\n    ";
    };
    AppTestData.getDummyMenuData = function () {
        return "{\n\t\"metadata\": [{\n\t\t\"colname\": \"KEYFLD\",\n\t\t\"width\": \"30\"\n\t}, {\n\t\t\"colname\": \"MENUGROUP\",\n\t\t\"width\": \"30\"\n\t}, {\n\t\t\"colname\": \"SELECTED_MENU\",\n\t\t\"width\": \"30\"\n\t}, {\n\t\t\"colname\": \"MENUCODE\",\n\t\t\"width\": \"30\"\n\t}, {\n\t\t\"colname\": \"DESCR1\",\n\t\t\"width\": \"30\"\n\t}, {\n\t\t\"colname\": \"DESCR2\",\n\t\t\"width\": \"30\"\n\t}, {\n\t\t\"colname\": \"FLAG\",\n\t\t\"width\": \"30\"\n\t}, {\n\t\t\"colname\": \"PARENTCODE\",\n\t\t\"width\": \"30\"\n\t}, {\n\t\t\"colname\": \"LEVELNO\",\n\t\t\"width\": \"30\"\n\t}, {\n\t\t\"colname\": \"CHILDCOUNT\",\n\t\t\"width\": \"30\"\n\t}, {\n\t\t\"colname\": \"IMAGE_FILE\",\n\t\t\"width\": \"30\"\n\t}],\n\t\"data\": [{\n\t\t\"KEYFLD\": \"1\",\n\t\t\"MENUGROUP\": \"DASHBOARD\",\n\t\t\"SELECTED_MENU\": \"0001\",\n\t\t\"MENUCODE\": \"01\",\n\t\t\"DESCR1\": \"GL\",\n\t\t\"DESCR2\": \"\",\n\t\t\"FLAG\": \"1\",\n\t\t\"PARENTCODE\": \"\",\n\t\t\"LEVELNO\": \"1\",\n\t\t\"CHILDCOUNT\": \"2\",\n\t\t\"IMAGE_FILE\": \"\"\n\t}, {\n\t\t\"KEYFLD\": \"2\",\n\t\t\"MENUGROUP\": \"DASHBOARD\",\n\t\t\"SELECTED_MENU\": \"0001\",\n\t\t\"MENUCODE\": \"0101\",\n\t\t\"DESCR1\": \"CASH FLOW\",\n\t\t\"DESCR2\": \"\",\n\t\t\"FLAG\": \"1\",\n\t\t\"PARENTCODE\": \"01\",\n\t\t\"LEVELNO\": \"2\",\n\t\t\"CHILDCOUNT\": \"0\",\n\t\t\"IMAGE_FILE\": \"\"\n\t}, {\n\t\t\"KEYFLD\": \"3\",\n\t\t\"MENUGROUP\": \"DASHBOARD\",\n\t\t\"SELECTED_MENU\": \"0001\",\n\t\t\"MENUCODE\": \"0102\",\n\t\t\"DESCR1\": \"ANALYTICAL\",\n\t\t\"DESCR2\": \"\",\n\t\t\"FLAG\": \"1\",\n\t\t\"PARENTCODE\": \"01\",\n\t\t\"LEVELNO\": \"2\",\n\t\t\"CHILDCOUNT\": \"0\",\n\t\t\"IMAGE_FILE\": \"\"\n\t    }]\n    }";
    };


    AppTestData.getDummyItemsData = function () {
        return `{
	"metadata": [{
		"colname": "REFERENCE",
		"width": "30"
	}, {
		"colname": "DESCR",
		"width": "30"
	}, {
		"colname": "PARENTITEM",
		"width": "30"
	}, {
		"colname": "CHILDCOUNTS",
		"width": "30"
	}, {
		"colname": "USECOUNTS",
		"width": "30"
	}],
	"data": [{
		"REFERENCE": "01",
		"DESCR": "Purchasing Store \\\\\\\\",
		"PARENTITEM": "",
		"CHILDCOUNTS": "3",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101",
		"DESCR": "Freight",
		"PARENTITEM": "01",
		"CHILDCOUNTS": "184",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101001",
		"DESCR": "Loading Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "307"
	}, {
		"REFERENCE": "0101002",
		"DESCR": "Offloading Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101003",
		"DESCR": "Handling Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "502"
	}, {
		"REFERENCE": "0101004",
		"DESCR": "Customs Clearance Charges ",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "599"
	}, {
		"REFERENCE": "0101005",
		"DESCR": "Transportation Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "232"
	}, {
		"REFERENCE": "0101006",
		"DESCR": "Detention Charges ",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "37"
	}, {
		"REFERENCE": "0101007",
		"DESCR": "Ocean freight Charges ",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0101008",
		"DESCR": "Air Freight Charges ",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101009",
		"DESCR": "FOB Charges ",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101010",
		"DESCR": "EX-Work Charges ",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101011",
		"DESCR": "PICK UP Charges ",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101012",
		"DESCR": "X-Ray Charges ",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "29"
	}, {
		"REFERENCE": "0101013",
		"DESCR": "Permanent Approvals Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101014",
		"DESCR": "Temporary Approvals Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0101015",
		"DESCR": "Re Export Approvals Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101016",
		"DESCR": "Translation Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "18"
	}, {
		"REFERENCE": "0101017",
		"DESCR": "DG Handling Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0101018",
		"DESCR": "Customs Documents Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "87"
	}, {
		"REFERENCE": "0101019",
		"DESCR": "Inspection Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "330"
	}, {
		"REFERENCE": "0101020",
		"DESCR": "Special Customs Clearance Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "3"
	}, {
		"REFERENCE": "0101021",
		"DESCR": "Inspection Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "24"
	}, {
		"REFERENCE": "0101022",
		"DESCR": "Stevedoring Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "5"
	}, {
		"REFERENCE": "0101023",
		"DESCR": "Security",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "7"
	}, {
		"REFERENCE": "0101024",
		"DESCR": "Exemption Modification",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "361"
	}, {
		"REFERENCE": "0101025",
		"DESCR": "Exemption Handling Fee",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "372"
	}, {
		"REFERENCE": "0101026",
		"DESCR": "Declaration",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101027",
		"DESCR": "Inspection Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "52"
	}, {
		"REFERENCE": "0101028",
		"DESCR": "Lowbed Transportation Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101029",
		"DESCR": "Lowbed Detention Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0101030",
		"DESCR": "Escort Services",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "10"
	}, {
		"REFERENCE": "0101031",
		"DESCR": "Return Empty Container",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "8"
	}, {
		"REFERENCE": "0101032",
		"DESCR": "Contractor Services Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "40"
	}, {
		"REFERENCE": "0101033",
		"DESCR": "Collecting The D/O",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "16"
	}, {
		"REFERENCE": "0101034",
		"DESCR": "Gate Pass Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "24"
	}, {
		"REFERENCE": "0101035",
		"DESCR": "Destuffing",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "18"
	}, {
		"REFERENCE": "0101036",
		"DESCR": "Transportation Charges From Port To Yard",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0101037",
		"DESCR": "Transportation Charges From Yard To Site",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101038",
		"DESCR": "MHE-Forklift",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101039",
		"DESCR": "Levy Exemption Fee",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "6"
	}, {
		"REFERENCE": "0101040",
		"DESCR": "Loading & Unloading Charges in Yard",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "5"
	}, {
		"REFERENCE": "0101041",
		"DESCR": "Loading Charges in yard",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "4"
	}, {
		"REFERENCE": "0101042",
		"DESCR": "Repairing Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "3"
	}, {
		"REFERENCE": "0101043",
		"DESCR": "Transportation / Trailer",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "3"
	}, {
		"REFERENCE": "0101044",
		"DESCR": "Obaining Lecy Exemption",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "18"
	}, {
		"REFERENCE": "0101045",
		"DESCR": "Forklift With Mobilization Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101046",
		"DESCR": "Forklift Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101047",
		"DESCR": "Mobilzation Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101048",
		"DESCR": "Stevedoring",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101049",
		"DESCR": "Pricing Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101050",
		"DESCR": "Storage Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "3"
	}, {
		"REFERENCE": "0101051",
		"DESCR": "Crane Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0101052",
		"DESCR": "SOC Escort To Site",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101053",
		"DESCR": "Obtaining Competent Authority",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101054",
		"DESCR": "Normal Clearing Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101055",
		"DESCR": "Pricing Charge",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101056",
		"DESCR": "Import Communication Equipment",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101057",
		"DESCR": "Normal Clearing Charges for Communication",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101058",
		"DESCR": "Facilities And Laborer For Bulk Cargo",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101059",
		"DESCR": "General Services",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "61"
	}, {
		"REFERENCE": "0101060",
		"DESCR": "Contract registration for temporary charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101061",
		"DESCR": "Normal Export Permit typing & handling through Clients, Competent Authorities & Customs Authority",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101062",
		"DESCR": "Charges for export consignment inspection by customs officials",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101063",
		"DESCR": "Export Permit Modification",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "23"
	}, {
		"REFERENCE": "0101064",
		"DESCR": "Export Permit Renewal",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101065",
		"DESCR": "Vehicle technical Inspection for the competent authority representative to go to the Sites (Southern Iraq sites/Northern Iraq sites).",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101066",
		"DESCR": "Contract registration for temporary charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101067",
		"DESCR": "Import Exemptions Renewal",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101068",
		"DESCR": "Registration Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "4"
	}, {
		"REFERENCE": "0101069",
		"DESCR": "import Terminal Handling Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "3"
	}, {
		"REFERENCE": "0101070",
		"DESCR": "Re-Evalutation Fess",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101071",
		"DESCR": "Deposit Handling",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101072",
		"DESCR": "Deposit Amount Against Orignal",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101073",
		"DESCR": "Shifiting Charge For Bulk Cargo",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "5"
	}, {
		"REFERENCE": "0101074",
		"DESCR": "Portstatic Guards",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101075",
		"DESCR": "General Services",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101076",
		"DESCR": "D O C S And Handling Fees",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101077",
		"DESCR": "Transfer Of Temporary Exemption",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101078",
		"DESCR": "Vechicle Registration Renewal",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101079",
		"DESCR": "Custom Clearance And Transportation",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101080",
		"DESCR": "Facilities And Laborer For Bulk Cargo",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101081",
		"DESCR": "Security Escort",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101082",
		"DESCR": "Temporary Import Approvals",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101083",
		"DESCR": "Obtaining License Plate & Registration",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101084",
		"DESCR": "Vehicle Registration Renewal",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101085",
		"DESCR": "Installation the License Plate on Vehicle at the site",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101086",
		"DESCR": "Obtaining replacement License Plate in case of missing/damaged",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101087",
		"DESCR": "Vehicle technical inspection from the competent Authority Rep.",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101088",
		"DESCR": "Labors Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101089",
		"DESCR": "Raido Active Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101090",
		"DESCR": "Shifting Charge For 40 Feet Container",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "3"
	}, {
		"REFERENCE": "0101091",
		"DESCR": "Shifting Charge For 20 Feet Container",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101092",
		"DESCR": "Correction Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101093",
		"DESCR": "Stevedore Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101094",
		"DESCR": "Install Plate On Vehicle",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101095",
		"DESCR": "Fixing Materials Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101096",
		"DESCR": "Extra Transportation",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101097",
		"DESCR": "Permit for Moving RA Shipment",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101098",
		"DESCR": "Obtaining Custom Declarations Copies As Original",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101099",
		"DESCR": "Get Copy Of Missing Declaration",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101100",
		"DESCR": "Reloading Charge At Yard",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "12"
	}, {
		"REFERENCE": "0101101",
		"DESCR": "Duty Customs Clearance",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101102",
		"DESCR": "Custom Clearance Handling Duty Paid",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101103",
		"DESCR": "Extra Inspection Charge",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101104",
		"DESCR": "Taxes",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0101105",
		"DESCR": "Clearance Charges & Transportation",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101106",
		"DESCR": "Declaration Renewal",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "3"
	}, {
		"REFERENCE": "0101107",
		"DESCR": "CUSTOMS OFFICER",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101108",
		"DESCR": "Shipping Line Delivery Order pickup",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "37"
	}, {
		"REFERENCE": "0101109",
		"DESCR": "State Company for Marine Transport (SCMT) Delivery Order Service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "31"
	}, {
		"REFERENCE": "0101110",
		"DESCR": "Documentation Pickup Service from Basra Office",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "40"
	}, {
		"REFERENCE": "0101111",
		"DESCR": "ROO / Oil authority submission service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "40"
	}, {
		"REFERENCE": "0101112",
		"DESCR": "ROO / Oil authority follow up service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "40"
	}, {
		"REFERENCE": "0101113",
		"DESCR": "SOC Submission service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "40"
	}, {
		"REFERENCE": "0101114",
		"DESCR": "SOC Follow up service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "40"
	}, {
		"REFERENCE": "0101115",
		"DESCR": "SC Submission service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101116",
		"DESCR": "SC Follow up service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101117",
		"DESCR": "Customs Clearance service at Umm Qasr Port",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "21"
	}, {
		"REFERENCE": "0101118",
		"DESCR": "Inspection Committee service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "40"
	}, {
		"REFERENCE": "0101119",
		"DESCR": "SOC Inspection service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "39"
	}, {
		"REFERENCE": "0101120",
		"DESCR": "Intelligence Inspection service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "41"
	}, {
		"REFERENCE": "0101121",
		"DESCR": "De-stuffing service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101122",
		"DESCR": "Loading service",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "97"
	}, {
		"REFERENCE": "0101123",
		"DESCR": "1 Tone Forklift Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101124",
		"DESCR": "4 Tone Forklift Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101125",
		"DESCR": "7 Tone Forklift Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101126",
		"DESCR": "15 Tone Forklift Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101127",
		"DESCR": "25 Tone Forklift Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101128",
		"DESCR": "50 Tone Forklift Charges",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101129",
		"DESCR": "Normal Export Permit Typing & Handling Through Clients,Competent Authorities & Customs Authority",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101130",
		"DESCR": "Charges For Export Consignment Inspection",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101131",
		"DESCR": "Export Permit Modification",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101132",
		"DESCR": "Export Permit Renewal",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101133",
		"DESCR": "Technical Inspection at site",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101134",
		"DESCR": "Obtaining Exemptions and/or Custom Declarations And",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101135",
		"DESCR": "Import Exemptions Renewal",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101136",
		"DESCR": "Processing The Transfring Of Temporary Exemptions",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101137",
		"DESCR": "Vehicle Registration Renewal",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101138",
		"DESCR": "Processing The Transfer Of Temporary Exemptions",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101139",
		"DESCR": "LAND FREIGHT FROM SAFWAN TO KUWAIT",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101140",
		"DESCR": "KUWAIT CUSTOM CLEARANCE & HANDLING",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101141",
		"DESCR": "CLEARING AT SAFWAN BORDER",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101142",
		"DESCR": "SAFWAN EXPORT EXEMPTION",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101143",
		"DESCR": "SAFWAN EXPORT MODIFICATION",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101144",
		"DESCR": "LOWBED & FORKLIFT",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101145",
		"DESCR": "REPRICING",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101146",
		"DESCR": "Get Missing Declartions",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101147",
		"DESCR": "Get Missing Registration Books",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101148",
		"DESCR": "Declartion Registration",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101149",
		"DESCR": "Complete Approval Process",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0101150",
		"DESCR": "Fuel For Trucks & Reefers",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "5"
	}, {
		"REFERENCE": "0101151",
		"DESCR": "Guards",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0101152",
		"DESCR": "Bobtail Lease",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0101153",
		"DESCR": "Additional Drivers",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101154",
		"DESCR": "Additional Trucks",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101155",
		"DESCR": "Safwan Land Lease 25000 Sq Meters",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101156",
		"DESCR": "Customs Taxes",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101157",
		"DESCR": "Airport Cargo Operator",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101158",
		"DESCR": "Delivery Order Fee From Cargo Operator",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101159",
		"DESCR": "Custom D O C S",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101160",
		"DESCR": "Interess Check Point",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101161",
		"DESCR": "Kafala",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101162",
		"DESCR": "Additional Costs",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101163",
		"DESCR": "Escort",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101164",
		"DESCR": "DHL CHARGES",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101165",
		"DESCR": "DOCUMANTATION PAPERWORK",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101166",
		"DESCR": "BACKLOAD CONTAINER TO GAZNA",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101167",
		"DESCR": "ONE NIGHT STANDBY",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101168",
		"DESCR": "EXTEND DECLARATION",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101169",
		"DESCR": "LOAD PREVIEW FEES",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101170",
		"DESCR": "EXPORT PERMIT CANCELATION",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101171",
		"DESCR": "RADIATION APPROVALS",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101172",
		"DESCR": "APPROVAL FEES",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "6"
	}, {
		"REFERENCE": "0101173",
		"DESCR": "EXEMPTION SERVICE",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "10"
	}, {
		"REFERENCE": "0101174",
		"DESCR": "PROVINCE FEES",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101175",
		"DESCR": "RECEIVING UNDER HOOK CHARGES",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101176",
		"DESCR": "SURVEYOR COST",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0101177",
		"DESCR": "DAMAGE CHARGES",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101178",
		"DESCR": "PORT CASHIER CHARGES",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "4"
	}, {
		"REFERENCE": "0101179",
		"DESCR": "PORT MANIFEST CHARGES",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "4"
	}, {
		"REFERENCE": "0101180",
		"DESCR": "STATIC GUARDS",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0101181",
		"DESCR": "COMMISSION",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "5"
	}, {
		"REFERENCE": "0101182",
		"DESCR": "SHIFITING CHARGES",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102038",
		"DESCR": "S O C approval",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0102039",
		"DESCR": "Import Lincnse",
		"PARENTITEM": "0101",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "11"
	}, {
		"REFERENCE": "0102",
		"DESCR": "Destination",
		"PARENTITEM": "01",
		"CHILDCOUNTS": "82",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102001",
		"DESCR": "D.O Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102002",
		"DESCR": "Iraqi Waterway Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102003",
		"DESCR": "Port Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102004",
		"DESCR": "Port Loading Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102005",
		"DESCR": "Demurrage Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102006",
		"DESCR": "Port Detention Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102007",
		"DESCR": "Correction Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102008",
		"DESCR": "Port Cashier Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102009",
		"DESCR": "Declaration Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102010",
		"DESCR": "Port Manifest Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102011",
		"DESCR": "Operation Order Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102012",
		"DESCR": "Port Dues Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102013",
		"DESCR": "Taxes Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102014",
		"DESCR": "Customs Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102015",
		"DESCR": "Bank Commission Charges ",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102016",
		"DESCR": "EPA Approvals Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102017",
		"DESCR": "Environmental Inspection",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "3"
	}, {
		"REFERENCE": "0102018",
		"DESCR": "Insurance",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102019",
		"DESCR": "Port Handling Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102020",
		"DESCR": "Shipping Line Handling",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102021",
		"DESCR": "Approval Fee",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102022",
		"DESCR": "Agent Clers Customs",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102023",
		"DESCR": "Security Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "3"
	}, {
		"REFERENCE": "0102024",
		"DESCR": "Battery",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102025",
		"DESCR": "T H C",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102026",
		"DESCR": "Southren Customs Temporary Import Approval Fee",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102027",
		"DESCR": "SC Approval Fee",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102028",
		"DESCR": "SC Agent Registration Fee",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102029",
		"DESCR": "Destuffing Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102030",
		"DESCR": "Inspection Charge",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102032",
		"DESCR": "Clearance Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102033",
		"DESCR": "SC Approval Fees",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102035",
		"DESCR": "Bank Commission",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102036",
		"DESCR": "Delay Penalties",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102037",
		"DESCR": "RE-Export SC Fees",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102040",
		"DESCR": "Shipping Service",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102042",
		"DESCR": "Crane",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102043",
		"DESCR": "Detention Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102045",
		"DESCR": "Delay Penalties",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102046",
		"DESCR": "Registration in SC",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102047",
		"DESCR": "Re-Export SC Fees",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102048",
		"DESCR": "T L C",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102049",
		"DESCR": "Security Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102050",
		"DESCR": "License",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102051",
		"DESCR": "Wakeel Ikhjraj",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102052",
		"DESCR": "Operating Fees",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102053",
		"DESCR": "Concession Charge Fee",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102054",
		"DESCR": "Exporting Service",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102055",
		"DESCR": "Stevedore Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102056",
		"DESCR": "Install Plate On Vehicle",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102057",
		"DESCR": "Do Extention Fees",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102058",
		"DESCR": "Advertisement Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102059",
		"DESCR": "Return Empty Containers Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102060",
		"DESCR": "LUNCH EXP. - HAFEZ-",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102061",
		"DESCR": "TAXI EXP. - HAFEZ-",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102062",
		"DESCR": "I.O.U - EXP - HAFEZ -",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102063",
		"DESCR": "Renewal Fee",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102064",
		"DESCR": "Port Storage Fee",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0102065",
		"DESCR": "Truck Entry",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102066",
		"DESCR": "Truck Re-entry",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102067",
		"DESCR": "Port Static Guards",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0102068",
		"DESCR": "LAND TRANSPORTATION",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102069",
		"DESCR": "Stationary Charges",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102070",
		"DESCR": "License Fees",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102071",
		"DESCR": "Announcement",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102072",
		"DESCR": "PROVINCE FEES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102073",
		"DESCR": "FORKLIFT CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102074",
		"DESCR": "changing consignee",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102075",
		"DESCR": "THC GENERAL SERVICES CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102076",
		"DESCR": "BERTH CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102077",
		"DESCR": "PORT CUSTOMS CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102078",
		"DESCR": "PENALTIES IN BASRAH CUSTOMS",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102079",
		"DESCR": "REFUND BANK COMMISSION",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102080",
		"DESCR": "SHIFTING CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "2"
	}, {
		"REFERENCE": "0102081",
		"DESCR": "RECEIVING UNDER HOOK CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102082",
		"DESCR": "EXAMINATION CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102083",
		"DESCR": "CONTAINERS RECOVERY CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0102084",
		"DESCR": "STATE AGENT SURVEY FEES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "1"
	}, {
		"REFERENCE": "0102085",
		"DESCR": "DAMAGE CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102086",
		"DESCR": "SC HANDLING",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102087",
		"DESCR": "TRANSPORTATION CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0102088",
		"DESCR": "LIFT ON CHARGES",
		"PARENTITEM": "0102",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0103",
		"DESCR": "Other Services",
		"PARENTITEM": "01",
		"CHILDCOUNTS": "8",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0103001",
		"DESCR": "Packing Charges ",
		"PARENTITEM": "0103",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0103002",
		"DESCR": "Fumigation Charges ",
		"PARENTITEM": "0103",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0103003",
		"DESCR": "Labors Charges ",
		"PARENTITEM": "0103",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0103004",
		"DESCR": "Security Charges ",
		"PARENTITEM": "0103",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0103005",
		"DESCR": "Storages Charges ",
		"PARENTITEM": "0103",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0103006",
		"DESCR": "Rental Charges ",
		"PARENTITEM": "0103",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0103007",
		"DESCR": "Other Transportaion Charges ",
		"PARENTITEM": "0103",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "0103008",
		"DESCR": "**Stevedoring Charges",
		"PARENTITEM": "0103",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "MENU",
		"DESCR": "MENU ITEMS",
		"PARENTITEM": "",
		"CHILDCOUNTS": "1",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "SANDWITCHES",
		"DESCR": "SANDWITCHES",
		"PARENTITEM": "MENU",
		"CHILDCOUNTS": "2",
		"USECOUNTS": "0"
	}, {
		"REFERENCE": "BURGER1",
		"DESCR": " BURGER 1 abcd ",
		"PARENTITEM": "SANDWITCHES",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "3"
	}, {
		"REFERENCE": "BURGER2",
		"DESCR": "BURGER 2",
		"PARENTITEM": "SANDWITCHES",
		"CHILDCOUNTS": "0",
		"USECOUNTS": "4"
	}]
}`;
    };
    return AppTestData;
});



