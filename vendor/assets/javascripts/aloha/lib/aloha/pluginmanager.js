
define(['jquery','util/class'],function($,Class){'use strict';var Aloha=window.Aloha;function mapSettingsIntoPlugins(plugins,settings){var plugin;for(plugin in settings){if(settings.hasOwnProperty(plugin)&&plugins[plugin]){plugins[plugin].settings=settings[plugin]||{};}}}
function getPlugins(plugins,names){var available=[];var plugin;var i;for(i=0;i<names.length;i++){plugin=plugins[names[i]];if(plugin){available.push(plugin);}}
return available;}
function initializePlugins(plugins,callback){if(0===plugins.length){if(callback){callback();}
return;}
var numToEnable=plugins.length;var onInit=function(){if(0===--numToEnable&&callback){callback();}};var i;var ret;var plugin;for(i=0;i<plugins.length;i++){plugin=plugins[i];plugin.settings=plugin.settings||{};if(typeof plugin.settings.enabled==='undefined'){plugin.settings.enabled=true;}
if(plugin.settings.enabled&&plugin.checkDependencies()){ret=plugin.init();if(ret&&typeof ret.done==='function'){ret.done(onInit);}else{onInit();}}else{onInit();}}}
return new(Class.extend({plugins:{},init:function(next,enabled){var manager=this;var plugins=manager.plugins;mapSettingsIntoPlugins(plugins,Aloha&&Aloha.settings&&Aloha.settings.plugins);var plugin;if(plugins&&0===enabled.length){enabled=[];for(plugin in plugins){if(plugins.hasOwnProperty(plugin)){enabled.push(plugin);}}}
initializePlugins(getPlugins(plugins,enabled),next);},register:function(plugin){if(!plugin.name){throw new Error('Plugin does not have an name.');}
if(this.plugins[plugin.name]){throw new Error('Already registered the plugin "'+plugin.name+'"!');}
this.plugins[plugin.name]=plugin;},makeClean:function(obj){var i,plugin;for(plugin in this.plugins){if(this.plugins.hasOwnProperty(plugin)){if(Aloha.Log.isDebugEnabled()){Aloha.Log.debug(this,'Passing contents of HTML Element with id { '+obj.attr('id')+' } for cleaning to plugin { '+plugin+' }');}
this.plugins[plugin].makeClean(obj);}}},toString:function(){return'pluginmanager';}}))();});