'use strict';

let widgets = [];
let controller;

const configureGridstack = () => {
  ko.components.register('dashboard-grid', {
    viewModel: {
      createViewModel: function (controller, componentInfo) {
        let ViewModel = function (controller, componentInfo) {
          let grid = null;
          this.widgets = controller.widgets;
          this.afterAddWidget = function (items) {
            if (grid == null) {
              grid = $(componentInfo.element).find('.grid-stack').gridstack({
                auto: false
              }).data('gridstack');
            }
            let item = _.find(items, function (i) {
              return i.nodeType == 1
            });
            grid.addWidget(item);
            ko.utils.domNodeDisposal.addDisposeCallback(item, function () {
              grid.removeWidget(item);
            });
          };
        };
        return new ViewModel(controller, componentInfo);
      }
    },
    template: [
      '<div class="grid-stack" data-bind="foreach: {data: widgets, afterRender: afterAddWidget}">',
      '   <div class="grid-stack-item" data-bind="attr: {\'data-pipeline-id\': $data.stage.pipeline.id, \'data-gs-x\': $data.x, \'data-gs-y\': $data.y, \'data-gs-width\': $data.width, \'data-gs-height\': $data.height, \'data-gs-auto-position\': $data.auto_position}">',
      '       <div class="grid-stack-item-content">',
      '         <div class="content">',
      '           <h1 class="pipeline-name" data-bind="text: stage.pipeline.name"/>',
      '           <h2 class="stage-name" data-bind="text: stage.name"/>',
      '           <h6 class="stage-last-execution" data-bind="text: stage.lastExecution"/>',
      '         </div>',
      '       </div>',
      '   </div>',
      '</div> '
    ].join('')
  });
};

const startGridstack = () => {
  const Controller = function (widgets) {
    this.widgets = ko.observableArray(widgets);
    this.addNewWidget = (pipeline) => {
      const oldWidgets = ko.utils.arrayFirst(this.widgets(), (currentWidgets) => {
        return currentWidgets().stage.pipeline.id == pipeline.id;
      });

      let stage;
      const stageInProgress = pipeline.stages.filter(stage => stage.status == window.codepipeline.statuses.progress)[0];
      const stageFailed = pipeline.stages.filter(stage => stage.status == window.codepipeline.statuses.failed)[0];
      const stageSucceeded = pipeline.stages.filter(stage => stage.finished)[0];

      if (stageInProgress) {
        stage = stageInProgress;
      } else if (stageFailed) {
        stage = stageFailed;
      } else {
        stage = stageSucceeded;
        stage.name = '';
      }

      if (oldWidgets) {
        if (window.slack.active && stage
          && stage.status == window.codepipeline.statuses.failed
          && oldWidgets().stage.id == stage.id
          && oldWidgets().stage.status == window.codepipeline.statuses.progress) {
          sendMessageSlack(pipeline.name, stage.name);
        }
        updateWidgets(this, stage, oldWidgets);
      } else {
        addWidgets(this, stage);
      }

      return false;
    };
  };

  controller = new Controller(widgets);
  ko.applyBindings(controller);
};

const onMessage = () => {
  chrome.tabs.query({
    currentWindow: true
  }, (tabs) => {
    chrome.windows.getAll({
      populate: true
    }, function (windows) {
      windows.forEach(function (windowsBrowser) {
        windowsBrowser.tabs.forEach(function (tab) {
          if (tab.url.includes(window.codepipeline.url)) {
            chrome.tabs.sendMessage(tab.id, { tabId: tab.id },
              (pipeline) => {
                if (pipeline) {
                  controller.addNewWidget(pipeline);
                }
              });
          }
        });
      });
    });
  });
};

const addWidgets = (self, data) => {
  self.widgets.push(ko.observable({
    stage: data,
    x: 0,
    y: 0,
    width: Math.floor(4),
    height: Math.floor(3),
    auto_position: true
  }));

  updateStatus(data);
};

const updateWidgets = (self, data, oldWidgets) => {
  _.forEach($('.grid-stack > .grid-stack-item:visible'), (element) => {
    element = $(element);
    const node = element.data();
    const gridNode = element.data('_gridstack_node');

    if (node.pipelineId === data.pipeline.id) {
      oldWidgets({
        stage: data,
        x: gridNode.x,
        y: gridNode.y,
        width: gridNode.width,
        height: gridNode.height,
        auto_position: false
      });
    }
  });

  updateStatus(data);
};

const updateStatus = (stage) => {
  switch (stage.status) {
    case window.codepipeline.statuses.failed:
      $(document
        .querySelector(`[data-pipeline-id="${stage.pipeline.id}"]`)
        .querySelector('.grid-stack-item-content'))
        .removeClass('status-succeeded')
        .removeClass('status-inprogress')
        .addClass('status-error');
      break;
    case window.codepipeline.statuses.progress:
      $(document
        .querySelector(`[data-pipeline-id="${stage.pipeline.id}"]`)
        .querySelector('.grid-stack-item-content'))
        .removeClass('status-succeeded')
        .removeClass('status-error')
        .addClass('status-inprogress');
      break;
    case window.codepipeline.statuses.succeeded:
      $(document
        .querySelector(`[data-pipeline-id="${stage.pipeline.id}"]`)
        .querySelector('.grid-stack-item-content'))
        .removeClass('status-inprogress')
        .removeClass('status-error')
        .addClass('status-succeeded');
      break;
  }
};

const sendMessageSlack = (pipelineName, stageName) => {
  var data = JSON.stringify({
    'username': window.slack.username,
    'icon_url': 'https://d0.awsstatic.com/Projects/aws-product-service-icon/codepipeline_console_icon.png',
    'channel': window.slack.channel,
    'attachments': [
      {
        'color': 'danger',
        'text': pipelineName + ': ' + stageName + ' - Failed'
      }
    ]
  });
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = false;
  xhr.open('POST', window.slack.url);
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.send(data);
};

window.onload = () => {
  chrome.storage.local.get('options', (value) => {
    window.codepipeline = value.options.codepipeline;
    window.slack = value.options.plugins.slackonfailure;

    configureGridstack();
    startGridstack();

    setInterval(onMessage, codepipeline.interval);
  });
};

const addOnChange = () => {
  $('.grid-stack').on('change', function (event, items) {
    let grid = _.map($('.grid-stack .grid-stack-item:visible'), function (el) {
      el = $(el);
      let node = el.data('_gridstack_node');
      return {
        id: el.attr('data-pipeline-id'),
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height
      };
    });
    window.history.pushState('', '', '?grid=' + JSON.stringify(grid));
  });
};