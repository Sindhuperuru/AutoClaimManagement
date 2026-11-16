# Camunda DMN 1.3 Decision Tables Guide

The platform integrates **5 formal DMN Decision Tables** executed natively by the Camunda 7 engine.

---

## 1. Policy Eligibility Decision (`policy-eligibility.dmn`)
- **Decision ID:** `policyEligibilityDecision`
- **Hit Policy:** `FIRST`
- **Inputs:**
  1. `policyStatus` (string: ACTIVE, EXPIRED, CANCELLED, SUSPENDED)
  2. `isAccidentCovered` (boolean: checks policy inclusions)
  3. `premiumPaid` (boolean: checks premium payment status)
- **Outputs:**
  1. `isEligible` (boolean)
  2. `eligibilityReason` (string)
- **Key Rules:**
  - `policyStatus == "ACTIVE"` and `isAccidentCovered == true` and `premiumPaid == true` -> `isEligible = true`.
  - `policyStatus == "EXPIRED"` -> `isEligible = false`, Reason: "Policy has expired prior to accident date".
  - Default -> `isEligible = false`.

---

## 2. Document Verification Decision (`document-verification.dmn`)
- **Decision ID:** `documentVerificationDecision`
- **Hit Policy:** `FIRST`
- **Inputs:**
  1. `hasDrivingLicense` (boolean)
  2. `hasRc` (boolean)
  3. `hasAccidentPhotos` (boolean)
  4. `hasPoliceFir` (boolean)
  5. `hasRepairEstimate` (boolean)
  6. `damageAmount` (double)
- **Outputs:**
  1. `documentsComplete` (boolean)
  2. `missingDocumentsList` (string)
  3. `verificationStatus` (string)
- **Key Rules:**
  - All 5 present -> `documentsComplete = true`, Status: `VERIFIED_COMPLETE`.
  - FIR missing but damage < $2,500 -> `documentsComplete = true`, Status: `VERIFIED_COMPLETE` (Police report waived for minor claims).
  - Damage >= $2,500 with missing FIR -> `documentsComplete = false`, Reason: "POLICE_FIR_MANDATORY_OVER_2500".

---

## 3. Claim Risk Assessment Decision (`claim-risk-assessment.dmn`)
- **Decision ID:** `claimRiskAssessmentDecision`
- **Hit Policy:** `FIRST`
- **Inputs:**
  1. `estimatedDamage` (double)
  2. `accidentDelayDays` (integer)
  3. `previousClaimsCount` (integer)
  4. `policeFirAvailable` (boolean)
  5. `policyAgeMonths` (integer)
- **Outputs:**
  1. `claimRisk` (string: "LOW", "MEDIUM", "HIGH")
  2. `riskScore` (integer: 0 to 100)
  3. `recommendedAction` (string)
- **Key Rules:**
  - Fresh policy (< 1 month) with damage > $15,000 -> `HIGH` Risk (Score: 88, SIU triggered).
  - Prior claims >= 3 -> `HIGH` Risk (Score: 82, Habitual claimant audit).
  - Prolonged reporting delay (> 14 days) and damage > $5,000 -> `HIGH` Risk (Score: 75).
  - Damage in [$5,000..$15,000] with prompt reporting -> `MEDIUM` Risk (Score: 45).
  - Damage < $5,000, reported <= 7 days, <= 1 prior claim -> `LOW` Risk (Score: 18, Fast-track).

---

## 4. Claim Approval Recommendation (`claim-approval-recommendation.dmn`)
- **Decision ID:** `claimApprovalRecommendationDecision`
- **Hit Policy:** `FIRST`
- **Inputs:**
  1. `riskLevel` (string: "LOW", "MEDIUM", "HIGH")
  2. `documentStatus` (string: "VERIFIED", "INCOMPLETE")
  3. `policeReportStatus` (string: "VERIFIED", "NOT_REQUIRED", "DISCREPANCY")
  4. `damageVsCoverageRatio` (double: damage / sumInsured)
- **Outputs:**
  1. `recommendation` (string: "APPROVE", "INVESTIGATE", "REJECT")
  2. `confidenceScore` (double: 0.0 to 1.0)
  3. `recommendationRemarks` (string)
- **Key Rules:**
  - High risk level -> `INVESTIGATE` (Confidence: 0.92).
  - Incomplete documentation -> `REJECT` (Confidence: 0.85).
  - Police discrepancy -> `INVESTIGATE` (Confidence: 0.88).
  - Constructive Total Loss (> 75% vehicle value) -> `APPROVE` (Confidence: 0.95).
  - Verified Low/Medium risk claim -> `APPROVE` (Confidence: 0.98).

---

## 5. Settlement Amount Calculation (`settlement-calculation.dmn`)
- **Decision ID:** `settlementCalculationDecision`
- **Hit Policy:** `FIRST`
- **Inputs:**
  1. `coverageType` (string: "ZERO_DEPRECIATION", "COMPREHENSIVE", "THIRD_PARTY")
  2. `estimatedDamage` (double)
  3. `deductibleAmount` (double)
  4. `claimantFaultPercentage` (double)
- **Outputs:**
  1. `approvedAmount` (double)
  2. `deductibleApplied` (double)
  3. `depreciationApplied` (double)
  4. `settlementRemarks` (string)
- **Key Formulas:**
  - **Zero Depreciation Rider:**
    `approvedAmount = estimatedDamage - deductibleAmount` (0% depreciation).
  - **Comprehensive Coverage:**
    `approvedAmount = (estimatedDamage * 0.90) - deductibleAmount` (10% standard wear-and-tear depreciation).
  - **Shared Fault (Comparative Negligence):**
    `approvedAmount = ((estimatedDamage * 0.90) * (1 - (fault% / 100))) - deductibleAmount`.
