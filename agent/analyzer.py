from clickhouse_driver import Client
import logging

logging.basicConfig(level=logging.INFO)

class Analyzer():
    def __init__(self, clickhouse_host):
        self.clickhouse_client = Client(host=clickhouse_host)

    def get_recent_failures(self, minutes=5):
        logging.info("Fetching recent failures in interval of %s minutes", minutes)
        failure_count_query = f"""
                SELECT count(*) FROM metrics 
                WHERE success = 0 
                AND scraped_at >= now() - INTERVAL {minutes} MINUTE
            """
        self.failure_count = self.clickhouse_client.execute(failure_count_query)
        return self.failure_count[0][0]
    
    def get_total_recent(self, minutes=5):
        logging.info("Fetching recent data entries in interval of %s minutes", minutes)
        total_count_query = f"""
                SELECT count(*) FROM metrics
                WHERE scraped_at >= now() - INTERVAL {minutes} MINUTE
                """
        self.total_count = self.clickhouse_client.execute(total_count_query)
        return self.total_count[0][0]
    
    def analyze(self):
        analysis_data = {}
        total_count = self.get_total_recent()
        failure_count = self.get_recent_failures()
        failure_rate = 0
        if total_count > 0:
            failure_rate = failure_count/total_count
        analysis_data["total"] = total_count
        analysis_data["failures"] = failure_count
        analysis_data["failure_rate"] = failure_rate
        if failure_rate > 0.5:
            analysis_data["anomaly"] = True
        else:
            analysis_data["anomaly"] = False
        return analysis_data
    

