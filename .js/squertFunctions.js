// Elasticsearch Sources
// This is temporary I will put in the DB later.
var esSources = [{
  "name":"BRO_CONN",
  "type":"bro_conn",
  "desc":"Bro connection log",
  "loke":"",
  "state":"on"
},
{
  "name":"BRO_DNS",
  "type":"bro_dns",
  "desc":"Bro DNS log",
  "loke":"",
  "state":"on"
},
{
  "name":"BRO_FTP",
  "type":"bro_ftp",
  "desc":"Bro ftp log",
  "loke":"",
  "state":"off"
},
{
  "name":"BRO_HTTP",
  "type":"bro_http",
  "desc":"Bro HTTP log",
  "loke":"",
  "state":"on"
},
{
  "name":"BRO_SOFTWARE",
  "type":"bro_software",
  "desc":"Bro software log",
  "loke":"",
  "state":"on"
},
{
  "name":"BRO_SSL",
  "type":"bro_ssl",
  "desc":"Bro SSL log",
  "loke":"",
  "state":"on"
},
{
  "name":"EventLog",
  "type":"windows",
  "desc":"Windows event log",
  "loke":"",
  "state":"on"
},
{
  "name":"Barracuda",
  "type":"barracuda",
  "desc":"Barracuda spam firewall",
  "loke":"",
  "state":"on"
}];

// Classifications
var classifications = {"class":{
  "c11":[{"colour": "#c00", "short": "C1", "long": "Unauthorized Admin Access"}],
  "c12":[{"colour": "#f60", "short": "C2", "long": "Unauthorized User Access"}],
  "c13":[{"colour": "#f90", "short": "C3", "long": "Attempted Unauthorized Access"}],
  "c14":[{"colour": "#c90", "short": "C4", "long": "Denial of Service Attack"}],
  "c15":[{"colour": "#99c", "short": "C5", "long": "Policy Violation"}],
  "c16":[{"colour": "#fc0", "short": "C6", "long": "Reconnaissance"}],
  "c17":[{"colour": "#c6f", "short": "C7", "long": "Malware"}],
   "c2":[{"colour": "#FFC0CB", "short": "ES", "long": "Escalated Event"}],
   "c1":[{"colour": "#ADD8E6", "short": "NA", "long": "No Action Req'd."}],
   "c0":[{"colour": "#cc0000", "short": "RT", "long": "Unclassified"}]
 }
};

function d2h(d) {
  return d.toString(16);
}

function h2d(h) {
  return parseInt(h, 16);
}

function s2h(tmp) {
  var str = '', i = 0, tmp_len = tmp.length, c;
  for (; i < tmp_len; i += 1) {
    c = tmp.charCodeAt(i);
    str += d2h(c);
  }
  return str;
}

function h2s(hex) {
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }    
  return str;
}

function chkIP(ip) {
  var re = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$|^any$/;
  var OK = re.exec(ip);
  return OK;
}

function chkPort(port) {
  if (port == "any") {
    var OK = 1;
    return OK;
  }
  var re = /^\d{1,5}$/;
  var OK = re.exec(port);
  if (port <= 65535) {
    return OK;
  }
  
}

function sort_unique(arr) {
  arr = arr.sort(function (a, b) { return a*1 - b*1; });
  var ret = [arr[0]];
  for (var i = 1; i < arr.length; i++) {
    if (arr[i-1] !== arr[i]) {
      ret.push(arr[i]);
    }
  }
  return ret;
}

$.ctrl = function(key, callback, args) {
  $(document).keydown(function(e) {
    if (!args) {args=[];}
    if (e.keyCode == key.charCodeAt(0) && e.ctrlKey) {
      callback.apply(this, args);
      return false;
    }
  });        
}

$.alt = function(key, callback, args) {
  $(document).keydown(function(e) {
    if (!args) {args=[];}
    if (e.keyCode == key.charCodeAt(0) && e.altKey) {
      callback.apply(this, args);
      return false;
    }
  });        
}

function getTimestamp() {
  // If we have an error in the input fields we clear and fire.
  if ($('.dt_error').data('err') == 1) {
    $('.dt_reset').click();
  }

  // Timeparts
  var ts_sd = $('#ts_sdate').val();
  var ts_ed = $('#ts_edate').val();
  var ts_st = $('#ts_stime').val();
  var ts_et = $('#ts_etime').val();
  var ts_os = $('#ts_offset').val();
  var theWhen = s2h(ts_sd + "|" + ts_ed + "|" + ts_st + "|" + ts_et + "|" + ts_os);
  var fval = 'NO';
  var fval_c = 'fl_val_off';
  var fbs = 'NO';
  var fbs_c = 'fl_val_off';
  var fbt_c = 'fl_val_off';
  if (ts_sd != ts_ed) fbt_c = 'fl_val_on';
  if (ts_st !=  "00:00:00" || ts_et != "23:59:59") fbt_c = 'fl_val_on'; 

  // Add base times for es queries
  $('#el_start').val(ts_sd + " " + ts_st);
  $('#el_end').val(ts_ed + " " + ts_et);

  if ($('#search').val().length > 0) {
    fval = 'YES';
    fval_c = 'fl_val_on';
  }
  var tl = "<span class=\"hvr ctt\"><img title=\"toggle date controls\" class=ct src=.css/ct.png><span class=fl>interval: </span></span><span class=" + fbt_c + " data-ft=tl>";
  tl += ts_sd + " " + ts_st + " -> " + ts_ed + " " + ts_et + " (" + ts_os + ")";
  tl += "</span>";
  tl += "<span class=fl>filtered by object: </span><span class=" + fval_c + " data-ft=ob>" + fval + "</span>";
 
  if ($('.chk_sen:checked').length > 0) {
    fbs = 'YES';
    fbs_c = 'fl_val_on';
  } 
  tl += "<span class=fl>filtered by sensor: </span><span class=" + fbs_c + " data-ft=sn>" + fbs + "</span>";
  tl += "<span class=fl>priority: </span>";
  $('.t_stats').html(tl);
  return theWhen;
}
  
// Event priority bar and counts
function mkPribar(v) {
  var sum = v.reduce(function(a,b) { return a + b; }, 0);
  var v0 = 0, v1 = 0, v2 = 0, v3 = 0; 
  var w = [];
  if ( sum > 0) {
    w = [Number(v[0]/sum*100).toFixed(1),Number(v[1]/sum*100).toFixed(1),
         Number(v[2]/sum*100).toFixed(1),Number(v[3]/sum*100).toFixed(1)];
    var bar = "<table class=pribar><tr>";
    var t = ['High Priority','Medium Priority','Low Priority','Other'];
    for (var i=1; i<5;i++) {
      var j = Number(i - 1);
      if (w[j] > 0) { 
        bar += "<td data-pr=" + i + " class=bpr" + i + " width=" + w[j] + "% title=\""; 
        bar += t[j] + ": " + v[j] + "\">" + w[j] + "%</td>";
        $('#pr_' + i).html(v[j] + "<span class=per>(" + w[j] + "%)</span>");
      }  
    } 
  } else {
    bar += "<td>-</td>";
  }
  bar += "</tr></table>";
  $('.t_pbar').html(bar);
  if ($(".tab_active").attr('id') != 't_sum') $('.t_pbar').css('opacity',.4);
}

// Flagger
function getCountry(cc) {

  switch (cc) {
    case "LO": 
      answer = "sub_light|LO"; break;
    case "-": 
      answer = "sub_light|"; break;
    case "01":
      answer = "sub_light|"; break; 
    default:
      answer = "sub_filter|<span class=flag><img src=\".flags/" + cc + ".png\"></span>"; break;
  }
  return answer;
}

// Rule Lookup
function sigLookup(sid) {
  // Lookup rule
  var urArgs = "type=" + 4 + "&sid=" + sid;
  $.get(".inc/callback.php?" + urArgs, function(data){
    eval("sigData=" + data);
    sigtxt = sigData.ruletxt;
    sigfile = sigData.rulefile;
    sigline = sigData.ruleline;
    var txt = '';
    txt += sigtxt + " <br><br>";
    txt += "<span class=small>";
    txt += "file: <span class=boldtab>" + sigfile + ":" + sigline + "</span><br>";
    $(".sigtxt").prepend(txt);
  });
}
 
// 24 Grid
function mkGrid(values) {
  var cells = "<table class=grid cellspacing=none><tr>";
  var composite = values.split(",");
  for (var i=0; i<24;) {
    var n = i;
    if (n < 10) {
      n = "0" + n;                
    }
    var o = 0;
    for (var c = 0; c < composite.length; ++c) {
      if (composite[c] == n) o++;
    }
    if (o > 0) {
      colours = d3.scale.linear()
        .domain([0,10])
        .range(["#e9e9e9","#5d5d5d"]);
      var color = colours(o);
      
      cells += "<td class=c_on style=\"background-color:" + color + "\"; title=\"" + n + ":00 &#61;&gt; " + o + " events\">1</td>";
    } else {
      cells += "<td class=c_off>0</td>"; 
    }
    if (i == 7 || i == 15) {
      cells += "</tr><tr>";
    }
    i++; 
  }
  cells += "</tr></table>";
  return cells;
}
 
// Event Classification grid
function catGrid(values,comment,type) {
  switch (type) {
    case 0: var prefix = "nl_"; var grid = "grid_nopad"; break;
    case 1: var prefix = "cl_"; var grid = "grid"; break;
  }
  var cells =  "<table class=" + grid + " data-comment=\"" + comment + "\">";
  cells += "<tr>";
  var composite = values.split(",");
  var cats = [11,12,13,14,15,16,17,1,2];
  for (var i=0; i<9;) {
    var o = 0, n = cats[i];
    for (var c = 0; c < composite.length; ++c) {
      if (composite[c] == n) o++;
    }
    var cl = "c" + cats[i];
    var vc = classifications.class[cl][0].colour;
    var vt = classifications.class[cl][0].long;
    if (o > 0) {
      cells += "<td class=" + prefix + cats[i] + " title=\"" + vt + "\" style=\"background-color:" + vc + "\">1</td>";
    } else {
      cells += "<td class=" + prefix + cats[i] + " title=\"" + vt + "\">0</td>";
    }
    if (cats[i] == 13 || cats[i] == 16) {
      cells += "</tr><tr>";
    }
    i++; 
  }
  cells += "</tr></table>";
  return cells;
}

function profileUpdate(r, v) {
  switch(r) {
    case "tz":
      var urArgs = "type=" + 14 + "&tz=" + v;
      $.get(".inc/callback.php?" + urArgs);
    break;
  }
}
