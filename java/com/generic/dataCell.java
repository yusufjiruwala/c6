/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.generic;

import java.io.Serializable;

/**
 * 
 * @author yusuf
 */
public class dataCell implements Serializable, Comparable<dataCell> {
	private Object value = null;
	private String display = "";
	private boolean editable = true;
	private qryColumn qrycol = null;

	public dataCell() {
		value = "";
		display = "";
	}

	public void setValue(Object lable, Object val) {
		value = val;
		if (lable != null) {
			display = lable.toString();
		} else {
			display = "";
		}
	}

	public Object getValue() {
		return this.value;
	}

	public String getDisplay() {
		return this.display;
	}

	public void setDisplay(String s) {
		this.display = s;
	}

	public dataCell(String lbl, Object vl) {
		this.display = lbl;
		this.value = vl;
	}

	public dataCell(String lbl, String vl) {
		this.display = lbl;
		this.value = vl;
	}

	public dataCell(String str) {
		this.display = str;
		this.value = str;
	}

	@Override
	public String toString() {
		return this.display;
	}

	public boolean canEdit() {
		return this.editable;
	}

	public int compareTo(dataCell o) {
		return utils.comparDataCell(this, o);
	}

}
