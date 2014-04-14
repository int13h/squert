$(document).ready(function(){

  mkFilterBox();
  mkSensorBox();

  $(document).on("click", ".icon,.box_close,#cmnt", function(event) {
    var caller = $(this).data('box');
    var cID = "#" + caller + "_box";
    var isOpen = $('#t_search').data('state');
    // Make sure we are on the right page
    if ($('#t_sum').attr('class') != "tab_active") return;
    // Are we the only one open?
    if (isOpen == 0) {
      $('#t_search').data('state',1);     
      $(".content_active").fadeTo('fast',0.2);
      $(cID).fadeIn();

      switch (caller) {
        case 'cat': 
          mkCatBox();
        break;
        case 'ac':
          mkAutocatBox();
        break;
        default:
          return;
        break;
      }
    } else {
      // If we are the one that is open, close and reset
      if ($(cID).css('display') != 'none') {
        $('#t_search').data('state',0);
        $(cID).fadeOut();
        $(".content_active").fadeTo('fast',1);
      }  
    }
  });

  // 
  // Comment box
  //

  function mkCatBox() {
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
      head += "<th class=sub width=50>SEARCH</th>";
      head += "<th class=sub width=75>EPOCH</th>";
      head += "<th class=sub width=100>USER</th>";
      head += "<th class=sub width=75>LAST</th>";
      head += "<th class=sub width=100>USER</th>";
      head += "<th class=sub width=50>REMOVE</th>";
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
        row += "<div class=tof title=\"Show these events\" data-type=cmt data-comment=\"" + comment + "\">";
        row += "<img class=il src=.css/search.png></div></td>";
        row += "<td class=sub>" + epoch + "</td>";
        row += "<td class=sub>" + user + "</td>";
        row += "<td class=sub>" + last + "</td>";
        row += "<td class=sub>" + user + "</td>";
        row += "<td class=sub>";
        row += "<div class=tod title=\"Delete Entry\" data-rn=\"" + rowid + "\" data-comment=\"" + comment + "\">";
        row += "<img class=il src=.css/close.png></div></td>";
        row += "<row>"; 
      }

      tbl += "<table id=tlcom width=100% class=box_table cellpadding=0 cellspacing=0>";
      tbl += head;
      tbl += row;
      tbl += "</table>";
      if ($('#tlcom')[0]) {
        $('#tlcom').remove();
      }    
      $(".cm_tbl").append(tbl);
      $("#tlcom").tablesorter();
    }

    // Display the current event selection in the header
    var toclass = '<b>Note:</b> no';
    if ($(".chk_event:checked").length > 0 || $('.chk_all').prop("checked")) toclass = $('#class_count').text(); 
    $('#ovcstat').html(toclass + " events selected");
    $(".cat_msg_txt").focus();   
  }

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

  // 
  // Sensor box 
  //

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
      
      tbl += "<table id=tlsen class=box_table width=100% cellpadding=0 cellspacing=0>";
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
  }

  //
  // Filters
  //

  // Create entries
  function mkEntry(entry) {

    cls = 'f_row';
    if (!entry) {
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

  function mkFilterBox() {
            
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
      tbl += "<table id=tl4 class=box_table width=100% cellpadding=0 cellspacing=0>";
      tbl += head;
      tbl += row;
      tbl += "</table>";
      if ($('#tl4')[0]) {
        $('#tl4').remove();
      }
      $('.fltr_tbl').append(tbl);
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
    } else {
      $('#tbl_help').remove();
    }
  });

  // Refresh filter listing
  $(document).on("click", ".filter_refresh", function(event) {
    mkFilterBox();
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
      if ($('#' + currentCL).text() == 'close') {
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
      var builtins = ["cc","dip","dpt","ip","sid","sig","sip","spt","scc","dcc","st"];
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

  //
  // Autocat
  //

  // Create entries
  function mkAcEntry() {
    row = '';
    row += "<tr id=tr_ac_new";
    row += " data-status=1";
    row += " data-comment=\"New Rule\"";
    row += " data-src_ip=any";
    row += " data-src_port=any";
    row += " data-dst_ip=any";
    row += " data-dst_port=any"; 
    row += " data-proto=any";
    row += " data-signature=any"
    row += " data-sensor=any";
    row += " data-active=Y";
    row += " data-expires=none>";
    row += "<td class=row><div class=a_NA>NA</div></td>";
    row += "<td class=row>-</td>";
    row += "<td class=row><span id=ac_new class=ac_edit_on>New Rule</span></td>";
    row += "<td class=row>any</td>";
    row += "<td class=row>any</td>";
    row += "<td class=row>any</td>";
    row += "<td class=row>any</td>";
    row += "<td class=row>any</td>";
    row += "<td class=row>any</td>";
    row += "<td class=row>any</td>";
    row += "<td class=row>You</td>";
    row += "<td class=row>Now</td>";
    row += "</tr>";
    return row;
  }

  function mkAutocatBox() {
            
    var urArgs = "type=17" + "&mode=query";
    $(function(){
      $.get(".inc/callback.php?" + urArgs, function(data){cb18(data)}); 
    });

    function cb18(data){
      eval("theData=" + data);
      tbl = '';
      head = '';
      row = '';
      head += "<thead><tr>";
      head += "<th class=sub width=20>ST</th>";
      head += "<th class=sub width=20>ID</th>";
      head += "<th class=sub width=200>COMMENT</th>";
      head += "<th class=sub width=100>SENSOR</th>";
      head += "<th class=sub width=100>SOURCE</th>";
      head += "<th class=sub width=40>PORT</th>";
      head += "<th class=sub width=100>DESTINATION</th>"
      head += "<th class=sub width=40>PORT</th>";
      head += "<th class=sub width=40>PROTO</th>";
      head += "<th class=sub>SIGNATURE</th>";
      head += "<th class=sub width=70>USER</th>";
      head += "<th class=sub width=100>CREATED</th>";
      head += "</tr></thead>";

      for (var i=0; i<theData.length; i++) {
        var autoid    = theData[i].autoid    || '-';
        var status    = theData[i].status    || '-';
        var comment   = theData[i].comment   || 'any';
        var src_ip    = theData[i].src_ip    || 'any';
        var src_port  = theData[i].src_port  || 'any';
        var dst_ip    = theData[i].dst_ip    || 'any';
        var dst_port  = theData[i].dst_port  || 'any';
        var proto     = theData[i].ip_proto  || 'any';
        var signature = theData[i].signature || 'any';
        var sensor    = theData[i].sensor    || 'any';
        var user      = theData[i].user      || 'any';
        var active    = theData[i].active    || 'no';
        var timestamp = theData[i].ts        || '-';
        var expires   = theData[i].expires   || 'no';

        var tclass = "c" + status;
        var cv = classifications.class[tclass][0].short;
        var isoff = "ac_edit_on";
        var rid = "ac_" + autoid;
        if (active == "N") isoff = "ac_edit_off";
        row += "<tr id=tr_" + rid;
        row += " data-status=\"" + status + "\"";
        row += " data-comment=\"" + comment + "\"";
        row += " data-src_ip=\"" + src_ip + "\"";
        row += " data-src_port=\"" + src_port + "\"";
        row += " data-dst_ip=\"" + dst_ip + "\"";
        row += " data-dst_port=\"" + dst_port + "\""; 
        row += " data-proto=\"" + proto + "\"";
        row += " data-signature=\"" + signature + "\"";
        row += " data-sensor=\"" + sensor + "\""; 
        row += " data-active=\"" + active + "\"";
        row += " data-expires=\"" + expires + "\">";
        row += "<td class=row><div class=a_" + cv + ">" + cv + "</div></td>";
        row += "<td class=row>" + autoid + "</td>";
        row += "<td class=row><span id=" + rid + " class=" + isoff + ">" + comment + "</span></td>";
        row += "<td class=row>" + sensor + "</td>";
        row += "<td class=row>" + src_ip + "</td>";
        row += "<td class=row>" + src_port + "</td>";
        row += "<td class=row>" + dst_ip + "</td>";
        row += "<td class=row>" + dst_port + "</td>";
        row += "<td class=row>" + proto + "</td>";
        row += "<td class=row>" + signature + "</td>";
        row += "<td class=row>" + user + "</td>";
        row += "<td class=row>" + timestamp + "</td>";
        row += "</tr>";
      }
      tbl += "<table id=tlac class=box_table width=100% cellpadding=0 cellspacing=0>";
      tbl += head;
      tbl += row;
      tbl += "</table>";
      if ($('#tlac')[0]) {
        $('#tlac').remove();
      }
      $('.ac_tbl').append(tbl);
    }      
  }

  // Rule expansion (gives access to edit as well)
  $(document).on("click", ".ac_edit_on,.ac_edit_off", function(event) {
    currentCL = $(this).attr('id');
    if (!$("#ac_content")[0]) {
      openAcEdit(currentCL);
      $('#' + currentCL).data('edit','yes');
      $('td:first-child', $(this).parents('tr')).css('background-color','#c4c4c4');
      $('td:nth-child(2)', $(this).parents('tr')).css('background-color','#c4c4c4');
      $('td:nth-child(3)', $(this).parents('tr')).css('background-color','#c4c4c4');
    } else {
      if ($('#' + currentCL).data('edit') == 'yes') {
        $("#ac_content").remove();
        if (currentCL == "ac_new") {
          $("#tr_" + currentCL).fadeOut('slow', function() {
            $("#tr_" + currentCL).remove();
          });
        } else {
          $('td:first-child', $(this).parents('tr')).css('background-color','transparent');
          $('td:nth-child(2)', $(this).parents('tr')).css('background-color','transparent');
          $('td:nth-child(3)', $(this).parents('tr')).css('background-color','transparent');
          $('#' + currentCL).data('edit','no');
        }
      }
    }
  });

  function openAcEdit (cl) {
    var id = '#tr_' + cl;
    row = '';
    row += "<tr id=ac_content>";
    row += "<td class=ac_row colspan=12><textarea id=txt_" + cl + " rows=13>";
    row += "{\n";
    row += "\"status\": \"" + $(id).data('status') + "\",\n";
    row += "\"comment\": \"" + $(id).data('comment') + "\",\n";
    row += "\"sensor\": \"" + $(id).data('sensor') + "\",\n";
    row += "\"src_ip\": \"" + $(id).data('src_ip') + "\",\n";
    row += "\"src_port\": \"" + $(id).data('src_port') + "\",\n";
    row += "\"dst_ip\": \"" + $(id).data('dst_ip') + "\",\n";
    row += "\"dst_port\": \"" + $(id).data('dst_port') + "\",\n";
    row += "\"proto\": \"" + $(id).data('proto') + "\",\n";
    row += "\"signature\": \"" + $(id).data('signature') + "\",\n";
    row += "\"active\": \"" + $(id).data('active') + "\",\n";
    row += "\"expires\": \"" + $(id).data('expires') + "\"\n";
    row += "}";
    row += "</textarea>";
    var dBut = '';
    var isOn = 'disable';
    if ($(id).data('active') == "N") isOn = "enable";
    if (cl != "ac_new") dBut = "'<div class=ac_disable>" + isOn + "</div></div>";
    row += "<div class=ac_bees><div class=ac_create>create</div>" + dBut;
    row += "<div class=ac_error></div>";
    row += "</td></tr>";

    $('#tr_' + cl).after(row);
  }
  // Refresh rule listing
  $(document).on("click", ".ac_refresh", function(event) {
    mkAutocatBox();
  });

  // Create new rule
  $(document).on("click", ".ac_new", function(event) {
    // There can be only one :/  
    if ($('#ac_new').length == 0 && $('#ac_content').length == 0) {
      newAcEntry = mkAcEntry();
      if ($('#ac_help').length == 0) {
        $('#tlac').prepend(newAcEntry);
      } else {
        $('#ac_help').after(newAcEntry);
      }
    }
  });
    
  // Update (or create new) rule
  $(document).on("click", ".ac_create", function(event) {
    // Hide any previous errors
    $('.ac_error').empty();
    eMsg = '';
    try {
      var rawTxt = $('#txt_' + currentCL).val();

      // Fitler out some stuff
      rawTxt = rawTxt.replace(/[@|&;*\\`]/g, "");
      rawTxt = rawTxt.replace(/[>]/g, "&gt;");
      rawTxt = rawTxt.replace(/[<]/g, "&lt;");
      var ruleTxt = $.parseJSON(rawTxt);

      // Check for empty objects
      emptyVal = 0;
      for (var i in ruleTxt) {
        if (ruleTxt.hasOwnProperty(i)) {
          if (ruleTxt[i].length == 0) {
            emptyVal++;
          }
        }
      }
      if (emptyVal > 0) throw 0; 

      // Validate Comment
      var re = /^[a-zA-Z][\w-]*$/;
      var OK = re.exec(ruleTxt.alias);
      if (!OK) throw 1;
      if (ruleTxt.comment == "New Rule") throw 1;
      if (ruleTxt.comment.length > 255) throw 1;

      // Validate status
      var sl = [1,2,11,12,13,14,15,16,17];
      if (sl.indexOf(Number(ruleTxt.status)) == -1) throw 2;

      // Validate IP and ports
      


      // Continue..
      oldCL = currentCL;
      var fd = s2h(JSON.stringify(ruleTxt));
      var urArgs = "type=17&mode=update&data=" + fd;

      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb19(data)}); 
      });

      function cb19(data){
        eval("theData=" + data);
        if (theData.msg) {
          alert(theData.msg);
        } else {
          mkAutocatBox();
        }         
      }

    } catch (err) {

      switch (err) {
        case 0:
          eMsg += "<span class=warn>Error!</span> ";
          eMsg += "Please supply a value for each object.";
          break;
        case 1:
          eMsg += "<span class=warn>Error!</span> "
          eMsg += "Valid characters are: ";
          eMsg += "Aa-Zz, 0-9, dashes and underscores.";
          eMsg += "The word \"New Rule\" is reserved and may not be used.";
          break;
        case 2:
          eMsg += "<span class=warn>Error!</span> "
          eMsg += "Invalid status. Possible values are: 1,2,11,12,13,14,15,16 or 17";
          break;
        default:
          eMsg += "<span class=warn>Format error!</span> ";
          eMsg += "Please ensure the format above is valid JSON. ";
          eMsg += "I am looking for an opening curly brace <b>\"{\"</b> followed by <b>\"object\": \"value\"</b> ";
          eMsg += "pairs.<br> Each <b>\"object\": \"value\"</b> pair terminates with a comma <b>\",\"</b> except ";
          eMsg += "the last pair before the closing curly brace <b>\"}\"</b>.";
          eMsg += " Strings must be enclosed within double quotes.";
      }
      $('.ac_error').append(eMsg);
      $('.ac_error').fadeIn();
    }
  });

  // Disable rule
  $(document).on("click", ".ac_disable", function(event) {
    var oktoRM = confirm("Are you sure you want to disable this rule?");
    if (oktoRM) {
      var urArgs = "type=17&mode=disable&data=" + currentCL;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb20(data)});
      }); 
      function cb20(data){
        eval("theData=" + data);
        if (theData.msg != '') {
          alert(theData.msg);
        } else {
          mkAutocatBox();
        }
      }
    }
  });
});
