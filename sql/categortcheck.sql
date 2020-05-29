/*
카테고리를 체크하는 함수입니다.
CREATE DEFINER=`dream`@`localhost` FUNCTION `categorycheck`(category varchar(255)) RETURNS varchar(255) CHARSET utf8
BEGIN
    DECLARE category_word varchar(255);
    SELECT longword
    into category_word
    from foodcategories
    where longword = category;
    
    IF category_word is null then
     set category_word =  '없음';
    END IF;
RETURN category_word;
END
*/