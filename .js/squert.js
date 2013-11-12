/* Copyright (C) 2013 Paul Halliday <paul.halliday@gmail.com> */

$(document).ready(function(){

  function d2h(d) {
    return d.toString(16);
  }

  function h2d (h) {
    return parseInt(h, 16);
  }

  function s2h (tmp) {
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
      if(!args) {args=[];}
      if(e.keyCode == key.charCodeAt(0) && e.ctrlKey) {
        callback.apply(this, args);
        return false;
      }
    });        
  }

  $.alt = function(key, callback, args) {
    $(document).keydown(function(e) {
      if(!args) {args=[];}
      if(e.keyCode == key.charCodeAt(0) && e.altKey) {
        callback.apply(this, args);
        return false;
      }
    });        
  }

  // Used for search sync
  var eF = 0;

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

    if (eF == 1) {
      fval = 'YES';
      fval_c = 'fl_val_on';
    }
    var tl = '<span class=tl>Timeline: </span>';
    tl += ts_sd + " " + ts_st + " <span class=tl>until</span> " + ts_ed + " " + ts_et + " (" + ts_os + ")";
    tl += "<span class=fl>Filtered by Object: </span><span class=" + fval_c + ">" + fval + "</span>";
 
    if ($('.chk_sen:checked').length > 0) {
      fbs = 'YES';
      fbs_c = 'fl_val_on';
    } 
    tl += "<span class=fl>Filtered by Sensor: </span><span class=" + fbs_c + ">" + fbs + "</span>";
    tl += "<span class=fl>Status: </span><span class=rt_notice title=\"update results\">Synchronized</span>";
    $('.timeline').html(tl);
    return theWhen;
  }
  
  // Load main content
  eventList("0-aaa-00");
  
  $("#loader").show();

  var lastclasscount = 0;

  function getCountry(cc) {

    switch (cc) {
      case "LO": 
        answer = "sub_light|LO"; break;
      case "-": 
        answer = "sub_light|-"; break;
      default:
        answer = "sub_filter|<span class=flag><img src=\".flags/" + cc + ".png\"></span>"; break;
    }
    return answer;
  }

  //
  // User Profile Changes
  //

  function profileUpdate(r, v) {
    switch(r) {
      case "tz":  
        var urArgs = "type=" + 14 + "&tz=" + v;
        $.get(".inc/callback.php?" + urArgs);
      break;
    }
  }

  $(document).on("click", "#savetz", function(event) {
    if ($('.dt_error').data('err') == 0) {
      var newOffset = $('#ts_offset').val();
      profileUpdate("tz", s2h(newOffset));
      $('#user_tz').val(newOffset);
    }
  });  

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
 
  // Make a map
  function doMap(req) {
    theWhen = getTimestamp();
    var filter = 0;
    var urArgs = "type=" + 10 + "&filter=" + filter + "&ts=" + theWhen;
    $(function(){
      $.get(".inc/callback.php?" + urArgs, function(data){cb10(data)});
    });

    var working = "Working<br><img src=.css/load.gif>";

    switch (req) {
      case "draw": 
        var tbl = "";
        tbl += "<table class=mb_table id=map_box cellpadding=0 cellspacing=0 align=center>";
        tbl += "<tr><td class=mb_header align=right></td></tr>"; 
        tbl += "<tr><td class=mb_box>" + working + "</td></tr>";
        tbl += "</table>";
        $("#aaa-00").append(tbl);
        break;
      case "redraw":
        $('.mb_box').html(working);
        break;
    }

    function cb10(data){
      eval("mapRaw=" + data);
      try {
        var mapDetail = $.parseJSON("{" + mapRaw.all + "}");
        var srcc    = mapRaw.srcc;
        var srce    = mapRaw.srce;
        var dstc    = mapRaw.dstc;
        var dste    = mapRaw.dste;
        var allc    = mapRaw.allc;
        var alle    = mapRaw.alle;
      } 
      catch(e) {
        var mapDetail = "{\"\"}";
      }
            
      // What is our current event total?
      var esum = $('#event_sum').val();
      $(".mb_box").html("<div id=wm0 style=\"width:950px;height:500px;\"></div>");
      $('#wm0').vectorMap({
        map: 'world_mill_en',
        color: '#f4f3f0',
        backgroundColor: '#a5bfdd',
        onRegionClick: function(event, code){
        hItemAdd(code);
        $('#search').val("cc" + " " + code);
        $('#search').focus();
        },
        series: {
          regions: [{
            values: mapDetail,
            scale: ['#f4f4f4', '#545454'],
            normalizeFunction: 'polynomial'
          }]
        },
        onRegionLabelShow: function(e, el, code){
          if (mapDetail[code]) {
            var eper = parseFloat(mapDetail[code]/esum*100).toFixed(3);
            el.html(el.html() + ' (' + mapDetail[code] + ' Events ' + eper + '% of Total)');
          } else {
            el.html(el.html());
          }
        }
      });

      header = "";
      header += "<span class=mb_links>Countries as sources:</span> ";
      header += srcc + " with " + srce + " events";
      header += "<span class=mb_links>Countries as destinations:</span> " 
      header += dstc + " with " + dste + " events";
      header += "<span class=mb_links>Total countries:</span> ";
      header += allc;
      header += "&nbsp;&nbsp;<div id=map_redraw class=mb_refresh>update</div>";  

      $(".mb_header").html(header);
    }
  }

  // Draw map
  $("#menu2").click(function(event) {
    var cv = $("#menu2").text();
      switch (cv) {
        case "off":
          $("#menu2").text("on");
          $("#menu2").attr('class','tvalue_on');
          if (!$("#wm0")[0]) {
            doMap("draw");
          } else {
            $("#map_box").show();
          }
          break;
        case "on":
          $("#menu2").text("off");
          $("#menu2").attr('class','tvalue_off');
          $("#map_box").hide();
          break;
      }
  });
    
  // Redraw map
  $(document).on("click", "#map_redraw", function(event) {
    doMap("redraw");
  });

  // Get event statuses
  var eTotal = 0, qTotal = 0;
  function statusPoll(caller) {

    // See if we are filtering by sensor
    var theSensors = s2h('empty');
    if ($('.chk_sen:checked').length > 0) {
      var active_sensors = "AND event.sid IN(";
      var iter  = $('.chk_sen:checked').length;
      $('.chk_sen:checked').each(function() {
        active_sensors += "'" + $(this).val() + "',";
      });
      active_sensors = active_sensors.replace(/,+$/,'');
      active_sensors += ")";
      theSensors = s2h(active_sensors);
    }

    var urArgs = "type=" + 6 + "&ts=" + theWhen + "&sensors=" + theSensors;
    $(function(){
      $.get(".inc/callback.php?" + urArgs, function(data){cb(data)});
    });

    function cb(data){
      eval("ec=" + data);
      var esum = 0;
            
      for (var i=0; i<ec.length; i++) {
        var ecount = ec[i].count;
        var eclass = ec[i].status;
        esum += parseInt(ecount);
        $("#c-" + eclass).text(ecount);
      }
          
      for (var i=0; i<ec.length; i++) {
        var ecount = ec[i].count;
        var eclass = ec[i].status;
        var w = 0;
        if (esum > 0) {
          var p = parseFloat(ecount/esum*100).toFixed(1);
          var w = parseInt(p*2);
        }
        if (eclass == 0) {
          qTotal = ecount;
        } 
        $("#c-" + eclass).append("<span class=per>(" + p + "%)</span>");
      }
            
      var lastcount = $("#cat_sum").val();
      var newcount = esum;
      $("#cat_sum").val(esum);
      eTotal = esum;
      $("#event_sum").val(eTotal);

      if (caller == 0) { // Fresh load
        lastcount = newcount;
      }
      if (lastcount < newcount) {
        if (caller != 0) {
          $(".rt_notice").text('New Events are Available');
          $(".rt_notice").css('color','yellow');
        }
        $("#etotal").html(eTotal);
        $("#qtotal").html(qTotal);
      }
    }
  }

  if ($("#cat_sum").val() == 0) {
    statusPoll(0);
  }

  //
  // Event monitor (how often we poll for new events)
  //
 
  var emTimeout = 30000;
  window.setInterval(function(){
    if ($('#search').val().length == 0) {    
      statusPoll(1);
    }
  }, emTimeout);

  // Event priority bar and counts
  function mkPribar(v) {
    var sum = v.reduce(function(a,b) { return a + b; }, 0);
    var v0 = 0, v1 = 0, v2 = 0, v3 = 0; 
    var w = [];
    if( sum > 0) {
      w = [Number(v[0]/sum*100).toFixed(1),Number(v[1]/sum*100).toFixed(1),
           Number(v[2]/sum*100).toFixed(1),Number(v[3]/sum*100).toFixed(1)];
    }
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

    bar += "</tr></table>";

    return bar;  
  }

  $(document).on('click', '[class*="bpr"]', function() {
    // We disallow filtering if any events have already been selected
    if ($('.d_row_active')[0] || $(".chk_event:checked").length > 0) return;
    
    var prClass = $(this).attr('class').split('b')[1];
    var prOld = $(this).data('pr');

    function flipIt(pattern) {
      $(pattern).closest('tr').hide();
      $(pattern).closest('tr').attr('class','hidden');
      if ($('#menu1').text('on')) $(pattern).closest('tr').find('.chk_event').prop("disabled",true);
    }

    if ($('.b' + prClass).attr('class') == 'bprA') {
      $('.b' + prClass).attr('class', 'bpr' + prOld);
      $('.hidden').attr('class','d_row');
      $('.d_row').show();
      if ($('#menu1').text('on')) {
        $('.chk_event').prop("disabled",false);
        $('.chk_all').prop("checked",false);
        $('.chk_event').css("background-color", "#fafafa");
      } 
    } else {
      // See if we are already filtered
      if ($('.bprA')[0]) {
        $('.hidden').attr('class','d_row');
        $('.d_row').show();
        if ($('#menu1').text('on')) {
          $('.chk_event').prop("disabled",false);
          $('.chk_all').prop("checked",false);
          $('.chk_event').css("background-color", "#fafafa");
        }
        var prPrev = $('.bprA').data('pr');
        $('.bprA').attr('class', 'bpr' + prPrev);
      }  

      $('.b' + prClass).attr('class','bprA');
 
      switch (prClass) {
        case "pr1": ptrn = ".pr2,.pr3,.pr4"; break;
        case "pr2": ptrn = ".pr1,.pr3,.pr4"; break;
        case "pr3": ptrn = ".pr1,.pr2,.pr4"; break;
        case "pr4": ptrn = ".pr1,.pr2,.pr3"; break;
      }

      flipIt(ptrn);
    }
  });
  
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
        cells += "<td class=c_on title=\"" + n + ":00 &#61;&gt; " + o + " events\">1</td>";
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

  $(document).on("click", '[class*="cl_"]', function(event) {
    var nc = $(this).attr('class').split("_");
    var ct = $(this).parents('table').data('comment');
    $(".cat_msg_txt").val(ct);
    $('#b_class-' + nc[1]).click();
  });
    
  //
  // Toggle and update views
  //

  function newView(req) {
    var cv = $("#menu1").text();
    switch (req) { // Either an update or view change    
      case "u":
        var f = "0-aaa-00";
        var s = "2a-aaa-00";
      break; 
      case "c":
        switch(cv) {
          case "on": $("#menu1").text("off");
            // If we are searching for something we show all events 
            // mainly because of specificity but also because 
            // returning nothing may be confusing (there are no RT but classed events do exist) 
            if ($("#search").val().length == 0) {
              $("#rt").text("on");
              $("#rt").attr('class','tvalue_on');
            }
          break;  
          case "off": $("#menu1").text("on"); break;
       }
       if ($("#search").val().length > 0) {
         eF = 1;
       } else {
         eF = 0;
       }
       f = "2a-aaa-00";
       s = "0-aaa-00";
      break;
    }

    var bail = $("#loader").css('display');
    if (bail != 'none') return;

    switch (cv) {
      case "on":
        $("#tl0,#tl1").remove();
        eventList(f);
        $("#loader").show();
        break;
      case "off":
        $("#tl3a,#tl3b").remove();
        eventList(s);
        $("#loader").show();
        break;
    }
  }

  // Group and ungroup
  $(document).on("click", "#menu1", function(event) {
    var cv = $(this).text();
    switch (cv) {
      case  'on': $(this).attr('class','tvalue_off'); break;
      case 'off': $(this).attr('class','tvalue_on'); $("#event_sort").val("DESC"); break;
    }
    newView("c"); 
  });

  // RT check/uncheck
  $(document).on("click", "#rt", function(event) {
    var cv = $('#rt').text();
    switch (cv) {
      case  'on': $('#rt').text('off'); rtbit = 0; $(this).attr('class','tvalue_off'); break;
      case 'off': $('#rt').text('on'); rtbit = 1; $(this).attr('class','tvalue_on'); break;
    }
    newView("u");
  });
   
  $(document).on("click", ".rt_notice", function(event) {
    $(".rt_notice").css('color','#c9c9c9');
    $(".rt_notice").text('Synchronized');
    newView("u");        
  });

  // Sort ASC/DESC
  $(document).on("click", ".event_time", function(event) {
    var csv = $(".event_time").text();
    switch (csv) {
      case "show oldest first":
        $("#event_sort").val("ASC");
        break;
      case "show newest first":
        $("#event_sort").val("DESC");
        break;
      }
      newView("u");
  });

  // Update page
  $(".b_update").click(function(event) {
    $(".rt_notice").css('color','#c9c9c9');
    $(".rt_notice").text('Synchronized');
    newView("u");
  });
 
  // If search is in focus, update on enter
  $('#search').keypress(function(e) {
    if(!e) e=window.event;
      key = e.keyCode ? e.keyCode : e.which;
      if(key == 13) {
        if ($('#search').val().length > 0) {
          eF = 1;
        } else {
          eF = 0;
        }
        // Close comment box if it is open
        if ($('#tlcom').length > 0) {
          cmtbRemove(); 
        }
        newView("u");
      }
  });

  // Clear search and refresh
  $('#clear_search').click(function() {
    if ($('#search').val() != '') {
      $('#search').val('');
      $("#search").focus();           
    }
  });

  //
  // Tab manipulations
  //

  // Logout
  $("#logout").click(function(event) {
    $.get("index.php?id=0", function(){location.reload()});
  });

  var tab_cached = $("#sel_tab").val();
  $('#' + tab_cached).attr('class','tab_active');
  $("#" + tab_cached + "_content").attr('class','content_active');

  $(".tab,.tab_active").mouseover(function(event) {
    $(this).css('color','#ffffff');
    $(this).css('background-color','#000000');
  });

  $(".tab,.tab_active").mouseout(function(event) {
    var curClass = $(this).attr('class');
    if ( curClass != "tab_active" ) {
      $(this).css('color','#adadad');
      $(this).css('background-color','#333333');
    }
  });

  $(".tab,.tab_active").click(function(event) {
    var active = $(".tab_active").attr('id');
    var content = $(".content_active").attr('id');

    if ( this.id != active ) {
      $("#" + active).removeClass('tab_active');
      $("#" + active).addClass('tab');
      $("#" + active).css('color','#adadad');
      $("#" + active).css('background-color','#333333');
      $(this).attr('class','tab_active');         
      $("#" + content).attr('class','content');
      $("#" + this.id + "_content").attr('class','content_active');
      activeTab = $(".tab_active").attr('id')
      $('#sel_tab').val(activeTab);
      var ctab = $('#sel_tab').val();
      var urArgs = "type=" + 5 + "&tab=" + ctab;
      $.get(".inc/callback.php?" + urArgs, function(){Null});
    }
  });

  // Section show and hide
  $(".label_m").click(function(event) {
    var thisSec = $(this).data("sec");
    var thisSecID = "#sec_" + thisSec;
    var thisSecVis = $(thisSecID).css("display");
    var lastSection = "h";
    switch (thisSecVis) {
      case "none":
        $(this).html("<img src=.css/uarr.png>");
        if (thisSec != lastSection) $(this).parent().css("border-bottom","1pt dotted #666");
        $(thisSecID).slideDown();
      break;
      default:
        $(this).html("<img src=.css/darr.png>");
        if (thisSec != lastSection) $(this).parent().css("border-bottom","none");
        $(thisSecID).slideUp();
      break;
    }
  });

  //
  // Rows
  //

  function closeRow() {
    $("#active_eview").remove();
    $("#" + this.id).attr('class','d_row');
    $(".d_row").css('opacity','1');
    $(".d_row_active").find('[class*="row"]').css('color', 'gray');
    $(".d_row_active").find('[class*="row"]').css('background', 'transparent');
    $(".d_row_active").find('td').css('border-top', 'none')
    ltCol = $(".d_row_active").find('td.lt').html();
    $(".d_row_active").find('td.lt').css('background', ltCol);
    $(".d_row_active").attr('class','d_row');
    // Update class_count
    $("#class_count").text(lastclasscount);
    // Get rid of any crashed loaders
    $("#loader").hide();
    // Reset checkbox
    $(".chk_all").prop("checked",false);
  }
  function closeSubRow() {
    $("#eview_sub1").remove();
    $("#" + this.id).attr('class','d_row_sub');
    $(".d_row_sub").css('opacity','1');
    $(".d_row_sub_active").find('[class*="sub"]').css('color', 'gray');
    $(".d_row_sub_active").find('[class*="sub"]').css('border-top', 'none');
    $(".d_row_sub_active").find('[class*="sub"]').css('background', 'transparent');
    $(".d_row_sub_active").attr('class','d_row_sub');
    // Update class_count
    $("#class_count").text(lastclasscount);
    curclasscount = lastclasscount;
    $("#loader").hide();
    // Reset and show checkbox
    $(".chk_all").prop("checked",false);
    $("#ca0").show();
  }
  function closeSubRow1() {
    $("#eview_sub2").remove();
    $("#" + this.id).attr('class','d_row_sub1');
    if (!$("#eview_sub3")[0]) {
      $(".d_row_sub1").css('opacity','1');
      $(".d_row_sub1_active").find('td').css('border-top', 'none');
      $(".d_row_sub1_active").attr('class','d_row_sub1');
    }
    $("#loader").hide();
    // Reset checkbox
    $(".chk_all").prop("checked",false);
  }
  function closeSubRow2() {
    $("#eview_sub3").remove();
    $("#" + this.id).attr('class','d_row_sub1');

    if (!$("#eview_sub2")[0]) {
      $(".d_row_sub1").css('opacity','1');
      $(".d_row_sub1_active").find('td').css('border-top', 'none');
      $(".d_row_sub1_active").attr('class','d_row_sub1');
    }
    $("#loader").hide();
  }

  // Reset if headings are clicked
  $(document).on("click", "#ev_close", function(event) {
    closeRow();
  });

  // Close open sub views
  $(document).on("click", "#ev_close_sub", function(event) {
    closeSubRow();
  });

  // Close open packet data
  $(document).on("click", "#ev_close_sub1", function(event) {
    closeSubRow1();
  });

  // Close open TX
  $(document).on("click", "#ev_close_sub2", function(event) {
    closeSubRow2();
  });

  //
  //  Level 1
  //

  $(document).on("click", ".row_active", function(event) {
    var curID = $(this).parent().attr('id');        
    // What type of row are we?
    rowType = curID.substr(0,3);

    // Make sure no other instances are open
    if (!$(".d_row_active")[0] && rowType == 'sid') {
      $("#loader").show(); 
      // This leaves us with sid-gid
      rowValue = curID.replace("sid-","");
     
      $(".d_row_active").attr('class', 'd_row');
      $("#active_eview").attr('class','d_row');
            
      // This is now the active row
      $("#" + curID).attr('class','d_row_active');
      $("#" + curID).find('[class*="row"]').css('border-top', '1pt solid #c9c9c9');
      $("html, body").animate({ scrollTop: $('.d_row_active').offset().top - 140 }, 20);
      // History
      var itemToAdd = $("#" + curID).find('[class*="row_filter"]').text();
      hItemAdd(itemToAdd);
      // Set the class count (counted again after load)
      curclasscount = $('.d_row_active').data('event_count');
      var cols = $('th.sort').length;
      var tbl = '';
      tbl += "<tr class=eview id=active_eview><td colspan=" + cols + "><div id=eview class=eview>";
      tbl += "<div id=ev_close class=close><div class=b_close title='Close'><img src=.css/close.png></div></div>";
      tbl += "<div class=sigtxt></div>";
      tbl += "<div class=chrt_ts></div>";
      tbl += "<div class=event_class><input id=ca0 class=chk_all type=checkbox>";
      tbl += "categorize <span class=bold id=class_count>";
      tbl += curclasscount + "</span> event(s)</div>";
      tbl += "</td></tr>";
      $("#" + curID).after(tbl);
      eventList("1-" + rowValue);
      sigLookup(rowValue);
      $("#eview").show();
      $(".d_row").fadeTo('0','0.2');
    }
  });
 
  //
  //  Level 2
  //

  $(document).on("click", ".sub_active", function() {
    if (!$(".d_row_sub_active")[0]) {
      baseID = $(this).parent().attr('id');
      columnType = this.id[2];

      // Reset checkbox
      $(".chk_all").prop("checked",false);

      // Did they click RT or ALL?
      switch (columnType) {
        case "l": adqp = s2h("AND event.status = 0"); break;
        case "r": adqp = s2h("empty"); break;
      }

      rowcall = baseID.split("-");
      callerID = rowcall[0];
      $("#" + callerID).attr('class','d_row_sub_active');
      // History
      $("#" + callerID).find('[class*="sub_filter"]').each(function() {
        if ($(this).data('type') == 'cc') {
          var itemToAdd = $(this).data('value');
        } else {
          var itemToAdd = $(this).text();
        } 
        hItemAdd(itemToAdd);
      });
      $("#" + callerID).find('[class*="sub"]').css('border-top', '1pt solid #c9c9c9');
      $("#loader").show();
      eventList("2-" + baseID + "-" + adqp);
    }  
  });

  //
  //  Level 3 (a or b) request payload
  //
    
  $(document).on("click", ".b_PL", function() {
    if (!$("#eview_sub2")[0] && !$("#eview_sub3")[0]) {
      baseID = $(this).data('eidl');
      rowcall = baseID.split("-");
      callerID = rowcall[0];
      $("#" + callerID).attr('class','d_row_sub1_active');
      $("#" + callerID).find('td').css('border-top', '1pt solid #c9c9c9');
      $("#loader").show();           
      eventList("3-" + baseID);
    }
  });

  //
  // Level 3 (a or b) request transcript
  //

  $(document).on("click", ".b_TX", function(event) {
    if (!$(".eview_sub3")[0] && !$(".eview_sub2")[0]) {
      $("#loader").show();
      composite = $(this).data('tx').split("-");
      rowLoke = composite[0];
      $("#" + rowLoke).attr('class','d_row_sub1_active');
      $("#" + rowLoke).find('td').css('border-top', '1pt solid #c9c9c9');
      nCols = $("#" + rowLoke).find('td').length;
      cid = composite[1];
      txdata = composite[2];
         
      // See if a transcript is available
      var urArgs = "type=" + 7 + "&txdata=" + txdata;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb5(data)});
      });

      function cb5(data){
        eval("txRaw=" + data);
        txCMD    = txRaw.cmd;
        txResult = txRaw.tx;

        var row = '',tbl = '';
        row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
        row += "<tr>";
        row += "<td class=txtext>";
        row += txResult;
        row += "</td></tr></table>";

        tbl += "<tr class=eview_sub3 id=eview_sub3><td class=sub2 colspan=" + nCols + ">";
        tbl += "<div id=ev_close_sub2 class=close_sub1>";
        tbl += "<div class=b_close title='Close'><img src=.css/close.png></div></div>";
        tbl += row;
        tbl += "</td></tr>";
        $("#" + rowLoke).after(tbl);

        // Turn off fade effect for large results
        var rC = $(".d_row_sub1").length;
        if ( rC <= 399 ) {
          $(".d_row_sub1").fadeTo('fast','0.2');
        }

        $("#loader").hide();
      }
    }
  });

  // Toggle RT depending on entry point
  var rtbit;
  $(document).on("click", ".b_ec_hot", function() {
    rtbit = 1;
  });
  $(document).on("click", ".b_ec_total", function() {
    rtbit = 0;
  });

  //
  // This creates the views for each level
  //

  function eventList (type) {

    theWhen = getTimestamp();
    var parts = type.split("-");
    var filterMsg = '';
    var rt = 0;
    var theFilter = s2h('empty');
    var theSensors = s2h('empty');
    // See if we are just RT events
    if ($('#rt').text() == 'on' || rtbit == 1) {
      rt = 1;
      rtbit = 1;
    }

    // How are we sorting?
    var sortval = $("#event_sort").val(), sorttxt;
    switch (sortval) {
      case "DESC": sorttxt = "show oldest first"; break;
      case  "ASC": sorttxt = "show newest first"; break;
    }

    // See if we are filtering by sensor
    if ($('.chk_sen:checked').length > 0) {
      var active_sensors = "AND event.sid IN(";
      var iter  = $('.chk_sen:checked').length;
      $('.chk_sen:checked').each(function() {
        active_sensors += "'" + $(this).val() + "',";
      });
      active_sensors = active_sensors.replace(/,+$/,'');
      active_sensors += ")";
      theSensors = s2h(active_sensors);
    }

    // Check for any filters
    if ($('#search').val().length > 0 && eF == 1) {
      var fParts = $('#search').val().split(" ");
      // Let the filter notifier know
      $('.fl_val').text('YES');
      if (fParts[0] == 'cmt') {
        theFilter = s2h($('#search').val()); 
      } else {
        // Now see if the requested filter exists
        if ($("#tr_" + fParts[0]).length > 0) {
          tmpFilter = $("#tr_" + fParts[0]).data('filter');
          // Now see if we need to modify the query
          if(fParts[1]) { 
            // This is the base filter
            preFilter = h2s(tmpFilter);
            // This is the user supplied text.
            theQuestion = fParts[1].replace(/['@|&;*\\`]/g, "");
            // We will accept multiple questions if they are comma delimited
            questionParts = theQuestion.split(",");
            if (questionParts.length > 1) {
              var f = '(';
              for (var i = 0; i < questionParts.length; i++) {
                f += preFilter.replace(/\$/g, questionParts[i]);
                if (i != (questionParts.length - 1)) {
                  f += " OR ";
                } 
              }
              f += ')'; 
              theFilter = s2h(f); 
            } else {
              var newFilter = preFilter.replace(/\$/g, questionParts[0]);
              theFilter = s2h(newFilter);
            }        
          } else {
            theFilter = tmpFilter;
          }
        }
      }
    } else {
      $('.fl_val').text('NO');
      eF = 0;
    }

    switch (parts[0]) {

    // Level 0 view - Grouped by Signature
    case "0":
      $('.value').text('-');
      statusPoll(0);
      var urArgs = "type=" + parts[0] + "&object=" + type + "&ts=" + theWhen + "&filter=" + theFilter + "&sensors=" + theSensors + "&rt=" + rt + "&sv=" + sortval;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb1(data)});
      });
      function cb1(data){
        eval("d0=" + data);
        var tbl = '';
        var head = '';
        var row = '';
        var cols = 11;
       
        if (rt == 0) cols = 12;
        head += "<thead>";
        head += "<tr><th id=priority_bar colspan=" + cols + "></th></tr>";
        head += "<tr>";
        head += "<th class=sort width=45>QUEUE</th>";
        if (rt == 0) head += "<th class=sort width=45>ALL</th>";
        head += "<th class=sort width=15 title=Priority></th>";
        head += "<th class=sort width=40>SC</th>";
        head += "<th class=sort width=40>DC</th>";
        if (rt == 0) head += "<th class=sort width=40>CLASS</th>";
        head += "<th class=sort width=70>ACTIVITY</th>";
        head += "<th class=sort width=90>LAST EVENT</th>";
        head += "<th class=sort>SIGNATURE</th>";
        head += "<th class=sort>ID</th>";
        head += "<th class=sort width=60>PROTO</th>";
        head += "<th class=sort width=80>% TOTAL</th>";
        head += "</tr></thead>";

        var sumEC = 0, sumSC = 0, sumDC = 0, sumSI = "-", spr1 = 0, spr2 = 0, spr3 = 0, spr4 = 0;

        if (d0.length > 0) {
          // Sums for boxes 
          for (var i=0; i<d0.length; i++) {
            sumEC += Number(d0[i].f1);
            sumSC += Number(d0[i].f6);
            sumDC += Number(d0[i].f7);
          }
          sumSI = d0.length || "-";
        } else {
          row += "<tr class=d_row><td class=row colspan=" + cols + ">";
          row += "No result.</td></tr>";
        }
  
        if (rt == 1) {
          sumSC = "-";
          sumDC = "-";
          sumEC = eTotal;
        }
        var sumRT = 0;
        for (var i=0; i<d0.length; i++) {

          // How many events are not categorized?
          var unClass = d0[i].f11.split(",").filter(function(x){return x==0}).length;

          // Colour based on event presence
          if ( unClass > 0 ) {
            rtClass = "b_ec_hot";
            isActive = "row_active";
            sumRT += parseInt(unClass);
          } else {
            rtClass = "b_ec_cold";
            isActive = "row";
          }

          // Disable ec_total if we are RT
          ttlActive = "row_active";
          if (rt == 1) {
            ttlActive = "row";
          }

          // Sum priorities
          var prC = Number(d0[i].f1);
          switch (d0[i].f13) {
            case "1": spr1 += prC; break;
            case "2": spr2 += prC; break;
            case "3": spr3 += prC; break;
            default: spr4 += prC; break;
          }                   

          rid = "r" + i + "-" + parts[1];
          var cells = mkGrid(d0[i].f12);
          if (rt == 0) var catCells = catGrid(d0[i].f11,0,0);
          row += "<tr class=d_row id=sid-" + d0[i].f3 + "-" + d0[i].f4;
          row += " data-event_count=" + d0[i].f1 + ">";
          row += "<td class=" + isActive + "><div class=" + rtClass + ">" + unClass + "</div></td>";
          if (rt == 0) row += "<td class=" + ttlActive + "><div class=b_ec_total>" + d0[i].f1 + "</div></td>";
          row += "<td class=row><div class=pr" + d0[i].f13 + ">" + d0[i].f13 + "</div></td>";
          row += "<td class=row><span class=blue>" +d0[i].f6+ "</span></td>";
          row += "<td class=row><span class=red>" +d0[i].f7+ "</span></td>";
          if (rt == 0) row += "<td class=row>" + catCells + "</td>";

          timeParts = d0[i].f5.split(" ");
          timeStamp = timeParts[1];

          row += "<td class=row>" + cells + "</td>";
          row += "<td class=row>" + timeStamp + "</td>";
          row += "<td class=row_filter data-type=sid data-value=";
          row += d0[i].f3 + ">" + d0[i].f2 + "</td>";
          row += "<td class=row>" + d0[i].f3 + "</td>";
          row += "<td class=row>" + d0[i].f8 + "</td>";
                  
          if( sumEC > 0) {
            rowPer = Number(d0[i].f1/sumEC*100).toFixed(3);
          } else {
            rowPer = "0.000%";
          }
   
          row += "<td class=row><b>" + rowPer + "%</b></td>";
          row += "</td></tr>";
        }
        
        // Populate event summary
        $('#qtotal').text(sumRT); 
        $('#etotal').text(sumEC); 
        $('#esignature').text(sumSI);
        $('#esrc').text(sumSC);
        $('#edst').text(sumDC); 
        
        tbl += "<table width=100% id=tl1 cellpadding=0 cellspacing=0 align=center>";
        tbl += head;
        tbl += row;
        tbl += "</table>";
        
        $('#' + parts[1] + '-' + parts[2]).after(tbl);
        
        if (d0.length > 0) {
          var prVals = [spr1,spr2,spr3,spr4];
          var pryBar =  mkPribar(prVals);
          $('#priority_bar').append(pryBar);
        } else {
          $('#priority_bar').hide();        
        }
        $('#tl0,#tl1').fadeIn('slow');
        $("#tl1").tablesorter({
          headers: {
            0:{sorter:false}
          }
        });
        if ($('#tl4').length == 0) {
          loadFilters(0);
        }
        $("#loader").hide();
      }
      break;

    // Level 1 view - Grouped by signature, source, destination

    case "1":
      var urArgs = "type=" + parts[0] + "&object=" + parts[1] + "&ts=" + theWhen + "&filter=" + theFilter + "&sensors=" + theSensors + "&rt=" + rt + "&sv=" + sortval;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb2(data)});
      });

      function cb2(data){
        eval("theData=" + data);
        tbl = '';
        head = '';
        row = '';
        head += "<thead><tr><th class=sub width=45>QUEUE</th>";
        if (rt == 0) head += "<th class=sub width=45>TOTAL</th>";
        if (rt == 0) head += "<th class=sub width=45>CLASS</th>";
        head += "<th class=sub width=70>ACTIVITY</th>";
        head += "<th class=sub>LAST EVENT</th>";
        head += "<th class=sub width=110>SOURCE</th>";
        head += "<th class=sub width=160>COUNTRY</th>";
        head += "<th class=sub width=110>DESTINATION</th>";
        head += "<th class=sub width=160>COUNTRY</th>";
        head += "</tr></thead>";
        var curclasscount = 0, tlCount = 0, rtCount = 0;
        var timeValues = "", scid = "";

        for (var i=0; i<theData.length; i++) {
          var count     = theData[i].count   || "0"; 
          var src_ip    = theData[i].src_ip  || "-";
          var dst_ip    = theData[i].dst_ip  || "-";
          var max_time  = theData[i].maxTime || "-";
          var src_clong = theData[i].src_cc  || "unknown";
          var src_cc    = theData[i].srcc    || "-";
          var dst_clong = theData[i].dst_cc  || "unknown";
          var dst_cc    = theData[i].dstc    || "-";
          var c_sid     = theData[i].c_sid   || "0";
          var c_cid     = theData[i].c_cid   || "0";
          var cs = getCountry(src_cc).split("|");
          if (cs[1] == "LO") { cs[1] = ""; }
          var cd = getCountry(dst_cc).split("|");
          if (cd[1] == "LO") { cd[1] = ""; }

          // Create sid.cid list
          var sids = c_sid.split(",");
          var cids = c_cid.split(",");
          $.each(sids, function(a,b) {
            scid += b + "." + cids[a] + ",";
          });

          // How many events are not categorized?
          es0 = theData[i].c_status.split(",");
          var unclass = 0;                  
          $.each(es0, function(a,b) {
            switch (b) {
              case "0": unclass++; break;
            }
          });
                 
          // Colour based on event presence
          if ( unclass > 0 ) {
            rtClass = "b_ec_hot";
            isActive = "sub_active";
          } else {
            rtClass = "b_ec_cold";
            isActive = "sub";
          }

          // Disable ec_total if we are RT
          ttlActive = "sub_active";
          if (rt == 1) {
            ttlActive = "sub";
          }
                  
          // Aggregate time values
          timeValues += theData[i].c_ts + ",";
          var cells = mkGrid(theData[i].f12);
          if (rt == 0) var catCells = catGrid(theData[i].c_status,0,0);
                  
          // Event sums
          tlCount += parseInt(count,10);
          rtCount += parseInt(unclass,10);

          rid = "r" + i + "-" + parts[1] + "-" + src_ip + "-" + dst_ip;
          row += "<tr class=d_row_sub id=r" + i + " data-filter=\"" + rid + "\">";
          row += "<td class=" + isActive + " id=l2l" + i + "><div class=" + rtClass + ">" + unclass + "</div></td>";
          if (rt == 0) row += "<td class=" + ttlActive + " id=l2r" + i + "><div class=b_ec_total>" + count + "</div></td>";
          if (rt == 0) row += "<td class=sub>" + catCells + "</td>";
          row += "<td class=sub>" + cells + "</td>";
          row += "<td class=sub>" + max_time + "</td>";
          row += "<td class=sub_filter data-type=ip>" + src_ip + "</td>";
          row += "<td class=" + cs[0] + " data-type=cc data-value=" + src_cc + ">";
          row += cs[1] + src_clong + " (." + src_cc.toLowerCase() + ")" + "</td>";
          row += "<td class=sub_filter data-type=ip>" + dst_ip + "</td>";
          row += "<td class=" + cd[0] + " data-type=cc data-value=" + dst_cc + ">";
          row += cd[1] + dst_clong + " (." + dst_cc.toLowerCase() + ")" + "</td>";
          row += "</tr>";
        }
        
        // Add scid's to checkbox
        $("#ca0").data("scid", scid.replace(/,$/, ""));

        // If queue is empty provide event sums in case the user 
        // intends to reclass anything
        if (rtbit == 1) {
          curclasscount = rtCount;
        } else {
          curclasscount = tlCount;
        }

        // update class_count
        $("#class_count").html(curclasscount);            
        lastclasscount = $("#class_count").html();

        // While in grouped events (RT) we remove rows as
        // they are classed and subtract the values from "Total Events"
        // This keeps etotal up to date so the math doesn't get silly 
        var oldrt = Number($(".d_row_active").find(".b_ec_hot").text());
        var oldec = Number($("#etotal").text());
        if (oldrt < rtCount) {
          newrtcount = parseInt((rtCount - oldrt) + oldec);
          $("#etotal").text(newrtcount);
        } 

        // Update parent counts
        $(".d_row_active").find(".b_ec_hot").text(rtCount);
        if (rt == 0) $(".d_row_active").find(".b_ec_total").text(tlCount);

        tbl += "<div class=eview_sub id=eview_sub><table id=tl2 class=table cellpadding=0 cellspacing=0>";
        tbl += head;
        tbl += row;
        tbl += "</table></div>";
        $("#eview").after(tbl);
        $("#tl2").tablesorter({
          headers: {
            4: {sorter:'ipv4'},
            6: {sorter:'ipv4'}
          }
        });
        $("#loader").hide();
      }
      break;

    // Level 2 view - No grouping, individual events

    case "2":
      var rowLoke = parts[1];
      var filter = $('#' + parts[1]).data('filter');
      var urArgs = "type=" + parts[0] + "&object=" + filter + "&filter=" + theFilter + "&sensors=" + theSensors + "&ts=" + theWhen + "&adqp=" + parts[2] + "&rt=" + rt + "&sv=" + sortval;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb3(data)});
      });

      function cb3(data){
        eval("d2=" + data);
        tbl = '';
        head = '';
        row = '';
        head += "<thead><tr>";
        head += "<th class=sub1 width=20><input id=ca1 class=chk_all type=checkbox></th>";
        head += "<th class=sub1 width=20>ST</th>";
        head += "<th class=sub1 width=130>TIMESTAMP</th>";
        head += "<th class=sub1 width=110>EVENT ID</th>";
        head += "<th class=sub1 width=100>SOURCE</th>";
        head += "<th class=sub1 width=40>PORT</th>";
        head += "<th class=sub1 width=100>DESTINATION</th>";
        head += "<th class=sub1 width=40>PORT</th>";
        head += "<th class=sub1>SIGNATURE</th>";
        head += "</tr></thead>";
              
        // Update class_count
        $("#class_count").html(0);
        var tlCount=0, rtCount=0;
        for (var i=0; i<d2.length; i++) {
          var eclass    = d2[i].f1  || "-";
          var timestamp = d2[i].f2  || "-";
          var sid       = d2[i].f7  || "0";
          var cid       = d2[i].f8  || "0"; 
          var src_ip    = d2[i].f3  || "-";
          var src_port  = d2[i].f4  || "-";
          var dst_ip    = d2[i].f5  || "-";
          var dst_port  = d2[i].f6  || "-";
          var sig_id    = d2[i].f11 || "-";
          var signature = d2[i].f10 || "-";
          var txBit     = "";
          rid = "s" + i + "-" + sid + "-" + cid;
          eid = sid + "-" + cid;
          row += "<tr class=d_row_sub1 id=s" + i + " data-sg=0 data-cols=9 data-filter=\"" + eid + "\">";
          tclass = "c" + eclass;
          cv = classifications.class[tclass][0].short;

          // Event sums
          tlCount += parseInt(1,10);
          if (cv == "RT") {
            rtCount += parseInt(1,10);
          }

          txdata = "s" + i + "-" + cid + "-" + s2h(sid + "|" + timestamp + "|" + src_ip + "|" + src_port + "|" + dst_ip + "|" + dst_port);

          txBit = "<div class=n_TX>TX</div>";   
          if (src_port != "-" && dst_port != "-") {
            txBit = "<div class=b_TX data-tx=" + txdata + " title='Generate Transcript'>TX</div>";
          }

          row += "<td class=row><input id=cb_" + i + " class=chk_event "; 
          row += "type=checkbox value=\"" + sid + "." + cid + "\" data-eclass=" + eclass + ">";
          row += "<td class=row><div class=a_" + cv + " id=class_box_" + i + ">";
          row += cv + "</div></td>";
          row += "<td class=sub>" + timestamp + "</td>";
          row += "<td class=sub><div class=b_PL data-eidl=s" + i + " title=\"View Payload\">";
          row += sid + "." + cid + "</div>" + txBit + "</td>";
          row += "<td class=sub_filter data-type=ip>" + src_ip + "</td>";
          row += "<td class=sub_filter data-type=spt>" + src_port + "</td>";
          row += "<td class=sub_filter data-type=ip>" + dst_ip + "</td>";
          row += "<td class=sub_filter data-type=dpt>" + dst_port + "</td>";
          row += "<td class=sub_filter data-type=sid data-value= ";
          row += sig_id + ">" + signature + "</td>";
          row += "</td></tr>";
        }

        // Update parent counts
        $(".d_row_sub_active").find(".b_ec_hot").text(rtCount);
        if ($(".d_row_sub_active").find(".b_ec_total").text() < tlCount) {
          $(".d_row_sub_active").find(".b_ec_total").text(tlCount);
        }

        var cols = $('th.sort').length;

        tbl += "<tr class=eview_sub1 id=eview_sub1><td colspan=" + cols + "><div id=ev_close_sub ";
        tbl += "class=close_sub><div class=b_close title='Close'><img src=.css/close.png></div></div>";
        tbl += "<div class=notes></div>";
        tbl += "<table id=tl3 class=table align=center width=100% cellpadding=0 cellspacing=0>";
        tbl += head;
        tbl += row;
        tbl += "</table></td></tr>";
        $("#" + rowLoke).after(tbl);
        $(".d_row_sub").fadeTo('0','0.2');
        $("#loader").hide();
        $("#tl3").tablesorter({
          headers: {
            0:{sorter:false},
            4:{sorter:'ipv4'},
            6:{sorter:'ipv4'}
          },
          cancelSelection:false
        });
        $("#ca0").hide();
      }
      break;
 
    // Level 2a view - No grouping, individual events

    case "2a":
      $('.value').text('-');
      statusPoll(0);
      var urArgs = "type=2a&ts=" + theWhen + "&filter=" + theFilter + "&sensors=" + theSensors + "&rt=" + rt + "&sv=" + sortval;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb3a(data)});
      });

      function cb3a(data){
        eval("d2a=" + data);

        tbl = '';
        head = '';
        row = '';
        head += "<thead>";
        head += "<tr><th id=priority_bar colspan=13></th></tr>";
        head += "<tr>";
        head += "<th class=sub width=10><input id=ca2 class=chk_all type=checkbox></th>";
        head += "<th class=sub width=20>ST</th>";
        head += "<th class=sub width=2></th>";
        head += "<th class=sub width=120>TIMESTAMP</th>";
        head += "<th class=sub width=110>ID</th>";
        head += "<th class=sub width=90>SOURCE</th>";
        head += "<th class=sub width=40>PORT</th>";
        head += "<th class=sub width=30>CC</th>";
        head += "<th class=sub width=90>DESTINATION</th>";
        head += "<th class=sub width=40>PORT</th>";
        head += "<th class=sub width=30>CC</th>";
        head += "<th class=sub>SIGNATURE</th>";
        head += "</tr></thead>";
     
        if (d2a.length == 0) {
          row += "<tr class=d_row_sub1><td class=row colspan=122>";
          row += "No result.</td></tr>";
        }
 
        // Aggregate time values
        var timeValues = "";
        for (var ts=0; ts<d2a.length; ts++) {
          var datetimestamp = d2a[ts].f2.split(" ");
          timeValues += datetimestamp[1] + ",";
        }

        // Counters for priorities
        var spr1 = 0, spr2 = 0, spr3 = 0, spr4 = 0;
        
        // Max iterations
        var maxI = 500;

        var rsumRT = 0;
        for (var i=0; i<d2a.length; i++) {
          var aeclass = d2a[i].f1  || 0;
          if (aeclass == 0) rsumRT++;
        }
       
        for (var i=0; i<d2a.length; i++) {
          if (i == maxI) { break; }
          var eclass    = d2a[i].f1  || "-";
          var timestamp = d2a[i].f2  || "-";
          var sid       = d2a[i].f11 || "0";
          var cid       = d2a[i].f12 || "0";
          var src_ip    = d2a[i].f3  || "-";
          var src_port  = d2a[i].f4  || "-";
          var src_cc    = d2a[i].f6  || "-";
          var src_clong = d2a[i].f5  || "unknown";
          var dst_ip    = d2a[i].f7  || "-";
          var dst_port  = d2a[i].f8  || "-";
          var dst_cc    = d2a[i].f10 || "-";
          var dst_clong = d2a[i].f9  || "unknown";
          var sig_id    = d2a[i].f15 || "-";
          var sig_gen   = d2a[i].f17 || "-";
          var sig_pri   = d2a[i].f16 || "0";
          var signature = d2a[i].f14 || "-";
          var evt_msg   = "-";
          var cs = getCountry(src_cc).split("|");
          var cd = getCountry(dst_cc).split("|");

          // Sum priorities
          var prC = Number(1);
          switch (sig_pri) {
            case "1": spr1 += prC; break;
            case "2": spr2 += prC; break;
            case "3": spr3 += prC; break;
            default: spr4 += prC; break;
          }

          rid = "s" + i + "-" + sid + "-" + cid;
          eid = sid + "-" + cid;
          var sg = sig_id + "-" + sig_gen;  
          tclass = "c" + eclass;
          cv = classifications.class[tclass][0].short;
          txdata = "s" + i + "-" + cid + "-" + s2h(sid + "|" + timestamp + "|" + src_ip + "|" + src_port + "|" + dst_ip + "|" + dst_port);

          txBit = "<div class=n_TX>TX</div>";   
          if (src_port != "-" && dst_port != "-") {
            txBit = "<div class=b_TX data-tx=" + txdata + " title='Generate Transcript'>TX</div>";
          }
   
          row += "<tr class=d_row_sub1 id=s" + i + " data-sg=\"" + sg + "\" data-cols=12 data-filter=\"" + eid + "\">";
          row += "<td class=row><input id=cb_" + i + " class=chk_event "; 
          row += "type=checkbox value=\"" + sid + "." + cid + "\" data-eclass=" + eclass + "></td>";
          row += "<td class=row><div class=a_" + cv + " id=class_box_" + i + ">";
          row += cv + "</div></td>";
          row += "<td class=row><div class=pr" + d2a[i].f16 + ">" + d2a[i].f16 + "</div></td>";
          row += "<td class=row>" + timestamp + "</td>";
          row += "<td class=sub><div class=b_PL data-eidl=s" + i + " title=\"View Payload\">";
          row += sid + "." + cid + "</div>" + txBit + "</td>";
          row += "<td class=sub_filter data-type=ip>" + src_ip + "</td>";
          row += "<td class=sub_filter data-type=spt>" + src_port + "</td>";
          row += "<td class=" + cs[0] + " title=\"" + src_clong + "\" data-type=cc data-value=";
          row += src_cc +">" + cs[1] + "</td>";
          row += "<td class=sub_filter data-type=ip>" + dst_ip + "</td>";
          row += "<td class=sub_filter data-type=dpt>" + dst_port + "</td>";
          row += "<td class=" + cd[0] + " title=\"" + dst_clong + "\" data-type=cc data-value=";
          row += dst_cc +">" + cd[1] + "</td>";
          row += "<td class=sub_filter data-type=sid data-value=" + sig_id + ">" + signature + "</td></tr>";
        }
        
        var sumED = 0, sumEC = 0, cmsg = "";

        if (d2a.length > 0) {
          sumED = i;  
          sumEC = d2a.length;
        }
  
        if (d2a.length >= maxI) {
          sumRE = sumEC - maxI;
          cmsg = " / <span class=bold>"  + sumRE + "</span> not shown";
        }

       $("#qtotal").html(rsumRT);

        tbl += "<table id=tl3a class=chart align=center width=100% border=0 cellpadding=0 cellspacing=0>";
        tbl += "<tr><td class=dark colspan=10><div>";
        tbl += "<div class=chrt_ts></div>";
        tbl += "</div><div class=event_class>";
        tbl += "categorize <span class=bold id=class_count>" + 0 + "</span>";
        tbl += " of <span id=cat_count class=bold>" + sumED + "</span> event(s)" + cmsg;
        tbl += "</div><div class=event_time>" + sorttxt + "</div>";
        tbl += "</td></tr></table>";
        tbl += "<table id=tl3b class=main align=center width=100% cellpadding=0 cellspacing=0>";
        tbl += head;
        tbl += row;
        tbl += "</table>";
        $('#' + parts[1] + '-' + parts[2]).after(tbl);

        if (d2a.length > 0) {
          var prVals = [spr1,spr2,spr3,spr4];
          var pryBar =  mkPribar(prVals);
          $('#priority_bar').append(pryBar);
        } else {
          $('#priority_bar').hide();        
        }

        $("#tl3a,#tl3b").fadeIn('slow');
        $("#tl3b").tablesorter({
        headers: {
          0:{sorter:false},
          1:{sorter:false},
          5:{sorter:'ipv4'},
          8:{sorter:'ipv4'}
          },
          cancelSelection:false
        });
        $("#loader").hide();
      }
      break;

    // Level 3 view - Packet Data

    case "3":
      var rowLoke = parts[1];
      var nCols = $('#' + parts[1]).data('cols');
      var filter = $('#' + parts[1]).data('filter');
      var urArgs = "type=" + parts[0] + "&object=" + filter + "&ts=" + theWhen;
      var sg = $('#' + parts[1]).data('sg');
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb4(data)});
      });

      function cb4(data){
        eval("theData=" + data);

        var tbl = '', head = '', row = '';
        
        // If IP version is 0 we can jump right to the payload (likely bro, http or ossec agent) 
        if (theData[0].ip_ver != 0) {       
   
          head += "<table class=tlip align=center width=100% cellpadding=0 cellspacing=0>";
          head += "<tr>";
          head += "<th class=sub2 width=40 rowspan=2>IP</th>";
          head += "<th class=sub2>VER</th>";
          head += "<th class=sub2>IHL</th>";
          head += "<th class=sub2>TOS</th>";
          head += "<th class=sub2>LENGTH</th>";
          head += "<th class=sub2>ID</th>";
          head += "<th class=sub2>FLAGS</th>";
          head += "<th class=sub2>OFFSET</th>";
          head += "<th class=sub2>TTL</th>";
          head += "<th class=sub2>CHECKSUM</th>";
          head += "<th class=sub2>PROTO</th>";
          head += "</tr>";

          row += "<tr class=d_row_sub2>";
          row += "<td class=sub3>" + theData[0].ip_ver + "</td>";
          row += "<td class=sub3>" + theData[0].ip_hlen + "</td>";
          row += "<td class=sub3>" + theData[0].ip_tos + "</td>";
          row += "<td class=sub3>" + theData[0].ip_len + "</td>";
          row += "<td class=sub3>" + theData[0].ip_id + "</td>";
          row += "<td class=sub3>" + theData[0].ip_flags + "</td>";
          row += "<td class=sub3>" + theData[0].ip_off + "</td>";
          row += "<td class=sub3>" + theData[0].ip_ttl + "</td>";
          row += "<td class=sub3>" + theData[0].ip_csum + "</td>";
          row += "<td class=sub3>" + theData[0].ip_proto + "</td>";
          row += "</td></tr></table>";

          switch (theData[0].ip_proto) {
            case "1": 
              row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
              row += "<tr>";
              row += "<th class=sub2 width=40 rowspan=2>ICMP</th>";
              row += "<th class=sub2 width=184>TYPE</th>";
              row += "<th class=sub2 width=184>CODE</th>";
              row += "<th class=sub2 width=184>CHECKSUM</th>";
              row += "<th class=sub2 width=184>ID</th>";
              row += "<th class=sub2 width=184>SEQ#</th>";
              row += "</tr>";
              row += "<tr class=d_row_sub2>";
              row += "<td class=sub3>" + theData[1].icmp_type + "</td>";
              row += "<td class=sub3>" + theData[1].icmp_code + "</td>";
              row += "<td class=sub3>" + theData[1].icmp_csum + "</td>";
              row += "<td class=sub3>" + theData[1].icmp_id + "</td>";
              row += "<td class=sub3>" + theData[1].icmp_seq + "</td>";
              row += "</td></tr></table>";
            break;
   
            case "6":
              // TCP flags
              var tmpFlags = theData[1].tcp_flags || 'z';
              switch (tmpFlags) {
                case 'z': var tcpFlags = '--------'; break;
                default:
                  var binFlags = Number(theData[1].tcp_flags).toString(2);
                  var binPad = 8 - binFlags.length;
                  var tcpFlags = "00000000".substring(0,binPad) + binFlags;
                break;
              }
              var tcp_seq  = theData[1].tcp_seq  || '-';
              var tcp_ack  = theData[1].tcp_ack  || '-';
              var tcp_off  = theData[1].tcp_off  || '-';
              var tcp_res  = theData[1].tcp_res  || '-';
              var tcp_win  = theData[1].tcp_win  || '-';
              var tcp_urp  = theData[1].tcp_urp  || '-';
              var tcp_csum = theData[1].tcp_csum || '-';
              row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
              row += "<tr>";
              row += "<th class=sub2 width=40 rowspan=2>TCP</th>";
              row += "<th class=sub2 width=30>R1</th>";
              row += "<th class=sub2 width=30>R0</th>";
              row += "<th class=sub2 width=30>URG</th>";
              row += "<th class=sub2 width=30>ACK</th>";
              row += "<th class=sub2 width=30>PSH</th>";
              row += "<th class=sub2 width=30>RST</th>";
              row += "<th class=sub2 width=30>SYN</th>";
              row += "<th class=sub2 width=50>FIN</th>";
              row += "<th class=sub2>SEQ#</th>";
              row += "<th class=sub2>ACK#</th>";
              row += "<th class=sub2>OFFSET</th>";
              row += "<th class=sub2>RES</th>";
              row += "<th class=sub2>WIN</th>";
              row += "<th class=sub2>URP</th>";
              row += "<th class=sub2>CHECKSUM</th>";
              row += "</tr>";
              row += "<tr class=d_row_sub2>";
              row += "<td class=sub3>" + tcpFlags[0] + "</td>";
              row += "<td class=sub3>" + tcpFlags[1] + "</td>";
              row += "<td class=sub3>" + tcpFlags[2] + "</td>";
              row += "<td class=sub3>" + tcpFlags[3] + "</td>";
              row += "<td class=sub3>" + tcpFlags[4] + "</td>";
              row += "<td class=sub3>" + tcpFlags[5] + "</td>";
              row += "<td class=sub3>" + tcpFlags[6] + "</td>";
              row += "<td class=sub3>" + tcpFlags[7] + "</td>";
              row += "<td class=sub3>" + tcp_seq + "</td>";
              row += "<td class=sub3>" + tcp_ack + "</td>";
              row += "<td class=sub3>" + tcp_off + "</td>";
              row += "<td class=sub3>" + tcp_res + "</td>";
              row += "<td class=sub3>" + tcp_win + "</td>";
              row += "<td class=sub3>" + tcp_urp + "</td>";
              row += "<td class=sub3>" + tcp_csum + "</td>";
              row += "</td></tr></table>";
            break;
   
            case "17":
              row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
              row += "<tr>";
              row += "<th class=sub2 width=40 rowspan=2>UDP</th>";
              row += "<th class=sub2 width=460>LENGTH</th>";
              row += "<th class=sub2 width=460>CHECKSUM</th>";
              row += "</tr>";
              row += "<tr class=d_row_sub2>";
              row += "<td class=sub3>" + theData[1].udp_len + "</td>";
              row += "<td class=sub3>" + theData[1].udp_csum + "</td>";
              row += "</td></tr></table>";               
            break;
          }

          var p_hex = '', p_ascii = '', p_ascii_l = '';
                   
          // Data
          if (!theData[2]) {
            p_hex   = "No Data Sent.";
            p_ascii = "No Data Sent.";
          } else {
            p_pl = theData[2].data_payload;
            p_length = theData[2].data_payload.length;
            var b0 = 0;

            for(var i=0; i < p_length; i+=2) {
              b0++;
              t_hex = p_pl.substr(i,2);
              t_int = parseInt(t_hex,16);

              if ((t_int < 32) || (t_int > 126)) {
                p_hex     += t_hex + " ";
                p_ascii   += ".";
                p_ascii_l += ".";
              } else if (t_int == 60) {
                p_hex     += t_hex + " ";
                p_ascii   += "&lt;";
                p_ascii_l += "&lt;";
              } else if (t_int == 62) {
                p_hex     += t_hex + " ";
                p_ascii   += "&gt;";
                p_ascii_l += "&gt;";
              } else {
                p_hex     += t_hex + " ";
                p_ascii   += String.fromCharCode(parseInt(t_hex, 16));
                p_ascii_l += String.fromCharCode(parseInt(t_hex, 16));
              }

              if ((b0 == 16) && (i < p_length)) {
                p_hex   += "<br>";
                p_ascii += "<br>";
                b0 = 0;
              }
            }
          }

          row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
          row += "<tr>";
          row += "<th class=sub2 width=40 rowspan=2>DATA</th>";
          row += "<th class=sub2 width=460>HEX</th>";
          row += "<th class=sub2 width=460>ASCII</th>";
          row += "</tr>";
          row += "<tr class=d_row_sub2>";
          row += "<td class=sub3><samp>" + p_hex + "</samp></td>";
          row += "<td class=sub3><samp>" + p_ascii + "<samp></td>";
          row += "</td></tr>";
          row += "<tr class=d_row_sub2>";
          row += "<th class=sub3 width=40>ASCII</th>";
          row += "<td class=sub_txt colspan=2><samp>" + p_ascii_l + "<samp></td>";
          row += "</tr></table>";

        } else {

          head += "<table class=tlip align=center width=100% cellpadding=0 cellspacing=0>";
          head += "<tr>";
          head += "<th class=sub2>EVENT DETAIL</th>";
          head += "</tr>";

          var p_ascii = "No Data Sent.";
          if (theData[2]) {
            var re = /\n/g;
            p_ascii = h2s(theData[2].data_payload).replace(re, "<br>");
          }
          row += "<tr class=d_row_sub2>";
          row += "<td class=sub3_d>" + p_ascii + "</td>";
          row += "</tr></table>";
           
        }
                    
        tbl += "<tr class=eview_sub2 id=eview_sub2><td class=sub2 colspan=" + nCols + "><div id=ev_close_sub1 class=close_sub1><div class=b_close title='Close'><img src=.css/close.png></div></div>";

        if ( sg != 0 ) {
          tbl += "<div class=sigtxt></div>";
          sigLookup(sg);
        }
        var eventComment = theData[0].comment || 'None.';
        tbl += "<div class=comments><b>Comments:</b> " + eventComment + "</div>";
        tbl += head;
        tbl += row;
        tbl += "</td></tr>";
        $("#" + rowLoke).after(tbl);
        $("#loader").hide();

        // Turn off fade effect for large results
        var rC = $(".d_row_sub1").length;
        if ( rC <= 499 ) {
          $(".d_row_sub1").fadeTo('fast','0.2');
        }
        $("#" + rowLoke).find('.getpl').html(theData[0].sid + "." + theData[0].cid);
      }
      break;
    }
  } 

  //
  // Add filter parts to box
  //

  function hItemAdd(item) {
    var itemTitle = item;
    // Truncate
    if (item.length > 33) {
      itemTitle = item.substring(0,33) + "..";
    }
    // Remove empty message
    if ($('#h_empty')[0]) $('#h_empty').remove();

    // If the item doesn't exist, add it. Otherwise, we start counting.
    if ($(".h_item:contains('" + itemTitle + "')").length > 0) {
      var oc = $(".h_item:contains('" + itemTitle + "')").data('n');
      var nc = Number(oc) + 1;
      var bg = '#c9c9c9';
      var fn = 'normal';
      if (nc <= 3) { 
        bg = '#000';
      } else if (nc > 3) {
        bg = '#cc0000';
        fn = 'bold';
      } 
 
      $(".h_item:contains('" + itemTitle + "')").css('color', bg);
      $(".h_item:contains('" + itemTitle + "')").css('font-weight', fn);
      $(".h_item:contains('" + itemTitle + "')").data('n',nc);
      $(".h_item:contains('" + itemTitle + "')").text(itemTitle + "(" + nc + ")");
    } else {
      var toAdd = "<span data-n=1 class=h_item title=\"" + item + "\"> " + itemTitle + "</span>";
      $('#h_box').append(toAdd);
    }
  }

  $(document).on("click", ".pop", function() {
    var cid = $('.pop').attr('id');
    switch (cid) {
      case 'pi': 
        $('.pop').attr('id','po');
        $('.pop').attr('src','.css/pi.png');
        $('#h_box').attr('class','h_box_o');
        $('.pop').attr('title','Click to collapse'); 
      break;
      case 'po':
        $('.pop').attr('id','pi');
        $('.pop').attr('src','.css/po.png');
        $('#h_box').attr('class','h_box');
        $('.pop').attr('title','Click to expand');
      break;
    } 
  });

  if (!$('.h_item')[0]) {
    $('#h_box').append('<span id=h_empty>History is empty</span>');
  }

  $(document).on("click", ".sub_filter,.row_filter,.tof", function() {
    // If someone is looking in the live queue and then performs a search
    // we need to reset to all events
    rtbit = 0;

    var prefix = $(this).data('type');
    var suffix = $(this).html();
    var tfocus = "#search";
    switch (prefix) {
      case    'ip': $('#search').val(prefix + " " + suffix);
                    hItemAdd(suffix);
      break;

      case    'cc': var cc = $(this).data('value');
                    $('#search').val(prefix + " " + cc);
                    hItemAdd(cc);
      break;

      case   'cmt': suffix = $(this).data('comment');
                    $("#rt").text("off");
                    $("#rt").attr('class','tvalue_off');
                    $('#search').val(prefix + " " + suffix);
                    hItemAdd(suffix);
      break;
          
      case 'cmt_c': $('.cat_msg_txt').val(suffix);
                    hItemAdd(suffix);
                    tfocus = ".cat_msg_txt";
      break;
 
      case   'sid': var value = $(this).data('value');
                    $('#search').val(prefix + " " + value);
                    hItemAdd(suffix);
      break;
 
      case   'spt': $('#search').val(prefix + " " + suffix);
                    hItemAdd(suffix);
      break;

      case   'dpt': $('#search').val(prefix + " " + suffix);
                    hItemAdd(suffix);
      break;
    } 
    $(tfocus).focus();
  });

  // 
  // Comment box
  //

  function cmtbRemove() {
    $(".cat_box").fadeOut();
    $(".cat_msg_txt").val("");
    $(".pcomm").remove();
    $(".content_active").fadeTo('fast',1);
  }

  $(document).on("click", ".cat_close", function(event) {
    cmtbRemove();
  });

  $(document).on("click", "#comments", function(event) {
    if ($('#tlcom').length > 0) {
      cmtbRemove();
    } else {
      var urArgs = "type=11";

      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb11(data)});
      });

      function cb11(data){
        eval("comraw=" + data);
        var tbl = '', head = '', row = ''; 

        head += "<thead><tr>";
        head += "<th class=sub width=20>ST</th>";
        head += "<th class=sub width=50>COUNT</th>";
        head += "<th class=sub>COMMENT</th>";
        head += "<th class=sub width=70>FILTER</th>";
        head += "<th class=sub width=100>USERNAME</th>";
        head += "<th class=sub width=75>EPOCH</th>";
        head += "<th class=sub width=75>LAST</th>";
        head += "<th class=sub width=70>REMOVE</th>";
        head += "</tr></thead>";         
 
        for (var i=0; i<comraw.length; i++) {
          var comment = comraw[i].f2 || "-";
          var count   = comraw[i].f1 || "-";
          var user    = comraw[i].f3 || "-";  
          var epoch   = comraw[i].f4 || "-";
          var last    = comraw[i].f5 || "-";
          var eclass  = comraw[i].f6 || "-";
          var rowid   = "comrow" + i;
          var cgrid = catGrid(eclass,comment,1);
          row += "<tr id=" + rowid + " class=pcomm>";
          row += "<td class=sub>" + cgrid + "</td>"; 
          row += "<td class=sub>" + count + "</td>";
          row += "<td class=row_filter data-type=cmt_c>" + comment + "</td>";
          row += "<td class=sub>";
          row += "<div class=tof title=\"Add as filter\" data-type=cmt data-comment=\"" + comment + "\">F</div></td>";
          row += "<td class=sub>" + user + "</td>";
          row += "<td class=sub>" + epoch + "</td>";
          row += "<td class=sub>" + last + "</td>";
          row += "<td class=sub>";
          row += "<div class=tod title=\"Delete Entry\" data-rn=\"" + rowid + "\" data-comment=\"" + comment + "\">X</div></td>";
          row += "<row>"; 
        }

        tbl += "<div class=pcomm>";
        tbl += "<b>Note:</b> you can click a comment below to reuse it (followed by a classification action) <b>or</b> ";
        tbl += "click on the \"F\" icon followed by \"enter\" to use as a filter<br>";
        tbl += "<table id=tlcom width=930 class=table cellpadding=0 cellspacing=0>";
        tbl += head;
        tbl += row;
        tbl += "</table></div>";
        $(".cm_tbl").append(tbl);
        $("#tlcom").tablesorter();
      }

      $(".content_active").fadeTo('fast',0.2);
      $(".cat_box").fadeIn();
      $(".cat_msg_txt").focus();   
    }
  });

  // Remove a comment
  $(document).on("click", ".tod", function(event) {
    var oktoRM = confirm("Are you sure you want to remove this comment?");
    if (oktoRM) {
      var theComment = s2h($(this).data('comment'));
      var rowNumber = $(this).data('rn');
      var urArgs = "type=12&comment=" + theComment;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb12(data)});
      }); 

      function cb12(data){
        eval("theData=" + data);
        if (theData.msg != '') {
          alert(theData.msg);
        } else {
          $("#" + rowNumber).fadeOut('slow', function() {
            $("#" + rowNumber).remove();
          });
        }
      }
    }
  });

  $.alt('2', function() {
    $("#comments").click();
  });

  //
  // Event classification
  //
    
  // Use function keys to trigger status buttons
  $(document).keydown(function(event){

    function stopOthers() { 
      event.originalEvent.keyCode = 0;   
      event.preventDefault();
      event.stopPropagation();
    }

    switch (event.keyCode) {
      case 112: stopOthers(); $('#b_class-11').click(); break;
      case 113: stopOthers(); $('#b_class-12').click(); break;
      case 114: stopOthers(); $('#b_class-13').click(); break;
      case 115: stopOthers(); $('#b_class-14').click(); break;
      case 116: stopOthers(); $('#b_class-15').click(); break;
      case 117: stopOthers(); $('#b_class-16').click(); break;
      case 118: stopOthers(); $('#b_class-17').click(); break;
      case 119: stopOthers(); $('#b_class-1').click(); break;
      case 120: stopOthers(); $('#b_class-2').click(); break;
    }
  });

  // Highlight colour for selected events
  var hlcol = "#FFFFE0";
  var hlhov = "#FDFDD6";

  // Individual selects
  var clickOne = 0, clck1 = 0, clck2 = 0;
  $(document).on("click", ".chk_event", function(event) {
    $("#tl3b").trigger('update');
    var clickTwo = this.id.split("_");
    if (Number(clickOne[1]) > Number(clickTwo[1])) {
      clck1 = clickTwo[1];
      clck2 = clickOne[1];
    } else {
      clck1 = clickOne[1];
      clck2 = clickTwo[1];
    }

    if (event.shiftKey) {
      if (clck1 != clck2) {
        $("#s" + clck1).nextUntil("#s" + clck2).find(".chk_event").prop("checked", true);
        $("#s" + clck1).nextUntil("#s" + clck2).css("background-color", hlcol);
        $("#s" + clck1).nextUntil("#s" + clck2).hover(
          function(){$(this).css("background-color", hlhov)},
          function(){$(this).css("background-color", hlcol)});
        clickOne = 0, clck1 = 0, clck2 = 0;
      }
    } 

    // Update class_count
    $("#class_count").html($(".chk_event:checked").length);
    if ($("#ca1:checked").length > 0) {
      $("#ca1").prop("checked",false);
    }
    clickOne = this.id.split("_");

    if ($(this).prop("checked") == true) {
      $("#s" + clickTwo[1]).css("background-color", hlcol);
      $("#s" + clickTwo[1]).hover(function(){$(this).css("background-color", hlhov)},
        function(){$(this).css("background-color", hlcol)});
    } else {
      $("#s" + clickTwo[1]).css("background-color", "#fafafa");
      $("#s" + clickTwo[1]).hover(function(){$(this).css("background-color", "#f4f4f4")},
        function(){$(this).css("background-color", "#fafafa")});
    }
  });

  // Select all (2)
  $(document).on("click", "#ca1", function(event) {
    var chkLen = $("#ca1:checked").length;
    switch(chkLen) {
      case 0:
        $(".chk_event").prop("checked",false);
        $("#ca0").prop("checked",false);
        $(".d_row_sub1").css("background-color", "#fafafa");
        $(".d_row_sub1").hover(function(){$(this).css("background-color", "#f4f4f4")},
          function(){$(this).css("background-color", "#fafafa")});
        break;
      default:
        $(".chk_event").each(function() {
          if ($(this).prop("disabled") == false) {
            $(this).prop("checked",true);
          }
        });
        $(".d_row_sub1").css("background-color", hlcol);
        $(".d_row_sub1").hover(function(){$(this).css("background-color", hlhov)},
          function(){$(this).css("background-color", hlcol)});
        $("#ca0").prop("checked",true); 
        break;
    }    

    if ($(".eview_sub1")[0]) {  
      // Update class_count
      $("#class_count").html($(".chk_event:checked").length);
    }

  });

  // Select all (2a) - clean this up, the above is almost identical
  $(document).on("click", "#ca2", function(event) {
    var chkLen = $("#ca2:checked").length;
    switch(chkLen) {
      case 0:
        $(".chk_event").prop("checked",false);
        $("#ca2").prop("checked",false);
        $(".d_row_sub1").css("background-color", "#fafafa");
        $(".d_row_sub1").hover(function(){$(this).css("background-color", "#f4f4f4")},
          function(){$(this).css("background-color", "#fafafa")});
        break;
      default:
        $(".chk_event").each(function() {
          if ($(this).prop("disabled") == false) {
            $(this).prop("checked",true);
          }
        });
        $(".d_row_sub1").css("background-color", hlcol);
        $(".d_row_sub1").hover(function(){$(this).css("background-color", hlhov)},
          function(){$(this).css("background-color", hlcol)});
        $("#ca2").prop("checked",true); 
        break;
    }
    // Update class_count
    $("#class_count").html($(".chk_event:checked").length);
  });

  // Class button click
  $(document).on("click", "[id*=\"b_class-\"]", function() {
    // We only fire if something is selected
    var chkLen = parseInt($(".chk_event:checked").length + $(".chk_all:checked").length);
    var intclass = $(this).attr('id').split("-");
    if (chkLen > 0 && intclass[1] != 0) {
      eClass(this,intclass[1]);
    }
  });

  function eClass(caller,intclass) {
    // The sid.cid values
    var scid= "", scidlist = "", ecls = 0;
    if ($(".eview_sub1")[0] || $("#ca2")[0]) {
      $(".chk_event:checked").each(function() {
        if ($(this).data('eclass') == 0) {
          ecls++;
        }
        scid += $(this).val() + ",";
      });
      scidlist = scid.replace(/,$/, "");
    } else {
      ecls = $(".d_row_active").find(".b_ec_hot").text();  
      scidlist = $("#ca0").data("scid"); 
    }
    
    // Was there a message?
    var msg = "none";
    if($(".cat_msg_txt").val().length != 0) {
      msg = $(".cat_msg_txt").val();
      $("#comments").click();
    }        
    
    var catdata = intclass + "|||" + msg + "|||" + scidlist;
    if (catdata.length <= 8000) {
      // We are now ready to class
      var urArgs = "type=" + 9 + "&catdata=" + catdata;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb9(data)});
      });
    } else {
      catMsg("e1");
    }
        
    function cb9(data){
      eval("catRaw=" + data);
      catDbg = catRaw.dbg;
      if (catDbg == "0") {
        
        var curtotalrtcount = Number(ecls);
        // Working on grouped events
        if ($("#menu1").text() == "on") {
          curclasscount = Number($("#class_count").text());
          var curtotalparentcount = $(".d_row_active").find(".b_ec_hot").text();
          // Do we have queued events?
          if (curtotalparentcount > 0) {

            // Are we working on queued events?
            if (curtotalrtcount > 0) {
              curclasscount = curtotalrtcount;
            } else {
              curclasscount = 0;
            }
            // Adjust the parent count
            newparentcount = parseInt(curtotalparentcount - curclasscount,10);
            $(".d_row_active").find(".b_ec_hot").text(newparentcount);

            if (newparentcount == 0) {
              $(".d_row_active").find(".b_ec_hot").parent().attr('class','row');
              $(".d_row_active").find(".b_ec_hot").attr('class','b_ec_cold');
            }    

            // If we are working within the child, adjust accordingly
            if ($(".eview_sub1")[0]) {
              // How many are in the child
              curtotalchildcount = $(".d_row_sub_active").find(".b_ec_hot").text();
        
              // Adjust the child count
              newchildcount = parseInt(curtotalchildcount - curclasscount,10); 
              $(".d_row_sub_active").find(".b_ec_hot").text(newchildcount);
              if (newchildcount == 0) {
                $("#ca1").prop("disabled",true);
                $(".d_row_sub_active").find(".b_ec_hot").parent().attr('class','sub');
                $(".d_row_sub_active").find(".b_ec_hot").attr('class','b_ec_cold');
              }
            // Otherwise we were called from the parent
            } else {
              $(".d_row_sub").find(".b_ec_hot").parent().attr('class','sub');
              $(".d_row_sub").find(".b_ec_hot").text(0);
              $(".d_row_sub").find(".b_ec_hot").attr('class','b_ec_cold');
              $("#ca0").prop("disabled",true);      
            }
            lastclasscount = newparentcount; 
          }

          // Lastly, update class_count
          if (rtbit == 1 || curtotalrtcount > 0 || $("#eview_sub")[0]) {
            $("#class_count").html(0);
          } else {
            $("#class_count").html($(".d_row_active").find(".b_ec_total").text());
          }

        // Working on ungrouped events
        } else {
          $("#class_count").html(lastclasscount);   
        }

        // What the new classification is
        selClass = $(caller).data("cn");
        newClass = "a_" + selClass;
        
        // Change visible class and disable if RT
        // If we are RT ungrouped, we just remove 
        if ($('#rt').text() == 'on' && $("#ca2")[0]) {
          $(".chk_event:checked").each(function() {
            var pid = $(this).attr("id").split("_");
            var nid = parseInt(Number(pid[1]) + 1);
            // Remove any open payload or TX panes
            if ($("[id^=eview_]")[0]) {
              $("[id^=eview_]").remove();
              $(".d_row_sub1").css('opacity','1');
            }
            // Remove the row
            $("#s" + pid[1]).fadeOut('fast', function() {
              $("#s" + pid[1]).remove();
            });
          }); 

          // Update table (for sorter)
          $("#tl3b").trigger('update');
        } else {
          // If we are RT and all events are classed we just remove
          if ($('#rt').text() == 'on' && $(".d_row_active").find(".b_ec_hot").text() == 0) {
            $("#active_eview").remove();
            $(".d_row_active").fadeOut('slow', function (event) {
              $(".d_row_active").remove();
              var newsigtotal = "-";
              var sigtotal = $("#esignature").text();
              if (sigtotal > 0) {
                newsigtotal = parseInt(sigtotal - 1);
              } 
              $("#esignature").text(newsigtotal);
            });
            $(".d_row").css('opacity','1');
          } else {
            $(".chk_event:checked").each(function() {
              var n = this.id.split("_");          
              $("#class_box_" + n[1]).attr('class', newClass);
              $("#class_box_" + n[1]).text(selClass);
              if (curtotalparentcount > 0) {
                $(this).prop("disabled",true);
              }
            });
          }
          $(".d_row_sub1").css("background-color", "#fafafa");
          $(".d_row_sub1").hover(function(){$(this).css("background-color", "#f4f4f4")},
            function(){$(this).css("background-color", "#fafafa")});
        }
                
        // Uncheck everything
        $(".chk_event").prop("checked", false);
        $(".chk_all").prop("checked", false);
        // Remove these scids from the L1 scidlist
        if ($("#ca0")[0] && rtbit == 1) {
          var cur_scidlist = scidlist.split(',');
          var active_scidlist = $("#ca0").data("scid");
          for (var i = 0; i < cur_scidlist.length; i++) {
            active_scidlist = active_scidlist.replace(cur_scidlist[i],'');
          }
          active_scidlist = active_scidlist.replace(/,{2,}/g,',');
          active_scidlist = active_scidlist.replace(/(^,|,$)/g,'');
          $("#ca0").data("scid", active_scidlist);
        }
        catMsg(scidlist.split(',').length, curtotalrtcount);
      } else {
        catMsg(0);
      }
    }
  }
  
  function catMsg(count, rtcount) {
    switch (count) {
      case "e1":
        var msg = "Error: Too many events in current selection"; 
        break;
      default:
        var ess = '';
        if ( count > 1 ) ess = 's';

        var newboxtotal = 0, newcatcount = 0; 
        newboxtotal = parseInt($("#qtotal").text() - rtcount);
        $("#qtotal").text(newboxtotal);

        // If we are just rt update Total boxes as we go
        if ($("#ca2")[0]) { // We are ungrouped
          newcatcount = parseInt($("#cat_count").text() - count);
          if (newcatcount == 0) {
            newView("u");
          } else {
            $("#cat_count").text(newcatcount);
          }
        }
        
        var msg = count + " event" + ess + " categorized";
        break;
    }

    $("span.class_msg").text(msg);
    $("span.class_msg").fadeIn('slow', function() {
      setTimeout(function(){
        $(".class_msg").fadeOut('slow');
      }, 3000);
    });
  }

  // Cleanup: comments, sensors and filters need to be refined. 

  // 
  // Sensor box 
  //

  // Open and close the view
  $('#sensors').click(function() {
    $('.sen_box').toggle();
    if ($('.sen_box').css('display') == "none") {
      $(".content_active").fadeTo('fast',1);
    } else {
      $(".content_active").fadeTo('fast',0.2);
      if (!$('#tlsen')[0]) {
        mkSensorBox();
      }
    }
  });

  // Select All
  $(document).on("click", "#csa", function(event) {
    var chkLen = $(".chk_sen_all:checked").length;
    switch(chkLen) {
      case 0:
        $(".chk_sen").prop("checked",false);
      break;
      default:
        $(".chk_sen").prop("checked",true);
      break;
    }    
  });
  
  // Select one
  $(document).on("click", ".s_row", function(event) {
    var cbid = "#cb_sen_" + $(this).data('cbn');
    $(cbid).prop('checked', !$(cbid).is(':checked'));     
  });

  $(document).on("click", ".chk_sen", function(event) {
    $(this).prop('checked', !$(this).is(':checked'));    
  });

  // Select group and clear
  $(document).on("click", ".qlink", function(event) {
    var at = $(this).text();
    var col = $(this).data('en');
    switch (col) {
      case  0: $(this).data('en',1); break;
      case  1: $(this).data('en',0); break;
      case 42: $('.chk_sen').prop('checked',true); break;
      case 43: $('.chk_sen').prop('checked',false); break; 
    }
     
    $(".s_row:contains('" + at + "')").each(function() {
      var cbid = "#cb_sen_" + $(this).data('cbn');
      $(cbid).prop('checked', !$(cbid).is(':checked'));  
    });
  });  

  $(document).on("click", ".sen_close", function(event) {
    $('#sensors').click();
  });

  function mkSensorBox() {
    var urArgs = "type=13";

    $(function(){
      $.get(".inc/callback.php?" + urArgs, function(data){cb13(data)});
    });

    function cb13(data){
      eval("raw=" + data);
      var tbl = '', head = '', row = ''; 

      head += "<thead><tr>";
      head += "<th colspan=2 class=sub width=300>NETWORK</th>";
      head += "<th class=sub>HOSTNAME</th>";
      head += "<th width=90 class=sub>AGENT TYPE</th>";
      head += "<th width=90 class=sub>SENSOR ID</th>";
      head += "</tr></thead>";         
  
      var agents   = new Array();
      var networks = new Array();

      for (var i=0; i<raw.length; i++) {
        var network  = raw[i].f1 || "-";
        var hostname = raw[i].f2 || "-";
        var agent    = raw[i].f3 || "-";  
        var sid      = raw[i].f4 || "-";
        var rowid    = "senrow" + i;

        if (agents.indexOf(agent) == -1) {
          agents.push(agent);
        }
        if (networks.indexOf(network) == -1) {
          networks.push(network);
        }
        row += "<tr class=s_row data-cbn=" + i + " data-en=0>";
        row += "<td class=row width=20><input id=cb_sen_" + i + " class=chk_sen "; 
        row += "type=checkbox value=\"" + sid + "\"></td>";
        row += "<td class=row><b>" + network + "</b></td>";
        row += "<td class=row>" + hostname + "</td>";
        row += "<td class=row>" + agent + "</td>";
        row += "<td class=row>" + sid + "</td>";
        row += "</tr>";
      }
      networks.sort();
      var quick = "<div class=quick>Network:</div><div class=quickl>";
      for (var i=0; i<networks.length; i++) {
        quick += "<span class=qlink data-en=0>" + networks[i] + "</span>";
      }
      quick += "</div>";
      agents.sort();
      quick += "<div class=quick>Agent Type:</div><div class=quickl>";
      for (var i=0; i<agents.length; i++) {
        quick += "<span class=qlink data-en=0>" + agents[i] + "</span>";
      }
      quick += "</div>";
      quick += "<div class=quick>Actions:</div><div class=quickl>";
      quick += "<span class=qlink data-en=42>Select All</span>";
      quick += "<span class=qlink data-en=43>Clear All</span>";
      quick += "</div>";
      
      tbl += "<table id=tlsen width=930 class=table cellpadding=0 cellspacing=0>";
      tbl += head;
      tbl += row;
      tbl += "</table>";
      $(".sen_tbl").append(quick);
      $(".sen_tbl").append(tbl);

      $("#tlsen").tablesorter({
        headers: {
          0:{sorter:false},
        },
          cancelSelection:false
      });
    }

    $(".content_active").fadeTo('fast',0.2);
    $(".sen_box").fadeIn();
  }

  //
  // Filters
  //

  // Open and close the view
  $('#filters').click(function() {
    $('.fltr_box').toggle();
    if ($('.fltr_box').css('display') == "none") {
      $('#tl4').hide();
      $(".content_active").fadeTo('fast',1);
    } else {
      $(".content_active").fadeTo('fast',0.2); 
      $('#tl4').fadeIn();
      if ($('#tl4').length == 0) {
        loadFilters(1);
      }
    }
  }); 

  $(document).on("click", ".filter_close", function(event) {
    $('#filters').click();
  });

  // Create entries
  function mkEntry(entry) {

    cls = 'f_row';
    if(!entry) {
      cls = 'h_row';
      filter = "";
      entry = {"alias": "New", "name": "", "notes": "None.", "filter": filter, "age": "1970-01-01 00:00:00"};
    }

    encFilter = s2h(entry.filter);        
    row = '';
    row += "<tr class=" + cls + " id=\"tr_" + entry.alias + "\" ";
    row += "data-alias=\"" + entry.alias + "\" ";
    row += "data-name=\"" + entry.name + "\" ";
    row += "data-notes=\"" + entry.notes + "\" ";
    row += "data-filter=\"" + encFilter + "\" ";
    row += "data-global=0>";
    row += "<td class=f_row_active>" + entry.alias + "</td>";
    row += "<td class=row>" + entry.name + "</td>";
    row += "<td class=row>" + entry.notes + "</td>";
    row += "<td class=row>now</td>";
    row += "<td class=row><span id=\"" + entry.alias + "\" class=\"filter_edit\">edit</span></td>";
    row += "</tr>";
    return row;
  }

  function loadFilters(show) {
            
    var urArgs = "type=8" + "&mode=query&data=0";
    $(function(){
      $.get(".inc/callback.php?" + urArgs, function(data){cb6(data)}); 
    });

    function cb6(data){
      eval("theData=" + data);
      tbl = '';
      head = '';
      row = '';
      head += "<thead><tr>";
      head += "<th class=sub width=70>ALIAS</th>";
      head += "<th class=sub width=200>NAME</th>";
      head += "<th class=sub>NOTES</th>";
      head += "<th class=sub width=120>LAST MODIFIED</th>";
      head += "<th class=sub width=60>MODIFY</th>";
      head += "</tr></thead>";

      for (var i=0; i<theData.length; i++) {
        row += "<tr class=f_row id=\"tr_" + theData[i].alias + "\" ";
        row += "data-alias=\"" + theData[i].alias + "\" ";
        row += "data-name=\"" + theData[i].name + "\" ";
        row += "data-notes=\"" + theData[i].notes + "\" ";
        row += "data-filter=\"" + theData[i].filter + "\" ";
        row += "data-global=\"" + theData[i].global + "\">";
        row += "<td class=f_row_active>" + theData[i].alias + "</td>";
        row += "<td class=row>" + theData[i].name + "</td>";
        row += "<td class=row>" + theData[i].notes + "</td>";
        row += "<td class=row>" + theData[i].age + "</td>";
        row += "<td class=row><div id=\"" + theData[i].alias + "\" class=\"filter_edit\">edit</div></td>";
        row += "</tr>";
      }
      tbl += "<table id=tl4 width=930 class=table cellpadding=0 cellspacing=0>";
      tbl += head;
      tbl += row;
      tbl += "</table>";
      $('.fltr_tbl').append(tbl);
      if (show == 1) {
        $('#tl4').fadeIn('slow');
      }
    }      
  }

  function openEdit (cl) {
    alias = $('#tr_' + cl).data('alias');
    name = $('#tr_' + cl).data('name');
    notes = $('#tr_' + cl).data('notes');
    global = $('#tr_' + cl).data('global');
    filter = h2s($('#tr_' + cl).data('filter'));
    row = '';
    row += "<tr id=filter_content>";
    row += "<td class=f_row colspan=5><textarea id=\"txt_" + alias +"\" cols=110 rows=6>";
    row += "{\n";
    row += "\"alias\": \"" + alias + "\",\n";
    row += "\"name\": \"" + name + "\",\n";
    row += "\"notes\": \"" + notes + "\",\n";
    row += "\"filter\": \"" + filter + "\"\n";
    row += "}";
    row += "</textarea>";

    // We cant remove globals
    if (global == 0) {
      row += "<div class=filter_bees><div class=filter_update>update</div><div class=filter_remove>remove</div></div>";
    }

    row += "<div class=filter_error></div>";
    row += "</td></tr>";

    $('#tr_' + cl).after(row);
  }

  // Help!?
  $(document).on("click", ".filter_help", function(event) {
    if ($('#tbl_help').length == 0) {
      tbl = "<table id=tbl_help><tr><td class=fhelp>";
      tbl += "<div class=filter_parts><u><b>Filters</b></u><br><br>";
      tbl += "Filters are used to add extra conditions to base queries before they are performed. ";
      tbl += "When the main event page loads it displays <b>ALL</b> events for the current day. ";
      tbl += "Using filters lets you manipulate the base query to return just the results you are interested in. ";
      tbl += "Filters can either be explicit statements or shells that accept arguments.</div>";
      tbl += "<div class=filter_parts><u><b>Usage</b></u><br><br>";  
      tbl += "Once a filter has been created you can start using it right away. To do so, simply type the ";
      tbl += "filters alias in the input box located at the top right corner of the interface and press the ";
      tbl += "enter key. If you create a filter with the alias 'a', then you would ";
      tbl += "just type 'a' and then 'enter' to perform the query and return the filtered results.<br><br>"; 
      tbl += "<b>Explicit</b> filters are ";
      tbl += "intended to be used for frequent queries that contain multiple but static conditions, say ";
      tbl += "a filter called 'finance' that contains three sensors and IPs in a few  different "; 
      tbl += "ranges.<br><br>";
      tbl += "<b>Shells</b> on the other hand are a little more dynamic. For example, one of the base filters ";
      tbl += "with the alias 'ip' looks like this: <br><br>";
      tbl += "<b>\"filter\": \"(src_ip = INET_ATON('$') OR dst_ip = INET_ATON('$'))\"</b><br><br>";
      tbl += "This filter can be used either like this <b>'ip 10.1.2.3'</b>  or like this ";
      tbl += "<b>'ip 10.1.2.3,10.1.2.4,10.1.2.5'</b>. ";
      tbl += "Shell filters expand '$' to whatever immediately follows the filter alias. If commas are used ";
      tbl += "each additional item will also be added to the query.</div>";
      tbl += "<div class=filter_parts><u><b>Query examples</b></u><br><br>";
      tbl += "We are using standard MySQL vernacular so we can make use of all native functions ";
      tbl += "and conditional operators. A few simple examples:<br><br>";
      tbl += "=> (src_port NOT IN('80','443') AND dst_port > 1024)<br>";
      tbl += "=> (src_ip NOT BETWEEN 167772160 AND 184549375 AND src_ip NOT BETWEEN 2886729728 AND 2886795263)<br>";
      tbl += "=> (signature LIKE '%malware%' AND INET_ATON(dst_ip) LIKE '10.%.1.%')</div>";  
      tbl += "<div class=filter_parts><u><b>Available filter fields</b></u><br><br>";
      tbl += "<div class=filter_fields>";
      tbl += "<div class=boldf>event.cid</div> - The event ID. sid + cid = distinct event<br>";
      tbl += "<div class=boldf>class</div> - Event Classification<br>";
      tbl += "<div class=boldf>dst_ip</div> - Destination IP<br>";
      tbl += "<div class=boldf>dst_port</div> - Destination Port<br>";
      tbl += "<div class=boldf>icmp_code</div> - ICMP Code<br>";
      tbl += "<div class=boldf>icmp_type</div> - ICMP Type<br>";
      tbl += "<div class=boldf>ip_csum</div> - IP Header Checksum<br>";
      tbl += "<div class=boldf>ip_flags</div> - IP Flags<br>";
      tbl += "<div class=boldf>ip_hlen</div> - IP Header Length<br>";
      tbl += "<div class=boldf>ip_id</div> - IP Identification<br>";
      tbl += "<div class=boldf>ip_len</div> - IP Total Length<br>";
      tbl += "<div class=boldf>ip_off</div> - IP Fragment Offset<br>";
      tbl += "<div class=boldf>ip_proto</div> - IP Protocol<br>";
      tbl += "<div class=boldf>ip_tos</div> - IP Type Of Service</div>";
      tbl += "<div class=filter_fields>";
      tbl += "<div class=boldf>ip_ttl</div> - IP Time To Live<br>";
      tbl += "<div class=boldf>ip_ver</div> - IP Version<br>";
      tbl += "<div class=boldf>msrc.cc</div> - Source Country Code<br>";
      tbl += "<div class=boldf>mdst.cc</div> - Destination Country Code<br>";
      tbl += "<div class=boldf>priority</div> - Event Priority<br>";
      tbl += "<div class=boldf>event.sid</div> - The sensor ID. sid + cid = distinct event<br>";
      tbl += "<div class=boldf>signature</div> - Event Signature<br>";
      tbl += "<div class=boldf>signature_gen</div> - Event Signature Generator<br>";
      tbl += "<div class=boldf>signature_id</div> - Event Signature ID<br>";
      tbl += "<div class=boldf>signature_rev</div> - Event Signature Revision<br>";
      tbl += "<div class=boldf>src_ip</div> - Source IP<br>";
      tbl += "<div class=boldf>src_port</div> - Source Port<br>";
      tbl += "<div class=boldf>event.status</div> - Analyst Classification</div></div>";
      tbl += "</td></tr></table>"; 
      $('#tl4').before(tbl);
      $('.filter_help').text('-');
    } else {
      $('#tbl_help').remove();
      $('.filter_help').text('?');
    }
  });

  // Refresh filter listing
  $(document).on("click", ".filter_refresh", function(event) {
    $('#tl4').fadeOut('slow');
    $('#tl4').remove();
    loadFilters(1);
  });

  // Create new filter
  $(document).on("click", ".filter_new", function(event) {
    // There can be only one :/  
    if ($('#tr_New').length == 0 && $('#filter_content').length == 0) {
      newEntry = mkEntry();
      if ($('#tr_help').length == 0) {
        $('#tl4').prepend(newEntry);
      } else {
        $('#tr_help').after(newEntry);
      }
    }
  });
    
  // Filter expansion (gives access to edit as well)
  $(document).on("click", ".filter_edit", function(event) {
    currentCL = $(this).attr('id');
    if (!$("#filter_content")[0]) {
      openEdit(currentCL);
      $('#' + currentCL).text('close');
      $('td:first', $(this).parents('tr')).css('background-color','#c4c4c4');
    } else {
      if($('#' + currentCL).text() == 'close') {
        $("#filter_content").remove();       
        $('#' + currentCL).text('edit');
        $('td:first', $(this).parents('tr')).css('background-color','#e9e9e9');
      }    
    }
  });

  // Update (or create new) filter
  $(document).on("click", ".filter_update", function(event) {
    // Hide any previous errors
    $('.filter_error').empty();
    eMsg = '';
    // Get the current filter
    try {
      rawTxt = $('#txt_' + currentCL).val();
      // Fitler out some stuff
      rawTxt = rawTxt.replace(/[@|&;*\\`]/g, "");
      rawTxt = rawTxt.replace(/[>]/g, "&gt;");
      rawTxt = rawTxt.replace(/[<]/g, "&lt;");
      filterTxt = $.parseJSON(rawTxt);

      // Check for empty objects
      emptyVal = 0;
      for (var i in filterTxt) {
        if (filterTxt.hasOwnProperty(i)) {
          if (filterTxt[i].length == 0) {
            emptyVal++;
          }
        }
      }

      if (emptyVal > 0) throw 0; 
            
      // Sanitize alias
      var re = /^[a-zA-Z][\w-]*$/;
      var OK = re.exec(filterTxt.alias);
      if (!OK) throw 1;
      if (filterTxt.alias == "New") throw 1;

      // Make sure we dont match a builtin
      var builtins = ["c","cc","dip","dpt","ip","sid","sig","sip","spt"];
      if (builtins.indexOf(filterTxt.alias) != -1) throw 1;

      // Continue..
      oldCL = currentCL;
      fd = s2h(filterTxt.alias + "||" + filterTxt.name + "||" + filterTxt.notes + "||" + filterTxt.filter);
      var urArgs = "type=8&mode=update&data=" + fd;

      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb7(data)}); 
      });

      function cb7(data){
        eval("theData=" + data);
        if (theData.msg) {
          alert(theData.msg);
        } else {
          $('#' + currentCL).text('edit');
          $("#filter_content").remove();
        }         
      }

      newEntry = mkEntry(filterTxt);
      $('#' + oldCL).text('edit');
            
      // If we edited an existing entry update it.
      if (filterTxt.alias == currentCL) {
        $('#tr_' + oldCL).attr('id', 'toRemove');
        $('#toRemove').after(newEntry);
        $('#toRemove').remove();
      } else {
        $('#tr_' + oldCL).before(newEntry);
        $('td:first', $('#tr_' + oldCL)).css('background-color','#e9e9e9');
      }

      // If we started from a new entry, delete it.
      if ($('#tr_New').length == 1) {
        $('#tr_New').remove();
      }

    } catch (err) {

      switch (err) {
        case 0:
          eMsg += "<span class=warn><br>Error!</span> ";
          eMsg += "Please supply a value for each object.";
          break;
        case 1:
          eMsg += "<span class=warn><br>Error!</span> "
          eMsg += "Filter aliases MUST be unique and start with a letter . Valid characters are: ";
          eMsg += "Aa-Zz, 0-9, dashes and underscores.";
          eMsg += "The word \"New\" is reserved and may not be used.";
          break;
        default:
          eMsg += "<span class=warn><br>Format error!</span> ";
          eMsg += "Please ensure the format above is valid JSON. ";
          eMsg += "I am looking for an opening curly brace <b>\"{\"</b> followed by <b>\"object\": \"value\"</b> ";
          eMsg += "pairs.<br> Each <b>\"object\": \"value\"</b> pair terminates with a comma <b>\",\"</b> except ";
          eMsg += "the last pair before the closing curly brace <b>\"}\"</b>.";
          eMsg += " Strings must be enclosed within double quotes.";
      }
      $('.filter_error').append(eMsg);
      $('.filter_error').fadeIn();
    }
  });

  // Remove a filter
  $(document).on("click", ".filter_remove", function(event) {
    var oktoRM = confirm("Are you sure you want to remove this filter?");
    if (oktoRM) {
      var urArgs = "type=8&mode=remove&data=" + currentCL;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb8(data)});
      }); 

      function cb8(data){
        eval("theData=" + data);
        if (theData.msg != '') {
          alert(theData.msg);
        } else {
          $("#filter_content").remove();
          $("#tr_" + currentCL).fadeOut('slow', function() {
            $("#tr_" + currentCL).remove();
          });
        }
      }
    }
  });
// The End.
});
