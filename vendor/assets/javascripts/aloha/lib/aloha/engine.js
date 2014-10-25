
define(['aloha/core','aloha/ecma5shims','util/maps','util/html','jquery'],function(Aloha,$_,Maps,Html,jQuery){"use strict";function hasAttribute(obj,attr){var native_method=obj.hasAttribute;if(native_method){return obj.hasAttribute(attr);}
return(typeof obj.attributes[attr]!="undefined");}
var htmlNamespace="http://www.w3.org/1999/xhtml";var cssStylingFlag=false;var globalRange=null;var commands={};function isHtmlNamespace(ns){return ns===null||!ns||ns===htmlNamespace;}
function isHtmlElement_obsolete(node,tags){if(typeof tags=="string"){tags=[tags];}
if(typeof tags=="object"){tags=$_(tags).map(function(tag){return tag.toUpperCase();});}
return node&&node.nodeType==1&&isHtmlNamespace(node.namespaceURI)&&(typeof tags=="undefined"||$_(tags).indexOf(node.tagName)!=-1);}
function isAnyHtmlElement(node){return node&&node.nodeType==1&&isHtmlNamespace(node.namespaceURI);}
function isNamedHtmlElement(node,name){return node&&node.nodeType==1&&isHtmlNamespace(node.namespaceURI)&&name.toUpperCase()===node.nodeName;}
function arrayContainsInsensitive(array,str){var i,len;str=str.toUpperCase();for(i=0,len=array.length;i<len;i++){if(array[i].toUpperCase()===str){return true;}}
return false;}
function isHtmlElementInArray(node,array){return node&&node.nodeType==1&&isHtmlNamespace(node.namespaceURI)&&arrayContainsInsensitive(array,node.nodeName);}
function isMappedHtmlElement(node,map){return node&&node.nodeType==1&&isHtmlNamespace(node.namespaceURI)&&map[node.nodeName];}
function getStyleLength(node){var s;var styleLength=0;if(!node){return 0;}
if(!node.style){return 0;}
if(typeof node.style.length!=='undefined'){return node.style.length;}
for(s in node.style){if(node.style[s]&&node.style[s]!==0&&node.style[s]!=='false'){styleLength++;}}
return styleLength;}
function toArray(obj){if(!obj){return null;}
var array=[],i,l=obj.length;i=l>>>0;while(i--){array[i]=obj[i];}
return array;}
function nextNodeDescendants(node){while(node&&!node.nextSibling){node=node.parentNode;}
if(!node){return null;}
return node.nextSibling;}
function nextNode(node){if(node.hasChildNodes()){return node.firstChild;}
return nextNodeDescendants(node);}
function previousNode(node){if(node.previousSibling){node=node.previousSibling;while(node.hasChildNodes()){node=node.lastChild;}
return node;}
if(node.parentNode&&node.parentNode.nodeType==$_.Node.ELEMENT_NODE){return node.parentNode;}
return null;}
function isAncestor(ancestor,descendant){return ancestor&&descendant&&Boolean($_.compareDocumentPosition(ancestor,descendant)&$_.Node.DOCUMENT_POSITION_CONTAINED_BY);}
function isAncestorContainer(ancestor,descendant){return(ancestor||descendant)&&(ancestor==descendant||isAncestor(ancestor,descendant));}
function isDescendant(descendant,ancestor){return ancestor&&descendant&&Boolean($_.compareDocumentPosition(ancestor,descendant)&$_.Node.DOCUMENT_POSITION_CONTAINED_BY);}
function isBefore(node1,node2){return Boolean($_.compareDocumentPosition(node1,node2)&$_.Node.DOCUMENT_POSITION_FOLLOWING);}
function isAfter(node1,node2){return Boolean($_.compareDocumentPosition(node1,node2)&$_.Node.DOCUMENT_POSITION_PRECEDING);}
function getAncestors(node){var ancestors=[];while(node.parentNode){ancestors.unshift(node.parentNode);node=node.parentNode;}
return ancestors;}
function getDescendants(node){var descendants=[];var stop=nextNodeDescendants(node);while(null!=(node=nextNode(node))&&node!=stop){descendants.push(node);}
return descendants;}
function convertProperty(property){var map={"fontFamily":"font-family","fontSize":"font-size","fontStyle":"font-style","fontWeight":"font-weight","textDecoration":"text-decoration"};if(typeof map[property]!="undefined"){return map[property];}
return property;}
function cssSizeToLegacy(cssVal){return{"xx-small":1,"small":2,"medium":3,"large":4,"x-large":5,"xx-large":6,"xxx-large":7}[cssVal];}
function legacySizeToCss(legacyVal){return{1:"xx-small",2:"small",3:"medium",4:"large",5:"x-large",6:"xx-large",7:"xxx-large"}[legacyVal];}
function getDirectionality(element){if(element.dir=="ltr"){return"ltr";}
if(element.dir=="rtl"){return"rtl";}
if(!isAnyHtmlElement(element.parentNode)){return"ltr";}
return getDirectionality(element.parentNode);}
function getNodeIndex(node){var ret=0;while(node.previousSibling){ret++;node=node.previousSibling;}
return ret;}
function getNodeLength(node){switch(node.nodeType){case $_.Node.PROCESSING_INSTRUCTION_NODE:case $_.Node.DOCUMENT_TYPE_NODE:return 0;case $_.Node.TEXT_NODE:case $_.Node.COMMENT_NODE:return node.length;default:return node.childNodes.length;}}
function getPosition(nodeA,offsetA,nodeB,offsetB){if(nodeA==nodeB){if(offsetA==offsetB){return"equal";}
if(offsetA<offsetB){return"before";}
if(offsetA>offsetB){return"after";}}
var documentPosition=$_.compareDocumentPosition(nodeB,nodeA);if(documentPosition&$_.Node.DOCUMENT_POSITION_FOLLOWING){var pos=getPosition(nodeB,offsetB,nodeA,offsetA);if(pos=="before"){return"after";}
if(pos=="after"){return"before";}}
if(documentPosition&$_.Node.DOCUMENT_POSITION_CONTAINS){var child=nodeB;while(child.parentNode!=nodeA){child=child.parentNode;}
if(getNodeIndex(child)<offsetA){return"after";}}
return"before";}
function getFurthestAncestor(node){var root=node;while(root.parentNode!=null){root=root.parentNode;}
return root;}
function isContained(node,range){var pos1=getPosition(node,0,range.startContainer,range.startOffset);if(pos1!=="after"){return false;}
var pos2=getPosition(node,getNodeLength(node),range.endContainer,range.endOffset);if(pos2!=="before"){return false;}
return getFurthestAncestor(node)==getFurthestAncestor(range.startContainer);}
function getContainedNodes(range,condition){if(typeof condition=="undefined"){condition=function(){return true;};}
var node=range.startContainer;if(node.hasChildNodes()&&range.startOffset<node.childNodes.length){node=node.childNodes[range.startOffset];}else if(range.startOffset==getNodeLength(node)){node=nextNodeDescendants(node);}else{node=nextNode(node);}
var stop=range.endContainer;if(stop.hasChildNodes()&&range.endOffset<stop.childNodes.length){stop=stop.childNodes[range.endOffset];}else{stop=nextNodeDescendants(stop);}
var nodeList=[];while(isBefore(node,stop)){if(isContained(node,range)&&condition(node)){nodeList.push(node);node=nextNodeDescendants(node);continue;}
node=nextNode(node);}
return nodeList;}
function getAllContainedNodes(range,condition){if(typeof condition=="undefined"){condition=function(){return true;};}
var node=range.startContainer;if(node.hasChildNodes()&&range.startOffset<node.childNodes.length){node=node.childNodes[range.startOffset];}else if(range.startOffset==getNodeLength(node)){node=nextNodeDescendants(node);}else{node=nextNode(node);}
var stop=range.endContainer;if(stop.hasChildNodes()&&range.endOffset<stop.childNodes.length){stop=stop.childNodes[range.endOffset];}else{stop=nextNodeDescendants(stop);}
var nodeList=[];while(isBefore(node,stop)){if(isContained(node,range)&&condition(node)){nodeList.push(node);}
node=nextNode(node);}
return nodeList;}
function normalizeColor(color){if(color.toLowerCase()=="currentcolor"){return null;}
var outerSpan=document.createElement("span");document.body.appendChild(outerSpan);outerSpan.style.color="black";var innerSpan=document.createElement("span");outerSpan.appendChild(innerSpan);innerSpan.style.color=color;color=$_.getComputedStyle(innerSpan).color;if(color=="rgb(0, 0, 0)"){outerSpan.color="white";color=$_.getComputedStyle(innerSpan).color;if(color!="rgb(0, 0, 0)"){return null;}}
document.body.removeChild(outerSpan);if(/^rgba\([0-9]+, [0-9]+, [0-9]+, 1\)$/.test(color)){return color.replace("rgba","rgb").replace(", 1)",")");}
if(color=="transparent"){return"rgba(0, 0, 0, 0)";}
return color;}
function parseSimpleColor(color){color=color.toLowerCase();if($_(["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkgrey","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","green","greenyellow","grey","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightgrey","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"]).indexOf(color)!=-1){return color;}
color=normalizeColor(color);var matches=/^rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)$/.exec(color);if(matches){return"#"+parseInt(matches[1],10).toString(16).replace(/^.$/,"0$&")+parseInt(matches[2],10).toString(16).replace(/^.$/,"0$&")+parseInt(matches[3],10).toString(16).replace(/^.$/,"0$&");}else if(/^#[abcdef0123456789]+$/i.exec(color)){return color;}
return null;}
var getStateOverride,setStateOverride,resetOverrides,unsetStateOverride,getValueOverride,setValueOverride,unsetValueOverride;var executionStackDepth=0;function normalizeFontSize(value){value=$_(value).trim();if(/^[\-+]?[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?$/.test(value)){var mode;if(value[0]=="+"){value=value.slice(1);mode="relative-plus";}else if(value[0]=="-"){value=value.slice(1);mode="relative-minus";}else{mode="absolute";}
var num=parseInt(value,10);if(mode=="relative-plus"){num+=3;}
if(mode=="relative-minus"){num=3-num;}
if(num<1){num=1;}
if(num>7){num=7;}
value={1:"xx-small",2:"small",3:"medium",4:"large",5:"x-large",6:"xx-large",7:"xxx-large"}[num];}
return value;}
function getLegacyFontSize(size){size=normalizeFontSize(size);if(jQuery.inArray(size,["xx-small","x-small","small","medium","large","x-large","xx-large","xxx-large"])==-1&&!/^[0-9]+(\.[0-9]+)?(cm|mm|in|pt|pc|px)$/.test(size)){return null;}
var font=document.createElement("font");document.body.appendChild(font);if(size=="xxx-large"){font.size=7;}else{font.style.fontSize=size;}
var pixelSize=parseInt($_.getComputedStyle(font).fontSize,10);document.body.removeChild(font);var returnedSize=1;while(returnedSize<7){font=document.createElement("font");font.size=returnedSize;document.body.appendChild(font);var lowerBound=parseInt($_.getComputedStyle(font).fontSize,10);font.size=1+returnedSize;var upperBound=parseInt($_.getComputedStyle(font).fontSize,10);document.body.removeChild(font);var average=(upperBound+lowerBound)/2;if(pixelSize<average){return String(returnedSize);}
returnedSize++;}
return"7";}
function editCommandMethod(command,prop,range,callback){var ret;if(executionStackDepth==0&&typeof range!="undefined"){globalRange=range;}else if(executionStackDepth==0){globalRange=null;globalRange=range;}
executionStackDepth++;try{ret=callback();}catch(e){executionStackDepth--;throw e;}
executionStackDepth--;return ret;}
function myQueryCommandEnabled(command,range){command=command.toLowerCase();return editCommandMethod(command,"action",range,(function(command){return function(){return jQuery.inArray(command,["copy","cut","paste","selectall","stylewithcss","usecss"])!=-1||range!==null;};}(command)));}
function setActiveRange(range){var rangeObject=new window.GENTICS.Utils.RangeObject();rangeObject.startContainer=range.startContainer;rangeObject.startOffset=range.startOffset;rangeObject.endContainer=range.endContainer;rangeObject.endOffset=range.endOffset;rangeObject.select();}
function myExecCommand(commandArg,showUiArg,valueArg,range){var command=commandArg.toLowerCase();var showUi=showUiArg;var value=valueArg;if(arguments.length==1||(arguments.length>=4&&typeof showUi=="undefined")){showUi=false;}
if(arguments.length<=2||(arguments.length>=4&&typeof value=="undefined")){value="";}
return editCommandMethod(command,"action",range,(function(command,showUi,value){return function(){if(!myQueryCommandEnabled(command)){return false;}
commands[command].action(value,range);setActiveRange(range);return true;};}(command,showUi,value)));}
function myQueryCommandIndeterm(command,range){command=command.toLowerCase();return editCommandMethod(command,"indeterm",range,(function(command){return function(){if(!myQueryCommandEnabled(command,range)){return false;}
return commands[command].indeterm(range);};}(command)));}
function myQueryCommandState(command,range){command=command.toLowerCase();return editCommandMethod(command,"state",range,(function(command){return function(){if(!myQueryCommandEnabled(command,range)){return false;}
if(typeof getStateOverride(command,range)!="undefined"){return getStateOverride(command,range);}
return commands[command].state(range);};}(command)));}
function myQueryCommandSupported(command){command=command.toLowerCase();return commands.hasOwnProperty(command);}
function myQueryCommandValue(command,range){command=command.toLowerCase();return editCommandMethod(command,"value",range,function(){if(!commands.hasOwnProperty(command)||!commands[command].hasOwnProperty("value")){return"";}
if(command=="fontsize"&&getValueOverride("fontsize",range)!==undefined){return getLegacyFontSize(getValueOverride("fontsize",range));}
if(typeof getValueOverride(command,range)!="undefined"){return getValueOverride(command,range);}
return commands[command].value(range);});}
var prohibitedParagraphChildNamesMap={"ADDRESS":true,"ARTICLE":true,"ASIDE":true,"BLOCKQUOTE":true,"CAPTION":true,"CENTER":true,"COL":true,"COLGROUP":true,"DD":true,"DETAILS":true,"DIR":true,"DIV":true,"DL":true,"DT":true,"FIELDSET":true,"FIGCAPTION":true,"FIGURE":true,"FOOTER":true,"FORM":true,"H1":true,"H2":true,"H3":true,"H4":true,"H5":true,"H6":true,"HEADER":true,"HGROUP":true,"HR":true,"LI":true,"LISTING":true,"MENU":true,"NAV":true,"OL":true,"P":true,"PLAINTEXT":true,"PRE":true,"SECTION":true,"SUMMARY":true,"TABLE":true,"TBODY":true,"TD":true,"TFOOT":true,"TH":true,"THEAD":true,"TR":true,"UL":true,"XMP":true};function isProhibitedParagraphChild(node){return isMappedHtmlElement(node,prohibitedParagraphChildNamesMap);}
var nonBlockDisplayValuesMap={"inline":true,"inline-block":true,"inline-table":true,"none":true};function isBlockNode(node){return node&&((node.nodeType==$_.Node.ELEMENT_NODE&&!nonBlockDisplayValuesMap[$_.getComputedStyle(node).display])||node.nodeType==$_.Node.DOCUMENT_NODE||node.nodeType==$_.Node.DOCUMENT_FRAGMENT_NODE);}
function isInlineNode(node){return node&&!isBlockNode(node);}
function isEditingHost(node){return node&&node.nodeType==$_.Node.ELEMENT_NODE&&(node.contentEditable=="true"||(node.parentNode&&node.parentNode.nodeType==$_.Node.DOCUMENT_NODE&&node.parentNode.designMode=="on"));}
function isEditable(node){return node&&!isEditingHost(node)&&(node.nodeType!=$_.Node.ELEMENT_NODE||node.contentEditable!="false"||jQuery(node).hasClass('aloha-table-wrapper'))&&(isEditingHost(node.parentNode)||isEditable(node.parentNode));}
function hasEditableDescendants(node){var i;for(i=0;i<node.childNodes.length;i++){if(isEditable(node.childNodes[i])||hasEditableDescendants(node.childNodes[i])){return true;}}
return false;}
function getEditingHostOf(node){if(isEditingHost(node)){return node;}
if(isEditable(node)){var ancestor=node.parentNode;while(!isEditingHost(ancestor)){ancestor=ancestor.parentNode;}
return ancestor;}
return null;}
function inSameEditingHost(node1,node2){return getEditingHostOf(node1)&&getEditingHostOf(node1)==getEditingHostOf(node2);}
function isCollapsedLineBreak(br){if(!isNamedHtmlElement(br,'br')){return false;}
var ref=br.parentNode;while($_.getComputedStyle(ref).display=="inline"){ref=ref.parentNode;}
var origStyle={height:ref.style.height,maxHeight:ref.style.maxHeight,minHeight:ref.style.minHeight};ref.style.height='auto';ref.style.maxHeight='none';if(!(jQuery.browser.msie&&jQuery.browser.version<8)){ref.style.minHeight='0';}
var space=document.createTextNode('\u200b');var origHeight=ref.offsetHeight;if(origHeight==0){throw'isCollapsedLineBreak: original height is zero, bug?';}
br.parentNode.insertBefore(space,br.nextSibling);var finalHeight=ref.offsetHeight;space.parentNode.removeChild(space);ref.style.height=origStyle.height;ref.style.maxHeight=origStyle.maxHeight;if(!(jQuery.browser.msie&&jQuery.browser.version<8)){ref.style.minHeight=origStyle.minHeight;}
return origHeight<finalHeight-5;}
function isExtraneousLineBreak(br){if(!isNamedHtmlElement(br,'br')){return false;}
if(isNamedHtmlElement(br.parentNode,"li")&&br.parentNode.childNodes.length==1){return false;}
var ref=br.parentNode;while($_.getComputedStyle(ref).display=="inline"){ref=ref.parentNode;}
var origStyle={height:ref.style.height,maxHeight:ref.style.maxHeight,minHeight:ref.style.minHeight,contentEditable:ref.contentEditable};ref.style.height='auto';ref.style.maxHeight='none';ref.style.minHeight='0';if(jQuery.browser.msie&&jQuery.browser.version<=7){ref.contentEditable='false';}
var origHeight=ref.offsetHeight;if(origHeight==0){throw"isExtraneousLineBreak: original height is zero, bug?";}
var origBrDisplay=br.style.display;br.style.display='none';var finalHeight=ref.offsetHeight;ref.style.height=origStyle.height;ref.style.maxHeight=origStyle.maxHeight;ref.style.minHeight=origStyle.minHeight;if(jQuery.browser.msie&&jQuery.browser.version<=7){ref.contentEditable=origStyle.contentEditable;}
br.style.display=origBrDisplay;return origHeight==finalHeight;}
function isWhitespaceNode(node){return node&&node.nodeType==$_.Node.TEXT_NODE&&(node.data==""||(/^[\t\n\r ]+$/.test(node.data)&&node.parentNode&&node.parentNode.nodeType==$_.Node.ELEMENT_NODE&&jQuery.inArray($_.getComputedStyle(node.parentNode).whiteSpace,["normal","nowrap"])!=-1)||(/^[\t\r ]+$/.test(node.data)&&node.parentNode&&node.parentNode.nodeType==$_.Node.ELEMENT_NODE&&$_.getComputedStyle(node.parentNode).whiteSpace=="pre-line")||(/^[\t\n\r ]+$/.test(node.data)&&node.parentNode&&node.parentNode.nodeType==$_.Node.DOCUMENT_FRAGMENT_NODE));}
function collapseWhitespace(node,range){if(!isEditable(node)&&!isEditingHost(node)){return;}
if(!node||node.nodeType!==$_.Node.TEXT_NODE){return;}
if(jQuery.inArray($_.getComputedStyle(node.parentNode).whiteSpace,["pre","pre-wrap"])!=-1){return;}
if(!/[\t\n\r ]{2,}/.test(node.data)){return;}
var newData='';var correctStart=range.startContainer==node;var correctEnd=range.endContainer==node;var wsFound=false;var i;for(i=0;i<node.data.length;++i){if(/[\t\n\r ]/.test(node.data.substr(i,1))){if(!wsFound){newData+=' ';wsFound=true;}else{if(correctStart&&newData.length<range.startOffset){range.startOffset--;}
if(correctEnd&&newData.length<range.endOffset){range.endOffset--;}}}else{newData+=node.data.substr(i,1);wsFound=false;}}
node.data=newData;}
function isCollapsedWhitespaceNode(node){if(!isWhitespaceNode(node)){return false;}
if(node.data==""){return true;}
var ancestor=node.parentNode;if(!ancestor){return true;}
if($_(getAncestors(node)).some(function(ancestor){return ancestor.nodeType==$_.Node.ELEMENT_NODE&&$_.getComputedStyle(ancestor).display=="none";})){return true;}
while(!isBlockNode(ancestor)&&ancestor.parentNode){ancestor=ancestor.parentNode;}
var reference=node;while(reference!=ancestor){reference=previousNode(reference);if(isBlockNode(reference)||isNamedHtmlElement(reference,'br')){return true;}
if((reference.nodeType==$_.Node.TEXT_NODE&&!isWhitespaceNode(reference))||isNamedHtmlElement(reference,'img')){break;}}
reference=node;var stop=nextNodeDescendants(ancestor);while(reference!=stop){reference=nextNode(reference);if(isBlockNode(reference)||isNamedHtmlElement(reference,'br')){return true;}
if((reference&&reference.nodeType==$_.Node.TEXT_NODE&&!isWhitespaceNode(reference))||isNamedHtmlElement(reference,'img')){break;}}
return false;}
function isVisible(node){var i;if(!node){return false;}
if($_(getAncestors(node).concat(node)).filter(function(node){return node.nodeType==$_.Node.ELEMENT_NODE;},true).some(function(node){return $_.getComputedStyle(node).display=="none";})){return false;}
if(isBlockNode(node)||(node.nodeType==$_.Node.TEXT_NODE&&!isCollapsedWhitespaceNode(node))||isNamedHtmlElement(node,'img')||(isNamedHtmlElement(node,'br')&&!isExtraneousLineBreak(node))){return true;}
for(i=0;i<node.childNodes.length;i++){if(isVisible(node.childNodes[i])){return true;}}
return false;}
function isInvisible(node){return node&&!isVisible(node);}
function isCollapsedBlockProp(node){var i;if(isCollapsedLineBreak(node)&&!isExtraneousLineBreak(node)){return true;}
if(!isInlineNode(node)||node.nodeType!=$_.Node.ELEMENT_NODE){return false;}
var hasCollapsedBlockPropChild=false;for(i=0;i<node.childNodes.length;i++){if(!isInvisible(node.childNodes[i])&&!isCollapsedBlockProp(node.childNodes[i])){return false;}
if(isCollapsedBlockProp(node.childNodes[i])){hasCollapsedBlockPropChild=true;}}
return hasCollapsedBlockPropChild;}
function isInvisibleTextNode(node){if(node&&node.nodeType!==$_.Node.TEXT_NODE){return false;}
var offset=0;var data=node.data;var len=data.length;while(offset<len&&data.charAt(offset)==='\u200b'){offset++;}
return offset===len;}
function isNotInvisibleTextNode(node){return!isInvisibleTextNode(node);}
function isProppedBlock(node){if(!Html.isBlock(node)){return false;}
var child=Html.findNodeRight(node.lastChild,isVisible);return(child&&'br'===child.nodeName.toLowerCase()&&!Html.findNodeRight(child.previousSibling,isVisible));}
function isEmptyNode(node){return(!node.hasChildNodes()||isProppedBlock(node)||!Html.findNodeRight(node.lastChild,isNotInvisibleTextNode));}
function isEmptyOnlyChildOfEditingHost(node){return(node&&isEmptyNode(node)&&isEditingHost(node.parentNode)&&!node.previousSibling&&!node.nextSibling);}
function removeNode(node){var ancestor=node.parentNode;var offset=getNodeIndex(node);ancestor.removeChild(node);return{node:ancestor,offset:offset};}
function getActiveRange(){var ret;if(globalRange){ret=globalRange;}else if(Aloha.getSelection().rangeCount){ret=Aloha.getSelection().getRangeAt(0);}else{return null;}
if(jQuery.inArray(ret.startContainer.nodeType,[$_.Node.TEXT_NODE,$_.Node.ELEMENT_NODE])==-1||jQuery.inArray(ret.endContainer.nodeType,[$_.Node.TEXT_NODE,$_.Node.ELEMENT_NODE])==-1||!ret.startContainer.ownerDocument||!ret.endContainer.ownerDocument||!isDescendant(ret.startContainer,ret.startContainer.ownerDocument)||!isDescendant(ret.endContainer,ret.endContainer.ownerDocument)){throw"Invalid active range; test bug?";}
return ret;}
(function(){var stateOverrides={};var valueOverrides={};var storedRange=null;resetOverrides=function(range){if(!storedRange||storedRange.startContainer!=range.startContainer||storedRange.endContainer!=range.endContainer||storedRange.startOffset!=range.startOffset||storedRange.endOffset!=range.endOffset){storedRange={startContainer:range.startContainer,endContainer:range.endContainer,startOffset:range.startOffset,endOffset:range.endOffset};if(!Maps.isEmpty(stateOverrides)||!Maps.isEmpty(valueOverrides)){stateOverrides={};valueOverrides={};return true;}}
return false;};getStateOverride=function(command,range){resetOverrides(range);return stateOverrides[command];};setStateOverride=function(command,newState,range){resetOverrides(range);stateOverrides[command]=newState;};unsetStateOverride=function(command,range){resetOverrides(range);delete stateOverrides[command];};getValueOverride=function(command,range){resetOverrides(range);return valueOverrides[command];};setValueOverride=function(command,newValue,range){resetOverrides(range);valueOverrides[command]=newValue;if(command=="backcolor"){valueOverrides.hilitecolor=newValue;}else if(command=="hilitecolor"){valueOverrides.backcolor=newValue;}};unsetValueOverride=function(command,range){resetOverrides(range);delete valueOverrides[command];if(command=="backcolor"){delete valueOverrides.hilitecolor;}else if(command=="hilitecolor"){delete valueOverrides.backcolor;}};}());function movePreservingRanges(node,newParent,newIndex,range){if(newIndex==-1){newIndex=newParent.childNodes.length;}
var oldParent=node.parentNode;var oldIndex=getNodeIndex(node);var i;var ranges=[range];for(i=0;i<Aloha.getSelection().rangeCount;i++){ranges.push(Aloha.getSelection().getRangeAt(i));}
var boundaryPoints=[];$_(ranges).forEach(function(range){boundaryPoints.push([range.startContainer,range.startOffset]);boundaryPoints.push([range.endContainer,range.endOffset]);});$_(boundaryPoints).forEach(function(boundaryPoint){if(boundaryPoint[0]==newParent&&boundaryPoint[1]>newIndex){boundaryPoint[1]++;}
if(boundaryPoint[0]==oldParent&&(boundaryPoint[1]==oldIndex||boundaryPoint[1]==oldIndex+1)){boundaryPoint[0]=newParent;boundaryPoint[1]+=newIndex-oldIndex;}
if(boundaryPoint[0]==oldParent&&boundaryPoint[1]>oldIndex+1){boundaryPoint[1]--;}});if(newParent.childNodes.length==newIndex){newParent.appendChild(node);}else{newParent.insertBefore(node,newParent.childNodes[newIndex]);}
var newRange=null;if(boundaryPoints[0][1]>boundaryPoints[0][0].childNodes.length&&boundaryPoints[1][1]>boundaryPoints[1][0].childNodes.length){range.setStart(node,0);range.setEnd(node,0);}else{range.setStart(boundaryPoints[0][0],boundaryPoints[0][1]);range.setEnd(boundaryPoints[1][0],boundaryPoints[1][1]);Aloha.getSelection().removeAllRanges();for(i=1;i<ranges.length;i++){newRange=Aloha.createRange();newRange.setStart(boundaryPoints[2*i][0],boundaryPoints[2*i][1]);newRange.setEnd(boundaryPoints[2*i+1][0],boundaryPoints[2*i+1][1]);Aloha.getSelection().addRange(newRange);}
if(newRange){range=newRange;}}}
function copyAttributes(element,newElement){if(jQuery.browser.msie&&jQuery.browser.version>=7&&typeof element.attributes[jQuery.expando]!=='undefined'){jQuery(element).removeAttr(jQuery.expando);}
var attrs=element.attributes;var i;for(i=0;i<attrs.length;i++){var attr=attrs[i];if(typeof attr.specified==="undefined"||attr.specified){if(typeof newElement.setAttributeNS==='function'){newElement.setAttributeNS(attr.namespaceURI,attr.name,attr.value);}else{newElement.setAttribute(attr.name,attr.value);}}}}
function setTagName(element,newName,range){if(isNamedHtmlElement(element,newName)){return element;}
if(!element.parentNode){return element;}
var replacementElement=element.ownerDocument.createElement(newName);element.parentNode.insertBefore(replacementElement,element);copyAttributes(element,replacementElement);while(element.childNodes.length){movePreservingRanges(element.firstChild,replacementElement,replacementElement.childNodes.length,range);}
element.parentNode.removeChild(element);if(range.startContainer===element){range.startContainer=replacementElement;}
if(range.endContainer===element){range.endContainer=replacementElement;}
return replacementElement;}
function removeExtraneousLineBreaksBefore(node){var ref=node.previousSibling;if(!ref){return;}
while(ref.hasChildNodes()){ref=ref.lastChild;}
while(isInvisible(ref)&&!isExtraneousLineBreak(ref)&&ref!=node.parentNode){ref=previousNode(ref);}
if(isEditable(ref)&&isExtraneousLineBreak(ref)){ref.parentNode.removeChild(ref);}}
function removeExtraneousLineBreaksAtTheEndOf(node){var ref=node;while(ref.hasChildNodes()){ref=ref.lastChild;}
while(isInvisible(ref)&&!isExtraneousLineBreak(ref)&&ref!=node){ref=previousNode(ref);}
if(isEditable(ref)&&isExtraneousLineBreak(ref)){ref.parentNode.removeChild(ref);}}
function removeExtraneousLineBreaksFrom(node){removeExtraneousLineBreaksBefore(node);removeExtraneousLineBreaksAtTheEndOf(node);}
function wrap(nodeList,siblingCriteria,newParentInstructions,range){var i;if(typeof siblingCriteria=="undefined"){siblingCriteria=function(){return false;};}
if(typeof newParentInstructions=="undefined"){newParentInstructions=function(){return null;};}
if(!nodeList.length||!isEditable(nodeList[0])){return null;}
if(isInlineNode(nodeList[nodeList.length-1])&&!isNamedHtmlElement(nodeList[nodeList.length-1],"br")&&isNamedHtmlElement(nodeList[nodeList.length-1].nextSibling,"br")){nodeList.push(nodeList[nodeList.length-1].nextSibling);}
var newParent;if(isEditable(nodeList[0].previousSibling)&&siblingCriteria(nodeList[0].previousSibling)){newParent=nodeList[0].previousSibling;}else if(isEditable(nodeList[nodeList.length-1].nextSibling)&&siblingCriteria(nodeList[nodeList.length-1].nextSibling)){newParent=nodeList[nodeList.length-1].nextSibling;}else{newParent=newParentInstructions();}
if(!newParent){return null;}
if(!newParent.parentNode){nodeList[0].parentNode.insertBefore(newParent,nodeList[0]);var startContainer=range.startContainer,startOffset=range.startOffset,endContainer=range.endContainer,endOffset=range.endOffset;if(startContainer==newParent.parentNode&&startOffset>=getNodeIndex(newParent)){range.setStart(startContainer,startOffset+1);}
if(endContainer==newParent.parentNode&&endOffset>=getNodeIndex(newParent)){range.setEnd(endContainer,endOffset+1);}
if(globalRange&&globalRange!==range){startContainer=globalRange.startContainer;startOffset=globalRange.startOffset;endContainer=globalRange.endContainer;endOffset=globalRange.endOffset;if(startContainer==newParent.parentNode&&startOffset>=getNodeIndex(newParent)){globalRange.setStart(startContainer,startOffset+1);}
if(endContainer==newParent.parentNode&&endOffset>=getNodeIndex(newParent)){globalRange.setEnd(endContainer,endOffset+1);}}}
var originalParent=nodeList[0].parentNode;if(isBefore(newParent,nodeList[0])){if(!isInlineNode(newParent)&&isInlineNode(newParent.lastChild)&&isInlineNode(nodeList[0])&&!isNamedHtmlElement(newParent.lastChild,"BR")){newParent.appendChild(newParent.ownerDocument.createElement("br"));}
for(i=0;i<nodeList.length;i++){movePreservingRanges(nodeList[i],newParent,-1,range);}}else{if(!isInlineNode(newParent)&&isInlineNode(newParent.firstChild)&&isInlineNode(nodeList[nodeList.length-1])&&!isNamedHtmlElement(nodeList[nodeList.length-1],"BR")){newParent.insertBefore(newParent.ownerDocument.createElement("br"),newParent.firstChild);}
for(i=nodeList.length-1;i>=0;i--){movePreservingRanges(nodeList[i],newParent,0,range);}}
if(isEditable(originalParent)&&!originalParent.hasChildNodes()){originalParent.parentNode.removeChild(originalParent);}
if(isEditable(newParent.nextSibling)&&siblingCriteria(newParent.nextSibling)){if(!isInlineNode(newParent)&&isInlineNode(newParent.lastChild)&&isInlineNode(newParent.nextSibling.firstChild)&&!isNamedHtmlElement(newParent.lastChild,"BR")){newParent.appendChild(newParent.ownerDocument.createElement("br"));}
while(newParent.nextSibling.hasChildNodes()){movePreservingRanges(newParent.nextSibling.firstChild,newParent,-1,range);}
newParent.parentNode.removeChild(newParent.nextSibling);}
removeExtraneousLineBreaksFrom(newParent);return newParent;}
var namesOfElementsWithInlineContentsMap={"A":true,"ABBR":true,"B":true,"BDI":true,"BDO":true,"CITE":true,"CODE":true,"DFN":true,"EM":true,"H1":true,"H2":true,"H3":true,"H4":true,"H5":true,"H6":true,"I":true,"KBD":true,"MARK":true,"P":true,"PRE":true,"Q":true,"RP":true,"RT":true,"RUBY":true,"S":true,"SAMP":true,"SMALL":true,"SPAN":true,"STRONG":true,"SUB":true,"SUP":true,"U":true,"VAR":true,"ACRONYM":true,"LISTING":true,"STRIKE":true,"XMP":true,"BIG":true,"BLINK":true,"FONT":true,"MARQUEE":true,"NOBR":true,"TT":true};var tableRelatedElements={"colgroup":true,"table":true,"tbody":true,"tfoot":true,"thead":true,"tr":true};var scriptRelatedElements={"script":true,"style":true,"plaintext":true,"xmp":true};var prohibitedHeadingNestingMap=jQuery.extend({"H1":true,"H2":true,"H3":true,"H4":true,"H5":true,"H6":true},prohibitedParagraphChildNamesMap);var prohibitedTableNestingMap={"CAPTION":true,"COL":true,"COLGROUP":true,"TBODY":true,"TD":true,"TFOOT":true,"TH":true,"THEAD":true,"TR":true};var prohibitedDefNestingMap={"DD":true,"DT":true};var prohibitedNestingCombinationsMap={"A":jQuery.extend({"A":true},prohibitedParagraphChildNamesMap),"DD":prohibitedDefNestingMap,"DT":prohibitedDefNestingMap,"LI":{"LI":true},"NOBR":jQuery.extend({"NOBR":true},prohibitedParagraphChildNamesMap),"H1":prohibitedHeadingNestingMap,"H2":prohibitedHeadingNestingMap,"H3":prohibitedHeadingNestingMap,"H4":prohibitedHeadingNestingMap,"H5":prohibitedHeadingNestingMap,"H6":prohibitedHeadingNestingMap,"TD":prohibitedTableNestingMap,"TH":prohibitedTableNestingMap,"ABBR":prohibitedParagraphChildNamesMap,"B":prohibitedParagraphChildNamesMap,"BDI":prohibitedParagraphChildNamesMap,"BDO":prohibitedParagraphChildNamesMap,"CITE":prohibitedParagraphChildNamesMap,"CODE":prohibitedParagraphChildNamesMap,"DFN":prohibitedParagraphChildNamesMap,"EM":prohibitedParagraphChildNamesMap,"I":prohibitedParagraphChildNamesMap,"KBD":prohibitedParagraphChildNamesMap,"MARK":prohibitedParagraphChildNamesMap,"P":prohibitedParagraphChildNamesMap,"PRE":prohibitedParagraphChildNamesMap,"Q":prohibitedParagraphChildNamesMap,"RP":prohibitedParagraphChildNamesMap,"RT":prohibitedParagraphChildNamesMap,"RUBY":prohibitedParagraphChildNamesMap,"S":prohibitedParagraphChildNamesMap,"SAMP":prohibitedParagraphChildNamesMap,"SMALL":prohibitedParagraphChildNamesMap,"SPAN":prohibitedParagraphChildNamesMap,"STRONG":prohibitedParagraphChildNamesMap,"SUB":prohibitedParagraphChildNamesMap,"SUP":prohibitedParagraphChildNamesMap,"U":prohibitedParagraphChildNamesMap,"VAR":prohibitedParagraphChildNamesMap,"ACRONYM":prohibitedParagraphChildNamesMap,"LISTING":prohibitedParagraphChildNamesMap,"STRIKE":prohibitedParagraphChildNamesMap,"XMP":prohibitedParagraphChildNamesMap,"BIG":prohibitedParagraphChildNamesMap,"BLINK":prohibitedParagraphChildNamesMap,"FONT":prohibitedParagraphChildNamesMap,"MARQUEE":prohibitedParagraphChildNamesMap,"TT":prohibitedParagraphChildNamesMap};function isElementWithInlineContents(node){return isMappedHtmlElement(node,namesOfElementsWithInlineContentsMap);}
function isAllowedChild(child,parent_){if((tableRelatedElements[parent_]||isHtmlElementInArray(parent_,["colgroup","table","tbody","tfoot","thead","tr"]))&&typeof child=="object"&&child.nodeType==$_.Node.TEXT_NODE&&!/^[ \t\n\f\r]*$/.test(child.data)){return false;}
if((scriptRelatedElements[parent_]||isHtmlElementInArray(parent_,["script","style","plaintext","xmp"]))&&(typeof child!="object"||child.nodeType!=$_.Node.TEXT_NODE)){return false;}
if(typeof child=="object"&&(child.nodeType==$_.Node.DOCUMENT_NODE||child.nodeType==$_.Node.DOCUMENT_FRAGMENT_NODE||child.nodeType==$_.Node.DOCUMENT_TYPE_NODE)){return false;}
if(isAnyHtmlElement(child)){child=child.tagName.toLowerCase();}
if(typeof child!="string"){return true;}
if(isAnyHtmlElement(parent_)){var ancestor=parent_;while(ancestor){if(child=="a"&&isNamedHtmlElement(ancestor,'a')){return false;}
if(prohibitedParagraphChildNamesMap[child.toUpperCase()]&&isElementWithInlineContents(ancestor)){return false;}
if(/^h[1-6]$/.test(child)&&isAnyHtmlElement(ancestor)&&/^H[1-6]$/.test(ancestor.tagName)){return false;}
ancestor=ancestor.parentNode;}
parent_=parent_.tagName.toLowerCase();}
if(typeof parent_=="object"&&(parent_.nodeType==$_.Node.ELEMENT_NODE||parent_.nodeType==$_.Node.DOCUMENT_FRAGMENT_NODE)){return true;}
if(typeof parent_!="string"){return false;}
switch(parent_){case"colgroup":return child=="col";case"table":return jQuery.inArray(child,["caption","col","colgroup","tbody","td","tfoot","th","thead","tr"])!=-1;case"tbody":case"thead":case"tfoot":return jQuery.inArray(child,["td","th","tr"])!=-1;case"tr":return jQuery.inArray(child,["td","th"])!=-1;case"dl":return jQuery.inArray(child,["dt","dd"])!=-1;case"dir":case"ol":case"ul":return jQuery.inArray(child,["dir","li","ol","ul"])!=-1;case"hgroup":return(/^h[1-6]$/).test(child);}
if(jQuery.inArray(child,["body","caption","col","colgroup","frame","frameset","head","html","tbody","td","tfoot","th","thead","tr"])!=-1){return false;}
if(jQuery.inArray(child,["dd","dt"])!=-1&&parent_!="dl"){return false;}
if(child=="li"&&parent_!="ol"&&parent_!="ul"){return false;}
var leftSide=prohibitedNestingCombinationsMap[parent_.toUpperCase()];if(leftSide){var rightSide=leftSide[child.toUpperCase()];if(rightSide){return false;}}
return true;}
function isEffectivelyContained(node,range){if(range.collapsed){return false;}
if(isContained(node,range)){return true;}
if(node==range.startContainer&&node.nodeType==$_.Node.TEXT_NODE&&getNodeLength(node)!=range.startOffset){return true;}
if(node==range.endContainer&&node.nodeType==$_.Node.TEXT_NODE&&range.endOffset!=0){return true;}
if(node.hasChildNodes()&&$_(node.childNodes).every(function(child){return isEffectivelyContained(child,range);})&&(!isDescendant(range.startContainer,node)||range.startContainer.nodeType!=$_.Node.TEXT_NODE||range.startOffset==0)&&(!isDescendant(range.endContainer,node)||range.endContainer.nodeType!=$_.Node.TEXT_NODE||range.endOffset==getNodeLength(range.endContainer))){return true;}
return false;}
function getEffectivelyContainedNodes(range,condition){if(typeof condition=="undefined"){condition=function(){return true;};}
var node=range.startContainer;while(isEffectivelyContained(node.parentNode,range)){node=node.parentNode;}
var stop=nextNodeDescendants(range.endContainer);var nodeList=[];while(isBefore(node,stop)){if(isEffectivelyContained(node,range)&&condition(node)){nodeList.push(node);node=nextNodeDescendants(node);continue;}
node=nextNode(node);}
return nodeList;}
function getAllEffectivelyContainedNodes(range,condition){if(typeof condition=="undefined"){condition=function(){return true;};}
var node=range.startContainer;while(isEffectivelyContained(node.parentNode,range)){node=node.parentNode;}
var stop=nextNodeDescendants(range.endContainer);var nodeList=[];while(isBefore(node,stop)){if(isEffectivelyContained(node,range)&&condition(node)){nodeList.push(node);}
node=nextNode(node);}
return nodeList;}
function isModifiableElement(node){if(!isAnyHtmlElement(node)){return false;}
if(jQuery.inArray(node.tagName,["B","EM","I","S","SPAN","STRIKE","STRONG","SUB","SUP","U"])!=-1){if(node.attributes.length==0){return true;}
if(node.attributes.length==1&&hasAttribute(node,"style")){return true;}}
if(node.tagName=="FONT"||node.tagName=="A"){var numAttrs=node.attributes.length;if(hasAttribute(node,"style")){numAttrs--;}
if(node.tagName=="FONT"){if(hasAttribute(node,"color")){numAttrs--;}
if(hasAttribute(node,"face")){numAttrs--;}
if(hasAttribute(node,"size")){numAttrs--;}}
if(node.tagName=="A"&&hasAttribute(node,"href")){numAttrs--;}
if(numAttrs==0){return true;}}
return false;}
function isSimpleModifiableElement(node){if(!isAnyHtmlElement(node)){return false;}
if(jQuery.inArray(node.tagName,["A","B","EM","FONT","I","S","SPAN","STRIKE","STRONG","SUB","SUP","U"])==-1){return false;}
if(node.attributes.length==0){return true;}
if(node.attributes.length>1){return false;}
if(hasAttribute(node,"style")&&getStyleLength(node)==0){return true;}
if(node.tagName=="A"&&hasAttribute(node,"href")){return true;}
if(node.tagName=="FONT"&&(hasAttribute(node,"color")||hasAttribute(node,"face")||hasAttribute(node,"size"))){return true;}
if((node.tagName=="B"||node.tagName=="STRONG")&&hasAttribute(node,"style")&&getStyleLength(node)==1&&node.style.fontWeight!=""){return true;}
if((node.tagName=="I"||node.tagName=="EM")&&hasAttribute(node,"style")&&getStyleLength(node)==1&&node.style.fontStyle!=""){return true;}
if((node.tagName=="A"||node.tagName=="FONT"||node.tagName=="SPAN")&&hasAttribute(node,"style")&&getStyleLength(node)==1&&node.style.textDecoration==""){return true;}
if(jQuery.inArray(node.tagName,["A","FONT","S","SPAN","STRIKE","U"])!=-1&&hasAttribute(node,"style")&&getStyleLength(node)==1&&(node.style.textDecoration=="line-through"||node.style.textDecoration=="underline"||node.style.textDecoration=="overline"||node.style.textDecoration=="none")){return true;}
return false;}
function areEquivalentValues(command,val1,val2){if(val1===null&&val2===null){return true;}
if(typeof val1=="string"&&typeof val2=="string"&&val1==val2&&!(commands[command].hasOwnProperty("equivalentValues"))){return true;}
if(typeof val1=="string"&&typeof val2=="string"&&commands[command].hasOwnProperty("equivalentValues")&&commands[command].equivalentValues(val1,val2)){return true;}
return false;}
function areLooselyEquivalentValues(command,val1,val2){if(areEquivalentValues(command,val1,val2)){return true;}
if(command!="fontsize"||typeof val1!="string"||typeof val2!="string"){return false;}
var callee=areLooselyEquivalentValues;if(callee.sizeMap===undefined){callee.sizeMap={};var font=document.createElement("font");document.body.appendChild(font);$_(["xx-small","small","medium","large","x-large","xx-large","xxx-large"]).forEach(function(keyword){font.size=cssSizeToLegacy(keyword);callee.sizeMap[keyword]=$_.getComputedStyle(font).fontSize;});document.body.removeChild(font);}
return val1===callee.sizeMap[val2]||val2===callee.sizeMap[val1];}
function getEffectiveCommandValue(node,command){if(node.nodeType!=$_.Node.ELEMENT_NODE&&(!node.parentNode||node.parentNode.nodeType!=$_.Node.ELEMENT_NODE)){return null;}
if(node.nodeType!=$_.Node.ELEMENT_NODE){return getEffectiveCommandValue(node.parentNode,command);}
if(command=="createlink"||command=="unlink"){while(node&&(!isAnyHtmlElement(node)||node.tagName!="A"||!hasAttribute(node,"href"))){node=node.parentNode;}
if(!node){return null;}
return node.getAttribute("href");}
if(command=="backcolor"||command=="hilitecolor"){while(($_.getComputedStyle(node).backgroundColor=="rgba(0, 0, 0, 0)"||$_.getComputedStyle(node).backgroundColor===""||$_.getComputedStyle(node).backgroundColor=="transparent")&&node.parentNode&&node.parentNode.nodeType==$_.Node.ELEMENT_NODE){node=node.parentNode;}
if($_.getComputedStyle(node).backgroundColor=="rgba(0, 0, 0, 0)"||$_.getComputedStyle(node).backgroundColor===""||$_.getComputedStyle(node).backgroundColor=="transparent"){return"rgb(255, 255, 255)";}
return $_.getComputedStyle(node).backgroundColor;}
if(command=="subscript"||command=="superscript"){var affectedBySubscript=false;var affectedBySuperscript=false;while(isInlineNode(node)){var verticalAlign=$_.getComputedStyle(node).verticalAlign;if(isNamedHtmlElement(node,'sub')){affectedBySubscript=true;}else if(isNamedHtmlElement(node,'sup')){affectedBySuperscript=true;}
node=node.parentNode;}
if(affectedBySubscript&&affectedBySuperscript){return"mixed";}
if(affectedBySubscript){return"subscript";}
if(affectedBySuperscript){return"superscript";}
return null;}
if(command=="strikethrough"){do{if($_.getComputedStyle(node).textDecoration.indexOf("line-through")!=-1){return"line-through";}
node=node.parentNode;}while(node&&node.nodeType==$_.Node.ELEMENT_NODE);return null;}
if(command=="underline"){do{if($_.getComputedStyle(node).textDecoration.indexOf("underline")!=-1){return"underline";}
node=node.parentNode;}while(node&&node.nodeType==$_.Node.ELEMENT_NODE);return null;}
if(!commands[command].hasOwnProperty("relevantCssProperty")){throw"Bug: no relevantCssProperty for "+command+" in getEffectiveCommandValue";}
return $_.getComputedStyle(node)[commands[command].relevantCssProperty].toString();}
function getSpecifiedCommandValue(element,command){if((command=="backcolor"||command=="hilitecolor")&&$_.getComputedStyle(element).display!="inline"){return null;}
if(command=="createlink"||command=="unlink"){if(isAnyHtmlElement(element)&&element.tagName=="A"&&hasAttribute(element,"href")){return element.getAttribute("href");}
return null;}
if(command=="subscript"||command=="superscript"){if(isNamedHtmlElement(element,'sup')){return"superscript";}
if(isNamedHtmlElement(element,'sub')){return"subscript";}
return null;}
if(command=="strikethrough"&&element.style.textDecoration!=""){if(element.style.textDecoration.indexOf("line-through")!=-1){return"line-through";}
return null;}
if(command=="strikethrough"&&isHtmlElementInArray(element,["S","STRIKE"])){return"line-through";}
if(command=="underline"&&element.style.textDecoration!=""){if(element.style.textDecoration.indexOf("underline")!=-1){return"underline";}
return null;}
if(command=="underline"&&isNamedHtmlElement(element,'U')){return"underline";}
var property=commands[command].relevantCssProperty;if(property===null){return null;}
if(element.style[property]!=""){return element.style[property];}
if(isHtmlNamespace(element.namespaceURI)&&element.tagName=="FONT"){if(property=="color"&&hasAttribute(element,"color")){return element.color;}
if(property=="fontFamily"&&hasAttribute(element,"face")){return element.face;}
if(property=="fontSize"&&hasAttribute(element,"size")){var size=parseInt(element.size,10);if(size<1){size=1;}
if(size>7){size=7;}
return{1:"xx-small",2:"small",3:"medium",4:"large",5:"x-large",6:"xx-large",7:"xxx-large"}[size];}}
if(property=="fontWeight"&&(element.tagName=="B"||element.tagName=="STRONG")){return"bold";}
if(property=="fontStyle"&&(element.tagName=="I"||element.tagName=="EM")){return"italic";}
return null;}
function reorderModifiableDescendants(node,command,newValue,range){var candidate=node;while(isModifiableElement(candidate)&&candidate.childNodes.length==1&&isModifiableElement(candidate.firstChild)&&(!isSimpleModifiableElement(candidate)||!areEquivalentValues(command,getSpecifiedCommandValue(candidate,command),newValue))){candidate=candidate.firstChild;}
if(candidate==node||!isSimpleModifiableElement(candidate)||!areEquivalentValues(command,getSpecifiedCommandValue(candidate,command),newValue)||!areLooselyEquivalentValues(command,getEffectiveCommandValue(candidate,command),newValue)){return;}
while(candidate.hasChildNodes()){movePreservingRanges(candidate.firstChild,candidate.parentNode,getNodeIndex(candidate),range);}
node.parentNode.insertBefore(candidate,node.nextSibling);movePreservingRanges(node,candidate,-1,range);}
var recordValuesCommands=["subscript","bold","fontname","fontsize","forecolor","hilitecolor","italic","strikethrough","underline"];function recordValues(nodeList){var values=[];var nodes=jQuery.makeArray(nodeList);var i,j;var node;var command;var ancestor;var specifiedCommandValue;for(i=0;i<nodes.length;i++){node=nodes[i];for(j=0;j<recordValuesCommands.length;j++){command=recordValuesCommands[j];ancestor=node;if(ancestor.nodeType!=1){ancestor=ancestor.parentNode;}
specifiedCommandValue=null;while(ancestor&&ancestor.nodeType==1&&(specifiedCommandValue=getSpecifiedCommandValue(ancestor,command))===null){ancestor=ancestor.parentNode;}
values.push([node,command,specifiedCommandValue]);}}
return values;}
function clearValue(element,command,range){if(!isEditable(element)){return[];}
if(getSpecifiedCommandValue(element,command)===null){return[];}
if(isSimpleModifiableElement(element)){var children=Array.prototype.slice.call(toArray(element.childNodes));var i;for(i=0;i<children.length;i++){movePreservingRanges(children[i],element.parentNode,getNodeIndex(element),range);}
element.parentNode.removeChild(element);return children;}
if(command=="strikethrough"&&element.style.textDecoration.indexOf("line-through")!=-1){if(element.style.textDecoration=="line-through"){element.style.textDecoration="";}else{element.style.textDecoration=element.style.textDecoration.replace("line-through","");}
if(element.getAttribute("style")==""){element.removeAttribute("style");}}
if(command=="underline"&&element.style.textDecoration.indexOf("underline")!=-1){if(element.style.textDecoration=="underline"){element.style.textDecoration="";}else{element.style.textDecoration=element.style.textDecoration.replace("underline","");}
if(element.getAttribute("style")==""){element.removeAttribute("style");}}
if(commands[command].relevantCssProperty!==null){element.style[commands[command].relevantCssProperty]='';if(element.getAttribute("style")==""){element.removeAttribute("style");}}
if(isHtmlNamespace(element.namespaceURI)&&element.tagName=="FONT"){if(command=="forecolor"){element.removeAttribute("color");}
if(command=="fontname"){element.removeAttribute("face");}
if(command=="fontsize"){element.removeAttribute("size");}}
if(isNamedHtmlElement(element,'A')&&(command=="createlink"||command=="unlink")){element.removeAttribute("href");}
if(getSpecifiedCommandValue(element,command)===null){return[];}
return[setTagName(element,"span",range)];}
function forceValue(node,command,newValue,range){var children=[];var i;var specifiedValue;if(!node.parentNode){return;}
if(newValue===null){return;}
if(isAllowedChild(node,"span")){reorderModifiableDescendants(node.previousSibling,command,newValue,range);reorderModifiableDescendants(node.nextSibling,command,newValue,range);wrap([node],function(node){return isSimpleModifiableElement(node)&&areEquivalentValues(command,getSpecifiedCommandValue(node,command),newValue)&&areLooselyEquivalentValues(command,getEffectiveCommandValue(node,command),newValue);},function(){return null;},range);}
if(areLooselyEquivalentValues(command,getEffectiveCommandValue(node,command),newValue)){return;}
if(!isAllowedChild(node,"span")){for(i=0;i<node.childNodes.length;i++){if(node.childNodes[i].nodeType==$_.Node.ELEMENT_NODE){specifiedValue=getSpecifiedCommandValue(node.childNodes[i],command);if(specifiedValue!==null&&!areEquivalentValues(command,newValue,specifiedValue)){continue;}}
children.push(node.childNodes[i]);}
for(i=0;i<children.length;i++){forceValue(children[i],command,newValue,range);}
return;}
if(areLooselyEquivalentValues(command,getEffectiveCommandValue(node,command),newValue)){return;}
var newParent=null;if(!cssStylingFlag){if(command=="bold"&&(newValue=="bold"||newValue=="700")){newParent=node.ownerDocument.createElement("b");}
if(command=="italic"&&newValue=="italic"){newParent=node.ownerDocument.createElement("i");}
if(command=="strikethrough"&&newValue=="line-through"){newParent=node.ownerDocument.createElement("s");}
if(command=="underline"&&newValue=="underline"){newParent=node.ownerDocument.createElement("u");}
if(command=="forecolor"&&parseSimpleColor(newValue)){newParent=node.ownerDocument.createElement("span");jQuery(newParent).css('color',parseSimpleColor(newValue));}
if(command=="fontname"){newParent=node.ownerDocument.createElement("font");newParent.face=newValue;}}
if(command=="createlink"||command=="unlink"){newParent=node.ownerDocument.createElement("a");newParent.setAttribute("href",newValue);var ancestor=node.parentNode;while(ancestor){if(isNamedHtmlElement(ancestor,'A')){ancestor=setTagName(ancestor,"span",range);}
ancestor=ancestor.parentNode;}}
if(command=="fontsize"&&jQuery.inArray(newValue,["xx-small","small","medium","large","x-large","xx-large","xxx-large"])!=-1&&(!cssStylingFlag||newValue=="xxx-large")){newParent=node.ownerDocument.createElement("font");newParent.size=cssSizeToLegacy(newValue);}
if((command=="subscript"||command=="superscript")&&newValue=="subscript"){newParent=node.ownerDocument.createElement("sub");}
if((command=="subscript"||command=="superscript")&&newValue=="superscript"){newParent=node.ownerDocument.createElement("sup");}
if(!newParent){newParent=node.ownerDocument.createElement("span");}
node.parentNode.insertBefore(newParent,node);var property=commands[command].relevantCssProperty;if(property!==null&&!areLooselyEquivalentValues(command,getEffectiveCommandValue(newParent,command),newValue)){newParent.style[property]=newValue;}
if(command=="strikethrough"&&newValue=="line-through"&&getEffectiveCommandValue(newParent,"strikethrough")!="line-through"){newParent.style.textDecoration="line-through";}
if(command=="underline"&&newValue=="underline"&&getEffectiveCommandValue(newParent,"underline")!="underline"){newParent.style.textDecoration="underline";}
movePreservingRanges(node,newParent,newParent.childNodes.length,range);if(node.nodeType==$_.Node.ELEMENT_NODE&&!areEquivalentValues(command,getEffectiveCommandValue(node,command),newValue)){movePreservingRanges(node,newParent.parentNode,getNodeIndex(newParent),range);newParent.parentNode.removeChild(newParent);children=[];for(i=0;i<node.childNodes.length;i++){if(node.childNodes[i].nodeType==$_.Node.ELEMENT_NODE){specifiedValue=getSpecifiedCommandValue(node.childNodes[i],command);if(specifiedValue!==null&&!areEquivalentValues(command,newValue,specifiedValue)){continue;}}
children.push(node.childNodes[i]);}
for(i=0;i<children.length;i++){forceValue(children[i],command,newValue,range);}}}
function pushDownValues(node,command,newValue,range){if(!node.parentNode||node.parentNode.nodeType!=$_.Node.ELEMENT_NODE){return;}
if(areLooselyEquivalentValues(command,getEffectiveCommandValue(node,command),newValue)){return;}
var currentAncestor=node.parentNode;var ancestorList=[];while(isEditable(currentAncestor)&&currentAncestor.nodeType==$_.Node.ELEMENT_NODE&&!areLooselyEquivalentValues(command,getEffectiveCommandValue(currentAncestor,command),newValue)){ancestorList.push(currentAncestor);currentAncestor=currentAncestor.parentNode;}
if(!ancestorList.length){return;}
var propagatedValue=getSpecifiedCommandValue(ancestorList[ancestorList.length-1],command);if(propagatedValue===null&&propagatedValue!=newValue){return;}
if(newValue!==null&&!areLooselyEquivalentValues(command,getEffectiveCommandValue(ancestorList[ancestorList.length-1].parentNode,command),newValue)){return;}
while(ancestorList.length){currentAncestor=ancestorList.pop();if(getSpecifiedCommandValue(currentAncestor,command)!==null){propagatedValue=getSpecifiedCommandValue(currentAncestor,command);}
var children=Array.prototype.slice.call(toArray(currentAncestor.childNodes));if(getSpecifiedCommandValue(currentAncestor,command)!==null){clearValue(currentAncestor,command,range);}
var i;for(i=0;i<children.length;i++){var child=children[i];if(child==node){continue;}
if(child.nodeType==$_.Node.ELEMENT_NODE&&getSpecifiedCommandValue(child,command)!==null&&!areEquivalentValues(command,propagatedValue,getSpecifiedCommandValue(child,command))){continue;}
if(child==ancestorList[ancestorList.length-1]){continue;}
forceValue(child,command,propagatedValue,range);}}}
function restoreValues(values,range){$_(values).forEach(function(triple){var node=triple[0];var command=triple[1];var value=triple[2];var ancestor=node;if(!ancestor||ancestor.nodeType!=$_.Node.ELEMENT_NODE){ancestor=ancestor.parentNode;}
while(ancestor&&ancestor.nodeType==$_.Node.ELEMENT_NODE&&getSpecifiedCommandValue(ancestor,command)===null){ancestor=ancestor.parentNode;}
if(value===null&&ancestor&&ancestor.nodeType==$_.Node.ELEMENT_NODE){pushDownValues(node,command,null,range);}else if((ancestor&&ancestor.nodeType==$_.Node.ELEMENT_NODE&&!areEquivalentValues(command,getSpecifiedCommandValue(ancestor,command),value))||((!ancestor||ancestor.nodeType!=$_.Node.ELEMENT_NODE)&&value!==null)){forceValue(node,command,value,range);}});}
function setSelectionValue(command,newValue,range){range=range||getActiveRange();if(!$_(getAllEffectivelyContainedNodes(range)).filter(function(node){return node.nodeType==$_.Node.TEXT_NODE;},true).some(isEditable)){if(commands[command].hasOwnProperty("inlineCommandActivatedValues")){setStateOverride(command,$_(commands[command].inlineCommandActivatedValues).indexOf(newValue)!=-1,range);}
if(command=="subscript"){unsetStateOverride("superscript",range);}
if(command=="superscript"){unsetStateOverride("subscript",range);}
if(newValue===null){unsetValueOverride(command,range);}else if(commands[command].hasOwnProperty("value")){setValueOverride(command,newValue,range);}
return;}
if(isEditable(range.startContainer)&&range.startContainer.nodeType==$_.Node.TEXT_NODE&&range.startOffset!=0&&range.startOffset!=getNodeLength(range.startContainer)){var newNode=range.startContainer.splitText(range.startOffset);var newActiveRange=Aloha.createRange();if(range.startContainer==range.endContainer){var newEndOffset=range.endOffset-range.startOffset;newActiveRange.setEnd(newNode,newEndOffset);range.setEnd(newNode,newEndOffset);}
newActiveRange.setStart(newNode,0);Aloha.getSelection().removeAllRanges();Aloha.getSelection().addRange(newActiveRange);range.setStart(newNode,0);}
if(isEditable(range.endContainer)&&range.endContainer.nodeType==$_.Node.TEXT_NODE&&range.endOffset!=0&&range.endOffset!=getNodeLength(range.endContainer)){var activeRange=range;var newStart=[activeRange.startContainer,activeRange.startOffset];var newEnd=[activeRange.endContainer,activeRange.endOffset];activeRange.endContainer.splitText(activeRange.endOffset);activeRange.setStart(newStart[0],newStart[1]);activeRange.setEnd(newEnd[0],newEnd[1]);Aloha.getSelection().removeAllRanges();Aloha.getSelection().addRange(activeRange);}
$_(getAllEffectivelyContainedNodes(getActiveRange(),function(node){return isEditable(node)&&node.nodeType==$_.Node.ELEMENT_NODE;})).forEach(function(element){clearValue(element,command,range);});$_(getAllEffectivelyContainedNodes(range,isEditable)).forEach(function(node){pushDownValues(node,command,newValue,range);forceValue(node,command,newValue,range);});}
function getBlockAtNextPosition(node,offset){var i;if(node.nodeType===$_.Node.TEXT_NODE&&offset<node.length){for(i=offset;i<node.length;i++){if((node.data.charAt(i)!=='\t'&&node.data.charAt(i)!=='\r'&&node.data.charAt(i)!=='\n')||node.data.charCodeAt(i)===160){return false;}}}
if(node.nextSibling&&node.nextSibling.className&&node.nextSibling.className.indexOf("aloha-table-wrapper")>=0){return node.nextSibling;}
if(node.parentNode&&node.parentNode.nextSibling&&node.parentNode.nextSibling.className&&node.parentNode.nextSibling.className.indexOf("aloha-table-wrapper")>=0){return node.parentNode.nextSibling;}
if(node.parentNode&&node.parentNode.nextSibling&&isWhitespaceNode(node.parentNode.nextSibling)&&node.parentNode.nextSibling.nextSibling&&node.parentNode.nextSibling.nextSibling.className&&node.parentNode.nextSibling.nextSibling.className.indexOf("aloha-table-wrapper")>=0){return node.parentNode.nextSibling.nextSibling;}}
function getBlockAtPreviousPosition(node,offset){var i;if(node.nodeType===$_.Node.TEXT_NODE&&offset>0){for(i=offset-1;i>=0;i--){if((node.data.charAt(i)!=='\t'&&node.data.charAt(i)!=='\r'&&node.data.charAt(i)!=='\n')||node.data.charCodeAt(i)===160){return false;}}}
if(node.previousSibling&&node.previousSibling.className&&node.previousSibling.className.indexOf("aloha-table-wrapper")>=0){return node.previousSibling;}
if(node.parentNode&&node.parentNode.previousSibling&&node.parentNode.previousSibling.className&&node.parentNode.previousSibling.className.indexOf("aloha-table-wrapper")>=0){return node.parentNode.previousSibling;}
if(node.parentNode&&node.parentNode.previousSibling&&isWhitespaceNode(node.parentNode.previousSibling)&&node.parentNode.previousSibling.previousSibling&&node.parentNode.previousSibling.previousSibling.className&&node.parentNode.previousSibling.previousSibling.className.indexOf('aloha-table-wrapper')>=0){return node.parentNode.previousSibling.previousSibling;}
return false;}
function isBlockStartPoint(node,offset){return(!node.parentNode&&offset==0)||(0<=offset-1&&offset-1<node.childNodes.length&&isVisible(node.childNodes[offset-1])&&(isBlockNode(node.childNodes[offset-1])||isNamedHtmlElement(node.childNodes[offset-1],"br")));}
function isBlockEndPoint(node,offset){return(!node.parentNode&&offset==getNodeLength(node))||(offset<node.childNodes.length&&isVisible(node.childNodes[offset])&&isBlockNode(node.childNodes[offset]));}
function isBlockBoundaryPoint(node,offset){return isBlockStartPoint(node,offset)||isBlockEndPoint(node,offset);}
function followsLineBreak(node){var offset=0;while(!isBlockBoundaryPoint(node,offset)){if(0<=offset-1&&offset-1<node.childNodes.length&&isVisible(node.childNodes[offset-1])){return false;}
if(offset==0||!node.hasChildNodes()){offset=getNodeIndex(node);node=node.parentNode;}else{node=node.childNodes[offset-1];offset=getNodeLength(node);}}
return true;}
function precedesLineBreak(node){var offset=getNodeLength(node);while(!isBlockBoundaryPoint(node,offset)){if(offset<node.childNodes.length&&isVisible(node.childNodes[offset])){return false;}
if(offset==getNodeLength(node)||!node.hasChildNodes()){offset=1+getNodeIndex(node);node=node.parentNode;}else{node=node.childNodes[offset];offset=0;}}
return true;}
function splitParent(nodeList,range){var i;var originalParent=nodeList[0].parentNode;if(!isEditable(originalParent)||!originalParent.parentNode){return;}
if(jQuery.inArray(originalParent.firstChild,nodeList)!=-1){removeExtraneousLineBreaksBefore(originalParent);}
var firstChildInNodeList=jQuery.inArray(originalParent.firstChild,nodeList)!=-1;var lastChildInNodeList=jQuery.inArray(originalParent.lastChild,nodeList)!=-1;var followsLineBreak_=firstChildInNodeList&&followsLineBreak(originalParent);var precedesLineBreak_=lastChildInNodeList&&precedesLineBreak(originalParent);if(!firstChildInNodeList&&lastChildInNodeList){for(i=nodeList.length-1;i>=0;i--){movePreservingRanges(nodeList[i],originalParent.parentNode,1+getNodeIndex(originalParent),range);}
if(precedesLineBreak_&&!precedesLineBreak(nodeList[nodeList.length-1])){nodeList[nodeList.length-1].parentNode.insertBefore(document.createElement("br"),nodeList[nodeList.length-1].nextSibling);}
removeExtraneousLineBreaksAtTheEndOf(originalParent);return;}
if(!firstChildInNodeList){var clonedParent=originalParent.cloneNode(false);originalParent.removeAttribute("id");originalParent.parentNode.insertBefore(clonedParent,originalParent);while(nodeList[0].previousSibling){movePreservingRanges(originalParent.firstChild,clonedParent,clonedParent.childNodes.length,range);}}
for(i=0;i<nodeList.length;i++){movePreservingRanges(nodeList[i],originalParent.parentNode,getNodeIndex(originalParent),range);}
if(followsLineBreak_&&!followsLineBreak(nodeList[0])){nodeList[0].parentNode.insertBefore(document.createElement("br"),nodeList[0]);}
if(isInlineNode(nodeList[nodeList.length-1])&&!isNamedHtmlElement(nodeList[nodeList.length-1],"br")&&isNamedHtmlElement(originalParent.firstChild,"br")&&!isInlineNode(originalParent)){originalParent.removeChild(originalParent.firstChild);}
if(!originalParent.hasChildNodes()){if(originalParent.parentNode===range.startContainer&&originalParent.parentNode===range.endContainer&&range.startContainer===range.endContainer&&range.startOffset===range.endOffset&&originalParent.parentNode.childNodes.length===range.startOffset){range.startOffset=originalParent.parentNode.childNodes.length-1;range.endOffset=range.startOffset;}
originalParent.parentNode.removeChild(originalParent);if(precedesLineBreak_&&!precedesLineBreak(nodeList[nodeList.length-1])){nodeList[nodeList.length-1].parentNode.insertBefore(document.createElement("br"),nodeList[nodeList.length-1].nextSibling);}}else{removeExtraneousLineBreaksBefore(originalParent);}
if(!nodeList[nodeList.length-1].nextSibling&&nodeList[nodeList.length-1].parentNode){removeExtraneousLineBreaksAtTheEndOf(nodeList[nodeList.length-1].parentNode);}}
commands.backcolor={action:function(value,range){if(/^([0-9a-fA-F]{3}){1,2}$/.test(value)){value="#"+value;}
if(!/^(rgba?|hsla?)\(.*\)$/.test(value)&&!parseSimpleColor(value)&&value.toLowerCase()!="transparent"){return;}
setSelectionValue("backcolor",value,range);},standardInlineValueCommand:true,relevantCssProperty:"backgroundColor",equivalentValues:function(val1,val2){return normalizeColor(val1)===normalizeColor(val2);}};commands.bold={action:function(value,range){if(myQueryCommandState("bold",range)){setSelectionValue("bold","normal",range);}else{setSelectionValue("bold","bold",range);}},inlineCommandActivatedValues:["bold","600","700","800","900"],relevantCssProperty:"fontWeight",equivalentValues:function(val1,val2){return val1==val2||(val1=="bold"&&val2=="700")||(val1=="700"&&val2=="bold")||(val1=="normal"&&val2=="400")||(val1=="400"&&val2=="normal");}};commands.createlink={action:function(value,range){if(value===""){return;}
$_(getAllEffectivelyContainedNodes(getActiveRange())).forEach(function(node){$_(getAncestors(node)).forEach(function(ancestor){if(isEditable(ancestor)&&isNamedHtmlElement(ancestor,'a')&&hasAttribute(ancestor,"href")){ancestor.setAttribute("href",value);}});});setSelectionValue("createlink",value,range);},standardInlineValueCommand:true};commands.fontname={action:function(value,range){setSelectionValue("fontname",value,range);},standardInlineValueCommand:true,relevantCssProperty:"fontFamily"};commands.fontsize={action:function(value,range){if(value===""){return;}
value=normalizeFontSize(value);if(jQuery.inArray(value,["xx-small","x-small","small","medium","large","x-large","xx-large","xxx-large"])==-1&&!/^[0-9]+(\.[0-9]+)?(cm|mm|in|pt|pc)$/.test(value)){return;}
setSelectionValue("fontsize",value,range);},indeterm:function(){return $_(getAllEffectivelyContainedNodes(getActiveRange(),function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;})).map(function(node){return getEffectiveCommandValue(node,"fontsize");},true).filter(function(value,i,arr){return $_(arr.slice(0,i)).indexOf(value)==-1;}).length>=2;},value:function(range){var node=getAllEffectivelyContainedNodes(range,function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;})[0];if(node===undefined){node=range.startContainer;}
var pixelSize=getEffectiveCommandValue(node,"fontsize");return getLegacyFontSize(pixelSize);},relevantCssProperty:"fontSize"};commands.forecolor={action:function(value,range){if(/^([0-9a-fA-F]{3}){1,2}$/.test(value)){value="#"+value;}
if(!/^(rgba?|hsla?)\(.*\)$/.test(value)&&!parseSimpleColor(value)&&value.toLowerCase()!="transparent"){return;}
setSelectionValue("forecolor",value,range);},standardInlineValueCommand:true,relevantCssProperty:"color",equivalentValues:function(val1,val2){return normalizeColor(val1)===normalizeColor(val2);}};commands.hilitecolor={action:function(value,range){if(/^([0-9a-fA-F]{3}){1,2}$/.test(value)){value="#"+value;}
if(!/^(rgba?|hsla?)\(.*\)$/.test(value)&&!parseSimpleColor(value)&&value.toLowerCase()!="transparent"){return;}
setSelectionValue("hilitecolor",value,range);},indeterm:function(){return $_(getAllEffectivelyContainedNodes(getActiveRange(),function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;})).map(function(node){return getEffectiveCommandValue(node,"hilitecolor");},true).filter(function(value,i,arr){return $_(arr.slice(0,i)).indexOf(value)==-1;}).length>=2;},standardInlineValueCommand:true,relevantCssProperty:"backgroundColor",equivalentValues:function(val1,val2){return normalizeColor(val1)===normalizeColor(val2);}};commands.italic={action:function(value,range){if(myQueryCommandState("italic",range)){setSelectionValue("italic","normal",range);}else{setSelectionValue("italic","italic",range);}},inlineCommandActivatedValues:["italic","oblique"],relevantCssProperty:"fontStyle"};commands.removeformat={action:function(value,range){var newEnd,newStart,newNode;function isRemoveFormatCandidate(node){return isEditable(node)&&isHtmlElementInArray(node,["abbr","acronym","b","bdi","bdo","big","blink","cite","code","dfn","em","font","i","ins","kbd","mark","nobr","q","s","samp","small","span","strike","strong","sub","sup","tt","u","var"]);}
var elementsToRemove=getAllEffectivelyContainedNodes(getActiveRange(),isRemoveFormatCandidate);$_(elementsToRemove).forEach(function(element){while(element.hasChildNodes()){movePreservingRanges(element.firstChild,element.parentNode,getNodeIndex(element),getActiveRange());}
element.parentNode.removeChild(element);});if(isEditable(getActiveRange().startContainer)&&getActiveRange().startContainer.nodeType==$_.Node.TEXT_NODE&&getActiveRange().startOffset!=0&&getActiveRange().startOffset!=getNodeLength(getActiveRange().startContainer)){if(getActiveRange().startContainer==getActiveRange().endContainer){newEnd=getActiveRange().endOffset-getActiveRange().startOffset;newNode=getActiveRange().startContainer.splitText(getActiveRange().startOffset);getActiveRange().setStart(newNode,0);getActiveRange().setEnd(newNode,newEnd);}else{getActiveRange().setStart(getActiveRange().startContainer.splitText(getActiveRange().startOffset),0);}}
if(isEditable(getActiveRange().endContainer)&&getActiveRange().endContainer.nodeType==$_.Node.TEXT_NODE&&getActiveRange().endOffset!=0&&getActiveRange().endOffset!=getNodeLength(getActiveRange().endContainer)){newStart=[getActiveRange().startContainer,getActiveRange().startOffset];newEnd=[getActiveRange().endContainer,getActiveRange().endOffset];getActiveRange().setEnd(document.documentElement,0);newEnd[0].splitText(newEnd[1]);getActiveRange().setStart(newStart[0],newStart[1]);getActiveRange().setEnd(newEnd[0],newEnd[1]);}
$_(getAllEffectivelyContainedNodes(getActiveRange(),isEditable)).forEach(function(node){while(isRemoveFormatCandidate(node.parentNode)&&inSameEditingHost(node.parentNode,node)){splitParent([node],getActiveRange());}});$_(["subscript","bold","fontname","fontsize","forecolor","hilitecolor","italic","strikethrough","underline"]).forEach(function(command){setSelectionValue(command,null,range);});}};commands.strikethrough={action:function(value,range){if(myQueryCommandState("strikethrough",range)){setSelectionValue("strikethrough",null,range);}else{setSelectionValue("strikethrough","line-through",range);}},inlineCommandActivatedValues:["line-through"]};commands.subscript={action:function(value,range){var state=myQueryCommandState("subscript",range);setSelectionValue("subscript",null,range);if(!state){setSelectionValue("subscript","subscript",range);}},indeterm:function(){var nodes=getAllEffectivelyContainedNodes(getActiveRange(),function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;});return(($_(nodes).some(function(node){return getEffectiveCommandValue(node,"subscript")=="subscript";})&&$_(nodes).some(function(node){return getEffectiveCommandValue(node,"subscript")!="subscript";}))||$_(nodes).some(function(node){return getEffectiveCommandValue(node,"subscript")=="mixed";}));},inlineCommandActivatedValues:["subscript"]};commands.superscript={action:function(value,range){var state=myQueryCommandState("superscript",range);setSelectionValue("superscript",null,range);if(!state){setSelectionValue("superscript","superscript",range);}},indeterm:function(){var nodes=getAllEffectivelyContainedNodes(getActiveRange(),function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;});return(($_(nodes).some(function(node){return getEffectiveCommandValue(node,"superscript")=="superscript";})&&$_(nodes).some(function(node){return getEffectiveCommandValue(node,"superscript")!="superscript";}))||$_(nodes).some(function(node){return getEffectiveCommandValue(node,"superscript")=="mixed";}));},inlineCommandActivatedValues:["superscript"]};commands.underline={action:function(value,range){if(myQueryCommandState("underline",range)){setSelectionValue("underline",null,range);}else{setSelectionValue("underline","underline",range);}},inlineCommandActivatedValues:["underline"]};commands.unlink={action:function(){var range=getActiveRange();var hyperlinks=[];var node;for(node=range.startContainer;node;node=node.parentNode){if(isNamedHtmlElement(node,'A')&&hasAttribute(node,"href")){hyperlinks.unshift(node);}}
for(node=range.startContainer;node!=nextNodeDescendants(range.endContainer);node=nextNode(node)){if(isNamedHtmlElement(node,'A')&&hasAttribute(node,"href")&&(isContained(node,range)||isAncestor(node,range.endContainer)||node==range.endContainer)){hyperlinks.push(node);}}
var i;for(i=0;i<hyperlinks.length;i++){clearValue(hyperlinks[i],"unlink",range);}},standardInlineValueCommand:true};function isIndentationElement(node){if(!isAnyHtmlElement(node)){return false;}
if(node.tagName=="BLOCKQUOTE"){return true;}
if(node.tagName!="DIV"){return false;}
if(typeof node.style.length!=='undefined'){var i;for(i=0;i<node.style.length;i++){if(/^(-[a-z]+-)?margin/.test(node.style[i])){return true;}}}else{var s;for(s in node.style){if(/^(-[a-z]+-)?margin/.test(s)&&node.style[s]&&node.style[s]!==0){return true;}}}
return false;}
function isSimpleIndentationElement(node){if(!isIndentationElement(node)){return false;}
if(node.tagName!="BLOCKQUOTE"&&node.tagName!="DIV"){return false;}
var i;for(i=0;i<node.attributes.length;i++){if(!isHtmlNamespace(node.attributes[i].namespaceURI)||jQuery.inArray(node.attributes[i].name,["style","class","dir"])==-1){return false;}}
if(typeof node.style.length!=='undefined'){for(i=0;i<node.style.length;i++){if(!/^(-[a-z]+-)?(margin|border|padding)/.test(node.style[i])){return false;}}}else{var s;for(s in node.style){if(!/^(-[a-z]+-)?(margin|border|padding)/.test(s)&&node.style[s]&&node.style[s]!==0&&node.style[s]!=='false'){return false;}}}
return true;}
function isNonListSingleLineContainer(node){return isHtmlElementInArray(node,["address","div","h1","h2","h3","h4","h5","h6","listing","p","pre","xmp"]);}
function isSingleLineContainer(node){return isNonListSingleLineContainer(node)||isHtmlElementInArray(node,["li","dt","dd"]);}
var defaultSingleLineContainerName="p";function isEndBreak(element){return(isNamedHtmlElement(element,'br')&&element.parentNode.lastChild===element);}
function createEndBreak(){return document.createElement("br");}
function ensureContainerEditable(container){if(!container){return;}
if(isEditingHost(container)){return;}
if(isNamedHtmlElement(container.lastChild,"br")){return;}
if($_(container.childNodes).some(isVisible)){return;}
if(!jQuery.browser.msie){container.appendChild(createEndBreak());}else if(jQuery.browser.msie&&jQuery.browser.version<=7&&isHtmlElementInArray(container,["p","h1","h2","h3","h4","h5","h6","pre","blockquote"])){if(!container.firstChild){container.appendChild(document.createTextNode('\u200b'));}}}
function fixDisallowedAncestors(node,range){var i;if(!isEditable(node)){return;}
if($_(getAncestors(node)).every(function(ancestor){return!inSameEditingHost(node,ancestor)||!isAllowedChild(node,ancestor);})&&!isHtmlElement_obsolete(node,defaultSingleLineContainerName)){if(isHtmlElementInArray(node,["dd","dt"])){wrap([node],function(sibling){return isNamedHtmlElement(sibling,'dl')&&!sibling.attributes.length;},function(){return document.createElement("dl");},range);return;}
if(!isProhibitedParagraphChild(node)){return;}
node=setTagName(node,defaultSingleLineContainerName,range);ensureContainerEditable(node);fixDisallowedAncestors(node,range);var descendants=getDescendants(node);for(i=0;i<descendants.length;i++){fixDisallowedAncestors(descendants[i],range);}
return;}
var values=recordValues([node]);var newStartOffset,newEndOffset;while(!isAllowedChild(node,node.parentNode)){for(i=node.parentNode.childNodes.length-1;i>=0;--i){if(node.parentNode.childNodes[i].nodeType==3&&node.parentNode.childNodes[i].data.length==0){node.parentNode.removeChild(node.parentNode.childNodes[i]);if(range.startContainer==node.parentNode&&range.startOffset>i){range.startOffset--;}
if(range.endContainer==node.parentNode&&range.endOffset>i){range.endOffset--;}}}
if(node.parentNode.childNodes.length==1){newStartOffset=range.startOffset;newEndOffset=range.endOffset;if(range.startContainer===node.parentNode&&range.startOffset>getNodeIndex(node)){newStartOffset=range.startOffset+(jQuery(node).contents().length-1);}
if(range.endContainer===node.parentNode&&range.endOffset>getNodeIndex(node)){newEndOffset=range.endOffset+(jQuery(node).contents().length-1);}
jQuery(node).contents().unwrap();range.startOffset=newStartOffset;range.endOffset=newEndOffset;break;}else{var originalParent=node.parentNode;splitParent([node],range);if(originalParent===node.parentNode){newStartOffset=range.startOffset;newEndOffset=range.endOffset;if(range.startContainer===node.parentNode&&range.startOffset>getNodeIndex(node)){newStartOffset=range.startOffset+(jQuery(node).contents().length-1);}
if(range.endContainer===node.parentNode&&range.endOffset>getNodeIndex(node)){newEndOffset=range.endOffset+(jQuery(node).contents().length-1);}
jQuery(node).contents().unwrap();range.startOffset=newStartOffset;range.endOffset=newEndOffset;break;}}}
restoreValues(values,range);}
function normalizeSublists(item,range){if(!isNamedHtmlElement(item,'LI')||!isEditable(item)||!isEditable(item.parentNode)){return;}
var newItem=null;function isOlUl(node){return isHtmlElementInArray(node,["OL","UL"]);}
while($_(item.childNodes).some(isOlUl)){var child=item.lastChild;if(isHtmlElementInArray(child,["OL","UL"])||(!newItem&&child.nodeType==$_.Node.TEXT_NODE&&/^[ \t\n\f\r]*$/.test(child.data))){newItem=null;movePreservingRanges(child,item.parentNode,1+getNodeIndex(item),range);}else{if(!newItem){newItem=item.ownerDocument.createElement("li");item.parentNode.insertBefore(newItem,item.nextSibling);}
movePreservingRanges(child,newItem,0,range);}}}
function unNormalizeSublists(item,range){if(!isHtmlElementInArray(item,["OL","UL"])||!isEditable(item)){return;}
var $list=jQuery(item);$list.children("ol,ul").each(function(index,sublist){if(isNamedHtmlElement(sublist.previousSibling,"LI")){movePreservingRanges(sublist,sublist.previousSibling,sublist.previousSibling.childNodes.length,range);}});}
function blockExtend(range){var startNode=range.startContainer;var startOffset=range.startOffset;var endNode=range.endContainer;var endOffset=range.endOffset;var liAncestors=$_(getAncestors(startNode).concat(startNode)).filter(function(ancestor){return isNamedHtmlElement(ancestor,'li');}).slice(-1);if(liAncestors.length){startOffset=getNodeIndex(liAncestors[0]);startNode=liAncestors[0].parentNode;}
if(!isBlockStartPoint(startNode,startOffset)){do{if(startOffset==0){startOffset=getNodeIndex(startNode);startNode=startNode.parentNode;}else{startOffset--;}}while(!isBlockBoundaryPoint(startNode,startOffset));}
while(startOffset==0&&startNode.parentNode){startOffset=getNodeIndex(startNode);startNode=startNode.parentNode;}
liAncestors=$_(getAncestors(endNode).concat(endNode)).filter(function(ancestor){return isNamedHtmlElement(ancestor,'li');}).slice(-1);if(liAncestors.length){endOffset=1+getNodeIndex(liAncestors[0]);endNode=liAncestors[0].parentNode;}
if(!isBlockEndPoint(endNode,endOffset)){do{if(endOffset==getNodeLength(endNode)){endOffset=1+getNodeIndex(endNode);endNode=endNode.parentNode;}else{endOffset++;}}while(!isBlockBoundaryPoint(endNode,endOffset));}
while(endOffset==getNodeLength(endNode)&&endNode.parentNode){endOffset=1+getNodeIndex(endNode);endNode=endNode.parentNode;}
var newRange=Aloha.createRange();newRange.setStart(startNode,startOffset);newRange.setEnd(endNode,endOffset);return newRange;}
function getSelectionListState(){var newRange=blockExtend(getActiveRange());var nodeList=getContainedNodes(newRange,function(node){return isEditable(node)&&!isIndentationElement(node)&&(isHtmlElementInArray(node,["ol","ul"])||isHtmlElementInArray(node.parentNode,["ol","ul"])||isAllowedChild(node,"li"));});if(!nodeList.length){return"none";}
if($_(nodeList).every(function(node){return(isNamedHtmlElement(node,'ol')||isNamedHtmlElement(node.parentNode,"ol")||(isNamedHtmlElement(node.parentNode,"li")&&isNamedHtmlElement(node.parentNode.parentNode,"ol")));})&&!$_(nodeList).some(function(node){return isNamedHtmlElement(node,'ul')||(node.querySelector&&node.querySelector("ul"));})){return"ol";}
if($_(nodeList).every(function(node){return(isNamedHtmlElement(node,'ul')||isNamedHtmlElement(node.parentNode,"ul")||(isNamedHtmlElement(node.parentNode,"li")&&isNamedHtmlElement(node.parentNode.parentNode,"ul")));})&&!$_(nodeList).some(function(node){return isNamedHtmlElement(node,'ol')||(node.querySelector&&node.querySelector("ol"));})){return"ul";}
var hasOl=$_(nodeList).some(function(node){return(isNamedHtmlElement(node,'ol')||isNamedHtmlElement(node.parentNode,"ol")||(node.querySelector&&node.querySelector("ol"))||(isNamedHtmlElement(node.parentNode,"li")&&isNamedHtmlElement(node.parentNode.parentNode,"ol")));});var hasUl=$_(nodeList).some(function(node){return(isNamedHtmlElement(node,'ul')||isNamedHtmlElement(node.parentNode,"ul")||(node.querySelector&&node.querySelector("ul"))||(isNamedHtmlElement(node.parentNode,"li")&&isNamedHtmlElement(node.parentNode.parentNode,"ul")));});if(hasOl&&hasUl){return"mixed";}
if(hasOl){return"mixed ol";}
if(hasUl){return"mixed ul";}
return"none";}
function getAlignmentValue(node){while((node&&node.nodeType!=$_.Node.ELEMENT_NODE)||(node.nodeType==$_.Node.ELEMENT_NODE&&jQuery.inArray($_.getComputedStyle(node).display,["inline","none"])!=-1)){node=node.parentNode;}
if(!node||node.nodeType!=$_.Node.ELEMENT_NODE){return"left";}
var resolvedValue=$_.getComputedStyle(node).textAlign.replace(/^-(moz|webkit)-/,"").replace(/^auto$/,"start");if(resolvedValue=="start"){return getDirectionality(node)=="ltr"?"left":"right";}
if(resolvedValue=="end"){return getDirectionality(node)=="ltr"?"right":"left";}
if(jQuery.inArray(resolvedValue,["center","justify","left","right"])!=-1){return resolvedValue;}
return"left";}
function recordCurrentOverrides(range){var overrides=[];if(getValueOverride("createlink",range)!==undefined){overrides.push(["createlink",getValueOverride("createlink",range)]);}
$_(["bold","italic","strikethrough","subscript","superscript","underline"]).forEach(function(command){if(getStateOverride(command,range)!==undefined){overrides.push([command,getStateOverride(command,range)]);}});$_(["fontname","fontsize","forecolor","hilitecolor"]).forEach(function(command){if(getValueOverride(command,range)!==undefined){overrides.push([command,getValueOverride(command,range)]);}});return overrides;}
function recordCurrentStatesAndValues(range){var overrides=[];var node=$_(getAllEffectivelyContainedNodes(range)).filter(function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;})[0];if(!node){return overrides;}
overrides.push(["createlink",commands.createlink.value(range)]);$_(["bold","italic","strikethrough","subscript","superscript","underline"]).forEach(function(command){if($_(commands[command].inlineCommandActivatedValues).indexOf(getEffectiveCommandValue(node,command))!=-1){overrides.push([command,true]);}else{overrides.push([command,false]);}});$_(["fontname","fontsize","forecolor","hilitecolor"]).forEach(function(command){overrides.push([command,commands[command].value(range)]);});overrides.push(["fontsize",getEffectiveCommandValue(node,"fontsize")]);return overrides;}
function restoreStatesAndValues(overrides,range){var i;var command;var override;var node=$_(getAllEffectivelyContainedNodes(range)).filter(function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;})[0];function isEditableTextNode(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;}
if(node){for(i=0;i<overrides.length;i++){command=overrides[i][0];override=overrides[i][1];if(typeof override=="boolean"&&myQueryCommandState(command,range)!=override){myExecCommand(command,false,override,range);}else if(typeof override=="string"&&command!="fontsize"&&!areEquivalentValues(command,myQueryCommandValue(command,range),override)){myExecCommand(command,false,override,range);}else if(typeof override=="string"&&command=="fontsize"&&((getValueOverride("fontsize",range)!==undefined&&getValueOverride("fontsize",range)!==override)||(getValueOverride("fontsize",range)===undefined&&!areLooselyEquivalentValues(command,getEffectiveCommandValue(node,"fontsize"),override)))){myExecCommand("fontsize",false,override,range);}else{continue;}
node=$_(getAllEffectivelyContainedNodes(range)).filter(isEditableTextNode)[0]||node;}}else{for(i=0;i<overrides.length;i++){command=overrides[i][0];override=overrides[i][1];if(typeof override=="boolean"){setStateOverride(command,override,range);}
if(typeof override=="string"){setValueOverride(command,override,range);}}}}
function canonicalSpaceSequence(n,nonBreakingStart,nonBreakingEnd){if(n==0){return"";}
if(n==1&&!nonBreakingStart&&!nonBreakingEnd){return" ";}
if(n==1){return"\xa0";}
var buffer="";var repeatedPair;if(nonBreakingStart){repeatedPair="\xa0 ";}else{repeatedPair=" \xa0";}
while(n>3){buffer+=repeatedPair;n-=2;}
if(n==3){buffer+=!nonBreakingStart&&!nonBreakingEnd?" \xa0 ":nonBreakingStart&&!nonBreakingEnd?"\xa0\xa0 ":!nonBreakingStart&&nonBreakingEnd?" \xa0\xa0":nonBreakingStart&&nonBreakingEnd?"\xa0 \xa0":"impossible";}else{buffer+=!nonBreakingStart&&!nonBreakingEnd?"\xa0 ":nonBreakingStart&&!nonBreakingEnd?"\xa0 ":!nonBreakingStart&&nonBreakingEnd?" \xa0":nonBreakingStart&&nonBreakingEnd?"\xa0\xa0":"impossible";}
return buffer;}
function canonicalizeWhitespace(node,offset){if(!isEditable(node)&&!isEditingHost(node)){return;}
var startNode=node;var startOffset=offset;while(true){if(0<=startOffset-1&&inSameEditingHost(startNode,startNode.childNodes[startOffset-1])){startNode=startNode.childNodes[startOffset-1];startOffset=getNodeLength(startNode);}else if(startOffset==0&&!followsLineBreak(startNode)&&inSameEditingHost(startNode,startNode.parentNode)){startOffset=getNodeIndex(startNode);startNode=startNode.parentNode;}else if(startNode.nodeType==$_.Node.TEXT_NODE&&jQuery.inArray($_.getComputedStyle(startNode.parentNode).whiteSpace,["pre","pre-wrap"])==-1&&startOffset!=0&&/[ \xa0]/.test(startNode.data[startOffset-1])){startOffset--;}else{break;}}
var endNode=startNode;var endOffset=startOffset;var length=0;var followsSpace=false;while(true){if(endOffset<endNode.childNodes.length&&inSameEditingHost(endNode,endNode.childNodes[endOffset])){endNode=endNode.childNodes[endOffset];endOffset=0;}else if(endOffset==getNodeLength(endNode)&&!precedesLineBreak(endNode)&&inSameEditingHost(endNode,endNode.parentNode)){endOffset=1+getNodeIndex(endNode);endNode=endNode.parentNode;}else if(endNode.nodeType==$_.Node.TEXT_NODE&&jQuery.inArray($_.getComputedStyle(endNode.parentNode).whiteSpace,["pre","pre-wrap"])==-1&&endOffset!=getNodeLength(endNode)&&/[ \xa0]/.test(endNode.data[endOffset])){if(followsSpace&&" "==endNode.data[endOffset]){endNode.deleteData(endOffset,1);continue;}
followsSpace=" "==endNode.data[endOffset];endOffset++;length++;}else{break;}}
var replacementWhitespace=canonicalSpaceSequence(length,startOffset==0&&followsLineBreak(startNode),endOffset==getNodeLength(endNode)&&precedesLineBreak(endNode));while(getPosition(startNode,startOffset,endNode,endOffset)=="before"){if(startOffset<startNode.childNodes.length){startNode=startNode.childNodes[startOffset];startOffset=0;}else if(startNode.nodeType!=$_.Node.TEXT_NODE||startOffset==getNodeLength(startNode)){startOffset=1+getNodeIndex(startNode);startNode=startNode.parentNode;}else{var element=replacementWhitespace[0];replacementWhitespace=replacementWhitespace.slice(1);if(element!=startNode.data[startOffset]){startNode.insertData(startOffset,element);startNode.deleteData(startOffset+1,1);}
startOffset++;}}}
function deleteContents(arg1,arg2,arg3,arg4,arg5){var range;var flags={};var i;if(arguments.length<3){range=arg1;}else{range=Aloha.createRange();range.setStart(arg1,arg2);range.setEnd(arg3,arg4);}
if(arguments.length==2){flags=arg2;}
if(arguments.length==5){flags=arg5;}
var blockMerging=null!=flags.blockMerging?!!flags.blockMerging:true;var stripWrappers=null!=flags.stripWrappers?!!flags.stripWrappers:true;if(!range){return;}
var startNode=range.startContainer;var startOffset=range.startOffset;var endNode=range.endContainer;var endOffset=range.endOffset;var referenceNode;while(startNode.hasChildNodes()){if(startOffset==getNodeLength(startNode)&&inSameEditingHost(startNode,startNode.parentNode)&&isInlineNode(startNode)){startOffset=1+getNodeIndex(startNode);startNode=startNode.parentNode;continue;}
if(startOffset==getNodeLength(startNode)){break;}
referenceNode=startNode.childNodes[startOffset];if(isBlockNode(referenceNode)||(referenceNode.nodeType==$_.Node.ELEMENT_NODE&&!referenceNode.hasChildNodes())||(referenceNode.nodeType!=$_.Node.ELEMENT_NODE&&referenceNode.nodeType!=$_.Node.TEXT_NODE)){break;}
startNode=referenceNode;startOffset=0;}
while(endNode.hasChildNodes()){if(endOffset==0&&inSameEditingHost(endNode,endNode.parentNode)&&isInlineNode(endNode)){endOffset=getNodeIndex(endNode);endNode=endNode.parentNode;continue;}
if(endOffset==0){break;}
referenceNode=endNode.childNodes[endOffset-1];if(isBlockNode(referenceNode)||(referenceNode.nodeType==$_.Node.ELEMENT_NODE&&!referenceNode.hasChildNodes())||(referenceNode.nodeType!=$_.Node.ELEMENT_NODE&&referenceNode.nodeType!=$_.Node.TEXT_NODE)){break;}
endNode=referenceNode;endOffset=getNodeLength(referenceNode);}
if(getPosition(endNode,endOffset,startNode,startOffset)!=="after"){range.setEnd(range.startContainer,range.startOffset);return range;}
if(endNode.nodeType==$_.Node.TEXT_NODE&&endOffset==getNodeLength(endNode)&&startNode!=endNode){endOffset=1+getNodeIndex(endNode);endNode=endNode.parentNode;}
range.setStart(startNode,startOffset);range.setEnd(endNode,endOffset);var startBlock=range.startContainer;while(inSameEditingHost(startBlock,startBlock.parentNode)&&isInlineNode(startBlock)){startBlock=startBlock.parentNode;}
if((!isBlockNode(startBlock)&&!isEditingHost(startBlock))||!isAllowedChild("span",startBlock)||isHtmlElementInArray(startBlock,["td","th"])){startBlock=null;}
var endBlock=range.endContainer;while(inSameEditingHost(endBlock,endBlock.parentNode)&&isInlineNode(endBlock)){endBlock=endBlock.parentNode;}
if((!isBlockNode(endBlock)&&!isEditingHost(endBlock))||!isAllowedChild("span",endBlock)||isHtmlElementInArray(endBlock,["td","th"])){endBlock=null;}
var overrides=recordCurrentStatesAndValues(range);var parent_;if(startNode==endNode&&isEditable(startNode)&&startNode.nodeType==$_.Node.TEXT_NODE){parent_=startNode.parentNode;startNode.deleteData(startOffset,endOffset-startOffset);if(startOffset>0&&startNode.data.substr(startOffset-1,1)===' '&&startOffset<startNode.data.length&&startNode.data.substr(startOffset,1)===' '){startNode.replaceData(startOffset-1,1,'\xa0');}
canonicalizeWhitespace(startNode,startOffset);range.setStart(range.startContainer,range.startOffset);range.setEnd(range.startContainer,range.startOffset);restoreStatesAndValues(overrides,range);if((isEditable(parent_)||isEditingHost(parent_))&&!isInlineNode(parent_)){ensureContainerEditable(parent_);}
return range;}
if(isEditable(startNode)&&startNode.nodeType==$_.Node.TEXT_NODE){startNode.deleteData(startOffset,getNodeLength(startNode)-startOffset);}
var nodeList=getContainedNodes(range,function(node){return isEditable(node)&&!isHtmlElementInArray(node,["thead","tbody","tfoot","tr","th","td"]);});for(i=0;i<nodeList.length;i++){var node=nodeList[i];parent_=node.parentNode;parent_.removeChild(node);if(stripWrappers||(!isAncestor(parent_,startNode)&&parent_!=startNode)){while(isEditable(parent_)&&isInlineNode(parent_)&&getNodeLength(parent_)==0){var grandparent=parent_.parentNode;grandparent.removeChild(parent_);parent_=grandparent;}}
if((isEditable(parent_)||isEditingHost(parent_))&&!isInlineNode(parent_)){ensureContainerEditable(parent_);}}
if(isEditable(endNode)&&endNode.nodeType==$_.Node.TEXT_NODE){endNode.deleteData(0,endOffset);}
canonicalizeWhitespace(range.startContainer,range.startOffset);canonicalizeWhitespace(range.endContainer,range.endOffset);var pos;if(!blockMerging||!startBlock||!endBlock||!inSameEditingHost(startBlock,endBlock)||startBlock==endBlock){range.setEnd(range.startContainer,range.startOffset);var block=startBlock||endBlock;if(isEmptyOnlyChildOfEditingHost(block)){pos=removeNode(block);range.setStart(pos.node,pos.offset);range.setEnd(pos.node,pos.offset);}
restoreStatesAndValues(overrides,range);return range;}
if(startBlock.children.length==1&&isCollapsedBlockProp(startBlock.firstChild)){startBlock.removeChild(startBlock.firstChild);}
if(endBlock.children.length==1&&isCollapsedBlockProp(endBlock.firstChild)){endBlock.removeChild(endBlock.firstChild);}
var values;if(isAncestor(startBlock,endBlock)){referenceNode=endBlock;while(referenceNode.parentNode!=startBlock){referenceNode=referenceNode.parentNode;}
range.setStart(startBlock,getNodeIndex(referenceNode));range.setEnd(startBlock,getNodeIndex(referenceNode));if(!endBlock.hasChildNodes()){while(isEditable(endBlock)&&endBlock.parentNode.childNodes.length==1&&endBlock.parentNode!=startBlock){parent_=endBlock;parent_.removeChild(endBlock);endBlock=parent_;}
if(isEditable(endBlock)&&!isInlineNode(endBlock)&&isInlineNode(endBlock.previousSibling)&&isInlineNode(endBlock.nextSibling)){endBlock.parentNode.insertBefore(document.createElement("br"),endBlock.nextSibling);}
if(isEditable(endBlock)){endBlock.parentNode.removeChild(endBlock);}
restoreStatesAndValues(overrides,range);return range;}
if(!isInlineNode(endBlock.firstChild)){restoreStatesAndValues(overrides,range);return range;}
var children=[];children.push(endBlock.firstChild);while(!isNamedHtmlElement(children[children.length-1],"br")&&isInlineNode(children[children.length-1].nextSibling)){children.push(children[children.length-1].nextSibling);}
values=recordValues(children);while(children[0].parentNode!=startBlock){splitParent(children,range);}
if(isEditable(children[0].previousSibling)&&isNamedHtmlElement(children[0].previousSibling,"br")){children[0].parentNode.removeChild(children[0].previousSibling);}}else if(isDescendant(startBlock,endBlock)){range.setStart(startBlock,getNodeLength(startBlock));range.setEnd(startBlock,getNodeLength(startBlock));referenceNode=startBlock;while(referenceNode.parentNode!=endBlock){referenceNode=referenceNode.parentNode;}
if(isInlineNode(referenceNode.nextSibling)&&isNamedHtmlElement(startBlock.lastChild,"br")){startBlock.removeChild(startBlock.lastChild);}
var nodesToMove=[];if(referenceNode.nextSibling&&!isNamedHtmlElement(referenceNode.nextSibling,"br")&&!isBlockNode(referenceNode.nextSibling)){nodesToMove.push(referenceNode.nextSibling);}
if(nodesToMove.length&&nodesToMove[nodesToMove.length-1].nextSibling&&!isNamedHtmlElement(nodesToMove[nodesToMove.length-1].nextSibling,"br")&&!isBlockNode(nodesToMove[nodesToMove.length-1].nextSibling)){nodesToMove.push(nodesToMove[nodesToMove.length-1].nextSibling);}
values=recordValues(nodesToMove);$_(nodesToMove).forEach(function(node){movePreservingRanges(node,startBlock,-1,range);});if(isNamedHtmlElement(referenceNode.nextSibling,"br")){referenceNode.parentNode.removeChild(referenceNode.nextSibling);}}else{range.setStart(startBlock,getNodeLength(startBlock));range.setEnd(startBlock,getNodeLength(startBlock));if(isInlineNode(endBlock.firstChild)&&isNamedHtmlElement(startBlock.lastChild,"br")){startBlock.removeChild(startBlock.lastChild);}
values=recordValues([].slice.call(toArray(endBlock.childNodes)));while(endBlock.hasChildNodes()){movePreservingRanges(endBlock.firstChild,startBlock,-1,range);}
while(!endBlock.hasChildNodes()){parent_=endBlock.parentNode;parent_.removeChild(endBlock);endBlock=parent_;}}
restoreValues(values,range);if(isEmptyOnlyChildOfEditingHost(startBlock)){pos=removeNode(startBlock);range.setStart(pos.node,pos.offset);range.setEnd(pos.node,pos.offset);startBlock=pos.node;}
ensureContainerEditable(startBlock);restoreStatesAndValues(overrides,range);return range;}
function removePreservingDescendants(node,range){if(node.hasChildNodes()){splitParent([].slice.call(toArray(node.childNodes)),range);}else{node.parentNode.removeChild(node);}}
function cleanLists(node,range){if(node){jQuery(node).find('ul,ol,li').each(function(){jQuery(this).contents().each(function(){if(isWhitespaceNode(this)){var index=getNodeIndex(this);if(range.startContainer===this.parentNode&&range.startOffset>index){range.startOffset--;}else if(range.startContainer===this){range.startContainer=this.parentNode;range.startOffset=index;}
if(range.endContainer===this.parentNode&&range.endOffset>index){range.endOffset--;}else if(range.endContainer===this){range.endContainer=this.parentNode;range.endOffset=index;}
jQuery(this).remove();}});});}}
function indentNodes(nodeList,range){if(!nodeList.length){return;}
var firstNode=nodeList[0];if(isHtmlElementInArray(firstNode.parentNode,["OL","UL"])){var tag=firstNode.parentNode.tagName;wrap(nodeList,function(node){return isHtmlElement_obsolete(node,tag);},function(){return firstNode.ownerDocument.createElement(tag);},range);return;}
var newParent=wrap(nodeList,function(node){return isSimpleIndentationElement(node);},function(){return firstNode.ownerDocument.createElement("blockquote");},range);fixDisallowedAncestors(newParent,range);}
function outdentNode(node,range){if(!isEditable(node)){return;}
if(isSimpleIndentationElement(node)){removePreservingDescendants(node,range);return;}
if(isIndentationElement(node)){node.removeAttribute("class");node.removeAttribute("dir");node.style.margin="";node.style.padding="";node.style.border="";if(node.getAttribute("style")==""){node.removeAttribute("style");}
setTagName(node,"div",range);return;}
var currentAncestor=node.parentNode;var ancestorList=[];while(isEditable(currentAncestor)&&currentAncestor.nodeType==$_.Node.ELEMENT_NODE&&!isSimpleIndentationElement(currentAncestor)&&!isHtmlElementInArray(currentAncestor,["ol","ul"])){ancestorList.push(currentAncestor);currentAncestor=currentAncestor.parentNode;}
if(!isEditable(currentAncestor)||!isSimpleIndentationElement(currentAncestor)){currentAncestor=node.parentNode;ancestorList=[];while(isEditable(currentAncestor)&&currentAncestor.nodeType==$_.Node.ELEMENT_NODE&&!isIndentationElement(currentAncestor)&&!isHtmlElementInArray(currentAncestor,["ol","ul"])){ancestorList.push(currentAncestor);currentAncestor=currentAncestor.parentNode;}}
if(isHtmlElementInArray(node,["OL","UL"])&&(!isEditable(currentAncestor)||!isIndentationElement(currentAncestor))){node.removeAttribute("reversed");node.removeAttribute("start");node.removeAttribute("type");var children=[].slice.call(toArray(node.childNodes));if(node.attributes.length&&!isHtmlElementInArray(node.parentNode,["OL","UL"])){setTagName(node,"div",range);}else{var values=recordValues([].slice.call(toArray(node.childNodes)));removePreservingDescendants(node,range);restoreValues(values,range);}
var i;for(i=0;i<children.length;i++){fixDisallowedAncestors(children[i],range);}
return;}
if(!isEditable(currentAncestor)||!isIndentationElement(currentAncestor)){return;}
ancestorList.push(currentAncestor);var originalAncestor=currentAncestor;while(ancestorList.length){currentAncestor=ancestorList.pop();var target=node.parentNode==currentAncestor?node:ancestorList[ancestorList.length-1];if(isInlineNode(target)&&!isNamedHtmlElement(target,'BR')&&isNamedHtmlElement(target.nextSibling,"BR")){target.parentNode.removeChild(target.nextSibling);}
var precedingSiblings=[].slice.call(toArray(currentAncestor.childNodes),0,getNodeIndex(target));var followingSiblings=[].slice.call(toArray(currentAncestor.childNodes),1+getNodeIndex(target));indentNodes(precedingSiblings,range);indentNodes(followingSiblings,range);}
outdentNode(originalAncestor,range);}
function toggleLists(tagName,range){var mode=getSelectionListState()==tagName?"disable":"enable";tagName=tagName.toUpperCase();var otherTagName=tagName=="OL"?"UL":"OL";var items=[];(function(){var ancestorContainer;for(ancestorContainer=range.endContainer;ancestorContainer!=range.commonAncestorContainer;ancestorContainer=ancestorContainer.parentNode){if(isNamedHtmlElement(ancestorContainer,"li")){items.unshift(ancestorContainer);}}
for(ancestorContainer=range.startContainer;ancestorContainer;ancestorContainer=ancestorContainer.parentNode){if(isNamedHtmlElement(ancestorContainer,"li")){items.unshift(ancestorContainer);}}}());$_(items).forEach(function(thisArg){normalizeSublists(thisArg,range);});var newRange=blockExtend(range);if(mode=="enable"){$_(getAllContainedNodes(newRange,function(node){return isEditable(node)&&isHtmlElement_obsolete(node,otherTagName);})).forEach(function(list){if((isEditable(list.previousSibling)&&isHtmlElement_obsolete(list.previousSibling,tagName))||(isEditable(list.nextSibling)&&isHtmlElement_obsolete(list.nextSibling,tagName))){var children=[].slice.call(toArray(list.childNodes));var values=recordValues(children);splitParent(children,range);wrap(children,function(node){return isHtmlElement_obsolete(node,tagName);},function(){return null;},range);restoreValues(values,range);}else{setTagName(list,tagName,range);}});}
var nodeList=getContainedNodes(newRange,function(node){return isEditable(node)&&!isIndentationElement(node)&&(isHtmlElementInArray(node,["OL","UL"])||isHtmlElementInArray(node.parentNode,["OL","UL"])||isAllowedChild(node,"li"));});if(mode=="enable"){nodeList=$_(nodeList).filter(function(node){return!isHtmlElementInArray(node,["ol","ul"])||isHtmlElementInArray(node.parentNode,["ol","ul"]);});}
var sublist,values;function createLi(){return document.createElement("li");}
function isOlUl(node){return isHtmlElementInArray(node,["ol","ul"]);}
function makeIsElementPred(tagName){return function(node){return isHtmlElement_obsolete(node,tagName);};}
function makeCreateElement(tagName){return function(){return document.createElement(tagName);};}
function makeCreateElementSublist(tagName,sublist,range){return function(){if(!isEditable(sublist[0].parentNode)||!isSimpleIndentationElement(sublist[0].parentNode)||!isEditable(sublist[0].parentNode.previousSibling)||!isHtmlElement_obsolete(sublist[0].parentNode.previousSibling,tagName)){return document.createElement(tagName);}
var list=sublist[0].parentNode.previousSibling;normalizeSublists(list.lastChild,range);if(!isEditable(list.lastChild)||!isHtmlElement_obsolete(list.lastChild,tagName)){list.appendChild(document.createElement(tagName));}
return list.lastChild;};}
if(mode=="disable"){while(nodeList.length){sublist=[];sublist.push(nodeList.shift());if(isHtmlElement_obsolete(sublist[0],tagName)){outdentNode(sublist[0],range);continue;}
while(nodeList.length&&nodeList[0]==sublist[sublist.length-1].nextSibling&&!isHtmlElement_obsolete(nodeList[0],tagName)){sublist.push(nodeList.shift());}
values=recordValues(sublist);splitParent(sublist,range);var i;for(i=0;i<sublist.length;i++){fixDisallowedAncestors(sublist[i],range);}
restoreValues(values,range);}}else{while(nodeList.length){sublist=[];while(!sublist.length||(nodeList.length&&nodeList[0]==sublist[sublist.length-1].nextSibling)){if(isHtmlElementInArray(nodeList[0],["p","div"])){sublist.push(setTagName(nodeList[0],"li",range));nodeList.shift();}else if(isHtmlElementInArray(nodeList[0],["li","ol","ul"])){sublist.push(nodeList.shift());}else{var nodesToWrap=[];while(!nodesToWrap.length||(nodeList.length&&nodeList[0]==nodesToWrap[nodesToWrap.length-1].nextSibling&&isInlineNode(nodeList[0])&&isInlineNode(nodesToWrap[nodesToWrap.length-1])&&!isNamedHtmlElement(nodesToWrap[nodesToWrap.length-1],"br"))){nodesToWrap.push(nodeList.shift());}
sublist.push(wrap(nodesToWrap,undefined,createLi,range));}}
if(isHtmlElement_obsolete(sublist[0].parentNode,tagName)||$_(sublist).every(isOlUl)){continue;}
if(isHtmlElement_obsolete(sublist[0].parentNode,otherTagName)){values=recordValues(sublist);splitParent(sublist,range);wrap(sublist,makeIsElementPred(tagName),makeCreateElement(tagName),range);restoreValues(values,range);continue;}
fixDisallowedAncestors(wrap(sublist,makeIsElementPred(tagName),makeCreateElementSublist(tagName,sublist,range),range),range);}}}
function justifySelection(alignment,range){var newRange=blockExtend(range);var elementList=getAllContainedNodes(newRange,function(node){return node.nodeType==$_.Node.ELEMENT_NODE&&isEditable(node)&&(hasAttribute(node,"align")||node.style.textAlign!=""||isNamedHtmlElement(node,'center'));});var i;for(i=0;i<elementList.length;i++){var element=elementList[i];element.removeAttribute("align");element.style.textAlign="";if(element.getAttribute("style")==""){element.removeAttribute("style");}
if(isHtmlElementInArray(element,["div","span","center"])&&!element.attributes.length){removePreservingDescendants(element,range);}
if(isNamedHtmlElement(element,'center')&&element.attributes.length){setTagName(element,"div",range);}}
newRange=blockExtend(globalRange);var nodeList=[];nodeList=getContainedNodes(newRange,function(node){return isEditable(node)&&isAllowedChild(node,"div")&&getAlignmentValue(node)!=alignment;});function makeIsAlignedDiv(alignment){return function(node){return isNamedHtmlElement(node,'div')&&$_(node.attributes).every(function(attr){return(attr.name=="align"&&attr.value.toLowerCase()==alignment)||(attr.name=="style"&&getStyleLength(node)==1&&node.style.textAlign==alignment);});};}
function makeCreateAlignedDiv(alignment){return function(){var newParent=document.createElement("div");newParent.setAttribute("style","text-align: "+alignment);return newParent;};}
while(nodeList.length){var sublist=[];sublist.push(nodeList.shift());while(nodeList.length&&nodeList[0]==sublist[sublist.length-1].nextSibling){sublist.push(nodeList.shift());}
wrap(sublist,makeIsAlignedDiv(alignment),makeCreateAlignedDiv(alignment),range);}}
function moveOverZWSP(range,forward){var offset;if(!range.collapsed){return;}
offset=range.startOffset;if(forward){if(range.startContainer&&range.startContainer.nodeType===$_.Node.TEXT_NODE){while(offset<range.startContainer.data.length&&range.startContainer.data.charAt(offset)==='\u200b'){offset++;}}}else{if(range.startContainer&&range.startContainer.nodeType===$_.Node.TEXT_NODE){while(offset>0&&range.startContainer.data.charAt(offset-1)==='\u200b'){offset--;}}}
if(offset!==range.startOffset){range.setStart(range.startContainer,offset);range.setEnd(range.startContainer,offset);}}
commands["delete"]={action:function(value,range){var i;if(jQuery.browser.msie&&jQuery.browser.version<=7){moveOverZWSP(range,false);}
if(!range.collapsed){deleteContents(range);return;}
canonicalizeWhitespace(range.startContainer,range.startOffset);var node=range.startContainer;var offset=range.startOffset;var isBr=false;var isHr=false;while(true){if(offset>0){isBr=isNamedHtmlElement(node.childNodes[offset-1],"br")||false;isHr=isNamedHtmlElement(node.childNodes[offset-1],"hr")||false;}
if(offset==0&&isEditable(node.previousSibling)&&isInvisible(node.previousSibling)){node.parentNode.removeChild(node.previousSibling);continue;}
if(0<=offset-1&&offset-1<node.childNodes.length&&isEditable(node.childNodes[offset-1])&&(isInvisible(node.childNodes[offset-1])||isBr||isHr)){node.removeChild(node.childNodes[offset-1]);offset--;if(isBr||isHr){range.setStart(node,offset);range.setEnd(node,offset);return;}
continue;}
if((offset==0&&isInlineNode(node))||isInvisible(node)){offset=getNodeIndex(node);node=node.parentNode;continue;}
if(0<=offset-1&&offset-1<node.childNodes.length&&isEditable(node.childNodes[offset-1])&&isNamedHtmlElement(node.childNodes[offset-1],"a")){removePreservingDescendants(node.childNodes[offset-1],range);return;}
if(0<=offset-1&&offset-1<node.childNodes.length&&!isBlockNode(node.childNodes[offset-1])&&!isHtmlElementInArray(node.childNodes[offset-1],["br","img"])){node=node.childNodes[offset-1];offset=getNodeLength(node);continue;}
var brk=true;if(brk){break;}}
var delBlock=getBlockAtPreviousPosition(node,offset);if(delBlock){delBlock.parentNode.removeChild(delBlock);return;}
if(node.nodeType==$_.Node.TEXT_NODE&&offset!=0){range.setStart(node,offset-1);range.setEnd(node,offset-1);deleteContents(node,offset-1,node,offset);return;}
if(node.nodeType==$_.Node.TEXT_NODE&&offset==0&&jQuery.browser.msie){offset=1;range.setStart(node,offset);range.setEnd(node,offset);range.startOffset=0;deleteContents(range);return;}
if(isInlineNode(node)){return;}
if(0<=offset-1&&offset-1<node.childNodes.length&&isHtmlElementInArray(node.childNodes[offset-1],["br","hr","img"])){range.setStart(node,offset);range.setEnd(node,offset);deleteContents(range);return;}
if(isHtmlElementInArray(node,["li","dt","dd"])&&node==node.parentNode.firstChild&&offset==0){var items=[];var ancestor;for(ancestor=node.parentNode;ancestor;ancestor=ancestor.parentNode){if(isNamedHtmlElement(ancestor,'li')){items.unshift(ancestor);}}
for(i=0;i<items.length;i++){normalizeSublists(items[i],range);}
var values=recordValues([node]);splitParent([node],range);restoreValues(values,range);if(isHtmlElementInArray(node,["dd","dt"])&&$_(getAncestors(node)).every(function(ancestor){return!inSameEditingHost(node,ancestor)||!isAllowedChild(node,ancestor);})){node=setTagName(node,defaultSingleLineContainerName,range);}
fixDisallowedAncestors(node,range);for(i=0;i<items.length;i++){unNormalizeSublists(items[i].parentNode,range);}
return;}
var startNode=node;var startOffset=offset;while(true){if(startOffset==0){startOffset=getNodeIndex(startNode);startNode=startNode.parentNode;}else if(0<=startOffset-1&&startOffset-1<startNode.childNodes.length&&isEditable(startNode.childNodes[startOffset-1])&&isInvisible(startNode.childNodes[startOffset-1])){startNode.removeChild(startNode.childNodes[startOffset-1]);startOffset--;}else{break;}}
if(offset==0&&$_(getAncestors(node).concat(node)).filter(function(ancestor){return isEditable(ancestor)&&inSameEditingHost(ancestor,node)&&isIndentationElement(ancestor);}).length){var newRange=Aloha.createRange();newRange.setStart(node,0);newRange.setEnd(node,0);newRange=blockExtend(newRange);var nodeList=getContainedNodes(newRange,function(currentNode){return isEditable(currentNode)&&!hasEditableDescendants(currentNode);});for(i=0;i<nodeList.length;i++){outdentNode(nodeList[i],range);}
return;}
if(isNamedHtmlElement(startNode.childNodes[startOffset],"table")){return;}
if(0<=startOffset-1&&startOffset-1<startNode.childNodes.length&&isNamedHtmlElement(startNode.childNodes[startOffset-1],"table")){range.setStart(startNode,startOffset-1);range.setEnd(startNode,startOffset);return;}
if(offset==0&&(isNamedHtmlElement(startNode.childNodes[startOffset-1],"hr")||(isNamedHtmlElement(startNode.childNodes[startOffset-1],"br")&&(isNamedHtmlElement(startNode.childNodes[startOffset-1].previousSibling,"br")||!isInlineNode(startNode.childNodes[startOffset-1].previousSibling))))){range.setStart(node,offset);range.setEnd(node,offset);deleteContents(startNode,startOffset-1,startNode,startOffset);return;}
if(isHtmlElementInArray(startNode.childNodes[startOffset],["li","dt","dd"])&&isInlineNode(startNode.childNodes[startOffset].firstChild)&&startOffset!=0){var previousItem=startNode.childNodes[startOffset-1];if(isInlineNode(previousItem.lastChild)&&!isNamedHtmlElement(previousItem.lastChild,"br")){previousItem.appendChild(document.createElement("br"));}
if(isInlineNode(previousItem.lastChild)){previousItem.appendChild(document.createElement("br"));}}
if(isHtmlElementInArray(startNode.childNodes[startOffset],["li","dt","dd"])&&isHtmlElementInArray(startNode.childNodes[startOffset-1],["li","dt","dd"])){startNode=startNode.childNodes[startOffset-1];startOffset=getNodeLength(startNode);node=startNode.nextSibling;offset=0;}else{while(0<=startOffset-1&&startOffset-1<startNode.childNodes.length){if(isEditable(startNode.childNodes[startOffset-1])&&isInvisible(startNode.childNodes[startOffset-1])){startNode.removeChild(startNode.childNodes[startOffset-1]);startOffset--;}else{startNode=startNode.childNodes[startOffset-1];startOffset=getNodeLength(startNode);}}}
var delRange=Aloha.createRange();delRange.setStart(startNode,startOffset);delRange.setEnd(node,offset);deleteContents(delRange);if(!isAncestorContainer(document.body,range.startContainer)){if(delRange.startContainer.hasChildNodes()||delRange.startContainer.nodeType==$_.Node.TEXT_NODE||isEditingHost(delRange.startContainer)){range.setStart(delRange.startContainer,delRange.startOffset);range.setEnd(delRange.startContainer,delRange.startOffset);}else{range.setStart(delRange.startContainer.parentNode,getNodeIndex(delRange.startContainer));range.setEnd(delRange.startContainer.parentNode,getNodeIndex(delRange.startContainer));}}}};var formattableBlockNames=["address","dd","div","dt","h1","h2","h3","h4","h5","h6","p","pre"];commands.formatblock={action:function(value){var i;if(/^<.*>$/.test(value)){value=value.slice(1,-1);}
value=value.toLowerCase();if($_(formattableBlockNames).indexOf(value)==-1){return;}
var newRange=blockExtend(getActiveRange());var nodeList=getContainedNodes(newRange,function(node){return isEditable(node)&&(isNonListSingleLineContainer(node)||isAllowedChild(node,"p")||isHtmlElementInArray(node,["dd","dt"]))&&!$_(getDescendants(node)).some(isProhibitedParagraphChild);});var values=recordValues(nodeList);function makeIsEditableElementInSameEditingHostDoesNotContainProhibitedParagraphChildren(node){return function(ancestor){return(isEditable(ancestor)&&inSameEditingHost(ancestor,node)&&isHtmlElement_obsolete(ancestor,formattableBlockNames)&&!$_(getDescendants(ancestor)).some(isProhibitedParagraphChild));};}
function makeIsElementWithoutAttributes(value){return function(node){return isHtmlElement_obsolete(node,value)&&!node.attributes.length;};}
function returnFalse(){return false;}
function makeCreateElement(value){return function(){return document.createElement(value);};}
for(i=0;i<nodeList.length;i++){var node=nodeList[i];while($_(getAncestors(node)).some(makeIsEditableElementInSameEditingHostDoesNotContainProhibitedParagraphChildren(node))){splitParent([node],newRange);}}
restoreValues(values,newRange);while(nodeList.length){var sublist;if(isSingleLineContainer(nodeList[0])){sublist=[].slice.call(toArray(nodeList[0].childNodes));values=recordValues(sublist);removePreservingDescendants(nodeList[0],newRange);restoreValues(values,newRange);nodeList.shift();}else{sublist=[];sublist.push(nodeList.shift());while(nodeList.length&&nodeList[0]==sublist[sublist.length-1].nextSibling&&!isSingleLineContainer(nodeList[0])&&!isNamedHtmlElement(sublist[sublist.length-1],"BR")){sublist.push(nodeList.shift());}}
fixDisallowedAncestors(wrap(sublist,jQuery.inArray(value,["div","p"])==-1?makeIsElementWithoutAttributes(value):returnFalse,makeCreateElement(value),newRange),newRange);}},indeterm:function(){var newRange=blockExtend(getActiveRange());var nodeList=getAllContainedNodes(newRange,function(node){return isVisible(node)&&isEditable(node)&&!node.hasChildNodes();});if(!nodeList.length){return false;}
var type=null;var i;for(i=0;i<nodeList.length;i++){var node=nodeList[i];while(isEditable(node.parentNode)&&inSameEditingHost(node,node.parentNode)&&!isHtmlElement_obsolete(node,formattableBlockNames)){node=node.parentNode;}
var currentType="";if(isEditable(node)&&isHtmlElement_obsolete(node,formattableBlockNames)&&!$_(getDescendants(node)).some(isProhibitedParagraphChild)){currentType=node.tagName;}
if(type===null){type=currentType;}else if(type!=currentType){return true;}}
return false;},value:function(){var newRange=blockExtend(getActiveRange());var nodes=getAllContainedNodes(newRange,function(node){return isVisible(node)&&isEditable(node)&&!node.hasChildNodes();});if(!nodes.length){return"";}
var node=nodes[0];while(isEditable(node.parentNode)&&inSameEditingHost(node,node.parentNode)&&!isHtmlElement_obsolete(node,formattableBlockNames)){node=node.parentNode;}
if(isEditable(node)&&isHtmlElement_obsolete(node,formattableBlockNames)&&!$_(getDescendants(node)).some(isProhibitedParagraphChild)){return node.tagName.toLowerCase();}
return"";}};commands.forwarddelete={action:function(value,range){if(jQuery.browser.msie&&jQuery.browser.version<=7){moveOverZWSP(range,true);}
if(!range.collapsed){deleteContents(range);return;}
canonicalizeWhitespace(range.startContainer,range.startOffset);var node=range.startContainer;var offset=range.startOffset;var isBr=false;var isHr=false;while(true){if(offset==getNodeLength(node)&&isEditable(node.nextSibling)&&isInvisible(node.nextSibling)){node.parentNode.removeChild(node.nextSibling);}else if(offset<node.childNodes.length&&isEditable(node.childNodes[offset])&&(isInvisible(node.childNodes[offset])||isBr||isHr)){node.removeChild(node.childNodes[offset]);if(isBr||isHr){ensureContainerEditable(node);range.setStart(node,offset);range.setEnd(node,offset);return;}}else if(offset<node.childNodes.length&&isCollapsedBlockProp(node.childNodes[offset])){offset++;}else if((offset==getNodeLength(node)&&isInlineNode(node))||isInvisible(node)){offset=1+getNodeIndex(node);node=node.parentNode;}else if(offset<node.childNodes.length&&!isBlockNode(node.childNodes[offset])&&!isHtmlElementInArray(node.childNodes[offset],["br","img"])){node=node.childNodes[offset];offset=0;}else{break;}}
canonicalizeWhitespace(range.startContainer,range.startOffset);var delBlock=getBlockAtNextPosition(node,offset);if(delBlock){delBlock.parentNode.removeChild(delBlock);return;}
var endOffset;if(node.nodeType==$_.Node.TEXT_NODE&&offset!=getNodeLength(node)){range.setStart(node,offset);range.setEnd(node,offset);endOffset=offset+1;while(endOffset!=node.length&&/^[\u0300-\u036f\u0591-\u05bd\u05c1\u05c2]$/.test(node.data[endOffset])){endOffset++;}
deleteContents(node,offset,node,endOffset);return;}
if(isInlineNode(node)){return;}
if(offset<node.childNodes.length&&isHtmlElementInArray(node.childNodes[offset],["br","hr","img"])){range.setStart(node,offset);range.setEnd(node,offset);deleteContents(node,offset,node,offset+1);return;}
var endNode=node;endOffset=offset;while(true){if(endOffset==getNodeLength(endNode)){endOffset=1+getNodeIndex(endNode);endNode=endNode.parentNode;}else if(endOffset<endNode.childNodes.length&&isEditable(endNode.childNodes[endOffset])&&isInvisible(endNode.childNodes[endOffset])){endNode.removeChild(endNode.childNodes[endOffset]);}else{break;}}
if(isNamedHtmlElement(endNode.childNodes[endOffset-1],"table")){return;}
if(isNamedHtmlElement(endNode.childNodes[endOffset],"table")){range.setStart(endNode,endOffset);range.setEnd(endNode,endOffset+1);return;}
if(offset==getNodeLength(node)&&isHtmlElementInArray(endNode.childNodes[endOffset],["br","hr"])){range.setStart(node,offset);range.setEnd(node,offset);deleteContents(endNode,endOffset,endNode,endOffset+1);return;}
while(endOffset<endNode.childNodes.length){if(isEditable(endNode.childNodes[endOffset])&&isInvisible(endNode.childNodes[endOffset])){endNode.removeChild(endNode.childNodes[endOffset]);}else{endNode=endNode.childNodes[endOffset];endOffset=0;}}
var newRange=deleteContents(node,offset,endNode,endOffset);range.setStart(newRange.startContainer,newRange.startOffset);range.setEnd(newRange.endContainer,newRange.endOffset);}};commands.indent={action:function(){var items=[];var node;for(node=getActiveRange().endContainer;node!=getActiveRange().commonAncestorContainer;node=node.parentNode){if(isNamedHtmlElement(node,"LI")){items.unshift(node);}}
for(node=getActiveRange().startContainer;node!=getActiveRange().commonAncestorContainer;node=node.parentNode){if(isNamedHtmlElement(node,"LI")){items.unshift(node);}}
for(node=getActiveRange().commonAncestorContainer;node;node=node.parentNode){if(isNamedHtmlElement(node,"LI")){items.unshift(node);}}
var i;for(i=0;i<items.length;i++){normalizeSublists(items[i],getActiveRange());}
var newRange=blockExtend(getActiveRange());var nodeList=[];nodeList=getContainedNodes(newRange,function(node){return isEditable(node)&&(isAllowedChild(node,"div")||isAllowedChild(node,"ol"));});if(nodeList.length&&isNamedHtmlElement(nodeList[0],"LI")&&isHtmlElementInArray(nodeList[0].parentNode,["OL","UL"])&&isNamedHtmlElement(nodeList[0].previousSibling,"LI")){normalizeSublists(nodeList[0].previousSibling,newRange);}
while(nodeList.length){var sublist=[];sublist.push(nodeList.shift());while(nodeList.length&&nodeList[0]==sublist[sublist.length-1].nextSibling){sublist.push(nodeList.shift());}
indentNodes(sublist,newRange);}}};commands.inserthorizontalrule={action:function(value,range){while(range.startOffset==0&&range.startContainer.parentNode){range.setStart(range.startContainer.parentNode,getNodeIndex(range.startContainer));}
while(range.endOffset==getNodeLength(range.endContainer)&&range.endContainer.parentNode){range.setEnd(range.endContainer.parentNode,1+getNodeIndex(range.endContainer));}
deleteContents(range,{blockMerging:false});if(!isEditable(getActiveRange().startContainer)&&!isEditingHost(getActiveRange().startContainer)){return;}
if(getActiveRange().startContainer.nodeType==$_.Node.TEXT_NODE&&getActiveRange().startOffset==0){getActiveRange().setStart(getActiveRange().startContainer.parentNode,getNodeIndex(getActiveRange().startContainer));getActiveRange().collapse(true);}
if(getActiveRange().startContainer.nodeType==$_.Node.TEXT_NODE&&getActiveRange().startOffset==getNodeLength(getActiveRange().startContainer)){getActiveRange().setStart(getActiveRange().startContainer.parentNode,1+getNodeIndex(getActiveRange().startContainer));getActiveRange().collapse(true);}
var hr=document.createElement("hr");range.insertNode(hr);fixDisallowedAncestors(hr,range);range.setStart(hr.parentNode,1+getNodeIndex(hr));range.setEnd(hr.parentNode,1+getNodeIndex(hr));Aloha.getSelection().removeAllRanges();Aloha.getSelection().addRange(range);}};commands.inserthtml={action:function(value,range){deleteContents(range);if(!isEditable(range.startContainer)&&!isEditingHost(range.startContainer)){return;}
var frag=range.createContextualFragment(value);var lastChild=frag.lastChild;if(!lastChild){return;}
var descendants=getDescendants(frag);if(isBlockNode(range.startContainer)){$_(range.startContainer.childNodes).filter(function(node,range){return isEditable(node)&&isCollapsedBlockProp(node)&&getNodeIndex(node)>=range.startOffset;},true).forEach(function(node){node.parentNode.removeChild(node);});}
range.insertNode(frag);if(isBlockNode(range.startContainer)){ensureContainerEditable(range.startContainer);}
range.setStart(lastChild.parentNode,1+getNodeIndex(lastChild));range.setEnd(lastChild.parentNode,1+getNodeIndex(lastChild));var i;for(i=0;i<descendants.length;i++){fixDisallowedAncestors(descendants[i],range);}
setActiveRange(range);}};commands.insertimage={action:function(value){if(value===""){return;}
var range=getActiveRange();deleteContents(range,{stripWrappers:false});if(!isEditable(getActiveRange().startContainer)&&!isEditingHost(getActiveRange().startContainer)){return;}
if(isBlockNode(range.startContainer)&&range.startContainer.childNodes.length==1&&isNamedHtmlElement(range.startContainer.firstChild,"br")&&range.startOffset==0){range.startContainer.removeChild(range.startContainer.firstChild);}
var img=document.createElement("img");img.setAttribute("src",value);range.insertNode(img);range.setStart(img.parentNode,1+getNodeIndex(img));range.setEnd(img.parentNode,1+getNodeIndex(img));Aloha.getSelection().removeAllRanges();Aloha.getSelection().addRange(range);img.removeAttribute("width");img.removeAttribute("height");}};commands.insertlinebreak={action:function(value,range){deleteContents(range,{stripWrappers:false});if(!isEditable(range.startContainer)&&!isEditingHost(range.startContainer)){return;}
if(range.startContainer.nodeType==$_.Node.ELEMENT_NODE&&!isAllowedChild("br",range.startContainer)){return;}
if(range.startContainer.nodeType!=$_.Node.ELEMENT_NODE&&!isAllowedChild("br",range.startContainer.parentNode)){return;}
var newNode,newOffset;if(range.startContainer.nodeType==$_.Node.TEXT_NODE&&range.startOffset==0){newNode=range.startContainer.parentNode;newOffset=getNodeIndex(range.startContainer);Aloha.getSelection().collapse(newNode,newOffset);range.setStart(newNode,newOffset);range.setEnd(newNode,newOffset);}
if(range.startContainer.nodeType==$_.Node.TEXT_NODE&&range.startOffset==getNodeLength(range.startContainer)){newNode=range.startContainer.parentNode;newOffset=1+getNodeIndex(range.startContainer);Aloha.getSelection().collapse(newNode,newOffset);range.setStart(newNode,newOffset);range.setEnd(newNode,newOffset);}
var br=document.createElement("br");range.insertNode(br);Aloha.getSelection().collapse(br.parentNode,1+getNodeIndex(br));range.setStart(br.parentNode,1+getNodeIndex(br));range.setEnd(br.parentNode,1+getNodeIndex(br));if(isCollapsedLineBreak(br)){range.insertNode(createEndBreak());Aloha.getSelection().collapse(br.parentNode,1+getNodeIndex(br));range.setStart(br.parentNode,1+getNodeIndex(br));range.setEnd(br.parentNode,1+getNodeIndex(br));}
if(jQuery.browser.msie&&jQuery.browser.version<8){br.parentNode.removeAttribute("style");}}};commands.insertorderedlist={action:function(value,range){toggleLists("ol",range);},indeterm:function(){return(/^mixed( ol)?$/).test(getSelectionListState());},state:function(){return getSelectionListState()=="ol";}};var listRelatedElements={"LI":true,"DT":true,"DD":true};commands.insertparagraph={action:function(value,range){var i;deleteContents(range);cleanLists(getEditingHostOf(range.startContainer),range);if(!isEditable(range.startContainer)&&!isEditingHost(range.startContainer)){return;}
var node=range.startContainer;var offset=range.startOffset;if(node.nodeType==$_.Node.TEXT_NODE&&offset!=0&&offset!=getNodeLength(node)){node.splitText(offset);}
if(node.nodeType==$_.Node.TEXT_NODE&&offset==getNodeLength(node)){offset=1+getNodeIndex(node);node=node.parentNode;}
if(node.nodeType==$_.Node.TEXT_NODE||node.nodeType==$_.Node.COMMENT_NODE){offset=getNodeIndex(node);node=node.parentNode;}
Aloha.getSelection().collapse(node,offset);range.setStart(node,offset);range.setEnd(node,offset);var container=node;while(!isSingleLineContainer(container)&&isEditable(container.parentNode)&&inSameEditingHost(node,container.parentNode)){container=container.parentNode;}
if(!isEditable(container)||!inSameEditingHost(container,node)||!isSingleLineContainer(container)){var tag=defaultSingleLineContainerName;var newRange=blockExtend(range);var nodeList=getContainedNodes(newRange,function(node){return isAllowedChild(node,"p");}).slice(0,1);if(!nodeList.length){if(!isAllowedChild(tag,range.startContainer)){return;}
container=document.createElement(tag);range.insertNode(container);container.appendChild(createEndBreak());Aloha.getSelection().collapse(container,0);range.setStart(container,0);range.setEnd(container,0);return;}
while(nodeList[nodeList.length-1].nextSibling&&isAllowedChild(nodeList[nodeList.length-1].nextSibling,"p")){nodeList.push(nodeList[nodeList.length-1].nextSibling);}
container=wrap(nodeList,function(){return false;},function(){return document.createElement(tag);},range);}
if(!container){return;}
var oldHeight,newHeight;if(container.tagName=="ADDRESS"||container.tagName=="LISTING"||container.tagName=="PRE"){var br=document.createElement("br");oldHeight=container.offsetHeight;range.insertNode(br);newHeight=container.offsetHeight;Aloha.getSelection().collapse(node,offset+1);range.setStart(node,offset+1);range.setEnd(node,offset+1);if(oldHeight==newHeight&&!isDescendant(nextNode(br),container)){range.insertNode(createEndBreak());Aloha.getSelection().collapse(node,offset+1);range.setEnd(node,offset+1);}
return;}
if(listRelatedElements[container.tagName]&&(!container.hasChildNodes()||(container.childNodes.length==1&&isNamedHtmlElement(container.firstChild,"br")))){splitParent([container],range);if(isHtmlElementInArray(container,["dd","dt"])&&$_(getAncestors(container)).every(function(ancestor){return!inSameEditingHost(container,ancestor)||!isAllowedChild(container,ancestor);})){container=setTagName(container,defaultSingleLineContainerName,range);}
fixDisallowedAncestors(container,range);if(isNamedHtmlElement(container,'li')&&isNamedHtmlElement(container.nextSibling,"li")&&isHtmlElementInArray(container.nextSibling.firstChild,["ol","ul"])){var listParent=container.nextSibling,length=container.nextSibling.childNodes.length;for(i=0;i<length;i++){container.appendChild(listParent.childNodes[0]);}
listParent.parentNode.removeChild(listParent);}
return;}
var newLineRange=Aloha.createRange();newLineRange.setStart(range.startContainer,range.startOffset);newLineRange.setEnd(container,getNodeLength(container));while(newLineRange.startOffset==0&&newLineRange.startContainer!=container){newLineRange.setStart(newLineRange.startContainer.parentNode,getNodeIndex(newLineRange.startContainer));}
while(newLineRange.startOffset==getNodeLength(newLineRange.startContainer)&&newLineRange.startContainer!=container){newLineRange.setStart(newLineRange.startContainer.parentNode,1+getNodeIndex(newLineRange.startContainer));}
var containedInNewLineRange=getContainedNodes(newLineRange);var endOfLine=!containedInNewLineRange.length||(containedInNewLineRange.length==1&&isNamedHtmlElement(containedInNewLineRange[0],"br"));var newContainerName;if(/^H[1-6]$/.test(container.tagName)&&endOfLine){newContainerName=defaultSingleLineContainerName;}else if(container.tagName=="DT"&&endOfLine){newContainerName="dd";}else if(container.tagName=="DD"&&endOfLine){newContainerName="dt";}else{newContainerName=container.tagName.toLowerCase();}
var newContainer=document.createElement(newContainerName);copyAttributes(container,newContainer);newContainer.removeAttribute("id");container.parentNode.insertBefore(newContainer,container.nextSibling);var containedNodes=getAllContainedNodes(newLineRange);var frag=newLineRange.extractContents();var descendants=getDescendants(frag);for(i=0;i<descendants.length;i++){if(descendants[i].nodeType==$_.Node.ELEMENT_NODE&&$_(containedNodes).indexOf(descendants[i])==-1){descendants[i].removeAttribute("id");}}
var fragChildren=[],fragChild=frag.firstChild;if(fragChild){do{if(!isWhitespaceNode(fragChild)){fragChildren.push(fragChild);}}while(null!=(fragChild=fragChild.nextSibling));}
if(isNamedHtmlElement(newContainer,'li')&&fragChildren.length&&isHtmlElementInArray(fragChildren[0],["ul","ol"])){oldHeight=newContainer.offsetHeight;var endBr=createEndBreak();newContainer.appendChild(endBr);newHeight=newContainer.offsetHeight;if(oldHeight!==newHeight){newContainer.removeChild(endBr);}}
newContainer.appendChild(frag);ensureContainerEditable(container);ensureContainerEditable(newContainer);Aloha.getSelection().collapse(newContainer,0);range.setStart(newContainer,0);range.setEnd(newContainer,0);}};commands.inserttext={action:function(value,range){var i;deleteContents(range,{stripWrappers:false});if(!isEditable(range.startContainer)&&!isEditingHost(range.startContainer)){return;}
if(value.length>1){for(i=0;i<value.length;i++){commands.inserttext.action(value[i],range);}
return;}
if(value==""){return;}
if(value=="\n"){commands.insertparagraph.action('',range);return;}
var node=range.startContainer;var offset=range.startOffset;if(0<=offset-1&&offset-1<node.childNodes.length&&node.childNodes[offset-1].nodeType==$_.Node.TEXT_NODE){node=node.childNodes[offset-1];offset=getNodeLength(node);}
if(0<=offset&&offset<node.childNodes.length&&node.childNodes[offset].nodeType==$_.Node.TEXT_NODE){node=node.childNodes[offset];offset=0;}
var refElement=node.nodeType==$_.Node.ELEMENT_NODE?node:node.parentNode;if(value==" "&&refElement.nodeType==$_.Node.ELEMENT_NODE&&jQuery.inArray($_.getComputedStyle(refElement).whiteSpace,["pre","pre-wrap"])==-1){value="\xa0";}
var overrides=recordCurrentOverrides(range);if(node.nodeType==$_.Node.TEXT_NODE){node.insertData(offset,value);Aloha.getSelection().collapse(node,offset);range.setStart(node,offset);Aloha.getSelection().extend(node,offset+1);range.setEnd(node,offset+1);}else{if(node.childNodes.length==1&&isCollapsedLineBreak(node.firstChild)){node.removeChild(node.firstChild);}
var text=document.createTextNode(value);range.insertNode(text);Aloha.getSelection().collapse(text,0);range.setStart(text,0);Aloha.getSelection().extend(text,1);range.setEnd(text,1);}
restoreStatesAndValues(overrides,range);canonicalizeWhitespace(range.startContainer,range.startOffset);canonicalizeWhitespace(range.endContainer,range.endOffset);Aloha.getSelection().collapseToEnd();range.collapse(false);}};commands.insertunorderedlist={action:function(value,range){toggleLists("ul",range);},indeterm:function(){return(/^mixed( ul)?$/).test(getSelectionListState());},state:function(){return getSelectionListState()=="ul";}};commands.justifycenter={action:function(value,range){justifySelection("center",range);},indeterm:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});return $_(nodes).some(function(node){return getAlignmentValue(node)=="center";})&&$_(nodes).some(function(node){return getAlignmentValue(node)!="center";});},state:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});return nodes.length&&$_(nodes).every(function(node){return getAlignmentValue(node)=="center";});},value:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});if(nodes.length){return getAlignmentValue(nodes[0]);}
return"left";}};commands.justifyfull={action:function(value,range){justifySelection("justify",range);},indeterm:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});return $_(nodes).some(function(node){return getAlignmentValue(node)=="justify";})&&$_(nodes).some(function(node){return getAlignmentValue(node)!="justify";});},state:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});return nodes.length&&$_(nodes).every(function(node){return getAlignmentValue(node)=="justify";});},value:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});if(nodes.length){return getAlignmentValue(nodes[0]);}
return"left";}};commands.justifyleft={action:function(value,range){justifySelection("left",range);},indeterm:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});return $_(nodes).some(function(node){return getAlignmentValue(node)=="left";})&&$_(nodes).some(function(node){return getAlignmentValue(node)!="left";});},state:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});return nodes.length&&$_(nodes).every(function(node){return getAlignmentValue(node)=="left";});},value:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});if(nodes.length){return getAlignmentValue(nodes[0]);}
return"left";}};commands.justifyright={action:function(value,range){justifySelection("right",range);},indeterm:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});return $_(nodes).some(function(node){return getAlignmentValue(node)=="right";})&&$_(nodes).some(function(node){return getAlignmentValue(node)!="right";});},state:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});return nodes.length&&$_(nodes).every(function(node){return getAlignmentValue(node)=="right";});},value:function(){var nodes=getAllContainedNodes(blockExtend(getActiveRange()),function(node){return isEditable(node)&&isVisible(node)&&!node.hasChildNodes();});if(nodes.length){return getAlignmentValue(nodes[0]);}
return"left";}};commands.outdent={action:function(){var items=[];(function(){var ancestorContainer;for(ancestorContainer=getActiveRange().endContainer;ancestorContainer!=getActiveRange().commonAncestorContainer;ancestorContainer=ancestorContainer.parentNode){if(isNamedHtmlElement(ancestorContainer,"li")){items.unshift(ancestorContainer);}}
for(ancestorContainer=getActiveRange().startContainer;ancestorContainer;ancestorContainer=ancestorContainer.parentNode){if(isNamedHtmlElement(ancestorContainer,"li")){items.unshift(ancestorContainer);}}}());$_(items).forEach(function(thisArg){normalizeSublists(thisArg,getActiveRange());});var newRange=blockExtend(getActiveRange());var nodeList=getContainedNodes(newRange,function(node){return isEditable(node)&&(!$_(getDescendants(node)).some(isEditable)||isHtmlElementInArray(node,["ol","ul"])||(isNamedHtmlElement(node,'li')&&isHtmlElementInArray(node.parentNode,["ol","ul"])));});while(nodeList.length){while(nodeList.length&&(isHtmlElementInArray(nodeList[0],["OL","UL"])||!isHtmlElementInArray(nodeList[0].parentNode,["OL","UL"]))){outdentNode(nodeList.shift(),newRange);}
if(!nodeList.length){break;}
var sublist=[];sublist.push(nodeList.shift());while(nodeList.length&&nodeList[0]==sublist[sublist.length-1].nextSibling&&!isHtmlElementInArray(nodeList[0],["OL","UL"])){sublist.push(nodeList.shift());}
var values=recordValues(sublist);splitParent(sublist,newRange);$_(sublist).forEach(fixDisallowedAncestors);restoreValues(values,newRange);}}};commands.selectall={action:function(){var target=document.body;if(!target){target=document.documentElement;}
if(!target){Aloha.getSelection().removeAllRanges();}else{Aloha.getSelection().selectAllChildren(target);}}};commands.stylewithcss={action:function(value){cssStylingFlag=String(value).toLowerCase()!="false";},state:function(){return cssStylingFlag;}};commands.usecss={action:function(value){cssStylingFlag=String(value).toLowerCase()=="false";}};(function(){var commandNames=[];var command;for(command in commands){if(commands.hasOwnProperty(command)){commandNames.push(command);}}
$_(commandNames).forEach(function(command){if(null==commands[command].relevantCssProperty){commands[command].relevantCssProperty=null;}
if(null!=commands[command].inlineCommandActivatedValues&&null==commands[command].indeterm){commands[command].indeterm=function(range){var values=$_(getAllEffectivelyContainedNodes(range,function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;})).map(function(node){return getEffectiveCommandValue(node,command);});var matchingValues=$_(values).filter(function(value){return $_(commands[command].inlineCommandActivatedValues).indexOf(value)!=-1;});return matchingValues.length>=1&&values.length-matchingValues.length>=1;};}
if(null!=commands[command].inlineCommandActivatedValues){commands[command].state=function(range){var nodes=getAllEffectivelyContainedNodes(range,function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;});if(nodes.length==0){return $_(commands[command].inlineCommandActivatedValues).indexOf(getEffectiveCommandValue(range.startContainer,command))!=-1;}
return $_(nodes).every(function(node){return $_(commands[command].inlineCommandActivatedValues).indexOf(getEffectiveCommandValue(node,command))!=-1;});};}
if(null!=commands[command].standardInlineValueCommand){commands[command].indeterm=function(){var values=$_(getAllEffectivelyContainedNodes(getActiveRange())).filter(function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;},true).map(function(node){return getEffectiveCommandValue(node,command);});var i;for(i=1;i<values.length;i++){if(values[i]!=values[i-1]){return true;}}
return false;};commands[command].value=function(range){var refNode=getAllEffectivelyContainedNodes(range,function(node){return isEditable(node)&&node.nodeType==$_.Node.TEXT_NODE;})[0];if(typeof refNode=="undefined"){refNode=range.startContainer;}
return getEffectiveCommandValue(refNode,command);};}});}());return{commands:commands,execCommand:myExecCommand,queryCommandIndeterm:myQueryCommandIndeterm,queryCommandState:myQueryCommandState,queryCommandValue:myQueryCommandValue,queryCommandEnabled:myQueryCommandEnabled,queryCommandSupported:myQueryCommandSupported,copyAttributes:copyAttributes,createEndBreak:createEndBreak,isEndBreak:isEndBreak,ensureContainerEditable:ensureContainerEditable,isEditingHost:isEditingHost,isEditable:isEditable,getStateOverride:getStateOverride,setStateOverride:setStateOverride,resetOverrides:resetOverrides,unsetStateOverride:unsetStateOverride};});