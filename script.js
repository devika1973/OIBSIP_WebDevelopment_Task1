let display = document.getElementById('display');
let exprDisplay = document.getElementById('expressionDisplay');
let buttons = document.querySelectorAll('.btn');
let themeToggle = document.getElementById('themeToggle');
let stepsBox = document.getElementById('stepsBox');
let historyList = document.getElementById('historyList');
let tabButtons = document.querySelectorAll('.tab-button');
let tabContents = document.querySelectorAll('.tab-content');

let displayInput = '';
let evalInput = '';
let lastAnswer = '';
let openParens = 0;
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];

function updateHistoryDisplay() {
  historyList.innerHTML = '';
  history.slice(-5).reverse().forEach(item => {
    let li = document.createElement('li');
    li.textContent = `${item.expression} = ${item.result}`;
    historyList.appendChild(li);
  });
}
updateHistoryDisplay();

function refreshDisplays() {
  display.value = displayInput || '';
  exprDisplay.textContent = displayInput ? `${displayInput} =` : '';
}

function showSteps(steps) {
  stepsBox.innerHTML = steps.join('<br>');
}

buttons.forEach(button => {
  button.addEventListener('click', e => {
    let value = e.target.textContent;

    if (value === 'C') {
      displayInput = '';
      evalInput = '';
      openParens = 0;
      showSteps(["No steps yet."]);
      refreshDisplays();
    } else if (value === 'DEL') {
      displayInput = displayInput.slice(0, -1);
      evalInput = evalInput.slice(0, -1);
      refreshDisplays();
    } else if (value === '√') {
      displayInput += '√(';
      evalInput += 'Math.sqrt(';
      openParens++;
      refreshDisplays();
    } else if (value === '(') {
      displayInput += '(';
      evalInput += '(';
      openParens++;
      refreshDisplays();
    } else if (value === ')') {
      displayInput += ')';
      evalInput += ')';
      openParens = Math.max(0, openParens - 1);
      refreshDisplays();
    } else if (value === 'ANS') {
      displayInput += lastAnswer.toString();
      evalInput += lastAnswer.toString();
      refreshDisplays();
    } else if (value === 'ENTER') {
      if (openParens > 0) {
        evalInput += ')'.repeat(openParens);
        displayInput += ')'.repeat(openParens);
        openParens = 0;
      }

      try {
        let result = eval(evalInput);
        let steps = [];
        steps.push(`Expression: ${displayInput}`);

        let simpleOp = displayInput.match(/(\d+(\.\d+)?)\s*([\+\-\*\/])\s*(\d+(\.\d+)?)/);
        if (simpleOp) {
          let a = parseFloat(simpleOp[1]);
          let op = simpleOp[3];
          let b = parseFloat(simpleOp[4]);
          let calcResult;
          switch (op) {
            case '+': calcResult = a + b; steps.push(`Step: Add ${a} + ${b} = ${calcResult}`); break;
            case '-': calcResult = a - b; steps.push(`Step: Subtract ${b} from ${a} = ${calcResult}`); break;
            case '*': calcResult = a * b; steps.push(`Step: Multiply ${a} × ${b} = ${calcResult}`); break;
            case '/': calcResult = a / b; steps.push(`Step: Divide ${a} ÷ ${b} = ${calcResult}`); break;
          }
        } else if (displayInput.includes('√')) {
          let rootNum = displayInput.match(/√\(?(\d+)/);
          if (rootNum) {
            let val = parseFloat(rootNum[1]);
            steps.push(`Step: Take square root of ${val} = ${Math.sqrt(val)}`);
          }
        }

        steps.push(`Final Result = ${result}`);
        showSteps(steps);

        exprDisplay.textContent = `${displayInput} =`;
        display.value = result;
        lastAnswer = result;

        history.push({ expression: displayInput, result });
        localStorage.setItem('calcHistory', JSON.stringify(history));
        updateHistoryDisplay();

        displayInput = result.toString();
        evalInput = result.toString();
      } catch {
        display.value = 'Error';
        showSteps(["Error in calculation"]);
        displayInput = '';
        evalInput = '';
      }
    } else {
      if (value === '.') {
        let parts = displayInput.split(/[\+\-\*\/\(\)]/);
        let lastNumber = parts[parts.length - 1];
        if (lastNumber.includes('.')) return; 
      }

      displayInput += value;
      evalInput += value;
      refreshDisplays();
    }
  });
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabContents.forEach(tab => {
      tab.classList.remove('active-content');
      tab.classList.add('hidden');
    });

    const targetTab = document.getElementById(btn.dataset.target);
    targetTab.classList.remove('hidden');

    setTimeout(() => targetTab.classList.add('active-content'), 50);
  });
});
