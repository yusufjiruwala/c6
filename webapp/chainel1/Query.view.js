sap.ui.jsview("chainel1.Query", {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf chainel1.Query **/

    getControllerName: function () {
        return "chainel1.Query";
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf chainel1.Query **/

    createContent: function (oController) {
        var qmdl = sap.ui.getCore().getModel("query_para");

        this.query_para = {};
        if (qmdl != undefined)
            this.query_para = qmdl.getData();
        this.app = sap.ui.getCore().byId("oSplitApp");
        this.oController = oController;
        this.report_id = "";
        this.advance_para = [];
        this.itms = [];
        this.itmsrep = [];
        this.tbs = [];
        this.bts = [];
        this.iadd = "para";
        this.uploading = false;
        this.executed = false;
        this.optionReps = [];

        this.createViewResult();
        return this.QueryPage;


    },
    createViewResult: function () {
        var that = this;
        if (this.QueryPage != undefined) return;
        this.oBar2 = Util.createBar("{detailP>/pageTitle}");
        this.oBar3 = Util.createBar("{detailP>/pageTitle}", false);
        this.graphToolBar = new sap.m.Toolbar();
        var QueryView = sap.ui.require("sap/ui/chainel1/util/generic/QueryView");
        this.qv = new QueryView(this.createId("tbl"));
        this.qryToolBar = new sap.m.FlexBox({
            items: [],
            direction: sap.m.FlexDirection.Row,
            alignItems: sap.m.FlexAlignItems.Center
        });

        this.qryParaBar = new sap.m.FlexBox({
            items: [],
            direction: sap.m.FlexDirection.Column,
            alignItems: sap.m.FlexAlignItems.Start
        }).addStyleClass("paddingLeftRightTop");

        this.tabs = new sap.m.TabContainer(
            {
                items: [new sap.m.TabContainerItem({
                    name: "a1",
                    key: "a1",
                    content: [new sap.m.Button({text: "hello"})]
                })],
                layoutData: new sap.ui.layout.SplitterLayoutData({size: "0px"})

            });
        this.splitter = new sap.ui.layout.Splitter({
            contentAreas: [this.qv.mTable, this.tabs],
            orientation: sap.ui.core.Orientation.Vertical,
            height: "100%",
            width: "100%"
        });

        this.QueryPage = new sap.m.Page(this.createId("pgResult"), {
            customHeader: this.oBar2,
            content: [
                this.splitter
            ],
            footer: this.createQRToolbar()
        });

        this.GraphPage = new sap.m.Page(this.createId("pgGraph"), {
            customHeader: this.oBar3,
            content: [],
            footer: this.createQRGrpahToolbar()
        });

        this.GraphPage.$().css("background-color", "white");
        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        oSplitApp.addDetailPage(this.QueryPage);
        oSplitApp.addDetailPage(this.GraphPage);
    },
    showReportPara: function (idno) {
        this.report_id = idno;
        this.executed = false;
        this.title = sap.ui.getCore().getModel("detailP").getData().pageTitle;
        var that = this;
        this.oBar2.getContentMiddle()[0].getItems()[0].setText(this.title);
        this.qryToolBar.destroyItems();
        this.qryToolBar.removeAllItems();
        this.qryParaBar.destroyItems();
        this.qryParaBar.removeAllItems();
        this.qv.mTable.removeAllRows();
        this.qv.mTable.removeAllColumns();
        this.qv.mTable.destroyRows();
        this.qv.mTable.destroyColumns();


        (this.byId("txtSubGroup") != undefined ? this.byId("txtSubGroup").destroy() : null);
        var txtSubGroup = new sap.m.ComboBox(this.createId("txtSubGroup"),
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({
                        text: "{rep_name} - {rep_code}",
                        key: "{rep_code}"
                    }),
                    templateShareable: true
                },
                selectionChange: function (event) {
                    that.onChangeReport();
                }
            });
        that.addMenu(this.oBar2.getContentRight()[0]);
        this.qryParaBar.addItem(txtSubGroup);


        Util.doAjaxGet("exe?command=get-quickrep-metadata&report-id=" + this.report_id, "", false).done(function (data) {
            var dtx = JSON.parse(data);
            var txtSubGroup = that.byId("txtSubGroup");
            txtSubGroup.setModel(new sap.ui.model.json.JSONModel(dtx.subreport));
            that.reportsData = dtx;
        });

        if (that.byId("txtSubGroup").getItems().length > 0) {
            that.byId("txtSubGroup").setSelectedItem(that.byId("txtSubGroup").getItems()[0]);
            that.onChangeReport();
        }

    },

    onChangeReport: function () {
        var that = this;
        this.executed = false;

        var rp = that.byId("txtSubGroup").getSelectedItem().getKey();
        // ajax request: getting column , groups and parameter information .....
        Util.doAjaxGet("exe?command=get-quickrep-cols&report-id=" + rp, "", false).done(function (data) {
            var dtx = JSON.parse(data);
            that.colData = dtx;

            var sp = sap.ui.getCore().byId("SplitPage");
            sp.show_menu_panel(that.qryParaBar);

            // destroying all components para from qryParaBar...
            var ids = [];  //ids to destroy
            var lblids = []; // label to destroy
            for (var z = 0; z < that.qryParaBar.getItems().length; z++)
                if (that.byId("txtSubGroup").getId() != that.qryParaBar.getItems()[z].getId() &&
                    that.byId("menu").getId() != that.qryParaBar.getItems()[z].getId())
                    ids.push(that.qryParaBar.getItems()[z].getId());

            for (var z in ids)
                sap.ui.getCore().byId(ids[z]).destroy();

            // removing group header and group detail...if existed.
            (that.byId("txtGroupDetail") != undefined ? that.byId("txtGroupDetail").destroy() : null);
            (that.byId("txtGroupHeader") != undefined ? that.byId("txtGroupHeader").destroy() : null);
            // creating parameters..

            Util.createParas(that, that.qryParaBar, "result", "para", true, "200px", false);
            (that.byId("refreshResult") != undefined ? that.byId("refreshResult").destroy() : null);
            var bt = new sap.m.Button(that.createId("refreshResult"), {
                text: "Show >>",
                press: function () {
                    that.oController.refresh();
                    if (that.qv.mLctb.rows.length == 0) {
                        sap.m.MessageToast.show("No records found !");
                    } else {
                        sap.m.MessageToast.show("Found # " + that.qv.mLctb.rows.length + " Records !");
                        if (sap.ui.Device.system.phone) {
                            var sp = sap.ui.getCore().byId("SplitPage");
                            that.app.toDetail(sp.oPgQuery);
                            that.app.hideMaster();
                        }
                    }


                }
            });
            (that.byId("refreshResultPara") != undefined ? that.byId("refreshResultPara").destroy() : null);
            var bt2 = new sap.m.Button(that.createId("refreshResultPara"), {
                text: "Show >>",
                press: function () {
                    that.iadd = "para";
                    that.oController.refresh("para");

                    if (that.qv.mLctb.rows.length == 0) {
                        sap.m.MessageToast.show("No records found !");
                    } else {
                        sap.m.MessageToast.show("Found # " + that.qv.mLctb.rows.length + " Records !");
                        if (sap.ui.Device.system.phone) {
                            var sp = sap.ui.getCore().byId("SplitPage");
                            that.app.toDetail(sp.oPgQuery);
                            that.app.hideMaster();
                        }

                    }
                }
            });
            //that.qryToolBar.addItem(bt);
            that.qryParaBar.addItem(bt2);

        });

        that.tabs.getLayoutData().setSize("0px");
    },

    createQRGrpahToolbar: function () {
        var c = [];
        var that = this;
        c.push(new sap.m.ToolbarSpacer());
        c.push(new sap.m.Button({
                text: "Print",
                press: function (e) {
                    that.oController.printGraph();
                }
            })
        );

        return new sap.m.Toolbar({content: c});
    },
    createQRToolbar: function () {
        var c = [];
        var that = this;
        c.push(new sap.m.ToolbarSpacer());
        c.push(new sap.m.Button({
            text: "Filter",
            press: function () {
                that.oController.showFilterWindow();
            }
        }));
        c.push(new sap.m.Button({
                text: "Print",
                press: function (e) {
                    that.qv.printHtml(that, "para");
                }
            })
        );

        return new sap.m.Toolbar({content: c});
    },
    addMenu: function (bar) {
        var that = this;
        //var menu = new sap.ui.core.HTML();
        //menu.setContent("<div class='menuicon'></div>");
        var clk = function () {

            var oMenu = new sap.m.Menu({
                title: "random",
                itemSelected: function (oEvent) {
                    var oItem = oEvent.getParameter("item");
                    if (oItem.getCustomData()[0].getKey() == "advance_para")
                        that.show_advance_para();
                    if (oItem.getCustomData()[0].getKey() == "graph_new") {
                        that.show_add_new_graph();
                    }
                    if (oItem.getCustomData()[0].getKey() == "graph") {
                        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
                        if (!oSplitApp.getDetailPages().indexOf(that.GraphPage) > -1) {
                            oSplitApp.addDetailPage(that.GraphPage);
                        }

                        var rep = oItem.getCustomData()[1].getValue();
                        if (!rep.REP_TYPE.startsWith("FIX_") && !rep.REP_TYPE.startsWith("SEL_")
                            && (rep.REP_TYPE == "TABLE" || rep.REP_TYPE == "SQL" ||
                            rep.REP_TYPE == "DATASET" || rep.REP_TYPE == "OPTIONS" ))
                            oSplitApp.toDetail(that.GraphPage);

                        if (!that.executed)
                            that.oController.refresh(that.iadd);
                        if (rep.REP_TYPE != "OPTIONS")
                            that.oController.show_graph(rep);
                        else
                            that.oController.show_graph_option(rep);
                    }
                }
            });
            // var advanceMenu = new sap.m.MenuItem({
            //     text: "Advance Parameters..",
            //     customData: [{key: "advance_para"}]
            // });
            // oMenu.addItem(advanceMenu);
            Util.addMenuSubReps(that, oMenu, false);
            oMenu.openBy(menu);
        };
        (that.byId("menu") != undefined ? that.byId("menu").destroy() : null);
        var menu = new sap.m.Button(that.createId("menu"), {
            text: '\u2807 Action',
            press: clk
        }).addStyleClass("menuicon");
        bar.addItem(menu);
        // setTimeout(function () {
        //     // $("#"+menu.getId()).click(function () {
        //     //     alert("clicked");
        //     // });
        //
        //     //menu.$().click(clk);
        //     menu.$().on("tap", clk);
        // }, 1000);

    },
    fetchFixReports: function (showOnDialog, callBack) {
        var that = this;
        var i = 0;
        var tabs = that.tabs;
        if (showOnDialog)
            tabs = new sap.m.FlexBox({
                direction: sap.m.FlexDirection.Column
            });

        tabs.removeAllItems();
        tabs.destroyItems();
        this.itmsrep = [];
        var fxcount = 0;
        //var flx = new sap.m.VBox({});
        if (this.colData.subreps != undefined)
            for (i = 0; i < this.colData.subreps.length; i++) {
                if (this.colData.subreps[i].REP_TYPE.startsWith("FIX_")) {
                    var flx = (showOnDialog ? new sap.m.FlexBox() : new sap.m.TabContainerItem({
                        name: this.colData.subreps[i].REP_TITLE,
                        key: "R" + this.colData.subreps[i].REP_POS,
                    }));
                    if (this.colData.subreps[i].REP_TYPE == "FIX_SQL") {
                        that.show_fix_graph(this.colData.subreps[i], flx);
                    }
                    if (this.colData.subreps[i].REP_TYPE == "FIX_FORM") {
                        that.show_fix_form(this.colData.subreps[i], flx);
                    }
                    tabs.addItem(flx);
                    this.itmsrep.push(this.colData.subreps[i]);
                    fxcount++;
                }
            }
        if (!showOnDialog) {
            tabs.attachItemClose(function () {
                if (tabs.getItems().length == 1)
                    tabs.getLayoutData().setSize("0px");
            });
            tabs.getLayoutData().setSize("0px");
            if (fxcount > 0)
                tabs.getLayoutData().setSize("40%");
        } else {
            var dlg = new sap.m.Dialog({
                content: tabs,
                buttons: [new sap.m.Button({
                    text: "Close",
                    press: function () {
                        dlg.close();
                        callBack();
                    }
                })]
            });
            dlg.open();

        }
    },
    show_fix_graph: function (rep, flx) {
        var view = this;
        var ps = "";
        var ia = Util.nvl(view.iadd, "");
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);


        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = "";
            if (that.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (that.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else
                vl = Util.nvl(that.byId("para_" + ia + i).getValue(), "");

            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getValue();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }
        ps += (ps.length > 0 ? "&" : "") + "_total_no=1";

        ps += (ps.length > 0 ? "&" : "") + "_keyfld=" + rep.KEYFLD;

        Util.doAjaxGet("exe?command=get-graph-query&" + (ps), "", true).done(function (data) {
            gData = JSON.parse(data).data;
            if (rep.DIMENSIONS != undefined && rep.DIMENSIONS.split(",")[0] == "DAT") {
                for (var g in gData)
                    gData[g]["DAT"] = new Date(gData[g]["DAT"]);
            }
            view.executeFixGraph(rep, gData, flx)
        });
    }
    ,
    show_advance_para: function () {
        var itms = [];
        var ia = "advance";
        var that = this;

        var flexMain = new sap.m.FlexBox({
            width: "100%",
            height: "100%",
            direction: sap.m.FlexDirection.Column,
            justifyContent: sap.m.FlexJustifyContent.Start,
            alignItems: sap.m.FlexAlignItems.Start,
            items: []
        });
        Util.createParas(this, flexMain, "para", ia, true, "200px");
        // coping value from para
        for (var i = 0; i < that.colData.parameters.length; i++) {
            var src = that.byId("para_" + ia + i);
            var vl = "";
            if (that.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (that.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else
                vl = Util.nvl(that.byId("para_" + ia + i).getValue(), "");
            src.setValue(vl);
            if (that.colData.parameters[i].PARA_DATATYPE === "DATE") {
                src.setDateValue(that.byId("para_" + i).getDateValue());
            }
            // if (that.colData.parameters[i].LISTNAME != undefined && that.colData.parameters[i].LISTNAME.toString().trim().length > 0)
            //     src.setSelectedKey(that.byId("para_" + i).getSelectedItem().getKey());
            if (that.colData.parameters[i].LISTNAME != undefined && that.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                src.setValue(that.byId("para_" + i).getValue());
        }


        var dlg = new sap.m.Dialog({
            title: "Enter Parameters..",
            content: [flexMain],
            buttons: [new sap.m.Button({
                text: "Execute",

                press: function () {
                    for (var i = 0; i < that.colData.parameters.length; i++) {
                        var src = that.byId("para_" + i);
                        var vl = "";
                        if (that.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                            vl = (that.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
                        else
                            vl = Util.nvl(that.byId("para_" + ia + i).getValue(), "");

                        src.setValue(vl);
                        if (that.colData.parameters[i].PARA_DATATYPE === "DATE") {
                            src.setDateValue(that.byId("para_" + ia + i).getDateValue());
                        }
                        if (that.colData.parameters[i].LISTNAME != undefined && that.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                            src.setValue(that.byId("para_" + ia + i).getValue());
                        //src.setSelectedKey(that.byId("para_" + ia + i).getSelectedItem().getKey());
                    }
                    that.oController.refresh();
                    dlg.close();

                }
            })]
        });
        dlg.open();
    }
    ,

    executeFixGraph: function (rep, gData, flx) {


        var view = this;

        var oModel = new sap.ui.model.json.JSONModel();
        var dms = rep.DIMENSIONS.split(",");
        var ms = rep.MEASURES.split(",");
        var grpStr = rep.GRAPH_TITLE;

        if (flx instanceof sap.m.FlexBox) {
            flx.removeAllItems();
            flx.destroyItems();

        } else {
            flx.removeAllContent();
            flx.destroyContent();
        }
        (view.byId("gp" + rep.REP_POS) != undefined ? view.byId("gp" + rep.REP_POS).destroy() : null);

        var ui = {};
        if (rep.FIORI == "TRUE")
            ui = {
                'uiConfig': {
                    'applicationSet': 'fiori',
                    'showErrorMessage': true
                }
            };
        var oVizFrame = new sap.viz.ui5.controls.VizFrame(view.createId("gp" + rep.REP_POS), {ui});

        oModel.setData(gData);
        oVizFrame.setVizType(rep.GRAPH_TYPE);
        oVizFrame.setModel(oModel);
        //oVizFrame.setWidth("100%");
        oVizFrame.setHeight("300px");
        var dimensions = [];
        for (var d = dms.length - 1; d > -1; d--) {
            if (dms[d] == "DAT")
                dimensions.push({
                    name: dms[d],
                    value: {
                        parts: [dms[d]],
                        formatter: function (oCreatestamp) {
                            if (oCreatestamp === null) {
                                return oCreatestamp;
                            }
                            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd.MM.yyyy"});
                            return oDateFormat.format(oCreatestamp);
                        }
                    }
                });
            else
                dimensions.push({
                    name: dms[d],
                    value: "{" + dms[d] + "}"
                });
        }
        var measures = [];
        for (var m in ms)
            measures.push({name: ms[m], value: "{" + ms[m] + "}"});


        oVizFrame.setDataset(new sap.viz.ui5.data.FlattenedDataset({
                dimensions: dimensions,
                measures: measures,
                data: {
                    path: "/"
                }
            })
        )
        ;


        oVizFrame.setVizProperties({
            plotArea: {
                colorPalette: d3.scale.category20().range(),
                dataPoint: {invalidity: 'ignore'}
            },

            title: {text: grpStr},
            general: {
                groupData: true
            },
            timeAxis: {
                visible: true,
                title: {
                    visible: true,
                    text: "Time"
                },
                interval: {
                    unit: ''
                }
            }

        });
        var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
            'uid': "valueAxis",
            'type': "Measure",
            'values': ms
        });
        for (var d = dms.length - 1; d > -1; d--) {//for (var d in dms) {
            var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': (d == 0 ? "categoryAxis" : "color"),
                'type': "Dimension",
                'values': [dms[d]]
            });
            oVizFrame.addFeed(feedCategoryAxis);
        }
        oVizFrame.addFeed(feedValueAxis);

        if (flx instanceof sap.m.FlexBox)
            flx.addItem(oVizFrame);
        else
            flx.addContent(oVizFrame);

        // this.itms[flx] = oVizFrame;
        // this.itmsrep[flx] = rep;
        // this.tbs[flx] = flx;
        // setTimeout(function () {
        //     view.upload_pic(rep, oVizFrame, flx);
        // }, 0);
        // this.bts[flx] = new sap.m.Button({
        //     text: "Add image",
        //     press: function () {
        //         setTimeout(function () {
        //             view.upload_pic(rep, oVizFrame, flx);
        //         }, 0);
        //     }
        // });

        // flx.addContent(this.bts[flx]);
//      this.tabs.setSelectedItem(flx);
//        view.upload_pic(rep, oVizFrame);
    }
    ,

    show_fix_form: function (rep, flx) {
        var view = this;
        var ps = "";
        var ia = Util.nvl(view.iadd, "");
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);


        for (var i = 0; i < view.colData.parameters.length; i++) {

            var vl = "";
            if (that.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (that.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else
                vl = Util.nvl(that.byId("para_" + ia + i).getValue(), "");

            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getValue();
            //vl = view.byId("para_" + ia + i).getSelectedItem().getKey();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }
        ps += (ps.length > 0 ? "&" : "") + "_total_no=1";

        ps += (ps.length > 0 ? "&" : "") + "_keyfld=" + rep.KEYFLD;
        Util.doAjaxGet("exe?command=get-graph-query&" + (ps), "", true).done(function (data) {
            gData = JSON.parse(data).data;
            view.executeForm(rep, flx, gData);
        });

    }
    ,
    executeForm: function (rep, flx, gData) {
        var view = this;

        var oModel = new sap.ui.model.json.JSONModel();
        var dms = rep.DIMENSIONS.split(",");
        var ms = rep.MEASURES.split(",");
        var grpStr = rep.GRAPH_TITLE;
        var ia = "";
        if (flx instanceof sap.m.FlexBox) {
            ia = "flx";
            flx.removeAllItems();
            flx.destroyItems();
        }
        else {
            flx.removeAllContent();
            flx.destroyContent();
        }

        (view.byId(ia + "grd" + rep.REP_POS) != undefined ? view.byId(ia + "grd" + rep.REP_POS).destroy() : null);
        var ldTxt = rep.LAYOUT_DATA.split(",");
        var tls = rep.FIELD_TITLES.split(",");
        var ldLbl = rep.FIELD_LABELS_LAYOUT_DATA.split(",");
        var fld_binds = rep.FIELD_BINDINGS.split(",");
        var objs = [];
        var cnt = 0;
        var dir = sap.m.FlexDirection.Column;
        if (rep.FORM_LABELS_DISPLAY == "START")
            dir = sap.m.FlexDirection.Row;

        for (var t in tls) {
            var o = new sap.m.FlexBox({
                layoutData: new sap.ui.layout.GridData({
                    span: ldTxt[t]
                }),
                width: "100%",
                height: "100%",
                direction: dir,
                justifyContent: sap.m.FlexJustifyContent.Center,
                alignItems: sap.m.FlexAlignItems.Center,
                items: [new sap.m.Label({
                    text: tls[t],
                    layoutData: new sap.ui.layout.GridData({
                        span: ldLbl[t]
                    })
                }),
                    new sap.m.Input({
                        value: gData[0][fld_binds[t].trim()],
                        enabled: false
                    })]
            });
            objs[cnt++] = o;


        }


        var grd = new sap.ui.layout.Grid(view.createId(ia + "grd" + rep.REP_POS), {
            vSpacing: 2,
            hSpacing: 1,
            content: []
        });

        for (var o in objs) {
            grd.addContent(objs[o]);
        }

        if (flx instanceof sap.m.FlexBox)
            flx.addItem(grd);
        else
            flx.addContent(grd);


//        this.tabs.setSelectedItem(flx);
//        view.upload_pic(rep, grd);
//         this.itms[flx] = grd;
//         this.itmsrep[flx] = rep;
//         this.tbs[flx] = flx;

//        view.upload_pic(rep, grd, flx);

        // this.bts[flx] = new sap.m.Button({
        //     text: "Add image",
        //     press: function () {
        //         setTimeout(function () {
        //             view.upload_pic(rep, grd, flx);
        //         }, 0);
        //     }
        // });

        //flx.addContent(this.bts[flx]);
    }
    ,
    upload_pic: function (rep, oVizFrame) {
        var view = this;
        //if (rep.FETCH_FIX_REP_PIC != undefined && rep.FETCH_FIX_REP_PIC.toUpperCase().startsWith("T")) {
        //view.tabs.setSelectedItem(flx);
        var pg = document.getElementById(oVizFrame.getId());
        //setTimeout(function () {
        //pg.parentNode.style.overflow = 'visible';
        html2canvas(pg, {//+flx.getId()), {
            onrendered: function (canvas) {
                // while (view.uploading) {
                // }
                view.uploading = true;
                var svgElements = $(pg).find('svg');
                svgElements.each(function () {
                    var svgString = (new XMLSerializer()).serializeToString(this);
                    //var canvas = document.getElementById("canvas");
                    var ctx = canvas.getContext("2d");
                    var DOMURL = self.URL || self.webkitURL || self;
                    var img = new Image();
                    var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
                    var url = DOMURL.createObjectURL(svg);
                    img.onload = function () {
                        ctx.drawImage(img, 0, 0);
                        var png = canvas.toDataURL("image/png");
                        DOMURL.revokeObjectURL(png);
                        //Canvas2Image.saveAsJPEG(canvas);
                        var vim = png.replace(/^data:image\/(png|jpg);base64,/, "");
                        if (vim == undefined || vim.trim().length == 0 | vim == "data:,") {
                            view.uploading = false;
                            return null;
                        }
                        var blob = view.base64ToBlob(vim, "image/png");
                        var fd = new FormData();
                        fd.append('data', blob);
                        fd.append("filename", rep.REP_TITLE);
                        $.ajax({
                            type: 'POST',
                            async: true,
                            enctype: 'multipart/form-data',
                            url: '/uploadImageRep',
                            data: fd,
                            processData: false,
                            contentType: false
                        }).done(function (data) {
                            console.log(data);
                            view.uploading = false;
                        });
                    };
                    img.src = url;
                });
                // if no svgelements then
                if (svgElements.length <= 0) {
                    var fd = new FormData();
                    var png = canvas.toDataURL("image/png");
                    var vim = png.replace(/^data:image\/(png|jpg);base64,/, "");
                    if (vim == undefined || vim.trim().length == 0 | vim == "data:,") {
                        view.uploading = false;
                        return null;
                    }

                    var blob = view.base64ToBlob(vim, "image/png");
                    fd.append('data', blob);
                    fd.append("filename", rep.REP_TITLE);
                    $.ajax({
                        type: 'POST',
                        async: true,
                        enctype: 'multipart/form-data',
                        url: '/uploadImageRep',
                        data: fd,
                        processData: false,
                        contentType: false
                    }).done(function (data) {
                        console.log(data);
                        view.uploading = false;
                    });

                }
                view.uploading = false;

            }
        });
        //   }, 0);
//        }
    }
    ,
    base64ToBlob: function (base64, mime) {
        mime = mime || '';
        var sliceSize = 1024;
        var byteChars = window.atob(base64);
        var byteArrays = [];

        for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
            var slice = byteChars.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: mime});
    }
})
;
