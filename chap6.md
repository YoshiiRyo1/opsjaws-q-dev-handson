# クリーンアップ

ハンズオンが完了したら忘れずにリソースを削除しましょう。  

## ECS 関連リソースの削除

```bash
cd scripts/ecs/appsignals && ./setup-ecs-demo.sh --region=$AWS_REGION --operation=delete
```

## CodeBuild 関連リソースの削除

```bash
cd ../../../cdk/codebuild
cdk destroy

# 途中で以下が表示されたら y を入力
Are you sure you want to delete: ApplicationSignalsCodeBuildStack (y/n) y
```

## CloudFormation スタックが削除されたことの確認

```bash
# 複数の CloudFormation スタックの存在確認とリソース一覧出力
STACKS=(
  "ApplicationSignalsCodeBuildStack"
  "PetClinicNetworkStack"
  "LogStack"
  "LoadBalancerStack"
  "RdsDatabaseStack"
  "ServiceDiscoveryStack"
  "IamRolesStack"
  "EcsClusterStack"
)

for STACK_NAME in "${STACKS[@]}"; do
  if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION &>/dev/null; then
    echo "✓ スタック '$STACK_NAME' が存在します。リソース一覧を出力中..."
    aws cloudformation list-stack-resources \
      --stack-name $STACK_NAME \
      --query 'StackResourceSummaries[*].[LogicalResourceId,PhysicalResourceId,ResourceType]' \
      --output text
  else
    echo "✗ スタック '$STACK_NAME' が存在しません。スキップします。"
  fi
done
```

## ブートストラップの削除

```bash
# CDKToolkit スタック内の S3 バケット名を取得
BUCKET_NAME=$(aws cloudformation describe-stack-resources \
  --stack-name CDKToolkit \
  --query 'StackResources[?ResourceType==`AWS::S3::Bucket`].PhysicalResourceId' \
  --output text)

if [ -n "$BUCKET_NAME" ]; then
  echo "S3 バケット '$BUCKET_NAME' を空にしています..."
  aws s3 rm s3://$BUCKET_NAME --recursive
  echo "✓ バケットを空にしました"
fi

# スタックを削除
aws cloudformation delete-stack --stack-name CDKToolkit --region $AWS_REGION
aws cloudformation wait stack-delete-complete --stack-name CDKToolkit --region $AWS_REGION
echo "✓ スタック 'CDKToolkit' の削除が完了しました"

# すべてのオブジェクトバージョンを削除
aws s3api list-object-versions \
  --bucket $BUCKET_NAME \
  --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' \
  --output json | \
  jq -r '.Objects[] | "--key \(.Key) --version-id \(.VersionId)"' | \
  xargs -L1 aws s3api delete-object --bucket $BUCKET_NAME

# 削除マーカーも削除
aws s3api list-object-versions \
  --bucket $BUCKET_NAME \
  --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' \
  --output json | \
  jq -r '.Objects[] | "--key \(.Key) --version-id \(.VersionId)"' | \
  xargs -L1 aws s3api delete-object --bucket $BUCKET_NAME

# バケットを削除
aws s3 rb s3://$BUCKET_NAME
```

---

<nav aria-label="ページナビゲーション">  
  <ul style="display: flex; justify-content: space-between; list-style: none; padding: 0;">  
    <li style="padding: 20px; text-align: left;"><a href="chap5.md">前へ</a></li>  
    <li style="padding: 20px; text-align: center;"><a href="README.md">目次に戻る</a></li>  
  </ul>  
</nav>  
