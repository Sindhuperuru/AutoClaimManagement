package com.insurance.claim.controller;

import com.insurance.claim.dto.ApiResponse;
import com.insurance.claim.dto.DashboardStatsDTO;
import com.insurance.claim.entity.AuditLog;
import com.insurance.claim.entity.SystemRule;
import com.insurance.claim.entity.User;
import com.insurance.claim.repository.SystemRuleRepository;
import com.insurance.claim.repository.UserRepository;
import com.insurance.claim.service.AnalyticsService;
import com.insurance.claim.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AnalyticsService analyticsService;
    private final AuditService auditService;
    private final UserRepository userRepository;
    private final SystemRuleRepository ruleRepository;

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getAnalytics() {
        DashboardStatsDTO stats = analyticsService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        List<AuditLog> logs = auditService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/rules")
    public ResponseEntity<ApiResponse<List<SystemRule>>> getSystemRules() {
        List<SystemRule> rules = ruleRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(rules));
    }

    @PutMapping("/rules/{key}")
    public ResponseEntity<ApiResponse<SystemRule>> updateRule(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {

        SystemRule rule = ruleRepository.findByRuleKey(key)
                .orElseGet(() -> SystemRule.builder().ruleKey(key).ruleName(key).build());

        if (body.containsKey("value")) {
            rule.setRuleValue(body.get("value"));
        }
        if (body.containsKey("description")) {
            rule.setDescription(body.get("description"));
        }
        SystemRule updated = ruleRepository.save(rule);
        return ResponseEntity.ok(ApiResponse.ok("System rule updated", updated));
    }
}
