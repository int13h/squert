$(document).ready(function(){

  mkFilterBox();
  mkSensorBox();
  mkSrchBox();
  mkUrlBox();
  mkCatBox();

  $(document).on("click", ".icon,.box_close,#cmnt", function(event) {
    var caller = $(this).data('box');
    if (caller == "ret") return;
    if (caller == "extresult") {
        $("#extresult").remove();
        $("#tl1").show();
        return;
    }
    if ($('.pickbox').is(":visible")) return;
    var cID = "#" + caller + "_box";
    var isOpen = $('#t_search').data('state');
    // Are we the only one open?
    if (isOpen == 0) {
      $('#t_search').data('state',1);     
      $(".content_active").fadeTo('fast',0.2);
      $(cID).fadeIn();

      switch (caller) {
        case 'ac':
          mkAutocatBox();
        break;
        case 'srch':
          mkSrchBox();
        break; 
        case 'cat':
          mkCatBox();
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

    // If we already exist, just update the event selection count
    if ($('#tlcom')[0]) {
      var toclass = '<b>Note:</b> no';
      if ($(".chk_event:checked").length > 0 || $('.chk_all').prop("checked")) toclass = $('#class_count').text(); 
      $('#ovcstat').html(toclass + " events selected");
      return;
    }

    $('#cat_box_label').after('<img class=cm_tbl_ldr src=\".css/load.gif\">');
    var urArgs = "type=11";

    $(function(){
      $.post(".inc/callback.php?" + urArgs, function(data){cb11(data)});
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
        $.post(".inc/callback.php?" + urArgs, function(data){cb12(data)});
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

  // Refresh categories listing
  $(document).on("click", ".cat_refresh", function(event) {
    $('#tlcom').remove();
    mkCatBox();
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
    var urArgs = "type=13&ts=" + theWhen;

    $(function(){
      $.post(".inc/callback.php?" + urArgs, function(data){cb13(data)});
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
  // Filters and URLs
  //

  // Create entries
  function mkEntry(entry) {
    var user = $("#t_usr").data("c_usr");
    var ftype = $(".hp_type_active").data("val");
    var cls = 'f_row';

    if (!entry) {
      cls = 'h_row';
      var filter = "";
      switch (ftype) {
        case "filter":
          entry = {"alias": "New", "name": "", "notes": "None.", "filter": filter, "user": user, "age": "1970-01-01 00:00:00"};
        break;
        case "url":
          entry = {"alias": "New", "name": "", "notes": "None.", "url": filter, "user": user, "age": "1970-01-01 00:00:00"};
        break;
      }
    }

    var search = "<div class=center>-</div>";
    var re = /^Shell -/;
    var OK = re.exec(entry.name);
    if (!OK && ftype != "url") search = "<div class=tof title=\"Show these events\" data-type=fil data-value=\"" + entry.alias + "\"><img class=il src=.css/search.png></div>";

    encFilter = s2h(entry[ftype]);        
    row = '';
    row += "<tr class=" + cls + " id=\"tr_" + entry.alias + "\" ";
    row += "data-type=\"" + ftype + "\" ";
    row += "data-alias=\"" + entry.alias + "\" ";
    row += "data-name=\"" + entry.name + "\" ";
    row += "data-notes=\"" + entry.notes + "\" ";
    row += "data-filter=\"" + encFilter + "\" ";
    row += "data-global=0>";
    row += "<td class=nr><div id=\"" + entry.alias + "\" class=\"filter_edit\">" + entry.alias + "</div></td>";
    row += "<td class=nr>" + entry.name + "</td>";
    row += "<td class=nr>" + search + "</div></td>";
    row += "<td class=nr>" + entry.notes + "</td>";
    row += "<td class=nr>" + user + "</td>"; 
    row += "<td class=nr>now</td>";
    row += "</tr>";
    return row;
  }

  function mkFilterBox() {
            
    var urArgs = "type=8" + "&mode=query&data=0";
    $(function(){
      $.post(".inc/callback.php?" + urArgs, function(data){cb6(data)}); 
    });

    function cb6(data){
      eval("theData=" + data);

      var active_type = $(".hp_type_active").data('val');

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
        var type   = theData[i].type;
        var alias  = theData[i].alias;
        var name   = theData[i].name;
        var notes  = theData[i].notes;
        var filter = theData[i].filter; 
        var global = theData[i].global;
        var age    = theData[i].age;
        var user   = theData[i].username || "built-in";

        // Exclude search for shells and urls
        var search = "<div class=center>-</div>";
        var re = /^Shell -/;
        var OK = re.exec(name);
        if (!OK && type != "url") search = "<div class=tof title=\"Show these events\" data-type=fil data-value=\"" + alias + "\"><img class=il src=.css/search.png></div>";
  
        if (type != active_type) {   
          row += "<tr class=\"f_row hide\" ";
        } else {
          row += "<tr class=f_row ";
        } 
        row += "id=\"tr_" + alias + "\" ";
        row += "data-type=\"" + type + "\" ";
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
    var rid = '#tr_' + cl;
    var ftype = $(".hp_type_active").data("val");
    var alias = $(rid).data('alias');
    var name = $(rid).data('name');
    var notes = $(rid).data('notes');
    var global = $(rid).data('global');
    var filter = h2s($(rid).data('filter'));
    var row = '';
    row += "<tr id=filter_content>";
    row += "<td class=f_row colspan=6><textarea id=\"txt_" + alias +"\" rows=10>";
    row += "{\n";
    row += "\"alias\": \"" + alias + "\",\n";
    row += "\"name\": \"" + name + "\",\n";
    row += "\"notes\": \"" + notes + "\",\n";
    row += "\"" + ftype + "\": \"" + filter + "\"\n";
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
    
  // Rule expansion (gives access to edit as well)
  $(document).on("click", ".filter_edit", function(event) {
    currentCL = $(this).attr('id');
    if (!$("#filter_content")[0]) {
      openEdit(currentCL);
      $('#' + currentCL).data('edit','yes');
      $('td:first-child', $(this).parents('tr')).css('background-color','#c4c4c4');
      $('td:nth-child(2)', $(this).parents('tr')).css('background-color','#c4c4c4');
    } else {
      if ($('#' + currentCL).data('edit') == 'yes') {
        $("#filter_content").remove();
        if (currentCL == "New") {
          $("#tr_" + currentCL).fadeOut('slow', function() {
            $("#tr_" + currentCL).remove();
          });
        } else {
          $('td:first-child', $(this).parents('tr')).css('background-color','transparent');
          $('td:nth-child(2)', $(this).parents('tr')).css('background-color','transparent');
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
      //rawTxt = rawTxt.replace(/[@|&;*\\`]/g, "");
      rawTxt = rawTxt.replace(/[>]/g, "&gt;");
      rawTxt = rawTxt.replace(/[<]/g, "&lt;");
      filterTxt = $.parseJSON(rawTxt);

      if (filterTxt.notes.length == 0) filterTxt.notes = "None.";

      // Check for empty objects
      var emptyVal = 0;
      for (var i in filterTxt) {
        if (filterTxt.hasOwnProperty(i)) {
          if (filterTxt[i].length == 0) {
            emptyVal++;
          }
        }
      }
      if (emptyVal > 0) throw 0; 
            
      // Sanitize alias
      var re = /^[?a-zA-Z][\w-]*$/;
      var OK = re.exec(filterTxt.alias);
      if (!OK) throw 1;
      if (filterTxt.alias == "New") throw 1;
    
      // If creating a new filter make sure this alias doesn't already exist
      if ($("#tr_" + filterTxt.alias)[0] && $('#tr_New')[0]) throw 1;

      // Make sure we dont match a builtin
      var builtins = ["cc","dip","dpt","ip","sid","sig","sip","spt","scc","dcc","st"];
      if (builtins.indexOf(filterTxt.alias) != -1) throw 1;

      // Continue..
      oldCL = currentCL;
      var ftype = $(".hp_type_active").data("val");
      var fd = s2h(ftype + "||" + filterTxt.alias + "||" + filterTxt.name + "||" + filterTxt.notes + "||" + filterTxt[ftype]);
      var urArgs = "type=8&mode=update&data=" + fd;
      $(function(){
        $.post(".inc/callback.php?" + urArgs, function(data){cb7(data)}); 
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
      } else { // We have created a new one so show it.
        $('#tr_' + oldCL).before(newEntry);
        $('td:first-child', $('#tr_' + oldCL)).css('background-color','transparent');
        $('td:nth-child(2)', $('#tr_' + oldCL)).css('background-color','transparent');
        $('#' + currentCL).data('edit','no');
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
          eMsg += "Filter aliases MUST be unique. Valid characters are: ";
          eMsg += "Aa-Zz, 0-9, - and _ . ";
          eMsg += "The word \"New\" is reserved and may not be used.";
        break;
        default:
          eMsg += "<span class=warn><br>Format error!</span> ";
          eMsg += "Please ensure the format above is valid JSON. ";
          eMsg += "I am looking for an opening curly brace <b>\"{\"</b> followed by <b>\"object\": \"value\"</b> ";
          eMsg += "pairs.<br> Each <b>\"object\": \"value\"</b> pair terminates with a comma <b>\",\"</b> except ";
          eMsg += "the last pair before the closing curly brace <b>\"}\"</b>.";
          eMsg += " Strings must be enclosed within double quotes.";
        break;
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
        $.post(".inc/callback.php?" + urArgs, function(data){cb8(data)});
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

  // Type toggle
  $(document).on('click', '.hp_type', function() {
    var type = $(this).data('val');
    // Do nothing if we are already the active
    if ($(this).hasClass('hp_type_active')) return;
    // Do nothing if edit is open
    if ($('#filter_content')[0]) return;
    // Do nothing if we are creating
    if ($('#tr_New')[0]) return;
    // Do nothing if help is open
    if ($('#tbl_help')[0]) return;
    $('.hp_type').attr('class','hp_type');
    $(this).attr('class', 'hp_type hp_type_active');
    $('.f_row').hide();
    $('.f_row').each(function() {
      var co = this;
      if ($(co).data('type') == type) $(co).fadeIn('slow','linear');
    });
    
  });

  // Help!?
  $(document).on("click", ".filter_help", function(event) {
    if ($('#tbl_help').length == 0) {
      var ftype = $(".hp_type_active").data("val"); 
      switch (ftype) {
        case "filter":
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
        break;
        case "url":
	  tbl = "<table witdh=100% id=tbl_help><tr><td class=fhelp>";
	  tbl += "<div class=filter_parts><u><b>URLs</b></u><br><br>";
	  tbl += "These are used to query another URL using a selected object from this interface";
          tbl += " as its arguments.";
          tbl += " After you have created an entry simply click an object within this interface and select";
          tbl += " the URL (matching the object type) that you wish to use from the menu. The clicked object will replace ${var} and open that location.";
          tbl += "<br><br><b>Example:</b> <i>https://www.example.ca/search?q=${var}</i>";
          tbl += "</div></td></tr></table>";
        break;
      }  

      $('#tl4').before(tbl);

    } else {
      $('#tbl_help').remove();
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
      $.post(".inc/callback.php?" + urArgs, function(data){cb18(data)}); 
    });

    function cb18(data){
      eval("theData=" + data);
      var tbl = '', head = '', row = '';
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
        var expires   = theData[i].erase     || 'none';

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
      dBut += "<div class=ac_disable>" + isOn + "</div>";
      dBut += "<div class=ac_remove>remove</div>";
    } else {
      dBut += "<div class=ac_create>create</div>";
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

      // Validate IPs or CIDRs
      var OK = chkCIDR(ruleTxt.src_ip);
      if (!OK) throw 3;     
      var OK = chkCIDR(ruleTxt.dst_ip);
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
      var re = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$|^\d{1,4}\ (minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)$|^none$/;
      var OK = re.exec(ruleTxt.expires);
      if (!OK) throw 8;

      // Continue..
      oldCL = currentCL;
      var fd = s2h(JSON.stringify(ruleTxt));
      var urArgs = "type=17&mode=update&data=" + fd;

      $(function(){
        $.post(".inc/callback.php?" + urArgs, function(data){cb19(data)}); 
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
          eMsg += "Expiry must be of the form \"YYYY-MM-DD HH:MM:SS\" or \"2 hours | 1 day | 6 weeks | 9 months\" or \"none\"";
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

  // Enable/Disable/Remove rule
  $(document).on("click", ".ac_disable,.ac_remove", function(event) {
    var action = $(this).text();
    var oktoM = confirm("Are you sure you want to " + action + " this rule?");
    if (oktoM) {
      var type = 0;
      switch (action) {
        case "disable": type = 3; break;
        case  "enable": type = 2; break;
        case  "remove": type = 4; break;
      }
      if (type == 0) return;

      var toM = type + "-" + currentCL.split("_")[1];
      var urArgs = "type=17&mode=toggle&obj=" + toM;

      $(function(){
        $.post(".inc/callback.php?" + urArgs, function(data){cb20(data)});
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

  // 
  // Search box
  //

  $(document).on('click','.srchterm', function() {
    var il = $(".srch_txt").val().length;
    var term = $(this).text();
    if (il != 0) {
      // Does this value already exist?
      var ex = $(".srch_txt").val().indexOf(term);
      if (ex == -1) $(".srch_txt").val($(".srch_txt").val() + " AND " + term); 
    } else {
      $(".srch_txt").val(term);
    }
    $('.srch_txt').focus();   
  });

  // If search is in focus, update on enter
  $('.srch_txt').keypress(function(e) {
    if (!e) e=window.event;
    key = e.keyCode ? e.keyCode : e.which;
    if (key == 13) doSrch();
  });

  $(document).on('click','.srch_do', function() {
    if ($('#srch_ldr')[0]) return;
    doSrch();
  });    

  function doSrch() { 
    var items = $('.chk_es:checked').length;

    if (items == 0) {
      $('#srch_stat_msg').html("Please choose a source");
      $('#srch_stat_msg').fadeIn();   
      return;
    }
    if ($(".srch_txt").val().length == 0) {
      $('#srch_stat_msg').html("Please provide a search term");
      $('#srch_stat_msg').fadeIn();
      return;
    }

    $('#srch_stat_msg').hide();

    var searchtype = "es";
    var logtype = "(";
    var i = 0;
    $('.chk_es:checked').each(function() {
      logtype += $(this).data("logtype");
      i++;
      if ((i >= 1) && (i != items)) logtype += " OR "; 
    });
    logtype += ")";
    switch (searchtype) {
      case "es":
        esSearch(logtype);
      break;
      default:
        return;
      break;
    }
  }

  $(document).on('click','.clear_srch', function() {
    $('.srch_txt').val('');
  });

  // Checkboxes
  
  function srchSrcLabel() {
    var n = $('.chk_es:checked').length || 'no';
    switch (n) {
      case 1:
        $('#srchsrc').html('<b>' + n + '</b> source is selected');
      break;
      default: 
        $('#srchsrc').html('<b>' + n + '</b> sources are selected');
      break;
    }  
    $('.srch_txt').focus();
  }

  $(document).on("click", "#ca_es", function(event) {
    var state = ($(this).prop('checked'));
    switch(state) {
      case false:
        $(".chk_es").prop("checked",false);
      break;
      case true:
        $(".chk_es").prop("checked",true);
      break;
    }
    srchSrcLabel();
  });
  
  $(document).on('click','.chk_es,.srch_edit', function() {
    var state = ($(this).prop('checked'));
    if (state == false) $("#ca_es").prop("checked",false);
    srchSrcLabel();
  });

  // Type toggle
  $(document).on('click', '.lu_type', function() {
    var type = $(this).data('val');
    $('.lu_type').attr('class','lu_type');
    $(this).attr('class', 'lu_type lu_type_active');
    if (type == 'url') {
      $('#el_tdc').fadeOut();
      $("#tlsrchbox").hide();
      $("#tlurlbox").show();  
    } else {
      $('#el_tdc').fadeIn();
      $("#tlurlbox").hide();
      $("#tlsrchbox").show();
    }
  });

  function mkSrchBox() {
    if ($('#tlsrchbox')[0]) return;
    $('#srch_stat_msg').hide();
 
    var tbl = '', head = '', row = '', input = ''; 

    head += "<thead><tr>";
    head += "<th class=sub width=20px><input id=ca_es type=checkbox></th>";
    head += "<th class=sub width=200px>SOURCE</th>";
    head += "<th class=sub witdh=100px>COLOUR</th>";
    head += "<th class=sub>DESCRIPTION</th>";
    head += "</tr></thead>";
    
    var srccount = esSources.length;
    for (var i=0; i < srccount; i++) {
      if (esSources[i].state == "off") continue;
      var name = esSources[i].name;
      var type = esSources[i].type;
      var desc = esSources[i].desc;
      var loke = esSources[i].loke;
      var clid = type.replace(/(\s+)/, "");
      
      row += "<tr class=f_row>";
      row += "<td class=sub><input id=cb_" + name + " class=chk_es ";
      row += "type=checkbox data-searchtype=es data-logtype=" + type + "></td>";
      row += "<td class=nr><div class=srch_edit>" + name + "</div></td>";
      row += "<td id=el_" + clid + " class=\"nr sub_filter\" data-type=el data-value=" + clid + "><div class=object style=\"background-color:#FFFFFF;\"></div>FFFFFF</td>";
      row += "<td class=nr>" + desc + "</td>";
      row += "</tr>";
    }
    
   tbl += "<table id=tlsrchbox class=box_table width=100% cellpadding=0 cellspacing=0>";
    tbl += head;
    tbl += row;
    tbl += "</table>";
    $(".srch_tbl").append(tbl);

    $("#tlsrchbox").tablesorter({
      headers: {
        0:{sorter:false},
      },
      cancelSelection:false
    });

    // Fetch our colour mappings
    var urArgs = "type=20";
    $(function(){
      $.post(".inc/callback.php?" + urArgs, function(data){cb23(data)});
    });

    function cb23(data){
      eval("theData=" + data);
      for (var i=0; i<theData.length; i++) {
        var object = theData[i].object;
        var colour = theData[i].colour;
        var html = "<div class=object style=\"background-color:#" + colour + ";\"></div>" + colour;
        $('#el_' + object).html(html);
        $('#el_' + object).data('col', colour);
      }
    }
  } 

  function mkUrlBox () {
    var tbl = '', head = '', row = '', input = ''; 
    head += "<thead><tr>";
    head += "<th class=sub width=100px>ALIAS</th>";
    head += "<th class=sub width=200px>NAME</th>";
    head += "<th class=sub>URL</th>";
    head += "</tr></thead>";

    tbl += "<table id=tlurlbox class=\"box_table hide\" width=100% cellpadding=0 cellspacing=0>";
    tbl += head;
    tbl += row;
    tbl += "</table>";
   
    $(".srch_tbl").append(tbl);
    $("#tlurlbox").tablesorter({
       headers: {
         0:{sorter:false},
       },
       cancelSelection:false
    });
  }

  function esSearch(log) {
    $('#srch_box_label').after('<img id=srch_ldr class=cm_tbl_ldr src=\".css/load.gif\">');
    var logtype = s2h(log);
    var _filter = $(".srch_txt").val().replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    var filter = s2h(_filter);
    var start = $('#el_start').val();
    var end = $('#el_end').val();
    var when = s2h(start + "|" + end);
    var urArgs = "type=18&se=" + when + "&logtype=" + logtype + "&filter=" + filter;

    $(function(){
      $.post(".inc/callback.php?" + urArgs, function(data){cb21(data)})
       .fail(function() {
         $('#srch_ldr').remove();  
         $('#srch_stat_msg').html("The query failed!");
         $('#srch_stat_msg').fadeIn();
       }); 
    });

    function cb21(data){
      eval("d=" + data);
      if (d.dbg) {
        $('#srch_stat_msg').html("Error: " + d.dbg);
        $('#srch_stat_msg').fadeIn();
        $('#srch_ldr').remove();
        return;
      }
 
      var etime = d.took/1000 || 0;
      var records = d.hits.hits.length || 0;
      var hits = d.hits.hits._source || 0;
      var tbl = '', head = '', row = ''; 

      head += "<thead><tr><th class=ext>";
      head += "<div class=box_label>EXTERNAL LOOKUP (" + etime + " seconds " + records + " results)</div>";
      head += "<div title=close class=box_close data-box=extresult><img class=il src=.css/close.png></div>"
      head += "</th></tr></thead>";
      row += "<tr>";

      if (records == 0) {
        row += "<tr class=pcomm><td id=extdata class=\"raw\">The query returned no results.</td></tr>";
      }

      // Figure out time domain
      var colours = d3.scale.linear()
          .domain([0,10])
          .range(["#e9e9e9","#5d5d5d"]);

      //var colour = colours(o);
      for (var i=0; i < records; i++) {
        var p0 = "", p1 = "", p2 = "";
        row += "<tr class=pcomm><td class=\"raw select\">";

        for (key in d.hits.hits[i]._source) {
          if (key == "@timestamp") continue;
          var value = d.hits.hits[i]._source[key];        

          // Decorate the type
          var vclass = "ex_val";
          var datatype = "none";

          switch (key) {
            case "type": 
              vclass = "ex_type";
              var clid = value.replace(/(\s+)/, "");
              var bg = $('#el_' + clid).text();
              // If our background is too dark adjust the foreground accordingly
              var fg = bRw(bg);
              var exstyle = " style=\"background-color:#" + bg + "; color:#" + fg + ";\""; 
              p0 += "<div class=ex_key>" + key + "=</div>";
              p0 += "<div class=\"" + vclass + "\"" + "data-type=\"" + datatype +"\" " + exstyle + ">" + value + "</div>";
            break;
            case "timestamp":
              // Format timestamps if utime 
              var re = /^(\d{10}\.\d{6}|\d{10})$/;
              var OK = re.exec(value);
              if (OK) {
                var tv = Number(d.hits.hits[i]._source[key].split(".")[0] * 1000);
                value = mkStamp(tv,0,0);
              }
              p1 += "<div class=ex_key>" + key + "=</div>";
              p1 += "<div class=\"" + vclass + "\">" + value + "</div>"; 
            break;
            case "src_ip":
            case "dst_ip":
            case "src":
            case "dst":
              datatype = "ip";
              p2 += "<div class=ex_key>" + key + "=</div>";
              p2 += "<div class=\"" + vclass + "\"" + "data-type=\"" + datatype +"\">" + value + "</div>";
            break;
            case "md5":
            case "sha1":
            case "sha256":
              datatype = "hash";
              p2 += "<div class=ex_key>" + key + "=</div>";
              p2 += "<div class=\"" + vclass + "\"" + "data-type=\"" + datatype +"\">" + value + "</div>";
            break;
            default:
              p2 += "<div class=ex_key>" + key + "=</div>";
              p2 += "<div class=\"" + vclass + "\"" + "data-type=\"" + datatype +"\">" + value + "</div>";   
          }
        }
    
        row += p0 + p1 + p2; 
        row += "</td></tr>";
      }

      row += "</tr>";
      tbl += "<tr id=extresult><td id=extdata>";
      tbl += "<table id=tlsrch width=100% class=box_table cellpadding=0 cellspacing=0>";
      tbl += head;
      tbl += row;
      tbl += "</table></td></tr>";

      // Close our box
      $('#srch_stat_msg').hide(); 
      $("#ico05").click();

      // Remove any existing results
      if ($("#extresult")[0]) $("#extresult").remove(); 

      // Make sure we are on the right tab
      if ($(".tab_active").attr('id') == 't_sum') {
        var l = 0, cols = 1;
        // Now see what state we are in
        if ($(".d_row_sub_active")[0]) l++;
        if ($(".d_row_sub_active1")[0]) l++;
        if ($("#gr").text() == "off") l = 3; 

        switch (l) {
          case 0:
            $("#tl1").hide();
            $("#aaa-00").append("<table width=100% id=tl1-a cellpadding=0 cellspacing=0 align=center></table>");
            $("#tl1-a").append(tbl);
          break;
          case 1:
            var cols = $(".d_row_sub_active td.sub").length;
            $(".d_row_sub_active").after(tbl);
          break;
          case 2:
            cols = $(".d_row_sub_active1 td.sub").length;
            $(".d_row_sub_active1").after(tbl);
          break;
          case 3: 
            cols = $(".d_row_sub_active1 td.sub").length;
            $(".d_row_sub_active1").after(tbl);
          break;
        }
      }

      // Set span
      $("#extdata").attr('colspan', cols);
      // Remove loader
      $('#srch_ldr').remove();
    }
  }

});
