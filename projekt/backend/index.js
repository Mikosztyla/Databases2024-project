const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define Schemas
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    employee_number: { type: Number, required: true, unique: true },
    password: { type: String, required: true }
});

const resSchema = new mongoose.Schema({
    employee_id: { type: String, required: true },
    client: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true },
    table: { type: String, required: true },
});


async function cleanReservations() {
    const today = new Date();
    const day = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
    const month = today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1;
    const dateOfToday = `${today.getFullYear()}-${month}-${day}`;
    
    console.log('Date of Today:', dateOfToday);
    
    try {
      const result = await Res.deleteMany({ date: { $lt: dateOfToday } });
      console.log(`${result.deletedCount} old reservations deleted`);
    } catch (err) {
      console.error('Error deleting old reservations:', err);
    }
}

resSchema.post('save', function(doc) {
    cleanReservations();
})

const expenseSchema = new mongoose.Schema({
    employee_number: { type: Number, required: true },
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    date: { type: String, required: true },
});

const incomeSchema = new mongoose.Schema({
    employee_number: { type: Number, required: true },
    order_id: { type: String, required: true },
    price: { type: Number, required: true },
    date: { type: String, required: true },
});

const propertiesSchema = new mongoose.Schema({
    numberOfTables: { type: Number, required: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    closedDays: [{ type: String, required: true }]
});

// Create Models
const Employee = mongoose.model('Employee', employeeSchema);
const Expense = mongoose.model('Expense', expenseSchema);
const Income = mongoose.model('Income', incomeSchema);
const Properties = mongoose.model('Properties', propertiesSchema);
const Res = mongoose.model('Res', resSchema);


const propertiesFilePath = path.join(__dirname, '../config/restaurantProperties.json');
let isPropertiesInserted = false;

const readAndInsertProperties = async () => {
    fs.readFile(propertiesFilePath, 'utf8', async (err, data) => {
        if (err) {
            return console.error('Failed to read restaurant properties file:', err);
        }
        const properties = JSON.parse(data);

        try {
            await Properties.deleteMany({});
            await Properties.create(properties);
            console.log('Restaurant properties inserted into database');
            isPropertiesInserted = false;
        } catch (error) {
            console.error('Error inserting restaurant properties into database:', error);
        }
    });
};

fs.watch(propertiesFilePath, (eventType, filename) => {
    if (eventType === 'change') {
        if (!isPropertiesInserted) {
            isPropertiesInserted = true;
            readAndInsertProperties();
            console.log('Restaurant properties file changed, updating database');
        }
    }
});

readAndInsertProperties();

// Routes
app.get('/config', async (req, res) => {
    try {
        const config = await Properties.find();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get("/employees", async (req, res) => {
    try {
        const employees = await Employee.find({}, '-password'); // Exclude password field
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/employeeAdd", async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        res.status(201).json({ message: 'Employee added successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) { // Duplicate key error
            res.status(409).json({message: 'Duplicate value error. Please change the value of the unique field.'});
        } else {
            res.status(400).send("Error adding new employee");
        }
    }
});

app.post("/login", async (req, res) => {
    try {
        const { employee_number, password } = req.body;
        const employee = await Employee.findOne({ employee_number });

        if (!employee) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (employee.password === password) {
            res.status(200).json({ id: employee.employee_number });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post("/res", async (req, res) => {
    try {
        const { employee_id, date, time, duration, table } = req.body;
        if (!employee_id || !date || !time || !duration || !table) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newRes = new Res(req.body);
        await newRes.save();
        res.status(201).json({ message: 'Reservation successful' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Reservation not successful', error: error.message });
    }
});

app.get("/reservations", async (req, res) => {
    try {
        const reservations = await Res.find();
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching reservations', error: error.message });
    }
});

app.delete('/reservations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Res.findByIdAndDelete(id);
        res.status(200).send({ message: 'Reservation deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting reservation', error });
    }
});

app.post('/deleteAccount', async (req, res) => {
    try {
        const { employee_number } = req.body;
        const employee = await Employee.findOneAndDelete({ employee_number });

        if (!employee) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/expense', async (req, res) => {
    const expense = new Expense({
        employee_number: req.body.employee_number,
        item: req.body.item,
        quantity: req.body.quantity,
        unit_price: req.body.price,
        date: req.body.date
    });

    try {
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an expense
app.put('/expenses/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        expense.employee_number = req.body.employee_number || expense.employee_number;
        expense.item = req.body.item || expense.item;
        expense.quantity = req.body.quantity || expense.quantity;
        expense.unit_price = req.body.price || expense.price;
        expense.date = req.body.date || expense.date;

        const updatedExpense = await expense.save();
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.get("/expensesList", async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'An error occurred while fetching expenses.' });
    }
});


// Route to delete an expense by ID
app.delete('/expenses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedExpense = await Expense.findByIdAndDelete(id);
        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch all incomes
app.get('/incomesList', async (req, res) => {
    try {
        const incomes = await Income.find();
        res.json(incomes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new income
app.post('/income', async (req, res) => {
    const income = new Income({
        employee_number: req.body.employee_number,
        order_id: req.body.order_id,
        price: req.body.price,
        date: req.body.date
    });

    try {
        const newIncome = await income.save();
        res.status(201).json(newIncome);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an income
app.put('/incomes/:id', async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        income.order_id = req.body.order_id || income.order_id;
        income.price = req.body.price || income.price;
        income.date = req.body.date || income.date;

        const updatedIncome = await income.save();
        res.json(updatedIncome);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an income
app.delete('/incomes/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const deletedIncome = await Income.findOneAndDelete(id);
        if (!deletedIncome) {
            return res.status(404).json({ message: 'Income not found' });
        }
        res.json({ message: 'Income deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const getEmployeeTurnover = async (selectedYear = null, selectedMonth = null) => {
    try {
        const matchStage = {};

        if (selectedYear) {
            matchStage.year = selectedYear;
        }

        if (selectedMonth) {
            matchStage.month = selectedMonth;
        }

        const pipeline = [
            {
                $addFields: {
                    year: { $year: { $toDate: "$date" } },
                    month: { $month: { $toDate: "$date" } }
                }
            },
            {
                $match: Object.keys(matchStage).length ? matchStage : {}
            },
            {
                $project: {
                    employee_number: 1,
                    price: 1
                }
            },
            {
                $unionWith: {
                    coll: "expenses",
                    pipeline: [
                        {
                            $addFields: {
                                year: { $year: { $toDate: "$date" } },
                                month: { $month: { $toDate: "$date" } }
                            }
                        },
                        {
                            $match: Object.keys(matchStage).length ? matchStage : {}
                        },
                        {
                            $project: {
                                employee_number: 1,
                                price: { $multiply: ["$unit_price", "$quantity"] }
                            }
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: "$employee_number",
                    count: { $sum: 1 },
                    monetary_turnover: { $sum: "$price" }
                }
            },
            {
                $sort: {
                    count: -1
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "_id",
                    foreignField: "employee_number",
                    as: "employee_info"
                }
            },
            {
                $unwind: "$employee_info"
            },
            {
                $project: {
                    name: "$employee_info.name",
                    surname: "$employee_info.surname",
                    _id: 0,
                    count: 1,
                    monetary_turnover: 1
                }
            }
        ];

        return await Income.aggregate(pipeline);
    } catch (err) {
        console.error('Error in aggregation:', err);
        throw err;
    }
};

app.get('/employeeTurnover', async (req, res) => {
    try {
        const selectedYear = req.query.year ? parseInt(req.query.year) : null;
        const selectedMonth = req.query.month ? parseInt(req.query.month) : null;

        const turnoverData = await getEmployeeTurnover(selectedYear, selectedMonth);
        res.json(turnoverData);
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

app.post('/saveTurnoverData', async (req, res) => {
    try {
        const { turnoverData } = req.body;
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(turnoverData);
        
        const filePath = path.join("../", 'data.csv');
        fs.writeFile(filePath, csv, (err) => {
            if (err) {
                console.error('Error writing CSV file', err);
                return res.status(500).json({ message: 'Error writing CSV file', error: err.message });
            }
            res.status(200).json({ message: 'CSV file has been saved', filePath });
        });
    } catch (error) {
        console.error('Error generating CSV:', error);
        res.status(500).json({ message: 'Error generating CSV', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});