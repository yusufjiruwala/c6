sap.ui.jsfragment("bin.forms.lg.post", {

    createContent: function (oController) {
        var that = this;
        this.view = oController.getView();
        this.app = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});

        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        (this.view.byId("pgReq2") != undefined ? this.view.byId("pgReq2").destroy() : null);
        this.pgReq = new sap.m.Page(this.view.createId("pgReq2"), {
            showHeader: false,
            content: []
        });
        this.createView();
        this.app.addDetailPage(this.mainPage);
        this.app.addDetailPage(this.pgReq);
        this.app.to(this.mainPage, "show");

        return this.app;
    },

    createView: function () {
        var that = this;
        var view = this.view;
        UtilGen.clearPage(this.mainPage);
        var fe = [];
        this.fromDate = UtilGen.addControl(fe, "From Date", sap.m.DatePicker, "poFromDate",
            {
                editable: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "date", undefined, view);

        this.todate = UtilGen.addControl(fe, "@To Date", sap.m.DatePicker, "poTODate",
            {
                editable: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "date", undefined, view);
        this.postdate = UtilGen.addControl(fe, "POST Date", sap.m.DatePicker, "poPostDate",
            {
                editable: true,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "date", undefined, view);

        this.searchField = UtilGen.addControl(fe, "Search", sap.m.SearchField, "poSearch",
            {
                editable: true,
                layoutData: new sap.ui.layout.GridData({span: "XL12 L12 M12 S12"}),
                liveChange: function (event) {
                    UtilGen.doFilterLiveTable(event, that.qv, ["ORD_REF", "ORD_REFNM", "ORD_NO", "JO_NO"]);
                }
            }, "string", undefined, view);


        var frm = UtilGen.formCreate("", true, fe);
        frm.addStyleClass("noSimpleFormTitle");
        frm.getToolbar().addContent(new sap.m.Button({
            text: "Execute Query", icon: "sap-icon://detail-view", press: function () {
                that.executeQuery();
            }
        }));
        frm.getToolbar().addContent(new sap.m.Button({
            text: "Post", icon: "sap-icon://accept", press: function () {
                that.post();
            }
        }));
        frm.getToolbar().addContent(new sap.m.Button({
            text: "Review", icon: "sap-icon://bbyd-active-sales", press: function () {
                that.review();
            }
        }));
        frm.getToolbar().addContent(new sap.m.Button({
            text: "PDF", icon: "sap-icon://pdf-attachment", press: function () {
                that.printAllSel();
            }
        }));
        frm.getToolbar().addContent(new sap.m.Button({
            text: "Print", icon: "sap-icon://print", press: function () {
                that.view.colData = {};
                that.view.reportsData = {
                    report_info: {report_name: "Un-posted Transactions"}
                };
                that.qv.printHtml(that.view, "para");
            }
        }));
        // UtilGen.setControlValue(this.fromDate, new Date());
        // UtilGen.setControlValue(this.todate, new Date());
        this.mainPage.addContent(frm);
        this.qv = new QueryView();
        this.mainPage.addContent(this.qv.getControl());
        UtilGen.setControlValue(this.postdate, new Date());
        this.qv.getControl().setFixedBottomRowCount(0);
        this.executeQuery();
    },
    executeQuery: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var fromdt = UtilGen.getControlValue(this.fromDate);
        var todt = UtilGen.getControlValue(this.todate);

        var sqwhere = "";
        if (fromdt != undefined && todt != undefined)
            sqwhere = " and ord_date>=" + Util.toOraDateString(fromdt) + " and ord_date<=" + Util.toOraDateString(todt);

        var sq = "select (SELECT ONAME FROM ORDER1 WHERE ORD_CODE=106 AND ORD_NO=O1.ORD_REFERENCE) JO_NO," +
            "DECODE(ORD_CODE,111,'SO',103,'PO',151,'DR NOTE',152,'CR NOTE',141,'PROFORMA',131,'P-Return') TYPE_OF_ORDER " +
            " , O1.ORD_NO, O1.ORD_DATE,O1.ORD_REF,O1.ORD_REFNM,ORD_AMT,ord_reference , " +
            " ORD_CODE,ORD_FLAG FLGX" +
            " FROM ORDER1 o1 WHERE ORD_CODE IN (141,151,111,103,152,131) and  ord_flag= 1 " + sqwhere +
            " ORDER BY 1,4,3";
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                //UtilGen.applyCols("C6LGREQ.DN1", that.qv);
                that.qv.mLctb.parse("{" + data.data + "}", true);

                that.qv.mLctb.cols[0].mGrouped = true;

//                that.qv.mLctb.getColByName("ORD_NO").mHideCol = true;
                that.qv.mLctb.getColByName("ORD_REFERENCE").mHideCol = true;
                that.qv.mLctb.getColByName("ORD_CODE").mHideCol = true;
                that.qv.mLctb.getColByName("FLGX").mHideCol = true;

                that.qv.mLctb.getColByName("ORD_AMT").getMUIHelper().display_format = "MONEY_FORMAT";
                that.qv.loadData();
            }
        });


    },
    review: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var slices = this.qv.getControl().getSelectedIndices(); //that.qv.getControl().getBinding("rows").aIndices;
        var slicesof = that.qv.getControl().getBinding("rows").aIndices;
        var ld = that.qv.mLctb;
        var plsql = "";
        var pos = 0;
        if (slices.length > 1 || slices.length == 0) {
            sap.m.MessageToast.show("Must select SINGLE record to review !");
            return;
        }
        var ro = Util.getCellColValue(this.qv.getControl(), slicesof[slices[0]], "_rowid");//slices[i];
        if (ro == undefined || ro == null) {
            sap.m.MessageToast.show("Must select SINGLE Transaction record !");
            return;
        }
        var frm = that.pgReq;
        var frag = "bin.forms.lg.Req";
        var arPo = [];
        for (var i = 0; i < slices.length; i++)
            arPo.push(Util.nvl(Util.getCellColValue(that.qv.getControl(), slicesof[slices[i]], "ORD_NO"), ""));
        var oC = {
            qryStr: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_REFERENCE"), ""),
            ordRef: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_REF"), ""),
            ordRefNm: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_REFNM"), ""),
            ordType: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_CODE"), ""),
            ordNo: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO"), ""),
            ordNos: arPo,
            getView:
                function () {
                    return that.view;
                }
        };
        var sp = sap.ui.jsfragment(frag, oC);
        sp.backFunction = function () {
            that.app.to(that.mainPage, "show");
            that.createView();
            that.qv.getControl().setSelectedIndex(that.lastIndexSelected);
            that.qv.getControl().setFirstVisibleRow(that.lastFirstRow);
        };
        sp.app = this.app;
        UtilGen.clearPage(frm);
        frm.addContent(sp);
        this.app.to(frm, "slide");
    },
    post: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var slices = this.qv.getControl().getSelectedIndices(); //that.qv.getControl().getBinding("rows").aIndices;
        var slicesof = that.qv.getControl().getBinding("rows").aIndices;
        var ld = that.qv.mLctb;
        var plsql = "";
        var pos = 0;
        for (var i = 0; i < slices.length; i++) {
            if (Util.getCellColValue(this.qv.getControl(), slicesof[slices[i]], "_rowid") == null ||
                Util.getCellColValue(this.qv.getControl(), slicesof[slices[i]], "_rowid") == undefined)
                continue;
            var ro = Util.getCellColValue(this.qv.getControl(), slicesof[slices[i]], "_rowid");//slices[i];
            var flg = ld.getFieldValue(ro, "FLGX"); // to check either posted or not.
            var on = ld.getFieldValue(ro, "ORD_NO"); // order no
            var oc = ld.getFieldValue(ro, "ORD_CODE"); // ord code to check type
            var usr = sett["LOGON_USER"];
            var sql = "";
            if (flg == 1)
                switch (oc) {
                    case 103:
                        sql = "update order1 set posted_date=to_date(to_char(sysd,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=103 and ord_no=" + on + ";" +
                            " x_pur_and_srv(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=103 and ord_no=" + on + ";";
                        break;
                    case 111:
                        sql = "update order1 set posted_date=to_date(to_char(sysd,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=111 and ord_no=" + on + ";" +
                            "x_sal_and_iss(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=111 and ord_no=" + on + ";";
                        break;
                    case 131:
                        sql = "update order1 set posted_date=to_date(to_char(sysd,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=131 and ord_no=" + on + ";" +
                            "x_pr_and_iss(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=131 and ord_no=" + on + ";";
                        break;
                    case 151:
                        sql = "update order1 set posted_date=to_date(to_char(sysd,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=151 and ord_no=" + on + ";" +
                            "x_dn_and_iss(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=151 and ord_no=" + on + ";";
                        break;
                    case 152:
                        sql = "update order1 set posted_date=to_date(to_char(sysd,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=152 and ord_no=" + on + ";" +
                            "x_cn_and_srv(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=152 and ord_no=" + on + ";";
                        break;
                    case 141:
                        sql = "update order1 set posted_date=to_date(to_char(sysd,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=141 and ord_no=" + on + ";" +
                            "x_lg_sp(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=141 and ord_no=" + on + ";";
                        break;

                    default:
                        break;
                }
            plsql += sql;
            pos++;
        }
        if (pos <= 0) {
            sap.m.MessageToast.show("Nothing to POST !");
            return;
        }
        else
            plsql = "declare sysd date:=" + Util.toOraDateString(UtilGen.getControlValue(that.postdate))
                + "; begin " + plsql + " end; ";

        var dat = Util.execSQL(plsql);
        if (dat.ret == "SUCCESS") {
            sap.m.MessageToast.show("( " + pos + " ) JO Posted successfully ");
            that.executeQuery();
        } else
            sap.m.MessageToast.show(dat.ret);
    },
    printAllSel: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var slicesof = that.qv.getControl().getBinding("rows").aIndices;
        var slices = this.qv.getControl().getSelectedIndices();
        if (slices.length <= 0) {
            sap.m.MessageToast.show("Must select to PRINT..");
            return false;
        }
        //var fn = Util.nvl(preFileName, "");
        var plsql = "";
        var ocs = {};
        for (var i in slices) {
            var ro = Util.getCellColValue(this.qv.getControl(), slicesof[slices[i]], "_rowid");//slices[i];
            if (ro == undefined || ro == null) continue;

            var oc = this.qv.mLctb.getFieldValue(ro, "ORD_CODE");
            var on = this.qv.mLctb.getFieldValue(ro, "ORD_NO");
            var sq = "insert into temporary(usernm,idno ,field1) values (:usernm,:idno,:field1);";
            sq = sq.replace(":usernm", Util.quoted(sett["SESSION_ID"]));
            sq = sq.replace(":idno", oc);
            sq = sq.replace(":field1", on);
            ocs[oc] = oc;
            plsql += sq;
        }
        plsql = " begin delete from temporary where usernm=" + Util.quoted(sett["SESSION_ID"]) + ";" + plsql + " end;";
        var dt = Util.execSQL(plsql);
        if (dt.ret = "SUCCESS")
            for (var i in ocs)
                Util.doXhr("report?reportfile=rptVou" + ocs[i], true, function (e) {
                    if (this.status == 200) {
                        var blob = new Blob([this.response], {type: "application/pdf"});
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.target = "_blank";
                        link.style.display = "none";
                        document.body.appendChild(link);
                        link.download = "rptVou" + new Date() + ".pdf";
                        link.click();
                        document.body.removeChild(link);
                    }
                })

    }
});



