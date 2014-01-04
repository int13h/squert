// Slider for data tables
function mkSlider(callerID,low,high) {

  var margin = {top: 3, right: 15, bottom: 3, left: 5},
      width = 100,
      height = 10;

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

