;(function($) {

	$.fn.getWeather  = function(options) {

    // define default parameters
		var defaults = {
			city: null,
			lat: null,
			lng: null,
			success: function() {},
			error: function(message) {}
		}

    var weekday = new Array(7);
    weekday[0]=  "Sun";
    weekday[1] = "Mon";
    weekday[2] = "Tue";
    weekday[3] = "Wed";
    weekday[4] = "Thu";
    weekday[5] = "Fri";
    weekday[6] = "Sat";

    // define plugin
		var plugin = this;

    // define settings
		plugin.settings = {}

		// merge defaults and options
		plugin.settings = $.extend({}, defaults, options);

		// define settings namespace
		var s = plugin.settings;

		// api URL
		var weatherapiURL = '//api.openweathermap.org/data/2.5/weather';
    var forecastapiURL = '//api.openweathermap.org/data/2.5/forecast';

    // api KEY
    var apiKey = '7fd41f19a38aef8c063c85045eed7b29';

    // set temperature in Celsius
    var unitFormat = 'metric';

    // if city isn't null
		if(s.city != null) {

  		// define API urls using city
  		weatherapiURL += '?q='+s.city+'&units='+unitFormat+'&appid='+apiKey;
      forecastapiURL += '?q='+s.city+'&units='+unitFormat+'&appid='+apiKey;

		} else if(s.lat != null && s.lng != null) {

			// define API urls using lat and lng
			weatherapiURL += '?lat='+s.lat+'&lon='+s.lng+'&units='+unitFormat+'&appid='+apiKey;
      forecastapiURL += '?lat='+s.lat+'&lon='+s.lng+'&units='+unitFormat+'&appid='+apiKey;
		}

		// If all went well
    var showWeather = function() {

			// Fadeout the loader
			$('.weatherloader').delay(1000).fadeOut( 400 );
			$('body').addClass('weather-forecast');

			// hide search form
			$('.search-form').hide();

			// Show the fav icon
			$('.fav').html('Add to Favorites <svg class="icon-fav"><use xlink:href="assets/sprite.svg#favorites"></use></svg>') ;

			// Show the weather forecast
			$('.current-weather').addClass('show');
			$('.weather-forecasts').addClass('show');
      $('.current-weather').show();
      $('.weather-forecasts').show();
    }

		// If something went wrong
    var weatherFailure = function() {
      $('.current-weather').hide();
      $('.weather-forecasts').hide();
			$('.error-message').show();
    }

		// Find the current day
	  var d = new Date();
	  var today = d.getDate();

	  var forecasthtml = '';
	 	var todayhtml = '';

		// Calls for Current weather data and 5day forecast
    $.when(
      $.ajax({
  			type: 'GET',
  			url: weatherapiURL,
  			dataType: 'jsonp',
  			success: function(data) {
          console.log(data);

					// Build the current weather forecast
					todayhtml += '<div class="text-center">';
					todayhtml += '<div class="today fontlight">Today</div>';
					todayhtml += '<h1 class="city-name">'+data.name + ', ' + data.sys.country+'</h1>';
					todayhtml += '<i class="weathericon icon-'+data.weather[0].icon+'"></i>';
					todayhtml += '<div class="maxtemp-today">'+Math.round(data.main.temp_max)+' <sup>o</sup>C</div>';
					todayhtml += '<div class="mintemp-today">'+Math.round(data.main.temp_min)+' <sup>o</sup>C</div>';
					todayhtml += '</div>';
					$(".current-weather").append(todayhtml);

          // run success callback
  				s.success.call(this);
        },
        error: function(jqXHR, textStatus, errorThrown) {

          // run error callback
          s.error.call(this, textStatus);
        }
      }),
      $.ajax({
  			type: 'GET',
  			url: forecastapiURL,
  			dataType: 'jsonp',
  			success: function(data) {
          console.log(data);

					// Build the 5day weather forecast
          for (i = 0; i < data.cnt; i++) {
            var date = new Date(data.list[i].dt_txt);

            var day  = date.getDate();
            var dayName = date.getDay();
            var hour = date.getHours();

            var mindaytemp;
            var maxdaytemp;

            if (day != today) {

              //init the temperatures when start a new day forecast
              if( hour === 0) {
                mindaytemp = data.list[i].main.temp_min;
                maxdaytemp = data.list[i].main.temp_max;
                forecasthtml = '';
              }

              //That's the last forecast for the this day.
              else if(hour === 21 || (i + 1) === data.cnt) {
                forecasthtml += '<div class="forecastday text-center">';
                forecasthtml += '<h3 class="day fontlight">'+weekday[dayName]+'</h3>';
                forecasthtml += '<i class="weathericon icon-'+weathericon+'"></i>';
                forecasthtml += '<div class="max-temp">'+Math.round(maxdaytemp)+' <sup>o</sup>C</div>';
                forecasthtml += '<div class="min-temp">'+Math.round(mindaytemp)+' <sup>o</sup>C</div>';
                forecasthtml += '</div>';
                $(".weather-forecasts").append(forecasthtml);
              }
              else {

                //get the daily min temperature and daily max temperature
                if (mindaytemp > data.list[i].main.temp_min) { mindaytemp = data.list[i].main.temp_min; }
                if (maxdaytemp < data.list[i].main.temp_max) { maxdaytemp = data.list[i].main.temp_max; }

                //get the weather forecast icon from the middle day forecast
                if(hour === 12) { var weathericon = data.list[i].weather[0].icon; }
            	}
            }
          }

          // run success callback
  				s.success.call(this);
        },
        error: function(jqXHR, textStatus, errorThrown) {

          // run error callback
          s.error.call(this, textStatus);
        }
      })
    )
    .then( showWeather, weatherFailure );
}


var start = new Date();

$(window).on('load', function (e) {

	// Display the loader for at least two sec (2000)
 	var loadduration = (new Date() - start);
	if (loadduration < 2000 ) {
			$('.homeloader').delay( 2000 - loadduration).fadeOut(400);
	}
	else {
			$('.homeloader').fadeOut(400);
	}

	// Mouse click event , show weather by city name
	$('.btn-search').click(function() {
		$('.search-form').fadeOut( 400 );
		$('.weatherloader').css( "display", "block" );

		var cityinput = $('.search-input').val();

		// Call the function to get the weather forecast
		$('.current-weather').getWeather({
				city: cityinput
		});
	});

	// Check if the user presses enter to the input
	$('.search-input').keypress(function(e){
        if(e.which == 13){
            $('.btn-search').click();
        }
  });

	// Show weather by geolocation
	$('.btn-geo').click(function() {
		$('.search-form').fadeOut( 400 );
		$('.weatherloader').css( "display", "block" );

		if(navigator.geolocation) {
			var showPosition = function(position) {
					$('.current-weather').getWeather({
							lat: position.coords.latitude,
							lng: position.coords.longitude
					});
			}
			navigator.geolocation.getCurrentPosition(showPosition);
		}
		else {
			var zip = window.prompt("Could not discover your location.");
		}
	 });

});

})(jQuery);
