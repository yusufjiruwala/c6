package com.generic;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Parameter implements Serializable {
	public static final String DATA_TYPE_STRING = "STRING";
	public static final String DATA_TYPE_DATE = "DATE";
	public static final String DATA_TYPE_DATETIME = "DATETIME";
	public static final String DATA_TYPE_NUMBER = "NUMBER";

	private String name = "";
	private String description = "";
	private Object defaultValue = null;
	private Object value = null;
	private String valueDescription = "";
	private String valueType = "STRING";
	private String lovsql = "";
	private List<dataCell> lov = new ArrayList<dataCell>();
	private Object UIObject = null;
	public String operator = "";
	public String val_on_check = "Y";
	public String val_on_uncheck = "N";

	public String getValueDescription() {
		return valueDescription;
	}

	public void setValueDescription(String valueDescription) {
		this.valueDescription = valueDescription;
	}

	public Object getUIObject() {
		return UIObject;
	}

	public void setUIObject(Object uIObject) {
		UIObject = uIObject;
	}

	public List<dataCell> getLov() {
		return lov;
	}

	public List<dataCell> getLovList() {
		return lov;
	}

	public String getLovsql() {
		return lovsql;
	}

	public void setLovsql(String lovsql) {
		this.lovsql = lovsql;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
		if (this.description.length() <= 0) {
			this.description = name;
		}
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Object getDefaultValue() {
		return defaultValue;
	}

	public void setDefaultValue(Object defaultValue) {
		this.defaultValue = defaultValue;
	}

	public Object getValue() {
		return value;
	}

	public void setValue(Object value) {
		setValue(value, true);
	}

	public String getValueType() {
		return valueType;
	}

	public void setValueType(String valueType) {
		this.valueType = valueType;
	}

	public void setValue(Object value, boolean keepdefault) {
		this.value = value;
		if (keepdefault) {
			this.setDefaultValue(value);
		}
	}

	public Parameter(String nm) {
		this.name = nm.toUpperCase().trim();
	}

	public Parameter(String nm, Object value) {
		this.name = nm.toUpperCase().trim();
		this.value = value;
		this.description = nm;
	}

	public Parameter(String nm, Object value, String descr) {
		this.name = nm.toUpperCase().trim();
		this.value = value;
		this.description = descr;

	}

	public Parameter(String nm, Object value, String descr, dataCell... dcs) {
		this.name = nm.toUpperCase().trim();
		this.value = value;
		this.description = descr;
		for (int i = 0; i < dcs.length; i++)
			lov.add(dcs[i]);
	}
}
