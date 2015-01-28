// Slider for data tables. Copied most of it from the d3 brush examples.
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
      .attr("height", 9)
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

  if ($('#objgrid')[0]) $('#objgrid').remove();

  var margin = { top: 50, right: 0, bottom: 0, left: 35 },
      width = 600 - margin.left - margin.right,
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
      .attr("id","objgrid")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  $(".ev_l").show();

  // Chart title
  svg.append("text")
    .attr("x",-20)
    .attr("y",-25) 
    .attr("class","chrtlbl") 
    .text("7 day history for " + object + " (all events)");

  // Grid
  var ht = 23;
  var lc = "#e9e9e9"; 

  // hlines
  var yh = 0;
  for (var i = 0; i <= 7; i++) {
    svg.append("svg:line")
        .attr("x1", 0)
        .attr("y1", yh)
        .attr("x2", width - 18)
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
