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
<link rel="stylesheet" type="text/css" href=".css/squert.css" />
<script type="text/javascript" src=".js/jq.js"></script>
<script type="text/javascript" src=".js/jquery.tablesorter.js"></script>
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
<form name=squert id=squert method=post action="<?php echo "index.php?id=$id&s=$s&e=$e";?>">
<div id=tab_group class=tab_group>
<div id=t_dash class=tab>Dashboard</div>
<div id=t_sum class=tab>Events</div>

<div id=t_usr class=user data-c_usr=<?php echo $sUser;?>>Welcome&nbsp;&nbsp;<b><?php echo $sUser;?></b>&nbsp;&nbsp;|<span id=logout class=links>Logout</span></div>
<div id=t_search class=search><span id=filters class=links>Filter:</span></span>&nbsp;<input class=search id=search type=text size=50 maxlength=1000><span id=clear_search class=clear>&nbsp;&#x21BA;</span>
</div>
</form>
<?php echo $timeLinks;?>
</div></div>
<br>
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
<br><div id=aaa-00 class=aaa></div><br>
</div>

<div id=debug class=debug>
</div>

<div id=set_content class=content>
<span id=set_close>Settings</span>
</div>

<div id=bottom class=bottom>
<div id=b_tray class=b_tray></span><span id=b_tray_items><span></div>
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
