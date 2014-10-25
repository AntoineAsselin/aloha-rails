
define(['jquery','util/dom2','util/arrays','util/trees','util/strings','util/functions','util/html'],function($,Dom,Arrays,Trees,Strings,Fn,Html){'use strict';function walkSiblings(parent,beforeAfterChild,before,at,after,arg){var fn=before;Dom.walk(parent.firstChild,function(child){if(child!==beforeAfterChild){fn(child,arg);}else{fn=after;at(child,arg);}});}
function ascendWalkSiblings(ascendNodes,atEnd,carryDown,before,at,after,arg){var i;var args=[];i=ascendNodes.length;while(i--){arg=carryDown(ascendNodes[i],arg)||arg;args.push(arg);}
args.reverse();if(ascendNodes.length&&atEnd){Dom.walk(ascendNodes[0].firstChild,before,args[0]);}
for(i=0;i<ascendNodes.length-1;i++){var child=ascendNodes[i];var parent=ascendNodes[i+1];walkSiblings(parent,child,before,at,after,args[i+1]);}}
function makePointNodeStep(pointNode,atEnd,stepOutsideInside,stepPartial){return function(node,arg){if(node===pointNode&&!atEnd){stepOutsideInside(node,arg);}else{stepPartial(node,arg);}};}
function walkBoundary(liveRange,carryDown,stepOutside,stepPartial,stepInside,arg){var cac=liveRange.commonAncestorContainer;var sc=liveRange.startContainer;var ec=liveRange.endContainer;var so=liveRange.startOffset;var eo=liveRange.endOffset;var start=Dom.nodeAtOffset(sc,so);var end=Dom.nodeAtOffset(ec,eo);var startEnd=Dom.isAtEnd(sc,so);var endEnd=Dom.isAtEnd(ec,eo);var ascStart=Dom.childAndParentsUntilNode(start,cac);var ascEnd=Dom.childAndParentsUntilNode(end,cac);var stepAtStart=makePointNodeStep(start,startEnd,stepInside,stepPartial);var stepAtEnd=makePointNodeStep(end,endEnd,stepOutside,stepPartial);ascendWalkSiblings(ascStart,startEnd,carryDown,stepOutside,stepAtStart,stepInside,arg);ascendWalkSiblings(ascEnd,endEnd,carryDown,stepInside,stepAtEnd,stepOutside,arg);var cacChildStart=Arrays.last(ascStart);var cacChildEnd=Arrays.last(ascEnd);if(cacChildStart&&cacChildStart!==cacChildEnd){var next;Dom.walkUntilNode(cac.firstChild,stepOutside,cacChildStart,arg);next=cacChildStart.nextSibling;stepAtStart(cacChildStart,arg);Dom.walkUntilNode(next,stepInside,cacChildEnd,arg);if(cacChildEnd){next=cacChildEnd.nextSibling;stepAtEnd(cacChildEnd,arg);Dom.walk(next,stepOutside,arg);}}}
function pushDownContext(liveRange,pushDownFrom,cacOverride,getOverride,clearOverride,clearOverrideRec,pushDownOverride){var cac=liveRange.commonAncestorContainer;walkBoundary(liveRange,getOverride,pushDownOverride,clearOverride,clearOverrideRec,cacOverride);var fromCacToTop=Dom.childAndParentsUntilInclNode(cac,pushDownFrom);ascendWalkSiblings(fromCacToTop,false,getOverride,pushDownOverride,clearOverride,pushDownOverride,null);clearOverride(pushDownFrom);}
function mutate(liveRange,formatter,rootHasImpliedContext){if(liveRange.collapsed){return;}
var cac=liveRange.commonAncestorContainer;var topmostOverrideNode=null;var bottommostOverrideNode=null;var isNonClearableOverride=false;var upperBoundaryAndBeyond=false;var fromCacToContext=Dom.childAndParentsUntilIncl(cac,function(node){return!node.parentNode||9===node.parentNode.nodeType||formatter.hasContext(node);});Arrays.forEach(fromCacToContext,function(node){upperBoundaryAndBeyond=upperBoundaryAndBeyond||formatter.isUpperBoundary(node);if(null!=formatter.getOverride(node)){topmostOverrideNode=node;isNonClearableOverride=upperBoundaryAndBeyond;bottommostOverrideNode=bottommostOverrideNode||node;}});if((rootHasImpliedContext||formatter.hasContext(Arrays.last(fromCacToContext)))&&!isNonClearableOverride){var pushDownFrom=topmostOverrideNode||cac;var cacOverride=formatter.getOverride(bottommostOverrideNode||cac);var clearOverrideRec=formatter.clearOverrideRec||function(node){Dom.walkRec(node,formatter.clearOverride);};pushDownContext(liveRange,pushDownFrom,cacOverride,formatter.getOverride,formatter.clearOverride,clearOverrideRec,formatter.pushDownOverride);}else{var setContext=function(node){formatter.setContext(node,isNonClearableOverride);};walkBoundary(liveRange,formatter.getOverride,formatter.pushDownOverride,formatter.clearOverride,setContext);}}
function fixupRange(liveRange,mutate){var range=Dom.stableRange(liveRange);if(range.collapsed){return;}
Dom.splitTextContainers(range);Dom.trimRangeClosingOpening(range,Html.isIgnorableWhitespace);var leftPoint=Dom.cursorFromBoundaryPoint(range.startContainer,range.startOffset);var rightPoint=Dom.cursorFromBoundaryPoint(range.endContainer,range.endOffset);mutate(range,leftPoint,rightPoint);Dom.setRangeStartFromCursor(liveRange,leftPoint);Dom.setRangeEndFromCursor(liveRange,rightPoint);}
function adjustPointShallowRemove(point,left,node){if(point.node===node){point.next();}}
function adjustPointMoveBackWithinRange(point,left,node,ref,atEnd){if(point.node===node){if(!left){point.next();}}}
function adjustPointWrap(point,left,node,wrapper){if(point.node===node&&!point.atEnd){point.node=wrapper;}}
function removeShallowAdjust(node,leftPoint,rightPoint){adjustPointShallowRemove(leftPoint,true,node);adjustPointShallowRemove(rightPoint,false,node);Dom.removeShallow(node);}
function wrapAdjust(node,wrapper,leftPoint,rightPoint){if(wrapper.parentNode){removeShallowAdjust(wrapper,leftPoint,rightPoint);}
adjustPointWrap(leftPoint,true,node,wrapper);adjustPointWrap(rightPoint,false,node,wrapper);Dom.wrap(node,wrapper);}
function insertAdjust(node,ref,atEnd,leftPoint,rightPoint){adjustPointMoveBackWithinRange(leftPoint,true,node,ref,atEnd);adjustPointMoveBackWithinRange(rightPoint,false,node,ref,atEnd);Dom.insert(node,ref,atEnd);}
function restackRec(node,hasContext,notIgnoreHorizontal,notIgnoreVertical){if(1!==node.nodeType||notIgnoreVertical(node)){return null;}
var maybeContext=Dom.next(node.firstChild,notIgnoreHorizontal);if(!maybeContext){return null;}
var notIgnorable=Dom.next(maybeContext.nextSibling,notIgnoreHorizontal);if(notIgnorable){return null;}
if(hasContext(maybeContext)){return maybeContext;}
return restackRec(maybeContext,hasContext,notIgnoreHorizontal,notIgnoreVertical);}
function restack(node,hasContext,ignoreHorizontal,ignoreVertical,leftPoint,rightPoint){var notIgnoreHorizontal=function(node){return hasContext(node)||!ignoreHorizontal(node);};var notIgnoreVertical=Fn.complement(ignoreVertical);if(hasContext(node)){return true;}
var context=restackRec(node,hasContext,notIgnoreHorizontal,notIgnoreVertical);if(!context){return false;}
wrapAdjust(node,context,leftPoint,rightPoint);return true;}
function ensureWrapper(node,nodeName,hasWrapper,leftPoint,rightPoint){if(node.previousSibling&&!hasWrapper(node.previousSibling)){restack(node.previousSibling,hasWrapper,Html.isIgnorableWhitespace,Html.isInlineFormattable,leftPoint,rightPoint);}
if(node.previousSibling&&hasWrapper(node.previousSibling)){insertAdjust(node,node.previousSibling,true,leftPoint,rightPoint);return true;}
if(!hasWrapper(node)){var wrapper=document.createElement(nodeName);wrapAdjust(node,wrapper,leftPoint,rightPoint);return true;}
return false;}
function isUpperBoundary_default(node){return'BODY'===node.nodeName||Html.isEditingHost(node);}
function makeNodeFormatter(nodeName,leftPoint,rightPoint){function hasContext(node){return nodeName===node.nodeName;}
function clearContext(node){if(nodeName===node.nodeName){removeShallowAdjust(node,leftPoint,rightPoint);}}
function clearContextRec(node){Dom.walkRec(node,clearContext);}
function setContext(node){if(ensureWrapper(node,nodeName,hasContext,leftPoint,rightPoint)){clearContextRec(node);}else{Dom.walk(node.firstChild,clearContextRec);}}
return{hasContext:hasContext,getOverride:Fn.noop,clearOverride:Fn.noop,pushDownOverride:Fn.noop,setContext:setContext,isUpperBoundary:isUpperBoundary_default};}
function makeNodeUnformatter(nodeName,leftPoint,rightPoint){function getOverride(node){return nodeName===node.nodeName?true:null;}
function clearOverride(node){if(nodeName===node.nodeName){removeShallowAdjust(node,leftPoint,rightPoint);}}
function pushDownOverride(node,override){if(!override){return;}
ensureWrapper(node,nodeName,getOverride,leftPoint,rightPoint);}
return{hasContext:Fn.returnFalse,setContext:Fn.noop,getOverride:getOverride,clearOverride:clearOverride,pushDownOverride:pushDownOverride,isUpperBoundary:isUpperBoundary_default};}
function createStyleWrapper_default(){return document.createElement('SPAN');}
function isStyleEq_default(styleValueA,styleValueB){return styleValueA===styleValueB;}
function isStyleWrapperReusable_default(node){return'SPAN'===node.nodeName;}
function isStyleWrapperPrunable_default(node){return('SPAN'===node.nodeName&&Arrays.every(Arrays.map(Dom.attrs(node),Arrays.second),Strings.empty));}
function makeStyleFormatter(styleName,styleValue,createWrapper,isStyleEq,isReusable,isPrunable,leftPoint,rightPoint){function removeStyle(node,styleName){if(Strings.empty(Dom.getStyle(node,styleName))){return;}
Dom.setStyle(node,styleName,null);if(isPrunable(node)){removeShallowAdjust(node,leftPoint,rightPoint);}}
function setStyle(node,styleName,styleValue,prevWrapper){if(prevWrapper&&prevWrapper===node.previousSibling){insertAdjust(node,prevWrapper,true,leftPoint,rightPoint);removeStyle(node,styleName);return prevWrapper;}
if(isReusable(node)){Dom.setStyle(node,styleName,styleValue);return prevWrapper;}
var wrapper=createWrapper();Dom.setStyle(wrapper,styleName,styleValue);wrapAdjust(node,wrapper,leftPoint,rightPoint);removeStyle(node,styleName);return wrapper;}
function hasContext(node){return isStyleEq(Dom.getStyle(node,styleName),styleValue);}
function getOverride(node){var override=Dom.getStyle(node,styleName);return(Strings.empty(override)||isStyleEq(override,styleValue)?null:override);}
function clearOverride(node){removeStyle(node,styleName);}
function clearOverrideRec(node){Dom.walkRec(node,clearOverride);}
var overrideWrapper=null;function pushDownOverride(node,override){if(Strings.empty(override)||!Strings.empty(Dom.getStyle(node,styleName))){return;}
overrideWrapper=setStyle(node,styleName,override,overrideWrapper);}
var contextWrapper=null;function setContext(node){Dom.walk(node.firstChild,clearOverrideRec);contextWrapper=setStyle(node,styleName,styleValue,contextWrapper);}
return{hasContext:hasContext,getOverride:getOverride,clearOverride:clearOverride,pushDownOverride:pushDownOverride,setContext:setContext,isUpperBoundary:isUpperBoundary_default};}
function format(liveRange,nodeName){fixupRange(liveRange,function(range,leftPoint,rightPoint){mutate(range,makeNodeFormatter(nodeName,leftPoint,rightPoint));});}
function unformat(liveRange,nodeName){fixupRange(liveRange,function(range,leftPoint,rightPoint){mutate(range,makeNodeUnformatter(nodeName,leftPoint,rightPoint),true);});}
function findReusableAncestor(range,hasContext,getOverride,isUpperBoundary,isReusable){var obstruction=null;function untilIncl(node){return(null!=getOverride(node)||hasContext(node)||isReusable(node)||isUpperBoundary(node));}
function beforeAfter(node){obstruction=obstruction||!Html.isIgnorableWhitespace(node);}
var start=Dom.nodeAtOffset(range.startContainer,range.startOffset);var end=Dom.nodeAtOffset(range.endContainer,range.endOffset);var startEnd=Dom.isAtEnd(range.startContainer,range.startOffset);var endEnd=Dom.isAtEnd(range.endContainer,range.endOffset);var ascStart=Dom.childAndParentsUntilIncl(start,untilIncl);var ascEnd=Dom.childAndParentsUntilIncl(end,untilIncl);var reusable=Arrays.last(ascStart);function at(node){if(node===start&&!startEnd){return;}
if(node===end&&!endEnd){beforeAfter(node);return;}
obstruction=obstruction||!Html.isInlineFormattable(node);}
if(!reusable||!isReusable(reusable)||reusable!==Arrays.last(ascEnd)){return null;}
ascendWalkSiblings(ascStart,startEnd,Fn.noop,beforeAfter,at,Fn.noop);if(obstruction){return null;}
ascendWalkSiblings(ascEnd,endEnd,Fn.noop,Fn.noop,at,beforeAfter);if(obstruction){return null;}
return reusable;}
function formatStyle(liveRange,styleName,styleValue,createWrapper,isStyleEq,isReusable,isPrunable){createWrapper=createWrapper||createStyleWrapper_default;isStyleEq=isStyleEq||isStyleEq_default;isReusable=isReusable||isStyleWrapperReusable_default;isPrunable=isPrunable||isStyleWrapperPrunable_default;fixupRange(liveRange,function(range,leftPoint,rightPoint){var formatter=makeStyleFormatter(styleName,styleValue,createWrapper,isStyleEq,isReusable,isPrunable,leftPoint,rightPoint);var reusableAncestor=findReusableAncestor(range,formatter.hasContext,formatter.getOverride,formatter.isUpperBoundary,isReusable);if(reusableAncestor){formatter.setContext(reusableAncestor);}else{mutate(range,formatter,false);}});}
function splitBoundary(liveRange,pred,clone){clone=clone||Dom.cloneShallow;fixupRange(liveRange,function(range,leftPoint,rightPoint){var wrapper=null;function carryDown(elem,stop){return stop||!pred(elem);}
function pushDown(node,stop){if(stop){return;}
if(!wrapper||node.parentNode.previousSibling!==wrapper){wrapper=clone(node.parentNode);insertAdjust(wrapper,node.parentNode,false,leftPoint,rightPoint);}
insertAdjust(node,wrapper,true,leftPoint,rightPoint);}
var sc=range.startContainer;var so=range.startOffset;var ec=range.endContainer;var eo=range.endOffset;var cac=range.commonAncestorContainer;var startEnd=Dom.isAtEnd(sc,so);var endEnd=Dom.isAtEnd(ec,eo);var ascStart=Dom.childAndParentsUntilNode(Dom.nodeAtOffset(sc,so),cac);var ascEnd=Dom.childAndParentsUntilNode(Dom.nodeAtOffset(ec,eo),cac);ascendWalkSiblings(ascStart,startEnd,carryDown,pushDown,Fn.noop,Fn.noop,null);ascendWalkSiblings(ascEnd,endEnd,carryDown,pushDown,Fn.noop,Fn.noop,null);});}
return{format:format,unformat:unformat,formatStyle:formatStyle,splitBoundary:splitBoundary};});