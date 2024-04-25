import "./App.css";
import Plot from "react-plotly.js";
import React, { useState, useEffect } from "react";

const CSV_FILE_PATH = "https://tailtest.s3.ap-south-1.amazonaws.com/demo.csv";

function processData(csvData) {
  let data = {
    labels: [],
    parents: [],
    values: [],
    ids: [],
  };

  const rows = csvData.split("\n");

  rows.forEach((row) => {
    let ele = "";
    const columns = row.split(",");
    const [col1, col2, col3, col4] = columns.map((c) => c.trim());

    if (col1 && !data.labels.includes(col1)) {
      data.labels.push(col1);
      data.ids.push(col1);
      data.parents.push("");
    }

    if (col2 && !data.ids.includes(col1 + col2)) {
      data.labels.push(col2);
      data.ids.push(col1 + col2);
      data.parents.push(col1);
    }

    if (col3) {
      data.labels.push(col3);
      function checkEntry(ele) {
        if (data.ids.includes(ele)) {
          ele += "1";
          return checkEntry(ele);
        } else {
          data.ids.push(ele);
          return ele;
        }
      }
      ele = checkEntry(col3);
      data.parents.push(col1 + col2);
    }

    const index1 = data.ids.indexOf(col1);
    const index2 = data.ids.indexOf(col1 + col2);
    const index3 = data.ids.lastIndexOf(ele);

    [index1, index2, index3].forEach((index) => {
      if (index !== -1) {
        if (!data.values[index]) {
          data.values[index] = 0;
        }
        data.values[index] += parseFloat(col4);
      }
    });
  });

  return data;
}

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(CSV_FILE_PATH);
        const csvData = await response.text();
        const processedData = processData(csvData);
        setData(processedData);
      } catch (err) {
        console.error("Error fetching or processing CSV:", err);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Plot
        data={[
          {
            type: "sunburst",
            ids: data.ids,
            labels: data.labels,
            parents: data.parents,
            values: data.values,
            outsidetextfont: { size: 20, color: "#377eb8" },
            leaf: { opacity: 0.4 },
            marker: { line: { width: 2 } },
            branchvalues: "total",
          },
        ]}
        layout={{
          margin: { l: 0, r: 0, b: 0, t: 0 },
          width: 700,
          height: 700,
        }}
      />
    </div>
  );
}

export default App;
