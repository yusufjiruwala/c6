package com.controller;

import java.io.File;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.generic.DBClass;
import com.generic.QueryExe;
import com.generic.localTableModel;
import com.generic.utils;

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
			if (params.get("command").equals("get-init-files")) {
				ret = getInitFiles(params);
				return ret;
			}

			if (!instanceInfo.isMlogonSuccessed())
				throw new Exception("Access denied !");
			if (params.get("command").equals("get-current-profile")) {
				ret = utils.getJSONStr("code", instanceInfo.getmCurrentProfile(), false);
				ret += "," + utils.getJSONStr("name", instanceInfo.getmCurrentProfileName(), false);
				ret = "{" + ret + "}";
			}

			if (params.get("command").equals("get-profile-list")) {
				ret = "";
				for (Iterator iterator = instanceInfo.getmListProfiles().iterator(); iterator.hasNext();) {
					String pf = (String) iterator.next();
					ret += (ret.length() == 0 ? "" : ",")
							+ utils.getJSONStr(pf, instanceInfo.getmMapProfiles().get(pf), false);
				}
				ret = "{" + ret + "}";
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

	// all helper functions

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
				wc.add(key.replace("and-equal-", "") + "=" + params.get(key));
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
