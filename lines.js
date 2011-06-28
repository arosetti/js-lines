/*  js-lines javascript implementation of the famous game "lines"
    Copyright (C) 2009-2010  Alessandro Rosetti

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

var version="0.7.4";

var locked=false;
var selected=false;
var score=0;
var rounds=0;
var explosions=0;
var exploded_balls=0;

var size=9;
var numcolors=7;
var board=new Array();
var next=new Array(3);

var nop = 0;
var inc = 1;
var dec = 2;

var anim_timer;

function jslines(div) {
    init_main_layout(div);

    setMsg("msg",lang['start']);
    document.title="js-lines v" + version;

    var line_box;
    var middle_box;
    var elem_box;

    for(i=0; i<size; i++) {
        board[i]= new Array();
        for(j=0; j<size; j++) {
	        board[i][j] = new Cell(i,j,size);
            elem_box=document.createElement("div");
	        document.getElementById("gamediv").appendChild(elem_box);
            middle_box=document.createElement("div");
            elem_box.appendChild(middle_box);
            elem_box.setAttribute("class","elem_box");
            middle_box.setAttribute("class","middle_box");
            middle_box.appendChild(board[i][j].dom_elem);
	        board[i][j].set(blank);
        }
        line_box=document.createElement("div");
        line_box.setAttribute("class","line_box");
        document.getElementById("gamediv").appendChild(line_box);
    }
    selected=false;
 
    anim_timer=setInterval("animrand()",100);
}


function validate(x,y) {
    x=parseInt(x);
    y=parseInt(y);
    if((x >= 0) && (x < size) && (y >= 0) && (y < size)) return true;
    else return false;
}

function get(x,y) {
    x=parseInt(x);
    y=parseInt(y);
    if(validate(x,y)) return board[y][x];
    else return 0;
}

function reset() {
    clearTimeout(anim_timer);
    setMsg("starta",lang['mnu_reset']);
    setMsg("msg",lang['rule']);
    if (navigator.appName=="Microsoft Internet Explorer")   
        document.getElementById('rules').style.display = 'none';
    else
        document.getElementById('rules').style.display = 'none';

    selected=locked=false;
    score=rounds=explosions=exploded_balls=0;
    
    for(i=0; i<size; i++)  
        for(j=0; j<size; j++)
            get(i,j).reset();

    randomNext();
    randomSet();
}


function animrand(){
    lock();
    c=Math.floor(Math.random()*numcolors)+1;
    x=Math.floor(Math.random()*size);
    y=Math.floor(Math.random()*size);
    if(!get(x,y).isSet()) get(x,y).set(c);
    c=Math.floor(Math.random()*numcolors)+1;
    x=Math.floor(Math.random()*size);
    y=Math.floor(Math.random()*size);
    get(x,y).reset();
}


function count(c) {
    var n=0;
    for(i=0; i<size; i++) {
        for(j=0; j<size; j++) {
            if(get(i,j).color == c) n++;
        }
    }
    return n;
}

function randomNext() {
    for(i=0;i<=2;i++) next[i]=Math.floor(Math.random()*numcolors)+1;
}

function randomSet() {
    var c;
    var x,y,k=3;

    while (k != 0) {
      c=next[k-1];
      x=Math.floor(Math.random()*size);
      y=Math.floor(Math.random()*size);
      if (!get(x,y).isSet()) {
          get(x,y).set(c);
          get(x,y).ball_zoom(1);
          if(findLines(x,y)) setMsg("msg",lang['rndscore']);
          k--;
       }
       else if (count(blank) == 0)  break;
    }

    randomNext();
    updateStatistics();
}

function click(x,y) {   
    if (count(blank) == 0) {
        setMsg("msg",lang['gameover']);
        setMsg("starta",lang['mnu_start']);
        lock();
    }   

    if (!locked && !get(x,y).locked){
        var basemsg=lang['m_cell'] + " " + colorName(get(x,y).color) + " (" + x + "," + y + ") ";
        if(!selected && get(x,y).color != blank) {
            setMsg("msg",basemsg + lang['m_selected']);
            selected=true;
            get(x,y).select();
            xs=x;
            ys=y;
        }
        else {
            if (selected && (get(x,y).color  == blank) ) {
	        setMsg("msg",lang['m_ball'] + " " + lang['m_movedto'] + " (" + x + "," + y + ")");
                selected=false;
                get(xs,ys).unSelect();
                xd=x;
                yd=y;
                move();
            }
            else if (get(x,y).color != blank) {
	        
                if(xs!=x || ys!=y) get(xs,ys).unSelect();
                if(xs==x && ys==y) {
                    setMsg("msg",basemsg + lang['m_unselected']);
                    selected=false;
                    get(xs,ys).unSelect();
                }
                else {
                    setMsg("msg",basemsg + lang['m_selected']);
                    get(x,y).select();
                }
                xs=x;
                ys=y;
            } 
        }
    }
}

function lock() {
   locked=true;
}

function unlock() {
   locked=false;
}

function move() {
    var t=get(xs,ys).color;
    rounds++;
    lock();
    get(xd,yd).set(t); 
    /*get(xd,yd).blink(0);*/
       
    get(xs,ys).reset();  
    if(!findLines(xd,yd)) randomSet();
    unlock();
    updateStatistics();
}

function scrollLines(x,y,tx,ty,temp,del) {
   var count=0;
   var cx=parseInt(x),cy=parseInt(y);
   while ( get(cx,cy) != 0 && get(cx,cy).color == temp) {
       if(del) get(cx,cy).ball_zoom(0);
       count++;
       if(tx == inc) cx++;
       if(tx == dec) cx--;
       if(ty == inc) cy++;
       if(ty == dec) cy--;
   }
   return count;
}

function findLines(x,y) {
   var t=get(x,y).color;
   var cx=0,cy=0;
   x=parseInt(x);
   y=parseInt(y);

   var nkilled=0;

   var vert=0;
   var horiz=0;
   var diag1=0;
   var diag2=0;
   
   vert   = scrollLines(x,y-1,nop,dec,t,false);
   vert  += scrollLines(x,y+1,nop,inc,t,false);
   horiz  = scrollLines(x-1,y,dec,nop,t,false);
   horiz += scrollLines(x+1,y,inc,nop,t,false);
   diag1  = scrollLines(x-1,y-1,dec,dec,t,false);
   diag1 += scrollLines(x+1,y+1,inc,inc,t,false);
   diag2  = scrollLines(x+1,y-1,inc,dec,t,false);
   diag2 += scrollLines(x-1,y+1,dec,inc,t,false);

   if (vert >= 4) {
       nkilled+=vert;
       scrollLines(x,parseInt(y)-1,nop,dec,t,true);
       scrollLines(x,parseInt(y)+1,nop,inc,t,true);
       get(x,y).ball_zoom(0);
   }

   if (horiz >= 4) {
       nkilled+=horiz;
       scrollLines(parseInt(x)-1,y,dec,nop,t,true);
       scrollLines(parseInt(x)+1,y,inc,nop,t,true);
       get(x,y).ball_zoom(0);
   }

   if (diag1 >= 4) {
       nkilled+=diag1;
       scrollLines(parseInt(x)-1,parseInt(y)-1,dec,dec,t,true);
       scrollLines(parseInt(x)+1,parseInt(y)+1,inc,inc,t,true);
       get(x,y).ball_zoom(0);
   }

   if (diag2 >= 4) {
       nkilled+=diag2;
       scrollLines(parseInt(x)+1,parseInt(y)-1,inc,dec,t,true);
       scrollLines(parseInt(x)-1,parseInt(y)+1,dec,inc,t,true);
       get(x,y).ball_zoom(0);
   }

   if (nkilled > 0) {
       incScore(nkilled+1);
       return true;
   }
   else return false;
}

function incScore(n) {
    var score_diff=n*(n-4)+1;
    setMsg("msg",n +" "+ lang['balls']+ ", +" + score_diff + " " + lang['points'] + "!");  
    score+=score_diff;
    exploded_balls+=n;
    explosions++;
}

//*********************LAYOUT_FUNCTIONS*********************//

function addElement(type,parent,id,nodeValue) {
    var temp=document.createElement(type);
    if (id != 0) temp.setAttribute("id",id);
    if (nodeValue != 0) temp.appendChild(document.createTextNode(nodeValue));
    document.getElementById(parent).appendChild(temp);
    return temp;
}

function removeElement(parent,id) {
    var d = document.getElementById(parent); 
    var d_nested = document.getElementById(id); 
    if(d !=0 && d_nested !=0 ) return d.removeChild(d_nested);
    else return 0;
}

function appendElement(parent,id) {
    var d = document.getElementById(parent); 
    var d_nested = document.getElementById(id); 
    if(d !=0 && d_nested !=0 ) return d.appendChild(d_nested);
    else return 0;
}

function getMsg(id){
    return document.getElementById(id).firstChild.nodeValue;
}

function setMsg(id,msg){
    if(document.getElementById(id).firstChild != undefined) document.getElementById(id).firstChild.nodeValue=msg;
    else document.getElementById(id).appendChild(document.createTextNode(msg));
}

function updateStatistics() {
    document.getElementById('score').firstChild.nodeValue=lang['score'] + " : " + score;
    document.getElementById('round').firstChild.nodeValue=lang['round'] + " : " + rounds;
    
    var st=Math.round((explosions>0)? (exploded_balls/explosions)*100:0)/100;
    document.getElementById('stat').firstChild.nodeValue=lang['stat'] + " : " + st;
    var st2=Math.round((rounds>0)? (explosions/rounds)*100:0)/100;
    document.getElementById('stat2').firstChild.nodeValue=lang['stat2'] + " : " + st2 + "%";

    document.getElementById('magenta').firstChild.nodeValue=lang['magenta'] + ": " + count(magenta);
    document.getElementById('blue').firstChild.nodeValue=lang['blue'] + ": " + count(blue);
    document.getElementById('azure').firstChild.nodeValue=lang['azure'] + ": " + count(azure);
    document.getElementById('green').firstChild.nodeValue=lang['green'] + ": " + count(green);
    document.getElementById('yellow').firstChild.nodeValue=lang['yellow'] + ": " + count(yellow);
    document.getElementById('orange').firstChild.nodeValue=lang['orange'] + ": " + count(orange);
    document.getElementById('red').firstChild.nodeValue=lang['red'] + ": " + count(red);
    document.getElementById('blank').firstChild.nodeValue="Vuote: " + count(blank);

    if (count(blank) == 0) {
        next[0]=next[1]=next[2]=0;
        setMsg("msg",lang['gameover']);
        setMsg("starta",lang['mnu_start']);
    }

    document.getElementById('pa').setAttribute("src",imagePath(next[0],0));
    document.getElementById('pb').setAttribute("src",imagePath(next[1],0));
    document.getElementById('pc').setAttribute("src",imagePath(next[2],0));

}

function loadNextImg() {
    pa= document.createElement("img");
    pa.setAttribute("src",imagePath(next[0],0));
    pa.setAttribute("alt"," " + next[0] + " ");
    pa.setAttribute("id","pa");
    pa.setAttribute("height","22");
    pa.setAttribute("width","22");
 
    pb= document.createElement("img");
    pb.setAttribute("src",imagePath(next[1],0));
    pb.setAttribute("alt"," " + next[1] + " ");
    pb.setAttribute("id","pb");
    pb.setAttribute("height","22");
    pb.setAttribute("width","22");

    pc= document.createElement("img");
    pc.setAttribute("src",imagePath(next[2],0));
    pc.setAttribute("alt"," " + next[2] + " ");
    pc.setAttribute("id","pc");
    pc.setAttribute("height","22");
    pc.setAttribute("width","22");

    document.getElementById('nextimg').appendChild(pa);
    document.getElementById('nextimg').appendChild(pb);
    document.getElementById('nextimg').appendChild(pc);
}

function init_main_layout(div){
    addElement("div",div,"rules",0);
    var sclose=addElement("strong","rules","sclose",0);
    var close=addElement("a","sclose","close",lang['mnu_close']);
    close.setAttribute("href","#");
    if (navigator.appName=="Microsoft Internet Explorer")   
        close.onclick = new Function("document.getElementById('rules').style.display = 'none';");
    else
        close.setAttribute("onClick","document.getElementById('rules').style.display = 'none';");


    addElement("p","rules","message",lang['long_rule']);

    var img=document.createElement("img");
    img.setAttribute("src","img/align.png");
    img.setAttribute("alt","align");
    img.setAttribute("id","rule_img");
    document.getElementById("rules").appendChild(img);



    addElement("div",div,"left",0);
    addElement("h1","left",0,"js-lines!");
    addElement("h2","left",0,"javascript lines " + version);    
    
    addElement("p","left","startp",0);
    addElement("a","startp","starta",lang['mnu_start']).setAttribute("href","javascript:reset();");

    addElement("p","left","rulesp",0);
    var rule=addElement("a","rulesp","rulesa",lang['mnu_rules']);
    rule.setAttribute("href","#");
    if (navigator.appName=="Microsoft Internet Explorer")   
        rule.onclick = new Function("document.getElementById('rules').style.display = 'block';");
    else
        rule.setAttribute("onClick","document.getElementById('rules').style.display = 'block';");

    addElement("div",div,"right",0);
    addElement("div","right","game",0);
    addElement("div","game","gamediv",0);
    addElement("div","game","msgdiv",0);
    addElement("p","msgdiv","msg",0);
    addElement("div","right","box",0); 

    addElement("strong","box","score",lang['score']);
    addElement("p","box","round",lang['round']);
    addElement("p","box","stat",lang['stat']);
    addElement("p","box","stat2",lang['stat2']);

    addElement("p","box","next",lang['next']);
    addElement("p","box","nextimg",0);
    loadNextImg();
    addElement("p","box","magenta",lang['magenta']);
    addElement("p","box","blue",lang['blue']);
    addElement("p","box","azure",lang['azure']);
    addElement("p","box","green",lang['green']);
    addElement("p","box","yellow",lang['yellow']);
    addElement("p","box","orange",lang['orange']);
    addElement("p","box","red",lang['red']);
    addElement("p","box","blank",lang['blank']);
}
