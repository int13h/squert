$(document).ready(function(){
  function getDaysInMonth(yy,mm) {
    return new Date(yy, mm, 0).getDate();
  }

  // Textual day and month representations
  strDays = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday',
                 'Friday', 'Saturday'];

  strMonths = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

  // Create day links
  function createDays(yy,mm,dd) {
    $('.days').hide();
    var nDays = getDaysInMonth(yy,mm);
    var html = '';
    for(var d = 1; d <= nDays; d++) {
      var strDate = mm + "," + d + "," + yy;
      var thisDay = new Date(strDate);
      var jj = strDays[thisDay.getDay()];
      var dClass = "day";
      var dn = d;
      if (d < 10) dn = "0" + d; 
      if (jj[0] == 'S') dClass = "sday";
      if (d == dd) dClass = "aday";
      if (thisDay > baseDate) dClass = "dday";
      html += "<td class=\"" + dClass + "\" data-type=d data-link=\"" + dn + "\">" + jj.substring(0,3) + dn + "</td>";
    }
    $('.days').html(html); 
    $('.days').show();
  }

  // Create hour links
  function createHours() {
    $('.hours').hide();
    var html = '';
    for(var h = 0; h <= 23; h++) {
      var hh = h + ":00:00";
      if (h < 10) hh = "0" + h + ":00:00";
      html += "<td id=\"s_" + h + "\" class=hour data-link=\"" + hh + "\">" + h + ":00</td>";
    }
    $('.hours').html(html); 
    $('.hours').show();
  }

  // Clocks
  function createClocks() {
    function pad(i) {
      if (i < 10) return "0" + i;
      return i;
    }
    var today=new Date();
    var lh=pad(today.getHours());
    var uh=pad(today.getUTCHours());
    var lm=pad(today.getMinutes());
    var um=pad(today.getUTCMinutes());
    var ss=pad(today.getSeconds());
    if (isUTC == 1) {
      $('#b_local').hide();
    } else {
      $('#b_local').show();
      $('#clock_local').text(lh + ":" + lm + ":" + ss); 
    }  
    $('#clock_utc').text(uh + ":" + um + ":" + ss);
    t=setTimeout(function(){createClocks()},500);
  }

  // Create controls
  var isUTC = 0;
  function createControls() {
    // Users timezone offset
    var dOffset = $('#user_tz').val();
    var checkUTC = '', inputUTC = '';
    if (dOffset == "+00:00") {
      isUTC = 1;
      checkUTC = " checked";
      inputUTC = " disabled";
    } else {
      $('#ts_offset').val(dOffset);
    }
   
    var html = '';
    html += "<table class=dt_table><tr><td class=dt_content><span class=dt_error data-err=0>Format Error!</span>";
    html += "<span class=fl>START</span>&nbsp";
    html += "<input class=dt_input id=ts_sdate type=text maxlength=10>&nbsp;";
    html += "<input class=dt_input id=ts_stime type=text maxlength=8>";
    html += "<span class=fl>END</span>&nbsp";
    html += "<input class=dt_input id=ts_edate type=text maxlength=10>&nbsp;";
    html += "<input class=dt_input id=ts_etime type=text maxlength=8>";
    html += "&nbsp;&nbsp;<span class=fl>UTC</span><input class=dt_utc id=ts_utc type=checkbox" + checkUTC + ">";
    html += "&nbsp;&nbsp;<span class=fl>TZ OFFSET</span><input class=dt_input id=ts_offset";
    html += " type=text" + inputUTC + "></td>";
    html += "<td width=175 class=dt_content><div id=dt_savetz class=dt_b>save TZ</div><div id=dt_reset class=dt_b>reset</div></td>";
    html += "<td class=cog><img class=il src=.css/lr.png></td><tr></table>";
    $('#cal').prepend(html);
  }

  // Click events
  $(document).on('click', '.month', function(event) {
    var td = new Date();
    var yy = td.getFullYear();
    var mm = td.getMonth() + 1;
    var dd = td.getDate();
    var lType = $(this).data('type');
    var curMonth = $('.amonth').data('link');
    switch (lType) {
      case "m": // Month was clicked
        var newMonth = $(this).data('link'); 
        var curYear = $('#py').data('link') + 1;
        $('.amonth').attr('class','month');
        $(this).attr('class','amonth');
        dd = 1;
      break;
      case "py": // Previous year was clicked
        var newMonth = curMonth;
        var curYear = $('#py').data('link');
        var py = curYear - 1;
        var ny = curYear + 1;
        $('.dmonth').attr('class','month');
        $('#py').data('link', py);
        $('#py').html('&lt; ' + py);
        $('#ny').data('link', ny);
        $('#ny').html(ny + ' &gt;');
        dd = 1;
      break;
      case "ny": // Next year was clicked
        var newMonth = curMonth;
        var curYear = $('#ny').data('link');
        var py = curYear - 1;
        var ny = curYear + 1;
        var am = 0;
        $('.dmonth').attr('class','month');
        // If we are in the current year we need to make sure we don't pass
        // the current month or allow the next year
        if (curYear === yy) {
          if (curMonth > mm) {
            $('.amonth').attr('class','month');
            if (mm < 10) var nm = "0" + mm;
            newMonth = nm;
            am = 1; 
          }  
          $('.month').each(function() {
            var cm = $(this).data('link');
            if (cm[0] == 0) cm = cm[1];
            if (cm <= 12) {
              if (cm > mm) $(this).attr('class','dmonth');
              if (cm == mm && am == 1) $(this).attr('class','amonth');
            }
          });
          $('#ny').attr('class','dmonth');
        }
        $('#py').data('link', py);
        $('#py').html('&lt; ' + py);
        $('#ny').data('link', ny);
        $('#ny').html(ny + ' &gt;');
        dd = 1;        
      break;
    }
    var curDay = dd;
    if (curDay < 10) curDay = "0" + curDay;
    createDays(curYear,newMonth,curDay);
    $('#ts_sdate').val(curYear + "-" + newMonth + "-" + curDay); 
    $('#ts_edate').val(curYear + "-" + newMonth + "-" + curDay);
  });

  // Days
  $(document).on('click', '.day,.sday', function(event) {
    if ($('.aday').text()[0] == 'S') {
      $('.aday').attr('class','sday');
    } else {
      $('.aday').attr('class','day');
    }
    $('.aday').attr('class','day');
    $(this).attr('class','aday');
    var yy = $('#py').data('link') + 1;
    var mm = $('.amonth').data('link');
    var dd = $(this).data('link');
    $('#ts_sdate').val(yy + "-" + mm + "-" + dd);
    $('#ts_edate').val(yy + "-" + mm + "-" + dd);
    $('.b_update').click();
  });

  // Hours
  $(document).on("click", ".hour,.ahour", function(event) {
    var clckd = $(this).attr('id').split("_")[1];
    var lcky = 0;
    if ($('.ahour')[0]) {
      var aclckd = $('.ahour').attr('id').split("_")[1];
      var iCount = $('.ahour').length;
      var iLast  = $('.ahour').last().attr('id').split("_")[1];

      if (event.shiftKey) {
        if (Number(clckd) > Number(aclckd)) {
          var sEnd = Number(clckd);
          $('.ahour').attr('class','hour');
          $("#s_" + clckd).attr('class','ahour');
          $("#s_" + aclckd).attr('class','ahour');
          $("#s_" + aclckd).nextUntil("#s_" + sEnd).attr('class','ahour');
        } else if (Number(clckd) < Number(aclckd)) {
          var sEnd = Number(clckd);
          $("#s_" + clckd).attr('class','ahour');
          $("#s_" + aclckd).prevUntil("#s_" + sEnd).attr('class','ahour');
        } else if (clckd == aclckd) {
          $('.ahour').attr('class','hour');
          lcky = 2;
        } else {
          $('.ahour').attr('class','hour');
        }
      } else if (clckd == aclckd) {
        $('.ahour').attr('class','hour');
        lcky = 2; 
      } else {
        $('.ahour').attr('class','hour');
        $("#s_" + clckd).attr('class','ahour');
        lcky = 1;
      }
    } else {
      $(this).attr('class','ahour');
    }
    
    switch (lcky) {
      case 0:
        var ts = $('.ahour').first().data('link'); 
        var te = $('.ahour').last().data('link').replace(/:00/g,":59");
      break;
      case 1: 
        var ts = $('.ahour').first().data('link');
        var te = ts.replace(/:00/g,":59");
      break;
      case 2:
        var ts = "00:00:00";
        var te = "23:59:59";
      break;
    }

    $('#ts_stime').val(ts);
    $('#ts_etime').val(te);
    $('.b_update').click(); 
  });

  // TZ offset
  $(document).on('click', '#ts_utc', function(event) {
    switch ($('#ts_utc:checked').length) {
      case 0:
        $('#ts_offset').val(tzoffset);
        $('#ts_offset').prop('disabled',false);
      break;
      case 1:
        $('#ts_offset').val('+00:00');
        $('#ts_offset').prop('disabled',true);
      break;
    }   
  });

  // Settings
  $(document).on('click', '.cog', function(event) {
    $('.calendar').toggle();
    $('.dt_table').toggle();
  });

  // Input
  $(document).on('keyup', '.dt_input', function() {
    var err = 0;
    var afctd = $(this).attr('id');
    var value = $(this).val();
    var vdate = /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/;
    var vtime = /^([0-1]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
    var vos   = /^(-12:00|-11:00|-10:00|-09:30|-09:00|-08:00|-07:00|-06:00|-05:00|-04:30|-04:00|-03:30|-03:00|-02:00|-01:00|\+00:00|\+01:00|\+02:00|\+03:00|\+03:30|\+04:00|\+04:30|\+05:00|\+05:30|\+05:45|\+06:00|\+06:30|\+07:00|\+08:00|\+08:45|\+09:00|\+09:30|\+10:00|\+10:30|\+11:00|\+11:30|\+12:00|\+12:45|\+13:00|\+14:00)$/;

    // Sanity first
    switch (afctd) {
      case 'ts_sdate': 
        var OK = vdate.exec(value);
        if (!OK) err = 1;
      break;
      case 'ts_edate':
        var OK = vdate.exec(value);
        if (!OK) err = 1;
      break;
      case 'ts_stime':
        var OK = vtime.exec(value);
        if (!OK) err = 1;
      break;
      case 'ts_etime':
        var OK = vtime.exec(value);
        if (!OK) err = 1;
      break;
      case 'ts_offset':
        var OK = vos.exec(value);
        if (!OK) err = 1;
      break;
    }

    if (err == 1) {
      $('#' + afctd).css('color','red');
      $('.dt_error').data('err','1');
      $('.dt_error').show();
    } else {
      $('#' + afctd).css('color','#000');
      $('.dt_error').data('err','0');
      $('.dt_error').hide();
    }

    // Then logic

  });

  // Reset button
  $(document).on('click', '#dt_reset', function(event) {
    $('#ts_sdate').val(yy + "-" + today + "-" + dd);
    $('#ts_edate').val(yy + "-" + today + "-" + dd);
    $('#ts_stime').val('00:00:00');
    $('#ts_etime').val('23:59:59');
    $('#ts_offset').val($('#user_tz').val()); 
    $('.dt_input').css('color','#000');
    $('.dt_error').hide();
  });

  // Space hog. Hide by default.
  $('.content-right,.rl').css('margin-top','15px');
  $('.content-left').css('top','58px'); 

  // Show/Hide calendar
  $(document).on('click', '.ctt', function(event) {
    var state = $('#cal').css('display');
    switch (state) {
      case 'block':
        $('#cal').hide();
        $('.content-right,.rl').css('margin-top','15px');
        $('.content-left').css('top','58px');
      break;
      default:
        $('#cal').show();
        $('.content-right,.rl').css('margin-top','69px');
        $('.content-left').css('top','113px');
      break;
    }
  });

  //   
  // Begin
  //

  // Base date and today
  var baseDate = new Date();
  var td = new Date();
  var yy = td.getFullYear();
  var mm = td.getMonth();
  var dd = td.getDate();
  var tz = baseDate.getTimezoneOffset() / 60; 
  var tzs = tz.toString();
  var tzoffset = $('#user_tz').val();
  var tzpre = '-';

  // Check prefix
  if (tzs[0] == '-') {
    tzpre = '+';
    tz = tz * -1;
  }

  // Check for remainder
  if (tz % 1 != 0) {
    var tzh = tz.toString().split('.')[0];
    var tzm = tz.toString().split('.')[1];
    if (tzh.length == 1) tzh = "0" + tzh;
    switch (tzm) {
      case  "5": tzm = "30"; break;
      case "75": tzm = "45"; break;
    } 
    tzoffset = tzpre + tzh + ":" + tzm;   
  } else {
    if (tzs.length == 1) tz = "0" + tz;
    tzoffset = tzpre + tz + ":00";
  }
 
  // Date parts
  var baseYear    = baseDate.getFullYear();
  var baseMonthN  = baseDate.getMonth(); 
  var baseMonthS  = strMonths[baseDate.getMonth()];

  html = "<table class=calendar cellpadding=0 cellspacing=0><tr class=months>";

  // Create month and year links
  for (var n = 0; n <= 11; n++) {
    var month = strMonths[n];
    var link = n + 1;
    if(link < 10) link = "0" + link; 

    var mC = "month";

    if (month == baseMonthS) {
      mC = "amonth";
      today = link;
    }
        
    if (n > mm) mC = "dmonth";

    if (n == 0) {
      previousYear = baseYear - 1;
      pyL = previousYear;
      html += "<td id=py class=month data-type=py data-link=\"" + pyL + "\">&lt; " + pyL + "</td>";
    }

    html += "<td class=\"" + mC + "\" data-val=\"" + n + "\" data-type=m data-link=\"" + link + "\">" + month.substring(0,3) +"</td>";

    if (n == 11) {
      nextYear = baseYear + 1;
      nyL = nextYear;
      mC = "dmonth";
      if (yy > baseYear) mC = "month";
      html += "<td id=ny class=\"" + mC + "\" data-type=ny data-link=\"" + nyL + "\">" + nyL + " &gt;</td>";
      html += "<td class=cog><img class=il src=.css/lr.png></td>"
    }
  }

  html += "</tr></table>";
  html += "<table class=calendar cellpadding=0 cellspacing=0><tr class=days></tr></table>";
  html += "<table class=calendar cellpadding=0 cellspacing=0><tr class=hours></tr></table>"; 

  $('#cal').prepend(html);
  // Create day links
  if (dd < 10) dd = "0" + dd;
  createDays(yy,baseMonthN + 1,dd);
  createHours();
  createControls();
  createClocks();
  $('#ts_sdate').val(yy + "-" + today + "-" + dd);
  $('#ts_sdate').data('today',yy + "-" + today + "-" + dd);
  $('#ts_edate').val(yy + "-" + today + "-" + dd);
  $('#ts_stime').val('00:00:00');
  $('#ts_etime').val('23:59:59');
  $('#ts_offset').val($('#user_tz').val());
});
