package com.models;


import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.DisposableBean;
import org.springframework.context.annotation.Scope;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.controller.InstanceInfo;
import com.generic.utils;
import com.tools.queries.QuickRepMetaData;


public class Batches{
	@Component
	public class UserReports extends Thread {
		public static final String STATUS_NONE = "NONE";
		public static final String STATUS_START = "START";
		public static final String STATUS_ERROR = "ERROR";
		public static final String STATUS_END = "END";
		public static final String STATUS_CANCELLED = "CANCELLED";

		public InstanceInfo instanceInfo = null;
		public QuickRepMetaData quickrepdata = null;
		public String status = this.STATUS_NONE;
		public Map<String, String> params = new HashMap<String,String>();
		private String ret = "";
		public String error_message = "";
		public String query_code = "";
		
		public String getReturnString(){
			this.status=this.STATUS_NONE;
			return this.ret;
		}
		public UserReports(String query_code, InstanceInfo i, Map<String, String> pms) {
			this.instanceInfo = i;
			this.query_code = query_code;
			this.params.clear();
			this.params.putAll(pms);
			status = this.STATUS_START;
			quickrepdata = new QuickRepMetaData(i);
		}

		@Override
		public void run() {
			System.err.println("Running thread ..."+this.query_code);
			String ret = "";

			Connection con = instanceInfo.getmDbc().getDbConnection();

			QuickRepMetaData qrm = new QuickRepMetaData(instanceInfo);
			String rid = params.get("report-id");
			try {
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
						+ "FROM c6_qry2 WHERE CODE='" + rid
						+ "' and  group_name is null and iswhere is null and cp_hidecol is null"
						+ " and  (nvl(group_name2,'ALL')='ALL'  or  group_name2 ='" + strg.trim() + "')"
						+ " and field_name in (" + cols + ")" + "  order by indexno ";

				qrm.data_cols.createDBClassFromConnection(con);
				qrm.data_cols.executeQuery(sq, true);

				this.ret = qrm.buildJson(rid, params);
				this.status = STATUS_END;
				System.err.println("ENDING thread ..."+this.query_code);
			} catch (Exception ex) {
				ex.printStackTrace();
				this.status = this.STATUS_ERROR;
				this.error_message = ex.getMessage();
			}

		}

	};

	private long t = 0;
	private List<UserReports> listUserReports = new ArrayList<UserReports>();
	private Map<String, UserReports> mapUserReports = new HashMap<String, UserReports>();

	public List<UserReports> getListUserReports() {
		return listUserReports;
	}

	public Map<String, UserReports> getMapUserReports() {
		return mapUserReports;
	}

	
	public int addBatch(String qc, InstanceInfo ii, Map<String, String> mps, boolean startTheThread) {
		UserReports ur = null;
		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + qc;
		if (mapUserReports.get(upath) != null) {
			ur = mapUserReports.get(upath);
			if (!ur.status.equals(UserReports.STATUS_START)) {
				listUserReports.remove(ur);
				mapUserReports.remove(upath);
				ur = new UserReports(qc, ii, mps);
				listUserReports.add(ur);
				mapUserReports.put(upath, ur);
			}
		} else {
			ur = new UserReports(qc, ii, mps);
			listUserReports.add(ur);
			mapUserReports.put(upath, ur);
		}
		if (startTheThread)
			ur.start();
		System.gc();

		return listUserReports.indexOf(ur);

	}

	public String fetchBatchParas(String qc, InstanceInfo ii) {
		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + qc;
		String ret = "";
		UserReports ur = null;
		if (mapUserReports.get(upath) != null && mapUserReports.get(upath).status.equals(UserReports.STATUS_START)) {
			ur = mapUserReports.get(upath);
			ret = utils.getJSONMapString(ur.params,false);
			
		}
		return ret;
	}

}
