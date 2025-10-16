# CDK インストール、 サンプルアプリケーション作成

CDK を使いサンプルアプリケーションを作成します。  
ハンズオン用の AWS アカウントを用意できない方は運営までお声がけください。  

## node.js インストール

> [!NOTE]
> node.js インストール済の方はスキップしてください。 

次の CDK インストールに必要なので node.js をインストールします。  
[Node.js®をダウンロードする](https://nodejs.org/ja/download/) に従ってインストールしてください。  

**Mac/Linux**

```bash
# nvmをダウンロードしてインストールする：
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# シェルを再起動する代わりに実行する
\. "$HOME/.nvm/nvm.sh"
# Node.jsをダウンロードしてインストールする：
nvm install 22
# Node.jsのバージョンを確認する：
node -v # "v22.20.0"が表示される。
# npmのバージョンを確認する：
npm -v # "10.9.3"が表示される。
```

## CDK インストール

> [!NOTE]
> CDK インストール済の方はスキップしてください。 

CDK をインストールします。  
[Getting started with the AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html) に従ってインストールしてください。  

```bash
npm install -g aws-cdk
```

インストール確認は以下のコマンドで行います。バージョンが表示されれば OK です。    

```bash
cdk --version
```

## 環境変数のセット

AWS CLI のプロファイルとリージョンを環境変数にセットします。  

```bash
export AWS_PROFILE=opsjaws-handson  # 事前に作成したプロファイルを指定
export AWS_REGION=us-west-2  # us-west-2 (オレゴン) リージョンを指定

# ※このコマンドは現在のターミナルセッションのみ有効です
# 新しいターミナルを開いた場合は再度実行してください
```

## CodeBuild リソースデプロイ

サンプルアプリケーションのビルドに使う CodeBuild リソースをデプロイします。  

```bash
cd cdk/codebuild
npm install
cdk bootstrap  # First time only - bootstraps CDK in the specified region
cdk deploy     # Deploys the CodeBuild stack to the specified region

# 途中で以下が表示されたら y を入力
"--require-approval" is enabled and stack includes security-sensitive updates: 'Do you wish to deploy these changes' (y/n) y

# 最後に以下のように表示されれば OK です
Outputs:
ApplicationSignalsCodeBuildStack.CodeBuildProjectArn = arn:aws:codebuild:AWS_REGION:AWS_ACCOUNT_ID:project/application-signals-build
ApplicationSignalsCodeBuildStack.CodeBuildProjectName = application-signals-build
ApplicationSignalsCodeBuildStack.SourceBucketName = application-signals-codebuild-source-AWS_ACCOUNT_ID-AWS_REGION
ApplicationSignalsCodeBuildStack.TriggerBuildCommand = aws codebuild start-build --project-name application-signals-build --region AWS_REGION
Stack ARN:
arn:aws:cloudformation:AWS_REGION:AWS_ACCOUNT_ID:stack/ApplicationSignalsCodeBuildStack/5a840c80-a660-11f0-9b71-0a512da58efd

✨  Total time: 109.53s
```

次の手順を行うためにリポジトリのルートディレクトリに戻ります。  

```bash 	
cd ../../
```

## コンテナイメージビルド

サンプルアプリケーションのコンテナイメージをビルドします。  

```bash
./scripts/trigger-build.sh --region $AWS_REGION

# 途中で以下が表示されたら y を入力
Do you want to wait for the build to complete? (y/n) y

# 最後に以下のように表示されれば OK です
Build completed successfully!
Done!
```

### コンテナイメージビルドのトラブルシューティング

失敗した方はマネジメントコンソールから `CodeBuild` → `ビルド履歴` を開きログを確認してください。  

CodeBuild が成功してもリポジトリにイメージが存在しない場合があります。以下のコマンドでリポジトリのイメージを確認してください。  

```bash
REPOS="
nodejs-petclinic-nutrition-service
otel-collector
python-petclinic-billing-service
python-petclinic-insurance-service
springcommunity/spring-petclinic-admin-server
springcommunity/spring-petclinic-api-gateway
springcommunity/spring-petclinic-config-server
springcommunity/spring-petclinic-customers-service
springcommunity/spring-petclinic-discovery-server
springcommunity/spring-petclinic-vets-service
springcommunity/spring-petclinic-visits-service
traffic-generator
"

for REPO in $REPOS; do
	IMAGE_COUNT=$(aws ecr list-images --repository-name $REPO --query 'length(imageIds)' --output text)
	if [ "$IMAGE_COUNT" -gt 0 ]; then
		echo "$REPO にはリポジトリにイメージが存在します"
	else
		echo "リポジトリにイメージが存在しません"
	fi
done
```


## ECS サンプルアプリケーション デプロイ

コンテナイメージビルドが成功したら、サンプルアプリケーションをデプロイします。  

```bash
# Amazon ECS のサービスリンクロールが存在しない場合のみ作成する
aws iam get-role --role-name AWSServiceRoleForECS 2>/dev/null || \
  aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com

cd scripts/ecs/appsignals && ./setup-ecs-demo.sh --region=$AWS_REGION
```


## リソース一覧を AmazonQ.md に出力

CDK で作成リソースの一覧を `AmazonQ.md` に出力します。  
こうすることで Q Developer CLI がリソースを認識しやすくなります。  

```bash
aws cloudformation list-stack-resources \
  --stack-name ApplicationSignalsCodeBuildStack \
  --query 'StackResourceSummaries[*].[LogicalResourceId,PhysicalResourceId,ResourceType]' \
  --output text | sed -e 's/\t/|/g' -e 's/^/|/' -e 's/$/|/' >> ./AmazonQ.md

aws cloudformation list-stack-resources \
  --stack-name PetClinicNetworkStack \
  --query 'StackResourceSummaries[*].[LogicalResourceId,PhysicalResourceId,ResourceType]' \
  --output text | sed -e 's/\t/|/g' -e 's/^/|/' -e 's/$/|/' >> ./AmazonQ.md

aws cloudformation list-stack-resources \
  --stack-name LogStack \
  --query 'StackResourceSummaries[*].[LogicalResourceId,PhysicalResourceId,ResourceType]' \
  --output text | sed -e 's/\t/|/g' -e 's/^/|/' -e 's/$/|/' >> ./AmazonQ.md

aws cloudformation list-stack-resources \
  --stack-name LoadBalancerStack \
  --query 'StackResourceSummaries[*].[LogicalResourceId,PhysicalResourceId,ResourceType]' \
  --output text | sed -e 's/\t/|/g' -e 's/^/|/' -e 's/$/|/' >> ./AmazonQ.md

aws cloudformation list-stack-resources \
  --stack-name RdsDatabaseStack \
  --query 'StackResourceSummaries[*].[LogicalResourceId,PhysicalResourceId,ResourceType]' \
  --output text | sed -e 's/\t/|/g' -e 's/^/|/' -e 's/$/|/' >> ./AmazonQ.md

aws cloudformation list-stack-resources \
  --stack-name ServiceDiscoveryStack \
  --query 'StackResourceSummaries[*].[LogicalResourceId,PhysicalResourceId,ResourceType]' \
  --output text | sed -e 's/\t/|/g' -e 's/^/|/' -e 's/$/|/' >> ./AmazonQ.md

aws cloudformation list-stack-resources \
  --stack-name IamRolesStack \
  --query 'StackResourceSummaries[*].[LogicalResourceId,PhysicalResourceId,ResourceType]' \
  --output text | sed -e 's/\t/|/g' -e 's/^/|/' -e 's/$/|/' >> ./AmazonQ.md

aws cloudformation list-stack-resources \
  --stack-name EcsClusterStack \
  --query 'StackResourceSummaries[*].[LogicalResourceId,PhysicalResourceId,ResourceType]' \
  --output text | sed -e 's/\t/|/g' -e 's/^/|/' -e 's/$/|/' >> ./AmazonQ.md
```

---

<nav aria-label="ページナビゲーション">
  <ul style="display: flex; justify-content: space-between; list-style: none; padding: 0;">
    <li style="padding: 20px; text-align: left;"><a href="chap1.md">前へ</a></li>
    <li style="padding: 20px; text-align: center;"><a href="README.md">目次に戻る</a></li>
    <li style="padding: 20px; text-align: right;"><a href="chap3.md">次へ</a></li>
  </ul>
</nav>
