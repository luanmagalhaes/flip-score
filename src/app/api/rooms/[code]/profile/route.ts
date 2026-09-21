import { handle, playerToken } from "@/app/api/_shared";
import { updateProfile } from "@/lib/game/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = (await request.json()) as { avatar?: string | null; emoji?: string | null };

    return updateProfile({
      code,
      token: playerToken(request),
      avatar: body.avatar,
      emoji: body.emoji,
    });
  });
}
