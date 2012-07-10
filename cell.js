/*  js-lines javascript implementation of the famous game "lines"
    Copyright (C) 2009  Alessandro Rosetti

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var red = 1;
var azure = 2;
var green = 3;
var yellow = 4;
var magenta = 5;
var orange = 6;
var blue = 7;
var blank = 0;

var globalScope = new Array();

function ieHandler( id, strFunc ) {
    var scope = globalScope[id];
    eval( "scope." + strFunc);
}

/*
function timeout(fn,delay){
    if (navigator.appName=="Microsoft Internet Explorer")
    { 
        setTimeout( 'ieHandler("' + this.id + '","' + fn + '")', delay);
    }
    else {     
        setTimeout(function ( that ) {eval("that."+fn)},delay,this);
    }
}

function interval(fn,delay){
    if (navigator.appName=="Microsoft Internet Explorer")
    { 
        setInterval( 'ieHandler("' + this.id + '","' + fn + '")', delay);
    }
    else {     
        setInterval(function ( that ) {eval("that."+fn)},delay,this);
    }
}
*/

function Cell(y,x,size){
    this.xpos=x;
    this.ypos=y;
    this.color=blank;    
    this.dom_h="100%";
    this.dom_w="100%";
    this.dom_elem=document.createElement("img");

/*
    if (navigator.appName=="Microsoft Internet Explorer") {  
        this.dom_elem.onclick = new Function('click(' + this.xpos + "," + this.ypos + ')');
    }
    else
        this.dom_elem.setAttribute("onBeginDrag","return FALSE;");
*/
        
    this.timer=0;
    this.id=x+y*size;
    this.locked=false;
    this.direction=0;
    globalScope[ this.id ] = this;
}

Cell.prototype.isSet = function() {
    if (this.color == blank) return false;
    return true;
}

Cell.prototype.set = function(c) {
    this.color=parseInt(c);    
    this.dom_elem.setAttribute("height",this.dom_h);
    this.dom_elem.setAttribute("width",this.dom_w);
    this.dom_elem.setAttribute("src",imagePath(c,0));
    this.dom_elem.setAttribute("alt"," " + c + " ");
    this.dom_elem.setAttribute("id","i"+this.xpos+"-"+this.ypos);

    if (navigator.appName=="Microsoft Internet Explorer") {  
        this.dom_elem.onclick = new Function('click(' + this.xpos + "," + this.ypos + ')');
    }
    else
        this.dom_elem.setAttribute("onClick","click_ball(" + this.xpos + "," + this.ypos + ")");
    this.unSelect();
}

Cell.prototype.select = function() {
    if(this.timer == 0) {
        if (navigator.appName=="Microsoft Internet Explorer") {
            this.timer=setInterval( 'ieHandler("' + this.id + '","pulse()")', 70 );
        }
        else this.timer=setInterval(function ( that ) {that.pulse()},70,this);
    }
}

Cell.prototype.unSelect = function() {
    clearTimeout(this.timer);
    this.timer=0;
    this.dom_elem.setAttribute("src",imagePath(this.color,0));
    this.set_size(100);
}

Cell.prototype.lock = function() {
    this.locked=true;
}

Cell.prototype.unlock = function() {
    this.locked=false;
}

Cell.prototype.set_size = function(size) {
    this.dom_elem.setAttribute("height", size + "%");
	this.dom_elem.setAttribute("width", size + "%");
}

Cell.prototype.hide = function() {
    this.dom_elem.setAttribute("src",imagePath(blank,0));
}

Cell.prototype.show = function() {
    this.dom_elem.setAttribute("src",imagePath(this.color,0));
}

Cell.prototype.reset = function() {
    this.set(blank);
}

Cell.prototype.rotate = function() {
    var ball=this.dom_elem.getAttribute("src");
    this.dom_elem.setAttribute("src",imagePath(this.color, (parseInt(ball[ball.length - 5])+1)%4 ) );
}

Cell.prototype.zoom = function(inout,maxmin,step) {
    var ball=this.dom_elem.getAttribute("src");
    var h=parseInt(this.dom_elem.getAttribute("height"));
    var w=parseInt(this.dom_elem.getAttribute("width"));

    if(inout){
        h+=step;
        w+=step;
        if(h>maxmin) h=maxmin;
        if(w>maxmin) w=maxmin;
    }
    else {
        h-=step;
        w-=step;
        if(h<maxmin) h=maxmin;
        if(w<maxmin) w=maxmin;
    }

    this.dom_elem.setAttribute("height", h + "%");
    this.dom_elem.setAttribute("width" , w + "%");
}

Cell.prototype.ball_zoom = function(inout) {
    this.lock();
    if(inout){
        this.set_size(0);
    }
    for(i=0;i<8;i++)    
        if (navigator.appName=="Microsoft Internet Explorer")
        { 
            if(inout) setTimeout( 'ieHandler("' + this.id + '","zoom(1,100,15)")', 70*i );
            else setTimeout( 'ieHandler("' + this.id + '","zoom(0,0,15)")', 70*i );
            setTimeout( 'ieHandler("' + this.id + '","rotate()")', 70*i );
        }
        else {
            if(inout) setTimeout(function ( that, d ) {that.zoom(d,100,15)},70*i,this,inout);
            else setTimeout(function ( that, d ) {that.zoom(d,0,15)},70*i,this,inout);
            setTimeout(function ( that ) {that.rotate()},70*i,this);
        }


    if (navigator.appName=="Microsoft Internet Explorer")
    { 
        setTimeout( 'ieHandler("' + this.id + '","unlock()")', 9*70 );
    }
    else {
        setTimeout(function ( that ) {that.unlock()},9*70,this);
    }

    if(!inout) {
        if (navigator.appName=="Microsoft Internet Explorer")
        { 
            setTimeout( 'ieHandler("' + this.id + '","set(blank)")', 8*70 );
            setTimeout( 'ieHandler("' + this.id + '","set_size(0)")', 8*70 );
            setTimeout( 'ieHandler("' + this.id + '","set_size(0)")', 8*70 );
        }
        else {
            setTimeout(function ( that, d ) {that.set(blank)},8*70,this,!inout);
            setTimeout(function ( that, d ) {that.set_size(0)},8*70,this,!inout);
            setTimeout(function ( that, d ) {that.set_size(0)},8*70,this,!inout);
        }

        for(i=0;i<12;i++)    
            if (navigator.appName=="Microsoft Internet Explorer")
            { 
                if(!inout) setTimeout( 'ieHandler("' + this.id + '","zoom(1,100,15)")', 140*i );
                else setTimeout( 'ieHandler("' + this.id + '","zoom(0,0,15)")', 140*i );
            }
            else {
                if(!inout) setTimeout(function ( that, d ) {that.zoom(d,100,15)},140*i,this,!inout);
                else  setTimeout(function ( that, d ) {that.zoom(d,0,15)},140*i,this,!inout);
            }
    }

}


Cell.prototype.pulse = function() {
    var w=parseInt(this.dom_elem.getAttribute("width"));
    this.rotate();
    if(w <= 80)
        this.direction=1;
    if(w >= 100)
        this.direction=0;
    if(this.direction==0)
        this.zoom(0,80,2);
    if(this.direction==1)
        this.zoom(1,100,2);
}



Cell.prototype.full_rotate = function() {
    for(i=0;i<8;i++)    
        if (navigator.appName=="Microsoft Internet Explorer")
        { 
            setTimeout( 'ieHandler("' + this.id + '","rotate()")', 50*i );
        }
        else {
            setTimeout(function ( that ) {that.rotate()},50*i,this);
        }
}

Cell.prototype.blink = function(out) {
    if (navigator.appName=="Microsoft Internet Explorer")
    { 
        setTimeout( 'ieHandler("' + this.id + '","hide()")', 100 );
        setTimeout( 'ieHandler("' + this.id + '","show()")', 200 );
        setTimeout( 'ieHandler("' + this.id + '","hide()")', 300 );
        setTimeout( 'ieHandler("' + this.id + '","show()")', 400 );
        if(out){
            setTimeout( 'ieHandler("' + this.id + '","reset")', 500 );
        }
    }
    else {     
        setTimeout(function ( that ) {that.hide()},100,this);
        setTimeout(function ( that ) {that.show()},200,this);
        setTimeout(function ( that ) {that.hide()},300,this);
        setTimeout(function ( that ) {that.show()},400,this);
        if(out){
            setTimeout(function ( that ) {that.reset()},500,this);
        }
    }
}

function imagePath(c,i) {
    c=parseInt(c);
    var img;
    switch(c){
	    case red:
	       img="red" + i + ".png";
	       break;
	    case azure:
	       img="azure" + i + ".png";
	       break;
	    case green:
	      img="green" + i + ".png";
	      break;
	    case yellow:
	       img="yellow" + i + ".png";
	       break;
	    case magenta:
	       img="magenta" + i + ".png";
	       break;
	    case orange:
	       img="orange" + i + ".png";
	       break;
	    case blue:
	       img="blue" + i + ".png";
	       break;
	    case blank:
	      img="blank.png";
           break;
        default:
          img="blank.png";
           break;
    };
    return "img/" + "basic/" + img;
}

function colorName(c) {
    var color_name;
    switch(c){
	    case red:
	       color_name=lang['m_red'];
	       break;
	    case azure:
	       color_name=lang['m_azure'];
	       break;
	    case green:
	      color_name=lang['m_green'];
	      break;
	    case yellow:
	       color_name=lang['m_yellow'];
	       break;
	    case magenta:
	       color_name=lang['m_magenta'];
	       break;
	    case orange:
	       color_name=lang['m_orange'];
	       break;
	    case blue:
	       color_name=lang['m_blue'];
	       break;
	    default:
	      color_name=lang['m_blank'];
    };
    return color_name;
}
