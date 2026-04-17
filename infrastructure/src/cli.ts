#!/usr/bin/env node
import { Command } from "commander";
import * as aws from "./client.js";

const program = new Command();

program
  .name("aws-infra")
  .description("AWS Infrastructure Management CLI")
  .version("1.0.0");

// Status command
program
  .command("status")
  .description("Check AWS connection status")
  .action(async () => {
    console.log("🔍 Checking AWS connection status...\n");
    const result = await aws.checkStatus();
    console.log("AWS Infrastructure Status:");
    console.log("─".repeat(40));
    Object.entries(result).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  });

// ============ S3 Commands ============
const s3 = program.command("s3").description("S3 bucket operations");

s3.command("list")
  .description("List all S3 buckets")
  .action(async () => {
    console.log("🪣 Listing S3 buckets...\n");
    const result = await aws.listBuckets();
    if (result.success && result.data) {
      if (result.data.length === 0) {
        console.log("No buckets found.");
      } else {
        console.log("Buckets:");
        result.data.forEach((bucket) => {
          console.log(`  📦 ${bucket.Name} (created: ${bucket.CreationDate?.toLocaleDateString()})`);
        });
      }
    } else {
      console.error("❌ Error:", result.error);
    }
  });

s3.command("create <name>")
  .description("Create a new S3 bucket")
  .action(async (name: string) => {
    console.log(`🪣 Creating bucket: ${name}...\n`);
    const result = await aws.createBucket(name);
    if (result.success) {
      console.log("✅", result.message);
    } else {
      console.error("❌ Error:", result.error);
    }
  });

s3.command("delete <name>")
  .description("Delete an S3 bucket")
  .action(async (name: string) => {
    console.log(`🗑️  Deleting bucket: ${name}...\n`);
    const result = await aws.deleteBucket(name);
    if (result.success) {
      console.log("✅", result.message);
    } else {
      console.error("❌ Error:", result.error);
    }
  });

s3.command("contents <bucket>")
  .description("List bucket contents")
  .option("-p, --prefix <prefix>", "Filter by prefix")
  .action(async (bucket: string, options: { prefix?: string }) => {
    console.log(`📂 Listing contents of: ${bucket}...\n`);
    const result = await aws.listBucketContents(bucket, options.prefix);
    if (result.success && result.data) {
      if (result.data.length === 0) {
        console.log("Bucket is empty.");
      } else {
        console.log("Contents:");
        result.data.forEach((obj) => {
          const size = obj.Size ? `${(obj.Size / 1024).toFixed(2)} KB` : "0 KB";
          console.log(`  📄 ${obj.Key} (${size})`);
        });
      }
    } else {
      console.error("❌ Error:", result.error);
    }
  });

// ============ EC2 Commands ============
const ec2 = program.command("ec2").description("EC2 instance operations");

ec2.command("list")
  .description("List all EC2 instances")
  .action(async () => {
    console.log("🖥️  Listing EC2 instances...\n");
    const result = await aws.listInstances();
    if (result.success && result.data) {
      if (result.data.length === 0) {
        console.log("No instances found.");
      } else {
        console.log("Instances:");
        result.data.forEach((instance) => {
          const status = instance?.state === "running" ? "🟢" : "🔴";
          console.log(`  ${status} ${instance?.instanceId} - ${instance?.name || "unnamed"}`);
          console.log(`      Type: ${instance?.type}, State: ${instance?.state}`);
          if (instance?.publicIp) console.log(`      Public IP: ${instance.publicIp}`);
        });
      }
    } else {
      console.error("❌ Error:", result.error);
    }
  });

ec2.command("start <instanceId>")
  .description("Start an EC2 instance")
  .action(async (instanceId: string) => {
    console.log(`▶️  Starting instance: ${instanceId}...\n`);
    const result = await aws.startInstance(instanceId);
    if (result.success) {
      console.log("✅", result.message);
    } else {
      console.error("❌ Error:", result.error);
    }
  });

ec2.command("stop <instanceId>")
  .description("Stop an EC2 instance")
  .action(async (instanceId: string) => {
    console.log(`⏹️  Stopping instance: ${instanceId}...\n`);
    const result = await aws.stopInstance(instanceId);
    if (result.success) {
      console.log("✅", result.message);
    } else {
      console.error("❌ Error:", result.error);
    }
  });

// ============ ECS Commands ============
const ecs = program.command("ecs").description("ECS container operations");

ecs.command("clusters")
  .description("List all ECS clusters")
  .action(async () => {
    console.log("🐳 Listing ECS clusters...\n");
    const result = await aws.listClusters();
    if (result.success && result.data) {
      if (result.data.length === 0) {
        console.log("No clusters found.");
      } else {
        console.log("Clusters:");
        result.data.forEach((arn) => {
          console.log(`  📦 ${arn}`);
        });
      }
    } else {
      console.error("❌ Error:", result.error);
    }
  });

ecs.command("services <clusterArn>")
  .description("List services in a cluster")
  .action(async (clusterArn: string) => {
    console.log(`🐳 Listing services in cluster...\n`);
    const result = await aws.listServices(clusterArn);
    if (result.success && result.data) {
      if (result.data.length === 0) {
        console.log("No services found.");
      } else {
        console.log("Services:");
        result.data.forEach((arn) => {
          console.log(`  ⚙️ ${arn}`);
        });
      }
    } else {
      console.error("❌ Error:", result.error);
    }
  });

ecs.command("tasks <clusterArn>")
  .description("List tasks in a cluster")
  .action(async (clusterArn: string) => {
    console.log(`🐳 Listing tasks in cluster...\n`);
    const result = await aws.listTasks(clusterArn);
    if (result.success && result.data) {
      if (result.data.length === 0) {
        console.log("No tasks found.");
      } else {
        console.log("Tasks:");
        result.data.forEach((arn) => {
          console.log(`  🔄 ${arn}`);
        });
      }
    } else {
      console.error("❌ Error:", result.error);
    }
  });

// ============ Lambda Commands ============
const lambda = program.command("lambda").description("Lambda function operations");

lambda.command("list")
  .description("List all Lambda functions")
  .action(async () => {
    console.log("⚡ Listing Lambda functions...\n");
    const result = await aws.listFunctions();
    if (result.success && result.data) {
      if (result.data.length === 0) {
        console.log("No functions found.");
      } else {
        console.log("Functions:");
        result.data.forEach((fn) => {
          console.log(`  ⚡ ${fn.name}`);
          console.log(`      Runtime: ${fn.runtime}, Memory: ${fn.memory}MB, Timeout: ${fn.timeout}s`);
        });
      }
    } else {
      console.error("❌ Error:", result.error);
    }
  });

lambda.command("invoke <functionName>")
  .description("Invoke a Lambda function")
  .option("-p, --payload <payload>", "JSON payload")
  .action(async (functionName: string, options: { payload?: string }) => {
    console.log(`⚡ Invoking function: ${functionName}...\n`);
    const payload = options.payload ? JSON.parse(options.payload) : undefined;
    const result = await aws.invokeFunction(functionName, payload);
    if (result.success) {
      console.log("✅ Function invoked successfully");
      console.log("Response:", JSON.stringify(result.data, null, 2));
    } else {
      console.error("❌ Error:", result.error);
    }
  });

program.parse();
