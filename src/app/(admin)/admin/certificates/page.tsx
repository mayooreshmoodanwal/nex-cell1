import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCertificates, getAllEventsForDropdown } from "@/lib/services/certificate.service";
import { getAllUsers } from "@/lib/services/user.service";
import AdminCertificatesClient from "./AdminCertificatesClient";

export const metadata = { title: "Admin — Certificates" };

export default async function AdminCertificatesPage() {
  const token = cookies().get("access_token")?.value!;
  const payload = await verifyAccessToken(token);
  if (!payload.roles?.includes("admin") && !payload.roles?.includes("member")) redirect("/dashboard?error=forbidden");

  const [certData, eventsData, usersData] = await Promise.all([
    getCertificates({ limit: 100, offset: 0 }),
    getAllEventsForDropdown(),
    getAllUsers(500, 0),
  ]);

  return (
    <AdminCertificatesClient
      certificates={certData.certificates}
      totalCertificates={certData.total}
      events={eventsData}
      users={usersData}
    />
  );
}
