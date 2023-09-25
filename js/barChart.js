class BarChart {

    constructor(_config, _data, _dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 1000 - 650 - 15,
            containerHeight: 250,
            margin: {top: 25, right: 15, bottom: 25, left: 35}
        }
        this.dispatcher = _dispatcher;
        this.data = _data;
        this.initVis();
    }

    initVis() {
        // Create SVG area, initialize scales and axes
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.2);

        vis.xAxis = d3.axisBottom(vis.xScale)

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(-vis.width)

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // SVG Group containing the actual chart; D3 margin convention
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')

        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('x', 15)
            .attr('y', -10)
            .attr('text-anchor', 'end')
            .text('Gender')
    }

    updateVis() {
        let vis = this;

        // get a count of gender using d3.rollup
        const aggregatedDataMap = d3.rollups(vis.data, v => v.length, d => d.gender);
        vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({key, count}));

        vis.xValue = d => d.key;
        vis.yValue = d => d.count;

        // Set the scale input domains
        vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
        vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);

        vis.renderVis();
    }

    renderVis() {
        // Bind data to visual elements, update axes
        let vis = this;

        // Add rectangles
        const bars = vis.chart.selectAll('.bar')
            .data(vis.aggregatedData, vis.xValue)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', d => vis.xScale(vis.xValue(d)) + vis.xScale.bandwidth() * 0.1)
            .attr('width', vis.xScale.bandwidth() * 0.8)
            .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
            .attr('y', d => vis.yScale(vis.yValue(d)))
            .attr('fill', '#b09aec');

        // add a hover effect
        bars.on('mouseover', function () {
            d3.select(this)
                .attr('stroke', 'black')
                .attr('stroke-width', 1);
        }).on('mouseleave', function () {
            d3.select(this)
                .attr('stroke', null)
                .attr('stroke-width', null);
        });

        // add a click event
        bars.on('click', function (event) {

            const selectedGender = d3.select(this).data()[0].key;

            if (selectedGender === currentGender) {
                vis.chart.selectAll('.bar')
                    .attr('fill', '#b09aec')
            } else {
                vis.chart.selectAll('.bar')
                    .attr('fill', '#b09aec')
                d3.select(this).attr('fill', '#6c5ce7');
            }

            vis.dispatcher.call('filterGender', event, selectedGender);
        });

        // Update axes
        vis.xAxisG.call(vis.xAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").remove())

        vis.yAxisG.call(vis.yAxis)
            .call(g => g.select(".domain").remove())
    }
}