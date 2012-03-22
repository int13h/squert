<?php

//
//
//      Copyright (C) 2010 Paul Halliday <paul.halliday@gmail.com>
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

$scc = "SELECT COUNT(src_ip) as count, map1.cc as src_cc, map1.c_long
          FROM event
          LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip   
          LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip   
          WHERE $when[0]
          AND signature NOT REGEXP '^URL'
          AND src_ip NOT BETWEEN 167772160 AND 184549375  
          AND src_ip NOT BETWEEN 2886729728 AND 2886795263
          AND src_ip NOT BETWEEN 3232235520 AND 3232301055
          AND map1.cc IS NOT NULL
          GROUP BY map1.cc
          ORDER BY count DESC";
$dcc = "SELECT COUNT(dst_ip) as count, map2.cc as dst_cc, map2.c_long
          FROM event
          LEFT JOIN mappings AS map1 ON event.src_ip = map1.ip
          LEFT JOIN mappings AS map2 ON event.dst_ip = map2.ip
          WHERE $when[0]
          AND signature NOT REGEXP '^URL'
          AND dst_ip NOT BETWEEN 167772160 AND 184549375
          AND dst_ip NOT BETWEEN 2886729728 AND 2886795263
          AND dst_ip NOT BETWEEN 3232235520 AND 3232301055
          AND map2.cc IS NOT Null
          GROUP BY map2.cc
          ORDER BY count DESC";


$sccQuery = mysql_query($scc);
$dccQuery = mysql_query($dcc);
doWorld($sccQuery,$dccQuery);
?>
