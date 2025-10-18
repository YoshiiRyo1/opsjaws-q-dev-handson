import { Construct } from 'constructs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';

export class LogStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Disable rollback on failure
        const cfnStack = this.node.defaultChild as any;
        if (cfnStack) {
            cfnStack.cfnOptions = cfnStack.cfnOptions || {};
            cfnStack.cfnOptions.disableRollback = true;
        }
    }

    public createLogGroup(serviceName: string) {
        return new LogGroup(this, `${serviceName}-log-group`, {
            logGroupName: `/ecs/${serviceName}`,
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }
}
