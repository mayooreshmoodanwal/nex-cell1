import { NextRequest } from "next/server";
import { requireAuth, isMember } from "@/lib/auth";
import { ok, err, parseBody, parseQuery, CreateCertificateSchema, PaginationSchema } from "@/lib/validations";
import { getCertificates, createCertificate } from "@/lib/services/certificate.service";
import { z } from "zod";

const CertificateQuerySchema = PaginationSchema.extend({
  userId:     z.string().uuid().optional(),
  eventId:    z.string().uuid().optional(),
  standalone: z.coerce.boolean().optional(),
});

// GET /api/certificates — list certificates (filtered)
export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  const query = parseQuery(request, CertificateQuerySchema);
  if (query instanceof Response) return query;

  // Non-admin/non-member users can only see their own certificates
  const isPrivileged = user.roles.includes("admin") || user.roles.includes("member") || user.roles.includes("treasurer");
  const effectiveUserId = isPrivileged ? query.userId : user.id;

  const result = await getCertificates({
    userId:     effectiveUserId,
    eventId:    query.eventId,
    standalone: query.standalone,
    limit:      query.limit,
    offset:     query.offset,
  });

  return ok(result);
}

// POST /api/certificates — issue a new certificate (member+ only)
export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  if (!isMember(user)) {
    return err("Only members and above can issue certificates.", 403);
  }

  const body = await parseBody(request, CreateCertificateSchema);
  if (body instanceof Response) return body;

  const cert = await createCertificate(body, user.id);
  return ok(cert, 201);
}
