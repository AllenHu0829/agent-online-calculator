(function () {
  const display = document.getElementById('display');
  const errEl = document.getElementById('error');
  let current = '0';
  let pendingOp = null;
  let pendingVal = null;

  function showError(msg) {
    errEl.textContent = msg || '';
  }

  function updateDisplay() {
    display.value = current;
  }

  function compute(a, op, b) {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (op === '/') {
      if (y === 0) return { error: '不能除以零' };
      return { value: x / y };
    }
    if (op === '*') return { value: x * y };
    if (op === '+') return { value: x + y };
    if (op === '-') return { value: x - y };
    return { value: NaN };
  }

  function onOp(key) {
    showError('');
    if (key === 'C') {
      current = '0';
      pendingOp = null;
      pendingVal = null;
      updateDisplay();
      return;
    }
    if (key === 'back') {
      if (current.length <= 1) current = '0';
      else current = current.slice(0, -1);
      updateDisplay();
      return;
    }
    if (key === '=') {
      if (pendingOp !== null && pendingVal !== null) {
        const result = compute(pendingVal, pendingOp, current);
        if (result.error) {
          showError(result.error);
          return;
        }
        current = String(result.value);
        pendingOp = null;
        pendingVal = null;
      }
      updateDisplay();
      return;
    }
    if (['+', '-', '*', '/'].includes(key)) {
      if (pendingOp !== null && pendingVal !== null) {
        const result = compute(pendingVal, pendingOp, current);
        if (result.error) {
          showError(result.error);
          return;
        }
        current = String(result.value);
      }
      pendingVal = current;
      pendingOp = key;
      current = '0';
      updateDisplay();
      return;
    }
    if (key === '.') {
      if (current.includes('.')) return;
      current += '.';
      updateDisplay();
      return;
    }
    if (/\d/.test(key)) {
      if (current === '0' && key !== '.') current = key;
      else current += key;
      updateDisplay();
    }
  }

  document.querySelectorAll('[data-op]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      onOp(this.getAttribute('data-op'));
    });
  });

  updateDisplay();
})();
