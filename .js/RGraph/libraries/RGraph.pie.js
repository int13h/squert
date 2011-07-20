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
    * The pie chart constructor
    * 
    * @param data array The data to be represented on the pie chart
    */
    RGraph.Pie = function (id, data)
    {
        this.id                = id;
        this.canvas            = document.getElementById(id);
        this.context           = this.canvas.getContext("2d");
        this.canvas.__object__ = this;
        this.total             = 0;
        this.subTotal          = 0;
        this.angles            = [];
        this.data              = data;
        this.properties        = [];
        this.type              = 'pie';
        this.isRGraph          = true;


        /**
        * Compatibility with older browsers
        */
        RGraph.OldBrowserCompat(this.context);

        this.properties = {
            'chart.colors':                 ['rgb(255,0,0)', '#ddd', 'rgb(0,255,0)', 'rgb(0,0,255)', 'pink', 'yellow', '#000'],
            'chart.strokestyle':            '#999',
            'chart.linewidth':              1,
            'chart.labels':                 [],
            'chart.labels.sticks':          false,
            'chart.labels.sticks.color':    '#aaa',
            'chart.segments':               [],
            'chart.gutter.left':            25,
            'chart.gutter.right':           25,
            'chart.gutter.top':             25,
            'chart.gutter.bottom':          25,
            'chart.title':                  '',
            'chart.title.background':       null,
            'chart.title.hpos':             null,
            'chart.title.vpos':             null,
            'chart.shadow':                 false,
            'chart.shadow.color':           'rgba(0,0,0,0.5)',
            'chart.shadow.offsetx':         3,
            'chart.shadow.offsety':         3,
            'chart.shadow.blur':            3,
            'chart.text.size':              10,
            'chart.text.color':             'black',
            'chart.text.font':              'Verdana',
            'chart.contextmenu':            null,
            'chart.tooltips':               [],
            'chart.tooltips.event':         'onclick',
            'chart.tooltips.effect':        'fade',
            'chart.tooltips.css.class':     'RGraph_tooltip',
            'chart.tooltips.highlight':     true,
            'chart.highlight.style':        '3d',
            'chart.highlight.style.2d.fill': 'rgba(255,255,255,0.5)',
            'chart.highlight.style.2d.stroke': 'rgba(255,255,255,0)',
            'chart.radius':                 null,
            'chart.border':                 false,
            'chart.border.color':           'rgba(255,255,255,0.5)',
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
            'chart.annotatable':            false,
            'chart.annotate.color':         'black',
            'chart.align':                  'center',
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
            'chart.variant':                'pie',
            'chart.variant.donut.color':    'white',
            'chart.exploded':               []
        }

        /**
        * Calculate the total
        */
        for (var i=0,len=data.length; i<len; i++) {
            this.total += data[i];
        }


        /**
        * Set the .getShape commonly named method
        */
        this.getShape = this.getSegment;
    }


    /**
    * A generic setter
    */
    RGraph.Pie.prototype.Set = function (name, value)
    {
        if (name == 'chart.highlight.style.2d.color') {
            name = 'chart.highlight.style.2d.fill';
        }

        this.properties[name] = value;
    }


    /**
    * A generic getter
    */
    RGraph.Pie.prototype.Get = function (name)
    {
        if (name == 'chart.highlight.style.2d.color') {
            name = 'chart.highlight.style.2d.fill';
        }

        return this.properties[name];
    }


    /**
    * This draws the pie chart
    */
    RGraph.Pie.prototype.Draw = function ()
    {
        /**
        * Fire the onbeforedraw event
        */
        RGraph.FireCustomEvent(this, 'onbeforedraw');

        
        /**
        * This is new in May 2011 and facilitates indiviual gutter settings,
        * eg chart.gutter.left
        */
        this.gutterLeft   = this.Get('chart.gutter.left');
        this.gutterRight  = this.Get('chart.gutter.right');
        this.gutterTop    = this.Get('chart.gutter.top');
        this.gutterBottom = this.Get('chart.gutter.bottom');

        /**
        * Reset this to an empty array
        */
        this.Set('chart.segments', []);

        /**
        * Clear all of this canvases event handlers (the ones installed by RGraph)
        */
        RGraph.ClearEventListeners(this.id);


        this.diameter    = Math.min(RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom, RGraph.GetWidth(this)) - this.gutterLeft - this.gutterRight;
        this.radius      = this.Get('chart.radius') ? this.Get('chart.radius') : this.diameter / 2;
        // this.centerx now defined below
        this.centery     = ((RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom) / 2) + this.gutterTop;
        this.subTotal    = 0;
        this.angles      = [];
        
        /**
        * Alignment (Pie is center aligned by default) Only if centerx is not defined - donut defines the centerx
        */
        if (this.Get('chart.align') == 'left') {
            this.centerx = this.radius + this.gutterLeft;
        
        } else if (this.Get('chart.align') == 'right') {
            this.centerx = RGraph.GetWidth(this) - this.radius - this.gutterRight;
        
        } else {
            this.centerx = RGraph.GetWidth(this) / 2;
        }

        /**
        * Draw the shadow if required
        */
        if (this.Get('chart.shadow')) {
        
            var offsetx = document.all ? this.Get('chart.shadow.offsetx') : 0;
            var offsety = document.all ? this.Get('chart.shadow.offsety') : 0;

            this.context.beginPath();
            this.context.fillStyle = this.Get('chart.shadow.color');

            this.context.shadowColor   = this.Get('chart.shadow.color');
            this.context.shadowBlur    = this.Get('chart.shadow.blur');
            this.context.shadowOffsetX = this.Get('chart.shadow.offsetx');
            this.context.shadowOffsetY = this.Get('chart.shadow.offsety');
            
            this.context.arc(this.centerx + offsetx, this.centery + offsety, this.radius, 0, 6.28, 0);
            
            this.context.fill();
            
            // Now turn off the shadow
            RGraph.NoShadow(this);
        }

        /**
        * The total of the array of values
        */
        this.total = RGraph.array_sum(this.data);

        for (var i=0,len=this.data.length; i<len; i++) {
            var angle = (this.data[i] / this.total) * 360;
    
            this.DrawSegment(angle,
                             this.Get('chart.colors')[i],
                             i == (this.data.length - 1),
                             i);
        }

        /**
        * Redraw the seperating lines
        */
        if (this.Get('chart.linewidth') > 0) {
            this.context.beginPath();
            this.context.lineWidth = this.Get('chart.linewidth');
            this.context.strokeStyle = this.Get('chart.strokestyle');

            for (var i=0,len=this.angles.length; i<len; ++i) {
                this.context.moveTo(this.centerx, this.centery);
                this.context.arc(this.centerx, this.centery, this.radius, this.angles[i][0] / 57.3, (this.angles[i][0] + 0.01) / 57.3, 0);
            }
            
            this.context.stroke();
            
            /**
            * And finally redraw the border
            */
            this.context.beginPath();
            this.context.moveTo(this.centerx, this.centery);
            this.context.arc(this.centerx, this.centery, this.radius, 0, 6.28, 0);
            this.context.stroke();
        }

        /**
        * Draw label sticks
        */
        if (this.Get('chart.labels.sticks')) {
            this.DrawSticks();
            
            // Redraw the border going around the Pie chart if the stroke style is NOT white
            if (
                   this.Get('chart.strokestyle') != 'white'
                && this.Get('chart.strokestyle') != '#fff'
                && this.Get('chart.strokestyle') != '#fffffff'
                && this.Get('chart.strokestyle') != 'rgb(255,255,255)'
                && this.Get('chart.strokestyle') != 'rgba(255,255,255,0)'
               ) {

                this.context.beginPath();
                    this.context.strokeStyle = this.Get('chart.strokestyle');
                    this.context.lineWidth = this.Get('chart.linewidth');
                    this.context.arc(this.centerx, this.centery, this.radius, 0, 6.28, false);
                this.context.stroke();
            }
        }

        /**
        * Draw the labels
        */
        this.DrawLabels();

        /**
        * Draw the title
        */
        if (this.Get('chart.align') == 'left') {
            var centerx = this.radius + this.Get('chart.gutter.left');

        } else if (this.Get('chart.align') == 'right') {
            var centerx = RGraph.GetWidth(this) - (this.radius + this.gutterRight);

        } else {
            var centerx = null;
        }

        RGraph.DrawTitle(this.canvas, this.Get('chart.title'), (this.canvas.height / 2) - this.radius - 5, centerx, this.Get('chart.text.size') + 2);
        
        
        /**
        * Setup the context menu if required
        */
        if (this.Get('chart.contextmenu')) {
            RGraph.ShowContext(this);
        }

        /**
        * Tooltips
        */
        if (this.Get('chart.tooltips').length) {

            /**
            * Register this object for redrawing
            */
            RGraph.Register(this);
        
            /**
            * The onclick event
            */
            //this.canvas.onclick = function (e)
            var canvas_onclick_func = function (e)
            {
                RGraph.HideZoomedCanvas();

                e = RGraph.FixEventObject(e);

                var mouseCoords = RGraph.getMouseXY(e);

                var canvas  = e.target;
                var context = canvas.getContext('2d');
                var obj     = e.target.__object__;



                /**
                * If it's actually a donut make sure the hyp is bigger
                * than the size of the hole in the middle
                */
                if (obj.Get('chart.variant') == 'donut' && Math.abs(hyp) < (obj.radius / 2)) {
                    return;
                }

                /**
                * The angles for each segment are stored in "angles",
                * so go through that checking if the mouse position corresponds
                */
                var isDonut = obj.Get('chart.variant') == 'donut';
                var hStyle  = obj.Get('chart.highlight.style');
                var segment = obj.getSegment(e);

                if (segment) {

                    var x     = mouseCoords[0] - segment[0];
                    var y     = mouseCoords[1] - segment[1];
                    var theta = Math.atan(y / x); // RADIANS
                    var hyp   = y / Math.sin(theta);


                    if (RGraph.Registry.Get('chart.tooltip') && segment[5] == RGraph.Registry.Get('chart.tooltip').__index__) {
                        return;
                    } else {
                        RGraph.Redraw();
                    }


                    if (isDonut || hStyle == '2d') {
                        
                        context.beginPath();

                        context.strokeStyle = obj.Get('chart.highlight.style.2d.stroke');
                        context.fillStyle   = obj.Get('chart.highlight.style.2d.fill');

                        //context.moveTo(obj.centerx, obj.centery);

                        context.moveTo(segment[0], segment[1]);
                        context.arc(segment[0], segment[1], segment[2], RGraph.degrees2Radians(obj.angles[segment[5]][0]), RGraph.degrees2Radians(obj.angles[segment[5]][1]), 0);
                        context.lineTo(segment[0], segment[1]);
                        context.closePath();
                        
                        context.stroke();
                        context.fill();
                        
                        //Removed 7th December 2010
                        //context.stroke();

                    } else if (hStyle == 'explode') {

                        var exploded = [];

                        exploded[segment[5]] = 0;

                        RGraph.Registry.Set('chart.pie.exploded', obj);
                        
                        setTimeout(function () {var pie = RGraph.Registry.Get('chart.pie.exploded'); pie.Set('chart.exploded', exploded);RGraph.Clear(pie.canvas);pie.Draw(); exploded[segment[5]] += 7;}, 25);
                        setTimeout(function () {var pie = RGraph.Registry.Get('chart.pie.exploded'); pie.Set('chart.exploded', exploded);RGraph.Clear(pie.canvas);pie.Draw(); exploded[segment[5]] += 7;}, 50);
                        setTimeout(function () {var pie = RGraph.Registry.Get('chart.pie.exploded'); pie.Set('chart.exploded', exploded);RGraph.Clear(pie.canvas);pie.Draw(); exploded[segment[5]] += 7;}, 75);
                        setTimeout(function () {var pie = RGraph.Registry.Get('chart.pie.exploded'); pie.Set('chart.exploded', exploded);RGraph.Clear(pie.canvas);pie.Draw(); exploded[segment[5]] += 7;}, 100);
                        setTimeout(function () {var pie = RGraph.Registry.Get('chart.pie.exploded'); pie.Set('chart.exploded', exploded);RGraph.Clear(pie.canvas);pie.Draw(); exploded[segment[5]] += 7;}, 125);
                        
                        setTimeout(function () {RGraph.Registry.Get('chart.pie.exploded').Set('chart.exploded', []);}, 150);

                    } else {

                        context.lineWidth = 2;

                        /**
                        * Draw a white segment where the one that has been clicked on was
                        */
                        context.fillStyle = 'white';
                        context.strokeStyle = 'white';
                        context.beginPath();
                        context.moveTo(segment[0], segment[1]);
                        context.arc(segment[0], segment[1], segment[2], obj.angles[segment[5]][0] / 57.3, obj.angles[segment[5]][1] / 57.3, 0);
                        context.stroke();
                        context.fill();

                        context.lineWidth = 1;

                        context.shadowColor   = '#666';
                        context.shadowBlur    = 3;
                        context.shadowOffsetX = 3;
                        context.shadowOffsetY = 3;

                        // Draw the new segment
                        context.beginPath();
                            context.fillStyle   = obj.Get('chart.colors')[segment[5]];
                            context.strokeStyle = 'rgba(0,0,0,0)';
                            context.moveTo(segment[0] - 3, segment[1] - 3);
                            context.arc(segment[0] - 3, segment[1] - 3, segment[2], RGraph.degrees2Radians(obj.angles[segment[5]][0]), RGraph.degrees2Radians(obj.angles[segment[5]][1]), 0);
                            context.lineTo(segment[0] - 3, segment[1] - 3);
                        context.closePath();
                        
                        context.stroke();
                        context.fill();
                        
                        // Turn off the shadow
                        RGraph.NoShadow(obj);
                        
                        /**
                        * If a border is defined, redraw that
                        */
                        if (obj.Get('chart.border')) {
                            context.beginPath();
                            context.strokeStyle = obj.Get('chart.border.color');
                            context.lineWidth = 5;
                            context.arc(segment[0] - 3, segment[1] - 3, obj.radius - 2, RGraph.degrees2Radians(obj.angles[i][0]), RGraph.degrees2Radians(obj.angles[i][1]), 0);
                            context.stroke();
                        }
                    }
                        
                    /**
                    * If a tooltip is defined, show it
                    */

                    /**
                    * Get the tooltip text
                    */
                    if (typeof(obj.Get('chart.tooltips')) == 'function') {
                        var text = String(obj.Get('chart.tooltips')(segment[5]));

                    } else if (typeof(obj.Get('chart.tooltips')) == 'object' && typeof(obj.Get('chart.tooltips')[segment[5]]) == 'function') {
                        var text = String(obj.Get('chart.tooltips')[segment[5]](segment[5]));
                    
                    } else if (typeof(obj.Get('chart.tooltips')) == 'object') {
                        var text = String(obj.Get('chart.tooltips')[segment[5]]);

                    } else {
                        var text = '';
                    }

                    if (text) {
                        RGraph.Tooltip(canvas, text, e.pageX, e.pageY, segment[5]);
                    }

                    /**
                    * Need to redraw the key?
                    */
                    if (obj.Get('chart.key') && obj.Get('chart.key').length && obj.Get('chart.key.position') == 'graph') {
                        RGraph.DrawKey(obj, obj.Get('chart.key'), obj.Get('chart.colors'));
                    }

                    e.stopPropagation();

                    return;
                } else if (obj.Get('chart.tooltips.event') == 'onclick') {
                    RGraph.Redraw();
                }
            }
            var event_name = this.Get('chart.tooltips.event') == 'onmousemove' ? 'mousemove' : 'click';

            this.canvas.addEventListener(event_name, canvas_onclick_func, false);
            RGraph.AddEventListener(this.id, event_name, canvas_onclick_func);






            /**
            * The onmousemove event for changing the cursor
            */
            //this.canvas.onmousemove = function (e)
            var canvas_onmousemove_func = function (e)
            {
                RGraph.HideZoomedCanvas();

                e = RGraph.FixEventObject(e);
                
                var obj     = e.target.__object__;
                var segment = obj.getSegment(e);

                if (segment) {
                    e.target.style.cursor = 'pointer';

                    return;
                }

                /**
                * Put the cursor back to null
                */
                e.target.style.cursor = 'default';
            }
            this.canvas.addEventListener('mousemove', canvas_onmousemove_func, false);
            RGraph.AddEventListener(this.id, 'mousemove', canvas_onmousemove_func);









            /**
            * The window onclick function
            */
            var window_onclick_func = function (e)
            {
                RGraph.HideZoomedCanvas();

                e = RGraph.FixEventObject(e);

                RGraph.Redraw();

                /**
                * Put the cursor back to null
                */
                e.target.style.cursor = 'default';
            }
            window.addEventListener('click', window_onclick_func, false);
            RGraph.AddEventListener('window_' + this.id, 'click', window_onclick_func);
        }


        /**
        * If a border is pecified, draw it
        */
        if (this.Get('chart.border')) {
            this.context.beginPath();
            this.context.lineWidth = 5;
            this.context.strokeStyle = this.Get('chart.border.color');

            this.context.arc(this.centerx,
                             this.centery,
                             this.radius - 2,
                             0,
                             6.28,
                             0);

            this.context.stroke();
        }
        
        /**
        * Draw the kay if desired
        */
        if (this.Get('chart.key') != null) {
            //this.Set('chart.key.position', 'graph');
            RGraph.DrawKey(this, this.Get('chart.key'), this.Get('chart.colors'));
        }


        /**
        * If this is actually a donut, draw a big circle in the middle
        */
        if (this.Get('chart.variant') == 'donut') {
            this.context.beginPath();
            this.context.strokeStyle = this.Get('chart.strokestyle');
            this.context.fillStyle   = this.Get('chart.variant.donut.color');
            this.context.arc(this.centerx, this.centery, this.radius / 2, 0, 6.28, 0);
            this.context.stroke();
            this.context.fill();
        }
        
        RGraph.NoShadow(this);
        
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
        * Fire the RGraph ondraw event
        */
        RGraph.FireCustomEvent(this, 'ondraw');
    }


    /**
    * Draws a single segment of the pie chart
    * 
    * @param int degrees The number of degrees for this segment
    */
    RGraph.Pie.prototype.DrawSegment = function (degrees, color, last, index)
    {
        var context  = this.context;
        var canvas   = this.canvas;
        var subTotal = this.subTotal;

        context.beginPath();

            context.fillStyle   = color;
            context.strokeStyle = this.Get('chart.strokestyle');
            context.lineWidth   = 0;

            /**
            * Exploded segments
            */
            if ( (typeof(this.Get('chart.exploded')) == 'object' && this.Get('chart.exploded')[index] > 0)) {
                var explosion = this.Get('chart.exploded')[index];
                var x         = 0;
                var y         = 0;
                var h         = explosion;
                var t         = (subTotal + (degrees / 2)) / (360/6.2830);
                var x         = (Math.cos(t) * explosion);
                var y         = (Math.sin(t) * explosion);
            
                this.context.moveTo(this.centerx + x, this.centery + y);
            } else {
                var x = 0;
                var y = 0;
            }

            context.arc(this.centerx + x,
                        this.centery + y,
                        this.radius,
                        subTotal / 57.3,
                        (last ? 360 : subTotal + degrees) / 57.3,
                        0);
    
            context.lineTo(this.centerx + x, this.centery + y);
            
            // Keep hold of the angles
            this.angles.push([subTotal, subTotal + degrees, this.centerx + x, this.centery + y])
        this.context.closePath();

        this.context.fill();
        //this.context.stroke();
    
        /**
        * Calculate the segment angle
        */
        this.Get('chart.segments').push([subTotal, subTotal + degrees]);
        this.subTotal += degrees;
    }

    /**
    * Draws the graphs labels
    */
    RGraph.Pie.prototype.DrawLabels = function ()
    {
        var hAlignment = 'left';
        var vAlignment = 'center';
        var labels     = this.Get('chart.labels');
        var context    = this.context;

        /**
        * Turn the shadow off
        */
        RGraph.NoShadow(this);
        
        context.fillStyle = 'black';
        context.beginPath();

        /**
        * Draw the key (ie. the labels)
        */
        if (labels && labels.length) {

            var text_size = this.Get('chart.text.size');

            for (i=0; i<labels.length; ++i) {
            
                /**
                * T|his ensures that if we're given too many labels, that we don't get an error
                */
                if (typeof(this.Get('chart.segments')[i]) == 'undefined') {
                    continue;
                }

                // Move to the centre
                context.moveTo(this.centerx,this.centery);
                
                var a = this.Get('chart.segments')[i][0] + ((this.Get('chart.segments')[i][1] - this.Get('chart.segments')[i][0]) / 2);

                /**
                * Alignment
                */
                if (a < 90) {
                    hAlignment = 'left';
                    vAlignment = 'center';
                } else if (a < 180) {
                    hAlignment = 'right';
                    vAlignment = 'center';
                } else if (a < 270) {
                    hAlignment = 'right';
                    vAlignment = 'center';
                } else if (a < 360) {
                    hAlignment = 'left';
                    vAlignment = 'center';
                }


                /**
                * Handle the additional "explosion" offset
                */
                if (typeof(this.Get('chart.exploded')) == 'object' && this.Get('chart.exploded')[i]) {

                    var t = ((this.angles[i][1] - this.angles[i][0]) / 2) / (360/6.2830);
                    var seperation = this.Get('chart.exploded')[i];
                    var angle = ((this.angles[i][1] - this.angles[i][0]) / 2) + this.angles[i][0];

                    // Adjust the angles
                    var explosion_offsetx = (Math.cos(angle / 57.29) * seperation);
                    var explosion_offsety = (Math.sin(angle / 57.29) * seperation);
                } else {
                    var explosion_offsetx = 0;
                    var explosion_offsety = 0;
                }

                context.fillStyle = this.Get('chart.text.color');

                RGraph.Text(context,
                            this.Get('chart.text.font'),
                            text_size,
                            this.centerx + explosion_offsetx + ((this.radius + 10)* Math.cos(a / 57.3)) + (this.Get('chart.labels.sticks') ? (a < 90 || a > 270 ? 2 : -2) : 0),
                            this.centery + explosion_offsety + (((this.radius + 10) * Math.sin(a / 57.3))),
                            labels[i],
                            vAlignment,
                            hAlignment);
            }
            
            context.fill();
        }
    }


    /**
    * This function draws the pie chart sticks (for the labels)
    */
    RGraph.Pie.prototype.DrawSticks = function ()
    {
        var context  = this.context;
        var segments = this.Get('chart.segments');
        var offset   = this.Get('chart.linewidth') / 2;
        var exploded = this.Get('chart.exploded');

        for (var i=0; i<segments.length; ++i) {

            var degrees = segments[i][1] - segments[i][0];

            context.beginPath();
            context.strokeStyle = this.Get('chart.labels.sticks.color');
            context.lineWidth   = 1;

            var midpoint = (segments[i][0] + (degrees / 2)) / 57.3;

            if (exploded && exploded[i]) {
                var extra = exploded[i];
            } else {
                var extra = 0;
            }

            context.arc(this.centerx,
                        this.centery,
                        this.radius + 7 + extra,
                        midpoint,
                        midpoint + 0.01,
                        0);
            
            
            context.arc(this.centerx,
                        this.centery,
                        this.radius - offset + extra,
                        midpoint,
                        midpoint + 0.01,
                        0);

            context.stroke();
        }
    }


    /**
    * The (now Pie chart specific) getSegment function
    * 
    * @param object e The event object
    */
    RGraph.Pie.prototype.getSegment = function (e)
    {
        RGraph.FixEventObject(e);

        // The optional arg provides a way of allowing some accuracy (pixels)
        var accuracy = arguments[1] ? arguments[1] : 0;

        var obj         = e.target.__object__;
        var canvas      = obj.canvas;
        var context     = obj.context;
        var mouseCoords = RGraph.getMouseXY(e);
        var r           = obj.radius;
        var angles      = obj.angles;
        var ret         = [];

        for (var i=0; i<angles.length; ++i) {

            var x     = mouseCoords[0] - angles[i][2];
            var y     = mouseCoords[1] - angles[i][3];
            var theta = Math.atan(y / x); // RADIANS
            var hyp   = y / Math.sin(theta);
            var hyp   = (hyp < 0) ? hyp + accuracy : hyp - accuracy;
            // Put theta in DEGREES
            theta *= 57.3

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
            
            if (theta > 360) {
                theta -= 360;
            }

            if (theta >= angles[i][0] && theta < angles[i][1]) {

                hyp = Math.abs(hyp);

                if (!hyp || (obj.radius && hyp > obj.radius) ) {
                    return null;
                }

                if (obj.type == 'pie' && obj.Get('chart.variant') == 'donut' && (hyp > obj.radius || hyp < (obj.radius / 2) ) ) {
                    return null;
                }

                ret[0] = angles[i][2];
                ret[1] = angles[i][3];
                ret[2] = (obj.type == 'rose') ? angles[i][2] : obj.radius;
                ret[3] = angles[i][0];
                ret[4] = angles[i][1];
                ret[5] = i;


                
                if (ret[3] < 0) ret[3] += 360;
                if (ret[4] > 360) ret[4] -= 360;

                return ret;
            }
        }
        
        return null;
    }