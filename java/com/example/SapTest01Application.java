package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

import com.controller.InstanceInfo;

@ComponentScan({ "com.controller" })
@SpringBootApplication
public class SapTest01Application {
	public static void main(String[] args) {
		SpringApplication.run(SapTest01Application.class, args);
	}

	@Bean
	public InstanceInfo getInstance() {
		return new InstanceInfo();
	}

}
