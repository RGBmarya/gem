import uuid
from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
import utils

app = FastAPI()


class Message(BaseModel):
    author: dict[str, str]
    createdAt: int
    id: str
    text: str
    type: str
    
@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/system/query/{location}")
async def query(location: str, user_message: Message):
    system_text = utils.query(location=location, user_input=user_message.text)
    system_message = Message(
        author={"id": "system"},
        createdAt=int(datetime.timestamp(datetime.now()) * 1000),
        id=str(uuid.uuid4()),
        text=system_text,
        type="text"
    )
    print(system_message)
    return system_message