const baseGroup = document.getElementById("base-group");
const icingGroup = document.getElementById("icing-group");
const toppingGroup = document.getElementById("topping-group");
const summaryText = document.getElementById("summary-text");
const resultsDiv = document.getElementById("results");
const matchBtn = document.getElementById("match-btn");
const resetBtn = document.getElementById("reset-btn");

const searchBtn = document.getElementById("search-btn");
const recipeBtn = document.getElementById("recipe-btn");

let sessionID = null;
let selections = { base: null, icing: null, topping: null };

// Utility: call backend
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// Step 1: start quiz
async function startQuiz() {
  try {
    const data = await postJSON("/api/quiz/start", {});
    sessionID = data.sessionID;
    createButtons(baseGroup, data.options, selectBase);
  } catch (err) {
    resultsDiv.innerHTML = `<p class="error-message">Error starting quiz: ${err.message}</p>`;
    console.error(err);
  }
}

// Step 2 & 3: select flavor options
async function selectOption(group, type, value, nextSelector, nextHandler) {
  selections[type] = value;
  updateSummary();

  // Clear next step and disable match button
  if (nextSelector) {
    nextSelector.innerHTML = "";
    matchBtn.disabled = true;
  }
  
  if (type === 'topping') {
    matchBtn.disabled = false;
    return; // Quiz step complete, wait for match button click
  }

  // Get next options
  try {
    const data = await postJSON("/api/quiz/answer", { sessionID, answer: value });
    if (nextSelector) {
      createButtons(nextSelector, data.options, nextHandler);
    }
  } catch (err) {
    resultsDiv.innerHTML = `<p class="error-message">Error fetching next options: ${err.message}</p>`;
    console.error(err);
  }
}

const selectBase = (value) => selectOption(baseGroup, 'base', value, icingGroup, selectIcing);
const selectIcing = (value) => selectOption(icingGroup, 'icing', value, toppingGroup, selectTopping);
const selectTopping = (value) => selectOption(toppingGroup, 'topping', value, null, null);


// UI Helper
function createButtons(container, options, handler) {
  container.innerHTML = "";
  options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option;
    button.onclick = () => handler(option);
    container.appendChild(button);
  });
}

// UI Helper
function updateSummary() {
  const { base, icing, topping } = selections;
  const parts = [];
  if (base) parts.push(`Base: ${base}`);
  if (icing) parts.push(`Icing: ${icing}`);
  if (topping) parts.push(`Topping: ${topping}`);
  
  summaryText.textContent = parts.length > 0 ? parts.join(' / ') : "None yet — choose options above.";
}

// Find Match Button Click Handler (Final Quiz Step)
matchBtn.onclick = async () => {
    if (!sessionID || !selections.topping) return;
    matchBtn.disabled = true; // Prevent multiple clicks

    try {
        const data = await postJSON("/api/quiz/answer", { sessionID, answer: selections.topping });
        
        const recommendation = data.recommendation;
        let listHtml = recommendation.cupcakes.map(c => `
            <li>
                <strong>${c.cupcake}</strong>
                <p class="retailer-info">
                    Available at: 
                    ${c.retailers.length > 0
                        ? c.retailers.map(ret => `<span class="retailer-name">${ret.rname}</span> (${ret.location})`).join(', ')
                        : 'No retailers found'}
                </p>
            </li>
        `).join('');

        resultsDiv.innerHTML = `
            <h3 class="profile-header">${recommendation.profile} Profile</h3>
            <p class="profile-message">${recommendation.message}</p>
            <ul>${listHtml}</ul>
        `;
    } catch (err) {
        resultsDiv.innerHTML = `<p class="error-message">Error during recommendation: ${err.message}</p>`;
        console.error(err);
    } finally {
        matchBtn.disabled = false;
    }
};

// Start the quiz on page load
startQuiz();

// Reset Button
resetBtn.onclick = () => {
  sessionID = null;
  selections = { base: null, icing: null, topping: null };
  icingGroup.innerHTML = "";
  toppingGroup.innerHTML = "";
  summaryText.textContent = "None yet — choose options above.";
  resultsDiv.innerHTML = "";
  matchBtn.disabled = true;
  startQuiz();
};

// Basic Search
searchBtn.onclick = async () => {
  const keyword = document.getElementById("search-input").value.trim();
  if (!keyword) return;
  try {
    const data = await getJSON(`/api/search?q=${encodeURIComponent(keyword)}`);
    
    const resultsHtml = data.results.map(r => `
        <li>
            <strong>${r.cupcake}</strong> 
            <p class="search-ingredients">
              Ingredients: 
              <span class="recipe-ingredient-list">${r.ingredients}</span>
            </p>
            <p class="recipe-retailers">
                Available at: 
                ${r.retailers.length > 0 
                    ? r.retailers.map(ret => `<span class="retailer-name">${ret.rname}</span> (${ret.location})`).join(', ') 
                    : 'No retailers found'}
            </p>
        </li>
    `).join('');

    resultsDiv.innerHTML = `
      <h3>Search results for "${keyword}"</h3>
      <ul>
        ${resultsHtml}
      </ul>
    `;
  } catch (err) {
    resultsDiv.innerHTML = `<p class="error-message">Error: ${err.message}</p>`;
    console.error(err);
  }
};

// Recipe Suggestion (FIXED: Robust ingredient splitting and correct field access)
recipeBtn.onclick = async () => {
  const pantryInput = document.getElementById("pantry-input").value.trim();
  if (!pantryInput) return;
  
  // CRITICAL FIX: Use regex to split on comma, semicolon, or whitespace
  const pantryItems = pantryInput.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
  
  try {
    const data = await postJSON('/api/recipes/suggest', { ingredients: pantryItems });
    
    // Check for results before mapping
    const cupcakesHtml = data.possibleCupcakes.length > 0
      ? data.possibleCupcakes.map(r => `
          <li>
            <strong>${r.cupcake}</strong> 
            <p class="recipe-ingredients">
              Required Ingredients: 
              <span class="recipe-ingredient-list">${r.ingredients}</span>
            </p>
            <p class="recipe-retailers">
              Available at: 
              ${r.retailers.length > 0 
                ? r.retailers.map(ret => `<span class="retailer-name">${ret.rname}</span> (${ret.location})`).join(', ') 
                : 'No retailers found'}
            </p>
          </li>
        `).join('')
      : '<p>Cupcake: Death by Chocolate</p>';

    resultsDiv.innerHTML = `
      <h3>Recipes you can make with: ${pantryItems.join(', ')}</h3>
      <ul>
        ${cupcakesHtml}
      </ul>
    `;
  } catch (err) {
    resultsDiv.innerHTML = `<p class="error-message">Error: ${err.message}</p>`;
    console.error(err);
  }
};