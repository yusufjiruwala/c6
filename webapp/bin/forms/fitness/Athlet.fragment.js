sap.ui.jsfragment("bin.forms.fitness.Athlet", {

    createContent: function (oController) {
        jQuery.sap.require("sap.ui.commons.library");
        jQuery.sap.require("sap.ui.commons.library");
        jQuery.sap.require("sap.m.MessageBox");

        this.view = oController.getView();
        this.oController = oController;
        var that = this;
        this.selectedInd;
        this.app = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        this.mainPage = new sap.m.Page("ftApp", {
            showHeader: false,
            content: []
        });
        this.pgSub = new sap.m.Page(this.view.createId("pgSub"), {
            showHeader: false,
            content: []
        });
        this.pgSes = new sap.m.Page(this.view.createId("pgSes"), {
            showHeader: false,
            content: []
        });
        this.pgAna = new sap.m.Page(this.view.createId("pgAna"), {
            showHeader: false,
            content: []
        });
        this.pgPay = new sap.m.Page(this.view.createId("pgPay"), {
            showHeader: false,
            content: []
        });

        this.createView();
        this.app.addDetailPage(this.mainPage);
        this.app.addDetailPage(this.pgSub);
        this.app.addDetailPage(this.pgSes);
        this.app.addDetailPage(this.pgAna);
        this.app.addDetailPage(this.pgPay);
        return this.app;
    },
    createView: function () {
        var that = this;
        sett = sap.ui.getCore().getModel("settings").getData();
        UtilGen.clearPage(this.mainPage);
        var vbox = new sap.m.VBox({height: "100%"});
        var pnl1 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({text: "{i18n>new_sub}"}).addStyleClass("whiteText ")
                ]
            }).addStyleClass("mytile");
        var pnl2 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({
                        alignText: "center", text: "{i18n>open_sub}"
                    }).addStyleClass("whiteText")
                ]
            }).addStyleClass("mytile");
        var pnl3 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({text: "{i18n>add_session}"}).addStyleClass("whiteText")
                ]
            }).addStyleClass("mytile");
        var pnl31 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({text: "{i18n>info}"}).addStyleClass("whiteText")
                ]
            }).addStyleClass("mytile");
        var pnl4 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({text: "{i18n>payments}"}).addStyleClass("whiteText")
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
        pnl1.attachBrowserEvent("click", function (e) {
            that.showNewSubscriber();
        });
        pnl2.attachBrowserEvent("click", function (e) {
            that.openSubscriber();
        });
        pnl3.attachBrowserEvent("click", function (e) {
            that.dranalysis();
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


        UtilGen.setControlValue(this.locations, sett["USER_LOCATION"]);
        UtilGen.setControlValue(this.query_type, -1);

        var bt = new sap.m.Button({
            icon: "sap-icon://print",
            press: function () {
                that.qv.printHtml(that.view, "para");
            }
        });

        this.toolbar = new sap.m.Toolbar({
            content: [this.locations, this.query_type, this.searchField, bt]
        });
        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.qv.getControl());
        layout.setAlignItems("Center");
        layout.setJustifyContent("Center");
        vbox.addItem((layout));
        vbox.addItem(this.toolbar);
        vbox.addItem(sc);
        vbox.setHeight("100%");
        this.load_data();
        this.mainPage.addContent(vbox);

    },
    showNewSubscriber: function () {
        var that = this;
        var oC = {
            getView: function () {
                return that.view;
            }
        };
        var sp = sap.ui.jsfragment("bin.forms.fitness.newsub", oC);
        sp.backFunction = function () {
            that.app.to(that.mainPage, "show");
            that.createView();
        };
        sp.app = this.app;
        UtilGen.clearPage(this.pgSub);
        this.pgSub.addContent(sp);
        this.app.to(this.pgSub, "slide");
    },
    showPayment: function () {
        var that = this;
        var sl = this.qv.getControl().getSelectedIndices();
        if (sl.length <= 0) {
            sap.m.MessageToast.show("Must select !");
            return;
        }

        var odata = that.qv.getControl().getContextByIndex(sl[0]);
        var data = odata.getProperty(odata.getPath());

        var oC = {
            qryStrKF: data.KEYFLD_ + "",
            getView: function () {

                return that.view;
            }
        };
        var sp = sap.ui.jsfragment("bin.forms.fitness.payments", oC);
        sp.backFunction = function () {
            that.app.to(that.mainPage, "show");
            that.createView();
        };
        sp.app = this.app;
        UtilGen.clearPage(this.pgPay);
        this.pgPay.addContent(sp);
        this.app.to(this.pgPay, "slide");
    },
    load_data: function (period) {
        var that = this;
        var loc = UtilGen.getControlValue(that.locations);
        var qt = UtilGen.getControlValue(that.query_type);
        var sql = "select f.athlet_code,f.athlet_name,f.tel,to_char(f.start_date,'dd/mm/rrrr') start_date," +
            " to_char(f.end_date,'dd/mm/rrrr') end_date," +
            " round(f.end_date-sysdate) expiry_in ," +
            "c.balance," +
            "f.keyfld keyfld_ ," +
            "f.SALEINV SALEINV_ " +
            "from ft_contract f,C_CUST_BAL c " +
            "where f.flag=1 and " +
            " (round(f.end_date-sysdate)<=" + qt + " or " + qt + "=-1) and " +
            " c.code(+)=f.athlet_code and " +
            " f.location_code='" + loc + "'" +
            " order by f.start_date desc";

        var dat = Util.execSQL(sql);
        if (dat.ret == "SUCCESS") {

            that.qv.setJsonStr("{" + dat.data + "}");
            if (dat.data.length > 0) {
                var cc = that.qv.mLctb.getColByName("BALANCE");
                cc.getMUIHelper().display_format = "MONEY_FORMAT";
                var cc = that.qv.mLctb.getColByName("ATHLET_CODE");
                cc.mTitle = "Code";
                var cc = that.qv.mLctb.getColByName("ATHLET_NAME");
                cc.mTitle = "Name";
            }
            that.qv.loadData();


            if (dat.data.length > 0) {


                for (var jj = 0; jj < that.qv.mLctb.cols.length; jj++)
                    that.qv.mLctb.cols[jj].getMUIHelper().data_type = "STRING";
                var c = that.qv.mLctb.getColPos("EXPIRY_IN");
                that.qv.mLctb.cols[c].getMUIHelper().data_type = "NUMBER";
                that.qv.mLctb.cols[c].mCfOperator = ":EXPIRY_IN <= 0 && :EXPIRY_IN != 0 ";
                that.qv.mLctb.cols[c].mCfTrue = "font-weight: bold;color:red!important;";

                that.qv.mLctb.cols[1].mCfOperator = ":EXPIRY_IN > 0 && :EXPIRY_IN <= 10 && :EXPIRY_IN != 0 ";
                that.qv.mLctb.cols[1].mCfTrue = "color:orange!important;";

                that.qv.mLctb.cols[0].mCfOperator = ":SALEINV_ !=0 ";
                that.qv.mLctb.cols[0].mCfTrue = "font-weight: bold;background-color:yellow!important;";

            }

        }
    },
    openSubscriber: function () {
        var that = this;
        var sl = this.qv.getControl().getSelectedIndices();
        if (sl.length <= 0) {
            sap.m.MessageToast.show("Must select !");
            return;
        }
        var odata = that.qv.getControl().getContextByIndex(sl[0]);
        var data = odata.getProperty(odata.getPath());

        var oC = {
            qryStr: data.KEYFLD_ + "",
            getView: function () {
                return that.view;
            }
        };

        var sp = sap.ui.jsfragment("bin.forms.fitness.newsub", oC);
        sp.backFunction = function () {
            that.app.to(that.mainPage, "show");
            that.createView();
        };
        sp.app = this.app;
        UtilGen.clearPage(this.pgSub);
        this.pgSub.addContent(sp);
        this.app.to(this.pgSub, "slide");

    },
    addSession: function () {
        var that = this;
        var sl = this.qv.getControl().getSelectedIndices();
        if (sl.length <= 0) {
            sap.m.MessageToast.show("Must select !");
            return;
        }

        var odata = that.qv.getControl().getContextByIndex(sl[0]);
        var data = odata.getProperty(odata.getPath());
        this.selectedInd = data.KEYFLD_;
        var oC = {
            qryStrKF: data.KEYFLD_ + "",
            qryStrAthletCode: data.ATHLET_CODE,
            qryStrAthletCodeName: data.ATHLET_NAME,
            getView: function () {
                return that.view;
            }
        };
        var sp = sap.ui.jsfragment("bin.forms.fitness.session", oC);
        sp.backFunction = function () {
            that.app.to(that.mainPage, "show");
            that.createView();
        };
        UtilGen.clearPage(this.pgSes);
        this.pgSes.addContent(sp);
        this.app.to(this.pgSes, "slide");
    },
    dranalysis: function () {
        var that = this;
        var sl = this.qv.getControl().getSelectedIndices();
        if (sl.length <= 0) {
            sap.m.MessageToast.show("Must select !");
            return;
        }
        var odata = that.qv.getControl().getContextByIndex(sl[0]);
        var data = odata.getProperty(odata.getPath());

        var oC = {
            qryStrKF: data.KEYFLD_ + "",
            qryStrAthletCode: data.ATHLET_CODE,
            qryStrAthletCodeName: data.ATHLET_NAME,
            getView: function () {
                return that.view;
            }
        };

        var sp = sap.ui.jsfragment("bin.forms.fitness.drana", oC);
        sp.backFunction = function () {
            that.app.to(that.mainPage, "show");
            that.createView();
        };
        UtilGen.clearPage(this.pgAna);
        this.pgAna.addContent(sp);
        this.app.to(this.pgAna, "slide");
    }

})
;



