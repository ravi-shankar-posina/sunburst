const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

const CSV_FILE_PATH = "demo.csv";

// Read and process the CSV file
function processData() {
    try {
        const csvData = fs.readFileSync(CSV_FILE_PATH, "utf-8");
        const rows = csvData.split("\n");
        const labels = [];
        const parents = [];

        rows.forEach((row) => {
            const columns = row.split(",");
            const col1 = columns[0].trim(); // Assuming the first column doesn't contain commas
            const col2 = columns[1].trim(); // Assuming the second column doesn't contain commas
            const col3 = columns.slice(2).join(",").trim();


            if (col1 && !labels.includes(col1)) {
                labels.push(col1);
                parents.push("");
            }

            if (col2 && !labels.includes(col2)) {
                labels.push(col2);
                parents.push(col1);
            }

            if (col3) {
                labels.push(col3);
                parents.push(col2);
            }
        });

        return { labels, parents };
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
