import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { projectConstants } from '../constants/project-constants';
import {
  aws_ec2 as ec2,
  aws_ssm as ssm,
} from 'aws-cdk-lib';

const projectName: string = projectConstants.projectName;
const vpcName: string = projectConstants.vpc.vpcName;
const vpcCidr: string = projectConstants.vpc.cidr;

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, vpcName, {
      vpcName: vpcName,
      ipAddresses: ec2.IpAddresses.cidr(vpcCidr),
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: `${projectName}-public-subnet`,
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: `${projectName}-private-subnet`,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        }
      ]
    });

    new ssm.StringParameter(this, 'vpc-id', {
      parameterName: `/${projectName}/vpc-id`,
      stringValue: vpc.vpcId,
    });
  }
}
