export const projectConstants = {
  projectName: 'ecs-cdk',

  vpc: {
    vpcName: `ecs-cdk-vpc`,
    cidr: '10.0.0.0/16',
  },

  // セキュリティグループで多用するポート番号リスト
  securityGroup: {
    httpProt: 80,
    httpsPort: 443,
    mySqlPort: 3306,
  }
}
