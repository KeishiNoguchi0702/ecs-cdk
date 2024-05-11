#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/stacks/vpc';
import { SecurityGroupStack } from '../lib/stacks/securityGroups';

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'ap-northeast-1',
}

const app = new cdk.App();
new VpcStack(app, 'VpcStack', {});
new SecurityGroupStack(app, 'SecurityGroupStack', { env: env });
