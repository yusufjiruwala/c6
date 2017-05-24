sap.ui.jsview("chainel1.QuickReport", {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf chainel1.QuickReport **/
    getControllerName: function () {
        return "chainel1.QuickReport";
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf chainel1.QuickReport **/
    createContent: function (oController) {


        this.app = sap.ui.getCore().byId("oSplitApp");
        this.report_id = "";
        this.oBar = Util.createBar("{detailP>/pageTitle}");
        this.oBar2 = Util.createBar("{detailP>/pageTitle}");
        var that = this;
        this.mainPage = new sap.m.Page(this.createId("pgQuickRepMain"), {
            customHeader: this.oBar,
            footer: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),
                    new sap.m.Button({
                        text: "Preview", press: function () {
                            oController.preview();
                        }
                    })
                ]
            }),
            content: []
        })
        ;
        var QueryView = sap.ui.require("sap/ui/chainel1/util/generic/QueryView");
        this.qv = new QueryView(this.createId("tbl"));
        this.QueryPage = new sap.m.Page(this.createId("pgResult"), {
            customHeader: this.oBar2,
            content: [
                this.qv.mTable
            ],
            footer: this.createQRToolbar()
        });
        var oSplitApp = sap.ui.getCore().byId("oSplitApp");
        oSplitApp.addDetailPage(this.QueryPage);
        //sap.ui.getCore().byId("pgQuickRep").createMainPart();
        return this.mainPage;
    },
    showReportPara: function (idno) {
        this.report_id = idno;
        this.mainPage.destroyContent();


        this.mainPage.removeAllContent();

        (this.byId("txtSubGroup") != undefined ? this.byId("txtSubGroup").destroy() : null);
        var txtSubGroup = new sap.m.ComboBox(this.createId("txtSubGroup"),
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({
                        text: "{rep_name}",
                        key: "{rep_code}"
                    }),
                    templateShareable: true
                },
                selectionChange: function (event) {
                    sap.ui.getCore().byId("pgQuickRep").onChangeReport();
                }
            }).addStyleClass("simpleInput");


        (this.byId("txtGroupHeader") != undefined ? this.byId("txtGroupHeader").destroy() : null);
        var txtGroupHeader = new sap.m.ComboBox(this.createId("txtGroupHeader"),
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({
                        text: "{group_name}",
                        key: "{group_name}"
                    }),
                    templateShareable: true
                }
            }).addStyleClass("simpleInput");


        (this.byId("txtGroupDetail") != undefined ? this.byId("txtGroupDetail").destroy() : null);
        var txtGroupDetail = new sap.m.ComboBox(this.createId("txtGroupDetail"),
            {
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({
                        text: "{group_name}",
                        key: "{group_name}"
                    }),
                    templateShareable: true
                }
            }).addStyleClass("simpleInput");


        this.mainPage.addContent(txtSubGroup);
        this.mainPage.addContent(txtGroupHeader);
        this.mainPage.addContent(txtGroupDetail);

        sap.ui.getCore().byId("pgQuickRep").loadData();

    },

    loadData: function () {
        var that = this;
        Util.doAjaxGet("exe?command=get-quickrep-metadata&report-id=" + this.report_id, "", false).done(function (data) {
            //console.log(data);
            var dtx = JSON.parse(data);
            var txtSubGroup = that.byId("txtSubGroup");
            txtSubGroup.setModel(new sap.ui.model.json.JSONModel(dtx.subreport));
            that.reportsData = dtx;
        });

        if (that.byId("txtSubGroup").getItems().length > 0) {
            that.byId("txtSubGroup").setSelectedItem(that.byId("txtSubGroup").getItems()[0]);
            sap.ui.getCore().byId("pgQuickRep").onChangeReport();
        }

    },

    onChangeReport: function () {
        var that = this;
        var rp = that.byId("txtSubGroup").getSelectedItem().getKey();
        Util.doAjaxGet("exe?command=get-quickrep-cols&report-id=" + rp, "", false).done(function (data) {
            var dtx = JSON.parse(data);
            var txtGroupDetail = that.byId("txtGroupDetail");
            txtGroupDetail.setModel(new sap.ui.model.json.JSONModel(dtx.groups));
            var txtGroupHeader = that.byId("txtGroupHeader");
            txtGroupHeader.setModel(new sap.ui.model.json.JSONModel(dtx.groups));
            console.log(that.colData);
            if (that.coldData !== undefined) {
                for (var i = 0; i < that.colData.parameters.length; i++) {

                    (that.byId("para_" + i) != undefined ? that.byId("para_" + i).destroy() : null);
                }
            }
            for (var i = 0; i < dtx.parameters.length; i++) {

                var p = new sap.m.Input(that.createId("para_" + i), {
                    value: "01-jan-2016",
                    placeholder: dtx.parameters[i].PARA_DESCRARB
                }).addStyleClass("simpleInput");

                that.mainPage.addContent(p);
            }

            that.colData = dtx;
        });

    },
    createQRToolbar: function () {
        var c = [];
        var that = this;
        c.push(new sap.m.ToolbarSpacer());
        c.push(new sap.m.Button({
                text: "Print",
                press: function (e) {
                    // var jsonData = [];
                    // var rn = that.qv.mTable.getSelectedIndex();
                    // var oBindingInfo = that.qv.mTable.getBindingInfo("rows");
                    // console.log(oBindingInfo);
                    // if (oBindingInfo.binding)
                    //     jsonData = oBindingInfo.binding.oList;
                    // console.log("selected_row:" + rn);
                    // console.log(jsonData[0]);

                    // var divToPrint = document.getElementById(that.qv.mTable.getId());
                    // var divHeader = document.getElementById(that.qv.mTable.getId() + "_h");
                    // $(divHeader).css("display", "table-header-group");
                    //
                    // var newWin = window.open("");
                    // newWin.document.write(divToPrint.innerHTML);
                    // $("<link>", {rel: "stylesheet", href: "css/sapui6/SAPUI6.css"}).appendTo(newWin.document.head);
                    // var el = newWin.document.createElement("<header>");
                    // $(el).text("<h1>Page</h1>");
                    // console.log(Util.objToStr(newWin.document));
                    // newWin.print();
                    //newWin.close();

                    // that.qv.printHtml();
                    that.qv.printHtml();


                }
            })
        )
        ;

        return new sap.m.Toolbar({content: c});
    }

})
;
