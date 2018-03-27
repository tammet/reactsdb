
insert into users(id,username,password,fullname) values  (1,'john','johnpwd','John Smith');
insert into users(id,username,password,fullname) values  (2,'alice','alicepwd','Alice Winter');  

insert into locations(id,lat,lng,name) values (1,59.397014,24.662592,'IT building');
insert into locations(id,lat,lng,name) values (2,59.337014,24.672592,'test2');

insert into checkins(id,locationid,userid) values (3,2,1);
