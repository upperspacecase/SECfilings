import DashboardClient from "./DashboardClient";

export const metadata = {
    title: "Dashboard — FilingPulse",
    description: "Monitor and manage your Form D filing alerts",
};

export default function DashboardPage() {
    return <DashboardClient />;
}
