import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { projectConstants } from '../constants/project-constants';
import { 
  aws_ec2 as ec2,
  aws_ssm as ssm,
} from 'aws-cdk-lib';
import {
  CfnSecurityGroup,
  CfnSecurityGroupIngress,
} from 'aws-cdk-lib/aws-ec2';

const projectName: string = projectConstants.projectName;
const anyWhereIPv4: string = projectConstants.securityGroup.cidrBlock.anyWhereIPv4;
const anyWhereIPv6: string = projectConstants.securityGroup.cidrBlock.anyWhereIPv6;
const httpProt: number = projectConstants.securityGroup.portNumber.httpProt;
const mySqlPort: number = projectConstants.securityGroup.portNumber.mySqlPort;
const tcp: string = projectConstants.securityGroup.ipProtocol.tcp;

export class SecurityGroupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcIdSsmParamName = `/${projectName}/vpcId`;
		const vpcId = ssm.StringParameter.valueFromLookup(this, vpcIdSsmParamName);
		const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { vpcId: vpcId });

    // インターネット公開のセキュリティグループ
    const sbcntrSgIngress = new CfnSecurityGroup(this, 'sbcntrSgIngress', {
      vpcId: vpc.vpcId,
      groupDescription: 'Security group for ingress',
      groupName: 'ingress',
      securityGroupEgress: [
        {
          cidrIp: anyWhereIPv4,
          description: 'Allow all outbound traffic by default',
          ipProtocol: '-1', // -1:すべてのプロトコルを許可する場合
        },
      ],
      securityGroupIngress: [
        {
          cidrIp: anyWhereIPv4,
          description: `from ${anyWhereIPv4}:${httpProt}`,
          fromPort: httpProt,
          ipProtocol: tcp,
          toPort: httpProt,
        },
        {
          cidrIpv6: anyWhereIPv6,
          description: `from ${anyWhereIPv6}:${httpProt}`,
          fromPort: httpProt,
          ipProtocol: tcp,
          toPort: httpProt,
        },
      ],
      tags: [
        { key: 'Name', value: 'sbcntr-sg-ingress' },
      ]
    });

    // 管理用サーバ向けのセキュリティグループ
    const sbcntrSgManagement = new CfnSecurityGroup(this, 'sbcntrSgManagement', {
      vpcId: vpc.vpcId,
      groupDescription: 'Security Group of management server',
      groupName: 'management',
      securityGroupEgress: [
        {
          cidrIp: anyWhereIPv4,
          description: 'Allow all outbound traffic by default',
          ipProtocol: '-1', // -1:すべてのプロトコルを許可する場合
        },
      ],
      tags: [
        { key: 'Name', value: 'sbcntr-sg-management' },
      ]
    });

    // バックエンドコンテナアプリ用セキュリティグループ
    const sbcntrSgBackContainer = new CfnSecurityGroup(this, 'sbcntrSgBackContainer', {
      vpcId: vpc.vpcId,
      groupDescription: 'Security Group of backend app',
      groupName: 'backend-container',
      securityGroupEgress: [
        {
          cidrIp: anyWhereIPv4,
          description: 'Allow all outbound traffic by default',
          ipProtocol: '-1', // -1:すべてのプロトコルを許可する場合
        },
      ],
      tags: [
        { key: 'Name', value: 'sbcntr-sg-backend-container' },
      ]
    });

    // フロントエンドコンテナアプリ用セキュリティグループ
    const sbcntrSgFrontContainer = new CfnSecurityGroup(this, 'sbcntrSgFrontContainer', {
      vpcId: vpc.vpcId,
      groupDescription: 'Security Group of front container app',
      groupName: 'frontend-container',
      securityGroupEgress: [
        {
          cidrIp: anyWhereIPv4,
          description: 'Allow all outbound traffic by default',
          ipProtocol: '-1', // -1:すべてのプロトコルを許可する場合
        },
      ],
      tags: [
        { key: 'Name', value: 'sbcntr-sg-frontend-container' },
      ]
    });

    // 内部用ロードバランサ用のセキュリティグループ
    const sbcntrSgInternal = new CfnSecurityGroup(this, 'sbcntrSgInternal', {
      vpcId: vpc.vpcId,
      groupDescription: 'Security group for internal load balancer',
      groupName: 'internal',
      securityGroupEgress: [
        {
          cidrIp: anyWhereIPv4,
          description: 'Allow all outbound traffic by default',
          ipProtocol: '-1', // -1:すべてのプロトコルを許可する場合
        },
      ],
      tags: [
        { key: 'Name', value: 'sbcntr-sg-internal' },
      ]
    });

    // DB用ロードバランサ用のセキュリティグループ
    const sbcntrSgDb = new CfnSecurityGroup(this, 'sbcntrSgDb', {
      vpcId: vpc.vpcId,
      groupDescription: 'Security Group of database',
      groupName: 'database',
      securityGroupEgress: [
        {
          cidrIp: anyWhereIPv4,
          description: 'Allow all outbound traffic by default',
          ipProtocol: '-1', // -1:すべてのプロトコルを許可する場合
        },
      ],
      tags: [
        { key: 'Name', value: 'sbcntr-sg-db' },
      ]
    });

    // ルール関連付け ##############

    // Internet LB -> Front Container
    new CfnSecurityGroupIngress(this, 'sbcntrSgFrontContainerFromSgIngress', {
      ipProtocol: tcp,
      description: 'HTTP for Ingress',
      fromPort: httpProt,
      groupId: sbcntrSgFrontContainer.attrGroupId,
      sourceSecurityGroupId: sbcntrSgIngress.attrGroupId,
      toPort: httpProt,
    });

    // Front Container -> Internal LB
    new CfnSecurityGroupIngress(this, 'sbcntrSgInternalFromSgFrontContainer', {
      ipProtocol: tcp,
      description: 'HTTP for front container',
      fromPort: httpProt,
      groupId: sbcntrSgInternal.attrGroupId,
      sourceSecurityGroupId: sbcntrSgFrontContainer.attrGroupId,
      toPort: httpProt,
    });

    // Internal LB -> Back Container
    new CfnSecurityGroupIngress(this, 'sbcntrSgContainerFromSgInternal', {
      ipProtocol: tcp,
      description: 'HTTP for internal lb',
      fromPort: httpProt,
      groupId: sbcntrSgBackContainer.attrGroupId,
      sourceSecurityGroupId: sbcntrSgInternal.attrGroupId,
      toPort: httpProt,
    });

    // Back container -> DB
    new CfnSecurityGroupIngress(this, 'sbcntrSgDbFromSgContainerTCP', {
      ipProtocol: tcp,
      description: 'MySQL protocol from backend App',
      fromPort: mySqlPort,
      groupId: sbcntrSgDb.attrGroupId,
      sourceSecurityGroupId: sbcntrSgBackContainer.attrGroupId,
      toPort: mySqlPort,
    });

    // Front container -> DB
    new CfnSecurityGroupIngress(this, 'sbcntrSgDbFromSgFrontContainerTCP', {
      ipProtocol: tcp,
      description: 'MySQL protocol from frontend App',
      fromPort: mySqlPort,
      groupId: sbcntrSgDb.attrGroupId,
      sourceSecurityGroupId: sbcntrSgFrontContainer.attrGroupId,
      toPort: mySqlPort,
    });

    // Management server -> DB
    new CfnSecurityGroupIngress(this, 'sbcntrSgDbFromSgManagementTCP', {
      ipProtocol: tcp,
      description: 'MySQL protocol from management server',
      fromPort: mySqlPort,
      groupId: sbcntrSgDb.attrGroupId,
      sourceSecurityGroupId: sbcntrSgManagement.attrGroupId,
      toPort: mySqlPort,
    });

    // Management server -> Internal LB
    new CfnSecurityGroupIngress(this, 'sbcntrSgInternalFromSgManagementTCP', {
      ipProtocol: tcp,
      description: 'HTTP for management server',
      fromPort: mySqlPort,
      groupId: sbcntrSgInternal.attrGroupId,
      sourceSecurityGroupId: sbcntrSgManagement.attrGroupId,
      toPort: mySqlPort,
    });
  }
}
