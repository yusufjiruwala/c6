sap.ui.controller("chainel1.QuickReport", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf chainel1.QuickReport **/
    onInit: function () {

    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf chainel1.QuickReport
     **/
    onBeforeRendering: function () {
        var dpMd = sap.ui.getCore().getModel("detailP");
        this.getView().setModel(dpMd, "detailP");

    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf chainel1.QuickReport **/
    onAfterRendering: function () {
        // var view = this.getView();
        //
        // $("tbody").scroll(function () {
        //     console.log("scrolling");
        //     view.qv.colorRows();
        // });

    },

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf chainel1.QuickReport
     **/
    onExit: function () {

    },
    preview: function (iadd) {
        var ia = (iadd == undefined ? "" : iadd);
        var view = this.getView();
        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        if (view.colData == undefined)
            return;
        var ps = "";
        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + df.format((view.byId("para_" + ia + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + ia + i).getSelectedItem().getKey();

            ps += (ps.length > 0 ? "&" : "") + "_para_" + view.colData.parameters[i].PARAM_NAME + "=" + vl;
        }

        var grp1 = Util.nvl(view.byId("txtGroupHeader").getValue(), "");
        var grp2 = Util.nvl(view.byId("txtGroupDetail").getValue(), "");


        ps += "&report-id=" + view.byId("txtSubGroup").getSelectedItem().getKey()
            + "&group1=" + grp1 + "&group2=" + grp2;
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
            view.qv.setJsonStr(data);

            if (grp1.length > 0 && grp2.length > 0 && view.qv.mLctb.cols.length > 1) {
                view.qv.mLctb.cols[0].mGrouped = true;
                view.qv.mLctb.cols[1].mGrouped = true;
            }

            view.qv.loadData();


            if (!oSplitApp.getDetailPages().indexOf(view.QueryPage) > -1) {
                oSplitApp.addDetailPage(view.QueryPage);
            }

            oSplitApp.toDetail(view.QueryPage);
            that.showPara();
        });
    },
    showPara: function () {
        var that = this;
        var ia = "result";
        var view = this.getView();
        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        view.qryToolBar.removeAllContent();
        view.qryToolBar.destroyContent();

        Util.createParas(view, view.qryToolBar, "paraResultInput", ia);

        for (var i = 0; i < view.colData.parameters.length; i++) {
            var src = view.byId("para_" + ia + i);
            var vl = Util.nvl(view.byId("para_" + i).getValue(), "");
            src.setValue(vl);
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE") {
                src.setDateValue(view.byId("para_" + i).getDateValue());
            }
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                src.setSelectedKey(view.byId("para_" + i).getSelectedItem().getKey());
        }

        (view.byId("refreshResult") != undefined ? view.byId("refreshResult").destroy() : null);

        var b = new sap.m.Button(view.createId("refreshResult"), {
            text: "Refresh",
            press: function () {
                that.refresh();

            }
        });

        var menu = new sap.ui.core.HTML();
        menu.setContent("<div class='menuicon'></div>");

        view.qryToolBar.addContent(b);
        view.qryToolBar.addContent(menu);

        setTimeout(function () {
            // $("#"+menu.getId()).click(function () {
            //     alert("clicked");
            // });
            menu.$().click(function () {
                that.showMenu(menu);
            })
        }, 1000);


    },
    refresh: function () {
        var that = this;
        var ia = "result";
        var view = this.getView();
        for (var i = 0; i < view.colData.parameters.length; i++) {
            var src = view.byId("para_" + i);
            var vl = Util.nvl(view.byId("para_" + ia + i).getValue(), "");
            src.setValue(vl);
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE") {
                src.setDateValue(view.byId("para_" + ia + i).getDateValue());
            }
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                src.setSelectedKey(view.byId("para_" + ia + i).getSelectedItem().getKey());
        }

        that.preview(ia);

    },
    showMenu: function (menu) {
        var view = this.getView();
        var that = this;
        var oMenu = new sap.m.Menu({
            title: "random",
            itemSelected: function (oEvent) {
                var oItem = oEvent.getParameter("item");
                if (oItem.getCustomData()[0].getKey() == "graph_new") {
                    that.show_add_new_graph();
                }
                if (oItem.getCustomData()[0].getKey() == "graph") {
                    var oSplitApp = sap.ui.getCore().byId("oSplitApp");
                    if (!oSplitApp.getDetailPages().indexOf(view.GraphPage) > -1) {
                        oSplitApp.addDetailPage(view.GraphPage);
                    }

                    oSplitApp.toDetail(view.GraphPage);
                    that.show_graph(oItem.getCustomData()[1].getValue());

                }

            }
        });
        Util.addMenuSubReps(view, oMenu, true);
        oMenu.openBy(menu);

    }
    ,
    show_add_new_graph: function () {
        var view = this.getView();
        var that = this;
        var dms = [], ms = [], others = [];
        var index = 0;
        var cnt = 0;
        //dimension in array of checkbox
        for (var i = 0; i < view.qv.mLctb.cols.length; i++) {
            if (!view.qv.mLctb.cols[i].mGrouped && !view.qv.mLctb.cols[i].mSummary.length > 0) {
                (view.byId("chk" + cnt) != undefined ? view.byId("chk" + cnt).destroy() : null);
                dms[cnt] = new sap.m.CheckBox(view.createId("chk" + cnt), {
                    text: view.qv.mLctb.cols[i].mTitle,
                    customData: [{key: view.qv.mLctb.cols[i].mColName}]
                });
                cnt++;
            }
        }
        //measures in array
        cnt = 0;
        for (var i = 0; i < view.qv.mLctb.cols.length; i++) {
            if (view.qv.mLctb.cols[i].data_type != "string") {
                (view.byId("dlg_graph_b" + cnt) != undefined ? view.byId("dlg_graph_b" + cnt).destroy() : null);
                ms[cnt] = new sap.m.RadioButton(view.createId("dlg_graph_b" + cnt),
                    {
                        text: view.qv.mLctb.cols[i].mTitle,
                        customData: [{key: view.qv.mLctb.cols[i].mColName}]
                    }
                );
                cnt++;
            }
        }
        (view.byId("rg") != undefined ? view.byId("rg").destroy() : null);
        var rg = new sap.m.RadioButtonGroup(view.createId("rg"), {
            columns: 4,
            valueState: sap.ui.core.ValueState.None,
            buttons: ms,
            select: function (oEvent) {
                index = oEvent.getParameters().selectedIndex;
            }
        });

        var flexDm = new sap.m.FlexBox({
            width: "100%",
            height: "100%",
            items: [dms]
        });
        var flexOther = new sap.m.FlexBox({
            width: "100%",
            height: "100%",
            direction: sap.m.FlexDirection.Row,
            justifyContent: sap.m.FlexJustifyContent.Center,
            items: [
                new sap.m.Label({text: "Grpah Title:"}),
                new sap.m.Input(view.createId("title"), {
                    placeholder: "Graph title"
                }),
                new sap.m.Label({text: "Graph type:"}),
                new sap.m.Input(view.createId("gt"), {
                    placeholder: "Graph type"
                })

            ]
        });

        var flexMain = new sap.m.FlexBox({
            width: "100%",
            height: "100%",
            direction: sap.m.FlexDirection.Column,
            justifyContent: sap.m.FlexJustifyContent.Start,
            alignItems: sap.m.FlexAlignItems.Start,
            items: [
                new sap.m.Label({text: "Graph Name:"}),
                new sap.m.Input(view.createId("gn"), {
                    placeholder: "Graph Name:"
                }),
                new sap.m.Label({text: "Dimensions:"}),
                flexDm,
                new sap.m.Label({text: "Measures:"}),
                rg,
                flexOther
            ]
        });


        var dlg = new sap.m.Dialog({
            title: "New Graph configuration",
            content: [flexMain],
            buttons: [new sap.m.Button({
                text: "Save", press: function () {
                    var dstr = "";
                    var rp = view.byId("txtSubGroup").getSelectedItem().getKey();
                    for (var i = 0; i < dms.length; i++) {
                        if (dms[i].getSelected())
                            dstr += (dstr.length <= 0 ? "" : ",") + dms[i].getCustomData()[0].getKey();
                    }
                    var mstr = "";
                    for (var i = 0; i < ms.length; i++) {
                        if (ms[i].getSelected())
                            mstr += (mstr.length <= 0 ? "" : ",") + ms[i].getCustomData()[0].getKey();
                    }
                    var sql = "insert into c6_subreps(REP_ID, REP_TYPE, DIMENSIONS, MEASURES, SQL, REP_TITLE ,REP_POS , GRAPH_TITLE , GRAPH_TYPE , KEYFLD) values ";
                    sql += "( ':REP_ID', ':REP_TYPE', ':DIMENSIONS', ':MEASURES', '', ':REP_TITLE' , :REP_POS , ':GRAPH_TITLE', :GRAPH_TYPE  , :KEYFLD ) ";
                    sql = sql.replace(":REP_ID", rp);
                    sql = sql.replace(":REP_TYPE", "DATASET");
                    sql = sql.replace(":DIMENSIONS", dstr);
                    sql = sql.replace(":MEASURES", mstr);
                    sql = sql.replace(":REP_TITLE", view.byId("gn").getValue());
                    sql = sql.replace(":GRAPH_TITLE", view.byId("title").getValue());
                    sql = sql.replace(":GRAPH_TYPE", view.byId("gt").getValue());
                    sql = sql.replace(":REP_POS", "(SELECT NVL(MAX(REP_POS),0)+1 FROM C6_SUBREPS WHERE REP_ID='" + rp + "')");
                    sql = sql.replace(":KEYFLD", "(SELECT NVL(MAX(KEYFLD),0)+1 FROM C6_SUBREPS )");
                    var oSql = {
                        "sql": sql,
                        "ret": "NONE",
                        "data": null
                    };
                    Util.doAjaxJson("sqlexe", oSql, false).done(function (data) {
                        console.log(data);
                        if (data == undefined) {
                            sap.m.MessageToast.show("Error: unexpected, check server admin");
                            return;
                        }
                        if (data.ret != "SUCCESS") {
                            sap.m.MessageToast.show("Error :" + data.ret);
                            return;
                        }
                        sap.m.MessageToast.show("Saved Successfully !");
                        dlg.close();
                    });


                }
            })]
        });
        dlg.open();
        dlg.attachAfterClose(function () {

            (view.byId("rg") != undefined ? view.byId("rg").destroy() : null);
            (view.byId("gn") != undefined ? view.byId("gn").destroy() : null);
            (view.byId("title") != undefined ? view.byId("title").destroy() : null);
            (view.byId("gt") != undefined ? view.byId("gt").destroy() : null);

            for (var i = 0; i < view.qv.mLctb.cols.length; i++) {
                (view.byId("dlg_graph_b" + i) != undefined ? view.byId("dlg_graph_b" + i).destroy() : null);
                (view.byId("chk" + i) != undefined ? view.byId("chk" + i).destroy() : null);
            }

        })
    }
    ,
    show_graph: function (rep) {
        if (rep.REP_TYPE == "SQL") {
            this.show_graph_sql(rep);
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
            gData = JSON.parse(data).data;
            if (rep.DIMENSIONS != undefined && rep.DIMENSIONS.split(",")[0] == "DAT") {
                for (var g in gData)
                    gData[g]["DAT"] = new Date(gData[g]["DAT"]);

            }
        });
        this.executeGraph(rep, selectedEntries, gData);
    },

    executeGraph(rep, selectedEntries, gData) {


        var view = this.getView();
        var that = this;
        var mTable = view.qv.mTable;


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
                var st = view.byId("para_" + i).getValue();
                grpStr = grpStr.replace(":#" + view.colData.parameters[i].PARAM_NAME, st);
            }
            var st = (view.byId("txtSubGroup").getValue() + "");
            grpStr = grpStr.replace(":#SUBREP", st);
            st = view.byId("txtGroupHeader").getValue() + "";
            grpStr = grpStr.replace(":#GROUP1", st);
            st = view.byId("txtGroupDetail").getValue() + "";
            grpStr = grpStr.replace(":#GROUP2", st);

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
    }
    ,
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
    }


})
;
