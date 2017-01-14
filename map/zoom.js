function Zoom(args) {
  $.extend(this, {
    $buttons:   $(".zoom-button"),
    $info:      $("#zoom-info"),
    scale:      { max: 50, currentShift: 0 },
    $container: args.$container,
    datamap:    args.datamap
  });

  this.init();
}

Zoom.prototype.init = function() {
  var paths = this.datamap.svg.selectAll("path"),
      subunits = this.datamap.svg.selectAll(".datamaps-subunit");

  // preserve stroke thickness
  paths.style("vector-effect", "non-scaling-stroke");

  // disable click on drag end
  subunits.call(
    d3.behavior.drag().on("dragend", function() {
      d3.event.sourceEvent.stopPropagation();
    })
  );

  this.scale.set = this._getScalesArray();
  this.d3Zoom = d3.behavior.zoom().scaleExtent([ 1, this.scale.max ]);

  this._displayPercentage(1);
  this.listen();
};

Zoom.prototype.listen = function() {
  this.$buttons.off("click").on("click", this._handleClick.bind(this));

  this.datamap.svg
    .call(this.d3Zoom.on("zoom", this._handleScroll.bind(this)))
    .on("dblclick.zoom", null); // disable zoom on double-click
};

Zoom.prototype.reset = function() {
  this._shift("reset");
};

Zoom.prototype._handleScroll = function() {
  var translate = d3.event.translate,
      scale = d3.event.scale,
      limited = this._bound(translate, scale);

  this.scrolled = true;

  this._update(limited.translate, limited.scale);
};

Zoom.prototype._handleClick = function(event) {
  var direction = $(event.target).data("zoom");

  this._shift(direction);
};

Zoom.prototype._shift = function(direction) {
  var center = [ this.$container.width() / 2, this.$container.height() / 2 ],
      translate = this.d3Zoom.translate(), translate0 = [], l = [],
      view = {
        x: translate[0],
        y: translate[1],
        k: this.d3Zoom.scale()
      }, bounded;

  translate0 = [
    (center[0] - view.x) / view.k,
    (center[1] - view.y) / view.k
  ];

	if (direction == "reset") {
  	view.k = 1;
    this.scrolled = true;
  } else {
  	view.k = this._getNextScale(direction);
  }

l = [ translate0[0] * view.k + view.x, translate0[1] * view.k + view.y ];

  view.x += center[0] - l[0];
  view.y += center[1] - l[1];

  bounded = this._bound([ view.x, view.y ], view.k);

  this._animate(bounded.translate, bounded.scale);
};

Zoom.prototype._bound = function(translate, scale) {
  var width = this.$container.width(),
      height = this.$container.height();

  translate[0] = Math.min(
    (width / height)  * (scale - 1),
    Math.max( width * (1 - scale), translate[0] )
  );

  translate[1] = Math.min(0, Math.max(height * (1 - scale), translate[1]));

  return { translate: translate, scale: scale };
};

Zoom.prototype._update = function(translate, scale) {
  this.d3Zoom
    .translate(translate)
    .scale(scale);

  this.datamap.svg.selectAll("g")
    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

  this._displayPercentage(scale);
};

Zoom.prototype._animate = function(translate, scale) {
  var _this = this,
      d3Zoom = this.d3Zoom;

  d3.transition().duration(350).tween("zoom", function() {
    var iTranslate = d3.interpolate(d3Zoom.translate(), translate),
        iScale = d3.interpolate(d3Zoom.scale(), scale);

		return function(t) {
      _this._update(iTranslate(t), iScale(t));
    };
  });
};

Zoom.prototype._displayPercentage = function(scale) {
  var value;

  value = Math.round(Math.log(scale) / Math.log(this.scale.max) * 100);
  this.$info.text(value + "%");
};

Zoom.prototype._getScalesArray = function() {
  var array = [],
      scaleMaxLog = Math.log(this.scale.max);

  for (var i = 0; i <= 10; i++) {
    array.push(Math.pow(Math.E, 0.1 * i * scaleMaxLog));
  }

  return array;
};

Zoom.prototype._getNextScale = function(direction) {
  var scaleSet = this.scale.set,
      currentScale = this.d3Zoom.scale(),
      lastShift = scaleSet.length - 1,
      shift, temp = [];

  if (this.scrolled) {

    for (shift = 0; shift <= lastShift; shift++) {
      temp.push(Math.abs(scaleSet[shift] - currentScale));
    }

    shift = temp.indexOf(Math.min.apply(null, temp));

    if (currentScale >= scaleSet[shift] && shift < lastShift) {
      shift++;
    }

    if (direction == "out" && shift > 0) {
      shift--;
    }

    this.scrolled = false;

  } else {

    shift = this.scale.currentShift;

    if (direction == "out") {
      shift > 0 && shift--;
    } else {
      shift < lastShift && shift++;
    }
  }

  this.scale.currentShift = shift;

  return scaleSet[shift];
};

function Datamap() {
	this.$container = $("#container");
	this.instance = new Datamaps({
    scope: 'world',
    element: this.$container.get(0),
    //projection: 'mercator',
    fills: {
      defaultFill: "#000000",
      cityFill: "#FC8D59"
    },
    geographyConfig: {
      hideAntarctica: false,
      borderColor: '#ddf9ff',
      highlightOnHover: true,
      popupOnHover: false,
      highlightFillColor: '#000000',
      highlightBorderColor: '#51ff66',
      highlightBorderWidth: 1,
      highlightBorderOpacity: 1
    },
    bubblesConfig: {
      borderWidth: 0,
      borderOpacity: 0.75,
      borderColor: '#FFFFFF',
      popupOnHover: true, // True to show the popup while hovering
      radius: null,
      popupTemplate: function(geography, data) { // This function should just return a string
        return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
      },
      fillOpacity: 1,
      animate: true,
      highlightOnHover: true,
      highlightFillColor: '#0C8D59',
      highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
      highlightBorderWidth: 2,
      highlightBorderOpacity: 1,
      highlightFillOpacity: 1,
      exitDelay: 100, // Milliseconds
    },
    done: this._handleMapReady.bind(this)
	});
  this.instance.bubbles([
      {
        name: 'Delhi, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 28.7041,
        longitude: 77.1025
        },
        {
        name: 'Singapore, Singapore',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 1.3521,
        longitude: 103.8198
        },
        {
        name: 'Dallas, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 32.7767,
        longitude: -96.7970
        },
        {
        name: 'Palo Alto, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 37.4419,
        longitude: -122.1430
        },
        {
        name: 'Chapel Hill, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 35.9132,
        longitude: -79.0558
        },
        {
        name: 'Washington DC, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 38.9072,
        longitude: -77.0369
        },
        {
        name: 'New York, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 40.7128,
        longitude: -74.0059
        },
        {
        name: 'Nashville, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 36.1627,
        longitude: -86.7816
        },
        {
        name: 'Charlotte, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 35.2271,
        longitude: -80.8431
        },
        {
        name: 'Phoenix, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 33.4484,
        longitude: -112.0740
        },
        {
        name: 'San Diego, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 32.7157,
        longitude: -117.1611
        },
        {
        name: 'Los Angeles, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 34.0522,
        longitude: -118.2437
        },
        {
        name: 'Chicago, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 41.8781,
        longitude: -87.6298
        },
        {
        name: 'Philadelphia, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 39.9526,
        longitude: -75.1652
        },
        {
        name: 'New Haven, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 41.3083,
        longitude: -72.9279
        },
        {
        name: 'Ann Arbor, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 42.2808,
        longitude: -83.7430
        },
        {
        name: 'Seattle, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 47.6062,
        longitude: -122.3321
        },
        {
        name: 'Las Vegas, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 36.1699,
        longitude: -115.1398
        },
        {
        name: 'Atlanta, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 33.7490,
        longitude: -84.3880
        },
        {
        name: 'Miami, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 25.7617,
        longitude: -80.1918
        },
        {
        name: 'Orlando, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 28.5383,
        longitude: -81.3792
        },
        {
        name: 'Daytona Beach, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 29.2108,
        longitude: -81.0228
        },
        {
        name: 'Pune, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 18.5204,
        longitude: 73.8567
        },
        {
        name: 'Bangalore, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 12.9716,
        longitude: 77.5946
        },
        {
        name: 'Chennai, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 13.0827,
        longitude: 80.2707
        },
        {
        name: 'Mumbai, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 19.0760,
        longitude: 72.8777
        },
        {
        name: 'Muzaffarnagar, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 29.4727,
        longitude: 77.7085
        },
        {
        name: 'Chandigarh, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 30.7333,
        longitude: 76.7794
        },
        {
        name: 'Kochi, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 9.9312,
        longitude: 76.2673
        },
        {
        name: 'Boston, USA',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 42.3601,
        longitude: -71.0589
        },
        {
        name: 'Yogyakarta, Indonesia',
          radius: 3,
          fillKey: 'cityFill',
        latitude: -7.7956,
        longitude: 110.3695
        },
        {
        name: 'Bali, Indonesia',
          radius: 3,
          fillKey: 'cityFill',
        latitude: -8.6705,
        longitude: 115.2126
        },
        {
        name: 'Pondicherry, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 11.9139,
        longitude: 79.8145
        },
        {
        name: 'Leh, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 34.1526,
        longitude: 77.5771
        },
        {
        name: 'Jaipur, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 26.9124,
        longitude: 75.7873
        },
        {
        name: 'Ranthambore, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 26.0173,
        longitude: 76.5026
        },
        {
        name: 'Corbett, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 29.5300,
        longitude: 78.7747
        },
        {
        name: 'Binsar, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 29.7054,
        longitude: 79.7552
        },
        {
        name: 'Shimla, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 31.1048,
        longitude: 77.1734
        },
        {
        name: 'Nainital, India',
          radius: 3,
          fillKey: 'cityFill',
        latitude: 29.3803,
        longitude: 79.4636
        },
    ], 
    {
        popupTemplate: function(geo, data) {
          return '<div class="hoverinfo">' + data.name;
        }
    });
}

Datamap.prototype._handleMapReady = function(datamap) {
	this.zoom = new Zoom({
  	$container: this.$container,
  	datamap: datamap
  });
}

new Datamap();
