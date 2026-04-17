import "dotenv/config";
import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import {
  EC2Client,
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
} from "@aws-sdk/client-ec2";
import {
  ECSClient,
  ListClustersCommand,
  ListServicesCommand,
  ListTasksCommand,
  DescribeTasksCommand,
  StopTaskCommand,
} from "@aws-sdk/client-ecs";
import {
  LambdaClient,
  ListFunctionsCommand,
  InvokeCommand,
} from "@aws-sdk/client-lambda";

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  throw new Error("Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY in .env file");
}

const credentials = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
};

// Initialize AWS clients
export const s3Client = new S3Client({ region: AWS_REGION, credentials });
export const ec2Client = new EC2Client({ region: AWS_REGION, credentials });
export const ecsClient = new ECSClient({ region: AWS_REGION, credentials });
export const lambdaClient = new LambdaClient({ region: AWS_REGION, credentials });

// ============ S3 Operations ============

export async function listBuckets() {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    return { success: true, data: response.Buckets };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createBucket(bucketName: string) {
  try {
    const command = new CreateBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    return { success: true, message: `Bucket '${bucketName}' created successfully` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteBucket(bucketName: string) {
  try {
    const command = new DeleteBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    return { success: true, message: `Bucket '${bucketName}' deleted successfully` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function listBucketContents(bucketName: string, prefix?: string) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });
    const response = await s3Client.send(command);
    return { success: true, data: response.Contents };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function uploadFile(bucketName: string, key: string, body: Buffer | string) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
    });
    await s3Client.send(command);
    return { success: true, message: `File '${key}' uploaded to '${bucketName}'` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteFile(bucketName: string, key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3Client.send(command);
    return { success: true, message: `File '${key}' deleted from '${bucketName}'` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============ EC2 Operations ============

export async function listInstances() {
  try {
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);
    const instances = response.Reservations?.flatMap((r) =>
      r.Instances?.map((i) => ({
        instanceId: i.InstanceId,
        state: i.State?.Name,
        type: i.InstanceType,
        publicIp: i.PublicIpAddress,
        privateIp: i.PrivateIpAddress,
        name: i.Tags?.find((t) => t.Key === "Name")?.Value,
      }))
    );
    return { success: true, data: instances };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function startInstance(instanceId: string) {
  try {
    const command = new StartInstancesCommand({ InstanceIds: [instanceId] });
    await ec2Client.send(command);
    return { success: true, message: `Instance '${instanceId}' starting` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function stopInstance(instanceId: string) {
  try {
    const command = new StopInstancesCommand({ InstanceIds: [instanceId] });
    await ec2Client.send(command);
    return { success: true, message: `Instance '${instanceId}' stopping` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============ ECS Operations ============

export async function listClusters() {
  try {
    const command = new ListClustersCommand({});
    const response = await ecsClient.send(command);
    return { success: true, data: response.clusterArns };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function listServices(clusterArn: string) {
  try {
    const command = new ListServicesCommand({ cluster: clusterArn });
    const response = await ecsClient.send(command);
    return { success: true, data: response.serviceArns };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function listTasks(clusterArn: string) {
  try {
    const command = new ListTasksCommand({ cluster: clusterArn });
    const response = await ecsClient.send(command);
    return { success: true, data: response.taskArns };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function stopTask(clusterArn: string, taskArn: string) {
  try {
    const command = new StopTaskCommand({ cluster: clusterArn, task: taskArn });
    await ecsClient.send(command);
    return { success: true, message: `Task '${taskArn}' stopped` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============ Lambda Operations ============

export async function listFunctions() {
  try {
    const command = new ListFunctionsCommand({});
    const response = await lambdaClient.send(command);
    const functions = response.Functions?.map((f) => ({
      name: f.FunctionName,
      runtime: f.Runtime,
      memory: f.MemorySize,
      timeout: f.Timeout,
      lastModified: f.LastModified,
    }));
    return { success: true, data: functions };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function invokeFunction(functionName: string, payload?: unknown) {
  try {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: payload ? Buffer.from(JSON.stringify(payload)) : undefined,
    });
    const response = await lambdaClient.send(command);
    const result = response.Payload
      ? JSON.parse(Buffer.from(response.Payload).toString())
      : null;
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============ Status Check ============

export async function checkStatus() {
  const results: Record<string, unknown> = {
    region: AWS_REGION,
    timestamp: new Date().toISOString(),
  };

  // Test S3
  try {
    await s3Client.send(new ListBucketsCommand({}));
    results.s3 = "✅ Connected";
  } catch {
    results.s3 = "❌ Failed";
  }

  // Test EC2
  try {
    await ec2Client.send(new DescribeInstancesCommand({ MaxResults: 5 }));
    results.ec2 = "✅ Connected";
  } catch {
    results.ec2 = "❌ Failed";
  }

  // Test Lambda
  try {
    await lambdaClient.send(new ListFunctionsCommand({ MaxItems: 5 }));
    results.lambda = "✅ Connected";
  } catch {
    results.lambda = "❌ Failed";
  }

  return results;
}
