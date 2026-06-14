import os
import sys
from agent import SREAgent
import logging
import time

logging.basicConfig(level=logging.INFO)

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'detector'))
from analyzer import Analyzer

LLM_BACKEND = os.getenv("LLM_BACKEND", "http://localhost:11434")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.2:3b")
CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "localhost")

if __name__ == "__main__":
    sre_agent = SREAgent(LLM_BACKEND, LLM_MODEL)
    analyzer = Analyzer(CLICKHOUSE_HOST)
    while True:
        try:
            result = analyzer.analyze()
            if result["anomaly"] == True:
                response = sre_agent.analyze(result)
                logging.info("Response - %s", response)
            else:
                logging.info("No anomaly detected")
        except Exception as e:
            logging.error("Error occured while analysis - %s", e)
        time.sleep(30)

