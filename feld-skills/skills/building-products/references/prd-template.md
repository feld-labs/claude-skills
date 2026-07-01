# PRD Template

Use this structure for every product. Fill in all sections. If a section isn't applicable, say so explicitly, don't silently skip it.

## Contents
The PRD covers 13 sections: (1) What this product is, (2) How we make money, (3) User types/roles/permissions, (4) Database architecture, (5) Security architecture, (6) Payment integration, (7) Notification system, (8) Key user flows, (9) Phased rollout plan, (10) Technical stack, (11) Feature backlog, (12) Success metrics, (13) Resolved decisions. The full fill-in template follows.

---

```markdown
# [Product Name], Product Requirements Document (PRD)

**Version:** [X.0]
**Date:** [date]
**Status:** [Draft / Approved for Development]
**Stack:** [e.g., Next.js · Supabase · Stripe]

---

## 1. What This Product Is

[2-3 paragraphs in plain English. What does it do? Who is it for? What problem does it solve? List the distinct user audiences and their tailored interfaces.]

---

## 2. How We Make Money

### 2.1 Subscription Tiers
[Table: tier name, monthly price, what's included (seats, volume, features)]

### 2.2 Volume Packs
[Table: pack size, price, effective per-unit rate, availability by tier]

### 2.3 Premium Add-Ons
[Table: add-on name, price, description]

### 2.4 Payment Flow
[How money moves: customer -> business -> platform fees. Which Stripe products handle which flow.]

### 2.5 Pricing Fairness
[Address any segments that might feel penalized by the pricing model. How does onboarding prevent sticker shock?]

---

## 3. User Types, Roles & Permissions

### 3.1 Relationship Model
[One-to-many? Many-to-many? Can one person hold multiple roles?]

### 3.2 Role Definitions
[Table: role, scope, plain-English description]

### 3.3 Permissions Matrix
[Full matrix: action × role with ✅/❌]

---

## 4. Database Architecture

### 4.1 Design Principles
[UUIDs, timestamps, soft deletes, RLS, encryption approach, audit strategy]

### 4.2 Schema Overview
[ASCII diagram grouping tables by domain]

### 4.3 Detailed Table Definitions
[Full CREATE TABLE SQL for every table, including constraints, enums, and comments]

### 4.4 Key Indexes
[All non-primary-key indexes with rationale]

---

## 5. Row Level Security Strategy

[Pattern descriptions with example SQL for each pattern type]

---

## 6. Security Architecture

### 6.1 Authentication
### 6.2 Encryption
[Table: data type -> encryption method]
### 6.3 API Security
### 6.4 Data Protection
### 6.5 Infrastructure

---

## 7. Payment Integration Architecture

### 7.1 [Provider] Connect / Marketplace
### 7.2 [Provider] Billing / Subscriptions
### 7.3 Payment Flow (per transaction)
### 7.4 Recurring Billing Flow

---

## 8. Notification System

[Table: event trigger -> recipient -> channels (push/SMS/email)]

---

## 9. Key User Flows

[Describe each major flow: self-booking, onboarding, job lifecycle, etc.]

---

## 10. Phased Rollout Plan

### Phase 1, [Name] (Weeks X–Y)
**Goal:** [One sentence]
**Scope:** [Bullet list of what gets built]
**Exit criteria:** [What must be true to move to Phase 2]

### Phase 2, [Name] (Weeks X–Y)
### Phase 3, [Name] (Weeks X–Y)
### Phase 4, [Name] (Weeks X–Y)

---

## 11. Technical Stack

### Frontend
### Backend
### Environments
[Table: environment -> purpose]

---

## 12. Feature Backlog

[Table: feature, priority (High/Medium/Low), notes]

---

## 13. Success Metrics

### Launch Criteria
### Ongoing KPIs

---

## 14. Resolved Decisions

[Table: decision, date, resolution, rationale]
```
