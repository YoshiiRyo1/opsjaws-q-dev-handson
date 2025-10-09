# opsjaws-q-dev-handson
Ops-JAWS Amazon Q Developer Handson


## 目次

1. Q Dev CLI インストール、AWS CLI インストール、uv インストール
2. CDK インストール、Sample App 作成
3. Q Dev CLI のおすすめ設定解説
4. Q Dev CLI やってみる
5. Q Dev マネコン やってみる

## インストール

https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html


```bash
$ q doctor

✔ Everything looks good!

Amazon Q still not working? Run q issue to let us know!
```

## ツール

[ツール権限の管理](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-chat-tools.html)  

| ツール       | 説明                                                        |
| ------------ | ----------------------------------------------------------- |
| fs_read      | システム上のファイルとディレクトリを読み取ります。          |
| fs_write     | システム上でファイルを作成および変更します。                |
| execute_bash | システム上で bash コマンドを実行します。                    |
| use_aws      | AWS サービスと対話するために AWS CLI 呼び出しを行います。   |
| report_issue | ブラウザを開いて、チャットに関する問題を AWS に報告します。 |


```bash
$ q chat

> /tools untrust execute_bash

> /tools untrust fs_read

> /tools untrust fs_write

> /tools untrust use_aws
```

## カスタムエージェント

[カスタムエージェントの定義](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-custom-agents-defining.html)

```bash
> /agent list

  opsjaws
* q_cli_default

# 一旦 q developerを終了
> /quit

# 再度 q developerを起動、opsjawsエージェントを指定
$ q chat --agent opsjaws

[opsjaws] > /agent list

* opsjaws
```

## MCP Server

[Installing uv](https://docs.astral.sh/uv/getting-started/installation/)

Mac

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Windows

```powershell
Set-ExecutionPolicy RemoteSigned -Scope Process

powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 上のコマンド実行後に Path を設定するコマンドが表示されているはずです。コピペで実行してください。
$env:Path = "C:\Users\<UserName>\.local\bin;$env:Path"
```


```bash
# 一旦 q developerを終了
> /quit

$ q chat --agent opsjaws

[opsjaws] > /mcp

Still loading:
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 - awslabs.core-mcp-server
```
