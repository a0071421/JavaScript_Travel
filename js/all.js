var data = [];

var select = document.getElementById("Section");
var allZone =[];
var list = document.querySelector(".list"); 
var selectData = []; // 選擇區域之景點
var popularBtn = document.querySelector(".popularBtn");
var paginationList = document.querySelector(".paginationList");
var goTop = document.querySelector(".goTop");
var popularZoneList = JSON.parse(localStorage.getItem("popularZoneList")) || [];
var nowPage = 1 ;

// 遠端取得資料
GetData();



goTop.style.marginLeft = ( list.offsetWidth - 10 ) + "px"; // goTop初始

window.onresize = function(){ // 螢幕改變時，更改goTop位置
  goTop.style.marginLeft = ( list.offsetWidth - 10 ) + "px";
}


// 監聽



goTop.addEventListener('click',function(e){
  e.preventDefault();
  window.scrollTo({ 
    top: 0, 
    behavior: "smooth" 
  });

});



window.addEventListener('scroll',function(e){

  var scrollTop = window.pageYOffset|| document.documentElement.scrollTop || document.body.scrollTop;
  if( ( window.innerHeight / 2 ) < scrollTop ){
    goTop.style.display = "block";

  } // if

  else goTop.style.display = "none";

});

select.addEventListener('change', function(e){
  selectData = [];
 
  if( e.target.value === "" ) // 全部區域
    selectData = data;

  else {

     // 增加該地區之點擊次數
     AddPopularZone( e.target.value );
  
     // 取出前四多人點擊之地區為熱門行政區
     PopularZone();

     // 取得所選擇區域之景點
    for( var i = 0 ; i < data.length ; i++ ){
      if( e.target.value === ZoneName(data[i].Add)) 
        selectData.push(data[i]);
      
    } // for
  } // else
  
;
  Pagination( selectData , 1);
  
});

popularBtn.addEventListener('click',function(e){
  selectData =[];
  if( e.target.nodeName == "INPUT"){
    // 取得所選擇熱門區域之景點
    for( var i = 0 ; i < data.length ; i++ ){
      if( e.target.value === ZoneName(data[i].Add))
        selectData.push(data[i]);
    } // for
    
    Pagination( selectData , 1);
    document.querySelector(".selectSection").textContent = e.target.value ;
  } // if
});

paginationList.addEventListener('click',ChangePage);


// 取得遠端資料
function GetData(){
  var xhr = new XMLHttpRequest();
  xhr.open('get','https://api.kcg.gov.tw/api/service/get/9c8e1450-e833-499c-8320-29b36b7ace5c', true);
  xhr.send(null);

  xhr.onload = function(){
    var str = JSON.parse(xhr.responseText);
    data = str.data.XML_Head.Infos.Info ;
    selectData = data;
    console.log(selectData);
    // 產生不重複下拉式地區選單
    SelectOption();

    // 產生前四名最常被點擊之地區
    PopularZone();

    Pagination( data, 1 );
  }


} // GetData()


// 列出該區景點
function AttractionList( data ) {
  
  document.querySelector(".selectSection").textContent = select.value === "" ? "全部地區" : select.value;
  list.innerHTML = "";
  var str = "";
  // 組字串

  for( var i = 0 ; i < data.length ; i++ ){
    
    str += '<li> \
              <div class="img" style="background-image: url(' + data[i].Picture1 + ')" > \
                <h3 class="travelName">' + data[i].Name + '</h3> \
                <span class="travelZone">' + ZoneName(data[i].Add) + '</span> \
              </div> \
              <ul class="travelInfo"> \
                <li><span style="background-image: url(https://upload.cc/i1/2020/05/15/YDnGcT.png);"></span> ' + data[i].Opentime + '</li> \
                <li><span style="background-image: url(https://upload.cc/i1/2020/05/15/cqktSh.png);"></span> ' +  AddrNoZip(data[i].Add) + '</li> \
                <li class="flex"> \
                  <div class="icon"> \
                    <span style="background-image: url(https://upload.cc/i1/2020/05/15/p4dZKn.png);"></span> ' + data[i].Tel +
                  '</div> \
                  <div class="icon ticketInfo"> \
                      <span style="background-image: url(https://upload.cc/i1/2020/05/15/BJHFfI.png);"></span> ' + data[i].Ticketinfo + 
                  '</div> \
                </li> \
              </ul> \
            </li>';

  } // for
    list.innerHTML = str;
} // AttractionList()

function SelectOption(){
  // 過濾成乾淨的區域陣列到 temp
  var temp=[];
  for(var i= 0;data.length>i;i++){
    temp.push(ZoneName(data[i].Add));
  }
  


  var zoneList = Array.from(new Set(temp));
  allZone= zoneList;
  // 放入select
  var option = document.createElement("option");
  option.text = "- -請選擇行政區- -" ;
  option.value = "";
  select.appendChild(option);
  for( var i = 0 ; i < zoneList.length ; i++){
      option = document.createElement("option");
      option.text = zoneList[i];
      option.value = zoneList[i];
      select.appendChild(option);
  } // for
} // SelectOption()


function AddPopularZone( selectZone ){
  // 紀錄所按下之區域點擊次數作為熱門行政區之參考
  var index = popularZoneList.map(function(x) {return x.name; }).indexOf(selectZone);
  
  if( index === -1 ) {
    var selectZone = {
      name : selectZone,
      count : 1
    };
    popularZoneList.push(selectZone);
  } // if
   
  else 
    popularZoneList[index].count++  


  localStorage.setItem("popularZoneList", JSON.stringify( popularZoneList ));



} // AddPopularZone()


function Pagination(data, nowPage) {
  

  // 取得資料長度
  var dataTotal = data.length;

  // 要顯示在畫面上的資料數量，預設每一頁只顯示六筆資料。
  var perpage = 6;

  // page 按鈕總數量公式 總資料數量 / 每一頁要顯示的資料= 總頁數
  var pageTotal = Math.ceil( dataTotal / perpage);
  

  // 當前頁數

  
  var currentPage = nowPage ;  

  // 當"當前頁數"比"總頁數"大的時候，"當前頁數"就等於"總頁數"
  if (currentPage > pageTotal) {
    currentPage = pageTotal;
  } // if

  // 第一頁:1~6筆、第二頁:7~11筆
  var minData = (currentPage * perpage) - perpage + 1 ;
  var maxData = (currentPage * perpage) ;



  var pageData = [];
  var num = 0 ;
  for( var i = minData - 1  ; i < data.length ; i++ ){
      if( i + 1 <= maxData )
        pageData.push(data[i]);
  } // for

  // 用物件方式來傳遞資料
  var page = {
    pageTotal,
    currentPage,
    hasPage: currentPage > 1,
    hasNext: currentPage < pageTotal,
  }

  
  paginationList.innerHTML = "";

  // 列出區域(預設，全部地區)
  AttractionList( pageData )
  

  // 產生頁數(無資料or只有一頁就不顯示分頁)
  
  if( parseInt( page.pageTotal ) !== 0 && parseInt( page.pageTotal ) !== 1 )
    PageLinkList( page );
  
  
  
}


function PageLinkList( page ){
  var str = "";
  var round = ( Math.floor((page.currentPage - 1) / 10)  );
  var firstPage = round * 10 + 1;
  var endPage = round * 10 + 10;
  var totalEnd = Math.floor((page.pageTotal - 1) / 10 );
  if( page.hasPage && round !== 0 ) 
    str += '<li><a class = "pageLink" href="#" data-page="pre">&laquo;</a></li>' +
           '<li><a class = "pageLink" href="#" data-page="preGroup">&hellip;</a></li>' ;
  
  else if( page.hasPage )
    str += '<li><a class = "pageLink" href="#" data-page="pre">&laquo;</a></li>' 
  else str += '<li><a class = "pageLink disable" href="#" disabled="disabled" data-page="pre">&laquo;</a></li>';
 
  
  
  for( var i = firstPage ; i < page.pageTotal && i < endPage + 1 ; i++ ){
    if( i === parseInt( page.currentPage ) )
      str += '<li><a class = "pageLink active" href="#" data-page="' + i + '">' + i  + '</a></li>';
    else str += '<li><a class = "pageLink" href="#" data-page="' +  i  + '">' + i  + '</a></li>';
  } // for

  if( round !== totalEnd ) {
    str += '<li><a class = "pageLink" href="#" data-page="nextGroup">&hellip;</a></li>';
  }

  if( page.hasNext )
    str += '<li><a class = "pageLink" href="#" data-page="next">&raquo;</a></li>';

  else str += '<li><a class = "pageLink disable" href="#" data-page="next">&raquo;</a></li>';  

  
  paginationList.innerHTML = str;
} // PageLinkList();

function ChangePage(e){
  e.preventDefault();
  if( e.target.nodeName !== "A")
    return ;

  else{
    
    var clickPage = e.target.dataset.page;
   
    if( clickPage === "pre")
      nowPage--;
    else if ( clickPage === "next")
      nowPage++;

    else if( clickPage === "preGroup") {
      nowPage = ( Math.floor( nowPage / 10 ) - 1 ) * 10 + 1;
    } // else 

    else if( clickPage === "nextGroup") {
      nowPage = ( Math.floor( nowPage / 10 ) + 1 ) * 10 + 1;
    } // else 
    else nowPage = clickPage;
    Pagination( selectData, nowPage );
    window.scrollTo({ 
      top: document.querySelector(".popularSection").offsetTop 
    });
  } // else


} // ChangePage()


function PopularZone(){

  var str = "";

  var color = ["btnPurple", "btnPink", "btnYellow", "btnBlue"];

  var total = popularZoneList.length;
  

  popularBtn.innerHTML = "";
  // 尚未有行政區被點擊過
  if( total == 0 ){
    // 從全部區域隨機選擇
    var random = Math.floor( Math.random()*allZone.length );
   

    var indexGroup =[];
    var index = -1;
    for( var i = 0 ; i < 4  ; i++ ){
      if( index === -1 ){ // 沒有和現有熱門行政區重複
        str += '<input class=' + color[i] +  ' type="button" value="' + allZone[random] + '">'
        indexGroup.push(random);
        
      } // if

      else  // 重複!重來
        i--;

      random = Math.floor( Math.random()*allZone.length );
      index = indexGroup.indexOf(random);
    } // for
  } // if

  // 被點擊區域少於四個
 
  else if( total < 4 ) {
  
    for( var i = 0 ; i < total ; i++ ){
      str += '<input class=' + color[i] +  ' type="button" value="' + popularZoneList[i].name + '">'    
    } // for
    
    // 剩餘從全部區域隨機選擇
    var random = Math.floor(  Math.random()*allZone.length );
    var index = popularZoneList.map(function(x) {return x.name; }).indexOf(allZone[random]) ;
    for( var i = total ; i < 4 ; i++ ){
      if( index === -1 ) // 沒有和現有熱門行政區重複
        str += '<input class=' + color[i] +  ' type="button" value="' + allZone[random] + '">'

      else // 重複!重來
        i--;
      
      random = Math.floor( Math.random()*allZone.length );
      index = popularZoneList.map(function(x) {return x.name; }).indexOf(allZone[random]);
    } // for

  } // else if

  else {
    // 排序
    popularZoneList = popularZoneList.sort(function (a, b) {
      return a.count < b.count ? 1 : -1;
    });
    
    

    for( var i = 0 ; i < 4 ; i++ ){
      str += '<input class=' + color[i] +  ' type="button" value="' + popularZoneList[i].name + '">'    
    } // for
  } // else

  popularBtn.innerHTML = str;

} // PopularZone()

// 將 地址:高雄市804鼓山區鼓山一路32號，行政區取出
function ZoneName( str ) {
  return str.substring( 6, str.indexOf("區") + 1);
}

// 將 地址:"高雄市804鼓山區鼓山一路32號"的郵遞區號取出過濾掉成"高雄市鼓山區鼓山一路32號"
function AddrNoZip( str ) {
  return str.substring( 0, 3) + str.substring(6, str.length);
}


