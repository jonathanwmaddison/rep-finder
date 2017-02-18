//Bootstrap col size for address,photo, etc. In case it needs to be adjusted.
var columnSize = "col-sm-3 col-xs-12";
var panelSize  = "col-sm-6";
var twitterHandle = "";
var twitterTracker = {};
var newsTracker = {};
var wikiTracker ={};
//include twitter embed JS -> https://dev.twitter.com/web/javascript/loading
window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0],
    t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);

  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };

  return t;
}(document, "script", "twitter-wjs"));

//store data from representative search. Google civic info API provides data!

function getData (address) {
  $(".repDisplay").remove()
  console.log(address);
  var key = "AIzaSyCZJ6S0JHvG9JwJWVK6H0ujFwBM0IXX0jw";
  var url = "https://www.googleapis.com/civicinfo/v2/representatives?address="+encodeURIComponent(address)+"&key="+key;
  var count=0
  var data;
  $.getJSON(url, function(data){
    localStorage["dataV2"] = JSON.stringify(data);
    formatAndAppend(data)
  })
}
///////// Helper functions to format data ////////
function formatSocialButton (channel){
  if(channel.type === "Facebook") {
    return  "<a target=\"_blank\" href =\"https://www.facebook.com/"+ channel.id +"/\"><img  class=\"socialIcon\" src=\"images/"+ channel.type.toLowerCase()+".svg\"></a></li>"
  }
  else if (channel.type === "Twitter"){
    twitterHandle = channel.id;
    return  "<a target=\"_blank\" href =\"https://www.twitter.com/"+ channel.id +"/\"><img  class=\"socialIcon\" src=\"images/"+ channel.type.toLowerCase()+".svg\"></a></li>"

  }
  else if (channel.type === "YouTube"){
    return  "<a target=\"_blank\" href =\"https://www.youtube.com/user/"+ channel.id +"/\"><img  class=\"socialIcon\" src=\"images/"+ channel.type.toLowerCase()+".svg\"></a></li>"
  }
  else if (channel.type === "GooglePlus"){
    return  "<a target=\"_blank\" href =\"https://plus.google.com/"+ channel.id +"\"><img  class=\"socialIcon\" src=\"images/"+ channel.type.toLowerCase()+".svg\"></a></li>"
  } else {
    return  channel.type + ": " + channel.id;
  }
}
function formatName(official, office) {
  return "<div class=\"rep\"><h3 class=\"position\">"+office+": " + official.name +" (" + official.party[0] +") </h3>";
}
function formatPhoto(official){
  var photo =""
  if(official.photoUrl) {
     photo=official.photoUrl;
  } else {
        photo = "http://i.imgur.com/iMTIAcQ.jpg"
    }
    return "<div class=\" "+ "col-12" +" photo\"><img id = \"repPhoto\" src=\"" + photo + "\" alt=\" Photo of Rep\" class=\"img-crop center-block pull-left \"></div>";
}
function formatAddress(official){
  var address="";
  var additionalBr="";
  if(official.address) {
    address += official.address[0].line1 ? official.address[0].line1 + ", " : "";
    address += official.address[0].line2 ? official.address[0].line2 + ", "  : "";
    address += official.address[0].city + ", " + official.address[0].state + "&nbsp;&nbsp;" + official.address[0].zip

  }

  return "<div class=\" "+ columnSize +" address\"> <h4> Contact </h4>" + address;
}
function formatContact(official){
  var website ="";
  var officialPhone="";
  if(official.urls) {
    website = "<div class=\" website\"><p><a target=\"_blank\" href=\"" + official.urls[0] + "\"> Website </a></p></div>";
  }
  if (official.phones) {
    officialPhone = "<div class=\"phone\"><a href=\"tel:" + official.phones[0] + "\"</a>+" + official.phones[0] + "</div>"
  }
  return "<span class=\" contact\">" +officialPhone + website + "</span>"
}
function formatSocial(official) {
  var socialMedia="<div class=\"social-media "+ columnSize +"\"><h4> Social Media</h4><ul>";
  if (official.channels) {
    official.channels.forEach(function(channel){
      socialMedia+=formatSocialButton(channel) 
    })
    socialMedia+="</ul></div>";
  }
  else {
    return 1; // no social media accounts found!
  }
  return socialMedia;
}



function tabs(official,id){
  var idName = official.name.replace(/ /g,"-").replace(/\./g,"_")
  var twitterLink="";
  var twitterTab="";
  if(twitterHandle != "") {
    if(twitterHandle==="whitehouse"&&official.name==="Mike Pence") {
      twitterHandle="VP"
    } else if (twitterHandle === "whitehouse" && official.name === "Donald J. Trump") {
      twitterHandle = "realDonaldTrump"
    }
    twitterLink="<li role=\"presentation\" onclick=\"showCancel(this.id)\" class=\"twitter-feed\" id=\"twitter"+twitterHandle+"\"><a href=\"#tab"+twitterHandle+"\" aria-controls=\"tab"+twitterHandle+"\" role=\"tab\" data-toggle=\"tab\"><img class=\"media-icon\" src=\"images/twitter.svg\">Recent Tweets</a></li>";
    twitterTab="<div role=\"tabpanel\" class=\"tab-pane twitter-tab\" id=\"tab"+twitterHandle+"\"><span class=\"twitter\" id=\"embedtwitter"+twitterHandle+"\"> </span></div>"
  }
  var tabs = 
  "<!-- Nav tabs -->"
  +"<ul class=\"nav nav-tabs\" role=\"tablist\">"
    +"<li role=\"presentation\" class=\"news-search\" onclick=\"showCancel(this.id)\" id=\""+ idName+"\"><a href=\"#recent-news"+id+"\" class=\"\" aria-controls=\"recent-news"+id+"\" id=\"heading"+id+"\" role=\"tab\" data-toggle=\"tab\"><img class=\"media-icon\" src=\"images/nyt.png\"> Recent News</a></li>"
    + twitterLink
    +"<li role=\"presentation\" class=\"wiki-feed\" onclick=\"showCancel(this.id)\" id=\"wiki"+official.name.replace(/ /g,"_").replace(/\./g,"")+"\"><a href=\"#wikitab"+idName+"\" aria-controls=\"#wikitab" + idName + "\" role=\"tab\" data-toggle=\"tab\"><img class=\"media-icon\" src=\"images/wikipedia.png\">Wikipedia</a></li>"
    +"<li role=\"presentation\" style=\"display:none;\" class=\"exit-display \" id=\"close"+id+"\" onclick=\"hideCancel(this.id)\"><a href=\"#close"+idName+"\" aria-controls=\"close"+idName+"\" role=\"tab\" data-toggle=\"tab\"> <span class=\"glyphicon glyphicon-remove\"></span></a></li>"

  +"</ul>"
  var tabPanes = 
  "<!-- Tab panes -->"
  +"<div class=\"tab-content \">"
  +   "<div role=\"tabpanel\" class=\"tab-pane \" id=\"recent-news"+id+"\"><span id=\"news"+official.name.replace(/ /g,"-").replace(/\./g,"_")+"\"> </span></div>"
  +   twitterTab
  +   "<div role=\"tabpanel\" class=\"tab-pane\" id=\"wikitab"+idName+"\"><span class=\"wiki-embed\" id=\"wikiembed"+official.name.replace(/ /g,"_").replace(/\./g,"")+"\"> </span></div>"
  +   "<div role=\"tabpanel\" class=\"tab-pane\" id=\"close"+idName+"\"></div>"
  +"</div>";
return [tabs,tabPanes];
}

/////////////////////End Helper functions

//Utilizes data from google and helper functions to format data for display.
function formatAndAppend (data) {

  var officeName= "";
  var appendData = "";
  collapseId=0;
  appendData+="<div class=\"repDisplay\">";
  for (division in data.divisions) {
    if(!data.divisions[division].officeIndices) {
    } else {
    appendData +="<hr class=\"division-hr\"><div class=division><h1>"+data.divisions[division].name.toUpperCase()+"</h1>";
    data.divisions[division].officeIndices.forEach(function(office){
      officeName = data.offices[office].name;
      data.offices[office].officialIndices.forEach(function(official){
        twitterHandle = "";
        var name = formatName(data.officials[official], officeName)
        var photo = formatPhoto(data.officials[official])
        var address = formatAddress(data.officials[official])
        var contact = formatContact(data.officials[official])
        var socialMedia = formatSocial(data.officials[official])
        var menu = tabs(data.officials[official], collapseId)
        if (socialMedia === 1) {
          socialMedia="";
        }
        //id counter for newsButton that ensures each accordian panel is unique
        collapseId++;
        
        //compile all data
        appendData+= name + "<div class=\"row\">"+ photo + "<div class=\"row\">"+address + contact + "</div>" + socialMedia;
        appendData+="<div class=\"col-sm-8\">"+menu[0]+"</div></div>";
        appendData+="<div class=\"row tab-display\">"+menu[1]+"</div>";
        appendData+="</div></div>";
        })
      //close office
      })
      appendData+="</div>"
    }
    //close division
  }
  //close repDisplay
  appendData+="</div>" 

  $(".container").append(appendData);
  $( ".news-search" ).on( "click", function() {
      getNews( $( this ).attr("id") );
      newsTracker[$( this ).attr("id")] = true;
  });
  $( ".twitter-feed" ).on( "click", function() {
      if (!twitterTracker[$( this ).attr("id")]) {
        twitterEmbed( $( this ).attr("id") );
        twitterTracker[$( this ).attr("id")] = true;
     }
  });
  $( ".wiki-feed" ).on( "click", function() {
      if (!wikiTracker[$( this ).attr("id")]) {
      getWikiPageName( $( this ).attr("id") );
      wikiTracker[$( this ).attr("id")] = true;
     }
  });
}

//grabs news from NY times API

function getNews(id) {
  if(newsTracker[id]) {
     return
  }
  var contentForDisplay = "<ol id=\"content"+ id +"\">";
  var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";

  url += '?' + $.param({
    'api-key': "b3947cbe5bfb4ffeac69be6569aa335f",
    'q': id.replace(/-/g,"+").replace(/_/g,""),
    'sort': "newest"
  });
  $.ajax({
    url: url,
    method: 'GET',
  }).done(function(result) {
    result.response.docs.forEach(function (article) {
      contentForDisplay += "<li><a href="+ article.web_url+" target=\"_blank\">"+ article.headline.main+"</a></li>"
    })
    $("#news"+id).append(contentForDisplay+"</ol>");
  }).fail(function(err) {
    throw err;
  });   
}

//Create embed code for twitter handle of official clicked
function twitterEmbed(handle) {
  twttr.widgets.createTimeline(
  {
    sourceType: 'profile',
    screenName: handle.slice(7)
  },
  document.getElementById("embed"+handle),
  {
    height: '45rem',
    width: "800px",
  }).then(function (el) {
  });
}

//Grab most likely wiki page name for politican
function getWikiPageName (name) {
  var pageName=""
  $.ajax({
    type: "GET",
    url: "https://en.wikipedia.org/w/api.php?action=opensearch&search="+name.slice(4)+"&limit=1&namespace=0&format=json&callback=?",
    contentType: "application/json; charset=utf-8",
    async: false,
    srwhat: "text",
    dataType: "json",
    headers: { 'Api-User-Agent': 'rep-finder/1.0' },
    success: function (data, textStatus, jqXHR) {
      console.log(data);
      if(data[1].length<1) {
        $('#wikiembed'+name.slice(4)).html("<br><p>Sorry! We could not find a wikipedia page for this representative.</p><br>");
      } else {
        pageName=data[1][0].replace(/ /g,"_")
        getWikiPageData(pageName, name);
      }
    },
    error: function (errorMessage) {
    }
  });

}
//grab page data for page name of politican
function getWikiPageData (pageName, id){
  $.ajax({
    type: "GET",
    url: "https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page="+pageName+"&callback=?",
    contentType: "application/json; charset=utf-8",
    async: false,
    dataType: "json",
    headers: { 'Api-User-Agent': 'rep-finder/1.0' },
    success: function (data, textStatus, jqXHR) {
      console.log(data)
      var markup = data.parse.text["*"];
      var blurb = $('<div></div>').html(markup);
      if($(blurb).find(".redirectMsg").length>0) {
        var newPageName = (blurb).find("a").attr("href").slice(6);
        getWikiPageData(newPageName, id)
      } else {
        $('#wikiembed'+id.slice(4)).html($(blurb).find('p'));
      }
    },
    error: function (errorMessage) {
    }
  });
}


function hideCancel (id) {

  $("#"+id).attr("style", "display:none;")
}
function showCancel(id) {

  if (id.slice(0,4) ==="wiki") {
    $("#"+id).next().attr("style", "display:block;")
      return 0
  }
  else if (id.slice(0,7)==="twitter") {
    $("#"+id).next().next().attr("style", "display:block;")
    return 0
  }
  else {
    $("#"+id).next().next().next().attr("style", "display:block;")
    return 0 
  }
}
//Functions that run once the document is loaded
$(document).ready(function() {

  //Load in Google's Places API for autocomplete
  var input = document.getElementById('zip');
  autocomplete = new google.maps.places.Autocomplete(input);

  //see if data is stored and if so, format data from stored data.
  if(localStorage["dataV2"]) {
    formatAndAppend(JSON.parse(localStorage["dataV2"]))
  }

  // event listener for rep search form
  $( "#zipForm" ).submit(function( event ) {
      $(".repDisplay").remove()
    var zip = $("#zip" ).val()
    $("#zip" ).val("")
    getData(zip);
    event.preventDefault();
  });
});
