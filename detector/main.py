
import os
import logging
import time
from analyzer import Analyzer

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "localhost")

    analyzer = Analyzer(CLICKHOUSE_HOST)
    
    while True:
        try:
            result = analyzer.analyze()
            logging.info("Analysis result: %s", result)
            if result["anomaly"] == True:
                logging.warning("ANOMALY DETECTED: failure rate is %s", result["failure_rate"])
            time.sleep(30)
        except Exception as e:
            logging.error("Error while analyzing data - %s", e)
