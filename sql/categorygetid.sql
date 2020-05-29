/*
category table의 값을 가져와서 api에 있는 문자열을 토대로 id값을 가져오는 함수,..
CREATE DEFINER=`dream`@`localhost` FUNCTION `categorygetid`(category varchar(255)) RETURNS varchar(255) CHARSET utf8
BEGIN
    DECLARE category_id varchar(255);
    SELECT id 
    into category_id
    from foodcategories
    where longword = category
    and   deletedAt is null;
    
    IF category_id is null then
     SELECT id 
     into category_id
     from foodcategories
     where longword = category
     and   deletedAt is not null;
         IF category_id is null then
     set category_id = category;
    END IF;
    END IF;
    
RETURN category_id;
END
*/