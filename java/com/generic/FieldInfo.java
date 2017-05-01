package com.generic;

public class FieldInfo {

	public String fieldName = "";
	public String fieldCaption = "";
	public String fieldType = Parameter.DATA_TYPE_STRING;
	public String fieldListSql = "";
	public Object obj = null;
	public String format = "";
	public String objWidth = "";
	public String valueOnTrue = "";
	public String valueOnFalse = "";
	public Object defaultValue = null;
	public String lookupField="";	

	public FieldInfo(String fieldName, String fieldType) {
		this.fieldName = fieldName;
		this.fieldType = fieldType;

	}

	public FieldInfo(String fieldName, String fieldType, String fieldListSql) {
		this.fieldName = fieldName;
		this.fieldType = fieldType;
		this.fieldType = fieldListSql;

	}

	public FieldInfo(String fieldName) {
		this.fieldName = fieldName;
	}

}
