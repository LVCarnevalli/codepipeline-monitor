'use strict';

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  const pipeline = {
    name: null,
    stages: []
  };

  pipeline.name = document.querySelectorAll('.pipelines-header')[0].outerText.replace(' View pipeline history', '');

  const pipelineStages = document.querySelectorAll('.pipelines-view-stages-list>div');
  if (pipelineStages) {
    pipelineStages.forEach(function (stage) {
      const pipelineActions = stage.querySelectorAll('.pipelines-view-action');
      const buildType = stage.querySelectorAll('.pipelines-view-stage-name')[0].outerText;

      pipelineActions.forEach(function (action) {
        const buildName = action.querySelectorAll('.pipelines-view-action-name')[0].outerText;
        const buildStatus = action.querySelectorAll('.pipelines-view-action-state-status')[0].outerText;
        const buildLastExecution = action.querySelectorAll('.pipelines-view-action-state-timestamp')[0].outerText;

        pipeline.stages.push({
          type: buildType,
          name: buildName,
          status: buildStatus,
          lastExecution: buildLastExecution
        });
      });
    });
    sendResponse(pipeline);
  }
});