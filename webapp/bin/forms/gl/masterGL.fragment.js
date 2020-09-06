sap.ui.jsfragment("bin.forms.gl.masterGL", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.ShowHideMode});
        this.qvAcs;
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 106,
            onm: ""
        };
        // this.pgDetail = new sap.m.Page({showHeader: false});


        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });

        this.detailPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        this.acPage = new sap.m.Page({
            showHeader: false,
            content: []
        });

        this.createView();
        this.loadData();
        this.joApp.addMasterPage(this.mainPage);
        this.joApp.addDetailPage(this.detailPage);
        this.joApp.addDetailPage(this.acPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.toMaster(this.mainPage, "show");
        this.joApp.toDetail(this.detailPage, "show");

        return this.joApp;
    },
    createView: function () {
        var that = this;
        var view = this.view;

        UtilGen.clearPage(this.mainPage);
        UtilGen.clearPage(this.detailPage);
        this.o1 = {};
        var fe = [];
        this.frm = this.createAcc();

        // Util.destroyID("glNew", this.view);
        // this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave"), {
        //     icon: "sap-icon://save", press: function () {
        //         that.save_data();
        //     }
        // }));
        //
        // Util.destroyID("poCmdDel", this.view);
        // this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdDel"), {
        //     icon: "sap-icon://delete", press: function () {
        //         that.delete_data();
        //     }
        // }));
        // that.createScrollCmds(this.frm.getToolbar());

        // var sc = new sap.m.ScrollContainer();
        this.frm.setWidth("500px");

        var vb = new sap.m.VBox({
            width: "300px",
            height: "100%",
            items: [
                new sap.m.Link({
                    text: "Accounts",
                    subtle: true,
                    width: "100%",
                    press: function () {
                        sap.m.MessageToast.show("ss");
                    }
                }).addStyleClass("sapUiLargeMarginTop sapUiMediumMarginBottom menuSel "),
                new sap.m.Link({
                    text: "Vouchers",
                    subtle: true,
                    width: "100%",
                }).addStyleClass("sapUiMediumMarginBottom menuSel "), ,
            ]
        }).addStyleClass("menuBack");

        var hb = new sap.m.HBox({
            height: "100%",
            width: "100%",
            items: [
                this.frm
            ]
        });

        this.detailPage.addContent(hb);
        this.mainPage.addContent(vb);


        // sc.addContent(hb);

    },
    createAcc: function () {
        var that = this;
        var fe = [];
        var frm = new sap.m.VBox().addStyleClass("sapUiMediumMargin");

        frm.addItem(new sap.m.Text({text: "Accounts"}).addStyleClass("titleFont"));

        frm.addItem(new sap.m.Text({text: ""}));
        this.acSel = UtilGen.createControl(sap.m.ComboBox, this.view, "ord_type", {
            customData: [{key: ""}],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{CODE} - {NAME}", key: "{CODE}"}),
                templateShareable: true
            },
            selectedKey: "1",
            selectionChange: function (event) {
                that.generate_jo_no();
            }
        }, "string", undefined, undefined, "@0/All AC,1/Recent 10 AC,2/Child AC,3/Parent AC");
        this.acLvl = new sap.m.Input({value: "0"});

        var tb2 = new sap.m.Toolbar({content: [this.acSel, new sap.m.Text({text: "Level:"}), this.acLvl]});
        frm.addItem(tb2);
        var tb = new sap.m.Toolbar();
        tb.addContent(new sap.m.Button({
            text: "New",
            icon: "sap-icon://create",
            press: function (ev) {
                that.new_ac();
            }
        }));
        tb.addContent(new sap.m.Button({
            text: "Edit ",
            icon: "sap-icon://edit",
            press: function (ev) {
                that.edit_ac();
            }
        }));

        tb.addContent(new sap.m.Button({
            text: "Delete",
            icon: "sap-icon://delete",
            press: function (ev) {
                that.delete_ac();
            }
        }));
        tb.addContent(new sap.m.ToolbarSpacer());
        tb.addContent(new sap.m.SearchField());

        frm.addItem(tb);

        this.qvAcs = new QueryView("qrAcs");
        //this.qvAcs.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qvAcs.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.qvAcs.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Interactive);
        this.qvAcs.getControl().setAlternateRowColors(true);
        this.qvAcs.getControl().setEditable(false);

        //this.qv.getControl().setVisibleRowCount(100);

        this.qvAcs.getControl().setFixedBottomRowCount(0);
        this.qvAcs.getControl().addStyleClass("noColumnBorder");
        this.qvAcs.getControl().addStyleClass("sapUiSizeCondensed");

        frm.addItem(this.qvAcs.getControl());

        //frm = UtilGen.formCreate("", true, fe);

        return frm;

        // return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },

    loadData: function () {
        var that = this;
        var sql = "select accno,name from acaccount where rownum<=10 order by START_DATE desc";
        var dat = Util.execSQL(sql);
        if (dat.ret == "SUCCESS") {
            that.qvAcs.setJsonStr("{" + dat.data + "}");
        }


        that.qvAcs.loadData();
        sap.m.MessageToast.show("Found # " + that.qvAcs.mLctb.rows.length + " Records");
    }
    ,

    validateSave: function () {

        return true;
    }
    ,

    save_data: function () {

    },

    new_ac: function () {
        var that = this;
        var sp = UtilGen.openForm("bin.forms.gl.masterAc", this.acPage, undefined, this.view);
        sp.backFunction = function () {
            that.joApp.toDetail(that.detailPage, "show");
            that.createView();
            that.loadData();
        };
        UtilGen.clearPage(this.acPage);
        this.acPage.addContent(sp);
        this.joApp.toDetail(this.acPage, "slide");
    },

    edit_ac: function () {

        var that = this;
        var indicOF = that.qvAcs.getControl().getBinding("rows").aIndices;
        var indic = that.qvAcs.getControl().getSelectedIndices();
        var arPo = [];
        if (indic.length <= 0) {
            sap.m.MessageToast.show("Must Select A/c !");
            return;
        }
        var qryStr = Util.nvl(Util.getCellColValue(that.qvAcs.getControl(), indicOF[indic[0]], "ACCNO"), "");

        for (var i = 0; i < indic.length; i++)
            arPo.push(Util.nvl(Util.getCellColValue(that.qvAcs.getControl(), indicOF[indic[i]], "ACCNO"), ""));


        var oC = {
            qryStr: qryStr,
            selectedReq: arPo,
            getView:
                function () {
                    return that.view;
                }
        };


        var sp = UtilGen.openForm("bin.forms.gl.masterAc", this.acPage, oC, this.view);
        sp.backFunction = function () {
            that.joApp.toDetail(that.detailPage, "show");
            that.createView();
            that.loadData();
        };
        UtilGen.clearPage(this.acPage);
        this.acPage.addContent(sp);
        this.joApp.toDetail(this.acPage, "slide");

    },
    delete_ac: function () {

    },


});



