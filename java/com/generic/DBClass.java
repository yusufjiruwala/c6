/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.generic;

import java.io.Serializable;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.swing.JLabel;

/**
 * 
 * @author yusuf
 */
public class DBClass implements Serializable {

	// private String driverClass = "com.mysql.jdbc.Driver";
	private String driverClass = "oracle.jdbc.OracleDriver";
	private String dbUrl = "";

	public String getDbPwd() {
		return dbPwd;
	}

	public String getDbUrl() {
		return dbUrl;
	}

	public String getDbUser() {
		return dbUser;
	}

	public String getDriverClass() {
		return driverClass;
	}

	private String dbUser = "";
	private String dbPwd = "";
	private Connection dbConnection = null;

	public Connection getDbConnection() {
		return dbConnection;
	}

	public void setDbConnection(Connection c) {
		this.dbConnection = c;
	}

	private PreparedStatement ps = null;
	private String sqlString = "";
	private String sqlTable = "";
	private ResultSetMetaData rsm = null;
	private ResultSet rs = null;
	private boolean connected = false;

	public boolean isConnected() {
		return connected;
	}

	public DBClass() {
		try {
			Class.forName(driverClass);
		} catch (ClassNotFoundException ex) {
			Logger.getLogger(DBClass.class.getName()).log(Level.SEVERE, null, ex);
		}
	}

	public DBClass(Connection c) throws SQLException {
		this.dbConnection = c;
		connected = false;
		if (c != null && c.isClosed() != false) {
			connected = false;
		} else {
			connected = true;
		}
	}

	public String getSqlValue(String sq) {
		if (dbConnection != null) {
			try {
				ps = dbConnection.prepareStatement(sq, ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
				ResultSet trs = ps.executeQuery();
				if (trs.first()) {
					String s = trs.getObject(1).toString();
					trs.close();
					ps.close();
					return s;
				} else {
					trs.close();
					ps.close();
				}
			} catch (SQLException ex) {
				Logger.getLogger(DBClass.class.getName()).log(Level.SEVERE, null, ex);
			}
		}
		return "";
	}

	public DBClass(String url, String username, String pwd) throws Exception {
		connected = false;
		dbUrl = url;
		dbUser = username;
		dbPwd = pwd;
		try {
			Class.forName(driverClass);
			dbConnection = DriverManager.getConnection(dbUrl, dbUser, dbPwd);
			connected = true;
		} catch (Exception ex) {
			connected = false;
			Logger.getLogger(DBClass.class.getName()).log(Level.SEVERE, null, ex);
			throw ex;
		}
	}

	public void setSqlString(String sqlstring) {
		this.sqlString = sqlstring;
	}

	public PreparedStatement getStatment() {
		return ps;
	}

	public ResultSet getResultset() {
		return rs;
	}

	public void parseStatment() throws SQLException {
		// if (ps!=null && ps.isClosed()==false) {ps.close();}
		if (dbConnection != null) {
			ps = dbConnection.prepareStatement(sqlString, ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
		} else {
			dbConnection = DriverManager.getConnection(dbUrl, dbUser, dbPwd);
		}
	}

	public void executeStatment() throws SQLException {
		rs = ps.executeQuery();
	}

	public List<String> getColNames() {
		List<String> ls = new ArrayList<String>();
		try {
			parseStatment();
			rs = ps.executeQuery();
			rsm = rs.getMetaData();
			for (int i = 0; i < rsm.getColumnCount(); i++) {
				ls.add(rsm.getColumnName(i + 1));
			}
			// trs.close();
			ps.close();
		} catch (Exception ex) {
			Logger.getLogger(DBClass.class.getName()).log(Level.SEVERE, null, ex);
		}
		return ls;
	}

	public List<qryColumn> getColumnsList() {
		List<qryColumn> lst = new ArrayList<qryColumn>();
		try {
			qryColumn q;
			parseStatment();
			rs = ps.executeQuery();
			rsm = rs.getMetaData();
			for (int i = 0; i < rsm.getColumnCount(); i++) {
				q = new qryColumn(i + 1, rsm.getColumnName(i + 1));
				q.setWidth(rsm.getColumnDisplaySize(i + 1));
				q.setColpos(i);
				q.setColname(rsm.getColumnName(i + 1));
				q.setTitle(rsm.getColumnName(i + 1));
				q.setDatabaseCol(true);
				q.setDisplaySize(rsm.getColumnDisplaySize(i + 1));
				q.setDatatype(rsm.getColumnType(i + 1));

				if (rsm.getColumnType(i + 1) == 19 || rsm.getColumnType(i + 1) == 9 || rsm.getColumnType(i + 1) == 2) {

					q.setAlignmnet(JLabel.RIGHT);
				}
				lst.add(q);
			}
		} catch (SQLException ex) {
			Logger.getLogger(DBClass.class.getName()).log(Level.SEVERE, null, ex);
		}
		return lst;
	}

	public List<Row> convertRows(String filterstring) {
		return convertRows(filterstring, 0);

	}

	public List<Row> convertRows(String filterstring, int nextfetch) {
		List<Row> lsr = new ArrayList<Row>();
		int tmp = 0;
		boolean fnd = true;
		try {
			if (ps == null) {
				return null;
			}
			// parseStatment();
			if (nextfetch <= 0) {
				rs = ps.executeQuery();
				rsm = rs.getMetaData();
			}
			Row r = null;
			rs.beforeFirst();
			while (rs.next() && (nextfetch == 0 || tmp <= nextfetch)) {
				fnd = false;
				r = new Row(rsm.getColumnCount());
				r.setRowStatus(Row.ROW_QUERIED);
				for (int i = 0; i < rsm.getColumnCount(); i++) {
					if ((filterstring == null || filterstring.length() == 0)
							|| (rs.getObject(i + 1) != null && rs.getObject(i + 1).toString().contains(filterstring))) {
						fnd = true;
					}
					if (rs.getObject(i + 1) != null) {
						r.lst.get(i).setValue(rs.getObject(i + 1).toString(), rs.getObject(i + 1));
					} else {
						r.lst.get(i).setValue("", "");
					}

				}
				if (fnd) {
					lsr.add(r);
				}
			}
			// trs.close();
			ps.close();
			return lsr;
		} catch (SQLException ex) {
			Logger.getLogger(DBClass.class.getName()).log(Level.SEVERE, null, ex);
		}
		return null;
	}


}
