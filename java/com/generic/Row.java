/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.generic;

import java.io.Serializable;
import java.util.ArrayList;

/**
 * 
 * @author yusuf
 */
public class Row implements Serializable {

	public final static String ROW_DELETED = "DELETED";
	public final static String ROW_QUERIED = "QUERIED";
	public final static String ROW_INSERTED = "INSERTED";
	public final static String ROW_UPDATED = "UPDATED";
	public final static String ROW_NEW = "NEW";

	public Row() {
		this.cols = 0;
	}

	public Row(int col) {
		this.cols = col;
		for (int i = 0; i < col; i++) {
			lst.add(new dataCell("", ""));
		}
	}

	public int cols = 0;
	public int rowno = 0;
	private String rowStatus = ROW_NEW;

	public String getRowStatus() {
		return rowStatus;
	}

	public void setRowStatus(String rowStatus) {
		this.rowStatus = rowStatus;
	}

	public ArrayList<dataCell> lst = new ArrayList<dataCell>();

	public Object[] getStrings() {
		return lst.toArray();
	}
};
