var ServiceSearch = (function() {
	var	map,
		infowindow;

	function getLongLat (address) {
		//Calls google maps geocode api to convert the user inputted address into latitude and longitude.
		//If a location is found call the displayMap function with lat and long, otherwise display an error message
		$.ajax({
	        dataType: "json",
	        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address
	    }).done(function (data) {
	    	if(data.results[0]){
	    		var lat = data.results[0].geometry.location.lat,
	    			lng = data.results[0].geometry.location.lng;    		
	    		displayMap(lat, lng);
	    	} else {
	    		$("#noLocation, .sr_flex").addClass('show');
	    	}    	
	    }).fail(function(err) { console.log(err); })
	}
	function displayMap(lat, lng) {	
		//Calls the seeclickfix requests api with the user provided address, centers the map, and displayServices with the response from seeclickfix
		$.getJSON('https://seeclickfix.com/open311/v2/requests.json?lat=' + lat + "&long=" + lng + "&callback=?", function(json, textStatus) {
				map.setCenter({lat: lat, lng: lng})
				displayServices(json);
		});
	}
	function displayServices(myData) {
		function createMarker(service) {
			//This function uses the response from seeclickfix to build out the content for an info window. 
			//Since not all of the services requests have values for all of the properties I'm using I added a few if statements to just leave out sections that have no data
			//After the content string is built this creates a new marker at the location of the request and gives it a click event that opens the info window
			var contentString = '<div class="infoWindow">'+
	      							'<h2 class="infoWindow_h2">'+ service.address + '</h2>';

	      	if(service.media_url) {
	      		contentString += '<img class="infoWindow_img" src="' + service.media_url + '" alt="" />' 
	      	}

	      	contentString += '<div class="infoWindow_block">'

	      	if(service.service_name) {
	      		contentString += '<h3 class="infoWindow_h3">Request Name</h3>' +
	      						 '<p class="infoWindow_p">' + service.service_name + '</p>';
	      	}
	      	if(service.description) {
	      		contentString += '<h3 class="infoWindow_h3">Description</h3>' +
	      							'<p class="infoWindow_p">' + service.description + '</p>';
	      	}
	      	contentString += '<h3 class="infoWindow_h3">Request Status</h3>' +
	      							'<p class="infoWindow_p">' + service.status + '</p>' + '</div></div>';
	      							
		    var marker = new google.maps.Marker({
		          position: {lat: service.lat, lng: service.long},
		          map: map,
		          title: service.address
		    });
		    marker.addListener('click', function() {
			    infowindow.close();
			    infowindow.setContent(contentString);
			    infowindow.open(map, marker);
		    });
		}
		
	    if(myData.length > 0) { //check that the location has at least 1 request
			myData.forEach(createMarker); 
	    } else { //Displays no request error message
	    	$("#noRequests, .sr_flex").addClass('show');
	    }
	}

	function initializeMap() {
		map = new google.maps.Map(document.getElementById('map'), {
	          center: {lat: 40.79899700000001 , lng: -74.4814291},
	          zoom: 17
	    }); //Initialize map and center it in Morristown NJ	    
		infowindow = new google.maps.InfoWindow(); //Initialize google maps infowindow
		displayMap(40.79899700000001, -74.4814291);//Show markers
	    function addressSearch() {
	    	var $myAddress = $("#myAddress");
	    	if($myAddress.val()) {
	    		getLongLat($myAddress.val());
	    		$myAddress.val("");
	    		$(".errorMessage, .sr_flex").removeClass('show');
	    	}
	    }
	    $("#serviceSearch").click(addressSearch);
		$(document).keypress(function(event) {
			if(event.keyCode === 13) {
				addressSearch();
			}
		})
	}
	return {
		init: function() {
			initializeMap();
		}
	}
	
})();
$( document ).ready(function() {
	ServiceSearch.init();
});






