

insert into users -- user test1 with password pwd1
  (id,username,salt,password,fullname) values
  (1,'test1','salty1',
  -- password obtained as hashlib.sha512('pwd1'+'salty1').hexdigest()
  '96f6ee464ef23590d79db79b682b7a81b28e69102187a8e9b2ab6aebbf1975bbf681067c751f8cc77bca2fb8f0a8d70fec75b92c99b4f28cbe1a3eadf6a31c02',
  'John Smith1');

insert into users -- user test2 with password pwd2
  (id,username,salt,password,fullname) values
  (2,'test2','salty2',
  -- password obtained as hashlib.sha512('pwd2'+'salty2').hexdigest()
  'f897967378a0004ce6a2ab29ee81ccaf71005c37a10a54cda83d6973c55d459822b69e1649d82c43e51ca5580b651610b529dda9d5b990370a61261ca2ab1fc4',
  'Alice Winter2');

-- sessions

insert into sessions -- very long session for user test2
  (id,username,sid,endts) values 
  (1,'test1','test2sessionsid',to_timestamp('2020-01-20 17:08:31.689','YYYY-MM-DD HH24:MI:SS'));

insert into locations(id,lat,lng,name) values (1,59.397014,24.662592,'IT building');
insert into locations(id,lat,lng,name) values (2,59.337014,24.672592,'test2');

insert into checkins(id,locationid,userid) values (3,2,1);
