import { getEvents } from "@/lib/services/event.service";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import EventsClient from "./EventsClient";
export const metadata = { title: "Events" };

export default async function EventsPage() {
  const events = await getEvents({ upcoming: true, limit: 50 });

  // Check if current user is member/admin to show create button
  let userRoles: string[] = [];
  try {
   const token = (await cookies()).get("access_token")?.value;
    if (token) {
      const payload = await verifyAccessToken(token);
      userRoles = payload.roles ?? [];
    }
  } catch {}

  const canCreate = userRoles.includes("member") || userRoles.includes("admin") || userRoles.includes("treasurer");

  return <EventsClient events={events} canCreate={canCreate} />;
}