

function getData (zip) {
  var key = "AIzaSyCZJ6S0JHvG9JwJWVK6H0ujFwBM0IXX0jw";
  var address = zip;
  var url = "https://www.googleapis.com/civicinfo/v2/representatives?address="+address+"&key="+key;
  var count=0
  var data;
  var appendData = "";

  $.getJSON(url, function(data){
    console.log(data);
    appendData+="<div class=\"repDisplay\">"  ;
    
    for (division in data.divisions) {
      if (count>0) {
        appendData+="</div>";
      }
      count++;
      appendData +="<div class=division><h1>"+data.divisions[division].name+"</h1>";
      data.divisions[division].officeIndices.forEach(function(office){
        data.offices[office].officialIndices.forEach(function(official){
          var officialName = "";
          var officialContact = "";
          var officialPhone = "";
          var website = "";
          var photo = "";
          var socialMedia="<div class=\"col-sm-3\"><h4> Social Media</h4><ul>";

          officialName = data.officials[official].name +" (" + data.officials[official].party[0] +") ";
          if (data.officials[official].phones) {
            officialPhone = "<div class=\"phone\"> Phone: " + data.officials[official].phones[0] + "</div>"
          }
          if (data.officials[official].channels) {
            socialMedia += data.officials[official].channels[0] ? "<li>"+ data.officials[official].channels[0].type +": "+ data.officials[official].channels[0].id + "</li>" : "";
            socialMedia += data.officials[official].channels[1] ? "<li>"+ data.officials[official].channels[1].type +": "+ data.officials[official].channels[1].id + "</li>" : "";
            socialMedia += data.officials[official].channels[2] ? "<li>"+ data.officials[official].channels[2].type +": "+ data.officials[official].channels[2].id + "</li>" : "";
            socialMedia+="</ul></div>";
          }
          if(data.officials[official].address) {
            officialContact += data.officials[official].address[0].line1 ? data.officials[official].address[0].line1 + ", " : "";
            officialContact += data.officials[official].address[0].line2 ? data.officials[official].address[0].line2 + ", "  : "";
            officialContact += data.officials[official].address[0].city + ", " + data.officials[official].address[0].state + "&nbsp;&nbsp;" + data.officials[official].address[0].zip
          }
          if(data.officials[official].urls) {
            website = "<div class=\" website\"><p><a href=\"" + data.officials[official].urls[0] + "\"> Website </a></p></div>";
          }
          
          appendData +="<div class=\"rep\"><h3 class=\"position\">"+data.offices[office].name+": " + officialName + "</h3>"
          
          if(data.officials[official].photoUrl) {
            photo=data.officials[official].photoUrl;
            appendData += "<div class=\"row\"><div class=\" col-sm-3 photo\"><img id = \"repPhoto\" src=\"" + photo + "\" alt=\" Photo of Rep\" class=\"img-thumbnail\"></div>"
          } else {
            photo = "http://i.imgur.com/iMTIAcQ.jpg"
            appendData += "<div class=\"row\"><div class=\" col-sm-3 photo\"><img id = \"repPhoto\" src=\"" + photo + "\" alt=\" Photo of Rep\" class=\" img-thumbnail\"></div>"
          }
          appendData+="<div class=\" col-sm-3 address\"> <h4> Mailing Address </h4><p>"+officialContact+ "</p></div><div class=\" contact col-sm-3\"><h4> Contact </h4> <p>" +officialPhone + website + " </p></div>"+socialMedia+"</div></div>"
        })
      })      
    }
    appendData+="</div>"
    $(".container").append(appendData);
    localStorage['append'] = appendData;
  }) 
}

$(document).ready(function() {
  if(localStorage["append"]) {
  $(".container").append(localStorage["append"]);
}
  $( "#zipForm" ).submit(function( event ) {
      $(".repDisplay").remove()
    console.log("test")
    var zip = encodeURIComponent($("#zip" ).val())
    $("#zip" ).val("")
    getData(zip);
      event.preventDefault();
  });
})
