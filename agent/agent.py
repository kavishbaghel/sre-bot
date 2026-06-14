import json
from tools import get_recent_metrics, get_failure_summary, read_runbook
import ollama

class SREAgent():
    def __init__(self, ollama_host, model):
        self.llm_backend = ollama_host
        self.llm_model = model

    def build_prompt(self, anomaly_data):
        self.anomaly_data = anomaly_data if isinstance(anomaly_data, dict) else json.loads(anomaly_data)
        self.metrics_data = get_recent_metrics()
        self.failure_data = get_failure_summary()
        self.runbook = read_runbook("high_failure_rate")
        return f"""
                You are a SRE assistant highly skilled in analysing infrastructure and applications errors. 
                Analyse the data below and respond with a root cause, confidence level, and recommended actions.

                Anomaly data:

                {self.anomaly_data}

                Metrics: 

                {json.dumps(self.metrics_data, default=str)}

                Failures:

                {json.dumps(self.failure_data, default=str)}

                Action Runbook:

                {self.runbook}

                Return a clean output and keep in cosideration that the output will be reviewed and tested.
                """
    
    def analyze(self, anomaly_data):
        self.prompt = self.build_prompt(anomaly_data)
        ollama_client = ollama.Client(host=self.llm_backend)
        response = ollama_client.generate(
            model=self.llm_model,
            prompt=self.prompt
        )
        return response['response']

