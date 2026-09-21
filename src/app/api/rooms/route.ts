import { handle } from "@/app/api/_shared";
import { createRoom } from "@/lib/game/service";

export async function POST(request: Request) {
  return handle(async () => {
    const body = (await request.json()) as { hostName?: string; avatar?: string; emoji?: string };

    return createRoom({
      hostName: String(body.hostName ?? ""),
      avatar: body.avatar,
      emoji: body.emoji,
    });
  });
}
