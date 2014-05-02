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
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var sankey = d3.sankey()
      .nodeWidth(5)
      .nodePadding(10)
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
      .attr("data-type", "ip")
      .on('click', 
        function(d) { 
          $('#search').val('ip ' + d.name.split("|")[0]);
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
          if (cc != 'LO' && cc != 0) {
            return ".flags/" + cc + ".png";    
          }
        })
      .attr("width", 16)
      .attr("height", 9)
      .attr("x", -22)
      .attr("y", function(d) { return d.dy / 2 - 5; })
      .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth());

  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
}

//
// Force Directed
//

function mkForceDirected(callerID,data,w,h) {

  var color = d3.scale.category20();
  
  var svg = d3.select("#" + callerID)
      .append("svg")
      .attr("width", w)
      .attr("height", h);

  var force = d3.layout.force()
      .gravity(.05)
      .distance(100)
      .charge(-200)
      .size([w, h])
      .nodes(data.nodes)
      .links(data.links)
      .start();

  var link = svg.selectAll(".link")
      .data(data.links)
    .enter().append("line")
      .attr("class", "link");

  var node = svg.selectAll(".node")
      .data(data.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.name.split("|")[0]); })
      .call(force.drag);

  node.append("image")
      .attr("data-type", "cc")
      .attr("class", "il")
      .on('click', function(d) { $('#search').val('cc ' + d.name.split("|")[1]); $('#search').focus(); })
      .attr("xlink:href", 
        function(d) { 
          var cc = d.name.split("|")[1] || 0;
          if (cc != 'LO' && cc != 0) {
            return ".flags/" + cc + ".png";    
          }
      })
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 16)
      .attr("height", 6);

  node.append("title")
      .text(function(d) { return d.name.split("|")[0] });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
}

//
// Hive
//

function mkHive(callerID,data,w,h) {

var width = 960,
    height = 850,
    innerRadius = 40,
    outerRadius = 640,
    majorAngle = 2 * Math.PI / 3,
    minorAngle = 1 * Math.PI / 12;

var angle = d3.scale.ordinal()
    .domain(["source", "source-target", "target-source", "target"])
    .range([0, majorAngle - minorAngle, majorAngle + minorAngle, 2 * majorAngle]);

var radius = d3.scale.linear()
    .range([innerRadius, outerRadius]);

var color = d3.scale.category10();

var svg = d3.select("#" + callerID)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + outerRadius * .20 + "," + outerRadius * .57 + ")");

// Load the data and display the plot!
d3.json(".js/flare.json", function(nodes) {
  var nodesByName = {},
      links = [],
      formatNumber = d3.format(",d"),
      defaultInfo;

  // Construct an index by node name.
  nodes.forEach(function(d) {
    d.connectors = [];
    d.packageName = d.name.split(".")[1];
    nodesByName[d.name] = d;
  });

  // Convert the import lists into links with sources and targets.
  nodes.forEach(function(source) {
    source.imports.forEach(function(targetName) {
      var target = nodesByName[targetName];
      if (!source.source) source.connectors.push(source.source = {node: source, degree: 0});
      if (!target.target) target.connectors.push(target.target = {node: target, degree: 0});
      links.push({source: source.source, target: target.target});
    });
  });

  // Determine the type of each node, based on incoming and outgoing links.
  nodes.forEach(function(node) {
    if (node.source && node.target) {
      node.type = node.source.type = "target-source";
      node.target.type = "source-target";
    } else if (node.source) {
      node.type = node.source.type = "source";
    } else if (node.target) {
      node.type = node.target.type = "target";
    } else {
      node.connectors = [{node: node}];
      node.type = "source";
    }
  });

  // Initialize the info display.
  var info = d3.select("#hp_info")
      .text(defaultInfo = "Showing " + formatNumber(links.length) + " dependencies among " + formatNumber(nodes.length) + " classes.");

  // Normally, Hive Plots sort nodes by degree along each axis. However, since
  // this example visualizes a package hierarchy, we get more interesting
  // results if we group nodes by package. We don't need to sort explicitly
  // because the data file is already sorted by class name.

  // Nest nodes by type, for computing the rank.
  var nodesByType = d3.nest()
      .key(function(d) { return d.type; })
      .sortKeys(d3.ascending)
      .entries(nodes);

  // Duplicate the target-source axis as source-target.
  nodesByType.push({key: "source-target", values: nodesByType[2].values});

  // Compute the rank for each type, with padding between packages.
  nodesByType.forEach(function(type) {
    var lastName = type.values[0].packageName, count = 0;
    type.values.forEach(function(d, i) {
      if (d.packageName != lastName) lastName = d.packageName, count += 2;
      d.index = count++;
    });
    type.count = count - 1;
  });

  // Set the radius domain.
  radius.domain(d3.extent(nodes, function(d) { return d.index; }));

  // Draw the axes.
  svg.selectAll(".axis")
      .data(nodesByType)
    .enter().append("line")
      .attr("class", "axis")
      .attr("transform", function(d) { return "rotate(" + degrees(angle(d.key)) + ")"; })
      .attr("x1", radius(-2))
      .attr("x2", function(d) { return radius(d.count + 2); });

  // Draw the links.
  svg.append("g")
      .attr("class", "links")
    .selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", link()
      .angle(function(d) { return angle(d.type); })
      .radius(function(d) { return radius(d.node.index); }))
      .on("mouseover", linkMouseover)
      .on("mouseout", mouseout);

  // Draw the nodes. Note that each node can have up to two connectors,
  // representing the source (outgoing) and target (incoming) links.
  svg.append("g")
      .attr("class", "nodes")
    .selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .style("fill", function(d) { return color(d.packageName); })
    .selectAll("circle")
      .data(function(d) { return d.connectors; })
    .enter().append("circle")
      .attr("transform", function(d) { return "rotate(" + degrees(angle(d.type)) + ")"; })
      .attr("cx", function(d) { return radius(d.node.index); })
      .attr("r", 4)
      .on("mouseover", nodeMouseover)
      .on("mouseout", mouseout);

  // Highlight the link and connected nodes on mouseover.
  function linkMouseover(d) {
    svg.selectAll(".link").classed("active", function(p) { return p === d; });
    svg.selectAll(".node circle").classed("active", function(p) { return p === d.source || p === d.target; });
    info.text(d.source.node.name + " → " + d.target.node.name);
  }

  // Highlight the node and connected links on mouseover.
  function nodeMouseover(d) {
    svg.selectAll(".link").classed("active", function(p) { return p.source === d || p.target === d; });
    d3.select(this).classed("active", true);
    info.text(d.node.name);
  }

  // Clear any highlighted nodes or links.
  function mouseout() {
    svg.selectAll(".active").classed("active", false);
    info.text(defaultInfo);
  }
});

// A shape generator for Hive links, based on a source and a target.
// The source and target are defined in polar coordinates (angle and radius).
// Ratio links can also be drawn by using a startRadius and endRadius.
// This class is modeled after d3.svg.chord.
function link() {
  var source = function(d) { return d.source; },
      target = function(d) { return d.target; },
      angle = function(d) { return d.angle; },
      startRadius = function(d) { return d.radius; },
      endRadius = startRadius,
      arcOffset = -Math.PI / 2;

  function link(d, i) {
    var s = node(source, this, d, i),
        t = node(target, this, d, i),
        x;
    if (t.a < s.a) x = t, t = s, s = x;
    if (t.a - s.a > Math.PI) s.a += 2 * Math.PI;
    var a1 = s.a + (t.a - s.a) / 3,
        a2 = t.a - (t.a - s.a) / 3;
    return s.r0 - s.r1 || t.r0 - t.r1
        ? "M" + Math.cos(s.a) * s.r0 + "," + Math.sin(s.a) * s.r0
        + "L" + Math.cos(s.a) * s.r1 + "," + Math.sin(s.a) * s.r1
        + "C" + Math.cos(a1) * s.r1 + "," + Math.sin(a1) * s.r1
        + " " + Math.cos(a2) * t.r1 + "," + Math.sin(a2) * t.r1
        + " " + Math.cos(t.a) * t.r1 + "," + Math.sin(t.a) * t.r1
        + "L" + Math.cos(t.a) * t.r0 + "," + Math.sin(t.a) * t.r0
        + "C" + Math.cos(a2) * t.r0 + "," + Math.sin(a2) * t.r0
        + " " + Math.cos(a1) * s.r0 + "," + Math.sin(a1) * s.r0
        + " " + Math.cos(s.a) * s.r0 + "," + Math.sin(s.a) * s.r0
        : "M" + Math.cos(s.a) * s.r0 + "," + Math.sin(s.a) * s.r0
        + "C" + Math.cos(a1) * s.r1 + "," + Math.sin(a1) * s.r1
        + " " + Math.cos(a2) * t.r1 + "," + Math.sin(a2) * t.r1
        + " " + Math.cos(t.a) * t.r1 + "," + Math.sin(t.a) * t.r1;
  }

  function node(method, thiz, d, i) {
    var node = method.call(thiz, d, i),
        a = +(typeof angle === "function" ? angle.call(thiz, node, i) : angle) + arcOffset,
        r0 = +(typeof startRadius === "function" ? startRadius.call(thiz, node, i) : startRadius),
        r1 = (startRadius === endRadius ? r0 : +(typeof endRadius === "function" ? endRadius.call(thiz, node, i) : endRadius));
    return {r0: r0, r1: r1, a: a};
  }

  link.source = function(_) {
    if (!arguments.length) return source;
    source = _;
    return link;
  };

  link.target = function(_) {
    if (!arguments.length) return target;
    target = _;
    return link;
  };

  link.angle = function(_) {
    if (!arguments.length) return angle;
    angle = _;
    return link;
  };

  link.radius = function(_) {
    if (!arguments.length) return startRadius;
    startRadius = endRadius = _;
    return link;
  };

  link.startRadius = function(_) {
    if (!arguments.length) return startRadius;
    startRadius = _;
    return link;
  };

  link.endRadius = function(_) {
    if (!arguments.length) return endRadius;
    endRadius = _;
    return link;
  };

  return link;
}

function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}

}
