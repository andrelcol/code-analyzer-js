/*
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

        const code = editor.document.getText();

        try {
            const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true });
            const diagnostics: vscode.Diagnostic[] = [];

			estraverse.traverse(ast as any, {
				enter(node: any) {
					if (node.type === 'ForStatement') {
						const range = new vscode.Range(
							new vscode.Position(node.loc!.start.line - 1, node.loc!.start.column),
							new vscode.Position(node.loc!.end.line - 1, node.loc!.end.column)
						);
			
						let suggestion = 'Não foi identificada uma melhoria para este loop.';
						let optimizedCode = '';
						let declarationRange: vscode.Range | null = null;
			
						// Verifica se o loop pode ser substituído por 'filter'
						if (
							node.body.type === 'BlockStatement' &&
							node.body.body.length === 1 &&
							node.body.body[0].type === 'IfStatement'
						) {
							const ifStatement = node.body.body[0];
							if (
								ifStatement.consequent.type === 'BlockStatement' &&
								ifStatement.consequent.body.length === 1 &&
								ifStatement.consequent.body[0].type === 'ExpressionStatement' &&
								ifStatement.consequent.body[0].expression.type === 'CallExpression' &&
								ifStatement.consequent.body[0].expression.callee.type === 'MemberExpression' &&
								ifStatement.consequent.body[0].expression.callee.property.name === 'push'
							) {
								suggestion = 'Este loop pode ser substituído por um filter.';
								const testCondition = escodegen.generate(ifStatement.test);
								const variableName = ifStatement.consequent.body[0].expression.callee.object.name;
			
								optimizedCode = `const ${variableName} = array.filter(x => ${testCondition});`;
			
								// Busca a declaração da variável para incluir no comentário
								const lines = editor.document.getText().split('\n');
								const declarationIndex = lines.findIndex(line => line.includes(`let ${variableName}`) || line.includes(`const ${variableName}`));
								if (declarationIndex !== -1) {
									const declarationLine = lines[declarationIndex];
									declarationRange = new vscode.Range(
										new vscode.Position(declarationIndex, 0),
										new vscode.Position(declarationIndex, declarationLine.length)
									);
								}
							}
						}
			
						// Verifica se o loop pode ser substituído por 'reduce'
						if (
							optimizedCode === '' && // Apenas verifica 'reduce' se 'filter' não foi identificado
							node.body.type === 'BlockStatement' &&
							node.body.body.length === 1 &&
							node.body.body[0].type === 'ExpressionStatement'
						) {
							const statement = node.body.body[0].expression;
			
							if (
								statement.type === 'AssignmentExpression' &&
								statement.operator === '+=' &&
								statement.left.type === 'Identifier' &&
								statement.right.type === 'MemberExpression'
							) {
								const accumulator = statement.left.name;
								const arrayName = statement.right.object.name;
								const indexVar = node.init.declarations[0].id.name;
			
								suggestion = 'Este loop pode ser substituído por um reduce.';
								optimizedCode = `const ${accumulator} = ${arrayName}.reduce((acc, ${indexVar}) => acc + ${indexVar}, 0);`;
			
								// Busca a declaração da variável para incluir no comentário
								const lines = editor.document.getText().split('\n');
								const declarationIndex = lines.findIndex(line => line.includes(`let ${accumulator}`) || line.includes(`const ${accumulator}`));
								if (declarationIndex !== -1) {
									const declarationLine = lines[declarationIndex];
									declarationRange = new vscode.Range(
										new vscode.Position(declarationIndex, 0),
										new vscode.Position(declarationIndex, declarationLine.length)
									);
								}
							}
						}
			
						// Caso nenhuma melhoria seja identificada
						if (!optimizedCode) {
							vscode.window.showInformationMessage(suggestion);
							return;
						}
			
						// Comenta o código atual (declaração + loop)
						editor.edit(editBuilder => {
							if (declarationRange) {
								const declarationText = editor.document.getText(declarationRange);
								editBuilder.replace(declarationRange, `// ${declarationText}`);
							}
			
							const oldCode = editor.document.getText(range);
							const commentedOldCode = oldCode
								.split('\n')
								.map(line => `// ${line}`)
								.join('\n');
			
							editBuilder.replace(range, `${commentedOldCode}\n${optimizedCode}`);
						});
			
						vscode.window.showInformationMessage('Código otimizado e antigo comentado com sucesso!');
			
						const diagnostic = new vscode.Diagnostic(range, suggestion, vscode.DiagnosticSeverity.Information);
						diagnostics.push(diagnostic);
					}
				},
			});
						
			
			
			
			
						

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
*/
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

        const code = editor.document.getText();

        try {
            const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true });
            const diagnostics: vscode.Diagnostic[] = [];
            const edits: {
                range: vscode.Range;
                declarationRange: vscode.Range | null;
                optimizedCode: string;
            }[] = [];

            estraverse.traverse(ast as any, {
                enter(node: any) {
                    if (node.type === 'ForStatement') {
                        const range = new vscode.Range(
                            new vscode.Position(node.loc!.start.line - 1, node.loc!.start.column),
                            new vscode.Position(node.loc!.end.line - 1, node.loc!.end.column)
                        );

                        let suggestion = 'Não foi identificada uma melhoria para este loop.';
                        let optimizedCode = '';
                        let declarationRange: vscode.Range | null = null;

                        // Verifica se o loop pode ser substituído por 'filter'
                        if (
                            node.body.type === 'BlockStatement' &&
                            node.body.body.length === 1 &&
                            node.body.body[0].type === 'IfStatement'
                        ) {
                            const ifStatement = node.body.body[0];
                            if (
                                ifStatement.consequent.type === 'BlockStatement' &&
                                ifStatement.consequent.body.length === 1 &&
                                ifStatement.consequent.body[0].type === 'ExpressionStatement' &&
                                ifStatement.consequent.body[0].expression.type === 'CallExpression' &&
                                ifStatement.consequent.body[0].expression.callee.type === 'MemberExpression' &&
                                ifStatement.consequent.body[0].expression.callee.property.name === 'push'
                            ) {
                                suggestion = 'Este loop pode ser substituído por um filter.';
                                const testCondition = escodegen.generate(ifStatement.test);
                                const variableName = ifStatement.consequent.body[0].expression.callee.object.name;

                                optimizedCode = `const ${variableName} = array.filter(x => ${testCondition});`;

                                const lines = editor.document.getText().split('\n');
                                const declarationIndex = lines.findIndex(line => line.includes(`let ${variableName}`) || line.includes(`const ${variableName}`));
                                if (declarationIndex !== -1) {
                                    const declarationLine = lines[declarationIndex];
                                    declarationRange = new vscode.Range(
                                        new vscode.Position(declarationIndex, 0),
                                        new vscode.Position(declarationIndex, declarationLine.length)
                                    );
                                }
                            }
                        }

                        // Verifica se o loop pode ser substituído por 'reduce'
                        if (
                            optimizedCode === '' &&
                            node.body.type === 'BlockStatement' &&
                            node.body.body.length === 1 &&
                            node.body.body[0].type === 'ExpressionStatement'
                        ) {
                            const statement = node.body.body[0].expression;

                            if (
                                statement.type === 'AssignmentExpression' &&
                                statement.operator === '+=' &&
                                statement.left.type === 'Identifier' &&
                                statement.right.type === 'MemberExpression'
                            ) {
                                const accumulator = statement.left.name;
                                const arrayName = statement.right.object.name;
                                const indexVar = node.init.declarations[0].id.name;

                                suggestion = 'Este loop pode ser substituído por um reduce.';
                                optimizedCode = `const ${accumulator} = ${arrayName}.reduce((acc, ${indexVar}) => acc + ${indexVar}, 0);`;

                                const lines = editor.document.getText().split('\n');
                                const declarationIndex = lines.findIndex(line => line.includes(`let ${accumulator}`) || line.includes(`const ${accumulator}`));
                                if (declarationIndex !== -1) {
                                    const declarationLine = lines[declarationIndex];
                                    declarationRange = new vscode.Range(
                                        new vscode.Position(declarationIndex, 0),
                                        new vscode.Position(declarationIndex, declarationLine.length)
                                    );
                                }
                            }
                        }

                        if (optimizedCode) {
                            edits.push({
                                range,
                                declarationRange,
                                optimizedCode,
                            });

                            const diagnostic = new vscode.Diagnostic(range, suggestion, vscode.DiagnosticSeverity.Information);
                            diagnostics.push(diagnostic);
                        }
                    }
                },
            });

            // Aplica todas as edições de uma só vez
            editor.edit(editBuilder => {
                edits.forEach(edit => {
                    if (edit.declarationRange) {
                        const declarationText = editor.document.getText(edit.declarationRange);
                        editBuilder.replace(edit.declarationRange, `// ${declarationText}`);
                    }

                    const oldCode = editor.document.getText(edit.range);
                    const commentedOldCode = oldCode
                        .split('\n')
                        .map(line => `// ${line}`)
                        .join('\n');

                    editBuilder.replace(edit.range, `${commentedOldCode}\n${edit.optimizedCode}`);
                });
            });

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
