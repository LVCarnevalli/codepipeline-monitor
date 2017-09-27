'use strict';

const AWS_CODEPIPELINE_URL = 'console.aws.amazon.com/codepipeline';

const STATUS_SUCCEEDED = 'Succeeded';
const STATUS_FAILED = 'Failed';
const STATUS_IN_PROGRESS = 'In Progress';

let widgets = [];
let controller;

function configureGridstack() {
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
}

function onMessage() {
  chrome.tabs.query({
    currentWindow: true
  }, (tabs) => {
    chrome.windows.getAll({
      populate: true
    }, function (windows) {
      windows.forEach(function (window) {
        window.tabs.forEach(function (tab) {
          if (tab.url.includes(AWS_CODEPIPELINE_URL)) {
            chrome.tabs.sendMessage(tab.id, {},
              (pipeline) => {
                if (pipeline) {
                  pipeline.stages.forEach((stage) => {
                    stage.id = stage.name + tab.id;
                    stage.pipeline = {
                      id: pipeline.name + tab.id,
                      name: pipeline.name
                    };
                    controller.addNewWidget(stage);
                  });
                }
              });
          }
        });
      });
    });
  });
}

function addWidgets(self, data) {
  self.widgets.push(ko.observable({
    stage: data,
    x: 0,
    y: 0,
    width: Math.floor(4),
    height: Math.floor(3),
    auto_position: true
  }));

  updateStatus(data);
}

function updateWidgets(self, data, oldWidgets) {
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
}

function updateStatus(stage) {
  switch (stage.status) {
    case STATUS_FAILED:
      $(document
        .querySelector(`[data-pipeline-id="${stage.pipeline.id}"]`)
        .querySelector('.grid-stack-item-content'))
        .removeClass('status-succeeded')
        .removeClass('status-inprogress')
        .addClass('status-error');
      break;
    case STATUS_IN_PROGRESS:
      $(document
        .querySelector(`[data-pipeline-id="${stage.pipeline.id}"]`)
        .querySelector('.grid-stack-item-content'))
        .removeClass('status-succeeded')
        .removeClass('status-error')
        .addClass('status-inprogress');
      break;
    case STATUS_SUCCEEDED:
      $(document
        .querySelector(`[data-pipeline-id="${stage.pipeline.id}"]`)
        .querySelector('.grid-stack-item-content'))
        .removeClass('status-inprogress')
        .removeClass('status-error')
        .addClass('status-succeeded');
      break;
  }
}

function initGridstack() {
  const Controller = function (widgets) {
    this.widgets = ko.observableArray(widgets);
    this.addNewWidget = (stage) => {
      const oldWidgets = ko.utils.arrayFirst(this.widgets(), (currentWidgets) => {
        return currentWidgets().stage.pipeline.id == stage.pipeline.id;
      });

      if (oldWidgets) {
        if (stage.status != STATUS_SUCCEEDED || stage.id == oldWidgets().stage.id) {
          updateWidgets(this, stage, oldWidgets);
        }
        if (oldWidgets().stage.status == STATUS_SUCCEEDED && stage.finished) {
          stage.name = 'Completed';
          updateWidgets(this, stage, oldWidgets);
        }
      } else {
        addWidgets(this, stage);
      }

      return false;
    };
  };

  controller = new Controller(widgets);
  ko.applyBindings(controller);
}

window.onload = () => {
  configureGridstack();
  initGridstack();

  setInterval(onMessage, 5000);
}