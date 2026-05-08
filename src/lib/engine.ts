import * as math from 'mathjs';

export interface LineResult {
  value: string;
  isError: boolean;
}

export function evaluateNotebook(content: string): LineResult[] {
  const lines = content.split('\n');
  const scope: Record<string, any> = {};
  const results: LineResult[] = [];
  let lastResult: any = 0;

  lines.forEach((line) => {
    // Strip inline comments for evaluation
    const evalLine = line.split(/[#]|\/\//)[0].trim();
    
    if (!evalLine) {
      results.push({ value: '', isError: false });
      return;
    }

    try {
      scope['last'] = lastResult;
      const result = math.evaluate(evalLine, scope);
      
      if (result !== undefined && typeof result !== 'function') {
        const valueStr = math.format(result, { precision: 14 });
        results.push({ value: valueStr, isError: false });
        lastResult = result;
      } else {
        results.push({ value: '', isError: false });
      }
    } catch (err) {
      // Check if it's just a variable assignment that failed to evaluate to a "value"
      // but actually succeeded in assignment (unlikely with mathjs evaluate, but possible)
      results.push({ value: 'Error', isError: true });
    }
  });

  return results;
}
