7    /**
    * o------------------------------------------------------------------------------o
    * | This file is part of the RGraph package - you can learn more at:             |
    * |                                                                              |
    * |                          http://www.rgraph.net                               |
    * |                                                                              |
    * | This package is licensed under the RGraph license. For all kinds of business |
    * | purposes there is a small one-time licensing fee to pay and for non          |
    * | commercial  purposes it is free to use. You can read the full license here:  |
    * |                                                                              |
    * |                      http://www.rgraph.net/LICENSE.txt                       |
    * o------------------------------------------------------------------------------o
    */
    
    if (typeof(RGraph) == 'undefined') RGraph = {};

    /**
    * The gantt chart constructor
    * 
    * @param object canvas The cxanvas object
    * @param array  data   The chart data
    */
    RGraph.Gantt = function (id)
    {
        // Get the canvas and context objects
        this.id      = id;
        this.canvas  = document.getElementById(id);
        this.context = this.canvas.getContext("2d");
        this.canvas.__object__ = this;
        this.type              = 'gantt';
        this.isRGraph          = true;


        /**
        * Compatibility with older browsers
        */
        RGraph.OldBrowserCompat(this.context);

        
        // Set some defaults
        this.properties = {
            'chart.background.barcolor1':   'white',
            'chart.background.barcolor2':   'white',
            'chart.background.grid':        true,
            'chart.background.grid.width':  1,
            'chart.background.grid.color':  '#ddd',
            'chart.background.grid.hsize':  20,
            'chart.background.grid.vsize':  20,
            'chart.background.grid.hlines': true,
            'chart.background.grid.vlines': true,
            'chart.background.grid.border': true,
            'chart.background.grid.autofit':false,
            'chart.background.grid.autofit.numhlines': 7,
            'chart.background.grid.autofit.numvlines': 20,
            'chart.background.vbars':       [],
            'chart.text.size':              10,
            'chart.text.font':              'Verdana',
            'chart.text.color':             'black',
            'chart.gutter.left':            75,
            'chart.gutter.right':           25,
            'chart.gutter.top':             35,
            'chart.gutter.bottom':          25,
            'chart.labels':                 [],
            'chart.margin':                 2,
            'chart.title':                  '',
            'chart.title.background':       null,
            'chart.title.hpos':             null,
            'chart.title.vpos':             null,
            'chart.title.yaxis':            '',
            'chart.title.yaxis.pos':        this.canvas.width - 12.5,
            'chart.title.yaxis.position':   'right',
            'chart.events':                 [],
            'chart.borders':                true,
            'chart.defaultcolor':           'white',
            'chart.coords':                 [],
            'chart.tooltips':               [],
            'chart.tooltips.effect':         'fade',
            'chart.tooltips.css.class':      'RGraph_tooltip',
            'chart.tooltips.highlight':     true,
            'chart.highlight.stroke':       'black',
            'chart.highlight.fill':         'rgba(255,255,255,0.5)',
            'chart.xmin':                   0,
            'chart.xmax':                   0,
            'chart.contextmenu':            null,
            'chart.annotatable':            false,
            'chart.annotate.color':         'black',
            'chart.zoom.factor':            1.5,
            'chart.zoom.fade.in':           true,
            'chart.zoom.fade.out':          true,
            'chart.zoom.hdir':              'right',
            'chart.zoom.vdir':              'down',
            'chart.zoom.frames':            10,
            'chart.zoom.delay':             50,
            'chart.zoom.shadow':            true,
            'chart.zoom.mode':              'canvas',
            'chart.zoom.thumbnail.width':   75,
            'chart.zoom.thumbnail.height':  75,
            'chart.zoom.background':        true,
            'chart.zoom.action':            'zoom',
            'chart.resizable':              false,
            'chart.resize.handle.adjust':   [0,0],
            'chart.resize.handle.background': null,
            'chart.adjustable':             false
        }
    }


    /**
    * A peudo setter
    * 
    * @param name  string The name of the property to set
    * @param value mixed  The value of the property
    */
    RGraph.Gantt.prototype.Set = function (name, value)
    {
        this.properties[name.toLowerCase()] = value;
    }


    /**
    * A peudo getter
    * 
    * @param name  string The name of the property to get
    */
    RGraph.Gantt.prototype.Get = function (name)
    {
        return this.properties[name.toLowerCase()];
    }

    
    /**
    * Draws the chart
    */
    RGraph.Gantt.prototype.Draw = function ()
    {
        /**
        * Fire the onbeforedraw event
        */
        RGraph.FireCustomEvent(this, 'onbeforedraw');

        /**
        * Clear all of this canvases event handlers (the ones installed by RGraph)
        */
        RGraph.ClearEventListeners(this.id);
        
        /**
        * This is new in May 2011 and facilitates indiviual gutter settings,
        * eg chart.gutter.left
        */
        this.gutterLeft   = this.Get('chart.gutter.left');
        this.gutterRight  = this.Get('chart.gutter.right');
        this.gutterTop    = this.Get('chart.gutter.top');
        this.gutterBottom = this.Get('chart.gutter.bottom');

        /**
        * Work out the graphArea
        */
        this.graphArea     = RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight;
        this.graphHeight   = RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom;
        this.numEvents     = this.Get('chart.events').length
        this.barHeight     = this.graphHeight / this.numEvents;
        this.halfBarHeight = this.barHeight / 2;

        /**
        * Draw the background
        */
        RGraph.background.Draw(this);
        
        /**
        * Draw a space for the left hand labels
        */
        //this.context.beginPath();
            //this.context.lineWidth   = 1;
            //this.context.strokeStyle = this.Get('chart.background.grid.color');
            //this.context.fillStyle   = 'white';
            //this.context.fillRect(0,gutter - 5,gutter * 3, RGraph.GetHeight(this) - (2 * gutter) + 10);
            //this.context.moveTo(gutter * 3, gutter);
            //this.context.lineTo(gutter * 3, RGraph.GetHeight(this) - gutter);
        //this.context.stroke();
        //this.context.fill();
        
        /**
        * Draw the labels at the top
        */
        this.DrawLabels();
        
        /**
        * Draw the events
        */
        this.DrawEvents();
        
        
        /**
        * Setup the context menu if required
        */
        if (this.Get('chart.contextmenu')) {
            RGraph.ShowContext(this);
        }
        
        /**
        * If the canvas is annotatable, do install the event handlers
        */
        if (this.Get('chart.annotatable')) {
            RGraph.Annotate(this);
        }
        
        /**
        * This bit shows the mini zoom window if requested
        */
        if (this.Get('chart.zoom.mode') == 'thumbnail' || this.Get('chart.zoom.mode') == 'area') {
            RGraph.ShowZoomWindow(this);
        }

        
        /**
        * This function enables resizing
        */
        if (this.Get('chart.resizable')) {
            RGraph.AllowResizing(this);
        }


        /**
        * This function enables adjusting
        */
        if (this.Get('chart.adjustable')) {
            RGraph.AllowAdjusting(this);
        }


        /**
        * Fire the RGraph ondraw event
        */
        RGraph.FireCustomEvent(this, 'ondraw');
    }

    
    /**
    * Draws the labels at the top and the left of the chart
    */
    RGraph.Gantt.prototype.DrawLabels = function ()
    {
        this.context.beginPath();
        this.context.fillStyle = this.Get('chart.text.color');

        /**
        * Draw the X labels at the top of the chart.
        */
        var labelSpace = (this.graphArea) / this.Get('chart.labels').length;
        var xPos       = this.gutterLeft + (labelSpace / 2);
        this.context.strokeStyle = 'black'

        for (i=0; i<this.Get('chart.labels').length; ++i) {
            RGraph.Text(this.context,this.Get('chart.text.font'),this.Get('chart.text.size'),xPos + (i * labelSpace),this.gutterTop - (this.Get('chart.text.size') / 2) - 5,String(this.Get('chart.labels')[i]),'center','center');
        }
        
        // Draw the vertical labels
        for (i=0; i<this.Get('chart.events').length; ++i) {
            var ev = this.Get('chart.events')[i];
            var x  = this.gutterLeft;
            var y  = this.gutterTop + this.halfBarHeight + (i * this.barHeight);

            RGraph.Text(this.context, this.Get('chart.text.font'), this.Get('chart.text.size'), x - 5, y, String(ev[3]), 'center', 'right');
        }
    }
    
    /**
    * Draws the events to the canvas
    */
    RGraph.Gantt.prototype.DrawEvents = function ()
    {
        var canvas  = this.canvas;
        var context = this.context;
        var events  = this.Get('chart.events');

        /**
        * Reset the coords array to prevent it growing
        */
        this.coords = [];

        /**
        * First draw the vertical bars that have been added
        */
        if (this.Get('chart.vbars')) {
            for (i=0; i<this.Get('chart.vbars').length; ++i) {
                // Boundary checking
                if (this.Get('chart.vbars')[i][0] + this.Get('chart.vbars')[i][1] > this.Get('chart.xmax')) {
                    this.Get('chart.vbars')[i][1] = 364 - this.Get('chart.vbars')[i][0];
                }
    
                var barX   = this.gutterLeft + (( (this.Get('chart.vbars')[i][0] - this.Get('chart.xmin')) / (this.Get('chart.xmax') - this.Get('chart.xmin')) ) * this.graphArea);

                var barY   = this.gutterTop;
                var width  = (this.graphArea / (this.Get('chart.xmax') - this.Get('chart.xmin')) ) * this.Get('chart.vbars')[i][1];
                var height = RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom;
                
                // Right hand bounds checking
                if ( (barX + width) > (RGraph.GetWidth(this) - this.gutterRight) ) {
                    width = RGraph.GetWidth(this) - this.gutterRight - barX;
                }
    
                context.fillStyle = this.Get('chart.vbars')[i][2];
                context.fillRect(barX, barY, width, height);
            }
        }


        /**
        * Draw the events
        */
        for (i=0; i<events.length; ++i) {
            
            var ev  = events[i];
            var min = this.Get('chart.xmin');

            context.beginPath();
            context.strokeStyle = 'black';
            context.fillStyle = ev[4] ? ev[4] : this.Get('chart.defaultcolor');

            var barStartX  = this.gutterLeft + (((ev[0] - min) / (this.Get('chart.xmax') - min)) * this.graphArea);
            //barStartX += this.margin;
            var barStartY  = this.gutterTop + (i * this.barHeight);
            var barWidth   = (ev[1] / (this.Get('chart.xmax') - min) ) * this.graphArea;

            /**
            * If the width is greater than the graph atrea, curtail it
            */
            if ( (barStartX + barWidth) > (RGraph.GetWidth(this) - this.gutterRight) ) {
                barWidth = RGraph.GetWidth(this) - this.gutterRight - barStartX;
            }

            /**
            *  Draw the actual bar storing store the coordinates
            */
            this.coords.push([barStartX, barStartY + this.Get('chart.margin'), barWidth, this.barHeight - (2 * this.Get('chart.margin'))]);
            context.fillRect(barStartX, barStartY + this.Get('chart.margin'), barWidth, this.barHeight - (2 * this.Get('chart.margin')) );

            // Work out the completeage indicator
            var complete = (ev[2] / 100) * barWidth;

            // Draw the % complete indicator. If it's greater than 0
            if (typeof(ev[2]) == 'number') {
                context.beginPath();
                context.fillStyle = ev[5] ? ev[5] : '#0c0';
                context.fillRect(barStartX,
                                      barStartY + this.Get('chart.margin'),
                                      (ev[2] / 100) * barWidth,
                                      this.barHeight - (2 * this.Get('chart.margin')) );
                
                context.beginPath();
                context.fillStyle = this.Get('chart.text.color');
                RGraph.Text(context, this.Get('chart.text.font'), this.Get('chart.text.size'), barStartX + barWidth + 5, barStartY + this.halfBarHeight, String(ev[2]) + '%', 'center');
            }

            // draw the border around the bar
            if (this.Get('chart.borders') || events[i][6]) {
                context.strokeStyle = typeof(events[i][6]) == 'string' ? events[i][6] : 'black';
                context.lineWidth = (typeof(events[i][7]) == 'number' ? events[i][7] : 1);
                context.beginPath();
                context.strokeRect(barStartX, barStartY + this.Get('chart.margin'), barWidth, this.barHeight - (2 * this.Get('chart.margin')) );
            }
        }


        /**
        * If tooltips are defined, handle them
        */
        if (this.Get('chart.tooltips')) {

            // Register the object for redrawing
            RGraph.Register(this);

            /**
            * If the cursor is over a hotspot, change the cursor to a hand
            */
            var canvas_onmousemove_func = function (eventObj)
            {
                eventObj = RGraph.FixEventObject(eventObj);
                var canvas = eventObj.target;
                var obj    = canvas.__object__;
                var len    = obj.coords.length;

                /**
                * Get the mouse X/Y coordinates
                */
                var mouseCoords = RGraph.getMouseXY(eventObj);

                /**
                * Loop through the bars determining if the mouse is over a bar
                */
                for (var i=0; i<len; i++) {

                    var mouseX = mouseCoords[0];  // In relation to the canvas
                    var mouseY = mouseCoords[1];  // In relation to the canvas
                    var left   = obj.coords[i][0];
                    var top    = obj.coords[i][1];
                    var width  = obj.coords[i][2];
                    var height = obj.coords[i][3];

                    if (   mouseX >= left
                        && mouseX <= (left + width)
                        && mouseY >= top
                        && mouseY <= (top + height)
                        && (typeof(obj.Get('chart.tooltips')) == 'function' || obj.Get('chart.tooltips')[i]) ) {

                        canvas.style.cursor = 'pointer';
                        return;
                    }
                }

                canvas.style.cursor = 'default';
            }
            this.canvas.addEventListener('mousemove', canvas_onmousemove_func, false);
            RGraph.AddEventListener(this.id, 'mousemove', canvas_onmousemove_func);


            var canvas_onclick_func = function (eventObj)
            {
                eventObj = RGraph.FixEventObject(eventObj);

                var canvas  = eventObj.target;
                var context = canvas.getContext('2d');
                var obj     = canvas.__object__;

                var mouseCoords = RGraph.getMouseXY(eventObj);
                var mouseX      = mouseCoords[0];
                var mouseY      = mouseCoords[1];
                
                
                for (i=0; i<obj.coords.length; ++i) {
                    
                    var idx = i;
                    var xCoord = obj.coords[i][0];
                    var yCoord = obj.coords[i][1];
                    var width  = obj.coords[i][2];
                    var height = obj.coords[i][3];

                    if (
                           mouseX >= xCoord
                        && (mouseX <= xCoord + width)
                        && mouseY >= yCoord
                        && (mouseY <= yCoord + height)
                        && obj.Get('chart.tooltips')
                       ) {

                       // Redraw the graph
                        RGraph.Redraw();

                        /**
                        * Get the tooltip text
                        */
                        if (typeof(obj.Get('chart.tooltips')) == 'function') {
                            var text = obj.Get('chart.tooltips')(idx);
                        
                        } else if (typeof(obj.Get('chart.tooltips')) == 'object' && typeof(obj.Get('chart.tooltips')[idx]) == 'function') {
                            var text = obj.Get('chart.tooltips')[idx](idx);
                        
                        } else if (typeof(obj.Get('chart.tooltips')) == 'object') {
                            var text = obj.Get('chart.tooltips')[idx];

                        } else {
                            var text = null;
                        }

                        if (String(text).length && text != null) {

                            // SHOW THE CORRECT TOOLTIP
                            RGraph.Tooltip(canvas, text, eventObj.pageX, eventObj.pageY, idx);
                            
                            /**
                            * Draw a rectangle around the correct bar, in effect highlighting it
                            */
                            context.strokeStyle = obj.Get('chart.highlight.stroke');
                            context.fillStyle   = obj.Get('chart.highlight.fill');
                            context.strokeRect(xCoord, yCoord, width, height);
                            context.fillRect(xCoord, yCoord, width, height);
    
                            eventObj.stopPropagation();
                        }
                        return;
                    }
                }
            }
            this.canvas.addEventListener('click', canvas_onclick_func, false);
            RGraph.AddEventListener(this.id, 'click', canvas_onclick_func);
        }
    }