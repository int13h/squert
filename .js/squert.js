$(document).ready(function(){

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

    // Put this in the config
    var emTimeout = 30000;

    //
    // Event monitor
    //

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
            if ( eventCount == 1 ) {
                ess = '';
            } else {
                ess = 's';
            }
            $("#b_event").fadeTo('slow',0.8);
            $("#b_event").html(eventCount + " new event" + ess);
        }

        lastCount = eventCount;

    }, emTimeout);

    //   
    // Bottom ribbon controls
    //

    $("#b_update").click(function() {
        location.reload();
    });

    $("#b_top").click(function() {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
    });
        
    // Tab manipulations
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
          
        }
    });

    // Logout
    $("#logout").click(function(event) {
         $.get(".inc/session.php?id=0", function(){location.reload()});
    });
    
    // Settings
    $("#settings").click(function(event) {
         $("#page").fadeOut('fast', function() {
             var content = $(".content_active").attr('id');
             old_content = content;
             $("#" + content).attr('class','content');
             $("#set_content").attr('class','content_active');
         });
    });

    $("#set_close").click(function(event) {
         $("#page").fadeTo('slow',1);
         $("#set_content").attr('class','content');
         $("#" + old_content).attr('class','content_active');
    });

    
    //
    // Rows
    //

    function closeRow() {
        $("#active_eview").remove();
        $("#" + this.id).attr('class','d_row');
        $(".d_row").css('opacity','1');
        $(".d_row_active").find('td').css('color', 'gray');
        $(".d_row_active").find('td').css('background', '#e9e9e9');
        $(".d_row_active").attr('class','d_row');
    }

    function closeSubRow() {
        $("#eview_sub1").remove();
        $("#" + this.id).attr('class','d_row_sub');
        $(".d_row_sub").css('opacity','1');
        $(".d_row_sub_active").find('td').css('color', 'gray');
        $(".d_row_sub_active").find('td').css('background', '#e9e9e9');
        $(".d_row_sub_active").find('td').css('border-top', 'none');
        $(".d_row_sub_active").attr('class','d_row_sub');
    }

    // not sure if this is right
    $(".item").live("click", function(){
        eventList(this.id);
    });

    // Reset if headings are clicked
    $("th.sort").click(function(e) {
        closeRow();
    });

    
    // Close open views
    $("#ev_close").live("click", function(event) {
        closeRow();
    });

    // Close open sub views
    $("#ev_close_sub").live("click", function(event) {
        closeSubRow();
    });

    // Main event view

    $(".d_row").click(function(event) {  

        // are we active?
        curClass = $(this).attr('class');
        var curID = this;

        // What type of row are we?
        rowType = this.id.substr(0,3);

        if (!$(".d_row_active")[0] && rowType == 'sid') {          

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

                signature = "<div id=ev_close class=close>X</div><div class=sigtxt>" + sigtxt + " <b>File:</b> " + sigfile + " <b>Line:</b> " + sigline + "</div>";
                var tbl = '';
                tbl += "<tr class=eview id=active_eview><td colspan=8><div id=eview class=eview>";
                tbl += signature;
                tbl += "</div></td></div></tr>";

                // Fade other results and show this
                $(curID).attr('class','d_row_active');
                $(curID).find('td').css('background', '#CFE3A6');
                $(".d_row").fadeTo('0','0.2');
                $(curID).after(tbl);
                eventList("2-" + rowValue);
                $("#eview").show();
            }
        }
    });

    //
    // Buttons
    //

    // More detail
    $(".b_detail").live("click", function() {

        switch (this.id[0]) {

        case "r":
          if (!$(".d_row_sub_active")[0]) {        
              rowcall = this.id.split("-");
              callerID = rowcall[0];
              $("#" + callerID).attr('class','d_row_sub_active');
              $("#" + callerID).find('td').css('border-top', '1pt solid #c9c9c9');
              eventList("3-" + this.id);
          }
          break;

        case "s":
          if (!$(".d_row_sub1_active")[0]) {
              rowcall = this.id.split("-");
              callerID = rowcall[0];
              $("#" + callerID).attr('class','d_row_sub1_active');
              $("#" + callerID).find('td').css('border-top', '1pt solid #c9c9c9');
              eventList("4-" + this.id);
          }
          break;
        }
        
    });

    //
    // Sub event views
    //

    function eventList (type) {

        var parts = type.split("-");
        switch (parts[0]) {

        // Events level 2
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
              head += "<th class=sub>Actions</th>";
              head += "</tr></thead>";

              for (var i=0; i<theData.length; i++) {

                  rid = "r" + i + "-" + parts[1] + "-" + theData[i].src_ip + "-" + theData[i].dst_ip;
                  row += "<tr class=d_row_sub id=r" + i + "><td class=sub>" + theData[i].count + "</td>";
                  row += "<td class=sub>" + theData[i].maxTime + "</td>";
                  row += "<td class=sub>" + theData[i].src_ip + "</td>";
                  if (theData[i].src_cc == "RFC1918") { sclass = "sub_light"; } else { sclass = "sub"; }
                  row += "<td class=" + sclass + ">" + theData[i].src_cc + "</td>";
                  row += "<td class=sub>" + theData[i].dst_ip + "</td>";
                  if (theData[i].dst_cc == "RFC1918") { sclass = "sub_light"; } else { sclass = "sub"; }
                  row += "<td class=" + sclass + ">" + theData[i].dst_cc + "</td>";
                  row += "<td class=sub>";
                  row += "<div class=b_detail id=" + rid + " title='More Detail'>D</div>";
                  row += "<div class=b_hist title='Event History'>H</div>";
                  row += "<div class=b_notes title='Add Notes'>N</div>";
                  row += "<div class=b_tag title='Add Tag'>T</div>";
                  row += "<div class=b_clsfy title='Classify'>C</div>";
                  row += "</td></tr>";
              }

              tbl += "<div class=eview_sub id=eview_sub><table id=events width=100% class=sortable cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></div>";

              $("#eview").after(tbl);
          }
          break;

        // Events level 3
        case "3":

          var rowLoke = parts[1];
          urArgs = "type=" + parts[0] + "&object=" + parts + "&ts=" + theWhen;
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
              head += "<th class=sub1 width=100>Source</th>";
              head += "<th class=sub1 width=40>Port</th>";
              head += "<th class=sub1 width=100>Destination</th>";
              head += "<th class=sub1 width=40>Port</th>";
              head += "<th class=sub1 width=180>Actions</th>";
              head += "</tr></thead>";
              for (var i=0; i<theData.length; i++) {

                  rid = "s" + i + "-" + theData[i].sid + "-" + theData[i].cid;
                  row += "<tr class=d_row_sub1 id=s1" + i + ">";
                  tclass = "c" + theData[i].status;
                  cv = classifications.class[tclass][0].short;
                  
                  row += "<td class=" + cv + ">" + cv + "</td>";
                  row += "<td class=sub>" + theData[i].timestamp + "</td>";
                  row += "<td class=sub>" + theData[i].src_ip + "</td>";
                  row += "<td class=sub>" + theData[i].src_port + "</td>";
                  row += "<td class=sub>" + theData[i].dst_ip + "</td>";
                  row += "<td class=sub>" + theData[i].dst_port + "</td>";
                  row += "<td class=sub>";
                  row += "<div class=b_detail id=" + rid + " title='More Detail'>D</div>";
                  row += "<div class=b_tx title='Transcript'>X</div>";
                  row += "<div class=b_notes title='Add Notes'>N</div>";
                  row += "<div class=b_tag title='Add Tag'>T</div>";
                  row += "<div class=b_clsfy title='Classify'>C</div>";
                  row += "</td></tr>";
              }

              tbl += "<tr class=eview_sub1 id=eview_sub1><td colspan=7><div id=ev_close_sub class=close_sub>X</div>";
              tbl += "<div class=notes id=notes></div>";
              tbl += "<table align=center width=100% cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></td></tr>";
              $(".d_row_sub").fadeTo('0','0.1');
              $("#" + rowLoke).after(tbl);
          }
          break;

        // Packet Data
        case "4":

          var rowLoke = parts[1];
          urArgs = "type=" + parts[0] + "&object=" + parts + "&ts=" + theWhen;
          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb3(data)});
          });

          function cb3(data){
              eval("theData=" + data);
              tbl = '';
              head = '';
              row = '';
          }
          break;
        }

    } 

// The End.
});

