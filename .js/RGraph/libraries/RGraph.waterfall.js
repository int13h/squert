/**
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
    * The bar chart constructor
    * 
    * @param object canvas The canvas object
    * @param array  data   The chart data
    */
    RGraph.Waterfall = function (id, data)
    {
        // Get the canvas and context objects
        this.id                = id;
        this.canvas            = document.getElementById(id);
        this.context           = this.canvas.getContext ? this.canvas.getContext("2d") : null;
        this.canvas.__object__ = this;
        this.type              = 'waterfall';
        this.max               = 0;
        this.isRGraph          = true;
        this.coords            = [];

        /**
        * Compatibility with older browsers
        */
        RGraph.OldBrowserCompat(this.context);


        // Various config
        this.properties = {
            'chart.background.barcolor1':   'rgba(0,0,0,0)',
            'chart.background.barcolor2':   'rgba(0,0,0,0)',
            'chart.background.grid':        true,
            'chart.background.grid.color':  '#ddd',
            'chart.background.grid.width':  1,
            'chart.background.grid.hsize':  20,
            'chart.background.grid.vsize':  20,
            'chart.background.grid.vlines': true,
            'chart.background.grid.hlines': true,
            'chart.background.grid.border': true,
            'chart.background.grid.autofit':false,
            'chart.background.grid.autofit.numhlines': 7,
            'chart.background.grid.autofit.numvlines': 20,
            'chart.background.grid.autofit.align': false,
            'chart.background.image':       null,
            'chart.background.hbars':       null, // ???

            'chart.numyticks':              10,
            'chart.hmargin':                5,
            'chart.strokestyle':            '#666',
            'chart.axis.color':             'black',
            'chart.gutter.left':            25,
            'chart.gutter.right':           25,
            'chart.gutter.top':             25,
            'chart.gutter.bottom':          25,
            'chart.labels':                 [],
            'chart.ylabels':                true,
            'chart.text.color':             'black',
            'chart.text.size':              10,
            'chart.text.angle':             0,
            'chart.text.font':              'Verdana',
            'chart.ymax':                   null,

            'chart.title':                  '',
            'chart.title.color':            'black',
            'chart.title.background':       null,
            'chart.title.hpos':             null,
            'chart.title.vpos':             null,
            'chart.title.xaxis':            '',
            'chart.title.yaxis':            '',
            'chart.title.xaxis.pos':        0.25,
            'chart.title.yaxis.pos':        0.25,
            'chart.title.yaxis.align':      'left',

            'chart.colors':                 ['green', 'red', 'blue'],

            'chart.shadow':                 false,
            'chart.shadow.color':           '#666',
            'chart.shadow.offsetx':         3,
            'chart.shadow.offsety':         3,
            'chart.shadow.blur':            3,

            'chart.tooltips':               null,
            'chart.tooltips.effect':        'fade',
            'chart.tooltips.css.class':     'RGraph_tooltip',
        //'chart.tooltips.event':         'onclick',
            'chart.tooltips.coords.adjust': [0,0],
            'chart.tooltips.highlight':     true,
            'chart.tooltips.override':     null,

            'chart.highlight.stroke':       'black',
            'chart.highlight.fill':         'rgba(255,255,255,0.5)',

            'chart.contextmenu':            null,

            'chart.units.pre':              '',
            'chart.units.post':             '',
        
        //'chart.scale.decimals':         0,
        //'chart.scale.point':            '.',
        //'chart.scale.thousand':         ',',
        //'chart.scale.formatter':        null,

            'chart.crosshairs':             false,
            'chart.crosshairs.color':       '#333',

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

            'chart.resizable':              false,
            'chart.resize.handle.adjust':   [0,0],
            'chart.resize.handle.background': null,
            
            'chart.noaxes':                 false,
            'chart.noxaxis':                false,
            'chart.noyaxis':                false,

            'chart.axis.color':             'black',
            'chart.total':                  true
        }

        // Check for support
        if (!this.canvas) {
            alert('[WATERFALL] No canvas support');
            return;
        }

        // Store the data
        this.data = data;
    }


    /**
    * A setter
    * 
    * @param name  string The name of the property to set
    * @param value mixed  The value of the property
    */
    RGraph.Waterfall.prototype.Set = function (name, value)
    {
        this.properties[name.toLowerCase()] = value;
    }


    /**
    * A getter
    * 
    * @param name  string The name of the property to get
    */
    RGraph.Waterfall.prototype.Get = function (name)
    {        
        return this.properties[name.toLowerCase()];
    }


    /**
    * The function you call to draw the bar chart
    */
    RGraph.Waterfall.prototype.Draw = function ()
    {
        // MUST be the first thing done!
        if (typeof(this.Get('chart.background.image')) == 'string' && !this.__background_image__) {
            RGraph.DrawBackgroundImage(this);
            return;
        }


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
        * Stop the coords array from growing uncontrollably
        */
        this.coords = [];

        /**
        * Work out a few things. They need to be here because they depend on things you can change after you instantiate the object
        */
        this.max            = 0;
        this.grapharea      = RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom;
        this.graphwidth     = RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight;
        this.halfTextHeight = this.Get('chart.text.size') / 2;

        // Work out the resulting total
        if (typeof(this.Get('chart.total')) == 'boolean' && this.Get('chart.total')) {
            var total = RGraph.array_sum(this.data);
            this.data.push(total);
            this.Set('chart.total', total);
        }

        /**
        * Work out the maximum value
        */
        var runningTotal = 0;
        for (var i=0; i<this.data.length - 1; ++i) {
            runningTotal += this.data[i];
            this.max = Math.max(this.max, runningTotal);
        }

        this.scale   = RGraph.getScale(typeof(this.Get('chart.ymax')) == 'number' ? this.Get('chart.ymax') : this.max, this);
        this.max     = this.scale[4];
        var decimals = this.Get('chart.scale.decimals');

        this.scale = [
                      (this.max * (1/5)).toFixed(decimals),
                      (this.max * (2/5)).toFixed(decimals),
                      (this.max * (3/5)).toFixed(decimals),
                      (this.max * (4/5)).toFixed(decimals),
                      this.max.toFixed(decimals)
                     ];


        // Progressively Draw the chart
        RGraph.background.Draw(this);

        this.Drawbars();
        this.DrawAxes();
        this.DrawLabels();

        /**
        * Setup the context menu if required
        */
        if (this.Get('chart.contextmenu')) {
            RGraph.ShowContext(this);
        }

        
        /**
        * Draw crosschairs
        */
        if (this.Get('chart.crosshairs')) {
            RGraph.DrawCrosshairs(this);
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
        * Tooltips
        */
        if (this.Get('chart.tooltips')) {
        
            RGraph.Register(this);














            /**
            * Install the onclick event handler for the tooltips
            */
            var canvas_onclick_func = function (e)
            {
                e = RGraph.FixEventObject(e);

                var canvas  = document.getElementById(this.id);
                var context = canvas.getContext('2d');
                var obj     = canvas.__object__;

                /**
                * Redraw the graph first, in effect resetting the graph to as it was when it was first drawn
                * This "deselects" any already selected bar
                */
                RGraph.Clear(canvas);
                obj.Draw();
    
                /**
                * Get the mouse X/Y coordinates
                */
                var mouseCoords = RGraph.getMouseXY(e);
                var mouseX      = mouseCoords[0];
                var mouseY      = mouseCoords[1];
                var adjust      = obj.Get('chart.tooltips.coords.adjust');

                /**
                * Loop through the bars determining if the mouse is over a bar
                */
                for (var i=0; i<obj.coords.length; i++) {
                
                    var coordsX = obj.coords[i][0];
                    var coordsY = obj.coords[i][1];
                    var coordsW = obj.coords[i][2];
                    var coordsH = obj.coords[i][3];

                    if (
                        mouseX >= (coordsX + adjust[0]) &&
                        mouseX <= (coordsX + coordsW + adjust[0]) &&
                        mouseY >= (coordsY + adjust[1]) &&
                        mouseY <= (coordsY + coordsH + adjust[1])
                       ) {
                       
                       if (!obj.Get('chart.tooltips')[i]) {
                        return;
                       }
                       
                        // Draw the highlight (if necessary)
                        if (obj.Get('chart.tooltips.highlight')) {
                           context.beginPath();
                               context.fillStyle = obj.Get('chart.highlight.fill');
                               context.strokeStyle = obj.Get('chart.highlight.stroke');
                               context.strokeRect(coordsX, coordsY, coordsW, coordsH);
                               context.fillRect(coordsX, coordsY, coordsW, coordsH);
                           context.stroke();
                           context.fill();
                        }

                        /**
                        * Get the tooltip text
                        */
                        if (typeof(obj.Get('chart.tooltips')) == 'function') {
                            var text = String(obj.Get('chart.tooltips')(i));
                        
                        } else if (typeof(obj.Get('chart.tooltips')) == 'object' && typeof(obj.Get('chart.tooltips')[i]) == 'function') {
                            var text = String(obj.Get('chart.tooltips')[barCoords[5]](i));
                        
                        } else if (typeof(obj.Get('chart.tooltips')) == 'object' && (typeof(obj.Get('chart.tooltips')[i]) == 'string' || typeof(obj.Get('chart.tooltips')[i]) == 'number')) {
                            var text = String(obj.Get('chart.tooltips')[i]);
                    
                        } else {
                            var text = null;
                        }
    
                        if (text) {
                            canvas.style.cursor = 'pointer';
                        } else {
                            canvas.style.cursor = 'default';
                        }

                        RGraph.Tooltip(canvas, obj.Get('chart.tooltips')[i], e.pageX, e.pageY, text, i);
                    }
                }

                /**
                * Stop the event bubbling
                */
                e.stopPropagation();
                
                return false;
            }
            this.canvas.addEventListener('click', canvas_onclick_func, false);
            RGraph.AddEventListener(this.id, 'click', canvas_onclick_func);

            /**
            * Install the window onclick handler
            */
            var window_onclick_func = function (){RGraph.Redraw();};
            window.addEventListener('click', window_onclick_func, false);
            RGraph.AddEventListener('window_' + this.id, 'click', window_onclick_func);













            /**
            * Install the onmousemove event handler for the tooltips
            */
            var canvas_onmousemove_func = function (e)
            {
                e = RGraph.FixEventObject(e);

                var canvas  = document.getElementById(this.id);
                var context = canvas.getContext('2d');
                var obj     = canvas.__object__;
    
                /**
                * Get the mouse X/Y coordinates
                */
                var mouseCoords = RGraph.getMouseXY(e);
                var mouseX      = mouseCoords[0];
                var mouseY      = mouseCoords[1];
                var adjust      = obj.Get('chart.tooltips.coords.adjust');

                /**
                * Loop through the bars determining if the mouse is over a bar
                */
                for (var i=0; i<obj.coords.length; i++) {
                
                    var coordsX = obj.coords[i][0];
                    var coordsY = obj.coords[i][1];
                    var coordsW = obj.coords[i][2];
                    var coordsH = obj.coords[i][3];

                    if (
                        mouseX >= (coordsX + adjust[0]) &&
                        mouseX <= (coordsX + coordsW + adjust[0]) &&
                        mouseY >= (coordsY + adjust[1]) &&
                        mouseY <= (coordsY + coordsH + adjust[1])
                       ) {
                       if (obj.Get('chart.tooltips')[i]) {                       
                            canvas.style.cursor = 'pointer';
                            e.stopPropagation();
                        }

                       return;
                    }
                }
                
                canvas.style.cursor = 'default';

                /**
                * Stop the event bubbling
                */
                e.stopPropagation();
                
                return false;
            }
            this.canvas.addEventListener('mousemove', canvas_onmousemove_func, false);
            RGraph.AddEventListener(this.id, 'mousemove', canvas_onmousemove_func);













        }

        
        /**
        * Fire the RGraph ondraw event
        */
        RGraph.FireCustomEvent(this, 'ondraw');
    }

    
    /**
    * Draws the charts axes
    */
    RGraph.Waterfall.prototype.DrawAxes = function ()
    {
        if (this.Get('chart.noaxes')) {
            return;
        }

        this.context.beginPath();
        this.context.strokeStyle = this.Get('chart.axis.color');
        this.context.lineWidth = 1;

        // Draw the Y axis
        if (this.Get('chart.noyaxis') == false) {
            this.context.moveTo(this.gutterLeft, this.gutterTop);
            this.context.lineTo(this.gutterLeft, RGraph.GetHeight(this) - this.gutterBottom);
        }

        // Draw the X axis
        if (this.Get('chart.noxaxis') == false) {
            this.context.moveTo(this.gutterLeft, RGraph.GetHeight(this) - this.gutterBottom);
            this.context.lineTo(RGraph.GetWidth(this) - this.gutterRight, RGraph.GetHeight(this) - this.gutterBottom);
        }

        var numYTicks = this.Get('chart.numyticks');

        // Draw the Y tickmarks
        if (this.Get('chart.noyaxis') == false) {

            var yTickGap = (RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom) / numYTicks;
    
            for (y=this.gutterTop; y < (RGraph.GetHeight(this) - this.gutterBottom); y += yTickGap) {
                this.context.moveTo(this.gutterLeft, y);
                this.context.lineTo(this.gutterLeft - 3, y);
            }
            
            /**
            * If the X axis is not being shown, draw an extra tick
            */
            if (this.Get('chart.noxaxis')) {
                this.context.moveTo(this.gutterLeft - 3, RGraph.GetHeight(this) - this.gutterBottom);
                this.context.lineTo(this.gutterLeft, RGraph.GetHeight(this) - this.gutterBottom);
            }
        }


        // Draw the X tickmarks
        if (this.Get('chart.noxaxis') == false) {

            xTickGap = (RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight ) / this.data.length;
            
            yStart   = RGraph.GetHeight(this) - this.gutterBottom;
            yEnd     = (RGraph.GetHeight(this) - this.gutterBottom) + 3;
    
            for (x=this.gutterLeft + xTickGap; x<=RGraph.GetWidth(this) - this.gutterRight; x+=xTickGap) {
                this.context.moveTo(x, yStart);
                this.context.lineTo(x, yEnd);
            }
            
            if (this.Get('chart.noyaxis')) {
                this.context.moveTo(this.gutterLeft, yStart);
                this.context.lineTo(this.gutterLeft, yEnd);
            }
        }

        /**
        * If the Y axis is not being shown, draw an extra tick
        */
        if (this.Get('chart.noyaxis') && this.Get('chart.noxaxis') == false) {
            this.context.moveTo(this.gutterLeft, RGraph.GetHeight(this) - this.gutterBottom);
            this.context.lineTo(this.gutterLeft, RGraph.GetHeight(this) - this.gutterBottom + 3);
        }

        this.context.stroke();
    }


    /**
    * Draws the labels for the graph
    */
    RGraph.Waterfall.prototype.DrawLabels = function ()
    {
        var context    = this.context;
        var numYLabels = 5;
        var interval   = this.grapharea / numYLabels;
        var font       = this.Get('chart.text.font');
        var size       = this.Get('chart.text.size');
        var color      = this.Get('chart.text.color');
        var units_pre  = this.Get('chart.units.pre');
        var units_post = this.Get('chart.units.post');
        
        this.context.beginPath();
        this.context.fillStyle = color;

        /**
        * First, draw the Y labels
        */
        if (this.Get('chart.ylabels')) {
            for (var i=1; i<=numYLabels; ++i) {

                RGraph.Text(context,
                            font,
                            size,
                            this.gutterLeft - 5,
                            this.canvas.height - this.gutterBottom - (i * interval),
                            RGraph.number_format(this, this.scale[i - 1], units_pre, units_post),
                            'center',
                            'right');

            }
        }



        /**
        * Now, draw the X labels
        */
        if (this.Get('chart.labels').length > 0) {
        
            // Recalculate the interval for the X labels
            interval = (RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight) / this.Get('chart.labels').length;
            
            var halign = 'center';
            var angle  = this.Get('chart.text.angle');
            
            if (angle) {
                halign = 'right';
                angle *= -1;
            }

            for (var i=0; i<this.Get('chart.labels').length; ++i) {
                
                var labels = this.Get('chart.labels');

                RGraph.Text(context,
                            font,
                            size,
                            this.gutterLeft - 5 + (i * interval) + (interval / 2),// X
                            RGraph.GetHeight(this) - this.gutterBottom + 5 + this.halfTextHeight, // Y
                            labels[i],
                            'center',
                            halign,
                            null,
                            angle);

            }
        }
        
        this.context.stroke();
        this.context.fill();
    }


    /**
    * Draws the bars on to the chart
    */
    RGraph.Waterfall.prototype.Drawbars = function ()
    {
        var context      = this.context;
        var canvas       = this.canvas;
        var hmargin      = this.Get('chart.hmargin');
        var runningTotal = 0;

        
            for (var i=0; i<this.data.length; ++i) {
                context.beginPath();
                context.strokeStyle = this.Get('chart.strokestyle');

                    var isLast = (i == (this.data.length - 1));
                    var x      = this.gutterLeft + hmargin + ((this.graphwidth / this.data.length) * i);
                    var y      = this.gutterTop + this.grapharea - (i == 0 ? ((this.data[0] / this.max) * this.grapharea) : (this.data[i] > 0 ? ((runningTotal + this.data[i]) / this.max) * this.grapharea : (runningTotal / this.max) * this.grapharea));
                    var w      = ((RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight) / this.data.length) - (2 * this.Get('chart.hmargin'));
                    var h      = (Math.abs(this.data[i]) / this.max) * this.grapharea;
    
                    // Color
                    context.fillStyle = this.data[i] >= 0 ? this.Get('chart.colors')[0] : this.Get('chart.colors')[1];
    
                    // Last item? Change to the third color
                    if (isLast && this.Get('chart.total')) {
                        context.fillStyle = this.Get('chart.colors')[2];
                        y = this.gutterTop + this.grapharea - h;
                    }
                    
                    if (this.Get('chart.shadow')) {
                        RGraph.SetShadow(this, this.Get('chart.shadow.color'), this.Get('chart.shadow.offsetx'), this.Get('chart.shadow.offsety'), this.Get('chart.shadow.blur'));
                    } else {
                        RGraph.NoShadow(this);
                    }
    
                    context.strokeRect(x, y, w, h);
                    context.fillRect(x, y, w, h);
                    
                    this.coords.push([x, y, w, h]);
                    
                    runningTotal += this.data[i];

                context.stroke();
                context.fill();
            }
            
            RGraph.NoShadow(this);

            for (var i=1; i<this.coords.length; ++i) {
                context.strokeStyle = 'gray';
                context.beginPath();
                    if (this.data[i - 1] > 0) {
                        context.moveTo(this.coords[i - 1][0] + this.coords[i - 1][2], this.coords[i - 1][1]);
                        context.lineTo(this.coords[i - 1][0] + this.coords[i - 1][2] + (2 * hmargin), this.coords[i - 1][1]);
                    } else {
                        context.moveTo(this.coords[i - 1][0] + this.coords[i - 1][2], this.coords[i - 1][1] + this.coords[i - 1][3]);
                        context.lineTo(this.coords[i - 1][0] + this.coords[i - 1][2] + (2 * hmargin), this.coords[i - 1][1] + this.coords[i - 1][3]);
                    }
                context.stroke();
            }
    }


