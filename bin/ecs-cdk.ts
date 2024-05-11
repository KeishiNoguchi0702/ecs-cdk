#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/stacks/vpc';

const app = new cdk.App();
new VpcStack(app, 'VpcStack', {});
