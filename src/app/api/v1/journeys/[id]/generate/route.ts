import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { streamAiPipeline } from "@/lib/ai/pipeline";
import { AiError, RateLimitError, ProviderUnavailableError } from "@/lib/ai/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Authenticate user
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // 2. Parallel data fetching for independent resources
  const [journey, user] = await Promise.all([
    prisma.journey.findUnique({
      where: { id, userId: session.user.id },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, creditWallet: { select: { balance: true } } }
    })
  ]);

  if (!journey) {
    return new Response(JSON.stringify({ error: "Journey not found" }), { status: 404 });
  }

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  const balance = user.creditWallet?.balance ?? 0;

  if (user.plan !== "PREMIUM" && balance <= 0) {
    return new Response(
      JSON.stringify({ 
        error: "Insufficient AI credits", 
        code: "PAYMENT_REQUIRED",
        message: "Your complimentary AI credits have been exhausted. Please choose a plan to continue generating journeys."
      }), 
      { status: 402 }
    );
  }

  // Set up ReadableStream for NDJSON
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 3. Call pipeline — P1#4: thread request.signal so a client disconnect
        //    immediately aborts the Anthropic generation and stops wasting API credits.
        const aiStream = streamAiPipeline({
          promptId: "JOURNEY_PLAN",
          userId: session.user.id,
          signal: request.signal,
          variables: {
            destination: journey.originQuery || "",
            duration: journey.durationDays || 5,
            pace: journey.pace || "GENTLY_BALANCED",
            budget: journey.budget || "COMFORTABLE",
          },
        });

        // 4. Return NDJSON stream — every chunk is a complete JSON object
        for await (const event of aiStream) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        }
        controller.close();
      } catch (error) {
        let errorMessage = "Internal Server Error";
        let errorCode = "INTERNAL_ERROR";

        if (error instanceof AiError) {
          errorMessage = error.message;
          errorCode = error.code;
        }

        // Errors after the stream opens must be communicated in-band as NDJSON
        // because the HTTP 200 status was already committed.
        const errorEvent = { type: "error", message: errorMessage, code: errorCode };
        try {
          controller.enqueue(encoder.encode(JSON.stringify(errorEvent) + "\n"));
        } finally {
          controller.close();
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
