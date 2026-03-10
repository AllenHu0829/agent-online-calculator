/**
 * Calculator Engine - Tokenizer + Recursive Descent Parser
 * Supports: +, -, *, /, parentheses, unary minus, percentage
 * No eval() used.
 */
const Calculator = (function () {
  function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const ch = expr[i];
      if (ch === ' ') { i++; continue; }
      if ('0123456789.'.includes(ch)) {
        let num = '';
        while (i < expr.length && '0123456789.'.includes(expr[i])) {
          num += expr[i++];
        }
        tokens.push({ type: 'number', value: parseFloat(num) });
        continue;
      }
      if ('+-*/()%'.includes(ch)) {
        tokens.push({ type: 'op', value: ch });
        i++;
        continue;
      }
      throw new Error('Invalid character: ' + ch);
    }
    return tokens;
  }

  function parse(tokens) {
    let pos = 0;

    function peek() { return pos < tokens.length ? tokens[pos] : null; }
    function consume() { return tokens[pos++]; }

    function parseExpression() {
      let left = parseTerm();
      while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
        const op = consume().value;
        const right = parseTerm();
        left = { type: 'binary', op, left, right };
      }
      return left;
    }

    function parseTerm() {
      let left = parseUnary();
      while (peek() && peek().type === 'op' && (peek().value === '*' || peek().value === '/')) {
        const op = consume().value;
        const right = parseUnary();
        left = { type: 'binary', op, left, right };
      }
      return left;
    }

    function parseUnary() {
      if (peek() && peek().type === 'op' && peek().value === '-') {
        consume();
        const operand = parsePostfix();
        return { type: 'unary', op: '-', operand };
      }
      if (peek() && peek().type === 'op' && peek().value === '+') {
        consume();
      }
      return parsePostfix();
    }

    function parsePostfix() {
      let node = parsePrimary();
      while (peek() && peek().type === 'op' && peek().value === '%') {
        consume();
        node = { type: 'percent', operand: node };
      }
      return node;
    }

    function parsePrimary() {
      const t = peek();
      if (!t) throw new Error('Unexpected end of expression');
      if (t.type === 'number') {
        consume();
        return { type: 'number', value: t.value };
      }
      if (t.type === 'op' && t.value === '(') {
        consume();
        const expr = parseExpression();
        const closing = consume();
        if (!closing || closing.value !== ')') throw new Error('Missing closing parenthesis');
        return expr;
      }
      throw new Error('Unexpected token: ' + t.value);
    }

    const ast = parseExpression();
    if (pos < tokens.length) throw new Error('Unexpected token: ' + tokens[pos].value);
    return ast;
  }

  function evaluate(node) {
    if (node.type === 'number') return node.value;
    if (node.type === 'percent') return evaluate(node.operand) / 100;
    if (node.type === 'unary') {
      if (node.op === '-') return -evaluate(node.operand);
    }
    if (node.type === 'binary') {
      const left = evaluate(node.left);
      const right = evaluate(node.right);
      switch (node.op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/':
          if (right === 0) throw new Error('Cannot divide by zero');
          return left / right;
      }
    }
    throw new Error('Unknown node type');
  }

  function formatResult(num) {
    if (!isFinite(num)) throw new Error('Result is not a finite number');
    // Handle floating point precision (e.g. 0.1 + 0.2 = 0.3)
    const rounded = parseFloat(num.toPrecision(12));
    return String(rounded);
  }

  function calculate(expr) {
    if (!expr || expr.trim() === '') throw new Error('Empty expression');
    const tokens = tokenize(expr);
    const ast = parse(tokens);
    const result = evaluate(ast);
    return formatResult(result);
  }

  return { calculate };
})();
