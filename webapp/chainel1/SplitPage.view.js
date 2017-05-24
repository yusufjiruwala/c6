sap.ui.jsview("chainel1.SplitPage", {
    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf routingdemo.App
     */
    getControllerName: function () {
        return "chainel1.SplitPage";
    },
    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf routingdemo.App
     */
    createContent: function (oController) {

        var oData = {
            data: [
                {
                    name: "yusuf",
                    code: "0010",
                    amt: 100

                },
                {
                    name: "yusuf",
                    code: "0010",
                    amt: 200
                },
                {
                    name: "yusuf1",
                    code: "003",
                    amt: 10000
                },
                {
                    name: "yusuf1",
                    code: "003",
                    amt: 10000
                },
                {
                    name: "yusuf1",
                    code: "003",
                    amt: 10000
                },
                {
                    name: "yusuf1",
                    code: "003",
                    amt: 10000
                },
                {
                    name: "yusuf1",
                    code: "003",
                    amt: 10000
                },
                {
                    name: "yusuf1",
                    code: "003",
                    amt: 10000
                }

            ]
        };

        var oModel = new sap.ui.model.json.JSONModel(oData);
        this.setModel(oModel, "test");


        // oTable.setModel(oController.getModel());
        jQuery.sap.require("sapui6.ui.table.Table-dbg");
        var oColumn1 = new sapui6.ui.table.Column({
            title: "Title1",
            path: "test>name",
            width: "80px",
            align: "center",
            showSortMenuEntry: true,
            showGroupMenuEntry: true

        });
        var oColumn2 = new sapui6.ui.table.Column({
            title: "Title2",
            path: "test>code",
            width: "80px",
            align: "center"
        });

        var oColumn3 = new sapui6.ui.table.Column({
            title: "Title2",
            path: "test>amt",
            width: "80px",
            align: "right",
            format: "##,###.###",
            groupSummary: "sum"
        });

        this.table = new sapui6.ui.table.Table({
            height:"300px",
            columns: [oColumn1, oColumn2, oColumn3],
            mergeColumnIndex: 0,
            rowBorderStyle: "outset",
            showGroupSummary: true
        });
        this.table.bindRows("test>/data");


        //detail page info ..
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel({pageTitle: ""}), "detailP");

        var controller = this.oController;
        var oData = null;
        var sData = "";
        if (!!sap.ui.Device.browser.webkit

            && !document.width) {

            jQuery.sap.require("sap.ui.core.ScrollBar");

            var fnOrg = sap.ui.core.ScrollBar.prototype.onAfterRendering;

            sap.ui.core.ScrollBar.prototype.onAfterRendering = function () {

                document.width = window.outerWidth;

                fnOrg.apply(this, arguments);

                document.width = undefined;

            };

        }

        this.setDisplayBlock(true);

        Util.doAjaxGet("exe?command=get-current-profile", "", false).done(function (dt) {

            sap.ui.getCore().setModel(null, "current_profile");

            if (dt == null || dt == undefined) return;

            var dtx = JSON.parse(dt);

            if (dtx.errorMsg != null && dtx.errorMsg.length > 0) {
                sap.m.MessageToast.show(dt.errorMsg);
                return;
            }
            if (dtx.name == null || dtx.name == undefined) {
                sap.m.MessageToast.show("No default profile....");
                return;
            }
            sap.ui.getCore().byId("SplitPage").setProfile(dtx);
            // this.setProfile(dtx);
        });


        this.oSplitApp = new sap.m.SplitApp("oSplitApp");
        var app = this.oSplitApp;

        var menuBar = new sap.m.Bar({
            contentLeft: [new sap.m.Button({
                icon: "sap-icon://log",
                press: function () {
                    document.location.href = "/";
                }
            })],
            contentMiddle: [new sap.m.Label({
                text: "{selectedP>/name}",
                textAlign: "Center",
                design: "Bold"
            })],

            contentRight: [new sap.m.Button({
                icon: "sap-icon://drop-down-list",
                tooltip: "Select another role !",
                press: function (e) {
                    oController.select_profile(e);
                }
            })
            ]

        });

        this.oPage1 = new sap.m.Page("pgMenus",
            {
                customHeader: menuBar,
                content: [
                    this.dt.mTree
                ]
            })
        ;

        this.oPage2 = new sap.m.Page("pgDashboard", {

            showNavButton: sap.ui.Device.system.phone,
            navButtonPress: function () {
                app.toMaster("pgMenus", "flip");
            },
            title: "Dashboard",
            content: [this.table]

        });


        this.oSplitApp.addMasterPage(this.oPage1);
        this.oSplitApp.addDetailPage(this.oPage2);
        // this.oSplitApp.addDetailPage(this.oPgQuickRep);
        this.oSplitApp.setInitialDetail(this.oPage2);
        // jQuery("#pgMenus").height("90%");
        return this.oSplitApp;
    },

    setProfile: function (dtx) {
        var sData;
        Util.doAjaxGet(`sqltojson?tablename=cp_main_menus&ordby1-menu_code=menu_code&col-1=menu_title&col-2=menu_code&col-3=parent_menucode&col-4=menu_path&col-5=type_of_exec&col-6=exec_line&and-equal-group_code=` + dtx.code, "", false).done(function (data) {
            //oData = JSON.parse(data);
            sData = data;
        });

        var mdl = new sap.ui.model.json.JSONModel(dtx);
        sap.ui.getCore().setModel(mdl, "selectedP");
        this.setModel(mdl, "selectedP");

        if (sData == null || sData.length == 0) return;


        if (this.LocalTableData === undefined)
            this.LocalTableData = sap.ui.require("sap/ui/chainel1/util/generic/LocalTableData");

        if (this.lctb === undefined)
            this.lctb = new this.LocalTableData();

        this.lctb.parse(sData);
        if (this.DataTree === undefined)
            this.DataTree = sap.ui.require("sap/ui/chainel1/util/generic/DataTree");
        if (this.dt === undefined)
            this.dt = this.DataTree.create(("menutree"), this.lctb, "menu_code", "menu_title", "parent_menucode");

        this.dt.loadData();
        this.dt.mTree.setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.dt.mTree.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);

        var dtt = this.dt;
        var lctbb = this.lctb;
        var lastSelIndex = -1;
        var lastSelItem;
        var lastSelectedCode = "";

        if (this.attachDone === undefined) {
            dtt.mTree.attachEvent("rowSelectionChange", function () {

                if (arguments[0].getSource().getSelectedIndex() > -1) {
                    lastSelIndex = arguments[0].getSource().getSelectedIndex();
                }

                var currentRowContext = arguments[0].getParameter("rowContext");

                var oSystemDetailsML = dtt.mTree.getModel();
                lastSelectedCode = oSystemDetailsML.getProperty("MENU_CODE", currentRowContext);


                if (sap.ui.Device.system.phone)
                    sap.ui.getCore().byId("SplitPage").select_menu(lastSelectedCode);

            });


            this.dt.mTree.attachBrowserEvent("dblclick", function () {
                //var s = lctbb.getFieldValue(lastSelIndex, "MENU_CODE");
                sap.ui.getCore().byId("SplitPage").select_menu(lastSelectedCode);


            });


            this.attachDone = true;
        }
        // removing all columns
        for (var i = 0; i < this.dt.mTree.getColumns().length; i++) {
            if (i > 0) {
                this.dt.mTree.getColumns()[i].setVisible(false);
            }
        }
        this.dt.mTree.getColumns()[0].setWidth("100%");

        return sData;
    },

    select_menu: function (cod) {
        if (cod === undefined)
            return;
        var rowno = this.lctb.find("MENU_CODE", cod);
        var st = this.lctb.getFieldValue(rowno, "MENU_TITLE");
        var toe = this.lctb.getFieldValue(rowno, "TYPE_OF_EXEC");
        var el = this.lctb.getFieldValue(rowno, "EXEC_LINE");
        sap.ui.getCore().byId("SplitPage").createQuickReportPage();

        sap.ui.getCore().getModel("detailP").getData().pageTitle = st;
        sap.ui.getCore().getModel("detailP").refresh(true);

        //sap.ui.getCore().byId("SplitPage").byId("lblTitle").setText(st);


        if (toe == "QUICKREP") {
            if (!this.oSplitApp.getDetailPages().indexOf(this.oPgQuickRep) > -1)
                this.oSplitApp.addDetailPage(this.oPgQuickRep);
            this.oSplitApp.toDetail(this.oPgQuickRep);
            this.oSplitApp.hideMaster();
            this.oPgQuickRep.showReportPara(el);
        } else {
            this.oSplitApp.toDetail(this.oPage2);
            this.oSplitApp.hideMaster();
        }

    },

    createQuickReportPage: function () {

        if (this.oPgQuickRep != undefined)
            return;
        this.oPgQuickRep = sap.ui.jsview("pgQuickRep", "chainel1.QuickReport");

    }


});