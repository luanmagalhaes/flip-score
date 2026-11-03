alter table fs_players
  add column if not exists joined_round int not null default 1;
