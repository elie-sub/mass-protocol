export const dynamic = "force-static";

/** Build id of the deployment that serves this request (see next.config.ts). */
export function GET() {
  return Response.json({ build: process.env.NEXT_PUBLIC_BUILD_ID });
}
