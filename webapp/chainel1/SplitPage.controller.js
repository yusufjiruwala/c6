sap.ui.controller("chainel1.SplitPage", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf table_v01.Main
     */

    onInit: function () {
    },

    select_profile: function (e) {
        if (this.oFragment === undefined)
            this.oFragment = sap.ui.jsfragment("chainel1.selectProfile", this);
        this.oFragment.open();
    },

    frag_liveChange: function (event) {
        // console.log(event);
        var val = event.getParameter("value");
        var filter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, val);
        var binding = event.getSource().getBinding("items");
        binding.filter(filter);
    },
    frag_confirm: function (event) {
        var val = event.getParameters().selectedItem.getTitle();
        var valx = event.getParameters().selectedItem.getCustomData()[0];
        //console.log(valx);
        //sap.m.MessageToast.show(valx.getKey());
        this.getView().setProfile({"code": valx.getKey(), "name": val});
        sap.ui.getCore().byId("pgDashboardView").refreshData(true);

    },
    //--------------------------------------------------------create-new-menu--group*****
    create_new_group: function () {
        //=------------------ grid to arrange New Input box for

        var strGroup = "";
        var grd = new sap.ui.layout.Grid({
            width: "100%",
            vSpacing: 1,
            hSpacing: 1,
            content: []
        });

        Util.createGrid2Obj(grd, "L4 M4 S12", "L8 M8 S12", "Group Name", sap.m.Input).obj.attachLiveChange(function (o) {
            strGroup = o.getParameters("value").newValue;
        });

//=------------------ dialog....
        var pn = sap.ui.getCore().getModel("settings").getData()["PROFILENO"];
        var sq = "insert into c6_main_groups " +
            " ( code , title , module_name , profiles )  " +
            " values " +
            "( :code , ':title' , ':module_name' , ':profiles' )";

        var dlg = new sap.m.Dialog({
            title: "New Group",
            content: [grd],
            buttons: [new sap.m.Button({
                text: "Create..",
                press: function () {
                    var sqa = sq.replace(":code",
                        "(select nvl(max(to_number(code)),999) +1  from c6_main_groups)");
                    sqa = sqa.replace(":title", strGroup);
                    sqa = sqa.replace(":module_name", strGroup);
                    sqa = sqa.replace(":profiles", "\"0\"," + (pn != "0" ? "\"" + pn + "\"" : ""));
                    var sqx = {
                        sql: sqa,
                        status: "NONE",
                        data: null
                    };
                    Util.doAjaxJson("sqlexe", sqx, false).done(function (data) {
                        if (data.ret != "SUCCESS") {
                            sap.m.MessageToast.show(data.ret);
                            return;
                        }
                        sap.m.MessageToast.show("Group created :" + strGroup);
                        dlg.close();
                    });

                }
            })]
        });
        dlg.open();
    },
    //------------------------------------------------------------create-new-item*******
    create_new_item: function () {
        var view = this.getView();
        var l2 = {span: "L8 M8 S12"},
            l1 = {span: "L4 M4 S12"};

        var grd = new sap.ui.layout.Grid({
            width: "100%",
            vSpacing: 1,
            hSpacing: 1,
            content: []
        });


        var txtGroup = Util.createGrid2Obj(grd, l1, l2, "Group", sap.m.ComboBox);
        var txtParent = Util.createGrid2Obj(grd, l1, l2, "Parent", sap.m.ComboBox);
        var txtCode = Util.createGrid2Obj(grd, l1, l2, "Code", sap.m.Input);
        var txtDescr = Util.createGrid2Obj(grd, l1, l2, "Descr", sap.m.Input);
        var txtExeType = Util.createGrid2Obj(grd, l1, l2, "Execution Type", sap.m.ComboBox);
        var txtExeLine = Util.createGrid2Obj(grd, l1, l2, "Execute Line", sap.m.Input);

        txtGroup.obj.attachSelectionChange(function (ev) {
            Util.fillCombo(txtParent.obj, "select menu_code,menu_title from c6_main_menus where TYPE_OF_EXEC='PARENT' and group_code='" +
                txtGroup.obj.getSelectedKey() +
                "' order by menu_path", false);
            var grp = txtGroup.obj.getSelectedKey();
            var p = txtParent.obj.getSelectedKey();
            Util.doAjaxJson("sqldata", {sql: "select nvl(max(to_number(menu_code)),0)+1 val from c6_main_menus where group_code='" + grp + "' and parent_menucode= '" + p + "'"}, false).done(function (data) {
                var no = JSON.parse("{" + data.data + "}").data[0]['VAL'];
                if (no == 1 || no == "1")
                    no = txtParent.obj.getSelectedKey() + "01";
                txtCode.obj.setValue(no);
            });

        });

        txtParent.obj.attachSelectionChange(function (ev) {
            var grp = txtGroup.obj.getSelectedKey();
            var p = txtParent.obj.getSelectedKey();
            Util.doAjaxJson("sqldata", {sql: "select nvl(max(to_number(menu_code)),0)+1 val from c6_main_menus where group_code='" + grp + "' and parent_menucode= '" + txtParent.obj.getSelectedKey() + "'"}, false).done(function (data) {
                var no = JSON.parse("{" + data.data + "}").data[0]['VAL'];
                if (no == 1 || no == "1")
                    no = txtParent.obj.getSelectedKey() + "01";
                txtCode.obj.setValue(no);
            });
        });

        Util.fillCombo(txtGroup.obj, "select code,title from c6_main_groups order by code", false);
        Util.fillCombo(txtParent.obj, "select menu_code,menu_title from c6_main_menus where TYPE_OF_EXEC='PARENT' and group_code='" +
            txtGroup.obj.getSelectedKey() +
            "' order by menu_path", false);
        Util.fillCombo(txtExeType.obj, [{code: "FORM", title: "FORM"},
            {code: "QUERY", title: "QUERY"},
            {code: "QUICKREP", title: "QUICKREP"},
            {code: "QTREE", title: "QTREE"},
            {code: "PARENT", title: "PARENT"},
            {code: "FUNCTION", title: "FUNCTION"}
        ], true);

        var grpCode = sap.ui.getCore().getModel("selectedP").getData().code;
        Util.setComboValue(txtParent.obj, view.lastSelectedCode);
        Util.setComboValue(txtGroup.obj, grpCode);


        var grp = txtGroup.obj.getSelectedKey();
        var p = txtParent.obj.getSelectedKey();
        Util.doAjaxJson("sqldata", {sql: "select nvl(max(to_number(menu_code)),0)+1 val from c6_main_menus where group_code='" + grp + "' and parent_menucode= '" + txtParent.obj.getSelectedKey() + "'"}, false).done(function (data) {
            var no = JSON.parse("{" + data.data + "}").data[0]['VAL'];
            if (no == 1 || no == "1")
                no = txtParent.obj.getSelectedKey() + "01";
            txtCode.obj.setValue(no);
        });


//--------------------------------------dialog
        var dlg = new sap.m.Dialog({
            title: "New Item",
            content: [grd],
            buttons: [new sap.m.Button({
                text: "Create..",
                press: function () {
                    var menupath = Util.getServerValue("exe?command=get-menu-path&group=" + txtGroup.obj.getSelectedKey() + "&parent=" + txtParent.obj.getSelectedKey() + "&code=" + txtCode.obj.getValue());
                    var pn = sap.ui.getCore().getModel("settings").getData()["PROFILENO"];
                    var sq = "insert into c6_main_menus" +
                        "(GROUP_CODE, MENU_CODE, MENU_TITLE, MENU_TITLEA, " +
                        " TYPE_OF_EXEC, EXEC_LINE, PROFILES," +
                        " PARENT_MENUCODE, CHILDCOUNT, MENU_PATH ) " +
                        " values ( :GROUP_CODE, :MENU_CODE, :MENU_TITLE, :MENU_TITLEA, " +
                        " :TYPE_OF_EXEC, :EXEC_LINE, :PROFILES," +
                        " :PARENT_MENUCODE, :CHILDCOUNT, :MENU_PATH ) ";
                    sq = sq.replace(":GROUP_CODE", "'" + txtGroup.obj.getSelectedKey() + "'");
                    sq = sq.replace(":MENU_CODE", "'" + txtCode.obj.getValue() + "'");
                    sq = sq.replace(":MENU_TITLE", "'" + txtDescr.obj.getValue() + "'");
                    sq = sq.replace(":MENU_TITLEA", "''");
                    sq = sq.replace(":TYPE_OF_EXEC", "'" + txtExeType.obj.getSelectedKey() + "'");
                    sq = sq.replace(":EXEC_LINE", "'" + txtExeLine.obj.getValue() + "'");
                    sq = sq.replace(":PROFILES", "'\"0\"'" + (pn != "0" ? '"' + pn + '"' : ''));
                    sq = sq.replace(":PARENT_MENUCODE", "'" + txtParent.obj.getSelectedKey() + "'");
                    sq = sq.replace(":CHILDCOUNT", "'" + (txtParent.obj.getSelectedKey() == "PARENT" ? "1" : "1") + "'");
                    sq = sq.replace(":MENU_PATH", "'" + menupath + "'");
                    var sq1 = {
                        sql: sq,
                        ret: "NONE",
                        data: null
                    };
                    Util.doAjaxJson("sqlexe", sq1, false).done(function (data) {
                        if (data.ret != "SUCCESS") {
                            sap.m.MessageToast.show("Server Error:" + data.ret);
                            return;
                        }
                        sap.m.MessageToast.show("Saved Successfully");
                        dlg.close();
                        view.setProfile
                    });
                }
            })]
        });
        dlg.open();
    }

})
;