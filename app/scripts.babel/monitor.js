'use strict';

const AWS_CODEPIPELINE_URL = 'console.aws.amazon.com/codepipeline';

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
      '   <div class="grid-stack-item" data-bind="attr: {\'data-stage-id\': $data.stage.id, \'data-gs-x\': $data.x, \'data-gs-y\': $data.y, \'data-gs-width\': $data.width, \'data-gs-height\': $data.height, \'data-gs-auto-position\': $data.auto_position}">',
      '       <div class="grid-stack-item-content">',
      '         <h1 data-bind="text: stage.pipeline"/>',
      '         <h5 data-bind="text: stage.name"/>',
      '         <h5 data-bind="text: stage.type"/>',
      '         <h5 data-bind="text: stage.status"/>',
      '         <h5 data-bind="text: stage.lastExecution"/>',
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
    tabs.forEach((tab) => {
      if (tab.url.includes(AWS_CODEPIPELINE_URL)) {
        chrome.tabs.sendMessage(tab.id, {},
          (pipeline) => {
            if (pipeline) {
              pipeline.stages.forEach((stage) => {
                stage.id = stage.name + tab.id;
                stage.pipeline = pipeline.name;
                controller.addNewWidget(stage);
              });
            }
          });
      }
    });
  });
}

function addWidgets(self, data) {
  self.widgets.push({
    stage: data,
    x: 0,
    y: 0,
    width: Math.floor(3),
    height: Math.floor(3),
    auto_position: true
  });
}

function updateWidgets(self, stage, oldWidgets) {
  _.forEach($('.grid-stack > .grid-stack-item:visible'), (element) => {
    element = $(element);
    const node = element.data();
    const gridNode = element.data('_gridstack_node');

    if (node.stageId === stage.id) {
      self.widgets.replace(oldWidgets, {
        stage: stage,
        x: gridNode.x,
        y: gridNode.y,
        width: gridNode.width,
        height: gridNode.height,
        auto_position: false
      });
    }
  });
}

function initGridstack() {
  const Controller = function (widgets) {
    this.widgets = ko.observableArray(widgets);
    this.addNewWidget = (stage) => {
      const oldWidgets = ko.utils.arrayFirst(this.widgets(), (currentWidgets) => {
        return currentWidgets.stage.id == stage.id;
      });

      if (oldWidgets) {
        updateWidgets(this, stage, oldWidgets);
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

  setInterval(onMessage, 3000);
}