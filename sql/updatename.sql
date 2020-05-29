/*
&amp; => &
select replace(name,"&amp;","&")
FROM restaurants_seoul2_test_minsort_id
where  name like "%&amp%";

update restaurants_seoul2_test_minsort_id
set name = replace(name,"&amp;","&")
where name  like "%&amp%";


<b> </b> 로 묶여있는 가게이름 name 을 <b> </b> 공백처리
select count(*)
FROM restaurants_seoul2_test_minsort_id2
where  name like "%<b>%";


update restaurants_seoul2_test_minsort_id
set name = replace(replace(name,"<b>",""),"</b>","")
where name  like  "%<b>%";
*/
