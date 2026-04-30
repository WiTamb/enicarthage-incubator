package com.enicarthage.incubator.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        return ResponseEntity.ok(Map.of(
            "application", "ENICarthage Incubator API",
            "status", "running",
            "version", "1.0.0",
            "timestamp", LocalDateTime.now().toString(),
            "endpoints", Map.of(
                "auth", "/api/auth",
                "projects", "/api/projects",
                "programs", "/api/programs",
                "events", "/api/events",
                "news", "/api/news"
            )
        ));
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now().toString()
        ));
    }
}
