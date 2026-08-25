// Armstrong Number Visualizer — Execution Engine & UI
const state = {
  mode: 'with',
  level: 'beginner',
  number: '153',
  steps: [],
  currentStep: -1,
  playing: false,
  speed: 1,
  playTimer: null,
};

const CODE_WITH = [
  { num: 1,  text: 'def isarmstrong(n):' },
  { num: 2,  text: '    n1 = n' },
  { num: 3,  text: '    n2 = str(n1)' },
  { num: 4,  text: '    n3 = len(n2)' },
  { num: 5,  text: '    s = 0' },
  { num: 6,  text: '    while n != 0:' },
  { num: 7,  text: '        d = n % 10' },
  { num: 8,  text: '        s = s + d ** n3' },
  { num: 9,  text: '        n = n // 10' },
  { num: 10, text: '    if n1 == s:' },
  { num: 11, text: '        return True' },
  { num: 12, text: '    else:' },
  { num: 13, text: '        return False' },
  { num: 14, text: '' },
  { num: 15, text: 'n = int(input("Enter a Number: "))' },
  { num: 16, text: 'if isarmstrong(n):' },
  { num: 17, text: '    print(n, "is armstrong number")' },
  { num: 18, text: 'else:' },
  { num: 19, text: '    print(n, "is not armstrong number")' },
];

const CODE_WITHOUT = [
  { num: 1,  text: 'n = int(input("Enter a Number: "))' },
  { num: 2,  text: 'n1 = n' },
  { num: 3,  text: 'n2 = str(n1)' },
  { num: 4,  text: 'n3 = len(n2)' },
  { num: 5,  text: 's = 0' },
  { num: 6,  text: 'while n != 0:' },
  { num: 7,  text: '    d = n % 10' },
  { num: 8,  text: '    s = s + d ** n3' },
  { num: 9,  text: '    n = n // 10' },
  { num: 10, text: 'if n1 == s:' },
  { num: 11, text: '    print(n1, "is armstrong number")' },
  { num: 12, text: 'else:' },
  { num: 13, text: '    print(n1, "is not armstrong number")' },
];

function highlight(line) {
  if (!line) return '&nbsp;';
  
  // Safe HTML Escaping
  let t = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // 1. Strings highlight
  t = t.replace(/(".*?"|'.*?')/g, '___STR___$1___ENDSTR___');
  
  // 2. Exact word replacements using tokens to avoid nested HTML corruption
  t = t.replace(/\b(def|while|if|else|return)\b/g, '___KW___$1___ENDKW___');
  t = t.replace(/\b(print|int|str|len|input|isarmstrong)\b/g, '___FN___$1___ENDFN___');
  t = t.replace(/\b(\d+)\b/g, '___NUM___$1___ENDNUM___');
  t = t.replace(/([%=+\-*\/<>!]+)/g, '___OP___$1___ENDOP___');
  
  // 3. Final single-pass HTML tag conversion
  t = t.replace(/___STR___(.*?)___ENDSTR___/g, '<span class="hl-str">$1</span>')
       .replace(/___KW___(.*?)___ENDKW___/g, '<span class="hl-kw">$1</span>')
       .replace(/___FN___(.*?)___ENDFN___/g, '<span class="hl-fn">$1</span>')
       .replace(/___NUM___(.*?)___ENDNUM___/g, '<span class="hl-num">$1</span>')
       .replace(/___OP___(.*?)___ENDOP___/g, '<span class="hl-op">$1</span>');
  
  return t;
}

function renderCode(activeLine) {
  const code = state.mode === 'with' ? CODE_WITH : CODE_WITHOUT;
  const el = document.getElementById('codeEditor');
  el.innerHTML = code.map(l => {
    const isActive = l.num === activeLine;
    return `<div class="code-line ${isActive ? 'active' : ''} px-4 py-0.5 flex" data-line="${l.num}">
      <span class="w-8 text-right text-slate-600 select-none pr-3 shrink-0">${String(l.num).padStart(2,'0')}</span>
      <span class="flex-1 whitespace-pre">${highlight(l.text)}</span>
    </div>`;
  }).join('');
  const active = el.querySelector('.active');
  if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function generateSteps(numStr, mode) {
  const steps = [];
  const n0 = BigInt(numStr);
  let n = n0;
  const n1 = n0;
  const n2 = n0.toString();
  const n3 = n2.length;
  let s = 0n;
  let d = null;
  let iteration = 0;
  const totalIters = n3;
  const digits = [];
  const powers = [];

  const push = (obj) => {
    steps.push({
      n: n.toString(),
      n1: n1.toString(),
      n2,
      n3,
      s: s.toString(),
      d: d === null ? null : d.toString(),
      iteration,
      totalIters,
      digits: [...digits],
      powers: [...powers],
      ...obj
    });
  };

  if (mode === 'with') {
    push({
      line: 15, phase: 'input', expression: `n = ${numStr}`,
      explanation: {
        beginner: `We read the number ${numStr} from the user and store it in variable n.`,
        intermediate: `int(input(...)) converts the typed text into an integer and assigns it to n.`,
        technical: `input() returns a string; int() parses it. n is bound to the integer value ${numStr}.`
      },
      console: [`Enter a Number: ${numStr}`]
    });
    push({
      line: 16, phase: 'call', expression: `isarmstrong(${numStr})`,
      explanation: {
        beginner: `We call the function isarmstrong and pass the number ${numStr} into it.`,
        intermediate: `The function isarmstrong is invoked with argument n. Control jumps into the function body.`,
        technical: `A new stack frame is created. The parameter n inside the function is bound to ${numStr}.`
      },
      console: ['Checking...'],
      stack: true
    });
    push({
      line: 2, phase: 'copy', expression: `n1 = n  →  n1 = ${numStr}`,
      explanation: {
        beginner: `We save a copy of the original number in n1 so we can compare later.`,
        intermediate: `n1 stores the original value because n will change during the loop.`,
        technical: `n1 ← n. n1 is the immutable original for the final equality test.`
      }
    });
    push({
      line: 3, phase: 'digits', expression: `n2 = str(n1)  →  "${n2}"`,
      explanation: {
        beginner: `Convert the number to text so we can count how many digits it has.`,
        intermediate: `str(n1) produces the decimal representation as a string.`,
        technical: `str() yields the decimal digit string; used only for length.`
      }
    });
    push({
      line: 4, phase: 'digits', expression: `n3 = len(n2)  →  ${n3}`,
      explanation: {
        beginner: `Count the characters in the text — that is the number of digits (${n3}).`,
        intermediate: `len(n2) returns the count of digits. We raise each digit to this power.`,
        technical: `n3 is the exponent for every digit power. For ${numStr}, n3 = ${n3}.`
      }
    });
    push({
      line: 5, phase: 'init', expression: `s = 0`,
      explanation: {
        beginner: `Start the sum at zero. We will add digit powers one by one.`,
        intermediate: `s accumulates the sum of each digit raised to n3.`,
        technical: `s is initialized to 0 before the accumulation loop.`
      }
    });

    let working = n0;
    while (working !== 0n) {
      iteration++;
      push({
        line: 6, phase: 'loop_check',
        expression: `while n != 0  →  ${working} != 0  is True`,
        explanation: {
          beginner: `Is there still a digit left? Yes — continue the loop.`,
          intermediate: `Loop condition: n is still non-zero, so we process another digit.`,
          technical: `while n != 0 evaluates true. Iteration ${iteration} of ${totalIters}.`
        },
        iteration
      });
      d = working % 10n;
      digits.push(Number(d));
      push({
        line: 7, phase: 'extract',
        expression: `d = n % 10  →  ${working} % 10 = ${d}`,
        explanation: {
          beginner: `Take the last digit of the number. ${working} ends with ${d}.`,
          intermediate: `Modulo 10 extracts the least-significant digit.`,
          technical: `d = n mod 10. Remainder of integer division by 10 is the units digit.`
        },
        digitExtract: { before: working.toString(), digit: d.toString() },
        iteration
      });
      const power = d ** BigInt(n3);
      const prevS = s;
      s = s + power;
      powers.push({ digit: Number(d), power: power.toString(), exp: n3 });
      push({
        line: 8, phase: 'power',
        expression: `s = s + d ** n3  →  ${prevS} + ${d}^${n3} = ${s}`,
        explanation: {
          beginner: `Raise the digit ${d} to the power ${n3} and add it to the sum.`,
          intermediate: `${d} ** ${n3} = ${power}. New sum s = ${prevS} + ${power} = ${s}.`,
          technical: `Exponentiation d**n3 then addition. s accumulates the Armstrong sum.`
        },
        calc: { prevS: prevS.toString(), d: d.toString(), exp: n3, power: power.toString(), newS: s.toString() },
        iteration
      });
      const prevN = working;
      working = working / 10n;
      n = working;
      push({
        line: 9, phase: 'remove',
        expression: `n = n // 10  →  ${prevN} // 10 = ${working}`,
        explanation: {
          beginner: `Remove the last digit by integer-dividing by 10.`,
          intermediate: `Floor division by 10 discards the units digit.`,
          technical: `n ← ⌊n / 10⌋. The number shrinks from the right.`
        },
        iteration
      });
    }
    push({
      line: 6, phase: 'loop_end',
      expression: `while n != 0  →  0 != 0  is False`,
      explanation: {
        beginner: `No digits left (n is 0). The loop stops.`,
        intermediate: `Loop condition becomes false; we exit the while loop.`,
        technical: `n == 0 terminates the digit-processing loop.`
      },
      iteration: totalIters
    });
    const isArm = n1 === s;
    push({
      line: 10, phase: 'compare',
      expression: `if n1 == s  →  ${n1} == ${s}  is ${isArm}`,
      explanation: {
        beginner: isArm
          ? `The original number equals the calculated sum — it is an Armstrong number!`
          : `The original number does not equal the sum — it is not an Armstrong number.`,
        intermediate: `Equality test between preserved original n1 and accumulated sum s.`,
        technical: `Boolean result of n1 == s drives the return value.`
      }
    });
    if (isArm) {
      push({
        line: 11, phase: 'return', expression: `return True`,
        explanation: {
          beginner: `The function returns True (yes, it is Armstrong).`,
          intermediate: `return True ends the function and passes True back to the caller.`,
          technical: `Stack frame is torn down; True is the return value.`
        },
        returnValue: true
      });
    } else {
      push({
        line: 13, phase: 'return', expression: `return False`,
        explanation: {
          beginner: `The function returns False (not Armstrong).`,
          intermediate: `return False ends the function and passes False back to the caller.`,
          technical: `Stack frame is torn down; False is the return value.`
        },
        returnValue: false
      });
    }
    push({
      line: 16, phase: 'main_if',
      expression: `if isarmstrong(n):  →  ${isArm}`,
      explanation: {
        beginner: `The function told us ${isArm ? 'yes' : 'no'}. We choose the matching print.`,
        intermediate: `The boolean returned by isarmstrong selects the if or else branch.`,
        technical: `Control resumes after the call; the if condition is the returned boolean.`
      },
      stack: false
    });
    if (isArm) {
      push({
        line: 17, phase: 'result',
        expression: `print(n, "is armstrong number")`,
        explanation: {
          beginner: `${numStr} is an Armstrong number!`,
          intermediate: `The success message is printed to the console.`,
          technical: `print outputs the confirmation string.`
        },
        console: [`${numStr} is armstrong number`],
        isArmstrong: true
      });
    } else {
      push({
        line: 19, phase: 'result',
        expression: `print(n, "is not armstrong number")`,
        explanation: {
          beginner: `${numStr} is not an Armstrong number.`,
          intermediate: `The failure message is printed to the console.`,
          technical: `print outputs the negative result string.`
        },
        console: [`${numStr} is not armstrong number`],
        isArmstrong: false
      });
    }
  } else {
    // WITHOUT FUNCTION
    push({
      line: 1, phase: 'input', expression: `n = ${numStr}`,
      explanation: {
        beginner: `We read the number ${numStr} and store it in n.`,
        intermediate: `int(input(...)) converts input text to integer.`,
        technical: `n is bound to integer ${numStr}.`
      },
      console: [`Enter a Number: ${numStr}`]
    });
    push({
      line: 2, phase: 'copy', expression: `n1 = n  →  n1 = ${numStr}`,
      explanation: {
        beginner: `Copy the original number into n1 for later comparison.`,
        intermediate: `n1 preserves the original while n will be destroyed by the loop.`,
        technical: `n1 ← n. Required because n mutates.`
      }
    });
    push({
      line: 3, phase: 'digits', expression: `n2 = str(n1)  →  "${n2}"`,
      explanation: {
        beginner: `Turn the number into text so we can count digits.`,
        intermediate: `str(n1) yields the digit string.`,
        technical: `String representation for length only.`
      }
    });
    push({
      line: 4, phase: 'digits', expression: `n3 = len(n2)  →  ${n3}`,
      explanation: {
        beginner: `There are ${n3} digits. Each digit will be raised to this power.`,
        intermediate: `n3 is the exponent for the Armstrong power.`,
        technical: `n3 = number of decimal digits.`
      }
    });
    push({
      line: 5, phase: 'init', expression: `s = 0`,
      explanation: {
        beginner: `Initialize the running sum to zero.`,
        intermediate: `s will accumulate digit**n3 values.`,
        technical: `s ← 0 before loop.`
      }
    });

    let working = n0;
    while (working !== 0n) {
      iteration++;
      push({
        line: 6, phase: 'loop_check',
        expression: `while n != 0  →  ${working} != 0 is True`,
        explanation: {
          beginner: `Still have digits left — keep going.`,
          intermediate: `Condition true; process next digit.`,
          technical: `Iteration ${iteration}/${totalIters}.`
        },
        iteration
      });
      d = working % 10n;
      digits.push(Number(d));
      push({
        line: 7, phase: 'extract',
        expression: `d = n % 10  →  ${working} % 10 = ${d}`,
        explanation: {
          beginner: `Last digit of ${working} is ${d}.`,
          intermediate: `Modulo extracts the units digit.`,
          technical: `d = n mod 10.`
        },
        digitExtract: { before: working.toString(), digit: d.toString() },
        iteration
      });
      const power = d ** BigInt(n3);
      const prevS = s;
      s = s + power;
      powers.push({ digit: Number(d), power: power.toString(), exp: n3 });
      push({
        line: 8, phase: 'power',
        expression: `s = s + d ** n3  →  ${prevS} + ${d}^${n3} = ${s}`,
        explanation: {
          beginner: `Add ${d} raised to power ${n3} to the sum.`,
          intermediate: `${d}**${n3} = ${power}; s becomes ${s}.`,
          technical: `s ← s + d**n3.`
        },
        calc: { prevS: prevS.toString(), d: d.toString(), exp: n3, power: power.toString(), newS: s.toString() },
        iteration
      });
      const prevN = working;
      working = working / 10n;
      n = working;
      push({
        line: 9, phase: 'remove',
        expression: `n = n // 10  →  ${prevN} // 10 = ${working}`,
        explanation: {
          beginner: `Chop off the last digit.`,
          intermediate: `Floor-divide by 10 to drop units digit.`,
          technical: `n ← ⌊n/10⌋.`
        },
        iteration
      });
    }
    push({
      line: 6, phase: 'loop_end',
      expression: `while n != 0  →  False`,
      explanation: {
        beginner: `n is 0 — loop finished.`,
        intermediate: `Exit while loop.`,
        technical: `Loop terminated.`
      },
      iteration: totalIters
    });
    const isArm = n1 === s;
    push({
      line: 10, phase: 'compare',
      expression: `if n1 == s  →  ${n1} == ${s} is ${isArm}`,
      explanation: {
        beginner: isArm ? `Equal — Armstrong!` : `Not equal — not Armstrong.`,
        intermediate: `Compare original and sum.`,
        technical: `Branch on n1 == s.`
      }
    });
    if (isArm) {
      push({
        line: 11, phase: 'result',
        expression: `print(n1, "is armstrong number")`,
        explanation: {
          beginner: `${numStr} is an Armstrong number!`,
          intermediate: `Print success message.`,
          technical: `Console output of positive result.`
        },
        console: [`${numStr} is armstrong number`],
        isArmstrong: true
      });
    } else {
      push({
        line: 13, phase: 'result',
        expression: `print(n1, "is not armstrong number")`,
        explanation: {
          beginner: `${numStr} is not an Armstrong number.`,
          intermediate: `Print failure message.`,
          technical: `Console output of negative result.`
        },
        console: [`${numStr} is not armstrong number`],
        isArmstrong: false
      });
    }
  }

  return { steps, totalIters, n3, isArmstrong: n1 === s, sum: s.toString() };
}

const VAR_KEYS = ['n', 'n1', 'n2', 'n3', 's', 'd'];

function renderVars(step) {
  const el = document.getElementById('varMemory');
  if (!step) {
    el.innerHTML = VAR_KEYS.map(k => `
      <div class="var-card p-2 rounded-lg border border-border bg-panel2">
        <div class="text-[10px] text-slate-500 uppercase">${k}</div>
        <div class="text-slate-400">—</div>
      </div>`).join('');
    return;
  }
  const prev = state.steps[state.currentStep - 1];
  el.innerHTML = VAR_KEYS.map(k => {
    let val = step[k];
    if (val === null || val === undefined) val = '—';
    if (k === 'n2' && val !== '—') val = `"${val}"`;
    const changed = prev && String(prev[k]) !== String(step[k]);
    return `<div class="var-card p-2 rounded-lg border border-border bg-panel2 ${changed ? 'changed' : ''}">
      <div class="text-[10px] text-slate-500 uppercase">${k}</div>
      <div class="text-white truncate" title="${val}">${val}</div>
    </div>`;
  }).join('');
}

function renderExplanation(step) {
  const el = document.getElementById('explanationPanel');
  if (!step) {
    el.innerHTML = `<p class="text-slate-400 text-sm">Press <strong class="text-accent">Visualize</strong> to start.</p>`;
    return;
  }
  const exp = step.explanation[state.level] || step.explanation.beginner;
  el.innerHTML = `
    <div class="animate-fade">
      <div class="text-xs text-slate-500 mb-1">Current Line</div>
      <pre class="text-accent font-mono text-sm mb-3 whitespace-pre-wrap">${step.expression}</pre>
      <div class="text-xs text-slate-500 mb-1">What does this do?</div>
      <p class="text-slate-200 text-sm leading-relaxed">${exp}</p>
      ${step.calc ? `
        <div class="mt-3 p-3 rounded-lg bg-code border border-border font-mono text-xs">
          <div class="text-slate-400">Calculation</div>
          <div class="mt-1">${step.calc.d}<sup>${step.calc.exp}</sup> = ${step.calc.power}</div>
          <div>${step.calc.prevS} + ${step.calc.power} = <span class="text-accent">${step.calc.newS}</span></div>
        </div>` : ''}
    </div>`;
}

function renderDigit(step) {
  const el = document.getElementById('digitViz');
  if (!step || !step.digitExtract) {
    el.innerHTML = step && step.phase === 'loop_end'
      ? `<p class="text-success text-sm">All digits extracted</p>`
      : `<p class="text-slate-500 text-sm">Waiting…</p>`;
    return;
  }
  const { before, digit } = step.digitExtract;
  el.innerHTML = `
    <div class="font-mono text-2xl text-white tracking-widest">${before}</div>
    <div class="text-slate-500 my-1">│</div>
    <div class="text-slate-400 text-sm">% 10</div>
    <div class="text-slate-500">↓</div>
    <div class="text-3xl font-bold text-accent digit-fly">${digit}</div>
    <div class="text-xs text-slate-500 mt-2">${before} % 10 = ${digit}</div>`;
}

function renderCalc(step) {
  const el = document.getElementById('calcViz');
  if (!step || !step.powers || step.powers.length === 0) {
    el.innerHTML = `<p class="text-slate-500 text-sm">Powers appear as digits are processed</p>`;
    return;
  }
  const parts = step.powers.map(p => `${p.digit}<sup>${p.exp}</sup>`).join(' + ');
  const vals = step.powers.map(p => p.power).join(' + ');
  el.innerHTML = `
    <div class="font-mono text-sm text-slate-300">${parts}</div>
    <div class="text-slate-500 my-1">↓</div>
    <div class="font-mono text-sm text-slate-400">${vals}</div>
    <div class="text-slate-500 my-1">↓</div>
    <div class="font-mono text-lg text-accent font-semibold">${step.s}</div>`;
}

function renderLoop(step) {
  const el = document.getElementById('loopViz');
  const label = document.getElementById('iterLabel');
  const prog = document.getElementById('iterProgress');
  if (!step || !step.totalIters) {
    el.innerHTML = `<p class="text-slate-500">—</p>`;
    label.textContent = '0 / 0';
    prog.style.width = '0%';
    return;
  }
  const it = step.iteration || 0;
  label.textContent = `${it} / ${step.totalIters}`;
  prog.style.width = `${(it / step.totalIters) * 100}%`;
  const items = [];
  if (step.digits && step.digits.length) {
    for (let i = 0; i < step.digits.length; i++) {
      const dig = step.digits[i];
      const p = step.powers[i];
      items.push(`<div class="flex justify-between text-xs py-1 border-b border-border/50">
        <span class="text-slate-400">Iter ${i + 1}</span>
        <span class="font-mono">d=${dig}  s+=${p ? p.power : '?'}</span>
      </div>`);
    }
  }
  el.innerHTML = items.length ? items.join('') : `<p class="text-slate-500 text-sm">Loop not started</p>`;
}

function renderStack(step) {
  const el = document.getElementById('stackViz');
  if (state.mode !== 'with') {
    el.innerHTML = `<p class="text-slate-500 text-sm">No function — direct execution</p>
      <div class="mt-2 text-xs text-slate-400">n → n1 → digits → loop → compare → print</div>`;
    return;
  }
  if (!step || step.stack === false) {
    el.innerHTML = `<div class="text-xs text-slate-500">main</div>
      <div class="ml-2 mt-1 p-2 rounded border border-border bg-panel2 text-xs">
        ${step && step.returnValue !== undefined ? `returned ${step.returnValue}` : 'waiting / returned'}
      </div>`;
    return;
  }
  if (step.stack || (step.line >= 2 && step.line <= 13)) {
    el.innerHTML = `
      <div class="text-xs text-slate-500">main → isarmstrong(${state.number})</div>
      <div class="mt-2 p-3 rounded-lg border border-accent/40 bg-accent/5 font-mono text-xs space-y-1">
        <div class="text-accent text-[10px] uppercase tracking-wider mb-1">Function Stack Frame</div>
        <div>n  = ${step.n}</div>
        <div>n1 = ${step.n1}</div>
        <div>n2 = "${step.n2}"</div>
        <div>n3 = ${step.n3}</div>
        <div>s  = ${step.s}</div>
        <div>d  = ${step.d ?? '—'}</div>
      </div>`;
  } else {
    el.innerHTML = `<p class="text-slate-500 text-sm">—</p>`;
  }
}

function clearConsole() {
  document.getElementById('consoleOut').innerHTML = `<div class="text-slate-500">$ python armstrong.py</div>`;
}

function appendConsole(lines) {
  if (!lines || !lines.length) return;
  const el = document.getElementById('consoleOut');
  lines.forEach(line => {
    const div = document.createElement('div');
    div.className = 'text-slate-300';
    div.textContent = line;
    el.appendChild(div);
  });
  el.scrollTop = el.scrollHeight;
}

function renderTimeline(activePhase) {
  const phases = state.mode === 'with'
    ? ['INPUT', 'CALL', 'COPY', 'DIGITS', 'INIT', 'LOOP', 'EXTRACT', 'POWER', 'REMOVE', 'COMPARE', 'RETURN', 'RESULT']
    : ['INPUT', 'COPY', 'DIGITS', 'INIT', 'LOOP', 'EXTRACT', 'POWER', 'REMOVE', 'COMPARE', 'RESULT'];
  const phaseMap = {
    input: 'INPUT', call: 'CALL', copy: 'COPY', digits: 'DIGITS', init: 'INIT',
    loop_check: 'LOOP', loop_end: 'LOOP', extract: 'EXTRACT', power: 'POWER',
    remove: 'REMOVE', compare: 'COMPARE', return: 'RETURN', main_if: 'COMPARE', result: 'RESULT'
  };
  const current = phaseMap[activePhase] || '';
  const el = document.getElementById('timeline');
  let found = false;
  el.innerHTML = phases.map((p, i) => {
    let cls = 'timeline-step px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-slate-400';
    if (p === current) { cls += ' active'; found = true; }
    else if (!found && current) cls += ' done';
    const arrow = i < phases.length - 1 ? '<span class="text-slate-600 mx-1">→</span>' : '';
    return `<span class="${cls}">${p}</span>${arrow}`;
  }).join('');
}

function renderResult(step) {
  const banner = document.getElementById('resultBanner');
  const content = document.getElementById('resultContent');
  if (!step || step.phase !== 'result') {
    banner.classList.add('hidden');
    return;
  }
  banner.classList.remove('hidden');
  const isArm = step.isArmstrong;
  const n = state.number;
  const sum = step.s;
  const digs = n.toString().split('').map(Number);
  const exp = digs.length;
  const expr = digs.map(d => `${d}<sup>${exp}</sup>`).join(' + ');
  if (isArm) {
    content.innerHTML = `
      <div class="text-4xl mb-2 text-success">✓</div>
      <div class="text-2xl font-bold text-success mb-2">ARMSTRONG NUMBER</div>
      <div class="font-mono text-lg text-slate-300 mb-1">${n} = ${expr}</div>
      <div class="font-mono text-slate-400">${n} = ${sum}</div>
      <p class="mt-3 text-slate-400 text-sm">The number satisfies the Armstrong condition.</p>`;
  } else {
    content.innerHTML = `
      <div class="text-4xl mb-2 text-danger">✗</div>
      <div class="text-2xl font-bold text-danger mb-2">NOT AN ARMSTRONG NUMBER</div>
      <div class="font-mono text-lg text-slate-300 mb-1">${n} ≠ ${expr}</div>
      <div class="font-mono text-slate-400">${n} ≠ ${sum}</div>
      <p class="mt-3 text-slate-400 text-sm">The number does not satisfy the Armstrong condition.</p>`;
  }
}

function applyStep(idx) {
  if (idx < 0 || idx >= state.steps.length) return;
  state.currentStep = idx;
  const step = state.steps[idx];
  renderCode(step.line);
  renderExplanation(step);
  renderVars(step);
  renderDigit(step);
  renderCalc(step);
  renderLoop(step);
  renderStack(step);
  renderTimeline(step.phase);
  renderResult(step);
  document.getElementById('stepCounter').textContent = idx + 1;
  document.getElementById('stepTotal').textContent = state.steps.length;

  clearConsole();
  for (let i = 0; i <= idx; i++) {
    if (state.steps[i].console) appendConsole(state.steps[i].console);
  }
}

function stopPlay() {
  state.playing = false;
  if (state.playTimer) { clearTimeout(state.playTimer); state.playTimer = null; }
  document.getElementById('iconPlay').classList.remove('hidden');
  document.getElementById('iconPause').classList.add('hidden');
}

function playNext() {
  if (state.currentStep >= state.steps.length - 1) {
    stopPlay();
    return;
  }
  applyStep(state.currentStep + 1);
  if (state.playing) {
    state.playTimer = setTimeout(playNext, 1200 / state.speed);
  }
}

function startPlay() {
  if (!state.steps.length) return;
  if (state.currentStep >= state.steps.length - 1) applyStep(0);
  state.playing = true;
  document.getElementById('iconPlay').classList.add('hidden');
  document.getElementById('iconPause').classList.remove('hidden');
  playNext();
}

function validateInput(raw) {
  const err = document.getElementById('inputError');
  if (raw === '' || raw === null) {
    err.textContent = '⚠ Please enter a number.';
    err.classList.remove('hidden');
    return null;
  }
  if (!/^\d+$/.test(raw.trim())) {
    err.textContent = '⚠ Please enter a valid positive integer (no decimals, signs, or letters).';
    err.classList.remove('hidden');
    return null;
  }
  const n = raw.trim();
  if (n.length > 18) {
    err.textContent = '⚠ Number too large for comfortable visualization (max ~18 digits).';
    err.classList.remove('hidden');
    return null;
  }
  err.classList.add('hidden');
  return n;
}

function runVisualization() {
  stopPlay();
  const raw = document.getElementById('numberInput').value;
  const numStr = validateInput(raw);
  if (numStr === null) return;
  state.number = numStr;
  const result = generateSteps(numStr, state.mode);
  state.steps = result.steps;
  clearConsole();
  document.getElementById('resultBanner').classList.add('hidden');
  applyStep(0);
}

// Event bindings
document.getElementById('btnVisualize').addEventListener('click', runVisualization);
document.getElementById('btnReset').addEventListener('click', () => {
  stopPlay();
  document.getElementById('numberInput').value = '153';
  state.steps = [];
  state.currentStep = -1;
  renderCode(null);
  renderExplanation(null);
  renderVars(null);
  document.getElementById('digitViz').innerHTML = `<p class="text-slate-500 text-sm">Waiting for execution…</p>`;
  document.getElementById('calcViz').innerHTML = `<p class="text-slate-500 text-sm">Powers will appear here</p>`;
  document.getElementById('loopViz').innerHTML = `<p class="text-slate-500">Loop iterations will appear here</p>`;
  document.getElementById('iterLabel').textContent = '0 / 0';
  document.getElementById('iterProgress').style.width = '0%';
  document.getElementById('stackViz').innerHTML = `<p class="text-slate-500 text-sm">Stack frames appear in function mode</p>`;
  clearConsole();
  document.getElementById('resultBanner').classList.add('hidden');
  document.getElementById('stepCounter').textContent = '0';
  document.getElementById('stepTotal').textContent = '0';
  document.getElementById('timeline').innerHTML = '';
  document.getElementById('inputError').classList.add('hidden');
});

document.getElementById('btnPlay').addEventListener('click', () => {
  if (state.playing) stopPlay();
  else startPlay();
});
document.getElementById('btnNext').addEventListener('click', () => {
  stopPlay();
  if (state.currentStep < state.steps.length - 1) applyStep(state.currentStep + 1);
});
document.getElementById('btnPrev').addEventListener('click', () => {
  stopPlay();
  if (state.currentStep > 0) applyStep(state.currentStep - 1);
});
document.getElementById('btnRestart').addEventListener('click', () => {
  stopPlay();
  if (state.steps.length) applyStep(0);
});

document.querySelectorAll('.example-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('numberInput').value = btn.dataset.n;
    runVisualization();
  });
});

document.getElementById('tabWithFn').addEventListener('click', () => {
  state.mode = 'with';
  document.getElementById('tabWithFn').className = 'mode-tab px-5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 border-accent text-accent bg-panel/50';
  document.getElementById('tabWithoutFn').className = 'mode-tab px-5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-slate-400 hover:text-slate-200';
  renderCode(null);
  if (state.steps.length) runVisualization();
});
document.getElementById('tabWithoutFn').addEventListener('click', () => {
  state.mode = 'without';
  document.getElementById('tabWithoutFn').className = 'mode-tab px-5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 border-accent text-accent bg-panel/50';
  document.getElementById('tabWithFn').className = 'mode-tab px-5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 border-transparent text-slate-400 hover:text-slate-200';
  renderCode(null);
  if (state.steps.length) runVisualization();
});

document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.level = btn.dataset.level;
    document.querySelectorAll('.level-btn').forEach(b => {
      b.className = 'level-btn px-3 py-1.5 text-slate-400 hover:bg-panel2';
    });
    btn.className = 'level-btn px-3 py-1.5 bg-accent/20 text-accent';
    if (state.currentStep >= 0) renderExplanation(state.steps[state.currentStep]);
  });
});

document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.speed = parseFloat(btn.dataset.speed);
    document.querySelectorAll('.speed-btn').forEach(b => {
      b.className = 'speed-btn px-2.5 py-1 text-xs text-slate-400 hover:bg-panel2';
    });
    btn.className = 'speed-btn px-2.5 py-1 text-xs bg-accent/20 text-accent';
  });
});

const opTexts = {
  '%': `<strong class="text-accent">Modulo (%)</strong><br>Returns the remainder after division.<br>Example: <code>153 % 10 = 3</code> — the last digit.<br>Used to extract each digit from right to left.`,
  '//': `<strong class="text-accent">Floor division (//)</strong><br>Divides and discards the fractional part.<br>Example: <code>153 // 10 = 15</code> — removes the last digit.<br>Integer-only; perfect for digit peeling.`,
  '**': `<strong class="text-accent">Exponentiation (**)</strong><br>Raises the left number to the power of the right.<br>Example: <code>3 ** 3 = 27</code>.<br>Each digit is raised to the total number of digits.`,
  'str/len': `<strong class="text-accent">str() and len()</strong><br><code>str(153)</code> → <code>"153"</code><br><code>len("153")</code> → <code>3</code><br>Together they give the digit count used as the exponent.`
};
document.querySelectorAll('.op-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const box = document.getElementById('opExplain');
    box.innerHTML = opTexts[btn.dataset.op] || '';
    box.classList.remove('hidden');
  });
});

document.getElementById('numberInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') runVisualization();
});

// Initial load setup
renderCode(null);
renderVars(null);