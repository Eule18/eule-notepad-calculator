```javascript
// --- NEW: Automatically define 'today' variable ---
const today = new Date().toISOString().split('T')[0];

const inputElement = document.getElementById('input');
const outputElement = document.getElementById('output');

// --- MODIFIED: Initialize variables with 'today' ---
const variables = { today };

const conversions = {
    length: { m: 1, km: 0.001, cm: 100, mm: 1000, mi: 0.000621371, yd: 1.09361, ft: 3.28084, in: 39.3701 },
    weight: { kg: 1, g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274 },
    volume: { l: 1, ml: 1000, gal: 0.264172, qt: 1.05669, pt: 2.11338, cup: 4.22675, 'fl oz': 33.814 },
    data: { b: 1, B: 0.125, KB: 0.000125, MB: 1.25e-7, GB: 1.25e-10, TB: 1.25e-13, Kib: 0.00012207, Mib: 1.19209e-7, Gib: 1.16415e-10 }
};

const mathFunctions = ['sqrt', 'sin', 'cos', 'tan', 'log', 'log10', 'exp', 'pow', 'abs', 'ceil', 'floor', 'round'];

function evaluateExpression(expr) {
    expr = expr.replace(/(\d*\.?\d+)\s*%\s*of\s*(\d*\.?\d+)/g, '($1 / 100) * $2');
    expr = expr.replace(/(\d*\.?\d+)\s*\+\s*(\d*\.?\d+)%/g, '($1) + (($1) * ($2) / 100)');
    expr = expr.replace(/(\d*\.?\d+)\s*-\s*(\d*\.?\d+)%/g, '($1) - (($1) * ($2) / 100)');
    let processedExpr = expr.replace(/([a-zA-Z_]\w*)/g, (match) => {
        if (variables.hasOwnProperty(match)) { return variables[match]; }
        return match;
    });
    try {
        const funcBody = `const { ${mathFunctions.join(', ')} } = Math; return (${processedExpr})`;
        return Function(funcBody)();
    } catch (e) { return "Error"; }
}

function handleConversion(line) {
    const match = line.match(/^\s*([\d\.]+)\s*([a-zA-Z]+(?:\s*[a-zA-Z]+)*)\s+to\s+([a-zA-Z]+(?:\s*[a-zA-Z]+)*)\s*$/);
    if (!match) return null;
    const [, value, fromUnit, toUnit] = match;
    let fromFactor, toFactor;
    for (const category in conversions) {
        if (conversions[category].hasOwnProperty(fromUnit)) {
            fromFactor = conversions[category][fromUnit];
            toFactor = conversions[category][toUnit];
            break;
        }
    }
    if (fromFactor === undefined || toFactor === undefined) {
        return `Error: Conversion from '${fromUnit}' to '${toUnit}' not supported.`;
    }
    const resultInBase = parseFloat(value) / fromFactor;
    const finalResult = resultInBase * toFactor;
    return finalResult.toFixed(6).replace(/\.?0+$/, "");
}

function handleDateMath(expr) {
    const dateMatch = expr.match(/(\d{4}-\d{2}-\d{2})\s*([+-]\s*\d+)\s*(day|week|month|year)s?/i);
    if (!dateMatch) return null;
    const [, dateStr, amountStr, unit] = dateMatch;
    const amount = parseInt(amountStr.replace(/\s/g, ''), 10);
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    switch (unit.toLowerCase()) {
        case 'day': date.setDate(date.getDate() + amount); break;
        case 'week': date.setDate(date.getDate() + (amount * 7)); break;
        case 'month': date.setMonth(date.getMonth() + amount); break;
        case 'year': date.setFullYear(date.getFullYear() + amount); break;
    }
    return date.toISOString().split('T')[0];
}

function processInput() {
    const lines = inputElement.value.split('\n');
    let outputHTML = '';
    for (const line of lines) {
        if (line.trim() === '') { outputHTML += '\n'; continue; }
        const conversionResult = handleConversion(line);
        if (conversionResult !== null && typeof conversionResult === 'string' && !conversionResult.startsWith('Error')) {
            outputHTML += `${line} <span class="result">= ${conversionResult}</span>\n`;
            continue;
        }
        if (typeof conversionResult === 'string' && conversionResult.startsWith('Error')) {
            outputHTML += `${line} <span class="result">${conversionResult}</span>\n`;
            continue;
        }
        const assignMatch = line.match(/^\s*([a-zA-Z_]\w*)\s*=\s*(.+)$/);
        if (assignMatch) {
            const varName = assignMatch[1];
            const varValue = assignMatch[2];
            const dateResult = handleDateMath(varValue);
            const result = dateResult !== null ? dateResult : evaluateExpression(varValue);
            if (result !== "Error" && typeof result !== 'undefined') {
                variables[varName] = result;
                outputHTML += `${line} <span class="result">(${result})</span>\n`;
            } else { outputHTML += `${line}\n`; }
        }
        else if (line.trim().endsWith('=')) {
            const expression = line.slice(0, -1);
            const result = evaluateExpression(expression);
            outputHTML += `${line} <span class="result">${result}</span>\n`;
        }
        else { outputHTML += `${line}\n`; }
    }
    outputElement.innerHTML = outputHTML;
}

inputElement.addEventListener('input', processInput);
processInput();
```
