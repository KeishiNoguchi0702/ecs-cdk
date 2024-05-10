export const projectConstants = {
  projectName: 'ecs-cdk',

  vpcName: `ecs-cdk-vpc`,

  // セキュリティグループで多用するポート番号リスト
  securityGroup: {
    httpProt: 80,
    httpsPort: 443,
    mySqlPort: 3306,
  }
}
