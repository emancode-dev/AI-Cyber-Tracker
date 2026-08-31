-- Day 21: persist the complete normalized finding presentation used by the React UI.
-- Detailed scan/finding rows remain temporary under the later retention phase.

alter table public.findings
  add column if not exists title text not null default '',
  add column if not exists why_it_matters text not null default '';

create index if not exists findings_scan_status_idx
  on public.findings(scan_id, status);
