const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

const CSV_FILE_PATH = "demo.csv";

// Read and process the CSV file
function processData() {
  let data = {
    labels: [],
    parents: [],
    values: [],
    ids:[]
  };

  try {
    const csvData = fs.readFileSync(CSV_FILE_PATH, "utf-8");
    const rows = csvData.split("\n");

    rows.forEach((row) => {
      let ele=''
      const columns = row.split(",");
      const [col1, col2, col3, col4] = columns.map(c => c.trim());

      if (col1 && !data.labels.includes(col1)) {
        data.labels.push(col1);
        data.ids.push(col1);
        data.parents.push("");
      }

      if (col2 && !data.ids.includes(col1+col2)) {
        data.labels.push(col2);
        data.ids.push(col1+col2);
        data.parents.push(col1);
      }

      if (col3) {
        data.labels.push(col3);
        function checkEntry(ele){
          if (data.ids.includes(ele)){
            ele+='1'
            checkEntry(ele)
          }
          else{
            data.ids.push(ele)
            return ele
          }
        }
        ele = checkEntry(col3)
        data.parents.push(col1+col2);
      }
      // console.log(col1+"-"+col2+"-"+col3+"-"+col4)
      const index1 = data.ids.indexOf(col1);
      const index2 = data.ids.indexOf(col1+col2);
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
  } catch (err) {
    console.error("Error reading or processing CSV:", err);
    return { error: "Internal server error" };
  }
}

// Endpoint to serve processed data
app.get("/sunburst-data", (req, res) => {
  const data = processData();
  if (data.error) {
    res.status(500).json({ error: data.error });
  } else {
    res.json(data);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
