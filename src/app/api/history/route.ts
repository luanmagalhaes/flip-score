import { handle } from "@/app/api/_shared";
import { checked } from "@/lib/errors";
import { closeStaleMatches } from "@/lib/game/service";
import { serverClient } from "@/lib/supabase";
import type { MatchRow } from "@/types/history";

export async function GET() {
  return handle(async () => {
    await closeStaleMatches();

    const data = checked(
      await serverClient()
        .from("fs_matches")
        .select("*")
        .order("finished_at", { ascending: false })
        .limit(120),
    );

    return { matches: (data as MatchRow[] | null) ?? [] };
  });
}
