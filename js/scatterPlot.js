class ScatterPlot {

    constructor(_config, _data, _dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            colorScale: _config.colorScale,
            containerWidth: 650,
            containerHeight: _config.containerHeight || 250,
            margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35},
            tooltipPadding: _config.tooltipPadding || 15
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

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSize(-vis.height - 10)
            .tickPadding(10)

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(-vis.width - 10)
            .tickPadding(10);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)
            .attr('width', vis.width)
            .attr('height', vis.height);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')

        // X-axis has the label "GDP per Capita (US$)" in the bottom right
        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('x', vis.width + 15)
            .attr('y', vis.height)
            .attr('text-anchor', 'end')
            .text('GDP per Capita (US$)');
        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('x', -5)
            .attr('y', -10)
            .attr('text-anchor', 'end')
            .text('Age');
    }

    updateVis() {

        let vis = this;

        // Prepare data and scales
        vis.data = vis.data.filter(d => d.pcgdp !== null);

        // filter selectedItems by gender
        if (currentGender !== null) {
            selectedItems = selectedItems.filter(d => d.gender === currentGender)
        }

        vis.xValue = d => d.pcgdp;
        vis.yValue = d => d.start_age;

        // Set the scale input domains
        vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);
        vis.yScale.domain([25, 95]);

        vis.renderVis();
    }

    renderVis() {

        let vis = this;

        // Add circles
        const circles = vis.chart.selectAll('.point')
            .data(vis.data)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 5)
            .attr('cy', d => vis.yScale(vis.yValue(d)))
            .attr('cx', d => vis.xScale(vis.xValue(d)))
            .attr('fill', function (d) {
                if (selectedItems.includes(d)) {
                    return '#f8a60e';
                } else {
                    return '#5d29ea';
                }
            })
            .attr('stroke', null)
            .attr('stroke-width', null)
            .attr('opacity', d => {
                if (currentGender == null || d.gender === currentGender) {
                    return 0.7;
                } else {
                    return 0.15;
                }
            })

        // add tooltip (copied from p1)
        circles.on("mouseover.tooltip", (event, d) => {
            if (currentGender === null || d.gender === currentGender) {

                let gdp = d.pcgdp === null ? 'missing' : Math.round(d.pcgdp);
                let duration = d.duration <= 1 ? d.duration + ' year' : d.duration + ' years';

                d3
                    .select("#tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + vis.config.tooltipPadding) + "px")
                    .style("top", (event.pageY + vis.config.tooltipPadding) + "px").html(`
              <div style="font-size: 13px;"><strong>${d.leader}</strong></div>
              <div style="font-style: italic; font-size: 12px;">${d.country}, ${d.start_year}-${d.end_year}</div> 
              <li style="font-size: 12px;">Age at inauguration: ${d.start_age}</li>
              <li style="font-size: 12px;">Time in office: ${duration}</li>
              <li style="font-size: 12px;">GDP/capita: ${gdp}</li>
            `);
            }

        }).on('mouseover.point', function (event, d) {
            if (currentGender === null || d.gender === currentGender) {
                if (!selectedItems.includes(d)) {
                    d3.select(this)
                        .attr('stroke', 'black')
                        .attr('fill', "#26115d")
                        .attr('stroke-width', 1);
                } else {
                    d3.select(this)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 1);
                }
            }
        }).on("mouseleave.tooltip", () => {
            d3.select("#tooltip").style("display", "none");
        }).on('mouseleave.point', function (event, d) {
            if (currentGender === null || d.gender === currentGender) {
                if (!selectedItems.includes(d)) {
                    d3.select(this)
                        .attr('stroke', null)
                        .attr('stroke-width', null)
                        .attr('fill', function () {
                            return '#5d29ea';
                        })
                } else {
                    d3.select(this)
                        .attr('stroke', null)
                        .attr('stroke-width', null)
                }
            }
        })

        circles.on('click', function (event, d) {
            if (currentGender === null || d.gender === currentGender) {
                // if index exists in selectedCategories, remove it; otherwise add it
                if (selectedItems.includes(d)) {
                    selectedItems.splice(selectedItems.indexOf(d), 1);
                } else {
                    selectedItems.push(d);
                }
            }
            vis.dispatcher.call('selectedItems', event);
        })

        vis.svg.on("click", function (event) {

            if (event.target.id === "scatter-plot") {
                selectedItems = [];
                vis.dispatcher.call('selectedItems', event);
            }
            vis.dispatcher.call('selectedItems', event);
        });

        // Update the axes/gridlines (copied from p1 and p0)
        vis.xAxisG
            .call(vis.xAxis)
            .call(g => g.select('.domain').remove());

        vis.yAxisG
            .call(vis.yAxis)
            .call(g => g.select('.domain').remove())

    }
}
