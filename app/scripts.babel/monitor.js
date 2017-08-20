'use strict';

const AWS_CODEPIPELINE_URL = 'console.aws.amazon.com/codepipeline';

function configureGridstack() {
  ko.components.register('dashboard-grid', {
    viewModel: {
      createViewModel: function (controller, componentInfo) {
        var ViewModel = function (controller, componentInfo) {
          var grid = null;
          this.widgets = controller.widgets;
          this.afterAddWidget = function (items) {
            if (grid == null) {
              grid = $(componentInfo.element).find('.grid-stack').gridstack({
                auto: false
              }).data('gridstack');
            }
            var item = _.find(items, function (i) {
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
      '         <button data-bind="click: $root.deleteWidget">Delete me</button>',
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

var widgets = [];
var controller;

function addMessage() {
  widgets.push({
    x: 0,
    y: 0,
    width: Math.floor(1 + 3 * Math.random()),
    height: Math.floor(1 + 3 * Math.random()),
    auto_position: true
  });
  return false;
}

function onMessage() {
  chrome.tabs.query({
    currentWindow: true
  }, function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.url.includes(AWS_CODEPIPELINE_URL)) {
        chrome.tabs.sendMessage(tab.id, {},
          function (pipeline) {
            if (pipeline) {
              pipeline.stages.forEach(function (stage) {
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

window.onload = function () {
  configureGridstack();
  var Controller = function (widgets) {
    var self = this;
    this.widgets = ko.observableArray(widgets);
    this.addNewWidget = function (stage) {
      console.log(widgets);

      var oldLocation = ko.utils.arrayFilter(widgets, function (widget) {
        return widget.stage.id === stage.id;
      })[0];

      if (oldLocation) {
        _.forEach($('.grid-stack > .grid-stack-item:visible'), function (el) {
          el = $(el);
          var node = el.data();

          if (node.stageId === stage.id) {
            var position = {
              x: el.data('_gridstack_node').x,
              y: el.data('_gridstack_node').y,
              width: el.data('_gridstack_node').width,
              height: el.data('_gridstack_node').height
            };

            var seat = ko.utils.arrayFirst(this.widgets(), function (currentSeat) {
              return currentSeat.stage.id == stage.id; // <-- is this the desired seat?
            });

            var duplicate = seat;
            duplicate.stage = stage;

            this.widgets.replace(seat, {
              stage: stage,
              x: position.x,
              y: position.y,
              width: position.width,
              height: position.height,
              auto_position: false
            });


            // this.widgets.replace(oldLocation, {
            //   stage: stage,
            //   x: position.x,
            //   y: position.y,
            //   width: position.width,
            //   height: position.height,
            //   auto_position: oldLocation.auto_position
            // });
          }
        }.bind(this));

      } else {
        this.widgets.push({
          stage: stage,
          x: 0,
          y: 0,
          width: Math.floor(3),
          height: Math.floor(3),
          auto_position: true
        });
      }
      return false;
    };
    this.deleteWidget = function (item) {
      self.widgets.remove(item);
      return false;
    };
  };

  controller = new Controller(widgets);
  ko.applyBindings(controller);

  setInterval(onMessage, 3000);
}