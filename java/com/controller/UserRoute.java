package com.controller;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

			if (params.get("command").equals("get-menu-path")) {
				ret = utils.generateMenuPath(params.get("group"), params.get("parent"), params.get("code"),
						instanceInfo.getmDbc().getDbConnection());
				ret = utils.getJSONStr("return", ret, true);
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
			if (rs != null)
				rs.close();
		} catch (SQLException e) {
			sql.setRet("server_error : " + e.getMessage());
			sql.setData("");
			e.printStackTrace();
		}

		return new ResponseEntity<SQLJson>(sql, HttpStatus.OK);
	}

	@RequestMapping(value = "/sqlmetadata", method = RequestMethod.POST)
	public ResponseEntity<SQLJson> testm(@RequestBody SQLJson sql) {
		sql.setRet("ok");
		String retdata = "";
		try {
			Connection con = instanceInfo.getmDbc().getDbConnection();
			ResultSet rs = QueryExe.getSqlRS(sql.getSql(), con);
			retdata = utils.getJSONsqlMetaData(rs, con, "", "");
			sql.setData(retdata);
			sql.setRet("SUCCESS");
			if (rs != null)
				rs.close();
		} catch (SQLException e) {
			sql.setRet("server_error : " + e.getMessage());
			sql.setData("");
			e.printStackTrace();
		}

		return new ResponseEntity<SQLJson>(sql, HttpStatus.OK);
	}

	@RequestMapping(value = "/gaugedata", method = RequestMethod.GET)
	public String gaugedata(@RequestParam Map<String, String> params) {
		SimpleDateFormat sdf = new SimpleDateFormat(instanceInfo.getMmapVar().get("ENGLISH_DATE_FORMAT") + "");
		String retdata = "";
		try {

			String sq = "select *from C6_DB_GAUGES where profiles like '%\""
					+ instanceInfo.getMmapVar().get("PROFILENO") + "\"%' ORDER BY KEYFLD";
			Connection con = instanceInfo.getmDbc().getDbConnection();
			localTableModel lctb = new localTableModel();
			lctb.createDBClassFromConnection(con);
			lctb.executeQuery(sq, true);
			double val = 0;
			for (int i = 0; i < lctb.getRowCount(); i++) {
				String sqv = utils.nvl(lctb.getFieldValue(i, "SQL_VAL"), "");
				QueryExe qe = new QueryExe(sqv, con);
				for (String key : params.keySet()) {
					qe.setParaValue(key.replace("_para_", ""), params.get(key));
					if (params.get(key).startsWith("@"))
						qe.setParaValue(key.replace("_para_", ""), (sdf.parse(params.get(key).substring(1))));
				}
				ResultSet rs = qe.executeRS();
				if (rs != null) {
					rs.first();
					lctb.setFieldValue(i, "SQL_VAL", rs.getDouble(1));
					rs.close();
					qe.close();
				}

				if (!utils.nvl(lctb.getFieldValue(i, "PRIOR_FUNC_VAL"), "").isEmpty()) {
					sqv = utils.nvl(lctb.getFieldValue(i, "PRIOR_FUNC_VAL"), "");
					qe = new QueryExe(sqv, con);
					for (String key : params.keySet()) {
						qe.setParaValue(key.replace("_para_", ""), params.get(key));
						if (params.get(key).startsWith("@"))
							qe.setParaValue(key.replace("_para_", ""), (sdf.parse(params.get(key).substring(1))));
					}
					rs = qe.executeRS();
					if (rs != null) {
						rs.first();
						lctb.setFieldValue(i, "PRIOR_FUNC_VAL", rs.getDouble(1));
						rs.close();
						qe.close();
					}
				}
			}

			retdata = lctb.getJSONData();

		} catch (SQLException | ParseException e) {
			e.printStackTrace();

		}

		return retdata;
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

	@RequestMapping(value = "/report", method = RequestMethod.POST, produces = "application/pdf")
	public ResponseEntity<InputStreamResource> getReportPdf(@RequestParam Map<String, String> params) {
		String filename = servletContext.getRealPath("") + "reports/" + params.get("reportfile");

		byte[] pdfFile = null;
		try {
			pdfFile = getReport(params);
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.parseMediaType("application/pdf"));
			headers.add("Access-Control-Allow-Origin", "*");
			headers.add("Access-Control-Allow-Methods", "GET, POST, PUT");
			headers.add("Access-Control-Allow-Headers", "Content-Type");
			headers.add("Content-Disposition", "filename=" + filename);
			headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
			headers.add("Pragma", "no-cache");
			headers.add("Expires", "0");
			ByteArrayInputStream bt = new ByteArrayInputStream(pdfFile);
			ResponseEntity<InputStreamResource> response = new ResponseEntity<InputStreamResource>(
					new InputStreamResource(bt), headers, HttpStatus.OK);
			return response;
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return null;

	}

	@PostMapping("/upload/report/pic")
	public ResponseEntity<?> uploadFileMulti(@RequestParam("extraField") String extraField,
			@RequestParam("files") MultipartFile[] uploadfiles) {

		// Get file name
		String uploadedFileName = Arrays.stream(uploadfiles).map(x -> x.getOriginalFilename())
				.filter(x -> !StringUtils.isEmpty(x)).collect(Collectors.joining(" , "));

		if (StringUtils.isEmpty(uploadedFileName)) {
			return new ResponseEntity("please select a file!", HttpStatus.OK);
		}

		try {

			saveUploadedFiles(Arrays.asList(uploadfiles));

		} catch (IOException e) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}

		return new ResponseEntity("Successfully uploaded - " + uploadedFileName, HttpStatus.OK);

	}

	@RequestMapping(value = "/uploadImage2", method = RequestMethod.POST)
	public @ResponseBody String uploadImage(@RequestParam Map<String, String> params, HttpServletRequest request) {
		String imageValue = params.get("imageValue");
		try {
			byte[] imageByte = Base64.decodeBase64(imageValue);
			String directory = servletContext.getRealPath("/") + "reports/sample.jpg";
			new FileOutputStream(directory).write(imageByte);
			return "success ";
		} catch (Exception e) {
			return "error = " + e;
		}

	}

	@PostMapping("/uploadImageRep")
	public ResponseEntity<?> uploadImageRep(@RequestParam("data") MultipartFile avatar,
			@RequestParam("filename") String fn) {
		try {
			byte[] bytes = avatar.getBytes();
			String directory = servletContext.getRealPath("/") + "reports/"+fn+".jpg";
			new FileOutputStream(directory).write(bytes);
			return new ResponseEntity("Successfully uploaded ", HttpStatus.OK);

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
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
		String b4_sql = QueryExe.getSqlValue(
				"select BEFORE_SQL_EXE from c6_subreps where keyfld=" + params.get("_keyfld"), con, "") + "";

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

		QueryExe qep = null;
		if (!b4_sql.isEmpty()) {
			qep = new QueryExe(con);
			qep.setSqlStr(b4_sql);
			qep.parse();
		}

		QueryExe qe = new QueryExe(con);
		qe.setSqlStr(sql);
		qe.parse();

		for (int i = 0; i < fn; i++) {
			for (String key : params.keySet()) {
				qe.setParaValue(key.replace("_para_", ""), params.get(key));
				if (qep != null)
					qep.setParaValue(key.replace("_para_", ""), params.get(key));

				if (params.get(key).startsWith("@"))
					qe.setParaValue(key.replace("_para_", ""), (sdf.parse(params.get(key).substring(1))));
				if (qep != null && params.get(key).startsWith("@"))
					qep.setParaValue(key.replace("_para_", ""), (sdf.parse(params.get(key).substring(1))));
			}
			for (String l : lstf) {
				String p = params.get("_flds_" + i + "_" + l);
				if (p != null && !p.isEmpty()) {
					qe.setParaValue(l.replaceAll(" ", "_"), p);
					if (qep != null)
						qep.setParaValue(l.replaceAll(" ", "_"), p);

					if (p.startsWith("@"))
						qe.setParaValue(l.replaceAll(" ", "_"), (sdf.parse(p.substring(1))));
					if (qep != null && p.startsWith("@"))
						qep.setParaValue(l.replaceAll(" ", "_"), (sdf.parse(p.substring(1))));

				}
			}

			if (qep != null)
				qep.execute(true);

			ResultSet rs = qe.executeRS(true);
			if (rs == null)
				continue;
			ResultSetMetaData rsm = rs.getMetaData();
			lctb.fetchData(rs, (i != 0));
			rs.close();

		}
		try {
			con.commit();
		} catch (SQLException ex) {
			ex.printStackTrace();
			con.rollback();
			throw ex;
		}

		ResultSet rs = QueryExe.getSqlRS("select *from c6_subreps where keyfld=" + params.get("_keyfld"), con);
		if (rs != null) {
			rs.first();
			if (rs.getString("REP_TYPE").equals("TABLE")) {
				if (!utils.nvl(rs.getString("groups"), "").isEmpty()) {
					String[] sp = utils.nvl(rs.getString("groups"), "").split(",");
					for (String s : sp) {
						qryColumn qc = lctb.getColByName(s);
						lctb.applyDefaultCP(qc);
						qc.columnUIProperties.isGrouped = true;
					}
				}
				if (!utils.nvl(rs.getString("hidden_fields"), "").isEmpty()) {
					String[] sp = utils.nvl(rs.getString("hidden_fields"), "").split(",");
					for (String s : sp) {
						qryColumn qc = lctb.getColByName(s);
						lctb.applyDefaultCP(qc);
						qc.columnUIProperties.hide_col = true;
					}
				}
				if (!utils.nvl(rs.getString("sum_fields"), "").isEmpty()) {
					String[] sp = utils.nvl(rs.getString("sum_fields"), "").split(",");
					for (String s : sp) {
						qryColumn qc = lctb.getColByName(s);
						lctb.applyDefaultCP(qc);
						qc.columnUIProperties.summary = "SUM";
					}
				}
				if (!utils.nvl(rs.getString("WIDTH_FIELDS"), "").isEmpty()) {
					String[] sp = utils.nvl(rs.getString("WIDTH_FIELDS"), "").split(",");
					for (String s : sp) {
						String[] ss = s.split("=");
						qryColumn qc = lctb.getColByName(ss[0]);
						lctb.applyDefaultCP(qc);
						qc.columnUIProperties.display_width = Integer.valueOf(ss[1]);
					}
				}
				if (!utils.nvl(rs.getString("FORMAT_FIELDS"), "").isEmpty()) {
					String[] sp = utils.nvl(rs.getString("FORMAT_FIELDS"), "").split(",");
					for (String s : sp) {
						String[] ss = s.split("=");
						qryColumn qc = lctb.getColByName(ss[0]);
						lctb.applyDefaultCP(qc);
						qc.columnUIProperties.display_format = ss[1];
					}
				}

			}
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

		lctb.setShortDateFormat(instanceInfo.getMmapVar().get("ENGLISH_DATE_FORMAT") + "");
		ret = lctb.getJSONData();
		return ret;
	}

	private byte[] getReport(Map<String, String> params) throws Exception {
		Map<String, Object> mp = new HashMap<String, Object>();
		SimpleDateFormat sdf = new SimpleDateFormat(instanceInfo.getMmapVar().get("ENGLISH_DATE_FORMAT") + "");
		String reportfile = params.get("reportfile");
		for (String key : params.keySet()) {
			if (key.contains("_para_")) {
				mp.put(key.replace("_para_", ""), params.get(key));
				if (params.get(key).startsWith("@"))
					mp.put(key.replace("_para_", ""), (sdf.parse(params.get(key).substring(1))));
			}
		}
		mp.put("COMPANY_NAME", instanceInfo.getMmapVar().get("COMPANY_NAME"));
		mp.put("COMPANY_NAMEA", instanceInfo.getMmapVar().get("COMPANY_NAMEA"));
		mp.put("COMPANY_SPECS", instanceInfo.getMmapVar().get("COMPANY_SPECS"));
		mp.put("COMPANY_SPECSA", instanceInfo.getMmapVar().get("COMPANY_SPECSA"));
		mp.put("COMPANY_LOGO", instanceInfo.getMmapVar().get("COMPANY_LOGO"));

		byte[] pdfFile = instanceInfo.storeReport(reportfile, mp, false);
		return pdfFile;

	}

	// save file
	private void saveUploadedFiles(List<MultipartFile> files) throws IOException {

		for (MultipartFile file : files) {

			if (file.isEmpty()) {
				continue; // next pls
			}

			byte[] bytes = file.getBytes();
			Path path = Paths.get(servletContext.getRealPath("") + "report/tmp/" + file.getOriginalFilename());
			Files.write(path, bytes);

		}

	}

}
