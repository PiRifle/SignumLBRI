import $ from "jquery";
const moment = require("moment");
//@ts-ignore
// import "chart.js/dist/chart";
import { Chart } from "chart.js";
// const Chart = require("chartjs");
require("./lib/daterangepicker");
import "@popperjs/core";
import feather from "feather-icons";
import "bootstrap";

async function getDataset(path: string) {
  const f = await fetch(path);
  if (f.status == 200) {
    return await f.json();
  } else {
    return [];
  }
}

$(document).ready(() => {
  ("use strict");
  feather.replace({ "aria-hidden": "true" });
  // Graphs
  var timeFormat = "DD/MM/YYYY/HH:mm:ss";
  var config = {
    type: "scatter",
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Time",
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              parser: timeFormat,
              tooltipFormat: timeFormat,
              unit: "day",
            },
            scaleLabel: {
              display: true,
              labelString: "Date",
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
            scaleLabel: {
              display: true,
              labelString: "Operations",
            },
          },
        ],
      },
    },
  };
  const ctx = document.getElementById("myChart");
  //@ts-ignore
  const dataset = $(ctx).attr("datasetSource");
  //@ts-ignore
  var myChart = new Chart(ctx, config);

  if (dataset) {
    $('input[name="dates"]')
      //@ts-ignore
      .daterangepicker(
        {
          showDropdowns: true,
          timePicker24Hour: true,
          autoApply: true,
          ranges: {
            //@ts-ignore
            Today: [moment(), moment()],
            Yesterday: [
              //@ts-ignore
              moment().subtract(1, "days"),
              //@ts-ignore
              moment().subtract(1, "days"),
            ],
            //@ts-ignore
            "Last 7 Days": [moment().subtract(6, "days"), moment()],
            //@ts-ignore
            "Last 30 Days": [moment().subtract(29, "days"), moment()],
            //@ts-ignore
            "This Month": [moment().startOf("month"), moment().endOf("month")],
            "Last Month": [
              //@ts-ignore
              moment().subtract(1, "month").startOf("month"),
              //@ts-ignore
              moment().subtract(1, "month").endOf("month"),
            ],
          },
          alwaysShowCalendars: true,
        },
        function (start: any, end: any, label: any) {
          const url = new URL(location.href);
          url.pathname = "/admin/" + dataset;
          url.search = new URLSearchParams([
            ["from", new Date(start).toUTCString()],
            ["to", new Date(end).toUTCString()],
            ["exact", "true"],
          ]).toString();
          getDataset(url.toString()).then((data) => {
            console.log(data);

            console.log(myChart);
            if (myChart) {
              myChart.data = { datasets: data };
              myChart.update();
            }
          });
        },
      );
  }
});
