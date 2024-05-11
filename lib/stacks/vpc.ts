import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { projectConstants } from '../constants/project-constants';
import {
  CfnVPC,
  CfnInternetGateway,
  CfnVPCGatewayAttachment,
  CfnSubnet,
  CfnRouteTable,
  CfnSubnetRouteTableAssociation,
  CfnRoute,
} from 'aws-cdk-lib/aws-ec2';

const projectName: string = projectConstants.projectName;
const vpcName: string = projectConstants.vpc.vpcName;
const vpcCidr: string = projectConstants.vpc.cidr;
const apne1a: string = projectConstants.availabilityZones.apne1a;
const apne1c: string = projectConstants.availabilityZones.apne1c;
const defaultRouteDestinationCidrBlock: string = projectConstants.defaultRouteDestinationCidrBlock;

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new CfnVPC(this, vpcName, {
      cidrBlock: vpcCidr,
      enableDnsHostnames: true, // VPC がパブリック IP アドレスを持つインスタンスへのパブリック DNS ホスト名の割り当てをサポートするかどうか
      enableDnsSupport: true, // VPC が Amazon 提供の DNS サーバーを介した DNS 解決策をサポートするかどうか
      instanceTenancy: 'default', // https://dev.classmethod.jp/articles/ec2-tenancy/
      tags: [{ key: 'Name', value: vpcName}],
    });

    // InternetGateway
    const igw = new CfnInternetGateway(this, 'igw', {});
    const vpcGatewayAttachment = new CfnVPCGatewayAttachment(this, 'igwAttachment', {
      internetGatewayId: igw.ref,
      vpcId: vpc.ref,
    });

    // コンテナまわりのサブネット、ルートテーブル
    const privateContainerSubnet1a = new CfnSubnet(this, 'privateContainerSubnet1a', {
      cidrBlock: '10.0.8.0/24',
      vpcId: vpc.ref,
      availabilityZone: apne1a,
      mapPublicIpOnLaunch: false,
      tags: [
        { key: 'Name', value: 'sbcntr-subnet-private-container-1a'},
        { key: 'Type', value: 'Isolated'},
      ],
    });

    const privateContainerSubnet1c = new CfnSubnet(this, 'privateContainerSubnet1c', {
      cidrBlock: '10.0.9.0/24',
      vpcId: vpc.ref,
      availabilityZone: apne1c,
      mapPublicIpOnLaunch: false,
      tags: [
        { key: 'Name', value: 'sbcntr-subnet-private-container-1c'},
        { key: 'Type', value: 'Isolated'},
      ],
    });

    const privateContainerRouteTable = new CfnRouteTable(this, 'privateContainerRouteTable', {
      vpcId: vpc.ref,
      tags: [
        { key: 'Name', value: 'sbcntr-route-app' },
      ]
    });

    const privateContainerRouteTableAssociation1a = new CfnSubnetRouteTableAssociation(this, 'privateContainerRouteTableAssociation1a', {
      routeTableId: privateContainerRouteTable.ref,
      subnetId: privateContainerSubnet1a.ref,
    });

    const privateContainerRouteTableAssociation1c = new CfnSubnetRouteTableAssociation(this, 'privateContainerRouteTableAssociation1c', {
      routeTableId: privateContainerRouteTable.ref,
      subnetId: privateContainerSubnet1c.ref,
    });

    // DBまわりのサブネット、ルートテーブル
    const privateDbSubnet1a = new CfnSubnet(this, 'privateDbSubnet1a', {
      cidrBlock: '10.0.16.0/24',
      vpcId: vpc.ref,
      availabilityZone: apne1a,
      mapPublicIpOnLaunch: false,
      tags: [
        { key: 'Name', value: 'sbcntr-subnet-private-db-1a'},
        { key: 'Type', value: 'Isolated'},
      ],
    });

    const privateDbSubnet1c = new CfnSubnet(this, 'privateDbSubnet1c', {
      cidrBlock: '10.0.17.0/24',
      vpcId: vpc.ref,
      availabilityZone: apne1c,
      mapPublicIpOnLaunch: false,
      tags: [
        { key: 'Name', value: 'sbcntr-subnet-private-db-1c'},
        { key: 'Type', value: 'Isolated'},
      ],
    });

    const privateDbRouteTable = new CfnRouteTable(this, 'privateDbRouteTable', {
      vpcId: vpc.ref,
      tags: [
        { key: 'Name', value: 'sbcntr-route-db' },
      ]
    });

    const privateDbRouteTableAssociation1a = new CfnSubnetRouteTableAssociation(this, 'privateDbRouteTableAssociation1a', {
      routeTableId: privateDbRouteTable.ref,
      subnetId: privateDbSubnet1a.ref,
    });

    const privateDbRouteTableAssociation1c = new CfnSubnetRouteTableAssociation(this, 'privateDbRouteTableAssociation1c', {
      routeTableId: privateDbRouteTable.ref,
      subnetId: privateDbSubnet1c.ref,
    });

    // Ingressまわりのサブネット、ルートテーブル
    const publicIngressSubnet1a = new CfnSubnet(this, 'publicIngressSubnet1a', {
      cidrBlock: '10.0.0.0/24',
      vpcId: vpc.ref,
      availabilityZone: apne1a,
      mapPublicIpOnLaunch: true,
      tags: [
        { key: 'Name', value: 'sbcntr-subnet-public-ingress-1a'},
        { key: 'Type', value: 'Public'},
      ],
    });

    const publicIngressSubnet1c = new CfnSubnet(this, 'publicIngressSubnet1c', {
      cidrBlock: '10.0.1.0/24',
      vpcId: vpc.ref,
      availabilityZone: apne1c,
      mapPublicIpOnLaunch: true,
      tags: [
        { key: 'Name', value: 'sbcntr-subnet-public-ingress-1c'},
        { key: 'Type', value: 'Public'},
      ],
    });

    const publicIngressRouteTable = new CfnRouteTable(this, 'publicIngressRouteTable', {
      vpcId: vpc.ref,
      tags: [
        { key: 'Name', value: 'sbcntr-route-ingress' },
      ]
    });

    const publicIngressRouteTableAssociation1a = new CfnSubnetRouteTableAssociation(this, 'publicIngressRouteTableAssociation1a', {
      routeTableId: publicIngressRouteTable.ref,
      subnetId: publicIngressSubnet1a.ref,
    });

    const publicIngressRouteTableAssociation1c = new CfnSubnetRouteTableAssociation(this, 'publicIngressRouteTableAssociation1c', {
      routeTableId: publicIngressRouteTable.ref,
      subnetId: publicIngressSubnet1c.ref,
    });

    const publicIngressDefaultRoute = new CfnRoute(this, 'publicIngressDefaultRoute', {
      routeTableId: publicIngressRouteTable.ref,
      destinationCidrBlock: defaultRouteDestinationCidrBlock,
      gatewayId: igw.ref,
    });
    publicIngressDefaultRoute.addDependency(vpcGatewayAttachment);

    // 管理用サーバ周りのサブネット、ルートテーブル
    const publicManagementSubnet1a = new CfnSubnet(this, 'publicManagementSubnet1a', {
      cidrBlock: '10.0.240.0/24',
      vpcId: vpc.ref,
      availabilityZone: apne1a,
      mapPublicIpOnLaunch: true,
      tags: [
        { key: 'Name', value: 'sbcntr-subnet-public-management-1a'},
        { key: 'Type', value: 'Public'},
      ],
    });

    const publicManagementSubnet1c = new CfnSubnet(this, 'publicManagementSubnet1c', {
      cidrBlock: '10.0.241.0/24',
      vpcId: vpc.ref,
      availabilityZone: apne1c,
      mapPublicIpOnLaunch: true,
      tags: [
        { key: 'Name', value: 'sbcntr-subnet-public-management-1c'},
        { key: 'Type', value: 'Public'},
      ],
    });

    const publicManagementRouteTableAssociation1a = new CfnSubnetRouteTableAssociation(this, 'publicManagementRouteTableAssociation1a', {
      routeTableId: publicIngressRouteTable.ref,
      subnetId: publicManagementSubnet1a.ref,
    });

    const publicManagementRouteTableAssociation1c = new CfnSubnetRouteTableAssociation(this, 'publicManagementRouteTableAssociation1c', {
      routeTableId: publicIngressRouteTable.ref,
      subnetId: publicManagementSubnet1c.ref,
    });
  }
}
