(function () {
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const historyList = document.getElementById('historyList');
  const historyEmpty = document.getElementById('historyEmpty');
  const historyClear = document.getElementById('historyClear');

  let expression = '';
  let lastResult = null;
  let history = [];
  const MAX_HISTORY = 10;

  function updateDisplay() {
    expressionEl.textContent = formatExpression(expression);
    resultEl.classList.remove('error');

    if (expression === '') {
      resultEl.textContent = lastResult !== null ? lastResult : '0';
      return;
    }

    // Live preview
    try {
      const preview = Calculator.calculate(expression);
      resultEl.textContent = preview;
    } catch (e) {
      resultEl.textContent = lastResult !== null ? lastResult : '0';
    }
  }

  function formatExpression(expr) {
    return expr
      .replace(/\*/g, '×')
      .replace(/\//g, '÷');
  }

  function showError(msg) {
    resultEl.textContent = msg;
    resultEl.classList.add('error');
  }

  function addToHistory(expr, result) {
    history.unshift({ expr, result });
    if (history.length > MAX_HISTORY) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
      historyEmpty.style.display = '';
      historyList.appendChild(historyEmpty);
      return;
    }
    historyEmpty.style.display = 'none';
    history.forEach(function (item) {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.innerHTML =
        '<div class="history-expr">' + escapeHtml(formatExpression(item.expr)) + '</div>' +
        '<div class="history-result">= ' + escapeHtml(item.result) + '</div>';
      li.addEventListener('click', function () {
        expression = item.result;
        lastResult = null;
        updateDisplay();
      });
      historyList.appendChild(li);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function handleInput(key) {
    if (key === 'C') {
      expression = '';
      lastResult = null;
      updateDisplay();
      return;
    }

    if (key === 'back') {
      expression = expression.slice(0, -1);
      updateDisplay();
      return;
    }

    if (key === 'negate') {
      if (expression === '' && lastResult !== null) {
        expression = lastResult;
      }
      if (expression === '') return;
      // Toggle negation: wrap/unwrap with (-)
      if (expression.startsWith('(-')) {
        expression = expression.slice(2);
        if (expression.endsWith(')')) expression = expression.slice(0, -1);
      } else {
        expression = '(-' + expression + ')';
      }
      updateDisplay();
      return;
    }

    if (key === '%') {
      expression += '%';
      updateDisplay();
      return;
    }

    if (key === '=') {
      if (expression === '') return;
      try {
        const result = Calculator.calculate(expression);
        addToHistory(expression, result);
        lastResult = result;
        expression = '';
        resultEl.classList.remove('error');
        resultEl.textContent = result;
        expressionEl.textContent = '';
      } catch (e) {
        showError(e.message);
      }
      return;
    }

    // Operators
    if (['+', '-', '*', '/'].includes(key)) {
      if (expression === '' && lastResult !== null) {
        expression = lastResult;
      }
      // Prevent double operators (replace last)
      if (expression !== '' && ['+', '-', '*', '/'].includes(expression.slice(-1))) {
        expression = expression.slice(0, -1);
      }
      expression += key;
      updateDisplay();
      return;
    }

    // Parentheses
    if (key === '(' || key === ')') {
      expression += key;
      updateDisplay();
      return;
    }

    // Decimal point
    if (key === '.') {
      // Get last number segment
      const parts = expression.split(/[\+\-\*\/\(\)%]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart.includes('.')) return;
      if (expression === '' || /[\+\-\*\/\(]$/.test(expression)) {
        expression += '0';
      }
      expression += '.';
      updateDisplay();
      return;
    }

    // Digits
    if (/\d/.test(key)) {
      expression += key;
      updateDisplay();
      return;
    }
  }

  // Button clicks
  document.querySelectorAll('[data-op]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      handleInput(this.getAttribute('data-op'));
    });
  });

  // Keyboard support
  document.addEventListener('keydown', function (e) {
    const keyMap = {
      'Enter': '=',
      'Escape': 'C',
      'Backspace': 'back',
      'Delete': 'C',
    };

    let key = keyMap[e.key] || e.key;

    // Allow digits, operators, parentheses, dot
    if (/^[\d\+\-\*\/\.\(\)%=]$/.test(key) || ['C', 'back', 'negate'].includes(key)) {
      e.preventDefault();
      handleInput(key);
    }
  });

  // Clear history
  historyClear.addEventListener('click', function () {
    history = [];
    renderHistory();
  });

  // Init
  updateDisplay();
  renderHistory();
})();
