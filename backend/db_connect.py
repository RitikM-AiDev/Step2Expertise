from motor.motor_asyncio import AsyncIOMotorClient
import os
mongo_url = 'mongodb+srv://ritikaidev_db_user:Ritikaidev2007@v-gram.c03owqx.mongodb.net/V-GRAM?retryWrites=true&w=majority'

client = AsyncIOMotorClient(mongo_url)
db = client["Step2Expertise"]