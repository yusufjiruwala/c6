package com.controller;

import java.io.File;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
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
import com.generic.dataCell;
import com.generic.localTableModel;
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

			DBClass dbc = instanceInfo.getConnection();
			lctb.createDBClassFromConnection(dbc.getDbConnection());
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

	@RequestMapping(value = "/test", method = RequestMethod.POST)
	public ResponseEntity<SQLJson> test(@RequestBody SQLJson sql) {
		sql.setRet("ok");
		String retdata = "";
		try {
			Connection con = instanceInfo.getmDbc().getDbConnection();
			ResultSet rs = QueryExe.getSqlRS(sql.getSql(), con);
			retdata = utils.getJSONsql("data", rs, con, "", "");
			sql.setData(retdata);
			sql.setRet("OK");
		} catch (SQLException e) {
			sql.setRet("server_error : " + e.getMessage());
			sql.setData("");
			e.printStackTrace();
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
				+ " and  (nvl(group_name2,'ALL')='ALL'  or  group_name2 ='" + strg + "')"
				+ " and field_name in (" + cols + ")" + "  order by indexno ";
		qrm.data_cols.createDBClassFromConnection(con);
		qrm.data_cols.executeQuery(sq, true);
		String sql = qrm.buildSql(rid);
		System.out.println(sql);
		QueryExe qe = new QueryExe(sql, con);
		for (String key : params.keySet()) {
			if (key.startsWith("_para_")) {
				System.out.println("para # " + key + " = " + params.get(key));
				qe.setParaValue(key.replace("_para_", ""), params.get(key));
			}

		}
		ResultSet rs = qe.executeRS();
		ret = "{" + utils.getJSONsqlMetaData(rs, con, "", "") + "}";
		qe.close();

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

}
