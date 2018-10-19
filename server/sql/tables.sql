--- database tables for reactsdb demo

--- drop all tables and sequences

drop table if exists users cascade;
drop table if exists locations cascade;
drop table if exists checkins cascade;
drop table if exists sessions cascade;

drop sequence if exists users_id_seq;
drop sequence if exists locations_id_seq;
drop sequence if exists  checkins_id_seq;
drop sequence if exists sessions_id_seq;

--- create sequences

create sequence users_id_seq start with 1000;
create sequence locations_id_seq start with 1000;
create sequence checkins_id_seq start with 1000;
create sequence sessions_id_seq start with 1000;

--- create tables

create table users ( -- all users are here: both admins and mobile users
  id integer primary key default nextval('users_id_seq'), 
  username varchar(100) not null unique, -- std username or facebook:0013230 or google:233320111
  service varchar(20), -- null or facebook or google
  service_uid varchar(50), -- null or user id in facebook or google  
  fullname varchar(100), --- used for facebook and google   
  -- stuff user can enter and change:
  firstname varchar(100),
  lastname varchar(100),
  password varchar(1000), -- not used for facebook or google case
  salt varchar(256) not null, -- password salt: appended to password before hash
  photo varchar(100), -- medium photo url
  thumb varchar(100), -- thumbnail photo url
  phone varchar(50),
  email varchar(50),
  address varchar(100),
  city varchar(50),
  country varchar(50), 
  lang varchar(10),
  about varchar(1000), -- user may tell us something about herself
  tagprefs jsonb, -- list of tags the user prefers like ["view","eat","fun"] etc  
  uistyle varchar(50),
  locationid integer,
  -- stuff user cannot enter/change directly:
  checkins jsonb, -- yet unknown structure for caching user checkins, likes etc for locations, 
  remarks varchar(1000), 
  level integer default 1 not null, --- main level shown to user 
  points integer default 1 not null, --- total amount of points user has
  followingcount integer default 0 not null CHECK (followingcount >= 0), -- how many users she follows
  followedcount integer default 0 not null CHECK (followedcount >= 0), -- how many users follow her
  continentscount integer default 0 not null, -- how many continents visited
  countriescount integer default 0 not null, -- how many countries visited
  citiescount integer default 0 not null, -- how many cities visited
  placescount integer default 0 not null, -- how many places visited
  streak_start timestamp, -- when did the last active streak start: null if no streak
  streak_last timestamp, -- when was the last upload counted as a point-giving streak event or streak start
  scores jsonb, -- yet unknown structure for storing score details
  extra jsonb, -- yet unknown structure for storing additional information  
  instid varchar(100), -- last installation textual id
  rights integer default 3,    --- 0 superuser, 1 admin, 2 data write/change, 3 social media login, 10 unauthenticated  
  status char(1) default 'A', --- A: active, D: deleted, W: waiting for activation   
  activity_at timestamp, -- last major user activity time (not all requests update this)  
  created_at timestamp default now(),
  updated_at timestamp default now(),
  updated_by varchar(100) -- username or systemname creating/updating
);


create table locations ( -- all identified locations, small and large
  id integer primary key default nextval('locations_id_seq'), 
  lat float not null, -- latitude
  lng float not null,  -- longitude
  rank integer default 0 not null, -- 0 is very common (bronze), 1 is less common (silver), 2 is rare (gold)  
  zoom integer default 0 not null, -- map zoom level at which shown
  pop integer default 0 not null, -- main popularity number
  score integer default 0 not null, -- main score number (0 ... N)
  vispop integer default 0 not null, -- initial visual popularity 
  knownpop integer default 0 not null, -- initial wellknowedness number
  extvisits integer default 0 not null, -- initial known external visits
  visits integer default 0 not null, -- visits known from our system
  continentcode char(3), -- continent code if known
  countrycode char(3), -- country code if known
  country varchar(100), -- country name if known
  areaid integer, -- area id if known
  areaname varchar(100), -- area name if known
  city varchar(100), -- city/village name if known  
  radius float, -- radius of the object, if known
  vradius float, -- visible radius of the object,if known
  name varchar(100), -- main name
  thumb varchar(100), --  main thumbnail filename or url part
  photo varchar(100),  -- main large photo filename or url part
  types jsonb, -- main or coarse type   
  subtypes jsonb, -- secondary or fine-grained type
  desctext varchar(1000), -- main description
  descsrc varchar(100), -- source of the main description
  links jsonb, -- main links as a name:url dict
  tags jsonb, -- main tags as a tag:importance dict
  extra jsonb, -- all extrainfo, initially raw merged data from sightsmap
  systsource varchar(100), -- system source from which known
  userid integer references users(id), -- user id if originates from this user
  version varchar(10), -- sender software version
  locinfocache jsonb, -- cached selective list of locinfo dicts, each sent from a user
  status char(1) default 'A', --- A: active, S: submitted, D: deleted
  created_at timestamp default now(),
  updated_at timestamp default now(),
  updated_by varchar(100) -- username or systemname creating/updating
);

create table checkins ( -- all checkins of users without added data, except ratings
  id integer primary key default nextval('checkins_id_seq'), 
  locationid integer references locations(id) not null, -- location which is described
  continent char(2),
  country char(3),
  area integer,
  userid integer references users(id), -- user id who sent this info  
  score integer, -- score given by user
  been char(1), -- user been in the location and checked in
  softbeen char(1), -- user marks location as been in
  wish char(1), -- user has it on wishlist
  status char(1) default 'A', --- A: active, D: deleted
  been_at timestamp, -- when was user really there
  created_at timestamp default now(),
  updated_at timestamp default now()  
);

create table sessions ( -- UI login session data, automatically managed

  -- only main information present
  id integer primary key default nextval('sessions_id_seq'),   
  username varchar(100) references users(username) not null,
  sid varchar(1000) not null unique, -- session id passed over http
  token varchar(1000), -- optional external session id
  endts timestamp not null default now()+interval '1 hour',
  created_at timestamptz default now() -- when was created  
);
