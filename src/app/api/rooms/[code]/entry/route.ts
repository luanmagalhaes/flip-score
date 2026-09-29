import { handle, playerToken } from "@/app/api/_shared";
import { removeEntry, saveEntry } from "@/lib/game/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = (await request.json()) as {
      roundNumber?: number;
      replacing?: boolean;
      numbers?: unknown;
      modifiers?: unknown;
      exitKind?: unknown;
    };

    return saveEntry({
      code,
      token: playerToken(request),
      roundNumber: body.roundNumber,
      replacing: body.replacing === true,
      numbers: body.numbers ?? [],
      modifiers: body.modifiers ?? [],
      exitKind: body.exitKind,
    });
  });
}

export async function DELETE(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { entryId?: string };

    return removeEntry({ code, token: playerToken(request), entryId: String(body.entryId ?? "") });
  });
}
