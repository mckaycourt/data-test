const express = require('express');
const router = express.Router();
const data = require('../public/data.json');
const clusterMaker = require('clusters');
/* GET home page. */


function getMin(rows) {
    let min = 0;
    let i = 0;
    for (let row of rows) {
        if (i === 0) {
            min = row.doc.go_memstats_gc_sys_bytes;
        }
        if (row.doc.go_memstats_gc_sys_bytes < min) {
            min = row.doc.go_memstats_gc_sys_bytes;
        }
        i++;
    }
    return min;
}

function getMax(rows) {
    let min = 0;
    let i = 0;
    for (let row of rows) {
        if (i === 0) {
            min = row.doc.go_memstats_gc_sys_bytes;
        }
        if (row.doc.go_memstats_gc_sys_bytes > min) {
            min = row.doc.go_memstats_gc_sys_bytes;
        }
        i++;
    }
    return min;
}

//https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
function standardDeviation(values) {
    let avg = average(values);

    let squareDiffs = values.map(function (value) {
        let diff = value - avg;
        let sqrDiff = diff * diff;
        return sqrDiff;
    });

    let avgSquareDiff = average(squareDiffs);

    let stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

function average(data) {
    let sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    let avg = sum / data.length;
    return avg;
}

router.get('/', function (req, res, next) {
    let rows = data.rows;
    let arrData = rows.map((row) => {
        let timestamp = row.doc.timestamp;
        let options = timestamp.split('_');
        let date = new Date(options[2], options[1], options[0], options[3], options[4], options[5], 0);
        return [date.getTime(), row.doc.go_memstats_gc_sys_bytes];
    });
    let stdData = rows.map((row) => {
        return row.doc.go_memstats_gc_sys_bytes;
    });
    let stdev = standardDeviation(stdData);
    let min = getMin(rows);
    let max = getMax(rows);

    clusterMaker.k(3);
    clusterMaker.iterations(1000);
    clusterMaker.data(arrData);
    let clusters = clusterMaker.clusters();
    console.log(clusters);
    res.render('index', {title: 'go_memstats_gc_sys_bytes', min, max, stdev, clusters, clustersString: JSON.stringify(clusters), allData: JSON.stringify(arrData)});
});

module.exports = router;