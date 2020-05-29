/* isNumber 숫자인지 문자열인지 구분하는 함수...
CREATE DEFINER=`dream`@`localhost` FUNCTION `isNumber`(inputValue VARCHAR(50)) RETURNS int(11)
BEGIN
	IF (inputValue REGEXP ('^[0-9]+$')) THEN 
		RETURN 1;
    ELSE
		RETURN 0;
	END IF;
END
*/