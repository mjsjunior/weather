$(document).ready(function(){
	 // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal();
	altura = $(document).height();
	api = "http://api.openweathermap.org/data/2.5/";
	endPoint = "APPID=231bdedaf245423d58c78e595650cfcb";
	limiteCidades = 20;
	getLocation();
	function getLocation() {
	    if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(function(position){
	        	createMap(position.coords.latitude,position.coords.longitude)
	        });
	        
	    } else { 
	        createMap(10,10);
	    }
	}
	
	$('#buscarCidade').submit(function(){
	
		var cidade = $('#cidade').val();
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
			  var cidade = data['name'];			  
			  var date = new Date(data['list'][0]['sys']['sunrise']);
			  var img = "http://openweathermap.org/img/w/"+data['list'][0]['weather'][0]['icon']+".png"
			  montarApresentacao(lat,lon,cidade,date,img,data);
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
			mapTypeControl: true,
			mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
				position: google.maps.ControlPosition.TOP_CENTER
			},
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.LEFT_CENTER
			},
			scaleControl: true,
			streetViewControl: true,
			streetViewControlOptions: {
				position: google.maps.ControlPosition.LEFT_TOP
			},
	        center: latlng,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    $('#mapa').css('height',altura)
	    map = new google.maps.Map(document.getElementById("mapa"), options);

		$.each(data['list'],function(index,cidade){
			var img = "http://openweathermap.org/img/w/"+cidade['weather'][0]['icon']+".png"
			
			var marker = new google.maps.Marker({
	            position: new google.maps.LatLng(cidade['coord']['lat'],cidade['coord']['lon']),
	            labelContent: "$425K",
		       labelAnchor: new google.maps.Point(22, 0),
		       labelClass: "labels", // the CSS class for the label
		       labelStyle: {opacity: 0.75},
	            map: map,
	            icon: img
		    });

			var conteudo = '<h5> '+cidade['name']+' </h5>'+
			'<p>Temp: '+cidade['main']['temp_max']+'°C</p>';
		    var infowindow = new google.maps.InfoWindow({
			    content: conteudo
			  });
			  
			  
			

		   marker.addListener('click', function() {
				createModal(cidade);
		  });
		})


		function createModal(cidade){
			
			

			var url = api+"forecast/daily?lat="+cidade['coord']['lat']+"&lon="+cidade['coord']['lon']+"&units=metric&cnt=7&"+endPoint
		    $.get(url, function(data) {
			  var cidade = data['city'];
			  var dias = data['list']
			  $.each(dias,function(i,dia){
				  	var diaHtml = '<li class="collection-item avatar">'+
	                '<img src="${imgUrl}" alt="" class="circle">'+
	                '<span class="title">${data}</span>'+
	                '<p>Temp. Máx: ${tempMax} <br> Temp. Min: ${tempMin} </p>'+
	                '<a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>'+
	              '</li>';
			  		console.log(dataFormatada(new Date(dia['dt']*1000)));
				  var data = new Date(dia['dt']*1000)
				  var img = "http://openweathermap.org/img/w/"+dia['weather'][0]['icon']+".png"
				  diaHtml = diaHtml.replace('${imgUrl}',img)
				  diaHtml = diaHtml.replace('${data}',dataFormatada(data))
				  diaHtml = diaHtml.replace('${tempMax}',dia['temp']['max'])
				  diaHtml = diaHtml.replace('${tempMin}',dia['temp']['min'])
				  $('#previsaoDias').append(diaHtml); 
			  });
			})
			  
		  .fail(function() {
		    alert( "error" );
		  })
			
			
			$('#nomeCidade').text(cidade['name']);
			$('.modal-trigger').click();
		}
		
		
		function dataFormatada(data){
			var dia = data.getDate();
			if (dia.toString().length == 1)
			  dia = "0"+dia;
			var mes = data.getMonth()+1;
			if (mes.toString().length == 1)
			  mes = "0"+mes;
			var ano = data.getFullYear();  
			return dia+"/"+mes+"/"+ano;
		}
	    
	    


	    

	 
		/*var html = "<div class='mapa'><p>Cidade: ${cidade}</p><p><img src='${img}' /></p></div>"
		html = html.replace("${cidade}",cidade);
		html = html.replace("${img}",img);
		$('#mensagem').html(html);*/
	}
})