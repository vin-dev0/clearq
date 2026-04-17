# AWS Infrastructure Management Tools

⚠️ **PRODUCTION USE ONLY** - This tooling is completely separate from the main TicketSystem application.

## Setup

```bash
cd infrastructure
npm install
```

## Configuration

The `.env` file contains your API credentials. **Never commit this file.**

## Usage

### Check API Status
```bash
npm run status
```

### S3 Bucket Operations
```bash
# List all buckets
npm run s3:list

# Create a bucket
npx tsx src/cli.ts s3 create my-bucket-name --region us-east-1

# Delete a bucket
npx tsx src/cli.ts s3 delete my-bucket-name

# List bucket contents
npx tsx src/cli.ts s3 contents my-bucket-name --prefix uploads/
```

### Container Operations
```bash
# List all containers
npm run containers:list

# Create a container
npx tsx src/cli.ts containers create my-app nginx:latest --cpu 256 --memory 512

# Start/Stop containers
npx tsx src/cli.ts containers start <container-id>
npx tsx src/cli.ts containers stop <container-id>

# View logs
npx tsx src/cli.ts containers logs <container-id>

# Delete container
npx tsx src/cli.ts containers delete <container-id>
```

### EC2 Instance Operations
```bash
# List instances
npx tsx src/cli.ts ec2 list

# Start/Stop instances
npx tsx src/cli.ts ec2 start <instance-id>
npx tsx src/cli.ts ec2 stop <instance-id>
```

### Lambda Functions
```bash
# List functions
npx tsx src/cli.ts lambda list

# Invoke a function
npx tsx src/cli.ts lambda invoke my-function --payload '{"key": "value"}'
```

### View All Resources
```bash
npm run resources
```

## CLI Help

```bash
npx tsx src/cli.ts --help
npx tsx src/cli.ts s3 --help
npx tsx src/cli.ts containers --help
```

## Security Notes

- The `.env` file is gitignored and should NEVER be committed
- Admin key has full access - keep it secure
- This folder has no connection to the main TicketSystem app

