import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { applyRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const rateLimit = applyRateLimit(request, RATE_LIMIT_CONFIGS.admin);
  if (rateLimit) return rateLimit;

  const authResult = await requireRole(request, ["ADMIN", "DEVELOPER"]);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const searchParams = new URL(request.url).searchParams;
    const includeDisabled = searchParams.get("includeDisabled") === "true";

    const where = includeDisabled ? {} : { isEnabled: true };

    const gateways = await db.paymentGateway.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(gateways);
  } catch (error) {
    console.error('Payment gateways error:', error);
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json([
        { id: 'stripe', name: 'Stripe', isEnabled: true, sortOrder: 1, config: {} },
        { id: 'paypal', name: 'PayPal', isEnabled: true, sortOrder: 2, config: {} },
        { id: 'bank', name: 'Bank Transfer', isEnabled: true, sortOrder: 3, config: {} },
      ]);
    }
    return NextResponse.json({ error: 'Failed to fetch payment gateways' }, { status: 500 });
  }
}