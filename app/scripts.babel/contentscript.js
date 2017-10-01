'use strict';

const codePipeline = {
  _format(value) {
    return value.replace(/[\n\r]/g, '');
  },
  pipelineHeader() {
    return document.querySelectorAll('.pipelines-header')[0].outerText.replace(' View pipeline history', '');
  },
  pipelineStages() {
    return document.querySelectorAll('.pipelines-view-stages-list>div');
  },
  pipelineStageName(stage) {
    return this._format(stage.querySelectorAll('.pipelines-view-stage-name')[0].outerText);
  },
  pipelineActions(stage) {
    return stage.querySelectorAll('.pipelines-view-action');
  },
  pipelineActionName(action) {
    return this._format(action.querySelectorAll('.pipelines-view-action-name')[0].outerText);
  },
  pipelineActionStatus(action) {
    return this._format(action.querySelectorAll('.pipelines-view-action-state-status')[0].outerText);
  },
  pipelineActionTime(action) {
    return this._format(action.querySelectorAll('.pipelines-view-action-state-timestamp')[0].outerText);
  },
  loginButton() {
    return document.querySelector('#signin_button');
  },
  usernameInput() {
    return document.querySelector('#username');
  }
};

function eventFire(el, etype) {
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

const autoRefresh = setInterval(function () {
  location.reload();
}, 300000);

const autoLogin = setInterval(function () {
  const usernameInput = codePipeline.usernameInput();
  const loginButton = codePipeline.loginButton();
  if (usernameInput && loginButton) {
    this.eventFire(usernameInput, 'focus');
    this.eventFire(loginButton, 'click');
  }
}, 30000);

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  const pipeline = {
    id: codePipeline.pipelineHeader() + msg.tabId,
    name: codePipeline.pipelineHeader(),
    stages: []
  };

  const pipelineStages = codePipeline.pipelineStages();
  if (pipelineStages) {
    pipelineStages.forEach(function (stage, stageIndex) {
      const pipelineActions = codePipeline.pipelineActions(stage);
      const buildType = codePipeline.pipelineStageName(stage);

      pipelineActions.forEach(function (action, actionIndex) {
        pipeline.stages.push({
          pipeline: {
            id: pipeline.id,
            name: pipeline.name
          },
          id: codePipeline.pipelineActionName(action) + msg.tabId,
          type: buildType,
          name: codePipeline.pipelineActionName(action),
          status: codePipeline.pipelineActionStatus(action),
          finished: stageIndex == pipelineStages.length - 1 && actionIndex == pipelineActions.length - 1,
          lastExecution: codePipeline.pipelineActionTime(action)
        });
      });
    });
    sendResponse(pipeline);
  }
});