package com.insurance.claim.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:jdbc:sqlite:insurance.db}")
    private String primaryDbUrl;

    @Value("${spring.datasource.driver-class-name:org.sqlite.JDBC}")
    private String primaryDriverClass;

    /**
     * Primary DataSource used by Spring Data JPA & Hibernate
     * Stores all Business Entities (Users, Claims, Policies, Settlements, etc.)
     * in SQLite file 'insurance.db' so the user can inspect with 'sqlite3 insurance.db'
     */
    @Primary
    @Bean(name = "dataSource")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create()
                .url(primaryDbUrl)
                .driverClassName(primaryDriverClass)
                .build();
    }

    /**
     * Camunda BPM Process Engine DataSource
     * Uses in-memory H2 so Camunda 7 BPMN & DMN engine runs smoothly
     * without MyBatis dialect limitations, while sharing workflow state with the app.
     */
    @Bean(name = "camundaBpmDataSource")
    public DataSource camundaBpmDataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:h2:mem:camunda_engine_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL")
                .driverClassName("org.h2.Driver")
                .username("sa")
                .password("")
                .build();
    }
}
