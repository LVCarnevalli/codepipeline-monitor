"use strict";function format(e){return e.replace(/[\n\r]/g,"")}chrome.runtime.onMessage.addListener(function(e,t,r){var i={name:null,stages:[]};i.name=document.querySelectorAll(".pipelines-header")[0].outerText.replace(" View pipeline history","");var a=document.querySelectorAll(".pipelines-view-stages-list>div");a&&(a.forEach(function(e){var t=e.querySelectorAll(".pipelines-view-action"),r=e.querySelectorAll(".pipelines-view-stage-name")[0].outerText;t.forEach(function(e){var t=e.querySelectorAll(".pipelines-view-action-name")[0].outerText,a=e.querySelectorAll(".pipelines-view-action-state-status")[0].outerText,l=e.querySelectorAll(".pipelines-view-action-state-timestamp")[0].outerText;i.stages.push({type:format(r),name:format(t),status:format(a),lastExecution:format(l)})})}),r(i))});
//# sourceMappingURL=contentscript.js.map
