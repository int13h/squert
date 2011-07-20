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
    * The line chart constructor
    * 
    * @param object canvas The cxanvas object
    * @param array  data   The chart data
    * @param array  ...    Other lines to plot
    */
    RGraph.Line = function (id)
    {
        // Get the canvas and context objects
        this.id      = id;
        this.canvas  = document.getElementById(id);
        this.context = this.canvas.getContext ? this.canvas.getContext("2d") : null;
        this.canvas.__object__ = this;
        this.type              = 'line';
        this.max               = 0;
        this.coords            = [];
        this.coords2           = [];
        this.coords.key        = [];
        this.hasnegativevalues = false;
        this.isRGraph          = true;



        /**
        * Compatibility with older browsers
        */
        RGraph.OldBrowserCompat(this.context);


        // Various config type stuff
        this.properties = {
            'chart.background.barcolor1':   'rgba(0,0,0,0)',
            'chart.background.barcolor2':   'rgba(0,0,0,0)',
            'chart.background.grid':        1,
            'chart.background.grid.width':  1,
            'chart.background.grid.hsize':  25,
            'chart.background.grid.vsize':  25,
            'chart.background.grid.color':  '#ddd',
            'chart.background.grid.vlines': true,
            'chart.background.grid.hlines': true,
            'chart.background.grid.border': true,
            'chart.background.grid.autofit':           false,
            'chart.background.grid.autofit.align':     false,
            'chart.background.grid.autofit.numhlines': 7,
            'chart.background.grid.autofit.numvlines': 20,
            'chart.background.hbars':       null,
            'chart.background.image':       null,
            'chart.labels':                 null,
            'chart.labels.ingraph':         null,
            'chart.labels.above':           false,
            'chart.labels.above.size':      8,
            'chart.xtickgap':               20,
            'chart.smallxticks':            3,
            'chart.largexticks':            5,
            'chart.ytickgap':               20,
            'chart.smallyticks':            3,
            'chart.largeyticks':            5,
            'chart.linewidth':              1.01,
            'chart.colors':                 ['red', '#0f0', '#00f', '#f0f', '#ff0', '#0ff'],
            'chart.hmargin':                0,
            'chart.tickmarks.dot.color':    'white',
            'chart.tickmarks':              null,
            'chart.ticksize':               3,
            'chart.gutter.left':            25,
            'chart.gutter.right':           25,
            'chart.gutter.top':             25,
            'chart.gutter.bottom':          25,
            'chart.tickdirection':          -1,
            'chart.yaxispoints':            5,
            'chart.fillstyle':              null,
            'chart.xaxispos':               'bottom',
            'chart.yaxispos':               'left',
            'chart.xticks':                 null,
            'chart.text.size':              10,
            'chart.text.angle':             0,
            'chart.text.color':             'black',
            'chart.text.font':              'Verdana',
            'chart.ymin':                   null,
            'chart.ymax':                   null,
            'chart.title':                  '',
            'chart.title.background':       null,
            'chart.title.hpos':             null,
            'chart.title.vpos':             0.5,
            'chart.title.xaxis':            '',
            'chart.title.yaxis':            '',
            'chart.title.xaxis.pos':        0.25,
            'chart.title.yaxis.pos':        0.25,
            'chart.shadow':                 false,
            'chart.shadow.offsetx':         2,
            'chart.shadow.offsety':         2,
            'chart.shadow.blur':            3,
            'chart.shadow.color':           'rgba(0,0,0,0.5)',
            'chart.tooltips':               null,
            'chart.tooltips.effect':         'fade',
            'chart.tooltips.css.class':      'RGraph_tooltip',
            'chart.tooltips.highlight':     true,
            'chart.highlight.stroke':       '#999',
            'chart.highlight.fill':         'white',
            'chart.stepped':                false,
            'chart.key':                    [],
            'chart.key.background':         'white',
            'chart.key.position':           'graph',
            'chart.key.halign':             null,
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
            'chart.ylabels':                true,
            'chart.ylabels.count':          5,
            'chart.ylabels.inside':         false,
            'chart.ylabels.invert':         false,
            'chart.xlabels.inside':         false,
            'chart.xlabels.inside.color':   'rgba(255,255,255,0.5)',
            'chart.noaxes':                 false,
            'chart.noyaxis':                false,
            'chart.noxaxis':                false,
            'chart.noendxtick':             false,
            'chart.units.post':             '',
            'chart.units.pre':              '',
            'chart.scale.decimals':         null,
            'chart.scale.point':            '.',
            'chart.scale.thousand':         ',',
            'chart.crosshairs':             false,
            'chart.crosshairs.color':       '#333',
            'chart.annotatable':            false,
            'chart.annotate.color':         'black',
            'chart.axesontop':              false,
            'chart.filled':                 false,
            'chart.filled.range':           false,
            'chart.filled.accumulative':    true,
            'chart.variant':                null,
            'chart.axis.color':             'black',
            'chart.zoom.factor':            1.5,
            'chart.zoom.fade.in':           true,
            'chart.zoom.fade.out':          true,
            'chart.zoom.hdir':              'right',
            'chart.zoom.vdir':              'down',
            'chart.zoom.frames':            15,
            'chart.zoom.delay':             33,
            'chart.zoom.shadow':            true,
            'chart.zoom.mode':              'canvas',
            'chart.zoom.thumbnail.width':   75,
            'chart.zoom.thumbnail.height':  75,
            'chart.zoom.background':        true,
            'chart.zoom.action':            'zoom',
            'chart.backdrop':               false,
            'chart.backdrop.size':          30,
            'chart.backdrop.alpha':         0.2,
            'chart.resizable':              false,
            'chart.resize.handle.adjust':   [0,0],
            'chart.resize.handle.background': null,
            'chart.adjustable':             false,
            'chart.noredraw':               false,
            'chart.outofbounds':            false,
            'chart.chromefix':              true
        }

        /**
        * Change null arguments to empty arrays
        */
        for (var i=1; i<arguments.length; ++i) {
            if (typeof(arguments[i]) == 'null' || !arguments[i]) {
                arguments[i] = [];
            }
        }


        /**
        * Store the original data. Thiss also allows for giving arguments as one big array.
        */
        this.original_data = [];

        for (var i=1; i<arguments.length; ++i) {
            if (arguments[1] && typeof(arguments[1]) == 'object' && arguments[1][0] && typeof(arguments[1][0]) == 'object' && arguments[1][0].length) {

                var tmp = [];

                for (var i=0; i<arguments[1].length; ++i) {
                    tmp[i] = RGraph.array_clone(arguments[1][i]);
                }

                for (var j=0; j<tmp.length; ++j) {
                    this.original_data[j] = RGraph.array_clone(tmp[j]);
                }

            } else {
                this.original_data[i - 1] = RGraph.array_clone(arguments[i]);
            }
        }

        // Check for support
        if (!this.canvas) {
            alert('[LINE] Fatal error: no canvas support');
            return;
        }
        
        /**
        * Store the data here as one big array
        */
        this.data_arr = [];

        for (var i=1; i<arguments.length; ++i) {
            for (var j=0; j<arguments[i].length; ++j) {
                this.data_arr.push(arguments[i][j]);
            }
        }


        /**
        * Set the .getShape commonly named method
        */
        this.getShape = this.getPoint;
    }


    /**
    * An all encompassing accessor
    * 
    * @param string name The name of the property
    * @param mixed value The value of the property
    */
    RGraph.Line.prototype.Set = function (name, value)
    {
        // Consolidate the tooltips
        if (name == 'chart.tooltips') {
        
            var tooltips = [];

            for (var i=1; i<arguments.length; i++) {
                if (typeof(arguments[i]) == 'object' && arguments[i][0]) {
                    for (var j=0; j<arguments[i].length; j++) {
                        tooltips.push(arguments[i][j]);
                    }

                } else if (typeof(arguments[i]) == 'function') {
                    tooltips = arguments[i];

                } else {
                    tooltips.push(arguments[i]);
                }
            }

            // Because "value" is used further down at the end of this function, set it to the expanded array os tooltips
            value = tooltips;
        }

        /**
        * Reverse the tickmarks to make them correspond to the right line
        */
        if (name == 'chart.tickmarks' && typeof(value) == 'object' && value) {
            value = RGraph.array_reverse(value);
        }
        
        /**
        * Inverted Y axis should show the bottom end of the scale
        */
        if (name == 'chart.ylabels.invert' && value && this.Get('chart.ymin') == null) {
            this.Set('chart.ymin', 0);
        }
        
        /**
        * If (buggy) Chrome and the linewidth is 1, change it to 1.01
        */
        if (name == 'chart.linewidth' && navigator.userAgent.match(/Chrome/)) {
            if (value == 1) {
                value = 1.01;
            
            } else if (RGraph.is_array(value)) {
                for (var i=0; i<value.length; ++i) {
                    if (typeof(value[i]) == 'number' && value[i] == 1) {
                        value[i] = 1.01;
                    }
                }
            }
        }
        
        /**
        * Check for xaxispos
        */
        if (name == 'chart.xaxispos' ) {
            if (value != 'bottom' && value != 'center' && value != 'top') {
                alert('[LINE] (' + this.id + ') chart.xaxispos should be top, center or bottom. Tried to set it to: ' + value + ' Changing it to center');
                value = 'center';
            }
        }

        this.properties[name] = value;
    }


    /**
    * An all encompassing accessor
    * 
    * @param string name The name of the property
    */
    RGraph.Line.prototype.Get = function (name)
    {
        return this.properties[name];
    }


    /**
    * The function you call to draw the line chart
    */
    RGraph.Line.prototype.Draw = function ()
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
        * Check for Chrome 6 and shadow
        * 
        * TODO Remove once it's been fixed (for a while)
        * SEARCH TAGS: CHROME FIX SHADOW BUG
        */
        if (   this.Get('chart.shadow')
            && navigator.userAgent.match(/Chrome/)
            && this.Get('chart.linewidth') <= 1
            && this.Get('chart.chromefix')
            && this.Get('chart.shadow.blur') > 0) {
                alert('[RGRAPH WARNING] Chrome has a shadow bug, meaning you should increase the linewidth to at least 1.01');
        }


        // Reset the data back to that which was initially supplied
        this.data = RGraph.array_clone(this.original_data);


        // Reset the max value
        this.max = 0;

        /**
        * Reverse the datasets so that the data and the labels tally
        */
        this.data = RGraph.array_reverse(this.data);

        if (this.Get('chart.filled') && !this.Get('chart.filled.range') && this.data.length > 1 && this.Get('chart.filled.accumulative')) {

            var accumulation = [];
        
            for (var set=0; set<this.data.length; ++set) {
                for (var point=0; point<this.data[set].length; ++point) {
                    this.data[set][point] = Number(accumulation[point] ? accumulation[point] : 0) + this.data[set][point];
                    accumulation[point] = this.data[set][point];
                }
            }
        }

        /**
        * Get the maximum Y scale value
        */
        if (this.Get('chart.ymax')) {
            
            this.max = this.Get('chart.ymax');
            this.min = this.Get('chart.ymin') ? this.Get('chart.ymin') : 0;

            this.scale = [
                          ( ((this.max - this.min) * (1/5)) + this.min).toFixed(this.Get('chart.scale.decimals')),
                          ( ((this.max - this.min) * (2/5)) + this.min).toFixed(this.Get('chart.scale.decimals')),
                          ( ((this.max - this.min) * (3/5)) + this.min).toFixed(this.Get('chart.scale.decimals')),
                          ( ((this.max - this.min) * (4/5)) + this.min).toFixed(this.Get('chart.scale.decimals')),
                          this.max.toFixed(this.Get('chart.scale.decimals'))
                         ];

            // Check for negative values
            if (!this.Get('chart.outofbounds')) {
                for (dataset=0; dataset<this.data.length; ++dataset) {
                    for (var datapoint=0; datapoint<this.data[dataset].length; datapoint++) {
            
                        // Check for negative values
                        this.hasnegativevalues = (this.data[dataset][datapoint] < 0) || this.hasnegativevalues;
                    }
                }
            }

        } else {

            this.min = this.Get('chart.ymin') ? this.Get('chart.ymin') : 0;

            // Work out the max Y value
            for (dataset=0; dataset<this.data.length; ++dataset) {
                for (var datapoint=0; datapoint<this.data[dataset].length; datapoint++) {
    
                    this.max = Math.max(this.max, this.data[dataset][datapoint] ? Math.abs(parseFloat(this.data[dataset][datapoint])) : 0);
    
                    // Check for negative values
                    if (!this.Get('chart.outofbounds')) {
                        this.hasnegativevalues = (this.data[dataset][datapoint] < 0) || this.hasnegativevalues;
                    }
                }
            }

            // 20th April 2009 - moved out of the above loop
            this.scale = RGraph.getScale(Math.abs(parseFloat(this.max)), this);
            this.max   = this.scale[4] ? this.scale[4] : 0;

            if (this.Get('chart.ymin')) {
                this.scale[0] = ((this.max - this.Get('chart.ymin')) * (1/5)) + this.Get('chart.ymin');
                this.scale[1] = ((this.max - this.Get('chart.ymin')) * (2/5)) + this.Get('chart.ymin');
                this.scale[2] = ((this.max - this.Get('chart.ymin')) * (3/5)) + this.Get('chart.ymin');
                this.scale[3] = ((this.max - this.Get('chart.ymin')) * (4/5)) + this.Get('chart.ymin');
                this.scale[4] = ((this.max - this.Get('chart.ymin')) * (5/5)) + this.Get('chart.ymin');
            }

            if (typeof(this.Get('chart.scale.decimals')) == 'number') {
                this.scale[0] = Number(this.scale[0]).toFixed(this.Get('chart.scale.decimals'));
                this.scale[1] = Number(this.scale[1]).toFixed(this.Get('chart.scale.decimals'));
                this.scale[2] = Number(this.scale[2]).toFixed(this.Get('chart.scale.decimals'));
                this.scale[3] = Number(this.scale[3]).toFixed(this.Get('chart.scale.decimals'));
                this.scale[4] = Number(this.scale[4]).toFixed(this.Get('chart.scale.decimals'));
            }
        }

        /**
        * Setup the context menu if required
        */
        if (this.Get('chart.contextmenu')) {
            RGraph.ShowContext(this);
        }

        /**
        * Reset the coords array otherwise it will keep growing
        */
        this.coords = [];

        /**
        * Work out a few things. They need to be here because they depend on things you can change before you
        * call Draw() but after you instantiate the object
        */
        this.grapharea      = RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom;
        this.halfgrapharea  = this.grapharea / 2;
        this.halfTextHeight = this.Get('chart.text.size') / 2;

        // Check the combination of the X axis position and if there any negative values
        //
        // 19th Dec 2010 - removed for Opera since it can be reported incorrectly whn there
        // are multiple graphs on the page
        if (this.Get('chart.xaxispos') == 'bottom' && this.hasnegativevalues && navigator.userAgent.indexOf('Opera') == -1) {
            alert('[LINE] You have negative values and the X axis is at the bottom. This is not good...');
        }

        if (this.Get('chart.variant') == '3d') {
            RGraph.Draw3DAxes(this);
        }
        
        // Progressively Draw the chart
        RGraph.background.Draw(this);

        /**
        * Draw any horizontal bars that have been defined
        */
        if (this.Get('chart.background.hbars') && this.Get('chart.background.hbars').length > 0) {
            RGraph.DrawBars(this);
        }

        if (this.Get('chart.axesontop') == false) {
            this.DrawAxes();
        }

        /**
        * Handle the appropriate shadow color. This now facilitates an array of differing
        * shadow colors
        */
        var shadowColor = this.Get('chart.shadow.color');
        
        if (typeof(shadowColor) == 'object') {
            shadowColor = RGraph.array_reverse(RGraph.array_clone(this.Get('chart.shadow.color')));
        }


        for (var i=(this.data.length - 1), j=0; i>=0; i--, j++) {

            this.context.beginPath();

            /**
            * Turn on the shadow if required
            */
            if (this.Get('chart.shadow') && !this.Get('chart.filled')) {

                /**
                * Accommodate an array of shadow colors as well as a single string
                */
                if (typeof(shadowColor) == 'object' && shadowColor[i - 1]) {
                    this.context.shadowColor = shadowColor[i];
                } else if (typeof(shadowColor) == 'object') {
                    this.context.shadowColor = shadowColor[0];
                } else if (typeof(shadowColor) == 'string') {
                    this.context.shadowColor = shadowColor;
                }

                this.context.shadowBlur    = this.Get('chart.shadow.blur');
                this.context.shadowOffsetX = this.Get('chart.shadow.offsetx');
                this.context.shadowOffsetY = this.Get('chart.shadow.offsety');
            
            } else if (this.Get('chart.filled') && this.Get('chart.shadow')) {
                alert('[LINE] Shadows are not permitted when the line is filled');
            }

            /**
            * Draw the line
            */

            if (this.Get('chart.fillstyle')) {
                if (typeof(this.Get('chart.fillstyle')) == 'object' && this.Get('chart.fillstyle')[j]) {
                   var fill = this.Get('chart.fillstyle')[j];
                
                } else if (typeof(this.Get('chart.fillstyle')) == 'string') {
                    var fill = this.Get('chart.fillstyle');
    
                } else {
                    alert('[LINE] Warning: chart.fillstyle must be either a string or an array with the same number of elements as you have sets of data');
                }
            } else if (this.Get('chart.filled')) {
                var fill = this.Get('chart.colors')[j];

            } else {
                var fill = null;
            }

            /**
            * Figure out the tickmark to use
            */
            if (this.Get('chart.tickmarks') && typeof(this.Get('chart.tickmarks')) == 'object') {
                var tickmarks = this.Get('chart.tickmarks')[i];
            } else if (this.Get('chart.tickmarks') && typeof(this.Get('chart.tickmarks')) == 'string') {
                var tickmarks = this.Get('chart.tickmarks');
            } else if (this.Get('chart.tickmarks') && typeof(this.Get('chart.tickmarks')) == 'function') {
                var tickmarks = this.Get('chart.tickmarks');
            } else {
                var tickmarks = null;
            }


            this.DrawLine(this.data[i],
                          this.Get('chart.colors')[j],
                          fill,
                          this.GetLineWidth(j),
                           tickmarks,
                           this.data.length - i - 1);
                           
            this.context.stroke();
        }













        /**
        * If tooltips are defined, handle them
        */
        if (this.Get('chart.tooltips') && (this.Get('chart.tooltips').length || typeof(this.Get('chart.tooltips')) == 'function')) {

            // Need to register this object for redrawing
            if (this.Get('chart.tooltips.highlight')) {
                RGraph.Register(this);
            }

            canvas_onmousemove_func = function (e)
            {
                e = RGraph.FixEventObject(e);

                var canvas  = e.target;
                var context = canvas.getContext('2d');
                var obj     = canvas.__object__;
                var point   = obj.getPoint(e);

                if (obj.Get('chart.tooltips.highlight')) {
                    RGraph.Register(obj);
                }

                if (   point
                    && typeof(point[0]) == 'object'
                    && typeof(point[1]) == 'number'
                    && typeof(point[2]) == 'number'
                    && typeof(point[3]) == 'number'
                   ) {

                    // point[0] is the graph object
                    var xCoord = point[1];
                    var yCoord = point[2];
                    var idx    = point[3];

                    if ((obj.Get('chart.tooltips')[idx] || typeof(obj.Get('chart.tooltips')) == 'function')) {

                        // Get the tooltip text
                        if (typeof(obj.Get('chart.tooltips')) == 'function') {
                            var text = obj.Get('chart.tooltips')(idx);
                        
                        } else if (typeof(obj.Get('chart.tooltips')) == 'object' && typeof(obj.Get('chart.tooltips')[idx]) == 'function') {
                            var text = obj.Get('chart.tooltips')[idx](idx);
                        
                        } else if (typeof(obj.Get('chart.tooltips')) == 'object') {
                            var text = String(obj.Get('chart.tooltips')[idx]);

                        } else {
                            var text = '';
                        }


                        // No tooltip text - do nada
                        if (text.match(/^id:(.*)$/) && RGraph.getTooltipText(text).substring(0,3) == 'id:') {
                            return;
                        }

                        // Chnage the pointer to a hand
                        canvas.style.cursor = 'pointer';

                        /**
                        * If the tooltip is the same one as is currently visible (going by the array index), don't do squat and return.
                        */
                        if (RGraph.Registry.Get('chart.tooltip') && RGraph.Registry.Get('chart.tooltip').__index__ == idx && RGraph.Registry.Get('chart.tooltip').__canvas__.id == canvas.id) {
                            return;
                        }

                        /**
                        * Redraw the graph
                        */
                        if (obj.Get('chart.tooltips.highlight')) {
                           // Redraw the graph
                            RGraph.Redraw();
                        }
    
                        // SHOW THE CORRECT TOOLTIP
                        RGraph.Tooltip(canvas, text, e.pageX, e.pageY, idx);
                        
                        // Store the tooltip index on the tooltip object
                        RGraph.Registry.Get('chart.tooltip').__index__ = Number(idx);

                        /**
                        * Highlight the graph
                        */
                        if (obj.Get('chart.tooltips.highlight')) {
                            context.beginPath();
                            context.moveTo(xCoord, yCoord);
                            context.arc(xCoord, yCoord, 2, 0, 6.28, 0);
                            context.strokeStyle = obj.Get('chart.highlight.stroke');
                            context.fillStyle = obj.Get('chart.highlight.fill');
                            context.stroke();
                            context.fill();
                        }
                        
                        e.stopPropagation();
                        return;
                    }
                }
                
                /**
                * Not over a hotspot?
                */
                canvas.style.cursor = 'default';
            }
            
            this.canvas.addEventListener('mousemove', canvas_onmousemove_func, false);
            RGraph.AddEventListener(this.id, 'mousemove', canvas_onmousemove_func);
        }














        /**
        * If the axes have been requested to be on top, do that
        */
        if (this.Get('chart.axesontop')) {
            this.DrawAxes();
        }

        /**
        * Draw the labels
        */
        this.DrawLabels();
        
        /**
        * Draw the range if necessary
        */
        this.DrawRange();
        
        // Draw a key if necessary
        if (this.Get('chart.key').length) {
            RGraph.DrawKey(this, this.Get('chart.key'), this.Get('chart.colors'));
        }

        /**
        * Draw " above" labels if enabled
        */
        if (this.Get('chart.labels.above')) {
            this.DrawAboveLabels();
        }

        /**
        * Draw the "in graph" labels
        */
        RGraph.DrawInGraphLabels(this);

        /**
        * Draw crosschairs
        */
        RGraph.DrawCrosshairs(this);
        
        /**
        * If the canvas is annotatable, do install the event handlers
        */
        if (this.Get('chart.annotatable')) {
            RGraph.Annotate(this);
        }

        /**
        * Redraw the lines if a filled range is on the cards
        */
        if (this.Get('chart.filled') && this.Get('chart.filled.range') && this.data.length == 2) {

            this.context.beginPath();
            var len = this.coords.length / 2;
            this.context.lineWidth = this.Get('chart.linewidth');
            this.context.strokeStyle = this.Get('chart.colors')[0];

            for (var i=0; i<len; ++i) {
                if (i == 0) {
                    this.context.moveTo(this.coords[i][0], this.coords[i][1]);
                } else {
                    this.context.lineTo(this.coords[i][0], this.coords[i][1]);
                }
            }
            
            this.context.stroke();


            this.context.beginPath();
            
            if (this.Get('chart.colors')[1]) {
                this.context.strokeStyle = this.Get('chart.colors')[1];
            }
            
            for (var i=this.coords.length - 1; i>=len; --i) {
                if (i == (this.coords.length - 1) ) {
                    this.context.moveTo(this.coords[i][0], this.coords[i][1]);
                } else {
                    this.context.lineTo(this.coords[i][0], this.coords[i][1]);
                }
            }
            
            this.context.stroke();
        } else if (this.Get('chart.filled') && this.Get('chart.filled.range')) {
            alert('[LINE] You must have only two sets of data for a filled range chart');
        }

        /**
        * This bit shows the mini zoom window if requested
        */
        if (this.Get('chart.zoom.mode') == 'thumbnail') {
            RGraph.ShowZoomWindow(this);
        }

        /**
        * This function enables the zoom in area mode
        */
        if (this.Get('chart.zoom.mode') == 'area') {
            RGraph.ZoomArea(this);
        }
        
        /**
        * This function enables resizing
        */
        if (this.Get('chart.resizable')) {
            RGraph.AllowResizing(this);
        }
        
        /**
        * This function enables adjustments
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
    * Draws the axes
    */
    RGraph.Line.prototype.DrawAxes = function ()
    {
        // Don't draw the axes?
        if (this.Get('chart.noaxes')) {
            return;
        }

        // Turn any shadow off
        RGraph.NoShadow(this);

        this.context.lineWidth   = 1;
        this.context.strokeStyle = this.Get('chart.axis.color');
        this.context.beginPath();

        // Draw the X axis
        if (this.Get('chart.noxaxis') == false) {
            if (this.Get('chart.xaxispos') == 'center') {
                this.context.moveTo(this.gutterLeft, (this.grapharea / 2) + this.gutterTop);
                this.context.lineTo(RGraph.GetWidth(this) - this.gutterRight, (this.grapharea / 2) + this.gutterTop);
            } else if (this.Get('chart.xaxispos') == 'top') {
                this.context.moveTo(this.gutterLeft, this.gutterTop);
                this.context.lineTo(RGraph.GetWidth(this) - this.gutterRight, this.gutterTop);
            } else {
                this.context.moveTo(this.gutterLeft, RGraph.GetHeight(this) - this.gutterBottom);
                this.context.lineTo(RGraph.GetWidth(this) - this.gutterRight, RGraph.GetHeight(this) - this.gutterBottom);
            }
        }
        
        // Draw the Y axis
        if (this.Get('chart.noyaxis') == false) {
            if (this.Get('chart.yaxispos') == 'left') {
                this.context.moveTo(this.gutterLeft, this.gutterTop);
                this.context.lineTo(this.gutterLeft, RGraph.GetHeight(this) - this.gutterBottom );
            } else {
                this.context.moveTo(RGraph.GetWidth(this) - this.gutterRight, this.gutterTop);
                this.context.lineTo(RGraph.GetWidth(this) - this.gutterRight, RGraph.GetHeight(this) - this.gutterBottom);
            }
        }

        /**
        * Draw the X tickmarks
        */
        if (this.Get('chart.noxaxis') == false) {

            var xTickInterval = (RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight) / (this.Get('chart.xticks') ? this.Get('chart.xticks') : (this.data[0].length - 1));
    
            for (x=this.gutterLeft + (this.Get('chart.yaxispos') == 'left' ? xTickInterval : 0); x<=(RGraph.GetWidth(this) - this.gutterRight + 1 ); x+=xTickInterval) {

                if (this.Get('chart.yaxispos') == 'right' && x >= (RGraph.GetWidth(this) - this.gutterRight - 1) ) {
                    break;
                }
                
                // If the last tick is not desired...
                if (this.Get('chart.noendxtick')) {
                    if (this.Get('chart.yaxispos') == 'left' && x >= (RGraph.GetWidth(this) - this.gutterRight)) {
                        break;
                    } else if (this.Get('chart.yaxispos') == 'right' && x == this.gutterLeft) {
                        continue;
                    }
                }
    
                var yStart = this.Get('chart.xaxispos') == 'center' ? (this.gutterTop + (this.grapharea / 2)) - 3 : RGraph.GetHeight(this) - this.gutterBottom;
                var yEnd = this.Get('chart.xaxispos') == 'center' ? yStart + 6 : RGraph.GetHeight(this) - this.gutterBottom - (x % 60 == 0 ? this.Get('chart.largexticks') * this.Get('chart.tickdirection') : this.Get('chart.smallxticks') * this.Get('chart.tickdirection'));
                
                if (this.Get('chart.xaxispos') == 'top') {
                    yStart = this.gutterTop - 3;
                    yEnd   = this.gutterTop;
                }

                this.context.moveTo(x, yStart);
                this.context.lineTo(x, yEnd);
            }

        // Draw an extra tickmark if there is no X axis, but there IS a Y axis
        } else if (this.Get('chart.noyaxis') == false) {
            if (this.Get('chart.yaxispos') == 'left') {
                this.context.moveTo(this.gutterLeft, RGraph.GetHeight(this) - this.gutterBottom);
                this.context.lineTo(this.gutterLeft - this.Get('chart.smallyticks'), RGraph.GetHeight(this) - this.gutterBottom);
            } else {
                this.context.moveTo(RGraph.GetWidth(this) - this.gutterRight, RGraph.GetHeight(this) - this.gutterBottom);
                this.context.lineTo(RGraph.GetWidth(this) - this.gutterRight + this.Get('chart.smallyticks'), RGraph.GetHeight(this) - this.gutterBottom);
            }
        }

        /**
        * Draw the Y tickmarks
        */
        if (this.Get('chart.noyaxis') == false) {
            var counter    = 0;
            var adjustment = 0;
    
            if (this.Get('chart.yaxispos') == 'right') {
                adjustment = (RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight);
            }
            
            // X axis at the center
            if (this.Get('chart.xaxispos') == 'center') {
                var interval = (this.grapharea / 10);
                var lineto = (this.Get('chart.yaxispos') == 'left' ? this.gutterLeft : RGraph.GetWidth(this) - this.gutterRight + this.Get('chart.smallyticks'));
    
                // Draw the upper halves Y tick marks
                for (y=this.gutterTop; y < (this.grapharea / 2) + this.gutterTop; y+=interval) {
                    this.context.moveTo((this.Get('chart.yaxispos') == 'left' ? this.gutterLeft - this.Get('chart.smallyticks') : RGraph.GetWidth(this) - this.gutterRight), y);
                    this.context.lineTo(lineto, y);
                }
                
                // Draw the lower halves Y tick marks
                for (y=this.gutterTop + (this.halfgrapharea) + interval; y <= this.grapharea + this.gutterTop; y+=interval) {
                    this.context.moveTo((this.Get('chart.yaxispos') == 'left' ? this.gutterLeft - this.Get('chart.smallyticks') : RGraph.GetWidth(this) - this.gutterRight), y);
                    this.context.lineTo(lineto, y);
                }
            
            // X axis at the top
            } else if (this.Get('chart.xaxispos') == 'top') {
                var interval = (this.grapharea / 10);
                var lineto = (this.Get('chart.yaxispos') == 'left' ? this.gutterLeft : RGraph.GetWidth(this) - this.gutterRight + this.Get('chart.smallyticks'));

                // Draw the Y tick marks
                for (y=this.gutterTop + interval; y <=this.grapharea + this.gutterTop; y+=interval) {
                    this.context.moveTo((this.Get('chart.yaxispos') == 'left' ? this.gutterLeft - this.Get('chart.smallyticks') : RGraph.GetWidth(this) - this.gutterRight), y);
                    this.context.lineTo(lineto, y);
                }
                
                // If there's no X axis draw an extra tick
                if (this.Get('chart.noxaxis')) {
                    this.context.moveTo((this.Get('chart.yaxispos') == 'left' ? this.gutterLeft - this.Get('chart.smallyticks') : RGraph.GetWidth(this) - this.gutterRight), this.gutterTop);
                    this.context.lineTo(lineto, this.gutterTop);
                }
            
            // X axis at the bottom
            } else {
                var lineto = (this.Get('chart.yaxispos') == 'left' ? this.gutterLeft - this.Get('chart.smallyticks') : RGraph.GetWidth(this) - this.gutterRight + this.Get('chart.smallyticks'));
    
                for (y=this.gutterTop; y < (RGraph.GetHeight(this) - this.gutterBottom) && counter < 10; y+=( (RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom) / 10) ) {
    
                    this.context.moveTo(this.gutterLeft + adjustment, y);
                    this.context.lineTo(lineto, y);
                
                    var counter = counter +1;
                }
            }

        // Draw an extra X tickmark
        } else if (this.Get('chart.noxaxis') == false) {

            if (this.Get('chart.yaxispos') == 'left') {
                this.context.moveTo(this.gutterLeft, this.Get('chart.xaxispos') == 'top' ? this.gutterTop : RGraph.GetHeight(this) - this.gutterBottom);
                this.context.lineTo(this.gutterLeft, this.Get('chart.xaxispos') == 'top' ? this.gutterTop - this.Get('chart.smallxticks') : RGraph.GetHeight(this) - this.gutterBottom + this.Get('chart.smallxticks'));
           } else {
                this.context.moveTo(RGraph.GetWidth(this) - this.gutterRight, RGraph.GetHeight(this) - this.gutterBottom);
                this.context.lineTo(RGraph.GetWidth(this) - this.gutterRight, RGraph.GetHeight(this) - this.gutterBottom + this.Get('chart.smallxticks'));
            }
        }

        this.context.stroke();
    }


    /**
    * Draw the text labels for the axes
    */
    RGraph.Line.prototype.DrawLabels = function ()
    {
        this.context.strokeStyle = 'black';
        this.context.fillStyle   = this.Get('chart.text.color');
        this.context.lineWidth   = 1;
        
        // Turn off any shadow
        RGraph.NoShadow(this);

        // This needs to be here
        var font      = this.Get('chart.text.font');
        var text_size = this.Get('chart.text.size');
        var context   = this.context;
        var canvas    = this.canvas;

        // Draw the Y axis labels
        if (this.Get('chart.ylabels') && this.Get('chart.ylabels.specific') == null) {

            var units_pre  = this.Get('chart.units.pre');
            var units_post = this.Get('chart.units.post');
            var xpos       = this.Get('chart.yaxispos') == 'left' ? this.gutterLeft - 5 : RGraph.GetWidth(this) - this.gutterRight + 5;
            var align      = this.Get('chart.yaxispos') == 'left' ? 'right' : 'left';
            
            var numYLabels = this.Get('chart.ylabels.count');
            var bounding   = false;
            var bgcolor    = this.Get('chart.ylabels.inside') ? this.Get('chart.ylabels.inside.color') : null;

            
            /**
            * If the Y labels are inside the Y axis, invert the alignment
            */
            if (this.Get('chart.ylabels.inside') == true && align == 'left') {
                xpos -= 10;
                align = 'right';
                bounding = true;
                

            } else if (this.Get('chart.ylabels.inside') == true && align == 'right') {
                xpos += 10;
                align = 'left';
                bounding = true;
            }



            if (this.Get('chart.xaxispos') == 'center') {
                var half = this.grapharea / 2;

                if (numYLabels == 1 || numYLabels == 3 || numYLabels == 5) {
                    //  Draw the upper halves labels
                    RGraph.Text(context, font, text_size, xpos, this.gutterTop + ( (0/5) * half ) + this.halfTextHeight, RGraph.number_format(this, this.scale[4], units_pre, units_post), null, align, bounding, null, bgcolor);
    
                    if (numYLabels == 5) {
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + ( (1/5) * half ) + this.halfTextHeight, RGraph.number_format(this, this.scale[3], units_pre, units_post), null, align, bounding, null, bgcolor);
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + ( (3/5) * half ) + this.halfTextHeight, RGraph.number_format(this, this.scale[1], units_pre, units_post), null, align, bounding, null, bgcolor);
                    }
    
                    if (numYLabels >= 3) {
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + ( (2/5) * half ) + this.halfTextHeight, RGraph.number_format(this, this.scale[2], units_pre, units_post), null, align, bounding, null, bgcolor);
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + ( (4/5) * half ) + this.halfTextHeight, RGraph.number_format(this, this.scale[0], units_pre, units_post), null, align, bounding, null, bgcolor);
                    }
                    
                    //  Draw the lower halves labels
                    if (numYLabels >= 3) {
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + ( (6/5) * half ) + this.halfTextHeight, '-' + RGraph.number_format(this, this.scale[0], units_pre, units_post), null, align, bounding, null, bgcolor);
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + ( (8/5) * half ) + this.halfTextHeight, '-' + RGraph.number_format(this, this.scale[2], units_pre, units_post), null, align, bounding, null, bgcolor);
                    }
    
                    if (numYLabels == 5) {
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + ( (7/5) * half ) + this.halfTextHeight, '-' + RGraph.number_format(this, this.scale[1], units_pre, units_post), null, align, bounding, null, bgcolor);
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + ( (9/5) * half ) + this.halfTextHeight, '-' + RGraph.number_format(this, this.scale[3], units_pre, units_post), null, align, bounding, null, bgcolor);
                    }
    
                    RGraph.Text(context, font, text_size, xpos, this.gutterTop + ( (10/5) * half ) + this.halfTextHeight, '-' + RGraph.number_format(this, (this.scale[4] == '1.0' ? '1.0' : this.scale[4]), units_pre, units_post), null, align, bounding, null, bgcolor);
                
                } else if (numYLabels == 10) {

                    // 10 Y labels
                    var interval = (this.grapharea / numYLabels) / 2;
                
                    for (var i=0; i<numYLabels; ++i) {
                        // This draws the upper halves labels
                        RGraph.Text(context,font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((i/20) * (this.grapharea) ), RGraph.number_format(this, ((this.scale[4] / numYLabels) * (numYLabels - i)).toFixed((this.Get('chart.scale.decimals'))),units_pre, units_post), null, align, bounding, null, bgcolor);
                        
                        // And this draws the lower halves labels
                        RGraph.Text(context, font, text_size, xpos,
                        
                        this.gutterTop + this.halfTextHeight + ((i/20) * this.grapharea) + (this.grapharea / 2) + (this.grapharea / 20),
                        
                        '-' + RGraph.number_format(this, (this.scale[4] - ((this.scale[4] / numYLabels) * (numYLabels - i - 1))).toFixed((this.Get('chart.scale.decimals'))),units_pre, units_post), null, align, bounding, null, bgcolor);
                    }
                    
                } else {
                    alert('[LINE SCALE] The number of Y labels must be 1/3/5/10');
                }

                // Draw the lower limit if chart.ymin is specified
                if (typeof(this.Get('chart.ymin')) == 'number') {
                    RGraph.Text(context, font, text_size, xpos, RGraph.GetHeight(this) / 2, RGraph.number_format(this, this.Get('chart.ymin').toFixed(this.Get('chart.scale.decimals')), units_pre, units_post), 'center', align, bounding, null, bgcolor);
                }
                
                // No X axis - so draw 0
                if (this.Get('chart.noxaxis') == true) {
                    RGraph.Text(context,font,text_size,xpos,this.gutterTop + ( (5/5) * half ) + this.halfTextHeight,'0',null, align, bounding, null, bgcolor);
                }

            // X axis at the top
            } else if (this.Get('chart.xaxispos') == 'top') {

                var scale = RGraph.array_reverse(this.scale);

                /**
                * Accommodate reversing the Y labels
                */
                if (this.Get('chart.ylabels.invert')) {

                    scale = RGraph.array_reverse(scale);

                    this.context.translate(0, this.grapharea * -0.2);
                    if (typeof(this.Get('chart.ymin')) == null) {
                        this.Set('chart.ymin', 0);
                    }
                }

                if (numYLabels == 1 || numYLabels == 3 || numYLabels == 5) {
                    RGraph.Text(context, font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((1/5) * (this.grapharea ) ), '-' + RGraph.number_format(this, scale[4], units_pre, units_post), null, align, bounding, null, bgcolor);
    
                    if (numYLabels == 5) {
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((4/5) * (this.grapharea) ), '-' + RGraph.number_format(this, scale[1], units_pre, units_post), null, align, bounding, null, bgcolor);
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((2/5) * (this.grapharea) ), '-' + RGraph.number_format(this, scale[3], units_pre, units_post), null, align, bounding, null, bgcolor);
                    }
    
                    if (numYLabels >= 3) {
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((3/5) * (this.grapharea ) ), '-' + RGraph.number_format(this, scale[2], units_pre, units_post), null, align, bounding, null, bgcolor);
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((5/5) * (this.grapharea) ), '-' + RGraph.number_format(this, scale[0], units_pre, units_post), null, align, bounding, null, bgcolor);
                    }
                
                } else if (numYLabels == 10) {

                    // 10 Y labels
                    var interval = (this.grapharea / numYLabels) / 2;

                    for (var i=0; i<numYLabels; ++i) {

                        RGraph.Text(context,font,text_size,xpos,(2 * interval) + this.gutterTop + this.halfTextHeight + ((i/10) * (this.grapharea) ),'-' + RGraph.number_format(this,(scale[0] - (((scale[0] - this.min) / numYLabels) * (numYLabels - i - 1))).toFixed((this.Get('chart.scale.decimals'))),units_pre,units_post),null,align,bounding,null,bgcolor);
                    }

                } else {
                    alert('[LINE SCALE] The number of Y labels must be 1/3/5/10');
                }


                /**
                * Accommodate translating back after reversing the labels
                */
                if (this.Get('chart.ylabels.invert')) {
                    this.context.translate(0, 0 - (this.grapharea * -0.2));
                }

                // Draw the lower limit if chart.ymin is specified
                if (typeof(this.Get('chart.ymin')) == 'number') {
                    RGraph.Text(context,font,text_size,xpos,this.Get('chart.ylabels.invert') ? this.canvas.height - this.gutterBottom : this.gutterTop,'-' + RGraph.number_format(this, this.Get('chart.ymin').toFixed(this.Get('chart.scale.decimals')), units_pre, units_post),'center',align,bounding,null,bgcolor);
                }

            } else {

                /**
                * Accommodate reversing the Y labels
                */
                if (this.Get('chart.ylabels.invert')) {
                    this.scale = RGraph.array_reverse(this.scale);
                    this.context.translate(0, this.grapharea * 0.2);
                    if (typeof(this.Get('chart.ymin')) == null) {
                        this.Set('chart.ymin', 0);
                    }
                }

                if (numYLabels == 1 || numYLabels == 3 || numYLabels == 5) {
                    RGraph.Text(context, font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((0/5) * (this.grapharea ) ), RGraph.number_format(this, this.scale[4], units_pre, units_post), null, align, bounding, null, bgcolor);
    
                    if (numYLabels == 5) {
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((3/5) * (this.grapharea) ), RGraph.number_format(this, this.scale[1], units_pre, units_post), null, align, bounding, null, bgcolor);
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((1/5) * (this.grapharea) ), RGraph.number_format(this, this.scale[3], units_pre, units_post), null, align, bounding, null, bgcolor);
                    }
    
                    if (numYLabels >= 3) {
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((2/5) * (this.grapharea ) ), RGraph.number_format(this, this.scale[2], units_pre, units_post), null, align, bounding, null, bgcolor);
                        RGraph.Text(context, font, text_size, xpos, this.gutterTop + this.halfTextHeight + ((4/5) * (this.grapharea) ), RGraph.number_format(this, this.scale[0], units_pre, units_post), null, align, bounding, null, bgcolor);
                    }
                
                } else if (numYLabels == 10) {

                    // 10 Y labels
                    var interval = (this.grapharea / numYLabels) / 2;
                
                    for (var i=0; i<numYLabels; ++i) {
                        RGraph.Text(context,font,text_size,xpos,this.gutterTop + this.halfTextHeight + ((i/10) * (this.grapharea) ),RGraph.number_format(this,((((this.scale[4] - this.min) / numYLabels) * (numYLabels - i)) + this.min).toFixed((this.Get('chart.scale.decimals'))),units_pre,units_post),null,align,bounding,null,bgcolor);
                    }

                } else {
                    alert('[LINE SCALE] The number of Y labels must be 1/3/5/10');
                }


                /**
                * Accommodate translating back after reversing the labels
                */
                if (this.Get('chart.ylabels.invert')) {
                    this.context.translate(0, 0 - (this.grapharea * 0.2));
                }

                // Draw the lower limit if chart.ymin is specified
                if (typeof(this.Get('chart.ymin')) == 'number') {
                    RGraph.Text(context,font,text_size,xpos,this.Get('chart.ylabels.invert') ? this.gutterTop : RGraph.GetHeight(this) - this.gutterBottom,RGraph.number_format(this, this.Get('chart.ymin').toFixed(this.Get('chart.scale.decimals')), units_pre, units_post),'center',align,bounding,null,bgcolor);
                }
            }

            // No X axis - so draw 0
            if (   this.Get('chart.noxaxis') == true
                && this.Get('chart.ymin') == null
               ) {

                RGraph.Text(context,font,text_size,xpos,this.Get('chart.xaxispos') == 'top' ? this.gutterTop + this.halfTextHeight: (RGraph.GetHeight(this) - this.gutterBottom + this.halfTextHeight),'0',null, align, bounding, null, bgcolor);
            }
        
        } else if (this.Get('chart.ylabels') && typeof(this.Get('chart.ylabels.specific')) == 'object') {
            
            // A few things
            var gap      = this.grapharea / this.Get('chart.ylabels.specific').length;
            var halign   = this.Get('chart.yaxispos') == 'left' ? 'right' : 'left';
            var bounding = false;
            var bgcolor  = null;
            
            // Figure out the X coord based on the position of the axis
            if (this.Get('chart.yaxispos') == 'left') {
                var x = this.gutterLeft - 5;
                
                if (this.Get('chart.ylabels.inside')) {
                    x += 10;
                    halign   = 'left';
                    bounding = true;
                    bgcolor  = 'rgba(255,255,255,0.5)';
                }

            } else if (this.Get('chart.yaxispos') == 'right') {
                var x = RGraph.GetWidth(this) - this.gutterRight + 5;
                
                if (this.Get('chart.ylabels.inside')) {
                    x -= 10;
                    halign = 'right';
                    bounding = true;
                    bgcolor  = 'rgba(255,255,255,0.5)';
                }
            }


            // Draw the labels
            if (this.Get('chart.xaxispos') == 'center') {
            
                // Draw the top halfs labels
                for (var i=0; i<this.Get('chart.ylabels.specific').length; ++i) {
                    var y = this.gutterTop + ((this.grapharea / (this.Get('chart.ylabels.specific').length * 2) ) * i);
                    RGraph.Text(context, font, text_size,x,y,String(this.Get('chart.ylabels.specific')[i]), 'center', halign, bounding, 0, bgcolor);
                }
                
                // Now reverse the labels and draw the bottom half
                var reversed_labels = RGraph.array_reverse(this.Get('chart.ylabels.specific'));
            
                // Draw the bottom halfs labels
                for (var i=0; i<reversed_labels.length; ++i) {
                    var y = (this.grapharea / 2) + this.gutterTop + ((this.grapharea / (reversed_labels.length * 2) ) * (i + 1));
                    RGraph.Text(context, font, text_size,x,y,String(reversed_labels[i]), 'center', halign, bounding, 0, bgcolor);
                }
            
            } else if (this.Get('chart.xaxispos') == 'top') {

                // Reverse the labels and draw
                var reversed_labels = RGraph.array_reverse(this.Get('chart.ylabels.specific'));
            
                // Draw the bottom halfs labels
                for (var i=0; i<reversed_labels.length; ++i) {
                    var y = this.gutterTop + ((this.grapharea / reversed_labels.length ) * (i + 1));
                    RGraph.Text(context, font, text_size,x,y,String(reversed_labels[i]), 'center', halign, bounding, 0, bgcolor);
                }

            } else {
                for (var i=0; i<this.Get('chart.ylabels.specific').length; ++i) {
                    
                    var y = this.gutterTop + ((this.grapharea / this.Get('chart.ylabels.specific').length) * i);

                    RGraph.Text(context, font, text_size,x,y,String(this.Get('chart.ylabels.specific')[i]), 'center', halign, bounding, 0, bgcolor);
                }
            }
        }

        // Draw the X axis labels
        if (this.Get('chart.labels') && this.Get('chart.labels').length > 0) {


            var yOffset  = 13;
            var bordered = false;
            var bgcolor  = null;

            if (this.Get('chart.xlabels.inside')) {
                yOffset = -5;
                bordered = true;
                bgcolor  = this.Get('chart.xlabels.inside.color');
            }

            /**
            * Text angle
            */
            var angle  = 0;
            var valign = null;
            var halign = 'center';

            if (typeof(this.Get('chart.text.angle')) == 'number' && this.Get('chart.text.angle') > 0) {
                angle   = -1 * this.Get('chart.text.angle');
                valign  = 'center';
                halign  = 'right';
                yOffset = 10;
                
                if (this.Get('chart.xaxispos') == 'top') {
                    yOffset = 10;
                }
            }

            this.context.fillStyle = this.Get('chart.text.color');
            var numLabels = this.Get('chart.labels').length;

            for (i=0; i<numLabels; ++i) {

                // Changed 8th Nov 2010 to be not reliant on the coords
                //if (this.Get('chart.labels')[i] && this.coords && this.coords[i] && this.coords[i][0]) {
                if (this.Get('chart.labels')[i]) {

                    var labelX = ((RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight - (2 * this.Get('chart.hmargin'))) / (numLabels - 1) ) * i;
                        labelX += this.gutterLeft + this.Get('chart.hmargin');

                    /**
                    * Account for an unrelated number of labels
                    */
                    if (this.Get('chart.labels').length != this.data[0].length) {
                        labelX = this.gutterLeft + this.Get('chart.hmargin') + ((RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight - (2 * this.Get('chart.hmargin'))) * (i / (this.Get('chart.labels').length - 1)));
                    }
                    
                    // This accounts for there only being one point on the chart
                    if (!labelX) {
                        labelX = this.gutterLeft + this.Get('chart.hmargin');
                    }

                    if (this.Get('chart.xaxispos') == 'top' && this.Get('chart.text.angle') > 0) {
                        halign = 'left';
                    }

                    RGraph.Text(context,
                                font,
                                text_size,
                                labelX,
                                (this.Get('chart.xaxispos') == 'top') ? this.gutterTop - yOffset - (this.Get('chart.xlabels.inside') ? -22 : 0) : (RGraph.GetHeight(this) - this.gutterBottom) + yOffset,
                                String(this.Get('chart.labels')[i]),
                                valign,
                                halign,
                                bordered,
                                angle,
                                bgcolor);
                }
            }

        }

        this.context.stroke();
        this.context.fill();
    }


    /**
    * Draws the line
    */
    RGraph.Line.prototype.DrawLine = function (lineData, color, fill, linewidth, tickmarks, index)
    {
        var penUp = false;
        var yPos  = null;
        var xPos  = 0;
        this.context.lineWidth = 1;
        var lineCoords = [];

        // Work out the X interval
        var xInterval = (this.canvas.width - (2 * this.Get('chart.hmargin')) - this.gutterLeft - this.gutterRight) / (lineData.length - 1);

        // Loop thru each value given, plotting the line
        for (i=0; i<lineData.length; i++) {

            var data_point = lineData[i];


            yPos = this.canvas.height - (((data_point - (data_point > 0 ?  this.Get('chart.ymin') : (-1 * this.Get('chart.ymin')))) / (this.max - this.min) ) * this.grapharea);
            yPos = (this.grapharea / (this.max - this.min)) * (data_point - this.min);
            yPos = this.canvas.height - yPos;
            
            /**
            * This skirts an annoying JS rounding error
            * SEARCH TAGS: JS ROUNDING ERROR DECIMALS
            */
            if (data_point == this.max) {
                yPos = Math.round(yPos);
            }

            if (this.Get('chart.ylabels.invert')) {
                yPos -= this.gutterBottom;
                yPos -= this.gutterTop;
                yPos = this.canvas.height - yPos;
            }

            // Make adjustments depending on the X axis position
            if (this.Get('chart.xaxispos') == 'center') {
                yPos = (yPos - this.gutterBottom - this.gutterTop) / 2;
                yPos = yPos + this.gutterTop;
            
            // TODO Check this
            } else if (this.Get('chart.xaxispos') == 'top') {

                yPos = (this.grapharea / (this.max - this.min)) * (Math.abs(data_point) - this.min);
                yPos += this.gutterTop;
                
                if (this.Get('chart.ylabels.invert')) {
                    yPos -= this.gutterTop;
                    yPos  = this.grapharea - yPos;
                    yPos += this.gutterTop;
                }

            } else if (this.Get('chart.xaxispos') == 'bottom') {
                // TODO
                yPos -= this.gutterBottom; // Without this the line is out of place due to the gutter
            }



            // Null data points, and a special case for this bug:http://dev.rgraph.net/tests/ymin.html
            if (   lineData[i] == null
                || (this.Get('chart.xaxispos') == 'bottom' && lineData[i] < this.min && !this.Get('chart.outofbounds'))
                ||  (this.Get('chart.xaxispos') == 'center' && lineData[i] < (-1 * this.max) && !this.Get('chart.outofbounds'))) {

                yPos = null;
            }

            // Not always very noticeable, but it does have an effect
            // with thick lines
            this.context.lineCap  = 'round';
            this.context.lineJoin = 'round';

            // Plot the line if we're at least on the second iteration
            if (i > 0) {
                xPos = xPos + xInterval;
            } else {
                xPos = this.Get('chart.hmargin') + this.gutterLeft;
            }

            /**
            * Add the coords to an array
            */
            this.coords.push([xPos, yPos]);
            lineCoords.push([xPos, yPos]);
        }
        
        this.context.stroke();

        // Store the coords in another format, indexed by line number
        this.coords2[index] = lineCoords;

        /**
        * For IE only: Draw the shadow ourselves as ExCanvas doesn't produce shadows
        */
        if (RGraph.isIE8() && this.Get('chart.shadow')) {
            this.DrawIEShadow(lineCoords, this.context.shadowColor);
        }

        /**
        * Now draw the actual line [FORMERLY SECOND]
        */
        this.context.beginPath();
        this.context.strokeStyle = 'rgba(240,240,240,0.9)'; // Almost transparent - changed on 10th May 2010
        //this.context.strokeStyle = fill;
        if (fill) this.context.fillStyle   = fill;

        var isStepped = this.Get('chart.stepped');
        var isFilled = this.Get('chart.filled');


        for (var i=0; i<lineCoords.length; ++i) {

            xPos = lineCoords[i][0];
            yPos = lineCoords[i][1];
            var set = index;

            var prevY     = (lineCoords[i - 1] ? lineCoords[i - 1][1] : null);
            var isLast    = (i + 1) == lineCoords.length;

            /**
            * This nullifys values which are out-of-range
            */
            if (prevY < this.gutterTop || prevY > (RGraph.GetHeight(this) - this.gutterBottom) ) {
                penUp = true;
            }

            if (i == 0 || penUp || !yPos || !prevY || prevY < this.gutterTop) {

                if (this.Get('chart.filled') && !this.Get('chart.filled.range')) {
                    this.context.moveTo(xPos + 1, this.canvas.height - this.gutterBottom - (this.Get('chart.xaxispos') == 'center' ? (this.canvas.height - this.gutterTop - this.gutterBottom) / 2 : 0) -1);
                    this.context.lineTo(xPos + 1, yPos);

                } else {
                    this.context.moveTo(xPos, yPos);
                }
                
                if (yPos == null) {
                    penUp = true;
                } else {
                    penUp = false;
                }

            } else {

                // Draw the stepped part of stepped lines
                if (isStepped) {
                    this.context.lineTo(xPos, lineCoords[i - 1][1]);
                }

                if ((yPos >= this.gutterTop && yPos <= (RGraph.GetHeight(this) - this.gutterBottom)) || this.Get('chart.outofbounds') ) {

                    if (isLast && this.Get('chart.filled') && !this.Get('chart.filled.range') && this.Get('chart.yaxispos') == 'right') {
                        xPos -= 1;
                    }


                    // Added 8th September 2009
                    if (!isStepped || !isLast) {
                        this.context.lineTo(xPos, yPos);
                        
                        if (isFilled && lineCoords[i+1] && lineCoords[i+1][1] == null) {
                            this.context.lineTo(xPos, RGraph.GetHeight(this) - this.gutterBottom);
                        }
                    
                    // Added August 2010
                    } else if (isStepped && isLast) {
                        this.context.lineTo(xPos,yPos);
                    }


                    penUp = false;
                } else {
                    penUp = true;
                }
            }
        }

        if (this.Get('chart.filled') && !this.Get('chart.filled.range')) {
            var fillStyle = this.Get('chart.fillstyle');

            this.context.lineTo(xPos, RGraph.GetHeight(this) - this.gutterBottom - 1 -  + (this.Get('chart.xaxispos') == 'center' ? (RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom) / 2 : 0));
            this.context.fillStyle = fill;

            this.context.fill();
            this.context.beginPath();
        }

        /**
        * FIXME this may need removing when Chrome is fixed
        * SEARCH TAGS: CHROME SHADOW BUG
        */
        if (navigator.userAgent.match(/Chrome/) && this.Get('chart.shadow') && this.Get('chart.chromefix') && this.Get('chart.shadow.blur') > 0) {

            for (var i=lineCoords.length - 1; i>=0; --i) {
                if (
                       typeof(lineCoords[i][1]) != 'number'
                    || (typeof(lineCoords[i+1]) == 'object' && typeof(lineCoords[i+1][1]) != 'number')
                   ) {
                    this.context.moveTo(lineCoords[i][0],lineCoords[i][1]);
                } else {
                    this.context.lineTo(lineCoords[i][0],lineCoords[i][1]);
                }
            }
        }

        this.context.stroke();


        if (this.Get('chart.backdrop')) {
            this.DrawBackdrop(lineCoords, color);
        }

        // Now redraw the lines with the correct line width
        this.RedrawLine(lineCoords, color, linewidth);
        
        this.context.stroke();

        // Draw the tickmarks
        for (var i=0; i<lineCoords.length; ++i) {

            i = Number(i);

            if (isStepped && i == (lineCoords.length - 1)) {
                this.context.beginPath();
                //continue;
            }

            if (
                (
                    tickmarks != 'endcircle'
                 && tickmarks != 'endsquare'
                 && tickmarks != 'filledendsquare'
                 && tickmarks != 'endtick'
                 && tickmarks != 'endtriangle'
                 && tickmarks != 'arrow'
                 && tickmarks != 'filledarrow'
                )
                || (i == 0 && tickmarks != 'arrow' && tickmarks != 'filledarrow')
                || i == (lineCoords.length - 1)
               ) {

                var prevX = (i <= 0 ? null : lineCoords[i - 1][0]);
                var prevY = (i <= 0 ? null : lineCoords[i - 1][1]);

                this.DrawTick(lineData, lineCoords[i][0], lineCoords[i][1], color, false, prevX, prevY, tickmarks, i);

                // Draws tickmarks on the stepped bits of stepped charts. Takend out 14th July 2010
                //
                //if (this.Get('chart.stepped') && lineCoords[i + 1] && this.Get('chart.tickmarks') != 'endsquare' && this.Get('chart.tickmarks') != 'endcircle' && this.Get('chart.tickmarks') != 'endtick') {
                //    this.DrawTick(lineCoords[i + 1][0], lineCoords[i][1], color);
                //}
            }
        }

        // Draw something off canvas to skirt an annoying bug
        this.context.beginPath();
        this.context.arc(RGraph.GetWidth(this) + 50000, RGraph.GetHeight(this) + 50000, 2, 0, 6.38, 1);
    }
    
    
    /**
    * This functions draws a tick mark on the line
    * 
    * @param xPos  int  The x position of the tickmark
    * @param yPos  int  The y position of the tickmark
    * @param color str  The color of the tickmark
    * @param       bool Whether the tick is a shadow. If it is, it gets offset by the shadow offset
    */
    RGraph.Line.prototype.DrawTick = function (lineData, xPos, yPos, color, isShadow, prevX, prevY, tickmarks, index)
    {
        // If the yPos is null - no tick
        if ((yPos == null || yPos > (this.canvas.height - this.gutterBottom) || yPos < this.gutterTop) && !this.Get('chart.outofbounds')) {
            return;
        }

        this.context.beginPath();

        var offset   = 0;

        // Reset the stroke and lineWidth back to the same as what they were when the line was drawm
        this.context.lineWidth   = this.Get('chart.linewidth');
        this.context.strokeStyle = isShadow ? this.Get('chart.shadow.color') : this.context.strokeStyle;
        this.context.fillStyle   = isShadow ? this.Get('chart.shadow.color') : this.context.strokeStyle;

        // Cicular tick marks
        if (   tickmarks == 'circle'
            || tickmarks == 'filledcircle'
            || tickmarks == 'endcircle') {

            if (tickmarks == 'circle'|| tickmarks == 'filledcircle' || (tickmarks == 'endcircle') ) {
                this.context.beginPath();
                this.context.arc(xPos + offset, yPos + offset, this.Get('chart.ticksize'), 0, 360 / (180 / Math.PI), false);

                if (tickmarks == 'filledcircle') {
                    this.context.fillStyle = isShadow ? this.Get('chart.shadow.color') : this.context.strokeStyle;
                } else {
                    this.context.fillStyle = isShadow ? this.Get('chart.shadow.color') : 'white';
                }

                this.context.fill();
                this.context.stroke();
            }

        // Halfheight "Line" style tick marks
        } else if (tickmarks == 'halftick') {
            this.context.beginPath();
            this.context.moveTo(xPos, yPos);
            this.context.lineTo(xPos, yPos + this.Get('chart.ticksize'));

            this.context.stroke();
        
        // Tick style tickmarks
        } else if (tickmarks == 'tick') {
            this.context.beginPath();
            this.context.moveTo(xPos, yPos -  this.Get('chart.ticksize'));
            this.context.lineTo(xPos, yPos + this.Get('chart.ticksize'));

            this.context.stroke();
        
        // Endtick style tickmarks
        } else if (tickmarks == 'endtick') {
            this.context.beginPath();
            this.context.moveTo(xPos, yPos -  this.Get('chart.ticksize'));
            this.context.lineTo(xPos, yPos + this.Get('chart.ticksize'));

            this.context.stroke();
        
        // "Cross" style tick marks
        } else if (tickmarks == 'cross') {
            this.context.beginPath();
            this.context.moveTo(xPos - this.Get('chart.ticksize'), yPos - this.Get('chart.ticksize'));
            this.context.lineTo(xPos + this.Get('chart.ticksize'), yPos + this.Get('chart.ticksize'));
            this.context.moveTo(xPos + this.Get('chart.ticksize'), yPos - this.Get('chart.ticksize'));
            this.context.lineTo(xPos - this.Get('chart.ticksize'), yPos + this.Get('chart.ticksize'));
            
            this.context.stroke();


        // Triangle style tick marks
        } else if (tickmarks == 'triangle' || tickmarks == 'filledtriangle' || tickmarks == 'endtriangle') {
            this.context.beginPath();
                
                if (tickmarks == 'filledtriangle') {
                    this.context.fillStyle = isShadow ? this.Get('chart.shadow.color') : this.context.strokeStyle;
                } else {
                    this.context.fillStyle = 'white';
                }

                this.context.moveTo(xPos - this.Get('chart.ticksize'), yPos + this.Get('chart.ticksize'));
                this.context.lineTo(xPos, yPos - this.Get('chart.ticksize'));
                this.context.lineTo(xPos + this.Get('chart.ticksize'), yPos + this.Get('chart.ticksize'));
            this.context.closePath();
            
            this.context.stroke();
            this.context.fill();


        // A white bordered circle
        } else if (tickmarks == 'borderedcircle' || tickmarks == 'dot') {
                this.context.lineWidth   = 1;
                this.context.strokeStyle = this.Get('chart.tickmarks.dot.color');
                this.context.fillStyle   = this.Get('chart.tickmarks.dot.color');

                // The outer white circle
                this.context.beginPath();
                this.context.arc(xPos, yPos, this.Get('chart.ticksize'), 0, 360 / (180 / Math.PI), false);
                this.context.closePath();


                this.context.fill();
                this.context.stroke();
                
                // Now do the inners
                this.context.beginPath();
                this.context.fillStyle   = color;
                this.context.strokeStyle = color;
                this.context.arc(xPos, yPos, this.Get('chart.ticksize') - 2, 0, 360 / (180 / Math.PI), false);

                this.context.closePath();

                this.context.fill();
                this.context.stroke();
        
        } else if (   tickmarks == 'square'
                   || tickmarks == 'filledsquare'
                   || (tickmarks == 'endsquare')
                   || (tickmarks == 'filledendsquare') ) {

            this.context.fillStyle   = 'white';
            this.context.strokeStyle = this.context.strokeStyle; // FIXME Is this correct?

            this.context.beginPath();
            this.context.strokeRect(xPos - this.Get('chart.ticksize'), yPos - this.Get('chart.ticksize'), this.Get('chart.ticksize') * 2, this.Get('chart.ticksize') * 2);

            // Fillrect
            if (tickmarks == 'filledsquare' || tickmarks == 'filledendsquare') {
                this.context.fillStyle = isShadow ? this.Get('chart.shadow.color') : this.context.strokeStyle;
                this.context.fillRect(xPos - this.Get('chart.ticksize'), yPos - this.Get('chart.ticksize'), this.Get('chart.ticksize') * 2, this.Get('chart.ticksize') * 2);

            } else if (tickmarks == 'square' || tickmarks == 'endsquare') {
                this.context.fillStyle = isShadow ? this.Get('chart.shadow.color') : 'white';
                this.context.fillRect((xPos - this.Get('chart.ticksize')) + 1, (yPos - this.Get('chart.ticksize')) + 1, (this.Get('chart.ticksize') * 2) - 2, (this.Get('chart.ticksize') * 2) - 2);
            }

            this.context.stroke();
            this.context.fill();

        /**
        * FILLED arrowhead
        */
        } else if (tickmarks == 'filledarrow') {
        
            var x = Math.abs(xPos - prevX);
            var y = Math.abs(yPos - prevY);

            if (yPos < prevY) {
                var a = Math.atan(x / y) + 1.57;
            } else {
                var a = Math.atan(y / x) + 3.14;
            }

            this.context.beginPath();
                this.context.moveTo(xPos, yPos);
                this.context.arc(xPos, yPos, 7, a - 0.5, a + 0.5, false);
            this.context.closePath();

            this.context.stroke();
            this.context.fill();

        /**
        * Arrow head, NOT filled
        */
        } else if (tickmarks == 'arrow') {

            var x = Math.abs(xPos - prevX);
            var y = Math.abs(yPos - prevY);

            if (yPos < prevY) {
                var a = Math.atan(x / y) + 1.57;
            } else {
                var a = Math.atan(y / x) + 3.14;
            }

            this.context.beginPath();
                this.context.moveTo(xPos, yPos);
                this.context.arc(xPos, yPos, 7, a - 0.5 - (document.all ? 0.1 : 0.01), a - 0.4, false);

                this.context.moveTo(xPos, yPos);
                this.context.arc(xPos, yPos, 7, a + 0.5 + (document.all ? 0.1 : 0.01), a + 0.5, true);


            this.context.stroke();
        
        /**
        * Custom tick drawing function
        */
        } else if (typeof(tickmarks) == 'function') {
            tickmarks(this, lineData, lineData[index], index, xPos, yPos, color, prevX, prevY);
        }
    }


    /**
    * Draws a filled range if necessary
    */
    RGraph.Line.prototype.DrawRange = function ()
    {
        /**
        * Fill the range if necessary
        */
        if (this.Get('chart.filled.range') && this.Get('chart.filled')) {
            this.context.beginPath();
            this.context.fillStyle = this.Get('chart.fillstyle');
            this.context.strokeStyle = this.Get('chart.fillstyle');
            this.context.lineWidth = 1;
            var len = (this.coords.length / 2);

            for (var i=0; i<len; ++i) {
                if (i == 0) {
                    this.context.moveTo(this.coords[i][0], this.coords[i][1])
                } else {
                    this.context.lineTo(this.coords[i][0], this.coords[i][1])
                }
            }

            for (var i=this.coords.length - 1; i>=len; --i) {
                this.context.lineTo(this.coords[i][0], this.coords[i][1])
            }
            this.context.stroke();
            this.context.fill();
        }
    }


    /**
    * Redraws the line with the correct line width etc
    * 
    * @param array coords The coordinates of the line
    */
    RGraph.Line.prototype.RedrawLine = function (coords, color, linewidth)
    {
        if (this.Get('chart.noredraw')) {
            return;
        }

        this.context.beginPath();
        this.context.strokeStyle = (typeof(color) == 'object' && color ? color[0] : color);
        this.context.lineWidth = linewidth;

        var len    = coords.length;
        var width  = RGraph.GetWidth(this);
        var height = RGraph.GetHeight(this);
        var penUp  = false;

        for (var i=0; i<len; ++i) {

            var xPos   = coords[i][0];
            var yPos   = coords[i][1];

            if (i > 0) {
                var prevX = coords[i - 1][0];
                var prevY = coords[i - 1][1];
            }


            if ((
                   (i == 0 && coords[i])
                || (yPos < this.gutterTop)
                || (prevY < this.gutterTop)
                || (yPos > (height - this.gutterBottom))
                || (i > 0 && prevX > (width - this.gutterRight))
                || (i > 0 && prevY > (height - this.gutterBottom))
                || prevY == null
                || penUp == true
               ) && (!this.Get('chart.outofbounds') || yPos == null || prevY == null) ) {

                this.context.moveTo(coords[i][0], coords[i][1]);

                penUp = false;

            } else {

                if (this.Get('chart.stepped') && i > 0) {
                    this.context.lineTo(coords[i][0], coords[i - 1][1]);
                }
                
                // Don't draw the last bit of a stepped chart. Now DO
                //if (!this.Get('chart.stepped') || i < (coords.length - 1)) {
                this.context.lineTo(coords[i][0], coords[i][1]);
                //}
                penUp = false;
            }
        }

        /**
        * If two colors are specified instead of one, go over the up bits
        */
        if (this.Get('chart.colors.alternate') && typeof(color) == 'object' && color[0] && color[1]) {
            for (var i=1; i<len; ++i) {

                var prevX = coords[i - 1][0];
                var prevY = coords[i - 1][1];
                
                this.context.beginPath();
                this.context.strokeStyle = color[coords[i][1] < prevY ? 0 : 1];
                this.context.lineWidth = this.Get('chart.linewidth');
                this.context.moveTo(prevX, prevY);
                this.context.lineTo(coords[i][0], coords[i][1]);
                this.context.stroke();
            }
        }
    }


    /**
    * This function is used by MSIE only to manually draw the shadow
    * 
    * @param array coords The coords for the line
    */
    RGraph.Line.prototype.DrawIEShadow = function (coords, color)
    {
        var offsetx = this.Get('chart.shadow.offsetx');
        var offsety = this.Get('chart.shadow.offsety');
        
        this.context.lineWidth   = this.Get('chart.linewidth');
        this.context.strokeStyle = color;
        this.context.beginPath();

        for (var i=0; i<coords.length; ++i) {
            if (i == 0) {
                this.context.moveTo(coords[i][0] + offsetx, coords[i][1] + offsety);
            } else {
                this.context.lineTo(coords[i][0] + offsetx, coords[i][1] + offsety);
            }
        }

        this.context.stroke();
    }


    /**
    * Draw the backdrop
    */
    RGraph.Line.prototype.DrawBackdrop = function (coords, color)
    {
        var size = this.Get('chart.backdrop.size');
        this.context.lineWidth = size;
        this.context.globalAlpha = this.Get('chart.backdrop.alpha');
        this.context.strokeStyle = color;
        this.context.lineJoin = 'miter';
        
        this.context.beginPath();
            this.context.moveTo(coords[0][0], coords[0][1]);
            for (var j=1; j<coords.length; ++j) {
                this.context.lineTo(coords[j][0], coords[j][1]);
            }
    
        this.context.stroke();
    
        // Reset the alpha value
        this.context.globalAlpha = 1;
        this.context.lineJoin = 'round';
        RGraph.NoShadow(this);
    }


    /**
    * Returns the linewidth
    */
    RGraph.Line.prototype.GetLineWidth = function (i)
    {
        var linewidth = this.Get('chart.linewidth');
        
        if (typeof(linewidth) == 'number') {
            return linewidth;
        
        } else if (typeof(linewidth) == 'object') {
            if (linewidth[i]) {
                return linewidth[i];
            } else {
                return linewidth[0];
            }

            alert('[LINE] Error! chart.linewidth should be a single number or an array of one or more numbers');
        }
    }


    /**
    * The getPoint() method - used to get the point the mouse is currently over, if any
    * 
    * @param object e The event object
    */
    RGraph.Line.prototype.getPoint = function (e)
    {
        var canvas  = e.target;
        var obj     = canvas.__object__;
        var context = obj.context;
        var mouseXY = RGraph.getMouseXY(e);
        var mouseX  = mouseXY[0];
        var mouseY  = mouseXY[1];

        for (var i=0; i<obj.coords.length; ++i) {
        
            var xCoord = obj.coords[i][0];
            var yCoord = obj.coords[i][1];
 
            if (   mouseX <= (xCoord + 5)
                && mouseX >= (xCoord - 5)
                && mouseY <= (yCoord + 5)
                && mouseY >= (yCoord - 5)
               ) {

                    return [obj, xCoord, yCoord, i];
            }
        }
    }


    /**
    * Draws the above line labels
    */
    RGraph.Line.prototype.DrawAboveLabels = function ()
    {
        var context    = this.context;
        var size       = this.Get('chart.labels.above.size');
        var font       = this.Get('chart.text.font');
        var units_pre  = this.Get('chart.units.pre');
        var units_post = this.Get('chart.units.post');

        context.beginPath();

        // Don't need to check that chart.labels.above is enabled here, it's been done already
        for (var i=0; i<this.coords.length; ++i) {
            var coords = this.coords[i];
            
            RGraph.Text(context, font, size, coords[0], coords[1] - 5 - size, RGraph.number_format(this, this.data_arr[i], units_pre, units_post), 'center', 'center', true, null, 'rgba(255, 255, 255, 0.7)');
        }
        
        context.fill();
    }
