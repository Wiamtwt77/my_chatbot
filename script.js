const svg=document.getElementById("character"), stage=document.getElementById("stage");
const selectedName=document.getElementById("selectedName"), handle=document.getElementById("rotateHandle");
const pivots={head:[300,260],body:[300,350],leftArm:[240,285],rightArm:[360,285],leftLeg:[260,430],rightLeg:[340,430]};
const state={}; Object.keys(pivots).forEach(id=>state[id]={x:0,y:0,r:0});
let selected=null, mode=null, start=null;

function render(id){
 const [px,py]=pivots[id],s=state[id],el=document.getElementById(id);
 el.setAttribute("transform",`translate(${s.x} ${s.y}) rotate(${s.r} ${px} ${py})`);
}
function svgPoint(e){
 const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;
 return {x:(e.clientX-r.left)*vb.width/r.width,y:(e.clientY-r.top)*vb.height/r.height};
}
function select(id){
 if(selected)document.getElementById(selected).classList.remove("selected");
 selected=id;document.getElementById(id).classList.add("selected");
 selectedName.textContent=document.getElementById(id).dataset.label;
 positionHandle();
}
function positionHandle(){
 if(!selected){handle.hidden=true;return}
 const [x,y]=pivots[selected],s=state[selected],p=svg.createSVGPoint();p.x=x+s.x;p.y=y-70+s.y;
 const screen=p.matrixTransform(svg.getScreenCTM());
 const sr=stage.getBoundingClientRect();
 handle.style.left=(screen.x-sr.left-12)+"px";handle.style.top=(screen.y-sr.top-12)+"px";handle.hidden=false;
}
document.querySelectorAll(".part").forEach(el=>el.addEventListener("pointerdown",e=>{
 e.stopPropagation();select(el.id);mode="move";start={p:svgPoint(e),x:state[el.id].x,y:state[el.id].y};el.setPointerCapture?.(e.pointerId);
}));
handle.addEventListener("pointerdown",e=>{
 if(!selected)return;e.stopPropagation();mode="rotate";start={angle:angleTo(e),r:state[selected].r};handle.setPointerCapture?.(e.pointerId);
});
function angleTo(e){const p=svgPoint(e),[x,y]=pivots[selected],s=state[selected];return Math.atan2(p.y-(y+s.y),p.x-(x+s.x))*180/Math.PI}
window.addEventListener("pointermove",e=>{
 if(!selected||!mode)return;
 if(mode==="move"){const p=svgPoint(e);state[selected].x=start.x+p.x-start.p.x;state[selected].y=start.y+p.y-start.p.y}
 else state[selected].r=start.r+(angleTo(e)-start.angle);
 render(selected);positionHandle();
});
window.addEventListener("pointerup",()=>mode=null);
stage.addEventListener("pointerdown",()=>{if(selected){document.getElementById(selected).classList.remove("selected");selected=null;selectedName.textContent="No part selected";handle.hidden=true}});
document.querySelectorAll("[data-part]").forEach(b=>b.onclick=e=>{e.stopPropagation();select(b.dataset.part)});
document.querySelectorAll("[data-hair]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-hair]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");document.getElementById("hairUse").setAttribute("href","#"+b.dataset.hair)});
document.querySelectorAll("[data-shirt]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-shirt]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");document.querySelector("#body .shirt").classList.toggle("orange",b.dataset.shirt==="shirt2")});
document.getElementById("resetBtn").onclick=()=>{Object.keys(state).forEach(id=>{state[id]={x:0,y:0,r:0};render(id)});positionHandle()};
window.addEventListener("resize",positionHandle);
