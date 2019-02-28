sap.ui.define([], function () {
    'use strict'
    function Parameter() {
        this.DATA_TYPE_STRING = "STRING";
        this.DATA_TYPE_DATE = "DATE";
        this.DATA_TYPE_DATETIME = "DATETIME";
        this.DATA_TYPE_NUMBER = "NUMBER";
        this._lov = [];
        this._name = "";
        this._description = "";
        this._default_value = "";
        this._value = null;
        this._operator = "";
        this._valueType = this.DATA_TYPE_STRING;
        this._val_on_check = "Y";
        this._val_on_uncheck = "N";
        this.description = "";
    }
    Parameter.create=function (name,value) {
        var a=new Parameter();
        a.value=value;
        a.name=name;
        return a;
    }

    Parameter.prototype.constructor = Parameter;

    Object.defineProperty(Parameter.prototype, "val_on_check", {
        get: function () {
            return this._val_on_check;
        },
        set: function (value) {
            this._val_on_check = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parameter.prototype, "val_on_uncheck", {
        get: function () {
            return this._val_on_uncheck;
        },
        set: function (value) {
            this._val_on_uncheck = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parameter.prototype, "lov", {
        get: function () {
            return this._lov;
        },
        set: function (value) {
            this._lov = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parameter.prototype, "default_value", {
        get: function () {
            return this._default_value;
        },
        set: function (value) {
            this._default_value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parameter.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parameter.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parameter.prototype, "description", {
        get: function () {
            return this._description;
        },
        set: function (value) {
            this._description = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parameter.prototype, "operator", {
        get: function () {
            return this._operator;
        },
        set: function (value) {
            this._operator = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parameter.prototype, "valueType", {
        get: function () {
            return this._valueType;
        },
        set: function (value) {
            this._valueType = value;
        },
        enumerable: true,
        configurable: true
    });
    return Parameter;
});



