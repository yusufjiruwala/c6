sap.ui.jsview('bin.Dashboard', {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf bin.Dashboard **/
    getControllerName: function () {
        return 'bin.Dashboard';
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf bin.Dashboard **/
    createContent: function (oController) {
        jQuery.sap.require("sap.viz.library");
        jQuery.sap.require("sap.ui.table.library");
        jQuery.sap.require("sap.ui.layout.library");


        Util.setLanguageModel(this);
        var that = this;
        that.screen = -1;
        that.screen_name = "";
        that.screen_type = "Dashboard";

        var url = new URL(window.location.href);
        var code = url.searchParams.get("screen");
        if (code != undefined)
            that.screen_init = code;

        Util.doAjaxGet("settings", "", false).done(function (data) {
            var dt = JSON.parse(data);
            var oModel = new sap.ui.model.json.JSONModel(dt);
            sap.ui.getCore().setModel(oModel, "settings");
        });
        // get screen data and store it in --screen-- model.. set default screen by URL parameter...
        Util.doAjaxGet("exe?command=get-screens", "", false).done(function (data) {
            if (data != undefined) {
                var dt = JSON.parse(data).data;
                var oModel = new sap.ui.model.json.JSONModel(dt);
                sap.ui.getCore().setModel(oModel, "screens");
                that.screen = dt[0].CODE;
                that.screen_name = dt[0].DESCR;
                if (that.sLangu == "AR")
                    that.screen_name = UtilGen.nvl(dt[0].DESCR_A, dt[0].DESCR);

                var j = -1;
                for (var i in  dt)
                    if (dt[i].CODE == that.screen_init) {
                        j = i;
                        break;
                    }
                if (j >= 0) {
                    that.screen = dt[j].CODE;
                    that.screen_name = dt[j].DESCR;
                    if (that.sLangu == "AR")
                        that.screen_name = UtilGen.nvl(dt[j].DESCR_A, dt[j].DESCR);
                    that.screen_type = dt[j].GROUPNAME;
                }
            }

        });

        this.lblTitle = new sap.m.Label({text: ""}).addStyleClass("titleFont_nopad");
        this.rows = [];  // rows will be generated in this array

        this.custBar = that.createToolbar();
        this.pg = new sap.m.Page({
            showHeader: true,
            customHeader: this.custBar,

            content: []
        });
        if (that.screen_type == "Dashboard")
            this.buildDashboardModel();
        else {
            var fr = sap.ui.jsfragment("bin." + that.screen_type, oController);
            UtilGen.clearPage(that.pg);
            that.pg.addContent(fr);
            that.lblTitle.setText(that.screen_name);

        }
//this.pg.addContent();

        var app = new sap.m.App({pages: [this.pg]});
        return app;

    },
    createDashBoard: function () {
        var that = this;
        UtilGen.clearPage(this.pg);
        var bl = new sap.ui.layout.BlockLayout({
            background: sap.ui.layout.BlockBackgroundType.Dashboard
        });
        for (var i in this.rows) {
            var br = new sap.ui.layout.BlockLayoutRow({});
            for (var c in that.rows[i]) {
                var rep = that.rows[i][c];
                var graph = that.getGraphCell(rep);
                var tit = rep.REP_TITLE;
                if (that.sLangu == "AR")
                    tit = UtilGen.nvl(rep.REP_TITLE_ARB, tit);

                br.addContent(new sap.ui.layout.BlockLayoutCell({
                    title: tit,
                    width: rep.CELL_WIDTH,
                    content: [graph]
                }));
            }
            bl.addContent(br);
        }

        this.pg.addContent(bl);
        var fn = function () {
            $(".sapUiBlockCellContent").css("padding", "1rem");
            $(".sapUiBlockCellTitle").css("padding", "0rem");
            $(".sapUiBlockCellTitle").css("color", "blue");
            if (sap.ui.Device.system.phone)
                $(".sapUiBlockCellTitle").css("font-size", "1rem");
            else
                $(".sapUiBlockCellTitle").css("font-size", "1rem");
        };
        setTimeout(fn, 100);
    }
    ,

    buildDashboardModel: function () {

        var that = this;
        this.reps = [];
        this.gData = [];
        this.rows = [];

        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

        that.byId("todate").$().show();

        var ps = /*"_para_fromdate=@" + df.format((that.byId("fromdate").getDateValue())) +*/
            "_para_todate=@" + df.format((that.byId("todate").getDateValue()));
        ps += (ps.length > 0 ? "&" : "") + "_total_no=1";
        ps += (ps.length > 0 ? "&" : "");


        Util.doAjaxGet("exe?command=get-subrep&report-id=" + that.screen, "", false).done(function (data) {
            that.reps = JSON.parse("{" + data + "}").subrep;
            that.lblTitle.setText(that.screen_name);
        });

        that.prpepareDBItem(ps);

        // for (var i in that.reps) {
        //
        //     Util.doAjaxGet("exe?command=get-graph-query&" + (ps) + "&_keyfld=" + that.reps[i].KEYFLD, "", false).done(function (data) {
        //         var bal_fld = "", firstDimField = "";
        //         that.gData = JSON.parse(data).data;
        //         that.prepareDBItem(ps);
        //     });
        // }
    }
    ,
    prpepareDBItem: function (ps) {
        var that = this;

        // building data model to display rows and cells using helper functions and calling ajax from server...

        var rn = this._distinctive_rownos();
        rn.sort((a, b) => a - b);
        var rcnt = 0;

        for (var i in rn) {
            this.rows[rcnt] = [];
            this.rows[rcnt] = (this._getRepsByRowNo(rn[i]));
            for (var r in this.rows[rcnt]) {
                Util.doAjaxGet("exe?command=get-graph-query&" + (ps) + "&_keyfld=" + this.rows[rcnt][r].KEYFLD, "", false).done(function (data) {
                    var bal_fld = "", firstDimField = "";
                    var rep = that.rows[rcnt][r];
                    if (rep.GRAPH_TYPE == "line" && Util.nvl(rep.SORT_FIELD, rep.DIMENSIONS) != undefined) {
                        var tmpData = JSON.parse(data);
                        for (var m in tmpData.metadata) {
                            if (tmpData.metadata[m]["colname"].endsWith("_bal"))
                                bal_fld = tmpData.metadata[m]["colname"];
                        }
                        firstDimField = Util.nvl(rep.SORT_FIELD, rep.DIMENSIONS).split(",")[0];
                        //var LocalTableData = sap.ui.require("sap/ui/ce/generic/LocalTableData");
                        var lt = new LocalTableData();
                        lt.parse(data);
                        lt.sortCol(lt.getColByName(firstDimField).mColpos, true);
                        that.rows[rcnt][r].gData = lt.getData(true);
                    } else if (data)
                        that.rows[rcnt][r].gData = JSON.parse(data).data;
                });
            }
            rcnt++;
        }


        // -- displaying graphs and tables in blocklayout..
        this.createDashBoard();

    }
    ,
    _distinctive_rownos() {
        // build unique rows array from all sub reports fetched...
        var rn = [];
        for (var i in this.reps) {
            var rr = this.reps[i].ROWNO;
            if (rn.length == 0)
                rn.push(rr);
            if (rn.length > 0 && rn.indexOf(rr) < 0)
                rn.push(rr);
        }
        return rn;
    }
    ,
    _getRepsByRowNo: function (rowno) {
        var rpx = [];
        for (var i in this.reps)
            if (this.reps[i].ROWNO == rowno)
                rpx.push(this.reps[i]);
        return rpx;
    }
    ,
    getGraphCell: function (rep) {

        if (rep.GRAPH_TYPE == "gauge")
            return this.getGauge(rep);
        if (rep.GRAPH_TYPE == "table")
            return this.getQuery(rep);
        if (rep.GRAPH_TYPE == "amount")
            return this.getAmount(rep);

        var oModel = new sap.ui.model.json.JSONModel();
        var dms = rep.DIMENSIONS.split(",");
        var ms = rep.MEASURES.split(",");
        var grpStr = rep.GRAPH_TITLE;
        var gData = rep.gData;


        var that = this;
        (that.byId("gp" + rep.KEYFLD) != undefined ? that.byId("gp" + rep.KEYFLD).destroy() : null);

        var ui = {
            'uiConfig': {
                'applicationSet': 'fiori',
                'showErrorMessage': true
            }
        };
        var oVizFrame = new sap.viz.ui5.controls.VizFrame(that.createId("gp" + rep.KEYFLD), {
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
        oVizFrame.setHeight(rep.CELL_HEIGHT);

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
        );

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
            'uid': (rep.GRAPH_TYPE != "pie" ? "valueAxis" : "size"),
            'type': "Measure",
            'values': ms
        });

        for (var d = dms.length - 1; d > -1; d--) {//for (var d in dms) {
            var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': (rep.GRAPH_TYPE != "pie" ? (d == 0 ? "categoryAxis" : "color") : "color"),
                'type': "Dimension",
                'values': [dms[d]]
            });
            oVizFrame.addFeed(feedCategoryAxis);
        }
        oVizFrame.addFeed(feedValueAxis);
        // var bc = new sap.ui.layout.BlockLayoutCell({
        //     width: rep.CELL_WIDTH,
        //     content: [oVizFrame]
        // });

        return oVizFrame;

    }
    ,
    getGauge: function (rep) {
        var gj;
        var that = this;
        var sq = {
            status: "NONE",
            sql: "select *from C6_DB_GAUGES where keyfld='" + rep.SQL + "'",
            data: null
        };
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var ps = /*"_para_fromdate=@" + df.format((that.byId("fromdate").getDateValue())) +*/
            "_para_todate=@" + df.format((that.byId("todate").getDateValue()))
        ;
        Util.doAjaxGet("gaugedata2?" + ps, "&_keyfld='" + rep.SQL + "'", false).done(function (data) {
            rep.gjData = JSON.parse(data).data[0];
            var gg;
            gj = that.createGauge("gauge_" + rep.KEYFLD, rep.gjData, rep);
        });
        return gj;
    }
    ,
    createGauge: function (name, gg, rep) {
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
        if (max > 1)
            lbls.push(new sap.m.Label({text: "Target: " + df.format(max)}));
        lbls.push(new sap.m.Label({text: "" + df.format(vl)}).addStyleClass("titleFont_nopad"));
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
        var oGCell1 = new sap.m.FlexBox({
            id: that.createId(name + "_parent"),
            height: rep.CELL_HEIGHT,
            items: [
                oc2
            ],
            customData: [{key: oc2.getId(), value: gg}]
        });

        var g = new Gauge(that.createId(name), config);
        setTimeout(function () {
            g.render();
            g.redraw(vl);
        }, 300);


        return oGCell1;
    }
    ,
    getQuery: function (rep) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        (that.byId("tbl" + rep.KEYFLD) != undefined ? that.byId("tbl" + rep.KEYFLD).destroy() : null);
        var qv = new QueryView(this.createId("tbl" + rep.KEYFLD));

        var flx = new sap.m.ScrollContainer({
            height: rep.CELL_HEIGHT,
            vertical: true,
            content: [qv.getControl()]
        });

        //var qv = new GridView(flx,rep);
        qv.getControl().addStyleClass("sapUiSizeCompact");
        qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.None);
        qv.getControl().setRowHeight(rep.ROWSHEIGHT);

        qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
        qv.getControl().setWidth("-1px");


        var ps = "_total_no=1&_para_todate=@" + sdf.format((that.byId("todate").getDateValue()));
        ps += "&_keyfld=" + rep.KEYFLD;
        Util.doAjaxGet("exe?command=get-graph-query&" + (ps), "", true).done(function (data) {
            qv.setJsonStr(data);
            qv.loadData();
            if (qv.getLcData().rows.length <= 20) {
                qv.getControl().setVisibleRowCount(qv.getLcData().rows.length + 3);
            } else {
                qv.getControl().setVisibleRowCount(20);
            }
            setTimeout(function () {
                $(".sapUiTableVSbBg").hide();
                $(".sapUiTableVSb").hide();
            }, 50);

        });

        return flx;
    }
    ,
    getAmount: function (rep) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var currency = sett["CURRENCY_TITLE"];
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        (that.byId("amt" + rep.KEYFLD) != undefined ? that.byId("amt" + rep.KEYFLD).destroy() : null);
        var html = new sap.ui.core.HTML(this.createId("amt" + rep.KEYFLD));

        var flx = new sap.m.ScrollContainer({
            height: rep.CELL_HEIGHT,
            vertical: true,
            content: [html]
        });

        var ps = "_total_no=1&_para_todate=@" + sdf.format((that.byId("todate").getDateValue()));
        ps += "&_keyfld=" + rep.KEYFLD;
        Util.doAjaxJson("sqlmetadata?" + ps, {
            sql: rep.SQL,
            ret: "NONE",
            data: null
        }, false).done(function (data) {
            var dt = JSON.parse("{" + data.data + "}").data;
            html.setContent("<div class='titleFont'>" + df.format(dt[0].AMOUNT) +
                "<div class='currencyText'>[" + currency + "]</div></div> ");
        });

        return flx;


    },

    createToolbar: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var fromDate = new Date();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        this.todt = new sap.m.DatePicker(that.createId("todate"),
            {
                width: "125px",
                dateValue: fromDate,
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                change: function (ev) {
                    var dt = ev.getParameters("value");
                    that.todt = dt;
                    that.buildDashboardModel();
                }
            }
        );

        var menuBar = new sap.m.Bar({
            contentLeft: [new sap.m.Button({
                icon: "sap-icon://home",
                text: "",
                press: function () {

                    document.location.href = "/?clearCookies=true";
                    //Util.cookiesClear();
                }
            }),
                new sap.m.Button({
                    icon: "sap-icon://product",
                    text: "",
                    press: function () {
                        that.showApps();
                    }
                }),
            ],
            contentMiddle: [that.lblTitle],

            contentRight: [this.todt,
                new sap.m.Button({
                    icon: "sap-icon://drop-down-list",
                    tooltip: "Select another role !",
                    press: function (e) {
                        UtilGen.select_screen(that.oController);
                    }
                })
            ]

        });
        menuBar.addStyleClass("sapContrast sapMIBar");
        return menuBar;

    }

})
;
