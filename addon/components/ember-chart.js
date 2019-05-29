/* global Chart */
import Ember from 'ember';

Chart.elements.Rectangle.prototype.draw = function() {
    
    var ctx = this._chart.ctx;
    var vm = this._view;
    var left, right, top, bottom, signX, signY, borderSkipped, radius;
    var borderWidth = vm.borderWidth;
    // Set Radius Here
    // If radius is large enough to cause drawing errors a max radius is imposed
    var cornerRadius = 6;

    if (!vm.horizontal) {
        // bar
        left = vm.x - vm.width / 2;
        right = vm.x + vm.width / 2;
        top = vm.y;
        bottom = vm.base;
        signX = 1;
        signY = bottom > top? 1: -1;
        borderSkipped = vm.borderSkipped || 'bottom';
    } else {
        // horizontal bar
        left = vm.base;
        right = vm.x;
        top = vm.y - vm.height / 2;
        bottom = vm.y + vm.height / 2;
        signX = right > left? 1: -1;
        signY = 1;
        borderSkipped = vm.borderSkipped || 'left';
    }

    // Canvas doesn't allow us to stroke inside the width so we can
    // adjust the sizes to fit if we're setting a stroke on the line
    if (borderWidth) {
        // borderWidth shold be less than bar width and bar height.
        var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
        borderWidth = borderWidth > barSize? barSize: borderWidth;
        var halfStroke = borderWidth / 2;
        // Adjust borderWidth when bar top position is near vm.base(zero).
        var borderLeft = left + (borderSkipped !== 'left'? halfStroke * signX: 0);
        var borderRight = right + (borderSkipped !== 'right'? -halfStroke * signX: 0);
        var borderTop = top + (borderSkipped !== 'top'? halfStroke * signY: 0);
        var borderBottom = bottom + (borderSkipped !== 'bottom'? -halfStroke * signY: 0);
        // not become a vertical line?
        if (borderLeft !== borderRight) {
            top = borderTop;
            bottom = borderBottom;
        }
        // not become a horizontal line?
        if (borderTop !== borderBottom) {
            left = borderLeft;
            right = borderRight;
        }
    }

    ctx.beginPath();
    ctx.fillStyle = vm.backgroundColor;
    ctx.strokeStyle = vm.borderColor;
    ctx.lineWidth = borderWidth;

    // Corner points, from bottom-left to bottom-right clockwise
    // | 1 2 |
    // | 0 3 |
    var corners = [
        [left, bottom],
        [left, top],
        [right, top],
        [right, bottom]
    ];

    // Find first (starting) corner with fallback to 'bottom'
    var borders = ['bottom', 'left', 'top', 'right'];
    var startCorner = borders.indexOf(borderSkipped, 0);
    if (startCorner === -1) {
        startCorner = 0;
    }

    function cornerAt(index) {
        return corners[(startCorner + index) % 4];3
    }

    // Draw rectangle from 'startCorner'
    var corner = cornerAt(0);
    ctx.moveTo(corner[0], corner[1]);

    for (var i = 1; i < 4; i++) {
        corner = cornerAt(i);
        nextCornerId = i+1;
        if(nextCornerId == 4){
            nextCornerId = 0
        }

        nextCorner = cornerAt(nextCornerId);

        width = corners[2][0] - corners[1][0];
        height = corners[0][1] - corners[1][1];
        x = corners[1][0];
        y = corners[1][1];
        
        var radius = cornerRadius;
        
        // Fix radius being too large
        if(radius > height/2){
            radius = height/2;
        }if(radius > width/2){
            radius = width/2;
        }

        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);

    }

    ctx.fill();
    if (borderWidth) {
        ctx.stroke();
    }
};

let colors = {
  gray: {
    300: '#E3EBF6',
    600: '#95AAC9',
    700: '#6E84A3',
    800: '#152E4D',
    900: '#283E59'
  },
  primary: {
    100: '#D2DDEC',
    300: '#A6C5F7',
    700: '#2C7BE5',
  },
  black: '#12263F',
  white: '#FFFFFF',
  transparent: 'transparent',
};

let fonts = {
  base: 'Cerebri Sans'
}

export default Ember.Component.extend({
  tagName: 'canvas',
  attributeBindings: ['width', 'height'],
  
  animate: true,

  didInsertElement() {
    this._super(...arguments);
    let context = this.get('element');
    let data    = this.get('data');
    let type    = this.get('type');
    let options = this.get('options');
    
     // Global
    Chart.defaults.global.responsive = true;
    Chart.defaults.global.maintainAspectRatio = false;

    // Default
    Chart.defaults.global.defaultColor = colors.gray[600];
    Chart.defaults.global.defaultFontColor = colors.gray[600];
    Chart.defaults.global.defaultFontFamily = fonts.base;
    Chart.defaults.global.defaultFontSize = 13;

    // Layout
    Chart.defaults.global.layout.padding = 0;

    // Legend
    Chart.defaults.global.legend.display = false;
    Chart.defaults.global.legend.position = 'bottom';
    Chart.defaults.global.legend.labels.usePointStyle = true;
    Chart.defaults.global.legend.labels.padding = 16;

    // Point
    Chart.defaults.global.elements.point.radius = 0;
    Chart.defaults.global.elements.point.backgroundColor = colors.primary[700];

    // Line
    Chart.defaults.global.elements.line.tension = .4;
    Chart.defaults.global.elements.line.borderWidth = 3;
    Chart.defaults.global.elements.line.borderColor = colors.primary[700];
    Chart.defaults.global.elements.line.backgroundColor = colors.transparent;
    Chart.defaults.global.elements.line.borderCapStyle = 'rounded';

    // Rectangle
    Chart.defaults.global.elements.rectangle.backgroundColor = colors.primary[700];

    // Arc
    Chart.defaults.global.elements.arc.backgroundColor = colors.primary[700];
    Chart.defaults.global.elements.arc.borderColor = colors.white;
    Chart.defaults.global.elements.arc.borderWidth = 4;
    Chart.defaults.global.elements.arc.hoverBorderColor = colors.white;

    // Tooltips
    Chart.defaults.global.tooltips.enabled = false;
    Chart.defaults.global.tooltips.mode = 'index';
    Chart.defaults.global.tooltips.intersect = false;

    Chart.defaults.global.tooltips.custom = function(model) {
      var tooltip = document.getElementById('chart-tooltip');

      if (!tooltip) {
        tooltip = document.createElement('div');

        tooltip.setAttribute('id', 'chart-tooltip');
        tooltip.setAttribute('role', 'tooltip');
        tooltip.classList.add('popover');
        tooltip.classList.add('bs-popover-top');
        
        document.body.appendChild(tooltip);
      }

      if (model.opacity === 0) {
        tooltip.style.visibility = 'hidden';
        return;
      }

      function getBody(bodyItem) {
        return bodyItem.lines;
      }

      if (model.body) {
        var titleLines = model.title || [];
        var bodyLines = model.body.map(getBody);
        var html = '';

        html += '<div class="arrow"></div>';

        titleLines.forEach(function(title) {
          html += '<h3 class="popover-header text-center">' + title + '</h3>';
        });

        bodyLines.forEach(function(body, i) {
          var colors = model.labelColors[i];
          var styles = 'background-color: ' + colors.backgroundColor;
          var indicator = '<span class="popover-body-indicator" style="' + styles + '"></span>';
          var align = (bodyLines.length > 1) ? 'justify-content-left' : 'justify-content-center';
          
          html += '<div class="popover-body d-flex align-items-center ' + align + '">' + indicator + body + '</div>';
        });

        tooltip.innerHTML = html;
      }

      var canvas = this._chart.canvas;
      var canvasRect = canvas.getBoundingClientRect();

      var canvasWidth = canvas.offsetWidth;
      var canvasHeight = canvas.offsetHeight;

      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;

      var canvasTop = canvasRect.top + scrollTop;
      var canvasLeft = canvasRect.left + scrollLeft;

      var tooltipWidth = tooltip.offsetWidth;
      var tooltipHeight = tooltip.offsetHeight;

      var top = canvasTop + model.caretY - tooltipHeight - 16;
      var left = canvasLeft + model.caretX - tooltipWidth / 2;

      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
      tooltip.style.visibility = 'visible';

    };
    Chart.defaults.global.tooltips.callbacks.label = function(item, data) {
      var label = data.datasets[item.datasetIndex].label || '';
      var yLabel = item.yLabel;
      var content = ''; 

      if (data.datasets.length > 1) {
        content += '<span class="popover-body-label mr-auto">' + label + '</span>';
      }

      content += '<span class="popover-body-value">' + yLabel + '</span>';

      return content;
    };

    // Doughnut
    Chart.defaults.doughnut.cutoutPercentage = 83;
    Chart.defaults.doughnut.tooltips.callbacks.title = function(item, data) {
      var title = data.labels[item[0].index];
      return title;
    };
    Chart.defaults.doughnut.tooltips.callbacks.label = function(item, data) {
      var value = data.datasets[0].data[item.index];
      var content = '';

      content += '<span class="popover-body-value">' + value + '</span>';
      return content;
    };
    Chart.defaults.doughnut.legendCallback = function(chart) {
      var data = chart.data;
      var content = '';

      data.labels.forEach(function(label, index) {
        var bgColor = data.datasets[0].backgroundColor[index];

        content += '<span class="chart-legend-item">';
        content += '<i class="chart-legend-indicator" style="background-color: ' + bgColor + '"></i>';
        content += label;
        content += '</span>';
      });

      return content;
    };

    // yAxes
    Chart.scaleService.updateScaleDefaults('linear', {
      gridLines: {
        borderDash: [2],
        borderDashOffset: [2],
        color: colors.gray[300],
        drawBorder: false,
        drawTicks: false,
        zeroLineColor: colors.gray[300],
        zeroLineBorderDash: [2],
        zeroLineBorderDashOffset: [2]
      },
      ticks: {
        beginAtZero: true,
        padding: 10,
        callback: function(value) {
          if ( !(value % 10) ) {
            return value
          }
        }
      }
    });

    // xAxes
    Chart.scaleService.updateScaleDefaults('category', {
      gridLines: {
        drawBorder: false,
        drawOnChartArea: false,
        drawTicks: false
      },
      ticks: {
        padding: 20
      },
      maxBarThickness: 10
    });
  }
		
    let chart = new Chart(context, {
      type: type,
      data: data,
      options: options
    });
        
    this.set('chart', chart);
  },

  willDestroyElement() {
    this._super(...arguments);
    this.get('chart').destroy();
  },

  didUpdateAttrs() {
    this._super(...arguments);
    this.updateChart();
  },
  
  updateChart() {
    let chart   = this.get('chart');
    let data    = this.get('data');
    let options = this.get('options');
    let animate = this.get('animate');
		
		if (chart) {
			chart.config.data = data;
			chart.config.options = options;
			if (animate) {
				chart.update();
			} else {
				chart.update(0);
			}
		}
  }
});
