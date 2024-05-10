import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { projectConstants } from '../constants/project-constants';

const projectName: string = projectConstants.projectName;
const vpcName: string = projectConstants.vpcName;

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
}
