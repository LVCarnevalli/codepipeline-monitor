'use strict';

const codePipelinePage = {
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
        const statusComponent = action.querySelectorAll('.pipelines-view-action-state-status')[0];
        let statusName = '';
        if (statusComponent) {
            statusName = this._format(statusComponent.outerText);
        }
        return statusName;
    },
    pipelineActionTime(action) {
        const timeComponent = action.querySelectorAll('.pipelines-view-action-state-timestamp')[0];
        let timeName = '';
        if (timeComponent) {
            timeName = this._format(timeComponent.outerText);
        }
        return timeName;
    }
};

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const pipeline = {
        id: codePipelinePage.pipelineHeader() + msg.tabId,
        name: codePipelinePage.pipelineHeader(),
        stages: []
    };

    const pipelineStages = codePipelinePage.pipelineStages();
    if (pipelineStages) {
        pipelineStages.forEach(function (stage, stageIndex) {
            const pipelineActions = codePipelinePage.pipelineActions(stage);
            const buildType = codePipelinePage.pipelineStageName(stage);

            pipelineActions.forEach(function (action, actionIndex) {
                pipeline.stages.push({
                    pipeline: {
                        id: pipeline.id,
                        name: pipeline.name
                    },
                    id: codePipelinePage.pipelineActionName(action) + msg.tabId,
                    type: buildType,
                    name: codePipelinePage.pipelineActionName(action),
                    status: codePipelinePage.pipelineActionStatus(action),
                    finished: stageIndex == pipelineStages.length - 1 && actionIndex == pipelineActions.length - 1,
                    lastExecution: codePipelinePage.pipelineActionTime(action)
                });
            });
        });
        sendResponse(pipeline);
    }
});