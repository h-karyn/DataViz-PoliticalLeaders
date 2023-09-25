/**
 * Load data from CSV file asynchronously and render charts
 */
let data, scatterplot, barChart, lexisChart;
const dispatcher = d3.dispatch('filterGender','selectedItems');
let filteredData;
let currentGender = null;
let selectedItems = [];

d3.csv('data/leaderlist.csv').then(data_ => {

    data = data_

    // Convert columns to numerical values
    data.forEach(d => {
        Object.keys(d).forEach(attr => {
            if (attr == 'pcgdp') {
                d[attr] = (d[attr] == 'NA') ? null : +d[attr];
            } else if (attr != 'country' && attr != 'leader' && attr != 'gender') {
                d[attr] = +d[attr];
            }
        });
    });

    //  filter the global data where duration > 0
    data = data.filter(d => {
        return d.duration > 0;
    });


    data.sort((a, b) => a.label - b.label);

    // set the default selection: oecd countries
    let defaultData = data.filter(d => {
        return d['oecd'] == 1;
    });

    filteredData = defaultData;

    lexisChart = new LexisChart({parentElement: "#lexis-chart"}, defaultData, dispatcher);
    lexisChart.updateVis();

    barChart = new BarChart({parentElement: '#bar-chart'}, defaultData, dispatcher);
    barChart.updateVis();

    scatterplot = new ScatterPlot({parentElement: '#scatter-plot'}, defaultData, dispatcher);
    scatterplot.updateVis();
})
    .catch(error => console.error(error));

/**
 * Select box event listener
 */
d3.select('#country-selector').on('change', function() {

    // reset glocal variables
    currentGender = null;
    selectedItems = []

    // Get the value of the selected option
    const country = d3.select(this).property('value');

    // Filter data based on the selected option
    filteredData = data.filter(d => d[country] == 1);

    barChart.data = filteredData;
    lexisChart.data = filteredData;
    scatterplot.data = filteredData;

    // Update the visualization with the filtered data
    barChart.updateVis();
    lexisChart.updateVis();
    scatterplot.updateVis();
});

/** add event listener to the BarChart dispatcher*/
dispatcher.on('filterGender', selectedGender => {

    let dataByGender;

    if (selectedGender == currentGender) {
        currentGender = null;
        dataByGender = filteredData;
    } else {
        currentGender = selectedGender;
        dataByGender = filteredData.filter(person => person.gender === selectedGender);
    }

    barChart.data = dataByGender;
    lexisChart.data = dataByGender;

    lexisChart.updateVis();
    scatterplot.updateVis();
});

/** add event listener to the BarChart dispatcher*/
dispatcher.on('selectedItems', () => {
    lexisChart.updateVis();
    scatterplot.updateVis();
});