# Earthquake Crawler

- Crawl the last 100 earthquakes every 30 minutes, and save them to the database.

- if :
  - Specific earthquake information already exists in the database, then omit it.
- else :
  - It will be saved to the database, then sent notification to the slack channel.
