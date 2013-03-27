/* Copyright (C) 2013 Paul Halliday <paul.halliday@gmail.com> */

$(document).ready(function(){

    var theWhen = $("#timestamp").val();
    // Load main content
    eventList("0-aaa-00");
    $("#loader").show();

    var lastclasscount = 0;

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
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
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

    // Classifications
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
        "c0":[{"short": "RT", "long": "Unclassified"}]
      }
    };

    //
    // Grid
    //

    function mkGrid(values) {
        
        cells = "<table class=grid cellspacing=none><tr>";
        composite = values.split(",");
        for (var i=0; i<24;) {
            var n = i;
	    if (n < 10) {
                n = "0" + n;                
            }
            var o = 0;
            for (var c = 0; c < composite.length; ++c) {
                if (composite[c] == n)
                    o++;
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
 
    //
    // Filter search box
    //

    $('#clear_search').click(function() {
        if ($('#search').val() != '') {
            $('#search').val('');
            $("#b_update").click();           
        }
    });

    //
    // Event monitor
    //
 
    var emTimeout = 30000;
    var curCount = 0, lstCount = 0;
    window.setInterval(function(){
        var urArgs = "type=" + 6 + "&ts=" + theWhen;
        $(function(){
            $.get(".inc/callback.php?" + urArgs, function(data){cb(data)});
        });

        function cb(data){
            eval("theData=" + data);
            curCount = theData[0].count;
        }
        if (lstCount == 0) {
            lstCount = curCount;    
        } 
         
        if (lstCount < curCount) {
            eventCount = parseInt(curCount - lstCount);
            $("#b_event").html("<b>Status:</b> New events are available");
            lstCount = curCount;
        }
    }, emTimeout);

    //
    // Toggle and update views
    //
    function newView(req) {
        var cv = $("#menu1").text();
        switch (req) { // Either an update or view change    
            case "u":
               f = "0-aaa-00";
               s = "2a-aaa-00";
               break; 
            case "c":
               switch(cv) {
                   case "ungroup events": $("#menu1").text("regroup events");
                       if ($("#search").val().length == 0) {
                           $("#rt").prop("checked", true);
                       }
                       break;  
                   case "regroup events": $("#menu1").text("ungroup events"); break;
               }
               f = "2a-aaa-00";
               s = "0-aaa-00";
               break;
        }
        switch (cv) {
            case "ungroup events":
                $("#tl0,#tl1").remove();
                eventList(f);
                $("#loader").show();
                break;
            case "regroup events":
                $("#tl3a,#tl3b").remove();
                eventList(s);
                $("#loader").show();
                break;
        }
    }

    // Group and ungroup
    $(document).on("click", "#menu1", function(event) {
        newView("c");
    });

    // RT check/uncheck
    $(document).on("click", "#rt", function(event) {
        newView("u");
    });

    // Update page
    $("#b_update").click(function(event) {
        newView("u");
    });
 
    // If search is in focus, update on enter
    $('#search').keypress(function(e) {
        if(!e) e=window.event;
        key = e.keyCode ? e.keyCode : e.which;
        if(key == 13) {
            newView("u");
        }
    });

    //
    // Tab manipulations
    //

     // Logout
    $("#logout").click(function(event) {
         $.get("index.php?id=0", function(){location.reload()});
    });

    $("#b_top").click(function() {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
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

    //
    // Rows
    //

    function closeRow() {
        if ($('#rt').is(':checked') && $(".d_row_active").find(".b_ec_hot").text() == 0) {
            $("#active_eview").remove();
            $(".d_row_active").fadeOut('slow', function (event) {
                $(".d_row_active").remove();
            });
            $(".d_row").css('opacity','1');
        } else {
            $("#active_eview").remove();
            $("#" + this.id).attr('class','d_row');
            $(".d_row").css('opacity','1');
            $(".d_row_active").find('[class*="row"]').css('color', 'gray');
            $(".d_row_active").find('[class*="row"]').css('background', 'transparent');
            $(".d_row_active").find('td').css('border-top', 'none')
            ltCol = $(".d_row_active").find('td.lt').html();
            $(".d_row_active").find('td.lt').css('background', ltCol);
            $(".d_row_active").attr('class','d_row');
        }
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
    $(document).on("click", ".sort", function(event) {
        closeRow();
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
     
            // Lookup rule
            urArgs = "type=" + 4 + "&sid=" + rowValue;

            $(function(){
                $.get(".inc/callback.php?" + urArgs, function(data){cb(data)});
            });

            $(".d_row_active").attr('class', 'd_row');
            $("#active_eview").attr('class','d_row');
            
            // This is now the active row
            $("#" + curID).attr('class','d_row_active');
            $("#" + curID).find('[class*="row"]').css('border-top', '1pt solid #c9c9c9');
            // Set the class count (counted again after load)
            curclasscount = $('.d_row_active').data('event_count');

            function cb(data){
                eval("sigData=" + data);
                sigtxt = sigData.ruletxt;
                sigfile = sigData.rulefile;
                sigline = sigData.ruleline;

                var tbl = '';
                tbl += "<tr class=eview id=active_eview><td colspan=10><div id=eview class=eview>";
                tbl += "<div id=ev_close class=close><div class=b_close title='Close'>X</div></div>";
                tbl += "<div class=sigtxt>" + sigtxt + " <br><br>";
                tbl += "<span class=small>";
                tbl += "file: <span class=boldtab>" + sigfile + ":" + sigline + "</span>";
                tbl += "<canvas id=chart_timestamps width=930 height=130>[No canvas support]</canvas>";
                tbl += "</div><br>";
                tbl += "<div class=event_class><input id=ca0 class=chk_all type=checkbox>";
                tbl += "categorize <span class=bold id=class_count>";
                tbl += curclasscount + "</span> event(s)</div>";
                tbl += "</td></tr>";
                $("#" + curID).after(tbl);
                eventList("1-" + rowValue);
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

            // Reset checkbox
            $(".chk_all").prop("checked",false);

            switch (columnType) {
                case "l": adqp = s2h("AND event.status = 0"); break;
                case "r": adqp = s2h("empty"); break;
            }

            rowcall = baseID.split("-");
            callerID = rowcall[0];
            $("#" + callerID).attr('class','d_row_sub_active');
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
            urArgs = "type=" + 7 + "&txdata=" + txdata;
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
                tbl += "<div class=b_close title='Close'>X</div></div>";
                tbl += row;
                tbl += "</td></tr>";
                $("#" + rowLoke).after(tbl);

                // Turn off fade effect for large results
                rC = $(".d_row_sub1").length;
                if ( rC <= 399 ) {
                    $(".d_row_sub1").fadeTo('fast','0.2');
                }

                $("#loader").hide();
            }
        }
    });

    //
    // This creates the views for each level
    //

    function eventList (type) {
        var parts = type.split("-");
        var filterMsg = '';
        var rt = 0;
        var theFilter = s2h('empty');

        // See if we are just RT events
        if ($('#rt').is(':checked')) {
            rt = 1;
        }

        // Check for any filters
        if ($('#search').val().length > 0) {
            var fParts = $('#search').val().split(" ");
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
        switch (parts[0]) {

        // Level 0 view - Grouped by Signature
        case "0":
          urArgs = "type=" + parts[0] + "&object=" + type + "&ts=" + theWhen + "&filter=" + theFilter + "&rt=" + rt;
          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb1(data)});
          });
          function cb1(data){
              eval("d0=" + data);
              tbl = '';
              head = '';
              row = '';
              head += "<thead><tr><th class=sort width=60>QUEUED</th>";
              head += "<th class=sort width=60>ALL</th>";
              head += "<th class=sort width=35>SC</th>";
              head += "<th class=sort width=35>DC</th>";
              head += "<th class=sort width=70>ACTIVITY</th>";
              head += "<th class=sort width=80>LAST EVENT</th>";
              head += "<th class=sort>SIGNATURE</th>";
              head += "<th class=sort width=80>ID</th>";
              head += "<th class=sort width=60>PROTO</th>";
              head += "<th class=sort width=60>% TOTAL</th>";
              head += "</tr></thead>";

              var sumEC = 0, sumSC = 0, sumDC = 0, sumSI = 0;

              if (d0.length > 0) {
                  // Sums for boxes 
                  for (var i=0; i<d0.length; i++) {
                     sumEC += Number(d0[i].f1);
                     sumSC += Number(d0[i].f6);
                     sumDC += Number(d0[i].f7);
                  }
                  sumSI = d0.length;
              } else {
                  row += "<tr class=d_row><td class=row colspan=10>";
                  row += "No result.</td></tr>";
              }
  
              if (rt == 1) {
                  sumSC = "-";
                  sumDC = "-";
              }
               
              for (var i=0; i<d0.length; i++) {

                  // How many events are not categorized?
                  unClass = d0[i].f11.split(",").filter(function(x){return x==0}).length;

                  // Colour based on event presence
                  if ( unClass > 0 ) {
                      rtClass = "b_ec_hot";
                      isActive = "row_active";
                  } else {
                      rtClass = "b_ec_cold";
                      isActive = "row";
                  }

                  // Disable ec_total if we are RT
                  ttlActive = "row_active";
                  if (rt == 1) {
                      ttlActive = "row";
                  }                  

                  rid = "r" + i + "-" + parts[1];
                  cells = mkGrid(d0[i].f12);
                  row += "<tr class=d_row id=sid-" + d0[i].f3 + "-" + d0[i].f4;
                  row += " data-class=" + " data-sid=" + " data-event_count=" + d0[i].f1 + ">";
                  row += "<td class=" + isActive + "><div class=" + rtClass + ">" + unClass + "</div></td>";
                  row += "<td class=" + ttlActive + "><div class=b_ec_total>" + d0[i].f1 + "</div></td>";
                  row += "<td class=row><span class=red>" +d0[i].f6+ "</span></td>";
                  row += "<td class=row><span class=blue>" +d0[i].f7+ "</span></td>";

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

              tbl += "<table id=tl0 width=960 cellpadding=0 cellspacing=0 align=center>";
              tbl += "<td align=center><div class=big>Total Events</div><div id=etotal class=box>"; 
              tbl += sumEC + "</div></td>";
              tbl += "<td align=center><div class=big>Total Signatures</div><div id=esignature class=box>";
              tbl += sumSI + "</div></td>";
              tbl += "<td align=center><div class=big>Total Sources</div><div class=box>";
              tbl += sumSC + "</div></td>";
              tbl += "<td align=center><div class=big>Total Destinations</div><div class=box>";
              tbl += sumDC + "</div></td>";
              tbl += "</table><br>";
              
              tbl += "<table id=tl1 class=main width=960 cellpadding=0 cellspacing=0 align=center>";
              tbl += head;
              tbl += row;
              tbl += "</table>";
              $('#' + parts[1] + '-' + parts[2]).after(tbl);
              $('#tl0,#tl1').fadeIn('slow');
              $("#b_event").html("<b>Status:</b>&nbsp;&nbsp;Synchronized");
              $("#tl1").tablesorter();
              if ($('#tl4').length == 0) {
                  loadFilters(0);
              }
              $("#loader").hide();
          }
        break;

        // Level 1 view - Grouped by signature, source, destination

        case "1":
          urArgs = "type=" + parts[0] + "&object=" + parts[1] + "&ts=" + theWhen + "&filter=" + theFilter + "&rt=" + rt;
          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb2(data)});
          });

          function cb2(data){
              eval("theData=" + data);
              tbl = '';
              head = '';
              row = '';
              head += "<thead><tr><th class=sub width=45>QUEUE</th>";
              head += "<th class=sub width=110>TOTAL</th>";
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
                  sids = c_sid.split(",");
                  cids = c_cid.split(",");
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
                  cells = mkGrid(theData[i].f12);
                  
                  // Event sums
                  tlCount += parseInt(count,10);
                  rtCount += parseInt(unclass,10);

                  rid = "r" + i + "-" + parts[1] + "-" + src_ip + "-" + dst_ip;
                  row += "<tr class=d_row_sub id=r" + i + " data-filter=\"" + rid + "\">";
                  row += "<td class=" + isActive + " id=l2l" + i + "><div class=" + rtClass + ">" + unclass + "</div></td>";
                  row += "<td class=" + ttlActive + " id=l2r" + i + "><div class=b_ec_total>" + count + "</div></td>";
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
     
              // Pass timestamps for chart creation
              chartInterval(timeValues);
              
              // Add scid's to checkbox
              $("#ca0").data("scid", scid.replace(/,$/, ""));

              // If queue is empty provide event sums in case the user 
              // intends to reclass anything
              if (rtCount == 0) {
                  curclasscount = tlCount;
              } else {
                  curclasscount = rtCount;
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
              $(".d_row_active").find(".b_ec_total").text(tlCount);

              tbl += "<div class=eview_sub id=eview_sub><table id=tl2 class=table cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></div>";
              $("#eview").after(tbl);
              $("#tl2").tablesorter();
              $("#loader").hide();
          }
        break;

        // Level 2 view - No grouping, individual events

        case "2":
          var rowLoke = parts[1];
          var filter = $('#' + parts[1]).data('filter');

          urArgs = "type=" + parts[0] + "&object=" + filter + "&ts=" + theWhen + "&adqp=" + parts[2];
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
              $("#class_count").html(d2.length);
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
                  row += "<tr class=d_row_sub1 id=s" + i + " data-cols=9 data-filter=\"" + eid + "\">";
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
                  row += "type=checkbox value=\"" + sid + "." + cid + "\">";
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

              tbl += "<tr class=eview_sub1 id=eview_sub1><td colspan=8><div id=ev_close_sub ";
              tbl += "class=close_sub><div class=b_close title='Close'>X</div></div>";
              tbl += "<div class=notes></div>";
              tbl += "<table id=tl3 class=table align=center width=100% cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></td></tr>";
              $("#" + rowLoke).after(tbl);
              $(".d_row_sub").fadeTo('0','0.2');
              $("#loader").hide();
              $("#tl3").tablesorter({headers:{0:{sorter:false}},cancelSelection:false});
              $("#ca0").hide();
          }
        break;
 
        // Level 2a view - No grouping, individual events

        case "2a":
          urArgs = "type=2a&ts=" + theWhen + "&filter=" + theFilter + "&rt=" + rt;
          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb3a(data)});
          });

          function cb3a(data){
              eval("d2a=" + data);

              tbl = '';
              head = '';
              row = '';
              head += "<thead><tr>";
              head += "<th class=sub width=10><input id=ca2 class=chk_all type=checkbox></th>";
              head += "<th class=sub width=20>ST</th>";
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
                  row += "<tr class=d_row_sub1><td class=row colspan=11>";
                  row += "No result.</td></tr>";
              }
 
              // Aggregate time values
              var timeValues = "";
              for (var ts=0; ts<d2a.length; ts++) {
                  var datetimestamp = d2a[ts].f2.split(" ");
                  timeValues += datetimestamp[1] + ",";
              }

              var maxI = 500; 
              // Update class_count
              $("#class_count").html(d2a.length);
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
                  var signature = d2a[i].f14 || "-";
                  var evt_msg   = "-";
                  var cs = getCountry(src_cc).split("|");
                  var cd = getCountry(dst_cc).split("|");

                  rid = "s" + i + "-" + sid + "-" + cid;
                  eid = sid + "-" + cid;
                  tclass = "c" + eclass;
                  cv = classifications.class[tclass][0].short;
                  txdata = "s" + i + "-" + cid + "-" + s2h(sid + "|" + timestamp + "|" + src_ip + "|" + src_port + "|" + dst_ip + "|" + dst_port);

                  txBit = "<div class=n_TX>TX</div>";   
                  if (src_port != "-" && dst_port != "-") {
                      txBit = "<div class=b_TX data-tx=" + txdata + " title='Generate Transcript'>TX</div>";
                  }
   
                  row += "<tr class=d_row_sub1 id=s" + i + " data-cols=11 data-filter=\"" + eid + "\">";
                  row += "<td class=row><input id=cb_" + i + " class=chk_event "; 
                  row += "type=checkbox value=\"" + sid + "." + cid + "\">";
                  row += "<td class=row><div class=a_" + cv + " id=class_box_" + i + ">";
                  row += cv + "</div></td>";
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
 
              var sumED = 0, sumEC = 0, sumSI = 0, sumSC = "-", sumDC = "-", cmsg = "";
              
              if (d2a.length > 0) {
                  sumED = i;  
                  sumEC = d2a.length;
              }
  
              if (d2a.length >= maxI) {
                  sumRE = sumEC - maxI;
                  cmsg = " / <span class=bold>"  + sumRE + "</span> not shown";
              }

              tbl += "<table id=tl3a class=chart align=center width=960 border=0 cellpadding=0 cellspacing=0>";
              tbl += "<tr><td class=dark colspan=10><div>";
              tbl += "<canvas id=chart_timestamps width=950 height=130>[No canvas support]</canvas>";
              tbl += "</div><div class=event_class>";
              tbl += "categorize <span class=bold id=class_count>" + 0 + "</span>";
              tbl += " of <span id=cat_count class=bold>" + sumED + "</span> event(s)" + cmsg;
              tbl += "</div></td></tr>";
              tbl += "</table>";

              tbl += "<table id=tl3b class=main align=center width=960 cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table>";
              $('#' + parts[1] + '-' + parts[2]).after(tbl);
              chartInterval(timeValues);
              $("#tl3a,#tl3b").fadeIn('slow');
              $("#b_event").html("<b>Status:</b>&nbsp;&nbsp;Synchronized");
              $("#tl3b").tablesorter({headers:{0:{sorter:false}},cancelSelection:false});
              $("#loader").hide();
          }
        break;

        // Level 3 view - Packet Data

        case "3":
          var rowLoke = parts[1];
          var nCols = $('#' + parts[1]).data('cols');
          var filter = $('#' + parts[1]).data('filter');

          urArgs = "type=" + parts[0] + "&object=" + filter + "&ts=" + theWhen;

          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb4(data)});
          });

          function cb4(data){
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
                    
              tbl += "<tr class=eview_sub2 id=eview_sub2><td class=sub2 colspan=" + nCols + "><div id=ev_close_sub1 class=close_sub1><div class=b_close title='Close'>X</div></div>";
              tbl += "<div class=notes_sub2 id=notes></div>";
              tbl += head;
              tbl += row;
              tbl += "</td></tr>";
              $("#" + rowLoke).after(tbl);
              $("#loader").hide();

              // Turn off fade effect for large results
              rC = $(".d_row_sub1").length;
              if ( rC <= 399 ) {
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

    $(document).on("click", ".sub_filter,.row_filter", function() {
        var prefix = $(this).data('type');
        var suffix = $(this).html();
        switch (prefix) {
            case  'ip': $('#search').val(prefix + " " + suffix); break;
            case  'cc': var cc = $(this).data('value');
                        $('#search').val(prefix + " " + cc); break;  
            case 'sid': var value = $(this).data('value');
                        $('#search').val(prefix + " " + value); break; 
            case 'spt': $('#search').val(prefix + " " + suffix); break;
            case 'dpt': $('#search').val(prefix + " " + suffix); break;
        } 
        $('#search').focus();
    });

    //
    // Event classification
    //
    
    // Highlight colour for selected events
    var hlCol = "lightyellow";

    $(document).on("click", ".b_EX", function(event) {
        var nw, txt, cw = $(".cat_box").css("width");
        switch (cw) {
            case "150px": 
                nw = 25; 
                txt =  "&#8592\;"; 
                $(".cat_val").fadeOut(function () {
                    $(".b_EX").html(txt);
                    $(".cat_box").css("width", nw + "px");
                });
                break;
            case  "25px": 
                nw = 150; 
                txt = "&#8594\;";
                $(".b_EX").html(txt);
                $(".cat_box").css("width", nw + "px");
                $(".cat_val").fadeIn();
                break;
        }
    });

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

    // Show message box
    $(document).on("click", ".b_ME", function(event) {
        var chkLen = parseInt($(".chk_event:checked").length + $(".chk_all:checked").length);
        if (chkLen > 0) {
            $(".cat_msg").fadeIn();
        }
    });

    // Hide message box
    $(document).on("click", ".cat_msg_add", function(event) {
        $(".cat_msg").fadeOut();
        $(".cat_msg_txt").val("");
    });

    var clickOne = 0, clck1 = 0, clck2 = 0;
    // Individual selects
    $(document).on("click", ".chk_event", function(event) {
        clickTwo = this.id.split("_");
        if (Number(clickOne[1]) > Number(clickTwo[1])) {
            clck1 = clickTwo[1];
            clck2 = clickOne[1];
        } else {
            clck1 = clickOne[1];
            clck2 = clickTwo[1];
        }

        if (event.shiftKey) {
            $("#s" + clck1).nextUntil("#s" + clck2).find(".chk_event").prop("checked", true);
            $("#s" + clck1).nextUntil("#s" + clck2).find("td").css("background-color", hlCol);
            clickOne = 0, clck1 = 0, clck2 = 0;
        } 

        // Update class_count
        $("#class_count").html($(".chk_event:checked").length);
        if ($("#ca1:checked").length > 0) {
             $("#ca1").prop("checked",false);
        }
        clickOne = this.id.split("_");

        if ($(this).prop("checked") == true) {
            $("#s" + clickTwo[1]).find("td").css("background-color", hlCol);  
        } else {
            $("#s" + clickTwo[1]).find("td").css("background-color", "transparent");
        }
    });

    // Select all (2)
    $(document).on("click", "#ca1", function(event) {
        var chkLen = $("#ca1:checked").length;
        switch(chkLen) {
            case 0:
                $(".chk_event").prop("checked",false);
                $(".d_row_sub1").find("td").css("background-color", "transparent");
                $("#ca0").prop("checked",false);
                break;
            default:
                $(".chk_event").each(function() {
                    if ($(this).prop("disabled") == false) {
                        $(this).prop("checked",true);
                    }
                });
                $(".d_row_sub1").find("td").css("background-color", hlCol);
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
                $(".d_row_sub1").find("td").css("background-color", "transparent");
                $("#ca2").prop("checked",false);
                break;
            default:
                $(".chk_event").each(function() {
                    if ($(this).prop("disabled") == false) {
                        $(this).prop("checked",true);
                    }
                });
                $(".d_row_sub1").find("td").css("background-color", hlCol);
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
        var scid= "";
        if ($(".eview_sub1")[0] || $("#ca2")[0]) {
            $(".chk_event:checked").each(function() {
                scid += $(this).val() + ",";
            });
            scidlist = scid.replace(/,$/, "");
        } else {
            scidlist = $("#ca0").data("scid").split(","); 
        }

        // Was there a message?
        var msg = "none";
        if($(".cat_msg_txt").val().length != 0) {
            msg = $(".cat_msg_txt").val();
            $(".cat_msg_add").click();
        }        
        
        var catdata = intclass + "|||" + msg + "|||" + scidlist;
        // URI can't be longer than 8190 bytes. If it is, truncate and loop
        if (catdata.length <= 8000) {
            // We are now ready to class
            urArgs = "type=" + 9 + "&catdata=" + catdata;
            $(function(){
                $.get(".inc/callback.php?" + urArgs, function(data){cb9(data)}); 
            });
        }

        function cb9(data){
            eval("catRaw=" + data);
            catDbg = catRaw.dbg;
            if (catDbg == "0") {

                // How many events were selected
                curclasscount = $("#class_count").text();
                curtotalparentcount = $(".d_row_active").find(".b_ec_hot").text();
               
                if (curtotalparentcount > 0) {

                    // How many are in the parent
                    curtotalparentcount = $(".d_row_active").find(".b_ec_hot").text();
 
                    // Adjust the parent count
                    newparentcount = parseInt(curtotalparentcount - curclasscount,10);
                    $(".d_row_active").find(".b_ec_hot").text(newparentcount);
                    if (newparentcount == 0) {a
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

                    // Lastly, update class_count
                    $("#class_count").html(0);
                    lastclasscount = newparentcount;

                } else { // We are reworking events
                   if ($(".eview_sub1")[0]) {
                       curtotalchildcount = $(".d_row_sub_active").find(".b_ec_total").text();
                       $("#class_count").html(curtotalchildcount);
                   } else {
                       $("#class_count").html(lastclasscount);
                   }
                }

                // What the new classification is
                selClass = $(caller).attr("class");
                selTxt = selClass.split("_");
                newClass = "a_" + selTxt[1];
        
                // Change visible class and disable if RT
                // If we are RT ungrouped, we just remove 
                if ($('#rt').is(':checked') && $("#ca2")[0]) {
                    $(".chk_event:checked").each(function() {
                        var pid = $(this).attr("id").split("_");
                        var nid = parseInt(Number(pid[1]) + 1);
                        // Remove any open payload or TX panes
                        if ($("[id^=eview_]")[0]) {
                            $("[id^=eview_]").remove();
                            $(".d_row_sub1").css('opacity','1');
                        }
                        $("#s" + pid[1]).fadeOut('fast', function() {
                            $("#s" + pid[1]).remove();
                            // Select next entry
                            if (curclasscount == 1) {
                                $("#s" + nid).find(".chk_event").prop("checked", true);
                                $("#s" + nid).find("td").css("background-color", hlCol);
                                $("#class_count").html($(".chk_event:checked").length);
                            }
                        });
                    });
                } else {
                    $(".chk_event:checked").each(function() {
                       // var curID = $(this).parent(".d_row_sub1").attr('id'); 
                        var n = this.id.split("_");          
                        $("#class_box_" + n[1]).attr('class', newClass);
                        $("#class_box_" + n[1]).text(selTxt[1]);
                        if (curtotalparentcount > 0) {
                            $(this).prop("disabled",true);
                        }
                    });
                }
                
                // Uncheck everything
                $(".chk_event").prop("checked", false);
                $(".chk_all").prop("checked", false);
                catMsg(curclasscount);
            } else {
                catMsg(0);
            }
        }
    }

    function catMsg(count) {
        ess = '';
        if ( count > 1 ) {
            ess = 's';
        }
               
        $("span.class_msg").text(count + " event" + ess + " categorized");
        $("span.class_msg").fadeIn('slow', function() {
            setTimeout(function(){
                $(".class_msg").fadeOut('slow');
            }, 3000);
        });

        // If we are just rt update Total boxes as we go
        if ($('#rt').is(':checked')) {
            if (!$("#ca2")[0]) {
                newboxtotal = parseInt($("#etotal").text() - count);
                newsigtotal = parseInt($("#esignature").text() - 1);
                $("#etotal").text(newboxtotal);
                $("#esignature").text(newsigtotal);
            } else {
                newboxtotal = parseInt($("#cat_count").text() - count);
                $("#cat_count").text(newboxtotal);
                if (newboxtotal == 0) {
                    $("#b_update").click();
                }
                
            }
        }
    }

    //
    // Filters
    //

    // Open and close the view
    $('#filters').click(function() {
        $('#usr_filters').toggle();
        if ($('#usr_filters').css('display') == "none") {
            $('#tl4').hide();
        } else {
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
            
        var curUser = $('#t_usr').data('c_usr');
        urArgs = "type=8" + "&user=" + curUser + "&mode=query&data=0";
        $(function(){
            $.get(".inc/callback.php?" + urArgs, function(data){cb6(data)}); 
        });

        function cb6(data){
            eval("theData=" + data);
            tbl = '';
            head = '';
            row = '';
            head += "<thead><tr>";
            head += "<th class=sort width=70>ALIAS</th>";
            head += "<th class=sort width=200>NAME</th>";
            head += "<th class=sort>NOTES</th>";
            head += "<th class=sort width=150>LAST MODIFIED</th>";
            head += "<th class=sortr width=120>";
            head += "<div title=close class=filter_close>x</div>";
            head += "<div title=add class=filter_new>+</div>";
            head += "<div title=refresh class=filter_refresh>&#x21BA;</div>";
            head += "<div title=help class=filter_help>?</div>";
            head += "</th></tr></thead>";

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

            tbl += "<table id=tl4 class=padded width=970 cellpadding=0 cellspacing=0 align=center>";
            tbl += head;
            tbl += row;
            tbl += "</table>";
            $('#usr_filters').after(tbl);
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
        if ($('#tr_help').length == 0) {
            row = "<tr id=tr_help><td class=fhelp colspan=5>";
            row += "<div class=filter_parts><u><b>Filters</b></u><br><br>";
            row += "Filters are used to add extra conditions to base queries before they are performed. ";
            row += "When the main event page loads it displays <b>ALL</b> events for the current day. ";
            row += "Using filters lets you manipulate the base query to return just the results you are interested in. ";
            row += "Filters can either be explicit statements or shells that accept arguments.</div>";
            row += "<div class=filter_parts><u><b>Usage</b></u><br><br>";  
            row += "Once a filter has been created you can start using it right away. To do so, simply type the ";
            row += "filters alias in the input box located at the top right corner of the interface and press the ";
            row += "enter key. If you create a filter with the alias 'a', then you would ";
            row += "just type 'a' and then 'enter' to perform the query and return the filtered results.<br><br>"; 
            row += "<b>Explicit</b> filters are ";
            row += "intended to be used for frequent queries that contain multiple but static conditions, say ";
            row += "a filter called 'finance' that contains three sensors and IPs in a few  different "; 
            row += "ranges.<br><br>";
            row += "<b>Shells</b> on the other hand are a little more dynamic. For example, one of the base filters ";
            row += "with the alias 'ip' looks like this: <br><br>";
            row += "<b>\"filter\": \"(src_ip = INET_ATON('$') OR dst_ip = INET_ATON('$'))\"</b><br><br>";
            row += "This filter can be used either like this <b>'ip 10.1.2.3'</b>  or like this ";
            row += "<b>'ip 10.1.2.3,10.1.2.4,10.1.2.5'</b>. ";
            row += "Shell filters expand '$' to whatever immediately follows the filter alias. If commas are used ";
            row += "each additional item will also be added to the query.</div>";
            row += "<div class=filter_parts><u><b>Query examples</b></u><br><br>";
            row += "We are using standard MySQL vernacular so we can make use of all native functions ";
            row += "and conditional operators. A few simple examples:<br><br>";
            row += "=> (src_port NOT IN('80','443') AND dst_port > 1024)<br>";
            row += "=> (src_ip NOT BETWEEN 167772160 AND 184549375 AND src_ip NOT BETWEEN 2886729728 AND 2886795263)<br>";
            row += "=> (signature LIKE '%malware%' AND INET_ATON(dst_ip) LIKE '10.%.1.%')</div>";  
            row += "<div class=filter_parts><u><b>Available filter fields</b></u><br><br>";
            row += "<div class=filter_fields>";
            row += "<div class=boldf>cid</div> - The event ID. sid + cid = distinct event<br>";
            row += "<div class=boldf>class</div> - Event Classification<br>";
            row += "<div class=boldf>dst_ip</div> - Destination IP<br>";
            row += "<div class=boldf>dst_port</div> - Destination Port<br>";
            row += "<div class=boldf>icmp_code</div> - ICMP Code<br>";
            row += "<div class=boldf>icmp_type</div> - ICMP Type<br>";
            row += "<div class=boldf>ip_csum</div> - IP Header Checksum<br>";
            row += "<div class=boldf>ip_flags</div> - IP Flags<br>";
            row += "<div class=boldf>ip_hlen</div> - IP Header Length<br>";
            row += "<div class=boldf>ip_id</div> - IP Identification<br>";
            row += "<div class=boldf>ip_len</div> - IP Total Length<br>";
            row += "<div class=boldf>ip_off</div> - IP Fragment Offset<br>";
            row += "<div class=boldf>ip_proto</div> - IP Protocol<br>";
            row += "<div class=boldf>ip_tos</div> - IP Type Of Service</div>";
            row += "<div class=filter_fields>";
            row += "<div class=boldf>ip_ttl</div> - IP Time To Live<br>";
            row += "<div class=boldf>ip_ver</div> - IP Version<br>";
            row += "<div class=boldf>msrc.cc</div> - Source Country Code<br>";
            row += "<div class=boldf>mdst.cc</div> - Destination Country Code<br>";
            row += "<div class=boldf>priority</div> - Event Priority<br>";
            row += "<div class=boldf>sid</div> - The sensor ID. sid + cid = distinct event<br>";
            row += "<div class=boldf>signature</div> - Event Signature<br>";
            row += "<div class=boldf>signature_gen</div> - Event Signature Generator<br>";
            row += "<div class=boldf>signature_id</div> - Event Signature ID<br>";
            row += "<div class=boldf>signature_rev</div> - Event Signature Revision<br>";
            row += "<div class=boldf>src_ip</div> - Source IP<br>";
            row += "<div class=boldf>src_port</div> - Source Port<br>";
            row += "<div class=boldf>status</div> - Analyst Classification</div></div>";
            row += "</td></tr>"; 
            $('#tl4').prepend(row);
            $('.filter_help').css('background-color','#cc0000');
            $('.filter_help').css('color','#fff');
            $('.filter_help').text('X');
        } else {
            $('#tr_help').remove();
            $('.filter_help').css('background-color','#888888');
            $('.filter_help').css('color','#fff');
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
            var curUser = $('#t_usr').data('c_usr');
            urArgs = "type=8&user=" + curUser + "&mode=update&data=" + fd;

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
            var curUser = $('#t_usr').data('c_usr');
            urArgs = "type=8&user=" + curUser + "&mode=remove&data=" + currentCL;
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
