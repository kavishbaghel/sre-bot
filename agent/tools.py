from clickhouse_driver import Client
import os

clickhouse_host = os.getenv("CLICKHOUSE_HOST", "localhost")

clickhouse_client = Client(host=clickhouse_host)

def get_recent_metrics(minutes=5):
    recent_metrics = []
    query = f"""
            SELECT target, success, error, scraped_at 
            FROM metrics 
            WHERE scraped_at >= now() - INTERVAL {minutes} MINUTE
            ORDER BY scraped_at DESC
            LIMIT 20
            """
    results = clickhouse_client.execute(query)
    for result in results:
        recent_metrics.append(
            {
                "target": result[0],
                "success": result[1],
                "error": result[2],
                "scraped_at": str(result[3])
            }
        )
    return recent_metrics

def get_failure_summary(minutes=5):
    error_list = []
    query = f"""
            SELECT error, count(*) as count 
            FROM metrics
            WHERE success = 0
            AND scraped_at >= now() - INTERVAL {minutes} MINUTE
            GROUP BY error
            ORDER BY count DESC
            """
    errors = clickhouse_client.execute(query)
    for error in errors:
        error_list.append({"error": error[0], "count": error[1]})
    return error_list

def read_runbook(name):
    try:
        filepath = f"runbooks/{name}.md"
        with open(filepath, "r") as f:
            content = f.read()
        return content
    except FileNotFoundError:
        return "Runbook not found"
    except Exception as e:
        return f"Error occured - {e}"
