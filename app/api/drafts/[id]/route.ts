import { NextResponse } from 'next/server';
import { getCommandDraft, updateCommandDraftStatus } from '@/lib/ai/draft-store';

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const draft = getCommandDraft(params.id);
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  return NextResponse.json({ draft });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const body = await request.json();
    const status = body?.status;

    if (status !== 'confirmed' && status !== 'rejected') {
      return NextResponse.json({ error: 'Status must be confirmed or rejected' }, { status: 400 });
    }

    const draft = updateCommandDraftStatus(params.id, status);
    if (!draft) {
      return NextResponse.json({ error: 'Draft not found or is no longer pending' }, { status: 409 });
    }

    return NextResponse.json({ draft, mutationApplied: false });
  } catch {
    return NextResponse.json({ error: 'Invalid draft update request' }, { status: 400 });
  }
}
