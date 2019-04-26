sap.ui.jsfragment("forms.lg.JO", {

    createContent: function (oController) {
        var that = this;
        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: [new sap.m.Input({value: "Welcome.!"}),
                new sap.m.Button({
                    text: "click here..!",
                    press: function () {

                        var v = that.qv.getControl().getModel().getData();
                        var m = that.qv.mLctb.formatMetadata();
                        var mc=new LocalTableData(that.qv.mLctb.cols.length);
                        mc.parse("{" + m + ",\"data\":" + JSON.stringify(v) + "}");
                        console.log(mc.format());
                    }
                })
            ]
        });
        this.createView();
        return this.mainPage;
    },
    createView: function () {
        var that = this;
        this.qv = new QueryView("test");
        var sq = "select reference,descr from items  where reference like 'K400%OPC%' order by descr2";
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            that.qv.setJsonStr("{" + data.data + "}");
            that.qv.mLctb.cols[0].mColClass = "sap.m.Input";
            that.qv.loadData();
        });
        this.mainPage.addContent(this.qv.getControl());
    }
});



