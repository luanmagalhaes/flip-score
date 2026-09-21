import { randomUUID } from "node:crypto";
import { ServiceError } from "@/lib/errors";
import { maxNameLength, maxPlayers, minPlayers } from "@/lib/game/limits";
import { modifiers as allowedModifiers, highestCard, lowestCard } from "@/lib/game/rules";
import { roundScore } from "@/lib/game/scoring";
import { champions } from "@/lib/game/standings";
import { serverClient } from "@/lib/supabase";
import {
  ExitKind,
  RoomPhase,
  type EntryRow,
  type PlayerRow,
  type RoomRow,
  type RoomState,
} from "@/types/room";
import type { Modifier } from "@/lib/game/rules";

export const maxCardsInHand = 12;

function cleanName(value: string): string {
  const name = value.replace(/\s+/g, " ").trim();

  if (name.length === 0) {
    throw new ServiceError("Escreva o seu nome", 422);
  }

  return name.slice(0, maxNameLength);
}

export async function loadRoom(code: string): Promise<RoomRow> {
  const { data } = await serverClient()
    .from("fs_rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (!data) {
    throw new ServiceError("Essa sala não existe mais", 404);
  }

  return data as RoomRow;
}

export async function loadPlayer(room: RoomRow, token: string): Promise<PlayerRow> {
  const client = serverClient();
  const { data: secret } = await client
    .from("fs_player_secrets")
    .select("player_id")
    .eq("room_id", room.id)
    .eq("access_token", token)
    .maybeSingle();

  if (!secret) {
    throw new ServiceError("Sessão inválida para esta sala", 401);
  }

  const { data: player } = await client
    .from("fs_players")
    .select("*")
    .eq("id", secret.player_id as string)
    .maybeSingle();

  if (!player) {
    throw new ServiceError("Você não está mais nesta sala", 404);
  }

  return player as PlayerRow;
}

export async function roster(roomId: string): Promise<PlayerRow[]> {
  const { data } = await serverClient()
    .from("fs_players")
    .select("*")
    .eq("room_id", roomId)
    .order("seat");

  return (data ?? []) as PlayerRow[];
}

export async function roomState(input: { code: string; token?: string }): Promise<RoomState> {
  const room = await loadRoom(input.code);
  const people = await roster(room.id);
  const { data: entries } = await serverClient()
    .from("fs_entries")
    .select("id, player_id, round_number, numbers, modifiers, exit_kind, total, created_at, updated_at")
    .eq("room_id", room.id)
    .order("round_number");

  let meId: string | null = null;

  if (input.token) {
    const { data: secret } = await serverClient()
      .from("fs_player_secrets")
      .select("player_id")
      .eq("room_id", room.id)
      .eq("access_token", input.token)
      .maybeSingle();

    meId = (secret?.player_id as string) ?? null;
  }

  return { room, players: people, entries: (entries ?? []) as EntryRow[], meId };
}

export async function createRoom(input: { hostName: string; avatar?: string; emoji?: string }) {
  const client = serverClient();
  const { data: code, error: codeError } = await client.rpc("fs_generate_code");

  if (codeError) {
    throw new ServiceError(codeError.message, 500);
  }

  const { data: room, error: roomError } = await client
    .from("fs_rooms")
    .insert({ code })
    .select()
    .single();

  if (roomError) {
    throw new ServiceError(roomError.message, 500);
  }

  const joined = await joinRoom({
    code: room.code as string,
    name: input.hostName,
    avatar: input.avatar,
    emoji: input.emoji,
  });

  await client.from("fs_rooms").update({ host_player_id: joined.playerId }).eq("id", room.id);

  return joined;
}

export async function joinRoom(input: {
  code: string;
  name: string;
  avatar?: string;
  emoji?: string;
}) {
  const client = serverClient();
  const room = await loadRoom(input.code);

  if (room.phase !== RoomPhase.Lobby) {
    throw new ServiceError("Essa partida já começou", 409);
  }

  const people = await roster(room.id);

  if (people.length >= maxPlayers) {
    throw new ServiceError(`A mesa já está com ${maxPlayers} jogadores`, 409);
  }

  const name = cleanName(input.name);

  if (people.some((person) => person.name.toLowerCase() === name.toLowerCase())) {
    throw new ServiceError("Já tem alguém com esse nome na mesa", 409);
  }

  const { data: player, error } = await client
    .from("fs_players")
    .insert({
      room_id: room.id,
      name,
      avatar: input.avatar ?? null,
      emoji: input.emoji ?? null,
      seat: people.length + 1,
    })
    .select()
    .single();

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  const accessToken = randomUUID().replace(/-/g, "");

  await client.from("fs_player_secrets").insert({
    room_id: room.id,
    player_id: player.id,
    access_token: accessToken,
  });

  return {
    code: room.code,
    playerId: player.id as string,
    accessToken,
    name,
  };
}

export async function updateProfile(input: {
  code: string;
  token: string;
  avatar?: string | null;
  emoji?: string | null;
}) {
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);
  const patch: Record<string, unknown> = {};

  if (input.avatar !== undefined) {
    patch.avatar = input.avatar;
  }

  if (input.emoji !== undefined) {
    patch.emoji = input.emoji;
  }

  if (Object.keys(patch).length === 0) {
    throw new ServiceError("Nada para mudar", 422);
  }

  await serverClient().from("fs_players").update(patch).eq("id", me.id);

  return roomState({ code: input.code, token: input.token });
}

export async function startMatch(input: { code: string; token: string }) {
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  if (room.phase !== RoomPhase.Lobby) {
    throw new ServiceError("Essa partida já começou", 409);
  }

  if (room.host_player_id && room.host_player_id !== me.id) {
    throw new ServiceError("Quem abriu a sala começa a partida", 403);
  }

  const people = await roster(room.id);

  if (people.length < minPlayers) {
    throw new ServiceError(`Precisa de pelo menos ${minPlayers} jogadores`, 409);
  }

  await serverClient()
    .from("fs_rooms")
    .update({ phase: RoomPhase.Playing, round_number: 1 })
    .eq("id", room.id)
    .eq("phase", RoomPhase.Lobby);

  return roomState({ code: input.code, token: input.token });
}

function checkedNumbers(values: unknown): number[] {
  if (!Array.isArray(values)) {
    throw new ServiceError("Cartas inválidas", 422);
  }

  const numbers = values.map((value) => Number(value));

  if (numbers.some((value) => !Number.isInteger(value) || value < lowestCard || value > highestCard)) {
    throw new ServiceError(`As cartas vão de ${lowestCard} a ${highestCard}`, 422);
  }

  if (numbers.length > maxCardsInHand) {
    throw new ServiceError("Cartas demais para uma rodada só", 422);
  }

  return numbers;
}

function checkedModifiers(values: unknown): Modifier[] {
  if (!Array.isArray(values)) {
    throw new ServiceError("Bônus inválidos", 422);
  }

  const list = values.map((value) => String(value));

  if (list.some((value) => !allowedModifiers.includes(value as Modifier))) {
    throw new ServiceError("Esse bônus não existe no baralho", 422);
  }

  return list as Modifier[];
}

function checkedExit(value: unknown): ExitKind {
  if (value !== ExitKind.Stay && value !== ExitKind.Freeze && value !== ExitKind.Bust) {
    throw new ServiceError("Saída inválida para a rodada", 422);
  }

  return value;
}

async function refreshTotals(roomId: string) {
  const client = serverClient();
  const { data: entries } = await client
    .from("fs_entries")
    .select("player_id, total")
    .eq("room_id", roomId);

  const tally = new Map<string, number>();

  for (const entry of (entries ?? []) as Array<{ player_id: string; total: number }>) {
    tally.set(entry.player_id, (tally.get(entry.player_id) ?? 0) + entry.total);
  }

  const people = await roster(roomId);

  await Promise.all(
    people.map((person) =>
      client
        .from("fs_players")
        .update({ total: tally.get(person.id) ?? 0 })
        .eq("id", person.id),
    ),
  );

  return people.map((person) => ({ ...person, total: tally.get(person.id) ?? 0 }));
}

async function settleRound(room: RoomRow) {
  const client = serverClient();
  const people = await refreshTotals(room.id);
  const { data: entries } = await client
    .from("fs_entries")
    .select("player_id")
    .eq("room_id", room.id)
    .eq("round_number", room.round_number);

  const done = new Set(((entries ?? []) as Array<{ player_id: string }>).map((row) => row.player_id));

  if (people.some((person) => !done.has(person.id))) {
    return;
  }

  const front = champions(people.map((person) => ({ playerId: person.id, total: person.total })));

  if (front.length > 0) {
    await client
      .from("fs_rooms")
      .update({
        phase: RoomPhase.Finished,
        winner_player_id: front[0].playerId,
        finished_at: new Date().toISOString(),
      })
      .eq("id", room.id);

    return;
  }

  await client
    .from("fs_rooms")
    .update({ round_number: room.round_number + 1 })
    .eq("id", room.id)
    .eq("round_number", room.round_number);
}

export async function saveEntry(input: {
  code: string;
  token: string;
  roundNumber?: number;
  numbers: unknown;
  modifiers: unknown;
  exitKind: unknown;
}) {
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  if (room.phase !== RoomPhase.Playing) {
    throw new ServiceError(
      room.phase === RoomPhase.Lobby ? "A partida ainda não começou" : "A partida já acabou",
      409,
    );
  }

  const roundNumber = input.roundNumber ?? room.round_number;

  if (roundNumber < 1 || roundNumber > room.round_number) {
    throw new ServiceError("Essa rodada não existe", 422);
  }

  const numbers = checkedNumbers(input.numbers);
  const list = checkedModifiers(input.modifiers);
  const exitKind = checkedExit(input.exitKind);
  const total = roundScore({ numbers, modifiers: list, busted: exitKind === ExitKind.Bust });

  const { error } = await serverClient()
    .from("fs_entries")
    .upsert(
      {
        room_id: room.id,
        player_id: me.id,
        round_number: roundNumber,
        numbers,
        modifiers: list,
        exit_kind: exitKind,
        total,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "room_id,player_id,round_number" },
    );

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  await settleRound(room);

  return roomState({ code: input.code, token: input.token });
}

export async function removeEntry(input: { code: string; token: string; entryId: string }) {
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);
  const client = serverClient();

  const { data: entry } = await client
    .from("fs_entries")
    .select("id, player_id")
    .eq("id", input.entryId)
    .eq("room_id", room.id)
    .maybeSingle();

  if (!entry) {
    throw new ServiceError("Essa rodada não está mais no placar", 404);
  }

  if (entry.player_id !== me.id) {
    throw new ServiceError("Cada um apaga só a própria pontuação", 403);
  }

  await client.from("fs_entries").delete().eq("id", entry.id);
  await refreshTotals(room.id);

  return roomState({ code: input.code, token: input.token });
}

export async function leaveRoom(input: { code: string; token: string }) {
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);
  const client = serverClient();
  const people = await roster(room.id);

  if (people.length === 1) {
    await client.from("fs_rooms").delete().eq("id", room.id);

    return { left: true as const, lastOne: true as const };
  }

  await client.from("fs_players").delete().eq("id", me.id);

  if (room.host_player_id === me.id) {
    const next = people.find((person) => person.id !== me.id);

    await client.from("fs_rooms").update({ host_player_id: next?.id ?? null }).eq("id", room.id);
  }

  await refreshTotals(room.id);

  const fresh = await loadRoom(input.code);

  if (fresh.phase === RoomPhase.Playing) {
    await settleRound(fresh);
  }

  return { left: true as const, lastOne: false as const };
}

export { ServiceError };
