FROM python:3.13-slim

WORKDIR /app

COPY agent/requirements.txt .

RUN pip install -r requirements.txt

COPY agent/ .

CMD ["python3", "main.py"]