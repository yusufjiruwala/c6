sap.ui.jsview('bin.Main', {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf bin.Main **/
    getControllerName: function () {
        return 'bin.Main';
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf bin.Main **/
    createContent: function (oController) {
        var that = this;
        this.custBar = UtilGen.createToolbar();
        this.pg = new sap.m.Page({
            showHeader: true,
            customHeader: this.custBar,
            content: []
        });
        this.fetch_graph_data();
        var gp = that.getMxGraph();
        var flx = new sap.m.FlexBox({
            items: [gp]
        });
        this.pg.addContent(gp);
        return this.pg;
    },
    fetch_graph_data: function () {

        var that = this;
        this.reps = [];
        this.gData = [];
        var ps = /*"_para_fromdate=@" + df.format((that.byId("fromdate").getDateValue())) +*/
            "_para_todate=@31/12/2018";
        ps += (ps.length > 0 ? "&" : "") + "_total_no=1";
        ps += (ps.length > 0 ? "&" : "") + "_keyfld=16";
        Util.doAjaxGet("exe?command=get-graph-query&" + (ps), "", false).done(function (data) {
            var bal_fld = "", firstDimField = "";
            that.gData = JSON.parse(data).data;
        });

        Util.doAjaxGet("exe?command=get-subrep&report-id=1", "", false).done(function (data) {
            that.reps = JSON.parse("{" + data + "}").subrep;
        })
    },
    getGraph: function () {
        var oModel = new sap.ui.model.json.JSONModel();
        var rep = this.reps[4];
        var dms = rep.DIMENSIONS.split(",");
        var ms = rep.MEASURES.split(",");
        var grpStr = rep.GRAPH_TITLE;


        var that = this;
        (that.byId("gp") != undefined ? that.byId("gp").destroy() : null);

        var ui = {
            'uiConfig': {
                'applicationSet': 'fiori',
                'showErrorMessage': true
            }
        };
        var oVizFrame = new sap.viz.ui5.controls.VizFrame(that.createId("gp"), {
            ui,
            selectData: function (oEvent) {
                var clickedData = oEvent.getParameter("data")[0].data
                console.log(clickedData);
            }

        });

        oModel.setData(that.gData);
        oVizFrame.setVizType("line");
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

    },
    getMxGraph: function () {
        var that = this;
        var htm = new sap.ui.core.HTML({content: "<div id='chart' style='position:absolute;overflow:auto;top:36px;bottom:0px;left:0px;right:0px;border-top:gray 1px solid;'></div> "});
        this.pg.addContent(htm);
        setTimeout(function () {
            var container = document.getElementById("chart");
            mxEvent.disableContextMenu(container);

            // Creates the graph inside the given container
            var graph = new mxGraph(container);

            graph.setEnabled(false);
            graph.setPanning(true);
            graph.setTooltips(true);
            graph.panningHandler.useLeftButtonForPanning = true;

            // Adds a highlight on the cell under the mousepointer
            new mxCellTracker(graph);

            // Changes the default vertex style in-place
            var style = graph.getStylesheet().getDefaultVertexStyle();
            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
            style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
            style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
            style[mxConstants.STYLE_PERIMETER_SPACING] = 4;
            style[mxConstants.STYLE_SHADOW] = true;

            style = graph.getStylesheet().getDefaultEdgeStyle();
            style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';

            style = mxUtils.clone(style);
            style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_CLASSIC;
            graph.getStylesheet().putCellStyle('2way', style);

            graph.isHtmlLabel = function (cell) {
                return true;
            };

            // Larger grid size yields cleaner layout result
//            graph.gridSize = 20;


            // Enables rubberband selection
            new mxRubberband(graph);

            // Gets the default parent for inserting new cells. This
            // is normally the first child of the root (ie. layer 0).
            var parent = graph.getDefaultParent();

            // Adds cells to the model in a single step
            var layout = new mxFastOrganicLayout(graph);

            //layout.forceConstant = 140;

            graph.getModel().beginUpdate();
            try {
                // Loads the custom file format (TXT file)
                that.parse(graph, 'resources/sample.xml');

                // Loads the mxGraph file format (XML file)
                that.read(graph, 'resources/sample.xml');

                // Gets the default parent for inserting new cells. This
                // is normally the first child of the root (ie. layer 0).
                var parent = graph.getDefaultParent();

                // Executes the layout
                //layout.execute(parent);
            }
            finally {
                // Updates the display
                graph.getModel().endUpdate();
            }

            graph.dblClick = function (evt, cell) {
                var mxe = new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', cell);
                this.fireEvent(mxe);

                if (!mxEvent.isConsumed(evt) && !mxe.isConsumed() &&
                    cell != null) {
                    mxUtils.alert('Show properties for cell ' + (cell.customId || cell.getId()));
                }
            };


        }, 100);
    },

    parse: function (graph, filename) {
        var model = graph.getModel();

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        var parent = graph.getDefaultParent();

        var req = mxUtils.load(filename);
        var text = req.getText();

        var lines = text.split('\n');

        // Creates the lookup table for the vertices
        var vertices = [];

        // Parses all lines (vertices must be first in the file)
        graph.getModel().beginUpdate();
        try {
            for (var i = 0; i < lines.length; i++) {
                // Ignores comments (starting with #)
                var colon = lines[i].indexOf(':');
                if (lines[i].substring(0, 1) != "#" ||
                    colon == -1) {
                    var comma = lines[i].indexOf(',');
                    var value = lines[i].substring(colon + 2, lines[i].length);

                    if (comma == -1 || comma > colon) {
                        var key = lines[i].substring(0, colon);

                        if (key.length > 0) {
                            vertices[key] = graph.insertVertex(parent, null, value, 0, 0, 80, 70);
                        }
                    }
                    else if (comma < colon) {
                        // Looks up the vertices in the lookup table
                        var source = vertices[lines[i].substring(0, comma)];
                        var target = vertices[lines[i].substring(comma + 1, colon)];

                        if (source != null && target != null) {
                            var e = graph.insertEdge(parent, null, value, source, target);

                            // Uses the special 2-way style for 2-way labels
                            if (value.indexOf('2-Way') >= 0) {
                                e.style = '2way';
                            }
                        }
                    }
                }
            }
        }
        finally {
            graph.getModel().endUpdate();
        }
    },
    read: function (graph, filename) {
        var req = mxUtils.load(filename);
        var root = req.getDocumentElement();
        var dec = new mxCodec(root.ownerDocument);

        dec.decode(root, graph.getModel());
    }
})
;
