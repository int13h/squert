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
    * The progress bar constructor
    * 
    * @param int id    The ID of the canvas tag
    * @param int value The indicated value of the meter.
    * @param int max   The end value (the upper most) of the meter
    */
    RGraph.VProgress = function (id, value, max)
    {
        this.id                = id;
        this.max               = max;
        this.value             = value;
        this.canvas            = document.getElementById(id);
        this.context           = this.canvas.getContext('2d');
        this.canvas.__object__ = this;
        this.type              = 'vprogress';
        this.coords            = [];
        this.isRGraph          = true;


        /**
        * Compatibility with older browsers
        */
        RGraph.OldBrowserCompat(this.context);

        this.properties = {
            'chart.colors':             ['#0c0'],
            'chart.tickmarks':          true,
            'chart.tickmarks.zerostart':false,
            'chart.tickmarks.color':    'black',
            'chart.tickmarks.inner':    false,
            'chart.gutter.left':        25,
            'chart.gutter.right':       25,
            'chart.gutter.top':         25,
            'chart.gutter.bottom':      25,
            'chart.numticks':           10,
            'chart.numticks.inner':     50,
            'chart.background.color':   '#eee',
            'chart.shadow':             false,
            'chart.shadow.color':       'rgba(0,0,0,0.5)',
            'chart.shadow.blur':        3,
            'chart.shadow.offsetx':     3,
            'chart.shadow.offsety':     3,
            'chart.title':              '',
            'chart.title.background':   null,
            'chart.title.hpos':         null,
            'chart.title.vpos':         null,
            'chart.width':              0,
            'chart.height':             0,
            'chart.text.size':          10,
            'chart.text.color':         'black',
            'chart.text.font':          'Verdana',
            'chart.contextmenu':        null,
            'chart.units.pre':          '',
            'chart.units.post':         '',
            'chart.tooltips':           [],
            'chart.tooltips.effect':    'fade',
            'chart.tooltips.css.class': 'RGraph_tooltip',
            'chart.tooltips.highlight': true,
            'chart.tooltips.coords.adjust': [0,0],
            'chart.highlight.stroke':   'black',
            'chart.highlight.fill':     'rgba(255,255,255,0.5)',
            'chart.annotatable':        false,
            'chart.annotate.color':     'black',
            'chart.zoom.mode':          'canvas',
            'chart.zoom.factor':        1.5,
            'chart.zoom.fade.in':       true,
            'chart.zoom.fade.out':      true,
            'chart.zoom.hdir':          'right',
            'chart.zoom.vdir':          'down',
            'chart.zoom.frames':        10,
            'chart.zoom.delay':         50,
            'chart.zoom.shadow':        true,
            'chart.zoom.background':    true,
            'chart.zoom.action':        'zoom',
            'chart.arrows':             false,
            'chart.margin':             0,
            'chart.resizable':              false,
            'chart.resize.handle.adjust':   [0,0],
            'chart.resize.handle.background': null,
            'chart.label.inner':        false,
            'chart.labels.count':       10,
            'chart.labels.position':    'right',
            'chart.adjustable':         false,
            'chart.min':                0,
            'chart.scale.decimals':     0,
            'chart.key':                [],
            'chart.key.background':     'white',
            'chart.key.position':       'graph',
            'chart.key.halign':             'right',
            'chart.key.shadow':         false,
            'chart.key.shadow.color':   '#666',
            'chart.key.shadow.blur':    3,
            'chart.key.shadow.offsetx': 2,
            'chart.key.shadow.offsety': 2,
            'chart.key.position.gutter.boxed': true,
            'chart.key.position.x':     null,
            'chart.key.position.y':     null,
            'chart.key.color.shape':    'square',
            'chart.key.rounded':        true,
            'chart.key.linewidth':      1
        }

        // Check for support
        if (!this.canvas) {
            alert('[PROGRESS] No canvas support');
            return;
        }
    }


    /**
    * A generic setter
    * 
    * @param string name  The name of the property to set
    * @param string value The value of the poperty
    */
    RGraph.VProgress.prototype.Set = function (name, value)
    {
        this.properties[name.toLowerCase()] = value;
    }


    /**
    * A generic getter
    * 
    * @param string name  The name of the property to get
    */
    RGraph.VProgress.prototype.Get = function (name)
    {
        return this.properties[name.toLowerCase()];
    }


    /**
    * Draws the progress bar
    */
    RGraph.VProgress.prototype.Draw = function ()
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

        // Figure out the width and height
        this.width  = RGraph.GetWidth(this) - this.gutterLeft - this.gutterRight;
        this.height = RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom;
        this.coords = [];

        this.Drawbar();
        this.DrawTickMarks();
        this.DrawLabels();

        this.context.stroke();
        this.context.fill();

        /**
        * Setup the context menu if required
        */
        if (this.Get('chart.contextmenu')) {
            RGraph.ShowContext(this);
        }
        
        /**
        * Alternatively, show the tooltip if requested
        */
        if (typeof(this.Get('chart.tooltips')) == 'function' || this.Get('chart.tooltips').length) {

            // Need to register this object for redrawing
            RGraph.Register(this);

            /**
            * Install the window onclick handler
            */
            var window_onclick = function ()
            {
                RGraph.Redraw();
            }
            window.addEventListener('click', window_onclick, false);
            RGraph.AddEventListener('window_' + this.id, 'click', window_onclick);


            /**
            * Install the onclick event handler for the tooltips
            */
            //this.canvas.onclick = function (e)
            var canvas_onclick_func = function (e)
            {
                e = RGraph.FixEventObject(e);

                var canvas = document.getElementById(this.id);
                var obj = canvas.__object__;

                /**
                * Redraw the graph first, in effect resetting the graph to as it was when it was first drawn
                * This "deselects" any already selected bar
                */
                RGraph.Redraw();
    
                /**
                * Get the mouse X/Y coordinates
                */
                var mouseCoords = RGraph.getMouseXY(e);

                /**
                * Loop through the bars determining if the mouse is over a bar
                */
                for (var i=0; i<obj.coords.length; i++) {

                    var mouseX = mouseCoords[0] - obj.Get('chart.tooltips.coords.adjust')[0];
                    var mouseY = mouseCoords[1] - obj.Get('chart.tooltips.coords.adjust')[1];
                    var left   = obj.coords[i][0];
                    var top    = obj.coords[i][1];
                    var width  = obj.coords[i][2];
                    var height = obj.coords[i][3];
                    var idx    = i;

                    if (mouseX >= left && mouseX <= (left + width) && mouseY >= top && mouseY <= (top + height) ) {
    
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

                        /**
                        * Show a tooltip if it's defined
                        */
                        if (text) {

                            obj.context.beginPath();
                            obj.context.strokeStyle = obj.Get('chart.highlight.stroke');
                            obj.context.fillStyle   = obj.Get('chart.highlight.fill');
                            obj.context.strokeRect(left, top, width, height);
                            obj.context.fillRect(left, top, width, height);
        
                            obj.context.stroke();
                            obj.context.fill();

                            RGraph.Tooltip(canvas, text, e.pageX, e.pageY, i);
                        }
                    }
                }

                /**
                * Stop the event bubbling
                */
                e.stopPropagation();
            }
            this.canvas.addEventListener('click', canvas_onclick_func, false);
            RGraph.AddEventListener(this.id, 'click', canvas_onclick_func);


            /**
            * If the cursor is over a hotspot, change the cursor to a hand
            */
            //this.canvas.onmousemove = function (e)
            var canvas_onmousemove_func = function (e)
            {
                e = RGraph.FixEventObject(e);

                var canvas = document.getElementById(this.id);
                var obj = canvas.__object__;

                /**
                * Get the mouse X/Y coordinates
                */
                var mouseCoords = RGraph.getMouseXY(e);

                /**
                * Loop through the bars determining if the mouse is over a bar
                */
                for (var i=0; i<obj.coords.length; i++) {

                    var mouseX = mouseCoords[0] - obj.Get('chart.tooltips.coords.adjust')[0];  // In relation to the canvas
                    var mouseY = mouseCoords[1] - obj.Get('chart.tooltips.coords.adjust')[1];  // In relation to the canvas
                    var left   = obj.coords[i][0];
                    var top    = obj.coords[i][1];
                    var width  = obj.coords[i][2];
                    var height = obj.coords[i][3];

                    if (mouseX >= left && mouseX <= (left + width) && mouseY >= top && mouseY <= (top + height) ) {
                        canvas.style.cursor = 'pointer';
                        break;
                    }
                    
                    canvas.style.cursor = 'default';
                }
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
        
        // Draw a key if necessary
        if (this.Get('chart.key').length) {
            RGraph.DrawKey(this, this.Get('chart.key'), this.Get('chart.colors'));
        }


        
        /**
        * This function enables resizing
        */
        if (this.Get('chart.resizable')) {
            RGraph.AllowResizing(this);
        }
        
        /**
        * Instead of using RGraph.common.adjusting.js, handle them here
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
    * Draw the bar itself
    */
    RGraph.VProgress.prototype.Drawbar = function ()
    {
        // Set a shadow if requested
        if (this.Get('chart.shadow')) {
            RGraph.SetShadow(this, this.Get('chart.shadow.color'), this.Get('chart.shadow.offsetx'), this.Get('chart.shadow.offsety'), this.Get('chart.shadow.blur'));
        }

        // Draw the shadow for MSIE
        if (RGraph.isIE8() && this.Get('chart.shadow')) {
            this.context.fillStyle = this.Get('chart.shadow.color');
            this.context.fillRect(this.gutterLeft + this.Get('chart.shadow.offsetx'), this.gutterTop + this.Get('chart.shadow.offsety'), this.width, this.height);
        }

        // Draw the outline
        this.context.fillStyle   = this.Get('chart.background.color');
        this.context.strokeStyle = 'black';
        this.context.strokeRect(this.gutterLeft, this.gutterTop, this.width, this.height);
        this.context.fillRect(this.gutterLeft, this.gutterTop, this.width, this.height);

        // Turn off any shadow
        RGraph.NoShadow(this);

        this.context.strokeStyle = 'black';
        this.context.fillStyle   = this.Get('chart.colors')[0];
        var margin = this.Get('chart.margin');
        var barHeight = RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom;

        // Draw the actual bar itself
        if (typeof(this.value) == 'number') {

            this.context.lineWidth   = 1;
            this.context.strokeStyle = '#999';

        } else if (typeof(this.value) == 'object') {

            this.context.beginPath();
            this.context.strokeStyle = '#999';

            var startPoint = RGraph.GetHeight(this) - this.gutterBottom;
            
            for (var i=0; i<this.value.length; ++i) {

                var segmentHeight = ( (this.value[i] - this.Get('chart.min')) / (this.max - this.Get('chart.min')) ) * barHeight;

                this.context.fillStyle = this.Get('chart.colors')[i];

                this.context.fillRect(this.gutterLeft + margin, startPoint - segmentHeight, this.width - margin - margin, segmentHeight);
                this.context.strokeRect(this.gutterLeft + margin, startPoint - segmentHeight, this.width - margin - margin, segmentHeight);


                // Store the coords
                this.coords.push([this.gutterLeft + margin, startPoint - segmentHeight, this.width - margin - margin, segmentHeight]);

                startPoint -= segmentHeight;
            }

        }

        /**
        * Inner tickmarks
        */
        if (this.Get('chart.tickmarks.inner')) {
        
            var spacing = (RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom) / this.Get('chart.numticks.inner');

            this.context.lineWidth   = 1;
            this.context.strokeStyle = '#999';

            this.context.beginPath();

            for (var y = this.gutterTop; y<RGraph.GetHeight(this) - this.gutterBottom; y+=spacing) {
                this.context.moveTo(this.gutterLeft, y);
                this.context.lineTo(this.gutterLeft + 3, y);

                this.context.moveTo(RGraph.GetWidth(this) - this.gutterRight, y);
                this.context.lineTo(RGraph.GetWidth(this) - this.gutterRight - 3, y);
            }

            this.context.stroke();
        }

        /**
        * Draw the actual bar
        */
        var barHeight = Math.min(this.height, ( (this.value - this.Get('chart.min')) / (this.max - this.Get('chart.min')) ) * this.height);

        this.context.beginPath();
        this.context.strokeStyle = 'black';

        if (typeof(this.value) == 'number') {
            this.context.strokeRect(this.gutterLeft + margin, this.gutterTop + this.height - barHeight, this.width - margin - margin, barHeight);
            this.context.fillRect(this.gutterLeft + margin, this.gutterTop + this.height - barHeight, this.width - margin - margin, barHeight);
        }


        /**
        * Draw the arrows indicating the level if requested
        */
        if (this.Get('chart.arrows')) {
            var x = this.gutterLeft - 4;
            var y = RGraph.GetHeight(this) - this.gutterBottom - barHeight;
            
            this.context.lineWidth = 1;
            this.context.fillStyle = 'black';
            this.context.strokeStyle = 'black';

            this.context.beginPath();
                this.context.moveTo(x, y);
                this.context.lineTo(x - 4, y - 2);
                this.context.lineTo(x - 4, y + 2);
            this.context.closePath();

            this.context.stroke();
            this.context.fill();

            x +=  this.width + 8;

            this.context.beginPath();
                this.context.moveTo(x, y);
                this.context.lineTo(x + 4, y - 2);
                this.context.lineTo(x + 4, y + 2);
            this.context.closePath();

            this.context.stroke();
            this.context.fill();
        }




        /**
        * Draw the "in-bar" label
        */
        if (this.Get('chart.label.inner')) {
            this.context.beginPath();
            this.context.fillStyle = 'black';
            RGraph.Text(this.context, this.Get('chart.text.font'), this.Get('chart.text.size') + 2, RGraph.GetWidth(this) / 2, RGraph.GetHeight(this) - this.gutterBottom - barHeight - 5, String(this.Get('chart.units.pre') + this.value + this.Get('chart.units.post')), 'bottom', 'center');
            this.context.fill();
        }


        // Store the coords
        this.coords.push([this.gutterLeft + margin, this.gutterTop + this.height - barHeight, this.width - margin - margin, barHeight]);
    }

    /**
    * The function that draws the tick marks. Apt name...
    */
    RGraph.VProgress.prototype.DrawTickMarks = function ()
    {
        this.context.strokeStyle = this.Get('chart.tickmarks.color');

        if (this.Get('chart.tickmarks')) {
            this.context.beginPath();
                for (var i=0; this.Get('chart.tickmarks.zerostart') ? i<=this.Get('chart.numticks') : i<this.Get('chart.numticks'); i++) {
                    
                    var startX = this.Get('chart.labels.position') == 'left' ? this.gutterLeft : this.canvas.width - this.Get('chart.gutter.right');
                    var endX   = this.Get('chart.labels.position') == 'left' ? startX - 4 : startX + 4;
                    var yPos   = (this.height * (i / this.Get('chart.numticks'))) + this.gutterTop

                    this.context.moveTo(startX, yPos);
                    this.context.lineTo(endX, yPos);
                }
            this.context.stroke();
        }
    }


    /**
    * The function that draws the labels
    */
    RGraph.VProgress.prototype.DrawLabels = function ()
    {
        this.context.fillStyle = this.Get('chart.text.color');

        var context    = this.context;
        var position   = this.Get('chart.labels.position');
        var xAlignment = position == 'left' ? 'right' : 'left';
        var yAlignment = 'center';
        var count      = this.Get('chart.labels.count');
        var units_pre  = this.Get('chart.units.pre');
        var units_post = this.Get('chart.units.post');
        var text_size  = this.Get('chart.text.size');
        var text_font  = this.Get('chart.text.font');
        
        if (this.Get('chart.tickmarks')) {
            
            for (var i=0; i<count ; ++i) {

                var text = String(
                                  ((( (this.max - this.Get('chart.min')) / count) * (count - i)) + this.Get('chart.min')).toFixed(this.Get('chart.scale.decimals'))
                                 );

                RGraph.Text(context,
                            text_font,
                            text_size,
                            position == 'left' ? (this.gutterLeft - 5) : (RGraph.GetWidth(this) - this.gutterRight + 5),
                            (((RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom) / count) * i) + this.gutterTop,
                            units_pre + text + units_post,
                            yAlignment,
                            xAlignment);
            }
            
            /**
            * Show zero?
            */            
            if (this.Get('chart.tickmarks.zerostart') && this.Get('chart.min') == 0) {
                RGraph.Text(context,
                            text_font,
                            text_size,
                            position == 'left' ? (this.gutterLeft - 5) : (RGraph.GetWidth(this) - this.gutterRight + 5),
                            RGraph.GetHeight(this) - this.gutterBottom, units_pre + String(this.Get('chart.min').toFixed(this.Get('chart.scale.decimals'))) + units_post,
                            yAlignment,
                            xAlignment);
            }

            /**
            * chart.ymin is set
            */
            if (this.Get('chart.min') != 0) {
                RGraph.Text(context,
                            text_font,
                            text_size,
                            position == 'left' ? (this.gutterLeft - 5) : (RGraph.GetWidth(this) - this.gutterRight + 5),
                            RGraph.GetHeight(this) - this.gutterBottom, units_pre + String(this.Get('chart.min').toFixed(this.Get('chart.scale.decimals'))) + units_post,
                            yAlignment,
                            xAlignment);
            }
        }

        // Draw the title text
        if (this.Get('chart.title')) {
            RGraph.Text(context,
                        text_font,
                        text_size + 2,
                        this.gutterLeft + ((this.canvas.width - this.gutterLeft - this.gutterRight) / 2), // X
                        this.gutterTop - text_size, // Y
                        this.Get('chart.title'),
                        null,
                        'center',null, null, null, true);
        }
    }