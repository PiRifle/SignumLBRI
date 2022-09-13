/* globals Chart:false, feather:false, moment:false */
async function getDataset(path: string){
  const f = await fetch(path)
  if (f.status == 200){
    return await f.json()
  }else{
    return []
  }
}
$(document).ready(()=>{
  ("use strict");
  //@ts-ignore
  feather.replace({ "aria-hidden": "true" });
  // Graphs
    var timeFormat = "DD/MM/YYYY/HH:mm:ss";
   var config = {
     type: "line",
     options: {
       responsive: true,
       title: {
         display: true,
         text: "Chart.js Time Scale",
       },
       scales: {
         xAxes: [
           {
             type: "time",
             time: {
               parser: timeFormat,
               tooltipFormat: timeFormat,
               // unit: ""
             },
             scaleLabel: {
               display: true,
               labelString: "Date",
             },
           },
         ],
         yAxes: [
           {
             scaleLabel: {
               display: true,
               labelString: "value",
             },
           },
         ],
       },
     },
   };
  const ctx = document.getElementById("myChart");
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
            //@ts-ignore
            console.log(myChart);
            
            myChart.data = {datasets: data};
            //@ts-ignore
            myChart.update();
          });
        }
      );
  }
})

