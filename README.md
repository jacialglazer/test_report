Performance Testing Reports Overview
This repository archives the results from various load and performance tests conducted on key services, including Redis, MongoDB, and the Scraper service.
The files are structured to provide both quick, high-level summaries and detailed, technical reports.

Report Summary:

Redis Service
Summary Report (Web Viewable): redis-summary.html
Detailed Report (Graph Dependent): redis-per-service-report.html

MongoDB Service
Summary Report (Web Viewable): MongoDB-summary.html
Detailed Report (Graph Dependent): MongoDB-per-service-report.html


Scraper Service
Summary Report (Web Viewable): scraper-summary.html
Detailed Report (Graph Dependent): scraper-service-report.html

DB General Load Test
Report: DB_load_test_results (Raw results in directory)


Viewing Detailed Performance Graphs
The detailed reports (e.g., *-per-service-report.html) contain interactive visualizations for metrics like pod scaling and CPU utilization.
⚠️ ACTION REQUIRED TO VIEW GRAPHS:
These reports rely on associated event data files to dynamically render the charts. They cannot be fully rendered when viewed directly on platforms like GitHub (due to browser security restrictions on accessing local files).
To view the graphs correctly:
Download the entire repository folder (or clone the repository).
Open the desired detailed report file (e.g., redis-per-service-report.html) directly from your local file system in a web browser.
