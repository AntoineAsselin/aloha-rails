
define(['aloha/core','util/class'],function(Aloha,Class){"use strict";var GENTICS=window.GENTICS;Aloha.RepositoryObject=function(){};Aloha.RepositoryDocument=Class.extend({_constructor:function(properties){var p=properties;this.type='document';if(!p.id||!p.name||!p.repositoryId){return;}
GENTICS.Utils.applyProperties(this,properties);this.baseType='document';}});Aloha.RepositoryFolder=Class.extend({_constructor:function(properties){var p=properties;this.type='folder';if(!p.id||!p.name||!p.repositoryId){return;}
GENTICS.Utils.applyProperties(this,properties);this.baseType='folder';}});});