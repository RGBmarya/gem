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


load_dotenv()

chroma_client = chromadb.HttpClient(host="localhost", port=8000)
chroma_collection = chroma_client.get_or_create_collection("gem")
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")


def ingest(client, collection, collection_name, embedding_function):
    loader = TextLoader("./data.txt")
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    ids = [str(i + 1) for i in range(len(splits))]
    documents = [doc.page_content for doc in splits]
    metadatas = [doc.metadata for doc in splits]
    collection.add(ids=ids, documents=documents, metadatas=metadatas)

    return Chroma(
        client=client,
        collection_name=collection_name,
        embedding_function=embedding_function
    )

# vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())
vectorstore = ingest(
    client=chroma_client,
    collection=chroma_collection,
    collection_name="gem",
    embedding_function=embedding_function
)

retriever = vectorstore.as_retriever()

llm = ChatOpenAI(streaming=True, temperature=0, openai_api_key=os.getenv("OPENAI_API_KEY"))

memory_key = "history"

memory = AgentTokenBufferMemory(memory_key=memory_key, llm=llm)

region = "Mumbai"
system_message = f"""
ChatGPT, for this session, you will take on the role of a local resident from {region}. 
In this role, you are expected to respond with the perspective, knowledge, and cultural understanding of someone who 
has lived in {region} for many years. You should incorporate local knowledge, colloquial language, 
and cultural insights relevant to {region} into your responses. This includes knowledge about local 
landmarks, traditions, lifestyle, cuisine, and any common local expressions or phrases. 
Make sure to incorporate information from the tool 'search_user_submitted_travel_experience' into your responses."
Your responses should reflect a general, community-level understanding characteristic of a long-term 
inhabitant of {region}. 

If the question is '<S>', you should open with a greeting to the user, asking them what they would like to know. 
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

user_input = "<S>"
while True:
    for chunk in rag_chain.stream(user_input):
        print(chunk, end="", flush=True)
    print()
    user_input=input()
