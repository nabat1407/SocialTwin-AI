import { exportRequestSchema } from '@/lib/export-contracts';
import { renderPdf } from '@/lib/server/pdf-export';
import { failure, readBody, RequestError } from '@/lib/server/http';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const input = await readBody(request, exportRequestSchema);
    const bytes = await renderPdf(input);
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="socialtwin-${input.kind}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNSUPPORTED_GLYPH')
      return failure(
        new RequestError(
          'UNSUPPORTED_GLYPH',
          'Mətndə PDF şriftinin dəstəkləmədiyi simvol var. Simvolu dəyiş və ya çap görünüşündən PDF saxla.',
          400,
          false,
        ),
      );
    return failure(error);
  }
}
