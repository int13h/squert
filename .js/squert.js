$(document).ready(function(){

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
        "c1":[{"short": "NA", "long": "Expired Event"}],
        "c0":[{"short": "UN", "long": "Unclassified"}]
      }
    };

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

    // Case insensitive contains
    jQuery.expr[':'].Contains = function(a,i,m){
        return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase())>=0;
    };

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

    $('#search').keyup(function(){
        if ($('#sel_search').val()  == 1) {
            doSearch();
        }
    });

    $('#clear_search').click(function() {
        if ($('#search').val() != '') {
            $('#search').val('');
            $('tr[id^=sid-]').attr('class','d_row');
            $('tr[id^=sid-]').show();
        }
    });

    function doSearch() {
        closeRow();
        $('.d_row').hide();
        searchString = $('#search').val();
        $('tr[id^=sid-]').attr('class', 'a_row');
        $("'tr[id^=sid-]':Contains('" + searchString + "')").attr('class', 'd_row');
        $("'tr[id^=sid-]':Contains('" + searchString + "')").show();
    }

    //
    // Toggle sections
    //

    // Brief Sensor Category Signature

    sectionOff('Brief');
    sectionOff('Category');
    sectionOff('Sensor');

    $('.live').click(function() {
        sectionName = this.id.split("-");
        sectionOff(sectionName[1]);
    });

    $(".toggle-button").live("click", function(){
        sectionName = this.id.split("-");
        sectionOn(sectionName[1]);
    });

    function sectionOff(sectionName) {
        $('#table-' + sectionName).hide();
        $('#b_tray').append("<span id=b-" +  sectionName + " class=toggle-button>" + sectionName + "</span>");
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
        
    }

    function closeSubRow() {
        $("#eview_sub1").remove();
        $("#" + this.id).attr('class','d_row_sub');
        $(".d_row_sub").css('opacity','1');
        $(".d_row_sub_active").find('td.sub').css('color', 'gray');
        $(".d_row_sub_active").find('td').css('border-top', 'none');
        $(".d_row_sub_active").find('td').css('background', 'transparent');
        $(".d_row_sub_active").attr('class','d_row_sub');
    }

    function closeSubRow1() {
        $("#eview_sub2").remove();
        $("#" + this.id).attr('class','d_row_sub1');
        $(".d_row_sub1").css('opacity','1');
        $(".d_row_sub1_active").find('td.sub').css('color', 'gray');
        $(".d_row_sub1_active").find('td').css('border-top', 'none');
        $(".d_row_sub1_active").find('td.sub').css('background', 'transparent');
        $(".d_row_sub1_active").attr('class','d_row_sub1');
    }

    // Reset if headings are clicked
    $("th.sort").click(function() {
        closeRow();
    });
    
    // Close open views
    $("#sig_close").live("click", function(event) {
        closeSigRow();
    });

    $("#ev_close").live("click", function(event) {
        closeRow();
    });

    // Close open sub views
    $("#ev_close_sub").live("click", function(event) {
        closeSubRow();
    });

    // Close open packet data
    $("#ev_close_sub1").live("click", function(event) {
        closeSubRow1();
    });

    //
    // Signature event view
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
    // Main event view
    //

    $(".d_row").live("click", function(event) {  

        // are we active?
        curClass = $(this).attr('class');
        var curID = this;

        // What type of row are we?
        rowType = this.id.substr(0,3);

        if (!$(".d_row_active")[0] && rowType == 'sid') {          

            // This leaves us with sid-gid
            rowValue = this.id.replace("sid-","");

            // Lookup rule
            urArgs = "type=" + 1 + "&sid=" + rowValue;

            $(function(){
                $.get(".inc/callback.php?" + urArgs, function(data){cb(data)});
            });

            $(".d_row_active").attr('class', 'd_row');
            $("#active_eview").attr('class','d_row');

            function cb(data){
                eval("sigData=" + data);
                sigtxt = sigData.ruletxt;
                sigfile = sigData.rulefile;
                sigline = sigData.ruleline; 

                signature = "<div id=ev_close class=close><div class=b_close title='Close'>X</div></div><div class=sigtxt>" + sigtxt + " <br><br><b>File:</b> " + sigfile + " <b>Line:</b> " + sigline + "</div>";
                var tbl = '';
                tbl += "<tr class=eview id=active_eview><td colspan=9><div id=eview class=eview>";
                tbl += signature;
                tbl += "</div></td></div></tr>";

                // Fade other results and show this
                $(curID).attr('class','d_row_active');
                $(curID).find('td').css('background', '#CFE3A6');
                $(curID).find('td').css('color', '#000000');
                $(curID).after(tbl);
                eventList("2-" + rowValue);
                $("#eview").show();
                $(".d_row").fadeTo('0','0.2');
            }
        }
    });
 
    $(".d_row_sub").live("click", function() {
        if (!$(".d_row_sub_active")[0]) {        
            rowcall = this.id.split("-");
            callerID = rowcall[0];
            $("#" + callerID).attr('class','d_row_sub_active');
            $("#" + callerID).find('td').css('border-top', '1pt solid #c9c9c9');
            eventList("3-" + this.id);
        }
    });

    $(".d_row_sub1").live("click", function() {
        if (!$(".d_row_sub1_active")[0]) {
            rowcall = this.id.split("-");
            callerID = rowcall[0];
            $("#" + callerID).attr('class','d_row_sub1_active');
            $("#" + callerID).find('td').css('border-top', '1pt solid #c9c9c9');
            eventList("4-" + this.id);
        }
    });

    //
    // Sub event views
    //

    function eventList (type) {
        var parts = type.split("-");

        switch (parts[0]) {

        // Events level 1 - Grouped by Signature

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
              head += "<th class=sub>Last Event</th>";
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
              tbl += "<table id=events width=100% class=sortable cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></div></tr>";
              $('#' + parts[1] + '-' + parts[2]).after(tbl);
          }
          break;

        // Events level 2 - Grouped by signature, source, destination
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
              head += "<thead><tr><th class=sub width=50>Count</th>";
              head += "<th class=sub width=140>Last Event</th>";
              head += "<th class=sub width=100>Source IP</th>";
              head += "<th class=sub width=170>Country</th>";
              head += "<th class=sub width=100>Destination IP</th>";
              head += "<th class=sub width=170>Country</th>";
              head += "</tr></thead>";

              for (var i=0; i<theData.length; i++) {

                  rid = "r" + i + "-" + parts[1] + "-" + theData[i].src_ip + "-" + theData[i].dst_ip;
                  row += "<tr class=d_row_sub id=r" + i + " data-filter=\"" + rid + "\"><td class=sub>" + theData[i].count + "</td>";
                  row += "<td class=sub>" + theData[i].maxTime + "</td>";
                  row += "<td class=sub>" + theData[i].src_ip + "</td>";
                  if (theData[i].src_cc == "RFC1918") { sclass = "sub_light"; } else { sclass = "sub"; }
                  sflag = getFlag(theData[i].srcc)
                  row += "<td class=" + sclass + ">" + sflag + theData[i].src_cc + "</td>";
                  row += "<td class=sub>" + theData[i].dst_ip + "</td>";
                  if (theData[i].dst_cc == "RFC1918") { sclass = "sub_light"; } else { sclass = "sub"; }
                  dflag = getFlag(theData[i].dstc)
                  row += "<td class=" + sclass + ">" + dflag + theData[i].dst_cc + "</td>";
                  row += "</tr>";
              }
              tbl += "<div class=eview_sub id=eview_sub><table id=events width=100% class=sortable cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></div>";
              $("#eview").after(tbl);
          }
          break;

        // Events level 3 - No grouping, individual events
        case "3":
          var rowLoke = parts[1];
          var filter = $('#' + parts[1]).data('filter');

          urArgs = "type=" + parts[0] + "&object=" + filter + "&ts=" + theWhen;
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
              for (var i=0; i<theData.length; i++) {

                  rid = "s" + i + "-" + theData[i].sid + "-" + theData[i].cid;
                  eid = theData[i].sid + "-" + theData[i].cid;
                  row += "<tr class=d_row_sub1 id=s" + i + " data-filter=\"" + eid + "\">";
                  tclass = "c" + theData[i].status;
                  cv = classifications.class[tclass][0].short;
                  
                  row += "<td class=" + cv + ">" + cv + "</td>";
                  row += "<td class=sub>" + theData[i].timestamp + "</td>";
                  row += "<td class=sub>" + theData[i].sid + "." + theData[i].cid + "</td>";
                  row += "<td class=sub>" + theData[i].src_ip + "</td>";
                  row += "<td class=sub>" + theData[i].src_port + "</td>";
                  row += "<td class=sub>" + theData[i].dst_ip + "</td>";
                  row += "<td class=sub>" + theData[i].dst_port + "</td>";
                  row += "<td class=sub>";
                  row += "<div class=b_notes title='Add Notes'>N</div>";
                  row += "<div class=b_tag title='Add Tag'>T</div>";
                  row += "</td></tr>";
              }
              tbl += "<tr class=eview_sub1 id=eview_sub1><td colspan=7><div id=ev_close_sub class=close_sub><div class=b_close title='Close'>X</div></div>";
              tbl += "<div class=notes id=notes></div>";
              tbl += "<table class=sortable align=center width=100% cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></td></tr>";
              $("#" + rowLoke).after(tbl);
              $(".d_row_sub").fadeTo('0','0.2');
          }
          break;

        // Packet Data
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
              tbl += "<div class=notes_sub2 id=notes><b>Notes:</b> None.</div>";
              tbl += head;
              tbl += row;
              tbl += "</td></tr>";
              $("#" + rowLoke).after(tbl);

              // Turn off fade effect for large results
              rC = $(".d_row_sub1").length;
              if ( rC <= 399 ) {
                  $(".d_row_sub1").fadeTo('fast','0.2');
              }
          }
          break;
        }

    } 

// The End.
});

