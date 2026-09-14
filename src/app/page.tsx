import { AppShell } from "@/components/layout/AppShell";
import { ScoreApp } from "@/components/game/ScoreApp";

export default function Home() {
  return (
    <AppShell>
      <ScoreApp />
    </AppShell>
  );
}
