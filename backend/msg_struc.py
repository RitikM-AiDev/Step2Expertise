from pydantic import BaseModel
from typing import List
from datetime import datetime

class Message(BaseModel):
    id: str
    text: str
    sender: str
    timestamp: datetime
class chatMessage(BaseModel):
        chatmsg : List[Message]
class RegisterDetail(BaseModel):
    email : str
    password : str
class OtpVerify(BaseModel):
    email : str
    input_otp : str
class Logindetails(BaseModel):
    email : str
    password : str