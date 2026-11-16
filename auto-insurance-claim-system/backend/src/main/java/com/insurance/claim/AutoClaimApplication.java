package com.insurance.claim;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = {
        "com.insurance.claim.entity",
        "com.insurance.claim.config"
})
public class AutoClaimApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutoClaimApplication.class, args);
        System.out.println("==================================================================");
        System.out.println(" AUTO ACCIDENT INSURANCE CLAIM MANAGEMENT SYSTEM STARTED");
        System.out.println(" Web Application: http://localhost:8080");
        System.out.println(" Camunda Cockpit: http://localhost:8080/camunda/app/cockpit/default/");
        System.out.println(" Camunda Tasklist: http://localhost:8080/camunda/app/tasklist/default/");
        System.out.println(" REST Engine: http://localhost:8080/engine-rest/");
        System.out.println("==================================================================");
    }
}
