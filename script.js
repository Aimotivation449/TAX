let csvData = [];
let uniqueData = []; // Array to store only unique rows by Regt. No.

function uploadFile() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (file) {
        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: function(results) {
                csvData = results.data.slice(1); // Ignore the first row (header)
                filterUniqueRows(); // Filter unique rows by column A (Regt. No.)
                alert("File uploaded successfully!");
                document.querySelector('.search-section').style.display = 'flex';
                displayTable(uniqueData); // Display the unique rows initially
            },
            error: function(error) {
                console.error("Error parsing CSV:", error);
                alert("There was an error uploading the file. Please try again.");
            }
        });
    } else {
        alert("Please select a file to upload.");
    }
}

function filterUniqueRows() {
    const seen = new Set();
    uniqueData = csvData.filter(row => {
        const regtNo = row[0];
        if (seen.has(regtNo)) {
            return false;
        }
        seen.add(regtNo);
        return true;
    });
}

function displayTable(data) {
    const resultDiv = document.getElementById('result');
    let tableHTML = `
        <table border="1">
            <tr>
                <th>Regt. No.</th>
                <th>Rank</th>
                <th>Name</th>
                <th>Total Salary</th>
                <th>Standard Deduction</th>
                <th>Taxable Income</th>
                <th>Tax (New Regime)</th>
                <th>Education Cess</th>
                <th>Total Tax for FY</th>
            </tr>`;

    // Calculate total salary based on unique Regt. No.
    const totalSalaryData = calculateAverageSalary();

    data.forEach(row => {
        const regtNo = row[0];
        const rank = row[2];
        const name = row[4];
        const totalSalary = totalSalaryData[regtNo]; // Get annual calculated salary for this Regt. No.
        const standardDeduction = 75000;
        const taxableIncome = totalSalary - standardDeduction;
        let tax = calculateTax(taxableIncome);
        let educationCess = Math.round(tax * 0.04);

        if (tax < 0) {
            tax = 0;
            educationCess = 0;
        }

        const totalTax = tax + educationCess;

        tableHTML += `
            <tr class="data-row">
                <td>${regtNo}</td>
                <td>${rank}</td>
                <td>${name}</td>
                <td>${totalSalary}</td>
                <td>${standardDeduction}</td>
                <td>${taxableIncome}</td>
                <td>${tax}</td>
                <td>${educationCess}</td>
                <td>${totalTax}</td>
            </tr>`;
    });

    tableHTML += '</table>';
    resultDiv.innerHTML = tableHTML;
}

function search() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const filteredData = uniqueData.filter(row => row[0].toLowerCase().includes(searchInput));
    displayTable(filteredData); // Display only the filtered rows
}

// Function to calculate average salary by summing values in column AD for each unique Regt. No. and dividing by count
function calculateAverageSalary() {
    const regtNoSalaryMap = {}; // Map to store total salary per Regt. No.
    const regtNoCountMap = {};  // Map to store count of each Regt. No.

    csvData.forEach(row => {
        const regtNo = row[0]; // Column A (Regt. No.)
        const salary = parseFloat(row[29]) || 0; // Column AD (assuming it's column 29)

        // Initialize if Regt. No. is not yet in the maps
        if (!regtNoSalaryMap[regtNo]) {
            regtNoSalaryMap[regtNo] = 0;
            regtNoCountMap[regtNo] = 0;
        }

        // Accumulate salary and increment count for each Regt. No.
        regtNoSalaryMap[regtNo] += salary;
        regtNoCountMap[regtNo]++;
    });

    // Calculate average monthly salary and annualize it
    for (const regtNo in regtNoSalaryMap) {
        const averageMonthlySalary = regtNoSalaryMap[regtNo] / regtNoCountMap[regtNo];
        regtNoSalaryMap[regtNo] = Math.round(averageMonthlySalary * 12); // Annualize the average monthly salary
    }

    return regtNoSalaryMap; // Return the map with annualized average salaries for each Regt. No.
}

function calculateTax(income) {
    const slabs = [
        { limit: 300000, rate: 0 },
        { limit: 400000, rate: 0.05 },
        { limit: 300000, rate: 0.1 },
        { limit: 200000, rate: 0.15 },
        { limit: 300000, rate: 0.2 },
        { limit: Infinity, rate: 0.3 }
    ];

    let tax = 0;
    let remainingIncome = income;

    for (let i = 0; i < slabs.length; i++) {
        const { limit, rate } = slabs[i];

        if (remainingIncome <= limit) {
            tax += remainingIncome * rate;
            break;
        } else {
            tax += limit * rate;
            remainingIncome -= limit;
        }
    }


    if (income <= 700000) { // Apply Section 87A rebate
        tax -= 20000; // Rebate of Rs. 20,000
    }

    return Math.round(tax);
}

function exportToExcel() {
    const resultDiv = document.getElementById('result');
    const table = resultDiv.querySelector('table');

    if (!table) {
        alert("No data available to export.");
        return;
    }

    const workbook = XLSX.utils.table_to_book(table, { sheet: "Data" });
    const excelFileName = 'Calculator_Data.xlsx';

    XLSX.writeFile(workbook, excelFileName);
}
