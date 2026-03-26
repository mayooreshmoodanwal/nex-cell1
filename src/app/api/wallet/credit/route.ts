import { NextRequest } from "next/server";
import { requireTreasurer } from "@/lib/auth";
import { ok, err, parseBody } from "@/lib/validations";
import { creditWallet, debitWallet } from "@/lib/services/wallet.service";
import { getClientIp } from "@/lib/rate-limit";
import { nanoid } from "nanoid";
import { z } from "zod";

/**
 * POST /api/wallet/credit
 *
 * Allows admin or treasurer to manually credit OR debit any user's wallet.
 * Used for: prize money, compensation, penalties, corrections.
 *
 * Body:
 *   userId:      string  — target user's UUID
 *   amountMb:    number  — absolute amount in Mirai Bucks (always positive)
 *   type:        "credit" | "debit"
 *   description: string  — required reason (shown in user's transaction history)
 */
export async function POST(request: NextRequest) {
  // Only treasurer and admin can do this
  const actor = requireTreasurer(request);
  if (actor instanceof Response) return actor;

  const body = await parseBody(request, z.object({
    userId:      z.string().uuid("Invalid user ID"),
    amountMb:    z.number().int("Amount must be a whole number").positive("Amount must be greater than 0").max(10_000_000, "Maximum single transaction is ₥1,00,00,000"),
    type:        z.enum(["credit", "debit"]),
    description: z.string().min(3, "Description must be at least 3 characters").max(200, "Description too long").trim(),
  }));
  if (body instanceof Response) return body;

  // Build a unique idempotency key so accidental double-clicks don't double-transact
  const idempotencyKey = `manual:${actor.id}:${body.userId}:${body.type}:${nanoid(16)}`;

  if (body.type === "credit") {
    const result = await creditWallet({
      userId:          body.userId,
      amountMb:        body.amountMb,
      source:          "admin_adjustment",
      description:     body.description,
      idempotencyKey,
      performedBy:     actor.id,
      ipAddress:       getClientIp(request),
    });

    if (!result.success) return err(result.error ?? "Credit failed", 400);

    return ok({
      message:       `Successfully credited ₥${body.amountMb.toLocaleString("en-IN")} to user's wallet.`,
      newBalanceMb:  result.newBalance,
      transactionId: result.transactionId,
    });
  } else {
    const result = await debitWallet({
      userId:          body.userId,
      amountMb:        body.amountMb,
      source:          "admin_adjustment",
      description:     body.description,
      idempotencyKey,
      performedBy:     actor.id,
      ipAddress:       getClientIp(request),
    });

    if (!result.success) return err(result.error ?? "Debit failed", 400);

    return ok({
      message:       `Successfully deducted ₥${body.amountMb.toLocaleString("en-IN")} from user's wallet.`,
      newBalanceMb:  result.newBalance,
      transactionId: result.transactionId,
    });
  }
}
