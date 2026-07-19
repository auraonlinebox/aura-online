import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { examples } = await req.json();
    if (!examples?.length) {
      return NextResponse.json({ error: 'Faltan ejemplos' }, { status: 400 });
    }

    const updated = [];
    for (const ex of examples) {
      const response = await generateResponse(ex.text, ex.author, ex.business);
      updated.push({ ...ex, response });
    }

    return NextResponse.json({ examples: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}
