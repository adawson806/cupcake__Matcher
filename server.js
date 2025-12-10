const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const db = require('./db_config'); 

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- In-Memory Quiz State ---
const quizSessions = {}; 

// --- Decision Tree Structure ---
const quizTree = {
    // Step 1: Base options
    'start': ['Basic', 'Nutty', 'Fruity', 'Spice/Savory', 'Boozy/Beverage'],

    // Step 2: Icing options
    'Basic': ['Chocolate', 'Vanilla', 'Mocha', 'Buttercream'],
    'Nutty': ['Peanut Butter', 'Coconut Cream', 'Caramel', 'Maple'],
    'Fruity': ['Cream Cheese', 'Lemon', 'Strawberry', 'Berry'],
    'Spice/Savory': ['Cream Cheese', 'Caramel', 'Cinnamon', 'None'],
    'Boozy/Beverage': ['Cream Cheese', 'Chocolate', 'Espresso', 'Wine Infused'],

    // Step 3: Topping options (Examples used in client-side code)
    'Chocolate': ['Sprinkles', 'Candy Bar', 'Fudge Sauce', 'Cherry'],
    'Vanilla': ['Sprinkles', 'Cherry', 'Fudge Sauce', 'Candied Pecans'],
    'Mocha': ['Espresso Powder', 'Chocolate Shavings', 'Whipped Cream', 'Toffee'],
    'Buttercream': ['Sprinkles', 'Caramel Drizzle', 'Cherry', 'None'],
    'Cream Cheese': ['Nuts', 'Zest', 'Berries', 'Caramel'],
    'Lemon': ['Sugar Dust', 'Mint', 'Candied Lemon'],
    'Strawberry': ['Fresh Slices', 'Chocolate Drizzle'],
    'Berry': ['Whipped Cream', 'Powdered Sugar'],
};


// --- Flavor Profile Logic (Advanced Function 1) ---
const getFlavorProfile = (base, icing, topping) => {
    if (base === 'Basic' && (icing === 'Chocolate' || icing === 'Vanilla')) {
        return { profile: 'Classic Connoisseur', message: 'You have a refined palate for the classics! Here are your perfect matches.' };
    }
    if (base === 'Fruity' && (icing === 'Lemon' || icing === 'Strawberry')) {
        return { profile: 'Fruity Fanatic', message: 'A burst of fresh flavor is what you crave! Check out these bright and zingy options.' };
    }
    if (base === 'Nutty' && icing === 'Peanut Butter') {
        return { profile: 'Nutty Indulger', message: 'You appreciate the comforting crunch and rich flavor of nuts. Your dream cupcakes await!' };
    }
    if (base === 'Spice/Savory' || base === 'Boozy/Beverage') {
        return { profile: 'Adventurous Eater', message: 'You like to walk on the wild side! These complex flavors are sure to surprise and delight.' };
    }
    return { profile: 'Sweet Tooth Specialist', message: 'You love all things sweet and decadent! Feast your eyes on these treats.' };
};

// --- Helper to fetch Cupcake and Retailer data (Used by Quiz, Search, and Recipe) ---
async function fetchCupcakesAndRetailers(cupcakeNames) {
    if (!cupcakeNames || cupcakeNames.length === 0) return [];

    // SQL to fetch cupcakes and their retailers
    const sql = `
        SELECT 
            c.cname AS cupcake,
            r.rname,
            r.location
        FROM 
            cupcake c
        LEFT JOIN 
            cupcake_available_at caa ON c.cname = caa.cname
        LEFT JOIN 
            retailer r ON caa.rname = r.rname AND caa.location = r.location
        WHERE 
            c.cname IN (?)
    `;

    return new Promise((resolve, reject) => {
        db.query(sql, [cupcakeNames], (err, results) => {
            if (err) return reject(err);

            // Group results by cupcake name to handle multiple retailers per cupcake
            const grouped = {};
            results.forEach(row => {
                const cname = row.cupcake;
                if (!grouped[cname]) {
                    // Initialize the cupcake entry
                    grouped[cname] = { cupcake: cname, retailers: [] };
                }
                // Only add retailer if one exists (i.e., not a null result from LEFT JOIN)
                if (row.rname) {
                    grouped[cname].retailers.push({ rname: row.rname, location: row.location });
                }
            });
            
            // Ensure all requested names are included, even if they had no retailer (for completeness)
            const finalResults = cupcakeNames.map(name => grouped[name] || { cupcake: name, retailers: [] });
            
            resolve(finalResults);
        });
    });
}


// --- API Endpoints ---

// 1. Start Quiz
app.post('/api/quiz/start', (req, res) => {
    const sessionID = uuidv4();
    quizSessions[sessionID] = {
        state: 'base',
        base: null,
        icing: null,
        topping: null
    };
    res.json({ sessionID, options: quizTree['start'] });
});

// 2. Answer Quiz Step
app.post('/api/quiz/answer', async (req, res) => {
    const { sessionID, answer } = req.body;
    const session = quizSessions[sessionID];

    if (!session) return res.status(404).send('Session not found');

    if (session.state === 'base') {
        session.base = answer;
        session.state = 'icing';
        const nextOptions = quizTree[answer];
        if (!nextOptions) return res.status(400).send('Invalid base choice');
        res.json({ options: nextOptions });
    } else if (session.state === 'icing') {
        session.icing = answer;
        session.state = 'topping';
        const nextOptions = quizTree[answer] || ['Sprinkles', 'Cherry', 'Caramel Drizzle', 'Chocolate Chips']; 
        res.json({ options: nextOptions });
    } else if (session.state === 'topping') {
        session.topping = answer;
        session.state = 'complete';

        const { profile, message } = getFlavorProfile(session.base, session.icing, session.topping);

        let targetCupcakeNames = [];
        if (profile === 'Fruity Fanatic') {
            targetCupcakeNames = ['Raspberry Lemon', 'Almond Joy'];
        } else if (profile === 'Classic Connoisseur') {
            targetCupcakeNames = ['Classic Vanilla', 'Death by Chocolate', 'Funfetti'];
        } else if (profile === 'Nutty Indulger') {
            targetCupcakeNames = ['Peanut Butter Hi Hat', 'Mocha Nutella'];
        } else if (profile === 'Adventurous Eater') {
            targetCupcakeNames = ['Pumpkin Spice Latte', 'Triple Chocolate Jack Daniels', 'Carrot Cake'];
        } else {
            targetCupcakeNames = ['Death by Chocolate', 'Mocha Nutella']; 
        }

        const recommendations = await fetchCupcakesAndRetailers(targetCupcakeNames).catch(e => {
            console.error('Retailer fetch error:', e);
            return [];
        });

        res.json({
            recommendation: {
                message,
                profile,
                cupcakes: recommendations
            }
        });

    } else {
        res.status(400).send('Quiz already completed or in an invalid state');
    }
});

// 3. Basic Search
app.get('/api/search', (req, res) => {
    const keyword = req.query.q;
    if (!keyword) return res.status(400).send('Missing search query');

    const searchKeyword = `%${keyword.toLowerCase()}%`;

    const sql = `
        SELECT c.cname, GROUP_CONCAT(i.iname SEPARATOR ', ') as ingredients
        FROM cupcake c
        JOIN contains con ON c.cname = con.cname
        JOIN ingredients i ON con.iname = i.iname
        WHERE LOWER(c.cname) LIKE ? OR LOWER(i.iname) LIKE ?
        GROUP BY c.cname
        LIMIT 10;
    `;
    
    db.query(sql, [searchKeyword, searchKeyword], async (err, results) => { 
        if (err) {
            console.error('DB Search Error:', err);
            return res.status(500).send('Database error during search');
        }

        const cupcakeNames = results.map(row => row.cname);
        
        // Fetch retailers for search results
        const detailedResults = await fetchCupcakesAndRetailers(cupcakeNames).catch(e => {
            console.error('Retailer fetch error in search:', e);
            return [];
        });

        // Merge ingredients back into the detailed results
        const finalResults = detailedResults.map(dr => {
            const originalResult = results.find(r => r.cname === dr.cupcake);
            return {
                ...dr,
                ingredients: originalResult ? originalResult.ingredients : 'N/A'
            };
        });

        res.json({ results: finalResults });
    });
});

// 4. Recipe Suggestion (Advanced Function 2)
app.post('/api/recipes/suggest', async (req, res) => { 
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).send('Please provide a list of ingredients.');
    }

    const ingredientPlaceholders = ingredients.map(() => '?').join(', ');
    const lowerCaseIngredients = ingredients.map(i => i.toLowerCase());

    // SQL to find cupcakes where ALL their required ingredients are in the user's pantry list
    const sql = `
        SELECT 
            c.cname,
            GROUP_CONCAT(con.iname SEPARATOR ', ') as ingredients,
            COUNT(con.iname) AS required_ingredients_count,
            SUM(CASE WHEN LOWER(con.iname) IN (${ingredientPlaceholders}) THEN 1 ELSE 0 END) AS available_ingredients_count
        FROM 
            cupcake c
        JOIN 
            contains con ON c.cname = con.cname
        JOIN 
            ingredients i ON con.iname = i.iname
        GROUP BY 
            c.cname
        HAVING 
            required_ingredients_count = available_ingredients_count;
    `;

    // Wrap the database query in a Promise for clean async/await
    const sqlPromise = new Promise((resolve, reject) => {
        // IMPORTANT: The placeholder parameters must match the number of placeholders (ingredientPlaceholders)
        db.query(sql, lowerCaseIngredients, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    try {
        const results = await sqlPromise;
        const cupcakeNames = results.map(r => r.cname);
        
        // Fetch retailers for recipe results
        const detailedResults = await fetchCupcakesAndRetailers(cupcakeNames).catch(e => {
            console.error('Retailer fetch error in recipe:', e);
            return [];
        });

        // Merge ingredients back into the detailed results
        const finalResults = detailedResults.map(dr => {
            // Find the original result to get the full ingredient list (GROUP_CONCAT)
            const originalResult = results.find(r => r.cname === dr.cupcake);
            return {
                ...dr,
                ingredients: originalResult ? originalResult.ingredients : 'N/A'
            };
        });

        res.json({ possibleCupcakes: finalResults });
    } catch (err) {
        console.error('Recipe Suggestion DB Error:', err);
        return res.status(500).send('Database error during recipe suggestion');
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});