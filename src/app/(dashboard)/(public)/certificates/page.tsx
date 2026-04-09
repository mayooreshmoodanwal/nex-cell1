import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { getCertificates } from "@/lib/services/certificate.service";
import CertificatesClient from "./CertificatesClient";

export const metadata = { title: "My Certificates" };

export default async function CertificatesPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value!;
  const payload = await verifyAccessToken(token);

  const { certificates } = await getCertificates({
    userId: payload.sub,
    limit:  100,
    offset: 0,
  });

  return (
    <CertificatesClient
      certificates={certificates}
      userRoles={payload.roles}
    />
  );
}
