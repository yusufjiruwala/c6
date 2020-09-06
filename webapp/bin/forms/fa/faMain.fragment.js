sap.ui.jsfragment("bin.forms.fa.faMain", {

    createContent: function (oController) {
        this.view = oController.getView();
        this.oController = oController;
        this.lastIndexSelected = 0;
        this.lastFirstRow = 0;
        var that = this;

        this.app = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        Util.destroyID("pgFaMain");
        Util.destroyID(["pgJo", "pgCnt", "pgReq", "pgPost"], this.view);

        this.mainPage = new sap.m.Page("pgFaMain", {
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
        var spn = "XL2 L2 M2 S6";

        Util.destroyID("cmdFa", this.view);
        var cmdNew = new sap.m.Button(that.view.createId("cmdFa"), {
            press: function () {
                that.openForm("bin.forms.fa.faItems", that.pgJo);
            },
            text: "New",
            icon: "sap-icon://add",
        }).addStyleClass("blueButton");

        Util.destroyID("cmdFaCtg", this.view);
        var cmdCtg = new sap.m.Button(that.view.createId("cmdFaCtg"), {
            press: function () {
                that.show_ctg();
            },
            text: "Categories",
            icon: "sap-icon://group-2",
        }).addStyleClass("");


        Util.destroyID("lblMsg", this.view);
        var tb = new sap.m.Toolbar({
            content: [
                cmdNew,
                cmdCtg,
                new sap.m.ToolbarSpacer(),
                new sap.m.Title(that.view.createId("lblMsg"),
                    {text: "No any JO selected !"}).addStyleClass("blinking")]
        }).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginEnd");

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
                UtilGen.doFilterLiveTable(event, that.qv, ["CODE", "DESCR"]);
            }
        });

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
        }, "string", undefined, undefined, "@-1/All,30/Last 1 Month,90/Last 3 Months,180/Last 6 months,0/Closed");

        this.qv.getControl().attachRowSelectionChange(null, function (evt) {
            var idx = that.qv.getControl().getSelectedIndex()
            if (idx <= -1) {
                that.view.byId("cmdFa").setText("New FA");
                that.view.byId("cmdFa").setIcon("sap-icon://add");
            }
            else {
                var context = evt.getParameters("rowContext").rowContext;
                var txt = that.qv.getControl().getModel().getProperty(context.sPath + "/CODE");
                txt += " / " + that.qv.getControl().getModel().getProperty(context.sPath + "/DESCR");
                that.view.byId("cmdFa").setText("Open FA");
                that.view.byId("cmdFa").setIcon("sap-icon://open-folder");
                that.view.byId("lblMsg").setText("F.A. # " + txt);
            }
        });

        //UtilGen.setControlValue(this.locations, sett["DEFAULT_LOCATION"]);
        UtilGen.setControlValue(this.query_type, -1);

        var bt = new sap.m.Button({
            icon: "sap-icon://print",
            press: function () {
                that.view.colData = {};
                that.view.reportsData = {
                    report_info: {report_name: "JO Lists"}
                };
                that.qv.printHtml(that.view, "para");
            }
        });

        this.toolbar = new sap.m.Toolbar({
            content: [this.locations, this.query_type, this.searchField, bt]
        }).addStyleClass("sapUiSizeCondensed");
        var sc = new sap.m.ScrollContainer();
        sc.addContent(this.qv.getControl());

        vbox.addItem((tb));
        vbox.addItem(this.toolbar);
        vbox.addItem(sc);
        vbox.setHeight("100%");
        this.load_data();
        this.mainPage.addContent(vbox);

    },

    load_data: function (period) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        // var loc = UtilGen.getControlValue(that.locations);
        // var qt = UtilGen.getControlValue(that.query_type);
        var typ = Util.nvl(UtilGen.getControlValue(this.query_type), -1);

        var sql = "select code,descr from faitems";
        // sql = sql.replace(/:TYP/g, typ);

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
                // that.qv.mLctb.cols[c].getMUIHelper().display_format = "SHORT_DATE_FORMAT";
                // that.qv.mLctb.cols[c].getMUIHelper().data_type = "DATE";
                //
                // var c = that.qv.mLctb.getColPos("ORD_NO");
                // that.qv.mLctb.cols[c].getMUIHelper().data_type = "NUMBER";
                //
                // if (sett["LG_MAIN_QUERY_SHOW_ORD_NO"] != "TRUE")
                //     that.qv.mLctb.cols[c].getMUIHelper().display_width = 0;
                //
                // c = that.qv.mLctb.getColPos("TOTAL_PURCHASE");
                // that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                //
                // c = that.qv.mLctb.getColPos("TOTAL_PRETURN");
                // that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                //
                // c = that.qv.mLctb.getColPos("TOTAL_CN");
                // that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                //
                // c = that.qv.mLctb.getColPos("TOTAL_SALES");
                // that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                //
                // c = that.qv.mLctb.getColPos("COST_IN_HAND");
                // that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";

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
                sap.m.MessageToast.show("Found # " + that.qv.mLctb.rows.length + " Records");
            }

        }
    },

    openForm: function (frag, frm, ocAdd) {
        var that = this;
        this.lastFirstRow = that.qv.getControl().getFirstVisibleRow();
        this.lastIndexSelected = that.qv.getControl().getSelectedIndex();

        var indicOF = that.qv.getControl().getBinding("rows").aIndices;
        var indic = that.qv.getControl().getSelectedIndices();
        var arPo = [];

        for (var i = 0; i < indic.length; i++)
            arPo.push(Util.nvl(Util.getCellColValue(that.qv.getControl(), indicOF[indic[i]], "CODE"), ""));
        var oC = {
            qryStr: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "CODE"), ""),
            codes: arPo,
            getView:
                function () {
                    return that.view;
                }
        };
        if (ocAdd != undefined)
            for (var xx in ocAdd)
                oC[xx] = ocAdd[xx];

        var sp = sap.ui.jsfragment(frag, oC);
        sp.backFunction = function () {
            that.doBack();
        };
        sp.app = this.app;
        UtilGen.clearPage(frm);
        frm.addContent(sp);
        this.app.to(frm, "slide");
    },
    doBack: function () {
        var that = this;
        that.app.to(that.mainPage, "show");
        that.createView();
        that.qv.getControl().setSelectedIndex(that.lastIndexSelected);
        that.qv.getControl().setFirstVisibleRow(that.lastFirstRow);
    },
    show_ctg: function () {
        var that = this;
        var dlg;
        var sp = sap.ui.jsfragment("bin.forms.fa.faCategory", {
            backFunction: function () {
                dlg.close();
            },
            getView: function () {
                return that.view;
            },
            qryStr: ""

        });
        dlg = new sap.m.Dialog({
            content: sp,
            title: "Categories",
            contentWidth: "500px",
            contentHeight: "300px",
        });
        dlg.open();
    }
});



