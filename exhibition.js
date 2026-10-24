'use strict';
(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)'), fine = matchMedia('(hover:hover) and (pointer:fine) and (min-width:701px)');
if ('IntersectionObserver' in window && !reduced.matches) {
 const elements = $$('.reveal');
 const observer = new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting){e.target.classList.remove('pending');observer.unobserve(e.target);}}),{threshold:.06});
 elements.forEach(e=>{e.classList.add('pending');observer.observe(e);});
 document.documentElement.classList.add('motion-ready');
 reduced.addEventListener('change',()=>{if(reduced.matches){elements.forEach(e=>e.classList.remove('pending'));observer.disconnect();}});
}
const links=$$('.site-header nav a'), sections=links.map(a=>$(a.hash)); let scheduled=false;
function update(){const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,scrollY/max)):0})`;let active=-1;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.4)active=i;});links.forEach((a,i)=>i===active?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));scheduled=false;}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('load',schedule);if('ResizeObserver'in window)new ResizeObserver(schedule).observe(document.body);update();
const stage=$('.hero-stage');let frame=0;
function reset(){cancelAnimationFrame(frame);stage.style.setProperty('--mx','0px');stage.style.setProperty('--my','0px');}
stage.addEventListener('pointermove',e=>{if(reduced.matches||!fine.matches)return;const r=stage.getBoundingClientRect(),x=Math.max(-8,Math.min(8,((e.clientX-r.left)/r.width-.5)*16)),y=Math.max(-8,Math.min(8,((e.clientY-r.top)/r.height-.5)*16));cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{stage.style.setProperty('--mx',x+'px');stage.style.setProperty('--my',y+'px');});},{passive:true});stage.addEventListener('pointerleave',reset);reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
const places=[['亭边树影','ARCHITECTURE / 01','从树叶的间隙，看见一座亭子。','photo-1.webp','绿树与红花间的亭子'],['水面睡莲','WATER LILIES / 02','绿叶铺满水面，花朵停在其中。','photo-3.webp','绿叶间的两朵睡莲'],['柳影之间','EVERYDAY DETAIL / 03','把花与倒影，一起留在画面里。','photo-4.webp','睡莲、柳枝与倒影']];
$$('.map-pin').forEach(b=>b.addEventListener('click',()=>{const p=places[+b.dataset.place];$$('.map-pin').forEach(a=>a.setAttribute('aria-pressed',String(a===b)));$('#place-title').textContent=p[0];$('#place-kind').textContent=p[1];$('#place-description').textContent=p[2];const img=$('#place-image');img.hidden=false;img.src=p[3];img.alt=p[4];}));
const notify=$('#notify-button'),devices=$$('.device'),messages=['桌面任务已完成，正在转发到手机…','手机已收到通知，正在同步到手环…','手环提醒已到达。可以放心离开屏幕了。'];let playing=false;const timers=[];
function step(n){devices.forEach((d,i)=>{d.classList.toggle('active',i===n);d.classList.toggle('done',i<=n);d.querySelector('.device-status').textContent=i<=n?['已触发','已接收','已提醒'][i]:['等待触发','等待转发','等待同步'][i];});$('#notification-status').textContent=messages[n];}
function finish(){playing=false;notify.disabled=false;notify.textContent='再体验一次 ↗';}
notify.addEventListener('click',()=>{if(playing)return;timers.splice(0).forEach(clearTimeout);playing=true;notify.disabled=true;notify.textContent='正在传递提醒…';if(reduced.matches){step(2);finish();return;}step(0);timers.push(setTimeout(()=>step(1),650),setTimeout(()=>{step(2);finish();},1300));});
reduced.addEventListener('change',()=>{if(reduced.matches&&playing){timers.splice(0).forEach(clearTimeout);step(2);finish();}});
const tabs=$$('.swot-tabs [role=tab]');
function select(tab,focus=false){tabs.forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;$('#'+t.getAttribute('aria-controls')).hidden=!on;});if(focus)tab.focus();}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(t));t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();select(tabs[n],true);}});});
const dialog=$('#lightbox'),photos=$$('.photo-open'),titles=['树影中的亭子','水面与柳影','两朵睡莲','一朵花的倒影','绿叶之间'];let current=0,opener=null;
function show(n){current=(n+photos.length)%photos.length;const a=photos[current],img=$('#lightbox-image');img.hidden=false;$('#lightbox-error').hidden=true;img.alt=a.querySelector('img').alt;img.src=a.getAttribute('href');$('#lightbox-title').textContent=titles[current];$('#lightbox-count').textContent=`${String(current+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;}
photos.forEach((a,i)=>a.addEventListener('click',e=>{if(typeof dialog.showModal!=='function')return;e.preventDefault();opener=a;show(i);dialog.showModal();document.body.classList.add('modal-open');$('#lightbox-close').focus();}));
$('#lightbox-close').addEventListener('click',()=>dialog.close());$('#photo-prev').addEventListener('click',()=>show(current-1));$('#photo-next').addEventListener('click',()=>show(current+1));
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}if(e.key==='ArrowRight'){e.preventDefault();show(current+1);}if(e.key==='Tab'){const f=[...dialog.querySelectorAll('button,a[href]')],first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
$('#lightbox-image').addEventListener('error',()=>{$('#lightbox-image').hidden=true;$('#lightbox-error').hidden=false;});$('#lightbox-image').addEventListener('load',()=>{$('#lightbox-image').hidden=false;$('#lightbox-error').hidden=true;});
$$('img:not(#lightbox-image)').forEach(img=>{const fail=()=>{if(img.id==='place-image'){img.hidden=true;return;}const parent=img.closest('.photo-open,figure');if(!parent||parent.querySelector('.asset-error'))return;parent.classList.add('image-unavailable');const note=document.createElement('span');note.className='asset-error';note.textContent='图片暂时无法加载 · 请查看原帖或项目来源';parent.append(note);};img.addEventListener('error',fail);if(img.complete&&img.naturalWidth===0)fail();});
})();
