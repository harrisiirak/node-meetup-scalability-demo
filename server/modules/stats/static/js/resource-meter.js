(function(ctx) {
  'use strict';

  var formatPercent = d3.format('.0%');

  function ResourceMeter(selector, width, height) {
    this._width = width;
    this._height = height;

    var arc = d3.svg.arc().startAngle(0)
      .innerRadius(40)
      .outerRadius(70);

    var svg = d3.select(selector).append('svg')
      .attr('width', this._width)
      .attr('height', this._height)
      .append('g')
      .attr('transform', 'translate(' + (this._width / 2) + ',' + (this._height / 2) + ')');

    var meter = svg.append('g').attr('class', 'progress-meter');
    meter.append('path')
      .attr('class', 'background')
      .attr('d', arc.endAngle(Math.PI * 2));

    var foreground = meter.append('path')
      .attr('class', 'foreground');

    var text = meter.append('text')
      .attr('class', 'text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#000')
      .attr('font-family', 'Bebas, Helvetica Neue, Helvetica, Arial, sans-serif')
      .attr('font-weight', 'bold')
      .attr('font-size', '38px');

    this._foreground = foreground;
    this._text = text;
    this._arc = arc;
  }

  ResourceMeter.prototype.update = function(value, label) {
    if (label === undefined) {
      label = value;
    }

    this._foreground.attr('d', this._arc.endAngle((Math.PI * 2) * value));
    this._text.text(label);
  };

  ctx.ResourceMeter = ResourceMeter;
})(window);