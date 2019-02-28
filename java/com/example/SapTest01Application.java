package com.example;

import org.apache.coyote.http11.AbstractHttp11Protocol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.embedded.tomcat.TomcatConnectorCustomizer;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

import com.controller.InstanceInfo;
import com.models.Batches;

@ComponentScan({ "com.controller", "com.models" })
@SpringBootApplication
public class SapTest01Application extends SpringBootServletInitializer {

	private int maxUploadSizeInMb = 10 * 1024 * 1024; // 10 MB


	private com.models.Batches batch = new Batches();

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(SapTest01Application.class);
	}

	public static void main(String[] args) {
		SpringApplication.run(SapTest01Application.class, args);
	}

	@Bean
	public InstanceInfo getInstance() {
		return new InstanceInfo();
	}

	@Bean
	public Batches getBatches() {
		return batch;
	}

	public TomcatEmbeddedServletContainerFactory tomcatEmbedded() {

		TomcatEmbeddedServletContainerFactory tomcat = new TomcatEmbeddedServletContainerFactory();

		tomcat.addConnectorCustomizers((TomcatConnectorCustomizer) connector -> {
			if ((connector.getProtocolHandler() instanceof AbstractHttp11Protocol<?>)) {
				// -1 means unlimited
				((AbstractHttp11Protocol<?>) connector.getProtocolHandler()).setMaxSwallowSize(-1);
			}
		});

		return tomcat;

	}

}
