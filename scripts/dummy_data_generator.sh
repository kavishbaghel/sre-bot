#!/bin/bash

# This will call the collector api to scrape metrics to generate dummy data that will be inserted into clickhouse db

for i in {1..5}; 
    do 
    curl -s http://localhost:8080/metrics > /dev/null; 
    sleep 1; 
done