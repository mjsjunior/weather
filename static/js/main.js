$(document).ready(function(){
	 // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal();
	altura = $(document).height();
	api = "http://api.openweathermap.org/data/2.5/";
	endPoint = "APPID=231bdedaf245423d58c78e595650cfcb";
	limiteCidades = 10;
	getLocation();
	function getLocation() {
	    if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(init, showError);
	        
	    } else { 
	        alert('Seu navegador não suporta geolocation');
	        createMap(-21.22583,-43.77);
	    }
	}

	function init(position){
		createMap(position.coords.latitude,position.coords.longitude)
	}

	function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.")
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.")
            break;
	    }
	}
	
	$('#buscarCidade').submit(function(){
	
		var cidade = $('#cidade').val();
		$('#cidade').blur();
		var urlBuscar = api+"weather?q="+cidade+"&units=metric&"+endPoint;
		 $.get(urlBuscar, function(data) {
			 if(data['cod'] == '404')
			 {
				 alert('Cidade nao existe');
			 }else{
				  var lat = data['coord']['lat'];
				  var lon = data['coord']['lon']
					  var url = api+"find?lat="+lat+"&lon="+lon+"&cnt=15"+"&units=metric&"+endPoint
						$.get(url, function(data) {
						  var cidade = data['name'];			  
						  var date = new Date(data['list'][0]['sys']['sunrise']);
						  var img = "http://openweathermap.org/img/w/"+data['list'][0]['weather'][0]['icon']+".png"
						  montarApresentacao(lat,lon,cidade,date,img,data);
						})
						.fail(function() {
							alert( "error" );
						})
						
				}
				
		 })
		 .fail(function() {
			alert( "error buscar cidade nome" );
		});
		
		
		return false;
	})

	function createMap(lat,lon) {
		    var url = api+"find?lat="+lat+"&lon="+lon+"&cnt="+limiteCidades+""+"&units=metric&"+endPoint
		    $.get(url, function(data) {
		    	if(data['cod'] == '404')
			 {
				 alert('Erro ao montar o mapa...');
			 }else{
					  var cidade = data['name'];			  
					  var date = new Date(data['list'][0]['sys']['sunrise']);
					  var img = "http://openweathermap.org/img/w/"+data['list'][0]['weather'][0]['icon']+".png"
					  montarApresentacao(lat,lon,cidade,date,img,data);
					}
				})
			  
		  .fail(function() {
		    alert( "error" );
		  })  	
	}

	function montarApresentacao(lat,lon,cidade,date,img,data)
	{

		var latlng = new google.maps.LatLng(lat,lon);
	    var options = {
	        zoom: 11,
			center: latlng,
	        mapTypeId: google.maps.MapTypeId.ROADMAP,
	        mapTypeControl: true,
		    mapTypeControlOptions: {
		      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
		      mapTypeIds: [
		        google.maps.MapTypeId.ROADMAP,
		        google.maps.MapTypeId.TERRAIN
		      ]
		    },
		    zoomControl: true,
		    zoomControlOptions: {
		      style: google.maps.ZoomControlStyle.SMALL,
		      position: google.maps.ControlPosition.RIGHT_CENTER
		    }
	    };
	    $('#mapa').css('height',altura)
	    map = new google.maps.Map(document.getElementById("mapa"), options);

		$.each(data['list'],function(index,cidade){
			var img = "http://openweathermap.org/img/w/"+cidade['weather'][0]['icon']+".png"
			
			var marker = new google.maps.Marker({
	            position: new google.maps.LatLng(cidade['coord']['lat'],cidade['coord']['lon']),
	     
	            map: map,
	            animation: google.maps.Animation.DROP,
	            icon: img
		    });

			
		   marker.addListener('click', function() {
				createModal(cidade);
			
		  });
		})


		function createModal(cidade){
			$('#previsaoDias').empty();
			var url = api+"weather?id="+cidade['id']+"&units=metric&"+endPoint
			//var url = api+"weather?q="+cidade['nome']+"&units=metric&"+endPoint
			$.get(url,function(data){
				if(data['cod'] != '404')
				{
				 	sunrise = datahorario(new Date(data['sys']['sunrise']*1000));
				 	sunset = datahorario(new Date(data['sys']['sunset']*1000));
				 	name = data['name']
				 	temp = data['main']['temp']

				 	
				 	url = api+"forecast/daily?id="+cidade['id']+"&units=metric&cnt=7&"+endPoint
				 	//url = api+"forecast/daily?q="+cidade['name']+"&units=metric&cnt=7&"+endPoint
				    $.get(url, function(data) {
				    		console.log(data)
					  var cidade = data['city'];
					  var dias = data['list']
						  if(data['cod'] == '404'){
						  	$('#erro').click();
						  }else{
						  	  $('#nomeCidade').text(name);
							  $.each(dias,function(i,dia){
							  		var diaHtml = '<li class="collection-item avatar">'+
						                '<img src="${imgUrl}" alt="" class="circle">'+
						                '<span class="title">${data}</span>'+
						                '<p>Temp. Máx: ${tempMax} <br> Temp. Min: ${tempMin} </p>'+
						                ''+
						              '</li>';

							  		if(i != 0)
							  		{  	
								  	  console.log(dataFormatada(new Date(dia['dt']*1000)));
									  var data = new Date(dia['dt']*1000)
									  var img = "http://openweathermap.org/img/w/"+dia['weather'][0]['icon']+".png"
									  diaHtml = diaHtml.replace('${imgUrl}',img)
									  diaHtml = diaHtml.replace('${data}',dataFormatada(data))
									  diaHtml = diaHtml.replace('${tempMax}',Math.ceil(dia['temp']['max'])+' °c')
									  diaHtml = diaHtml.replace('${tempMin}',Math.ceil(dia['temp']['min'])+' °c')
									 
									  $('#previsaoDias').append(diaHtml); 
									}
							 	 });
							    	$('#latlon').text('Lat: '+cidade['coord']['lat']+' ; Lon: '+cidade['coord']['lon'])
									$('#sunrise').text(sunrise);
									$('#sunset').text(sunset);
									$('#tempAtual').text(temp)
							  		$('#clickCidade').click();
							}//else
						})
						.fail(function(){
							alert('erro');
						})
				}else{
					$('#erro').click();
				}
			})
			  .fail(function() {
			    alert( "error" );
			  })	
		}
		
		
		function dataFormatada(data){
			var dia = data.getDate();
			if (dia.toString().length == 1)
			  dia = "0"+dia;
			var mes = data.getMonth()+1;
			if (mes.toString().length == 1)
			  mes = "0"+mes;
			var ano = data.getFullYear();  
			return dia+"/"+mes;
		}


		function datahorario(data){
			hora = ''+data.getHours();
			min = ''+data.getMinutes();
			if(hora.length == 1)
				hora = '0'+hora

			if(min.length == 1)
				min = '0'+min
  
			return hora+":"+min;
		}
	    
	    function toggleBounce() {
		  if (marker.getAnimation() !== null) {
		    marker.setAnimation(null);
		  } else {
		    marker.setAnimation(google.maps.Animation.BOUNCE);
		  }
		}


	    

	 
		/*var html = "<div class='mapa'><p>Cidade: ${cidade}</p><p><img src='${img}' /></p></div>"
		html = html.replace("${cidade}",cidade);
		html = html.replace("${img}",img);
		$('#mensagem').html(html);*/
	}
})