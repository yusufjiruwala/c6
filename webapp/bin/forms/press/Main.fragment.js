sap.ui.jsfragment("bin.forms.press.Main", {

    createContent: function (oController) {
        this.view = oController.getView();
        this.oController = oController;
        this.lastIndexSelected = 0;
        this.lastFirstRow = 0;
        var that = this;

        this.app = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});

        this.mainPage = new sap.m.Page("pgMain", {
            showHeader: false,
            content: []
        });
        this.pgJo = new sap.m.Page(this.view.createId("pgJo"), {
            showHeader: false,
            content: []
        });
        this.pgCnt = new sap.m.Page(this.view.createId("pgCnt"), {
            showHeader: false,
            content: []
        });
        this.pgReq = new sap.m.Page(this.view.createId("pgReq"), {
            showHeader: false,
            content: []
        });
        this.pgPost = new sap.m.Page(this.view.createId("pgPost"), {
            showHeader: false,
            content: []
        });

        this.createView();
        this.app.addDetailPage(this.mainPage);
        this.app.addDetailPage(this.pgJo);
        this.app.addDetailPage(this.pgCnt);
        this.app.addDetailPage(this.pgReq);
        this.app.addDetailPage(this.pgPost);
        return this.app;
    },
    createView: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        UtilGen.clearPage(this.mainPage);
        var vbox = new sap.m.VBox({height: "100%"});
        var spn = "XL2 L2 M2 S6";
        (this.view.byId("cmdJo") != undefined ? this.view.byId("cmdJo").destroy() : null);
        var pnl1 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text(that.view.createId("cmdJo"), {text: "New JO"}).addStyleClass("whiteText ")
                ],
                layoutData: new sap.ui.layout.GridData({
                    span: spn
                })
            }).addStyleClass("mytile");
        var pnl2 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({
                        alignText: "center", text: "Sales"
                    }).addStyleClass("whiteText")
                ],
                layoutData: new sap.ui.layout.GridData({
                    span: spn
                })

            }).addStyleClass("mytile");
        var pnl3 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({text: "Status"}).addStyleClass("whiteText")
                ],
                layoutData: new sap.ui.layout.GridData({
                    span: spn
                })

            }).addStyleClass("mytile");
        var pnl31 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({text: "Management"}).addStyleClass("whiteText")
                ]
                , layoutData: new sap.ui.layout.GridData({
                    span: spn
                })

            }).addStyleClass("mytile");
        var pnl4 = new sap.m.Panel(
            {
                expanded: true,
                // width: "200px",
                content: [
                    new sap.m.Text({text: "JO Monitoring"}).addStyleClass("whiteText")
                ],
                layoutData: new sap.ui.layout.GridData({
                    span: spn
                })

            }).addStyleClass("mytile");

        (this.view.byId("layout") != undefined ? this.view.byId("layout").destroy() : null);
        var layout = new sap.ui.layout.Grid(this.view.createId("layout"), {
            content: [
                pnl1,
                pnl2,
                pnl3,
                (Util.nvl(sett["LG_SHOW_MANAGEMENT"], "INVISIBLE") == "INVISIBLE") ? undefined : pnl31,
                pnl4
            ]
        });
        (this.view.byId("lblMsg") != undefined ? this.view.byId("lblMsg").destroy() : null);
        var ly2 = new sap.m.HBox({
            items: [
                new sap.m.Title(that.view.createId("lblMsg"),
                    {text: "No any JO selected !"}).addStyleClass("blinking")
            ]
        });

        pnl1.attachBrowserEvent("click", function (e) {
            that.openForm("bin.forms.press.JO", that.pgJo);
        });
        pnl2.attachBrowserEvent("click", function (e) {
            var qr = Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO"), "");
            if (Util.nvl(qr, "") == "") {
                sap.m.MessageToast.show("JO is not selected !");
                return;
            }
            var stat = Util.getSQLValue("select is_active from order1 where ord_code=601 and ord_no=" + Util.quoted(qr));
            if (stat != "Y") {
                sap.m.MessageToast.show("Status is Not-ready ! ");
                return;
            }

            that.openForm("bin.forms.press.Sales", that.pgCnt);
        });
        pnl3.attachBrowserEvent("click", function (e) {
            var idx = that.qv.getControl().getSelectedIndex();
            if (idx < 0) {
                sap.m.MessageToast.show("Must select JO !");
                return;
            }
            that.openForm("bin.forms.press.Status", that.pgReq);
        });
        pnl31.attachBrowserEvent("click", function (e) {
            //that.openForm("bin.forms.lg.MG", that.pgCnt);
            that.openForm("bin.Queries", that.pgCnt, {
                setProfile: "8800", backFunction: function () {

                }
            });
        });
        pnl4.attachBrowserEvent("click", function (e) {
            // that.openForm("bin.forms.", that.pgReq);
            that.joStatus();
        });


        this.qv = new QueryView();

        this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Interactive);
        this.qv.getControl().setAlternateRowColors(true);

        //this.qv.getControl().setVisibleRowCount(100);
        this.qv.getControl().setFixedBottomRowCount(0);
        this.qv.getControl().addStyleClass("noColumnBorder");
        this.qv.getControl().addStyleClass("sapUiSizeCondensed");

        this.searchField = new sap.m.SearchField({
            liveChange: function (event) {
                UtilGen.doFilterLiveTable(event, that.qv, ["ORD_REF", "ORD_REFNM", "ORD_NO", "FULL_ORD_NO"]);
            }
        });

        this.query_type = UtilGen.createControl(sap.m.ComboBox, this.view, "query_type", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectionChange: function (event) {
                that.load_data();
            }
        }, "string", undefined, undefined, "@-1/All,30/Last 1 Month,90/Last 3 Months,180/Last 6 months,0/Closed");

        this.qv.getControl().attachRowSelectionChange(null, function (evt) {
            var idx = that.qv.getControl().getSelectedIndex()
            if (idx <= -1) {
                that.view.byId("cmdJo").setText("New JO");
                that.view.byId("lblMsg").setText("No any JO selected !");
            }
            else {
                var context = evt.getParameters("rowContext").rowContext;
                var txt = that.qv.getControl().getModel().getProperty(context.sPath + "/ORD_NO");
                txt += " / " + that.qv.getControl().getModel().getProperty(context.sPath + "/ORD_REFNM");
                that.view.byId("cmdJo").setText("Open JO");
                that.view.byId("lblMsg").setText("JO # " + txt);
            }
        });

        //UtilGen.setControlValue(this.locations, sett["DEFAULT_LOCATION"]);
        UtilGen.setControlValue(this.query_type, -1);

        var bt = new sap.m.Button({
            icon: "sap-icon://print",
            press: function () {
                that.view.colData = {};
                that.view.reportsData = {
                    report_info: {report_name: "JO Lists"}
                };
                that.qv.printHtml(that.view, "para");
            }
        });

        this.toolbar = new sap.m.Toolbar({
            content: [this.locations, this.query_type, this.searchField, bt]
        }).addStyleClass("sapUiSizeCondensed");
        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.qv.getControl());
        // layout.setAlignItems("Center");
        // layout.setJustifyContent("Center");
        ly2.setAlignItems("Center");
        ly2.setJustifyContent("Center");

        vbox.addItem((layout));
        vbox.addItem((ly2));
        vbox.addItem(this.toolbar);
        vbox.addItem(sc);
        vbox.setHeight("100%");
        this.load_data();
        this.mainPage.addContent(vbox);

    },
    load_data: function (period) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        // var loc = UtilGen.getControlValue(that.locations);
        // var qt = UtilGen.getControlValue(that.query_type);
        var typ = Util.nvl(UtilGen.getControlValue(this.query_type), -1);

        var sql = "SELECT STATUS , ORD_NO,ORD_DATE,ORD_REF,ORD_REFNM ," +
            "  SLP,DLP " +
            " FROM V_C6P_JO WHERE ORD_CODE=601 " +
            " and ord_flag=2 " +
            "ORDER BY ORD_DATE DESC,ORD_NO desc ";

        sql = sql.replace(/:TYP/g, typ);

        if (typ == "0" || typ == 0) {
            sql = "SELECT DECODE(IS_ACTIVE,'Y','READY','N','NOT READY') STATUS , ORD_NO,ORD_DATE,ORD_REF,ORD_REFNM," +
                "  SLP,DLP " +
                " FROM V_C6P_JO WHERE ORD_CODE=601 and " +
                " ord_flag=1 " +
                " ORDER BY ORD_DATE DESC,ORD_NO desc";
        }

        var dat = Util.execSQL(sql);
        if (dat.ret == "SUCCESS") {
            that.qv.setJsonStr("{" + dat.data + "}");

            // var cc = that.qv.mLctb.getColByName("BALANCE");
            // cc.getMUIHelper().display_format = "MONEY_FORMAT";
            // var cc = that.qv.mLctb.getColByName("ATHLET_CODE");
            // cc.mTitle = "Code";
            // var cc = that.qv.mLctb.getColByName("ATHLET_NAME");
            // cc.mTitle = "Name";

            if (dat.data.length > 0) {
                for (var jj = 0; jj < that.qv.mLctb.cols.length; jj++)
                    that.qv.mLctb.cols[jj].getMUIHelper().data_type = "STRING";
                var c = that.qv.mLctb.getColPos("ORD_DATE");
                that.qv.mLctb.cols[c].getMUIHelper().display_format = "SHORT_DATE_FORMAT";
                that.qv.mLctb.cols[c].getMUIHelper().data_type = "DATE";

                var c = that.qv.mLctb.getColPos("ORD_NO");
                that.qv.mLctb.cols[c].getMUIHelper().data_type = "NUMBER";
                var c = that.qv.mLctb.getColPos("SLP");
                that.qv.mLctb.cols[c].mTitle = "Sold %";
                var c = that.qv.mLctb.getColPos("DLP");
                that.qv.mLctb.cols[c].mTitle = "Delivery %";
                that.qv.loadData();
                if (that.qv.mLctb.rows.length > 0) {
                    that.qv.getControl().setSelectedIndex(that.lastIndexSelected);
                    that.qv.getControl().setFirstVisibleRow(that.lastFirstRow);
                }
                sap.m.MessageToast.show("Found # " + that.qv.mLctb.rows.length + " Records");
            }

        }
    },

    openForm: function (frag, frm, ocAdd) {
        var that = this;


        this.lastFirstRow = that.qv.getControl().getFirstVisibleRow();
        this.lastIndexSelected = that.qv.getControl().getSelectedIndex();

        var indicOF = that.qv.getControl().getBinding("rows").aIndices;
        var indic = that.qv.getControl().getSelectedIndices();
        var arPo = [];

        for (var i = 0; i < indic.length; i++)
            arPo.push(Util.nvl(Util.getCellColValue(that.qv.getControl(), indicOF[indic[i]], "ORD_NO"), ""));
        var oC = {
            qryStr: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_NO"), ""),
            ordRef: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_REF"), ""),
            ordRefNm: Util.nvl(Util.getCurrentCellColValue(that.qv.getControl(), "ORD_REFNM"), ""),
            ordType: undefined,
            ordNo: undefined,
            ordNos: arPo,
            getView:
                function () {
                    return that.view;
                }
        };
        if (ocAdd != undefined)
            for (var xx in ocAdd)
                oC[xx] = ocAdd[xx];

        var sp = sap.ui.jsfragment(frag, oC);
        sp.backFunction = function () {
            that.doBack();
        };
        sp.app = this.app;
        UtilGen.clearPage(frm);
        frm.addContent(sp);
        this.app.to(frm, "slide");
    },
    doBack: function () {
        var that = this;
        that.app.to(that.mainPage, "show");
        that.createView();
        that.qv.getControl().setSelectedIndex(that.lastIndexSelected);
        that.qv.getControl().setFirstVisibleRow(that.lastFirstRow);
    },
    joStatus: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var indicOF = that.qv.getControl().getBinding("rows").aIndices;
        var indic = that.qv.getControl().getSelectedIndices();

        if (indic.length == 0) {
            sap.m.MessageToast.show("Must select a JO # ");
            return;
        }
        var on = Util.nvl(Util.getCellColValue(that.qv.getControl(), indicOF[indic[0]], "ORD_NO"), "");
        var fe = [];
        (this.view.byId("monOrdNo") != undefined ? this.view.byId("monOrdNo").destroy() : null);
        var txtOn = UtilGen.addControl(fe, "Ord No", sap.m.Input, "monOrdNo",
            {
                editable: false,
                value: on
            }, "string", undefined, this.view);
        (this.view.byId("monDescr") != undefined ? this.view.byId("monDescr").destroy() : null);
        var txtDescr = UtilGen.addControl(fe, "JO", sap.m.ComboBox, "monDescr",
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{JOB_DESCR}", key: "{JOB_DESCR}"}),
                    templateShareable: true
                },
                change: function (ev) {
                    var de = UtilGen.getControlValue(txtDescr);
                    if (de == "")
                        return;
                    var dt = Util.execSQL("select *from jo_mon where ord_no=" + Util.quoted(on) + " and job_descr=" + Util.quoted(de));
                    if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                        var dtx = JSON.parse("{" + dt.data + "}").data;
                        UtilGen.setControlValue(txtSt, dtx[0].OPEN_TIME, dtx[0].OPEN_TIME, true);
                        UtilGen.setControlValue(txtEn, dtx[0].CLOSE_TIME, dtx[0].CLOSE_TIME, true);
                        UtilGen.setControlValue(txtRe, dtx[0].REMARKS, dtx[0].REMARKS, true);
                    }
                }
            }, "string", undefined, this.view, undefined, "select  JOB_DESCR from JO_MON where ORD_NO=" + Util.quoted(on) + " Order by ord_pos");
        (this.view.byId("apStart") != undefined ? this.view.byId("apStart").destroy() : null);
        var txtSt = UtilGen.addControl(fe, "Start Time", sap.m.DateTimePicker, "apStart",
            {
                editable: true,
                change: function () {
                    UtilGen.setControlValue(txtms, "", "", true);
                    var st = UtilGen.getControlValue(txtSt);
                    var en = UtilGen.getControlValue(txtEn);
                    if (st == null || en == null)
                        return;
                    var t = Util.timeDiffCalc(en, st);
                    UtilGen.setControlValue(txtms, t , t , true);
                }
            }, "date", undefined, this.view);
        (this.view.byId("apEnd") != undefined ? this.view.byId("apEnd").destroy() : null);
        var txtEn = UtilGen.addControl(fe, "End Time", sap.m.DateTimePicker, "apEnd",
            {
                editable: true,
                change: function () {
                    UtilGen.setControlValue(txtms, "", "", true);
                    var st = UtilGen.getControlValue(txtSt);
                    var en = UtilGen.getControlValue(txtEn);
                    if (st == null || en == null)
                        return;
                    var t = Util.timeDiffCalc(en, st);
                    UtilGen.setControlValue(txtms, t , t , true);
                }
            }, "date", undefined, this.view);

        txtSt.setValueFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        txtSt.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");

        txtEn.setValueFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
        txtEn.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");

        var txtRe = UtilGen.addControl(fe, "Remarks", sap.m.Input, "moRemarks",
            {
                editable: true
            }, "string", undefined, this.view);
        var txtms = UtilGen.addControl(fe, "", sap.m.Text, "moMsg",
            {}, "string", undefined, this.view);

        var frm = UtilGen.formCreate("", true, fe);

        frm.setToolbar(undefined);

        var dlg = new sap.m.Dialog({
            content: frm,
            buttons: [
                new sap.m.Button({
                    text: "Update",
                    press: function () {
                        var sq = "";
                        var de = UtilGen.getControlValue(txtDescr);
                        var on = UtilGen.getControlValue(txtOn);
                        var st = UtilGen.getControlValue(txtSt);
                        var en = UtilGen.getControlValue(txtEn);
                        var re = UtilGen.getControlValue(txtRe);
                        if (en < st) {
                            sap.m.MessageToast.show("End date must be greater than start date !");
                            return;
                        }
                        if (st == null) {
                            sap.m.MessageToast.show("Must have value  !");
                            return;
                        }

                        var sq = "begin" +
                            " delete from jo_mon where ord_no=:ORD_NO and  job_descr=:DESCR ; " +
                            " INSERT INTO JO_MON (ORD_NO, ORD_POS, JOB_DESCR, OPEN_TIME, CLOSE_TIME, REMARKS) VALUES " +
                            " (:ORD_NO, :ORD_POS, :DESCR, :OPEN_TIME, :CLOSE_TIME, :REMARKS); " +
                            " end; ";
                        var pos = Util.getSQLValue("select ord_pos from jo_mon " +
                            " where ord_no=" + Util.quoted(on) + " and job_descr=" + Util.quoted(de));
                        sq = sq.replace(/:ORD_NO/g, Util.quoted(on));
                        sq = sq.replace(/:ORD_POS/g, pos);
                        sq = sq.replace(/:DESCR/g, Util.quoted(de));
                        sq = sq.replace(/:OPEN_TIME/g, Util.toOraDateTimeString(st));
                        sq = sq.replace(/:CLOSE_TIME/g, Util.toOraDateTimeString(en));
                        sq = sq.replace(/:REMARKS/g, Util.quoted(re));

                        var oSql = {
                            "sql": sq,
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
                }), new sap.m.Button({
                    text: "Close",
                    press: function () {
                        dlg.close();
                    }
                })
            ]
        });
        dlg.open();
    }
});