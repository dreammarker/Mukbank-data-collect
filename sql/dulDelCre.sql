     /** createtablename 에 생성할 테이블 이름을 적고
      searchtablename에는 중복된 테이블의 이름을 적으면 된다.
      식당 테이블 정보만!!
      "DROP TABLE IF EXISTS " +
      createtablename +
      " CREATE TABLE " +
      createtablename +
      " (SELECT @rownum:=@rownum + 1 AS id," +
      "    name,                                                 " +
      "    phone,                                                " +
      "    address,                                              " +
      "    image,                                                " +
      "    xlocation,                                            " +
      "    ylocation,                                            " +
      "    xmap,                                                 " +
      "    ymap,                                                 " +
      "    roadAddress,                                          " +
      "    category,                                             " +
      "    MIN(reviewsort) AS reviewsort,                        " +
      "    MIN(createdAt) AS createdAt,                          " +
      "    MIN(updatedAt) AS updatedAt,                          " +
      "    MIN(deletedAt) AS deletedAt FROM                      " +
      searchtablename +
      "GROUP BY name , phone , address , image , xlocation , ylocation , xmap , ymap , roadAddress , category)";
      */

