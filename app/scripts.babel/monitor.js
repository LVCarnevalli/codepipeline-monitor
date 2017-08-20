'use strict';

const AWS_CODEPIPELINE_URL = 'console.aws.amazon.com/codepipeline';

function message() {
  chrome.tabs.query({
    currentWindow: true
  }, function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.url.includes(AWS_CODEPIPELINE_URL)) {
        chrome.tabs.sendMessage(tab.id, {},
          function (msg) {
            console.log(msg);
          });
      }
    });
  });
}

setInterval(message, 3000);

window.onload = function () {
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
      '   <div class="grid-stack-item" data-bind="attr: {\'data-gs-x\': $data.x, \'data-gs-y\': $data.y, \'data-gs-width\': $data.width, \'data-gs-height\': $data.height, \'data-gs-auto-position\': $data.auto_position}">',
      '       <div class="grid-stack-item-content"><button data-bind="click: $root.deleteWidget">Delete me</button></div>',
      '   </div>',
      '</div> '
    ].join('')
  });
  $(function () {
    var Controller = function (widgets) {
      var self = this;
      this.widgets = ko.observableArray(widgets);
      this.addNewWidget = function () {
        this.widgets.push({
          x: 0,
          y: 0,
          width: Math.floor(1 + 3 * Math.random()),
          height: Math.floor(1 + 3 * Math.random()),
          auto_position: true
        });
        return false;
      };
      this.deleteWidget = function (item) {
        self.widgets.remove(item);
        return false;
      };
    };
    var widgets = [{
        x: 0,
        y: 0,
        width: 2,
        height: 2
      },
      {
        x: 2,
        y: 0,
        width: 4,
        height: 2
      },
      {
        x: 6,
        y: 0,
        width: 2,
        height: 4
      },
      {
        x: 1,
        y: 2,
        width: 4,
        height: 2
      }
    ];
    var controller = new Controller(widgets);
    ko.applyBindings(controller);
  });
}