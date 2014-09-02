/* Copyright (C) 2012 Paul Halliday <paul.halliday@gmail.com> */

$(document).ready(function(){

  $(document).on('click', '[class*="bpr"]', function() {
    // We disallow filtering if any events have already been selected
    // or if we stray from the event tab
    if ($('.d_row_active')[0]) return;
    if ($(".chk_event:checked").length > 0) return;
    if ($(".tab_active").attr('id') != 't_sum') return;
    
    var prClass = $(this).attr('class').split('b')[1];
    var prOld = $(this).data('pr');

    function flipIt(pattern) {
      $(pattern).closest('tr').hide();
      $(pattern).closest('tr').attr('class','hidden');
      if ($('#gr').text() == 'on') $(pattern).closest('tr').find('.chk_event').prop("disabled",true);
    }
    if ($('.b' + prClass).attr('class') == 'bprA') {
      $('.b' + prClass).attr('class', 'bpr' + prOld);
      $('.hidden').attr('class','d_row');
      $('.d_row').show();
      if ($('#gr').text() == 'on') {
        $('.chk_event').prop("disabled",false);
        $('.chk_all').prop("checked",false);
        $('.chk_event').css("background-color", "#fafafa");
      } 
    } else {
      // See if we are already filtered
      if ($('.bprA')[0]) {
        $('.hidden').attr('class','d_row');
        $('.d_row').show();
        if ($('#gr').text() == 'on') {
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

  //
  // Load main content
  //
  
  // Keep track of context 
  var thisUser = $('#t_usr').data('c_usr');
  var rtbit = 0;
  eventList("0-aaa-00");
  $("#loader").show();

  var lastclasscount = 0;

  $(document).on("click", "#dt_savetz", function(event) {
    if ($('.dt_error').data('err') == 0) {
      var newOffset = $('#ts_offset').val();
      profileUpdate("tz", s2h(newOffset));
      $('#user_tz').val(newOffset);
    }
  });  

  // Depending on context a 'No result' may be confusing
  // so we turn off active queue and show everything
  $(document).on('click', '#retry', function() {
    $('#rt').attr('class','tvalue_off');
    $('#rt').text('off');
    rtbit = 0;
    $('.b_update').click();
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
      $.post(".inc/callback.php?" + urArgs, function(data){cb(data)});
    });

    function cb(data){
      // Check to make sure we still have a valid session. If we don't
      // let the user know and return them to the login page.
      if (data[0] == "<") {
        $("span.class_msg").text("Your session has expired!");
        $("span.class_msg").css("background-color", "#cc0000");
        $("span.class_msg").css("color", "#fff");
        $("span.class_msg").show(); 
        var sessionDead = confirm("Your session has expired. Press \"OK\" to return to the login page. If you aren't finished with what you were looking at click 'Cancel'. Note: you won't be able to perform any actions.");
        if (sessionDead) {
          $("#logout").click();
        }
      }
      eval("ec=" + data);

      var esum = 0;
            
      for (var i=0; i<ec.length; i++) {
        esum += parseInt(ec[i].count) || 0;
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
        $("#c-" + eclass).text(ecount); 
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
          $(".b_update_note").show();
        }
        $("#etotal").html(eTotal);
        $("#qtotal").html(qTotal);
      }

      $("#title").html("squert (" + qTotal + ") - " + thisUser);

    }

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

  $(document).on("click", '[class*="cl_"]', function(event) {
    var nc = $(this).attr('class').split("_");
    var ct = $(this).parents('table').data('comment');
    $(".cat_msg_txt").val(ct);
    $('#b_class-' + nc[1]).click();
  });
    
  // Tabs
  var tab_cached = $("#sel_tab").val();

  switch (tab_cached) {
    case "t_sum": 
      $('.content-right').show();
      $('.content-left').show();
    break;
    case "t_ovr":
      $('.content-right').hide();
      $('.content-left').hide();
      if ($('#ovestat').text().length == 0) loadSummary();
    break;
    case "t_view":
      $('.content-right').hide();
      $('.content-left').hide();
      loadViews();
    default:
      $('.content-right').hide();
      $('.content-left').hide();
    break;
  }
  
  $('#' + tab_cached).attr('class','tab_active');
  $("#" + tab_cached + "_content").attr('class','content_active');

  $(".tab,.tab_active").click(function(event) {
    var active = $(".tab_active").attr('id');
    var content = $(".content_active").attr('id');
    if ($(".fl_val_on")[0]) {
      $('.b_update').click();
    }

    if ( this.id != active ) {
      $("#" + active).removeClass('tab_active');
      $("#" + active).addClass('tab');
      $(this).attr('class','tab_active');
      $("#" + content).attr('class','content');
      $("#" + this.id + "_content").attr('class','content_active');
      activeTab = $(".tab_active").attr('id');
      
      switch (activeTab) {
        case "t_sum": 
          $('.content-right').show();
          $('.content-left').show();
          $('.t_pbar').css('opacity',1);
          $('.db_links').hide();
        break;
        case "t_ovr":
          $('.content-right').hide();
          $('.content-left').hide();
          if ($('#ovestat').text().length == 0) loadSummary();
          $('.t_pbar').css('opacity',.1);
          $('.db_links').hide();
        break;
        case "t_view":
          $('.content-right').hide();
          $('.content-left').hide();
          $('.t_pbar').css('opacity',.1);
          loadViews();
        break;
        default:
          $('.content-right').hide();
          $('.content-left').hide();
          $('.t_pbar').css('opacity',.1);
          $('.db_links').hide();
        break;
      }

      $('#sel_tab').val(activeTab);
      var ctab = $('#sel_tab').val();
      var urArgs = "type=" + 5 + "&tab=" + ctab;
      $.get(".inc/callback.php?" + urArgs);
    }
  });

  // Sub tab groups
  $(".tsg").click(function(event) {
    var nc = Number($(this).attr('class').split(/\s/).length);
    var ct = $(this).data('tab');
    $('.tsg_active').attr('class','tsg');
    $(this).attr('class','tsg tsg_active');
  });

  // Toggle and update views
  function newView(req) {
    // No racing please
    var bail = $("#loader").css('display');
    if (bail != 'none') return;
    // Remove any stale views
    $("#tl0,#tl1,#tl3a,#tl3b").remove();
    var f = "0-aaa-00";
    var s = "2a-aaa-00";
    var cv = $("#gr").text();
 
    switch (cv) {
      case "on":
        eventList(f);
        $("#loader").show();
        break;
      case "off":
        eventList(s);
        $("#loader").show();
        break;
    }
  }

  // Group and ungroup
  $(document).on("click", "#gr", function(event) {
    var bail = $("#loader").css('display');
    if (bail != 'none') return;
    var cv = $('#gr').text();
    switch (cv) {
      case  'on': 
        $('#gr').attr('class','tvalue_off');
        $('#gr').text('off');
      break;
      case 'off':
        $('#gr').attr('class','tvalue_on');
        $('#gr').text('on');
        $("#event_sort").val("DESC");
      break;
    }
  });

  // RT check/uncheck
  $(document).on("click", "#rt", function(event) {
    var bail = $("#loader").css('display');
    if (bail != 'none') return;
    var cv = $('#rt').text();
    switch (cv) {
      case  'on':
        $('#rt').attr('class','tvalue_off');
        $('#rt').text('off');
        rtbit = 0;
      break;
      case 'off':
        $('#rt').attr('class','tvalue_on');
        $('#rt').text('on');
        rtbit = 1;
      break;
    }
  });

  // Toggle bottom bar (accommodate full window screenshots)
  $(document).on("click", "#botog", function(event) {
    var cv = $('#botog').text();
    switch (cv) {
      case  'on':
        $('#botog').attr('class','tvalue_off');
        $('#botog').text('off');
      break;
      case 'off':
        $('#botog').attr('class','tvalue_on');
        $('#botog').text('on');
      break;
    }    
    $('.bottom').animate({width: 'toggle'});
  });
  
  // If search is in focus, update on enter
  $('#search').keypress(function(e) {
    if (!e) e=window.event;
      key = e.keyCode ? e.keyCode : e.which;
      if (key == 13) {
        // Close comment box if it is open
        if ($('#cat_box').css('display') != 'none') {
          $('#ico01').click(); 
        }
        // Jump to all events if we are not in the events tab
        var active = $(".tab_active").attr('id');
        if (active != 't_sum') {
          $('#gr').attr('class','tvalue_off');
          $('#gr').text('off');
          $('#rt').attr('class','tvalue_off');
          $('#rt').text('off');
          rtbit = 0;        
          $('#t_sum').click();
        }
        newView("u");
      }
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
  $(document).on("click", ".b_update", function(event) {
    // Remove any supplementary results
    if ($("#extresult")[0]) $("#extresult").remove(); 
    // Where are we?
    var curTab = $('.tab_active').attr('id');
    switch (curTab) {
      case 't_ovr':
        loadSummary();
      break;
      case 't_view':
        mkView();
      break;
      default:
        $(".b_update_note").hide();
        newView("u");
      break;
    }
  });
 
  // Clear search and refresh
  $('#clear_search').click(function() {
    if ($('#search').val() != '') {
      $('#search').val('');
      $("#search").focus();
      if ($(".fl_val_on")[0]) {          
        $('.b_update').click();
      }
    }
  });

  // Logout
  $("#logout").click(function(event) {
    $.get("index.php?id=0", function(){location.reload()});
  });

  // Toggle filters
  $(document).on('click', '.fl_val_on', function(event) {
    var wF = $(this).data("ft");
    switch (wF) {
      case "tl":
      
      break;
      case "ob":
        $('#clear_search').click();
      break;
      case "sn":
        $(".chk_sen").each(function() {
          $(this).prop("checked",false);
        });
        $('.b_update').click();
      break;
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
        $(this).html("<img title=collapse class=il src=.css/uarr.png>");
        if (thisSec != lastSection) $(this).parent().css("border-bottom","1pt solid #c9c9c9");
        $(thisSecID).slideDown();
      break;
      default:
        $(this).html("<img title=expand class=il src=.css/darr.png>");
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
    $(".d_row_sub_active").attr('class','d_row_sub');
    // Update class_count
    $("#class_count").text(lastclasscount);
    curclasscount = lastclasscount;
    $("#loader").hide();
    // Reset and show checkbox
    $(".chk_all").prop("checked",false);
    $("#ca0").show();
    // Remove any open externals
    if ($("#extresult")[0]) $("#extresult").remove();
  }
  function closeSubRow1() {
    $("#eview_sub2").remove();
    $("#" + this.id).attr('class','d_row_sub1');
    if (!$("#eview_sub3")[0]) {
      $(".d_row_sub1").css('opacity','1');
      $(".d_row_sub_active1").attr('class','d_row_sub1');
    }
    $("#loader").hide();
    // Reset checkbox
    $(".chk_all").prop("checked",false);
    // Remove any open externals
    if ($("#extresult")[0]) $("#extresult").remove();
  }
  function closeSubRow2() {
    $("#eview_sub3").remove();
    $("#" + this.id).attr('class','d_row_sub1');
    if (!$("#eview_sub2")[0]) {
      $(".d_row_sub1").css('opacity','1');
      $(".d_row_sub1_active").attr('class','d_row_sub1');
    }
    $("#loader").hide();
  }

  //
  //  Level 1
  //

  $(document).on("click", ".row_active", function(event) {
    var curID = $(this).parent('tr').attr('id');  
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
      $("html, body").animate({ scrollTop: $('.d_row_active').offset().top - 140 }, 20);
      // History
      var itemToAdd = $("#" + curID).find('[class*="row_filter"]').text();
      hItemAdd(itemToAdd);
      // Set the class count (counted again after load)
      curclasscount = $('.d_row_active').data('event_count');
      var cols = $('th.sort').length;
      var tbl = '';
      tbl += "<tr class=eview id=active_eview><td colspan=" + cols + ">";
      tbl += "<div id=eview class=eview>";
      tbl += "<div class=\"sigtxt select\"></div>";
      tbl += "<div class=eview_actions>";
      tbl += "<input id=ca0 class=chk_all type=checkbox checked>";
      tbl += "<span class=ec_label>CATEGORIZE</span><span class=bold id=class_count>";
      tbl += curclasscount + "</span><span class=ec_label>EVENT(S)</span>&nbsp;&nbsp;";
      tbl += "<img id=cmnt data-box=cat title=comments class=il src=\".css/comment_small.png\">&nbsp;&nbsp;&nbsp;&nbsp;";
      tbl += "<span class=ec_label>CREATE FILTER:</span>&nbsp;";
      tbl += "<span class=link>src</span>&nbsp;&nbsp;";
      tbl += "<span class=link>dst</span>&nbsp;&nbsp;";
      tbl += "<span class=link>both</span>";
      tbl += "</div></td></tr>";
      $("#" + curID).after(tbl);
      eventList("1-" + rowValue);
      sigLookup(rowValue);
      $("#eview").show();
      $(".d_row").fadeTo('0','0.2');
    } else {
      closeRow();
    }
  });
 
  //
  //  Level 2
  //

  $(document).on("click", ".sub_active", function() {
    if (!$(".d_row_sub_active")[0]) {
      var callerID = $(this).parent('tr').attr('id');

      // Reset checkbox
      $(".chk_all").prop("checked",false);

      // RT or ALL?
      switch (rtbit) {
        case 1: adqp = s2h("AND event.status = 0"); break;
        case 0: adqp = s2h("empty"); break;
      }
      // We are now the active row
      $("#" + callerID).attr('class','d_row_sub_active');

      // Populate search times 
      var bt = $("#" + callerID).find('[class*="timestamp"]').html();
      var est = mkStamp(bt,"-",3600000);
      var eet = mkStamp(bt,"+",3600000);
       
      $('#el_start').val(est);
      $('#el_end').val(eet);
 
      // Clear search terms
      $("#srchterms").html('');
      $(".srch_txt").val(''); 

      // History and search
      $("#" + callerID).find('[class*="sub_filter"]').each(function() {
        if ($(this).data('type') == 'cc') {
          var itemToAdd = $(this).data('value');
        } else {
          var itemToAdd = $(this).text();
          // Add search terms
          $("#srchterms").append("<span class=\"link srchterm\">" + itemToAdd + "</span>&nbsp;&nbsp");
        } 
        hItemAdd(itemToAdd);
      });

      $("#loader").show();
      eventList("2-" + callerID + "-" + adqp);
    } else {
      closeSubRow();
    }  
  });

  //
  //  Level 3 (a or b) request payload
  //
    
  $(document).on("click", ".sub1_active", function() {
    // Close transcript if it is open
    if ($(".eview_sub3")[0]) closeSubRow2();
    if (!$(".d_row_sub_active1")[0])  {
      var callerID = $(this).parent('tr').attr('id');
      $("#" + callerID).attr('class','d_row_sub_active1');

      // Populate search times 
      var bt = $("#" + callerID).find('[class*="timestamp"]').html();
      var est = mkStamp(bt,"-",1800000);
      var eet = mkStamp(bt,"+",1800000);
       
      $('#el_start').val(est);
      $('#el_end').val(eet);
 
      // Clear search terms
      $("#srchterms").html('');
      $(".srch_txt").val(''); 

      // History
      $("#" + callerID).find('[class*="sub_filter"]').each(function() {
        if ($(this).data('type') == 'cc') {
          var itemToAdd = $(this).data('value');
        } else {
          var itemToAdd = $(this).text();
        }
        if ($(this).data('type') == 'ip') {
          // Add search terms
          $("#srchterms").append("<span class=\"link srchterm\">" + itemToAdd + "</span>&nbsp;&nbsp");
        } 
        hItemAdd(itemToAdd);
      });
      $("#loader").show();           
      eventList("3-" + callerID);
    } else {
      closeSubRow1()
    }
  });

  //
  // Level 3 (a or b) request transcript
  //

  $(document).on("click", ".sub2_active", function(event) {
    // Close payload if it is open
    if ($(".eview_sub2")[0]) closeSubRow1();
    var bail = $("#loader").css('display');
    if (bail != 'none') return; 
    if (!$(".eview_sub3")[0]) {
      $("#loader").show();
      composite = $(this).data('tx').split("-");
      rowLoke = composite[0];
      $("#" + rowLoke).attr('class','d_row_sub1_active');
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
        if (txResult == "DEBUG:") txResult += " No data was returned.";

        var row = '',tbl = '';
        row += "<table class=txtable align=center width=100% cellpadding=0 cellspacing=0>";
        row += "<tr>";
        row += "<td class=\"txtext select\">";
        row += txResult;
        row += "</td></tr></table>";

        tbl += "<tr class=eview_sub3 id=eview_sub3><td colspan=" + nCols + ">";
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
    } else {
      closeSubRow2();
    }
  });

  // Toggle RT depending on entry point
  $(document).on("click", ".b_ec_hot", function() {
    rtbit = 1;
  });
  $(document).on("click", ".b_ec_total", function() {
    rtbit = 0;
  });

  // Filter constructor
  function mkFilter() {
    if ($('#search').val().length > 0) {
      var fParts = $('#search').val().split(" ");
      if (fParts[0] == 'cmt') {
        var theFilter = s2h($('#search').val());
        rtbit = 0;
      } else {
        // Now see if the requested filter exists
        if ($("#tr_" + fParts[0]).length > 0) {
          tmpFilter = $("#tr_" + fParts[0]).data('filter');
          // Now see if we need to modify the query
          if (fParts[1]) {
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
        } else {
          theFilter = s2h('empty');
        }
      }
    } else {
      theFilter = s2h('empty');
    }
    return theFilter;
  }   

  //
  // This creates the views for each level
  //

  function eventList (type) {
    theWhen = getTimestamp();
    statusPoll(0);
    var parts = type.split("-");
    var filterMsg = '';
    var rt = 0;
    var theSensors = s2h('empty');
    var theFilter = mkFilter();

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
    if (h2s(theFilter) != 'empty') {
      $('.fl_val').text('YES');
    } else {
      $('.fl_val').text('NO');
    }
    
    switch (parts[0]) {

    // Level 0 view - Grouped by Signature
    case "0":
      $('.value').text('-');
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
          row += "No result. If this is unexpected try <span class=link id=retry>this</span></td></tr>";
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
            sumRT += parseInt(unClass);
          } else {
            rtClass = "b_ec_cold";
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
          row += "<td class=\"row row_active\"><div class=" + rtClass + ">" + unClass + "</div></td>";
          if (rt == 0) row += "<td class=\"row row_active\"><div class=b_ec_total>" + d0[i].f1 + "</div></td>";
          row += "<td class=row><div class=pr" + d0[i].f13 + ">" + d0[i].f13 + "</div></td>";
          row += "<td class=row><span class=blue>" +d0[i].f6+ "</span></td>";
          row += "<td class=row><span class=red>" +d0[i].f7+ "</span></td>";
          if (rt == 0) row += "<td class=row>" + catCells + "</td>";

          timeParts = d0[i].f5.split(" ");
          timeStamp = timeParts[1];

          row += "<td class=row>" + cells + "</td>";
          row += "<td class=row>" + timeStamp + "</td>";
          row += "<td class=\"row row_filter\" data-type=sid data-value=";
          row += d0[i].f3 + ">" + d0[i].f2 + "</td>";
          row += "<td class=row>" + d0[i].f3 + "</td>";
          row += "<td class=row>" + d0[i].f8 + "</td>";
                  
          if ( sumEC > 0) {
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
        
        tbl += "<table width=100% id=tl1 cellpadding=0 cellspacing=0 align=center>";
        tbl += head;
        tbl += row;
        tbl += "</table>";
        
        $('#' + parts[1] + '-' + parts[2]).append(tbl);
        
        if (d0.length > 0) {
          var prVals = [spr1,spr2,spr3,spr4];
          var pryBar =  mkPribar(prVals);
        } else {
          var pryBar =  mkPribar([0]);        
        }
        $('#tl1').fadeIn('slow');
        $("#tl1").tablesorter();
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

          // Aggregate time values
          timeValues += theData[i].c_ts + ",";
          var cells = mkGrid(theData[i].f12);
          if (rt == 0) var catCells = catGrid(theData[i].c_status,0,0);
                  
          // Event sums
          tlCount += parseInt(count,10);
          rtCount += parseInt(unclass,10);

          rid = "r" + i + "-" + parts[1] + "-" + src_ip + "-" + dst_ip;
          row += "<tr class=d_row_sub id=r" + i + " data-filter=\"" + rid + "\">";
          row += "<td class=\"sub sub_active\" id=l2l" + i + "><div class=" + rtClass + ">" + unclass + "</div></td>";
          if (rt == 0) row += "<td class=\"sub sub_active\" id=l2r" + i + "><div class=b_ec_total>" + count + "</div></td>";
          if (rt == 0) row += "<td class=sub>" + catCells + "</td>";
          row += "<td class=sub>" + cells + "</td>";
          row += "<td class=\"sub timestamp\">" + max_time + "</td>";
          row += "<td class=\"sub sub_filter\" data-type=ip>" + src_ip + "</td>";
          row += "<td class=\"sub " + cs[0] + "\" data-type=cc data-value=" + src_cc + ">";
          row += cs[1] + src_clong + " (." + src_cc.toLowerCase() + ")" + "</td>";
          row += "<td class=\"sub sub_filter\" data-type=ip>" + dst_ip + "</td>";
          row += "<td class=\"sub " + cd[0] + "\" data-type=cc data-value=" + dst_cc + ">";
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

          // Timestamp
          var compts       = d2[i].f2.split(",") || "--";
          var timestamp    = compts[0];
          var utctimestamp = compts[1];

          // Event sums
          tlCount += parseInt(1,10);
          if (cv == "RT") {
            rtCount += parseInt(1,10);
          }

          // Transcript link
          txdata = "s" + i + "-" + cid + "-" + s2h(sid + "|" + utctimestamp + "|" + src_ip + "|" + src_port + "|" + dst_ip + "|" + dst_port);

          txBit = "<td class=\"sub sub2_inactive\">" + sid + "." + cid + "</div>";   
          if (src_port != "-" && dst_port != "-") {
            txBit = "<td class=\"sub sub2_active\" data-tx=" + txdata + " title='Generate Transcript'>" + sid + "." + cid + "</td>";
          }

          row += "<td class=sub><input id=cb_" + i + " class=chk_event "; 
          row += "type=checkbox value=\"" + sid + "." + cid + "\" data-eclass=" + eclass + "></td>";
          row += "<td class=\"sub1_active sub\"><div class=a_" + cv + " id=class_box_" + i + ">";
          row += cv + "</div></td>";
          row += "<td class=\"sub timestamp\" title=\"UTC: " + utctimestamp + "\">" + timestamp + "</td>";
          row += txBit;
          row += "<td class=\"sub sub_filter\" data-type=ip>" + src_ip + "</td>";
          row += "<td class=\"sub sub_filter\" data-type=spt>" + src_port + "</td>";
          row += "<td class=\"sub sub_filter\" data-type=ip>" + dst_ip + "</td>";
          row += "<td class=\"sub sub_filter\" data-type=dpt>" + dst_port + "</td>";
          row += "<td class=\"sub sub_filter\" data-type=sid data-value= ";
          row += sig_id + ">" + signature + "</td>";
          row += "</td></tr>";
        }

        // Update parent counts
        $(".d_row_sub_active").find(".b_ec_hot").text(rtCount);
        if ($(".d_row_sub_active").find(".b_ec_total").text() < tlCount) {
          $(".d_row_sub_active").find(".b_ec_total").text(tlCount);
        }

        var cols = $('th.sort').length;

        tbl += "<tr class=eview_sub1 id=eview_sub1><td colspan=" + cols + ">";
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
      var urArgs = "type=2a&ts=" + theWhen + "&filter=" + theFilter + "&sensors=" + theSensors + "&rt=" + rt + "&sv=" + sortval;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb3a(data)});
      });

      function cb3a(data){
        eval("d2a=" + data);
        var tbl = '';
        var head = '';
        var row = '';
        var disabled = ''; 
        if (d2a.length == 0) {
          disabled = "disabled";
          row += "<tr class=d_row_sub1><td class=row colspan=122>";
          row += "No result. If this is unexpected try <span class=link id=retry>this</span></td></tr>";
        }        

        head += "<thead>";
        head += "<tr>";
        head += "<th class=sub width=10><input id=ca2 class=chk_all type=checkbox " + disabled + "></th>";
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

          // Timestamp
          var compts       = d2a[i].f2.split(",") || "--";
          var timestamp    = compts[0];
          var utctimestamp = compts[1];

          // Sum priorities
          var prC = Number(1);
          switch (sig_pri) {
            case "1": spr1 += prC; break;
            case "2": spr2 += prC; break;
            case "3": spr3 += prC; break;
            default: spr4 += prC; break;
          }

          var rid = "s" + i + "-" + sid + "-" + cid;
          var eid = sid + "-" + cid;
          var sg = sig_id + "-" + sig_gen;  
          var tclass = "c" + eclass;
          var cv = classifications.class[tclass][0].short;

          // Transcript link
          txdata = "s" + i + "-" + cid + "-" + s2h(sid + "|" + utctimestamp + "|" + src_ip + "|" + src_port + "|" + dst_ip + "|" + dst_port);

          txBit = "<td class=\"sub sub2_inactive\">" + sid + "." + cid + "</div>";   
          if (src_port != "-" && dst_port != "-") {
            txBit = "<td class=\"sub sub2_active\" data-tx=" + txdata + " title='Generate Transcript'>" + sid + "." + cid + "</td>";
          }
   
          row += "<tr class=d_row_sub1 id=s" + i + " data-sg=\"" + sg + "\" data-cols=12 data-filter=\"" + eid + "\">";
          row += "<td class=sub><input id=cb_" + i + " class=chk_event "; 
          row += "type=checkbox value=\"" + sid + "." + cid + "\" data-eclass=" + eclass + "></td>";
          row += "<td class=\"sub sub1_active\"><div class=a_" + cv + " id=class_box_" + i + ">";
          row += cv + "</div></td>";
          row += "<td class=sub><div class=pr" + d2a[i].f16 + ">" + d2a[i].f16 + "</div></td>";
          row += "<td class=\"sub timestamp\" title=\"UTC: " + utctimestamp + "\">" + timestamp + "</td>";
          row += txBit;
          row += "<td class=\"sub sub_filter\" data-type=ip>" + src_ip + "</td>";
          row += "<td class=\"sub sub_filter\" data-type=spt>" + src_port + "</td>";
          row += "<td class=\"sub " + cs[0] + "\" title=\"" + src_clong + "\" data-type=cc data-value=";
          row += src_cc +">" + cs[1] + "</td>";
          row += "<td class=\"sub sub_filter\" data-type=ip>" + dst_ip + "</td>";
          row += "<td class=\"sub sub_filter\" data-type=dpt>" + dst_port + "</td>";
          row += "<td class=\"sub " + cd[0] + "\" title=\"" + dst_clong + "\" data-type=cc data-value=";
          row += dst_cc +">" + cd[1] + "</td>";
          row += "<td class=\"sub sub_filter\" data-type=sid data-value=" + sig_id + ">" + signature + "</td></tr>";
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
        } else {
          var pryBar =  mkPribar([0]);
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
          head += "<th class=sub4 rowspan=2>IP</th>";
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

          row += "<tr>";
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
              row += "<th class=sub4 rowspan=2>ICMP</th>";
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
              row += "<th class=sub4 rowspan=2>TCP</th>";
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
              row += "<th class=sub4 rowspan=2>UDP</th>";
              row += "<th class=sub2 width=460>LENGTH</th>";
              row += "<th class=sub2>CHECKSUM</th>";
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

          row += "<table class=select align=center width=100% cellpadding=0 cellspacing=0>";
          row += "<tr>";
          row += "<th class=sub4 rowspan=2>DATA</th>";
          row += "<th class=sub2 width=460>HEX</th>";
          row += "<th class=sub2 >ASCII</th>";
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

          head += "<table class=\"tlip select\"  align=center width=100% cellpadding=0 cellspacing=0>";
          head += "<tr>";
          head += "<th class=sub2>EVENT DETAIL</th>";
          head += "</tr>";

          var p_ascii = "No Data Sent.";
          if (theData[2]) {
            var re = /\n/g;
            p_ascii = h2s(theData[2].data_payload).replace(re, "<br>");
          }
          row += "<tr class=d_row_sub2>";
          row += "<td class=\"sub3_d select\">" + p_ascii + "</td>";
          row += "</tr></table>";
           
        }
                    
        tbl += "<tr class=\"eview_sub2 select\" id=eview_sub2><td class=sub2 colspan=" + nCols + ">";

        if ( sg != 0 ) {
          tbl += "<div class=sigtxt></div>";
          sigLookup(sg);
        }
        var eventComment = theData[0].comment || 'None.';
        tbl += "<div class=comments>comments: " + eventComment + "</div>";
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
      }
      break;
    }
    // If event queue is off we need to reset this after load if b_ec_hot was 
    // the entry point
    if ($('#rt').text() == 'off') rtbit = 0;
  } 

  //
  // Object click handlers
  //

 $(document).on("click", ".sub_filter,.row_filter,.tof,.value_link,.nr_f", function(e) {
    var prefix = $(this).data('type');
    var suffix = $(this).text();
    var tfocus = "#search";
    switch (prefix) {
      case    'ip': hItemAdd(suffix);
                    mkPickBox(prefix,suffix,0);
      break;
      case   'sip': hItemAdd(suffix);
                    mkPickBox(prefix,suffix,0);
      break;
      case   'dip': hItemAdd(suffix);
                    mkPickBox(prefix,suffix,0);
      break;
      case    'cc': var cc = $(this).data('value');
                    hItemAdd(cc);
                    mkPickBox(prefix,cc,suffix);
      break;
      case   'scc': var cc = $(this).data('value');
                    hItemAdd(cc);
                    mkPickBox(prefix,cc,suffix);
      break;
      case   'dcc': var cc = $(this).data('value');
                    hItemAdd(cc);
                    mkPickBox(prefix,cc,suffix);
      break;
      case   'cmt': suffix = $(this).data('comment');
                    $("#rt").text("off");
                    $("#rt").attr('class','tvalue_off');
                    $('#search').val(prefix + " " + suffix);
                    hItemAdd(suffix);
                    if ($('#cat_box').css('display') != 'none') {
                      $('#ico01').click();
                    }
                    $('.b_update').click();
      break;
      case 'cmt_c': $('.cat_msg_txt').val(suffix);
                    hItemAdd(suffix);
                    tfocus = ".cat_msg_txt";
      break;
      case   'fil': var fil = $(this).data('value');
                    $('#search').val(fil);
                    hItemAdd(fil);
                    if ($('#fltr_box').css('display') != 'none') {
                      $('#ico04').click();
                    }
                    $('.b_update').click();
      break;
      case   'sid': var value = $(this).data('value');
                    hItemAdd(suffix);
                    mkPickBox(prefix,value,suffix);
      break;
      case   'spt': hItemAdd(suffix);
                    mkPickBox(prefix,suffix,0);
      break;
      case   'dpt': hItemAdd(suffix);
                    mkPickBox(prefix,suffix,0);
      break;
      case    'st': var suffix = $(this).attr('id').split('-')[1];
                    $('#search').val(prefix + " " + suffix);
                    // RT must be off to return anything
                    $('#rt').attr('class','tvalue_off');
                    $('#rt').text('off');
                    rtbit = 0;
                    $('.b_update').click();                  
      break;
    } 
  });

  //
  // Picker Box
  //

  function mkPickBox(prefix,suffix,rsuffix) {
    if ($('#t_search').data('state') == 1) return;
    var tbl = '', row = '';
  
    row += "<tr class=\"row p_row_dark\" data-type=l data-alias=cc><td class=nr>LOCAL SEARCH</td></tr>";

    // Local stuff first
    switch (prefix[prefix.length - 1]) {
      case "c": 
        row += "<tr class=p_row data-type=l data-alias=cc><td class=pr>SRC or DST</td></tr>";
        row += "<tr class=p_row data-type=l data-alias=scc><td class=pr>SRC</td></tr>";
        row += "<tr class=p_row data-type=l data-alias=dcc><td class=pr>DST</td></tr>";
      break;
      case "p":
        row += "<tr class=p_row data-type=l data-alias=ip><td class=pr>SRC or DST</td></tr>";
        row += "<tr class=p_row data-type=l data-alias=sip><td class=pr>SRC</td></tr>";
        row += "<tr class=p_row data-type=l data-alias=dip><td class=pr>DST</td></tr>";
        // Coming soon!
        /*row += "<tr class=p_row data-type=l data-alias=tag><td class=nr>ADD/REMOVE TAG</td></tr>";
        row += "<tr class=p_row data-type=l data-alias=col><td class=nr>CHANGE COLOUR</td></tr>";*/
      break;
      case "t":
        row += "<tr class=p_row data-type=l data-alias=spt><td class=pr>SRC</td></tr>";
        row += "<tr class=p_row data-type=l data-alias=dpt><td class=p>DST</td></tr>";
      break;
      case "d":
        row += "<tr class=p_row data-type=l data-alias=sid><td class=pr>SIGNATURE</td></tr>";
      break;
    }

    row += "<tr class=\"row p_row_dark\" data-type=l data-alias=cc><td class=nr>REMOTE SEARCH</td></tr>";

    // Now populate externals
    $('.f_row').each(function() {
      var ct = $(this).data('type');
      if (ct == 'url') {
        var alias = $(this).data('alias');
        var name  = $(this).data('name');
        var url   = $(this).data('filter'); 
        row += "<tr class=p_row data-type=r data-alias=\"" + alias + "\" data-url=\"" + url + "\">";
        row += "<td class=pr>" + name + "</td>";
        row += "</tr>";
      }
    });

    tbl += "<table id=tlpick data-val=\"" + suffix + "\" width=100% class=box_table cellpadding=0 cellspacing=0>";
    tbl += row;
    tbl += "</table>";
    if ($('#tlpick')[0]) $('#tlpick').remove();

    $(".pickbox_tbl").append(tbl);
    $('.pickbox').fadeIn('fast');

    var boxlabel = suffix;
    
    // Use more descriptive names where possible
    var re = /(sid|cc|scc|dcc)/;
    var OK = re.exec(prefix);
    if (OK) {
      var boxlabel = rsuffix;
    }

    if (boxlabel.length > 24) {
      boxlabel = boxlabel.substring(0,24);
      boxlabel += "..";
    }

    $('#pickbox_label').text(boxlabel).css('font-weight','normal');
  }

  $(document).on('click', '.p_row', function() {
    $('.pickbox').fadeOut('fast');
 
    var ctype = $(this).data('type');
    var alias = $(this).data('alias');
    var args  = $('#tlpick').data('val');
    switch(ctype) {
      case "l":
        $('#search').val(alias + " " + args);
        $('.b_update').click();
      break;
      case "r":
        var url = h2s($(this).data('url')).replace("${var}", args);
        window.open(url);
      break; 
    }   
  });

  $(document).on('click', '.pickbox_close', function() {
    $('.pickbox').fadeOut('fast');
  });

  //
  // Object History
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
      $('#h_box').prepend(toAdd);
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
 
  $(document).on("click", "#h_box", function() {
    $("#po").click();
  });

  if (!$('.h_item')[0]) {
    $('#h_box').append('<span id=h_empty>History is empty</span>');
  }

  // Alt mappings for icons

  $.alt('1', function() {
    $("#ico01").click();
  });
  $.alt('2', function() {
    $("#ico02").click();
  });
  $.alt('3', function() {
    $("#ico03").click();
  });
  $.alt('4', function() {
    $("#ico05").click();
  });
  $.alt('5', function() {
    $("#ico04").click();
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
      case 119: stopOthers(); $('#b_class-1').click();  break;
      case 120: stopOthers(); $('#b_class-2').click();  break;
    }
  });

  // Comment window status buttons
  $(document).on("click", "#cw_buttons", function(event) {
    var newclass = $(event.target).data('n');
    if (newclass == 0) {
      $('#b_class-' + newclass).click();
    } else {
      $('#b_class-' + newclass).click();
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
        $(".d_row_sub1").hover(function(){$(this).css("background-color", "#c9c9c9")},
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
    if ($(".cat_msg_txt").val().length != 0) {
      msg = $(".cat_msg_txt").val();
    }        

    if ($('#cat_box').css('display') != 'none') {
      $('#ico01').click();
    }   
 
    // We are now ready to class
    var catdata = intclass + "|||" + msg + "|||" + scidlist;
    var urArgs = "type=" + 9;
    $(function(){
      $.post(".inc/callback.php?" + urArgs, { catdata: catdata } ,function(data){cb9(data)});
    });
        
    function cb9(data){
      eval("catRaw=" + data);
      catDbg = catRaw.dbg;
      if (catDbg == "0") {
        
        var curtotalrtcount = Number(ecls);
        // Working on grouped events
        if ($("#gr").text() == "on") {
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
      default:
        var ess = '';
        if ( count > 1 ) ess = 's';

        var numrows = Number($('.d_row').length + $('.d_row_sub1').length);
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
       
        if (numrows == 0) {
          newView("u");
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

  // Load summary tab
  function loadSummary() {
    var limit = 10;
    if ($('#wm0')[0]) {
      doMap("redraw");
    } else {
      doMap("draw");
    }
    mkSummary("signature",limit);
    mkSummary("srcip",limit);
    mkSummary("dstip",limit);
    mkSummary("srcpt",limit);
    mkSummary("dstpt",limit);
    mkSummary("srccc",limit);
    mkSummary("dstcc",limit);
  }
 
  // Toggle summary section
  $(document).on("click", ".hidepane", function(e) {
    $('#topsignature').toggle();
  });

  // Summary tab 
  function mkSummary(box,limit) {
    var theWhen = getTimestamp();
    var theSensors = s2h('empty');
    var theFilter = mkFilter();
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
     
    var ldr = "<div class=ldr><img src=.css/load.gif></div>";
    $('#ov_' + box + '_sl').prepend(ldr);
    $('#top' + box).fadeTo('fast', 0.2);
    switch (box) {
      case "srcip":
        var cbArgs = "srcip";
        var qargs = "ip-src";
        var urArgs = "type=15&qargs=" + qargs + "&filter=" + theFilter + "&sensors=" + theSensors + "&limit=" + limit + "&ts=" + theWhen;
        $(function(){
          $.get(".inc/callback.php?" + urArgs, function(data){cb15(data,cbArgs)});
        });
      break;
      case "dstip":
        var cbArgs = "dstip";
        var qargs = "ip-dst";
        var urArgs = "type=15&qargs=" + qargs + "&filter=" + theFilter + "&sensors=" + theSensors + "&limit=" + limit + "&ts=" + theWhen;
        $(function(){
          $.get(".inc/callback.php?" + urArgs, function(data){cb15(data,cbArgs)});
        });
      break;
      case "srcpt":
        var cbArgs = "srcpt";
        var qargs = "pt-src";
        var urArgs = "type=15&qargs=" + qargs + "&filter=" + theFilter + "&sensors=" + theSensors + "&limit=" + limit + "&ts=" + theWhen;
        $(function(){
          $.get(".inc/callback.php?" + urArgs, function(data){cb17(data,cbArgs)});
        });
      break;
      case "dstpt":
        var cbArgs = "dstpt";
        var qargs = "pt-dst";
        var urArgs = "type=15&qargs=" + qargs + "&filter=" + theFilter + "&sensors=" + theSensors + "&limit=" + limit + "&ts=" + theWhen;
        $(function(){
          $.get(".inc/callback.php?" + urArgs, function(data){cb17(data,cbArgs)});
        });
      break;
      case "signature":
        var qargs = "sig-sig";
        var urArgs = "type=15&qargs=" + qargs + "&filter=" + theFilter + "&sensors=" + theSensors + "&limit=" + limit + "&ts=" + theWhen;
        $(function(){
          $.get(".inc/callback.php?" + urArgs, function(data){cb16(data)});
        });    
      break;
      case "srccc":
        var cbArgs = "srccc";
        var qargs = "cc-src";
        var urArgs = "type=15&qargs=" + qargs + "&filter=" + theFilter + "&sensors=" + theSensors + "&limit=" + limit + "&ts=" + theWhen;
        $(function(){
          $.get(".inc/callback.php?" + urArgs, function(data){cb15(data,cbArgs)});
        });
      break;
      case "dstcc":
        var cbArgs = "dstcc";
        var qargs = "cc-dst";
        var urArgs = "type=15&qargs=" + qargs + "&filter=" + theFilter + "&sensors=" + theSensors + "&limit=" + limit + "&ts=" + theWhen;
        $(function(){
          $.get(".inc/callback.php?" + urArgs, function(data){cb15(data,cbArgs)});
        });
      break;
    }   

    // IP and Country
    function cb15(data,cbArgs){
      var ch  = "SRC";
      var wip = "d";
      if (cbArgs[0] == "s") ch = "DST", wip = "s";
      eval("raw=" + data);
      var tbl = '', head = '', row = ''; 
      head += "<thead><tr>";
      head += "<th width=60 class=sub>COUNT</th>";
      head += "<th width=60 class=sub>%TOTAL</th>";
      head += "<th width=50 class=sub>#SIG</th>";
      head += "<th width=50 class=sub>#" + ch + "</th>";
      if (cbArgs[3] == "c") {
        head += "<th class=sub>COUNTRY</th>";
        head += "<th width=50 class=sub>#IP</th>"; 
      } else {
        head += "<th width=120 class=sub>IP</th>";
        head += "<th class=sub>COUNTRY</th>";	
      }
      head += "</tr></thead>";         
     
      var eventsum = raw[raw.length - 1].n || 0;
      var records  = raw[raw.length - 1].r || 0;
      if (records == 0) {
        row = "<tr><td class=row colspan=6>No result.</td></tr>";
        $("#ov_" + cbArgs + "_sl").text("");
      }
      for (var i=0; i<raw.length - 1; i++) {
        var cnt   = raw[i].f1 || "-";
        var sigs  = raw[i].f2 || "-";
        var ip2   = raw[i].f3 || "-";
        var cc    = raw[i].f4 || "-";
        var clong = raw[i].f5 || "-";
        var ip    = raw[i].f6 || "-"; 
        var cs = getCountry(cc).split("|");
        if (cs[1] == "LO") { cs[1] = ""; }
        var per = 0;
        if (eventsum > 0) per = parseFloat(cnt/eventsum*100).toFixed(2);
        row += "<tr class=t_row>";
        row += "<td class=row><b>" + cnt + "</b></td>";
        row += "<td class=row><b>" + per + "%</b></td>";
        row += "<td class=row><b>" + sigs + "</b></td>";
        row += "<td class=row><b>" + ip2 + "</b></td>";
        
        if (cbArgs[3] == "c") {
          row += "<td class=" + cs[0] + " data-type=" + wip + "cc data-value=" + cc + ">";
          row += cs[1] + clong + " (." + cc.toLowerCase() + ")" + "</td>";
          row += "<td class=row><b>" + ip + "</b></td>";         
        } else {
          row += "<td class=sub_filter data-type=" + wip + "ip>" + ip + "</td>";
          row += "<td class=" + cs[0] + " data-type=" + wip + "cc data-value=" + cc + ">"; 
          row += cs[1] + clong + " (." + cc.toLowerCase() + ")" + "</td>";
        }
        row += "</tr>";
        row += "<tr><td colspan=6><div class=bars style=\"width:" + per + "%;\"></div></td></tr>";
      }
      tbl += "<table id=top" + cbArgs + " class=dash cellpadding=0 cellspacing=0>";
      tbl += head;
      tbl += row;
      tbl += "</table>";
      if ($("#top" + cbArgs)[0]) $("#top" + cbArgs).remove();
      $("#ov_" + cbArgs + "_sl").after(tbl);
      $("#ov_" + cbArgs + "_msg").html("viewing <b><span id=ov_" + cbArgs + "_sl_lbl>" + i + "</b> of <b>" + records + " </b>results"); 
      mkSlider("ov_" + cbArgs + "_sl", i, records);
      //$("#top" + cbArgs).tablesorter({
      //    cancelSelection:true
      //});
    }

    // Ports
    function cb17(data,cbArgs){
      eval("raw=" + data);
      var tbl = '', head = '', row = ''; 
      head += "<thead><tr>";
      head += "<th width=60 class=sub>COUNT</th>";
      head += "<th width=60 class=sub>%TOTAL</th>";
      head += "<th width=50 class=sub>#SIG</th>";
      head += "<th width=50 class=sub>#SRC</th>"
      head += "<th width=50 class=sub>#DST</th>";
      head += "<th width=50 class=sub>PORT</th>";
      head += "</tr></thead>";         
     
      var eventsum = raw[raw.length - 1].n || 0;
      var records  = raw[raw.length - 1].r || 0;
      if (records == 0) {
        row = "<tr><td class=row colspan=6>No result.</td></tr>";
        $("#ov_" + cbArgs + "_sl").text("");
      }
      for (var i=0; i<raw.length - 1; i++) {
        var cnt   = raw[i].f1 || "-";
        var sigs  = raw[i].f2 || "-";
        var src   = raw[i].f3 || "-";
        var dst   = raw[i].f4 || "-";
        var port  = raw[i].f5 || "-";
        if (eventsum > 0) per = parseFloat(cnt/eventsum*100).toFixed(2);
        row += "<tr class=t_row>";
        row += "<td class=row><b>" + cnt + "</b></td>";
        row += "<td class=row><b>" + per + "%</b></td>";
        row += "<td class=row><b>" + sigs + "</b></td>";
        row += "<td class=row><b>" + src + "</b></td>";
        row += "<td class=row><b>" + dst + "</b></td>";
        row += "<td class=sub_filter data-type=" + cbArgs[0] + "pt>" + port + "</td>";
        row += "</tr>";
        row += "<tr><td colspan=6><div class=bars style=\"width:" + per + "%;\"></div></td></tr>";
      }
      tbl += "<table id=top" + cbArgs + " class=dash cellpadding=0 cellspacing=0>";
      tbl += head;
      tbl += row;
      tbl += "</table>";
      if ($("#top" + cbArgs)[0]) $("#top" + cbArgs).remove();
      $("#ov_" + cbArgs + "_sl").after(tbl);
      $("#ov_" + cbArgs + "_msg").html("viewing <b><span id=ov_" + cbArgs + "_sl_lbl>" + i + "</b> of <b>" + records + " </b>results"); 
      mkSlider("ov_" + cbArgs + "_sl", i, records);
      //$("#top" + cbArgs).tablesorter({
      //    cancelSelection:true
      //});
    }
    // Signature
    function cb16(data){
      eval("raw=" + data);
      var tbl = '', head = '', row = ''; 
      head += "<thead><tr>";
      head += "<th width=60 class=sub>COUNT</th>";
      head += "<th width=60 class=sub>%TOTAL</th>";
      head += "<th width=40 class=sub>#SRC</th>";
      head += "<th width=40 class=sub>#DST</th>";
      head += "<th class=sub>SIGNATURE</th>";
      head += "<th width=100 class=sub>ID</th>";
      head += "</tr></thead>";         
     
      var eventsum = raw[raw.length - 1].n || 0;
      var records  = raw[raw.length - 1].r || 0; 
      if (records == 0) {
        row = "<tr><td class=row colspan=6>No result.</td></tr>";
        $("#ov_signature_sl").text("");
        $("#ovestat").html("(No events)");
      } else {
        $("#ovestat").html("(" + eventsum + " events)"); 
      }
      for (var i=0; i<raw.length - 1; i++) {
        var cnt = raw[i].f1 || "-";
        var src = raw[i].f2 || "-";
        var dst = raw[i].f3 || "-";
        var sid = raw[i].f4 || "-";
        var sig = raw[i].f5 || "-";
        var per = 0;
        if (eventsum > 0) per = parseFloat(cnt/eventsum*100).toFixed(2);
        row += "<tr class=t_row>";
        row += "<td class=row><b>" + cnt + "</b></td>";
        row += "<td class=row><b>" + per + "%</b></td>";
        row += "<td class=row><b>" + src + "</b></td>";
        row += "<td class=row><b>" + dst + "</b></td>";
        row += "<td class=row_filter data-type=sid data-value=";
        row += sid + ">" + sig + "</td>";
        row += "<td class=row>" + sid + "</td>";
        row += "</tr>";
        row += "<tr><td colspan=6><div class=bars style=\"width:" + per + "%;\"></div></td></tr>"; 
      }
      
      tbl += "<table id=topsignature class=dash cellpadding=0 cellspacing=0>";
      tbl += head;
      tbl += row;
      tbl += "</table>";
      if ($('#topsignature')[0]) $('#topsignature').remove(); 
      $("#ov_signature_sl").after(tbl);
      $("#ov_signature_msg").html("viewing <b><span id=ov_signature_sl_lbl>" + i + "</span></b> of <b>" + records + " </b>results");
      mkSlider("ov_signature_sl", i, records);
      //$("#topsignature").tablesorter({
      //    cancelSelection:true
      //});
    }
  }

  $(".ovsl").mouseup(function() {
    var section = $(this).attr('id');
    var base    = section.split("_")[1];
    var limit   = Number($("#" + section + "_lbl").text());
    if (limit > 0) mkSummary(base, limit);
  });

  //
  // Views tab
  //

  function loadViews() {
    $('.db_links').show();
    if (!$("#db_view_cont")[0]) mkView();
  }

  // Link handlers
  $(document).on('click', '.db_link', function() {
    $('.db_link').each(function() {
      if ($(this).data('state') == '1') {
        $(this).removeClass('db_link_active');
        $(this).data('state', '0');
      }  
    });
    $(this).data('state', '1');
    mkView();
  });

  $(document).on('click', '.db_type', function() {
    $('.db_type').each(function() {
      if ($(this).data('state') == '1') {
        $(this).removeClass('db_type_active');
        $(this).data('state', '0');
      }  
    });
    $(this).data('state', '1');
    mkView();
  });

  $(document).on('click','.db_save', function() {
    
  });

  // Create the view
  function mkView() {
    $('#db_view_cont,#hp_info').remove();
    if (!$("#db_view_ldr")[0]) {
      var view = 'ip';
      $('.db_link').each(function() {
        if ($(this).data('state') == '1') {
          $(this).addClass('db_link_active');
          view = $(this).data('val');
        } 
      });
      
      var type = 'sk';
      $('.db_type').each(function() {
        if ($(this).data('state') == '1') {
          $(this).addClass('db_type_active');
          type = $(this).data('type');
        } 
      });

      var theWhen = getTimestamp();
      var theSensors = s2h('empty');
      var theFilter = mkFilter();
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

      var ldr = "<div id=db_view_ldr class=ldr100><img src=.css/load.gif></div>";
      $('.db_view').after(ldr);
      var qargs = view + "-" + type;
      var urArgs = "type=16&qargs=" + qargs + "&filter=" + theFilter + "&sensors=" + theSensors + "&ts=" + theWhen;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb17(data,type)});
      });
    
      function cb17(data,type) {
        eval("viewData=" + data);
        var records = viewData.records;
        if ($('#db_view_cont')[0]) $('#db_view_cont').remove();
        if (records > 0) {
          $('.db_view').after("<div id=db_view_cont></div>");
          switch (type) {
            case 'sk':
              var w = $(window).width();
              var h = viewData.links.length * 12;
              if (h < 100) h = 100;
              mkSankey("db_view_cont",viewData,w,h);
            break;
          }
        } else {
          $('.db_view').after("<div class=label100 id=db_view_cont><b>The query returned no results.</b></div>");
        }
        $('#db_view_ldr').remove();
      } 
    }
  }

  // Make a map
  function doMap(req) {
    theWhen = getTimestamp();
    var theFilter = mkFilter();
    var working = "Working<br><img src=.css/load.gif>";
    switch (req) {
      case "src":
        filter = "src"; break;
      case "dst":
        filter = "dst"; break;
      default:
        filter = 0; break;
    }

    $('#wm0').html(working);

    var urArgs = "type=" + 10 + "&filter=" + theFilter + "&ts=" + theWhen;
    $(function(){
      $.get(".inc/callback.php?" + urArgs, function(data){cb10(data)});
    });

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
      var w = $(window).width() - 72;
      var h = w / 2.7 ;
      $("#ov_map").html("<div id=wm0 style=\"width:" + w + "px; height:" + h + "px;\"></div>");
      $('#wm0').vectorMap({
        map: 'world_mill_en',
        color: '#f4f3f0',
        backgroundColor: '#CFE1FC',
        zoomOnScroll: false,
        onRegionClick: function(event, code){
        hItemAdd(code);
        $('#search').val("cc" + " " + code);
        $('#search').focus();
        },
        series: {
          regions: [{
            values: mapDetail,
            scale: ['#ffffff', '#000000'],
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

      var stats = "(<b>";
      stats += allc + "</b> distinct countries)";
      $("#ovmapstat").html(stats);
    }
  }
    
  // Redraw map
  $(document).on("click", "#map_src, #map_dst", function() {
    doMap($(this).attr('id').split("_")[1]);
  });

// The End.
});
