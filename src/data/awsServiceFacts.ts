export interface AWSServiceFact {
  service: string;
  icon: string;
  fact: string;
  category: string;
  launchYear: number;
}

export const AWS_SERVICE_FACTS: Record<string, AWSServiceFact> = {
  LAMBDA: {
    service: "AWS Lambda",
    icon: "⚡",
    fact: "AWS Lambda can automatically scale from zero to thousands of concurrent executions in seconds. It supports over 15 programming languages and can process up to 1,000 concurrent executions per region by default!",
    category: "Serverless Compute",
    launchYear: 2014
  },
  S3: {
    service: "Amazon S3",
    icon: "🪣",
    fact: "Amazon S3 stores over 100 trillion objects and regularly peaks at 20+ million requests per second! It's designed for 99.999999999% (11 9's) durability, meaning if you store 10 million objects, you can expect to lose one every 10,000 years.",
    category: "Object Storage",
    launchYear: 2006
  },
  API_GATEWAY: {
    service: "Amazon API Gateway",
    icon: "🚪",
    fact: "API Gateway can handle millions of concurrent API calls and automatically scales to meet demand. It supports WebSocket APIs for real-time communication and can cache responses to reduce latency by up to 90%!",
    category: "API Management",
    launchYear: 2015
  },
  DYNAMODB: {
    service: "Amazon DynamoDB",
    icon: "🗄️",
    fact: "DynamoDB can handle more than 10 trillion requests per day and support peaks of more than 20 million requests per second! It provides single-digit millisecond latency at any scale and automatically spreads data across multiple servers.",
    category: "NoSQL Database",
    launchYear: 2012
  },
  CLOUDFORMATION: {
    service: "AWS CloudFormation",
    icon: "📋",
    fact: "CloudFormation can manage infrastructure across 200+ AWS services and has processed over 1 billion stack operations! It supports rollback on failure and can create identical environments in minutes using Infrastructure as Code.",
    category: "Infrastructure as Code",
    launchYear: 2011
  },
  EC2: {
    service: "Amazon EC2",
    icon: "💻",
    fact: "Amazon EC2 was one of the first AWS services and revolutionized cloud computing! It offers over 500 instance types, can scale from 1 to thousands of instances in minutes, and powers some of the world's largest applications including Netflix and Airbnb.",
    category: "Virtual Servers",
    launchYear: 2006
  },
  CLOUDWATCH: {
    service: "Amazon CloudWatch",
    icon: "📊",
    fact: "CloudWatch collects over 1 billion metrics per day and can store metrics for up to 15 months! It can monitor everything from CPU usage to custom business metrics and automatically trigger actions based on thresholds.",
    category: "Monitoring & Observability",
    launchYear: 2009
  }
};

export function getRandomServiceFact(serviceType: keyof typeof AWS_SERVICE_FACTS): AWSServiceFact {
  return AWS_SERVICE_FACTS[serviceType];
}

export function getAllServiceFacts(): AWSServiceFact[] {
  return Object.values(AWS_SERVICE_FACTS);
}
