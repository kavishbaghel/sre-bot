FROM python:3.13-slim

WORKDIR /app

COPY detector/requirements.txt .

RUN pip install -r requirements.txt

COPY detector/ .

CMD ["python3", "main.py"]