sap.ui.jsfragment("bin.forms.lg.post", {

    createContent: function (oController) {
        var that = this;
        this.view = oController.getView();
        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        this.createView();
        return this.mainPage;
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
        // UtilGen.setControlValue(this.fromDate, new Date());
        // UtilGen.setControlValue(this.todate, new Date());
        this.mainPage.addContent(frm);
        this.qv = new QueryView();
        this.mainPage.addContent(this.qv.getControl());
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
            "DECODE(ORD_CODE,111,'SO',103,'PO',151,'DR NOTE',152,'CR NOTE',141,'PROFORMA') TYPE_OF_ORDER " +
            " , O1.ORD_NO, O1.ORD_DATE,O1.ORD_REF,O1.ORD_REFNM,ORD_AMT," +
            " ORD_CODE,ORD_FLAG FLGX" +
            " FROM ORDER1 o1 WHERE ORD_CODE IN (141,151,111,103,152) and  ord_flag= 1 " + sqwhere +
            " ORDER BY 1,4,3";
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                //UtilGen.applyCols("C6LGREQ.DN1", that.qv);
                that.qv.mLctb.parse("{" + data.data + "}", true);

                that.qv.mLctb.cols[0].mGrouped = true;
//                that.qv.mLctb.getColByName("ORD_NO").mHideCol = true;
                that.qv.mLctb.getColByName("ORD_CODE").mHideCol = true;
                that.qv.mLctb.getColByName("FLGX").mHideCol = true;

                that.qv.mLctb.getColByName("ORD_AMT").getMUIHelper().display_format = "MONEY_FORMAT";
                that.qv.loadData();
            }
        });


    },
    post: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var slices = this.qv.getControl().getSelectedIndices();
        var ld = that.qv.mLctb;
        var plsql = "";
        var pos = 0;
        for (var i = 0; i < slices.length; i++) {
            if (Util.getCellColValue(this.qv.getControl(), slices[i], "_rowid") == null ||
                Util.getCellColValue(this.qv.getControl(), slices[i], "_rowid") == undefined)
                continue;
            var ro = Util.getCellColValue(this.qv.getControl(), slices[i], "_rowid");//slices[i];
            var flg = ld.getFieldValue(ro, "FLGX"); // to check either posted or not.
            var on = ld.getFieldValue(ro, "ORD_NO"); // order no
            var oc = ld.getFieldValue(ro, "ORD_CODE"); // ord code to check type
            var usr = sett["LOGON_USER"];
            var sql = "";
            if (flg == 1)
                switch (oc) {
                    case 103:
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=103 and ord_no=" + on + ";" +
                            " x_pur_and_srv(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=103 and ord_no=" + on + ";";
                        break;
                    case 111:
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=111 and ord_no=" + on + ";" +
                            "x_sal_and_iss(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=111 and ord_no=" + on + ";";
                        break;
                    case 151:
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=151 and ord_no=" + on + ";" +
                            "x_dn_and_iss(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=151 and ord_no=" + on + ";";
                        break;
                    case 152:
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
                            " where ord_code=152 and ord_no=" + on + ";" +
                            "x_cn_and_srv(" + on + "); update order1 set approved_by='" + usr + "' where ord_code=152 and ord_no=" + on + ";";
                        break;
                    case 141:
                        sql = "update order1 set posted_date=to_date(to_char(sysdate,'dd/mm/rrrr'),'dd/mm/rrrr') " +
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
            plsql = "begin " + plsql + " end; ";

        var dat = Util.execSQL(plsql);
        if (dat.ret == "SUCCESS") {
            sap.m.MessageToast.show("( " + pos + " ) JO Posted successfully ");
            that.executeQuery();
        } else
            sap.m.MessageToast.show(dat.ret);
    }
});



