package com.tools.queries;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Types;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.controller.InstanceInfo;
import com.generic.ColumnProperty;
import com.generic.Parameter;
import com.generic.QueryExe;
import com.generic.dataCell;
import com.generic.localTableModel;
import com.generic.qryColumn;
import com.generic.utils;

public class QuickRepMetaData {

	private InstanceInfo instanceInfo;

	public boolean isCt = false;
	public boolean showColSection = true;
	public boolean showGroup1 = true;
	public boolean showGroup2 = true;
	private String sqlstr = "";
	private String sqlCols = "";
	private String sqlOrdby = "";
	private String sqlGroupby = "";
	private String sqlWhere = "";
	private String sqlView = "";
	public String sqlCPDistinctRow = "";
	public String sqlCPDistinctCol = "";
	// public String CtValueCol = "";
	// public String CtValueColTotTitle = "";
	public String strExecbefore = "";
	public boolean ctSort = false;
	private boolean mode_query = false;
	public boolean showSavedParams = true;
	private String parentCol = "";
	private String codeCol = "";
	private List<Parameter> listParas = new ArrayList<Parameter>();
	public String added_sql_clause = "";
	public String added_where_clause = "";
	public List<Parameter> added_filter_parameters = new ArrayList<Parameter>();
	public List<Parameter> added_query_parameters = new ArrayList<Parameter>();
	public Map<String, dataCell> actionMap = new HashMap<String, dataCell>();
	public List<dataCell> actionList = new ArrayList<dataCell>();
	public List<Parameter> listConditions = new ArrayList<Parameter>();;
	public List<String> ctRowsCol = new ArrayList<String>();
	public List<String> ctHeaderCol = new ArrayList<String>();
	public List<String> ctValueCol = new ArrayList<String>();
	public List<String> ctValueColTotTitle = new ArrayList<String>();
	public localTableModel data_cols = new localTableModel();
	private final List<ColumnProperty> lstItemCols = new ArrayList<ColumnProperty>();
	private List<Parameter> listParams = new ArrayList<Parameter>();
	private Map<String, List<String>> sqlMap = new HashMap<String, List<String>>();
	private List<ColumnProperty> listcols = new ArrayList<ColumnProperty>();
	private List<ColumnProperty> listcolstemp = new ArrayList<ColumnProperty>();

	public String txtGroup1 = "";
	public String txtGroup2 = "";

	private String id = "";
	private String report_name = "";
	private String report_where = "";

	private List<String> listHideCols = new ArrayList<String>();
	private List<String> listGroupsBy = new ArrayList<String>();
	private List<String> listGroupSum = new ArrayList<String>();
	private List<String> listCtRowsCol = new ArrayList<String>();
	private List<String> listCtHeaderCol = new ArrayList<String>();

	// value = code ,, label=
	private List<dataCell> listSubReports = new ArrayList<dataCell>();

	private List<String> listGroups = new ArrayList<String>();

	// private List<ColumnProperty> listCols = new ArrayList<ColumnProperty>();

	public QuickRepMetaData(InstanceInfo inf) {
		this.instanceInfo = inf;
	}

	public String getJSONInit(String id) throws Exception {
		this.id = id;
		buildListsInit();
		String ret = "", reps = "", cols = "", tmp1 = "", groups = "";

		for (dataCell dc : listSubReports) {
			tmp1 = utils.getJSONStr("rep_code", dc.getValue(), false) + ","
					+ utils.getJSONStr("rep_name", dc.getDisplay(), false);
			reps += (reps.length() == 0 ? "" : ",") + "{" + tmp1 + "}";
		}

		String rep_info = "\"report_info\":{" + utils.getJSONStr("report_id", id, false);
		rep_info += "," + utils.getJSONStr("report_name", report_name, false) + "}";
		ret = rep_info + ",\"subreport\":[" + reps + "]";

		// ret += ",\"cols\":" + "[" + cols + "]";
		// ret += ",\"groups\":" + "[" + groups + "]";

		return "{" + ret + "}";

	}

	public String getJSONCols(String id) throws Exception {

		this.id = id;
		bulidListCols();
		Connection con = instanceInfo.getmDbc().getDbConnection();
		String cols = "", ret = "", tmp1 = "", groups = "", grps = "", grp1 = "", grp2 = "", titleSql = "",
				other_prop = "";

		for (ColumnProperty col : listcols) {
			tmp1 = utils.getJSONStr("field_name", col.colname, false);
			tmp1 += "," + utils.getJSONStr("group_name", col.other_info, false);
			cols += (cols.length() == 0 ? "" : ",") + "{" + tmp1 + "}";
		}

		for (String grp : listGroups)
			grps += (grps.length() == 0 ? "" : ",") + utils.getJSONStr("group_name", grp, true);

		ResultSet rs = QueryExe.getSqlRS("select *from c6_qry1  where code='" + id + "'", con);
		if (rs != null) {
			rs.first();
			grp1 = utils.getJSONStr("visible", (rs.getString("show_group_1").equals("Y") ? "TRUE" : "FALSE"), false);
			grp1 += "," + utils.getJSONStr("default", rs.getString("default_group_1"), false);
			grp1 += "," + utils.getJSONStr("exclude", rs.getString("exclude_group_1"), false);
			grp2 = utils.getJSONStr("visible", (rs.getString("show_group_2").equals("Y") ? "TRUE" : "FALSE"), false);
			grp2 += "," + utils.getJSONStr("default", rs.getString("default_group_2"), false);
			grp2 += "," + utils.getJSONStr("exclude", rs.getString("exclude_group_2"), false);

			titleSql = utils.getJSONStr("title_eng", utils.nvl(rs.getString("sql_title_eng"), ""), false);
			titleSql += "," + utils.getJSONStr("title_arb", utils.nvl(rs.getString("sql_title_arb"), ""), false);

			other_prop = utils.getJSONStr("fixedcolcount", utils.nvl(rs.getInt("fixedcolcount"), "0"), false);
			rs.close();
		}

		String pms = getJSONparameters();
		rs = QueryExe.getSqlRS("select *from c6_subreps where (rep_id like '%\"" + id + "\"%' or rep_id='" + id
				+ "') order by rep_pos", con);

		String subreps = "";
		if (rs != null && rs.first()) {
			subreps = utils.getJSONsql("subreps", rs, con, "", "");
			rs.close();
		}
		ret += "\"cols\":" + "[" + cols + "]";
		ret += ",\"groups\":[" + grps + "]";
		ret += ",\"group1\":{" + grp1 + "}";
		ret += ",\"group2\":{" + grp2 + "}";
		ret += ",\"sql_title\":{" + titleSql + "}";
		ret += ",\"other_prop\":{" + other_prop + "}";
		ret += (pms.trim().isEmpty() ? "" : ",") + pms;
		if (subreps.trim().length() > 0)
			ret += "," + subreps;
		return "{" + ret + "}";
	}

	/**
	 * @return
	 * @throws SQLException
	 */
	public String getJSONparameters() throws SQLException {
		String var = "parameters";
		Connection con = instanceInfo.getmDbc().getDbConnection();

		ResultSet rs = QueryExe.getSqlRS(
				"select *from c6_qrypara where code like '%\"" + id + "\"%' or code='" + id + "' order by inddexno",
				con);
		if (rs == null || !rs.first())
			return "";

		String ret = "";
		ResultSetMetaData rsm = rs.getMetaData();
		rs.beforeFirst();
		String tmp1 = "", cn = "", vl = "";
		while (rs.next()) {
			tmp1 = "";
			for (int i = 0; i < rsm.getColumnCount(); i++) {
				cn = rsm.getColumnName(i + 1);
				vl = utils.nvl(rs.getString(cn), "");
				if (cn.equals("PARA_DEFAULT") && vl.startsWith("$"))
					vl = utils.getParaValue(vl, instanceInfo);

				// if (cn.equals("LISTNAME") /* && vl.length() > 0 */) { //
				// getting
				// // list
				// // of values ..
				// // ResultSet rss = QueryExe.getSqlRS(vl, con);
				// // vl = utils.getJSONsql("", rss, con, "", "");
				// tmp1 += (tmp1.length() == 0 ? "" : ",") +
				// utils.getJSONStr("LISTNAME", vl, false);
				// } else
				tmp1 += (tmp1.length() == 0 ? "" : ",") + utils.getJSONStr(cn, vl, false);

			}
			ret += (ret.length() == 0 ? "" : ",") + "{" + tmp1 + "}";
		}

		ret = (var.length() == 0 ? "" : "\"" + var + "\":") + "[" + ret + "]";

		return ret;
	}

	private void buildListsInit() throws Exception {
		listSubReports.clear();

		Connection con = instanceInfo.getmDbc().getDbConnection();

		report_name = "";
		if (instanceInfo.getmLoginLanguage().equals("AR"))
			report_name = QueryExe.getSqlValue(
					"select max(nvl(titleeng,titlearb)) from c6_qry1 where code='" + id + "'", con, "") + "";
		else
			report_name = QueryExe.getSqlValue("select max(titlearb) from c6_qry1 where code='" + id + "'", con, "")
					+ "";

		// --------sub report addings
		QueryExe qe = new QueryExe(con);
		qe.setSqlStr("select code,titlearb from c6_qry1 where parentrep=:id order by code");
		if (instanceInfo.getmLoginLanguage().equals("AR"))
			qe.setSqlStr("select code,nvl(titleeng,titlearb) titlearb from c6_qry1 where parentrep=:id order by code");
		qe.setParaValue("id", id);
		ResultSet rs = qe.executeRS();
		if (rs != null) {
			rs.beforeFirst();
			while (rs.next())
				listSubReports.add(new dataCell(rs.getString("titlearb"), rs.getString("code")));
			qe.close();
		}
	}

	private void bulidListCols() throws Exception {
		listcols.clear();
		listGroups.clear();

		Connection con = instanceInfo.getmDbc().getDbConnection();
		QueryExe qe = new QueryExe(con);
		qe.setSqlStr("select  *from c6_qry2  where code=:id order by code,indexno");
		qe.setParaValue("id", id);
		ResultSet rs = qe.executeRS();
		if (rs != null) {
			rs.beforeFirst();
			while (rs.next()) {
				if (rs.getString("group_name") != null && rs.getString("group_name").length() != 0
						&& listGroups.indexOf(rs.getString("group_name")) < 0)
					listGroups.add(rs.getString("group_name"));

				ColumnProperty cp = new ColumnProperty();
				cp.colname = rs.getString("field_name");
				cp.descr = rs.getString("display_name");
				cp.other_info = utils.nvl(rs.getString("group_name"), "");
				listcols.add(cp);
			}
			rs.close();
			qe.close();
		}

	}

	public String buildSql(String idno) throws Exception {
		Connection con = instanceInfo.getmDbc().getDbConnection();
		isCt = false;
		ctHeaderCol.clear();
		ctRowsCol.clear();
		ctValueCol.clear();
		ctValueColTotTitle.clear();

		sqlstr = "";
		String s1 = "";
		String strgroup1 = "";
		parentCol = "";
		codeCol = "";
		this.id = idno;
		setAutoGroup();

		if (txtGroup1 != null && txtGroup1.length() > 0) {
			strgroup1 = txtGroup1;
		}
		String strgroup2 = "";
		if (txtGroup2 != null && txtGroup2.length() > 0) {
			strgroup2 = txtGroup2;
		}

		int summary_count = 0;
		String indexin = "";

		if (sqlMap.size() > 0) {
			sqlMap.get("COLS").clear();
			sqlMap.get("WHERE").clear();
			sqlMap.get("GROUP").clear();
			sqlMap.get("SUBGROUP").clear();
			sqlMap.get("COLSDISP").clear();
			sqlMap.get("HIDECOL").clear();
			sqlMap.get("SUMMARY_COLS").clear();
			sqlMap.get("COLS_TEMP").clear();
		}

		sqlMap.clear();
		sqlMap.put("COLS", new ArrayList<String>());
		sqlMap.put("WHERE", new ArrayList<String>());
		sqlMap.put("GROUP", new ArrayList<String>());
		sqlMap.put("SUBGROUP", new ArrayList<String>());
		sqlMap.put("COLSDISP", new ArrayList<String>());
		sqlMap.put("HIDECOL", new ArrayList<String>());
		sqlMap.put("COLS_TEMP", new ArrayList<String>());
		sqlMap.put("SUMMARY_COLS", new ArrayList<String>());

		String order_by[] = new String[] { "", "", "", "", "", "", "", "" };

		if (con == null) {
			throw new Exception("no connection to query builder");
		}

		indexin = getIndexNoIn(idno);
		PreparedStatement ps_1 = con.prepareStatement("select *from c6_qry1 where code='" + idno + "'",
				ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

		PreparedStatement ps_2 = con.prepareStatement(
				"select *from c6_qry2 where code='" + idno + "' and (indexno in (" + utils.nvl(indexin, "null")
						+ ") or (iswhere='Y' or cp_hidecol='Y')  ) ORDER BY INDEXNO",
				ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

		ResultSet rs_2 = ps_2.executeQuery();
		// get counts for all from ps_2;
		rs_2.beforeFirst();
		while (rs_2.next()) {
			if ((rs_2.getString("SUMBY") != null && rs_2.getString("sumby").length() > 0)
					|| ((rs_2.getString("formulahassum") != null && rs_2.getString("formulahassum").length() > 0))) {
				summary_count++;
			}

		}
		rs_2.beforeFirst();
		String whereclause = "";
		String col = "";
		String coldisp = "";
		String Stringquot = "'";
		listcolstemp.clear();
		listcols.clear();
		List<String> cols = new ArrayList<String>();

		while (rs_2.next()) {

			col = utils.nvl(rs_2.getString("FORMULAFLD"), rs_2.getString("FIELD_NAME")).trim();
			coldisp = utils.nvl(rs_2.getString("DISPLAY_NAME"), rs_2.getString("FIELD_NAME")).trim();
			if (rs_2.getString("SUMBY") != null && rs_2.getString("sumby").length() > 0) {
				col = (rs_2.getString("SUMBY") + "(" + col + ")").trim();
			}
			// if is where not 'Y'
			if ((rs_2.getString("ISWHERE") == null || rs_2.getString("ISWHERE").length() == 0)) {
				ColumnProperty cp = new ColumnProperty();
				if ((strgroup1.length() > 0 || strgroup2.length() > 0)
						&& (strgroup1.equals(rs_2.getString("group_name")))) {
					if (strgroup1.equals(rs_2.getString("group_name"))) {
						if (sqlMap.get("COLS_TEMP").size() > 0) {
							sqlMap.get("COLS_TEMP").add(col + " \"" + coldisp + "\"");
						} else {
							sqlMap.get("COLS_TEMP").add(0, col + " \"" + coldisp + "\"");
						}
					} else {
						sqlMap.get("COLS_TEMP").add(col + " \"" + coldisp + "\"");
					}

				} else {
					sqlMap.get("COLS").add(col + " \"" + coldisp + "\"");
				}

				cp.col_class = String.class;
				cp.colname = coldisp;
				cp.descr = utils.nvl(rs_2.getString("CP_COL_TITLE_ENG"), coldisp);
				cp.descrar = utils.nvl(rs_2.getString("CP_COL_TITLE_ARB"), "");
				cp.parent_title_1 = utils.nvl(rs_2.getString("PARENT_TITLE_1"), "");
				cp.parent_title_2 = utils.nvl(rs_2.getString("PARENT_TITLE_2"), "");
				if (instanceInfo.getmLoginLanguage().equals("AR")) {
					cp.parent_title_1 = utils.nvl(rs_2.getString("PARENT_TITLE_1_AR"), cp.parent_title_1);
					cp.parent_title_2 = utils.nvl(rs_2.getString("PARENT_TITLE_2_AR"), cp.parent_title_2);
				}
				cp.parent_title_span = Integer.valueOf(utils.nvl(rs_2.getString("parent_title_span"), "1"));
				int fnd_col = data_cols.locate("INDEXNO", rs_2.getString("INDEXNO"), localTableModel.FIND_EXACT);
				if (fnd_col >= 0) {
					cp.display_width = ((BigDecimal) data_cols.getFieldValue(fnd_col, "DISPLAY_WIDTH")).intValue();
				} else {
					cp.display_width = rs_2.getInt("COLWIDTH");
				}

				cp.display_type = "";
				cp.display_style = rs_2.getString("CP_STYLENAMES");
				cp.cf_operator = utils.nvl(rs_2.getString("cf_operator"), "");
				cp.cf_value = utils.nvl(rs_2.getString("cf_value"), "");
				cp.cf_true = utils.nvl(rs_2.getString("cf_true"), "");
				cp.cf_false = utils.nvl(rs_2.getString("cf_false"), "");
				cp.pos = rs_2.getInt("indexno");
				cp.display_align = rs_2.getString("CP_ALIGN");
				cp.display_format = rs_2.getString("cp_format");
				cp.data_type = rs_2.getString("DATATYPEX");
				cp.qtree_type = rs_2.getString("QTREE_TYPE");
				cp.summary = "";
				cp.hide_col = (utils.nvl(rs_2.getString("CP_HIDECOL"), "N").toUpperCase().equals("Y") ? true : false);
				if (rs_2.getString("HASGROSS") != null) {
					if (rs_2.getString("HASGROSS_COLUMN") == null) {
						cp.summary = rs_2.getString("HASGROSS");
					}
				}

				if ((strgroup1.length() > 0 && strgroup2.length() > 0)
						&& (strgroup1.equals(rs_2.getString("group_name")))) {
					cp.isGrouped = true;
					if (listcolstemp.size() > 0) {
						listcolstemp.add(cp);
					} else {
						listcolstemp.add(0, cp);
					}

				} else {
					listcols.add(cp);
				}
			}

			// if whereoperator is not none
			if (!rs_2.getString("WHEREOPERATOR").equals("NONE")) {
				Stringquot = "";
				if (rs_2.getString("DATATYPEX").equals("VARCHAR2")) {
					Stringquot = "'";
				}
				whereclause = col + rs_2.getString("WHEREOPERATOR") + Stringquot + rs_2.getString("WHERECLAUSE")
						+ Stringquot;
				sqlMap.get("WHERE").add(whereclause);
			}
			if (summary_count > 0 && (rs_2.getString("SUMBY") == null || rs_2.getString("SUMBY").length() == 0)
					&& (rs_2.getString("formulahassum") == null || rs_2.getString("formulahassum").length() == 0)
					&& (rs_2.getString("ISWHERE") == null || rs_2.getString("ISWHERE").length() == 0)) {
				sqlMap.get("GROUP").add(col);
			}
			if (rs_2.getString("orderno") != null && rs_2.getString("orderno").length() > 0) {
				order_by[rs_2.getInt("orderno")] = col + " " + utils.nvl(rs_2.getString("ordertype"), "ASC");
			}
			if ((rs_2.getString("CP_HIDECOL") != null && rs_2.getString("CP_HIDECOL").length() > 0)) {
				sqlMap.get("HIDECOL").add(coldisp);
			}
			if (rs_2.getString("HASGROSS") != null && rs_2.getString("HASGROSS").equals("SUM")) {
				sqlMap.get("SUMMARY_COLS").add(coldisp);
			}
			if (rs_2.getString("CP_SUBGROUP") != null && rs_2.getString("CP_SUBGROUP").length() > 0) {
				sqlMap.get("SUBGROUP").add(coldisp);
			}

			if ((strgroup1.length() > 0 || strgroup2.length() > 0)
					&& (strgroup1.equals(rs_2.getString("group_name")))) {
				if (s1.length() > 0) {
					s1 = s1 + ",\"" + coldisp + "\"";
				} else {
					s1 = "\"" + coldisp + "\"";
				}
			}
			/*
			 * if ((strgroup1.length() > 0 || strgroup2.length() > 0) &&
			 * (strgroup1.equals(rs_2.getString("group_name")) || strgroup2
			 * .equals(rs_2.getString("group_name")))) { if (s1.length() > 0) { s1 = s1 +
			 * "," + "\"" + coldisp + "\""; } else { s1 = "\"" + coldisp + "\""; } }
			 */

			if (strgroup1.equals(rs_2.getString("group_name"))) {
				parentCol = coldisp;
			}

			if (strgroup2.equals(rs_2.getString("group_name"))) {
				codeCol = coldisp;
			}

			if (rs_2.getString("CT_COL") != null && rs_2.getString("CT_COL").trim().length() > 0
					&& utils.nvl(rs_2.getString("Cp_HIDECOL"), "").isEmpty()) {
				ctHeaderCol.add(coldisp);
			}

			if (rs_2.getString("CT_ROW") != null && rs_2.getString("CT_ROW").trim().length() > 0) {
				ctRowsCol.add(coldisp);
			}

			if (rs_2.getString("CT_VAL") != null && rs_2.getString("CT_VAL").trim().length() > 0
					&& utils.nvl(rs_2.getString("Cp_HIDECOL"), "").isEmpty()) {
				ctValueCol.add(coldisp);
				if (rs_2.getString("CT_VAL_TOT_LABEL") != null)
					ctValueColTotTitle.add(rs_2.getString("CT_VAL_TOT_LABEL"));
				// CtValueCol = coldisp;
				// CtValueColTotTitle = rs_2.getString("CT_VAL_TOT_LABEL");
			}

		} // while rs2

		for (int i = sqlMap.get("COLS_TEMP").size() - 1; i > -1; i--) {
			sqlMap.get("COLS").add(0, sqlMap.get("COLS_TEMP").get(i));
		}

		for (int i = listcolstemp.size() - 1; i > -1; i--) {
			listcols.add(0, listcolstemp.get(i));
		}
		for (int i = 0; i < listcolstemp.size(); i++) {
			coldisp = listcolstemp.get(i).colname;
			sqlMap.get("SUBGROUP").add(coldisp);
		}

		// if (ctHeaderCol.size() == 1) {
		// ctHeaderCol.add(ctHeaderCol.get(0).toString());
		// }
		ps_2.close();

		sqlstr = "";
		sqlCols = "";
		sqlWhere = "";
		sqlGroupby = "";
		sqlOrdby = "";
		sqlView = "";
		sqlCPDistinctRow = "";
		sqlCPDistinctCol = "";

		// iterate maps cols
		for (Iterator iterator = sqlMap.get("COLS").iterator(); iterator.hasNext();) {
			String str = (String) iterator.next();
			if (sqlCols.length() > 0) {
				sqlCols = sqlCols + "," + str;
			} else {
				sqlCols = str;
			}
		}
		// iterate maps where
		for (Iterator iterator = sqlMap.get("WHERE").iterator(); iterator.hasNext();) {
			String str = (String) iterator.next();
			if (sqlWhere.length() > 0) {
				sqlWhere = sqlWhere + " AND " + str;
			} else {
				sqlWhere = "Where " + str;
			}
		}

		// iterate maps group
		for (Iterator iterator = sqlMap.get("GROUP").iterator(); iterator.hasNext();) {
			String str = (String) iterator.next();
			if (sqlGroupby.length() > 0) {
				sqlGroupby = sqlGroupby + " , " + str;
			} else {
				sqlGroupby = "Group By " + str;
			}
		}
		for (Iterator iterator = sqlMap.get("SUBGROUP").iterator(); iterator.hasNext();) {
			String strSub = (String) iterator.next();
			if (s1.length() > 0) {
				s1 = s1 + ",\"" + strSub + "\"";
			} else {
				s1 = "\"" + strSub + "\"";
			}
		}

		for (int i = 0; i < order_by.length; i++) {
			String str = order_by[i];
			if (str.length() > 0) {
				if (sqlOrdby.length() > 0) {
					sqlOrdby = sqlOrdby + " , " + str;
				} else {
					// first add sub group as order by
					sqlOrdby = "Order By " + (s1.length() > 0 ? s1 + "," : "") + str;
				} // ..else..first add sub group as order by
			}
		}

		if (sqlOrdby.length() == 0 && s1.length() > 0) {
			sqlOrdby = "Order by " + s1;
		}

		ResultSet rs_1 = ps_1.executeQuery();
		rs_1.first();

		// sqlwhere to add with additional where
		sqlWhere = sqlWhere + " " + utils.nvl(rs_1.getString("REPORTNAME"), "");
		if (sqlWhere.trim().length() > 0 && added_where_clause.length() > 0) {
			added_where_clause = " and " + added_where_clause;
		}
		if (sqlWhere.trim().length() == 0 && added_where_clause.length() > 0) {
			added_where_clause = " where " + added_where_clause;
		}

		sqlWhere = sqlWhere + added_where_clause;
		if ((rs_1.getString("HASSUBTOT") != null && rs_1.getString("HASSUBTOT").length() > 0)
				&& sqlMap.get("SUBGROUP").size() == 0) {
			sqlMap.get("SUBGROUP").add(listcols.get(0).colname);
		}

		if (rs_1.getString("is_cross_tab").equals("Y")) {
			isCt = true;
		}
		if (rs_1.getString("CT_COL_SORT") != null && rs_1.getString("CT_COL_SORT").equals("Y")) {
			ctSort = true;
		}
		if (rs_1.getString("exec_before") != null && rs_1.getString("exec_before").length() > 0) {
			strExecbefore = rs_1.getString("exec_before");
		}
		sqlView = rs_1.getString("rep_qryname");

		ps_1.close();

		listCtHeaderCol.clear();
		listCtHeaderCol.addAll(ctHeaderCol);
		listCtRowsCol.clear();
		listCtRowsCol.addAll(ctRowsCol);

		sqlstr = "select " + sqlCols + " from " + sqlView + " " + sqlWhere + " " + sqlGroupby + " " + sqlOrdby;
		return sqlstr;/**
						 * later on to add this.. for qucik rows and columns if (isCt) { for (int i = 0;
						 * i < ctHeaderCol.size(); i++) {
						 * 
						 * } }
						 */
	}

	public String getIndexNoIn(String idno) throws SQLException {
		Connection con = instanceInfo.getmDbc().getDbConnection();
		String indexin = "";
		List<String> ltmp = new ArrayList<String>();

		String strgroup1 = "";
		if (txtGroup1 != null) {
			strgroup1 = txtGroup1;
		}
		String strgroup2 = "";
		if (txtGroup2 != null) {
			strgroup2 = txtGroup2;
		}
		String sq = "select *from c6_qry2 where code='" + idno + "' and group_name is not null  order by indexno";
		if (strgroup1.isEmpty() && strgroup2.isEmpty())
			sq = "select *from c6_qry2 where code='" + idno + "'   order by indexno";

		ltmp.clear();
		PreparedStatement psq = con.prepareStatement(sq, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
		ResultSet rsq = psq.executeQuery();
		while (rsq.next()) {
			if (strgroup1.isEmpty() && strgroup2.isEmpty()) {
				ltmp.add(rsq.getString("indexno"));
				continue;
			}
			if (strgroup1.equals(rsq.getString("group_name"))) {
				ltmp.add(rsq.getString("indexno"));
			}
			if (strgroup2.equals(rsq.getString("group_name"))) {
				ltmp.add(rsq.getString("indexno"));
			}

		}
		psq.close();
		for (int i = 0; i < data_cols.getRows().size(); i++) {
			if (data_cols.getFieldValue(i, "SELECTION").toString().equals("Y")) {
				ltmp.add(data_cols.getFieldValue(i, "INDEXNO").toString());
			}
		}
		String com = "";
		for (int i = 0; i < ltmp.size(); i++) {
			if (i > 0) {
				com = ",";
			}
			indexin = indexin + com + ltmp.get(i);
		}
		return indexin;
	}

	public String buildJson(String rid, Map<String, String> params) throws Exception {
		String bgn = "  c6_session.username:='" + instanceInfo.getmLoginUser() + "'; c6_session.session_id:='"
				+ instanceInfo.sessionId + "';";
		Connection con = instanceInfo.getmDbc().getDbConnection();
		SimpleDateFormat sdf = new SimpleDateFormat(instanceInfo.getMmapVar().get("ENGLISH_DATE_FORMAT") + "");
		this.id = rid;
		String ret = "";
		String sql = buildSql(rid);
		System.out.println(sql);

		if (strExecbefore != null && !strExecbefore.isEmpty()) {
			try {
				QueryExe qqe = new QueryExe(utils.insertStringAfter(strExecbefore, bgn, "begin"), con);
				for (String key : params.keySet()) {
					if (key.startsWith("_para_")) {
						System.out.println("para # " + key + " = " + params.get(key));
						qqe.setParaValue(key.replace("_para_", ""), params.get(key));
						if (params.get(key).startsWith("@"))
							qqe.setParaValue(key.replace("_para_", ""), (sdf.parse(params.get(key).substring(1))));
					}
				}
				System.out.println("executing::\n" + qqe.getSqlStr());
				;
				qqe.execute();

				con.commit();
				qqe.close();
			} catch (SQLException ex) {
				try {
					con.rollback();
				} catch (SQLException ex1) {
				}
				throw ex;

			}
		}

		QueryExe qe = new QueryExe(sql, con);
		for (String key : params.keySet()) {
			if (key.startsWith("_para_")) {
				System.out.println("para # " + key + " = " + params.get(key));
				qe.setParaValue(key.replace("_para_", ""), params.get(key));
				if (params.get(key).startsWith("@"))
					qe.setParaValue(key.replace("_para_", ""), (sdf.parse(params.get(key).substring(1))));
			}

		}
		for (ColumnProperty cp : listcols) {
			if (cp.descr.indexOf(":") > -1) {
				for (String key : params.keySet()) {
					if (key.startsWith("_para_")) {
						cp.descr = cp.descr.replace(":" + key.replace("_para_", ""), params.get(key));
					}
				}
			}
		}
		ResultSet rs = qe.executeRS();
		ret = "{" + getJSONsqlMetaData(rs, con, "", "") + "}";
		qe.close();
		return ret;

	}

	private String getJSONsqlMetaData(ResultSet rs, Connection con, String excludeColumn, String includeColumn)
			throws Exception {

		if (rs == null || !rs.first())
			return "";
		String ret = "", met = "";
		String tmp1 = "", cn = "";
		String scp = "";
		ColumnProperty cp = null;
		ResultSetMetaData rsm = rs.getMetaData();
		if (isCt) {
			ret = do_cross_tab_query(rs, listcols);
		} else {

			for (int i = 0; i < rsm.getColumnCount(); i++) {

				// tmp1 = utils.getJSONStr("colname", rsm.getColumnName(i + 1),
				// false);
				cp = utils.findColByCol(rsm.getColumnName(i + 1), listcols);
				scp = utils.getJSONCP(cp);
				// tmp1 += scp;

				met += (met.length() > 0 ? "," : "") + "{" + scp + "}";

			}

			rs.beforeFirst();

			while (rs.next()) {
				tmp1 = "";
				for (int i = 0; i < rsm.getColumnCount(); i++) {
					cn = rsm.getColumnName(i + 1);
					Object vl = utils.nvl(rs.getString(cn), "");
					if (vl != "")
						vl = (utils.isNumber(rsm.getColumnType(i + 1))
								? Double.valueOf(String.format("%.6f", rs.getDouble(cn)))
								: rs.getString(cn));
					else
						vl = null;
					tmp1 += (tmp1.length() == 0 ? "" : ",") + utils.getJSONStr(cn, vl, false);
				}
				ret += (ret.length() == 0 ? "" : ",") + "{" + tmp1 + "}";
			}

			ret = "\"metadata\":" + "[" + met + "] ," + "\"data\":" + "[" + ret + "]";
		} // end if for isCt cross tab

		return ret;
	}

	private void setAutoGroup() throws SQLException {
		String strgroup1 = utils.nvl(txtGroup1, "");
		String strgroup2 = utils.nvl(txtGroup2, "");

		if (!strgroup1.isEmpty() || !strgroup2.isEmpty())
			return;
		Connection con = instanceInfo.getmDbc().getDbConnection();

		ResultSet rs = QueryExe.getSqlRS(
				"select  group_name from c6_qry2 where CODE='" + id + "' and group_name is not null order by INDEXNO",
				con);
		if (rs == null)
			return;
		rs.beforeFirst();
		int i = 0;
		while (rs.next()) {
			if (i == 0)
				txtGroup1 = rs.getString("group_name");
			if (i == 1 && !txtGroup1.equals(rs.getString("group_name")))
				txtGroup2 = rs.getString("group_name");
			if (i == 2 && !txtGroup1.equals(rs.getString("group_name")))
				txtGroup2 = rs.getString("group_name");
			i++;
		}
		rs.close();

	}

	public String do_cross_tab_query(ResultSet rs_data, List<ColumnProperty> colProps) throws Exception {
		localTableModel data = new localTableModel();

		listGroupSum.clear(); // sum records to clear
		Map<String, Integer> mapRows = new HashMap<String, Integer>(); // rows
																		// to
																		// map
																		// record
																		// in
																		// string
																		// of
																		// cols,
																		// row
																		// no
		Map<String, Integer> mapCols = new HashMap<String, Integer>(); // columns
																		// and
																		// position
																		// no
		List<dataCell> lstColsx = new ArrayList<dataCell>(); // list of all
																// columns
		List<String> listRows = new ArrayList<String>(); // list of rows in
															// string
		Map<String, Map<String, BigDecimal>> mapValRows = new HashMap<String, Map<String, BigDecimal>>();// record
																											// string
																											// ,
																											// and
																											// column
																											// value
		Map<String, Map<String, Object>> mapRowsCol = new HashMap<String, Map<String, Object>>(); //
		List<Double> total = new ArrayList<Double>();

		BigDecimal val = null;
		// finding unique values
		rs_data.beforeFirst();
		while (rs_data.next()) {
			String rowString = "";
			String colString = "";
			// put all CT_ROW columns values in rowString , and assign to mp
			HashMap<String, Object> mp = new HashMap<String, Object>();
			for (int i = 0; i < listCtRowsCol.size(); i++) {
				rowString = rowString + rs_data.getString(listCtRowsCol.get(i));
				mp.put(listCtRowsCol.get(i), rs_data.getObject(listCtRowsCol.get(i)));
			}
			// add it to listrows and mapRows collection for accessing CT_ROW
			// row no.
			if (!mapRows.containsKey(rowString)) {
				listRows.add(rowString);
				mapRows.put(rowString, listRows.size() - 1);
				total.clear();
				for (int i = 0; i < listCtHeaderCol.size(); i++)
					total.add(0.0);
			} else {
				total.clear();
				for (int i = 0; i < listCtHeaderCol.size(); i++)
					total.add(mapValRows.get(rowString).get(ctValueColTotTitle.get(i)).doubleValue());
			}
			// use mapRowsCol to access column based values from rowString for
			// CT_ROW columns
			mapRowsCol.put(rowString, mp);

			// add all CT_COL in listcols and mapCols.
			for (int i = 0; i < listCtHeaderCol.size(); i++) {
				colString = rs_data.getString(listCtHeaderCol.get(i));
				if (!mapCols.containsKey(colString.toString())) {
					lstColsx.add(new dataCell(colString, colString));
					mapCols.put(colString.toString(), ((lstColsx.size()) + listCtHeaderCol.size()) - 1);
				}
			}

			// add CTO_COL and CT_VAL columns in mapValRows

			for (int v = 0; v < ctValueCol.size(); v++) {
				colString = rs_data.getString(listCtHeaderCol.get(v));
				val = rs_data.getBigDecimal(ctValueCol.get(v));

				if (mapValRows.get(rowString) == null) {
					mapValRows.put(rowString, new HashMap<String, BigDecimal>());
					mapValRows.get(rowString).put(colString, BigDecimal.valueOf(0));
				}

				if (mapValRows.get(rowString).get(colString) == null) {
					mapValRows.get(rowString).put(colString, BigDecimal.valueOf(0));
				}

				val = BigDecimal.valueOf(val.doubleValue() + mapValRows.get(rowString).get(colString).doubleValue());
				total.set(v, total.get(v) + val.doubleValue());

				mapValRows.get(rowString).put(colString, val);

				if (v < ctValueColTotTitle.size())
					mapValRows.get(rowString).put(ctValueColTotTitle.get(v), BigDecimal.valueOf(total.get(v)));

			}

		}

		// formatting columns
		// sorting CT_ROW columns according to rowString...
		// Collections.sort(lstColsx, new Comparator<dataCell>() {
		// public int compare(dataCell othis, dataCell o2) {
		// return utils.comparDataCell(othis, o2);
		// }
		// });

		// building rest of ColumnProperties ( CT_COL) from data ...
		// colProps is parameter and excluding CT_COL with CT_VAL
		List<ColumnProperty> tmpProps = new ArrayList<ColumnProperty>();
		Map<String, String> mpcl = new HashMap<String, String>();

		// ColumnProperty tot = null;
		boolean ctDone = false;
		int max = 0;
		for (int i = 0; i < colProps.size(); i++) {

			if (colProps.get(i).pos > max) {
				max = colProps.get(i).pos;
			}
			// if any CT_VAL col found in valueCol then skip
			if (ctValueCol.indexOf(colProps.get(i).colname) >= 0)
				continue;
			if (colProps.get(i).hide_col)
				continue;
			if (listCtHeaderCol.indexOf(colProps.get(i).colname) >= 0)
				continue;

			colProps.get(i).pos = max;
			tmpProps.add(colProps.get(i));
			max++;

		}

		for (Iterator iterator = lstColsx.iterator(); iterator.hasNext();) {
			int cnt = 0;
			for (int j = 0; j < listCtHeaderCol.size(); j++) {
				String colnm = ((dataCell) iterator.next()).toString();
				ColumnProperty cp = utils.findColByCol(listCtHeaderCol.get(j), colProps);
				ColumnProperty cpn = (ColumnProperty) cp.getClone();
				String cc = cpn.colname;
				cpn.colname = colnm;
				if (colnm.indexOf("--") >= 0) {
					cpn.descr = colnm.substring(colnm.indexOf("--") + 2);
					cpn.parent_title_span = (cnt == 0 ? listCtHeaderCol.size() : 0);
					cpn.parent_title_1 = colnm.substring(0, colnm.indexOf("--"));
				} else {
					cpn.descr = colnm;
					cpn.parent_title_span = (cnt == 0 ? lstColsx.size() / listCtHeaderCol.size() : 0);
				}
				cpn.pos = max + 1;
				tmpProps.add(cpn);
				max++;
				cnt++;
			}

		}
		int cc = 0;
		for (Iterator iterator = ctValueColTotTitle.iterator(); iterator.hasNext();) {
			ColumnProperty cp = utils.findColByCol(listCtHeaderCol.get(cc), colProps);
			String cl = (String) iterator.next();
			ColumnProperty tt = cp.getClone();
			tt.colname = cl;
			tt.descr = cl;
			tmpProps.add(tt);
			cc++;
		}

		colProps.clear();
		colProps.addAll(tmpProps);

		// / adding columns
		data.getQrycols().clear();
		for (int i = 0; i < colProps.size(); i++) {
			ColumnProperty cp = colProps.get(i);
			qryColumn q = new qryColumn();
			q.setWidth(cp.display_width);
			q.setColpos(i);
			q.setColname(cp.colname);
			q.setTitle(cp.descr);
			q.setDatabaseCol(true);
			q.setDisplaySize(cp.display_width);
			q.setDatatype(Types.VARCHAR);
			if (cp.data_type.equals("NUMBER") || cp.data_type.equals("FLOAT")) {
				q.setDatatype(Types.NUMERIC);
				// q.setAlignmnet(JLabel.RIGHT);
			}
			if (cp.data_type.equals("DATE")) {
				q.setDatatype(Types.TIMESTAMP);
			}
			if (cp.summary.equals("SUM")) {
				listGroupSum.add(cp.colname);
			}
			q.columnUIProperties = cp;
			data.getQrycols().add(q);
		}

		data.getVisbleQrycols().clear();
		data.getVisbleQrycols().addAll(data.getQrycols());
		data.setCols(data.getQrycols().size());

		// fill table
		rs_data.beforeFirst();

		for (int i = 0; i < listRows.size(); i++) {
			int rowno = data.addRecord();
			String rowString = listRows.get(i);
			for (int j = 0; j < listCtRowsCol.size(); j++) {
				Object colval = mapRowsCol.get(rowString).get(listCtRowsCol.get(j));
				data.setFieldValue(rowno, listCtRowsCol.get(j), colval);
			}

			for (int j = 0; j < lstColsx.size(); j++) {
				val = mapValRows.get(rowString).get(lstColsx.get(j).toString());
				data.setFieldValue(rowno, lstColsx.get(j).toString(), val);
				// if (val != null)
				// total = total + val.doubleValue();
			}
			cc = 0;
			for (Iterator iterator = ctValueColTotTitle.iterator(); iterator.hasNext();) {
				String cl = (String) iterator.next();
				data.setFieldValue(rowno, cl, mapValRows.get(rowString).get(cl));
				cc++;
			}
		}
		data.setMasterRowsAsRows();
		String ret = "";
		// String met = data.getJSONMetaData();
		ret = data.getJSONData(false);

		return ret;
	}

}
