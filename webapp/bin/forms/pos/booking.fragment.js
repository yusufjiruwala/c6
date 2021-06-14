sap.ui.jsfragment("bin.forms.pos.booking", {

        createContent: function (oController) {
            var that = this;
            jQuery.sap.require("sap.m.MessageBox");
            this.oController = oController;
            this.view = oController.getView();
            this.qryStr = "";
            that.qryStrB = "";
            this.qryStrBNo = "";
            this.fragBookItems = undefined;
            this.joApp = new sap.m.App({mode: sap.m.SplitAppMode.HideMode});
            // this.joApp = new sap.m.SplitApp({});
            this.vars = {
                keyfld: -1,
                flag: 1,  // 1=closed,2 opened,
                ord_code: 106,
                onm: "",
                stra: 1
            };
            this.existed = false;
            var url = new URL(window.location.href);
            var callId = url.searchParams.get("caller");
            if (callId != undefined)
                that.qryStr = callId;
            // this.pgDetail = new sap.m.Page({showHeader: false});
            //
            // this.bk = new sap.m.Button({
            //     icon: "sap-icon://nav-back",
            //     press: function () {
            //         that.joApp.backFunction();
            //     }
            // });

            this.mainPage = new sap.m.Page({
                showHeader: false,
                height: "80%",
                enableScrolling: false,
                showFooter: false,
                content: []
            });

            this.itemsPage = new sap.m.Page({
                showHeader: false,
                showFooter: false,
                content: []
            });
            this.createView();
            this.loadData();
            this.joApp.addPage(this.mainPage);

            // this.joApp.addMasterPage(this.itemsPage);
            // this.joApp.addDetailPage(this.pgDetail);
            this.joApp.to(this.mainPage, "show");
            return this.joApp;
        },
        createView: function () {
            var that = this;
            var view = this.view;
            var sett = sap.ui.getCore().getModel("settings").getData();

            UtilGen.clearPage(this.mainPage);
            UtilGen.clearPage(this.itemsPage);
            this.o1 = {};
            this.frm = this.createViewHeader();

            this.qv = new QueryView("tblPODetails");
            that.qv.getControl().view = this;
            this.qv.getControl().addStyleClass("sapUiSizeCondensed");
            this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
            this.qv.getControl().setFixedBottomRowCount(0);
            this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
            this.qv.getControl().setVisibleRowCount(7);


            this.qv.onAddRow = function (idx, ld) {

            };
            this.qv.afterDelRow = function (idx, ld) {
                that.do_summary(true, true);
            };

            // this.frm.getToolbar().addContent(this.bk);

            Util.destroyID("poCmdSave", this.view);
            this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave"), {
                text: "{i18n>save}", icon: "sap-icon://save", press: function () {
                    that.save_data();
                }
            }));

            Util.destroyID("poCmdDel", this.view);
            this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdDel"), {
                text: "{i18n>delete}", icon: "sap-icon://delete", press: function () {
                    that.delete_data();
                }
            }));
            Util.destroyID("poCmdList", this.view);
            this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdList"), {
                text: "{i18n>list}",
                icon: "sap-icon://list",
                press: function () {
                    that.show_list();
                }
            }));

            Util.destroyID("poCmdRePrint", this.view);
            this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdRePrint"), {
                text: "{i18n>reprint}",
                icon: "sap-icon://list",
                press: function () {
                    that.reprint();
                }
            }));

            Util.destroyID("poCmdNew", this.view);
            this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdNew"), {
                text: "{i18n>new_ord}",
                icon: "sap-icon://add-document",
                press: function () {
                    that.qryStr = "";
                    that.qryStrB = "";
                    that.loadData();
                }
            }));
            this.frm.getToolbar().addContent(new sap.m.ToolbarSpacer());

            Util.destroyID("poCmdItems", this.view);
            this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdItems"), {
                text: "{i18n>generate_inv}",
                icon: "sap-icon://list",
                enabled: (Util.nvl(sett["POS_CC_CREATE_INVOICE"], "FALSE") == "FALSE" ? false : true),
                press: function () {
                    that.save_data(true);
                }
            }))
            ;
            // that.createScrollCmds(this.frm.getToolbar());
            this.sc = new sap.m.ScrollContainer();
            // this.scCtg = new sap.m.Button({text: "hell"});
            // this.scItems = new sap.m.Button({text: "hell2"});
            var pnls = [];
            var splitScreen = Util.nvl(sett["POS_SPLIT_SCREEN"], "65%");
            var splitItemsGroup = Util.nvl(sett["POS_SPLIT_GROUP_ITEMS"], "30%");

            for (var i = 0; i < 50; i++)
                pnls.push(new sap.m.Panel(
                    {
                        expanded: false,
                        height: "100px",
                        width: "100px",
                        content: [
                            new sap.m.Text(that.view.createId("cmdJo" + i), {text: "New JO"}).addStyleClass("")
                        ],
                        layoutData: new sap.ui.layout.GridData({
                            span: "XL3 L3 M3 S3"
                        })
                    }).addStyleClass("itemTile"));

            this.scItems = new sap.m.ScrollContainer({
                content: [new sap.ui.layout.Grid({
                    vSpacing: 0,
                    hSpacing: 0,
                    width: "100%",
                    defaultSpan: "XL12 L12 M12 S12",
                    content: pnls
                }),
                    new sap.m.VBox({height: "200px"})]
            });


            this.scCtg = new sap.m.ScrollContainer(
                {
                    content: [new sap.m.Button({text: "hell1"})],
                    layoutData: new sap.ui.layout.SplitterLayoutData({size: splitItemsGroup})
                })
            ;

            var spx = new sap.ui.layout.Splitter({
                orientation: "Vertical",
                height: "100%",
                contentAreas: []
            });

            this.sp = new sap.ui.layout.ResponsiveSplitter({
                defaultPane: "default",
                rootPaneContainer:
                    new sap.ui.layout.PaneContainer({
                        panes: [
                            new sap.ui.layout.SplitPane({
                                id: "default",
                                requiredParentWidth: 400,
                                content: [
                                    spx
                                ]
                            }),
                            new sap.ui.layout.PaneContainer({
                                orientation: "Horizontal",
                                panes: [
                                    new sap.ui.layout.SplitPane({
                                        requiredParentWidth: 400,
                                        content: [
                                            new sap.m.Panel({
                                                content: [this.sc],
                                            })
                                        ],

                                    })],
                                layoutData: new sap.ui.layout.SplitterLayoutData({size: splitScreen})
                            })
                        ]
                    })
            });

            this.txtGroup = new sap.m.Text(this.view.createId("txtMsg"), {
                editable: false,
                text: "ss'",
                width: "150px"
            }).addStyleClass("redText blinking ");

            this.tbG = new sap.m.Toolbar({
                content: [
                    new sap.m.Button({
                        icon: "sap-icon://refresh",
                        text: "Refresh",
                        press: function () {
                            that.loadGroups(true);
                        }
                    }),

                ]
            });
            this.tbI = new sap.m.Toolbar({
                content: [

                    new sap.m.Button({
                        icon: "sap-icon://up",
                        text: "Up",
                        press: function () {

                        }
                    }),
                    new sap.m.ToolbarSpacer(),
                    this.txtGroup
                ]
            });

            spx.addContentArea(this.scCtg);
            spx.addContentArea(this.scItems);


            this.sc.addContent(this.frm);

            this.sc.addContent(new sap.m.Button({
                icon: "sap-icon://add", press: function () {
                    that.qv.addRow();
                }
            }));

            this.sc.addContent(new sap.m.Button({
                icon: "sap-icon://sys-minus", press: function () {
                    if (that.qv.getControl().getSelectedIndices().length == 0) {
                        sap.m.MessageToast.show("Select a row to delete. !");
                        return;
                    }

                    var r = that.qv.getControl().getSelectedIndices()[0] + that.qv.getControl().getFirstVisibleRow();
                    that.qv.deleteRow(r);
                    that.do_summary(false, true);

                }
            }));

            this.sc.addContent(this.qv.getControl());
// this.itemsPage.addContent(this.qv.getControl());


            this.createViewFooter(this.sc);

            this.mainPage.addContent(this.sp);
            setTimeout(function () {
                $($(".sapUiFormResGrid , .sapUiFormToolbar")[0]).addClass("greyTB");
                $(".sapUiFormResGrid , .sapUiFormToolbar").addClass("greyTB");
                that.scCtg.$().css("background-color", "lightgray");
            }, 500);

        },
        createViewFooter: function (sc) {
            var that = this;
            var sett = sap.ui.getCore().getModel("settings").getData();
            this.o2 = [];
            var fe = [];
            var invt = "select descr,no from invoicetype where location_code=" + Util.quoted(sett["DEFAULT_LOCATION"]) + " ORDER BY NO";
            this.o2.ord_amt =
                UtilGen.addControl(fe, "Amount", sap.m.Input, "sumAMt",
                    {
                        editable: false,
                        layoutData: new sap.ui.layout.GridData({span: "XL2 L4 M4 S12"})
                    }, "number", sett["FORMAT_MONEY_1"], this.view);

            this.o2.pay_type =
                this.fa.area = UtilGen.addControl(fe, "{i18n>pay_type}", sap.m.ComboBox, "payType",
                    {
                        enabled: true,
                        items: {
                            path: "/",
                            template: new sap.ui.core.ListItem({text: "{DESCR}", key: "{NO}"}),
                            templateShareable: true
                        },
                        selectionChange: function (ev) {

                            that.do_summary(true, true);
                        },
                        layoutData: new sap.ui.layout.GridData({span: "XL3 L4 M4 S12"}),
                    }, "string", undefined, this.view, undefined, invt);

            this.o2.paid_amt =
                UtilGen.addControl(fe, "{i18n>paid_amt}", sap.m.Input, "paid_amt",
                    {
                        editable: true,
                        layoutData: new sap.ui.layout.GridData({span: "XL2 L4 M4 S12"})
                    }, "number", sett["FORMAT_MONEY_1"], this.view, function (ev) {
                        var amt = UtilGen.getControlValue(that.o2.ord_amt);
                        var pd = UtilGen.getControlValue(that.o2.paid_amt);
                        var ch = amt - pd;

                        UtilGen.setControlValue(that.o2.change_amt, ch, ch, true);

                    });

            this.o2.change_amt =
                UtilGen.addControl(fe, "{i18n>change_amt}", sap.m.Input, "changeAmt",
                    {
                        editable: false,
                        layoutData: new sap.ui.layout.GridData({span: "XL2 L4 M4 S12"})
                    }, "number", sett["FORMAT_MONEY_1"], this.view);


            this.o2.change_amt.addStyleClass("redText");

            setTimeout(function () {
                that.o2.pay_type.setSelectedItem(that.o2.pay_type.getItems()[0]);
            });

            var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
            frm.setToolbar(undefined);
            frm.destroyToolbar();

            sc.addContent(frm);
            sc.addContent(new sap.m.VBox({height: "200px"}));

        }
        ,

        createViewHeader: function () {
            var that = this;
            var fe = [];
            this.fa = {};
            var t1 = "XL3 L1 M1 S12";
            var t2 = "XL3 L3 M3 S12";
            var sett = sap.ui.getCore().getModel("settings").getData();
            this.fa.code = UtilGen.addControl(fe, "{i18n>tel}", sap.m.Input, "custTel",
                {
                    enabled: true,
                    // layoutData: new sap.ui.layout.GridData({span: t1}),
                    liveChange: function (oEvent) {
                        var _oInput = oEvent.getSource();
                        var val = _oInput.getValue();
                        val = val.replace(/[^\d]/g, '');
                        _oInput.setValue(val);
                    }

                }, "string", undefined, this.view);
            this.fa.code.addEventDelegate({
                onfocusout: function (e) {

                    that.getAddrData(true);
                    var cod = that.fa.code.getValue();
                    if (cod != "") {
                        that.fa.code.setEnabled(false);
                    }
                }
            });

            this.fa.addr_no = UtilGen.addControl(fe, "@{i18n>addr_no}", sap.m.ComboBox, "addr_no", {
                customData: [{key: ""}],
                layoutData: new sap.ui.layout.GridData({span: t2}),
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{ADDR_NO}-{NAME}", key: "{ADDR_NO}"}),
                    templateShareable: true
                },
                selectionChange: function (event) {
                    that.getAddrData();
                }
            }, "string", undefined, this.view, undefined, "select addr_no,area||' - '||name name from pos_addr where 1=2 order by addr_no");

            this.fa.name = UtilGen.addControl(fe, "{i18n>custName}", sap.m.Input, "custName",
                {
                    enabled: true,
                    // layoutData: new sap.ui.layout.GridData({span: t1}),
                }, "string", undefined, this.view);
            this.fa.area = UtilGen.addControl(fe, "{i18n>area}", sap.m.ComboBox, "custArea",
                {
                    enabled: true,
                    items: {
                        path: "/",
                        template: new sap.ui.core.ListItem({text: "{NAME}", key: "{NAME}"}),
                        templateShareable: true
                    },
                    layoutData: new sap.ui.layout.GridData({span: "XL3 L2 M2 S12"}),
                }, "string", undefined, this.view, undefined, "select name from relists where idlist='AREAS' order by pos");
            this.fa.addr_block = UtilGen.addControl(fe, "@{i18n>block}", sap.m.Input, "custBlock",
                {
                    enabled: true,
                    layoutData: new sap.ui.layout.GridData({span: t1}),
                }, "string", undefined, this.view);
            this.fa.tel = UtilGen.addControl(fe, "@{i18n>othertel}", sap.m.Input, "custotherTel",
                {
                    enabled: true,
                    layoutData: new sap.ui.layout.GridData({span: t1}),
                }, "string", undefined, this.view);
            this.fa.addr_street = UtilGen.addControl(fe, "{i18n>street}", sap.m.Input, "custStreet",
                {
                    enabled: true,
                    layoutData: new sap.ui.layout.GridData({span: t1}),
                }, "string", undefined, this.view);

            //ADDR_JEDDA
            this.fa.addr_jedda = UtilGen.addControl(fe, "@{i18n>jedda}", sap.m.Input, "custJedda",
                {
                    enabled: true,
                    layoutData: new sap.ui.layout.GridData({span: t1}),
                }, "string", undefined, this.view);

            //addr_bldg
            this.fa.addr_bldg = UtilGen.addControl(fe, "@{i18n>building}", sap.m.Input, "custBuilding",
                {
                    enabled: true,
                    layoutData: new sap.ui.layout.GridData({span: t1}),
                }, "string", undefined, this.view);


            //addr_floor
            this.fa.addr_floor = UtilGen.addControl(fe, "{i18n>floor}", sap.m.Input, "custFloor",
                {
                    enabled: true,
                    layoutData: new sap.ui.layout.GridData({span: t1}),
                }, "string", undefined, this.view);

            //addr_flat
            this.fa.addr_flat = UtilGen.addControl(fe, "@{i18n>flat}", sap.m.Input, "custFlat",
                {
                    enabled: true,
                    layoutData: new sap.ui.layout.GridData({span: t1}),
                }, "string", undefined, this.view);

            // this.fa.addr_flat = UtilGen.addControl(fe, "@{flat>}", sap.m.Input, "custFlat2",
            //     {
            //         layoutData: new sap.ui.layout.GridData({span: t1}),
            //     }, "string", undefined, this.view);
            //SPEC_COMMENTS
            this.fa.remark = UtilGen.addControl(fe, "{i18n>remarks}", sap.m.TextArea, "custComments",
                {
                    // layoutData: new sap.ui.layout.GridData({span: t1}),
                }, "string", undefined, this.view);

            //complains
            //email

            fe.push("#{i18n>booking_date}");
            this.fa._location_code = UtilGen.addControl(fe, "{i18n>location}", sap.m.ComboBox, "location_code", {
                customData: [{key: ""}],
                layoutData: new sap.ui.layout.GridData({span: t2}),
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                    templateShareable: true
                },
                selectionChange: function (event) {
                    var invt = "select descr,no from invoicetype where location_code=" + Util.quoted(UtilGen.getControlValue(that.fa._location_code)) + " ORDER BY NO";
                    var dt = Util.execSQL(invt);
                    if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                        var dtx = JSON.parse("{" + dt.data + "}").data;
                        that.o2.pay_type.setModel(new sap.ui.model.json.JSONModel(dtx));
                        that.o2.pay_type.setSelectedItem(that.o2.pay_type.getItems()[0]);
                    }

                }
            }, "string", undefined, this.view, undefined, "select code,name from locations order by 1");

            this.fa._slsmn = UtilGen.addControl(fe, "@{i18n>slsname}", sap.m.ComboBox, "slsmn", {
                customData: [{key: ""}],
                layoutData: new sap.ui.layout.GridData({span: t2}),
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({text: "{CODE}-{NAME}", key: "{CODE}"}),
                    templateShareable: true
                },
                selectionChange: function (event) {

                }
            }, "string", undefined, this.view, undefined, "select NO code,name from SALESP WHERE TYPE='S'  order by 1");
            this.fa._slsmn.setSelectedItem(this.fa._slsmn.getItems()[0]);

            this.fa._inv_date = UtilGen.addControl(fe, "{i18n>booking_date}", sap.m.DatePicker, "ord_date", {
                valueFormat: sett["ENGLISH_DATE_FORMAT"],
                displayFormat: sett["ENGLISH_DATE_FORMAT"],
                layoutData: new sap.ui.layout.GridData({span: t2}),
            }, "date", undefined, this.view);

            this.fa._dlv_time = UtilGen.addControl(fe, "@{i18n>delivery_time}", sap.m.DateTimePicker, "dlvTime",
                {
                    editable: true,
                    layoutData: new sap.ui.layout.GridData({span: t2}),
                }, "date", undefined, this.view);

            this.fa._dlv_time.setValueFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
            this.fa._dlv_time.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");


            // UtilGen.setControlValue(this.fa._dlv_time, new Date(), new Date(), true);
            // return UtilGen.formCreate("", true, fe);

            setTimeout(function () {
                Util.navEnter(fe);
            }, 1000);

            return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);


        }
        ,
        loadData: function () {
            var view = this.view;
            var that = this;
            var sett = sap.ui.getCore().getModel("settings").getData();
            this.fa.code.setEnabled(true);
            this.existed = false;
            this.qryStrBNo = "";
            this.vars.stra = sett["DEFAULT_STORE"];
            this.loadGroups();
            if (this.qryStrB == "") {
                if (this.qryStr == "") {
                    UtilGen.resetDataJson(this.fa);
                    this.fa._slsmn.setSelectedItem(this.fa._slsmn.getItems()[0]);
                    setTimeout(function () {
                        that.fa.code.focus();
                    }, 500);

                } else {
                    this.fa.code.setEnabled(false);
                    var dt = Util.execSQL("select *from poscustomer where code=" + Util.quoted(this.qryStr));
                    if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                        var dtx = JSON.parse("{" + dt.data + "}").data;
                        if (dtx.length > 0) {
                            UtilGen.loadDataFromJson(this.fa, dtx[0], true);
                            this.fa.code.setEnabled(false);
                            this.existed = true;
                        }
                        else {
                            UtilGen.resetDataJson(this.fa);
                            this.fa._slsmn.setSelectedItem(this.fa._slsmn.getItems()[0]);
                            this.existed = false;
                        }
                    }
                }
                UtilGen.setControlValue(this.fa._location_code, sett["DEFAULT_LOCATION"], sett["DEFAULT_LOCATION"], true);
                UtilGen.setControlValue(this.fa._inv_date, new Date(), new Date(), true);
                UtilGen.setControlValue(this.fa.code, this.qryStr, this.qryStr, true);

            } else {
                var dt = Util.execSQL("select *from POS_ONPUR1 where keyfld=" + this.qryStrB);
                if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    if (dtx.length > 0) {
                        UtilGen.setControlValue(this.fa._location_code, dtx[0].LOCATION_CODE, dtx[0].LOCATION_CODE, true);
                        this.fa._location_code.fireSelectionChange();
                        UtilGen.setControlValue(this.fa._slsmn, dtx[0].SLSMN, dtx[0].SLSMN, true);
                        UtilGen.setControlValue(this.fa._inv_date, dtx[0].B_DATE, dtx[0].B_DATE, true);
                        UtilGen.setControlValue(this.fa._dlv_time, dtx[0].DELIVERY_DATETIME, dtx[0].DELIVERY_DATETIME, true);
                        UtilGen.setControlValue(this.o2.paid_amt, dtx[0].PAID_AMT, dtx[0].PAID_AMT, true);
                        UtilGen.setControlValue(this.o2.pay_type, dtx[0].PAY_TYPE, dtx[0].PAY_TYPE, true);
                        that.vars.stra = dtx[0].STRA;
                        this.qryStr = dtx[0].CUST_REFERENCE;
                        this.qryStrBNo = dtx[0].B_NO;
                        var dtt = Util.execSQL("select *from poscustomer where code=" + Util.quoted(this.qryStr));
                        if (dtt.ret = "SUCCESS" && dtt.data.length > 0) {
                            var dttx = JSON.parse("{" + dtt.data + "}").data;
                            if (dttx.length > 0) {
                                UtilGen.loadDataFromJson(this.fa, dttx[0], true);
                                this.fa.code.setEnabled(false);
                                this.existed = true;
                            }
                        }
                    }
                }
            }

            this.loadData_details();

            setTimeout(function () {
                if (that.fa.code.getEnabled())
                    that.fa.code.focus();
                else
                    that.fa.name.focus();
            }, 200);

        }
        ,
        loadData_details: function () {
            var that = this;
            var sq = "select p.*,i.descr,p.price*(p.allqty/p.pack) amount from pos_onpur2 p,items i " +
                "where p.keyfld=" +
                Util.quoted(this.qryStrB) +
                " and p.refer=i.reference "
                + " order by itempos";
            this.qv.getControl().setEditable(true);
            Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
                if (data.ret == "SUCCESS") {
                    that.qv.setJsonStrMetaData("{" + data.data + "}");
                    UtilGen.applyCols("C6L.POS1", that.qv, that);
                    that.qv.mLctb.parse("{" + data.data + "}", true);
                    if (that.qv.mLctb.rows.length == 0)
                        that.qv.addRow();
                    var c = that.qv.mLctb.getColPos("REFER");
                    that.qv.mLctb.cols[c].beforeSearchEvent = function (sq, ctx, model) {
                        // var rfr = model.getProperty(ctx.sPath + "/ORD_REFER");
                        // var s = sq.replace("where", " where cost_item= " + Util.quoted(rfr) + " and ");
                        return sq;
                    };
                    that.qv.loadData();
                    that.do_summary(true, false);
                    // that.setItemSql();

                }
            });
        }
        ,
        validateSave: function (generateInvoice) {
            var that = this;
            if (generateInvoice) {
                if (Util.nvl(UtilGen.getControlValue(this.o2.pay_type), "") == "") {
                    sap.m.MessageToast.show("No pay type selected !");
                    return false;
                }
                if (Util.nvl(UtilGen.getControlValue(this.o2.paid_amt), "") == "") {
                    sap.m.MessageToast.show("No PAID AMOUNT !");
                    return false;
                } else {
                    var lc = "select accno  from invoicetype where location_code=':lcd' and no=:py";
                    lc = lc.replace(/:lcd/g, UtilGen.getControlValue(this.fa._location_code));
                    lc = lc.replace(/:py/g, UtilGen.getControlValue(this.o2.pay_type));
                    var acn = Util.getSQLValue(lc);
                    if (Util.nvl(acn, "") == "") {
                        sap.m.MessageToast.show("No A/c Found ! ");
                        return false;

                    }


                }


                var amt = UtilGen.getControlValue(that.o2.ord_amt);
                var pd = UtilGen.getControlValue(that.o2.paid_amt);
                var ch = amt - pd;
                if (ch > 0) {
                    sap.m.MessageToast.show("Err ! , PAID AMOUNT LESS THAN TOTAL");
                    return false;
                }

            }


            var cod = Util.nvl(UtilGen.getControlValue(this.fa.code), "");
            if (cod == "") {
                UtilGen.setControlValue(this.fa.code, "0", "0", true);
                var nm = Util.nvl(UtilGen.getControlValue(this.fa.name), "0");
                UtilGen.setControlValue(this.fa.name, nm, nm, true);
            }


            var cd = parseInt(cod);


            if (cd == 0 && UtilGen.getControlValue(this.fa._dlv_time) == null)
                UtilGen.setControlValue(this.fa._dlv_time, new Date(), new Date(), true);


            var objs = [this.fa.code, this.fa.name, this.fa._location_code, this.fa._inv_date, this.fa._dlv_time, this.fa._slsmn];
            if (UtilGen.showErrorNoVal(objs) > 0)
                return false;


            this.qv.updateDataToTable();
            var ld = this.qv.mLctb;
            for (var i = 0; i < ld.rows.length; i++)
                ld.setFieldValue(i, "POS", i + 1);
            this.qv.updateDataToControl();
            return true;
        }
        ,
        save_data: function (generateInvoice) {
            var that = this;
            var sett = sap.ui.getCore().getModel("settings").getData();
            if (!this.validateSave(generateInvoice))
                return;
            var k = ""; //  sql for order1 table.
            // inserting or updating order1 and order1 and order2  tables.
            // var defaultValues = {};
            var kfld = Util.nvl(this.qryStrB, Util.getSQLValue("select nvl(max(keyfld),0)+1 from pos_onpur1"));
            var b_no = Util.nvl(this.qryStrBNo, Util.getSQLValue("select nvl(max(b_no),0)+1 from pos_onpur1"));

            // if (this.qryStr == "") {
            var kdel = "delete from poscustomer where code=" + Util.quoted(UtilGen.getControlValue(this.fa.code)) + ";";
            k = UtilGen.getSQLInsertString(this.fa, {}, ["ADDR_NO"]);
            k = kdel + " insert into poscustomer " + k + ";";
            // } else
            //     k = UtilGen.getSQLUpdateString(this.fa, "poscustomer", {},
            //         "code=" + Util.quoted(this.qryStr)) + " ;"

            // deleting and re-inserting order...

            var kk = " delete from pos_onpur1 where keyfld=:KEYFLD ;" +
                " delete from pos_onpur2 where keyfld=:KEYFLD ;  " +
                "insert into pos_onpur1(KEYFLD, LOCATION_CODE, B_KIND, B_NO, B_DATE, B_DATETIME,"
                + " DELIVERY_DATETIME, CUST_REFERENCE, ADDR_NO, TABLE_CODE,"
                + " FLAG, CLOSING_TIME, INV_AMT, DISC_AMT, SLSMN, CUST_COUNTS,"
                + " AREA, TEL, HOME_ADDRESS, WORK_ADDRESS, EMAIL, BDETAIL, "
                + " BCUST, TERMOFPAY, REMARK, REFERENCE, SPEC_COMMENTS, COMPLAINS, "
                + " LAST_DRIVER, ADDR_AREA, ADDR_BLOCK, ADDR_JEDDA, ADDR_STREET, ADDR_BLDG, ADDR_FLAT, ADDR_TEL , ADDR_FLOOR ,"
                + " ADDR_R_AREA, ADDR_R_BLOCK, ADDR_R_JEDDA, ADDR_R_STREET, ADDR_R_BLDG, ADDR_R_TEL , "
                + " ADDR_R_FLOOR, CUST_NAME, PICK_UP,RECIPIENT_ADDRESS, USERNM , PAID_AMT ,PAY_TYPE , STRA "
                + ") VALUES "
                + "(:KEYFLD, :LOCATION_CODE, :B_KIND, :B_NO, :B_DATE, :B_DATETIME,"
                + ":DELIVERY_DATETIME, :CUST_REFERENCE, :ADDR_NO, :TABLE_CODE,"
                + " :FLAG, :CLOSING_TIME, :INV_AMT , "
                + " :DISC_AMT, :SLSMN, :CUST_COUNTS,"
                + " :AREA, :TEL, :HOME_ADDRESS, :WORK_ADDRESS, :EMAIL, :BDETAIL,"
                + " :BCUST, :TERMOFPAY, :REMARK, :REFERENCE, :SPEC_COMMENTS, :COMPLAINS,"
                + " :LAST_DRIVER, :ADDR_AREA, :ADDR_BLOCK, :ADDR_JEDDA, :ADDR_STREET, :ADDR_BLDG, :ADDR_FLAT, :ADDR_TEL, :ADDR_FLOOR,"
                + " :ADDR_R_AREA, :ADDR_R_BLOCK, :ADDR_R_JEDDA, :ADDR_R_STREET, :ADDR_R_BLDG, :ADDR_R_TEL, " +
                "   :ADDR_R_FLOOR , :CUST_NAME, :PICK_UP ,:RECIPIENT_ADDRESS, :USERNM , :PAID_AMT , :PAY_TYPE ,:STRA "
                + "); " +
                " DELETE FROM POS_ADDR WHERE CODE=:CUST_REFERENCE AND ADDR_NO=:ADDR_NO; " +
                " INSERT INTO POS_ADDR (CODE, ADDR_NO, NAME, AREA, ADDR_BLOCK, TEL, ADDR_STREET, ADDR_JEDDA, ADDR_BLDG, ADDR_FLOOR, ADDR_FLAT, REMARK )  " +
                " VALUES " +
                " (:CUST_REFERENCE, :ADDR_NO, :NAME, :AREA, :ADDR_BLOCK, :TEL, :ADDR_STREET, :ADDR_JEDDA, :ADDR_BLDG, :ADDR_FLOOR, :ADDR_FLAT, :REMARK);" +
                "  ";
            kk = kk.replace(/:KEYFLD/g, kfld);
            kk = kk.replace(/:B_NO/g, b_no);
            kk = kk.replace(/:LOCATION_CODE/g, Util.quoted(UtilGen.getControlValue(this.fa._location_code)));
            kk = kk.replace(/:B_KIND/g, Util.quoted("DELIVERY"));
            kk = kk.replace(/:B_DATETIME/g, Util.toOraDateString(UtilGen.getControlValue(this.fa._inv_date)));
            kk = kk.replace(/:B_DATE/g, Util.toOraDateString(UtilGen.getControlValue(this.fa._inv_date)));
            kk = kk.replace(/:DELIVERY_DATETIME/g, Util.toOraDateTimeString(UtilGen.getControlValue(this.fa._dlv_time)));
            kk = kk.replace(/:CUST_REFERENCE/g, Util.quoted(UtilGen.getControlValue(this.fa.code)));
            kk = kk.replace(/:ADDR_NO/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_no)));
            kk = kk.replace(/:TABLE_CODE/g, Util.quoted(""));
            kk = kk.replace(/:FLAG/g, 1);
            kk = kk.replace(/:CLOSING_TIME/g, 'null');
            kk = kk.replace(/:DISC_AMT/g, 0);
            kk = kk.replace(/:SLSMN/g, 1);
            kk = kk.replace(/:CUST_COUNTS/g, 1);
            kk = kk.replace(/:AREA/g, Util.quoted(UtilGen.getControlValue(this.fa.area)));
            kk = kk.replace(/:TEL/g, Util.quoted(UtilGen.getControlValue(this.fa.code)));
            kk = kk.replace(/:HOME_ADDRESS/g, Util.quoted(""));
            kk = kk.replace(/:WORK_ADDRESS/g, Util.quoted(""));
            kk = kk.replace(/:EMAIL/g, Util.quoted(""));
            kk = kk.replace(/:BDETAIL/g, Util.quoted(""));
            kk = kk.replace(/:BCUST/g, Util.quoted(""));
            kk = kk.replace(/:TERMOFPAY/g, Util.quoted(""));
            kk = kk.replace(/:REMARK/g, Util.quoted(UtilGen.getControlValue(this.fa.remark)));
            kk = kk.replace(/:REFERENCE/g, Util.quoted(""));
            kk = kk.replace(/:SPEC_COMMENTS/g, Util.quoted(UtilGen.getControlValue(this.fa.remark)));
            kk = kk.replace(/:COMPLAINS/g, Util.quoted(""));
            kk = kk.replace(/:LAST_DRIVER/g, Util.quoted(""));
            kk = kk.replace(/:ADDR_AREA/g, Util.quoted(UtilGen.getControlValue(this.fa.area)));
            kk = kk.replace(/:ADDR_BLOCK/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_block)));
            kk = kk.replace(/:ADDR_JEDDA/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_jedda)));
            kk = kk.replace(/:ADDR_STREET/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_street)));
            kk = kk.replace(/:ADDR_BLDG/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_bldg)));
            kk = kk.replace(/:ADDR_FLAT/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_flat)));
            kk = kk.replace(/:ADDR_TEL/g, Util.quoted(UtilGen.getControlValue(this.fa.code)));
            kk = kk.replace(/:ADDR_FLOOR/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_floor)));
            kk = kk.replace(/:ADDR_R_AREA/g, Util.quoted(""));
            kk = kk.replace(/:ADDR_R_BLOCK/g, Util.quoted(""));
            kk = kk.replace(/:ADDR_R_JEDDA/g, Util.quoted(UtilGen.getControlValue(this.fa.addr_jedda)));
            kk = kk.replace(/:ADDR_R_STREET/g, Util.quoted(""));
            kk = kk.replace(/:ADDR_R_BLDG/g, Util.quoted(""));
            kk = kk.replace(/:ADDR_R_TEL/g, Util.quoted(""));
            kk = kk.replace(/:ADDR_R_FLOOR/g, Util.quoted(""));
            kk = kk.replace(/:CUST_NAME/g, Util.quoted(UtilGen.getControlValue(this.fa.name)));
            kk = kk.replace(/:NAME/g, Util.quoted(UtilGen.getControlValue(this.fa.name)));
            kk = kk.replace(/:INV_AMT/g, Util.quoted(UtilGen.getControlValue(this.o2.ord_amt)));
            kk = kk.replace(/:PAID_AMT/g, Util.quoted(UtilGen.getControlValue(this.o2.paid_amt)));
            kk = kk.replace(/:PAY_TYPE/g, Util.quoted(UtilGen.getControlValue(this.o2.pay_type)));
            kk = kk.replace(/:PICK_UP/g, Util.quoted("N"));
            kk = kk.replace(/:RECIPIENT_ADDRESS/g, Util.quoted("N"));
            kk = kk.replace(/:USERNM/g, Util.quoted(sett["LOGON_USER"]));
            kk = kk.replace(/:STRA/g, Util.quoted(that.vars.stra));


            // saving pos_onpur2
            var kkfld = (this.qryStrB == "" ? Util.getSQLValue("select nvl(max(keyfld),0)+1 from pos_onpur1") : kfld);
            var bb_no = (this.qryStrB == "" ? Util.getSQLValue("select nvl(max(b_no),0)+1 from pos_onpur1") : b_no);
            var defaultValues = {
                "KEYFLD": kkfld,
                "B_NO": bb_no,
                "B_KIND": 'DELIVERY',
                "FLAG": 1,
                "B_DATE": UtilGen.getControlValue(this.fa._inv_date),
                "QTY": 0,
                "LOCATION_CODE": UtilGen.getControlValue(this.fa._location_code)

            };
            var c = that.qv.mLctb.getColPos("PRD_DATE");
            this.qv.mLctb.cols[c].getMUIHelper().data_type = "VARCHAR2"
            var c = that.qv.mLctb.getColPos("EXP_DATE");
            this.qv.mLctb.cols[c].getMUIHelper().data_type = "VARCHAR2"
            var s1 = "";
            // sqls for insert string in order2 table.
            for (var i = 0; i < this.qv.mLctb.rows.length; i++) {
                var rfr = this.qv.mLctb.getFieldValue(i, "REFER");
                var p1 = "(select prd_dt from items where reference=" + Util.quoted(rfr) + ")";
                var p2 = "(select exp_dt from items where reference=" + Util.quoted(rfr) + ")";
                defaultValues["ALLQTY"] = this.qv.mLctb.getFieldValue(i, "PKQTY");
                defaultValues["UNITD"] = 'PCS';
                defaultValues["PRD_DATE"] = p1;
                defaultValues["EXP_DATE"] = p2;

                s1 += (UtilGen.getInsertRowString(this.qv.mLctb, "pos_onpur2", i, ["AMOUNT", "DESCR"], defaultValues, true) + ";");
                s1 = s1.replace(Util.quoted(p1), p1);
                s1 = s1.replace(Util.quoted(p2), p2);
            }

            if (generateInvoice)
                s1 = s1 + "x_post_pos_on(" + kfld + ");";

            // kk = kk.replace(/:/g,);
            k = "begin " + k + kk + s1 + " end;";

            var oSql = {
                "sql": k,
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
                sap.m.MessageToast.show("Saved Successfully !,  Enter New category..!");
                that.qryStr = "";
                that.qryStrB = "";
                that.loadData();
                if (generateInvoice) {
                    var kfx = Util.getSQLValue("select saleinv from POS_ONPUR1 where keyfld=" + kfld);
                    that.printInv(kfx);
                }

            });
        },
        printInv: function (kfld) {
            var that = this;
            var pms = "";
            var sett = sap.ui.getCore().getModel("settings").getData();
            var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
            var sq1 = "select *from pospur1 where keyfld=" + kfld;
            var sq = "select pospayments.*,INITCAP(invoicetype.descr) DESCR from "
                + "POSPUR1,pospayments,invoicetype where INVOICETYPE.NO=POSPAYMENTS.TYPE_NO AND "
                + " INVOICETYPE.LOCATION_CODE=POSPUR1.LOCATION_CODE AND KEYFLD=VOU_KEYFLD AND vou_keyfld=" + kfld;

            var dt = Util.execSQL(sq);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_PAID_DESCR1=" + dtx[0].DESCR;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_PAIDAMT_1=" + dtx[0].AMOUNT;
            }
            var dt = Util.execSQL(sq1);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                var netamt = dtx[0].INV_AMT - dtx[0].DISC_AMT;
                var chgamt = netamt - dtx[0].PAIDAMT2;
                var dnm = Util.getSQLValue("select name from salesp where no=" + dtx[0].SLSMN);
                var loc = Util.getSQLValue("select name from locations where code=" + dtx[0].LOCATION_CODE);

                pms += (pms.length > 0 ? "&" : "") + "_para_" + "KEYFLD=--" + dtx[0].KEYFLD;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_AMT=--" + dtx[0].INV_AMT;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_NO=--" + dtx[0].INVOICE_NO;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_DATE_TIME=@" + sdf.format(new Date(dtx[0].INVOICE_DATE));
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_LOCATION=" + loc;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_USER=" + dtx[0].USERNAME;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_NETAMT=--" + netamt;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_PAIDAMT=--" + dtx[0].PAIDAMT2;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_DISCAMT=--" + dtx[0].DISC_AMT;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "INV_CHANGEAMT=--" + chgamt;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "ADD_CHARGE=--" + dtx[0].ADD_CHARGE;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "SLSMN=" + dtx[0].SLSMN;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_DRIVERNAME=" + dnm;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_PHONE=" + dtx[0].INV_REF;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_CUSTOMERNAME=" + dtx[0].INV_REFNM;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_OTHERTEL=" + dtx[0].ADDR_TEL;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_AREA=" + dtx[0].ADDR_AREA;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_BLOCK=" + dtx[0].ADDR_BLOCK;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_STREET=" + dtx[0].ADDR_STREET;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_JEDDA=" + dtx[0].ADDR_JEDDA;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_BUILDING=" + dtx[0].ADDR_BLDG;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_FLOORNO=" + dtx[0].REFERENCE_INFORMATION;
                pms += (pms.length > 0 ? "&" : "") + "_para_" + "DLV_FLATNO=" + dtx[0].WORK_ADDRESS;
                // pms += (pms.length > 0 ? "&" : "") + "_para_" + "=" + dtx[0].;
            }

            Util.doXhr("report?reportfile=possale&" + pms, true, function (e) {
                if (this.status == 200) {
                    var blob = new Blob([this.response], {type: "application/pdf"});
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.target = "_blank";
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.download = "rptVou" + new Date() + ".pdf";
                    // link.click();
                    // document.body.removeChild(link);
                    that.printPdf(link.href);
                }
            })

        },
        printPdf: function (url) {

            var iframe = this._printIframe;
            if (!this._printIframe) {
                iframe = this._printIframe = document.createElement('iframe');
                document.body.appendChild(iframe);

                iframe.style.display = 'none';
                iframe.onload = function () {
                    setTimeout(function () {
                        iframe.focus();
                        iframe.contentWindow.print();
                    }, 1);
                };
            }

            iframe.src = url;
        },
        reprint: function () {
            var that = this;
            this.fa.name.focus();
            var sq = "select l.name location_name , p.b_no," +
                "p.cust_reference tel,p.cust_name,p.b_date," +
                "p.keyfld,p.saleinv from " +
                "pos_onpur1 p,locations l  " +
                "where p.saleinv is not null and l.code=p.location_code order by b_date desc,keyfld desc ";
            var fnOnSelect = function (data) {
                if (data != undefined && data.length <= 0)
                    return;
                var kfld = data.SALEINV;
                that.printInv(kfld);
                return true;
            };

            Util.show_list(sq, ["CUST_NAME", "TEL"],
                undefined, fnOnSelect, "100%", "100%", 10, false, undefined);
        },
        show_list: function () {
            var that = this;
            this.fa.name.focus();
            var sq = "select l.name location_name , p.b_no," +
                "p.cust_reference tel,p.cust_name,p.b_date," +
                "p.keyfld from pos_onpur1 p,locations l  where p.saleinv is null and l.code=p.location_code order by b_date desc,keyfld desc ";
            var fnOnSelect = function (data) {
                if (data != undefined && data.length <= 0)
                    return;
                that.qryStr = data.TEL;
                that.qryStrB = data.KEYFLD;
                that.loadData();
                return true;
            };

            Util.show_list(sq, ["CUST_NAME", "TEL"],
                undefined, fnOnSelect, "100%", "100%", 10, false, undefined);
        }
        ,
        getAddrData: function (fetchAddrList) {
            var that = this;
            if (that.qryStrB == "" && that.fa.code.getEditable()) {
                // that.qryStr = UtilGen.getControlValue(that.fa.code);
                var cod = that.fa.code.getValue();
                if (fetchAddrList) {
                    var dtxx = [];
                    var dt = Util.execSQL("select addr_no,area||'-'||name name from pos_addr where code=" + Util.quoted(cod) + " order by addr_no");
                    if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                        var dtx = JSON.parse("{" + dt.data + "}").data;
                        dtxx = dtxx.concat(dtx);
                    }

                    dtxx.push({ADDR_NO: dtxx.length + 1, NAME: ""});
                    that.fa.addr_no.setModel(new sap.ui.model.json.JSONModel(dtxx));
                    if (dtxx.length == 1)
                        UtilGen.setControlValue(this.fa.addr_no, dtxx.length, dtxx.length, false);
                    else
                        UtilGen.setControlValue(this.fa.addr_no, 1, 1, false);
                }
                var an = UtilGen.getControlValue(that.fa.addr_no);
                var dt = Util.execSQL("select *from pos_addr where code=" + Util.quoted(cod) + " and addr_no=" + an);
                if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    if (dtx.length > 0)
                        UtilGen.loadDataFromJson(that.fa, dtx[0], true, ["ADDR_NO", "CODE"]);
                    else {
                        UtilGen.resetDataJson(that.fa, ["ADDR_NO", "CODE", "_LOCATION_CODE", "_SLSMN", "_INV_DATE"]);
                        UtilGen.setControlValue(that.fa.code, cod, cod, true);
                    }

                }

            }
        }
        ,
        do_summary: function (reAmt, payAsAmt) {
            var that = this;
            reamt = Util.nvl(reAmt, false); // re calculate amount if require.
            var sett = sap.ui.getCore().getModel("settings").getData();
            var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
            var tbl = that.qv.getControl();
            if (reamt)
                for (var i = 0; i < that.qv.mLctb.rows.length; i++) {
                    var pr = parseFloat((Util.getCellColValue(tbl, i, 'PRICE')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
                    var qt = parseFloat((Util.getCellColValue(tbl, i, 'PKQTY')).toString().replace(/[^\d\.]/g, '').replace(/,/g, ''));
                    var pk = parseFloat(Util.getCellColValue(tbl, i, 'PACK'));
                    var amt = pr * (qt);
                    var vamt = 0;
                    Util.setCellColValue(tbl, i, "AMOUNT", df.format(amt));
                }
            this.qv.updateDataToTable();
            var sum = 0;
            var ld = that.qv.mLctb;
            df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
            for (var i = 0; i < ld.rows.length; i++) {
                var val = (that.qv.mLctb.getFieldValue(i, "AMOUNT") + "").toString().replace(/[^\d\.]/g, '').replace(/,/g, '');
                val = parseFloat(df.formatBack(val));
                sum += val;
            }
            UtilGen.setControlValue(that.o2.ord_amt, sum, sum, true);
            if (Util.nvl(payAsAmt, false))
                UtilGen.setControlValue(that.o2.paid_amt, sum, sum, true);
            if (Util.nvl(this.qryStrB, "") == "")
                UtilGen.setControlValue(that.o2.paid_amt, sum, sum, true);

            var amt = UtilGen.getControlValue(that.o2.ord_amt);
            var pd = UtilGen.getControlValue(that.o2.paid_amt);
            var ch = amt - pd;
            UtilGen.setControlValue(that.o2.change_amt, ch, ch, true);
        }
        ,

        delete_data: function () {
            var that = this;
            if (this.qryStrB == "") {
                sap.m.MessageToast.show("You are entering new record !");
                return;

            }

            sap.m.MessageBox.confirm("Are you sure to DELETE this Order : ?  " + UtilGen.getControlValue(that.fa.code), {
                title: "Confirm",                                    // default
                onClose: function (oAction) {
                    if (oAction == sap.m.MessageBox.Action.OK) {
                        var flg = Util.getSQLValue("select flag from  POS_ONPUR1 where keyfld=" + that.qryStrB);
                        if (flg == 2) {
                            sap.m.MessageToast.show("Invoice generated  already !");
                            return;
                        }
                        var sq = "begin " +
                            "delete from POS_ONPUR1 where KEYFLD= :keyfld ; " +
                            "delete from POS_ONPUR2  where KEYFLD= :keyfld ; " +
                            "end;";
                        sq = sq.replace(/:keyfld/g, that.qryStrB);
                        var dat = Util.execSQL(sq);
                        if (dat.ret == "SUCCESS") {
                            sap.m.MessageToast.show("Deleted....!");
                            that.qryStr = "";
                            that.qryStrB = "";
                            that.loadData();
                        }
                    }
                },                                       // default
                styleClass: "",                                      // default
                initialFocus: null,                                  // default
                textDirection: sap.ui.core.TextDirection.Inherit     // default
            });

        }
        ,
        loadGroups: function (forceDataLoad) {
            var that = this;
            var sett = sap.ui.getCore().getModel("settings").getData();
            that.txtGroup.setText("");
            if (forceDataLoad)
                this.loadItemTable();


            if (this.itemsData == undefined)
                this.loadItemTable();

            this.scCtg.removeContent(this.tbG);
            this.scItems.removeContent(this.tbI);

            UtilGen.clearPage(this.scCtg);
            UtilGen.clearPage(this.scItems);

            this.scCtg.addContent(this.tbG);

            if (this.groupData == undefined)
                return;

            var grd = new sap.ui.layout.Grid({
                vSpacing: 0,
                hSpacing: 0,
                width: "100%",
                defaultSpan: "XL12 L12 M12 S12",
            });

            this.scCtg.addContent(grd);
            this.scCtg.addContent(new sap.m.VBox({height: "200px"}));

            var ev = function (e) {
                that.txtGroup.setText("");
                that.selectedGroup = this.getCustomData()[1].getKey();
                that.showItems(this.getCustomData()[1].getKey());

                var r = that.itemsData.find("REFERENCE", that.selectedGroup);
                if (r < -0)
                    return;
                var de = that.itemsData.getFieldValue(r, "DESCR");

                that.txtGroup.setText(de);
            };

            var ld = this.groupData;
            for (var i = 0; i < ld.rows.length; i++) {
                var rfr = ld.getFieldValue(i, "REFERENCE");
                var de = ld.getFieldValue(i, "DESCR");
                var pnl = new sap.m.Panel(
                    {
                        expanded: false,
                        height: "80px",
                        content: [
                            new sap.m.Text({text: de}).addStyleClass("")
                        ],
                        customData: [{key: rfr}],
                        layoutData: new sap.ui.layout.GridData({
                            span: "XL4 L4 M4 S4"
                        })
                    }).addStyleClass("groupTitle");
                pnl.attachBrowserEvent("click", ev);
                grd.addContent(pnl);
            }
            this.selectedGroup = "";
        },

        loadItemTable: function () {
            var that = this;
            var sett = sap.ui.getCore().getModel("settings").getData();
            this.itemsData = undefined;
            this.groupData = undefined;
            var tbl = new LocalTableData();
            var tbl2 = new LocalTableData();


            // group data...
            var pth = Util.getSQLValue("select nvl(max(descr2),'')||'%' from items where reference=" + Util.quoted(sett["SHOW_ITEM_GROUP"]));
            var sqlG = "select reference,descr from items where childcounts>0 and PARENTITEM="
                + Util.quoted(sett["SHOW_ITEM_GROUP"]) + " order by descr2";
            var dt = Util.execSQL(sqlG);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                tbl.parse("{" + dt.data + "}", false);
                this.groupData = tbl;
            }


            // load all items...

            var sqlI = "select reference,descr,childcounts,price1,parentitem,descr2 from items " +
                " where flag=1 and descr2 like " + Util.quoted(pth) +
                " order by descr2";
            var dt = Util.execSQL(sqlI);
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                tbl2.parse("{" + dt.data + "}", false);
                this.itemsData = tbl2;
            }
        }

        ,
        showItems: function () {
            var that = this;

            if (this.itemsData == undefined)
                this.loadItemTable();

            if (Util.nvl(this.selectedGroup, "") == "")
                return sap.m.MessageToast.show("Group is not selected !");

            this.scItems.removeContent(this.tbI);
            UtilGen.clearPage(this.scItems);
            this.scItems.addContent(this.tbI);

            if (this.itemsData == undefined)
                return;

            var grd = new sap.ui.layout.Grid({
                vSpacing: 0,
                hSpacing: 0,
                width: "100%",
                defaultSpan: "XL12 L12 M12 S12",
            });
            this.scItems.addContent(grd);
            var ev = function (e) {
                that.selectedGroup = this.getCustomData()[1].getKey();
                var e = this.getCustomData()[1].getKey();
                var r = that.itemsData.find("REFERENCE", e);
                if (r < -0)
                    return;
                var ch = that.itemsData.getFieldValue(r, "CHILDCOUNTS");
                if (ch > 0) {
                    that.selectedGroup = e;
                    that.showItems();
                    var de = that.itemsData.getFieldValue(r, "DESCR");
                    that.txtGroup.setText(de);
                } else {
                    sap.m.MessageToast.show(e + " is selected !");
                    setTimeout(function () {
                        that.o2.ord_amt.focus();
                        that.qv.getControl().focus();
                    });

                    that.addUpdateItem(e);

                }

            };

            var ld = this.itemsData;

            for (var i = 0; i < ld.rows.length; i++) {
                var rfr = ld.getFieldValue(i, "REFERENCE");
                var de = ld.getFieldValue(i, "DESCR");
                var pi = ld.getFieldValue(i, "PARENTITEM");

                if (pi == this.selectedGroup) {
                    var pnl = new sap.m.Panel(
                        {
                            expanded: false,
                            height: "80px",
                            content: [
                                new sap.m.Text({text: de}).addStyleClass("")
                            ],
                            customData: [{key: rfr}],
                            layoutData: new sap.ui.layout.GridData({
                                span: "XL3 L3 M3 S3"
                            })
                        }).addStyleClass("itemTile");
                    pnl.attachBrowserEvent("click", ev);
                    grd.addContent(pnl);
                }
            }
        },
        addUpdateItem: function (pRfr) {
            var that = this;
            if (Util.nvl(pRfr, "") == "")
                return;

            var ld = this.qv.mLctb;
            this.qv.updateDataToTable();

            var r = that.itemsData.find("REFERENCE", that.selectedGroup);

            if (r < -0)
                return;

            var de = that.itemsData.getFieldValue(r, "DESCR");
            var pr = that.itemsData.getFieldValue(r, "PRICE1");


            if (ld.rows.length == 1 && ld.getFieldValue(0, "REFER") == "") {
                ld.setFieldValue(0, "REFER", pRfr);
                ld.setFieldValue(0, "PKQTY", 1);
                ld.setFieldValue(0, "PRICE", pr);
                ld.setFieldValue(0, "DESCR", de);
                that.qv.updateDataToControl();
                that.do_summary(true, true);
                return;
            }
            var ri = ld.find("REFER", pRfr);
            // if row is new.
            if (ri < 0) {
                ri = that.qv.addRow();
                ld.setFieldValue(ri, "REFER", pRfr);
                ld.setFieldValue(ri, "PKQTY", 1);
                ld.setFieldValue(ri, "PRICE", pr);
                ld.setFieldValue(ri, "DESCR", de);
                that.qv.updateDataToControl();
                that.do_summary(true, true);
                return;

            }
            // if row found earlier.
            if (ri >= 0) {
                var qt = Util.nvl(ld.getFieldValue(ri, "PKQTY"), 1);
                qt++;
                ld.setFieldValue(ri, "REFER", pRfr);
                ld.setFieldValue(ri, "PKQTY", qt);
                ld.setFieldValue(ri, "PRICE", pr);
                ld.setFieldValue(ri, "DESCR", de);
                that.qv.updateDataToControl();
                that.do_summary(true, true);
                return;
            }

        }
    }
)
;



