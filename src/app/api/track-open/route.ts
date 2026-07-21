// Track-open endpoint kept as a no-op 1x1 pixel
// to avoid 404s if old emails with tracking pixel are opened.
// No data is recorded.
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  return new Response(pixel, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}