sap.ui.controller("chainel1.QuickTreeRep", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf chainel1.QuickTreeRep **/
    onInit: function () {

    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf chainel1.QuickTreeRep
     **/
    onBeforeRendering: function () {

    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf chainel1.QuickTreeRep **/
    onAfterRendering: function () {

    },

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf chainel1.QuickTreeRep
     **/
    onExit: function () {

    }
    ,
    refresh: function () {
        var view = this.getView();
        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        if (view.colData == undefined)
            return;
        var ps = "";
        var ia = ""
        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + df.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getSelectedItem().getKey();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }


        ps += "&report-id=" + view.byId("txtSubGroup").getSelectedItem().getKey();
        var ca = "";
        for (var i = 0; i < view.colData.cols.length; i++)
            ca += (ca.length > 0 ? "&" : "") + "col_" + i + "=" + view.colData.cols[i].field_name;

        ps += (ca.length > 0 ? "&" : "") + ca;

        console.log(ps);

        // var pg=new sap.m.Page({
        //     customHeader:view.oBar2
        //
        // });
        var that = this;
        Util.doAjaxGet("exe?command=get-quickrep-data&" + (ps), "", false).done(function (data) {

            // console.log(data);

            view.qv.setJsonStr(data);
            view.qv.loadData();
        });
    },
    show_graph: function (rep) {
        if (rep.REP_TYPE == "SQL") {
            this.show_graph_sql(rep);
            return;
        }
        if (rep.REP_TYPE == "TABLE") {
            this.show_query(rep);
            return;
        }
        if (rep.REP_TYPE == "PDF") {
            this.show_pdf(rep);
            return;
        }

        var view = this.getView();
        var that = this;
        var mTree = view.qv.mTree;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);


        var selectedIndices = mTree.getSelectedIndices();
        var selectedEntries = [];
        var tableData = mTree.getModel().getData();
        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTree.getContextByIndex(selectedIndices[i]);
            var data = oData.getProperty(oData.getPath());
            var fnd = true;
            // do not add selectedEntries if subgroup or summary line..
            if (view.qv.mLctb.cols[0].mGrouped && (
                    data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4095)) ||
                    data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4094))
                ))
                fnd = false;
            if (fnd)
                selectedEntries.push(data);
        }


        var dt = {};
        var gData = [];
        var dms = rep.DIMENSIONS.split(",");
        var ms = rep.MEASURES;


        for (var i = 0; i < selectedEntries.length; i++) {
            dt = {};
            for (var d in dms)
                dt[dms[d]] = selectedEntries[i][dms[d]];
            dt[ms] = parseFloat(df.formatBack(selectedEntries[i][ms]));
            gData.push(dt);
        }
        this.executeGraph(rep, selectedEntries, gData);


    },

    show_graph_sql: function (rep) {
        if (rep.REP_TYPE == "DATASET") {
            this.show_graph(rep);
            return;
        }
        if (rep.REP_TYPE == "TABLE") {
            this.show_query(rep);
            return;
        }

        if (rep.REP_TYPE == "PDF") {
            this.show_pdf(rep);
            return;
        }

        var view = this.getView();
        var that = this;
        var mTree = view.qv.mTree;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);


        //get data according to dimensions and measures.
        var selectedIndices = mTree.getSelectedIndices();
        var selectedEntries = [];
        var tableData = mTree.getModel().getData();
        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTree.getContextByIndex(selectedIndices[i]);
            var data = oData.getProperty(oData.getPath());
            var fnd = true;
            // do not add selectedEntries if subgroup or summary line..
            if (view.qv.mLctb.cols[0].mGrouped && (
                    data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4095)) ||
                    data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4094))
                ))
                fnd = false;
            if (fnd)
                selectedEntries.push(data);
        }
        var dt = {};
        var gData = [];
        var ps = "";
        if (selectedEntries.length <= 0) {
            sap.m.MessageToast.show("No any record selected !");
            return;
        }
        var ia = "";

        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getSelectedItem().getKey();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }


        var rcv_flds = Util.nvl(rep.RCV_FLDS, "").split(",");  // finding out to recieve how many fields in array ...

        for (var i = 0; i < selectedEntries.length; i++)
            for (var k in selectedEntries[i]) {
                if (k == "_rowid") continue;
                if (rcv_flds.indexOf(k) < 0) continue;

                var s = "_flds_" + i + "_" + k + "=" + selectedEntries[i][k];
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "date")
                    s = "_flds_" + i + "_" + k + "=@" + sdf.format(selectedEntries[0][k]);
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "number")
                    s = "_flds_" + i + "_" + k + "=" + df.formatBack(selectedEntries[0][k]);

                ps += (ps.length > 0 ? "&" : "") + s;
            }
        ps += (ps.length > 0 ? "&" : "") + "_total_no=" + selectedEntries.length;

        ps += (ps.length > 0 ? "&" : "") + "_keyfld=" + rep.KEYFLD;
        Util.doAjaxGet("exe?command=get-graph-query&" + (ps), "", false).done(function (data) {
            //gData = JSON.parse(data).data;
            // if (rep.DIMENSIONS != undefined && rep.DIMENSIONS.split(",")[0] == "DAT") {
            //     for (var g in gData)
            //         gData[g]["DAT"] = new Date(gData[g]["DAT"]);
            //
            // }
            // procedure to sort dimension field..
            // var tmpData = JSON.parse(data);
            var bal_fld = "", firstDimField = "";
            if (rep.GRAPH_TYPE == "line" && Util.nvl(rep.SORT_FIELD, rep.DIMENSIONS) != undefined) {
                var tmpData = JSON.parse(data);
                for (var m in tmpData.metadata) {
                    if (tmpData.metadata[m]["colname"].endsWith("_bal"))
                        bal_fld = tmpData.metadata[m]["colname"];
                }
                //firstDimField = rep.DIMENSIONS.split(",")[0];
                firstDimField = Util.nvl(rep.SORT_FIELD, rep.DIMENSIONS).split(",")[0];
                var LocalTableData = sap.ui.require("sap/ui/chainel1/util/generic/LocalTableData");
                var lt = new LocalTableData();
                lt.parse(data);
                lt.sortCol(lt.getColByName(firstDimField).mColpos, true);
                gData = lt.getData(true);
            } else
                gData = JSON.parse(data).data;
        });
        this.executeGraph(rep, selectedEntries, gData);
    },

    executeGraph(rep, selectedEntries, gData) {


        var view = this.getView();
        var that = this;
        var mTree = view.qv.mTree;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);


        var oModel = new sap.ui.model.json.JSONModel();
        var dms = rep.DIMENSIONS.split(",");
        var ms = rep.MEASURES.split(",");
        var grpStr = rep.GRAPH_TITLE;

        view.GraphPage.removeAllContent();
        view.GraphPage.destroyContent();
        (view.byId("gp") != undefined ? view.byId("gp").destroy() : null);

        var ui = {}
        if (rep.FIORI == "TRUE")
            ui = {
                'uiConfig': {
                    'applicationSet': 'fiori',
                    'showErrorMessage': true
                }
            };
        var oVizFrame = new sap.viz.ui5.controls.VizFrame(view.createId("gp"), {
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
                            //var dt = new Date(oCreatestamp);
                            //var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd.MM.yyyy"});
                            //return sdf.format(dt);
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

        if (grpStr != undefined && selectedEntries.length > 0) {
            // from field value ...
            for (var i = 0; i < view.qv.mLctb.cols.length; i++) {
                var st = selectedEntries[0][view.qv.mLctb.cols[i].mColName] + "";
                if ((st.startsWith(String.fromCharCode(4094)) ||
                    st.startsWith(String.fromCharCode(4095))) &&
                    selectedEntries.length > 1)
                    st = selectedEntries[1][view.qv.mLctb.cols[i].mColName] + "";

                grpStr = grpStr.replace(":" + view.qv.mLctb.cols[i].mColName, st);
            }

            // from parameter value ....
            for (var i = 0; i < view.colData.parameters.length; i++) {
                var st = view.byId("para_" + i).getValue();
                grpStr = grpStr.replace(":#" + view.colData.parameters[i].PARAM_NAME, st);
            }
            var st = (view.byId("txtSubGroup").getValue() + "");
            grpStr = grpStr.replace(":#SUBREP", st);

        }

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


        view.GraphPage.addContent(oVizFrame);
    },
    show_query: function (rep) {
        var view = this.getView();
        var that = this;
        var mTree = view.qv.mTree;

        view.GraphPage.removeAllContent();
        view.GraphPage.destroyContent();
        (view.byId("gp") != undefined ? view.byId("gp").destroy() : null);
        if (this.subqry === undefined) {
            var QueryView = sap.ui.require("sap/ui/chainel1/util/generic/QueryView");
            this.subqry = new QueryView(view.createId("subqry"));
        }

        view.GraphPage.addContent(this.subqry.mTable);

        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);


        //get data according to dimensions and measures.
        var selectedIndices = mTree.getSelectedIndices();
        var selectedEntries = [];
        var tableData = mTree.getModel().getData();
        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTree.getContextByIndex(selectedIndices[i]);
            var data = oData.getProperty(oData.getPath());
            var fnd = true;
            // do not add selectedEntries if subgroup or summary line..
            if (view.qv.mLctb.cols[0].mGrouped && (
                    data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4095)) ||
                    data[view.qv.mLctb.cols[0].mColName].startsWith(String.fromCharCode(4094))
                ))
                fnd = false;
            if (fnd)
                selectedEntries.push(data);
        }
        var dt = {};
        var gData = [];
        var ps = "";
        if (selectedEntries.length <= 0) {
            sap.m.MessageToast.show("No any record selected !");
            return;
        }
        var ia = "";

        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getSelectedItem().getKey();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }


        var rcv_flds = Util.nvl(rep.RCV_FLDS, "").split(",");  // finding out to recieve how many fields in array ...

        for (var i = 0; i < selectedEntries.length; i++)
            for (var k in selectedEntries[i]) {
                if (k == "_rowid") continue;
                if (rcv_flds.indexOf(k) < 0) continue;

                var s = "_flds_" + i + "_" + k + "=" + selectedEntries[i][k];
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "date")
                    s = "_flds_" + i + "_" + k + "=@" + sdf.format(selectedEntries[0][k]);
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "number")
                    s = "_flds_" + i + "_" + k + "=" + df.formatBack(selectedEntries[0][k]);

                ps += (ps.length > 0 ? "&" : "") + s;
            }
        ps += (ps.length > 0 ? "&" : "") + "_total_no=" + selectedEntries.length;

        ps += (ps.length > 0 ? "&" : "") + "_keyfld=" + rep.KEYFLD;
        Util.doAjaxGet("exe?command=get-graph-query&" + (ps), "", true).done(function (data) {
            that.subqry.setJsonStr(data);
            that.subqry.loadData();
        });
    },
    show_pdf: function (rep) {

        var view = this.getView();
        var that = this;
        var mTree = view.qv.mTree;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var ps = "";
        var ia = "";

        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getSelectedItem().getKey();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }


        Util.doXhr("report?reportfile=" + rep.DIMENSIONS + "&" + ps, true, function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], {type: "application/pdf"});
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = rep.DIMENSIONS + new Date() + ".pdf";
                link.click();
            }
        });


    }


})
;
