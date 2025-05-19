import * as vscode from 'vscode';

/*──────────────────── legend ────────────────────*/
const tokenTypes = [
	'logKey',
	'jsonKey',
	'level',
	'logValue',
	'nameValue',
	'messageValue',
] as const;

const tokenModifiers = ['trace', 'debug', 'info', 'warn', 'error'] as const;

const legend = new vscode.SemanticTokensLegend(
	tokenTypes as unknown as string[],
	tokenModifiers as unknown as string[],
);

/*────────────────── activate ────────────────────*/
export async function activate(ctx: vscode.ExtensionContext): Promise<void> {
	ctx.subscriptions.push(
		vscode.languages.registerDocumentSemanticTokensProvider(
			{ language: 'json-log', scheme: 'file' },
			new LogTokenProvider(),
			legend,
		),
	);

	await ensureWorkspaceColours();
}

/* write language-scoped colours once per workspace */
async function ensureWorkspaceColours(): Promise<void> {
	const cfg = vscode.workspace.getConfiguration('editor', null);
	const current =
		cfg.get<any>('semanticTokenColorCustomizations') ?? {};

	/* already has our palette? */
	if (current?.rules?.logKey === '#FF99D6') return;

	const updated = {
		...current,
		enabled: true,
		rules: {
			...(current.rules ?? {}),
			jsonKey: '#B9CBEB',
			/* our palette – works in every file but only our
			   custom token types ever appear outside json-Log */
			logKey: '#FF99D6',
			logValue: '#E0E6C8',
			nameValue: '#4EC9B0',
			messageValue: '#C586F2',
			'level.trace': '#757575',
			'level.debug': '#1DB954',
			'level.info': '#268BD2',
			'level.warn': '#B58900',
			'level.error': '#DC322F'
		}
	};

	await cfg.update(
		'semanticTokenColorCustomizations',
		updated,
		vscode.ConfigurationTarget.Workspace
	);

	vscode.window
		.showInformationMessage(
			'JSON-Log colour rules saved – reload to apply.',
			'Reload')
		.then(choice => {
			if (choice === 'Reload') {
				vscode.commands.executeCommand('workbench.action.reloadWindow');
			}
		});
}

/*────────────────── provider ────────────────────*/
class LogTokenProvider
	implements vscode.DocumentSemanticTokensProvider {
	provideDocumentSemanticTokens(doc: vscode.TextDocument) {
		const b = new vscode.SemanticTokensBuilder(legend);

		for (let ln = 0; ln < doc.lineCount; ln++) {
			const text = doc.lineAt(ln).text;

			['"level"', '"time"', '"name"', '"message"'].forEach((k) => {
				const i = text.indexOf(k);
				if (i >= 0) b.push(ln, i, k.length, idx('logKey'), 0);
			});

			const m = text.match(
				/"level"\s*:\s*"(trace|debug|info|warn|error)"/,
			);
			if (m) {
				const val = m[1] as typeof tokenModifiers[number];
				const pos = text.indexOf(`"${val}"`);
				b.push(
					ln,
					pos,
					val.length + 2,
					idx('level'),
					1 << tokenModifiers.indexOf(val),
				);
			}

			scan(/"time"\s*:\s*"([^"]+)"/g, 'logValue');
			scan(/"name"\s*:\s*"([^"]+)"/g, 'nameValue');
			scan(/"message"\s*:\s*"([^"]+)"/g, 'messageValue');

			function scan(re: RegExp, type: keyof typeof idxMap) {
				re.lastIndex = 0;
				let hit: RegExpExecArray | null;
				while ((hit = re.exec(text))) {
					const val = hit[1];
					const start = hit.index + hit[0].indexOf(`"${val}"`);
					b.push(ln, start, val.length + 2, idx(type), 0);
				}
			}
			const jsonKeyRe = /"([^"]+)"\s*:/g;
			let match: RegExpExecArray | null;
			while ((match = jsonKeyRe.exec(text))) {
				const keyText = match[0].slice(0, match[0].indexOf(':')); // includes quotes
				const start = match.index;
				const len = keyText.length;
				// skip if it is one of the 4 special keys (already orange / pink)
				if (!/^"(level|time|name|message)"$/.test(keyText)) {
					b.push(ln, start, len, idx('jsonKey'), 0);
				}
			}
		}
		return b.build();
	}
}

/* helper */
const idxMap = Object.fromEntries(tokenTypes.map((t, i) => [t, i])) as Record<
	string,
	number
>;
const idx = (t: keyof typeof idxMap) => idxMap[t];

export function deactivate(): void { }
