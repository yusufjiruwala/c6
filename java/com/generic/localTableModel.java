/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.generic;

import java.io.Serializable;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.swing.event.TableModelListener;
import javax.swing.table.TableModel;

/**
 * 
 * @author yusuf local table model buffered data in client pc and synchronize
 *         with server data in Row class.
 */
public class localTableModel implements TableModel, Serializable {

	/**
	 * 
	 * @author yusuf ros data can be initialized with number of column. class.
	 */
	public interface DefaultValueListner {
		public void setValue(dataCell dc, qryColumn qc);
	};

	public static final int SUMMARY_SUM = 0;
	public static final int SUMMARY_COUNT = 1;
	public static final int SUMMARY_MAX = 2;
	public static final int SUMMARY_MIN = 3;
	private List<String> headerText = new ArrayList<String>();
	private List<qryColumn> qrycols = new ArrayList<qryColumn>();
	private List<qryColumn> visbleQrycols = new ArrayList<qryColumn>();
	private List<Row> rows = new ArrayList<Row>();
	private List<Row> masterRows = new ArrayList<Row>();
	private List<Row> deletedRecs = new ArrayList<Row>();
	private String fetchSql = "";
	private String tableName = "";
	private String schemaName = "";
	private DBClass dbclass = null;
	private boolean editAllowed = true;
	private int cursorNo = 0;
	private String modelStatus = "NORMAL";
	private int deletedRows = 0;
	private int fetchrecs = 0;
	private rowTriggerListner rowlistner = null;
	private boolean rowsTriggerExecute = true;
	private String filterStr = "";
	private String dynamicFilter = "";
	private boolean filtering = false;
	private List<Parameter> lstFilter = new ArrayList<Parameter>();
	private int last_rowno = -1;
	private DefaultValueListner defaultValuelistner = null;

	public String getColumnsString() {
		String col = "";
		for (Iterator iterator = qrycols.iterator(); iterator.hasNext();) {
			qryColumn qc = (qryColumn) iterator.next();
			col = col + (col.isEmpty() ? "" : ",") + qc.getColname();

		}
		return col;
	}

	public void setShortDateFormat(String fmt) {
		this.shortDateFormat = fmt;

	}

	public String getMasterRowStatus(int rowno) {
		return masterRows.get(rowno).getRowStatus();
	}

	public void setMasterRowStatus(int rowno, String stat) {
		masterRows.get(rowno).setRowStatus(stat);
	}

	public void setMasterRowStatusAll(String stat) {
		for (Iterator<Row> iterator = rows.iterator(); iterator.hasNext();) {
			Row row = (Row) iterator.next();
			row.setRowStatus(stat);
		}
	}

	public DefaultValueListner getDefaultValuelistner() {
		return defaultValuelistner;
	}

	public void setDefaultValuelistner(DefaultValueListner defaultValuelistner) {
		this.defaultValuelistner = defaultValuelistner;
	}

	public String getDynamicFilter() {
		return dynamicFilter;
	}

	public void setMasterRowsAsRows() {
		masterRows.clear();
		masterRows.addAll(rows);
	}

	public void setAdvanceColumnsFilter(List<Parameter> plstFilter) throws Exception {
		DataFilter df = new DataFilter();
		df.doFilter(this, plstFilter, "&&");

	}

	public void setAdvanceColumnsFilter(String plstFilter) throws Exception {
		DataFilter df = new DataFilter(this);
		df.filterStr = plstFilter;
		df.buildDataStructure();
		df.doFilter(this);

	}

	public void setColumnsFilter(List<Parameter> plstFilter) {
		try {
			setAdvanceColumnsFilter(plstFilter);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void setColumnsFilter2(List<Parameter> plstFilter) {

		if (plstFilter == null) {
			rows.clear();
			rows.addAll(masterRows);
			return;
		}

		lstFilter.clear();
		lstFilter.addAll(plstFilter);
		rows.clear();
		int no_of_fnd = 0;
		for (int i = 0; i < lstFilter.size(); i++) {
			if (lstFilter.get(i).getValue() != null && lstFilter.get(i).getValue().toString().trim().length() > 0) {
				no_of_fnd++;
			}
		}
		if (no_of_fnd == 0) {
			rows.clear();
			rows.addAll(masterRows);
			return;
		}

		int fnd = 0;
		Row r = null;
		String s = "";
		String fl = "";
		for (int i = 0; i < masterRows.size(); i++) {
			fnd = 0;
			r = masterRows.get(i);
			for (int j = 0; j < lstFilter.size(); j++) {
				s = "";
				fl = "";
				if (r.lst.get(getColByName(lstFilter.get(j).getName()).getColpos()).getValue() != null) {
					s = r.lst.get(getColByName(lstFilter.get(j).getName()).getColpos()).getValue().toString();
				}
				if (lstFilter.get(j).getValue() != null) {
					fl = lstFilter.get(j).getValue().toString();
				}
				// string
				if (!fl.startsWith("=") && s.toUpperCase().contains(fl.toUpperCase())
						&& lstFilter.get(j).getValueType().equals(Parameter.DATA_TYPE_STRING) && fl.length() > 0) {
					fnd++;
				}
				if (fl.startsWith("=") && s.toUpperCase().equals(fl.substring(1))
						&& lstFilter.get(j).getValueType().equals(Parameter.DATA_TYPE_STRING) && fl.length() > 0) {
					fnd++;
				}

				// number
				if (fl.length() > 0 && lstFilter.get(j).getValueType().equals(Parameter.DATA_TYPE_NUMBER)) {

					String flp = fl.substring(0, 1);
					if (!flp.equals("=") && !flp.equals(">") && !flp.equals("<")) {
						fl = "=" + fl;
					}
					if (fl.indexOf("=") == 0 && fl.length() > 0 && s.length() > 0
							&& Double.valueOf(fl.substring(1)).doubleValue() == Double.valueOf(s).doubleValue()) {
						fnd++;
					}
					if (fl.indexOf(">=") == 0 && fl.length() > 0 && s.length() > 0
							&& Double.valueOf(fl.substring(2)).doubleValue() <= Double.valueOf(s).doubleValue()) {
						fnd++;
					}

					if (fl.indexOf("<=") == 0 && fl.length() > 0 && s.length() > 0
							&& Double.valueOf(fl.substring(2)).doubleValue() >= Double.valueOf(s).doubleValue()) {
						fnd++;
					}
					if (fl.indexOf(">") == 0 && fl.indexOf(">=") < 0 && fl.length() > 0 && s.length() > 0
							&& Double.valueOf(fl.substring(1)).doubleValue() < Double.valueOf(s).doubleValue()) {
						fnd++;
					}
					if (fl.indexOf("<") == 0 && fl.indexOf("<=") < 0 && fl.length() > 0 && s.length() > 0
							&& Double.valueOf(fl.substring(1)).doubleValue() > Double.valueOf(s).doubleValue()) {
						fnd++;
					}
				}
			}

			if (fnd == no_of_fnd) {
				rows.add(r);
				fnd = 0;
			}
		}
	}

	public void setDynamicFilter(String dynamicFilter) throws Exception {
		this.dynamicFilter = dynamicFilter;
		filtering = true;
		try {
			rows.clear();
			boolean fnd = false;
			Row r = null;
			for (int i = 0; i < masterRows.size(); i++) {
				r = masterRows.get(i);
				fnd = false;
				for (int j = 0; j < r.lst.size(); j++) {
					if (dynamicFilter == null || dynamicFilter.length() == 0
							|| r.lst.get(j).getDisplay().toUpperCase().contains(dynamicFilter.toUpperCase())) {
						fnd = true;
						break;
					}
				}
				if (fnd) {
					rows.add(r);
				}
			}
		} catch (Exception ex) {
			filtering = false;
			throw ex;
		}
	}

	public List<Row> getMasterRows() {
		return masterRows;
	}

	// SUMMARY ON GROUP BY
	public Double getSummaryOf(List<String> listGroupsBy, String colname, int st) {
		if (cursorNo < 0 || rows.size() <= 0) {
			return Double.valueOf(0);
		}
		if (st == SUMMARY_SUM) {
			double vl = 0;
			Map<String, Object> mp = new HashMap<String, Object>();

			setgroupByRows(listGroupsBy, mp, cursorNo);
			if (getFieldValue(cursorNo, colname) != null) {
				vl = vl + ((Number) getFieldValue(cursorNo, colname)).doubleValue();
			}

			for (int i = cursorNo - 1; i >= 0; i--) {
				if (isOldRowDiff(listGroupsBy, mp, i)) {
					return vl;
				} else {
					if (getFieldValue(i, colname) != null) {
						vl = vl + ((Number) getFieldValue(i, colname)).doubleValue();
					}
				}
			}
			return vl;
		}
		return Double.valueOf(0);
	}

	private void setgroupByRows(List<String> listGroupsBy, Map<String, Object> mp, int rown) {
		mp.clear();
		for (int i = 0; i < listGroupsBy.size(); i++) {
			mp.put(listGroupsBy.get(i), getFieldValue(rown, listGroupsBy.get(i)));

		}
	}

	private boolean isOldRowDiff(List<String> listGroupsBy, Map<String, Object> mp, int rown) {
		boolean fnd = false;
		for (int i = 0; i < listGroupsBy.size(); i++) {
			Object o = getFieldValue(rown, listGroupsBy.get(i));
			if (o == null && mp.get(listGroupsBy.get(i)) != null) {
				return true;
			}

			if (o != null && !o.toString().equals(mp.get(listGroupsBy.get(i)))) {
				return true;
			}
		}
		return false;
	}

	public double getCountOf(String colname, Object val) {
		qryColumn qc = getColByName(colname);

		if (qc == null)
			return 0;
		int cnt = 0;
		for (int i = 0; i < rows.size(); i++) {
			if (qc.isNumber() && val instanceof Number) {
				Number v = ((Number) val);
				Number cval = ((Number) getFieldValue(i, colname));
				if (cval.doubleValue() == v.doubleValue())
					cnt++;
			}
			if (val instanceof String) {
				if (getFieldValue(i, colname).toString().toUpperCase().equals(((String) val).toUpperCase()))
					cnt++;
			}
		}
		return cnt;
	}

	public Double getSummaryOf(String colname, int st) {
		Double sum = Double.valueOf(0);
		if (st == SUMMARY_SUM /* && getColByName(colname).isNumber() */) {
			for (int i = 0; i < rows.size(); i++) {
				if (getFieldValue(i, colname) != null) {
					sum = sum + ((Number) getFieldValue(i, colname)).doubleValue();
				}
			}
		}

		if (st == SUMMARY_MAX) {
			sum = null;
			Number dt = null;
			sum = Double.MIN_VALUE;
			boolean fnd = false;
			for (int i = 0; i < rows.size(); i++) {
				dt = ((Number) getFieldValue(i, colname));
				if (dt != null && dt.doubleValue() > sum) {
					sum = dt.doubleValue();
					fnd = true;
				}
			}
			if (!fnd) {
				sum = Double.valueOf(0);
			}
		}

		return sum;
	}

	public String getFilterStr() {
		return filterStr;
	}

	public void setFilterStr(String filterStr) {
		this.filterStr = filterStr;
	}

	public boolean isRowsTriggerExecute() {
		return rowsTriggerExecute;
	}

	public rowTriggerListner getRowlistner() {
		return rowlistner;
	}

	public void setRowlistner(rowTriggerListner rowlistner) {
		this.rowlistner = rowlistner;
	}

	public List<Row> getDeletedRecs() {
		return deletedRecs;
	}

	public List<qryColumn> getVisbleQrycols() {
		return visbleQrycols;
	}

	public int getFetchrecs() {
		return fetchrecs;
	}

	public void setFetchrecs(int fetchrecs) {
		this.fetchrecs = fetchrecs;
	}

	public int getDeletedRows() {
		return deletedRows;
	}

	public String getModelStatus() {
		return modelStatus;
	}

	public int getCursorNo() {
		return cursorNo;
	}

	public void setCursorNo(int cursorNo) {
		this.cursorNo = cursorNo;
	}

	public DBClass getDbclass() {
		return dbclass;
	}

	public DBClass createDBClassFromConnection(Connection c) throws SQLException {
		dbclass = new DBClass(c);
		return dbclass;
	}

	public int addRecord() {
		return insertRecord(rows.size());
	}

	public String getFetchSql() {
		return fetchSql;
	}

	public void setFetchSql(String fetchSql) {
		this.fetchSql = fetchSql;
	}

	public List<String> getHeaderText() {
		return headerText;
	}

	public void setHeaderText(List<String> headerText) {
		this.headerText = headerText;
	}

	public String getSchemaName() {
		return schemaName;
	}

	public void setSchemaName(String schemaName) {
		this.schemaName = schemaName;
	}

	public String getTableName() {
		return tableName;
	}

	public void setTableName(String tableName) {
		this.tableName = tableName;
	}

	public boolean isEditAllowed() {
		return editAllowed;
	}

	public void setEditAllowed(boolean editAllowed) {
		this.editAllowed = editAllowed;
	}

	public List<qryColumn> getQrycols() {
		return qrycols;
	}

	public Row findRow(int colpos, String vl) {
		Row rw = null;
		dataCell dc = null;
		for (int i = 0; i < rows.size(); i++) {
			rw = rows.get(i);
			dc = rw.lst.get(colpos);
			String dvl = dc.getValue().toString().trim();
			if (dvl.equals(vl)) {
				return rw;
			}
		}
		return null;
	}

	public List<Row> getRows() {
		return rows;
	}

	private int cols = 0;
	private String sqlString = "";
	private String shortDateFormat = "dd/MM/yyyy";

	public localTableModel() {
		this.cols = 0;
	}

	public localTableModel(int cols) {
		this.cols = cols;
	}

	public int getRealColPositionNo(int po) {
		int rp = 0, i = 0;
		for (i = 0; i < qrycols.size(); i++) {
			if (qrycols.get(i).isVisible()) {
				rp++;
			}
			if (rp == po) {
				return i;
			}
		}
		return i;
	}

	public qryColumn getColByPos(int posno) {
		return visbleQrycols.get(posno);
	}

	public qryColumn getColByName(String name) {
		for (int i = 0; i < qrycols.size(); i++) {
			if (qrycols.get(i).getColname().trim().toUpperCase().equals(name.trim().toUpperCase())) {
				return qrycols.get(i);
			}
		}
		return null;
	}

	public int setColumnVisible(qryColumn qc, boolean f) {
		visbleQrycols.remove(qc);
		if (f) {
			visbleQrycols.add(qc);
		}
		qc.setVisible(f);
		return 0;

	}

	public String getHeaderText(int no) {
		return visbleQrycols.get(no).getTitle();
	}

	public void addHeaderText(String tit) {
		headerText.add(tit);
	}

	public void setHeaderText(int no, String tit) {
		if (no >= headerText.size()) {
			headerText.add(tit);
		} else {
			headerText.set(no, tit);
		}
	}

	public int getHeaderCount() {
		return headerText.size();
	}

	public void fetchData(ResultSet rs, boolean add) throws SQLException {
		int tmp = 0;
		if (rs != null) {
			if (!add) {
				ResultSetMetaData rm = rs.getMetaData();
				cols = rm.getColumnCount();
				qrycols.clear();
				qrycols.addAll(utils.getColumnsList(rs));
				visbleQrycols.addAll(qrycols);
			}
			appendRows(utils.convertRows(rs, filterStr));
			cursorNo = rows.size() - 1;
		}
	}

	public void fetchData(int nextNos) throws SQLException {
		int tmp = 0;
		if (fetchSql.length() > 0) {
			dbclass.setSqlString(fetchSql);
			dbclass.parseStatment();
			dbclass.executeStatment();
			ResultSetMetaData rm = dbclass.getResultset().getMetaData();
			cols = rm.getColumnCount();
			qrycols.clear();
			qrycols.addAll(dbclass.getColumnsList());
			appendRows(dbclass.convertRows(filterStr));
			dbclass.getStatment().close();
			cursorNo = rows.size() - 1;
		}
	}

	public void fetchData() throws SQLException {
		fetchData(fetchrecs);
	}

	public void executeQuery(String sq, boolean visibleAll) throws SQLException {
		clearALl();
		fetchSql = sq;
		fetchData();
		setAllColVisible(visibleAll);
	}

	public void executeQuery(String sq, String[] visibleCol) throws SQLException {
		executeQuery(sq, false);
		for (int i = 0; i < visibleCol.length; i++) {
			setColumnVisible(getColByName(visibleCol[i]), true);
		}

	}

	public void appendRows(List<Row> rw) {
		if (rw == null) {
			return;
		}
		if (this.rows != null) {
			// this.rows.clear();
			for (int i = 0; i < rw.size(); i++) {
				Row r = rw.get(i);
				Row newr = new Row(0);
				newr.rowno = r.rowno;
				newr.cols = r.cols;
				if (newr.cols > this.cols) {
					this.cols = newr.cols;
				}
				for (int j = 0; j < r.lst.size(); j++) {
					newr.lst.add(r.lst.get(j));
				}
				last_rowno++;
				newr.rowno = last_rowno;
				this.rows.add(newr);
				this.masterRows.add(newr);
				cursorNo = rows.indexOf(newr);
				if (rowlistner != null && rowsTriggerExecute == true) {
					try {
						rowsTriggerExecute = false;
						rowlistner.onCalc(rows.indexOf(newr));
					} finally {
						rowsTriggerExecute = true;
					}
				}
			}
		}
	}

	public void setSqlString(String s) {
		this.fetchSql = s;
	}

	public String getSqlString() {
		return this.fetchSql;
	}

	public int getRowCount() {
		if (rows == null) {
			return 0;
		}
		return rows.size() - deletedRows;
	}

	public int getColumnCount() {
		return visbleQrycols.size();
	}

	public String getColumnName(int columnIndex) {

		return getHeaderText(columnIndex);
	}

	public Class<?> getColumnClass(int columnIndex) {
		return visbleQrycols.get(columnIndex).getColClass();
	}

	public boolean isCellEditable(int rowIndex, int columnIndex) {
		if (isEditAllowed() == false) {
			return false;
		}
		if (getColByPos(columnIndex).isCanEdit() == false) {
			return false;
		}

		return rows.get(rowIndex).lst.get(columnIndex).canEdit();
	}

	public Row getVisibleRow(int rowindex) {
		int vi = 0, i = 0;
		for (i = 0; i < rows.size(); i++) {
			if (!rows.get(i).getRowStatus().equals(Row.ROW_DELETED)) {
				vi++;
			}
			if ((vi - 1) == rowindex) {
				return rows.get(i);
			}
		}
		return null;
	}

	public void setAllColVisible(boolean f) {
		visbleQrycols.clear();
		for (int i = 0; i < qrycols.size(); i++) {
			qrycols.get(i).setVisible(f);
			if (f) {
				visbleQrycols.add(qrycols.get(i));
			}
		}
	}

	public Object visibleColValue(Row r, int colIndex) {
		if (colIndex > visbleQrycols.size() || visbleQrycols.get(colIndex) == null) {
			return null;
		}
		return r.lst.get(visbleQrycols.get(colIndex).getColpos());
	}

	public dataCell visibleColDisplay(Row r, int colIndex) {
		if (colIndex > visbleQrycols.size() || visbleQrycols.get(colIndex) == null) {
			return null;
		}
		return r.lst.get(visbleQrycols.get(colIndex).getColpos());
	}

	public Object getValueAt(int rowIndex, int columnIndex) {
		Row r = getVisibleRow(rowIndex);
		if (r == null) {
			return null;
		}
		Object s = visibleColValue(r, columnIndex);
		/*
		 * if (visbleQrycols.get(columnIndex).getNumberFormat().length() > 0) {
		 * if (s != null && ((dataCell) s).getValue() != null && ((dataCell)
		 * s).getValue().toString().length() > 0) { s = (new
		 * DecimalFormat(visbleQrycols
		 * .get(columnIndex).getNumberFormat()).format
		 * (Double.valueOf(((dataCell) s).getValue().toString()))); } }
		 */
		return s;
	}

	public String getDisplayAt(int rowIndex, int columnIndex) {
		Row r = rows.get(rowIndex);
		Object s = visibleColDisplay(r, columnIndex);// r.lst.get(columnIndex).getDisplay();
		if (visbleQrycols.get(columnIndex).getNumberFormat().length() > 0) {
			if (s != null && s instanceof dataCell && ((dataCell) s).getValue() != null
					&& ((dataCell) s).getValue().toString().length() > 0) {
				s = (new DecimalFormat(visbleQrycols.get(columnIndex).getNumberFormat())
						.format(Double.valueOf(((dataCell) s).getValue().toString())));
			}
		}
		if (visbleQrycols.get(columnIndex).getDateFormat().length() > 0) {
			if (s != null && s instanceof dataCell && ((dataCell) s).getValue() != null
					&& ((dataCell) s).getValue().toString().length() > 0) {
				s = (new SimpleDateFormat(visbleQrycols.get(columnIndex).getDateFormat())
						.format((java.sql.Date) ((dataCell) s).getValue()));
			}
		}
		return s.toString();
	}

	public void setFieldValue(int rowno, String colname, Object value) {

		rows.get(rowno).lst.get(getColByName(colname).getColpos()).setValue(utils.nvl(value, ""), value);
		if (rowlistner != null && rowsTriggerExecute == true) {
			try {
				rowsTriggerExecute = false;
				rowlistner.onCalc(rowno);
			} finally {
				rowsTriggerExecute = true;
			}
		}

	}

	public void setFieldValue(String colname, Object value) {
		setFieldValue(cursorNo, colname, value);
	}

	public Object getFieldValue(int rowno, String colname) {
		if (getColByName(colname) == null) {
			return null;
		}
		if (rowno >= rows.size()) {
			return null;
		}
		int cps = getColByName(colname).getColpos();
		if (cps >= rows.get(rowno).lst.size()) {
			return null;
		}
		return rows.get(rowno).lst.get(cps).getValue();
	}

	public int getIndexByRowno(int rowno) {
		for (int i = 0; i < rows.size(); i++) {
			if (rows.get(i).rowno == rowno) {
				return i;
			}
		}
		return rowno;
	}

	public Object getFieldValue(String colname) {
		return getFieldValue(cursorNo, colname);
	}

	public void clearALl() {
		lstFilter.clear();
		for (int i = 0; i < masterRows.size(); i++) {
			masterRows.get(i).lst.clear();
		}
		rows.clear();
		masterRows.clear();
		qrycols.clear();
		visbleQrycols.clear();
		headerText.clear();
		cols = 0;
		cursorNo = -1;
		last_rowno = -1;
	}

	public void setCols(int col) {
		this.cols = col;
	}

	public void setValueAt(Object aValue, int rowIndex, int columnIndex) {
		Row r = rows.get(rowIndex);
		dataCell s = r.lst.get(columnIndex);
		s.setValue(aValue, aValue);
	}

	public void setDisplayAt(String aValue, int rowIndex, int columnIndex) {
		Row r = rows.get(rowIndex);
		dataCell s = r.lst.get(columnIndex);
		s.setDisplay(aValue.toString());
	}

	public void addTableModelListener(itableModelListener l) {
	}

	public void removeTableModelListener(itableModelListener l) {
	}

	public void addTableModelListener(TableModelListener l) {
	}

	public void removeTableModelListener(TableModelListener l) {
	}

	public int insertRecord(int index) {
		Row r = new Row(cols);
		r.setRowStatus(Row.ROW_INSERTED);
		r.rowno = rows.size() + deletedRecs.size();
		for (int i = 0; i < cols; i++) {
			r.lst.get(i).setValue(qrycols.get(i).getDefaultValue(), qrycols.get(i).getDefaultDisplay());
		}
		if (index == rows.size()) {
			rows.add(r);
		} else {
			rows.add(index, r);
		}
		cursorNo = rows.indexOf(r);
		if (rowlistner != null && rowsTriggerExecute == true) {
			try {
				rowsTriggerExecute = false;
				rowlistner.onCalc(cursorNo);
			} finally {
				rowsTriggerExecute = true;
			}
		}
		if (defaultValuelistner != null && rowsTriggerExecute == true) {
			try {
				rowsTriggerExecute = false;
				for (int i = 0; i < r.lst.size(); i++) {
					defaultValuelistner.setValue(r.lst.get(i), getVisbleQrycols().get(i));
				}
				if (rowlistner != null) {
					rowlistner.onCalc(cursorNo);
				}

			} finally {
				rowsTriggerExecute = true;
			}
		}

		return rows.indexOf(r);
	}

	public void moveFirst() {
		if (rows.size() > 0) {
			cursorNo = 0;
		} else {
			cursorNo = -1;
		}
	}

	public void moveNext() {
		if (rows.size() < cursorNo + 1) {
			cursorNo++;
		}

	}

	public void movePrior() {
		if (cursorNo - 1 > 0) {
			cursorNo--;
		}

	}

	public static final int FIND_LIKE = 0;
	public static final int FIND_EXACT = 1;

	public int locate(String col, String vl, int findOption) {
		for (int i = 0; i < rows.size(); i++) {
			if (findOption == FIND_EXACT && getFieldValue(i, col).toString().equals(vl)) {
				cursorNo = i;
				return i;
			}
			if (findOption == FIND_LIKE && getFieldValue(i, col).toString().toUpperCase().contains(vl)) {
				cursorNo = i;
				return i;
			}

		}
		return -1;
	}

	public int getRealRowNo(int rowno) {
		int rowindex = 0;
		for (Iterator iterator = rows.iterator(); iterator.hasNext();) {
			Row rw = (Row) iterator.next();
			if (rowno == rw.rowno) {
				return rowindex;
			}
			rowindex++;
		}
		return -1;
	}

	public boolean deleteRow(int rowno) {
		int rn = getRealRowNo(rowno);
		if (rn < 0) {
			return false;
		}
		Row r = rows.get(rn);
		if (r.getRowStatus().equals(Row.ROW_INSERTED)) {
			cursorNo = rows.indexOf(r);
			rows.remove(r);
		} else {
			deletedRecs.add(r);
			deletedRows++;
			r.setRowStatus(Row.ROW_DELETED);
			cursorNo = rows.indexOf(r);
			rows.remove(r);
		}
		if (cursorNo >= rows.size()) {
			cursorNo = rows.size() - 1;
			if (rowlistner != null && rowsTriggerExecute == true) {
				try {
					rowsTriggerExecute = false;
					rowlistner.onCalc(cursorNo);
				} finally {
					rowsTriggerExecute = true;
				}
			}
		}
		if (rows.size() == 0) {
			cursorNo = -1;
		}
		return true;
	}

	public void deleteRow() {
		if (cursorNo < 0) {
			return;
		}
		deleteRow(cursorNo);
	}

	public void sethideCols(List<String> listHideCols) {
		for (Iterator iterator = listHideCols.iterator(); iterator.hasNext();) {
			String string = (String) iterator.next();
			getVisbleQrycols().remove(getColByName(string));
		}

	}

	public void calculate() {
		calculate(cursorNo);
	}

	public void calculate(int rown) {
		if (rowlistner != null && rowsTriggerExecute == true) {
			try {
				rowsTriggerExecute = false;
				rowlistner.onCalc(rown);
			} finally {
				rowsTriggerExecute = true;
			}
		}

	}

	public void applyDefaultCP(qryColumn qc) {
		applyDefaultCP(qc, false);
	}

	
	public void applyDefaultCP(qryColumn qc, boolean recreate) {
		ColumnProperty cp = qc.columnUIProperties;
		if (cp == null || recreate)
			cp = new ColumnProperty();
		cp.colname = qc.getColname();
		cp.data_type = (qc.isDateTime() ? "DATE" : qc.isNumber() ? "NUMBER" : "VARCHAR2");
		cp.descr = cp.colname;
		cp.display_align = (qc.isNumber() ? "RIGHT" : "LEFT");
		qc.columnUIProperties = cp;

	}

	public String getJSONMetaData() {
		String md1 = "";
		String md2 = "";
		for (qryColumn qc : visbleQrycols) {
			ColumnProperty cp = qc.columnUIProperties;
			if (qc.columnUIProperties == null) {
				applyDefaultCP(qc);
				cp = qc.columnUIProperties;
			}
			md2 = "{" + utils.getJSONCP(cp) + "}";
			md1 += (md1.length() > 0 ? "," : "") + md2;
		}
		return "\"metadata\":[ " + md1 + " ]";
	}

	public String getJSONData() {
		return getJSONData(true);
	}

	public String getJSONData(boolean bracket) {
		String md = getJSONMetaData();
		String d1 = "";
		String dr = "";
		String d2 = "";
		Object vl = "";
		SimpleDateFormat sdf = new SimpleDateFormat(shortDateFormat);
		for (int i = 0; i < getRowCount(); i++) {
			dr = "";
			for (qryColumn qc : visbleQrycols) {
				if (qc.getColname()==null)
					continue;
				vl = getFieldValue(i, qc.getColname());
				if (qc.isDateTime())
					vl = sdf.format(vl);
				dr += (dr.length() > 0 ? "," : "") + utils.getJSONStr(qc.getColname(), vl, false);
			}
			d1 += (d1.length() > 0 ? "," : "") + "{" + dr + "}";
		}

		return (bracket ? "{" : "") + md + ",\"data\":[ " + d1 + "]" + (bracket ? "}" : "");

	}

}