sap.ui.define([], function () {
    "use strict";
    var Data = {
        login_users: {
            username: "checking...",
            password:""
        },
        settings: [{
            variable: "autosave",
            value: "true"
        },
            {
                variable: "last_user",
                value: "yus"
            },
            {
                variable: "last_pwd",
                value: "yus"
            }
        ],
        orgs: [
            {
                id: "1",
                username: "yus",
                name: "Home in Pn",
                descr: "Home"
            },
            {
                id: "2",
                username: "yus",
                name: "Grocery shop",
                descr: "Shop 1"
            }
        ],
        users: [
            {
                username: "yus",
                password: "yus"
            }
        ]
    };
    return Data;
});