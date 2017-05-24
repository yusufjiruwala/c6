package com.tools.utilities;

public class SQLJson {

	private String sql = "";
	private String ret = "NONE";
	private String data = "";

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public String getSql() {
		return sql;
	}

	public void setSql(String sql) {
		this.sql = sql;
	}

	public String getRet() {
		return this.ret;
	}

	public void setRet(String ret) {
		this.ret = ret;
	}

	@Override
	public String toString() {
		return "SQLJson [sql=" + sql + ", ret=" + ret + " , data=" + data + "]";
	}

}
