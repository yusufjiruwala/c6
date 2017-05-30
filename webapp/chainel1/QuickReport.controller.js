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
    preview: function () {
        var view = this.getView();
        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        var sett = sap.ui.getCore().getModel("settings").getData();
        var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        if (view.colData == undefined)
            return;
        var ps = "";
        for (var i = 0; i < view.colData.parameters.length; i++) {
            var vl = Util.nvl(view.byId("para_" + i).getValue(), "");
            if (view.colData.parameters[i].PARA_DATATYPE === "DATE")
                vl = "@" + df.format((view.byId("para_" + i).getDateValue()));
            if (view.colData.parameters[i].LISTNAME != undefined && view.colData.parameters[i].LISTNAME.toString().trim().length > 0)
                vl = view.byId("para_" + i).getSelectedItem().getKey();

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
        Util.doAjaxGet("exe?command=get-quickrep-data&" + (ps), "", false).done(function (data) {
            // var QueryView6 = sap.ui.require("sap/ui/chainel1/util/generic/QueryView6");
            // view.qv.destroy();
            // view.qv= new QueryView6(view.createId("tbl"));
            //pg.addContent(view.qv.mTable);
            // var QueryView = sap.ui.require("sap/ui/chainel1/util/generic/QueryView6");
            //
            // view.QueryPage.destroyContent();
            // view.QueryPage.removeAllContent();
            //
            // view.QueryPage.destroy();
            // view.QueryPage = new sap.m.Page({
            //     customHeader: Util.createBar("{detailP>/pageTitle}"),
            //     footer:view.createQRToolbar()
            // });
            //
            // (view.byId("tbl") != undefined ? view.byId("tbl").destroy() : null);
            // view.qv = new QueryView(view.createId("tbl"));
            // view.QueryPage.addContent(view.qv.mTable);

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

            // setTimeout(function () {
            //     view.qv.mTable.handleResize();
            //     console.log('resized data3');
            // }, 300);


            // oSplitApp.removeDetailPage(view.QueryPage);
            // oSplitApp.addDetailPage(pg);
            // oSplitApp.toDetail(pg);
            // view.QueryPage=pg;

        });

        // if (!oSplitApp.getDetailPages().indexOf(view.QueryPage) > -1) {
        //     oSplitApp.addDetailPage(view.QueryPage);
        // }
        // oSplitApp.toDetail(view.QueryPage);
        //

    }

})
;
