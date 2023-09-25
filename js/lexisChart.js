class LexisChart {

    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 1000,
            containerHeight: 380,
            margin: {top: 15, right: 5, bottom: 20, left: 25},
            tooltipPadding: _config.tooltipPadding || 15
        }
        this.dispatcher = _dispatcher;
        this.data = _data;

        this.initVis();
    }

    /**
     * Create scales, axes, and append static elements
     */
    initVis() {
        let vis = this;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.chart = vis.chartArea.append('g');

        // Create default arrow head
        // Can be applied to SVG lines using: `marker-end`
        vis.chart.append('defs').append('marker')
            .attr('id', 'arrow-head')
            .attr('markerUnits', 'strokeWidth')
            .attr('refX', '2')
            .attr('refY', '2')
            .attr('markerWidth', '10')
            .attr('markerHeight', '10')
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,0 L2,2 L 0,4')
            .attr('stroke', '#ddd')
            .attr('fill', '#ddd');

        vis.chart.append('defs').append('marker')
            .attr('id', 'arrow-head-hover')
            .attr('markerUnits', 'strokeWidth')
            .attr('refX', '2')
            .attr('refY', '2')
            .attr('markerWidth', '10')
            .attr('markerHeight', '10')
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,0 L2,2 L 0,4')
            .attr('stroke', '#818181')
            .attr('fill', '#818181');

        // to change the color of the arrow head
        vis.chart.append('defs').append('marker')
            .attr('id', 'arrow-head-selected')
            .attr('markerUnits', 'strokeWidth')
            .attr('refX', '2')
            .attr('refY', '2')
            .attr('markerWidth', '10')
            .attr('markerHeight', '10')
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,0 L2,2 L 0,4')
            .attr('stroke', '#f8a60e')
            .attr('fill', '#f8a60e');

        vis.chart.append('defs').append('marker')
            .attr('id', 'arrow-head-highlighted')
            .attr('markerUnits', 'strokeWidth')
            .attr('refX', '2')
            .attr('refY', '2')
            .attr('markerWidth', '10')
            .attr('markerHeight', '10')
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,0 L2,2 L 0,4')
            .attr('stroke', '#b09aec')
            .attr('fill', '#b09aec');

        // Calculate inner chart size. Margin specifies the space around the actual chart. (copied from p1)
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // initialize x and y scales (copied from p1)
        vis.xScale = d3.scaleLinear()
            .domain([1950, 2023])  // because the domain is fixed, we can hardcode it
            .range([0, vis.width]);
        vis.yScale = d3.scaleLinear()
            .domain([25, 95])  // because the domain is fixed, we can hardcode it
            .range([vis.height, 0]);

        // initialize x and y axes (copied from p1)
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickFormat(d3.format('d'))
            .ticks(8);
        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickFormat(d3.format('d'))
            .ticks(6);

        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('y', 3)
            .attr('x', 3)
            .style('text-anchor', 'end')
            .text('Age');

        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('x', vis.width - 25)
            .attr('y', vis.height)
            .attr('text-anchor', 'end')
            .text('Year');

        vis.xAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisGroup = vis.chartArea.append('g')
            .attr('class', 'axis y-axis')

        // initialize clipping mask that covers the area of the chart (copied from p1)
        vis.chartArea.append('defs')
            .append('clipPath')
            .attr('id', 'chart-mask')
            .append('rect')
            .attr('width', vis.width)
            .attr('y', -vis.config.margin.top)
            .attr('height', vis.config.containerHeight);

        // Apply clipping mask to 'vis.chart' to clip arrows that are out of bound (copied from p1)
        vis.chart = vis.chartArea.append('g')
            .attr('clip-path', 'url(#chart-mask)');
    }


    updateVis() {
        let vis = this;

        vis.x1 = d => d.start_year;
        vis.x2 = d => d.end_year;
        vis.y1 = d => d.start_age;
        vis.y2 = d => d.end_age;

        vis.renderVis();
    }

    renderVis() {

        let vis = this;
        const STROKE_WEIGHT_DEFAULT = 1;
        const STROKE_WEIGHT_HOVER = 2;
        const STROKE_WEIGHT_HIGHLIGHTED = 3;

        const arrow = vis.chart.selectAll('.arrow')
            .data(vis.data)
            .join('line')
            .attr('class', 'arrow')
            .attr('stroke', d => {
                if (selectedItems.includes(d)) {
                    return '#f8a60e';
                } else if (d.label === 1) {
                    return '#b09aec';
                } else {
                    return '#ddd';
                }
            })
            .attr('stroke-width', d => {
                if (d.label === 1 || selectedItems.includes(d)) {
                    return STROKE_WEIGHT_HIGHLIGHTED;
                } else {
                    return STROKE_WEIGHT_DEFAULT;
                }
            })
            .style('marker-end', d => {
                if (selectedItems.includes(d)) {
                    return 'url(#arrow-head-selected)'
                } else if (d.label === 1) {
                    return 'url(#arrow-head-highlighted)'
                } else {
                    return 'url(#arrow-head)'
                }
            })
            .attr('x1', d => vis.xScale(vis.x1(d)))
            .attr('x2', d => vis.xScale(vis.x2(d)))
            .attr('y1', d => vis.yScale(vis.y1(d)))
            .attr('y2', d => vis.yScale(vis.y2(d)))

        // display d.leader above the arrow
        vis.chart.selectAll('.arrow-label')
            .data(vis.data)
            .join('text')
            .attr('class', 'arrow-label')
            .attr('transform', d =>
                `translate(${(vis.xScale(vis.x1(d)) + vis.xScale(vis.x2(d))) / 2 - 5},
                ${(vis.yScale(vis.y1(d)) + vis.yScale(vis.y2(d))) / 2 - 5}) rotate(-20)`)
            .text(d => {
                if (d.label === 1 || selectedItems.includes(d)) {
                    return d.leader;
                } else {
                    return '';
                }
            })
            .attr('font-size', '12px')

        arrow.on('click', function (event, d) {

            if (selectedItems.includes(d)) {
                selectedItems.splice(selectedItems.indexOf(d), 1);
            } else {
                selectedItems.push(d);
            }
            vis.dispatcher.call('selectedItems', event);
        })

        // Hover: Arrows that are not highlighted or selected become more prominent when hovered over
        // add tooltip (copied from p1)
        arrow
            .on("mouseover.tooltip", (event, d) => {

                let gdp = d.pcgdp === null ? 'missing' : Math.round(d.pcgdp);
                let duration = d.duration <= 1 ? d.duration + ' year' : d.duration + ' years';

                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + vis.config.tooltipPadding) + "px")
                    .style("top", (event.pageY + vis.config.tooltipPadding) + "px")
                    .html(`
                  <div style="font-size: 13px;"><strong>${d.leader}</strong></div>
                  <div style="font-style: italic; font-size: 12px;">${d.country}, ${d.start_year}-${d.end_year}</div> 
                  <li style="font-size: 12px;">Age at inauguration: ${d.start_age}</li>
                  <li style="font-size: 12px;">Time in office: ${duration}</li>
                  <li style="font-size: 12px;">GDP/capita: ${gdp}</li>
            `);
            })
            .on("mouseleave.tooltip", () => {
                d3.select("#tooltip").style("display", "none");
            })
            .on("mouseover.arrow", function (event, d) {
                if (!selectedItems.includes(d) && d.label !== 1) {
                    d3.select(this)
                        .style('marker-end', 'url(#arrow-head-hover)')
                        .attr('stroke', '#818181')
                        .attr('stroke-width', STROKE_WEIGHT_HOVER);
                }
            })
            .on("mouseleave.arrow", function (event, d) {
                if (!selectedItems.includes(d) && d.label !== 1) {
                    d3.select(this)
                        .style('marker-end', 'url(#arrow-head)')
                        .attr('stroke', '#ddd')
                        .attr('stroke-width', STROKE_WEIGHT_DEFAULT);
                }
            })

        vis.xAxisGroup.call(vis.xAxis)
            .call(g => g.select(".domain").remove())

        vis.yAxisGroup.call(vis.yAxis)
            .call(g => g.select(".domain").remove())
    }
}