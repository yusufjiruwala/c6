sap.ui.jsfragment("bin.forms.lg.Main", {

    createContent: function (oController) {
        this.view = oController.getView();
        this.oController = oController;
        this.lastIndexSelected = 0;
        this.lastFirstRow = 0;
        var that = this;

        this.app = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});

        this.mainPage = new sap.m.Page("pgMain", {
            showHeader: false,
            content: []
        });
        this.pgJo = new sap.m.Page(this.view.createId("pgJo"), {
            showHeader: false,
            content: []
        });
        this.pgCnt = new sap.m.Page(this.view.createId("pgCnt"), {
            showHeader: false,
            content: []
        });
        this.pgReq = new sap.m.Page(this.view.createId("pgReq"), {
            showHeader: false,
            content: []
        });
        this.pgPost = new sap.m.Page(this.view.createId("pgPost"), {
            showHeader: false,
            content: []
        });

        this.createView();
        this.app.addDetailPage(this.mainPage);
        this.app.addDetailPage(this.pgJo);
        this.app.addDetailPage(this.pgCnt);
        this.app.addDetailPage(this.pgReq);
        this.app.addDetailPage(this.pgPost);
        return this.app;
    },
    createView: function () {

        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        UtilGen.clearPage(this.mainPage);
        var vbox = new sap.m.VBox({height: "100%"});
        (this.view.byId("cmdJo") != undefined ? this.view.byId("cmdJo").destroy() : null);
        var pnl1 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text(that.view.createId("cmdJo"), {text: "New JO"}).addStyleClass("whiteText ")
                ]
            }).addStyleClass("mytile");
        var pnl2 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({
                        alignText: "center", text: "Contracts"
                    }).addStyleClass("whiteText")
                ]
            }).addStyleClass("mytile");
        var pnl3 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({text: "Requests"}).addStyleClass("whiteText")
                ]
            }).addStyleClass("mytile");
        var pnl31 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({text: "Approval/Post"}).addStyleClass("whiteText")
                ]
            }).addStyleClass("mytile");
        var pnl4 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({text: "Close JO"}).addStyleClass("whiteText")
                ]
            }).addStyleClass("mytile");

        (this.view.byId("layout") != undefined ? this.view.byId("layout").destroy() : null);
        var layout = new sap.m.HBox(this.view.createId("layout"), {
            items: [
                pnl1,
                pnl2,
                pnl3,
                pnl31,
                pnl4
            ]
        });
        (this.view.byId("lblMsg") != undefined ? this.view.byId("lblMsg").destroy() : null);
        var ly2 = new sap.m.HBox({
            items: [
                new sap.m.Title(that.view.createId("lblMsg"),
                    {text: "No any JO selected !"}).addStyleClass("blinking")
            ]
        });

        pnl1.attachBrowserEvent("click", function (e) {
            that.openForm("bin.forms.lg.JO", that.pgJo);
        });
        pnl2.attachBrowserEvent("click", function (e) {
            that.openForm("bin.forms.lg.contracts", that.pgCnt);
        });
        pnl3.attachBrowserEvent("click", function (e) {
            that.openForm("bin.forms.lg.Req", that.pgReq);
        });
        pnl31.attachBrowserEvent("click", function (e) {
            that.addSession();
        });
        pnl4.attachBrowserEvent("click", function (e) {
            that.showPayment();
        });


        this.qv = new QueryView();

        this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Interactive);
        this.qv.getControl().setAlternateRowColors(true);

        //this.qv.getControl().setVisibleRowCount(100);
        this.qv.getControl().setFixedBottomRowCount(0);
        this.qv.getControl().addStyleClass("noColumnBorder");
        this.qv.getControl().addStyleClass("sapUiSizeCondensed");

        this.searchField = new sap.m.SearchField({
            liveChange: function (event) {
                UtilGen.doFilterLiveTable(event, that.qv, ["ATHLET_NAME", "ATHLET_CODE"]);
            }
        });
        this.locations = UtilGen.createControl(sap.m.ComboBox, this.view, "location", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectionChange: function (event) {
                that.load_data();
            }
        }, "string", undefined, undefined, "select code,name from locations order by 1");
        var sqlQry = "select -1 code,'ALL' name from dual union all " +
            " select 10 code, 'Expiry 10 days' name from dual union all " +
            " select 0 code, 'All Expired' name from dual";

        this.query_type = UtilGen.createControl(sap.m.ComboBox, this.view, "query_type", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectionChange: function (event) {
                that.load_data();
            }
        }, "string", undefined, undefined, sqlQry);

        this.qv.getControl().attachRowSelectionChange(null, function (evt) {
            var idx = that.qv.getControl().getSelectedIndex()
            if (idx <= -1) {
                that.view.byId("cmdJo").setText("New JO");
                that.view.byId("lblMsg").setText("No any JO selected !");
            }
            else {
                var context = evt.getParameters("rowContext").rowContext;
                var txt = that.qv.getControl().getModel().getProperty(context.sPath + "/ORD_NO");
                txt += " / " + that.qv.getControl().getModel().getProperty(context.sPath + "/ORD_REFNM");
                that.view.byId("cmdJo").setText("Open JO");
                that.view.byId("lblMsg").setText("JO # " + txt);
            }
        });

        UtilGen.setControlValue(this.locations, sett["DEFAULT_LOCATION"]);
        UtilGen.setControlValue(this.query_type, -1);

        var bt = new sap.m.Button({
            icon: "sap-icon://print",
            press: function () {
                that.qv.printHtml(that.view, "para");
            }
        });

        this.toolbar = new sap.m.Toolbar({
            content: [this.locations, this.query_type, this.searchField, bt]
        }).addStyleClass("sapUiSizeCondensed");
        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.qv.getControl());
        layout.setAlignItems("Center");
        layout.setJustifyContent("Center");
        ly2.setAlignItems("Center");
        ly2.setJustifyContent("Center");

        vbox.addItem((layout));
        vbox.addItem((ly2));
        vbox.addItem(this.toolbar);
        vbox.addItem(sc);
        vbox.setHeight("100%");
        this.load_data();
        this.mainPage.addContent(vbox);

    },
    load_data: function (period) {
        var that = this;
        // var loc = UtilGen.getControlValue(that.locations);
        // var qt = UtilGen.getControlValue(that.query_type);
        var sql = "select *from v_lg_jo where " + " ord_flag=2  ORDER BY ORD_DATE desc";

        var dat = Util.execSQL(sql);
        if (dat.ret == "SUCCESS") {
            that.qv.setJsonStr("{" + dat.data + "}");
            // var cc = that.qv.mLctb.getColByName("BALANCE");
            // cc.getMUIHelper().display_format = "MONEY_FORMAT";
            // var cc = that.qv.mLctb.getColByName("ATHLET_CODE");
            // cc.mTitle = "Code";
            // var cc = that.qv.mLctb.getColByName("ATHLET_NAME");
            // cc.mTitle = "Name";

            if (dat.data.length > 0) {
                for (var jj = 0; jj < that.qv.mLctb.cols.length; jj++)
                    that.qv.mLctb.cols[jj].getMUIHelper().data_type = "STRING";
                var c = that.qv.mLctb.getColPos("ORD_DATE");
                that.qv.mLctb.cols[c].getMUIHelper().display_format = "SHORT_DATE_FORMAT";
                that.qv.mLctb.cols[c].getMUIHelper().data_type = "DATE";

                // that.qv.mLctb.cols[c].mCfOperator = ":EXPIRY_IN <= 0 && :EXPIRY_IN != 0 ";
                // that.qv.mLctb.cols[c].mCfTrue = "font-weight: bold;color:red!important;";

                // that.qv.mLctb.cols[1].mCfOperator = ":EXPIRY_IN > 0 && :EXPIRY_IN <= 10 && :EXPIRY_IN != 0 ";
                // that.qv.mLctb.cols[1].mCfTrue = "color:orange!important;";

                // that.qv.mLctb.cols[0].mCfOperator = ":SALEINV_ !=0 ";
                // that.qv.mLctb.cols[0].mCfTrue = "font-weight: bold;background-color:yellow!important;";

                that.qv.loadData();
                if (that.qv.mLctb.rows.length > 0) {
                    that.qv.getControl().setSelectedIndex(that.lastIndexSelected);
                    that.qv.getControl().setFirstVisibleRow(that.lastFirstRow);
                }
            }

        }
    },

    openForm: function (frag, frm) {
        var that = this;
        this.lastFirstRow = that.qv.getControl().getFirstVisibleRow();
        this.lastIndexSelected = that.qv.getControl().getSelectedIndex();

        var oC = {
            qryStr: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO"), ""),
            ordRef: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_REF"), ""),
            ordRefNm: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_REFNM"), ""),
            getView:
                function () {
                    return that.view;
                }
        };
        var sp = sap.ui.jsfragment(frag, oC);
        sp.backFunction = function () {
            that.app.to(that.mainPage, "show");
            that.createView();
            that.qv.getControl().setSelectedIndex(that.lastIndexSelected);
            that.qv.getControl().setFirstVisibleRow(that.lastFirstRow);
        };
        sp.app = this.app;
        UtilGen.clearPage(frm);
        frm.addContent(sp);
        this.app.to(frm, "slide");
    }
});



