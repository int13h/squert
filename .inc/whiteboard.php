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


    echo "<html>
          <head>
          <script type=\"text/javascript\" src=\"../.js/RGraph/libraries/RGraph.common.core.js\" ></script>
          <script type=\"text/javascript\" src=\"../.js/RGraph/libraries/RGraph.bar.js\" ></script>
          <script type=\"text/javascript\" src=\"../.js/RGraph/libraries/RGraph.common.context.js\" ></script>
          <script type=\"text/javascript\" src=\"../.js/RGraph/libraries/RGraph.common.annotate.js\"></script>
          </head>
          <body style=\"background: #ffffff; margin: 0 auto; padding: none;\">
          <canvas id=\"mrwhite\" width=\"1000\" height=\"800\" style=\"background: #ffffff;\">[No canvas support]
          testing
          </canvas>
          <script>
          function doBoard() {
            bar = new RGraph.Bar('mrwhite', []);
            bar.Set('chart.background.grid', false);
            bar.Set('chart.noaxes', true);
            bar.Set('chart.ylabels', false);
            bar.Set('chart.xlabels', false);
            bar.Set('chart.gutter.left', '0');
            bar.Set('chart.gutter.right', '0');
            bar.Set('chart.gutter.top', '0');
            bar.Set('chart.gutter.bottom', '0');
            bar.Set('chart.annotatable', true);
            bar.Set('chart.contextmenu', [['Show palette', RGraph.Showpalette], ['Clear', function () {RGraph.Clear(bar.canvas); bar.Draw();}]]);
            bar.Draw();

            var b_canvas = document.getElementById(\"mrwhite\");
            var b_context = b_canvas.getContext(\"2d\");            
            b_context.font = \"1em calibri, trebuchet ms, helvetica\";
            b_context.fillStyle = \"#c9c9c9\";
            b_context.fillText(\"this is not ready yet\", 400, 20);            
          }
          doBoard();
          </script>
          </body>
          </html>";

?>

