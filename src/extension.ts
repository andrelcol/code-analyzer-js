import * as vscode from 'vscode';
import * as acorn from 'acorn-loose';
import * as estraverse from 'estraverse';
import * as escodegen from 'escodegen';

export function activate(context: vscode.ExtensionContext) {
    console.log('CodeAnalyzerJS está ativo!');

    const disposable = vscode.commands.registerCommand('code-analyzer-js.analyzer', () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showInformationMessage('Nenhum arquivo aberto para análise.');
            return;
        }

        // Obtenha o texto do arquivo aberto
        const code = editor.document.getText();

        try {
            // Parse o código para gerar a AST
            const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true });

            // Array para armazenar problemas encontrados
            const diagnostics: vscode.Diagnostic[] = [];

            // Percorra a AST para identificar problemas
			estraverse.traverse(ast as any, {
				enter(node: any) {
					if (node.type === 'ForStatement') {
						// Mensagem informando o problema
						const message = 'For loop encontrado: considere substituir por uma função de ordem superior como map ou filter.';
						const range = new vscode.Range(
							new vscode.Position(node.loc!.start.line - 1, node.loc!.start.column),
							new vscode.Position(node.loc!.end.line - 1, node.loc!.end.column)
						);
			
						// Gerar código otimizado
						const optimizedNode = {
							type: 'CallExpression',
							callee: {
								type: 'MemberExpression',
								object: { type: 'Identifier', name: 'array' },
								property: { type: 'Identifier', name: 'filter' },
							},
							arguments: [
								{
									type: 'ArrowFunctionExpression',
									params: [{ type: 'Identifier', name: 'x' }],
									body: {
										type: 'BinaryExpression',
										operator: '%',
										left: { type: 'Identifier', name: 'x' },
										right: { type: 'Literal', value: 2 },
									},
								},
							],
						};
			
						const optimizedCode = escodegen.generate(optimizedNode);
			
						// Substituir código diretamente no editor
						const editor = vscode.window.activeTextEditor;
						if (editor) {
							const oldCode = editor.document.getText(range);
							const commentedOldCode = oldCode
								.split('\n')
								.map(line => `// ${line}`) // Adicionar `//` em cada linha
								.join('\n');
			
							const newCode = `${commentedOldCode}\n${optimizedCode}`;
			
							editor.edit(editBuilder => {
								editBuilder.replace(range, newCode);
							});
			
							vscode.window.showInformationMessage('Código otimizado e antigo comentado com sucesso!');
						}
			
						// Adicionar ao painel de problemas
						const diagnostic = new vscode.Diagnostic(range, `${message}\nSugestão: ${optimizedCode}`, vscode.DiagnosticSeverity.Warning);
						diagnostics.push(diagnostic);
					}
				},
			});
			
			

            // Exiba os problemas no painel de problemas do VS Code
            const diagnosticCollection = vscode.languages.createDiagnosticCollection('codeAnalyzerJS');
            diagnosticCollection.set(editor.document.uri, diagnostics);

            vscode.window.showInformationMessage('Análise concluída! Verifique os problemas no painel.');
        } catch (error) {
            vscode.window.showErrorMessage(`Erro ao analisar o código: ${(error as Error).message}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
