sap.ui.jsfragment("bin.forms.lg.JO", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 106,
            onm: ""
        };
        this.pgDetail = new sap.m.Page({showHeader: false});

        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.joApp.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.mainPage);
        this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");
        return this.joApp;
    },
    createView: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        this.jo = {};
        this.frmJO;

        this.qryStr = "";
        if (this.oController.qryStr != undefined)
            this.qryStr = this.oController.qryStr;

        UtilGen.clearPage(this.mainPage);
        this.createViewJOControls(true, this.mainPage);
        if (sett["BINDITEM_ITEMS_#JO.ORD_NO"] == "INVISIBLE") {
            this.jo.ord_no.setVisible(false);
        }
        //addStyleClass("sapUiLargeMarginBottom sapUiMediumMargin");
    },
    loadData: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        this.vars.keyfld = -1;
        this.vars.flag = 1;
        this.jo.ord_no.setEnabled(true);
        this._cmdNewNo.setEnabled(false);
        this.joDet1 = {};
        this.jo.ord_ref.setEnabled(true);
        this.jo.ord_date.setEditable(true);
        this.jo.ordacc.setEditable(true);

        if (this.qryStr.length == 0) {
            UtilGen.resetDataJson(this.jo);
            UtilGen.setControlValue(this.jo.location_code, sett["DEFAULT_LOCATION"]);
            var on = Util.getSQLValue("select nvl(max(ord_no),0)+1 from order1 where ord_code=" + this.vars.ord_code)
            UtilGen.setControlValue(this.jo.ord_no, on);
            that.generate_jo_no();
            this._cmdNewNo.setEnabled(true);
            // UtilGen.loadDataFromJson(this.subs, dtx[0], true);
        }
        else {
            var dt = Util.execSQL("select *from order1 where ord_code=" + this.vars.ord_code + " and ord_no=" + this.qryStr);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                UtilGen.loadDataFromJson(this.jo, dtx[0], true);
                this.jo.ord_no.setEnabled(false);
                UtilGen.setControlValue(this.jo.ord_ref, dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM, dtx[0].ORD_REF, false);
                var cnt = Util.getSQLValue("select nvl(count(*),0) from order1 where ord_code!=103 and ord_reference=" + dtx[0].ORD_NO);
                if (cnt > 0) {
                    this.jo.ord_ref.setEnabled(false);
                    this.jo.ord_date.setEditable(false);
                    this.jo.ordacc.setEditable(false);
                }

            }

        }
        //that.generate_jo_no();
    },


    createViewJOControls: function (addForm, pg) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        if (this.frmJO != undefined) {
            this.frmJO.removeAllContent();
            this.frmJO.destroyContent();
        }
        this.jo = {};
        // location code
        this.jo.location_code = UtilGen.createControl(sap.m.ComboBox, this.view, "location_code", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectionChange: function (event) {

            }
        }, "string", undefined, undefined, "select code,name from locations order by 1");

        // company no (lcno)
        this.jo.lcno = UtilGen.createControl(sap.m.ComboBox, this.view, "company", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectionChange: function (event) {
                that.generate_jo_no();
            }
        }, "string", undefined, undefined, "select code,name from company order by 1");
        // ord_type air/land/marines
        this.jo.ord_type = UtilGen.createControl(sap.m.ComboBox, this.view, "ord_type", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{CODE} - {NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectedKey: "1",
            selectionChange: function (event) {
                that.generate_jo_no();
            }
        }, "string", undefined, undefined, "@1/Land,2/Sea,3/Air");

        //Transport Type, ORDACC
        this.jo.ordacc = UtilGen.createControl(sap.m.ComboBox, this.view, "ORDACC", {
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{CODE} - {NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectedKey: "01",
            selectionChange: function () {
                that.generate_jo_no();
            },
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
        }, "string", undefined, undefined, "@01/Import,02/Export,03/Transport,04/Local");
        //JO No, ORD_NO
        this.jo.ord_no = UtilGen.createControl(sap.m.Input, this.view, "ord_no", {
            change: function () {
                that.generate_jo_no();
            },
            enabled: false,
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),

        }, "number");

        //JO NO Full  ONAME,
        this.jo.oname = UtilGen.createControl(sap.m.Input, this.view, "oname", {
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
            editable: false
        }, "string");
        // emails
        this.jo.emails = UtilGen.createControl(sap.m.TextArea, this.view, "joemails", {
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
            // editable: false
        }, "string");
        // button for emails.
        (this.view.byId("joCmdEmails") != undefined ? this.view.byId("joCmdEmails").destroy() : null);
        this.jo._cmdEmails = new sap.m.Button(this.view.createId("joCmdEmails"),
            {
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S4"}),
                text: "Emails",
                press: function () {
                    that.get_emails_sel();
                }
            });
        //costcent , cost center
        this.jo.costcent = UtilGen.createControl(sap.m.ComboBox, this.view, "costcent", {
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{TITLE}-{CODE}", key: "{CODE}"}),
                templateShareable: true
            },
            selectedKey: "1001",
            selectionChange: function () {

            },
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
        }, "string", undefined, undefined, "select code,title from accostcent1 where childcount=0 order by path");

        //ord_date , ord date
        this.jo.ord_date = UtilGen.createControl(sap.m.DatePicker, this.view, "ord_date", {
            valueFormat: sett["ENGLISH_DATE_FORMAT"],
            displayFormat: sett["ENGLISH_DATE_FORMAT"],
        }, "date");

        //Ord_REF , Customer Code,
        this.jo.ord_ref = UtilGen.createControl(sap.m.SearchField, this.view, "ord_ref", {
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
            search: function (e) {
                if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                    UtilGen.setControlValue(that.jo.ord_ref, "", "", true);
                    return;
                }

                var sq = "select code,name title from c_ycust where iscust='Y' and childcount=0 order by code";
                Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                    UtilGen.setControlValue(that.jo.ord_ref, val, valx, true);
                });
            }
        }, "string");

        //ORD_SHIP , Customer Reference
        this.jo.ord_ship = UtilGen.createControl(sap.m.Input, this.view, "ord_ship", {
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
        }, "string");
        //ADJUST_DESCR, Customer INV#
        this.jo.adjust_descr = UtilGen.createControl(sap.m.Input, this.view, "adjust_descr", {
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
        }, "string");

        //startdate,starting date
        this.jo.startdate = UtilGen.createControl(sap.m.DatePicker, this.view, "startdate", {
            valueFormat: sett["ENGLISH_DATE_FORMAT"],
            displayFormat: sett["ENGLISH_DATE_FORMAT"],
            enabled: false
        }, "date");
        //enddate, ending date
        this.jo.enddate = UtilGen.createControl(sap.m.DatePicker, this.view, "enddate", {
            valueFormat: sett["ENGLISH_DATE_FORMAT"],
            displayFormat: sett["ENGLISH_DATE_FORMAT"],
            enabled: false
        }, "date");

        //PREV_CLOSE_DATE, prev close date
        this.jo.prev_close_date = UtilGen.createControl(sap.m.DatePicker, this.view, "prev_close_date", {
            valueFormat: sett["ENGLISH_DATE_FORMAT"],
            displayFormat: sett["ENGLISH_DATE_FORMAT"],
            enabled: false
        }, "date");
        this.jo.attn = UtilGen.createControl(sap.m.Input, this.view, "joAttn", {
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
        }, "string");
        this.jo.payterm = UtilGen.createControl(sap.m.Input, this.view, "jopayterm", {
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
        }, "string");

        if (Util.nvl(addForm, true) == true) {
            this.frmJO = UtilGen.formCreate("", true,
                ["Location / File", this.jo.location_code,
                    "Company", this.jo.lcno,
                    "JO Type", this.jo.ord_type,
                    "Trans Type", this.jo.ordacc,
                    "JO No", this.jo.ord_no,
                    "Cost Center", this.jo.costcent,
                    "JO,Complete NO", this.jo.oname,
                    "Emails", this.jo.emails,
                    "", this.jo._cmdEmails,
                    "# ",
                    "Ord Date", this.jo.ord_date,
                    "Customer", this.jo.ord_ref,
                    "Cust. Ref# ", this.jo.ord_ship,
                    "Cust Inv NO", this.jo.adjust_descr,
                    "Origin", this.jo.attn,
                    "Destination", this.jo.payterm,
                    // "# ",
                    // "Start Date", this.jo.startdate,
                    // "End Date", this.jo.enddate,
                    // "Prev Close Date", this.jo.prev_close_date
                ]
            );
            if (pg != undefined)
                pg.addContent(this.frmJO);

            this._cmdNewNo = new sap.m.Button({
                    text: "Generate Ord No", press: function () {
                        that.generate_jo_no();
                    }

                }
            );

            this.frmJO.getToolbar().addContent(this.bk);
            this.frmJO.getToolbar().addContent(new sap.m.Text({text: "Job Order # " + this.qryStr}));
            this.frmJO.getToolbar().addContent(new sap.m.ToolbarSpacer());
            this.frmJO.getToolbar().addContent(this._cmdNewNo);
            this.frmJO.getToolbar().addContent(new sap.m.Button({
                icon: "sap-icon://save", press: function () {
                    that.save_data(true);
                }
            }));
            this.frmJO.getToolbar().addContent(new sap.m.Button({
                icon: "sap-icon://delete", press: function () {

                }
            }));
            this.frmJO.getToolbar().addContent(new sap.m.Button({
                icon: "sap-icon://print", press: function () {
                    that.save_data(false);
                    Util.doXhr("report?reportfile=rptLGJob&_para_PNO=" + that.qryStr, true, function (e) {
                        if (this.status == 200) {
                            var blob = new Blob([this.response], {type: "application/pdf"});
                            var link = document.createElement('a');
                            link.href = window.URL.createObjectURL(blob);
                            link.target = "_blank";
                            link.style.display = "none";
                            document.body.appendChild(link);
                            link.download = "rptVou" + new Date() + ".pdf";
                            link.click();
                            document.body.removeChild(link);
                        }
                    });
                }
            }));
            this.frmJO.getToolbar().addContent(
                new sap.m.Button({
                    icon: "sap-icon://enter-more",
                    text: "", press: function (ev) {
                        that.showDetailPage();
                    }
                }));

        }
    },
    generate_jo_no: function () {

        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

        // exit the function if it is about EDITING..
        if ((this.qryStr + "").length > 0) {
            return;
        }

        var type = UtilGen.getControlValue(this.jo.ord_type);
        var ord = UtilGen.getControlValue(this.jo.ord_no);
        var t_type = UtilGen.getControlValue(this.jo.ordacc);
        var od = sdf.format(UtilGen.getControlValue(this.jo.ord_date)).replace(new RegExp("/", 'g'), "");

        // var fnd = true;
        // var on = Math.floor(Math.random() * 9999) + 1; //UtilGen.getControlValue(this.jo.ord_no);
        // while (!fnd) {
        //     on = Math.floor(Math.random() * 9999) + 1;
        //     fnd = (Util.getSQLValue("select nvl(max(onm),'-1') from order1 where ord_code=" + this.vars.ord_code + " and onm=" + Util.quoted(on)) == "-1" ? false : true);
        // }
        // on = ("00" + on).slice(-4);
        var on = Util.getSQLValue("select rnd_no from lgrnd where jo=" + ord);
        if (Util.nvl(on, "") == "") {
            sap.m.MessageToast.show("#" + ord + " may not defined in random list..");
            UtilGen.setControlValue(this.jo.oname, "");
            return;
        }
        UtilGen.setControlValue(this.jo.oname, type + "/" + t_type + "/" + od + "/" + on, undefined, true);
        this.vars.onm = on;
    }
    ,
    showDetailPage: function () {

        this.createViewDetail();
        this.loadData_details();

        this.joApp.to(this.pgDetail, "flip");
    }
    ,
    loadData_details: function () {
        if (this.qryStr == "")
            return;
        var dt = Util.execSQL("select *from lg_info where ord_code=" + this.vars.ord_code + " and ord_no=" + this.qryStr);
        if (dt.ret == "SUCCESS" && dt.data.length > 0) {
            var dtx = JSON.parse("{" + dt.data + "}").data;
            if (dtx.length > 0)
                UtilGen.loadDataFromJson(this.joDet1, dtx[0], true);
        }
    }
    ,
    createViewDetail: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.joDet1 = {}; // basic information for jo details
        // job order selected
        var selectedJob = UtilGen.getControlValue(that.jo.ord_no);
        var ord_type = UtilGen.getControlValue(that.jo.ord_type);
        var frmBasic; // basic information
        var frmElements = ["Basic Information"];// all array of elements for simpleForm.

        UtilGen.clearPage(this.pgDetail);

        var tb = new sap.m.Toolbar({
            content: [
                new sap.m.Button({
                    icon: "sap-icon://nav-back",
                    press: function () {
                        that.joApp.to(that.mainPage, "flip");
                    }
                }),
                new sap.m.Text({
                    text: "Job Ord # " + selectedJob + " , " + that.jo.ord_type.text
                })
            ]

        });
        if (ord_type == "1") {

            this.addUptoDutyPaid(frmElements);
            //LG_L_RE_EXPORT  checkbox
            this.joDet1.lg_l_re_export = this.addControl(frmElements,
                "Re Export", sap.m.CheckBox, "detReExp",
                {selected: false}, "boolean");
            this.joDet1.lg_l_re_export.trueValues = ["Y", "N"]; // true value , false value;
            //LG_L_LOCAL
            this.joDet1.lg_l_local = this.addControl(frmElements, "Local", sap.m.Input, "detLocal", {selected: false}, "string");
            // LG_L_ORIGIN_TRUCK
            this.joDet1.lg_l_origin_truck = this.addControl(frmElements, "Origin Truck", sap.m.Input, "", {selected: false}, "string");
            // LG_DRIVER_NO
            this.joDet1.lg_driver_no = this.addControl(frmElements, "Driver No", sap.m.Input, "", {selected: false}, "string");
            // LG_TRUCK_IQ ,   LG_TRUCK_TYPE
            this.joDet1.lg_truck_iq = this.addControl(frmElements, "Truck IQ / Type ", sap.m.Input, "detTruckIq", {selected: false}, "string");
            this.joDet1.lg_truck_type = this.addControl(frmElements, "", sap.m.Input, "detTruckType", {selected: false}, "string");
            // LG_SHIPPER
            this.joDet1.lg_shipper = this.addControl(frmElements, "Shipper", sap.m.Input, "detShipper", {selected: false}, "string");
            //LG_CONSIGNEE
            this.joDet1.lg_consignee = this.addControl(frmElements, "Consignee", sap.m.Input, "detConsignee", {selected: false}, "string");
        }
        if (ord_type == "2") {
            // Permanent Exemption, No Of Pcs
            // LG_PERMANENT_EXEMPTION checkbox ,  LG_NO_OF_PCS
            this.addUptoDutyPaid(frmElements);

            // LG_S_VESSEL_NAME
            this.joDet1.lg_s_vessel_name = this.addControl(frmElements, "Vessel Name", sap.m.Input, "detVesselName", {selected: false}, "string");
            // LG_S_CONTAINER_NO
            this.joDet1.lg_s_container_no = this.addControl(frmElements, "Container No", sap.m.Input, "detContainerNo", {selected: false}, "string");
            // LG_L_ORIGIN_TRUCK
            this.joDet1.lg_l_origin_truck = this.addControl(frmElements, "Origin Truck", sap.m.Input, "", {selected: false}, "string");
            // LG_S_MBL
            this.joDet1.lg_s_mbl = this.addControl(frmElements, "MBL", sap.m.Input, "detMbl", {selected: false}, "string");
            // LG_S_HBL
            this.joDet1.lg_s_hbl = this.addControl(frmElements, "HBL", sap.m.Input, "detHbl", {selected: false}, "string");
            // LG_TRUCK_IQ ,   LG_TRUCK_TYPE
            this.joDet1.lg_truck_iq = this.addControl(frmElements, "Truck IQ / Type ", sap.m.Input, "detTruckIq", {selected: false}, "string");
            this.joDet1.lg_truck_type = this.addControl(frmElements, "", sap.m.Input, "detTruckType", {selected: false}, "string");
            //LG_S_FCL_LCL_BB
            this.joDet1.lg_s_fcl_lcl_bb = this.addControl(frmElements, "FCL/LCL/BB", sap.m.Input, "detfcllcbb", {selected: false}, "string");
            //LG_SHIPPER
            this.joDet1.lg_shipper = this.addControl(frmElements, "Shipper", sap.m.Input, "detShipper", {selected: false}, "string");
            //LG_CONSIGNEE
            this.joDet1.lg_consignee = this.addControl(frmElements, "Consignee", sap.m.Input, "detConsignee", {selected: false}, "string");

        }
        if (ord_type == "3") {
            this.addUptoDutyPaid(frmElements);
            // LG_A_AIRLINE
            this.joDet1.lg_a_airline = this.addControl(frmElements, "Airline", sap.m.Input, "detAirline", {selected: false}, "string");
            // LG_A_FLT_NO
            this.joDet1.lg_a_flt_no = this.addControl(frmElements, "FLT NO", sap.m.Input, "detFltNo", {selected: false}, "string");
            // LG_L_ORIGIN_TRUCK
            this.joDet1.lg_l_origin_truck = this.addControl(frmElements, "Origin Truck", sap.m.Input, "detOrigTruck", {selected: false}, "string");
            // LG_A_MAWB
            this.joDet1.lg_a_mawb = this.addControl(frmElements, "MAWB", sap.m.Input, "detmwb", {selected: false}, "string");
            // LG_A_HAWB
            this.joDet1.lg_a_hawb = this.addControl(frmElements, "HAWB", sap.m.Input, "detawb", {selected: false}, "string");
            // LG_TRUCK_IQ ,   LG_TRUCK_TYPE
            this.joDet1.lg_truck_iq = this.addControl(frmElements, "Truck IQ / Type", sap.m.Input, "detTruckIq", {selected: false}, "string");
            this.joDet1.lg_truck_type = this.addControl(frmElements, "", sap.m.Input, "detTruckType", {selected: false}, "string");
            // LG_SHIPPER
            this.joDet1.lg_shipper = this.addControl(frmElements, "Shipper", sap.m.Input, "detShipper", {selected: false}, "string");
            //LG_CONSIGNEE
            this.joDet1.lg_consignee = this.addControl(frmElements, "Consignee", sap.m.Input, "detConsignee", {selected: false}, "string");
            //
        }
        frmElements.push(new sap.ui.core.Title({text: "Other info"}));
        this.joDet1.lg_description = this.addControl(frmElements, "Descr", sap.m.Input, "detDescr", {selected: false}, "string");
        this.joDet1.lg_notes = this.addControl(frmElements, "Remarks", sap.m.Input, "detRemarks", {selected: false}, "string");
        this.joDet1.lg_l_arrival_date = this.addControl(frmElements, "Arrival date", sap.m.DatePicker, "detArrival", {
            valueFormat: sett["ENGLISH_DATE_FORMAT"],
            displayFormat: sett["ENGLISH_DATE_FORMAT"]
        }, "date");
        this.joDet1.lg_l_delivery_date = this.addControl(frmElements, "Delivery date", sap.m.DatePicker, "detDelvDate", {
            valueFormat: sett["ENGLISH_DATE_FORMAT"],
            displayFormat: sett["ENGLISH_DATE_FORMAT"]
        }, "date");
        this.joDet1.lg_l_clearance_date = this.addControl(frmElements, "Clearance date", sap.m.DatePicker, "detClearDate", {
            valueFormat: sett["ENGLISH_DATE_FORMAT"],
            displayFormat: sett["ENGLISH_DATE_FORMAT"]
        }, "date");


        // end element for scrolling...
        frmElements.push(new sap.ui.core.Title({text: ""}));

        this.pgDetail.addContent(tb);
        frmBasic = UtilGen.formCreate("", true, frmElements);
        this.pgDetail.addContent(frmBasic);

    }
    ,
    addUptoDutyPaid: function (frmElements) {
        // LG_PERMANENT_EXEMPTION checkbox ,  LG_NO_OF_PCS
        this.joDet1.lg_permanent_exemption = this.addControl(frmElements,
            "Perm. Exempt", sap.m.CheckBox, "detPExmpt",
            {selected: false}, "boolean");
        this.joDet1.lg_permanent_exemption.trueValues = ["Y", "N"]
        this.joDet1.lg_no_of_pcs = this.addControl(frmElements, new sap.m.Text({
            text: "No Of Pcs",
            textAlign: sap.ui.core.TextAlign.Right
        }), sap.m.Input, "detNoOfPcs", {selected: false}, "string");

        // LG_TEMPORARY_IMPORT checkbox  , LG_WEIGHT
        this.joDet1.lg_temporary_import = this.addControl(frmElements, "Temp. Import", sap.m.CheckBox, "detTmpImp",
            {selected: false}, "boolean");
        this.joDet1.lg_temporary_import.trueValues = ["Y", "N"]; // true value , false value;
        this.joDet1.lg_weight = this.addControl(frmElements, new sap.m.Text({
            text: "Weight",
            textAlign: sap.ui.core.TextAlign.Right
        }), sap.m.Input, "detWeight", {selected: false}, "string");

        // LG_DUTY_PAID  checkbox ,  LG_MEASUREMENT
        this.joDet1.lg_duty_paid = this.addControl(frmElements, "Duty Paid",
            sap.m.CheckBox, "detDutyPaid", {selected: false}, "boolean");
        this.joDet1.lg_duty_paid.trueValues = ["Y", "N"]; // true value , false value;
        this.joDet1.lg_measurement = this.addControl(frmElements, new sap.m.Text({
            text: "Measurement",
            textAlign: sap.ui.core.TextAlign.Right
        }), sap.m.Input, "detMeasurement", {selected: false}, "string");
    }
    ,
    addControl(ar, lbl, cntClass, id, sett, dataType) {
        var setx = sett;
        var idx = id;
        if (Util.nvl(id, "") == "")
            idx = lbl.replace(/ ||,||./g, "");
        //setx["layoutData"] = new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"});
        var cnt = UtilGen.createControl(cntClass, this.view, idx, setx, dataType);
        if (lbl.length != 0)
            ar.push(lbl);
        ar.push(cnt);
        return cnt;
    }
    ,
    validateSave: function () {
        if (this.qryStr == "") {
            var on = UtilGen.getControlValue(this.jo.oname);
            var fnd = (Util.getSQLValue("select nvl(max(oname),'-1') from order1 where ord_code=" + this.vars.ord_code + " and oname=" + Util.quoted(on)) == "-1" ? false : true);
            if (fnd) {
                sap.m.MessageToast.show("Err !,This Order #  Existed , Generate New JO #!");
                return false;
            }
        }
        var v = Util.getSQLValue("select code,name title from c_ycust " +
            "where iscust='Y' and childcount=0 and code=" + Util.quoted(UtilGen.getControlValue(this.jo.ord_ref)));
        if (Util.nvl(v, "").length == 0) {
            sap.m.MessageToast.show("Err !, Customer not found !");
            return false;
        }
        var v = Util.getSQLValue("select ord_flag title from order1 " +
            " where ord_code=" + this.vars.ord_code + " and ord_no=" + Util.quoted(UtilGen.getControlValue(this.jo.ord_no)));
        if (Util.nvl(v, "") == "1") {
            sap.m.MessageToast.show("Err !,This JO is closed !!");
            return false;
        }
        return true;
    }
    ,
    save_data: function (ret) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        if (!this.validateSave())
            return;
        var k = "";
        // inserting or updating order1 and lg_info tables.
        var custName = Util.getSQLValue("select name from c_ycust where code=" + Util.quoted(UtilGen.getControlValue(that.jo.ord_ref)));
        if (this.qryStr == "") {
            this.generate_jo_no();
            k = UtilGen.getSQLInsertString(this.jo, {
                "ord_code": this.vars.ord_code,
                "ord_flag": 2,
                "ORD_REFNM": Util.quoted(custName),
                "periodcode": Util.quoted(sett["CURRENT_PERIOD"]),
                "onm": this.vars.onm
            });
            k = "insert into order1 " + k;
            // if jo details defined then insert records in LG_INFO
            if (this.joDet1 != undefined && Util.objToStr(this.joDet1).length > 0) {
                k += "; insert into lg_info " + UtilGen.getSQLInsertString(this.joDet1, {
                    "ord_no": UtilGen.getControlValue(this.jo.ord_no),
                    "ord_code": this.vars.ord_code
                }) + ";";
            } else k += ";";
            k = "begin " + k + " end;"
        }
        else {
            k = UtilGen.getSQLUpdateString(this.jo, "order1", {"ORD_REFNM": Util.quoted(custName)},
                "ord_code=" + Util.quoted(this.vars.ord_code) + " and  ord_no=" + Util.quoted(this.qryStr), ["ONAME", "ORD_NO"]);
            // if jo details defined then update records in LG_INFO
            if (this.joDet1 != undefined && Util.objToStr(this.joDet1).length > 0) {
                // k += ";" + UtilGen.getSQLUpdateString(this.joDet1, "lg_info", {}, " ord_code=" + Util.quoted(this.vars.ord_code)
                //     + " and ord_no=" + Util.quoted(this.qryStr)) + ";";
                k += "; delete from lg_info where ord_no=" + UtilGen.getControlValue(this.jo.ord_no) + " and ord_code=" + this.vars.ord_code;
                k += "; insert into lg_info " + UtilGen.getSQLInsertString(this.joDet1, {
                    "ord_no": UtilGen.getControlValue(this.jo.ord_no),
                    "ord_code": this.vars.ord_code
                }) + ";";
            } else k += ";";
            k = "begin " + k + " end;";
        }

        var oSql = {
            "sql": k,
            "ret": "NONE",
            "data": null
        };
        Util.doAjaxJson("sqlexe", oSql, false).done(function (data) {
            console.log(data);
            if (data == undefined) {
                sap.m.MessageToast.show("Error: unexpected, check server admin");
                return;
            }
            if (data.ret != "SUCCESS") {
                sap.m.MessageToast.show("Error :" + data.ret);
                return;
            }

            sap.m.MessageToast.show("Saved Successfully !");
            if (ret)
                that.joApp.backFunction();

        });

    },
    get_emails_sel: function () {
        var that = this;
        var s = Util.getSQLValue("select email from c_ycust where code=" + Util.quoted(UtilGen.getControlValue(this.jo.ord_ref)));

        var p = UtilGen.getControlValue(this.jo.ord_ref);
        while (Util.nvl(s, "").length == 0 && p.length > 0) {
            p = Util.getSQLValue("select parentcustomer from c_ycust where code=" + Util.quoted(p));
            s = Util.getSQLValue("select email from c_ycust where code=" + Util.quoted(p));
        }
        var s1 = s.split(",");
        var sq = "";
        for (var i in s1)
            sq += (sq.length > 0 ? "," : "") + s1[i] + "/" + s1[i];
        sq = "@" + sq;
        Util.show_list(sq, ["CODE", "TITLE"], "CODE", function (data) {
            var ss = "";
            for (var i in data)
                ss += (ss.length > 0 ? "," : "") + data[i].CODE;

            UtilGen.setControlValue(that.jo.emails, ss);
            return true;
        }, "100%", "100%", 10, true);
    }

});



