var express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { sequelize } = require("./models");
const { restaurant_detail } = require("./models");

const {
  insertController,
  googlemap,
  updateGeo,
  kakaoapi,
  crolling,
  transcoord
} = require("./controller");

var app = express();
sequelize.sync();
let client_id = ["naver 클라이언트 id"];
let client_secret = ["naver secret 키"];

app.use(
  session({
    secret: "@switzerland",
    resave: false,
    saveUninitialized: true
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.post("/insert", insertController);
app.get("/updateGeo", updateGeo);

app.get("/kakaofile", kakaoapi);
app.get("/kakaogeochange", transcoord);

//ktm -< wgs84 좌표로 바꾸기
app.get("/kakaochange", function (req, res) {
  var request = require("request");
  let api_uri =
    "https://dapi.kakao.com/v2/local/geo/transcoord?x=" +
    encodeURI(req.query.x) +
    "&y=" +
    encodeURI(req.query.y) +
    "&input_coord=KTM&output_coord=WGS84";
  //console.log(api_uri);
  var options = {
    url: api_uri,
    headers: {
      Authorization: "KakaoAK {kakao api key}"
    }
  };

  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.writeHead(200, { "Content-Type": "application/json;charset=UTF-8" });
      res.end(body);
    } else {
      res.status(response.statusCode).end();
      // console.log("error = " + response.statusCode);
    }
  });
});

app.get("/kakao", function (req, res) {
  var request = require("request");
  let api_uri =
    "https://dapi.kakao.com/v2/local/search/address?query=" +
    encodeURI(req.query.query) +
    "&format=json";

  //console.log(api_uri);
  var options = {
    url: api_uri,
    headers: {
      Authorization: "KakaoAK {kakao api key}"
    }
  };

  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.writeHead(200, { "Content-Type": "application/json;charset=UTF-8" });
      res.end(body);
    } else {
      res.status(response.statusCode).end();
      // console.log("error = " + response.statusCode);
    }
  });
});
let count = 0;
let index = 0;
app.get("/search/local", function (req, res) {
  // var api_url =
  //   "https://openapi.naver.com/v1/search/blog?query=" + //블로그 리뷰 갯수가 높은 순서 및 평점 높은 순서로 표시
  //   encodeURI(req.query.query); // json 결과
  // console.log(req);
  count++;
  if (count % 25000 === 0) {
    index++;
  }
  var api_url =
    "https://openapi.naver.com/v1/search/local?query=" + //맛집 지역을 표시
    encodeURI(req.query.query); // json 결과
  api_url += "&display=" + encodeURI(req.query.display);
  api_url += "&sort=" + encodeURI(req.query.sort);
  api_url += "&start=" + encodeURI(req.query.start);
  api_url += "&menu=" + encodeURI(req.query.menu);

  var request = require("request");
  var options = {
    url: api_url,
    headers: {
      "X-Naver-Client-Id": client_id[index],
      "X-Naver-Client-Secret": client_secret[index]
    }
  };

  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
      res.end(body);
    } else {
      res.status(response.statusCode).end();
      console.log("error = " + response.statusCode);
    }
  });
});

app.get("/address/change", function (req, res) {
  let address = req.body.address;
  let api_url =
    "http://api.vworld.kr/req/address?service=" +
    encodeURI("address") +
    "&type=" +
    encodeURI("road") +
    "&request=" +
    encodeURI("getCoord") +
    "&address=" +
    encodeURI(address);
  let request = require("request");
  request.get(function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
      res.end(body);
    } else {
      res.status(response.statusCode).end();
      console.log("error = " + response.statusCode);
    }
  });
});

app.post("/crolling", crolling);

app.listen(4001, function () {
  console.log(
    "http://127.0.0.1:4001/search/blog?query=검색어 app listening on port 3000!"
  );
});

module.exports = app;
