package com.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.generic.utils;

@Component
@Scope("singleton")
public class GlobalState {
    private String weight;
    private Map<String,String> phoneIncome=new HashMap<String,String>();

    public String getPhoneValue(String s) {
        return utils.nvl(phoneIncome.get(s),"");
    }

    public void setPhoneIncome(String phoneNo,String code) {
    	phoneIncome.put(utils.nvl(code,"1"), phoneNo);
    }
};