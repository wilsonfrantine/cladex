// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface NewickNode {
  name: string;
  length?: number;
  branchset?: NewickNode[];
}

export interface ParseResult {
  valid: boolean;
  error?: string;
  leafCount?: number;
  leaves?: string[];
}

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Parser Newick minimalista que retorna { name, branchset, length }.
 * Suporta topologias com ou sem comprimento de ramos e nós internos nomeados.
 */
export function parseNewick(s: string): NewickNode {
  s = s.trim().replace(/;$/, '').trim();
  let pos = 0;

  function parseNode(): NewickNode {
    const node: NewickNode = { name: '' };

    // Filhos entre parênteses
    if (s[pos] === '(') {
      pos++; // consume '('
      node.branchset = [parseNode()];
      while (s[pos] === ',') {
        pos++; // consume ','
        node.branchset.push(parseNode());
      }
      if (s[pos] === ')') pos++; // consume ')'
    }

    // Label opcional (sem aspas)
    let name = '';
    while (pos < s.length && !/[,):;]/.test(s[pos])) {
      name += s[pos++];
    }
    node.name = name.trim();

    // Comprimento de ramo opcional
    if (s[pos] === ':') {
      pos++;
      let len = '';
      while (pos < s.length && !/[,);]/.test(s[pos])) len += s[pos++];
      const parsed = parseFloat(len);
      if (!isNaN(parsed)) node.length = parsed;
    }

    return node;
  }

  return parseNode();
}

// ─── Validação ────────────────────────────────────────────────────────────────

/** Valida e extrai metadados básicos de uma string Newick */
export function validateNewick(newick: string): ParseResult {
  const trimmed = newick.trim();
  if (!trimmed) {
    return { valid: false, error: 'A string Newick está vazia.' };
  }

  try {
    const tree = parseNewick(trimmed);
    const leaves = collectLeafNames(tree);

    if (leaves.length < 3) {
      return { valid: false, error: 'A árvore precisa ter pelo menos 3 táxons.' };
    }

    return { valid: true, leafCount: leaves.length, leaves };
  } catch {
    return {
      valid: false,
      error: 'Formato Newick inválido. Verifique parênteses, vírgulas e ponto-e-vírgula final.',
    };
  }
}

function collectLeafNames(node: NewickNode): string[] {
  if (!node.branchset?.length) return node.name ? [node.name] : [];
  return node.branchset.flatMap(collectLeafNames);
}
