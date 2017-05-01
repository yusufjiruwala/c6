package com.generic;

import java.util.List;
import java.util.Map;

public class ColumnProperty {
	public static interface ColumnAction {
		// value to be return , vl= validated value from table cell , and return
		// should be
		// for assinging to data mode.
		public Object onValueChange(int rowno, String colname, Object vl);
	}

	public static interface afterModelUpdated {
		// value to be return , vl= validated value from table cell , and return
		// should be
		// for assinging to data mode.
		public Object onValueChange(int rowno, String colname, Object vl);
	}

	public static final String QTY_FORMAT = "QTY_FORMAT";
	public static final String SHORT_DATE_FORMAT = "SHORT_DATE_FORMAT";
	public static final String MONEY_FORMAT = "MONEY_FORMAT";
	public static final String ALIGN_RIGHT = "ALIGN_RIGHT";
	public static final String ALIGN_LEFT = "ALIGN_LEFT";
	public static final String ALIGN_CENTER = "ALIGN_CENTER";
	public String colname = "";
	public String display_type = "";
	public int display_width = 0;
	public String descr = "";
	public int pos = 0;
	public String display_align = "";
	public String display_format = "";
	public Class col_class = null;
	public String other_styles = "";
	public ColumnAction action = null;
	public afterModelUpdated actionAfterUpdate = null;
	public String onCheckValue = "";
	public String onUnCheckValue = "";
	public List<dataCell> lov_sql = null;
	public String data_type = "";
	public String summary = "";
	public String searchListSQL = "";
	public String listSQL = "";
	public String searchKeyColumn = "";
	public String searchLookUpColumn = "";
	public SelectionListener SearchSelecitonEvent = null;
	public Object defaultValue = null;
	public Map<String, String> mapReturns = null;
	
	@Override
	public String toString() {
		return descr;
	}

	public ColumnProperty getClone() {
		ColumnProperty cp = new ColumnProperty();
		cp.colname = this.colname;
		cp.display_type = this.display_type;
		cp.display_width = this.display_width;
		cp.descr = this.descr;
		cp.pos = this.pos;
		cp.display_align = this.display_align;
		cp.display_format = this.display_format;
		cp.col_class = this.col_class;
		cp.other_styles = this.other_styles;
		cp.onCheckValue = this.onCheckValue;
		cp.onUnCheckValue = this.onUnCheckValue;
		cp.summary = this.summary;
		cp.searchLookUpColumn = this.searchLookUpColumn;
		cp.SearchSelecitonEvent = this.SearchSelecitonEvent;
		cp.listSQL = this.listSQL;
		cp.searchListSQL = this.searchListSQL;
		cp.searchKeyColumn = this.searchKeyColumn;
		if (this.lov_sql != null) {
			cp.lov_sql.addAll(lov_sql);
		}
		cp.data_type = this.data_type;
		return cp;

	}

	public interface SelectionListner {
		public void onSelection();
	}
	public static interface SelectionListener {
		public void onSelection();
	};

	
}
