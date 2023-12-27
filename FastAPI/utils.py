import os
import chromadb
from langchain.document_loaders import TextLoader
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma

from langchain.embeddings import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.agents.openai_functions_agent.agent_token_buffer_memory import AgentTokenBufferMemory
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain.schema import StrOutputParser
from chromadb.utils import embedding_functions
from dotenv import load_dotenv
import typing
import uuid

load_dotenv()

# Spin up server 
chroma_client = chromadb.HttpClient(host="localhost", port=8000)
# chroma_client.delete_collection("gem")
chroma_collection = chroma_client.get_or_create_collection("gem")
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

# Constants
vectorstore = Chroma(
        client=chroma_client,
        collection_name="gem",
        embedding_function=embedding_function
)

retriever = vectorstore.as_retriever()
llm = ChatOpenAI(streaming=True, temperature=0, openai_api_key=os.getenv("OPENAI_API_KEY"))
memory_key = "history"
memory = AgentTokenBufferMemory(memory_key=memory_key, llm=llm)

# Document ids
id_start = 0
def ingest_message(location, message, question, collection = chroma_collection):
    global id_start
    print("Location:", location)
    print("Message:", message)
    print("Question:", question)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_text(message)
    ids = [str(uuid.uuid4()) for i in range(len(splits))]
    documents = [chunk for chunk in splits]
    metadatas = [{"location": location, "question": question} for chunk in splits]
    print(ids, documents, metadatas)
    collection.add(ids=ids, documents=documents, metadatas=metadatas)
    return collection.count()

def ingest_file(collection):
    global id_start
    loader = TextLoader("./data.txt")
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    ids = [str(i + 1) for i in range(id_start, id_start + len(splits))]
    id_start += len(ids)
    documents = [doc.page_content for doc in splits]
    metadatas = [doc.metadata for doc in splits]
    collection.add(ids=ids, documents=documents, metadatas=metadatas)

# Ingest data
# ingest_file(collection=chroma_collection)

def generate_question(location: str, question: str):
    return f"What is {location} like?"

def inquire(location: str, question: str, user_input: str = "<S>"):
    print("Inquire")
    system_message = f"""
    ChatGPT, for this session, you will take on the role of an inquisitive traveler interested in visiting {location}. 
    As a traveler, you are curious about the experiences and insights of people who have been to {location}. The user is one of these people.
    You are interested in answers to the question "{question}".

    Ask the user the question in order to help you better understand {location}. You may reword the question to make it more natural.
    
    If the user's question is '<S>', you should open with a greeting to the user and ask them the question. 
    Do not include '<S>' in your response.
    Once the user is done answering the question, you should end the conversation by thanking the user for their time and wishing them well.
    You must output '<E>' to signal the end of the conversation.
    """

    template = system_message + """
                {context}

                Question: {question}
                Helpful Answer:
                """

    rag_prompt = PromptTemplate.from_template(template)
    rag_chain = (
        {"context" : retriever, "question" : RunnablePassthrough()}
        | rag_prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain.invoke(user_input)

def query(location: str, user_input: str = "<S>"):
    system_message = f"""
    ChatGPT, for this session, you will take on the role of a local resident from {location}. 
    In this role, you are expected to respond with the information relevant to {location}
    from 'retriever' vectorstore in your responses. If information from the retriever conflicts with your general knowledge, 
    prioritize information from the retriever.
    You should incorporate local knowledge, colloquial language, 
    and cultural insights relevant to {location} into your responses. This includes knowledge about local 
    landmarks, traditions, lifestyle, cuisine, and any common local expressions or phrases. 
    
    Your responses should reflect a general, community-level understanding characteristic of a long-term 
    inhabitant of {location}.
    """

    template = system_message + """
                {context}

                Question: {question}
                Helpful Answer:
                """

    rag_prompt = PromptTemplate.from_template(template)
    rag_chain = (
        {"context" : retriever, "question" : RunnablePassthrough()}
        | rag_prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain.invoke(user_input)
    # while True:
    #     for chunk in rag_chain.stream(user_input):
    #         print(chunk, end="", flush=True)
    #     print()
    #     user_input=input()

    # for chunk in rag_chain.stream(user_input):
    #     yield chunk

# query()