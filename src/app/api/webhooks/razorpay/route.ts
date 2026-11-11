import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { InvoiceStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Razorpay Payment Webhook Handler
// ==============================================================================

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify cryptographic signature if secret is configured
    if (secret) {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return NextResponse.json({ status: "ignored_no_payment_entity" });
    }

    const razorpayPaymentId = paymentEntity.id;
    const amountInCurrency = Number(paymentEntity.amount || 0) / 100; // Razorpay amounts in subunits (paise)
    const notes = paymentEntity.notes || {};

    if (event === "payment.captured" || event === "order.paid") {
      // 1. Gym Member Invoice Payment
      if (notes.invoiceId) {
        const invoice = await db.invoice.findUnique({
          where: { id: notes.invoiceId },
          include: { gym: true, member: true },
        });

        if (invoice) {
          const paymentNumber = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

          await db.$transaction(async (tx) => {
            // Record payment
            const payment = await tx.payment.create({
              data: {
                gymId: invoice.gymId,
                memberId: invoice.memberId,
                paymentNumber,
                amount: amountInCurrency,
                method: PaymentMethod.ONLINE_GATEWAY,
                status: PaymentStatus.COMPLETED,
                isGatewayVerified: true,
                gatewayRef: razorpayPaymentId,
                gatewayProvider: "RAZORPAY",
                receivedAt: new Date(),
                notes: `Automated payment via Razorpay (${razorpayPaymentId})`,
              },
            });

            // Allocate to invoice
            await tx.paymentAllocation.create({
              data: {
                gymId: invoice.gymId,
                paymentId: payment.id,
                invoiceId: invoice.id,
                allocatedAmount: amountInCurrency,
              },
            });

            // Mark invoice paid
            await tx.invoice.update({
              where: { id: invoice.id },
              data: {
                status: InvoiceStatus.PAID,
                paidAmount: { increment: amountInCurrency },
              },
            });
          });
        }
      }

      // 2. SaaS Subscription Invoice Payment (Gym paying FIXIA Platform)
      if (notes.subscriptionInvoiceId) {
        const subInvoice = await db.subscriptionInvoice.findUnique({
          where: { id: notes.subscriptionInvoiceId },
          include: { gym: true, subscription: true },
        });

        if (subInvoice) {
          await db.$transaction(async (tx) => {
            await tx.subscriptionInvoice.update({
              where: { id: subInvoice.id },
              data: {
                status: InvoiceStatus.PAID,
                paidAt: new Date(),
                notes: `Paid via Razorpay: ${razorpayPaymentId}`,
              },
            });

            if (subInvoice.subscription) {
              await tx.gymSubscription.update({
                where: { id: subInvoice.subscription.id },
                data: {
                  status: "ACTIVE",
                },
              });
            }

            await tx.platformAuditLog.create({
              data: {
                userId: "usr-admin-fixia",
                gymId: subInvoice.gymId,
                action: "SUBSCRIPTION_PAYMENT_CAPTURED",
                targetType: "SUBSCRIPTION_INVOICE",
                targetId: subInvoice.id,
                details: JSON.stringify({
                  amount: amountInCurrency,
                  gatewayPaymentId: razorpayPaymentId,
                }),
              },
            });
          });
        }
      }
    }

    return NextResponse.json({ status: "processed", event });
  } catch (err: unknown) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
