# Q Developer CLI のおすすめ設定解説

Q Developer CLI で Ops するためにおすすめ設定を解説します。  

Q Developer CLI では、特定のユースケースやワークフローに合わせて設定をカスタマイズしたエージェントを作成できます。
自分たちが管理するシステムに合わせたツールやコンテキストを事前に設定しておくことで、Q Developer CLI の応答の精度と関連性を向上させることができます。  

詳細は [User Guide](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-custom-agents.html) に記載されています。  

## カスタムエージェント作成方法

Q Developer CLI 起動後 `/agent generate` コマンドを実行するとカスタムエージェントの作成が開始されます。  

```bash
# Start agent generation
/agent generate

# Q Developer prompts for agent name
Enter agent name: my-dev-agent

# Q Developer prompts for description
Enter agent description: I need an agent that helps with Python development, includes linting tools, and can access my project documentation

# Q Developer prompts for scope selection
Agent scope
> Local (current workspace)
  Global (all workspaces)

# Q Developer generates configuration and opens editor
Generating agent configuration...
Opening editor for review...

# After saving and closing editor
Agent 'my-dev-agent' created successfully at .amazonq/cli-agents/my-dev-agent.json
```
[Example workflow](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-agent-generate.html) より引用

### エージェントファイル

カスタムエージェントの設定ファイルは以下の場所に保存されます。  
今回は事前に用意したエージェントが `.amazonq/cli-agents/opsjaws.json` に保存されています。  

- Local agents (default): `.amazonq/cli-agents/agent-name.json`
- Global agents (selected via prompt): `~/.aws/amazonq/cli-agents/agent-name.json`

### エージェントの呼び出し

Q Developer CLI 起動時に `--agent` オプションでエージェントを指定します。  
本ハンズオンでは以下のコマンドを使用してください。  

```bash
q chat --agent opsjaws
```

## カスタムエージェント `opsjaws` の解説

[opsjaws.json](./.amazonq/cli-agents/opsjaws.json) の解説をします。  

### name

カスタムエージェントの名前です。  

```
	"name": "opsjaws",
```

### mcpServers

Q Developer CLI が使う MCP Server を指定します。  
MCP Server 無しでは Ops できないと言っても過言ではないくらい便利です。  
本ハンズオンでは `Core MCP Server` という様々な AWS MCP Server のプロキシとなるものを使用しています。  
他の MCP Server を使ってみたい方は [Welcome to AWS MCP Servers](https://awslabs.github.io/mcp/) を参照してください。  

```
	"mcpServers": {
		"awslabs.core-mcp-server": {
			"command": "uvx",
			"args": [
				"awslabs.core-mcp-server@latest"
			],
			"env": {
				"FASTMCP_LOG_LEVEL": "ERROR",
				"AWS_PROFILE": "opsjaws-handson",
				"AWS_REGION": "ap-northeast-1",
				"aws-foundation": "true",
				"solutions-architect": "true",
				"security-identity": "true",
				"monitoring-observability": "true"
			},
			"autoApprove": [],
			"disabled": false
		}
	},
```

### tools

利用可能なツールを指定します。  
`"*"` とすることで、MCP Server を含む全てのツールが利用可能になります。  

Q Developer CLI には以下のようなビルドインツールが用意されています。  
どのツールを使わせるかの選択がここで可能です。例えば、読み取り専用にしたいので `fs_write` や `execute_bash` を外すといった使い方が想定されます。  

- fs_read - Read files, directories, and images
- fs_write - Create and edit files
- execute_bash - Execute shell commands
- use_aws - Make AWS CLI API calls
- knowledge - Store and retrieve information across sessions
- introspect - Provide information about Q CLI capabilities

MCP Server で使用するツールを厳選したい場合もここで指定します。  

```
	"tools": [
		"*"
	],
```

### allowedTools

プロンプトで使用許可有無を聞かれることなく使えるツールを指定します。  
毎回プロンプトで実行の確認をしたほうが安全ではありますが、煩わしいと感じたときはここで指定します。  

```
  "allowedTools": [
    "fs_read"
  ]
```

### resources

Q Developer CLI が参照するリソースを指定します。  
`AmazonQ.md` はいわゆる指示書や Agents.md のような存在です。  

```
	"resources": [
		"file://AmazonQ.md",
		"file://README.md",
		"file://.amazonq/rules/**/*.md"
	],
```

### toolsSettings

特定のツールに対する設定を指定します。  
以下の例だと、`execute_bash` ツールで実行できないコマンドを指定しています。

```
  "toolsSettings": {
	"execute_bash": {
		"allowedCommands": [],
		"deniedCommands": [
			"git commit .*",
			"git push .*",
			"rm -rf .*",
			"sudo .*",
			"shutdown .*",
			"reboot .*"
		],
		"allowReadOnly": true
	}
  }
```

## AmazonQ.md の解説

[AmazonQ.md](./AmazonQ.md) の解説をします。

### ペルソナ

Q Developer CLI に役割を定義しています。  
ここをシステムの特性に合わせて詳細に記述することが、Q Developer CLIの精度向上の鍵となります。  
以下の例ではまだまだ不足しています。システム運用を続けながら、そして、インシデント対応を繰り返しながら改善していくことをお勧めします。  

```
# Persona

A persona is a personality definition that determines the behavior of AI.
Upon receiving human instructions, Amazon Q adheres to the behavior as defined by the persona's personality.

## personality definition

Systems architecture / Systems Operations specialist, AWS specialty

## Core Principles

1. Investigate logs, metrics, and traces to identify root causes
2. Systems Thinking: Analyze impacts across entire system
3. Security First: Prioritize security in all solutions
4. Cost Efficiency: Optimize for cost-effective solutions
5. Revise and Improve: Continuously enhance systems
```

### MCP Server

MCP Server を積極的に使うような指示をしています。  
無くても良さそう気がしますが、明確に指示しておいたほうが確実です。  

```
# MCP Server Preferences

Use `awslabs.core-mcp-server` in every situation.  
```

### リソース

Q Developer CLI が参照する AWS リソースを列挙しています。  
ここを充実させることで、Q Developer CLI の回答の精度が向上します。  

ただ単に「データベースの負荷を調べて」だけでは正しい調査をしてくれることはありません。
Q Developer CLI にははっきりと明確な指示を出したいのでリソースを列挙することにしました。  
本ハンズオンでは CDK でリソースを作成していますので、CloudFormation のアウトプットをここに書くような手順にしています。  

```
# Resources

Here is a list of AWS resources we manage. Amazon Q can answer questions about these resources and assist with troubleshooting issues.  
```

<nav aria-label="ページナビゲーション">  
  <ul style="display: flex; justify-content: space-between; list-style: none; padding: 0;">  
    <li style="padding: 20px; text-align: left;"><a href="chap2.md">前へ</a></li>  
    <li style="padding: 20px; text-align: center;"><a href="README.md">目次に戻る</a></li>  
    <li style="padding: 20px; text-align: right;"><a href="chap4.md">次へ</a></li>  
  </ul>  
</nav>  
