from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
from dotenv import load_dotenv
from boto3.dynamodb.conditions import Key

# 1. Load AWS Credentials from .env file
load_dotenv()

app = FastAPI()

# 2. Enable CORS (Allows your React frontend to talk to this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Connect to DynamoDB
dynamodb = boto3.resource(
    'dynamodb',
    region_name=os.getenv('AWS_REGION'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)
table = dynamodb.Table('ComplianceFindings')

@app.get("/")
def root():
    return {"message": "Cloud Auditor Backend is Running!"}

@app.get("/findings")
def get_findings():
    try:
        # Scan the table to get all findings
        response = table.scan()
        items = response.get('Items', [])
        
        # Sort them: Critical first, then High, Medium, Low
        severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
        items.sort(key=lambda x: severity_order.get(x.get('Severity', 'Low'), 4))
        
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_stats():
    try:
        response = table.scan()
        items = response.get('Items', [])
        
        # Calculate summary statistics
        total = len(items)
        high = len([i for i in items if i['Severity'] == 'High'])
        medium = len([i for i in items if i['Severity'] == 'Medium'])
        critical = len([i for i in items if i['Severity'] == 'Critical'])
        
        return {
            "total_findings": total,
            "critical": critical,
            "high": high,
            "medium": medium
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))