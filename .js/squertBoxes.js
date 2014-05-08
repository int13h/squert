$(document).ready(function(){

  mkFilterBox();
  mkSensorBox();

  $(document).on("click", ".icon,.box_close,#cmnt", function(event) {
    var caller = $(this).data('box');
    var cID = "#" + caller + "_box";
    var isOpen = $('#t_search').data('state');
    // Make sure we are on the right page
    //if ($('#t_sum').attr('class') != "tab_active" && caller != 'fltr' && caller != 'sen')  return;
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
    $('#cat_box_label').after('<img class=cm_tbl_ldr src=\".css/load.gif\">'); 
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
        row += "<td class=nr>" + cgrid + "</td>"; 
        row += "<td class=nr>" + count + "</td>";
        row += "<td class=nr_f data-type=cmt_c>" + comment + "</td>";
        row += "<td class=nr>";
        row += "<div class=tof title=\"Show these events\" data-type=cmt data-comment=\"" + comment + "\">";
        row += "<img class=il src=.css/search.png></div></td>";
        row += "<td class=nr>" + epoch + "</td>";
        row += "<td class=nr>" + user + "</td>";
        row += "<td class=nr>" + last + "</td>";
        row += "<td class=nr>" + user + "</td>";
        row += "<td class=nr>";
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
      $(".cm_tbl_ldr").remove();
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
        row += "<td class=nr width=20><input id=cb_sen_" + i + " class=chk_sen "; 
        row += "type=checkbox value=\"" + sid + "\"></td>";
        row += "<td class=nr><b>" + network + "</b></td>";
        row += "<td class=nr>" + hostname + "</td>";
        row += "<td class=nr>" + agent + "</td>";
        row += "<td class=nr>" + sid + "</td>";
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
      $(".sen_controls").append(quick);
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

    var search = "<div class=center>-</div>";
    var re = /^Shell -/;
    var OK = re.exec(entry.name);
    if (!OK) search = "<div class=tof title=\"Show these events\" data-type=fil data-value=\"" + alias + "\"><img class=il src=.css/search.png></div>";

    encFilter = s2h(entry.filter);        
    row = '';
    row += "<tr class=" + cls + " id=\"tr_" + entry.alias + "\" ";
    row += "data-alias=\"" + entry.alias + "\" ";
    row += "data-name=\"" + entry.name + "\" ";
    row += "data-notes=\"" + entry.notes + "\" ";
    row += "data-filter=\"" + encFilter + "\" ";
    row += "data-global=0>";
    row += "<td class=nr><div id=\"" + entry.alias + "\" class=\"filter_edit\">" + entry.alias + "</div></td>";
    row += "<td class=nr>" + entry.name + "</td>";
    row += "<td class=nr>" + search + "</div></td>";
    row += "<td class=nr>" + entry.notes + "</td>";
    row += "<td class=nr>now</td>";
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
      head += "<th class=sub width=50>SEARCH</th>"; 
      head += "<th class=sub>NOTES</th>";
      head += "<th class=sub width=100>USER</th>";
      head += "<th class=sub width=120>LAST MODIFIED</th>";
      head += "</tr></thead>";

      for (var i=0; i<theData.length; i++) {
        var alias  = theData[i].alias;
        var name   = theData[i].name;
        var notes  = theData[i].notes;
        var filter = theData[i].filter; 
        var global = theData[i].global;
        var age    = theData[i].age;
        var user   = theData[i].username || "built-in";

        // Exclude search for shells
        var search = "<div class=center>-</div>";
        var re = /^Shell -/;
        var OK = re.exec(name);
        if (!OK) search = "<div class=tof title=\"Show these events\" data-type=fil data-value=\"" + alias + "\"><img class=il src=.css/search.png></div>";

        row += "<tr class=f_row id=\"tr_" + alias + "\" ";
        row += "data-alias=\"" + alias + "\" ";
        row += "data-name=\"" + name + "\" ";
        row += "data-notes=\"" + notes + "\" ";
        row += "data-filter=\"" + filter + "\" ";
        row += "data-global=\"" + global + "\">";
        row += "<td class=nr><div id=\"" + alias + "\" class=\"filter_edit\">" + alias + "</div></td>";
        row += "<td class=nr>" + name + "</td>";
        row += "<td class=nr>" + search + "</td>";
        row += "<td class=nr>" + notes + "</td>";
        row += "<td class=nr>" + user + "</td>";
        row += "<td class=nr>" + age + "</td>";
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
    row += "<td class=f_row colspan=6><textarea id=\"txt_" + alias +"\" rows=10>";
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
      $('#' + currentCL).data('edit','yes');
      $('td:first', $(this).parents('tr')).css('background-color','#c4c4c4');
    } else {
      if ($('#' + currentCL).data('edit') == 'yes') {
        $("#filter_content").remove();
        if (currentCL == "ac_new") {
          $("#tr_" + currentCL).fadeOut('slow', function() {
            $("#tr_" + currentCL).remove();
          });
        } else {
          $('td:first', $(this).parents('tr')).css('background-color','transparent');
          $('#' + currentCL).data('edit','no');
        }
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

      if (filterTxt.notes.length == 0) filterTxt.notes = "None.";

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
          $("#filter_content").remove();
        }         
      }

      newEntry = mkEntry(filterTxt);
            
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
    row += "<tr class=h_row id=tr_ac_new";
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
    row += "<td class=nr><div class=a_NA>NA</div></td>";
    row += "<td class=nr>-</td>";
    row += "<td class=nr><span id=ac_new class=ac_edit_on>New Rule</span></td>";
    row += "<td class=nr>-</td>";
    row += "<td class=nr>-</td>";
    row += "<td class=nr>-</td>";
    row += "<td class=nr>-</td>";
    row += "<td class=nr>-</td>";
    row += "<td class=nr>-</td>";
    row += "<td class=nr>-</td>";
    row += "<td class=nr>-</td>";
    row += "<td class=nr>-</td>";
    row += "<td class=nr>-</td>";
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
      head += "<th class=sub width=100>EXPIRES</th>"; 
      head += "</tr></thead>";
      var rOFF = 0; 

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
        var expires   = theData[i].erase     || 'no';

        var tclass = "c" + status;
        var cv = classifications.class[tclass][0].short;
        var isoff = "ac_edit_on";
        var rc = "ac_row";
        var rid = "ac_" + autoid;
        if (active == "N") isoff = "ac_edit_off", rc = rc + " hide", rOFF++;
        row += "<tr class=\"" + rc + "\" id=tr_" + rid;
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
        row += "<td class=nr><div class=a_" + cv + ">" + cv + "</div></td>";
        row += "<td class=nr>" + autoid + "</td>";
        row += "<td class=nr><span id=" + rid + " class=" + isoff + ">" + comment + "</span></td>";
        row += "<td class=nr>" + sensor + "</td>";
        row += "<td class=nr>" + src_ip + "</td>";
        row += "<td class=nr>" + src_port + "</td>";
        row += "<td class=nr>" + dst_ip + "</td>";
        row += "<td class=nr>" + dst_port + "</td>";
        row += "<td class=nr>" + proto + "</td>";
        row += "<td class=nr>" + signature + "</td>";
        row += "<td class=nr>" + user + "</td>";
        row += "<td class=nr>" + timestamp + "</td>";
        row += "<td class=nr>" + expires + "</td>"; 
        row += "</tr>";
      }
      tbl += "<table id=tlac class=box_table width=100% cellpadding=0 cellspacing=0>";
      tbl += head;
      tbl += row;
      tbl += "</table>";
      var eyecon = 'inactive';
      if (rOFF > 0) eyecon = "<span title=\"show/hide inactive rules\" class=ac_view >inactive</span>";
      $('#ovacstat').html("<b>" + (i - rOFF) + "</b> active <b>" + rOFF + "</b> " + eyecon);
      $('#ovacstat').show();  
      if ($('#tlac')[0]) {
        $('#tlac').remove();
      }
      $('.ac_tbl').append(tbl);

      $("#tlac").tablesorter({
        cancelSelection:false
      });
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
    row += "<td class=ac_row colspan=13><textarea id=txt_" + cl + " rows=12>";
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
    row += "\"expires\": \"" + $(id).data('expires') + "\"\n";
    row += "}";
    row += "</textarea>";
    var dBut = '';
    var isOn = 'disable';
    if ($(id).data('active') == "N") isOn = "enable";
    if (cl != "ac_new") {
      dBut = "<div class=ac_disable>" + isOn + "</div>";
    } else {
      dBut = "<div class=ac_create>create</div>";
    }
    row += "<div class=ac_bees>" + dBut + "</div>";
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

      // Validate IPs
      var OK = chkIP(ruleTxt.src_ip);
      if (!OK) throw 3;     
      var OK = chkIP(ruleTxt.dst_ip);
      if (!OK) throw 3;

      // Validate ports
      var OK = chkPort(ruleTxt.src_port);
      if (!OK) throw 4;
      var OK = chkPort(ruleTxt.dst_port);
      if (!OK) throw 4;

      // Validate protocol
      var re = /^\d{1,3}$|^any$/;
      var OK = re.exec(ruleTxt.proto);
      if (!OK || ruleTxt.proto > 255) throw 5; 

      // Validate sensor
      if (ruleTxt.sensor.length > 255) throw 6;

      // Validate signature
      if (ruleTxt.signature.length > 255) throw 7;

      // Validate expiration
      var re = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$|^\d{1,4}\ (minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)$/;
      var OK = re.exec(ruleTxt.expires);
      if (!OK) throw 8;

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
      
      var eMsg = "<span class=warn>Input Error!</span> ";
   
      switch (err) {
        case 0:
          eMsg += "Please supply a value for each object.";
        break;
        case 1:
          eMsg += "Invalid Comment. Valid characters are: ";
          eMsg += "Aa-Zz, 0-9, dashes and underscores.";
          eMsg += "The word \"New Rule\" is reserved and may not be used.";
        break;
        case 2:
          eMsg += "Invalid status. Possible values are: 1,2,11,12,13,14,15,16 or 17";
        break;
        case 3:
          eMsg += "IP values must be valid IPv4 addresses or \"any\"";
        break;
        case 4:
          eMsg += "Ports values must an integer between 1 and 65535 or \"any\"";
        break;
        case 5:
          eMsg += "Protocol value must be between 0 and 255";
        break;
        case 6:
          eMsg += "Sensor name can not exceed 255 characters";
        break;
        case 7:
          eMsg += "Signature can not exceed 255 characters";
        break;
        case 8:
          eMsg += "Expiry must be of the form \"YYYY-MM-DD HH:MM:SS\" or \"2 hours | 1 day | 6 weeks | 9 months\"";
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

  // Enable/Disable rule
  $(document).on("click", ".ac_disable", function(event) {
    var action = $('.ac_disable').text();
    var oktoM = confirm("Are you sure you want to " + action + " this rule?");
    if (oktoM) {
      var type = 0;
      switch (action) {
        case "disable": type = 3; break;
        case  "enable": type = 2; break;
      }
      if (type == 0) return;
      var toM = type + "-" + currentCL.split("_")[1];
      var urArgs = "type=17&mode=toggle&obj=" + toM;
      $(function(){
        $.get(".inc/callback.php?" + urArgs, function(data){cb20(data)});
      }); 
      function cb20(data){
        eval("theData=" + data);
        mkAutocatBox();
      }
    }
  });

  // Show/hide disabled rules
  $(document).on("click", ".ac_view", function(event) {
    if ($('#ac_new').length == 0 && $('#ac_content').length == 0) { 
      $('.ac_row').each(function() {
        var co = this;
        if ($(co).data('active') == "N") $(co).fadeToggle('slow','linear');
      });
    } 
  });
});
