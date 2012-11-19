$(document).ready(function(){
    var lastclasscount = 0;

    $('[id^=sort-]').tablesorter();

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

    function h2s (tmp) {
        var arr = tmp.split(' '), str = '', i = 0, arr_len = arr.length, c;
        for (; i < arr_len; i += 1) {
            c = String.fromCharCode( h2d( arr[i] ) );
            str += c;
        }
        return str;
    }

    function getFlag(cc) {

        if (cc != "LO" && cc != null) {
            answer = "<span class=flag><img src=\".flags/" + cc + ".png\"></span>"
        } else {
            answer = ""
        }
        return answer;
    }

    var classifications = {"class":{  
        "c11":[{"short": "C1", "long": "Unauthorized Admin Access"}],
        "c12":[{"short": "C2", "long": "Unauthorized User Access"}],
        "c13":[{"short": "C3", "long": "Attempted Unauthorized Access"}],
        "c14":[{"short": "C4", "long": "Denial of Service Attack"}],
        "c15":[{"short": "C5", "long": "Policy Violation"}],
        "c16":[{"short": "C6", "long": "Reconnaissance"}],
        "c17":[{"short": "C7", "long": "Malware"}],
        "c2":[{"short": "ES", "long": "Escalated Event"}],
        "c1":[{"short": "NA", "long": "No Action Req'd."}],
        "c0":[{"short": "UN", "long": "Unclassified"}]
      }
    };

    var loaderImg = "<img id=loader class=loader src=\".css/load.gif\">";

    function catBar(count) {
        bar =  "<div class=effs><div class=left>&nbsp;</div>";
        bar += "<div class=b_null>F1</div><div class=b_null>F2</div><div class=b_null>F3</div>";
        bar += "<div class=b_null>F4</div><div class=b_null>F5</div><div class=b_null>F6</div>";
        bar += "<div class=b_null>F7</div><div class=b_null>F8</div><div class=b_null>F9</div>";
        bar += "</div>";
        bar += "<div class=event_class>";
        bar += "<div class=class_msg_cont><span class=class_msg></span>&nbsp;</div>";
        bar += "<div class=left>categorize <span class=bold id=class_count>" + count + "</span> event(s):</div>";
        bar += "<div id=b_class-11 class=b_C1 title='Unauthorized Admin Access'>C1</div>";
        bar += "<div id=b_class-12 class=b_C2 title='Unauthorized User Access'>C2</div>";
        bar += "<div id=b_class-13 class=b_C3 title='Attempted Unauthorized Access'>C3</div>";
        bar += "<div id=b_class-14 class=b_C4 title='Denial of Service Attack'>C4</div>";
        bar += "<div id=b_class-15 class=b_C5 title='Policy Violation'>C5</div>";
        bar += "<div id=b_class-16 class=b_C6 title='Reconnaissance'>C6</div>";
        bar += "<div id=b_class-17 class=b_C7 title='Malware'>C7</div>";
        bar += "<div id=b_class-1  class=b_NA title='No Action Req&#x2019;d.'>NA</div>";
        bar += "<div id=b_class-2  class=b_ES title='Escalate Event'>ES</div>";
        bar += "</div>";
        return bar;
    }

    //
    // Row filtering
    //

    function filterRows(caller,type,ec) {

        if (ec !=0) {
            closeRow();
            rowValue = caller.replace(type,"");
            oldValue = $('#sel_class').val();

            if (rowValue == oldValue) {
                $('tr[id^=' + type + ']').attr('class', 'a_row');
                $('tr[id^=sid-]').attr('class', 'd_row');
                $('.d_row').show();
                $('#sel_class').val('-1');
            } else {
                $('#sel_class').val(rowValue);
                $('tr[id^=' + type + ']').attr('class', 'a_row');
                $('#' + caller).attr('class', 'a_row_highlight');
                $('tr[id^=sid-]').hide();
                $('tr[id^=sid-]').attr('class', 'a_row');
                $("[data-class*='" + rowValue + "']").attr('class', 'd_row');
                $("[data-class*='" + rowValue + "']").show();
                $("[data-sid*='" + rowValue + "']").attr('class', 'd_row');
                $("[data-sid*='" + rowValue + "']").show();
            }
        }
    };

    $('tr[id^=cat-]').click(function(){
        ec = $(this).data("c_ec");
        filterRows(this.id,"cat-",ec);
    });

    $('tr[id^=sen-]').click(function(){
        ec = $(this).data("c_ec");
        filterRows(this.id,"sen-",ec);
    });

    //
    // Simple signature show/hide via the search input box
    //

    $('#live_search').click(function(){
        currentVal = $('#sel_search').val();
        if (currentVal == '-1') {
            newClass = 'links_enabled';
            $('#sel_search').val('1');
        } else {
            newClass = 'links';
            $('#sel_search').val('-1');
        }
 
        $('#live_search').attr('class', newClass);
        doSearch();
    });

    $('#clear_search').click(function() {
        if ($('#search').val() != '') {
            $('#search').val('');
            $('tr[id^=sid-]').attr('class','d_row');
            $('tr[id^=sid-]').show();
        }
    });

    // Only live search if live is on
    $('#search').keyup(function(){
        if ($('#sel_search').val()  ==  1) {
            doSearch();
        }
    });

    $.expr[":"].Contains = $.expr.createPseudo(function(arg) {
        return function( elem ) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });

    function doSearch() {
        closeRow();
        $('.d_row').hide();
        searchString = $('#search').val();
        alert(searchString);
        $('tr[id^=sid-]').attr('class', 'a_row');
        $("'tr[id^=sid-]':contains('" + searchString + "')").attr('class', 'd_row');
        $("'tr[id^=sid-]':contains('" + searchString + "')").show();
    }

    //
    // Toggle sections
    //

    // Hide anything carried over after new load
    var flaggedSections = $('#sel_section').val();
    if (flaggedSections != '') {
        if (flaggedSections.match("Brief")) { sectionOff("Brief");}
        if (flaggedSections.match("Sensor")) { sectionOff("Sensor");}
        if (flaggedSections.match("Category")) { sectionOff("Category");}
        if (flaggedSections.match("Signature")) { sectionOff("Signature");}
    }

    // Click section titles to hide
    $('.live').click(function() {
        sectionName = this.id.split("-");
        sectionOff(sectionName[1]);
        var trayContent = $("#b_tray_items").text();
        $('#sel_section').val(trayContent);
        var urArgs = "type=" + 8 + "&sections=" + trayContent;
        // Add current state to session
        $.get(".inc/callback.php?" + urArgs, function(){Null});
    });

    // Click newly created buttons to show again
    $(document).on("click", ".toggle-button", function(){
        sectionName = this.id.split("-");
        sectionOn(sectionName[1]);
        var trayContent = $("#b_tray_items").html().replace(/(<([^>]+)>)/ig,"");
        $('#sel_section').val(trayContent);
        var urArgs = "type=" + 8 + "&sections=" + trayContent;
        // Add current state to session
        $.get(".inc/callback.php?" + urArgs, function(){Null}); 
    });

    function sectionOff(sectionName) {
        $('#table-' + sectionName).hide();
        $('#b_tray_items').append("<span id=b-" +  sectionName + " class=toggle-button>" + sectionName + "</span>");
        $('#tray_empty').hide();    
    }

    function sectionOn(sectionName) {
        $('#table-' + sectionName).show();
        $('#b-' + sectionName).remove();

        if (!$(".toggle-button")[0]) {
            $('#tray_empty').show();
        }
    }

    //
    // Event monitor
    //
 
    var emTimeout = 30000;

    var lastCount = $("#etotal").html();
    var eventCount = lastCount;
    var theWhen = $("#timestamp").val();

    window.setInterval(function(){

        var urArgs = "type=" + 0 + "&ts=" + theWhen;
        $(function(){
            $.get(".inc/callback.php?" + urArgs, function(data){cb(data)});
        });

        function cb(data){
            eval("theData=" + data);
            eventCount = theData[0].count;
        }

        lastCount = Number($("#etotal").html());

        if ( lastCount < eventCount ) {
            eventCount = eventCount - lastCount;
            $("#b_event").html("<b>Events:</b> " + eventCount + " new");
        }

        lastCount = eventCount;
    }, emTimeout);

    //   
    // Bottom ribbon controls
    //

    $("#b_update").click(function() {
        var ctab = $('#sel_tab').val();
        var urArgs = "type=" + 5 + "&tab=" + ctab;
        $.get(".inc/callback.php?" + urArgs, function(){location.reload()});
    });


    $("#b_top").click(function() {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
    });
        
    //
    // Tab manipulations
    //

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

    // Logout
    $("#logout").click(function(event) {
         $.get(".inc/session.php?id=0", function(){location.reload()});
    });
    
    //
    // Rows
    //

    function closeSigRow() {
        $("#active_sview").remove();
        $("#" + this.id).attr('class','s_row');
        $(".s_row").css('opacity','1');
        $(".s_row_active").find('td').css('color', 'gray');
        $(".s_row_active").find('td').css('background', 'transparent');
        ltCol = $(".s_row_active").find('td.lt').html();
        $(".s_row_active").find('td.lt').css('background', ltCol);
        $(".s_row_active").attr('class','s_row');
    }

    function closeRow() {
        $("#active_eview").remove();
        $("#" + this.id).attr('class','d_row');
        $(".d_row").css('opacity','1');
        $(".d_row_active").find('td').css('color', 'gray');
        $(".d_row_active").find('td').css('background', 'transparent');
        ltCol = $(".d_row_active").find('td.lt').html();
        $(".d_row_active").find('td.lt').css('background', ltCol);
        $(".d_row_active").attr('class','d_row');
        // update class_count
        $("#class_count").html(lastclasscount);
    }

    function closeSubRow() {
        $("#eview_sub1").remove();
        $("#" + this.id).attr('class','d_row_sub');
        $(".d_row_sub").css('opacity','1');
        $(".d_row_sub_active").find('td').css('color', 'gray');
        $(".d_row_sub_active").find('td').css('border-top', 'none');
        $(".d_row_sub_active").find('td').css('background', 'transparent');
        $(".d_row_sub_active").attr('class','d_row_sub');
        // update class_count
        $("#class_count").html(lastclasscount);
        curclasscount = lastclasscount;
    }

    function closeSubRow1() {
        $("#eview_sub2").remove();
        $("#" + this.id).attr('class','d_row_sub1');
        if (!$("#eview_sub3")[0]) {
            $(".d_row_sub1").css('opacity','1');
            $(".d_row_sub1_active").find('td').css('border-top', 'none');
            $(".d_row_sub1_active").attr('class','d_row_sub1');
        }
    }

    function closeSubRow2() {

        $("#eview_sub3").remove();
        $("#" + this.id).attr('class','d_row_sub1');

        if (!$("#eview_sub2")[0]) {
            $(".d_row_sub1").css('opacity','1');
            $(".d_row_sub1_active").find('td').css('border-top', 'none');
            $(".d_row_sub1_active").attr('class','d_row_sub1');
        }
    }

    // Reset if headings are clicked
    $("th.sort").click(function() {
        closeRow();
    });
    
    // Close open views
    $(document).on("click", "#sig_close", function(event) {
        closeSigRow();
    });

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

    // Close open packet data
    $(document).on("click", "#ev_close_sub2", function(event) {
        closeSubRow2();
    })

    //
    //  Level 0
    //

    $(".s_row").click(function(event) {
    
        // are we active?
        curClass = $(this).attr('class');
        var curID = this;

        rowType = this.id.substr(0,3);
 
        switch (rowType) {

        case "ccc":
            if (!$(".s_row_active")[0]) {
                rowValue = this.id.replace("ccc-","");
                // Fade other results and show this
                $(curID).attr('class','s_row_active');
                $(curID).find('td').css('background', '#BBCC99');
                $(curID).find('td').css('color', '#000000');
                eventList("6-" + this.id);
                $(".s_row").fadeTo('0','0.2');
            }
        break;

        case "box":
            alert("bye");
        break;
        }
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
 
            // This leaves us with sid-gid
            rowValue = curID.replace("sid-","");
     
            // Lookup rule
            urArgs = "type=" + 1 + "&sid=" + rowValue;

            $(function(){
                $.get(".inc/callback.php?" + urArgs, function(data){cb(data)});
            });

            $(".d_row_active").attr('class', 'd_row');
            $("#active_eview").attr('class','d_row');
            
            // This is now the active row
            $("#" + curID).attr('class','d_row_active');

            // Set the class count (counted again after load)
            curclasscount = $('.d_row_active').data('event_count');

            function cb(data){
                eval("sigData=" + data);
                sigtxt = sigData.ruletxt;
                sigfile = sigData.rulefile;
                sigline = sigData.ruleline;

                var tbl = '';
                tbl += "<tr class=eview id=active_eview><td colspan=9><div id=eview class=eview>";
                tbl += "<div id=ev_close class=close><div class=b_close title='Close'>X</div></div>";
                tbl += "<div class=sigtxt>" + sigtxt + " <br><br>";
                tbl += "<span class=small>";
                tbl += "file: <span class=boldtab>" + sigfile + ":" + sigline + "</span>";
                tbl += "first seen: <span class=boldtab>" + "2012-11-11 01:15:21" + "</span>";
                tbl += "involved: <span class=boldtab>" + "2 src / 10 dst" + "</span>";
                tbl += "total events: <span class=boldtab>" + "9001" + "</span>";
                tbl += "views: <span class=boldtab>" + "15" + "</span>";
                tbl += "probability: <span class=boldtab>" + "1.633%" + "</span></span></div>";
                tbl += catBar(curclasscount);
                tbl += "</td></tr>";

                $("#" + curID).find('td').css('background', '#CFE3A6');
                $("#" + curID).find('td').css('color', '#000000');
                $("#" + curID).after(tbl);
                eventList("2-" + rowValue);
                $("#eview").show();
                $(".d_row").fadeTo('0','0.2');
            }
        }
    });
 
    //
    //  Level 2
    //

    $(document).on("click", ".sub_active", function() {
        if (!$(".d_row_sub_active")[0]) {
            baseID = $(this).parent().attr('id');
            columnType = this.id[2];

            switch (columnType) {
                case "l": adqp = s2h("AND event.status = 0"); break;
                case "r": adqp = s2h("empty"); break;
            }

            rowcall = baseID.split("-");
            callerID = rowcall[0];
            $("#" + callerID).attr('class','d_row_sub_active');
            $("#" + callerID).find('td').css('border-top', '1pt solid #c9c9c9');
            $("#l2" + rowcall[0]).append(loaderImg);
            eventList("3-" + baseID + "-" + adqp);
        }  
    });

    //
    //  Level 3
    //

    $(document).on("click", ".b_pl", function() {
 
        //if (!$(".d_row_sub1_active")[0]) {
        if (!$("#eview_sub2")[0]) {
            baseID = $(this).data('eidl');
            rowcall = baseID.split("-");
            callerID = rowcall[0];
            $("#" + callerID).attr('class','d_row_sub1_active');
            $("#" + callerID).find('td').css('border-top', '1pt solid #c9c9c9');
            $(this).parent().append(loaderImg);
            eventList("4-" + baseID);
        }
    });

    //
    // This creates the views for each level
    //

    function eventList (type) {
        var parts = type.split("-");

        switch (parts[0]) {

        // Level 0 view - Grouped by Signature

        case "6":

          urArgs = "type=" + parts[0] + "&object=" + type + "&ts=" + theWhen;

          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb1(data)});
          });

          function cb1(data){
              eval("theData=" + data);
              tbl = '';
              head = '';
              row = '';
              head += "<thead><tr><th class=sub>Signature</th>";
              head += "<th class=sub width=80>ID</th>";
              head += "<th class=sub width=60>Proto</th>";
              head += "<th class=sub>Last</th>";
              head += "<th class=sub width=1></th>";
              head += "<th class=sub width=25>Src</th>";
              head += "<th class=sub width=25>Dst</th>";
              head += "<th class=sub width=80>Events</th>";
              head += "<th class=sub width=70>% of Total</th>";
              head += "</tr></thead>";
             
              for (var i=0; i<theData.length; i++) {
                  rid = "r" + i + "-" + parts[1];
                  row += "<tr class=d_row id=sid-" + theData[i].f3 + "-" + i + ">";
                  row += "<td class=row>" + theData[i].f2 + "</td>";
                  row += "<td class=row>" + theData[i].f3 + "</td>";
                  row += "<td class=row>" + theData[i].f8 + "</td>";

                  timeParts = theData[i].f5.split(" ");
                  timeStamp = timeParts[1];

                  row += "<td class=row>" + timeStamp + "</td>";
                  row += "<td class=row>1</td>";
                  row += "<td class=row>" + theData[i].f6 + "</td>";
                  row += "<td class=row>" + theData[i].f7 + "</td>";
                  row += "<td class=row><b>" + theData[i].f1 + "</b></td>";
                  row += "<td class=row><b>0</b></td>";
                  row += "</td></tr>";
              }

              tbl += "<tr class=sview id=active_sview><td colspan=6>";
              tbl += "<div id=sig_close class=close_sig><div class=b_close title='Close'>X</div></div>";
              tbl += "<table id=tl1 width=100% class=sortable cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></div></tr>";
              $('#' + parts[1] + '-' + parts[2]).after(tbl);
              $("#tl1").tablesorter({ headers: { 4: {sorter:"false"} } });
          }
          break;

        // Level 1 view - Grouped by signature, source, destination

        case "2":
          urArgs = "type=" + parts[0] + "&object=" + parts[1] + "&ts=" + theWhen;
          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb1(data)});
          });

          function cb1(data){
              eval("theData=" + data);
              tbl = '';
              head = '';
              row = '';
              head += "<thead><tr><th class=sub width=45>New</th>";
              head += "<th class=sub width=75>Total</th>";
              head += "<th class=sub width=110>Last Event</th>";
              head += "<th class=sub width=110>Source IP</th>";
              head += "<th class=sub width=145>Country</th>";
              head += "<th class=sub width=110>Destination IP</th>";
              head += "<th class=sub width=145>Country</th>";
              head += "</tr></thead>";
              curclasscount = 0;

              for (var i=0; i<theData.length; i++) {

                  // How many events are not categorized?
                  rt = theData[i].c_status.split(",");
                  var unclass = 0;                  
                  $.each(rt, function(a,b) {
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

                  curclasscount += parseInt(unclass);
                  rid = "r" + i + "-" + parts[1] + "-" + theData[i].src_ip + "-" + theData[i].dst_ip;
                  row += "<tr class=d_row_sub id=r" + i + " data-filter=\"" + rid + "\">";
                  row += "<td class=" + isActive + " id=l2l" + i + "><div class=" + rtClass + ">" + unclass + "</div></td>";
                  row += "<td class=sub_active id=l2r" + i + "><div class=b_ec_total>" + theData[i].count + "</div></td>";
                  row += "<td class=sub>" + theData[i].maxTime + "</td>";
                  row += "<td class=sub_active>" + theData[i].src_ip + "</td>";
                  if (theData[i].src_cc == "RFC1918") { sclass = "sub_light"; } else { sclass = "sub_active"; }
                  sflag = getFlag(theData[i].srcc)
                  row += "<td class=" + sclass + ">" + sflag + theData[i].src_cc + "</td>";
                  row += "<td class=sub_active>" + theData[i].dst_ip + "</td>";
                  if (theData[i].dst_cc == "RFC1918") { sclass = "sub_light"; } else { sclass = "sub_active"; }
                  dflag = getFlag(theData[i].dstc)
                  row += "<td class=" + sclass + ">" + dflag + theData[i].dst_cc + "</td>";
                  row += "</tr>";
              }

              // update class_count
              $("#class_count").html(curclasscount);            
              lastclasscount = $("#class_count").html();

              tbl += "<div class=eview_sub id=eview_sub style='width: 100%;'><table id=tl2 width=100% class=tablesorter cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></div>";
              $("#eview").after(tbl);
              $("#tl2").tablesorter({ headers: { 2: {sorter:"ipAddress"}, 4: {sorter:"ipAddress"} } });
              $("#loader").remove();
          }
          break;

        // Level 2 view - No grouping, individual events

        case "3":
          rowLoke = parts[1];
          filter = $('#' + parts[1]).data('filter');

          urArgs = "type=" + parts[0] + "&object=" + filter + "&ts=" + theWhen + "&adqp=" + parts[2];
          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb2(data)});
          });

          function cb2(data){
              eval("theData=" + data);

              tbl = '';
              head = '';
              row = '';
              head += "<thead><tr>";
              head += "<th class=sub1 width=10>ST</th>";
              head += "<th class=sub1 width=140>Timestamp</th>";
              head += "<th class=sub1 width=100>EventID</th>";
              head += "<th class=sub1 width=100>Source</th>";
              head += "<th class=sub1 width=40>Port</th>";
              head += "<th class=sub1 width=100>Destination</th>";
              head += "<th class=sub1 width=40>Port</th>";
              head += "<th class=sub1 width=180>Actions</th>";
              head += "</tr></thead>";
              
              // update class_count
              $("#class_count").html(theData.length);

              for (var i=0; i<theData.length; i++) {

                  rid = "s" + i + "-" + theData[i].sid + "-" + theData[i].cid;
                  eid = theData[i].sid + "-" + theData[i].cid;
                  row += "<tr class=d_row_sub1 id=s" + i + " data-filter=\"" + eid + "\">";
                  tclass = "c" + theData[i].status;
                  cv = classifications.class[tclass][0].short;
                  txdata = "s" + i + "-" + theData[i].cid + "-" + s2h(theData[i].sid + "|" + theData[i].timestamp + "|" + theData[i].src_ip + "|" + theData[i].src_port + "|" + theData[i].dst_ip + "|" + theData[i].dst_port);
                  
                  row += "<td class=sub><div id=classcat data-catid=" + eid + " data-bclass=b_" + cv + " class=b_" + cv + ">" + cv + "</div></td>";
                  row += "<td class=sub>" + theData[i].timestamp + "</td>";
                  row += "<td class=sub>" + theData[i].sid + "." + theData[i].cid + "</td>";
                  row += "<td class=sub_active>" + theData[i].src_ip + "</td>";
                  row += "<td class=sub_active>" + theData[i].src_port + "</td>";
                  row += "<td class=sub_active>" + theData[i].dst_ip + "</td>";
                  row += "<td class=sub_active>" + theData[i].dst_port + "</td>";
                  row += "<td class=sub>";
                  //row += "<div class=b_notes title='Add Notes'>N</div>";
                  //row += "<div class=b_tag title='Add Tag'>T</div>";
                  row += "<div class=b_pl data-eidl=s" + i + " title='View Payload'>P</div>";
                  row += "<div class=b_tx data-tx=" + txdata + " title='Generate Transcript'>T</div>";
                  row += "<div class=b_asset title='Asset Info'>A</div>";
                  row += "</td></tr>";
              }
              tbl += "<tr class=eview_sub1 id=eview_sub1><td colspan=7><div id=ev_close_sub class=close_sub><div class=b_close title='Close'>X</div></div>";
              tbl += "<div class=notes></div>";
              tbl += "<table id=tl3 class=tablesorter align=center width=100% cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></td></tr>";
              $("#" + rowLoke).after(tbl);
              $(".d_row_sub").fadeTo('0','0.2');
              $("#tl3").tablesorter({ headers: { 3: {sorter:"ipAddress"}, 5: {sorter:"ipAddress"}, 7: {sorter:"false"} } });
              $("#loader").remove();
          }
          break;

        // Level 3 view - Packet Data

        case "4":
          var rowLoke = parts[1];
          var filter = $('#' + parts[1]).data('filter');

          urArgs = "type=" + parts[0] + "&object=" + filter + "&ts=" + theWhen;

          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb3(data)});
          });

          function cb3(data){
              eval("theData=" + data);

              tbl = '';
              head = '';
              row = '';
              head += "<table align=center width=100% cellpadding=0 cellspacing=0>";
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
              row += "<td class=sub>" + theData[0].ip_ver + "</td>";
              row += "<td class=sub>" + theData[0].ip_hlen + "</td>";
              row += "<td class=sub>" + theData[0].ip_tos + "</td>";
              row += "<td class=sub>" + theData[0].ip_len + "</td>";
              row += "<td class=sub>" + theData[0].ip_id + "</td>";
              row += "<td class=sub>" + theData[0].ip_flags + "</td>";
              row += "<td class=sub>" + theData[0].ip_off + "</td>";
              row += "<td class=sub>" + theData[0].ip_ttl + "</td>";
              row += "<td class=sub>" + theData[0].ip_csum + "</td>";
              row += "<td class=sub>" + theData[0].ip_proto + "</td>";
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
                row += "<td class=sub>" + theData[1].icmp_type + "</td>";
                row += "<td class=sub>" + theData[1].icmp_code + "</td>";
                row += "<td class=sub>" + theData[1].icmp_csum + "</td>";
                row += "<td class=sub>" + theData[1].icmp_id + "</td>";
                row += "<td class=sub>" + theData[1].icmp_seq + "</td>";
                row += "</td></tr></table>";
                break;
   
              case "6":
                // TCP flags
                binFlags = Number(theData[1].tcp_flags).toString(2);
                binPad = 8 - binFlags.length;
                tcpFlags = "00000000".substring(0,binPad) + binFlags;
                
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
                row += "<td class=sub>" + tcpFlags[0] + "</td>";
                row += "<td class=sub>" + tcpFlags[1] + "</td>";
                row += "<td class=sub>" + tcpFlags[2] + "</td>";
                row += "<td class=sub>" + tcpFlags[3] + "</td>";
                row += "<td class=sub>" + tcpFlags[4] + "</td>";
                row += "<td class=sub>" + tcpFlags[5] + "</td>";
                row += "<td class=sub>" + tcpFlags[6] + "</td>";
                row += "<td class=sub>" + tcpFlags[7] + "</td>";
                row += "<td class=sub>" + theData[1].tcp_seq + "</td>";
                row += "<td class=sub>" + theData[1].tcp_ack + "</td>";
                row += "<td class=sub>" + theData[1].tcp_off + "</td>";
                row += "<td class=sub>" + theData[1].tcp_res + "</td>";
                row += "<td class=sub>" + theData[1].tcp_win + "</td>";
                row += "<td class=sub>" + theData[1].tcp_urp + "</td>";
                row += "<td class=sub>" + theData[1].tcp_csum + "</td>";
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
                row += "<td class=sub>" + theData[1].udp_len + "</td>";
                row += "<td class=sub>" + theData[1].udp_csum + "</td>";
                row += "</td></tr></table>";               
                break;

              }
                   
              // Data
              if (!theData[2]) {
                  p_hex   = "No Data Sent.";
                  p_ascii = "No Data Sent.";
              } else {
                  p_pl = theData[2].data_payload;
                  p_length = theData[2].data_payload.length;
                  p_hex = '';
                  p_ascii = '';
                  b0 = 0;

                  for(var i=0; i < p_length; i+=2) {
                      b0++;
                      t_hex = p_pl.substr(i,2);
                      t_int = parseInt(t_hex,16);

                      if ((t_int < 32) || (t_int > 126)) {
                          p_hex   += t_hex + " ";
                          p_ascii += ".";
                      } else if (t_int == 60) {
                          p_hex += t_hex + " ";
                          p_ascii += "&lt;";
                      } else if (t_int == 62) {
                          p_hex += t_hex + " ";
                          p_ascii += "&gt;";
                      } else {
                          p_hex += t_hex + " ";
                          p_ascii += String.fromCharCode(parseInt(t_hex, 16));
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
              row += "<td class=sub><samp>" + p_hex + "</samp></td>";
              row += "<td class=sub><samp>" + p_ascii + "<samp></td>";
              row += "</td></tr></table>";
                    
              tbl += "<tr class=eview_sub2 id=eview_sub2><td class=sub2 colspan=8><div id=ev_close_sub1 class=close_sub1><div class=b_close title='Close'>X</div></div>";
              tbl += "<div class=notes_sub2 id=notes></div>";
              tbl += head;
              tbl += row;
              tbl += "</td></tr>";
              $("#" + rowLoke).after(tbl);

              // Turn off fade effect for large results
              rC = $(".d_row_sub1").length;
              if ( rC <= 399 ) {
                  $(".d_row_sub1").fadeTo('fast','0.2');
              }
              $("#loader").remove();
          }
          break;
        }
    } 

    //
    // Request for transcript
    //

    $(document).on("click", ".b_tx", function(event) {
        if (!$(".eview_sub3")[0]) {
            $(this).after(loaderImg);
            composite = $(this).data('tx').split("-");
            rowLoke = composite[0];
            $("#" + rowLoke).attr('class','d_row_sub1_active');
            $("#" + rowLoke).find('td').css('border-top', '1pt solid #c9c9c9');

            cid = composite[1];
            txdata = composite[2];
         
            // See if a transcript is available
            urArgs = "type=" + 7 + "&txdata=" + txdata;

            $(function(){
                $.get(".inc/callback.php?" + urArgs, function(data){cb4(data)});
            });

            function cb4(data){
                eval("txRaw=" + data);
                txCMD    = txRaw.cmd;
                txResult = txRaw.tx;

                var row = '',tbl = '';
                row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
                row += "<tr>";
                row += "<td class=txtext>";
                row += txResult;
                row += "</td></tr></table>";


                tbl += "<tr class=eview_sub3 id=eview_sub3><td class=sub2 colspan=8><div id=ev_close_sub2 class=close_sub1><div class=b_close title='Close'>X</div></div>";
                tbl += "<div class=txtext_head><b><u>Transcript for event #" + cid + "</b></u></div>";
                tbl += row;
                tbl += "</td></tr>";
                $("#" + rowLoke).after(tbl);

                // Turn off fade effect for large results
                rC = $(".d_row_sub1").length;
                if ( rC <= 399 ) {
                    $(".d_row_sub1").fadeTo('fast','0.2');
                }

                $("#loader").remove();
            }
        }
    });

    //
    // Event classification
    //

    $(document).keypress(function(event){
        //event.preventDefault();
        //event.stopPropagation();
        switch (event.keyCode) {
            case 112: $('#b_class-11').click(); break;
            case 113: $('#b_class-12').click(); break;
            case 114: $('#b_class-13').click(); break;
            case 115: $('#b_class-14').click(); break;
            case 116: $('#b_class-15').click(); break;
            case 117: $('#b_class-16').click(); break;
            case 118: $('#b_class-17').click(); break;
            case 119: $('#b_class-1').click(); break;
            case 120: $('#b_class-2').click(); break;
        }
    });

    // individual selects
    $(document).on("click", "#classcat", function(event) {

        baseClass = $(this).data("bclass");
        baseTxt = $(this).data("bclass").split("_");
        curClass = $(this).attr("class");
        
        if ( curClass == baseClass) {
            $(this).html("");
            $(this).attr("class", "b_SE");
            $(this).html("&rarr;");            
        } else {
            $(this).attr("class", baseClass);
            $(this).html(baseTxt[1]);
        }

        // update class_count
        $("#class_count").html($(".b_SE").length);

    });

    $(document).on("click", "[id*=\"b_class-\"]", function() {
            eClass(this);
        
    });

    function eClass(caller) {
        curclasscount = $("#class_count").text();
        status_number = $(caller).data("sno");
        selClass = $(caller).attr("class");
        selTxt = selClass.split("_");
        
  
        if ($(".d_row_sub1")[0]) {
            activeParent = $(".d_row_sub_active").attr("id").split("r");
            thisclasscount = $("#l2l" + activeParent[1]).find(".b_ec_hot").text();
        }

        // singles
        if ($(".b_SE")[0]) {
            selclasscount = $(".b_SE").length;
            $(".b_SE").html(selTxt[1]);
            $(".b_SE").data("bclass", selClass);
            $(".b_SE").attr("class", selClass);

            newclasscount = thisclasscount - selclasscount;
            $("#l2l" + activeParent[1]).find(".b_ec_hot").html(newclasscount);
            lastclasscount = lastclasscount - curclasscount; 

            if ( newclasscount == 0 ) {
                 //$("#l2l" + activeParent[1]).find(".b_ec_hot").html("0");
                 $("#l2l" + activeParent[1]).find(".b_ec_hot").attr("class","b_ec_cold");
                 $("#l2l" + activeParent[1]).attr("class","sub");
            }
           
            catCount = $("#class_count").text();
            $("#class_count").html(0);
            curclasscount = 0;
            categorizeEvents(catCount);
        }

        // bulk
        if (curclasscount > 0) {
            $('[id*="classcat"]').html(selTxt[1]);
            $('[id*="classcat"]').data("bclass", selClass);
            $('[id*="classcat"]').attr("class", selClass);

            if (!$(".d_row_sub1")[0]) {
                $('[class="b_ec_hot"]').html(0);
                $('[class="b_ec_hot"]').attr("class","b_ec_cold");
                $('[class="b_ec_cold"]').parent().attr("class","sub");
            }

            if ($(".d_row_sub1")[0]) {
                $("#l2l" + activeParent[1]).find(".b_ec_hot").html("0");
                $("#l2l" + activeParent[1]).find(".b_ec_hot").attr("class","b_ec_cold");
                $("#l2l" + activeParent[1]).attr("class","sub");

                lastclasscount = lastclasscount - curclasscount;
            }

            catCount = $("#class_count").text();
            $("#class_count").html(0);
            curclasscount = 0;
            categorizeEvents(catCount);
        }
    }

    function categorizeEvents(count) {
        ess = '';
        if ( count > 1 ) {
            ess = 's';
        }
        $("span.class_msg").text(count + " event" + ess + " successfully categorized");
        $("span.class_msg").fadeIn('slow', function() {
            setTimeout(function(){
                $(".class_msg").fadeOut('slow');
            }, 2000);
        });
    }

});

