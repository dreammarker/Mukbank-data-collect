/*SELECT *,
    (6371*acos(cos(radians(현재lat))*cos(radians(상대lat))*cos(radians(상대long)
    -radians(현재lon))+sin(radians(상대lat))*sin(radians(상대lat))))
    AS distance
FROM restaurants
HAVING distance <= 0.5
ORDER BY reviewsort,distance */