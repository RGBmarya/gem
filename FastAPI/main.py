import uuid
from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
import utils
from fastapi.responses import StreamingResponse

app = FastAPI()


class Message(BaseModel):
    author: dict[str, str]
    createdAt: int
    id: str
    text: str
    type: str

# Currently unused - for future use
@app.get("/system/question/{location}")
def get_question(location: str, question: str):
    return utils.generate_question(location=location, question=question)


@app.post("/system/ingest/{location}")
async def ingest_message(location: str, question: str, user_message: Message):
    response = utils.ingest_message(location=location, question=question, message=user_message.text)
    return response


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