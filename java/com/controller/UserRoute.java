package com.controller;

import java.io.File;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.generic.DBClass;
import com.generic.QueryExe;
import com.generic.localTableModel;
import com.generic.qryColumn;
import com.generic.utils;
import com.tools.queries.QuickRepMetaData;
import com.tools.utilities.SQLJson;

@RestController
@Scope("session")
public class UserRoute {

	private String path = "";

	@Autowired
	private ServletContext servletContext;

	@Autowired
	private InstanceInfo instanceInfo;

	@RequestMapping("/connect")
	public String connectDB() {
		DBClass dbc = instanceInfo.getConnection();
		return dbc.toString();
	}

	@RequestMapping(value = "/signup", method = RequestMethod.GET)
	public String signUpNewUser(Map<String, String> params) {
		if (instanceInfo.getConnection() == null) {
			connectDB();
		}
		DBClass dbc = instanceInfo.getConnection();

		return dbc.toString();
	}

	@RequestMapping(value = "/sqltojson", method = RequestMethod.GET)
	public String getSqlJson(@RequestParam Map<String, String> params) {
		String sql = "";
		localTableModel lctb = new localTableModel();
		try {
			if (!instanceInfo.isMlogonSuccessed())
				throw new SQLException("Access denied !");

			// DBClass dbc = new
			// DBClass(instanceInfo.getmDbc().getDbConnection());
			lctb.createDBClassFromConnection(instanceInfo.getmDbc().getDbConnection());
			sql = buildSql(params);
			lctb.executeQuery(sql, true);

		} catch (SQLException e) {
			e.printStackTrace();
			return "{\"errorMsg\":\"" + e.getMessage() + "\"," + "\"sql\": \" sql -> " + sql + "\" } ";
		}

		return lctb.getJSONData();

	}

	@RequestMapping(value = "/exe", method = RequestMethod.GET)
	public String getCommonData(@RequestParam Map<String, String> params) {

		String ret = "";
		path = servletContext.getRealPath("");
		try {
			// ------------get-init-files
			if (params.get("command").equals("get-init-files")) {
				ret = getInitFiles(params);
				return ret;
			}

			// ------------if-not-logon
			if (!instanceInfo.isMlogonSuccessed())
				throw new Exception("Access denied !");

			// ------------get-current-profile
			if (params.get("command").equals("get-current-profile")) {
				ret = utils.getJSONStr("code", instanceInfo.getmCurrentProfile(), false);
				ret += "," + utils.getJSONStr("name", instanceInfo.getmCurrentProfileName(), false);
				ret = "{" + ret + "}";
			}

			// ------------get-profile-list
			if (params.get("command").equals("get-profile-list")) {
				ret = "";
				String row = "";
				for (Iterator iterator = instanceInfo.getmListProfiles().iterator(); iterator.hasNext();) {
					String pf = (String) iterator.next();
					row = utils.getJSONStr("code", pf, false);
					row = "{" + row + "," + utils.getJSONStr("name", instanceInfo.getmMapProfiles().get(pf), false)
							+ "}";
					ret += (ret.length() == 0 ? "" : ",") + row;
				}
				ret = "{ \"list\":[" + ret + "]}";
			}

			// ------------get-quickrep-metadata-header
			if (params.get("command").equals("get-quickrep-metadata")) {
				QuickRepMetaData qrm = new QuickRepMetaData(instanceInfo);
				ret = qrm.getJSONInit(params.get("report-id"));
			}

			// ------------get-quickrep-metadata-columns-groups
			if (params.get("command").equals("get-quickrep-cols")) {
				QuickRepMetaData qrm = new QuickRepMetaData(instanceInfo);
				ret = qrm.getJSONCols(params.get("report-id"));
			}

			// ------------get-quickrep-data
			if (params.get("command").equals("get-quickrep-data")) {
				ret = quickRepData(params);
			}

			if (params.get("command").equals("get-graph-query")) {
				ret = buildJsonGraphQuery(params);
			}

		} catch (Exception e) {
			e.printStackTrace();
			return "{\"errorMsg\":\"" + e.getMessage() + "\"} ";
		}
		return ret;

	}

	@RequestMapping(value = "/login", method = RequestMethod.GET)
	public String execute(@RequestParam Map<String, String> params) {
		String ret = "";
		try {
			if (!params.containsKey("user") || !params.containsKey("password") || !params.containsKey("file"))
				throw new Exception("require parameters .user , password , file");
			ret = instanceInfo.loginUser(params);
		} catch (Exception e) {
			e.printStackTrace();
			return "{\"errorMsg\":\"" + e.getMessage() + "\"," + "\"sql\": \" sql -> " + "" + "\" } ";
		}

		return ret;
	}

	@RequestMapping(value = "/sqldata", method = RequestMethod.POST)
	public ResponseEntity<SQLJson> test(@RequestBody SQLJson sql) {
		sql.setRet("ok");
		String retdata = "";
		try {
			Connection con = instanceInfo.getmDbc().getDbConnection();
			ResultSet rs = QueryExe.getSqlRS(sql.getSql(), con);
			retdata = utils.getJSONsql("data", rs, con, "", "");
			sql.setData(retdata);
			sql.setRet("SUCCESS");
			rs.close();
		} catch (SQLException e) {
			sql.setRet("server_error : " + e.getMessage());
			sql.setData("");
			e.printStackTrace();
		}

		return new ResponseEntity<SQLJson>(sql, HttpStatus.OK);
	}

	@RequestMapping(value = "/sqlexe", method = RequestMethod.POST)
	public ResponseEntity<SQLJson> sqlExe(@RequestBody SQLJson sql) {
		sql.setRet("ok");
		String retdata = "";
		Connection con = instanceInfo.getmDbc().getDbConnection();
		try {

			con.setAutoCommit(false);
			System.out.println(sql.getSql());
			int x = QueryExe.execute(sql.getSql(), con);
			sql.setRet("SUCCESS");
			con.commit();
		} catch (SQLException e) {
			sql.setRet("server_error : " + e.getMessage());
			sql.setData("");
			e.printStackTrace();
			try {
				con.rollback();
			} catch (SQLException e1) {

			}
		}

		return new ResponseEntity<SQLJson>(sql, HttpStatus.OK);
	}

	// ---------------all--helper-functions---

	private String quickRepData(Map<String, String> params) throws Exception {
		String ret = "";
		Connection con = instanceInfo.getmDbc().getDbConnection();
		QuickRepMetaData qrm = new QuickRepMetaData(instanceInfo);
		String rid = params.get("report-id");
		qrm.txtGroup1 = utils.nvl(params.get("group1"), "");
		qrm.txtGroup2 = utils.nvl(params.get("group2"), "");
		String cols = "";
		for (String colkey : params.keySet()) {
			if (colkey.startsWith("col_")) {
				cols += (cols.length() > 0 ? "," : "") + "'" + params.get(colkey) + "'";
			}
		}
		String strg = qrm.txtGroup1;
		if (!qrm.txtGroup2.isEmpty()) {
			strg = qrm.txtGroup2;
		}

		String sq = "select indexno,initcap(nvl(DISPLAY_NAME,FIELD_NAME)) FIELD_NAME,'Y' SELECTION ,COLWIDTH DISPLAY_WIDTH ,'' FILTER_TEXT,datatypex "
				+ "FROM INVQRYCOLS2 WHERE CODE='" + rid
				+ "' and  group_name is null and iswhere is null and cp_hidecol is null"
				+ " and  (nvl(group_name2,'ALL')='ALL'  or  group_name2 ='" + strg.trim() + "')"
				+ " and field_name in (" + cols + ")" + "  order by indexno ";
		qrm.data_cols.createDBClassFromConnection(con);		
		qrm.data_cols.executeQuery(sq, true);
		
		ret = qrm.buildJson(rid, params);

		return ret;

	}

	private String buildSql(Map<String, String> params) {
		List<String> cols = new ArrayList<String>();
		List<String> wc = new ArrayList<String>();
		List<String> ordby = new ArrayList<String>();

		for (String key : params.keySet()) {
			if (key.startsWith("col-"))
				cols.add(params.get(key));
			if (key.startsWith("ordby1-"))
				ordby.add(params.get(key) + " ASC");
			if (key.startsWith("ordby2-"))
				ordby.add(params.get(key) + " DESC");
			if (key.startsWith("and-equal-"))
				wc.add(key.replace("and-equal-", "") + "='" + params.get(key) + "'");
		}

		String tn = params.get("tablename");

		String c = "", w = "", o = "", sql = "";

		for (String v : ordby)
			o += (o.length() == 0 ? "" : ",") + v;
		for (String v : cols)
			c += (c.length() == 0 ? "" : ",") + v;
		for (String v : wc)
			w += (w.length() == 0 ? "" : " and ") + v;

		sql = "select " + (c.length() == 0 ? " * from " : " " + c + " from ") + tn + " "
				+ (w.length() == 0 ? "" : " where " + w) + (o.length() == 0 ? "" : " order by " + o);

		return sql;
	}

	private String getInitFiles(Map<String, String> params) {
		String ret = "";
		String fn = "";
		File dir = new File(path);
		for (File file : dir.listFiles()) {
			if (file.getName().endsWith((".ini")))
				fn += (fn.length() > 0 ? "," : "") + "{ \"file\" :" + "\"" + file.getName() + "\" }";
		}

		ret = "[" + fn + "]";

		return ret;
	}

	private String buildJsonGraphQuery(Map<String, String> params) throws Exception {
		Connection con = instanceInfo.getmDbc().getDbConnection();
		SimpleDateFormat sdf = new SimpleDateFormat(instanceInfo.getMmapVar().get("ENGLISH_DATE_FORMAT") + "");
		localTableModel lctb = new localTableModel();
		String _balfld = "";
		String _fld = "";
		String ret = "";
		String sql = QueryExe.getSqlValue("select sql from c6_subreps where keyfld=" + params.get("_keyfld"), con, "")
				+ "";
		if (sql.isEmpty())
			return "";
		// getting all fields in list from first row
		List<String> lstf = new ArrayList<String>();
		lstf.add("rn");
		String flds = "rn";
		int fn = Integer.valueOf(params.get("_total_no"));
		if (fn > 0)
			for (String key : params.keySet()) {
				if (key.startsWith("_flds_0_")) {
					lstf.add(key.replace("_flds_0_", ""));
					flds += (flds.isEmpty() ? "" : ",") + " '' " + key.replace("_flds_0_", "");					
				}
			}

		QueryExe qe = new QueryExe(con);
		qe.setSqlStr(sql);
		qe.parse();
		for (int i = 0; i < fn; i++) {
			for (String key : params.keySet()) {
				qe.setParaValue(key.replace("_para_", ""), params.get(key));
				if (params.get(key).startsWith("@"))
					qe.setParaValue(key.replace("_para_", ""), (sdf.parse(params.get(key).substring(1))));
			}
			for (String l : lstf) {
				String p = params.get("_flds_" + i + "_" + l);
				if (p != null && !p.isEmpty()) {
					qe.setParaValue(l.replaceAll(" ", "_"), p);
					if (p.startsWith("@"))
						qe.setParaValue(l.replaceAll(" ", "_"), (sdf.parse(p.substring(1))));
				}
			}

			ResultSet rs = qe.executeRS(true);
			if (rs == null)
				continue;
			ResultSetMetaData rsm = rs.getMetaData();
			lctb.fetchData(rs, (i != 0));
			rs.close();

		}

		for (int i = 0; i < lctb.getVisbleQrycols().size(); i++) {
			qryColumn qc = lctb.getVisbleQrycols().get(i);
			if (qc.isNumber() && qc.getColname().endsWith("_BAL")) {
				_balfld = qc.getColname();
				_fld = qc.getColname().replace("_BAL", "");
			}
		}

		if (lctb.getQrycols().size() > 0 && !_balfld.isEmpty()) {
			String firstFld = lctb.getColByPos(0).getColname();
			String firstColVal = "";
			double _bal = 0, tmp = 0;
			for (int i = 0; i < lctb.getRowCount(); i++) {
				if (i == 0)
					firstColVal = utils.nvl(lctb.getFieldValue(i, firstFld), "");
				if (firstColVal.equals(lctb.getFieldValue(i, firstFld))) {
					_bal += ((Number) lctb.getFieldValue(i, _fld)).doubleValue();
					lctb.setFieldValue(i, _balfld, _bal);
				} else {
					_bal = ((Number) lctb.getFieldValue(i, _fld)).doubleValue();
					lctb.setFieldValue(i, _balfld, _bal);
					firstColVal = utils.nvl(lctb.getFieldValue(i, firstFld), "");
				}

			}
		}
		lctb.setShortDateFormat(instanceInfo.getMmapVar().get("ENGLISH_DATE_FORMAT")+"");
		ret = lctb.getJSONData();
		return ret;
	}

}
