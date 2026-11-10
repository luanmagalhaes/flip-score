alter table fs_rooms
  add column if not exists started_at timestamptz;

alter table fs_matches
  add column if not exists closed_by text not null default 'target';

update fs_rooms set started_at = created_at where started_at is null and phase = 'PLAYING';

create index if not exists fs_rooms_started_idx on fs_rooms(phase, started_at);
