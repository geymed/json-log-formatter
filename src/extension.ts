import * as vscode from 'vscode';

const legend = new vscode.SemanticTokensLegend(
	['logKey', 'level.trace', 'level.debug', 'level.info', 'level.warn', 'level.error'],
	[]
);

export function activate(ctx: vscode.ExtensionContext) {
	ctx.subscriptions.push(
		vscode.languages.registerDocumentSemanticTokensProvider(
			{ language: 'salto-log' },
			new SaltoLogTokenProvider(),
			legend
		)
	);
}

class SaltoLogTokenProvider implements vscode.DocumentSemanticTokensProvider {
	provideDocumentSemanticTokens(doc: vscode.TextDocument): vscode.SemanticTokens {
		const builder = new vscode.SemanticTokensBuilder(legend);

		for (let line = 0; line < doc.lineCount; line++) {
			const text = doc.lineAt(line).text;

			// highlight keys
			['"level"', '"time"', '"name"', '"message"'].forEach(key => {
				const i = text.indexOf(key);
				if (i >= 0) builder.push(line, i, key.length, 0 /*logKey*/, 0);
			});

			// highlight level value
			const m = text.match(/"level":"(trace|debug|info|warn|error)"/);
			if (m) {
				const val = m[1];
				const start = text.indexOf(`"${val}"`) + 1;  // +1 skips the opening quote
				const tokenType = legend.tokenTypes.indexOf(`level.${val}`);
				builder.push(line, start, val.length, tokenType, 0);
			}
		}
		return builder.build();
	}
}
