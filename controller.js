const { test4_2, restaurant_detail } = require("./models");
const axios = require("axios");
const delay = require("delay");
const fs = require("file-system");
// const { Client } = require("@googlemaps/google-maps-services-js");
// const GOOGLE_MAPS_API_KEY = "google key";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
// const { GeoTrans, Point } = require("./GeoTrans");
const puppeteer = require("puppeteer");

module.exports = {
  insertController: async (req, res) => {
    //파일을 한줄씩 읽어와서 구와 동의 정보를 읽어서 온다..
    //파일 시스템을 이용한 파일 불러오기..

    //총 갯수가 몇개가 있는지 검색 해보기!!! 완성
    async function axiosTotalSearch(data) {
      let url = "http://localhost:3000/search/local?";
      let query = "query=" + encodeURI(data + " 맛집");
      let display = "&display=" + encodeURI(1);
      let sort = "&sort=" + encodeURI("comment");
      let start = "&start=" + encodeURI(1);

      let result = url + query + display + sort + start;
      return await axios
        .get(result)
        .then(data => {
          return data.data.total;
        })
        .catch(err => {
          console.log(err);
        });
    }

    //30개씩 묶어서 검색하는 url 를 만드는것 위의 total 데이터를 가져옴
    function axiosUrlSearch(word, total) {
      let array = [];
      for (let i = 1; i <= 1000; i += 30) {
        //start 제한 1000..
        let url = "http://localhost:3000/search/local?";
        let query = "query=" + encodeURI(word + " 맛집");
        let display = "&display=" + encodeURI(30);
        let sort = "&sort=" + encodeURI("comment");
        let start = "&start=" + encodeURI(i);
        let result = url + query + display + sort + start;
        array.push(result);
      }
      return array;
    }
    //url를 배열 형식으로 만드는게 완성되면...
    //밑에 함수에 넣어준다..

    //insert 하기 위한 url 을 가져와서 넣는 기능 함수
    function axiosInsertget(url, count) {
      axios
        .get(url)
        .then(result => {
          return result.data.items;
        })
        .then(async data => {
          for (let i = 0; i < data.length; i++) {
            restaurant.findOrCreate({
              where: {
                name: data[i].title,
                xmap: data[i].mapx,
                ymap: data[i].mapy,
                roadAddress: data[i].roadAddress,
                phone: data[i].telephone,
                address: data[i].address
              },
              defaults: {
                fd_category_id: data[i].category,
                reviewsort: Number(i + count * 30)
              }
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }

    const getDataFile = function (filePath, callback) {
      fs.readFile(filePath, async function (err, data) {
        if (err) throw err;
        else {
          // console.log((array = data.toString().split("\n")));
          const dataArray = data
            .toString()
            .trim()
            .split("\n");
          callback(dataArray);
        }
      });
    };

    let result = [];
    //배열로 가져온 파일 데이터를 delay 를 주어서 일정 간격을 두고 api를 조회하도록 만든다.
    async function navetapilocation(data) {
      let newArr = [];
      for (let i = 0; i < data.length; i++) {
        //여기안에 naver api를 가져와서 조회하해서 db에 삽입하는 function을 집어 넣는다...
        //-4
        let count = await axiosTotalSearch(data[i]); //  1 몇개가있는지 가져온다.

        if (count > 1000) {
          console.log(data[i]);
          newArr.push(data[i]);
        }
        // 가져온 count를 가지고.. 보낼 url을 배열 형식으로 만들어 낸다..
        let urlArr = axiosUrlSearch(data[i], count);
        // 만들어낸 url를 호출 해서 db에 입력한다.
        for (let i = 0; i < urlArr.length; i++) {
          axiosInsertget(urlArr[i], i); //insert 작업 진행...
          await delay(1000);
        }
        await delay(3000); //3초 간격으로 딜레이를 준다...
      }
      return newArr;
      // data에 배열형식으로 값을 가지고 옵니다...
    }

    //file 데이터를 가져와서 callback 형식으로 보낸다.....
    getDataFile("./location.txt", navetapilocation);
    res.send("인설트 완료...");
  },

  updateGeo: async (req, res) => {
    let restaurants = await test4_2
      .findAll({
        attributes: ["id", "xmap", "ymap", "address", "name", "roadAddress"],
        where: {
          latitude: {
            [Op.is]: null
          }
        },
        order: [["id", "DESC"]]
      })
      .then(result => {
        return result;
      });

    //25000개까지
    let count = 0;
    for (let i = 0; i < restaurants.length; i++) {
      let data = restaurants[i].dataValues; //{ id: 100, xmap: '309717', ymap: '552624' },
      let apiurl = "";
      let key;
      //12만->15만
      key = "";
      if (data.address !== "") {
        apiurl =
          "http://api.vworld.kr/req/address?service=address&request=getCoord";
        apiurl += "&key=" + key;
        apiurl += "&address=" + encodeURI(data.address);
        apiurl += "&type=parcel";
      } else if (data.roadAddress !== "") {
        apiurl =
          "http://api.vworld.kr/req/address?service=address&request=getCoord";
        apiurl += "&key=" + key;
        apiurl += "&address=" + encodeURI(data.roadAddress);
        apiurl += "&type=road";
      } else {
        //파일 시스템으로 저장시키는게 좋아보인다.
        //에러가 날시..
        console.log(data);
        console.log(apiurl);
      }
      let changeaddress = await axios.get(apiurl).then(result => {
        return result.data.response;
      });

      if (changeaddress.status !== "OK") {
        //fs.write 덮어쓰기해야함..
        const getDataFile = function (filePath, callback) {
          fs.readFile(filePath, async function (err, data) {
            if (err) throw err;
            else {
              // console.log((array = data.toString().split("\n")));
              const dataArray = JSON.parse(data.toString().trim());
              callback(dataArray);
            }
          });
        };

        count++;
        let divide = Math.floor(count / 100);
        let nowdata = JSON.stringify(data);
        fs.appendFile("./errordata" + divide + ".txt", nowdata, function (err) {
          if (err) throw err;
          console.log("the file error write");
        });
        continue;
      }

      changeaddress = changeaddress.result.point;
      if (data.address !== "") {
        test4_2.update(
          {
            latitude: changeaddress.y,
            longitude: changeaddress.x
          },
          {
            where: {
              address: data.address,
              latitude: {
                [Op.is]: null
              }
            }
          }
        );
      } else if (data.roadAddress !== "") {
        test4_2.update(
          {
            latitude: changeaddress.y,
            longitude: changeaddress.x
          },
          {
            where: {
              roadAddress: data.roadAddress,
              xlocation: {
                [Op.is]: null
              }
            }
          }
        );
      } else {
        console.log("문제");
      }

      //delay(100);
    }

    res.send("dd");
    // for (let i = 0; i < restaurant.length; i++) {
    //   let xlocation = restaurant[i].xmap
    //   if (Math.floor(i % 100) === 0) {
    //     delay(500);
    //   }
    // }
  },
  kakaoapi: (req, res) => {
    //위에서 쓴 파일 데이터 가져오는 함수
    const getDataFile = function (filePath, callback) {
      fs.readFile(filePath, async function (err, data) {
        if (err) throw err;
        else {
          // console.log((array = data.toString().split("\n")));
          const dataArray = data
            .toString()
            .trim()
            .split("\n");
          callback(dataArray);
        }
      });
    };
    //kakao api를 보내는 함수..
    const kakaoreqest = async function (data) {
      let url = "http://localhost:3000/kakao?query=" + encodeURI(data);
      let checkdata = await axios.get(url).then(result1 => {
        return result1.data;
      });
      console.log(checkdata);
      if (checkdata.meta.total_count !== 0) {
        console.log(data);
        let xlocation = checkdata.documents[0].address.x;
        let ylocation = checkdata.documents[0].address.y;
        test4_2.update(
          {
            latitude: xlocation,
            longtitude: ylocation
          },
          {
            where: {
              address: data,
              latitude: {
                [Op.is]: null
              }
            }
          }
        );
        delay(100);
      }
    };
    //callback 함수를 보낼 함수...
    const kakaofile = function (data) {
      for (let i = 0; i < data.length; i++) {
        kakaoreqest(data[i]);
      }
    };

    getDataFile("./kakaolocation.txt", kakaofile);
  },
  crolling: async (req, res) => {
    //파일 데이터를 읽어온다..
    let read = () => {
      return new Promise((resolve, reject) => {
        fs.readFile("./location.txt", "utf8", function (err, data) {
          if (err) reject(err);
          else {
            const dataArray = data
              .toString()
              .trim()
              .split("\n");
            resolve(dataArray);
          }
        });
      });
    };

    const brower = await puppeteer.launch({ headless: false });
    const page = await brower.newPage();
    await page.setDefaultNavigationTimeout(0);
    let filedata = await read();
    for (let b = 0; b < filedata.length; b++) {
      await page.goto(
        "https://map.naver.com/v5/search/" + encodeURI(filedata[b] + " 맛집")
      );
      await page.waitForNavigation();
      //팝업창 종료
      let check1 = await page.$("div.close_area");
      let check2 = await page.$("#intro_popup_close");
      if (check1) {
        await page.click("div.close_area");
      }
      if (check2) {
        await page.click("#intro_popup_close");
      }
      await page.waitFor(2000);

      let errorCheck = await page.$(".error_message");
      if (errorCheck) {
        continue;
      }
      //필터 설정...음식종류 설정..
      for (let j = 2; j <= 9; j++) {
        let category = "";
        let btnselectCheck = await page.$(".btn_select");
        if (btnselectCheck) {
          await page.click(".btn_select");
          await page.waitFor(2000);
          await page.click("ul.list_select>li:nth-child(2)");

          await page.waitFor(2000);
          await page.click(".btn_option");
          await page.waitFor(2000);

          let categorycheck = page.$(
            ".filter_area>.section_box>.list_option>li:nth-child(" +
            j +
            ")>label"
          );
          if (!categorycheck) {
            break;
          }
          category = await page.$eval(
            ".filter_area>.section_box>.list_option>li:nth-child(" +
            j +
            ")>label",
            element => element.textContent
          );
          await page.waitFor(1000);
          console.log(category);
          await page.click(".btn_reset"); //초기화버튼
          await page.waitFor(2000);
          await page.click(
            ".filter_area>.section_box>.list_option>li:nth-child(" +
            j +
            ")>label"
          ); //라벨버튼클릭
          await page.waitFor(1000);
          await page.click(
            ".filter_area>div.btn_box>div.btn_inner>button:nth-child(3)"
          ); //확인버튼 클릭
          await page.waitFor(2000);
        } else {
          break;
        }
        let errorCheck = await page.$(".error_message");
        if (errorCheck) {
          continue;
        }
        //다음버튼클릭이 disable 될떄 중지하기 위함..
        let data = false;
        while (data === false) {
          let errorCheck = await page.$(".error_message");
          if (errorCheck) {
            data = true;
            break;
          }

          //갯수를 가져와서 n번만큼 실행한다.
          let datalong = await (await page.$$(".title_box")).length;
          //다음버튼클릭이 disable 될떄 중지하기 위함..
          let nextPageCheck = await page.$(".btn_next");
          if (nextPageCheck) {
            data = await page.$eval(".btn_next", element => element.disabled);
          }
          for (let i = 1; i <= datalong; i++) {
            let errorCheck = await page.$(".error_message");
            if (errorCheck) {
              data = true;
              break;
            }
            //변수선언
            let phone = "";
            let clock = "";
            let restde = "";
            let newArr = "";
            let option = "";
            let menuImage = "";
            let object = {};
            let name = "";
            let image = "";
            let roadAddress = "";
            let titlecheck = await page.$(
              "div.list_search>search-item-place:nth-child(" +
              i +
              ")>.link_search>.search_box>.title_box"
            );
            if (!titlecheck) {
              continue; //식당제목이 없을경우
            }
            await page.click(
              ///식당 제목 클릭
              "div.list_search>search-item-place:nth-child(" +
              i +
              ")>.link_search>.search_box>.title_box"
            );
            await page.waitFor(2000);
            //몇번쨰 데이타끼지 있는가...
            let datalength = await page.$$eval(
              ".list_end>.item_end",
              element => element.length
            );
            //name 식당이름
            let nameCheck = await page.$(
              ".summary_area>.summary_title_box>.summary_title"
            );
            if (nameCheck) {
              name = await page.$eval(
                ".summary_area>.summary_title_box>.summary_title",
                element => element.textContent
              );
            }
            //전화번호 정보가 있는 경우만..
            if (datalength >= 2) {
              //전화번호
              let phoneCheck = await page.$(
                ".list_end>.item_end:nth-child(" + 2 + ")>.end_box"
              );
              if (phoneCheck) {
                phone = await page.$eval(
                  ".list_end>.item_end:nth-child(" + 2 + ")>.end_box",
                  element => element.textContent
                );
              }
            }
            //영업시간 정보가 있는경우만.
            if (datalength >= 3) {
              //영업시간
              let clockCheck = await page.$(
                ".list_end>.item_end:nth-child(" + 3 + ")>.end_box"
              );
              if (clockCheck) {
                clock = await page.$eval(
                  ".list_end>.item_end:nth-child(" + 3 + ")>.end_box",
                  element => element.textContent
                );
              }
            }
            //식당세부정보 있는 정보만
            if (datalength >= 7) {
              //식당소개
              let restdeCheck = await page.$(
                ".list_end>.item_end:nth-child(" + 7 + ")>.end_box"
              );
              if (restdeCheck) {
                restde = await page.$eval(
                  ".list_end>.item_end:nth-child(" + 7 + ")>.end_box",
                  element => element.textContent
                );
              }
            }
            let roadAddressCheck = await page.$("div.list_end a.end_title");
            if (roadAddressCheck) {
              //도로명주소
              roadAddress = await page.$eval(
                "div.list_end a.end_title",
                element => element.textContent
              );
            }
            //메뉴옵션이 있는 경우만
            if (datalength >= 6) {
              //메뉴갯수
              let menu_numCheck = await page.$(
                ".list_end>.item_end:nth-child(6)>.end_box>.list_menu>.item_menu"
              );
              if (menu_numCheck) {
                let menu_num = await page.$$eval(
                  ".list_end>.item_end:nth-child(6)>.end_box>.list_menu>.item_menu",
                  element => element.length
                );
                newArr = [];
                for (let i = 1; i <= menu_num; i++) {
                  let data = await page.$eval(
                    ".list_end>.item_end:nth-child(6)>.end_box>.list_menu>.item_menu:nth-child(" +
                    i +
                    ")",
                    element => element.textContent
                  );
                  newArr.push(data);
                }
              }
              //이미지가 있는지 check...
              let menuImageCheck = await page.$(
                ".list_end>.item_end:nth-child(6)>.end_box>a.link_more"
              );
              //식당메뉴판클릭
              if (menuImageCheck) {
                await page.click(
                  ".list_end>.item_end:nth-child(6)>.end_box>a.link_more"
                );
                await page.waitFor(2000);
                let menuImageCheck = await page.$("div.photo_box>img");
                if (menuImageCheck) {
                  menuImage = await page.$eval(
                    "div.photo_box>img",
                    element => element.src
                  );
                }
              }
            }
            //식당옵션이 있는경우만
            if (datalength >= 8) {
              // optionlength 체크
              let optionlengthCheck = await page.$$(
                ".list_end>.item_end:nth-child(8)>.end_box>ul>li"
              );
              if (optionlengthCheck) {
                let optionlength = await page.$$eval(
                  ".list_end>.item_end:nth-child(8)>.end_box>ul>li",
                  element => element.length
                );
                let optionArr = [];
                for (let a = 1; a <= optionlength; a++) {
                  let dataCheck = await page.$(
                    ".list_end>.item_end:nth-child(8)>.end_box>ul>li:nth-child(" +
                    a +
                    ")"
                  );
                  if (dataCheck) {
                    let data = await page.$eval(
                      ".list_end>.item_end:nth-child(8)>.end_box>ul>li:nth-child(" +
                      a +
                      ")",
                      element => element.textContent
                    );
                    optionArr.push(data);
                  }
                }
                option = optionArr;
              }
            }
            let imageCheck = await page.$(".link_thumb>img");
            if (imageCheck) {
              image = await page.$eval(
                ".link_thumb>img",
                element => element.src
              );
            }
            object["name"] = name;
            object["phone"] = phone;
            object["clock"] = clock;
            object["restde"] = restde;
            object["roadAddress"] = roadAddress;
            object["menu"] = newArr;
            object["option"] = option;
            object["image"] = image;
            object["menuImage"] = menuImage;
            console.log(object);
            console.log(category);
            restaurant_detail.findOrCreate({
              where: {
                name: object.name,
                phone: object.phone,
                roadAddress: object.roadAddress
              },
              defaults: {
                clock: object.clock,
                restdetail: object.restde,
                menu: JSON.stringify(object.menu),
                option: JSON.stringify(object.option),
                image: object.image,
                menuImage: object.menuImage,
                category: category
              }
            });
            let btn_list_back_check = await page.$(
              "entry-place search-box .btn_list_back"
            );
            if (btn_list_back_check) {
              await page.click("entry-place search-box .btn_list_back"); //뒤로가기...
              await page.waitFor(3000);
            }
            console.log(i);
          }
          nextPageCheck = await page.$(".btn_next");
          if (nextPageCheck) {
            await page.click(".btn_next");
            await page.waitFor(2000);
          } else {
            data = true; //next 가 없을떄 수동으로 true설정필요,,
          }
        }
      }
    }
  },
  //카텍좌표 -> 위도 경도 변환
  transcoord: async (req, res) => {
    let data = await test4_2
      .findAll({
        attributes: ["id", "xmap", "ymap", "address", "name", "roadAddress"],
        where: {
          longitude: {
            [Op.is]: null
          }
        }
      })
      .then(result => {
        return result.map(result => {
          return result.dataValues;
        });
      });
    let words = [];
    let where = [];
    for (let i = 0; i < 3; i++) {
      let xmap = data[i].xmap;
      let ymap = data[i].ymap;

      setTimeout(function () {
        let url = "http://localhost:4001/kakaochange?x=" + ymap + "&y=" + xmap;
        axios
          .get(url)
          .then(result => {
            result = result.data;

            if (result.meta.total_count > 0) {
              words.push({
                latitude: result.documents[0].y,
                longitude: result.documents[0].x
              });
              where.push({ xmap: xmap, ymap: ymap });
            }
          })
          .catch(err => {
            console.log(err);
          });
      }, 100 * i);
    }
    console.log(words);
    console.log(where);
  }
};
