sap.ui.jsfragment("bin.forms.fitness.Athlet", {

    createContent: function (oController) {
        jQuery.sap.require("sap.ui.commons.library");
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
        this.load_data();

        this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Interactive);
        this.qv.getControl().setAlternateRowColors(true);

        //this.qv.getControl().setVisibleRowCount(100);
        this.qv.getControl().setFixedBottomRowCount(0);
        this.qv.getControl().addStyleClass("noColumnBorder");
        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.qv.getControl());
        layout.setAlignItems("Center");
        layout.setJustifyContent("Center");
        vbox.addItem((layout));
        vbox.addItem(sc);
        vbox.setHeight("100%");
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
            qryStrKF: data.KEYFLD + "",
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
        var sql = "select to_char(start_date,'dd/mm/rrrr') start_date,athlet_code,athlet_name,tel,amount,keyfld from ft_contract where flag=1 order by start_date desc";

        var dat = Util.execSQL(sql);
        if (dat.ret == "SUCCESS" && dat.data.length > 0) {
            that.qv.setJsonStr("{" + dat.data + "}");
            that.qv.loadData();
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
            qryStr: data.KEYFLD + "",
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
        this.selectedInd = data.KEYFLD;
        var oC = {
            qryStrKF: data.KEYFLD + "",
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
            qryStrKF: data.KEYFLD + "",
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



