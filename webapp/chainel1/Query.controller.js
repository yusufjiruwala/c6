sap.ui.controller("chainel1.Query", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf chainel1.Query **/
    onInit: function () {

    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf chainel1.Query
     **/
    onBeforeRendering: function () {

    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf chainel1.Query **/
    onAfterRendering: function () {

    },

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf chainel1.Query
     **/
    onExit: function () {

    }
    ,
    refresh: function (iadd) {
        var view = this.getView();
        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        if (view.colData == undefined)
            return;
        var ps = "";
        var ia = Util.nvl(iadd, "");


        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = "";
            if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (view.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else
                vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");

            view.query_para[view.colData.parameters[i].PARAM_NAME] = vl;

            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + df.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getValue();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }

        var grp1 = (view.byId("txtGroupHeader") != undefined ? Util.nvl(view.byId("txtGroupHeader").getValue(), "") : "");
        var grp2 = (view.byId("txtGroupDetail") != undefined ? Util.nvl(view.byId("txtGroupDetail").getValue(), "") : "");


        ps += "&report-id=" + view.byId("txtSubGroup").getSelectedItem().getKey() +
            "&group1=" + grp1 + "&group2=" + grp2;


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

            //console.log(data);
            view.qv.setJsonStr(data);

            view.qv.loadData();
            view.fetchFixReports();
            view.executed = true;
            if (sap.ui.getCore().getModel("query_para") != undefined)
                sap.ui.getCore().getModel("query_para").setData(view.query_para);
            else
                sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(view.query_para), "query_para");

        });
    },
    show_graph_option: function (rep) {
        var that = this;
        var view = this.getView();
        (view.byId("graphOption") != undefined ? view.byId("graphOption").destroy() : null);
        var cb = new sap.m.ComboBox(view.createId("graphOption"), {});
        Util.doAjaxGet("exe?command=get-option-subreps&report-id=" + rep.REP_ID, false).done(function (data) {
            var dt = JSON.parse(data);
            view.optionReps = [];

            for (var v in dt)
                for (var d in dt[v]) {
                    cb.addItem(new sap.ui.core.ListItem({
                        text: v + "-" + dt[v][d].REP_TITLE,
                        key: v + "-" + dt[v][d].REP_TITLE
                    }));
                    view.optionReps[v + "-" + dt[v][d].REP_TITLE] = dt[v][d];
                }

            view.GraphPage.removeAllContent();
            view.GraphPage.destroyContent();
            view.GraphPage.addContent(view.graphToolBar);
            view.graphToolBar.addContent(cb);

            cb.attachSelectionChange(function (ev) {
                var rep = view.optionReps[cb.getSelectedItem().getKey()];
                that.show_graph(rep);
            });
            if (cb.getItems().length > 0) {
                cb.setSelectedItem(cb.getItems()[0]);
                var rep = view.optionReps[cb.getSelectedItem().getKey()];
                that.show_graph(rep);
            }


        });

    },
    show_graph: function (rep) {
        if (rep.REP_TYPE == "SQL") {
            this.show_graph_sql(rep);
            return;
        }

        // if (rep.REP_TYPE == "DATASET") {
        //     this.show_graph(rep);
        //     return;
        // }
        if (rep.REP_TYPE == "TABLE") {
            this.show_query(rep);
            return;
        }

        if (rep.REP_TYPE == "PDF") {
            this.show_pre_pdf(rep);
            return;
        }

        var view = this.getView();
        var that = this;
        var mTable = view.qv.mTable;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);


        var selectedIndices = mTable.getSelectedIndices();
        var selectedEntries = [];
        var tableData = mTable.getModel().getData();
        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTable.getContextByIndex(selectedIndices[i]);
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
        var mTable = view.qv.mTable;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);


        //get data according to dimensions and measures.
        var selectedIndices = mTable.getSelectedIndices();
        var selectedEntries = [];
        var tableData = mTable.getModel().getData();
        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTable.getContextByIndex(selectedIndices[i]);
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
        var ia = Util.nvl(view.iadd, "");

        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = "";
            if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (view.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else
                vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getValue();

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
            gData = JSON.parse(data).data;
            if (rep.DIMENSIONS != undefined && rep.DIMENSIONS.split(",")[0] == "DAT") {
                for (var g in gData)
                    gData[g]["DAT"] = new Date(gData[g]["DAT"]);

            }
        });
        this.executeGraph(rep, selectedEntries, gData);
    },

    executeGraph: function (rep, selectedEntries, gData) {


        var view = this.getView();
        var that = this;
        var mTable = view.qv.mTable;


        var oModel = new sap.ui.model.json.JSONModel();
        var dms = rep.DIMENSIONS.split(",");
        var ms = rep.MEASURES.split(",");
        var grpStr = rep.GRAPH_TITLE;
        var ia = Util.nvl(view.iadd, "");

        view.GraphPage.removeAllContent();
        view.GraphPage.destroyContent();
        view.GraphPage.addContent(view.graphToolBar);
        (view.byId("gp") != undefined ? view.byId("gp").destroy() : null);


        var ui = {}
        if (rep.FIORI == "TRUE")
            ui = {
                'uiConfig': {
                    'applicationSet': 'fiori',
                    'showErrorMessage': true
                }
            };
        var oVizFrame = new sap.viz.ui5.controls.VizFrame(view.createId("gp"), {ui});

        oModel.setData(gData);
        oVizFrame.setVizType(rep.GRAPH_TYPE);
        oVizFrame.setModel(oModel);
        oVizFrame.setWidth("100%");
        oVizFrame.setHeight("100%");
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
                var st = "";
                if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                    st = (view.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
                else
                    st = Util.nvl(view.byId("para_" + ia + i).getValue(), "");

                grpStr = grpStr.replace(":#" + view.colData.parameters[i].PARAM_NAME, st);
            }
            var st = (view.byId("txtSubGroup").getValue() + "");
            grpStr = grpStr.replace(":#SUBREP", st);
            st = (view.byId("txtGroupHeader") != undefined ? view.byId("txtGroupHeader").getValue() : "");
            grpStr = grpStr.replace(":#GROUP1", st);
            st = (view.byId("txtGroupDetail") != undefined ? view.byId("txtGroupDetail").getValue() : "");
            grpStr = grpStr.replace(":#GROUP2", st);

        }

        oVizFrame.setVizProperties({
            plotArea: {
                colorPalette: d3.scale.category20().range(),
                dataPoint: {invalidity: 'ignore'},
                dataLabel: {
                    visible: (rep.GRAPH_TYPE=='pie'?true:false)
                }
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


        view.GraphPage.addContent(oVizFrame);
        oVizFrame.setHeight("80%");
        this.add_selected_table(rep, selectedEntries);

    },
    add_selected_table: function (rep, selectedEntries) {
        var view = this.getView();
        var that = this;
        var mLctb = view.qv.mLctb;
        var h = "", dt = "", rs = "", t = "";
        var rowid;
        var tmpv1 = "", tmpv2 = "", tmpv3 = "", classadd = "", styleadd = "", cellValue = "";
        var cf = "";
        var grouped = mLctb.cols[0].mGrouped;
        var cnt = 0;
        for (var c in view.qv.col) {
            cnt++;
            if (cnt - 1 == 0 && grouped) continue;
            if (cnt - 1 === view.qv.col.length) continue;
            tmpv1 = view.qv.col[c].getLabel().getText();
            tmpv2 = "\"text-align:" + view.qv.col[c].getHAlign().toLowerCase() + "\"";
            h += "<th " + tmpv2 + ">" + Util.htmlEntities(tmpv1) + "</th>";
        }
        h = "<thead>" +
            "<tr>" + h + "</tr></thead>";

        for (var i = 0; i < selectedEntries.length; i++) {
            rs = "";
            cnt = 0;
            tmpv2 = "", tmpv3 = "", classadd = "", styleadd = "";
            rowid = Number(Util.nvl(selectedEntries[i]["_rowid"], -1));
            cf = "";
            // finding conditional format..
            for (var v in selectedEntries[i]) {
                var cn = mLctb.getColPos(v);
                if (cn > -1 && rowid > -1 && Util.nvl(mLctb.cols[cn].mCfOperator, "").length > 0) {
                    if (mLctb.evaluteCfValue(mLctb.cols[cn], rowid))
                        cf += mLctb.cols[cn].mCfTrue;
                    else
                        cf += mLctb.cols[cn].mCfFalse;
                }
            }
            // for adding numbers
            for (var v in selectedEntries[i]) {
                cnt++;
                tmpv2 = "", tmpv3 = "", classadd = "", styleadd = "";
                var cn = mLctb.getColPos(v);
                var cc = mLctb.cols[cn];
                if (cnt - 1 == 0) {
                    t = v;
                }   // get 1st array key.. to find this row is summary/group
                if (cnt - 1 === 0 && grouped) {
                    continue;
                }
                if (cnt - 1 === mLctb.cols.length) break;
                cellValue = selectedEntries[i][v];


                if (cellValue != undefined && (cellValue + "").trim().length > 0 && selectedEntries[i][t].startsWith(String.fromCharCode(4095))) {
                    classadd += "yellow "
                }
                if (grouped && cellValue != undefined && selectedEntries[i][t].startsWith(String.fromCharCode(4094))) {
                    classadd += "qrGroup ";
                }

                if (rowid > -1 && cf.length > 0)
                    styleadd += cf;
                if (Util.nvl(cc.getMUIHelper().display_style, "").length > 0) {
                    styleadd += cc.getMUIHelper().display_style;
                }

                var a = "text-align:" + cc.getMUIHelper().display_align + " ";
                if (cc.getMUIHelper().display_format == "MONEY_FORMAT")
                    a = "text-align:end ";
                if (cc.getMUIHelper().display_format == "QTY_FORMAT")
                    a = "text-align:center ";
                styleadd += a;

                styleadd = (styleadd.length > 0 ? ' style="' : "") + styleadd + (styleadd.length > 0 ? '"' : "");
                classadd = (classadd.length > 0 ? ' class="' : "") + classadd + (classadd.length > 0 ? '"' : "");
                tmpv2 = (tmpv2.length > 0 ? ' colspan="' : "") + tmpv2 + (tmpv2.length > 0 ? '"' : "");
                rs += "<td" + tmpv2 + classadd + styleadd + " > " + Util.nvl(Util.htmlEntities(cellValue), "") + "</td>";
            }
            dt += "<tr>" + rs + "</tr>";

        }
        h = "<table class='graphTable'>" + h + dt + "</table>";
        (view.byId("htmlGraphTable") != undefined ? view.byId("htmlGraphTable").destroy() : null);
        var oo = new sap.ui.core.HTML(view.createId("htmlGraphTable"), {
            content: h
        }).addStyleClass("sapUiSmallMarginTop");
        view.GraphPage.addContent(oo);
    },
    show_query: function (rep) {
        var view = this.getView();
        var that = this;
        var mTable = view.qv.mTable;

        view.GraphPage.removeAllContent();
        view.GraphPage.destroyContent();
        view.GraphPage.addContent(view.graphToolBar);
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
        var selectedIndices = mTable.getSelectedIndices();
        var selectedEntries = [];
        var tableData = mTable.getModel().getData();
        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTable.getContextByIndex(selectedIndices[i]);
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
        var ia = Util.nvl(view.iadd, "");

        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = "";
            if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (view.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else
                vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getValue();

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
    show_pre_pdf: function (rep) {

        var view = this.getView();
        var that = this;
        // view.fetchFixReports(true, function () {
        //     that.show_pdf(rep);
        // })

        if (rep.FETCH_FIX_REP_PIC == undefined && !rep.FETCH_FIX_REP_PIC.toUpperCase().startsWith("T")) {
            that.show_pdf(rep);
            return;
        }

        var tabs = new sap.m.FlexBox({
            direction: sap.m.FlexDirection.Column,
        });
        var sel = sap.ui.getCore().byId((view.tabs.getSelectedItem()));
        var cnt = 0;
        var repprint = [];
        for (var v = 0; v < view.tabs.getItems().length; v++) {
            // only upload pic of MEASURES field contains and multiple sub reports delimeted with single quot.
            if (Util.nvl(rep.MEASURES, '') !== '' &&
                ((rep.MEASURES.toUpperCase().indexOf("'" + view.tabs.getItems()[v].getName().toUpperCase() + "'") !== -1) ||
                rep.MEASURES.toUpperCase() == view.tabs.getItems()[v].getName().toUpperCase())) {

                view.tabs.setSelectedItem(view.tabs.getItems()[v]);
                var o = view.tabs.getItems()[v].getContent()[0].$().outerHTML();
                var oo = new sap.ui.core.HTML({
                    content: o
                });
                var flx = new sap.m.FlexBox({
                    items: [oo]
                });
                flx.$().css("overflow", "visible");
                tabs.addItem(flx);
                repprint.push(view.itmsrep[v]);
                cnt++;
            }
        }
        view.tabs.setSelectedItem(sel);
        if (cnt == 0) {
            that.show_pdf(rep);
            return;
        }
        var dlg = new sap.m.Dialog({
            title: "Will Upload following images for PDF reports..",
            content: [tabs],
            buttons: [new sap.m.Button({
                text: "Download PDF",
                press: function (e) {
                    for (var v = 0; v < tabs.getItems().length; v++) {
                        view.uploading = true;
                        view.upload_pic(repprint[v], tabs.getItems()[v]);
                    }
                    var bt = this;
                    bt.setEnabled(false);
                    setTimeout(function () {

                        while (view.uploading) {
                        }

                        dlg.close();
                        that.show_pdf(rep);
                    }, 1000);
                }
            })]
        })
        dlg.open();

    },
    show_pdf: function (rep) {

        var view = this.getView();
        var that = this;
        var mTable = view.qv.mTable;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var ps = "";
        var ia = Util.nvl(view.iadd, "");
        // for (var v in view.itms) {
        //     view.tabs.setSelectedItem(view.tbs[v]);
        //     view.uploading = false;
        //     view.bts[v].firePress();
        //     while (view.uploading) {
        //     }
        // }

        var selectedIndices = mTable.getSelectedIndices();
        var selectedEntries = [];

        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTable.getContextByIndex(selectedIndices[i]);
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

        // if (selectedEntries.length <= 0) {
        //     sap.m.MessageToast.show("No any record selected !");
        //     return;
        // }

        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = "";
            if (view.colData.parameters[i].PARA_DATATYPE === "BOOLEAN")
                vl = (view.byId("para_" + ia + i).getSelected() ? "TRUE" : "FALSE");
            else
                vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");

            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + sdf.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getValue();
            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }

        var rcv_flds = Util.nvl(rep.RCV_FLDS, "").split(",");  // finding out to recieve how many fields in array ...
        var ps2 = "";
        for (var i = 0; i < selectedEntries.length; i++) {
            ps2 = "";
            for (var k in selectedEntries[i]) {
                if (k == "_rowid") continue;
                if (rcv_flds.indexOf(k) < 0) continue;

                var s = k + "=" + selectedEntries[i][k];
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "date")
                    s = k + "=@" + sdf.format(selectedEntries[0][k]);
                if (view.qv.mLctb.getColByName(k).getMUIHelper().data_type === "number")
                    s = k + "=" + df.formatBack(selectedEntries[0][k]);

                ps2 += (ps2.length > 0 ? "&" : "") + s;
            }

            if (rep.BEFORE_SQL_EXE_ONCE != undefined && rep.BEFORE_SQL_EXE_ONCE.length > 0 && i == 0) {
                Util.doAjaxJson("sqlmetadata?" + ps2 + "&" + ps, {
                    sql: rep.BEFORE_SQL_EXE_ONCE,
                    ret: "NONE",
                    data: null
                }, false).done(function (data) {
                });
            }
            if (rep.BEFORE_SQL_EXE != undefined && rep.BEFORE_SQL_EXE.length > 0) {
                Util.doAjaxJson("sqlmetadata?" + ps2 + "&" + ps, {
                    sql: rep.BEFORE_SQL_EXE,
                    ret: "NONE",
                    data: null
                }, false).done(function (data) {
                });
            }
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
    },

    showFilterWindow: function () {
        var view = this.getView();
        var that = this;
        var txts = [];
        if (view.filterData == undefined)
            view.filterData = [];

        for (var i = 0; i < view.qv.mLctb.cols.length; i++) {

            (view.byId("txtflt" + i) != undefined ? view.byId("txtflt" + i).destroy() : null);
            var t = new sap.m.Input(view.createId("txtflt" + i), {
                width: "100%",
                placeholder: "Filter for field # " + view.qv.mLctb.cols[i].mTitle,
                value: Util.nvl(view.filterData[view.qv.mLctb.cols[i].mColName], "")
            });
            txts.push(t);
        }


        var flexOther = new sap.m.FlexBox(view.createId("flxOtherFilter"), {
            width: "100%",
            height: "100%",
            direction: sap.m.FlexDirection.Row,
            justifyContent: sap.m.FlexJustifyContent.Center,
            items: []
        });

        var flexMain = new sap.m.FlexBox({
            width: "100%",
            height: "100%",
            direction: sap.m.FlexDirection.Column,
            justifyContent: sap.m.FlexJustifyContent.Start,
            alignItems: sap.m.FlexAlignItems.Start,
            items: txts
        });

        var dlg = new sap.m.Dialog({
            title: "Filtering data..",
            content: [flexMain],
            buttons: [new sap.m.Button({
                text: "Filter",
                press: function () {
                    var str = "";
                    for (var i = 0; i < view.qv.mLctb.cols.length; i++) {
                        var s = view.byId("txtflt" + i).getValue();
                        var op = "%%";
                        op = (s.startsWith("=") ? "=" :
                            s.startsWith("!=") ? "!=" :
                                s.startsWith("<>") ? "<>" :
                                    s.startsWith(">=") ? ">=" :
                                        s.startsWith("<=") ? "<=" :
                                            s.startsWith(">") ? ">" :
                                                s.startsWith("<") ? "<" : "%%");
                        if (s.startsWith(op)) {
                            s = s.substring(op.length);
                        }
                        view.filterData[view.qv.mLctb.cols[i].mColName] = null;
                        if (s != undefined && s.length > 0) {
                            if (s.indexOf("&&")) {
                                var ss = Util.splitString(s, ["&&"]);
                                for (var x in ss) {
                                    if (x == 0) {
                                        str += (str.length > 0 ? " && " : "") + view.qv.mLctb.cols[i].mColName + op + ss[0];
                                        view.filterData[view.qv.mLctb.cols[i].mColName] = (op == "%%" ? "" : op) + s;
                                    } else
                                        str += (str.length > 0 ? " && " : "") + view.qv.mLctb.cols[i].mColName + ss[x];
                                }
                            }
                            else {
                                str += (str.length > 0 ? " && " : "") + view.qv.mLctb.cols[i].mColName + op + s;
                                view.filterData[view.qv.mLctb.cols[i].mColName] = (op == "%%" ? "" : op) + s;
                            }
                        }
                    }
                    view.qv.mViewSettings["filterStr"] = str;
                    view.qv.loadData();
                    dlg.close();
                }
            }),
                new sap.m.Button({
                    text: "Clear filter",
                    press: function () {
                        view.filterData = [];
                        view.qv.mViewSettings["filterStr"] = null;
                        view.qv.loadData();
                        dlg.close();
                    }

                })
            ]
        });
        dlg.open();

        dlg.attachAfterClose(function () {
            (view.byId("flxOtherFilter") != undefined ? view.byId("flxOtherFilter").destroy() : null);
            for (var i = 0; i < view.qv.mLctb.cols.length; i++) {
                (view.byId("txtflt" + i) != undefined ? view.byId("txtflt" + i).destroy() : null);
            }
        })
    },
    printGraph: function (rep) {
        var view = this.getView();
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var oVizFrame = view.byId("gp");
        if (oVizFrame == undefined) return;
        var tblHtml = (view.byId("htmlGraphTable") != undefined ? view.byId("htmlGraphTable").$().outerHTML() : "");
        var o = oVizFrame.$().outerHTML() + tblHtml;
        var h = "<div class='company'>" + sett["COMPANY_NAME"] + "</div> " +
            (rep == undefined ? "" :
            "<div class='reportTitle'>" + view.reportsData.report_info.report_name +
            " - " + rep.substr(0, rep.indexOf(" - ")) + "</div>");

        var newWin = window.open("");


        newWin.document.write(h + o);

        $("<link>", {rel: "stylesheet", href: "css/print.css"}).appendTo(newWin.document.head);


        setTimeout(function () {
            newWin.print();
        }, 1000);

    }


});
