


function getData (zip) {
  var key = "AIzaSyCZJ6S0JHvG9JwJWVK6H0ujFwBM0IXX0jw";
  var address = zip;
  var url = "https://www.googleapis.com/civicinfo/v2/representatives?address="+address+"&key="+key;
  var count=0
  var data;
  var appendData = "";
  var collapseId=0;
  $.getJSON(url, function(data){
    console.log(data);
    appendData+="<div class=\"repDisplay\">"  ;
    for (division in data.divisions) {
      appendData +="<div class=division><h1>"+data.divisions[division].name+"</h1>";
      data.divisions[division].officeIndices.forEach(function(office){
        data.offices[office].officialIndices.forEach(function(official){
          var officialName = data.officials[official].name +" (" + data.officials[official].party[0] +") ";
          var officialContact = "";
          var officialPhone = "";
          var website = "";
          var photo = "";
          var socialMedia="<div class=\"col-sm-3\"><h4> Social Media</h4><ul>";
          var newsButton =  "<div class=\"row\"><div class=\"panel-group\" id=\""+ data.officials[official].name.replace(/ /g,"-").replace(/\./g,"_")+"\" role=\"tablist\" aria-multiselectable=\"true\"><div class=\"panel panel-default\"><div class=\"panel-heading\" role=\"tab\" id=\"heading"+collapseId+"\"><h4 class=\"panel-title\"><a role=\"button\" data-toggle=\"collapse\" data-parent=\"#"+ data.officials[official].name.replace(/ /g,"-").replace(/\./g,"_")+"\" href=\"#collapse"+collapseId+"\" aria-expanded=\"true\" aria-controls=\"collapse"+collapseId+"\">News</a></h4></div><div id=\"collapse"+collapseId+"\" class=\"panel-collapse collapse\" role=\"tabpanel\" aria-labelledby=\"headingOn\"><div class= \"panel-body\"id=\"text"+ data.officials[official].name.replace(/ /g,"-").replace(/\./g,"_")+"\"></div></div></div></div></div>"
          collapseId++;
          if (data.officials[official].phones) {
            officialPhone = "<div class=\"phone\"> Phone: " + data.officials[official].phones[0] + "</div>"
          }
          if (data.officials[official].channels) {
            socialMedia += data.officials[official].channels[0] ? "<li>"+ data.officials[official].channels[0].type +": "+ data.officials[official].channels[0].id + "</li>" : "";
            socialMedia += data.officials[official].channels[1] ? "<li>"+ data.officials[official].channels[1].type +": "+ data.officials[official].channels[1].id + "</li>" : "";
            socialMedia += data.officials[official].channels[2] ? "<li>"+ data.officials[official].channels[2].type +": "+ data.officials[official].channels[2].id + "</li>" : "";
            socialMedia+="</ul></div>";
          }
          else {
            socialMedia+="</div>"
          }
          if(data.officials[official].address) {
            officialContact += data.officials[official].address[0].line1 ? data.officials[official].address[0].line1 + ", " : "";
            officialContact += data.officials[official].address[0].line2 ? data.officials[official].address[0].line2 + ", "  : "";
            officialContact += data.officials[official].address[0].city + ", " + data.officials[official].address[0].state + "&nbsp;&nbsp;" + data.officials[official].address[0].zip
          }
          if(data.officials[official].urls) {
            website = "<div class=\" website\"><p><a href=\"" + data.officials[official].urls[0] + "\"> Website </a></p></div>";
          }
          
          appendData +="<div class=\"rep\"><h3 class=\"position\">"+data.offices[office].name+": " + officialName + "</h3>";
          
          if(data.officials[official].photoUrl) {
            photo=data.officials[official].photoUrl;
            appendData += "<div class=\"row\"><div class=\" col-sm-3 photo\"><img id = \"repPhoto\" src=\"" + photo + "\" alt=\" Photo of Rep\" class=\"img-thumbnail\"></div>"
          } else {
            photo = "http://i.imgur.com/iMTIAcQ.jpg"
            appendData += "<div class=\"row\"><div class=\" col-sm-3 photo\"><img id = \"repPhoto\" src=\"" + photo + "\" alt=\" Photo of Rep\" class=\" img-thumbnail\"></div>"
          }
          appendData+="<div class=\" col-sm-3 address\"> <h4> Mailing Address </h4><p>" + officialContact + "</p></div><div class=\" contact col-sm-3\"><h4> Contact </h4> <p>" +officialPhone + website + " </p></div>"+socialMedia+"</div>"+newsButton+"</div>"
        })
      })
    appendData+="</div>" 
    }
    appendData+="</div>"
    $(".container").append(appendData);
    $( ".panel-group" ).on( "click", function() {
      getNews( $( this ).attr("id") );
    });
    localStorage['append'] = appendData;
  }) 
}

function getNews(id) {
  if($("#content"+id).length>0) {
     return
  }
  var contentForDisplay = "<span id=\"content"+ id +"\"><ol>";
  var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
  url += '?' + $.param({
    'api-key': "b3947cbe5bfb4ffeac69be6569aa335f",
    'q': encodeURIComponent(id.replace(/-/g," ").replace(/_/g,".")),
    'sort': "newest"
  });
  $.ajax({
    url: url,
    method: 'GET',
  }).done(function(result) {
    result.response.docs.forEach(function (article) {
      contentForDisplay += "<li><a href="+ article.web_url+">"+ article.headline.main+"</a></li>"
    })
    $("#text"+id).append(contentForDisplay+"</ol></span>");
  }).fail(function(err) {
    throw err;
  });   
}

$(document).ready(function() {
  if(localStorage["append"]) {
    $(".container").append(localStorage["append"]);
  }
  $( ".panel-group" ).on( "click", function() {
    getNews($( this ).attr("id") );
  });
  $( "#zipForm" ).submit(function( event ) {
      $(".repDisplay").remove()
    var zip = $("#zip" ).val()
    $("#zip" ).val("")
    getData(zip);
      event.preventDefault();
  });
});
