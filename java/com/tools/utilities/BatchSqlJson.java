package com.tools.utilities;

public class BatchSqlJson {

	private String sql = "";
	private String ret = "NONE";
	private String data = "";
	private String repCode = "";
	private int repNo = -1;
	private String command = "";
	private String scheduledAt = "";
	private String p1 = "";
	private String p2 = "";
	private String whereClause="";
	private int qrNo = -1;

	
	
	public String getWhereClause() {
		return whereClause;
	}

	public void setWhereClause(String whereClause) {
		this.whereClause = whereClause;
	}

	public int getQrNo() {
		return qrNo;
	}

	public void setQrNo(int qrNo) {
		this.qrNo = qrNo;
	}

	public String getCommand() {
		return command;
	}

	public void setCommand(String command) {
		this.command = command;
	}

	public String getScheduledAt() {
		return scheduledAt;
	}

	public void setScheduledAt(String scheduledAt) {
		this.scheduledAt = scheduledAt;
	}

	public String getP1() {
		return p1;
	}

	public void setP1(String p1) {
		this.p1 = p1;
	}

	public String getP2() {
		return p2;
	}

	public void setP2(String p2) {
		this.p2 = p2;
	}

	public String getRepCode() {
		return repCode;
	}

	public void setRepCode(String repCode) {
		this.repCode = repCode;
	}

	public int getRepNo() {
		return repNo;
	}

	public void setRepNo(int repNo) {
		this.repNo = repNo;
	}

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
