
define(['aloha/core','jquery','aloha/command','util/dom2','util/maps','util/range','PubSub'],function(Aloha,jQuery,Command,Dom,Maps,RangeObject,PubSub){'use strict';var enabled=Aloha.settings.stateOverride!==false;var overrides=null;var overrideRange=null;function rangeObjectFromRange(range){return new RangeObject(range);}
function clear(){overrideRange=null;overrides=null;}
function keyPressHandler(event){if(!overrides){return;}
if(event.altKey||event.ctrlKey||!event.which){return;}
var selection=Aloha.getSelection();if(!selection.getRangeCount()){return;}
var text=String.fromCharCode(event.which);var range=selection.getRangeAt(0);Dom.insertSelectText(text,range);Maps.forEach(overrides,function(formatFn,command){formatFn(command,range);});Dom.collapseToEnd(range);selection.removeAllRanges();selection.addRange(range);event.preventDefault();}
function set(command,range,formatFn){if(!enabled){return;}
overrideRange=range;overrides=overrides||{};overrides[command]=formatFn;}
function setWithRangeObject(command,rangeObject,formatFn){if(!enabled){return;}
set(command,Dom.rangeFromRangeObject(rangeObject),function(command,range){var rangeObject=rangeObjectFromRange(range);formatFn(command,rangeObject);Dom.setRangeFromRef(range,rangeObject);});rangeObject.select();}
function enabledAccessor(trueFalse){if(null!=trueFalse){enabled=trueFalse;}
return enabled;}
Aloha.bind('aloha-selection-changed',function(event,range){if(overrideRange&&!Dom.areRangesEq(overrideRange,range)){clear();PubSub.pub('aloha.selection.context-change',{range:range,event:event});}});return{enabled:enabledAccessor,keyPressHandler:keyPressHandler,setWithRangeObject:setWithRangeObject,set:set,clear:clear};});