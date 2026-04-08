from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from msg_struc import chatMessage, Message,RegisterDetail,OtpVerify,Logindetails
from fastapi.middleware.cors import CORSMiddleware
import smtplib
import bcrypt
from pymongo.errors import DuplicateKeyError
from db_connect import db
from fastapi import HTTPException
import time
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import secrets
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()

origins = [
 "http://localhost:5173",
 "http://10.45.74.11:5173"

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"],        
)
@app.on_event("startup")
async def started():
    await db.User.create_index("email",unique=True)
    await db.otpStore.create_index("email",unique=True)
    return {
        "message" : "app started"
    }
@app.get("/api")
def root():
    return {
        "message" : "server started"
    }

@app.post("/api/chat")
def getchat(chatList : chatMessage):
    messages = chatList.chatmsg
    user_current_msg = messages[-1].text
    history = messages
    return {
        "message" : user_current_msg,
        "aimessage" : "ai-message"
    }

from jose import jwt
from datetime import timedelta,datetime 
SECRET= "secret"
ALGO = "HS256"

def create_jwt_token(email):
    payload = {
        "sub" : email,
        "exp" : datetime.utcnow() + timedelta(seconds=1*365*24*60*60)
    }
    return jwt.encode(payload,SECRET,algorithm=ALGO)

def generateOtp():
    return str(secrets.randbelow(900000)+100000)



@app.post("/api/otp/generate")
async def otpgenerate(details: RegisterDetail):
    sender_email= os.getenv("SENDER_EMAIL")
    sender_pass = os.getenv("SENDER_PASS")
    otp = generateOtp()
    hashed_otp = bcrypt.hashpw(otp.encode(),bcrypt.gensalt())
    register_password = bcrypt.hashpw(details.password.encode(), bcrypt.gensalt())
    await db.otpStore.update_one(
        {"email" : details.email},
        {
           "$set" : {
            "otp" : hashed_otp,
            "password" : register_password,
            "expires_at" : time.time()  +600,
            "attempts" : 0
        }
        },
         upsert=True
         )
    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 50px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 30px; text-align: center;">
        <h2 style="color: #333333;">Account Verification</h2>
        <p style="color: #555555; font-size: 16px;">Dear User,</p>
        <p style="color: #555555; font-size: 16px;">Thank you for registering. Please use the following One-Time Password (OTP) to verify your account:</p>
        <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0;">{otp}</p>
        <p style="color: #555555; font-size: 16px;">This OTP is valid for the next 10 minutes. Do not share it with anyone.</p>
        <p style="color: #555555; font-size: 16px;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="color: #999999; font-size: 12px;">&copy; 2026 Your Company. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    msg = MIMEMultipart()
    msg["Subject"] = "Your One-Time Password (OTP) for Account Verification"
    msg["From"] =sender_email
    msg["To"] = details.email
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP('smtp.gmail.com',587) as server:
            server.starttls()
            server.login(sender_email , sender_pass)
            server.send_message(msg)
            print("email sent sucessful")
    except Exception as e:
        return {
            "error" : str(e)
        }

    return {
        "message" : "otp recieved"
    }

@app.post("/api/otp/verify")
async def otp_verify(data : OtpVerify):
    db_data  = await db.otpStore.find_one(
        {"email" : data.email},
    )
    if db_data:
        current_time = db_data["expires_at"]
        attempt_old = db_data["attempts"] 
        if time.time() > current_time:
            await db.otpStore.delete_one({"email" : data.email})
            raise HTTPException(
                    status_code=400,
                    detail="Your Time has been expired Try again Later"
                )
        if attempt_old >= 3:
                await db.otpStore.delete_one({"email" : data.email})
                raise HTTPException(
                    status_code=400,
                    detail="User Exceeded Limit So Try Again After Some Time !!"
                )
        else:
                attempt_new = attempt_old + 1
                user_otp = data.input_otp.encode()
                db_otp =  db_data["otp"]
                result = bcrypt.checkpw(user_otp,db_otp)
                if result:
                    try:
                        await db.User.insert_one({
                            "email" : data.email,
                            "password" : db_data["password"]
                        })
                    except DuplicateKeyError:
                        raise HTTPException(
                            status_code=400,
                            detail="User already exists"
                        )
                    await db.otpStore.delete_one({"email" : data.email})
                    return {
                        "message" : "Success"
                    }
                   
                else:
                    await db.otpStore.update_one(
                        {"email" : data.email},
                        {
                            "$set" : {
                                "attempts" : attempt_new
                            }
                        }
                        )
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid OTP"
                    )
    
    else:
                raise HTTPException(
                status_code=404,
                detail = "Invalid Email or password"
                 )

from fastapi import Response

def verify_token(token : str):
    try:
        payload = jwt.decode(token,SECRET,algorithms=[ALGO])
        return payload.get("sub")
    except Exception as e:
        return None
@app.post("/api/login")
async def login_function(response : Response,data : Logindetails):
        email = data.email
        user = await db.User.find_one({"email" : email})
        if user:
                db_password = user["password"]
                user_password = data.password
                result = bcrypt.checkpw(user_password.encode(),db_password)
                if result:
                    token = create_jwt_token(data.email)
                    response.set_cookie(
                        key="access_token",
                        path="/",
                        value=token,
                        httponly=True,
                        max_age=10*365*24*60*60,
                        expires=10*365*24*60*60,
                        samesite="lax",
                        secure=False
                    )
                    return {
                        "message" : "Sucessful Login",
                        "token" : token,
                        "status" : 200
                    }
                else:
                   raise HTTPException (
                        detail="Invalid email or password",
                         status_code= 400
                    )
        else:
           raise HTTPException (
                        detail="Invalid email or password",
                         status_code= 400
                    )

from fastapi import Request
@app.get("/api/check-auth")
def check_auth(request : Request):
    token = request.cookies.get("access_token")
    if not token:
        print("no token")
        return {
            "authenticated" : False
        }
    else:
        user = verify_token(token)
        if not user:
            print("user not found")
            raise HTTPException(
                status_code=400,
                detail="User Session Expired please login again",
            )
        print(token)
        return {
            "authenticated" : True,
            "user" : user
        }

@app.post("/api/logout")
def logout(response : Response):
    print("logout called")
    response.set_cookie(
        key="access_token",
        path="/",
        value="",
        httponly=True,
        max_age=0,
        expires=0,
        samesite="lax",
        secure=False
                    )
    return {
        "removed" : True
    }
    