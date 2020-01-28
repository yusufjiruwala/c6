package com.controller;

import java.io.FileOutputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.generic.DBClass;
import com.generic.QueryExe;
import com.generic.utils;

import net.sf.jasperreports.engine.JasperRunManager;

@Component
@Scope("session")
public class InstanceInfo {
	private DBClass mDbc = null;

	private boolean mLogonSuccessed = false;
	private String mLoginUser = "";
	private String mLoginPassword = "";
	private String mLoginLanguage = "EN";
	private String mLoginFile = "";
	private String mOwner = "";
	private String mOwnerPassword = "";
	private String mOwnerDBUrl = "";
	private String mCurrentProfile = "";
	private int mLoginUserPN = 0;
	public String sessionId = "";

	private Map<String, Object> mMapVars = new HashMap<String, Object>();
	private Map<String, String> mMapProfiles = new HashMap<String, String>();
	private List<String> mListProfiles = new ArrayList<String>();

	@Autowired
	private ServletContext servletContext;

	// -----------------------------------set--get--funcitons---------------------
	public String getmLoginUser() {
		return mLoginUser;
	}

	public void setmLoginUser(String mLoginUser) {
		this.mLoginUser = mLoginUser;
	}

	public String getmLoginPassword() {
		return mLoginPassword;
	}

	public void setmLoginPassword(String mLoginPassword) {
		this.mLoginPassword = mLoginPassword;
	}

	public String getmLoginFile() {
		return mLoginFile;
	}

	public void setmLoginFile(String mLoginFile) {
		this.mLoginFile = mLoginFile;
	}

	public String getmCurrentProfile() {
		return mCurrentProfile;
	}

	public String getmCurrentProfileName() {
		return mMapProfiles.get(mCurrentProfile);
	}

	public void setmCurrentProfile(String mCurrentProfile) {
		this.mCurrentProfile = mCurrentProfile;
	}

	public int getmLoginUserPN() {
		return mLoginUserPN;
	}

	public void setmLoginUserPN(int mLoginUserPN) {
		this.mLoginUserPN = mLoginUserPN;
	}

	public String getmOwner() {
		return mOwner;
	}

	public String getmOwnerPassword() {
		return mOwnerPassword;
	}

	public String getmOwnerDBUrl() {
		return mOwnerDBUrl;
	}

	public DBClass getmDbc() {
		return mDbc;
	}

	public boolean isMlogonSuccessed() {
		return mLogonSuccessed;
	}

	public void setMlogonSuccessed(boolean logonSuccessed) {
		this.mLogonSuccessed = logonSuccessed;
	}

	public Map<String, Object> getMmapVar() {
		return this.mMapVars;
	}

	public DBClass getConnection(String fn) {
		this.mLoginFile = fn;
		return getConnection();
	}

	public Map<String, String> getmMapProfiles() {
		return mMapProfiles;
	}

	public List<String> getmListProfiles() {
		return mListProfiles;
	}

	public String getmLoginLanguage() {
		return mLoginLanguage;
	}

	public void setmLoginLanguage(String mLoginLang) {
		this.mLoginLanguage = mLoginLang;
	}

	// -----------------------------------main-functions---------------------
	public DBClass getConnection() {
		try {
			if (mDbc != null) {
				mDbc.getDbConnection().close();
				mMapVars.clear();
				mListProfiles.clear();
				mMapProfiles.clear();
				// d = mDbc;
				mDbc = null;
			}
			if (mLoginFile.isEmpty())
				return null;
			if (!mLoginFile.startsWith("AUTO")) {
				utils.readVars(mMapVars, mLoginFile);
				mOwner = mMapVars.get("ini_owner") + "";
				mOwnerPassword = mMapVars.get("ini_password") + "";
				mOwnerDBUrl = mMapVars.get("ini_dburl") + "";
			} else{
				
			}
			
			mDbc = new DBClass(mOwnerDBUrl, mOwner, mOwnerPassword);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.gc(); // just remove any object not refered any more..

		return mDbc;
	}

	public String loginUser(Map<String, String> params) throws Exception {
		String ret = "";
		String user = params.get("user").toUpperCase();
		String password = params.get("password");
		String language = params.get("language");
		String file = params.get("file");
		String owner = setOwnerFile(servletContext.getRealPath("") + file);
		Integer vl = Integer.valueOf(QueryExe.getSqlValue("select nvl(max(profileno),-1) from \"" + owner + "\"."
				+ "cp_users where upper(USERNAME)='" + user + "' and password='" + password + "'",
				getmDbc().getDbConnection(), "-1") + "");
		if (vl <= -1)
			throw new Exception("Invalid user name or password !");

		setmLoginUserPN(vl);
		setmLoginUser(user);
		setmLoginPassword(password);
		setmLoginLanguage(language);
		buildProfiles();
		setMlogonSuccessed(true);
		ret = " \"login_state\":\"success\"";
		ret = "{" + ret + "," + utils.getJSONMap(getMmapVar()) + "}";		
		return ret;
	}

	public String getSettings() {
		String ret = "";
		ret = "{" + utils.getJSONMap(getMmapVar()) + "}";
		return ret;
	}

	private String setOwnerFile(String filename) throws Exception {

		getConnection(filename);
		return getMmapVar().get("ini_owner") + "";
	}

	private void buildProfiles() throws Exception {

		if (getmDbc() == null) {
			throw new Exception("Database not opened..!");
		}
		// ---------------------------------------setup-variable
		QueryExe qn = new QueryExe("SELECT VARIABLE,VALUE,0 profileno FROM  " + mOwner
				+ ".setup where setgrpno='GNR' union all " + "select variable,value,profileno from " + mOwner
				+ ".cp_user_profiles " + "  where (profileno=:PN OR PROFILENO=0) ORDER BY 3,1 ",
				getmDbc().getDbConnection());
		qn.setParaValue("PN", mLoginUserPN);
		ResultSet rs = qn.executeRS();
		getMmapVar().clear();
		rs.beforeFirst();
		while (rs.next()) {
			getMmapVar().put(rs.getString("VARIABLE"), rs.getString("VALUE"));
		}
		qn.close();
		// ---------------------------------------company-variable
		ResultSet rst = QueryExe.getSqlRS(
				"select name,namea,SPECIFICATION,SPECIFICATIONA,FILENAME from company where crnt='X'",
				getmDbc().getDbConnection());
		getMmapVar().put("COMPANY_NAME", rst.getString("NAME"));
		getMmapVar().put("COMPANY_NAMEA", rst.getString("NAMEA"));
		getMmapVar().put("COMPANY_SPECS", rst.getString("SPECIFICATION"));
		getMmapVar().put("COMPANY_SPECSA", rst.getString("SPECIFICATIONA"));
		getMmapVar().put("COMPANY_LOGO", rst.getString("FILENAME"));
		getMmapVar().put("PROFILENO", getmLoginUserPN());
		getMmapVar().put("LOGON_USER", mLoginUser);
		getMmapVar().put("LOGON_PASSWORD", mLoginPassword);
		getMmapVar().put("SESSION_ID", this.sessionId);
		rst.close();
		// ---------------------------------------profile-names
		getmMapProfiles().clear();
		getmListProfiles().clear();
		rst = QueryExe.getSqlRS(
				"select *from  C6_MAIN_GROUPS where profiles like '%\"" + getmLoginUserPN() + "\"%' ORDER BY CODE ",
				getmDbc().getDbConnection());
		rst.beforeFirst();
		while (rst.next()) {
			getmListProfiles().add(rst.getString("CODE"));
			getmMapProfiles().put(rst.getString("CODE"), rst.getString("title"));
			if (getmLoginLanguage().equals("AR"))
				getmMapProfiles().put(rst.getString("CODE"),
						utils.nvl(rst.getString("titlea"), rst.getString("title")));

		}
		rst.close();
		setmCurrentProfile(utils.nvl(getMmapVar().get("CURRENT_PROFILE_CODE"), ""));
	}

	public byte[] storeReport(final String filename, final Map<String, Object> map, boolean useTimestamp)
			throws Exception {
		Connection con = this.mDbc.getDbConnection();
		byte[] b = null;
		String fl = servletContext.getRealPath("") + "reports/";
		fl = fl.replace("\\", "/");
		map.put("SESSION_ID", this.getmLoginUser() + "_" + this.sessionId);
		map.forEach((key, value) -> System.out.println(key + ":" + value));			
		b = JasperRunManager.runReportToPdf(fl + filename + ".jasper", map, con);
		String pdffile = servletContext.getRealPath("") + "reports/" + filename + ".pdf";
		if (useTimestamp) {
			pdffile = servletContext.getRealPath("") + "reports/" + filename + System.currentTimeMillis() + ".pdf";
		}
		FileOutputStream fos = new FileOutputStream(pdffile);
		fos.write(b);
		fos.close();
		return b;
	}

}
