import json
import logging
from kafka import KafkaConsumer
from clickhouse_driver import Client
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO)

class MetricsConsumer:
    def __init__(self, kafka_broker, kafka_topic, clickhouse_host):
        self.bootstrap_servers = kafka_broker
        self.topic = kafka_topic
        self.consumer = KafkaConsumer(self.topic, 
                                      bootstrap_servers=[kafka_broker], 
                                      value_deserializer=lambda m: json.loads(m.decode('utf-8')), 
                                      auto_offset_reset='earliest',
                                      group_id='sre-bot-aggregator')
        self.clickhouse_client = Client(host=clickhouse_host)

    def setup_table(self):
        query = """
                CREATE TABLE IF NOT EXISTS metrics (
                target String,
                body String,
                success UInt8,
                error String,
                scraped_at DateTime
                ) ENGINE = MergeTree()
                ORDER BY scraped_at
            """
        self.clickhouse_client.execute(query)

    def consume(self):
        self.consumer.subscribe([self.topic])
        try:
            for message in self.consumer:
                self.result = message.value
                scraped_at = datetime.fromisoformat(
                    self.result['ScrapedAt'].replace('Z', '+00:00')
                )

                self.clickhouse_client.execute('INSERT INTO metrics VALUES', [(
                    self.result['Target'],
                    self.result['Body'],
                    self.result['Success'],
                    self.result['Error'],
                    scraped_at)])
        except Exception as e:
            logging.error("Failed to insert message into db - %s", e)