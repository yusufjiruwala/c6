package com.generic;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QueryExe {
	Map<String, Parameter> mapParameters = new HashMap<String, Parameter>();
	private int rowsAffected = 0;

	private String sqlStr = "";
	private Connection con = null;
	PreparedStatement ps_exe = null;

	public String getSqlStr() {
		return sqlStr;
	}

	public void setSqlStr(String sqlStr) {
		this.sqlStr = sqlStr;
	}

	public Connection getCon() {
		return con;
	}

	public void setCon(Connection con) {
		this.con = con;
	}

	public Map<String, Parameter> getMapParas() {
		return mapParameters;
	}

	public void setParaValue(String paraname, Object val) {
		String pnm = paraname.trim();
		Object vl = val;
		if (vl == null) {
			mapParameters.put(pnm.toUpperCase(), new Parameter(pnm, null));
		}
		if (vl instanceof dataCell) {
			vl = ((dataCell) val).getValue();
		}

		if (mapParameters.get(pnm.toUpperCase()) == null) {
			mapParameters.put(pnm.toUpperCase(), new Parameter(pnm, vl));
		} else {
			mapParameters.get(pnm.toUpperCase()).setValue(vl);
		}

		if (vl instanceof Number || vl instanceof BigDecimal || vl instanceof Float) {
			mapParameters.get(pnm.toUpperCase()).setValueType(Parameter.DATA_TYPE_NUMBER);
		}
		if (vl instanceof java.sql.Date || vl instanceof java.util.Date) {
			mapParameters.get(pnm.toUpperCase()).setValueType(Parameter.DATA_TYPE_DATE);
		}

		if (vl instanceof java.sql.Timestamp) {
			mapParameters.get(pnm.toUpperCase()).setValueType(Parameter.DATA_TYPE_DATETIME);
		}

	}

	public QueryExe() {

	}

	public String AutoGenerateInsertStatment(String table_name) {
		if (mapParameters.size() <= 0) {
			sqlStr = "";
			return "";
		}
		String cols = "";
		String pars = "";
		List<String> lst = new ArrayList<String>(mapParameters.keySet());
		for (int i = 0; i < lst.size(); i++) {
			cols = cols + (cols.isEmpty() ? "" : " , ") + lst.get(i);
			pars = pars + (pars.isEmpty() ? "" : " , ") + ":" + lst.get(i);
		}
		sqlStr = "insert into " + table_name + " (" + cols + ") values (" + pars + ")";
		return sqlStr;
	}

	public String AutoGenerateUpdateStatment(String table_name, String exclude_col, String where_col) {
		if (mapParameters.size() <= 0) {
			sqlStr = "";
			return "";
		}
		String cols = "";
		String pars = "";
		List<String> lst = new ArrayList<String>(mapParameters.keySet());
		for (int i = 0; i < lst.size(); i++) {
			if (!exclude_col.contains("'" + lst.get(i) + "'")) {
				cols = cols + (cols.isEmpty() ? "" : " , ") + (lst.get(i) + " = :" + lst.get(i));
			}
		}
		sqlStr = "update " + table_name + " set " + cols + where_col + " ";
		return sqlStr;
	}

	public QueryExe(String sql) {
		this.sqlStr = sql;
	}

	public QueryExe(Connection con) {
		this.con = con;
	}

	public QueryExe(String sql, Connection con) {
		this.con = con;
		this.sqlStr = sql;
	}

	public void execute() throws SQLException {
		execute(true);
	}

	public void execute(String sql) {
		this.sqlStr = sql;
	}

	public void parse() throws SQLException {
		ps_exe = con.prepareStatement(utils.replaceParameters(sqlStr), ResultSet.TYPE_SCROLL_SENSITIVE,
				ResultSet.CONCUR_READ_ONLY);
	}

	public void execute(boolean parse) throws SQLException {
		rowsAffected = -1;
		if (con == null) {
			return;
		}
		if (parse) {
			ps_exe = con.prepareStatement(utils.replaceParameters(sqlStr.replaceAll("\n", " ").replaceAll("\r", " ")),
					ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
		}
		utils.setParams(sqlStr, ps_exe, mapParameters);
		rowsAffected = ps_exe.executeUpdate();
	}

	public ResultSet executeRS() throws SQLException {
		return executeRS(true);
	}

	public ResultSet executeRS(boolean parse) throws SQLException {
		rowsAffected = -1;
		if (con == null) {
			return null;
		}
		if (parse) {
			ps_exe = con.prepareStatement(utils.replaceParameters(sqlStr), ResultSet.TYPE_SCROLL_INSENSITIVE,
					ResultSet.CONCUR_READ_ONLY);
		}		
		utils.setParams(sqlStr, ps_exe, mapParameters);		
		ResultSet rst = ps_exe.executeQuery();
		
		return rst;
	}

	public void close() throws SQLException {
		if (ps_exe != null) {
			ps_exe.close();
		}
	}

	public static int execute(String sql, Connection con, Parameter... pm) throws SQLException {
		QueryExe qe = new QueryExe(sql, con);
		if (pm != null && pm.length > 0) {
			for (Parameter pms : pm)
				qe.setParaValue(pms.getName(), pms.getValue());
		}
		qe.execute();
		qe.close();
		return qe.rowsAffected;
	}

	public static Object getSqlValue(String sql, Connection con, Object nvlObj, Parameter... pm) throws SQLException {
		QueryExe qe = new QueryExe(sql, con);
		if (pm != null && pm.length > 0) {
			for (Parameter pms : pm)
				qe.setParaValue(pms.getName(), pms.getValue());
		}
		Object value = null;
		ResultSet rs = qe.executeRS();
		if (rs != null && rs.first())
			value = rs.getObject(1);
		qe.close();
		return utils.nvlObj(value, nvlObj);
	}

	public static ResultSet getSqlRS(String sql, Connection con, Parameter... pm) throws SQLException {
		QueryExe qe = new QueryExe(sql, con);
		if (pm != null && pm.length > 0) {
			for (Parameter pms : pm)
				qe.setParaValue(pms.getName(), pms.getValue());
		}
		ResultSet rs = qe.executeRS();
		if (rs != null && rs.first())
			return rs;
		qe.close();		
		return null;
	}
}
