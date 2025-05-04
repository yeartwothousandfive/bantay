document.addEventListener('DOMContentLoaded', () => {
    const totalDisplay = document.getElementById('total-display');
    const inputDisplay = document.getElementById('input-display');
    const numberButtons = document.querySelectorAll('.number-btn');
    const operatorButtons = document.querySelectorAll('.operator-btn');
    const clearButton = document.getElementById('clear-btn');
    const newButton = document.getElementById('new-btn');
    const historyLog = document.getElementById('history-log');
    const saveHistoryButton = document.getElementById('save-history-btn');
    const dateDisplay = document.getElementById('date-display');

    let currentInput = '0';
    let total = 0;
    let history = [];
    let operator = null; // To store the last pressed operator if needed for future logic, currently not used per simple algorithm

    // --- Display Update Functions ---
    function updateTotalDisplay() {
        totalDisplay.value = formatNumber(total);
    }

    function updateInputDisplay() {
        inputDisplay.value = formatNumber(currentInput);
    }

    // Format number for display (optional, but good for readability)
    function formatNumber(numStr) {
        // Basic formatting, can be expanded (e.g., locale-specific)
        // For now, just return the string
        return String(numStr);
    }

    // --- Date Display ---
    function displayCurrentDate() {
        const now = new Date();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        dateDisplay.textContent = `Date: ${now.toLocaleDateString(undefined, options)}`;
    }

    // --- History Functions ---
    function addHistoryEntry(op, value, newTotal) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const entryText = `${timeString} ..... ${op} ${formatNumber(value)}`;
        history.push({ time: timeString, operation: op, value: value, text: entryText, totalBefore: total - (op === '+' ? value : -value) }); // Store total *before* this op

        const entryElement = document.createElement('div');
        entryElement.textContent = entryText;
        historyLog.appendChild(entryElement);
        historyLog.scrollTop = historyLog.scrollHeight; // Scroll to bottom
    }

    // --- Event Handlers ---
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.dataset.value;
            if (currentInput === '0' && value !== '00') {
                currentInput = value;
            } else if (currentInput === '0' && value === '00') {
                // Do nothing if input is 0 and 00 is pressed
            } else {
                currentInput += value;
            }
            updateInputDisplay();
        });
    });

    operatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const op = button.dataset.op;
            const inputValue = parseFloat(currentInput);

            if (isNaN(inputValue) || inputValue === 0) {
                // Don't perform operation if input is invalid or zero
                // Optionally clear input or provide feedback
                currentInput = '0'; // Reset input if zero or invalid
                updateInputDisplay();
                return;
            }

            let operationSymbol = '';
            if (op === 'add') {
                total += inputValue;
                operationSymbol = '+';
            } else if (op === 'subtract') {
                total -= inputValue;
                operationSymbol = '-';
            }

            addHistoryEntry(operationSymbol, inputValue, total);
            updateTotalDisplay();
            currentInput = '0'; // Reset input after operation
            updateInputDisplay();
            operator = op; // Store operator if needed later
        });
    });

    clearButton.addEventListener('click', () => {
        currentInput = '0';
        updateInputDisplay();
    });

    newButton.addEventListener("click", () => {
    const userConfirmed = confirm("Are you sure you want to create a new entry?");
    
    if (userConfirmed) {
        currentInput = '0';
        total = 0;
        operator = null;
        history = [];
        historyLog.innerHTML = '';
        updateInputDisplay();
        updateTotalDisplay();
        console.log("New entry created.");
    } else {
        console.log("Action canceled.");
    }
});

    // --- Initial Setup ---
    updateTotalDisplay();
    updateInputDisplay();
    displayCurrentDate();
    // Set interval to update date every minute (optional)
    setInterval(displayCurrentDate, 60000);

});




    // --- Save History Function ---
    saveHistoryButton.addEventListener("click", () => {
        if (history.length === 0) {
            alert("History is empty. Nothing to save.");
            return;
        }

        let historyText = `Money Counter History - Saved on ${new Date().toLocaleString()}\n`;
        historyText += `==================================================\n`;
        historyText += `Final Total: ${formatNumber(total)}\n`;
        historyText += `==================================================\n\n`;

        history.forEach(entry => {
            // Include total *before* the operation for clarity, as requested implicitly by "showing the total before saving"
            // historyText += `${entry.text} (Total Before: ${formatNumber(entry.totalBefore)})\n`; 
            // Let's stick to the simpler format requested: Time ..... Operation Value
            historyText += `${entry.text}\n`;
        });

        // Create a blob and trigger download
        const blob = new Blob([historyText], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `money_counter_history_${new Date().toISOString().slice(0,10)}.txt`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });
