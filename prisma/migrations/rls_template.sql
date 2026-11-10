-- ==============================================================================
-- FIXIA GymOS — PostgreSQL Row-Level Security (RLS) Defense-in-Depth Template
-- ==============================================================================
-- This template enables physical database-level row isolation for all tenant tables.
-- Execution: Apply this migration after initial DDL creation.
-- In application runtime, the connection sets session variable:
--   SET LOCAL app.current_gym_id = '<gym-uuid>';
-- ==============================================================================

-- 1. Enable RLS on all tenant-owned tables
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MembershipPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentAllocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdjustmentOrRefund" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceQrNonce" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceAuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadActivity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExpenseCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClassSchedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClassBooking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockMovement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MemberActivity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MembershipAuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Exercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MemberFitnessProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MemberWeightLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MemberMeasurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MemberWorkoutAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GymWebsiteConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GymWhatsAppConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppNotification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GymSubscription" ENABLE ROW LEVEL SECURITY;

-- 2. Create tenant isolation policies
-- Members
DROP POLICY IF EXISTS member_tenant_isolation ON "Member";
CREATE POLICY member_tenant_isolation ON "Member"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));

-- Invoices
DROP POLICY IF EXISTS invoice_tenant_isolation ON "Invoice";
CREATE POLICY invoice_tenant_isolation ON "Invoice"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));

-- Payments
DROP POLICY IF EXISTS payment_tenant_isolation ON "Payment";
CREATE POLICY payment_tenant_isolation ON "Payment"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));

-- Attendance Records
DROP POLICY IF EXISTS attendance_tenant_isolation ON "AttendanceRecord";
CREATE POLICY attendance_tenant_isolation ON "AttendanceRecord"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));

-- Expenses
DROP POLICY IF EXISTS expense_tenant_isolation ON "Expense";
CREATE POLICY expense_tenant_isolation ON "Expense"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));

-- Leads
DROP POLICY IF EXISTS lead_tenant_isolation ON "Lead";
CREATE POLICY lead_tenant_isolation ON "Lead"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));

-- Inventory
DROP POLICY IF EXISTS inventory_tenant_isolation ON "InventoryItem";
CREATE POLICY inventory_tenant_isolation ON "InventoryItem"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));

-- Classes & Bookings
DROP POLICY IF EXISTS class_booking_tenant_isolation ON "ClassBooking";
CREATE POLICY class_booking_tenant_isolation ON "ClassBooking"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));

-- Workouts
DROP POLICY IF EXISTS workout_plan_tenant_isolation ON "WorkoutPlan";
CREATE POLICY workout_plan_tenant_isolation ON "WorkoutPlan"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));

-- WhatsApp Notifications
DROP POLICY IF EXISTS whatsapp_notif_tenant_isolation ON "WhatsAppNotification";
CREATE POLICY whatsapp_notif_tenant_isolation ON "WhatsAppNotification"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));

-- SaaS Subscription
DROP POLICY IF EXISTS saas_sub_tenant_isolation ON "GymSubscription";
CREATE POLICY saas_sub_tenant_isolation ON "GymSubscription"
  AS RESTRICTIVE
  USING ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''))
  WITH CHECK ("gymId" = NULLIF(current_setting('app.current_gym_id', true), ''));


