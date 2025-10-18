# Ops-JAWS Amazon Q Developer Handson


2025年10月21日に開催された [Ops-JAWS Meetup37 [ハンズオン] Q Developer で Ops できるかな](https://opsjaws.connpass.com/event/370434/) の資料リポジトリです。

## 目次

1. [Q Developer CLI インストール、AWS CLI インストール、uv インストール、Application Signals 有効化](chap1.md)
2. [CDK インストール、 サンプルアプリケーション作成](chap2.md)
3. [Q Developer CLI のおすすめ設定解説](chap3.md)
4. [Q Developer CLI やってみる](chap4.md)
5. [Q Developer マネコン やってみる](chap5.md)
6. [クリーンアップ](chap6.md)

## ハンズオンの前提

- 自身が所有している AWS アカウントがあること
    - 本番環境ではないことが望ましい
- AdministratorAccess 権限の持つ IAM ユーザー/ロールが使えること
- オレゴンリージョン(us-west-2)での実施すること
    - 用意されている CDK コードの仕様上 ap-northeast-1 では動作しません

## 謝辞

本ハンズオンで使用しているサンプルアプリケーションは以下の2つのリポジトリから借用しています。  

[Distributed version of the Spring PetClinic Sample Application built with Spring Cloud and Spring AI](https://github.com/spring-petclinic/spring-petclinic-microservices/tree/main)  
[application-signals-demo](https://github.com/aws-observability/application-signals-demo/tree/main)  
