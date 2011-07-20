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
    * The rose chart constuctor
    * 
    * @param object canvas
    * @param array data
    */
    RGraph.Rose = function (id, data)
    {
        this.id                = id;
        this.canvas            = document.getElementById(id);
        this.context           = this.canvas.getContext('2d');
        this.data              = data;
        this.canvas.__object__ = this;
        this.type              = 'rose';
        this.isRGraph          = true;


        /**
        * Compatibility with older browsers
        */
        RGraph.OldBrowserCompat(this.context);


        this.centerx = 0;
        this.centery = 0;
        this.radius  = 0;
        this.max     = 0;
        
        this.properties = {
            'chart.radius':                 null,
            'chart.colors':                 ['red', 'rgb(0,255,255)', 'rgb(0,255,0)', 'gray', 'blue', 'rgb(255,128,255)','green', 'pink', 'gray', 'aqua'],
            'chart.colors.sequential':      false,
            'chart.colors.alpha':           null,
            'chart.strokestyle':            'rgba(0,0,0,0.5)',
            'chart.gutter.left':            25,
            'chart.gutter.right':           25,
            'chart.gutter.top':             25,
            'chart.gutter.bottom':          25,
            'chart.title':                  '',
            'chart.title.background':       null,
            'chart.title.hpos':             null,
            'chart.title.vpos':             null,
            'chart.labels':                 null,
            'chart.labels.position':       'center',
            'chart.labels.axes':            'nsew',
            'chart.labels.offset':          0,
            'chart.text.color':             'black',
            'chart.text.font':              'Verdana',
            'chart.text.size':              10,
            'chart.key':                    null,
            'chart.key.background':         'white',
            'chart.key.position':           'graph',
            'chart.key.halign':             'right',
            'chart.key.shadow':             false,
            'chart.key.shadow.color':       '#666',
            'chart.key.shadow.blur':        3,
            'chart.key.shadow.offsetx':     2,
            'chart.key.shadow.offsety':     2,
            'chart.key.position.gutter.boxed': true,
            'chart.key.position.x':         null,
            'chart.key.position.y':         null,
            'chart.key.color.shape':        'square',
            'chart.key.rounded':            true,
            'chart.key.linewidth':          1,
            'chart.contextmenu':            null,
            'chart.tooltips':               null,
            'chart.tooltips.event':         'onclick',
            'chart.tooltips.effect':        'fade',
            'chart.tooltips.css.class':     'RGraph_tooltip',
            'chart.tooltips.highlight':     true,
            'chart.highlight.stroke':       'black',
            'chart.highlight.fill':         'rgba(255,255,255,0.5)',
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
            'chart.adjustable':             false,
            'chart.ymax':                   null,
            'chart.ymin':                   0,
            'chart.scale.decimals':         null,
            'chart.variant':                'stacked'
        }


        /**
        * Set the .getShape commonly named method
        */
        this.getShape = this.getSegment;
    }


    /**
    * A simple setter
    * 
    * @param string name  The name of the property to set
    * @param string value The value of the property
    */
    RGraph.Rose.prototype.Set = function (name, value)
    {
        this.properties[name.toLowerCase()] = value;
    }
    
    
    /**
    * A simple getter
    * 
    * @param string name The name of the property to get
    */
    RGraph.Rose.prototype.Get = function (name)
    {
        return this.properties[name.toLowerCase()];
    }

    
    /**
    * This method draws the rose chart
    */
    RGraph.Rose.prototype.Draw = function ()
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
        * This doesn't affect the chart, but is used for compatibility
        */
        this.gutterLeft   = this.Get('chart.gutter.left');
        this.gutterRight  = this.Get('chart.gutter.right');
        this.gutterTop    = this.Get('chart.gutter.top');
        this.gutterBottom = this.Get('chart.gutter.bottom');

        // Calculate the radius
        this.radius       = (Math.min(RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight, RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom) / 2);
        this.centerx      = RGraph.GetWidth(this) / 2;
        this.centery      = RGraph.GetHeight(this) / 2;
        this.angles       = [];
        this.total        = 0;
        this.startRadians = 0;
        
        // User specified radius
        if (typeof(this.Get('chart.radius')) == 'number') {
            this.radius = this.Get('chart.radius');
        }
        
        /**
        * Change the centerx marginally if the key is defined
        */
        if (this.Get('chart.key') && this.Get('chart.key').length > 0 && this.Get('chart.key').length >= 3) {
            this.centerx = this.centerx - this.Get('chart.gutter.right') + 5;
        }

        this.DrawBackground();
        this.DrawRose();
        this.DrawLabels();

        /**
        * Setup the context menu if required
        */
        if (this.Get('chart.contextmenu')) {
            RGraph.ShowContext(this);
        }

        /**
        * Tooltips
        */
        if (this.Get('chart.tooltips')) {

            /**
            * Register this object for redrawing
            */
            RGraph.Register(this);
        
            /**
            * The onclick event
            */
            var canvas_onclick_func = function (e)
            {
                var obj     = e.target.__object__;
                var canvas  = e.target;
                var context = canvas.getContext('2d');

                e = RGraph.FixEventObject(e);

                RGraph.Redraw();
                
                var segment = obj.getSegment(e);

                if (segment && obj.Get('chart.tooltips')) {

                    /**
                    * Get the tooltip text
                    */
                    if (typeof(obj.Get('chart.tooltips')) == 'function') {
                        var text = String(obj.Get('chart.tooltips')(segment[6]));
                    } else if (typeof(obj.Get('chart.tooltips')) == 'object' && typeof(obj.Get('chart.tooltips')[segment[6]]) == 'function') {
                        var text = String(obj.Get('chart.tooltips')[segment[6]](segment[6]));
                    } else if (typeof(obj.Get('chart.tooltips')) == 'object' && (typeof(obj.Get('chart.tooltips')[segment[6]]) == 'string' || typeof(obj.Get('chart.tooltips')[segment[6]]) == 'number')) {
                        var text = String(obj.Get('chart.tooltips')[segment[6]]);
                    } else {
                        var text = null;
                    }

                    if (text) {
                        context.beginPath();
                            context.strokeStyle = obj.Get('chart.highlight.stroke');
                            context.fillStyle   = obj.Get('chart.highlight.fill');
                            
                            // This higlights the chart
                            context.arc(obj.centerx, obj.centery, segment[3], segment[4] / 57.3, segment[5] / 57.3, false);
                            context.arc(obj.centerx, obj.centery, segment[2], segment[5] / 57.3, segment[4] / 57.3, true);
    
                        context.closePath();
    
                        context.fill();
                        context.stroke();
    
                        context.strokeStyle = 'rgba(0,0,0,0)';
                        
                        // Taken out on 12th June 2011
                        //obj.DrawLabels();
                        
                        /**
                        * Show the tooltip
                        */
                        RGraph.Tooltip(canvas, text, e.pageX, e.pageY, segment[6]);
    
                        e.stopPropagation();
                    }

                    return;
                }
            }
            this.canvas.addEventListener('click', canvas_onclick_func, false);
            RGraph.AddEventListener(this.id, 'click', canvas_onclick_func);


            /**
            * The onmousemove event
            */
            var canvas_onmousemove_func = function (e)
            {

                var obj     = e.target.__object__;
                var canvas  = e.target;
                var context = canvas.getContext('2d');

                e = RGraph.FixEventObject(e);

                var segment = obj.getSegment(e);

                if (segment && obj.Get('chart.tooltips')) {

                    /**
                    * Get the tooltip text
                    */
                    if (typeof(obj.Get('chart.tooltips')) == 'function') {
                        var text = String(obj.Get('chart.tooltips')(segment[6]));
                    } else if (typeof(obj.Get('chart.tooltips')) == 'object' && typeof(obj.Get('chart.tooltips')[segment[6]]) == 'function') {
                        var text = String(obj.Get('chart.tooltips')[segment[6]](segment[6]));
                    } else if (typeof(obj.Get('chart.tooltips')) == 'object' && (typeof(obj.Get('chart.tooltips')[segment[6]]) == 'string' || typeof(obj.Get('chart.tooltips')[segment[6]]) == 'number')) {
                        var text = String(obj.Get('chart.tooltips')[segment[6]]);
                    } else {
                        var text = null;
                    }

                    if (text) {
                        canvas.style.cursor = 'pointer';
                
                        /*******************************************************
                        * This is here in case tooltips are using the
                        * onmousemove event
                        *******************************************************/
                        if (obj.Get('chart.tooltips.event') == 'onmousemove') {
                            if (!RGraph.Registry.Get('chart.tooltip') || RGraph.Registry.Get('chart.tooltip').__index__ != segment[6]) {
                                canvas_onclick_func(e);
                            }
                        }

                    } else {
                        canvas.style.cursor = 'default';
                    }

                    return;
                }

                canvas.style.cursor = 'default';
            }
            this.canvas.addEventListener('mousemove', canvas_onmousemove_func, false);
            RGraph.AddEventListener(this.id, 'mousemove', canvas_onmousemove_func);
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
    * This method draws the rose charts background
    */
    RGraph.Rose.prototype.DrawBackground = function ()
    {
        this.context.lineWidth = 1;
    
        // Draw the background grey circles
        this.context.strokeStyle = '#ccc';
        for (var i=15; i<this.radius - (RGraph.isIE8() ? 5 : 0); i+=15) {// Radius must be greater than 0 for Opera to work
            //this.context.moveTo(this.centerx + i, this.centery);
    
            // Radius must be greater than 0 for Opera to work
            this.context.arc(this.centerx, this.centery, i, 0, (2 * Math.PI), 0);
        }
        this.context.stroke();

        // Draw the background lines that go from the center outwards
        this.context.beginPath();
        for (var i=15; i<360; i+=15) {
        
            // Radius must be greater than 0 for Opera to work
            this.context.arc(this.centerx, this.centery, this.radius, i / 57.3, (i + 0.1) / 57.3, 0); // The 0.1 avoids a bug in Chrome 6
        
            this.context.lineTo(this.centerx, this.centery);
        }
        this.context.stroke();
        
        this.context.beginPath();
        this.context.strokeStyle = 'black';
    
        // Draw the X axis
        this.context.moveTo(this.centerx - this.radius, this.centery);
        this.context.lineTo(this.centerx + this.radius, this.centery);
    
        // Draw the X ends
        this.context.moveTo(this.centerx - this.radius, this.centery - 5);
        this.context.lineTo(this.centerx - this.radius, this.centery + 5);
        this.context.moveTo(this.centerx + this.radius, this.centery - 5);
        this.context.lineTo(this.centerx + this.radius, this.centery + 5);
        
        // Draw the X check marks
        for (var i=(this.centerx - this.radius); i<(this.centerx + this.radius); i+=20) {
            this.context.moveTo(i,  this.centery - 3);
            this.context.lineTo(i,  this.centery + 3);
        }
        
        // Draw the Y check marks
        for (var i=(this.centery - this.radius); i<(this.centery + this.radius); i+=20) {
            this.context.moveTo(this.centerx - 3, i);
            this.context.lineTo(this.centerx + 3, i);
        }
    
        // Draw the Y axis
        this.context.moveTo(this.centerx, this.centery - this.radius);
        this.context.lineTo(this.centerx, this.centery + this.radius);
    
        // Draw the Y ends
        this.context.moveTo(this.centerx - 5, this.centery - this.radius);
        this.context.lineTo(this.centerx + 5, this.centery - this.radius);
    
        this.context.moveTo(this.centerx - 5, this.centery + this.radius);
        this.context.lineTo(this.centerx + 5, this.centery + this.radius);
        
        // Stroke it
        this.context.closePath();
        this.context.stroke();
    }


    /**
    * This method draws the data on the graph
    */
    RGraph.Rose.prototype.DrawRose = function ()
    {
        var max  = 0;
        var data = this.data;

        // Must be at least two data points
        if (data.length < 2) {
            alert('[ROSE] Must be at least two data points! [' + data + ']');
            return;
        }
    
        // Work out the maximum value and the sum
        if (!this.Get('chart.ymax')) {
            // Work out the max
            for (var i=0; i<data.length; ++i) {
                if (typeof(data[i]) == 'number') {
                    max = Math.max(max, data[i]);
                } else if (typeof(data[i]) == 'object' && this.Get('chart.variant') == 'non-equi-angular') {
                    max = Math.max(max, data[i][0]);
                
                // Fallback is stacked
                } else {
                    max = Math.max(max, RGraph.array_sum(data[i]));
                }
            }

            this.scale = RGraph.getScale(max, this);
            this.max = this.scale[4];
        } else {
            var ymax = this.Get('chart.ymax');
            var ymin = this.Get('chart.ymin');

            this.scale = [
                          ((ymax - ymin) * 0.2) + ymin,
                          ((ymax - ymin) * 0.4) + ymin,
                          ((ymax - ymin) * 0.6) + ymin,
                          ((ymax - ymin) * 0.8) + ymin,
                          ((ymax - ymin) * 1.0) + ymin
                         ];
            this.max = this.scale[4];
        }
        
        this.sum = RGraph.array_sum(data);
        
        // Move to the centre
        this.context.moveTo(this.centerx, this.centery);
    
        this.context.stroke(); // Stroke the background so it stays grey
    
        // Transparency
        if (this.Get('chart.colors.alpha')) {
            this.context.globalAlpha = this.Get('chart.colors.alpha');
        }

        /*******************************************************
        * A non-equi-angular Rose chart
        *******************************************************/
        if (typeof(this.Get('chart.variant')) == 'string' && this.Get('chart.variant') == 'non-equi-angular') {
            /*******************************************************
            * NON-EQUI-ANGULAR GOES HERE
            *******************************************************/
            var total=0;
            for (var i=0; i<data.length; ++i) {
                total += data[i][1];
            }
            
            
            for (var i=0; i<this.data.length; ++i) {
            
                var segmentRadians = (this.data[i][1] / total) * (2 * Math.PI);
                var radius         = ((this.data[i][0] - this.Get('chart.ymin')) / (this.max - this.Get('chart.ymin'))) * (this.radius - 10);
                
                this.context.strokeStyle = this.Get('chart.strokestyle');
                this.context.fillStyle = this.Get('chart.colors')[0];
                
                if (this.Get('chart.colors.sequential')) {
                    this.context.fillStyle = this.Get('chart.colors')[i];
                }
            
                this.context.beginPath(); // Begin the segment
                    this.context.arc(this.centerx, this.centery, radius, this.startRadians - (Math.PI / 2), this.startRadians + segmentRadians - (Math.PI / 2), 0);
                    this.context.lineTo(this.centerx, this.centery);
                this.context.closePath(); // End the segment
                
                this.context.stroke();
                this.context.fill();
                
                // Store the start and end angles
                this.angles.push([
                                  ((this.startRadians - (Math.PI / 2)) * 57.3) + 90,
                                  (((this.startRadians + segmentRadians) - (Math.PI / 2)) * 57.3) + 90,
                                  0,
                                  radius
                                 ]);

                this.startRadians += segmentRadians;
            }
        } else {
            /*******************************************************
            * Draw the segments
            *******************************************************/
            for (var i=0; i<this.data.length; ++i) {
    
                this.context.strokeStyle = this.Get('chart.strokestyle');
                this.context.fillStyle = this.Get('chart.colors')[0];
                
                /*******************************************************
                * This allows sequential colors
                *******************************************************/
                if (this.Get('chart.colors.sequential')) {
                    this.context.fillStyle = this.Get('chart.colors')[i];
                }
        
                var segmentRadians = (1 / this.data.length) * (2 * Math.PI);
    
                if (typeof(this.data[i]) == 'number') {
                    this.context.beginPath(); // Begin the segment
                        var radius = ((this.data[i] - this.Get('chart.ymin')) / (this.max - this.Get('chart.ymin'))) * (this.radius - 10);
        
                        this.context.arc(this.centerx, this.centery, radius, this.startRadians - (Math.PI / 2), this.startRadians + segmentRadians - (Math.PI / 2), 0);
                        this.context.lineTo(this.centerx, this.centery);
                    this.context.closePath(); // End the segment
                    this.context.stroke();
                    this.context.fill();
                    
                    // Store the start and end angles
                    this.angles.push([
                                      ((this.startRadians - (Math.PI / 2)) * 57.3) + 90,
                                      (((this.startRadians + segmentRadians) - (Math.PI / 2)) * 57.3) + 90,
                                      0,
                                      radius
                                     ]);
                /*******************************************************
                * Draw a stacked segment
                *******************************************************/
                } else if (typeof(this.data[i]) == 'object') {

                    for (var j=0; j<this.data[i].length; ++j) {
    
                        this.context.fillStyle = this.Get('chart.colors')[j];
                        if (j == 0) {
                            this.context.beginPath(); // Begin the segment
                                var startRadius = 0;
                                var endRadius = ((this.data[i][j] - this.Get('chart.ymin')) / (this.max - this.Get('chart.ymin'))) * (this.radius - 10);
                    
                                this.context.arc(this.centerx,
                                                 this.centery,
                                                 endRadius,
                                                 this.startRadians - (Math.PI / 2),
                                                 this.startRadians + segmentRadians - (Math.PI / 2),
                                                 0);
                                this.context.lineTo(this.centerx, this.centery);
                            this.context.closePath(); // End the segment
                            this.context.stroke();
                            this.context.fill();
    
                            this.angles.push([
                                              ((this.startRadians - (Math.PI / 2)) * 57.3) + 90,
                                              (((this.startRadians + segmentRadians) - (Math.PI / 2)) * 57.3) + 90,
                                              0,
                                              endRadius
                                             ]);
                        
                        } else {
                
                            this.context.beginPath(); // Begin the segment
                                var startRadius = endRadius; // This comes from the prior iteration of this loop
                                var endRadius = (((this.data[i][j] - this.Get('chart.ymin')) / (this.max - this.Get('chart.ymin'))) * (this.radius - 10)) + startRadius;
                
                                this.context.arc(this.centerx,
                                                 this.centery,
                                                 startRadius,
                                                 this.startRadians - (Math.PI / 2),
                                                 this.startRadians + segmentRadians - (Math.PI / 2),
                                                 0);
                
                                this.context.arc(this.centerx,
                                                 this.centery,
                                                 endRadius,
                                                 this.startRadians + segmentRadians - (Math.PI / 2),
                                                 this.startRadians - (Math.PI / 2),
                                                 true);
                
                            this.context.closePath(); // End the segment
                            this.context.stroke();
                            this.context.fill();
    
                            this.angles.push([
                                              ((this.startRadians - (Math.PI / 2)) * 57.3) + 90,
                                              ((this.startRadians + segmentRadians - (Math.PI / 2)) * 57.3) + 90,
                                              startRadius,
                                              endRadius
                                             ]);
                        }
                    }
                }
    
                this.startRadians += segmentRadians;
            }
        }

        // Turn off the transparency
        if (this.Get('chart.colors.alpha')) {
            this.context.globalAlpha = 1;
        }

        // Draw the title if any has been set
        if (this.Get('chart.title')) {
            RGraph.DrawTitle(this.canvas,
                             this.Get('chart.title'),
                             (this.canvas.height / 2) - this.radius,
                             this.centerx,
                             this.Get('chart.text.size') + 2);
        }
    }


    /**
    * Unsuprisingly, draws the labels
    */
    RGraph.Rose.prototype.DrawLabels = function ()
    {
        this.context.lineWidth = 1;
        var key = this.Get('chart.key');

        if (key && key.length) {
            RGraph.DrawKey(this, key, this.Get('chart.colors'));
        }
        
        // Set the color to black
        this.context.fillStyle = 'black';
        this.context.strokeStyle = 'black';
        
        var r         = this.radius - 10;
        var font_face = this.Get('chart.text.font');
        var font_size = this.Get('chart.text.size');
        var context   = this.context;
        var axes      = this.Get('chart.labels.axes').toLowerCase();

        // Draw any labels

        if (typeof(this.Get('chart.labels')) == 'object' && this.Get('chart.labels')) {
            this.DrawCircularLabels(context, this.Get('chart.labels'), font_face, font_size, r + 10);
        }


        var color = 'rgba(255,255,255,0.8)';

        // The "North" axis labels
        if (axes.indexOf('n') > -1) {
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery - (r * 0.2), String(Number(this.scale[0]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery - (r * 0.4), String(Number(this.scale[1]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery - (r * 0.6), String(Number(this.scale[2]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery - (r * 0.8), String(Number(this.scale[3]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery - r, String(Number(this.scale[4]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
        }

        // The "South" axis labels
        if (axes.indexOf('s') > -1) {
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery + (r * 0.2), String(Number(this.scale[0]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery + (r * 0.4), String(Number(this.scale[1]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery + (r * 0.6), String(Number(this.scale[2]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery + (r * 0.8), String(Number(this.scale[3]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx, this.centery + r, String(Number(this.scale[4]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
        }
        
        // The "East" axis labels
        if (axes.indexOf('e') > -1) {
            RGraph.Text(context, font_face, font_size, this.centerx + (r * 0.2), this.centery, String(Number(this.scale[0]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx + (r * 0.4), this.centery, String(Number(this.scale[1]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx + (r * 0.6), this.centery, String(Number(this.scale[2]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx + (r * 0.8), this.centery, String(Number(this.scale[3]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx + r, this.centery, String(Number(this.scale[4]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
        }

        // The "West" axis labels
        if (axes.indexOf('w') > -1) {
            RGraph.Text(context, font_face, font_size, this.centerx - (r * 0.2), this.centery, String(Number(this.scale[0]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx - (r * 0.4), this.centery, String(Number(this.scale[1]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx - (r * 0.6), this.centery, String(Number(this.scale[2]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx - (r * 0.8), this.centery, String(Number(this.scale[3]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
            RGraph.Text(context, font_face, font_size, this.centerx - r, this.centery, String(Number(this.scale[4]).toFixed(this.Get('chart.scale.decimals'))), 'center', 'center', true, false, color);
        }

        RGraph.Text(context, font_face, font_size, this.centerx,  this.centery, typeof(this.Get('chart.ymin')) == 'number' ? String(Number(this.Get('chart.ymin')).toFixed(this.Get('chart.scale.decimals'))) : '0', 'center', 'center', true, false, color);
    }


    /**
    * Draws the circular labels that go around the charts
    * 
    * @param labels array The labels that go around the chart
    */
    RGraph.Rose.prototype.DrawCircularLabels = function (context, labels, font_face, font_size, r)
    {
        var variant = this.Get('chart.variant');
        var position = this.Get('chart.labels.position');
        var r        = r + 10 + this.Get('chart.labels.offset');

        for (var i=0; i<labels.length; ++i) {
            
            if (typeof(variant) == 'string' && variant == 'non-equi-angular') {

                var a = Number(this.angles[i][0]) + ((this.angles[i][1] - this.angles[i][0]) / 2);
                    a -= 90;
                var halign = 'center'; // Default halign

                var x = Math.cos(a / 57.29577866666) * (r + 10);
                var y = Math.sin(a / 57.29577866666) * (r + 10);
                
                RGraph.Text(context, font_face, font_size, this.centerx + x, this.centery + y, String(labels[i]), 'center', halign);
                
            } else {

                var a = (360 / labels.length) * (i + 1) - (360 / (labels.length * 2));
                var a = a - 90 + (this.Get('chart.labels.position') == 'edge' ? ((360 / labels.length) / 2) : 0);
                var halign = 'center'; // Default halign
    
                // Horizontal alignment
                //if (a == 0) {
                //    var halign = 'left';
                //} else if (a == 180) {
                //    var halign = 'right';
                //}
    
                var x = Math.cos(a / 57.29577866666) * (r + 10);
                var y = Math.sin(a / 57.29577866666) * (r + 10);
    
                RGraph.Text(context, font_face, font_size, this.centerx + x, this.centery + y, String(labels[i]), 'center', halign);
            }
        }
    }


    /**
    * This function is for use with circular graph types, eg the Pie or Rose. Pass it your event object
    * and it will pass you back the corresponding segment details as an array:
    * 
    * [x, y, r, startAngle, endAngle]
    * 
    * Angles are measured in degrees, and are measured from the "east" axis (just like the canvas).
    * 
    * @param object e   Your event object
    */
    RGraph.Rose.prototype.getSegment = function (e)
    {
        RGraph.FixEventObject(e);

        // The optional arg provides a way of allowing some accuracy (pixels)
        var accuracy = arguments[1] ? arguments[1] : 0;

        var obj         = e.target.__object__;
        var canvas      = obj.canvas;
        var context     = obj.context;
        var mouseCoords = RGraph.getMouseXY(e);
        var x           = mouseCoords[0] - obj.centerx;
        var y           = mouseCoords[1] - obj.centery;
        var r           = obj.radius;
        var theta       = Math.atan(y / x); // RADIANS
        var hyp         = y / Math.sin(theta);
        var angles      = obj.angles;
        var ret         = [];
        var hyp         = (hyp < 0) ? hyp + accuracy : hyp - accuracy;



        // Put theta in DEGREES
        theta *= 57.3

        // hyp should not be greater than radius if it's a Rose chart
        if (obj.type == 'rose') {
            if (   (isNaN(hyp) && Math.abs(mouseCoords[0]) < (obj.centerx - r) )
                || (isNaN(hyp) && Math.abs(mouseCoords[0]) > (obj.centerx + r))
                || (!isNaN(hyp) && Math.abs(hyp) > r)) {
                return;
            }
        }

        /**
        * Account for the correct quadrant
        */
        if (x < 0 && y >= 0) {
            theta += 180;
        } else if (x < 0 && y < 0) {
            theta += 180;
        } else if (x > 0 && y < 0) {
            theta += 360;
        }

        /**
        * Account for the rose chart angle displacement
        */
        theta += 90;

        if (theta > 360) {
            theta -= 360;
        }

        hyp = Math.abs(hyp);

        for (var i=0; i<angles.length; ++i) {
            if (theta >= angles[i][0] && theta < angles[i][1] && hyp > angles[i][2] && hyp < angles[i][3]) {

                if (!(hyp > angles[i][2] && hyp < angles[i][3])) {
                    return null;
                }

                if (!hyp) {
                    return null;
                }

                ret[0] = obj.centerx;
                ret[1] = obj.centery;
                ret[2] = angles[i][2]; // Start angle
                ret[3] = angles[i][3]; // End angle

                ret[4] = angles[i][0]; // Start radius
                ret[5] = angles[i][1]; // End radius
                ret[6] = i;

                ret[4] -= 90;
                ret[5] -= 90;
            
                if (x > 0 && y < 0) {
                    ret[4] += 360;
                    ret[5] += 360;
                }
                
                if (ret[4] < 0) ret[4] += 360;
                if (ret[5] > 360) ret[5] -= 360;

                return ret;
            }
        }
        
        return null;
    }