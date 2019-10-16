/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.generic;

import java.io.BufferedReader;
import java.io.FileReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.swing.JLabel;

import org.apache.commons.lang3.StringEscapeUtils;

import com.controller.InstanceInfo;

/**
 * 
 * @author yusuf
 */
public class utils {

	public static Connection dbConn = null;
	private static final String PREFIX = "/WEB-INF/reports/";
	private static final String SUFFIX = ".jasper";
	public static final String textCompanyName = "CHAINEL BI Suites";
	public static final String textSpec1 = "Reports & Management";
	public static final String textSpec2 = "http://www.chain-el.com";
	public static String DBURL = "";
	public static String DBUSER = "";
	public static String DBPWD = "";
	public static String CPUSER = "";
	public static String CPPWD = "";
	public static String COMPANY_NAME = "";
	public static String COMPANY_SPECS = "";
	public static String COMPANY_NAMEA = "";
	public static String COMPANY_SPECSA = "";

	// public static String CURRENT_MENU_CODE = "";
	// public static String CURRENT_MENU_NAME = "";
	public static Map<String, Object> mapParaSave = new HashMap<String, Object>();
	public static String regx_word = "(\\\"[A-Za-z0-9\\.\\+\\-\\>\\<\\=\\@\\%\\(\\) ]+\\\")|([A-Za-z0-9\\.\\+\\-\\>\\<\\=\\@\\%\\(\\)]+)";

	public static final int ALIGN_LEFT = 1;
	public static final int ALIGN_RIGHT = 2;
	public static final int ALIGN_CENTER = 3;
	public static final String FORMAT_MONEY = "#,##0.000;(#,##0.000)";
	public static final String FORMAT_QTY = "#,##0.##;(#,##0.##)";
	public static final String FORMAT_SHORT_DATE = "dd/MM/yyyy";

	public static final String O1_1 = "expand=0.4";
	public static final String O1_2 = "expand=3.6";

	public static final String OO1_1 = "expand=0.8";
	public static final String OO1_2 = "expand=3.2";

	public static final String O2_1 = "expand=0.4";
	public static final String O2_2 = "expand=1";
	public static final String O2_3 = "expand=0.4";
	public static final String O2_4 = "expand=2.2";

	public static final String OO2_1 = "expand=0.8";
	public static final String OO2_2 = "expand=1.2";
	public static final String OO2_3 = "expand=0.8";
	public static final String OO2_4 = "expand=1.2";

	public static final String O3_1 = "expand=0.4";
	public static final String O3_2 = "expand=1";
	public static final String O3_3 = "expand=0.4";
	public static final String O3_4 = "expand=1";
	public static final String O3_5 = "expand=0.4";
	public static final String O3_6 = "expand=1";

	public static void setConnection(Connection c) {
		dbConn = c;
	}

	public static Connection getConnection() {
		return dbConn;
	}

	public static int countString(String str, String strcount) {
		int cnt = 0;
		for (int i = 0; i < str.length(); i++) {
			if (str.charAt(i) == strcount.charAt(0)) {
				cnt++;
			}

		}
		return cnt;
	}

	public static void FillLov(List<dataCell> c, String sqlString, Connection con) throws SQLException {
		c.clear();
		ResultSet rs = utils.getSqlRS(sqlString, con);
		if (rs == null) {
			return;
		}
		rs.beforeFirst();
		while (rs.next()) {
			c.add(new dataCell(rs.getString(2), rs.getString(1)));
		}
		if (rs != null) {
			rs.getStatement().close();
		}
	}

	public static String generateCustomerTanetsPath(String parent, String cod) {
		if (dbConn == null) {
			return null;
		}

		String p = getSqlValue("select path from TANENTS where code='" + parent + "'", dbConn);
		if (p == null || p.length() == 0) {
			p = "XXX\\" + cod + "\\";
		} else {
			if (p.endsWith("\\" + cod + "\\")) {
				return p;
			}

			p = p + cod + "\\";
		}

		return p;
	}

	public static String generatePath(String parent, String cod, String tableName, String coddCol, String pathCol,
			Connection con) {
		dbConn = con;
		if (dbConn == null) {
			return null;
		}

		String p = getSqlValue(
				"select " + pathCol + " from " + tableName + " where " + coddCol + "='" + utils.nvl(parent, "") + "'",
				dbConn);
		if (p == null || p.length() == 0) {
			p = "XXX\\" + cod + "\\";
		} else {
			if (p.endsWith("\\" + cod + "\\")) {
				return p;
			}
			p = p + cod + "\\";
		}

		return p;
	}

	public static String XgenerateAccPath(String parent, String cod, Connection con) {
		dbConn = con;
		if (dbConn == null) {
			return null;
		}

		String p = getSqlValue("select path from ACACCOUNT where ACCNO='" + utils.nvl(parent, "") + "'", dbConn);
		if (p == null || p.length() == 0) {
			p = "XXX\\" + cod + "\\";
		} else {
			if (p.endsWith("\\" + cod + "\\")) {
				return p;
			}
			p = p + cod + "\\";
		}

		return p;
	}

	public static String XgenerateItemPath(String parent, String cod, Connection con) {
		dbConn = con;
		if (dbConn == null) {
			return null;
		}

		String p = getSqlValue("select descr2 from items where reference='" + utils.nvl(parent, "") + "'", dbConn);
		if (p == null || p.length() == 0) {
			p = "XXX\\" + cod + "\\";
		} else {
			if (p.endsWith("\\" + cod + "\\")) {
				return p;
			}
			p = p + cod + "\\";
		}

		return p;
	}

	public static String getNewAccNo(String parentacc, Connection con) {
		String sql = "select to_number(nvl(max(accno),'0')) from acaccount where  (parentacc='" + parentacc + "')";
		String p = getSqlValue(sql, con);

		if (p.equals("0")) {
			p = parentacc + "001";
		} else {
			p = String.valueOf((Integer.valueOf(p)) + 1);
		}

		return p;
	}

	public static String getNewNo(String sql, String parentacc, Connection con) {
		// String sql =
		// "select to_number(nvl(max(accno),'0')) from acaccount where
		// (parentacc='"
		// + parentacc + "')";
		String p = getSqlValue(sql, con);
		if (p == "") {
			return "";
		}
		if (p.equals("0")) {
			p = parentacc + "001";
		} else {
			p = String.valueOf((Integer.valueOf(p)) + 1);
		}

		return p;
	}

	public static String generateMenuPath(String group, String parent, String cod, Connection dbConn) {
		if (dbConn == null) {
			return null;
		}

		String p = getSqlValue(
				"select menu_path from c6_main_menus where menu_code='" + parent + "' and group_code='" + group + "'",
				dbConn);
		if (p == null || p.length() == 0) {
			p = "XXX\\" + cod + "\\";
		} else {
			if (p.endsWith("\\" + cod + "\\")) {
				return p;
			}

			p = p + cod + "\\";
		}

		return p;
	}

	public static int execSql(String sqlstr, Connection con) throws SQLException {
		PreparedStatement st = con.prepareStatement(sqlstr, ResultSet.TYPE_SCROLL_SENSITIVE,
				ResultSet.CONCUR_READ_ONLY);
		int x = st.executeUpdate();
		st.close();
		return x;

	}

	public static String getSqlValue(String sqlstr, Connection con) {
		dbConn = con;
		ResultSet rs = null;
		PreparedStatement st = null;
		String s = "";
		try {
			st = con.prepareStatement(sqlstr, ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
			rs = st.executeQuery();
			if (rs.first()) {
				s = "";
				if (rs.getObject(1) != null) {
					s = rs.getObject(1).toString();
				}

				rs.close();
				st.close();
				return s;
			} else {
				rs.close();
				st.close();
				return "";
			}

		} catch (Exception e) {
			Logger.getLogger(utils.class.getName()).log(Level.SEVERE, null, e);
		} finally {
			try {
				if (st != null) {
					st.close();
				}
			} catch (SQLException ex) {
				Logger.getLogger(utils.class.getName()).log(Level.SEVERE, null, ex);
			}
		}
		return "";
	}

	public static ResultSet getSqlRS(String sqlstr, Connection con) {
		dbConn = con;
		ResultSet rs = null;
		String s = "";
		try {
			PreparedStatement st = con.prepareStatement(sqlstr, ResultSet.TYPE_SCROLL_SENSITIVE,
					ResultSet.CONCUR_READ_ONLY);
			rs = st.executeQuery();
			if (rs.first()) {
				s = "";
				return rs;
			} else {
				rs.close();
				st.close();
				return null;
			}

		} catch (Exception e) {
			Logger.getLogger(utils.class.getName()).log(Level.SEVERE, null, e);
		} finally {
		}

		return null;
	}

	public static qryColumn findColByName(String coname, List<qryColumn> lqc) {
		qryColumn qc = null;
		if (lqc == null) {
			return null;
		}

		for (int i = 0; i < lqc.size(); i++) {
			qc = lqc.get(i);
			if (coname.toUpperCase().equals(qc.getColname().toUpperCase())) {
				return qc;
			}

		}
		return null;
	}

	public static Parameter findParaByName(String coname, List<Parameter> lqc) {
		Parameter qc = null;
		if (lqc == null) {
			return null;
		}
		for (int i = 0; i < lqc.size(); i++) {
			qc = lqc.get(i);
			if (coname.toUpperCase().equals(qc.getName().toUpperCase())) {
				return qc;
			}

		}

		return null;
	}

	public static List<dataCell> getListOfValues(String sql, Connection con) throws SQLException {
		ResultSet rs = utils.getSqlRS(sql, con);
		List<dataCell> dc = new ArrayList<dataCell>();
		if (rs != null) {
			rs.beforeFirst();
			while (rs.next()) {
				dc.add(new dataCell(rs.getString(2), rs.getString(1)));
			}
		}
		if (rs.getStatement() != null) {
			rs.getStatement().close();
		}
		return dc;
	}

	public static List<qryColumn> getColumnsList(PreparedStatement ps) {
		List<qryColumn> lst = new ArrayList<qryColumn>();
		try {
			qryColumn q;
			ResultSet rs = ps.executeQuery();
			ResultSetMetaData rsm = rs.getMetaData();
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
			Logger.getLogger(utils.class.getName()).log(Level.SEVERE, null, ex);
		}
		return lst;
	}

	public static List<qryColumn> getColumnsList(ResultSet rs) {
		List<qryColumn> lst = new ArrayList<qryColumn>();
		try {
			qryColumn q;
			ResultSetMetaData rsm = rs.getMetaData();
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
			Logger.getLogger(utils.class.getName()).log(Level.SEVERE, null, ex);
		}
		return lst;
	}

	public static List<Row> convertRows(ResultSet rsp, String filterstring) throws SQLException {
		List<Row> lsr = new ArrayList<Row>();
		int tmp = 0;
		if (rsp == null)
			return null;
		ResultSetMetaData rsm = null;
		ResultSet rs = null;

		rs = rsp;

		DataFilter df = new DataFilter();
		localTableModel datax = new localTableModel();
		boolean fnd = true;

		try {
			// if (ps == null) {
			// return null;
			// }
			// rs = ps.executeQuery();
			rsm = rs.getMetaData();

			if (filterstring != null && filterstring.length() > 0) {
				df.filterStr = filterstring;
				try {
					df.buildDataStructure();
				} catch (Exception e) {
					e.printStackTrace();
					throw new SQLException(e.getMessage());
				}
				datax.setCols(rsm.getColumnCount());
				datax.getQrycols().addAll(utils.getColumnsList(rs));
				datax.getVisbleQrycols().addAll(datax.getQrycols());
			}

			Row r = null;
			rs.beforeFirst();
			while (rs.next()) {
				fnd = false;
				r = new Row(rsm.getColumnCount());
				for (int i = 0; i < rsm.getColumnCount(); i++) {
					if (rs.getObject(i + 1) != null) {
						r.lst.get(i).setValue(rs.getObject(i + 1).toString(), rs.getObject(i + 1));
					} else {
						r.lst.get(i).setValue("", null);
					}

				}
				if (filterstring == null || filterstring.length() == 0) {
					fnd = true;
				}
				if (filterstring != null && filterstring.length() > 0) {
					fnd = df.canFilterRow(r, datax);
				}

				if (fnd) {
					lsr.add(r);
				}
			}
			// trs.close();
			// ps.close();
			return lsr;
		} catch (SQLException ex) {
			Logger.getLogger(DBClass.class.getName()).log(Level.SEVERE, null, ex);
		}
		return null;
	}

	public static void readVars(Map<String, Object> mapVariables, String FileName) throws Exception {
		Scanner s = new Scanner(new BufferedReader(new FileReader(FileName)));
		Scanner ss = null;
		String var = "", val = "";
		while (s.hasNextLine()) {
			String a = s.nextLine();
			ss = new Scanner(a).useDelimiter("\\s*=\\s*");
			var = ss.next();
			val = ss.next();
			mapVariables.put(var, val);
		}
		s.close();
	}

	public static void readVarsFromString(Map<String, String> mapVariables, String string, String splitChar) {
		String[] strs = string.split(splitChar);
		Scanner ss = null;
		String var = "", val = "";
		for (int i = 0; i < strs.length; i++) {
			String a = strs[i];
			ss = new Scanner(a).useDelimiter("\\s*=\\s*");
			var = ss.next();
			val = ss.next();
			mapVariables.put(var.trim(), val.trim());
		}

	}

	public static List<Parameter> convertFromColumns(List<qryColumn> qclist) {
		List<Parameter> lst = new ArrayList<Parameter>();
		for (Iterator iterator = qclist.iterator(); iterator.hasNext();) {
			qryColumn qc = (qryColumn) iterator.next();
			Parameter pm = new Parameter(qc.getColname());
			pm.setDescription(qc.getTitle());
			pm.setValueType(Parameter.DATA_TYPE_STRING);
			if (qc.getDatatype() == java.sql.Types.TIMESTAMP) {
				pm.setValueType(Parameter.DATA_TYPE_DATE);
			}
			if (qc.isNumber()) {
				pm.setValueType(Parameter.DATA_TYPE_NUMBER);
			}

			lst.add(pm);
		}
		return lst;
	}

	public static String nvl(Object vl1, Object vl2) {
		if (vl1 == null || vl1.toString().length() == 0) {
			if (vl2 == null) {
				return null;
			}
			return vl2.toString();
		}
		if (vl1 == null) {
			return "";
		}
		return vl1.toString();
	}

	public static Object nvlObj(Object vl1, Object vl2) {
		if (vl1 == null || vl1.toString().length() == 0) {
			if (vl2 == null) {
				return null;
			}
			return vl2;
		}
		if (vl1 == null) {
			return null;
		}
		return vl1;
	}

	public static void setParams(String sq, PreparedStatement ps, Map<String, Parameter> mapParameters)
			throws SQLException {

		int parano = 1;
		String pnm = getParamName(sq, 1);
		while (pnm.length() > 0) {
			pnm = getParamName(sq, parano);
			pnm = pnm.toUpperCase().trim();
			if (pnm.length() > 0) {
				if (mapParameters.get(pnm) == null)
					System.out.println(pnm + " parameter is not exist !");

				if (mapParameters.get(pnm).getValueType().equals(Parameter.DATA_TYPE_STRING)) {
					if (mapParameters.get(pnm).getValue() != null) {
						ps.setString(parano, (String) mapParameters.get(pnm).getValue());
					} else {
						ps.setString(parano, "");
					}
				}

				if (mapParameters.get(pnm).getValueType().equals(Parameter.DATA_TYPE_DATE)) {
					if (mapParameters.get(pnm).getValue() != null) {
						java.sql.Date jdt = null;
						if (mapParameters.get(pnm).getValue() instanceof java.util.Date) {
							jdt = new java.sql.Date(((java.util.Date) mapParameters.get(pnm).getValue()).getTime());
						}
						ps.setDate(parano, jdt);
					} else {
						ps.setDate(parano, null);
					}
				}

				if (mapParameters.get(pnm).getValueType().equals(Parameter.DATA_TYPE_DATETIME)) {
					if (mapParameters.get(pnm).getValue() != null) {
						java.sql.Timestamp jdt = null;
						if (mapParameters.get(pnm).getValue() instanceof java.util.Date) {
							jdt = new java.sql.Timestamp(
									((java.util.Date) mapParameters.get(pnm).getValue()).getTime());
						}
						ps.setTimestamp(parano, jdt);
					} else {
						ps.setTimestamp(parano, null);
					}
				}

				if (mapParameters.get(pnm).getValueType().equals(Parameter.DATA_TYPE_NUMBER)) {
					if (mapParameters.get(pnm).getValue() != null) {
						if (mapParameters.get(pnm).getValue() instanceof Number) {
							ps.setDouble(parano, ((Number) mapParameters.get(pnm).getValue()).doubleValue());
						} else {
							ps.setString(parano, (mapParameters.get(pnm).getValue()).toString());
						}
					} else {
						ps.setString(parano, "");
					}
				}
			}
			parano++;
		}
	}

	public static String getParamName(String s, int no) {
		String tmp = "";
		int n = 0;
		for (int i = 0; i < s.length(); i++) {
			tmp = "";
			if (s.charAt(i) == ':' && !s.substring(i, i + 2).equals(":=") && !s.substring(i, i + 2).equals(":/")) {
				n++;
				i++;
				while (i < s.length() && s.charAt(i) != '\n' && s.charAt(i) != ' ' && s.charAt(i) != '='
						&& s.charAt(i) != ')' && s.charAt(i) != '(' && s.charAt(i) != ';' && s.charAt(i) != ',') {
					tmp = tmp + String.valueOf(s.charAt(i));
					i++;
				}
			}
			if (n == no) {
				break;
			} else {
				tmp = "";
			}
		}
		return tmp;
	}

	public static String replaceParameters(String s) {
		return replaceParameters(s, "?");
	}

	public static String replaceParameters(String s, String r) {
		String tmp = "";
		String nexts = r;
		for (int i = 0; i < s.length(); i++) {
			nexts = String.valueOf(s.charAt(i));
			if (s.charAt(i) == ':' && !s.substring(i, i + 2).equals(":=") && !s.substring(i, i + 2).equals(":/")) {
				nexts = r + " ";
				while (i < s.length() && s.charAt(i) != '\n' && s.charAt(i) != '\r' && s.charAt(i) != ' ') {
					i++;
					if (i == s.length()) {
						break;
					}
					if (s.charAt(i) == '=') {
						nexts = r + "=";
						break;
					}
					if (s.charAt(i) == ')') {
						nexts = r + ")";
						break;
					}
					if (s.charAt(i) == '(') {
						nexts = r + "(";
						break;
					}
					if (s.charAt(i) == ';') {
						nexts = r + ";";
						break;
					}
					if (s.charAt(i) == ',') {
						nexts = r + ",";
						break;
					}

				}

			}
			tmp = tmp + nexts;
		}
		return tmp;

	}

	public static String clearParameters(String s) {
		String r = "";
		String tmp = "";
		String nexts = r;
		for (int i = 0; i < s.length(); i++) {
			nexts = String.valueOf(s.charAt(i));
			if (s.charAt(i) == ':' && !s.substring(i, i + 2).equals(":=")) {
				nexts = r + " ";
				while (i < s.length() && s.charAt(i) != '\n' && s.charAt(i) != '\r' && s.charAt(i) != ' ') {
					i++;
					if (i == s.length()) {
						break;
					}
					if (s.charAt(i) == '=') {
						nexts = r + "=";
						break;
					}
					if (s.charAt(i) == ')') {
						nexts = r + ")";
						break;
					}
					if (s.charAt(i) == '(') {
						nexts = r + "(";
						break;
					}
					if (s.charAt(i) == ';') {
						nexts = r + ";";
						break;
					}
					if (s.charAt(i) == ',') {
						nexts = r + ",";
						break;
					}

				}

			}
			tmp = tmp + nexts;
		}
		return tmp;

	}

	public static String getOraDateValue(String dt) {
		return "to_date('" + dt + "','" + FORMAT_SHORT_DATE + "')";
	}

	public static String getOraDateValue(Timestamp dt) {
		return "to_date('" + (new SimpleDateFormat(FORMAT_SHORT_DATE)).format(dt) + "','DD/MM/RRRR')";
	}

	public static String getOraDateValue(Date dt) {
		return "to_date('" + (new SimpleDateFormat(FORMAT_SHORT_DATE)).format(dt) + "','DD/MM/RRRR')";
	}

	public static List<String> upperCaseAllListValue(List<String> listGroupSum) {
		List<String> lst = new ArrayList<String>();
		for (Iterator iterator = listGroupSum.iterator(); iterator.hasNext();) {
			String string = (String) iterator.next();
			lst.add(string.toUpperCase());
		}
		return lst;
	}

	public static int noOfCountInString(String str, String cntStr) {
		int cnt = 0;
		for (int i = 0; i < str.length(); i++) {
			if (cntStr.equals(str.substring(i, i + 1))) {
				cnt++;
			}

		}
		return cnt;
	}

	public static void accessSavedParas(List<Parameter> toParas) {
		for (Iterator iterator = toParas.iterator(); iterator.hasNext();) {

			Parameter pm = (Parameter) iterator.next();
			if (mapParaSave.get(pm.getName()) != null) {
				Object toval = mapParaSave.get(pm.getName());
				if (toval instanceof java.util.Date && pm.getValueType().equals(Parameter.DATA_TYPE_DATE)) {
					pm.setValue(toval);
				}
				if (toval instanceof java.lang.String && pm.getValueType().equals(Parameter.DATA_TYPE_STRING)) {
					pm.setValue(toval);
				}
				if (toval instanceof Number && pm.getValueType().equals(Parameter.DATA_TYPE_NUMBER)) {
					pm.setValue(toval);
				}

			}

		}
	}

	public static void accessSavedParas(Parameter pm) {
		if (mapParaSave.get(pm.getName()) != null) {
			Object toval = mapParaSave.get(pm.getName());
			if (toval instanceof java.util.Date && pm.getValueType().equals(Parameter.DATA_TYPE_DATE)) {
				pm.setValue(toval);
			}
			if (toval instanceof java.util.Date && pm.getValueType().equals(Parameter.DATA_TYPE_DATETIME)) {
				pm.setValue(toval);
			}

			if (toval instanceof java.lang.String && pm.getValueType().equals(Parameter.DATA_TYPE_STRING)) {
				pm.setValue(toval);
			}
			if (toval instanceof Number && pm.getValueType().equals(Parameter.DATA_TYPE_NUMBER)) {
				pm.setValue(toval);
			}

		}
	}

	public static void putSavedParas(String nm, Object vl) {
		if (vl != null) {
			mapParaSave.put(nm, vl);
		} else {
			mapParaSave.remove(nm);
		}
	}

	public static int comparDataCell(dataCell othis, dataCell o) {
		int result = 0;
		if (o.getValue() instanceof String) {
			result = othis.getValue().toString().compareTo(o.getValue().toString());
		}
		if (o.getValue() instanceof Number) {
			if (((Number) othis.getValue()).doubleValue() > ((Number) o.getValue()).doubleValue()) {
				result = 1;
			}
			if (((Number) othis.getValue()).doubleValue() < ((Number) o.getValue()).doubleValue()) {
				result = -1;
			}

		}

		return result;
	}

	public static int daysBetween(Date d1, Date d2) {
		return (int) ((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
	}

	public static int daysBetween(Timestamp d1, Timestamp d2) {
		return (int) ((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
	}

	public static Parameter getParam(String pname, List<Parameter> pn) {
		for (Iterator iterator = pn.iterator(); iterator.hasNext();) {
			Parameter p = (Parameter) iterator.next();
			if (p.getName().equalsIgnoreCase(pname)) {
				return p;
			}

		}
		return null;
	}

	public static int getNumberOfMonths(Date fromDate, Date toDate) {
		int monthCount = 0;
		Calendar cal = Calendar.getInstance();
		cal.setTime(fromDate);
		int c1date = cal.get(Calendar.DATE);
		int c1month = cal.get(Calendar.MONTH);
		int c1year = cal.get(Calendar.YEAR);
		cal.setTime(toDate);
		int c2date = cal.get(Calendar.DATE);
		int c2month = cal.get(Calendar.MONTH);
		int c2year = cal.get(Calendar.YEAR);

		monthCount = ((c2year - c1year) * 12) + (c2month - c1month) + ((c2date >= c1date) ? 1 : 0);

		return monthCount;
	}

	public static FieldInfo findFieldInfoByObject(Object obj, List<FieldInfo> lstItemCols) {
		for (Iterator iterator = lstItemCols.iterator(); iterator.hasNext();) {
			FieldInfo prop = (FieldInfo) iterator.next();
			if (prop.obj == obj) {
				return prop;
			}
		}
		return null;
	}

	public static boolean findFieldInRS(String tb, String fldname, Connection con) throws SQLException {
		PreparedStatement pst = con.prepareStatement("select *from " + tb + " where 1=0",
				ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
		ResultSet rst = pst.executeQuery();
		boolean res = findFieldInRS(rst, fldname);
		pst.close();
		return res;

	}

	public static boolean findFieldInRS(ResultSet rs, String fldname) throws SQLException {

		for (int i = 0; i < rs.getMetaData().getColumnCount(); i++) {
			if (rs.getMetaData().getColumnName(i + 1).toUpperCase().equals(fldname.toUpperCase()))
				return true;
		}
		return false;
	}

	public static void do_assign_return_values(ColumnProperty cp, localTableModel dataDestination,
			localTableModel dataSource, int srcRowno, int destRowno) {
		if (cp.mapReturns == null || cp.mapReturns.size() == 0)
			return;

		for (Iterator iterator = cp.mapReturns.keySet().iterator(); iterator.hasNext();) {
			String srcFLd = (String) iterator.next();
			String destFld = cp.mapReturns.get(srcFLd);

			Object vl = dataSource.getFieldValue(srcRowno, srcFLd);

			if (vl != null && dataDestination.getColByName(destFld).isNumber() && !(vl instanceof BigDecimal)) {
				vl = new BigDecimal(dataSource.getFieldValue(srcRowno, srcFLd).toString());
			}

			dataDestination.setFieldValue(destRowno, destFld, vl);
		}
	}

	public static void setAllColumnValue(localTableModel data, String colname, Object vl) {
		for (int i = 0; i < data.getRowCount(); i++) {
			data.setFieldValue(i, colname, vl);
		}
	}

	public static void insert_list(Connection con, String nm, String descr, String id) throws Exception {
		QueryExe qe = new QueryExe("declare fnd varchar2(300);" + " begin "
				+ " select max(name) into fnd  from relists where idlist=:id and name=:nm; " + " if fnd is null then  "
				+ "   delete from relists where name= :NM and IDLIST= :id ;"
				+ "   insert into relists(idlist ,name,descr,pos) values " + "   (:id, :nm , :nm , "
				+ "   (select nvl(max(pos),0)+1 from relists where idlist= :id )); " + " end if; end; ", con);
		qe.setParaValue("id", id);
		qe.setParaValue("nm", nm);
		qe.execute();
		qe.close();

	}

	public static dataCell findByDisplay(List<dataCell> c, String dispval) {
		Object d[] = c.toArray();
		for (int i = 0; i < d.length; i++) {
			if (d[i] != null && (d[i] instanceof dataCell) && ((dataCell) d[i]).getDisplay() != null
					&& ((dataCell) d[i]).getDisplay().toString().equals(dispval)) {
				return ((dataCell) d[i]);
			}
		}
		return null;

	}

	public static dataCell findByValue(List<dataCell> c, String val) {
		Object d[] = c.toArray();
		for (int i = 0; i < d.length; i++) {
			if (d[i] != null && (d[i] instanceof dataCell) && ((dataCell) d[i]).getValue() != null
					&& ((dataCell) d[i]).getValue().toString().equals(val)) {
				return ((dataCell) d[i]);
			}
		}
		return null;

	}

	public static ColumnProperty findColByDescr(String des, List<ColumnProperty> lstItemCols) {
		for (Iterator iterator = lstItemCols.iterator(); iterator.hasNext();) {
			ColumnProperty prop = (ColumnProperty) iterator.next();
			if (prop.descr.equals(des)) {
				return prop;
			}
		}
		return null;
	}

	public static ColumnProperty findColByCol(String des, List<ColumnProperty> lstItemCols) {
		for (Iterator iterator = lstItemCols.iterator(); iterator.hasNext();) {
			ColumnProperty prop = (ColumnProperty) iterator.next();
			if (prop.colname.toUpperCase().equals(des.toUpperCase())) {
				return prop;
			}
		}
		return null;
	}

	public static ColumnProperty findColByPos(int des, List<ColumnProperty> lstItemCols) {
		for (Iterator iterator = lstItemCols.iterator(); iterator.hasNext();) {
			ColumnProperty prop = (ColumnProperty) iterator.next();
			if (prop.pos == des) {
				return prop;
			}
		}
		return null;
	}

	public static void roundDate(Date dt) {
		Calendar cl = Calendar.getInstance();
		cl.setTime(dt);
		cl.set(Calendar.HOUR_OF_DAY, 0);
		cl.set(Calendar.MINUTE, 0);
		cl.set(Calendar.SECOND, 0);
		cl.set(Calendar.MILLISECOND, 0);
		dt.setTime(cl.getTimeInMillis());

	}

	public static double round(double value, int places) {
		if (places < 0)
			throw new IllegalArgumentException();

		BigDecimal bd = new BigDecimal(value);
		bd = bd.setScale(places, RoundingMode.HALF_UP);
		return bd.doubleValue();
	}

	public static String getJSONStr(String var, Object val, boolean includeBracket) {
		String tmp1 = (includeBracket ? "{" : "");
		char slash = 92;
		tmp1 += "\"" + decodeEscape(var.replace("\"", "")) + "\":";
		// if (!val.toString().contains("\""))
		// tmp1 += ((val instanceof Number) ? nvl(val, "\"\"") + "" : "\"" +
		// decodeEscape((nvl(val, "")) + "\""));
		// else
		if (val == null)
			tmp1 += "null";
		else
			tmp1 += ((val instanceof Number) ? nvl(val, "null") + ""
					: "\"" + decodeEscape(StringEscapeUtils.escapeJson((nvl(val, "").replaceAll("\"", ""))) + "\""));

		tmp1 += (includeBracket ? "}" : "");
		return tmp1;
	}

	public static String getJSONMap(Map<String, Object> mp) {
		String ret = "";
		for (String key : mp.keySet()) {
			ret += (ret.length() == 0 ? "" : ",") + getJSONStr(key, mp.get(key), false);
		}
		return ret;
	}

	public static String getJSONMapString(Map<String, String> mp, boolean includeBrackets) {
		String ret = "";
		for (String key : mp.keySet()) {
			ret += (ret.length() == 0 ? "" : ",") + getJSONStr(key, mp.get(key), includeBrackets);
		}
		return ret;
	}

	public static String getJSONsql(String var, ResultSet rs, Connection con, String excludeColumn,
			String includeColumn) throws SQLException {

		if (rs == null || !rs.first())
			return "";
		String ret = "";
		ResultSetMetaData rsm = rs.getMetaData();
		rs.beforeFirst();
		String tmp1 = "", cn = "";
		while (rs.next()) {
			tmp1 = "";
			for (int i = 0; i < rsm.getColumnCount(); i++) {
				cn = rsm.getColumnName(i + 1);
				tmp1 += (tmp1.length() == 0 ? "" : ",") + getJSONStr(cn, rs.getObject(cn), false);
			}
			ret += (ret.length() == 0 ? "" : ",") + "{" + tmp1 + "}";
		}

		ret = (var.length() == 0 ? "" : "\"" + var + "\":") + "[" + ret + "]";

		return ret;
	}

	public static String getJSONsqlMetaData(ResultSet rs, Connection con, String excludeColumn, String includeColumn)
			throws SQLException {

		if (rs == null) // || !rs.first())
			return "";
		String ret = "", met = "";
		String tmp1 = "", cn = "";
		ResultSetMetaData rsm = rs.getMetaData();
		for (int i = 0; i < rsm.getColumnCount(); i++) {
			tmp1 = getJSONStr("colname", rsm.getColumnName(i + 1), false);
			tmp1 += "," + getJSONStr("width", "30", false);
			if (rsm.getColumnType(i + 1) == java.sql.Types.DATE || rsm.getColumnType(i + 1) == java.sql.Types.TIMESTAMP)
				tmp1 += "," + getJSONStr("data_type", "DATE", false);
			else if (isNumber(rsm.getColumnType(i + 1)))
				tmp1 += "," + getJSONStr("data_type", "NUMBER", false);
			else
				tmp1 += "," + getJSONStr("data_type", "STRING", false);
			met += (met.length() > 0 ? "," : "") + "{" + tmp1 + "}";

		}
		if (!rs.first())
			return "\"metadata\":" + "[" + met + "] ," + "\"data\":" + "[]";
		rs.beforeFirst();

		while (rs.next()) {
			tmp1 = "";
			for (int i = 0; i < rsm.getColumnCount(); i++) {
				cn = rsm.getColumnName(i + 1);
				Object vl = (isNumber(rsm.getColumnType(i + 1)) ? Double.valueOf(rs.getDouble(cn)) : rs.getString(cn));
				tmp1 += (tmp1.length() == 0 ? "" : ",") + getJSONStr(cn, vl, false);
			}
			ret += (ret.length() == 0 ? "" : ",") + "{" + tmp1 + "}";
		}

		ret = "\"metadata\":" + "[" + met + "] ," + "\"data\":" + "[" + ret + "]";

		return ret;
	}

	public static String decodeEscape(String v) {

		return /* v.replaceAll("'", "\\\\'") */v.replaceAll("\n", "\\\\r").replaceAll("\r", "\\\\r")
				.replaceAll("\u201c", "\"");
	}

	public static boolean isNumber(int datatype) {
		if (datatype == 19 || datatype == 9 || datatype == 2) {
			return true;
		}
		return false;

	}

	public static String getJSONCP(ColumnProperty cp) {
		if (cp == null)
			return "";
		String ret = "";

		ret = getJSONStr("data_type", cp.data_type, false);
		ret += "," + getJSONStr("colname", cp.colname, false);
		ret += "," + getJSONStr("display_format", cp.display_format, false);
		ret += "," + getJSONStr("display_align", cp.display_align, false);
		ret += "," + getJSONStr("summary", cp.summary, false);
		ret += "," + getJSONStr("display_width", cp.display_width, false);
		ret += "," + getJSONStr("display_style", cp.display_style, false);
		ret += "," + getJSONStr("descr", cp.descr, false);
		ret += "," + getJSONStr("descrar", cp.descrar, false);
		ret += "," + getJSONStr("grouped", (cp.isGrouped ? "true" : "false"), false);
		ret += "," + getJSONStr("qtree_type", cp.qtree_type, false);
		ret += "," + getJSONStr("hide_col", (cp.hide_col ? "true" : "false"), false);
		ret += "," + getJSONStr("cf_operator", cp.cf_operator, false);
		ret += "," + getJSONStr("cf_value", cp.cf_value, false);
		ret += "," + getJSONStr("cf_true", cp.cf_true, false);
		ret += "," + getJSONStr("cf_false", cp.cf_false, false);
		ret += "," + getJSONStr("parent_title_1", cp.parent_title_1, false);
		ret += "," + getJSONStr("parent_title_2", cp.parent_title_2, false);
		ret += "," + getJSONStr("parent_title_span", cp.parent_title_span, false);
		return ret;

	}

	public static String getParaValue(String vl, InstanceInfo inf) throws SQLException {
		Connection con = inf.getmDbc().getDbConnection();
		Calendar cln = Calendar.getInstance();
		cln.setTimeInMillis(System.currentTimeMillis());
		cln.set(Calendar.HOUR, 0);
		cln.set(Calendar.MINUTE, 0);
		cln.set(Calendar.SECOND, 0);
		cln.set(Calendar.MILLISECOND, 0);

		Object ret = "";
		String rets = "";

		if (vl.equals("$FIRSTDATEOFYEAR")) {
			cln.set(Calendar.MONTH, 0);
			cln.set(Calendar.DAY_OF_MONTH, 1);
			ret = new java.util.Date(cln.getTimeInMillis());
		}
		if (vl.equals("$FIRSTDATEOFYEAR")) {

			cln.set(Calendar.MONTH, 0);
			cln.set(Calendar.DAY_OF_MONTH, 1);
			ret = new java.util.Date(cln.getTimeInMillis());
		}
		if (vl.equals("$FIRSTDATEOFTRANS")) {

			cln.set(Calendar.MONTH, 0);
			cln.set(Calendar.DAY_OF_MONTH, 1);
			ResultSet rs = QueryExe.getSqlRS("select min(vou_date) from acvoucher2", con);
			if (rs != null) {
				rs.first();

				if (rs.getDate(1) != null)
					ret = new java.util.Date(rs.getDate(1).getTime());
				rs.close();
			}
			// ret = new java.util.Date(cln.getTimeInMillis());
		}

		if (vl.equals("$ENDDATEOFTRANS")) {

			cln.set(Calendar.MONTH, 0);
			cln.set(Calendar.DAY_OF_MONTH, 1);
			ResultSet rs = QueryExe.getSqlRS("select max(vou_date) from acvoucher2", con);
			if (rs != null) {
				rs.first();
				if (rs.getDate(1) != null)
					ret = new java.util.Date(rs.getDate(1).getTime());
				rs.close();
			}
			// ret = new java.util.Date(cln.getTimeInMillis());
		}

		if (vl.equals("$FIRSTDATEOFPERIOD")) {
			String cp = inf.getMmapVar().get("CURRENT_PERIOD") + "";
			ResultSet rs = QueryExe.getSqlRS("SELECT FROMDATE FROM FISCALPERIOD WHERE CODE='" + cp + "'", con);
			if (rs != null) {
				rs.first();

				if (rs.getDate(1) != null)
					ret = new java.util.Date(rs.getDate(1).getTime());
				rs.close();
			}
			// ret = new java.util.Date(cln.getTimeInMillis());
		}

		if (vl.equals("$ENDDATEOFPERIOD")) {
			String cp = inf.getMmapVar().get("CURRENT_PERIOD") + "";
			ResultSet rs = QueryExe.getSqlRS("SELECT TODATE FROM FISCALPERIOD WHERE CODE='" + cp + "'", con);
			if (rs != null) {
				rs.first();
				if (rs.getDate(1) != null)
					ret = new java.util.Date(rs.getDate(1).getTime());
				rs.close();
			}
		}

		if (vl.equals("$FROMCUST")) {
			ResultSet rs = QueryExe.getSqlRS("SELECT min(code) FROM c_ycust WHERE iscust='Y'", con);
			if (rs != null) {
				rs.first();

				if (rs.getString(1) != null)
					ret = rs.getString(1);
				rs.close();
			}
		}

		if (vl.equals("$TOCUST")) {
			ResultSet rs = QueryExe.getSqlRS("SELECT max(code) FROM c_ycust WHERE iscust='Y'", con);
			if (rs != null) {
				rs.first();

				if (rs.getString(1) != null)
					ret = rs.getString(1);
				rs.close();
			}
		}

		if (vl.equals("$FROMSUPP")) {
			ResultSet rs = QueryExe.getSqlRS("SELECT min(code) FROM c_ycust WHERE issupp='Y'", con);
			if (rs != null) {
				rs.first();

				if (rs.getString(1) != null)
					ret = rs.getString(1);
				rs.close();
			}
		}

		if (vl.equals("$TOSUPP")) {
			ResultSet rs = QueryExe.getSqlRS("SELECT max(code) FROM c_ycust WHERE issupp='Y'", con);
			if (rs != null) {
				rs.first();

				if (rs.getString(1) != null)
					ret = rs.getString(1);
				rs.close();
			}
		}

		if (vl.equals("$TODAY"))
			ret = new java.util.Date(cln.getTimeInMillis());

		if (vl.equals("$FIRSTDATEOFMONTH")) {
			cln.set(Calendar.DAY_OF_MONTH, 1);
			ret = new java.util.Date(cln.getTimeInMillis());
		}

		if (vl.equals("$DEFAULT_STORE"))
			ret = inf.getMmapVar().get("DEFAULT_STORE");

		if (vl.equals("$DEFAULT_LOCATION"))
			ret = inf.getMmapVar().get("DEFAULT_LOCATION");

		rets = nvl(ret, "");
		if (ret instanceof Date) {
			SimpleDateFormat sdf = new SimpleDateFormat(inf.getMmapVar().get("ENGLISH_DATE_FORMAT") + "");
			rets = sdf.format((Date) ret);
		}

		return rets;
	}

	public static String insertStringAfter(String str, String str_insert, String str_after) {
		int startIndex = str.toUpperCase().indexOf(str_after.toUpperCase());
		if (startIndex < 0)
			return "";

		String b4_str = str.substring(0, startIndex + str_after.length());

		return b4_str + str_insert + str.substring(b4_str.length() + 1, str.length());
	}

}