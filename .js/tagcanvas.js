/**
 * Copyright (C) 2010 Graham Breach
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * TagCanvas 1.4.2
 * For more information, please contact <graham@goat1000.com>
 */
function Point(x,y)
{
	this.x = x; this.y = y;
}
Point.AbsPos = function(id)
{
	var e, p, pn;
	e = document.getElementById(id);
	p = new Point(e.offsetLeft,e.offsetTop);
	while(e.offsetParent) {
		pn = e.offsetParent;
		p.x += pn.offsetLeft;
		p.y += pn.offsetTop;
		e = pn;
	}
	return p;
};
function Point3D(x,y,z)
{
	this.x = x; this.y = y; this.z = z;
	this.RotateX = function(t) {
		var s = Math.sin(t), c = Math.cos(t);
		return new Point3D(
			this.x,
			(this.y * c) + (this.z * s),
			(this.y * -s) + (this.z * c));
	};
	this.RotateY = function(t) {
		var s = Math.sin(t), c = Math.cos(t);
		return new Point3D(
			(this.x * c) + (this.z * -s),
			this.y,
			(this.x * s) + (this.z * c));
	};
	this.RotateZ = function(t) {
		var s = Math.sin(t), c = Math.cos(t);
		return new Point3D(
			(this.x * c) + (this.y * s),
			(this.x * -s) + (this.y * c),
			this.z);
	};
	this.toString = function() {
		return '[' + this.x.toFixed(2) + ',' + this.y.toFixed(2) + ',' + this.z.toFixed(2) + ']';
	};
	this.Project = function(w,h,fov,asp) {
		var yn, xn, zn;
		yn = (this.y  * TagCanvas.z1) / (TagCanvas.z1 + TagCanvas.z2 + this.z);
		xn = (this.x  * TagCanvas.z1) / (TagCanvas.z1 + TagCanvas.z2 + this.z);
		zn = TagCanvas.z2 + this.z;
		return new Point3D(xn, yn, zn);
	};
}
function TagCanvas(cid,lctr)
{
	var i, ctr, tl, vl, p, im, ii, tag, c = document.getElementById(cid), cp = ['id','class','innerHTML'];

	if(!c) throw 0;
	if(typeof(G_vmlCanvasManager) != 'undefined')
		c = G_vmlCanvasManager.initElement(c);
	if(c && (!c.getContext || !c.getContext('2d').fillText)) {
		p = document.createElement('DIV');
		for(i = 0; i < cp.length; ++i)
			p[cp[i]] = c[cp[i]];
		c.parentNode.insertBefore(p,c);
		c.parentNode.removeChild(c);
		throw 0;
	}
	TagCanvas.z1 = (19800 / (Math.exp(TagCanvas.depth) * (1-1/Math.E))) +
		20000 - 19800 / (1-(1/Math.E));
	TagCanvas.z2 = TagCanvas.z1;
	TagCanvas.radius = (c.height > c.width ? c.width : c.height)
				* 0.33 * (TagCanvas.z2 + TagCanvas.z1) / (TagCanvas.z1);
	this.Draw = function(cv)
	{
		var max_sc = 0, x1, y1, c, a, i;
		c = cv.getContext('2d');
		c.clearRect(0,0,cv.width,cv.height);
		x1 = cv.width / 2;
		y1 = cv.height / 2;
		this.active = null;
		for(i = 0; i < this.taglist.length; ++i)
			this.taglist[i].Calc(this.yaw, this.pitch);
		this.taglist = this.taglist.sort(function(a,b) { return a.sc-b.sc;});
		for(i = 0; i < this.taglist.length; ++i)
		{
			a = this.taglist[i].Draw(c, x1, y1);
			if(a && a.sc > max_sc)
			{
				this.active = a;
				this.active.index = i;
				max_sc = a.sc;
			}
		}
		if(TagCanvas.freezeActive && this.active)
			this.yaw = this.pitch = 0;
		else
			this.Animate(cv.width, cv.height);
		if(this.active)
			this.active.Draw(c);
	};
	this.Animate = function(w,h)
	{
		if(TagCanvas.mx >= 0 && TagCanvas.my >= 0 &&
				TagCanvas.mx < w && TagCanvas.my < h)
		{
			this.yaw = (TagCanvas.maxSpeed * 2 * TagCanvas.mx / w) - TagCanvas.maxSpeed;
			this.pitch = -((TagCanvas.maxSpeed * 2 * TagCanvas.my / h) - TagCanvas.maxSpeed);
			if(TagCanvas.reverse)
			{
				this.yaw = -this.yaw;
				this.pitch = -this.pitch;
			}
			TagCanvas.initial = null;
		}
		else if(!TagCanvas.initial)
		{
			var ay = Math.abs(this.yaw), ap = Math.abs(this.pitch);
			if(ay > TagCanvas.minSpeed)
				this.yaw = ay > TagCanvas.z0 ? this.yaw * TagCanvas.decel : 0.0;
			if(ap > TagCanvas.minSpeed)
				this.pitch = ap > TagCanvas.z0 ? this.pitch * TagCanvas.decel : 0.0;
		}
	};	
	this.Clicked = function(e)
	{
		try {
			if(this.active && this.taglist[this.active.index]) 
				this.taglist[this.active.index].Clicked(e);
		} catch(ex) {
			//window.alert(ex);
		}
	};
	try {
		ctr = document.getElementById(lctr ? lctr : cid);
		tl = ctr.getElementsByTagName('a');
		this.taglist = [];
		if(tl.length)
		{
			vl = TagCanvas.PointsOnSphere(tl.length);
			for(i = 0; i < tl.length; ++i)
			{
				im = tl[i].getElementsByTagName('img');
				if(im.length) {
					ii = new Image;
					ii.src = im[0].src;
					tag = new Tag(ii, tl[i], vl[i], 1, 1);
					AddImage(ii,tag,this.taglist);
				} else {
					this.taglist.push(new Tag(tl[i].innerText ? tl[i].innerText :
						tl[i].textContent, tl[i],
						vl[i], 2, TagCanvas.textHeight + 2));
				}
			}
		}
		if(lctr && TagCanvas.hideTags)
			ctr.style.display = 'none';
	} catch(ex) {
		// ex;
	}

	this.yaw = TagCanvas.initial ? TagCanvas.initial[0] * TagCanvas.maxSpeed : 0;
	this.pitch = TagCanvas.initial ? TagCanvas.initial[1] * TagCanvas.maxSpeed : 0;
	p = Point.AbsPos(c.id);
	TagCanvas.cx = p.x;
	TagCanvas.cy = p.y;
	if(!TagCanvas.started) {
		AddHandler('mousemove', TagCanvas.MouseMove, null);
		AddHandler('mouseout', TagCanvas.MouseMove, null);
		AddHandler('mouseup', TagCanvas.MouseClick, null);
		TagCanvas.started = setInterval(function() { TagCanvas.DrawCanvas(c); }, 10);
	}
}
function AddImage(i,t,tl)
{
	if(i.complete) {
		t.w = i.width;
		t.h = i.height;
		tl.push(t);
	} else {
		AddHandler('load',function() {
			t.w = this.width;
			t.h = this.height;
			tl.push(t);
		},i);
	}
}
function AddHandler(h,f,e)
{
	if(!e) e = document;
	if(e.addEventListener)
		e.addEventListener(h,f,false);
	else
		e.attachEvent('on' + h, f);
}
function Outline()
{
	this.ts = new Date();
	this.Update = function(x,y,w,h,sc) {
		this.x = sc * (x - TagCanvas.outlineOffset);
		this.y = sc * (y - TagCanvas.outlineOffset);
		this.w = sc * (w + TagCanvas.outlineOffset * 2);
		this.h = sc * (h + TagCanvas.outlineOffset * 2);
		this.sc = sc; // used to determine frontmost
	};
	this.Draw = function(c) {
		var diff = new Date() - this.ts;
		c.save();
		c.strokeStyle = TagCanvas.outlineColour;
		c.lineWidth = TagCanvas.outlineThickness;
		if(TagCanvas.pulsateTo < 1.0) {
			c.globalAlpha = TagCanvas.pulsateTo + ((1.0 - TagCanvas.pulsateTo) * 
				(0.5 + (Math.cos(2 * Math.PI * diff / (1000 * TagCanvas.pulsateTime)) / 2.0)));
		}
		c.beginPath();
		c.rect(this.x, this.y, this.w, this.h);
		c.closePath();
		c.stroke();
		c.restore();
	};
	this.Active = function(c,x,y) {
		return (x >= this.x && y >= this.y &&
			x <= this.x + this.w && y <= this.y + this.h);
	};
	this.Update(0,0,0,0,1);
}
function Tag(name,a,v,w,h)
{
	this.image = name.src ? name : null;
	this.name = name.src ? '' : name;
	this.a = a;
	this.p3d = new Point3D(0,0,0);
	this.p3d.x = v[0] * TagCanvas.radius * 1.1;
	this.p3d.y = v[1] * TagCanvas.radius * 1.1;
	this.p3d.z = v[2] * TagCanvas.radius * 1.1;
	this.x = 0;
	this.y = 0;
	this.w = w;
	this.h = h;
	this.sc = 1;
	this.alpha = 1;
	this.outline = new Outline;

	this.Draw = function(c,xoff,yoff) {
		var m;
		c.save();
		c.globalAlpha = this.alpha;
		c.scale(this.sc, this.sc);
		xoff = xoff / this.sc;
		yoff = yoff / this.sc;
		c.textBaseline = 'top';
		c.fillStyle = TagCanvas.textColour;
		c.font = TagCanvas.textHeight + 'px ' + TagCanvas.textFont;
		if(this.image) {
			this.w1 = this.w * this.sc;
			this.h1 = this.h * this.sc;
		} else {
			m = c.measureText(this.name);
			this.w1 = m.width + 2;
			this.h1 = this.h;// * 2 * this.sc;
		}
		xoff = xoff - (this.w1 / 2);
		yoff = yoff - (this.h1 / 2);

		if(this.image)
			c.drawImage(this.image, xoff + this.x, yoff + this.y,
				this.image.width * this.sc, this.image.height * this.sc);	
		else
			c.fillText(this.name, xoff + this.x + 1, yoff + this.y + 1, this.w1 - 2);
		c.restore();
		this.outline.Update(xoff + this.x, yoff + this.y, this.w1, this.h1, this.sc);
		if(this.outline.Active(c, TagCanvas.mx, TagCanvas.my))
			return this.outline;
		return null;
	};
	this.Calc = function(yaw,pitch) {
		this.p3d = this.p3d.RotateY(yaw).RotateX(pitch);
		var p = this.p3d.Project(this.w, this.h, Math.PI / 4, 20);
		this.x = p.x;
		this.y = p.y;
		this.sc = (TagCanvas.z1 + TagCanvas.z2 - p.z) / TagCanvas.z2;
		this.alpha = TagCanvas.minBrightness + 1 -
			((p.z - TagCanvas.z2 + TagCanvas.radius) / (2 * TagCanvas.radius));
	};
	this.Clicked = function(e) {
		if(this.a.fireEvent) {
			if(!this.a.fireEvent('onclick'))
				return;
		} else {
			var evt = document.createEvent('MouseEvents');
			evt.initMouseEvent('click', true, true, window,
					0, 0, 0, 0, 0, false, false, false, false, 0, null);
			if(!this.a.dispatchEvent(evt))
				return;
		}
		if(this.a.target == '' || this.a.target == '_self')
			document.location = this.a.href;
		else if(self.frames[this.a.target])
			self.frames[this.a.target] = this.a.href;
		else if(top.frames[this.a.target])
			top.frames[this.a.target] = this.a.href;
		else
			window.open(this.a.href, this.a.target);
	};
}
TagCanvas.MouseMove = function(e)
{
	if(e.pageX) {
		TagCanvas.mx = e.pageX - TagCanvas.cx;
		TagCanvas.my = e.pageY - TagCanvas.cy;
	} else {
		TagCanvas.mx = e.clientX + (document.documentElement.scrollLeft ? 
			document.documentElement.scrollLeft : document.body.scrollLeft)
			- TagCanvas.cx;
		TagCanvas.my = e.clientY + (document.documentElement.scrollTop ? 
			document.documentElement.scrollTop : document.body.scrollTop)
			- TagCanvas.cy;
	}
};
TagCanvas.MouseClick = function(e)
{
	var cb = document.addEventListener ? 0 : 1;
	if(e.button == cb) {
		TagCanvas.MouseMove(e);
		TagCanvas.tc.Clicked(e);
	}
};
TagCanvas.DrawCanvas = function(cv)
{
	TagCanvas.tc.Draw(cv);
};
TagCanvas.Start = function(id,l)
{
	TagCanvas.tc = new TagCanvas(id,l);
};
TagCanvas.PointsOnSphere = function(n)
{
	var i, y, r, phi, pts = [], inc = Math.PI * (3-Math.sqrt(5)), off = 2/n;
	for(i = 0; i < n; ++i) {
		y = i * off - 1 + (off / 2);
		r = Math.sqrt(1 - y*y);
		phi = i * inc;
		pts.push([Math.cos(phi)*r, y, Math.sin(phi)*r]);
	}
	return pts;
};


TagCanvas.mx = -1;
TagCanvas.my = -1;
TagCanvas.cx = 0;
TagCanvas.cy = 0;
TagCanvas.z1 = 20000;
TagCanvas.z2 = 20000;
TagCanvas.z0 = 0.0002;
TagCanvas.freezeActive = false;
TagCanvas.pulsateTo = 0.15;
TagCanvas.pulsateTime = 3;
TagCanvas.reverse = false;
TagCanvas.depth = 0.5;
TagCanvas.maxSpeed = 0.05;
TagCanvas.minSpeed = 0.0;
TagCanvas.decel = 0.95;
TagCanvas.minBrightness = 0.1;
TagCanvas.outlineColour = '#ffff99';
TagCanvas.outlineThickness = 2;
TagCanvas.outlineOffset = 5;
TagCanvas.textColour = '#ff99ff';
TagCanvas.textHeight = 15;
TagCanvas.textFont = 'Helvetica, Arial, sans-serif';
TagCanvas.initial = null;
TagCanvas.hideTags = true;

