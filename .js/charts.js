
/* Copyright (C) 2013 Paul Halliday <paul.halliday@gmail.com> */
return;

function math(stamp) {
  p = stamp.split(":");
  c = p[0] * 60 + p[1];
  return c;
}

function chartInterval(data) {

  ct = data.split(",");

  var hours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

  $.each(ct, function(a,b) {
    parts = b.split(":");
    switch (parts[0]) {
      case '00': hours[0]  = hours[0] + 1;  break;
      case '01': hours[1]  = hours[1] + 1;  break;
      case '02': hours[2]  = hours[2] + 1;  break;
      case '03': hours[3]  = hours[3] + 1;  break;
      case '04': hours[4]  = hours[4] + 1;  break;
      case '05': hours[5]  = hours[5] + 1;  break;
      case '06': hours[6]  = hours[6] + 1;  break;
      case '07': hours[7]  = hours[7] + 1;  break;
      case '08': hours[8]  = hours[8] + 1;  break;
      case '09': hours[9]  = hours[9] + 1;  break;
      case '10': hours[10] = hours[10] + 1; break;
      case '11': hours[11] = hours[11] + 1; break;
      case '12': hours[12] = hours[12] + 1; break;
      case '13': hours[13] = hours[13] + 1; break;
      case '14': hours[14] = hours[14] + 1; break;
      case '15': hours[15] = hours[15] + 1; break;
      case '16': hours[16] = hours[16] + 1; break;
      case '17': hours[17] = hours[17] + 1; break;
      case '18': hours[18] = hours[18] + 1; break;
      case '19': hours[19] = hours[19] + 1; break;
      case '20': hours[20] = hours[20] + 1; break;
      case '21': hours[21] = hours[21] + 1; break;
      case '22': hours[22] = hours[22] + 1; break;
      case '23': hours[23] = hours[23] + 1; break;
    }
  });

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  var formatPercent = d3.format(".0%");

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(formatPercent);

  var svg = d3.select(".chrt_ts").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Frequency");

  svg.selectAll(".bar")
    .data(hours)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("width", x.rangeBand());
}
