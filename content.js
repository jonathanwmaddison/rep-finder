//Bootstrap col size for address,photo, etc. In case it needs to be adjusted.
var columnSize = "col-sm-3";

//store data from representative search. Google civic info API provides data!

function getData (address) {
  console.log(address);
  var key = "AIzaSyCZJ6S0JHvG9JwJWVK6H0ujFwBM0IXX0jw";
  var url = "https://www.googleapis.com/civicinfo/v2/representatives?address="+encodeURIComponent(address)+"&key="+key;
  var count=0
  var data;
  $.getJSON(url, function(data){
    formatAndAppend(data)
    console.log(data, "test")
  })
}
///////// Helper functions to format data ////////
function formatSocialButton (channel){
  if(channel.type === "Facebook") {
    console.log(channel.type.toLowerCase())
    return  "<a target=\"_blank\" href =\"https://www.facebook.com/"+ channel.id +"/\"><img  class=\"socialIcon\" src=\"images/"+ channel.type.toLowerCase()+".svg\"></a></li>"
  }
  else if (channel.type === "Twitter"){
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
  if(official.photoUrl) {
    var photo=official.photoUrl;
    return "<div class=\"row\"><div class=\" "+ columnSize +" photo\"><img id = \"repPhoto\" src=\"" + photo + "\" alt=\" Photo of Rep\" class=\"img-thumbnail\"></div>"
  } else {
    var photo = "http://i.imgur.com/iMTIAcQ.jpg"
    return "<div class=\"row\"><div class=\" "+ columnSize +" photo\"><img id = \"repPhoto\" src=\"" + photo + "\" alt=\" Photo of Rep\" class=\" img-thumbnail\"></div>"      }
}
function formatAddress(official){
  var address=""
  if(official.address) {
    address += official.address[0].line1 ? official.address[0].line1 + ", " : "";
    address += official.address[0].line2 ? official.address[0].line2 + ", "  : "";
    address += official.address[0].city + ", " + official.address[0].state + "&nbsp;&nbsp;" + official.address[0].zip
  }
  return "<div class=\" "+ columnSize +" address\"> <h4> Mailing Address </h4><p>" + address + "</p></div>";
}
function formatContact(official){
  var website ="";
  var officialPhone="";
  if(official.urls) {
    website = "<div class=\" website\"><p><a target=\"_blank\" href=\"" + official.urls[0] + "\"> Website </a></p></div>";
  }
  if (official.phones) {
    officialPhone = "<div class=\"phone\"> Phone: " + official.phones[0] + "</div>"
  }
  return "<div class=\" contact "+ columnSize +"\"><h4> Contact </h4> <p>" +officialPhone + website + " </p></div>"
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
    socialMedia+="</div>"
  }
  return socialMedia;
}
function formatNews(official, id){
  return "<div class=\"row\"><div class=\"panel-group\" id=\""+ official.name.replace(/ /g,"-").replace(/\./g,"_")+"\" role=\"tablist\" aria-multiselectable=\"true\"><div class=\"panel panel-default\"><div class=\"panel-heading\" role=\"tab\" id=\"heading"+id+"\"><h4 class=\"panel-title\"><a role=\"button\" data-toggle=\"collapse\" data-parent=\"#"+ official.name.replace(/ /g,"-").replace(/\./g,"_")+"\" href=\"#collapse"+id+"\" aria-expanded=\"true\" aria-controls=\"collapse"+id+"\">News <span class=\"pull-right glyphicon glyphicon-menu-hamburger\"></span></a></h4></div><div id=\"collapse"+id+"\" class=\"panel-collapse collapse\" role=\"tabpanel\" aria-labelledby=\"headingOn\"><div class= \"panel-body\"id=\"text"+ official.name.replace(/ /g,"-").replace(/\./g,"_")+"\"></div></div></div></div></div>"
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
      console.log("empty division!")
    } else {
    appendData +="<div class=division><h1>"+data.divisions[division].name+"</h1>";
    data.divisions[division].officeIndices.forEach(function(office){
      officeName = data.offices[office].name;
      data.offices[office].officialIndices.forEach(function(official){
        var name = formatName(data.officials[official], officeName)
        var photo = formatPhoto(data.officials[official])
        var address = formatAddress(data.officials[official])
        var contact = formatContact(data.officials[official])
        var socialMedia = formatSocial(data.officials[official])
        var newsButton = formatNews(data.officials[official], collapseId)
        //id counter for newsButton that ensures each accordian panel is unique
        collapseId++;
        
        //compile all data
        appendData+= name + photo + address + contact + socialMedia + "</div>";

        //close out official with NewsButton
        appendData+=newsButton
      })
      //close out office
    })
  }
    //close out division
    appendData+="</div>"
  }
  //close out repDisplay
  appendData+="</div>" 
  localStorage["append"] = appendData;

  $(".container").append(appendData);
  $( ".panel-group" ).on( "click", function() {
      getNews( $( this ).attr("id") );
    });
}

//grabs news from NY times API

function getNews(id) {
  if($("#content"+id).length>0) {
     return
  }
  console.log(id.replace(/-/g,"+").replace(/_/g,""))
  var contentForDisplay = "<span id=\"content"+ id +"\"><ol>";
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
    $("#text"+id).append(contentForDisplay+"</ol></span>");
  }).fail(function(err) {
    throw err;
  });   
}


//Functions that run once the document is loaded
$(document).ready(function() {

  //Load in Google's Places API for autocomplete
  var input = document.getElementById('zip');
  autocomplete = new google.maps.places.Autocomplete(input);

  //see if data is stored and if so, format data from stored data.
  // if(localStorage["append"]) {
  //   $(".container").append(localStorage["append"])
  // }
  // event listener for panel groups
  $( ".panel-group" ).on( "click", function() {
    getNews($( this ).attr("id") );
  });
  // event listener for rep search form
  $( "#zipForm" ).submit(function( event ) {
      $(".repDisplay").remove()
    var zip = $("#zip" ).val()
    $("#zip" ).val("")
    getData(zip);
    event.preventDefault();
  });
});
