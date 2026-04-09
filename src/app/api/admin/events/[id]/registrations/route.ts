import { NextRequest } from "next/server";
import { requireAuth, isMember, isAdmin } from "@/lib/auth";
import { ok, err, parseBody } from "@/lib/validations";
import { z } from "zod";
import { db } from "@/lib/db/client";
import {
  eventRegistrations, users, events,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { writeAuditLog, AUDIT_ACTIONS } from "@/lib/services/audit.service";
import { nanoid } from "nanoid";

// GET — list all registrations for an event (member+ only)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;
  if (!isMember(user)) return err("Member or Admin role required", 403);

  const regs = await db
    .select({
      id:           eventRegistrations.id,
      userId:       eventRegistrations.userId,
      userName:     users.name,
      userEmail:    users.email,
      status:       eventRegistrations.status,
      paymentStatus:eventRegistrations.paymentStatus,
      amountPaidMb: eventRegistrations.amountPaidMb,
      registeredAt: eventRegistrations.registeredAt,
    })
    .from(eventRegistrations)
    .leftJoin(users, eq(eventRegistrations.userId, users.id))
    .where(eq(eventRegistrations.eventId, params.id))
    .orderBy(eventRegistrations.registeredAt);

  return ok(regs);
}

// POST — manually add a user to the event (member+ only)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;
  if (!isMember(user)) return err("Member or Admin role required", 403);

  const body = await parseBody(request, z.object({ userId: z.string().uuid() }));
  if (body instanceof Response) return body;

  // Check event exists
  const [event] = await db.select().from(events).where(eq(events.id, params.id)).limit(1);
  if (!event) return err("Event not found", 404);

  // Check not already registered
  const [existing] = await db.select().from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, params.id), eq(eventRegistrations.userId, body.userId)))
    .limit(1);
  if (existing) return err("User is already registered for this event", 400);

  // Get user data for denormalized fields
  const [regUser] = await db.select({ name: users.name, phone: users.phone, email: users.email })
    .from(users).where(eq(users.id, body.userId)).limit(1);

  // Add registration
  const idempotencyKey = `reg:${params.id}:${body.userId}`;
  await db.insert(eventRegistrations).values({
    eventId:        params.id,
    userId:         body.userId,
    status:         "confirmed",
    paymentStatus:  "completed",
    amountPaidMb:   0,
    idempotencyKey,
    name:           regUser?.name ?? null,
    phone:          regUser?.phone ?? null,
    email:          regUser?.email ?? null,
  });

  await writeAuditLog({
    actorId:    user.id,
    action:     AUDIT_ACTIONS.EVENT_REGISTRATION,
    entityType: "event_registration",
    entityId:   params.id,
    newValue:   { userId: body.userId, eventId: params.id, addedBy: user.id, manual: true },
  });

  return ok({ message: "User added to event successfully." }, 201);
}

// DELETE — manually remove a user from the event (member+ only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;
  if (!isMember(user)) return err("Member or Admin role required", 403);

  const body = await parseBody(request, z.object({ userId: z.string().uuid() }));
  if (body instanceof Response) return body;

  const [existing] = await db.select().from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, params.id), eq(eventRegistrations.userId, body.userId)))
    .limit(1);
  if (!existing) return err("Registration not found", 404);

  await db.delete(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, params.id), eq(eventRegistrations.userId, body.userId)));

  await writeAuditLog({
    actorId:    user.id,
    action:     AUDIT_ACTIONS.EVENT_UNREGISTRATION,
    entityType: "event_registration",
    entityId:   params.id,
    oldValue:   { userId: body.userId, eventId: params.id, removedBy: user.id, manual: true },
  });

  return ok({ message: "User removed from event." });
}