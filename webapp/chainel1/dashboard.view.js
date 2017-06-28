sap.ui.jsview("chainel1.dashboard", {

    /**
     * Specifies the Controller belonging to this that.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf chainel1.dashboard **/
    getControllerName: function () {
        return "chainel1.dashboard";
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf chainel1.dashboard **/
    createContent: function (oController) {
        this.oController = oController;
        this.oSplitApp = sap.ui.getCore().byId("oSplitApp");
        this.Gauge = sap.ui.require("sap/ui/chainel1/util/generic/Gauge");
        this.createView();
        return this.oPage2;

    },
    createView: function () {
        var c = [];
        var sett = sap.ui.getCore().getModel("settings").getData();
        var that = this;
        var app = this.oSplitApp;

        var LocalTableData = sap.ui.require("sap/ui/chainel1/util/generic/LocalTableData");
        this.lctb = new LocalTableData();
        this.fromDate = new Date();
        this.toDate = new Date();
        // c.push(new sap.m.DatePicker(that.createId("fromdate"),
        //     {
        //         dateValue: this.fromDate,
        //         valueFormat: sett["ENGLISH_DATE_FORMAT"],
        //         displayFormat: sett["ENGLISH_DATE_FORMAT"],
        //         change: function (ev) {
        //             var dt = ev.getParameters("value");
        //             that.fromDate = dt;
        //             that.refreshData(true);
        //         }
        //     }
        // ));
        c.push(new sap.m.ToolbarSpacer());
        c.push(new sap.m.Label({text: "Date : "}));
        c.push(new sap.m.DatePicker(that.createId("todate"),
            {
                dateValue: this.fromDate,
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                change: function (ev) {
                    var dt = ev.getParameters("value");
                    that.toDate = dt;
                    that.refreshData(true);
                }
            }
        ));
        c.push(new sap.m.Button({
                text: "Refresh",
                press: function () {
                    that.refreshData(true);
                }

            }
        ));

        this.oBar = new sap.m.Toolbar({content: c});
        this.gauges = [];
        this.graphs = [];
        this.grid = new sap.ui.layout.Grid({
            vSpacing: 1,
            hSpacing: 1,
            content: []
        }).addStyleClass("sapUiSmallMarginTop");
        ;
        this.gridGauges = new sap.ui.layout.Grid({
            vSpacing: 1,
            hSpacing: 1,
            content: []
        }).addStyleClass("sapUiSmallMarginTop");
        ;
        this.oPage2 = new sap.m.Page("pgDashboard", {

            showNavButton: sap.ui.Device.system.phone,
            navButtonPress: function () {
                app.toMaster("pgMenus", "flip");
            },
            title: "Dashboard",
            content: [
                this.oBar,
                this.gridGauges,
                this.grid
            ]
        });
    },

    refreshData: function (fromServer) {
        var that = this;
        var mp = sap.ui.getCore().getModel("selectedP").getData();
        var fromServer2 = fromServer;
        if (this.gauges.length == 0)
            fromServer2 = true;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        this.grid.removeAllContent();
        this.grid.destroyContent();
        this.gridGauges.removeAllContent();
        this.gridGauges.destroyContent();
        if (fromServer2) {
            this.gauges = [];
            var sq = {
                status: "NONE",
                sql: "select *from C6_DB_GAUGES where profiles like '%\"" + sett["PROFILENO"] + "\"%' and (menu_profile like '%\"" + mp.code + "\"%' or menu_profile like '%\"ALL\"%')",
                data: null
            };
            var ps = /*"_para_fromdate=@" + df.format((that.byId("fromdate").getDateValue())) +*/
                "_para_todate=@" + df.format((that.byId("todate").getDateValue()));
            Util.doAjaxGet("gaugedata?" + ps, "", true).done(function (data) {
                that.gauges = JSON.parse(data).data;
                for (g in that.gauges) {
                    if (Util.nvl(that.gauges[g].MENU_PROFILE, "").indexOf('"' + mp.code + '"') <= -1 && Util.nvl(that.gauges[g].MENU_PROFILE, "").indexOf('"ALL"') <= -1) continue;
                    (that.byId("gauge_" + that.gauges[g].KEYFLD) != undefined ? that.byId("gauge_" + that.gauges[g].KEYFLD).destroy() : null);
                    (that.byId("gauge_" + that.gauges[g].KEYFLD + "_parent") != undefined ? that.byId("gauge_" + that.gauges[g].KEYFLD + "_parent").destroy() : null);
                    (that.byId("gauge_" + that.gauges[g].KEYFLD + "_flex") != undefined ? that.byId("gauge_" + that.gauges[g].KEYFLD + "_flex").destroy() : null);
                    var gg = that.createGauge("gauge_" + that.gauges[g].KEYFLD, that.gauges[g]);
                    that.gridGauges.addContent(gg);
                }
                that.show_graphs(true);
            });
        } else {
            for (g in that.gauges) {
                if (Util.nvl(that.gauges[g].MENU_PROFILE, "").indexOf('"' + mp.code + '"') <= -1 && Util.nvl(that.gauges[g].MENU_PROFILE, "").indexOf('"ALL"') <= -1) continue;
                (that.byId("gauge_" + that.gauges[g].KEYFLD) != undefined ? that.byId("gauge_" + that.gauges[g].KEYFLD).destroy() : null);
                (that.byId("gauge_" + that.gauges[g].KEYFLD + "_parent") != undefined ? that.byId("gauge_" + that.gauges[g].KEYFLD + "_parent").destroy() : null);
                (that.byId("gauge_" + that.gauges[g].KEYFLD + "_flex") != undefined ? that.byId("gauge_" + that.gauges[g].KEYFLD + "_flex").destroy() : null);
                var gg = that.createGauge("gauge_" + that.gauges[g].KEYFLD, that.gauges[g]);
                that.gridGauges.addContent(gg);
            }
            that.show_graphs(false);
        }
    },
    createGauge: function (name, gg) {
        var that = this;
        var label = gg.TITLE1, min = gg.MIN_VAL, max = gg.MAX_VAL, vl = gg.SQL_VAL;
        var df = new DecimalFormat(gg.VALUE_FORMAT);


        var config =
            {
                size: 60,
                min: undefined != min ? min : 0,
                max: undefined != max ? max : 100,
                value: 50,
                minorTicks: 5,
            }

        var range = config.max - config.min;
        config.greenZones = [{from: config.min, to: config.min + range * 0.75}];
        config.yellowZones = [{from: config.min + range * 0.75, to: config.min + range * 0.9}];
        config.redZones = [{from: config.min + range * 0.9, to: config.max}];
        // labels inside gauges
        var lbls = [];
        lbls.push(new sap.m.Label({text: "Target: " + df.format(max)}));
        lbls.push(new sap.m.Label({text: "Value: " + df.format(vl)}));
        if (gg.PRIOR_FUNC_VAL != undefined && gg.PRIOR_FUNC_VAL + "".length > 0) {
            var l = Util.nvl(gg.PRIOR_LABEL, "Last value") + ": ";
            lbls.push(new sap.m.Label({text: l + df.format(gg.PRIOR_FUNC_VAL)}));
            var v = vl - gg.PRIOR_FUNC_VAL;
            var ss = String.fromCharCode(11015);
            if (v >= 0)
                ss = String.fromCharCode(11014);
            var lx = new sap.m.Label({text: ss + " " + df.format(v)});
            if (v < 0)
                setTimeout(function () {
                    lx.$().css("color", "red")
                }, 500);
            else
                setTimeout(function () {
                    lx.$().css("color", "green")
                }, 500);

            lbls.push(lx);

        }

        var oc = new sap.m.Label({
            id: that.createId(name),
            hAlign: "Right",
            layoutData: new sap.ui.layout.GridData({
                span: "L2 M6 S10"
            })
        });

        var oc2 = new sap.m.FlexBox({
            id: that.createId(name + "_flex"),
            items: [oc,
                new sap.m.VBox({
                    items: lbls
                })]
        });
        var oGCell1 = new sap.m.Panel({
            id: that.createId(name + "_parent"),
            width: "320px",
            height: "125px",
            infoToolbar: new sap.m.Toolbar({
                content: [new sap.m.Label({text:label})]
            }),
            content: [
                oc2
            ],
            customData: [{key: gg}]
        });

        var g = new this.Gauge(that.createId(name), config);
        setTimeout(function () {
            g.render();
            g.redraw(vl);
        }, 300);

        return oGCell1;
    },
    show_graphs: function (fromServer) {
        if (this.reps == undefined || fromServer) {
            this.fetch_graph_data();
            return;
        }
        var that = this;
        var rep = this.reps;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var mp = sap.ui.getCore().getModel("selectedP").getData();

        this.grid.removeAllContent();
        this.grid.destroyContent();

        for (var r in that.reps) {
            var rep = that.reps[r];
            if (Util.nvl(rep.MENU_PROFILE, "").indexOf('"' + mp.code + '"') <= -1 && Util.nvl(rep.MENU_PROFILE, "").indexOf('"ALL"') <= -1) continue;
            var oc2 = that.getGraph(rep);
            var spanStr = Util.nvl(rep.LAYOUT_DATA, "L3 M6 S12");
            var height = Util.nvl(rep.PANEL_HEIGHT, "auto");
            (that.byId("rep_" + rep.REP_POS) != undefined ? that.byId("rep_" + rep.REP_POS).destroy() : null);
            var oGCell1 = new sap.m.Panel({
                id: that.createId("rep_" + rep.REP_POS),
                height: height,
                headerText: rep.REP_TITLE,
                infoToolbar: new sap.m.Toolbar({
                    content: [new sap.m.Button({
                        icon: "sap-icon://sys-cancel",
                    }),
                        new sap.m.Button({
                            icon: "sap-icon://edit"
                        })]
                }),
                content: [
                    oc2
                ],
                customData: [{key: rep}],
                layoutData: new sap.ui.layout.GridData({
                    span: spanStr
                })
            });
            this.grid.addContent(oGCell1);
        }


    },
    fetch_graph_data: function () {
        var that = this;

        this.repsdata = {};
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var mp = sap.ui.getCore().getModel("selectedP").getData();

        Util.doAjaxGet("exe?command=get-quickrep-cols&report-id=1", "", true).done(function (data) {
            that.reps = JSON.parse(data).subreps;
            if (that.reps == undefined) that.reps = {};
            for (var r in that.reps) {
                var rep = that.reps[r];
                var gData = [];
                var ps = /*"_para_fromdate=@" + df.format((that.byId("fromdate").getDateValue())) +*/
                    "_para_todate=@" + df.format((that.byId("todate").getDateValue()));
                ps += (ps.length > 0 ? "&" : "") + "_total_no=1";
                ps += (ps.length > 0 ? "&" : "") + "_keyfld=" + rep.KEYFLD;
                if (Util.nvl(rep.MENU_PROFILE, "").indexOf('"' + mp.code + '"') <= -1 && Util.nvl(rep.MENU_PROFILE, "").indexOf('"ALL"') <= -1) continue;
                Util.doAjaxGet("exe?command=get-graph-query&" + (ps), "", false).done(function (data) {
                    var bal_fld = "", firstDimField = "";
                    if (rep.GRAPH_TYPE == "line" && Util.nvl(rep.SORT_FIELD, rep.DIMENSIONS) != undefined) {
                        var tmpData = JSON.parse(data);
                        for (var m in tmpData.metadata) {
                            if (tmpData.metadata[m]["colname"].endsWith("_bal"))
                                bal_fld = tmpData.metadata[m]["colname"];
                        }
                        firstDimField = Util.nvl(rep.SORT_FIELD, rep.DIMENSIONS).split(",")[0];
                        var LocalTableData = sap.ui.require("sap/ui/chainel1/util/generic/LocalTableData");
                        var lt = new LocalTableData();
                        lt.parse(data);
                        lt.sortCol(lt.getColByName(firstDimField).mColpos, true);
                        gData = lt.getData(true);
                    } else
                        gData = JSON.parse(data).data;
                    that.repsdata[rep.REP_POS] = gData;
                });
            }
            setTimeout(function () {
                that.show_graphs(false);
            }, 200);
        });
    },
    getGraph: function (rep) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

        var oModel = new sap.ui.model.json.JSONModel();
        var dms = rep.DIMENSIONS.split(",");
        var ms = rep.MEASURES.split(",");
        var grpStr = rep.GRAPH_TITLE;
        var gData = this.repsdata[rep.REP_POS];

        (that.byId("gp" + rep.REP_POS) != undefined ? that.byId("gp" + rep.REP_POS).destroy() : null);

        var ui = {}
        if (rep.FIORI == "TRUE")
            ui = {
                'uiConfig': {
                    'applicationSet': 'fiori',
                    'showErrorMessage': true
                }
            };
        var oVizFrame = new sap.viz.ui5.controls.VizFrame(that.createId("gp" + rep.REP_POS), {
            ui,
            selectData: function (oEvent) {
                var clickedData = oEvent.getParameter("data")[0].data
                console.log(clickedData);
            }

        });

        oModel.setData(gData);
        oVizFrame.setVizType(rep.GRAPH_TYPE);
        oVizFrame.setModel(oModel);
        oVizFrame.setWidth("100%");
        oVizFrame.setHeight("100%");
        var dimensions = [];
        for (var d = dms.length - 1; d > -1; d--) {
            if (dms[d].startsWith("DAT"))
                dimensions.push({
                    name: dms[d],
                    value: {
                        parts: [dms[d]],
                        formatter: function (oCreatestamp) {
                            if (oCreatestamp === null) {
                                return oCreatestamp;
                            }
                            return oCreatestamp;
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

            title: {text: ""},
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
        return oVizFrame;

    }


});
