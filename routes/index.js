const express = require('express');
const router = express.Router();
const data = require('../public/data.json');

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
        return row.doc.go_memstats_gc_sys_bytes;
    });
    let stdev = standardDeviation(arrData);
    let min = getMin(rows);
    let max = getMax(rows);


    res.render('index', {title: 'go_memstats_gc_sys_bytes', min, max, stdev});
});

module.exports = router;
