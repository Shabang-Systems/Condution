/* Query the system dark theme, and load the appropriate theme */
var css = "text-shadow: -1px -1px hsl(0,100%,50%), 1px 1px hsl(5.4, 100%, 50%), 3px 2px hsl(10.8, 100%, 50%), 5px 3px hsl(16.2, 100%, 50%), 7px 4px hsl(21.6, 100%, 50%), 9px 5px hsl(27, 100%, 50%), 11px 6px hsl(32.4, 100%, 50%), 13px 7px hsl(37.8, 100%, 50%), 14px 8px hsl(43.2, 100%, 50%), 16px 9px hsl(48.6, 100%, 50%), 18px 10px hsl(54, 100%, 50%), 20px 11px hsl(59.4, 100%, 50%), 22px 12px hsl(64.8, 100%, 50%), 23px 13px hsl(70.2, 100%, 50%), 25px 14px hsl(75.6, 100%, 50%), 27px 15px hsl(81, 100%, 50%), 28px 16px hsl(86.4, 100%, 50%), 30px 17px hsl(91.8, 100%, 50%), 32px 18px hsl(97.2, 100%, 50%), 33px 19px hsl(102.6, 100%, 50%), 35px 20px hsl(108, 100%, 50%), 36px 21px hsl(113.4, 100%, 50%), 38px 22px hsl(118.8, 100%, 50%), 39px 23px hsl(124.2, 100%, 50%), 41px 24px hsl(129.6, 100%, 50%), 42px 25px hsl(135, 100%, 50%), 43px 26px hsl(140.4, 100%, 50%), 45px 27px hsl(145.8, 100%, 50%), 46px 28px hsl(151.2, 100%, 50%), 47px 29px hsl(156.6, 100%, 50%), 48px 30px hsl(162, 100%, 50%), 49px 31px hsl(167.4, 100%, 50%), 50px 32px hsl(172.8, 100%, 50%), 51px 33px hsl(178.2, 100%, 50%), 52px 34px hsl(183.6, 100%, 50%), 53px 35px hsl(189, 100%, 50%), 54px 36px hsl(194.4, 100%, 50%), 55px 37px hsl(199.8, 100%, 50%), 55px 38px hsl(205.2, 100%, 50%), 56px 39px hsl(210.6, 100%, 50%), 57px 40px hsl(216, 100%, 50%), 57px 41px hsl(221.4, 100%, 50%), 58px 42px hsl(226.8, 100%, 50%), 58px 43px hsl(232.2, 100%, 50%), 58px 44px hsl(237.6, 100%, 50%), 59px 45px hsl(243, 100%, 50%), 59px 46px hsl(248.4, 100%, 50%), 59px 47px hsl(253.8, 100%, 50%), 59px 48px hsl(259.2, 100%, 50%), 59px 49px hsl(264.6, 100%, 50%), 60px 50px hsl(270, 100%, 50%), 59px 51px hsl(275.4, 100%, 50%), 59px 52px hsl(280.8, 100%, 50%), 59px 53px hsl(286.2, 100%, 50%), 59px 54px hsl(291.6, 100%, 50%), 59px 55px hsl(297, 100%, 50%), 58px 56px hsl(302.4, 100%, 50%), 58px 57px hsl(307.8, 100%, 50%), 58px 58px hsl(313.2, 100%, 50%), 57px 59px hsl(318.6, 100%, 50%), 57px 60px hsl(324, 100%, 50%), 56px 61px hsl(329.4, 100%, 50%), 55px 62px hsl(334.8, 100%, 50%), 55px 63px hsl(340.2, 100%, 50%), 54px 64px hsl(345.6, 100%, 50%), 53px 65px hsl(351, 100%, 50%), 52px 66px hsl(356.4, 100%, 50%), 51px 67px hsl(361.8, 100%, 50%), 50px 68px hsl(367.2, 100%, 50%), 49px 69px hsl(372.6, 100%, 50%), 48px 70px hsl(378, 100%, 50%), 47px 71px hsl(383.4, 100%, 50%), 46px 72px hsl(388.8, 100%, 50%), 45px 73px hsl(394.2, 100%, 50%), 43px 74px hsl(399.6, 100%, 50%), 42px 75px hsl(405, 100%, 50%), 41px 76px hsl(410.4, 100%, 50%), 39px 77px hsl(415.8, 100%, 50%), 38px 78px hsl(421.2, 100%, 50%), 36px 79px hsl(426.6, 100%, 50%), 35px 80px hsl(432, 100%, 50%), 33px 81px hsl(437.4, 100%, 50%), 32px 82px hsl(442.8, 100%, 50%), 30px 83px hsl(448.2, 100%, 50%), 28px 84px hsl(453.6, 100%, 50%), 27px 85px hsl(459, 100%, 50%), 25px 86px hsl(464.4, 100%, 50%), 23px 87px hsl(469.8, 100%, 50%), 22px 88px hsl(475.2, 100%, 50%), 20px 89px hsl(480.6, 100%, 50%), 18px 90px hsl(486, 100%, 50%), 16px 91px hsl(491.4, 100%, 50%), 14px 92px hsl(496.8, 100%, 50%), 13px 93px hsl(502.2, 100%, 50%), 11px 94px hsl(507.6, 100%, 50%), 9px 95px hsl(513, 100%, 50%), 7px 96px hsl(518.4, 100%, 50%), 5px 97px hsl(523.8, 100%, 50%), 3px 98px hsl(529.2, 100%, 50%), 1px 99px hsl(534.6, 100%, 50%), 7px 100px hsl(540, 100%, 50%), -1px 101px hsl(545.4, 100%, 50%), -3px 102px hsl(550.8, 100%, 50%), -5px 103px hsl(556.2, 100%, 50%), -7px 104px hsl(561.6, 100%, 50%), -9px 105px hsl(567, 100%, 50%), -11px 106px hsl(572.4, 100%, 50%), -13px 107px hsl(577.8, 100%, 50%), -14px 108px hsl(583.2, 100%, 50%), -16px 109px hsl(588.6, 100%, 50%), -18px 110px hsl(594, 100%, 50%), -20px 111px hsl(599.4, 100%, 50%), -22px 112px hsl(604.8, 100%, 50%), -23px 113px hsl(610.2, 100%, 50%), -25px 114px hsl(615.6, 100%, 50%), -27px 115px hsl(621, 100%, 50%), -28px 116px hsl(626.4, 100%, 50%), -30px 117px hsl(631.8, 100%, 50%), -32px 118px hsl(637.2, 100%, 50%), -33px 119px hsl(642.6, 100%, 50%), -35px 120px hsl(648, 100%, 50%), -36px 121px hsl(653.4, 100%, 50%), -38px 122px hsl(658.8, 100%, 50%), -39px 123px hsl(664.2, 100%, 50%), -41px 124px hsl(669.6, 100%, 50%), -42px 125px hsl(675, 100%, 50%), -43px 126px hsl(680.4, 100%, 50%), -45px 127px hsl(685.8, 100%, 50%), -46px 128px hsl(691.2, 100%, 50%), -47px 129px hsl(696.6, 100%, 50%), -48px 130px hsl(702, 100%, 50%), -49px 131px hsl(707.4, 100%, 50%), -50px 132px hsl(712.8, 100%, 50%), -51px 133px hsl(718.2, 100%, 50%), -52px 134px hsl(723.6, 100%, 50%), -53px 135px hsl(729, 100%, 50%), -54px 136px hsl(734.4, 100%, 50%), -55px 137px hsl(739.8, 100%, 50%), -55px 138px hsl(745.2, 100%, 50%), -56px 139px hsl(750.6, 100%, 50%), -57px 140px hsl(756, 100%, 50%), -57px 141px hsl(761.4, 100%, 50%), -58px 142px hsl(766.8, 100%, 50%), -58px 143px hsl(772.2, 100%, 50%), -58px 144px hsl(777.6, 100%, 50%), -59px 145px hsl(783, 100%, 50%), -59px 146px hsl(788.4, 100%, 50%), -59px 147px hsl(793.8, 100%, 50%), -59px 148px hsl(799.2, 100%, 50%), -59px 149px hsl(804.6, 100%, 50%), -60px 150px hsl(810, 100%, 50%), -59px 151px hsl(815.4, 100%, 50%), -59px 152px hsl(820.8, 100%, 50%), -59px 153px hsl(826.2, 100%, 50%), -59px 154px hsl(831.6, 100%, 50%), -59px 155px hsl(837, 100%, 50%), -58px 156px hsl(842.4, 100%, 50%), -58px 157px hsl(847.8, 100%, 50%), -58px 158px hsl(853.2, 100%, 50%), -57px 159px hsl(858.6, 100%, 50%), -57px 160px hsl(864, 100%, 50%), -56px 161px hsl(869.4, 100%, 50%), -55px 162px hsl(874.8, 100%, 50%), -55px 163px hsl(880.2, 100%, 50%), -54px 164px hsl(885.6, 100%, 50%), -53px 165px hsl(891, 100%, 50%), -52px 166px hsl(896.4, 100%, 50%), -51px 167px hsl(901.8, 100%, 50%), -50px 168px hsl(907.2, 100%, 50%), -49px 169px hsl(912.6, 100%, 50%), -48px 170px hsl(918, 100%, 50%), -47px 171px hsl(923.4, 100%, 50%), -46px 172px hsl(928.8, 100%, 50%), -45px 173px hsl(934.2, 100%, 50%), -43px 174px hsl(939.6, 100%, 50%), -42px 175px hsl(945, 100%, 50%), -41px 176px hsl(950.4, 100%, 50%), -39px 177px hsl(955.8, 100%, 50%), -38px 178px hsl(961.2, 100%, 50%), -36px 179px hsl(966.6, 100%, 50%), -35px 180px hsl(972, 100%, 50%), -33px 181px hsl(977.4, 100%, 50%), -32px 182px hsl(982.8, 100%, 50%), -30px 183px hsl(988.2, 100%, 50%), -28px 184px hsl(993.6, 100%, 50%), -27px 185px hsl(999, 100%, 50%), -25px 186px hsl(1004.4, 100%, 50%), -23px 187px hsl(1009.8, 100%, 50%), -22px 188px hsl(1015.2, 100%, 50%), -20px 189px hsl(1020.6, 100%, 50%), -18px 190px hsl(1026, 100%, 50%), -16px 191px hsl(1031.4, 100%, 50%), -14px 192px hsl(1036.8, 100%, 50%), -13px 193px hsl(1042.2, 100%, 50%), -11px 194px hsl(1047.6, 100%, 50%), -9px 195px hsl(1053, 100%, 50%), -7px 196px hsl(1058.4, 100%, 50%), -5px 197px hsl(1063.8, 100%, 50%), -3px 198px hsl(1069.2, 100%, 50%), -1px 199px hsl(1074.6, 100%, 50%), -1px 200px hsl(1080, 100%, 50%), 1px 201px hsl(1085.4, 100%, 50%), 3px 202px hsl(1090.8, 100%, 50%), 5px 203px hsl(1096.2, 100%, 50%), 7px 204px hsl(1101.6, 100%, 50%), 9px 205px hsl(1107, 100%, 50%), 11px 206px hsl(1112.4, 100%, 50%), 13px 207px hsl(1117.8, 100%, 50%), 14px 208px hsl(1123.2, 100%, 50%), 16px 209px hsl(1128.6, 100%, 50%), 18px 210px hsl(1134, 100%, 50%), 20px 211px hsl(1139.4, 100%, 50%), 22px 212px hsl(1144.8, 100%, 50%), 23px 213px hsl(1150.2, 100%, 50%), 25px 214px hsl(1155.6, 100%, 50%), 27px 215px hsl(1161, 100%, 50%), 28px 216px hsl(1166.4, 100%, 50%), 30px 217px hsl(1171.8, 100%, 50%), 32px 218px hsl(1177.2, 100%, 50%), 33px 219px hsl(1182.6, 100%, 50%), 35px 220px hsl(1188, 100%, 50%), 36px 221px hsl(1193.4, 100%, 50%), 38px 222px hsl(1198.8, 100%, 50%), 39px 223px hsl(1204.2, 100%, 50%), 41px 224px hsl(1209.6, 100%, 50%), 42px 225px hsl(1215, 100%, 50%), 43px 226px hsl(1220.4, 100%, 50%), 45px 227px hsl(1225.8, 100%, 50%), 46px 228px hsl(1231.2, 100%, 50%), 47px 229px hsl(1236.6, 100%, 50%), 48px 230px hsl(1242, 100%, 50%), 49px 231px hsl(1247.4, 100%, 50%), 50px 232px hsl(1252.8, 100%, 50%), 51px 233px hsl(1258.2, 100%, 50%), 52px 234px hsl(1263.6, 100%, 50%), 53px 235px hsl(1269, 100%, 50%), 54px 236px hsl(1274.4, 100%, 50%), 55px 237px hsl(1279.8, 100%, 50%), 55px 238px hsl(1285.2, 100%, 50%), 56px 239px hsl(1290.6, 100%, 50%), 57px 240px hsl(1296, 100%, 50%), 57px 241px hsl(1301.4, 100%, 50%), 58px 242px hsl(1306.8, 100%, 50%), 58px 243px hsl(1312.2, 100%, 50%), 58px 244px hsl(1317.6, 100%, 50%), 59px 245px hsl(1323, 100%, 50%), 59px 246px hsl(1328.4, 100%, 50%), 59px 247px hsl(1333.8, 100%, 50%), 59px 248px hsl(1339.2, 100%, 50%), 59px 249px hsl(1344.6, 100%, 50%), 60px 250px hsl(1350, 100%, 50%), 59px 251px hsl(1355.4, 100%, 50%), 59px 252px hsl(1360.8, 100%, 50%), 59px 253px hsl(1366.2, 100%, 50%), 59px 254px hsl(1371.6, 100%, 50%), 59px 255px hsl(1377, 100%, 50%), 58px 256px hsl(1382.4, 100%, 50%), 58px 257px hsl(1387.8, 100%, 50%), 58px 258px hsl(1393.2, 100%, 50%), 57px 259px hsl(1398.6, 100%, 50%), 57px 260px hsl(1404, 100%, 50%), 56px 261px hsl(1409.4, 100%, 50%), 55px 262px hsl(1414.8, 100%, 50%), 55px 263px hsl(1420.2, 100%, 50%), 54px 264px hsl(1425.6, 100%, 50%), 53px 265px hsl(1431, 100%, 50%), 52px 266px hsl(1436.4, 100%, 50%), 51px 267px hsl(1441.8, 100%, 50%), 50px 268px hsl(1447.2, 100%, 50%), 49px 269px hsl(1452.6, 100%, 50%), 48px 270px hsl(1458, 100%, 50%), 47px 271px hsl(1463.4, 100%, 50%), 46px 272px hsl(1468.8, 100%, 50%), 45px 273px hsl(1474.2, 100%, 50%), 43px 274px hsl(1479.6, 100%, 50%), 42px 275px hsl(1485, 100%, 50%), 41px 276px hsl(1490.4, 100%, 50%), 39px 277px hsl(1495.8, 100%, 50%), 38px 278px hsl(1501.2, 100%, 50%), 36px 279px hsl(1506.6, 100%, 50%), 35px 280px hsl(1512, 100%, 50%), 33px 281px hsl(1517.4, 100%, 50%), 32px 282px hsl(1522.8, 100%, 50%), 30px 283px hsl(1528.2, 100%, 50%), 28px 284px hsl(1533.6, 100%, 50%), 27px 285px hsl(1539, 100%, 50%), 25px 286px hsl(1544.4, 100%, 50%), 23px 287px hsl(1549.8, 100%, 50%), 22px 288px hsl(1555.2, 100%, 50%), 20px 289px hsl(1560.6, 100%, 50%), 18px 290px hsl(1566, 100%, 50%), 16px 291px hsl(1571.4, 100%, 50%), 14px 292px hsl(1576.8, 100%, 50%), 13px 293px hsl(1582.2, 100%, 50%), 11px 294px hsl(1587.6, 100%, 50%), 9px 295px hsl(1593, 100%, 50%), 7px 296px hsl(1598.4, 100%, 50%), 5px 297px hsl(1603.8, 100%, 50%), 3px 298px hsl(1609.2, 100%, 50%), 1px 299px hsl(1614.6, 100%, 50%), 2px 300px hsl(1620, 100%, 50%), -1px 301px hsl(1625.4, 100%, 50%), -3px 302px hsl(1630.8, 100%, 50%), -5px 303px hsl(1636.2, 100%, 50%), -7px 304px hsl(1641.6, 100%, 50%), -9px 305px hsl(1647, 100%, 50%), -11px 306px hsl(1652.4, 100%, 50%), -13px 307px hsl(1657.8, 100%, 50%), -14px 308px hsl(1663.2, 100%, 50%), -16px 309px hsl(1668.6, 100%, 50%), -18px 310px hsl(1674, 100%, 50%), -20px 311px hsl(1679.4, 100%, 50%), -22px 312px hsl(1684.8, 100%, 50%), -23px 313px hsl(1690.2, 100%, 50%), -25px 314px hsl(1695.6, 100%, 50%), -27px 315px hsl(1701, 100%, 50%), -28px 316px hsl(1706.4, 100%, 50%), -30px 317px hsl(1711.8, 100%, 50%), -32px 318px hsl(1717.2, 100%, 50%), -33px 319px hsl(1722.6, 100%, 50%), -35px 320px hsl(1728, 100%, 50%), -36px 321px hsl(1733.4, 100%, 50%), -38px 322px hsl(1738.8, 100%, 50%), -39px 323px hsl(1744.2, 100%, 50%), -41px 324px hsl(1749.6, 100%, 50%), -42px 325px hsl(1755, 100%, 50%), -43px 326px hsl(1760.4, 100%, 50%), -45px 327px hsl(1765.8, 100%, 50%), -46px 328px hsl(1771.2, 100%, 50%), -47px 329px hsl(1776.6, 100%, 50%), -48px 330px hsl(1782, 100%, 50%), -49px 331px hsl(1787.4, 100%, 50%), -50px 332px hsl(1792.8, 100%, 50%), -51px 333px hsl(1798.2, 100%, 50%), -52px 334px hsl(1803.6, 100%, 50%), -53px 335px hsl(1809, 100%, 50%), -54px 336px hsl(1814.4, 100%, 50%), -55px 337px hsl(1819.8, 100%, 50%), -55px 338px hsl(1825.2, 100%, 50%), -56px 339px hsl(1830.6, 100%, 50%), -57px 340px hsl(1836, 100%, 50%), -57px 341px hsl(1841.4, 100%, 50%), -58px 342px hsl(1846.8, 100%, 50%), -58px 343px hsl(1852.2, 100%, 50%), -58px 344px hsl(1857.6, 100%, 50%), -59px 345px hsl(1863, 100%, 50%), -59px 346px hsl(1868.4, 100%, 50%), -59px 347px hsl(1873.8, 100%, 50%), -59px 348px hsl(1879.2, 100%, 50%), -59px 349px hsl(1884.6, 100%, 50%), -60px 350px hsl(1890, 100%, 50%), -59px 351px hsl(1895.4, 100%, 50%), -59px 352px hsl(1900.8, 100%, 50%), -59px 353px hsl(1906.2, 100%, 50%), -59px 354px hsl(1911.6, 100%, 50%), -59px 355px hsl(1917, 100%, 50%), -58px 356px hsl(1922.4, 100%, 50%), -58px 357px hsl(1927.8, 100%, 50%), -58px 358px hsl(1933.2, 100%, 50%), -57px 359px hsl(1938.6, 100%, 50%), -57px 360px hsl(1944, 100%, 50%), -56px 361px hsl(1949.4, 100%, 50%), -55px 362px hsl(1954.8, 100%, 50%), -55px 363px hsl(1960.2, 100%, 50%), -54px 364px hsl(1965.6, 100%, 50%), -53px 365px hsl(1971, 100%, 50%), -52px 366px hsl(1976.4, 100%, 50%), -51px 367px hsl(1981.8, 100%, 50%), -50px 368px hsl(1987.2, 100%, 50%), -49px 369px hsl(1992.6, 100%, 50%), -48px 370px hsl(1998, 100%, 50%), -47px 371px hsl(2003.4, 100%, 50%), -46px 372px hsl(2008.8, 100%, 50%), -45px 373px hsl(2014.2, 100%, 50%), -43px 374px hsl(2019.6, 100%, 50%), -42px 375px hsl(2025, 100%, 50%), -41px 376px hsl(2030.4, 100%, 50%), -39px 377px hsl(2035.8, 100%, 50%), -38px 378px hsl(2041.2, 100%, 50%), -36px 379px hsl(2046.6, 100%, 50%), -35px 380px hsl(2052, 100%, 50%), -33px 381px hsl(2057.4, 100%, 50%), -32px 382px hsl(2062.8, 100%, 50%), -30px 383px hsl(2068.2, 100%, 50%), -28px 384px hsl(2073.6, 100%, 50%), -27px 385px hsl(2079, 100%, 50%), -25px 386px hsl(2084.4, 100%, 50%), -23px 387px hsl(2089.8, 100%, 50%), -22px 388px hsl(2095.2, 100%, 50%), -20px 389px hsl(2100.6, 100%, 50%), -18px 390px hsl(2106, 100%, 50%), -16px 391px hsl(2111.4, 100%, 50%), -14px 392px hsl(2116.8, 100%, 50%), -13px 393px hsl(2122.2, 100%, 50%), -11px 394px hsl(2127.6, 100%, 50%), -9px 395px hsl(2133, 100%, 50%), -7px 396px hsl(2138.4, 100%, 50%), -5px 397px hsl(2143.8, 100%, 50%), -3px 398px hsl(2149.2, 100%, 50%), -1px 399px hsl(2154.6, 100%, 50%); font-size: 40px;";

const { ipcRenderer } = require('electron');

E.start(firebase);

if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
    currentTheme = "condutiontheme-default-dark";
    $("body").removeClass();
    $("body").addClass(currentTheme);
}
else {
    currentTheme = "condutiontheme-default-light";
    $("body").removeClass();
    $("body").addClass(currentTheme);
}

ipcRenderer.on("systheme-dark", function (event, data) {
    currentTheme = "condutiontheme-default-dark";
    $("body").removeClass();
    $("body").addClass(currentTheme);
});

ipcRenderer.on("systheme-light", function (event, data) {
    currentTheme = "condutiontheme-default-light";
    $("body").removeClass();
    $("body").addClass(currentTheme);
});

let loading_greeting_msgs = ["Welcome.", "Bontehu!", "Breath.", "Coffee or Tea?", "Productivity!", "Look up!", "Ready? Go!", "Accomplish!"];
let loading_greeting = loading_greeting_msgs[Math.floor(Math.random() * loading_greeting_msgs.length)];
$("#loading-msg").html(loading_greeting);

lottie.loadAnimation({
    container: $("#loading-anim")[0],
    renderer: 'svg',
    autoplay: true,
    loop: true,
    path: 'static/loadanim_final.json'
})
$("#loading").hide().css("display", "flex").fadeIn();

const { remote } = require('electron');
const { Menu, MenuItem } = remote;

// TODO: apply themes to colors
// TODO: make a kickstarter
// Chapter 0: The Header.
if (process.platform === "win32") {
    $("#main-head-win32").show();
    $("#left-menu").addClass("win32-windowing");
    $("#content-area").addClass("win32-windowing");
    $("#window-minimize").click(()=>remote.BrowserWindow.getFocusedWindow().minimize());
    $("#window-maximize").click(function(e) {
        if (remote.BrowserWindow.getFocusedWindow().isMaximized()) {
            remote.BrowserWindow.getFocusedWindow().unmaximize();
        } else {
            remote.BrowserWindow.getFocusedWindow().maximize();
        }
    });
    $("#window-close").click(()=>remote.BrowserWindow.getFocusedWindow().close());
} else if (process.platform === "darwin") {
    $("#main-head-darwin").show();
    $("#left-menu").addClass("darwin-windowing-left");
    $("#content-area").addClass("darwin-windowing-right");
}

// Chapter 1: Utilities!
const interfaceUtil = function() {
    const Sortable = require('sortablejs');

    let getThemeColor = (colorName) => $("."+currentTheme).css(colorName);

    let substringMatcher = function(strings) {
        return function findMatches(q, cb) {
            let matches, substrRegex;

            matches = [];
            substrRegex = new RegExp(q, 'i');
            $.each(strings, function(i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    const smartParse = function(timeformat, timeString, o) {
        // smart, better date parsing with chrono
        let d = chrono.parse(timeString)[0].start.date();
        return {
            hour: d.getHours(),
            minute: d.getMinutes(),
            second: d.getSeconds(),
            millisec: d.getMilliseconds(),
            microsec: d.getMicroseconds(),
            timezone: d.getTimezoneOffset() * -1
        };
    };

    const smartParseFull = (timeString) => chrono.parse(timeString)[0];

    const numDaysBetween = function(d1, d2) {
        let diff = Math.abs(d1.getTime() - d2.getTime());
        return diff / (1000 * 60 * 60 * 24);
    };


    let calculateTaskHTML = function(taskId, name, desc, projectSelects, rightCarrotColor) {
        return `<div id="task-${taskId}" class="task"> <div id="task-display-${taskId}" class="task-display" style="display:block"> <input type="checkbox" id="task-check-${taskId}" class="task-check"/> <label class="task-pseudocheck" id="task-pseudocheck-${taskId}" for="task-check-${taskId}" style="font-family: 'Inter', sans-serif;">&zwnj;</label> <input class="task-name" id="task-name-${taskId}" type="text" autocomplete="off" value="${name}"> <div class="task-trash task-subicon" id="task-trash-${taskId}" style="float: right; display: none;"><i class="fas fa-trash"></i></div> <div class="task-repeat task-subicon" id="task-repeat-${taskId}" style="float: right; display: none;"><i class="fas fa-redo-alt"></i></div> </div> <div id="task-edit-${taskId}" class="task-edit" style="display:none"> <textarea class="task-desc" id="task-desc-${taskId}" type="text" autocomplete="off" placeholder="Description">${desc}</textarea> <div class="task-tools" style="margin-bottom: 9px;"> <div class="label"><i class="fas fa-flag"></i></div> <div class="btn-group btn-group-toggle task-flagged" id="task-flagged-${taskId}" data-toggle="buttons" style="margin-right: 20px !important"> <label class="btn task-flagged" id="task-flagged-no-${taskId}"> <input type="radio" name="task-flagged" class="task-flagged-no"> <i class="far fa-circle" style="transform:translateY(-4px)"></i> </label> <label class="btn task-flagged" id="task-flagged-yes-${taskId}"> <input type="radio" name="task-flagged" class="task-flagged-yes"> <i class="fas fa-circle" style="transform:translateY(-4px)"></i> </label> </div> <div class="label"><i class="fas fa-globe-americas"></i></div> <div class="btn-group btn-group-toggle task-floating" id="task-floating-${taskId}" data-toggle="buttons" style="margin-right: 14px !important"> <label class="btn task-floating" id="task-floating-no-${taskId}"> <input type="radio" name="task-floating"> <i class="far fa-circle" style="transform:translateY(-4px)"></i> </label> <label class="btn task-floating" id="task-floating-yes-${taskId}"> <input type="radio" name="task-floating"> <i class="fas fa-circle" style="transform:translateY(-4px)"></i> </label> </div> <div class="label"><i class="far fa-play-circle"></i></div> <input class="task-defer textbox datebox" id="task-defer-${taskId}" type="text" autocomplete="off" style="margin-right: 10px"> <i class="fas fa-caret-right" style="color:${rightCarrotColor}; font-size:13px; transform: translateY(3px); margin-right: 5px"></i> <div class="label"><i class="far fa-stop-circle"></i></div> <input class="task-due textbox datebox" id="task-due-${taskId}" type="text" autocomplete="off" style="margin-right: 20px"> </div> <div class="task-tools"> <div class="label"><i class="fas fa-tasks"></i></div> <select class="task-project textbox editable-select" id="task-project-${taskId}" style="margin-right: 14px"> ${projectSelects} </select> <div class="label"><i class="fas fa-tags"></i></div>
<input class="task-tag textbox" id="task-tag-${taskId}" type="text" value="" onkeypress="this.style.width = ((this.value.length + 5) * 8) + 'px';" data-role="tagsinput" /> </div> </div> </div>`
    };

    return {Sortable:Sortable, sMatch: substringMatcher, sp: smartParse, spf: smartParseFull, daysBetween: numDaysBetween, taskHTML: calculateTaskHTML, gtc: getThemeColor}
}();

let ui = function() {

    // greeting of the day
    let greetings = ["Hello there,", "Hey,", "What's up,", "Howdy,", "Welcome,", "Yo!"];
    let greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // generic data containers used by refresh and others
    let pPandT, possibleProjects, possibleTags, possibleProjectsRev, possibleTagsRev;
    let possiblePerspectives;
    let inboxandDS;
    let avalibility;
    let projectDB;

    // current location
    let pageIndex = {
        currentView: "upcoming-page",
        projectDir: [],
        pageContentID: undefined,
        pageLocks: [],
    };

    activeMenu = "today";

    // refresh data
    let refresh = async function(){
        pPandT = await E.db.getProjectsandTags(uid);
        possibleProjects = pPandT[0][0];
        possibleTags = pPandT[1][0];
        possibleProjectsRev = pPandT[0][1];
        possibleTagsRev = pPandT[1][1];
        possiblePerspectives = await E.db.getPerspectives(uid);
        avalibility = await E.db.getItemAvailability(uid);
        inboxandDS = await E.db.getInboxandDS(uid, avalibility);
        projectDB = await (async function() {
            let pdb = [];
            let topLevels = (await E.db.getTopLevelProjects(uid))[0];
            for (key in topLevels) {
                pdb.push(await E.db.getProjectStructure(uid, key, recursive=true));
            }
            return pdb;
        }());
    };

    // the outside world's refresh function
    let reloadPage = function(delayOverride) {
        pageIndex.pageLocks.push(true);
        return (new Promise(function(resolve, reject) {
            let wait = delayOverride ? 100 : 1750;
            setTimeout(() => {
                if (pageIndex.pageLocks.length > 1) {
                    pageIndex.pageLocks.pop();
                    resolve("Don't Worry: error refreshing... Too many locks.");
                } else if (activeTask !== null) {
                    pageIndex.pageLocks.pop();
                    resolve("Don't Worry: error refreshing... Task active.");
                } else {
                    (loadView(pageIndex.currentView, pageIndex.pageContentID));
                    constructSidebar().then(()=>$("#"+activeMenu).addClass("menuitem-selected"));
                    resolve("Refresh success...");
                }
            }, wait)
        }));
    };


    const showPerspectiveEdit = function() {
        $("#perspective-back").on("click", function(e) {
            $("#perspective-unit").fadeOut(200);
            $("#overlay").fadeOut(200, () => reloadPage(true));
            $("#"+activeMenu).addClass("menuitem-selected");
        });

        $(document).on("click", "#overlay", function(e) {
            if (e.target === this) {
                $(".repeat-subunit").slideUp();
                $("#repeat-toggle-group").slideDown();
                $("#repeat-type").fadeOut(() => $("#repeat-type").html(""));
                $("#repeat-unit").fadeOut(200);
                $("#overlay").fadeOut(200, () => reloadPage(true));
                $("#"+activeMenu).addClass("menuitem-selected");
                $("#repeat-daterow").children().each(function(e) {
                    $(this).css({"background-color": interfaceUtil.gtc("--background-feature")});
                });
                $("#repeat-monthgrid").children().each(function(e) {
                    $(this).css({"background-color": interfaceUtil.gtc("--background")});
                });
            }
        });

        let currentP;

        $("#pquery").change(function(e) {
            E.db.modifyPerspective(uid, currentP, {query: $(this).val()});
        });

        $("#perspective-edit-name").change(function(e) {
            E.db.modifyPerspective(uid, currentP, {name: $(this).val()});
        });

        $("#pavail-avail").click(function(e) {
            E.db.modifyPerspective(uid, currentP, {avail: "avail"});
            $("#perspective-avail-toggle").html("Include: Available &nbsp;<i class=\"fa fa-caret-down\"></i>");
            $("#pavail-group").children().css("background-color", "transparent");
            $("#pavail-avail").css("background-color", interfaceUtil.gtc("--background-feature"));
        });

        $("#pavail-flagged").click(function(e) {
            E.db.modifyPerspective(uid, currentP, {avail: "flagged"});
            $("#perspective-avail-toggle").html("Include: Flagged&nbsp;<i class=\"fa fa-caret-down\"></i>");
            $("#pavail-group").children().css("background-color", "transparent");
            $("#pavail-flagged").css("background-color", interfaceUtil.gtc("--background-feature"));
        });

        $("#pavail-remain").click(function(e) {
            E.db.modifyPerspective(uid, currentP, {avail: "remain"});
            $("#perspective-avail-toggle").html("Include: Remain&nbsp;<i class=\"fa fa-caret-down\"></i>");
            $("#pavail-group").children().css("background-color", "transparent");
            $("#pavail-remain").css("background-color", interfaceUtil.gtc("--background-feature"));
        });

        $("#pord-due-ascend").click(function(e) {
            E.db.modifyPerspective(uid, currentP, {tord: "duas"});
            $("#perspective-order-toggle").html("Order: ascend by due&nbsp;<i class=\"fa fa-caret-down\"></i>");
            $("#pord-group").children().css("background-color", "transparent");
            $("#pord-due-ascend").css("background-color", interfaceUtil.gtc("--background-feature"));
        });

        $("#pord-due-descend").click(function(e) {
            E.db.modifyPerspective(uid, currentP, {tord: "duds"});
            $("#perspective-order-toggle").html("Order: descend by due&nbsp;<i class=\"fa fa-caret-down\"></i>");
            $("#pord-group").children().css("background-color", "transparent");
            $("#pord-due-descend").css("background-color", interfaceUtil.gtc("--background-feature"));
        });

        $("#pord-defer-ascend").click(function(e) {
            E.db.modifyPerspective(uid, currentP, {tord: "deas"});
            $("#perspective-order-toggle").html("Order: ascend by defer&nbsp;<i class=\"fa fa-caret-down\"></i>");
            $("#pord-group").children().css("background-color", "transparent");
            $("#pord-defer-ascend").css("background-color", interfaceUtil.gtc("--background-feature"));
        });

        $("#pord-defer-descend").click(function(e) {
            E.db.modifyPerspective(uid, currentP, {tord: "deds"});
            $("#perspective-order-toggle").html("Order: descend by defer&nbsp;<i class=\"fa fa-caret-down\"></i>");
            $("#pord-group").children().css("background-color", "transparent");
            $("#pord-defer-descend").css("background-color", interfaceUtil.gtc("--background-feature"));
        });

        $("#pord-alpha").click(function(e) {
            E.db.modifyPerspective(uid, currentP, {tord: "alpha"});
            $("#perspective-order-toggle").html("Order: alphabetical&nbsp;<i class=\"fa fa-caret-down\"></i>");
            $("#pord-group").children().css("background-color", "transparent");
            $("#pord-alpha").css("background-color", interfaceUtil.gtc("--background-feature"));
        });

        const edit = function(pspID) {
            $("#repeat-unit").hide();
            currentP = pspID;
            $("#overlay").fadeIn(200).css("display", "flex").hide().fadeIn(200);
            $("#perspective-unit").fadeIn(200);
            $("#perspective-edit-name").val(possiblePerspectives[0][pspID].name);
            $("#pquery").val(possiblePerspectives[0][pspID].query);
            let tord = possiblePerspectives[0][pspID].tord
            let avail = possiblePerspectives[0][pspID].avail
            if (tord && tord !== "") {
                switch (tord) {
                    case "duas":
                        $("#perspective-order-toggle").html("Order: ascend by due&nbsp;<i class=\"fa fa-caret-down\"></i>");
                        $("#pord-group").children().css("background-color", "transparent");
                        $("#pord-due-ascend").css("background-color", interfaceUtil.gtc("--background-feature"));
                        break;
                    case "duds":
                        $("#perspective-order-toggle").html("Order: descend by due&nbsp;<i class=\"fa fa-caret-down\"></i>");
                        $("#pord-group").children().css("background-color", "transparent");
                        $("#pord-due-descend").css("background-color", interfaceUtil.gtc("--background-feature"));
                        break;
                    case "deas":
                        $("#perspective-order-toggle").html("Order: ascend by defer&nbsp;<i class=\"fa fa-caret-down\"></i>");
                        $("#pord-group").children().css("background-color", "transparent");
                        $("#pord-defer-ascend").css("background-color", interfaceUtil.gtc("--background-feature"));
                        break;
                    case "deds":
                        $("#perspective-order-toggle").html("Order: descend by defer&nbsp;<i class=\"fa fa-caret-down\"></i>");
                        $("#pord-group").children().css("background-color", "transparent");
                        $("#pord-defer-descend").css("background-color", interfaceUtil.gtc("--background-feature"));
                        break;
                    case "alpha":
                        $("#perspective-order-toggle").html("Order: alphabetical&nbsp;<i class=\"fa fa-caret-down\"></i>");
                        $("#pord-group").children().css("background-color", "transparent");
                        $("#pord-alpha").css("background-color", interfaceUtil.gtc("--background-feature"));
                        break;
                }
            }
            if (avail && avail !== "") {
                switch (avail) {
                    case "avail":
                        $("#pavail-group").children().css("background-color", "transparent");
                        $("#pavail-avail").css("background-color", interfaceUtil.gtc("--background-feature"));
                        $("#perspective-avail-toggle").html("Include: Available &nbsp;<i class=\"fa fa-caret-down\"></i>");
                        break;
                    case "flagged":
                        $("#pavail-group").children().css("background-color", "transparent");
                        $("#pavail-flagged").css("background-color", interfaceUtil.gtc("--background-feature"));
                        $("#perspective-avail-toggle").html("Include: Flagged&nbsp;<i class=\"fa fa-caret-down\"></i>");
                        break;
                    case "remain":
                        $("#pavail-group").children().css("background-color", "transparent");
                        $("#pavail-remain").css("background-color", interfaceUtil.gtc("--background-feature"));
                        $("#perspective-avail-toggle").html("Include: Remain&nbsp;<i class=\"fa fa-caret-down\"></i>");
                        break;
                }
            }
            // fix weird focus-select bug
            setTimeout(function() {$("#pquery").focus()}, 100);
        };

        return edit;
    }();

    // repeat view
    const showRepeat = function() {

        let tid;
        let repeatWeekDays = [];
        let repeatMonthDays = [];

        // Setup repeat things!
        $("#repeat-back").on("click", function(e) {
            $(".repeat-subunit").slideUp();
            $("#repeat-daterow").children().each(function(e) {
                $(this).css({"background-color": interfaceUtil.gtc("--background-feature")});
            });
            $("#repeat-monthgrid").children().each(function(e) {
                $(this).css({"background-color": interfaceUtil.gtc("--background")});
            });
            $("#repeat-toggle-group").slideDown();
            $("#repeat-type").fadeOut(() => $("#repeat-type").html(""));
            $("#repeat-unit").fadeOut(200);
            $("#overlay").fadeOut(200);
            $("#"+activeMenu).addClass("menuitem-selected");
            let repeatWeekDays = [];
            let repeatMonthDays = [];
        });


        $(document).on("click", "#overlay", function(e) {
            if (e.target === this) {
                $(".repeat-subunit").slideUp();
                $("#repeat-toggle-group").slideDown();
                $("#repeat-type").fadeOut(() => $("#repeat-type").html(""));
                $("#repeat-unit").fadeOut(200);
                $("#overlay").fadeOut(200, () => reloadPage(true));
                $("#"+activeMenu).addClass("menuitem-selected");
                $("#repeat-daterow").children().each(function(e) {
                    $(this).css({"background-color": interfaceUtil.gtc("--background-feature")});
                });
                $("#repeat-monthgrid").children().each(function(e) {
                    $(this).css({"background-color": interfaceUtil.gtc("--background")});
                });
                let repeatWeekDays = [];
                let repeatMonthDays = [];
            }
        });

        $("#repeat-type").on("click", function(e) {
            $(".repeat-subunit").slideUp();
            $("#repeat-toggle-group").slideDown();
            $("#repeat-type").fadeOut(() => $("#repeat-type").html(""));
            E.db.modifyTask(uid, tid, {repeat: {rule: "none"}});
        });

        $("#repeat-perday").on("click", function(e) {
            $("#repeat-toggle-group").slideUp();
            $("#repeat-type").html("every day.");
            $("#repeat-type").fadeIn();
            E.db.modifyTask(uid, tid, {repeat: {rule: "daily"}});
        });

        $("#repeat-perweek").on("click", function(e) {
            $("#repeat-weekly-unit").slideDown();
            $("#repeat-toggle-group").slideUp();
            $("#repeat-type").html("every week.");
            $("#repeat-type").fadeIn();
        });

        $("#repeat-permonth").on("click", function(e) {
            $("#repeat-monthly-unit").slideDown();
            $("#repeat-toggle-group").slideUp();
            $("#repeat-type").html("every month.");
            $("#repeat-type").fadeIn();
        });

        $("#repeat-peryear").on("click", function(e) {
            $("#repeat-toggle-group").slideUp();
            $("#repeat-type").html("every year.");
            $("#repeat-type").fadeIn();
            E.db.modifyTask(uid, tid, {repeat: {rule: "yearly"}});
        });

        // Actions
        $(".repeat-daterow-weekname").on("click", function(e) {
            if (repeatWeekDays.includes($(this).html())) {
                $(this).animate({"background-color": interfaceUtil.gtc("--background-feature")});
                repeatWeekDays = repeatWeekDays.filter(i => i !== $(this).html());
                E.db.modifyTask(uid, tid, {repeat: {rule: "weekly", on: repeatWeekDays}});
            } else {
                $(this).animate({"background-color": interfaceUtil.gtc("--decorative-light")});
                repeatWeekDays.push($(this).html());
                E.db.modifyTask(uid, tid, {repeat: {rule: "weekly", on: repeatWeekDays}});
            }
        });

        
        $(".repeat-monthgrid-day").on("click", function(e) {
            if (repeatMonthDays.includes($(this).html())) {
                $(this).animate({"background-color": interfaceUtil.gtc("--background")}, 100);
                repeatMonthDays = repeatMonthDays.filter(i => i !== $(this).html());
                E.db.modifyTask(uid, tid, {repeat: {rule: "monthly", on: repeatMonthDays}});
            } else {
                $(this).animate({"background-color": interfaceUtil.gtc("--background-feature")}, 100);
                repeatMonthDays.push($(this).html());
                E.db.modifyTask(uid, tid, {repeat: {rule: "monthly", on: repeatMonthDays}});
            }
        });

        let cr = async function(taskId) {
            $(".repeat-subunit").hide();
            $("#repeat-toggle-group").show();
            $("#repeat-type").fadeOut(() => $("#repeat-type").html(""));
            $("#perspective-unit").hide();
            $("#overlay").fadeIn(200).css("display", "flex").hide().fadeIn(200);
            $("#repeat-unit").fadeIn(200);
            let ti = await E.db.getTaskInformation(uid, taskId);
            $("#repeat-task-name").html(ti.name);
            tid = taskId;
            if (ti.repeat.rule !== "none") {
                if (ti.repeat.rule === "daily") {
                    $("#repeat-toggle-group").hide();
                    $("#repeat-type").html("every day.");
                    $("#repeat-type").show();
                } else if (ti.repeat.rule === "weekly") {
                    $("#repeat-daterow").children().each(function(e) {
                        if (ti.repeat.on.includes($(this).html())) {
                            $(this).animate({"background-color": interfaceUtil.gtc("--decorative-light")});
                        }
                    });
                    repeatWeekDays = ti.repeat.on;
                    $("#repeat-weekly-unit").show();
                    $("#repeat-toggle-group").hide();
                    $("#repeat-type").html("every week.");
                    $("#repeat-type").show();
                } else if (ti.repeat.rule === "monthly") {
                    $("#repeat-monthgrid").children().each(function(e) {
                        if (ti.repeat.on.includes($(this).html())) {
                            $(this).animate({"background-color": interfaceUtil.gtc("--background-feature")});
                        }
                    });
                    repeatMonthDays = ti.repeat.on;
                    $("#repeat-monthly-unit").show();
                    $("#repeat-toggle-group").hide();
                    $("#repeat-type").html("every month.");
                    $("#repeat-type").show();
                } else if (ti.repeat.rule === "yearly") {
                    $("#repeat-toggle-group").hide();
                    $("#repeat-type").html("every year.");
                    $("#repeat-type").show();
                }
            }
        };
        return cr;
    }();

        // the public refresh function

    let activeTask = null; // TODO: shouldn't this be undefined?
    let activeTaskDeInboxed = false;
    let activeTaskDeDsed = false;
    let activeTaskInboxed = false;


    // task methods!
    let taskManager = function() {
        //displayTask("inbox", task)

        let hideActiveTask = async function() {
            $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0"});
            $("#task-edit-"+activeTask).slideUp(300);
            $("#task-trash-"+activeTask).css("display", "none");
            $("#task-repeat-"+activeTask).css("display", "none");
            $("#task-"+activeTask).animate({"background-color": interfaceUtil.gtc("--background"), "padding": "0", "margin":"0"}, 100);
            $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0", "box-shadow": "0 0 0"});
            await refresh();
            if (activeTaskDeInboxed) {
                let hTask = activeTask;
                iC = inboxandDS[0].length;
                if (iC === 0) {
                    $("#inbox-subhead").slideUp(300);
                    $("#inbox").slideUp(300);
                } else {
                    $("#unsorted-badge").html(''+iC);
                    if (activeMenu==="today") {
                        $('#task-'+hTask).slideUp(200);
                    }
                }
            } else if (activeTaskDeDsed) {
                let hTask = activeTask;
                dsC = inboxandDS[1].length;
                if (dsC === 0) {
                    $("#ds-subhead").slideUp(300);
                    $("#due-soon").slideUp(300);
                } else {
                    $("#duesoon-badge").html(''+dsC);
                    if (activeMenu==="today" && $($('#task-' + hTask).parent()).attr('id') !== "inbox") {
                        $('#task-'+hTask).slideUp(200);
                    }
                }
            }

            if (activeTaskInboxed) {
                let hTask = activeTask;
                iC = inboxandDS[0].length;
                dsC = inboxandDS[1].length;
                $("#unsorted-badge").html('' + iC);
                $("#duesoon-badge").html('' + dsC);
                if (activeMenu==="today") {
                    $('#task-'+hTask).appendTo("#inbox");
                }
            }

            activeTaskDeInboxed = false;
            activeTaskDeDsed = false;
            activeTaskInboxed = false;
            activeTask = null;

            // that actually waits for the finishing of all animations...
            // JANKY!
         /*   setTimeout(function() {*/
                //if (!isTaskActive) loadView(currentPage)
            /*}, 500);*/
            sorters.project.option("disabled", false);
            sorters.inbox.option("disabled", false);
            reloadPage();
        };


        let displayTask = async function(pageId, taskId, sequentialOverride) {
            // Part 0: data gathering!
            // Get the task
            let taskObj = await E.db.getTaskInformation(uid, taskId);

            // Get info about the task
            let projectID = taskObj.project;
            let tagIDs = taskObj.tags;
            let isFlagged = taskObj.isFlagged;
            let isFloating = taskObj.isFloating;
            let name = taskObj.name;
            let desc = taskObj.desc;
            let timezone = taskObj.timezone;
            let repeat = taskObj.repeat;
            let defer;
            let due;
            if (taskObj.defer) {
                defer = new Date(taskObj.defer.seconds*1000);
            }
            if (taskObj.due) {
                due = new Date(taskObj.due.seconds*1000);
            }
            // -------------------------------------------------------------------------------
            // Part 1: data parsing!
            // The Project
            let project = possibleProjects[projectID];
            
            // Project select options
            let projectSelects = " ";
            let buildSelectString = function(p, level) {
                if (!level) {
                    level = ""
                }
                pss = "<option>" + level + possibleProjects[p.id] + "</option>";
                if (p.children) {
                    for (let e of p.children) {
                        if (e.type === "project") {
                            pss = pss + buildSelectString(e.content, level+"&nbsp;&nbsp;");
                        }
                    }
                }
                return pss;
            };
            for (let proj of projectDB) {
                projectSelects = projectSelects + buildSelectString(proj);
            }
            // Tag select options
            let possibleTagNames = function() {
                let res = [];
                for (let key in possibleTags) {
                    res.push(possibleTags[key]);
                }
                return res;
            }();
            // Actual tag string
            let tagString = "";
            for (let i in tagIDs) {
                tagString = tagString + possibleTags[tagIDs[i]] + ",";
            }
            // Calculate due date
            let defer_current;
            let due_current;
            if(isFloating) {
                if (defer) {
                    defer_current = moment(defer).tz(timezone).local(true).toDate();
                } else {
                    defer_current = undefined;
                }
                if (due) {
                    due_current = moment(due).tz(timezone).local(true).toDate();
                } else {
                    due_current = undefined;
                }
            } else {
                defer_current = defer;
                due_current = due;
            }
            // The color of the carrot
            let rightCarrotColor = interfaceUtil.gtc("--decorative-light");
            // -------------------------------------------------------------------------------
            // Part 2: the task!
            $("#" + pageId).append(interfaceUtil.taskHTML(taskId, name, desc, projectSelects, rightCarrotColor));
            // -------------------------------------------------------------------------------
            // Part 3: customize the task!
            // Set the dates, aaaand set the date change trigger
            $("#task-defer-" + taskId).datetimepicker({
                timeInput: true,
                timeFormat: "hh:mm tt",
                showHour: false,
                showMinute: false,
                onSelect: function(e) {
                    let defer_set = $(this).datetimepicker('getDate');
                    let tz = moment.tz.guess();
                    if (new Date() < defer_set) {
                        $('#task-name-' + taskId).css("opacity", "0.3");
                    } else {
                        $('#task-name-' + taskId).css("opacity", "1");
                    }
                    E.db.modifyTask(uid, taskId, {defer:defer_set, timezone:tz});
                    defer = defer_set;
                }
            });
            $("#task-defer-" + taskId).change(function(e) {
                e.preventDefault();
            });
            let dfstr = "";
            $("#task-defer-" + taskId).keydown(function(e) {
                //e.preventDefault();
                // TODO: this is a janky manual re-implimentation 
                // of a textbox to override jQuery's manual 
                // re-implimentation. The todo is to make it less
                // janky.
                if (e.keyCode >= 37 && e.keyCode <= 40) {
                    // handle arrows
                } else if (e.keyCode == 13) {
                    e.preventDefault();
                    if (dfstr === "") {
                        $("#task-defer-" + taskId).val("");
                        E.db.removeParamFromTask(uid, taskId, "defer");
                        defer = undefined;
                        defer_current = undefined;
                    } else {
                        let parsed = interfaceUtil.spf(dfstr);
                        if (parsed) {
                            defer_set = parsed.start.date();
                            $("#task-defer-" + taskId).datetimepicker("setDate", defer_set);
                            let tz = moment.tz.guess();
                            if (new Date() < defer_set) {
                                $('#task-name-' + taskId).css("opacity", "0.3");
                            } else {
                                $('#task-name-' + taskId).css("opacity", "1");
                            }
                            E.db.modifyTask(uid, taskId, {defer:defer_set, timezone:tz});
                            defer = defer_set;
                        }
                    }
                } else if (e.keyCode == 8) {
                    if (document.getSelection().toString() === this.value) {
                        dfstr = "";
                    } else {
                        dfstr = dfstr.substring(0, dfstr.length-1);
                    }
                } else if (e.key.length == 1) {
                    // handle actual key
                    if (document.getSelection().toString() === this.value) {
                        e.preventDefault();
                        $(this).val(e.key);
                    } else if (!e.metaKey) {
                        e.preventDefault();
                        $(this).val(this.value+e.key);
                        dfstr = this.value;
                    }
                }
            });
            $("#task-due-" + taskId).datetimepicker({
                timeInput: true,
                timeFormat: "hh:mm tt",
                showHour: false,
                showMinute: false,
                onSelect: function(e) {
                    let due_set = $(this).datetimepicker('getDate');
                    let tz = moment.tz.guess();
                    if (new Date() > due_set) {
                        $('#task-pseudocheck-' + taskId).addClass("od");
                        $('#task-pseudocheck-' + taskId).removeClass("ds");
                    } else if (interfaceUtil.daysBetween(new Date(), due_set) <= 1) {
                        $('#task-pseudocheck-' + taskId).addClass("ds");
                        $('#task-pseudocheck-' + taskId).removeClass("od");
                    } else {
                        if ($('#task-pseudocheck-' + taskId).hasClass("ds") || $('#task-pseudocheck-' + taskId).hasClass("od")) {
                            activeTaskDeDsed = true;
                        }
                        $('#task-pseudocheck-' + taskId).removeClass("od");
                        $('#task-pseudocheck-' + taskId).removeClass("ds");
                    }
                    E.db.modifyTask(uid, taskId, {due:due_set, timezone:tz});
                    due = due_set;
                }
            });
            $("#task-due-" + taskId).change(function(e) {
                e.preventDefault();
            });
            let duestr = "";
            $("#task-due-" + taskId).keydown(function(e) {
                //e.preventDefault();
                // TODO: this is a janky manual re-implimentation 
                // of a textbox to override jQuery's manual 
                // re-implimentation. The todo is to make it less
                // janky.
                if (e.keyCode >= 37 && e.keyCode <= 40) {
                    // handle arrows
                } else if (e.keyCode == 13) {
                    e.preventDefault();
                    if (duestr === "") {
                        if ($('#task-pseudocheck-' + taskId).hasClass("ds") || $('#task-pseudocheck-' + taskId).hasClass("od")) {
                            activeTaskDeDsed = true;
                        }
                        $("#task-due-" + taskId).val("");
                        E.db.removeParamFromTask(uid, taskId, "due");
                        $('#task-pseudocheck-' + taskId).removeClass("od");
                        $('#task-pseudocheck-' + taskId).removeClass("ds");
                        due = undefined;
                        due_current = undefined;
                    } else {
                        let parsed = interfaceUtil.spf(duestr);
                        if (parsed) {
                            due_set = parsed.start.date();
                            $("#task-due-" + taskId).datetimepicker("setDate", due_set);
                            let tz = moment.tz.guess();
                            if (new Date() > due_set) {
                                $('#task-pseudocheck-' + taskId).addClass("od");
                                $('#task-pseudocheck-' + taskId).removeClass("ds");
                            } else if (interfaceUtil.daysBetween(new Date(), due_set) <= 1) {
                                $('#task-pseudocheck-' + taskId).addClass("ds");
                                $('#task-pseudocheck-' + taskId).removeClass("od");
                            } else {
                                if ($('#task-pseudocheck-' + taskId).hasClass("ds") || $('#task-pseudocheck-' + taskId).hasClass("od")) {
                                    activeTaskDeDsed = true;
                                }
                                $('#task-pseudocheck-' + taskId).removeClass("od");
                                $('#task-pseudocheck-' + taskId).removeClass("ds");
                            }
                            E.db.modifyTask(uid, taskId, {due:due_set, timezone:tz});
                            due = due_set;
                        }
                    }
                } else if (e.keyCode == 8) {
                    if (document.getSelection().toString() === this.value) {
                        duestr = "";

                    } else {
                        duestr = duestr.substring(0, duestr.length-1);
                    }
                } else if (e.key.length == 1) {
                    // handle actual key
                    if (document.getSelection().toString() === this.value) {
                        e.preventDefault();
                        $(this).val(e.key);
                    } else if (!e.metaKey) {
                        e.preventDefault();
                        $(this).val(this.value+e.key);
                        duestr = this.value;
                    }
                }
            });
            // So apparently setting dates is hard for this guy, so we run this async
            let setDates = async () => {
                if (defer_current) {
                    $("#task-defer-" + taskId).datetimepicker('setDate', (defer_current));
                }
                if (due_current) {
                    $("#task-due-" + taskId).datetimepicker('setDate', (due_current));
                }
            };
            setDates();
            // Set tags!
            $('#task-tag-' + taskId).val(tagString);
            $('#task-tag-' + taskId).tagsinput({
                typeaheadjs: {
                    name: 'tags',
                    source: interfaceUtil.sMatch(possibleTagNames)
                }
            });
            // Set project!
            $('#task-project-' + taskId).editableSelect({
                effects: 'fade',
                duration: 200,
                appendTo: 'body',
            }).on('select.editable-select', async function (e, li) {
                let projectSelected = li.text().trim();
                let projId = possibleProjectsRev[projectSelected];
                if (project === undefined) {
                    activeTaskDeInboxed = true;
                } else {
                    await E.db.dissociateTask(uid, taskId, projectID);
                }
                E.db.modifyTask(uid, taskId, {project:projId});
                projectID = projId;
                project = projectSelected;
                $('#task-project-' + taskId).val(project);
                await E.db.associateTask(uid, taskId, projId);
            });
            $('#task-project-' + taskId).val(project);
            // Set overdue style!
            if (due_current) {
                if (new Date() > due_current) {
                    $('#task-pseudocheck-' + taskId).addClass("od");
                } else if (interfaceUtil.daysBetween(new Date(), due_current) <= 1) {
                    $('#task-pseudocheck-' + taskId).addClass("ds");
                }
            }
            if (defer_current) {
                if (new Date() < defer_current) {
                    $('#task-name-' + taskId).css("opacity", "0.3");
                }
            }
            // Set avaliable Style
            if (!avalibility[taskId] && !sequentialOverride) {
                $('#task-name-' + taskId).css("opacity", "0.3");
            }
            // Set flagged style
            if (isFlagged) {
                $("#task-flagged-yes-"+taskId).button("toggle")
            } else {
                $("#task-flagged-no-"+taskId).button("toggle")
            }
            // Set floating style
            if (isFloating) {
                $("#task-floating-yes-"+taskId).button("toggle")
            } else {
                $("#task-floating-no-"+taskId).button("toggle")
            }
            // -------------------------------------------------------------------------------
            // Part 4: task action behaviors!
            // Task complete
            $('#task-check-'+taskId).change(function(e) {
                if (this.checked) {
                    taskManager.hideActiveTask();
                    $('#task-name-' + taskId).css("color", interfaceUtil.gtc("--task-checkbox"));
                    $('#task-name-' + taskId).css("text-decoration", "line-through");
                    $('#task-pseudocheck-' + taskId).css("opacity", "0.6");
                    $('#task-' + taskId).animate({"margin": "5px 0 5px 0"}, 200);
                    $('#task-' + taskId).slideUp(300);
                    E.db.completeTask(uid, taskId).then(function(e) {
                        if (project === undefined) {
                             E.db.getInboxTasks(uid).then(function(e){
                                iC = e.length;
                                if (iC === 0) {
                                    $("#inbox-subhead").slideUp(300);
                                    $("#inbox").slideUp(300);
                                } else {
                                    $("#unsorted-badge").html(''+iC);
                                }
                            });
                        }
                        //console.error(err);
                    });
                    if (repeat.rule !== "none" && due) {
                        let rRule = repeat.rule;
                        if (rRule === "daily") {
                            if (defer) {
                                let defDistance = due-defer;
                                due.setDate(due.getDate() + 1);
                                E.db.modifyTask(uid, taskId, {isComplete: false, due:due, defer:(due-defDistance)});
                            } else {
                                due.setDate(due.getDate() + 1);
                                E.db.modifyTask(uid, taskId, {isComplete: false, due:due});
                            }

                        } else if (rRule === "weekly") {
                            if (defer) {
                                let rOn = repeat.on;
                                let current = "";
                                let defDistance = due-defer;
                                while (!rOn.includes(current)) {
                                    due.setDate(due.getDate() + 1);
                                    let dow = due.getDay();
                                    switch (dow) {
                                        case 1:
                                            current = "M";
                                            break;
                                        case 2:
                                            current = "Tu";
                                            break;
                                        case 3:
                                            current = "W";
                                            break;
                                        case 4:
                                            current = "Th";
                                            break;
                                        case 5:
                                            current = "F";
                                            break;
                                        case 6:
                                            current = "Sa";
                                            break;
                                        case 7:
                                            current = "Su";
                                            break;
                                    }
                                }
                                E.db.modifyTask(uid, taskId, {isComplete: false, due:due, defer:(due-defDistance)});
                            } else {
                                let rOn = repeat.on;
                                let current = "";
                                while (!rOn.includes(current)) {
                                    due.setDate(due.getDate() + 1);
                                    let dow = due.getDay();
                                    switch (dow) {
                                        case 1:
                                            current = "M";
                                            break;
                                        case 2:
                                            current = "Tu";
                                            break;
                                        case 3:
                                            current = "W";
                                            break;
                                        case 4:
                                            current = "Th";
                                            break;
                                        case 5:
                                            current = "F";
                                            break;
                                        case 6:
                                            current = "Sa";
                                            break;
                                        case 7:
                                            current = "Su";
                                            break;
                                    }
                                }
                                E.db.modifyTask(uid, taskId, {isComplete: false, due:due});
                            }
                        } else if (rRule === "monthly") {
                            if (defer) {
                                let rOn = repeat.on;
                                let dow = due.getDate();
                                let oDow = due.getDate();
                                let defDistance = due-defer;
                                while ((!rOn.includes(dow.toString()) && !(rOn.includes("Last") && (new Date(due.getFullYear(), due.getMonth(), due.getDate()).getDate() === new Date(due.getFullYear(), due.getMonth()+1, 0).getDate()))) || (oDow === dow)) {
                                    due.setDate(due.getDate() + 1);
                                    dow = due.getDate();
                                }
                            } else {
                                let rOn = repeat.on;
                                let dow = due.getDate();
                                let oDow = due.getDate();
                                while ((!rOn.includes(dow.toString()) && !(rOn.includes("Last") && (new Date(due.getFullYear(), due.getMonth(), due.getDate()).getDate() === new Date(due.getFullYear(), due.getMonth()+1, 0).getDate()))) || (oDow === dow)) {
                                    due.setDate(due.getDate() + 1);
                                    dow = due.getDate();
                                }
                                E.db.modifyTask(uid, taskId, {isComplete: false, due:due});
                            }
                        } else if (rRule === "yearly") {
                            if (defer) {
                                let defDistance = due-defer;
                                due.setFullYear(due.getFullYear() + 1);
                                E.db.modifyTask(uid, taskId, {isComplete: false, due:due, defer:(due-defDistance)});
                            } else {
                                due.setFullYear(due.getFullYear() + 1);
                                E.db.modifyTask(uid, taskId, {isComplete: false, due:due});
                            }

                        }
                    }
                    reloadPage();
                }
            });

            // Task project change
             $('#task-project-' + taskId).change(async function(e) {
                if (this.value in possibleProjectsRev) {
                    let projId = possibleProjectsRev[this.value];
                    if (project === undefined){
                        activeTaskDeInboxed = true;
                    } else {
                        await E.db.dissociateTask(uid, taskId, projectID);
                    }
                    E.db.modifyTask(uid, taskId, {project:projId});
                    await E.db.associateTask(uid, taskId, projId);
                    projectID = projId;
                    project = this.value;
                } else {
                    E.db.modifyTask(uid, taskId, {project:""});
                    this.value = ""
                    if (project !== undefined) {
                        activeTaskInboxed = true;
                        await E.db.dissociateTask(uid, taskId, projectID);
                    }
                    project = undefined;
                    projectID = "";
                }
            });

            // Trashing a task
            $("#task-trash-" + taskId).click(function(e) {
                if (project === undefined) activeTaskDeInboxed = true;
                E.db.deleteTask(uid, taskId).then(function() {
                    hideActiveTask();
                    $('#task-' + taskId).slideUp(150);
                });
            });

            // Repeat popover
            $("#task-repeat-" + taskId).click(function(e) {
                showRepeat(taskId);
            });

            // Task name change
            $("#task-name-" + taskId).change(function(e) {
                E.db.modifyTask(uid, taskId, {name:this.value});
            });

            // Task discription change
            $("#task-desc-" + taskId).change(function(e) {
                E.db.modifyTask(uid, taskId, {desc:this.value});
            });

            // Task tag remove
            $('#task-tag-' + taskId).on('itemRemoved', function(e) {
                let removedTag = possibleTagsRev[e.item];
                tagIDs = tagIDs.filter(item => item !== removedTag);
                E.db.modifyTask(uid, taskId, {tags:tagIDs});
            });

            // Task tag add
            $('#task-tag-' + taskId).on('itemAdded', function(e) {
                let addedTag = possibleTagsRev[e.item];
                if (!addedTag){
                    E.db.newTag(uid, e.item).then(function(addedTag) {
                        tagIDs.push(addedTag);
                        possibleTags[addedTag] = e.item;
                        possibleTags[e.item] = addedTag;
                        E.db.modifyTask(uid, taskId, {tags:tagIDs});
                    });
                } else if (!(addedTag in tagIDs)){
                    tagIDs.push(addedTag);
                    E.db.modifyTask(uid, taskId, {tags:tagIDs});
                }
            });

            // Remove flagged parameter
            $("#task-flagged-no-" + taskId).change(function(e) {
                isFlagged = false;
                E.db.modifyTask(uid, taskId, {isFlagged: false});
               // TODO: Unflagged Style? So far flagged is
               // just another filter for perspective selection
            });

            // Add flagged parameter
            $("#task-flagged-yes-" + taskId).change(function(e) {
                isFlagged = true;
                E.db.modifyTask(uid, taskId, {isFlagged: true});
               // TODO: Flagged Style?
            });

            // Remove floating parameter and calculate dates
            $("#task-floating-no-" + taskId).change(function(e) {
                isFloating = false;
                E.db.modifyTask(uid, taskId, {isFloating: false});
                defer_current = defer;
                due_current = due;
                setDates();
            });

            // Add floating parameter and calculate dates
            $("#task-floating-yes-" + taskId).change(function(e) {
                isFloating = true;
                E.db.modifyTask(uid, taskId, {isFloating: true});
                defer_current = moment(defer).tz(timezone).local(true).toDate();
                due_current = moment(due).tz(timezone).local(true).toDate();
                setDates();
            });

        };

        return {generateTaskInterface: displayTask, hideActiveTask: hideActiveTask};
    }();

    // sorters
    let sorters = function() {

        // inbox sorter
        let inboxSort = new interfaceUtil.Sortable($("#inbox")[0], {
            animation: 200,
            swapThreshold: 0.20,
            onEnd: function(e) {
                let oi = e.oldIndex;
                let ni = e.newIndex;
                refresh().then(function() {
                    if (oi<ni) {
                        // handle task moved down
                        for(let i=oi+1; i<=ni; i++) {
                            // move each task down in order
                            E.db.modifyTask(uid, inboxandDS[0][i], {order: i-1});
                        }
                        // change the order of the moved task
                        E.db.modifyTask(uid, inboxandDS[0][oi], {order: ni});
                    } else if (oi>ni) {
                        // handle task moved up
                        for(let i=oi-1; i>=ni; i--) {
                            // move each task up in order
                            E.db.modifyTask(uid, inboxandDS[0][i], {order: i+1});
                        }
                        // change the order of the moved task
                        E.db.modifyTask(uid, inboxandDS[0][oi], {order: ni});
                    }

                });
                reloadPage();
            }
        });

        // project sorter
        let projectSort = new interfaceUtil.Sortable($("#project-content")[0], {
            animation: 200,
            swapThreshold: 0.20,
            onEnd: function(e) {
                let oi = e.oldIndex;
                let ni = e.newIndex;

                E.db.getProjectStructure(uid, pageIndex.pageContentID).then(async function(nstruct) {
                    if (oi<ni) {
                        // handle item moved down
                        for(let i=oi+1; i<=ni; i++) {
                            let child = nstruct.children[i];
                            // move the item down
                            if (child.type === "task") {
                                let id = child.content;
                                E.db.modifyTask(uid, id, {order: i-1});
                            } else if (child.type === "project") {
                                let id = child.content.id;
                                E.db.modifyProject(uid, id, {order: i-1});
                            }
                        }
                        // change the order of the moved item
                        let moved = nstruct.children[oi];
                        if (moved.type === "task") {
                            let id = moved.content;
                            E.db.modifyTask(uid, id, {order: ni});
                        } else if (moved.type === "project") {
                            let id = moved.content.id;
                            E.db.modifyProject(uid, id, {order: ni});
                        }
                    } else if (oi>ni) {
                        // handle item moved up
                        for(let i=oi-1; i>=ni; i--) {
                            let child = nstruct.children[i];
                            // move the item up
                            if (child.type === "task") {
                                let id = child.content;
                                E.db.modifyTask(uid, id, {order: i+1});
                            } else if (child.type === "project") {
                                let id = child.content.id;
                                E.db.modifyProject(uid, id, {order: i+1});
                            }
                        }
                        // change the order of the moved item
                        let moved = nstruct.children[oi];
                        if (moved.type === "task") {
                            let id = moved.content;
                            E.db.modifyTask(uid, id, {order: ni});
                        } else if (moved.type === "project") {
                            let id = moved.content.id;
                            E.db.modifyProject(uid, id, {order: ni});
                        }
                    }
                });
                reloadPage(true);
            }
        });


        var perspectiveSort = new interfaceUtil.Sortable($(".perspectives")[0], {
            animation: 200,
            onStart: function(e) {
                // Make sure that elements don't think that they are being hovered
                // when they are being dragged over
                let itemEl = $(e.item);
                $('.perspectives').children().each(function() {
                    if ($(this) !== itemEl) {
                        $(this).removeClass("mihov")
                    }
                })
            },
            onEnd: function(e) {
                let oi = e.oldIndex;
                let ni = e.newIndex;
                E.db.getPerspectives(uid).then(function(topLevelItems) {
                    let originalIBT = topLevelItems[2].map(i => i.id);
                    if (oi<ni) {
                        // Handle task moved down
                        for(let i=oi+1; i<=ni; i++) {
                            E.db.modifyPerspective(uid, originalIBT[i], {order: i-1});
                        }
                        E.db.modifyPerspective(uid, originalIBT[oi], {order: ni});
                    } else if (oi>ni) {
                        // Handle task moved up
                        for(let i=oi-1; i>=ni; i--) {
                            E.db.modifyPerspective(uid, originalIBT[i], {order: i+1});
                        }
                        E.db.modifyPerspective(uid, originalIBT[oi], {order: ni});
                    }
                });
                $('.perspectives').children().addClass("mihov");
            }

        });

        // NW: top level project sorter
        let topLevelProjectSort = new interfaceUtil.Sortable($(".projects")[0], {
            animation: 200,
            onStart: function(e) {
                // Make sure that elements don't think that they are being hovered
                // when they are being dragged over
                let itemEl = $(e.item);
                $('.projects').children().each(function() {
                    if ($(this) !== itemEl) {
                        $(this).removeClass("mihov")
                    }
                })
            },
             onEnd: function(e) {
                let oi = e.oldIndex;
                let ni = e.newIndex;
                E.db.getTopLevelProjects(uid).then(function(topLevelItems) {
                    let originalIBT = topLevelItems[2].map(i => i.id);
                    if (oi<ni) {
                        // Handle task moved down
                        for(let i=oi+1; i<=ni; i++) {
                            E.db.modifyProject(uid, originalIBT[i], {order: i-1});
                        }
                        E.db.modifyProject(uid, originalIBT[oi], {order: ni});
                    } else if (oi>ni) {
                        // Handle task moved up
                        for(let i=oi-1; i>=ni; i--) {
                            E.db.modifyProject(uid, originalIBT[i], {order: i+1});
                        }
                        E.db.modifyProject(uid, originalIBT[oi], {order: ni});
                    }


                });
                $('.projects').children().addClass("mihov");
            }
        });

        return {inbox: inboxSort, project: projectSort, menuProject: topLevelProjectSort, menuPerspective: perspectiveSort};
    }();

    // various sub-page loaders
    let viewLoader = function() {
        // this private function populates the view requested

        // upcoming view loader
        let upcoming = async function() {
            $("#greeting-date").html((new Date().toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })));
            $("#greeting").html(greeting);
            $("#greeting-name").html(displayName);

            Promise.all(
                // load inbox tasks
                inboxandDS[0].map(task => taskManager.generateTaskInterface("inbox", task)),
                // load due soon tasks
                inboxandDS[1].map(task => taskManager.generateTaskInterface("due-soon", task))
            ).then(function() {
                // update upcoming view headers
                if (inboxandDS[0].length === 0) {
                    $("#inbox-subhead").hide();
                    $("#inbox").hide();
                } else {
                    $("#inbox-subhead").show();
                    $("#inbox").show();
                    $("#unsorted-badge").html('' + inboxandDS[0].length);
                }
                if (inboxandDS[1].length === 0) {
                    $("#ds-subhead").hide();
                    $("#due-soon").hide();
                } else {
                    $("#ds-subhead").show();
                    $("#due-soon").show();
                    $("#duesoon-badge").html('' + inboxandDS[1].length);
                }
            });
        }

        // perspective view loader
        let perspective = async function(pid) {
            pageIndex.pageContentID = pid;
            // get name
            let perspectiveObject = possiblePerspectives[0][pid];
            // set value
            $("#perspective-title").val(perspectiveObject.name);
            // calculate perspective
            E.perspective.calc(uid, perspectiveObject.query, perspectiveObject.avail, perspectiveObject.tord).then(async function(tids) {
                for (let taskId of tids) {
                    // Nononono don't even think about foreach 
                    // othewise the order will be messed up
                    await taskManager.generateTaskInterface("perspective-content", taskId);
                }
            });
        }

        // project view loader
        let project = async function(pid) {
            // update pid
            pageIndex.pageContentID = pid;
            // get the datum
            let projectName = pPandT[0][0][pid];
            // update the titlefield
            $("#project-title").val(projectName);
            if (pageIndex.projectDir.length <= 1) {
                $("#project-back").hide()
            } else {
                $("#project-back").show()
            }
            // get the project structure, and load the content
            E.db.getProjectStructure(uid, pid).then(async function(struct) {
                for (let item of struct.children) {
                    if (item.type === "task") {
                        // get and load the task
                        let taskId = item.content;
                        await taskManager.generateTaskInterface("project-content", taskId);
                    } else if (item.type === "project") {
                        // get and load a project
                        let projID = item.content.id;
                        let projName = possibleProjects[projID];
                        $("#project-content").append(`<div id="project-${projID}" class="menuitem project subproject sbpro"><i class="far fa-arrow-alt-circle-right subproject-icon"></i><t style="padding-left:18px">${projName}</t></div>`);
                        if (!avalibility[projID]) {
                            $("#project-"+projID).css("opacity", "0.3");
                        }
                    }
                }
                if (struct.is_sequential) {
                    $("#project-sequential-yes").button("toggle")
                } else {
                    $("#project-sequential-no").button("toggle")
                }
            });
        };

        return {upcoming: upcoming, project: project, perspective: perspective};
    }();

    /**
     * async function load
     * load a view!
     *
     * @param viewName: well, which view?
     * @param itemID: if project/perspective, supply str ID
     * @returns {undefined}
     */
    let loadView = async function(viewName, itemID) {
        // hide other views
        $("#content-area").children().each(function() {
            if ($(this).attr("id") != viewName) {
                $(this).css("display", "none");
            }
        });

        // clear all contentboxes
        $("#inbox").empty();
        $("#due-soon").empty();
        $("#project-content").empty();
        $("#perspective-content").empty();

        // refresh data
        await refresh();

        pageIndex.pageLocks = [];
        // load the dang view
        switch(viewName) {

            case 'upcoming-page':
                viewLoader.upcoming();
                break;
            case 'perspective-page':
                viewLoader.perspective(itemID);
                break;
            case 'project-page':
                viewLoader.project(itemID);
                break;
        }

        // bring it!
        $("#"+viewName).show();

        // tell everyone to bring it!
        pageIndex.currentView = viewName;

    };

    // document action listeners!!
    $(document).on('click', '.menuitem', function(e) {
        $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
        activeMenu = $(this).attr('id');
        if (activeMenu.includes("perspective")) {
            loadView("perspective-page", activeMenu.split("-")[1]);
            $("#"+activeMenu).addClass("menuitem-selected");
        } else if (activeMenu.includes("perspective")) {
            $("#"+activeMenu).addClass("menuitem-selected");
            loadView("perspective-page", activeMenu.split("-")[1]);
        } else if (activeMenu.includes("project")) {
            if (!$(this).hasClass("subproject")) {
                pageIndex.projectDir = [];
            }
            $("#"+activeMenu).addClass("menuitem-selected");
            pageIndex.projectDir.push(activeMenu);
            loadView("project-page", activeMenu.split("-")[1]);
        }
    });

    $(document).on('click', '.today', function(e) {
        $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
        loadView("upcoming-page");
        activeMenu = $(this).attr('id');
        $("#"+activeMenu).addClass("today-highlighted");
    });

    $(document).on("click", ".task", async function(e) {
        if ($(this).attr('id') === "task-" + activeTask) {
            e.stopImmediatePropagation();
            return;
        }
        if (activeTask) await taskManager.hideActiveTask();
        if ($(e.target).hasClass('task-pseudocheck') || $(e.target).hasClass('task-check')) {
            e.stopImmediatePropagation();
            return;
        } else {
            let taskInfo = $(this).attr("id").split("-");
            let task = taskInfo[taskInfo.length - 1];
            activeTask = task;
            $("#task-" + task).animate({"background-color": interfaceUtil.gtc("--task-feature"), "padding": "10px", "margin": "15px 0 30px 0"}, 300);
            $("#task-edit-" + activeTask).slideDown(200);
            $("#task-trash-" + activeTask).css("display", "block");
            $("#task-repeat-" + activeTask).css("display", "block");
            $("#task-" + task).css({"box-shadow": "1px 1px 5px "+ interfaceUtil.gtc("--background-feature")});
            sorters.project.option("disabled", true);
            sorters.inbox.option("disabled", true);
        }
    });

    $(document).on("click", ".page, #left-menu div", function(e) {
        if (activeTask) {
            if ($(e.target).hasClass("task-pseudocheck")) {
                $("#task-check-"+activeTask).toggle();
            } else if ($(e.target).hasClass('task') || $(e.target).hasClass('task-name') || $(e.target).hasClass('task-display')) {
                return false;
            }
            taskManager.hideActiveTask();
        }
    });

    $(document).on("click", "#project-back", function() {
        // THE POP OPERATION IS NOT DUPLICATED.
        // On load, the current projDir will
        // be pushed to the array
        pageIndex.projectDir.pop();
        activeMenu = pageIndex.projectDir[pageIndex.projectDir.length-1];
        loadView("project-page", activeMenu.split("-")[1]);
        $("#"+activeMenu).addClass("menuitem-selected");
    });

    $(document).on("click", "#new-project", function() {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        let projObj = {
            top_level: false,
            is_sequential: false,
        };
        E.db.newProject(uid, projObj, pid).then(function(npID) {
            E.db.associateProject(uid, npID, pid);
            $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
            activeMenu = "project-"+npID;
            pageIndex.projectDir.push(activeMenu);
            loadView("project-page", npID).then(() => setTimeout(function() {$("#project-title").focus(); $("#project-title").select()}, 100));
            $("#"+activeMenu).addClass("menuitem-selected");
        });
    });

    $(document).on("click", "#perspective-add", function() {
        let perspectiveObj = {
            name: "",
            query: "",
        };
        E.db.newPerspective(uid, perspectiveObj).then(function(npID) {
            $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
            activeMenu = "perspective-"+npID;
            $(".perspectives").append(`<div id="perspective-${npID}" class="menuitem perspective mihov"><i class="fa fa-layer-group"></i><t style="padding-left:8px"></t></div>`)
            loadView("perspective-page", npID).then(async function(){
                // Delay because of HTML bug
                await refresh();
                showPerspectiveEdit(npID);
                setTimeout(function() {
                    $("#perspective-edit-name").focus();
                    $("#perspective-edit-name").select();
                }, 500);
            });
            $("#"+activeMenu).addClass("menuitem-selected");
        });
    });

    $(document).on("click", "#project-add-toplevel", function() {
        let projObj = {
            name: "New Project",
            top_level: true,
            is_sequential: false,
        };
        E.db.newProject(uid, projObj).then(function(npID) {
            $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
            activeMenu = "project-"+npID;
            pageIndex.projectDir = [activeMenu];
            $(".projects").append(`<div id="project-${npID}" class="menuitem project mihov"><i class="fas fa-project-diagram"></i><t style="padding-left:8px; text-overflow: ellipsis; overflow: hidden">New Project</t></div>`);
            loadView("project-page", npID).then(function(){
                // Delay because of HTML bug
                setTimeout(function() {
                    $("#project-title").focus();
                    $("#project-title").select();
                }, 100);
            });
            $("#"+activeMenu).addClass("menuitem-selected");
        });
    });

    $(document).on("click", "#perspective-trash", function() {
        let pid = pageIndex.pageContentID;
        $("#"+activeMenu).removeClass("menuitem-selected");
        loadView("upcoming-page");
        activeMenu = "today";
        $("#today").addClass("menuitem-selected");
        $("#perspective-"+pid).remove();
        E.db.deletePerspective(uid, pid);
    });

    $(document).on("click", "#project-trash", function() {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        let isTopLevel = pageIndex.projectDir.length === 1 ? true : false;
        E.db.deleteProject(uid, pid).then(function() {
            pageIndex.projectDir.pop();
            if (pageIndex.projectDir.length > 0) {
                E.db.dissociateProject(uid, pid, (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1]).then(function() {
                activeMenu = pageIndex.projectDir[pageIndex.projectDir.length-1];
                loadView("project-page", pageIndex.projectDir[pageIndex.projectDir.length-1].split("-")[1]);
                });
            } else {
                activeMenu = "today";
                $("#today").addClass("menuitem-selected");
                loadView("upcoming-page");
                $("#project-"+pid).remove();
            }

        });
    });

    $(document).on("click", "#new-task", function() {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        let ntObject = {
            desc: "",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: pid,
            tags: [],
            timezone: moment.tz.guess(),
            repeat: {rule: "none"},
            name: "",
        };
        E.db.newTask(uid, ntObject).then(function(ntID) {
            E.db.associateTask(uid, ntID, pid);
            taskManager.generateTaskInterface("project-content", ntID, true).then(function() {
                let task = ntID;
                activeTask = task;
                $("#task-" + task).animate({"background-color": interfaceUtil.gtc("--task-feature"), "padding": "10px", "margin": "15px 0 30px 0"}, 300);
                $("#task-edit-" + activeTask).slideDown(200);
                $("#task-trash-" + activeTask).css("display", "block");
                $("#task-repeat-" + activeTask).css("display", "block");
                $("#task-" + task).css({"box-shadow": "1px 1px 5px "+ interfaceUtil.gtc("--background-feature")});
                $("#task-name-" + task).focus();
                sorters.project.option("disabled", true);
                sorters.inbox.option("disabled", true);
            });
        });
    });

    $(document).on("change", "#project-title", function(e) {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        let value = $(this).val();
        E.db.modifyProject(uid, pid, {name: value});
        reloadPage(true);
        //console.error(e);
    });

    $(document).on("change", "#perspective-title", function(e) {
        let pstID = pageIndex.pageContentID;
        let value = $(this).val();
        E.db.modifyPerspective(uid, pstID, {name: value});
        reloadPage(true);
        //console.error(e);
    });

    $(document).on("click", "#project-sequential-yes", function(e) {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        E.db.modifyProject(uid, pid, {is_sequential: true}).then(function() {
            reloadPage(true);
        });
        //console.error(e);
    });

    $(document).on("click", "#project-sequential-no", function(e) {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        E.db.modifyProject(uid, pid, {is_sequential: false}).then(function() {
            reloadPage(true);
        });
        //console.error(e);
    });

    $(document).on("click", "#logout", function(e) {
        firebase.auth().signOut().then(() => {}, console.error);
        //console.error(e);
    });

    $(document).on("click", "#perspective-edit", function(e) {
        showPerspectiveEdit(pageIndex.pageContentID);
        //console.error(e);
    });

    $("#quickadd").click(function(e) {
        $(this).animate({"width": "350px"}, 500);
        //console.error(e);
    });

    $("#quickadd").blur(function(e) {
        $(this).val("");
        $(this).animate({"width": "250px"}, 500);
        //console.error(e);
    });


    $("#quickadd").keydown(function(e) {
        // TODO: make the user unable to spam
        if (e.keyCode == 13) {
            let tb = $(this);
            tb.animate({"background-color": interfaceUtil.gtc("--quickadd-success"), "color": interfaceUtil.gtc("--quickadd-success-text")}, 100, function() {
                let newTaskUserRequest = chrono.parse($(this).val());
                // TODO: so this dosen't actively watch for the word "DUE", which is a problem.
                // Make that happen is the todo.
                let startDate;
                //let endDate;
                let tz = moment.tz.guess();
                let ntObject = {
                    desc: "",
                    isFlagged: false,
                    isFloating: false,
                    isComplete: false,
                    project: "",
                    tags: [],
                    timezone: tz,
                    repeat: {rule: "none"},
                };
                if (newTaskUserRequest.length != 0) {
                    let start = newTaskUserRequest[0].start;
                    //let end = E.db.newTaskUserRequest[0].end;
                    if (start) {
                        startDate = start.date();
                        ntObject.due = startDate;
                        ntObject.name = tb.val().replace(newTaskUserRequest[0].text, '')
                    }
                } else {
                    ntObject.name = tb.val()
                }


                E.db.newTask(uid, ntObject).then(function(ntID) {
                    refresh().then(function(){
                        taskManager.generateTaskInterface("inbox", ntID)
                    });
                    E.db.getInboxTasks(uid).then(function(e){
                        iC = e.length;
                        $("#unsorted-badge").html(''+iC);
                        $("#inbox-subhead").slideDown(300);
                        $("#inbox").slideDown(300);
                    });
                    tb.animate({"background-color": interfaceUtil.gtc("--quickadd"), "color": interfaceUtil.gtc("--quickadd-text")}, function() {
                        tb.blur();
                        tb.val("");
                    });
                });
            });
            
        } else if (e.keyCode == 27) {
            $(this).blur();
        }
    });

    /*$(document).on(".menuitem", "dragover", function(e) {*/
        //console.log(e);
        //e.preventDefault();
    /*});*/

    $(document).on("drop", ".project", function(e) {
        let dropped = e.originalEvent.dataTransfer.getData('text').split("-"); 
        let target = this.id.split("-"); 

        if (dropped[1] === target[1]) return;
        if (dropped[0] === "task") {
            (async function() {
                let ti = await E.db.getTaskInformation(uid, dropped[1]);
                if (ti.project !== "") {
                    if (ti.project === target[1]) return;
                    await E.db.dissociateTask(uid, dropped[1], ti.project); 
                }
                await E.db.modifyTask(uid, dropped[1], {project:target[1]});
                await E.db.associateTask(uid, dropped[1], target[1]);
                $("#task-"+dropped[1]).slideUp();
                reloadPage(true);
            })();
        } else if (dropped[0] === "project") {
            (async function() {
                let ti = await E.db.getProjectStructure(uid, dropped[1]);
                if (ti.parentProj !== "") {
                    if (ti.parentProj === target[1]) return;
                    await E.db.dissociateProject(uid, dropped[1], ti.parentProj); 
                }
                await E.db.modifyProject(uid, dropped[1], {parent:target[1], top_level: false});
                await E.db.associateProject(uid, dropped[1], target[1]);
                $("#project-"+dropped[1]).slideUp();
                reloadPage(true);
            })();
        }
    });

    /*$(document).on("drop", "#quickadd", function(e) {*/
        //console.log("aoeu");
        //let dropped = e.originalEvent.dataTransfer.getData('text').split("-"); 

        //console.log(dropped);
        //if (dropped[0] === "task") {
            //(async function() {
                //let ti = await E.db.getTaskInformation(uid, dropped[1]);
                //if (ti.project && ti.project !== "") {
                    //$("#task-"+dropped[1]).slideUp();
                    //await E.db.dissociateTask(uid, dropped[1], ti.project); 
                    //await E.db.modifyTask(uid, dropped[1], {project:""});
                //}
            //})();
        //}
    /*});*/

    $(document).on("dragenter", ".project", function(e) {
        $(this).animate({"background-color": interfaceUtil.gtc("--menu-accent-background")}, 100);
    });

    $(document).on("dragleave", ".project", function(e) {
        $(this).animate({"background-color": "transparent"}, 100);
    });

/*    $(document).on("dragenter", "#quickadd", function(e) {*/
        //e.preventDefault();
        //$("#quickadd").prop('disabled', true);
        //$("#quickadd").animate({"background-color": interfaceUtil.gtc("--quickadd-success"), "color": interfaceUtil.gtc("--quickadd-success-text")}, 100, ()=>$("#quickadd").addClass("dragover"));
    //});

    //$(document).on("dragleave", "#quickadd", function(e) {
        //e.preventDefault();
        //$("#quickadd").prop('disabled', false);
        //$("#quickadd").animate({"background-color": interfaceUtil.gtc("--quickadd"), "color": interfaceUtil.gtc("--quickadd-text")}, 100, ()=>$("#quickadd").removeClass("dragover"));
    /*});*/

    $(document).on("dragstart", ".project", function(e) {
        e.originalEvent.dataTransfer.setData('text', e.target.id);
    });

    $(document).on("dragstart", ".task", function(e) {
        e.originalEvent.dataTransfer.setData('text', e.target.id);
    });

    $(document).on("click", "#perspective-documentaion", function(e) {
        require('electron').shell.openExternal("https://condutiondocs.shabang.cf/Perspective-Menus-408aae7988a345c0912644267ccda4d2")
    });


    let user;
    let uid;
    let displayName;
    // TODO: actually set theme
    //let currentTheme = "condutiontheme-default";

    let constructSidebar = async function() {
        let tlps = (await E.db.getTopLevelProjects(uid));
        let pPandT = (await E.db.getProjectsandTags(uid));
        $(".projects").empty();
        $(".perspectives").empty();
        for (let proj of tlps[2]) {
            $(".projects").append(`<div id="project-${proj.id}" class="menuitem project mihov"><i class="fas fa-project-diagram"></i><t style="padding-left:8px; text-overflow: ellipsis; overflow: hidden">${proj.name}</t></div>`);
        }
        let psps = (await E.db.getPerspectives(uid));
        for (let psp of psps[2]) {
            $(".perspectives").append(`<div id="perspective-${psp.id}" class="menuitem perspective mihov"><i class="fa fa-layer-group"></i><t style="padding-left:8px">${psp.name}</t></div>`)
        }
    };

    let setUser = function(usr) {
        user = usr;
        uid = usr.uid;
        displayName = usr.displayName;
        user = usr;
    };

    return {user:{set: setUser, get: () => user}, load: loadView, update: reloadPage, constructSidebar: constructSidebar};
}();

$(document).ready(async function() {
    firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
            if (user.emailVerified) {
                const startTime = Date.now();
                // User is signed in. Do user related things.
                // Check user's theme
                ui.user.set(user);
                await ui.constructSidebar();
                await ui.load("upcoming-page");
                $("#loading").fadeOut();
                /*currentTheme = "condutiontheme-default-dark";*/
                //$("body").removeClass();
                /*$("body").addClass(currentTheme);*/
                $("#content-wrapper").fadeIn();
                setInterval(() => {ui.update(); ipcRenderer.send("updatecheck");}, 60 * 1000);
            } else {
                window.location.replace("auth.html");
            }
        } else {
            firebase.auth().signOut();
            window.location.replace("auth.html");
        }
    });
});
console.log('%cSTOP! ', 'background: #fff0f0; color: #434d5f; font-size: 80px');
console.log('%cClose this panel now.', 'background: #fff0f0;color: black;'+css);
console.log('%c19/10 chance you are either a terribly smart person and should work with us (hliu@shabang.cf) or are being taken advantanged of by a very terrible person. ', 'background: #fff0f0; color: #434d5f; font-size: 20px');
console.log('%cPlease help us to help you... Don\'t self XSS yourself.', 'background: #fff0f0; color: #434d5f; font-size: 15px');

