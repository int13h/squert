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
    * The traditional radar chart constructor
    * 
    * @param string id   The ID of the canvas
    * @param array  data An array of data to represent
    */
    RGraph.Radar = function (id, data)
    {
        this.id                = id;
        this.canvas            = document.getElementById(id);
        this.context           = this.canvas.getContext('2d');
        this.canvas.__object__ = this;
        this.size              = null;// Set in the .Draw() method
        this.type              = 'radar';
        this.coords            = [];
        this.isRGraph          = true;
        this.data              = [];
        this.max               = 0;

        for (var i=1; i<arguments.length; ++i) {
            this.data.push(RGraph.array_clone(arguments[i]));
            this.max = Math.max(this.max, RGraph.array_max(arguments[i]));
        }

        /**
        * Compatibility with older browsers
        */
        RGraph.OldBrowserCompat(this.context);

        
        this.properties = {
            'chart.strokestyle':           'black',
            'chart.gutter.left':           25,
            'chart.gutter.right':          25,
            'chart.gutter.top':            25,
            'chart.gutter.bottom':         25,
            'chart.linewidth':             1,
            'chart.colors':                ['red'],
            'chart.colors.alpha':          null,
            'chart.circle':                0,
            'chart.circle.fill':           'red',
            'chart.circle.stroke':         'black',
            'chart.labels':                [],
            'chart.labels.offsetx':        10,
            'chart.labels.offsety':        10,
            'chart.background.circles':    true,
            'chart.text.size':             10,
            'chart.text.font':             'Verdana',
            'chart.text.color':            'black',
            'chart.title':                 '',
            'chart.title.background':      null,
            'chart.title.hpos':            null,
            'chart.title.vpos':            null,
            'chart.title.color':           'black',
            'chart.linewidth':             1,
            
            'chart.key':                   null,
            'chart.key.background':        'white',
            'chart.key.shadow':            false,
            'chart.key.shadow.color':       '#666',
            'chart.key.shadow.blur':        3,
            'chart.key.shadow.offsetx':     2,
            'chart.key.shadow.offsety':     2,
            'chart.key.position':          'graph',
            'chart.key.halign':             'right',
            'chart.key.position.gutter.boxed': true,
            'chart.key.position.x':         null,
            'chart.key.position.y':         null,
            'chart.key.color.shape':        'square',
            'chart.key.rounded':            true,
            'chart.key.linewidth':          1,

            'chart.contextmenu':           null,
            'chart.annotatable':           false,
            'chart.annotate.color':        'black',
            'chart.zoom.factor':           1.5,
            'chart.zoom.fade.in':          true,
            'chart.zoom.fade.out':         true,
            'chart.zoom.hdir':             'right',
            'chart.zoom.vdir':             'down',
            'chart.zoom.frames':           10,
            'chart.zoom.delay':            50,
            'chart.zoom.shadow':           true,
            'chart.zoom.mode':             'canvas',
            'chart.zoom.thumbnail.width':  75,
            'chart.zoom.thumbnail.height': 75,
            'chart.zoom.background':        true,
            'chart.zoom.action':            'zoom',
            'chart.tooltips.effect':        'fade',
            'chart.tooltips.css.class':      'RGraph_tooltip',
            'chart.tooltips.highlight':     true,
            'chart.tooltips.coords.adjust': [0,0],
            'chart.highlight.stroke':       'gray',
            'chart.highlight.fill':         'white',
            'chart.resizable':              false,
            'chart.resize.handle.adjust':   [0,0],
            'chart.resize.handle.background': null,
            'chart.labels.axes':            'nsew',
            'chart.ymax':                   null
        }
        
        // Must have at least 3 points
        for (var dataset=0; dataset<this.data.length; ++dataset) {
            if (this.data[dataset].length < 3) {
                alert('[RADAR] You must specify at least 3 data points');
                return;
            }
        }
    }


    /**
    * A simple setter
    * 
    * @param string name  The name of the property to set
    * @param string value The value of the property
    */
    RGraph.Radar.prototype.Set = function (name, value)
    {
        this.properties[name] = value;

        /**
        * If the name is chart.color, set chart.colors too
        */
        if (name == 'chart.color') {
            this.properties['chart.colors'] = [value];
        }
    }


    /**
    * A simple hetter
    * 
    * @param string name  The name of the property to get
    */
    RGraph.Radar.prototype.Get = function (name)
    {
        return this.properties[name];
    }


    /**
    * The draw method which does all the brunt of the work
    */
    RGraph.Radar.prototype.Draw = function ()
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

        this.centerx  = ((this.canvas.width - this.gutterLeft - this.gutterRight) / 2) + this.gutterLeft;
        this.centery  = ((this.canvas.height - this.gutterTop - this.gutterBottom) / 2) + this.gutterTop;
        this.size     = Math.min(this.canvas.width - this.gutterLeft - this.gutterRight, this.canvas.height - this.gutterTop - this.gutterBottom);

        // Work out the maximum value and the sum
        if (!this.Get('chart.ymax')) {

            // this.max is calculated in the constructor

            this.scale = RGraph.getScale(this.max, this);
            this.max = this.scale[4];
        } else {
            var ymax = this.Get('chart.ymax');

            this.scale = [
                          ymax * 0.2,
                          ymax * 0.4,
                          ymax * 0.6,
                          ymax * 0.8,
                          ymax * 1
                         ];
            this.max = this.scale[4];
        }

        this.DrawBackground();
        this.DrawAxes();
        this.DrawCircle();
        this.DrawAxisLabels();
        this.DrawChart();
        this.DrawLabels();
        
        // Draw the title
        if (this.Get('chart.title')) {
            RGraph.DrawTitle(this.canvas, this.Get('chart.title'), this.gutterTop)
        }

        // Draw the key if necessary
        // obj, key, colors
        if (this.Get('chart.key')) {
            RGraph.DrawKey(this, this.Get('chart.key'), this.Get('chart.colors'));
        }

        /**
        * Show the context menu
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
    * Draws the background circles
    */
    RGraph.Radar.prototype.DrawBackground = function ()
    {
        var color = '#ddd';

        /**
        * Draws the background circles
        */
        if (this.Get('chart.background.circles')) {

           this.context.strokeStyle = color;
           this.context.beginPath();

           for (var r=5; r<(this.size / 2); r+=15) {

                this.context.moveTo(this.centerx, this.centery);
                this.context.arc(this.centerx, this.centery,r, 0, 6.28, 0);
            }
            
            this.context.stroke();
        }
        
        
        /**
        * Draw diagonals
        */
        this.context.strokeStyle = color;
        for (var i=0; i<360; i+=15) {
            this.context.beginPath();
            this.context.arc(this.centerx, this.centery, this.size / 2, (i / 360) * (2 * Math.PI), ((i+0.01) / 360) * (2 * Math.PI), 0); // The 0.01 avoids a bug in Chrome 6
            this.context.lineTo(this.centerx, this.centery);
            this.context.stroke();
        }
    }


    /**
    * Draws the axes
    */
    RGraph.Radar.prototype.DrawAxes = function ()
    {
        this.context.strokeStyle = 'black';

        var halfsize = this.size / 2;

        this.context.beginPath();

        /**
        * The Y axis
        */
            this.context.moveTo(this.centerx, this.centery + halfsize);
            this.context.lineTo(this.centerx, this.centery - halfsize);
            
    
            // Draw the bits at either end of the Y axis
            this.context.moveTo(this.centerx - 5, this.centery + halfsize);
            this.context.lineTo(this.centerx + 5, this.centery + halfsize);
            this.context.moveTo(this.centerx - 5, this.centery - halfsize);
            this.context.lineTo(this.centerx + 5, this.centery - halfsize);
            
            // Draw X axis tick marks
            for (var y=(this.centery - halfsize); y<(this.centery + halfsize); y+=15) {
                this.context.moveTo(this.centerx - 3, y);
                this.context.lineTo(this.centerx + 3, y);
            }

        /**
        * The X axis
        */
            this.context.moveTo(this.centerx - halfsize, this.centery);
            this.context.lineTo(this.centerx + halfsize, this.centery);
    
            // Draw the bits at the end of the X axis
            this.context.moveTo(this.centerx - halfsize, this.centery - 5);
            this.context.lineTo(this.centerx - halfsize, this.centery + 5);
            this.context.moveTo(this.centerx + halfsize, this.centery - 5);
            this.context.lineTo(this.centerx + halfsize, this.centery + 5);

            // Draw X axis tick marks
            for (var x=(this.centerx - halfsize); x<(this.centerx + halfsize); x+=15) {
                this.context.moveTo(x, this.centery - 3);
                this.context.lineTo(x, this.centery + 3);
            }

        /**
        * Finally draw it to the canvas
        */
        this.context.stroke();
    }


    /**
    * The function which actually draws the radar chart
    */
    RGraph.Radar.prototype.DrawChart = function ()
    {
        var alpha = this.Get('chart.colors.alpha');

        if (typeof(alpha) == 'number') {
            var oldAlpha = this.context.globalAlpha;
            this.context.globalAlpha = alpha;
        }

        for (var dataset=0; dataset<this.data.length; ++dataset) {

            this.context.beginPath();
            
                this.coords[dataset] = [];
    
                for (var i=0; i<this.data[dataset].length; ++i) {
                    this.coords[dataset][i] = this.GetCoordinates(dataset, i);
                }
    
                /**
                * Now go through the coords and draw the chart itself
                */
                this.context.strokeStyle = this.Get('chart.strokestyle');
                this.context.fillStyle = this.Get('chart.colors')[dataset];
                this.context.lineWidth = this.Get('chart.linewidth');

                for (i=0; i<this.coords[dataset].length; ++i) {
                    if (i == 0) {
                        this.context.moveTo(this.coords[dataset][i][0], this.coords[dataset][i][1]);
                    } else {
                        this.context.lineTo(this.coords[dataset][i][0], this.coords[dataset][i][1]);
                    }
                }
            
            this.context.closePath();
    
            this.context.stroke();
            this.context.fill();
            
            /**
            * Can now handletooltips
            */
            if (this.Get('chart.tooltips')) {
                
                RGraph.Register(this);
                
                var canvas_onmousemove_func = function (e)
                {
                    e = RGraph.FixEventObject(e);
                    
                    var canvas      = e.target;
                    var obj         = canvas.__object__;
                    var x           = e.offsetX;
                    var y           = e.offsetY;
                    var overHotspot = false;
                    
                    for(var dataset=0; dataset<obj.coords.length; ++dataset) {
                        for (var i=0; i<obj.coords[dataset].length; ++i) {
                        
                            var xCoord   = obj.coords[dataset][i][0];
                            var yCoord   = obj.coords[dataset][i][1];
                            var tooltips = obj.Get('chart.tooltips');
                            var idx      = Number(i);
        
                            if (
                                (tooltips[i] || tooltips) // The order here is important due to short circuiting
                                && x < (xCoord + 5 + obj.Get('chart.tooltips.coords.adjust')[0])
                                && x > (xCoord - 5 + obj.Get('chart.tooltips.coords.adjust')[0])
                                && y > (yCoord - 5 + obj.Get('chart.tooltips.coords.adjust')[1])
                                && y < (yCoord + 5 + obj.Get('chart.tooltips.coords.adjust')[1])
                               ) {

                                // This accounts for the datasets and increases the index accordingly
                                for(var j=0; j<dataset; j++) {
                                    if (typeof(obj.data[j]) == 'object') {
                                        i += obj.data[j].length;
                                    }
                                }
                                
                                idx = Number(i);

                                if (   !RGraph.Registry.Get('chart.tooltip')
                                    || (RGraph.Registry.Get('chart.tooltip').__index__ != idx && RGraph.Registry.Get('chart.tooltip').__dataset__ != dataset)
                                    || (RGraph.Registry.Get('chart.tooltip').__index__ != idx && RGraph.Registry.Get('chart.tooltip').__dataset__ == dataset)
                                   ) {

                                    /**
                                    * Get the tooltip text
                                    */
                                    if (typeof(obj.Get('chart.tooltips')) == 'function') {
                                        var text = String(obj.Get('chart.tooltips')(i));
        
                                    } else if (typeof(obj.Get('chart.tooltips')) == 'object' && typeof(obj.Get('chart.tooltips')[i]) == 'function') {
                                        var text = String(obj.Get('chart.tooltips')[i](i));
                                    
                                    } else if (typeof(obj.Get('chart.tooltips')) == 'object' && typeof(obj.Get('chart.tooltips')[i]) == 'string') {
                                        var text = String(obj.Get('chart.tooltips')[i]);
        
                                    } else {
                                        var text = null;
                                    }
        
                                    if (typeof(text) == 'string' && text.length) {
                               
                                        overHotspot = true;
                                        obj.canvas.style.cursor = 'pointer';
        
                                        RGraph.Clear(obj.canvas);
                                        obj.Draw();
                                        
                                        if (obj.Get('chart.tooltips.highlight')) {
                                            obj.context.beginPath();
                                            obj.context.strokeStyle = obj.Get('chart.highlight.stroke');
                                            obj.context.fillStyle   = obj.Get('chart.highlight.fill');
                                            obj.context.arc(xCoord, yCoord, 2, 0, 6.28, 0);
                                            obj.context.fill();
                                            obj.context.stroke();
                                        }
                                        
                                        RGraph.Tooltip(obj.canvas, text, e.pageX, e.pageY, idx);
                                        
                                        // Set the data set value on the tooltip
                                        RGraph.Registry.Get('chart.tooltip').__index__ = idx;
                                        RGraph.Registry.Get('chart.tooltip').__dataset__ = dataset;


                                    }
                                //} else if (RGraph.Registry.Get('chart.tooltip') && RGraph.Registry.Get('chart.tooltip').__index__ == idx && RGraph.Registry.Get('chart.tooltip').__dataset__ == dataset) {
                                } else {
                                    overHotspot = true;
                                    obj.canvas.style.cursor = 'pointer';
                                }
                            }
                        }
                    }

                    if (!overHotspot) {
                        obj.canvas.style.cursor = 'default';
                    }
                }
                this.canvas.addEventListener('mousemove', canvas_onmousemove_func, false);
                RGraph.AddEventListener(this.id, 'mousemove', canvas_onmousemove_func);
            }
        }
        
        // Reset the globalAlpha
        if (typeof(alpha) == 'number') {
            this.context.globalAlpha = oldAlpha;
        }
    }


    /**
    * Gets the coordinates for a particular mark
    * 
    * @param  number i The index of the data (ie which one it is)
    * @return array    A two element array of the coordinates
    */
    RGraph.Radar.prototype.GetCoordinates = function (dataset, index)
    {
        // The number  of data points
        var len = this.data[dataset].length;

        // The magnitude of the data (NOT the x/y coords)
        var mag = (this.data[dataset][index] / this.max) * (this.size / 2);

        /**
        * Get the angle
        */
        var angle = (6.28 / len) * index; // In radians

        /**
        * Work out the X/Y coordinates
        */
        var x = Math.cos(angle) * mag;
        var y = Math.sin(angle) * mag;

        /**
        * Put the coordinate in the right quadrant
        */
        x = this.centerx + x;
        y = this.centery + (index == 0 ? 0 : y);
        
        return [x,y];
    }
    
    
    /**
    * This function adds the labels to the chart
    */
    RGraph.Radar.prototype.DrawLabels = function ()
    {
        var labels = this.Get('chart.labels');

        if (labels && labels.length > 0) {

            this.context.lineWidth = 1;
            this.context.fillStyle = this.Get('chart.text.color');
            
            var offsetx = this.Get('chart.labels.offsetx');
            var offsety = this.Get('chart.labels.offsety');

            for (var i=0; i<labels.length; ++i) {
            
                var ds = 0;
            
                for (var dataset=0; dataset<this.data.length; ++dataset) {
                    if (this.data[dataset][i] > this.data[ds][i]) {
                        ds = dataset;
                    }
                }

                var x        = this.coords[ds][i][0];
                var y        = this.coords[ds][i][1];
                var text     = labels[i];
                var hAlign   = 'center';
                var vAlign   = 'center';
                var quartile = (i / this.coords.length);

                // ~Manually do labels on the right middle axis
                if (i == 0) {
                    hAlign = 'left';
                    vAlign = 'center';
                    x += offsetx;

                } else {

                    hAlign = (x < this.centerx) ? 'right' : 'left';
                    vAlign = (y < this.centery) ? 'bottom' : 'top';
                    x     += (x < this.centerx) ? (-1 * offsetx) : offsetx;
                    y     += (y < this.centery) ? (-1 * offsety) : offsety;
                    
                    if (i / this.data.length == 0.25) { x -= offsetx; hAlign = 'center';
                    } else if (i / this.data.length == 0.5) { y -= offsety; vAlign = 'center';
                    } else if (i / this.data.length == 0.75) { x += offsetx; hAlign = 'center'; }
                }

                // context, font, size, x, y, text
                RGraph.Text(this.context, this.Get('chart.text.font'), this.Get('chart.text.size'), x, y, text, vAlign, hAlign, true, null, 'white');
            }
        }
    }


    /**
    * Draws the circle. No arguments as it gets the information from the object properties.
    */
    RGraph.Radar.prototype.DrawCircle = function ()
    {
        var circle   = {};
        circle.limit = this.Get('chart.circle');
        circle.fill  = this.Get('chart.circle.fill');
        circle.stroke  = this.Get('chart.circle.stroke');

        if (circle.limit) {

            var r = (circle.limit / this.max) * (this.size / 2);
            
            this.context.fillStyle = circle.fill;
            this.context.strokeStyle = circle.stroke;

            this.context.beginPath();
            this.context.arc(this.centerx, this.centery, r, 0, 6.28, 0);
            this.context.fill();
            this.context.stroke();
        }
    }


    /**
    * Unsuprisingly, draws the labels
    */
    RGraph.Radar.prototype.DrawAxisLabels = function ()
    {
        this.context.lineWidth = 1;
        
        // Set the color to black
        this.context.fillStyle = 'black';
        this.context.strokeStyle = 'black';

        var r         = (this.size/ 2);
        var font_face = this.Get('chart.text.font');
        var font_size = this.Get('chart.text.size');
        var context   = this.context;
        var axes      = this.Get('chart.labels.axes').toLowerCase();
        var color     = 'rgba(255,255,255,0.8)';

        // The "North" axis labels
        if (axes.indexOf('n') > -1) {
            RGraph.Text(context,font_face,font_size,this.centerx,this.centery - (r * 0.2),String(this.scale[0]),'center','center',true,false,color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery - (r * 0.4), String(this.scale[1]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery - (r * 0.6), String(this.scale[2]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery - (r * 0.8), String(this.scale[3]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery - r, String(this.scale[4]), 'center', 'center', true, false, color);
        }

        // The "South" axis labels
        if (axes.indexOf('s') > -1) {
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery + (r * 0.2), String(this.scale[0]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery + (r * 0.4), String(this.scale[1]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery + (r * 0.6), String(this.scale[2]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery + (r * 0.8), String(this.scale[3]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery + r, String(this.scale[4]), 'center', 'center', true, false, color);
        }
        
        // The "East" axis labels
        if (axes.indexOf('e') > -1) {
            RGraph.Text(context, font_face, font_size, this.centerx + (r * 0.2), this.centery, String(this.scale[0]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx + (r * 0.4), this.centery, String(this.scale[1]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx + (r * 0.6), this.centery, String(this.scale[2]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx + (r * 0.8), this.centery, String(this.scale[3]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx + r, this.centery, String(this.scale[4]), 'center', 'center', true, false, color);
        }

        // The "West" axis labels
        if (axes.indexOf('w') > -1) {
            RGraph.Text(context, font_face, font_size, this.centerx - (r * 0.2), this.centery, String(this.scale[0]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx - (r * 0.4), this.centery, String(this.scale[1]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx - (r * 0.6), this.centery, String(this.scale[2]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx - (r * 0.8), this.centery, String(this.scale[3]), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx - r, this.centery, String(this.scale[4]), 'center', 'center', true, false, color);
        }

        RGraph.Text(context, font_face, font_size, this.centerx,  this.centery, '0', 'center', 'center', true, false, color);
    }