```javascript
const inputElement = document.getElementById('input');
const outputElement = document.getElementById('output');

const variables = {};

function evaluateExpression(expr) {
    // Replace variables with their values
    let processedExpr = expr.replace(/([a-zA-Z_]\w*)/g, (match) => {
        if (variables.hasOwnProperty(match)) {
            return variables[match];
        }
        return match; // Keep as is if not a variable
    });

    // Safety check: only allow numbers, operators, and parentheses
    if (!/^[\d\s\+\-\*\/\(\)\.]+$/.test(processedExpr)) {
        return "Error: Invalid characters";
    }

    try {
        // Using Function constructor is safer than eval, but still powerful
        return Function('"use strict"; return (' + processedExpr + ')')();
    } catch (e) {
        return "Error";
    }
}

function processInput() {
    const lines = inputElement.value.split('\n');
    let outputHTML = '';

    for (const line of lines) {
        if (line.trim() === '') {
            outputHTML += '\n';
            continue;
        }

        // Check for variable assignment (e.g., "price = 10")
        const assignMatch = line.match(/^\s*([a-zA-Z_]\w*)\s*=\s*(.+)$/);
        if (assignMatch) {
            const varName = assignMatch[1];
            const varValue = assignMatch[2];
            const result = evaluateExpression(varValue);
            if (typeof result === 'number' && !isNaN(result)) {
                variables[varName] = result;
                outputHTML += `${line} <span class="result">(${result})</span>\n`;
            } else {
                outputHTML += `${line}\n`;
            }
        }
        // Check for calculation line (e.g., "10 + 5 =")
        else if (line.trim().endsWith('=')) {
            const expression = line.slice(0, -1);
            const result = evaluateExpression(expression);
            if (typeof result === 'number' && !isNaN(result)) {
                outputHTML += `${line} <span class="result">${result}</span>\n`;
            } else {
                outputHTML += `${line} <span class="result">${result}</span>\n`;
            }
        }
        // It's just a regular line of text
        else {
            outputHTML += `${line}\n`;
        }
    }
    outputElement.innerHTML = outputHTML;
}

inputElement.addEventListener('input', processInput);

// Initial processing
processInput();
```
