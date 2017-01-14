//based on https://github.com/nenadg/twitter-stream-visualization/blob/master/public/js/default.js

var geomaniac = (function(){

	var width = window.innerWidth - 304,
		height = window.innerHeight - 4,
		startCountry = "India",
		globe, land, countries, borders, features, cities, scale = 1, moved = true,
		wasMoved = [], clickPoints = [], dragging, zoom, drag,
		mapLocations = [];

	var orthographic = function(){
		var citypoints = [{ city: 'Delhi, India', desc: 'I\'ve spent most of my life in Delhi, and completed my schooling here.', radius: 3, type: 0, latitude: 28.7041, longitude: 77.1025 }, { city: 'Singapore, Singapore', desc: '', radius: 3, type: 0, latitude: 1.3521, longitude: 103.8198 }, { city: 'Dallas, USA', desc: '', radius: 3, type: 0, latitude: 32.7767, longitude: -96.7970 }, { city: 'Palo Alto, USA', desc: '', radius: 3, type: 0, latitude: 37.4419, longitude: -122.1430 }, { city: 'Chapel Hill, USA', desc: '', radius: 3, type: 0, latitude: 35.9132, longitude: -79.0558 }, { city: 'Washington DC, USA', desc: '', radius: 3, type: 0, latitude: 38.9072, longitude: -77.0369 }, { city: 'New York, USA', desc: '', radius: 3, type: 0, latitude: 40.7128, longitude: -74.0059 }, { city: 'Nashville, USA', desc: '', radius: 3, type: 0, latitude: 36.1627, longitude: -86.7816 }, { city: 'Charlotte, USA', desc: '', radius: 3, type: 0, latitude: 35.2271, longitude: -80.8431 }, { city: 'Phoenix, USA', desc: '', radius: 3, type: 0, latitude: 33.4484, longitude: -112.0740 }, { city: 'San Diego, USA', desc: '', radius: 3, type: 0, latitude: 32.7157, longitude: -117.1611 }, { city: 'Los Angeles, USA', desc: '', radius: 3, type: 0, latitude: 34.0522, longitude: -118.2437 }, { city: 'Chicago, USA', desc: '', radius: 3, type: 0, latitude: 41.8781, longitude: -87.6298 }, { city: 'Philadelphia, USA', desc: '', radius: 3, type: 0, latitude: 39.9526, longitude: -75.1652 }, { city: 'New Haven, USA', desc: '', radius: 3, type: 0, latitude: 41.3083, longitude: -72.9279 }, { city: 'Ann Arbor, USA', desc: '', radius: 3, type: 0, latitude: 42.2808, longitude: -83.7430 }, { city: 'Seattle, USA', desc: '', radius: 3, type: 0, latitude: 47.6062, longitude: -122.3321 }, { city: 'Las Vegas, USA', desc: '', radius: 3, type: 0, latitude: 36.1699, longitude: -115.1398 }, { city: 'Atlanta, USA', desc: '', radius: 3, type: 0, latitude: 33.7490, longitude: -84.3880 }, { city: 'Miami, USA', desc: '', radius: 3, type: 0, latitude: 25.7617, longitude: -80.1918 }, { city: 'Orlando, USA', desc: '', radius: 3, type: 0, latitude: 28.5383, longitude: -81.3792 }, { city: 'Daytona Beach, USA', desc: '', radius: 3, type: 0, latitude: 29.2108, longitude: -81.0228 }, { city: 'Pune, India', desc: '', radius: 3, type: 0, latitude: 18.5204, longitude: 73.8567 }, { city: 'Bangalore, India', desc: '', radius: 3, type: 0, latitude: 12.9716, longitude: 77.5946 }, { city: 'Chennai, India', desc: '', radius: 3, type: 0, latitude: 13.0827, longitude: 80.2707 }, { city: 'Mumbai, India', desc: '', radius: 3, type: 0, latitude: 19.0760, longitude: 72.8777 }, { city: 'Muzaffarnagar, India', desc: '', radius: 3, type: 0, latitude: 29.4727, longitude: 77.7085 }, { city: 'Chandigarh, India', desc: '', radius: 3, type: 0, latitude: 30.7333, longitude: 76.7794 }, { city: 'Kochi, India', desc: '', radius: 3, type: 0, latitude: 9.9312, longitude: 76.2673 }, { city: 'Boston, USA', desc: '', radius: 3, type: 0, latitude: 42.3601, longitude: -71.0589 }, { city: 'Yogyakarta, Indonesia', desc: '', radius: 3, type: 0, latitude: -7.7956, longitude: 110.3695 }, { city: 'Bali, Indonesia', desc: '', radius: 3, type: 0, latitude: -8.6705, longitude: 115.2126 }, { city: 'Pondicherry, India', desc: '', radius: 3, type: 0, latitude: 11.9139, longitude: 79.8145 }, { city: 'Leh, India', desc: '', radius: 3, type: 0, latitude: 34.1526, longitude: 77.5771 }, { city: 'Jaipur, India', desc: '', radius: 3, type: 0, latitude: 26.9124, longitude: 75.7873 }, { city: 'Ranthambore, India', desc: '', radius: 3, type: 0, latitude: 26.0173, longitude: 76.5026 }, { city: 'Corbett, India', desc: '', radius: 3, type: 0, latitude: 29.5300, longitude: 78.7747 }, { city: 'Binsar, India', desc: '', radius: 3, type: 0, latitude: 29.7054, longitude: 79.7552 }, { city: 'Shimla, India', desc: '', radius: 3, type: 0, latitude: 31.1048, longitude: 77.1734 }, { city: 'Nainital, India', desc: '', radius: 3, type: 0, latitude: 29.3803, longitude: 79.4636 }];
		citypoints.forEach(function(point) {
			var ft = {
                longitude: helpers.formatLocation([point.latitude,point.longitude]).straight[0],
                latitude: helpers.formatLocation([point.latitude,point.longitude]).straight[1],
                coords: [point.latitude,point.longitude],
                text: point.city,
                desc: point.desc
            }
            mapLocations.push(ft);
		});

		var animate = function() {

			requestAnimationFrame(animate);

			now = Date.now();
			elapsed = now - then;

			// if enough time has elapsed, draw the next frame
			if (elapsed > fpsInterval) {
				
				// Get ready for next frame by setting then=now, but...
				// Also, adjust for fpsInterval not being multiple of 16.67
				then = now - (elapsed % fpsInterval);

				if(moved){
					draw();
					moved = false;
				}
			}
		};

		var projection = d3.geo.orthographic()
			.scale(globeScale)
			.translate([width / 2, height / 2])
			.clipAngle(90)
			.precision(.1);
		var barProjection = d3.geo.orthographic()
			.scale(cloudScale)
			.translate([width / 2, height / 2])
			.clipAngle(90)
			.precision(.1);

		var canvas = d3.select("#content").append("canvas")
			.attr("width", width)
			.attr("height", height);

		var c = canvas.node().getContext("2d");


		var path = d3.geo.path()
			.projection(projection) // put barProjection for testing distances
			.pointRadius(1.5)
			.context(c);

		var graticule = d3.geo.graticule();

		var elem = document.querySelector('canvas'),
			elemLeft = elem.offsetLeft,
			elemTop = elem.offsetTop,
			context = elem.getContext('2d'),
			elements = [],
			lastCountryName = '',
			lastCountryGeometry = null;

		var draw = function(){
			
			// Store the current transformation matrix
			c.save();

			// Use the identity matrix while clearing the canvas
			c.setTransform(1, 0, 0, 1, 0, 0);
			c.clearRect(0, 0, width, height);

			// Restore the transform
			c.restore();

			// sea //003366'
			c.fillStyle = '#222', c.beginPath(), path.context(c)(globe), c.fill(), c.stroke();
			//graticule
			c.strokeStyle = "#333", c.lineWidth = .5, c.beginPath(), path.context(c)(graticule()), c.stroke();
			// land
			c.fillStyle = "#000", c.beginPath(), path.context(c)(land) /*path(land)*/, c.fill();
			// countries

			var protate = projection.rotate(),
				mouseCoords = projection.invert([mousepos.x, mousepos.y]),
				scaleLevel = zoom && zoom.scale() || 0;

			if(scaleLevel > 4)
				c.strokeStyle = "rgba(255, 255, 255, 0.4)", c.lineWidth = 1, c.beginPath(), path(borders), c.stroke();	

			// cities
			for(var i in cities){

				// no show
				//if(scaleLevel < 4)
				//	return;

				c.fillStyle = "#000", c.beginPath(), path(cities[i]), c.fill();

				var cds = cities[i].geometry.coordinates,
					xyFromCoordinates = projection([cds[0],cds[1]]);

				// mask and labels
				var longitude = Number(cds[0]) + 180,
					startLongitude = 360 - ((protate[0] + 270) % 360),
					endLongitude = (startLongitude + 180) % 360;

				if ((startLongitude < endLongitude && longitude > startLongitude && longitude < endLongitude) ||
						(startLongitude > endLongitude && (longitude > startLongitude || longitude < endLongitude))){
							// labels
							//c.font = '8px Monospace';
							//c.fillStyle = "#fb0", c.beginPath(), c.fillText(decodeURI(cities[i].properties.city).toUpperCase(), xyFromCoordinates[0], xyFromCoordinates[1]);
							//// white outline
							//c.fillStyle = 'rgba(144, 122, 122, 0.2)', c.beginPath(), c.fillRect(xyFromCoordinates[0] -1, xyFromCoordinates[1] -6, (decodeURI(cities[i].properties.city).toUpperCase().length * 5), 7);
				} else {
					//c.font = '5px Monospace';
					//c.fillStyle = "rgba(32, 45, 21, 0.2)", c.beginPath(), c.fillText(decodeURI(cities[i].properties.city).toUpperCase(), xyFromCoordinates[0], xyFromCoordinates[1]);
					//c.fillStyle = 'rgba(255, 255, 255, 0.0)', c.beginPath(), c.fillRect(xyFromCoordinates[0] -1, xyFromCoordinates[1] -6, (decodeURI(cities[i].properties.city).toUpperCase().length * 5), 7);
				}
			}

			// tweet spots
			for(var i in mapLocations){
				var mapLocation = mapLocations[i],
					loc = mapLocation? projection([mapLocation.longitude, mapLocation.latitude]): null;
				
				if(loc){
					var longitude = Number(mapLocation.longitude) + 180,
						startLongitude = 360 - ((protate[0] + 270) % 360),
						endLongitude = (startLongitude + 180) % 360;

					// mask 
					if ((startLongitude < endLongitude && longitude > startLongitude && longitude < endLongitude) ||
							(startLongitude > endLongitude && (longitude > startLongitude || longitude < endLongitude))){
								drawLine(mapLocation, 'rgba(62, 156, 253, 0.7)');
								drawSpot(mapLocation, '0.9',  4);
						}
						else {
							drawLine(mapLocation, 'rgba(32, 45, 21, 0.1)');
							drawSpot(mapLocation, '0.1', 2);
						}
					
					removePoint('clickpoint');
				}
			}
		};

		var drawSpot = function(locationPoint, style, tradius){
			var ending = barProjection([locationPoint.longitude, locationPoint.latitude]);

			var circ = Math.PI * 2;
			var quart = Math.PI / 2;

			c.strokeStyle = 'rgba(62, 156, 253' + ',' + style + ')';		

			var radius = Math.log(projection.scale()); // Math.floor(radius) ...
			c.lineWidth = 2, c.beginPath(), c.lineTo(ending[0], ending[1]), c.arc(ending[0], ending[1], 2, - (quart), ((circ) * (100 / 100)) - quart, false), c.stroke();
			
		}

		var drawLine = function(locationPoint, style){
			var beginning = projection([locationPoint.longitude, locationPoint.latitude]),
				ending = barProjection([locationPoint.longitude, locationPoint.latitude]);

			c.strokeStyle = style;
			c.beginPath();
			c.moveTo(beginning[0], beginning[1]);
			c.lineTo(ending[0], ending[1]);
			c.stroke();
		}

		var onDrag = function(){
			var dx = d3.event.dx,
				dy = d3.event.dy,
				rotation = projection.rotate(),
				radius = projection.scale(),
				barRotation = barProjection.rotate(),
				barRadius = barProjection.scale();

			scale = d3.scale.linear()
				.domain([-1 * radius, radius])
				.range([-90, 90]);

			var degX = scale(dx), degY = scale(dy);

			rotation[0] += degX;
			rotation[1] -= degY;
			if (rotation[1] > 90)   rotation[1] = 90;
			if (rotation[1] < -90)  rotation[1] = -90;

			if (rotation[0] >= 180) rotation[0] -= 360;

			// barprojection
			scale = d3.scale.linear()
				.domain([-1 * barRadius, barRadius])
				.range([-90, 90]);

			// barRotation sphere is ~~twice bigger thus degree scales must be twice
			// bigger as well (if you want 3d effect)
			var degrX = scale(dx) * globeScaleFactor, degrY = scale(dy)* globeScaleFactor;

			barRotation[0] += degrX;
			barRotation[1] -= degrY;
			if (barRotation[1] > 90)   barRotation[1] = 90;
			if (barRotation[1] < -90)  barRotation[1] = -90;

			if (barRotation[0] >= 180) barRotation[0] -= 360;

			projection.rotate(rotation);
			barProjection.rotate(barRotation);

			moved = true;
			dragging = true;
				
			wasMoved.push([dx, dy]);
		};

		var onZoom = function(){
			zoom.scaleExtent([zoom.scale()*0.9, zoom.scale()*1.1]);

			scale = (d3.event.scale >= 1) ? d3.event.scale : 1;
			projection.scale(globeScale * scale);
			barProjection.scale(cloudScale * scale);
			moved  = true;
			dragging = true;
		};

		var detectCountry = function(inverted){
			if(!features)
				return;

			var foundCountryElement;

			features.forEach(function(element) {
				if(element.geometry.type == 'Polygon'){
					if(gju.pointInPolygon(inverted, element.geometry) && !foundCountryElement){
						foundCountryElement = element;
					}
				}

				else if(element.geometry.type == 'MultiPolygon'){
					if(gju.pointInMultiPolygon(inverted, element.geometry) && !foundCountryElement){
						foundCountryElement = element;
					}
				}
			});

			var name = foundCountryElement? foundCountryElement.name: null,
				geometry = foundCountryElement? foundCountryElement.geometry: null;

			return {
				name: name,
				geometry: geometry
			}
		};

		var addDomElement = function(id, text, cssclass, coords, removeOnRedraw){
			var oldh = document.querySelector('#' + id);

			if(oldh){
				oldh.remove();
			}

			var div = document.createElement("div"); 
			div.setAttribute('id', id);
			div.setAttribute('class', cssclass);

			var textContent = document.createElement('div');
			textContent.innerHTML = text;
			div.appendChild(textContent); //add the text node to the newly created div. 

			div.style.cssText = 'position: absolute; top: ' + (coords[1] - 15) + 'px; left:' + (coords[0] - 21) +'px;';

			// add the newly created element and its content into the DOM 
			var currentDiv = document.getElementById(id); 
			document.body.insertBefore(div, currentDiv);

			var currentBoundingBox = div.getBoundingClientRect();

			// refine top position
			div.style.top = (parseFloat(div.style.top.replace('px','')) - currentBoundingBox.height) + 'px';
		};

		var updatePanel = function(clear, data) {
			var textp = document.querySelector("#text");
			var descp = document.querySelector("#desc");
			if(clear) {
				textp.innerHTML = "";
				descp.innerHTML = "";
				return;
			}
			textp.innerHTML = data.text;
			descp.innerHTML = data.desc;

		};

		var addPoint = function(inverted){
			
			if(mapLocations && mapLocations.length > 0){
				for(var i in mapLocations){

					// Using formula: sqrt((x2 - x1)^2 + (y2 - y1)^2))  for distance
					// TODO: in five kilometers metric should be better
					var _T = mapLocations[i],
						distance = Math.sqrt(Math.pow(inverted[0]  - _T.longitude, 2) + Math.pow(inverted[1] - _T.latitude, 2)),
						
						scaleFactor = zoom.scale();//parseInt(zoom.scale() / 6),
						isItInFiveKilometers = distance <= (0.5 / scaleFactor) *2;
						console.log(_T.text + ", " + distance + ", " + (0.5 / scaleFactor) *2, ", " + scaleFactor + ", " + zoom.scale());
						

					if(isItInFiveKilometers){ 
						// TODO: add twitter-like card
						var _DOM = ['<strong>' + _T.text + '</strong>'].join('');
						console.log(_T.text);
						updatePanel(false, _T);
						addDomElement('clickpoint', _DOM, 'locationtip ' + _T.text.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~\s]/g, ''), barProjection([_T.longitude, _T.latitude]), false);
					} else {
						var toRemove = document.querySelector("." + _T.text.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~\s]/g, ''));
						if(toRemove) {
							updatePanel(true, null);
							toRemove.remove();
						}
					}
				}
			}
		};

		var removePoint = function(id){
			var oldh = document.querySelector('#' + id);
			
			if(oldh){
				oldh.remove();
			}
		};


		elem.addEventListener('click', function(event){

			// prevents clicks on dragend
			if(wasMoved.length > 1){
				wasMoved = [];
				return;
			}

			var x = event.pageX - elemLeft,
				y = event.pageY - elemTop,
				inverted = projection.invert([x,y]),
				zoomBy = zoomByB = 1,
				initialProjectionScale = projection.scale(),
				initialBarProjectionScale = barProjection.scale(),
				zoomIn = initialProjectionScale > 3000 ? false: true;

			d3.transition()
				.duration(1250)
				.tween("rotate", function() {
					var r = d3.interpolate(projection.rotate(), [-inverted[0], -inverted[1]]);
					
					return function(t) {
						projection.rotate(r(t));
						barProjection.rotate(r(t));
						zoomBy = zoomIn ? initialProjectionScale + (t * 900) : initialProjectionScale - (t * 1200);
						zoomByB = zoomIn ? initialBarProjectionScale + (t * 1230.3) : initialBarProjectionScale - (1640.4);
						zoom.scale(t * 3.1);

						projection.scale(zoomBy);
						barProjection.scale(zoomByB);
						wasMoved = [];
						draw();
					};
				})
				.transition()
				.each('end',function(){
					wasMoved = [];
				});

		}, false);

		elem.addEventListener('mousemove', function(event) {
			
			// huge performance improvement for firefox
			if(dragging){
				return;
			}

			var x = event.pageX - elemLeft,
				y = event.pageY - elemTop,
				inverted = projection.invert([x,y]),
				country = detectCountry(inverted);

			// mouse out of current territory
			if(lastCountryGeometry && country.geometry && lastCountryGeometry.coordinates[0][0] != country.geometry.coordinates[0][0] ){
				draw();
			}

			// ocean
			if(country && !country.geometry){
				draw();
			}

			// mouse over territory
			if(country && country.name){
				if(lastCountryName != country.name){

					//c.fillStyle = "rgba(30, 231, 253, 0.8)", c.beginPath(), path(country.geometry), c.fill();

					// country text
					//c.fillStyle = 'rgba(244, 244, 244, 0.8)', c.beginPath(), c.fillRect(x -1, y -10, ((decodeURI(country.name)).toUpperCase().length * 7.5), 12);

					//c.font = '12px Monospace';
					//c.fillStyle = "#000", c.beginPath(), c.fillText((decodeURI(country.name)).toUpperCase(), x, y);

					lastCountryName = country.name;
					lastCountryGeometry = country.geometry;
				}
			}
			if(mapLocations.length > 0){//} && zoom && zoom.scale() > 6){
				
				addPoint(barProjection.invert([x,y]));
			}
		}, false);

		var loader = function(error, world, names, _cities) {
			if (error) throw error;

			var countryById = { };

			names.forEach(function(d) {

				countryById[d.id] = d.name;
			});

			features = topojson.feature(world, world.objects.countries).features;

			features.forEach(function(object){

				object.name =  countryById[object.id];
			});

			globe = {type: "Sphere"},
			land = topojson.feature(world, world.objects.land)
			countries = features,
			cities = _cities.features,
			borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; });

			features = features.filter(function(d) {
				return names.some(function(n) {
					if (d.id == parseInt(n.id)){ return d.name = n.name; }
				});
			}).sort(function(a, b) {
				return a.name.localeCompare(b.name);
			});

			var startIDObj = features.filter(function(d){
				return (d.name).toLowerCase() == (startCountry).toLowerCase();
			})[0];


			var startGeom = features.filter(function(d){
				return d.id == startIDObj.id
			});

			var startCoord = d3.geo.centroid(startGeom[0]);

			var coords = [-startCoord[0], -startCoord[1]];

			projection.rotate(coords);
			barProjection.rotate(coords);
			animate();

			zoom = d3.behavior.zoom()
				.center([width / 2, height / 2])
				.on("zoom", onZoom)
				.on("zoomend", function(){ dragging = false; });

			drag = d3.behavior.drag()
				.on('drag', onDrag)
				.on('dragend', function(){ dragging = false; })

			canvas.call(zoom);
			canvas.call(drag);
		}

		queue()
			.defer(d3.json, "/map/json/world-50m.json")
			.defer(d3.tsv,  "/map/json/world-110m-country-names.tsv")
			.defer(d3.json, "/map/json/cities.geojson")
			.await(loader);

		d3.select(self.frameElement).style("height", height + "px");

	};

	return {
		orthographic: orthographic,
		mapLocations: mapLocations
	};

})();

var mousepos = {};

var frameCount = 0;
var fps = 30, now, elapsed;
var fpsInterval = 1000 / fps;
var then = Date.now();
var startTime = then;
var globeScale = 320;
var cloudScale = 410.1;
var globeScaleFactor = cloudScale/globeScale;

window.addEventListener('load', function(){

	document.addEventListener('mousemove', function(event){
		mousepos.x = (window.Event) ? event.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
		mousepos.y = (window.Event) ? event.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
	});

	//prefix = helpers.prefixMatch(["webkit", "ms", "Moz", "O"]);
	geomaniac.orthographic();
});

