import os, logging
from consumer import MetricsConsumer

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
    KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "metrics")
    CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "localhost")

    # Create metrics consumer object
    metrics_consumer = MetricsConsumer(KAFKA_BROKER, KAFKA_TOPIC, CLICKHOUSE_HOST)

    # Invoke setup_table to ensure table exists in database

    try:
        metrics_consumer.setup_table()
    except Exception as e:
        logging.error("Some error occured while table creation - %s", e)

    # Start consuming messages
    logging.info("Starting metrics consumer...")

    try:
        metrics_consumer.consume()
    except Exception as e:
        logging.error("Error occurred while running consumer - %s", e)

