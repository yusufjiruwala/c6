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
        this.jo.ordacc.setEnabled(true);
        this.jo.costcent.setEnabled(true);
        this.fill_cc();
        this.fill_trans_type();

        if (this.qryStr.length == 0) {
            UtilGen.resetDataJson(this.jo);
            UtilGen.setControlValue(this.jo.location_code, sett["DEFAULT_LOCATION"]);
            var on = Util.getSQLValue("select nvl(max(ord_no),0)+1 from order1 where ord_code=" + this.vars.ord_code)
            UtilGen.setControlValue(this.jo.ord_no, on);
            that.generate_jo_no();
            this._cmdNewNo.setEnabled(true);
            UtilGen.setControlValue(this.jo.lg_no_of_container, 0, 0, true);
            UtilGen.setControlValue(this.jo.lg_no_of_trucks, 0, 0, true);
            UtilGen.setControlValue(this.jo.lg_no_of_package, 0, 0, true);

            UtilGen.setControlValue(this.jo.lg_container_size_1, 0, 0, true);
            UtilGen.setControlValue(this.jo.lg_container_size_2, 0, 0, true);
            UtilGen.setControlValue(this.jo.lg_container_size_3, 0, 0, true);
            UtilGen.setControlValue(this.jo.lg_container_no_1, 0, 0, true);
            UtilGen.setControlValue(this.jo.lg_container_no_2, 0, 0, true);
            UtilGen.setControlValue(this.jo.lg_container_no_3, 0, 0, true);
            UtilGen.setControlValue(this.jo.lg_truck_no_1, 0, 0, true);
            UtilGen.setControlValue(this.jo.lg_truck_no_2, 0, 0, true);
            UtilGen.setControlValue(this.jo.lg_truck_no_3, 0, 0, true);

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
                    this.fill_cc();
                    this.fill_trans_type();
                    this.jo.ord_ref.setEnabled(false);
                    this.jo.ord_date.setEditable(false);
                    this.jo.ordacc.setEnabled(false);
                    this.jo.ord_type.setEnabled(false);
                    this.jo.costcent.setEnabled(false);
                } else {
                    this.fill_cc(false);
                    this.fill_trans_type(false);
                    this.controlTruck();
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

        var fnSearchLoc = function (e, cnt) {

            if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                UtilGen.setControlValue(cnt, "", "", true);
                return;
            }
            if (Util.nvl(cnt.getValue(), "") == "") {
                sap.m.MessageToast.show("Enter any value in field to search !");
                return;
            }
            var sq = "select country||','||state||','||city title from lg_regions where upper(country||','||state||','||city) like " +
                "'%'||'" + cnt.getValue().toUpperCase() + "'||'%'   order by country,state,city";
            Util.showSearchList(sq, "TITLE", "TITLE", function (valx, val) {
                UtilGen.setControlValue(cnt, val, valx, true);
            });
        };

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
                that.fill_trans_type();
                that.fill_cc();
            }
        }, "string", undefined, undefined, "@1/Land,2/Sea,3/Air,4/LCB,5/WH");

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
                that.fill_cc();
            },
            layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
        }, "string", undefined, undefined, "@01/Import,02/Export,03/Transport,04/Local,05/Third Party");
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
                that.controlTruck();
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
        //ORD_SHIP , lg_cust_ref_2
        this.jo.lg_cust_ref_2 = UtilGen.createControl(sap.m.Input, this.view, "lg_cust_ref2", {
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


        this.jo.lg_depart_loc = UtilGen.createControl(sap.m.SearchField, this.view, "joDepartLoc", {
            // layoutData: new sap.ui.layout.GridData({span: "XL4 L4 M4 S4"}),
            search: function (e) {
                fnSearchLoc(e, this);
            }
        }, "string");
        this.jo.lg_arrival_loc = UtilGen.createControl(sap.m.SearchField, this.view, "joArrivalLoc", {
            // layoutData: new sap.ui.layout.GridData({span: "XL4 L6 M6 S6"}),
            search: function (e) {
                fnSearchLoc(e, this);
            }
        }, "string");


        //lg_cargo_type_1------------------------------------------------------------

        this.jo.lg_cargo_type_1 = this.createListBox("lg_cargo_type_1");

        //lg_cargo_type_2------------------------------------------------------------
        this.jo.lg_cargo_type_2 = this.createListBox("lg_cargo_type_2");


        // lg_no_of_container,------------------------------------------------------------
        this.jo.lg_no_of_container = UtilGen.createControl(sap.m.Input, this.view, "lg_no_of_container", {}, "number");
        // lg_no_of_package,------------------------------------------------------------
        this.jo.lg_no_of_package = UtilGen.createControl(sap.m.Input, this.view, "lg_no_of_package", {}, "number");
        // lg_no_of_trucks,------------------------------------------------------------
        this.jo.lg_no_of_trucks = UtilGen.createControl(sap.m.Input, this.view, "lg_no_of_trucks", {}, "number");
        // lg_measures,------------------------------------------------------------
        this.jo.lg_measures = UtilGen.createControl(sap.m.Input, this.view, "lg_measures", {}, "string");
        // lg_no_of_weight,------------------------------------------------------------
        this.jo.lg_no_of_weight = UtilGen.createControl(sap.m.Input, this.view, "lg_no_of_weight", {}, "string");

        this.jo.lg_no_of_container.setEditable(false);
        this.jo.lg_no_of_trucks.setEditable(false);

        //lg_container_size_1,2,3
        // lg_container_type_1,------------------------------------------------------------
        this.jo.lg_container_type_1 = this.createListBox("lg_container_type_1");
        this.jo.lg_container_size_1 = UtilGen.createControl(sap.m.Input, this.view, "lg_container_size_1", {}, "number");
        this.jo.lg_container_no_1 = UtilGen.createControl(sap.m.Input, this.view, "lg_container_no_1", {}, "number");
        // lg_container_type_2,------------------------------------------------------------
        this.jo.lg_container_type_2 = this.createListBox("lg_container_type_2");
        this.jo.lg_container_size_2 = UtilGen.createControl(sap.m.Input, this.view, "lg_container_size_2", {}, "number");
        this.jo.lg_container_no_2 = UtilGen.createControl(sap.m.Input, this.view, "lg_container_no_2", {}, "number");
        // lg_container_type_3,------------------------------------------------------------
        this.jo.lg_container_type_3 = this.createListBox("lg_container_type_3");
        this.jo.lg_container_size_3 = UtilGen.createControl(sap.m.Input, this.view, "lg_container_size_3", {}, "number");
        this.jo.lg_container_no_3 = UtilGen.createControl(sap.m.Input, this.view, "lg_container_no_3", {}, "number");


        // lg_truck_type_1,------------------------------------------------------------
        this.jo.lg_truck_type_1 = this.createListBox("lg_truck_type_1");
        this.jo.lg_truck_no_1 = UtilGen.createControl(sap.m.Input, this.view, "lg_truck_no_1", {}, "number");
        // lg_truck_type_2,------------------------------------------------------------
        this.jo.lg_truck_type_2 = this.createListBox("lg_truck_type_2");
        this.jo.lg_truck_no_2 = UtilGen.createControl(sap.m.Input, this.view, "lg_truck_no_2", {}, "number");
        // lg_truck_type_3,------------------------------------------------------------
        this.jo.lg_truck_type_3 = this.createListBox("lg_truck_type_3");
        this.jo.lg_truck_no_3 = UtilGen.createControl(sap.m.Input, this.view, "lg_truck_no_3", {}, "number");


        // lg_eqp_type_1,------------------------------------------------------------
        this.jo.lg_eqp_type_1 = this.createListBox("lg_eqp_type_1");
        this.jo.lg_eqp_cap_1 = this.createListBox("lg_eqp_cap_1");
        // lg_eqp_type_2,------------------------------------------------------------
        this.jo.lg_eqp_type_2 = this.createListBox("lg_eqp_type_2");
        this.jo.lg_eqp_cap_2 = this.createListBox("lg_eqp_cap_2");
        this.jo.lg_eqp_type_3 = this.createListBox("lg_eqp_type_3");
        this.jo.lg_eqp_cap_3 = this.createListBox("lg_eqp_cap_3");


        var fr = function (ev) {
            var c1 = parseFloat(Util.nvl(UtilGen.getControlValue(that.jo.lg_container_no_1), 0));
            var c2 = parseFloat(Util.nvl(UtilGen.getControlValue(that.jo.lg_container_no_2), 0));
            var c3 = parseFloat(Util.nvl(UtilGen.getControlValue(that.jo.lg_container_no_3), 0));
            var c = c1 + c2 + c3;
            UtilGen.setControlValue(that.jo.lg_no_of_container, c, c, true);

        };

        var tr = function (ev) {
            var c1 = parseFloat(Util.nvl(UtilGen.getControlValue(that.jo.lg_truck_no_1), 0));
            var c2 = parseFloat(Util.nvl(UtilGen.getControlValue(that.jo.lg_truck_no_2), 0));
            var c3 = parseFloat(Util.nvl(UtilGen.getControlValue(that.jo.lg_truck_no_3), 0));
            var c = c1 + c2 + c3;
            UtilGen.setControlValue(that.jo.lg_no_of_trucks, c, c, true);

        };


        this.jo.lg_container_no_1.attachChange(fr);
        this.jo.lg_container_no_2.attachChange(fr);
        this.jo.lg_container_no_3.attachChange(fr);

        this.jo.lg_truck_no_1.attachChange(tr);
        this.jo.lg_truck_no_2.attachChange(tr);
        this.jo.lg_truck_no_3.attachChange(tr);

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
                    "Cust. Ref 2# ", this.jo.lg_cust_ref_2,
                    "Cust Inv NO", this.jo.adjust_descr,
                    "Origin", this.jo.attn,
                    "Destination", this.jo.payterm,
                    "Depart. Loc.", this.jo.lg_depart_loc,
                    "Arrival Loc.", this.jo.lg_arrival_loc,
                    "#Cargo",
                    "Type 1", this.jo.lg_cargo_type_1,
                    "Type 2", this.jo.lg_cargo_type_2,
                    "#No Of :",
                    "Container.", this.jo.lg_no_of_container,
                    "Packages", this.jo.lg_no_of_package,
                    "Trucks", this.jo.lg_no_of_trucks,
                    "Measures", this.jo.lg_measures,
                    "No of Weight Ctg", this.jo.lg_no_of_weight,
                    "#Containers:",
                    "Type 1", this.jo.lg_container_type_1,
                    "@Size", this.jo.lg_container_size_1,
                    "@No", this.jo.lg_container_no_1,
                    "Type 2", this.jo.lg_container_type_2,
                    "@Size", this.jo.lg_container_size_2,
                    "@No", this.jo.lg_container_no_2,
                    "Type 3", this.jo.lg_container_type_3,
                    "@Size", this.jo.lg_container_size_3,
                    "@No", this.jo.lg_container_no_3,
                    "#Trucks:",
                    "Type 1", this.jo.lg_truck_type_1,
                    "@No", this.jo.lg_truck_no_1,
                    "Type 2", this.jo.lg_truck_type_2,
                    "@No", this.jo.lg_truck_no_2,
                    "Type 3", this.jo.lg_truck_type_3,
                    "@No", this.jo.lg_truck_no_3,
                    "#Handling Equpments:",
                    "Type 1", this.jo.lg_eqp_type_1,
                    "@Cap", this.jo.lg_eqp_cap_1,
                    "Type 2", this.jo.lg_eqp_type_2,
                    "@Cap", this.jo.lg_eqp_cap_2,
                    "Type 3", this.jo.lg_eqp_type_3,
                    "@Cap", this.jo.lg_eqp_cap_3,
                    "# ",
                    "# ",
                    "# "
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
    createListBox: function (fldname) {

        var _obj = UtilGen.createControl(sap.m.ComboBox, this.view, fldname, {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{NAME}"}),
                templateShareable: true
            },
            selectionChange: function (event) {

            }
        }, "string", undefined, undefined, "select NAME,DESCR from relists where idlist=" + Util.quoted(fldname) + " order by POS");
        return _obj;

    },

    createListBox2: function (fldname, fe, lbl, isCombo) {

        var _obj;
        if (Util.nvl(isCombo, true))
            _obj = UtilGen.addControl(fe, lbl, sap.m.ComboBox, "jo_",
                {
                    items: {
                        path: "/",
                        template: new sap.ui.core.ListItem({text: "{NAME}", key: "{NAME}"}),
                        templateShareable: true
                    },
                    selectedKey: "",
                    // layoutData: new sap.ui.layout.GridData({span: codSpan}),
                }, "string", undefined, this.view, undefined, "select NAME,DESCR from relists where idlist=" + Util.quoted(fldname) + " order by POS");
        else
            _obj = UtilGen.addControl(fe, lbl, sap.m.Input, "jo_",
                {
                    enabled: true,
                    // layoutData: new sap.ui.layout.GridData({span: titSpan}),
                }, "string", undefined, this.view);

        return _obj;

    },

    controlTruck: function () {
        var cc = Util.nvl(UtilGen.getControlValue(this.jo.costcent), "");
        if (cc != "") {
            var yn = Util.getSQLValue("select allow_trucks from accostcent1 where code=" + Util.quoted(cc));
            if (yn == "N") {
                UtilGen.setControlValue(this.jo.lg_truck_no_1, 0, 0, true);
                UtilGen.setControlValue(this.jo.lg_truck_no_2, 0, 0, true);
                UtilGen.setControlValue(this.jo.lg_truck_no_3, 0, 0, true);
                UtilGen.setControlValue(this.jo.lg_truck_type_1, "", "", true);
                UtilGen.setControlValue(this.jo.lg_truck_type_2, "", "", true);
                UtilGen.setControlValue(this.jo.lg_truck_type_3, "", "", true);
                this.jo.lg_truck_type_1.setEnabled(false);
                this.jo.lg_truck_type_2.setEnabled(false);
                this.jo.lg_truck_type_3.setEnabled(false);
                this.jo.lg_truck_no_1.setEnabled(false);
                this.jo.lg_truck_no_2.setEnabled(false);
                this.jo.lg_truck_no_3.setEnabled(false);
            } else {
                this.jo.lg_truck_type_1.setEnabled(true);
                this.jo.lg_truck_type_2.setEnabled(true);
                this.jo.lg_truck_type_3.setEnabled(true);
                this.jo.lg_truck_no_1.setEnabled(true);
                this.jo.lg_truck_no_2.setEnabled(true);
                this.jo.lg_truck_no_3.setEnabled(true);

            }

        }
    },
    fill_cc: function (pSetVal) {
        var setVal = Util.nvl(pSetVal, true);
        var jt = Util.nvl(UtilGen.getControlValue(this.jo.ord_type), "");
        var tt = Util.nvl(UtilGen.getControlValue(this.jo.ordacc), "");

        if (jt == "" || tt == "")
            return;
        jt = parseInt(jt);

        //@1/Land,2/Sea,3/Air,4/LCB,5/WH

        var jfld = (jt == 1 ? "jt_l" :
            (jt == 2 ? "jt_sea" :
                (jt == 3 ? "jt_air" :
                    (jt == 4 ? "jt_lcb" :
                        (jt == 5 ? "jt_wh" : "")))));
        // @01/Import,02/Export,03/Transport,04/Local,05/Third Party
        var tfld = (tt == "01" ?
            "tt_imp" :
            tt == "02" ? "tt_exp" :
                tt == "03" ? "tt_trans" :
                    tt == "04" ? "tt_l" :
                        tt == "05" ? "tt_tp" : "");
        if (tfld == "" || jfld == "")
            return;
        var sq = "select code,title from accostcent1 where " + jfld + "='Y' and " +
            tfld + "='Y'" + " and childcount=0 order by path";
        if (setVal) {
            UtilGen.setControlValue(this.jo.costcent, "", "", true);
            this.jo.costcent.clearSelection();
            Util.fillCombo(this.jo.costcent, sq, false);
            this.jo.costcent.setSelectedItem(this.jo.costcent.getItems()[0]);
        }


    },
    fill_trans_type: function (pSetVal) {
        var that = this;
        var setVal = Util.nvl(pSetVal, true);

        var jt = UtilGen.getControlValue(this.jo.ord_type);

        // jo_type
        // 1/Land,2/Sea,3/Air,4/LCB,5/WH

        //ordacc trans_type
        // @01/Import,02/Export,03/Transport,04/Local,05/Third Party

        Util.fillCombo(this.jo.ordacc, "@04/Local");

        if (jt == "1" || jt == 1)
            Util.fillCombo(this.jo.ordacc, "@04/Local");
        if (jt == "2" || jt == 2)
            Util.fillCombo(this.jo.ordacc, "@01/Import,02/Export,05/Third Party");
        if (jt == "3" || jt == 3)
            Util.fillCombo(this.jo.ordacc, "@01/Import,02/Export,05/Third Party");
        if (jt == "4" || jt == 4)
            Util.fillCombo(this.jo.ordacc, "@01/Import,02/Export,05/Third Party");

        if (setVal) {
            UtilGen.setControlValue(this.jo.ordacc, "", "", true);
            this.jo.ordacc.clearSelection();
            this.jo.ordacc.setSelectedItem(this.jo.ordacc.getItems()[0]);
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
        if (Util.nvl(ord, "") == "")
            return;
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
                        if (that.joDet1.lg_departure != undefined && that.joDet1.lg_departure != undefined &&
                            that.joDet1.lg_departure.getValue() != null &&
                            Util.nvl(that.joDet1.lg_departure.getValue(), "") != "") {
                            var dt = UtilGen.getControlValue(that.joDet1.lg_departure);
                            var at = UtilGen.getControlValue(that.joDet1.lg_l_arrival_date);
                            if (at == null || at == undefined) {
                                sap.m.MessageToast.show("Arrival date must be entered as departure date is entered !");
                                return false;
                            }

                            if (dt.getTime() > at.getTime()) {
                                sap.m.MessageToast.show("arrival date must be greater than departure date !");
                                return false;
                            }
                        }

                        if (that.joDet1.lg_etd != undefined &&
                            that.joDet1.lg_etd.getValue() != null &&
                            Util.nvl(that.joDet1.lg_etd.getValue(), "") != "") {
                            var dt = UtilGen.getControlValue(that.joDet1.lg_etd);
                            var at = UtilGen.getControlValue(that.joDet1.lg_eta);
                            if (at == null || at == undefined) {
                                sap.m.MessageToast.show("ETA must be entered as ETD  is entered !");
                                return false;
                            }
                            if (dt.getTime() > at.getTime()) {
                                sap.m.MessageToast.show("ETA  must be greater than ETD date !");
                                return false;
                            }
                        }

                        that.joApp.to(that.mainPage, "flip");
                    }
                }),
                new sap.m.Text({
                    text: "Job Ord # " + selectedJob + " , " + that.jo.ord_type.text
                })
            ]

        });

        this.addUptoDutyPaid(frmElements);

        // 1/Land,2/Sea,3/Air,4/LCB,5/WH

        // 1/Land
        if (ord_type == "1") {
            // LG_A_MAWB, MAWB #
            this.joDet1.lg_a_mawb = this.addControl(frmElements, "AWB", sap.m.Input, "detmwb", {selected: false}, "string");

            // LG_END_USER_TYPE,  End User Type
            this.joDet1.lg_end_user_type = this.createListBox2("lg_end_user_type", frmElements, "End User Type", true);
            // LG_VENDOR_NAME, Vendor/Driver Name
            this.joDet1.lg_vendor_name = this.createListBox2("lg_vendor_name", frmElements, "Vendor/Driver Name", false);
            // LG_VENDOR_CONTACT ,  Vendor/Driver   Contact Number
            this.joDet1.lg_vendor_contact = this.createListBox2("lg_vendor_contact", frmElements, "Vendor/Driver Contact No", false);
            // LG_DESCRIPTION,  Description
            this.joDet1.lg_description = this.createListBox2("lg_description", frmElements, "Description", false);
            // LG_NOTES,  Remark
            this.joDet1.lg_notes = this.createListBox2("lg_notes", frmElements, "Remark", false);


            frmElements.push(new sap.ui.core.Title({text: "Other info"}));


            // LG_L_CLEARANCE_DATE, Clearance Date
            this.joDet1.lg_l_clearance_date = UtilGen.addControl(frmElements, "Clearance Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_ARRIVAL_DATE ,  Arrival Date
            this.joDet1.lg_l_arrival_date = UtilGen.addControl(frmElements, "Arrival Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_LOADING_DATE,  Loading Date
            this.joDet1.lg_loading_date = UtilGen.addControl(frmElements, "Loading Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_CROSS_LOAD,  Cross Loading Date
            this.joDet1.lg_cross_load = UtilGen.addControl(frmElements, "Cross Loading Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_DELIVERY_DATE,  Delivery Date
            this.joDet1.lg_l_delivery_date = UtilGen.addControl(frmElements, "Delivery Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_OFFLOAD_DATE, Offloading Date
            this.joDet1.lg_l_offload_date = UtilGen.addControl(frmElements, "Offloading Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_CLOSING,  Closing Date
            this.joDet1.lg_closing = UtilGen.addControl(frmElements, "Closing Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);


        }
        // 2/Sea
        if (ord_type == "2") {

            // LG_S_VESSEL_NAME,  Vessel Name
            this.joDet1.lg_s_vessel_name = this.addControl(frmElements, "Vessel Name", sap.m.Input, "detVesselName", {selected: false}, "string");
            // LG_S_MBL, MBL#
            this.joDet1.lg_s_mbl = this.addControl(frmElements, "MBL", sap.m.Input, "detMbl", {selected: false}, "string");
            // LG_SHIPPER, Shipper
            this.joDet1.lg_shipper = this.addControl(frmElements, "Shipper", sap.m.Input, "detShipper", {selected: false}, "string");
            // LG_CONSIGNEE, Consignee
            this.joDet1.lg_consignee = this.addControl(frmElements, "Consignee", sap.m.Input, "detConsignee", {selected: false}, "string");
            // LG_DESCRIPTION,  Description
            this.joDet1.lg_description = this.createListBox2("lg_description", frmElements, "Description", false);
            // LG_NOTES,  Remark
            this.joDet1.lg_notes = this.createListBox2("lg_notes", frmElements, "Remark", false);

            frmElements.push(new sap.ui.core.Title({text: "Other info"}));

            // LG_ETD,etd
            this.joDet1.lg_etd = UtilGen.addControl(frmElements, "ETD", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_ETA, eta
            this.joDet1.lg_eta = UtilGen.addControl(frmElements, "ETA", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_DEPARTURE,Departure Date
            this.joDet1.lg_departure = UtilGen.addControl(frmElements, "Departure Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_ARRIVAL_DATE, Arrival Date
            this.joDet1.lg_l_arrival_date = UtilGen.addControl(frmElements, "Arrival Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_CLEARANCE_DATE, Clearance Date
            this.joDet1.lg_l_clearance_date = UtilGen.addControl(frmElements, "Clearance Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_RELEASE, Releasing Date
            this.joDet1.lg_release = UtilGen.addControl(frmElements, "Releasing Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_LOADING_DATE, Loading Date
            this.joDet1.lg_loading_date = UtilGen.addControl(frmElements, "Loading Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_OFFLOAD_DATE, Offloading Date
            this.joDet1.lg_l_offload_date = UtilGen.addControl(frmElements, "Offloading Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_DELIVERY_DATE, Delivery Date
            this.joDet1.lg_l_delivery_date = UtilGen.addControl(frmElements, "Delivery Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_CLOSING, Closing Date
            this.joDet1.lg_closing = UtilGen.addControl(frmElements, "Closing Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);


        }
        // 3/AIR
        if (ord_type == "3") {


            // LG_A_AIRLINE, Air Line Name
            this.joDet1.lg_a_airline = this.addControl(frmElements, "Airline", sap.m.Input, "detAirline", {selected: false}, "string");
            // LG_A_MAWB, MAWB #
            this.joDet1.lg_a_mawb = this.addControl(frmElements, "MAWB", sap.m.Input, "detmwb", {selected: false}, "string");
            // LG_SHIPPER
            this.joDet1.lg_shipper = this.addControl(frmElements, "Shipper", sap.m.Input, "detShipper", {selected: false}, "string");
            //LG_CONSIGNEE
            this.joDet1.lg_consignee = this.addControl(frmElements, "Consignee", sap.m.Input, "detConsignee", {selected: false}, "string");
            // LG_DESCRIPTION,  Description
            this.joDet1.lg_description = this.createListBox2("lg_description", frmElements, "Description", false);
            // LG_NOTES,  Remark
            this.joDet1.lg_notes = this.createListBox2("lg_notes", frmElements, "Remark", false);

            frmElements.push(new sap.ui.core.Title({text: "Other info"}));

            // LG_ETD,etd
            this.joDet1.lg_etd = UtilGen.addControl(frmElements, "ETD", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_ETA, eta
            this.joDet1.lg_eta = UtilGen.addControl(frmElements, "ETA", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_DEPARTURE,Departure Date
            this.joDet1.lg_departure = UtilGen.addControl(frmElements, "Departure Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_ARRIVAL_DATE, Arrival Date
            this.joDet1.lg_l_arrival_date = UtilGen.addControl(frmElements, "Arrival Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);


            // LG_L_CLEARANCE_DATE, Clearance Date
            this.joDet1.lg_l_clearance_date = UtilGen.addControl(frmElements, "Clearance Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_RELEASE, Releasing Date
            this.joDet1.lg_release = UtilGen.addControl(frmElements, "Releasing Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_LOADING_DATE, Loading Date
            this.joDet1.lg_loading_date = UtilGen.addControl(frmElements, "Loading Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_OFFLOAD_DATE, Offloading Date
            this.joDet1.lg_l_offload_date = UtilGen.addControl(frmElements, "Offloading Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_DELIVERY_DATE, Delivery Date
            this.joDet1.lg_l_delivery_date = UtilGen.addControl(frmElements, "Delivery Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_CLOSING, Closing Date
            this.joDet1.lg_closing = UtilGen.addControl(frmElements, "Closing Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);


            // LG_A_FLT_NO
            // this.joDet1.lg_a_flt_no = this.addControl(frmElements, "FLT NO", sap.m.Input, "detFltNo", {selected: false}, "string");
            // LG_L_ORIGIN_TRUCK
            // this.joDet1.lg_l_origin_truck = this.addControl(frmElements, "Origin Truck", sap.m.Input, "detOrigTruck", {selected: false}, "string");
            // LG_A_HAWB
            // this.joDet1.lg_a_hawb = this.addControl(frmElements, "HAWB", sap.m.Input, "detawb", {selected: false}, "string");
            // LG_TRUCK_IQ ,   LG_TRUCK_TYPE
            // this.joDet1.lg_truck_iq = this.addControl(frmElements, "Truck IQ / Type", sap.m.Input, "detTruckIq", {selected: false}, "string");
            // this.joDet1.lg_truck_type = this.addControl(frmElements, "", sap.m.Input, "detTruckType", {selected: false}, "string");
            //
        }
        // 4/LCB
        if (ord_type == "4") {
            // LG_A_MAWB, MAWB #
            this.joDet1.lg_a_mawb = this.addControl(frmElements, "AWB", sap.m.Input, "detmwb", {selected: false}, "string");
            // LG_VENDOR_NAME, Vendor/Driver Name
            this.joDet1.lg_vendor_name = this.createListBox2("lg_vendor_name", frmElements, "Vendor/Driver Name", false);
            // LG_VENDOR_CONTACT ,  Vendor/Driver   Contact Number
            this.joDet1.lg_vendor_contact = this.createListBox2("lg_vendor_contact", frmElements, "Vendor/Driver Contact No", false);
            // LG_DESCRIPTION,  Description
            this.joDet1.lg_description = this.createListBox2("lg_description", frmElements, "Description", false);
            // LG_NOTES,  Remark
            this.joDet1.lg_notes = this.createListBox2("lg_notes", frmElements, "Remark", false);

            frmElements.push(new sap.ui.core.Title({text: "Other info"}));


            // LG_L_CLEARANCE_DATE, Clearance Date
            this.joDet1.lg_l_clearance_date = UtilGen.addControl(frmElements, "Clearance Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);
            // LG_LOADING_DATE, Loading at Site
            this.joDet1.lg_loading_date = UtilGen.addControl(frmElements, "Loading Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_RELEASE,  Releasing Date from Site
            this.joDet1.lg_release = UtilGen.addControl(frmElements, "Releasing Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_START_CUST_CLEARANCE, Date of Starting Custom Clearance
            this.joDet1.lg_start_cust_clearance = UtilGen.addControl(frmElements, "Starting Custom Clearance", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_COMPLETE_CUSTOM, Date of completing custom clearance
            this.joDet1.lg_complete_custom = UtilGen.addControl(frmElements, "completing custom clearance", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_RELEASE_FROM_BORDER, Releasing Date from Border
            this.joDet1.lg_release_from_border = UtilGen.addControl(frmElements, "Releasing Date from Border", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_CROSS_LOAD,  Cross Loading date
            this.joDet1.lg_cross_load = UtilGen.addControl(frmElements, "Cross Loading", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_OFFLOAD_DATE, Offloading Date
            this.joDet1.lg_l_offload_date = UtilGen.addControl(frmElements, "Offloading Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_L_DELIVERY_DATE, Delivery Date
            this.joDet1.lg_l_delivery_date = UtilGen.addControl(frmElements, "Delivery Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_CLOSING, Closing Date
            this.joDet1.lg_closing = UtilGen.addControl(frmElements, "Closing Date", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

        }

        // 5/WH
        if (ord_type == "5") {

            // LG_CARGO_TYPE, Cargo Type
            this.joDet1.lg_cargo_type = this.createListBox2("lg_cargo_type", frmElements, "Cargo Type", true);
            // LG_CBMS, CBM's
            this.joDet1.lg_cargo_type = this.createListBox2("lg_cmbs", frmElements, "CBM_s", false);
            // LG_CARGO_IN, Cargo In Date
            this.joDet1.lg_cargo_in = UtilGen.addControl(frmElements, "Cargo In", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);

            // LG_CARGO_OUT,  Cargo Out Date
            this.joDet1.lg_cargo_out = UtilGen.addControl(frmElements, "Cargo Out", sap.m.DatePicker, "jo_",
                {}, "date", undefined, this.view);


        }

        // frmElements.push(new sap.ui.core.Title({text: "Other info"}));
        // this.joDet1.lg_description = this.addControl(frmElements, "Descr", sap.m.Input, "detDescr", {selected: false}, "string");
        // this.joDet1.lg_notes = this.addControl(frmElements, "Remarks", sap.m.Input, "detRemarks", {selected: false}, "string");
        // this.joDet1.lg_l_arrival_date = this.addControl(frmElements, "Arrival date", sap.m.DatePicker, "detArrival", {
        //     valueFormat: sett["ENGLISH_DATE_FORMAT"],
        //     displayFormat: sett["ENGLISH_DATE_FORMAT"]
        // }, "date");
        // this.joDet1.lg_l_delivery_date = this.addControl(frmElements, "Delivery date", sap.m.DatePicker, "detDelvDate", {
        //     valueFormat: sett["ENGLISH_DATE_FORMAT"],
        //     displayFormat: sett["ENGLISH_DATE_FORMAT"]
        // }, "date");
        // this.joDet1.lg_l_clearance_date = this.addControl(frmElements, "Clearance date", sap.m.DatePicker, "detClearDate", {
        //     valueFormat: sett["ENGLISH_DATE_FORMAT"],
        //     displayFormat: sett["ENGLISH_DATE_FORMAT"]
        // }, "date");


        // end element for scrolling...
        frmElements.push(new sap.ui.core.Title({text: ""}));

        this.pgDetail.addContent(tb);
        frmBasic = UtilGen.formCreate("", true, frmElements);
        this.pgDetail.addContent(frmBasic);

    }
    ,
    addUptoDutyPaid: function (frmElements) {
        var that = this;
        var sel = function (e, cnt) {
            UtilGen.setControlValue(that.joDet1.lg_permanent_exemption, "N", "N", false);
            UtilGen.setControlValue(that.joDet1.lg_temporary_import, "N", "N", false);
            UtilGen.setControlValue(that.joDet1.lg_duty_paid, "N", "N", false);
            UtilGen.setControlValue(that.joDet1.lg_l_re_export, "N", "N", false);
            UtilGen.setControlValue(cnt, "Y", "Y", false);
        };

        // LG_PERMANENT_EXEMPTION checkbox ,  LG_NO_OF_PCS
        this.joDet1.lg_permanent_exemption = this.addControl(frmElements,
            "Perm. Exempt", sap.m.CheckBox, "detPExmpt",
            {
                selected: true,
                select: function (e) {
                    sel(e, this);
                }
            }, "boolean");
        this.joDet1.lg_permanent_exemption.trueValues = ["Y", "N"];
        // LG_TEMPORARY_IMPORT checkbox  , LG_WEIGHT
        this.joDet1.lg_temporary_import = this.addControl(frmElements, "Temp. Import", sap.m.CheckBox, "detTmpImp",
            {
                selected: false, select: function (e) {
                    sel(e, this);
                }
            }, "boolean");
        this.joDet1.lg_temporary_import.trueValues = ["Y", "N"]; // true value , false value;

        // LG_DUTY_PAID  checkbox ,  LG_MEASUREMENT
        this.joDet1.lg_duty_paid = this.addControl(frmElements, "Duty Paid",
            sap.m.CheckBox, "detDutyPaid", {
                selected: false, select: function (e) {
                    sel(e, this);
                }
            }, "boolean");
        this.joDet1.lg_duty_paid.trueValues = ["Y", "N"]; // true value , false value;


        this.joDet1.lg_l_re_export = this.addControl(frmElements,
            "Re Export", sap.m.CheckBox, "detReExp",
            {
                selected: false, select: function (e) {
                    sel(e, this);
                }
            }, "boolean");
        this.joDet1.lg_l_re_export.trueValues = ["Y", "N"]; // true value , false value;


        // this.joDet1.lg_no_of_pcs = this.addControl(frmElements, new sap.m.Text({
        //     text: "No Of Pcs",
        //     textAlign: sap.ui.core.TextAlign.Right
        // }), sap.m.Input, "detNoOfPcs", {selected: false}, "string");
        //


        // this.joDet1.lg_weight = this.addControl(frmElements, new sap.m.Text({
        //     text: "Weight",
        //     textAlign: sap.ui.core.TextAlign.Right
        // }), sap.m.Input, "detWeight", {selected: false}, "string");
        //

        // this.joDet1.lg_measurement = this.addControl(frmElements, new sap.m.Text({
        //     text: "Measurement",
        //     textAlign: sap.ui.core.TextAlign.Right
        // }), sap.m.Input, "detMeasurement", {selected: false}, "string");
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
        var cc = Util.nvl(UtilGen.getControlValue(this.jo.costcent), "");
        if (cc != "") {
            var yn = Util.getSQLValue("select allow_trucks from accostcent1 where code=" + Util.quoted(cc));
            if (yn == "Y") {
                var nof = UtilGen.getControlValue(this.jo.lg_no_of_trucks);
                if (nof == 0) {
                    sap.m.MessageToast.show(this.jo.costcent.getValue() + " assigned as must have no of truck > 0 ");
                    return false;
                }
            }
        }
        if (this.joDet1.lg_departure != undefined && this.joDet1.lg_departure.getValue() != null && Util.nvl(this.joDet1.lg_departure.getValue(), "") != "") {
            var dt = UtilGen.getControlValue(this.joDet1.lg_departure);
            var at = UtilGen.getControlValue(this.joDet1.lg_l_arrival_date);
            if (at == null || at == undefined) {
                sap.m.MessageToast.show("Arrival date must be entered as departure date is entered !");
                return false;
            }

            if (dt.getTime() > at.getTime()) {
                sap.m.MessageToast.show("arrival date must be greater than departure date !");
                return false;
            }
        }

        if (this.joDet1.lg_etd != undefined &&
            this.joDet1.lg_etd.getValue() != null && Util.nvl(this.joDet1.lg_etd.getValue(), "") != "") {
            var dt = UtilGen.getControlValue(this.joDet1.lg_etd);
            var at = UtilGen.getControlValue(this.joDet1.lg_eta);
            if (at == null || at == undefined) {
                sap.m.MessageToast.show("ETA must be entered as ETD  is entered !");
                return false;
            }

            if (dt.getTime() > at.getTime()) {
                sap.m.MessageToast.show("ETA  must be greater than ETD date !");
                return false;
            }
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



