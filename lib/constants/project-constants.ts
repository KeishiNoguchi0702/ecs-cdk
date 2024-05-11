export const projectConstants = {
  projectName: 'sbcntr',

  vpc: {
    vpcName: 'sbcntrVpc',
    cidr: '10.0.0.0/16',
  },

  availabilityZones: {
    apne1a: 'ap-northeast-1a',
    apne1c: 'ap-northeast-1c',
    apne1d: 'ap-northeast-1d',
  },

  defaultRouteDestinationCidrBlock: '0.0.0.0/0',

  // セキュリティグループで多用するポート番号リスト
  securityGroup: {
    portNumber: {
      httpProt: 80,
      httpsPort: 443,
      mySqlPort: 3306,
    },
    ipProtocol: {
      tcp: 'tcp',
    },
    cidrBlock: {
      anyWhereIPv4: '0.0.0.0/0',
      anyWhereIPv6: '::/0'
    }
  }
}
