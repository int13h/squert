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
include_once '.inc/ribbon.php';
include_once '.inc/countries.php';

$loFilter = "";
dbC();
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
   "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
<meta content="utf-8" http-equiv="encoding">
<link rel="stylesheet" type="text/css" href=".css/squert.css" />
<script type="text/javascript" src=".js/jq.js"></script>
<script type="text/javascript" src=".js/jquery.tablesorter.min.js"></script>
<script type="text/javascript" src=".js/squert.js"></script>
<script type="text/javascript" src=".js/charts.js"></script>
<script type="text/javascript" src=".js/worldmap.js"></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.core.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.bar.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.pie.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.scatter.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.context.js" ></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.tooltips.js"></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.zoom.js"></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.key.js"></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.dynamic.js"></script>
<script type="text/javascript" src=".js/RGraph/libraries/RGraph.common.effects.js"></script>
<title>squert</title>
</head>
<body>
<div class=upper>
<div id=tab_group class=tab_group>
<div id=t_dash class=tab>Dashboard</div>
<div id=t_sum class=tab>Events</div>

<div id=t_usr class=user data-c_usr=<?php echo $sUser;?>>Welcome&nbsp;&nbsp;<b><?php echo $sUser;?></b>&nbsp;&nbsp;|<span id=logout class=links>Logout</span></div>
<div id=t_search class=search><div id=filters class=filter_show>filter</div><input class=search id=search type=text size=50 maxlength=1000>&nbsp;<span id=clear_search class=clear>&#x21BA;</span>
</div>
<?php echo $timeLinks;?>
</div>
<div class=quick>
<div class=menu_rt title="Queue">RT</div><div class=input_quick><input type="checkbox" id=rt></div>
<div class=menu id=menu1>ungroup events</div><div class=menu id=menu2>create chart</div><div class=menu id=menu3>create map</div></div>
</div>
<div id=t_dash_content class=content>
<table width=970 align=center><tr><td>
<h3>Events grouped by minute and hour</h3>
<?php include_once '.charts/interval.php';?>
<h3>Top signatures</h3>
<?php include_once '.charts/sigsum.php';?>
<h3>Top source and destination IPs</h3>
<?php include_once '.charts/ip.php';?>
<h3>Top source and destination Countries</h3>
<?php include_once '.charts/country.php';?>
</td></tr></table>
</div>
<div id=t_sum_content class=content>
<br><div id=usr_filters></div><br>
<br><div id=aaa-00 class=aaa></div><br><br><br>
</div>
<div class=cat_box>
<div class=cat_ct><div id=b_class-0 class=b_RT title='Awaiting Review'>RT</div>
<div class=cat_val>0</div></div>
<div class=cat_ct><div id=b_class-11 class=b_C1 title='Unauthorized Admin Access'>C1</div>
<div class=cat_val>0</div></div>
<div class=cat_ct><div id=b_class-12 class=b_C2 title='Unauthorized User Access'>C2</div>
<div class=cat_val>0</div></div>
<div class=cat_ct><div id=b_class-13 class=b_C3 title='Attempted Unauthorized Access'>C3</div>
<div class=cat_val>0</div></div>
<div class=cat_ct><div id=b_class-14 class=b_C4 title='Denial of Service Attack'>C4</div>
<div class=cat_val>0</div></div>
<div class=cat_ct><div id=b_class-15 class=b_C5 title='Policy Violation'>C5</div>
<div class=cat_val>0</div></div>
<div class=cat_ct><div id=b_class-16 class=b_C6 title='Reconnaissance'>C6</div>
<div class=cat_val>0</div></div>
<div class=cat_ct><div id=b_class-17 class=b_C7 title='Malware'>C7</div>
<div class=cat_val>0</div></div>
<div class=cat_ct><div id=b_class-1  class=b_NA title='No Action Req&#x2019;d.'>NA</div>
<div class=cat_val>0</div></div>
<div class=cat_ct><div id=b_class-2  class=b_ES title='Escalate Event'>ES</div>
<div class=cat_val>0</div></div>
<div class=cat_ct><div class=b_ME title='Add Message'>M+</div>
<div class=cat_val>Add Message</div></div>
<div class=cat_ct><div class=b_EX title='Expand'>&#8592;</div>
<div class=cat_val>Collapse</div></div>
</div>
<div class=cat_msg>
Add a message to the selected events:
<input class=cat_msg_txt type=text maxlength=255><div class=cat_msg_add>CANCEL</div></div>
<div id=bottom class=bottom>
<div id=b_tray class=b_tray><span id=loader class=loader>Working <img class=ldimg src=".css/load.gif"></span></div>
<div id=b_class class=b_class><span class=class_msg></span>&nbsp;</div>
<div id=b_event class=b_event></div>
<div id=b_update class=b_update>update</div>
<div id=b_top class=b_top>top</div>
</div>

<input id=timestamp type=hidden value="<?php echo strtohex($when);?>">
<input id=sel_ec type=hidden value="0">
<input id=sel_class type=hidden value="-1">
<input id=sel_sensor type=hidden value="-1">
<input id=sel_tab type=hidden value="<?php echo $_SESSION['sTab'];?>">
<input id=sel_idlist type=hidden value="">
</body>
</html>
<?php $_SESSION['LAST_ACTIVITY'] = time();?>
