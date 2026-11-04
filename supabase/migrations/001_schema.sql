-- THE GX GROUP core schema
create extension if not exists pgcrypto;

-- ---------- enums (separate pipelines, never shared) ----------
create type partnership_status as enum ('new','under_review','shortlisted','contacted','meeting_scheduled','proposal_sent','accepted','rejected','on_hold');
create type service_status as enum ('new','reviewing','requirement_discussion','quotation_preparation','quotation_sent','negotiation','won','lost','on_hold');

-- ---------- helpers ----------
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin);
$$;

-- ---------- partnership pipeline ----------
create sequence partnership_ref_seq start 1001;
create table public.partnership_applications (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default ('GXP-' || to_char(now(),'YY') || '-' || nextval('partnership_ref_seq')),
  founder_name text not null, email text not null, phone text not null, city text, linkedin text,
  business_name text not null, industry text not null, website text, stage text not null,
  description text not null, problem text not null, solution text not null, target_customers text not null,
  requirements text not null, features text not null, estimated_budget text,
  equity_openness text not null, cofounders text, additional_details text,
  consent boolean not null, consent_at timestamptz not null default now(),
  status partnership_status not null default 'new',
  is_duplicate boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on public.partnership_applications(status);
create index on public.partnership_applications(industry);
create index on public.partnership_applications(created_at desc);
create index on public.partnership_applications(lower(email));

create table public.partnership_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partnership_applications(id) on delete cascade,
  kind text not null default 'supporting', path text not null, file_name text not null, size_bytes int,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.partnership_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partnership_applications(id) on delete cascade,
  body text not null, author uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.partnership_activity (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partnership_applications(id) on delete cascade,
  kind text not null, from_status partnership_status, to_status partnership_status, detail text,
  actor uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------- paid service pipeline ----------
create sequence service_ref_seq start 1001;
create table public.service_enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default ('GXS-' || to_char(now(),'YY') || '-' || nextval('service_ref_seq')),
  name text not null, email text not null, phone text not null, company text,
  project_name text not null, project_type text not null, description text not null, features text not null,
  budget_range text not null, timeline text, reference_links text,
  consent boolean not null, consent_at timestamptz not null default now(),
  status service_status not null default 'new',
  internal_estimate numeric, estimated_effort text, quotation_amount numeric, quotation_notes text,
  is_duplicate boolean not null default false, archived boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on public.service_enquiries(status);
create index on public.service_enquiries(created_at desc);
create index on public.service_enquiries(lower(email));

create table public.service_documents (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.service_enquiries(id) on delete cascade,
  path text not null, file_name text not null, size_bytes int,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.service_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.service_enquiries(id) on delete cascade,
  body text not null, author uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.service_activity (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.service_enquiries(id) on delete cascade,
  kind text not null, from_status service_status, to_status service_status, detail text,
  actor uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------- general ----------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, subject text, message text not null,
  consent boolean not null, handled boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.partnership_applications(id) on delete cascade,
  enquiry_id uuid references public.service_enquiries(id) on delete cascade,
  due_date date not null, method text not null default 'call', notes text, responsible text,
  completed boolean not null default false, completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on public.follow_ups(due_date) where not completed;

create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.partnership_applications(id),
  founder_name text not null, founder_email text, business_name text not null, business_details text,
  approval_status text not null default 'draft', -- draft / terms_agreed / board_approved / issued
  support_obligations text, archived boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.partnership_terms (
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid not null references public.partnerships(id) on delete cascade,
  development_fee numeric, equity_percentage numeric check (equity_percentage between 0 and 100),
  share_class text, issuance_details text, commercial_terms text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.agreements (
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid references public.partnerships(id) on delete cascade,
  title text not null, path text, status text not null default 'draft', signed_on date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid references public.partnerships(id),
  enquiry_id uuid references public.service_enquiries(id),
  name text not null, kind text not null default 'paid', -- paid / partnership / internal
  scope text, deliverables text, team_members text, dependencies text, issues text,
  start_date date, target_date date,
  dev_status text not null default 'planning', -- planning / in_progress / testing / launched / support / paused
  launch_ready boolean not null default false, archived boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null, due_date date, done boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.support_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  summary text not null, hours numeric,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, category text not null,
  ownership text not null default 'internal', -- internal / client
  status text not null default 'in_development', -- live / in_development / prototype
  description text not null, challenge text, solution text, technology text[] default '{}',
  images text[] default '{}', link text, sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null, title text not null, ref_table text, ref_id uuid,
  email_status text not null default 'pending', email_error text, read boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor uuid references auth.users(id), action text not null, table_name text, record_id uuid, detail jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- updated_at triggers
do $$ declare t text; begin
  for t in select tablename from pg_tables where schemaname='public' loop
    execute format('create trigger trg_%1$s_updated before update on public.%1$I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- status-change logging
create or replace function public.log_partnership_status() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into partnership_activity(application_id, kind, from_status, to_status, actor)
    values (new.id, 'status_change', old.status, new.status, auth.uid());
    insert into audit_logs(actor, action, table_name, record_id, detail)
    values (auth.uid(), 'status_change', 'partnership_applications', new.id, jsonb_build_object('from', old.status, 'to', new.status));
  end if; return new; end $$;
create trigger trg_partnership_status after update on public.partnership_applications for each row execute function public.log_partnership_status();

create or replace function public.log_service_status() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into service_activity(enquiry_id, kind, from_status, to_status, actor)
    values (new.id, 'status_change', old.status, new.status, auth.uid());
    insert into audit_logs(actor, action, table_name, record_id, detail)
    values (auth.uid(), 'status_change', 'service_enquiries', new.id, jsonb_build_object('from', old.status, 'to', new.status));
  end if; return new; end $$;
create trigger trg_service_status after update on public.service_enquiries for each row execute function public.log_service_status();

-- ---------- RLS: admin-only everywhere; public only via RPC ----------
do $$ declare t text; begin
  for t in select tablename from pg_tables where schemaname='public' loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;
create policy own_profile on public.profiles for select to authenticated using (id = auth.uid());
create policy public_portfolio on public.portfolio_projects for select to anon, authenticated using (published);

-- ---------- validated public submission RPCs ----------
create or replace function public._req(j jsonb, k text, maxlen int default 4000) returns text language plpgsql immutable as $$
declare v text := nullif(btrim(j->>k), '');
begin
  if v is null then raise exception 'Missing required field: %', k using errcode = '22023'; end if;
  if length(v) > maxlen then raise exception 'Field too long: %', k using errcode = '22023'; end if;
  return v; end $$;
create or replace function public._opt(j jsonb, k text, maxlen int default 4000) returns text language plpgsql immutable as $$
declare v text := nullif(btrim(j->>k), '');
begin
  if v is not null and length(v) > maxlen then raise exception 'Field too long: %', k using errcode = '22023'; end if;
  return v; end $$;
create or replace function public._email(v text) returns text language plpgsql immutable as $$
begin
  if v !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Invalid email address' using errcode = '22023'; end if;
  return lower(v); end $$;
create or replace function public._phone(v text) returns text language plpgsql immutable as $$
begin
  if regexp_replace(v, '[^0-9]', '', 'g') !~ '^[0-9]{8,15}$' then raise exception 'Invalid phone number' using errcode = '22023'; end if;
  return v; end $$;

create or replace function public._attach_docs(docs jsonb, p_app uuid, p_enq uuid) returns void
language plpgsql security definer set search_path = public as $$
declare d jsonb; p text;
begin
  if docs is null or jsonb_typeof(docs) <> 'array' then return; end if;
  if jsonb_array_length(docs) > 6 then raise exception 'Too many files' using errcode='22023'; end if;
  for d in select * from jsonb_array_elements(docs) loop
    p := d->>'path';
    -- only accept paths inside the private uploads bucket that actually exist
    if p is null or p !~ '^(partnership|service)/[0-9a-f-]{36}/[^/]{1,160}$'
       or not exists (select 1 from storage.objects o where o.bucket_id='uploads' and o.name=p) then
      raise exception 'Invalid upload reference' using errcode='22023';
    end if;
    if p_app is not null then
      insert into partnership_documents(application_id, kind, path, file_name, size_bytes)
      values (p_app, coalesce(left(d->>'kind',40),'supporting'), p, left(d->>'name',200), (d->>'size')::int);
    else
      insert into service_documents(enquiry_id, path, file_name, size_bytes)
      values (p_enq, p, left(d->>'name',200), (d->>'size')::int);
    end if;
  end loop; end $$;

create or replace function public.submit_partnership_application(payload jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_email text; v_id uuid; v_ref text; v_dup boolean; v_recent int;
begin
  if coalesce(payload->>'website_url_hp','') <> '' then raise exception 'Rejected' using errcode='22023'; end if; -- honeypot
  if coalesce((payload->>'consent')::boolean,false) is not true then raise exception 'Privacy consent is required' using errcode='22023'; end if;
  v_email := _email(_req(payload,'email',200));
  select count(*) into v_recent from partnership_applications where lower(email)=v_email and created_at > now() - interval '1 hour';
  if v_recent >= 3 then raise exception 'Too many submissions. Please try again later.' using errcode='22023'; end if;
  select exists(select 1 from partnership_applications where lower(email)=v_email
     and lower(business_name)=lower(btrim(payload->>'business_name'))) into v_dup;
  insert into partnership_applications(founder_name,email,phone,city,linkedin,business_name,industry,website,stage,
    description,problem,solution,target_customers,requirements,features,estimated_budget,equity_openness,cofounders,additional_details,consent,is_duplicate)
  values (_req(payload,'founder_name',160), v_email, _phone(_req(payload,'phone',40)), _opt(payload,'city',120), _opt(payload,'linkedin',300),
    _req(payload,'business_name',200), _req(payload,'industry',120), _opt(payload,'website',300), _req(payload,'stage',80),
    _req(payload,'description'), _req(payload,'problem'), _req(payload,'solution'), _req(payload,'target_customers',2000),
    _req(payload,'requirements'), _req(payload,'features'), _opt(payload,'estimated_budget',80), _req(payload,'equity_openness',80),
    _opt(payload,'cofounders',2000), _opt(payload,'additional_details'), true, v_dup)
  returning id, reference into v_id, v_ref;
  perform _attach_docs(payload->'documents', v_id, null);
  insert into partnership_activity(application_id, kind, to_status, detail) values (v_id,'submitted','new','Submitted via website');
  insert into notifications(kind,title,ref_table,ref_id) values ('partnership','New partnership application '||v_ref,'partnership_applications',v_id);
  return jsonb_build_object('reference', v_ref, 'duplicate', v_dup);
end $$;

create or replace function public.submit_service_enquiry(payload jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_email text; v_id uuid; v_ref text; v_dup boolean; v_recent int;
begin
  if coalesce(payload->>'website_url_hp','') <> '' then raise exception 'Rejected' using errcode='22023'; end if;
  if coalesce((payload->>'consent')::boolean,false) is not true then raise exception 'Privacy consent is required' using errcode='22023'; end if;
  v_email := _email(_req(payload,'email',200));
  select count(*) into v_recent from service_enquiries where lower(email)=v_email and created_at > now() - interval '1 hour';
  if v_recent >= 3 then raise exception 'Too many submissions. Please try again later.' using errcode='22023'; end if;
  if (payload->>'project_type') not in ('Mobile application','Website','Web application','SaaS','AI integration','Automation','E-commerce','API and backend','UI/UX design','Other') then
    raise exception 'Invalid project type' using errcode='22023'; end if;
  select exists(select 1 from service_enquiries where lower(email)=v_email
     and lower(project_name)=lower(btrim(payload->>'project_name'))) into v_dup;
  insert into service_enquiries(name,email,phone,company,project_name,project_type,description,features,budget_range,timeline,reference_links,consent,is_duplicate)
  values (_req(payload,'name',160), v_email, _phone(_req(payload,'phone',40)), _opt(payload,'company',200),
    _req(payload,'project_name',200), payload->>'project_type', _req(payload,'description'), _req(payload,'features'),
    _req(payload,'budget_range',80), _opt(payload,'timeline',120), _opt(payload,'reference_links',2000), true, v_dup)
  returning id, reference into v_id, v_ref;
  perform _attach_docs(payload->'documents', null, v_id);
  insert into service_activity(enquiry_id, kind, to_status, detail) values (v_id,'submitted','new','Submitted via website');
  insert into notifications(kind,title,ref_table,ref_id) values ('service','New service enquiry '||v_ref,'service_enquiries',v_id);
  return jsonb_build_object('reference', v_ref, 'duplicate', v_dup);
end $$;

create or replace function public.submit_contact(payload jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_email text; v_id uuid; v_recent int;
begin
  if coalesce(payload->>'website_url_hp','') <> '' then raise exception 'Rejected' using errcode='22023'; end if;
  if coalesce((payload->>'consent')::boolean,false) is not true then raise exception 'Privacy consent is required' using errcode='22023'; end if;
  v_email := _email(_req(payload,'email',200));
  select count(*) into v_recent from contacts where lower(email)=v_email and created_at > now() - interval '1 hour';
  if v_recent >= 3 then raise exception 'Too many submissions. Please try again later.' using errcode='22023'; end if;
  insert into contacts(name,email,subject,message,consent)
  values (_req(payload,'name',160), v_email, _opt(payload,'subject',200), _req(payload,'message'), true) returning id into v_id;
  insert into notifications(kind,title,ref_table,ref_id) values ('contact','New contact message','contacts',v_id);
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.submit_partnership_application(jsonb), public.submit_service_enquiry(jsonb), public.submit_contact(jsonb) from public;
grant execute on function public.submit_partnership_application(jsonb), public.submit_service_enquiry(jsonb), public.submit_contact(jsonb) to anon, authenticated;
revoke all on function public._attach_docs(jsonb,uuid,uuid) from public, anon, authenticated;

-- ---------- private storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads','uploads', false, 10485760,
  array['application/pdf','image/png','image/jpeg','image/webp',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword']);
create policy uploads_public_insert on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] in ('partnership','service'));
create policy uploads_admin_read on storage.objects for select to authenticated using (bucket_id = 'uploads' and public.is_admin());
create policy uploads_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'uploads' and public.is_admin());
