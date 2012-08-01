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
<script type="text/javascript" src=".js/squert.js"></script>
<script type="text/javascript" src=".js/sorttable.js"></script>
<script type="text/javascript" src=".js/worldmap.js"></script>
<script type="text/javascript" src="/.js/RGraph/libraries/RGraph.common.core.js" ></script>
<script type="text/javascript" src="/.js/RGraph/libraries/RGraph.bar.js" ></script>
<script type="text/javascript" src="/.js/RGraph/libraries/RGraph.pie.js" ></script>
<script type="text/javascript" src="/.js/RGraph/libraries/RGraph.scatter.js" ></script>
<script type="text/javascript" src="/.js/RGraph/libraries/RGraph.common.context.js" ></script>
<script type="text/javascript" src="/.js/RGraph/libraries/RGraph.common.tooltips.js"></script>
<script type="text/javascript" src="/.js/RGraph/libraries/RGraph.common.zoom.js"></script>
<script type="text/javascript" src="/.js/RGraph/libraries/RGraph.common.key.js"></script>
<script type="text/javascript" src="/.js/RGraph/libraries/RGraph.common.dynamic.js"></script>
<script type="text/javascript" src="/.js/RGraph/libraries/RGraph.common.effects.js"></script>
<title>squert</title>
</head>
<body>
<div id=tab_group class=tab_group>
<div id=t_dash class=tab>Dashboard</div>
<div id=t_sum class=tab>Events</div>
<div id=t_map class=tab>Map</div>

<div id=t_usr class=user>Welcome&nbsp;&nbsp;<b><?php echo $sUser;?></b>&nbsp;&nbsp;|<span id=settings class=links>Watchlist</span>|<span id=settings class=links>Settings</span>|<span id=logout class=links>Logout</span></div>
<form name=squert id=squert method=post action="<?php echo "index.php?id=$id&s=$s&e=$e";?>">
<div id=t_search class=search><span id=settings class=links>Saved</span>|<span id=live_search class=links_enabled>Live</span>|&nbsp;&nbsp;Search:&nbsp;<input class=search id=search type=text size=50 maxlength=1000><span id=clear_search class=clear>&nbsp;&#x21BA;</span>
</div>
</form>
<?php echo $timeLinks;?>
</div>
<br>

<div id=t_dash_content class=content>
<table width=970 align=center><tr><td>
<h3>Events grouped by minute</h3>
<?php include_once '.charts/sensor-dist.php';?>
<h3>Top source and destination IPs</h3>
<?php include_once '.charts/ip.php';?>
<h3>Top source and destination Countries</h3>
<?php include_once '.charts/country.php';?>
</td></tr></table>
</div>

<div id=t_sum_content class=content>
<table width=970 align=center><tr><td>
<?php echo $todayLink;?><br>
<?php include_once '.stub/brief.php';?>
<?php include_once '.stub/signature.php';?>
</td></tr></table>
</div>
<br>

<div id=t_map_content class=content>
<div class=wm>
<?php include_once '.stub/map.php';?>
</div>
</div>

<div id=debug class=debug>
</div>

<div id=set_content class=content>
<span id=set_close>Settings</span>
</div>

<div id=bottom class=bottom>
<div id=b_tray class=b_tray><b>Hidden:</b> <span id=tray_empty>&nbsp;None</span>&nbsp;&nbsp;</div>
<div id=b_event class=b_event><b>Events:</b> &nbsp;synchronized</div>
<div id=b_update class=b_update>update</div>
<div id=b_top class=b_top>top</div>
</div>

<input id=timestamp type=hidden value="<?php echo strtohex($when);?>" />
<input id=sel_ec type=hidden value="0" />
<input id=sel_class type=hidden value="-1" />
<input id=sel_sensor type=hidden value="-1" />
<input id=sel_tab type=hidden value="<?php echo $_SESSION['sTab'];?>" />
<input id=sel_sect type=hidden value="<?php echo $_SESSION['sSect'];?>" />
<input id=sel_search type=hidden value="1" />
</body>
</html>
<?php $_SESSION['LAST_ACTIVITY'] = time();?>
