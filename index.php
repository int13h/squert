<?php

//
//
//      Copyright (C) 2012 Paul Halliday <paul.halliday@gmail.com>
//
//      This program is free software: you can redistribute it and/or modify
//      it under the terms of the GNU General Public License as published by
//      the Free Software Foundation, either version 3 of the License, or
//      (at your option) any later version.
//
//      This program is distributed in the hope that it will be useful,
//      but WITHOUT ANY WARRANTY; without even the implied warranty of
//      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//      GNU General Public License for more details.
//
//      You should have received a copy of the GNU General Public License
//      along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//

include_once '.inc/session.php';
include_once '.inc/config.php';
include_once '.inc/functions.php';
include_once '.inc/countries.php';

dbC();
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
   "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
<meta content="utf-8" http-equiv="encoding">
<link rel="stylesheet" type="text/css" href=".css/squert.css" />
<link rel="stylesheet" type="text/css" href=".css/cal.css" />
<link rel="stylesheet" type="text/css" href=".css/jquery-jvectormap-1.2.2.css" />
<link rel="stylesheet" type="text/css" href=".css/charts.css" />
<script type="text/javascript" src=".js/jq.js"></script>
<script type="text/javascript" src=".js/jquery.tablesorter.min.js"></script>
<script type="text/javascript" src=".js/cal.js"></script>
<script type="text/javascript" src=".js/squert.js"></script>
<script type="text/javascript" src=".js/charts.js"></script>
<script type="text/javascript" src=".js/jquery-jvectormap-1.2.2.min.js"></script>
<script type="text/javascript" src=".js/jquery-jvectormap-world-mill-en.js"></script>
<script type="text/javascript" src=".js/d3/d3.v3.min.js"></script>
<script type="text/javascript" src=".js/d3/sankey.js"></script>

<title>squert</title>
</head>
<body>
<div id=tab_group class=tab_group>
  <div id=t_dash class=tab>Dashboard</div>
  <div id=t_sum class=tab>Events</div>
  <div id=t_usr class=user data-c_usr=<?php echo $sUser;?>>
    Welcome&nbsp;&nbsp;<b><?php echo $sUser;?></b>&nbsp;&nbsp;|&nbsp;&nbsp;<span class=rt_time><?php echo date(DATE_RFC822);?></span>&nbsp;&nbsp;|&nbsp;&nbsp;<span id=logout class=links>Logout</span>
  </div>
  <div id=t_search class=search>
    <div id=comments class=button>comments</div>
    <div id=sensors class=button>sensors</div>
    <div id=filters class=button>filters</div>
    <input class=search id=search type=text size=60 maxlength=1000><span id=clear_search class=clear>&#x21BA;</span>
  </div>
  <div id=cal></div>
  <div class=timeline></div>
</div>

<div class=lr>
  <div class=content-left>

    <div class=event_cont_bar>
      <div class=label_l><span class=ec_label>Toggle</span></div>
      <div class=label>Event Queue Only:</div><div id=rt class=tvalue_off>off</div>
      <div class=label>Event Grouping:</div><div id=menu1 class=tvalue_on>on</div>
      <div class=label>Map:</div><div id=menu2 class=tvalue_off>off</div>
    </div>

    <div class=event_cont>
      <div class=label_l><span class=ec_label>Event Summary</span></div>
      <div class=label>Queued Events:</div><div id=qtotal class=value>-</div>
      <div class=label>Total Events:</div><div id=etotal class=value>-</div>
      <div class=label>Total Signatures:</div><div id=esignature class=value>-</div>
      <div class=label>Total Sources:</div><div id=esrc class=value>-</div>
      <div class=label>Total Destinations:</div><div id=edst class=value>-</div>
    </div>

    <div class=event_cont>
      <div class=label_l><span class=ec_label>Event Count by Classification</span></div>

      <div id=b_class-11 class=label_c data-c=11 data-cn=C1 title='Unauthorized Admin Access (F1)'>
      <div class=b_C1></div>Admin Access:</div><div id=c-11 class=value>-</div>

      <div id=b_class-12 class=label_c data-c=12 data-cn=C2 title='Unauthorized User Access (F2)'>
      <div class=b_C2></div>User Access:</div><div id=c-12 class=value>-</div>
      
      
      <div id=b_class-13 class=label_c data-c=13 data-cn=C3 title='Attempted Unauthorized Access (F3)'>
      <div class=b_C3></div>Attempted Access:</div><div id=c-13 class=value>-</div>

      <div id=b_class-14 class=label_c data-c=14 data-cn=C4 title='Denial of Service Attack (F4)'>
      <div class=b_C4></div>Denial of Service:</div><div id=c-14 class=value>-</div>
      
      
      <div id=b_class-15 class=label_c data-c=15 data-cn=C5 title='Policy Violation (F5)'>
      <div class=b_C5></div>Policy Violation</div><div id=c-15 class=value>-</div>

      <div id=b_class-16 class=label_c data-c=16 data-cn=C6 title='Reconnaissance (F6)'>
      <div class=b_C6></div>Reconnaissance:</div><div id=c-16 class=value>-</div>
      
      <div id=b_class-17 class=label_c data-c=17 data-cn=C7 title='Malware (F7)'>
      <div class=b_C7></div>Malware:</div><div id=c-17 class=value>-</div>

      <div id=b_class-1 class=label_c data-c=1 data-cn=NA title='No Further Action Required (F8)'>
      <div class=b_NA></div>No Action Req&#x2019;d.:</div><div id=c-1 class=value>-</div>
      
      <div id=b_class-2 class=label_c data-c=2 data-cn=ES title='Escalate Event (F9)'>
      <div class=b_ES></div>Escalated Event:</div><div id=c-2 class=value>-</div>
    </div>

    <div class=event_cont>
      <div class=label_l><span class=ec_label>Event Count by Priority</span></div>
      <div class=label>High:</div><div id=pr_1 class=value>-</div>
      <div class=label>Medium:</div><div id=pr_2 class=value>-</div>
      <div class=label>Low:</div><div id=pr_3 class=value>-</div>
      <div class=label>Other:</div><div id=pr_4 class=value>-</div>   
    </div>

    <div class=event_cont>
      <div class=label_l><span class=ec_label>History</span>
        <img title="Click to expand" id=pi class=pop src=.css/po.png>
      </div>
      <div id=h_box class=h_box></div>
    </div>

  </div>  

  <div class=content-right>
    <div id=t_dash_content class=content>
      <table width=100% align=left><tr><td>
      <h3>Events grouped by minute and hour</h3>
      <h3>Top signatures</h3>
      <h3>Top source and destination IPs</h3>
      <h3>Top source and destination Countries</h3>
      </td></tr></table>
    </div>

    <div id=t_sum_content class=content>
      <div id=aaa-00 class=aaa></div></div>
      <br><br><br>
    </div>
  </div>
</div>

<div class=cat_box>
  <div class=cat_top>Add a comment to the selected events: <input class=cat_msg_txt type=text maxlength=255>
    <div title="close" class="cat_close">x</div>
  </div>
  <div class=cm_tbl></div>
</div>

<div class=sen_box>
  <div class=sen_top>
    <div title=close class=sen_close>x</div>
  </div>
  <div class=sen_tbl></div>
</div>

<div class=fltr_box>
  <div class=fltr_top>
    <div title=close class=filter_close>x</div>
    <div title=add class=filter_new>+</div>
    <div title=refresh class=filter_refresh>&#x21BA;</div>
    <div title=help class=filter_help>?</div>
  </div>
  <div class=fltr_tbl></div>
</div>

<div class=bottom>
  <div class=b_tray><span id=loader class=loader>Working <img class=ldimg src=".css/load.gif"></span></div>
  <div class=b_class><span class=class_msg></span>&nbsp;</div>
  <div class=b_update>update</div>
</div>

<input id=event_sort type=hidden value="DESC">
<input id=event_sum type=hidden value="0">
<input id=cat_sum type=hidden value="0">
<input id=sel_tab type=hidden value="<?php echo $_SESSION['sTab'];?>">
</body>
</html>
