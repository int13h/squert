// None of this would exist without help from 
// the exampes here: https://github.com/mbostock/d3/wiki/Gallery

// Slider for data tables
function mkSlider(callerID,low,high) {
  var margin = {top: 3, right: 15, bottom: 3, left: 5},
      width = 100,
      height = 10;

  // Only produce a slider if we need to
  if (high <= 1) { 
    d3.select("#" + callerID).text(""); 
    return;
  }

  if (high > 1000) high = 1000;

  var x = d3.scale.linear()
      .domain([1, high]) 
      .range([1, width])
      .clamp(true);

  var brush = d3.svg.brush()
      .x(x)  
      .extent([0, 0])
      .on("brush", brushed);

  d3.select("#" + callerID)
       .text("");

  var svg = d3.select("#" + callerID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
    .attr("class", "x slideraxis")
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(function(d) { return d; })
      .tickSize(0)
      .tickPadding(7))
    .select(".domain")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "sliderhalo");

  var slider = svg.append("g")
      .attr("class", "slider")
      .call(brush);

  slider.selectAll(".extent,.resize")
    .remove();

  slider.select(".background")
    .attr("height", height);

  var handle = slider.append("circle")
    .attr("class", "sliderhandle")
    .attr("transform", "translate(0," + height / 2 + ")")
    .attr("r", 5);

  // Position the brush at our current selection
  slider
    .call(brush.event)
    .transition()
    .duration(0)
    .call(brush.extent([low, low]))
    .call(brush.event);

  function brushed() {
    var value = brush.extent()[0];
    if (d3.event.sourceEvent) {
      value = x.invert(d3.mouse(this)[0]);
      brush.extent([value, value]);
    }

    handle.attr("cx", x(value));
    d3.select("#" + callerID + "_lbl").html(value.toFixed(0));
  }
}

//
// Sankey charts
//

function mkSankey(callerID,data,w,h) {

  var margin = {"top": 20, "right": 20, "bottom": 6, "left": 20},
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;

  var formatNumber = d3.format(",.0f"),
      format = function(d) { return formatNumber(d); },
      color = d3.scale.category20();

  var svg = d3.select("#" + callerID)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        //.call(d3.behavior.zoom().scaleExtent([-8, 8]).on("zoom", zoom))
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var sankey = d3.sankey()
      .nodeWidth(5)
      .nodePadding(14)
      .size([width, height])
      .nodes(data.nodes)
      .links(data.links)
      .layout(32);

  var path = sankey.link();

  // Ribbons
  var link = svg.append("g").selectAll(".link")
      .data(data.links)
      .enter().append("path")
      // If a src -> dst pair also exist as a dst -> src pair then flag it
      .attr("class", function(d) { var cl = "link"; if (d.sad >= 1) cl = "link1"; return cl })
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

  link.append("title")
      .text(function(d) { return d.source.name.split("|")[0] + " > " + d.target.name.split("|")[0] + ":" + format(d.value) + "\n" + d.source.name.split("|")[0] + " < " + d.target.name.split("|")[0] + ":" + format(d.sad); });

  var node = svg.append("g").selectAll(".node")
      .data(data.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { this.parentNode.appendChild(this); })
      .on("drag", dragmove));

  // Boxes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); });

  // Labels
  node.append("text")
      .attr("x", -26)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .on('click', 
        function(d) {
          var re = /^\d{1,3}\./;
          var m = re.exec(d.name.split("|")[0]);
          if (m) {
            $('#search').val('ip ' + d.name.split("|")[0]);
          } else {
            $('#search').val('cc ' + d.name.split("|")[1]);
          }
          $('#search').focus(); 
        })
      .attr("class", "nodetext")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name.split("|")[0]; })
      .filter(function(d) { return d.x < width / 2; })
      .attr("x", 26 + sankey.nodeWidth())
      .attr("text-anchor", "start");

  // Flags
  node.append("image")
      .attr("data-type", "cc")
      .attr("class", "il")
      .on('click', function(d) { $('#search').val('cc ' + d.name.split("|")[1]); $('#search').focus(); })
      .attr("xlink:href", 
        function(d) { 
          var cc = d.name.split("|")[1] || 0;
          if (cc != 0) {
            return ".flags/" + cc + ".png";    
          }
        })
      .attr("width", 16)
      .attr("height", 11)
      .attr("x", -22)
      .attr("y", function(d) { return d.dy / 2 - 5; })
      .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth());

  function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
}

//
// Heatmap
//

function mkHeatMap(callerID,start,data,object) {

  if ($('#chart_grid')[0]) $('#chart_grid').remove();

  var margin = { top: 50, right: 0, bottom: 0, left: 35 },
      width = 500 - margin.left - margin.right,
      height = 240 - margin.top - margin.bottom,
      gridSize = Math.floor(width / 24),
      colors = ['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)'],
      buckets = colors.length - 3,
      strdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      times = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

  // The days are laid out in reverse so we need to keep track
  // of what the order is in relation to the first plot
  // and the order of the incoming data
  var t = Number(new Date(start).getDay());
  var days = new Array();
  var ofst = new Array();
  for (var i = 0; i < 7; i++) {
    if (t < 0) t = 6;
    days.push(strdays[t]);
    ofst.push(t);
    t--;
  }

  var maxV = d3.max(data, function (d) { return +d.value; });
  var colorScale = d3.scale.quantile()
      .domain([0, buckets - 1, maxV])
      .range(colors);

  var svg = d3.select(callerID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id","chart_grid")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Chart title
  svg.append("text")
    .attr("x",-20)
    .attr("y",-25) 
    .attr("class","chrtlbl") 
    .text("SHOWING THE PAST 7 DAYS OF ACTIVITY FOR " + object);

  // Grid
  var ht = 19;
  var lc = "#e9e9e9"; 

  // hlines
  var yh = 0;
  for (var i = 0; i <= 7; i++) {
    svg.append("svg:line")
        .attr("x1", 0)
        .attr("y1", yh)
        .attr("x2", width - 9)
        .attr("y2", yh)
        .style("stroke", lc)
        .style("stroke-width", 1);
    yh = yh + ht;
  };

  // vlines
  var xh = 0;
  for (var i = 0; i <= 24; i++) {
    svg.append("svg:line")
        .attr("x1", xh)
        .attr("y1", 0)
        .attr("x2", xh)
        .attr("y2", ht * 7)
        .style("stroke", lc)
        .style("stroke-width", 1);
    xh = xh + ht;
  };

  // Labels
  var dayLabels = svg.selectAll(".dayLabel")
      .data(days)
      .enter().append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return i * gridSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", function (d, i) { return ((i >= 0 && d[0] != "S") ? "dayLabel mono axis-workweek" : "dayLabel mono "); });

  var timeLabels = svg.selectAll(".timeLabel")
      .data(times)
      .enter().append("text")
      .text(function(d) { return d; })
      .attr("x", function(d, i) { return i * gridSize; })
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)")
      .attr("class", function(d, i) { return ((i >= 7 && i <= 17) ? "timeLabel mono axis-worktime" : "timeLabel mono"); });

  // Plot
  var heatMap = svg.selectAll(".hour")
      .data(data)
      .enter().append("rect")
      .attr("x", function(d) { return d.hour * gridSize + 1; })
      .attr("y", function(d) { var nday = Number(new Date(d.day).getDay()); return ofst.indexOf(nday) * gridSize + 1 })
      .attr("rx", 0)
      .attr("ry", 0)
      .attr("width", gridSize - 2)
      .attr("height", gridSize - 2)
      .style("fill", colors[0]);

  heatMap.transition().duration(1000)
         .style("fill", function(d) { return colorScale(d.value); });

  heatMap.append("title").text(function(d) { return d.value; });
}


//
// Pie Chart
//

function mkPieChart(callerID,data,object) {

  var width = 500,
      height = 220,
      radius = Math.min(width, height) / 2.5;

  var svg = d3.select(callerID)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "ippie")
        .append("g");

  svg.append("g")
     .attr("class", "slices");
  svg.append("g")
     .attr("class", "labels");
  svg.append("g")
     .attr("class", "lines");

  var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});

  var arc = d3.svg.arc()
	.outerRadius(radius * 0.6)
	.innerRadius(radius * 0.3);

  var outerArc = d3.svg.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

  svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  var key = function(d){ return d.data.label; };
  var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
  var colors = ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)','rgb(255,255,153)'];

  change(data);

  function mergeWithFirstEqualZero(first, second){
	var secondSet = d3.set(); second.forEach(function(d) { secondSet.add(d.label); });

	var onlyFirst = first
		.filter(function(d){ return !secondSet.has(d.label) })
		.map(function(d) { return {label: d.label, value: 0}; });
	return d3.merge([ second, onlyFirst ])
		.sort(function(a,b) {
			return d3.ascending(a.label, b.label);
		});
}

  function change(data) {
	var duration = 1000;
	var data0 = svg.select(".slices").selectAll("path.slice")
		.data().map(function(d) { return d.data });
	if (data0.length == 0) data0 = data;
	var was = mergeWithFirstEqualZero(data, data0);
	var is = mergeWithFirstEqualZero(data0, data);
        var n = -1;

	/* ------- SLICE ARCS -------*/

	var slice = svg.select(".slices").selectAll("path.slice")
		.data(pie(was), key);

	slice.enter()
		.insert("path")
		.attr("class", "slice")
		.style("fill", function(d) { n++; return colors[n]; })
		.each(function(d) {
			this._current = d;
		});

	slice = svg.select(".slices").selectAll("path.slice")
		.data(pie(is), key);

	slice		
		.transition().duration(duration)
		.attrTween("d", function(d) {
			var interpolate = d3.interpolate(this._current, d);
			var _this = this;
			return function(t) {
				_this._current = interpolate(t);
				return arc(_this._current);
			};
		});

	slice = svg.select(".slices").selectAll("path.slice")
		.data(pie(data), key);

	slice
		.exit().transition().delay(duration).duration(0)
		.remove();

	/* ------- TEXT LABELS -------*/

	var text = svg.select(".labels").selectAll("text")
		.data(pie(was), key);

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.style("opacity", 0)
                .attr("class", "pielbl")  
		.text(function(d) {
			return d.data.label;
		})
		.each(function(d) {
			this._current = d;
		});
	
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text = svg.select(".labels").selectAll("text")
		.data(pie(is), key);

	text.transition().duration(duration)
		.style("opacity", function(d) {
			return d.data.value == 0 ? 0 : 1;
		})
		.attrTween("transform", function(d) {
			var interpolate = d3.interpolate(this._current, d);
			var _this = this;
			return function(t) {
				var d2 = interpolate(t);
				_this._current = d2;
				var pos = outerArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			var interpolate = d3.interpolate(this._current, d);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});
	
	text = svg.select(".labels").selectAll("text")
		.data(pie(data), key);

	text
		.exit().transition().delay(duration)
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(was), key);
	
	polyline.enter()
		.append("polyline")
		.style("opacity", 0)
		.each(function(d) {
			this._current = d;
		});

	polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(is), key);
	
	polyline.transition().duration(duration)
		.style("opacity", function(d) {
			return d.data.value == 0 ? 0 : .5;
		})
		.attrTween("points", function(d){
			this._current = this._current;
			var interpolate = d3.interpolate(this._current, d);
			var _this = this;
			return function(t) {
				var d2 = interpolate(t);
				_this._current = d2;
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			};			
		});
	
	polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(data), key);
	
	polyline
		.exit().transition().delay(duration)
		.remove();
  };
}

//
// Line Charts
//

function mkLine(callerID,data,ymax) {

  if ($('#chart_epm')[0]) $('#chart_epm').remove();

  var w = $(callerID).width();
  var h = 150;
  var ymax = Number(ymax);
  var hmax = Number(0);

  // We want to calculate hourly sums as well
  var hours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  // This is a kludge but I couldn't for the life of me get the x axis
  // to format how I wanted.
  var xhour = ["01","02","03","04","05","06","07","08","09",10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  
  // Strip leading zero from hour spot
  function trunc(h) {
    if (h[0] == 0) h = h[1];
    return h;
  }

  // Convert hourly sum into something that we can plot relative to the existing axis
  function getY(n,hmax,height) {
    var v = Number(height - (n * (height / hmax)));
    return v;
  }

  var margin = {top: 14, right: 20, bottom: 25, left: 40},
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;

  var  x = d3.scale.linear()
       .domain([0,1440])
       .range([0,width])

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(0);

  var y = d3.scale.linear()
      .range([height, 0])
      .domain([0,ymax + 20]);

  var yticks = 6;
  if (ymax < 6) yticks = ymax;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(yticks);

  var svg = d3.select(callerID)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id","chart_epm")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Grid
  var ht = width / 24;
  var lc = "#e9e9e9";

  // vlines
  var xh = 0;
  for (var i = 0; i <= 24; i++) {
    svg.append("svg:line")
        .attr("x1", xh) 
        .attr("y1", 0)
        .attr("x2", xh) 
        .attr("y2", height)
        .style("stroke", lc)
        .style("stroke-linecap", "round")
        .style("stroke-width", 1); 
    xh = xh + ht;} 

    // Axes
    svg.append("g")
        .attr("class", "x lineaxis axistxt")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y lineaxis axistxt")
        .call(yAxis);

    // Plot
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 2)
        .attr("cx", function(d) {
          var p = d.time.split(":");
          var h = Number(trunc(p[0]));
          // Populate our hours array and keep a running total
          var s = hours[h];
          var cnt = Number(d.count); 
          hours[h] = s + cnt;
          var m = Number(p[1]);
          var c = h * 60 + m;
          return x(c);
        })
        .attr("cy", function(d) { return y(d.count); })
        .attr("class", "linedot");

  // Hourly sums
  var xh = 0;
  var hmax = Math.max.apply(null, hours); 
  for (var i = 0; i <= 23; i++) {
    if (hours[i] != 0) {
      var yh = getY(hours[i],hmax,height);
      svg.append("text")
        .attr("x", xh + ht/2) 
        .attr("y", yh)
        .style("text-anchor", "middle")
        .style("text-decoration", "underline")
        .style("font-size", "10px")
        .style("fill", "#000")
        .text(hours[i]);
    }
    // Ghetto axis
    svg.append("text")
      .attr("x", xh + ht - 4) 
      .attr("y", height + 15)
      .attr("class", "axistxt")
      .text(xhour[i]);

    xh = xh + ht;
  }
}
// THE END
