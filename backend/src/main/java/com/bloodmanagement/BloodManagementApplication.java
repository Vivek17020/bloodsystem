package com.bloodmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Blood Management System - Spring Boot Application Entry Point
 */
@SpringBootApplication
@EnableScheduling
public class BloodManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(BloodManagementApplication.class, args);
    }
}
