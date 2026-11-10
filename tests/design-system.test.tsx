import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  StatusBadge,
  PageHeader,
  StatCard,
  DataTable,
  ChartCard,
  Modal,
  Drawer,
  Tabs,
  Dropdown,
  FormField,
  EmptyState,
  Skeleton,
  SkeletonText,
  SkeletonStat,
  SkeletonTable,
  SkeletonAvatar,
  ToastProvider,
  useToast,
  SuperAdminLayout,
  OwnerLayout,
  MemberLayout,
  AuthLayout,
  PublicWebsiteLayout,
  colors,
  spacing,
  radius,
} from "@/components/design-system";
import { Users, Dumbbell } from "lucide-react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/owner/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("FIXIA GymOS — Premium Design System (Phase 1)", () => {
  describe("Design Tokens", () => {
    it("defines teal/emerald brand colors and midnight navy typography", () => {
      expect(colors.brand.primary).toBe("#0B6B4F");
      expect(colors.brand.emerald).toBe("#059669");
      expect(colors.canvas.bg).toBe("#F5F6F4");
      expect(colors.canvas.surface).toBe("#FFFFFF");
      expect(colors.text.midnight).toBe("#0F172A");
      expect(radius.card).toBe("12px");
      expect(spacing.sm).toBe("8px");
    });
  });

  describe("StatusBadge Component", () => {
    it("renders active success status badge correctly", () => {
      render(<StatusBadge status="ACTIVE" />);
      expect(screen.getByText(/ACTIVE/i)).toBeDefined();
    });

    it("renders overdue danger status badge correctly", () => {
      render(<StatusBadge status="OVERDUE" />);
      expect(screen.getByText(/OVERDUE/i)).toBeDefined();
    });

    it("renders custom label and variant", () => {
      render(<StatusBadge variant="warning" label="Pending Renewal" />);
      expect(screen.getByText("Pending Renewal")).toBeDefined();
    });
  });

  describe("PageHeader Component", () => {
    it("renders title, description and actions", () => {
      render(
        <PageHeader
          title="Member Directory"
          description="Manage active memberships and registrations."
          actions={<button>Add Member</button>}
          badge={<StatusBadge status="ACTIVE" />}
        />
      );
      expect(screen.getByText("Member Directory")).toBeDefined();
      expect(screen.getByText("Manage active memberships and registrations.")).toBeDefined();
      expect(screen.getByText("Add Member")).toBeDefined();
    });

    it("renders breadcrumbs when provided", () => {
      render(
        <PageHeader
          title="Edit Member"
          breadcrumbs={[
            { label: "Dashboard", href: "/owner/dashboard" },
            { label: "Members", href: "/owner/members" },
            { label: "Edit" },
          ]}
        />
      );
      expect(screen.getByText("Dashboard")).toBeDefined();
      expect(screen.getByText("Members")).toBeDefined();
      expect(screen.getByText("Edit")).toBeDefined();
    });
  });

  describe("StatCard Component", () => {
    it("renders label, value, trend and icon", () => {
      render(
        <StatCard
          label="Active Members"
          value="482"
          icon={Users}
          trend={{ value: "+12.4%", label: "vs last month", isPositive: true }}
          progress={{ current: 482, total: 500, label: "Capacity" }}
        />
      );
      expect(screen.getByText("Active Members")).toBeDefined();
      expect(screen.getByText("482")).toBeDefined();
      expect(screen.getByText("+12.4%")).toBeDefined();
      expect(screen.getByText("vs last month")).toBeDefined();
      expect(screen.getByText("Capacity")).toBeDefined();
    });
  });

  describe("DataTable Component", () => {
    interface TestRow extends Record<string, unknown> {
      id: string;
      name: string;
      plan: string;
      status: string;
    }

    const testData: TestRow[] = [
      { id: "1", name: "Alex Mercer", plan: "Annual Gold", status: "ACTIVE" },
      { id: "2", name: "Sarah Connor", plan: "Monthly Basic", status: "PENDING" },
      { id: "3", name: "John Wick", plan: "VIP Platinum", status: "ACTIVE" },
    ];

    const columns = [
      { key: "name", header: "Member Name", sortable: true },
      { key: "plan", header: "Membership Plan" },
      {
        key: "status",
        header: "Status",
        render: (row: TestRow) => <StatusBadge status={row.status} />,
      },
    ];

    it("renders table columns and rows", () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(row) => row.id}
        />
      );
      expect(screen.getByText("Member Name")).toBeDefined();
      expect(screen.getByText("Alex Mercer")).toBeDefined();
      expect(screen.getByText("Sarah Connor")).toBeDefined();
      expect(screen.getByText("John Wick")).toBeDefined();
    });

    it("filters records based on search query", () => {
      render(
        <DataTable
          columns={columns}
          data={testData}
          keyExtractor={(row) => row.id}
          searchPlaceholder="Search members..."
        />
      );
      const searchInput = screen.getByPlaceholderText("Search members...");
      fireEvent.change(searchInput, { target: { value: "Sarah" } });

      expect(screen.getByText("Sarah Connor")).toBeDefined();
      expect(screen.queryByText("Alex Mercer")).toBeNull();
    });
  });

  describe("ChartCard Component", () => {
    it("renders title, period options and metrics", () => {
      const handlePeriod = vi.fn();
      render(
        <ChartCard
          title="Check-in Volume"
          description="Daily check-in distribution"
          periods={[
            { label: "7D", value: "7d" },
            { label: "30D", value: "30d" },
          ]}
          selectedPeriod="7d"
          onPeriodChange={handlePeriod}
          metrics={[
            { label: "Total Check-ins", value: "1,248", change: "+8.2%", isPositive: true },
          ]}
        >
          <div data-testid="chart-placeholder">Chart Area</div>
        </ChartCard>
      );
      expect(screen.getByText("Check-in Volume")).toBeDefined();
      expect(screen.getByText("Total Check-ins")).toBeDefined();
      expect(screen.getByText("1,248")).toBeDefined();
      expect(screen.getByTestId("chart-placeholder")).toBeDefined();

      fireEvent.click(screen.getByText("30D"));
      expect(handlePeriod).toHaveBeenCalledWith("30d");
    });
  });

  describe("Modal and Drawer Components", () => {
    it("renders modal when isOpen is true", () => {
      const handleClose = vi.fn();
      render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Create New Membership"
          description="Enter membership plan details"
          footer={<button onClick={handleClose}>Confirm</button>}
        >
          <p>Modal body content</p>
        </Modal>
      );
      expect(screen.getByText("Create New Membership")).toBeDefined();
      expect(screen.getByText("Modal body content")).toBeDefined();
      fireEvent.click(screen.getByText("Confirm"));
      expect(handleClose).toHaveBeenCalled();
    });

    it("renders drawer when isOpen is true", () => {
      render(
        <Drawer
          isOpen={true}
          onClose={vi.fn()}
          title="Member Details"
          description="Inspect member information"
        >
          <p>Drawer drawer content</p>
        </Drawer>
      );
      expect(screen.getByText("Member Details")).toBeDefined();
      expect(screen.getByText("Drawer drawer content")).toBeDefined();
    });
  });

  describe("Tabs and Dropdown Components", () => {
    it("handles tab selection in Tabs component", () => {
      const handleTab = vi.fn();
      render(
        <Tabs
          tabs={[
            { id: "all", label: "All Members", count: 120 },
            { id: "active", label: "Active", count: 110 },
            { id: "expired", label: "Expired", count: 10 },
          ]}
          activeTab="all"
          onChange={handleTab}
        />
      );
      expect(screen.getByText("All Members")).toBeDefined();
      fireEvent.click(screen.getByText("Active"));
      expect(handleTab).toHaveBeenCalledWith("active");
    });

    it("renders dropdown menu items when clicked", () => {
      const handleEdit = vi.fn();
      render(
        <Dropdown
          items={[
            { id: "edit", label: "Edit Record", onClick: handleEdit },
            { id: "delete", label: "Delete Record", variant: "danger" },
          ]}
          trigger={<button>Options</button>}
        />
      );
      fireEvent.click(screen.getByText("Options"));
      expect(screen.getByText("Edit Record")).toBeDefined();
      fireEvent.click(screen.getByText("Edit Record"));
      expect(handleEdit).toHaveBeenCalled();
    });
  });

  describe("FormField and EmptyState Components", () => {
    it("renders FormField with label, required asterisk and error", () => {
      render(
        <FormField
          label="Email Address"
          required
          error="Please provide a valid business email."
        >
          <input type="email" placeholder="owner@gym.com" />
        </FormField>
      );
      expect(screen.getByText("Email Address")).toBeDefined();
      expect(screen.getByText("*")).toBeDefined();
      expect(screen.getByText("Please provide a valid business email.")).toBeDefined();
    });

    it("renders EmptyState with icon, title, description and action", () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          icon={Dumbbell}
          title="No Workout Plans Found"
          description="Create your first training template to assign to members."
          primaryAction={{ label: "Create Plan", onClick: handleAction }}
        />
      );
      expect(screen.getByText("No Workout Plans Found")).toBeDefined();
      expect(screen.getByText("Create your first training template to assign to members.")).toBeDefined();
      fireEvent.click(screen.getByText("Create Plan"));
      expect(handleAction).toHaveBeenCalled();
    });
  });

  describe("Skeleton Components", () => {
    it("renders all skeleton loading variants without error", () => {
      const { container } = render(
        <div>
          <Skeleton className="h-6 w-32" />
          <SkeletonText lines={2} />
          <SkeletonStat />
          <SkeletonTable rows={2} cols={3} />
          <SkeletonAvatar size={32} />
        </div>
      );
      expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    });
  });

  describe("Toast Notification Provider", () => {
    function ToastTrigger() {
      const toast = useToast();
      return (
        <button onClick={() => toast.success("Payment Received", "Invoice #1042 settled.")}>
          Trigger Toast
        </button>
      );
    }

    it("displays toast notification when triggered", () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );
      fireEvent.click(screen.getByText("Trigger Toast"));
      expect(screen.getByText("Payment Received")).toBeDefined();
      expect(screen.getByText("Invoice #1042 settled.")).toBeDefined();
    });
  });

  describe("Reusable Layouts", () => {
    it("renders SuperAdminLayout with security banner and realm navigation", () => {
      render(
        <SuperAdminLayout user={{ name: "Chief Admin", email: "admin@fixia.in" }}>
          <div>Admin Dashboard View</div>
        </SuperAdminLayout>
      );
      expect(screen.getByText(/FIXIA Platform Administration Realm/i)).toBeDefined();
      expect(screen.getByText("Admin Dashboard View")).toBeDefined();
    });

    it("renders OwnerLayout with gym brand, operational navigation and content", () => {
      render(
        <OwnerLayout
          currentGym={{
            id: "gym-1",
            name: "Iron Temple Fitness",
            slug: "iron-temple",
            currency: "INR",
            status: "ACTIVE",
          }}
          user={{
            id: "user-1",
            name: "Marcus Vance",
            email: "marcus@irontemple.com",
          }}
        >
          <div>Owner Financial Summary</div>
        </OwnerLayout>
      );
      expect(screen.getAllByText("Iron Temple Fitness").length).toBeGreaterThan(0);
      expect(screen.getByText("Owner Financial Summary")).toBeDefined();
    });

    it("renders MemberLayout with gym name and mobile navigation tabs", () => {
      render(
        <MemberLayout
          gymName="Iron Temple Fitness"
          gymSlug="iron-temple"
          user={{ name: "John Doe", email: "john@doe.com" }}
        >
          <div>Member Passes</div>
        </MemberLayout>
      );
      expect(screen.getByText("Iron Temple Fitness")).toBeDefined();
      expect(screen.getByText("Member Passes")).toBeDefined();
    });

    it("renders AuthLayout with centered zero-trust card", () => {
      render(
        <AuthLayout title="Sign In to GymOS" subtitle="Enter your credentials below">
          <input type="text" placeholder="Username" />
        </AuthLayout>
      );
      expect(screen.getByText("Sign In to GymOS")).toBeDefined();
      expect(screen.getByText(/Multi-Tenant Zero-Trust Isolation/i)).toBeDefined();
    });

    it("renders PublicWebsiteLayout with gym navbar, contact and footer", () => {
      render(
        <PublicWebsiteLayout
          gym={{
            name: "Apex Fitness Studio",
            slug: "apex-fitness",
            phone: "+91 98765 43210",
            city: "Bangalore",
          }}
        >
          <div>Public Pricing Section</div>
        </PublicWebsiteLayout>
      );
      expect(screen.getAllByText("Apex Fitness Studio").length).toBeGreaterThan(0);
      expect(screen.getByText("Public Pricing Section")).toBeDefined();
      expect(screen.getByText("Powered by")).toBeDefined();
    });
  });
});
