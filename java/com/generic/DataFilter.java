package com.generic;

import java.sql.Types;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DataFilter {
	public localTableModel data = null;
	public List<String> fields = new ArrayList<String>();
	public List<Parameter> paras = new ArrayList<Parameter>();

	public String filterStr = "";
	public String dlmFieldName = "[A-Za-z ]+";
	public String dlmOp = "((\\&\\&)+|(\\|\\|))+";
	public String dlmConditionalOp = "(>=)|(<=)|>|<|=|(\\%\\%)|(@@)";
	public String dlmFieldRangeOp = "\\.\\.";

	public DataFilter() {

	}

	public DataFilter(localTableModel data) {
		this.data = data;
	}

	public void init() {
		fields.clear();
		paras.clear();
	}

	public boolean canFilterRow(Row r,localTableModel datax) {
		boolean result = false;
		if (filterStr.length() == 0) {
			return false;
		}
		int no_of_fnd = 0;
		for (int i = 0; i < paras.size(); i++) {
			if (paras.get(i).getValue() != null
					&& paras.get(i).getValue().toString().trim().length() > 0) {
				no_of_fnd++;
			}
		}
		if (no_of_fnd == 0) {
			return true;
		}
		int fnd = 0;
		String s = "";
		String fV1 = "", fV2 = "";
		for (int j = 0; j < paras.size(); j++) {
			if (r == null) {
				break;
			}
			Parameter pm = paras.get(j);
			qryColumn qc = datax.getColByName(pm.getName());
			s = utils.nvl(r.lst.get(qc.getColpos()), "");
			fV1 = pm.getValue().toString();
			fV2 = pm.getDefaultValue().toString();
			String dataType = Parameter.DATA_TYPE_STRING;
			if (qc.isNumber()) {
				dataType = Parameter.DATA_TYPE_NUMBER;
			}
			if (qc.getDatatype() == Types.DATE
					|| qc.getDatatype() == Types.TIMESTAMP
					|| qc.getDatatype() == Types.TIME) {
				s = utils.nvl(r.lst.get(qc.getColpos()).getDisplay(), "");
			}
			if (fV1.startsWith(":")) {
				fV1 = r.lst
						.get(datax.getColByName(fV1.substring(1)).getColpos())
						.getValue().toString();
			}
			if (fV2.startsWith(":")) {
				fV2 = r.lst
						.get(datax.getColByName(fV2.substring(1)).getColpos())
						.getValue().toString();
			}

			if (getCompareData(pm.operator, s, fV1, fV2, dataType)) {
				fnd++;
			}
		}
		if (fnd == no_of_fnd) {
			result = true;
		}
		return result;
	}

	public void doFilter(localTableModel data, List<Parameter> ps,
			String operator) throws Exception {
		buildFilterString(ps, operator);
		buildDataStructure();
		doFilter(data);
	}

	public void doFilter(localTableModel data) {
		if (filterStr.length() == 0) {
			data.getRows().clear();
			data.getRows().addAll(data.getMasterRows());
			return;
		}
		data.getRows().clear();
		int no_of_fnd = 0;
		for (int i = 0; i < paras.size(); i++) {
			if (paras.get(i).getValue() != null
					&& paras.get(i).getValue().toString().trim().length() > 0) {
				no_of_fnd++;
			}
		}
		if (no_of_fnd == 0) {
			data.getRows().clear();
			data.getRows().addAll(data.getMasterRows());
			return;
		}
		int fnd = 0;
		Row r = null;
		String s = "";
		String fV1 = "", fV2 = "";
		for (int i = 0; i < data.getMasterRows().size(); i++) {
			fnd = 0;
			r = data.getMasterRows().get(i);
			for (int j = 0; j < paras.size(); j++) {
				if (r == null) {
					break;
				}
				Parameter pm = paras.get(j);
				qryColumn qc = data.getColByName(pm.getName());
				s = utils.nvl(r.lst.get(qc.getColpos()), "");
				fV1 = pm.getValue().toString();
				fV2 = pm.getDefaultValue().toString();
				String dataType = Parameter.DATA_TYPE_STRING;
				if (qc.isNumber()) {
					dataType = Parameter.DATA_TYPE_NUMBER;
				}
				if (qc.getDatatype() == Types.DATE
						|| qc.getDatatype() == Types.TIMESTAMP
						|| qc.getDatatype() == Types.TIME) {
					s = utils.nvl(r.lst.get(qc.getColpos()).getDisplay(), "");
				}
				if (fV1.startsWith(":")) {
					fV1 = r.lst.get(
							data.getColByName(fV1.substring(1)).getColpos())
							.getValue().toString();
				}
				if (fV2.startsWith(":")) {
					fV2 = r.lst.get(
							data.getColByName(fV2.substring(1)).getColpos())
							.getValue().toString();
				}

				if (getCompareData(pm.operator, s, fV1, fV2, dataType)) {
					fnd++;
				}
			}
			if (fnd == no_of_fnd) {
				data.getRows().add(r);
			}
		}

	}

	public void buildDataStructure() throws Exception {
		init();
		if (filterStr.trim().length() == 0) {
			paras.clear();
			return;
		}
		String[] ss = filterStr.split(dlmOp);
		Collections.addAll(fields, ss);
		Pattern pV = Pattern.compile(dlmConditionalOp);
		Matcher mV = null;
		for (int i = 0; i < ss.length; i++) {
			String s = ss[i];
			mV = pV.matcher(s);
			if (mV.find()) {
				String[] values = s.split(dlmConditionalOp);
				if (values.length <= 0 || values.length > 2) {
					throw new Exception("filter string '" + s
							+ "' can not parse");
				}
				Parameter pm = new Parameter(values[0].trim());
				pm.setValue("", false);
				pm.setDefaultValue("");
				if (values.length == 2) {
					pm.setValue(values[1].trim(), false);
				}
				if (mV.group().equals("=") && values.length > 1
						&& values[1].contains("..")) {
					String[] values2 = values[1].split(dlmFieldRangeOp);
					pm.setValue(values2[0].trim(), false);
					if (values2.length > 1) {
						pm.setDefaultValue(values2[1].trim());
					}
				}
				pm.operator = mV.group().trim();
				paras.add(pm);
			} else {
				throw new Exception("filter string '" + s + "' can not parse");
			}

		}
	}

	public boolean getCompareData(String op, String dV, String fV1, String fV2,
			String dataType) {
		boolean result = false;
		if (fV1.trim().length() == 0 && dV.trim().isEmpty()) {
			return result;
		}
		if (!result && dataType.equals(Parameter.DATA_TYPE_STRING)
				&& op.equals("=")) {
			if (!fV2.isEmpty() && dV.compareTo(fV1) >= 0
					&& dV.compareTo(fV2) <= 0) {
				result = true;
				return result;
			}

			if (dV.compareTo(fV1) == 0) {
				result = true;
				return result;
			}

		} // "="

		if (!result && dataType.equals(Parameter.DATA_TYPE_STRING)
				&& op.equals(">") && dV.compareTo(fV1) > 0) {
			result = true;
			return result;
		} // ">"

		if (!result && dataType.equals(Parameter.DATA_TYPE_STRING)
				&& op.equals("<") && dV.compareTo(fV1) < 0) {
			result = true;
			return result;
		} // "<"

		if (!result && dataType.equals(Parameter.DATA_TYPE_STRING)
				&& op.equals(">=") && dV.compareTo(fV1) >= 0) {
			result = true;
			return result;
		} // ">="

		if (!result && dataType.equals(Parameter.DATA_TYPE_STRING)
				&& op.equals("<=") && dV.compareTo(fV1) <= 0) {
			result = true;
			return result;
		} // "<="

		if (!result && dataType.equals(Parameter.DATA_TYPE_STRING)
				&& op.equals("%%")
				&& dV.toUpperCase().indexOf(fV1.toUpperCase()) >= 0) {
			result = true;
			return result;
		} // "%"
		if (!result && dataType.equals(Parameter.DATA_TYPE_STRING)
				&& op.equals("@@")) {
			Pattern pt = Pattern.compile(fV1);
			Matcher m = pt.matcher(dV);
			if (m.find()) {
				result = true;
				return result;
			}
		} // "%"

		// //////////
		// ///////////////// for number
		double dfV2 = 0;
		double dfV1 = 0;
		double dd = 0;

		if (!fV1.isEmpty() && dataType.equals(Parameter.DATA_TYPE_NUMBER)) {
			dfV1 = Double.parseDouble(fV1);
		}
		if (!fV2.isEmpty() && dataType.equals(Parameter.DATA_TYPE_NUMBER)) {
			dfV2 = Double.parseDouble(fV2);
		}
		if (!dV.isEmpty() && dataType.equals(Parameter.DATA_TYPE_NUMBER)) {
			try {
				dd = Double.parseDouble(dV);
			} catch (NumberFormatException e) {

			}
		}

		if (!result && dataType.equals(Parameter.DATA_TYPE_NUMBER)
				&& op.equals("=")) {
			if (!fV1.isEmpty() && !fV2.isEmpty() && dd >= dfV1 && dd <= dfV2) {
				result = true;
				return result;
			}

			if (!fV1.isEmpty() && dd == dfV1) {
				result = true;
				return result;
			}

		} // "="

		if (!result && !fV1.isEmpty()
				&& dataType.equals(Parameter.DATA_TYPE_NUMBER)
				&& op.equals(">") && dd > dfV1) {
			result = true;
			return result;
		} // ">"

		if (!result && !fV1.isEmpty()
				&& dataType.equals(Parameter.DATA_TYPE_NUMBER)
				&& op.equals("<") && dd < dfV1) {
			result = true;
			return result;
		} // "<"

		if (!result && !fV1.isEmpty()
				&& dataType.equals(Parameter.DATA_TYPE_NUMBER)
				&& op.equals(">=") && dd >= dfV1) {
			result = true;
			return result;
		} // ">="

		if (!result && !fV1.isEmpty()
				&& dataType.equals(Parameter.DATA_TYPE_NUMBER)
				&& op.equals("<=") && dd <= dfV1) {
			result = true;
			return result;
		} // "<="

		if (!result && !fV1.isEmpty()
				&& dataType.equals(Parameter.DATA_TYPE_NUMBER)
				&& op.equals("%%")
				&& dV.toUpperCase().indexOf(fV1.toUpperCase()) >= 0) {
			result = true;
			return result;
		} // "%"

		return result;
	}

	public void buildFilterString(List<Parameter> ps, String operator) {
		filterStr = "";
		String op = "";
		Pattern pattern = Pattern.compile(dlmConditionalOp);
		Matcher matcher = null;
		String vl = "", oper = "=";
		boolean haveAnyValue = false;
		for (Parameter p : ps) {
			vl = utils.nvl(p.getValue(), "");
			matcher = pattern.matcher(vl);
			if (matcher.find()) {
				oper = matcher.group();
				vl = vl.substring(matcher.end());
			} else {
				oper = "=";
			}
			if (vl.trim().length() > 0) {
				haveAnyValue = true;
			}
			filterStr = filterStr + " " + op + " " + p.getName() + oper + vl;
			if (op.length() == 0) {
				op = operator;
			}
		}
		if (!haveAnyValue) {
			filterStr = "";
		}
	}
}