
# BIMM Project

### Getting Started

Simply run docker compose command to start the server
```
docker-compose up
```

The API enpoint to fetch data 
```
http://localhost:4000/api
```

For testing and proof of concept the API is limited to only fetch the first 500 manufactures data.

In order to increase the use the `LIMIT_API_TO` environment variable can changed in the `docker-compose.yml` file

You can view the `results.json` for the complete JSON response from the API without any limits.
