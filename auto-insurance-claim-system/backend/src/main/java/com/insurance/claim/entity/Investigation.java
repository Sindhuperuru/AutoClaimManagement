package com.insurance.claim.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "investigations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Investigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "claim_id", nullable = false)
    private InsuranceClaim claim;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "investigator_id")
    private User investigator;

    @Column(nullable = false, length = 30)
    private String status = "ASSIGNED"; // ASSIGNED, IN_PROGRESS, COMPLETED

    @Column(columnDefinition = "TEXT")
    private String findings;

    @Column(name = "fraud_risk_flag")
    private Boolean fraudRiskFlag = false;

    @Column(name = "site_visit_done")
    private Boolean siteVisitDone = false;

    @Column(name = "third_party_verified")
    private Boolean thirdPartyVerified = false;

    @Column(name = "workshop_verified")
    private Boolean workshopVerified = false;

    @Column(name = "report_summary", columnDefinition = "TEXT")
    private String reportSummary;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @Column(name = "completed_date")
    private LocalDateTime completedDate;
}
