/**
 * CERTIFICATE SERVICE
 * CRUD operations for user certificates.
 * Admin & members can issue; only admin can delete.
 */

import { db } from "@/lib/db/client";
import { certificates, users, events } from "@/lib/db/schema";
import { eq, desc, and, isNull, isNotNull, sql } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────
// GET CERTIFICATES (with filters)
// ─────────────────────────────────────────────────────────────

interface GetCertificatesOptions {
  userId?:     string;
  eventId?:    string;
  standalone?: boolean; // true = only standalone (no event), false = only event-linked
  limit?:      number;
  offset?:     number;
}

export async function getCertificates(options: GetCertificatesOptions = {}) {
  const { userId, eventId, standalone, limit = 50, offset = 0 } = options;

  const conditions = [];
  if (userId)    conditions.push(eq(certificates.userId, userId));
  if (eventId)   conditions.push(eq(certificates.eventId, eventId));
  if (standalone === true)  conditions.push(isNull(certificates.eventId));
  if (standalone === false) conditions.push(isNotNull(certificates.eventId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id:             certificates.id,
      title:          certificates.title,
      description:    certificates.description,
      certificateUrl: certificates.certificateUrl,
      issuedAt:       certificates.issuedAt,
      createdAt:      certificates.createdAt,
      userId:         certificates.userId,
      eventId:        certificates.eventId,
      issuedById:     certificates.issuedBy,
      userName:       users.name,
      userEmail:      users.email,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.userId, users.id))
    .where(whereClause)
    .orderBy(desc(certificates.issuedAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(certificates)
    .where(whereClause);

  // Get event names and issuer names for each certificate
  const enriched = await Promise.all(
    rows.map(async (row) => {
      let eventTitle: string | null = null;
      if (row.eventId) {
        const [event] = await db
          .select({ title: events.title })
          .from(events)
          .where(eq(events.id, row.eventId))
          .limit(1);
        eventTitle = event?.title ?? null;
      }

      const [issuer] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, row.issuedById))
        .limit(1);

      return {
        ...row,
        eventTitle,
        issuerName:  issuer?.name ?? issuer?.email ?? "Unknown",
      };
    })
  );

  return {
    certificates: enriched,
    total: countResult?.count ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────
// GET SINGLE CERTIFICATE
// ─────────────────────────────────────────────────────────────

export async function getCertificateById(id: string) {
  const [row] = await db
    .select({
      id:             certificates.id,
      title:          certificates.title,
      description:    certificates.description,
      certificateUrl: certificates.certificateUrl,
      issuedAt:       certificates.issuedAt,
      createdAt:      certificates.createdAt,
      userId:         certificates.userId,
      eventId:        certificates.eventId,
      issuedById:     certificates.issuedBy,
      userName:       users.name,
      userEmail:      users.email,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.userId, users.id))
    .where(eq(certificates.id, id))
    .limit(1);

  return row ?? null;
}

// ─────────────────────────────────────────────────────────────
// CREATE CERTIFICATE
// ─────────────────────────────────────────────────────────────

interface CreateCertificateData {
  userId:         string;
  eventId?:       string | null;
  title:          string;
  description?:   string;
  certificateUrl: string;
}

export async function createCertificate(
  data:       CreateCertificateData,
  issuedById: string
) {
  const [cert] = await db
    .insert(certificates)
    .values({
      userId:         data.userId,
      eventId:        data.eventId ?? null,
      title:          data.title,
      description:    data.description ?? null,
      certificateUrl: data.certificateUrl,
      issuedBy:       issuedById,
    })
    .returning();

  return cert;
}

// ─────────────────────────────────────────────────────────────
// DELETE CERTIFICATE (admin only)
// ─────────────────────────────────────────────────────────────

export async function deleteCertificate(id: string) {
  const [deleted] = await db
    .delete(certificates)
    .where(eq(certificates.id, id))
    .returning({ id: certificates.id });

  return deleted ?? null;
}

// ─────────────────────────────────────────────────────────────
// GET ALL EVENTS (for dropdown in certificate issuing form)
// ─────────────────────────────────────────────────────────────

export async function getAllEventsForDropdown() {
  return db
    .select({ id: events.id, title: events.title, eventDate: events.eventDate })
    .from(events)
    .where(eq(events.isDeleted, false))
    .orderBy(desc(events.eventDate));
}
