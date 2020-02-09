/* eslint-disable no-undef */
$(() => {
  $('.image-wrapper').slick({
    autoplay: true,
    autoplaySpeed: 2000,
    fade: true,
    cssEase: 'linear'
  });
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success);
    } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
    }
  }
  function success(pos) {
    var location = pos.coords;
    console.log(window.location.pathname);
    
    if(window.location.pathname === '/') {
      fetch('/', {
        method: 'POST',
        body: JSON.stringify({latitude: location.latitude, longitude: location.longitude}),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(function (response) {
        return response.text()
      })
          .then(function (data) {
            $('.post h2').after(data)
          })
    }
  }
  getLocation()


  $('input').on('focus',()=>{
    $('p.error').remove();
    $('input').removeClass('error');
    $('.search-wrapper').removeClass('error-class')
    $('.error-string').hide()
  })

});

/* eslint-enable no-undef */
function initialize() {

  var options = {
    types: ['(cities)'],
    fields:['geometry'],
    strictBounds: true,

  };

  var input = document.getElementById('place-search');
  var autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
     alert("Autocomplete's returned place contains no geometry");
      return;
    }
    var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"/admin");
    f.setAttribute('id',"form-search");

    var i = document.createElement("input");
    i.setAttribute('type',"text");
    i.setAttribute('name',"longitude");
    i.setAttribute('value',place.geometry.location.lng());

    var s = document.createElement("input");
    s.setAttribute('type',"text");
    s.setAttribute('name',"latitude");
    s.setAttribute('value',place.geometry.location.lat());

    f.appendChild(i);
    f.appendChild(s);
    document.body.appendChild(f)

    f.submit()
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
