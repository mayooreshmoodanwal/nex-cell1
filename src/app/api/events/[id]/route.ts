import { NextRequest } from "next/server";
import { requireAuth, isAdmin, isMember, getCurrentUser } from "@/lib/auth";
import { ok, err, parseBody, UpdateEventSchema } from "@/lib/validations";
import { getEventById, updateEvent, deleteEvent } from "@/lib/services/event.service";
import { getClientIp } from "@/lib/rate-limit";

// GET /api/events/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user  = getCurrentUser(request);
  const event = await getEventById(id, user?.id);
  if (!event) return err("Event not found", 404);
  return ok(event);
}

// PATCH /api/events/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user   = requireAuth(request);
  if (user instanceof Response) return user;

  const event = await getEventById(id);
  if (!event) return err("Event not found", 404);

  if (!isAdmin(user) && !isMember(user) && event.createdBy !== user.id) {
    return err("You can only edit your own events.", 403);
  }

  const body = await parseBody(request, UpdateEventSchema);
  if (body instanceof Response) return body;

  const updated = await updateEvent(
    id,
    {
      ...body,
      eventDate:            body.eventDate            ? new Date(body.eventDate)            : undefined,
      registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
    },
    user.id,
    getClientIp(request)
  );

  return ok(updated);
}

// DELETE /api/events/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user   = requireAuth(request);
  if (user instanceof Response) return user;
  if (!isAdmin(user) && !isMember(user)) return err("Only admins and members can delete events.", 403);

  await deleteEvent(id, user.id, getClientIp(request));
  return ok({ message: "Event deleted." });
}