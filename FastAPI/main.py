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


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/system/query")
async def query(user_message: Message):
    system_text = utils.query(user_input=user_message.text)
    system_message = Message(
        author={"id": "system"},
        createdAt=int(datetime.timestamp(datetime.now()) * 1000),
        id=str(uuid.uuid4()),
        text=system_text,
        type="text"
    )
    print(system_message)
    return system_message